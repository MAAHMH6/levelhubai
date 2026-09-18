import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Shield, Download, Trash2, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const PrivacySettings = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleExportData = async () => {
    if (!user) return;
    setIsExporting(true);
    try {
      // Fetch profile
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      
      // Fetch subject progress
      const { data: progress } = await supabase.from("subject_progress").select("*").eq("user_id", user.id);
      
      // Fetch completed quizzes
      const { data: quizzes } = await supabase.from("quiz_sessions").select("*").eq("user_id", user.id).eq("status", "completed");

      const exportData = {
        exportDate: new Date().toISOString(),
        user: {
          id: user.id,
          email: user.email,
        },
        profile,
        progress,
        quizzes
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `levelhub_data_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success("Your data has been exported successfully.");
    } catch (error: any) {
      toast.error("Failed to export data: " + error.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "DELETE") {
      toast.error("Please type DELETE to confirm.");
      return;
    }
    
    setIsDeleting(true);
    try {
      const { error } = await supabase.rpc('delete_user_account');
      if (error) throw error;
      
      toast.success("Your account has been successfully deleted.");
      setShowDeleteDialog(false);
      await signOut();
      navigate("/");
    } catch (error: any) {
      toast.error("Failed to delete account: " + error.message);
      setIsDeleting(false);
    }
  };

  return (
    <Card className="border-destructive/20 mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <Shield className="h-5 w-5" />
          Data & Privacy
        </CardTitle>
        <CardDescription>Manage your personal data and privacy settings (GDPR & CCPA Compliant).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Export Data Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-border">
          <div>
            <h4 className="text-sm font-medium">Export Personal Data</h4>
            <p className="text-xs text-muted-foreground mt-1">Download a copy of your profile, progress, and quiz history in JSON format.</p>
          </div>
          <Button variant="outline" onClick={handleExportData} disabled={isExporting} className="shrink-0">
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? "Exporting..." : "Export Data"}
          </Button>
        </div>

        {/* Delete Account Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h4 className="text-sm font-medium text-destructive">Delete Account</h4>
            <p className="text-xs text-muted-foreground mt-1">Permanently delete your account and all associated data. This action cannot be undone.</p>
          </div>
          
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogTrigger asChild>
              <Button variant="destructive" className="shrink-0">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  Delete Account
                </DialogTitle>
                <DialogDescription>
                  This action is <strong>permanent</strong> and cannot be undone. This will permanently delete your account and remove your data from our servers.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <p className="text-sm text-muted-foreground mb-4">Please type <strong>DELETE</strong> below to confirm.</p>
                <Input 
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder="Type DELETE to confirm"
                  className="border-destructive/50 focus-visible:ring-destructive"
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={isDeleting}>Cancel</Button>
                <Button variant="destructive" onClick={handleDeleteAccount} disabled={isDeleting || deleteConfirmation !== "DELETE"}>
                  {isDeleting ? "Deleting..." : "Permanently Delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

      </CardContent>
    </Card>
  );
};
