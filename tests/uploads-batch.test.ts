import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { POST } from "@/app/api/uploads/batch/route"

const ORIGIN = "https://site.example"
const PNG = Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10, 7, 7, 7])

function request(files: File[], origin = ORIGIN) {
  const form = new FormData()
  for (const file of files) form.append("files", file)
  return new Request(`${ORIGIN}/api/uploads/batch`, { method: "POST", headers: { origin }, body: form })
}

function pngFiles(count: number) {
  return Array.from({ length: count }, (_, i) => new File([PNG], `foto ${i + 1}.png`, { type: "image/png" }))
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } })
}

describe("POST /api/uploads/batch", () => {
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

  it("grava várias fotos em UM único commit (não um por foto)", async () => {
    process.env.GITHUB_REPO = "dono/repo"
    process.env.GITHUB_TOKEN = "t"

    const calls: Array<{ url: string; method: string; body?: string }> = []
    let blobs = 0
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, init?: RequestInit) => {
        const target = String(url)
        const method = init?.method ?? "GET"
        calls.push({ url: target, method, body: typeof init?.body === "string" ? init.body : undefined })
        if (method === "GET" && target.endsWith("/git/ref/heads/main")) return json({ object: { sha: "head1" } })
        if (method === "GET" && target.endsWith("/git/commits/head1")) return json({ tree: { sha: "base-tree" } })
        if (method === "POST" && target.endsWith("/git/blobs")) return json({ sha: `blob-${(blobs += 1)}` })
        if (method === "POST" && target.endsWith("/git/trees")) return json({ sha: "new-tree" })
        if (method === "POST" && target.endsWith("/git/commits")) return json({ sha: "new-commit" })
        if (method === "PATCH" && target.endsWith("/git/refs/heads/main")) return json({ ref: "refs/heads/main" })
        return json({}, 404)
      }),
    )

    const response = await POST(request(pngFiles(3)))
    const body = (await response.json()) as { urls: string[]; count: number }

    expect(response.status).toBe(200)
    expect(body.count).toBe(3)
    expect(body.urls).toHaveLength(3)
    expect(new Set(body.urls).size).toBe(3)

    const commits = calls.filter((call) => call.method === "POST" && call.url.endsWith("/git/commits"))
    expect(commits).toHaveLength(1)
    expect(calls.filter((call) => call.url.endsWith("/git/blobs"))).toHaveLength(3)
    expect(calls.filter((call) => call.method === "PATCH" && call.url.endsWith("/git/refs/heads/main"))).toHaveLength(1)

    const tree = JSON.parse(calls.find((call) => call.url.endsWith("/git/trees"))!.body!)
    expect(tree.base_tree).toBe("base-tree")
    expect(tree.tree).toHaveLength(3)
    for (const entry of tree.tree) {
      expect(entry.path).toMatch(/^content\/uploads\/.+\.png$/)
      expect(entry.type).toBe("blob")
    }
    const commit = JSON.parse(commits[0]!.body!)
    expect(commit.parents).toEqual(["head1"])
    expect(commit.tree).toBe("new-tree")
  })

  it("explica como resolver quando o token não tem permissão (501)", async () => {
    process.env.GITHUB_REPO = "dono/repo"
    process.env.GITHUB_TOKEN = "token-invalido"
    vi.stubGlobal("fetch", vi.fn(async () => json({ message: "Bad credentials" }, 401)))

    const response = await POST(request(pngFiles(2)))
    expect(response.status).toBe(501)
    expect(((await response.json()) as { message: string }).message).toContain("Contents: Read and write")
  })

  it("recusa origem externa (CSRF) sem chamar o GitHub", async () => {
    const fetchSpy = vi.fn()
    vi.stubGlobal("fetch", fetchSpy)
    const response = await POST(request(pngFiles(1), "https://invasor.example"))
    expect(response.status).toBe(403)
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it("recusa quando não vem nenhuma foto", async () => {
    process.env.GITHUB_REPO = "dono/repo"
    process.env.GITHUB_TOKEN = "t"
    const form = new FormData()
    const response = await POST(
      new Request(`${ORIGIN}/api/uploads/batch`, { method: "POST", headers: { origin: ORIGIN }, body: form }),
    )
    expect(response.status).toBe(400)
  })

  it("recusa mais fotos que o limite do lote", async () => {
    process.env.GITHUB_REPO = "dono/repo"
    process.env.GITHUB_TOKEN = "t"
    const response = await POST(request(pngFiles(31)))
    expect(response.status).toBe(413)
  })
})
