"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Check, Copy, Download, ExternalLink, Loader2, RotateCcw, Save, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FieldEditor } from "@/components/painel/field-editor"
import { applyChange } from "@/components/painel/field-editor"
import { adminHeaders, readAdminKey, saveAdminKey } from "@/lib/panel-client"
import { mergeSiteConfig, type SiteConfig } from "@/lib/site-config"
import { panelSections } from "@/lib/panel-sections"
import type { ConfigPath } from "@/lib/config-utils"

type Status = { kind: "idle" | "ok" | "error"; message: string }

export default function PainelPage() {
  const [config, setConfig] = useState<SiteConfig | null>(null)
  const [status, setStatus] = useState<Status>({ kind: "idle", message: "" })
  const [busy, setBusy] = useState(false)
  const [reloadToken, setReloadToken] = useState(0)
  // A chave de acesso (ADMIN_KEY) fica só na sessão do navegador.
  const [adminKey, setAdminKey] = useState(readAdminKey)
  const [pasted, setPasted] = useState("")
  // Portão de entrada: quando o servidor exige ADMIN_KEY, o painel só abre com a senha.
  const [locked, setLocked] = useState(false)
  const [keyDraft, setKeyDraft] = useState("")
  const [unlocking, setUnlocking] = useState(false)
  const [lockError, setLockError] = useState("")
  const fileInput = useRef<HTMLInputElement>(null)

  // Carrega (e recarrega) o conteúdo vindo da API.
  // 401 = o servidor exige a senha: mostramos o portão de entrada em vez do editor.
  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const response = await fetch("/api/site-config", { cache: "no-store", headers: adminHeaders() })
        if (response.status === 401) {
          if (!cancelled) setLocked(true)
          return
        }
        if (!response.ok) throw new Error("falha ao carregar")
        const data = mergeSiteConfig(await response.json())
        if (!cancelled) {
          setConfig(data)
          setLocked(false)
        }
      } catch {
        if (!cancelled) setStatus({ kind: "error", message: "Não foi possível carregar o conteúdo do site." })
      }
    })()
    return () => {
      cancelled = true
    }
  }, [reloadToken])

  /** Valida a senha digitada e abre o painel. */
  async function unlock() {
    const key = keyDraft.trim()
    if (!key) return
    setUnlocking(true)
    setLockError("")
    try {
      const response = await fetch("/api/site-config", { cache: "no-store", headers: { "x-admin-key": key } })
      if (response.status === 401) {
        setLockError("Senha incorreta. Confira e tente novamente.")
        return
      }
      if (!response.ok) throw new Error("falha")
      saveAdminKey(key)
      setAdminKey(key)
      setConfig(mergeSiteConfig(await response.json()))
      setLocked(false)
    } catch {
      setLockError("Não foi possível entrar. Tente novamente.")
    } finally {
      setUnlocking(false)
    }
  }

  const change = useCallback((path: ConfigPath, value: unknown) => {
    setConfig((current) => (current ? applyChange(current, path, value) : current))
  }, [])

  const json = useMemo(() => (config ? JSON.stringify(config, null, 2) : ""), [config])

  /** Carrega um JSON (arquivo ou colado) no editor, sem salvar ainda. */
  function loadJson(text: string) {
    try {
      const parsed = JSON.parse(text)
      setConfig(mergeSiteConfig(parsed))
      setStatus({ kind: "ok", message: "JSON carregado no editor. Confira os campos e clique em Salvar para aplicar no site." })
    } catch {
      setStatus({ kind: "error", message: "JSON inválido. Confira o conteúdo colado ou o arquivo escolhido." })
    }
  }

  async function pickFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return
    try {
      loadJson(await file.text())
    } catch {
      setStatus({ kind: "error", message: "Não foi possível ler o arquivo." })
    }
  }

  async function save() {
    if (!config) return
    setBusy(true)
    setStatus({ kind: "idle", message: "" })
    try {
      const response = await fetch("/api/site-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...adminHeaders() },
        body: JSON.stringify(config),
        cache: "no-store",
      })
      const result = (await response.json().catch(() => ({}))) as { message?: string }
      if (response.status === 401) {
        throw new Error("Senha do painel incorreta ou ausente. Informe a senha em “Acesso” e salve de novo.")
      }
      if (!response.ok) throw new Error(result.message ?? "falha ao salvar")
      setConfig(mergeSiteConfig(result))
      setStatus({ kind: "ok", message: "Conteúdo salvo em content/site-config.json. O site já mostra a alteração." })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível salvar."
      setStatus({
        kind: "error",
        message: message.startsWith("Senha do painel")
          ? message
          : `${message} — use “Baixar JSON” e substitua o arquivo content/site-config.json.`,
      })
    } finally {
      setBusy(false)
    }
  }

  function download() {
    const blob = new Blob([json], { type: "application/json" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = "site-config.json"
    link.click()
    URL.revokeObjectURL(link.href)
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(json)
      setStatus({ kind: "ok", message: "JSON copiado para a área de transferência." })
    } catch {
      setStatus({ kind: "error", message: "Não foi possível copiar. Use “Baixar JSON”." })
    }
  }

  if (locked) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Painel do site</CardTitle>
            <CardDescription>Digite a senha de acesso para editar o conteúdo.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Label htmlFor="admin-key">Senha do painel</Label>
            <Input
              id="admin-key"
              type="password"
              autoComplete="current-password"
              autoFocus
              value={keyDraft}
              placeholder="Senha de acesso"
              onChange={(event) => setKeyDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") void unlock()
              }}
            />
            {lockError ? <p className="text-sm text-destructive">{lockError}</p> : null}
            <Button onClick={() => void unlock()} disabled={unlocking || !keyDraft.trim()}>
              {unlocking ? <Loader2 data-icon="inline-start" className="animate-spin" /> : null} Entrar
            </Button>
          </CardContent>
        </Card>
      </main>
    )
  }

  if (!config) {
    return (
      <main className="flex min-h-screen items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
        Carregando conteúdo do site...
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-muted/30 pb-24">
      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-lg font-bold">Editor de conteúdo do site</h1>
            <p className="text-xs text-muted-foreground">
              Edite campo a campo abaixo (ou carregue um JSON). Ao salvar, o site já mostra a alteração.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild size="sm" variant="outline">
              <a href="/" target="_blank" rel="noopener noreferrer">
                <ExternalLink data-icon="inline-start" /> Ver site
              </a>
            </Button>
            <Button size="sm" variant="outline" onClick={() => fileInput.current?.click()} disabled={busy}>
              <Upload data-icon="inline-start" /> Carregar JSON
            </Button>
            <Button size="sm" variant="outline" onClick={() => void copy()} disabled={busy}>
              <Copy data-icon="inline-start" /> Copiar JSON
            </Button>
            <Button size="sm" variant="outline" onClick={download} disabled={busy}>
              <Download data-icon="inline-start" /> Baixar JSON
            </Button>
            <Button size="sm" variant="outline" onClick={() => setReloadToken((token) => token + 1)} disabled={busy}>
              <RotateCcw data-icon="inline-start" /> Descartar alterações
            </Button>
            <Button size="sm" onClick={() => void save()} disabled={busy}>
              {busy ? <Loader2 data-icon="inline-start" className="animate-spin" /> : <Save data-icon="inline-start" />} Salvar
            </Button>
          </div>
        </div>
        {status.message ? (
          <div
            role="status"
            className={`mx-auto max-w-7xl px-4 pb-3 text-sm sm:px-6 ${
              status.kind === "error" ? "text-destructive" : "text-primary"
            }`}
          >
            {status.kind === "ok" ? <Check data-icon="inline-start" className="inline size-4" /> : null} {status.message}
          </div>
        ) : null}
      </header>

      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:flex-row">
        <nav aria-label="Seções do site" className="lg:sticky lg:top-28 lg:h-fit lg:w-64 lg:shrink-0">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Ordem do site</p>
          <ul className="flex flex-wrap gap-2 lg:flex-col">
            {panelSections.map((section) => (
              <li key={section.key}>
                <a
                  href={`#sec-${section.key}`}
                  className="inline-block rounded-lg border border-transparent px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-border hover:bg-background hover:text-foreground"
                >
                  {section.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex w-full flex-col gap-6">
          <Card id="sec-importar" className="scroll-mt-28">
            <CardHeader>
              <CardTitle>Carregar conteúdo (JSON)</CardTitle>
              <CardDescription>
                Você pode editar campo a campo nos blocos abaixo ou trazer o <code>site-config.json</code> inteiro.
                Carregar apenas coloca o conteúdo no editor — clique em <strong>Salvar</strong> para aplicar no site.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <Button type="button" size="sm" variant="outline" onClick={() => fileInput.current?.click()} disabled={busy}>
                  <Upload data-icon="inline-start" /> Escolher arquivo JSON
                </Button>
                <input
                  ref={fileInput}
                  type="file"
                  accept="application/json,.json"
                  className="hidden"
                  onChange={(event) => void pickFile(event)}
                />
              </div>

              <details className="rounded-lg border bg-muted/20 p-3">
                <summary className="cursor-pointer text-sm font-medium">Ou cole o JSON aqui</summary>
                <Textarea
                  value={pasted}
                  onChange={(event) => setPasted(event.target.value)}
                  rows={6}
                  placeholder='{ "brand": { "name": "Nome do cliente" } }'
                  className="mt-3 font-mono text-xs"
                />
                <Button
                  type="button"
                  size="sm"
                  className="mt-2"
                  disabled={busy || !pasted.trim()}
                  onClick={() => loadJson(pasted)}
                >
                  Aplicar JSON colado
                </Button>
              </details>

              <details className="rounded-lg border bg-muted/20 p-3">
                <summary className="cursor-pointer text-sm font-medium">Trocar a senha de acesso</summary>
                <p className="mt-2 text-xs text-muted-foreground">
                  A senha do painel (<code>ADMIN_KEY</code>) é definida no servidor. Para trocar, informe a nova aqui — ela
                  fica apenas nesta sessão do navegador.
                </p>
                <Input
                  value={adminKey}
                  type="password"
                  autoComplete="off"
                  placeholder="ADMIN_KEY (opcional)"
                  className="mt-2 max-w-sm"
                  onChange={(event) => {
                    setAdminKey(event.target.value)
                    saveAdminKey(event.target.value)
                  }}
                />
              </details>
            </CardContent>
          </Card>

          {panelSections.map((section) => (
            <Card key={section.key} id={`sec-${section.key}`} className="scroll-mt-28">
              <CardHeader>
                <CardTitle>{section.label}</CardTitle>
                <CardDescription>{section.hint}</CardDescription>
              </CardHeader>
              <CardContent>
                <FieldEditor value={config[section.key]} path={[section.key]} onChange={change} />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  )
}
