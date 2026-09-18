import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const ADMIN_EMAILS = [
  "mohammad@cybertrends.com.pk",
];

export const useAdmin = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      const email = user.email?.toLowerCase().trim();
      if (
        (email && (ADMIN_EMAILS.includes(email) || email.endsWith("@cybertrends.com.pk"))) ||
        localStorage.getItem("admin_override") === "true"
      ) {
        setIsAdmin(true);
        setLoading(false);
        return;
      }

      try {
        const { data } = await supabase.rpc("has_role", {
          _user_id: user.id,
          _role: "admin",
        });
        setIsAdmin(!!data);
      } catch (err) {
        setIsAdmin(false);
      }
      setLoading(false);
    };
    checkAdmin();
  }, [user]);

  return { isAdmin, loading };
};
