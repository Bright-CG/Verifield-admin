import type { Metadata } from "next"
import Link from "next/link"
import { LegalPageShell } from "@/components/legal-page-shell"

export const metadata: Metadata = {
  title: "Support | VeriField",
  description: "Contact VeriField support for help with the mobile app and admin dashboard.",
}

export default function SupportPage() {
  return (
    <LegalPageShell title="Support & Contact" updated="June 28, 2026">
      <p>
        Need help with VeriField? Use the channels below. For fastest resolution, field agents should contact
        their organisation administrator first.
      </p>

      <h2>Field agents (mobile app)</h2>
      <ul>
        <li>Login, device binding, or polling unit assignment — contact your organisation admin.</li>
        <li>Sync or upload errors — note the error message and time, then contact your admin or us.</li>
        <li>Account deletion — see{" "}
          <Link href="/delete-account" className="text-primary hover:underline">
            Account Deletion
          </Link>
          .
        </li>
      </ul>

      <h2>Organisation administrators</h2>
      <ul>
        <li>Staff provisioning, EC8A review, war room access — use the admin dashboard or email support.</li>
        <li>Technical incidents — include tenant name, user email, and steps to reproduce.</li>
      </ul>

      <h2>Email</h2>
      <ul>
        <li>
          General support:{" "}
          <a href="mailto:support@verifield.com.ng" className="text-primary hover:underline">
            support@verifield.com.ng
          </a>
        </li>
        <li>
          Privacy & data requests:{" "}
          <a href="mailto:privacy@verifield.com.ng" className="text-primary hover:underline">
            privacy@verifield.com.ng
          </a>
        </li>
        <li>
          Legal & contracts:{" "}
          <a href="mailto:legal@verifield.com.ng" className="text-primary hover:underline">
            legal@verifield.com.ng
          </a>
        </li>
      </ul>

      <h2>Platform URLs</h2>
      <ul>
        <li>
          Website & admin:{" "}
          <a href="https://verifield.com.ng" className="text-primary hover:underline">
            https://verifield.com.ng
          </a>
        </li>
        <li>
          API:{" "}
          <a href="https://api.verifield.com.ng" className="text-primary hover:underline">
            https://api.verifield.com.ng
          </a>
        </li>
      </ul>

      <h2>Response times</h2>
      <p>
        We aim to respond to support requests within 2 business days. Critical production outages are prioritised.
      </p>
    </LegalPageShell>
  )
}
