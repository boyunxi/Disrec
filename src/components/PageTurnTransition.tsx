'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';

// 模块级触发器：供 RecipeCards 等组件调用
type TurnHandler = (onCovered: () => void) => void;
let trigger: TurnHandler | null = null;

/**
 * 触发翻页过渡：先盖住屏幕，盖住后回调（通常是 router.push）
 */
export function triggerPageTurn(onCovered: () => void) {
  if (trigger) trigger(onCovered);
}

type Phase = 'idle' | 'covering' | 'navigating' | 'revealing';

export default function PageTurnTransition() {
  const [phase, setPhase] = useState<Phase>('idle');
  const pathname = usePathname();
  const prevPath = useRef(pathname);
  const coverCb = useRef<(() => void) | null>(null);

  // 注册触发器
  useEffect(() => {
    trigger = (onCovered: () => void) => {
      coverCb.current = onCovered;
      setPhase('covering');
    };
    return () => { trigger = null; };
  }, []);

  // covering 完成后（动画 400ms）执行导航回调
  useEffect(() => {
    if (phase !== 'covering') return;
    const t = setTimeout(() => {
      setPhase('navigating');
      coverCb.current?.();
      coverCb.current = null;
    }, 400);
    return () => clearTimeout(t);
  }, [phase]);

  // 监听路由变化：导航完成后翻页揭示
  useEffect(() => {
    if (phase === 'navigating' && pathname !== prevPath.current) {
      prevPath.current = pathname;
      setPhase('revealing');
    } else if (pathname !== prevPath.current) {
      prevPath.current = pathname;
    }
  }, [pathname, phase]);

  // revealing 完成后回到 idle
  useEffect(() => {
    if (phase !== 'revealing') return;
    const t = setTimeout(() => setPhase('idle'), 400);
    return () => clearTimeout(t);
  }, [phase]);

  // 浏览器前进/后退也需要揭示
  useEffect(() => {
    if (phase === 'idle' && pathname !== prevPath.current) {
      prevPath.current = pathname;
    }
  }, [pathname, phase]);

  const overlayClass = phase === 'covering' ? 'page-turn-overlay covering'
    : phase === 'revealing' ? 'page-turn-overlay revealing'
    : '';

  const showProgress = phase === 'covering' || phase === 'navigating';

  if (phase === 'idle' && !showProgress) return null;

  return (
    <>
      {/* 顶部进度条 */}
      <div
        className="top-progress-bar"
        style={{ transform: showProgress ? undefined : 'scaleX(0)', opacity: showProgress ? 1 : 0, transition: 'opacity 0.2s' }}
      />
      {/* 全屏翻页 overlay */}
      {overlayClass && <div className={overlayClass} aria-hidden />}
    </>
  );
}
