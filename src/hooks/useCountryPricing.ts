import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Country {
  code: string;
  name: string;
  currency: string;
  flag_emoji: string | null;
  enabled: boolean;
  is_default: boolean;
  display_order: number;
}

export interface CountryPricing {
  id: string;
  country_code: string;
  plan: string;
  currency: string;
  monthly_price: number | null;
  yearly_price: number | null;
  lifetime_price: number | null;
  paddle_price_id: string | null;
  enabled: boolean;
}

export function useCountries() {
  return useQuery({
    queryKey: ["countries"],
    queryFn: async () => {
      const { data } = await supabase
        .from("countries" as any)
        .select("*")
        .eq("enabled", true)
        .order("display_order");
      return (data ?? []) as unknown as Country[];
    },
    staleTime: 5 * 60_000,
  });
}

export function useCountryPricing(countryCode: string | undefined) {
  return useQuery({
    queryKey: ["country_pricing", countryCode],
    enabled: !!countryCode,
    queryFn: async () => {
      const { data } = await supabase
        .from("country_pricing" as any)
        .select("*")
        .eq("country_code", countryCode!)
        .eq("enabled", true);
      return (data ?? []) as unknown as CountryPricing[];
    },
    staleTime: 5 * 60_000,
  });
}

export function formatCurrency(amount: number | null | undefined, currency: string): string {
  if (amount == null) return "—";
  try {
    return new Intl.NumberFormat("en", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

export function useDetectCountry() {
  const [countryCode, setCountryCode] = useState<string>("US"); // Default to US globally
  const [isDetecting, setIsDetecting] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchCountry = async () => {
      try {
        const cached = sessionStorage.getItem("detected_country_code");
        if (cached) {
          if (mounted) {
            setCountryCode(cached);
            setIsDetecting(false);
          }
          return;
        }

        // Try api.country.is first (free, no CORS issues, no API key)
        let detected = "US";
        try {
          const res = await fetch("https://api.country.is/");
          const data = await res.json();
          if (data.country) {
            detected = data.country;
          }
        } catch (apiErr) {
          console.warn("Primary IP API failed, falling back to timezone", apiErr);
          // Fallback to Timezone estimation
          const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
          if (tz === "Asia/Karachi") detected = "PK";
          else if (tz === "Asia/Dubai") detected = "AE";
          else if (tz === "Europe/London") detected = "GB";
        }
        
        if (mounted) {
          setCountryCode(detected);
          sessionStorage.setItem("detected_country_code", detected);
        }
      } catch (err) {
        console.error("Failed to detect country", err);
      } finally {
        if (mounted) setIsDetecting(false);
      }
    };

    fetchCountry();
    return () => {
      mounted = false;
    };
  }, []);

  return { countryCode, isDetecting };
}

