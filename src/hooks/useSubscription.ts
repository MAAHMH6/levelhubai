import { useEffect, useState } from "react";
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
  plan: "free", status: "active", isPro: false, isSchool: false,
  isActive: true, currentPeriodEnd: null, cancelAt: null, raw: null,
};

export function useSubscription() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const q = useQuery({
    queryKey: ["subscription", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<SubscriptionState> => {
      if (!user) return FREE_STATE;

      // Check both subscriptions table and profiles table (set by Admin or registration)
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
      const adminSub = adminDataStore.getSubscription(user.id);
      const localPlan = typeof window !== 'undefined' 
        ? (localStorage.getItem(`levelhub_sub_${user.id}`) || localStorage.getItem('levelhub_user_plan') || (localStorage.getItem('pro_override') === 'true' ? 'pro' : null))
        : null;

      // If admin explicitly set this user's subscription in admin store, prioritize it
      if (adminSub) {
        if (adminSub.plan === 'free') {
          return FREE_STATE;
        }
        return {
          plan: adminSub.plan,
          status: adminSub.status as SubStatus,
          isPro: adminSub.plan === 'pro',
          isSchool: adminSub.plan === 'school',
          isActive: true,
          currentPeriodEnd: subData?.current_period_end || null,
          cancelAt: subData?.cancel_at || null,
          raw: subData,
        };
      }

      // Treat profile as Pro if set to 'pro', 'premium', active status, or admin
      const isProfilePro = 
        profilePlan === 'pro' || 
        profilePlan === 'premium' || 
        profileTier === 'pro' || 
        role === 'admin' ||
        role === 'pro' ||
        localPlan === 'pro';
      const isProfileSchool = profilePlan === 'school' || profileTier === 'school' || localPlan === 'school';

      // A subscriptions row with plan='pro' or 'school'
      const subIsPro = subData?.plan === 'pro' || subData?.plan === 'school';

      // If nothing grants pro access, return free state immediately
      if (!subIsPro && !isProfilePro && !isProfileSchool) {
        return FREE_STATE;
      }

      const status = (subData?.status as SubStatus) || "active";

      // Determine effective plan from most authoritative source
      let plan: PlanTier = "free";
      if (isProfilePro) plan = "pro";
      else if (isProfileSchool) plan = "school";
      else if (subData?.plan === 'pro') plan = "pro";
      else if (subData?.plan === 'school') plan = "school";

      return {
        plan,
        status,
        isPro: plan === "pro",
        isSchool: plan === "school",
        isActive: true,
        currentPeriodEnd: subData?.current_period_end || null,
        cancelAt: subData?.cancel_at || null,
        raw: subData,
      };
    },
  });

  useEffect(() => {
    if (!user) return;
    const handleUpdate = () => {
      qc.invalidateQueries({ queryKey: ["subscription", user.id] });
      qc.invalidateQueries({ queryKey: ["subscription"] });
    };
    window.addEventListener("levelhub:subscription_updated", handleUpdate);

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
      .subscribe();

    return () => { 
      window.removeEventListener("levelhub:subscription_updated", handleUpdate);
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
