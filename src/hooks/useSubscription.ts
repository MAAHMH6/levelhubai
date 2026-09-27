import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { adminDataStore } from "@/lib/adminDataStore";

export type PlanTier = "free" | "pro" | "school";
export type SubStatus = "active" | "trialing" | "past_due" | "cancelled" | "expired" | "pending";

export interface SubscriptionState {
  plan: PlanTier;
  status: SubStatus;
  isPro: boolean;
  isSchool: boolean;
  isActive: boolean;
  currentPeriodEnd: string | null;
  cancelAt: string | null;
  raw: any | null;
}

const FREE_STATE: SubscriptionState = {
  plan: "free",
  status: "active",
  isPro: false,
  isSchool: false,
  isActive: true,
  currentPeriodEnd: null,
  cancelAt: null,
  raw: null,
};

export function useSubscription() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const q = useQuery({
    queryKey: ["subscription", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<SubscriptionState> => {
      if (!user) return FREE_STATE;

      // 1. Check if admin explicitly assigned or modified role/subscription in Admin Panel
      const adminSub = adminDataStore.getSubscription(user.id);
      if (adminSub) {
        if (adminSub.plan === 'free') {
          return FREE_STATE;
        }
        return {
          plan: adminSub.plan,
          status: (adminSub.status as SubStatus) || 'active',
          isPro: adminSub.plan === 'pro',
          isSchool: adminSub.plan === 'school',
          isActive: true,
          currentPeriodEnd: null,
          cancelAt: null,
          raw: adminSub,
        };
      }

      // 2. Query both subscriptions table and profiles table
      const [subRes, profileRes] = await Promise.all([
        supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase
          .from("profiles")
          .select("subscription_plan, subscription_tier, subscription_status, role")
          .eq("id", user.id)
          .maybeSingle()
      ]);

      const subData = subRes.data;
      const prof = profileRes.data;
      const profilePlan = prof?.subscription_plan?.toLowerCase();
      const profileTier = (prof as any)?.subscription_tier?.toLowerCase();
      const role = (prof as any)?.role?.toLowerCase();

      // Check if admin granted pro/school or if role is admin
      const isDbAdmin = role === 'admin';
      const isDbPro = profilePlan === 'pro' || profilePlan === 'premium' || profileTier === 'pro';
      const isDbSchool = profilePlan === 'school' || profileTier === 'school';

      // Check subscriptions table
      const isSubActive = subData && (subData.status === 'active' || subData.status === 'trialing');
      const isSubPro = isSubActive && (subData.plan === 'pro');
      const isSubSchool = isSubActive && (subData.plan === 'school');

      // Check if current subscription has not expired
      let periodExpired = false;
      if (subData?.current_period_end) {
        periodExpired = new Date(subData.current_period_end).getTime() < Date.now();
      }

      if ((isDbPro || isSubPro) && !periodExpired) {
        return {
          plan: 'pro',
          status: (subData?.status as SubStatus) || 'active',
          isPro: true,
          isSchool: false,
          isActive: true,
          currentPeriodEnd: subData?.current_period_end || null,
          cancelAt: subData?.cancel_at || null,
          raw: subData,
        };
      }

      if ((isDbSchool || isSubSchool) && !periodExpired) {
        return {
          plan: 'school',
          status: (subData?.status as SubStatus) || 'active',
          isPro: false,
          isSchool: true,
          isActive: true,
          currentPeriodEnd: subData?.current_period_end || null,
          cancelAt: subData?.cancel_at || null,
          raw: subData,
        };
      }

      if (isDbAdmin) {
        return {
          plan: 'pro',
          status: 'active',
          isPro: true,
          isSchool: false,
          isActive: true,
          currentPeriodEnd: null,
          cancelAt: null,
          raw: { role: 'admin' },
        };
      }

      // 3. Check Referral Requirement:
      // A user gets Pro if they have met referral milestones (e.g. at least 1 active/rewarded referral)
      try {
        const { data: referrals } = await supabase
          .from("student_referrals")
          .select("id, status, reward_status")
          .eq("referrer_id", user.id);

        if (referrals && referrals.length > 0) {
          const activeCount = referrals.filter(r => r.status === "active").length;
          const rewardedCount = referrals.filter(r => r.reward_status === "rewarded").length;

          if (activeCount >= 1 || rewardedCount >= 1) {
            return {
              plan: "pro",
              status: "active",
              isPro: true,
              isSchool: false,
              isActive: true,
              currentPeriodEnd: null,
              cancelAt: null,
              raw: { source: 'referral_earned', activeCount, rewardedCount },
            };
          }
        }
      } catch (refErr) {
        console.warn("Error checking referral requirement:", refErr);
      }

      // Strictly return free state if neither admin changed role nor referral requirement met
      return FREE_STATE;
    },
  });

  useEffect(() => {
    if (!user) return;
    const handleUpdate = () => {
      qc.invalidateQueries({ queryKey: ["subscription", user.id] });
      qc.invalidateQueries({ queryKey: ["subscription"] });
    };

    window.addEventListener("levelhub:subscription_updated", handleUpdate);
    window.addEventListener("levelhub:referral_updated", handleUpdate);
    window.addEventListener("levelhub:admin_data_updated", handleUpdate);

    const ch = supabase
      .channel(`sub:${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "subscriptions", filter: `user_id=eq.${user.id}` },
        handleUpdate,
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles", filter: `id=eq.${user.id}` },
        handleUpdate,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "student_referrals", filter: `referrer_id=eq.${user.id}` },
        handleUpdate,
      )
      .subscribe();

    return () => { 
      window.removeEventListener("levelhub:subscription_updated", handleUpdate);
      window.removeEventListener("levelhub:referral_updated", handleUpdate);
      window.removeEventListener("levelhub:admin_data_updated", handleUpdate);
      supabase.removeChannel(ch); 
    };
  }, [user, qc]);

  return q.data ?? FREE_STATE;
}

export function usePricingSettings() {
  return useQuery({
    queryKey: ["pricing_settings"],
    queryFn: async () => {
      const { data } = await supabase.from("pricing_settings").select("key,value");
      const map: Record<string, any> = {};
      (data ?? []).forEach((r: any) => { map[r.key] = r.value; });
      return map;
    },
    staleTime: 5 * 60_000,
  });
}
