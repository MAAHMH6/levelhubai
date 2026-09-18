import { ReactNode, useState } from "react";
import { PremiumModal } from "./PremiumModal";
import { useSubscription } from "@/hooks/useSubscription";

interface Props {
  allowed: boolean;
  children: ReactNode;
  title?: string;
  description?: string;
}

/** Wraps children — if not allowed, intercepts clicks and shows the upgrade modal. */
export function PremiumGate({ allowed, children, title, description }: Props) {
  const [open, setOpen] = useState(false);
  if (allowed) return <>{children}</>;
  return (
    <>
      <div
        onClickCapture={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(true); }}
        className="relative cursor-pointer"
      >
        {children}
      </div>
      <PremiumModal open={open} onOpenChange={setOpen} title={title} description={description} />
    </>
  );
}

export function usePremiumGate() {
  const sub = useSubscription();
  const [open, setOpen] = useState(false);
  const [ctx, setCtx] = useState<{ title?: string; description?: string }>({});
  const gate = (allowed: boolean, opts?: { title?: string; description?: string }) => {
    if (allowed) return true;
    setCtx(opts ?? {});
    setOpen(true);
    return false;
  };
  const modal = <PremiumModal open={open} onOpenChange={setOpen} {...ctx} />;
  return { sub, gate, modal };
}
