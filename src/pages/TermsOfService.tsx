import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Helmet } from "react-helmet-async";
import { useContactInfo } from "@/hooks/useContactInfo";

const TermsOfService = () => {
  const contactInfo = useContactInfo();
  return (
    <main className="min-h-screen bg-background">
      <Helmet>
        <title>Terms of Service | LevelHubAI - O-Level Exam Prep Platform</title>
        <meta name="description" content="LevelHubAI Terms of Service. Read the terms and conditions for using Pakistan's leading O-Level exam preparation platform." />
        <link rel="canonical" href={`${window.location.origin}/terms-of-service`} />
      </Helmet>
      <Navbar />
      <div className="container mx-auto px-4 py-24 max-w-4xl">
        <h1 className="font-display text-4xl font-bold text-foreground mb-2">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: April 6, 2026</p>

        <div className="prose prose-lg dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-3">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using LevelHubAI (olevel.com.pk), a product and service of Cybertrends SMC PVT LTD, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform. If you are under 18, you must have a parent or guardian's consent to use this platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-3">2. Description of Service</h2>
            <p className="text-muted-foreground leading-relaxed">
              LevelHubAI is an educational technology platform that provides gamified learning tools, video lessons, quizzes, practice questions, past papers, and AI-powered tutoring for students preparing for Cambridge O-Level examinations. We offer both free and premium subscription tiers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-3">3. User Accounts</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>You must provide accurate and complete information when creating an account</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials</li>
              <li>You must notify us immediately of any unauthorized use of your account</li>
              <li>One person may only maintain one account</li>
              <li>We reserve the right to suspend or terminate accounts that violate these terms</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-3">4. Subscription Plans</h2>
            <p className="text-muted-foreground leading-relaxed">
              LevelHubAI offers Free and Pro subscription plans. The Free plan provides access to select subjects and features. The Pro plan unlocks all subjects, advanced features, and priority support. Subscription fees are non-refundable unless otherwise stated. We reserve the right to modify pricing with prior notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-3">5. Acceptable Use</h2>
            <p className="text-muted-foreground leading-relaxed">You agree NOT to:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Share your account credentials with others</li>
              <li>Copy, reproduce, or distribute our educational content</li>
              <li>Use automated tools to scrape or access our platform</li>
              <li>Attempt to manipulate XP points, leaderboards, or achievements</li>
              <li>Harass, bully, or send inappropriate messages to other users</li>
              <li>Use the platform for any illegal or unauthorized purpose</li>
              <li>Interfere with or disrupt the platform's functionality</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-3">6. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              All content on LevelHubAI, including but not limited to text, graphics, logos, videos, quizzes, and software, is the property of LevelHubAI or its content suppliers and is protected by intellectual property laws. You may not reproduce, modify, or distribute any content without our prior written consent.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-2">
              "O Level" is a trademark of Cambridge Assessment International Education. LevelHubAI is not affiliated with, endorsed by, or associated with Cambridge Assessment International Education.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-3">7. User-Generated Content</h2>
            <p className="text-muted-foreground leading-relaxed">
              By submitting feedback, comments, or any content to our platform, you grant LevelHubAI a non-exclusive, worldwide, royalty-free license to use, modify, and display such content for the purpose of improving our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-3">8. Disclaimer of Warranties</h2>
            <p className="text-muted-foreground leading-relaxed">
              LevelHubAI is provided "as is" and "as available" without warranties of any kind, either express or implied. We do not guarantee that our platform will be uninterrupted, error-free, or that it will meet your specific requirements. We do not guarantee specific exam results from using our platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-3">9. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              To the maximum extent permitted by law, LevelHubAI shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use the platform, including but not limited to loss of data, exam performance, or academic outcomes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-3">10. Modifications</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify these Terms of Service at any time. Changes will be posted on this page with an updated revision date. Continued use of the platform after changes constitutes acceptance of the modified terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-3">11. Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of Pakistan. Any disputes shall be subject to the exclusive jurisdiction of the courts in Lahore, Pakistan.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-3">12. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              For questions about these Terms, contact us at:
            </p>
            <ul className="list-none text-muted-foreground space-y-1 mt-2">
              <li>Email: {contactInfo.email}</li>
              <li>Phone: {contactInfo.phone}</li>
              {contactInfo.address && <li>Address: {contactInfo.address}</li>}
            </ul>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default TermsOfService;
