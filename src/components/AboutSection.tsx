export default function AboutSection() {
  return (
    <div id="about" className="max-w-4xl mx-auto">
      <div className="rule-bold mb-6" />
      <div className="text-center mb-8">
        <span className="text-kicker">编者按</span>
        <h3 className="font-serif text-2xl font-bold mt-2" style={{ color: 'var(--text-primary)' }}>什么是「公正的反推荐」？</h3>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <div className="column-tag inline-block mb-4">我们不做的</div>
          <ul className="space-y-3 text-body" style={{ listStyle: 'none', paddingLeft: 0 }}>
            <li className="flex gap-2"><span style={{ color: 'var(--accent)' }}>—</span>不是「你喜欢什么就推什么」</li>
            <li className="flex gap-2"><span style={{ color: 'var(--accent)' }}>—</span>不是「你讨厌什么就反着推」</li>
            <li className="flex gap-2"><span style={{ color: 'var(--accent)' }}>—</span>不是用对立观点激怒你换流量</li>
            <li className="flex gap-2"><span style={{ color: 'var(--accent)' }}>—</span>不是假装客观实则夹带立场</li>
          </ul>
        </div>
        <div>
          <div className="column-tag inline-block mb-4" style={{ color: 'var(--accent-2)', borderBottomColor: 'var(--accent-2)' }}>我们做的</div>
          <ul className="space-y-3 text-body" style={{ listStyle: 'none', paddingLeft: 0 }}>
            <li className="flex gap-2"><span style={{ color: 'var(--accent-2)' }}>+</span>在立场、证据、情绪等六维度上追求平衡</li>
            <li className="flex gap-2"><span style={{ color: 'var(--accent-2)' }}>+</span>每条推荐都标注证据等级和来源类型</li>
            <li className="flex gap-2"><span style={{ color: 'var(--accent-2)' }}>+</span>主动混入随机性和编辑精选</li>
            <li className="flex gap-2"><span style={{ color: 'var(--accent-2)' }}>+</span>公开推荐组成比例，让用户知道算法怎么想</li>
          </ul>
        </div>
      </div>

      <div className="pullquote mt-8">
        公正的推荐不是让用户「爽」，而是让用户「醒」。我们追求的不是流量最大化，而是认知均衡化。
      </div>
    </div>
  );
}
