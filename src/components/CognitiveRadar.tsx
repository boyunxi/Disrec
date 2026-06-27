'use client';

import { useEffect, useRef, useState } from 'react';
import type { ContentItem, CognitiveBlindSpots } from '@/types';
import { RADAR_DIMENSIONS, IMPROVEMENT_TIPS } from '@/data/constants';
import { calculateCognitiveBlindSpots } from '@/lib/blindspot';

interface CognitiveRadarProps {
  recipe: ContentItem[];
}

function getCSSVar(name: string): string {
  if (typeof window === 'undefined') return '';
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function drawRadarChart(canvas: HTMLCanvasElement, scores: CognitiveBlindSpots) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  const displaySize = Math.min(canvas.parentElement?.offsetWidth || 320, 320);

  canvas.style.width = displaySize + 'px';
  canvas.style.height = displaySize + 'px';
  canvas.width = displaySize * dpr;
  canvas.height = displaySize * dpr;
  ctx.scale(dpr, dpr);

  const cx = displaySize / 2;
  const cy = displaySize / 2;
  const maxR = displaySize / 2 - 45;
  const dims = RADAR_DIMENSIONS;
  const n = dims.length;
  const angleStep = (Math.PI * 2) / n;
  const startAngle = -Math.PI / 2;

  ctx.clearRect(0, 0, displaySize, displaySize);

  // 网格层
  [0.33, 0.66, 1.0].forEach(level => {
    ctx.beginPath();
    for (let i = 0; i <= n; i++) {
      const angle = startAngle + i * angleStep;
      const x = cx + Math.cos(angle) * maxR * level;
      const y = cy + Math.sin(angle) * maxR * level;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = getCSSVar('--radar-grid');
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  // 轴线
  for (let i = 0; i < n; i++) {
    const angle = startAngle + i * angleStep;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle) * maxR, cy + Math.sin(angle) * maxR);
    ctx.strokeStyle = getCSSVar('--radar-grid');
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // 数据多边形
  const keys = dims.map(d => d.key);
  ctx.beginPath();
  keys.forEach((key, i) => {
    const angle = startAngle + i * angleStep;
    const val = (scores[key] || 0) / 100;
    const x = cx + Math.cos(angle) * maxR * val;
    const y = cy + Math.sin(angle) * maxR * val;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fillStyle = getCSSVar('--radar-fill');
  ctx.fill();
  ctx.strokeStyle = getCSSVar('--radar-stroke');
  ctx.lineWidth = 2;
  ctx.stroke();

  // 数据点
  keys.forEach((key, i) => {
    const angle = startAngle + i * angleStep;
    const val = (scores[key] || 0) / 100;
    const x = cx + Math.cos(angle) * maxR * val;
    const y = cy + Math.sin(angle) * maxR * val;
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = getCSSVar('--radar-dot');
    ctx.fill();
    ctx.strokeStyle = getCSSVar('--radar-bg');
    ctx.lineWidth = 2;
    ctx.stroke();
  });

  // 标签
  ctx.font = '12px "Noto Sans SC", sans-serif';
  ctx.fillStyle = getCSSVar('--radar-label');
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  dims.forEach((dim, i) => {
    const angle = startAngle + i * angleStep;
    const labelR = maxR + 28;
    const x = cx + Math.cos(angle) * labelR;
    const y = cy + Math.sin(angle) * labelR;
    ctx.fillText(dim.label, x, y);
  });
}

export default function CognitiveRadar({ recipe }: CognitiveRadarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  const scores = calculateCognitiveBlindSpots(recipe);

  // 展开时才绘制 canvas（节省性能）
  useEffect(() => {
    if (expanded && canvasRef.current && recipe.length > 0) {
      // 等动画完成后绘制，确保容器尺寸已稳定
      const timer = setTimeout(() => {
        if (canvasRef.current) {
          drawRadarChart(canvasRef.current, scores);
          setHasDrawn(true);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [expanded, recipe, scores]);

  useEffect(() => {
    if (!expanded || !hasDrawn) return;
    let resizeTimer: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (canvasRef.current && recipe.length > 0) {
          drawRadarChart(canvasRef.current, scores);
        }
      }, 250);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [expanded, hasDrawn, recipe, scores]);

  let weakestKey = 'stanceBreadth';
  let weakestVal = 100;
  RADAR_DIMENSIONS.forEach(dim => {
    if ((scores[dim.key] || 0) < weakestVal) {
      weakestVal = scores[dim.key] || 0;
      weakestKey = dim.key;
    }
  });
  const weakestDim = RADAR_DIMENSIONS.find(d => d.key === weakestKey)!;

  // 摘要：六维平均分
  const avgScore = Math.round(
    RADAR_DIMENSIONS.reduce((sum, dim) => sum + (scores[dim.key] || 0), 0) / RADAR_DIMENSIONS.length
  );
  const avgColor = avgScore >= 70 ? 'var(--accent-2)' : avgScore >= 40 ? '#9a7b1a' : 'var(--accent)';

  return (
    <div className="border p-5 md:p-6" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
      {/* 可点击的折叠头 */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between mb-0 text-left group"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-3">
          <span className="column-tag">信息多元度</span>
          {/* 摘要：最单一维度 + 均分 */}
          <span className="text-caption flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
            <span>{weakestDim.icon} 最单一：{weakestDim.label}</span>
            <span style={{ color: 'var(--accent)' }} className="font-mono font-bold">{weakestVal}</span>
            <span className="opacity-30">|</span>
            <span>均分</span>
            <span style={{ color: avgColor }} className="font-mono font-bold">{avgScore}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-caption" style={{ color: 'var(--text-muted)' }}>DIVERSITY RADAR</span>
          <svg
            className="w-4 h-4 transition-transform duration-300"
            style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0)', color: 'var(--text-muted)' }}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* 折叠内容 */}
      <div
        className="overflow-hidden transition-all duration-500 ease-out"
        style={{
          maxHeight: expanded ? '800px' : '0px',
          opacity: expanded ? 1 : 0,
          marginTop: expanded ? '1.25rem' : '0',
        }}
      >
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* 左侧 - Canvas雷达图 */}
          <div className="flex justify-center">
            <canvas ref={canvasRef} width={320} height={320} />
          </div>

          {/* 右侧 - 维度列表与分析 */}
          <div>
            <p className="text-body mb-5">
              衡量今日推荐内容在六个维度上的多样性。分数越高，说明今日信息饮食越多元——这不是对你认知能力的诊断，而是对内容覆盖面的客观呈现。
            </p>

            <div className="space-y-2.5 mb-5">
              {RADAR_DIMENSIONS.map(dim => {
                const val = scores[dim.key] || 0;
                const barColor = val >= 70 ? 'var(--accent-2)' : val >= 40 ? '#9a7b1a' : 'var(--accent)';
                return (
                  <div key={dim.key} className="flex items-center gap-3">
                    <span className="text-xs w-24 shrink-0" style={{ color: 'var(--text-muted)' }}>{dim.icon} {dim.label}</span>
                    <div className="flex-1 dimension-bar">
                      <div className="dimension-fill" style={{ width: `${val}%`, background: barColor }} />
                    </div>
                    <span className="text-xs font-mono w-8 text-right" style={{ color: 'var(--text-secondary)' }}>{val}</span>
                  </div>
                );
              })}
            </div>

            {/* 最单一维度提示 */}
            <div className="blind-spot-algo p-3">
              <div className="text-kicker mb-1.5" style={{ color: 'var(--blind-spot-algo-text)' }}>最单一维度</div>
              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                <strong className="font-serif">{weakestDim.icon} {weakestDim.label}</strong>
                <span className="font-mono ml-1" style={{ color: 'var(--accent)' }}>{weakestVal}分</span>
              </p>
              <p className="text-caption mt-1.5" style={{ color: 'var(--text-secondary)' }}>{IMPROVEMENT_TIPS[weakestKey]}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
