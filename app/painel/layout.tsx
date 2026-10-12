import type { Metadata } from "next"

/** O painel nunca deve aparecer no Google. */
export const metadata: Metadata = {
  title: "Painel de conteúdo",
  robots: { index: false, follow: false, nocache: true },
}

export default function PainelLayout({ children }: { children: React.ReactNode }) {
  return children
}
