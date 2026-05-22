import { redirect } from "next/navigation"

export default function DiscrepancyRedirectPage() {
  redirect("/war-room?tab=discrepancy")
}
