import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { ServicesSection } from "@/components/services-section"
import { PortfolioSection } from "@/components/portfolio-section"
import { AboutSection } from "@/components/about-section"
import { ProcessSection } from "@/components/process-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { FaqSection } from "@/components/faq-section"
import { ContactSection } from "@/components/contact-section"
import { Footer } from "@/components/footer"
import { StructuredData } from "@/components/structured-data"
import { readSiteConfig } from "@/lib/site-config-runtime"

/**
 * Ordem das seções do site = ordem das seções no painel.
 * Todo o conteúdo vem de content/site-config.json (fonte única).
 *
 * A leitura é feita a cada requisição (force-dynamic) para que o que o painel
 * salva apareça no site na hora, sem precisar rodar `pnpm build` de novo.
 */
export const dynamic = "force-dynamic"

export default async function Home() {
  const config = await readSiteConfig()
  const guarantee = [config.brand.tagline, config.meta.business.areaServed].filter(Boolean).join(" • ")

  // A âncora do portfólio só aparece no menu quando existe ao menos uma foto.
  const navbar = {
    ...config.navbar,
    links: config.navbar.links.filter((link) => link.href !== "#portfolio" || config.portfolio.items.length > 0),
  }

  return (
    <main className="min-h-screen">
      <a
        href="#inicio"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:shadow-lg"
      >
        Pular para o conteúdo
      </a>
      <Navbar navbar={navbar} brand={config.brand} />
      <HeroSection hero={config.hero} guarantee={guarantee} />
      <ServicesSection services={config.services} />
      <PortfolioSection portfolio={config.portfolio} />
      <AboutSection about={config.about} />
      <ProcessSection process={config.process} />
      <TestimonialsSection testimonials={config.testimonials} />
      <FaqSection faq={config.faq} />
      <ContactSection contact={config.contact} />
      <Footer brand={config.brand} footer={config.footer} navbar={navbar} />
      <StructuredData config={config} />
    </main>
  )
}
