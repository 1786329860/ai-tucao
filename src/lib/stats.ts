import fs from 'fs';
import path from 'path';
import type { DailyStats, SiteStats, TrackEvent } from '@/types/stats';

const DATA_DIR = path.join(process.cwd(), 'data');
const STATS_FILE = path.join(DATA_DIR, 'stats.json');

/** 确保数据目录存在 */
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

/** 获取今天的日期字符串 */
function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

/** 读取统计数据 */
function readStats(): Record<string, DailyStats> {
  ensureDataDir();
  if (!fs.existsSync(STATS_FILE)) {
    return {};
  }
  try {
    return JSON.parse(fs.readFileSync(STATS_FILE, 'utf-8'));
  } catch {
    return {};
  }
}

/** 写入统计数据 */
function writeStats(stats: Record<string, DailyStats>) {
  ensureDataDir();
  fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2), 'utf-8');
}

/** 记录访问事件 */
export function trackEvent(event: TrackEvent): void {
  const stats = readStats();
  const today = getToday();

  if (!stats[today]) {
    stats[today] = {
      date: today,
      pv: 0,
      uv: 0,
      roastCount: 0,
      platformStats: {},
    };
  }

  const day = stats[today];

  if (event.type === 'pageview') {
    day.pv += 1;
    // 简单 UV：用 fingerprint 去重（存最近100个）
    const uvKey = `uv_${today}_${event.fingerprint}`;
    const uvFile = path.join(DATA_DIR, 'uv.json');
    let uvSet: Record<string, boolean> = {};
    if (fs.existsSync(uvFile)) {
      try { uvSet = JSON.parse(fs.readFileSync(uvFile, 'utf-8')); } catch { /* ignore */ }
    }
    if (!uvSet[uvKey]) {
      uvSet[uvKey] = true;
      day.uv += 1;
      // 只保留最近 7 天的 UV 记录
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const cutoff = sevenDaysAgo.toISOString().split('T')[0];
      for (const key of Object.keys(uvSet)) {
        if (key < `uv_${cutoff}`) delete uvSet[key];
      }
      fs.writeFileSync(uvFile, JSON.stringify(uvSet), 'utf-8');
    }
  } else if (event.type === 'roast') {
    day.roastCount += 1;
    if (event.platform) {
      day.platformStats[event.platform] = (day.platformStats[event.platform] || 0) + 1;
    }
  }

  writeStats(stats);
}

/** 获取站点统计汇总 */
export function getSiteStats(): SiteStats {
  const stats = readStats();
  const today = getToday();
  const dailyStats = Object.values(stats)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 30);

  const totalPV = dailyStats.reduce((sum, d) => sum + d.pv, 0);
  const totalUV = dailyStats.reduce((sum, d) => sum + d.uv, 0);
  const totalRoasts = dailyStats.reduce((sum, d) => sum + d.roastCount, 0);

  const todayData = stats[today];
  const platformStats: Record<string, number> = {};
  for (const day of dailyStats) {
    for (const [platform, count] of Object.entries(day.platformStats)) {
      platformStats[platform] = (platformStats[platform] || 0) + count;
    }
  }

  return {
    totalPV,
    totalUV,
    totalRoasts,
    todayPV: todayData?.pv || 0,
    todayUV: todayData?.uv || 0,
    todayRoasts: todayData?.roastCount || 0,
    dailyStats,
    platformStats,
  };
}
