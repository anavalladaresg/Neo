import { FolderOpen } from "lucide-react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button } from "../ui/Button";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";
import { LoadingState } from "./LoadingState";

describe("shared feedback states", () => {
  it("renders an empty state with its title, description, and action", () => {
    render(
      <EmptyState
        action={<Button>Añadir información</Button>}
        description="Cuando añadas contenido, aparecerá aquí."
        icon={FolderOpen}
        title="Todavía no hay información"
      />,
    );

    expect(screen.getByRole("heading", { name: "Todavía no hay información" })).toBeVisible();
    expect(screen.getByText("Cuando añadas contenido, aparecerá aquí.")).toBeVisible();
    expect(screen.getByRole("button", { name: "Añadir información" })).toBeEnabled();
  });

  it("exposes loading information as a polite status", () => {
    render(<LoadingState description="Solo tardará un momento." title="Preparando tu espacio" />);

    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(status).toHaveTextContent("Preparando tu espacio");
    expect(status).toHaveTextContent("Solo tardará un momento.");
  });

  it("exposes a useful Spanish error as an alert", () => {
    render(
      <ErrorState
        action={<Button tone="quiet">Intentar de nuevo</Button>}
        description="Tus datos siguen a salvo."
        title="No hemos podido cargar la información"
      />,
    );

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("No hemos podido cargar la información");
    expect(alert).toHaveTextContent("Tus datos siguen a salvo.");
    expect(screen.getByRole("button", { name: "Intentar de nuevo" })).toBeEnabled();
  });

  it("supports feedback states without optional content", () => {
    render(
      <>
        <EmptyState description="Sin acción." icon={FolderOpen} title="Vacío" />
        <LoadingState title="Cargando" />
        <ErrorState description="Sin acción." title="Error" />
      </>,
    );

    expect(screen.getByRole("status")).toHaveTextContent("Cargando");
    expect(screen.getByRole("alert")).toHaveTextContent("Error");
  });
});
