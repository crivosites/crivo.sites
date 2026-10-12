# Relatório de avaliação e melhorias — Busca Vida Garden (onepageteste)

Data: 11/10/2026
Método: leitura de código, inspeção do HTML renderizado, testes de rotas HTTP no servidor local (`next dev`) e build de produção (`next build`).

---

## 1. Nota geral: **5,2 / 10**

A landing page é visualmente bonita e bem escrita, mas ainda é um **protótipo**: o painel administrativo não controla boa parte do site, não há autenticação, e faltam os itens básicos de SEO, deploy e documentação.

| Critério | Nota | O que pesou |
|---|---|---|
| Design e UI | 8,0 | Layout moderno, consistente, responsivo, tema claro/escuro, animações suaves |
| Conteúdo e copy | 7,5 | Textos bons e claros em pt-BR; depoimentos e números parecem inventados |
| Funcionalidade do painel | 3,5 | Metade das seções ignora o painel; edição de cores não tem efeito |
| SEO e compartilhamento | 4,0 | Sem OG/Twitter, sitemap, robots, JSON-LD, favicon; sem URL geolocalizada |
| Performance | 6,0 | 844 KB de JS, re-render a cada movimento do mouse, imagens sem otimização |
| Acessibilidade | 6,0 | Bom uso de `sr-only`/`aria-hidden`, mas rótulos em inglês e sem skip link |
| Segurança | 2,5 | `/painel` aberto e `PUT /api/site-config` sem autenticação nem validação |
| Qualidade do código | 5,0 | Type-check desativado no build, muito código morto, sem README/.env |
| Deploy e robustez | 4,0 | API derruba com 500 sem `DATABASE_URL`; sem migrations nem testes |

---

## 2. Pontos fortes (manter)

- Identidade visual coerente (verde natureza) e hierarquia tipográfica clara.
- Boa copy comercial, orientada a conversão, com CTAs de WhatsApp visíveis.
- Estrutura de seções completa: hero, serviços, sobre, processo, depoimentos, contato, rodapé.
- Tema claro/escuro funcional.
- Build de produção funciona (`next build` OK, 5 páginas geradas).
- Conteúdo já centralizado em `lib/site-config.ts` — boa base para o painel.

---

## 3. Problemas críticos (P0) — corrigir antes de publicar

1. **O painel não controla 4 das 7 seções.**
   `about-section.tsx`, `process-section.tsx`, `testimonials-section.tsx` e `contact-section.tsx` não leem a configuração (zero referências a `config`). O texto do painel diz *"Nenhum conteúdo fica fora do painel"*, mas editar essas seções **não muda nada no site**.

2. **Editar cores não altera o visual.**
   `site-config-provider.tsx` define as variáveis `--site-primary`, `--site-background`, etc., mas **nenhum CSS ou componente consome essas variáveis** (o tema usa `--primary`, `--background`). Resultado: o seletor de cores do painel é decorativo.

3. **`/painel` é público e salva sem autenticação.**
   `PUT /api/site-config` aceita qualquer requisição anônima e sobrescreve todo o conteúdo do site. Hoje qualquer pessoa que descobrir `/painel` pode apagar/alterar a página.

4. **A API quebra (HTTP 500) sem banco configurado.**
   `app/api/site-config/route.ts` cria o `Pool` no topo do módulo e não trata erro. Sem `DATABASE_URL`, `GET /api/site-config` retorna **500** em vez de cair no conteúdo padrão (testado localmente).

5. **Marca aponta para dois números de WhatsApp diferentes.**
   `wa.me/5571999452379` (hero/marca) e `wa.me/5571997092070` (contato). Um dos CTAs leva o cliente para o número errado — precisa unificar.

6. **Link "Conheça nossa loja" aponta para lugar nenhum útil.**
   `hero.secondaryUrl` = `https://www.google.com/maps` (mapa genérico, sem o endereço real) — em vez de um link/embed com o endereço de Catu de Abrantes.

---

## 4. Melhorias importantes (P1)

7. **Type-check desligado no build:** `next.config.mjs` tem `typescript.ignoreBuildErrors: true`. O build passa "escondendo" erros de tipo em vez de corrigi-los.
8. **Sem SEO de compartilhamento:** não há `openGraph`, `twitter:card`, `metadataBase` nem imagem de OG. Compartilhar no WhatsApp/Instagram mostra só o domínio.
9. **Sem `robots.txt`, `sitemap.xml`, `canonical` nem favicon:** `/favicon.ico` responde **404** e não há `<link rel="icon">` no HTML.
10. **Sem dados estruturados (JSON-LD `LocalBusiness`)**: essencial para negócio local aparecer no Google Maps/Search (endereço, telefone, horário já existem no código).
11. **Imagens:** a página **não tem nenhuma foto** (0 `<img>`) — para uma loja de plantas, fotos do espaço e dos produtos são o principal fator de conversão. Além disso, `images.unoptimized: true` desativa a otimização do Next.
12. **Performance do hero:** `setMousePosition` a cada `mousemove` re-renderiza o hero inteiro (dezenas de vezes por segundo). Melhor limitar com `requestAnimationFrame` ou trocar o efeito para CSS puro.
13. **`pnpm lint` está quebrado:** o script existe, mas o ESLint não está instalado nem configurado (`eslint: not found`, exit 127).
14. **Sem README nem `.env.example`:** não há como outra pessoa subir o projeto (variáveis, criação da tabela `site_settings`, comandos).
15. **Sem migrations/tabela versionada:** o `INSERT ... ON CONFLICT` assume que `site_settings (id, content, updated_at)` já existe — em banco novo, o painel falha silenciosamente.
16. **Sem testes** (nenhum arquivo de teste, nenhum script de teste).

---

## 5. Limpeza e organização (P2)

17. **Código morto:** `portfolio-section.tsx` e `pricing-section.tsx` não são importados em lugar nenhum; `quote-form-dialog.tsx` só é usado por `pricing-section` (logo, também morto).
18. **Biblioteca de UI inflada:** apenas **8 dos 56** componentes em `components/ui/` são usados (`sidebar`, `chart`, `menubar`, `calendar`, `carousel`... todos sem uso).
19. **6,6 MB de imagens órfãs em `public/`:** `social-media-graphics.png` (1,2 MB), `restaurant-website-design.png` (792 KB), `generic-brand-logo.png` (676 KB) etc. — sobras do template v0, nenhuma usada no site.
20. **CSS duplicado:** `styles/globals.css` não é referenciado por ninguém (o app usa `app/globals.css`).
21. **`generator: "v0.app"`** exposto no `<head>` — remover em produção.
22. **Default de tema escuro:** `<ThemeProvider defaultTheme="dark">` enquanto a paleta da marca é clara; visitante novo cai no tema escuro sem motivo.
23. **Hero ignora `hero.tags`:** as três "tags" no hero estão fixas no JSX, embora existam na configuração.
24. **Navbar ignora `navigation.*`:** rótulos e âncoras estão fixos no componente.

---

## 6. Acessibilidade (P2/P3)

25. `sr-only` em inglês ("Toggle theme", "Toggle menu") — trocar por "Alternar tema"/"Abrir menu".
26. Menu mobile: falta `aria-expanded`/`aria-controls` e controle de foco no painel aberto.
27. Falta link "pular para o conteúdo" (skip link) e estilos de foco visíveis explícitos.
28. Verificar contraste do verde primário sobre fundo claro com ferramenta de contraste (WCAG AA).

---

## 7. Roadmap sugerido

**Sprint 1 — destravar e proteger (P0)**
- Proteger `/painel` e `PUT /api/site-config` com login (o mais simples: Sign in with Freebuff / senha de admin via variável de ambiente).
- Fazer as 4 seções lerem a configuração (about, process, testimonials, contact) e o hero usar `hero.tags`.
- Consumir de verdade as variáveis `--site-*` no `app/globals.css`, ou remover a edição de cores.
- Tratar erro do banco: `try/catch` + fallback para `defaultSiteConfig` (fim do 500).
- Unificar o número de WhatsApp e corrigir o link do mapa.

**Sprint 2 — ser encontrado e converter (P1)**
- OpenGraph/Twitter + `metadataBase` + imagem de capa 1200×630.
- `robots.txt`, `sitemap.xml`, favicon e JSON-LD `LocalBusiness`.
- Fotos reais (hero, produtos, loja) com `next/image` (reativar otimização).
- README + `.env.example` + SQL de criação da tabela.

**Sprint 3 — polir e limpar (P2)**
- Remover código morto, componentes `ui` não usados e imagens órfãs de `public/`.
- Reativar `typescript.ignoreBuildErrors` (remover em vez de desligar), configurar ESLint e adicionar testes mínimos.
- Ajustes de acessibilidade e limite de re-render do hero.

---

## 8. Ganhos rápidos (menos de 1 hora)

| Ação | Impacto |
|---|---|
| Remover 6,6 MB de imagens não usadas de `public/` | Alto (peso do deploy) |
| `try/catch` + fallback na API | Alto (site não cai com banco fora) |
| Unificar número do WhatsApp | Alto (evita perder cliente) |
| Metadados OpenGraph básicos | Médio-alto (compartilhamento) |
| Corrigir rótulos `sr-only` para português | Médio (acessibilidade) |
| Remover `generator: "v0.app"` | Baixo, mas profissionalismo |
