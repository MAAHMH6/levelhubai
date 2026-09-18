import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export const ActivityTracker = () => {
  const { user } = useAuth();
  const location = useLocation();
  const hasTrackedInitially = useRef(false);

  useEffect(() => {
    if (!user) {
      hasTrackedInitially.current = false;
      return;
    }

    const trackActivity = async () => {
      try {
        const lastActiveString = localStorage.getItem("last_active_time");
        const now = Date.now();
        // Debounce tracking to at most once per hour (3600000 ms)
        const ONE_HOUR = 60 * 60 * 1000;

        if (!lastActiveString || now - parseInt(lastActiveString, 10) > ONE_HOUR) {
          const { error } = await supabase.rpc("update_last_active");
          if (!error) {
            localStorage.setItem("last_active_time", now.toString());
          } else {
            console.error("Failed to update activity:", error);
          }
        }
      } catch (e) {
        console.error("Error in activity tracking:", e);
      }
    };

    // Track when route changes or on initial load
    trackActivity();
    hasTrackedInitially.current = true;

  }, [user, location.pathname]);

  return null;
};
