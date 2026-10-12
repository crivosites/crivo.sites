import { CheckCircle2, Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { getIcon } from "@/lib/icons"
import type { AboutConfig } from "@/lib/site-config"

export function AboutSection({ about }: { about: AboutConfig }) {
  return (
    <section id="sobre-nos" className="relative py-20 px-4 sm:px-6 lg:px-8">
      <div aria-hidden="true" className="absolute left-10 top-20 size-72 rounded-full bg-primary/5 blur-3xl" />
      <div aria-hidden="true" className="absolute bottom-20 right-10 size-96 rounded-full bg-primary/5 blur-3xl" />

      <div className="container relative z-10 mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
            <Sparkles aria-hidden="true" className="size-4" />
            {about.eyebrow}
          </p>
          <h2 className="mb-6 text-balance text-3xl font-bold sm:text-4xl md:text-5xl">
            {about.titleBefore}{" "}
            <span className="relative text-primary">
              {about.titleHighlight}
              <svg aria-hidden="true" className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 200 8" fill="none">
                <path d="M0 4C50 2 150 6 200 4" stroke="currentColor" strokeWidth="2" />
              </svg>
            </span>
            {about.titleAfter ? ` ${about.titleAfter}` : null}
          </h2>
          <p className="mx-auto max-w-3xl text-pretty text-lg leading-relaxed text-muted-foreground">{about.description}</p>
        </div>

        {about.values.length > 0 ? (
          <div className="mb-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {about.values.map((value) => {
              const Icon = getIcon(value.icon, CheckCircle2)
              return (
                <Card key={value.title} className="group border-none shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <Icon aria-hidden="true" className="mt-1 size-6 flex-shrink-0 text-primary transition-transform group-hover:scale-110" />
                      <div>
                        <h3 className="mb-2 text-lg font-semibold transition-colors group-hover:text-primary">{value.title}</h3>
                        <p className="text-sm leading-relaxed text-muted-foreground">{value.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : null}

        {about.stats.length > 0 ? (
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {about.stats.map((stat) => (
              <div key={stat.label} className="group text-center">
                <div className="mb-2 text-4xl font-bold text-primary transition-transform group-hover:scale-110 md:text-5xl">{stat.number}</div>
                <div className="font-medium text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}
