import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Bell, Send, CheckCircle, Mail, Info } from "lucide-react";

interface Subject { id: string; name: string; }
interface Unit { id: string; title: string; unit_number: number; subject_id: string; }
interface LessonSummary { id: string; unit_id: string; video_url: string | null; }

const NotifyStudentsManager = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [units, setUnits] = useState<Unit[]>([]);
  const [lessons, setLessons] = useState<LessonSummary[]>([]);
  const [sending, setSending] = useState<Record<string, boolean>>({});
  const [alsoEmail, setAlsoEmail] = useState(true);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailIntro, setEmailIntro] = useState("");

  useEffect(() => {
    supabase.from("subjects").select("id, name").order("name").then(({ data }) => { if (data) setSubjects(data); });
  }, []);

  useEffect(() => {
    if (!selectedSubject) return;
    const load = async () => {
      const { data: unitData } = await supabase.from("units").select("id, title, unit_number, subject_id").eq("subject_id", selectedSubject).order("unit_number");
      if (unitData) {
        setUnits(unitData);
        const ids = unitData.map(u => u.id);
        if (ids.length > 0) {
          const { data: lessonData } = await supabase.from("lessons").select("id, unit_id, video_url").in("unit_id", ids);
          if (lessonData) setLessons(lessonData);
        }
      }
    };
    load();
  }, [selectedSubject]);

  const getUnitVideoStats = (unitId: string) => {
    const unitLessons = lessons.filter(l => l.unit_id === unitId);
    const withVideo = unitLessons.filter(l => l.video_url);
    return { total: unitLessons.length, uploaded: withVideo.length, allDone: unitLessons.length > 0 && withVideo.length === unitLessons.length };
  };

  const buildEmailHtml = (unitTitle: string, subjectName: string) => {
    const baseUrl = window.location.origin;
    const intro = emailIntro?.trim()
      || `All videos for "${unitTitle}" in ${subjectName} are now uploaded on LevelHubAI. Jump back in and keep your streak going!`;
    return `
      <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111">
        <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:12px;padding:24px;color:#fff;margin-bottom:20px">
          <h1 style="margin:0;font-size:22px">🎬 New Content Available!</h1>
          <p style="margin:8px 0 0;opacity:.9">${subjectName} · ${unitTitle}</p>
        </div>
        <p style="font-size:15px;line-height:1.6">${intro}</p>
        <p style="margin-top:24px">
          <a href="${baseUrl}/dashboard"
             style="background:#6366f1;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">
            Start Learning →
          </a>
        </p>
        <hr style="border:none;border-top:1px solid #eee;margin:32px 0"/>
        <p style="color:#888;font-size:12px">You're receiving this because you have an account on LevelHubAI.</p>
      </div>
    `;
  };

  const notifyStudents = async (unit: Unit) => {
    setSending(prev => ({ ...prev, [unit.id]: true }));
    try {
      const subjectName = subjects.find(s => s.id === unit.subject_id)?.name || "Unknown";

      // 1) In-app notifications
      const { data: profiles, error: profileError } = await supabase.from("profiles").select("id");
      if (profileError) throw profileError;
      if (!profiles || profiles.length === 0) {
        toast({ title: "No users", description: "No students to notify.", variant: "destructive" });
        return;
      }

      const notifications = profiles.map(p => ({
        user_id: p.id,
        type: "unit_ready",
        title: "🎬 New Content Available!",
        message: `All videos for "${unit.title}" in ${subjectName} are now uploaded. Start learning!`,
        data: { unit_id: unit.id, subject_id: unit.subject_id },
      }));

      for (let i = 0; i < notifications.length; i += 100) {
        const batch = notifications.slice(i, i + 100);
        const { error } = await supabase.from("notifications").insert(batch as any);
        if (error) throw error;
      }

      toast({ title: "In-app sent!", description: `Notified ${profiles.length} students.` });

      // 2) Optional: bulk email via Resend
      if (alsoEmail) {
        const subjectLine = emailSubject?.trim() || `🎬 New in ${subjectName}: ${unit.title}`;
        const html = buildEmailHtml(unit.title, subjectName);

        const { data, error } = await supabase.functions.invoke("send-bulk-notification-email", {
          body: { subject: subjectLine, html, unit_id: unit.id, subject_id: unit.subject_id },
        });
        if (error) throw error;
        toast({
          title: "Emails sent",
          description: `Delivered to ${data?.sent ?? 0} users${data?.failed ? ` (${data.failed} failed)` : ""}.`,
        });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSending(prev => ({ ...prev, [unit.id]: false }));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Notify Students (Unit Ready)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Send in-app notifications when a unit's videos are all uploaded. Optionally email every user via Resend.
        </p>

        {/* Email settings */}
        <div className="border border-border rounded-lg p-4 space-y-4 bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              <Label htmlFor="email-toggle" className="font-medium cursor-pointer">
                Also send email via Resend
              </Label>
            </div>
            <Switch id="email-toggle" checked={alsoEmail} onCheckedChange={setAlsoEmail} />
          </div>

          {alsoEmail && (
            <div className="space-y-3">
              <div>
                <Label htmlFor="email-subject" className="text-xs">Email subject (optional)</Label>
                <Input
                  id="email-subject"
                  placeholder="Defaults to: 🎬 New in {Subject}: {Unit}"
                  value={emailSubject}
                  onChange={e => setEmailSubject(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="email-intro" className="text-xs">Message body (optional)</Label>
                <Textarea
                  id="email-intro"
                  placeholder="Leave blank for default message about the unit videos being ready."
                  value={emailIntro}
                  onChange={e => setEmailIntro(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span>Emails are sent BCC in batches of 50 from <code>onboarding@resend.dev</code>. Verify a domain in Resend to send from your own address.</span>
              </div>
            </div>
          )}
        </div>

        {/* Subject picker */}
        <div className="max-w-xs">
          <Label className="text-xs mb-1 block">Choose subject</Label>
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger><SelectValue placeholder="Select subject..." /></SelectTrigger>
            <SelectContent>{subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>

        {units.length > 0 && (
          <div className="space-y-2">
            {units.map(unit => {
              const stats = getUnitVideoStats(unit.id);
              return (
                <div key={unit.id} className="border border-border rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Unit {unit.unit_number}: {unit.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={stats.allDone ? "default" : "secondary"} className="text-xs">
                        {stats.uploaded}/{stats.total} videos
                      </Badge>
                      {stats.allDone && <CheckCircle className="h-4 w-4 text-green-500" />}
                      {alsoEmail && (
                        <Badge variant="outline" className="text-xs gap-1">
                          <Mail className="h-3 w-3" /> Email on
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    disabled={!stats.allDone || sending[unit.id]}
                    onClick={() => notifyStudents(unit)}
                    variant={stats.allDone ? "default" : "outline"}
                  >
                    <Send className="h-4 w-4 mr-1" />
                    {sending[unit.id] ? "Sending..." : alsoEmail ? "Notify + Email" : "Notify All"}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotifyStudentsManager;
