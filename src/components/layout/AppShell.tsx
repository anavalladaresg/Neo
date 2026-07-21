import { HardDrive, ShieldCheck } from "lucide-react";
import { useEffect, useRef, type MouseEvent } from "react";
import { Outlet } from "react-router-dom";

import { Badge } from "../ui/Badge";
import { Sidebar } from "../navigation/Sidebar";
import { useWorkspace } from "../../features/workspace/state/useWorkspace";
import { workspaceCopy } from "../../features/workspace/workspace-copy";
import "../../styles/shell.css";

function focusMainContent(event: MouseEvent<HTMLAnchorElement>) {
  event.preventDefault();
  document.getElementById("main-content")?.focus();
}

export function AppShell() {
  const activeWorkspace = useWorkspace((state) => state.activeWorkspace);
  const notice = useWorkspace((state) => state.notice);
  const noticeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (notice) {
      noticeRef.current?.focus();
    }
  }, [notice]);

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
          <div className="app-topbar__workspace">
            {notice ? (
              <div className="workspace-notice" ref={noticeRef} role="status" tabIndex={-1}>
                {workspaceCopy.success[notice]}
              </div>
            ) : null}
            <Badge icon={HardDrive} tone="neutral">
              {activeWorkspace?.manifest.name ?? "Espacio local"}
            </Badge>
          </div>
        </header>

        <main className="app-content" id="main-content" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
