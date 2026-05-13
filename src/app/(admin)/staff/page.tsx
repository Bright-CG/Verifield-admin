"use client"

import React, { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"
import { Plus, CheckCircle2, Clock, Copy, X, Loader2 } from "lucide-react"
import { STATE_NAMES, getLGAsForState } from "@/lib/nigeria-lgas"
import { apiUrl } from "@/lib/api-base"

interface Staff {
  id: string
  name: string
  email: string
  email_verified_at: string | null
  device_bound_at?: string | null
  assigned_state: string | null
  assigned_lga: string | null
  assigned_ward: string | null
  assigned_unit_id?: string | null
  assigned_polling_unit_id?: string | null
  assigned_unit?: { id: string; name: string } | null
  assigned_polling_unit?: { id: string; name: string } | null
  created_at: string
}

interface MeResponse {
  user?: {
    tenant?: {
      type?: "election" | "corporate"
    }
  }
}

interface LocRow {
  id: string
  slug: string
  name?: string | null
}

interface NewCredentials {
  email: string
  temp_password: string
}

const SelectField = ({
  id, label, value, onChange, options, placeholder, disabled,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  options: string[]
  placeholder?: string
  disabled?: boolean
}) => (
  <div className="space-y-2">
    <Label htmlFor={id}>{label}</Label>
    <select
      id={id}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
    >
      <option value="">{placeholder ?? "Select..."}</option>
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  </div>
)

const locLabel = (r: LocRow) => (r.name && r.name.trim() !== "" ? r.name : r.slug.replace(/-/g, " "))

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [credentials, setCredentials] = useState<NewCredentials | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [tenantType, setTenantType] = useState<"election" | "corporate">("corporate")
  const [search, setSearch] = useState("")
  const [deviceCode, setDeviceCode] = useState<{ staffId: string; token: string; expires_at: string } | null>(null)
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null)
  const [editingStaff, setEditingStaff] = useState(false)
  const [staffForm, setStaffForm] = useState({
    name: "",
    email: "",
    assigned_state: "",
    assigned_lga: "",
    assigned_ward: "",
    assigned_unit_id: "",
  })

  const [form, setForm] = useState({
    name: "",
    email: "",
    assigned_state: "",
    assigned_lga: "",
  })

  const [geoStates, setGeoStates] = useState<LocRow[]>([])
  const [geoLgas, setGeoLgas] = useState<LocRow[]>([])
  const [geoWards, setGeoWards] = useState<LocRow[]>([])
  const [geoPus, setGeoPus] = useState<LocRow[]>([])
  const [selStateId, setSelStateId] = useState("")
  const [selLgaId, setSelLgaId] = useState("")
  const [selWardId, setSelWardId] = useState("")
  const [selPuId, setSelPuId] = useState("")
  const [geoLoad, setGeoLoad] = useState({ states: false, lgas: false, wards: false, pus: false })

  const token = typeof window !== "undefined" ? localStorage.getItem("vf_token") : ""
  const isElectionMode = tenantType === "election"
  const entityLabel = isElectionMode ? "Agent" : "Staff"
  const entityLabelLower = isElectionMode ? "agent" : "staff"

  const authHeaders = {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  }

  const fetchStaff = async () => {
    setLoading(true)
    try {
      const query = search.trim() ? `?q=${encodeURIComponent(search.trim())}` : ""
      const res = await fetch(apiUrl(`/api/v1/staff${query}`), { headers: authHeaders })
      if (res.ok) {
        const json = await res.json()
        setStaff(json.data ?? [])
      }
    } catch { /* offline */ }
    finally { setLoading(false) }
  }

  const fetchMe = async () => {
    try {
      const res = await fetch(apiUrl("/api/v1/me"), { headers: authHeaders })
      if (!res.ok) return
      const json = (await res.json()) as MeResponse
      const type = json?.user?.tenant?.type
      if (type === "election" || type === "corporate") {
        setTenantType(type)
      }
    } catch { /* ignore */ }
  }

  const loadStates = useCallback(async () => {
    if (!token) return
    setGeoLoad((g) => ({ ...g, states: true }))
    try {
      const res = await fetch(apiUrl("/api/v1/locations/states"), { headers: authHeaders })
      if (!res.ok) return
      const json = await res.json()
      setGeoStates((json.data ?? []) as LocRow[])
    } finally {
      setGeoLoad((g) => ({ ...g, states: false }))
    }
  }, [token])

  useEffect(() => {
    fetchMe()
  }, [])

  useEffect(() => {
    fetchStaff()
  }, [search])

  useEffect(() => {
    if (!isDialogOpen || !isElectionMode || !token) return
    setSelStateId("")
    setSelLgaId("")
    setSelWardId("")
    setSelPuId("")
    setGeoLgas([])
    setGeoWards([])
    setGeoPus([])
    void loadStates()
  }, [isDialogOpen, isElectionMode, token, loadStates])

  useEffect(() => {
    if (!isElectionMode || !selStateId || !token) {
      setGeoLgas([])
      return
    }
    let cancelled = false
    setGeoLoad((g) => ({ ...g, lgas: true }))
    fetch(apiUrl(`/api/v1/locations/lgas/${selStateId}`), { headers: authHeaders })
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (!cancelled && json?.data) setGeoLgas(json.data as LocRow[])
      })
      .finally(() => {
        if (!cancelled) setGeoLoad((g) => ({ ...g, lgas: false }))
      })
    return () => { cancelled = true }
  }, [isElectionMode, selStateId, token])

  useEffect(() => {
    if (!isElectionMode || !selLgaId || !token) {
      setGeoWards([])
      return
    }
    let cancelled = false
    setGeoLoad((g) => ({ ...g, wards: true }))
    fetch(apiUrl(`/api/v1/locations/wards/${selLgaId}`), { headers: authHeaders })
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (!cancelled && json?.data) setGeoWards(json.data as LocRow[])
      })
      .finally(() => {
        if (!cancelled) setGeoLoad((g) => ({ ...g, wards: false }))
      })
    return () => { cancelled = true }
  }, [isElectionMode, selLgaId, token])

  useEffect(() => {
    if (!isElectionMode || !selWardId || !token) {
      setGeoPus([])
      return
    }
    let cancelled = false
    setGeoLoad((g) => ({ ...g, pus: true }))
    fetch(apiUrl(`/api/v1/locations/polling-units/${selWardId}`), { headers: authHeaders })
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (!cancelled && json?.data) setGeoPus(json.data as LocRow[])
      })
      .finally(() => {
        if (!cancelled) setGeoLoad((g) => ({ ...g, pus: false }))
      })
    return () => { cancelled = true }
  }, [isElectionMode, selWardId, token])

  const handleGenerateDeviceCode = async (member: Staff) => {
    try {
      const res = await fetch(apiUrl(`/api/v1/staff/${member.id}/device-reset-token`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ send_email: true, expires_in_hours: 4 }),
      })
      const json = await res.json()
      if (res.ok && json?.data?.token) {
        setDeviceCode({
          staffId: member.id,
          token: json.data.token,
          expires_at: json.data.expires_at,
        })
      } else {
        setError(json?.message ?? "Failed to generate device code.")
      }
    } catch {
      setError("Failed to generate device code.")
    }
  }

  const openStaffDrawer = async (member: Staff) => {
    setError("")
    setSelectedStaff(member)
    setStaffForm({
      name: member.name ?? "",
      email: member.email ?? "",
      assigned_state: member.assigned_state ?? "",
      assigned_lga: member.assigned_lga ?? "",
      assigned_ward: member.assigned_ward ?? "",
      assigned_unit_id: member.assigned_unit_id ?? "",
    })
    setIsDetailDrawerOpen(true)
    try {
      const res = await fetch(apiUrl(`/api/v1/staff/${member.id}`), { headers: authHeaders })
      if (!res.ok) return
      const json = await res.json()
      const detail = json?.data as Staff
      setSelectedStaff(detail)
      setStaffForm({
        name: detail.name ?? "",
        email: detail.email ?? "",
        assigned_state: detail.assigned_state ?? "",
        assigned_lga: detail.assigned_lga ?? "",
        assigned_ward: detail.assigned_ward ?? "",
        assigned_unit_id: detail.assigned_unit_id ?? "",
      })
    } catch { /* keep optimistic */ }
  }

  const handleSaveStaffDetails = async () => {
    if (!selectedStaff) return
    setEditingStaff(true)
    setError("")
    try {
      const body = isElectionMode
        ? { name: staffForm.name, email: staffForm.email }
        : staffForm
      const res = await fetch(apiUrl(`/api/v1/staff/${selectedStaff.id}`), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json?.message ?? "Failed to update staff profile.")
        return
      }
      await fetchStaff()
      setSelectedStaff((prev) => (prev ? { ...prev, ...json.data } : prev))
      setIsDetailDrawerOpen(false)
    } catch {
      setError("Failed to update staff profile.")
    } finally {
      setEditingStaff(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")
    try {
      const payload = isElectionMode
        ? {
            name: form.name,
            email: form.email,
            assigned_polling_unit_id: selPuId,
          }
        : {
            name: form.name,
            email: form.email,
            assigned_state: form.assigned_state,
            assigned_lga: form.assigned_lga,
          }
      if (isElectionMode && !selPuId) {
        setError("Please select a polling unit.")
        setSubmitting(false)
        return
      }
      const res = await fetch(apiUrl("/api/v1/staff"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (res.ok) {
        setCredentials({ email: data.data.email, temp_password: data.data.temp_password })
        fetchStaff()
        setIsDialogOpen(false)
        setForm({ name: "", email: "", assigned_state: "", assigned_lga: "" })
        setSelStateId("")
        setSelLgaId("")
        setSelWardId("")
        setSelPuId("")
      } else {
        setError(data.message || "Failed to create staff member.")
      }
    } catch {
      setError("Network error. Is the Laravel backend running?")
    } finally {
      setSubmitting(false)
    }
  }

  const lgas = form.assigned_state ? getLGAsForState(form.assigned_state) : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{entityLabel} Management</h2>
          <p className="text-muted-foreground mt-1">
            Create and assign field {entityLabelLower}s to their geographic territories.
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" /> Add {entityLabel}
        </Button>
      </div>
      <div className="max-w-md">
        <Input
          placeholder="Search by name, email, state, LGA or polling unit..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {credentials && (
        <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-primary mb-1">
              ✅ Staff created! Share these credentials — they will not be shown again.
            </p>
            <p className="text-sm">
              Email: <span className="font-mono font-bold">{credentials.email}</span>
            </p>
            <p className="text-sm">
              Temporary Password: <span className="font-mono font-bold">{credentials.temp_password}</span>
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button
              size="sm"
              variant="outline"
              className="border-border"
              onClick={() =>
                navigator.clipboard.writeText(
                  `Email: ${credentials.email}\nPassword: ${credentials.temp_password}`
                )
              }
            >
              <Copy className="w-3 h-3 mr-1" /> Copy
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setCredentials(null)}>
              Dismiss
            </Button>
          </div>
        </div>
      )}
      {deviceCode && (
        <div className="p-4 rounded-xl border border-amber-300/30 bg-amber-500/10 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-amber-400 mb-1">
              One-time device reset code generated for staff.
            </p>
            <p className="text-sm">
              Code: <span className="font-mono font-bold">{deviceCode.token}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Expires: {new Date(deviceCode.expires_at).toLocaleString()}
            </p>
          </div>
          <Button size="sm" variant="ghost" onClick={() => setDeviceCode(null)}>
            Dismiss
          </Button>
        </div>
      )}

      <Card className="border-border">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead>Name / Email</TableHead>
              <TableHead>State</TableHead>
              <TableHead>LGA</TableHead>
              <TableHead>Ward</TableHead>
              <TableHead>Polling Unit</TableHead>
              <TableHead>Email Verified</TableHead>
              <TableHead>Device</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow className="border-border">
                <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                  Loading staff...
                </TableCell>
              </TableRow>
            ) : staff.length === 0 ? (
              <TableRow className="border-border">
                <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                  No {entityLabelLower} added yet. Click &quot;Add {entityLabel}&quot; to get started.
                </TableCell>
              </TableRow>
            ) : (
              staff.map((member) => (
                <TableRow key={member.id} className="border-border hover:bg-muted/30">
                  <TableCell>
                    <div className="font-medium">{member.name}</div>
                    <div className="text-xs text-muted-foreground">{member.email}</div>
                  </TableCell>
                  <TableCell className="text-sm">{member.assigned_state || "—"}</TableCell>
                  <TableCell className="text-sm">{member.assigned_lga || "—"}</TableCell>
                  <TableCell className="text-sm">{member.assigned_ward || "—"}</TableCell>
                  <TableCell className="text-sm">
                    {member.assigned_polling_unit?.name || member.assigned_unit?.name || "—"}
                  </TableCell>
                  <TableCell>
                    {member.email_verified_at ? (
                      <span className="flex items-center gap-1 text-xs text-emerald-500">
                        <CheckCircle2 className="w-3 h-3" /> Verified
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-amber-500">
                        <Clock className="w-3 h-3" /> Pending
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs">
                    {member.device_bound_at ? "Registered" : "Not bound"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(member.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => openStaffDrawer(member)}>
                        View / Edit
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleGenerateDeviceCode(member)}>
                        Generate Device Code
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle>Add New {entityLabel}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Assign a field {entityLabelLower} to their territory. A temporary password is auto-generated.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="s-name">Full Name</Label>
              <Input
                id="s-name"
                placeholder="John Doe"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="bg-background border-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="s-email">Email Address</Label>
              <Input
                id="s-email"
                type="email"
                placeholder="agent@example.com"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="bg-background border-input"
              />
            </div>

            {!isElectionMode && (
              <>
                <SelectField
                  id="s-state"
                  label="State"
                  value={form.assigned_state}
                  onChange={(v) => setForm({ ...form, assigned_state: v, assigned_lga: "" })}
                  options={STATE_NAMES}
                  placeholder="Select a State..."
                />
                <SelectField
                  id="s-lga"
                  label="Local Government Area (LGA)"
                  value={form.assigned_lga}
                  onChange={(v) => setForm({ ...form, assigned_lga: v })}
                  options={lgas}
                  placeholder={form.assigned_state ? "Select an LGA..." : "Select a State first"}
                  disabled={!form.assigned_state}
                />
              </>
            )}

            {isElectionMode && (
              <div className="space-y-4 border border-border rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Select State → LGA → Ward → Polling Unit (from national catalogue).</p>

                <div className="space-y-2">
                  <Label>State</Label>
                  <div className="relative">
                    <select
                      value={selStateId}
                      disabled={geoLoad.states}
                      onChange={(e) => {
                        setSelStateId(e.target.value)
                        setSelLgaId("")
                        setSelWardId("")
                        setSelPuId("")
                      }}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">{geoLoad.states ? "Loading…" : "Select state…"}</option>
                      {geoStates.map((s) => (
                        <option key={s.id} value={s.id}>{locLabel(s)}</option>
                      ))}
                    </select>
                    {geoLoad.states && (
                      <Loader2 className="absolute right-8 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>LGA</Label>
                  <div className="relative">
                    <select
                      value={selLgaId}
                      disabled={!selStateId || geoLoad.lgas}
                      onChange={(e) => {
                        setSelLgaId(e.target.value)
                        setSelWardId("")
                        setSelPuId("")
                      }}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
                    >
                      <option value="">{!selStateId ? "Select state first" : geoLoad.lgas ? "Loading…" : "Select LGA…"}</option>
                      {geoLgas.map((x) => (
                        <option key={x.id} value={x.id}>{locLabel(x)}</option>
                      ))}
                    </select>
                    {geoLoad.lgas && (
                      <Loader2 className="absolute right-8 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Ward</Label>
                  <div className="relative">
                    <select
                      value={selWardId}
                      disabled={!selLgaId || geoLoad.wards}
                      onChange={(e) => {
                        setSelWardId(e.target.value)
                        setSelPuId("")
                      }}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
                    >
                      <option value="">{!selLgaId ? "Select LGA first" : geoLoad.wards ? "Loading…" : "Select ward…"}</option>
                      {geoWards.map((x) => (
                        <option key={x.id} value={x.id}>{locLabel(x)}</option>
                      ))}
                    </select>
                    {geoLoad.wards && (
                      <Loader2 className="absolute right-8 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Polling unit</Label>
                  <div className="relative">
                    <select
                      value={selPuId}
                      disabled={!selWardId || geoLoad.pus}
                      onChange={(e) => setSelPuId(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
                    >
                      <option value="">{!selWardId ? "Select ward first" : geoLoad.pus ? "Loading…" : "Select polling unit…"}</option>
                      {geoPus.map((x) => (
                        <option key={x.id} value={x.id}>{locLabel(x)}</option>
                      ))}
                    </select>
                    {geoLoad.pus && (
                      <Loader2 className="absolute right-8 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
                </div>
              </div>
            )}

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
                {error}
              </p>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" className="border-border" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {submitting ? "Creating..." : `Create ${entityLabel}`}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {isDetailDrawerOpen && selectedStaff && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsDetailDrawerOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-xl bg-background border-l border-border p-6 overflow-y-auto space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold">Staff Profile</h3>
                <p className="text-sm text-muted-foreground">{selectedStaff.email}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsDetailDrawerOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid gap-2">
              <Label>Full Name</Label>
              <Input
                value={staffForm.name}
                onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label>Email Address</Label>
              <Input
                value={staffForm.email}
                onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
              />
            </div>

            {isElectionMode ? (
              <div className="rounded-md border border-border p-3 text-sm space-y-1 text-muted-foreground">
                <p><span className="font-medium text-foreground">State:</span> {selectedStaff.assigned_state || "—"}</p>
                <p><span className="font-medium text-foreground">LGA:</span> {selectedStaff.assigned_lga || "—"}</p>
                <p><span className="font-medium text-foreground">Ward:</span> {selectedStaff.assigned_ward || "—"}</p>
                <p>
                  <span className="font-medium text-foreground">Polling unit:</span>{" "}
                  {selectedStaff.assigned_polling_unit?.name || selectedStaff.assigned_unit?.name || "—"}
                </p>
              </div>
            ) : (
              <>
                <SelectField
                  id="d-state"
                  label="State"
                  value={staffForm.assigned_state}
                  onChange={(v) => setStaffForm({ ...staffForm, assigned_state: v, assigned_lga: "" })}
                  options={STATE_NAMES}
                  placeholder="Select a State..."
                />
                <SelectField
                  id="d-lga"
                  label="Local Government Area (LGA)"
                  value={staffForm.assigned_lga}
                  onChange={(v) => setStaffForm({ ...staffForm, assigned_lga: v })}
                  options={staffForm.assigned_state ? getLGAsForState(staffForm.assigned_state) : []}
                  placeholder={staffForm.assigned_state ? "Select an LGA..." : "Select a State first"}
                  disabled={!staffForm.assigned_state}
                />
              </>
            )}

            <div className="rounded-md border border-border p-3 text-sm space-y-1">
              <p>
                Email Verification:{" "}
                <span className={selectedStaff.email_verified_at ? "text-emerald-500" : "text-amber-500"}>
                  {selectedStaff.email_verified_at ? "Verified" : "Pending"}
                </span>
              </p>
              <p>
                Device Registration:{" "}
                <span className={selectedStaff.device_bound_at ? "text-emerald-500" : "text-amber-500"}>
                  {selectedStaff.device_bound_at ? "Bound" : "Not bound"}
                </span>
              </p>
            </div>

            <div className="flex items-center justify-between gap-3">
              <Button variant="outline" onClick={() => handleGenerateDeviceCode(selectedStaff)}>
                Generate Device Reset Code
              </Button>
              <Button disabled={editingStaff} onClick={handleSaveStaffDetails}>
                {editingStaff ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
