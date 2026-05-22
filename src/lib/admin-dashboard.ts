import { apiUrl } from "@/lib/api-base"
import type { WarRoomSummary } from "@/lib/war-room"

export interface SystemHealthSlice {
  ok: boolean
  status: string
  driver?: string
  configured?: boolean
}

export interface DashboardPayload {
  scope: "platform" | "tenant"
  stats: Record<string, number>
  war_room: WarRoomSummary | null
  system: {
    database: SystemHealthSlice
    api: SystemHealthSlice
    broadcast: SystemHealthSlice
    reverb: SystemHealthSlice
    spatial: SystemHealthSlice
  }
}

export async function fetchAdminDashboard(
  token: string,
  tenantId?: string
): Promise<DashboardPayload | null> {
  const qs = tenantId ? `?tenant_id=${encodeURIComponent(tenantId)}` : ""
  const res = await fetch(apiUrl(`/api/v1/admin/dashboard${qs}`), {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  })
  if (!res.ok) return null
  const json = await res.json()
  return (json.data ?? null) as DashboardPayload | null
}
