import { useEffect, useRef } from "react";

import { CircleAlert, X } from "lucide-react";

import { Button } from "./Button";

interface ConfirmationDialogProps {
  cancelLabel?: string;
  confirmLabel?: string;
  description: string;
  onCancel: () => void;
  onConfirm: () => void;
  open: boolean;
  title: string;
}

export function ConfirmationDialog({
  cancelLabel = "Cancelar",
  confirmLabel = "Confirmar",
  description,
  onCancel,
  onConfirm,
  open,
  title,
}: ConfirmationDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog || !open) {
      return;
    }

    previousFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    if (!dialog.open) {
      dialog.showModal();
    }

    confirmButtonRef.current?.focus();

    return () => {
      if (dialog.open) {
        dialog.close();
      }
      previousFocusRef.current?.focus();
    };
  }, [open]);

  return (
    <dialog
      aria-describedby="confirmation-dialog-description"
      aria-labelledby="confirmation-dialog-title"
      className="confirmation-dialog"
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
      ref={dialogRef}
    >
      <div className="confirmation-dialog__header">
        <span className="confirmation-dialog__icon" aria-hidden="true">
          <CircleAlert size={22} strokeWidth={1.7} />
        </span>
        <button
          aria-label="Cerrar"
          className="confirmation-dialog__close"
          onClick={onCancel}
          type="button"
        >
          <X aria-hidden="true" size={18} />
        </button>
      </div>
      <h2 id="confirmation-dialog-title">{title}</h2>
      <p id="confirmation-dialog-description">{description}</p>
      <div className="confirmation-dialog__actions">
        <Button onClick={onCancel} tone="quiet">
          {cancelLabel}
        </Button>
        <Button onClick={onConfirm} ref={confirmButtonRef} tone="danger">
          {confirmLabel}
        </Button>
      </div>
    </dialog>
  );
}
