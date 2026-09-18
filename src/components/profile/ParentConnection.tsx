import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, RefreshCw, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function ParentConnection() {
  const [code, setCode] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateCode = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.rpc("generate_child_linking_code");
      if (error) throw error;
      setCode(data as string);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to generate code");
    } finally {
      setGenerating(false);
    }
  };

  const copyCode = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Code copied to clipboard!");
  };

  return (
    <div className="space-y-3">
      <Label className="flex items-center gap-2">
        <Users className="h-4 w-4" /> Parent Connection
      </Label>
      <p className="text-xs text-muted-foreground">
        Link your account to your parent's LevelHubAI dashboard so they can track your progress and help you improve.
      </p>

      {code ? (
        <div className="bg-secondary/50 rounded-lg p-4 border border-border">
          <p className="text-sm font-medium mb-2 text-center">Your Secure Linking Code</p>
          <div className="flex items-center justify-center gap-3">
            <div className="bg-background px-6 py-3 rounded-md border font-mono text-2xl tracking-[0.2em] font-bold">
              {code}
            </div>
            <Button variant="outline" size="icon" onClick={copyCode}>
              {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          <p className="text-xs text-center text-muted-foreground mt-3">
            Give this code to your parent. It expires in 24 hours.
          </p>
          <Button variant="ghost" size="sm" className="w-full mt-2 text-xs" onClick={generateCode} disabled={generating}>
            {generating ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <RefreshCw className="w-3 h-3 mr-1" />}
            Generate New Code
          </Button>
        </div>
      ) : (
        <Button variant="outline" onClick={generateCode} disabled={generating} className="w-full">
          {generating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Users className="w-4 h-4 mr-2" />}
          Generate Parent Linking Code
        </Button>
      )}
    </div>
  );
}
