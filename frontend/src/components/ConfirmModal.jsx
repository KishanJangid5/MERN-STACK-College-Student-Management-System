import { Icons } from './Icons';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Deletion',
  message = 'Are you sure you want to delete this record? This action cannot be undone.',
  confirmText = 'Delete Record',
  isDeleting = false
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card modal-sm" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-icon-wrap">
          <Icons.AlertTriangle className="icon-lg text-danger" />
        </div>
        <div className="confirm-content text-center">
          <h3 className="confirm-title">{title}</h3>
          <p className="confirm-message">{message}</p>
        </div>
        <div className="modal-footer justify-center gap-2">
          <button
            type="button"
            className="btn btn-outline"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger flex-center gap-1"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <span className="spinner-border-sm"></span>
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Icons.Trash className="icon-xs" />
                <span>{confirmText}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
