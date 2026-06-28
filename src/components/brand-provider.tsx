"use client"

import React, { createContext, useContext, useEffect, useMemo, useState } from "react"
import { apiUrl } from "@/lib/api-base"
import {
  applyBrandColor,
  DEFAULT_BRAND_COLOR,
  resolveLogoSrc,
} from "@/lib/brand-color"

export type BrandConfig = {
  appName: string
  logoUrl: string | null
  primaryColor: string
  loaded: boolean
}

const BrandContext = createContext<BrandConfig>({
  appName: "VeriField",
  logoUrl: null,
  primaryColor: DEFAULT_BRAND_COLOR,
  loaded: false,
})

export function useBrand() {
  return useContext(BrandContext)
}

function upsertLink(rel: string, href: string, type?: string) {
  const selector = type
    ? `link[rel="${rel}"][type="${type}"]`
    : `link[rel="${rel}"]:not([type])`
  let link = document.querySelector<HTMLLinkElement>(selector)
  if (!link) {
    link = document.createElement("link")
    link.rel = rel
    if (type) link.type = type
    document.head.appendChild(link)
  }
  link.href = href
}

export function BrandProvider({ children }: { children: React.ReactNode }) {
  const [appName, setAppName] = useState("VeriField")
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [primaryColor, setPrimaryColor] = useState(DEFAULT_BRAND_COLOR)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const load = () => {
      fetch(apiUrl("/api/v1/config"), {
        headers: { Accept: "application/json" },
      })
        .then((r) => r.json())
        .then((json) => {
          if (json.data) {
            setAppName(typeof json.data.app_name === "string" ? json.data.app_name.trim() : "VeriField")
            setLogoUrl(typeof json.data.logo_url === "string" && json.data.logo_url.trim() ? json.data.logo_url.trim() : null)
            if (typeof json.data.primary_color === "string" && json.data.primary_color.trim()) {
              setPrimaryColor(json.data.primary_color.trim())
            }
          }
        })
        .catch(() => {})
        .finally(() => setLoaded(true))
    }

    load()
    window.addEventListener("vf-brand-updated", load)
    return () => window.removeEventListener("vf-brand-updated", load)
  }, [])

  useEffect(() => {
    applyBrandColor(primaryColor)
  }, [primaryColor])

  useEffect(() => {
    const logo = resolveLogoSrc(logoUrl)
    upsertLink("icon", logo, "image/png")
    upsertLink("apple-touch-icon", logo)
    document.title = `${appName} Admin`
  }, [appName, logoUrl])

  const value = useMemo(
    () => ({ appName, logoUrl, primaryColor, loaded }),
    [appName, logoUrl, primaryColor, loaded]
  )

  return <BrandContext.Provider value={value}>{children}</BrandContext.Provider>
}

export function BrandLogo({
  className,
  alt,
}: {
  className?: string
  alt?: string
}) {
  const { appName, logoUrl } = useBrand()
  return (
    <img
      src={resolveLogoSrc(logoUrl)}
      alt={alt ?? appName}
      className={className}
    />
  )
}
