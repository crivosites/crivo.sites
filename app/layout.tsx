import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { siteConfig, siteThemeCss, siteUrl } from "@/lib/site-config"
import { readSiteConfig } from "@/lib/site-config-runtime"
import "./globals.css"

const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans", display: "swap" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" })

const url = siteUrl()

export const metadata: Metadata = {
  metadataBase: new URL(url),
  title: { default: siteConfig.meta.title, template: `%s | ${siteConfig.brand.name}` },
  description: siteConfig.meta.description,
  keywords: siteConfig.meta.keywords,
  applicationName: siteConfig.brand.name,
  authors: [{ name: siteConfig.brand.name, url }],
  creator: siteConfig.brand.name,
  publisher: siteConfig.brand.name,
  category: siteConfig.meta.business.type,
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large", "max-video-preview": -1 },
  },
  openGraph: {
    type: "website",
    locale: siteConfig.meta.locale,
    url,
    siteName: siteConfig.brand.name,
    title: siteConfig.meta.ogTitle || siteConfig.meta.title,
    description: siteConfig.meta.ogDescription || siteConfig.meta.description,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.meta.ogTitle || siteConfig.meta.title,
    description: siteConfig.meta.ogDescription || siteConfig.meta.description,
  },
  icons: { icon: [{ url: "/icon.svg", type: "image/svg+xml" }, { url: "/favicon.ico", sizes: "32x32" }], apple: "/apple-icon.png" },
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } }
    : {}),
}

export const viewport: Viewport = {
  themeColor: siteConfig.meta.themeColor,
  width: "device-width",
  initialScale: 1,
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // Cores/marca lidas a cada requisição: o painel salva e o site já atualiza.
  const themeConfig = await readSiteConfig()
  return (
    <html lang="pt-BR" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased">
        <style dangerouslySetInnerHTML={{ __html: siteThemeCss(themeConfig) }} />
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
