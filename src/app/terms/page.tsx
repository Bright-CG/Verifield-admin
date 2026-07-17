import type { Metadata } from "next"
import { LegalPageShell } from "@/components/legal-page-shell"

export const metadata: Metadata = {
  title: "Terms of Service | VeriField",
  description:
    "Terms governing use of the VeriField website, APIs, admin console, and mobile applications.",
}

const TOC = [
  { id: "service", label: "The Service" },
  { id: "accounts", label: "Accounts" },
  { id: "acceptable-use", label: "Acceptable use" },
  { id: "evidence", label: "Field evidence" },
  { id: "liability", label: "Liability" },
  { id: "contact", label: "Contact" },
]

export default function TermsOfServicePage() {
  return (
    <LegalPageShell title="Terms of Service" updated="July 17, 2026" toc={TOC}>
      <p>
        These Terms of Service (&quot;Terms&quot;) govern access to and use of VeriField&apos;s
        websites, organisation console, APIs, and mobile applications (collectively, the
        &quot;Service&quot;). By creating an account, accessing the Service, or deploying VeriField
        for your organisation, you agree to these Terms.
      </p>
      <p>
        If you are accepting on behalf of an organisation, you represent that you have authority to
        bind that organisation. If you do not agree, do not use the Service.
      </p>

      <h2 id="service">1. The Service</h2>
      <p>
        VeriField provides zero-trust field verification tooling, including live camera capture,
        location-validated submissions, cryptographic receipts, immutable evidence storage,
        organisation dashboards, and related election or corporate workflows. Features may vary by
        plan, tenant configuration, and jurisdiction.
      </p>
      <p>
        We may modify, suspend, or discontinue features with reasonable notice where practicable.
        Mission-critical election deployments may be subject to separate written agreements or SLAs.
      </p>

      <h2 id="accounts">2. Accounts & eligibility</h2>
      <ul>
        <li>You must provide accurate registration information and keep credentials confidential.</li>
        <li>
          Field agents may be device-bound. Sharing accounts, cloning apps, using emulators, or
          bypassing integrity checks is prohibited.
        </li>
        <li>
          Organisation administrators are responsible for inviting, removing, and supervising their
          users and for lawful deployment of the Service.
        </li>
        <li>You must be legally able to enter a binding contract in your jurisdiction.</li>
      </ul>

      <h2 id="acceptable-use">3. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Submit falsified evidence, spoofed locations, or manipulated captures.</li>
        <li>Attempt to alter sealed records, break hash chains, or circumvent proximity locks.</li>
        <li>Probe, scan, or attack the Service except under an authorised security assessment.</li>
        <li>Use the Service for unlawful surveillance, harassment, or discrimination.</li>
        <li>Resell or sublicense the Service except as expressly permitted in writing.</li>
        <li>Reverse engineer the Service except where mandatory law allows.</li>
      </ul>
      <p>
        We may suspend or terminate access for violations, security risk, or non-payment (where
        applicable).
      </p>

      <h2 id="evidence">4. Field captures & evidence</h2>
      <ul>
        <li>
          Captures created through VeriField are intended as operational and potentially legal
          evidence for the deploying organisation.
        </li>
        <li>
          Organisations are responsible for obtaining any required notices, consents, or legal
          bases for collecting images, location, and identity data from their agents and for how
          evidence is used in disputes or proceedings.
        </li>
        <li>
          Immutable storage means some records cannot be edited after acceptance. See our{" "}
          <a href="/privacy">Privacy Policy</a> and{" "}
          <a href="/delete-account">Account Deletion</a> page for deletion caveats.
        </li>
        <li>
          VeriField does not provide legal advice. &quot;Section 84&quot; and similar references
          describe product design goals for evidentiary packaging; admissibility depends on local
          law and facts.
        </li>
      </ul>

      <h2>5. Organisation responsibilities</h2>
      <ul>
        <li>Configure units, staff roles, and review workflows correctly.</li>
        <li>Train agents on lawful and accurate use of the mobile app.</li>
        <li>Protect admin accounts with strong authentication practices.</li>
        <li>Export and preserve evidence according to your internal retention policies.</li>
      </ul>

      <h2>6. Intellectual property</h2>
      <p>
        VeriField, its software, branding, and documentation remain our property or that of our
        licensors. You retain rights in your organisation&apos;s content and evidence you submit,
        subject to the licences needed for us to host, process, display, and secure that content to
        provide the Service.
      </p>

      <h2>7. Third-party services</h2>
      <p>
        The Service may integrate with cloud infrastructure, email, maps, analytics, crash
        reporting, app stores, and AI extraction providers. Their terms and privacy practices apply
        to their processing. We are not responsible for third-party outages beyond our reasonable
        control.
      </p>

      <h2>8. Availability & changes</h2>
      <p>
        We aim for high availability but do not guarantee uninterrupted Service. Scheduled
        maintenance and emergency security patches may occur. Offline-first mobile capture is
        designed to reduce field downtime but still requires eventual connectivity to sync.
      </p>

      <h2>9. Disclaimer</h2>
      <p>
        THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF
        ANY KIND, WHETHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING MERCHANTABILITY, FITNESS FOR A
        PARTICULAR PURPOSE, AND NON-INFRINGEMENT, TO THE MAXIMUM EXTENT PERMITTED BY LAW.
      </p>

      <h2 id="liability">10. Limitation of liability</h2>
      <p>
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, VERIFIELD AND ITS SUPPLIERS WILL NOT BE LIABLE FOR
        INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS,
        DATA, GOODWILL, OR BUSINESS INTERRUPTION. OUR AGGREGATE LIABILITY ARISING OUT OF THESE TERMS
        OR THE SERVICE WILL NOT EXCEED THE AMOUNTS PAID BY YOUR ORGANISATION TO VERIFIELD FOR THE
        SERVICE IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM (OR NGN 100,000 IF NO FEES WERE PAID).
      </p>
      <p>
        Some jurisdictions do not allow certain limitations; in those cases, our liability is
        limited to the fullest extent permitted.
      </p>

      <h2>11. Indemnity</h2>
      <p>
        You will defend and indemnify VeriField against claims arising from your organisation&apos;s
        misuse of the Service, unlawful evidence collection, or violation of these Terms, except to
        the extent caused by our wilful misconduct.
      </p>

      <h2>12. Termination</h2>
      <p>
        You may stop using the Service at any time. We may suspend or terminate access for breach,
        legal risk, or extended inactivity of unpaid accounts. Provisions that by nature should
        survive (including IP, evidence caveats, disclaimers, and liability limits) will survive
        termination.
      </p>

      <h2>13. Governing law</h2>
      <p>
        These Terms are governed by the laws of the Federal Republic of Nigeria, without regard to
        conflict-of-law rules. Courts located in Nigeria will have exclusive jurisdiction, unless a
        separate enterprise agreement specifies otherwise.
      </p>

      <h2>14. Changes to Terms</h2>
      <p>
        We may update these Terms. Continued use after the updated date constitutes acceptance of
        the revised Terms, except where mandatory law requires additional consent.
      </p>

      <h2 id="contact">15. Contact</h2>
      <p>
        Legal: <a href="mailto:legal@verifield.com.ng">legal@verifield.com.ng</a>
        <br />
        Support: <a href="mailto:support@verifield.com.ng">support@verifield.com.ng</a>
        <br />
        Web: <a href="https://verifield.com.ng">verifield.com.ng</a>
      </p>
    </LegalPageShell>
  )
}
