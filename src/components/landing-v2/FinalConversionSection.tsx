import React from "react";
import { Sparkles, ArrowRight, MessageCircle, Calendar, HelpCircle, CheckCircle2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface FinalConversionSectionProps {
  onOpenWhatsApp?: () => void;
}

export function FinalConversionSection({ onOpenWhatsApp }: FinalConversionSectionProps) {
  const navigate = useNavigate();

  return (
    <section className="py-28 relative overflow-hidden bg-gradient-to-b from-background via-primary/5 to-background border-t border-border/60">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-primary/15 via-purple-500/10 to-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 max-w-5xl relative z-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 mb-8 animate-pulse">
          <Sparkles className="w-3.5 h-3.5 fill-primary" />
          <span>Start Your Transformation Today</span>
        </div>

        <h2 className="text-4xl sm:text-6xl font-black tracking-tight max-w-4xl mx-auto leading-tight mb-6">
          Ready to Transform Your{" "}
          <span className="bg-gradient-to-r from-primary via-purple-600 to-pink-500 bg-clip-text text-transparent">
            Academic Journey?
          </span>
        </h2>

        <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Join 500+ ambitious students worldwide who study smarter, cut revision stress, and unlock top Cambridge grades with LevelHubAI.
        </p>

        {/* 4 Conversion CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 max-w-3xl mx-auto mb-12">
          {/* 1. Start Your Transformation */}
          <Button
            size="lg"
            onClick={() => navigate("/register")}
            className="h-14 px-8 text-base font-bold shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:scale-105 transition-all bg-gradient-to-r from-primary to-purple-600 text-white border-0"
          >
            Start Your Transformation
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>


          {/* 3. Start a Quiz */}
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate("/quiz")}
            className="h-14 px-7 text-base font-bold border-border/80 hover:border-primary/50 transition-all"
          >
            <HelpCircle className="w-4 h-4 mr-2 text-primary" />
            Start a Quiz
          </Button>

          {/* 4. WhatsApp Us */}
          {onOpenWhatsApp && (
            <Button
              size="lg"
              variant="outline"
              onClick={onOpenWhatsApp}
              className="h-14 px-7 text-base font-bold border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-all"
            >
              <MessageCircle className="w-4 h-4 mr-2 text-emerald-500" />
              WhatsApp Us
            </Button>
          )}
        </div>

        {/* Assurance Pills */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-muted-foreground font-medium pt-4 border-t border-border/40 max-w-2xl mx-auto">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>No credit card required</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Instant syllabus access</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Parent dashboard included</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-primary" />
            <span>100% Cambridge aligned</span>
          </div>
        </div>
      </div>
    </section>
  );
}
