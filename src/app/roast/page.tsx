'use client';

import { useState, useCallback } from 'react';
import type { SocialPlatform, RoastReport } from '@/types';
import { platforms, getScoreColor, getScoreLabel } from '@/lib/utils';

/** 加载动画中显示的趣味文案 */
const loadingMessages = [
  'AI 正在翻你的主页……',
  'AI 正在分析你的发帖风格……',
  'AI 正在组织语言准备吐槽……',
  'AI 被你的主页震惊了……',
  'AI 正在憋大招……',
  'AI 笑出了声……',
];

export default function RoastPage() {
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform | null>(null);
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [intensity, setIntensity] = useState<'mild' | 'medium' | 'spicy'>('medium');
  const [loading, setLoading] = useState(false);
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
  const [report, setReport] = useState<RoastReport | null>(null);
  const [error, setError] = useState('');

  const selectedPlatformInfo = platforms.find((p) => p.id === selectedPlatform);

  /** 开始吐槽 */
  const handleRoast = useCallback(async () => {
    if (!selectedPlatform || !username.trim()) return;

    setLoading(true);
    setError('');
    setReport(null);

    // 切换加载文案
    let msgIdx = 0;
    const msgTimer = setInterval(() => {
      msgIdx = (msgIdx + 1) % loadingMessages.length;
      setLoadingMsgIndex(msgIdx);
    }, 2000);

    try {
      const res = await fetch('/api/roast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: selectedPlatform,
          username: username.trim(),
          bio: bio.trim(),
          intensity,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '生成失败，请稍后重试');
      }

      setReport(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败，请稍后重试');
    } finally {
      clearInterval(msgTimer);
      setLoading(false);
    }
  }, [selectedPlatform, username, bio, intensity]);

  /** 下载分享卡片（SVG 转 PNG 后下载） */
  const handleDownloadCard = useCallback(async () => {
    if (!report) return;

    try {
      const res = await fetch('/api/share-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report }),
      });

      if (!res.ok) throw new Error('生成卡片失败');

      const svgText = await res.text();

      // 将 SVG 转为 PNG
      const svgBlob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      const img = new Image();
      img.crossOrigin = 'anonymous';

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('图片加载失败'));
        img.src = svgUrl;
      });

      // 创建 Canvas 绘制图片
      const scale = 2; // 2倍清晰度
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth * scale;
      canvas.height = img.naturalHeight * scale;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas 不可用');
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0);

      URL.revokeObjectURL(svgUrl);

      // 导出为 PNG 并下载
      canvas.toBlob((blob) => {
        if (!blob) {
          setError('生成图片失败');
          return;
        }
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `AI吐槽-${report.username}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 'image/png');
    } catch {
      setError('生成分享卡片失败，请稍后重试');
    }
  }, [report]);

  /** 重新开始 */
  const handleReset = () => {
    setReport(null);
    setError('');
  };

  const scoreColor = report ? getScoreColor(report.score) : '#f97316';

  return (
    <div className="min-h-[calc(100vh-3.5rem)]">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* 页面标题 */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            🔥 吐槽我的社交主页
          </h1>
          <p className="text-gray-400">
            选择平台，输入用户名，让 AI 来吐槽你的主页
          </p>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* 报告展示 */}
        {report && !loading && (
          <div className="space-y-6 animate-slide-up">
            {/* 报告头部 */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{selectedPlatformInfo?.icon}</span>
                  <div>
                    <div className="font-semibold text-white">
                      @{report.username}
                    </div>
                    <div className="text-sm text-gray-500">
                      {selectedPlatformInfo?.name}主页吐槽
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-600">
                  {new Date(report.createdAt).toLocaleString('zh-CN')}
                </div>
              </div>

              {/* 评分 */}
              <div className="flex items-center gap-6 mb-6 p-4 rounded-xl bg-[#0a0a0f]">
                <div className="relative w-28 h-28 shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r="52"
                      fill="none"
                      stroke="#2a2a3e"
                      strokeWidth="8"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="52"
                      fill="none"
                      stroke={scoreColor}
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${(report.score / 100) * 327} 327`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span
                      className="text-3xl font-bold"
                      style={{ color: scoreColor }}
                    >
                      {report.score}
                    </span>
                    <span className="text-xs text-gray-500">/100</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">社交主页评分</div>
                  <div
                    className="text-lg font-bold mt-1"
                    style={{ color: scoreColor }}
                  >
                    {getScoreLabel(report.score)}
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    {report.scoreComment}
                  </div>
                </div>
              </div>

              {/* 人设标签 */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-400 mb-3">
                  🏷️ 人设标签
                </h3>
                <div className="flex flex-wrap gap-2">
                  {report.personaTags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1.5 rounded-full bg-purple-500/10 text-purple-300 text-sm border border-purple-500/20"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* 毒舌点评 */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-400 mb-3">
                  💬 毒舌点评
                </h3>
                <div className="space-y-2">
                  {report.roastComments.map((comment, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg bg-[#0a0a0f] text-sm text-gray-300"
                    >
                      {comment}
                    </div>
                  ))}
                </div>
              </div>

              {/* 风格分析 */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-400 mb-3">
                  📊 风格分析
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {report.styleAnalysis}
                </p>
              </div>

              {/* 一句话总结 */}
              <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20">
                <h3 className="text-sm font-semibold text-gray-400 mb-2">
                  ✨ 一句话总结
                </h3>
                <p className="text-purple-300 italic text-lg">
                  &ldquo;{report.summary}&rdquo;
                </p>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-3">
              <button
                onClick={handleDownloadCard}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                📥 下载分享卡片
              </button>
              <button
                onClick={handleReset}
                className="flex-1 py-3 px-6 rounded-xl border border-[#2a2a3e] text-gray-400 hover:text-white hover:border-purple-500/50 transition-all"
              >
                🔄 再来一次
              </button>
            </div>
          </div>
        )}

        {/* 加载动画 */}
        {loading && (
          <div className="text-center py-20">
            <div className="animate-pulse-glow mb-8">
              <div className="text-6xl">
                {selectedPlatformInfo?.icon || '🤖'}
              </div>
            </div>
            <div className="text-xl text-white font-semibold mb-3">
              {loadingMessages[loadingMsgIndex]}
            </div>
            <div className="flex justify-center gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-purple-500 animate-typing"
                  style={{ animationDelay: `${i * 0.3}s` }}
                />
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-4">
              AI 正在认真分析 @{username} 的{selectedPlatformInfo?.name}主页……
            </p>
          </div>
        )}

        {/* 输入表单（无报告且非加载时显示） */}
        {!report && !loading && (
          <div className="space-y-6 animate-slide-up">
            {/* 步骤1：选择平台 */}
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold mb-4">
                ① 选择你要吐槽的平台
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {platforms.map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() => setSelectedPlatform(platform.id)}
                    className={`platform-btn p-4 rounded-xl border text-center ${
                      selectedPlatform === platform.id
                        ? 'active border-purple-500 bg-purple-500/10'
                        : 'border-[#2a2a3e] bg-[#0a0a0f] hover:border-purple-500/30'
                    }`}
                  >
                    <div className="text-3xl mb-2">{platform.icon}</div>
                    <div className="text-sm font-medium text-white">
                      {platform.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 步骤2：输入用户名和简介 */}
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold mb-4">
                ② 输入用户名和主页简介
              </h2>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={
                  selectedPlatformInfo?.placeholder || '请先选择平台'
                }
                disabled={!selectedPlatform}
                className="w-full px-4 py-3 rounded-xl bg-[#0a0a0f] border border-[#2a2a3e] text-white placeholder-gray-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:opacity-50 transition-all"
              />
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="粘贴你的主页简介/个性签名（可选，但能让吐槽更精准）"
                disabled={!selectedPlatform}
                rows={3}
                className="w-full mt-3 px-4 py-3 rounded-xl bg-[#0a0a0f] border border-[#2a2a3e] text-white placeholder-gray-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:opacity-50 transition-all resize-none"
              />
              <p className="text-xs text-gray-600 mt-2">
                💡 建议粘贴主页简介，AI 会结合简介内容生成更精准的吐槽
              </p>
            </div>

            {/* 步骤3：选择吐槽强度 */}
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold mb-4">
                ③ 选择吐槽强度
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    value: 'mild' as const,
                    label: '温和吐槽',
                    desc: '微微一笑',
                    emoji: '😊',
                  },
                  {
                    value: 'medium' as const,
                    label: '正常毒舌',
                    desc: '笑到肚子疼',
                    emoji: '😈',
                  },
                  {
                    value: 'spicy' as const,
                    label: '地狱笑话',
                    desc: '做好心理准备',
                    emoji: '💀',
                  },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setIntensity(option.value)}
                    className={`p-4 rounded-xl border text-center transition-all ${
                      intensity === option.value
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-[#2a2a3e] bg-[#0a0a0f] hover:border-purple-500/30'
                    }`}
                  >
                    <div className="text-2xl mb-1">{option.emoji}</div>
                    <div className="text-sm font-medium text-white">
                      {option.label}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {option.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 开始按钮 */}
            <button
              onClick={handleRoast}
              disabled={!selectedPlatform || !username.trim()}
              className="btn-primary w-full text-lg py-4 flex items-center justify-center gap-2"
            >
              🔥 开始吐槽
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
