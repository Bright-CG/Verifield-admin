"use client"

import React, { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table"
import { RefreshCw, BarChart3, ExternalLink } from "lucide-react"
import { apiUrl } from "@/lib/api-base"
import { Ec8aDashboard, Ec8aRow, fetchEc8aDashboard } from "@/lib/ec8a"

interface TenantOption {
  id: string
  name: string
}

const STAT_LABELS: Record<string, string> = {
  accredited_voters: "Accredited voters",
  total_valid_votes: "Total valid votes",
  rejected_ballots: "Rejected ballots",
  voters_on_register: "Voters on register",
}

function partySummary(row: Ec8aRow): string {
  const parties = row.ec8a_data?.parties ?? []
  const withVotes = parties.filter((p) => p.code && p.votes != null)
  if (withVotes.length === 0) return "—"
  return withVotes.map((p) => `${p.code}: ${p.votes}`).join(", ")
}

export default function Ec8aPage() {
  const [data, setData] = useState<Ec8aDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [role, setRole] = useState("")
  const [tenantId, setTenantId] = useState("")
  const [tenants, setTenants] = useState<TenantOption[]>([])

  const token = typeof window !== "undefined" ? localStorage.getItem("vf_token") ?? "" : ""

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError("")
    const result = await fetchEc8aDashboard(token, tenantId || undefined)
    setData(result.data)
    if (result.error) setLoadError(result.error)
    setLoading(false)
  }, [token, tenantId])

  useEffect(() => {
    setRole(localStorage.getItem("vf_role") ?? "")
    setTenantId(localStorage.getItem("vf_tenant_id") ?? "")
  }, [])

  useEffect(() => {
    if (role === "super_admin" && token) {
      fetch(apiUrl("/api/v1/tenants"), {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      })
        .then((r) => r.json())
        .then((json) => {
          const list = (json.data ?? []) as { id: string; name: string }[]
          setTenants(list.map((t) => ({ id: t.id, name: t.name })))
        })
        .catch(() => {})
    }
  }, [role, token])

  useEffect(() => {
    if (!token) return
    if (role === "super_admin" && !tenantId) {
      setLoading(false)
      setData(null)
      return
    }
    void load()
  }, [token, role, tenantId, load])

  const partyEntries = Object.entries(data?.party_totals ?? {}).sort(([a], [b]) => a.localeCompare(b))

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">EC8A Results</h2>
          <p className="text-muted-foreground mt-1">
            All completed extractions appear below. Totals include only the latest approved sheet per polling unit; approving a newer submission for the same unit replaces that unit&apos;s contribution.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void load()} className="gap-2">
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      {role === "super_admin" && (
        <Card className="border-border p-4">
          <label className="text-xs text-muted-foreground block mb-1">Organisation</label>
          <select
            className="w-full max-w-md rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={tenantId}
            onChange={(e) => setTenantId(e.target.value)}
          >
            <option value="">Select tenant…</option>
            {tenants.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </Card>
      )}

      {loadError && (
        <Card className="border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          {loadError}
        </Card>
      )}

      {loading ? (
        <Card className="border-border p-8 text-center text-muted-foreground animate-pulse">
          Loading EC8A roll-up…
        </Card>
      ) : role === "super_admin" && !tenantId ? (
        <Card className="border-border p-8 text-center text-muted-foreground">
          Select an organisation to view EC8A totals.
        </Card>
      ) : !data ? (
        <Card className="border-border p-8 text-center text-muted-foreground">
          Could not load EC8A data. Check your connection and try Refresh.
        </Card>
      ) : (
        <>
          <Card className="border-border p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Accumulated totals</h3>
              <span className="text-xs text-muted-foreground ml-auto">
                {(data.units_in_totals ?? data.agents_in_totals)} polling unit{(data.units_in_totals ?? data.agents_in_totals) === 1 ? "" : "s"} counted ·{" "}
                {data.extractions_total} extraction{data.extractions_total === 1 ? "" : "s"} on file
              </span>
            </div>

            {partyEntries.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No approved totals yet — approve extractions in the list below (or on each certificate) to roll up party votes.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {partyEntries.map(([code, total]) => (
                  <div
                    key={code}
                    className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-center"
                  >
                    <div className="text-xs font-medium text-muted-foreground">{code}</div>
                    <div className="text-2xl font-bold tabular-nums">{total.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            )}

            {data.stat_totals && Object.keys(data.stat_totals).length > 0 && (
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(data.stat_totals).map(([key, val]) => (
                  <div key={key} className="text-sm">
                    <span className="text-muted-foreground">{STAT_LABELS[key] ?? key}: </span>
                    <span className="font-semibold tabular-nums">{Number(val).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="border-border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead>Extracted</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>In total?</TableHead>
                  <TableHead>Party votes</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.extractions.length === 0 ? (
                  <TableRow className="border-border">
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No EC8A extractions yet. Run Extract EC8A on a certificate or use Retry EC8A on Submissions.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.extractions.map((row) => (
                    <TableRow key={row.extraction_id} className="border-border hover:bg-muted/30 text-sm">
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {row.extracted_at ? new Date(row.extracted_at).toLocaleString() : "—"}
                      </TableCell>
                      <TableCell>{row.agent_name ?? "—"}</TableCell>
                      <TableCell>
                        <div>{row.unit_name ?? "—"}</div>
                        <div className="text-xs text-muted-foreground">
                          {[row.state, row.lga].filter(Boolean).join(" · ")}
                        </div>
                      </TableCell>
                      <TableCell>
                        {row.review_status !== "approved" ? (
                          <span className="text-amber-600 text-xs font-medium">Pending review</span>
                        ) : row.counts_in_total ? (
                          <span className="text-emerald-600 text-xs font-medium">Yes (latest for unit)</span>
                        ) : (
                          <span className="text-muted-foreground text-xs">No (superseded)</span>
                        )}
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-xs" title={partySummary(row)}>
                        {partySummary(row)}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/certificate/${row.verification_id}`}
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          View <ExternalLink className="h-3 w-3" />
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </>
      )}
    </div>
  )
}
