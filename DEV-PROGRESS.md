# LingXi (靈犀) App — 開發進度紀錄

> 供換電腦後接續開發用。開新 Claude Code 對話時貼：
> 「請讀 DEV-PROGRESS.md 了解目前進度，繼續開發靈犀 App」

## 專案位置
Google Drive 共用硬碟（路徑依電腦掛載位置不同）：
`共用雲端硬碟/有泉科技有限公司/內部開發/APP/算命系統/LingXi/`

## 技術架構
- **前端**: React Native + Expo SDK 54 + Expo Router + TypeScript
- **後端**: Node.js/Express/TypeScript → Cloud Run（`server/` 目錄）
- **資料庫**: Cloud SQL (PostgreSQL)
- **AI**: Claude API（透過 Cloud Run 代理，前端不存 API Key）
- **付費**: RevenueCat 3 檔訂閱（Free / Member NT$149 / Supreme NT$399）
- **認證**: Apple Sign-In + Email/Password (JWT)
- **狀態管理**: Zustand
- **i18n**: i18next（6 語系：zh-TW, zh-CN, ja, en, de, fr）

## 重要注意事項（踩過的坑）
- PetStore 用 `creature` 不是 `type`（已全面修正 8 個檔案）
- 後端 auth 回傳欄位是 `accessToken`（不是 `token`）
- AstrologyResult 用 `signChinese`（不是 `zodiac`）
- `firebaseConfig.ts` 已棄用，改用 `services/api-client.ts`
- `@anthropic-ai/sdk` 已從前端 package.json 移除，只在 server/ 使用
- **node_modules 不要裝在 Google Drive 上**，速度極慢。用 symlink 指到本地磁碟：
  ```bash
  # 在本地建 node_modules 目錄
  mkdir -p C:\dev\lingxi-modules\node_modules
  # 在專案目錄建 symlink（需管理員或開發者模式）
  mklink /D "你的LingXi路徑\node_modules" "C:\dev\lingxi-modules\node_modules"
  # 然後正常跑 npm install
  cd "你的LingXi路徑"
  npm install --legacy-peer-deps
  ```
- server/ 的 node_modules 也建議同樣做法

---

## 完成狀態（截至 2026-03-02）

### Phase 1: 前端程式碼修復 ✅
- [x] `services/api-client.ts` — 新建，取代 firebaseConfig.ts（JWT token 管理、自動 refresh、retry 邏輯）
- [x] `services/claude-api.ts` — 重寫，所有 AI 呼叫透過 Cloud Run 代理
- [x] `services/subscription-service.ts` — 重寫，真實 RevenueCat SDK 整合
- [x] `.env.example` — 更新，移除 Firebase 變數
- [x] `package.json` — 移除 firebase、@anthropic-ai/sdk；新增 @react-native-async-storage/async-storage、expo-apple-authentication
- [x] 修復所有 `s.type` → `s.creature`（8 個檔案）
- [x] 修復 `astrology?.zodiac` → `astrology?.signChinese`
- [x] 修復 hexagram-engine.ts 未使用變數（`trigramNames`）
- [x] 修復 unified-fortune-engine.ts studyElement 邏輯錯誤
- [x] 修復 user-store.ts 未使用 import（`determinePetElement`、`getSpiritPetByDate`）
- [x] 修復 pearl.tsx 未使用 import/變數（`getCategoryLabel`、`planType`）
- [x] 修復 onboarding.tsx 未使用狀態（`petReady`）

### Phase 2: 後端 API Server ✅（server/ 目錄，15 檔）
- [x] `server/package.json` + `tsconfig.json`
- [x] `server/Dockerfile`（兩階段 Docker build）
- [x] `server/src/index.ts`（Express + CORS + helmet + rate limiting）
- [x] `server/src/config/database.ts`（PostgreSQL 連線池）
- [x] `server/src/middleware/auth.ts`（JWT 中間件）
- [x] `server/src/db/schema.sql`（users, pets, daily_usage, messages）
- [x] `server/src/services/claude.ts`（Anthropic SDK wrapper + Vision + prompt cache）
- [x] `server/src/services/revenuecat.ts`（Webhook 驗證 + plan 映射）
- [x] `server/src/routes/auth.ts`（Apple Sign-In、register、login、refresh）
- [x] `server/src/routes/user.ts`（GET/PUT profile）
- [x] `server/src/routes/pet.ts`（get pet、feed/play/meditate + level up）
- [x] `server/src/routes/ai.ts`（6 AI endpoints + 8 system prompts）
- [x] `server/src/routes/subscription.ts`（RevenueCat webhook + status）

### Phase 3: 前端認證 + API 整合 ✅
- [x] `stores/auth-store.ts` — 新建（login, register, loginWithApple, logout, checkAuth）
- [x] `app/auth.tsx` — 新建（Apple Sign-In + Email 登入頁面）
- [x] `app/_layout.tsx` — 重寫（auth check → auth/onboarding/tabs 路由 + ErrorBoundary）
- [x] `app.json` — 新增 expo-apple-authentication plugin、usesAppleSignIn、bundleIdentifier → com.youquan.lingxi

### Phase 4: 真實裝置功能 ✅
- [x] `components/features/PetEyeMode.tsx` — 重寫（expo-camera CameraView + Claude Vision API）
- [x] `components/features/PetHeartMode.tsx` — 重寫（expo-location GPS + expo-sensors Magnetometer 羅盤 + Claude 風水 API）
- [x] `components/features/PetPearlMode.tsx` — 修復 s.creature

### Phase 5: RevenueCat 訂閱整合 ✅
- [x] `app/(tabs)/pet.tsx` — 升級 Modal 接入真實 purchasePlan()（NT$149/399 定價）
- [x] `app/(tabs)/profile.tsx` — 新增恢復購買按鈕 + auth store logout 整合

### Phase 6: 錯誤處理 ✅
- [x] `components/ErrorBoundary.tsx` — 新建全局錯誤邊界
- [x] `app/_layout.tsx` — 包裹 ErrorBoundary
- [x] `services/api-client.ts` — 新增 retry 邏輯（網路錯誤最多重試 2 次）

### Phase 7: Apple Store 上架準備 ✅（部分）
- [x] `eas.json` — 新建 EAS Build 配置

### 靜態程式碼掃描 ✅
- [x] 已手動掃描 25+ 個檔案，修復所有可預見的 TypeScript 問題
- [x] 等待 `npx tsc --noEmit` 跑完做最終驗證

---

## ⏳ 下一步（尚未完成）

### 最優先：編譯驗證
```bash
# 1. 先建立 node_modules symlink（避免 Google Drive 慢速）
mkdir -p C:\dev\lingxi-modules\node_modules
mklink /D "你的LingXi路徑\node_modules" "C:\dev\lingxi-modules\node_modules"

# 2. 安裝依賴 + 編譯驗證
cd "你的LingXi路徑"
npm install --legacy-peer-deps
npx tsc --noEmit          # 修復所有 TypeScript 錯誤

# 3. 後端
mkdir -p C:\dev\lingxi-modules\server-node_modules
mklink /D "你的LingXi路徑\server\node_modules" "C:\dev\lingxi-modules\server-node_modules"
cd server
npm install
npx tsc --noEmit          # 驗證後端編譯

# 4. 啟動測試
cd ..
npx expo start            # 驗證 Metro bundler
```

### 部署
- [ ] 設定真實 `.env`（Cloud Run API URL、RevenueCat key、Weather key）
- [ ] 建立 Cloud SQL PostgreSQL 實例 + 執行 `server/src/db/schema.sql`
- [ ] 部署 server/ 到 Cloud Run
- [ ] 在 RevenueCat 設定 App Store Connect 訂閱商品
- [ ] `eas build --platform ios`
- [ ] TestFlight 測試
- [ ] 正式送審 App Store

### 尚缺的資產
- [ ] App Icon（已有 ICON_SPEC 規格但尚未製作）
- [ ] Splash Screen 圖片
- [ ] Privacy Policy URL
- [ ] Terms of Service URL
- [ ] App Store 截圖（6.7" + 5.5"）
- [ ] App 描述（中/英文）

---

## 檔案清單

### 新建檔案
```
services/api-client.ts
stores/auth-store.ts
app/auth.tsx
components/ErrorBoundary.tsx
eas.json
server/（整個目錄 15 檔）
```

### 重寫檔案
```
services/claude-api.ts
services/subscription-service.ts
components/features/PetEyeMode.tsx
components/features/PetHeartMode.tsx
app/_layout.tsx
```

### 修改檔案
```
package.json
app.json
.env.example
app/(tabs)/pet.tsx
app/(tabs)/profile.tsx
app/(tabs)/index.tsx
app/(tabs)/eye.tsx
app/(tabs)/heart.tsx
app/(tabs)/pearl.tsx
components/features/PetPearlMode.tsx
services/unified-fortune-engine.ts
services/hexagram-engine.ts
stores/user-store.ts
app/onboarding.tsx
```
