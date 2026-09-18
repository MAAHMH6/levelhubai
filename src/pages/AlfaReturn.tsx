import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";
import { Loader2 } from "lucide-react";

export default function AlfaReturn() {
  const [searchParams] = useSearchParams();
  const nav = useNavigate();
  const sub = useSubscription();
  const [status, setStatus] = useState("Processing your payment...");

  // Alfa returns the Transaction Status via IPN behind the scenes,
  // and redirects the user here. We just wait for the websocket
  // to update the user's subscription to Pro.

  useEffect(() => {
    // If the subscription is already active and Pro, we can redirect immediately
    if (sub.isPro && sub.isActive) {
      setStatus("Payment successful! Redirecting...");
      setTimeout(() => nav("/dashboard"), 1500);
    }
  }, [sub, nav]);

  useEffect(() => {
    // Timeout fallback just in case IPN fails or is slow
    const t = setTimeout(() => {
      if (!sub.isPro) {
        setStatus("Payment is taking longer than expected to process. Please check your billing dashboard in a few minutes.");
        setTimeout(() => nav("/billing"), 5000);
      }
    }, 15000); // 15 seconds max wait

    return () => clearTimeout(t);
  }, [sub.isPro, nav]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4 max-w-sm px-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-6" />
        <h1 className="font-display text-2xl font-bold">Please Wait</h1>
        <p className="text-muted-foreground">{status}</p>
        <p className="text-xs text-muted-foreground mt-8">Do not close this page or press back.</p>
      </div>
    </div>
  );
}
