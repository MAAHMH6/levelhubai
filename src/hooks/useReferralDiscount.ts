import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useReferralDiscount = () => {
  const { user } = useAuth();
  const [hasReferral, setHasReferral] = useState(false);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchReferralStatus = async () => {
      if (!user) {
        if (mounted) setLoading(false);
        return;
      }

      try {
        // Check if user has an active referral
        const { data: referral } = await supabase
          .from("referrals")
          .select("id")
          .eq("student_id", user.id)
          .maybeSingle();

        if (referral) {
          if (mounted) setHasReferral(true);

          // Fetch discount percent from app_settings
          const { data: setting } = await supabase
            .from("app_settings")
            .select("value")
            .eq("id", "student_referral_discount_percent")
            .maybeSingle();

          if (setting && mounted) {
            setDiscountPercent(Number(setting.value));
          }
        }
      } catch (error) {
        console.error("Failed to fetch referral discount status", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchReferralStatus();

    return () => {
      mounted = false;
    };
  }, [user]);

  return { hasReferral, discountPercent, loading };
};
