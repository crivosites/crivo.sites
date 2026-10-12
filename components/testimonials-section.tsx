"use client"

import { useEffect, useRef, useSyncExternalStore } from "react"
import { Quote } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { TestimonialItem, TestimonialsConfig } from "@/lib/site-config"

/** Detecta quem prefere menos animação (acessibilidade), sem setState em efeito. */
function usePrefersReducedMotion() {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia("(prefers-reduced-motion: reduce)")
      query.addEventListener("change", onChange)
      return () => query.removeEventListener("change", onChange)
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  )
}

function TestimonialCard({ testimonial }: { testimonial: TestimonialItem }) {
  return (
    <Card className="w-[85vw] flex-shrink-0 border-none shadow-lg sm:w-[420px]">
      <CardContent className="p-8">
        <Quote aria-hidden="true" className="mb-4 size-8 text-primary" />
        <p className="mb-6 min-h-[110px] text-pretty text-base leading-relaxed sm:text-lg">{testimonial.quote}</p>
        <div>
          <p className="text-lg font-semibold">{testimonial.name}</p>
          <p className="text-sm text-muted-foreground">{testimonial.role}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export function TestimonialsSection({ testimonials }: { testimonials: TestimonialsConfig }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const reducedMotion = usePrefersReducedMotion()

  const items = testimonials.items
  // Com menos de 3 depoimentos não vale animar; e quem pede menos movimento
  // recebe todos os cards visíveis em grade (nada fica escondido).
  const carousel = !reducedMotion && items.length >= 3

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    let frame = 0
    let position = 0
    const step = () => {
      position += 0.5
      const half = container.scrollWidth / 2
      if (half && position >= half) position = 0
      container.scrollLeft = position
      frame = window.requestAnimationFrame(step)
    }
    frame = window.requestAnimationFrame(step)
    return () => window.cancelAnimationFrame(frame)
  }, [carousel])

  return (
    <section id="depoimentos" className="overflow-hidden bg-muted/30 px-4 py-20 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-7xl">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-primary">{testimonials.eyebrow}</p>
          <h2 className="mb-4 text-balance text-3xl font-bold sm:text-4xl md:text-5xl">{testimonials.title}</h2>
          <p className="mx-auto text-pretty leading-relaxed text-muted-foreground">{testimonials.description}</p>
        </div>

        {items.length > 0 ? (
          <div className="relative">
            {carousel ? (
              <div ref={scrollRef} className="flex gap-6 overflow-x-hidden" aria-label="Depoimentos de clientes">
                {[...items, ...items].map((testimonial, index) => (
                  <TestimonialCard key={`${testimonial.name}-${index}`} testimonial={testimonial} />
                ))}
              </div>
            ) : (
              <ul className="flex flex-wrap justify-center gap-6" aria-label="Depoimentos de clientes">
                {items.map((testimonial, index) => (
                  <li key={`${testimonial.name}-${index}`} className="flex">
                    <TestimonialCard testimonial={testimonial} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}
      </div>
    </section>
  )
}
