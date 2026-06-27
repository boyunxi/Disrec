'use client';

import { useState } from 'react';
import { ContentItem } from '@/data/constants';

interface SpectrumChartProps {
  recipe: ContentItem[];
}

// 三条轴的配置
const AXES = [
  { key: 'stance', label: '立场', left: '保守', right: '激进', min: -3, max: 3 },
  { key: 'evidence', label: '证据', left: '弱', right: '强', min: 1, max: 5 },
  { key: 'emotion', label: '情感', left: '批判', right: '共情', min: -3, max: 3 },
] as const;

// 每篇文章一个颜色
const COLORS = ['var(--accent)', 'var(--accent-2)', '#6b4f8a'];

export default function SpectrumChart({ recipe }: SpectrumChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  // 多样性评分：计算三条轴上的方差，越高越多元
  const calcDiversity = () => {
    if (recipe.length < 2) return 0;
    let totalSpread = 0;
    for (const axis of AXES) {
      const vals = recipe.map((item) => item.dimensions[axis.key]);
      const min = Math.min(...vals);
      const max = Math.max(...vals);
      const range = axis.max - axis.min;
      totalSpread += (max - min) / range;
    }
    return Math.round((totalSpread / AXES.length) * 100);
  };
  const diversity = calcDiversity();
  const diversityLabel = diversity >= 67 ? '高多元' : diversity >= 34 ? '中等' : '同质化';
  const diversityColor = diversity >= 67 ? 'var(--accent-2)' : diversity >= 34 ? '#b8860b' : 'var(--accent)';

  const posFor = (axis: typeof AXES[number], value: number) => {
    return ((value - axis.min) / (axis.max - axis.min)) * 100;
  };

  return (
    <div className="border p-5" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
      <div className="flex items-center justify-between mb-4">
        <span className="column-tag">观点光谱</span>
        <div className="flex items-center gap-2">
          <span className="text-caption" style={{ color: 'var(--text-muted)' }}>多元度</span>
          <span
            className="font-mono font-bold text-sm px-2 py-0.5"
            style={{ color: diversityColor, border: `1px solid ${diversityColor}40`, background: `${diversityColor}10` }}
          >
            {diversity} · {diversityLabel}
          </span>
        </div>
      </div>

      {/* 多轴光谱 */}
      <div className="space-y-4 mb-4">
        {AXES.map((axis) => (
          <div key={axis.key}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-caption font-semibold" style={{ color: 'var(--text-secondary)' }}>{axis.label}</span>
              <div className="flex items-center gap-2 text-caption" style={{ color: 'var(--text-muted)' }}>
                <span>{axis.left}</span>
                <span>·</span>
                <span>{axis.right}</span>
              </div>
            </div>
            <div className="relative h-8" style={{ background: 'var(--bg-surface)', overflow: 'visible' }}>
              {/* 中线 */}
              <div className="absolute left-1/2 top-0 bottom-0 w-px" style={{ background: 'var(--border-color)' }} />
              {/* 刻度 */}
              {(axis.key === 'evidence' ? [1, 2, 3, 4, 5] : [-3, -2, -1, 0, 1, 2, 3]).map((tick) => (
                <div
                  key={tick}
                  className="absolute top-0 bottom-0 w-px"
                  style={{ left: `${((tick - axis.min) / (axis.max - axis.min)) * 100}%`, background: 'var(--border-color)', opacity: 0.3 }}
                />
              ))}
              {/* 立场点 */}
              {recipe.map((item, i) => {
                const left = posFor(axis, item.dimensions[axis.key]);
                const isHovered = hovered === item.id;
                const isDimmed = hovered !== null && hovered !== item.id;
                return (
                  <button
                    key={item.id}
                    tabIndex={0}
                    onMouseEnter={() => setHovered(item.id)}
                    onMouseLeave={() => setHovered(null)}
                    onFocus={() => setHovered(item.id)}
                    onBlur={() => setHovered(null)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setHovered((prev) => (prev === item.id ? null : item.id));
                      }
                    }}
                    className="absolute top-1/2 rounded-full transition-all duration-200"
                    style={{
                      left: `${left}%`,
                      width: isHovered ? '14px' : '10px',
                      height: isHovered ? '14px' : '10px',
                      background: COLORS[i],
                      transform: 'translate(-50%, -50%)',
                      opacity: isDimmed ? 0.25 : 1,
                      boxShadow: isHovered ? `0 0 0 3px ${COLORS[i]}30` : 'none',
                      zIndex: isHovered ? 10 : 1,
                      cursor: 'pointer',
                    }}
                    title={`${item.title}（${axis.label}: ${item.dimensions[axis.key]}）`}
                    aria-label={`${item.title} ${axis.label} ${item.dimensions[axis.key]}`}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* 图例 */}
      <div className="space-y-1.5 pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
        {recipe.map((item, i) => {
          const isHovered = hovered === item.id;
          const isDimmed = hovered !== null && hovered !== item.id;
          return (
            <div
              key={item.id}
              onMouseEnter={() => setHovered(item.id)}
              onMouseLeave={() => setHovered(null)}
              className="flex items-center gap-2 text-caption transition-opacity duration-200"
              style={{ opacity: isDimmed ? 0.4 : 1 }}
            >
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ background: COLORS[i], boxShadow: isHovered ? `0 0 0 2px ${COLORS[i]}40` : 'none' }}
              />
              <span className="truncate" style={{ color: 'var(--text-secondary)', fontWeight: isHovered ? 600 : 400 }}>
                {item.title}
              </span>
              <span className="ml-auto font-mono flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
                {item.dimensions.stance > 0 ? '+' : ''}{item.dimensions.stance} · E{item.dimensions.evidence} · {item.dimensions.emotion > 0 ? '+' : ''}{item.dimensions.emotion}
              </span>
            </div>
          );
        })}
      </div>

      {/* 说明 */}
      <p className="text-caption mt-3 pt-2 border-t" style={{ color: 'var(--text-muted)', borderColor: 'var(--border-color)' }}>
        悬停查看单篇在立场、证据、情感三轴上的位置 · 多元度越高，今日信息饮食越均衡
      </p>
    </div>
  );
}
