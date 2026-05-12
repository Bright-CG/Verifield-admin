"use client"

import React, { useEffect, useState, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table"
import {
  AlertTriangle, CheckCircle2, RefreshCw, ShieldAlert, Search
} from "lucide-react"
import { apiUrl } from "@/lib/api-base"

interface DiscrepancyRow {
  unit_id: string
  unit_name: string
  state: string | null
  lga: string | null
  ward: string | null
  total_votes: number
  accredited_voters: number | null
  overvote: number
  flag: "ok" | "overvote" | "no_accredited"
}

// Mock discrepancy data until backend endpoint is built
function getMockData(): DiscrepancyRow[] {
  return [
    {
      unit_id: "a1b2c3", unit_name: "PU 001 - Ward A",
      state: "Lagos", lga: "Ikeja", ward: "Ward 01",
      total_votes: 342, accredited_voters: 310, overvote: 32,
      flag: "overvote",
    },
    {
      unit_id: "d4e5f6", unit_name: "PU 002 - Ward B",
      state: "Lagos", lga: "Ikeja", ward: "Ward 02",
      total_votes: 127, accredited_voters: 200, overvote: 0,
      flag: "ok",
    },
    {
      unit_id: "g7h8i9", unit_name: "Store Alpha - Abuja",
      state: "FCT", lga: "AMAC", ward: "Central",
      total_votes: 89, accredited_voters: null, overvote: 0,
      flag: "no_accredited",
    },
  ]
}

const FLAG_CONFIG = {
  overvote:      { color: "text-destructive bg-destructive/10 border-destructive/20", label: "OVERVOTE ⚠", icon: ShieldAlert },
  ok:            { color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", label: "OK ✓", icon: CheckCircle2 },
  no_accredited: { color: "text-amber-500 bg-amber-500/10 border-amber-500/20", label: "NO DATA", icon: AlertTriangle },
}

export default function DiscrepancyPage() {
  const [rows, setRows] = useState<DiscrepancyRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  const token = typeof window !== "undefined" ? localStorage.getItem("vf_token") : ""

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(apiUrl("/api/v1/discrepancies"), {
        headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" },
      })
      if (res.ok) {
        const json = await res.json()
        setRows(json.data ?? [])
      } else {
        // Backend not yet wired — use mock
        setRows(getMockData())
      }
    } catch {
      setRows(getMockData())
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { fetchData() }, [fetchData])

  const filtered = rows.filter(r =>
    r.unit_name.toLowerCase().includes(search.toLowerCase()) ||
    (r.lga?.toLowerCase().includes(search.toLowerCase()) ?? false)
  )

  const overvoteCount = rows.filter(r => r.flag === "overvote").length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Discrepancy Engine</h2>
          <p className="text-muted-foreground mt-1">
            Auto-flags units where submitted votes exceed accredited voters.
          </p>
        </div>
        <Button variant="outline" size="sm" className="border-border gap-2" onClick={fetchData}>
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-border p-5">
          <div className="text-sm text-muted-foreground">Total Units Checked</div>
          <div className="text-3xl font-bold mt-1">{rows.length}</div>
        </Card>
        <Card className="border-destructive/30 bg-destructive/5 p-5">
          <div className="text-sm text-destructive">Overvote Flags</div>
          <div className="text-3xl font-bold text-destructive mt-1">{overvoteCount}</div>
        </Card>
        <Card className="border-emerald-500/30 bg-emerald-500/5 p-5">
          <div className="text-sm text-emerald-500">Clean Units</div>
          <div className="text-3xl font-bold text-emerald-500 mt-1">
            {rows.filter(r => r.flag === "ok").length}
          </div>
        </Card>
      </div>

      {/* Filter */}
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search units or LGA..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9 bg-background border-input"
        />
      </div>

      {/* Table */}
      <Card className="border-border">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead>Unit</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-right">Total Votes</TableHead>
              <TableHead className="text-right">Accredited</TableHead>
              <TableHead className="text-right">Overvote</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [...Array(4)].map((_, i) => (
                <TableRow key={i} className="border-border">
                  {[...Array(7)].map((_, j) => (
                    <TableCell key={j}>
                      <div className="h-4 bg-muted rounded animate-pulse" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow className="border-border">
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  No discrepancies found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map(row => {
                const cfg = FLAG_CONFIG[row.flag]
                return (
                  <TableRow
                    key={row.unit_id}
                    className={`border-border ${row.flag === "overvote" ? "bg-destructive/[0.02]" : ""}`}
                  >
                    <TableCell className="font-medium">{row.unit_name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {[row.state, row.lga, row.ward].filter(Boolean).join(" › ")}
                    </TableCell>
                    <TableCell className="text-right font-mono">{row.total_votes}</TableCell>
                    <TableCell className="text-right font-mono">
                      {row.accredited_voters ?? <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className={`text-right font-mono font-bold ${
                      row.overvote > 0 ? "text-destructive" : "text-muted-foreground"
                    }`}>
                      {row.overvote > 0 ? `+${row.overvote}` : "—"}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold border ${cfg.color}`}>
                        <cfg.icon className="w-3 h-3" />
                        {cfg.label}
                      </span>
                    </TableCell>
                    <TableCell>
                      <a
                        href={`/certificate/${row.unit_id}`}
                        className="text-xs text-primary hover:underline"
                      >
                        View Records
                      </a>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
