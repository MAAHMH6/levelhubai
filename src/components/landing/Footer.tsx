import { useState } from "react";
import { Sparkles, Facebook, Instagram, Twitter, Youtube, Linkedin, Mail, Phone, MapPin, MessageCircle, Globe, Music2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useBranding } from "@/hooks/useBranding";
import { useEnabledSocialLinks } from "@/hooks/useSocialLinks";
import { useContactInfo } from "@/hooks/useContactInfo";

const socialIcon: Record<string, any> = {
  facebook: Facebook,
  instagram: Instagram,
  linkedin: Linkedin,
  youtube: Youtube,
  x: Twitter,
  tiktok: Music2,
  whatsapp: MessageCircle,
  discord: MessageCircle,
  email: Mail,
  website: Globe,
};

const footerLinks = {
  product: [
    { name: "Features", href: "#" },
    { name: "Subjects", href: "#" },
    { name: "Pricing", href: "#" },
    { name: "Mobile App", href: "#" },
  ],
  resources: [
    { name: "Past Papers", href: "#" },
    { name: "Study Guides", href: "#" },
    { name: "Blog", href: "/blog" },
    { name: "Help Center", href: "#" },
  ],
  company: [
    { name: "About Us", href: "#" },
    { name: "Careers", href: "#" },
    { name: "Press", href: "#" },
    { name: "Contact", href: "#" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Terms of Service", href: "/terms-of-service" },
    { name: "Cookie Policy", href: "/cookie-policy" },
    { name: "Do Not Sell My Info", href: "/cookie-policy" },
  ],
};

interface FooterProps {
  hideCta?: boolean;
}

export const Footer = ({ hideCta = false }: FooterProps) => {
  const [logoError, setLogoError] = useState(false);
  const branding = useBranding();
  const { data: socials = [] } = useEnabledSocialLinks();
  const contactInfo = useContactInfo();
  return (
    <footer className="bg-foreground text-background">
      {/* CTA Section */}
      {!hideCta && (
        <div className="border-b border-background/10">
        <div className="container mx-auto px-4 py-16">
          <div className="bg-gradient-hero rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"}}/>
            <div className="relative z-10">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
                Ready to Level Up Your Learning?
              </h2>
              <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8">
                Join 50,000+ students already acing their exams with LevelHubAI. Start your free trial today.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button variant="accent" size="xl" asChild>
                  <Link to="/auth">
                    Start Learning Free
                    <Sparkles className="w-5 h-5" />
                  </Link>
                </Button>
                <Button variant="glass" size="xl" className="bg-white/10 text-white border-white/20 hover:bg-white/20" asChild>
                  <a
                    href={`https://wa.me/${contactInfo.whatsappPhone}?text=Hi%20Level%20Hub%20AI%2C%20I%27d%20like%20to%20book%20a%20demo`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Book a Demo on WhatsApp
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              {branding.logo_url && !logoError ? (
                <img 
                  src={branding.logo_url} 
                  alt={branding.brand_name} 
                  className="w-10 h-10 shrink-0 rounded-xl object-cover" 
                  onError={() => setLogoError(true)}
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-primary-foreground" />
                </div>
              )}
              <span className="font-display text-2xl font-bold text-background">{branding.brand_name}</span>
            </div>
            <p className="text-background/60 mb-6 max-w-sm">
              The AI-powered Cambridge O Level, IGCSE & A Level learning platform. Study smarter with AI notes, quizzes, past papers, and a personal AI tutor.
            </p>
            <div className="flex flex-wrap gap-3">
              {socials.filter(s => s.key !== 'whatsapp').map((s) => {
                const Icon = socialIcon[s.key] ?? Globe;
                const href = s.key === "email" ? `mailto:${s.url}` : s.url!;
                return (
                  <a
                    key={s.key}
                    href={href}
                    target={s.key === "email" ? undefined : "_blank"}
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display font-semibold mb-4">Product</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-background/60 hover:text-background transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4">Resources</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-background/60 hover:text-background transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-background/60 hover:text-background transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-background/60">
                <Mail className="w-4 h-4" />
                <span>{contactInfo.email}</span>
              </li>
              <li className="flex items-center gap-2 text-background/60">
                <Phone className="w-4 h-4" />
                <span>{contactInfo.phone}</span>
              </li>
              {contactInfo.address && (
                <li className="flex items-start gap-2 text-background/60">
                  <MapPin className="w-4 h-4 mt-1" />
                  <span>{contactInfo.address}</span>
                </li>
              )}
            </ul>
            <Button
              asChild
              className="mt-4 w-full bg-[#25D366] hover:bg-[#20b858] text-white border-0"
            >
              <a
                href={`https://wa.me/${contactInfo.whatsappPhone}?text=Hi%20Level%20Hub%20AI%20Support`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp Support
              </a>
            </Button>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-12 pt-8 border-t border-background/10">
          <p className="text-background/40 text-xs leading-relaxed max-w-4xl mx-auto text-center mb-6">
            LevelHubAI is an independent AI-powered learning platform that provides study tools and resources for students preparing for Cambridge O Level, IGCSE, and A Level examinations. It is not affiliated with, endorsed by, or associated with Cambridge Assessment International Education. "O Level", "IGCSE", and "A Level" are trademarks of Cambridge.
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-background/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-background/60 text-sm">
            {branding.footer_copyright.replace("{year}", String(new Date().getFullYear()))}
          </p>
          <div className="flex gap-6">
            {footerLinks.legal.map((link) => (
              <a key={link.name} href={link.href} className="text-background/60 text-sm hover:text-background transition-colors">
                {link.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
