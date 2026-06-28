import { apiUrl } from "@/lib/api-base"

export interface Ec8aRow {
  extraction_id: string
  verification_id: string
  status: string
  review_status?: string
  extracted_at: string | null
  reviewed_at?: string | null
  counts_in_total: boolean
  unit_id?: string | null
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
  units_in_totals?: number
  agents_in_totals: number
  extractions_total: number
  extractions: Ec8aRow[]
}

export async function fetchEc8aDashboard(
  token: string,
  tenantId?: string
): Promise<{ data: Ec8aDashboard | null; error?: string }> {
  const qs = tenantId ? `?tenant_id=${encodeURIComponent(tenantId)}` : ""
  const res = await fetch(apiUrl(`/api/v1/admin/ec8a${qs}`), {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  })
  if (!res.ok) {
    const json = await res.json().catch(() => ({}))
    const body = json as { message?: string; exception?: string }
    return {
      data: null,
      error: body.message ?? body.exception ?? `EC8A API error (${res.status})`,
    }
  }
  const json = await res.json()
  return { data: json.data as Ec8aDashboard }
}
