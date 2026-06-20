import { apiUrl } from "@/lib/api-base"

export interface SubmissionItem {
  id: string
  unit_id: string
  unit_name: string | null
  state: string | null
  lga: string | null
  ward: string | null
  agent_id: string | null
  agent_name: string | null
  agent_email: string | null
  gps_lat: number | null
  gps_long: number | null
  accuracy: number | null
  device_timestamp: string | null
  server_timestamp: string | null
  image_url: string | null
  secondary_image_url: string | null
  has_primary_file: boolean
  has_secondary_file: boolean
  ec8a_status: string | null
  ec8a_data: Record<string, unknown> | null
  ec8a_extracted_at: string | null
}

export interface SubmissionsPage {
  data: SubmissionItem[]
  current_page: number
  last_page: number
  total: number
  per_page: number
}

export async function fetchSubmissions(
  token: string,
  page = 1,
  tenantId?: string
): Promise<SubmissionsPage | null> {
  const params = new URLSearchParams({ page: String(page), per_page: "25" })
  if (tenantId) params.set("tenant_id", tenantId)

  const res = await fetch(apiUrl(`/api/v1/admin/submissions?${params}`), {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  })
  if (!res.ok) return null
  const json = await res.json()
  return json.data as SubmissionsPage
}
