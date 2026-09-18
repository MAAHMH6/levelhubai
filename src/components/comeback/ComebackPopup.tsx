import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Zap, Flame } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export const ComebackPopup = () => {
  const { user } = useAuth();
  const [show, setShow] = useState(false);
  const [daysInactive, setDaysInactive] = useState(0);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    if (!user) return;
    checkInactivity();
  }, [user]);

  const checkInactivity = async () => {
    if (!user) return;

    // Get user's profile updated_at as last activity
    const { data: profile } = await supabase
      .from("profiles")
      .select("updated_at")
      .eq("id", user.id)
      .single();

    if (!profile) return;

    const lastActive = new Date(profile.updated_at);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 2) return;

    // Check if already claimed a bonus recently (within last inactivity cycle)
    const { data: recentBonus } = await supabase
      .from("comeback_bonuses")
      .select("claimed_at")
      .eq("user_id", user.id)
      .order("claimed_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (recentBonus) {
      const lastClaim = new Date(recentBonus.claimed_at);
      // Don't show if they claimed after their last activity
      if (lastClaim > lastActive) return;
    }

    setDaysInactive(diffDays);
    setShow(true);
  };

  const claimBonus = async () => {
    if (!user) return;
    setClaiming(true);

    try {
      // Record the bonus claim
      await supabase.from("comeback_bonuses").insert({
        user_id: user.id,
        days_inactive: daysInactive,
        xp_awarded: 50,
      });

      // Award XP
      const { data: profile } = await supabase
        .from("profiles")
        .select("xp_points")
        .eq("id", user.id)
        .single();

      if (profile) {
        await supabase
          .from("profiles")
          .update({ xp_points: profile.xp_points + 50, updated_at: new Date().toISOString() })
          .eq("id", user.id);
      }

      toast.success("Welcome back! +50 XP earned! 🎉");
      setShow(false);
    } catch (error) {
      console.error("Error claiming bonus:", error);
    } finally {
      setClaiming(false);
    }
  };

  return (
    <Dialog open={show} onOpenChange={setShow}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center"
          >
            <Flame className="h-10 w-10 text-white" />
          </motion.div>
          <DialogTitle className="text-2xl">
            You've been gone for {daysInactive} days 😈
          </DialogTitle>
          <DialogDescription className="text-base">
            We missed you! Come back now and earn a bonus reward.
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-yellow-500/10 border border-primary/20 my-4">
          <div className="flex items-center justify-center gap-2 text-xl font-bold text-primary">
            <Zap className="h-6 w-6" />
            +50 XP Bonus
          </div>
        </div>

        <Button
          size="lg"
          className="w-full"
          onClick={claimBonus}
          disabled={claiming}
        >
          {claiming ? "Claiming..." : "Claim Bonus"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};
