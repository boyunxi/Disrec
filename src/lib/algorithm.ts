import type { ContentItem, BalanceScore } from '@/types';
import { allItems } from '@/data/content';
import { getShownIds, addShownIds } from '@/lib/storage';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// findBestBalancedItem scoring weights
const NOVEL_TOPIC_WEIGHT = 30;
const STANCE_DISTANCE_WEIGHT = 10;
const EMOTION_DISTANCE_WEIGHT = 8;
const NOVEL_SOURCE_WEIGHT = 15;
const NOVEL_GEO_WEIGHT = 10;
const NOVEL_TIMESCALE_WEIGHT = 12;
const EVIDENCE_WEIGHT = 5;
const TAG_MATCH_WEIGHT = 20;
const REPEAT_PENALTY = 25;

// calculateBalanceScore formula coefficients
const STANCE_SCORE_SLOPE = 40;
const STANCE_SCORE_BASE = 20;
const EVIDENCE_SCORE_SLOPE = 18;
const DOMAIN_TOPIC_WEIGHT = 25;
const DOMAIN_SOURCE_WEIGHT = 10;

export function generateRecipe(selectedTags: string[]): ContentItem[] {
  const recipe: ContentItem[] = [];
  const usedIds = new Set<number>();
  const shownIds = getShownIds();

  // 1. 编辑精选 — 优先选未展示过的
  const editorCandidates = shuffle(
    allItems.filter(i =>
      i.selectionType === 'editor' &&
      i.dimensions.evidence >= 4 &&
      !shownIds.has(i.id)
    )
  ).concat(shuffle(
    allItems.filter(i =>
      i.selectionType === 'editor' &&
      i.dimensions.evidence >= 4 &&
      shownIds.has(i.id)
    )
  ));
  if (editorCandidates.length > 0) {
    recipe.push({ ...editorCandidates[0], _pickedBy: '编辑精选' });
    usedIds.add(editorCandidates[0].id);
  }

  // 2. 随机发现 — 优先选未展示过的
  const randomFresh = shuffle(
    allItems.filter(i =>
      i.selectionType === 'random' &&
      !usedIds.has(i.id) &&
      !shownIds.has(i.id) &&
      i.dimensions.evidence >= 3
    )
  );
  const randomPool = randomFresh.length > 0 ? randomFresh : shuffle(
    allItems.filter(i =>
      i.selectionType === 'random' &&
      !usedIds.has(i.id) &&
      i.dimensions.evidence >= 3
    )
  );
  if (randomPool.length > 0) {
    recipe.push({ ...randomPool[0], _pickedBy: '随机发现' });
    usedIds.add(randomPool[0].id);
  }

  // 3. 算法平衡
  const remaining = allItems.filter(i => !usedIds.has(i.id));
  const best = findBestBalancedItem(remaining, recipe, selectedTags, shownIds);
  if (best) {
    recipe.push({ ...best, _pickedBy: '算法平衡' });
    usedIds.add(best.id);
  }

  // 补充 — 使用平衡评分而非单纯按证据排序
  while (recipe.length < 3) {
    const fallbackPool = allItems.filter(i => !usedIds.has(i.id));
    if (fallbackPool.length === 0) break;
    const fallback = findBestBalancedItem(fallbackPool, recipe, selectedTags, shownIds);
    if (fallback) {
      recipe.push({ ...fallback, _pickedBy: '补充' });
      usedIds.add(fallback.id);
    } else break;
  }

  // 记录今日已展示
  addShownIds(recipe.map(i => i.id));

  // 智能排序：证据等级最高的放第一篇（最易读），而非盲目洗牌
  return recipe.sort((a, b) => b.dimensions.evidence - a.dimensions.evidence);
}

function findBestBalancedItem(
  candidates: ContentItem[],
  currentRecipe: ContentItem[],
  selectedTags: string[],
  shownIds: Set<number>
): ContentItem | null {
  if (candidates.length === 0) return null;
  const currentTopics = new Set(currentRecipe.map(i => i.topic));
  const currentStances = currentRecipe.map(i => i.dimensions.stance);
  const currentEmotions = currentRecipe.map(i => i.dimensions.emotion);
  const currentSources = new Set(currentRecipe.map(i => i.dimensions.sourceType));
  const currentGeos = new Set(currentRecipe.map(i => i.dimensions.geography));
  const currentTimeScales = new Set(currentRecipe.map(i => i.dimensions.timeScale));

  let best: ContentItem | null = null;
  let bestScore = -Infinity;
  candidates.forEach(item => {
    let score = 0;

    // 新颖性加分
    if (!currentTopics.has(item.topic)) score += NOVEL_TOPIC_WEIGHT;
    if (currentStances.length > 0) {
      score += Math.min(...currentStances.map(s => Math.abs(s - item.dimensions.stance))) * STANCE_DISTANCE_WEIGHT;
    }
    if (currentEmotions.length > 0) {
      score += Math.min(...currentEmotions.map(e => Math.abs(e - item.dimensions.emotion))) * EMOTION_DISTANCE_WEIGHT;
    }
    if (!currentSources.has(item.dimensions.sourceType)) score += NOVEL_SOURCE_WEIGHT;
    if (!currentGeos.has(item.dimensions.geography)) score += NOVEL_GEO_WEIGHT;
    if (!currentTimeScales.has(item.dimensions.timeScale)) score += NOVEL_TIMESCALE_WEIGHT;

    // 证据质量
    score += item.dimensions.evidence * EVIDENCE_WEIGHT;

    // 用户兴趣标签 — 精确匹配而非模糊
    const tagMatch = item.tags.some(t => selectedTags.includes(t));
    if (tagMatch) score += TAG_MATCH_WEIGHT;

    // 重复惩罚 — 今日已展示过的文章降权
    if (shownIds.has(item.id)) score -= REPEAT_PENALTY;

    if (score > bestScore) { bestScore = score; best = item; }
  });
  return best;
}

export function calculateBalanceScore(recipe: ContentItem[]): BalanceScore {
  if (recipe.length < 3) return { total: 0, stance: 0, evidence: 0, domain: 0 };
  const stances = recipe.map(i => i.dimensions.stance);
  const stanceRange = Math.max(...stances) - Math.min(...stances);
  const stanceScore = Math.min(100, stanceRange * STANCE_SCORE_SLOPE + STANCE_SCORE_BASE);
  const evidenceScore = Math.min(100, recipe.reduce((s, i) => s + i.dimensions.evidence, 0) / 3 * EVIDENCE_SCORE_SLOPE);
  const topics = new Set(recipe.map(i => i.topic));
  const sources = new Set(recipe.map(i => i.dimensions.sourceType));
  const domainScore = Math.min(100, topics.size * DOMAIN_TOPIC_WEIGHT + sources.size * DOMAIN_SOURCE_WEIGHT);
  const total = Math.round((stanceScore + evidenceScore + domainScore) / 3);
  return {
    total,
    stance: Math.round(stanceScore),
    evidence: Math.round(evidenceScore),
    domain: Math.round(domainScore),
  };
}

export function explainWhy(card: ContentItem, recipe: ContentItem[]): string {
  const reasons: string[] = [];

  // 1. 选取原因
  if (card._pickedBy === '编辑精选') {
    reasons.push('由编辑人工筛选，证据等级 ' + card.dimensions.evidence + '/5');
  } else if (card._pickedBy === '随机发现') {
    reasons.push('通过随机机制引入，防止算法惯性锁死');
  } else if (card._pickedBy === '补充') {
    reasons.push('作为补充推荐，填补今日食谱空缺');
  } else {
    reasons.push('由算法基于多维度平衡选出');
  }

  // 2. 话题新颖性
  const otherTopics = recipe.filter(i => i.id !== card.id).map(i => i.topic);
  if (!otherTopics.includes(card.topic)) {
    reasons.push('补充了「' + card.topic + '」这一未被其他推荐覆盖的领域');
  }

  // 3. 来源多样性
  const otherSources = recipe.filter(i => i.id !== card.id).map(i => i.dimensions.sourceType);
  if (!otherSources.includes(card.dimensions.sourceType)) {
    reasons.push('引入了' + card.dimensions.sourceType + '视角，丰富来源多样性');
  }

  // 4. 立场对比 — 具体数值
  const otherStances = recipe.filter(i => i.id !== card.id).map(i => i.dimensions.stance);
  if (otherStances.length > 0) {
    const avgOther = otherStances.reduce((s, v) => s + v, 0) / otherStances.length;
    const diff = card.dimensions.stance - avgOther;
    if (Math.abs(diff) >= 2) {
      reasons.push(
        '立场 ' + (card.dimensions.stance >= 0 ? '+' : '') + card.dimensions.stance +
        '，与其他文章平均(' + avgOther.toFixed(1) + ')形成 ' + Math.abs(diff).toFixed(1) + ' 点跨度'
      );
    }
  }

  // 5. 时间维度新颖
  const otherTimeScales = recipe.filter(i => i.id !== card.id).map(i => i.dimensions.timeScale);
  if (!otherTimeScales.includes(card.dimensions.timeScale)) {
    reasons.push('时间尺度为「' + card.dimensions.timeScale + '」，拓展时间纵深');
  }

  // 6. 地理视野
  const otherGeos = recipe.filter(i => i.id !== card.id).map(i => i.dimensions.geography);
  if (!otherGeos.includes(card.dimensions.geography)) {
    reasons.push('地理视野覆盖「' + card.dimensions.geography + '」');
  }

  // 7. 证据质量
  if (card.dimensions.evidence >= 4) {
    reasons.push('证据等级 ' + card.dimensions.evidence + '/5，适合建立可靠认知');
  }

  return reasons.join('；') + '。';
}
