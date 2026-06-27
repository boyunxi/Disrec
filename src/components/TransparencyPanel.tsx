'use client';

import { ContentItem } from '@/data/constants';

interface TransparencyPanelProps {
  recipe: ContentItem[];
}

export default function TransparencyPanel({ recipe }: TransparencyPanelProps) {
  const composition = { algorithm: 0, editor: 0, random: 0 };
  recipe.forEach(item => {
    if (item._pickedBy === '算法平衡') composition.algorithm++;
    else if (item._pickedBy === '编辑精选') composition.editor++;
    else if (item._pickedBy === '随机发现') composition.random++;
  });
  const topics = Array.from(new Set(recipe.map(i => i.topic)));
  const sources = Array.from(new Set(recipe.map(i => i.dimensions.sourceType)));
  const avgEvidence = recipe.length > 0
    ? (recipe.reduce((s, i) => s + i.dimensions.evidence, 0) / recipe.length).toFixed(1)
    : '0.0';

  return (
    <div className="border p-5" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
      <div className="flex items-center justify-between mb-4">
        <span className="column-tag">数据透视</span>
        <span className="text-caption">TRANSPARENCY</span>
      </div>

      <div className="space-y-0">
        {/* 推荐组成 - 数字展示 */}
        <div className="rule-thin pt-3 pb-3">
          <div className="text-caption mb-2">推荐组成</div>
          <div className="flex gap-4">
            <div>
              <span className="stat-figure" style={{ fontSize: '1.75rem' }}>{composition.editor}</span>
              <span className="text-caption ml-1">编辑</span>
            </div>
            <div>
              <span className="stat-figure" style={{ fontSize: '1.75rem', color: 'var(--accent-2)' }}>{composition.algorithm}</span>
              <span className="text-caption ml-1">算法</span>
            </div>
            <div>
              <span className="stat-figure" style={{ fontSize: '1.75rem', color: 'var(--text-muted)' }}>{composition.random}</span>
              <span className="text-caption ml-1">随机</span>
            </div>
          </div>
        </div>

        {/* 覆盖领域 */}
        <div className="rule-thin pt-3 pb-3">
          <div className="text-caption mb-1.5">覆盖领域</div>
          <div className="flex flex-wrap gap-1.5">
            {topics.map(t => (
              <span key={t} className="text-xs px-2 py-0.5" style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)', borderRadius: '2px' }}>{t}</span>
            ))}
          </div>
        </div>

        {/* 来源类型 */}
        <div className="rule-thin pt-3 pb-3">
          <div className="text-caption mb-1.5">来源类型</div>
          <div className="flex flex-wrap gap-1.5">
            {sources.map(s => (
              <span key={s} className="text-xs" style={{ color: 'var(--text-secondary)' }}>{s}</span>
            ))}
          </div>
        </div>

        {/* 平均证据等级 */}
        <div className="pt-3 flex items-baseline justify-between">
          <span className="text-caption">平均证据等级</span>
          <div className="flex items-baseline gap-1">
            <span className="stat-figure" style={{ fontSize: '1.75rem' }}>{avgEvidence}</span>
            <span className="text-caption">/ 5</span>
          </div>
        </div>
      </div>
    </div>
  );
}
