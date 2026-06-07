import type { SpiritType, TimelineComment } from '@/types';

// 中文名 → SpiritType 反查表（用于头像渲染）
export const SPIRIT_NAME_TO_TYPE: Record<string, SpiritType> = {
  智慧灵: 'wisdom',
  活力灵: 'vitality',
  治愈灵: 'healing',
  奇想灵: 'fantasy',
  守护灵: 'guardian',
};

// 开场文案
export const TIMELINE_INTRO = '灵宠们整理出了关于你的观察记录……';

// 节点一：久远以前（固定文案）
export const NODE_LONG_AGO: TimelineComment[] = [
  { spirit: '治愈灵', message: '这里曾有很多还没说出口的情绪。' },
  { spirit: '守护灵', message: '有些角落一直被悄悄占据着。' },
  { spirit: '奇想灵', message: '灵感碎片散落在各处，像星星一样。' },
];

// 节点二：第一次发现你（固定文案，不调用大模型）
export const NODE_FIRST_MEET: TimelineComment[] = [
  { spirit: '智慧灵', message: '第一次见面时，我花了很久才找到你的主工作区。' },
  { spirit: '活力灵', message: '我当时觉得你一定同时在推进很多事情。' },
  { spirit: '治愈灵', message: '没关系，很多人都会这样。' },
];

// 节点三：此刻（LLM 失败时的回退文案）
export const NODE_NOW_FALLBACK: TimelineComment[] = [
  {
    spirit: '智慧灵',
    message: '我发现那些翻开的书还停留在不同章节，最近似乎有很多事情同时占据着你的注意力。',
  },
  {
    spirit: '奇想灵',
    message: '那张被反复涂改的纸让我觉得，一个新的想法正在慢慢成形。',
  },
  {
    spirit: '守护灵',
    message: '咖啡杯出现得有些频繁，我猜你最近已经连续努力了很长时间。',
  },
];

// 节点四：未来
export const NODE_FUTURE_QUESTION = '？';
export const NODE_FUTURE_REVEAL = '连我们也还不知道。';
export const NODE_FUTURE_FAREWELL: TimelineComment[] = [
  { spirit: '智慧灵', message: '不过，如果你愿意的话。' },
  { spirit: '活力灵', message: '下次再见面时。' },
  { spirit: '治愈灵', message: '我们会继续观察。' },
  { spirit: '守护灵', message: '也会继续陪伴。' },
  { spirit: '奇想灵', message: '说不定还能发现新的故事。' },
];

// 收尾
export const TIMELINE_ARCHIVED = '本次观察记录已归档';
export const TIMELINE_RETURN_LABEL = '返回灵居';

// 节点标题
export const TIMELINE_NODE_TITLES = {
  longAgo: '久远以前',
  firstMeet: '第一次发现你',
  now: '此刻',
  future: '未来',
} as const;
