/**
 * Origens autorizadas a acessar os recursos do servidor de desenvolvimento.
 *
 * O `next dev` bloqueia, por segurança, o acesso de outras origens aos
 * recursos internos (ex.: /_next/hmr). Sem isso, a página é servida mas o
 * JavaScript do cliente não hidrata — botões, carrossel e menu param de
 * funcionar em previews/hosts diferentes de localhost.
 *
 * Preencha via variável de ambiente (veja .env.example), separando por vírgula:
 *   ALLOWED_DEV_ORIGINS=pv-exemplo.style.dev,localhost,127.0.0.1
 */
const allowedDevOrigins = (process.env.ALLOWED_DEV_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean)

/** @type {import('next').NextConfig} */
const nextConfig = {
  // O build valida os tipos: um conteúdo mal formatado quebra o deploy
  // em vez de gerar um site silenciosamente errado.
  images: {
    unoptimized: true,
  },
  // Esconde o selo "N" do Next.js que fica flutuando sobre a página no
  // servidor de desenvolvimento (padrão: canto inferior esquerdo).
  // Só vale para o `next dev`; no build de produção esse selo não existe.
  devIndicators: false,
  ...(allowedDevOrigins.length ? { allowedDevOrigins } : {}),
}

export default nextConfig
