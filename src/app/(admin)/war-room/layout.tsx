import { Suspense } from "react"

export default function WarRoomLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<div className="p-8 text-muted-foreground">Loading war room…</div>}>{children}</Suspense>
}
