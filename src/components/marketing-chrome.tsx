"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { BrandMark } from "@/components/brand-mark"
import { cn } from "@/lib/utils"

const NAV = [
  { href: "/#election", label: "Election Integrity" },
  { href: "/#corporate", label: "Corporate Verification" },
  { href: "/#transparency", label: "Transparency" },
]

export function MarketingHeader() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = prev
    }
  }, [open])

  const close = () => setOpen(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <BrandMark href="/" size="lg" nameClassName="hidden sm:inline" />

        <nav className="hidden items-center gap-7 text-sm text-muted-foreground lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
          <Link href="/privacy" className="transition-colors hover:text-foreground">
            Privacy
          </Link>
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <ThemeToggle />

          <Link href="/login" className="hidden lg:inline-flex">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
          </Link>
          <Link href="/support" className="hidden lg:inline-flex">
            <Button variant="outline" size="sm">
              Contact Sales
            </Button>
          </Link>
          <Link href="/signup" className="hidden lg:inline-flex">
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Get Started
            </Button>
          </Link>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu panel */}
      <div
        id="mobile-nav"
        className={cn(
          "lg:hidden overflow-hidden border-t border-border/60 bg-background/95 backdrop-blur-xl transition-[max-height,opacity] duration-300 ease-out",
          open ? "max-h-[85vh] opacity-100" : "max-h-0 opacity-0 border-t-0"
        )}
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4 sm:px-6">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={close}
              className="rounded-lg px-3 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/privacy"
            onClick={close}
            className="rounded-lg px-3 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Privacy Policy
          </Link>
          <Link
            href="/support"
            onClick={close}
            className="rounded-lg px-3 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Contact Sales
          </Link>

          <div className="mt-3 space-y-2 border-t border-border/70 pt-4">
            <Link href="/signup" onClick={close} className="block">
              <Button className="h-11 w-full bg-primary text-primary-foreground hover:bg-primary/90">
                Get Started
              </Button>
            </Link>
            <Link href="/login" onClick={close} className="block">
              <Button variant="outline" className="h-11 w-full">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Dim backdrop when open */}
      {open && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 top-16 z-[-1] bg-black/30 lg:hidden"
          onClick={close}
        />
      )}
    </header>
  )
}

export function MarketingFooter() {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <BrandMark href="/" size="md" />
          <p className="max-w-sm text-sm text-muted-foreground">
            Zero-trust field verification for African elections and distributed teams.
            Mathematically sealed. Court-ready.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
          <div className="space-y-2">
            <p className="font-semibold text-foreground">Product</p>
            <Link href="/#election" className="block text-muted-foreground hover:text-foreground">
              Election Integrity
            </Link>
            <Link href="/#corporate" className="block text-muted-foreground hover:text-foreground">
              Corporate Verification
            </Link>
            <Link href="/#how-it-works" className="block text-muted-foreground hover:text-foreground">
              How It Works
            </Link>
          </div>
          <div className="space-y-2">
            <p className="font-semibold text-foreground">Legal</p>
            <Link href="/privacy" className="block text-muted-foreground hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="/terms" className="block text-muted-foreground hover:text-foreground">
              Terms of Service
            </Link>
            <Link href="/delete-account" className="block text-muted-foreground hover:text-foreground">
              Account Deletion
            </Link>
          </div>
          <div className="space-y-2">
            <p className="font-semibold text-foreground">Company</p>
            <Link href="/support" className="block text-muted-foreground hover:text-foreground">
              Support
            </Link>
            <Link href="/signup" className="block text-muted-foreground hover:text-foreground">
              Get Started
            </Link>
            <Link href="/login" className="block text-muted-foreground hover:text-foreground">
              Sign In
            </Link>
            <Link href="/support" className="block text-muted-foreground hover:text-foreground">
              Contact Sales
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-border/70 py-6 text-center text-xs text-muted-foreground">
        © {year} VeriField. All rights reserved.
      </div>
    </footer>
  )
}
