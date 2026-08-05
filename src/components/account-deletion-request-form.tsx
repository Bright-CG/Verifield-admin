"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiUrl } from "@/lib/api-base"

export function AccountDeletionRequestForm() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [organisationName, setOrganisationName] = useState("")
  const [deviceModel, setDeviceModel] = useState("")
  const [requesterType, setRequesterType] = useState("agent")
  const [details, setDetails] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await fetch(apiUrl("/api/v1/account-deletion-requests"), {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: fullName,
          email,
          organisation_name: organisationName || null,
          device_model: deviceModel || null,
          requester_type: requesterType,
          details: details || null,
        }),
      })

      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        const firstError =
          json?.errors && typeof json.errors === "object"
            ? Object.values(json.errors).flat()?.[0]
            : null
        throw new Error(
          (typeof firstError === "string" && firstError) ||
            json?.message ||
            "Could not submit your request. Please try again or email privacy@verifield.com.ng."
        )
      }

      setSuccess(
        json?.message ||
          "Deletion request received. We aim to acknowledge within 2 business days and complete or update you within 30 days."
      )
      setFullName("")
      setEmail("")
      setOrganisationName("")
      setDeviceModel("")
      setDetails("")
      setRequesterType("agent")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="not-prose rounded-lg border border-border bg-muted/20 p-5">
      <h3 className="text-base font-semibold tracking-tight text-foreground">
        Submit a deletion request
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        No login required. Your request is saved for VeriField operators and processed under our
        30-day timeline. You can still email{" "}
        <a href="mailto:privacy@verifield.com.ng" className="text-primary hover:underline">
          privacy@verifield.com.ng
        </a>{" "}
        instead.
      </p>

      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="del-name">Full name</Label>
            <Input
              id="del-name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="del-email">Account email</Label>
            <Input
              id="del-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="del-org">Organisation name (optional)</Label>
            <Input
              id="del-org"
              value={organisationName}
              onChange={(e) => setOrganisationName(e.target.value)}
              placeholder="Your organisation / party"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="del-type">I am a</Label>
            <select
              id="del-type"
              value={requesterType}
              onChange={(e) => setRequesterType(e.target.value)}
              className="flex h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
            >
              <option value="agent">Field agent</option>
              <option value="admin">Organisation admin</option>
              <option value="organisation">Organisation closure</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="del-device">Device model (optional)</Label>
          <Input
            id="del-device"
            value={deviceModel}
            onChange={(e) => setDeviceModel(e.target.value)}
            placeholder="e.g. Samsung Galaxy A15"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="del-details">Additional details (optional)</Label>
          <textarea
            id="del-details"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
            placeholder="Anything that helps us find your account"
          />
        </div>

        {error && (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}
        {success && (
          <p className="rounded-md border border-secondary/30 bg-secondary/10 px-3 py-2 text-sm text-foreground">
            {success}
          </p>
        )}

        <Button
          type="submit"
          disabled={submitting}
          className="h-10 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {submitting ? "Submitting…" : "Submit deletion request"}
        </Button>
      </form>
    </div>
  )
}
