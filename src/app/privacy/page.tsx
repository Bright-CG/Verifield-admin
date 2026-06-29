import type { Metadata } from "next"
import { LegalPageShell } from "@/components/legal-page-shell"

export const metadata: Metadata = {
  title: "Privacy Policy | VeriField",
  description: "How VeriField collects, uses, and protects data from field agents and administrators.",
}

export default function PrivacyPolicyPage() {
  return (
    <LegalPageShell title="Privacy Policy" updated="June 28, 2026">
      <p>
        VeriField (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) operates the VeriField mobile application and
        web platform at{" "}
        <a href="https://verifield.com.ng" className="text-primary hover:underline">
          verifield.com.ng
        </a>
        . This Privacy Policy explains what information we collect, why we collect it, and your choices.
      </p>

      <h2>1. Who this applies to</h2>
      <ul>
        <li>
          <strong>Field agents</strong> using the VeriField mobile app to capture and submit verified reports.
        </li>
        <li>
          <strong>Organisation administrators</strong> using the VeriField admin dashboard to manage staff,
          review submissions, and export evidence.
        </li>
        <li>
          <strong>Platform operators</strong> (VeriField super administrators) who configure system settings.
        </li>
      </ul>

      <h2>2. Information we collect</h2>
      <h2 className="!text-base !font-medium !mt-4">Account & identity</h2>
      <ul>
        <li>Name, email address, organisation/tenant assignment, and role.</li>
        <li>Authentication tokens and, where enabled, multi-factor verification codes.</li>
        <li>Device identifier used to bind an agent account to a single handset.</li>
      </ul>

      <h2 className="!text-base !font-medium !mt-4">Field capture data</h2>
      <ul>
        <li>Photographs captured in-app (e.g. EC8A result sheets) — live camera only; gallery upload is not permitted.</li>
        <li>GPS coordinates, location accuracy, and capture timestamp watermarked on images.</li>
        <li>Polling unit / location assignment and metadata submitted with each verification.</li>
        <li>Cryptographic signatures and hash-chain records used to prove integrity of submissions.</li>
      </ul>

      <h2 className="!text-base !font-medium !mt-4">Technical & device data</h2>
      <ul>
        <li>App version, operating system, and basic device integrity signals reported by the client.</li>
        <li>Server logs (IP address, request timestamps, error diagnostics) for security and reliability.</li>
      </ul>

      <h2>3. How we use information</h2>
      <ul>
        <li>Authenticate users and enforce device binding for field agents.</li>
        <li>Store immutable verification records and optional EC8A extraction results for review.</li>
        <li>Display submissions on organisation war-room dashboards and aggregated EC8A totals.</li>
        <li>Generate evidence certificates and audit trails for authorised administrators.</li>
        <li>Maintain platform security, prevent abuse, and improve service reliability.</li>
      </ul>

      <h2>4. Legal bases (where applicable)</h2>
      <p>
        We process data to perform our contract with your organisation, to comply with legal obligations,
        and where necessary for legitimate interests in securing field evidence and preventing fraud.
        Organisations deploying VeriField for elections or operations are responsible for informing their
        agents of the lawful basis applicable in their jurisdiction.
      </p>

      <h2>5. Sharing & disclosure</h2>
      <ul>
        <li>
          <strong>Within your organisation:</strong> tenant administrators can access submissions and reports
          for their organisation.
        </li>
        <li>
          <strong>Service providers:</strong> hosting, email delivery, and optional OCR providers (e.g. Google
          Cloud Vision / Document AI when configured) process data on our instructions.
        </li>
        <li>
          <strong>Legal requirements:</strong> we may disclose information if required by law, court order, or
          to protect rights and safety.
        </li>
      </ul>
      <p>We do not sell personal information.</p>

      <h2>6. Data retention</h2>
      <p>
        Verification records are designed to be immutable evidence and are retained according to your
        organisation&apos;s agreement and applicable law. Account credentials can be deactivated by your
        administrator. See our{" "}
        <a href="/delete-account" className="text-primary hover:underline">
          Account Deletion
        </a>{" "}
        page for agent and admin deletion requests.
      </p>

      <h2>7. Security</h2>
      <p>
        We use encryption in transit (HTTPS/TLS), access controls, device binding, cryptographic signing,
        and database-level immutability controls. No system is completely secure; report suspected incidents
        to{" "}
        <a href="mailto:privacy@verifield.com.ng" className="text-primary hover:underline">
          privacy@verifield.com.ng
        </a>
        .
      </p>

      <h2>8. Your rights</h2>
      <p>
        Depending on your location you may have rights to access, correct, delete, or restrict processing of
        your personal data. Field agents should contact their organisation administrator first; you may also
        contact us at{" "}
        <a href="mailto:privacy@verifield.com.ng" className="text-primary hover:underline">
          privacy@verifield.com.ng
        </a>
        .
      </p>

      <h2>9. Children</h2>
      <p>
        VeriField is not directed at children under 16 and is intended for authorised adult field agents and
        administrators.
      </p>

      <h2>10. Changes</h2>
      <p>
        We may update this policy. Material changes will be posted on this page with a revised &quot;Last
        updated&quot; date.
      </p>

      <h2>11. Contact</h2>
      <p>
        VeriField —{" "}
        <a href="mailto:privacy@verifield.com.ng" className="text-primary hover:underline">
          privacy@verifield.com.ng
        </a>
        <br />
        Website:{" "}
        <a href="https://verifield.com.ng/support" className="text-primary hover:underline">
          verifield.com.ng/support
        </a>
      </p>
    </LegalPageShell>
  )
}
