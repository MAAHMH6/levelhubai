import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export default function TeacherPartnersManager() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Settings
  const [commissionPercent, setCommissionPercent] = useState("10");
  const [studentDiscountPercent, setStudentDiscountPercent] = useState("10");
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch settings
      const { data: settings } = await supabase.from('app_settings').select('*').in('key', ['teacher_commission_percent', 'student_referral_discount_percent']);
      settings?.forEach(s => {
        if (s.key === 'teacher_commission_percent') setCommissionPercent(s.value);
        if (s.key === 'student_referral_discount_percent') setStudentDiscountPercent(s.value);
      });

      // 2. Fetch teachers
      const { data: t } = await supabase.from('teacher_profiles').select('*, profiles(email, display_name)');
      if (t) setTeachers(t);

      // 3. Fetch commissions
      const { data: c } = await supabase.from('commissions').select('*, teacher_profiles(profiles(display_name, email))').order('created_at', { ascending: false });
      if (c) setCommissions(c);

      // 4. Fetch withdrawals
      const { data: w } = await supabase.from('withdrawals').select('*, teacher_profiles(profiles(display_name, email))').order('created_at', { ascending: false });
      if (w) setWithdrawals(w);

    } catch (error: any) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSavingSettings(true);
    try {
      await supabase.from('app_settings').upsert({ key: 'teacher_commission_percent', value: commissionPercent });
      await supabase.from('app_settings').upsert({ key: 'student_referral_discount_percent', value: studentDiscountPercent });
      toast.success("Settings saved");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setSavingSettings(false);
    }
  };

  const updateCommissionStatus = async (id: string, status: string) => {
    try {
      await supabase.from('commissions').update({ status }).eq('id', id);
      toast.success(`Commission marked as ${status}`);
      fetchData();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const updateWithdrawalStatus = async (id: string, status: string) => {
    try {
      await supabase.from('withdrawals').update({ status }).eq('id', id);
      toast.success(`Withdrawal marked as ${status}`);
      fetchData();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Program Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Teacher Commission (%)</Label>
              <Input type="number" value={commissionPercent} onChange={e => setCommissionPercent(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Student Discount (%)</Label>
              <Input type="number" value={studentDiscountPercent} onChange={e => setStudentDiscountPercent(e.target.value)} />
            </div>
          </div>
          <Button onClick={saveSettings} disabled={savingSettings}>Save Settings</Button>
        </CardContent>
      </Card>

      <Tabs defaultValue="teachers">
        <TabsList>
          <TabsTrigger value="teachers">Teachers</TabsTrigger>
          <TabsTrigger value="withdrawals">Withdrawals ({withdrawals.filter(w => w.status === 'pending').length})</TabsTrigger>
          <TabsTrigger value="commissions">Commissions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="teachers">
          <Card>
            <CardHeader><CardTitle>Enrolled Teachers</CardTitle></CardHeader>
            <CardContent>
              <div className="divide-y">
                {teachers.map(t => (
                  <div key={t.id} className="py-4 flex justify-between items-center">
                    <div>
                      <div className="font-medium">{t.profiles?.display_name || 'Unknown'}</div>
                      <div className="text-sm text-muted-foreground">{t.profiles?.email}</div>
                    </div>
                    <div>
                      <Badge variant="outline">Code: {t.referral_code}</Badge>
                    </div>
                  </div>
                ))}
                {teachers.length === 0 && <p className="py-4 text-muted-foreground">No teachers registered yet.</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="withdrawals">
          <Card>
            <CardHeader><CardTitle>Withdrawal Requests</CardTitle></CardHeader>
            <CardContent>
              <div className="divide-y">
                {withdrawals.map(w => (
                  <div key={w.id} className="py-4 flex justify-between items-center">
                    <div>
                      <div className="font-medium">{w.teacher_profiles?.profiles?.display_name} - PKR {w.amount}</div>
                      <div className="text-sm text-muted-foreground">Bank: {w.bank_details}</div>
                      <div className="text-xs text-muted-foreground mt-1">{new Date(w.created_at).toLocaleString()}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge>{w.status}</Badge>
                      {w.status === 'pending' && (
                        <>
                          <Button size="sm" onClick={() => updateWithdrawalStatus(w.id, 'completed')}>Mark Paid</Button>
                          <Button size="sm" variant="destructive" onClick={() => updateWithdrawalStatus(w.id, 'rejected')}>Reject</Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commissions">
          <Card>
            <CardHeader><CardTitle>All Commissions</CardTitle></CardHeader>
            <CardContent>
              <div className="divide-y">
                {commissions.map(c => (
                  <div key={c.id} className="py-4 flex justify-between items-center">
                    <div>
                      <div className="font-medium">{c.teacher_profiles?.profiles?.display_name}</div>
                      <div className="text-sm text-muted-foreground">Amount: PKR {c.amount}</div>
                      <div className="text-xs text-muted-foreground mt-1">{new Date(c.created_at).toLocaleString()}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge>{c.status}</Badge>
                      {c.status === 'pending' && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => updateCommissionStatus(c.id, 'approved')}>Approve</Button>
                          <Button size="sm" variant="destructive" onClick={() => updateCommissionStatus(c.id, 'rejected')}>Reject</Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
