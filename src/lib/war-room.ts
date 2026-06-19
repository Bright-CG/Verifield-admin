import { apiUrl } from "@/lib/api-base"

export type UnitMapStatus = "Pending" | "Verified"
export type SubmissionFlag = "ok"

export interface WarRoomMapUnit {
  id: string
  name: string
  lat: number
  lng: number
  state: string | null
  lga: string | null
  ward: string | null
  status: UnitMapStatus
  flag: SubmissionFlag
  latest_verification_id: string | null
  image_url: string | null
  secondary_image_url?: string | null
  agent_name: string | null
  verified_at: string | null
}

export interface SubmissionRow {
  unit_id: string
  unit_name: string
  state: string | null
  lga: string | null
  ward: string | null
  agent_name: string | null
  verified_at: string | null
  flag: SubmissionFlag
  latest_verification_id: string | null
  image_url: string | null
  secondary_image_url?: string | null
  ec8a_status: string | null
  capture_lat?: number | null
  capture_long?: number | null
}

export interface WarRoomSummary {
  total_units: number
  verified: number
  pending: number
  off_site: number
  submissions: number
  overvote_flags: number
  clean_units: number
}

export interface WarRoomPayload {
  map_units: WarRoomMapUnit[]
  submissions: SubmissionRow[]
  discrepancies: SubmissionRow[]
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
  const data = json.data as WarRoomPayload
  if (!data.submissions && data.discrepancies) {
    data.submissions = data.discrepancies
  }
  return data
}
