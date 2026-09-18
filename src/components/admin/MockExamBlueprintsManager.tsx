import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface Blueprint {
  id: string;
  subject_id: string;
  title: string;
  source_filename: string;
  structural_metadata: any;
  created_at: string;
  subject_name?: string;
}

export default function MockExamBlueprintsManager() {
  const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data: bps, error } = await supabase
      .from("exam_blueprints")
      .select(`
        *,
        subjects:subject_id (name)
      `)
      .order("created_at", { ascending: false });

    if (!error && bps) {
      setBlueprints(bps.map(b => ({
        ...b,
        subject_name: b.subjects?.name || "Unknown Subject"
      })));
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const remove = async (id: string) => {
    if (!confirm("Delete this blueprint?")) return;
    const { error } = await supabase.from("exam_blueprints").delete().eq("id", id);
    if (error) toast({ title: "Failed", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Deleted" });
      load();
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Extracted Mock Exam Blueprints</CardTitle>
      </CardHeader>
      <CardContent>
        {blueprints.length === 0 && (
          <p className="text-muted-foreground">No blueprints extracted yet. Go to Curriculum Library to extract from a Past Paper.</p>
        )}
        <div className="space-y-4">
          {blueprints.map(bp => (
            <div key={bp.id} className="border p-4 rounded-md">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-lg">{bp.title}</h3>
                  <p className="text-sm text-muted-foreground">{bp.subject_name} • {bp.source_filename}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => remove(bp.id)} className="text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="bg-muted p-3 rounded-md overflow-x-auto text-xs font-mono">
                {JSON.stringify(bp.structural_metadata?.metadata || {}, null, 2)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
