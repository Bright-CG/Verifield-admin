import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { BrandMark } from "@/components/brand-mark"
import { FadeIn, HeroGlow } from "@/components/fade-in"
import {
  ShieldCheck,
  MapPin,
  Fingerprint,
  Zap,
  Globe,
  Lock,
  Camera,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Building2,
  Vote,
  FileSignature,
  Scale,
  Wifi,
} from "lucide-react"

const features = [
  {
    icon: Fingerprint,
    title: "Hardware-Bound Identity",
    description:
      "Every agent is cryptographically bound to a single device. Play Integrity API and Apple DeviceCheck block emulators, rooted phones, and cloned apps.",
  },
  {
    icon: Camera,
    title: "Live-Only Camera Capture",
    description:
      "Agents cannot upload from their gallery. A custom in-app camera watermarks every photo with GPS coordinates, PU number, and timestamp—making each photo a piece of evidence.",
  },
  {
    icon: MapPin,
    title: "20-Metre GPS Proximity Lock",
    description:
      "Using MySQL ST_Distance_Sphere, the backend mathematically rejects any submission from an agent who is not physically at their assigned unit. No spoofing possible.",
  },
  {
    icon: Lock,
    title: "Immutable Database Triggers",
    description:
      "The verifications table has a BEFORE UPDATE / BEFORE DELETE SQL trigger. Even a DBA with full root access cannot change a single digit once it is written.",
  },
  {
    icon: FileSignature,
    title: "Cryptographic SHA-256 Receipts",
    description:
      "Every report is signed with the device's private key (stored in Android Keystore / iOS Keychain). The math proves the data has not been altered by even one bit since capture.",
  },
  {
    icon: Wifi,
    title: "Offline-First Sync Vault",
    description:
      "Agents work with no internet. Reports are sealed locally and auto-synced the moment connectivity returns. A background WorkManager service handles retries with exponential backoff.",
  },
  {
    icon: BarChart3,
    title: "Real-Time War Room Dashboard",
    description:
      "The admin web dashboard receives live updates via Laravel Reverb WebSockets. Map dots pulse the instant a field report is verified—no page refresh needed.",
  },
  {
    icon: Scale,
    title: "Section 84 Legal Compliance",
    description:
      "Generate a court-ready Evidence Certificate for any unit with one click. Includes hardware attestation logs, SHA-256 checksums, and a hash chain audit trail.",
  },
]

const howItWorks = [
  {
    step: "01",
    title: "Capture",
    description:
      "The field agent opens the app, selects their assigned unit, and takes a live photo. The app overlays GPS, timestamp, and unit number directly onto the image bytes.",
  },
  {
    step: "02",
    title: "Sign & Seal",
    description:
      "The app generates a SHA-256 hash of the image + coordinates + timestamp and signs it with the device's hardware-backed private key. The record is sealed.",
  },
  {
    step: "03",
    title: "Sentinel API Validates",
    description:
      "The Laravel backend verifies the cryptographic signature, runs the 20-metre proximity check, and confirms hardware attestation before writing to the database.",
  },
  {
    step: "04",
    title: "Immutable Ledger",
    description:
      "The validated record is written to the append-only verifications table. The database trigger immediately blocks any future UPDATE or DELETE—permanently.",
  },
]

const plans = [
  {
    name: "Starter",
    price: "$49",
    period: "/month",
    description: "For small field teams getting started.",
    features: [
      "Up to 10 Agents",
      "GPS Proximity Lock",
      "Offline Sync Vault",
      "Basic Dashboard",
      "Email Support",
    ],
    cta: "Start Free Trial",
    highlighted: false,
  },
  {
    name: "Enterprise",
    price: "$199",
    period: "/month",
    description: "For scalable, secure corporate operations.",
    features: [
      "Unlimited Agents",
      "Live War Room Map",
      "Immutable Audit Logs",
      "Fraud Detection Engine",
      "Real-Time WebSockets",
      "Priority Support",
    ],
    cta: "Get Enterprise",
    highlighted: true,
  },
  {
    name: "Election Mode",
    price: "Custom",
    period: "",
    description: "Specialized zero-trust election deployment.",
    features: [
      "State / LGA / Ward / PU Hierarchy",
      "EC8A Result Capture",
      "Section 84 Certificate Export",
      "Hash-Chain Audit Trail",
      "Dedicated Infrastructure",
      "SLA-backed Uptime",
    ],
    cta: "Contact Us",
    highlighted: false,
  },
]

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* ─── HEADER ─── */}
      <header className="h-16 flex items-center justify-between px-6 md:px-12 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <BrandMark href="/" size="lg" nameClassName="hidden sm:inline" />
        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
          <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
          <a href="#transparency" className="hover:text-foreground transition-colors">Transparency</a>
        </nav>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/login">
            <Button variant="ghost" size="sm">Sign In</Button>
          </Link>
          <Link href="/signup">
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* ─── HERO ─── */}
        <section className="relative py-28 md:py-40 px-6 text-center overflow-hidden">
          <HeroGlow />

          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm font-medium mb-8">
              <ShieldCheck className="w-4 h-4" />
              Court-Admissible Field Verification Engine
            </div>
          </FadeIn>

          <FadeIn delay={100}>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight max-w-5xl mx-auto leading-tight mb-6">
              Zero-Trust Proof of Action.{" "}
              <span className="text-primary">From Field to Court.</span>
            </h1>
          </FadeIn>

          <FadeIn delay={200}>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Whether your agent is verifying a pharmacy stock in Lagos or recording a polling result in a remote LGA, VeriField generates a mathematically tamper-proof receipt—anchored to hardware, signed by cryptography, and sealed by the database itself.
            </p>
          </FadeIn>

          <FadeIn delay={300}>
            <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="h-12 px-8 text-base bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25">
                Start Free Trial <ChevronRight className="ml-1 w-4 h-4" />
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button size="lg" variant="outline" className="h-12 px-8 text-base border-border">
                See How It Works
              </Button>
            </Link>
          </div>

          {/* Trust badges */}
          <div className="mt-16 flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
            {["SHA-256 Signed", "Hardware Attested", "Section 84 Compliant", "Offline-First"].map((badge) => (
              <div key={badge} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                {badge}
              </div>
            ))}
          </div>
          </FadeIn>
        </section>

        {/* ─── DUAL MODE BANNER ─── */}
        <section className="py-16 px-6 border-y border-border bg-muted/30">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
            <div className="p-8 rounded-2xl border border-border bg-card flex items-start gap-5">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Vote className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2">Election Mode</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  State → LGA → Ward → Polling Unit hierarchy. EC8A Result Sheet capture. Automatic discrepancy detection. Section 84 Evidence Certificates. Built to expose rigging, not enable it.
                </p>
              </div>
            </div>
            <div className="p-8 rounded-2xl border border-border bg-card flex items-start gap-5">
              <div className="h-12 w-12 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
                <Building2 className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2">Corporate Mode</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Territory → Store hierarchy. Field check-in with invoice capture. GPS-verified sales visits. Offline-first for remote locations. Trust your field data completely.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── FEATURES ─── */}
        <section id="features" className="py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <FadeIn>
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold mb-4">
                  Built to be <span className="text-primary">Mathematically Stubborn</span>
                </h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  Every layer—hardware, app, API, and database—is designed to make data tampering not just difficult, but mathematically impossible.
                </p>
              </div>
            </FadeIn>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, i) => (
                <FadeIn key={feature.title} delay={i * 60}>
                  <div className="p-6 rounded-2xl border border-border bg-card hover:border-primary/40 transition-colors group h-full">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <feature.icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ─── HOW IT WORKS ─── */}
        <section id="how-it-works" className="py-24 px-6 bg-muted/20 border-y border-border">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">How VeriField Works</h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                A four-step zero-trust pipeline from the field agent's camera to a court-admissible record.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {howItWorks.map((step, i) => (
                <div key={step.step} className="relative">
                  {i < howItWorks.length - 1 && (
                    <div className="hidden lg:block absolute top-6 left-full w-full h-px bg-border -translate-x-1/2 z-0" />
                  )}
                  <div className="relative z-10">
                    <div className="text-4xl font-black text-primary/20 mb-3">{step.step}</div>
                    <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── TRANSPARENCY PORTAL ─── */}
        <section id="transparency" className="py-24 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Globe className="w-7 h-7 text-primary" />
            </div>
            <h2 className="text-4xl font-bold mb-4">Transparency Portal</h2>
            <p className="text-muted-foreground text-lg mb-12 max-w-2xl mx-auto">
              We believe that the best security is security you can inspect. Here is exactly how we protect your data—in plain English.
            </p>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              {[
                {
                  title: "What is a SHA-256 hash?",
                  body: "Think of it as a unique fingerprint for your data. If even one pixel of the photo or one digit of the GPS coordinate is changed, the fingerprint instantly changes. Our server compares fingerprints and rejects anything that doesn't match.",
                },
                {
                  title: "Why can't you edit a result?",
                  body: "The database has a built-in alarm that triggers BEFORE any UPDATE or DELETE command. Even if a hacker got full database access, the alarm fires and the command fails. The data is frozen permanently.",
                },
                {
                  title: "What is the hash chain?",
                  body: "Each new record contains a hash of the previous record (like links in a chain). If anyone secretly changed record #50, the hashes for records #51 onwards instantly break. An independent auditor can verify the entire chain in seconds.",
                },
              ].map((item) => (
                <div key={item.title} className="p-6 rounded-2xl border border-border bg-card">
                  <h3 className="font-semibold mb-3 text-sm">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── PRICING ─── */}
        <section id="pricing" className="py-24 px-6 bg-muted/20 border-y border-border">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Transparent Pricing</h2>
              <p className="text-muted-foreground text-lg">
                Start free. Scale when you need to. Subscriptions are fully controlled by the Super Admin.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`p-8 rounded-2xl border flex flex-col ${
                    plan.highlighted
                      ? "border-primary bg-card shadow-[0_0_60px_rgba(99,102,241,0.15)] relative"
                      : "border-border bg-card"
                  }`}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-bold tracking-wide">
                      MOST POPULAR
                    </div>
                  )}
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <div className="mt-4 mb-2">
                    <span className="text-4xl font-extrabold">{plan.price}</span>
                    <span className="text-muted-foreground text-sm">{plan.period}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link href="/signup">
                    <Button
                      className={`w-full ${
                        plan.highlighted
                          ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25"
                          : "bg-accent text-foreground hover:bg-accent/80"
                      }`}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CTA BANNER ─── */}
        <section className="py-24 px-6 text-center">
          <div className="max-w-2xl mx-auto">
            <Zap className="w-10 h-10 text-primary mx-auto mb-6" />
            <h2 className="text-4xl font-bold mb-4">
              Ready to make your field data court-ready?
            </h2>
            <p className="text-muted-foreground text-lg mb-10">
              Join teams already using VeriField to secure their operations. No credit card required to start.
            </p>
            <Link href="/signup">
              <Button size="lg" className="h-12 px-10 text-base bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/25">
                Create Your Free Account <ChevronRight className="ml-1 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-border py-10 px-6 md:px-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-xl font-bold tracking-tighter">
            Veri<span className="text-primary">Field</span>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
            <a href="#transparency" className="hover:text-foreground transition-colors">Transparency</a>
            <Link href="/login" className="hover:text-foreground transition-colors">Sign In</Link>
          </div>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} VeriField. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
