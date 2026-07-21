import { WorkspaceGateway } from "./features/workspace/components/WorkspaceGateway";
import type { WorkspaceService } from "./features/workspace/services/workspace-service";
import { WorkspaceProvider } from "./features/workspace/state/WorkspaceProvider";

interface AppProps {
  workspaceService?: WorkspaceService;
}

export function App({ workspaceService }: AppProps) {
  return (
    <WorkspaceProvider service={workspaceService}>
      <WorkspaceGateway />
    </WorkspaceProvider>
  );
}
