/**
 * Varredura de segredos em arquivos versionados.
 *
 * Serve de rede de segurança: se um token (GitHub, AWS…) for colado por engano
 * em qualquer arquivo rastreado pelo Git, o teste em `tests/no-secrets.test.ts`
 * falha e o CI bloqueia o push.
 *
 * Os prefixos são montados em partes (`partes.join("")`) de propósito: assim
 * este próprio arquivo não contém o texto literal de um padrão e não se
 * autoflagra na varredura.
 */

export interface SecretFinding {
  /** Nome legível da regra que encontrou algo. */
  name: string
  /** Trecho mascarado (nunca o segredo inteiro). */
  preview: string
}

const partes = (...pedacos: string[]): string => pedacos.join("")

const REGRAS: Array<{ name: string; pattern: RegExp }> = [
  { name: "token fine-grained do GitHub", pattern: new RegExp(`${partes("github", "_pat_")}[A-Za-z0-9_]{20,}`) },
  { name: "token clássico do GitHub", pattern: new RegExp(`${partes("gh", "p_")}[A-Za-z0-9]{36}`) },
  { name: "token de app/OAuth do GitHub", pattern: new RegExp(`${partes("gh", "[osu]_")}[A-Za-z0-9]{36}`) },
  { name: "chave de acesso da AWS", pattern: new RegExp(`${partes("AK", "IA")}[0-9A-Z]{16}`) },
  { name: "chave privada", pattern: new RegExp("-{5}BEGIN [A-Z ]*PRIVATE KEY-{5}") },
]

/** Mascara um segredo: mostra só o começo e o tamanho. */
export function mascarar(segredo: string): string {
  const inicio = segredo.slice(0, 7)
  return `${inicio}… (${segredo.length} caracteres)`
}

/** Procura segredos em um texto e devolve o que encontrou (com máscara). */
export function encontrarSegredos(texto: string): SecretFinding[] {
  const encontrados: SecretFinding[] = []
  for (const regra of REGRAS) {
    const match = regra.pattern.exec(texto)
    if (match) encontrados.push({ name: regra.name, preview: mascarar(match[0]) })
  }
  return encontrados
}
