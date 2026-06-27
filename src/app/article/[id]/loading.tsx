// 文章页加载骨架屏 - 杂志风
export default function ArticleLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* 顶部加载指示 */}
      <div className="flex items-center gap-3 mb-8">
        <div className="loading-spinner" />
        <span className="text-caption" style={{ color: 'var(--text-muted)' }}>
          正在翻页…
        </span>
      </div>

      {/* 栏目标签骨架 */}
      <div className="skeleton-line" style={{ width: '80px', height: '20px', marginBottom: '1rem' }} />

      {/* 标题骨架 */}
      <div className="skeleton-line" style={{ width: '100%', height: '32px', marginBottom: '0.75rem' }} />
      <div className="skeleton-line" style={{ width: '70%', height: '32px', marginBottom: '1.5rem' }} />

      {/* 导语骨架 */}
      <div className="skeleton-line" style={{ width: '100%', height: '18px', marginBottom: '0.5rem' }} />
      <div className="skeleton-line" style={{ width: '90%', height: '18px', marginBottom: '1.5rem' }} />

      {/* 元信息行骨架 */}
      <div className="flex gap-3 mb-8">
        <div className="skeleton-line" style={{ width: '90px', height: '14px' }} />
        <div className="skeleton-line" style={{ width: '60px', height: '14px' }} />
        <div className="skeleton-line" style={{ width: '70px', height: '14px' }} />
      </div>

      {/* 编者按骨架 */}
      <div className="skeleton-line" style={{ width: '100%', height: '80px', marginBottom: '2rem' }} />

      {/* 正文骨架（多行） */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="skeleton-line"
          style={{ width: i === 5 ? '60%' : '100%', height: '14px', marginBottom: '0.75rem' }}
        />
      ))}
    </div>
  );
}
