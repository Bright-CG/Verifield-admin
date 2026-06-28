/** VeriField logo blue — default when API config is unavailable. */
export const DEFAULT_BRAND_COLOR = "#0049cc"

export function hexToHslComponents(hex: string): { h: number; s: number; l: number } | null {
  const normalized = hex.replace("#", "").trim()
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return null

  const r = parseInt(normalized.slice(0, 2), 16) / 255
  const g = parseInt(normalized.slice(2, 4), 16) / 255
  const b = parseInt(normalized.slice(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  let h = 0
  let s = 0

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      default:
        h = ((r - g) / d + 4) / 6
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  }
}

export function hexToHslCss(hex: string): string | null {
  const parts = hexToHslComponents(hex)
  if (!parts) return null
  return `${parts.h} ${parts.s}% ${parts.l}%`
}

export function applyBrandColor(hex: string): void {
  if (typeof document === "undefined") return
  const primary = hexToHslCss(hex)
  if (!primary) return

  const root = document.documentElement
  root.style.setProperty("--primary", primary)
  root.style.setProperty("--ring", primary)

  const parts = hexToHslComponents(hex)
  if (parts) {
    const secondaryL = Math.min(100, parts.l + 12)
    root.style.setProperty("--secondary", `${parts.h} ${parts.s}% ${secondaryL}%`)
  }
}

export function resolveLogoSrc(logoUrl?: string | null): string {
  const trimmed = logoUrl?.trim()
  return trimmed ? trimmed : "/verifield-logo.png"
}
