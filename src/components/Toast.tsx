'use client';

import { useEffect, useState } from 'react';

export interface ToastItem {
  id: number;
  message: string;
  type: 'info' | 'warn' | 'error' | 'success';
}

let toastIdCounter = 0;
const listeners = new Set<(items: ToastItem[]) => void>();
let currentToasts: ToastItem[] = [];

export function showToast(message: string, type: ToastItem['type'] = 'info') {
  const item: ToastItem = { id: ++toastIdCounter, message, type };
  currentToasts = [...currentToasts, item];
  listeners.forEach(fn => fn(currentToasts));

  const duration = type === 'error' ? 4000 : 2500;
  setTimeout(() => dismissToast(item.id), duration);
}

export function dismissToast(id: number) {
  currentToasts = currentToasts.filter(t => t.id !== id);
  listeners.forEach(fn => fn(currentToasts));
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    listeners.add(setToasts);
    return () => { listeners.delete(setToasts); };
  }, []);

  if (toasts.length === 0) return null;

  const colorMap: Record<ToastItem['type'], string> = {
    info: '#1a4d8b',
    warn: '#9a7b1a',
    error: 'var(--accent)',
    success: 'var(--accent-2)',
  };

  const iconMap: Record<ToastItem['type'], string> = {
    info: 'ℹ',
    warn: '⚠',
    error: '✕',
    success: '✓',
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 items-center pointer-events-none" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {toasts.map(t => (
        <div
          key={t.id}
          className="toast-item flex items-center gap-3 px-4 py-2.5 shadow-lg pointer-events-auto cursor-pointer"
          style={{
            background: 'var(--bg-card)',
            border: `2px solid ${colorMap[t.type]}`,
            color: 'var(--text-primary)',
          }}
          onClick={() => dismissToast(t.id)}
        >
          <span className="font-bold text-sm" style={{ color: colorMap[t.type] }}>{iconMap[t.type]}</span>
          <span className="text-sm">{t.message}</span>
        </div>
      ))}
    </div>
  );
}
