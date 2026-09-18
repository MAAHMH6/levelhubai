import { Helmet } from "react-helmet-async";
import { useContactInfo } from "@/hooks/useContactInfo";

export function BaseSeo() {
  const baseUrl = window.location.origin;
  const contactInfo = useContactInfo();

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "LevelHubAI",
    "alternateName": "LevelHub AI",
    "description": "AI-powered Cambridge O Level, IGCSE and A Level exam preparation platform with past papers, AI-generated notes and quizzes, and a personal AI tutor.",
    "url": baseUrl,
    "educationalCredentialAwarded": ["Cambridge O Level", "Cambridge IGCSE", "Cambridge A Level"],
    "teaches": ["Mathematics", "Physics", "ICT", "Chemistry", "Biology", "English", "Pakistan Studies", "Islamiyat", "Urdu", "Accounting", "Computer Science", "Economics", "Business", "Psychology"],
    "sameAs": [],
    "contactPoint": {
      "@type": "ContactPoint",
      "email": contactInfo.email,
      "contactType": "customer support",
      "availableLanguage": ["English", "Urdu"]
    }
  };

  const webSiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "LevelHubAI",
    "url": baseUrl,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${baseUrl}/subjects/{search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <Helmet>
      <link rel="canonical" href={`${baseUrl}${window.location.pathname === '/' ? '' : window.location.pathname}`} />
      <meta property="og:url" content={`${baseUrl}${window.location.pathname === '/' ? '' : window.location.pathname}`} />
      
      {/* International SEO Tags */}
      <link rel="alternate" hreflang="en-PK" href={`https://olevel.com.pk${window.location.pathname}`} />
      <link rel="alternate" hreflang="en" href={`https://igcse.co${window.location.pathname}`} />
      <link rel="alternate" hreflang="x-default" href={`https://igcse.co${window.location.pathname}`} />

      <script type="application/ld+json">{JSON.stringify(orgSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(webSiteSchema)}</script>
    </Helmet>
  );
}
