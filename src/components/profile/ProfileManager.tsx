import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { User, School, Save, Plus, Send, Crown, CreditCard, ChevronRight, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";
import { ParentConnection } from "./ParentConnection";
import { normalizeProgramme } from "@/contexts/StudentProgrammeContext";

interface School {
  id: string;
  name: string;
  city: string | null;
  is_verified: boolean;
}

interface ProfileData {
  display_name: string | null;
  avatar_url: string | null;
  grade_level: string | null;
  school: string | null;
  school_id: string | null;
  parent_email: string | null;
  role?: string;
}

const ProfileManager = () => {
  const { user } = useAuth();
  const sub = useSubscription();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [schools, setSchools] = useState<School[]>([]);
  const [saving, setSaving] = useState(false);
  const [showAddSchool, setShowAddSchool] = useState(false);
  const [newSchoolName, setNewSchoolName] = useState("");
  const [newSchoolCity, setNewSchoolCity] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [sendingInvite, setSendingInvite] = useState(false);

  // Referral State
  const [referralCode, setReferralCode] = useState("");
  const [appliedReferral, setAppliedReferral] = useState<string | null>(null);
  const [applyingReferral, setApplyingReferral] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchSchools();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("display_name, avatar_url, grade_level, school, school_id, role")
      .eq("id", user.id)
      .single();
    const { data: priv } = await supabase
      .from("profile_private" as any)
      .select("parent_email")
      .eq("user_id", user.id)
      .maybeSingle();
    if (data) setProfile({ ...(data as any), parent_email: (priv as any)?.parent_email ?? null });
  };

  const fetchReferral = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('referrals')
      .select('referral_code')
      .eq('student_id', user.id)
      .maybeSingle();
    
    if (data) {
      setAppliedReferral(data.referral_code);
    }
  };

  const fetchSchools = async () => {
    const { data } = await supabase
      .from("schools")
      .select("id, name, city, is_verified")
      .order("name");
    if (data) setSchools(data as any);
  };

  const saveProfile = async () => {
    if (!user || !profile) return;
    setSaving(true);
    const normalizedProg = profile.grade_level ? normalizeProgramme(profile.grade_level) : null;
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: profile.display_name,
        grade_level: normalizedProg || profile.grade_level,
        school: profile.school,
        school_id: profile.school_id,
      } as any)
      .eq("id", user.id);
    const { error: privError } = await supabase
      .from("profile_private" as any)
      .upsert({ user_id: user.id, parent_email: profile.parent_email } as any, { onConflict: "user_id" });
    if (error || privError) {
      toast.error((error || privError)?.message || "Failed to save");
    } else {
      toast.success("Profile updated!");
      if (normalizedProg) {
        window.dispatchEvent(new CustomEvent('levelhub:programme_changed', {
          detail: { programme: normalizedProg }
        }));
      }
    }
    setSaving(false);
  };

  const addSchool = async () => {
    if (!user || !newSchoolName.trim()) return;
    const { data, error } = await supabase
      .from("schools")
      .insert({ name: newSchoolName.trim(), city: newSchoolCity.trim() || null, created_by: user.id } as any)
      .select()
      .single();
    if (error) {
      if (error.message.includes("duplicate")) {
        toast.error("This school already exists!");
      } else {
        toast.error(error.message);
      }
    } else if (data) {
      toast.success("School added! Awaiting admin verification.");
      setNewSchoolName("");
      setNewSchoolCity("");
      setShowAddSchool(false);
      fetchSchools();
      setProfile(prev => prev ? { ...prev, school_id: (data as any).id, school: (data as any).name } : prev);
    }
  };

  const sendInvite = async () => {
    if (!user || !profile?.school_id || !inviteEmail.trim()) return;
    setSendingInvite(true);
    const { error } = await supabase
      .from("school_invites")
      .insert({ school_id: profile.school_id, invited_by: user.id, invited_email: inviteEmail.trim() } as any);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`Invite sent to ${inviteEmail}!`);
      setInviteEmail("");
    }
    setSendingInvite(false);
  };

  const handleSchoolSelect = (schoolId: string) => {
    const school = schools.find(s => s.id === schoolId);
    setProfile(prev => prev ? { ...prev, school_id: schoolId, school: school?.name || null } : prev);
  };

  const handleApplyReferral = async () => {
    if (!user || !referralCode.trim()) return;
    setApplyingReferral(true);
    
    try {
      const { data, error } = await supabase.rpc('apply_referral_code', { code_input: referralCode.trim() });
      
      if (error) throw error;
      
      const result = data as { success: boolean, message: string };
      if (result.success) {
        toast.success(result.message);
        setAppliedReferral(referralCode.trim().toUpperCase());
      } else {
        toast.error(result.message);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to apply referral code");
    } finally {
      setApplyingReferral(false);
    }
  };

  if (!profile) return null;

  const selectedSchool = schools.find(s => s.id === profile.school_id);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          Edit Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-primary">
            <AvatarImage src={profile.avatar_url || undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground text-xl">
              {profile.display_name?.charAt(0) || "?"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-lg">{profile.display_name || "Student"}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        {/* Name */}
        <div className="space-y-1.5">
          <Label>Display Name</Label>
          <Input
            value={profile.display_name || ""}
            onChange={e => setProfile(prev => prev ? { ...prev, display_name: e.target.value } : prev)}
          />
        </div>

        {/* Qualification (Student Only) */}
        {profile.role !== "teacher" && (
          <div className="space-y-1.5">
            <Label>Qualification</Label>
            <Select 
              value={normalizeProgramme(profile.grade_level) || profile.grade_level || "igcse"} 
              onValueChange={v => setProfile(prev => prev ? { ...prev, grade_level: v } : prev)}
            >
              <SelectTrigger><SelectValue placeholder="Select your qualification" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="a_level">Cambridge International A-Level</SelectItem>
                <SelectItem value="o_level">Cambridge O-Level</SelectItem>
                <SelectItem value="igcse">Cambridge IGCSE</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">This tailors your dashboard, subjects, and past papers to the right Cambridge curriculum.</p>
          </div>
        )}


        {/* School Section */}
        <div className="space-y-2">
          <Label className="flex items-center gap-1.5">
            <School className="h-4 w-4" /> School
          </Label>
          <Select value={profile.school_id || ""} onValueChange={handleSchoolSelect}>
            <SelectTrigger><SelectValue placeholder="Select your school..." /></SelectTrigger>
            <SelectContent>
              {schools.filter(s => s.is_verified).map(s => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name} {s.city ? `(${s.city})` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedSchool && !selectedSchool.is_verified && (
            <Badge variant="secondary" className="text-xs">⏳ Pending verification</Badge>
          )}

          <Dialog open={showAddSchool} onOpenChange={setShowAddSchool}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="mt-1">
                <Plus className="h-4 w-4 mr-1" /> Add New School
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Your School</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>School Name</Label>
                  <Input value={newSchoolName} onChange={e => setNewSchoolName(e.target.value)} placeholder="e.g. Karachi Grammar School" />
                </div>
                <div className="space-y-1.5">
                  <Label>City</Label>
                  <Input value={newSchoolCity} onChange={e => setNewSchoolCity(e.target.value)} placeholder="e.g. Karachi" />
                </div>
                <p className="text-xs text-muted-foreground">Your school will be verified by admin before appearing publicly.</p>
                <Button onClick={addSchool} disabled={!newSchoolName.trim()}>Submit School</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Invite Students */}
        {profile.school_id && (
          <div className="space-y-2 border-t border-border pt-4">
            <Label>Invite Classmates</Label>
            <p className="text-xs text-muted-foreground">Invite other students to join your school on the platform.</p>
            <div className="flex gap-2">
              <Input
                placeholder="friend@email.com"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                type="email"
              />
              <Button onClick={sendInvite} disabled={sendingInvite || !inviteEmail.trim()} size="sm">
                <Send className="h-4 w-4 mr-1" />
                Invite
              </Button>
            </div>
          </div>
        )}

        {/* Parent Email & Referral (Student Only) */}
        {profile.role !== "teacher" && (
          <>
            <div className="space-y-2 border-t border-border pt-4">
              <ParentConnection />
            </div>

            <div className="space-y-2 border-t border-border pt-4">
              <Label className="flex items-center gap-2">
                <Tag className="h-4 w-4" /> Teacher Referral
              </Label>
              {appliedReferral ? (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-sm py-1">
                    Active Code: <span className="font-mono ml-1">{appliedReferral}</span>
                  </Badge>
                  <p className="text-xs text-muted-foreground ml-2">You are receiving partner benefits!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">If you have a referral code from your teacher, enter it below to receive student benefits and discounts.</p>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g. JOHND12A3"
                      value={referralCode}
                      onChange={e => setReferralCode(e.target.value)}
                      className="font-mono uppercase"
                    />
                    <Button onClick={handleApplyReferral} disabled={applyingReferral || !referralCode.trim()} variant="secondary">
                      {applyingReferral ? "Applying..." : "Apply Code"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Subscription & Billing */}
        <div className="space-y-2 border-t border-border pt-4">
          <Label className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-primary" /> Subscription & Billing
          </Label>
          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3">
            <div>
              <div className="text-sm font-medium capitalize">{sub.plan} plan</div>
              <div className="text-xs text-muted-foreground">
                {sub.isPro ? "All features unlocked" : "Limited to 3 subjects · 20 quizzes/day"}
              </div>
            </div>
            <Button asChild size="sm" variant={sub.isPro ? "outline" : "default"}>
              <Link to="/billing">
                <CreditCard className="h-4 w-4 mr-1" />
                {sub.isPro ? "Manage" : "Upgrade"}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Save */}
        <Button onClick={saveProfile} disabled={saving} className="w-full">
          <Save className="h-4 w-4 mr-1" />
          {saving ? "Saving..." : "Save Profile"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProfileManager;
