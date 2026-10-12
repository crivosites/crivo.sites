# One-Page Modelo — landing page editável

Landing page de página única em **Next.js 16 + React 19 + Tailwind CSS 4**, feita para ser
reutilizada como modelo: **todo o conteúdo do site vive em um único arquivo JSON**
(`content/site-config.json`).

O código do template não muda de cliente para cliente — só o JSON. Isso permite:
- trocar textos, imagens, listas, cores e SEO **sem tocar em código**;
- editar tudo por um **painel web** com pré-visualização de campos;
- versionar o conteúdo junto com o projeto (o JSON é commitado).

O conteúdo atual é o da **Busca Vida Garden** (plantas, vasos e produtos para piscina — Camaçari/BA),
usado como exemplo real de preenchimento.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19 + Tailwind CSS 4 + componentes shadcn/ui |
| Ícones | lucide-react |
| Tema | next-themes (claro/escuro) |
| Conteúdo | JSON (`content/site-config.json`) + painel próprio |
| Analytics | @vercel/analytics |
| Gerência de pacotes | pnpm |

---

## Como rodar

```bash
pnpm install     # instala as dependências (lockfile preservado)
pnpm dev         # servidor de desenvolvimento em http://localhost:3000
pnpm build       # build de produção (valida os tipos)
pnpm start       # sobe o build de produção
pnpm lint        # ESLint
pnpm typecheck   # TypeScript (tsc --noEmit)
pnpm test        # testes de unidade (Vitest)
```

Toda alteração é validada no CI (`.github/workflows/ci.yml`): lint, tipos, testes e build.

> Requer Node.js 20+ e pnpm. Se não tiver o pnpm: `corepack enable` ou `npm i -g pnpm`.

---

## Estrutura do projeto

```
app/
  layout.tsx            # metadata/SEO, fontes, tema, CSS das cores do painel
  page.tsx              # monta a página na ordem das seções
  globals.css           # design tokens (Tailwind) + variáveis de tema
  api/site-config/      # API que lê/grava content/site-config.json (usada pelo painel)
  api/uploads/          # fotos do painel: recebe (uma ou em lote) e serve (disco ou GitHub)
  painel/               # editor de conteúdo (rota oculta — ver abaixo)
  robots.ts, sitemap.ts # SEO
  opengraph-image.tsx   # imagem de compartilhamento 1200x630 gerada no build
components/
  navbar, hero-section, services-section, about-section, process-section,
  testimonials-section, faq-section, contact-section, portfolio-section, footer,
  structured-data.tsx   # JSON-LD LocalBusiness + FAQPage
  painel/field-editor.tsx  # editor genérico de campos (texto, lista, ícone, cor)
content/
  site-config.json      # ✅ FONTE ÚNICA DE CONTEÚDO
  uploads/              # fotos enviadas pelo painel (disco; com GITHUB_TOKEN vão ao repositório)
lib/
  site-config.ts        # tipos, esqueleto neutro, merge e CSS das cores
  panel-sections.ts     # ordem dos blocos no painel + rótulos em português
  config-utils.ts       # utilidades de edição (atualizar/mover/remover itens)
  icons.ts              # mapa de ícones disponíveis no painel
  config-store.ts       # onde o conteúdo é lido/gravado (disco local ou GitHub)
```

---

## Editando o conteúdo

### Opção 1 — painel web (recomendado)

O painel roda em uma **rota oculta** definida por `ADMIN_PATH` (padrão `/painel-interno`).
A rota `/painel` responde **404** de propósito para quem tentar adivinhar, e o caminho
oculto está fora do `robots.txt`.

1. Copie `.env.example` para `.env.local` e ajuste:
   ```bash
   ADMIN_PATH=/seu-caminho-secreto
   ADMIN_KEY=uma-chave-forte             # opcional, mas recomendado
   ```
2. Rode `pnpm dev` e abra `http://localhost:3000/seu-caminho-secreto`.
3. Edite os blocos na ordem em que o visitante lê a página e clique em **Salvar**.
   O painel grava direto em `content/site-config.json`.

O acesso é protegido por:
- **Senha de entrada**: se `ADMIN_KEY` estiver definida, o painel **pede a senha ao abrir** —
  sem ela o conteúdo nem é carregado. O cliente digita uma vez e a senha fica apenas na sessão
  do navegador dele (`sessionStorage`), nunca no código nem no JSON do site.
- **Origem**: requisições de escrita de outro domínio são recusadas (403).
- **Chave**: a API exige o cabeçalho `x-admin-key` com o mesmo valor para ler e para salvar.

> Sem `ADMIN_KEY`, o painel abre direto (útil em desenvolvimento). **Em produção, defina uma
> senha por site** — cada projeto da Vercel tem a sua, então pode ser diferente por cliente.

> ℹ️ Em host com disco gravável (VPS, Docker, `pnpm start` local) o painel grava direto no
> arquivo. Em ambientes **serverless** (Vercel, Netlify, etc.) o disco é somente-leitura: veja
> **“Salvar pelo painel em host serverless”** abaixo para ligar a gravação no GitHub.

### Portfólio de fotos (upload pelo painel)

No bloco **“5. Portfólio (fotos)”** do painel há dois caminhos:
- **Enviar várias fotos** — escolha várias imagens de uma vez; o painel cria um item por foto.
  Na Vercel (com `GITHUB_TOKEN`) todas entram no repositório em **um único commit** (1 deploy).
- **Adicionar** (item a item) — crie um item e:
  1. **Foto** — clique em *Escolher arquivo* e envie a imagem do computador
     (JPG, PNG, WEBP, GIF ou AVIF, até 8 MB). O endereço (`/api/uploads/...`) é
     preenchido automaticamente. Também é possível colar o endereço de uma imagem já hospedada.
  2. **Título**, **Categoria** e **Descrição** — opcionais, mas ajudam no Google e no visual.

Depois, clique em **Salvar** (uma vez salva todas as fotos).

Comportamento automático do site:
- **Com uma ou mais fotos**: a seção `#portfolio` aparece entre “Serviços” e “Sobre nós”,
  em grade responsiva (3 colunas no desktop).
- **Sem nenhuma foto**: a seção **não é exibida** e o item de menu “Portfólio”
  também **desaparece** sozinho — o site nunca mostra uma seção vazia.

> Em host com disco gravável (VPS/Docker/`pnpm start`) a foto vai para `content/uploads/` no disco.
> Em host **serverless** (Vercel), defina `GITHUB_TOKEN` e a foto vai para o repositório do
> próprio site — o painel cria o link sozinho, sem precisar hospedar a imagem fora.

### Salvar pelo painel em host serverless (GitHub)

Em **Vercel/Netlify** o disco é somente-leitura: gravar em `content/site-config.json` no disco
não persiste (o botão Salvar avisa). Para o painel salvar de verdade nesses hosts, aponte a
gravação para o próprio repositório:

1. Crie um **token do GitHub** em *Settings → Developer settings → Fine-grained tokens*, com
   acesso ao repositório do site e permissão **Contents: Read and write**.
2. No host (ex.: Vercel → *Settings → Environment Variables*), defina:
   ```bash
   GITHUB_TOKEN=github_pat_...             # obrigatório
   GITHUB_REPO=seu-usuario/seu-repo        # OPCIONAL na Vercel (ver abaixo)
   GITHUB_BRANCH=main                      # opcional
   GITHUB_CONFIG_PATH=content/site-config.json   # opcional
   ```
   **Na Vercel o `GITHUB_REPO` é opcional:** o próprio deployment informa em qual
   repositório está (`VERCEL_GIT_REPO_OWNER` + `VERCEL_GIT_REPO_SLUG`), então cada site
   clonado do template já sabe sozinho onde gravar — basta o token. Use `GITHUB_REPO`
   quando o host não for Vercel ou para forçar outro repositório (ele tem prioridade).
3. Ao clicar em **Salvar**, o painel grava `content/site-config.json` no repositório (um commit).
   O site lê essa versão a cada requisição, então a alteração aparece **na hora, sem recompilar**.
   Como é um commit, o deploy automático do host também roda e atualiza o SEO do build.

> Sem `GITHUB_REPO`/`GITHUB_TOKEN`, o painel continua funcionando com **Baixar JSON** +
> substituir o arquivo no repositório (aplicado no próximo deploy).

### Segurança do token do GitHub

O token dá **permissão de escrita** no repositório, então trate-o como senha:

- **Só o servidor vê o token.** Ele é lido apenas em `lib/config-store.ts`, nunca em
  componente de cliente. Não use `NEXT_PUBLIC_GITHUB_TOKEN` (isso o embutiria no navegador).
- **Escopo mínimo:** token *fine-grained*, permissão **Contents: Read and write** e
  acesso só aos repositórios necessários. Nada de `admin`, `workflows` ou token clássico (`repo`).
- **Validade:** defina expiração e rotacione. Se vazar, revogue na hora e gere outro.
- **Onde guardar:** nas *Environment Variables* do host (Vercel), de Preferência marcadas
  como **Sensitive**. Nunca em código, `.env` versionado, print ou chat.
- **Barreira automática no repositório:** `tests/no-secrets.test.ts` varre todos os arquivos
  versionados e **falha o CI** se encontrar um token colado por engano. `.env*` já é ignorado
  pelo Git (só o `.env.example`, com nomes e sem valores, é versionado).
- **Recomendado ligar no GitHub:** *Settings → Code security* → **Secret scanning** e
  **Push protection** (bloqueia o envio de segredos antes de subirem).
- **Para escalar (vários repos):** um **GitHub App** gera tokens de 1 hora por repositório —
  não existe segredo de longa duração para vazar.

> Um único token pode cobrir todos os seus repositórios de clientes (mais prático). O custo é
> o raio de alcance: se vazar, vale para todos. Um token por repositório isola o risco.

### Opção 2 — editar o JSON diretamente

Abra `content/site-config.json` e altere os campos. Qualquer campo ausente é preenchido
automaticamente por um esqueleto neutro (`emptySiteConfig` em `lib/site-config.ts`), então o
site nunca quebra por conteúdo incompleto.

---

## Como usar como modelo para outro cliente

1. Substitua o conteúdo em `content/site-config.json` (marca, serviços, contato, SEO, cores).
2. Reaproveite os blocos existentes: hero, serviços, sobre, processo, depoimentos, FAQ,
   contato e rodapé. Cada lista aceita **adicionar, reordenar e remover** itens pelo painel.
3. Ajuste as cores de marca em `colors` (aplicadas via `siteThemeCss` no `<html>`).
   A cor primária informada é convertida automaticamente em duas variações com
   contraste WCAG AA (≥ 4,5:1) — uma para o tema claro e outra para o escuro —
   então qualquer marca continua legível sem ajuste manual.
4. Troque `meta.siteUrl` (ou defina `NEXT_PUBLIC_SITE_URL`) para o domínio final.
5. Os ícones disponíveis estão em `lib/icons.ts` e são escolhidos no painel.

---

## Variáveis de ambiente

Veja `.env.example`. Nenhuma é obrigatória para rodar localmente.

| Variável | Para que serve |
|---|---|
| `ADMIN_PATH` | Caminho oculto do painel (padrão `/painel-interno`) |
| `ADMIN_KEY` | Chave extra exigida no cabeçalho `x-admin-key` para salvar |
| `NEXT_PUBLIC_SITE_URL` | URL pública final do site (SEO, canonical, sitemap) |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Código de verificação do Search Console |
| `GITHUB_REPO` | `dono/repo` do site — **opcional na Vercel** (o repo é deduzido do deployment); tem prioridade quando definido |
| `GITHUB_TOKEN` | Token com permissão `Contents: Read and write` (só no servidor) |
| `GITHUB_BRANCH` | Branch onde o JSON é gravado (padrão `main`, opcional) |
| `GITHUB_CONFIG_PATH` | Caminho do JSON no repositório (padrão `content/site-config.json`, opcional) |

---

## SEO

- `app/layout.tsx`: título, descrição, keywords, canonical, OpenGraph e Twitter Card.
- `app/opengraph-image.tsx`: imagem 1200×630 gerada no build.
- `app/sitemap.ts` e `app/robots.ts`: sitemap e robots (bloqueiam o painel e `/api`).
- `components/structured-data.tsx`: JSON-LD `LocalBusiness` e `FAQPage` a partir do JSON.

---

## Deploy

Aplicação Next.js padrão: qualquer host que rode Node (Vercel, VPS, Docker).

```bash
pnpm build
pnpm start
```

Lembre-se: em host serverless, o disco é somente-leitura. Para o botão **Salvar** funcionar,
configure a gravação no GitHub (seção “Salvar pelo painel em host serverless”).
