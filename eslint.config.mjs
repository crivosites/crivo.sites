import nextCoreWebVitals from "eslint-config-next/core-web-vitals"
import nextTypeScript from "eslint-config-next/typescript"

/**
 * Componentes shadcn/ui e hooks são código gerado/vendorizado: ficam fora do lint
 * do projeto. O que é nosso (app/, components/ próprio, lib/) é verificado normalmente.
 * @type {import("eslint").Linter.Config[]}
 */
const config = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "next-env.d.ts",
      "tsconfig.tsbuildinfo",
      "components/ui/**",
      "hooks/**",
    ],
  },
  ...nextCoreWebVitals,
  ...nextTypeScript,
]

export default config
