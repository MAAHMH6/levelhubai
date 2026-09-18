import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { School, CheckCircle, XCircle, Trash2 } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface SchoolRow {
  id: string;
  name: string;
  city: string | null;
  is_verified: boolean;
  created_at: string;
}

const SchoolsManager = () => {
  const [schools, setSchools] = useState<SchoolRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSchools = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("schools")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setSchools(data as any);
    setLoading(false);
  };

  useEffect(() => { fetchSchools(); }, []);

  const toggleVerify = async (id: string, current: boolean) => {
    const { error } = await supabase.from("schools").update({ is_verified: !current } as any).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: !current ? "Verified" : "Unverified", description: `School ${!current ? "approved" : "unapproved"}.` });
      fetchSchools();
    }
  };

  const deleteSchool = async (id: string) => {
    const { error } = await supabase.from("schools").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Deleted" });
      fetchSchools();
    }
  };

  const pendingCount = schools.filter(s => !s.is_verified).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <School className="h-5 w-5 text-primary" />
          Schools Manager
          {pendingCount > 0 && (
            <Badge variant="destructive" className="ml-2">{pendingCount} pending</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : schools.length === 0 ? (
          <p className="text-sm text-muted-foreground">No schools added yet.</p>
        ) : (
          schools.map(school => (
            <div key={school.id} className="border border-border rounded-lg p-3 flex items-center gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">{school.name}</p>
                  <Badge variant={school.is_verified ? "default" : "secondary"}>
                    {school.is_verified ? "Verified" : "Pending"}
                  </Badge>
                </div>
                {school.city && <p className="text-xs text-muted-foreground">{school.city}</p>}
                <p className="text-xs text-muted-foreground">Added {new Date(school.created_at).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant={school.is_verified ? "outline" : "default"}
                  onClick={() => toggleVerify(school.id, school.is_verified)}
                >
                  {school.is_verified ? <XCircle className="h-4 w-4 mr-1" /> : <CheckCircle className="h-4 w-4 mr-1" />}
                  {school.is_verified ? "Unverify" : "Verify"}
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="destructive"><Trash2 className="h-4 w-4" /></Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete "{school.name}"?</AlertDialogTitle>
                      <AlertDialogDescription>Students in this school will lose their school association.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteSchool(school.id)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default SchoolsManager;
