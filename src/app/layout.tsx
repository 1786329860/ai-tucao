import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI吐槽研究所 - 让AI用最毒舌的方式吐槽你的一切",
  description:
    "输入你的社交媒体主页，AI 会用幽默犀利的方式吐槽你，生成一份可分享的趣味报告。被 AI 吐槽，是一种新型社交货币。",
  keywords: ["AI吐槽", "AI测评", "社交媒体分析", "趣味测试", "AI评分"],
  openGraph: {
    title: "AI吐槽研究所",
    description: "让AI用最毒舌的方式吐槽你的一切",
    type: "website",
    siteName: "AI吐槽研究所",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        {/* 顶部导航 */}
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-[#2a2a3e] bg-[#0a0a0f]/80 backdrop-blur-md">
          <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2 text-lg font-bold">
              <span className="text-2xl">🔥</span>
              <span className="gradient-text">AI吐槽研究所</span>
            </a>
            <nav className="flex items-center gap-4 text-sm text-gray-400">
              <a href="/" className="hover:text-white transition-colors">
                首页
              </a>
              <a href="/roast" className="hover:text-white transition-colors">
                开始吐槽
              </a>
            </nav>
          </div>
        </header>

        {/* 主内容 */}
        <main className="flex-1 pt-14">{children}</main>

        {/* PV 统计埋点 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                var fp = localStorage.getItem('_fp');
                if (!fp) {
                  fp = Date.now().toString(36) + Math.random().toString(36).substring(2, 10);
                  localStorage.setItem('_fp', fp);
                }
                fetch('/api/track', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ type: 'pageview', fingerprint: fp })
                }).catch(function(){});
              })();
            `,
          }}
        />

        {/* 底部 */}
        <footer className="border-t border-[#2a2a3e] py-6 text-center text-sm text-gray-500">
          <p>© 2026 AI吐槽研究所 · 被吐槽，是一种新型社交货币</p>
        </footer>
      </body>
    </html>
  );
}
