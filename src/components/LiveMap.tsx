"use client"

import React from "react"
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import type { WarRoomMapUnit } from "@/lib/war-room"

const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})
L.Marker.prototype.options.icon = DefaultIcon

function markerColor(unit: WarRoomMapUnit): string {
  if (unit.status === "Verified") return "#22c55e"
  return "#eab308"
}

interface MapProps {
  units: WarRoomMapUnit[]
  selectedUnitId?: string | null
  onSelectUnit?: (unit: WarRoomMapUnit) => void
}

export default function LiveMap({ units, selectedUnitId, onSelectUnit }: MapProps) {
  const center: [number, number] = [9.082, 8.6753]
  const withCoords = units.filter((u) => u.lat && u.lng)

  return (
    <MapContainer
      center={center}
      zoom={6}
      style={{ height: "100%", width: "100%", zIndex: 0, background: "#0a0a0a" }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap &copy; CARTO'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />

      {withCoords.map((unit) => {
        const color = markerColor(unit)
        const isSelected = selectedUnitId === unit.id
        const radius = isSelected ? 11 : 8

        return (
          <CircleMarker
            key={unit.id}
            center={[unit.lat, unit.lng]}
            radius={radius}
            pathOptions={{
              color: isSelected ? "#fff" : color,
              fillColor: color,
              fillOpacity: 0.85,
              weight: isSelected ? 3 : 2,
            }}
            eventHandlers={{
              click: () => onSelectUnit?.(unit),
            }}
          >
            <Popup className="bg-zinc-900 border-zinc-800 text-white rounded-lg">
              <div className="p-2 space-y-1 min-w-[160px]">
                <p className="font-bold text-indigo-400">{unit.name}</p>
                <p className="text-xs text-zinc-400">
                  Status: {unit.status}
                </p>
                {unit.agent_name && (
                  <p className="text-xs text-zinc-500">Agent: {unit.agent_name}</p>
                )}
                {unit.latest_verification_id && (
                  <a
                    href={`/certificate/${unit.latest_verification_id}`}
                    className="text-xs text-primary hover:underline block mt-1"
                  >
                    View certificate
                  </a>
                )}
              </div>
            </Popup>
          </CircleMarker>
        )
      })}
    </MapContainer>
  )
}
