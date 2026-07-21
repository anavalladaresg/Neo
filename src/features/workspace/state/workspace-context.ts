import { createContext } from "react";

import type { WorkspaceStore } from "./workspace-store";

export const WorkspaceStoreContext = createContext<WorkspaceStore | null>(null);
