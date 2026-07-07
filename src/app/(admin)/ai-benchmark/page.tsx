"use client"

import React, { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Upload, FlaskConical, Loader2 } from "lucide-react"
import { apiUrl } from "@/lib/api-base"

interface BenchmarkRow {
  engine: string
  engine_slug: string
  model?: string | null
  processing_time: number
  confidence: string
  result: Record<string, unknown>
  differences: Array<{ field: string; qwen?: unknown; florence?: unknown; left?: unknown; right?: unknown }> | null
  warnings: string[]
  status: string
  error?: string
}

export default function AiBenchmarkPage() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [running, setRunning] = useState(false)
  const [rows, setRows] = useState<BenchmarkRow[]>([])
  const [error, setError] = useState("")

  const token = typeof window !== "undefined" ? localStorage.getItem("vf_token") : ""

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0] ?? null
    setFile(picked)
    setRows([])
    setError("")
    if (preview) URL.revokeObjectURL(preview)
    setPreview(picked ? URL.createObjectURL(picked) : null)
  }

  async function runBenchmark() {
    if (!file || !token) return
    setRunning(true)
    setError("")
    setRows([])

    const form = new FormData()
    form.append("image", file)

    try {
      const res = await fetch(apiUrl("/api/v1/admin/ai/benchmark"), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.message ?? "Benchmark failed")
        return
      }
      setRows(json.data?.engines ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error")
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FlaskConical className="w-6 h-6 text-primary" />
          AI Engine Benchmark
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Upload one EC8A image and compare every extraction engine side-by-side.
        </p>
      </div>

      <Card className="p-6 space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="benchmark_image">Test image</Label>
          <input
            id="benchmark_image"
            type="file"
            accept="image/*"
            onChange={onFileChange}
            className="text-sm"
          />
        </div>
        {preview && (
          <img src={preview} alt="Benchmark preview" className="max-h-64 rounded border border-border object-contain" />
        )}
        <Button onClick={runBenchmark} disabled={!file || running}>
          {running ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
          {running ? "Running all engines…" : "Run benchmark"}
        </Button>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </Card>

      {rows.length > 0 && (
        <div className="space-y-4">
          {rows.map((row) => (
            <Card key={row.engine_slug} className="p-4 space-y-3">
              <div className="flex flex-wrap items-center gap-3 justify-between">
                <h2 className="font-semibold">{row.engine}</h2>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="rounded bg-muted px-2 py-1">Time: {row.processing_time}s</span>
                  {row.model && <span className="rounded bg-muted px-2 py-1">Model: {row.model}</span>}
                  <span className="rounded bg-muted px-2 py-1">Confidence: {row.confidence}</span>
                  <span className={`rounded px-2 py-1 ${row.status === "FAILED" ? "bg-destructive/20" : "bg-primary/10"}`}>
                    {row.status}
                  </span>
                </div>
              </div>
              {row.error && <p className="text-sm text-destructive">{row.error}</p>}
              {row.warnings?.length > 0 && (
                <ul className="text-xs text-amber-600 dark:text-amber-400 list-disc pl-4">
                  {row.warnings.map((w) => <li key={w}>{w}</li>)}
                </ul>
              )}
              {row.differences && row.differences.length > 0 && (
                <div className="text-xs">
                  <p className="font-medium mb-1">Differences</p>
                  <pre className="bg-muted p-2 rounded overflow-x-auto">{JSON.stringify(row.differences, null, 2)}</pre>
                </div>
              )}
              <pre className="text-xs bg-muted p-3 rounded overflow-x-auto max-h-64">
                {JSON.stringify(row.result, null, 2)}
              </pre>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
