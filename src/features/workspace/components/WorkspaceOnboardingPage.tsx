import { useEffect, useRef, useState, type FocusEvent } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Archive, FolderHeart, FolderOpen, HardDrive, Images, ShieldCheck } from "lucide-react";

import { ErrorState } from "../../../components/feedback/ErrorState";
import { LoadingState } from "../../../components/feedback/LoadingState";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { ConfirmationDialog } from "../../../components/ui/ConfirmationDialog";
import { TextField } from "../../../components/ui/TextField";
import { formatPrivateWorkspacePath } from "../domain/workspace-formatting";
import { normalizeWorkspaceName, validateWorkspaceName } from "../domain/workspace-name";
import { useWorkspace } from "../state/useWorkspace";
import {
  workspaceCopy,
  getWorkspaceErrorMessage,
  getWorkspaceNameMessage,
} from "../workspace-copy";

interface WorkspaceFormValues {
  workspaceName: string;
}

export function WorkspaceOnboardingPage() {
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const errorRef = useRef<HTMLDivElement>(null);
  const {
    cancelCreation,
    createWorkspace,
    error,
    openExistingWorkspace,
    openRecentWorkspace,
    operation,
    pendingSelection,
    recentWorkspaces,
    selectParentDirectory,
  } = useWorkspace((state) => state);
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    setValue,
  } = useForm<WorkspaceFormValues>({ defaultValues: { workspaceName: "" }, mode: "onBlur" });
  const workspaceName = useWatch({ control, name: "workspaceName" });
  const workspaceNameField = register("workspaceName", {
    validate: (value) => {
      const result = validateWorkspaceName(value);
      return result.success || getWorkspaceNameMessage(result.code);
    },
  });
  const validation = validateWorkspaceName(workspaceName);
  const normalizedName = validation.success ? validation.value : "";
  const isPending = operation !== "idle";

  useEffect(() => {
    if (error) {
      errorRef.current?.focus();
    }
  }, [error]);

  const errorMessage = error ? getWorkspaceErrorMessage(error) : null;

  return (
    <main className="workspace-onboarding">
      <div className="workspace-onboarding__brand" aria-label="Neo, el diario de tu perro">
        <span className="brand__mark" aria-hidden="true">
          N
        </span>
        <span>
          <strong>Neo</strong>
          <small>El diario de tu perro</small>
        </span>
      </div>

      <section className="workspace-onboarding__hero" aria-labelledby="workspace-onboarding-title">
        <div className="workspace-onboarding__copy">
          <p className="page-header__eyebrow">{workspaceCopy.onboarding.eyebrow}</p>
          <h1 id="workspace-onboarding-title">{workspaceCopy.onboarding.title}</h1>
          <p>{workspaceCopy.onboarding.description}</p>
        </div>

        <div className="workspace-benefits" aria-label="Cómo protege Neo tus datos">
          <WorkspaceBenefit
            description={workspaceCopy.onboarding.localControlDescription}
            icon={Archive}
            title={workspaceCopy.onboarding.localControlTitle}
          />
          <WorkspaceBenefit
            description={workspaceCopy.onboarding.privateDescription}
            icon={ShieldCheck}
            title={workspaceCopy.onboarding.privateTitle}
          />
          <WorkspaceBenefit
            description={workspaceCopy.onboarding.assetsDescription}
            icon={Images}
            title={workspaceCopy.onboarding.assetsTitle}
          />
        </div>
      </section>

      <Card className="workspace-onboarding__actions">
        {operation === "opening" ? (
          <LoadingState
            description={workspaceCopy.onboarding.openingDescription}
            title={workspaceCopy.onboarding.openingTitle}
          />
        ) : pendingSelection ? (
          <form
            className="workspace-create-form"
            onSubmit={(event) => void handleSubmit(() => setConfirmationOpen(true))(event)}
          >
            <div>
              <h2>{workspaceCopy.onboarding.createTitle}</h2>
              <p>{workspaceCopy.onboarding.createDescription}</p>
            </div>

            <TextField
              autoComplete="off"
              disabled={isPending}
              error={errors.workspaceName?.message}
              hint={workspaceCopy.onboarding.workspaceNameHint}
              label={workspaceCopy.onboarding.workspaceNameLabel}
              {...workspaceNameField}
              onBlur={(event: FocusEvent<HTMLInputElement>) => {
                void workspaceNameField.onBlur(event);
                setValue("workspaceName", normalizeWorkspaceName(event.target.value), {
                  shouldValidate: true,
                });
              }}
            />

            <div className="workspace-folder-preview">
              <span>{workspaceCopy.onboarding.resultingFolder}</span>
              <strong>
                {formatPrivateWorkspacePath(pendingSelection.displayPath)}
                {"\\"}
                {normalizedName || "…"}
              </strong>
            </div>

            {operation === "creating" ? (
              <LoadingState
                description={workspaceCopy.onboarding.creatingDescription}
                title={workspaceCopy.onboarding.creatingTitle}
              />
            ) : null}

            <div className="workspace-create-form__actions">
              <Button disabled={isPending} onClick={cancelCreation} tone="quiet">
                {workspaceCopy.onboarding.chooseAnotherFolder}
              </Button>
              <Button disabled={isPending} icon={FolderHeart} type="submit">
                {workspaceCopy.onboarding.confirmCreationAction}
              </Button>
            </div>
          </form>
        ) : (
          <div className="workspace-primary-actions">
            <Button
              disabled={isPending}
              icon={FolderHeart}
              onClick={() => void selectParentDirectory()}
            >
              {workspaceCopy.onboarding.createAction}
            </Button>
            <Button
              disabled={isPending}
              icon={FolderOpen}
              onClick={() => void openExistingWorkspace()}
              tone="secondary"
            >
              {workspaceCopy.onboarding.openAction}
            </Button>
          </div>
        )}
      </Card>

      {errorMessage ? (
        <div ref={errorRef} tabIndex={-1}>
          <ErrorState description={errorMessage.description} title={errorMessage.title} />
        </div>
      ) : null}

      {recentWorkspaces.length > 0 && !pendingSelection ? (
        <section className="workspace-recents" aria-labelledby="recent-workspaces-title">
          <div>
            <h2 id="recent-workspaces-title">{workspaceCopy.onboarding.recentTitle}</h2>
            <p>{workspaceCopy.onboarding.recentDescription}</p>
          </div>
          <div className="workspace-recents__list">
            {recentWorkspaces.map((workspace) => (
              <Card key={workspace.manifest.workspaceId}>
                <div className="workspace-recent-item">
                  <span className="workspace-recent-item__icon" aria-hidden="true">
                    <HardDrive size={20} strokeWidth={1.6} />
                  </span>
                  <div>
                    <strong>{workspace.manifest.name}</strong>
                    <span>{formatPrivateWorkspacePath(workspace.rootPath)}</span>
                  </div>
                  <Button
                    disabled={isPending}
                    onClick={() => void openRecentWorkspace(workspace.manifest.workspaceId)}
                    tone="quiet"
                  >
                    {workspaceCopy.onboarding.openRecentAction}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      <ConfirmationDialog
        confirmLabel={workspaceCopy.onboarding.confirmCreationAction}
        confirmTone="primary"
        description={`${workspaceCopy.onboarding.confirmCreationDescription} ${normalizedName}`}
        onCancel={() => setConfirmationOpen(false)}
        onConfirm={() => {
          setConfirmationOpen(false);
          void createWorkspace(normalizedName);
        }}
        open={confirmationOpen}
        title={workspaceCopy.onboarding.confirmCreationTitle}
      />
    </main>
  );
}

interface WorkspaceBenefitProps {
  description: string;
  icon: typeof Archive;
  title: string;
}

function WorkspaceBenefit({ description, icon: Icon, title }: WorkspaceBenefitProps) {
  return (
    <article className="workspace-benefit">
      <span aria-hidden="true">
        <Icon size={21} strokeWidth={1.6} />
      </span>
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </article>
  );
}
