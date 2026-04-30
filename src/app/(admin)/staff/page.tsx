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
import { Plus, CheckCircle2, Clock, Copy, Eye } from "lucide-react"

interface Staff {
  id: string
  name: string
  email: string
  role: string
  email_verified_at: string | null
  assigned_state: string | null
  assigned_lga: string | null
  assigned_ward: string | null
  created_at: string
}

interface NewCredentials {
  email: string
  temp_password: string
}

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [credentials, setCredentials] = useState<NewCredentials | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const [form, setForm] = useState({
    name: "", email: "",
    assigned_state: "", assigned_lga: "", assigned_ward: "",
  })

  const token = typeof window !== "undefined" ? localStorage.getItem("vf_token") : ""

  const fetchStaff = async () => {
    setLoading(true)
    try {
      const res = await fetch("http://localhost:8000/api/v1/staff", {
        headers: { "Accept": "application/json", "Authorization": `Bearer ${token}` },
      })
      if (res.ok) {
        const json = await res.json()
        setStaff(json.data)
      }
    } catch { /* network error */ }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchStaff() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")
    try {
      const res = await fetch("http://localhost:8000/api/v1/staff", {
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
        setForm({ name: "", email: "", assigned_state: "", assigned_lga: "", assigned_ward: "" })
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
          <h2 className="text-3xl font-bold tracking-tight">Staff Management</h2>
          <p className="text-muted-foreground mt-1">
            Create and assign field agents to their geographic territories.
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" /> Add Staff
        </Button>
      </div>

      {/* Credentials Banner */}
      {credentials && (
        <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-primary mb-1">✅ Staff created! Share these credentials once — they will not be shown again.</p>
            <p className="text-sm text-foreground">Email: <span className="font-mono font-bold">{credentials.email}</span></p>
            <p className="text-sm text-foreground">Temp Password: <span className="font-mono font-bold">{credentials.temp_password}</span></p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(`Email: ${credentials.email}\nPassword: ${credentials.temp_password}`)}>
              <Copy className="w-3 h-3 mr-1" /> Copy
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setCredentials(null)}>Dismiss</Button>
          </div>
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
              <TableHead>Email Verified</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow className="border-border">
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Loading staff...
                </TableCell>
              </TableRow>
            ) : staff.length === 0 ? (
              <TableRow className="border-border">
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No staff added yet. Click &quot;Add Staff&quot; to get started.
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
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(member.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Add Staff Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle>Add New Staff Member</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Assign a field agent to their territory. A temporary password will be auto-generated.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="s-name">Full Name</Label>
              <Input id="s-name" placeholder="John Doe" required value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-background border-input" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="s-email">Email Address</Label>
              <Input id="s-email" type="email" placeholder="agent@example.com" required value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} className="bg-background border-input" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="s-state">State</Label>
                <Input id="s-state" placeholder="Lagos" value={form.assigned_state}
                  onChange={(e) => setForm({ ...form, assigned_state: e.target.value })} className="bg-background border-input" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="s-lga">LGA</Label>
                <Input id="s-lga" placeholder="Ikeja" value={form.assigned_lga}
                  onChange={(e) => setForm({ ...form, assigned_lga: e.target.value })} className="bg-background border-input" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="s-ward">Ward</Label>
                <Input id="s-ward" placeholder="Ward 01" value={form.assigned_ward}
                  onChange={(e) => setForm({ ...form, assigned_ward: e.target.value })} className="bg-background border-input" />
              </div>
            </div>
            {error && (
              <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">{error}</p>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="border-border">Cancel</Button>
              <Button type="submit" disabled={submitting} className="bg-primary text-primary-foreground hover:bg-primary/90">
                {submitting ? "Creating..." : "Create Staff"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
