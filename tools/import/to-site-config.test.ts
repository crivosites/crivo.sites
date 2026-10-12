import { describe, expect, it } from "vitest"
import {
  briefToSiteConfig,
  toPhoneE164,
  formatPhoneBR,
  toWhatsAppUrl,
  toInstagramUrl,
  normalizeIcon,
  BUSINESS_TYPES,
} from "@/tools/import/to-site-config"
import { emptySiteConfig } from "@/lib/site-config"
import { iconNames } from "@/lib/icons"
import schema from "@/tools/site-config.schema.json"

describe("normalizadores do brief", () => {
  it("converte telefone para E.164 brasileiro", () => {
    expect(toPhoneE164("(71) 99999-0000")).toBe("+5571999990000")
    expect(toPhoneE164("5571999990000")).toBe("+5571999990000")
    expect(toPhoneE164("71 3333-4444")).toBe("+557133334444")
    expect(toPhoneE164("123")).toBe("")
    expect(toPhoneE164(undefined)).toBe("")
  })

  it("formata telefone para exibição", () => {
    expect(formatPhoneBR("71999990000")).toBe("(71) 99999-0000")
    expect(formatPhoneBR("7133334444")).toBe("(71) 3333-4444")
  })

  it("monta link do WhatsApp com texto", () => {
    const url = toWhatsAppUrl("71999990000", "Olá!")
    expect(url).toBe(`https://wa.me/5571999990000?text=${encodeURIComponent("Olá!")}`)
    expect(toWhatsAppUrl("123")).toBe("")
  })

  it("monta URL do Instagram a partir de handle ou URL", () => {
    expect(toInstagramUrl("@horto.semear")).toBe("https://www.instagram.com/horto.semear")
    expect(toInstagramUrl("horto.semear")).toBe("https://www.instagram.com/horto.semear")
    expect(toInstagramUrl("https://instagram.com/x")).toBe("https://instagram.com/x")
    expect(toInstagramUrl("")).toBe("")
  })

  it("cai no ícone padrão quando o nome não existe", () => {
    expect(normalizeIcon("sprout")).toBe("sprout")
    expect(normalizeIcon("icone-que-nao-existe")).toBe("sparkles")
    expect(normalizeIcon(undefined)).toBe("sparkles")
  })
})

describe("briefToSiteConfig", () => {
  it("nunca lança e sempre devolve o esqueleto completo", () => {
    for (const input of [{}, { name: "" }, { name: "X" }]) {
      const result = briefToSiteConfig(input as never)
      expect(Object.keys(result).sort()).toEqual(Object.keys(emptySiteConfig).sort())
    }
  })

  it("preenche marca, contato e endereço a partir do brief", () => {
    const config = briefToSiteConfig({
      name: "Horto Espaço Semear",
      niche: "Floricultura",
      phone: "(71) 99999-0000",
      instagram: "@hortosemear",
      street: "Rua das Flores, 100",
      district: "Centro",
      city: "Camaçari",
      region: "BA",
      postalCode: "42800-000",
      primaryColor: "#3f9f5b",
    })
    expect(config.brand.name).toBe("Horto Espaço Semear")
    expect(config.brand.phoneLabel).toBe("(71) 99999-0000")
    expect(config.brand.phoneUrl).toBe("tel:+5571999990000")
    expect(config.brand.whatsappUrl).toBe("https://wa.me/5571999990000")
    expect(config.brand.instagramUrl).toBe("https://www.instagram.com/hortosemear")
    expect(config.meta.business.sameAs).toContain("https://www.instagram.com/hortosemear")
    expect(config.meta.business.address.city).toBe("Camaçari")
    expect(config.contact.addressLines).toEqual([
      "Rua das Flores, 100",
      "Centro",
      "Camaçari - BA",
      "42800-000",
    ])
    expect(config.meta.title).toContain("Horto Espaço Semear")
    expect(config.colors.primary).toBe("#3f9f5b")
  })

  it("normaliza ícones dos serviços/valores e preserva dados reais", () => {
    const config = briefToSiteConfig({
      name: "Loja X",
      services: [
        { icon: "sprout", title: "Plantas", description: "Mudas." },
        { icon: "invalido", title: "Vasos", description: "Decoração." },
        { icon: "leaf", title: "  ", description: "ignorado" },
      ],
      values: [{ icon: "shield", title: "Confiança", description: "Sempre." }],
      faqs: [{ question: "Abre sábado?", answer: "Sim." }],
    })
    expect(config.services.items).toHaveLength(2)
    expect(config.services.items[0]).toMatchObject({ icon: "sprout", title: "Plantas" })
    expect(config.services.items[1].icon).toBe("sparkles")
    expect(config.about.values[0].icon).toBe("shield")
    expect(config.faq.items[0].question).toBe("Abre sábado?")
  })

  it("usa tipo schema.org válido e cai em LocalBusiness quando inválido", () => {
    expect(briefToSiteConfig({ name: "X", businessType: "Store" }).meta.business.type).toBe("Store")
    expect(briefToSiteConfig({ name: "X", businessType: "NaoExiste" }).meta.business.type).toBe("LocalBusiness")
  })
})

describe("schema (contrato)", () => {
  it("o enum de ícones do schema é idêntico ao de lib/icons.ts", () => {
    const schemaIcons = [...schema.$defs.iconName.enum].sort()
    expect(schemaIcons).toEqual([...iconNames].sort())
  })

  it("o enum de businessType do schema é idêntico ao do código", () => {
    expect([...schema.$defs.businessType.enum].sort()).toEqual([...BUSINESS_TYPES].sort())
  })

  it("exige os campos essenciais de SEO e marca", () => {
    expect(schema.required).toEqual(expect.arrayContaining(["meta", "brand"]))
    expect(schema.properties.meta.required).toEqual(expect.arrayContaining(["title", "description"]))
    expect(schema.properties.brand.required).toEqual(expect.arrayContaining(["name"]))
  })
})
