"use client"

import React, { useEffect, useState, useRef } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  ShieldCheck, ShieldAlert, Printer, Download,
  MapPin, Clock, User, Hash, Fingerprint, ImageIcon,
} from "lucide-react"
import { apiUrl } from "@/lib/api-base"
import { VerificationImageModal } from "@/components/verification-image-modal"

interface CertificateData {
  verification: {
    id: string
    gps_lat: number
    gps_long: number
    device_timestamp: string
    server_timestamp: string
    hash_chain: string
    hash_previous: string
    image_url: string
    secondary_image_url?: string | null
    accuracy: number
    metadata: { distance_from_unit: number; is_off_site: boolean }
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

  useEffect(() => {
    if (!id) return
    fetch(apiUrl(`/api/v1/verifications/${id}/certificate`), {
      headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" },
    })
      .then(r => r.json())
      .then(json => { setData(json.data); setLoading(false) })
      .catch(() => { setError("Failed to load certificate."); setLoading(false) })
  }, [id, token])

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
      if (res.ok) {
        const cert = await fetch(apiUrl(`/api/v1/verifications/${id}/certificate`), {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        })
        const certJson = await cert.json()
        setData(certJson.data)
      }
    } catch {
      setExtractMsg("Could not run EC8A extraction.")
    } finally {
      setExtracting(false)
    }
  }

  const handlePrint = () => window.print()

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-muted-foreground">Loading certificate...</div>
    </div>
  )

  if (error || !data) return (
    <div className="min-h-screen flex items-center justify-center text-destructive">{error || "Not found"}</div>
  )

  const v = data.verification

  return (
    <div className="min-h-screen bg-muted/30 p-6">
      {/* Action Buttons — hidden during print */}
      <div className="print:hidden flex justify-end gap-3 mb-6 max-w-3xl mx-auto">
        <Button
          variant="outline"
          className="border-border gap-2"
          onClick={() => void handleExtractEc8a()}
          disabled={extracting}
        >
          {extracting ? "Reading sheet…" : "Extract EC8A (OCR)"}
        </Button>
        <Button variant="outline" className="border-border gap-2" onClick={handlePrint}>
          <Printer className="w-4 h-4" /> Print Certificate
        </Button>
        <Button className="bg-primary text-primary-foreground gap-2" onClick={handlePrint}>
          <Download className="w-4 h-4" /> Save as PDF
        </Button>
      </div>
      {extractMsg && (
        <p className="print:hidden text-sm text-muted-foreground max-w-3xl mx-auto mb-4">{extractMsg}</p>
      )}

      {/* Certificate Document */}
      <div
        ref={printRef}
        className="max-w-3xl mx-auto bg-card border border-border rounded-2xl overflow-hidden shadow-2xl print:shadow-none print:rounded-none"
      >
        {/* Header Band */}
        <div className="bg-primary px-8 py-6 text-primary-foreground">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold tracking-widest opacity-70 mb-1">OFFICIAL EVIDENCE CERTIFICATE</div>
              <div className="text-2xl font-bold">VeriField</div>
              <div className="text-sm opacity-70">Secure Field Verification System</div>
            </div>
            <div className="text-right">
              <div className="text-xs opacity-70 mb-1">Certificate ID</div>
              <div className="text-xl font-mono font-bold">{data.certificate_id}</div>
              <div className="text-xs opacity-70 mt-1">
                Issued: {new Date(data.issued_at).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Hash Chain Validity Banner */}
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
          {/* Two Column Grid */}
          <div className="grid grid-cols-2 gap-6">
            {/* Agent Info */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                <User className="w-3 h-3" /> Field Agent
              </div>
              <div className="font-semibold text-foreground">{v.user?.name ?? "—"}</div>
              <div className="text-sm text-muted-foreground">{v.user?.email ?? "—"}</div>
            </div>

            {/* Unit Info */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                <MapPin className="w-3 h-3" /> Polling Unit / Site
              </div>
              <div className="font-semibold text-foreground">{v.unit?.name ?? "—"}</div>
              <div className="text-sm text-muted-foreground">
                {[v.unit?.state, v.unit?.lga, v.unit?.ward].filter(Boolean).join(" › ")}
              </div>
            </div>

            {/* Timestamps */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                <Clock className="w-3 h-3" /> Timestamps
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Device: </span>
                <span className="font-mono text-foreground text-xs">{new Date(v.device_timestamp).toLocaleString()}</span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Server: </span>
                <span className="font-mono text-foreground text-xs">{new Date(v.server_timestamp).toLocaleString()}</span>
              </div>
            </div>

            {/* GPS */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                <MapPin className="w-3 h-3" /> Capture location (watermarked on photo)
              </div>
              <div className="font-mono text-sm text-foreground">
                {v.gps_lat.toFixed(6)}, {v.gps_long.toFixed(6)}
              </div>
              <div className="text-xs text-muted-foreground">
                Device accuracy ±{v.accuracy}m at shutter time
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border" />

          {/* Hash Chain */}
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              <Hash className="w-3 h-3" /> SHA-256 Hash Chain
            </div>
            <div className="space-y-2">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Previous Hash (H_{"{n-1}"})</div>
                <div className="font-mono text-xs bg-muted p-2 rounded break-all text-muted-foreground">
                  {v.hash_previous}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Current Hash (H_n)</div>
                <div className={`font-mono text-xs p-2 rounded break-all ${
                  data.hash_valid
                    ? "bg-emerald-500/10 text-emerald-600"
                    : "bg-destructive/10 text-destructive"
                }`}>
                  {v.hash_chain}
                </div>
              </div>
            </div>
          </div>

          {/* Captured Images */}
          {(v.image_url || v.secondary_image_url) && (
            <>
              <div className="border-t border-border" />
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  <Fingerprint className="w-3 h-3" /> Captured Evidence
                </div>
                <div className="flex flex-wrap gap-2 print:hidden">
                  {v.image_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => setImageView("primary")}
                    >
                      <ImageIcon className="h-4 w-4" /> View primary
                    </Button>
                  )}
                  {v.secondary_image_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => setImageView("secondary")}
                    >
                      <ImageIcon className="h-4 w-4" /> View secondary
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}

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
                    ? ` · ${new Date(data.ec8a_extraction.extracted_at).toLocaleString()}`
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
          onClose={() => setImageView(null)}
        />
      )}
    </div>
  )
}
