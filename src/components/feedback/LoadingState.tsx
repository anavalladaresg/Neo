import { LoaderCircle } from "lucide-react";

interface LoadingStateProps {
  description?: string;
  title: string;
}

export function LoadingState({ description, title }: LoadingStateProps) {
  return (
    <section aria-live="polite" className="feedback-state feedback-state--loading" role="status">
      <span className="feedback-state__icon feedback-state__icon--loading" aria-hidden="true">
        <LoaderCircle size={30} strokeWidth={1.5} />
      </span>
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
    </section>
  );
}
