// ═══════════════════════════════════════
// Firebase Cloud Functions — 靈犀後端 API
// 所有 Claude API 呼叫都透過這裡
// ═══════════════════════════════════════
//
// 部署指令：
//   cd functions
//   npm install
//   firebase deploy --only functions
//
// 需要先設定環境變數：
//   firebase functions:config:set claude.api_key="YOUR_KEY"

const functions = require('firebase-functions');
const Anthropic = require('@anthropic-ai/sdk');

// ─── Claude Client 初始化 ───
const getClient = () => new Anthropic({
  apiKey: functions.config().claude.api_key,
});

// ─── System Prompts（會被 Prompt Caching 快取） ───
const FACE_READING_SYSTEM = `你是「靈犀」App 的 AI 面相大師...`; // 從 config/prompts.ts 複製完整版
const PET_MESSAGE_SYSTEM = `你是「靈犀」App 中用戶的專屬靈寵...`;
const FENGSHUI_SYSTEM = `你是「靈犀」App 的即時風水顧問...`;
const OUTFIT_SYSTEM = `你是「靈犀」App 的 AI 穿搭顧問...`;

// ─── 面相分析 API ───
exports.faceReading = functions
  .region('asia-east1')  // 台灣最近的機房
  .https.onCall(async (data: any, context: any) => {
    const { image, bazi, qimen, date } = data;
    const client = getClient();

    try {
      const response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',  // 付費用戶用 Sonnet
        max_tokens: 1024,
        system: [
          {
            type: 'text',
            text: FACE_READING_SYSTEM,
            cache_control: { type: 'ephemeral' },  // Prompt Caching
          },
        ],
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: 'image/jpeg', data: image },
            },
            {
              type: 'text',
              text: `用戶八字：${bazi}\n當前奇門盤：${qimen}\n日期：${date}\n請以 JSON 格式回覆完整面相分析。`,
            },
          ],
        }],
      });

      const text = response.content[0].text;
      return JSON.parse(text);
    } catch (error) {
      console.error('Face reading error:', error);
      throw new functions.https.HttpsError('internal', '面相分析失敗');
    }
  });

// ─── 靈寵訊息生成 API ───
exports.petMessage = functions
  .region('asia-east1')
  .https.onCall(async (data: any, context: any) => {
    const { pet, bazi, qimen, type } = data;
    const client = getClient();

    try {
      const response = await client.messages.create({
        model: 'claude-haiku-4-5-20241022',  // 靈寵訊息用 Haiku 省成本
        max_tokens: 256,
        system: [
          {
            type: 'text',
            text: PET_MESSAGE_SYSTEM,
            cache_control: { type: 'ephemeral' },
          },
        ],
        messages: [{
          role: 'user',
          content: `靈寵：${pet.name}（${pet.type}，${pet.element}屬性，Lv.${pet.level}）
用戶八字：${bazi}
當前奇門盤：${qimen}
訊息類型：${type}
請以 JSON 格式回覆。`,
        }],
      });

      return JSON.parse(response.content[0].text);
    } catch (error) {
      console.error('Pet message error:', error);
      throw new functions.https.HttpsError('internal', '靈寵訊息生成失敗');
    }
  });

// ─── 風水分析 API ───
exports.fengshuiAnalysis = functions
  .region('asia-east1')
  .https.onCall(async (data: any, context: any) => {
    const { lat, lng, heading, location, bazi, qimen } = data;
    const client = getClient();

    try {
      const response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 512,
        system: [
          {
            type: 'text',
            text: FENGSHUI_SYSTEM,
            cache_control: { type: 'ephemeral' },
          },
        ],
        messages: [{
          role: 'user',
          content: `GPS座標：${lat}, ${lng}\n面朝方位：${heading}度\n地點：${location}\n用戶八字：${bazi}\n當前奇門盤：${qimen}\n請以 JSON 格式回覆。`,
        }],
      });

      return JSON.parse(response.content[0].text);
    } catch (error) {
      console.error('Fengshui error:', error);
      throw new functions.https.HttpsError('internal', '風水分析失敗');
    }
  });

// ─── 穿搭建議 API ───
exports.outfitAdvice = functions
  .region('asia-east1')
  .https.onCall(async (data: any, context: any) => {
    const { bazi, qimen, weather, face } = data;
    const client = getClient();

    try {
      const response = await client.messages.create({
        model: 'claude-haiku-4-5-20241022',  // 穿搭用 Haiku 夠了
        max_tokens: 512,
        system: [
          {
            type: 'text',
            text: OUTFIT_SYSTEM,
            cache_control: { type: 'ephemeral' },
          },
        ],
        messages: [{
          role: 'user',
          content: `用戶八字：${bazi}\n當前奇門盤：${qimen}\n天氣：${weather.temp}°C ${weather.condition}\n${face ? `面相鼻運分數：${face.nose}` : ''}\n請以 JSON 格式回覆。`,
        }],
      });

      return JSON.parse(response.content[0].text);
    } catch (error) {
      console.error('Outfit error:', error);
      throw new functions.https.HttpsError('internal', '穿搭建議失敗');
    }
  });

// ─── 每日靈寵推播（定時觸發） ───
exports.dailyPetPush = functions
  .region('asia-east1')
  .pubsub.schedule('every day 08:00')
  .timeZone('Asia/Taipei')
  .onRun(async (context: any) => {
    // TODO: 實作每日推播邏輯
    // 1. 從 Firestore 取得所有付費用戶
    // 2. 為每位用戶生成個人化靈寵訊息
    // 3. 透過 FCM 推播
    console.log('Daily pet push triggered');
  });
