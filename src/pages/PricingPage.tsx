import React, { useState } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Pricing } from "@/components/landing/Pricing";
import { TrustValueSection } from "@/components/landing-v2/TrustValueSection";
import { FinalConversionSection } from "@/components/landing-v2/FinalConversionSection";
import { FreeStudyToolsModal } from "@/components/landing-v2/FreeStudyToolsModal";
import { Sparkles, ShieldCheck, CheckCircle2, MessageCircle, HelpCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const PricingPage = () => {
  const [toolsOpen, setToolsOpen] = useState(false);

  const handleOpenWhatsApp = () => {
    const text = encodeURIComponent(
      "Hello LevelHubAI! I have questions regarding pricing plans and family bundles for Cambridge exam preparation."
    );
    window.open(`https://wa.me/923098444501?text=${text}`, "_blank");
  };

  const handleOpenTools = () => {
    setToolsOpen(true);
  };

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      {/* Modern Hero Section */}
      <section className="pt-32 pb-12 bg-gradient-to-b from-primary/10 via-background to-background relative overflow-hidden text-center">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 max-w-5xl relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Transparent Investment for Cambridge Success</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
            World-Class Cambridge Prep,{" "}
            <span className="bg-gradient-to-r from-primary via-purple-600 to-pink-500 bg-clip-text text-transparent">
              Fraction of the Cost
            </span>
          </h1>

          <p className="text-muted-foreground text-base sm:text-xl max-w-3xl mx-auto leading-relaxed">
            Get unlimited 24/7 AI method marking, 10+ years of topical past papers, and video magnet lessons for less than the cost of a single hourly private tutor.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Button
              asChild
              size="lg"
              className="font-bold shadow-lg shadow-primary/25 h-12 px-8"
            >
              <Link to="/auth">
                Get Started Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleOpenWhatsApp}
              className="h-12 px-8 font-semibold border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
            >
              <MessageCircle className="w-4 h-4 mr-2 text-emerald-500" />
              Ask About Family Bundles
            </Button>
          </div>
        </div>
      </section>

      {/* Core Pricing Plans Component */}
      <div className="pb-16">
        <Pricing />
      </div>

      {/* Serious Value & Comparison Section */}
      <TrustValueSection
        onOpenWhatsApp={handleOpenWhatsApp}
      />

      {/* Final Conversion Section */}
      <FinalConversionSection
        onOpenWhatsApp={handleOpenWhatsApp}
      />

      <Footer hideCta={true} />

      {/* Global Interactive Modals */}
      <FreeStudyToolsModal open={toolsOpen} onOpenChange={setToolsOpen} />
    </main>
  );
};

export default PricingPage;
