'use client';

import { userTagOptions } from '@/data/constants';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTags: string[];
  onToggleTag: (name: string) => void;
  onSave: () => void;
}

export default function SettingsModal({ isOpen, onClose, selectedTags, onToggleTag, onSave }: SettingsModalProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }} onKeyDown={e => { if (e.key === 'Escape') onClose(); }}>
      <div className="max-w-md w-full mx-4 border" role="dialog" aria-modal="true" aria-label="设置兴趣标签" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-strong)' }}>
        <div className="rule-bold px-5 py-3 flex items-center justify-between">
          <div>
            <span className="text-kicker">设置</span>
            <h3 className="font-serif text-lg font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>兴趣基线</h3>
          </div>
          <button type="button" onClick={onClose} aria-label="关闭" className="text-xl leading-none" style={{ color: 'var(--text-muted)' }}>×</button>
        </div>

        <div className="px-5 py-4">
          <p className="text-body mb-4">
            选择你平时关注的话题，算法会以此为参考寻找多元视角，而不是把你困在这些话题里。
          </p>
          <div className="flex flex-wrap gap-2 mb-6">
            {userTagOptions.map(tag => {
              const isSelected = selectedTags.includes(tag.name);
              return (
                <button type="button" key={tag.name} onClick={() => onToggleTag(tag.name)}
                  className="px-3 py-1.5 text-xs font-medium transition-colors"
                  style={isSelected
                    ? { background: 'var(--accent)', color: '#fff', borderRadius: '2px' }
                    : { background: 'var(--bg-surface)', color: 'var(--text-muted)', borderRadius: '2px' }
                  }>
                  {tag.name}
                </button>
              );
            })}
          </div>
          <button type="button" onClick={onSave} className="btn-primary w-full py-2.5 text-sm">保存设置</button>
        </div>
      </div>
    </div>
  );
}
