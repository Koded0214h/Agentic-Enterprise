import { Link } from 'react-router-dom'
import SpaceBackground from '../components/SpaceBackground'
import './Landing.css'
import './Legal.css'

export default function TermsOfService() {
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
            <h1 className="legal-title">Terms of Service</h1>
            <p className="legal-meta">Last updated: May 2026</p>
          </div>

          <div className="legal-body">
            <section className="legal-section">
              <h2>1. Acceptance of Terms</h2>
              <p>
                By accessing or using the Autonomous Operating System ("AOS") platform,
                you agree to be bound by these Terms of Service ("Terms"). If you do not
                agree to these Terms, do not use the platform. These Terms constitute a
                legally binding agreement between you and Autonomous Operating System, Inc.
                ("AOS", "we", "us", or "our").
              </p>
            </section>

            <section className="legal-section">
              <h2>2. Service Description</h2>
              <p>
                AOS is an enterprise AI agent swarm platform that enables users to deploy
                autonomous agent teams to operate business functions including product,
                growth, and operations. The platform includes blueprint templates, DAG
                orchestration, compliance guardrails, audit logging, and human-in-the-loop
                approval workflows.
              </p>
              <p>
                We reserve the right to modify, suspend, or discontinue any part of the
                service at any time with reasonable notice. Features described in marketing
                materials may be subject to separate availability or pricing.
              </p>
            </section>

            <section className="legal-section">
              <h2>3. User Accounts</h2>
              <p>
                You must create an account to use AOS. You are responsible for maintaining
                the confidentiality of your account credentials and for all activity that
                occurs under your account. You agree to:
              </p>
              <ul>
                <li>Provide accurate and complete registration information</li>
                <li>Keep your password secure and not share it with third parties</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
                <li>Ensure all users accessing AOS under your account comply with these Terms</li>
              </ul>
              <p>
                AOS reserves the right to suspend or terminate accounts that violate these
                Terms, engage in fraudulent activity, or pose a security risk.
              </p>
            </section>

            <section className="legal-section">
              <h2>4. Acceptable Use</h2>
              <p>You agree not to use AOS to:</p>
              <ul>
                <li>Violate any applicable law or regulation</li>
                <li>Infringe the intellectual property rights of any third party</li>
                <li>Transmit malicious code, viruses, or disruptive software</li>
                <li>Attempt to gain unauthorized access to AOS systems or other users' data</li>
                <li>Use the platform to generate spam, conduct phishing, or commit fraud</li>
                <li>Reverse engineer, decompile, or disassemble any part of the platform</li>
                <li>Resell or sublicense access to the platform without prior written consent</li>
              </ul>
              <p>
                We reserve the right to investigate and take appropriate action against
                violations, including suspending or terminating your account and cooperating
                with law enforcement authorities.
              </p>
            </section>

            <section className="legal-section">
              <h2>5. Payment Terms</h2>
              <p>
                Paid plans are billed on a monthly or annual basis as selected at checkout.
                All fees are stated in US dollars and are non-refundable except as required
                by law or as explicitly stated in these Terms. You authorize AOS to charge
                the payment method on file for all applicable fees.
              </p>
              <p>
                If your payment fails, we will attempt to retry the charge. Accounts with
                outstanding balances may be suspended. You may cancel your subscription at
                any time; cancellation takes effect at the end of the current billing period.
              </p>
              <p>
                We reserve the right to change pricing with 30 days' notice. Continued use
                of the platform after a price change constitutes acceptance of the new pricing.
              </p>
            </section>

            <section className="legal-section">
              <h2>6. Intellectual Property</h2>
              <p>
                AOS and all associated technology, software, design, and content are the
                exclusive property of Autonomous Operating System, Inc. and protected by
                intellectual property laws. You are granted a limited, non-exclusive,
                non-transferable license to use the platform solely for your internal
                business purposes during the term of your subscription.
              </p>
              <p>
                You retain ownership of all data, content, and outputs generated through
                your use of the platform. By using AOS, you grant us a limited license to
                process your data solely to provide and improve the service.
              </p>
            </section>

            <section className="legal-section">
              <h2>7. Termination</h2>
              <p>
                Either party may terminate these Terms at any time. You may terminate by
                cancelling your account. We may terminate or suspend your access immediately,
                without prior notice, if you materially breach these Terms.
              </p>
              <p>
                Upon termination, your right to use the platform ceases immediately. We
                will retain your data for 30 days following termination, after which it may
                be deleted. You may request an export of your data prior to termination.
              </p>
            </section>

            <section className="legal-section">
              <h2>8. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by applicable law, AOS shall not be liable
                for any indirect, incidental, special, consequential, or punitive damages,
                including loss of profits, data, or business opportunities, arising out of
                or relating to your use of the platform, even if we have been advised of
                the possibility of such damages.
              </p>
              <p>
                Our aggregate liability for any claims arising under these Terms shall not
                exceed the total amount you paid to AOS in the 12 months preceding the claim.
              </p>
            </section>

            <section className="legal-section">
              <h2>9. Governing Law</h2>
              <p>
                These Terms are governed by and construed in accordance with the laws of the
                State of Delaware, United States, without regard to its conflict of law
                provisions. Any disputes arising from these Terms shall be resolved through
                binding arbitration in accordance with the rules of the American Arbitration
                Association, except that either party may seek injunctive relief in a court
                of competent jurisdiction.
              </p>
              <p>
                If you have questions about these Terms, contact us at{' '}
                <a href="mailto:contact@aos-swarm.com">contact@aos-swarm.com</a>.
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
