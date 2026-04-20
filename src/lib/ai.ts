import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import type { RoastRequest, RoastReport, SocialPlatform } from '@/types';

// 平台信息映射
const platformNames: Record<SocialPlatform, string> = {
  weibo: '微博',
  xiaohongshu: '小红书',
  douyin: '抖音',
  bilibili: 'B站',
  zhihu: '知乎',
};

// 毒舌程度映射
const intensityMap = {
  mild: '温和吐槽',
  medium: '正常毒舌',
  spicy: '地狱笑话级别',
};

function getDeepSeekClient() {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const baseURL = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com';

  if (!apiKey || apiKey === 'your_deepseek_api_key_here') {
    throw new Error('请配置 DEEPSEEK_API_KEY 环境变量');
  }

  return createOpenAI({
    apiKey,
    baseURL,
    name: 'deepseek',
  });
}

/** 构建 AI 吐槽 Prompt */
function buildRoastPrompt(request: RoastRequest): string {
  const platformName = platformNames[request.platform];
  const intensity = intensityMap[request.intensity || 'medium'];

  // 构建简介信息
  const bioSection = request.bio?.trim()
    ? `\n用户的主页简介/个性签名：${request.bio}\n请重点结合用户的主页简介内容进行吐槽，让吐槽更加精准和个性化。`
    : '\n用户没有提供主页简介，请根据用户名和平台特征进行创意吐槽。';

  return `你是一个毒舌但有趣的 AI 吐槽大师，你的任务是吐槽用户的${platformName}主页。

用户名：${request.username}
平台：${platformName}
吐槽强度：${intensity}${bioSection}

请生成一份幽默犀利的吐槽报告。要求：
1. 吐槽要有趣、有梗，但不能真正冒犯用户
2. 结合${platformName}平台的典型用户特征进行吐槽
3. 如果用户提供了简介，必须针对简介内容进行精准吐槽
4. 语言风格：网感强，善用网络流行语和梗
5. 吐槽内容要具体，不要泛泛而谈

请严格按照以下 JSON 格式输出，不要输出任何其他内容：
{
  "personaTags": ["标签1", "标签2", "标签3", "标签4"],
  "roastComments": ["吐槽点评1", "吐槽点评2", "吐槽点评3"],
  "styleAnalysis": "发帖风格分析，一段话",
  "score": 37,
  "scoreComment": "评分评语",
  "summary": "一句话总结，要有梗"
}

注意：
- personaTags 是 3-5 个搞笑的人设标签
- roastComments 是 3 条具体的毒舌点评
- score 是 0-100 的整数评分（越低越搞笑）
- scoreComment 是对评分的简短评论
- summary 是一句让人想分享的金句`;
}

/** 调用 DeepSeek 生成吐槽报告 */
export async function generateRoastReport(request: RoastRequest): Promise<RoastReport> {
  const deepseek = getDeepSeekClient();

  const { text } = await generateText({
    model: deepseek('deepseek-chat'),
    prompt: buildRoastPrompt(request),
    temperature: 0.9,
    maxOutputTokens: 1000,
  });

  // 解析 AI 返回的 JSON
  let result: {
    personaTags: string[];
    roastComments: string[];
    styleAnalysis: string;
    score: number;
    scoreComment: string;
    summary: string;
  };

  try {
    // 尝试提取 JSON（可能被 markdown 代码块包裹）
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('AI 返回内容中未找到 JSON');
    }
    result = JSON.parse(jsonMatch[0]);
  } catch {
    // 如果解析失败，返回一个默认的搞笑报告
    result = {
      personaTags: ['神秘用户', '深藏不露', '互联网幽灵', '社恐本恐'],
      roastComments: [
        '你的主页太神秘了，AI 都猜不透你是什么人',
        '这个用户名...让我想起了我那个从不发朋友圈的表哥',
        '你的主页干净得像刚格式化的硬盘',
      ],
      styleAnalysis: '这位用户似乎奉行"少即是多"的哲学，发帖频率约等于我的工资涨幅。',
      score: 50,
      scoreComment: '中规中矩，建议多发点内容让 AI 有槽可吐',
      summary: '你是一个谜一样的存在，连 AI 都对你束手无策',
    };
  }

  // 生成唯一 ID
  const id = `roast_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  return {
    id,
    platform: request.platform,
    username: request.username,
    personaTags: result.personaTags || ['神秘用户'],
    roastComments: result.roastComments || ['AI 一时语塞'],
    styleAnalysis: result.styleAnalysis || '暂无分析',
    score: Math.max(0, Math.min(100, result.score || 50)),
    scoreComment: result.scoreComment || '有待评估',
    summary: result.summary || '你是一个有趣的人',
    createdAt: new Date().toISOString(),
  };
}
