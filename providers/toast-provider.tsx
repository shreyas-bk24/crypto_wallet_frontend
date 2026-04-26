"use client";

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ToastMessage, ToastType } from '@/lib/types';

type ToastContextValue = {
  toasts: ToastMessage[];
  notify: (input: { title: string; description?: string; tone?: ToastType }) => void;
  dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback((input: { title: string; description?: string; tone?: ToastType }) => {
    const id = crypto.randomUUID();
    const toast: ToastMessage = {
      id,
      title: input.title,
      description: input.description,
      tone: input.tone ?? 'info'
    };

    setToasts((current) => [toast, ...current].slice(0, 4));
    window.setTimeout(() => dismiss(id), 4000);
  }, [dismiss]);

  const value = useMemo(() => ({ toasts, notify, dismiss }), [toasts, notify, dismiss]);

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }

  return context;
}