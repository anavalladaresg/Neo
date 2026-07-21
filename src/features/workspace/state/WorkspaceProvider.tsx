import { useState, type PropsWithChildren } from "react";

import { getDefaultWorkspaceService } from "../services/tauri-workspace-service";
import type { WorkspaceService } from "../services/workspace-service";
import { WorkspaceStoreContext } from "./workspace-context";
import { createWorkspaceStore } from "./workspace-store";

interface WorkspaceProviderProps extends PropsWithChildren {
  service?: WorkspaceService;
}

export function WorkspaceProvider({ children, service }: WorkspaceProviderProps) {
  const [store] = useState(() => createWorkspaceStore(service ?? getDefaultWorkspaceService()));

  return <WorkspaceStoreContext.Provider value={store}>{children}</WorkspaceStoreContext.Provider>;
}
