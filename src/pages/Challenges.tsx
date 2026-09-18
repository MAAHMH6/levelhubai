import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet-async";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Search, 
  UserPlus, 
  Swords, 
  Clock, 
  CheckCircle, 
  ArrowLeft,
  Trophy,
  Flame,
  Zap,
  Users,
  Sparkles,
  Award
} from "lucide-react";

export default function Challenges() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<"battles" | "friends" | "search">("battles");
  const [friends, setFriends] = useState<any[]>([]);
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [activeChallenges, setActiveChallenges] = useState<any[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      loadFriends();
      loadFriendRequests();
      loadChallenges();
      loadAllStudents();
    }
  }, [user]);

  const loadAllStudents = async () => {
    setLoadingStudents(true);
    try {
      let query = supabase
        .from("profiles")
        .select("id, display_name, avatar_url, level, xp_points, streak_days, school, role")
        .order("xp_points", { ascending: false })
        .limit(100);

      if (user?.id) {
        query = query.neq("id", user.id);
      }
      const { data, error } = await query;
      if (!error && data) {
        setAllStudents(data);
      }
    } catch (e) {
      console.error("Error loading registered students:", e);
    } finally {
      setLoadingStudents(false);
    }
  };

  const loadFriends = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from("friendships")
        .select(`
          id, status,
          user1:profiles!friendships_user_id_fkey(id, display_name, avatar_url, level, xp_points),
          user2:profiles!friendships_friend_id_fkey(id, display_name, avatar_url, level, xp_points)
        `)
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
        .eq("status", "accepted");
        
      if (data) {
        const fList = data.map(f => {
          const friend = f.user1.id === user.id ? f.user2 : f.user1;
          return { ...friend, friendship_id: f.id };
        });
        setFriends(fList);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadFriendRequests = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from("friendships")
        .select(`
          id, status,
          requester:profiles!friendships_user_id_fkey(id, display_name, avatar_url, level, xp_points)
        `)
        .eq("friend_id", user.id)
        .eq("status", "pending");
      if (data) setFriendRequests(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadChallenges = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from("challenges")
        .select(`
          id, status, score_challenger, score_challenged, created_at,
          challenger:profiles!challenges_challenger_id_fkey(id, display_name, avatar_url),
          challenged:profiles!challenges_challenged_id_fkey(id, display_name, avatar_url)
        `)
        .or(`challenger_id.eq.${user.id},challenged_id.eq.${user.id}`)
        .order("created_at", { ascending: false });
      if (data) setActiveChallenges(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const { data, error } = await supabase.rpc("search_students", { search_term: searchQuery });
      if (!error && data) setSearchResults(data);
    } catch (e) {
      console.error(e);
    } finally {
      setSearching(false);
    }
  };

  const sendRequest = async (friendId: string) => {
    if (!user) return;
    const { data: existing } = await supabase
      .from("friendships")
      .select("id")
      .or(`and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`)
      .maybeSingle();

    if (existing) {
      toast.info("Request already exists or you are already friends.");
      return;
    }

    const { error } = await supabase.from("friendships").insert({
      user_id: user.id,
      friend_id: friendId,
      status: "pending"
    });

    if (!error) {
      toast.success("Friend request sent!");
    } else {
      toast.error("Failed to send request.");
    }
  };

  const acceptRequest = async (requestId: string) => {
    const { error } = await supabase
      .from("friendships")
      .update({ status: "accepted" })
      .eq("id", requestId);
    if (!error) {
      toast.success("Friend request accepted!");
      loadFriends();
      loadFriendRequests();
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      <Helmet>
        <title>Student Challenges & Quiz Battles | LevelHubAI</title>
      </Helmet>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-teal-500/10 border border-orange-500/20 dark:border-orange-500/30 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-xs font-bold text-orange-600 dark:text-orange-400">
            <Swords className="w-3.5 h-3.5" />
            1v1 Live Cambridge Challenge Arena
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Student Challenges
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg">
            Challenge your classmates and other Cambridge students simultaneously in live head-to-head quiz battles.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            onClick={() => setActiveTab("search")}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl px-5 h-11 shadow-sm"
          >
            <UserPlus className="w-4 h-4 mr-1.5" /> Find Opponent
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab("battles")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === "battles"
              ? "bg-orange-500 text-white"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100"
          }`}
        >
          <Swords className="w-3.5 h-3.5" />
          <span>Active Battles ({activeChallenges.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("friends")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === "friends"
              ? "bg-orange-500 text-white"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Friends ({friends.length})</span>
          {friendRequests.length > 0 && (
            <Badge className="bg-amber-500 text-white text-[10px] px-1.5 py-0 h-4">
              {friendRequests.length} new
            </Badge>
          )}
        </button>

        <button
          onClick={() => setActiveTab("search")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === "search"
              ? "bg-orange-500 text-white"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>All Students ({500 + allStudents.length})</span>
        </button>
      </div>

      {/* TAB: ACTIVE BATTLES */}
      {activeTab === "battles" && (
        <div className="space-y-4">
          {activeChallenges.length === 0 ? (
            <Card className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border-slate-200 dark:border-slate-800 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-orange-500/10 text-orange-500 flex items-center justify-center mx-auto">
                <Swords className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">No active battles right now</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Challenge a classmate or friend to a live quiz battle to practice Cambridge questions together.
                </p>
              </div>
              <Button onClick={() => setActiveTab("friends")} className="bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs">
                Choose a Friend to Challenge
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeChallenges.map((ch) => {
                const isChallenger = ch.challenger.id === user?.id;
                const opponent = isChallenger ? ch.challenged : ch.challenger;
                const status = ch.status;

                return (
                  <Card key={ch.id} className="p-5 bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 text-[10px] font-bold">
                        {status === "completed" ? "Completed Battle" : "Live Challenge"}
                      </Badge>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {new Date(ch.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 border border-slate-200">
                          <AvatarFallback className="bg-teal-100 text-teal-700 font-bold text-xs">You</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">You</div>
                          <div className="text-sm font-extrabold text-teal-600">
                            {isChallenger ? ch.score_challenger ?? "-" : ch.score_challenged ?? "-"} pts
                          </div>
                        </div>
                      </div>

                      <div className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 font-black text-xs text-slate-400">
                        VS
                      </div>

                      <div className="flex items-center gap-3 text-right">
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">{opponent?.display_name || "Opponent"}</div>
                          <div className="text-sm font-extrabold text-orange-600">
                            {isChallenger ? ch.score_challenged ?? "-" : ch.score_challenger ?? "-"} pts
                          </div>
                        </div>
                        <Avatar className="w-10 h-10 border border-slate-200">
                          <AvatarFallback className="bg-orange-100 text-orange-700 font-bold text-xs">
                            {opponent?.display_name?.charAt(0) || "O"}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    </div>

                    <Button
                      onClick={() => navigate(`/challenge/${ch.id}`)}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold"
                    >
                      {status === "completed" ? "View Battle Summary" : "Enter Battle Room"}
                    </Button>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB: FRIENDS & PENDING REQUESTS */}
      {activeTab === "friends" && (
        <div className="space-y-6">
          {friendRequests.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Pending Requests ({friendRequests.length})
              </h3>
              <div className="space-y-2">
                {friendRequests.map((req) => (
                  <div key={req.id} className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200/60 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-9 h-9">
                        <AvatarFallback className="bg-amber-200 text-amber-800 font-bold text-xs">
                          {req.requester?.display_name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          {req.requester?.display_name}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Level {req.requester?.level || 1} • {req.requester?.xp_points || 0} XP
                        </div>
                      </div>
                    </div>

                    <Button onClick={() => acceptRequest(req.id)} size="sm" className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold">
                      Accept Request
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              My Classmates & Friends ({friends.length})
            </h3>
            {friends.length === 0 ? (
              <Card className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border-slate-200 text-slate-500 text-xs">
                No friends added yet. Use the search tab to find and add classmates.
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {friends.map((f) => (
                  <div key={f.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-9 h-9">
                        <AvatarFallback className="bg-teal-100 text-teal-700 font-bold text-xs">
                          {f.display_name?.charAt(0) || "F"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">{f.display_name}</div>
                        <div className="text-[11px] text-slate-400">Level {f.level || 1} • {f.xp_points || 0} XP</div>
                      </div>
                    </div>

                    <Button
                      onClick={() => navigate(`/challenge/setup/${f.id}`)}
                      size="sm"
                      className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold gap-1"
                    >
                      <Swords className="w-3.5 h-3.5" /> Challenge
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: ALL REGISTERED STUDENTS & FIND OPPONENT */}
      {activeTab === "search" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex gap-2 max-w-md w-full">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by student name or school..."
                className="rounded-xl bg-white dark:bg-slate-900"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={searching} className="bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shrink-0">
                <Search className="w-4 h-4 mr-1.5" /> Filter
              </Button>
            </div>

            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Total Community Students: <span className="text-orange-600 dark:text-orange-400 font-bold">{500 + allStudents.length}</span>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            {loadingStudents ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading registered students...</div>
            ) : allStudents.length === 0 ? (
              <Card className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border-slate-200 text-slate-500 text-xs">
                No other students registered yet. New accounts will appear here automatically!
              </Card>
            ) : (
              (searchQuery.trim()
                ? allStudents.filter(st => 
                    (st.display_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (st.school || '').toLowerCase().includes(searchQuery.toLowerCase())
                  )
                : allStudents
              ).map((st) => (
                <div key={st.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs hover:border-orange-200 transition-all">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 border border-slate-200/60">
                      <AvatarImage src={st.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(st.display_name || 'student')}`} alt={st.display_name} />
                      <AvatarFallback className="bg-teal-100 text-teal-700 font-bold text-xs">
                        {st.display_name?.charAt(0) || "S"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{st.display_name || 'Cambridge Student'}</span>
                        {st.school && (
                          <Badge variant="secondary" className="text-[10px] font-medium hidden sm:inline">
                            {st.school}
                          </Badge>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>Level {st.level || 1}</span>
                        <span>•</span>
                        <span className="text-teal-600 dark:text-teal-400 font-semibold">{st.xp_points || 0} XP</span>
                        {st.streak_days > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-orange-500 font-bold flex items-center gap-0.5">
                              <Flame className="w-3 h-3 fill-orange-500" /> {st.streak_days}d
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <Button 
                      onClick={() => navigate(`/challenge/setup/${st.id}`)} 
                      size="sm" 
                      className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold gap-1.5 shadow-xs"
                    >
                      <Swords className="w-3.5 h-3.5" />
                      <span>Challenge</span>
                    </Button>
                    <Button 
                      onClick={() => sendRequest(st.id)} 
                      size="sm" 
                      variant="outline" 
                      className="rounded-xl text-xs font-bold border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <UserPlus className="w-3.5 h-3.5 mr-1" /> Add
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
