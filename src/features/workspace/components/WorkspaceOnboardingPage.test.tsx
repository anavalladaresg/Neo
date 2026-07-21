import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { describe, expect, it, vi } from "vitest";

import { App } from "../../../App";
import type { WorkspaceSummary } from "../domain/workspace-types";
import type { WorkspaceService } from "../services/workspace-service";
import {
  createWorkspaceServiceMock,
  neoWorkspaceFixture,
} from "../../../test/workspace-test-service";

const familyWorkspace: WorkspaceSummary = {
  manifest: {
    ...neoWorkspaceFixture.manifest,
    workspaceId: "01900000-0000-7000-8000-000000000001",
    name: "Familia",
  },
  rootPath: "D:\\Familia\\Neo",
};

function createFirstRunService(overrides: Partial<WorkspaceService> = {}) {
  return createWorkspaceServiceMock({
    loadSession: vi.fn().mockResolvedValue({ activeWorkspace: null, recentWorkspaces: [] }),
    ...overrides,
  });
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}

describe("workspace onboarding", () => {
  it("explains local storage and exposes the two primary first-run actions", async () => {
    const service = createFirstRunService();
    const { container } = render(<App workspaceService={service} />);

    expect(
      await screen.findByRole("heading", { name: "Tus datos, siempre contigo", level: 1 }),
    ).toBeVisible();
    expect(screen.getByText("Nada se sube a internet")).toBeVisible();
    expect(screen.getByRole("button", { name: "Crear espacio de trabajo" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Abrir espacio existente" })).toBeEnabled();

    const results = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
    expect(results.violations).toEqual([]);
  });

  it("validates the workspace name, confirms creation, and focuses success feedback", async () => {
    const user = userEvent.setup();
    const service = createFirstRunService();
    render(<App workspaceService={service} />);

    await user.click(await screen.findByRole("button", { name: "Crear espacio de trabajo" }));
    const nameField = await screen.findByRole("textbox", { name: "Nombre del espacio" });
    await user.type(nameField, "CON");
    await user.tab();
    expect(screen.getByText("Ese nombre está reservado por Windows. Elige otro.")).toBeVisible();

    await user.clear(nameField);
    await user.type(nameField, "  Mi   Neo  ");
    await user.tab();
    expect(nameField).toHaveValue("Mi Neo");
    expect(screen.getByText((content) => content.endsWith("Example\\Mi Neo"))).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Crear espacio" }));
    expect(screen.getByRole("dialog", { name: "¿Crear este espacio de trabajo?" })).toBeVisible();
    await user.click(
      within(screen.getByRole("dialog", { name: "¿Crear este espacio de trabajo?" })).getByRole(
        "button",
        { name: "Crear espacio" },
      ),
    );

    const success = await screen.findByText("Espacio de trabajo creado correctamente.");
    expect(success).toHaveFocus();
    expect(await screen.findByRole("heading", { name: "Buenos días" })).toBeVisible();
    expect(service.createWorkspace).toHaveBeenCalledWith(
      "550e8400-e29b-41d4-a716-446655440000",
      "Mi Neo",
    );
  });

  it("shows a disabled loading state while creation is pending", async () => {
    const user = userEvent.setup();
    const creation = deferred<WorkspaceSummary>();
    const service = createFirstRunService({
      createWorkspace: vi.fn().mockReturnValue(creation.promise),
    });
    render(<App workspaceService={service} />);

    await user.click(await screen.findByRole("button", { name: "Crear espacio de trabajo" }));
    await user.type(screen.getByRole("textbox", { name: "Nombre del espacio" }), "Neo");
    await user.click(screen.getByRole("button", { name: "Crear espacio" }));
    await user.click(
      within(screen.getByRole("dialog", { name: "¿Crear este espacio de trabajo?" })).getByRole(
        "button",
        { name: "Crear espacio" },
      ),
    );

    expect(await screen.findByRole("heading", { name: "Preparando tu espacio" })).toBeVisible();
    expect(screen.getByRole("textbox", { name: "Nombre del espacio" })).toBeDisabled();
    creation.resolve(neoWorkspaceFixture);
    expect(await screen.findByRole("heading", { name: "Buenos días" })).toBeVisible();
  });

  it("keeps onboarding unchanged when a native directory dialog is cancelled", async () => {
    const user = userEvent.setup();
    const service = createFirstRunService({
      openExistingWorkspace: vi.fn().mockResolvedValue(null),
      selectParentDirectory: vi.fn().mockResolvedValue(null),
    });
    render(<App workspaceService={service} />);

    await user.click(await screen.findByRole("button", { name: "Crear espacio de trabajo" }));
    expect(screen.queryByRole("textbox", { name: "Nombre del espacio" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Abrir espacio existente" }));
    expect(screen.getByRole("heading", { name: "Tus datos, siempre contigo" })).toBeVisible();
  });

  it.each([
    ["malformed_manifest", "El espacio está dañado"],
    ["unsupported_schema", "Esta versión de Neo no puede abrir el espacio"],
    ["not_workspace", "Esta carpeta no es un espacio de Neo"],
  ] as const)("focuses the recoverable %s error", async (code, title) => {
    const user = userEvent.setup();
    const service = createFirstRunService({
      openExistingWorkspace: vi.fn().mockRejectedValue({ code }),
    });
    const { container } = render(<App workspaceService={service} />);

    await user.click(await screen.findByRole("button", { name: "Abrir espacio existente" }));
    const alert = await screen.findByRole("alert");
    expect(within(alert).getByRole("heading", { name: title })).toBeVisible();
    expect(alert.parentElement).toHaveFocus();

    const results = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
    expect(results.violations).toEqual([]);
  });

  it("opens a valid existing workspace and keeps navigation available", async () => {
    const user = userEvent.setup();
    const service = createFirstRunService();
    render(<App workspaceService={service} />);

    await user.click(await screen.findByRole("button", { name: "Abrir espacio existente" }));
    expect(await screen.findByRole("heading", { name: "Buenos días" })).toBeVisible();
    expect(screen.getByRole("navigation", { name: "Navegación principal" })).toBeVisible();
    expect(screen.getAllByText("Neo").length).toBeGreaterThan(0);
  });

  it("opens a revalidated recent workspace with keyboard-only interaction", async () => {
    const user = userEvent.setup();
    const service = createFirstRunService({
      loadSession: vi.fn().mockResolvedValue({
        activeWorkspace: null,
        recentWorkspaces: [familyWorkspace],
      }),
      openRecentWorkspace: vi.fn().mockResolvedValue(familyWorkspace),
    });
    render(<App workspaceService={service} />);

    const openRecent = await screen.findByRole("button", { name: "Abrir" });
    openRecent.focus();
    await user.keyboard("{Enter}");
    expect(await screen.findByRole("heading", { name: "Buenos días" })).toBeVisible();
    expect(screen.getAllByText("Familia").length).toBeGreaterThan(0);
  });

  it("shows workspace details in settings and confirms before switching", async () => {
    const user = userEvent.setup();
    const service = createWorkspaceServiceMock({
      openExistingWorkspace: vi.fn().mockResolvedValue(familyWorkspace),
    });
    const { container } = render(<App workspaceService={service} />);

    await user.click(await screen.findByRole("link", { name: "Ajustes" }));
    expect(screen.getByRole("heading", { name: "Espacio de trabajo" })).toBeVisible();
    expect(screen.getByText("…\\Example\\Neo")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Abrir otro espacio" }));
    expect(screen.getByRole("dialog", { name: "¿Abrir otro espacio de trabajo?" })).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Elegir carpeta" }));

    expect(await screen.findByText("Espacio de trabajo abierto correctamente.")).toHaveFocus();
    expect(screen.getAllByText("Familia").length).toBeGreaterThan(0);
    expect(service.openExistingWorkspace).toHaveBeenCalledOnce();

    const results = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
    expect(results.violations).toEqual([]);
  });
});
