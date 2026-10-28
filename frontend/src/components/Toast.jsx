import { useEffect } from 'react';
import { Icons } from './Icons';

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const isError = toast.type === 'error';
  const isSuccess = toast.type === 'success';

  return (
    <div className={`toast-notification ${isError ? 'toast-error' : 'toast-success'}`}>
      <div className="toast-icon">
        {isError ? (
          <Icons.AlertTriangle className="icon-md" />
        ) : (
          <Icons.CheckCircle className="icon-md" />
        )}
      </div>
      <div className="toast-content">
        <strong className="toast-title">{isError ? 'Action Failed' : 'Success'}</strong>
        <p className="toast-message">{toast.message}</p>
      </div>
      <button className="toast-close" onClick={onClose} aria-label="Close notification">
        <Icons.Close className="icon-sm" />
      </button>
    </div>
  );
}
