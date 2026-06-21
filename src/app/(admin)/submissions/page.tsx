"use client"

import React, { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table"
import { RefreshCw, ImageIcon, MapPin, ExternalLink } from "lucide-react"
import { apiUrl } from "@/lib/api-base"
import { fetchSubmissions, SubmissionItem } from "@/lib/submissions"
import { VerificationImageModal } from "@/components/verification-image-modal"

interface TenantOption {
  id: string
  name: string
}

type ImageView = {
  id: string
  variant: "primary" | "secondary"
  title: string
  fallbackUrl?: string | null
}

export default function SubmissionsPage() {
  const [items, setItems] = useState<SubmissionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [role, setRole] = useState("")
  const [tenantId, setTenantId] = useState("")
  const [tenants, setTenants] = useState<TenantOption[]>([])
  const [imageView, setImageView] = useState<ImageView | null>(null)
  const [loadError, setLoadError] = useState("")

  const token = typeof window !== "undefined" ? localStorage.getItem("vf_token") ?? "" : ""

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError("")
    const result = await fetchSubmissions(token, page, tenantId || undefined)
    if (result.page) {
      setItems(result.page.data ?? [])
      setLastPage(result.page.last_page ?? 1)
    } else {
      setItems([])
      setLoadError(result.error ?? "Could not load submissions.")
    }
    setLoading(false)
  }, [token, page, tenantId])

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
      setItems([])
      return
    }
    void load()
  }, [token, role, tenantId, load])

  const formatParties = (row: SubmissionItem) => {
    const parties = (row.ec8a_data?.parties ?? []) as { code?: string; votes?: number | null }[]
    const withVotes = parties.filter((p) => p.code && p.votes != null)
    if (withVotes.length === 0) return "—"
    return withVotes.map((p) => `${p.code}: ${p.votes}`).join(", ")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">All Submissions</h2>
          <p className="text-muted-foreground mt-1">
            Every capture by your agents — including repeat submissions for the same polling unit.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void load()} className="gap-2">
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      {loadError && (
        <Card className="border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          {loadError}
          {role === "super_admin" && !tenantId && (
            <span> Select an organisation above (same as War Room).</span>
          )}
        </Card>
      )}

      {role === "super_admin" && (
        <Card className="border-border p-4">
          <label className="text-xs text-muted-foreground block mb-1">Organisation</label>
          <select
            className="w-full max-w-md rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={tenantId}
            onChange={(e) => {
              const v = e.target.value
              setTenantId(v)
              localStorage.setItem("vf_tenant_id", v)
              setPage(1)
            }}
          >
            <option value="">Select tenant…</option>
            {tenants.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </Card>
      )}

      <Card className="border-border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead>Submitted</TableHead>
              <TableHead>Agent</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>GPS</TableHead>
              <TableHead>EC8A</TableHead>
              <TableHead>Photos</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i} className="border-border">
                  {[...Array(7)].map((_, j) => (
                    <TableCell key={j}><div className="h-4 bg-muted rounded animate-pulse" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : items.length === 0 ? (
              <TableRow className="border-border">
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  {role === "super_admin" && !tenantId
                    ? "Select an organisation to view submissions."
                    : "No submissions yet."}
                </TableCell>
              </TableRow>
            ) : (
              items.map((row) => (
                <TableRow key={row.id} className="border-border hover:bg-muted/30 text-sm">
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {row.server_timestamp
                      ? new Date(row.server_timestamp).toLocaleString()
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{row.agent_name ?? "—"}</div>
                    <div className="text-xs text-muted-foreground">{row.agent_email ?? ""}</div>
                  </TableCell>
                  <TableCell>
                    <div>{row.unit_name ?? "—"}</div>
                    <div className="text-xs text-muted-foreground">
                      {[row.state, row.lga, row.ward].filter(Boolean).join(" · ")}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {row.gps_lat != null && row.gps_long != null ? (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {Number(row.gps_lat).toFixed(5)}, {Number(row.gps_long).toFixed(5)}
                        {row.accuracy != null && (
                          <span className="text-muted-foreground"> ±{Number(row.accuracy).toFixed(0)}m</span>
                        )}
                      </span>
                    ) : "—"}
                  </TableCell>
                  <TableCell>
                    <div className="text-xs">{row.ec8a_status ?? "—"}</div>
                    <div className="text-xs text-muted-foreground max-w-[200px] truncate" title={formatParties(row)}>
                      {formatParties(row)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {(row.has_primary_file || row.image_url) && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs gap-1"
                          onClick={() => setImageView({
                            id: row.id,
                            variant: "primary",
                            title: `${row.unit_name ?? "Unit"} — primary`,
                            fallbackUrl: row.image_url,
                          })}
                        >
                          <ImageIcon className="h-3 w-3" /> Primary
                        </Button>
                      )}
                      {(row.has_secondary_file || row.secondary_image_url) && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs gap-1"
                          onClick={() => setImageView({
                            id: row.id,
                            variant: "secondary",
                            title: `${row.unit_name ?? "Unit"} — secondary`,
                            fallbackUrl: row.secondary_image_url,
                          })}
                        >
                          <ImageIcon className="h-3 w-3" /> Secondary
                        </Button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/certificate/${row.id}`}
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      Certificate <ExternalLink className="h-3 w-3" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {lastPage > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <span className="text-sm text-muted-foreground">Page {page} of {lastPage}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
              <Button variant="outline" size="sm" disabled={page === lastPage} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          </div>
        )}
      </Card>

      {imageView && (
        <VerificationImageModal
          verificationId={imageView.id}
          variant={imageView.variant}
          title={imageView.title}
          fallbackUrl={imageView.fallbackUrl}
          onClose={() => setImageView(null)}
        />
      )}
    </div>
  )
}
