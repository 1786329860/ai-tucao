// AI 吐槽研究所 - 全局类型定义

/** 吐槽平台类型 */
export type SocialPlatform = 'weibo' | 'xiaohongshu' | 'douyin' | 'bilibili' | 'zhihu';

/** 平台信息 */
export interface PlatformInfo {
  id: SocialPlatform;
  name: string;
  icon: string;
  placeholder: string;
  color: string;
}

/** 吐槽请求 */
export interface RoastRequest {
  platform: SocialPlatform;
  username: string;
  bio?: string;
  intensity?: 'mild' | 'medium' | 'spicy';
}

/** 吐槽报告 */
export interface RoastReport {
  id: string;
  platform: SocialPlatform;
  username: string;
  // 人设标签
  personaTags: string[];
  // 毒舌点评
  roastComments: string[];
  // 发帖风格分析
  styleAnalysis: string;
  // AI 评分
  score: number;
  scoreComment: string;
  // 一句话总结
  summary: string;
  // 生成时间
  createdAt: string;
}

/** 分享卡片数据 */
export interface ShareCardData {
  report: RoastReport;
  siteUrl: string;
}
