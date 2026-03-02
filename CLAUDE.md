# CLAUDE.md — 靈犀 App 開發指南

## 專案概述
「靈犀」是一款結合 AI 面相分析、八字命理、紫微斗數、奇門遁甲、西洋占星、GPS 風水、靈寵養成、穿搭建議、擲籤問事的東西方玄學生活顧問 App。

核心特色：使用者輸入出生年月日時辰後，系統融合四大命理體系（八字、紫微斗數、奇門遁甲、西洋占星），透過「節氣靈寵」以個人化、引經據典的方式給予命運指引與生活建議。

## 技術棧
- React Native + Expo (SDK 52) + Expo Router
- TypeScript
- Zustand 狀態管理
- Firebase (Firestore + Cloud Functions + Auth + FCM)
- Anthropic Claude API (Vision + Text)
- RevenueCat 內購

## 核心設計理念

**所有命理輸出都由靈寵以對話方式告訴使用者**，不使用傳統資訊卡片，創造「專屬命運指引靈寵」的沉浸感。使用者體驗 = 跟靈寵聊天。

## 頁面架構（2 Tab 對話式）

```
app/(tabs)/
  ├── _layout.tsx            ← 2 Tab 導航（靈寵/我的）
  ├── pet.tsx                ← Tab 1：靈寵主畫面（形象+對話+功能列）
  └── profile.tsx            ← Tab 2：我的設定

components/
  ├── PetAvatar.tsx          ← 靈寵形象區（動畫+等級+EXP）
  ├── PetChat.tsx            ← 對話列表元件（核心！）
  ├── PetBubble.tsx          ← 單則對話氣泡（含引經據典格式）
  ├── ActionBar.tsx          ← 底部功能列（養成+靈眼/靈心/靈魂）
  ├── UpgradeModal.tsx       ← 付費升級彈窗（靈寵語氣）
  └── features/
      ├── EyeCapture.tsx     ← 靈眼拍照 overlay
      ├── HeartCompass.tsx    ← 靈心羅盤 overlay
      └── PearlShake.tsx     ← 靈魂搖卦 overlay

stores/
  ├── user-store.ts          ← 用戶狀態 + 額度
  ├── pet-store.ts           ← 靈寵狀態 + 等級
  └── chat-store.ts          ← 對話訊息列表（核心！）
```

### 靈寵主畫面佈局（pet.tsx）

```
┌─ 頂部狀態列 ─────────────────────────┐
│  靈犀   農曆日期·時辰   Lv.X 靈寵名  │
├─ 靈寵形象區 ─────────────────────────┤
│  靈寵圖片（浮動動畫）+ EXP 進度條     │
├─ 靈寵對話區（核心！可滾動）───────────┤
│  所有運勢/面相/風水/占卜結果          │
│  皆以靈寵對話氣泡呈現                │
│  引經據典自然融入靈寵語氣中           │
├─ 底部功能列 ─────────────────────────┤
│  🍖餵食 🎾玩耍 🧘冥想（養成互動）    │
│  👁靈眼 🌍靈心 🏮靈魂（靈寵能力）    │
├─ Tab Bar ────────────────────────────┤
│       🔮 靈寵          ⚙️ 我的       │
└──────────────────────────────────────┘
```

### 對話資料結構（chat-store.ts）

```typescript
interface ChatMessage {
  id: string;
  time: string;
  type: 'fortune' | 'outfit' | 'face' | 'fengshui' | 'divination'
      | 'feed' | 'play' | 'meditate' | 'levelup' | 'evolve';
  text: string;           // 靈寵對話主文
  classicQuote?: string;  // 引經據典片段
  data?: any;             // 內嵌資料（分數/方位/卦象等）
}
```

### 靈寵對話類型

**靈寵主動對話（系統觸發）：**
- 🌅 早安訊息（06:00）— 今日運勢總覽 + 引經據典
- 🌞 午間訊息（12:00）— 午時提醒 + 下午注意事項
- 🌙 晚安訊息（21:00）— 明日預告 + 養生建議
- ⚡ 即時提醒 — 沖煞時辰、吉時提示
- 👔 穿搭建議 — 五行色系推薦

**靈寵回應對話（使用者觸發）：**
- 👁 靈眼 → 拍照 → 靈寵以對話解讀面相
- 🌍 靈心 → GPS → 靈寵以對話解讀風水
- 🏮 靈魂 → 搖卦 → 靈寵以對話解讀卦象
- 🍖 餵食 → 靈寵感謝 + 養生小提示（+50 EXP）
- 🎾 玩耍 → 靈寵開心 + 命理趣事（+30 EXP）
- 🧘 冥想 → 靈寵感悟 + 經典語錄（+20 EXP）

### 功能觸發流程

靈眼/靈心/靈魂點擊後：
1. 檢查額度 → 不足則彈出升級 Modal（靈寵語氣）
2. 對話區新增靈寵引導語（「讓我睜開靈眼看看...」）
3. 彈出功能 overlay（相機/羅盤/搖卦動畫）
4. 呼叫 Claude API
5. 結果以靈寵對話氣泡呈現（非傳統 UI 卡片）

付費升級畫面為 **Modal 彈窗**，以靈寵語氣表達（「主人，今天的次數用完了...」），僅在使用次數耗盡或等級達上限時觸發。

## 重要檔案
- `config/theme.ts` — 所有色彩、字體定義，暗色東方神秘風
- `config/constants.ts` — 天干地支、五行、八門、九星、紫微主星、西洋星座、**24 節氣靈寵定義**
- `config/prompts.ts` — Claude API 的所有 System Prompt 模板（含引經據典規則）
- `services/bazi-engine.ts` — 八字計算引擎（已完成基礎版）
- `services/ziwei-engine.ts` — 紫微斗數排盤引擎
- `services/qimen-engine.ts` — 奇門遁甲排盤引擎（已完成簡化版）
- `services/astrology-engine.ts` — 西洋占星引擎
- `services/unified-fortune-engine.ts` — 四大體系統一運勢引擎（加權融合）
- `services/claude-api.ts` — Claude API 串接層（型別已定義）
- `stores/user-store.ts` — 用戶狀態（八字、紫微、占星、訂閱、每功能額度）
- `stores/pet-store.ts` — 靈寵狀態（節氣配對、等級、屬性、訊息）
- `stores/chat-store.ts` — 靈寵對話訊息列表（ChatMessage 介面）
- `functions/index.ts` — Cloud Functions 後端

## 靈寵系統（二十四節氣）

靈寵是本 App 的核心互動角色。共 **24 隻靈寵**，以二十四節氣劃分，每隻融合中西方命理特質。

### 配對機制
- 使用者輸入出生月日 → `getSpiritPetByDate(month, day)` → 回傳對應節氣靈寵
- 每隻靈寵包含：`id`、`solarTerm`（節氣）、`name`、`creature`（靈獸原型）、`element`（五行）、`season`（季節）、`zodiac`（對應星座）、`personality`（個性描述）
- 靈寵的 `personality` 決定其說話風格和指引語氣

### 24 靈寵列表
| 季節 | 節氣 | 靈寵 | 五行 | 星座 |
|------|------|------|------|------|
| 春 | 立春 | 青芽鹿 | 木 | 水瓶座 |
| 春 | 雨水 | 潤澤蛙 | 水 | 雙魚座 |
| 春 | 驚蟄 | 雷蟲龍 | 木 | 雙魚座 |
| 春 | 春分 | 衡翼蝶 | 木 | 牡羊座 |
| 春 | 清明 | 清風鶴 | 木 | 牡羊座 |
| 春 | 穀雨 | 穀靈兔 | 土 | 金牛座 |
| 夏 | 立夏 | 炎蟬精 | 火 | 金牛座 |
| 夏 | 小滿 | 金穗狐 | 火 | 雙子座 |
| 夏 | 芒種 | 芒鳳雀 | 火 | 雙子座 |
| 夏 | 夏至 | 日輪獅 | 火 | 巨蟹座 |
| 夏 | 小暑 | 螢火靈 | 火 | 巨蟹座 |
| 夏 | 大暑 | 烈陽鷹 | 土 | 獅子座 |
| 秋 | 立秋 | 金風虎 | 金 | 獅子座 |
| 秋 | 處暑 | 涼蟬仙 | 金 | 處女座 |
| 秋 | 白露 | 露珠蛇 | 金 | 處女座 |
| 秋 | 秋分 | 月衡鶴 | 金 | 天秤座 |
| 秋 | 寒露 | 霜菊貓 | 水 | 天秤座 |
| 秋 | 霜降 | 霜狼靈 | 水 | 天蠍座 |
| 冬 | 立冬 | 冬眠熊 | 水 | 天蠍座 |
| 冬 | 小雪 | 雪兔仙 | 水 | 射手座 |
| 冬 | 大雪 | 雪鴞靈 | 水 | 射手座 |
| 冬 | 冬至 | 玄冰龍 | 水 | 摩羯座 |
| 冬 | 小寒 | 寒星鯨 | 水 | 摩羯座 |
| 冬 | 大寒 | 極光鳳 | 土 | 水瓶座 |

### 靈寵美工資源
- 位置：`assets/pets/{id}/`（如 `assets/pets/01-lichun/`）
- 每隻需要：`avatar.png`(512px)、`full.png`(1024px)、`evo-1/2/3.png`(1024px)、`icon.png`(128px)
- 動畫：`assets/pets/animations/{pet-id}-{idle|happy|talk}.json`（Lottie 格式）
- 完整規格與 AI 生圖提示詞見 `assets/pets/README.md`

### 進化系統
- 3 階段進化：初始 → 覺醒 → 終極（對應 evo-1/2/3 圖檔）
- 等級上限依方案：免費 Lv.10 / 會員 Lv.20 / 至尊無限
- 互動方式：餵食(+50exp)、玩耍(+30exp)、冥想(+20exp)

## 四大命理引擎融合架構

```
使用者出生年月日時辰
        ↓
┌──────────────────────────────────────────────┐
│ bazi-engine (35%)    → 日主五行生剋           │
│ ziwei-engine (30%)   → 命宮主星 + 流日宮位    │
│ qimen-engine (25%)   → 八門九星 + 吉方        │
│ astrology-engine (10%) → 星座 + 守護星        │
└──────────────────────────────────────────────┘
        ↓ unified-fortune-engine 加權合併
 五維分數（財運/感情/事業/健康/學業）+ 各系統摘要
        ↓
 Claude API（引經據典 prompt）→ 自然語言運勢報告
        ↓
 靈寵以其節氣個性語氣，用對話氣泡呈現給使用者
```

### 引經據典規則
Claude API 的運勢輸出必須引用經典命理文獻，且**自然融入靈寵對話語氣中**（不是列清單）：
- 八字：《滴天髓》《子平真詮》《窮通寶鑑》《淵海子平》
- 紫微：《紫微斗數全書》《太微賦》《骨髓賦》
- 奇門：《奇門遁甲秘笈大全》《煙波釣叟歌》《奇門遁甲統宗》
- 占星：行星逆行、相位角度等天文現象描述

正確示範：「《滴天髓》云：甲木參天，主人今日正是如此氣勢！」
錯誤示範：單獨列出書名清單、用傳統 UI 卡片展示

## UI 設計參考
- `UI_FLOW.md` — 完整使用者畫面與操作流程（含 ASCII 線框圖）
- `lingxi-full-prototype.jsx` — UI prototype（React web 版，早期參考用）

## 設計風格
- 主色：金色 #e8c547 on 深黑背景 #08080f
- 字體：Ma Shan Zheng（毛筆標題）+ Noto Serif TC（正文）
- 風格：東方神秘感、低調奢華、金色光暈效果
- 動畫：浮動粒子、呼吸光效、滑入顯示

## Claude API 使用規則
- 所有 Claude API 呼叫必須透過 Cloud Functions（不能在前端暴露 API Key）
- 靈寵日常對話 + 穿搭建議 + 免費版解讀 → 用 Haiku（省成本）
- 面相分析 + 風水解讀 + 付費版占卜 + 深度運勢 → 用 Sonnet（高品質）
- 所有 System Prompt 啟用 Prompt Caching
- Claude 回傳 JSON → 解析為靈寵對話氣泡 → 新增到 chat-store 對話列表
- System Prompt 必須指定靈寵語氣 + 引經據典融入對話的方式回覆

## 多語言系統（i18n）
- 框架：i18next + react-i18next + expo-localization
- 支援語系：繁體中文(zh-TW)、簡體中文(zh-CN)、日文(ja)、英文(en)、德文(de)、法文(fr)
- 翻譯檔位置：`i18n/locales/*.json`
- 設定檔：`i18n/index.ts`（自動偵測系統語言）
- Claude API 語言包裝：`services/i18n-prompts.ts`（自動轉換 Claude 回覆語言）
- 語言選擇器：`components/LanguageSelector.tsx`

### 多語言開發規則
1. **UI 文字**：一律用 `t('key')` 取得翻譯，不要寫死中文
2. **Claude API 回覆**：用 `wrapSystemPrompt()` 包裝 System Prompt，自動加語言指令
3. **靈寵對話**：用 `getPetSpeechStyle()` 取得各語言的說話風格
4. **玄學術語**：非中日文語系會保留中文原始術語（括號標註）
5. **新增翻譯**：六個 locale 檔案都要同步更新

## 開發優先順序
1. ✅ 專案架構（已完成）
2. ✅ 多語言系統（已完成）
3. ✅ 擲籤問事系統（引擎 + 頁面 + Prompt 已完成）
4. ✅ 靈寵系統改版為 24 節氣版本（已完成）
5. ✅ UI 架構設計（2 Tab 對話式架構，UI_FLOW.md 已完成）
6. 靈寵對話主畫面實作（PetChat + PetBubble + ActionBar + chat-store）
7. 功能 overlay 實作（EyeCapture + HeartCompass + PearlShake）
8. Claude API 串接（Cloud Functions 部署 + 靈寵語氣 prompt）
9. 內購訂閱串接（UpgradeModal 觸發 RevenueCat）
10. 推播系統（靈寵定時對話：早安/午間/晚安）

## 擲籤系統重要檔案
- `services/divination-engine.ts` — 60 首籤詩 + 擲筊邏輯 + 吉凶等級
- `app/(tabs)/divination.tsx` — 完整求籤頁面（動畫 + 震動回饋）
- `config/prompts.ts` → `DIVINATION_SYSTEM` — AI 解籤 Prompt
- Claude API 解籤付費版用 Sonnet（深度解讀），免費版用 Haiku
