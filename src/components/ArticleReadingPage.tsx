'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ContentItem, SelectionMeta } from '@/data/constants';
import type { RadarDimension } from '@/types';

interface ArticleReadingPageProps {
  item: ContentItem;
  meta: SelectionMeta;
  reason: string;
  weakestDim: RadarDimension;
  weakestKey: string;
  weakestVal: number;
  tip: string;
  prev: ContentItem | null;
  next: ContentItem | null;
}

const PUNCT_REGEX = /[《》「」『』""''（）()【】、，。！？：；·]/;

// 渲染单个正文小节
function renderSection(section: { heading?: string; paragraphs: string[]; pullquote?: string }, sIdx: number, isFirstGlobal = false) {
  return (
    <section key={sIdx} className="mb-6">
      {section.heading && (
        <h2 className="font-serif text-xl md:text-2xl font-bold mb-4 mt-8" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.3 }}>
          {section.heading}
        </h2>
      )}
      {section.paragraphs.map((p, pIdx) => {
        // 全文首段加首字下沉
        if (isFirstGlobal && sIdx === 0 && pIdx === 0) {
          const isPunct = PUNCT_REGEX.test(p[0]);
          return (
            <p key={pIdx} className="mb-5" style={{ color: 'var(--text-primary)' }}>
              {isPunct ? p : (
                <>
                  <span className="font-serif font-black float-left mr-2 mt-1" style={{ fontSize: '3.8em', lineHeight: '0.8', color: 'var(--accent)' }}>{p[0]}</span>
                  {p.slice(1)}
                </>
              )}
            </p>
          );
        }
        return (
          <p key={pIdx} className="mb-5" style={{ color: 'var(--text-primary)' }}>
            {p}
          </p>
        );
      })}
      {section.pullquote && (
        <blockquote className="pullquote my-7" style={{ fontSize: '1.3rem' }}>
          {section.pullquote}
        </blockquote>
      )}
    </section>
  );
}

export default function ArticleReadingPage({
  item, meta, reason, weakestDim, weakestKey, weakestVal, tip, prev, next,
}: ArticleReadingPageProps) {
  // 正文：优先使用结构化 body，回退到 content
  const sections = item.body && item.body.length > 0
    ? item.body
    : [{ paragraphs: [item.content] }];

  // 阅读进度（基于滚动）
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const scrolled = doc.scrollTop;
      const max = doc.scrollHeight - doc.clientHeight;
      setProgress(max > 0 ? Math.min(1, scrolled / max) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      {/* 阅读进度条 */}
      <div className="reading-progress-track">
        <div className="reading-progress-fill" style={{ transform: `scaleX(${progress})` }} />
      </div>

      {/* 返回栏 */}
      <div className="border-b" style={{ borderColor: 'var(--border-color)' }}>
        <div className="max-w-3xl mx-auto px-4 py-2.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm transition-colors" style={{ color: 'var(--text-secondary)' }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            返回日报
          </Link>
          <div className="flex items-center gap-3 text-caption">
            <span style={{ color: 'var(--accent)' }}>{meta.label}</span>
            <span style={{ color: 'var(--border-hover)' }}>|</span>
            <span>{item.source}</span>
          </div>
        </div>
      </div>

      <article className="article-enter max-w-3xl mx-auto px-4 py-8 md:py-12">
        {/* 栏目标签 */}
        <div className="flex items-center gap-3 mb-4">
          <span className="column-tag">{item.topic}</span>
        </div>

        {/* 标题 */}
        <h1 className="font-serif text-3xl md:text-4xl font-black mb-4" style={{ color: 'var(--text-primary)', lineHeight: 1.2, letterSpacing: '-0.03em' }}>
          {item.title}
        </h1>

        {/* 导语 */}
        <p className="text-lead mb-6" style={{ fontStyle: 'italic', borderLeft: '3px solid var(--accent)', paddingLeft: '1rem' }}>
          {item.summary}
        </p>

        {/* 元信息行 */}
        <div className="flex flex-wrap items-center gap-3 mb-8 pb-4 border-b text-caption" style={{ borderColor: 'var(--border-color)' }}>
          <span>证据等级 <span className="evidence-stars">{'★'.repeat(item.dimensions.evidence)}{'☆'.repeat(5 - item.dimensions.evidence)}</span></span>
          <span style={{ color: 'var(--border-hover)' }}>|</span>
          <span>立场 {item.dimensions.stance > 0 ? `+${item.dimensions.stance}` : item.dimensions.stance}</span>
          <span style={{ color: 'var(--border-hover)' }}>|</span>
          <span>{item.dimensions.sourceType}</span>
          <span style={{ color: 'var(--border-hover)' }}>|</span>
          <span>{item.dimensions.geography}</span>
        </div>

        {/* 编者按 */}
        <div className="mb-8 p-4" style={{ background: 'var(--bg-surface)' }}>
          <div className="text-kicker mb-2">编者按 · 为什么推荐这条</div>
          <p className="text-body">{reason}</p>
        </div>

        {/* 正文 - 完整多段落结构 */}
        <div className="article-body mb-10" style={{ fontSize: '1.0625rem', lineHeight: 1.85, color: 'var(--text-primary)' }}>
          {sections.map((section, sIdx) => renderSection(section, sIdx, true))}
        </div>

        {/* 盲区分析 */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div className="blind-spot-algo p-4">
            <div className="text-xs font-bold mb-2 blind-label">🔍 为什么算法不会推给你？</div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>{item.algorithmBlindSpot}</p>
          </div>
          <div className="blind-spot-cog p-4">
            <div className="text-xs font-bold mb-2 blind-label">🧠 这篇内容可能挑战你的哪个预设？</div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>{item.cognitiveBlindSpot}</p>
          </div>
        </div>

        {/* 维度数据卡 */}
        <div className="rule-bold pt-6 mb-8">
          <div className="text-kicker mb-4">内容维度分析</div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-px" style={{ background: 'var(--border-color)' }}>
            {[
              { label: '立场', value: item.dimensions.stance > 0 ? `+${item.dimensions.stance} 激进` : item.dimensions.stance < 0 ? `${item.dimensions.stance} 保守` : '中性' },
              { label: '情绪基调', value: item.dimensions.emotion > 0 ? '正面' : item.dimensions.emotion < 0 ? '负面' : '客观' },
              { label: '证据等级', value: `${item.dimensions.evidence} / 5` },
              { label: '时间尺度', value: item.dimensions.timeScale },
              { label: '地理范围', value: item.dimensions.geography },
              { label: '来源类型', value: item.dimensions.sourceType },
            ].map(cell => (
              <div key={cell.label} className="p-3" style={{ background: 'var(--bg-card)' }}>
                <div className="text-caption mb-0.5">{cell.label}</div>
                <div className="text-sm font-medium font-serif" style={{ color: 'var(--text-primary)' }}>{cell.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 最薄弱维度提示 */}
        <div className="blind-spot-algo p-4 mb-8">
          <div className="text-kicker mb-2" style={{ color: 'var(--blind-spot-algo-text)' }}>信息饮食建议</div>
          <p className="text-sm mb-1" style={{ color: 'var(--text-primary)' }}>
            <strong className="font-serif">{weakestDim.icon} {weakestDim.label}</strong>
            <span className="font-mono ml-2" style={{ color: 'var(--accent)' }}>{weakestVal}分</span>
          </p>
          <p className="text-caption mt-1.5" style={{ color: 'var(--text-secondary)' }}>{tip}</p>
        </div>

        {/* 标签 */}
        <div className="flex flex-wrap gap-2 mb-8">
          {item.tags.map(tag => (
            <span key={tag} className="px-2.5 py-1 text-xs" style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)', borderRadius: '2px' }}>
              #{tag}
            </span>
          ))}
        </div>

        {/* 上下篇导航 */}
        <div className="rule-double pt-6 grid md:grid-cols-2 gap-4">
          {prev ? (
            <Link href={`/article/${prev.id}`} className="block p-3 border transition-colors hover:bg-black/5" style={{ borderColor: 'var(--border-color)' }}>
              <div className="text-caption mb-1">← 上一篇</div>
              <div className="font-serif text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{prev.title}</div>
            </Link>
          ) : <div />}
          {next ? (
            <Link href={`/article/${next.id}`} className="block p-3 border text-right transition-colors hover:bg-black/5" style={{ borderColor: 'var(--border-color)' }}>
              <div className="text-caption mb-1">下一篇 →</div>
              <div className="font-serif text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{next.title}</div>
            </Link>
          ) : <div />}
        </div>
      </article>
    </>
  );
}
