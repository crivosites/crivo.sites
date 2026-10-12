import { describe, expect, it } from "vitest"
import { emptySiteConfig, mergeSiteConfig, siteConfig, siteThemeCss, siteUrl } from "@/lib/site-config"
import { hexContrast } from "@/lib/colors"

describe("mergeSiteConfig", () => {
  it("preenche um conteúdo vazio com o esqueleto completo", () => {
    const result = mergeSiteConfig({})
    expect(Object.keys(result).sort()).toEqual(Object.keys(emptySiteConfig).sort())
    expect(result.brand.whatsappUrl).toBe(emptySiteConfig.brand.whatsappUrl)
    expect(result.navbar.links).toEqual(emptySiteConfig.navbar.links)
  })

  it("não lança para entradas inválidas", () => {
    for (const input of [null, undefined, "texto", 42, [], true]) {
      expect(() => mergeSiteConfig(input)).not.toThrow()
    }
  })

  it("respeita os valores informados e completa o resto", () => {
    const result = mergeSiteConfig({ brand: { name: "Cliente Novo" }, hero: { title: "Novo título" } })
    expect(result.brand.name).toBe("Cliente Novo")
    expect(result.brand.whatsappUrl).toBe(emptySiteConfig.brand.whatsappUrl)
    expect(result.hero.title).toBe("Novo título")
  })

  it("aceita listas explícitas, inclusive vazias", () => {
    expect(mergeSiteConfig({ services: { items: [] } }).services.items).toEqual([])
    expect(mergeSiteConfig({ services: { items: [{ icon: "leaf", title: "T", description: "D" }] } }).services.items).toHaveLength(1)
  })

  it("mescla campos aninhados profundos (endereço)", () => {
    const result = mergeSiteConfig({ meta: { business: { address: { city: "Salvador" } } } })
    expect(result.meta.business.address.city).toBe("Salvador")
    expect(result.meta.business.address.country).toBe("BR")
  })

  it("carrega o conteúdo real do arquivo site-config.json", () => {
    expect(siteConfig.brand.name.length).toBeGreaterThan(0)
    expect(Array.isArray(siteConfig.services.items)).toBe(true)
  })
})

describe("siteUrl", () => {
  it("normaliza para uma URL absoluta", () => {
    expect(siteUrl(mergeSiteConfig({ meta: { siteUrl: "buscavidagarden.com.br" } }))).toBe("https://buscavidagarden.com.br")
  })
})

describe("siteThemeCss", () => {
  const css = siteThemeCss(siteConfig)

  it("emite as variáveis do tema claro e do escuro", () => {
    expect(css).toContain("html:not(.dark){")
    expect(css).toContain("html.dark{")
    expect(css).toContain("--primary:")
    expect(css).toContain("--primary-foreground:")
  })

  it("garante contraste AA em ambos os temas, para qualquer marca", () => {
    const extract = (block: string, token: string) => {
      const re = new RegExp(`${token}:([^;}]+)`)
      return block.match(re)?.[1] ?? ""
    }
    for (const primary of ["#3f9f5b", "#ff0000", "#7c3aed", "#0ea5e9"]) {
      const config = mergeSiteConfig({ colors: { ...siteConfig.colors, primary } })
      const output = siteThemeCss(config)
      const lightBlock = output.match(/html:not\(\.dark\)\{([^}]*)\}/)?.[1] ?? ""
      const darkBlock = output.match(/html\.dark\{([^}]*)\}/)?.[1] ?? ""
      const lightPrimary = extract(lightBlock, "--primary")
      const lightFg = extract(lightBlock, "--primary-foreground")
      const darkPrimary = extract(darkBlock, "--primary")
      const darkFg = extract(darkBlock, "--primary-foreground")
      const lightBg = extract(lightBlock, "--background")
      expect(hexContrast(lightPrimary, lightBg)).toBeGreaterThanOrEqual(4.5)
      expect(hexContrast(lightFg, lightPrimary)).toBeGreaterThanOrEqual(4.5)
      expect(hexContrast(darkPrimary, "#0e131f")).toBeGreaterThanOrEqual(4.5)
      expect(hexContrast(darkFg, darkPrimary)).toBeGreaterThanOrEqual(4.5)
    }
  })
})

describe("mergeSiteConfig — depoimentos", () => {
  it("aceita os itens na forma canônica", () => {
    const result = mergeSiteConfig({
      testimonials: { items: [{ quote: "Ótimo atendimento", name: "Ana", role: "Cliente" }] },
    })
    expect(result.testimonials.items).toEqual([{ quote: "Ótimo atendimento", name: "Ana", role: "Cliente" }])
  })

  it("aceita a lista direto em testimonials (sem o campo items)", () => {
    const result = mergeSiteConfig({
      testimonials: [{ quote: "Muito bom", name: "João", role: "Cliente" }],
    })
    expect(result.testimonials.items).toHaveLength(1)
    expect(result.testimonials.items[0].quote).toBe("Muito bom")
    // Não devem sobrar chaves numéricas soltas no objeto da seção.
    expect(Object.keys(result.testimonials).sort()).toEqual(["description", "eyebrow", "items", "title"])
  })

  it("mapeia nomes de campo alternativos (text/author/cargo)", () => {
    const result = mergeSiteConfig({
      testimonials: {
        items: [{ text: "Resolveu meu problema", author: "Maria", cargo: "Advogada" }],
      },
    })
    expect(result.testimonials.items[0]).toEqual({ quote: "Resolveu meu problema", name: "Maria", role: "Advogada" })
  })

  it("aceita depoimentos como texto puro", () => {
    const result = mergeSiteConfig({ testimonials: { items: ["Simples e direto"] } })
    expect(result.testimonials.items[0]).toEqual({ quote: "Simples e direto", name: "", role: "" })
  })

  it("descarta itens vazios", () => {
    const result = mergeSiteConfig({
      testimonials: { items: [{ quote: "", name: "" }, { quote: "Só o depoimento" }] },
    })
    expect(result.testimonials.items).toHaveLength(1)
    expect(result.testimonials.items[0].quote).toBe("Só o depoimento")
  })

  it("mantém o esqueleto quando não há depoimentos", () => {
    expect(mergeSiteConfig({}).testimonials.items).toEqual(emptySiteConfig.testimonials.items)
  })
})
