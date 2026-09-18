import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2, Mail, Lock, User, GraduationCap } from "lucide-react";
import { z } from "zod";
import { Navbar } from "@/components/landing/Navbar";
import { FloatingWhatsAppButton } from "@/components/common/FloatingWhatsAppButton";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

const Auth = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<"student" | "teacher" | "parent">("student");
  const [referralCode, setReferralCode] = useState("");
  const [ageConsent, setAgeConsent] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [programme, setProgramme] = useState<"o_level" | "igcse" | "a_level">("igcse");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    const teacherRef = params.get("teacher_ref");
    const activeRef = ref || teacherRef;
    
    if (activeRef) {
      setReferralCode(activeRef);
      setRole("student");
      localStorage.setItem("pending_referral_code", activeRef);
    }

    const checkRoleAndRedirect = async () => {
      if (!authLoading && user) {
        const { data } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
        if (data?.role === 'teacher') {
          navigate("/teacher/dashboard");
        } else if (data?.role === 'parent') {
          navigate("/parent/dashboard");
        } else {
          navigate("/home");
        }
      }
    };
    checkRoleAndRedirect();
  }, [user, authLoading, navigate]);

  const validateInputs = (isSignUp: boolean) => {
    try {
      emailSchema.parse(email);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        return false;
      }
    }

    try {
      passwordSchema.parse(password);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        return false;
      }
    }

    if (isSignUp && !displayName.trim()) {
      toast.error("Please enter your name");
      return false;
    }

    return true;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInputs(false)) return;

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        toast.error("Invalid email or password. Please try again.");
      } else if (error.message.includes("Email not confirmed")) {
        toast.error("Please confirm your email before signing in.");
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success("Welcome back to LevelHubAI!");
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data } = await supabase.from('profiles').select('role').eq('id', session.user.id).maybeSingle();
        if (data?.role === 'teacher') {
          navigate("/teacher/dashboard");
          return;
        } else if (data?.role === 'parent') {
          navigate("/parent/dashboard");
          return;
        }
      }
      navigate("/home");
    }
    setLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    try {
      emailSchema.parse(email);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        return;
      }
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password reset instructions sent to your email!");
      setIsForgotPassword(false);
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInputs(true)) return;
    if (!ageConsent) {
      toast.error("You must confirm you are over 13 or have parental consent.");
      return;
    }

    setLoading(true);
    const redirectUrl = `${window.location.origin}/`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: displayName,
          role: role,
          grade_level: role === "student" ? programme : null,
          referral_code: role === "student" ? referralCode : null,
        },
      },
    });

    if (error) {
      if (error.message.includes("already registered")) {
        toast.error("This email is already registered. Please sign in instead.");
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success("Account created! Check your email to confirm.");
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
      {/* PUBLIC NAVBAR AT TOP OF AUTH PAGE */}
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4 pt-28 pb-16 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
        </div>

        <Card className="w-full max-w-md relative z-10 border-teal-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-3xl shadow-xl">
        <CardHeader className="text-center space-y-2 pb-4">
          <div className="mx-auto flex items-center justify-center mb-1">
            <img src="/logo.png" alt="LevelHubAI" className="h-12 w-auto object-contain" />
          </div>
          <CardTitle className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            LevelHub<span className="text-teal-600">AI</span>
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Cambridge AI-Powered Learning & Assessment Platform
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="signin" className="space-y-4">
            {!isForgotPassword ? (
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
            ) : null}

            {isForgotPassword ? (
              <div className="space-y-4">
                <div className="space-y-2 text-center">
                  <h3 className="text-lg font-medium">Reset Password</h3>
                  <p className="text-sm text-muted-foreground">
                    Enter your email to receive a password reset link.
                  </p>
                </div>
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Send Reset Link
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => setIsForgotPassword(false)}
                  >
                    Back to Sign In
                  </Button>
                </form>
              </div>
            ) : (
              <>
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-xs font-normal"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsForgotPassword(true);
                    }}
                  >
                    Forgot your password?
                  </Button>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Sign In
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Your name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <Label>I want to sign up as a:</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      type="button"
                      variant={role === "student" ? "default" : "outline"}
                      onClick={() => setRole("student")}
                      className="px-2"
                    >
                      Student
                    </Button>
                    <Button
                      type="button"
                      variant={role === "parent" ? "default" : "outline"}
                      onClick={() => setRole("parent")}
                      className="px-2"
                    >
                      Parent
                    </Button>
                    <Button
                      type="button"
                      variant={role === "teacher" ? "default" : "outline"}
                      onClick={() => setRole("teacher")}
                      className="px-2 text-xs"
                    >
                      Teacher
                    </Button>
                  </div>
                </div>

                {role === "student" && (
                  <div className="space-y-2 pt-1">
                    <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Cambridge Programme</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        type="button"
                        variant={programme === "o_level" ? "default" : "outline"}
                        onClick={() => setProgramme("o_level")}
                        className={`text-xs h-9 rounded-xl ${programme === "o_level" ? "bg-teal-600 hover:bg-teal-500 text-white font-bold" : ""}`}
                      >
                        O Level
                      </Button>
                      <Button
                        type="button"
                        variant={programme === "igcse" ? "default" : "outline"}
                        onClick={() => setProgramme("igcse")}
                        className={`text-xs h-9 rounded-xl ${programme === "igcse" ? "bg-teal-600 hover:bg-teal-500 text-white font-bold" : ""}`}
                      >
                        IGCSE
                      </Button>
                      <Button
                        type="button"
                        variant={programme === "a_level" ? "default" : "outline"}
                        onClick={() => setProgramme("a_level")}
                        className={`text-xs h-9 rounded-xl ${programme === "a_level" ? "bg-teal-600 hover:bg-teal-500 text-white font-bold" : ""}`}
                      >
                        A Level
                      </Button>
                    </div>
                  </div>
                )}

                {role === "student" && (
                  <div className="space-y-2">
                    <Label htmlFor="signup-referral">Referral Code (Optional)</Label>
                    <Input
                      id="signup-referral"
                      type="text"
                      placeholder="e.g. SIRALI10"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value)}
                    />
                  </div>
                )}

                <div className="flex items-start space-x-2 pt-2">
                  <Checkbox 
                    id="age-consent" 
                    checked={ageConsent}
                    onCheckedChange={(c) => setAgeConsent(c === true)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor="age-consent"
                      className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I confirm I am over 13 (or 16 in the EU), or I have parental consent to use this platform.
                    </label>
                  </div>
                </div>

                <Button type="submit" className="w-full mt-4" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Create Account
                </Button>
              </form>
            </TabsContent>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </Button>
              </>
            )}
          </Tabs>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default Auth;
