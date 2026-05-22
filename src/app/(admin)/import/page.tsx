"use client"

import React, { useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Upload, FileText, CheckCircle2, AlertTriangle,
  Download, Users, MapPin
} from "lucide-react"
import { apiUrl } from "@/lib/api-base"

type ImportType = "units" | "staff"

interface ImportResult {
  created: number
  skipped: number
  errors: string[]
  credentials?: { email: string; temp_password: string }[]
}

const UNIT_TEMPLATE = `name,state,lga,ward,lat,long,external_ref
PU 001 - Ward A,Lagos,Ikeja,Ward 01,6.5244,3.3792,PU-001
PU 002 - Ward B,Lagos,Ikeja,Ward 02,6.5300,3.3850,PU-002`

const STAFF_TEMPLATE = `name,email,state,lga,ward
John Doe,john@example.com,Lagos,Ikeja,Ward 01
Jane Smith,jane@example.com,Lagos,Ikeja,Ward 02`

export default function ImportPage() {
  const [activeTab, setActiveTab] = useState<ImportType>("units")
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const token = typeof window !== "undefined" ? localStorage.getItem("vf_token") : ""

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] ?? null)
    setResult(null)
    setError("")
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const dropped = e.dataTransfer.files[0]
    if (dropped?.name.endsWith(".csv")) {
      setFile(dropped)
      setResult(null)
      setError("")
    }
  }

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    setError("")
    setResult(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const endpoint = activeTab === "units"
        ? apiUrl("/api/v1/import/units")
        : apiUrl("/api/v1/import/staff")

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData,
      })
      const data = await res.json()
      if (res.ok) {
        setResult(data)
        setFile(null)
        if (fileInputRef.current) fileInputRef.current.value = ""
      } else {
        setError(data.message ?? "Upload failed.")
      }
    } catch {
      setError("Network error. Is the backend running?")
    } finally {
      setUploading(false)
    }
  }

  const downloadTemplate = (type: ImportType) => {
    const content = type === "units" ? UNIT_TEMPLATE : STAFF_TEMPLATE
    const blob = new Blob([content], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `verifield_${type}_template.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadCredentials = (creds: { email: string; temp_password: string }[]) => {
    const rows = ["email,temp_password", ...creds.map(c => `${c.email},${c.temp_password}`)]
    const blob = new Blob([rows.join("\n")], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "verifield_staff_credentials.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Bulk Import</h2>
        <p className="text-muted-foreground mt-1">
          Upload a CSV to bulk-create Polling Units or Staff members. Result-sheet numbers are captured from photos, not pre-loaded voter limits.
        </p>
      </div>

      {/* Tab Toggle */}
      <div className="flex gap-2 p-1 bg-muted rounded-lg w-fit">
        {(["units", "staff"] as ImportType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setFile(null); setResult(null); setError("") }}
            className={`flex items-center gap-2 px-5 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === tab
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === "units" ? <MapPin className="w-4 h-4" /> : <Users className="w-4 h-4" />}
            {tab === "units" ? "Polling Units / Sites" : "Staff Members"}
          </button>
        ))}
      </div>

      <Card className="border-border p-6 space-y-4">
        {/* Template Download */}
        <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-primary">
            <FileText className="w-4 h-4" />
            Download the CSV template to see the required format
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-primary/30 text-primary hover:bg-primary/10"
            onClick={() => downloadTemplate(activeTab)}
          >
            <Download className="w-3 h-3 mr-1" /> Template
          </Button>
        </div>

        {/* Drop Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
            file
              ? "border-primary/50 bg-primary/5"
              : "border-border hover:border-primary/40 hover:bg-muted/30"
          }`}
        >
          <Upload className={`w-10 h-10 mx-auto mb-3 ${file ? "text-primary" : "text-muted-foreground"}`} />
          {file ? (
            <div>
              <p className="font-medium text-foreground">{file.name}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {(file.size / 1024).toFixed(1)} KB — click to change
              </p>
            </div>
          ) : (
            <div>
              <p className="font-medium text-foreground">Drop your CSV here or click to browse</p>
              <p className="text-sm text-muted-foreground mt-1">
                Max 5MB · Must match the template columns exactly
              </p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {error && (
          <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
            {error}
          </p>
        )}

        <Button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
        >
          {uploading ? "Importing..." : `Import ${activeTab === "units" ? "Units" : "Staff"}`}
        </Button>
      </Card>

      {/* Results */}
      {result && (
        <Card className="border-border p-6 space-y-4">
          <div className="flex items-center gap-2 text-emerald-500 font-semibold">
            <CheckCircle2 className="w-5 h-5" /> Import Complete
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <div className="text-2xl font-bold text-emerald-500">{result.created}</div>
              <div className="text-xs text-muted-foreground mt-1">Created</div>
            </div>
            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <div className="text-2xl font-bold text-amber-500">{result.skipped}</div>
              <div className="text-xs text-muted-foreground mt-1">Skipped (duplicates)</div>
            </div>
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <div className="text-2xl font-bold text-destructive">{result.errors.length}</div>
              <div className="text-xs text-muted-foreground mt-1">Errors</div>
            </div>
          </div>

          {result.errors.length > 0 && (
            <div className="p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
              <div className="flex items-center gap-2 text-destructive text-sm font-semibold mb-2">
                <AlertTriangle className="w-4 h-4" /> Row Errors
              </div>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                {result.errors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          )}

          {result.credentials && result.credentials.length > 0 && (
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-sm text-primary font-semibold mb-2">
                ✅ {result.credentials.length} staff credentials generated — download now, shown once only.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="border-primary/30 text-primary"
                onClick={() => downloadCredentials(result.credentials!)}
              >
                <Download className="w-3 h-3 mr-1" /> Download Credentials CSV
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
