import type { PropsWithChildren } from "react";

import type { LucideIcon } from "lucide-react";

type BadgeTone = "accent" | "neutral" | "success" | "warning";

interface BadgeProps extends PropsWithChildren {
  icon?: LucideIcon;
  tone?: BadgeTone;
}

export function Badge({ children, icon: Icon, tone = "neutral" }: BadgeProps) {
  return (
    <span className={`badge badge--${tone}`}>
      {Icon ? <Icon aria-hidden="true" size={14} strokeWidth={1.8} /> : null}
      {children}
    </span>
  );
}
