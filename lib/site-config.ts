import rawConfig from "@/content/site-config.json"
import { ensureAccessibleColors } from "@/lib/colors"

/* ------------------------------------------------------------------ *
 * TIPOS — refletem 100% do conteúdo visível do site.
 * O código do template nunca muda por cliente: só o JSON em
 * content/site-config.json é reescrito (à mão ou por IA).
 * ------------------------------------------------------------------ */

export type NavLink = { label: string; href: string }
export type IconItem = { icon: string; title: string; description: string }
export type StatItem = { number: string; label: string }
export type TestimonialItem = { quote: string; name: string; role: string }
export type FaqItem = { question: string; answer: string }
export type SocialItem = { icon: string; label: string; url: string }
export type OpeningHours = { days: string[]; opens: string; closes: string }
export type PostalAddress = {
  street: string
  district: string
  city: string
  region: string
  postalCode: string
  country: string
}

export type MetaConfig = {
  title: string
  description: string
  keywords: string[]
  siteUrl: string
  locale: string
  ogTitle: string
  ogDescription: string
  themeColor: string
  business: {
    type: string
    legalName: string
    priceRange: string
    areaServed: string
    currency: string
    latitude: string
    longitude: string
    address: PostalAddress
    sameAs: string[]
      }
}

export type BrandConfig = {
  logoIcon: string
  name: string
  tagline: string
  copyright: string
  whatsappUrl: string
  instagramUrl: string
  email: string
  phoneLabel: string
  phoneUrl: string
}

export type NavbarConfig = {
  links: NavLink[]
  ctaLabel: string
  ctaUrl: string
  menuTitle: string
  menuDescription: string
  menuToggleLabel: string
  themeToggleLabel: string
}

export type HeroConfig = {
  eyebrow: string
  title: string
  highlight: string
  description: string
  primaryLabel: string
  primaryUrl: string
  secondaryLabel: string
  secondaryUrl: string
  tags: string[]
}

export type ServicesConfig = { eyebrow: string; title: string; description: string; items: IconItem[] }
export type PortfolioItem = { image: string; title: string; category: string; description: string }
export type PortfolioConfig = { eyebrow: string; title: string; description: string; items: PortfolioItem[] }
export type AboutConfig = {
  eyebrow: string
  titleBefore: string
  titleHighlight: string
  titleAfter: string
  description: string
  values: IconItem[]
  stats: StatItem[]
}
export type ProcessConfig = {
  eyebrow: string
  titleBefore: string
  titleHighlight: string
  titleMiddle: string
  titleAfter: string
  description: string
  steps: IconItem[]
}
export type TestimonialsConfig = { eyebrow: string; title: string; description: string; items: TestimonialItem[] }
export type FaqConfig = { eyebrow: string; title: string; description: string; items: FaqItem[] }
export type ContactConfig = {
  eyebrow: string
  titleBefore: string
  titleHighlight: string
  titleAfter: string
  description: string
  ctaLabel: string
  ctaUrl: string
  ctaNote: string
  visitEyebrow: string
  visitTitle: string
  addressLabel: string
  addressLines: string[]
  mapLabel: string
  mapUrl: string
  mapEmbedUrl: string
  phoneLabel: string
  phone: string
  phoneUrl: string
  hoursLabel: string
  hoursLines: string[]
  hoursStructured: OpeningHours[]
}
export type FooterConfig = { navigationTitle: string; socialTitle: string; socials: SocialItem[]; note: string }
export type ColorsConfig = {
  primary: string
  primaryForeground: string
  background: string
  foreground: string
  mutedForeground: string
}

export type SiteConfig = {
  meta: MetaConfig
  brand: BrandConfig
  navbar: NavbarConfig
  hero: HeroConfig
  services: ServicesConfig
  portfolio: PortfolioConfig
  about: AboutConfig
  process: ProcessConfig
  testimonials: TestimonialsConfig
  faq: FaqConfig
  contact: ContactConfig
  footer: FooterConfig
  colors: ColorsConfig
}

/* ------------------------------------------------------------------ *
 * ESQUELETO NEUTRO — usado como base do merge.
 * Garante que nenhum cliente quebre o site por campo faltando e serve
 * de documentação viva de todos os campos disponíveis.
 * ------------------------------------------------------------------ */

export const emptySiteConfig: SiteConfig = {
  meta: {
    title: "Nome da Empresa | Serviço principal em Cidade - UF",
    description: "Descreva em uma frase o que a empresa faz, para quem e onde atende.",
    keywords: ["serviço principal cidade"],
    siteUrl: "https://exemplo.com.br",
    locale: "pt_BR",
    ogTitle: "Nome da Empresa | Serviço principal",
    ogDescription: "Resumo do negócio para compartilhamento em redes sociais.",
    themeColor: "#3f9f5b",
    business: {
      type: "LocalBusiness",
      legalName: "Nome da Empresa",
      priceRange: "$$",
      areaServed: "Cidade e região - UF",
      currency: "BRL",
      latitude: "",
      longitude: "",
      address: { street: "", district: "", city: "", region: "", postalCode: "", country: "BR" },
      sameAs: [],
    },
  },
  brand: {
    logoIcon: "✿",
    name: "Nome da Empresa",
    tagline: "Slogan curto",
    copyright: "© 2025 Nome da Empresa. Todos os direitos reservados.",
    whatsappUrl: "https://wa.me/5500000000000",
    instagramUrl: "",
    email: "",
    phoneLabel: "(00) 00000-0000",
    phoneUrl: "tel:+5500000000000",
  },
  navbar: {
    links: [
      { label: "Serviços", href: "#servicos" },
      { label: "Sobre nós", href: "#sobre-nos" },
      { label: "Contato", href: "#contato" },
    ],
    ctaLabel: "Falar no WhatsApp",
    ctaUrl: "https://wa.me/5500000000000",
    menuTitle: "Menu",
    menuDescription: "Navegue pelas seções do site",
    menuToggleLabel: "Abrir menu",
    themeToggleLabel: "Alternar tema",
  },
  hero: {
    eyebrow: "Categoria principal",
    title: "Título principal da página",
    highlight: "com destaque",
    description: "Explique o benefício principal, para quem é e qual é o próximo passo.",
    primaryLabel: "Falar no WhatsApp",
    primaryUrl: "https://wa.me/5500000000000",
    secondaryLabel: "Ver serviços",
    secondaryUrl: "#servicos",
    tags: ["Diferencial 1", "Diferencial 2"],
  },
  services: { eyebrow: "O que oferecemos", title: "Nossos serviços", description: "Resumo dos serviços.", items: [] },
  portfolio: {
    eyebrow: "Portfólio",
    title: "Um pouco do nosso trabalho",
    description: "Fotos reais de projetos, produtos e ambientes.",
    items: [],
  },
  about: {
    eyebrow: "Sobre nós",
    titleBefore: "Quem",
    titleHighlight: "somos",
    titleAfter: "",
    description: "História e diferenciais da empresa.",
    values: [],
    stats: [],
  },
  process: {
    eyebrow: "Como funciona",
    titleBefore: "Do",
    titleHighlight: "primeiro contato",
    titleMiddle: "ao",
    titleAfter: "resultado final",
    description: "Explique o passo a passo do atendimento.",
    steps: [],
  },
  testimonials: { eyebrow: "Depoimentos", title: "Quem conhece, recomenda", description: "Resumo das avaliações.", items: [] },
  faq: { eyebrow: "Perguntas frequentes", title: "Ainda tem dúvida?", description: "Dúvidas mais comuns.", items: [] },
  contact: {
    eyebrow: "Próximo passo",
    titleBefore: "Vamos",
    titleHighlight: "conversar",
    titleAfter: "?",
    description: "Explique como o cliente pode entrar em contato.",
    ctaLabel: "Falar no WhatsApp",
    ctaUrl: "https://wa.me/5500000000000",
    ctaNote: "Respondemos rápido.",
    visitEyebrow: "Visite a loja",
    visitTitle: "Estamos perto de você",
    addressLabel: "Endereço",
    addressLines: [],
    mapLabel: "Abrir no Google Maps",
    mapUrl: "",
    mapEmbedUrl: "",
    phoneLabel: "Telefone",
    phone: "(00) 00000-0000",
    phoneUrl: "tel:+5500000000000",
    hoursLabel: "Horário de atendimento",
    hoursLines: [],
    hoursStructured: [],
  },
  footer: { navigationTitle: "Navegação", socialTitle: "Redes sociais", socials: [], note: "" },
  colors: {
    primary: "#3f9f5b",
    primaryForeground: "#ffffff",
    background: "#fbfdf9",
    foreground: "#18221b",
    mutedForeground: "#647067",
  },
}

/* ------------------------------------------------------------------ *
 * MERGE — preenche qualquer campo ausente com o esqueleto neutro,
 * então o site nunca quebra por conteúdo incompleto.
 * ------------------------------------------------------------------ */

/** Primeira lista encontrada entre os candidatos (aceita o campo em formatos diferentes). */
function firstList(...candidates: unknown[]): unknown[] | undefined {
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate
  }
  return undefined
}

/**
 * Normaliza um depoimento.
 *
 * Aceita a forma canônica (`{ quote, name, role }`) e também variações comuns de
 * nome de campo (`text`, `author`, `cargo`…) usadas por conteúdo escrito à mão ou
 * gerado por IA — assim um depoimento nunca "some" do site só porque a chave veio
 * com outro nome. Um depoimento também pode vir como texto puro.
 */
function normalizeTestimonial(raw: unknown): TestimonialItem | null {
  if (typeof raw === "string") {
    const quote = raw.trim()
    return quote ? { quote, name: "", role: "" } : null
  }
  if (!raw || typeof raw !== "object") return null
  const item = raw as Record<string, unknown>
  const pick = (...keys: string[]) => {
    for (const key of keys) {
      const value = item[key]
      if (typeof value === "string" && value.trim()) return value.trim()
    }
    return ""
  }
  const quote = pick("quote", "text", "texto", "depoimento", "testimonial", "comment", "comentario", "content", "mensagem")
  const name = pick("name", "nome", "author", "autor", "client", "cliente", "customer")
  const role = pick("role", "cargo", "position", "company", "empresa", "relation", "relacao")
  if (!quote && !name) return null
  return { quote, name, role }
}

/** Sempre devolve uma lista de depoimentos válidos (descarta itens vazios). */
function normalizeTestimonials(input: unknown, fallback: TestimonialItem[]): TestimonialItem[] {
  const nested =
    input && typeof input === "object" && !Array.isArray(input) ? (input as Record<string, unknown>).items : undefined
  const list = firstList(input, nested)
  if (!list) return fallback
  return list.map(normalizeTestimonial).filter((item): item is TestimonialItem => item !== null)
}

function mergeArray<T>(input: T[] | undefined, fallback: T[]): T[] {
  return Array.isArray(input) ? input : fallback
}

export function mergeSiteConfig(input: unknown): SiteConfig {
  const value = (input && typeof input === "object" ? input : {}) as Partial<SiteConfig>
  const base = emptySiteConfig
  // `testimonials` pode vir como objeto ({ items: [...] }) ou já como uma lista.
  const testimonialsValue = Array.isArray(value.testimonials) ? {} : (value.testimonials ?? {})
  return {
    meta: { ...base.meta, ...(value.meta ?? {}), business: { ...base.meta.business, ...(value.meta?.business ?? {}), address: { ...base.meta.business.address, ...(value.meta?.business?.address ?? {}) }, sameAs: mergeArray(value.meta?.business?.sameAs, base.meta.business.sameAs), } },
    brand: { ...base.brand, ...(value.brand ?? {}) },
    navbar: { ...base.navbar, ...(value.navbar ?? {}), links: mergeArray(value.navbar?.links, base.navbar.links) },
    hero: { ...base.hero, ...(value.hero ?? {}), tags: mergeArray(value.hero?.tags, base.hero.tags) },
    services: { ...base.services, ...(value.services ?? {}), items: mergeArray(value.services?.items, base.services.items) },
    portfolio: { ...base.portfolio, ...(value.portfolio ?? {}), items: mergeArray(value.portfolio?.items, base.portfolio.items) },
    about: { ...base.about, ...(value.about ?? {}), values: mergeArray(value.about?.values, base.about.values), stats: mergeArray(value.about?.stats, base.about.stats) },
    process: { ...base.process, ...(value.process ?? {}), steps: mergeArray(value.process?.steps, base.process.steps) },
    testimonials: { ...base.testimonials, ...testimonialsValue, items: normalizeTestimonials(value.testimonials, base.testimonials.items) },
    faq: { ...base.faq, ...(value.faq ?? {}), items: mergeArray(value.faq?.items, base.faq.items) },
    contact: { ...base.contact, ...(value.contact ?? {}), addressLines: mergeArray(value.contact?.addressLines, base.contact.addressLines), hoursLines: mergeArray(value.contact?.hoursLines, base.contact.hoursLines), hoursStructured: mergeArray(value.contact?.hoursStructured, base.contact.hoursStructured) },
    footer: { ...base.footer, ...(value.footer ?? {}), socials: mergeArray(value.footer?.socials, base.footer.socials) },
    colors: { ...base.colors, ...(value.colors ?? {}) },
  }
}

/** Conteúdo do site (fonte única). Lido em tempo de build. */
export const siteConfig: SiteConfig = mergeSiteConfig(rawConfig)

/** URL pública do site (permite sobrescrever por variável de ambiente). */
export function siteUrl(config: SiteConfig = siteConfig) {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL
  const url = (fromEnv && fromEnv.trim()) || config.meta.siteUrl || "https://exemplo.com.br"
  return url.startsWith("http") ? url : `https://${url}`
}

/**
 * Fundo do tema escuro (espelha --background de .dark em app/globals.css).
 * Usado para derivar a versão acessível da cor de marca no tema escuro.
 */
const DARK_THEME_BACKGROUND = "#0e131f"

/**
 * CSS das cores escolhidas no painel, com contraste WCAG AA garantido.
 *
 * `--primary` é usado como texto sobre o fundo e como fundo de botão (com
 * `--primary-foreground`), então derivamos duas variações da cor de marca do
 * cliente: uma escura o bastante no tema claro e uma clara o bastante no
 * escuro. Assim qualquer cor escolhida no painel continua legível.
 */
export function siteThemeCss(config: SiteConfig) {
  const c = config.colors
  const light = ensureAccessibleColors(c.primary, c.background, { preferredForeground: c.primaryForeground })
  const dark = ensureAccessibleColors(c.primary, DARK_THEME_BACKGROUND, { preferredForeground: c.primaryForeground })
  return [
    `html:not(.dark){--primary:${light.primary};--primary-foreground:${light.primaryForeground};--background:${c.background};--foreground:${c.foreground};--muted-foreground:${c.mutedForeground}}`,
    `html.dark{--primary:${dark.primary};--primary-foreground:${dark.primaryForeground}}`,
  ].join("\n")
}

/** Endereço em texto (usado em dados estruturados e conferência do painel). */
export function addressOneLine(config: SiteConfig = siteConfig) {
  const a = config.meta.business.address
  return [a.street, a.district, `${a.city} - ${a.region}`, a.postalCode].filter(Boolean).join(", ")
}

/** Telefone só com dígitos e prefixo internacional (formato aceito pelo schema.org). */
export function phoneE164(config: SiteConfig = siteConfig) {
  const digits = (config.brand.phoneUrl || config.contact.phone || "").replace(/\D/g, "")
  return digits ? `+${digits}` : ""
}
