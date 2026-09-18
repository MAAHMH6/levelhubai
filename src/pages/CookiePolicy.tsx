import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Helmet } from "react-helmet-async";
import { useContactInfo } from "@/hooks/useContactInfo";

const CookiePolicy = () => {
  const contactInfo = useContactInfo();
  return (
    <main className="min-h-screen bg-background">
      <Helmet>
        <title>Cookie Policy | LevelHubAI - O-Level Exam Prep Platform</title>
        <meta name="description" content="LevelHubAI Cookie Policy. Learn how we use cookies and similar technologies on our O-Level exam preparation platform." />
        <link rel="canonical" href={`${window.location.origin}/cookie-policy`} />
      </Helmet>
      <Navbar />
      <div className="container mx-auto px-4 py-24 max-w-4xl">
        <h1 className="font-display text-4xl font-bold text-foreground mb-2">Cookie Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: April 6, 2026</p>

        <div className="prose prose-lg dark:prose-invert max-w-none space-y-6">
          <p className="text-muted-foreground leading-relaxed">
            Welcome to LevelHubAI ("we," "our," or "us"), a product of Cybertrends SMC PVT LTD, accessible at olevel.com.pk. This Cookie Policy explains how we use cookies and similar technologies to provide, customize, evaluate, improve, and protect our services.
          </p>
          <section>
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-3">1. What Are Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              Cookies are small text files that are placed on your device when you visit a website. They are widely used to make websites work more efficiently and to provide information to the website owners. Cookies help us deliver a better and more personalized learning experience.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-3">2. Types of Cookies We Use</h2>

            <h3 className="text-xl font-medium text-foreground mt-4 mb-2">2.1 Essential Cookies</h3>
            <p className="text-muted-foreground leading-relaxed">
              These cookies are necessary for the platform to function properly. They enable core features like user authentication, session management, and security. Without these cookies, the platform cannot operate.
            </p>

            <h3 className="text-xl font-medium text-foreground mt-4 mb-2">2.2 Functional Cookies</h3>
            <p className="text-muted-foreground leading-relaxed">
              These cookies remember your preferences such as language settings, theme (light/dark mode), and display preferences to provide a more personalized experience.
            </p>

            <h3 className="text-xl font-medium text-foreground mt-4 mb-2">2.3 Analytics Cookies</h3>
            <p className="text-muted-foreground leading-relaxed">
              We use analytics cookies to understand how visitors interact with our platform. This helps us improve our platform's performance and user experience. We may use services like Google Analytics for this purpose.
            </p>

            <h3 className="text-xl font-medium text-foreground mt-4 mb-2">2.4 Advertising Cookies</h3>
            <p className="text-muted-foreground leading-relaxed">
              We use Google AdSense to display advertisements. Google AdSense uses cookies to serve ads based on your prior visits to our website or other websites on the Internet. These cookies allow Google and its partners to serve relevant advertisements to you.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-3">3. Third-Party Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              Some cookies are placed by third-party services that appear on our pages. We use the following third-party services:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Google AdSense:</strong> For displaying relevant advertisements</li>
              <li><strong>Google Analytics:</strong> For understanding website usage patterns</li>
              <li><strong>Supabase:</strong> For authentication and session management</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-3">4. Managing Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              You can control and manage cookies in your browser settings. Most browsers allow you to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>View what cookies are stored and delete them individually</li>
              <li>Block third-party cookies</li>
              <li>Block cookies from specific sites</li>
              <li>Block all cookies</li>
              <li>Delete all cookies when you close your browser</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-2">
              Please note that blocking certain cookies may affect the functionality of our platform and degrade your learning experience.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-3">5. Google AdSense & Personalized Ads</h2>
            <p className="text-muted-foreground leading-relaxed">
              Google uses cookies to serve ads on our platform. You can opt out of personalized advertising by visiting{" "}
              <a href="https://www.google.com/settings/ads" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                Google Ads Settings
              </a>
              . You can also visit{" "}
              <a href="https://www.aboutads.info/choices/" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                www.aboutads.info
              </a>{" "}
              to opt out of third-party vendor cookies for personalized advertising.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-3">6. Updates to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Cookie Policy from time to time. Any changes will be posted on this page with an updated revision date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-3">7. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions about our use of cookies, contact us at:
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

export default CookiePolicy;
