import { readFile } from "node:fs/promises"
import path from "node:path"
import { githubStoreConfig, githubUploadPath, readGithubFile } from "@/lib/config-store"
import { extensionTypes, isSafeUploadName, toArrayBuffer, uploadsDir } from "@/lib/uploads"

/**
 * Serve as fotos enviadas pelo painel.
 *
 * - Com o GitHub configurado, lê a foto do repositório (fonte única — é o caso da
 *   Vercel, onde o disco é somente-leitura).
 * - Sem GitHub, serve o arquivo do disco local (host com disco gravável).
 */
export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const immutable = { "Cache-Control": "public, max-age=31536000, immutable" }

export async function GET(_request: Request, context: { params: Promise<{ name: string }> }) {
  const { name } = await context.params
  if (!isSafeUploadName(name)) {
    return new Response("Not found", { status: 404 })
  }

  const extension = name.split(".").pop()?.toLowerCase() ?? ""
  const contentType = extensionTypes[extension]
  if (!contentType) {
    return new Response("Not found", { status: 404 })
  }

  // 1) GitHub (quando o painel grava lá).
  const github = githubStoreConfig()
  if (github) {
    try {
      const remote = await readGithubFile(github, githubUploadPath(name))
      if (remote) {
        return new Response(toArrayBuffer(remote.bytes), { headers: { "Content-Type": contentType, ...immutable } })
      }
    } catch {
      // Rede/credencial fora: tenta o disco local antes de desistir.
    }
  }

  // 2) Disco local.
  try {
    const file = await readFile(path.join(uploadsDir, name))
    return new Response(new Uint8Array(file), { headers: { "Content-Type": contentType, ...immutable } })
  } catch {
    return new Response("Not found", { status: 404 })
  }
}
