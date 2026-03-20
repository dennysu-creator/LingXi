#!/usr/bin/env python3
"""Generate LingXi App UI Operation Manual PPT — 2026-03-14"""

from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
import os

# ── Colors ──────────────────────────────────────────────
BLACK = RGBColor(0x08, 0x08, 0x0F)
DARK_BG = RGBColor(0x12, 0x12, 0x1A)
GOLD = RGBColor(0xE8, 0xC5, 0x47)
GOLD_DARK = RGBColor(0xB8, 0x9A, 0x30)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
LIGHT_GRAY = RGBColor(0xCC, 0xCC, 0xCC)
MUTED = RGBColor(0x99, 0x99, 0x99)
GREEN = RGBColor(0x4E, 0xC9, 0x8B)
PURPLE = RGBColor(0xA8, 0x78, 0xE8)
RED = RGBColor(0xE8, 0x47, 0x47)
BLUE = RGBColor(0x47, 0x8D, 0xE8)

prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)


# ── Helper functions ────────────────────────────────────
def set_slide_bg(slide, color=BLACK):
    bg = slide.background
    fill = bg.fill
    fill.solid()
    fill.fore_color.rgb = color


def add_textbox(slide, left, top, width, height, text, font_size=14,
                color=WHITE, bold=False, alignment=PP_ALIGN.LEFT,
                font_name="Microsoft JhengHei"):
    txBox = slide.shapes.add_textbox(Inches(left), Inches(top),
                                     Inches(width), Inches(height))
    tf = txBox.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = text
    p.font.size = Pt(font_size)
    p.font.color.rgb = color
    p.font.bold = bold
    p.font.name = font_name
    p.alignment = alignment
    return txBox


def add_paragraph(text_frame, text, font_size=14, color=WHITE, bold=False,
                  alignment=PP_ALIGN.LEFT, space_before=Pt(4),
                  font_name="Microsoft JhengHei"):
    p = text_frame.add_paragraph()
    p.text = text
    p.font.size = Pt(font_size)
    p.font.color.rgb = color
    p.font.bold = bold
    p.font.name = font_name
    p.alignment = alignment
    if space_before:
        p.space_before = space_before
    return p


def add_rounded_rect(slide, left, top, width, height,
                     fill_color=DARK_BG, border_color=GOLD_DARK, border_width=Pt(1)):
    shape = slide.shapes.add_shape(
        MSO_SHAPE.ROUNDED_RECTANGLE,
        Inches(left), Inches(top), Inches(width), Inches(height)
    )
    shape.fill.solid()
    shape.fill.fore_color.rgb = fill_color
    shape.line.color.rgb = border_color
    shape.line.width = border_width
    return shape


def add_section_title(slide, text, top=0.3):
    add_textbox(slide, 0.5, top, 12, 0.6, text, font_size=28, color=GOLD, bold=True)


def add_subtitle_line(slide, text, top=0.85):
    add_textbox(slide, 0.5, top, 12, 0.4, text, font_size=14, color=MUTED)


def add_bullet_card(slide, left, top, width, height, title, bullets,
                    title_color=GOLD, bullet_color=LIGHT_GRAY,
                    fill_color=DARK_BG, title_size=16, bullet_size=13):
    rect = add_rounded_rect(slide, left, top, width, height, fill_color=fill_color)
    txBox = slide.shapes.add_textbox(
        Inches(left + 0.2), Inches(top + 0.15),
        Inches(width - 0.4), Inches(height - 0.3)
    )
    tf = txBox.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = title
    p.font.size = Pt(title_size)
    p.font.color.rgb = title_color
    p.font.bold = True
    p.font.name = "Microsoft JhengHei"
    for b in bullets:
        add_paragraph(tf, f"• {b}", font_size=bullet_size, color=bullet_color,
                      space_before=Pt(3))
    return rect


def add_phone_frame(slide, left, top, width=2.8, height=5.0,
                    title="", content_lines=None, accent_color=GOLD):
    """Draw a simplified phone mockup frame."""
    # Phone body
    phone = add_rounded_rect(slide, left, top, width, height,
                             fill_color=RGBColor(0x0E, 0x0E, 0x16),
                             border_color=accent_color, border_width=Pt(2))
    # Status bar notch
    add_rounded_rect(slide, left + width/2 - 0.4, top + 0.08, 0.8, 0.15,
                     fill_color=RGBColor(0x1A, 0x1A, 0x25),
                     border_color=RGBColor(0x1A, 0x1A, 0x25))
    # Title inside phone
    if title:
        add_textbox(slide, left + 0.15, top + 0.35, width - 0.3, 0.35,
                    title, font_size=13, color=accent_color, bold=True,
                    alignment=PP_ALIGN.CENTER)
    # Content
    if content_lines:
        y = top + 0.75
        for line in content_lines:
            if y > top + height - 0.4:
                break
            sz = 10
            clr = LIGHT_GRAY
            bld = False
            if line.startswith("##"):
                line = line[2:].strip()
                sz = 11
                clr = accent_color
                bld = True
            elif line.startswith("**"):
                line = line[2:].strip().rstrip("*")
                bld = True
                clr = WHITE
            add_textbox(slide, left + 0.15, y, width - 0.3, 0.28,
                        line, font_size=sz, color=clr, bold=bld)
            y += 0.26
    return phone


# ════════════════════════════════════════════════════════
# SLIDE 1 — Cover
# ════════════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])  # blank
set_slide_bg(slide)

# Decorative top/bottom gold lines
slide.shapes.add_shape(MSO_SHAPE.RECTANGLE,
    Inches(2), Inches(1.2), Inches(9.333), Pt(2)).fill.solid()
slide.shapes[-1].fill.fore_color.rgb = GOLD
slide.shapes[-1].line.fill.background()

slide.shapes.add_shape(MSO_SHAPE.RECTANGLE,
    Inches(2), Inches(6.0), Inches(9.333), Pt(2)).fill.solid()
slide.shapes[-1].fill.fore_color.rgb = GOLD
slide.shapes[-1].line.fill.background()

add_textbox(slide, 0, 1.6, 13.333, 0.8, "🔮", font_size=48,
            alignment=PP_ALIGN.CENTER)
add_textbox(slide, 0, 2.3, 13.333, 1.0, "靈犀 LING XI", font_size=44,
            color=GOLD, bold=True, alignment=PP_ALIGN.CENTER)
add_textbox(slide, 0, 3.2, 13.333, 0.6, "App UI 操作畫面說明書", font_size=24,
            color=WHITE, alignment=PP_ALIGN.CENTER)
add_textbox(slide, 0, 4.0, 13.333, 0.5, "AI 命理寵物互動應用程式", font_size=16,
            color=MUTED, alignment=PP_ALIGN.CENTER)
add_textbox(slide, 0, 5.0, 13.333, 0.4, "版本 v1.0.0  |  日期 2026-03-14",
            font_size=16, color=GOLD_DARK, alignment=PP_ALIGN.CENTER)
add_textbox(slide, 0, 5.5, 13.333, 0.4, "有泉科技 YouQuan Technology",
            font_size=14, color=MUTED, alignment=PP_ALIGN.CENTER)


# ════════════════════════════════════════════════════════
# SLIDE 2 — Table of Contents
# ════════════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_bg(slide)
add_section_title(slide, "📋 目錄")
add_subtitle_line(slide, "靈犀 App 各畫面操作說明總覽")

toc_items = [
    ("01", "應用程式總覽", "技術架構、設計語言、導航結構"),
    ("02", "登入 / 註冊畫面", "Email 登入、Apple Sign-In、表單切換"),
    ("03", "新手引導流程", "語言選擇 → 歡迎 → 姓名 → 生辰 → 靈寵召喚"),
    ("04", "主畫面 — 靈寵互動", "靈寵頭像、對話氣泡、每日運勢、養成操作"),
    ("05", "靈眼模式 — AI 面相分析", "相機拍攝 → 面相掃描 → AI 解讀結果"),
    ("06", "靈心模式 — 即時風水", "GPS 定位 + 電子羅盤 → 奇門遁甲方位分析"),
    ("07", "靈魂模式 — 易經占卜", "選類別 → 提問 → 搖卦動畫 → 六十四卦解讀"),
    ("08", "個人檔案 / 設定", "命盤資料、語言設定、訂閱管理、登出"),
    ("09", "升級彈窗 / 訂閱方案", "會員 $390 / 至尊 $1990、RevenueCat 整合"),
    ("10", "對話氣泡系統", "11 種訊息類型、富內容渲染、運勢/面相/風水/卦象"),
    ("11", "靈寵養成系統", "24 節氣靈寵、經驗值、等級、進化機制"),
    ("12", "多語系與全域元件", "6 語言 i18n、WheelPicker、ErrorBoundary"),
]

for i, (num, title, desc) in enumerate(toc_items):
    row = i // 3
    col = i % 3
    x = 0.5 + col * 4.2
    y = 1.5 + row * 1.35
    add_rounded_rect(slide, x, y, 3.9, 1.15, fill_color=DARK_BG)
    add_textbox(slide, x + 0.15, y + 0.1, 0.5, 0.35, num,
                font_size=20, color=GOLD, bold=True)
    add_textbox(slide, x + 0.6, y + 0.1, 3.1, 0.35, title,
                font_size=15, color=WHITE, bold=True)
    add_textbox(slide, x + 0.6, y + 0.5, 3.1, 0.55, desc,
                font_size=11, color=MUTED)


# ════════════════════════════════════════════════════════
# SLIDE 3 — App Overview
# ════════════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_bg(slide)
add_section_title(slide, "01  應用程式總覽")
add_subtitle_line(slide, "技術架構、設計語言、導航結構與使用者流程")

# Left: Tech stack card
add_bullet_card(slide, 0.5, 1.5, 4.0, 2.8,
    "🛠 技術架構",
    [
        "React Native + Expo SDK 54",
        "Expo Router 檔案式路由",
        "Zustand + AsyncStorage 持久化",
        "react-i18next 六語系國際化",
        "RevenueCat 訂閱付費",
        "Claude AI Vision API 面相分析",
        "本地命理引擎（八字/紫微/奇門/占星）",
    ])

# Middle: Design Language
add_bullet_card(slide, 4.7, 1.5, 4.0, 2.8,
    "🎨 設計語言",
    [
        "深色主題 (#08080f 底色)",
        "金色強調 (#e8c547)",
        "書法字體：MaShanZheng（標題）",
        "明體字體：NotoSerifTC（內文）",
        "半透明金邊容器",
        "東方神秘感美學風格",
        "浮動動畫 + 脈衝光暈效果",
    ])

# Right: Navigation
add_bullet_card(slide, 8.9, 1.5, 4.0, 2.8,
    "🧭 導航結構",
    [
        "Stack Navigator (Root)",
        "  ├─ auth (登入/註冊)",
        "  ├─ onboarding (新手引導)",
        "  └─ (tabs) 主應用",
        "       ├─ 🔮 靈寵 Tab",
        "       └─ ⚙️ 我的 Tab",
        "Auth Guard 自動跳轉",
    ])

# Bottom: User flow
add_rounded_rect(slide, 0.5, 4.6, 12.3, 2.5, fill_color=DARK_BG)
add_textbox(slide, 0.7, 4.7, 2, 0.4, "📱 使用者流程",
            font_size=16, color=GOLD, bold=True)

flow_steps = [
    ("啟動", "Splash\n字型載入\n認證檢查"),
    ("→", ""),
    ("登入", "Email/密碼\nApple Sign-In\n新用戶註冊"),
    ("→", ""),
    ("引導", "語言選擇\n姓名輸入\n生辰設定\n靈寵召喚"),
    ("→", ""),
    ("主畫面", "每日運勢\n靈寵互動\n養成系統"),
    ("→", ""),
    ("三大功能", "👁 靈眼·面相\n🌍 靈心·風水\n🏮 靈魂·占卜"),
    ("→", ""),
    ("額度門檻", "超量→升級\n等級→升級\nRevenueCat"),
]

x_pos = 0.7
for step_title, step_desc in flow_steps:
    if step_title == "→":
        add_textbox(slide, x_pos, 5.5, 0.3, 0.5, "→",
                    font_size=20, color=GOLD, bold=True, alignment=PP_ALIGN.CENTER)
        x_pos += 0.35
    else:
        w = 1.7
        add_rounded_rect(slide, x_pos, 5.2, w, 1.6,
                         fill_color=RGBColor(0x1A, 0x1A, 0x25),
                         border_color=GOLD_DARK)
        add_textbox(slide, x_pos + 0.1, 5.25, w - 0.2, 0.35,
                    step_title, font_size=13, color=GOLD, bold=True,
                    alignment=PP_ALIGN.CENTER)
        add_textbox(slide, x_pos + 0.1, 5.6, w - 0.2, 1.1,
                    step_desc, font_size=10, color=LIGHT_GRAY,
                    alignment=PP_ALIGN.CENTER)
        x_pos += w + 0.35


# ════════════════════════════════════════════════════════
# SLIDE 4 — Auth Screen
# ════════════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_bg(slide)
add_section_title(slide, "02  登入 / 註冊畫面")
add_subtitle_line(slide, "app/auth.tsx — Email 帳號密碼登入 + Apple Sign-In")

# Phone mockup - Login
add_phone_frame(slide, 0.8, 1.4, 2.8, 5.2, "登入模式", [
    "## 🔮 靈犀",
    "LING XI",
    "",
    "** 繼續使用 Apple 帳號",
    "──── 或 ────",
    "",
    "## 登入帳號",
    "📧 電子郵件",
    "   your@email.com",
    "🔒 密碼",
    "   ••••••••",
    "",
    "**[ 登    入 ]",
    "",
    "沒有帳號？ 註冊",
])

# Phone mockup - Register
add_phone_frame(slide, 4.0, 1.4, 2.8, 5.2, "註冊模式", [
    "## 🔮 靈犀",
    "LING XI",
    "",
    "** 繼續使用 Apple 帳號",
    "──── 或 ────",
    "",
    "## 註冊帳號",
    "👤 姓名",
    "   請輸入你的名字",
    "📧 電子郵件",
    "   your@email.com",
    "🔒 密碼",
    "   請輸入密碼",
    "**[ 註    冊 ]",
    "已有帳號？ 登入",
])

# Right side: Details
add_bullet_card(slide, 7.3, 1.4, 5.5, 2.2,
    "🔐 認證方式",
    [
        "Apple Sign-In — iOS 原生按鈕（請求 fullName + email scope）",
        "Email / Password 登入 — JWT token 儲存於 AsyncStorage",
        "Email / Password 註冊 — 必填：姓名、電子郵件、密碼",
        "登入/註冊模式切換 — 底部文字連結切換",
    ])

add_bullet_card(slide, 7.3, 3.9, 5.5, 1.5,
    "⚙️ 技術細節",
    [
        "Backend: /auth/login, /auth/register, /auth/apple",
        "Token: JWT access + refresh token 自動更新",
        "Apple Sign-In 需 development build（非 Expo Go）",
        "Bundle ID: com.youquan.lingxi",
    ])

add_bullet_card(slide, 7.3, 5.65, 5.5, 1.0,
    "💡 UX 處理",
    [
        "全螢幕 Loading overlay：「認證中...」+ Spinner",
        "錯誤顯示：紅色邊框卡片顯示具體錯誤訊息",
    ])


# ════════════════════════════════════════════════════════
# SLIDE 5 — Onboarding (Steps 0-2)
# ════════════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_bg(slide)
add_section_title(slide, "03  新手引導流程 (1/2)")
add_subtitle_line(slide, "app/onboarding.tsx — 5 步驟精靈：語言 → 歡迎 → 姓名")

# Step 0
add_phone_frame(slide, 0.5, 1.4, 2.8, 5.2, "Step 0 · 語言選擇", [
    "",
    "## 🌐",
    "",
    "🇹🇼 繁體中文        ✓",
    "🇨🇳 简体中文",
    "🇯🇵 日本語",
    "🇺🇸 English",
    "🇩🇪 Deutsch",
    "🇫🇷 Français",
    "",
    "",
    "",
    "**[ 下一步 ]",
])

# Step 1
add_phone_frame(slide, 3.7, 1.4, 2.8, 5.2, "Step 1 · 歡迎", [
    "",
    "## 🐉",
    "",
    "## 靈犀",
    "LING XI",
    "",
    "AI 面相 · 八字命理",
    "紫微斗數 · 奇門遁甲",
    "靈寵陪伴 · 即時風水",
    "",
    "你的隨身玄學生活顧問",
    "",
    "",
    "**[ 開始體驗 ]",
])

# Step 2
add_phone_frame(slide, 6.9, 1.4, 2.8, 5.2, "Step 2 · 姓名輸入", [
    "",
    "## 你是誰？",
    "",
    "請告訴靈犀你的名字",
    "讓靈寵認識你",
    "",
    "┌──────────────┐",
    "│ 請輸入你的名字    │",
    "└──────────────┘",
    "(最多 20 字元)",
    "",
    "",
    "",
    "**[ 下一步 ]",
])

# Right: notes
add_bullet_card(slide, 10.1, 1.4, 2.8, 5.2,
    "📝 引導說明",
    [
        "共 5 步驟 (0-4)",
        "進度指示器顯示當前步驟",
        "",
        "Step 0:",
        "  自動偵測裝置語系",
        "  支援 6 種語言",
        "  選擇後立即切換 UI",
        "",
        "Step 1:",
        "  品牌展示頁面",
        "  列出所有核心功能",
        "",
        "Step 2:",
        "  姓名為必填欄位",
        "  未填寫時按鈕禁用",
        "  最多 20 字元限制",
    ], bullet_size=11)


# ════════════════════════════════════════════════════════
# SLIDE 6 — Onboarding (Steps 3-4)
# ════════════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_bg(slide)
add_section_title(slide, "03  新手引導流程 (2/2)")
add_subtitle_line(slide, "生辰資料輸入 → 靈寵召喚結果")

# Step 3
add_phone_frame(slide, 0.5, 1.4, 3.5, 5.5, "Step 3 · 生辰輸入", [
    "## 你的生辰",
    "",
    "☀ 國曆（西元）  |  🌙 農曆",
    "",
    "┌──┐ ┌──┐ ┌──┐",
    "│年│ │月│ │日│  ← 滾輪選擇器",
    "└──┘ └──┘ └──┘",
    "(1930-2026) (1-12) (動態)",
    "",
    "**時辰選擇（橫向捲動）:",
    "子時 丑時 寅時 卯時 辰時",
    "巳時 午時 未時 申時 酉時",
    "戌時 亥時  [不知道時辰]",
    "",
    "**性別:  ♂ 男  |  ♀ 女",
    "",
    "[返回]     [召喚靈寵]",
])

# Step 4
add_phone_frame(slide, 4.4, 1.4, 3.5, 5.5, "Step 4 · 靈寵降臨", [
    "",
    "## 🦌 (靈寵 emoji, 80px)",
    "",
    "## 靈寵已降臨！",
    "「青芽鹿」已與你建立靈犀之約",
    "",
    "**紫微命盤:",
    "  命宮主星 + 性格描述",
    "**西洋占星:",
    "  ♓ 星座 + 元素 + 守護星",
    "",
    "**解鎖路線圖:",
    "Lv.1 💬  Lv.3 🔔  Lv.5 👔",
    "Lv.8 🧭  Lv.10 ✨",
    "",
    "免費版 | 會員版 | 至尊版",
    "",
    "**[ 進入靈犀 ]",
])

# Right: Details
add_bullet_card(slide, 8.3, 1.4, 4.6, 2.6,
    "📅 Step 3 · 生辰設定細節",
    [
        "日曆類型切換：國曆 ↔ 農曆（含自動轉換）",
        "WheelPicker 滾輪選擇器：iOS 風格, 5 項可見",
        "十二時辰：子時(23-01)到亥時(21-23)，含「不知道」選項",
        "性別選擇：影響八字命理計算",
        "所有數據同步儲存至 user-store + 後端 API",
    ])

add_bullet_card(slide, 8.3, 4.3, 4.6, 2.6,
    "🐉 Step 4 · 靈寵召喚結果",
    [
        "根據生日節氣自動配對 24 靈寵之一",
        "顯示紫微斗數命盤摘要（命宮主星）",
        "顯示西洋占星資訊（星座/元素/守護星）",
        "5 階段解鎖路線圖預覽",
        "三種訂閱方案比較（免費/會員/至尊）",
        "完成後導航至主畫面 /(tabs)/pet",
    ])


# ════════════════════════════════════════════════════════
# SLIDE 7 — Main Pet Screen
# ════════════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_bg(slide)
add_section_title(slide, "04  主畫面 — 靈寵互動")
add_subtitle_line(slide, "app/(tabs)/pet.tsx — 核心互動畫面，兩種狀態佈局")

# Normal state phone
add_phone_frame(slide, 0.5, 1.4, 3.2, 5.5, "一般狀態", [
    "**靈犀          3月14日·午時",
    "Lv.5 青芽鹿 · 木系",
    "",
    "## [靈寵頭像區]",
    "  🦌 浮動動畫",
    "  Lv.5 青芽鹿 · 木系",
    "  ████░░ EXP 65%",
    "  ★★★★★ 進化 2/5",
    "",
    "## [對話區]",
    "  🦌 青芽鹿  10:30",
    "  今日運勢概覽...",
    "  財運 ████ 桃花 ███",
    "",
    "🍖餵食 🎾玩耍 🧘冥想",
    "👁靈眼 🌍靈心 🏮靈魂",
])

# Feature active state phone
add_phone_frame(slide, 4.1, 1.4, 3.2, 5.5, "功能啟動狀態", [
    "**靈犀          3月14日·午時",
    "Lv.5 青芽鹿 · 木系",
    "",
    "┌────────────────┐",
    "│                    │",
    "│  [功能面板區域]     │",
    "│  靈眼/靈心/靈魂     │",
    "│  佔據全部空間       │",
    "│                    │",
    "│  頭像+對話已隱藏    │",
    "│  以提供最大操作空間  │",
    "│                    │",
    "└────────────────┘",
    "",
    " 👁靈眼 🌍靈心 🏮靈魂",
    " (養成列隱藏)",
])

# Right: Details
add_bullet_card(slide, 7.7, 1.4, 5.1, 2.5,
    "📱 畫面元素說明",
    [
        "狀態列：「靈犀」書法字 + 農曆日期·時辰 + 等級/靈寵名/屬性",
        "靈寵頭像：浮動動畫（正弦波 ±6px）+ 脈衝光暈（功能啟動時）",
        "EXP 進度條：金色填充，顯示百分比",
        "進化星星：5 顆星，已解鎖為金色，未解鎖 15% 透明度",
        "對話區：FlatList 捲動，日期分隔線，自動捲到最新",
    ])

add_bullet_card(slide, 7.7, 4.15, 2.4, 2.7,
    "🍖 養成操作",
    [
        "餵食 (+50 EXP)",
        "玩耍 (+30 EXP)",
        "冥想 (+20 EXP)",
        "",
        "經驗值公式:",
        "升級需求 ×1.3/級",
        "每 10 級進化一次",
    ], bullet_size=11)

add_bullet_card(slide, 10.3, 4.15, 2.5, 2.7,
    "✨ 功能切換",
    [
        "👁 靈眼 → 面相分析",
        "🌍 靈心 → 風水羅盤",
        "🏮 靈魂 → 易經占卜",
        "",
        "再按同一按鈕關閉",
        "啟動時金色高亮",
        "養成列自動隱藏",
    ], bullet_size=11)


# ════════════════════════════════════════════════════════
# SLIDE 8 — Eye Mode (Face Reading)
# ════════════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_bg(slide)
add_section_title(slide, "05  靈眼模式 — AI 面相分析")
add_subtitle_line(slide, "components/features/PetEyeMode.tsx — 4 階段：拍攝 → 預覽 → 分析 → 結果")

# Phase: idle
add_phone_frame(slide, 0.3, 1.4, 2.5, 4.8, "Phase 1: 拍攝", [
    "",
    "┌──────────┐",
    "│ 📷 相機預覽  │",
    "│   (240px)    │",
    "│  ╭─────╮  │",
    "│  │ 👤    │  │",
    "│  │ 橢圓框 │  │",
    "│  ╰─────╯  │",
    "└──────────┘",
    "",
    "🦌 正在凝視面相...",
    "",
    "",
    "**[👁 啟動靈寵之眼]",
])

# Phase: preview
add_phone_frame(slide, 3.0, 1.4, 2.5, 4.8, "Phase 2: 預覽", [
    "",
    "┌──────────┐",
    "│ 📸 拍攝結果  │",
    "│   (200px)    │",
    "│              │",
    "│  已拍照片    │",
    "│              │",
    "└──────────┘",
    "",
    "",
    "",
    "",
    "[ 重拍 ]  [開始分析]",
])

# Phase: analyzing
add_phone_frame(slide, 5.7, 1.4, 2.5, 4.8, "Phase 3: 分析中", [
    "",
    "   ╭─────╮",
    "   │ 🧑   │",
    "   │ · · · │  掃描點",
    "   ╰─────╯",
    "",
    "🦌 正在凝視面相...",
    "   發現了！看到了...",
    "",
    "## 68%",
    "靈寵正在掃描面部...",
    "████████░░░░",
    "",
])

# Phase: result
add_phone_frame(slide, 8.4, 1.4, 2.5, 4.8, "Phase 4: 結果", [
    "",
    "## 上上籤",
    "★★★★☆  (80分)",
    "",
    "🦌 靈寵解讀:",
    "天庭飽滿，五官端正...",
    "",
    "天庭 ████░ 82",
    "眉運 ███░░ 75",
    "眼運 ████░ 88",
    "鼻運 ███░░ 70",
    "口運 ████░ 85",
    "",
    "🍀 幸運物: ...",
    "[ 重新分析 ]",
])

# Bottom notes
add_bullet_card(slide, 0.3, 6.4, 12.3, 0.9,
    "💡 技術備註",
    [
        "前鏡頭拍攝 → Base64 編碼 → Claude Vision API 分析 → 結果以對話氣泡形式存入 chat-store",
        "相機權限未授予時顯示權限請求畫面 | 分析結果同時送入對話記錄",
    ], bullet_size=11)


# ════════════════════════════════════════════════════════
# SLIDE 9 — Heart Mode (Feng Shui)
# ════════════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_bg(slide)
add_section_title(slide, "06  靈心模式 — 即時風水")
add_subtitle_line(slide, "components/features/PetHeartMode.tsx — GPS 定位 + 電子羅盤 + 奇門遁甲")

# Phone mockup
add_phone_frame(slide, 0.5, 1.4, 3.2, 5.5, "靈心操作畫面", [
    "",
    "**🟢 GPS 定位中",
    "  25.0330°N, 121.5654°E",
    "  台北市中正區...",
    "  🦌 靈寵正在感應此地能量...",
    "",
    "     ┌─────────┐",
    "     │  N 北     │",
    "     │W  🧭  E  │",
    "     │    ↑      │",
    "     │  S 南     │",
    "     └─────────┘",
    "     (140×140 羅盤)",
    "",
    "✦ 吉方: 東南  ⚠ 凶方: 西北",
    "",
    "**[🧭 啟動靈寵之心]",
])

# Right: Details
add_bullet_card(slide, 4.2, 1.4, 4.3, 2.7,
    "🧭 羅盤元件說明",
    [
        "即時旋轉：跟隨裝置磁力計（Magnetometer）方位",
        "8 方位標示：北/東北/東/東南/南/西南/西/西北",
        "吉方標示：金色高亮顯示（來自奇門遁甲計算）",
        "凶方標示：紅色警示顯示",
        "指南針針：紅白雙色指北針",
        "羅盤尺寸：140×140px（已從 180px 優化）",
    ])

add_bullet_card(slide, 4.2, 4.35, 4.3, 2.6,
    "📍 GPS 定位資訊",
    [
        "expo-location 取得座標 + 反向地理編碼",
        "顯示完整地址（區/路/號）",
        "靈寵感應訊息（依寵物個性生成）",
        "GPS 卡片 + 靈寵感應合併為單行（節省空間）",
        "定位失敗時顯示「定位中...」",
    ])

add_bullet_card(slide, 8.8, 1.4, 4.0, 2.7,
    "🔮 分析結果（送入對話）",
    [
        "靈寵解讀：AI 產生的位置風水分析文字",
        "建議卡片：方位建議 + 注意事項",
        "座位建議：辦公/讀書最佳朝向",
        "3×3 九宮格：八門方位圖",
        "吉方/凶方標示",
    ])

add_bullet_card(slide, 8.8, 4.35, 4.0, 2.6,
    "⚙️ 技術實作",
    [
        "本地引擎：奇門遁甲 (qimen-engine.ts)",
        "計算八門九星配置 → 吉凶方位",
        "Claude API：深度位置風水解讀",
        "按鈕固定底部 (bottomBar 佈局)",
        "磁力計 + GPS 同時運作",
    ])


# ════════════════════════════════════════════════════════
# SLIDE 10 — Pearl Mode (Divination)
# ════════════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_bg(slide)
add_section_title(slide, "07  靈魂模式 — 易經占卜")
add_subtitle_line(slide, "components/features/PetPearlMode.tsx — 六十四卦占卜：選類別 → 提問 → 搖卦 → 解讀")

# Phase: idle
add_phone_frame(slide, 0.3, 1.4, 2.8, 5.5, "Phase 1: 選擇與提問", [
    "",
    "🦌 為你感應天地靈氣...",
    "",
    "**選擇類別:",
    "💼事業  ❤️感情  🏠家庭",
    "   💪健康  📚學業",
    "",
    "**輸入問題: (可選)",
    "┌──────────────┐",
    "│ 這筆投資是否     │",
    "│ 該進行？          │",
    "└──────────────┘",
    "(最多 100 字)",
    "",
    "",
    "**[🏮 啟動靈寵之魂]",
])

# Phase: shaking
add_phone_frame(slide, 3.4, 1.4, 2.8, 5.5, "Phase 2: 搖卦動畫", [
    "",
    "",
    "",
    "",
    "## ☰ ☷ ☳ ☴",
    "## ☵ ☲ ☶ ☱",
    "",
    "靈珠運轉中...",
    "",
    "🦌 正在連接靈界...",
    "",
    "",
    "(裝置震動回饋)",
    "(1.5 秒動畫)",
])

# Phase: result
add_phone_frame(slide, 6.5, 1.4, 2.8, 5.5, "Phase 3: 卦象結果", [
    "",
    "## ☰  (64px)",
    "**第1卦 · 乾",
    "",
    "元亨利貞",
    "(Oracle 卦辭)",
    "",
    "**大吉",
    "事業類別解讀...",
    "行動指引...",
    "時機建議...",
    "",
    "上卦:乾 下卦:乾",
    "五行:金  吉凶:大吉",
    "",
    "📤分享  [重新求籤]",
])

# Right side details
add_bullet_card(slide, 9.6, 1.4, 3.3, 2.4,
    "🎴 卦象解讀內容",
    [
        "卦象符號 + 第 N 卦名",
        "卦辭（Oracle）金色框",
        "吉凶判定 badge 色彩對應:",
        "  大吉=金 中吉=綠 小吉=藍",
        "  平=灰 小凶=紅",
        "變卦顯示（紫色主題）",
    ], bullet_size=11)

add_bullet_card(slide, 9.6, 4.05, 3.3, 1.4,
    "🔧 互動功能",
    [
        "5 種問題類別（必選）",
        "自由輸入問題（可選, 100字）",
        "搖卦震動回饋 [0,80,60,80...]",
        "分享籤詩 + 重新求籤按鈕",
    ], bullet_size=11)

add_bullet_card(slide, 9.6, 5.7, 3.3, 1.2,
    "⚙️ 技術",
    [
        "hexagram-engine.ts 本地運算",
        "64 卦完整資料庫",
        "結果送入 chat-store 對話記錄",
    ], bullet_size=11)


# ════════════════════════════════════════════════════════
# SLIDE 11 — Profile Screen
# ════════════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_bg(slide)
add_section_title(slide, "08  個人檔案 / 設定畫面")
add_subtitle_line(slide, "app/(tabs)/profile.tsx — 使用者資訊、命盤資料、系統設定")

# Phone mockup
add_phone_frame(slide, 0.5, 1.4, 3.2, 5.5, "我的", [
    "",
    "**🦌 用戶名稱",
    "Lv.5 青芽鹿 · 木屬性 · 驚蟄",
    "[免費版]",
    "",
    "⭐ 升級會員解鎖更多功能 →",
    "",
    "**語言設定",
    "🇹🇼 繁體中文  ›",
    "",
    "**命盤資料",
    "八字: 甲寅 丙午 壬子 辛未",
    "紫微主星: 天機星",
    "西洋星座: 雙魚座",
    "節氣靈寵: 🦌 青芽鹿·驚蟄",
])

# Second phone for bottom section
add_phone_frame(slide, 4.0, 1.4, 3.2, 5.5, "我的（續）", [
    "",
    "**其他",
    "",
    "🔔 推播通知          ›",
    "",
    "📄 隱私政策          ›",
    "",
    "📋 服務條款          ›",
    "",
    "ℹ️  關於靈犀          ›",
    "",
    "🔄 恢復購買          ›",
    "",
    "",
    "**🚪 登出",
    "(紅色文字, 需二次確認)",
])

# Right details
add_bullet_card(slide, 7.7, 1.4, 5.1, 2.0,
    "👤 使用者資訊卡",
    [
        "顯示靈寵 emoji + 用戶名稱（明體粗體）",
        "等級 + 靈寵名 + 五行屬性 + 節氣名稱",
        "訂閱等級 badge：免費版 / 靈犀會員 / 靈犀至尊（至尊紫色底）",
        "免費用戶顯示升級 CTA 卡片 → 點擊開啟 UpgradeModal",
    ])

add_bullet_card(slide, 7.7, 3.65, 5.1, 1.6,
    "📅 命盤資料",
    [
        "八字四柱：年柱/月柱/日柱/時柱（天干地支組合）",
        "紫微斗數：命宮主星名稱",
        "西洋占星：對應星座中文名稱",
        "節氣靈寵：emoji + 寵物名 + 節氣名",
    ])

add_bullet_card(slide, 7.7, 5.5, 5.1, 1.4,
    "⚙️ 系統設定",
    [
        "語言切換：底部滑出式 6 語言選單（含國旗 emoji）",
        "隱私政策 / 服務條款：外部瀏覽器開啟 HTML 頁面",
        "關於靈犀：顯示版本號 v1.0.0",
        "恢復購買：呼叫 RevenueCat restorePurchases",
        "登出：確認對話框 → 清除所有本地儲存 + token",
    ])


# ════════════════════════════════════════════════════════
# SLIDE 12 — Upgrade Modal & Subscription
# ════════════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_bg(slide)
add_section_title(slide, "09  升級彈窗 / 訂閱方案")
add_subtitle_line(slide, "components/UpgradeModal.tsx — 三種觸發時機、兩種付費方案")

# Modal mockup
add_phone_frame(slide, 0.5, 1.4, 3.5, 5.5, "升級彈窗", [
    "",
    "🦌 主人，今天的次數",
    "用完了...升級的話，",
    "我能幫你做更多喔！",
    "",
    "**⭐ 靈犀會員  $390/月",
    "• 靈眼/靈心/靈魂 5次/日",
    "• 靈寵等級上限 Lv.20",
    "• AI 深度解讀 (Sonnet)",
    "   [ 立即升級 ] (金色)",
    "",
    "**👑 靈犀至尊  $1990/月",
    "• 全功能無限使用",
    "• 靈寵等級無上限",
    "• 專屬進化 + 皮膚",
    "   [ 立即升級 ] (紫色)",
    "",
    "明天再來",
])

# Subscription comparison table
add_rounded_rect(slide, 4.5, 1.4, 8.3, 3.5, fill_color=DARK_BG)
add_textbox(slide, 4.7, 1.5, 8, 0.4, "💎 訂閱方案比較表",
            font_size=18, color=GOLD, bold=True)

# Table headers
headers = ["功能項目", "免費版", "⭐ 會員 $390/月", "👑 至尊 $1990/月"]
col_x = [4.8, 6.8, 8.5, 10.6]
col_w = [1.8, 1.5, 2.0, 2.0]
for i, h in enumerate(headers):
    add_textbox(slide, col_x[i], 2.0, col_w[i], 0.35, h,
                font_size=11, color=GOLD if i == 0 else WHITE, bold=True,
                alignment=PP_ALIGN.CENTER)

# Table rows
rows = [
    ("每日使用次數", "1 次", "5 次", "無限"),
    ("靈寵等級上限", "Lv.10", "Lv.20", "無上限"),
    ("進化階段上限", "1 階段", "2 階段", "5 階段"),
    ("AI 分析模型", "基礎範本", "Haiku", "Sonnet"),
    ("Lv.10+ 加成", "+1 次/日", "+1 次/日", "N/A"),
    ("Lv.20+ 加成", "+2 總次數", "+2 總次數", "N/A"),
]
for r, (label, free, member, supreme) in enumerate(rows):
    y = 2.4 + r * 0.33
    vals = [label, free, member, supreme]
    for i, v in enumerate(vals):
        clr = MUTED if i == 0 else (LIGHT_GRAY if i == 1 else (GOLD if i == 2 else PURPLE))
        add_textbox(slide, col_x[i], y, col_w[i], 0.3, v,
                    font_size=10, color=clr,
                    alignment=PP_ALIGN.CENTER if i > 0 else PP_ALIGN.LEFT)

# Trigger conditions
add_bullet_card(slide, 4.5, 5.15, 4.0, 1.75,
    "⚡ 彈窗觸發條件",
    [
        "每日使用次數用盡 → 自動彈出",
        "靈寵等級達到方案上限 → 自動彈出",
        "個人檔案頁手動點擊升級 CTA",
        "購買進行中顯示 Loading Spinner",
    ], bullet_size=11)

add_bullet_card(slide, 8.8, 5.15, 4.0, 1.75,
    "🔧 付費整合",
    [
        "RevenueCat SDK 管理訂閱",
        "Product ID: lingxi_member_monthly",
        "Product ID: lingxi_supreme_monthly",
        "恢復購買支援（Profile 頁面）",
    ], bullet_size=11)


# ════════════════════════════════════════════════════════
# SLIDE 13 — Chat Bubble System
# ════════════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_bg(slide)
add_section_title(slide, "10  對話氣泡系統")
add_subtitle_line(slide, "components/PetBubble.tsx — 11 種訊息類型，富內容渲染")

bubble_types = [
    ("fortune", "每日運勢", "🔮", [
        "5 項分數條：財運/桃花/事業/健康/學業",
        "幸運方位 + 幸運色 + 幸運數字",
        "整體運勢分數 + 靈寵評語",
    ]),
    ("face", "面相結果", "👁", [
        "5 項面相分數：天庭/眉運/眼運/鼻運/口運",
        "總分 + 星級評定",
        "幸運物 + 幸運方位",
    ]),
    ("fengshui", "風水結果", "🧭", [
        "3×3 九宮格方位圖",
        "八門標註（生門/休門...）",
        "吉方金色 / 凶方紅色高亮",
    ]),
    ("divination", "占卜結果", "🏮", [
        "卦象符號 (40px) + 卦名",
        "卦辭 (Oracle) 引用框",
        "上卦/下卦/五行/吉凶資訊列",
    ]),
    ("feed", "餵食", "🍖", [
        "+50 EXP badge",
        "金色背景高亮",
    ]),
    ("play", "玩耍", "🎾", [
        "+30 EXP badge",
        "金色背景高亮",
    ]),
    ("meditate", "冥想", "🧘", [
        "+20 EXP badge",
        "金色背景高亮",
    ]),
    ("levelup", "升級", "⬆️", [
        "金色慶祝 badge",
        "新等級顯示",
    ]),
    ("evolve", "進化", "✨", [
        "紫色慶祝 badge",
        "新進化階段顯示",
    ]),
    ("text", "一般文字", "💬", [
        "純文字訊息",
        "靈寵回應內容",
    ]),
    ("system", "系統訊息", "⚙️", [
        "系統通知",
        "狀態變更提示",
    ]),
]

# Layout as grid
for i, (type_id, name, emoji, details) in enumerate(bubble_types):
    col = i % 4
    row = i // 4
    x = 0.5 + col * 3.2
    y = 1.5 + row * 1.95

    add_rounded_rect(slide, x, y, 3.0, 1.75, fill_color=DARK_BG)
    add_textbox(slide, x + 0.15, y + 0.1, 2.7, 0.3,
                f"{emoji}  {name}  ({type_id})",
                font_size=13, color=GOLD, bold=True)
    detail_y = y + 0.45
    for d in details:
        add_textbox(slide, x + 0.15, detail_y, 2.7, 0.25,
                    f"• {d}", font_size=9, color=LIGHT_GRAY)
        detail_y += 0.22

# Bottom note
add_textbox(slide, 0.5, 7.0, 12, 0.3,
            "所有氣泡：靈寵 emoji + 名字 + 時間戳 | 左對齊 | 深金色半透明背景 | 日期分隔線 | 最多保留 200 則訊息",
            font_size=11, color=MUTED)


# ════════════════════════════════════════════════════════
# SLIDE 14 — Spirit Pet System
# ════════════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_bg(slide)
add_section_title(slide, "11  靈寵養成系統")
add_subtitle_line(slide, "24 節氣靈寵 × 五行屬性 × 等級進化")

# 24 pets sample grid
pets_data = [
    ("立春", "🦌", "青芽鹿", "木"), ("雨水", "🐸", "潤澤蛙", "水"),
    ("驚蟄", "🐉", "驚雷龍", "木"), ("春分", "🦋", "春翼蝶", "木"),
    ("清明", "🦢", "清風鶴", "木"), ("穀雨", "🐍", "穀靈蛇", "土"),
    ("立夏", "🦅", "炎翼鷹", "火"), ("小滿", "🐝", "蜜光蜂", "火"),
    ("芒種", "🦊", "芒野狐", "火"), ("夏至", "🦁", "日輪獅", "火"),
    ("小暑", "🐠", "暑泉魚", "火"), ("大暑", "🦎", "烈陽蜥", "火"),
    ("立秋", "🦅", "金風鷹", "金"), ("處暑", "🐺", "暮嵐狼", "金"),
    ("白露", "🦉", "露光鴞", "金"), ("秋分", "🦊", "秋影狐", "金"),
    ("寒露", "🐆", "寒霜豹", "金"), ("霜降", "🦇", "霜翼蝠", "金"),
    ("立冬", "🐻", "玄冬熊", "水"), ("小雪", "🐧", "雪靈企", "水"),
    ("大雪", "🐺", "雪嵐狼", "水"), ("冬至", "🐉", "玄冰龍", "水"),
    ("小寒", "🦌", "寒霧鹿", "水"), ("大寒", "🐢", "玄武龜", "水"),
]

element_colors = {
    "木": RGBColor(0x4E, 0xC9, 0x4E),
    "火": RGBColor(0xE8, 0x64, 0x47),
    "土": RGBColor(0xC9, 0xA8, 0x4E),
    "金": RGBColor(0xE8, 0xC5, 0x47),
    "水": RGBColor(0x47, 0x8D, 0xE8),
}

for i, (term, emoji, name, element) in enumerate(pets_data):
    col = i % 8
    row = i // 8
    x = 0.3 + col * 1.6
    y = 1.5 + row * 1.15
    clr = element_colors.get(element, GOLD)
    add_rounded_rect(slide, x, y, 1.5, 0.95, fill_color=DARK_BG, border_color=clr)
    add_textbox(slide, x + 0.05, y + 0.05, 1.4, 0.3,
                f"{emoji} {name}", font_size=11, color=WHITE, bold=True)
    add_textbox(slide, x + 0.05, y + 0.35, 1.4, 0.25,
                f"{term} · {element}系", font_size=9, color=clr)
    add_textbox(slide, x + 0.05, y + 0.6, 1.4, 0.25,
                f"", font_size=8, color=MUTED)

# Bottom: progression system
add_rounded_rect(slide, 0.3, 5.1, 12.7, 2.1, fill_color=DARK_BG)
add_textbox(slide, 0.5, 5.2, 4, 0.35, "📈 養成進化機制",
            font_size=16, color=GOLD, bold=True)

prog_items = [
    ("經驗值獲取", "餵食 +50 | 玩耍 +30 | 冥想 +20 EXP"),
    ("升級公式", "所需 EXP = 基礎值 × 1.3^(當前等級)"),
    ("進化機制", "每 10 級進化一次，共 5 階段（受訂閱方案限制）"),
    ("屬性成長", "力量 (power) / 親和 (affinity) / 智慧 (wisdom) 隨等級提升"),
    ("Lv.10+ 加成", "免費/會員每日使用次數 +1（Lv.20+ 再 +1）"),
]
for i, (label, desc) in enumerate(prog_items):
    y = 5.65 + i * 0.3
    add_textbox(slide, 0.6, y, 2.2, 0.28, f"▸ {label}",
                font_size=11, color=GOLD, bold=True)
    add_textbox(slide, 2.8, y, 10, 0.28, desc,
                font_size=11, color=LIGHT_GRAY)


# ════════════════════════════════════════════════════════
# SLIDE 15 — i18n & Global Components
# ════════════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_bg(slide)
add_section_title(slide, "12  多語系與全域元件")
add_subtitle_line(slide, "6 語言國際化 + WheelPicker + ErrorBoundary + 主題系統")

# i18n card
add_bullet_card(slide, 0.5, 1.5, 5.8, 2.5,
    "🌐 國際化 (i18n) 系統",
    [
        "框架：react-i18next + Expo Localization 自動偵測",
        "支援語言：🇹🇼 繁中 / 🇨🇳 簡中 / 🇯🇵 日文 / 🇺🇸 英文 / 🇩🇪 德文 / 🇫🇷 法文",
        "預設語言：依裝置語系自動選擇（Hant→繁中, Hans→簡中）",
        "Fallback：英文 (en)",
        "翻譯鍵值：約 400+ 項，涵蓋所有 UI 文字",
        "切換方式：Onboarding Step 0 / Profile 頁語言設定",
    ])

# WheelPicker card
add_bullet_card(slide, 6.6, 1.5, 6.2, 2.5,
    "🎡 WheelPicker 滾輪選擇器",
    [
        "iOS 風格 FlatList + snapToInterval 實作",
        "可見項目數：5 項（高度 220px, 每項 44px）",
        "選中項：18px 金色粗體 + 金色指示條",
        "相鄰項：16px 灰色 → 遠端：14px 50% 透明",
        "用途：Onboarding 生辰年/月/日選擇",
    ])

# Language Selector card
add_bullet_card(slide, 0.5, 4.3, 4.0, 1.8,
    "🔤 LanguageSelector 語言選擇器",
    [
        "行內顯示：國旗 + 語言名 + › 箭頭",
        "點擊展開底部滑出式選單",
        "6 語言選項 + 當前選擇打勾",
        "用於 Profile 設定頁面",
    ], bullet_size=11)

# ErrorBoundary card
add_bullet_card(slide, 4.75, 4.3, 4.0, 1.8,
    "🛡 ErrorBoundary 錯誤邊界",
    [
        "Class Component 全域包裹",
        "錯誤畫面：🔮 + 「發生了一些問題」",
        "「靈犀遇到了意外狀況」說明文字",
        "「重新載入」按鈕恢復 App",
    ], bullet_size=11)

# Theme card
add_bullet_card(slide, 9.0, 4.3, 4.0, 1.8,
    "🎨 主題系統 (theme.ts)",
    [
        "Colors: background #08080f, gold #e8c547",
        "Fonts: MaShanZheng (書法), NotoSerifTC (明體)",
        "Spacing: xs=4, sm=8, md=16, lg=24, xl=32",
        "Border radius, shadows 統一定義",
    ], bullet_size=11)

# State management summary
add_rounded_rect(slide, 0.5, 6.35, 12.3, 0.95, fill_color=DARK_BG)
add_textbox(slide, 0.7, 6.4, 3, 0.35, "💾 狀態管理 (Zustand × 4)",
            font_size=14, color=GOLD, bold=True)

stores = [
    ("auth-store", "認證狀態 / JWT tokens / login, register, logout"),
    ("user-store", "出生資料 / 命理計算 / 訂閱等級 / 每日額度追蹤"),
    ("pet-store", "靈寵身份 / 等級經驗 / 進化階段 / 屬性值"),
    ("chat-store", "對話訊息 (max 200) / 11 種訊息類型 / 日期分隔"),
]
for i, (name, desc) in enumerate(stores):
    x = 0.7 + i * 3.1
    add_textbox(slide, x, 6.75, 1.2, 0.25, name,
                font_size=10, color=GOLD, bold=True)
    add_textbox(slide, x + 1.25, 6.75, 1.8, 0.45, desc,
                font_size=9, color=MUTED)


# ════════════════════════════════════════════════════════
# SLIDE 16 — Version & Technical Summary
# ════════════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_bg(slide)
add_section_title(slide, "📋 版本資訊與技術摘要")

# Version info
add_rounded_rect(slide, 0.5, 1.2, 6.0, 3.5, fill_color=DARK_BG)
add_textbox(slide, 0.7, 1.3, 5.5, 0.4, "📦 版本資訊",
            font_size=18, color=GOLD, bold=True)

version_items = [
    ("App 版本", "v1.0.0"),
    ("App 名稱", "靈犀 (LING XI)"),
    ("Expo SDK", "54.0.0"),
    ("React Native", "0.81.5"),
    ("React", "19.1.0"),
    ("iOS Bundle ID", "com.youquan.lingxi"),
    ("Android Package", "com.yourname.lingxi (待修正)"),
    ("EAS Project ID", "22a8b11d-c07c-44df-b785-59a347afde18"),
    ("Owner", "dennysu"),
    ("文件日期", "2026-03-14"),
]
for i, (label, value) in enumerate(version_items):
    y = 1.8 + i * 0.28
    add_textbox(slide, 0.8, y, 2.0, 0.25, label,
                font_size=11, color=MUTED)
    add_textbox(slide, 2.8, y, 3.5, 0.25, value,
                font_size=11, color=WHITE, bold=True)

# Backend info
add_rounded_rect(slide, 6.8, 1.2, 6.0, 2.0, fill_color=DARK_BG)
add_textbox(slide, 7.0, 1.3, 5.5, 0.4, "🖥 後端服務",
            font_size=18, color=GOLD, bold=True)

backend_items = [
    ("Server 版本", "v1.0.0"),
    ("部署平台", "Google Cloud Run"),
    ("區域", "asia-east1"),
    ("API Base", "lingxi-api-316167025817.asia-east1.run.app"),
    ("Auth", "JWT (access + refresh tokens)"),
]
for i, (label, value) in enumerate(backend_items):
    y = 1.8 + i * 0.28
    add_textbox(slide, 7.0, y, 2.0, 0.25, label,
                font_size=11, color=MUTED)
    add_textbox(slide, 9.0, y, 3.5, 0.25, value,
                font_size=11, color=WHITE, bold=True)

# API routes summary
add_rounded_rect(slide, 6.8, 3.5, 6.0, 3.6, fill_color=DARK_BG)
add_textbox(slide, 7.0, 3.6, 5.5, 0.4, "🔗 API 路由一覽",
            font_size=16, color=GOLD, bold=True)

routes = [
    ("Auth", "/auth/login, /auth/register, /auth/apple, /auth/refresh"),
    ("User", "/user/profile (GET/PUT)"),
    ("AI 面相", "/ai/face-reading"),
    ("AI 風水", "/ai/feng-shui"),
    ("AI 運勢", "/ai/fortune"),
    ("AI 穿搭", "/ai/outfit"),
    ("AI 占卜", "/ai/divination"),
    ("AI 靈寵", "/ai/pet-message"),
    ("訂閱狀態", "/api/subscription/status"),
    ("Webhook", "/webhook/revenuecat"),
]
for i, (label, route) in enumerate(routes):
    y = 4.1 + i * 0.28
    add_textbox(slide, 7.1, y, 1.5, 0.25, label,
                font_size=10, color=GOLD)
    add_textbox(slide, 8.5, y, 4.0, 0.25, route,
                font_size=10, color=LIGHT_GRAY)

# Key files
add_rounded_rect(slide, 0.5, 5.0, 6.0, 2.1, fill_color=DARK_BG)
add_textbox(slide, 0.7, 5.1, 5.5, 0.35, "📂 關鍵檔案路徑",
            font_size=16, color=GOLD, bold=True)

files = [
    "app/_layout.tsx — Root 導航 + Auth Guard",
    "app/auth.tsx — 登入/註冊",
    "app/onboarding.tsx — 新手引導",
    "app/(tabs)/pet.tsx — 主畫面",
    "app/(tabs)/profile.tsx — 個人檔案",
    "components/features/PetEye|Heart|PearlMode.tsx",
    "stores/auth|user|pet|chat-store.ts",
    "services/claude-api|bazi|ziwei|qimen|hexagram-engine.ts",
]
for i, f in enumerate(files):
    add_textbox(slide, 0.8, 5.5 + i * 0.2, 5.5, 0.2, f"▸ {f}",
                font_size=9, color=LIGHT_GRAY)


# ═══════════════════════════════════════════════════════
# Save
# ═══════════════════════════════════════════════════════
output_path = r"C:\Dev\LingXi\LingXi_UI_操作說明_v1.0.0_20260314.pptx"
prs.save(output_path)
print(f"PPT saved to: {output_path}")
print(f"Total slides: {len(prs.slides)}")
