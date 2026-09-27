import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { 
  Gift, 
  Copy, 
  Share2, 
  CheckCircle, 
  Users, 
  Trophy, 
  Sparkles, 
  Clock, 
  ArrowRight,
  ShieldCheck,
  Check
} from "lucide-react";

interface ReferralStats {
  total: number;
  active: number;
  pending: number;
  rewardsEarned: number;
  pendingApproval: number;
}

interface ReferralRecord {
  id: string;
  created_at: string;
  status: string;
  reward_status: string;
  referred: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

export const StudentReferralCenter: React.FC = () => {
  const { user } = useAuth();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [stats, setStats] = useState<ReferralStats>({
    total: 0,
    active: 0,
    pending: 0,
    rewardsEarned: 0,
    pendingApproval: 0,
  });
  const [history, setHistory] = useState<ReferralRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    if (user) {
      fetchReferralData();
    }
  }, [user]);

  const fetchReferralData = async () => {
    if (!user) return;
    try {
      setLoading(true);

      // 1. Fetch or generate student referral code
      const { data: profile } = await supabase
        .from("profiles")
        .select("referral_code, display_name")
        .eq("id", user.id)
        .maybeSingle();

      let activeCode = profile?.referral_code;

      if (!activeCode) {
        // Generate a clean referral code: LH-XXXXXX
        const generated = `LH-${user.id.slice(0, 6).toUpperCase()}`;
        try {
          const { error: updateErr } = await supabase
            .from("profiles")
            .update({ referral_code: generated })
            .eq("id", user.id);
          if (!updateErr) {
            activeCode = generated;
          }
        } catch (e) {
          activeCode = generated;
        }
      }

      setReferralCode(activeCode || `LH-${user.id.slice(0, 6).toUpperCase()}`);

      // 2. Fetch student referrals
      const { data: referrals, error } = await supabase
        .from("student_referrals")
        .select(`
          id, 
          created_at, 
          status, 
          reward_status,
          referred:referred_id(display_name, avatar_url)
        `)
        .eq("referrer_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Could not query student_referrals:", error.message);
      } else if (referrals) {
        setHistory(referrals as any[]);

        let active = 0;
        let pending = 0;
        let rewards = 0;
        let pendingApproval = 0;

        referrals.forEach((r: any) => {
          if (r.status === "active") active++;
          else pending++;

          if (r.reward_status === "rewarded") rewards++;
          if (r.reward_status === "pending_approval") pendingApproval++;
        });

        setStats({
          total: referrals.length,
          active,
          pending,
          rewardsEarned: rewards,
          pendingApproval,
        });
      }
    } catch (err: any) {
      console.error("Error loading referral data:", err);
    } finally {
      setLoading(false);
    }
  };

  const referralLink = referralCode
    ? `${window.location.origin}/auth?ref=${referralCode}`
    : `${window.location.origin}/auth`;

  const copyToClipboard = (text: string, type: "link" | "code") => {
    navigator.clipboard.writeText(text);
    if (type === "link") {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
      toast.success("Referral link copied to clipboard!");
    } else {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
      toast.success("Referral code copied to clipboard!");
    }
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join LevelHubAI with my invite!",
          text: "Practice Cambridge O Level, IGCSE & A Level with AI-powered interactive quizzes and notes on LevelHubAI!",
          url: referralLink,
        });
      } catch (err) {
        // User dismissed share dialog
      }
    } else {
      copyToClipboard(referralLink, "link");
    }
  };

  // Calculate Progress towards next milestone (Same structure as old platform)
  // Milestones: 1 active friend = 7 Days Pro, 3 active friends = 1 Month Pro
  let progressValue = 0;
  let nextMilestone = 1;
  let nextReward = "7 Days Free Pro";

  if (stats.active === 0) {
    progressValue = 0;
    nextMilestone = 1;
    nextReward = "7 Days Free Pro";
  } else if (stats.active >= 1 && stats.active < 3) {
    // 1 friend done, progress towards 3
    progressValue = 50 + ((stats.active - 1) / 2) * 50;
    nextMilestone = 3 - stats.active;
    nextReward = "1 Month Free Pro";
  } else if (stats.active >= 3) {
    progressValue = 100;
    nextMilestone = 0;
    nextReward = "All Milestones Completed!";
  }

  if (stats.pendingApproval > 0) {
    nextReward = "Verification Pending";
  }

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 animate-pulse flex flex-col items-center gap-3">
        <Gift className="w-8 h-8 text-teal-500 animate-bounce" />
        <p className="text-sm font-medium">Loading Referral Center...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Header Banner Card */}
      <Card className="rounded-3xl border-slate-200/80 dark:border-slate-800 bg-gradient-to-br from-teal-500/10 via-teal-500/5 to-transparent relative overflow-hidden shadow-xs">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-8 -translate-y-8">
          <Gift className="w-64 h-64 text-teal-600 dark:text-teal-400" />
        </div>
        <CardHeader className="relative z-10 pb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300 text-xs font-bold w-fit mb-2 border border-teal-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            Student Referral Programme
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            Invite Friends, Earn Pro Access
          </CardTitle>
          <CardDescription className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mt-1">
            Share your unique referral link or code. When a friend signs up and completes their first practice lesson, you both unlock premium rewards!
          </CardDescription>

          <div className="flex flex-wrap gap-3 mt-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-teal-500/30 text-xs font-bold text-slate-800 dark:text-slate-100">
              <span className="w-2 h-2 rounded-full bg-teal-500"></span>
              <strong>1 Active Friend</strong> = 7 Days Free Pro
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-teal-500/30 text-xs font-bold text-slate-800 dark:text-slate-100">
              <span className="w-2 h-2 rounded-full bg-teal-500"></span>
              <strong>3 Active Friends</strong> = 1 Month Free Pro
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative z-10 space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Referral Link */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Your Unique Invite Link
              </label>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={referralLink}
                  className="bg-white dark:bg-slate-900 font-mono text-xs text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 h-10 rounded-xl"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(referralLink, "link")}
                  title="Copy Link"
                  className="rounded-xl border-slate-200 dark:border-slate-800 shrink-0 h-10 w-10 hover:bg-teal-50 dark:hover:bg-slate-800"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-teal-600" /> : <Copy className="w-4 h-4 text-slate-600 dark:text-slate-300" />}
                </Button>
                <Button
                  onClick={shareLink}
                  className="rounded-xl bg-teal-600 hover:bg-teal-700 text-white shrink-0 h-10 px-4 flex items-center gap-1.5 font-bold text-xs"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Share
                </Button>
              </div>
            </div>

            {/* Referral Code */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Your Referral Code
              </label>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={referralCode || "Generating..."}
                  className="bg-white dark:bg-slate-900 font-mono font-bold text-sm text-teal-600 dark:text-teal-400 text-center border-slate-200 dark:border-slate-800 h-10 rounded-xl tracking-wider"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(referralCode || "", "code")}
                  title="Copy Code"
                  className="rounded-xl border-slate-200 dark:border-slate-800 shrink-0 h-10 w-10 hover:bg-teal-50 dark:hover:bg-slate-800"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-teal-600" /> : <Copy className="w-4 h-4 text-slate-600 dark:text-slate-300" />}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Progress & Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Milestone Progress Card */}
        <Card className="lg:col-span-2 rounded-3xl p-6 bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                <Trophy className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Reward Milestone Progress
                </h3>
                <p className="text-xs text-slate-400">
                  Track your referral progress and unlocked Pro bonuses
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-xs border-teal-500/30 text-teal-600 dark:text-teal-400 bg-teal-500/10">
              {stats.active} Active {stats.active === 1 ? 'Friend' : 'Friends'}
            </Badge>
          </div>

          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-slate-500 dark:text-slate-400">
                Next Reward: <strong className="text-slate-900 dark:text-white font-bold">{nextReward}</strong>
              </span>
              {nextMilestone > 0 ? (
                <span className="font-bold text-teal-600 dark:text-teal-400">
                  {nextMilestone} more active {nextMilestone === 1 ? 'friend' : 'friends'} needed
                </span>
              ) : (
                <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Milestone Unlocked!
                </span>
              )}
            </div>
            <Progress value={progressValue} className="h-3 rounded-full bg-slate-100 dark:bg-slate-800" />
          </div>

          {/* 3 Stat Counters */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <Users className="w-5 h-5 text-blue-500 mb-1.5" />
              <span className="font-extrabold text-xl text-slate-900 dark:text-white">{stats.total}</span>
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Total Invited</span>
            </div>

            <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <CheckCircle className="w-5 h-5 text-emerald-500 mb-1.5" />
              <span className="font-extrabold text-xl text-slate-900 dark:text-white">{stats.active}</span>
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Active Friends</span>
            </div>

            <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <Gift className="w-5 h-5 text-purple-500 mb-1.5" />
              <span className="font-extrabold text-xl text-slate-900 dark:text-white">{stats.rewardsEarned}</span>
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Rewards Earned</span>
            </div>
          </div>

          {stats.pendingApproval > 0 && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400 flex items-start gap-3">
              <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <strong>Verification Pending:</strong> You have {stats.pendingApproval} reward milestone{stats.pendingApproval > 1 ? 's' : ''} awaiting admin verification. Your free Pro access will be confirmed promptly.
              </div>
            </div>
          )}
        </Card>

        {/* Right: Recent Referrals History */}
        <Card className="rounded-3xl p-6 bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-600" />
              Recent Referrals
            </h3>
            <Badge variant="secondary" className="text-[11px]">
              {history.length}
            </Badge>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[280px] space-y-3 pr-1">
            {history.length === 0 ? (
              <div className="h-full min-h-[160px] flex flex-col items-center justify-center text-center p-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mb-2">
                  <Users className="w-6 h-6 opacity-40" />
                </div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No referrals yet</p>
                <p className="text-[11px] text-slate-400 max-w-[180px] mt-0.5">
                  Share your link with friends to start earning free Pro access!
                </p>
              </div>
            ) : (
              history.map((record) => (
                <div
                  key={record.id}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar className="h-8 w-8 border border-slate-200 dark:border-slate-700">
                      <AvatarImage src={record.referred?.avatar_url || undefined} />
                      <AvatarFallback className="bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 font-bold text-xs">
                        {record.referred?.display_name?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {record.referred?.display_name || "New Student"}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {new Date(record.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Badge
                      variant={record.status === "active" ? "default" : "outline"}
                      className={`text-[10px] font-semibold ${
                        record.status === "active"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                          : "text-slate-400 border-slate-200 dark:border-slate-800"
                      }`}
                    >
                      {record.status === "active" ? "Active" : "Pending"}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* 3. How It Works 3-Step Guide */}
      <Card className="rounded-3xl p-6 bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-xs">
        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          How The Referral Program Works
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center font-extrabold text-xs">
              1
            </div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">Share Your Link or Code</div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Send your referral link to friends or classmates preparing for Cambridge O Level, IGCSE or A Level.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center font-extrabold text-xs">
              2
            </div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">Friend Joins & Earns XP</div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Once they create an account and practice their first topic quiz, their status changes to Active.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center font-extrabold text-xs">
              3
            </div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">Unlock Free Pro Access</div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Earn 7 days of Pro for your first friend, and a full 1 month Pro subscription when you reach 3 friends!
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
