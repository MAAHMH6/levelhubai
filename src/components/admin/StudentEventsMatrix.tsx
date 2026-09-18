import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Activity, Search, BookOpen, AlertTriangle, Clock, Table as TableIcon, Filter } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDistanceToNow, differenceInDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Play } from "lucide-react";

interface UserProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  last_active_at: string | null;
  last_inactivity_15_sent_at: string | null;
  last_inactivity_30_sent_at: string | null;
  subjects: string[] | null;
  created_at: string;
}

interface Subject {
  id: string;
  name: string;
  qualification: string;
}

const StudentEventsMatrix = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [subjects, setSubjects] = useState<Record<string, Subject>>({});
  const [loading, setLoading] = useState(true);
  const [triggeringId, setTriggeringId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  
  // Filters
  const [showALevelOnly, setShowALevelOnly] = useState(false);
  const [inactivityFilter, setInactivityFilter] = useState<"all" | "15_days" | "30_days">("all");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch subjects to map IDs to names and qualifications
    const { data: subjectsData, error: subjectsError } = await supabase
      .from("subjects")
      .select("id, name, qualification");
      
    if (subjectsError) {
      console.error("Error fetching subjects:", subjectsError);
    } else {
      const subjectMap: Record<string, Subject> = {};
      subjectsData.forEach((s) => {
        subjectMap[s.id] = s;
      });
      setSubjects(subjectMap);
    }

    // Fetch profiles
    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_url, last_active_at, last_inactivity_15_sent_at, last_inactivity_30_sent_at, subjects, created_at")
      .order("last_active_at", { ascending: false, nullsFirst: false });

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
    } else {
      setUsers(profilesData || []);
    }
    
    setLoading(false);
  };

  const getStudentALevelSubjects = (subjectIds: string[] | null) => {
    if (!subjectIds || subjectIds.length === 0) return [];
    return subjectIds
      .map(id => subjects[id])
      .filter(s => s && s.qualification === "a_level");
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return new Date(dateString).toLocaleDateString();
    }
  };

  const getInactiveDays = (dateString: string | null) => {
    if (!dateString) return 0;
    try {
      return differenceInDays(new Date(), new Date(dateString));
    } catch {
      return 0;
    }
  };

  const handleTriggerTest = async (userId: string) => {
    setTriggeringId(userId);
    try {
      const { data, error } = await supabase.functions.invoke("check-inactivity", {
        body: { test_user_id: userId }
      });
      if (error) throw error;
      toast.success("Inactivity test email triggered successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to trigger test email.");
    } finally {
      setTriggeringId(null);
    }
  };

  const filteredUsers = users.filter((user) => {
    // Search filter
    const term = search.toLowerCase();
    const matchesSearch = (user.display_name || "").toLowerCase().includes(term);
    if (!matchesSearch) return false;

    // A-Level filter
    const aLevelSubjects = getStudentALevelSubjects(user.subjects);
    if (showALevelOnly && aLevelSubjects.length === 0) {
      return false;
    }

    // Inactivity filter
    if (inactivityFilter === "15_days" && !user.last_inactivity_15_sent_at) {
      return false;
    }
    if (inactivityFilter === "30_days" && !user.last_inactivity_30_sent_at) {
      return false;
    }

    return true;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TableIcon className="h-5 w-5 text-primary" />
          Student Events & A-Level Matrix
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-end justify-between bg-muted/30 p-4 rounded-lg border border-border">
          <div className="flex-1 w-full max-w-sm relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              <Label htmlFor="alevel-filter" className="font-medium cursor-pointer">A-Level Integration Only</Label>
              <Switch id="alevel-filter" checked={showALevelOnly} onCheckedChange={setShowALevelOnly} />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Label className="font-medium">Inactivity Event Status:</Label>
              <select 
                className="flex h-9 w-[180px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={inactivityFilter}
                onChange={(e) => setInactivityFilter(e.target.value as any)}
              >
                <option value="all">All Students</option>
                <option value="15_days">Sent 15-Day Event</option>
                <option value="30_days">Sent 30-Day Event</option>
              </select>
            </div>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead>15-Day Event Sent</TableHead>
                <TableHead>30-Day Event Sent</TableHead>
                <TableHead>A-Level Integration</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Loading matrix data...
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No students match the selected filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => {
                  const aLevelSubjects = getStudentALevelSubjects(user.subjects);
                  const isALevel = aLevelSubjects.length > 0;
                  
                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar_url || undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {(user.display_name || "?").charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{user.display_name || "Unknown"}</span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex flex-col gap-1 items-start">
                          <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                            <Activity className="h-3.5 w-3.5" />
                            {formatDate(user.last_active_at)}
                          </div>
                          {getInactiveDays(user.last_active_at) >= 15 && (
                            <Badge variant="outline" className="text-[10px] text-destructive border-destructive/30 bg-destructive/5">
                              Inactive {getInactiveDays(user.last_active_at)} days
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        {user.last_inactivity_15_sent_at ? (
                          <div className="flex items-center gap-1.5 text-sm">
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                            <span>{formatDate(user.last_inactivity_15_sent_at)}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        {user.last_inactivity_30_sent_at ? (
                          <div className="flex items-center gap-1.5 text-sm text-destructive">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{formatDate(user.last_inactivity_30_sent_at)}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        {isALevel ? (
                          <div className="flex flex-col gap-1 items-start">
                            <Badge variant="default" className="bg-primary/20 text-primary hover:bg-primary/30 border-0">
                              Active
                            </Badge>
                            <span className="text-xs text-muted-foreground truncate max-w-[200px]" title={aLevelSubjects.map(s => s.name).join(", ")}>
                              {aLevelSubjects.map(s => s.name).join(", ")}
                            </span>
                          </div>
                        ) : (
                          <Badge variant="secondary" className="text-muted-foreground">
                            None
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleTriggerTest(user.id)}
                          disabled={triggeringId === user.id}
                        >
                          <Play className="h-3.5 w-3.5 mr-1" />
                          {triggeringId === user.id ? "Sending..." : "Test Trigger"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
        
        <div className="text-xs text-muted-foreground text-center">
          Showing {filteredUsers.length} of {users.length} total students.
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentEventsMatrix;
