import Image from "next/image"
import type { PortfolioConfig } from "@/lib/site-config"

/**
 * Galeria de fotos enviadas pelo painel.
 * A seção some sozinha enquanto não houver nenhuma foto cadastrada.
 */
export function PortfolioSection({ portfolio }: { portfolio: PortfolioConfig }) {
  if (portfolio.items.length === 0) return null

  return (
    <section id="portfolio" className="bg-muted/30 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-primary">{portfolio.eyebrow}</p>
          <h2 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">{portfolio.title}</h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">{portfolio.description}</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {portfolio.items.map((item, index) => (
            <figure
              key={`${item.image}-${index}`}
              className="group overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                <Image
                  src={item.image}
                  alt={item.title || "Foto do portfólio"}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              {item.title || item.description || item.category ? (
                <figcaption className="p-5">
                  {item.category ? (
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{item.category}</p>
                  ) : null}
                  {item.title ? <h3 className="mt-1 text-lg font-semibold">{item.title}</h3> : null}
                  {item.description ? (
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                  ) : null}
                </figcaption>
              ) : null}
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
