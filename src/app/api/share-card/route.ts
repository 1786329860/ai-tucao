import { NextResponse } from 'next/server';
import type { RoastReport, SocialPlatform } from '@/types';

const platformNames: Record<SocialPlatform, string> = {
  weibo: '微博',
  xiaohongshu: '小红书',
  douyin: '抖音',
  bilibili: 'B站',
  zhihu: '知乎',
};

function getScoreColor(score: number): string {
  if (score >= 80) return '#22c55e';
  if (score >= 60) return '#eab308';
  if (score >= 40) return '#f97316';
  return '#ef4444';
}

/** 将长文本按指定宽度拆分成多行（中文按字符，英文按单词） */
function wrapText(text: string, maxCharsPerLine: number): string[] {
  const lines: string[] = [];
  let current = '';
  for (const char of text) {
    current += char;
    if (current.length >= maxCharsPerLine) {
      lines.push(current);
      current = '';
    }
  }
  if (current) lines.push(current);
  return lines;
}

/** 生成多行 SVG text 元素 */
function multiLineText(
  text: string,
  x: number,
  startY: number,
  fontSize: number,
  fill: string,
  maxCharsPerLine: number,
  lineHeight: number = fontSize * 1.6
): string {
  const lines = wrapText(text, maxCharsPerLine);
  return lines
    .map((line, i) => {
      const escaped = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return `<text x="${x}" y="${startY + i * lineHeight}" font-size="${fontSize}" fill="${fill}" font-family="system-ui, -apple-system, sans-serif">${escaped}</text>`;
    })
    .join('\n');
}

/** 生成分享卡片 SVG */
function generateCardSVG(report: RoastReport): string {
  const scoreColor = getScoreColor(report.score);
  const platformName = platformNames[report.platform];
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tucao.aixiaolv.icu';

  // 人设标签（每行最多3个）
  const tagsHtml = report.personaTags
    .map((tag, i) => {
      const x = 30 + (i % 3) * 185;
      const y = 290 + Math.floor(i / 3) * 36;
      return `<rect x="${x}" y="${y}" width="${tag.length * 15 + 20}" height="28" rx="14" fill="#7c3aed22"/>
    <text x="${x + 10}" y="${y + 19}" font-size="13" fill="#c4b5fd" font-family="system-ui, sans-serif">${tag}</text>`;
    })
    .join('\n');

  const tagRows = Math.ceil(report.personaTags.length / 3);
  const commentsStartY = 290 + tagRows * 36 + 40;

  // 毒舌点评（每行最多28个字符）
  const commentsHtml = report.roastComments
    .map((comment, i) => {
      const startY = commentsStartY + i * 60;
      const textLines = multiLineText(`💬 ${comment}`, 30, startY, 12, '#94a3b8', 28, 18);
      return textLines;
    })
    .join('\n');

  const summarySectionY = commentsStartY + report.roastComments.length * 60 + 10;
  const summaryText = report.summary.length > 40 ? report.summary.substring(0, 40) + '...' : report.summary;
  const styleSectionY = summarySectionY + 55;
  const styleText = multiLineText(report.styleAnalysis, 30, styleSectionY + 20, 12, '#94a3b8', 30, 18);
  const cardHeight = styleSectionY + 80 + 60;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="${cardHeight}" viewBox="0 0 600 ${cardHeight}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0f172a"/>
      <stop offset="100%" style="stop-color:#1e293b"/>
    </linearGradient>
  </defs>

  <!-- 背景 -->
  <rect width="600" height="${cardHeight}" rx="16" fill="url(#bg)"/>

  <!-- 顶部标题 -->
  <text x="30" y="50" font-size="20" font-weight="bold" fill="#f8fafc" font-family="system-ui, sans-serif">🔥 AI吐槽研究所</text>
  <text x="570" y="50" font-size="14" fill="#94a3b8" text-anchor="end" font-family="system-ui, sans-serif">${platformName}主页吐槽</text>

  <!-- 分割线 -->
  <line x1="30" y1="70" x2="570" y2="70" stroke="#334155" stroke-width="1"/>

  <!-- 用户名 -->
  <text x="30" y="110" font-size="16" fill="#e2e8f0" font-family="system-ui, sans-serif">👤 ${report.username}</text>

  <!-- 评分区域 -->
  <rect x="30" y="130" width="540" height="120" rx="12" fill="#1e293b" stroke="#334155" stroke-width="1"/>
  <text x="300" y="180" font-size="52" font-weight="bold" fill="${scoreColor}" text-anchor="middle" font-family="system-ui, sans-serif">${report.score}</text>
  <text x="300" y="205" font-size="13" fill="#94a3b8" text-anchor="middle" font-family="system-ui, sans-serif">/100 · ${report.scoreComment}</text>
  <text x="300" y="238" font-size="12" fill="#64748b" text-anchor="middle" font-family="system-ui, sans-serif">社交主页评分</text>

  <!-- 人设标签 -->
  <text x="30" y="275" font-size="14" font-weight="bold" fill="#e2e8f0" font-family="system-ui, sans-serif">🏷️ 人设标签</text>
  ${tagsHtml}

  <!-- 毒舌点评 -->
  <text x="30" y="${commentsStartY - 10}" font-size="14" font-weight="bold" fill="#e2e8f0" font-family="system-ui, sans-serif">💬 毒舌点评</text>
  ${commentsHtml}

  <!-- 一句话总结 -->
  <rect x="30" y="${summarySectionY}" width="540" height="45" rx="10" fill="#7c3aed15" stroke="#7c3aed44" stroke-width="1"/>
  <text x="300" y="${summarySectionY + 28}" font-size="14" fill="#c4b5fd" text-anchor="middle" font-family="system-ui, sans-serif">"${summaryText}"</text>

  <!-- 风格分析 -->
  <text x="30" y="${styleSectionY}" font-size="14" font-weight="bold" fill="#e2e8f0" font-family="system-ui, sans-serif">📊 风格分析</text>
  ${styleText}

  <!-- 底部 -->
  <line x1="30" y1="${cardHeight - 55}" x2="570" y2="${cardHeight - 55}" stroke="#334155" stroke-width="1"/>
  <text x="300" y="${cardHeight - 30}" font-size="13" fill="#7c3aed" text-anchor="middle" font-family="system-ui, sans-serif">🔥 来吐槽你的主页 👉 ${siteUrl}</text>
  <text x="300" y="${cardHeight - 10}" font-size="11" fill="#475569" text-anchor="middle" font-family="system-ui, sans-serif">AI吐槽研究所 · 被吐槽是一种新型社交货币</text>
</svg>`;
}

export async function POST(request: Request) {
  try {
    const { report } = await request.json();

    if (!report || !report.id) {
      return NextResponse.json({ error: '缺少报告数据' }, { status: 400 });
    }

    const svg = generateCardSVG(report);

    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml;charset=utf-8',
      },
    });
  } catch (error) {
    console.error('生成分享卡片失败:', error);
    return NextResponse.json(
      { error: '生成卡片失败' },
      { status: 500 }
    );
  }
}
