import { HardDrive, ShieldCheck } from "lucide-react";
import type { MouseEvent } from "react";
import { Outlet } from "react-router-dom";

import { Badge } from "../ui/Badge";
import { Sidebar } from "../navigation/Sidebar";
import "../../styles/shell.css";

function focusMainContent(event: MouseEvent<HTMLAnchorElement>) {
  event.preventDefault();
  document.getElementById("main-content")?.focus();
}

export function AppShell() {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content" onClick={focusMainContent}>
        Saltar al contenido
      </a>

      <Sidebar />

      <div className="app-frame">
        <header className="app-topbar">
          <div className="app-topbar__context">
            <ShieldCheck aria-hidden="true" size={17} strokeWidth={1.8} />
            <span>Tu espacio personal</span>
          </div>
          <Badge icon={HardDrive} tone="neutral">
            Solo en este dispositivo
          </Badge>
        </header>

        <main className="app-content" id="main-content" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
