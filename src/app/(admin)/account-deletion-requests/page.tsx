"use client"

import React, { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { apiUrl } from "@/lib/api-base"

type DeletionRequest = {
  id: string
  requester_type: string
  full_name: string
  email: string
  organisation_name: string | null
  device_model: string | null
  details: string | null
  status: string
  admin_notes: string | null
  created_at: string
  processed_at: string | null
}

type Paginated = {
  data: DeletionRequest[]
  current_page?: number
  last_page?: number
  total?: number
}

export default function AccountDeletionRequestsPage() {
  const [rows, setRows] = useState<DeletionRequest[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("pending")
  const [error, setError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const fetchRows = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem("vf_token")
      const qs = statusFilter ? `?status=${encodeURIComponent(statusFilter)}` : ""
      const res = await fetch(apiUrl(`/api/v1/account-deletion-requests${qs}`), {
        headers: {
          Accept: "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      })
      if (!res.ok) {
        throw new Error("Failed to load deletion requests")
      }
      const json = await res.json()
      const payload = json.data as Paginated | DeletionRequest[]
      if (Array.isArray(payload)) {
        setRows(payload)
        setTotal(payload.length)
      } else {
        setRows(payload?.data ?? [])
        setTotal(payload?.total ?? payload?.data?.length ?? 0)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed")
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    fetchRows()
  }, [fetchRows])

  async function updateStatus(id: string, status: string) {
    setUpdatingId(id)
    try {
      const token = localStorage.getItem("vf_token")
      const res = await fetch(apiUrl(`/api/v1/account-deletion-requests/${id}`), {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) {
        throw new Error("Update failed")
      }
      await fetchRows()
    } catch {
      setError("Could not update request status")
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Account Deletion Requests</h2>
          <p className="mt-1 text-muted-foreground">
            Public requests from https://verifield.com.ng/delete-account (Play / App Store compliance).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>
          <Button variant="outline" onClick={fetchRows}>
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Showing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "—" : rows.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total (filter)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "—" : total}</div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Submitted</TableHead>
              <TableHead>Name / Email</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Organisation</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-muted-foreground">
                  Loading…
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-muted-foreground">
                  No deletion requests for this filter.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="whitespace-nowrap text-sm">
                    {new Date(row.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{row.full_name}</div>
                    <div className="text-sm text-muted-foreground">{row.email}</div>
                    {row.details && (
                      <div className="mt-1 max-w-xs truncate text-xs text-muted-foreground">
                        {row.details}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="capitalize">{row.requester_type}</TableCell>
                  <TableCell>{row.organisation_name || "—"}</TableCell>
                  <TableCell className="capitalize">{row.status}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-wrap justify-end gap-1">
                      {row.status === "pending" && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={updatingId === row.id}
                          onClick={() => updateStatus(row.id, "acknowledged")}
                        >
                          Acknowledge
                        </Button>
                      )}
                      {row.status !== "completed" && (
                        <Button
                          size="sm"
                          disabled={updatingId === row.id}
                          onClick={() => updateStatus(row.id, "completed")}
                        >
                          Complete
                        </Button>
                      )}
                      {row.status !== "rejected" && row.status !== "completed" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={updatingId === row.id}
                          onClick={() => updateStatus(row.id, "rejected")}
                        >
                          Reject
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
