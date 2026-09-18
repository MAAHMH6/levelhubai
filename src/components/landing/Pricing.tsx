import { Button } from "@/components/ui/button";
import { Check, Sparkles, Crown, Building2, Lock, MessageCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SchoolContactDialog } from "./SchoolContactDialog";
import { useDetectCountry, useCountryPricing, formatCurrency } from "@/hooks/useCountryPricing";
import { useReferralDiscount } from "@/hooks/useReferralDiscount";
import { useContactInfo } from "@/hooks/useContactInfo";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const plans = [
  {
    id: "free",
    name: "Free",
    price: "0",
    description: "Perfect for trying out LevelHubAI",
    icon: Sparkles,
    features: [
      "Access to 3 subjects (Math, Physics, ICT)",
      "Basic quizzes (20 per day)",
      "Community leaderboards",
      "Basic progress tracking",
    ],
    cta: "Start Free",
    variant: "hero" as const,
    popular: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "5,000",
    description: "For serious exam preparation",
    icon: Crown,
    features: [
      "All subjects unlocked",
      "Unlimited practice questions",
      "Full past paper library",
      "AI-powered tutoring",
      "Detailed analytics",
      "Ad-free experience",
      "Priority support",
    ],
    cta: "Upgrade to Pro",
    variant: "outline" as const,
    popular: true,
  },
  {
    id: "school",
    name: "School",
    price: "Custom",
    description: "For schools & academies",
    icon: Building2,
    features: [
      "Everything in Pro",
      "Teacher dashboard",
      "Class management",
      "Custom assignments",
      "Bulk student accounts",
      "School analytics",
      "Dedicated support",
      "API access",
    ],
    cta: "Contact Sales",
    variant: "outline" as const,
    popular: false,
  },
];

export const Pricing = () => {
  const { user } = useAuth();
  const nav = useNavigate();
  const [schoolOpen, setSchoolOpen] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  
  const contactInfo = useContactInfo();

  const { countryCode, isDetecting } = useDetectCountry();
  const { data: countryPrices, isLoading: isPricesLoading } = useCountryPricing(countryCode);

  const pkPrice = countryPrices?.find(p => p.plan === 'pro' && p.country_code === 'PK');
  const proPricing = countryPrices?.find(p => p.plan === 'pro');
  
  const { hasReferral, discountPercent, loading: discountLoading } = useReferralDiscount();
  
  const displayPrice = proPricing ? formatCurrency(proPricing.monthly_price, proPricing.currency) : "—";
  const displayCurrency = proPricing?.currency || "";

  const discountedPrice = proPricing ? proPricing.monthly_price * (1 - discountPercent / 100) : 0;
  const displayDiscountedPrice = proPricing ? formatCurrency(discountedPrice, proPricing.currency) : "—";

  const handleClick = async (id: string) => {
    if (id === "free") { nav("/auth"); return; }
    if (id === "school") { setSchoolOpen(true); return; }
    if (id === "pro") {

      // TEMPORARY MANUAL UPGRADE FLOW
      setUpgradeModalOpen(true);
      
      /* 
      // --- FUTURE AUTOMATED PAYMENT GATEWAY INTEGRATION ---
      // Keeping this intact so it can be restored once the payment gateway is live.
      
      setLoadingId("pro");
      try {
        if (countryCode === 'PK') {
          // Route to Alfa Payment Gateway
          const { data, error } = await supabase.functions.invoke("alfa-checkout");
          if (error) throw error;
          if (data?.url) {
            window.location.href = data.url;
          } else if (data?.alfaForm) {
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = data.alfaForm.action;
            for (const [key, value] of Object.entries(data.alfaForm.fields)) {
              const input = document.createElement('input');
              input.type = 'hidden';
              input.name = key;
              input.value = value as string;
              form.appendChild(input);
            }
            document.body.appendChild(form);
            form.submit();
          } else {
            toast.error(data?.error ?? "Checkout unavailable");
          }
        } else {
          // Route to Paddle Checkout
          const priceId = proPricing?.paddle_price_id;
          const { data, error } = await supabase.functions.invoke("paddle-checkout", {
            body: { price_id: priceId }
          });
          if (error) throw error;
          if (data?.url) window.location.href = data.url;
          else toast.error(data?.error ?? "Checkout unavailable");
        }
      } catch (e: any) { 
        toast.error(e.message ?? "Failed to start checkout"); 
      } finally { 
        setLoadingId(null); 
      }
      */
    }
  };

  const handleWhatsAppClick = () => {
    const emailStr = user?.email ? `\n\nMy account email is ${user.email}.` : "";
    const message = `Hello LevelHubAI Team, I would like to upgrade my account to the Pro plan.${emailStr}

Please guide me through the upgrade process.`;

    window.open(`https://wa.me/${contactInfo.whatsappPhone}?text=${encodeURIComponent(message)}`, "_blank");
    setUpgradeModalOpen(false);
  };

  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 mb-6">
            <Crown className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Simple Pricing</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Choose Your <span className="text-gradient-primary">Plan</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start free and upgrade when you're ready. No hidden fees, cancel anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`relative bg-card rounded-2xl border ${
                plan.popular ? "border-primary shadow-glow scale-105 z-10" : "border-border/50"
              } overflow-hidden`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-primary text-primary-foreground text-center py-2 text-sm font-medium">
                  Most Popular
                </div>
              )}

              <div className={`p-8 ${plan.popular ? "pt-14" : ""}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 ${plan.popular ? "bg-gradient-primary" : "bg-secondary"} rounded-xl flex items-center justify-center`}>
                    <plan.icon className={`w-6 h-6 ${plan.popular ? "text-primary-foreground" : "text-foreground"}`} />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-semibold">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </div>
                </div>

                <div className="mb-6">
                  {plan.id === "pro" && hasReferral && (
                    <div className="text-sm font-medium text-primary mb-1">
                      Teacher Referral Applied (-{discountPercent}%)
                    </div>
                  )}
                  <span className="font-display text-4xl font-bold">
                    {plan.price === "Custom" 
                      ? "Custom" 
                      : plan.id === "pro" 
                        ? (isDetecting || isPricesLoading || discountLoading ? "..." : (hasReferral ? displayDiscountedPrice : displayPrice))
                        : plan.price === "0" ? "Free" : plan.price}
                  </span>
                  
                  {plan.id === "pro" && hasReferral && proPricing && (
                    <span className="text-muted-foreground line-through ml-2">
                      {displayPrice}
                    </span>
                  )}
                  {plan.price !== "Custom" && plan.price !== "0" && (
                    <span className="text-muted-foreground ml-1">/month</span>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-success" />
                      </div>
                      <span className="text-sm text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.variant}
                  size="lg"
                  className="w-full"
                  onClick={() => handleClick(plan.id)}
                  disabled={loadingId === plan.id}
                >
                  {loadingId === plan.id ? "Redirecting…" : plan.cta}
                  <Sparkles className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            💯 30-day money-back guarantee • No questions asked
          </p>
        </div>
      </div>
      <SchoolContactDialog open={schoolOpen} onOpenChange={setSchoolOpen} />
      
      {/* Temporary WhatsApp Upgrade Modal */}
      <Dialog open={upgradeModalOpen} onOpenChange={setUpgradeModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Upgrade Your LevelHubAI Plan</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-warning/10 border border-warning/20 p-4 rounded-lg">
              <h4 className="font-semibold text-warning mb-1 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Temporary Upgrade Process
              </h4>
              <p className="text-sm text-warning/90">
                Online payments are coming soon. Until our payment gateway is available, upgrades are processed manually through WhatsApp.
              </p>
            </div>
            
            <div className="bg-secondary/30 p-4 rounded-lg border flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Plan:</span>
                <span className="font-bold">Pro</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Price:</span>
                <span className="font-bold text-primary">
                  {hasReferral ? displayDiscountedPrice : displayPrice} {displayCurrency && <span className="text-sm text-muted-foreground">/ month</span>}
                </span>
              </div>
            </div>
            
            <Button 
              onClick={handleWhatsAppClick}
              className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white flex gap-2 h-12 text-md"
            >
              <MessageCircle className="w-5 h-5" />
              Contact Us on WhatsApp
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};
