import type { PropsWithChildren, ReactNode } from "react";

interface CardProps extends PropsWithChildren {
  action?: ReactNode;
  className?: string;
  description?: string;
  title?: string;
}

export function Card({ action, children, className = "", description, title }: CardProps) {
  return (
    <section className={`card ${className}`.trim()}>
      {title || description || action ? (
        <header className="card__header">
          <div>
            {title ? <h2 className="card__title">{title}</h2> : null}
            {description ? <p className="card__description">{description}</p> : null}
          </div>
          {action ? <div className="card__action">{action}</div> : null}
        </header>
      ) : null}
      <div className="card__content">{children}</div>
    </section>
  );
}
