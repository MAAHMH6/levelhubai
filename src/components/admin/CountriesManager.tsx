import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Globe, Save, Plus, Trash2, Loader2 } from "lucide-react";

interface Country {
  code: string;
  name: string;
  currency: string;
  flag_emoji: string | null;
  timezone: string | null;
  enabled: boolean;
  is_default: boolean;
  display_order: number;
}

interface Pricing {
  id: string;
  country_code: string;
  plan: string;
  currency: string;
  monthly_price: number | null;
  yearly_price: number | null;
  lifetime_price: number | null;
  paddle_price_id: string | null;
  enabled: boolean;
}

export default function CountriesManager() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [pricing, setPricing] = useState<Pricing[]>([]);
  const [loading, setLoading] = useState(false);
  const [nc, setNc] = useState<Partial<Country>>({ code: "", name: "", currency: "USD", flag_emoji: "", enabled: true });

  const load = async () => {
    setLoading(true);
    const [{ data: cs }, { data: ps }] = await Promise.all([
      supabase.from("countries" as any).select("*").order("display_order"),
      supabase.from("country_pricing" as any).select("*"),
    ]);
    setCountries((cs as any) || []);
    setPricing((ps as any) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const saveCountry = async (c: Country) => {
    const { error } = await supabase.from("countries" as any).update({
      name: c.name, currency: c.currency, flag_emoji: c.flag_emoji, timezone: c.timezone,
      enabled: c.enabled, is_default: c.is_default, display_order: c.display_order,
    } as any).eq("code", c.code);
    if (error) toast({ title: "Save failed", description: error.message, variant: "destructive" });
    else toast({ title: "Saved" });
  };

  const addCountry = async () => {
    if (!nc.code || !nc.name) return toast({ title: "Code & name required", variant: "destructive" });
    const { error } = await supabase.from("countries" as any).insert({
      code: (nc.code || "").toUpperCase(), name: nc.name, currency: nc.currency || "USD",
      flag_emoji: nc.flag_emoji || null, enabled: true, display_order: countries.length + 1,
    } as any);
    if (error) return toast({ title: "Add failed", description: error.message, variant: "destructive" });
    setNc({ code: "", name: "", currency: "USD", flag_emoji: "", enabled: true });
    await load();
  };

  const remove = async (code: string) => {
    if (!confirm(`Delete ${code}? This also removes its pricing.`)) return;
    await supabase.from("countries" as any).delete().eq("code", code);
    load();
  };

  const savePricing = async (p: Pricing) => {
    const { error } = await supabase.from("country_pricing" as any).update({
      currency: p.currency, monthly_price: p.monthly_price, yearly_price: p.yearly_price,
      lifetime_price: p.lifetime_price, paddle_price_id: p.paddle_price_id, enabled: p.enabled,
    } as any).eq("id", p.id);
    if (error) toast({ title: "Save failed", description: error.message, variant: "destructive" });
    else toast({ title: "Pricing saved" });
  };

  const addPricing = async (country_code: string, currency: string) => {
    const { error } = await supabase.from("country_pricing" as any).insert({
      country_code, plan: "pro", currency, monthly_price: 0, yearly_price: 0, lifetime_price: 0, enabled: true,
    } as any);
    if (error) return toast({ title: "Failed", description: error.message, variant: "destructive" });
    load();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5"/> Countries & Currencies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2 md:grid-cols-5">
            <Input placeholder="Code (US)" value={nc.code || ""} onChange={e => setNc({ ...nc, code: e.target.value })} />
            <Input placeholder="Name" value={nc.name || ""} onChange={e => setNc({ ...nc, name: e.target.value })} />
            <Input placeholder="Currency (USD)" value={nc.currency || ""} onChange={e => setNc({ ...nc, currency: e.target.value })} />
            <Input placeholder="🏳️" value={nc.flag_emoji || ""} onChange={e => setNc({ ...nc, flag_emoji: e.target.value })} />
            <Button onClick={addCountry}><Plus className="h-4 w-4 mr-1"/> Add</Button>
          </div>

          {loading ? <Loader2 className="h-5 w-5 animate-spin"/> : (
            <div className="space-y-2">
              {countries.map(c => (
                <div key={c.code} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-2xl">{c.flag_emoji}</span>
                    <Input className="w-28" value={c.code} disabled />
                    <Input className="flex-1 min-w-40" value={c.name} onChange={e => setCountries(cs => cs.map(x => x.code === c.code ? { ...x, name: e.target.value } : x))} />
                    <Input className="w-24" value={c.currency} onChange={e => setCountries(cs => cs.map(x => x.code === c.code ? { ...x, currency: e.target.value } : x))} />
                    <Label className="flex items-center gap-2 text-xs"><Switch checked={c.enabled} onCheckedChange={v => setCountries(cs => cs.map(x => x.code === c.code ? { ...x, enabled: v } : x))} /> Enabled</Label>
                    <Label className="flex items-center gap-2 text-xs"><Switch checked={c.is_default} onCheckedChange={v => setCountries(cs => cs.map(x => x.code === c.code ? { ...x, is_default: v } : { ...x, is_default: false }))} /> Default</Label>
                    <Button size="sm" onClick={() => saveCountry(c)}><Save className="h-4 w-4 mr-1"/>Save</Button>
                    <Button size="icon" variant="ghost" onClick={() => remove(c.code)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                  </div>

                  {/* Pricing rows */}
                  <div className="pl-4 border-l-2 space-y-1">
                    {pricing.filter(p => p.country_code === c.code).map(p => (
                      <div key={p.id} className="grid gap-2 md:grid-cols-7 items-center">
                        <Badge variant="outline">{p.plan}</Badge>
                        <Input value={p.currency} onChange={e => setPricing(ps => ps.map(x => x.id === p.id ? { ...x, currency: e.target.value } : x))} />
                        <Input type="number" placeholder="Monthly" value={p.monthly_price ?? ""} onChange={e => setPricing(ps => ps.map(x => x.id === p.id ? { ...x, monthly_price: Number(e.target.value) } : x))} />
                        <Input type="number" placeholder="Yearly" value={p.yearly_price ?? ""} onChange={e => setPricing(ps => ps.map(x => x.id === p.id ? { ...x, yearly_price: Number(e.target.value) } : x))} />
                        <Input type="number" placeholder="Lifetime" value={p.lifetime_price ?? ""} onChange={e => setPricing(ps => ps.map(x => x.id === p.id ? { ...x, lifetime_price: Number(e.target.value) } : x))} />
                        <Input placeholder="Paddle price id" value={p.paddle_price_id ?? ""} onChange={e => setPricing(ps => ps.map(x => x.id === p.id ? { ...x, paddle_price_id: e.target.value } : x))} />
                        <Button size="sm" onClick={() => savePricing(p)}><Save className="h-4 w-4 mr-1"/>Save</Button>
                      </div>
                    ))}
                    {pricing.filter(p => p.country_code === c.code).length === 0 && (
                      <Button size="sm" variant="outline" onClick={() => addPricing(c.code, c.currency)}>
                        <Plus className="h-4 w-4 mr-1"/> Add Pro pricing for {c.name}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
