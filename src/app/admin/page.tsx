'use client';

import { useState, useEffect } from 'react';
import type { SiteStats } from '@/types/stats';

const platformNames: Record<string, string> = {
  weibo: '微博',
  xiaohongshu: '小红书',
  douyin: '抖音',
  bilibili: 'B站',
  zhihu: '知乎',
};

export default function AdminPage() {
  const [stats, setStats] = useState<SiteStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setStats(data.data);
      })
      .finally(() => setLoading(false));

    // 每 30 秒自动刷新
    const timer = setInterval(() => {
      fetch('/api/stats')
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setStats(data.data);
        });
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <div className="text-gray-400">加载统计数据...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <div className="text-gray-400">暂无统计数据</div>
      </div>
    );
  }

  // 趋势图数据
  const recentDays = stats.dailyStats.slice(0, 14).reverse();
  const maxPV = Math.max(...recentDays.map((d) => d.pv), 1);
  const maxRoasts = Math.max(...recentDays.map((d) => d.roastCount), 1);

  return (
    <div className="min-h-[calc(100vh-3.5rem)]">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">📊 数据后台</h1>
            <p className="text-sm text-gray-500 mt-1">每 30 秒自动刷新</p>
          </div>
          <a href="/" className="text-sm text-gray-400 hover:text-white transition-colors">
            ← 返回首页
          </a>
        </div>

        {/* 概览卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[
            { label: '今日 PV', value: stats.todayPV, icon: '👁️', color: '#7c3aed' },
            { label: '今日 UV', value: stats.todayUV, icon: '👥', color: '#3b82f6' },
            { label: '今日吐槽', value: stats.todayRoasts, icon: '🔥', color: '#f97316' },
            { label: '总 PV', value: stats.totalPV, icon: '📈', color: '#22c55e' },
            { label: '总 UV', value: stats.totalUV, icon: '🌐', color: '#06b6d4' },
            { label: '总吐槽', value: stats.totalRoasts, icon: '💬', color: '#ec4899' },
          ].map((item) => (
            <div key={item.label} className="glass-card p-4">
              <div className="text-2xl mb-1">{item.icon}</div>
              <div className="text-2xl font-bold" style={{ color: item.color }}>
                {item.value.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500 mt-1">{item.label}</div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* PV 趋势 */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold mb-4">👁️ 近 14 天 PV 趋势</h2>
            <div className="flex items-end gap-1 h-40">
              {recentDays.map((day) => (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-gray-500">{day.pv}</span>
                  <div
                    className="w-full rounded-t-sm min-h-[2px] transition-all"
                    style={{
                      height: `${(day.pv / maxPV) * 120}px`,
                      backgroundColor: '#7c3aed',
                    }}
                  />
                  <span className="text-[10px] text-gray-600">
                    {day.date.substring(5)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 吐槽次数趋势 */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold mb-4">🔥 近 14 天吐槽趋势</h2>
            <div className="flex items-end gap-1 h-40">
              {recentDays.map((day) => (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-gray-500">{day.roastCount}</span>
                  <div
                    className="w-full rounded-t-sm min-h-[2px] transition-all"
                    style={{
                      height: `${(day.roastCount / maxRoasts) * 120}px`,
                      backgroundColor: '#f97316',
                    }}
                  />
                  <span className="text-[10px] text-gray-600">
                    {day.date.substring(5)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 平台分布 */}
        <div className="glass-card p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">📱 平台吐槽分布</h2>
          {Object.keys(stats.platformStats).length === 0 ? (
            <p className="text-gray-500 text-sm">暂无数据</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(stats.platformStats)
                .sort((a, b) => b[1] - a[1])
                .map(([platform, count]) => {
                  const maxCount = Math.max(
                    ...Object.values(stats.platformStats)
                  );
                  const percentage = Math.round(
                    (count / stats.totalRoasts) * 100
                  );
                  return (
                    <div key={platform} className="flex items-center gap-3">
                      <span className="text-sm text-gray-400 w-20 shrink-0">
                        {platformNames[platform] || platform}
                      </span>
                      <div className="flex-1 h-6 bg-[#0a0a0f] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${(count / maxCount) * 100}%`,
                            backgroundColor: '#7c3aed',
                          }}
                        />
                      </div>
                      <span className="text-sm text-gray-400 w-20 text-right">
                        {count} 次 ({percentage}%)
                      </span>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* 每日明细 */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold mb-4">📋 每日明细</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 border-b border-[#2a2a3e]">
                  <th className="text-left py-2 px-3">日期</th>
                  <th className="text-right py-2 px-3">PV</th>
                  <th className="text-right py-2 px-3">UV</th>
                  <th className="text-right py-2 px-3">吐槽次数</th>
                </tr>
              </thead>
              <tbody>
                {stats.dailyStats.map((day) => (
                  <tr
                    key={day.date}
                    className="border-b border-[#1a1a2e] hover:bg-[#0a0a0f50]"
                  >
                    <td className="py-2 px-3 text-gray-300">{day.date}</td>
                    <td className="py-2 px-3 text-right text-purple-400">
                      {day.pv}
                    </td>
                    <td className="py-2 px-3 text-right text-blue-400">
                      {day.uv}
                    </td>
                    <td className="py-2 px-3 text-right text-orange-400">
                      {day.roastCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
