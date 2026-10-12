import { getIcon } from "@/lib/icons"
import type { ServicesConfig } from "@/lib/site-config"

export function ServicesSection({ services }: { services: ServicesConfig }) {
  return (
    <section id="servicos" className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-primary">{services.eyebrow}</p>
          <h2 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">{services.title}</h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">{services.description}</p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {services.items.map((service) => {
            const Icon = getIcon(service.icon)
            return (
              <article
                key={service.title}
                className="group rounded-2xl border border-border/60 bg-card/60 p-6 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10"
              >
                <div className="mb-5 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon aria-hidden="true" />
                </div>
                <h3 className="mb-3 text-xl font-semibold">{service.title}</h3>
                <p className="leading-relaxed text-muted-foreground">{service.description}</p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
