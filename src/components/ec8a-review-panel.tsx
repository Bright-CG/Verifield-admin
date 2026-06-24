"use client"

import React, { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { apiUrl } from "@/lib/api-base"
import { VerificationCaptureImage } from "@/components/verification-capture-image"
import { CheckCircle2, Loader2, Save } from "lucide-react"

const PARTY_CODES = [
  "APC", "PDP", "LP", "NNPP", "APGA", "ADC", "SDP", "YPP", "ZLP", "NRM", "ADP",
]

const STAT_FIELDS = [
  { key: "voters_on_register", label: "Voters on register" },
  { key: "accredited_voters", label: "Accredited voters" },
  { key: "total_valid_votes", label: "Total valid votes" },
  { key: "rejected_ballots", label: "Rejected ballots" },
] as const

export interface Ec8aExtractionShape {
  status: string
  review_status?: string
  ec8a_data?: Record<string, unknown> | null
  error_message?: string | null
}

interface Ec8aReviewPanelProps {
  verificationId: string
  token: string
  extraction: Ec8aExtractionShape | null | undefined
  onUpdated: () => void
}

function partyRows(data: Record<string, unknown>): { code: string; votes: string }[] {
  const parties = data.parties
  if (!Array.isArray(parties) || parties.length === 0) {
    return PARTY_CODES.map((code) => ({ code, votes: "" }))
  }
  const map = new Map<string, string>()
  for (const row of parties) {
    if (row && typeof row === "object") {
      const r = row as Record<string, unknown>
      const code = String(r.code ?? "").toUpperCase()
      if (code) map.set(code, r.votes != null ? String(r.votes) : "")
    }
  }
  const codes = new Set([...map.keys(), ...PARTY_CODES])
  return [...codes].sort().map((code) => ({
    code,
    votes: map.get(code) ?? "",
  }))
}

export function Ec8aReviewPanel({
  verificationId,
  token,
  extraction,
  onUpdated,
}: Ec8aReviewPanelProps) {
  const [stats, setStats] = useState<Record<string, string>>({})
  const [parties, setParties] = useState<{ code: string; votes: string }[]>([])
  const [notes, setNotes] = useState("")
  const [saving, setSaving] = useState(false)
  const [approving, setApproving] = useState(false)
  const [message, setMessage] = useState("")
  const [primaryImageUrl, setPrimaryImageUrl] = useState<string | null>(null)

  const ec8a = (extraction?.ec8a_data ?? {}) as Record<string, unknown>
  const canEdit =
    extraction &&
    ["completed", "manual"].includes(extraction.status) &&
    extraction.review_status !== "approved"

  useEffect(() => {
    const nextStats: Record<string, string> = {}
    for (const { key } of STAT_FIELDS) {
      nextStats[key] = ec8a[key] != null ? String(ec8a[key]) : ""
    }
    setStats(nextStats)
    setParties(partyRows(ec8a))
  }, [extraction])

  useEffect(() => {
    if (!verificationId || !token) return
    fetch(apiUrl(`/api/v1/verifications/${verificationId}/result-sheet`), {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    })
      .then((r) => r.json())
      .then((json) => {
        const url =
          json.data?.primary_image_url
          ?? json.data?.image_url
          ?? null
        if (typeof url === "string" && url) setPrimaryImageUrl(url)
      })
      .catch(() => {})
  }, [verificationId, token])

  const buildPayload = useCallback(() => {
    const partyPayload = parties
      .filter((p) => p.code.trim() !== "")
      .map((p) => ({
        code: p.code.trim().toUpperCase(),
        votes: p.votes === "" ? null : Number(p.votes),
      }))

    return {
      ...ec8a,
      form: "EC8A",
      voters_on_register: stats.voters_on_register === "" ? null : Number(stats.voters_on_register),
      accredited_voters: stats.accredited_voters === "" ? null : Number(stats.accredited_voters),
      total_valid_votes: stats.total_valid_votes === "" ? null : Number(stats.total_valid_votes),
      rejected_ballots: stats.rejected_ballots === "" ? null : Number(stats.rejected_ballots),
      parties: partyPayload,
    }
  }, [ec8a, parties, stats])

  const saveCorrections = async () => {
    setSaving(true)
    setMessage("")
    try {
      const res = await fetch(
        apiUrl(`/api/v1/admin/verifications/${verificationId}/result-sheet`),
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ec8a_data: buildPayload() }),
        }
      )
      const json = await res.json()
      if (!res.ok) {
        setMessage(json.message ?? "Could not save corrections.")
        return
      }
      setMessage("Corrections saved. The captured image is unchanged.")
      onUpdated()
    } catch {
      setMessage("Network error saving corrections.")
    } finally {
      setSaving(false)
    }
  }

  const approveResults = async () => {
    setApproving(true)
    setMessage("")
    try {
      const res = await fetch(
        apiUrl(`/api/v1/admin/verifications/${verificationId}/result-sheet/approve`),
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ review_notes: notes || null }),
        }
      )
      const json = await res.json()
      if (!res.ok) {
        setMessage(json.message ?? "Could not approve results.")
        return
      }
      setMessage("Results approved — they will count on the EC8A dashboard.")
      onUpdated()
    } catch {
      setMessage("Network error approving results.")
    } finally {
      setApproving(false)
    }
  }

  if (!extraction) {
    return (
      <p className="text-sm text-muted-foreground">
        No EC8A extraction yet. Run OCR after the scanned image syncs, or wait for automatic server processing.
      </p>
    )
  }

  if (extraction.status === "pending" || extraction.status === "no_api_key") {
    return (
      <p className="text-sm text-muted-foreground">
        {extraction.error_message ??
          "OCR pending — configure Vision API in Settings or wait for the background job."}
      </p>
    )
  }

  if (extraction.status === "failed") {
    return (
      <p className="text-sm text-destructive">
        OCR failed: {extraction.error_message ?? "Unknown error"}. Retake is not possible — edit counters manually after re-running Extract EC8A.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-muted-foreground">OCR status:</span>
        <span className="font-medium">{extraction.status}</span>
        <span className="text-muted-foreground">· Review:</span>
        <span
          className={
            extraction.review_status === "approved"
              ? "text-emerald-500 font-medium"
              : "text-amber-500 font-medium"
          }
        >
          {extraction.review_status ?? "pending_review"}
        </span>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">
        Compare party counters against the captured EC8A image. OCR often misreads handwriting — edit mismatches, save, then approve.
        Only approved results roll up to the EC8A dashboard totals.
      </p>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        <VerificationCaptureImage
          verificationId={verificationId}
          variant="primary"
          fallbackUrl={primaryImageUrl}
          title="Primary capture (used for OCR)"
        />

        <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {STAT_FIELDS.map(({ key, label }) => (
          <div key={key}>
            <label className="text-xs text-muted-foreground">{label}</label>
            <Input
              type="number"
              min={0}
              value={stats[key] ?? ""}
              disabled={!canEdit}
              onChange={(e) => setStats((s) => ({ ...s, [key]: e.target.value }))}
              className="mt-1"
            />
          </div>
        ))}
      </div>

      <div>
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          Party votes
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1">
          {parties.map((p, idx) => (
            <div key={`${p.code}-${idx}`} className="flex gap-2 items-center">
              <Input
                value={p.code}
                disabled={!canEdit}
                onChange={(e) => {
                  const next = [...parties]
                  next[idx] = { ...next[idx], code: e.target.value.toUpperCase() }
                  setParties(next)
                }}
                className="w-16 font-mono text-xs"
              />
              <Input
                type="number"
                min={0}
                value={p.votes}
                disabled={!canEdit}
                onChange={(e) => {
                  const next = [...parties]
                  next[idx] = { ...next[idx], votes: e.target.value }
                  setParties(next)
                }}
                className="flex-1"
              />
            </div>
          ))}
        </div>
      </div>

      {canEdit && (
        <div>
          <label className="text-xs text-muted-foreground">Review notes (optional)</label>
          <Input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Corrected APC count after visual check"
            className="mt-1"
          />
        </div>
      )}

      {message && <p className="text-sm text-muted-foreground">{message}</p>}

      {canEdit && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={saving}
            onClick={() => void saveCorrections()}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save corrections
          </Button>
          <Button
            size="sm"
            className="gap-2 bg-emerald-600 hover:bg-emerald-700"
            disabled={approving}
            onClick={() => void approveResults()}
          >
            {approving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            Approve for dashboard
          </Button>
        </div>
      )}

      {extraction.review_status === "approved" && (
        <p className="text-sm text-emerald-500 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" /> Approved — counting in EC8A totals.
        </p>
      )}
        </div>
      </div>
    </div>
  )
}
