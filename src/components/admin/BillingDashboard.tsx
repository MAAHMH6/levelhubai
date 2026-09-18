import { useEffect, useState } from "react";
import { ManageSubscriptionDialog } from "./ManageSubscriptionDialog";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";

export default function BillingDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [subs, setSubs] = useState<any[]>([]);
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [query, setQuery] = useState("");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [manageUserId, setManageUserId] = useState<string | undefined>();
  const [manageUserName, setManageUserName] = useState<string | undefined>();
  const [manageDialogOpen, setManageDialogOpen] = useState(false);

  const loadAll = async () => {
    const { data: s } = await supabase.functions.invoke("admin-billing", { body: { action: "stats" } });
    setStats(s);
    const { data: rows } = await supabase.from("subscriptions")
      .select("*")
      .order("updated_at", { ascending: false }).limit(200);
    
    let enrichedRows: any[] = [];
    if (rows && rows.length > 0) {
      const userIds = rows.map(r => r.user_id);
      const { data: profiles } = await supabase.from("profiles").select("id, display_name, avatar_url").in("id", userIds);
      const profileMap = Object.fromEntries((profiles || []).map(p => [p.id, p]));
      enrichedRows = rows.map(r => ({ ...r, profiles: profileMap[r.user_id] }));
    }
    setSubs(enrichedRows);
    const { data: st } = await supabase.from("pricing_settings").select("key,value");
    const map: Record<string, any> = {};
    (st ?? []).forEach((r: any) => { map[r.key] = r.value; });
    setSettings(map);
  };
  useEffect(() => { loadAll(); }, []);

  const act = async (action: string, user_id: string, extra: any = {}) => {
    const { error } = await supabase.functions.invoke("admin-billing", { body: { action, user_id, ...extra } });
    if (error) toast.error(error.message); else { toast.success("Done"); loadAll(); }
  };

  const openManage = (userId?: string, userName?: string) => {
    setManageUserId(userId);
    setManageUserName(userName);
    setManageDialogOpen(true);
  };

  const saveSetting = async (key: string, val: any) => {
    const { error } = await supabase.from("pricing_settings").upsert({ key, value: val, updated_at: new Date().toISOString() });
    if (error) toast.error(error.message); else toast.success(`${key} saved`);
  };

  const filtered = subs.filter((r) => {
    if (planFilter !== "all" && r.plan !== planFilter) return false;
    if (!query) return true;
    return (r.profiles?.display_name ?? "").toLowerCase().includes(query.toLowerCase())
      || r.user_id.includes(query);
  });

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-4">
        <Kpi title="Total revenue" value={fmtMoney(stats?.totalRevenueCents)} />
        <Kpi title="This month" value={fmtMoney(stats?.mrrCents)} />
        <Kpi title="Active subs" value={stats?.counts?.active ?? 0} />
        <Kpi title="Pro / Free / School" value={`${stats?.counts?.pro ?? 0} / ${stats?.counts?.free ?? 0} / ${stats?.counts?.school ?? 0}`} />
      </div>

      <Card>
        <CardHeader><CardTitle>Pricing settings</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <SettingRow label="Pro monthly price (PKR)" k="pro_monthly_price_pkr" val={settings.pro_monthly_price_pkr} onSave={saveSetting} parseNum />
          <SettingRow label="Trial days" k="trial_days" val={settings.trial_days} onSave={saveSetting} parseNum />
          <SettingRow label="Free daily quiz limit" k="free_daily_quiz_limit" val={settings.free_daily_quiz_limit} onSave={saveSetting} parseNum />
          <SettingRow label="School contact email" k="school_contact_email" val={settings.school_contact_email} onSave={saveSetting} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between gap-3">
          <CardTitle>Subscribers</CardTitle>
          <div className="flex items-center gap-2">
            <Input placeholder="Search name / user id…" value={query} onChange={(e) => setQuery(e.target.value)} className="w-64" />
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All plans</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="school">School</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => openManage()}>New Subscription</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground">
                <tr><th className="py-2">User</th><th>Plan</th><th>Status</th><th>Renews</th><th className="text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td className="py-2">
                      <div className="font-medium">{r.profiles?.display_name ?? "—"}</div>
                      <div className="text-xs text-muted-foreground">{r.user_id.slice(0, 8)}…</div>
                    </td>
                    <td><Badge variant="outline" className="capitalize">{r.plan}</Badge></td>
                    <td><Badge variant={r.status === "active" ? "default" : "secondary"}>{r.status}</Badge></td>
                    <td className="text-xs">{r.current_period_end ? format(new Date(r.current_period_end), "PP") : "—"}</td>
                    <td className="text-right space-x-1">
                      <Button size="sm" variant="outline" onClick={() => openManage(r.user_id, r.profiles?.display_name)}>Edit</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      <ManageSubscriptionDialog
        isOpen={manageDialogOpen}
        onClose={() => setManageDialogOpen(false)}
        initialUserId={manageUserId}
        initialUserName={manageUserName}
        onSaved={loadAll}
      />
    </div>
  );
}

function Kpi({ title, value }: { title: string; value: any }) {
  return (
    <Card><CardContent className="p-4">
      <div className="text-xs text-muted-foreground">{title}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </CardContent></Card>
  );
}

function SettingRow({ label, k, val, onSave, parseNum }: { label: string; k: string; val: any; onSave: (k: string, v: any) => void; parseNum?: boolean; }) {
  const [v, setV] = useState<string>(val != null ? String(typeof val === "string" ? val : JSON.stringify(val)).replace(/^"|"$/g, "") : "");
  useEffect(() => { setV(val != null ? String(typeof val === "string" ? val : JSON.stringify(val)).replace(/^"|"$/g, "") : ""); }, [val]);
  
  const handleSave = () => {
    if (parseNum) {
      const num = Number(v);
      if (isNaN(num)) {
        toast.error(`Invalid number for ${label}`);
        return;
      }
      onSave(k, num);
    } else {
      onSave(k, v);
    }
  };

  return (
    <div className="flex items-end gap-2">
      <div className="flex-1"><Label>{label}</Label><Input value={v} onChange={(e) => setV(e.target.value)} /></div>
      <Button onClick={handleSave}>Save</Button>
    </div>
  );
}

function fmtMoney(cents?: number) {
  if (!cents) return "PKR 0";
  return `PKR ${(cents / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}
