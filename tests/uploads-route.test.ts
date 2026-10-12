import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { POST } from "@/app/api/uploads/route"
import { GET } from "@/app/api/uploads/[name]/route"
import { toArrayBuffer } from "@/lib/uploads"

const ORIGIN = "https://site.example"
const PNG = Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10, 42, 43, 44])
const NOME = "foto-loja.png"

function pngFile(name = NOME) {
  return new File([PNG], name, { type: "image/png" })
}

function uploadRequest() {
  const form = new FormData()
  form.append("file", pngFile())
  return new Request(`${ORIGIN}/api/uploads`, {
    method: "POST",
    headers: { origin: ORIGIN },
    body: form,
  })
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } })
}

function bytesResponse(bytes: Uint8Array, status = 200) {
  return new Response(toArrayBuffer(bytes), { status, headers: { "Content-Type": "image/png" } })
}

describe("POST /api/uploads", () => {
  const original = { ...process.env }
  beforeEach(() => {
    delete process.env.ADMIN_KEY
    delete process.env.GITHUB_REPO
    delete process.env.GITHUB_TOKEN
  })
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    process.env = { ...original }
  })

  it("grava a foto no repositório quando o GitHub está configurado e devolve a URL", async () => {
    process.env.VERCEL_GIT_REPO_OWNER = "alex"
    process.env.VERCEL_GIT_REPO_SLUG = "cliente"
    process.env.GITHUB_TOKEN = "t"
    const calls: Array<{ url: string; init?: RequestInit }> = []
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, init?: RequestInit) => {
        calls.push({ url: String(url), init })
        return init?.method === "PUT" ? json({ commit: "ok" }) : json({ message: "Not Found" }, 404)
      }),
    )

    const response = await POST(uploadRequest())
    const body = (await response.json()) as { url?: string }

    expect(response.status).toBe(200)
    expect(body.url).toMatch(/^\/api\/uploads\/[a-z0-9-]+\.png$/)

    const put = calls.find((call) => call.init?.method === "PUT")
    expect(put?.url).toBe(`https://api.github.com/repos/alex/cliente/contents/content/uploads/${body.url!.split("/").pop()}`)
    const decoded = Buffer.from(JSON.parse(String(put!.init!.body)).content, "base64")
    expect(new Uint8Array(decoded)).toEqual(PNG)
  })

  it("explica como resolver quando o token não tem permissão (501)", async () => {
    process.env.GITHUB_REPO = "dono/repo"
    process.env.GITHUB_TOKEN = "token-invalido"
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url: string, init?: RequestInit) =>
        init?.method === "PUT" ? new Response("Bad credentials", { status: 401 }) : json({ message: "no" }, 404),
      ),
    )

    const response = await POST(uploadRequest())
    expect(response.status).toBe(501)
    expect(((await response.json()) as { message: string }).message).toContain("Contents: Read and write")
  })

  it("recusa origem externa com 403 (CSRF)", async () => {
    const fetchSpy = vi.fn()
    vi.stubGlobal("fetch", fetchSpy)
    const form = new FormData()
    form.append("file", pngFile())
    const response = await POST(
      new Request(`${ORIGIN}/api/uploads`, { method: "POST", headers: { origin: "https://invasor.example" }, body: form }),
    )
    expect(response.status).toBe(403)
    expect(fetchSpy).not.toHaveBeenCalled()
  })
})

describe("GET /api/uploads/[name]", () => {
  const original = { ...process.env }
  beforeEach(() => {
    delete process.env.GITHUB_REPO
    delete process.env.GITHUB_TOKEN
  })
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    process.env = { ...original }
  })

  function context(name: string) {
    return { params: Promise.resolve({ name }) }
  }

  it("serve a foto vinda do GitHub com cache longo", async () => {
    process.env.GITHUB_REPO = "dono/repo"
    process.env.GITHUB_TOKEN = "t"
    vi.stubGlobal("fetch", vi.fn(async () => bytesResponse(PNG)))

    const response = await GET(new Request(`${ORIGIN}/api/uploads/${NOME}`), context(NOME))
    expect(response.status).toBe(200)
    expect(response.headers.get("content-type")).toBe("image/png")
    expect(response.headers.get("cache-control")).toContain("immutable")
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(PNG)
  })

  it("devolve 404 quando não existe no GitHub nem no disco", async () => {
    process.env.GITHUB_REPO = "dono/repo"
    process.env.GITHUB_TOKEN = "t"
    vi.stubGlobal("fetch", vi.fn(async () => new Response("", { status: 404 })))

    const response = await GET(new Request(`${ORIGIN}/api/uploads/nao-existe-123.png`), context("nao-existe-123.png"))
    expect(response.status).toBe(404)
  })

  it("recusa nome de arquivo inseguro", async () => {
    const response = await GET(new Request(`${ORIGIN}/api/uploads/x`), context("../segredo.png"))
    expect(response.status).toBe(404)
  })
})
