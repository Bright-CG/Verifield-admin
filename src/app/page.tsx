import type { Metadata } from "next"
import Link from "next/link"
import {
  Camera,
  MapPin,
  Fingerprint,
  Lock,
  ShieldCheck,
  Vote,
  Building2,
  CheckCircle2,
} from "lucide-react"
import { FadeIn, HeroGlow } from "@/components/fade-in"
import { MarketingHeader, MarketingFooter } from "@/components/marketing-chrome"
import { AppStoreBadge, GooglePlayBadge } from "@/components/store-badges"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "VeriField — Zero-Trust Field Verification for Elections & Teams",
  description:
    "Court-admissible field verification for African elections and corporate field operations. Live camera capture, GPS lock, SHA-256 receipts, and immutable ledgers.",
}

const trustChips = [
  "SHA-256 Cryptography",
  "20-Metre GPS Lock",
  "Section 84 Compliant",
  "Offline-First",
]

const features = [
  {
    title: "Live-Only Camera & Watermarking",
    description:
      "No gallery uploads allowed. Our custom camera forces live capture, instantly watermarking the image bytes with unalterable GPS coordinates, timestamps, and location IDs.",
    icon: Camera,
    large: true,
  },
  {
    title: "20-Metre GPS Proximity Lock",
    description:
      "Using precise geolocation APIs, the system mathematically rejects any submission if the agent is not physically standing at their assigned polling unit or client shop.",
    icon: MapPin,
    large: false,
  },
  {
    title: "Hardware-Bound Identity",
    description:
      "Play Integrity and Apple DeviceCheck block emulators, rooted phones, and cloned apps. One agent, one verified device.",
    icon: Fingerprint,
    large: false,
  },
  {
    title: "Immutable Database Triggers",
    description:
      "Once a record hits our ledger, backend SQL triggers permanently block any future UPDATE or DELETE commands. Even an admin cannot alter the past.",
    icon: Lock,
    large: false,
  },
]

const steps = [
  {
    step: "01",
    title: "Capture",
    description:
      "Agent takes a live photo. The app burns the GPS and timestamp into the image.",
  },
  {
    step: "02",
    title: "Sign & Seal",
    description:
      "A SHA-256 hash is generated and signed with the device's hardware-backed private key.",
  },
  {
    step: "03",
    title: "API Validation",
    description:
      "The backend verifies the cryptographic signature and runs the 20-metre proximity check.",
  },
  {
    step: "04",
    title: "Immutable Ledger",
    description:
      "The record is written to the append-only database, generating a court-ready Section 84 Evidence Certificate.",
  },
]

const transparency = [
  {
    title: "What is a SHA-256 hash?",
    body: "A unique fingerprint for your data. Change one pixel or one GPS digit and the fingerprint changes instantly. Our servers reject anything that no longer matches.",
  },
  {
    title: "Why can't results be edited?",
    body: "Database triggers fire before any UPDATE or DELETE. Even with full database access, the command fails. Historical evidence stays frozen.",
  },
  {
    title: "What is the hash chain?",
    body: "Each record includes a hash of the previous one. Tamper with record #50 and every later link breaks — auditors can verify the full chain in seconds.",
  },
]

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <MarketingHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden px-6 pb-24 pt-20 md:pb-32 md:pt-28">
          <HeroGlow />
          <div className="relative mx-auto max-w-4xl text-center">
            <FadeIn>
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-sm">
                <ShieldCheck className="h-4 w-4" />
                Court-Admissible Field Verification Engine
              </div>
            </FadeIn>

            <FadeIn delay={80}>
              <h1 className="text-balance text-5xl font-bold tracking-tight md:text-7xl md:leading-[1.05]">
                Zero-Trust Proof of Action.{" "}
                <span className="text-primary">From the Field to the Court.</span>
              </h1>
            </FadeIn>

            <FadeIn delay={160}>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
                Whether protecting an election polling unit from rigging or verifying a remote
                sales visit, VeriField generates mathematically tamper-proof receipts. Anchored to
                hardware, signed by cryptography, and sealed permanently.
              </p>
            </FadeIn>

            <FadeIn delay={240}>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                <AppStoreBadge />
                <GooglePlayBadge />
              </div>
            </FadeIn>

            <FadeIn delay={320}>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                {trustChips.map((chip) => (
                  <span
                    key={chip}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-secondary" />
                    {chip}
                  </span>
                ))}
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Audience bento */}
        <section className="border-y border-border/60 bg-muted/30 px-6 py-20">
          <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-2">
            <FadeIn>
              <div
                id="election"
                className="group glass-card relative overflow-hidden rounded-lg p-8 transition-colors hover:border-primary/50"
              >
                <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                  <Vote className="h-6 w-6" />
                </div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                  Primary · Election Integrity Mode
                </p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight">
                  For Democratic Transparency
                </h2>
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  Secure EC8A result sheets at the ward level. Auto-detect discrepancies. Built to
                  expose rigging with hash-chain audit trails.
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={120}>
              <div
                id="corporate"
                className="group glass-card relative overflow-hidden rounded-lg p-8 transition-colors hover:border-secondary/50"
              >
                <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-secondary/15 blur-3xl" />
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10 text-secondary transition-colors group-hover:bg-secondary/20">
                  <Building2 className="h-6 w-6" />
                </div>
                <p className="text-xs font-semibold uppercase tracking-wider text-secondary">
                  Secondary · Corporate Accountability
                </p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight">
                  For Distributed Teams
                </h2>
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  Stop GPS spoofing and fake reports. Ensure sales reps and field workers are exactly
                  where they claim to be, when they claim to be there.
                </p>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Features bento */}
        <section id="features" className="px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <FadeIn>
              <div className="mx-auto max-w-3xl text-center">
                <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
                  Engineered to be Mathematically Stubborn.
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  We don&apos;t rely on trust. Every layer of VeriField—from the camera lens to the
                  database ledger—makes data tampering impossible.
                </p>
              </div>
            </FadeIn>

            <div className="mt-14 grid gap-4 md:grid-cols-3">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <FadeIn
                    key={feature.title}
                    delay={index * 90}
                    className={cn(feature.large && "md:col-span-2 md:row-span-2")}
                  >
                    <div
                      className={cn(
                        "group glass-card flex h-full flex-col rounded-lg p-6 transition-all duration-300 hover:border-primary/45 hover:shadow-glow",
                        feature.large && "md:p-8"
                      )}
                    >
                      <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3
                        className={cn(
                          "font-bold tracking-tight",
                          feature.large ? "text-2xl md:text-3xl" : "text-lg"
                        )}
                      >
                        {feature.title}
                      </h3>
                      <p
                        className={cn(
                          "mt-3 leading-relaxed text-muted-foreground",
                          feature.large && "text-base md:text-lg"
                        )}
                      >
                        {feature.description}
                      </p>
                    </div>
                  </FadeIn>
                )
              })}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="border-y border-border/60 bg-muted/25 px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <FadeIn>
              <h2 className="text-center text-4xl font-bold tracking-tight md:text-5xl">
                A Four-Step Zero-Trust Pipeline.
              </h2>
            </FadeIn>

            <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {steps.map((item, index) => (
                <FadeIn key={item.step} delay={index * 100}>
                  <div className="glass-card relative h-full rounded-lg p-6">
                    <span className="text-4xl font-bold tracking-tighter text-primary/25">
                      {item.step}
                    </span>
                    <h3 className="mt-3 text-xl font-bold tracking-tight">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* Transparency */}
        <section id="transparency" className="px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <FadeIn>
              <div className="mx-auto max-w-3xl text-center">
                <h2 className="text-4xl font-bold tracking-tight">Transparency Portal</h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  The best security is security you can inspect. Here is how we protect evidence—in
                  plain English.
                </p>
              </div>
            </FadeIn>

            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {transparency.map((item, index) => (
                <FadeIn key={item.title} delay={index * 90}>
                  <div className="glass-card h-full rounded-lg p-6 transition-colors hover:border-primary/40">
                    <h3 className="text-lg font-semibold tracking-tight">{item.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="relative overflow-hidden px-6 pb-24">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-transparent to-secondary/5" />
          <FadeIn>
            <div className="glass-card mx-auto max-w-4xl rounded-lg px-8 py-14 text-center shadow-glow">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                Ready to make field evidence court-ready?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                Deploy VeriField for election integrity or corporate accountability. Talk to sales
                or download the field agent apps.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <AppStoreBadge />
                <GooglePlayBadge />
                <Link
                  href="/support"
                  className="inline-flex h-12 items-center rounded-lg border border-border bg-background px-5 text-sm font-semibold transition hover:border-primary/40"
                >
                  Contact Sales
                </Link>
              </div>
            </div>
          </FadeIn>
        </section>
      </main>

      <MarketingFooter />
    </div>
  )
}
