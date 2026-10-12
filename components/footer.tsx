import Link from "next/link"
import { getIcon } from "@/lib/icons"
import type { BrandConfig, FooterConfig, NavbarConfig } from "@/lib/site-config"

export function Footer({ brand, footer, navbar }: { brand: BrandConfig; footer: FooterConfig; navbar: NavbarConfig }) {
  return (
    <footer className="border-t border-border bg-muted/30 px-4 py-12 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-8 text-center md:grid-cols-3 md:items-start">
          <div>
            <h3 className="mb-3 text-xl font-bold">{brand.name}</h3>
            {brand.tagline ? <p className="mb-3 text-sm text-primary">{brand.tagline}</p> : null}
            {footer.note ? <p className="text-sm leading-relaxed text-muted-foreground">{footer.note}</p> : null}
            {brand.email ? (
              <a href={`mailto:${brand.email}`} className="mt-3 inline-block text-sm text-muted-foreground hover:text-primary">
                {brand.email}
              </a>
            ) : null}
            {brand.phoneUrl ? (
              <a href={brand.phoneUrl} className="mt-1 block text-sm text-muted-foreground hover:text-primary">
                {brand.phoneLabel}
              </a>
            ) : null}
          </div>

          <nav aria-label={footer.navigationTitle}>
            <h4 className="mb-4 font-semibold">{footer.navigationTitle}</h4>
            <ul className="flex flex-col items-center gap-2">
              {navbar.links.map((link) => (
                <li key={`${link.label}-${link.href}`}>
                  <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-primary">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h4 className="mb-4 font-semibold">{footer.socialTitle}</h4>
            <div className="flex justify-center gap-4">
              {footer.socials.map((social) => {
                const Icon = getIcon(social.icon)
                return (
                  <a
                    key={`${social.label}-${social.url}`}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${social.label} — ${brand.name}`}
                    className="text-muted-foreground transition-colors hover:text-primary"
                  >
                    <Icon aria-hidden="true" className="size-5" />
                    <span className="sr-only">{social.label}</span>
                  </a>
                )
              })}
            </div>
          </div>
        </div>

        <p className="mt-10 border-t border-border/60 pt-6 text-center text-xs text-muted-foreground">{brand.copyright}</p>
      </div>
    </footer>
  )
}
