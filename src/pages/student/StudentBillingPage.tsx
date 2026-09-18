import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  CreditCard, 
  Crown, 
  Sparkles, 
  Check, 
  ArrowLeft, 
  Download, 
  Clock, 
  ShieldCheck, 
  MessageCircle, 
  AlertCircle,
  FileText,
  Calendar,
  Zap,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { useContactInfo } from "@/hooks/useContactInfo";
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';

export const StudentBillingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const sub = useSubscription();
  const contactInfo = useContactInfo();
  const [payments, setPayments] = useState<any[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoadingPayments(true);
    supabase
      .from('payments')
      .select('*')
      .eq('user_id', user.id)
      .order('paid_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) {
          setPayments(data);
        }
        setLoadingPayments(false);
      });
  }, [user]);

  const handleContactWhatsApp = () => {
    const emailStr = user?.email ? `\nMy account email is ${user.email}.` : '';
    const message = `Hello LevelHubAI Billing Team, I have a query regarding my subscription & billing.${emailStr}`;
    window.open(`https://wa.me/${contactInfo.whatsappPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200/70 dark:border-teal-800 text-xs font-semibold text-teal-700 dark:text-teal-300 mb-2">
            <CreditCard className="w-3.5 h-3.5 text-teal-600" />
            <span>Membership & Billing Center</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Plan & Billing Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            View active subscription status, invoice receipts, usage limits, and manage Cambridge access.
          </p>
        </div>

        <Button
          onClick={() => window.open('https://olevel.com.pk/#pricing', '_blank')}
          className="rounded-xl text-xs font-extrabold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 shadow-xs h-10 px-5 gap-1.5 self-start sm:self-auto"
        >
          <Crown className="w-4 h-4" />
          <span>View All Plans</span>
        </Button>
      </div>

      {/* 1. CURRENT SUBSCRIPTION CARD */}
      <Card className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                sub.isPro 
                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600' 
                  : 'bg-teal-100 dark:bg-teal-950/60 text-teal-600'
              }`}>
                {sub.isPro ? <Crown className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    {sub.isPro ? "LevelHubAI Pro Scholar Plan" : sub.isSchool ? "School Institutional Plan" : "Free Explorer Plan"}
                  </h3>
                  <Badge className={`text-[10px] font-bold ${
                    sub.isPro 
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300' 
                      : 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border-teal-300'
                  }`}>
                    {sub.isActive ? "Active" : "Trial"}
                  </Badge>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {sub.isPro 
                    ? "Full access to all Cambridge subjects, unlimited AI Mock Exams, 24/7 AI tutor, and cognitive analytics."
                    : "Free Plan includes access to 3 Cambridge subjects (Math, Physics, ICT), basic quizzes, and progress tracking."}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {sub.isPro ? (
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 text-xs font-black">
                <Crown className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span>ACTIVE PRO SCHOLAR</span>
              </div>
            ) : (
              <Button
                onClick={handleContactWhatsApp}
                className="rounded-xl text-xs font-black h-10 px-5 bg-teal-600 hover:bg-teal-700 text-white shadow-sm gap-2"
              >
                <Crown className="w-4 h-4" />
                <span>Upgrade to Pro (Rs 5,000/mo)</span>
              </Button>
            )}
          </div>
        </div>

        {/* Plan Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
            <div className="text-[11px] text-slate-400 font-semibold uppercase">Subjects Access</div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              {sub.isPro ? "All Cambridge Subjects (100% Unlocked)" : "3 Subjects (Math, Physics, ICT)"}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
            <div className="text-[11px] text-slate-400 font-semibold uppercase">AI Mock Exams</div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              {sub.isPro ? "Unlimited Papers (∞)" : "Basic Quizzes Included"}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
            <div className="text-[11px] text-slate-400 font-semibold uppercase">AI Tutor Queries</div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              {sub.isPro ? "24/7 Unlimited Messages (∞)" : "Basic Community Support"}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
            <div className="text-[11px] text-slate-400 font-semibold uppercase">Writing & Spider Web</div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              {sub.isPro ? "Unlimited Full Analysis (∞)" : "Basic Progress Tracking"}
            </div>
          </div>
        </div>
      </Card>

      {/* 2. PAYMENT METHODS & WHATSAPP UPGRADE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">WhatsApp Direct Billing</h3>
              <p className="text-xs text-slate-500">Bank Transfer, JazzCash, EasyPaisa & Cards</p>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Need to activate your subscription, update your payment details, or verify an offline transaction? Contact our support team directly for instant verification.
          </p>

          <Button
            onClick={handleContactWhatsApp}
            className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold rounded-xl text-xs h-10 shadow-xs gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Contact Billing on WhatsApp</span>
          </Button>
        </Card>

        <Card className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Guaranteed Activation</h3>
              <p className="text-xs text-slate-500">100% Cambridge Syllabus Aligned</p>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            All Pro memberships include instant access to full syllabus lesson videos, past papers, mark schemes, and cognitive performance analytics. Full access to all Cambridge subjects.
          </p>

          <Button
            variant="outline"
            onClick={handleContactWhatsApp}
            className="w-full rounded-xl text-xs font-bold h-10 border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/40 gap-2"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>Inquire About Pro Membership (Rs 5,000/mo)</span>
          </Button>
        </Card>
      </div>

      {/* 3. INVOICE RECEIPTS & PAYMENT HISTORY */}
      <Card className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Payment Receipts & Invoices</h3>
            <p className="text-xs text-slate-500">Your historical transaction records and billing receipts.</p>
          </div>
          <Badge variant="secondary" className="text-xs font-semibold">
            {payments.length} Records
          </Badge>
        </div>

        {loadingPayments ? (
          <div className="py-8 text-center text-xs text-slate-400">Loading payment history...</div>
        ) : payments.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-center space-y-2">
            <FileText className="w-8 h-8 text-slate-300 mx-auto" />
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {sub.isPro ? "Active Pro Membership" : "No Invoices Yet"}
            </div>
            <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
              {sub.isPro 
                ? "Your Pro Scholar subscription is active with full Cambridge syllabus access." 
                : "You are currently on the Free Explorer plan. When you upgrade to Cambridge Pro, your invoices and receipts will appear here."}
            </p>
            {!sub.isPro && (
              <Button
                onClick={handleContactWhatsApp}
                size="sm"
                className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold mt-2"
              >
                Upgrade via WhatsApp (Rs 5,000/mo)
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {payments.map((p) => (
              <div key={p.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {p.description || "LevelHubAI Cambridge Pro Subscription"}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {new Date(p.paid_at || p.created_at).toLocaleDateString()} • Ref: {p.id.slice(0, 8)}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    {p.amount ? `Rs ${p.amount.toLocaleString()}` : "Rs 5,000"}
                  </span>
                  <Badge className="bg-emerald-100 text-emerald-800 text-[10px]">Paid</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
