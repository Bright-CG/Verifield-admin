"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { apiUrl } from "@/lib/api-base"

function VerifyEmailContent() {
  const params = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("Verifying your email...")

  useEffect(() => {
    const id = params.get("id")
    const hash = params.get("hash")

    if (!id || !hash) {
      setStatus("error")
      setMessage("Verification link is invalid.")
      return
    }

    const run = async () => {
      try {
        const res = await fetch(apiUrl("/api/v1/email/verify"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ id, hash }),
        })

        const data = await res.json()
        if (!res.ok) {
          setStatus("error")
          setMessage(data.message ?? "Email verification failed.")
          return
        }

        setStatus("success")
        setMessage(data.message ?? "Email verified successfully.")
      } catch {
        setStatus("error")
        setMessage("Could not connect to the server.")
      }
    }

    void run()
  }, [params])

  return (
    <main className="min-h-screen bg-background text-foreground grid place-items-center p-6">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow">
        <h1 className="text-xl font-semibold mb-3">Email Verification</h1>
        <p
          className={
            status === "success"
              ? "text-emerald-500"
              : status === "error"
              ? "text-destructive"
              : "text-muted-foreground"
          }
        >
          {message}
        </p>
        <div className="mt-6">
          <Link href="/login" className="text-primary hover:underline">
            Continue to login
          </Link>
        </div>
      </div>
    </main>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-background text-foreground grid place-items-center p-6">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow">
            <h1 className="text-xl font-semibold mb-3">Email Verification</h1>
            <p className="text-muted-foreground">Preparing verification...</p>
          </div>
        </main>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  )
}

