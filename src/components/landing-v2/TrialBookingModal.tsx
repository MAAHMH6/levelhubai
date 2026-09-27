import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Calendar, CheckCircle2, MessageSquare, Clock, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';

interface TrialBookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TrialBookingModal: React.FC<TrialBookingModalProps> = ({ open, onOpenChange }) => {
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [programme, setProgramme] = useState('igcse');
  const [subject, setSubject] = useState('Mathematics');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !whatsapp.trim()) {
      toast.error('Please enter your name and WhatsApp number.');
      return;
    }

    setSubmitted(true);
    toast.success('Free Trial Request Confirmed! Our academic advisor will contact you via WhatsApp.');

    // Prepare WhatsApp direct message
    const msg = encodeURIComponent(
      `Hello LevelHubAI! I would like to book a Free Trial Class.\n\nName: ${name}\nProgramme: ${programme.toUpperCase()}\nSubject: ${subject}\nWhatsApp: ${whatsapp}`
    );
    window.open(`https://wa.me/923098444501?text=${msg}`, '_blank');
  };

  const handleReset = () => {
    setName('');
    setWhatsapp('');
    setSubmitted(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden bg-card border-border rounded-3xl">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-teal-600 via-teal-700 to-indigo-700 p-6 text-white text-center relative">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            100% Free • No Credit Card Required
          </div>
          <DialogTitle className="text-2xl font-black tracking-tight text-white">
            Book Your Free Trial Class
          </DialogTitle>
          <DialogDescription className="text-xs text-white/80 mt-1 max-w-sm mx-auto">
            Experience our 24/7 AI Cambridge Examiner, topical past papers, and diagnostic analytics with a 1-on-1 advisor.
          </DialogDescription>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Trial Session Reserved!</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We have forwarded your trial request for <strong>{subject} ({programme.toUpperCase()})</strong>. Our Cambridge coordinator will connect with you on WhatsApp shortly.
            </p>
            <Button onClick={handleReset} className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-xl">
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">Student or Parent Full Name</Label>
              <Input
                placeholder="e.g. Ayesha Khan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-xl h-10 text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">WhatsApp Number (with Country Code)</Label>
              <Input
                placeholder="e.g. +92 300 1234567 or +44 7911 123456"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="rounded-xl h-10 text-xs font-mono"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground">Qualification</Label>
                <Select value={programme} onValueChange={setProgramme}>
                  <SelectTrigger className="rounded-xl h-10 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="o_level">Cambridge O Level</SelectItem>
                    <SelectItem value="igcse">Cambridge IGCSE</SelectItem>
                    <SelectItem value="a_level">Cambridge A Level</SelectItem>
                    <SelectItem value="as_level">Cambridge AS Level</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground">Target Subject</Label>
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger className="rounded-xl h-10 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="Physics">Physics</SelectItem>
                    <SelectItem value="Chemistry">Chemistry</SelectItem>
                    <SelectItem value="Biology">Biology</SelectItem>
                    <SelectItem value="Computer Science">Computer Science</SelectItem>
                    <SelectItem value="Economics">Economics</SelectItem>
                    <SelectItem value="English Language">English Language</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="pt-2">
              <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs h-11 shadow-md shadow-teal-600/20">
                Confirm Free Trial Booking →
              </Button>
            </div>

            <p className="text-[11px] text-center text-muted-foreground flex items-center justify-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
              <span>Instant WhatsApp confirmation & no spam guaranteed.</span>
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
