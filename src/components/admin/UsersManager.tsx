import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Search, Flame, Star, Coins, Phone, CheckCircle2, AlertCircle } from "lucide-react";
import { ManageSubscriptionDialog } from "./ManageSubscriptionDialog";
import { adminDataStore } from "@/lib/adminDataStore";

interface UserProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  grade_level: string | null;
  school: string | null;
  country: string | null;
  city: string | null;
  phone_number: string | null;
  profile_complete: boolean | null;
  xp_points: number;
  level: number;
  streak_days: number;
  coins: number;
  subscription_plan: string | null;
  created_at: string;
  updated_at: string;
}

const UsersManager = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [manageUserId, setManageUserId] = useState<string | undefined>();
  const [manageUserName, setManageUserName] = useState<string | undefined>();
  const [manageDialogOpen, setManageDialogOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'complete' | 'incomplete'>('all');

  const openManage = (userId: string, userName: string | null) => {
    setManageUserId(userId);
    setManageUserName(userName || undefined);
    setManageDialogOpen(true);
  };

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) {
      const merged = adminDataStore.applyProfileOverrides(data as any[]);
      setUsers(merged as UserProfile[]);
    }
    if (error) console.error(error);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();

    const handleSubChange = () => { fetchUsers(); };
    window.addEventListener("levelhub:subscription_updated", handleSubChange);
    window.addEventListener("levelhub:profile_updated", handleSubChange);
    return () => {
      window.removeEventListener("levelhub:subscription_updated", handleSubChange);
      window.removeEventListener("levelhub:profile_updated", handleSubChange);
    };
  }, []);

  const filtered = users.filter(u => {
    const term = search.toLowerCase();
    const matchesSearch = (
      (u.display_name || "").toLowerCase().includes(term) ||
      (u.school || "").toLowerCase().includes(term) ||
      (u.grade_level || "").toLowerCase().includes(term) ||
      (u.phone_number || "").toLowerCase().includes(term) ||
      (u.country || "").toLowerCase().includes(term) ||
      (u.city || "").toLowerCase().includes(term)
    );

    // Also check adminDataStore for locally-saved phone
    const localOverride = adminDataStore.getProfileOverride(u.id);
    const effectivePhone = u.phone_number || localOverride?.phone_number;
    const isComplete = u.profile_complete || localOverride?.profile_complete;

    if (activeFilter === 'complete' && !isComplete) return false;
    if (activeFilter === 'incomplete' && isComplete) return false;
    return matchesSearch;
  });

  const totalXP = users.reduce((sum, u) => sum + u.xp_points, 0);
  const activeToday = users.filter(u => {
    const updated = new Date(u.updated_at);
    const today = new Date();
    return updated.toDateString() === today.toDateString();
  }).length;

  const completeCount = users.filter(u => {
    const localOverride = adminDataStore.getProfileOverride(u.id);
    return u.profile_complete || localOverride?.profile_complete;
  }).length;

  const getEffectivePhone = (u: UserProfile) => {
    const localOverride = adminDataStore.getProfileOverride(u.id);
    return u.phone_number || localOverride?.phone_number || null;
  };

  const isEffectivelyComplete = (u: UserProfile) => {
    const localOverride = adminDataStore.getProfileOverride(u.id);
    return !!(u.profile_complete || localOverride?.profile_complete);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          User Activity & Profiles ({users.length} users)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold">{users.length}</p>
            <p className="text-xs text-muted-foreground">Total Users</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold">{activeToday}</p>
            <p className="text-xs text-muted-foreground">Active Today</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold">{totalXP.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total XP Earned</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold">{users.filter(u => u.subscription_plan && u.subscription_plan !== 'free').length}</p>
            <p className="text-xs text-muted-foreground">Premium Users</p>
          </div>
          <div className="bg-green-500/10 rounded-lg p-3 text-center border border-green-500/20">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{completeCount}</p>
            <p className="text-xs text-muted-foreground">Profiles Complete</p>
          </div>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, school, phone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-1.5">
            {(['all', 'complete', 'incomplete'] as const).map(f => (
              <Button
                key={f}
                size="sm"
                variant={activeFilter === f ? 'default' : 'outline'}
                onClick={() => setActiveFilter(f)}
                className="capitalize text-xs h-9"
              >
                {f === 'complete' && <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-green-500" />}
                {f === 'incomplete' && <AlertCircle className="w-3.5 h-3.5 mr-1 text-orange-400" />}
                {f}
              </Button>
            ))}
          </div>
        </div>

        {/* User List */}
        {loading ? (
          <p className="text-muted-foreground text-sm">Loading users...</p>
        ) : (
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filtered.map(user => {
              const phone = getEffectivePhone(user);
              const complete = isEffectivelyComplete(user);
              return (
                <div key={user.id} className="border border-border rounded-lg p-3 flex items-start gap-3">
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage src={user.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {user.display_name?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-sm truncate">{user.display_name || "No Name"}</p>
                      <Badge variant={user.subscription_plan === 'free' || !user.subscription_plan ? "secondary" : "default"} className="text-xs">
                        {user.subscription_plan || "free"}
                      </Badge>
                      {complete ? (
                        <Badge variant="outline" className="text-xs text-green-600 border-green-500/30 bg-green-500/10 gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Profile Complete
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs text-orange-500 border-orange-400/30 bg-orange-400/10 gap-1">
                          <AlertCircle className="w-3 h-3" /> Incomplete
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                      {user.school && <span>🏫 {user.school}</span>}
                      {user.grade_level && <span>📚 {user.grade_level}</span>}
                      {user.city && <span>📍 {user.city}, {user.country}</span>}
                      {phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-teal-500" />
                          <span className="font-mono">{phone}</span>
                        </span>
                      )}
                      <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs shrink-0 flex-wrap justify-end">
                    <div className="flex items-center gap-1" title="XP">
                      <Star className="h-3.5 w-3.5 text-primary" />
                      <span className="font-medium">{user.xp_points}</span>
                    </div>
                    <div className="flex items-center gap-1" title="Streak">
                      <Flame className="h-3.5 w-3.5 text-orange-500" />
                      <span className="font-medium">{user.streak_days}</span>
                    </div>
                    <div className="flex items-center gap-1" title="Coins">
                      <Coins className="h-3.5 w-3.5 text-yellow-500" />
                      <span className="font-medium">{user.coins}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">Lv.{user.level}</Badge>
                    <Button size="sm" variant="outline" className="ml-1 h-7 text-xs" onClick={() => openManage(user.id, user.display_name)}>
                      Manage Sub
                    </Button>
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <p className="text-muted-foreground text-sm text-center py-4">No users found</p>
            )}
          </div>
        )}
      </CardContent>
      <ManageSubscriptionDialog
        isOpen={manageDialogOpen}
        onClose={() => setManageDialogOpen(false)}
        initialUserId={manageUserId}
        initialUserName={manageUserName}
        onSaved={fetchUsers}
      />
    </Card>
  );
};

export default UsersManager;
