"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { BrandProvider } from "@/components/brand-provider"

/** Client-only wrapper so next-themes can inject its script outside SSR/hydration issues. */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <BrandProvider>{children}</BrandProvider>
    </NextThemesProvider>
  )
}
