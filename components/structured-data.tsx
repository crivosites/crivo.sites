import { addressOneLine, phoneE164, siteUrl, type SiteConfig } from "@/lib/site-config"

/**
 * Dados estruturados (schema.org) para SEO local:
 * LocalBusiness/Store + FAQPage + WebSite.
 * Tudo derivado de content/site-config.json.
 */
export function StructuredData({ config }: { config: SiteConfig }) {
  const url = siteUrl(config)
  const business = config.meta.business
  const address = business.address

  const localBusiness: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": business.type || "LocalBusiness",
    "@id": `${url}/#business`,
    name: business.legalName || config.brand.name,
    description: config.meta.description,
    url,
    image: `${url}/opengraph-image`,
    telephone: phoneE164(config),
    priceRange: business.priceRange,
    currenciesAccepted: business.currency,
    areaServed: business.areaServed,
    address: {
      "@type": "PostalAddress",
      streetAddress: address.street,
      addressLocality: address.city,
      addressRegion: address.region,
      postalCode: address.postalCode,
      addressCountry: address.country,
    },
    ...(business.latitude && business.longitude
      ? { geo: { "@type": "GeoCoordinates", latitude: business.latitude, longitude: business.longitude } }
      : {}),
    ...(business.sameAs.length ? { sameAs: business.sameAs } : {}),
    ...(config.contact.hoursStructured.length
      ? {
          openingHoursSpecification: config.contact.hoursStructured.map((entry) => ({
            "@type": "OpeningHoursSpecification",
            dayOfWeek: entry.days,
            opens: entry.opens,
            closes: entry.closes,
          })),
        }
      : {}),
  }

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${url}/#website`,
    url,
    name: config.brand.name,
    inLanguage: "pt-BR",
    publisher: { "@id": `${url}/#business` },
  }

  const faqPage = config.faq.items.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: config.faq.items.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
      }
    : null

  const graph = [localBusiness, website, ...(faqPage ? [faqPage] : [])]

  return (
    <script
      type="application/ld+json"
      // Endereço em texto também disponível para conferência no painel.
      data-address={addressOneLine(config)}
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  )
}
