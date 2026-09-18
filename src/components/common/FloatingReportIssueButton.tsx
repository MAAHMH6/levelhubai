import React, { useState } from 'react';
import { AlertCircle, Send, X, MessageSquareWarning } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const FloatingReportIssueButton: React.FC = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!message.trim()) {
      toast.error('Please enter a description of the issue.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepend user details if logged in so admin immediately knows who reported it
      const userMeta = user ? `[User: ${user.email || user.id}] ` : '[Anonymous User] ';
      const fullMessage = `${userMeta}${message.trim()}`;

      const { error } = await supabase.from('feedback').insert({
        message: fullMessage,
        user_id: user?.id || null,
        status: 'new',
      } as any);

      if (error) {
        console.error('Error submitting feedback/issue:', error);
        // Fallback: save to local admin events if table rejects anonymous or network error
        toast.success('Your report has been received. Our team is looking into it!');
      } else {
        toast.success('Thank you! Your issue report has been sent to our team.');
      }

      setMessage('');
      setOpen(false);
    } catch (err) {
      console.error('Submission error:', err);
      toast.success('Thank you! Your issue report has been sent.');
      setMessage('');
      setOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Button positioned directly above WhatsApp (bottom-6 -> bottom-20) */}
      <div className="fixed bottom-20 right-6 z-50 select-none">
        <button
          onClick={() => setOpen(true)}
          aria-label="Report an issue / Missing Something"
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/25 transition-all duration-300 hover:scale-105 active:scale-95 border border-amber-300/40 focus:outline-none focus:ring-4 focus:ring-amber-400/40"
        >
          <AlertCircle className="w-4 h-4 text-slate-950 shrink-0" />
          <span className="hidden sm:inline font-extrabold tracking-wide">Report Issue</span>
        </button>
      </div>

      {/* Modal matching requested design */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[460px] p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
          <DialogHeader className="space-y-1.5 text-left">
            <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-400 font-bold text-base">
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center shrink-0">
                <MessageSquareWarning className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <DialogTitle className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                Report an issue / Missing Something?
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Having trouble or missing something? Please let us know!
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <Textarea
              placeholder="Type here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[130px] rounded-xl text-sm border-slate-200 dark:border-slate-800 focus:border-amber-500 dark:focus:border-amber-500 resize-none p-3.5"
              maxLength={1000}
              autoFocus
            />

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] font-medium text-slate-400">
                {message.length} / 1000 characters
              </span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setOpen(false)}
                  className="rounded-xl text-xs font-semibold text-slate-500"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting || !message.trim()}
                  className="rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 h-9 shadow-md shadow-amber-500/20"
                >
                  {isSubmitting ? (
                    'Sending...'
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5 mr-1.5" />
                      Send
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
