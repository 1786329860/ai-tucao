import type { SocialPlatform, PlatformInfo } from '@/types';

/** 支持的社交平台列表 */
export const platforms: PlatformInfo[] = [
  {
    id: 'weibo',
    name: '微博',
    icon: '📱',
    placeholder: '输入微博用户名',
    color: '#E6162D',
  },
  {
    id: 'xiaohongshu',
    name: '小红书',
    icon: '📕',
    placeholder: '输入小红书用户名',
    color: '#FE2C55',
  },
  {
    id: 'douyin',
    name: '抖音',
    icon: '🎵',
    placeholder: '输入抖音用户名',
    color: '#010101',
  },
  {
    id: 'bilibili',
    name: 'B站',
    icon: '📺',
    placeholder: '输入B站用户名',
    color: '#00A1D6',
  },
  {
    id: 'zhihu',
    name: '知乎',
    icon: '💡',
    placeholder: '输入知乎用户名',
    color: '#0066FF',
  },
];

/** 根据 ID 获取平台信息 */
export function getPlatform(id: SocialPlatform): PlatformInfo | undefined {
  return platforms.find((p) => p.id === id);
}

/** 评分对应的颜色 */
export function getScoreColor(score: number): string {
  if (score >= 80) return '#22c55e';
  if (score >= 60) return '#eab308';
  if (score >= 40) return '#f97316';
  return '#ef4444';
}

/** 评分对应的评语前缀 */
export function getScoreLabel(score: number): string {
  if (score >= 90) return '优秀！';
  if (score >= 80) return '还不错~';
  if (score >= 70) return '一般般';
  if (score >= 60) return '有待提高';
  if (score >= 40) return '有点惨';
  if (score >= 20) return '很惨';
  return '惨不忍睹';
}

/** 生成随机 ID */
export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}
