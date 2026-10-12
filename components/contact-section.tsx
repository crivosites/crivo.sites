import { Clock, MapPin, MessageCircle, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ContactConfig } from "@/lib/site-config"

export function ContactSection({ contact }: { contact: ContactConfig }) {
  return (
    <section id="contato" className="bg-muted/30 px-4 py-20 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <p className="mb-4 inline-flex rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">{contact.eyebrow}</p>
          <h2 className="text-balance text-3xl font-bold sm:text-4xl md:text-5xl">
            {contact.titleBefore} <span className="text-primary">{contact.titleHighlight}</span>
            {contact.titleAfter}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">{contact.description}</p>
        </div>

        <div className="flex flex-col items-center gap-10">
          <div className="flex flex-col items-center gap-4 text-center">
            <Button asChild size="lg" className="rounded-full px-7">
              <a href={contact.ctaUrl} target="_blank" rel="noopener noreferrer">
                <MessageCircle aria-hidden="true" data-icon="inline-start" /> {contact.ctaLabel}
              </a>
            </Button>
            {contact.ctaNote ? <p className="text-sm text-muted-foreground">{contact.ctaNote}</p> : null}
          </div>

          <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-2">
            <div className="flex flex-col gap-5 rounded-2xl border bg-background p-6 shadow-sm sm:p-8">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">{contact.visitEyebrow}</p>
                <h3 className="mt-3 text-3xl font-bold">{contact.visitTitle}</h3>
              </div>

              {contact.addressLines.length > 0 ? (
                <div className="flex items-start gap-4 border-t pt-6">
                  <MapPin aria-hidden="true" className="mt-1 text-primary" />
                  <div>
                    <h4 className="font-semibold">{contact.addressLabel}</h4>
                    <address className="mt-1 not-italic text-muted-foreground">
                      {contact.addressLines.map((line) => (
                        <span key={line} className="block">{line}</span>
                      ))}
                    </address>
                    {contact.mapUrl ? (
                      <a
                        href={contact.mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-block text-sm font-semibold text-primary underline-offset-4 hover:underline"
                      >
                        {contact.mapLabel}
                      </a>
                    ) : null}
                  </div>
                </div>
              ) : null}

              <div className="flex items-start gap-4">
                <Phone aria-hidden="true" className="mt-1 text-primary" />
                <div>
                  <h4 className="font-semibold">{contact.phoneLabel}</h4>
                  <p className="mt-1 text-muted-foreground">
                    {contact.phoneUrl ? (
                      <a href={contact.phoneUrl} className="hover:text-primary">{contact.phone}</a>
                    ) : (
                      contact.phone
                    )}
                  </p>
                </div>
              </div>

              {contact.hoursLines.length > 0 ? (
                <div className="flex items-start gap-4">
                  <Clock aria-hidden="true" className="mt-1 text-primary" />
                  <div>
                    <h4 className="font-semibold">{contact.hoursLabel}</h4>
                    <p className="mt-1 text-muted-foreground">
                      {contact.hoursLines.map((line) => (
                        <span key={line} className="block">{line}</span>
                      ))}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>

            {contact.mapEmbedUrl ? (
              <div className="overflow-hidden rounded-2xl border bg-background shadow-sm">
                <iframe
                  src={contact.mapEmbedUrl}
                  title={`Mapa da localização — ${contact.visitTitle}`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-full min-h-[320px] w-full"
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
