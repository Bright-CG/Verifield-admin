"use client"

import React, { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { loadImageBlob, verificationMediaUrl } from "@/components/verification-image-modal"

interface VerificationCaptureImageProps {
  verificationId: string
  variant?: "primary" | "secondary"
  fallbackUrl?: string | null
  title?: string
  className?: string
}

/** Inline primary/secondary capture for EC8A review (same loader as the modal). */
export function VerificationCaptureImage({
  verificationId,
  variant = "primary",
  fallbackUrl,
  title = "Primary EC8A capture",
  className = "",
}: VerificationCaptureImageProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [directUrl, setDirectUrl] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    setError("")
    setDirectUrl(null)
    setBlobUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })

    const token = localStorage.getItem("vf_token") ?? ""
    if (!token) {
      setError("Not signed in.")
      setLoading(false)
      return
    }

    try {
      const result = await loadImageBlob(verificationMediaUrl(verificationId, variant), token)
      if (result.blob) {
        setBlobUrl(URL.createObjectURL(result.blob))
      } else if (fallbackUrl) {
        setDirectUrl(fallbackUrl)
      } else {
        setError(result.error || "Could not load image.")
      }
    } catch {
      if (fallbackUrl) {
        setDirectUrl(fallbackUrl)
      } else {
        setError("Network error loading image.")
      }
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
    <div className={`rounded-lg border border-border bg-muted/20 overflow-hidden ${className}`}>
      <div className="border-b border-border px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        {title}
      </div>
      <div className="flex min-h-[280px] items-center justify-center p-3 bg-muted/30">
        {loading ? (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-xs">Loading capture…</span>
          </div>
        ) : error ? (
          <div className="text-center text-xs text-destructive space-y-2 px-2">
            <p>{error}</p>
            <Button variant="outline" size="sm" onClick={() => void load()}>
              Retry
            </Button>
          </div>
        ) : blobUrl || directUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={blobUrl ?? directUrl ?? ""}
            alt={title}
            className="max-h-[min(70vh,520px)] w-auto max-w-full rounded-md object-contain cursor-zoom-in"
            onClick={() => window.open(blobUrl ?? directUrl ?? "", "_blank")}
          />
        ) : null}
      </div>
      <p className="px-3 py-2 text-[10px] text-muted-foreground border-t border-border">
        Click image to open full size. Compare handwritten figures to OCR fields on the right.
      </p>
    </div>
  )
}
