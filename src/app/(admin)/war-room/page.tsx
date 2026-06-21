"use client"

import React, { useCallback, useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { useSearchParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table"
import {
  AlertTriangle, CheckCircle2, Map as MapIcon, RefreshCw,
  SignalHigh, WifiOff, MapPin, Search, Table2, ImageIcon,
} from "lucide-react"
import { apiUrl, broadcastAuthUrl, getReverbEchoConfig } from "@/lib/api-base"
import {
  SubmissionRow,
  SubmissionFlag,
  WarRoomMapUnit,
  WarRoomPayload,
  fetchWarRoom,
} from "@/lib/war-room"
import { VerificationImageModal } from "@/components/verification-image-modal"

const MapWithNoSSR = dynamic(() => import("@/components/LiveMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-background/50 text-primary animate-pulse">
      Initializing map…
    </div>
  ),
})

interface LiveEvent {
  id: string
  unitName: string | null
  agentName: string | null
  lat: number
  lng: number
  timestamp: Date
}

interface TenantOption {
  id: string
  name: string
}

const FLAG_CONFIG: Record<SubmissionFlag, { color: string; label: string; icon: typeof CheckCircle2 }> = {
  ok: { color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", label: "CAPTURED", icon: CheckCircle2 },
}

export default function WarRoomPage() {
  const searchParams = useSearchParams()
  const initialTab =
    searchParams.get("tab") === "submissions" || searchParams.get("tab") === "discrepancy"
      ? "submissions"
      : "map"

  const [tab, setTab] = useState<"map" | "submissions">(initialTab)
  const [payload, setPayload] = useState<WarRoomPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [feed, setFeed] = useState<LiveEvent[]>([])
  const [connected, setConnected] = useState(false)
  const [echoError, setEchoError] = useState(false)
  const [search, setSearch] = useState("")
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null)
  const [role, setRole] = useState("")
  const [tenantId, setTenantId] = useState("")
  const [tenants, setTenants] = useState<TenantOption[]>([])
  const [imageView, setImageView] = useState<{
    id: string
    variant: "primary" | "secondary"
    title: string
    fallbackUrl?: string | null
  } | null>(null)

  const token = typeof window !== "undefined" ? localStorage.getItem("vf_token") ?? "" : ""

  const loadWarRoom = useCallback(async (overrideTenant?: string) => {
    setLoading(true)
    const tid = overrideTenant ?? tenantId
    const data = await fetchWarRoom(token, tid || undefined)
    setPayload(data)
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
      setPayload(null)
      return
    }
    void loadWarRoom()
  }, [token, role, tenantId, loadWarRoom])

  const handleVerification = useCallback((event: {
    id: string
    unit_id: string
    unit_name: string | null
    gps_lat: number
    gps_long: number
    agent?: { name?: string | null }
  }) => {
    const newEvent: LiveEvent = {
      id: event.id,
      unitName: event.unit_name,
      agentName: event.agent?.name ?? "Unknown Agent",
      lat: Number(event.gps_lat),
      lng: Number(event.gps_long),
      timestamp: new Date(),
    }
    setFeed((prev) => [newEvent, ...prev].slice(0, 20))

    setPayload((prev) => {
      if (!prev) return prev
      const mapUnits = prev.map_units.map((u) =>
        u.id === event.unit_id
          ? {
              ...u,
              status: "Verified" as const,
              lat: Number(event.gps_lat),
              lng: Number(event.gps_long),
              flag: "ok" as const,
              latest_verification_id: event.id,
            }
          : u
      )
      const exists = mapUnits.some((u) => u.id === event.unit_id)
      const units = exists
        ? mapUnits
        : [
            ...mapUnits,
            {
              id: event.unit_id,
              name: event.unit_name ?? "New submission",
              lat: Number(event.gps_lat),
              lng: Number(event.gps_long),
              state: null,
              lga: null,
              ward: null,
              status: "Verified" as const,
              flag: "ok",
              latest_verification_id: event.id,
              image_url: null,
              agent_name: event.agent?.name ?? null,
              verified_at: new Date().toISOString(),
            } satisfies WarRoomMapUnit,
          ]

      return {
        ...prev,
        map_units: units,
        summary: {
          ...prev.summary,
          verified: units.filter((u) => u.status === "Verified").length,
          pending: units.filter((u) => u.status === "Pending").length,
        },
      }
    })
  }, [])

  useEffect(() => {
    let echo: { disconnect: () => void } | null = null
    const tid = tenantId
    if (!tid || !token) return

    const initEcho = async () => {
      try {
        const [{ default: Echo }, { default: Pusher }] = await Promise.all([
          import("laravel-echo"),
          import("pusher-js"),
        ])
        ;(window as unknown as { Pusher: typeof Pusher }).Pusher = Pusher
        const rv = getReverbEchoConfig()
        const instance = new Echo({
          broadcaster: "reverb",
          key: rv.key,
          wsHost: rv.wsHost,
          wsPort: rv.wsPort,
          wssPort: rv.wssPort,
          forceTLS: rv.forceTLS,
          enabledTransports: rv.enabledTransports,
          authEndpoint: broadcastAuthUrl(),
          auth: {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        })
        instance
          .private(`verifications.${tid}`)
          .listen(".verification.received", (e: Parameters<typeof handleVerification>[0]) => {
            handleVerification(e)
          })
        const pusher = instance.connector.pusher
        pusher.connection.bind("connected", () => setConnected(true))
        pusher.connection.bind("disconnected", () => setConnected(false))
        setConnected(pusher.connection.state === "connected")
        echo = instance
      } catch {
        setEchoError(true)
      }
    }
    void initEcho()
    return () => echo?.disconnect()
  }, [tenantId, token, handleVerification])

  const summary = payload?.summary
  const mapUnits = payload?.map_units ?? []
  const rows = payload?.submissions ?? payload?.discrepancies ?? []
  const filteredRows = rows.filter(
    (r) =>
      r.unit_name.toLowerCase().includes(search.toLowerCase()) ||
      (r.lga?.toLowerCase().includes(search.toLowerCase()) ?? false)
  )

  const timeAgo = (date: Date) => {
    const secs = Math.floor((Date.now() - date.getTime()) / 1000)
    if (secs < 60) return `${secs}s ago`
    if (secs < 3600) return `${Math.floor(secs / 60)}m ago`
    return `${Math.floor(secs / 3600)}h ago`
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">War Room</h2>
          <p className="text-muted-foreground mt-1">
            Live map and field submissions — photo evidence with real-time Reverb updates.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {role === "super_admin" && (
            <select
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              value={tenantId}
              onChange={(e) => {
                setTenantId(e.target.value)
                localStorage.setItem("vf_tenant_id", e.target.value)
              }}
            >
              <option value="">Select tenant…</option>
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          )}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${
            echoError
              ? "bg-destructive/10 border-destructive/20 text-destructive"
              : connected
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
              : "bg-amber-500/10 border-amber-500/20 text-amber-500"
          }`}>
            {echoError ? <WifiOff className="w-4 h-4" /> : <SignalHigh className="w-4 h-4" />}
            {echoError ? "Reverb offline" : connected ? "Live" : "Connecting…"}
          </div>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => loadWarRoom()}>
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
        </div>
      </div>

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {[
            { label: "Units on map", value: summary.total_units },
            { label: "Verified", value: summary.verified, color: "text-emerald-500" },
            { label: "Pending", value: summary.pending, color: "text-amber-500" },
            { label: "Submissions", value: summary.submissions ?? rows.length, color: "text-primary" },
          ].map((s) => (
            <Card key={s.label} className="border-border p-3">
              <div className="text-xs text-muted-foreground">{s.label}</div>
              <div className={`text-xl font-bold mt-0.5 ${s.color ?? ""}`}>{s.value}</div>
            </Card>
          ))}
        </div>
      )}

      <div className="flex gap-2 border-b border-border pb-2">
        <Button
          variant={tab === "map" ? "default" : "ghost"}
          size="sm"
          className="gap-2"
          onClick={() => setTab("map")}
        >
          <MapIcon className="h-4 w-4" /> Live Map
        </Button>
        <Button
          variant={tab === "submissions" ? "default" : "ghost"}
          size="sm"
          className="gap-2"
          onClick={() => setTab("submissions")}
        >
          <Table2 className="h-4 w-4" /> Submissions
          {summary && summary.submissions > 0 && (
            <span className="ml-1 rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground">
              {summary.submissions}
            </span>
          )}
        </Button>
      </div>

      {role === "super_admin" && !tenantId ? (
        <Card className="p-8 text-center text-muted-foreground border-border">
          Select a tenant above to load the war room.
        </Card>
      ) : tab === "map" ? (
        <div className="flex-1 flex gap-6 min-h-0">
          <Card className="flex-1 overflow-hidden border-border bg-background shadow-xl relative rounded-xl min-h-[400px]">
            {loading ? (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Loading units…
              </div>
            ) : (
              <MapWithNoSSR
                units={mapUnits}
                selectedUnitId={selectedUnitId}
                onSelectUnit={(u) => setSelectedUnitId(u.id)}
              />
            )}
          </Card>
          <div className="w-80 flex flex-col space-y-3 min-h-0 shrink-0">
            <Card className="flex-1 border-border bg-card p-4 flex flex-col min-h-0">
              <h3 className="text-sm font-semibold border-b border-border pb-2 mb-3 shrink-0">
                Live feed
              </h3>
              <div className="flex-1 overflow-auto space-y-2 pr-1">
                {feed.map((event) => (
                  <div
                    key={event.id}
                    className="p-3 rounded-lg border text-sm bg-emerald-500/5 border-emerald-500/20"
                  >
                    <div className="flex justify-between gap-2 mb-1">
                      <span className="text-xs font-semibold truncate text-emerald-500">
                        Verified
                      </span>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {timeAgo(event.timestamp)}
                      </span>
                    </div>
                    <p className="font-medium truncate">{event.unitName ?? "Unit"}</p>
                    <p className="text-xs text-muted-foreground">{event.agentName}</p>
                  </div>
                ))}
                {feed.length === 0 && (
                  <p className="text-xs text-center text-muted-foreground py-8">
                    Waiting for field submissions…
                  </p>
                )}
              </div>
            </Card>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0 space-y-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search unit or LGA…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Card className="border-border flex-1 min-h-0 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead>Photos</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead>Captured</TableHead>
                  <TableHead>EC8A</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [...Array(4)].map((_, i) => (
                    <TableRow key={i} className="border-border">
                      {[...Array(8)].map((_, j) => (
                        <TableCell key={j}>
                          <div className="h-4 bg-muted rounded animate-pulse" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filteredRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                      No submitted results yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRows.map((row: SubmissionRow) => {
                    const cfg = FLAG_CONFIG[row.flag]
                    return (
                      <TableRow
                        key={row.unit_id}
                        className="border-border cursor-pointer"
                        onClick={() => {
                          setSelectedUnitId(row.unit_id)
                          setTab("map")
                        }}
                      >
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <div className="flex gap-1">
                            {row.latest_verification_id ? (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  title="Primary photo"
                                  onClick={() => setImageView({
                                    id: row.latest_verification_id!,
                                    variant: "primary",
                                    title: row.unit_name ?? "Primary",
                                    fallbackUrl: row.image_url,
                                  })}
                                >
                                  <ImageIcon className="h-4 w-4" />
                                </Button>
                                {row.secondary_image_url && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    title="Secondary photo"
                                    onClick={() => setImageView({
                                      id: row.latest_verification_id!,
                                      variant: "secondary",
                                      title: `${row.unit_name ?? "Unit"} secondary`,
                                      fallbackUrl: row.secondary_image_url,
                                    })}
                                  >
                                    <ImageIcon className="h-4 w-4 opacity-60" />
                                  </Button>
                                )}
                              </>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{row.unit_name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {[row.state, row.lga, row.ward].filter(Boolean).join(" › ")}
                        </TableCell>
                        <TableCell className="text-sm">{row.agent_name ?? "—"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {row.verified_at
                            ? new Date(row.verified_at).toLocaleString()
                            : "—"}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground capitalize">
                          {row.ec8a_status ?? "—"}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold border ${cfg.color}`}>
                            <cfg.icon className="w-3 h-3" />
                            {cfg.label}
                          </span>
                        </TableCell>
                        <TableCell>
                          {row.latest_verification_id ? (
                            <a
                              href={`/certificate/${row.latest_verification_id}`}
                              className="text-xs text-primary hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Certificate
                            </a>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}

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
