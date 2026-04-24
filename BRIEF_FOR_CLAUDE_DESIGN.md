# 給 Claude Design 的專案 Brief — LingXi 靈犀 App

> **使用說明**：把整份 MD 內容貼給 Claude Design 作為對話開頭。本檔已用「實際 App Store Build 8 截圖」+「HEAD 原始碼逐行比對」校正過，是當下最準確的單一資訊源。**請以本檔為準，忽略過去你拿到的任何 pet.tsx / bazi.tsx 程式碼片段** — 那些可能來自舊拷貝，跟線上版本不一致。

**校正基準**：
- App Store production Build #8（commit `f9f4b9a`，2026-04-04 打包）
- 用戶手機實機截圖：橙色火鳳凰主畫面
- HEAD 原始碼路徑：`C:\Dev\LingXi\`（**唯一權威來源**）
- 校正日期：2026-04-19

---

## 一、專案基本資料

| 項目 | 值 |
|---|---|
| App 名稱 | 靈犀 LingXi（命理寵物 App） |
| 版本 | v1.0.0 |
| 框架 | React Native + Expo SDK 54 + Expo Router (file-based) |
| 語言 | TypeScript |
| 狀態管理 | Zustand + AsyncStorage 持久化 |
| 國際化 | react-i18next（6 語：zh-TW / zh-CN / ja / en / de / fr） |
| 字體 | MaShanZheng（毛筆書法）+ NotoSerifTC（思源宋體） |
| iOS Bundle | `com.youquan.lingxi` |
| 後端 | Cloud Run `https://lingxi-api-316167025817.asia-east1.run.app` |
| 主題 | 深黑底 (`#050508`) + 金色光暈 (`#E8C547`) |

---

## 二、檔案結構（只看這個版本，其他都不算數）

```
C:\Dev\LingXi\
├── app\                           ← Expo Router 路由
│   ├── _layout.tsx                根 layout（認證守衛 + 字體載入）
│   ├── index.tsx                  → /(tabs)/pet
│   ├── auth.tsx                   Apple Sign-In + Email 登入
│   ├── onboarding.tsx             5 步引導（語言→歡迎→姓名→生日→召喚）
│   └── (tabs)\
│       ├── _layout.tsx            ⚠️ Tab 容器但 tabBarStyle:{display:'none'} → 底部 tab 完全隱藏
│       ├── pet.tsx                ⭐ 主畫面（627 行 inline，所有 UI 寫在這一個檔內）
│       └── profile.tsx            個人資料 + 訂閱（從右上齒輪進入）
├── components\                    ⚠️ 多數為孤兒元件（見第六節）
├── stores\                        4 個 Zustand store
│   ├── auth-store.ts
│   ├── user-store.ts
│   ├── pet-store.ts
│   └── chat-store.ts
├── services\                      命理引擎 + Claude API 客戶端
├── config\
│   ├── theme.ts                   ⭐ 設計 tokens
│   ├── constants.ts               天干地支 / 五行 / 24 節氣靈寵
│   └── prompts.ts                 Claude API system prompt 模板
├── i18n\
│   ├── index.ts
│   └── locales\{zh-TW,zh-CN,ja,en,de,fr}.json
└── assets\
    ├── images.ts                  ⭐ 圖片註冊中樞（所有 require 集中於此）
    ├── ui-v2\                     63 張 FLUX Pro 1.1 Ultra UI 素材
    └── pets\                      144 張靈寵素材（24 隻 × 6 張）
```

**禁止參考**（這些是舊版／備份／不同步拷貝）：
- `G:\共用雲端硬碟\有泉科技有限公司\內部開發\APP\算命系統\LingXi\` ← Google Drive 舊拷貝
- `G:\...\_old_code\LingXi_old_20260321\` ← 重構前快照
- `G:\...\_old_code\LingXi.zip` ← ZIP 備份
- `G:\...\ai 圖片\_old_versions\` ← 舊 AI 素材
- `G:\...\ai 圖片\V5-flux2\` ← 前代素材

---

## 三、路由與畫面總表（已部署版本只有這 5 個畫面）

| 路徑 | 檔案 | 用途 | 進入條件 |
|---|---|---|---|
| `/auth` | `app/auth.tsx` | Apple Sign-In + Email 登入 | 未登入 |
| `/onboarding` | `app/onboarding.tsx` | 5 步引導：語言 → 歡迎 → 姓名 → 生日 → 靈寵召喚 | 已登入但未完成引導 |
| `/(tabs)/pet` | `app/(tabs)/pet.tsx` | ⭐ 主畫面（全螢幕靈寵） | 都完成 |
| `/(tabs)/profile` | `app/(tabs)/profile.tsx` | 個人資料 + 訂閱方案 | 主畫面右上齒輪點進去 |
| 條件 modal | `components/UpgradeModal.tsx` | 額度用完彈出 | 用戶用光當日額度 |

**沒有獨立的「命盤」頁** — 八字 / 紫微 / 奇門計算結果在後台跑，只把結果輸出到主畫面浮動結果卡。
**沒有獨立的「方案」頁** — 訂閱方案在 profile.tsx 內。

如果你以為這個 App 有「首頁 / 靈寵 / 命盤 / 方案」4 個 tab — 那是錯的，請以上表為準。

---

## 四、主畫面（pet.tsx）真實 UI 結構 ⭐

**這是已上架 App Store 的版本，已用截圖比對驗證 100% 吻合。**

### 4.1 元素清單（依 z-index 由低到高）

| Layer | 位置 | 元素 | 細節 |
|---|---|---|---|
| 0 | 全螢幕 | `<PetAvatar fullscreen />` | 整個螢幕背景就是靈寵（24 節氣靈寵之一），cover 模式填滿。等級 1-9→evo-1.png、10-19→evo-2.png、20+→evo-3.png |
| 5 | bottom:128, left:20 | 寵物名牌 | 30px MaShanZheng 毛筆字（寵物名）+ Lv 徽章（金邊）+ 五行徽章（如「✦ 水」） |
| 5 | right:14, bottom:170 | **2 個垂直 54×54 圓鈕** | 上：眼睛圖示（靈眼/面相）；下：愛心圖示（靈心/風水）。圓鈕為 `rgba(8,8,15,0.5)` 黑底 + 金邊 + 金色 shadow。**Free plan 用戶右上角會疊一個 🔒 鎖頭** |
| 5 | bottom:28 (iOS) | 底部浮動操作區 | 1 行右對齊小字「今日剩餘 N 次」+ 5 個水平類別 chip + 輸入框 + 金色送出鈕 |
| 8 | bottom:140 | 浮動結果卡 | 半透明黑底（`rgba(8,8,15,0.75)`）+ 金邊；右上角「分享 ↗」+「✕」；內文 15px 宋體米白色（`#EDE4D0`）lineHeight 26 |
| 15 | top:22%（條件） | 羅盤浮層 | 點靈心鈕時：170×170 綠邊（`#4ADE80`）羅盤 + 北東南西四方 + GPS 城市，2.5 秒後關閉 |
| 30 | top:54, right:14 | 44×44 圓形齒輪（毛玻璃） | 金色八卦圖示 → 點擊跳到 profile |
| 40 | 全螢幕（條件） | 相機浮層 | 點靈眼鈕時：前鏡頭 CameraView + 76×76 金色快門 |
| 50 | 全螢幕（條件） | 分析動畫 | 占卜/拍照分析時：紫色（`#A78BFA`）八卦旋轉 + 「靈寵正在感應中…」/「靈眼正在觀相中…」 |

### 4.2 5 個類別 chip（底部浮動操作區）

順序固定為：**事業 / 桃花 / 家庭 / 健康 / 學業**
- 每個 chip：40×40 金邊圖片（圓角 12）+ 下方 11px 宋體小字
- 圖片來源：`assets/ui-v2/category/cat-{career,love,family,health,study}.png`
- 點擊 → 紫色八卦旋轉動畫 2 秒 → 結果輸出到浮動結果卡

### 4.3 ASCII 線框（與實機截圖逐項一致）

```
┌─────────────────────────────────────┐
│  時間 10:53                  訊號 5G │ ← iOS 狀態列
│                                  ⚙ │ ← 右上：金色八卦齒輪（毛玻璃）→ profile
│                                     │
│                                     │
│        🦅 全螢幕靈寵（cover）       │ ← Layer 0：PetAvatar fullscreen
│           （24 隻節氣靈寵之一）      │
│                                     │
│                                     │
│                              ◉🔒    │ ← 上：眼睛圓鈕（free 顯示 🔒）→ 靈眼
│                                     │
│                              ◉🔒    │ ← 下：愛心圓鈕（free 顯示 🔒）→ 靈心
│                                     │
│  ┌──────────────────  分享↗    ✕ ┐ │ ← 浮動結果卡（半透明黑 + 金邊）
│  │ 主人早安～🐦 今日整體小吉！      │ │
│  │ 事業運特別旺，吉方在東南方向…    │ │
│  └──────────────────────────────────┘ │
│                          今日剩餘 N 次 │ ← 右對齊小字
│  [事業][桃花][家庭][健康][學業]      │ ← 5 個類別 chip
│  ┌────────────────────┐ ┌──┐        │
│  │ 向靈寵問卦…         │ │ →│        │ ← 輸入框 + 金色送出
│  └────────────────────┘ └──┘        │
└─────────────────────────────────────┘
       ⚠️ 沒有底部 tab bar！
```

---

## 五、設計 Tokens（`config/theme.ts`）

### 色彩

| 用途 | 色碼 |
|---|---|
| 背景容器 | `#050508`（近黑） |
| 主色金 | `#E8C547`（按鈕邊框、強調、毛筆字） |
| 內文文字 | `#EDE4D0`（米白宋體） |
| 靈眼（面相） | `#FFC107`（黃金） |
| 靈心（風水羅盤） | `#4ADE80`（綠） |
| 靈魂（占卜動畫） | `#A78BFA`（紫） |
| 半透明黑卡 | `rgba(8,8,15,0.55~0.95)` — GlassView 模擬毛玻璃 |
| 金色光暈邊框 | `rgba(232,197,71,0.12~0.35)` |

### 字體

| 用途 | 字體 |
|---|---|
| 寵物名 / 標題 | `MaShanZheng_400Regular`（毛筆書法） |
| 對話 / 內文 / 按鈕文字 | `NotoSerifTC_400Regular` / `_700Bold`（思源宋體） |

### 「GlassView」陷阱 ⚠️

`pet.tsx:14` 自定義了一個假毛玻璃元件：
```tsx
const GlassView = ({ intensity, children, style }) => (
  <View style={[{ backgroundColor: `rgba(8,8,15,${...})` }, style]}>{children}</View>
);
```
**這不是真的 blur**，只是半透明黑底。註解寫「GlassView 需要 native rebuild，改用半透明 View 模擬」。如果未來要改回真 blur，需用 `expo-blur` 並重新打包 native build（不能靠 OTA）。

---

## 六、元件目錄真相（重要！）⚠️

`components/` 目錄下有些檔案 **存在但 pet.tsx 沒有使用**（孤兒元件）。**設計新功能時不要假設它們在用**。

| 元件 | 狀態 |
|---|---|
| `PetAvatar.tsx` | ✅ pet.tsx 唯一引用的視覺元件 |
| `UpgradeModal.tsx` | ✅ 額度用完彈出 |
| `ErrorBoundary.tsx` | ✅ _layout.tsx 包覆全 App |
| `WheelPicker.tsx` | ✅ onboarding 用 |
| `LanguageSelector.tsx` | ✅ onboarding 用 |
| `ActionBar.tsx` | ⚠️ 孤兒 — pet.tsx 的右側 2 圓鈕是 inline 寫死的 |
| `PetChat.tsx` | ⚠️ 孤兒 — pet.tsx 用浮動結果卡，沒對話列表 |
| `PetBubble.tsx` | ⚠️ 孤兒 |
| `FeaturePanel.tsx` | ⚠️ 孤兒 — pet.tsx 直接用全螢幕浮層 |
| `features/PetEyeMode.tsx` | ⚠️ 孤兒 — 邏輯直接寫在 pet.tsx |
| `features/PetHeartMode.tsx` | ⚠️ 孤兒 |
| `features/PetPearlMode.tsx` | ⚠️ 孤兒 |

**目前主畫面是「單檔內全部 inline 寫死」的設計**，要改主畫面 UI 直接修 `app/(tabs)/pet.tsx`（627 行）。

---

## 七、素材資源

### 圖片註冊中樞 ⭐

```
C:\Dev\LingXi\assets\images.ts
```

**所有 require 集中於此檔**。pet.tsx 透過 `import { UI_ICONS } from '@/assets/images'` 拿圖。要新增/替換素材，先更新此檔。

### UI 素材結構

```
C:\Dev\LingXi\assets\ui-v2\
├── buttons\           btn-eye / btn-heart / btn-send / btn-settings  ⭐ 主畫面用
├── category\          cat-career / love / family / health / study   ⭐ 主畫面用
├── onboarding\        bg-welcome / bg-birthday / bg-pet-reveal
├── auth\              bg-login
├── effects\           sparkle / aura / bagua-symbol-01..08
├── chat-bubble\       result-eye / result-heart / result-pearl
├── action-bar\        ability(eye/heart/soul) / nurture(feed/play/meditate)
├── pet-avatar\        avatar-frame / float-shadow / frame-eye/heart/pearl
├── feature-panel\     eye / heart / pearl 子目錄
├── logo\              logo-splash / logo-splash-text / logo-statusbar
└── ASSET_PROMPTS.md   FLUX 生圖提示詞紀錄
```

### 靈寵素材（24 隻 × 6 張 ＝ 144 張）

```
C:\Dev\LingXi\assets\pets\
├── 01-lichun\  ... 24-dahan\   24 節氣靈寵
│   ├── full.png       1024px ⭐ 主畫面背景用
│   ├── avatar.png     512px
│   ├── icon.png       128px
│   ├── evo-1.png      進化 1（Lv 10 解鎖）
│   ├── evo-2.png      進化 2（Lv 20 解鎖）
│   └── evo-3.png      進化 3（Lv 30 終極）
└── PET_PROMPTS.md     24 隻完整提示詞
```

---

## 八、API 與後端

| 項目 | 值 |
|---|---|
| Cloud Run | `https://lingxi-api-316167025817.asia-east1.run.app` |
| Region | `asia-east1` |
| Bundle ID | `com.youquan.lingxi` |
| ASC App ID | `6759918378` |

**API 路徑容易踩坑**：
- 用 `/auth/*`、`/user/*`、`/ai/*`（**不是** `/api/auth/*`）
- 訂閱用 `/api/subscription/*`（前面有 `/api`）
- 錯誤回應欄位 `{"error":"..."}`（**不是** `{"message":"..."}`）
- AI 端點回傳 `{ data: {...}, remaining: N }`

主畫面實際呼叫的 API：
- `/ai/face-reading`（靈眼面相，傳 base64 照片 + 八字字串）
- `/ai/pet-chat`（自由對話，傳 message + 靈寵屬性）

---

## 九、部署現況（重要！）

### Build 歷史

| 通路 | 最新 Build | Commit | 日期 | 狀態 |
|---|---|---|---|---|
| **App Store production** | **Build #8** | `f9f4b9a` | 2026-04-04 | ✅ 唯一一個 production build |
| TestFlight / preview | Build #6 | `6a0591d` | 2026-03-19 | 7 個 internal builds |

### EAS Update OTA 通道

| Branch | 最後更新 | 說明 |
|---|---|---|
| `development` | 4 週前 | 內部測試用 |
| **`production`** | ❌ **不存在** | **App Store 用戶收不到 OTA 更新** |

### 部署規則 ⚠️

1. 改 UI 後**不會 OTA 推送到 App Store 用戶**（因為 `production` channel 不存在）
2. 要更新 App Store **必須重新 EAS build + submit**（不能靠 OTA）
3. 要建立 production OTA：在 `eas.json` production profile 加 `"channel": "production"`，然後 `eas update --branch production`

---

## 十、已知 UI 問題（從截圖比對發現，可優先 polish）

| 問題 | 描述 | 程式碼位置 | 建議修法 |
|---|---|---|---|
| 名牌被擋 | 左下「{petName} Lv. ✦ 五行」名牌（bottom:128）被浮動結果卡（bottom:140）幾乎完全覆蓋 | `pet.tsx:548` styles `:707` | 名牌往上挪到 bottom:240 以上，或當有結果卡時隱藏名牌 |
| 右側僅見 1 鈕 | 應有 2 個垂直圓鈕（眼+心），實際截圖只看得到 1 個（被靈寵火焰擋住） | `pet.tsx:579` styles `:734` | 提高 z-index 或增加底色對比，或改變位置避開靈寵主視覺 |
| 「今日剩餘 N 次」太淡 | opacity 0.7 + 右對齊小字，被 chip 擋到，視認性差 | `pet.tsx:593` styles `:724` | 提高對比，或移到頂部齒輪附近 |
| 隱藏 tab 但 i18n 還留 `tabs.pet/profile` | 翻譯鍵存在但 UI 看不到 | `(tabs)/_layout.tsx:73` | 確認是否徹底改用 Stack 取代 Tabs |

---

## 十一、給 Claude Design 的工作守則

1. **以本檔 + `C:\Dev\LingXi\` 實際 HEAD 程式碼為唯一資訊源**。任何過去拿到的程式碼片段（特別是 `bazi.tsx` 之類）如與本檔衝突，**以本檔為準**。
2. **改主畫面 UI 直接改 `app/(tabs)/pet.tsx`** — 全部寫在這 627 行檔案內，不要繞去找元件。
3. **改畫面前先看 `assets/images.ts`** — 所有素材引用透過此檔，不要繞過。
4. **改文案要 6 語齊改** — 缺一個會在某語系顯示英文 fallback。
5. **不要使用孤兒元件**（ActionBar / PetChat / PetBubble / FeaturePanel / features/Pet*Mode）— 它們可能是設計試做後棄用，繼承可能誤導。
6. **不新增舊命名** — 不要建 `*_v2.tsx` / `*Old.tsx` / `*Backup.tsx`，要重構直接覆蓋並依賴 git 還原。
7. **i18n key 命名沿用既有層級**：例 `actionBar.eye`、`upgrade.title`、`tabs.pet`。
8. **改 native config（app.json / Info.plist / Android Manifest）後必須重新 EAS build**，不能靠 OTA。
9. **改完 UI 請告訴用戶要不要建立 production OTA channel**，否則 App Store 用戶看不到更新。

---

## 十二、可優先處理的待辦清單

- [ ] 修復「十、已知 UI 問題」4 項
- [ ] 建立 production OTA channel（讓未來改 UI 能推到 App Store 用戶）
- [ ] 評估是否將 pet.tsx inline 部分元件化（會讓檔案從 627 行縮到 ~200，但增加 props drilling）
- [ ] 6 語系排版檢查（特別是德文 / 法文長字串溢出）
- [ ] iOS 14+ 相容性視覺驗證
- [ ] App Store 上架素材最終視覺 review（`docs/appstore/`）

---

## 十三、需要先確認的問題（給用戶）

請先回答這 3 題，我才能精準提案：

1. **新增功能 vs 既有畫面 polish？**
   - (a) 在現有 5 個畫面內 polish 視覺
   - (b) 新增畫面（例如獨立的命盤頁、八字詳解頁）
   - (c) 重新設計主畫面整體佈局
   - (d) 其他

2. **要不要動「孤兒元件」（ActionBar/PetChat/FeaturePanel 等）？**
   - (a) 拿掉它們、簡化目錄
   - (b) 重新啟用它們、做元件化重構
   - (c) 不動，繼續 inline 在 pet.tsx

3. **是否要建立 production OTA channel？**
   - (a) 要，未來小改動可以即時推送
   - (b) 不要，每次都重新 EAS build + 送審
