"use client"

import React, { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { X, Loader2 } from "lucide-react"
import { verificationMediaUrl } from "@/lib/submissions"

interface VerificationImageModalProps {
  verificationId: string
  variant: "primary" | "secondary"
  title?: string
  onClose: () => void
}

export function VerificationImageModal({
  verificationId,
  variant,
  title,
  onClose,
}: VerificationImageModalProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    setError("")
    const token = localStorage.getItem("vf_token") ?? ""
    const url = verificationMediaUrl(verificationId, variant)

    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        const json = await res.json().catch(() => null)
        setError(json?.message ?? `Could not load image (${res.status}).`)
        setLoading(false)
        return
      }
      const blob = await res.blob()
      setBlobUrl(URL.createObjectURL(blob))
    } catch {
      setError("Network error loading image.")
    } finally {
      setLoading(false)
    }
  }, [verificationId, variant])

  useEffect(() => {
    void load()
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load])

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
        aria-label="Close image viewer"
      />
      <div className="relative z-10 max-h-[90vh] w-full max-w-3xl rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="font-semibold text-sm truncate">
            {title ?? (variant === "secondary" ? "Secondary capture" : "Primary capture")}
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex min-h-[240px] items-center justify-center bg-muted/30 p-4">
          {loading ? (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="text-sm">Loading image…</span>
            </div>
          ) : error ? (
            <div className="text-center text-sm text-destructive max-w-md">{error}</div>
          ) : blobUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={blobUrl}
              alt={title ?? "Verification capture"}
              className="max-h-[70vh] w-auto max-w-full rounded-md object-contain"
            />
          ) : null}
        </div>
      </div>
    </div>
  )
}
