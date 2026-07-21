import type { ReactNode } from "react";

import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  action?: ReactNode;
  description: string;
  icon: LucideIcon;
  title: string;
}

export function EmptyState({ action, description, icon: Icon, title }: EmptyStateProps) {
  return (
    <section className="feedback-state feedback-state--empty">
      <span className="feedback-state__icon" aria-hidden="true">
        <Icon size={30} strokeWidth={1.5} />
      </span>
      <h2>{title}</h2>
      <p>{description}</p>
      {action ? <div className="feedback-state__action">{action}</div> : null}
    </section>
  );
}
