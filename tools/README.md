# tools/ — o contrato e a ponte (fora do template)

Esta pasta é ferramental. Ela **não** faz parte do site: nada aqui é importado por
`app/`, `components/` ou `content/`. Serve para gerar `content/site-config.json`
de qualquer cliente **sem tocar no template**.

## Arquivos
- `site-config.schema.json` — o **contrato** (JSON Schema) do conteúdo. Define os
  campos, os **ícones válidos** (enum, igual a `lib/icons.ts`) e os **tipos
  schema.org** (`businessType`). É o que a IA e o painel devem obedecer.
- `import/to-site-config.ts` — a **ponte**: recebe um `ClientBrief` (dados crus do
  cliente) e devolve um `SiteConfig` completo, normalizado e à prova de campo
  faltando (usa `mergeSiteConfig`).
- `import/to-site-config.test.ts` — testes.

## Regra de ouro
Aqui **não** se cria dado. Telefone, endereço, endereço e afins são apenas
normalizados. A criatividade (headline, serviços, FAQ) vem de fora (IA), no tom do
nicho — mas nunca inventa fato.

## Uso (exemplo)
```ts
import { briefToSiteConfig } from "@/tools/import/to-site-config"

const config = briefToSiteConfig({
  name: "Horto Espaço Semear",
  niche: "Floricultura",
  phone: "(71) 99999-0000",
  instagram: "@hortosemear",
  city: "Camaçari",
  region: "BA",
  primaryColor: "#3f9f5b",
  services: [{ icon: "sprout", title: "Plantas", description: "Mudas e ornamentais." }],
})
// grave `config` em content/site-config.json do repositório do cliente.
```

## Verificação
```bash
pnpm lint && pnpm test && pnpm build
```
