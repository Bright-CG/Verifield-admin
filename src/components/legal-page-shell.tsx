import Link from "next/link"
import { BrandMark } from "@/components/brand-mark"

const LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/support", label: "Support" },
  { href: "/delete-account", label: "Account Deletion" },
]

export function LegalPageShell({
  title,
  updated,
  children,
}: {
  title: string
  updated: string
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-6">
          <BrandMark href="/" size="md" />
          <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">
            Sign in
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Legal</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: {updated}</p>
        <article className="prose prose-neutral dark:prose-invert mt-10 max-w-none space-y-6 text-sm leading-relaxed text-foreground/90 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mt-8 [&_h2]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1">
          {children}
        </article>
      </main>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-3xl flex-wrap gap-4 px-6 text-sm text-muted-foreground">
          {LEGAL_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-foreground">
              {link.label}
            </Link>
          ))}
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
        </div>
      </footer>
    </div>
  )
}

export { LEGAL_LINKS }
