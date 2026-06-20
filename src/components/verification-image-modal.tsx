"use client"

import React, { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { X, Loader2 } from "lucide-react"
import { apiUrl } from "@/lib/api-base"

interface VerificationImageModalProps {
  verificationId: string
  variant: "primary" | "secondary"
  title?: string
  onClose: () => void
}

export function verificationMediaUrl(
  verificationId: string,
  variant: "primary" | "secondary"
): string {
  return apiUrl(`/api/v1/admin/verifications/${verificationId}/media/${variant}`)
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
    setBlobUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })

    const token = localStorage.getItem("vf_token") ?? ""
    if (!token) {
      setError("Not signed in — open the admin panel and log in again.")
      setLoading(false)
      return
    }

    const url = verificationMediaUrl(verificationId, variant)

    try {
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "image/jpeg, image/png, image/webp, application/json",
        },
      })

      const contentType = res.headers.get("content-type") ?? ""

      if (!res.ok) {
        let message = `Could not load image (HTTP ${res.status}).`
        if (contentType.includes("application/json")) {
          const json = await res.json().catch(() => null)
          if (json?.message) message = String(json.message)
          if (json?.path) message += ` Path: ${json.path}`
        }
        setError(message)
        setLoading(false)
        return
      }

      if (!contentType.startsWith("image/")) {
        setError("Server did not return an image. The file may be missing on storage.")
        setLoading(false)
        return
      }

      const blob = await res.blob()
      if (blob.size === 0) {
        setError("Image file is empty on the server.")
        setLoading(false)
        return
      }

      setBlobUrl(URL.createObjectURL(blob))
    } catch {
      setError(`Network error loading image. API: ${apiUrl("")}`)
    } finally {
      setLoading(false)
    }
  }, [verificationId, variant])

  useEffect(() => {
    void load()
    return () => {
      setBlobUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return null
      })
    }
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
          <div className="flex items-center gap-1">
            {error && (
              <Button variant="ghost" size="sm" onClick={() => void load()}>
                Retry
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex min-h-[240px] items-center justify-center bg-muted/30 p-4">
          {loading ? (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="text-sm">Loading image…</span>
            </div>
          ) : error ? (
            <div className="text-center text-sm text-destructive max-w-md space-y-2">
              <p>{error}</p>
              <p className="text-xs text-muted-foreground">
                Tip: use the <strong>Primary</strong> button on Submissions (not Certificate) for fastest access.
              </p>
            </div>
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
