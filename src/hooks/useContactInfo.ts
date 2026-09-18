import { useState, useEffect } from "react";

export function useContactInfo() {
  const [isIgcse, setIsIgcse] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsIgcse(window.location.hostname.includes("igcse.co"));
    }
  }, []);

  return {
    email: isIgcse ? "hello@igcse.co" : "hello@olevel.com.pk",
    phone: isIgcse ? "+1 307 533 5472" : "+92 309 8444501",
    whatsappPhone: isIgcse ? "13075335472" : "923098444501",
    address: isIgcse ? null : "Lahore, Pakistan",
  };
}
