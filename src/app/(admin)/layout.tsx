"use client"

import React, { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, Map, Users, FileText, LogOut, UserCheck, Upload, Settings,
  ShieldAlert, Menu, X,
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"
import { apiUrl } from "@/lib/api-base"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/war-room", label: "War Room", icon: Map },
  { href: "/war-room?tab=submissions", label: "Submissions", icon: ShieldAlert, tenantScoped: true },
  { href: "/tenants", label: "Tenants & Config", icon: Users, superOnly: true },
  { href: "/staff", label: "Staff Management", icon: UserCheck, tenantScoped: true, tenantLabel: true },
  { href: "/import", label: "Bulk Import", icon: Upload, tenantScoped: true },
  { href: "/audit-log", label: "Audit Trail", icon: FileText, tenantScoped: true },
  { href: "/settings", label: "System Settings", icon: Settings, superOnly: true },
]

function SidebarNav({
  role,
  tenantId,
  tenantType,
  pathname,
  onNavigate,
}: {
  role: string
  tenantId: string
  tenantType: "election" | "corporate" | ""
  pathname: string
  onNavigate?: () => void
}) {
  const resolvedNavItems = useMemo(() => navItems.map((item) => {
    if (!item.tenantLabel) return item
    if (tenantType === "election") {
      return { ...item, label: "Agent Management" }
    }
    return { ...item, label: "Staff Management" }
  }), [tenantType])

  return (
    <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
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
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
              active
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <item.icon className="w-4 h-4 shrink-0" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
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

  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  const badgeLabel = role === "super_admin" ? "SUPER" : tenantId ? "ORG" : "ADMIN"
  const badgeNote =
    role === "super_admin" ? "Platform Operator" : "Organisation Console"

  const displayName =
    role === "super_admin" ? "Super Admin" : tenantId ? "Tenant Admin" : "Administrator"

  const pageTitle =
    navItems.find((n) =>
      n.href.startsWith("/war-room")
        ? pathname.startsWith("/war-room")
        : pathname.startsWith(n.href.split("?")[0])
    )?.label ?? "VeriField Admin"

  const closeSidebar = () => setSidebarOpen(false)

  const sidebarContent = (
    <>
      <div className="h-16 flex items-center gap-2 px-6 border-b border-border shrink-0">
        <img
          src="/verifield-logo.png"
          alt="VeriField"
          className="h-8 w-8 rounded-md object-cover shrink-0"
        />
        <span className="text-xl font-bold tracking-tighter truncate">
          Veri<span className="text-primary">Field</span>
        </span>
        <span className="ml-auto md:ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary shrink-0">
          {mounted ? badgeLabel : "ADMIN"}
        </span>
        <button
          type="button"
          className="md:hidden p-1 rounded-md text-muted-foreground hover:text-foreground"
          onClick={closeSidebar}
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <SidebarNav
        role={role}
        tenantId={tenantId}
        tenantType={tenantType}
        pathname={pathname}
        onNavigate={closeSidebar}
      />

      <div className="p-4 border-t border-border space-y-3 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-xs font-bold text-white shadow-lg shrink-0">
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
    </>
  )

  return (
    <div className="flex h-screen w-full bg-background text-foreground">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            onClick={closeSidebar}
            aria-label="Close menu overlay"
          />
          <aside className="relative flex h-full w-[min(85vw,18rem)] flex-col border-r border-border bg-card shadow-xl">
            {sidebarContent}
          </aside>
        </div>
      )}

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 flex items-center gap-3 px-4 md:px-8 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <button
            type="button"
            className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold truncate">{pageTitle}</h1>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8 bg-background">
          {children}
        </div>
      </main>
    </div>
  )
}
