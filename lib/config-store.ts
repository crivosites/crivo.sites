import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { mergeSiteConfig, siteConfig, type SiteConfig } from "@/lib/site-config"

/**
 * Onde o conteúdo do site é lido e gravado.
 *
 * - Em qualquer host com disco gravável (VPS, Docker, `pnpm start` local), o painel
 *   grava direto em `content/site-config.json`.
 * - Em ambientes **serverless** (Vercel, Netlify, etc.) o disco é somente-leitura: a
 *   gravação falha e o conteúdo se perde. Para esses casos, defina `GITHUB_REPO` e
 *   `GITHUB_TOKEN` e o painel passa a gravar o próprio `content/site-config.json` no
 *   repositório via API do GitHub. O site lê a versão mais recente de lá a cada
 *   requisição, então o "Salvar" já aparece no site sem precisar recompilar.
 *
 * Sobre o repositório: defina `GITHUB_REPO` ("dono/repo") **ou** deixe em branco — quando o
 * site roda na Vercel, o próprio deployment informa em qual repositório está
 * (`VERCEL_GIT_REPO_OWNER` + `VERCEL_GIT_REPO_SLUG`), então cada site clonado do template
 * já sabe sozinho onde gravar. Basta o token (`GITHUB_TOKEN`).
 */

const DEFAULT_CONFIG_PATH = "content/site-config.json"
const DEFAULT_BRANCH = "main"
const COMMIT_MESSAGE = "chore(conteudo): atualiza content/site-config.json pelo painel"
const API_VERSION = "2022-11-28"

/** Caminho absoluto do JSON de conteúdo no disco. */
export function configFilePath(): string {
  // Caminho fixo (literal) para o bundler saber exatamente o que empacotar.
  return path.join(process.cwd(), "content", "site-config.json")
}

export type ConfigSource = "github" | "file" | "bundle"

export interface GithubStoreConfig {
  /** "dono/repositorio" */
  repo: string
  token: string
  branch: string
  /** Caminho do arquivo dentro do repositório. */
  configPath: string
}

type FetchLike = typeof fetch

/** Variáveis de ambiente (aceita objeto parcial nos testes). */
type EnvLike = Record<string, string | undefined>

/** Valida e devolve "dono/repo", ou null quando o formato está inválido. */
function validRepo(value: string | undefined): string | null {
  const repo = (value ?? "").trim()
  if (!/^[^\s/]+\/[^\s/]+$/.test(repo)) return null
  return repo
}

/**
 * Descobre em qual repositório o painel deve gravar.
 *
 * 1. `GITHUB_REPO` (quando definido) tem prioridade — útil em host que não é Vercel.
 * 2. Sem ele, usa o repositório que a Vercel informa para este deployment
 *    (`VERCEL_GIT_REPO_OWNER` + `VERCEL_GIT_REPO_SLUG`). É isto que faz cada site
 *    clonado do template saber sozinho qual é o seu repositório, sem configurar nada.
 */
export function resolveGithubRepo(env: EnvLike = process.env): string | null {
  const explicit = validRepo(env.GITHUB_REPO)
  if (explicit) return explicit

  const owner = env.VERCEL_GIT_REPO_OWNER?.trim()
  const slug = env.VERCEL_GIT_REPO_SLUG?.trim()
  if (!owner || !slug) return null
  return validRepo(`${owner}/${slug}`)
}

/** Lê a configuração do GitHub a partir do ambiente (ou null quando não configurada). */
export function githubStoreConfig(env: EnvLike = process.env): GithubStoreConfig | null {
  const repo = resolveGithubRepo(env)
  const token = env.GITHUB_TOKEN?.trim()
  if (!repo || !token) return null
  return {
    repo,
    token,
    branch: env.GITHUB_BRANCH?.trim() || DEFAULT_BRANCH,
    configPath: normalizeConfigPath(env.GITHUB_CONFIG_PATH),
  }
}

/** True quando o painel pode gravar no GitHub via API. */
export function isGithubStoreConfigured(env: EnvLike = process.env): boolean {
  return githubStoreConfig(env) !== null
}

/** Garante um caminho relativo simples ("content/site-config.json"). */
export function normalizeConfigPath(value: string | undefined): string {
  const raw = (value ?? "").trim().replace(/^\/+/, "")
  if (!raw || raw.includes("..")) return DEFAULT_CONFIG_PATH
  return raw
}

/** URL da API de conteúdo do GitHub para um arquivo qualquer do repositório. */
function githubApiContentsUrl(config: GithubStoreConfig, filePath: string): string {
  const clean = filePath.replace(/^\/+/, "")
  return `https://api.github.com/repos/${config.repo}/contents/${clean}`
}

/** URL da API de conteúdo (com referência) para um arquivo qualquer do repositório. */
export function githubPathUrl(config: GithubStoreConfig, filePath: string, ref?: string): string {
  const branch = ref ?? config.branch
  return `${githubApiContentsUrl(config, filePath)}?ref=${encodeURIComponent(branch)}`
}

/** URL da API de conteúdo do GitHub para o arquivo de configuração e a referência informados. */
export function githubContentsUrl(config: GithubStoreConfig, ref?: string): string {
  return githubPathUrl(config, config.configPath, ref)
}

/** Pasta (dentro do repositório) onde o painel grava as fotos enviadas. */
export const GITHUB_UPLOADS_DIR = "content/uploads"

/** Caminho de uma foto enviada dentro do repositório. */
export function githubUploadPath(fileName: string): string {
  return `${GITHUB_UPLOADS_DIR}/${fileName.replace(/^\/+/, "")}`
}

function githubHeaders(config: GithubStoreConfig, accept: string): Record<string, string> {
  return {
    Authorization: `Bearer ${config.token}`,
    Accept: accept,
    "X-GitHub-Api-Version": API_VERSION,
    "User-Agent": "onepageteste-painel",
  }
}

/** Conteúdo do JSON no formato gravado (2 espaços + quebra final). */
export function serializeConfig(config: SiteConfig): string {
  return `${JSON.stringify(config, null, 2)}\n`
}

/** Lê o JSON do repositório. Retorna null quando o arquivo ainda não existe lá. */
export async function readGithubConfig(
  config: GithubStoreConfig,
  fetchImpl: FetchLike = fetch,
): Promise<SiteConfig | null> {
  const response = await fetchImpl(githubContentsUrl(config), {
    headers: githubHeaders(config, "application/vnd.github.raw+json"),
    cache: "no-store",
  })
  if (response.status === 404) return null
  if (!response.ok) throw new Error(`GitHub ${response.status}`)
  const text = await response.text()
  return mergeSiteConfig(JSON.parse(text))
}

async function readGithubSha(
  config: GithubStoreConfig,
  filePath: string,
  fetchImpl: FetchLike,
): Promise<string | null> {
  const response = await fetchImpl(githubPathUrl(config, filePath), {
    headers: githubHeaders(config, "application/vnd.github+json"),
    cache: "no-store",
  })
  if (response.status === 404) return null
  if (!response.ok) throw new Error(`GitHub ${response.status}`)
  const data = (await response.json()) as { sha?: unknown }
  return typeof data.sha === "string" ? data.sha : null
}

/**
 * Grava um arquivo qualquer (texto ou binário) no repositório — cria ou atualiza.
 * Lança em caso de falha (token inválido, sem permissão, etc.).
 */
export async function writeGithubFile(
  config: GithubStoreConfig,
  filePath: string,
  bytes: Uint8Array,
  message: string,
  fetchImpl: FetchLike = fetch,
): Promise<void> {
  const sha = await readGithubSha(config, filePath, fetchImpl)
  const body: Record<string, unknown> = {
    message,
    content: Buffer.from(bytes).toString("base64"),
    branch: config.branch,
  }
  if (sha) body.sha = sha

  const response = await fetchImpl(githubApiContentsUrl(config, filePath), {
    method: "PUT",
    headers: { ...githubHeaders(config, "application/vnd.github+json"), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!response.ok) {
    const detail = await response.text().catch(() => "")
    throw new Error(`GitHub ${response.status}${detail ? `: ${detail.slice(0, 180)}` : ""}`)
  }
}

/** Grava o JSON de conteúdo no repositório (cria ou atualiza). Lança em caso de falha. */
export async function writeGithubConfig(
  config: GithubStoreConfig,
  content: SiteConfig,
  fetchImpl: FetchLike = fetch,
): Promise<void> {
  await writeGithubFile(
    config,
    config.configPath,
    new TextEncoder().encode(serializeConfig(content)),
    COMMIT_MESSAGE,
    fetchImpl,
  )
}

/**
 * Lê um arquivo do repositório (binário ou texto).
 * Retorna null quando o arquivo ainda não existe lá (404).
 */
export async function readGithubFile(
  config: GithubStoreConfig,
  filePath: string,
  fetchImpl: FetchLike = fetch,
): Promise<{ bytes: Uint8Array; contentType: string } | null> {
  const response = await fetchImpl(githubPathUrl(config, filePath), {
    headers: githubHeaders(config, "application/vnd.github.raw+json"),
    cache: "no-store",
  })
  if (response.status === 404) return null
  if (!response.ok) throw new Error(`GitHub ${response.status}`)
  const bytes = new Uint8Array(await response.arrayBuffer())
  const contentType = response.headers.get("content-type")?.split(";")[0]?.trim() || "application/octet-stream"
  return { bytes, contentType }
}

/** Lê o JSON do disco local. */
async function readLocalConfig(): Promise<{ config: SiteConfig; source: ConfigSource }> {
  try {
    const raw = await readFile(configFilePath(), "utf8")
    return { config: mergeSiteConfig(JSON.parse(raw)), source: "file" }
  } catch {
    return { config: siteConfig, source: "bundle" }
  }
}

// Cache curto em memória: evita bater na API do GitHub a cada visita sem deixar o
// conteúdo visivelmente velho. É limpo assim que este processo grava algo.
const CACHE_TTL_MS = 15_000
let cache: { config: SiteConfig; source: ConfigSource; expiresAt: number } | null = null

/** Esquece o conteúdo em cache (usado após salvar e nos testes). */
export function clearConfigCache(): void {
  cache = null
}

/**
 * Lê o conteúdo mais recente: do GitHub quando configurado, senão do disco e,
 * em último caso, do conteúdo embutido no bundle.
 *
 * `fresh` ignora o cache (o painel usa isso para mostrar sempre o que está salvo).
 */
export async function readStoredConfig(
  options: { fresh?: boolean } = {},
): Promise<{ config: SiteConfig; source: ConfigSource }> {
  const github = githubStoreConfig()
  if (github) {
    if (!options.fresh && cache && cache.expiresAt > Date.now()) {
      return { config: cache.config, source: cache.source }
    }
    try {
      const remote = await readGithubConfig(github)
      if (remote) {
        cache = { config: remote, source: "github", expiresAt: Date.now() + CACHE_TTL_MS }
        return { config: remote, source: "github" }
      }
    } catch {
      // Rede/credencial fora: segue para o arquivo local (o site nunca fica vazio).
    }
  }
  return readLocalConfig()
}

export type WriteResult =
  | { ok: true; via: "github" | "file" }
  | { ok: false; message: string }

/** Grava o conteúdo no destino configurado (GitHub ou disco local). */
export async function writeStoredConfig(config: SiteConfig): Promise<WriteResult> {
  const github = githubStoreConfig()
  if (github) {
    try {
      await writeGithubConfig(github, config)
      clearConfigCache()
      return { ok: true, via: "github" }
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error)
      return {
        ok: false,
        message:
          `Não foi possível gravar no GitHub (${detail}). O painel tentou o repositório ` +
          `“${github.repo}” (branch “${github.branch}”): confira se o GITHUB_TOKEN é válido e ` +
          "tem permissão “Contents: Read and write” nesse repositório.",
      }
    }
  }

  try {
    await mkdir(path.dirname(configFilePath()), { recursive: true })
    await writeFile(configFilePath(), serializeConfig(config), "utf8")
    clearConfigCache()
    return { ok: true, via: "file" }
  } catch {
    return {
      ok: false,
      message:
        "Este ambiente não permite gravar arquivos. Para salvar direto pelo painel, defina " +
        "GITHUB_TOKEN (na Vercel o repositório é identificado sozinho; veja o README). " +
        "Enquanto isso, use “Baixar JSON” e substitua content/site-config.json no repositório.",
    }
  }
}

/** Um arquivo (caminho no repositório + bytes) para gravar em um único commit. */
export interface GithubFileEntry {
  path: string
  bytes: Uint8Array
}

/**
 * Grava VÁRIOS arquivos em um ÚNICO commit (API de Git do GitHub).
 *
 * Cada arquivo vira um "blob"; todos entram na mesma árvore e no mesmo commit —
 * então 20 fotos geram 1 commit (e 1 deploy) em vez de 20.
 * Lança em caso de falha.
 */
export async function writeGithubFiles(
  config: GithubStoreConfig,
  entries: GithubFileEntry[],
  message: string,
  fetchImpl: FetchLike = fetch,
): Promise<void> {
  if (entries.length === 0) return
  const api = `https://api.github.com/repos/${config.repo}`
  const auth = githubHeaders(config, "application/vnd.github+json")
  const jsonHeaders = { ...auth, "Content-Type": "application/json" }
  const branch = config.branch
  // Ler usa "git/ref/..."; atualizar usa "git/refs/..." (plural) na API do GitHub.
  const readRefPath = `git/ref/heads/${branch}`
  const writeRefPath = `git/refs/heads/${branch}`

  async function readSha(url: string, pick: (data: Record<string, unknown>) => unknown): Promise<string> {
    const response = await fetchImpl(url, { headers: auth, cache: "no-store" })
    if (!response.ok) throw new Error(`GitHub ${response.status}`)
    const value = pick((await response.json()) as Record<string, unknown>)
    if (typeof value !== "string" || !value) throw new Error("GitHub: resposta inesperada")
    return value
  }

  // 1) commit atual da branch -> árvore base
  const headSha = await readSha(`${api}/${readRefPath}`, (data) =>
    (data.object as Record<string, unknown> | undefined)?.sha,
  )
  const baseTree = await readSha(`${api}/git/commits/${headSha}`, (data) =>
    (data.tree as Record<string, unknown> | undefined)?.sha,
  )

  // 2) um blob por arquivo
  const tree: { path: string; mode: string; type: string; sha: string }[] = []
  for (const entry of entries) {
    const response = await fetchImpl(`${api}/git/blobs`, {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({ content: Buffer.from(entry.bytes).toString("base64"), encoding: "base64" }),
    })
    if (!response.ok) throw new Error(`GitHub ${response.status}`)
    const sha = ((await response.json()) as { sha?: unknown }).sha
    if (typeof sha !== "string") throw new Error("GitHub: blob inválido")
    tree.push({ path: entry.path.replace(/^\/+/, ""), mode: "100644", type: "blob", sha })
  }

  // 3) árvore nova em cima da base (sobrescreve quem já existir)
  const treeResponse = await fetchImpl(`${api}/git/trees`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ base_tree: baseTree, tree }),
  })
  if (!treeResponse.ok) throw new Error(`GitHub ${treeResponse.status}`)
  const newTree = ((await treeResponse.json()) as { sha?: unknown }).sha
  if (typeof newTree !== "string") throw new Error("GitHub: árvore inválida")

  // 4) commit apontando para a árvore nova
  const commitResponse = await fetchImpl(`${api}/git/commits`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ message, tree: newTree, parents: [headSha] }),
  })
  if (!commitResponse.ok) throw new Error(`GitHub ${commitResponse.status}`)
  const newCommit = ((await commitResponse.json()) as { sha?: unknown }).sha
  if (typeof newCommit !== "string") throw new Error("GitHub: commit inválido")

  // 5) move a branch para o commit novo
  const moveResponse = await fetchImpl(`${api}/${writeRefPath}`, {
    method: "PATCH",
    headers: jsonHeaders,
    body: JSON.stringify({ sha: newCommit, force: false }),
  })
  if (!moveResponse.ok) throw new Error(`GitHub ${moveResponse.status}`)
}
