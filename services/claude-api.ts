// ═══════════════════════════════════════
// Claude API 串接層
// 所有 AI 呼叫透過 Cloud Run 後端代理
// 前端不存放 Claude API Key
// ═══════════════════════════════════════

import api from '@/services/api-client';

// ─── 型別定義 ───

export interface FaceReadingResult {
  fortune_level: string;
  overall_score: number;
  features: {
    forehead: { score: number; description: string };
    eyebrows: { score: number; description: string };
    eyes: { score: number; description: string };
    nose: { score: number; description: string };
    mouth: { score: number; description: string };
  };
  ai_reading: string;
  lucky_item: {
    name: string;
    element: string;
    reason: string;
    emoji: string;
  };
  lucky_color: string;
  lucky_direction: string;
  lucky_number: string;
}

export interface PetMessageResult {
  message: string;
  mood: 'happy' | 'excited' | 'sleepy' | 'worried' | 'energetic';
  tip: string;
}

export interface FengShuiResult {
  location_analysis: string;
  lucky_directions: string[];
  unlucky_directions: string[];
  unlucky_reason: string;
  tips: { icon: string; text: string }[];
  seat_advice: string;
}

export interface OutfitResult {
  element_analysis: {
    excess: string;
    deficient: string;
    strategy: string;
  };
  recommendations: {
    icon: string;
    name: string;
    reason: string;
    element: string;
  }[];
  color_palette: {
    recommended: { color: string; name: string }[];
    avoid: { color: string; name: string; reason: string }[];
  };
  pet_bonus: string;
}

export interface DailyFortuneResult {
  fortune_level: string;
  scores: {
    wealth: number;
    love: number;
    career: number;
    health: number;
  };
  summary: string;
  advice: string;
  warning: string | null;
}

export interface DivinationResult {
  interpretation: string;
  directAnswer: string;
  advice: string;
  timing: string;
  direction: string;
  luckyElement: string;
}

// ─── AI 回傳統一格式 ───

interface AiResponse<T> {
  data: T;
  remaining?: number;
}

/** 快取最近一次各 AI 端點回傳的剩餘次數 */
const _lastRemaining: Record<string, number | undefined> = {};
export function getLastRemaining(endpoint: string): number | undefined {
  return _lastRemaining[endpoint];
}

// ─── API 呼叫函式 ───

/**
 * 面相分析（Claude Vision via Cloud Run）
 */
export async function analyzeFace(
  imageBase64: string,
  baziInfo: string,
  qimenInfo: string,
  date: string,
): Promise<FaceReadingResult> {
  const result = await api.post<AiResponse<FaceReadingResult>>('/ai/face-reading', {
    imageBase64,
    bazi: baziInfo,
    qimen: qimenInfo,
    date,
  });
  _lastRemaining['face-reading'] = result.remaining;
  return result.data;
}

/**
 * 靈寵推播訊息生成
 */
export async function generatePetMessage(
  petInfo: { name: string; type: string; element: string; level: number },
  baziInfo: string,
  qimenInfo: string,
  messageType: 'morning' | 'noon' | 'evening' | 'special',
): Promise<PetMessageResult> {
  const result = await api.post<AiResponse<PetMessageResult>>('/ai/pet-message', {
    petName: petInfo.name,
    petElement: petInfo.element,
    creature: petInfo.type,
    bazi: baziInfo,
    qimen: qimenInfo,
    messageType,
  });
  _lastRemaining['pet-message'] = result.remaining;
  return result.data;
}

/**
 * GPS 風水分析
 */
export async function analyzeFengShui(
  latitude: number,
  longitude: number,
  heading: number,
  locationName: string,
  baziInfo: string,
  qimenInfo: string,
): Promise<FengShuiResult> {
  const result = await api.post<AiResponse<FengShuiResult>>('/ai/feng-shui', {
    latitude,
    longitude,
    heading,
    locationDescription: locationName,
    bazi: baziInfo,
    qimen: qimenInfo,
  });
  _lastRemaining['feng-shui'] = result.remaining;
  return result.data;
}

/**
 * 穿搭建議
 */
export async function getOutfitAdvice(
  baziInfo: string,
  qimenInfo: string,
  weather: { temp: number; condition: string },
  faceScore?: { nose: number },
): Promise<OutfitResult> {
  const result = await api.post<AiResponse<OutfitResult>>('/ai/outfit', {
    bazi: baziInfo,
    qimen: qimenInfo,
    weather: weather ? `${weather.temp}°C, ${weather.condition}` : undefined,
    faceAnalysis: faceScore ? JSON.stringify(faceScore) : undefined,
  });
  _lastRemaining['outfit'] = result.remaining;
  return result.data;
}

/**
 * 每日運勢
 */
export async function getDailyFortune(
  baziInfo: string,
  qimenInfo: string,
  date: string,
): Promise<DailyFortuneResult> {
  const result = await api.post<AiResponse<DailyFortuneResult>>('/ai/fortune', {
    bazi: baziInfo,
    qimen: qimenInfo,
    date,
  });
  _lastRemaining['fortune'] = result.remaining;
  return result.data;
}

/**
 * 占卜解讀（靈籤 + 64 卦）
 */
export async function getDivinationReading(
  type: 'traditional' | 'hexagram',
  data: Record<string, any>,
): Promise<DivinationResult> {
  const backendType = type === 'traditional' ? 'lingqian' : 'hexagram';
  const result = await api.post<AiResponse<DivinationResult>>('/ai/divination', {
    type: backendType,
    ...data,
  });
  _lastRemaining['divination'] = result.remaining;
  return result.data;
}
