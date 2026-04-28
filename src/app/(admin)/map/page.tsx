"use client"

import React, { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { Card } from "@/components/ui/card"
import { ShieldAlert, SignalHigh } from "lucide-react"

// Leaflet MUST be loaded dynamically to avoid SSR "window not defined" errors
const MapWithNoSSR = dynamic(() => import("@/components/LiveMap"), {
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center bg-black/50 text-indigo-500 animate-pulse">Initializing Geospatial Engine...</div>
})

export default function MapDashboardPage() {
  const [units, setUnits] = useState<any[]>([])
  const [connectionStatus, setConnectionStatus] = useState("Connecting to WebSocket...")

  useEffect(() => {
    // Scaffold for Laravel Echo / Reverb integration
    // When backend is ready, we initialize Echo here:
    // import Echo from 'laravel-echo';
    // import Pusher from 'pusher-js';
    /*
    window.Pusher = Pusher;
    const echo = new Echo({
        broadcaster: 'reverb',
        key: process.env.NEXT_PUBLIC_REVERB_APP_KEY,
        wsHost: process.env.NEXT_PUBLIC_REVERB_HOST,
        wsPort: process.env.NEXT_PUBLIC_REVERB_PORT,
        wssPort: process.env.NEXT_PUBLIC_REVERB_PORT,
        forceTLS: (process.env.NEXT_PUBLIC_REVERB_SCHEME ?? 'https') === 'https',
        enabledTransports: ['ws', 'wss'],
    });

    echo.channel('verifications')
        .listen('VerificationReceived', (e: any) => {
            // Update unit status to green/pulse
            updateUnitStatus(e.unit_id, 'Verified', e.coords);
        });
    */

    // Simulating initial fetch
    setConnectionStatus("Connected to Reverb. Waiting for Pings.")
    setUnits([
      { id: 1, name: "PU 001 - Lagos", lat: 6.5244, lng: 3.3792, status: "Pending" },
      { id: 2, name: "Store A - Abuja", lat: 9.0765, lng: 7.3986, status: "Pending" }
    ])

  }, [])

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] space-y-4">
      
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Live War Room Map</h2>
          <p className="text-slate-400 mt-1">Real-time geospatial tracking of incoming verifications.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <SignalHigh className="w-4 h-4" />
          {connectionStatus}
        </div>
      </div>

      <div className="flex-1 flex gap-6">
        
        {/* The Live Map Container */}
        <Card className="flex-1 overflow-hidden border-white/10 bg-black shadow-2xl relative rounded-xl">
          <MapWithNoSSR units={units} />
        </Card>

        {/* The Feed / Details Drawer */}
        <div className="w-80 flex flex-col space-y-4">
          <Card className="flex-1 border-white/10 bg-white/5 backdrop-blur-md p-4 flex flex-col">
            <h3 className="text-sm font-semibold text-white border-b border-white/10 pb-2 mb-4">Latest Activity</h3>
            
            <div className="flex-1 overflow-auto space-y-3">
              {/* Mock Feed Items */}
              <div className="p-3 rounded-md bg-black/40 border border-white/5">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-semibold text-indigo-400">Agent: John Doe</span>
                  <span className="text-[10px] text-slate-500">2 min ago</span>
                </div>
                <p className="text-sm text-slate-300">PU 001 - Verified</p>
              </div>

              <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-semibold text-red-400">System Alert</span>
                  <span className="text-[10px] text-slate-500">5 min ago</span>
                </div>
                <p className="text-sm text-slate-300 flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3 text-red-400" />
                  Off-site capture detected (>100m)
                </p>
              </div>
            </div>
          </Card>
        </div>

      </div>
    </div>
  )
}
