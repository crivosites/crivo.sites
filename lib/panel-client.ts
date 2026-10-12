/**
 * Ajuda o painel a enviar a chave de acesso (ADMIN_KEY) quando ela está
 * configurada no servidor.
 *
 * A chave fica guardada apenas na sessão do navegador (sessionStorage) — nunca
 * é embutida no código nem no JSON do site. Sem chave configurada, os
 * cabeçalhos ficam vazios e nada muda para quem não usa `ADMIN_KEY`.
 */
const STORAGE_KEY = "painel-admin-key"

/** Lê a chave salva nesta sessão (string vazia quando não há). */
export function readAdminKey(): string {
  if (typeof window === "undefined") return ""
  try {
    return window.sessionStorage.getItem(STORAGE_KEY) ?? ""
  } catch {
    return ""
  }
}

/** Salva (ou limpa) a chave desta sessão. */
export function saveAdminKey(key: string): void {
  if (typeof window === "undefined") return
  try {
    if (key) window.sessionStorage.setItem(STORAGE_KEY, key)
    else window.sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    /* sessionStorage indisponível: segue sem chave */
  }
}

/** Cabeçalhos extras exigidos pela API do painel (vazio quando não há chave). */
export function adminHeaders(): Record<string, string> {
  const key = readAdminKey()
  return key ? { "x-admin-key": key } : {}
}
