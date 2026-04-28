"use client"

import React, { useEffect } from "react"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Fix for default marker icons in Next.js/Leaflet
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})
L.Marker.prototype.options.icon = DefaultIcon

interface MapProps {
  units: any[]
}

export default function LiveMap({ units }: MapProps) {
  // Default center: Nigeria
  const center: [number, number] = [9.0820, 8.6753]

  return (
    <MapContainer 
      center={center} 
      zoom={6} 
      style={{ height: "100%", width: "100%", zIndex: 0, background: "#0a0a0a" }}
    >
      {/* Dark Matter Tiles from CartoDB */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />

      {units.map((unit) => {
        // Handle mock coordinates if none exist, or parse POINT data
        // For the scaffold, we'll place markers if lat/lng are provided explicitly
        if (!unit.lat || !unit.lng) return null
        
        return (
          <Marker key={unit.id} position={[unit.lat, unit.lng]}>
            <Popup className="bg-zinc-900 border-zinc-800 text-white rounded-lg">
              <div className="p-2 space-y-1">
                <p className="font-bold text-indigo-400">{unit.name}</p>
                <p className="text-xs text-zinc-400">Status: {unit.status || 'Pending'}</p>
              </div>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}
