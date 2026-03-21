import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { callClaude, callClaudeVision, parseClaudeJson } from '../services/claude';
import { checkUsageAllowed, incrementUsage, selectModel, saveMessage } from './ai-usage';
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

// ─── POST /ai/pet-chat (自由對話，按方案選模型) ───
router.post('/pet-chat', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const planType = req.user!.planType;
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

    const usage = await checkUsageAllowed(userId, planType, 'pet-message');
    if (!usage.allowed) {
      res.status(429).json({ error: 'Daily limit reached', remaining: 0, planType });
      return;
    }

    // 按方案選模型: free=Haiku, member=Sonnet, supreme=Opus
    const model = selectModel(planType);

    // 計算當前時辰
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
（若有八字資訊，請據此分析主人的五行強弱、用神喜忌，融入回覆中）

═══ 時空感知 ═══
當前時辰：${currentShichen}時（${hour}:00）
時辰能量：${{子:'水氣深沉，宜靜思內觀',丑:'土氣漸凝，養精蓄銳之時',寅:'木氣初動，萬物待發',卯:'木氣旺盛，宜開展新事',辰:'土氣厚重，龍脈匯聚',巳:'火氣漸升，思維敏捷',午:'火氣最旺，陽極之時',未:'土氣柔和，宜養心神',申:'金氣初動，宜決斷收束',酉:'金氣旺盛，宜省思總結',戌:'土氣歸藏，萬物收斂',亥:'水氣初生，靈感湧現'}[currentShichen] || '氣場流轉中'}

═══ 對話規則 ═══
- 用溫暖而帶神秘感的第一人稱說話，稱對方為「主人」
- 回覆控制在 80-150 字，自然口語化，帶有你的靈獸特色
- 運勢/命理問題：結合八字五行、時辰能量、陰陽消長來分析，用「天干地支」「五行生剋」等專業術語但以淺顯方式解釋
- 生活問題：從命理角度給出建議，例如方位、顏色、時機等
- 偶爾用「...」表示靈感湧現，用「✦」標記重要啟示
- 展現你作為${creature || '靈獸'}的獨特靈性，例如感應氣場變化、預知吉凶
- 語氣如同一位慈祥而睿智的神諭，透過靈寵之口傳達天機`;

    const rawResponse = await callClaude(model, systemPrompt, message);

    await incrementUsage(userId, 'pet-message');
    await saveMessage(userId, 'user', message, 'pet-chat');
    await saveMessage(userId, 'assistant', rawResponse, 'pet-chat');

    const remaining = usage.remaining === -1 ? -1 : usage.remaining - 1;
    res.json({ data: { reply: rawResponse }, remaining });
  } catch (err) {
    console.error('Pet chat error:', err);
    const message = err instanceof Error ? err.message : 'Chat failed';
    res.status(500).json({ error: message });
  }
});

export default router;
