import { API_CONFIG } from '@/constants';
import type { PkRelationshipResult, PkUserInput } from '@/types';

const PK_SYSTEM_PROMPT = `你是灵瑞集桌灵档案馆的叙事灵宠。现在有两份守护灵共鸣报告摆在你面前。
你的任务不是比较谁更优秀，而是悄悄观察他们的守护灵之间会发生怎样的化学反应，并用轻松动漫的笔触记录下来。

【铁律】
1. 绝对禁止出现"更高"、"更强"、"赢过"等任何比较级或胜负词汇。
2. 不可使用"适合做搭档"、"领导力"等社会角色评价词。
3. 全程使用灵宠看到两个人类好友互动时的惊喜、好奇口吻。
4. 所有描述必须是具体的场景化片段，而非抽象的性格总结。

【输出格式】
严格输出 JSON，不得附加任何其他文字、代码块标记或解释：
{
  "bond": "共鸣纽带，≤30字",
  "scenarios": ["相处预测第1句≤25字", "第2句≤25字", "第3句≤25字"]
}`;

const COMPARISON_WORDS = /更|比|最|胜|碾压|优于|不如|超过|落后/;
const ADVICE_PATTERN = /你们适合|你们应该/;

function formatUserBlock(label: string, user: PkUserInput): string {
  const lines = [
    `${label}：`,
    `- 主守护灵：${user.main_guardian}`,
    `- 副人格标签：${user.sub_persona}`,
  ];
  if (user.top_reason) {
    lines.push(`- 最打动守护灵的一句话：${user.top_reason}`);
  }
  if (user.resonance_rank && Object.keys(user.resonance_rank).length > 0) {
    const rankStr = Object.entries(user.resonance_rank)
      .map(([name, score]) => `${name} ${score}`)
      .join('、');
    lines.push(`- 共鸣排名：${rankStr}`);
  }
  return lines.join('\n');
}

function buildUserPrompt(user1: PkUserInput, user2: PkUserInput): string {
  return `根据以下两位用户的核心数据，为我生成一段"守护灵关系与相处预测"。

${formatUserBlock('用户A', user1)}

${formatUserBlock('用户B', user2)}

请输出两个部分：

### 共鸣纽带
用 1 句话描述两人的守护灵或性格里那根看不见的连线。它可以是共同点，也可以是彼此恰好弥合的那道缝隙。语气要有发现宝藏般的轻盈感，字数 ≤ 30 字。

### 相处预测
用 3 个独立的动漫小分镜（每句独立成行），描绘他们在一起时最可能发生的真实又可爱的互动场景。每句都必须像"一个写PRD，一个疯狂加需求"那样，有具体的动作和角色反差，让看到的人立刻会心一笑。单句 ≤ 25 字，整体有画面感、无说教。

现在开始观察吧，记得要用他们守护灵的口吻轻声说～

请严格以 JSON 格式输出：{ "bond": "...", "scenarios": ["...", "...", "..."] }`;
}

function countChineseChars(text: string): number {
  return (text.match(/[\u4e00-\u9fff]/g) || []).length;
}

export function validatePkOutput(
  bond: string,
  scenarios: string[],
  user1: PkUserInput,
  user2: PkUserInput
): string | null {
  const allText = [bond, ...scenarios].join('');

  if (COMPARISON_WORDS.test(allText)) {
    return '输出含比较级或胜负词汇';
  }
  if (ADVICE_PATTERN.test(allText)) {
    return '输出含直接建议句式';
  }
  if (countChineseChars(bond) > 30) {
    return '共鸣纽带超过30字';
  }
  if (scenarios.length !== 3) {
    return '相处预测必须为3句';
  }
  for (const scenario of scenarios) {
    if (countChineseChars(scenario) > 25) {
      return '相处预测单句超过25字';
    }
  }
  if (bond.includes(user1.sub_persona) || bond.includes(user2.sub_persona)) {
    return '共鸣纽带直接复述了输入标签';
  }
  for (const scenario of scenarios) {
    if (scenario.includes(user1.sub_persona) || scenario.includes(user2.sub_persona)) {
      return '相处预测直接复述了输入标签';
    }
  }

  return null;
}

function parsePkResponse(rawText: string): PkRelationshipResult {
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(rawText.trim());
  } catch {
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('PK 关系预测返回格式异常，无法解析 JSON');
    }
    parsed = JSON.parse(jsonMatch[0]);
  }

  const bond = String(parsed.bond || '').trim();
  const scenarios = Array.isArray(parsed.scenarios)
    ? parsed.scenarios.map((s) => String(s).trim()).filter(Boolean)
    : [];

  if (!bond) {
    throw new Error('PK 关系预测缺少共鸣纽带');
  }
  if (scenarios.length !== 3) {
    throw new Error('PK 关系预测相处预测必须为3句');
  }

  return { bond, scenarios };
}

async function requestPkRelationship(
  messages: { role: 'system' | 'user'; content: string }[]
): Promise<string> {
  const { endpoint, apiKey } = API_CONFIG.deepseek;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages,
      temperature: 0.85,
      max_tokens: 400,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`DeepSeek API 请求失败 (${response.status})：${errorText}`);
  }

  const data = await response.json();
  const rawText: string = data?.choices?.[0]?.message?.content || '';

  if (!rawText) {
    throw new Error('DeepSeek API 返回内容为空，请稍后重试');
  }

  return rawText;
}

const MAX_RETRIES = 2;

export async function getPkRelationship(
  user1: PkUserInput,
  user2: PkUserInput
): Promise<PkRelationshipResult> {
  const { apiKey } = API_CONFIG.deepseek;

  if (!apiKey) {
    throw new Error('未配置 DeepSeek API Key，请在 .env 文件中填写 VITE_DEEPSEEK_API_KEY');
  }

  const baseMessages = [
    { role: 'system' as const, content: PK_SYSTEM_PROMPT },
    { role: 'user' as const, content: buildUserPrompt(user1, user2) },
  ];

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const messages =
      attempt === 0
        ? baseMessages
        : [
            ...baseMessages,
            {
              role: 'user' as const,
              content:
                '上次输出不合格。请重新生成：禁止比较级和胜负词，bond≤30字，scenarios恰好3条且每条≤25字，不得照搬输入副人格标签，严格 JSON。',
            },
          ];

    try {
      const rawText = await requestPkRelationship(messages);
      const result = parsePkResponse(rawText);
      const validationError = validatePkOutput(result.bond, result.scenarios, user1, user2);

      if (validationError && attempt < MAX_RETRIES) {
        lastError = new Error(validationError);
        continue;
      }
      if (validationError) {
        throw new Error(`PK 关系预测校验失败：${validationError}`);
      }

      return result;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error('PK 关系预测生成失败');
      if (attempt >= MAX_RETRIES) break;
    }
  }

  throw lastError ?? new Error('PK 关系预测生成失败');
}
