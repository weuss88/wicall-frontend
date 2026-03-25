export default function ToastContainer({ toasts }) {
  if (!toasts.length) return null;
  return (
    <div className="toast-wrap">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          {t.type === 'error' ? '✕' : '✓'} {t.msg}
        </div>
      ))}
    </div>
  );
}
