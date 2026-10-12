import { Card, CardContent } from "@/components/ui/card"
import type { FaqConfig } from "@/lib/site-config"

export function FaqSection({ faq }: { faq: FaqConfig }) {
  if (!faq.items.length) return null
  return (
    <section id="faq" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-3xl">
        <div className="mb-12 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-primary">{faq.eyebrow}</p>
          <h2 className="mb-4 text-balance text-3xl font-bold sm:text-4xl md:text-5xl">{faq.title}</h2>
          <p className="mx-auto text-pretty leading-relaxed text-muted-foreground">{faq.description}</p>
        </div>

        <div className="flex flex-col gap-3">
          {faq.items.map((item) => (
            <Card key={item.question} className="border-border/60">
              <CardContent className="p-0">
                <details className="group px-6 py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left font-semibold">
                    <span>{item.question}</span>
                    <span aria-hidden="true" className="text-2xl leading-none text-primary transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-4 leading-relaxed text-muted-foreground">{item.answer}</p>
                </details>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
