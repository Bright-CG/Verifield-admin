import type { Metadata } from "next"
import { LegalPageShell } from "@/components/legal-page-shell"

export const metadata: Metadata = {
  title: "Terms of Service | VeriField",
  description: "Terms governing use of the VeriField platform and mobile application.",
}

export default function TermsPage() {
  return (
    <LegalPageShell title="Terms of Service" updated="June 28, 2026">
      <p>
        These Terms of Service (&quot;Terms&quot;) govern access to VeriField&apos;s website, admin dashboard,
        APIs, and mobile application (collectively, the &quot;Service&quot;). By using the Service you agree to
        these Terms.
      </p>

      <h2>1. The Service</h2>
      <p>
        VeriField provides a field verification platform for organisations to collect tamper-evident capture
        records, review submissions, and produce audit trails. Features may vary by subscription and tenant
        configuration.
      </p>

      <h2>2. Accounts & eligibility</h2>
      <ul>
        <li>Organisation administrators register on behalf of their entity.</li>
        <li>Field agents are provisioned by an administrator and must use assigned credentials and devices.</li>
        <li>You must provide accurate information and keep login credentials confidential.</li>
        <li>You must be at least 18 years old (or the age of majority in your jurisdiction).</li>
      </ul>

      <h2>3. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Submit false, manipulated, or unauthorised captures.</li>
        <li>Attempt to bypass device binding, GPS capture, or cryptographic integrity controls.</li>
        <li>Reverse engineer, scrape, or overload the Service except as permitted by law.</li>
        <li>Use the Service for unlawful surveillance or harassment.</li>
        <li>Access data belonging to another organisation without authorisation.</li>
      </ul>

      <h2>4. Field captures & evidence</h2>
      <p>
        Submissions are designed to be immutable once accepted. Your organisation is responsible for operational
        policies governing when and how agents capture evidence. VeriField provides technical integrity tools;
        legal admissibility depends on context, jurisdiction, and proper chain-of-custody procedures.
      </p>

      <h2>5. Organisation responsibilities</h2>
      <p>
        Tenant administrators are responsible for staff onboarding, polling unit assignments, compliance with
        local election or corporate regulations, and instructing agents on lawful data processing.
      </p>

      <h2>6. Intellectual property</h2>
      <p>
        VeriField retains all rights in the Service, software, and branding. You retain rights in content you
        submit; you grant VeriField a licence to host, process, and display submissions solely to operate the
        Service for your organisation.
      </p>

      <h2>7. Third-party services</h2>
      <p>
        The Service may integrate optional third-party OCR, mapping, or cloud providers. Their terms and privacy
        policies apply to data sent to those services when enabled by configuration.
      </p>

      <h2>8. Availability & changes</h2>
      <p>
        We strive for high availability but do not guarantee uninterrupted access. We may modify features,
        suspend accounts for abuse, or discontinue parts of the Service with reasonable notice where
        practicable.
      </p>

      <h2>9. Disclaimer</h2>
      <p>
        THE SERVICE IS PROVIDED &quot;AS IS&quot; TO THE MAXIMUM EXTENT PERMITTED BY LAW. WE DISCLAIM WARRANTIES OF
        MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
      </p>

      <h2>10. Limitation of liability</h2>
      <p>
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, VERIFIELD SHALL NOT BE LIABLE FOR INDIRECT, INCIDENTAL,
        SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR FOR LOSS OF DATA, PROFITS, OR ELECTION OUTCOMES
        ARISING FROM USE OF THE SERVICE.
      </p>

      <h2>11. Termination</h2>
      <p>
        We or your organisation may terminate access. Provisions that by nature should survive (including
        liability limits and dispute sections) will survive termination. See{" "}
        <a href="/delete-account" className="text-primary hover:underline">
          Account Deletion
        </a>{" "}
        for data removal requests.
      </p>

      <h2>12. Governing law</h2>
      <p>
        These Terms are governed by the laws of the Federal Republic of Nigeria, without regard to conflict-of-law
        principles. Disputes shall be subject to the exclusive jurisdiction of courts in Nigeria unless otherwise
        agreed in writing with your organisation.
      </p>

      <h2>13. Contact</h2>
      <p>
        Questions:{" "}
        <a href="mailto:legal@verifield.com.ng" className="text-primary hover:underline">
          legal@verifield.com.ng
        </a>
      </p>
    </LegalPageShell>
  )
}
