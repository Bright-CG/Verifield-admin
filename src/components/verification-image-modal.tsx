"use client"

import React, { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { X, Loader2 } from "lucide-react"
import { apiUrl } from "@/lib/api-base"

interface VerificationImageModalProps {
  verificationId: string
  variant: "primary" | "secondary"
  title?: string
  /** Public storage URL fallback when authenticated stream fails */
  fallbackUrl?: string | null
  onClose: () => void
}

export function verificationMediaUrl(
  verificationId: string,
  variant: "primary" | "secondary"
): string {
  return apiUrl(`/api/v1/admin/verifications/${verificationId}/media/${variant}`)
}

async function loadImageBlob(
  url: string,
  token?: string
): Promise<{ blob: Blob | null; error: string }> {
  const headers: Record<string, string> = {
    Accept: "image/jpeg, image/png, image/webp, application/json",
  }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(url, { headers })

  const contentType = res.headers.get("content-type") ?? ""

  if (!res.ok) {
    let message = `Could not load image (HTTP ${res.status}).`
    try {
      const text = await res.text()
      if (text) {
        try {
          const json = JSON.parse(text) as { message?: string; path?: string }
          if (json.message) message = json.message
          if (json.path) message += ` Path: ${json.path}`
        } catch {
          if (text.length < 200) message = text
        }
      }
    } catch {
      /* ignore */
    }
    return { blob: null, error: message }
  }

  if (!contentType.startsWith("image/")) {
    return {
      blob: null,
      error: "Server did not return an image. The file may be missing on storage.",
    }
  }

  const blob = await res.blob()
  if (blob.size === 0) {
    return { blob: null, error: "Image file is empty on the server." }
  }

  return { blob, error: "" }
}

export function VerificationImageModal({
  verificationId,
  variant,
  title,
  fallbackUrl,
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

    const mediaUrl = verificationMediaUrl(verificationId, variant)

    try {
      let result = await loadImageBlob(mediaUrl, token)

      if (!result.blob && fallbackUrl) {
        result = await loadImageBlob(fallbackUrl)
      }

      if (result.blob) {
        setBlobUrl(URL.createObjectURL(result.blob))
      } else {
        setError(result.error || "Could not load image.")
      }
    } catch {
      setError(`Network error loading image. API: ${apiUrl("")}`)
    } finally {
      setLoading(false)
    }
  }, [verificationId, variant, fallbackUrl])

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
              {fallbackUrl && (
                <p className="text-xs text-muted-foreground break-all">
                  Storage URL: {fallbackUrl}
                </p>
              )}
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
