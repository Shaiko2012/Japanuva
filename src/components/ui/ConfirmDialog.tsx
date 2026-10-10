"use client";

import { useState } from "react";
import { Dialog } from "./Dialog";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  /** What will be lost stated plainly. */
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}

/** Confirmation step for destructive actions. The destructive button is never the default focus. */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "ביטול",
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const [busy, setBusy] = useState(false);

  async function handleConfirm() {
    setBusy(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog
      open={open}
      title={title}
      onClose={busy ? () => {} : onClose}
      role="alertdialog"
      footer={
        <>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={busy}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className="btn btn-danger-solid"
            onClick={() => void handleConfirm()}
            disabled={busy}
          >
            {busy ? "מבצע…" : confirmLabel}
          </button>
        </>
      }
    >
      <p className="leading-7 text-muted">{description}</p>
    </Dialog>
  );
}
