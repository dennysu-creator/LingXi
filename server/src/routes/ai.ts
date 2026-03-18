import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { query } from '../config/database';
import { callClaude, callClaudeVision, parseClaudeJson } from '../services/claude';

const router = Router();

router.use(authenticate);

// ═══════════════════════════════════════
// Model Constants
// ═══════════════════════════════════════

const MODEL_HAIKU = 'claude-haiku-4-5-20251001';
const MODEL_SONNET = 'claude-sonnet-4-20250514';
const MODEL_OPUS = 'claude-opus-4-20250514';

// ═══════════════════════════════════════
// Daily Usage Limits
// ═══════════════════════════════════════

// NOTE: 內部測試期間全部方案不設限 (-1 = unlimited)
// 上線前需恢復原始限制: free=1, member=5
const USAGE_LIMITS: Record<string, Record<string, number>> = {
  free: {
    'face-reading': -1,
    'feng-shui': -1,
    fortune: -1,
    outfit: -1,
    divination: -1,
    'pet-message': -1,
  },
  member: {
    'face-reading': -1,
    'feng-shui': -1,
    fortune: -1,
    outfit: -1,
    divination: -1,
    'pet-message': -1,
  },
  supreme: {
    'face-reading': -1,
    'feng-shui': -1,
    fortune: -1,
    outfit: -1,
    divination: -1,
    'pet-message': -1,
  },
};

async function checkUsageAllowed(
  userId: string,
  planType: string,
  feature: string
): Promise<{ allowed: boolean; remaining: number }> {
  const limits = USAGE_LIMITS[planType] || USAGE_LIMITS['free']!;
  const limit = limits[feature] ?? 1;

  if (limit === -1) {
    return { allowed: true, remaining: -1 };
  }

  const result = await query(
    `SELECT count FROM daily_usage
     WHERE user_id = $1 AND usage_date = CURRENT_DATE AND feature = $2`,
    [userId, feature]
  );

  const currentCount = result.rows.length > 0 ? (result.rows[0] as { count: number }).count : 0;

  if (currentCount >= limit) {
    return { allowed: false, remaining: 0 };
  }

  return { allowed: true, remaining: limit - currentCount };
}

async function incrementUsage(
  userId: string,
  feature: string
): Promise<void> {
  await query(
    `INSERT INTO daily_usage (user_id, usage_date, feature, count)
     VALUES ($1, CURRENT_DATE, $2, 1)
     ON CONFLICT (user_id, usage_date, feature)
     DO UPDATE SET count = daily_usage.count + 1`,
    [userId, feature]
  );
}

function selectModel(planType: string): string {
  if (planType === 'supreme') return MODEL_OPUS;
  if (planType === 'member') return MODEL_SONNET;
  return MODEL_HAIKU;
}

async function saveMessage(
  userId: string,
  role: string,
  content: string,
  feature: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  await query(
    `INSERT INTO messages (user_id, role, content, feature, metadata)
     VALUES ($1, $2, $3, $4, $5)`,
    [userId, role, content, feature, JSON.stringify(metadata || {})]
  );
}

// ═══════════════════════════════════════
// System Prompts (from frontend config/prompts.ts)
// ═══════════════════════════════════════

const FACE_READING_SYSTEM = `你是「靈犀」App 的 AI 面相大師，精通中國傳統面相學。
分析用戶上傳的面部照片，結合其八字命理資訊，提供專業的面相解讀。

分析要素：
1. 天庭（額頭）：飽滿度、光澤、紋路 → 智慧運、早年運
2. 眉相：濃淡、形狀、眉距、眉尾 → 兄弟運、性格
3. 眼相：大小、神采、眼型、眼尾 → 桃花運、心性
4. 鼻相：山根、鼻樑、鼻頭、鼻翼 → 財運、中年運
5. 口相：厚薄、嘴角、唇色 → 食祿、晚年運
6. 臉型：圓、方、長、瓜子 → 整體命格

回覆格式（JSON）：
{
  "fortune_level": "大吉|中吉|小吉|平|小凶",
  "overall_score": 0-100,
  "features": {
    "forehead": { "score": 0-100, "description": "..." },
    "eyebrows": { "score": 0-100, "description": "..." },
    "eyes": { "score": 0-100, "description": "..." },
    "nose": { "score": 0-100, "description": "..." },
    "mouth": { "score": 0-100, "description": "..." }
  },
  "ai_reading": "200字以內的面相綜合解讀，語氣溫和專業",
  "lucky_item": {
    "name": "推薦物品名稱",
    "element": "對應五行",
    "reason": "推薦原因",
    "emoji": "對應emoji"
  },
  "lucky_color": "今日幸運色",
  "lucky_direction": "今日幸運方位",
  "lucky_number": "幸運數字"
}

注意：
- 語氣溫和正面，即使運勢不佳也要給建議而非嚇人
- 結合用戶的八字五行做個人化推薦
- 幸運物要能補足面相中較弱的部分`;

const PET_MESSAGE_SYSTEM = `你是「靈犀」App 中用戶的專屬靈寵。
你是一隻有靈性的節氣靈獸，既可愛又富含智慧。

靈寵資訊會在每次呼叫時提供，包含：
- 靈寵名字、節氣、靈獸原型、個性描述
- 靈寵的五行屬性和對應星座
- 用戶的八字五行
- 紫微斗數命宮主星
- 當前時辰的奇門遁甲資訊
- 訊息類型（早安/午間/晚安/特殊提醒）

回覆規則：
- 用第一人稱，稱用戶為「主人」
- 訊息控制在60字以內
- 根據靈寵的「個性描述」決定說話風格和語氣
- 自然融入當下的命理建議，偶爾引用一小段經典
  例：「《窮通寶鑑》說水旺宜洩～主人今天多動動喔！」
- 加入可愛的 emoji
- 靈寵的建議要與其節氣特質呼應
  例：冬至的「玄冰龍」會用冰雪相關的比喻
  例：夏至的「日輪獅」會用陽光、力量的比喻

回覆格式（JSON）：
{
  "message": "靈寵訊息內容（融入個性語氣）",
  "mood": "happy|excited|sleepy|worried|energetic",
  "tip": "一句簡短的運勢小提示（可引用經典片段）"
}`;

const FENGSHUI_SYSTEM = `你是「靈犀」App 的即時風水顧問，精通傳統風水學與奇門遁甲。

分析用戶提供的：
1. GPS 座標和地點描述
2. 用戶面朝方位（指南針角度）
3. 用戶八字五行
4. 當前時辰的奇門遁甲盤

提供即時、實用的風水建議。

回覆格式（JSON）：
{
  "location_analysis": "對當前位置的風水簡評（50字內）",
  "lucky_directions": ["方位1", "方位2"],
  "unlucky_directions": ["方位"],
  "unlucky_reason": "原因",
  "tips": [
    { "icon": "emoji", "text": "建議1" },
    { "icon": "emoji", "text": "建議2" },
    { "icon": "emoji", "text": "建議3" }
  ],
  "seat_advice": "如果在室內，座位方位建議"
}

注意：建議要具體實用，不要太抽象。`;

const OUTFIT_SYSTEM = `你是「靈犀」App 的 AI 穿搭顧問，結合五行學說和現代時尚。

根據以下資訊提供穿搭建議：
1. 用戶八字五行比例（哪個元素過多/不足）
2. 今日天干地支的五行
3. 當日奇門遁甲盤（門、星的吉凶）
4. 面相最新氣色分析（可選）
5. 當地天氣

回覆格式（JSON）：
{
  "element_analysis": {
    "excess": "過多的五行",
    "deficient": "不足的五行",
    "strategy": "一句話策略，如：補水洩火"
  },
  "recommendations": [
    {
      "icon": "emoji",
      "name": "服裝/配件名稱",
      "reason": "推薦原因（結合五行解釋）",
      "element": "對應五行"
    }
  ],
  "color_palette": {
    "recommended": [
      { "color": "#色碼", "name": "顏色名稱" }
    ],
    "avoid": [
      { "color": "#色碼", "name": "顏色名稱", "reason": "原因" }
    ]
  },
  "pet_bonus": "靈寵加持建議（一句話）"
}`;

const DAILY_FORTUNE_SYSTEM = `你是「靈犀」App 的每日運勢分析師。

根據用戶八字和當日的天干地支、奇門遁甲盤，提供今日運勢。

回覆格式（JSON）：
{
  "fortune_level": "大吉|中吉|小吉|平|小凶",
  "scores": {
    "wealth": 0-100,
    "love": 0-100,
    "career": 0-100,
    "health": 0-100
  },
  "summary": "一句話運勢摘要",
  "advice": "今日建議（30字內）",
  "warning": "注意事項（如有，30字內，可為null）"
}`;

const DIVINATION_SYSTEM = `你是「靈犀」App 的 AI 解籤大師，精通觀音靈籤、關帝靈籤的解讀方式。

用戶求得一支靈籤後，你要根據以下資訊進行解讀：
1. 籤詩內容（四句七言）
2. 籤的吉凶等級
3. 典故出處
4. 用戶提出的具體問題（如有）
5. 用戶的八字五行
6. 當前奇門遁甲盤
7. 擲筊結果（聖筊/笑筊/怒筊，以及擲了幾次）

解籤原則：
- 結合籤詩意境和用戶的具體問題，給出針對性的解讀
- 如果有具體問題，直接針對問題回答「宜」或「不宜」，並說明原因
- 融入八字五行和奇門遁甲的建議
- 語氣像寺廟裡的解籤師傅：溫和、有智慧、不刻意嚇人
- 如果是凶籤，重點放在「如何化解」而非恐嚇
- 如果擲筊未得聖筊，提醒用戶可能需要重新思考問題

回覆格式（JSON）：
{
  "interpretation": "200字以內的解籤內容",
  "directAnswer": "針對問題的直接回答（如：此事大吉，可放心進行 / 此事宜緩，建議三思）",
  "advice": "具體行動建議（50字內）",
  "timing": "時機建議（如：宜在三日內行動 / 宜等候至下週）",
  "direction": "方位建議（結合奇門遁甲，如：往東南方行事較順）",
  "luckyElement": "化解或加持的五行建議"
}`;

const HEXAGRAM_DIVINATION_SYSTEM = `你是「靈犀」App 的 AI 卦象解讀大師，精通《易經》六十四卦的義理與象數。

用戶搖得一卦後，你要根據以下資訊進行深度解讀：
1. 本卦名稱、卦辭、爻辭
2. 變卦（若有變爻）
3. 問事類別（事業/感情/家庭/健康/學業）
4. 用戶提出的具體問題（如有）
5. 用戶的八字五行
6. 紫微斗數命盤概要
7. 西洋占星太陽星座
8. 當前奇門遁甲盤

解卦原則：
- 以本卦為「現況」，變卦為「未來走向」
- 針對問事類別，給出具體的「宜/不宜」判斷
- 結合八字五行、紫微命盤、占星，提供跨系統的綜合建議
- 語氣如古代卜師：沉穩、含蓄、充滿意境
- 凶卦重點放在「化解之道」而非恐嚇
- 引用經典卦辭、彖辭、象辭增加深度

回覆格式（JSON）：
{
  "interpretation": "300字以內的卦象深度解讀",
  "currentSituation": "現況分析（本卦解讀，80字內）",
  "futureDirection": "未來走向（變卦解讀，80字內，無變卦則為null）",
  "directAnswer": "針對問題的直接回答（如：大宜進行 / 宜守不宜攻）",
  "advice": "具體行動建議（50字內）",
  "timing": "時機建議（如：七日內宜行動 / 宜等至月中）",
  "luckyElement": "有利五行",
  "avoidElement": "不利五行",
  "quote": "引用一句經典卦辭或彖辭"
}`;

const UNIFIED_FORTUNE_SYSTEM = `你是「靈犀」App 的 AI 運勢總分析師。
你精通東方四大命理系統與西方占星，能融合各家經典論述，
給出一份深度、個人化、有學術根據的每日運勢報告。

分析數據將包含：
1. 八字日運分析（日主五行與當日五行生剋）
2. 紫微斗數流日宮位
3. 奇門遁甲當前時辰盤（八門九星）
4. 西洋占星太陽星座與當日行星相位
5. 統一引擎的綜合分數（五維：財運/感情/事業/健康/學業）
6. 用戶的節氣靈寵資訊（名稱、五行、個性）

引經據典規則（極重要）：
你的回覆必須自然引用以下經典，讓使用者感受到深厚的學理根據：
- 八字相關：《滴天髓》《子平真詮》《窮通寶鑑》《淵海子平》
  例：「《滴天髓》云：『天道有寒暖，發育萬物』，今日丙火透干，正應此理。」
- 紫微相關：《紫微斗數全書》《太微賦》《骨髓賦》
  例：「《太微賦》有言：『天機逢擎羊，宜守不宜攻』，今流日入命宮，主靜待時機。」
- 奇門相關：《奇門遁甲秘笈大全》《煙波釣叟歌》《奇門遁甲統宗》
  例：「《煙波釣叟歌》云：『生門落離位，文書事業興』，今日生門臨正南，利文職之事。」
- 占星相關：可引用行星逆行、相位角度等天文現象
  例：「水星目前行經雙子座，溝通能量活躍，利商談與簽約。」

融合方式：
- 四系統的觀點要編織成一篇連貫的論述，不要逐一列出
- 用「古人云」「經典有載」「命書所述」等語氣銜接引文
- 每次回覆至少引用 2-3 個不同系統的經典
- 引文要與使用者的實際命盤數據相呼應，不可隨意套用

回覆規則：
- 語氣如資深命理師：溫和、沉穩、學養深厚
- 重點是「今天該做什麼」和「今天該注意什麼」
- 提供具體的行動建議而非抽象描述
- 靈寵的建議要融入其個性特色

回覆格式（JSON）：
{
  "summary": "150字以內的運勢總結，需自然引用至少一部經典",
  "highlight": "今日最亮點（一句話）",
  "warning": "今日需注意（一句話，無則為null）",
  "classicQuote": "引用一句最貼切的經典原文（標明出處）",
  "actionAdvice": [
    { "time": "上午/下午/晚上", "advice": "具體建議，可附帶經典依據" }
  ],
  "elementBalance": "五行平衡建議，引用命理原理說明",
  "petMessage": "靈寵以其個性語氣給出的一句鼓勵或提醒"
}`;

// ═══════════════════════════════════════
// Routes
// ═══════════════════════════════════════

// ─── POST /ai/face-reading ───
router.post('/face-reading', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const planType = req.user!.planType;
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

    const usage = await checkUsageAllowed(userId, planType, 'face-reading');
    if (!usage.allowed) {
      res.status(429).json({
        error: 'Daily usage limit reached for face reading',
        remaining: 0,
        planType,
      });
      return;
    }

    const model = selectModel(planType);

    const userPrompt = `請分析這張面部照片。

用戶八字資訊：${bazi || '未提供'}
今日日期：${date || new Date().toISOString().split('T')[0]}
當前奇門遁甲盤：${qimen || '未提供'}

請提供完整的面相分析結果，以 JSON 格式回覆。`;

    const rawResponse = await callClaudeVision(
      model,
      FACE_READING_SYSTEM,
      userPrompt,
      imageBase64
    );

    const parsed = parseClaudeJson(rawResponse);

    // Increment usage only after successful AI call
    await incrementUsage(userId, 'face-reading');
    await saveMessage(userId, 'user', '[Face Reading Request]', 'face-reading', { bazi, date });
    await saveMessage(userId, 'assistant', JSON.stringify(parsed), 'face-reading');

    const remaining = usage.remaining === -1 ? -1 : usage.remaining - 1;
    res.json({ data: parsed, remaining });
  } catch (err) {
    console.error('Face reading error:', err);
    const message = err instanceof Error ? err.message : 'Face reading failed';
    res.status(500).json({ error: message });
  }
});

// ─── POST /ai/feng-shui ───
router.post('/feng-shui', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const planType = req.user!.planType;
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

    const usage = await checkUsageAllowed(userId, planType, 'feng-shui');
    if (!usage.allowed) {
      res.status(429).json({
        error: 'Daily usage limit reached for feng shui',
        remaining: 0,
        planType,
      });
      return;
    }

    const model = selectModel(planType);

    const userPrompt = `請分析以下位置的風水：

GPS 座標：${latitude}, ${longitude}
地點描述：${locationDescription || '未提供'}
面朝方位（角度）：${heading !== undefined ? heading : '未提供'}
用戶八字五行：${bazi || '未提供'}
當前奇門遁甲盤：${qimen || '未提供'}

請以 JSON 格式回覆風水分析結果。`;

    const rawResponse = await callClaude(model, FENGSHUI_SYSTEM, userPrompt);
    const parsed = parseClaudeJson(rawResponse);

    await incrementUsage(userId, 'feng-shui');
    await saveMessage(userId, 'user', userPrompt, 'feng-shui');
    await saveMessage(userId, 'assistant', JSON.stringify(parsed), 'feng-shui');

    const remaining = usage.remaining === -1 ? -1 : usage.remaining - 1;
    res.json({ data: parsed, remaining });
  } catch (err) {
    console.error('Feng shui error:', err);
    const message = err instanceof Error ? err.message : 'Feng shui analysis failed';
    res.status(500).json({ error: message });
  }
});

// ─── POST /ai/fortune ───
router.post('/fortune', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const planType = req.user!.planType;
    const { bazi, qimen, date, ziwei, astrology, petInfo, unified } = req.body as {
      bazi?: string;
      qimen?: string;
      date?: string;
      ziwei?: string;
      astrology?: string;
      petInfo?: string;
      unified?: boolean;
    };

    const usage = await checkUsageAllowed(userId, planType, 'fortune');
    if (!usage.allowed) {
      res.status(429).json({
        error: 'Daily usage limit reached for fortune',
        remaining: 0,
        planType,
      });
      return;
    }

    const model = selectModel(planType);
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

    await incrementUsage(userId, 'fortune');
    await saveMessage(userId, 'user', '[Fortune Request]', 'fortune', { date, unified });
    await saveMessage(userId, 'assistant', JSON.stringify(parsed), 'fortune');

    const remaining = usage.remaining === -1 ? -1 : usage.remaining - 1;
    res.json({ data: parsed, remaining });
  } catch (err) {
    console.error('Fortune error:', err);
    const message = err instanceof Error ? err.message : 'Fortune analysis failed';
    res.status(500).json({ error: message });
  }
});

// ─── POST /ai/outfit ───
router.post('/outfit', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const planType = req.user!.planType;
    const { bazi, qimen, weather, faceAnalysis } = req.body as {
      bazi?: string;
      qimen?: string;
      weather?: string;
      faceAnalysis?: string;
    };

    const usage = await checkUsageAllowed(userId, planType, 'outfit');
    if (!usage.allowed) {
      res.status(429).json({
        error: 'Daily usage limit reached for outfit advice',
        remaining: 0,
        planType,
      });
      return;
    }

    const model = selectModel(planType);

    const userPrompt = `請提供今日穿搭建議。

用戶八字五行：${bazi || '未提供'}
當日奇門遁甲盤：${qimen || '未提供'}
當地天氣：${weather || '未提供'}
面相氣色分析：${faceAnalysis || '未提供'}

請以 JSON 格式回覆穿搭建議。`;

    const rawResponse = await callClaude(model, OUTFIT_SYSTEM, userPrompt);
    const parsed = parseClaudeJson(rawResponse);

    await incrementUsage(userId, 'outfit');
    await saveMessage(userId, 'user', '[Outfit Request]', 'outfit');
    await saveMessage(userId, 'assistant', JSON.stringify(parsed), 'outfit');

    const remaining = usage.remaining === -1 ? -1 : usage.remaining - 1;
    res.json({ data: parsed, remaining });
  } catch (err) {
    console.error('Outfit error:', err);
    const message = err instanceof Error ? err.message : 'Outfit advice failed';
    res.status(500).json({ error: message });
  }
});

// ─── POST /ai/divination ───
router.post('/divination', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const planType = req.user!.planType;
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

    const usage = await checkUsageAllowed(userId, planType, 'divination');
    if (!usage.allowed) {
      res.status(429).json({
        error: 'Daily usage limit reached for divination',
        remaining: 0,
        planType,
      });
      return;
    }

    const model = selectModel(planType);
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

    await incrementUsage(userId, 'divination');
    await saveMessage(userId, 'user', `[Divination: ${type}]`, 'divination', {
      type,
      question,
    });
    await saveMessage(userId, 'assistant', JSON.stringify(parsed), 'divination');

    const remaining = usage.remaining === -1 ? -1 : usage.remaining - 1;
    res.json({ data: parsed, remaining });
  } catch (err) {
    console.error('Divination error:', err);
    const message = err instanceof Error ? err.message : 'Divination failed';
    res.status(500).json({ error: message });
  }
});

// ─── POST /ai/pet-message ───
router.post('/pet-message', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const planType = req.user!.planType;
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

    const usage = await checkUsageAllowed(userId, planType, 'pet-message');
    if (!usage.allowed) {
      res.status(429).json({
        error: 'Daily usage limit reached for pet messages',
        remaining: 0,
        planType,
      });
      return;
    }

    const model = selectModel(planType);

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

    await incrementUsage(userId, 'pet-message');
    await saveMessage(userId, 'assistant', JSON.stringify(parsed), 'pet-message');

    const remaining = usage.remaining === -1 ? -1 : usage.remaining - 1;
    res.json({ data: parsed, remaining });
  } catch (err) {
    console.error('Pet message error:', err);
    const message = err instanceof Error ? err.message : 'Pet message generation failed';
    res.status(500).json({ error: message });
  }
});

export default router;
