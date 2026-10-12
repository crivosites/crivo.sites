/**
 * Utilidades de cor para garantir contraste WCAG AA nas cores de marca
 * escolhidas no painel.
 *
 * O MESMO token `--primary` é usado de duas formas:
 *   1. como TEXTO sobre o fundo (eyebrows, links, números);
 *   2. como FUNDO de botão, com `--primary-foreground` por cima.
 *
 * Uma cor só não atende aos dois casos em tema claro e escuro ao mesmo tempo
 * (fundo claro exige marca escura; fundo escuro exige marca clara). Por isso
 * derivamos duas variações a partir da cor de marca do cliente, mexendo o
 * mínimo possível no tom original.
 */

export type Rgb = { r: number; g: number; b: number }

const WHITE: Rgb = { r: 255, g: 255, b: 255 }
const BLACK: Rgb = { r: 0, g: 0, b: 0 }

/** Converte "#rgb" ou "#rrggbb" em RGB; devolve null se inválido. */
export function parseHex(hex: string): Rgb | null {
  const value = hex.trim().replace(/^#/, "")
  const full = value.length === 3 ? value.split("").map((c) => c + c).join("") : value
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  }
}

export function toHex({ r, g, b }: Rgb): string {
  const part = (n: number) =>
    Math.round(Math.min(255, Math.max(0, n)))
      .toString(16)
      .padStart(2, "0")
  return `#${part(r)}${part(g)}${part(b)}`
}

/** Luminância relativa (WCAG 2.x). */
export function relativeLuminance({ r, g, b }: Rgb): number {
  const channel = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

/** Razão de contraste entre duas cores (1 a 21). */
export function contrastRatio(a: Rgb, b: Rgb): number {
  const la = relativeLuminance(a)
  const lb = relativeLuminance(b)
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la]
  return (hi + 0.05) / (lo + 0.05)
}

/** Contraste entre duas cores hex, arredondado para 2 casas. */
export function hexContrast(a: string, b: string): number {
  const ca = parseHex(a)
  const cb = parseHex(b)
  if (!ca || !cb) return 0
  return Number(contrastRatio(ca, cb).toFixed(2))
}

function mix(from: Rgb, to: Rgb, amount: number): Rgb {
  return {
    r: from.r + (to.r - from.r) * amount,
    g: from.g + (to.g - from.g) * amount,
    b: from.b + (to.b - from.b) * amount,
  }
}

const AA_NORMAL_TEXT = 4.5
const STEPS = 100

export type AccessibleColors = {
  primary: string
  primaryForeground: string
  /** Contraste entre a primária e o fundo (uso como texto). */
  ratio: number
  /** Contraste entre o texto e a primária (uso como botão). */
  foregroundRatio: number
}

export type AccessibleOptions = {
  /** Cor de texto preferida pelo cliente; só é aceita se já passar no contraste. */
  preferredForeground?: string
  /** Contraste mínimo exigido (padrão: 4,5:1, WCAG AA para texto normal). */
  target?: number
}

/**
 * Deriva uma cor primária e o texto sobre ela que respeitem o contraste mínimo
 * sobre o fundo informado, alterando o mínimo necessário na cor de marca.
 * Fundo claro -> escurece a marca; fundo escuro -> clareia.
 */
export function ensureAccessibleColors(
  brandHex: string,
  backgroundHex: string,
  options: AccessibleOptions = {},
): AccessibleColors {
  const target = options.target ?? AA_NORMAL_TEXT
  const brand = parseHex(brandHex) ?? parseHex("#3f9f5b")!
  const bgHex = parseHex(backgroundHex) ? backgroundHex : "#ffffff"
  const goDarker = relativeLuminance(parseHex(bgHex)!) > 0.5

  const primaryStep = goDarker
    ? (amount: number) => toHex(mix(brand, BLACK, amount))
    : (amount: number) => toHex(mix(brand, WHITE, amount))
  const fallbackStep = goDarker
    ? (amount: number) => toHex(mix(brand, WHITE, amount))
    : (amount: number) => toHex(mix(brand, BLACK, amount))

  const pick = (step: (amount: number) => string) => {
    let candidate = toHex(brand)
    for (let i = 0; i <= STEPS; i++) {
      candidate = step(i / STEPS)
      // Compara com o hex já arredondado: é o valor que irá para o CSS.
      if (hexContrast(candidate, bgHex) >= target) return candidate
    }
    return candidate
  }

  let primary = pick(primaryStep)
  if (hexContrast(primary, bgHex) < target) primary = pick(fallbackStep)

  const primaryRgb = parseHex(primary)!
  const whiteRatio = contrastRatio(WHITE, primaryRgb)
  const blackRatio = contrastRatio(BLACK, primaryRgb)
  const preferred = options.preferredForeground ? parseHex(options.preferredForeground) : null
  const preferredRatio = preferred ? contrastRatio(preferred, primaryRgb) : 0

  const primaryForeground =
    preferred && preferredRatio >= target ? preferred : whiteRatio >= blackRatio ? WHITE : BLACK

  return {
    primary,
    primaryForeground: toHex(primaryForeground),
    ratio: hexContrast(primary, bgHex),
    foregroundRatio: hexContrast(toHex(primaryForeground), primary),
  }
}
