"use client"

import React, { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Settings, Palette, CreditCard, ShieldCheck,
  Save, RefreshCw, AlertCircle, ImageIcon
} from "lucide-react"
import { apiUrl } from "@/lib/api-base"
import { DEFAULT_BRAND_COLOR } from "@/lib/brand-color"

interface SystemConfig {
  app_name: string
  primary_color: string
  logo_url: string
  subscriptions_enabled: boolean
  min_app_version: string
  maintenance_mode: boolean
  active_ocr_engine: "paddle" | "openai" | "google" | "document_ai" | "qwen" | "florence" | "gemini" | "ensemble"
  integrations: {
    map_api_key: string
    storage_access_key: string
    storage_secret_key: string
    play_integrity_key: string
    devicecheck_key: string
    reverb_app_key: string
    paddle_ocr_url: string
    openai_enabled: boolean
    openai_api_key: string
    openai_endpoint: string
    openai_model: string
    openai_prompt: string
    openai_timeout: number
    openai_max_retries: number
    openai_temperature: number
    openai_api_url: string
    openai_api_model: string
    google_vision_api_key: string
    document_ai_project_id: string
    document_ai_processor_id: string
    document_ai_location: string
    qwen_endpoint: string
    florence_endpoint: string
    gemini_enabled: boolean
    gemini_api_key: string
    gemini_endpoint: string
    gemini_model: string
    gemini_prompt: string
    gemini_timeout: number
    gemini_max_retries: number
    gemini_temperature: number
    billing_secret: string
    mail_provider: string
    mail_from_address: string
    mail_from_name: string
    mail_host: string
    mail_port: string
    mail_username: string
    mail_password: string
    mail_encryption: string
  }
}

export default function SettingsPage() {
  const [config, setConfig] = useState<SystemConfig>({
    app_name: "VeriField",
    primary_color: DEFAULT_BRAND_COLOR,
    logo_url: "",
    subscriptions_enabled: true,
    min_app_version: "1.0.0",
    maintenance_mode: false,
    active_ocr_engine: "google",
    integrations: {
      map_api_key: "",
      storage_access_key: "",
      storage_secret_key: "",
      play_integrity_key: "",
      devicecheck_key: "",
      reverb_app_key: "",
      paddle_ocr_url: "http://127.0.0.1:8107",
      openai_enabled: true,
      openai_api_key: "",
      openai_endpoint: "https://api.openai.com/v1/responses",
      openai_model: "",
      openai_prompt: "",
      openai_timeout: 180,
      openai_max_retries: 2,
      openai_temperature: 0.1,
      openai_api_url: "https://api.openai.com/v1/responses",
      openai_api_model: "",
      google_vision_api_key: "",
      document_ai_project_id: "",
      document_ai_processor_id: "",
      document_ai_location: "us",
      qwen_endpoint: "http://127.0.0.1:8110",
      florence_endpoint: "http://127.0.0.1:8111",
      gemini_enabled: true,
      gemini_api_key: "",
      gemini_endpoint: "https://generativelanguage.googleapis.com/v1beta",
      gemini_model: "",
      gemini_prompt: "",
      gemini_timeout: 180,
      gemini_max_retries: 2,
      gemini_temperature: 0.1,
      billing_secret: "",
      mail_provider: "",
      mail_from_address: "",
      mail_from_name: "",
      mail_host: "",
      mail_port: "",
      mail_username: "",
      mail_password: "",
      mail_encryption: "",
    },
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [defaultEc8aPrompt, setDefaultEc8aPrompt] = useState("")
  const [error, setError] = useState("")

  const token = typeof window !== "undefined" ? localStorage.getItem("vf_token") : ""

  useEffect(() => {
    fetch(apiUrl("/api/v1/config"), {
      headers: { "Accept": "application/json" }
    })
      .then(r => r.json())
      .then(json => {
        if (json.data) {
          setConfig(prev => {
            const integrations = {
              ...prev.integrations,
              ...(json.data.integrations ?? {}),
            }
            const legacy = integrations as typeof integrations & {
              vision_api_key?: string
              vision_api_url?: string
              vision_api_model?: string
            }
            if (!integrations.openai_api_key && legacy.vision_api_key) {
              integrations.openai_api_key = legacy.vision_api_key
            }
            if (!integrations.openai_api_url && legacy.vision_api_url) {
              integrations.openai_api_url = legacy.vision_api_url
            }
            if (!integrations.openai_api_model && legacy.vision_api_model) {
              integrations.openai_api_model = legacy.vision_api_model
            }
            if (!integrations.openai_model && integrations.openai_api_model) {
              integrations.openai_model = integrations.openai_api_model
            }
            if (!integrations.openai_endpoint && integrations.openai_api_url) {
              integrations.openai_endpoint = integrations.openai_api_url
            }
            if (integrations.openai_endpoint?.includes("chat/completions")) {
              integrations.openai_endpoint = "https://api.openai.com/v1/responses"
            }
            if (!integrations.openai_prompt) {
              integrations.openai_prompt = ""
            }
            if (!integrations.gemini_prompt) {
              integrations.gemini_prompt = ""
            }
            if (integrations.openai_enabled === undefined) {
              integrations.openai_enabled = true
            }
            if (integrations.gemini_enabled === undefined) {
              integrations.gemini_enabled = true
            }
            if (json.data.default_ec8a_prompt) {
              setDefaultEc8aPrompt(json.data.default_ec8a_prompt as string)
            }
            const engine = json.data.active_ocr_engine
            const activeOcrEngine =
              engine === "vision" ? "openai"
              : ["paddle", "openai", "google", "document_ai", "qwen", "florence", "gemini", "ensemble"].includes(engine) ? engine
              : "google"

            return {
              ...prev,
              ...json.data,
              active_ocr_engine: activeOcrEngine,
              integrations,
            }
          })
        }
        setLoading(false)
      })
      .catch(() => {
        setError("Failed to load configuration.")
        setLoading(false)
      })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setError("")
    try {
      const res = await fetch(apiUrl("/api/v1/admin/config"), {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(config),
      })
      if (!res.ok) throw new Error("Save failed")
      window.dispatchEvent(new Event("vf-brand-updated"))
      alert("Settings updated successfully!")
    } catch {
      setError("Failed to save settings. Are you a Super Admin?")
    } finally {
      setSaving(false)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingLogo(true)
    setError("")
    try {
      const body = new FormData()
      body.append("logo", file)
      const res = await fetch(apiUrl("/api/v1/admin/branding/logo"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body,
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || "Upload failed")
      const url = json.data?.url as string
      if (url) {
        const nextConfig = { ...config, logo_url: url }
        setConfig(nextConfig)
        const saveRes = await fetch(apiUrl("/api/v1/admin/config"), {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(nextConfig),
        })
        if (!saveRes.ok) throw new Error("Logo uploaded but failed to save settings.")
        window.dispatchEvent(new Event("vf-brand-updated"))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Logo upload failed.")
    } finally {
      setUploadingLogo(false)
      e.target.value = ""
    }
  }

  if (loading) return <div className="p-8 animate-pulse text-muted-foreground">Loading settings...</div>

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">System Settings</h2>
        <p className="text-muted-foreground mt-1">
          Global configuration for branding, security, and billing.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Navigation / Sidebar for settings */}
        <div className="space-y-2">
          <Button variant="ghost" className="w-full justify-start gap-2 bg-primary/10 text-primary">
            <Palette className="w-4 h-4" /> Branding & Theme
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <CreditCard className="w-4 h-4" /> Subscriptions & Billing
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <ShieldCheck className="w-4 h-4" /> Security & Versioning
          </Button>
        </div>

        <div className="md:col-span-2 space-y-6">
          {/* Branding Section */}
          <Card className="p-6 border-border space-y-6">
            <div className="flex items-center gap-2 font-semibold text-lg border-b border-border pb-4">
              <Palette className="w-5 h-5 text-primary" />
              Branding & Identity
            </div>

            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="app_name">Application Name</Label>
                <Input
                  id="app_name"
                  value={config.app_name}
                  onChange={e => setConfig({ ...config, app_name: e.target.value })}
                  placeholder="e.g. VeriField Pro"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="logo_url">Logo</Label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    id="logo_url"
                    value={config.logo_url}
                    onChange={e => setConfig({ ...config, logo_url: e.target.value })}
                    placeholder="https://... or upload below"
                    className="flex-1"
                  />
                  <div className="w-12 h-12 border border-border rounded bg-muted flex items-center justify-center overflow-hidden shrink-0">
                    {config.logo_url ? (
                      <img src={config.logo_url} alt="Logo preview" className="max-w-full max-h-full object-contain" />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <label
                    className={`inline-flex h-7 items-center justify-center rounded-[min(var(--radius-md),12px)] border border-border bg-background px-2.5 text-[0.8rem] font-medium whitespace-nowrap transition-all hover:bg-muted hover:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50 ${
                      uploadingLogo ? "pointer-events-none opacity-50" : "cursor-pointer"
                    }`}
                  >
                    {uploadingLogo ? "Uploading…" : "Upload logo file"}
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      className="sr-only"
                      onChange={handleLogoUpload}
                      disabled={uploadingLogo}
                    />
                  </label>
                  <span className="text-xs text-muted-foreground">
                    PNG, JPG, WebP, or SVG — stored on server (survives deploy). Also used as favicon.
                  </span>
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Primary Brand Color</Label>
                <div className="flex gap-3 items-center">
                  <input
                    type="color"
                    value={config.primary_color}
                    onChange={e => setConfig({ ...config, primary_color: e.target.value })}
                    className="w-12 h-12 rounded cursor-pointer border-none p-0 bg-transparent"
                  />
                  <Input
                    value={config.primary_color}
                    onChange={e => setConfig({ ...config, primary_color: e.target.value })}
                    className="font-mono uppercase"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Subscriptions Section */}
          <Card className="p-6 border-border space-y-6">
            <div className="flex items-center gap-2 font-semibold text-lg border-b border-border pb-4">
              <CreditCard className="w-5 h-5 text-primary" />
              SaaS Configuration
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Enable Subscriptions</Label>
                <p className="text-sm text-muted-foreground">
                  If disabled, the landing page pricing is hidden and signups are free.
                </p>
              </div>
              <Switch
                checked={config.subscriptions_enabled}
                onCheckedChange={v => setConfig({ ...config, subscriptions_enabled: v })}
              />
            </div>
          </Card>

          {/* Security & Updates */}
          <Card className="p-6 border-border space-y-6">
            <div className="flex items-center gap-2 font-semibold text-lg border-b border-border pb-4">
              <ShieldCheck className="w-5 h-5 text-primary" />
              App Governance
            </div>

            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="min_version">Minimum App Version</Label>
                <Input
                  id="min_version"
                  value={config.min_app_version}
                  onChange={e => setConfig({ ...config, min_app_version: e.target.value })}
                  placeholder="1.0.0"
                />
                <p className="text-xs text-muted-foreground">
                  Agents on versions below this will be forced to update.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="space-y-0.5">
                  <Label className="text-base text-amber-500">Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Stop all capture and verification activity globally.
                  </p>
                </div>
                <Switch
                  checked={config.maintenance_mode}
                  onCheckedChange={v => setConfig({ ...config, maintenance_mode: v })}
                />
              </div>
            </div>
          </Card>

          {/* AI Extraction Engine (Super Admin global toggle) */}
          <Card className="p-6 border-border space-y-6">
            <div className="flex items-center gap-2 font-semibold text-lg border-b border-border pb-4">
              <Settings className="w-5 h-5 text-primary" />
              AI Extraction Engine
            </div>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="active_ocr_engine">Active AI Extraction Engine</Label>
                <select
                  id="active_ocr_engine"
                  value={config.active_ocr_engine}
                  onChange={e => setConfig({
                    ...config,
                    active_ocr_engine: e.target.value as SystemConfig["active_ocr_engine"],
                  })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="paddle">PaddleOCR</option>
                  <option value="google">Google Vision</option>
                  <option value="document_ai">Google Document AI</option>
                  <option value="qwen">Qwen2.5-VL</option>
                  <option value="florence">Florence-2</option>
                  <option value="openai">OpenAI</option>
                  <option value="gemini">Gemini</option>
                  <option value="ensemble">Ensemble Mode</option>
                </select>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Applies globally to all EC8A extractions. Ensemble Mode runs Qwen2.5-VL and Florence-2 in parallel —
                  identical fields are VERIFIED; any mismatch returns NEEDS_REVIEW (no guessing).
                </p>
              </div>

              {config.active_ocr_engine === "paddle" && (
                <div className="grid gap-2 rounded-lg border border-border p-4 bg-muted/30">
                  <Label htmlFor="paddle_ocr_url">PaddleOCR Service URL</Label>
                  <Input
                    id="paddle_ocr_url"
                    value={config.integrations.paddle_ocr_url}
                    onChange={e => setConfig({
                      ...config,
                      integrations: { ...config.integrations, paddle_ocr_url: e.target.value },
                    })}
                    placeholder="http://127.0.0.1:8107"
                  />
                  <p className="text-xs text-muted-foreground">
                    Requires the Python microservice running on this VPS (PM2 process{" "}
                    <code className="text-xs">verifield-ocr</code> on port 8107).
                  </p>
                </div>
              )}

              {config.active_ocr_engine === "google" && (
                <div className="grid gap-2 rounded-lg border border-border p-4 bg-muted/30">
                  <Label htmlFor="google_vision_api_key">Google Cloud Vision API Key</Label>
                  <Input
                    id="google_vision_api_key"
                    type="password"
                    placeholder="AIza..."
                    value={config.integrations.google_vision_api_key}
                    onChange={e => setConfig({
                      ...config,
                      integrations: { ...config.integrations, google_vision_api_key: e.target.value },
                    })}
                  />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Primary auth for Super Admin. Restrict the key to Cloud Vision API and your VPS egress IP.
                    Alternatively, set a service account JSON on the server via{" "}
                    <code className="text-xs">GOOGLE_APPLICATION_CREDENTIALS</code> in{" "}
                    <code className="text-xs">.env</code> (used when no API key is saved here).
                  </p>
                </div>
              )}

              {config.active_ocr_engine === "document_ai" && (
                <div className="grid gap-4 rounded-lg border border-border p-4 bg-muted/30">
                  <div className="grid gap-2">
                    <Label htmlFor="document_ai_project_id">GCP Project ID</Label>
                    <Input
                      id="document_ai_project_id"
                      value={config.integrations.document_ai_project_id}
                      onChange={e => setConfig({
                        ...config,
                        integrations: { ...config.integrations, document_ai_project_id: e.target.value },
                      })}
                      placeholder="verifield-election"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="document_ai_processor_id">Form Parser Processor ID</Label>
                    <Input
                      id="document_ai_processor_id"
                      value={config.integrations.document_ai_processor_id}
                      onChange={e => setConfig({
                        ...config,
                        integrations: { ...config.integrations, document_ai_processor_id: e.target.value },
                      })}
                      placeholder="abc123def456..."
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="document_ai_location">Processor Location</Label>
                    <Input
                      id="document_ai_location"
                      value={config.integrations.document_ai_location}
                      onChange={e => setConfig({
                        ...config,
                        integrations: { ...config.integrations, document_ai_location: e.target.value },
                      })}
                      placeholder="us"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Requires a Document AI <strong>Form Parser</strong> processor and service account on the VPS via{" "}
                    <code className="text-xs">GOOGLE_APPLICATION_CREDENTIALS</code>.
                  </p>
                </div>
              )}

              {config.active_ocr_engine === "qwen" && (
                <div className="grid gap-2 rounded-lg border border-border p-4 bg-muted/30">
                  <Label htmlFor="qwen_endpoint">Qwen2.5-VL Service URL</Label>
                  <Input
                    id="qwen_endpoint"
                    value={config.integrations.qwen_endpoint}
                    onChange={e => setConfig({
                      ...config,
                      integrations: { ...config.integrations, qwen_endpoint: e.target.value },
                    })}
                    placeholder="http://127.0.0.1:8110"
                  />
                </div>
              )}

              {config.active_ocr_engine === "florence" && (
                <div className="grid gap-2 rounded-lg border border-border p-4 bg-muted/30">
                  <Label htmlFor="florence_endpoint">Florence-2 Service URL</Label>
                  <Input
                    id="florence_endpoint"
                    value={config.integrations.florence_endpoint}
                    onChange={e => setConfig({
                      ...config,
                      integrations: { ...config.integrations, florence_endpoint: e.target.value },
                    })}
                    placeholder="http://127.0.0.1:8111"
                  />
                </div>
              )}

              {config.active_ocr_engine === "ensemble" && (
                <div className="grid gap-4 rounded-lg border border-border p-4 bg-muted/30">
                  <div className="grid gap-2">
                    <Label htmlFor="qwen_endpoint_ensemble">Qwen2.5-VL Service URL</Label>
                    <Input
                      id="qwen_endpoint_ensemble"
                      value={config.integrations.qwen_endpoint}
                      onChange={e => setConfig({
                        ...config,
                        integrations: { ...config.integrations, qwen_endpoint: e.target.value },
                      })}
                      placeholder="http://127.0.0.1:8110"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="florence_endpoint_ensemble">Florence-2 Service URL</Label>
                    <Input
                      id="florence_endpoint_ensemble"
                      value={config.integrations.florence_endpoint}
                      onChange={e => setConfig({
                        ...config,
                        integrations: { ...config.integrations, florence_endpoint: e.target.value },
                      })}
                      placeholder="http://127.0.0.1:8111"
                    />
                  </div>
                </div>
              )}

              <div className="grid gap-4 rounded-lg border border-border p-4 bg-muted/30">
                <div className="font-medium text-sm">OpenAI Configuration</div>
                <p className="text-xs text-muted-foreground -mt-2">
                  Provider: OpenAI · Uses the Responses API with multimodal image input. Model and prompt are loaded dynamically.
                </p>
                <div className="flex items-center justify-between">
                  <Label>Enable OpenAI</Label>
                  <Switch
                    checked={config.integrations.openai_enabled}
                    onCheckedChange={v => setConfig({
                      ...config,
                      integrations: { ...config.integrations, openai_enabled: v },
                    })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="openai_api_key">OpenAI API Key</Label>
                  <Input
                    id="openai_api_key"
                    type="password"
                    placeholder="sk-..."
                    value={config.integrations.openai_api_key}
                    onChange={e => setConfig({
                      ...config,
                      integrations: { ...config.integrations, openai_api_key: e.target.value },
                    })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="openai_endpoint">OpenAI API Endpoint</Label>
                  <Input
                    id="openai_endpoint"
                    value={config.integrations.openai_endpoint}
                    onChange={e => setConfig({
                      ...config,
                      integrations: { ...config.integrations, openai_endpoint: e.target.value },
                    })}
                    placeholder="https://api.openai.com/v1/responses"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="openai_model">OpenAI Model</Label>
                  <Input
                    id="openai_model"
                    value={config.integrations.openai_model}
                    onChange={e => setConfig({
                      ...config,
                      integrations: { ...config.integrations, openai_model: e.target.value },
                    })}
                    placeholder="gpt-5.5"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="openai_prompt">Extraction Prompt</Label>
                  <textarea
                    id="openai_prompt"
                    rows={8}
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring font-mono"
                    value={config.integrations.openai_prompt}
                    onChange={e => setConfig({
                      ...config,
                      integrations: { ...config.integrations, openai_prompt: e.target.value },
                    })}
                    placeholder="Leave empty to use the default EC8A prompt ({party_codes} is substituted at runtime)"
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave prompt empty to use the server default.{" "}
                    <button
                      type="button"
                      className="underline text-primary"
                      onClick={() => setConfig({
                        ...config,
                        integrations: { ...config.integrations, openai_prompt: defaultEc8aPrompt },
                      })}
                    >
                      Load default EC8A prompt
                    </button>
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="openai_timeout">Timeout (seconds)</Label>
                    <Input
                      id="openai_timeout"
                      type="number"
                      min={30}
                      max={900}
                      value={config.integrations.openai_timeout}
                      onChange={e => setConfig({
                        ...config,
                        integrations: { ...config.integrations, openai_timeout: Number(e.target.value) },
                      })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="openai_max_retries">Maximum Retries</Label>
                    <Input
                      id="openai_max_retries"
                      type="number"
                      min={0}
                      max={5}
                      value={config.integrations.openai_max_retries}
                      onChange={e => setConfig({
                        ...config,
                        integrations: { ...config.integrations, openai_max_retries: Number(e.target.value) },
                      })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="openai_temperature">Temperature</Label>
                    <Input
                      id="openai_temperature"
                      type="number"
                      min={0}
                      max={2}
                      step={0.1}
                      value={config.integrations.openai_temperature}
                      onChange={e => setConfig({
                        ...config,
                        integrations: { ...config.integrations, openai_temperature: Number(e.target.value) },
                      })}
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 rounded-lg border border-border p-4 bg-muted/30">
                <div className="font-medium text-sm">Gemini Configuration</div>
                <p className="text-xs text-muted-foreground -mt-2">
                  Provider: Gemini · Model and prompt are loaded dynamically from Admin Settings.
                </p>
                <div className="flex items-center justify-between">
                  <Label>Enable Gemini</Label>
                  <Switch
                    checked={config.integrations.gemini_enabled}
                    onCheckedChange={v => setConfig({
                      ...config,
                      integrations: { ...config.integrations, gemini_enabled: v },
                    })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="gemini_api_key">Gemini API Key</Label>
                  <Input
                    id="gemini_api_key"
                    type="password"
                    value={config.integrations.gemini_api_key}
                    onChange={e => setConfig({
                      ...config,
                      integrations: { ...config.integrations, gemini_api_key: e.target.value },
                    })}
                    placeholder="AIza..."
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="gemini_endpoint">Gemini API Endpoint</Label>
                  <Input
                    id="gemini_endpoint"
                    value={config.integrations.gemini_endpoint}
                    onChange={e => setConfig({
                      ...config,
                      integrations: { ...config.integrations, gemini_endpoint: e.target.value },
                    })}
                    placeholder="https://generativelanguage.googleapis.com/v1beta"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="gemini_model">Gemini Model</Label>
                  <Input
                    id="gemini_model"
                    value={config.integrations.gemini_model}
                    onChange={e => setConfig({
                      ...config,
                      integrations: { ...config.integrations, gemini_model: e.target.value },
                    })}
                    placeholder="gemini-2.5-pro"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="gemini_prompt">Extraction Prompt</Label>
                  <textarea
                    id="gemini_prompt"
                    rows={8}
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring font-mono"
                    value={config.integrations.gemini_prompt}
                    onChange={e => setConfig({
                      ...config,
                      integrations: { ...config.integrations, gemini_prompt: e.target.value },
                    })}
                    placeholder="Leave empty to use the default EC8A prompt ({party_codes} is substituted at runtime)"
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave prompt empty to use the server default.{" "}
                    <button
                      type="button"
                      className="underline text-primary"
                      onClick={() => setConfig({
                        ...config,
                        integrations: { ...config.integrations, gemini_prompt: defaultEc8aPrompt },
                      })}
                    >
                      Load default EC8A prompt
                    </button>
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="gemini_timeout">Timeout (seconds)</Label>
                    <Input
                      id="gemini_timeout"
                      type="number"
                      min={30}
                      max={900}
                      value={config.integrations.gemini_timeout}
                      onChange={e => setConfig({
                        ...config,
                        integrations: { ...config.integrations, gemini_timeout: Number(e.target.value) },
                      })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="gemini_max_retries">Maximum Retries</Label>
                    <Input
                      id="gemini_max_retries"
                      type="number"
                      min={0}
                      max={5}
                      value={config.integrations.gemini_max_retries}
                      onChange={e => setConfig({
                        ...config,
                        integrations: { ...config.integrations, gemini_max_retries: Number(e.target.value) },
                      })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="gemini_temperature">Temperature</Label>
                    <Input
                      id="gemini_temperature"
                      type="number"
                      min={0}
                      max={2}
                      step={0.1}
                      value={config.integrations.gemini_temperature}
                      onChange={e => setConfig({
                        ...config,
                        integrations: { ...config.integrations, gemini_temperature: Number(e.target.value) },
                      })}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Integration Secrets */}
          <Card className="p-6 border-border space-y-6">
            <div className="flex items-center gap-2 font-semibold text-lg border-b border-border pb-4">
              <Settings className="w-5 h-5 text-primary" />
              Integration Keys & Secrets
            </div>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="map_api_key">Map API Key (Leaflet provider key if required)</Label>
                <Input
                  id="map_api_key"
                  value={config.integrations.map_api_key}
                  onChange={e => setConfig({
                    ...config,
                    integrations: { ...config.integrations, map_api_key: e.target.value },
                  })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="storage_access_key">Storage Access Key (S3/Spaces)</Label>
                <Input
                  id="storage_access_key"
                  value={config.integrations.storage_access_key}
                  onChange={e => setConfig({
                    ...config,
                    integrations: { ...config.integrations, storage_access_key: e.target.value },
                  })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="storage_secret_key">Storage Secret Key</Label>
                <Input
                  id="storage_secret_key"
                  type="password"
                  value={config.integrations.storage_secret_key}
                  onChange={e => setConfig({
                    ...config,
                    integrations: { ...config.integrations, storage_secret_key: e.target.value },
                  })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="play_integrity_key">Google Play Integrity Key</Label>
                <Input
                  id="play_integrity_key"
                  value={config.integrations.play_integrity_key}
                  onChange={e => setConfig({
                    ...config,
                    integrations: { ...config.integrations, play_integrity_key: e.target.value },
                  })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="devicecheck_key">Apple DeviceCheck Key</Label>
                <Input
                  id="devicecheck_key"
                  value={config.integrations.devicecheck_key}
                  onChange={e => setConfig({
                    ...config,
                    integrations: { ...config.integrations, devicecheck_key: e.target.value },
                  })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="reverb_app_key">Laravel Reverb App Key</Label>
                <Input
                  id="reverb_app_key"
                  value={config.integrations.reverb_app_key}
                  onChange={e => setConfig({
                    ...config,
                    integrations: { ...config.integrations, reverb_app_key: e.target.value },
                  })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="billing_secret">Billing Secret (Stripe/Flutterwave)</Label>
                <Input
                  id="billing_secret"
                  type="password"
                  value={config.integrations.billing_secret}
                  onChange={e => setConfig({
                    ...config,
                    integrations: { ...config.integrations, billing_secret: e.target.value },
                  })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="mail_provider">Mail Provider (SES/Mailgun/Brevo/Resend)</Label>
                <Input
                  id="mail_provider"
                  value={config.integrations.mail_provider}
                  onChange={e => setConfig({
                    ...config,
                    integrations: { ...config.integrations, mail_provider: e.target.value },
                  })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="mail_from_address">Mail From Address</Label>
                <Input
                  id="mail_from_address"
                  value={config.integrations.mail_from_address}
                  onChange={e => setConfig({
                    ...config,
                    integrations: { ...config.integrations, mail_from_address: e.target.value },
                  })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="mail_from_name">Mail From Name</Label>
                <Input
                  id="mail_from_name"
                  value={config.integrations.mail_from_name}
                  onChange={e => setConfig({
                    ...config,
                    integrations: { ...config.integrations, mail_from_name: e.target.value },
                  })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="mail_host">Mail Host</Label>
                <Input
                  id="mail_host"
                  value={config.integrations.mail_host}
                  onChange={e => setConfig({
                    ...config,
                    integrations: { ...config.integrations, mail_host: e.target.value },
                  })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="mail_port">Mail Port</Label>
                <Input
                  id="mail_port"
                  value={config.integrations.mail_port}
                  onChange={e => setConfig({
                    ...config,
                    integrations: { ...config.integrations, mail_port: e.target.value },
                  })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="mail_username">Mail Username</Label>
                <Input
                  id="mail_username"
                  value={config.integrations.mail_username}
                  onChange={e => setConfig({
                    ...config,
                    integrations: { ...config.integrations, mail_username: e.target.value },
                  })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="mail_password">Mail Password / API Key</Label>
                <Input
                  id="mail_password"
                  type="password"
                  value={config.integrations.mail_password}
                  onChange={e => setConfig({
                    ...config,
                    integrations: { ...config.integrations, mail_password: e.target.value },
                  })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="mail_encryption">Mail Encryption (tls/ssl)</Label>
                <Input
                  id="mail_encryption"
                  value={config.integrations.mail_encryption}
                  onChange={e => setConfig({
                    ...config,
                    integrations: { ...config.integrations, mail_encryption: e.target.value },
                  })}
                />
              </div>
            </div>
          </Card>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive p-3 rounded-lg flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}

          <div className="flex justify-end pt-4">
            <Button
              className="gap-2 bg-primary text-primary-foreground min-w-[140px]"
              disabled={saving}
              onClick={handleSave}
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
