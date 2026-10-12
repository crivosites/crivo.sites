import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getIcon } from "@/lib/icons"
import type { ProcessConfig } from "@/lib/site-config"

export function ProcessSection({ process }: { process: ProcessConfig }) {
  return (
    <section id="como-funciona" className="relative overflow-hidden bg-muted/30 px-4 py-20 sm:px-6 lg:px-8">
      <div className="container relative z-10 mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <p className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">{process.eyebrow}</p>
          <h2 className="mb-6 text-balance text-3xl font-bold sm:text-4xl md:text-5xl">
            {process.titleBefore} <span className="text-primary">{process.titleHighlight}</span>
            {process.titleMiddle ? <> {process.titleMiddle} </> : null}
            <span className="text-primary">{process.titleAfter}</span>
          </h2>
          <p className="mx-auto max-w-3xl text-pretty text-lg leading-relaxed text-muted-foreground">{process.description}</p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {process.steps.map((step, index) => {
            const Icon = getIcon(step.icon)
            return (
              <Card key={step.title} className="group relative overflow-hidden bg-background transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                <div aria-hidden="true" className="absolute right-0 top-0 bg-gradient-to-br from-primary/10 to-primary/5 bg-clip-text p-4 text-[120px] font-bold leading-none text-transparent">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <CardHeader>
                  <div className="mb-4 inline-flex w-fit rounded-lg bg-primary/10 p-3 text-primary transition-all duration-300 group-hover:rotate-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon aria-hidden="true" className="size-6" />
                  </div>
                  <CardTitle className="text-xl transition-colors group-hover:text-primary">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="leading-relaxed text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
