'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ContentItem, selectionTypeMeta, FeedbackType, FilterType } from '@/data/constants';
import { explainWhy } from '@/lib/algorithm';
import { triggerPageTurn } from './PageTurnTransition';

interface RecipeCardsProps {
  recipe: ContentItem[];
  currentFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  onToggleExpand: (id: number) => void;
  onFeedback: (id: number, type: FeedbackType) => void;
  onShare: (card: ContentItem) => void;
  readStates: Record<number, boolean>;
  feedbackStates: Record<number, FeedbackType>;
}

export default function RecipeCards({ recipe, currentFilter, onFilterChange, onToggleExpand, onFeedback, onShare, readStates, feedbackStates }: RecipeCardsProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [flippingId, setFlippingId] = useState<number | null>(null);
  const router = useRouter();

  const typeMap: Record<string, string> = { algorithm: '算法平衡', editor: '编辑精选', random: '随机发现', supplement: '补充' };
  const filtered = currentFilter === 'all' ? recipe : recipe.filter(card => card._pickedBy === typeMap[currentFilter]);

  const handleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
    if (expandedId !== id) onToggleExpand(id);
  };

  // 点击“阅读全文”：先卡片翻折 + 全屏翻页过渡，盖住后路由跳转
  const handleReadFull = (card: ContentItem) => {
    setFlippingId(card.id);
    triggerPageTurn(() => router.push(`/article/${card.id}`));
    // 翻折状态在过渡结束后清除
    setTimeout(() => setFlippingId(null), 600);
  };

  return (
    <section>
      {/* 栏目头 */}
      <div className="rule-bold mb-2 pt-4" />
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <span className="text-kicker">本期推荐</span>
          <h3 className="font-serif text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>今日信息食谱</h3>
        </div>
        <div className="flex gap-1">
          {(['all', 'algorithm', 'editor', 'random', 'supplement'] as FilterType[]).map(type => {
            const labels: Record<string, string> = { all: '全部', algorithm: '算法平衡', editor: '编辑精选', random: '随机发现', supplement: '补充' };
            const isActive = currentFilter === type;
            return (
              <button key={type} type="button" onClick={() => onFilterChange(type)} aria-pressed={isActive}
                className="px-3 py-1 text-xs font-medium transition-colors"
                style={isActive
                  ? { background: 'var(--border-strong)', color: 'var(--bg-body)' }
                  : { color: 'var(--text-muted)' }
                }>
                {labels[type]}
              </button>
            );
          })}
        </div>
      </div>

      {/* 文章列表 */}
      <div className="space-y-8">
        {filtered.length === 0 ? (
          <div className="text-center py-16 border" style={{ color: 'var(--text-muted)', background: 'var(--bg-surface)', borderColor: 'var(--border-color)', borderStyle: 'dashed' }}>
            <p className="text-body">当前筛选条件下暂无内容，换个条件或重新生成食谱试试。</p>
          </div>
        ) : filtered.map((card, index) => {
          const meta = selectionTypeMeta[card.selectionType];
          const isRead = readStates[card.id];
          const feedbackType = feedbackStates[card.id];
          const isExpanded = expandedId === card.id;

          return (
            <article
              key={card.id}
              className={`stagger-item card-hover-lift${flippingId === card.id ? ' card-flipping' : ''}`}
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              {/* 文章分隔线 */}
              {index > 0 && <div className="rule-thin mb-8" />}

              <div className="grid md:grid-cols-12 gap-6">
                {/* 左侧 - 编号与栏目标签 */}
                <div className="md:col-span-2">
                  <div className="font-serif text-4xl font-black leading-none mb-2" style={{ color: 'var(--accent)', letterSpacing: '-0.04em' }}>
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <div className="column-tag inline-block">{meta.label}</div>
                  {isRead && <div className="text-caption mt-2" style={{ color: 'var(--accent-2)' }}>已阅读</div>}
                </div>

                {/* 中间 - 正文 */}
                <div className="md:col-span-7">
                  {/* 元信息行 */}
                  <div className="flex items-center gap-3 mb-2 text-caption">
                    <span style={{ color: 'var(--accent)' }}>{card.topic}</span>
                    <span style={{ color: 'var(--border-hover)' }}>|</span>
                    <span>{card.source}</span>
                    <span style={{ color: 'var(--border-hover)' }}>|</span>
                    <span>证据等级 <span className="evidence-stars">{'★'.repeat(card.dimensions.evidence)}{'☆'.repeat(5 - card.dimensions.evidence)}</span></span>
                  </div>

                  {/* 标题 */}
                  <h4 className="font-serif text-xl md:text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)', lineHeight: 1.35, letterSpacing: '-0.02em' }}>
                    {card.title}
                  </h4>

                  {/* 导语 */}
                  <p className="text-lead mb-4" style={{ fontStyle: 'italic', borderLeft: '3px solid var(--border-color)', paddingLeft: '0.875rem' }}>
                    {card.summary}
                  </p>

                  {/* 推荐理由 - 编者按 */}
                  <div className="mb-4">
                    <div className="text-kicker mb-1.5">编者按</div>
                    <p className="text-body">{explainWhy(card, recipe)}</p>
                  </div>

                  {/* 正文（展开） */}
                  <div className={`expand-content${isExpanded ? ' open' : ''}`}>
                   <div className="expand-inner">
                    <div className="text-body mb-5" style={{ paddingTop: '0.5rem' }}>
                      {(() => {
                        const c = card.content;
                        const isPunct = /[《》「」『』""''（）()【】、，。！？：；·]/.test(c[0]);
                        if (isPunct) return c;
                        return <><span className="font-serif font-black float-left mr-2 mt-1" style={{ fontSize: '3.5em', lineHeight: '0.8', color: 'var(--accent)' }}>{c[0]}</span>{c.slice(1)}</>;
                      })()}
                    </div>

                    {/* 元数据网格 */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-px mb-4" style={{ background: 'var(--border-color)' }}>
                      {[
                        { label: '立场', value: card.dimensions.stance > 0 ? `+${card.dimensions.stance} 激进` : card.dimensions.stance < 0 ? `${card.dimensions.stance} 保守` : '中性' },
                        { label: '情绪基调', value: card.dimensions.emotion > 0 ? '正面' : card.dimensions.emotion < 0 ? '负面' : '客观' },
                        { label: '时间尺度', value: card.dimensions.timeScale },
                        { label: '地理范围', value: card.dimensions.geography },
                        { label: '来源类型', value: card.dimensions.sourceType },
                      ].map(cell => (
                        <div key={cell.label} className="p-2.5" style={{ background: 'var(--bg-card)' }}>
                          <div className="text-caption mb-0.5">{cell.label}</div>
                          <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{cell.value}</div>
                        </div>
                      ))}
                    </div>

                    {/* 标签 */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {card.tags.map(tag => (
                        <span key={tag} className="px-2 py-0.5 text-xs" style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)', borderRadius: '2px' }}>
                          #{tag}
                        </span>
                      ))}
                    </div>
                   </div>
                  </div>

                  {/* 操作栏 */}
                  <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
                    <div className="flex items-center gap-4">
                      <button type="button" aria-expanded={isExpanded} onClick={() => handleExpand(card.id)}
                        className="text-sm font-medium flex items-center gap-1 transition-colors"
                        style={{ color: 'var(--accent)' }}>
                        {isExpanded ? '收起' : '展开'}
                        <svg className="w-4 h-4 transition-transform" style={{ transform: isExpanded ? 'rotate(180deg)' : '' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReadFull(card)}
                        className="text-sm font-medium flex items-center gap-1 transition-colors"
                        style={{ color: 'var(--accent)', fontWeight: 700 }}
                        aria-label={`阅读全文：${card.title}`}
                      >
                        阅读全文
                        <svg className="w-4 h-4 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" aria-pressed={feedbackType === 'useful'} onClick={() => onFeedback(card.id, 'useful')}
                        className="text-xs px-3 py-1.5 font-medium transition-colors"
                        style={feedbackType === 'useful'
                          ? { background: 'var(--accent-2)', color: '#fff' }
                          : { color: 'var(--text-muted)' }
                        }>
                        {feedbackType === 'useful' ? '已标记有用' : '有用'}
                      </button>
                      <button type="button" aria-pressed={feedbackType === 'notuseful'} onClick={() => onFeedback(card.id, 'notuseful')}
                        className="text-xs px-3 py-1.5 font-medium transition-colors"
                        style={feedbackType === 'notuseful'
                          ? { background: 'var(--border-strong)', color: 'var(--bg-body)' }
                          : { color: 'var(--text-muted)' }
                        }>
                        {feedbackType === 'notuseful' ? '已标记不感兴趣' : '不感兴趣'}
                      </button>
                      <button type="button" onClick={() => onShare(card)} className="p-1.5 transition-colors" style={{ color: 'var(--text-muted)' }} title="分享" aria-label="分享">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* 右侧 - 盲区分析边栏 */}
                <aside className="md:col-span-3">
                  <div className="blind-spot-algo p-3 mb-3">
                    <div className="text-xs font-bold mb-1.5 blind-label">🔍 算法盲区</div>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>为什么算法不会推给你？</p>
                    <p className="text-xs leading-relaxed mt-1.5" style={{ color: 'var(--text-primary)' }}>{card.algorithmBlindSpot}</p>
                  </div>
                  <div className="blind-spot-cog p-3">
                    <div className="text-xs font-bold mb-1.5 blind-label">🧠 认知盲区</div>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>你的认知盲区可能在哪里？</p>
                    <p className="text-xs leading-relaxed mt-1.5" style={{ color: 'var(--text-primary)' }}>{card.cognitiveBlindSpot}</p>
                  </div>
                </aside>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
