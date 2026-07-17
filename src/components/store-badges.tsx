import Link from "next/link"
import { APP_STORE_URL, PLAY_STORE_URL } from "@/lib/store-links"

/** Official-style App Store badge (black pill with Apple logo + dual-line copy). */
export function AppStoreBadge({
  href = APP_STORE_URL,
  className = "",
}: {
  href?: string
  className?: string
}) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Download on the App Store"
      className={`inline-flex h-12 items-center gap-2.5 rounded-lg bg-black px-3.5 text-white shadow-lg shadow-black/20 transition hover:opacity-90 dark:bg-white dark:text-black dark:shadow-white/10 ${className}`}
    >
      <svg viewBox="0 0 24 24" className="h-7 w-7 shrink-0" aria-hidden="true" fill="currentColor">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
      </svg>
      <span className="flex flex-col leading-none text-left">
        <span className="text-[9px] font-medium tracking-wide opacity-90">Download on the</span>
        <span className="text-[17px] font-semibold tracking-tight">App Store</span>
      </span>
    </Link>
  )
}

/** Official-style Google Play badge. */
export function GooglePlayBadge({
  href = PLAY_STORE_URL,
  className = "",
}: {
  href?: string
  className?: string
}) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Get it on Google Play"
      className={`inline-flex h-12 items-center gap-2.5 rounded-lg bg-black px-3.5 text-white shadow-lg shadow-black/20 transition hover:opacity-90 dark:bg-white dark:text-black dark:shadow-white/10 ${className}`}
    >
      <svg viewBox="0 0 24 24" className="h-7 w-7 shrink-0" aria-hidden="true">
        <path fill="#EA4335" d="M3.6 2.2 13.4 12 3.6 21.8c-.4-.3-.6-.8-.6-1.3V3.5c0-.5.2-1 .6-1.3z" />
        <path fill="#FBBC04" d="m13.4 12 2.7-2.7 4.6 2.6c.6.3.9.8.9 1.4s-.3 1.1-.9 1.4l-4.6 2.6L13.4 12z" />
        <path fill="#4285F4" d="M13.4 12 3.6 2.2c.3-.2.7-.2 1.1 0l11.4 6.5L13.4 12z" />
        <path fill="#34A853" d="M13.4 12 16.1 14.7 4.7 21.8c-.4.2-.8.2-1.1 0L13.4 12z" />
      </svg>
      <span className="flex flex-col leading-none text-left">
        <span className="text-[9px] font-medium tracking-wide opacity-90">GET IT ON</span>
        <span className="text-[17px] font-semibold tracking-tight">Google Play</span>
      </span>
    </Link>
  )
}
