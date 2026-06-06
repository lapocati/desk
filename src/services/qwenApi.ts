import { API_CONFIG } from '@/constants';
import type { VisualAnalysisResult, SpiritType, DetectedObject } from '@/types';

interface QwenGridCell {
  row: number;
  col: number;
  score_wisdom: number;
  score_vitality: number;
  score_healing: number;
  score_fantasy: number;
  score_guardian: number;
}

interface QwenCategory {
  category: string;
  items: string[];
  count: number;
  note: string;
}

interface QwenRawResult {
  item_analysis: {
    categories: QwenCategory[];
    overall_impression: string;
  };
  grid_4x4: QwenGridCell[];
  hidden_clues: string;
}

const VISION_SYSTEM_PROMPT = `你是一个名为"灵瑞集·桌灵档案馆"的桌面空间分析师，擅长从用户上传的桌面或生活空间照片中，提取出物品分布、空间能量场以及值得深入探索的行为线索。

你的任务：严格分析用户提供的图片，并以 JSON 格式输出以下三项结构化数据：
1. 物品分类与整体印象
2. 4x4 空间格子的五维初始得分（对应 智慧/秩序、活力/行动、治愈/舒适、奇想/创意、守护/稳定）
3. 隐藏桌面疑点文本（hidden_clues），这段文字不会展示给用户，将传递给下一轮对话模型

## 图片分析规则
- 将画面均匀切分为 4 行 × 4 列的网格（共 16 格），行号从上到下为 0~3，列号从左到右为 0~3。
- 对每个格子，根据其中的物品、整洁度、使用痕迹、视觉重心等，推测该区域在五个维度的初始得分（0~100 的整数）。
  - **智慧/秩序 (score_wisdom)**：书籍、笔记、逻辑性物品、整洁有序的程度。
  - **活力/行动 (score_vitality)**：电子产品、运动相关物品、正在进行的项目痕迹、能量感。
  - **治愈/舒适 (score_healing)**：绿植、柔和光线、温馨摆件、让人放松的元素。
  - **奇想/创意 (score_fantasy)**：手办、艺术品、非常规布置、个性装饰、灵感触发物。
  - **守护/稳定 (score_guardian)**：收纳工具、固定布局、防御性摆放（如靠墙堆放）、安全感元素。
- 物品分类应聚焦于能反映生活/工作习惯的类别，如：电子设备、书籍文具、饮食相关、装饰摆件、收纳用品、个人护理等。给每个类别列出典型物品、数量与简短备注。
- **隐藏桌面疑点 (hidden_clues)** 必须是一段中文文本，专门捕捉图片中那些"看似矛盾"、"值得追问"、"透露生活习惯"的细节。这段文字将被下一轮对话模型用来生成首个探索性问题，它必须是观察性的、不做结论，仅提供线索。

## 输出要求
- 严格输出 JSON，不要添加任何 Markdown 代码块标记，不要输出任何解释性文字，只输出纯 JSON 对象。
- JSON 结构如下，必须包含所有字段，且 grid_4x4 数组必须包含 16 个元素：

{
  "item_analysis": {
    "categories": [
      {"category": "类别名称", "items": ["物品1", "物品2"], "count": 数量, "note": "备注"}
    ],
    "overall_impression": "一句话整体氛围描述"
  },
  "grid_4x4": [
    {
      "row": 0, "col": 0,
      "score_wisdom": 0,
      "score_vitality": 0,
      "score_healing": 0,
      "score_fantasy": 0,
      "score_guardian": 0
    }
  ],
  "hidden_clues": "桌面疑点描述文本"
}

现在，请分析用户上传的图片。`;

const CATEGORY_TO_SPIRIT: Record<string, SpiritType> = {
  '书籍文具': 'wisdom',
  '书籍': 'wisdom',
  '文具': 'wisdom',
  '笔记': 'wisdom',
  '电子设备': 'vitality',
  '电子产品': 'vitality',
  '数码产品': 'vitality',
  '饮食相关': 'guardian',
  '食物饮料': 'guardian',
  '水杯': 'guardian',
  '药品': 'guardian',
  '装饰摆件': 'fantasy',
  '手办': 'fantasy',
  '艺术品': 'fantasy',
  '灵感': 'fantasy',
  '收纳用品': 'guardian',
  '个人护理': 'guardian',
  '照片': 'healing',
  '情感': 'healing',
  '绿植': 'healing',
};

function mapCategoryToSpirit(categoryName: string): SpiritType {
  for (const [key, spirit] of Object.entries(CATEGORY_TO_SPIRIT)) {
    if (categoryName.includes(key)) return spirit;
  }
  return 'wisdom';
}

function aggregateGridScores(grid: QwenGridCell[]) {
  const totals = { wisdom: 0, vitality: 0, healing: 0, fantasy: 0, guardian: 0 };
  for (const cell of grid) {
    totals.wisdom += cell.score_wisdom;
    totals.vitality += cell.score_vitality;
    totals.healing += cell.score_healing;
    totals.fantasy += cell.score_fantasy;
    totals.guardian += cell.score_guardian;
  }
  const count = grid.length || 1;
  return {
    wisdom: Math.round(totals.wisdom / count),
    vitality: Math.round(totals.vitality / count),
    healing: Math.round(totals.healing / count),
    fantasy: Math.round(totals.fantasy / count),
    guardian: Math.round(totals.guardian / count),
  };
}

function buildObjects(categories: QwenCategory[]): DetectedObject[] {
  const objects: DetectedObject[] = [];
  categories.forEach((cat, catIdx) => {
    cat.items.forEach((item, itemIdx) => {
      objects.push({
        name: item,
        category: mapCategoryToSpirit(cat.category),
        position: {
          x: Math.round(((catIdx * 20 + itemIdx * 5) % 90) + 5),
          y: Math.round(((catIdx * 15 + itemIdx * 10) % 80) + 10),
        },
        confidence: 0.85,
      });
    });
  });
  return objects;
}

function compressImage(dataUrl: string, maxWidth = 1920, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('无法创建 canvas 上下文'));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => reject(new Error('图片加载失败'));
    img.src = dataUrl;
  });
}

export async function analyzeImage(
  photoUrl: string,
  signal?: AbortSignal
): Promise<VisualAnalysisResult> {
  const { endpoint, apiKey } = API_CONFIG.qwen;

  if (!apiKey) {
    throw new Error('未配置 Qwen API Key，请在 .env 文件中填写 VITE_QWEN_API_KEY');
  }

  const originalLength = photoUrl.length;
  const compressedUrl = await compressImage(photoUrl);

  // photoUrl is a data URL (base64); extract the base64 part
  const base64Data = compressedUrl.includes(',') ? compressedUrl.split(',')[1] : compressedUrl;
  const mimeMatch = compressedUrl.match(/data:([^;]+);/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';

  // DashScope native multimodal format: messages live inside `input`, content uses {image:...}/{text:...}
  const requestBody = {
    model: 'qwen-vl-plus',
    input: {
      messages: [
        {
          role: 'user',
          content: [
            { image: `data:${mimeType};base64,${base64Data}` },
            { text: VISION_SYSTEM_PROMPT },
          ],
        },
      ],
    },
    parameters: {},
  };

  const requestStart = Date.now();
  // #region agent log
  fetch('http://127.0.0.1:7911/ingest/801965d5-3f5c-4d14-80b2-cf170cfa8be7',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'c6a3d3'},body:JSON.stringify({sessionId:'c6a3d3',runId:'loading-fix',hypothesisId:'A-B',location:'qwenApi.ts:request-body',message:'Qwen request prepared',data:{endpoint,originalLength,compressedLength:base64Data?.length??0,mimeType},timestamp:Date.now()})}).catch(()=>{});
  // #endregion

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(requestBody),
    signal,
  });

  const elapsedMs = Date.now() - requestStart;
  // #region agent log
  fetch('http://127.0.0.1:7911/ingest/801965d5-3f5c-4d14-80b2-cf170cfa8be7',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'c6a3d3'},body:JSON.stringify({sessionId:'c6a3d3',runId:'loading-fix',hypothesisId:'A-D',location:'qwenApi.ts:response-status',message:'Qwen API response status',data:{status:response.status,ok:response.ok,elapsedMs},timestamp:Date.now()})}).catch(()=>{});
  // #endregion

  if (!response.ok) {
    const errorText = await response.text();
    // #region agent log
    fetch('http://127.0.0.1:7911/ingest/801965d5-3f5c-4d14-80b2-cf170cfa8be7',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'c6a3d3'},body:JSON.stringify({sessionId:'c6a3d3',runId:'loading-fix',hypothesisId:'C',location:'qwenApi.ts:error-body',message:'Qwen API error response',data:{status:response.status,errorText:errorText.slice(0,500),elapsedMs},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    throw new Error(`Qwen API 请求失败 (${response.status})：${errorText}`);
  }

  const data = await response.json();
  const rawText: string =
    data?.output?.choices?.[0]?.message?.content?.[0]?.text ||
    data?.choices?.[0]?.message?.content ||
    '';
  // #region agent log
  fetch('http://127.0.0.1:7911/ingest/801965d5-3f5c-4d14-80b2-cf170cfa8be7',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'c6a3d3'},body:JSON.stringify({sessionId:'c6a3d3',runId:'loading-fix',hypothesisId:'A-D',location:'qwenApi.ts:raw-response',message:'Qwen API success',data:{outputKeys:Object.keys(data),hasOutput:!!data?.output,rawTextLength:rawText.length,elapsedMs},timestamp:Date.now()})}).catch(()=>{});
  // #endregion

  if (!rawText) {
    throw new Error('Qwen API 返回内容为空，请稍后重试');
  }

  let parsed: QwenRawResult;
  try {
    parsed = JSON.parse(rawText.trim());
  } catch {
    // Try to extract JSON from possible surrounding text
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Qwen API 返回格式异常，无法解析 JSON');
    }
    parsed = JSON.parse(jsonMatch[0]);
  }

  const spiritScores = aggregateGridScores(parsed.grid_4x4 || []);
  const objects = buildObjects(parsed.item_analysis?.categories || []);

  const gridValues = {
    grid: [
      [0, 1, 2, 3].map((col) => {
        const cell = parsed.grid_4x4.find((c) => c.row === 0 && c.col === col);
        return cell ? cell.score_wisdom : 0;
      }),
      [0, 1, 2, 3].map((col) => {
        const cell = parsed.grid_4x4.find((c) => c.row === 1 && c.col === col);
        return cell ? cell.score_vitality : 0;
      }),
      [0, 1, 2, 3].map((col) => {
        const cell = parsed.grid_4x4.find((c) => c.row === 2 && c.col === col);
        return cell ? cell.score_healing : 0;
      }),
      [0, 1, 2, 3].map((col) => {
        const cell = parsed.grid_4x4.find((c) => c.row === 3 && c.col === col);
        return cell ? cell.score_guardian : 0;
      }),
    ],
  };

  return {
    objects,
    gridValues,
    hiddenDoubts: parsed.hidden_clues || '',
    spiritScores,
    summary: parsed.item_analysis?.overall_impression || '',
  };
}
