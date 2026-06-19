import { apiUrl } from "@/lib/api-base"

export interface Ec8aRow {
  extraction_id: string
  verification_id: string
  status: string
  extracted_at: string | null
  counts_in_total: boolean
  agent_id: string | null
  agent_name: string | null
  unit_name: string | null
  state: string | null
  lga: string | null
  ward: string | null
  gps_lat: number | null
  gps_long: number | null
  image_url: string | null
  ec8a_data: {
    parties?: { code: string; votes: number | null }[]
    accredited_voters?: number | null
    total_valid_votes?: number | null
    rejected_ballots?: number | null
    voters_on_register?: number | null
    polling_unit_name?: string | null
    confidence?: string
  } | null
}

export interface Ec8aDashboard {
  party_totals: Record<string, number>
  stat_totals: Record<string, number>
  agents_in_totals: number
  extractions_total: number
  extractions: Ec8aRow[]
}

export async function fetchEc8aDashboard(
  token: string,
  tenantId?: string
): Promise<Ec8aDashboard | null> {
  const qs = tenantId ? `?tenant_id=${encodeURIComponent(tenantId)}` : ""
  const res = await fetch(apiUrl(`/api/v1/admin/ec8a${qs}`), {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  })
  if (!res.ok) return null
  const json = await res.json()
  return json.data as Ec8aDashboard
}
