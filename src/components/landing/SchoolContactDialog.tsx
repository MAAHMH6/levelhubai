import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props { open: boolean; onOpenChange: (v: boolean) => void; }

export function SchoolContactDialog({ open, onOpenChange }: Props) {
  const [f, setF] = useState({ name: "", school: "", email: "", phone: "", message: "" });
  const [loading, setLoading] = useState(false);
  const submit = async () => {
    if (!f.name || !f.school || !f.email) { toast.error("Please fill name, school and email"); return; }
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke("school-contact", { body: f });
      if (error) throw error;
      toast.success("Thanks — our team will contact you shortly.");
      onOpenChange(false);
      setF({ name: "", school: "", email: "", phone: "", message: "" });
    } catch (e: any) { toast.error(e.message ?? "Failed to send"); }
    finally { setLoading(false); }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Talk to sales — School plan</DialogTitle>
          <DialogDescription>Tell us about your school and a specialist will get in touch.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div><Label>Your name</Label><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
          <div><Label>School / academy</Label><Input value={f.school} onChange={(e) => setF({ ...f, school: e.target.value })} /></div>
          <div><Label>Email</Label><Input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
          <div><Label>Phone (optional)</Label><Input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></div>
          <div><Label>How can we help?</Label><Textarea value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={loading}>{loading ? "Sending…" : "Send enquiry"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
