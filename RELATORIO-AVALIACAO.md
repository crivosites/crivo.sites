# Relatório completo de avaliação — One-Page Modelo (Busca Vida Garden)

- **Data:** 11/10/2026
- **Revisão avaliada:** `fe2023e` — *fix(dev): autoriza origens de preview (allowedDevOrigins)*
- **Stack:** Next.js 16.4 (App Router, Turbopack) · React 19 · Tailwind CSS 4 · shadcn/ui · next-themes · pnpm

## O que este projeto É (contexto do produto)

Não é um site de uma empresa: é um **template-one-page reutilizável** para atender
**centenas de clientes de nichos diferentes**. Isso define como ele deve ser avaliado:

- **Todo o conteúdo vive em um único arquivo** (`content/site-config.json`) e o código nunca muda
  entre clientes — troca-se só o JSON (ou a IA o reescreve a partir dos dados do novo cliente).
- **Sem banco e sem login: decisão do produto.** O painel é a ferramenta de autoria, protegido por
  **rota oculta** + verificação de origem + chave opcional.
- **Sem imagens de propósito:** para o template não confundir com o nicho errado. As fotos entram
  depois, pelo próprio painel (bloco “Portfólio”), e aparecem no site automaticamente.
- O conteúdo atual (Busca Vida Garden) é **exemplo de preenchimento**, não conteúdo final de cliente.

**Método (tudo executado):** `pnpm install --frozen-lockfile` → `eslint .` → `tsc --noEmit` →
`next build` → `next start` (3100) e `next dev` (3000); testes HTTP em todas as rotas e APIs;
inspeção do HTML renderizado, do JSON-LD e do tamanho real dos assets; cálculo de contraste WCAG.

---

## 1. Notas

| Enquadramento | Nota | Leitura |
|---|---|---|
| **Como template/modelo** (o que ele é) | **8,2 / 10** | Reusável, painel completo, SEO forte, docs — pronto para escalar |
| **Como site entregue** (Busca Vida Garden hoje) | **8,0 / 10** | Limitado só pelo conteúdo, que depende exclusivamente do dono |
| *Nota do relatório anterior, sem este contexto* | *7,8 / 10* | Penalizava como defeito o que é decisão de projeto |

| # | Critério | Nota | Observação |
|---|---|---|---|
| 1 | Design e UI | 8,5 | Layout moderno, responsivo, tema claro/escuro, animações |
| 2 | Conteúdo e copy | 8,0 | pt-BR bom e persuasivo; instância atual é exemplo |
| 3 | Painel / autoria | 9,0 | 9 seções editáveis na ordem de leitura; upload de fotos testado |
| 4 | SEO e compartilhamento | 9,0 | OG/Twitter, sitemap, robots, canonical, JSON-LD, ícones, capa 1200×630 |
| 5 | Performance | 7,0 | CSS caiu de 21 KB → 10,4 KB (gzip); JS é o runtime Next/React |
| 6 | Acessibilidade | 8,0 | Skip link, `lang=pt-BR`, rótulos em PT; contraste agora passa AA ✅ |
| 7 | Segurança (por design) | 7,5 | Rota oculta + origem + chave opcional; risco residual documentado |
| 8 | Qualidade do código | 8,5 | Código morto e deps removidos; 26 testes + CI ✅ |
| 9 | **Reusabilidade como template** | 9,5 | JSON único + merge tolerante a campos faltando + guia de novo cliente |

---

## 2. O que faz deste um bom template (o diferencial)

- **Fonte única de conteúdo + merge tolerante:** `mergeSiteConfig()` preenche qualquer campo
  ausente com um esqueleto neutro — um JSON incompleto **nunca** quebra o site. É o que permite a IA
  gerar conteúdo para um cliente novo sem tocar no código.
- **Painel na ordem em que o visitante lê:** editar, adicionar, reordenar e **excluir** qualquer
  item em qualquer seção (era um requisito explícito seu, e está cumprido).
- **SEO completo de fábrica:** canonical, OpenGraph/Twitter com imagem 1200×630 gerada no build,
  sitemap, robots, `themeColor`, ícones e **JSON-LD** (`Store` + `WebSite` + `FAQPage` +
  `OpeningHoursSpecification`) derivado do JSON.
- **Portfólio opcional e autocontrolado:** sem fotos, a seção e o item de menu **desaparecem
  sozinhos** — o site nunca mostra seção vazia.
- **Sem banco:** conteúdo versionado em arquivo; zero migrations, zero infraestrutura.
- **Documentação de reuso:** `README.md` + `docs/COMO-CRIAR-SITE-NOVO.md`.

---

## 3. Evidências verificadas nesta revisão

| Verificação | Comando / rota | Resultado |
|---|---|---|
| Instalação limpa | `pnpm install --frozen-lockfile` | ✅ exit 0, lockfile preservado |
| Lint / Tipos | `eslint .` · `tsc --noEmit` | ✅ exit 0 · exit 0 |
| Build de produção | `next build` | ✅ 8 rotas, TypeScript validado no build |
| Página inicial | `GET /` | ✅ 200 · HTML 127 KB (23 KB gzip) |
| Painel oculto | `GET /painel` | ✅ **404** proposital |
| Painel por rota secreta | `GET /gestao-secreta` | ✅ 200 |
| Sitemap / robots / capa / ícones | `/sitemap.xml` `/robots.txt` `/opengraph-image` `/icon.svg` `/favicon.ico` | ✅ todos 200 |
| API de conteúdo | `GET /api/site-config` | ✅ 200 (antes: 500 sem banco) |
| Escrita de outro domínio | `PUT` com `Origin` externo | ✅ **403** |
| Escrita sem chave (com `ADMIN_KEY`) | `PUT` sem `x-admin-key` | ✅ **401** |
| **Upload de portfólio** | `POST /api/uploads` (PNG) | ✅ 200 → `{url:"/api/uploads/…png"}` |
| **Foto servida** | `GET /api/uploads/…png` | ✅ 200 `image/png` |
| **Formato inválido** | `POST` de `.txt` | ✅ **415** |
| **Upload de outra origem** | `POST` com `Origin` externo | ✅ **403** |
| Host de preview | `Host: pv-…style.dev` | ✅ 200 (hidratação liberada) |

---

## 4. O que já estava resolvido desde o relatório antigo (5,2 → 8,1)

Todos os P0 antigos foram corrigidos, e a maior parte dos P1 também: painel controlando as 9
seções; cores aplicadas de verdade (`siteThemeCss`); API sem 500 (fallback para o JSON embutido);
`/painel` → 404 com rota oculta via `proxy.ts`; escrita protegida por origem + chave; SEO completo;
WhatsApp unificado em `…2070`; mapa com endereço real; hero sem re-render por `mousemove`;
`ignoreBuildErrors` removido; ESLint funcionando; ~6,6 MB de imagens órfãs removidas;
`public/` de 6,6 MB → 12 KB; README + `.env.example` + guia de novo cliente; rótulos traduzidos e
skip link.

---

## 4.1 Sprint 2 — executada (11/10/2026)

Método: tudo medido no build de produção (`next build` + `next start`), comparando o mesmo
procedimento antes e depois.

| Item da Sprint 2 | Antes | Depois |
|---|---|---|
| Componentes `ui` | 56 arquivos (7 em uso) | **6 arquivos, todos em uso** (49 removidos) |
| Dependências | 32 deps + 12 devDeps | **12 deps + 11 devDeps** (20 pacotes removidos) |
| CSS da 1ª carga (gzip) | 21,1 KB | **10,4 KB** (−51%) |
| JS da 1ª carga (gzip) | 211,6 KB | 211,6 KB (**sem mudança**) |
| Contraste WCAG AA (tema claro) | 3,25:1 — **reprovava** | **4,51:1 — passa** |
| Contraste texto-botão (tema escuro) | 3,32:1 — **reprovava** | **6,32:1 — passa** |
| Testes automatizados | 0 | **26 testes** (Vitest) |
| CI | inexistente | **GitHub Actions** (lint + tipos + testes + build) |

**Detalhes do que foi feito**

1. **Código morto removido.** Apaguei os 49 componentes `components/ui/*` e os hooks
   (`hooks/use-*`, `components/ui/use-*`) que não eram alcançáveis a partir do site nem do painel.
   Os 6 mantidos são `button`, `card`, `input`, `label`, `sheet` e `textarea`.
2. **Dependências enxugadas.** Removidas as 20 sem nenhum uso — incluindo `pg` (resquício da versão
   com banco), `recharts`, `react-hook-form`, `zod`, `date-fns`, `sonner`, `vaul`, `input-otp`,
   `react-day-picker`, `embla-carousel-react` e 24 pacotes `@radix-ui/*` não usados. Adicionado
   `vitest`.
3. **Contraste AA garantido por construção.** Novo `lib/colors.ts` deriva, a partir da cor de marca
   escolhida no painel, duas variações com contraste ≥ 4,5:1 (clara para o tema claro, escura para o
   escuro) e escolhe automaticamente o texto sobre os botões. Vale para **qualquer** cor de cliente,
   não só para o verde atual.
4. **Testes + CI.** 26 testes cobrindo `mergeSiteConfig` (conteúdo incompleto não quebra o site),
   `adminGuard` (origem/chave) e a garantia de contraste. Workflow `.github/workflows/ci.yml` roda
   lint, tipos, testes e build a cada push/PR.

**Leitura honesta da performance:** o JS **não** diminuiu. Os componentes Radix removidos já não
entravam no bundle (tree-shaking do Next), então o ganho foi em **CSS, tamanho das dependências,
tempo de instalação e superfície de risco** — não em bytes de JS. Reduzir o JS exigiria mexer no
runtime Next/React, que é o que ocupa os blocos maiores (~72 KB e ~44 KB gzip).

**Verificação executada após as mudanças:** `pnpm lint` ✅ · `pnpm typecheck` ✅ ·
`pnpm test` (26/26) ✅ · `pnpm build` (8 rotas) ✅ · rotas `/`, `/robots.txt`, `/sitemap.xml`,
`/api/site-config` → 200; `/painel` → 404; `/gestao-secreta` → 200.

---

## 5. O que ainda dá para melhorar (por impacto real)

### 🔴 Prioridade 1 — o que faz seu cliente pagar e o cliente dele converter

1. **Preencher a instância com conteúdo real do cliente.** O template está pronto; o site de
   produção depende só disso: **fotos reais** (subir pelo painel, bloco Portfólio), **depoimentos
   verdadeiros** e **números honestos** (hoje “50+ / 45+ / 30+ / 3+” são exemplo). Este é o item de
   maior impacto — e é 100% conteúdo, não código.

2. **Endereço textual + coordenadas.** O `geo` (latitude/longitude) está vazio no JSON-LD; sem ele
   o site perde força no pacote local do Google (mapa). Preencher as coordenadas da loja.

### 🟠 Prioridade 2 — produto e performance

3. ✅ *(parcial na Sprint 2 — CSS −51%; JS inalterado)* **Peso de JavaScript alto para uma landing.** Na primeira carga o navegador baixa ~660 KB de JS
   bruto (**~215 KB gzip**) + 21 KB de CSS. Como o template roda para **centenas de clientes**, vale
   medir com Lighthouse e cortar o Radix/shadcn que não é usado — o ganho se multiplica por cliente.

4. ✅ *(resolvido na Sprint 2)* **Código e dependências mortas.** Apenas **7 de 56** arquivos em `components/ui/` são importados
   (~49 sem uso) e **10 dependências** não têm nenhum import: `pg`, `recharts`,
   `embla-carousel-react`, `react-hook-form`, `zod`, `sonner`, `vaul`, `input-otp`,
   `react-day-picker`, `date-fns`. Num template replicado, isso é peso e superfície de risco “por
   cópia”.

5. ✅ *(resolvido na Sprint 2)* **Sem testes automatizados.** `mergeSiteConfig` e `adminGuard` são o coração do template e não
   têm teste. Um teste mínimo (Vitest) + CI protegeria as centenas de sites futuros.

### 🟡 Prioridade 3 — polimento

6. ✅ *(resolvido na Sprint 2)* **Contraste WCAG AA reprovado no tema claro:** verde `#3f9f5b` sobre `#fbfdf9` = **3,25:1**
   (mínimo 4,5:1 para texto normal). Afeta eyebrows, links e rótulos em verde. No tema escuro o
   mesmo verde dá **5,96:1** e passa. `foreground` (15,99:1) e `muted-foreground` (5,06:1) estão ok.

7. **Tema padrão escuro:** `defaultTheme="dark"` num site cuja paleta de marca é clara — decisão
   válida (o verde contrasta melhor no escuro), mas consciente: a cor de fundo clara do JSON não
   aparece para quem chega.

8. **`eslint.config.mjs` ignora `components/ui/**` e `hooks/**`** — razoável (código vendorizado),
   mas o lint passa sem cobrir ~56 arquivos.

---

## 6. Riscos aceitos por decisão de projeto (não são defeitos)

- **Sem banco/login.** Escrita protegida por **origem (403)** e, quando `ADMIN_KEY` está definida,
  por **chave (401)** — verificado. *Risco residual:* com `ADMIN_KEY` **não** definida, um cliente
  que não seja navegador pode sobrescrever o conteúdo (reproduzi um `PUT` sem `Origin` que regravou
  o JSON; restaurei via `git checkout`). Recomendação mínima: definir `ADMIN_KEY` em produção.
- **Rota oculta** é obscuridade, não autenticação — coerente com o escopo do produto.
- **Sem fotos no template** — intencional; a instância de cada cliente recebe as fotos pelo painel.

---

## 7. Roadmap sugerido

**Sprint 1 — deixar um cliente pronto para vender (P1)**
- Preencher fotos, depoimentos e números reais via painel (sem tocar em código).
- Definir `ADMIN_KEY` na publicação.
- Preencher latitude/longitude para SEO local.

**Sprint 2 — escalar o template com qualidade (P2)**
- Medir Lighthouse e cortar Radix não usado (ganho multiplicado por cliente).
- Remover ~49 componentes `ui` e ~10 dependências sem uso.
- Testes de `mergeSiteConfig`/`adminGuard` + CI.
- Ajustar o verde de marca no tema claro para ≥ 4,5:1.

**Sprint 3 — polir (P3)**
- Decidir o tema padrão; revisar cobertura de lint.

---

## 8. Ganhos rápidos (menos de 1 hora)

| Ação | Impacto |
|---|---|
| Subir fotos + depoimentos reais pelo painel | **Altíssimo** (conversão e credibilidade) |
| Definir `ADMIN_KEY` na publicação | Alto (bloqueia escrita anônima) |
| Preencher lat/long no JSON | Médio (SEO local) |
| Remover deps e componentes `ui` sem uso | Médio (peso e risco, replicado por cliente) |
| Corrigir contraste do verde no tema claro | Médio (acessibilidade/AA) |
