import { useState } from 'react';

export default function useToast() {
  const [toasts, setToasts] = useState([]);

  const toast = (msg, type = 'error') => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  };

  return { toasts, toast };
}
