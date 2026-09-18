import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Save, Share2 } from "lucide-react";

interface Row {
  key: string;
  label: string;
  url: string | null;
  enabled: boolean;
  sort_order: number;
}

export default function SocialLinksManager() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("social_links").select("*").order("sort_order");
      setRows((data as any) ?? []);
      setLoading(false);
    })();
  }, []);

  const update = (key: string, patch: Partial<Row>) =>
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("social_links").upsert(rows as any);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Social links updated");
  };

  if (loading) return <div className="text-muted-foreground">Loading…</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Share2 className="w-5 h-5" /> Social Links</CardTitle>
        <CardDescription>Only enabled links with a URL appear in the footer and contact pages.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.map((r) => (
          <div key={r.key} className="grid grid-cols-1 md:grid-cols-[140px_1fr_auto] items-center gap-3 border rounded-lg p-3">
            <Label className="font-semibold">{r.label}</Label>
            <Input
              value={r.url ?? ""}
              onChange={(e) => update(r.key, { url: e.target.value })}
              placeholder={`https://…${r.key === "whatsapp" ? " or wa.me/…" : ""}`}
            />
            <div className="flex items-center gap-2 justify-end">
              <span className="text-xs text-muted-foreground">Show</span>
              <Switch checked={r.enabled} onCheckedChange={(v) => update(r.key, { enabled: v })} />
            </div>
          </div>
        ))}
        <Button onClick={save} disabled={saving}><Save className="w-4 h-4 mr-2" />{saving ? "Saving…" : "Save all"}</Button>
      </CardContent>
    </Card>
  );
}
