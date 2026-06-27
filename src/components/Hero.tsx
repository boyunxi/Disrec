'use client';

import { useState, useEffect, useRef } from 'react';
import { BalanceScore, userTagOptions } from '@/data/constants';

interface HeroProps {
  balanceScore: BalanceScore;
  selectedTags: string[];
  onRefresh: () => void;
  refreshRemaining: number;
}

export default function Hero({ balanceScore, selectedTags, onRefresh, refreshRemaining }: HeroProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    function resize() {
      if (!canvas) return;
      const p = canvas.parentElement;
      if (!p) return;
      canvas.width = p.offsetWidth;
      canvas.height = p.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const colors = [
      getComputedStyle(document.documentElement).getPropertyValue('--particle-color-1').trim() || 'rgba(139,26,26,0.15)',
      getComputedStyle(document.documentElement).getPropertyValue('--particle-color-2').trim() || 'rgba(26,77,46,0.12)',
      getComputedStyle(document.documentElement).getPropertyValue('--particle-color-3').trim() || 'rgba(122,115,107,0.1)',
    ];

    const particles = Array.from({ length: 30 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.5,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.15 - 0.08,
      alpha: Math.random() * 0.3 + 0.1,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // 用户偏好减少动效：仅静态绘制一帧，不启动 requestAnimationFrame 循环
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      return () => { window.removeEventListener('resize', resize); };
    }

    let animId: number;
    const animate = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(animate);
    };
    animate();

    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);

  useEffect(() => {
    const start = performance.now();
    const target = balanceScore.total;
    const tick = (now: number) => {
      const progress = Math.min((now - start) / 800, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [balanceScore.total]);

  // 视差：canvas（背景）慢移，hero-content（前景）快移
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const canvas = canvasRef.current;
    const content = heroRef.current?.querySelector('.hero-content') as HTMLElement | null;
    if (!canvas || !content) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        // 背景下移 0.3 倍（慢），内容上移 0.12 倍（快）制造纵深
        canvas.style.transform = `translateY(${y * 0.3}px)`;
        content.style.transform = `translateY(${-y * 0.12}px)`;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, []);

  const dims = [
    { label: '立场多样性', score: balanceScore.stance, desc: '立场光谱覆盖度' },
    { label: '证据质量', score: balanceScore.evidence, desc: '来源可信度均分' },
    { label: '领域跨度', score: balanceScore.domain, desc: '话题与来源多样性' },
  ];

  return (
    <div ref={heroRef} className="relative overflow-hidden border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
      <canvas ref={canvasRef} id="particle-canvas" />
      <div className="hero-content p-6 md:p-10">
        {/* 栏目头 */}
        <div className="flex items-center gap-3 mb-4">
          <span className="column-tag">社论 · LEAD STORY</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-start hero-grid">
          {/* 左侧 - 主特稿 */}
          <div className="lg:col-span-2">
            <h2 className="font-serif text-3xl md:text-4xl font-black leading-tight mb-4" style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
              像搭配营养一样，<br />搭配你的信息食谱
            </h2>

            <p className="text-lead mb-5" style={{ maxWidth: 'var(--reading-width)' }}>
              公正的推荐不是「用户缺什么补什么」，而是在<strong style={{ color: 'var(--accent)' }}>立场、证据、情绪、时间、地理、来源</strong>多个维度上保持平衡，让你看到议题的真实全貌。
            </p>

            <div className="text-body mb-6" style={{ maxWidth: 'var(--reading-width)' }}>
              <span className="font-serif font-black float-left mr-2 mt-1" style={{ fontSize: '3.5em', lineHeight: '0.8', color: 'var(--accent)' }}>在</span>算法时代，你看到的每一条信息都经过筛选。算法追求的是让你停留更久，而不是让你看得更全。反推荐引擎做的事恰恰相反——它刻意打破同质化，用编辑判断、算法平衡和随机性三种力量，为你搭配一份「不舒服但有营养」的每日信息食谱。
            </div>

            <div className="flex flex-wrap gap-3 items-center">
              <button type="button" onClick={onRefresh} className="btn-primary px-6 py-2.5 text-sm" disabled={refreshRemaining === 0}>
                生成今日食谱
              </button>
              {refreshRemaining > 0 ? (
                <span className="text-caption" style={{ color: 'var(--text-muted)' }}>今日剩余 {refreshRemaining} 次</span>
              ) : (
                <span className="text-caption" style={{ color: 'var(--accent)' }}>今日已用完</span>
              )}
              <button type="button" onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })} className="btn-outline px-6 py-2.5 text-sm">了解公正算法</button>
            </div>
          </div>

          {/* 右侧 - 数据面板 */}
          <aside className="border-l pl-6" style={{ borderColor: 'var(--border-color)' }}>
            <div className="text-kicker mb-3">今日均衡度</div>
            <div className="flex items-baseline gap-2 mb-5">
              <span className="stat-figure">{displayScore}</span>
              <span className="text-caption">/ 100</span>
            </div>

            <div className="space-y-4 mb-6">
              {dims.map(item => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                    <span className="font-mono" style={{ color: 'var(--text-muted)' }}>{item.score}</span>
                  </div>
                  <div className="dimension-bar">
                    <div className="dimension-fill" style={{ width: `${item.score}%`, background: 'var(--accent)' }} />
                  </div>
                  <div className="text-caption mt-0.5">{item.desc}</div>
                </div>
              ))}
            </div>

            <div className="rule-thin pt-4">
              <div className="text-kicker mb-2">信息偏好基线</div>
              <div className="flex flex-wrap gap-1.5">
                {selectedTags.map(tag => {
                  const c = userTagOptions.find(t => t.name === tag)?.color || 'slate';
                  const tagColorMap: Record<string, string> = {
                    cyan: '#06b6d4', violet: '#8b5cf6', purple: '#a855f7', blue: '#3b82f6',
                    emerald: '#10b981', amber: '#f59e0b', rose: '#f43f5e', teal: '#14b8a6',
                    slate: '#64748b',
                  };
                  const tagColor = tagColorMap[c] ?? tagColorMap.slate;
                  return (
                    <span key={tag} className="px-2 py-0.5 text-xs font-medium" style={{ background: 'var(--bg-surface)', color: tagColor, borderRadius: '2px' }}>
                      {tag}
                    </span>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
