import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Sparkles, ArrowLeft, ExternalLink } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { format } from "date-fns";
import { useDetectCountry, useCountryPricing, formatCurrency } from "@/hooks/useCountryPricing";
import { useReferralDiscount } from "@/hooks/useReferralDiscount";

export default function Billing() {
  const { user, loading: authLoading } = useAuth();
  const sub = useSubscription();
  const nav = useNavigate();
  const [payments, setPayments] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) nav("/auth");
  }, [user, authLoading, nav]);

  useEffect(() => {
    if (!user) return;
    supabase.from("payments").select("*").eq("user_id", user.id).order("paid_at", { ascending: false })
      .then(({ data }) => setPayments(data ?? []));
  }, [user, sub.plan]);

  const { countryCode } = useDetectCountry();
  const { data: countryPrices } = useCountryPricing(countryCode);
  const proPricing = countryPrices?.find(p => p.plan === 'pro');
  
  const { hasReferral, discountPercent, loading: discountLoading } = useReferralDiscount();
  const discountedPrice = proPricing ? proPricing.monthly_price * (1 - discountPercent / 100) : 0;
  
  const displayPrice = proPricing ? formatCurrency(proPricing.monthly_price, proPricing.currency) : "—";
  const displayDiscountedPrice = proPricing ? formatCurrency(discountedPrice, proPricing.currency) : "—";

  const upgrade = async () => {
    nav("/pricing");
  };
  const cancel = async () => {
    if (!confirm("Cancel your Pro subscription at the end of the current period?")) return;
    setBusy(true);
    try {
      const { error } = await supabase.functions.invoke("cancel-subscription");
      if (error) throw error;
      toast.success("Cancellation scheduled");
    } catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Back to dashboard
      </Link>
      <h1 className="font-display text-3xl font-bold">Billing</h1>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-primary" />
              Current plan: <span className="capitalize">{sub.plan}</span>
            </CardTitle>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant={sub.isActive ? "default" : "secondary"}>{sub.status}</Badge>
              {sub.currentPeriodEnd && (
                <span className="text-sm text-muted-foreground">
                  Renews {format(new Date(sub.currentPeriodEnd), "PPP")}
                </span>
              )}
              {sub.cancelAt && (
                <span className="text-sm text-warning">
                  Cancels {format(new Date(sub.cancelAt), "PPP")}
                </span>
              )}
            </div>
          </div>
          <div>
            {sub.isPro ? (
              <Button variant="outline" onClick={cancel} disabled={busy || !!sub.cancelAt}>
                {sub.cancelAt ? "Cancellation scheduled" : "Cancel"}
              </Button>
            ) : (
              <div className="flex flex-col items-end gap-1">
                {hasReferral && !discountLoading && (
                  <span className="text-xs text-primary font-medium bg-primary/10 px-2 py-0.5 rounded">
                    Referral Discount Applied: {displayDiscountedPrice}/mo
                  </span>
                )}
                <Button onClick={upgrade} disabled={busy}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Upgrade to Pro {hasReferral ? `(${displayDiscountedPrice})` : `(${displayPrice})`}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader><CardTitle>Payment history</CardTitle></CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payments yet.</p>
          ) : (
            <div className="divide-y">
              {payments.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-3">
                  <div>
                    <div className="font-medium">{p.currency} {(Number(p.amount_cents) / 100).toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">
                      {p.paid_at ? format(new Date(p.paid_at), "PPp") : "—"} · {p.invoice_number ?? p.provider_transaction_id}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={p.status === "succeeded" ? "default" : "secondary"}>{p.status}</Badge>
                    {p.receipt_url && (
                      <a href={p.receipt_url} target="_blank" rel="noreferrer" className="text-sm text-primary inline-flex items-center gap-1">
                        Receipt <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
