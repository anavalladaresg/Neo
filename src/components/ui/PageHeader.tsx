import type { ReactNode } from "react";

interface PageHeaderProps {
  action?: ReactNode;
  description: string;
  eyebrow?: string;
  title: string;
}

export function PageHeader({ action, description, eyebrow, title }: PageHeaderProps) {
  return (
    <header className="page-header">
      <div className="page-header__copy">
        {eyebrow ? <p className="page-header__eyebrow">{eyebrow}</p> : null}
        <h1>{title}</h1>
        <p className="page-header__description">{description}</p>
      </div>
      {action ? <div className="page-header__action">{action}</div> : null}
    </header>
  );
}
