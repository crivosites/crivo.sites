import { ImageResponse } from "next/og"
import { siteConfig } from "@/lib/site-config"

export const alt = siteConfig.meta.ogTitle || siteConfig.meta.title
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

/** Imagem de compartilhamento gerada automaticamente a partir do conteúdo. */
export default function OpengraphImage() {
  const { colors } = siteConfig
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: colors.background,
          color: colors.foreground,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 34, color: colors.primary, fontWeight: 700 }}>
          <div style={{ display: "flex", width: 44, height: 44, borderRadius: 12, background: colors.primary }} />
          <span>{siteConfig.brand.name}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", fontSize: 62, fontWeight: 800, lineHeight: 1.1, maxWidth: 980 }}>
            {siteConfig.meta.ogTitle || siteConfig.meta.title}
          </div>
          <div style={{ display: "flex", fontSize: 30, color: colors.mutedForeground, maxWidth: 940, lineHeight: 1.35 }}>
            {siteConfig.meta.business.areaServed}
          </div>
        </div>
        <div style={{ display: "flex", height: 14, width: 240, background: colors.primary, borderRadius: 99 }} />
      </div>
    ),
    size,
  )
}
