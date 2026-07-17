import type { Metadata } from "next"
import Link from "next/link"
import { LegalPageShell } from "@/components/legal-page-shell"

export const metadata: Metadata = {
  title: "Support & Contact | VeriField",
  description:
    "Get help with VeriField. Field agents contact their organisation admin first; admins reach VeriField support with SLA expectations.",
}

const TOC = [
  { id: "agents", label: "Field agents" },
  { id: "admins", label: "Org admins" },
  { id: "emails", label: "Email contacts" },
  { id: "sla", label: "Response times" },
]

export default function SupportPage() {
  return (
    <LegalPageShell title="Support & Contact" updated="July 17, 2026" toc={TOC}>
      <p>
        VeriField support is organised so field operations stay fast and secure. Most agent issues
        are resolved fastest by your organisation administrator, who controls accounts, polling
        units / sites, and device resets.
      </p>

      <div className="not-prose grid gap-4 rounded-lg border border-border bg-muted/30 p-5 md:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Field agents</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Start with your organisation admin for login, device binding, assignments, and capture
            workflow questions.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-secondary">
            Organisation admins
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Email VeriField support for platform incidents, console access, billing/plan questions,
            and escalation.
          </p>
        </div>
      </div>

      <h2 id="agents">1. Field agents</h2>
      <ul>
        <li>
          <strong>Login, OTP, or wrong organisation:</strong> contact your organisation admin first.
        </li>
        <li>
          <strong>New phone / device binding:</strong> your admin must issue a device reset before
          you can bind a new handset.
        </li>
        <li>
          <strong>Polling unit or site missing:</strong> your admin assigns units in the console.
        </li>
        <li>
          <strong>Camera or location blocked:</strong> enable permissions in iOS/Android Settings →
          VeriField. If the system prompt never appears, reinstall the latest app build.
        </li>
        <li>
          <strong>Sync / offline vault stuck:</strong> confirm connectivity, force sync from the
          vault if available, then escalate to your admin with screenshots and timestamps.
        </li>
        <li>
          <strong>Account or data deletion:</strong> see{" "}
          <Link href="/delete-account">Account Deletion</Link>.
        </li>
      </ul>

      <h2 id="admins">2. Organisation administrators</h2>
      <ul>
        <li>Staff invites, roles, EC8A review, war room, imports, and certificates: use the console first.</li>
        <li>
          For platform incidents, email support with: organisation/tenant name, affected user email,
          device OS + app version, approximate UTC time, and steps to reproduce.
        </li>
        <li>
          Security incidents (suspected spoofing, compromised admin account): email support
          immediately and rotate credentials.
        </li>
      </ul>

      <h2 id="emails">3. Contact emails & URLs</h2>
      <ul>
        <li>
          General support:{" "}
          <a href="mailto:support@verifield.com.ng">support@verifield.com.ng</a>
        </li>
        <li>
          Privacy / deletion:{" "}
          <a href="mailto:privacy@verifield.com.ng">privacy@verifield.com.ng</a>
        </li>
        <li>
          Legal: <a href="mailto:legal@verifield.com.ng">legal@verifield.com.ng</a>
        </li>
        <li>
          Website: <a href="https://verifield.com.ng">https://verifield.com.ng</a>
        </li>
        <li>
          API: <a href="https://api.verifield.com.ng">https://api.verifield.com.ng</a>
        </li>
      </ul>

      <h2 id="sla">4. Response expectations (SLA)</h2>
      <ul>
        <li>
          <strong>Standard requests:</strong> we aim to respond within <strong>2 business days</strong>.
        </li>
        <li>
          <strong>Service outages / security incidents:</strong> prioritised; initial acknowledgement
          targeted within one business day where possible.
        </li>
        <li>
          Election-day or contracted enterprise SLAs may supersede these defaults under a separate
          written agreement.
        </li>
      </ul>

      <h2>5. Sales & demos</h2>
      <p>
        For Election Integrity or Corporate Verification deployments, email{" "}
        <a href="mailto:support@verifield.com.ng">support@verifield.com.ng</a> with subject
        &quot;Contact Sales&quot; and include your organisation, country, and expected agent count.
      </p>
    </LegalPageShell>
  )
}
