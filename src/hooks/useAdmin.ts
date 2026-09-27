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
    let isMounted = true;

    const checkAdmin = async () => {
      if (!user) {
        if (isMounted) {
          setIsAdmin(false);
          setLoading(false);
        }
        return;
      }

      const email = user.email?.toLowerCase().trim();
      // Verified platform administrators
      if (email && (ADMIN_EMAILS.includes(email) || email.endsWith("@cybertrends.com.pk"))) {
        if (isMounted) {
          setIsAdmin(true);
          setLoading(false);
        }
        return;
      }

      try {
        // Check profiles table role
        const { data: prof } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        if (prof?.role === "admin") {
          if (isMounted) {
            setIsAdmin(true);
            setLoading(false);
          }
          return;
        }

        // Check PostgreSQL has_role function
        const { data: roleCheck } = await supabase.rpc("has_role", {
          _user_id: user.id,
          _role: "admin",
        });

        if (isMounted) {
          setIsAdmin(!!roleCheck);
        }
      } catch (err) {
        if (isMounted) {
          setIsAdmin(false);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkAdmin();

    const handleRoleUpdate = () => {
      checkAdmin();
    };

    window.addEventListener("levelhub:admin_role_updated", handleRoleUpdate);
    window.addEventListener("levelhub:admin_data_updated", handleRoleUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener("levelhub:admin_role_updated", handleRoleUpdate);
      window.removeEventListener("levelhub:admin_data_updated", handleRoleUpdate);
    };
  }, [user]);

  return { isAdmin, loading };
};
