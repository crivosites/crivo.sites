import path from "node:path"

/** Pasta onde as fotos enviadas pelo painel são gravadas. */
export const uploadsDir = path.join(process.cwd(), "content", "uploads")

/** Formatos aceitos no upload (content-type -> extensão). */
export const imageExtensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
}

/** Extensão -> content-type usado ao servir o arquivo. */
export const extensionTypes: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  avif: "image/avif",
}

/**
 * Copia bytes para um ArrayBuffer "puro".
 *
 * `Response` não aceita `Uint8Array<ArrayBufferLike>` diretamente; este helper
 * entrega um ArrayBuffer comum, aceito como corpo em todas as versões do Node.
 */
export function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new ArrayBuffer(bytes.byteLength)
  new Uint8Array(copy).set(bytes)
  return copy
}

/** Limite de tamanho por foto (8 MB). */
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024

/** Quantas fotos podem ir de uma vez no envio em lote. */
export const MAX_BATCH_FILES = 30

/** Gera um nome de arquivo seguro e único a partir do nome original. */
export function safeFileName(originalName: string, extension: string): string {
  const base = (originalName || "foto")
    .replace(/\.[^.]+$/, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
  const unique = Math.random().toString(36).slice(2, 10)
  return `${Date.now()}-${base || "foto"}-${unique}.${extension}`
}

/** Um nome de arquivo seguro para leitura (sem barras nem ".."). */
export function isSafeUploadName(name: string): boolean {
  return /^[a-z0-9][a-z0-9._-]*$/.test(name) && !name.includes("..")
}
