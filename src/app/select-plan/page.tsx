"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CheckCircle2, ChevronRight, ShieldCheck } from "lucide-react"

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: "$49",
    period: "/month",
    description: "For small field teams getting started.",
    features: ["Up to 10 Agents", "GPS Proximity Lock", "Offline Sync Vault", "Email Support"],
    highlighted: false,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "$199",
    period: "/month",
    description: "For scalable, secure corporate operations.",
    features: ["Unlimited Agents", "Live War Room Map", "Immutable Audit Logs", "Real-Time WebSockets", "Priority Support"],
    highlighted: true,
  },
  {
    id: "election",
    name: "Election Mode",
    price: "Custom",
    period: "",
    description: "Specialized zero-trust election deployment.",
    features: ["State/LGA/Ward/PU Hierarchy", "EC8A Capture", "Section 84 Certificates", "Dedicated Infrastructure"],
    highlighted: false,
  },
]

export default function SelectPlanPage() {
  const router = useRouter()
  const [selected, setSelected] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleContinue = async () => {
    if (!selected) return
    setLoading(true)

    try {
      const token = localStorage.getItem("vf_token")
      const res = await fetch("http://localhost:8000/api/v1/subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ plan: selected }),
      })

      if (res.ok) {
        router.push("/dashboard")
      } else {
        // Plan selected but payment not yet integrated — go to dashboard anyway
        router.push("/dashboard")
      }
    } catch {
      router.push("/dashboard")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center py-16 px-4">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="text-2xl font-bold tracking-tighter">
              Veri<span className="text-primary">Field</span>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm font-medium mb-6">
            <ShieldCheck className="w-4 h-4" />
            One more step — Select your plan
          </div>
          <h1 className="text-4xl font-bold mb-4">Choose the right plan for your operation</h1>
          <p className="text-muted-foreground text-lg">
            You can always upgrade or change your plan later. Your data and agents are always safe.
          </p>
        </div>

        {/* Plan Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {plans.map((plan) => (
            <button
              key={plan.id}
              onClick={() => setSelected(plan.id)}
              className={`text-left p-8 rounded-2xl border-2 transition-all duration-200 ${
                selected === plan.id
                  ? "border-primary bg-primary/5 shadow-[0_0_40px_rgba(99,102,241,0.2)]"
                  : plan.highlighted
                  ? "border-border bg-card hover:border-primary/40"
                  : "border-border bg-card hover:border-primary/40"
              }`}
            >
              {plan.highlighted && (
                <div className="inline-block mb-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold tracking-wide">
                  MOST POPULAR
                </div>
              )}
              <div className="flex items-start justify-between mb-1">
                <h3 className="text-xl font-bold">{plan.name}</h3>
                {selected === plan.id && (
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                )}
              </div>
              <div className="mb-2">
                <span className="text-3xl font-extrabold">{plan.price}</span>
                <span className="text-muted-foreground text-sm">{plan.period}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-5">{plan.description}</p>
              <ul className="space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </button>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-4">
          <Button
            onClick={handleContinue}
            disabled={!selected || loading}
            className="h-12 px-10 text-base bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 disabled:opacity-40"
          >
            {loading ? "Processing..." : "Continue to Dashboard"}
            {!loading && <ChevronRight className="ml-1 w-4 h-4" />}
          </Button>
          <button
            onClick={() => router.push("/dashboard")}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip for now — I&apos;ll choose later
          </button>
        </div>
      </div>
    </div>
  )
}
