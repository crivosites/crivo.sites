import type { MetadataRoute } from "next"
import { siteUrl } from "@/lib/site-config"

export default function robots(): MetadataRoute.Robots {
  const adminPath = process.env.ADMIN_PATH || "/painel-interno"
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [adminPath, "/painel", "/api/"],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
    host: siteUrl(),
  }
}
