import React, { createContext, useCallback, useContext, useState, ReactNode, useEffect } from 'react';

export interface Toast {
  id: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
  duration?: number; // ms
}

interface ToastContextValue {
  toasts: Toast[];
  push: (t: Omit<Toast, 'id'>) => string;
  dismiss: (id: string) => void;
  clear: () => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts(t => t.filter(x => x.id !== id));
  }, []);

  const push = useCallback((t: Omit<Toast, 'id'>) => {
    const id = crypto.randomUUID();
    const toast: Toast = { duration: 4000, type: 'info', ...t, id };
    setToasts(prev => [...prev, toast]);
    if (toast.duration && toast.duration > 0) {
      setTimeout(() => dismiss(id), toast.duration);
    }
    return id;
  }, [dismiss]);

  const clear = useCallback(() => setToasts([]), []);

  return (
    <ToastContext.Provider value={{ toasts, push, dismiss, clear }}>
      {children}
      <ToastViewport toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

function ToastViewport({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: string) => void }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && toasts.length) dismiss(toasts[0].id);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toasts, dismiss]);

  return (
    <div className="fixed z-[1000] top-4 right-4 w-80 space-y-2">
      {toasts.map(t => (
        <div key={t.id} className={`group border shadow-sm rounded-md px-3 py-2 text-sm animate-fade-in flex items-start gap-2 ${
          t.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
          t.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' :
          t.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800' :
          'bg-white border-gray-200 text-gray-700'
        }`}>
          <div className="flex-1 min-w-0">
            {t.title && <div className="font-medium text-xs mb-0.5 truncate">{t.title}</div>}
            <div className="text-xs leading-snug whitespace-pre-wrap break-words">{t.message}</div>
          </div>
          <button onClick={() => dismiss(t.id)} className="text-[10px] opacity-60 hover:opacity-100 px-1">✕</button>
        </div>
      ))}
    </div>
  );
}
