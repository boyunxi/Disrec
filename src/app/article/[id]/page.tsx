import { notFound } from 'next/navigation';
import { allItems } from '@/data/content';
import { selectionTypeMeta, RADAR_DIMENSIONS, IMPROVEMENT_TIPS } from '@/data/constants';
import { explainWhy } from '@/lib/algorithm';
import { calculateCognitiveBlindSpots } from '@/lib/blindspot';
import ArticleReadingPage from '@/components/ArticleReadingPage';

const SITE_URL = 'https://disrec.app';

export function generateStaticParams() {
  return allItems.map(item => ({ id: String(item.id) }));
}

export function generateMetadata({ params }: { params: { id: string } }) {
  const item = allItems.find(i => i.id === Number(params.id));
  if (!item) return { title: '文章未找到 · 反推荐引擎' };
  return {
    title: `${item.title} · 反推荐引擎`,
    description: item.summary,
    openGraph: {
      type: 'article',
      title: item.title,
      description: item.summary,
      url: `${SITE_URL}/article/${item.id}`,
      publishedTime: undefined,
      tags: item.tags,
    },
    twitter: {
      card: 'summary',
      title: item.title,
      description: item.summary,
    },
    alternates: { canonical: `/article/${item.id}` },
  };
}

export default function ArticlePage({ params }: { params: { id: string } }) {
  const item = allItems.find(i => i.id === Number(params.id));
  if (!item) notFound();

  const recipe = [item];
  const scores = calculateCognitiveBlindSpots(recipe);
  const meta = selectionTypeMeta[item.selectionType];

  let weakestKey = 'stanceBreadth';
  let weakestVal = 100;
  RADAR_DIMENSIONS.forEach(dim => {
    const v = scores[dim.key] || 0;
    if (v < weakestVal) { weakestVal = v; weakestKey = dim.key; }
  });
  const weakestDim = RADAR_DIMENSIONS.find(d => d.key === weakestKey)!;

  // 上下篇导航
  const idx = allItems.findIndex(i => i.id === item.id);
  const prev = idx > 0 ? allItems[idx - 1] : null;
  const next = idx < allItems.length - 1 ? allItems[idx + 1] : null;

  return (
    <ArticleReadingPage
      item={item}
      meta={meta}
      reason={explainWhy(item, [item])}
      weakestDim={weakestDim}
      weakestKey={weakestKey}
      weakestVal={weakestVal}
      tip={IMPROVEMENT_TIPS[weakestKey]}
      prev={prev}
      next={next}
    />
  );
}
