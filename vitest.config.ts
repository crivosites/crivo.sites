import { fileURLToPath } from "node:url"
import { defineConfig } from "vitest/config"

/** Testes de unidade do template (conteúdo, cores e proteção do painel). */
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts", "tools/**/*.test.ts"],
  },
})
