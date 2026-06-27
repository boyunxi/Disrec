# Disrec · 反推荐引擎

> 用「信息食谱」对抗算法茧房——刻意把你不会主动点击的内容端上餐桌。

Disrec 是一个反向推荐实验：不追求点击率与停留时长，而是以**平衡性**为目标，每天为读者生成一份刻意多样化的信息食谱。它通过立场、证据、情绪、时间、地理、来源六个维度，量化你今日阅读的「信息多元度」，并主动填补算法不会推给你的盲区。

## 特性

- **100 篇文章 SSG** — Next.js 静态导出，`/article/[id]` 全量预渲染，零运行时数据库
- **历史感知食谱算法** — 跨刷新去重（localStorage 记录当日已展示 ID）、精确标签匹配、时间维度平衡、重复惩罚
- **三轴观点光谱** — 立场 / 证据 / 情感三轴并列，悬停联动高亮，0-100 多元度评分
- **信息多元度雷达** — 六维覆盖度客观呈现（可折叠，非认知诊断），明确告知「这是内容覆盖面，不是能力评估」
- **展开收起动画** — `grid-template-rows: 0fr → 1fr` 平滑高度过渡 + 子元素错峰淡入
- **3D 翻页过渡** — 阅读全文时卡片翻折 + 全屏翻页盖层，`perspective(1200px)`
- **滚动渐入** — IntersectionObserver 触发，支持 `prefers-reduced-motion` 降级
- **全局 Toast 系统** — 替代浏览器原生弹窗，pub/sub 模式跨组件调用
- **每日刷新限制** — 每日 3 次，按日期隔离的 localStorage 计数
- **可访问性** — 模态 ESC 关闭 + ARIA 属性、光谱图键盘可达、顶栏滚动滞回阈值防抖
- **SEO** — `sitemap.ts`（101 URL）、`robots.ts`、OG/Twitter 元数据、viewport themeColor
- **Docker 一键部署** — 多阶段构建（Node 20 构建 → nginx 托管静态产物）

## 技术栈

- **框架**：Next.js 14（App Router，`output: 'export'`）
- **语言**：TypeScript 5
- **样式**：Tailwind CSS 3 + CSS 变量主题系统（深色为默认）
- **部署**：Docker + nginx（静态托管 `out/`）

## 快速开始

```bash
# 安装依赖
npm install

# 开发模式（http://localhost:3000）
npm run dev

# 类型检查
npx tsc --noEmit
```

## 构建 & 部署

### 生产构建（静态导出）

```bash
npm run build      # 产物输出到 out/
```

### Docker 部署

```bash
docker compose up -d --build
# 访问 http://localhost:3000
```

多阶段构建：`node:20-alpine` 编译 → `nginx:alpine` 托管 `out/`，无 Node 运行时。`nginx.conf` 已配置 gzip、静态资源缓存与 SPA 回退。

> ⚠️ 生产构建后若回到开发模式，须先 `rm -rf .next` 再 `npm run dev`，避免生产/开发 chunk 映射冲突。

## 项目结构

```
src/
├── app/
│   ├── page.tsx              # 首页（食谱生成 + 光谱 + 雷达）
│   ├── layout.tsx            # 根布局（主题防闪烁 + 元数据）
│   ├── sitemap.ts            # 101 URL 站点地图
│   ├── robots.ts             # 爬虫规则
│   └── article/[id]/         # 文章详情页（SSG + loading 骨架）
├── components/
│   ├── RecipeCards.tsx       # 食谱卡片（展开收起动画）
│   ├── SpectrumChart.tsx     # 三轴观点光谱
│   ├── CognitiveRadar.tsx    # 信息多元度雷达（可折叠）
│   ├── PageTurnTransition.tsx# 3D 翻页过渡
│   ├── Reveal.tsx            # 滚动渐入
│   ├── Toast.tsx             # 全局 Toast 系统
│   ├── Header.tsx            # 滞回阈值吸顶导航
│   └── ...
├── data/
│   ├── content.ts            # 文章数据合并入口
│   ├── articles-batch-*.ts   # 100 篇文章（5 批次）
│   └── constants.ts          # 维度元数据、改善建议
├── lib/
│   ├── algorithm.ts          # 历史感知食谱生成 + explainWhy
│   ├── blindspot.ts          # 六维盲区计算
│   └── storage.ts           # localStorage 状态持久化
└── types/index.ts
```

## 算法说明

`generateRecipe` 每日产出 3 篇推荐，按角色分配：

1. **编辑精选** — 证据等级 ≥4 的优质内容
2. **随机发现** — 引入随机性，防止算法惯性锁死
3. **算法平衡** — 多维度打分选出最互补的一篇

打分维度含话题新颖性、立场跨度、情绪距离、来源/地理/时间多样性、证据质量、用户兴趣标签精确匹配，并对当日已展示文章施加 25 分重复惩罚。最终按证据等级排序（最易读的放第一篇）。

## 设计立场

本项目刻意**不**做：

- ❌ 追逐点击率的个性化推荐
- ❌ 把六维雷达包装成「认知能力诊断」（已诚实重命名为「信息多元度」）
- ❌ 浏览器原生弹窗（统一用 Toast）

## License

MIT
