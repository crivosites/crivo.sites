import { describe, expect, it } from "vitest"
import { appendItem, moveItem, removeItem, updateAtPath, type ConfigPath } from "@/lib/config-utils"
import { iconRegistry } from "@/lib/icons"
import { fieldLabels, fieldLabelsByPath, itemTemplates, panelSections } from "@/lib/panel-sections"
import { emptySiteConfig, mergeSiteConfig } from "@/lib/site-config"

type Path = ConfigPath

function setAtPath<T>(root: T, path: Path, value: unknown): T {
  let current: unknown = root
  for (let i = 0; i < path.length - 1; i += 1) {
    current = (current as Record<string | number, unknown>)[path[i]!]
  }
  ;(current as Record<string | number, unknown>)[path[path.length - 1]!] = value
  return root
}

function getAtPath(root: unknown, path: Path): unknown {
  let current: unknown = root
  for (const key of path) current = (current as Record<string | number, unknown>)?.[key as string | number]
  return current
}

/** Percorre toda a árvore e chama `visit` em cada nó (com o caminho). */
function walk(value: unknown, path: Path, visit: (path: Path, value: unknown) => void) {
  visit(path, value)
  if (Array.isArray(value)) {
    value.forEach((item, index) => walk(item, [...path, index], visit))
    return
  }
  if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) walk(child, [...path, key], visit)
  }
}

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string")

/** Esqueleto + um item de cada lista vazia (os modelos do botão "Adicionar"). */
function fullConfig() {
  const config = structuredClone(emptySiteConfig)
  for (const [pathKey, template] of Object.entries(itemTemplates)) {
    const path = pathKey.split(".") as Path
    const list = getAtPath(config, path)
    if (!Array.isArray(list)) continue
    if (isStringArray(list) && typeof template === "string") {
      if (list.length === 0) setAtPath(config, path, [template])
      continue
    }
    if (list.length === 0) setAtPath(config, path, [structuredClone(template)])
  }
  return config
}

describe("auditoria do painel: cobertura das seções", () => {
  it("toda seção do painel existe no conteúdo (mesmo conjunto de chaves)", () => {
    const doPainel = panelSections.map((section) => section.key).sort()
    const doConteudo = Object.keys(emptySiteConfig).sort()
    expect(doPainel).toEqual(doConteudo)
  })

  it("a ordem do painel é a ordem de leitura do site (SEO por último)", () => {
    expect(panelSections.map((section) => section.key).at(-1)).toBe("meta")
  })

  it("toda seção tem rótulo e dica", () => {
    for (const section of panelSections) {
      expect(section.label.length).toBeGreaterThan(0)
      expect(section.hint.length).toBeGreaterThan(0)
    }
  })
})

describe("auditoria do painel: todos os campos", () => {
  const config = fullConfig()
  const leafPaths: Path[] = []
  walk(config, [], (path, value) => {
    const isLeaf = typeof value === "string" || isStringArray(value)
    if (isLeaf && path.length > 0) leafPaths.push(path)
  })

  it("encontra campos suficientes para auditar (não é uma lista vazia)", () => {
    expect(leafPaths.length).toBeGreaterThan(50)
  })

  it("todo campo tem um editor (string, lista de textos ou lista de objetos) — nada fica invisível", () => {
    const invisiveis: string[] = []
    walk(config, [], (path, value) => {
      if (path.length === 0) return
      const ok =
        typeof value === "string" ||
        Array.isArray(value) ||
        (value !== null && typeof value === "object")
      if (!ok) invisiveis.push(`${path.join(".")} = ${JSON.stringify(value)}`)
    })
    expect(invisiveis).toEqual([])
  })

  it("todo campo tem rótulo em português (ou nome amigável)", () => {
    const semRotulo: string[] = []
    for (const path of leafPaths) {
      const last = path[path.length - 1]
      if (typeof last === "number") continue // item de lista de textos: o rótulo é o da lista
      const key = String(last)
      const pathKey = path.filter((part) => typeof part === "string").join(".")
      if (!fieldLabels[key] && !fieldLabelsByPath[pathKey]) semRotulo.push(pathKey)
    }
    expect([...new Set(semRotulo)]).toEqual([])
  })

  it("cada campo sobrevive ao salvar e recarregar (round-trip por campo)", () => {
    const falhas: string[] = []
    for (const path of leafPaths) {
      const current = getAtPath(config, path)
      const next = isStringArray(current)
        ? [`teste-${path.join(".")}-1`, `teste-${path.join(".")}-2`]
        : `teste-${path.join(".")}`
      const edited = updateAtPath(config, path, next)
      const recarregado = mergeSiteConfig(JSON.parse(JSON.stringify(edited)))
      const voltou = getAtPath(recarregado, path)
      if (JSON.stringify(voltou) !== JSON.stringify(next)) {
        falhas.push(`${path.join(".")}: esperava ${JSON.stringify(next)}, voltou ${JSON.stringify(voltou)}`)
      }
    }
    expect(falhas).toEqual([])
  })

  it("todo ícone usado no conteúdo existe no registro de ícones", () => {
    const usados = new Set<string>()
    for (const template of Object.values(itemTemplates)) {
      if (template && typeof template === "object" && typeof (template as Record<string, unknown>).icon === "string") {
        usados.add((template as Record<string, string>).icon)
      }
    }
    walk(config, [], (path, value) => {
      if (path[path.length - 1] === "icon" && typeof value === "string" && value) usados.add(value)
    })
    expect(usados.size).toBeGreaterThan(0)
    expect([...usados].filter((name) => !(name in iconRegistry))).toEqual([])
  })
})

describe("auditoria do painel: operações de lista", () => {
  it("adiciona, move e remove itens em listas aninhadas", () => {
    const base = [{ label: "A", href: "#a" }]
    const dois = appendItem(base, { label: "B", href: "#b" })
    expect(dois.map((item) => item.label)).toEqual(["A", "B"])
    expect(moveItem(dois, 0, 1).map((item) => item.label)).toEqual(["B", "A"])
    expect(removeItem(dois, 0).map((item) => item.label)).toEqual(["B"])
    const copia = appendItem(base, base[0]!)
    copia[1]!.label = "MUDOU"
    expect(base[0]!.label).toBe("A")
  })

  it("atualiza valor no fundo da árvore sem alterar o resto", () => {
    const config = fullConfig()
    const edited = updateAtPath(config, ["faq", "items", 0, "answer"], "resposta nova")
    expect(getAtPath(edited, ["faq", "items", 0, "answer"])).toBe("resposta nova")
    expect(getAtPath(edited, ["faq", "items", 0, "question"])).toBe(getAtPath(config, ["faq", "items", 0, "question"]))
    expect(getAtPath(config, ["faq", "items", 0, "answer"])).not.toBe("resposta nova")
  })
})
