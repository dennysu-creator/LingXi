# 靈犀 V4 — Claude Code Handoff Pack

**版本** v4.0 · Pet-First Immersive · 2026-04-19
**Designer** Claude (design sandbox) → **Dev** Claude Code (本機 repo `LingXi/`)

---

## 這包是什麼

把 V4 設計方向交給你(Claude Code)去改本機 `LingXi/` repo。
目標是把目前的 Home 從「上下卡片堆」改成「靈寵占滿畫面、UI 漂浮其上」的沉浸式介面。

## 四份文件

| 檔案 | 用途 |
|---|---|
| `v4-polish-spec.md` | **主要實作規格** — 逐個 component / file 該怎麼改 |
| `cleanup-checklist.md` | **清理舊檔** — 哪些 generate_*.py / DEV-PROGRESS / 舊 PPTX 可以刪 |
| `screenshots/` | Before(現狀)+ After(V4 open / closed / 三個 alt 版本)對照圖 |
| `tokens.diff.md` | `config/theme.ts` 該新增的 tokens |

## 執行順序

1. 先讀 `v4-polish-spec.md` §0「整體方向」確認你懂設計 intent
2. 跟 §1「Theme tokens」把 `config/theme.ts` patch 上去
3. 按 §2–§6 改 components(`PetAvatar` → `PetBubble` → `ActionBar` → Home `index.tsx` → `PetChat`)
4. 跑 `npx expo start` 肉眼對照 `screenshots/v4-open.png` 和 `v4-closed.png`
5. 最後跑 `cleanup-checklist.md` 砍舊檔

## 不做的事

- ❌ 不改後端 / engines / services / stores 的邏輯
- ❌ 不動 i18n 字串(只動 UI)
- ❌ 不新增套件(用現有 react-native + expo-linear-gradient + 既有 svg)
- ❌ 不做 V1/V2/V3/V5 那三個 alt 版本(只做 V4)

## 驗收

打開 App → Home 應該長得跟 `screenshots/v4-open.png` 一樣:
- 靈寵占滿整個畫面
- 頂部只有一條 chip(暱稱 + Lv + 等級進度點)
- 右側兩顆浮動按鈕(eye 占卜模式 / heart 互動)
- 底部訊息卡可以向下滑收起 → 變成 `v4-closed.png` 的純沉浸模式
- 底部五顆 tab 維持,但背景改透明 + 上方加光暈遮罩
