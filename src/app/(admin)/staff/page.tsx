"use client"

import React, { useEffect, useState } from "react"
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
import { Plus, CheckCircle2, Clock, Copy, X } from "lucide-react"
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
  assigned_unit?: { id: string; name: string } | null
  created_at: string
}

interface MeResponse {
  user?: {
    tenant?: {
      type?: "election" | "corporate"
    }
  }
}

interface UnitOption {
  id: string
  name: string
  state?: string | null
  lga?: string | null
  ward?: string | null
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

const normalizeGeo = (value?: string | null) =>
  (value ?? "")
    .toLowerCase()
    .trim()
    .replace(/[_\s]+/g, "-")
    .replace(/-+/g, "-")

/** Imported INEC-style JSON uses `abuja` as state slug; UI uses "FCT (Abuja)". */
const stateSlugForDataset = (displayState: string) => {
  const n = normalizeGeo(displayState)
  if (n === "fct-(abuja)" || n === "fct-abuja") return "abuja"
  return n
}

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [credentials, setCredentials] = useState<NewCredentials | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [units, setUnits] = useState<UnitOption[]>([])
  const [referenceGeographyCount, setReferenceGeographyCount] = useState<number | null>(null)
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
    assigned_ward: "",
    assigned_unit_id: "",
  })

  // Derived geographic options
  const lgas = form.assigned_state ? getLGAsForState(form.assigned_state) : []
  const datasetSelectedState = form.assigned_state ? stateSlugForDataset(form.assigned_state) : ""
  const normalizedSelectedLga = normalizeGeo(form.assigned_lga)
  const normalizedSelectedWard = normalizeGeo(form.assigned_ward)
  const wardOptions = Array.from(new Set(
    units
      .filter((u) => !datasetSelectedState || normalizeGeo(u.state) === datasetSelectedState)
      .filter((u) => !normalizedSelectedLga || normalizeGeo(u.lga) === normalizedSelectedLga)
      .map((u) => u.ward)
      .filter(Boolean) as string[]
  ))
  const puOptions = units.filter((u) =>
    (!datasetSelectedState || normalizeGeo(u.state) === datasetSelectedState) &&
    (!normalizedSelectedLga || normalizeGeo(u.lga) === normalizedSelectedLga) &&
    (!normalizedSelectedWard || normalizeGeo(u.ward) === normalizedSelectedWard)
  )
  const detailLgas = staffForm.assigned_state ? getLGAsForState(staffForm.assigned_state) : []
  const datasetDetailState = staffForm.assigned_state ? stateSlugForDataset(staffForm.assigned_state) : ""
  const normalizedDetailLga = normalizeGeo(staffForm.assigned_lga)
  const normalizedDetailWard = normalizeGeo(staffForm.assigned_ward)
  const detailWardOptions = Array.from(new Set(
    units
      .filter((u) => !datasetDetailState || normalizeGeo(u.state) === datasetDetailState)
      .filter((u) => !normalizedDetailLga || normalizeGeo(u.lga) === normalizedDetailLga)
      .map((u) => u.ward)
      .filter(Boolean) as string[]
  ))
  const detailPuOptions = units.filter((u) =>
    (!datasetDetailState || normalizeGeo(u.state) === datasetDetailState) &&
    (!normalizedDetailLga || normalizeGeo(u.lga) === normalizedDetailLga) &&
    (!normalizedDetailWard || normalizeGeo(u.ward) === normalizedDetailWard)
  )

  const token = typeof window !== "undefined" ? localStorage.getItem("vf_token") : ""
  const isElectionMode = tenantType === "election"
  const entityLabel = isElectionMode ? "Agent" : "Staff"
  const entityLabelLower = isElectionMode ? "agent" : "staff"

  const debugLog = (hypothesisId: string, location: string, message: string, data: Record<string, unknown>) => {
    // #region agent log
    fetch('http://127.0.0.1:7605/ingest/4755a3ff-bbc6-43a7-9293-b8b2aa6f5e15',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'093afd'},body:JSON.stringify({sessionId:'093afd',runId:'staff-form-debug-1',hypothesisId,location,message,data,timestamp:Date.now()})}).catch(()=>{});
    // #endregion
  }

  const fetchStaff = async () => {
    setLoading(true)
    try {
      const query = search.trim() ? `?q=${encodeURIComponent(search.trim())}` : ""
      const res = await fetch(apiUrl(`/api/v1/staff${query}`), {
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      })
      if (res.ok) {
        const json = await res.json()
        setStaff(json.data ?? [])
      }
    } catch { /* backend offline */ }
    finally { setLoading(false) }
  }

  const fetchUnits = async (params?: { state?: string; lga?: string; ward?: string }) => {
    try {
      debugLog("H1", "staff/page.tsx:fetchUnits:start", "fetchUnits called", {
        params: params ?? null,
        isElectionMode,
      })
      const qs = new URLSearchParams()
      if (params?.state) qs.set("state", stateSlugForDataset(params.state))
      if (params?.lga) qs.set("lga", normalizeGeo(params.lga))
      if (params?.ward) qs.set("ward", normalizeGeo(params.ward))
      qs.set("limit", "5000")

      const res = await fetch(apiUrl(`/api/v1/hierarchy?${qs.toString()}`), {
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      })
      if (!res.ok) return
      const json = await res.json()
      const fetchedUnits = json?.data?.units ?? []
      const refGc = json?.data?.reference_geography_count
      if (typeof refGc === "number") setReferenceGeographyCount(refGc)
      setUnits(fetchedUnits)
      debugLog("H2", "staff/page.tsx:fetchUnits:result", "units fetched", {
        count: fetchedUnits.length,
        reference_geography_count: refGc ?? null,
        sample: fetchedUnits.slice(0, 3).map((u: UnitOption) => ({ state: u.state, lga: u.lga, ward: u.ward, name: u.name })),
        normalizedFilters: {
          state: params?.state ? stateSlugForDataset(params.state) : null,
          lga: params?.lga ? normalizeGeo(params.lga) : null,
          ward: params?.ward ? normalizeGeo(params.ward) : null,
        },
      })
    } catch {
      // ignore offline
      debugLog("H5", "staff/page.tsx:fetchUnits:error", "fetchUnits failed", { hasToken: Boolean(token) })
    }
  }

  const fetchMe = async () => {
    try {
      const res = await fetch(apiUrl("/api/v1/me"), {
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      })
      if (!res.ok) return
      const json = (await res.json()) as MeResponse
      const type = json?.user?.tenant?.type
      if (type === "election" || type === "corporate") {
        setTenantType(type)
      }
      debugLog("H4", "staff/page.tsx:fetchMe", "tenant type loaded", {
        type: type ?? null,
      })
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    fetchMe()
  }, [])

  useEffect(() => {
    if (!isElectionMode) return
    const authToken = typeof window !== "undefined" ? localStorage.getItem("vf_token") ?? "" : ""
    if (!authToken) return
    const qs = new URLSearchParams({ limit: "1" })
    fetch(apiUrl(`/api/v1/hierarchy?${qs.toString()}`), {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        const refGc = json?.data?.reference_geography_count
        if (typeof refGc === "number") {
          setReferenceGeographyCount(refGc)
          // #region agent log
          debugLog("H8", "staff/page.tsx:bootstrapTenantCount", "reference geography from hierarchy", {
            reference_geography_count: refGc,
          })
          // #endregion
        }
      })
      .catch(() => {})
  }, [isElectionMode])

  useEffect(() => {
    fetchStaff()
    // #region agent log
    debugLog("H6", "staff/page.tsx:useEffect:search", "search-triggered staff refresh", { search })
    // #endregion
  }, [search])

  const handleGenerateDeviceCode = async (member: Staff) => {
    try {
      const res = await fetch(apiUrl(`/api/v1/staff/${member.id}/device-reset-token`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
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
    if (isElectionMode && member.assigned_state) {
      fetchUnits({
        state: member.assigned_state,
        lga: member.assigned_lga ?? undefined,
        ward: member.assigned_ward ?? undefined,
      })
    }
    try {
      const res = await fetch(apiUrl(`/api/v1/staff/${member.id}`), {
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      })
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
    } catch {
      // keep optimistic data
    }
  }

  const handleSaveStaffDetails = async () => {
    if (!selectedStaff) return
    setEditingStaff(true)
    setError("")
    try {
      const res = await fetch(apiUrl(`/api/v1/staff/${selectedStaff.id}`), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(staffForm),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json?.message ?? "Failed to update staff profile.")
        return
      }
      await fetchStaff()
      setSelectedStaff((prev) => prev ? { ...prev, ...json.data } : prev)
      setIsDetailDrawerOpen(false)
    } catch {
      setError("Failed to update staff profile.")
    } finally {
      setEditingStaff(false)
    }
  }

  const handleStateChange = (state: string) => {
    setForm({ ...form, assigned_state: state, assigned_lga: "", assigned_ward: "", assigned_unit_id: "" })
    debugLog("H3", "staff/page.tsx:handleStateChange", "state selected", {
      selectedState: state,
    })
    if (isElectionMode && state) {
      fetchUnits({ state })
    }
  }

  useEffect(() => {
    if (!isElectionMode) return
    debugLog("H3", "staff/page.tsx:derivedOptions", "derived options recomputed", {
      selectedState: form.assigned_state,
      selectedLga: form.assigned_lga,
      selectedWard: form.assigned_ward,
      unitsCount: units.length,
      wardCount: wardOptions.length,
      puCount: puOptions.length,
      wardSample: wardOptions.slice(0, 5),
      puSample: puOptions.slice(0, 3).map((u) => u.name),
    })
  }, [isElectionMode, form.assigned_state, form.assigned_lga, form.assigned_ward, units, wardOptions, puOptions])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")
    try {
      const res = await fetch(apiUrl("/api/v1/staff"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) {
        setCredentials({ email: data.data.email, temp_password: data.data.temp_password })
        fetchStaff()
        setIsDialogOpen(false)
        setForm({ name: "", email: "", assigned_state: "", assigned_lga: "", assigned_ward: "", assigned_unit_id: "" })
      } else {
        setError(data.message || "Failed to create staff member.")
      }
    } catch {
      setError("Network error. Is the backend running?")
    } finally {
      setSubmitting(false)
    }
  }

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

      {isElectionMode && referenceGeographyCount === 0 && (
        <div className="p-4 rounded-lg border border-amber-500/40 bg-amber-500/10 text-sm text-amber-200">
          Nationwide polling-unit reference data is not loaded yet (empty shared catalogue).
          Ward and PU dropdowns pull from this catalogue for all election organisations.
          From the repo root, run once (creates the reference tenant row if missing, then loads units):
          <code className="block mt-2 rounded bg-muted px-2 py-1 text-xs break-all">
            cd verifield_backend &amp;&amp; php artisan verifield:import-nigeria-geo ../states-and-lgas-and-wards-and-polling-units.json
          </code>
          <span className="block mt-2 text-muted-foreground">
            Use your real path if the JSON lives elsewhere. Default import tenant is <code className="text-xs">VERIFIELD_REFERENCE_TENANT_ID</code> (no org UUID needed). Optional new PUs can be added per org via bulk upload.
          </span>
        </div>
      )}

      {/* One-time Credentials Banner */}
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

      {/* Staff Table */}
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
                  <TableCell className="text-sm">{member.assigned_unit?.name || "—"}</TableCell>
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
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openStaffDrawer(member)}
                      >
                        View / Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleGenerateDeviceCode(member)}
                      >
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

      {/* Add Staff/Agent Dialog */}
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

            {/* Cascading State → LGA */}
            <SelectField
              id="s-state"
              label="State"
              value={form.assigned_state}
              onChange={handleStateChange}
              options={STATE_NAMES}
              placeholder="Select a State..."
            />

            <SelectField
              id="s-lga"
              label="Local Government Area (LGA)"
              value={form.assigned_lga}
              onChange={(v) => {
                setForm({ ...form, assigned_lga: v, assigned_ward: "", assigned_unit_id: "" })
                debugLog("H3", "staff/page.tsx:handleLgaChange", "lga selected", {
                  selectedState: form.assigned_state,
                  selectedLga: v,
                })
                if (isElectionMode && v) fetchUnits({ state: form.assigned_state, lga: v })
              }}
              options={lgas}
              placeholder={form.assigned_state ? "Select an LGA..." : "Select a State first"}
              disabled={!form.assigned_state}
            />

            {isElectionMode && (
              <>
                <SelectField
                  id="s-ward"
                  label="Ward"
                  value={form.assigned_ward}
                  onChange={(v) => {
                    setForm({ ...form, assigned_ward: v, assigned_unit_id: "" })
                    if (v) fetchUnits({ state: form.assigned_state, lga: form.assigned_lga, ward: v })
                  }}
                  options={wardOptions}
                  placeholder={form.assigned_lga ? "Select a ward..." : "Select an LGA first"}
                  disabled={!form.assigned_lga}
                />

                <div className="space-y-2">
                  <Label htmlFor="s-unit">Polling Unit (Required for election mode)</Label>
                  <select
                    id="s-unit"
                    value={form.assigned_unit_id}
                    onChange={(e) => setForm({ ...form, assigned_unit_id: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                  >
                    <option value="">Select polling unit...</option>
                    {puOptions.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
                {error}
              </p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="border-border"
                onClick={() => setIsDialogOpen(false)}
              >
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

            <SelectField
              id="d-state"
              label="State"
              value={staffForm.assigned_state}
              onChange={(v) => setStaffForm({ ...staffForm, assigned_state: v, assigned_lga: "", assigned_ward: "", assigned_unit_id: "" })}
              options={STATE_NAMES}
              placeholder="Select a State..."
            />

            <SelectField
              id="d-lga"
              label="Local Government Area (LGA)"
              value={staffForm.assigned_lga}
              onChange={(v) => setStaffForm({ ...staffForm, assigned_lga: v, assigned_ward: "", assigned_unit_id: "" })}
              options={detailLgas}
              placeholder={staffForm.assigned_state ? "Select an LGA..." : "Select a State first"}
              disabled={!staffForm.assigned_state}
            />

            {isElectionMode && (
              <>
                <SelectField
                  id="d-ward"
                  label="Ward"
                  value={staffForm.assigned_ward}
                  onChange={(v) => setStaffForm({ ...staffForm, assigned_ward: v, assigned_unit_id: "" })}
                  options={detailWardOptions}
                  placeholder={staffForm.assigned_lga ? "Select a ward..." : "Select an LGA first"}
                  disabled={!staffForm.assigned_lga}
                />

                <div className="space-y-2">
                  <Label htmlFor="d-unit">Polling Unit</Label>
                  <select
                    id="d-unit"
                    value={staffForm.assigned_unit_id}
                    onChange={(e) => setStaffForm({ ...staffForm, assigned_unit_id: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                  >
                    <option value="">Select polling unit...</option>
                    {detailPuOptions.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>
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
              <Button
                variant="outline"
                onClick={() => handleGenerateDeviceCode(selectedStaff)}
              >
                Generate Device Reset Code
              </Button>
              <Button
                disabled={editingStaff}
                onClick={handleSaveStaffDetails}
              >
                {editingStaff ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
