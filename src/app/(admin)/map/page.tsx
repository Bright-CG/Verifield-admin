"use client"

import React, { useEffect, useState, useCallback } from "react"
import dynamic from "next/dynamic"
import { Card } from "@/components/ui/card"
import { ShieldAlert, SignalHigh, WifiOff, MapPin, CheckCircle2 } from "lucide-react"

const MapWithNoSSR = dynamic(() => import("@/components/LiveMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-background/50 text-primary animate-pulse">
      Initializing Geospatial Engine...
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
  isOffSite?: boolean
}

export default function MapDashboardPage() {
  const [units, setUnits] = useState<any[]>([
    { id: 1, name: "PU 001 - Lagos",    lat: 6.5244,  lng: 3.3792,  status: "Pending" },
    { id: 2, name: "Store A - Abuja",   lat: 9.0765,  lng: 7.3986,  status: "Pending" },
    { id: 3, name: "PU 012 - Kano",     lat: 12.0022, lng: 8.5920,  status: "Pending" },
  ])
  const [feed, setFeed] = useState<LiveEvent[]>([
    {
      id: "mock-1",
      unitName: "PU 001 - Lagos",
      agentName: "Demo Agent",
      lat: 6.5244, lng: 3.3792,
      timestamp: new Date(Date.now() - 120000),
      isOffSite: false,
    },
    {
      id: "mock-2",
      unitName: "Store B - Ibadan",
      agentName: "System",
      lat: 7.3775, lng: 3.9470,
      timestamp: new Date(Date.now() - 300000),
      isOffSite: true,
    },
  ])
  const [connected, setConnected] = useState(false)
  const [echoError, setEchoError] = useState(false)

  const handleVerification = useCallback((event: any) => {
    const newEvent: LiveEvent = {
      id: event.id,
      unitName: event.unit_name,
      agentName: event.agent?.name ?? "Unknown Agent",
      lat: event.gps_lat,
      lng: event.gps_long,
      timestamp: new Date(),
      isOffSite: false,
    }

    // Add to live feed (max 20 items)
    setFeed((prev) => [newEvent, ...prev].slice(0, 20))

    // Update unit status to Verified (green)
    setUnits((prev) =>
      prev.map((u) =>
        u.id === event.unit_id ? { ...u, status: "Verified" } : u
      )
    )
  }, [])

  useEffect(() => {
    let echo: any = null

    const initEcho = async () => {
      try {
        const [{ default: Echo }, { default: Pusher }] = await Promise.all([
          import("laravel-echo"),
          import("pusher-js"),
        ])

        ;(window as any).Pusher = Pusher

        echo = new Echo({
          broadcaster: "reverb",
          key: "verifield-key-local",
          wsHost: "localhost",
          wsPort: 8080,
          wssPort: 8080,
          forceTLS: false,
          enabledTransports: ["ws"],
        })

        const token = localStorage.getItem("vf_token")

        // Listen on tenant channel — replace "1" with actual tenant_id from auth
        echo
          .channel("verifications.1")
          .listen(".verification.received", (e: any) => {
            handleVerification(e)
          })

        echo.connector.socket?.on("connect", () => setConnected(true))
        echo.connector.socket?.on("disconnect", () => setConnected(false))

        setConnected(true)
      } catch {
        setEchoError(true)
      }
    }

    initEcho()

    return () => {
      echo?.disconnect()
    }
  }, [handleVerification])

  const timeAgo = (date: Date) => {
    const secs = Math.floor((Date.now() - date.getTime()) / 1000)
    if (secs < 60) return `${secs}s ago`
    if (secs < 3600) return `${Math.floor(secs / 60)}m ago`
    return `${Math.floor(secs / 3600)}h ago`
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Live War Room Map</h2>
          <p className="text-muted-foreground mt-1">
            Real-time geospatial tracking via Laravel Reverb WebSockets.
          </p>
        </div>

        {/* Connection Status */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${
          echoError
            ? "bg-destructive/10 border-destructive/20 text-destructive"
            : connected
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
            : "bg-amber-500/10 border-amber-500/20 text-amber-500"
        }`}>
          {echoError
            ? <><WifiOff className="w-4 h-4" /> Reverb Offline</>
            : connected
            ? <><SignalHigh className="w-4 h-4" /> Live — Reverb Connected</>
            : <><SignalHigh className="w-4 h-4 animate-pulse" /> Connecting...</>
          }
        </div>
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        {/* Map */}
        <Card className="flex-1 overflow-hidden border-border bg-background shadow-xl relative rounded-xl">
          <MapWithNoSSR units={units} />
        </Card>

        {/* Live Activity Feed */}
        <div className="w-80 flex flex-col space-y-3 min-h-0">
          <Card className="flex-1 border-border bg-card p-4 flex flex-col min-h-0">
            <h3 className="text-sm font-semibold border-b border-border pb-2 mb-3 shrink-0">
              Live Activity Feed
            </h3>

            <div className="flex-1 overflow-auto space-y-2 pr-1">
              {feed.map((event) => (
                <div
                  key={event.id}
                  className={`p-3 rounded-lg border text-sm ${
                    event.isOffSite
                      ? "bg-destructive/5 border-destructive/20"
                      : "bg-emerald-500/5 border-emerald-500/20"
                  }`}
                >
                  <div className="flex justify-between items-center mb-1 gap-2">
                    <span className={`text-xs font-semibold truncate ${
                      event.isOffSite ? "text-destructive" : "text-emerald-500"
                    }`}>
                      {event.isOffSite ? "⚠️ Off-site" : "✅ Verified"}
                    </span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {timeAgo(event.timestamp)}
                    </span>
                  </div>
                  <p className="text-foreground font-medium truncate">
                    {event.unitName ?? "Unknown Unit"}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {event.agentName}
                    </span>
                  </div>
                </div>
              ))}

              {feed.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <CheckCircle2 className="w-8 h-8 mb-2 opacity-30" />
                  <p className="text-xs text-center">No activity yet. Waiting for field submissions.</p>
                </div>
              )}
            </div>
          </Card>

          {/* Unit Stats */}
          <Card className="border-border bg-card p-4 shrink-0">
            <h3 className="text-sm font-semibold mb-3">Unit Status</h3>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <div className="font-bold text-emerald-500 text-lg">
                  {units.filter(u => u.status === "Verified").length}
                </div>
                <div className="text-muted-foreground">Verified</div>
              </div>
              <div className="p-2 rounded-lg bg-amber-500/10">
                <div className="font-bold text-amber-500 text-lg">
                  {units.filter(u => u.status === "Pending").length}
                </div>
                <div className="text-muted-foreground">Pending</div>
              </div>
              <div className="p-2 rounded-lg bg-destructive/10">
                <div className="font-bold text-destructive text-lg">
                  {feed.filter(e => e.isOffSite).length}
                </div>
                <div className="text-muted-foreground">Flagged</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
