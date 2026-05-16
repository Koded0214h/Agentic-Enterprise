import { Link } from 'react-router-dom'
import SpaceBackground from '../components/SpaceBackground'
import './Landing.css'
import './Legal.css'

export default function PrivacyPolicy() {
  return (
    <div className="landing legal-page">
      <SpaceBackground mode="fixed" />

      {/* ── Nav ── */}
      <nav className="landing-nav">
        <Link to="/" className="landing-logo">AOS</Link>
        <div className="landing-nav-links">
          <Link to="/" className="btn btn-ghost btn-sm">Back to home</Link>
        </div>
      </nav>

      {/* ── Content ── */}
      <main className="legal-main">
        <div className="legal-inner">
          <div className="legal-header">
            <p className="section-label">Legal</p>
            <h1 className="legal-title">Privacy Policy</h1>
            <p className="legal-meta">Last updated: May 2026</p>
          </div>

          <div className="legal-body">
            <section className="legal-section">
              <h2>1. What We Collect</h2>
              <p>
                We collect information you provide directly and information generated through
                your use of the AOS platform. This includes:
              </p>
              <ul>
                <li>
                  <strong>Account data:</strong> Name, email address, company name, and
                  billing information provided during registration or checkout.
                </li>
                <li>
                  <strong>Usage data:</strong> Swarm run logs, agent task records, prompts
                  submitted, blueprint configurations, approval decisions, and audit trail events.
                </li>
                <li>
                  <strong>Technical data:</strong> IP address, browser type, device identifiers,
                  operating system, and session metadata collected automatically.
                </li>
                <li>
                  <strong>Communications:</strong> Messages you send to our support team or
                  through the platform's collaboration features.
                </li>
              </ul>
            </section>

            <section className="legal-section">
              <h2>2. How We Use Your Data</h2>
              <p>We use your data to:</p>
              <ul>
                <li>Provide, operate, and improve the AOS platform</li>
                <li>Process transactions and manage your subscription</li>
                <li>Send transactional emails and service notifications</li>
                <li>Monitor platform performance, reliability, and security</li>
                <li>Enforce our Terms of Service and prevent abuse</li>
                <li>Comply with legal obligations</li>
                <li>Conduct aggregate, anonymized analytics to improve the product</li>
              </ul>
              <p>
                We do not sell your personal data. We do not use your swarm run data or
                prompts to train external AI models without your explicit consent.
              </p>
            </section>

            <section className="legal-section">
              <h2>3. Data Sharing</h2>
              <p>
                We share your data only in limited circumstances:
              </p>
              <ul>
                <li>
                  <strong>Service providers:</strong> We use third-party vendors (e.g., payment
                  processors, cloud infrastructure, email delivery) under strict data processing
                  agreements. They may only process your data to provide services on our behalf.
                </li>
                <li>
                  <strong>Legal requirements:</strong> We may disclose your data when required
                  by law, court order, or to protect the rights, property, or safety of AOS,
                  our users, or the public.
                </li>
                <li>
                  <strong>Business transfers:</strong> In the event of a merger, acquisition,
                  or sale of assets, your data may be transferred to the acquiring entity,
                  subject to the same privacy protections.
                </li>
              </ul>
            </section>

            <section className="legal-section">
              <h2>4. Cookies</h2>
              <p>
                AOS uses cookies and similar tracking technologies to maintain session state,
                remember preferences, and analyze usage patterns. Types of cookies used:
              </p>
              <ul>
                <li>
                  <strong>Strictly necessary:</strong> Required for authentication and core
                  platform functionality. Cannot be disabled.
                </li>
                <li>
                  <strong>Analytics:</strong> Help us understand how users interact with the
                  platform so we can improve it. You may opt out via your browser settings.
                </li>
                <li>
                  <strong>Preferences:</strong> Remember your settings across sessions.
                </li>
              </ul>
              <p>
                You can control cookie behavior through your browser settings. Disabling
                strictly necessary cookies will impair platform functionality.
              </p>
            </section>

            <section className="legal-section">
              <h2>5. Data Retention</h2>
              <p>
                We retain your personal data for as long as your account is active or as
                needed to provide you with services. Specific retention periods:
              </p>
              <ul>
                <li>Account data: Retained for the lifetime of your account plus 30 days after termination</li>
                <li>Swarm run logs and audit trails: 12 months by default; configurable on Enterprise plans</li>
                <li>Billing records: Retained for 7 years as required by financial regulations</li>
                <li>Support communications: 2 years after the last interaction</li>
              </ul>
              <p>
                You may request deletion of your data at any time by contacting us at{' '}
                <a href="mailto:contact@aos-swarm.com">contact@aos-swarm.com</a>.
                Note that some data may be retained to comply with legal obligations.
              </p>
            </section>

            <section className="legal-section">
              <h2>6. Your Rights (GDPR and CCPA)</h2>
              <p>
                Depending on your location, you may have the following rights regarding
                your personal data:
              </p>
              <ul>
                <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete data.</li>
                <li><strong>Deletion:</strong> Request deletion of your personal data ("right to be forgotten").</li>
                <li><strong>Portability:</strong> Receive your data in a structured, machine-readable format.</li>
                <li><strong>Objection:</strong> Object to processing of your data for certain purposes.</li>
                <li><strong>Opt-out of sale (CCPA):</strong> California residents have the right to opt out of the sale of personal information. We do not sell personal information.</li>
                <li><strong>Non-discrimination (CCPA):</strong> We will not discriminate against you for exercising your privacy rights.</li>
              </ul>
              <p>
                To exercise any of these rights, contact us at{' '}
                <a href="mailto:contact@aos-swarm.com">contact@aos-swarm.com</a>.
                We will respond within 30 days (GDPR) or 45 days (CCPA) of receiving your request.
              </p>
            </section>

            <section className="legal-section">
              <h2>7. Security</h2>
              <p>
                We implement industry-standard security measures to protect your data,
                including:
              </p>
              <ul>
                <li>Encryption in transit (TLS 1.3) and at rest (AES-256)</li>
                <li>Role-based access controls and least-privilege architecture</li>
                <li>Regular penetration testing and security audits</li>
                <li>SOC 2 Type II controls (in progress)</li>
                <li>Incident response and breach notification procedures</li>
              </ul>
              <p>
                No method of transmission over the internet is 100% secure. While we strive
                to protect your data, we cannot guarantee absolute security. In the event of
                a data breach affecting your rights, we will notify you as required by law.
              </p>
            </section>

            <section className="legal-section">
              <h2>8. Contact</h2>
              <p>
                If you have questions, concerns, or requests regarding this Privacy Policy
                or how we handle your data, please contact us:
              </p>
              <p>
                <strong>Autonomous Operating System, Inc.</strong><br />
                Email: <a href="mailto:contact@aos-swarm.com">contact@aos-swarm.com</a><br />
                For GDPR inquiries, our Data Protection Officer can be reached at the same address
                with the subject line "DPO Request".
              </p>
            </section>
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <span className="landing-logo">AOS</span>
        <span>© 2026 Autonomous Operating System</span>
        <div className="footer-links">
          <Link to="/terms">Terms of Service</Link>
          <Link to="/privacy">Privacy Policy</Link>
        </div>
      </footer>
    </div>
  )
}
