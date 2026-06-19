"use client"

import React, { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Users, ShieldCheck, Activity, TrendingUp, Map, AlertTriangle,
  RefreshCw, FileSpreadsheet,
} from "lucide-react"
import { apiUrl } from "@/lib/api-base"
import { fetchAdminDashboard, type DashboardPayload } from "@/lib/admin-dashboard"

interface TenantOption {
  id: string
  name: string
}

export default function DashboardPage() {
  const [role, setRole] = useState("")
  const [tenantId, setTenantId] = useState("")
  const [tenants, setTenants] = useState<TenantOption[]>([])
  const [data, setData] = useState<DashboardPayload | null>(null)
  const [loading, setLoading] = useState(true)

  const token = typeof window !== "undefined" ? localStorage.getItem("vf_token") ?? "" : ""

  const load = useCallback(async () => {
    if (!token) return
    setLoading(true)
    const payload = await fetchAdminDashboard(token, tenantId || undefined)
    setData(payload)
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
    if (!token || !role) return
    void load()
  }, [token, tenantId, role, load])

  const isPlatform = data?.scope === "platform"
  const stats = data?.stats ?? {}
  const system = data?.system

  const statCards = isPlatform
    ? [
        { title: "Total Tenants", value: stats.total_tenants, icon: Users, note: "Active organisations" },
        { title: "Verifications Today", value: stats.verifications_today, icon: ShieldCheck, note: "All tenants" },
        { title: "Active Field Agents", value: stats.active_agents, icon: TrendingUp, note: "Staff accounts" },
        { title: "Total Verifications", value: stats.total_verifications, icon: Activity, note: "Immutable ledger" },
        { title: "EC8A Extracted", value: stats.ec8a_extractions, icon: FileSpreadsheet, note: "Result sheets OCR/manual" },
      ]
    : [
        { title: "Units on Map", value: stats.total_units, icon: Map, note: "With coordinates" },
        { title: "Verified", value: stats.verified, icon: ShieldCheck, note: "Latest status per unit" },
        { title: "Verifications Today", value: stats.verifications_today, icon: Activity, note: "Server timestamp" },
        { title: "EC8A Extracted", value: stats.ec8a_extractions, icon: FileSpreadsheet, note: "Sheets with parsed results" },
      ]

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">System Overview</h2>
          <p className="text-muted-foreground mt-1">
            {isPlatform
              ? "Platform-wide metrics across all tenants."
              : "Live counters for your organisation — synced with War Room."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {role === "super_admin" && tenants.length > 0 && (
            <select
              className="h-9 rounded-md border border-border bg-background px-3 text-sm"
              value={tenantId}
              onChange={(e) => {
                const v = e.target.value
                setTenantId(v)
                localStorage.setItem("vf_tenant_id", v)
              }}
            >
              <option value="">Select tenant…</option>
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          )}
          <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          {!isPlatform && tenantId && (
            <Link
              href="/war-room"
              className="inline-flex h-7 items-center rounded-[min(var(--radius-md),12px)] bg-primary px-2.5 text-[0.8rem] font-medium text-primary-foreground hover:bg-primary/80"
            >
              Open War Room
            </Link>
          )}
        </div>
      </div>

      {loading && !data ? (
        <p className="text-muted-foreground">Loading dashboard…</p>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {statCards.map((stat) => (
              <Card key={stat.title} className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {stat.value ?? "—"}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{stat.note}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {!isPlatform && data?.war_room && (
            <div className="grid gap-4 md:grid-cols-3 text-sm">
              <Card className="bg-card border-border p-4">
                <span className="text-muted-foreground">Pending units</span>
                <p className="text-2xl font-bold mt-1">{data.war_room.pending}</p>
              </Card>
              <Card className="bg-card border-border p-4">
                <span className="text-muted-foreground">Off-site captures</span>
                <p className="text-2xl font-bold mt-1">{data.war_room.off_site}</p>
              </Card>
              <Card className="bg-card border-border p-4">
                <span className="text-muted-foreground">Clean units</span>
                <p className="text-2xl font-bold mt-1">{data.war_room.clean_units}</p>
              </Card>
            </div>
          )}
        </>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">System Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {system &&
              [
                { label: "Laravel API", slice: system.api },
                { label: "MySQL Database", slice: system.database },
                { label: "Broadcast driver", slice: system.broadcast },
                { label: "Laravel Reverb", slice: system.reverb },
                { label: "Spatial queries", slice: system.spatial },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span
                    className={`font-medium ${item.slice.ok ? "text-emerald-500" : "text-amber-500"}`}
                  >
                    {item.slice.status}
                  </span>
                </div>
              ))}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Security Posture</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Sanctum Auth", status: "Active" },
              { label: "Immutable Triggers", status: "Active" },
              { label: "Capture-time GPS lock", status: "Active" },
              { label: "Multi-Tenant Isolation", status: "Active" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-medium text-emerald-500">{item.status}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
