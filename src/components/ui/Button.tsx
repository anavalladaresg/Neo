import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

import type { LucideIcon } from "lucide-react";

type ButtonTone = "danger" | "primary" | "secondary" | "quiet";

interface ButtonProps extends PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> {
  icon?: LucideIcon;
  tone?: ButtonTone;
}

export function Button({
  children,
  className = "",
  icon: Icon,
  tone = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button className={`button button--${tone} ${className}`.trim()} type={type} {...props}>
      {Icon ? <Icon aria-hidden="true" size={17} strokeWidth={1.8} /> : null}
      <span>{children}</span>
    </button>
  );
}
