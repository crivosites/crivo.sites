import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { clearConfigCache } from "@/lib/config-store"
import { GET, PUT } from "@/app/api/site-config/route"

const ENDPOINT = "https://site.example/api/site-config"
const ORIGIN = "https://site.example"

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } })
}

function text(body: string, status = 200) {
  return new Response(body, { status })
}

function request(init: RequestInit = {}) {
  return new Request(ENDPOINT, init)
}

describe("API /api/site-config (pela ótica do painel)", () => {
  const original = { ...process.env }

  beforeEach(() => {
    clearConfigCache()
    delete process.env.ADMIN_KEY
    delete process.env.GITHUB_REPO
    delete process.env.GITHUB_TOKEN
  })
  afterEach(() => {
    clearConfigCache()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    process.env = { ...original }
  })

  it("GET devolve o conteúdo do GitHub quando configurado", async () => {
    process.env.GITHUB_REPO = "dono/repo"
    process.env.GITHUB_TOKEN = "t"
    vi.stubGlobal("fetch", vi.fn(async () => text(JSON.stringify({ brand: { name: "Do GitHub" } }))))

    const response = await GET(request())
    expect(response.status).toBe(200)
    expect((await response.json()).brand.name).toBe("Do GitHub")
  })

  it("GET exige a senha quando ADMIN_KEY está definida (401)", async () => {
    process.env.ADMIN_KEY = "segredo"
    const response = await GET(request())
    expect(response.status).toBe(401)
  })

  it("GET libera o painel com a senha correta", async () => {
    process.env.ADMIN_KEY = "segredo"
    const denied = await GET(request({ headers: { "x-admin-key": "errada" } }))
    expect(denied.status).toBe(401)

    const allowed = await GET(request({ headers: { "x-admin-key": "segredo" } }))
    expect(allowed.status).toBe(200)
    expect((await allowed.json()).brand.name).toBeTruthy()
  })

  it("GET abre sem senha quando ADMIN_KEY não está definida", async () => {
    const response = await GET(request())
    expect(response.status).toBe(200)
  })

  it("PUT grava no GitHub e responde 200 com o conteúdo salvo", async () => {
    process.env.GITHUB_REPO = "dono/repo"
    process.env.GITHUB_TOKEN = "t"
    const calls: Array<{ url: string; init?: RequestInit }> = []
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, init?: RequestInit) => {
        calls.push({ url: String(url), init })
        return init?.method === "PUT" ? json({ commit: "ok" }) : json({ sha: "abc" })
      }),
    )

    const response = await PUT(
      request({
        method: "PUT",
        headers: { origin: ORIGIN, "content-type": "application/json" },
        body: JSON.stringify({ brand: { name: "Salvo no GitHub" } }),
      }),
    )

    expect(response.status).toBe(200)
    expect((await response.json()).brand.name).toBe("Salvo no GitHub")
    expect(calls.some((call) => call.init?.method === "PUT")).toBe(true)
    const put = calls.find((call) => call.init?.method === "PUT")!
    const decoded = Buffer.from(JSON.parse(String(put.init!.body)).content, "base64").toString("utf8")
    expect(decoded).toContain("Salvo no GitHub")
  })

  it("recusa PUT de outra origem com 403 (CSRF)", async () => {
    const fetchSpy = vi.fn()
    vi.stubGlobal("fetch", fetchSpy)

    const response = await PUT(
      request({
        method: "PUT",
        headers: { origin: "https://invasor.example", "content-type": "application/json" },
        body: JSON.stringify({}),
      }),
    )

    expect(response.status).toBe(403)
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it("exige a chave quando ADMIN_KEY está definida (401)", async () => {
    process.env.ADMIN_KEY = "segredo"
    const response = await PUT(
      request({ method: "PUT", headers: { origin: ORIGIN, "content-type": "application/json" }, body: "{}" }),
    )
    expect(response.status).toBe(401)
  })

  it("devolve 400 com JSON inválido", async () => {
    const response = await PUT(
      request({ method: "PUT", headers: { origin: ORIGIN, "content-type": "application/json" }, body: "{quebrado" }),
    )
    expect(response.status).toBe(400)
  })

  it("explica como salvar quando a gravação no GitHub falha", async () => {
    process.env.GITHUB_REPO = "dono/repo"
    process.env.GITHUB_TOKEN = "token-invalido"
    vi.stubGlobal("fetch", vi.fn(async (_url: string, init?: RequestInit) =>
      init?.method === "PUT" ? text("Bad credentials", 401) : json({ sha: "abc" }),
    ))

    const response = await PUT(
      request({
        method: "PUT",
        headers: { origin: ORIGIN, "content-type": "application/json" },
        body: JSON.stringify({ brand: { name: "X" } }),
      }),
    )

    expect(response.status).toBe(501)
    expect((await response.json()).message).toContain("GitHub")
  })
})
