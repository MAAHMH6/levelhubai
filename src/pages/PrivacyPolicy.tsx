import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Helmet } from "react-helmet-async";
import { useContactInfo } from "@/hooks/useContactInfo";

const PrivacyPolicy = () => {
  const contactInfo = useContactInfo();
  return (
    <main className="min-h-screen bg-background">
      <Helmet>
        <title>Privacy Policy | LevelHubAI - O-Level Exam Prep Platform</title>
        <meta name="description" content="LevelHubAI Privacy Policy. Learn how we collect, use, and protect your personal information on Pakistan's leading O-Level exam preparation platform." />
        <link rel="canonical" href={`${window.location.origin}/privacy-policy`} />
      </Helmet>
      <Navbar />
      <div className="container mx-auto px-4 py-24 max-w-4xl">
        <h1 className="font-display text-4xl font-bold text-foreground mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: April 6, 2026</p>

        <div className="prose prose-lg dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-3">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              Welcome to LevelHubAI ("we," "our," or "us"), a product of Cybertrends SMC PVT LTD, accessible at olevel.com.pk. We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-3">2. Information We Collect</h2>
            <h3 className="text-xl font-medium text-foreground mt-4 mb-2">2.1 Personal Information</h3>
            <p className="text-muted-foreground leading-relaxed">When you register for an account, we may collect:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Full name and display name</li>
              <li>Email address</li>
              <li>School name and grade level</li>
              <li>Parent/guardian email (for students under 18)</li>
              <li>Profile picture (optional)</li>
            </ul>

            <h3 className="text-xl font-medium text-foreground mt-4 mb-2">2.2 Usage Data</h3>
            <p className="text-muted-foreground leading-relaxed">We automatically collect:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Quiz and lesson progress data</li>
              <li>XP points, streak data, and achievements</li>
              <li>Device information and browser type</li>
              <li>IP address and general location</li>
              <li>Pages visited and time spent on the platform</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-3">3. How We Use Your Information</h2>
            <p className="text-muted-foreground leading-relaxed">We use the collected information to:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Provide and maintain our educational platform</li>
              <li>Personalize your learning experience</li>
              <li>Track your academic progress and generate reports</li>
              <li>Send notifications about new lessons, units, and features</li>
              <li>Display leaderboards and achievement badges</li>
              <li>Improve our platform and develop new features</li>
              <li>Communicate with you about your account</li>
              <li>Serve relevant advertisements through Google AdSense</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-3">4. Advertising</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use Google AdSense to display advertisements on our platform. Google AdSense may use cookies and similar technologies to serve ads based on your prior visits to our website or other websites. Google's use of advertising cookies enables it and its partners to serve ads based on your visit to our site and/or other sites on the Internet.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-2">
              You may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Google Ads Settings</a>. For more information about how Google uses data, visit <a href="https://policies.google.com/technologies/partner-sites" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Google's Privacy & Terms</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-3">5. Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use cookies and similar tracking technologies to track activity on our platform and hold certain information. Cookies are files with a small amount of data that are sent to your browser from a website and stored on your device. For more details, see our <a href="/cookie-policy" className="text-primary hover:underline">Cookie Policy</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-3">6. Data Sharing</h2>
            <p className="text-muted-foreground leading-relaxed">We do not sell your personal information. We may share your data with:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li><strong>Service Providers:</strong> Supabase (database hosting), Google (analytics and advertising)</li>
              <li><strong>Schools:</strong> If you join a school group, your school administrator may see your progress</li>
              <li><strong>Leaderboards:</strong> Your display name, XP, and level are visible to other users</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-3">7. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement industry-standard security measures to protect your personal information, including encryption in transit (HTTPS), secure database hosting with Supabase, and row-level security policies. However, no method of electronic transmission or storage is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-3">8. Children's Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our platform is designed for O-Level students, who may be under 18 years of age. We collect only the minimum information necessary to provide our educational services. We encourage parents and guardians to monitor their children's online activity. Parents can provide their email during registration for oversight.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-3">9. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed">You have the right to:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your account and data</li>
              <li>Opt out of marketing communications</li>
              <li>Opt out of personalized advertising</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-3">10. Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-3">11. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions about this Privacy Policy, please contact us at:
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

export default PrivacyPolicy;
