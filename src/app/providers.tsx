"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

/** Client-only wrapper so next-themes can inject its script outside SSR/hydration issues. */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  )
}
