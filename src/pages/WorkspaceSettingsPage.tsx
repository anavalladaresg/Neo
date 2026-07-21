import { useEffect, useRef, useState } from "react";
import { CalendarDays, FolderOpen, HardDrive, ShieldCheck } from "lucide-react";

import { ErrorState } from "../components/feedback/ErrorState";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { ConfirmationDialog } from "../components/ui/ConfirmationDialog";
import { PageHeader } from "../components/ui/PageHeader";
import {
  formatPrivateWorkspacePath,
  formatWorkspaceDate,
} from "../features/workspace/domain/workspace-formatting";
import { useWorkspace } from "../features/workspace/state/useWorkspace";
import { getWorkspaceErrorMessage, workspaceCopy } from "../features/workspace/workspace-copy";

export function WorkspaceSettingsPage() {
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const errorRef = useRef<HTMLDivElement>(null);
  const activeWorkspace = useWorkspace((state) => state.activeWorkspace);
  const error = useWorkspace((state) => state.error);
  const openExistingWorkspace = useWorkspace((state) => state.openExistingWorkspace);
  const operation = useWorkspace((state) => state.operation);

  useEffect(() => {
    if (error) {
      errorRef.current?.focus();
    }
  }, [error]);

  if (!activeWorkspace) {
    return null;
  }

  const errorMessage = error ? getWorkspaceErrorMessage(error) : null;

  return (
    <div className="page-stack">
      <PageHeader
        action={<Badge tone="success">Activo</Badge>}
        description={workspaceCopy.settings.description}
        eyebrow="Neo"
        title={workspaceCopy.settings.title}
      />

      <Card
        action={
          <Button
            disabled={operation !== "idle"}
            icon={FolderOpen}
            onClick={() => setConfirmationOpen(true)}
            tone="secondary"
          >
            {workspaceCopy.settings.switchAction}
          </Button>
        }
        description={workspaceCopy.settings.localNote}
        title={workspaceCopy.settings.sectionTitle}
      >
        <dl className="workspace-details">
          <WorkspaceDetail
            icon={HardDrive}
            label={workspaceCopy.settings.currentLabel}
            value={activeWorkspace.manifest.name}
          />
          <WorkspaceDetail
            icon={FolderOpen}
            label={workspaceCopy.settings.locationLabel}
            value={formatPrivateWorkspacePath(activeWorkspace.rootPath)}
          />
          <WorkspaceDetail
            icon={ShieldCheck}
            label={workspaceCopy.settings.schemaLabel}
            value={String(activeWorkspace.manifest.schemaVersion)}
          />
          <WorkspaceDetail
            icon={CalendarDays}
            label={workspaceCopy.settings.createdLabel}
            value={formatWorkspaceDate(activeWorkspace.manifest.createdAt)}
          />
        </dl>
      </Card>

      {errorMessage ? (
        <div ref={errorRef} tabIndex={-1}>
          <ErrorState description={errorMessage.description} title={errorMessage.title} />
        </div>
      ) : null}

      <ConfirmationDialog
        confirmLabel={workspaceCopy.settings.switchConfirm}
        confirmTone="primary"
        description={workspaceCopy.settings.switchDescription}
        onCancel={() => setConfirmationOpen(false)}
        onConfirm={() => {
          setConfirmationOpen(false);
          void openExistingWorkspace();
        }}
        open={confirmationOpen}
        title={workspaceCopy.settings.switchTitle}
      />
    </div>
  );
}

interface WorkspaceDetailProps {
  icon: typeof HardDrive;
  label: string;
  value: string;
}

function WorkspaceDetail({ icon: Icon, label, value }: WorkspaceDetailProps) {
  return (
    <div className="workspace-detail">
      <span aria-hidden="true">
        <Icon size={19} strokeWidth={1.65} />
      </span>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
