import { useEffect } from "react";

import { AppRouter } from "../../../app/router";
import { LoadingState } from "../../../components/feedback/LoadingState";
import { useWorkspace } from "../state/useWorkspace";
import { WorkspaceOnboardingPage } from "./WorkspaceOnboardingPage";

export function WorkspaceGateway() {
  const initialize = useWorkspace((state) => state.initialize);
  const status = useWorkspace((state) => state.status);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  if (status === "booting") {
    return (
      <main className="workspace-onboarding workspace-onboarding--loading">
        <LoadingState
          description="Estamos comprobando tu último espacio local."
          title="Preparando Neo"
        />
      </main>
    );
  }

  if (status === "onboarding") {
    return <WorkspaceOnboardingPage />;
  }

  return <AppRouter />;
}
