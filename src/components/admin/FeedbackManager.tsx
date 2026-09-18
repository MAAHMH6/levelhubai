import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { MessageSquare, Trash2 } from "lucide-react";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  new: "bg-blue-500/20 text-blue-600",
  reviewed: "bg-yellow-500/20 text-yellow-600",
  completed: "bg-green-500/20 text-green-600",
};

const FeedbackManager = () => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("all");

  const { data: feedbackList = [], isLoading } = useQuery({
    queryKey: ["admin-feedback", filter],
    queryFn: async () => {
      let query = supabase
        .from("feedback")
        .select("*")
        .order("created_at", { ascending: false });

      if (filter !== "all") {
        query = query.eq("status", filter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("feedback")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update status");
    } else {
      toast.success(`Status updated to ${status}`);
      queryClient.invalidateQueries({ queryKey: ["admin-feedback"] });
    }
  };

  const deleteFeedback = async (id: string) => {
    const { error } = await supabase.from("feedback").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete");
    } else {
      toast.success("Feedback deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-feedback"] });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            User Feedback ({feedbackList.length})
          </CardTitle>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : feedbackList.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No feedback yet</p>
        ) : (
          <div className="space-y-3">
            {feedbackList.map((fb: any) => (
              <div key={fb.id} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <p className="text-sm flex-1">{fb.message}</p>
                  <Badge className={statusColors[fb.status] || ""}>{fb.status}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {new Date(fb.created_at).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-2">
                    <Select
                      value={fb.status}
                      onValueChange={(val) => updateStatus(fb.id, val)}
                    >
                      <SelectTrigger className="w-[120px] h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="reviewed">Reviewed</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => deleteFeedback(fb.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FeedbackManager;
