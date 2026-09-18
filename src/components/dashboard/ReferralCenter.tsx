import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Copy, Share2, CheckCircle, Gift, Users, Trophy } from "lucide-react";

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
    display_name: string;
    avatar_url: string;
  } | null;
}

export const ReferralCenter = () => {
  const { user } = useAuth();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [stats, setStats] = useState<ReferralStats>({ total: 0, active: 0, pending: 0, rewardsEarned: 0, pendingApproval: 0 });
  const [history, setHistory] = useState<ReferralRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchReferralData();
    }
  }, [user]);

  const fetchReferralData = async () => {
    try {
      setLoading(true);
      
      // Get Referral Code
      const { data: profile } = await supabase
        .from("profiles")
        .select("referral_code")
        .eq("id", user?.id)
        .maybeSingle();

      if (profile) {
        setReferralCode(profile.referral_code);
      }

      const { data: referrals, error } = await supabase
        .from("student_referrals")
        .select(`
          id, 
          created_at, 
          status, 
          reward_status,
          referred:referred_id(display_name, avatar_url)
        `)
        .eq("referrer_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (referrals) {
        setHistory(referrals as any[]);
        
        let active = 0;
        let pending = 0;
        let rewards = 0;
        let pendingApproval = 0;

        referrals.forEach(r => {
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
          pendingApproval
        });
      }
    } catch (error: any) {
      console.error("Error fetching referrals:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const referralLink = referralCode 
    ? `${window.location.origin}/auth?ref=${referralCode}`
    : "";

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard!`);
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join me on LevelHubAI!",
          text: "Use my referral link to join LevelHubAI and let's learn together!",
          url: referralLink,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      copyToClipboard(referralLink, "Link");
    }
  };

  // Calculate Progress towards next milestone
  // Milestones: 1 active -> 7 days, 3 active -> 1 month
  let progressValue = 0;
  let nextMilestone = 1;
  let nextReward = "7 Days Free Pro";

  if (stats.active === 0) {
    progressValue = 0;
    nextMilestone = 1;
    nextReward = "7 Days Free Pro";
  } else if (stats.active >= 1 && stats.active < 3) {
    progressValue = ((stats.active - 1) / 2) * 100; // Progress from 1 to 3
    nextMilestone = 3 - stats.active;
    nextReward = "1 Month Free Pro";
  } else if (stats.active >= 3) {
    progressValue = 100;
    nextMilestone = 0;
    nextReward = "Milestones completed!";
  }

  // Override text if waiting for admin verification
  if (stats.pendingApproval > 0) {
    nextReward = "Verification Pending";
  }

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading Referral Center...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20 overflow-hidden relative">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
          <Gift className="w-64 h-64 -mt-10 -mr-10" />
        </div>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Gift className="w-6 h-6 text-primary" />
            Invite Friends, Earn Pro Access
          </CardTitle>
          <CardDescription className="text-base text-foreground/80 max-w-xl">
            Share your unique link with friends. When they sign up and complete their first lesson, you'll earn free Pro time! 
            <br/><br/>
            <strong>1 Friend</strong> = 7 Days Free Pro<br/>
            <strong>3 Friends</strong> = 1 Month Free Pro
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 relative z-10">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">Your Referral Link</label>
              <div className="flex gap-2">
                <Input readOnly value={referralLink} className="bg-background/50 font-mono text-sm" />
                <Button variant="secondary" size="icon" onClick={() => copyToClipboard(referralLink, "Link")} title="Copy Link">
                  <Copy className="w-4 h-4" />
                </Button>
                <Button variant="default" size="icon" onClick={shareLink} title="Share">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="sm:w-48 space-y-2">
              <label className="text-sm font-medium">Your Code</label>
              <div className="flex gap-2">
                <Input readOnly value={referralCode || "Generating..."} className="bg-background/50 font-mono font-bold text-primary text-center" />
                <Button variant="outline" size="icon" onClick={() => copyToClipboard(referralCode || "", "Code")} title="Copy Code">
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress & Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Progress Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Reward Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-muted-foreground">Next Reward: <strong className="text-foreground">{nextReward}</strong></span>
                {nextMilestone > 0 && <span className="font-bold text-primary">{nextMilestone} more active {nextMilestone === 1 ? 'friend' : 'friends'} needed</span>}
              </div>
              <Progress value={progressValue} className="h-3" />
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-center text-sm pt-4 border-t">
              <div className="flex flex-col items-center p-2 rounded-lg bg-secondary/20">
                <Users className="w-5 h-5 text-blue-500 mb-1" />
                <span className="font-bold text-lg">{stats.total}</span>
                <span className="text-muted-foreground text-xs">Invited</span>
              </div>
              <div className="flex flex-col items-center p-2 rounded-lg bg-secondary/20">
                <CheckCircle className="w-5 h-5 text-green-500 mb-1" />
                <span className="font-bold text-lg">{stats.active}</span>
                <span className="text-muted-foreground text-xs">Active</span>
              </div>
              <div className="flex flex-col items-center p-2 rounded-lg bg-secondary/20">
                <Gift className="w-5 h-5 text-purple-500 mb-1" />
                <span className="font-bold text-lg">{stats.rewardsEarned}</span>
                <span className="text-muted-foreground text-xs">Rewards</span>
              </div>
            </div>
            
            {stats.pendingApproval > 0 && (
              <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-md text-sm text-amber-600 flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                You have {stats.pendingApproval} milestone{stats.pendingApproval > 1 ? 's' : ''} pending admin verification before your Pro plan is activated.
              </div>
            )}
          </CardContent>
        </Card>

        {/* History Card */}
        <Card className="md:col-span-1 flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg">Recent Referrals</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto max-h-[300px]">
            {history.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-sm space-y-2 p-4">
                <Users className="w-8 h-8 opacity-20" />
                <p>No referrals yet.</p>
                <p className="text-center text-xs opacity-70">Share your link to get started!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((record) => (
                  <div key={record.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold overflow-hidden">
                        {record.referred?.avatar_url ? (
                          <img src={record.referred.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          record.referred?.display_name?.charAt(0) || "?"
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{record.referred?.display_name || "Unknown Student"}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(record.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant={record.status === "active" ? "default" : "outline"} className="text-[10px]">
                      {record.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
