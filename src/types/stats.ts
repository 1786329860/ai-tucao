// 访问统计数据类型

export interface DailyStats {
  date: string;           // YYYY-MM-DD
  pv: number;             // 页面浏览量
  uv: number;             // 独立访客
  roastCount: number;     // 吐槽次数
  platformStats: Record<string, number>;  // 各平台吐槽次数
}

export interface SiteStats {
  totalPV: number;
  totalUV: number;
  totalRoasts: number;
  todayPV: number;
  todayUV: number;
  todayRoasts: number;
  dailyStats: DailyStats[];  // 最近 30 天
  platformStats: Record<string, number>;  // 总平台分布
}

export interface TrackEvent {
  type: 'pageview' | 'roast';
  platform?: string;
  fingerprint: string;
}
