"use client"

import { Providers } from "./providers"

/** Client boundary for theme + brand providers (SSR-safe). */
export function ClientProviders({ children }: { children: React.ReactNode }) {
  return <Providers>{children}</Providers>
}
