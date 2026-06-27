import type { Metadata, Viewport } from 'next';
import { Noto_Sans_SC, Noto_Serif_SC } from 'next/font/google';
import PageTurnTransition from '@/components/PageTurnTransition';
import './globals.css';

const notoSansSC = Noto_Sans_SC({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-noto-sans-sc',
  display: 'swap',
});

const notoSerifSC = Noto_Serif_SC({
  subsets: ['latin'],
  weight: ['400', '600', '700', '900'],
  variable: '--font-noto-serif-sc',
  display: 'swap',
});

const SITE_URL = 'https://disrec.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: '反推荐引擎 · 信息食谱',
    template: '%s · 反推荐引擎',
  },
  description: '不是推你喜欢的，也不是推你讨厌的——让你看到算法之外的世界',
  applicationName: '反推荐引擎',
  keywords: ['反推荐', '信息食谱', '算法透明', '认知多元', '信息茧房', '反推荐引擎'],
  authors: [{ name: '反推荐引擎' }],
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: SITE_URL,
    siteName: '反推荐引擎',
    title: '反推荐引擎 · 信息食谱',
    description: '不是推你喜欢的，也不是推你讨厌的——让你看到算法之外的世界',
  },
  twitter: {
    card: 'summary_large_image',
    title: '反推荐引擎 · 信息食谱',
    description: '不是推你喜欢的，也不是推你讨厌的——让你看到算法之外的世界',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f7f4ef' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1714' },
  ],
  width: 'device-width',
  initialScale: 1,
};

// 防主题闪烁：在 hydration 前从 localStorage 读取主题
const themeScript = `try{var t=localStorage.getItem('disrec_theme');document.documentElement.setAttribute('data-theme',t||'dark');}catch(e){document.documentElement.setAttribute('data-theme','dark');}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${notoSansSC.variable} ${notoSerifSC.variable} font-sans min-h-screen antialiased`}>
        <PageTurnTransition />
        {children}
      </body>
    </html>
  );
}
