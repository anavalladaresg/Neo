import type { ReactNode } from "react";

import { CircleAlert } from "lucide-react";

interface ErrorStateProps {
  action?: ReactNode;
  description: string;
  title: string;
}

export function ErrorState({ action, description, title }: ErrorStateProps) {
  return (
    <section className="feedback-state feedback-state--error" role="alert">
      <span className="feedback-state__icon" aria-hidden="true">
        <CircleAlert size={30} strokeWidth={1.5} />
      </span>
      <h2>{title}</h2>
      <p>{description}</p>
      {action ? <div className="feedback-state__action">{action}</div> : null}
    </section>
  );
}
