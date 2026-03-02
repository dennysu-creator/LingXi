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
  return api.post<FaceReadingResult>('/api/ai/face-reading', {
    image: imageBase64,
    bazi: baziInfo,
    qimen: qimenInfo,
    date,
  });
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
  return api.post<PetMessageResult>('/api/ai/pet-message', {
    pet: petInfo,
    bazi: baziInfo,
    qimen: qimenInfo,
    type: messageType,
  });
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
  return api.post<FengShuiResult>('/api/ai/feng-shui', {
    lat: latitude,
    lng: longitude,
    heading,
    location: locationName,
    bazi: baziInfo,
    qimen: qimenInfo,
  });
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
  return api.post<OutfitResult>('/api/ai/outfit', {
    bazi: baziInfo,
    qimen: qimenInfo,
    weather,
    face: faceScore,
  });
}

/**
 * 每日運勢
 */
export async function getDailyFortune(
  baziInfo: string,
  qimenInfo: string,
  date: string,
): Promise<DailyFortuneResult> {
  return api.post<DailyFortuneResult>('/api/ai/fortune', {
    bazi: baziInfo,
    qimen: qimenInfo,
    date,
  });
}

/**
 * 占卜解讀（靈籤 + 64 卦）
 */
export async function getDivinationReading(
  type: 'traditional' | 'hexagram',
  data: Record<string, any>,
): Promise<DivinationResult> {
  return api.post<DivinationResult>('/api/ai/divination', {
    type,
    ...data,
  });
}
