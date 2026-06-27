'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

interface RevealProps {
  children: ReactNode;
  /** 延迟（秒），用于同区块内错落 */
  delay?: number;
  /** 位移距离（px） */
  y?: number;
  className?: string;
}

/**
 * 滚动进入视口时淡入+上移
 * 基于 IntersectionObserver，只触发一次
 */
export default function Reveal({ children, delay = 0, y = 24, className = '' }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // prefers-reduced-motion 直接显示
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal-section${visible ? ' visible' : ''}${className ? ' ' + className : ''}`}
      style={{
        transitionDelay: `${delay}s`,
        '--reveal-y': `${y}px`,
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
