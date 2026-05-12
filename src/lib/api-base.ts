/**
 * Laravel API base URL (no trailing slash).
 * Production: set NEXT_PUBLIC_API_URL=https://api.verifield.com.ng
 * Local: defaults to http://127.0.0.1:8000
 */
export function getApiBase(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000"
  return raw.replace(/\/$/, "")
}

/** Full URL for an API path (path must start with `/`, e.g. `/api/v1/login`). */
export function apiUrl(path: string): string {
  const base = getApiBase()
  const p = path.startsWith("/") ? path : `/${path}`
  return `${base}${p}`
}

/** Laravel Reverb / Echo (map page). Override with NEXT_PUBLIC_REVERB_* in production. */
export function getReverbEchoConfig(): {
  key: string
  wsHost: string
  wsPort: number
  wssPort: number
  forceTLS: boolean
  enabledTransports: ("ws" | "wss")[]
} {
  const key = process.env.NEXT_PUBLIC_REVERB_APP_KEY ?? "verifield-key-local"
  let wsHost = process.env.NEXT_PUBLIC_REVERB_HOST?.trim()
  if (!wsHost) {
    try {
      wsHost = new URL(getApiBase()).hostname
    } catch {
      wsHost = "127.0.0.1"
    }
  }
  const forceTLS =
    process.env.NEXT_PUBLIC_REVERB_FORCE_TLS === "1" ||
    process.env.NEXT_PUBLIC_REVERB_FORCE_TLS === "true"
  const wsPort = Number(process.env.NEXT_PUBLIC_REVERB_WS_PORT ?? (forceTLS ? 443 : 8080))
  const wssPort = Number(process.env.NEXT_PUBLIC_REVERB_WSS_PORT ?? wsPort)
  return {
    key,
    wsHost,
    wsPort,
    wssPort,
    forceTLS,
    enabledTransports: forceTLS ? ["ws", "wss"] : ["ws"],
  }
}
