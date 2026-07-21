import type { KeyboardEvent } from "react";

import { PawPrint } from "lucide-react";

import { productRoutes } from "../../app/routes";
import { NavigationItem } from "./NavigationItem";

const navigationKeys = new Set(["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft", "Home", "End"]);

export function Sidebar() {
  function handleNavigationKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (!navigationKeys.has(event.key)) {
      return;
    }

    const links = Array.from(
      event.currentTarget.querySelectorAll<HTMLAnchorElement>("[data-navigation-item='true']"),
    );
    const activeIndex = links.indexOf(document.activeElement as HTMLAnchorElement);

    if (activeIndex < 0) {
      return;
    }

    event.preventDefault();

    if (event.key === "Home") {
      links[0]?.focus();
      return;
    }

    if (event.key === "End") {
      links.at(-1)?.focus();
      return;
    }

    const direction = event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : -1;
    links[(activeIndex + direction + links.length) % links.length]?.focus();
  }

  return (
    <aside className="sidebar">
      <div className="brand" aria-label="Neo, el diario de tu perro">
        <span className="brand__mark" aria-hidden="true">
          N
        </span>
        <span className="brand__copy">
          <strong>Neo</strong>
          <small>El diario de tu perro</small>
        </span>
      </div>

      <nav
        aria-label="Navegación principal"
        className="sidebar__navigation"
        onKeyDown={handleNavigationKeyDown}
      >
        {productRoutes.map((route) => (
          <NavigationItem key={route.path} route={route} />
        ))}
      </nav>

      <div className="sidebar__footer">
        <span className="sidebar__footer-icon" aria-hidden="true">
          <PawPrint size={18} strokeWidth={1.7} />
        </span>
        <span className="sidebar__footer-copy">
          <strong>Privado y local</strong>
          <small>Sin cuentas ni conexión</small>
        </span>
      </div>
    </aside>
  );
}
