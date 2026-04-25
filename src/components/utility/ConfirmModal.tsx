import { useState } from 'react';
import './ConfirmModal.css';

/**
 * Simple yes/no confirmation modal.
 * Render it at the bottom of your component, passing the open state and callbacks.
 */
export interface ConfirmModalProps {
  /** When true the modal is visible */
  open: boolean;
  title: string;
  message: string;
  /** Label for the destructive confirm button (default: "Confirm") */
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div className="confirm-modal-overlay" role="dialog" aria-modal="true">
      <div className="confirm-modal-card">
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="confirm-modal-actions">
          <button type="button" className="confirm-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="confirm-danger" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Same as ConfirmModal but also collects a required reason text before allowing confirmation.
 */
export interface ConfirmWithReasonModalProps {
  open: boolean;
  title: string;
  message: string;
  reasonPlaceholder?: string;
  confirmLabel?: string;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}

export function ConfirmWithReasonModal({
  open,
  title,
  message,
  reasonPlaceholder = 'Enter reason…',
  confirmLabel = 'Confirm',
  onConfirm,
  onCancel,
}: ConfirmWithReasonModalProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!open) return null;

  const handleConfirm = () => {
    if (!reason.trim()) {
      setError('Please enter a reason before continuing.');
      return;
    }
    const r = reason;
    setReason('');
    setError('');
    onConfirm(r);
  };

  const handleCancel = () => {
    setReason('');
    setError('');
    onCancel();
  };

  return (
    <div className="confirm-modal-overlay" role="dialog" aria-modal="true">
      <div className="confirm-modal-card">
        <h3>{title}</h3>
        <p>{message}</p>
        <label className="confirm-modal-label">
          Reason *
          <textarea
            rows={3}
            value={reason}
            onChange={e => {
              setReason(e.target.value);
              if (error) setError('');
            }}
            placeholder={reasonPlaceholder}
          />
        </label>
        {error && <p className="confirm-modal-error">{error}</p>}
        <div className="confirm-modal-actions">
          <button
            type="button"
            className="confirm-cancel"
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="confirm-danger"
            onClick={handleConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
