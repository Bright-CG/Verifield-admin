import { apiUrl } from "@/lib/api-base"

export type UnitMapStatus = "Pending" | "Verified"
export type DiscrepancyFlag = "ok" | "overvote" | "no_accredited" | "off_site"

export interface WarRoomMapUnit {
  id: string
  name: string
  lat: number
  lng: number
  state: string | null
  lga: string | null
  ward: string | null
  status: UnitMapStatus
  is_off_site: boolean
  flag: DiscrepancyFlag
  latest_verification_id: string | null
  image_url: string | null
  agent_name: string | null
  verified_at: string | null
}

export interface DiscrepancyRow {
  unit_id: string
  unit_name: string
  state: string | null
  lga: string | null
  ward: string | null
  total_votes: number
  accredited_voters: number | null
  overvote: number
  flag: DiscrepancyFlag
  latest_verification_id: string | null
}

export interface WarRoomSummary {
  total_units: number
  verified: number
  pending: number
  off_site: number
  overvote_flags: number
  clean_units: number
}

export interface WarRoomPayload {
  map_units: WarRoomMapUnit[]
  discrepancies: DiscrepancyRow[]
  summary: WarRoomSummary
}

export async function fetchWarRoom(
  token: string,
  tenantId?: string
): Promise<WarRoomPayload | null> {
  const qs = tenantId ? `?tenant_id=${encodeURIComponent(tenantId)}` : ""
  const res = await fetch(apiUrl(`/api/v1/admin/war-room${qs}`), {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  })
  if (!res.ok) return null
  const json = await res.json()
  return json.data ?? null
}
