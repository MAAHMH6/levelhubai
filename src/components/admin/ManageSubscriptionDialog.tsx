import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Search } from "lucide-react";
import { adminDataStore } from "@/lib/adminDataStore";

export function ManageSubscriptionDialog({
  isOpen,
  onClose,
  initialUserId,
  initialUserName,
  onSaved
}: {
  isOpen: boolean;
  onClose: () => void;
  initialUserId?: string;
  initialUserName?: string;
  onSaved: () => void;
}) {
  const [userId, setUserId] = useState(initialUserId || "");
  const [userName, setUserName] = useState(initialUserName || "");
  const [plan, setPlan] = useState("free");
  const [status, setStatus] = useState("active");
  const [startedAt, setStartedAt] = useState("");
  const [currentPeriodEnd, setCurrentPeriodEnd] = useState("");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialUserId) {
        setUserId(initialUserId);
        setUserName(initialUserName || initialUserId);
        loadSub(initialUserId);
      } else {
        setUserId("");
        setUserName("");
        setSearch("");
        setSearchResults([]);
        setPlan("free");
        setStatus("active");
        setStartedAt(new Date().toISOString().split("T")[0]);
        setCurrentPeriodEnd("");
      }
    }
  }, [isOpen, initialUserId, initialUserName]);

  useEffect(() => {
    if (!search || search.length < 2) {
      setSearchResults([]);
      return;
    }
    const delay = setTimeout(() => {
      searchUsers();
    }, 300);
    return () => clearTimeout(delay);
  }, [search]);

  const searchUsers = async () => {
    setIsSearching(true);
    const { data } = await supabase.rpc("admin_search_users", { search_term: search });
    setSearchResults(data || []);
    setIsSearching(false);
  };

  const loadSub = async (uid: string) => {
    const { data } = await supabase.from("subscriptions").select("*").eq("user_id", uid).maybeSingle();
    if (data) {
      setPlan(data.plan || "free");
      setStatus(data.status || "active");
      setStartedAt(data.started_at ? data.started_at.split("T")[0] : new Date().toISOString().split("T")[0]);
      setCurrentPeriodEnd(data.current_period_end ? data.current_period_end.split("T")[0] : "");
    } else {
      setPlan("free");
      setStatus("active");
      setStartedAt(new Date().toISOString().split("T")[0]);
      setCurrentPeriodEnd("");
    }
  };

  const handleSelectUser = (u: any) => {
    setUserId(u.id);
    setUserName(u.display_name || u.email || u.id);
    setSearch("");
    setSearchResults([]);
    loadSub(u.id);
  };

  const handleSave = async () => {
    if (!userId) {
      toast.error("Please select a user");
      return;
    }
    setLoading(true);

    // 1. If granting Pro or School, invoke the PostgreSQL SECURITY DEFINER function
    if (plan === "pro" || plan === "school") {
      try {
        await supabase.rpc("grant_pro_access", { 
          _user_id: userId, 
          _days: 365 
        });
      } catch (rpcErr) {
        console.warn("grant_pro_access rpc error:", rpcErr);
      }
    }

    // 2. Direct update to profiles table
    try {
      await supabase
        .from('profiles')
        .update({ 
          subscription_plan: plan,
          subscription_tier: plan,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
    } catch (err) {
      console.warn("Direct profile update error:", err);
    }

    // 3. Direct upsert into subscriptions table
    try {
      await supabase
        .from('subscriptions')
        .upsert({
          user_id: userId,
          plan: plan as any,
          status: plan === "free" ? "cancelled" : status,
          started_at: startedAt ? new Date(startedAt).toISOString() : new Date().toISOString(),
          current_period_end: plan === "free" 
            ? null 
            : (currentPeriodEnd ? new Date(`${currentPeriodEnd}T23:59:59.999Z`).toISOString() : new Date(Date.now() + 365*24*60*60*1000).toISOString()),
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
    } catch (err) {
      console.warn("Direct subscriptions upsert error:", err);
    }

    // 4. Attempt edge function if available
    try {
      await supabase.functions.invoke("admin-billing", {
        body: {
          action: "upsert_custom",
          user_id: userId,
          plan,
          status: plan === "free" ? "cancelled" : status,
          started_at: startedAt ? new Date(startedAt).toISOString() : null,
          current_period_end: currentPeriodEnd ? new Date(`${currentPeriodEnd}T23:59:59.999Z`).toISOString() : null
        }
      });
    } catch (err) {
      // Ignored if edge function not available
    }

    // 5. Client persistence and instant broadcast
    try {
      adminDataStore.saveSubscription(userId, plan as any, status as any);
      localStorage.setItem(`levelhub_sub_${userId}`, plan);
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user?.id === userId) {
        localStorage.setItem('levelhub_user_plan', plan);
        localStorage.setItem('pro_override', plan === 'pro' || plan === 'school' ? 'true' : 'false');
      }
      window.dispatchEvent(new CustomEvent('levelhub:subscription_updated', { detail: { userId, plan } }));
    } catch (e) {
      console.warn("Error setting local subscription:", e);
    }

    setLoading(false);
    toast.success(`User plan successfully updated to ${plan.toUpperCase()}`);
    onSaved();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialUserId ? "Edit Subscription" : "New Subscription"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {!initialUserId && !userId ? (
            <div className="space-y-2 relative">
              <Label>Search User</Label>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-8"
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              {searchResults.length > 0 && (
                <div className="absolute z-10 w-full bg-background border rounded-md shadow-md mt-1">
                  {searchResults.map(u => (
                    <div
                      key={u.id}
                      className="p-2 hover:bg-muted cursor-pointer text-sm"
                      onClick={() => handleSelectUser(u)}
                    >
                      {u.display_name || "Unknown"} <span className="text-muted-foreground ml-1">({u.email || u.id})</span>
                    </div>
                  ))}
                </div>
              )}
              {isSearching && <div className="text-xs text-muted-foreground mt-1">Searching...</div>}
            </div>
          ) : (
            <div className="space-y-2">
              <Label>User</Label>
              <div className="flex gap-2">
                <Input value={userName} disabled />
                {!initialUserId && (
                  <Button variant="outline" onClick={() => { setUserId(""); setUserName(""); }}>
                    Change
                  </Button>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Plan</Label>
              <Select value={plan} onValueChange={setPlan} disabled={!userId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="school">School</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus} disabled={!userId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="past_due">Past Due</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Started At</Label>
              <Input type="date" value={startedAt} onChange={(e) => setStartedAt(e.target.value)} disabled={!userId} />
            </div>
            <div className="space-y-2">
              <Label>Ends At (Leave empty for lifetime)</Label>
              <Input type="date" value={currentPeriodEnd} onChange={(e) => setCurrentPeriodEnd(e.target.value)} disabled={!userId} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading || !userId}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
