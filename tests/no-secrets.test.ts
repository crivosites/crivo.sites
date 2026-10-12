import { execFileSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { encontrarSegredos, mascarar } from "@/lib/secret-scan"

// Montado em partes para o teste não conter o segredo literal que ele procura.
const FAKE_FINO = "github" + "_pat_" + "A".repeat(30)
const FAKE_CLASSICO = "gh" + "p_" + "B".repeat(36)
const FAKE_AWS = "AK" + "IA" + "C".repeat(16)

/** Arquivos versionados (o que o Git rastreia). Ignorados (.env.local, zips) ficam de fora. */
function arquivosVersionados(): string[] {
  try {
    const saida = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 })
    return saida.split("\0").filter(Boolean)
  } catch {
    return []
  }
}

describe("encontrarSegredos", () => {
  it("acha um token fine-grained do GitHub", () => {
    const achados = encontrarSegredos(`GITHUB_TOKEN=${FAKE_FINO}`)
    expect(achados.map((a) => a.name)).toContain("token fine-grained do GitHub")
  })

  it("acha token clássico e chave da AWS", () => {
    expect(encontrarSegredos(`a=${FAKE_CLASSICO}`).length).toBeGreaterThan(0)
    expect(encontrarSegredos(`b=${FAKE_AWS}`).length).toBeGreaterThan(0)
  })

  it("nunca devolve o segredo inteiro na prévia", () => {
    const [achado] = encontrarSegredos(FAKE_FINO)
    expect(achado).toBeDefined()
    expect(achado.preview).not.toContain(FAKE_FINO)
    expect(achado.preview.length).toBeLessThan(FAKE_FINO.length)
  })

  it("não confunde texto comum com segredo", () => {
    expect(encontrarSegredos("GITHUB_TOKEN=  # cole o token do servidor aqui")).toEqual([])
    expect(encontrarSegredos("const token = process.env.GITHUB_TOKEN")).toEqual([])
  })

  it("mascarar mostra só o início", () => {
    expect(mascarar("abcdefghijklmno")).toBe("abcdefg… (15 caracteres)")
  })
})

describe("repositório versionado", () => {
  const arquivos = arquivosVersionados()

  it("tem arquivos rastreados para varrer", () => {
    expect(arquivos.length).toBeGreaterThan(10)
  })

  it("não contém nenhum segredo colado por engano", () => {
    const suspeitos: string[] = []
    for (const caminho of arquivos) {
      let conteudo: string
      try {
        conteudo = readFileSync(caminho, "utf8")
      } catch {
        continue
      }
      if (conteudo.includes("\0")) continue // binário
      for (const achado of encontrarSegredos(conteudo)) {
        suspeitos.push(`${caminho}: ${achado.name} (${achado.preview})`)
      }
    }
    expect(suspeitos).toEqual([])
  })
})
