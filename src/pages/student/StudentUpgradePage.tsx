import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Crown, 
  Sparkles, 
  Check, 
  Zap, 
  Bot, 
  FileText, 
  PenTool, 
  Brain, 
  Shield, 
  ArrowRight,
  School,
  Flame,
  Award,
  Lock,
  MessageCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { useDetectCountry, useCountryPricing, formatCurrency } from "@/hooks/useCountryPricing";
import { useReferralDiscount } from "@/hooks/useReferralDiscount";
import { useContactInfo } from "@/hooks/useContactInfo";
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';

export const StudentUpgradePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const sub = useSubscription();
  const contactInfo = useContactInfo();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [whatsappModalOpen, setWhatsappModalOpen] = useState(false);

  const { countryCode } = useDetectCountry();
  const { data: countryPrices } = useCountryPricing(countryCode);
  const proPricing = countryPrices?.find(p => p.plan === 'pro');
  
  const { hasReferral, discountPercent } = useReferralDiscount();

  const handleUpgrade = (planKey: 'pro_monthly' | 'pro_annual') => {
    if (!user) {
      navigate('/auth');
      return;
    }
    // Show original WhatsApp upgrade contact modal
    setWhatsappModalOpen(true);
  };

  const handleWhatsAppContact = () => {
    const emailStr = user?.email ? `\n\nMy account email is ${user.email}.` : "";
    const cycleStr = billingCycle === 'annual' ? 'Annual Plan (20% Off)' : 'Monthly Plan';
    const message = `Hello LevelHubAI Team, I would like to upgrade my account to the Pro plan (${cycleStr}).${emailStr}

Please guide me through the upgrade process.`;

    window.open(`https://wa.me/${contactInfo.whatsappPhone}?text=${encodeURIComponent(message)}`, "_blank");
    setWhatsappModalOpen(false);
  };

  return (
    <div className="space-y-10 pb-20 max-w-6xl mx-auto">
      {/* Header Hero */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-xs font-bold text-amber-800 dark:text-amber-300">
          <Crown className="w-3.5 h-3.5 text-amber-500" />
          <span>Cambridge Exam Excellence Plans</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Accelerate Your Cambridge Grades with Pro
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Unlock the complete syllabus for all subjects, unlimited AI Mock Exams, 24/7 AI tutor, and cognitive analytics.
        </p>

        {/* Monthly / Annual Billing Toggle */}
        <div className="pt-4 flex items-center justify-center gap-3">
          <span className={`text-xs font-bold ${billingCycle === 'monthly' ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
            Monthly Billing
          </span>
          <Switch 
            checked={billingCycle === 'annual'} 
            onCheckedChange={(c) => setBillingCycle(c ? 'annual' : 'monthly')} 
          />
          <span className={`text-xs font-bold flex items-center gap-1.5 ${billingCycle === 'annual' ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
            Annual Billing
            <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-none text-[10px] font-extrabold">
              Save 20%
            </Badge>
          </span>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {/* Plan 1: Free Starter */}
        <Card className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <Badge variant="outline" className="text-xs font-bold text-slate-600 border-slate-200 mb-2">
                Starter Tier
              </Badge>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Free Scholar</h3>
              <p className="text-xs text-slate-400 mt-1">Core subjects and preview access.</p>
            </div>

            <div className="pt-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white">$0</span>
              <span className="text-xs text-slate-400"> / forever</span>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-teal-600 shrink-0" />
                <span>3 Free Subjects (Math, Physics, ICT)</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Preview first 5 Units & 5 Lessons for all subjects</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Daily Practice Quizzes</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Friend Challenges & Leaderboard</span>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <Button 
              variant="outline" 
              className="w-full rounded-xl text-xs font-bold h-10 border-slate-200" 
              disabled={!sub.isPro}
            >
              {!sub.isPro ? "Current Plan" : "Downgrade"}
            </Button>
          </div>
        </Card>

        {/* Plan 2: Pro Scholar (Highlighted) */}
        <Card className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-teal-50/50 via-white to-white dark:from-slate-900 dark:to-slate-900 border-2 border-teal-500 shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-4 right-4">
            <Badge className="bg-teal-600 text-white font-extrabold text-[10px] uppercase tracking-wider shadow-xs">
              Most Popular
            </Badge>
          </div>

          <div className="space-y-4">
            <div>
              <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300 text-xs font-bold mb-2 gap-1">
                <Crown className="w-3.5 h-3.5" /> Cambridge Pro
              </Badge>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Pro Scholar</h3>
              <p className="text-xs text-slate-400 mt-1">Full Cambridge mastery for top grades.</p>
            </div>

            <div className="pt-2">
              <span className="text-4xl font-black text-slate-900 dark:text-white">
                {billingCycle === 'annual' 
                  ? formatCurrency(annualMonthlyEquivalent, currency)
                  : formatCurrency(monthlyPrice, currency)
                }
              </span>
              <span className="text-xs text-slate-400"> / month</span>
              {billingCycle === 'annual' && (
                <div className="text-[11px] text-teal-600 font-bold mt-0.5">
                  Billed annually ({formatCurrency(annualMonthlyEquivalent * 12, currency)}/year)
                </div>
              )}
            </div>

            <div className="space-y-3 pt-4 border-t border-teal-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-200 font-medium">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-teal-600 shrink-0" />
                <span><strong>ALL Cambridge Subjects Unlocked</strong> (No limits)</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-teal-600 shrink-0" />
                <span><strong>Unlimited AI Mock Exams</strong> with instant grading</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-teal-600 shrink-0" />
                <span><strong>AI Writing & Grammar Checker</strong> with Cambridge rubrics</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-teal-600 shrink-0" />
                <span><strong>24/7 Contextual Cambridge AI Tutor</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-teal-600 shrink-0" />
                <span><strong>Spider Web Cognitive Radar</strong> & Diagnostic Weakness tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-teal-600 shrink-0" />
                <span><strong>Connected Parent Weekly Reports</strong> & PDF export</span>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <Button
              onClick={() => handleUpgrade(billingCycle === 'annual' ? 'pro_annual' : 'pro_monthly')}
              disabled={loadingCheckout}
              className="w-full rounded-xl text-xs font-black h-11 bg-teal-600 hover:bg-teal-700 text-white shadow-md gap-2"
            >
              <Crown className="w-4 h-4" />
              <span>{sub.isPro ? "Manage Pro Subscription" : "Upgrade to Cambridge Pro"}</span>
            </Button>
          </div>
        </Card>

        {/* Plan 3: School / Institutional */}
        <Card className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <Badge variant="outline" className="text-xs font-bold text-slate-600 border-slate-200 mb-2">
                Institutions
              </Badge>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">School License</h3>
              <p className="text-xs text-slate-400 mt-1">For schools, academies & tuition centers.</p>
            </div>

            <div className="pt-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white">Custom</span>
              <span className="text-xs text-slate-400"> / school</span>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Bulk student seats & cohort progress</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Teacher & Administrator Portal</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Custom Mock Exam Blueprints</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Dedicated Cambridge Academic Specialist</span>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <Button
              onClick={() => window.location.href = "mailto:partners@levelhubai.com?subject=Cambridge%20School%20License%20Inquiry"}
              variant="outline"
              className="w-full rounded-xl text-xs font-bold h-10 border-slate-200 hover:border-teal-500"
            >
              <School className="w-4 h-4 mr-2" />
              <span>Contact Sales</span>
            </Button>
          </div>
        </Card>
      </div>

      {/* Trust & Guarantee Banner */}
      <div className="p-6 rounded-3xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-teal-600 shrink-0" />
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">100% Cambridge Syllabus Guarantee</h4>
            <p className="text-xs text-slate-500">Cancel anytime with 1 click. Zero lock-in. Powered by secure encrypted billing.</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <span>🔒 SSL Encrypted</span>
          <span>•</span>
          <span>⚡ Instant Activation</span>
        </div>
      </div>

      {/* WhatsApp Upgrade Modal matching original process */}
      <Dialog open={whatsappModalOpen} onOpenChange={setWhatsappModalOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6 bg-white dark:bg-slate-900 border-teal-500/30 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-500" />
              <span>Upgrade to Cambridge Pro</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-3">
            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 p-4 rounded-2xl">
              <h4 className="font-semibold text-amber-900 dark:text-amber-300 mb-1 flex items-center gap-2 text-sm">
                <Lock className="w-4 h-4 text-amber-600" />
                Temporary Upgrade Process
              </h4>
              <p className="text-xs text-amber-800/90 dark:text-amber-400 leading-relaxed">
                Online card payments are undergoing system maintenance. Upgrades and access activations are processed directly via WhatsApp support with instant setup.
              </p>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Selected Plan:</span>
                <span className="font-bold text-slate-900 dark:text-white">LevelHubAI Pro Scholar</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Billing:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {billingCycle === 'annual' ? 'Annual (20% Off)' : 'Monthly'}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs border-t pt-2 border-slate-200 dark:border-slate-700">
                <span className="text-slate-500">Price:</span>
                <div className="text-right">
                  <span className="font-black text-sm text-teal-600 dark:text-teal-400">Rs 5,000 / month</span>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={handleWhatsAppContact}
              className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold flex items-center justify-center gap-2 h-12 rounded-xl text-sm shadow-md"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Contact Us on WhatsApp to Upgrade</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
