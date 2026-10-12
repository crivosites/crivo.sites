/**
 * PONTE: dados crus de um cliente -> content/site-config.json do template.
 *
 * Regra de ouro: aqui NÃO mora criatividade nem dado inventado. Este arquivo
 * apenas NORMALIZA e MONTA o que foi fornecido. Tudo que faltar é preenchido
 * pelo esqueleto neutro do template (mergeSiteConfig), então o site nunca quebra.
 *
 * Nenhuma linha do template (app/, components/, content/) é alterada por isto.
 */
import {
  mergeSiteConfig,
  type SiteConfig,
  type IconItem,
} from "@/lib/site-config"
import { iconRegistry } from "@/lib/icons"

/** Serviço/diferencial informado pelo cliente (ou gerado por IA no tom do nicho). */
export type BriefIconItem = { icon?: string; title: string; description: string }

/** Brief neutro do cliente. O painel (LeadOne) mapeia seu Prospect para este formato. */
export type ClientBrief = {
  name: string
  niche?: string
  /** Telefone/WhatsApp cru, em qualquer formato. */
  phone?: string
  email?: string
  instagram?: string
  siteUrl?: string
  city?: string
  region?: string
  street?: string
  district?: string
  postalCode?: string
  latitude?: string
  longitude?: string
  priceRange?: string
  areaServed?: string
  businessType?: string
  /** Textos de SEO (opcionais; se ausentes, são compostos a partir do nome/nicho/cidade). */
  metaTitle?: string
  metaDescription?: string
  keywords?: string[]
  /** Copy do site. */
  tagline?: string
  heroEyebrow?: string
  headline?: string
  subheadline?: string
  ctaLabel?: string
  ctaWhatsAppMessage?: string
  primaryColor?: string
  hoursLines?: string[]
  services?: BriefIconItem[]
  values?: BriefIconItem[]
  stats?: { number: string; label: string }[]
  testimonials?: { quote: string; name: string; role?: string }[]
  faqs?: { question: string; answer: string }[]
}

/** Tipos schema.org aceitos (espelha tools/site-config.schema.json). */
export const BUSINESS_TYPES = [
  "LocalBusiness", "Store", "HomeAndConstructionBusiness", "ProfessionalService",
  "Restaurant", "FoodEstablishment", "HealthAndBeautyBusiness", "BeautySalon",
  "HairSalon", "DaySpa", "NailSalon", "Dentist", "MedicalBusiness", "Physician",
  "VeterinaryCare", "PetStore", "AutomotiveBusiness", "AutoRepair", "RealEstateAgent",
  "FinancialService", "LegalService", "AccountingService", "ExerciseGym",
  "SportsActivityLocation", "ChildCare", "DryCleaningOrLaundry", "Electrician",
  "Plumber", "HousePainter", "Locksmith", "MovingCompany", "RoofingContractor",
  "GeneralContractor",
] as const

const digits = (value: string | undefined): string => (value ?? "").replace(/\D/g, "")

/** Remove o DDI 55 quando presente, deixando só DDD + número. */
function nationalDigits(raw: string | undefined): string {
  let d = digits(raw)
  if (d.startsWith("55") && (d.length === 12 || d.length === 13)) d = d.slice(2)
  return d
}

/** Telefone em E.164 brasileiro (+55...). Retorna "" quando não há DDD válido. */
export function toPhoneE164(raw?: string): string {
  const d = nationalDigits(raw)
  if (d.length !== 10 && d.length !== 11) return ""
  return `+55${d}`
}

/** Formata para exibição: (DD) 9XXXX-XXXX / (DD) XXXX-XXXX. */
export function formatPhoneBR(raw?: string): string {
  const d = nationalDigits(raw)
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return (raw ?? "").trim()
}

/** Link do WhatsApp a partir do telefone. */
export function toWhatsAppUrl(raw?: string, message?: string): string {
  const e164 = toPhoneE164(raw)
  if (!e164) return ""
  const base = `https://wa.me/${e164.replace(/^\+/, "")}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}

/** URL do Instagram a partir de handle (@x) ou URL. */
export function toInstagramUrl(raw?: string): string {
  const value = (raw ?? "").trim()
  if (!value) return ""
  if (/^https?:\/\//i.test(value)) return value
  const handle = value.replace(/^@/, "").replace(/[^a-zA-Z0-9._]/g, "")
  return handle ? `https://www.instagram.com/${handle}` : ""
}

/** Garante um ícone válido do template (evita ícone "morto" no JSON). */
export function normalizeIcon(name?: string): string {
  return name && iconRegistry[name] ? name : "sparkles"
}

function toIconItems(items?: BriefIconItem[]): IconItem[] {
  if (!Array.isArray(items)) return []
  return items
    .filter((item) => item && typeof item.title === "string" && item.title.trim())
    .map((item) => ({
      icon: normalizeIcon(item.icon),
      title: item.title.trim(),
      description: (item.description ?? "").trim(),
    }))
}

function businessType(value?: string): string {
  return value && (BUSINESS_TYPES as readonly string[]).includes(value) ? value : "LocalBusiness"
}

function buildMetaTitle(brief: ClientBrief): string {
  if (brief.metaTitle?.trim()) return brief.metaTitle.trim()
  return [brief.name, brief.niche, brief.city && `em ${brief.city}`]
    .map((part) => (part ?? "").trim())
    .filter(Boolean)
    .join(" | ")
    .slice(0, 60)
}

function buildAddressLines(brief: ClientBrief): string[] {
  const cityLine = [brief.city, brief.region].filter(Boolean).join(" - ")
  return [brief.street, brief.district, cityLine, brief.postalCode]
    .map((line) => (line ?? "").trim())
    .filter(Boolean)
}

/**
 * Converte um brief neutro no SiteConfig do template.
 * Nunca lança e nunca perde campo: o que faltar vem do esqueleto neutro.
 */
export function briefToSiteConfig(brief: ClientBrief): SiteConfig {
  const name = (brief.name ?? "").trim() || "Nome da Empresa"
  const phoneE164 = toPhoneE164(brief.phone)
  const phoneLabel = formatPhoneBR(brief.phone)
  const whatsappUrl = toWhatsAppUrl(brief.phone, brief.ctaWhatsAppMessage)
  const instagramUrl = toInstagramUrl(brief.instagram)
  const addressLines = buildAddressLines(brief)
  const address = {
    street: (brief.street ?? "").trim(),
    district: (brief.district ?? "").trim(),
    city: (brief.city ?? "").trim(),
    region: (brief.region ?? "").trim(),
    postalCode: (brief.postalCode ?? "").trim(),
    country: "BR",
  }

  const sameAs = [instagramUrl].filter(Boolean)

  const config = {
    meta: {
      title: buildMetaTitle(brief),
      description: (brief.metaDescription ?? brief.subheadline ?? "").trim(),
      keywords: Array.isArray(brief.keywords) ? brief.keywords.filter(Boolean) : [],
      siteUrl: (brief.siteUrl ?? "").trim(),
      business: {
        type: businessType(brief.businessType),
        legalName: name,
        priceRange: (brief.priceRange ?? "$$").trim(),
        areaServed: (brief.areaServed ?? "").trim(),
        latitude: (brief.latitude ?? "").trim(),
        longitude: (brief.longitude ?? "").trim(),
        address,
        sameAs,
      },
    },
    brand: {
      name,
      tagline: (brief.tagline ?? brief.niche ?? "").trim(),
      whatsappUrl,
      instagramUrl,
      email: (brief.email ?? "").trim(),
      phoneLabel,
      phoneUrl: phoneE164 ? `tel:${phoneE164}` : "",
    },
    hero: {
      eyebrow: (brief.heroEyebrow ?? brief.niche ?? "").trim(),
      title: (brief.headline ?? "").trim(),
      highlight: "",
      description: (brief.subheadline ?? "").trim(),
      primaryLabel: (brief.ctaLabel ?? "Falar no WhatsApp").trim(),
      primaryUrl: whatsappUrl,
      secondaryUrl: "#servicos",
    },
    services: { items: toIconItems(brief.services) },
    about: {
      title: (brief.headline ?? "").trim(),
      description: (brief.subheadline ?? "").trim(),
      values: toIconItems(brief.values),
      stats: Array.isArray(brief.stats)
        ? brief.stats
            .filter((s) => s && (s.number || s.label))
            .map((s) => ({ number: String(s.number ?? "").trim(), label: String(s.label ?? "").trim() }))
        : [],
    },
    testimonials: {
      items: Array.isArray(brief.testimonials)
        ? brief.testimonials
            .filter((t) => t && (t.quote || t.name))
            .map((t) => ({
              quote: String(t.quote ?? "").trim(),
              name: String(t.name ?? "").trim(),
              role: String(t.role ?? "").trim(),
            }))
        : [],
    },
    faq: {
      items: Array.isArray(brief.faqs)
        ? brief.faqs
            .filter((f) => f && (f.question || f.answer))
            .map((f) => ({ question: String(f.question ?? "").trim(), answer: String(f.answer ?? "").trim() }))
        : [],
    },
    contact: {
      ctaLabel: (brief.ctaLabel ?? "").trim(),
      ctaUrl: whatsappUrl,
      ctaNote: "",
      addressLines,
      mapUrl: addressLines.length
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressLines.join(", "))}`
        : "",
      mapEmbedUrl: addressLines.length
        ? `https://www.google.com/maps?q=${encodeURIComponent(addressLines.join(", "))}&output=embed`
        : "",
      phone: phoneLabel,
      phoneUrl: phoneE164 ? `tel:${phoneE164}` : "",
      hoursLines: Array.isArray(brief.hoursLines) ? brief.hoursLines.filter(Boolean) : [],
    },
    footer: {
      socials: [
        instagramUrl && { icon: "instagram", label: "Instagram", url: instagramUrl },
        whatsappUrl && { icon: "whatsapp", label: "WhatsApp", url: whatsappUrl },
      ].filter(Boolean) as { icon: string; label: string; url: string }[],
    },
    colors: {
      primary: (brief.primaryColor ?? "").trim(),
    },
  }

  // O merge garante todos os campos e ignora qualquer valor ausente/invalido.
  return mergeSiteConfig(config)
}
