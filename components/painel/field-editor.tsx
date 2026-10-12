"use client"

import { useRef, useState } from "react"
import NextImage from "next/image"
import { ArrowDown, ArrowUp, Copy, Image as ImageIcon, Images, Loader2, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { appendItem, moveItem, removeItem, updateAtPath, type ConfigPath } from "@/lib/config-utils"
import { iconNames } from "@/lib/icons"
import { fieldHints, fieldLabels, fieldLabelsByPath, itemTemplates, longTextFields } from "@/lib/panel-sections"
import { adminHeaders } from "@/lib/panel-client"

type EditorProps = {
  value: unknown
  path: ConfigPath
  onChange: (path: ConfigPath, value: unknown) => void
}

function labelFor(key: string, pathKey = key) {
  return (
    fieldLabelsByPath[pathKey] ??
    fieldLabels[key] ??
    key.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase())
  )
}

function hintsFor(key: string) {
  return fieldHints[key]
}

function isHexColor(value: string) {
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value.trim())
}

function Counter({ path, value }: { path: ConfigPath; value: string }) {
  const key = String(path[path.length - 1])
  if (path[0] !== "meta" || (key !== "title" && key !== "description")) return null
  const ideal = key === "title" ? [30, 60] : [120, 160]
  const good = value.length >= ideal[0] && value.length <= ideal[1]
  return (
    <p className={`text-xs ${good ? "text-muted-foreground" : "text-amber-600"}`}>
      {value.length} caracteres {good ? "· tamanho ideal" : `· recomendado entre ${ideal[0]} e ${ideal[1]}`}
    </p>
  )
}

function ImageField({
  value,
  path,
  pathKey,
  onChange,
}: {
  value: string
  path: ConfigPath
  pathKey: string
  onChange: (path: ConfigPath, value: unknown) => void
}) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  async function upload(file: File) {
    setBusy(true)
    setError("")
    try {
      const body = new FormData()
      body.append("file", file)
      const response = await fetch("/api/uploads", { method: "POST", headers: adminHeaders(), body })
      const result = (await response.json().catch(() => ({}))) as { url?: string; message?: string }
      if (!response.ok || !result.url) throw new Error(result.message ?? "Não foi possível enviar a imagem.")
      onChange(path, result.url)
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Não foi possível enviar a imagem.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <Label htmlFor={pathKey}>{labelFor("image", pathKey)}</Label>
      <div className="flex flex-wrap items-start gap-4">
        <div className="relative h-24 w-36 shrink-0 overflow-hidden rounded-lg border bg-muted">
          {value ? (
            <NextImage src={value} alt="Prévia da foto" fill sizes="144px" className="object-cover" unoptimized />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <ImageIcon className="size-6" aria-hidden="true" />
            </div>
          )}
        </div>
        <div className="flex min-w-56 flex-1 flex-col gap-2">
          <Input
            id={pathKey}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            disabled={busy}
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) void upload(file)
              event.target.value = ""
            }}
          />
          <Input
            value={value}
            placeholder="ou cole aqui o endereço da imagem"
            onChange={(event) => onChange(path, event.target.value)}
          />
          {busy ? (
            <p className="inline-flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="size-3 animate-spin" /> Enviando foto...
            </p>
          ) : null}
          {error ? <p className="text-xs text-destructive">{error}</p> : null}
        </div>
      </div>
      {hintsFor("image") ? <p className="text-xs text-muted-foreground">{hintsFor("image")}</p> : null}
    </div>
  )
}

/**
 * Envio de várias fotos de uma vez.
 *
 * Manda todas em uma única requisição (`/api/uploads/batch`) — no GitHub isso vira
 * um único commit — e devolve as URLs para o chamador criar um item por foto.
 */
function BulkImageButton({ onAdd }: { onAdd: (urls: string[]) => void }) {
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const input = useRef<HTMLInputElement>(null)

  async function send(files: File[]) {
    setBusy(true)
    setError("")
    setMessage(`Enviando ${files.length} foto(s)...`)
    try {
      const body = new FormData()
      for (const file of files) body.append("files", file)
      const response = await fetch("/api/uploads/batch", { method: "POST", headers: adminHeaders(), body })
      const result = (await response.json().catch(() => ({}))) as { urls?: string[]; message?: string }
      if (!response.ok || !result.urls?.length) throw new Error(result.message ?? "Não foi possível enviar as fotos.")
      onAdd(result.urls)
      setMessage(`${result.urls.length} foto(s) adicionada(s). Clique em Salvar para publicar.`)
    } catch (uploadError) {
      setMessage("")
      setError(uploadError instanceof Error ? uploadError.message : "Não foi possível enviar as fotos.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <input
        ref={input}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        className="hidden"
        onChange={(event) => {
          const files = Array.from(event.target.files ?? [])
          if (files.length) void send(files)
          event.target.value = ""
        }}
      />
      <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => input.current?.click()}>
        {busy ? <Loader2 data-icon="inline-start" className="animate-spin" /> : <Images data-icon="inline-start" />}
        Enviar várias fotos
      </Button>
      {message ? <p className="text-xs text-muted-foreground">{message}</p> : null}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  )
}

export function FieldEditor({ value, path, onChange }: EditorProps) {
  const key = String(path[path.length - 1] ?? "")
  const pathKey = path.join(".")

  /* ---------------- texto simples ---------------- */
  if (typeof value === "string") {
    if (key === "image") {
      return <ImageField value={value} path={path} pathKey={pathKey} onChange={onChange} />
    }
    const hint = hintsFor(key)
    const isColorField = path[0] === "colors" && isHexColor(value)
    return (
      <div className="flex flex-col gap-2">
        <Label htmlFor={pathKey}>{labelFor(key, pathKey)}</Label>
        {key === "icon" ? (
          <select
            id={pathKey}
            value={value}
            onChange={(event) => onChange(path, event.target.value)}
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring"
          >
            <option value="">— escolher ícone —</option>
            {iconNames.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        ) : longTextFields.has(key) ? (
          <Textarea id={pathKey} value={value} rows={key.includes("Url") ? 2 : 4} onChange={(event) => onChange(path, event.target.value)} />
        ) : (
          <div className="flex items-center gap-2">
            {isColorField ? (
              <input
                type="color"
                aria-label={`${labelFor(key, pathKey)} (seletor)`}
                value={value}
                onChange={(event) => onChange(path, event.target.value)}
                className="h-9 w-12 cursor-pointer rounded-md border border-input bg-transparent"
              />
            ) : null}
            <Input id={pathKey} value={value} onChange={(event) => onChange(path, event.target.value)} />
          </div>
        )}
        <Counter path={path} value={value} />
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </div>
    )
  }

  /* ---------------- lista de textos ---------------- */
  if (Array.isArray(value) && value.every((item) => typeof item === "string")) {
    const list = value as string[]
    return (
      <div className="flex flex-col gap-3 rounded-xl border bg-muted/20 p-4">
        <div className="flex items-center justify-between gap-3">
          <Label>{labelFor(key, pathKey)}</Label>
          <Button type="button" size="sm" variant="outline" onClick={() => onChange(path, appendItem(list, (itemTemplates[pathKey] as string) ?? ""))}>
            <Plus data-icon="inline-start" /> Adicionar
          </Button>
        </div>
        {hintsFor(key) ? <p className="text-xs text-muted-foreground">{hintsFor(key)}</p> : null}
        {list.map((item, index) => (
          <div key={`${pathKey}-${index}`} className="flex items-center gap-2">
            <Input value={item} onChange={(event) => onChange([...path, index], event.target.value)} />
            <Button type="button" size="icon" variant="ghost" aria-label="Mover para cima" onClick={() => onChange(path, moveItem(list, index, -1))}>
              <ArrowUp />
            </Button>
            <Button type="button" size="icon" variant="ghost" aria-label="Mover para baixo" onClick={() => onChange(path, moveItem(list, index, 1))}>
              <ArrowDown />
            </Button>
            <Button type="button" size="icon" variant="ghost" aria-label="Excluir" onClick={() => onChange(path, removeItem(list, index))}>
              <Trash2 className="text-destructive" />
            </Button>
          </div>
        ))}
        {list.length === 0 ? <p className="text-sm text-muted-foreground">Nenhum item. Clique em “Adicionar”.</p> : null}
      </div>
    )
  }

  /* ---------------- lista de objetos ---------------- */
  if (Array.isArray(value)) {
    const list = value as Record<string, unknown>[]
    const template = itemTemplates[pathKey] as Record<string, unknown> | undefined
    const sample = template ?? list[0]
    const sampleImage = sample ? (sample as Record<string, unknown>).image : undefined
    const hasImageField = typeof sampleImage === "string"
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <Label>{labelFor(key, pathKey)}</Label>
          <div className="flex gap-2">
            {list.length > 1 ? (
              <Button type="button" size="sm" variant="ghost" onClick={() => onChange(path, [])}>
                <Trash2 data-icon="inline-start" className="text-destructive" /> Remover todos
              </Button>
            ) : null}
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={!sample}
              onClick={() => sample && onChange(path, appendItem(list, sample))}
            >
              <Plus data-icon="inline-start" /> Adicionar
            </Button>
          </div>
        </div>
        {hasImageField ? (
          <BulkImageButton
            onAdd={(urls) =>
              onChange(path, [
                ...list,
                ...urls.map((url) => ({ ...(sample as Record<string, unknown>), image: url })),
              ])
            }
          />
        ) : null}
        {hintsFor(key) ? <p className="text-xs text-muted-foreground">{hintsFor(key)}</p> : null}

        {list.map((item, index) => (
          <div key={`${pathKey}-${index}`} className="rounded-xl border bg-background p-4">
            <div className="mb-4 flex items-center justify-between gap-2 border-b pb-2">
              <p className="text-sm font-semibold text-muted-foreground">
                {labelFor(key, pathKey).replace(/s$/, "")} {index + 1}
              </p>
              <div className="flex gap-1">
                <Button type="button" size="icon" variant="ghost" aria-label="Mover para cima" onClick={() => onChange(path, moveItem(list, index, -1))}>
                  <ArrowUp />
                </Button>
                <Button type="button" size="icon" variant="ghost" aria-label="Mover para baixo" onClick={() => onChange(path, moveItem(list, index, 1))}>
                  <ArrowDown />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  aria-label="Duplicar"
                  onClick={() => {
                    const copy = structuredClone(item)
                    const next = [...list]
                    next.splice(index + 1, 0, copy)
                    onChange(path, next)
                  }}
                >
                  <Copy />
                </Button>
                <Button type="button" size="icon" variant="ghost" aria-label="Excluir" onClick={() => onChange(path, removeItem(list, index))}>
                  <Trash2 className="text-destructive" />
                </Button>
              </div>
            </div>
            <FieldEditor value={item} path={[...path, index]} onChange={onChange} />
          </div>
        ))}
        {list.length === 0 ? <p className="text-sm text-muted-foreground">Nenhum item. Clique em “Adicionar”.</p> : null}
      </div>
    )
  }

  /* ---------------- objeto ---------------- */
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
    return (
      <div className="grid gap-5 md:grid-cols-2">
        {entries.map(([entryKey, entryValue]) => {
          const isWide = entryValue !== null && typeof entryValue === "object"
          return (
            <div key={`${pathKey}.${entryKey}`} className={isWide ? "md:col-span-2" : undefined}>
              {isWide ? null : <p className="mb-2 text-sm font-semibold">{labelFor(entryKey, `${pathKey}.${entryKey}`)}</p>}
              <FieldEditor value={entryValue} path={[...path, entryKey]} onChange={onChange} />
            </div>
          )
        })}
      </div>
    )
  }

  return null
}

/** Atualiza o conteúdo a partir da raiz (usado pelo painel). */
export function applyChange<T>(config: T, path: ConfigPath, next: unknown): T {
  return updateAtPath(config, path, next)
}
