"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { BrandMark } from "@/components/brand-mark"

const NAV = [
  { href: "/#election", label: "Election Integrity" },
  { href: "/#corporate", label: "Corporate Verification" },
  { href: "/#transparency", label: "Transparency" },
  { href: "/privacy", label: "Privacy" },
]

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-50 h-16 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-6">
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
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <Link href="/login" className="hidden sm:inline-flex">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
          </Link>
          <Link href="/support">
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Contact Sales
            </Button>
          </Link>
        </div>
      </div>
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
            <Link href="/login" className="block text-muted-foreground hover:text-foreground">
              Sign In
            </Link>
            <a
              href="mailto:support@verifield.com.ng"
              className="block text-muted-foreground hover:text-foreground"
            >
              Contact Sales
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-border/70 py-6 text-center text-xs text-muted-foreground">
        © {year} VeriField. All rights reserved.
      </div>
    </footer>
  )
}
