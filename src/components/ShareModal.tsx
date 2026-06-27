'use client';

import { useState, useRef, useEffect } from 'react';
import { ContentItem, selectionTypeMeta } from '@/data/constants';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: ContentItem | null;
}

type CopyState = 'idle' | 'success' | 'error';

export default function ShareModal({ isOpen, onClose, card }: ShareModalProps) {
  const [copyState, setCopyState] = useState<CopyState>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!isOpen || !card) return null;
  const meta = selectionTypeMeta[card.selectionType];

  const handleCopy = async () => {
    const link = `https://disrec.app/share/${card.id}`;
    let ok = false;

    // 优先用 Clipboard API（需 HTTPS 环境）
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(link);
        ok = true;
      } catch {
        ok = false;
      }
    }

    // Fallback: 临时 textarea + execCommand
    if (!ok) {
      try {
        const ta = document.createElement('textarea');
        ta.value = link;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        ok = document.execCommand('copy');
        document.body.removeChild(ta);
      } catch {
        ok = false;
      }
    }

    setCopyState(ok ? 'success' : 'error');
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopyState('idle'), 2000);
  };

  const copyLabel = copyState === 'success' ? '已复制！' : copyState === 'error' ? '复制失败，请手动选取' : '复制链接';
  const copyColor = copyState === 'success' ? 'var(--accent-2)' : copyState === 'error' ? 'var(--accent)' : undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }} onKeyDown={e => { if (e.key === 'Escape') onClose(); }}>
      <div className="max-w-md w-full mx-4 border" role="dialog" aria-modal="true" aria-label="分享文章" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-strong)' }}>
        <div className="rule-bold px-5 py-3 flex items-center justify-between">
          <div>
            <span className="text-kicker">分享</span>
            <h3 className="font-serif text-lg font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>推荐内容</h3>
          </div>
          <button type="button" onClick={onClose} aria-label="关闭" className="text-xl leading-none" style={{ color: 'var(--text-muted)' }}>×</button>
        </div>

        <div className="px-5 py-4">
          {/* 分享卡片预览 */}
          <div className="share-card-preview p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 flex items-center justify-center font-serif font-black text-sm text-white" style={{ background: 'var(--accent)' }}>反</div>
              <div>
                <div className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>反推荐引擎</div>
                <div className="text-caption">信息食谱</div>
              </div>
            </div>
            <h4 className="font-serif font-bold text-sm mb-1.5" style={{ color: 'var(--text-primary)', lineHeight: 1.5 }}>{card.title}</h4>
            <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{card.summary}</p>
            <div className="flex items-center gap-2 text-caption">
              <span style={{ color: 'var(--accent)' }}>{meta.label}</span>
              <span style={{ color: 'var(--border-hover)' }}>|</span>
              <span>{card.source}</span>
            </div>
          </div>

          {/* 链接文本框（可手动选取复制） */}
          <div className="mb-3 px-3 py-2 border flex items-center gap-2" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-surface)' }}>
            <input
              readOnly
              value={`https://disrec.app/share/${card.id}`}
              className="flex-1 bg-transparent text-caption font-mono outline-none"
              style={{ color: 'var(--text-secondary)' }}
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
          </div>

          <div className="flex gap-2">
            <button type="button" onClick={handleCopy} className="btn-primary flex-1 py-2.5 text-sm flex items-center justify-center gap-2 transition-colors" style={copyColor ? { background: copyColor } : undefined}>
              {copyState === 'success' ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              ) : copyState === 'error' ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
              )}
              {copyLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
