import { NextResponse } from 'next/server';
import QRCode from 'qrcode';
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

/** 生成分享卡片 SVG */
function generateCardSVG(report: RoastReport, qrDataUrl: string): string {
  const scoreColor = getScoreColor(report.score);
  const platformName = platformNames[report.platform];

  const tagsHtml = report.personaTags
    .map(
      (tag, i) => `
    <rect x="30" y="${290 + i * 36}" width="${tag.length * 16 + 24}" height="28" rx="14" fill="#7c3aed22"/>
    <text x="42" y="${309 + i * 36}" font-size="14" fill="#c4b5fd" font-family="system-ui, sans-serif">${tag}</text>`
    )
    .join('\n');

  const commentsHtml = report.roastComments
    .map(
      (comment, i) => `
    <text x="30" y="${440 + i * 36}" font-size="13" fill="#94a3b8" font-family="system-ui, sans-serif">💬 ${comment}</text>`
    )
    .join('\n');

  const summaryText = report.summary.length > 30 ? report.summary.substring(0, 30) + '...' : report.summary;
  const styleText = report.styleAnalysis.length > 50 ? report.styleAnalysis.substring(0, 50) + '...' : report.styleAnalysis;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0f172a"/>
      <stop offset="100%" style="stop-color:#1e293b"/>
    </linearGradient>
  </defs>

  <!-- 背景 -->
  <rect width="600" height="800" rx="16" fill="url(#bg)"/>

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
  <text x="300" y="205" font-size="14" fill="#94a3b8" text-anchor="middle" font-family="system-ui, sans-serif">/100 · ${report.scoreComment}</text>
  <text x="300" y="238" font-size="12" fill="#64748b" text-anchor="middle" font-family="system-ui, sans-serif">社交主页评分</text>

  <!-- 人设标签 -->
  <text x="30" y="275" font-size="14" font-weight="bold" fill="#e2e8f0" font-family="system-ui, sans-serif">🏷️ 人设标签</text>
  ${tagsHtml}

  <!-- 毒舌点评 -->
  <text x="30" y="425" font-size="14" font-weight="bold" fill="#e2e8f0" font-family="system-ui, sans-serif">💬 毒舌点评</text>
  ${commentsHtml}

  <!-- 一句话总结 -->
  <rect x="30" y="560" width="540" height="50" rx="10" fill="#7c3aed15" stroke="#7c3aed44" stroke-width="1"/>
  <text x="300" y="590" font-size="15" fill="#c4b5fd" text-anchor="middle" font-family="system-ui, sans-serif">"${summaryText}"</text>

  <!-- 风格分析 -->
  <text x="30" y="640" font-size="14" font-weight="bold" fill="#e2e8f0" font-family="system-ui, sans-serif">📊 风格分析</text>
  <text x="30" y="665" font-size="13" fill="#94a3b8" font-family="system-ui, sans-serif">${styleText}</text>

  <!-- 底部 -->
  <line x1="30" y1="700" x2="570" y2="700" stroke="#334155" stroke-width="1"/>
  <text x="30" y="730" font-size="12" fill="#64748b" font-family="system-ui, sans-serif">扫码来吐槽你的主页 👆</text>
  <text x="570" y="730" font-size="11" fill="#475569" text-anchor="end" font-family="system-ui, sans-serif">tucao.aixiaolv.icu</text>

  <!-- 二维码 -->
  <image href="${qrDataUrl}" x="460" y="740" width="50" height="50"/>
</svg>`;
}

export async function POST(request: Request) {
  try {
    const { report } = await request.json();

    if (!report || !report.id) {
      return NextResponse.json({ error: '缺少报告数据' }, { status: 400 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tucao.aixiaolv.icu';

    // 生成二维码
    const qrDataUrl = await QRCode.toDataURL(siteUrl, {
      width: 200,
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' },
    });

    // 生成 SVG 卡片
    const svg = generateCardSVG(report, qrDataUrl);

    // 返回 SVG 图片（浏览器可直接显示，也可右键保存）
    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Content-Disposition': `inline; filename="roast-${report.username}.svg"`,
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
