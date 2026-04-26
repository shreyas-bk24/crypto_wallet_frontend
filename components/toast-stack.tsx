"use client";

import { useToast } from '@/providers/toast-provider';

const toneStyles: Record<string, string> = {
  success: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-100',
  error: 'border-rose-400/20 bg-rose-400/10 text-rose-100',
  info: 'border-sky-400/20 bg-sky-400/10 text-sky-100'
};

export function ToastStack() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[10001] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3 sm:right-6 sm:top-6">
      {toasts.map((toast) => (
        <div key={toast.id} className={`pointer-events-auto rounded-2xl border p-4 shadow-card backdrop-blur ${toneStyles[toast.tone]}`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-medium text-white">{toast.title}</p>
              {toast.description ? <p className="mt-1 text-sm text-white/75">{toast.description}</p> : null}
            </div>
            <button type="button" onClick={() => dismiss(toast.id)} className="text-xs text-white/60 transition hover:text-white">
              Dismiss
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}