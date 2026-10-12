/**
 * Proteção das APIs usadas apenas pelo painel de conteúdo.
 *
 * - Origem: recusa requisições de outro domínio (proteção contra CSRF).
 * - Chave: se ADMIN_KEY estiver definida no ambiente, exige o cabeçalho
 *   `x-admin-key` com o mesmo valor.
 *
 * Retorna uma Response de erro quando bloqueado, ou null quando liberado.
 */
const noStore = { "Cache-Control": "no-store" }

/**
 * Host que o navegador usou para chegar até aqui.
 *
 * Preferimos o cabeçalho `Host` (e o `x-forwarded-host` de proxies) em vez de
 * `new URL(request.url).host`: em alguns ambientes (Next 16, atrás de proxy ou
 * com domínio próprio) `request.url` recebe um host interno tipo `localhost:port`,
 * o que faria a comparação com a `Origin` do navegador falhar (403 indevido).
 */
function requestHost(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-host")
  const host = forwarded ?? request.headers.get("host")
  if (host) return host.split(",")[0]!.trim()
  return new URL(request.url).host
}

/** Host da origem do navegador, ou null quando a Origin é inválida. */
function originHost(origin: string): string | null {
  try {
    return new URL(origin).host
  } catch {
    return null
  }
}

export function adminGuard(request: Request): Response | null {
  const origin = request.headers.get("origin")
  if (origin) {
    const fromOrigin = originHost(origin)
    if (!fromOrigin) {
      return Response.json({ message: "Origem inválida." }, { status: 403, headers: noStore })
    }
    if (fromOrigin !== requestHost(request)) {
      return Response.json({ message: "Origem não autorizada." }, { status: 403, headers: noStore })
    }
  }

  const requiredKey = process.env.ADMIN_KEY
  if (requiredKey && request.headers.get("x-admin-key") !== requiredKey) {
    return Response.json({ message: "Chave de acesso inválida." }, { status: 401, headers: noStore })
  }

  return null
}
