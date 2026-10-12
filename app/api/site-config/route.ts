import { adminGuard } from "@/lib/admin-guard"
import { mergeSiteConfig } from "@/lib/site-config"
import { readStoredConfig, writeStoredConfig } from "@/lib/config-store"

/**
 * API usada SOMENTE pelo painel de conteúdo.
 * Fonte única: content/site-config.json — no disco local ou no repositório do
 * GitHub (quando GITHUB_REPO/GITHUB_TOKEN estão definidos, ver lib/config-store.ts).
 */
export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const noStore = { "Cache-Control": "no-store" }

export async function GET(request: Request) {
  // O painel só abre com a senha: sem `x-admin-key` correto, nada de conteúdo.
  const blocked = adminGuard(request)
  if (blocked) return blocked

  const { config } = await readStoredConfig({ fresh: true })
  return Response.json(config, { headers: noStore })
}

export async function PUT(request: Request) {
  const blocked = adminGuard(request)
  if (blocked) return blocked

  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return Response.json({ message: "JSON inválido." }, { status: 400, headers: noStore })
  }

  const config = mergeSiteConfig(payload)
  const result = await writeStoredConfig(config)
  if (!result.ok) {
    return Response.json({ message: result.message }, { status: 501, headers: noStore })
  }
  return Response.json(config, { headers: noStore })
}
