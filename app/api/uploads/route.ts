import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { adminGuard } from "@/lib/admin-guard"
import { githubStoreConfig, githubUploadPath, writeGithubFile } from "@/lib/config-store"
import { MAX_UPLOAD_BYTES, imageExtensions, safeFileName, uploadsDir } from "@/lib/uploads"

/**
 * Recebe as fotos do painel.
 *
 * - Com o GitHub configurado (`GITHUB_TOKEN`), grava a foto em `content/uploads/`
 *   **dentro do repositório** — é o que funciona em host serverless (Vercel), onde o
 *   disco é somente-leitura. A imagem vira parte do repositório do próprio site.
 * - Sem GitHub, grava no disco local (host com disco gravável: VPS/Docker/`pnpm start`).
 *
 * Em ambos os casos devolve a mesma URL (`/api/uploads/<arquivo>`), que o painel
 * coloca no campo da foto — então a imagem aparece no site na hora, sem recompilar.
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

  const file = form.get("file")
  if (!(file instanceof File)) {
    return Response.json({ message: "Selecione um arquivo de imagem." }, { status: 400, headers: noStore })
  }

  const extension = imageExtensions[file.type]
  if (!extension) {
    return Response.json(
      { message: "Formato não aceito. Envie JPG, PNG, WEBP, GIF ou AVIF." },
      { status: 415, headers: noStore },
    )
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return Response.json({ message: "A imagem passa de 8 MB. Reduza o tamanho e tente novamente." }, { status: 413, headers: noStore })
  }

  const filename = safeFileName(file.name, extension)
  const bytes = new Uint8Array(await file.arrayBuffer())

  // 1) GitHub: grava a foto no repositório do site (caso da Vercel).
  const github = githubStoreConfig()
  if (github) {
    try {
      await writeGithubFile(
        github,
        githubUploadPath(filename),
        bytes,
        `chore(fotos): adiciona ${filename} pelo painel`,
      )
      return Response.json({ url: `/api/uploads/${filename}`, bytes: bytes.length }, { headers: noStore })
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error)
      return Response.json(
        {
          message:
            `Não foi possível enviar a foto para o GitHub (${detail}). O painel tentou o repositório ` +
            `“${github.repo}” (branch “${github.branch}”): confira se o GITHUB_TOKEN é válido e tem a ` +
            "permissão “Contents: Read and write” nesse repositório.",
        },
        { status: 501, headers: noStore },
      )
    }
  }

  // 2) Disco local (host com disco gravável).
  try {
    await mkdir(uploadsDir, { recursive: true })
    await writeFile(path.join(uploadsDir, filename), bytes)
    return Response.json({ url: `/api/uploads/${filename}`, bytes: bytes.length }, { headers: noStore })
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
