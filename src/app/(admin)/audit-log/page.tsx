"use client"

import React, { useEffect, useState, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table"
import { ShieldCheck, Search, RefreshCw, AlertTriangle, Info } from "lucide-react"
import { apiUrl } from "@/lib/api-base"

interface AuditLog {
  id: string
  action: string
  entity_type: string | null
  entity_id: string | null
  ip_address: string | null
  changes: Record<string, any> | null
  created_at: string
  user: { id: string; name: string; email: string } | null
}

const ACTION_COLORS: Record<string, string> = {
  "verification.submitted": "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  "tenant.created":         "text-blue-500 bg-blue-500/10 border-blue-500/20",
  "staff.created":          "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
  "login":                  "text-slate-400 bg-slate-500/10 border-slate-500/20",
  "fraud.detected":         "text-red-500 bg-red-500/10 border-red-500/20",
}

function ActionBadge({ action }: { action: string }) {
  const cls = ACTION_COLORS[action] ?? "text-muted-foreground bg-muted border-border"
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${cls}`}>
      {action}
    </span>
  )
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)

  const token = typeof window !== "undefined" ? localStorage.getItem("vf_token") : ""

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page) })
      if (search) params.set("action", search)
      if (from)   params.set("from", from)
      if (to)     params.set("to", to)

      const res = await fetch(apiUrl(`/api/v1/audit-logs?${params}`), {
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      })
      if (res.ok) {
        const json = await res.json()
        setLogs(json.data?.data ?? [])
        setLastPage(json.data?.last_page ?? 1)
      }
    } catch { /* backend offline */ }
    finally { setLoading(false) }
  }, [page, search, from, to, token])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Audit Trail</h2>
          <p className="text-muted-foreground mt-1">
            Immutable log of all actions taken on this platform. Read-only — even Super Admins cannot edit these records.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchLogs} className="border-border gap-2">
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      {/* Filter Bar */}
      <Card className="border-border p-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs text-muted-foreground block mb-1">Filter by Action</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="e.g. verification.submitted"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                className="pl-9 bg-background border-input"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">From Date</label>
            <Input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1) }}
              className="bg-background border-input" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">To Date</label>
            <Input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1) }}
              className="bg-background border-input" />
          </div>
          <Button onClick={fetchLogs} className="bg-primary text-primary-foreground hover:bg-primary/90">
            Apply
          </Button>
        </div>
      </Card>

      {/* Log Table */}
      <Card className="border-border">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead>Timestamp</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Performed By</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i} className="border-border">
                  {[...Array(6)].map((_, j) => (
                    <TableCell key={j}>
                      <div className="h-4 bg-muted rounded animate-pulse" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : logs.length === 0 ? (
              <TableRow className="border-border">
                <TableCell colSpan={6} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <ShieldCheck className="h-8 w-8 opacity-30" />
                    <p>No audit logs yet. Activity will appear here as users interact with the system.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id} className="border-border hover:bg-muted/30 text-sm">
                  <TableCell className="text-muted-foreground whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <ActionBadge action={log.action} />
                  </TableCell>
                  <TableCell>
                    {log.user ? (
                      <div>
                        <div className="font-medium">{log.user.name}</div>
                        <div className="text-xs text-muted-foreground">{log.user.email}</div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">System</span>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {log.entity_type ? (
                      <span>{log.entity_type?.split("\\").pop()}<br />{log.entity_id?.slice(0, 8)}...</span>
                    ) : "—"}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {log.ip_address || "—"}
                  </TableCell>
                  <TableCell>
                    {log.changes ? (
                      <details className="cursor-pointer">
                        <summary className="text-xs text-primary flex items-center gap-1">
                          <Info className="h-3 w-3" /> View
                        </summary>
                        <pre className="mt-1 text-xs bg-muted p-2 rounded max-w-xs overflow-auto">
                          {JSON.stringify(log.changes, null, 2)}
                        </pre>
                      </details>
                    ) : "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {lastPage > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <span className="text-sm text-muted-foreground">Page {page} of {lastPage}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="border-border" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
              <Button variant="outline" size="sm" className="border-border" disabled={page === lastPage} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
