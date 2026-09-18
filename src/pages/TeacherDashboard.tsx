import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, DollarSign, Wallet, Copy, LogOut, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileManager from "@/components/profile/ProfileManager";
import { PrivacySettings } from "@/components/profile/PrivacySettings";
import { useContactInfo } from "@/hooks/useContactInfo";
import { MessageCircle } from "lucide-react";

export default function TeacherDashboard() {
  const { user, loading: authLoading } = useAuth();
  const nav = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    paidStudents: 0,
    pendingCommissions: 0,
    approvedCommissions: 0,
    paidCommissions: 0,
    availableBalance: 0,
    totalWithdrawn: 0
  });
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Withdrawal form state
  const [submittingWithdrawal, setSubmittingWithdrawal] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const contactInfo = useContactInfo();
  const [referralHistory, setReferralHistory] = useState<any[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      nav("/auth");
      return;
    }

    if (user) {
      fetchDashboardData();
    }
  }, [user, authLoading, nav]);

  const fetchDashboardData = async () => {
    try {
      // Check if teacher profile exists
      const { data: teacherProfile, error: tpError } = await supabase
        .from("teacher_profiles")
        .select("*")
        .eq("id", user!.id)
        .maybeSingle();

      if (tpError) throw tpError;
      
      if (!teacherProfile) {
        // Not a teacher
        toast.error("You don't have access to the Teacher Dashboard.");
        nav("/dashboard");
        return;
      }

      setProfile(teacherProfile);

      // Fetch referrals with student info
      const { data: referralsData } = await supabase
        .from("referrals")
        .select(`
          id,
          status,
          created_at,
          student:profiles (
            display_name,
            avatar_url,
            xp_points,
            subscription_plan
          )
        `)
        .eq("teacher_id", user!.id)
        .order("created_at", { ascending: false });

      let totalStudents = 0, activeStudents = 0, paidStudents = 0;
      if (referralsData) {
        setReferralHistory(referralsData);
        referralsData.forEach((r: any) => {
          totalStudents++;
          if (r.student?.xp_points > 0) activeStudents++;
          if (r.student?.subscription_plan === 'pro') paidStudents++;
        });
      }

      // Fetch commissions
      const { data: commissions } = await supabase
        .from("commissions")
        .select("amount, status")
        .eq("teacher_id", user!.id);

      let pending = 0, approved = 0, paid = 0;
      commissions?.forEach((c) => {
        if (c.status === "pending") pending += c.amount;
        if (c.status === "approved") approved += c.amount;
        if (c.status === "paid") paid += c.amount;
      });

      // Fetch withdrawals to calculate exact available balance
      const { data: withdrawalData } = await supabase
        .from("withdrawals")
        .select("*")
        .eq("teacher_id", user!.id)
        .order("created_at", { ascending: false });

      let pendingWithdrawals = 0;
      let totalWithdrawn = 0;
      if (withdrawalData) {
        setWithdrawals(withdrawalData);
        withdrawalData.forEach((w) => {
          if (w.status === 'pending' || w.status === 'approved') {
            pendingWithdrawals += w.amount;
          }
          if (w.status === 'completed' || w.status === 'paid') {
            totalWithdrawn += w.amount;
          }
        });
      }

      const totalCommissionEarned = approved + paid;
      const availableBalance = Math.max(0, totalCommissionEarned - totalWithdrawn - pendingWithdrawals);

      setStats({
        totalStudents,
        activeStudents,
        paidStudents,
        pendingCommissions: pending,
        approvedCommissions: approved,
        paidCommissions: paid,
        availableBalance,
        totalWithdrawn,
      });


    } catch (e: any) {
      console.error(e);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const copyReferralCode = () => {
    if (profile?.referral_code) {
      navigator.clipboard.writeText(profile.referral_code);
      toast.success("Referral code copied to clipboard!");
    }
  };

  const handleWhatsAppWithdrawal = async () => {
    if (stats.availableBalance <= 0) {
      toast.error("No available balance to withdraw");
      return;
    }

    setSubmittingWithdrawal(true);
    try {
      // Record the withdrawal request
      const { error } = await supabase.from("withdrawals").insert({
        teacher_id: user!.id,
        amount: stats.availableBalance,
        payment_method: "whatsapp",
        payment_details: { type: "whatsapp_request" },
        status: "pending"
      });

      if (error) throw error;
      
      toast.success("Withdrawal requested! Redirecting to WhatsApp...");
      setIsDialogOpen(false);
      
      // Open WhatsApp
      const message = `Hello LevelHubAI Team, I would like to withdraw my teacher referral commission. I have attached my screenshot of paid referred students. Teacher ID: ${profile?.referral_code || user?.id}`;
      window.open(`https://wa.me/${contactInfo.whatsappPhone}?text=${encodeURIComponent(message)}`, "_blank");
      
      fetchDashboardData();
    } catch (e: any) {
      toast.error(e.message || "Failed to submit withdrawal");
    } finally {
      setSubmittingWithdrawal(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    nav("/");
  };

  if (loading || authLoading) {
    return <div className="p-8 text-center">Loading dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="mr-2">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <span className="font-bold text-xl">LevelHubAI Partner</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-muted-foreground hover:text-foreground">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6 max-w-6xl space-y-8 animate-fade-in pt-8">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold font-display">Teacher Partner Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage your students, referrals, and earnings.</p>
          </div>
          <div className="flex items-center gap-3 bg-secondary/30 p-3 rounded-lg border border-border max-w-md w-full md:w-auto">
            <div className="flex-1 overflow-hidden">
              <div className="text-xs text-muted-foreground uppercase font-semibold">Your Referral Link</div>
              <div className="font-mono text-sm font-bold text-primary truncate">
                https://olevel.com.pk/auth?teacher_ref={profile?.referral_code}
              </div>
            </div>
            <Button variant="outline" size="icon" onClick={() => {
              if (profile?.referral_code) {
                navigator.clipboard.writeText(`https://olevel.com.pk/auth?teacher_ref=${profile.referral_code}`);
                toast.success("Referral link copied!");
              }
            }}>
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full md:w-fit grid-cols-2 lg:grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
            <TabsTrigger value="profile">Profile & Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Enrolled Students</div>
                  <div className="text-3xl font-bold">{stats.totalStudents}</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-500" />
                    </div>
                  </div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Active Students</div>
                  <div className="text-3xl font-bold text-blue-500">{stats.activeStudents}</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-purple-500" />
                    </div>
                  </div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Paid Students</div>
                  <div className="text-3xl font-bold text-purple-500">{stats.paidStudents}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-warning" />
                    </div>
                  </div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Total Commission Earned</div>
                  <div className="text-3xl font-bold text-warning">PKR {(stats.approvedCommissions + stats.paidCommissions).toLocaleString()}</div>
                </CardContent>
              </Card>

              <Card className="border-primary/50 shadow-glow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                      <Wallet className="w-5 h-5 text-success" />
                    </div>
                  </div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Available to Withdraw</div>
                  <div className="text-3xl font-bold text-success">PKR {stats.availableBalance.toLocaleString()}</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-foreground" />
                    </div>
                  </div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Total Withdrawn</div>
                  <div className="text-3xl font-bold">PKR {stats.totalWithdrawn.toLocaleString()}</div>
                </CardContent>
              </Card>
            </div>

            {/* Referral History */}
            <Card>
              <CardHeader>
                <CardTitle>Referral History</CardTitle>
                <CardDescription>Recent students who signed up using your link.</CardDescription>
              </CardHeader>
              <CardContent>
                {referralHistory.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground bg-secondary/20 rounded-lg">
                    No referrals yet.
                  </div>
                ) : (
                  <div className="divide-y border rounded-lg">
                    {referralHistory.map((ref) => (
                      <div key={ref.id} className="flex justify-between items-center p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold overflow-hidden">
                            {ref.student?.avatar_url ? (
                              <img src={ref.student.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                              ref.student?.display_name?.charAt(0) || "?"
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-sm">{ref.student?.display_name || "Unknown Student"}</div>
                            <div className="text-xs text-muted-foreground">{new Date(ref.created_at).toLocaleDateString()}</div>
                          </div>
                        </div>
                        <div>
                          <Badge variant={ref.student?.subscription_plan === 'pro' ? 'default' : (ref.student?.xp_points > 0 ? 'secondary' : 'outline')} className="capitalize">
                            {ref.student?.subscription_plan === 'pro' ? 'Paid' : (ref.student?.xp_points > 0 ? 'Active' : 'Enrolled')}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="withdrawals">
            {/* Withdrawals Section */}
            <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Withdrawal History</CardTitle>
              <CardDescription>Track your payout requests</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button disabled={stats.availableBalance <= 0}>Withdraw Commission</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Withdraw Commission</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <p className="text-sm text-muted-foreground bg-secondary/30 p-4 rounded-lg border">
                    To withdraw your commission, please take a screenshot of your Paid Students / Enrolled Paid Students section and send it to us on WhatsApp. Our team will verify your referrals and process your commission withdrawal.
                  </p>
                  <div className="pt-2 flex flex-col gap-2">
                    <p className="text-xs text-muted-foreground text-center">
                      Available Balance: <strong>PKR {stats.availableBalance.toLocaleString()}</strong>
                    </p>
                    <Button 
                      onClick={handleWhatsAppWithdrawal} 
                      className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white flex gap-2"
                      disabled={submittingWithdrawal}
                    >
                      <MessageCircle className="w-5 h-5" />
                      {submittingWithdrawal ? "Processing..." : "Contact us on WhatsApp"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {withdrawals.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground bg-secondary/20 rounded-lg">
                No withdrawal requests yet.
              </div>
            ) : (
              <div className="divide-y border rounded-lg">
                {withdrawals.map((w) => (
                  <div key={w.id} className="flex justify-between items-center p-4">
                    <div>
                      <div className="font-semibold text-lg">PKR {w.amount.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">{new Date(w.created_at).toLocaleDateString()}</div>
                      <div className="text-xs text-muted-foreground mt-1">Requested via WhatsApp</div>
                    </div>
                    <div>
                      <Badge variant={
                        w.status === 'paid' ? 'default' : 
                        w.status === 'rejected' ? 'destructive' : 'secondary'
                      } className="capitalize">
                        {w.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
            </CardContent>
          </Card>
          </TabsContent>

          <TabsContent value="profile" className="max-w-3xl mx-auto space-y-6">
            <ProfileManager />
            <PrivacySettings />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
