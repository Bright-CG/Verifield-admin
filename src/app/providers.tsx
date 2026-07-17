"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { BrandProvider } from "@/components/brand-provider"

/**
 * next-themes injects an inline <script> to prevent theme flash.
 * React 19 warns when that script is re-rendered on the client.
 * Keep a real script on the server; use a non-JS MIME type on the client remount.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const scriptProps =
    typeof window === "undefined"
      ? undefined
      : ({ type: "application/json" } as const)

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      scriptProps={scriptProps}
    >
      <BrandProvider>{children}</BrandProvider>
    </NextThemesProvider>
  )
}
