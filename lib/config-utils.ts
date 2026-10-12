export type ConfigPath = (string | number)[]

/** Atualiza imutavelmente um valor em qualquer profundidade do conteúdo. */
export function updateAtPath<T>(value: T, path: ConfigPath, next: unknown): T {
  if (!path.length) return next as T
  const [head, ...rest] = path
  const copy: Record<string | number, unknown> | unknown[] = Array.isArray(value)
    ? [...(value as unknown[])]
    : { ...(value as Record<string, unknown>) }
  ;(copy as Record<string | number, unknown>)[head] = updateAtPath(
    (copy as Record<string | number, unknown>)[head] as never,
    rest,
    next,
  )
  return copy as T
}

/** Insere um item novo ao final de uma lista, clonando a estrutura do último. */
export function appendItem<T>(list: T[], sample: T): T[] {
  return [...list, structuredClone(sample)]
}

/** Move um item da lista para cima (-1) ou para baixo (+1). */
export function moveItem<T>(list: T[], index: number, direction: -1 | 1): T[] {
  const target = index + direction
  if (target < 0 || target >= list.length) return list
  const copy = [...list]
  const [item] = copy.splice(index, 1)
  copy.splice(target, 0, item)
  return copy
}

/** Remove um item da lista. */
export function removeItem<T>(list: T[], index: number): T[] {
  return list.filter((_, i) => i !== index)
}
