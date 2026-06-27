// ===== 类型定义 =====
export interface Dimensions {
  stance: number;
  evidence: number;
  emotion: number;
  timeScale: string;
  geography: string;
  sourceType: string;
}

export interface BodySection {
  heading?: string;
  paragraphs: string[];
  pullquote?: string;
}

export interface ContentItem {
  id: number;
  title: string;
  source: string;
  topic: string;
  selectionType: 'algorithm' | 'editor' | 'random';
  summary: string;
  content: string;
  body?: BodySection[];
  dimensions: Dimensions;
  tags: string[];
  algorithmBlindSpot: string;
  cognitiveBlindSpot: string;
  _pickedBy?: string;
}

export interface BalanceScore {
  total: number;
  stance: number;
  evidence: number;
  domain: number;
}

export interface BlindSpotScores {
  stanceBreadth: number;
  evidenceAwareness: number;
  emotionalResilience: number;
  temporalDepth: number;
  geographicVision: number;
  sourceDiversity: number;
}

export interface TagOption {
  name: string;
  color: string;
}

export interface SelectionMeta {
  label: string;
  color: string;
  desc: string;
}

export type FeedbackType = 'useful' | 'notuseful' | null;
export type FilterType = 'all' | 'algorithm' | 'editor' | 'random' | 'supplement';

// ===== 常量 =====
export const STORAGE_PREFIX = 'disrec_';

export const RADAR_DIMENSIONS = [
  { key: 'stanceBreadth' as const, label: '立场广度', icon: '⚖️' },
  { key: 'evidenceAwareness' as const, label: '证据意识', icon: '🔬' },
  { key: 'emotionalResilience' as const, label: '情绪韧性', icon: '💪' },
  { key: 'temporalDepth' as const, label: '时间纵深', icon: '⏳' },
  { key: 'geographicVision' as const, label: '地理视野', icon: '🌍' },
  { key: 'sourceDiversity' as const, label: '来源多样性', icon: '📚' },
];

export const IMPROVEMENT_TIPS: Record<string, string> = {
  stanceBreadth: '今日推荐内容的立场跨度较窄——明天可以尝试关注与你预期不同的观点。',
  evidenceAwareness: '今日推荐内容的证据等级偏低——明天可以留意有学术或调查报道支撑的深度内容。',
  emotionalResilience: '今日推荐内容的情感基调单一——明天可以尝试情绪基调不同的文章，体验不同视角的叙述。',
  temporalDepth: '今日推荐内容的时间尺度集中——明天可以关注更长时段或历史脉络的内容。',
  geographicVision: '今日推荐内容的地理视野集中——明天可以尝试其他地区的议题。',
  sourceDiversity: '今日推荐内容的来源类型单一——明天可以留意来自独立媒体或学术研究的内容。',
};

export const userTagOptions: TagOption[] = [
  { name: '科技数码', color: 'cyan' },
  { name: '效率工具', color: 'violet' },
  { name: 'AI 资讯', color: 'purple' },
  { name: '创业思维', color: 'blue' },
  { name: '财经投资', color: 'emerald' },
  { name: '人文历史', color: 'amber' },
  { name: '艺术设计', color: 'rose' },
  { name: '健康生活', color: 'teal' },
];

// Aliases for sub-task created components
export const USER_TAG_OPTIONS = userTagOptions;

export const selectionTypeMeta: Record<string, SelectionMeta> = {
  algorithm: { label: '算法平衡', color: 'cyan', desc: '基于多维度评分，刻意打破同质化' },
  editor: { label: '编辑精选', color: 'violet', desc: '人工筛选的高质量深度内容' },
  random: { label: '随机发现', color: 'pink', desc: '引入随机性，防止算法自我强化' },
  '补充': { label: '补充推荐', color: 'slate', desc: '算法补充推荐，填补推荐列表空缺' },
};

export const DEFAULT_TAGS = ['科技数码', '效率工具', 'AI 资讯', '创业思维'];
