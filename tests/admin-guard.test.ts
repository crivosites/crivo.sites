import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { adminGuard } from "@/lib/admin-guard"

const ENDPOINT = "https://buscavidagarden.com.br/api/site-config"

function request(headers: Record<string, string> = {}) {
  return new Request(ENDPOINT, { method: "PUT", headers })
}

describe("adminGuard", () => {
  const original = process.env.ADMIN_KEY

  beforeEach(() => {
    delete process.env.ADMIN_KEY
  })
  afterEach(() => {
    if (original === undefined) delete process.env.ADMIN_KEY
    else process.env.ADMIN_KEY = original
  })

  it("libera requisição da mesma origem", () => {
    expect(adminGuard(request({ origin: "https://buscavidagarden.com.br" }))).toBeNull()
  })

  it("libera requisição sem cabeçalho Origin (mesmo host)", () => {
    expect(adminGuard(request())).toBeNull()
  })

  it("aceita quando a Origin bate com o cabeçalho Host (mesmo se request.url for localhost)", () => {
    // Next pode montar request.url com host interno (ex.: localhost:3100) mesmo
    // quando o navegador acessa por outro host. A comparação usa o Host real.
    const req = new Request(ENDPOINT, {
      method: "PUT",
      headers: { origin: "https://buscavidagarden.com.br", host: "buscavidagarden.com.br" },
    })
    expect(adminGuard(req)).toBeNull()
  })

  it("aceita via x-forwarded-host (proxy/domínio próprio)", () => {
    const req = new Request(ENDPOINT, {
      method: "PUT",
      headers: { origin: "https://site-do-cliente.com.br", "x-forwarded-host": "site-do-cliente.com.br" },
    })
    expect(adminGuard(req)).toBeNull()
  })

  it("bloqueia quando a Origin não bate com o Host (403)", () => {
    const req = new Request(ENDPOINT, {
      method: "PUT",
      headers: { origin: "https://invasor.example", host: "buscavidagarden.com.br" },
    })
    expect(adminGuard(req)?.status).toBe(403)
  })

  it("bloqueia origem externa com 403 (proteção CSRF)", async () => {
    const blocked = adminGuard(request({ origin: "https://invasor.example" }))
    expect(blocked?.status).toBe(403)
    expect(await blocked!.json()).toMatchObject({ message: "Origem não autorizada." })
  })

  it("bloqueia Origin inválida com 403", () => {
    expect(adminGuard(request({ origin: "não é uma url" }))?.status).toBe(403)
  })

  it("não exige chave quando ADMIN_KEY não está definida", () => {
    expect(adminGuard(request({ origin: "https://buscavidagarden.com.br" }))).toBeNull()
  })

  describe("com ADMIN_KEY definida", () => {
    beforeEach(() => {
      process.env.ADMIN_KEY = "segredo-forte"
    })

    it("exige o cabeçalho x-admin-key (401 sem ele)", async () => {
      const blocked = adminGuard(request({ origin: "https://buscavidagarden.com.br" }))
      expect(blocked?.status).toBe(401)
      expect(await blocked!.json()).toMatchObject({ message: "Chave de acesso inválida." })
    })

    it("recusa chave errada com 401", () => {
      const blocked = adminGuard(request({ origin: "https://buscavidagarden.com.br", "x-admin-key": "errada" }))
      expect(blocked?.status).toBe(401)
    })

    it("aceita a chave correta", () => {
      expect(adminGuard(request({ origin: "https://buscavidagarden.com.br", "x-admin-key": "segredo-forte" }))).toBeNull()
    })

    it("checa a origem antes da chave", () => {
      expect(adminGuard(request({ origin: "https://invasor.example", "x-admin-key": "segredo-forte" }))?.status).toBe(403)
    })
  })
})
