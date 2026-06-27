'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { ContentItem, BalanceScore, FeedbackType, FilterType, DEFAULT_TAGS, STORAGE_PREFIX } from '@/data/constants';
import { generateRecipe, calculateBalanceScore } from '@/lib/algorithm';
import { saveState, loadState, getTodayKey } from '@/lib/storage';
import Header from '@/components/Header';
import DailyProgress from '@/components/DailyProgress';
import Hero from '@/components/Hero';
import TransparencyPanel from '@/components/TransparencyPanel';
import SpectrumChart from '@/components/SpectrumChart';
import CognitiveRadar from '@/components/CognitiveRadar';
import RecipeCards from '@/components/RecipeCards';
import AboutSection from '@/components/AboutSection';
import Footer from '@/components/Footer';
import Reveal from '@/components/Reveal';
import SettingsModal from '@/components/SettingsModal';
import ShareModal from '@/components/ShareModal';
import ToastContainer, { showToast } from '@/components/Toast';

const MAX_REFRESH_PER_DAY = 3;

function getRefreshCount(): number {
  try {
    const today = getTodayKey();
    const raw = localStorage.getItem(STORAGE_PREFIX + 'refresh_' + today);
    return raw ? Number(raw) : 0;
  } catch {
    return 0;
  }
}

function setRefreshCount(n: number) {
  try {
    const today = getTodayKey();
    localStorage.setItem(STORAGE_PREFIX + 'refresh_' + today, String(n));
  } catch {
    // ignore
  }
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>(DEFAULT_TAGS);
  const [currentRecipe, setCurrentRecipe] = useState<ContentItem[]>([]);
  const [readStates, setReadStates] = useState<Record<number, boolean>>({});
  const [feedbackStates, setFeedbackStates] = useState<Record<number, FeedbackType>>({});
  const [isDark, setIsDark] = useState(true);
  const [currentFilter, setCurrentFilter] = useState<FilterType>('all');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [shareCard, setShareCard] = useState<ContentItem | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [refreshCount, setRefreshCountState] = useState(0);

  useEffect(() => {
    const state = loadState();
    setSelectedTags(state.selectedTags || DEFAULT_TAGS);
    setIsDark(state.theme ? state.theme === 'dark' : true);
    setReadStates(state.readStates);
    setFeedbackStates(state.feedbackStates);
    setRefreshCountState(getRefreshCount());
    if (state.recipe.length > 0) {
      setCurrentRecipe(state.recipe);
    } else {
      setCurrentRecipe(generateRecipe(state.selectedTags || DEFAULT_TAGS));
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    saveState({ selectedTags, theme: isDark ? 'dark' : 'light', recipe: currentRecipe, readStates, feedbackStates });
  }, [selectedTags, currentRecipe, readStates, feedbackStates, isDark, mounted]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const balanceScore: BalanceScore = useMemo(
    () => currentRecipe.length > 0 ? calculateBalanceScore(currentRecipe) : { total: 0, stance: 0, evidence: 0, domain: 0 },
    [currentRecipe]
  );

  const currentDate = useMemo(() => new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }), []);

  const handleRefresh = useCallback(() => {
    const remaining = MAX_REFRESH_PER_DAY - refreshCount;
    if (remaining <= 0) {
      showToast('今日刷新次数已用完，明天再来吧', 'warn');
      return;
    }
    const newCount = refreshCount + 1;
    setRefreshCount(newCount);
    setRefreshCountState(newCount);
    setCurrentRecipe(generateRecipe(selectedTags));
    setReadStates({});
    setFeedbackStates({});
    const leftAfter = MAX_REFRESH_PER_DAY - newCount;
    if (leftAfter > 0) {
      showToast(`已刷新，今日剩余 ${leftAfter} 次`, 'info');
    } else {
      showToast('今日最后一次刷新，明天见', 'warn');
    }
  }, [selectedTags, refreshCount]);

  const handleToggleExpand = useCallback((id: number) => setReadStates(prev => ({ ...prev, [id]: true })), []);
  const handleFeedback = useCallback((id: number, type: FeedbackType) => setFeedbackStates(prev => ({ ...prev, [id]: type })), []);
  const handleToggleTag = useCallback((tagName: string) => {
    setSelectedTags(prev => {
      if (prev.includes(tagName)) {
        if (prev.length <= 1) {
          showToast('至少保留 1 个兴趣标签', 'warn');
          return prev;
        }
        return prev.filter(t => t !== tagName);
      }
      return [...prev, tagName];
    });
  }, []);
  const handleShare = useCallback((card: ContentItem) => { setShareCard(card); setShareModalOpen(true); }, []);

  if (!mounted) return <div className="min-h-screen" style={{ background: 'var(--bg-body)' }} />;

  const readCount = currentRecipe.filter(i => readStates[i.id]).length;
  const usefulCount = currentRecipe.filter(i => feedbackStates[i.id] === 'useful').length;

  return (
    <>
      <Header currentDate={currentDate} isDark={isDark} onToggleTheme={() => setIsDark(d => !d)} onOpenSettings={() => setSettingsOpen(true)} />
      <DailyProgress readCount={readCount} totalCount={currentRecipe.length} usefulCount={usefulCount} />
      <main className="max-w-6xl mx-auto px-4 py-4">
        <Reveal className="mb-10" y={20}>
          <Hero balanceScore={balanceScore} selectedTags={selectedTags} onRefresh={handleRefresh} refreshRemaining={Math.max(0, MAX_REFRESH_PER_DAY - refreshCount)} />
        </Reveal>
        <Reveal className="mb-8" y={28}>
          <section className="grid md:grid-cols-2 gap-6">
            <TransparencyPanel recipe={currentRecipe} />
            <SpectrumChart recipe={currentRecipe} />
          </section>
        </Reveal>
        <Reveal className="mb-8" y={28}>
          <CognitiveRadar recipe={currentRecipe} />
        </Reveal>
        <Reveal className="mb-10" y={28}>
          <RecipeCards recipe={currentRecipe} currentFilter={currentFilter} onFilterChange={setCurrentFilter} onToggleExpand={handleToggleExpand} onFeedback={handleFeedback} onShare={handleShare} readStates={readStates} feedbackStates={feedbackStates} />
        </Reveal>
        <Reveal className="mb-10" y={28}>
          <AboutSection />
        </Reveal>
      </main>
      <Footer />
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} selectedTags={selectedTags} onToggleTag={handleToggleTag} onSave={() => { setSettingsOpen(false); handleRefresh(); }} />
      <ShareModal isOpen={shareModalOpen} onClose={() => setShareModalOpen(false)} card={shareCard} />
      <ToastContainer />
    </>
  );
}
