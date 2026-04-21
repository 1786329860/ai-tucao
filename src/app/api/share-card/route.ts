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

/** 将长文本按指定字符数拆分成多行 */
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

/** 生成多行 SVG text 元素，返回总行数 */
function multiLineText(
  text: string,
  x: number,
  startY: number,
  fontSize: number,
  fill: string,
  maxCharsPerLine: number,
  lineHeight: number = fontSize * 1.6
): { svg: string; lineCount: number } {
  const lines = wrapText(text, maxCharsPerLine);
  const svg = lines
    .map((line, i) => {
      const escaped = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return `<text x="${x}" y="${startY + i * lineHeight}" font-size="${fontSize}" fill="${fill}" font-family="system-ui, -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif">${escaped}</text>`;
    })
    .join('\n');
  return { svg, lineCount: lines.length };
}

/** 生成分享卡片 SVG */
function generateCardSVG(report: RoastReport): string {
  const scoreColor = getScoreColor(report.score);
  const platformName = platformNames[report.platform];
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tucao.aixiaolv.icu';

  let y = 30; // 当前 Y 坐标

  // === 顶部标题 ===
  y += 25; // 55
  const headerSvg = `
  <text x="30" y="${y}" font-size="20" font-weight="bold" fill="#f8fafc" font-family="system-ui, sans-serif">🔥 AI吐槽研究所</text>
  <text x="570" y="${y}" font-size="14" fill="#94a3b8" text-anchor="end" font-family="system-ui, sans-serif">${platformName}主页吐槽</text>`;

  // 分割线
  y += 20; // 75
  const divider1 = `<line x1="30" y1="${y}" x2="570" y2="${y}" stroke="#334155" stroke-width="1"/>`;

  // === 用户名 ===
  y += 35; // 110
  const usernameSvg = `<text x="30" y="${y}" font-size="16" fill="#e2e8f0" font-family="system-ui, sans-serif">👤 ${report.username}</text>`;

  // === 评分区域（高度自适应） ===
  y += 20; // 130
  const scoreBoxTop = y;
  y += 45; // 175 - 分数
  const scoreNumSvg = `<text x="300" y="${y}" font-size="52" font-weight="bold" fill="${scoreColor}" text-anchor="middle" font-family="system-ui, sans-serif">${report.score}</text>`;

  // scoreComment 换行（每行最多22字符）
  y += 22; // 197
  const commentResult = multiLineText(`/100 · ${report.scoreComment}`, 30, y, 13, '#94a3b8', 22, 18);
  const scoreCommentSvg = commentResult.svg;

  y += commentResult.lineCount * 18 + 10; // 评分标签
  const scoreLabelSvg = `<text x="300" y="${y}" font-size="12" fill="#64748b" text-anchor="middle" font-family="system-ui, sans-serif">社交主页评分</text>`;

  y += 20; // 评分区域底部
  const scoreBoxHeight = y - scoreBoxTop;
  const scoreBoxSvg = `<rect x="30" y="${scoreBoxTop}" width="540" height="${scoreBoxHeight}" rx="12" fill="#1e293b" stroke="#334155" stroke-width="1"/>`;

  // === 人设标签 ===
  y += 30; // 标题
  const tagsTitleSvg = `<text x="30" y="${y}" font-size="14" font-weight="bold" fill="#e2e8f0" font-family="system-ui, sans-serif">🏷️ 人设标签</text>`;

  y += 18; // 标签起始
  const tagsHtml = report.personaTags
    .map((tag, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const tx = 30 + col * 185;
      const ty = y + row * 34;
      const escaped = tag.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return `<rect x="${tx}" y="${ty}" width="${tag.length * 15 + 20}" height="28" rx="14" fill="#7c3aed22"/>
    <text x="${tx + 10}" y="${ty + 19}" font-size="13" fill="#c4b5fd" font-family="system-ui, sans-serif">${escaped}</text>`;
    })
    .join('\n');

  const tagRows = Math.ceil(report.personaTags.length / 3);
  y += tagRows * 34 + 5;

  // === 毒舌点评 ===
  y += 25; // 标题
  const commentsTitleSvg = `<text x="30" y="${y}" font-size="14" font-weight="bold" fill="#e2e8f0" font-family="system-ui, sans-serif">💬 毒舌点评</text>`;

  y += 16; // 内容起始
  const commentsParts: string[] = [];
  for (const comment of report.roastComments) {
    const result = multiLineText(`💬 ${comment}`, 30, y, 12, '#94a3b8', 26, 18);
    commentsParts.push(result.svg);
    y += result.lineCount * 18 + 10;
  }
  const commentsSvg = commentsParts.join('\n');

  // === 一句话总结 ===
  y += 8;
  const summaryBoxTop = y;
  // summary 也换行
  const summaryResult = multiLineText(report.summary, 50, y + 22, 14, '#c4b5fd', 28, 22);
  const summaryBoxHeight = summaryResult.lineCount * 22 + 16;
  const summarySvg = `
  <rect x="30" y="${summaryBoxTop}" width="540" height="${summaryBoxHeight}" rx="10" fill="#7c3aed15" stroke="#7c3aed44" stroke-width="1"/>
  ${summaryResult.svg}`;

  y = summaryBoxTop + summaryBoxHeight + 15;

  // === 风格分析 ===
  const styleTitleSvg = `<text x="30" y="${y}" font-size="14" font-weight="bold" fill="#e2e8f0" font-family="system-ui, sans-serif">📊 风格分析</text>`;
  y += 18;
  const styleResult = multiLineText(report.styleAnalysis, 30, y, 12, '#94a3b8', 30, 18);
  const styleSvg = styleResult.svg;
  y += styleResult.lineCount * 18 + 15;

  // === 底部 ===
  const footerDivider = `<line x1="30" y1="${y}" x2="570" y2="${y}" stroke="#334155" stroke-width="1"/>`;
  y += 22;
  const footerUrlSvg = `<text x="300" y="${y}" font-size="13" fill="#7c3aed" text-anchor="middle" font-family="system-ui, sans-serif">🔥 来吐槽你的主页 👉 ${siteUrl}</text>`;
  y += 18;
  const footerTagSvg = `<text x="300" y="${y}" font-size="11" fill="#475569" text-anchor="middle" font-family="system-ui, sans-serif">AI吐槽研究所 · 被吐槽是一种新型社交货币</text>`;
  y += 15;

  const cardHeight = y;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="${cardHeight}" viewBox="0 0 600 ${cardHeight}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0f172a"/>
      <stop offset="100%" style="stop-color:#1e293b"/>
    </linearGradient>
  </defs>

  <!-- 背景 -->
  <rect width="600" height="${cardHeight}" rx="16" fill="url(#bg)"/>

  ${headerSvg}
  ${divider1}
  ${usernameSvg}
  ${scoreBoxSvg}
  ${scoreNumSvg}
  ${scoreCommentSvg}
  ${scoreLabelSvg}
  ${tagsTitleSvg}
  ${tagsHtml}
  ${commentsTitleSvg}
  ${commentsSvg}
  ${summarySvg}
  ${styleTitleSvg}
  ${styleSvg}
  ${footerDivider}
  ${footerUrlSvg}
  ${footerTagSvg}
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
