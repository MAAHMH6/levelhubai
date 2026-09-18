import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge as UiBadge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Award, Sparkles, Loader2, CheckCircle2, RefreshCw } from "lucide-react";
import { seedBadges, BADGE_DEFINITIONS } from "@/lib/badgeSeeder";

export default function BadgesManager() {
  const [badges, setBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  const fetchBadges = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("badges")
      .select("*")
      .order("requirement_value", { ascending: true });

    if (error) {
      console.error(error);
    } else {
      setBadges(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBadges();
  }, []);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const res = await seedBadges();
      if (res.errors.length > 0) {
        toast.error(`Seeded with errors: ${res.errors.join(", ")}`);
      } else {
        toast.success(`Successfully seeded! ${res.inserted} new badges added (${res.skipped} already existed).`);
      }
      fetchBadges();
    } catch (err: any) {
      toast.error(err.message || "Failed to seed badges");
    } finally {
      setSeeding(false);
    }
  };

  const getRarityBadge = (rarity: string) => {
    switch (rarity) {
      case "legendary":
        return <UiBadge className="bg-amber-500 text-white font-bold">Legendary</UiBadge>;
      case "epic":
        return <UiBadge className="bg-purple-600 text-white font-bold">Epic</UiBadge>;
      case "rare":
        return <UiBadge className="bg-blue-500 text-white font-bold">Rare</UiBadge>;
      default:
        return <UiBadge variant="outline">Common</UiBadge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Award className="h-6 w-6 text-primary" />
            Badges & Gamification Manager
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage and seed all {BADGE_DEFINITIONS.length} Cambridge achievement badges across streaks, XP, quizzes, and levels.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchBadges} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button 
            onClick={handleSeed} 
            disabled={seeding}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-md"
          >
            {seeding ? (
              <>
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                Seeding Badges...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-1.5" />
                Seed 25+ Badges into Supabase
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 bg-card border-border">
          <div className="text-xs font-semibold text-muted-foreground uppercase">Badges in DB</div>
          <div className="text-2xl font-black text-primary mt-1">{badges.length}</div>
        </Card>
        <Card className="p-4 bg-card border-border">
          <div className="text-xs font-semibold text-muted-foreground uppercase">Target Catalog</div>
          <div className="text-2xl font-black text-foreground mt-1">{BADGE_DEFINITIONS.length} Badges</div>
        </Card>
        <Card className="p-4 bg-card border-border">
          <div className="text-xs font-semibold text-muted-foreground uppercase">Streak Badges</div>
          <div className="text-2xl font-black text-orange-500 mt-1">
            {BADGE_DEFINITIONS.filter(b => b.category === "streak").length}
          </div>
        </Card>
        <Card className="p-4 bg-card border-border">
          <div className="text-xs font-semibold text-muted-foreground uppercase">XP & Level Badges</div>
          <div className="text-2xl font-black text-purple-500 mt-1">
            {BADGE_DEFINITIONS.filter(b => b.category === "xp" || b.category === "level").length}
          </div>
        </Card>
      </div>

      {/* Badges Grid */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg">All Registered Badges</CardTitle>
          <CardDescription>
            Live badges awarded to students when reaching specific milestones.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : badges.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <Award className="h-12 w-12 text-muted-foreground mx-auto" />
              <div>
                <h3 className="font-bold text-foreground">No Badges Found in Supabase</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Click the button below to automatically seed all 25+ achievement badges.
                </p>
              </div>
              <Button onClick={handleSeed} disabled={seeding}>
                <Sparkles className="h-4 w-4 mr-2" />
                Seed Badges Now
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {badges.map((b) => (
                <div 
                  key={b.id || b.name} 
                  className="p-4 rounded-2xl border border-border bg-card/60 hover:bg-muted/40 transition-colors flex flex-col justify-between gap-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-2xl shadow-inner shrink-0">
                      {b.icon}
                    </div>
                    {getRarityBadge(b.rarity)}
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-foreground">{b.name}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{b.description}</p>
                  </div>

                  <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-mono">
                      {b.requirement_type}: <strong className="text-foreground">{b.requirement_value}</strong>
                    </span>
                    <span className="font-bold text-teal-600 dark:text-teal-400">+{b.xp_reward} XP</span>
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
