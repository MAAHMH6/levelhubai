import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search, Users, Gift, CheckCircle, Clock, Check, X, AlertTriangle, ShieldCheck, Info, Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ReferralData {
  id: string;
  created_at: string;
  status: string;
  reward_status: string;
  referrer: {
    id: string;
    display_name: string;
    email: string;
  } | null;
  referred: {
    id: string;
    display_name: string;
    email: string;
  } | null;
  risk_score?: number | null;
  risk_details?: string[] | null;
}

export const StudentReferralsManager = () => {
  const [referrals, setReferrals] = useState<ReferralData[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedReferral, setSelectedReferral] = useState<any>(null);

  const [formData, setFormData] = useState({
    referrer_id: "",
    referred_id: "",
    status: "pending",
    reward_status: "pending"
  });

  useEffect(() => {
    fetchReferrals();
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    const { data } = await supabase.from('profiles').select('id, display_name, email');
    if (data) setProfiles(data);
  };

  const fetchReferrals = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("student_referrals")
        .select(`
          id,
          created_at,
          status,
          reward_status,
          risk_score,
          risk_details,
          referred_ip,
          referrer:referrer_id ( id, display_name ),
          referred:referred_id ( id, display_name )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReferrals(data as any[]);
    } catch (error: any) {
      console.error("Error fetching referrals:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const { data, error } = await supabase.rpc("approve_referral_milestone", { p_referral_id: id });
      if (error) throw error;
      if (data && !data.success) throw new Error(data.message);
      
      toast.success("Milestone approved successfully.");
      fetchReferrals();
    } catch (error: any) {
      toast.error(error.message || "Failed to approve milestone");
    }
  };

  const handleCheckRisk = async (referral: any) => {
    try {
      toast.info("Evaluating risk score...");
      const { data, error } = await supabase.functions.invoke('evaluate-referral-risk', {
        body: {
          type: "INSERT",
          table: "student_referrals",
          record: {
            id: referral.id,
            referred_id: referral.referred?.id,
            referred_ip: referral.referred_ip
          }
        }
      });
      if (error) throw error;
      toast.success("Risk evaluated successfully");
      fetchReferrals();
    } catch (error: any) {
      toast.error(error.message || "Failed to evaluate risk");
    }
  };

  const handleReject = async (id: string) => {
    try {
      const { data, error } = await supabase.rpc("reject_referral_milestone", { p_referral_id: id, p_reason: "Admin rejection" });
      if (error) throw error;
      if (data && !data.success) throw new Error(data.message);
      
      toast.success("Milestone rejected.");
      fetchReferrals();
    } catch (error: any) {
      toast.error(error.message || "Failed to reject milestone");
    }
  };

  const handleCreateSubmit = async () => {
    if (!formData.referrer_id || !formData.referred_id) {
      toast.error("Please select both students.");
      return;
    }
    if (formData.referrer_id === formData.referred_id) {
      toast.error("A student cannot refer themselves.");
      return;
    }
    try {
      const { error } = await supabase.from('student_referrals').insert({
        referrer_id: formData.referrer_id,
        referred_id: formData.referred_id,
        status: formData.status,
        reward_status: formData.reward_status
      });
      if (error) throw error;
      toast.success("Referral created manually.");
      setIsCreateOpen(false);
      fetchReferrals();
    } catch (e: any) {
      toast.error(e.message || "Failed to create referral");
    }
  };

  const handleEditSubmit = async () => {
    if (!selectedReferral) return;
    try {
      const { error } = await supabase.from('student_referrals').update({
        status: formData.status,
        reward_status: formData.reward_status
      }).eq('id', selectedReferral.id);
      
      if (error) throw error;
      toast.success("Referral updated.");
      setIsEditOpen(false);
      fetchReferrals();
    } catch (e: any) {
      toast.error(e.message || "Failed to update referral");
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedReferral) return;
    try {
      const { error } = await supabase.from('student_referrals').delete().eq('id', selectedReferral.id);
      if (error) throw error;
      toast.success("Referral deleted.");
      setIsDeleteOpen(false);
      fetchReferrals();
    } catch (e: any) {
      toast.error(e.message || "Failed to delete referral");
    }
  };

  const filtered = referrals.filter(r => 
    (r.referrer?.display_name?.toLowerCase() || "").includes(search.toLowerCase()) ||
    (r.referred?.display_name?.toLowerCase() || "").includes(search.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Student Referrals Program
            </CardTitle>
            <CardDescription>
              Monitor student-to-student referrals and automated rewards.
            </CardDescription>
          </div>
          <Button onClick={() => {
            setFormData({ referrer_id: "", referred_id: "", status: "pending", reward_status: "pending" });
            setIsCreateOpen(true);
          }}>
            <Plus className="w-4 h-4 mr-2" />
            Create Referral
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by student name..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-4 text-sm text-muted-foreground w-full sm:w-auto">
            <div className="flex items-center gap-1.5 bg-secondary/30 px-3 py-1.5 rounded-md">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>{referrals.filter(r => r.status === 'active').length} Active</span>
            </div>
            <div className="flex items-center gap-1.5 bg-secondary/30 px-3 py-1.5 rounded-md">
              <Gift className="w-4 h-4 text-purple-500" />
              <span>{referrals.filter(r => r.reward_status === 'rewarded').length} Rewarded</span>
            </div>
            <div className="flex items-center gap-1.5 bg-secondary/30 px-3 py-1.5 rounded-md text-amber-600">
              <Clock className="w-4 h-4" />
              <span>{referrals.filter(r => r.reward_status === 'pending_approval').length} Pending Approval</span>
            </div>
          </div>
        </div>

        <div className="border rounded-md overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Referring Student</TableHead>
                <TableHead>Referred Student</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reward</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No referrals found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((referral) => (
                  <TableRow key={referral.id}>
                    <TableCell className="whitespace-nowrap">
                      {new Date(referral.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-medium">
                      {referral.referrer?.display_name || "Unknown"}
                    </TableCell>
                    <TableCell>
                      {referral.referred?.display_name || "Unknown"}
                    </TableCell>
                    <TableCell>
                      {referral.risk_score !== undefined && referral.risk_score !== null ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="inline-block">
                                <Badge 
                                  variant="outline" 
                                  className={`gap-1 cursor-help ${
                                    referral.risk_score > 50 
                                      ? "text-red-600 border-red-200 bg-red-50" 
                                      : referral.risk_score > 20
                                        ? "text-amber-600 border-amber-200 bg-amber-50"
                                        : "text-green-600 border-green-200 bg-green-50"
                                  }`}
                                >
                                  {referral.risk_score > 50 ? <AlertTriangle className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                                  {referral.risk_score}
                                </Badge>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="text-xs">
                                <p className="font-semibold mb-1">Risk Details:</p>
                                {referral.risk_details && referral.risk_details.length > 0 ? (
                                  <ul className="list-disc pl-3">
                                    {referral.risk_details.map((detail, i) => (
                                      <li key={i}>{detail}</li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p>No issues detected.</p>
                                )}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground italic">Pending</span>
                          <Button size="sm" variant="outline" className="h-6 px-2 text-xs" onClick={() => handleCheckRisk(referral)}>
                            Evaluate
                          </Button>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={referral.status === "active" ? "default" : "secondary"}>
                        {referral.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {referral.reward_status === "rewarded" ? (
                        <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50">
                          Rewarded
                        </Badge>
                      ) : referral.reward_status === "pending_approval" ? (
                        <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
                          Pending Approval
                        </Badge>
                      ) : referral.reward_status === "rejected" ? (
                        <Badge variant="destructive">
                          Rejected
                        </Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">Pending</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end gap-2">
                        {referral.reward_status === "pending_approval" && (
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" className="h-8 text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700" onClick={() => handleApprove(referral.id)}>
                              <Check className="w-4 h-4 mr-1" /> Approve
                            </Button>
                            <Button size="sm" variant="outline" className="h-8 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700" onClick={() => handleReject(referral.id)}>
                              <X className="w-4 h-4 mr-1" /> Reject
                            </Button>
                          </div>
                        )}
                        <div className="flex justify-end gap-1">
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => {
                            setSelectedReferral(referral);
                            setFormData({
                              referrer_id: referral.referrer?.id || "",
                              referred_id: referral.referred?.id || "",
                              status: referral.status,
                              reward_status: referral.reward_status
                            });
                            setIsEditOpen(true);
                          }}>
                            <Edit className="w-4 h-4 text-muted-foreground" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => {
                            setSelectedReferral(referral);
                            setIsDeleteOpen(true);
                          }}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Create Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Referral</DialogTitle>
            <DialogDescription>Manually associate a referred student with a referrer.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Referrer</Label>
              <Select value={formData.referrer_id} onValueChange={v => setFormData({...formData, referrer_id: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Referrer" />
                </SelectTrigger>
                <SelectContent>
                  {profiles.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.display_name || p.email}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Referred Student</Label>
              <Select value={formData.referred_id} onValueChange={v => setFormData({...formData, referred_id: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Referred Student" />
                </SelectTrigger>
                <SelectContent>
                  {profiles.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.display_name || p.email}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Reward Status</Label>
              <Select value={formData.reward_status} onValueChange={v => setFormData({...formData, reward_status: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="pending_approval">Pending Approval</SelectItem>
                  <SelectItem value="rewarded">Rewarded</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateSubmit}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Referral Status</DialogTitle>
            <DialogDescription>Modify the current status and reward state for this referral.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Reward Status</Label>
              <Select value={formData.reward_status} onValueChange={v => setFormData({...formData, reward_status: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="pending_approval">Pending Approval</SelectItem>
                  <SelectItem value="rewarded">Rewarded</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEditSubmit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Referral</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete this referral? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteSubmit}>Delete Referral</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
