import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone, School, Globe, MapPin, Target, CheckCircle2,
  ChevronRight, ChevronLeft, Loader2, Sparkles, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { adminDataStore } from '@/lib/adminDataStore';

interface ProfileCompletionPopupProps {
  userId: string;
  onComplete: () => void;
}

const STORAGE_KEY = 'levelhub:profile_complete';

export const markProfileComplete = (userId: string) => {
  localStorage.setItem(`${STORAGE_KEY}:${userId}`, '1');
};

export const isProfileAlreadyComplete = (userId: string): boolean => {
  return localStorage.getItem(`${STORAGE_KEY}:${userId}`) === '1';
};

interface FormData {
  phone: string;
  school: string;
  country: string;
  city: string;
  target: string;
  acceptedTerms: boolean;
}

const STEPS = [
  { id: 1, title: 'Phone Number', subtitle: 'Stay connected with updates', icon: Phone },
  { id: 2, title: 'Your School', subtitle: 'Tell us where you study', icon: School },
  { id: 3, title: 'Location', subtitle: 'Country & City', icon: Globe },
  { id: 4, title: 'Your Goal', subtitle: "What's your target?", icon: Target },
  { id: 5, title: 'Terms & Policies', subtitle: 'Almost done!', icon: CheckCircle2 },
];

export const ProfileCompletionPopup: React.FC<ProfileCompletionPopupProps> = ({ userId, onComplete }) => {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormData>({
    phone: '',
    school: '',
    country: '',
    city: '',
    target: '',
    acceptedTerms: false,
  });

  const update = (field: keyof FormData, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    if (step === 0) return form.phone.trim().length >= 7;
    if (step === 4) return form.acceptedTerms;
    return true;
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(s => s - 1);
  };

  const handleSkip = () => {
    markProfileComplete(userId);
    onComplete();
  };

  const handleSubmit = async () => {
    if (!form.acceptedTerms) {
      toast.error('Please accept the Terms & Policies to continue.');
      return;
    }
    setSaving(true);
    try {
      const payload: Record<string, any> = {
        phone_number: form.phone || null,
        school: form.school || null,
        country: form.country || null,
        city: form.city || null,
        target_grade: form.target || null,
        profile_complete: true,
        updated_at: new Date().toISOString(),
      };

      // Save to Supabase
      const { error } = await supabase
        .from('profiles' as any)
        .update(payload)
        .eq('id', userId);

      if (error) {
        console.warn('Supabase profile update failed, falling back to local store:', error.message);
      }

      // Always persist locally via adminDataStore for reliability
      adminDataStore.saveProfileOverride(userId, {
        phone_number: form.phone || null,
        school: form.school || null,
        country: form.country || null,
        city: form.city || null,
        target_grade: form.target || null,
        profile_complete: true,
      } as any);

      markProfileComplete(userId);
      toast.success('Profile completed! 🎉 Welcome to LevelHubAI!');
      onComplete();
    } catch (err: any) {
      console.error('Profile completion error:', err);
      // Still mark as complete locally so popup doesn't re-show
      markProfileComplete(userId);
      onComplete();
    } finally {
      setSaving(false);
    }
  };

  const progress = ((step + 1) / STEPS.length) * 100;
  const CurrentIcon = STEPS[step].icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ type: 'spring', stiffness: 280, damping: 28 }}
        className="relative w-full max-w-md"
      >
        {/* Glass card */}
        <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
          {/* Ambient glow */}
          <div className="absolute -top-20 -right-20 w-56 h-56 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-56 h-56 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="relative px-6 pt-6 pb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-teal-400" />
                <span className="text-xs font-semibold text-teal-400 uppercase tracking-widest">Complete Your Profile</span>
              </div>
              <button
                onClick={handleSkip}
                className="text-slate-400 hover:text-white transition-colors rounded-full p-1"
                title="Skip for now"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-1.5">
              Step {step + 1} of {STEPS.length}
            </p>
          </div>

          {/* Step Content */}
          <div className="relative px-6 pb-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
              >
                {/* Step icon + title */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center">
                    <CurrentIcon className="w-6 h-6 text-teal-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">{STEPS[step].title}</h2>
                    <p className="text-sm text-slate-400">{STEPS[step].subtitle}</p>
                  </div>
                </div>

                {/* Step 1 — Phone */}
                {step === 0 && (
                  <div className="space-y-3">
                    <Label className="text-slate-300 text-sm">Phone Number *</Label>
                    <div className="flex gap-2">
                      <div className="w-16 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-slate-300 text-sm font-medium">
                        +
                      </div>
                      <Input
                        type="tel"
                        placeholder="e.g. 923001234567"
                        value={form.phone}
                        onChange={e => update('phone', e.target.value)}
                        className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl focus:border-teal-400 focus:ring-teal-400/20"
                      />
                    </div>
                    <p className="text-xs text-slate-500">
                      Used only for account verification and important updates. Never shared.
                    </p>
                  </div>
                )}

                {/* Step 2 — School */}
                {step === 1 && (
                  <div className="space-y-3">
                    <Label className="text-slate-300 text-sm">School / Institute Name</Label>
                    <Input
                      type="text"
                      placeholder="e.g. Beaconhouse School System"
                      value={form.school}
                      onChange={e => update('school', e.target.value)}
                      className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl focus:border-teal-400 focus:ring-teal-400/20"
                    />
                    <p className="text-xs text-slate-500">This helps us match you with classmates and school analytics.</p>
                  </div>
                )}

                {/* Step 3 — Country + City */}
                {step === 2 && (
                  <div className="space-y-3">
                    <div>
                      <Label className="text-slate-300 text-sm mb-1 block">Country</Label>
                      <Input
                        type="text"
                        placeholder="e.g. Pakistan"
                        value={form.country}
                        onChange={e => update('country', e.target.value)}
                        className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl focus:border-teal-400 focus:ring-teal-400/20"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-300 text-sm mb-1 block">City</Label>
                      <Input
                        type="text"
                        placeholder="e.g. Karachi"
                        value={form.city}
                        onChange={e => update('city', e.target.value)}
                        className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl focus:border-teal-400 focus:ring-teal-400/20"
                      />
                    </div>
                  </div>
                )}

                {/* Step 4 — Target */}
                {step === 3 && (
                  <div className="space-y-3">
                    <Label className="text-slate-300 text-sm">Learning Target / Goal</Label>
                    <Input
                      type="text"
                      placeholder="e.g. Pass O-Levels 2025 with A grades"
                      value={form.target}
                      onChange={e => update('target', e.target.value)}
                      className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl focus:border-teal-400 focus:ring-teal-400/20"
                    />
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {['Pass O-Levels 2025', 'IGCSE A* grades', 'A-Level Cambridge', 'Improve my grades'].map(preset => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => update('target', preset)}
                          className="px-3 py-2 text-xs rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:border-teal-400/50 hover:text-teal-300 transition-all text-left"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 5 — Terms */}
                {step === 4 && (
                  <div className="space-y-4">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2 max-h-36 overflow-y-auto text-xs text-slate-400 leading-relaxed">
                      <p className="font-semibold text-slate-300">Terms of Service & Privacy Policy</p>
                      <p>By using LevelHubAI, you agree to our Terms of Service and Privacy Policy. We collect your profile data (name, school, phone, location) to personalize your learning experience and connect you with your school community.</p>
                      <p>Your data is encrypted and stored securely. We never sell your data to third parties. You can delete your account and data at any time from Settings.</p>
                      <p>For students under 13, parental consent is required. By proceeding, you confirm you are 13+ or have parental consent.</p>
                    </div>

                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="terms"
                        checked={form.acceptedTerms}
                        onCheckedChange={val => update('acceptedTerms', !!val)}
                        className="border-white/20 data-[state=checked]:bg-teal-500 data-[state=checked]:border-teal-500 mt-0.5"
                      />
                      <Label htmlFor="terms" className="text-sm text-slate-300 leading-relaxed cursor-pointer">
                        I have read and agree to the{' '}
                        <a href="/terms" target="_blank" className="text-teal-400 hover:underline">Terms of Service</a>
                        {' '}and{' '}
                        <a href="/privacy" target="_blank" className="text-teal-400 hover:underline">Privacy Policy</a>.
                      </Label>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex gap-3 mt-6">
              {step > 0 && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1 border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 rounded-xl"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
              )}

              {step < STEPS.length - 1 ? (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="flex-1 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white rounded-xl font-semibold disabled:opacity-40"
                >
                  Continue
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!form.acceptedTerms || saving}
                  className="flex-1 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white rounded-xl font-semibold disabled:opacity-40"
                >
                  {saving ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                  ) : (
                    <><CheckCircle2 className="w-4 h-4 mr-2" /> Complete Profile</>
                  )}
                </Button>
              )}
            </div>

            {step !== 4 && (
              <button
                onClick={handleSkip}
                className="w-full mt-3 text-xs text-slate-500 hover:text-slate-400 transition-colors"
              >
                Skip for now →
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfileCompletionPopup;
