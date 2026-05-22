"use client"

import React, { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Map, Users, FileText, LogOut, UserCheck, Upload, Settings, ShieldAlert } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"
import { apiUrl } from "@/lib/api-base"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/war-room", label: "War Room", icon: Map },
  { href: "/war-room?tab=discrepancy", label: "Discrepancy", icon: ShieldAlert, tenantScoped: true },
  { href: "/tenants", label: "Tenants & Config", icon: Users, superOnly: true },
  { href: "/staff", label: "Staff Management", icon: UserCheck, tenantScoped: true, tenantLabel: true },
  { href: "/import", label: "Bulk Import", icon: Upload, tenantScoped: true },
  { href: "/audit-log", label: "Audit Trail", icon: FileText, tenantScoped: true },
  { href: "/settings", label: "System Settings", icon: Settings, superOnly: true },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [role, setRole] = useState("")
  const [tenantId, setTenantId] = useState("")
  const [tenantType, setTenantType] = useState<"election" | "corporate" | "">("")

  useEffect(() => {
    setMounted(true)
    const currentRole = localStorage.getItem("vf_role") ?? ""
    const currentTenantId = localStorage.getItem("vf_tenant_id") ?? ""
    setRole(currentRole)
    setTenantId(currentTenantId)

    const token = localStorage.getItem("vf_token") ?? ""
    if (!token) return
    fetch(apiUrl("/api/v1/me"), {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (r) => {
        if (!r.ok) return null
        try {
          return await r.json()
        } catch {
          return null
        }
      })
      .then((json) => {
        const user = json?.user ?? json?.data?.user
        const type = user?.tenant?.type
        if (type === "election" || type === "corporate") {
          setTenantType(type)
        }
      })
      .catch(() => {})
  }, [])

  const badgeLabel = role === "super_admin" ? "SUPER" : tenantId ? "ORG" : "ADMIN"
  const badgeNote =
    role === "super_admin" ? "Platform Operator" : "Organisation Console"

  const displayName =
    role === "super_admin" ? "Super Admin" : tenantId ? "Tenant Admin" : "Administrator"

  const resolvedNavItems = useMemo(() => navItems.map((item) => {
    if (!item.tenantLabel) return item
    if (tenantType === "election") {
      return { ...item, label: "Agent Management" }
    }
    return { ...item, label: "Staff Management" }
  }), [tenantType])

  return (
    <div className="flex h-screen w-full bg-background text-foreground">

      <aside className="w-64 flex flex-col border-r border-border bg-card">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <span className="text-xl font-bold tracking-tighter">
            Veri<span className="text-primary">Field</span>
          </span>
          <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
            {mounted ? badgeLabel : "ADMIN"}
          </span>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {resolvedNavItems.map((item) => {
            const active =
              item.href.startsWith("/war-room")
                ? pathname === "/war-room" || pathname.startsWith("/war-room/")
                : pathname === item.href || pathname.startsWith(item.href + "/")

            if (item.superOnly && role !== "super_admin") return null
            if (item.tenantScoped && role === "super_admin") return null
            if (item.tenantScoped && !tenantId) return null

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                  active
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-border space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-xs font-bold text-white shadow-lg">
                {mounted ? (role === "super_admin" ? "SA" : "TA") : "AD"}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium truncate">{displayName}</span>
                <span className="text-xs text-muted-foreground truncate">{badgeNote}</span>
              </div>
            </div>
            <ThemeToggle />
          </div>

          <button
            onClick={() => {
              localStorage.removeItem("vf_token")
              localStorage.removeItem("vf_role")
              localStorage.removeItem("vf_tenant_id")
              window.location.href = "/login"
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 flex items-center px-8 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <h1 className="text-lg font-semibold">
            {navItems.find((n) =>
              n.href.startsWith("/war-room")
                ? pathname.startsWith("/war-room")
                : pathname.startsWith(n.href.split("?")[0])
            )?.label ?? "VeriField Admin"}
          </h1>
        </header>

        <div className="flex-1 overflow-auto p-8 bg-background">
          {children}
        </div>
      </main>
    </div>
  )
}
