import { NavLink } from "react-router-dom";

import type { ProductRoute } from "../../app/routes";

interface NavigationItemProps {
  route: ProductRoute;
}

export function NavigationItem({ route }: NavigationItemProps) {
  const Icon = route.icon;

  return (
    <NavLink
      aria-label={route.title}
      className={({ isActive }) => `navigation-item${isActive ? " navigation-item--active" : ""}`}
      data-navigation-item="true"
      end={route.path === "/"}
      title={route.title}
      to={route.path}
    >
      <Icon aria-hidden="true" className="navigation-item__icon" size={20} strokeWidth={1.7} />
      <span className="navigation-item__label">{route.title}</span>
    </NavLink>
  );
}
