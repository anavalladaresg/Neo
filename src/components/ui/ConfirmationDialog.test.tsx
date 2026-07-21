import { useState } from "react";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Button } from "./Button";
import { ConfirmationDialog } from "./ConfirmationDialog";

interface DialogHarnessProps {
  onConfirm: () => void;
}

function DialogHarness({ onConfirm }: DialogHarnessProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Abrir diálogo</Button>
      <ConfirmationDialog
        description="Esta acción no se puede deshacer."
        onCancel={() => setOpen(false)}
        onConfirm={() => {
          onConfirm();
          setOpen(false);
        }}
        open={open}
        title="¿Quieres continuar?"
      />
    </>
  );
}

describe("ConfirmationDialog", () => {
  it("moves focus into the dialog and restores it after cancellation", async () => {
    const user = userEvent.setup();
    render(<DialogHarness onConfirm={vi.fn()} />);
    const trigger = screen.getByRole("button", { name: "Abrir diálogo" });

    await user.click(trigger);

    expect(screen.getByRole("button", { name: "Confirmar" })).toHaveFocus();
    await user.click(screen.getByRole("button", { name: "Cancelar" }));
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it("confirms the action and restores focus", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(<DialogHarness onConfirm={onConfirm} />);
    const trigger = screen.getByRole("button", { name: "Abrir diálogo" });

    await user.click(trigger);
    await user.click(screen.getByRole("button", { name: "Confirmar" }));

    expect(onConfirm).toHaveBeenCalledOnce();
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it("cancels on Escape through the native dialog event", async () => {
    const user = userEvent.setup();
    render(<DialogHarness onConfirm={vi.fn()} />);
    const trigger = screen.getByRole("button", { name: "Abrir diálogo" });

    await user.click(trigger);
    fireEvent(screen.getByRole("dialog"), new Event("cancel", { cancelable: true }));

    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it("supports the close control and custom labels", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    const { rerender } = render(
      <ConfirmationDialog
        cancelLabel="Volver"
        confirmLabel="Quitar"
        description="Descripción"
        onCancel={onCancel}
        onConfirm={vi.fn()}
        open
        title="Confirmación"
      />,
    );

    expect(screen.getByRole("button", { name: "Quitar" })).toHaveFocus();
    await user.click(screen.getByRole("button", { name: "Cerrar" }));
    expect(onCancel).toHaveBeenCalledOnce();
    rerender(
      <ConfirmationDialog
        cancelLabel="Volver"
        confirmLabel="Quitar"
        description="Descripción"
        onCancel={onCancel}
        onConfirm={vi.fn()}
        open={false}
        title="Confirmación"
      />,
    );
  });
});
