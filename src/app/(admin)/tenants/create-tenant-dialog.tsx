"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface CreateTenantDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateTenantDialog({ open, onOpenChange, onSuccess }: CreateTenantDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    type: "election",
    app_name: "",
    primary_color: "#6366f1",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("http://localhost:8000/api/v1/tenants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        onSuccess()
        onOpenChange(false)
        setFormData({ name: "", type: "election", app_name: "", primary_color: "#6366f1" })
      } else {
        const error = await res.json()
        alert(`Error: ${error.message || "Failed to create tenant"}`)
      }
    } catch (err) {
      console.error(err)
      alert("Network error.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-zinc-950 border border-white/10 text-white shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Create New Tenant</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Provision a new environment for a Company or Political Party.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-zinc-300">Tenant Name (Internal)</Label>
            <Input 
              id="name" 
              placeholder="e.g. Acme Corp or Party A" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
              className="bg-black/50 border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-indigo-500"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type" className="text-zinc-300">Operational Mode</Label>
            <select 
              id="type"
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              className="flex h-10 w-full items-center justify-between rounded-md border border-white/10 bg-black/50 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="election">Election Mode (PU / Ward)</option>
              <option value="corporate">Corporate Mode (Store / Territory)</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="app_name" className="text-zinc-300">App Name (Public Facing)</Label>
            <Input 
              id="app_name" 
              placeholder="e.g. Acme Field App" 
              value={formData.app_name}
              onChange={(e) => setFormData({...formData, app_name: e.target.value})}
              className="bg-black/50 border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-indigo-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="primary_color" className="text-zinc-300">Brand Color</Label>
            <div className="flex gap-3 items-center">
              <Input 
                id="primary_color" 
                type="color"
                value={formData.primary_color}
                onChange={(e) => setFormData({...formData, primary_color: e.target.value})}
                className="w-16 h-10 p-1 bg-black/50 border-white/10 rounded cursor-pointer"
              />
              <span className="font-mono text-sm text-zinc-400">{formData.primary_color}</span>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="bg-transparent border-white/10 text-white hover:bg-white/5 hover:text-white"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-all"
            >
              {loading ? "Provisioning..." : "Provision Tenant"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
