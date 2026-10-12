import { describe, expect, it } from "vitest"
import { contrastRatio, ensureAccessibleColors, hexContrast, parseHex, relativeLuminance, toHex } from "@/lib/colors"

describe("parseHex / toHex", () => {
  it("aceita #rrggbb, #rgb e sem cerquilha", () => {
    expect(parseHex("#3f9f5b")).toEqual({ r: 0x3f, g: 0x9f, b: 0x5b })
    expect(parseHex("#fff")).toEqual({ r: 255, g: 255, b: 255 })
    expect(parseHex("000000")).toEqual({ r: 0, g: 0, b: 0 })
  })

  it("devolve null para valores inválidos", () => {
    expect(parseHex("roxo")).toBeNull()
    expect(parseHex("#12345")).toBeNull()
  })

  it("faz round-trip", () => {
    expect(toHex(parseHex("#3f9f5b")!)).toBe("#3f9f5b")
  })
})

describe("contraste", () => {
  it("branco x preto é 21:1", () => {
    expect(contrastRatio({ r: 255, g: 255, b: 255 }, { r: 0, g: 0, b: 0 })).toBeCloseTo(21, 1)
  })

  it("luminância do branco é 1 e do preto é 0", () => {
    expect(relativeLuminance({ r: 255, g: 255, b: 255 })).toBeCloseTo(1, 5)
    expect(relativeLuminance({ r: 0, g: 0, b: 0 })).toBeCloseTo(0, 5)
  })
})

describe("ensureAccessibleColors", () => {
  it("escurece a marca sobre fundo claro e usa texto branco", () => {
    const r = ensureAccessibleColors("#3f9f5b", "#fbfdf9", { preferredForeground: "#ffffff" })
    expect(r.ratio).toBeGreaterThanOrEqual(4.5)
    expect(r.foregroundRatio).toBeGreaterThanOrEqual(4.5)
    expect(r.primaryForeground).toBe("#ffffff")
  })

  it("clareia/usa a marca original sobre fundo escuro e usa texto escuro", () => {
    const r = ensureAccessibleColors("#3f9f5b", "#0e131f", { preferredForeground: "#ffffff" })
    expect(r.ratio).toBeGreaterThanOrEqual(4.5)
    expect(r.foregroundRatio).toBeGreaterThanOrEqual(4.5)
    // branco não passa sobre um verde claro, então recai para texto escuro
    expect(r.primaryForeground).toBe("#000000")
  })

  it("funciona para qualquer cor de marca escolhida no painel", () => {
    for (const brand of ["#3f9f5b", "#ff0000", "#0000ff", "#ffcc00", "#7c3aed", "#0ea5e9"]) {
      const light = ensureAccessibleColors(brand, "#ffffff")
      const dark = ensureAccessibleColors(brand, "#0e131f")
      expect(hexContrast(light.primary, "#ffffff")).toBeGreaterThanOrEqual(4.5)
      expect(hexContrast(dark.primary, "#0e131f")).toBeGreaterThanOrEqual(4.5)
      expect(hexContrast(light.primaryForeground, light.primary)).toBeGreaterThanOrEqual(4.5)
      expect(hexContrast(dark.primaryForeground, dark.primary)).toBeGreaterThanOrEqual(4.5)
    }
  })
})
