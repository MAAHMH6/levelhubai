import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Save, Palette } from "lucide-react";

export default function BrandSettingsManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    brand_name: "",
    short_name: "",
    logo_url: "",
    favicon_url: "",
    footer_copyright: "",
    site_title: "",
    seo_title: "",
    seo_description: "",
  });

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("app_branding").select("*").eq("id", 1).maybeSingle();
      if (data) {
        setForm({
          brand_name: data.brand_name ?? "",
          short_name: data.short_name ?? "",
          logo_url: data.logo_url ?? "",
          favicon_url: data.favicon_url ?? "",
          footer_copyright: data.footer_copyright ?? "",
          site_title: data.site_title ?? "",
          seo_title: data.seo_title ?? "",
          seo_description: data.seo_description ?? "",
        });
      }
      setLoading(false);
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("app_branding").upsert({ id: 1, ...form });
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Brand settings updated");
  };

  const upd = (k: keyof typeof form) => (e: any) => setForm((f) => ({ ...f, [k]: e.target.value }));

  if (loading) return <div className="text-muted-foreground">Loading…</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Palette className="w-5 h-5" /> Brand Settings</CardTitle>
        <CardDescription>These values are used across the site title, footer, meta tags, and emails.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div><Label>Brand name</Label><Input value={form.brand_name} onChange={upd("brand_name")} /></div>
          <div><Label>Short brand name</Label><Input value={form.short_name} onChange={upd("short_name")} /></div>
          <div><Label>Logo URL</Label><Input value={form.logo_url} onChange={upd("logo_url")} placeholder="https://…/logo.png" /></div>
          <div><Label>Favicon URL</Label><Input value={form.favicon_url} onChange={upd("favicon_url")} placeholder="https://…/favicon.ico" /></div>
          <div className="md:col-span-2"><Label>Footer copyright</Label><Input value={form.footer_copyright} onChange={upd("footer_copyright")} /></div>
          <div className="md:col-span-2"><Label>Website / browser title</Label><Input value={form.site_title} onChange={upd("site_title")} /></div>
          <div className="md:col-span-2"><Label>SEO default title</Label><Input value={form.seo_title} onChange={upd("seo_title")} /></div>
          <div className="md:col-span-2"><Label>SEO description</Label><Textarea rows={3} value={form.seo_description} onChange={upd("seo_description")} /></div>
        </div>
        <Button onClick={save} disabled={saving}><Save className="w-4 h-4 mr-2" />{saving ? "Saving…" : "Save changes"}</Button>
      </CardContent>
    </Card>
  );
}
