import { ArrowRight, Droplets, Flower2, Leaf, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { HeroConfig } from "@/lib/site-config"

export function HeroSection({ hero, guarantee }: { hero: HeroConfig; guarantee?: string }) {
  return (
    <section id="inicio" className="relative flex min-h-[88vh] items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[8%] top-[18%] size-[420px] rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute bottom-[5%] right-[10%] size-[380px] rounded-full bg-primary/10 blur-3xl" />
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 text-primary/30">
        <Leaf className="absolute left-[12%] top-[20%] size-10 animate-float" />
        <Flower2 className="absolute right-[17%] top-[28%] size-9 animate-float" />
        <Droplets className="absolute bottom-[20%] left-[20%] size-8 animate-float" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl py-16 text-center">
        <p className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
          <Leaf aria-hidden="true" className="size-4" /> {hero.eyebrow}
        </p>
        <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          {hero.title} <span className="text-primary">{hero.highlight}</span>
        </h1>
        <p className="mx-auto mb-10 max-w-3xl text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
          {hero.description}
        </p>
        <div className="mb-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button size="lg" className="group px-8 py-6 text-lg shadow-lg shadow-primary/25" asChild>
            <a href={hero.primaryUrl} target="_blank" rel="noopener noreferrer">
              {hero.primaryLabel}
              <ArrowRight aria-hidden="true" className="ml-2 size-5 transition-transform group-hover:translate-x-1" />
            </a>
          </Button>
          {hero.secondaryLabel ? (
            <Button size="lg" variant="outline" className="border-primary/30 px-8 py-6 text-lg" asChild>
              <a href={hero.secondaryUrl} target={hero.secondaryUrl.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
                {hero.secondaryLabel}
              </a>
            </Button>
          ) : null}
        </div>
        {hero.tags.length > 0 ? (
          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {hero.tags.map((tag) => (
              <li key={tag} className="flex items-center gap-2">
                <ShieldCheck aria-hidden="true" className="size-4 text-primary" />
                {tag}
              </li>
            ))}
          </ul>
        ) : null}
        {guarantee ? <p className="mt-8 text-sm font-medium text-foreground/80">{guarantee}</p> : null}
      </div>
    </section>
  )
}
