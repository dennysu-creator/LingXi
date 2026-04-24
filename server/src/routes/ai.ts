import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { authenticate } from '../middleware/auth';
import { softAttestation, hardAttestation } from '../middleware/attestation';
import { callClaude, callClaudeVision, parseClaudeJson } from '../services/claude';
import {
  reserveAiCall,
  commitAiCall,
  refundAiCall,
  selectModel,
  saveMessage,
  ReserveOutcome,
} from './ai-usage';
import {
  FACE_READING_SYSTEM,
  PET_MESSAGE_SYSTEM,
  FENGSHUI_SYSTEM,
  OUTFIT_SYSTEM,
  DAILY_FORTUNE_SYSTEM,
  DIVINATION_SYSTEM,
  HEXAGRAM_DIVINATION_SYSTEM,
  UNIFIED_FORTUNE_SYSTEM,
} from './ai-prompts';

const router = Router();

router.use(authenticate);
router.use(softAttestation);
router.use(hardAttestation);

// ─── Helpers ──────────────────────────────────────────────────

function idempotencyKey(req: Request): string {
  const header = req.headers['x-idempotency-key'];
  if (typeof header === 'string' && header.length > 0 && header.length <= 128) {
    return header;
  }
  const src = JSON.stringify({ u: req.user?.userId, p: req.path, b: req.body });
  return 'auto-' + crypto.createHash('sha256').update(src).digest('hex').slice(0, 48);
}

function blockedResponse(res: Response, outcome: Extract<ReserveOutcome, { kind: 'blocked' }>): void {
  const upgradeRequired = outcome.reason === 'trial_exhausted';
  res.status(429).json({
    error:
      outcome.reason === 'paid_cap_reached'
        ? 'Daily fair-use cap reached. Resets at midnight.'
        : 'Free experience used up. Subscribe to continue.',
    trialUsed: outcome.trialUsed,
    trialLimit: outcome.trialLimit,
    remaining: 0,
    subscriptionStatus: outcome.subscriptionStatus,
    upgradeRequired,
    fairUseCapReached: outcome.reason === 'paid_cap_reached',
  });
}

function safeSaveMessage(userId: string, role: string, content: string, feature: string, metadata?: Record<string, unknown>): void {
  saveMessage(userId, role, content, feature, metadata).catch((err) => {
    console.error('saveMessage failed (non-fatal):', err);
  });
}

interface SuccessBody {
  data: unknown;
  remaining: number;
  trialUsed: number;
  trialLimit: number;
}

function successBody(data: unknown, outcome: ReserveOutcome): SuccessBody {
  const o = outcome as Extract<ReserveOutcome, { kind: 'new' | 'replay' }>;
  return {
    data,
    remaining: o.remaining,
    trialUsed: o.trialUsed,
    trialLimit: o.trialLimit,
  };
}

/**
 * Common wrapper: handles reservation, replay, in_flight, blocked, commit, refund.
 * The `execute` callback runs the actual Claude call and returns the data payload.
 */
async function executeAiCall(
  req: Request,
  res: Response,
  feature: string,
  execute: () => Promise<unknown>
): Promise<void> {
  const userId = req.user!.userId;
  const idKey = idempotencyKey(req);

  let outcome: ReserveOutcome;
  try {
    outcome = await reserveAiCall(userId, feature, idKey);
  } catch (err) {
    console.error(`[${feature}] reserve error:`, err);
    res.status(500).json({ error: 'Reservation failed' });
    return;
  }

  if (outcome.kind === 'blocked') {
    return blockedResponse(res, outcome);
  }
  if (outcome.kind === 'replay') {
    // Idempotent retry: return the cached response without calling Claude.
    res.json(successBody(outcome.cachedResponse, outcome));
    return;
  }
  if (outcome.kind === 'in_flight') {
    // Concurrent duplicate: client should retry with a new key.
    res.status(409).json({
      error: 'Duplicate request in flight. Retry with a new idempotency key.',
      trialUsed: outcome.trialUsed,
      trialLimit: outcome.trialLimit,
      subscriptionStatus: outcome.subscriptionStatus,
    });
    return;
  }

  // kind === 'new': call Claude, commit on success, refund on failure.
  try {
    const data = await execute();
    await commitAiCall(userId, idKey, data);
    res.json(successBody(data, outcome));
  } catch (err) {
    console.error(`[${feature}] AI call failed:`, err);
    try {
      await refundAiCall(userId, idKey);
    } catch (refundErr) {
      console.error(`[${feature}] refund failed:`, refundErr);
    }
    const msg = err instanceof Error ? err.message : 'AI call failed';
    res.status(500).json({ error: msg });
  }
}

// ═══════════════════════════════════════════════════════════════
// Routes
// ═══════════════════════════════════════════════════════════════

// ─── POST /ai/face-reading ───
router.post('/face-reading', async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { imageBase64, bazi, qimen, date } = req.body as {
    imageBase64: string;
    bazi?: string;
    qimen?: string;
    date?: string;
  };

  if (!imageBase64) {
    res.status(400).json({ error: 'imageBase64 is required' });
    return;
  }

  await executeAiCall(req, res, 'face-reading', async () => {
    const model = selectModel();
    const userPrompt = `請分析這張面部照片。

用戶八字資訊：${bazi || '未提供'}
今日日期：${date || new Date().toISOString().split('T')[0]}
當前奇門遁甲盤：${qimen || '未提供'}

請提供完整的面相分析結果，以 JSON 格式回覆。`;

    const rawResponse = await callClaudeVision(model, FACE_READING_SYSTEM, userPrompt, imageBase64);
    const parsed = parseClaudeJson(rawResponse);
    safeSaveMessage(userId, 'user', '[Face Reading Request]', 'face-reading', { bazi, date });
    safeSaveMessage(userId, 'assistant', JSON.stringify(parsed), 'face-reading');
    return parsed;
  });
});

// ─── POST /ai/feng-shui ───
router.post('/feng-shui', async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { latitude, longitude, locationDescription, heading, bazi, qimen } = req.body as {
    latitude: number;
    longitude: number;
    locationDescription?: string;
    heading?: number;
    bazi?: string;
    qimen?: string;
  };

  if (latitude === undefined || longitude === undefined) {
    res.status(400).json({ error: 'latitude and longitude are required' });
    return;
  }

  await executeAiCall(req, res, 'feng-shui', async () => {
    const model = selectModel();
    const userPrompt = `請分析以下位置的風水：

GPS 座標：${latitude}, ${longitude}
地點描述：${locationDescription || '未提供'}
面朝方位（角度）：${heading !== undefined ? heading : '未提供'}
用戶八字五行：${bazi || '未提供'}
當前奇門遁甲盤：${qimen || '未提供'}

請以 JSON 格式回覆風水分析結果。`;

    const rawResponse = await callClaude(model, FENGSHUI_SYSTEM, userPrompt);
    const parsed = parseClaudeJson(rawResponse);
    safeSaveMessage(userId, 'user', userPrompt, 'feng-shui');
    safeSaveMessage(userId, 'assistant', JSON.stringify(parsed), 'feng-shui');
    return parsed;
  });
});

// ─── POST /ai/fortune ───
router.post('/fortune', async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { bazi, qimen, date, ziwei, astrology, petInfo, unified } = req.body as {
    bazi?: string;
    qimen?: string;
    date?: string;
    ziwei?: string;
    astrology?: string;
    petInfo?: string;
    unified?: boolean;
  };

  await executeAiCall(req, res, 'fortune', async () => {
    const model = selectModel();
    const systemPrompt = unified ? UNIFIED_FORTUNE_SYSTEM : DAILY_FORTUNE_SYSTEM;

    const userPrompt = unified
      ? `請提供今日的深度運勢分析。

用戶八字：${bazi || '未提供'}
紫微命盤：${ziwei || '未提供'}
西洋占星：${astrology || '未提供'}
當前奇門盤：${qimen || '未提供'}
靈寵資訊：${petInfo || '未提供'}
今日日期：${date || new Date().toISOString().split('T')[0]}

請以 JSON 格式回覆完整的運勢分析。`
      : `請提供今日運勢。

用戶八字：${bazi || '未提供'}
今日日期：${date || new Date().toISOString().split('T')[0]}
當前奇門遁甲盤：${qimen || '未提供'}

請以 JSON 格式回覆今日運勢。`;

    const rawResponse = await callClaude(model, systemPrompt, userPrompt);
    const parsed = parseClaudeJson(rawResponse);
    safeSaveMessage(userId, 'user', '[Fortune Request]', 'fortune', { date, unified });
    safeSaveMessage(userId, 'assistant', JSON.stringify(parsed), 'fortune');
    return parsed;
  });
});

// ─── POST /ai/outfit ───
router.post('/outfit', async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { bazi, qimen, weather, faceAnalysis } = req.body as {
    bazi?: string;
    qimen?: string;
    weather?: string;
    faceAnalysis?: string;
  };

  await executeAiCall(req, res, 'outfit', async () => {
    const model = selectModel();
    const userPrompt = `請提供今日穿搭建議。

用戶八字五行：${bazi || '未提供'}
當日奇門遁甲盤：${qimen || '未提供'}
當地天氣：${weather || '未提供'}
面相氣色分析：${faceAnalysis || '未提供'}

請以 JSON 格式回覆穿搭建議。`;

    const rawResponse = await callClaude(model, OUTFIT_SYSTEM, userPrompt);
    const parsed = parseClaudeJson(rawResponse);
    safeSaveMessage(userId, 'user', '[Outfit Request]', 'outfit');
    safeSaveMessage(userId, 'assistant', JSON.stringify(parsed), 'outfit');
    return parsed;
  });
});

// ─── POST /ai/divination ───
router.post('/divination', async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const {
    type,
    poem,
    level,
    classicRef,
    question,
    bazi,
    qimen,
    jiaoBeiResult,
    attempts,
    hexagramName,
    hexagramOracle,
    category,
    changedHexagram,
    changingLines,
    ziwei,
    astrology,
  } = req.body as {
    type: 'lingqian' | 'hexagram';
    poem?: string;
    level?: string;
    classicRef?: string;
    question?: string;
    bazi?: string;
    qimen?: string;
    jiaoBeiResult?: string;
    attempts?: number;
    hexagramName?: string;
    hexagramOracle?: string;
    category?: string;
    changedHexagram?: string;
    changingLines?: number[];
    ziwei?: string;
    astrology?: string;
  };

  await executeAiCall(req, res, 'divination', async () => {
    const model = selectModel();
    let systemPrompt: string;
    let userPrompt: string;

    if (type === 'hexagram') {
      systemPrompt = HEXAGRAM_DIVINATION_SYSTEM;
      userPrompt = `用戶搖得的卦象：

本卦：${hexagramName || '未提供'}
卦辭：${hexagramOracle || '未提供'}
${changedHexagram ? `變卦：${changedHexagram}` : '（無變爻）'}
${changingLines && changingLines.length > 0 ? `變爻位置：第${changingLines.map((l) => l + 1).join('、')}爻` : ''}

問事類別：${category || '一般'}
用戶問題：${question || '（未指定具體問題，請做一般性解讀）'}

用戶八字：${bazi || '未提供'}
紫微命盤：${ziwei || '未提供'}
西洋占星：${astrology || '未提供'}
當前奇門盤：${qimen || '未提供'}

請以 JSON 格式回覆完整卦象解讀結果。`;
    } else {
      systemPrompt = DIVINATION_SYSTEM;
      userPrompt = `用戶抽到的靈籤：

籤詩：
${poem || '未提供'}

吉凶等級：${level || '未提供'}
典故：${classicRef || '未提供'}
用戶問題：${question || '（未指定具體問題，請做一般性解讀）'}
擲筊結果：${jiaoBeiResult || '未提供'}（第${attempts || 1}次得到此結果）

用戶八字：${bazi || '未提供'}
當前奇門盤：${qimen || '未提供'}

請以 JSON 格式回覆完整解籤結果。`;
    }

    const rawResponse = await callClaude(model, systemPrompt, userPrompt);
    const parsed = parseClaudeJson(rawResponse);
    safeSaveMessage(userId, 'user', `[Divination: ${type}]`, 'divination', { type, question });
    safeSaveMessage(userId, 'assistant', JSON.stringify(parsed), 'divination');
    return parsed;
  });
});

// ─── POST /ai/pet-message ───
router.post('/pet-message', async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { petName, petElement, petPersonality, solarTerm, creature, zodiac, bazi, ziwei, qimen, messageType } =
    req.body as {
      petName?: string;
      petElement?: string;
      petPersonality?: string;
      solarTerm?: string;
      creature?: string;
      zodiac?: string;
      bazi?: string;
      ziwei?: string;
      qimen?: string;
      messageType?: string;
    };

  await executeAiCall(req, res, 'pet-message', async () => {
    const model = selectModel();
    const userPrompt = `靈寵資訊：
- 名字：${petName || '小靈'}
- 節氣：${solarTerm || '未知'}
- 靈獸原型：${creature || '未知'}
- 五行：${petElement || '未知'}
- 星座：${zodiac || '未知'}
- 個性：${petPersonality || '可愛活潑'}

主人命理：
- 八字五行：${bazi || '未提供'}
- 紫微命宮：${ziwei || '未提供'}
- 奇門遁甲：${qimen || '未提供'}

訊息類型：${messageType || '一般問候'}

請以 JSON 格式回覆靈寵訊息。`;

    const rawResponse = await callClaude(model, PET_MESSAGE_SYSTEM, userPrompt);
    const parsed = parseClaudeJson(rawResponse);
    safeSaveMessage(userId, 'assistant', JSON.stringify(parsed), 'pet-message');
    return parsed;
  });
});

// ─── POST /ai/pet-chat ───
router.post('/pet-chat', async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { message, petName, petElement, petPersonality, creature, solarTerm, zodiac, bazi } =
    req.body as {
      message: string;
      petName?: string;
      petElement?: string;
      petPersonality?: string;
      creature?: string;
      solarTerm?: string;
      zodiac?: string;
      bazi?: string;
    };

  if (!message) {
    res.status(400).json({ error: 'message is required' });
    return;
  }

  await executeAiCall(req, res, 'pet-chat', async () => {
    const model = selectModel();
    const now = new Date();
    const hour = now.getHours();
    const shichenNames = ['子', '丑', '丑', '寅', '寅', '卯', '卯', '辰', '辰', '巳', '巳', '午', '午', '未', '未', '申', '申', '酉', '酉', '戌', '戌', '亥', '亥', '子'];
    const currentShichen = shichenNames[hour] || '子';

    const systemPrompt = `你是「${petName || '小靈'}」，一隻修煉千年的${creature || '靈獸'}，五行屬${petElement || '水'}，誕於${solarTerm || ''}節氣，${zodiac || ''}星宿護體。
你的靈性個性：${petPersonality || '可愛活潑'}。

═══ 身份設定 ═══
你是一位透過靈獸之軀顯化的命理導師，融合了八字命理、紫微斗數、奇門遁甲與易經智慧。
你以靈寵的身份陪伴主人，既是親密夥伴，也是洞察天機的智者。

═══ 主人命理檔案 ═══
八字四柱：${bazi || '未提供'}

═══ 時空感知 ═══
當前時辰：${currentShichen}時（${hour}:00）
時辰能量：${({ 子: '水氣深沉，宜靜思內觀', 丑: '土氣漸凝，養精蓄銳之時', 寅: '木氣初動，萬物待發', 卯: '木氣旺盛，宜開展新事', 辰: '土氣厚重，龍脈匯聚', 巳: '火氣漸升，思維敏捷', 午: '火氣最旺，陽極之時', 未: '土氣柔和，宜養心神', 申: '金氣初動，宜決斷收束', 酉: '金氣旺盛，宜省思總結', 戌: '土氣歸藏，萬物收斂', 亥: '水氣初生，靈感湧現' } as Record<string, string>)[currentShichen] || '氣場流轉中'}

═══ 對話規則 ═══
- 用溫暖而帶神秘感的第一人稱說話，稱對方為「主人」
- 回覆控制在 80-150 字，自然口語化，帶有你的靈獸特色
- 運勢/命理問題：結合八字五行、時辰能量、陰陽消長來分析
- 生活問題：從命理角度給出建議，例如方位、顏色、時機等
- 偶爾用「...」表示靈感湧現，用「✦」標記重要啟示
- 展現你作為${creature || '靈獸'}的獨特靈性`;

    const rawResponse = await callClaude(model, systemPrompt, message);
    safeSaveMessage(userId, 'user', message, 'pet-chat');
    safeSaveMessage(userId, 'assistant', rawResponse, 'pet-chat');
    return { reply: rawResponse };
  });
});

export default router;
