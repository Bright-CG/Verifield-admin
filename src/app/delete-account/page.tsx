import type { Metadata } from "next"
import { LegalPageShell } from "@/components/legal-page-shell"

export const metadata: Metadata = {
  title: "Account & Data Deletion | VeriField",
  description: "How to request deletion of your VeriField account and associated personal data.",
}

export default function DeleteAccountPage() {
  return (
    <LegalPageShell title="Account & Data Deletion" updated="June 28, 2026">
      <p>
        This page explains how field agents and administrators can request removal of account access and,
        where applicable, personal data held by VeriField.
      </p>

      <h2>Important note about verification records</h2>
      <p>
        VeriField stores <strong>immutable verification evidence</strong> (photos, GPS, signatures, timestamps)
        submitted in the course of an organisation&apos;s operation. These records may be retained even after an
        account is deactivated, because they form part of an audit trail your organisation relies on. Personal
        identifiers may be minimised or disassociated where law and contract allow.
      </p>

      <h2>Field agents</h2>
      <ol className="list-decimal pl-5 space-y-2">
        <li>Contact your organisation administrator and ask them to deactivate your agent account.</li>
        <li>
          If your administrator cannot help, email{" "}
          <a href="mailto:privacy@verifield.com.ng" className="text-primary hover:underline">
            privacy@verifield.com.ng
          </a>{" "}
          from the email address registered on your account with the subject line{" "}
          <strong>Agent account deletion request</strong>.
        </li>
        <li>Include your full name, organisation name, and registered email.</li>
        <li>We will verify your identity and respond within 30 days.</li>
      </ol>

      <h2>Organisation administrators</h2>
      <p>
        Tenant admins should contact{" "}
        <a href="mailto:support@verifield.com.ng" className="text-primary hover:underline">
          support@verifield.com.ng
        </a>{" "}
        to close an organisation account or export/delete data subject to contract terms and legal retention
        requirements.
      </p>

      <h2>What we delete vs retain</h2>
      <ul>
        <li>
          <strong>Deleted or deactivated:</strong> login access, device binding, API tokens, and personal profile
          fields where retention is not required.
        </li>
        <li>
          <strong>May be retained:</strong> anonymised or pseudonymised audit logs, immutable verification rows,
          and legally required records.
        </li>
      </ul>

      <h2>Google Play & app store compliance</h2>
      <p>
        VeriField&apos;s Android app links to this page as its official account deletion resource. You do not
        need to uninstall the app to submit a deletion request — contact us or your administrator using the
        steps above.
      </p>

      <h2>Contact</h2>
      <p>
        <a href="mailto:privacy@verifield.com.ng" className="text-primary hover:underline">
          privacy@verifield.com.ng
        </a>
      </p>
    </LegalPageShell>
  )
}
