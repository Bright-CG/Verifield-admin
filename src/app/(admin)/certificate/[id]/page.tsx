"use client"

import React, { useEffect, useState, useRef, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  ShieldCheck, ShieldAlert, Printer, Download,
  MapPin, Clock, User, Hash, Fingerprint, ImageIcon, ArrowLeft,
} from "lucide-react"
import { apiUrl } from "@/lib/api-base"
import { VerificationImageModal } from "@/components/verification-image-modal"

interface CertificateData {
  verification: {
    id: string
    gps_lat: number | null
    gps_long: number | null
    device_timestamp: string | null
    server_timestamp: string | null
    hash_chain: string
    hash_previous: string
    image_url: string | null
    secondary_image_url?: string | null
    accuracy: number | null
    metadata?: { distance_from_unit?: number; is_off_site?: boolean }
    user: { name: string; email: string }
    unit: { name: string; state: string; lga: string; ward: string }
  }
  hash_valid: boolean
  certificate_id: string
  issued_at: string
  legal_statement?: string
  ec8a_extraction?: {
    status: string
    data: Record<string, unknown> | null
    extracted_at: string | null
  } | null
}

function asNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

function asString(value: unknown): string {
  return value == null ? "" : String(value)
}

/** Map API payload (flat + nested) into a stable shape for the UI. */
function normalizeCertificate(raw: Record<string, unknown> | null): CertificateData | null {
  if (!raw) return null

  const verification = (raw.verification ?? {}) as Record<string, unknown>
  const agent = (raw.agent ?? verification.user ?? {}) as Record<string, unknown>
  const unit = (raw.polling_unit ?? verification.unit ?? {}) as Record<string, unknown>
  const capture = (raw.capture ?? {}) as Record<string, unknown>
  const media = (raw.media ?? {}) as Record<string, unknown>
  const chain = (raw.chain ?? {}) as Record<string, unknown>

  const id = asString(verification.id)
  if (!id) return null

  return {
    certificate_id: asString(raw.certificate_id) || id.slice(0, 8).toUpperCase(),
    issued_at: asString(raw.issued_at) || new Date().toISOString(),
    hash_valid: Boolean(raw.hash_valid),
    legal_statement: raw.legal_statement ? asString(raw.legal_statement) : undefined,
    ec8a_extraction: (raw.ec8a_extraction as CertificateData["ec8a_extraction"]) ?? null,
    verification: {
      id,
      gps_lat: asNumber(capture.gps_lat ?? verification.gps_lat),
      gps_long: asNumber(capture.gps_long ?? verification.gps_long),
      accuracy: asNumber(capture.accuracy_m ?? verification.accuracy),
      device_timestamp: asString(capture.device_timestamp ?? verification.device_timestamp) || null,
      server_timestamp: asString(capture.server_timestamp ?? verification.server_timestamp) || null,
      hash_chain: asString(chain.hash_chain ?? verification.hash_chain),
      hash_previous: asString(chain.hash_previous ?? verification.hash_previous),
      image_url: asString(media.primary_image_url ?? verification.image_url) || null,
      secondary_image_url: asString(media.secondary_image_url ?? verification.secondary_image_url) || null,
      metadata: verification.metadata as CertificateData["verification"]["metadata"],
      user: {
        name: asString(agent.name) || "—",
        email: asString(agent.email) || "—",
      },
      unit: {
        name: asString(unit.name) || "—",
        state: asString(unit.state),
        lga: asString(unit.lga),
        ward: asString(unit.ward),
      },
    },
  }
}

function formatCoord(lat: number | null, lng: number | null): string {
  if (lat == null || lng == null) return "—"
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
}

function formatWhen(value: string | null): string {
  if (!value) return "—"
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? value : d.toLocaleString()
}

export default function CertificatePage() {
  const params = useParams()
  const id = params?.id as string
  const [data, setData] = useState<CertificateData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [extracting, setExtracting] = useState(false)
  const [extractMsg, setExtractMsg] = useState("")
  const [imageView, setImageView] = useState<"primary" | "secondary" | null>(null)
  const printRef = useRef<HTMLDivElement>(null)

  const token = typeof window !== "undefined" ? localStorage.getItem("vf_token") : ""

  const loadCertificate = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError("")
    try {
      const res = await fetch(apiUrl(`/api/v1/verifications/${id}/certificate`), {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(json.message ?? `Could not load certificate (${res.status}).`)
        setData(null)
        return
      }
      const normalized = normalizeCertificate(json.data as Record<string, unknown>)
      if (!normalized) {
        setError("Certificate data was incomplete.")
        setData(null)
        return
      }
      setData(normalized)
    } catch {
      setError("Failed to load certificate — check your connection and API URL.")
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [id, token])

  useEffect(() => {
    void loadCertificate()
  }, [loadCertificate])

  const handleExtractEc8a = async () => {
    if (!id) return
    setExtracting(true)
    setExtractMsg("")
    try {
      const res = await fetch(apiUrl(`/api/v1/admin/verifications/${id}/extract-ec8a`), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      })
      const json = await res.json()
      setExtractMsg(json.message ?? (res.ok ? "Extraction complete." : "Extraction failed."))
      if (res.ok) await loadCertificate()
    } catch {
      setExtractMsg("Could not run EC8A extraction.")
    } finally {
      setExtracting(false)
    }
  }

  const handlePrint = () => window.print()

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading certificate…</div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="max-w-lg mx-auto py-16 px-4 text-center space-y-4">
        <p className="text-destructive">{error || "Certificate not found."}</p>
        <Link
          href="/submissions"
          className={cn(buttonVariants({ variant: "outline" }), "inline-flex items-center")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to submissions
        </Link>
      </div>
    )
  }

  const v = data.verification

  return (
    <div className="min-h-full bg-muted/30 p-4 md:p-6">
      <div className="print:hidden flex flex-wrap justify-between gap-3 mb-6 max-w-3xl mx-auto">
        <Link
          href="/submissions"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "inline-flex items-center")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Submissions
        </Link>
        <div className="flex flex-wrap justify-end gap-2">
          <Button
            variant="outline"
            className="border-border gap-2"
            onClick={() => void handleExtractEc8a()}
            disabled={extracting}
          >
            {extracting ? "Reading sheet…" : "Extract EC8A (OCR)"}
          </Button>
          <Button variant="outline" className="border-border gap-2" onClick={handlePrint}>
            <Printer className="w-4 h-4" /> Print
          </Button>
          <Button className="bg-primary text-primary-foreground gap-2" onClick={handlePrint}>
            <Download className="w-4 h-4" /> Save as PDF
          </Button>
        </div>
      </div>
      {extractMsg && (
        <p className="print:hidden text-sm text-muted-foreground max-w-3xl mx-auto mb-4">{extractMsg}</p>
      )}

      <div
        ref={printRef}
        className="max-w-3xl mx-auto bg-card border border-border rounded-2xl overflow-hidden shadow-2xl print:shadow-none print:rounded-none"
      >
        <div className="bg-primary px-8 py-6 text-primary-foreground">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold tracking-widest opacity-70 mb-1">OFFICIAL EVIDENCE CERTIFICATE</div>
              <div className="text-2xl font-bold">VeriField</div>
              <div className="text-sm opacity-70">Secure Field Verification System</div>
            </div>
            <div className="text-right">
              <div className="text-xs opacity-70 mb-1">Certificate ID</div>
              <div className="text-xl font-mono font-bold">{data.certificate_id}</div>
              <div className="text-xs opacity-70 mt-1">Issued: {formatWhen(data.issued_at)}</div>
            </div>
          </div>
        </div>

        <div className={`px-8 py-3 flex items-center gap-3 ${
          data.hash_valid
            ? "bg-emerald-500/10 border-b border-emerald-500/20"
            : "bg-destructive/10 border-b border-destructive/20"
        }`}>
          {data.hash_valid
            ? <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
            : <ShieldAlert className="w-5 h-5 text-destructive shrink-0" />
          }
          <div>
            <div className={`font-semibold text-sm ${data.hash_valid ? "text-emerald-500" : "text-destructive"}`}>
              {data.hash_valid ? "Hash Chain: VERIFIED ✓" : "Hash Chain: INTEGRITY FAILURE ✗"}
            </div>
            <div className="text-xs text-muted-foreground">
              {data.hash_valid
                ? "This record has not been tampered with. SHA-256 hash chain is intact."
                : "WARNING: This record may have been altered. Hash does not match."}
            </div>
          </div>
        </div>

        {data.legal_statement && (
          <div className="px-8 py-4 border-b border-border bg-muted/30 text-sm text-muted-foreground leading-relaxed">
            {data.legal_statement}
          </div>
        )}

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                <User className="w-3 h-3" /> Field Agent
              </div>
              <div className="font-semibold text-foreground">{v.user.name}</div>
              <div className="text-sm text-muted-foreground">{v.user.email}</div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                <MapPin className="w-3 h-3" /> Polling Unit / Site
              </div>
              <div className="font-semibold text-foreground">{v.unit.name}</div>
              <div className="text-sm text-muted-foreground">
                {[v.unit.state, v.unit.lga, v.unit.ward].filter(Boolean).join(" › ") || "—"}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                <Clock className="w-3 h-3" /> Timestamps
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Device: </span>
                <span className="font-mono text-foreground text-xs">{formatWhen(v.device_timestamp)}</span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Server: </span>
                <span className="font-mono text-foreground text-xs">{formatWhen(v.server_timestamp)}</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                <MapPin className="w-3 h-3" /> Capture location
              </div>
              <div className="font-mono text-sm text-foreground">
                {formatCoord(v.gps_lat, v.gps_long)}
              </div>
              {v.accuracy != null && (
                <div className="text-xs text-muted-foreground">
                  Device accuracy ±{v.accuracy}m at shutter time
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-border" />

          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              <Hash className="w-3 h-3" /> SHA-256 Hash Chain
            </div>
            <div className="space-y-2">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Previous Hash (H_{"{n-1}"})</div>
                <div className="font-mono text-xs bg-muted p-2 rounded break-all text-muted-foreground">
                  {v.hash_previous || "—"}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Current Hash (H_n)</div>
                <div className={`font-mono text-xs p-2 rounded break-all ${
                  data.hash_valid
                    ? "bg-emerald-500/10 text-emerald-600"
                    : "bg-destructive/10 text-destructive"
                }`}>
                  {v.hash_chain || "—"}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-border" />
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              <Fingerprint className="w-3 h-3" /> Captured Evidence
            </div>
            <div className="flex flex-wrap gap-2 print:hidden">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setImageView("primary")}
              >
                <ImageIcon className="h-4 w-4" /> View primary photo
              </Button>
              {v.secondary_image_url && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => setImageView("secondary")}
                >
                  <ImageIcon className="h-4 w-4" /> View secondary photo
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2 print:hidden">
              Photos load from the API (not a public URL). If loading fails, confirm the file exists on the server under <code className="text-xs">storage/app/public/verification-images/</code>.
            </p>
          </div>

          {data.ec8a_extraction?.data && (
            <>
              <div className="border-t border-border" />
              <div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  EC8A result sheet (extracted)
                </div>
                <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-64">
                  {JSON.stringify(data.ec8a_extraction.data, null, 2)}
                </pre>
                <p className="text-xs text-muted-foreground mt-2">
                  Status: {data.ec8a_extraction.status}
                  {data.ec8a_extraction.extracted_at
                    ? ` · ${formatWhen(data.ec8a_extraction.extracted_at)}`
                    : ""}
                </p>
              </div>
            </>
          )}

          <div className="border-t border-border pt-4 text-center text-xs text-muted-foreground">
            <p>This certificate is system-generated and cryptographically linked to an immutable audit trail.</p>
            <p className="mt-1">Record ID: <span className="font-mono">{v.id}</span></p>
          </div>
        </div>
      </div>

      {imageView && id && (
        <VerificationImageModal
          verificationId={id}
          variant={imageView}
          fallbackUrl={
            imageView === "secondary" ? v.secondary_image_url : v.image_url
          }
          onClose={() => setImageView(null)}
        />
      )}
    </div>
  )
}
