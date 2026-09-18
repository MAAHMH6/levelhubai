import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function GeoRedirectBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [targetUrl, setTargetUrl] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (localStorage.getItem("geo_banner_dismissed")) return;

    const checkLocation = async () => {
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        
        const isPakistan = data.country_code === "PK";
        const currentHostname = window.location.hostname;

        // Skip detection on localhost/dev
        if (currentHostname.includes("localhost") || currentHostname.includes("127.0.0.1")) {
          return;
        }

        if (isPakistan && currentHostname.includes("igcse.co")) {
          setMessage("It looks like you're in Pakistan! 🇵🇰 Switch to Olevel.COM.PK for localized pricing and content.");
          setTargetUrl("https://olevel.com.pk" + window.location.pathname);
          setShowBanner(true);
        } else if (!isPakistan && currentHostname.includes("olevel.com.pk")) {
          setMessage("It looks like you're outside Pakistan! 🌍 Switch to IGCSE.CO for global pricing and content.");
          setTargetUrl("https://igcse.co" + window.location.pathname);
          setShowBanner(true);
        }
      } catch (err) {
        console.error("Geo location detection failed", err);
      }
    };
    
    checkLocation();
  }, []);

  if (!showBanner) return null;

  return (
    <div className="bg-primary text-primary-foreground py-3 px-4 flex items-center justify-between z-50 relative sticky top-0">
      <div className="flex-1 text-center text-sm md:text-base font-medium">
        {message}
        <a href={targetUrl} className="ml-3 underline font-bold whitespace-nowrap hover:text-accent">
          Switch Now →
        </a>
      </div>
      <Button 
        variant="ghost" 
        size="icon" 
        className="text-primary-foreground hover:bg-primary-foreground/20 hover:text-white shrink-0 ml-2 h-8 w-8"
        onClick={() => {
          localStorage.setItem("geo_banner_dismissed", "true");
          setShowBanner(false);
        }}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
