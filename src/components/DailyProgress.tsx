interface DailyProgressProps {
  readCount: number;
  totalCount: number;
  usefulCount: number;
}

export default function DailyProgress({ readCount, totalCount, usefulCount }: DailyProgressProps) {
  const isComplete = usefulCount === totalCount && totalCount > 0;
  const pct = totalCount > 0 ? (readCount / totalCount) * 100 : 0;

  return (
    <div className={`max-w-6xl mx-auto px-4 py-3 anim-fade-in-up ${isComplete ? 'progress-complete' : ''}`} style={{ animationDelay: '0.1s' }}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-kicker">今日食谱</span>
        <span className="text-caption font-sans">
          {!isComplete ? <span>{readCount} / {totalCount} 已阅读</span> : <span style={{ color: 'var(--accent-2)', fontWeight: 600 }}>已完成今日食谱</span>}
        </span>
      </div>
      <div className="progress-track h-1 overflow-hidden">
        <div className="progress-fill h-full" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
