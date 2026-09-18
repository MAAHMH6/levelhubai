import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { identifyUser, resetAnalytics, track } from "@/lib/analytics";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const identifiedRef = useRef<string | null>(null);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        const u = session?.user;
        if (u && identifiedRef.current !== u.id) {
          identifyUser(u.id, u.email, { provider: u.app_metadata?.provider });
          identifiedRef.current = u.id;
          if (event === "SIGNED_IN") {
            track("user_logged_in", { user_id: u.id });
            if (u.created_at && Date.now() - new Date(u.created_at).getTime() < 60_000) {
              track("user_signed_up", { user_id: u.id });
            }
            
            // Check for pending referral code and apply it
            const pendingRef = localStorage.getItem("pending_referral_code");
            if (pendingRef) {
              supabase.rpc("apply_referral_code", { code_input: pendingRef }).then(({ data, error }) => {
                if (error) console.error("Error applying referral:", error);
                else console.log("Applied referral code:", pendingRef, data);
                localStorage.removeItem("pending_referral_code");
              });
            }
          }

        }
        if (!session && identifiedRef.current) {
          resetAnalytics();
          identifiedRef.current = null;
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      const u = session?.user;
      if (u && identifiedRef.current !== u.id) {
        identifyUser(u.id, u.email, { provider: u.app_metadata?.provider });
        identifiedRef.current = u.id;
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    resetAnalytics();
    identifiedRef.current = null;
  };


  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
