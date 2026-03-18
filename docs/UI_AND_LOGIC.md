# 靈犀 (LingXi) — UI 與邏輯完整文件

> 本文件基於 2026-03-03 實際程式碼生成，描述 App 目前已實作的完整狀態。

---

## 1. App 總覽

| 項目 | 說明 |
|------|------|
| App 名稱 | 靈犀 (LingXi) |
| 定位 | AI 玄學生活顧問 — 命理寵物 App |
| 技術棧 | React Native 0.81.5 + Expo SDK 54 |
| 路由 | Expo Router 6 (file-based) |
| 狀態管理 | Zustand 5 + AsyncStorage 持久化 |
| 多語言 | react-i18next 16，6 種語言、351 個翻譯鍵 |
| 後端 | Cloud Run (`lingxi-api-316167025817.asia-east1.run.app`) |
| AI | Claude API（透過 Cloud Run 代理，前端不存放 API Key） |
| 付款 | RevenueCat (react-native-purchases) |
| 主要平台 | iOS（主要）、Web（測試用） |
| Bundle ID | `com.youquan.lingxi` |
| 字型 | NotoSerifTC (正文)、MaShanZheng (書法標題) |
| 主色調 | 東方神秘金 `#e8c547`，深色背景 `#08080f` |

---

## 2. 畫面導航流程圖

```
                        ┌─────────────┐
                        │  App 啟動   │
                        │ _layout.tsx │
                        └──────┬──────┘
                               │
                    ┌──────────┼──────────┐
                    │          │          │
            未登入且非DEV  DEV模式/已登入   已登入+已Onboard
                    │     未Onboard       │
                    ▼          │          ▼
           ┌────────────┐     │   ┌────────────────┐
           │ auth.tsx   │     │   │   (tabs)       │
           │ 登入/註冊  │     │   │  _layout.tsx   │
           └──────┬─────┘     │   └───┬────────┬───┘
                  │           │       │        │
                  │           ▼       ▼        ▼
                  │   ┌──────────┐ ┌──────┐ ┌─────────┐
                  │   │onboarding│ │pet   │ │profile  │
                  │   │4步引導   │ │靈寵  │ │我的     │
                  └──►│         │ │中心  │ │         │
                      └────┬─────┘ └──┬───┘ └─────────┘
                           │         │
                           └────►────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
                    ▼            ▼            ▼
          ┌──────────────┐ ┌───────────┐ ┌───────────┐
          │ PetEyeMode   │ │PetHeart   │ │PetPearl   │
          │ 靈眼（面相）│ │Mode       │ │Mode       │
          │ Modal overlay│ │靈心（風水）│ │靈魂（占卜）│
          └──────────────┘ └───────────┘ └───────────┘
                                 │
                          ┌──────┴──────┐
                          │UpgradeModal │
                          │ 升級方案彈窗 │
                          └─────────────┘
```

### Tab 結構

| Tab | 圖示 | 畫面 | 檔案 |
|-----|------|------|------|
| 靈寵 | 🔮 (圓形按鈕) | Pet Screen | `app/(tabs)/pet.tsx` |
| 我的 | ⚙️ | Profile Screen | `app/(tabs)/profile.tsx` |

---

## 3. 各畫面詳細說明

### 3.1 Root Layout (`app/_layout.tsx`)

**功能：** App 入口，負責初始化與路由守衛。

**初始化流程：**
1. 載入字型（NotoSerifTC 400/700、MaShanZheng 400）
2. 防止 SplashScreen 自動隱藏
3. 初始化認證狀態（`checkAuth()`）
4. 初始化訂閱服務（`initSubscriptionService()`）
5. 字型+認證完成後隱藏 SplashScreen

**路由守衛邏輯：**
- `DEV_SKIP_AUTH = __DEV__`：開發模式下跳過登入
- 未登入 → 導向 `/auth`
- 已登入但未完成 Onboarding → 導向 `/onboarding`
- 已登入且已完成 Onboarding → 導向 `/(tabs)`

**認證成功後：** 呼叫 `identifyUser()` 將用戶 ID 設定到 RevenueCat。

**Stack 設定：** `headerShown: false`、背景色 `#08080f`、轉場動畫 `fade`。

---

### 3.2 Auth Screen (`app/auth.tsx`)

**外觀：** 深色背景、金色主調的全螢幕登入/註冊頁面。

**版面佈局：**
```
┌──────────────────────┐
│      靈犀（書法字）    │
│      LING XI          │
├──────────────────────┤
│  [Apple Sign-In 按鈕] │  ← iOS 限定
│  ────── 或 ──────    │
├──────────────────────┤
│  登入帳號 / 註冊帳號   │
│  ┌─ 姓名（註冊時）──┐ │
│  └──────────────────┘ │
│  ┌─ 電子郵件 ────────┐ │
│  └──────────────────┘ │
│  ┌─ 密碼 ────────────┐ │
│  └──────────────────┘ │
│  [ 登入/註冊 按鈕 ]    │
│  沒有帳號？註冊        │
└──────────────────────┘
```

**資料顯示：** 錯誤訊息顯示在紅色邊框卡片中。

**使用者互動：**
| 互動 | 邏輯 |
|------|------|
| 點擊「登入」按鈕 | 呼叫 `authStore.login(email, password)` → POST `/auth/login` → 儲存 JWT → 導航 |
| 點擊「註冊」按鈕 | 呼叫 `authStore.register(email, password, name)` → POST `/auth/register` → 導航至 onboarding |
| 點擊 Apple Sign-In | 請求 Apple 憑證 → `authStore.loginWithApple(identityToken)` → POST `/auth/apple` → 導航 |
| 切換模式 | 在 Login/Register 之間切換，清除錯誤 |
| Loading 狀態 | 全螢幕半透明遮罩 + ActivityIndicator |

**表單驗證：** email + password 必填，註冊模式下 name 也必填。

---

### 3.3 Onboarding Screen (`app/onboarding.tsx`)

**外觀：** 5 步驟引導精靈，深色背景金色主調。

#### Step 0 — 語言選擇
```
┌──────────────────┐
│       🌐         │
│   選擇語言       │
│                  │
│  🇹🇼 繁體中文  ✓ │
│  🇨🇳 简体中文    │
│  🇯🇵 日本語      │
│  🇺🇸 English     │
│  🇩🇪 Deutsch     │
│  🇫🇷 Français    │
│                  │
│  [ 下一步 ]      │
└──────────────────┘
```
- 顯示 6 種語言列表，每項包含國旗 emoji + 原生名稱
- 選中的語言高亮並顯示 ✓
- 點擊語言立即切換 i18n 語言（`i18n.changeLanguage()`）

#### Step 1 — 歡迎頁
```
┌──────────────────┐
│       🐉         │
│      靈犀        │
│     LING XI      │
│  AI 玄學生活顧問  │
│  — 萬物皆有靈 —  │
│                  │
│ [ 開始探索 ]     │
└──────────────────┘
```

#### Step 2 — 輸入姓名
- 文字輸入框（最多 20 字元）
- 名字為空時按鈕 disabled

#### Step 3 — 出生資料
```
┌──────────────────────┐
│  曆法：[國曆] [農曆]  │
│                      │
│  ┌─年─┐ ┌─月─┐ ┌─日─┐│
│  │1992│ │ 6  │ │15  ││ ← WheelPicker 滾輪
│  └────┘ └────┘ └────┘│
│                      │
│  時辰：               │
│  [子時][丑時]...[亥時] │
│  [ 不知道 ]           │
│                      │
│  性別：[♂ 男] [♀ 女]  │
│                      │
│  [返回]  [ 召喚靈寵 ] │
└──────────────────────┘
```

**資料處理邏輯：**
1. 年份範圍：1930-2026，預設 1992
2. 月份天數動態計算（含閏年判斷）
3. 不知道時辰 → 預設午時（11 點）
4. 提交時呼叫 `setOnboarding()` → 計算八字 + 紫微 + 占星
5. 呼叫 `initPet(month, day)` → 根據出生月日匹配節氣靈寵

#### Step 4 — 靈寵召喚結果
```
┌──────────────────────┐
│     🦋 (靈寵 emoji)  │
│    靈寵降臨！        │
│  衡翼蝶 與你結緣     │
│                      │
│  ┌─ 紫微命盤摘要 ──┐ │
│  │ 命宮：紫微       │ │
│  │ 性格：...        │ │
│  └────────────────┘ │
│  ┌─ 西洋占星摘要 ──┐ │
│  │ ♎ 天秤座        │ │
│  │ 五行：金 | 金星  │ │
│  └────────────────┘ │
│                      │
│  Lv1 💬 基本對話     │
│  Lv3 🔔 運勢提醒     │
│  Lv5 👔 穿搭建議     │
│  Lv8 🧭 方位導航     │
│  Lv10 ✨ 第一次進化   │
│                      │
│  ┌──────────────────┐│
│  │ Free  每日1次    ││
│  │ Member 每日5次   ││
│  │ Supreme 無限次   ││
│  └──────────────────┘│
│                      │
│  [ 進入靈犀 ]        │
└──────────────────────┘
```

---

### 3.4 Pet Screen (`app/(tabs)/pet.tsx`)

**定位：** 主畫面。以對話式介面為核心，所有功能結果以聊天氣泡呈現。

**版面佈局：**
```
┌──────────────────────────────────┐
│ StatusBar                        │
│ 靈犀    3月3日·午時    Lv.1 青芽鹿·木系 │
├──────────────────────────────────┤
│                                  │
│          PetAvatar               │
│      ┌────────────┐              │
│      │  🦌 (浮動)  │             │
│      └────────────┘              │
│       青芽鹿 Lv.1 · 木系         │
│       ═══════╌╌╌ 45/100         │
│       ★★★★★  進化階段 1/5       │
│                                  │
├──────────────────────────────────┤
│                                  │
│  PetChat (FlatList 可捲動)       │
│  ┌─────────────────────────┐     │
│  │ 🦌 青芽鹿          14:02│     │
│  │ ┌─────────────────────┐ │     │
│  │ │ 主人好～今天木氣旺盛  │ │     │
│  │ │ 財運 ███████░ 78    │ │     │
│  │ │ 桃花 ████░░░░ 52    │ │     │
│  │ │ 🧭 東南 🎨 綠色     │ │     │
│  │ └─────────────────────┘ │     │
│  └─────────────────────────┘     │
│                                  │
├──────────────────────────────────┤
│ ActionBar                        │
│ ┌──────┐ ┌──────┐ ┌──────┐      │
│ │ 🍖   │ │ 🎾   │ │ 🧘   │      │
│ │ 餵食 │ │ 玩耍 │ │ 冥想 │      │
│ │ +50  │ │ +30  │ │ +20  │      │
│ └──────┘ └──────┘ └──────┘      │
│ ┌──────┐ ┌──────┐ ┌──────┐      │
│ │ 👁   │ │ 🌍   │ │ 🏮   │      │
│ │ 靈眼 │ │ 靈心 │ │ 靈魂 │      │
│ └──────┘ └──────┘ └──────┘      │
└──────────────────────────────────┘
```

**StatusBar 區域：**
- 左：App 名稱「靈犀」（書法字體）
- 中：農曆日期 + 時辰（如 `3月3日 · 午時`）
- 右：等級 + 靈寵名 + 五行系（如 `Lv.1 青芽鹿 · 木系`）

**資料來源：**
- 時辰由 `getCurrentShichen()` 即時計算
- 日運由 `calculateUnifiedFortune()` 本地端計算，結合八字+紫微+奇門+占星

**每日運勢自動生成邏輯：**
1. `useEffect` 在畫面掛載時觸發
2. 以 `fortuneGenRef` 防止重複產生
3. 檢查當日 + 時段（morning/afternoon/evening）是否已有 fortune 訊息
4. 呼叫 `calculateUnifiedFortune()` 計算五維運勢分數
5. 呼叫 `generateLocalPetNarration()` 以靈寵口吻包裝結果
6. 透過 `addMessage()` 加入聊天記錄

**養成動作（feed/play/meditate）邏輯：**
1. 檢查等級上限（`canLevelUp(planType)`），若到頂則顯示 UpgradeModal
2. 執行動作（加 EXP + 調整屬性值）
3. 加入對應的聊天氣泡（含 +EXP 標籤）
4. 若升級 → 追加 levelup 氣泡
5. 若進化 → 追加 evolve 氣泡

**功能動作（eye/heart/pearl）邏輯：**
1. 檢查剩餘使用次數（`getRemainingUses()`）
2. 若無剩餘次數 → 顯示 UpgradeModal
3. 否則顯示對應的 Modal overlay

**Feature Result Handlers：**
- `handleEyeResult` → 加入 `type: 'face'` 聊天氣泡，含面相分數
- `handleHeartResult` → 加入 `type: 'fengshui'` 氣泡，含方位宮格
- `handlePearlResult` → 加入 `type: 'divination'` 氣泡，含卦象

---

### 3.5 Profile Screen (`app/(tabs)/profile.tsx`)

**外觀：** 可捲動的設定頁面。

**版面佈局：**
```
┌──────────────────────────┐
│  我的（書法字）           │
│                          │
│ ┌──────────────────────┐ │
│ │ 🦌  青芽鹿           │ │
│ │     Lv.1 青芽鹿      │ │
│ │     木系 · 立春    FREE│ │
│ └──────────────────────┘ │
│                          │
│ ⭐ 升級會員解鎖更多功能   │ ← 僅 Free 用戶
│                          │
│ 語言設定                  │
│ ┌──────────────────────┐ │
│ │ LanguageSelector     │ │
│ └──────────────────────┘ │
│                          │
│ 命盤資料                  │
│ ┌──────────────────────┐ │
│ │ 八字    甲子 乙丑... │ │
│ │ 紫微主星  紫微       │ │
│ │ 星座    天秤座       │ │
│ │ 節氣靈寵  🦌 青芽鹿  │ │
│ └──────────────────────┘ │
│                          │
│ 其他                      │
│ ┌──────────────────────┐ │
│ │ 通知設定          ›  │ │
│ │ 隱私權政策        ›  │ │
│ │ 服務條款          ›  │ │
│ │ 關於靈犀          ›  │ │
│ │ 恢復購買          ›  │ │
│ │ 登出 (紅色)          │ │
│ └──────────────────────┘ │
└──────────────────────────┘
```

**使用者互動：**
| 互動 | 邏輯 |
|------|------|
| 升級 CTA | 顯示 UpgradeModal |
| 語言選擇 | 使用 LanguageSelector 元件切換 i18n |
| 恢復購買 | `restorePurchases()` → 更新 planType |
| 登出 | Alert 確認 → `authStore.logout()` → 清除 Token |

---

### 3.6 PetAvatar (`components/PetAvatar.tsx`)

**外觀：** 居中顯示的靈寵頭像區塊。

**元素：**
1. **浮動 Emoji**：64x64 圓形容器，emoji 大小 36pt，使用 `Animated` 實現上下浮動（-6px, 1500ms 週期，sine easing）
2. **資訊列**：靈寵名 + 等級 + 五行系徽章
3. **EXP 進度條**：寬度 70%，4px 高度，金色填充，右側顯示 `45/100`
4. **進化星級**：5 顆星（★），已達成亮金色，未達成 15% 透明度
5. **進化標籤**：`進化階段 1/5`

**資料來源：** `petStore`（emoji, name, level, exp, expToNext, evolution, element）

---

### 3.7 PetChat (`components/PetChat.tsx`)

**外觀：** 佔據主畫面中間區域的可捲動聊天列表。

**結構：**
- 使用 `FlatList`，資料來自 `chatStore.messages`
- 自動在不同日期的訊息之間插入日期分隔線（如 `3/3（一）`）
- 新訊息到達時自動捲動到底部（`scrollToEnd`）
- Loading 狀態：靈寵 emoji + ActivityIndicator + `...`

**氣泡元件 (PetBubble)：**

每個氣泡包含：
- **標頭**：靈寵 emoji + 名字 + 時間（HH:MM）
- **文字**：靈寵口吻的敘述文字
- **經典引用**：斜體顯示（如八字格言）
- **嵌入資料**（依訊息類型）：

| 訊息類型 | 嵌入 UI |
|----------|---------|
| `fortune` | 5 維分數條（財運/桃花/事業/健康/學業）+ 幸運方位/色彩/數字 |
| `face` | 五官分數條（天庭/眉/眼/鼻/口）+ 幸運物品 |
| `fengshui` | 3x3 方位宮格（吉方高亮）+ 幸運方位列表 |
| `divination` | 卦象符號 + 卦名 + 卦辭 + 上下卦 + 五行 |
| `feed/play/meditate` | +EXP 標籤（如 `+50 EXP`） |
| `levelup` | 升級標籤（如 `Lv.5`） |
| `evolve` | 進化標籤（如 `進化階段 2`） |

---

### 3.8 ActionBar (`components/ActionBar.tsx`)

**外觀：** 底部操作列，兩行各三個按鈕。

**按鈕定義：**

| 行 | Key | Emoji | 標籤 | 說明 |
|----|-----|-------|------|------|
| 養成 | `feed` | 🍖 | 餵食 | EXP +50，靈力 +10 |
| 養成 | `play` | 🎾 | 玩耍 | EXP +30，親密度 +15 |
| 養成 | `meditate` | 🧘 | 冥想 | EXP +20，悟性 +10，靈力 +5 |
| 功能 | `eye` | 👁 | 靈眼 | 面相分析（開啟相機） |
| 功能 | `heart` | 🌍 | 靈心 | 風水分析（開啟 GPS + 羅盤） |
| 功能 | `pearl` | 🏮 | 靈魂 | 六十四卦占卜 |

**樣式差異：** 養成按鈕金色調，功能按鈕藍色調。養成按鈕額外顯示 EXP 值。

---

### 3.9 PetEyeMode (`components/features/PetEyeMode.tsx`)

**定位：** 靈眼模式 — 以相機拍攝面部照片，透過 Claude Vision 進行面相分析。

**四個階段：**

#### Phase: idle — 相機拍照
```
┌──────────────────────┐
│                [✕]   │
│ ┌──────────────────┐ │
│ │   相機預覽        │ │
│ │    ┌─────┐       │ │
│ │    │ 👤  │       │ │
│ │    └─────┘       │ │
│ │   (虛線人臉框)   │ │
│ └──────────────────┘ │
│                      │
│ 🦌 靈寵正在觀察你... │
│                      │
│ [ 👁 開始面相分析 ]   │
│                      │
│ ⚠ 照片僅用於分析...  │
└──────────────────────┘
```

**邏輯：**
- 使用 `expo-camera` 的 `CameraView` (前置鏡頭)
- Web 平台自動降級為佔位圖
- 未授權時顯示「授權相機」按鈕
- 拍照使用 `takePictureAsync({ base64: true, quality: 0.7 })`

#### Phase: preview — 確認照片
- 顯示拍攝的照片預覽
- 「重拍」和「開始分析」兩個按鈕

#### Phase: analyzing — 分析中
```
┌──────────────────────┐
│     ┌───────┐        │
│     │  🧑   │        │
│     │ ● ● ● │ ← 偵測點│
│     └───────┘        │
│                      │
│ 🦌 正在觀察你的面相...│
│                      │
│       72%            │
│  定位五官特徵         │
│  ═══════════╌╌╌╌    │
└──────────────────────┘
```

**邏輯：**
1. 消耗使用次數 `useFeature('eye', petLevel)`
2. 若次數不足 → `onQuotaExhausted()` → 顯示 UpgradeModal
3. 模擬進度條（每 100ms +3%，最高 90%）
4. 呼叫 `analyzeFace()` → POST `/ai/face-reading`
5. 結果回傳後進度跳至 100%
6. 透過 `onResult(text, data)` 回傳給 Pet Screen → 產生聊天氣泡
7. 300ms 後自動關閉 Modal

#### Phase: result — 分析結果（獨立瀏覽模式）
- 運勢等級（大字書法體）+ 星級
- 靈寵解讀卡片（AI 回覆或本地敘事）
- 五官分數條（天庭/眉/眼/鼻/口各 0-100）
- 幸運物品卡片（emoji + 名稱 + 原因 + 方位 + 數字）
- 「重新分析」按鈕

---

### 3.10 PetHeartMode (`components/features/PetHeartMode.tsx`)

**定位：** 靈心模式 — GPS 定位 + 磁力計羅盤 + 奇門遁甲方位 + AI 風水分析。

**版面佈局：**
```
┌──────────────────────┐
│                [✕]   │
│ ● GPS 訊號正常       │
│ 25.034°N 121.564°E   │
│              台北市   │
│                      │
│ 🦌 正在感應此地的靈氣 │
│                      │
│     ┌───────────┐    │
│     │     北     │    │
│     │  西  ▲  東 │    │ ← 即時羅盤
│     │     南     │    │    (隨磁力計旋轉)
│     └───────────┘    │
│  時盤 · 午時 · 182°   │
│                      │
│ ┌────────┐ ┌────────┐│
│ │ 吉方   │ │ 凶方   ││
│ │ 東南   │ │ 西北   ││
│ │ (金色) │ │ (紅色) ││
│ └────────┘ └────────┘│
│                      │
│ [ 🧭 分析此地風水 ]   │
│                      │
│ ┌─ 分析結果（展開）─┐ │
│ │ 🦌 此地木氣充沛... │ │
│ │ 📐 座位建議：...   │ │
│ │ 🌿 建議擺放...     │ │
│ └──────────────────┘ │
└──────────────────────┘
```

**感測器使用：**
- `expo-location`：`getCurrentPositionAsync()` + `reverseGeocodeAsync()`
- `expo-sensors`：`Magnetometer` 訂閱（200ms 更新間隔），計算方位角

**羅盤實作：**
- 8 方位標籤（北/東北/東/東南/南/西南/西/西北）
- 吉方亮金色 + 標記點，凶方紅色
- 整個羅盤 CSS 旋轉跟隨磁力計（`transform: rotate(-heading deg)`）
- 中心指針 + 小圓點

**吉凶方位計算：**
- `generateQimenChart(new Date())` → 九宮排盤
- 吉門（開/休/生/景）所在方位 = 吉方
- 凶門（死/傷/驚/杜）所在方位 = 凶方

**分析流程：**
1. 消耗使用次數 `useFeature('heart', petLevel)`
2. 呼叫 `analyzeFengShui()` → POST `/ai/feng-shui`
3. 結果包含：location_analysis、tips、seat_advice
4. 透過 `onResult()` 回傳 → 聊天氣泡（含 3x3 方位宮格）
5. 300ms 後自動關閉

---

### 3.11 PetPearlMode (`components/features/PetPearlMode.tsx`)

**定位：** 靈魂模式 — 易經六十四卦占卜。

**三個階段：**

#### Phase: idle — 選擇問事類別
```
┌──────────────────────┐
│                [✕]   │
│ 🦌 主人有什麼想問... │
│                      │
│ 選擇問事類別：        │
│ ┌────┐ ┌────┐ ┌────┐│
│ │ 💼 │ │ ❤️ │ │ 🏠 ││
│ │事業│ │感情│ │家庭││
│ └────┘ └────┘ └────┘│
│ ┌────┐ ┌────┐       │
│ │ 🏥 │ │ 📚 │       │
│ │健康│ │學業│       │
│ └────┘ └────┘       │
│                      │
│ 輸入問題：            │
│ ┌──────────────────┐ │
│ │（選填，最多100字）│ │
│ └──────────────────┘ │
│                      │
│ [ 🏮 起卦問靈 ]      │
└──────────────────────┘
```

#### Phase: shaking — 搖卦中
```
┌──────────────────────┐
│  ☰☷☳☴☵☲☶☱           │
│  卦象凝聚中...        │
│                      │
│  🦌 正在為主人通靈... │
└──────────────────────┘
```
- 震動回饋（`Vibration.vibrate([0, 80, 60, 80, 60, 80, 60, 150])`）
- 1500ms 後跳轉到結果

#### Phase: result — 占卜結果
```
┌──────────────────────┐
│        ䷀            │ ← Unicode 卦象符號
│   第1卦 · 乾         │
│                      │
│  「元亨利貞」         │
│                      │
│ 天行健，君子以自強不息│
│                      │
│ ┌──────────────────┐ │
│ │ 💼 事業     [大宜]│ │
│ │ 天道運行不息...   │ │
│ │ 七日內宜行動     │ │
│ └──────────────────┘ │
│                      │
│ ┌上卦─┐┌下卦─┐┌五行┐┌運勢┐│
│ │ 乾  ││ 乾  ││ 金 ││大吉││
│ └────┘└────┘└───┘└───┘│
│                      │
│ ── 變卦 ──           │
│ ┌──────────────────┐ │
│ │ ䷁  坤            │ │
│ │ 地勢坤...         │ │
│ │ 變爻：1、3        │ │
│ └──────────────────┘ │
│                      │
│ 🦌 靈寵解讀          │
│                      │
│ ❓ 原始問題回顯       │
│                      │
│ [分享]    [再卜一卦]  │
└──────────────────────┘
```

**占卜邏輯：**
1. 消耗使用次數 `useFeature('soul', petLevel)`
2. `performHexagramDivination(category, question)` → 隨機生成本卦 + 變爻 + 變卦
3. 根據問事類別取得對應解讀（verdict/guidance/timing）
4. 透過 `onResult()` 回傳 → 聊天氣泡（含卦象區塊）

**結果顏色編碼：**
- `大宜` → 金色
- `宜` → 金色偏淡
- `中` → 灰色
- `不宜` → 橙色
- `大忌` → 紅色

---

### 3.12 UpgradeModal (`components/UpgradeModal.tsx`)

**外觀：** 全螢幕半透明遮罩 + 居中模態框。

**版面佈局：**
```
┌──────────────────────┐
│ 🐉 主人，今天次數用  │
│ 完了...升級之後靈寵   │
│ 可以為你做更多事喔！  │
│                      │
│ ┌──────────────────┐ │
│ │ ⭐ 靈犀會員 $390/月│ │
│ │ · 靈眼/靈心/靈魂   │ │
│ │   5次/日           │ │
│ │ · 靈寵上限 Lv.20   │ │
│ │ · AI 深度解讀      │ │
│ │ [ 立即升級 ]       │ │
│ └──────────────────┘ │
│                      │
│ ┌──────────────────┐ │
│ │ 👑 靈犀至尊       │ │
│ │           $1,990/月│ │
│ │ · 全功能無限使用   │ │
│ │ · 靈寵等級無上限   │ │
│ │ · 專屬進化 + 皮膚  │ │
│ │ [ 立即升級 ] (紫色)│ │
│ └──────────────────┘ │
│                      │
│     明天再來          │
└──────────────────────┘
```

**購買邏輯：**
1. 點擊方案卡片 → `purchasePlan(planId)`
2. RevenueCat SDK 取得 offerings → 找到對應 package → `purchasePackage()`
3. 成功後從 customerInfo 取得 entitlement → 映射為 PlanType
4. 更新 `userStore.setPremium(planType)`
5. 關閉 Modal

---

## 4. 資料架構

### 4.1 Zustand Stores（共 4 個）

#### auth-store（認證管理）
| 欄位 | 型別 | 說明 |
|------|------|------|
| `isAuthenticated` | `boolean` | 是否已登入 |
| `isLoading` | `boolean` | 認證操作中 |
| `user` | `AuthUser | null` | 當前用戶（id, email, name, planType） |
| `error` | `string | null` | 錯誤訊息 |

**Actions：** `login()`, `register()`, `loginWithApple()`, `logout()`, `checkAuth()`, `updatePlan()`, `clearError()`

**持久化：** 僅儲存 `isAuthenticated` 和 `user`。

---

#### user-store（用戶命理資料）
| 欄位 | 型別 | 說明 |
|------|------|------|
| `isOnboarded` | `boolean` | 是否完成引導 |
| `userName` | `string` | 姓名 |
| `birthYear/Month/Day/Hour` | `number` | 出生資料 |
| `calendarType` | `'solar' | 'lunar'` | 曆法 |
| `gender` | `'male' | 'female'` | 性別 |
| `bazi` | `BaziResult | null` | 八字命盤 |
| `ziwei` | `ZiweiChart | null` | 紫微斗數命盤 |
| `astrology` | `AstrologyResult | null` | 西洋占星結果 |
| `isPremium` | `boolean` | 是否付費 |
| `planType` | `PlanType` | 方案類型 |
| `dailyUsage` | `{ heart, eye, soul }` | 每日使用計數 |
| `lastUsageDate` | `string` | 上次使用日期 |

**Actions：** `setOnboarding()`, `setPremium()`, `useFeature()`, `getRemainingUses()`, `getAge()`

---

#### pet-store（靈寵資料）
| 欄位 | 型別 | 說明 |
|------|------|------|
| `petId` | `string` | 節氣 ID（如 `01-lichun`） |
| `name` | `string` | 靈寵名（如「青芽鹿」） |
| `creature` | `string` | 靈獸原型（如「鹿」） |
| `element` | `string` | 五行屬性 |
| `solarTerm` | `string` | 節氣名 |
| `season` | `string` | 季節 |
| `zodiac` | `string` | 對應星座 |
| `personality` | `string` | 個性描述 |
| `emoji` | `string` | Emoji |
| `level` | `number` | 等級（初始 1） |
| `exp` | `number` | 經驗值 |
| `expToNext` | `number` | 下一級所需（初始 100，每級 x1.3） |
| `evolution` | `number` | 進化階段（1-5） |
| `power` | `number` | 靈力 0-100 |
| `affinity` | `number` | 親密度 0-100 |
| `wisdom` | `number` | 悟性 0-100 |
| `mood` | `string` | 心情 |

**Actions：** `initPet(month, day)`, `feed()`, `play()`, `meditate()`, `addExp()`, `canLevelUp()`, `getLevelCap()`

**等級解鎖系統：**
| 等級 | 解鎖功能 |
|------|---------|
| Lv.1 | 基本對話 |
| Lv.3 | 運勢提醒 |
| Lv.5 | 穿搭建議 |
| Lv.8 | 方位導航 |
| Lv.10 | 第一次進化 |
| Lv.15 | 深度解讀 |
| Lv.20 | 第二次進化 |
| Lv.25 | 預測功能 |
| Lv.30 | 終極進化 |

---

#### chat-store（對話紀錄）
| 欄位 | 型別 | 說明 |
|------|------|------|
| `messages` | `ChatMessage[]` | 所有訊息（最多保留 200 條） |

**ChatMessage 結構：**
```typescript
{
  id: string;           // 唯一識別碼
  time: string;         // ISO 時間字串
  type: ChatMessageType; // fortune|outfit|face|fengshui|divination|feed|play|meditate|levelup|evolve
  text: string;         // 靈寵口吻文字
  classicQuote?: string; // 古籍引用
  data?: any;           // 附加資料（分數、方位、卦象等）
}
```

**Actions：** `addMessage()`, `clearOldMessages(keepDays)`, `getMessagesByDate(dateStr)`

---

### 4.2 訂閱方案

| 方案 | ID | 月費 | 每功能每日次數 | 等級上限 | 進化上限 | AI 解讀 |
|------|-----|------|--------------|---------|---------|---------|
| 免費版 | `free` | $0 | 1 次 | Lv.10 | 1 階 | 基礎模板 |
| 靈犀會員 | `lingxi_member_monthly` | $390/月 | 5 次 | Lv.20 | 2 階 | AI Haiku |
| 靈犀至尊 | `lingxi_supreme_monthly` | $1,990/月 | 999 次 | 無上限 | 5 階 | AI Sonnet |

**靈寵等級加成：** Lv.10+ 額外 +1 次/日，Lv.20+ 額外 +2 次/日（至尊版不適用）。

---

## 5. 計算引擎

### 5.1 bazi-engine（八字命理引擎）

**檔案：** `services/bazi-engine.ts`

**功能：** 根據出生年月日時計算天干地支、五行比例。

**輸入：** year, month, day, hour
**輸出：** `BaziResult`
- 四柱（年/月/日/時）的天干地支
- 生肖
- 日主（日柱天干）及其五行
- 五行計數 `{ 金: n, 木: n, 水: n, 火: n, 土: n }`
- 最旺 / 最弱五行
- 完整八字字串

**算法要點：**
- 年柱：`(year - 4) % 10` 取天干索引，`(year - 4) % 12` 取地支
- 月柱：五虎遁法推天干，地支固定（正月=寅）
- 日柱：公式近似
- 時柱：根據日干 + 時辰推算

**附帶函式：** `getCurrentShichen(date?)` — 根據小時取得當前時辰。

---

### 5.2 ziwei-engine（紫微斗數引擎）

**檔案：** `services/ziwei-engine.ts`

**功能：** 14 主星排盤 + 12 宮位 + 性格/事業分析。

**輸入：** BaziResult, lunarMonth, lunarDay, gender
**輸出：** `ZiweiChart`
- 12 宮位（每宮含主星、地支）
- 命宮、身宮
- 命主星、身主星
- 主要五行
- 性格概述
- 事業方向
- 感情風格
- 完整命盤字串（給 AI 用）

**14 主星：** 紫微、天機、太陽、武曲、天同、廉貞、天府、太陰、貪狼、巨門、天相、天梁、七殺、破軍

---

### 5.3 qimen-engine（奇門遁甲引擎）

**檔案：** `services/qimen-engine.ts`

**功能：** 每 2 小時一個時盤的九宮排盤。

**輸入：** Date
**輸出：** `QimenChart`
- 9 個宮位（方位 + 三奇六儀 + 八門 + 九星 + 吉凶）
- 當前時辰
- 吉方位列表
- 凶方位列表
- 摘要

**八門分類：**
- 吉門：開門、休門、生門、景門
- 凶門：死門、傷門、驚門、杜門

**注意：** 目前為簡化版，正式版需考慮陰遁/陽遁、上中下三元、值符值使等。

---

### 5.4 hexagram-engine（六十四卦引擎）

**檔案：** `services/hexagram-engine.ts`

**功能：** 易經六十四卦占卜，含變卦機制。

**輸入：** DivinationCategory, question?
**輸出：** `HexagramResult`
- 本卦（id, name, symbol, 上下卦, 卦辭, 詩意句, 五行, 運勢等級）
- 變爻位置（0-5）
- 變卦（若有）
- 五類問事解讀（事業/感情/家庭/健康/學業）

**每卦包含：**
- Unicode 卦象符號
- 卦辭（如「元亨利貞」）
- 詩意句（如「天行健，君子以自強不息」）
- 5 類問事的 verdict（大宜/宜/中/不宜/大忌）+ guidance + timing

**64 卦完整內建：** 所有卦象資料硬編碼在前端。

---

### 5.5 unified-fortune-engine（統一運勢引擎）

**檔案：** `services/unified-fortune-engine.ts`

**功能：** 結合四大體系計算每日綜合運勢。

**輸入：** BaziResult, ZiweiChart, QimenChart, AstrologyResult
**輸出：** `UnifiedFortuneResult`
- 五維分數（財運/感情/事業/健康/學業 各 0-100）
- 綜合分數 + 等級（大吉/中吉/小吉/平/凶）
- 幸運方位、幸運色彩、幸運數字
- 有利/不利五行
- 各系統摘要（八字/紫微/奇門/占星）

**權重配比：**
| 系統 | 權重 |
|------|------|
| 八字 | 35% |
| 紫微斗數 | 30% |
| 奇門遁甲 | 25% |
| 西洋占星 | 10% |

---

### 5.6 astrology-engine（西洋占星引擎）

**檔案：** `services/astrology-engine.ts`

**功能：** 根據出生月日計算太陽星座與對應屬性。

**輸入：** month, day
**輸出：** `AstrologyResult`
- 太陽星座（英文 + 中文 + emoji）
- 西方元素（fire/earth/air/water）
- 對應五行
- 守護星
- 三態（cardinal/fixed/mutable）
- 陰陽
- 性格描述、優勢、弱點

**12 星座完整定義：** 含日期範圍、五行對映、守護星。

---

## 6. AI 整合

### 6.1 後端 API 路由

所有 AI 請求透過 Cloud Run 後端代理。前端不存放 Claude API Key。

| 端點 | 方法 | 功能 | 前端呼叫函式 |
|------|------|------|-------------|
| `/auth/login` | POST | Email 登入 | `authStore.login()` |
| `/auth/register` | POST | Email 註冊 | `authStore.register()` |
| `/auth/apple` | POST | Apple 登入 | `authStore.loginWithApple()` |
| `/auth/refresh` | POST | 更新 Token | 自動重試 |
| `/user/profile` | GET | 取得用戶資料 | `authStore.checkAuth()` |
| `/user/profile` | PUT | 更新用戶資料 | — |
| `/ai/face-reading` | POST | 面相分析（Claude Vision） | `analyzeFace()` |
| `/ai/feng-shui` | POST | 風水分析 | `analyzeFengShui()` |
| `/ai/fortune` | POST | 每日運勢 | `getDailyFortune()` |
| `/ai/outfit` | POST | 穿搭建議 | `getOutfitAdvice()` |
| `/ai/divination` | POST | 占卜解讀 | `getDivinationReading()` |
| `/ai/pet-message` | POST | 靈寵推播訊息 | `generatePetMessage()` |
| `/api/subscription/status` | GET | 訂閱狀態 | — |
| `/webhook/revenuecat` | POST | RevenueCat Webhook | — |

**AI 回傳格式：**
```json
{
  "data": { ... },
  "remaining": 3
}
```

### 6.2 本地靈寵敘事者 (pet-narrator.ts)

**功能：** 在不呼叫 AI API 的情況下，以靈寵口吻生成分析結果敘述。

**機制：**
1. 根據功能類型（fortune/face/fengshui/divination）選擇模板
2. 填入靈寵資料（名字、種類、五行、等級）
3. 根據五行性格（水=溫柔、火=熱情、木=溫和、金=敏銳、土=穩重）調整語氣
4. 支援 6 種語言的敘事風格

**使用場景：**
- 每日運勢的本地計算結果
- AI API 失敗時的 fallback
- 六十四卦占卜結果（完全本地端）

### 6.3 AI 結果流向聊天氣泡

```
用戶觸發功能 → Feature Component 呼叫 API
                    ↓
              收到 AI 結果
                    ↓
     generateLocalPetNarration() 包裝文字
                    ↓
          onResult(text, data)
                    ↓
       pet.tsx → addMessage({ type, text, data })
                    ↓
           chatStore.messages 更新
                    ↓
        PetChat → PetBubble 渲染氣泡
```

---

## 7. i18n 多語言支援

### 7.1 支援語言

| 語言 | 代碼 | 國旗 | 原生名稱 |
|------|------|------|---------|
| 繁體中文 | `zh-TW` | 🇹🇼 | 繁體中文 |
| 簡體中文 | `zh-CN` | 🇨🇳 | 简体中文 |
| 日文 | `ja` | 🇯🇵 | 日本語 |
| 英文 | `en` | 🇺🇸 | English |
| 德文 | `de` | 🇩🇪 | Deutsch |
| 法文 | `fr` | 🇫🇷 | Français |

### 7.2 翻譯統計

- 每個 locale 檔案：**351 個翻譯鍵**
- 檔案位置：`i18n/locales/{lang}.json`
- Fallback 語言：English (`en`)
- 語言偵測：自動偵測系統語言 → 對映到支援的語系

### 7.3 主要翻譯命名空間

| 命名空間 | 涵蓋內容 |
|---------|---------|
| `app` | 應用程式名稱、副標題、標語 |
| `auth` | 登入/註冊表單 |
| `onboarding` | 引導流程 |
| `tabs` | Tab 標籤 |
| `pet` | 靈寵相關 |
| `actionBar` | 動作列標籤 |
| `chat` | 聊天回應 |
| `eye` | 靈眼（面相）功能 |
| `heart` | 靈心（風水）功能 |
| `pearl` | 靈魂（占卜）功能 |
| `home` | 首頁運勢維度 |
| `profile` | 個人設定 |
| `subscription` | 訂閱方案名稱 |
| `upgrade` | 升級彈窗 |
| `ziwei` | 紫微斗數 |
| `astrology` | 西洋占星 |
| `directions` | 八方位翻譯 |
| `petUnlock` | 等級解鎖功能名稱 |
| `common` | 通用文字 |

### 7.4 靈寵敘事多語言

靈寵在不同語言下的稱呼和語氣：
- **繁中**：「主人」，親切可愛的第一人稱
- **簡中**：「主人」，亲切可爱的第一人称
- **日文**：「ご主人様」，親しみやすく可愛らしい口調
- **英文**：「Master」，warm and playful tone
- **德文**：「Meister」，warmem, verspieltem Ton
- **法文**：「Maitre」，ton chaleureux et espiegle

---

## 8. 二十四節氣靈寵系統

每隻靈寵根據出生日期的節氣配對，共 24 隻靈寵：

| 節氣 | 靈寵名 | Emoji | 五行 | 季節 |
|------|--------|-------|------|------|
| 立春 | 青芽鹿 | 🦌 | 木 | 春 |
| 雨水 | 潤澤蛙 | 🐸 | 水 | 春 |
| 驚蟄 | 雷蟲龍 | 🐲 | 木 | 春 |
| 春分 | 衡翼蝶 | 🦋 | 木 | 春 |
| 清明 | 清風鶴 | 🦢 | 木 | 春 |
| 穀雨 | 穀靈兔 | 🐰 | 土 | 春 |
| 立夏 | 炎蟬精 | 🪲 | 火 | 夏 |
| 小滿 | 金穗狐 | 🦊 | 火 | 夏 |
| 芒種 | 芒鳳雀 | 🐦 | 火 | 夏 |
| 夏至 | 日輪獅 | 🦁 | 火 | 夏 |
| 小暑 | 螢火靈 | ✨ | 火 | 夏 |
| 大暑 | 烈陽鷹 | 🦅 | 土 | 夏 |
| 立秋 | 金風虎 | 🐯 | 金 | 秋 |
| 處暑 | 涼蟬仙 | 🪲 | 金 | 秋 |
| 白露 | 露珠蛇 | 🐍 | 金 | 秋 |
| 秋分 | 月衡鶴 | 🦢 | 金 | 秋 |
| 寒露 | 霜菊貓 | 🐱 | 水 | 秋 |
| 霜降 | 霜狼靈 | 🐺 | 水 | 秋 |
| 立冬 | 冬眠熊 | 🐻 | 水 | 冬 |
| 小雪 | 雪兔仙 | 🐇 | 水 | 冬 |
| 大雪 | 雪鴞靈 | 🦉 | 水 | 冬 |
| 冬至 | 玄冰龍 | 🐉 | 水 | 冬 |
| 小寒 | 寒星鯨 | 🐋 | 水 | 冬 |
| 大寒 | 極光鳳 | 🔥 | 土 | 冬 |

每隻靈寵都有獨特的個性描述，影響對話語氣和敘事風格。

---

## 附錄：專案檔案結構

```
C:\Dev\LingXi\
├── app/
│   ├── _layout.tsx          # Root Layout（路由守衛+初始化）
│   ├── index.tsx            # 入口重導向 → /(tabs)/pet
│   ├── auth.tsx             # 登入/註冊頁
│   ├── onboarding.tsx       # 5 步引導頁
│   └── (tabs)/
│       ├── _layout.tsx      # Tab 導航（2 Tab）
│       ├── pet.tsx          # 靈寵中心主畫面
│       └── profile.tsx      # 我的設定
├── components/
│   ├── ActionBar.tsx        # 6 個動作按鈕
│   ├── ErrorBoundary.tsx    # 錯誤邊界
│   ├── LanguageSelector.tsx # 語言切換元件
│   ├── PetAvatar.tsx        # 靈寵頭像（浮動動畫+EXP）
│   ├── PetBubble.tsx        # 聊天氣泡（含嵌入資料）
│   ├── PetChat.tsx          # 聊天列表
│   ├── UpgradeModal.tsx     # 升級方案彈窗
│   ├── WheelPicker.tsx      # 滾輪選擇器
│   └── features/
│       ├── PetEyeMode.tsx   # 靈眼（相機面相）
│       ├── PetHeartMode.tsx # 靈心（GPS 風水）
│       └── PetPearlMode.tsx # 靈魂（64 卦占卜）
├── config/
│   ├── constants.ts         # 玄學常數（天干地支+24節氣靈寵）
│   ├── prompts.ts           # AI Prompt 模板
│   └── theme.ts             # 主題色彩+字型+間距
├── i18n/
│   ├── index.ts             # i18n 初始化
│   └── locales/
│       ├── zh-TW.json       # 繁體中文（351 keys）
│       ├── zh-CN.json       # 簡體中文
│       ├── ja.json          # 日文
│       ├── en.json          # 英文
│       ├── de.json          # 德文
│       └── fr.json          # 法文
├── services/
│   ├── api-client.ts        # Cloud Run API 串接（JWT）
│   ├── astrology-engine.ts  # 西洋占星引擎
│   ├── bazi-engine.ts       # 八字命理引擎
│   ├── claude-api.ts        # Claude AI API 呼叫層
│   ├── divination-engine.ts # 占卜引擎（基礎）
│   ├── hexagram-engine.ts   # 六十四卦引擎
│   ├── i18n-prompts.ts      # 多語言 Prompt 工具
│   ├── pet-narrator.ts      # 靈寵敘事者
│   ├── qimen-engine.ts      # 奇門遁甲引擎
│   ├── subscription-service.ts # RevenueCat 訂閱服務
│   ├── unified-fortune-engine.ts # 統一運勢引擎
│   └── ziwei-engine.ts      # 紫微斗數引擎
└── stores/
    ├── auth-store.ts        # 認證狀態
    ├── chat-store.ts        # 對話紀錄
    ├── pet-store.ts         # 靈寵狀態
    └── user-store.ts        # 用戶命理資料
```

---

> 文件生成時間：2026-03-03
> 基於實際程式碼分析，非設計稿。
