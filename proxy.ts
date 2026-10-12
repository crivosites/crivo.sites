import { NextResponse, type NextRequest } from "next/server"

/**
 * Rota oculta do painel.
 *
 * Configure ADMIN_PATH em .env.local (ex: ADMIN_PATH=/gestao-9f2c).
 * O endereço real do painel passa a ser esse; /painel responde 404
 * para quem tentar adivinhar. A rota também está fora do robots.txt.
 */
const adminPath = (process.env.ADMIN_PATH || "/painel-interno").replace(/\/+$/, "")

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (adminPath && (pathname === adminPath || pathname.startsWith(`${adminPath}/`))) {
    const url = request.nextUrl.clone()
    url.pathname = `/painel${pathname.slice(adminPath.length)}`
    return NextResponse.rewrite(url)
  }

  if (pathname === "/painel" || pathname.startsWith("/painel/")) {
    return NextResponse.rewrite(new URL("/_not-found", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|apple-icon.png|opengraph-image).*)"],
}
