import { readStoredConfig } from "@/lib/config-store"
import type { SiteConfig } from "@/lib/site-config"

/**
 * Lê o conteúdo do site a cada requisição.
 *
 * - Com `GITHUB_REPO`/`GITHUB_TOKEN` definidos, lê o `content/site-config.json` mais
 *   recente do repositório — então o que o painel salva aparece no site na hora,
 *   mesmo em host serverless, sem recompilar.
 * - Sem essas variáveis, lê o arquivo do disco (Node/VPS) e, se ele não existir no
 *   runtime, cai no conteúdo embutido no bundle — o site continua funcionando.
 */
export async function readSiteConfig(): Promise<SiteConfig> {
  const { config } = await readStoredConfig()
  return config
}
