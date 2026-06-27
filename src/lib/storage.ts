import type { ContentItem, FeedbackType } from '@/types';
import { STORAGE_PREFIX } from '@/data/constants';
import { allItems } from '@/data/content';

export function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

/** 获取今日已展示过的文章 ID（跨刷新累积，用于去重） */
export function getShownIds(): Set<number> {
  try {
    const today = getTodayKey();
    const raw = localStorage.getItem(STORAGE_PREFIX + 'shown_' + today);
    if (raw) return new Set(JSON.parse(raw) as number[]);
  } catch {
    // ignore
  }
  return new Set();
}

/** 记录新展示的文章 ID，累积到今日已展示集合 */
export function addShownIds(ids: number[]): void {
  try {
    const today = getTodayKey();
    const existing = getShownIds();
    ids.forEach(id => existing.add(id));
    localStorage.setItem(STORAGE_PREFIX + 'shown_' + today, JSON.stringify([...existing]));
  } catch {
    // ignore
  }
}

export function saveState(params: {
  selectedTags: string[];
  theme: string;
  recipe: ContentItem[];
  readStates: Record<number, boolean>;
  feedbackStates: Record<number, FeedbackType>;
}): void {
  try {
    const { selectedTags, theme, recipe, readStates, feedbackStates } = params;
    localStorage.setItem(STORAGE_PREFIX + 'tags', JSON.stringify(selectedTags));
    localStorage.setItem(STORAGE_PREFIX + 'theme', theme);

    const today = getTodayKey();
    localStorage.setItem(
      STORAGE_PREFIX + 'recipe_' + today,
      JSON.stringify(recipe.map(i => ({ id: i.id, _pickedBy: i._pickedBy })))
    );
    localStorage.setItem(STORAGE_PREFIX + 'read_' + today, JSON.stringify(readStates));
    localStorage.setItem(STORAGE_PREFIX + 'feedback_' + today, JSON.stringify(feedbackStates));
  } catch {
    // storage full or unavailable
  }
}

export function loadState(): {
  selectedTags: string[] | null;
  theme: string | null;
  recipe: ContentItem[];
  readStates: Record<number, boolean>;
  feedbackStates: Record<number, FeedbackType>;
} {
  const result: ReturnType<typeof loadState> = {
    selectedTags: null,
    theme: null,
    recipe: [],
    readStates: {},
    feedbackStates: {},
  };

  try {
    const tags = localStorage.getItem(STORAGE_PREFIX + 'tags');
    if (tags) result.selectedTags = JSON.parse(tags);

    const theme = localStorage.getItem(STORAGE_PREFIX + 'theme');
    if (theme) result.theme = theme;

    const today = getTodayKey();
    const savedRecipe = localStorage.getItem(STORAGE_PREFIX + 'recipe_' + today);
    const savedRead = localStorage.getItem(STORAGE_PREFIX + 'read_' + today);
    const savedFeedback = localStorage.getItem(STORAGE_PREFIX + 'feedback_' + today);

    if (savedRecipe) {
      const recipeData = JSON.parse(savedRecipe) as { id: number; _pickedBy?: string }[];
      const restored: ContentItem[] = [];
      for (const rd of recipeData) {
        const item = allItems.find(i => i.id === rd.id);
        if (item) restored.push({ ...item, _pickedBy: rd._pickedBy });
      }
      result.recipe = restored;
    }

    if (savedRead) result.readStates = JSON.parse(savedRead);
    if (savedFeedback) result.feedbackStates = JSON.parse(savedFeedback);
  } catch {
    // parse error
  }

  return result;
}
