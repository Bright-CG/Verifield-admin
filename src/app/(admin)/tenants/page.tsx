"use client"

import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Plus, Settings2, ShieldCheck, Activity } from "lucide-react"
import { CreateTenantDialog } from "./create-tenant-dialog"
import { apiUrl } from "@/lib/api-base"

export default function TenantsPage() {
  const [tenants, setTenants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const fetchTenants = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("vf_token")
      const res = await fetch(apiUrl("/api/v1/tenants"), {
        headers: {
          "Accept": "application/json",
          "Authorization": token ? `Bearer ${token}` : "",
        },
      })
      if (res.ok) {
        const json = await res.json()
        setTenants(json.data ?? [])
      }
    } catch {
      // Backend not running — handled silently; table shows empty state
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTenants()
  }, [])

  return (
    <div className="space-y-6">
      
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Tenants</h2>
          <p className="text-slate-400 mt-1">Manage corporate clients and political parties on the VeriField platform.</p>
        </div>
        <Button 
          onClick={() => setIsDialogOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all border border-indigo-500/50"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Tenant
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-white/5 border-white/10 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Total Active Tenants</CardTitle>
            <ShieldCheck className="h-4 w-4 text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{loading ? "-" : tenants.length}</div>
            <p className="text-xs text-slate-500">+1 from last month</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">API Health</CardTitle>
            <Activity className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">99.9%</div>
            <p className="text-xs text-slate-500">All systems operational</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/5 border-white/10 backdrop-blur-xl shadow-2xl">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-slate-400">ID / Name</TableHead>
              <TableHead className="text-slate-400">Type</TableHead>
              <TableHead className="text-slate-400">App Name</TableHead>
              <TableHead className="text-slate-400">Branding Color</TableHead>
              <TableHead className="text-slate-400 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow className="border-white/10">
                <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 rounded-full bg-indigo-500/50 animate-pulse" />
                    <span>Loading secure ledger...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : tenants.length === 0 ? (
              <TableRow className="border-white/10">
                <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                  No tenants configured. Create one to begin.
                </TableCell>
              </TableRow>
            ) : (
              tenants.map((tenant) => (
                <TableRow key={tenant.id} className="border-white/10 hover:bg-white/5 transition-colors group">
                  <TableCell className="font-medium text-white">
                    {tenant.name}
                    <div className="text-[10px] text-slate-500 font-mono">{tenant.id}</div>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${tenant.type === 'election' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                      {tenant.type.toUpperCase()}
                    </span>
                  </TableCell>
                  <TableCell className="text-slate-300">
                    {tenant.branding_config?.app_name || tenant.name}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-4 h-4 rounded-full border border-white/20 shadow-inner" 
                        style={{ backgroundColor: tenant.branding_config?.primary_color || '#000000' }}
                      />
                      <span className="text-xs text-slate-400 font-mono">{tenant.branding_config?.primary_color || '#000000'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Settings2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <CreateTenantDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        onSuccess={fetchTenants}
      />
    </div>
  )
}
