import { useContext } from "react";
import { useStore } from "zustand";

import { WorkspaceStoreContext } from "./workspace-context";
import type { WorkspaceState } from "./workspace-store";

export function useWorkspace<T>(selector: (state: WorkspaceState) => T): T {
  const store = useContext(WorkspaceStoreContext);
  if (!store) {
    throw new Error("useWorkspace must be used within WorkspaceProvider");
  }

  return useStore(store, selector);
}
