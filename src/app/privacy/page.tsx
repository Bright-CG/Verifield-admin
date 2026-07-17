import type { Metadata } from "next"
import { LegalPageShell } from "@/components/legal-page-shell"

export const metadata: Metadata = {
  title: "Privacy Policy | VeriField",
  description:
    "How VeriField collects, uses, stores, and protects camera, location, device, and account data for field agents and administrators.",
}

const TOC = [
  { id: "who", label: "Who this applies to" },
  { id: "collect", label: "Information we collect" },
  { id: "camera-location", label: "Camera & location" },
  { id: "use", label: "How we use information" },
  { id: "sharing", label: "Sharing & disclosure" },
  { id: "retention", label: "Retention" },
  { id: "security", label: "Security" },
  { id: "rights", label: "Your rights" },
  { id: "contact", label: "Contact" },
]

export default function PrivacyPolicyPage() {
  return (
    <LegalPageShell title="Privacy Policy" updated="July 17, 2026" toc={TOC}>
      <p>
        VeriField (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) operates the VeriField mobile
        applications and the web platform at{" "}
        <a href="https://verifield.com.ng">verifield.com.ng</a>, including the organisation console
        and related APIs at <a href="https://api.verifield.com.ng">api.verifield.com.ng</a>. This
        Privacy Policy explains what information we collect, why we collect it, how it is stored,
        and the choices available to you.
      </p>
      <p>
        VeriField is designed for zero-trust field verification—especially election result capture
        and corporate field accountability in Africa. Some data (such as sealed verification
        evidence) is intentionally immutable for integrity and legal defensibility.
      </p>

      <h2 id="who">1. Who this applies to</h2>
      <ul>
        <li>
          <strong>Field agents</strong> using the VeriField iOS or Android app to capture and submit
          verified reports (for example EC8A result sheets or site visit evidence).
        </li>
        <li>
          <strong>Organisation administrators</strong> using the VeriField web console to manage
          staff, review submissions, run war-room operations, and export evidence.
        </li>
        <li>
          <strong>Platform operators</strong> (VeriField super administrators) who configure
          system-wide settings.
        </li>
      </ul>

      <h2 id="collect">2. Information we collect</h2>
      <h3>Account & identity</h3>
      <ul>
        <li>Name, email address, organisation/tenant assignment, and role.</li>
        <li>Authentication credentials, session tokens, and (where enabled) email OTP / MFA codes.</li>
        <li>
          Device binding identifiers used to associate an agent account with a single approved
          handset.
        </li>
      </ul>

      <h3>Field capture & evidence data</h3>
      <ul>
        <li>
          Photographs captured through the in-app live camera (gallery import is not permitted for
          primary evidence capture).
        </li>
        <li>
          On-image watermarks containing GPS coordinates, accuracy estimates, timestamps, and
          assigned location / polling unit identifiers.
        </li>
        <li>
          Cryptographic signatures, SHA-256 hashes, previous-hash chain values, and related
          integrity metadata for each submission.
        </li>
        <li>
          Optional OCR / AI extraction outputs derived from submitted images (for example EC8A
          party totals), which may be reviewed and corrected by authorised reviewers.
        </li>
      </ul>

      <h3>Technical, diagnostics & analytics</h3>
      <ul>
        <li>App version, OS version, and basic device integrity / attestation signals.</li>
        <li>Server logs (IP address, request timestamps, error diagnostics) for security and reliability.</li>
        <li>
          Crash and usage analytics (for example Firebase Crashlytics / Analytics) to improve
          stability—collection is configured according to platform release settings.
        </li>
      </ul>

      <h2 id="camera-location">3. Camera, location, and device permissions (mobile)</h2>
      <p>
        The VeriField mobile apps request sensitive device permissions only to perform field
        verification. Apple App Store and Google Play reviewers should note the following precise
        uses:
      </p>
      <h3>Camera</h3>
      <ul>
        <li>
          <strong>Purpose:</strong> live capture of EC8A forms, invoices, or other assigned field
          evidence with edge-aligned document scanning where enabled.
        </li>
        <li>
          <strong>Use:</strong> images are watermarked, cryptographically signed, uploaded to
          VeriField servers for the agent&apos;s organisation, and may be used to generate evidence
          certificates and audit trails.
        </li>
        <li>
          <strong>Not used for:</strong> unrelated advertising, social sharing, or continuous
          background camera recording.
        </li>
      </ul>
      <h3>Location (when in use / foreground)</h3>
      <ul>
        <li>
          <strong>Purpose:</strong> prove the agent is physically present at the assigned polling
          unit or site; watermark captures; enforce proximity validation (approximately 20 metres).
        </li>
        <li>
          <strong>Collection timing:</strong> primarily while the agent is actively using capture
          flows in the foreground.
        </li>
        <li>
          <strong>Storage:</strong> coordinates, accuracy, and timestamps are stored with the
          verification record and may appear on certificates and admin dashboards.
        </li>
      </ul>
      <h3>Background location</h3>
      <ul>
        <li>
          VeriField&apos;s core product requirement is location at capture time (foreground / when
          in use). If a future release enables limited background location (for example offline sync
          reliability or continuity of a capture session), that use will remain limited to
          verification integrity and will be disclosed in an updated Privacy Policy and in-app
          permission prompts before collection expands.
        </li>
        <li>
          We do not sell location data and do not use location for third-party advertising.
        </li>
      </ul>
      <h3>Device identifiers</h3>
      <ul>
        <li>
          Used to bind an agent to one device, reduce cloning/emulator abuse, and support security
          attestation.
        </li>
        <li>
          Combined with account credentials to prevent unauthorised multi-device access to the same
          field agent profile.
        </li>
      </ul>

      <h2 id="use">4. How we use information</h2>
      <ul>
        <li>Authenticate users and enforce device binding for field agents.</li>
        <li>Validate proximity, signatures, and integrity before accepting submissions.</li>
        <li>Store verification records for organisational review, war-room operations, and EC8A rollups.</li>
        <li>Generate Section 84-style evidence certificates and hash-chain audit exports.</li>
        <li>Detect fraud, abuse, and security incidents; maintain platform reliability.</li>
        <li>Provide customer support to organisations and (where appropriate) agents.</li>
      </ul>

      <h2>5. Legal bases (where applicable)</h2>
      <p>
        We process data to perform our contract with your organisation, to comply with legal
        obligations, and where necessary for legitimate interests in securing field evidence and
        preventing election or corporate fraud. Organisations deploying VeriField remain responsible
        for informing their agents of the lawful basis applicable in their jurisdiction (including
        Nigerian data protection requirements where relevant).
      </p>

      <h2 id="sharing">6. Sharing & disclosure</h2>
      <ul>
        <li>
          <strong>Within your organisation:</strong> tenant administrators and authorised reviewers
          can access submissions for their organisation.
        </li>
        <li>
          <strong>Service providers:</strong> infrastructure, email delivery, analytics/crash
          reporting, and AI extraction providers process data only to deliver the Service under
          contractual controls.
        </li>
        <li>
          <strong>Legal:</strong> we may disclose information if required by law, court order, or to
          protect rights, safety, and the integrity of sealed evidence.
        </li>
        <li>
          <strong>No sale of personal information:</strong> we do not sell personal data for
          advertising.
        </li>
      </ul>

      <h2 id="retention">7. Data retention</h2>
      <ul>
        <li>
          Account profile data is retained while the account is active and for a reasonable period
          afterward for security, dispute resolution, and legal compliance.
        </li>
        <li>
          Verification evidence, cryptographic receipts, and hash-chain records may be retained for
          longer periods—including after account deactivation—because immutability and auditability
          are core product and legal features. Where deletion of an account is requested, we remove
          or de-identify personal account identifiers where feasible, while sealed evidence required
          for organisational or legal integrity may persist in anonymised or organisation-controlled
          form.
        </li>
      </ul>

      <h2 id="security">8. Security</h2>
      <p>
        We use industry-standard controls including encrypted transport (HTTPS/TLS), access
        controls, device binding, cryptographic signatures, and append-oriented evidence storage.
        No method of transmission or storage is 100% secure; organisations must also protect admin
        credentials and review permissions carefully.
      </p>

      <h2 id="rights">9. Your rights</h2>
      <p>
        Depending on applicable law, you may request access, correction, or deletion of personal
        account data, or raise a complaint with your organisation or a supervisory authority. Field
        agents should usually start with their organisation administrator. Account deletion
        instructions are published at{" "}
        <a href="https://verifield.com.ng/delete-account">verifield.com.ng/delete-account</a>.
      </p>

      <h2>10. Children</h2>
      <p>
        VeriField is not directed to children under 16. We do not knowingly collect personal
        information from children under 16.
      </p>

      <h2>11. International processing</h2>
      <p>
        Data may be processed on servers or by providers located outside your country. We take steps
        appropriate to the sensitivity of verification evidence and contractual relationships with
        processors.
      </p>

      <h2>12. Changes</h2>
      <p>
        We may update this Policy to reflect product, legal, or operational changes. The &quot;Last
        updated&quot; date will change when we do. Material changes will be highlighted on this page
        or communicated to organisation administrators where appropriate.
      </p>

      <h2 id="contact">13. Contact</h2>
      <p>
        Privacy questions:{" "}
        <a href="mailto:privacy@verifield.com.ng">privacy@verifield.com.ng</a>
        <br />
        Support:{" "}
        <a href="https://verifield.com.ng/support">verifield.com.ng/support</a>
      </p>
    </LegalPageShell>
  )
}
