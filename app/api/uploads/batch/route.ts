import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { adminGuard } from "@/lib/admin-guard"
import { githubStoreConfig, githubUploadPath, writeGithubFiles, type GithubFileEntry } from "@/lib/config-store"
import { MAX_BATCH_FILES, MAX_UPLOAD_BYTES, imageExtensions, safeFileName, uploadsDir } from "@/lib/uploads"

/**
 * Recebe VÁRIAS fotos de uma vez (envio em lote do painel).
 *
 * - Com o GitHub configurado, grava todas em **um único commit** (1 deploy, não N).
 * - Sem GitHub, grava todas no disco local.
 *
 * Devolve a lista de URLs na mesma ordem dos arquivos enviados — o painel usa cada
 * URL para criar um item novo (ex.: Portfólio), uma foto por campo.
 */
export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const noStore = { "Cache-Control": "no-store" }

export async function POST(request: Request) {
  const blocked = adminGuard(request)
  if (blocked) return blocked

  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return Response.json({ message: "Envio inválido." }, { status: 400, headers: noStore })
  }

  const files = form.getAll("files").filter((item): item is File => item instanceof File)
  if (files.length === 0) {
    return Response.json({ message: "Selecione ao menos uma imagem." }, { status: 400, headers: noStore })
  }
  if (files.length > MAX_BATCH_FILES) {
    return Response.json(
      { message: `Envie no máximo ${MAX_BATCH_FILES} fotos de uma vez.` },
      { status: 413, headers: noStore },
    )
  }

  const prepared: { filename: string; bytes: Uint8Array }[] = []
  for (const file of files) {
    const extension = imageExtensions[file.type]
    if (!extension) {
      return Response.json(
        { message: `“${file.name}”: formato não aceito. Envie JPG, PNG, WEBP, GIF ou AVIF.` },
        { status: 415, headers: noStore },
      )
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return Response.json(
        { message: `“${file.name}”: a imagem passa de 8 MB. Reduza o tamanho e tente novamente.` },
        { status: 413, headers: noStore },
      )
    }
    prepared.push({ filename: safeFileName(file.name, extension), bytes: new Uint8Array(await file.arrayBuffer()) })
  }

  const urls = prepared.map((item) => `/api/uploads/${item.filename}`)

  // 1) GitHub: todas as fotos em um único commit.
  const github = githubStoreConfig()
  if (github) {
    try {
      const entries: GithubFileEntry[] = prepared.map((item) => ({
        path: githubUploadPath(item.filename),
        bytes: item.bytes,
      }))
      await writeGithubFiles(github, entries, `chore(fotos): adiciona ${entries.length} foto(s) pelo painel`)
      return Response.json({ urls, count: urls.length }, { headers: noStore })
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error)
      return Response.json(
        {
          message:
            `Não foi possível enviar as fotos para o GitHub (${detail}). O painel tentou o repositório ` +
            `“${github.repo}” (branch “${github.branch}”): confira se o GITHUB_TOKEN é válido e tem a ` +
            "permissão “Contents: Read and write” nesse repositório.",
        },
        { status: 501, headers: noStore },
      )
    }
  }

  // 2) Disco local.
  try {
    await mkdir(uploadsDir, { recursive: true })
    for (const item of prepared) {
      await writeFile(path.join(uploadsDir, item.filename), item.bytes)
    }
    return Response.json({ urls, count: urls.length }, { headers: noStore })
  } catch {
    return Response.json(
      {
        message:
          "Este ambiente não permite gravar arquivos. Defina GITHUB_TOKEN para enviar as fotos pelo " +
          "painel (na Vercel o repositório é identificado sozinho). Enquanto isso, use uma imagem por URL.",
      },
      { status: 501, headers: noStore },
    )
  }
}
