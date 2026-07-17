import type { Metadata } from "next"
import Link from "next/link"
import { LegalPageShell } from "@/components/legal-page-shell"

export const metadata: Metadata = {
  title: "Account & Data Deletion | VeriField",
  description:
    "How to request VeriField account and data deletion. 30-day timeline, what is deleted, and immutable audit log caveats for App Store and Google Play compliance.",
}

const TOC = [
  { id: "how", label: "How to request" },
  { id: "timeline", label: "30-day timeline" },
  { id: "deleted", label: "What is deleted" },
  { id: "retained", label: "What may be retained" },
  { id: "stores", label: "App Store / Play" },
]

export default function DeleteAccountPage() {
  return (
    <LegalPageShell title="Account & Data Deletion" updated="July 17, 2026" toc={TOC}>
      <p>
        This page explains how VeriField users can request deletion of their account and associated
        personal data. It exists to satisfy Apple App Store and Google Play account-deletion
        requirements and to set clear expectations about immutable verification evidence.
      </p>

      <div className="not-prose rounded-lg border border-primary/30 bg-primary/5 p-5">
        <p className="text-sm font-semibold text-foreground">Important</p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          VeriField seals field evidence for integrity and potential legal use. Deleting your login
          does <strong className="text-foreground">not</strong> always erase historical verification
          records your organisation still needs for audit, dispute, or statutory purposes. See
          &quot;What may be retained&quot; below.
        </p>
      </div>

      <h2 id="how">1. How to request deletion</h2>
      <h3>Field agents (mobile app users)</h3>
      <ol className="list-decimal space-y-2 pl-5">
        <li>
          First ask your <strong>organisation administrator</strong> to deactivate or remove your
          agent account in the VeriField console (fastest path).
        </li>
        <li>
          Or email{" "}
          <a href="mailto:privacy@verifield.com.ng">privacy@verifield.com.ng</a> with subject line{" "}
          <strong>Agent account deletion request</strong>.
        </li>
        <li>
          Include: full name, organisation name, registered email, and (if known) device model.
          We may verify identity before processing.
        </li>
      </ol>

      <h3>Organisation administrators</h3>
      <ul>
        <li>
          To close an organisation, export required evidence first, then email{" "}
          <a href="mailto:support@verifield.com.ng">support@verifield.com.ng</a> with subject{" "}
          <strong>Organisation closure / deletion request</strong>.
        </li>
        <li>
          Admin user deletion for a single console user can be requested via support or privacy mail,
          after confirming another admin remains where needed.
        </li>
      </ul>

      <h2 id="timeline">2. Timeline</h2>
      <ul>
        <li>
          We aim to acknowledge deletion requests within <strong>2 business days</strong>.
        </li>
        <li>
          We aim to complete account deletion or provide a status update within{" "}
          <strong>30 days</strong> of a verified request, unless a longer period is required by law
          or a complex organisation export/closure.
        </li>
      </ul>

      <h2 id="deleted">3. What is deleted or de-identified</h2>
      <ul>
        <li>Login credentials and active session tokens for the deleted user.</li>
        <li>Personal profile fields tied to the user account (name/email linkage) where feasible.</li>
        <li>Device-binding records for that agent account.</li>
        <li>Push or messaging identifiers associated with the account, if any.</li>
      </ul>

      <h2 id="retained">4. What may be retained (immutable / legal caveats)</h2>
      <ul>
        <li>
          <strong>Sealed verification evidence</strong> (images, GPS watermarks, hashes, signatures,
          hash-chain links) submitted while the account was active may be retained by the
          organisation or platform because records are designed to be append-only and
          non-rewritable.
        </li>
        <li>
          <strong>Audit logs and evidence certificates</strong> generated for compliance, dispute
          resolution, or election integrity may be retained as required by the organisation&apos;s
          policies or applicable law.
        </li>
        <li>
          <strong>Security logs</strong> may be retained for a limited period to investigate abuse.
        </li>
        <li>
          Where personal identifiers can be removed or replaced with opaque IDs without breaking
          integrity proofs, we will do so when processing a verified deletion request.
        </li>
      </ul>

      <h2 id="stores">5. Apple App Store & Google Play note</h2>
      <p>
        Mobile users can initiate deletion without contacting VeriField engineers in person: use the
        email path above or ask your organisation admin. This web page remains publicly reachable at{" "}
        <a href="https://verifield.com.ng/delete-account">
          https://verifield.com.ng/delete-account
        </a>{" "}
        without requiring app login, as required by store policies.
      </p>
      <p>
        Related policies: <Link href="/privacy">Privacy Policy</Link> ·{" "}
        <Link href="/terms">Terms of Service</Link> · <Link href="/support">Support</Link>
      </p>

      <h2>6. Contact</h2>
      <p>
        Privacy / deletion:{" "}
        <a href="mailto:privacy@verifield.com.ng">privacy@verifield.com.ng</a>
        <br />
        Support: <a href="mailto:support@verifield.com.ng">support@verifield.com.ng</a>
      </p>
    </LegalPageShell>
  )
}
