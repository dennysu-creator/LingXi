#!/usr/bin/env python3
"""Generate LingXi App UI Operation Screens PPT — 2026-03-16"""

from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

# ── Colors ──────────────────────────────────────────────
BLACK = RGBColor(0x08, 0x08, 0x0F)
DARK_BG = RGBColor(0x12, 0x12, 0x1A)
SURFACE = RGBColor(0x0D, 0x0D, 0x15)
GOLD = RGBColor(0xE8, 0xC5, 0x47)
GOLD_DIM = RGBColor(0xB8, 0x9A, 0x30)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
LGRAY = RGBColor(0xCC, 0xCC, 0xCC)
MUTED = RGBColor(0x8B, 0x7D, 0x5E)
DARK_TXT = RGBColor(0x6B, 0x63, 0x50)
GREEN = RGBColor(0x64, 0xC8, 0x80)
PURPLE = RGBColor(0xA7, 0x8B, 0xFA)
RED = RGBColor(0xC4, 0x40, 0x40)
PET_BLUE = RGBColor(0x64, 0xB4, 0xFF)

prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)

def set_bg(slide, color=BLACK):
    slide.background.fill.solid()
    slide.background.fill.fore_color.rgb = color

def tb(slide, l, t, w, h, text, sz=14, clr=WHITE, bold=False, align=PP_ALIGN.LEFT, font="Microsoft JhengHei"):
    box = slide.shapes.add_textbox(Inches(l), Inches(t), Inches(w), Inches(h))
    tf = box.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = text; p.font.size = Pt(sz); p.font.color.rgb = clr
    p.font.bold = bold; p.font.name = font; p.alignment = align
    return box

def para(tf, text, sz=14, clr=WHITE, bold=False, align=PP_ALIGN.LEFT, sp=Pt(2)):
    p = tf.add_paragraph(); p.text = text; p.font.size = Pt(sz); p.font.color.rgb = clr
    p.font.bold = bold; p.font.name = "Microsoft JhengHei"; p.alignment = align
    if sp: p.space_before = sp
    return p

def rect(slide, l, t, w, h, fill=DARK_BG, border=GOLD_DIM, bw=Pt(1)):
    s = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(l), Inches(t), Inches(w), Inches(h))
    s.fill.solid(); s.fill.fore_color.rgb = fill; s.line.color.rgb = border; s.line.width = bw
    return s

def title_bar(slide, text, sub=""):
    tb(slide, 0.5, 0.3, 12, 0.5, text, sz=28, clr=GOLD, bold=True)
    if sub: tb(slide, 0.5, 0.8, 12, 0.3, sub, sz=13, clr=MUTED)

def phone(slide, l, t, w=2.6, h=5.0, title="", lines=None, accent=GOLD):
    rect(slide, l, t, w, h, fill=RGBColor(0x0E, 0x0E, 0x16), border=accent, bw=Pt(2))
    rect(slide, l+w/2-0.35, t+0.06, 0.7, 0.12, fill=RGBColor(0x1A,0x1A,0x25), border=RGBColor(0x1A,0x1A,0x25))
    if title:
        tb(slide, l+0.1, t+0.25, w-0.2, 0.3, title, sz=11, clr=accent, bold=True, align=PP_ALIGN.CENTER)
    if lines:
        y = t + 0.58
        for ln in lines:
            if y > t + h - 0.3: break
            s, c, b = 10, LGRAY, False
            if ln.startswith("##"):
                ln = ln[2:].strip(); s = 11; c = accent; b = True
            elif ln.startswith("**"):
                ln = ln[2:].strip().rstrip("*"); b = True; c = WHITE
            elif ln.startswith("@@"):
                ln = ln[2:].strip(); c = MUTED; s = 9
            tb(slide, l+0.12, y, w-0.24, 0.24, ln, sz=s, clr=c, bold=b)
            y += 0.23

def card(slide, l, t, w, h, title, bullets, tc=GOLD, bc=LGRAY, fc=DARK_BG, ts=15, bs=12):
    rect(slide, l, t, w, h, fill=fc)
    box = slide.shapes.add_textbox(Inches(l+0.15), Inches(t+0.1), Inches(w-0.3), Inches(h-0.2))
    tf = box.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = title; p.font.size = Pt(ts); p.font.color.rgb = tc; p.font.bold = True; p.font.name = "Microsoft JhengHei"
    for b in bullets:
        para(tf, f"• {b}", sz=bs, clr=bc, sp=Pt(2))


# ════════════════════════════════════════════════════════
# SLIDE 1 — Cover
# ════════════════════════════════════════════════════════
s = prs.slides.add_slide(prs.slide_layouts[6]); set_bg(s)
for y_pos in [1.2, 6.0]:
    r = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(2), Inches(y_pos), Inches(9.333), Pt(2))
    r.fill.solid(); r.fill.fore_color.rgb = GOLD; r.line.fill.background()

tb(s, 0, 1.6, 13.333, 0.8, "🔮", sz=48, align=PP_ALIGN.CENTER)
tb(s, 0, 2.3, 13.333, 1.0, "靈犀 LING XI", sz=44, clr=GOLD, bold=True, align=PP_ALIGN.CENTER)
tb(s, 0, 3.2, 13.333, 0.5, "App UI 操作畫面說明", sz=24, align=PP_ALIGN.CENTER)
tb(s, 0, 3.8, 13.333, 0.4, "AI 命理寵物互動應用程式", sz=16, clr=MUTED, align=PP_ALIGN.CENTER)
tb(s, 0, 5.0, 13.333, 0.4, "v1.0.0  ·  2026-03-16", sz=18, clr=GOLD_DIM, bold=True, align=PP_ALIGN.CENTER)
tb(s, 0, 5.5, 13.333, 0.3, "有泉科技 YouQuan Technology", sz=13, clr=MUTED, align=PP_ALIGN.CENTER)


# ════════════════════════════════════════════════════════
# SLIDE 2 — 登入 / 註冊
# ════════════════════════════════════════════════════════
s = prs.slides.add_slide(prs.slide_layouts[6]); set_bg(s)
title_bar(s, "01  登入 / 註冊畫面", "app/auth.tsx")

phone(s, 0.5, 1.3, 3.0, 5.6, "登入模式", [
    "", "## 🔮 靈犀", "@@LING XI", "",
    "** 繼續使用 Apple 帳號",
    "───── 或 ─────", "",
    "## 登入帳號", "",
    "@@電子郵件",
    "   your@email.com",
    "@@密碼",
    "   ••••••••", "",
    "**┃     登     入     ┃", "",
    "@@沒有帳號？ 註冊",
])

phone(s, 3.8, 1.3, 3.0, 5.6, "註冊模式", [
    "", "## 🔮 靈犀", "@@LING XI", "",
    "** 繼續使用 Apple 帳號",
    "───── 或 ─────", "",
    "## 註冊帳號", "",
    "@@姓名",
    "   請輸入你的名字",
    "@@電子郵件",
    "   your@email.com",
    "@@密碼",
    "   請輸入密碼", "",
    "**┃     註     冊     ┃",
    "@@已有帳號？ 登入",
])

card(s, 7.2, 1.3, 5.6, 2.0, "🔐 認證方式", [
    "Apple Sign-In — iOS 原生按鈕（請求 fullName + email）",
    "Email / Password 登入 — JWT token 存於 AsyncStorage",
    "Email / Password 註冊 — 必填：姓名、電子郵件、密碼",
    "底部連結切換 登入 ↔ 註冊 模式",
])
card(s, 7.2, 3.55, 5.6, 1.6, "💡 UX 處理", [
    "認證中：全螢幕 Loading overlay +「認證中...」Spinner",
    "錯誤：紅色邊框卡片顯示具體錯誤訊息",
    "Logo：「靈犀」毛筆字 56px + 金色光暈陰影",
    "輸入框：金色微透明底 + 金色細邊框 + 圓角 12",
])
card(s, 7.2, 5.4, 5.6, 1.5, "⚙️ 後端路由", [
    "POST /auth/login — Email 密碼登入",
    "POST /auth/register — 註冊（含 email 格式 + 生日範圍驗證）",
    "POST /auth/apple — Apple Sign-In JWT 驗證",
    "POST /auth/refresh — Token 自動更新",
])


# ════════════════════════════════════════════════════════
# SLIDE 3 — Onboarding 1/2
# ════════════════════════════════════════════════════════
s = prs.slides.add_slide(prs.slide_layouts[6]); set_bg(s)
title_bar(s, "02  新手引導流程 (1/2)", "app/onboarding.tsx — Step 0~2")

phone(s, 0.3, 1.3, 2.6, 5.3, "Step 0 · 語言選擇", [
    "", "## 🌐", "",
    "## 選擇語言",
    "@@請選擇你偏好的語言", "",
    "🇹🇼 繁體中文        ✓",
    "🇨🇳 简体中文",
    "🇯🇵 日本語",
    "🇺🇸 English",
    "🇩🇪 Deutsch",
    "🇫🇷 Français", "", "",
    "**┃   下 一 步   ┃",
])

phone(s, 3.2, 1.3, 2.6, 5.3, "Step 1 · 歡迎", [
    "", "## 🐉", "",
    "## 靈犀",
    "@@LING XI", "",
    "AI 面相 · 八字命理",
    "紫微斗數 · 奇門遁甲",
    "靈寵陪伴 · 即時風水", "",
    "@@— 你的隨身玄學生活顧問 —",
    "", "", "",
    "**┃  開始體驗 ✦  ┃",
])

phone(s, 6.1, 1.3, 2.6, 5.3, "Step 2 · 姓名輸入", [
    "", "## 你是誰？", "",
    "請告訴靈犀你的名字",
    "@@讓靈寵認識你", "",
    "@@稱呼",
    "┌────────────┐",
    "│ 請輸入你的名字  │",
    "│ 或暱稱          │",
    "└────────────┘",
    "@@(最多 20 字元)", "", "", "",
    "**┃   下 一 步   ┃",
])

card(s, 9.0, 1.3, 3.9, 5.3, "📝 引導說明", [
    "共 5 步驟（0~4），進度點顯示當前位置",
    "",
    "Step 0 — 語言選擇",
    "  自動偵測裝置語系（Hant→繁中）",
    "  6 種語言，選擇後 UI 即時切換",
    "  選中項金色高亮 + ✓ 標記",
    "",
    "Step 1 — 品牌展示",
    "  列出 6 大核心功能",
    "  毛筆字「靈犀」fontSize 48",
    "",
    "Step 2 — 姓名輸入",
    "  必填欄位，空白時按鈕禁用",
    "  最多 20 字元限制",
    "",
    "所有輸入框：",
    "  金色微透明底 + 金色邊框",
    "  宋體字型",
], bs=10)


# ════════════════════════════════════════════════════════
# SLIDE 4 — Onboarding 2/2
# ════════════════════════════════════════════════════════
s = prs.slides.add_slide(prs.slide_layouts[6]); set_bg(s)
title_bar(s, "02  新手引導流程 (2/2)", "Step 3 生辰資料 → Step 4 靈寵召喚")

phone(s, 0.3, 1.3, 3.2, 5.6, "Step 3 · 生辰輸入", [
    "## 你的生辰",
    "@@八字命理需要精確的出生時間", "",
    "☀ 國曆（西元） │ 🌙 農曆", "",
    "@@出生日期",
    "┌───┐┌───┐┌───┐",
    "│ 年  ││ 月  ││ 日  │ ← 滾輪",
    "└───┘└───┘└───┘",
    "@@(1930~2026)(1~12)(動態)", "",
    "@@出生時辰（橫向捲動）",
    "子 丑 寅 卯 辰 巳",
    "午 未 申 酉 戌 亥",
    "@@[不知道時辰] (預設)", "",
    "@@性別:  ♂ 男  │  ♀ 女", "",
    "[返回]    [召喚靈寵 ✦]",
])

phone(s, 3.8, 1.3, 3.2, 5.6, "Step 4 · 靈寵降臨", [
    "", "## 🦌 (80px)", "",
    "## 靈寵已降臨！",
    "「青芽鹿」已與你建立靈犀之約", "",
    "**紫微命盤:",
    "  命宮主星 + 性格描述",
    "**西洋占星:",
    "  ♓ 雙魚座 · 水 · 海王星", "",
    "**解鎖路線圖:",
    "Lv.1 💬 Lv.3 🔔 Lv.5 👔",
    "Lv.8 🧭 Lv.10 ✨", "",
    "免費版│會員版│至尊版", "",
    "**┃  進入靈犀 ✦  ┃",
])

card(s, 7.3, 1.3, 5.5, 2.8, "📅 Step 3 細節", [
    "曆法切換：國曆 ↔ 農曆（含閏月處理）",
    "WheelPicker 滾輪選擇器：iOS 風格, 5 項可見, 44px/項",
    "  選中: 18px 金色粗體 + 金色指示條",
    "  相鄰: 16px 灰色 → 遠端: 14px 半透明",
    "  外部 selectedIndex 變更時自動重新滾動 (已修復)",
    "12 時辰：子時(23-01) 到 亥時(21-23)，含「不知道」選項",
    "性別：♂/♀ Toggle，影響八字計算",
], bs=11)

card(s, 7.3, 4.35, 5.5, 2.5, "🐉 Step 4 細節", [
    "根據生日節氣自動配對 24 靈寵之一",
    "顯示紫微斗數命盤摘要（命宮主星 + 性格）",
    "顯示西洋占星（星座 emoji + 元素 + 守護星）",
    "解鎖路線圖：Lv.1→3→5→8→10 五個里程碑",
    "三方案預覽：免費/會員($390)/至尊($1990)",
    "完成後存入 user-store + 同步後端 → 導航至主畫面",
], bs=11)


# ════════════════════════════════════════════════════════
# SLIDE 5 — Main Pet Screen
# ════════════════════════════════════════════════════════
s = prs.slides.add_slide(prs.slide_layouts[6]); set_bg(s)
title_bar(s, "03  主畫面 — 靈寵互動", "app/(tabs)/pet.tsx — 核心畫面，兩種狀態佈局")

phone(s, 0.3, 1.3, 3.0, 5.6, "一般狀態（無功能啟動）", [
    "**靈犀     3月16日·午時",
    "@@Lv.5 青芽鹿 · 木系", "",
    "      🦌 (浮動動畫)",
    "     Lv.5 青芽鹿 · 木系",
    "     ████░░ EXP 65%",
    "     ★★★★★ 進化 2/5", "",
    "## [對話區 PetChat]",
    "  🦌 青芽鹿  10:30",
    "  今日運勢概覽...",
    "  財運 ████ 桃花 ███", "",
    "🍖餵食 🎾玩耍 🧘冥想",
    "👁靈眼  🌍靈心  🏮靈魂",
])

phone(s, 3.6, 1.3, 3.0, 5.6, "功能啟動狀態", [
    "**靈犀     3月16日·午時",
    "@@Lv.5 青芽鹿 · 木系", "",
    "┌──────────────┐",
    "│                  │",
    "│  [功能面板區域]   │",
    "│  靈眼/靈心/靈魂   │",
    "│  佔據全部空間     │",
    "│                  │",
    "│  頭像+對話隱藏    │",
    "│  最大操作空間     │",
    "│                  │",
    "└──────────────┘",
    "",
    "👁靈眼  🌍靈心  🏮靈魂",
    "@@(養成列隱藏, 僅功能列)",
])

card(s, 7.0, 1.3, 5.8, 1.8, "📱 Status Bar", [
    "左:「靈犀」毛筆字 18px 金色",
    "中:「{月}月{日}日 · {時辰}時」11px (flex:1, 置中)",
    "右:「Lv.{n} {petName} · {element}系」11px 灰色",
    "paddingTop 54 (SafeArea)",
])

card(s, 7.0, 3.35, 2.8, 2.0, "🍖 養成操作", [
    "餵食 🍖 +50 EXP",
    "玩耍 🎾 +30 EXP",
    "冥想 🧘 +20 EXP",
    "經驗值 ×1.3/級",
    "每 10 級進化一次",
], bs=11)

card(s, 10.0, 3.35, 2.8, 2.0, "✨ 功能切換", [
    "👁 靈眼 → 面相分析",
    "🌍 靈心 → 風水羅盤",
    "🏮 靈魂 → 易經占卜",
    "再按同鈕 → 關閉",
    "啟動時金色高亮",
], bs=11)

card(s, 7.0, 5.6, 5.8, 1.3, "🦌 PetAvatar 靈寵頭像", [
    "浮動動畫：正弦波 ±6px, 1500ms 週期",
    "功能啟動時：邊框變色 + 脈衝縮放 1.0~1.08 + 功能 icon 浮現",
    "EXP 進度條：70% 寬金色填充 | 5 顆進化星星 | 「進化階段 n/5」",
], bs=11)


# ════════════════════════════════════════════════════════
# SLIDE 6 — Eye Mode
# ════════════════════════════════════════════════════════
s = prs.slides.add_slide(prs.slide_layouts[6]); set_bg(s)
title_bar(s, "04  靈眼模式 — AI 面相分析", "components/features/PetEyeMode.tsx — 4 Phase")

phone(s, 0.2, 1.3, 2.5, 5.0, "Phase 1: 拍照", [
    "                    ✕",
    "┌──────────┐",
    "│ 📷 前置相機  │",
    "│  (240px高)   │",
    "│  ╭────╮   │",
    "│  │ 👤   │   │",
    "│  │橢圓框│   │",
    "│  ╰────╯   │",
    "└──────────┘",
    "🦌 正在凝視你的面相...", "",
    "",
    "**┃ 👁 啟動靈寵之眼 ┃",
])

phone(s, 2.9, 1.3, 2.5, 5.0, "Phase 2: 預覽", [
    "                    ✕",
    "┌──────────┐",
    "│ 📸 拍攝結果  │",
    "│  (200px高)   │",
    "│              │",
    "│  已拍照片    │",
    "│              │",
    "└──────────┘", "", "", "",
    "",
    "[重拍]    [開始分析]",
])

phone(s, 5.6, 1.3, 2.5, 5.0, "Phase 3: 分析中", [
    "",
    "   ╭────╮",
    "   │ 🧑  │",
    "   │· · ·│ 偵測點",
    "   ╰────╯", "",
    "🦌 發現了！看到了...", "",
    "## 68%",
    "@@面相推算中...",
    "████████░░░░", "",
])

phone(s, 8.3, 1.3, 2.5, 5.0, "Phase 4: 結果", [
    "",
    "## 中吉 (毛筆46px)",
    "★★★★☆  80分", "",
    "🦌 靈寵解讀:",
    "天庭飽滿...", "",
    "天庭 ████░ 82",
    "眉運 ███░░ 75",
    "眼運 ████░ 88",
    "鼻運 ███░░ 70",
    "口運 ████░ 85", "",
    "🍀 幸運物: ...",
    "[重新分析]",
])

card(s, 11.0, 1.3, 2.0, 5.0, "技術", [
    "前鏡頭拍攝",
    "Base64 編碼",
    "→ Claude",
    "  Vision API",
    "",
    "結果→對話",
    "氣泡存入",
    "chat-store",
    "",
    "進度文字:",
    "掃描面部",
    "五官定位",
    "面相推算",
    "靈寵解讀",
    "",
    "模型依方案:",
    "free→Haiku",
    "member→Son",
    "supreme→Op",
], bs=9, ts=12)


# ════════════════════════════════════════════════════════
# SLIDE 7 — Heart Mode
# ════════════════════════════════════════════════════════
s = prs.slides.add_slide(prs.slide_layouts[6]); set_bg(s)
title_bar(s, "05  靈心模式 — 即時風水", "components/features/PetHeartMode.tsx — GPS + 羅盤 + 奇門遁甲")

phone(s, 0.3, 1.3, 3.2, 5.6, "靈心操作畫面", [
    "                         ✕",
    "**🟢 GPS 定位",
    "@@25.0330°N, 121.5654°E",
    "  台北市中正區...",
    "🦌 正在感應能量...", "",
    "     ┌────────┐",
    "     │  N 北    │",
    "     │ W 🧭 E  │",
    "     │    ↑     │",
    "     │  S 南    │",
    "     └────────┘",
    "@@靈寵能量羅盤 · 午時 · 180°", "",
    "✦ 吉方: 東南   ⚠ 凶方: 西北",
    "",
    "**┃ 🧭 啟動靈寵之心 ┃",
], accent=GREEN)

card(s, 3.8, 1.3, 4.5, 2.5, "🧭 羅盤元件", [
    "140×140px 圓形，跟隨裝置磁力計即時旋轉",
    "8 方位標示：北/東北/東/東南/南/西南/西/西北",
    "吉方：金色粗體 + 金色圓點 ● (奇門遁甲計算)",
    "凶方：紅色顯示",
    "指北針：紅白雙色, 3px 寬 40px 長",
])

card(s, 3.8, 4.05, 4.5, 1.8, "📍 GPS 資訊", [
    "expo-location 座標 + 反向地理編碼取得地名",
    "GPS 卡片 + 靈寵感應合併單行（節省空間）",
    "定位失敗→「定位中...」",
    "按鈕固定底部 bottomBar 佈局",
])

card(s, 8.6, 1.3, 4.3, 2.5, "🔮 分析結果", [
    "靈寵解讀卡：AI 位置風水分析文字",
    "建議卡片：icon + 文字 tip 清單",
    "座位建議：辦公/讀書最佳朝向",
    "3×3 九宮格八門方位圖",
    "結果同時送入對話記錄 (chat-store)",
])

card(s, 8.6, 4.05, 4.3, 1.8, "⚙️ 技術實作", [
    "本地：奇門遁甲 qimen-engine.ts → 八門九星配置",
    "遠端：Claude API 深度位置風水解讀",
    "expo-sensors Magnetometer + expo-location 同時運作",
    "模型：free→Haiku / member→Sonnet / supreme→Opus",
])

card(s, 3.8, 6.1, 9.1, 0.8, "按鈕狀態", [
    "分析前: 🧭「啟動靈寵之心」(綠色調)  |  分析中: 🔄「靈寵正在感應中...」(opacity 0.6)  |  有結果: 可重新分析",
], bs=11)


# ════════════════════════════════════════════════════════
# SLIDE 8 — Pearl Mode
# ════════════════════════════════════════════════════════
s = prs.slides.add_slide(prs.slide_layouts[6]); set_bg(s)
title_bar(s, "06  靈魂模式 — 易經占卜", "components/features/PetPearlMode.tsx — 六十四卦")

phone(s, 0.2, 1.3, 2.7, 5.5, "Phase 1: 選擇提問", [
    "                       ✕",
    "🦌 為你感應天地靈氣...", "",
    "**選擇問事類別:",
    "💼事業 ❤️感情 🏠家庭",
    "    💪健康 📚學業", "",
    "@@請輸入你想問的事情（可留空）",
    "┌────────────┐",
    "│ 這筆投資是否   │",
    "│ 該進行？        │",
    "└────────────┘",
    "@@(最多 100 字)", "",
    "**┃ 🏮 啟動靈寵之魂 ┃",
    "@@(未選類別時禁用)",
])

phone(s, 3.1, 1.3, 2.7, 5.5, "Phase 2: 搖卦動畫", [
    "", "", "",
    "## ☰ ☷ ☳ ☴",
    "## ☵ ☲ ☶ ☱", "",
    "靈珠運轉中...", "",
    "🦌 正在連接靈界...", "", "",
    "@@(裝置震動回饋)",
    "@@(1.5 秒動畫)",
])

phone(s, 6.0, 1.3, 2.7, 5.5, "Phase 3: 卦象結果", [
    "",
    "## ☰  (64px)",
    "**第1卦 · 乾", "",
    "「元亨利貞」", "",
    "**大吉  (verdict badge)",
    "事業類別解讀...",
    "行動指引...",
    "時機建議...", "",
    "@@上卦:乾 下卦:乾",
    "@@五行:金  吉凶:大吉", "",
    "📤分享   [重新求籤]",
])

card(s, 9.0, 1.3, 4.0, 2.2, "🎴 卦象解讀內容", [
    "卦象符號 (64px) + 第 N 卦名 (20px 金色宋體)",
    "卦辭 (Oracle)：金色框，letterSpacing 4",
    "吉凶 badge：大吉=金 中吉=綠 小吉=藍 平=灰 小凶=紅",
    "變卦卡（紫色調）：變卦符號 + 卦名 + 變爻位置",
    "靈寵解籤卡（藍色調）：{emoji} + AI 解讀文字",
])

card(s, 9.0, 3.75, 4.0, 1.6, "🔧 互動功能", [
    "5 類別必選，自由輸入問題可選 (100字)",
    "搖卦震動 [0, 80, 60, 80, 60, 80, 60, 150]",
    "📤 分享籤詩 + 重新求籤按鈕",
    "結果送入 chat-store 對話記錄",
])

card(s, 9.0, 5.6, 4.0, 1.2, "⚙️ 技術", [
    "hexagram-engine.ts 本地 64 卦完整運算",
    "Claude API 深度解卦（依方案選模型）",
    "Vibration API 震動回饋",
])


# ════════════════════════════════════════════════════════
# SLIDE 9 — Profile
# ════════════════════════════════════════════════════════
s = prs.slides.add_slide(prs.slide_layouts[6]); set_bg(s)
title_bar(s, "07  個人檔案 / 設定畫面", "app/(tabs)/profile.tsx")

phone(s, 0.3, 1.3, 3.2, 5.6, "我的（上半）", [
    "## 我的", "",
    "**🦌 用戶名稱",
    "@@Lv.5 青芽鹿 · 木屬性 · 驚蟄",
    "@@[免費版]", "",
    "⭐ 升級會員解鎖更多功能 →", "",
    "**語言設定",
    "🇹🇼 繁體中文  ›", "",
    "**命盤資料",
    "@@八字: 壬申 丁未 癸卯 甲午",
    "@@紫微主星: 天機星",
    "@@西洋星座: 雙魚座",
    "@@節氣靈寵: 🦌 青芽鹿（驚蟄）",
])

phone(s, 3.8, 1.3, 3.2, 5.6, "我的（下半）", [
    "", "**其他", "",
    "🔔 推播通知             ›", "",
    "📄 隱私政策             ›", "",
    "📋 服務條款             ›", "",
    "ℹ️  關於靈犀             ›", "",
    "🔄 恢復購買             ›", "", "",
    "**🚪 登出",
    "@@(紅色文字, 確認對話框)",
])

card(s, 7.4, 1.3, 5.4, 1.8, "👤 使用者資訊卡", [
    "靈寵 emoji (36px) + 用戶名 (粗宋體 18px 金色)",
    "副標: Lv.{n} {petName} · {element}屬性 · {solarTerm}",
    "方案 badge: 免費版(金底) / 靈犀會員(金底) / 靈犀至尊(紫底)",
    "免費用戶: 顯示升級 CTA 金色卡片 → 開啟 UpgradeModal",
])
card(s, 7.4, 3.35, 5.4, 1.6, "📅 命盤資料", [
    "八字四柱: 年柱/月柱/日柱/時柱 天干地支組合",
    "紫微斗數: 命宮主星名稱",
    "西洋占星: 中文星座名",
    "節氣靈寵: emoji + 寵物名 + 節氣",
])
card(s, 7.4, 5.2, 5.4, 1.7, "⚙️ 系統設定", [
    "語言切換: 底部滑出選單, 6 語言 + 國旗, 選中 ✓ 高亮",
    "隱私政策 / 服務條款: 外部瀏覽器開啟",
    "關於靈犀: 顯示「靈犀 v1.0.0」Alert",
    "恢復購買: RevenueCat restorePurchases",
    "登出: 確認對話框 → 清除 AsyncStorage + tokens",
])


# ════════════════════════════════════════════════════════
# SLIDE 10 — Upgrade Modal
# ════════════════════════════════════════════════════════
s = prs.slides.add_slide(prs.slide_layouts[6]); set_bg(s)
title_bar(s, "08  升級彈窗 / 訂閱方案", "components/UpgradeModal.tsx + RevenueCat")

phone(s, 0.3, 1.3, 3.5, 5.6, "升級彈窗 (UpgradeModal)", [
    "",
    "🦌 主人，今天的次數",
    "用完了...升級的話，",
    "我能幫你做更多喔！", "",
    "**⭐ 靈犀會員    $390/月",
    "  · 靈眼/靈心/靈魂 5次/日",
    "  · 靈寵等級上限 Lv.20",
    "  · AI 深度解讀 (Sonnet)",
    "  ┃  立即升級  ┃ (金色)", "",
    "**👑 靈犀至尊    $1990/月",
    "  · 全功能無限使用",
    "  · 靈寵等級無上限",
    "  · 專屬進化 + 皮膚",
    "  ┃  立即升級  ┃ (紫色)", "",
    "@@明天再來",
])

# Comparison table
rect(s, 4.2, 1.3, 8.6, 4.0, fill=DARK_BG)
tb(s, 4.4, 1.4, 8, 0.4, "💎 訂閱方案比較表", sz=18, clr=GOLD, bold=True)

headers = ["功能項目", "免費版", "⭐ 會員 $390/月", "👑 至尊 $1990/月"]
cx = [4.5, 6.7, 8.6, 10.8]
cw = [2.0, 1.7, 2.0, 2.0]
for i, h in enumerate(headers):
    tb(s, cx[i], 1.9, cw[i], 0.3, h, sz=11, clr=GOLD if i==0 else WHITE, bold=True, align=PP_ALIGN.CENTER)

rows = [
    ("每日使用次數/功能", "1 次", "5 次", "無限"),
    ("靈寵等級上限", "Lv.10", "Lv.20", "無上限"),
    ("進化階段上限", "1 階段", "2 階段", "5 階段"),
    ("AI 分析模型", "Haiku", "Sonnet", "Opus"),
    ("Lv.10+ 加成", "+1 次/日", "+1 次/日", "N/A"),
    ("Lv.20+ 加成", "+2 總次數", "+2 總次數", "N/A"),
]
for r, (label, f, m, su) in enumerate(rows):
    y = 2.3 + r * 0.33
    for i, v in enumerate([label, f, m, su]):
        c = MUTED if i==0 else (LGRAY if i==1 else (GOLD if i==2 else PURPLE))
        tb(s, cx[i], y, cw[i], 0.28, v, sz=10, clr=c, align=PP_ALIGN.CENTER if i>0 else PP_ALIGN.LEFT)

card(s, 4.2, 5.55, 4.1, 1.4, "⚡ 觸發條件", [
    "每日使用次數用盡 → 自動彈出",
    "靈寵等級達方案上限 → 自動彈出",
    "Profile 頁手動點擊升級 CTA",
], bs=11)

card(s, 8.5, 5.55, 4.3, 1.4, "🔧 付費整合 (RevenueCat)", [
    "Product: lingxi_member_monthly",
    "Product: lingxi_supreme_monthly",
    "Webhook: POST /webhook/revenuecat (原始 body 簽名驗證)",
], bs=11)


# ════════════════════════════════════════════════════════
# SLIDE 11 — Chat Bubble System
# ════════════════════════════════════════════════════════
s = prs.slides.add_slide(prs.slide_layouts[6]); set_bg(s)
title_bar(s, "09  對話氣泡系統", "components/PetBubble.tsx — 11 種訊息類型")

types = [
    ("fortune", "每日運勢", "🔮", ["5 維分數條 (財/桃/事/健/學)", "吉方+幸運色+幸運數字", "總分+靈寵評語"]),
    ("face", "面相結果", "👁", ["5 官分數 (天庭/眉/眼/鼻/口)", "總分+星級+幸運物", "方位+數字"]),
    ("fengshui", "風水結果", "🧭", ["3×3 九宮格方位圖", "八門標註 吉=金/凶=紅", "座位建議"]),
    ("divination", "占卜結果", "🏮", ["卦象符號 40px + 卦名", "卦辭 Oracle 引用框", "上下卦/五行/吉凶"]),
    ("feed", "餵食", "🍖", ["+50 EXP badge", "金色背景高亮"]),
    ("play", "玩耍", "🎾", ["+30 EXP badge", "金色背景高亮"]),
    ("meditate", "冥想", "🧘", ["+20 EXP badge", "金色背景高亮"]),
    ("levelup", "升級", "⬆️", ["Lv.{n} badge 金色底", "新等級顯示"]),
    ("evolve", "進化", "✨", ["進化階段 badge 紫色底", "新形態顯示"]),
    ("text", "文字", "💬", ["純文字靈寵回應"]),
    ("system", "系統", "⚙️", ["系統通知/狀態變更"]),
]

for i, (tid, name, emoji, details) in enumerate(types):
    col = i % 4; row = i // 4
    x = 0.4 + col * 3.2; y = 1.4 + row * 1.9
    rect(s, x, y, 3.0, 1.7, fill=DARK_BG)
    tb(s, x+0.12, y+0.08, 2.7, 0.28, f"{emoji}  {name}  ({tid})", sz=12, clr=GOLD, bold=True)
    dy = y + 0.4
    for d in details:
        tb(s, x+0.12, dy, 2.7, 0.22, f"• {d}", sz=9, clr=LGRAY)
        dy += 0.2

tb(s, 0.4, 7.0, 12, 0.3,
   "共用格式: 靈寵 emoji + 名字 + HH:MM 時間戳 | 左對齊 | 金色半透明底 | 日期分隔線 | 最多 200 則 | 自動捲動到底",
   sz=10, clr=MUTED)


# ════════════════════════════════════════════════════════
# SLIDE 12 — Spirit Pet System
# ════════════════════════════════════════════════════════
s = prs.slides.add_slide(prs.slide_layouts[6]); set_bg(s)
title_bar(s, "10  靈寵養成系統", "24 節氣靈寵 × 五行屬性 × 等級進化")

pets = [
    ("立春","🦌","青芽鹿","木"),("雨水","🐸","潤澤蛙","水"),("驚蟄","🐉","驚雷龍","木"),("春分","🦋","春翼蝶","木"),
    ("清明","🦢","清風鶴","木"),("穀雨","🐍","穀靈蛇","土"),("立夏","🦅","炎翼鷹","火"),("小滿","🐝","蜜光蜂","火"),
    ("芒種","🦊","芒野狐","火"),("夏至","🦁","日輪獅","火"),("小暑","🐠","暑泉魚","火"),("大暑","🦎","烈陽蜥","火"),
    ("立秋","🦅","金風鷹","金"),("處暑","🐺","暮嵐狼","金"),("白露","🦉","露光鴞","金"),("秋分","🦊","秋影狐","金"),
    ("寒露","🐆","寒霜豹","金"),("霜降","🦇","霜翼蝠","金"),("立冬","🐻","玄冬熊","水"),("小雪","🐧","雪靈企","水"),
    ("大雪","🐺","雪嵐狼","水"),("冬至","🐉","玄冰龍","水"),("小寒","🦌","寒霧鹿","水"),("大寒","🐢","玄武龜","水"),
]
ec = {"木":RGBColor(0x4E,0xC9,0x4E),"火":RGBColor(0xE8,0x64,0x47),"土":RGBColor(0xC9,0xA8,0x4E),"金":GOLD,"水":RGBColor(0x47,0x8D,0xE8)}

for i,(term,emoji,name,el) in enumerate(pets):
    col=i%8; row=i//8
    x=0.2+col*1.6; y=1.4+row*1.1
    c=ec.get(el,GOLD)
    rect(s,x,y,1.5,0.9,fill=DARK_BG,border=c)
    tb(s,x+0.05,y+0.05,1.4,0.28,f"{emoji} {name}",sz=11,clr=WHITE,bold=True)
    tb(s,x+0.05,y+0.38,1.4,0.22,f"{term} · {el}系",sz=9,clr=c)

rect(s,0.2,4.85,12.9,2.4,fill=DARK_BG)
tb(s,0.4,4.95,4,0.3,"📈 養成進化機制",sz=16,clr=GOLD,bold=True)

prog = [
    ("經驗值獲取","餵食 +50 | 玩耍 +30 | 冥想 +20 EXP"),
    ("升級公式","所需 EXP = 基礎值 × 1.3^(當前等級)"),
    ("進化機制","每 10 級進化一次，共 5 階段（受訂閱方案限制）"),
    ("屬性成長","力量 (power) / 親和 (affinity) / 智慧 (wisdom) 隨等級提升"),
    ("Lv.10+ 加成","每日使用次數 +1（Lv.20+ 再 +1）"),
    ("等級上限","free=Lv.10 / member=Lv.20 / supreme=無限"),
]
for i,(lab,desc) in enumerate(prog):
    y=5.35+i*0.3
    tb(s,0.5,y,2.2,0.26,f"▸ {lab}",sz=11,clr=GOLD,bold=True)
    tb(s,2.7,y,10,0.26,desc,sz=11,clr=LGRAY)


# ════════════════════════════════════════════════════════
# SLIDE 13 — Tab Bar + Navigation + Global Components
# ════════════════════════════════════════════════════════
s = prs.slides.add_slide(prs.slide_layouts[6]); set_bg(s)
title_bar(s, "11  導航架構與全域元件", "Tab Bar · 多語系 · 狀態管理 · 主題")

card(s, 0.3, 1.3, 4.0, 2.0, "🧭 Tab Bar 導航", [
    "2 個 Tab，底部固定 80px 高",
    "Tab 1: 🔮 靈寵 — 44px 圓形容器, 金色邊框",
    "Tab 2: ⚙️ 我的 — 標準 icon",
    "Active: 金色文字 + 4px 金色圓點指示器",
    "背景: rgba(8,8,15,0.98) + 金色頂邊線",
])

card(s, 4.5, 1.3, 4.2, 2.0, "🌐 國際化 (i18n)", [
    "react-i18next + Expo Localization",
    "🇹🇼 繁中 / 🇨🇳 簡中 / 🇯🇵 日文 / 🇺🇸 英 / 🇩🇪 德 / 🇫🇷 法",
    "自動偵測裝置語系 (Hant→繁中)",
    "Fallback: English | 約 400+ 翻譯鍵值",
])

card(s, 8.9, 1.3, 4.0, 2.0, "🎨 主題系統", [
    "背景: #08080f | 金色: #e8c547",
    "毛筆字: MaShanZheng (標題/Logo)",
    "宋體: NotoSerifTC (正文/按鈕)",
    "Spacing: xs=4 sm=8 md=16 lg=24 xl=32",
])

# State management
rect(s, 0.3, 3.55, 12.6, 3.3, fill=DARK_BG)
tb(s, 0.5, 3.65, 4, 0.35, "💾 狀態管理 — Zustand × 4 Store", sz=16, clr=GOLD, bold=True)

stores = [
    ("auth-store", "認證", [
        "isAuthenticated 登入狀態",
        "user: id/email/name/planType",
        "login / register / apple / logout",
        "JWT tokens (AsyncStorage)",
    ]),
    ("user-store", "使用者", [
        "出生年月日 / 性別 / 曆法",
        "bazi / ziwei / astrology 命理",
        "planType 訂閱等級",
        "dailyUsage 額度追蹤",
    ]),
    ("pet-store", "靈寵", [
        "name / emoji / creature / element",
        "level / exp / evolution",
        "power / affinity / wisdom",
        "feed / play / meditate 操作",
    ]),
    ("chat-store", "對話", [
        "messages 訊息陣列 (max 200)",
        "11 種訊息類型",
        "addMessage / clearOld",
        "AsyncStorage 持久化",
    ]),
]

for i, (name, label, items) in enumerate(stores):
    x = 0.5 + i * 3.15
    rect(s, x, 4.15, 2.95, 2.5, fill=RGBColor(0x18,0x18,0x22), border=GOLD_DIM)
    tb(s, x+0.1, 4.2, 2.7, 0.3, f"{name}", sz=12, clr=GOLD, bold=True)
    tb(s, x+0.1, 4.45, 2.7, 0.22, f"({label})", sz=9, clr=MUTED)
    for j, item in enumerate(items):
        tb(s, x+0.1, 4.75+j*0.22, 2.7, 0.2, f"· {item}", sz=9, clr=LGRAY)


# ════════════════════════════════════════════════════════
# SLIDE 14 — Version Info
# ════════════════════════════════════════════════════════
s = prs.slides.add_slide(prs.slide_layouts[6]); set_bg(s)
title_bar(s, "12  版本資訊", "2026-03-16 現行版本")

rect(s, 0.3, 1.2, 6.0, 3.8, fill=DARK_BG)
tb(s, 0.5, 1.3, 5.5, 0.35, "📦 應用程式", sz=18, clr=GOLD, bold=True)
vi = [
    ("App 版本","v1.0.0"),("App 名稱","靈犀 (LING XI)"),("Expo SDK","54.0.0"),
    ("React Native","0.81.5"),("React","19.1.0"),("iOS Bundle ID","com.youquan.lingxi"),
    ("Android Package","com.yourname.lingxi"),("EAS Project ID","22a8b11d-...afde18"),
    ("Owner","dennysu"),("文件日期","2026-03-16"),
]
for i,(lab,val) in enumerate(vi):
    y=1.75+i*0.28
    tb(s,0.6,y,2.0,0.24,lab,sz=10,clr=MUTED)
    tb(s,2.6,y,3.2,0.24,val,sz=10,clr=WHITE,bold=True)

rect(s, 6.6, 1.2, 6.4, 1.8, fill=DARK_BG)
tb(s, 6.8, 1.3, 6, 0.35, "🖥 後端服務", sz=18, clr=GOLD, bold=True)
bi = [("Server","v1.0.0"),("平台","Google Cloud Run (asia-east1)"),
      ("Auth","JWT access + refresh (獨立 secret)"),("AI","Claude API (Haiku/Sonnet/Opus by plan)")]
for i,(lab,val) in enumerate(bi):
    y=1.75+i*0.28
    tb(s,6.8,y,1.8,0.24,lab,sz=10,clr=MUTED)
    tb(s,8.6,y,4.2,0.24,val,sz=10,clr=WHITE,bold=True)

rect(s, 6.6, 3.2, 6.4, 1.8, fill=DARK_BG)
tb(s, 6.8, 3.3, 6, 0.35, "🔗 API 路由", sz=16, clr=GOLD, bold=True)
routes = [
    ("Auth","/auth/login, /register, /apple, /refresh"),
    ("User","/user/profile (GET/PUT)"),
    ("AI","/ai/face-reading, /feng-shui, /fortune, /outfit, /divination, /pet-message"),
    ("訂閱","/api/subscription/status (GET)"),
    ("Webhook","/webhook/revenuecat (POST, raw body 簽名驗證)"),
]
for i,(lab,route) in enumerate(routes):
    y=3.75+i*0.23
    tb(s,6.9,y,1.2,0.2,lab,sz=9,clr=GOLD)
    tb(s,8.0,y,4.8,0.2,route,sz=9,clr=LGRAY)

# Recent fixes
rect(s, 0.3, 5.25, 12.7, 2.0, fill=DARK_BG)
tb(s, 0.5, 5.35, 6, 0.35, "🔧 2026-03-16 程式碼審查修復 (20 項)", sz=16, clr=GOLD, bold=True)

fixes = [
    "前端: Fortune useEffect 等 store hydrate | WheelPicker 外部 index 同步 | API retry timeout | planType 變數遮蔽",
    "後端 Critical: CORS 預設禁止 | Webhook raw body 簽名 | JWT refresh 獨立 secret | 錯誤訊息洩漏修復",
    "後端 High: 使用量檢查拆分(先查後扣) | Claude JSON 解析 4 層策略 | AI 失敗不扣額度",
    "後端 Quality: unhandledRejection handler | SIGTERM graceful shutdown | Helmet 前置 | 模型依方案選擇 | Email+生日驗證",
]
for i, f in enumerate(fixes):
    tb(s, 0.6, 5.75+i*0.28, 12, 0.26, f"▸ {f}", sz=9, clr=LGRAY)


# ═══════════════════════════════════════════════════════
# Save
# ═══════════════════════════════════════════════════════
out = r"C:\Dev\LingXi\LingXi_UI_操作畫面_20260316.pptx"
prs.save(out)
print(f"Saved: {out}")
print(f"Slides: {len(prs.slides)}")
