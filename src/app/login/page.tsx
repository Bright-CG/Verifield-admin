"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { apiUrl } from "@/lib/api-base"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [otp, setOtp] = useState("")
  const [mfaUserId, setMfaUserId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const finishLogin = (data: { token: string; user?: { role?: string; tenant_id?: string | null } }) => {
    localStorage.setItem("vf_token", data.token)
    if (data.user?.role) localStorage.setItem("vf_role", data.user.role)
    if (data.user?.tenant_id) localStorage.setItem("vf_tenant_id", data.user.tenant_id)
    else localStorage.removeItem("vf_tenant_id")
    router.push("/dashboard")
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch(apiUrl("/api/v1/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (res.ok && data.requires_mfa) {
        setMfaUserId(data.mfa_user_id)
        setError(data.otp_delivery_failed
          ? "Could not send verification email. Check server mail settings."
          : "")
        return
      }

      if (res.ok && data.token) {
        if (data.requires_email_verification) {
          setError("Your email is not verified yet. Please check your inbox and verify before continuing.")
          return
        }
        finishLogin(data)
      } else {
        setError(data.message || "Invalid credentials. Please try again.")
      }
    } catch {
      setError("Could not connect to the server. Is the Laravel backend running?")
    } finally {
      setLoading(false)
    }
  }

  const handleMfaVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!mfaUserId) return
    setLoading(true)
    setError("")

    try {
      const res = await fetch(apiUrl("/api/v1/admin/mfa/verify"), {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ mfa_user_id: mfaUserId, otp_code: otp }),
      })
      const data = await res.json()
      if (res.ok && data.token) {
        finishLogin(data)
      } else {
        setError(data.message || "Invalid verification code.")
      }
    } catch {
      setError("Could not reach the server.")
    } finally {
      setLoading(false)
    }
  }

  const handleMfaResend = async () => {
    if (!mfaUserId) return
    setError("")
    try {
      const res = await fetch(apiUrl("/api/v1/admin/mfa/resend"), {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ mfa_user_id: mfaUserId }),
      })
      const data = await res.json()
      setError(res.ok ? "" : data.message || "Could not resend code.")
      if (res.ok) setError("A new code was sent to your email.")
    } catch {
      setError("Could not reach the server.")
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="h-16 flex items-center justify-between px-8 border-b border-border">
        <Link href="/" className="flex items-center gap-2">
          <img
            src="/verifield-logo.png"
            alt="VeriField"
            className="h-9 w-9 rounded-lg object-cover"
          />
          <span className="text-xl font-bold tracking-tighter">
            Veri<span className="text-primary">Field</span>
          </span>
        </Link>
        <ThemeToggle />
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-border bg-card shadow-xl">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <img
                src="/verifield-logo.png"
                alt="VeriField"
                className="h-16 w-16 rounded-xl object-cover shadow-md"
              />
            </div>
            <CardTitle className="text-2xl font-bold">
              {mfaUserId ? "Verify your identity" : "Welcome Back"}
            </CardTitle>
            <CardDescription>
              {mfaUserId
                ? "Super Admin accounts require email verification (MFA)."
                : "Sign in to your VeriField account"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {mfaUserId ? (
              <form onSubmit={handleMfaVerify} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">Verification code</Label>
                  <Input
                    id="otp"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    required
                    className="bg-background border-input tracking-widest text-center text-lg"
                  />
                </div>
                {error && (
                  <div className="text-sm text-muted-foreground bg-muted border border-border rounded-md px-3 py-2">
                    {error}
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={loading || otp.length !== 6}>
                  {loading ? "Verifying…" : "Complete sign in"}
                </Button>
                <Button type="button" variant="ghost" className="w-full" onClick={handleMfaResend}>
                  Resend code
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => { setMfaUserId(null); setOtp(""); setError("") }}
                >
                  Back to password
                </Button>
              </form>
            ) : (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-background border-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-background border-input"
                  />
                </div>

                {error && (
                  <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                  disabled={loading}
                >
                  {loading ? "Authenticating..." : "Sign In"}
                </Button>
              </form>
            )}

            {!mfaUserId && (
              <div className="mt-6 text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="text-primary font-medium hover:underline">
                  Sign up here
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
