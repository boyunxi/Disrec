'use client';

import { useState, useEffect } from 'react';

interface HeaderProps {
  currentDate: string;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
}

export default function Header({ currentDate, isDark, onToggleTheme, onOpenSettings }: HeaderProps) {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        setCompact(prev => {
          // 滞回阈值：进入 compact 需 >120px，退出需 <80px，防止临界抖动
          if (prev) return y < 80 ? false : prev;
          return y > 120 ? true : prev;
        });
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50${compact ? ' header-compact' : ''}`} style={{ background: 'var(--bg-body)', borderBottom: '3px double var(--border-strong)' }}>
      {/* 顶部细线栏 - 报头元信息 */}
      <div className="masthead-topbar border-b" style={{ borderColor: 'var(--border-color)' }}>
        <div className="max-w-6xl mx-auto px-4 py-1.5 flex items-center justify-between text-xs masthead-date">
          <span>第壹卷 · 信息食谱日报</span>
          <span>{currentDate}</span>
        </div>
      </div>

      {/* 主报头 */}
      <div className="masthead-main max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="masthead-logo w-11 h-11 flex items-center justify-center font-serif font-black text-xl text-white" style={{ background: 'var(--accent)', borderRadius: '2px' }}>反</div>
            <div>
              <h1 className="masthead-title font-serif text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>反推荐引擎</h1>
              <p className="masthead-subtitle text-xs masthead-date">INFORMATION DIET · 信息食谱日报</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={onToggleTheme} className="p-2 rounded transition-colors hover:bg-black/5" style={{ color: 'var(--text-secondary)' }} title="切换主题" aria-label="切换主题">
              {isDark ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              )}
            </button>
            <button onClick={onOpenSettings} className="p-2 rounded transition-colors hover:bg-black/5" style={{ color: 'var(--text-secondary)' }} title="设置兴趣标签" aria-label="设置兴趣标签">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
