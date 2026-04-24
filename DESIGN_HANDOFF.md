# LingXi 靈犀 App — Design Handoff

> 給 Claude Design 的工作交接文件。請在開始任何 UI 迭代前完整讀過本檔。

**最後更新**：2026-04-19（根據實際 App Store Build 8 截圖比對校正）
**權威 commit**：`f9f4b9a` — 已打包為 **App Store production Build #8**（2026-04-04）
**最後一次 UI 大改**：`c7780ff`（2026-03-21，FLUX Pro 1.1 Ultra 全面升級）
**App 版本**：v1.0.0 ｜ Expo SDK 54 ｜ React Native 0.81.5
**驗證狀態**：✅ HEAD 程式碼 = App Store 上架版本（Build 8）= 用戶手機實際看到的 UI

---

## 0. 工作根目錄（唯一）

**只允許在 `C:\Dev\LingXi\` 下作業。**

下列路徑 **禁止參考、禁止複製內容、禁止當作素材來源**：

| 路徑 | 為何禁止 |
|---|---|
| `G:\共用雲端硬碟\有泉科技有限公司\內部開發\APP\算命系統\LingXi\` | Google Drive 上的舊拷貝，無 git 即時同步 |
| `G:\...\APP\算命系統\_old_code\LingXi_old_20260321\` | 2026-03-21 重構前的舊版快照 |
| `G:\...\APP\算命系統\_old_code\LingXi.zip` | 222 MB 舊版 ZIP 備份 |
| `G:\...\APP\算命系統\ai 圖片\_old_versions\`（V1/V3/V4/V4-2） | Grok 時代低品質素材 |
| `G:\...\APP\算命系統\ai 圖片\V5-flux2\` | FLUX.2 Pro 前代，已被 V6 Ultra 取代 |
| `G:\...\內部開發\LingXi_靈犀App\`（MD 文件目錄） | 2026-03-03 過時筆記 |
| `C:\Dev\LingXi\dist\`、`node_modules\` | 編譯產物 / 依賴，非源碼 |

---

## 1. 必讀順序

| 順序 | 檔案 | 為什麼要先讀 |
|---|---|---|
| 1 | 本檔（DESIGN_HANDOFF.md） | 整體交接 |
| 2 | `C:\Dev\LingXi\app\(tabs)\pet.tsx` | ⭐ **主畫面所有 UI 都寫在這一個檔案內**（627 行），不是元件化 |
| 3 | `C:\Dev\LingXi\config\theme.ts` | 設計 tokens（色彩 / 字體 / 間距 / 陰影 / 圓角） |
| 4 | `C:\Dev\LingXi\assets\images.ts` | ⭐ 圖片註冊中樞（所有 require 集中於此） |
| 5 | `C:\Dev\LingXi\CLAUDE.md` | 專案開發指南、架構脈絡 |
| 6 | `C:\Dev\LingXi\UI_FLOW.md` | 使用者流程線框（注意：可能與最新實作有出入） |

---

## 2. 路由結構

```
C:\Dev\LingXi\app\
├── _layout.tsx                根 layout（認證守衛 + 字體載入）
│                              路由邏輯：
│                                未登入        → /auth
│                                已登入未引導  → /onboarding
│                                都完成        → /(tabs)/pet
├── index.tsx                  → 重定向到 /(tabs)/pet
├── auth.tsx                   Apple Sign-In + Email 登入
├── onboarding.tsx             5 步引導（語言→歡迎→姓名→生日→召喚）
└── (tabs)\
    ├── _layout.tsx            ⚠️ Tab 容器 — 但 tabBarStyle: display:'none' → **底部 tab 列完全隱藏**
    ├── pet.tsx                ⭐ 主畫面（所有 UI 寫在此檔內，627 行 inline）
    └── profile.tsx            個人資料 + 訂閱管理（從右上齒輪進入，不是從 tab）
```

⚠️ **Tab 列雖然在路由設定有 2 個（pet/profile），但視覺上隱藏**。Profile 必須點擊主畫面右上角的齒輪才能進入。Claude Design 不要假設有可見的底部 tab 導航。

---

## 3. 主畫面實際結構（HEAD 已驗證）

### 3.1 元素清單（依 z-index 由低到高）

| Layer | 位置 | 元素 | 程式碼位置 |
|---|---|---|---|
| 0 | 全螢幕 (zIndex:0) | `<PetAvatar fullscreen />` 全螢幕靈寵背景 | pet.tsx:494 |
| 5 | bottom:128, left:20 | 寵物名牌（30px 毛筆字 + Lv 徽章 + 五行徽章） | pet.tsx:548 |
| 5 | right:14, bottom:170 | **2 個垂直堆疊 54×54 圓鈕**（眼睛在上、愛心在下，gap:14）；free plan 右上角顯示 🔒 鎖頭 | pet.tsx:579 |
| 5 | bottom:28 (iOS) | 底部浮動操作區（剩餘次數 + 5 類別 chip + 輸入框 + 送出鈕） | pet.tsx:591 |
| 8 | bottom:140 | 浮動半透明黑色結果卡（含「分享 ↗」+「✕」） | pet.tsx:531 |
| 15 | top:22%（條件出現） | 羅盤浮層（170×170 綠邊，靈心啟動時） | pet.tsx:499 |
| 25 | （條件出現） | 功能浮層（feature overlay） | pet.tsx:804 樣式 |
| 30 | top:54, right:14 | 44×44 圓形毛玻璃齒輪（→ profile） | pet.tsx:524 |
| 40 | 全螢幕（條件出現） | 相機浮層（前鏡頭 + 金色快門，靈眼拍照） | pet.tsx:557 |
| 50 | 全螢幕（條件出現） | 占卜/靈眼分析動畫（紫色八卦旋轉） | pet.tsx:613 |

### 3.2 ASCII 線框（與實際 App Store Build 8 截圖一致）

```
┌─────────────────────────────────────┐
│  時間 10:53                  訊號 5G │ ← iOS 狀態列
│                                  ⚙ │ ← 右上：金色八卦齒輪（毛玻璃）
│                                     │
│                                     │
│        🦅 全螢幕靈寵（cover）       │ ← Layer 0：PetAvatar fullscreen
│           （24 隻節氣靈寵之一）      │   evo-1/evo-2/evo-3 視等級切換
│                                     │
│                                     │
│                              ◉🔒    │ ← 上：眼睛圓鈕（free → 🔒）
│                                     │
│                              ◉🔒    │ ← 下：愛心圓鈕（free → 🔒）
│                                     │
│                                     │
│  ┌─────────────────────  分享↗  ✕ ┐ │ ← 浮動結果卡（半透明黑底）
│  │ 主人早安～🐦 今日整體小吉…       │ │   宋體 15px / lineHeight 26
│  │ 事業運特別旺，吉方在東南方向…    │ │
│  └──────────────────────────────────┘ │
│                          今日剩餘 N 次 │ ← 右對齊小字
│  [事業][桃花][家庭][健康][學業]      │ ← 5 個 40×40 類別 chip（金邊）
│  ┌────────────────────┐ ┌──┐        │
│  │ 向靈寵問卦…         │ │ →│        │ ← 輸入框 + 金色送出鈕
│  └────────────────────┘ └──┘        │
└─────────────────────────────────────┘
   ⚠️ 底部沒有 tab bar（display:'none'）
```

### 3.3 條件浮層

| 觸發 | 浮層內容 | 視覺 |
|---|---|---|
| 點擊靈眼鈕 | 前鏡頭相機 + 金色快門 | 全螢幕黑底，金色 76×76 圓邊快門 |
| 點擊靈心鈕 | 170×170 綠邊羅盤（顯示北東南西 + GPS 城市） | 螢幕中央偏上（top:22%），2.5 秒後關閉並輸出風水結果到對話 |
| 點擊類別 chip | 紫色八卦旋轉動畫 | 全螢幕半透明，2 秒後輸出運勢結果 |
| 額度用完 | UpgradeModal 升級彈窗 | 中央 modal |

---

## 4. 元件目錄真相（重要！）

⚠️ `components/` 目錄下有些檔案 **存在但 pet.tsx 沒有使用**（孤兒元件）。

| 元件 | 檔案 | 狀態 | 主畫面用嗎？ |
|---|---|---|---|
| `PetAvatar` | `components/PetAvatar.tsx` | ✅ 使用中 | ✅ pet.tsx 唯一引用的視覺元件 |
| `UpgradeModal` | `components/UpgradeModal.tsx` | ✅ 使用中 | ✅ 額度用完彈出 |
| `ErrorBoundary` | `components/ErrorBoundary.tsx` | ✅ 使用中 | 在 _layout.tsx 包覆全 App |
| `WheelPicker` | `components/WheelPicker.tsx` | ✅ 使用中 | 在 onboarding.tsx 用 |
| `LanguageSelector` | `components/LanguageSelector.tsx` | ✅ 使用中 | 在 onboarding.tsx 用 |
| `ActionBar` | `components/ActionBar.tsx` | ⚠️ **孤兒** | ❌ pet.tsx 的右側按鈕是 inline 寫死的，沒用這個 |
| `PetChat` | `components/PetChat.tsx` | ⚠️ **孤兒** | ❌ pet.tsx 用浮動結果卡，沒有對話列表 |
| `PetBubble` | `components/PetBubble.tsx` | ⚠️ **孤兒** | ❌ 同上 |
| `FeaturePanel` | `components/FeaturePanel.tsx` | ⚠️ **孤兒** | ❌ pet.tsx 直接用全螢幕浮層 |
| `features/PetEyeMode.tsx` | `components/features/PetEyeMode.tsx` | ⚠️ **孤兒** | ❌ 邏輯直接寫在 pet.tsx |
| `features/PetHeartMode.tsx` | `components/features/PetHeartMode.tsx` | ⚠️ **孤兒** | ❌ 同上 |
| `features/PetPearlMode.tsx` | `components/features/PetPearlMode.tsx` | ⚠️ **孤兒** | ❌ 同上 |

**設計建議**：要不要把 pet.tsx 內 inline 的部分（兩個圓鈕、底部操作區、結果卡、動畫）抽成元件，請跟用戶確認再做。**目前主畫面是「單檔內全部寫死」的設計**，改任何 UI 都直接修 pet.tsx。

---

## 5. 狀態管理（Zustand + AsyncStorage 持久化）

```
C:\Dev\LingXi\stores\
├── auth-store.ts              認證狀態（login/logout/checkAuth）
├── user-store.ts              用戶資料 + 八字 + 訂閱方案 + 每功能額度
├── pet-store.ts               靈寵狀態（節氣配對、等級、屬性、EXP、進化）
└── chat-store.ts              對話訊息列表（ChatMessage 介面）
```

主畫面從 store 讀取的關鍵欄位（pet.tsx:67-93）：
- `petId`, `petName`, `petEmoji`, `petCreature`, `petElement`, `petLevel`
- `planType`（free / member / supreme，影響 🔒 鎖頭顯示）
- `birthMonth`, `birthDay`, `bazi`, `ziwei`, `astrology`（命理計算用）
- `messages`（最新一筆會顯示在浮動卡）

---

## 6. 設定 / 服務 / 國際化

### 設定

```
C:\Dev\LingXi\config\
├── theme.ts                   ⭐ 設計 tokens（Colors, Fonts, FontSize, Spacing, BorderRadius, GlowShadow）
├── constants.ts               天干地支 / 五行 / 八門 / 24 節氣靈寵
└── prompts.ts                 Claude API system prompt 模板
```

### 命理引擎（services/）

主畫面用到：`unified-fortune-engine`、`bazi-engine`、`qimen-engine`、`pet-narrator`、`claude-api`、`api-client`、`share-service`、`date-utils`

### 多語言（6 語系，351 個翻譯鍵）

```
C:\Dev\LingXi\i18n\locales\
├── zh-TW.json     ⭐ 主要語言
├── zh-CN.json
├── ja.json
├── en.json
├── de.json
└── fr.json
```

**新增 UI 文案時 6 語系必須同步更新**，否則某語系會顯示英文 fallback。

---

## 7. 素材資源（FLUX Pro 1.1 Ultra，2026-03-21 統一升級）

### 圖片註冊中樞 ⭐

```
C:\Dev\LingXi\assets\images.ts
```
**所有圖片 require 集中於此**。新增/替換素材時務必更新此檔，不可在元件內直接 require 散落路徑。pet.tsx 透過 `import { UI_ICONS } from '@/assets/images'` 拿圖。

### UI 素材（63 張）

```
C:\Dev\LingXi\assets\ui-v2\
├── onboarding\        bg-welcome / bg-birthday / bg-pet-reveal（3）
├── auth\              bg-login（1）
├── buttons\           btn-eye / btn-heart / btn-send / btn-settings（4）⭐ 主畫面用
├── category\          cat-career / love / family / health / study（5）⭐ 主畫面用
├── feature-panel\     eye / heart / pearl 子目錄
├── effects\           sparkle / aura / compass-needle / bagua-symbol-01..08（8 八卦）
├── chat-bubble\       bubble-corner / result-eye / result-heart / result-pearl（4）
├── action-bar\        ability(eye/heart/soul) / nurture(feed/play/meditate)
├── pet-avatar\        avatar-frame / float-shadow / frame-eye/heart/pearl 等（8）
├── logo\              logo-splash / logo-splash-text / logo-statusbar（3）
└── ASSET_PROMPTS.md   所有 AI 生圖提示詞記錄
```

### 靈寵素材（144 張 ＝ 24 隻 × 6 張）

```
C:\Dev\LingXi\assets\pets\
├── 01-lichun\         青芽鹿（立春）
│   ├── avatar.png     512px 頭像
│   ├── full.png       1024px 全螢幕形象 ⭐ 主畫面背景用
│   ├── icon.png       128px Tab bar 用（目前 tab 隱藏，但仍保留）
│   ├── evo-1.png      進化 1
│   ├── evo-2.png      進化 2
│   └── evo-3.png      進化 3（終極）
├── 02-yushui\         潤澤蛙（雨水）
├── ... [24 隻完整列表參見 PET_PROMPTS.md]
├── 24-dahan\          極光鳳（大寒）
└── PET_PROMPTS.md     所有 24 隻提示詞
```

### App Icon / Splash

```
C:\Dev\LingXi\assets\
├── icon.png           1024×1024 八卦水晶球（FLUX.2 Pro）
├── adaptive-icon.png  Android adaptive
├── splash.png         1536×2048 啟動畫面
└── favicon.png        Web favicon
```

---

## 8. 設計規範速查

### 色彩

| 用途 | 色碼 |
|---|---|
| 背景容器 | `#050508`（近黑） |
| 主色金 | `#E8C547`（按鈕邊框、強調、毛筆字） |
| 內文文字 | `#EDE4D0`（米白宋體） |
| 靈眼（面相） | `#FFC107`（黃金） |
| 靈心（風水） | `#4ADE80`（綠 — 羅盤） |
| 靈魂（占卜動畫） | `#A78BFA`（紫 — 八卦旋轉） |
| 半透明黑卡 | `rgba(8,8,15,0.55~0.95)`（GlassView 模擬毛玻璃） |
| 金色光暈邊框 | `rgba(232,197,71,0.12~0.35)` |

### 字體

| 用途 | 字體 | 載入方式 |
|---|---|---|
| 標題 / 寵物名 | `MaShanZheng_400Regular`（毛筆書法） | @expo-google-fonts/ma-shan-zheng |
| 內文 / 對話 | `NotoSerifTC_400Regular` / `_700Bold`（思源宋體） | @expo-google-fonts/noto-serif-tc |

於 `app/_layout.tsx:27-31` 透過 `useFonts` 載入，未載入完前會 splash screen。

### 佈局約束

- **方向**：Portrait Only（豎屏）
- **底部 Safe Area**：iOS 28px、Android 10px（pet.tsx:745）
- **無底部 tab bar**：所有導航靠右上齒輪
- **內容比例**（主畫面）：靈寵背景 100% + 浮層元素 overlay

### 「GlassView」陷阱

pet.tsx:14 自定義了一個假毛玻璃元件：
```tsx
const GlassView = ({ intensity, children, style }) => (
  <View style={[{ backgroundColor: `rgba(8,8,15,${...})` }, style]}>{children}</View>
);
```
**這不是真的 blur**，只是半透明黑底。註解寫「GlassView 需要 native rebuild，改用半透明 View 模擬」。如果未來要改回真 blur，需用 `expo-blur` 並重新打包 native build。

---

## 9. 部署現狀（重要！）

### EAS Build 歷史（2026-04-19 時點）

| 通路 | 最新 Build | Commit | 日期 | 狀態 |
|---|---|---|---|---|
| **App Store production** | **Build #8** | `f9f4b9a` | 2026-04-04 | ✅ 唯一一個 production build |
| TestFlight / preview | Build #6 | `6a0591d` | 2026-03-19 | 7 個 internal builds |
| Dev device | Build #6 | `737a312` / `6a0591d` | 2026-03-20 | 2 個 |

### EAS Update OTA 通道

| Branch | 最後更新 | Commit | 訊息 |
|---|---|---|---|
| `development` | 4 週前 | ~`44fc97e` | "App icon + usage-based leveling + fullscreen UI" |
| **`production`** | ❌ **不存在** | — | **App Store 用戶收不到 OTA 更新** |

### ⚠️ 部署規則（Claude Design 必知）

1. **改 UI 後不會 OTA 推送到 App Store 用戶** — 因為 `production` channel 不存在
2. **要更新 App Store 必須重新 EAS build + submit**
3. **TestFlight 用戶在 Build #6（早 5+ commits）**，他們不會看到 FLUX Pro 1.1 Ultra 之後的素材升級
4. 如果要建立 production OTA channel：在 `eas.json` 的 production profile 加 `"channel": "production"`，然後 `eas update --branch production`

---

## 10. 後端 API（已部署）

| 項目 | 值 |
|---|---|
| Cloud Run 端點 | `https://lingxi-api-316167025817.asia-east1.run.app` |
| Region | `asia-east1` |
| EAS Project ID | `22a8b11d-c07c-44df-b785-59a347afde18` |
| iOS Bundle | `com.youquan.lingxi` |
| ASC App ID | `6759918378` |

**API 路徑規範（容易踩坑）**：
- 用 `/auth/*`、`/user/*`、`/ai/*`、**不是** `/api/auth/*`
- 訂閱用 `/api/subscription/*`（前面有 `/api`）
- 錯誤回應欄位是 `{"error":"..."}`，**不是** `{"message":"..."}`
- AI 端點回傳 `{ data: {...}, remaining: N }`

主畫面實際呼叫的 API：
- `/ai/face-reading`（靈眼面相）— pet.tsx:387
- `/ai/pet-chat`（自由對話）— pet.tsx:468

---

## 11. 已知 UI 問題（截圖比對發現，可優先 polish）

| 問題 | 描述 | 程式碼位置 | 建議修法 |
|---|---|---|---|
| 名牌被擋 | 左下「{petName} Lv. ✦ 五行」名牌（bottom:128）被浮動結果卡（bottom:140）幾乎完全覆蓋，截圖看不到 | pet.tsx:548 / styles:707 | 名牌往上挪到 bottom:240 以上，或當有結果卡時隱藏名牌 |
| 右側僅見 1 鈕 | 應有 2 個垂直圓鈕（眼+心），實際截圖只看得到 1 個 | pet.tsx:579 / styles:734 | 確認 z-index、增加底色對比，或讓鈕更亮（已有 sparkle shadow 但不夠） |
| 「今日剩餘 N 次」太淡 | opacity 0.7 + 右對齊小字，被 chip 區擋住或太小 | pet.tsx:593 / styles:724 | 提高對比，或移到頂部齒輪附近 |
| `tabBarStyle.display:'none'` 與 i18n key `tabs.pet/profile` 並存 | 翻譯鍵存在但 UI 看不到 | _layout.tsx:73 | 要不要保留隱藏 tab？或徹底拿掉並改用 Stack |

---

## 12. 工作守則

1. **改主畫面 UI 直接改 `app/(tabs)/pet.tsx`** — 全部寫在這個 627 行檔案內，不要繞去找元件
2. **改畫面前先看 `assets/images.ts`** — 所有素材引用透過此檔，不要繞過
3. **改文案要 6 語齊改** — 缺一個會在某語系顯示英文 fallback
4. **不要使用孤兒元件**（ActionBar / PetChat / PetBubble / FeaturePanel / features/Pet*Mode）— 它們可能是設計試做後棄用，繼承可能誤導
5. **不新增舊命名** — 不要建 `*_v2.tsx` / `*Old.tsx` / `*Backup.tsx`，要重構直接覆蓋並依賴 git 還原
6. **i18n key 命名沿用既有層級**：例 `actionBar.eye`、`upgrade.title`、`tabs.pet`
7. **改 native config（app.json / Info.plist / Android Manifest）後必須重新 EAS build**，不能靠 OTA
8. **如果發現 `MEMORY.md`（在 `~/.claude/projects/...`）與實作衝突**：以實作為準，並回報以更新 memory

---

## 13. 待辦（接手後可優先處理）

- [ ] **修復 §11 4 個已知 UI 問題**（名牌被擋、右側按鈕、剩餘次數對比、隱藏 tab 處理）
- [ ] 修復 16 個 TypeScript 型別錯誤（commit `f9f4b9a` 進行中）
- [ ] **建立 production OTA channel**（讓未來改 UI 能推到 App Store 用戶）
- [ ] App Store 上架素材最終視覺 review（`docs/appstore/`）
- [ ] iOS 14+ 相容性視覺驗證
- [ ] 6 語系排版檢查（特別是德文 / 法文長字串溢出）
- [ ] 評估是否將 pet.tsx 內 inline 的部分元件化（會讓檔案從 627 行縮到 ~200，但增加 props drilling）

---

## 14. 對外資源索引

```
C:\Dev\LingXi\
├── DESIGN_HANDOFF.md          ⭐ 本檔（Claude Design 主入口）
├── CLAUDE.md                  開發指南
├── UI_FLOW.md                 使用者流程（注意可能與最新實作有出入）
├── DEV-PROGRESS.md            開發進度紀錄
├── README.md                  專案概述
├── ART_PROMPTS.md             AI 生圖提示詞規範
├── app\
│   ├── _layout.tsx            根 layout + 路由守衛
│   ├── auth.tsx
│   ├── onboarding.tsx
│   └── (tabs)\
│       ├── _layout.tsx        ⚠️ tab 隱藏
│       ├── pet.tsx            ⭐ 主畫面（627 行 inline）
│       └── profile.tsx
├── components\                 多數為孤兒，只 PetAvatar/UpgradeModal/ErrorBoundary/WheelPicker/LanguageSelector 在用
├── stores\                     4 個 Zustand store
├── services\                   命理引擎 + API client
├── config\                     theme / constants / prompts
├── i18n\                       6 語系
├── assets\
│   ├── images.ts              ⭐ 圖片註冊中樞
│   ├── ui-v2\                 63 張 FLUX Pro 1.1 Ultra UI 素材
│   ├── pets\                  144 張靈寵素材（24 × 6）
│   ├── icon.png / splash.png / adaptive-icon.png
│   └── ...
├── docs\
│   ├── UI_AND_LOGIC.md        詳細 UI 與邏輯（可能過時）
│   ├── LingXi_UI_Operation_Status_2026-03-14_v1.0.0.pptx  最新狀態 PPT
│   ├── LingXi_UI_Breakdown.pptx
│   ├── LingXi_UI_Screens.pptx
│   ├── LingXi_Presentation.pptx
│   └── appstore\              上架素材（5 檔）
├── package.json               v1.0.0，57 dependencies
├── app.json                   Expo 配置
└── eas.json                   EAS Build 設定
```
