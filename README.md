# 靈犀 LingXi — AI 玄學生活顧問 App

## 產品概述
AI 面相分析 × 八字命理 × 奇門遁甲 × GPS即時風水 × 靈寵養成 × 每日穿搭建議

## 技術棧
- **前端**: React Native + Expo (Expo Router)
- **後端**: Firebase Cloud Functions
- **資料庫**: Firebase Firestore
- **AI**: Anthropic Claude API (Vision + Text)
- **推播**: Firebase Cloud Messaging (FCM)
- **內購**: RevenueCat
- **語言**: TypeScript

## 快速開始

```bash
# 1. 安裝依賴
npm install

# 2. 設定環境變數（複製 .env.example 並填入你的 API Key）
cp .env.example .env

# 3. 啟動開發伺服器
npx expo start

# 4. 手機掃 QR Code（安裝 Expo Go App）
```

## 專案結構

```
LingXi/
├── app/                        # 頁面路由（Expo Router）
│   ├── _layout.tsx             # 全局佈局 + 字體載入
│   ├── onboarding.tsx          # 開機引導（輸入生辰召喚靈寵）
│   └── (tabs)/                 # 底部 Tab 導航
│       ├── _layout.tsx         # Tab 導航設定
│       ├── index.tsx           # 首頁（運勢總覽 + 奇門盤）
│       ├── face.tsx            # 面相分析（相機 + AI 解讀）
│       ├── pet.tsx             # 靈寵互動（養成 + 訊息）
│       ├── fengshui.tsx        # 即時風水（GPS + 羅盤）
│       └── outfit.tsx          # 穿搭建議（五行色彩）
│
├── services/                   # 核心業務邏輯
│   ├── claude-api.ts           # Claude API 串接層
│   ├── bazi-engine.ts          # 八字命理計算引擎
│   ├── qimen-engine.ts         # 奇門遁甲排盤引擎
│   ├── lunar-calendar.ts       # 農曆轉換工具
│   ├── fengshui-engine.ts      # 風水方位計算
│   └── outfit-engine.ts        # 穿搭推薦邏輯
│
├── components/                 # 可重用 UI 元件
│   ├── SpiritPet.tsx           # 靈寵動畫元件
│   ├── Compass.tsx             # 羅盤元件
│   ├── QimenGrid.tsx           # 奇門遁甲九宮格
│   ├── ScoreBar.tsx            # 分數進度條
│   ├── PetMessage.tsx          # 靈寵對話氣泡
│   ├── OutfitCard.tsx          # 穿搭建議卡片
│   ├── FiveElementsChart.tsx   # 五行能量圖表
│   └── MysticBackground.tsx    # 神秘風格背景
│
├── stores/                     # 狀態管理（Zustand）
│   ├── user-store.ts           # 用戶資料 + 八字
│   └── pet-store.ts            # 靈寵狀態
│
├── config/                     # 設定檔
│   ├── theme.ts                # 主題色彩、字體
│   ├── constants.ts            # 天干地支、五行等常數
│   └── prompts.ts              # Claude API Prompt 模板
│
├── functions/                  # Firebase Cloud Functions（後端）
│   ├── index.ts                # Cloud Functions 入口
│   ├── face-reading.ts         # 面相分析 API
│   ├── daily-fortune.ts        # 每日運勢生成
│   ├── pet-push.ts             # 靈寵推播排程
│   └── fengshui-analysis.ts    # 風水分析 API
│
├── .env.example                # 環境變數範本
├── package.json                # 套件依賴
├── tsconfig.json               # TypeScript 設定
├── app.json                    # Expo 設定
└── firebaseConfig.ts           # Firebase 設定
```

## 六大功能模組

### 1. AI 面相分析
- 相機拍照 → base64 編碼 → Claude Vision API
- 五官特徵評分 + AI 個人化解讀
- 每次分析搭配幸運物推薦

### 2. 八字命理系統
- 輸入生辰 → 天干地支計算 → 五行比例分析
- 作為所有個人化推薦的底層數據引擎

### 3. 專屬靈寵系統
- 根據八字五行生成專屬靈寵
- 等級成長、餵養互動、進化系統
- 定時推播個人化貼心訊息

### 4. GPS 即時風水
- 手機定位 + 指南針方位
- 結合奇門遁甲 + 八字 → 即時吉凶方位
- 座位建議、移動方向建議

### 5. 奇門遁甲引擎
- 每 2 小時一盤（12 時盤/天）
- 九宮 + 八門 + 九星 + 八神
- 結合用戶八字判斷最佳行動

### 6. AI 穿搭建議
- 五行能量平衡 → 色彩推薦
- 結合天氣 API + 當日運勢
- 靈寵加持建議

## 商業模式

### 免費版
- 每日 1 次基本面相掃描
- 簡短運勢 + 基本靈寵互動

### 靈犀會員 NT$168/月
- 無限面相分析、完整靈寵養成
- GPS 風水、奇門遁甲、穿搭建議
- 靈寵推播

### 靈犀至尊 NT$399/月
- 全部功能 + 稀有靈寵
- 深度命盤分析、合盤功能

## Claude API 模型配置
- 靈寵推播 / 穿搭建議 → Haiku 4.5（低成本高速）
- 面相分析（付費版）/ 風水解讀 → Sonnet 4.5（高品質）
- 深度命盤報告 → Sonnet 4.5 或 Opus 4.5

## 開發指令（Claude Code 用）

```bash
# 啟動開發
npx expo start

# 新增頁面
# 在 app/(tabs)/ 下建立 .tsx 檔案

# 部署 Cloud Functions
cd functions && npm run deploy

# iOS 編譯（在 MacBook Pro 上）
npx expo prebuild --platform ios
eas build --platform ios
eas submit --platform ios

# Android 編譯
eas build --platform android
eas submit --platform android
```
