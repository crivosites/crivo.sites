# Como criar um site novo a partir deste modelo

Este repositório é um **modelo**. O código das seções não muda entre clientes — só o
arquivo `content/site-config.json`. O roteiro abaixo cobre um site novo de ponta a ponta.

## 1. Copiar o repositório

```bash
git clone <url-do-modelo> novo-projeto
cd novo-projeto
pnpm install
```

Opcional: renomeie o projeto em `package.json` (`"name"`) e ajuste o `README.md`.

## 2. Definir o endereço oculto do painel

```bash
cp .env.example .env.local
# edite ADMIN_PATH e ADMIN_KEY
pnpm dev
```

Abra `http://localhost:3000/<ADMIN_PATH>`.

## 3. Preencher o conteúdo (painel)

Ordem recomendada, que é a ordem em que o visitante lê a página:

1. **Marca e contato** — nome, logo (símbolo), telefone, WhatsApp, Instagram.
2. **Cabeçalho** — itens do menu e botão principal.
3. **Hero** — frase de destaque, título, benefício e botões.
4. **Serviços** — 3 a 6 itens (ideal). Cada item: ícone, título e descrição.
5. **Portfólio** — envie as fotos (upload direto do computador). A seção e o item de menu
   aparecem sozinhos; sem fotos, ficam ocultos.
6. **Sobre** — história, diferenciais e indicadores.
7. **Como funciona** — passo a passo do atendimento.
8. **Depoimentos** — prova social.
9. **FAQ** — dúvidas que travam a decisão (também vão para o Google).
10. **Contato** — WhatsApp, telefone, endereço, mapa e horário.
11. **Rodapé** — links e redes sociais.
12. **Cores** — cores de marca (aplicadas no tema claro).
13. **SEO e dados da empresa** — título/descrição para o Google e dados do `LocalBusiness`.

Clique em **Salvar**. Confira o site em outra aba (o conteúdo é lido no build; em dev o
JSON é recarregado, mas para ver as cores/metadata atualizadas recarregue a página).

## 4. Conferir antes de publicar

- [ ] `meta.siteUrl` / `NEXT_PUBLIC_SITE_URL` aponta para o domínio final.
- [ ] `meta.title` (até ~60 caracteres) e `meta.description` (150–160) preenchidos.
- [ ] Todos os números de WhatsApp iguais (marca, hero, contato).
- [ ] Endereço e horário corretos; link e mapa apontando para o lugar certo.
- [ ] Depoimentos e indicadores **reais** (nunca inventados).
- [ ] Portfólio com pelo menos 6 fotos (e legenda/categoria quando fizer sentido).
- [ ] `pnpm build` e `pnpm lint` passando.
- [ ] Favicon e imagem de compartilhamento conferidos.

## 5. Publicar

```bash
pnpm build
pnpm start
```

> Em host serverless (Vercel e afins) o painel **não grava em disco**. Use **Baixar JSON**,
> substitua `content/site-config.json` no repositório e faça o deploy.

## 6. Pós-publicação

- Enviar o `sitemap.xml` no Google Search Console.
- Preencher `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`.
- Cadastrar o negócio no Google Meu Negócio (o JSON-LD já ajuda).
