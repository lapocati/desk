// 灵宠类型
export type SpiritType = 'wisdom' | 'vitality' | 'healing' | 'fantasy' | 'guardian';

// 灵宠信息
export interface SpiritInfo {
  type: SpiritType;
  name: string;
  title: string;
  description: string;
  focusItems: string[];
  psychologicalMapping: string[];
  languageStyle: string;
  color: string;
  emoji: string;
}

// 隐藏分池
export interface SoulPool {
  wisdom: number;
  vitality: number;
  healing: number;
  fantasy: number;
  guardian: number;
}

// 检测到的物品
export interface DetectedObject {
  name: string;
  category: SpiritType;
  position: { x: number; y: number };
  confidence: number;
}

// 16宫格数值
export interface GridValues {
  grid: number[][]; // 4x4网格
}

// 视觉分析结果
export interface VisualAnalysisResult {
  objects: DetectedObject[];
  gridValues: GridValues;
  hiddenDoubts: string;
  spiritScores: SoulPool;
  summary: string;
}

// 对话消息
export interface DialogueMessage {
  role: 'spirit' | 'user';
  speaker: SpiritType;
  content: string;
  timestamp: number;
}

// 分池调整
export interface SoulPoolAdjustment {
  spirit: SpiritType;
  delta: number;
  reason: string;
}

// 插话彩蛋
export interface Interjection {
  speaker: SpiritType;
  message: string;
}

// 对话响应
export interface DialogueResponse {
  speaker: SpiritType;
  message: string;
  question?: string;
  soulPoolAdjustment?: SoulPoolAdjustment;
  isComplete: boolean;
  interjection?: Interjection;
}

// 观察记录
export interface ObservationRecord {
  evidenceChain: string;
  spiritObservation: string;
  scientificAdvice: string[];
  spiritAdvice: string[];
}

// 最终结果
export interface FinalResult {
  primarySpirit: SpiritType;
  primaryResonance: number;
  top3Spirits: Array<{
    spirit: SpiritType;
    resonance: number;
  }>;
  personalityId: string;
  personalityTag: string;
  personalityTagline: string;
  dynamicPersonality: string;
  resonanceReasons: string[];
}

// 照片历史项
export interface PhotoHistoryItem {
  photoUrl: string;
  timestamp: number;
  result: FinalResult;
}

// PK Prompt 输入
export interface PkUserInput {
  main_guardian: string;
  sub_persona: string;
  top_reason?: string;
  resonance_rank?: Record<string, number>;
}

// PK 关系预测结果
export interface PkRelationshipResult {
  bond: string;
  scenarios: string[];
}

// 应用状态
export interface AppState {
  stage: 'home' | 'upload' | 'loading' | 'dialogue' | 'observation' | 'result' | 'compare';
  photoUrl: string | null;
  photoHistory: PhotoHistoryItem[];
  visualAnalysis: VisualAnalysisResult | null;
  dialogueHistory: DialogueMessage[];
  currentRound: number;
  currentSpeaker: SpiritType | null;
  hiddenSoulPool: SoulPool;
  observationRecord: ObservationRecord | null;
  isGeneratingObservation: boolean;
  observationError: string | null;
  finalResult: FinalResult | null;
  isGeneratingResult: boolean;
  resultError: string | null;
  isLoading: boolean;
  loadingMessage: string;
  error: string | null;
  friendResult: FinalResult | null;
  pkRelationship: PkRelationshipResult | null;
  isAnalyzingFriend: boolean;
  friendAnalysisError: string | null;
  isGeneratingPk: boolean;
  pkError: string | null;
}

// 主人格触发条件
export interface PersonalityTriggerCondition {
  wisdomMin?: number;
  vitalityMin?: number;
  healingMin?: number;
  fantasyMin?: number;
  guardianMin?: number;
  wisdomMax?: number;
  vitalityMax?: number;
  healingMax?: number;
  fantasyMax?: number;
  guardianMax?: number;
  requiresLowVariance?: boolean;
  logic?: string;
}

// 主人格定义
export interface PersonalityDefinition {
  id: string;
  name: string;
  tagline: string;
  description: string;
  triggerCondition: PersonalityTriggerCondition;
  primarySpirit: SpiritType;
  secondarySpirit: SpiritType;
}