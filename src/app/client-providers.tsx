"use client"

import dynamic from "next/dynamic"

const ThemeProviders = dynamic(
  () => import("./providers").then((m) => m.Providers),
  { ssr: false }
)

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return <ThemeProviders>{children}</ThemeProviders>
}
