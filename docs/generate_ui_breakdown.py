"""
靈犀 (LingXi) — 完整 UI 拆解 PPTX 生成器
每個畫面、元件、互動邏輯都詳細拆解
"""

from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
import os

# ── 色彩常數 ──
BG       = RGBColor(0x08, 0x08, 0x0F)
GOLD     = RGBColor(0xE8, 0xC5, 0x47)
GOLD_DIM = RGBColor(0xC4, 0xB0, 0x7A)
MUTED    = RGBColor(0x8B, 0x7D, 0x5E)
DARK     = RGBColor(0x6B, 0x63, 0x50)
DARKEST  = RGBColor(0x5A, 0x50, 0x40)
WHITE    = RGBColor(0xFF, 0xFF, 0xFF)
BLUE     = RGBColor(0x64, 0xB4, 0xFF)
PURPLE   = RGBColor(0xA7, 0x8B, 0xFA)
GREEN    = RGBColor(0x64, 0xC8, 0x80)
RED      = RGBColor(0xC4, 0x40, 0x40)
PINK     = RGBColor(0xFF, 0x8B, 0xA0)
SURFACE  = RGBColor(0x0D, 0x0D, 0x15)
CARD_BG  = RGBColor(0x12, 0x12, 0x1A)

FONT_BODY = 'Microsoft JhengHei'
FONT_CODE = 'Consolas'

prs = Presentation()
prs.slide_width  = Inches(13.333)
prs.slide_height = Inches(7.5)


def set_bg(slide, color=BG):
    bg = slide.background
    fill = bg.fill
    fill.solid()
    fill.fore_color.rgb = color


def add_text(slide, left, top, width, height, text, size=14, color=WHITE,
             bold=False, align=PP_ALIGN.LEFT, font=FONT_BODY):
    txBox = slide.shapes.add_textbox(Inches(left), Inches(top), Inches(width), Inches(height))
    tf = txBox.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = text
    p.font.size = Pt(size)
    p.font.color.rgb = color
    p.font.bold = bold
    p.font.name = font
    p.alignment = align
    return txBox


def add_rect(slide, left, top, width, height, fill_color=None, border_color=None, border_width=Pt(1)):
    shape = slide.shapes.add_shape(
        MSO_SHAPE.ROUNDED_RECTANGLE,
        Inches(left), Inches(top), Inches(width), Inches(height)
    )
    if fill_color:
        shape.fill.solid()
        shape.fill.fore_color.rgb = fill_color
    else:
        shape.fill.background()
    if border_color:
        shape.line.color.rgb = border_color
        shape.line.width = border_width
    else:
        shape.line.fill.background()
    return shape


def add_multiline(slide, left, top, width, height, lines, default_size=12,
                  default_color=WHITE, line_spacing=1.3, font=FONT_BODY):
    """lines: list of (text, size, color, bold) or just str"""
    txBox = slide.shapes.add_textbox(Inches(left), Inches(top), Inches(width), Inches(height))
    tf = txBox.text_frame
    tf.word_wrap = True
    for i, line in enumerate(lines):
        if isinstance(line, str):
            txt, sz, clr, b = line, default_size, default_color, False
        else:
            txt = line[0]
            sz = line[1] if len(line) > 1 else default_size
            clr = line[2] if len(line) > 2 else default_color
            b = line[3] if len(line) > 3 else False
        if i == 0:
            p = tf.paragraphs[0]
        else:
            p = tf.add_paragraph()
        p.text = txt
        p.font.size = Pt(sz)
        p.font.color.rgb = clr
        p.font.bold = b
        p.font.name = font
        p.space_after = Pt(sz * (line_spacing - 1) * 2)
    return txBox


def title_slide(title, subtitle=""):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    set_bg(slide)
    add_text(slide, 0, 2.5, 13.333, 1.2, title, size=40, color=GOLD, bold=True, align=PP_ALIGN.CENTER)
    if subtitle:
        add_text(slide, 0, 3.8, 13.333, 0.8, subtitle, size=18, color=GOLD_DIM, align=PP_ALIGN.CENTER)
    return slide


def section_title(title, desc=""):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    set_bg(slide)
    add_rect(slide, 0.5, 3.2, 0.15, 0.6, fill_color=GOLD)
    add_text(slide, 1.0, 3.0, 11, 1.0, title, size=34, color=GOLD, bold=True)
    if desc:
        add_text(slide, 1.0, 4.0, 11, 0.6, desc, size=16, color=MUTED)
    return slide


def two_col_slide(title, left_lines, right_lines, left_title="", right_title=""):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    set_bg(slide)
    add_text(slide, 0.5, 0.3, 12, 0.7, title, size=26, color=GOLD, bold=True)
    add_rect(slide, 0.5, 0.95, 12.3, 0.02, fill_color=GOLD)
    if left_title:
        add_text(slide, 0.5, 1.1, 5.8, 0.5, left_title, size=16, color=BLUE, bold=True)
    add_multiline(slide, 0.5, 1.6 if left_title else 1.2, 5.8, 5.5, left_lines)
    if right_title:
        add_text(slide, 7.0, 1.1, 5.8, 0.5, right_title, size=16, color=BLUE, bold=True)
    add_multiline(slide, 7.0, 1.6 if right_title else 1.2, 5.8, 5.5, right_lines)
    return slide


def content_slide(title, lines, col2_lines=None, col2_title=None):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    set_bg(slide)
    add_text(slide, 0.5, 0.3, 12, 0.7, title, size=26, color=GOLD, bold=True)
    add_rect(slide, 0.5, 0.95, 12.3, 0.02, fill_color=GOLD)
    if col2_lines:
        add_multiline(slide, 0.5, 1.15, 5.8, 5.8, lines)
        if col2_title:
            add_text(slide, 7.0, 1.1, 5.8, 0.5, col2_title, size=16, color=BLUE, bold=True)
        add_multiline(slide, 7.0, 1.6 if col2_title else 1.15, 5.8, 5.8, col2_lines)
    else:
        add_multiline(slide, 0.5, 1.15, 12.3, 6.0, lines)
    return slide


def ascii_slide(title, ascii_art, notes=None):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    set_bg(slide)
    add_text(slide, 0.5, 0.3, 12, 0.7, title, size=26, color=GOLD, bold=True)
    add_rect(slide, 0.5, 0.95, 12.3, 0.02, fill_color=GOLD)
    add_rect(slide, 0.5, 1.15, 7.5, 5.8, fill_color=RGBColor(0x10, 0x10, 0x18), border_color=RGBColor(0x30, 0x30, 0x40))
    add_text(slide, 0.7, 1.3, 7.1, 5.5, ascii_art, size=11, color=GOLD_DIM, font=FONT_CODE)
    if notes:
        add_multiline(slide, 8.3, 1.15, 4.5, 5.8, notes)
    return slide


# ══════════════════════════════════════
# 開始建立投影片
# ══════════════════════════════════════

# ─── 封面 ───
slide = title_slide("靈犀 LingXi — 完整 UI 拆解", "每個畫面 · 每個元件 · 每個互動 · 完整細節")
add_text(slide, 0, 4.8, 13.333, 0.5, "2026-03-03  |  基於實際程式碼分析", size=13, color=DARKEST, align=PP_ALIGN.CENTER)

# ─── 目錄 ───
content_slide("目錄", [
    ("第一部分：全局設計系統", 16, GOLD, True),
    ("  01. 色彩系統  |  02. 字型與間距  |  03. 設計模式", 12, MUTED),
    ("", 8, WHITE),
    ("第二部分：導航與認證", 16, GOLD, True),
    ("  04. 導航流程圖  |  05. 登入/註冊  |  06. 五步引導", 12, MUTED),
    ("", 8, WHITE),
    ("第三部分：主畫面", 16, GOLD, True),
    ("  07. Tab 佈局  |  08. 靈寵主畫面  |  09. PetAvatar", 12, MUTED),
    ("  10. PetChat 聊天  |  11. PetBubble 氣泡  |  12. ActionBar", 12, MUTED),
    ("", 8, WHITE),
    ("第四部分：三大功能", 16, GOLD, True),
    ("  13-15. 靈眼（面相） |  16-17. 靈心（風水） |  18-20. 靈魂（占卜）", 12, MUTED),
    ("", 8, WHITE),
    ("第五部分：輔助元件", 16, GOLD, True),
    ("  21. UpgradeModal  |  22. Profile  |  23. LanguageSelector", 12, MUTED),
    ("  24. WheelPicker  |  25. ErrorBoundary", 12, MUTED),
    ("", 8, WHITE),
    ("第六部分：資料與系統", 16, GOLD, True),
    ("  26. 狀態管理  |  27. 訂閱方案  |  28. 24節氣靈寵  |  29. i18n", 12, MUTED),
])

# ══════════════ 第一部分：設計系統 ══════════════

section_title("第一部分：全局設計系統", "色彩 · 字型 · 間距 · 設計模式")

# 01. 色彩系統
two_col_slide("01. 色彩系統 — 主色調 & 文字色", [
    ("【主色調 Primary】", 14, GOLD, True),
    ("primary       #E8C547  金色 — 標題/按鈕/高亮/EXP條", 11, GOLD),
    ("primaryDark   #8B6914  深金", 11, RGBColor(0x8B,0x69,0x14)),
    ("primaryLight  #F5E6A3  淺金", 11, RGBColor(0xF5,0xE6,0xA3)),
    ("primaryBg     rgba(232,197,71,0.04)  卡片背景", 11, MUTED),
    ("primaryBorder rgba(232,197,71,0.12)  卡片邊框", 11, MUTED),
    ("", 6, WHITE),
    ("【背景色 Background】", 14, WHITE, True),
    ("background    #08080F  全局深色背景", 11, WHITE),
    ("surface       #0D0D15  Modal 背景", 11, RGBColor(0xAA,0xAA,0xAA)),
    ("surfaceLight  #151520  抬升表面", 11, RGBColor(0xAA,0xAA,0xAA)),
], [
    ("【文字色階】", 14, WHITE, True),
    ("textPrimary   #E8C547  = primary", 11, GOLD),
    ("textSecondary #C4B07A  次要文字", 11, GOLD_DIM),
    ("textMuted     #8B7D5E  柔和文字", 11, MUTED),
    ("textDark      #6B6350  暗色文字", 11, DARK),
    ("textDarkest   #5A5040  最暗文字", 11, DARKEST),
    ("", 6, WHITE),
    ("【功能色】", 14, WHITE, True),
    ("pet     #64B4FF  靈寵相關（藍）", 11, BLUE),
    ("fengshui#64C880  風水（綠）", 11, GREEN),
    ("outfit  #A78BFA  穿搭（紫）", 11, PURPLE),
    ("love    #FF8BA0  桃花（粉）", 11, PINK),
    ("danger  #C44040  危險/警告（紅）", 11, RED),
])

two_col_slide("01. 色彩系統 — 五行色 & 透明度運用", [
    ("【五行色彩】", 14, GOLD, True),
    ("金  metal  #E8E0C0", 12, RGBColor(0xE8,0xE0,0xC0)),
    ("木  wood   #80C880", 12, RGBColor(0x80,0xC8,0x80)),
    ("水  water  #64B4FF", 12, BLUE),
    ("火  fire   #FF6B6B", 12, RGBColor(0xFF,0x6B,0x6B)),
    ("土  earth  #C8A060", 12, RGBColor(0xC8,0xA0,0x60)),
    ("", 8, WHITE),
    ("五行色用於：", 12, MUTED),
    ("  • 靈寵五行系徽章", 11, MUTED),
    ("  • 卦象五行顯示", 11, MUTED),
    ("  • 運勢引擎權重視覺化", 11, MUTED),
], [
    ("【透明度層級規範】", 14, GOLD, True),
    ("背景填充：", 12, GOLD_DIM, True),
    ("  0.03 ~ 0.06  極淡背景（卡片）", 11, MUTED),
    ("  0.08 ~ 0.12  中等背景（按鈕hover）", 11, MUTED),
    ("  0.15         強調背景（active按鈕）", 11, MUTED),
    ("", 6, WHITE),
    ("邊框：", 12, GOLD_DIM, True),
    ("  0.06 ~ 0.10  預設邊框", 11, MUTED),
    ("  0.12 ~ 0.15  中等邊框", 11, MUTED),
    ("  0.25 ~ 0.40  高亮/選中邊框", 11, MUTED),
    ("", 6, WHITE),
    ("文字透明度：", 12, GOLD_DIM, True),
    ("  0.35  Tab未選中icon", 11, MUTED),
    ("  0.50  副標題", 11, MUTED),
    ("  0.60  按壓反饋 (Pressable)", 11, MUTED),
])

# 02. 字型與間距
two_col_slide("02. 字型系統 & 間距規範", [
    ("【三套字型】", 14, GOLD, True),
    ("", 4, WHITE),
    ("NotoSerifTC_400Regular (serif)", 13, WHITE, True),
    ("  用途：正文、標籤、所有body文字", 11, MUTED),
    ("  尺寸：9~16pt", 11, MUTED),
    ("", 6, WHITE),
    ("NotoSerifTC_700Bold (serifBold)", 13, WHITE, True),
    ("  用途：靈寵名、粗體標題、強調", 11, MUTED),
    ("  尺寸：14~20pt", 11, MUTED),
    ("", 6, WHITE),
    ("MaShanZheng_400Regular (brush)", 13, WHITE, True),
    ("  用途：書法標題 — App名、步驟標題、運勢等級", 11, MUTED),
    ("  尺寸：18~56pt", 11, MUTED),
    ("  特效：letterSpacing 4~8, 金色光暈陰影", 11, MUTED),
], [
    ("【間距 Spacing】", 14, GOLD, True),
    ("xs: 4   sm: 8   md: 14", 12, WHITE),
    ("lg: 20  xl: 30  xxl: 40", 12, WHITE),
    ("", 8, WHITE),
    ("【圓角 BorderRadius】", 14, GOLD, True),
    ("sm: 8   md: 12  lg: 16", 12, WHITE),
    ("xl: 20  round: 50", 12, WHITE),
    ("", 8, WHITE),
    ("【常見尺寸】", 14, GOLD, True),
    ("StatusBar paddingTop: 54", 11, MUTED),
    ("Tab bar height: 80, paddingBottom: 20", 11, MUTED),
    ("Modal card width: 85%, borderRadius: 20", 11, MUTED),
    ("Button minHeight: 52, borderRadius: 14", 11, MUTED),
    ("Card padding: 14~24, borderRadius: 12~16", 11, MUTED),
    ("Input padding: 14, borderRadius: 12", 11, MUTED),
])

# 03. 設計模式
content_slide("03. 全局設計模式", [
    ("【按鈕反饋】", 14, GOLD, True),
    ("  所有 Pressable 元件：按下時 opacity 0.6~0.7", 12, MUTED),
    ("  disabled 狀態：opacity 0.3", 12, MUTED),
    ("  Loading 狀態：顯示 ActivityIndicator (color #E8C547)", 12, MUTED),
    ("", 6, WHITE),
    ("【卡片模式】", 14, GOLD, True),
    ("  金色系卡片：bg rgba(gold,0.04~0.06), border rgba(gold,0.10~0.15), radius 12~16", 12, MUTED),
    ("  藍色系卡片：bg rgba(blue,0.04~0.06), border rgba(blue,0.10~0.12)  → 靈寵語音/AI解讀", 12, MUTED),
    ("  紫色系卡片：bg rgba(purple,0.04~0.06), border rgba(purple,0.10~0.15) → 至尊/進化", 12, MUTED),
    ("  綠色系卡片：bg rgba(green,0.06), border rgba(green,0.12) → GPS/風水", 12, MUTED),
    ("", 6, WHITE),
    ("【Modal 模式】", 14, GOLD, True),
    ("  遮罩：rgba(0,0,0,0.7)", 12, MUTED),
    ("  關閉鈕：36x36, borderRadius 18, bg rgba(255,255,255,0.08), ✕ fontSize 18", 12, MUTED),
    ("  Feature Modal：animationType='slide', presentationStyle='pageSheet'", 12, MUTED),
    ("  UpgradeModal：animationType='fade', transparent overlay", 12, MUTED),
    ("", 6, WHITE),
    ("【無陰影原則】", 14, GOLD, True),
    ("  僅少數例外：Logo 金色光暈、Tab 小圓點、結果等級文字", 12, MUTED),
])

# ══════════════ 第二部分：導航與認證 ══════════════

section_title("第二部分：導航與認證", "路由守衛 · 登入/註冊 · 五步引導")

# 04. 導航流程
ascii_slide("04. 導航流程圖", """
                    ┌─────────────┐
                    │   App 啟動   │
                    │ _layout.tsx  │
                    └──────┬──────┘
                           │
                ┌──────────┼──────────┐
                │          │          │
         未登入(非DEV)  DEV/已登入    已登入+已Onboard
                │      未Onboard      │
                ▼          │          ▼
       ┌────────────┐     │   ┌──────────────┐
       │  auth.tsx   │     │   │   (tabs)      │
       │  登入/註冊   │     │   │ _layout.tsx   │
       └──────┬─────┘     │   └──┬────────┬──┘
              │           │      │        │
              │           ▼      ▼        ▼
              │   ┌──────────┐ ┌────┐ ┌───────┐
              │   │onboarding│ │pet │ │profile│
              └──>│ 5步引導  │ │主頁│ │設定  │
                  └────┬─────┘ └────┘ └───────┘
                       └──────>┘""", [
    ("【路由守衛 — _layout.tsx】", 14, GOLD, True),
    ("", 4, WHITE),
    ("初始化順序：", 12, WHITE, True),
    ("1. 載入字型 (NotoSerif + MaShanZheng)", 11, MUTED),
    ("2. 防止 SplashScreen 自動隱藏", 11, MUTED),
    ("3. checkAuth() 驗證 JWT", 11, MUTED),
    ("4. initSubscriptionService()", 11, MUTED),
    ("5. 字型+認證完成 → 隱藏 Splash", 11, MUTED),
    ("", 6, WHITE),
    ("導向邏輯：", 12, WHITE, True),
    ("DEV_SKIP_AUTH = __DEV__", 11, GOLD),
    ("未登入 → /auth", 11, MUTED),
    ("已登入+未引導 → /onboarding", 11, MUTED),
    ("已登入+已引導 → /(tabs)", 11, MUTED),
    ("", 6, WHITE),
    ("Stack 設定：", 12, WHITE, True),
    ("headerShown: false", 11, MUTED),
    ("animation: 'fade'", 11, MUTED),
    ("背景: #08080F", 11, MUTED),
])

# 05. Auth Screen
ascii_slide("05. 登入/註冊畫面 — Auth Screen", """
┌────────────────────────────┐
│                            │
│         靈犀               │  ← MaShanZheng 56pt
│        LING XI             │  ← 13pt rgba(gold,0.5)
│                            │     letterSpacing 8
│  ┌──────────────────────┐  │
│  │   Sign in with Apple  │  │  ← iOS 限定
│  └──────────────────────┘  │     白色按鈕 h52
│  ─────────── 或 ──────────  │
│                            │
│       登入帳號              │  ← MaShanZheng 24pt
│                            │
│  姓名 (註冊時)              │  ← label 11pt #6B6350
│  ┌──────────────────────┐  │     letterSpacing 2
│  │                      │  │  ← input 16pt #E8C547
│  └──────────────────────┘  │     bg rgba(gold,0.06)
│  電子郵件                   │     border rgba(gold,0.15)
│  ┌──────────────────────┐  │     borderRadius 12
│  │                      │  │     padding 14
│  └──────────────────────┘  │
│  密碼                       │
│  ┌──────────────────────┐  │
│  │  ●●●●●●              │  │  ← secureTextEntry
│  └──────────────────────┘  │
│                            │
│  ┌──────────────────────┐  │  ← 主按鈕
│  │       登    入        │  │     bg rgba(gold,0.15)
│  └──────────────────────┘  │     border rgba(gold,0.35)
│                            │     16pt bold letterSpacing 4
│     沒有帳號？註冊          │  ← 14pt #C4B07A
│                            │
└────────────────────────────┘""", [
    ("【狀態管理】", 13, GOLD, True),
    ("Local: mode(login|register)", 11, MUTED),
    ("       email, password, name", 11, MUTED),
    ("Store: authStore.login()", 11, MUTED),
    ("       authStore.register()", 11, MUTED),
    ("       authStore.loginWithApple()", 11, MUTED),
    ("", 6, WHITE),
    ("【表單驗證】", 13, GOLD, True),
    ("email + password 必填", 11, MUTED),
    ("註冊: name 也必填", 11, MUTED),
    ("email maxLength: 100", 11, MUTED),
    ("password maxLength: 64", 11, MUTED),
    ("name maxLength: 30", 11, MUTED),
    ("", 6, WHITE),
    ("【錯誤顯示】", 13, GOLD, True),
    ("紅色卡片: bg rgba(red,0.1)", 11, MUTED),
    ("border rgba(red,0.3)", 11, MUTED),
    ("文字 #C44040 13pt 居中", 11, MUTED),
    ("", 6, WHITE),
    ("【Loading】", 13, GOLD, True),
    ("全螢幕遮罩 rgba(8,8,15,0.85)", 11, MUTED),
    ("ActivityIndicator + 認證中...", 11, MUTED),
])

# 06. Onboarding
ascii_slide("06. Onboarding Step 0 — 語言選擇", """
┌──────────────────────────┐
│                          │
│           🌐             │  ← 72pt emoji
│                          │
│       選擇語言            │  ← MaShanZheng 28pt gold
│                          │
│  ┌────────────────────┐  │
│  │ 🇹🇼  繁體中文    ✓  │  │  ← 選中: bg rgba(gold,0.12)
│  └────────────────────┘  │    border rgba(gold,0.4)
│  ┌────────────────────┐  │
│  │ 🇨🇳  简体中文       │  │  ← 未選: bg rgba(gold,0.04)
│  └────────────────────┘  │    border rgba(gold,0.1)
│  ┌────────────────────┐  │
│  │ 🇯🇵  日本語         │  │
│  └────────────────────┘  │
│  ┌────────────────────┐  │
│  │ 🇺🇸  English        │  │
│  └────────────────────┘  │
│  ┌────────────────────┐  │
│  │ 🇩🇪  Deutsch        │  │
│  └────────────────────┘  │
│  ┌────────────────────┐  │
│  │ 🇫🇷  Français       │  │
│  └────────────────────┘  │
│                          │
│  ┌────────────────────┐  │
│  │      下一步         │  │  ← 標準主按鈕
│  └────────────────────┘  │
└──────────────────────────┘""", [
    ("【元件細節】", 13, GOLD, True),
    ("國旗 emoji: fontSize 22", 11, MUTED),
    ("語言名稱: fontSize 15, serif", 11, MUTED),
    ("選中 ✓: 顯示在右側", 11, MUTED),
    ("gap: 8 (列表間距)", 11, MUTED),
    ("", 6, WHITE),
    ("【互動邏輯】", 13, GOLD, True),
    ("點擊語言項目:", 11, WHITE),
    ("→ i18n.changeLanguage(code)", 11, MUTED),
    ("→ 高亮切換至該項", 11, MUTED),
    ("→ 整個 UI 即時更新語言", 11, MUTED),
    ("", 6, WHITE),
    ("【支援語言】", 13, GOLD, True),
    ("zh-TW 繁體中文 (預設)", 11, MUTED),
    ("zh-CN 简体中文", 11, MUTED),
    ("ja    日本語", 11, MUTED),
    ("en    English", 11, MUTED),
    ("de    Deutsch", 11, MUTED),
    ("fr    Français", 11, MUTED),
])

ascii_slide("06. Onboarding Step 1~2 — 歡迎 & 姓名", """
 Step 1: 歡迎                Step 2: 姓名
┌───────────────────┐      ┌───────────────────┐
│                   │      │                   │
│       🐉          │      │     (emoji)       │
│                   │      │                   │
│      靈犀         │ 48pt │    輸入你的名字    │ 28pt
│     LING XI       │ 12pt │                   │
│                   │      │  你的名字          │
│  AI 玄學生活顧問   │ 14pt │  ┌─────────────┐  │
│  命理 × AI × 寵物  │      │  │             │  │
│                   │      │  └─────────────┘  │
│  ── 萬物皆有靈 ── │      │   maxLength: 20   │
│                   │      │                   │
│  ┌─────────────┐  │      │  ┌─────────────┐  │
│  │   開始探索   │  │      │  │   下一步     │  │
│  └─────────────┘  │      │  └─────────────┘  │
│                   │      │  (名字空=disabled)  │
└───────────────────┘      └───────────────────┘

Step 1 特效:
  靈犀 → MaShanZheng 48pt, gold
  光暈 textShadow: rgba(232,197,71,0.3), radius 40
  LING XI → 12pt, rgba(gold,0.5), letterSpacing 6
  描述文字 → 14pt, #8B7D5E, lineHeight 24""", [
    ("【Step 1 — 歡迎頁】", 13, GOLD, True),
    ("大 emoji: 🐉 fontSize 72", 11, MUTED),
    ("App名: MaShanZheng 48pt", 11, MUTED),
    ("光暈陰影 radius 40", 11, MUTED),
    ("描述: serif 14pt #8B7D5E", 11, MUTED),
    ("強調: #C4B07A", 11, MUTED),
    ("", 8, WHITE),
    ("【Step 2 — 姓名輸入】", 13, GOLD, True),
    ("TextInput 樣式:", 11, WHITE),
    ("  padding: 14", 11, MUTED),
    ("  borderRadius: 12", 11, MUTED),
    ("  bg: rgba(gold,0.06)", 11, MUTED),
    ("  border: rgba(gold,0.15)", 11, MUTED),
    ("  color: #E8C547", 11, MUTED),
    ("  fontSize: 16", 11, MUTED),
    ("  maxLength: 20", 11, MUTED),
    ("", 6, WHITE),
    ("按鈕: 名字空時 disabled", 11, MUTED),
])

ascii_slide("06. Onboarding Step 3 — 出生資料", """
┌──────────────────────────────┐
│                              │
│       輸入出生資料            │  ← MaShanZheng 28pt
│                              │
│  曆法: [  國曆  ] [  農曆  ]  │  ← 二選一切換
│         (active)  (inactive)  │
│                              │
│  ┌──年──┐ ┌──月──┐ ┌──日──┐  │
│  │      │ │      │ │      │  │  ← WheelPicker x3
│  │ 1992 │ │  6   │ │  15  │  │    year w80 / month w60
│  │      │ │      │ │      │  │    / day w60
│  └──────┘ └──────┘ └──────┘  │    ITEM_HEIGHT: 44
│                              │    5 visible items
│  時辰:                        │
│  ┌──┐┌──┐┌──┐┌──┐┌──┐┌──┐   │  ← 水平 ScrollView
│  │子││丑││寅││卯││辰││巳│   │    12 個時辰按鈕
│  └──┘└──┘└──┘└──┘└──┘└──┘   │
│  ┌──┐┌──┐┌──┐┌──┐┌──┐┌──┐   │    每個顯示:
│  │午││未││申││酉││戌││亥│   │    name + hours text
│  └──┘└──┘└──┘└──┘└──┘└──┘   │
│        [ 不知道 ]             │  ← 預設午時(11點)
│                              │
│  性別: [ ♂ 男 ]  [ ♀ 女 ]    │  ← emoji 18pt
│                              │
│  [ 返回 ]    [ 召喚靈寵 ]     │
└──────────────────────────────┘""", [
    ("【曆法切換】", 13, GOLD, True),
    ("Active: bg rgba(gold,0.12)", 11, MUTED),
    ("  border rgba(gold,0.4)", 11, MUTED),
    ("  text #E8C547 fontWeight 600", 11, MUTED),
    ("Inactive: bg rgba(gold,0.04)", 11, MUTED),
    ("  text #8B7D5E", 11, MUTED),
    ("", 6, WHITE),
    ("【WheelPicker 規格】", 13, GOLD, True),
    ("ITEM_HEIGHT: 44px", 11, MUTED),
    ("VISIBLE_ITEMS: 5", 11, MUTED),
    ("snapToInterval: 44", 11, MUTED),
    ("年: 1930-2026 (預設1992)", 11, MUTED),
    ("月: 1-12, 日: 動態(含閏年)", 11, MUTED),
    ("", 6, WHITE),
    ("【提交邏輯】", 13, GOLD, True),
    ("1. setOnboarding()", 11, MUTED),
    ("   → 計算八字", 11, MUTED),
    ("   → 計算紫微斗數", 11, MUTED),
    ("   → 計算西洋占星", 11, MUTED),
    ("2. initPet(month, day)", 11, MUTED),
    ("   → 匹配節氣靈寵", 11, MUTED),
])

ascii_slide("06. Onboarding Step 4 — 靈寵召喚結果", """
┌──────────────────────────────┐
│          🦋                  │  ← 靈寵 emoji 80pt
│       靈寵降臨！              │  ← MaShanZheng 32pt gold
│    衡翼蝶 與你結緣            │  ← 16pt #64B4FF bold
│                              │
│  ┌─ 紫微命盤 ──────────────┐  │  ← bg rgba(purple,0.04)
│  │ 命宮：紫微               │  │    border rgba(purple,0.1)
│  │ 性格：領導氣質           │  │    主星 15pt #A78BFA bold
│  └──────────────────────────┘  │    性格 10pt #B0A0C8
│                              │
│  ┌─ 西洋占星 ──────────────┐  │  ← bg rgba(blue,0.04)
│  │   ♎  天秤座              │  │    border rgba(blue,0.1)
│  │   五行：金 | 守護：金星   │  │    emoji 36pt
│  └──────────────────────────┘  │    名稱 16pt #64B4FF bold
│                              │
│  Lv1 💬 基本對話             │  ← 等級解鎖列表
│  Lv3 🔔 運勢提醒  Lv5 👔 穿搭│    flex-row wrap
│  Lv8 🧭 方位導航  Lv10✨進化 │
│                              │
│  ┌──────────────────────────┐  │
│  │ Free 每日1次 | Member 5次│  │  ← 3 色徽章
│  │ Supreme 無限             │  │
│  └──────────────────────────┘  │
│                              │
│  ┌──────────────────────────┐  │
│  │       進入靈犀            │  │
│  └──────────────────────────┘  │
└──────────────────────────────┘""", [
    ("【Plan 徽章色彩】", 13, GOLD, True),
    ("Free:    #8B7D5E", 11, MUTED),
    ("  bg rgba(255,255,255,0.05)", 11, MUTED),
    ("Member:  #E8C547", 11, GOLD),
    ("  bg rgba(gold,0.1)", 11, MUTED),
    ("Supreme: #A78BFA", 11, PURPLE),
    ("  bg rgba(purple,0.1)", 11, MUTED),
    ("徽章寬度: 52, borderRadius: 6", 11, MUTED),
    ("", 8, WHITE),
    ("【等級解鎖系統】", 13, GOLD, True),
    ("Lv.1  💬 基本對話", 11, MUTED),
    ("Lv.3  🔔 運勢提醒", 11, MUTED),
    ("Lv.5  👔 穿搭建議", 11, MUTED),
    ("Lv.8  🧭 方位導航", 11, MUTED),
    ("Lv.10 ✨ 第一次進化", 11, MUTED),
    ("Lv.15    深度解讀", 11, MUTED),
    ("Lv.20    第二次進化", 11, MUTED),
    ("Lv.25    預測功能", 11, MUTED),
    ("Lv.30    終極進化", 11, MUTED),
])

# ══════════════ 第三部分：主畫面 ══════════════

section_title("第三部分：主畫面元件", "Tab 佈局 · Pet Screen · Avatar · Chat · ActionBar")

# 07. Tab Layout
two_col_slide("07. Tab 導航佈局 — _layout.tsx", [
    ("【Tab Bar 樣式】", 14, GOLD, True),
    ("backgroundColor: rgba(8,8,15,0.98)", 11, MUTED),
    ("borderTopColor: rgba(gold,0.06)", 11, MUTED),
    ("borderTopWidth: 1", 11, MUTED),
    ("height: 80, paddingBottom: 20", 11, MUTED),
    ("tabBarShowLabel: false", 11, MUTED),
    ("initialRouteName: 'pet'", 11, MUTED),
    ("", 8, WHITE),
    ("【Tab 1: 靈寵 — CenterPetIcon】", 14, GOLD, True),
    ("emoji: 🔮 (fontSize 22)", 11, WHITE),
    ("圓形容器: 44x44, borderRadius 22", 11, MUTED),
    ("Focused: bg rgba(gold,0.15)", 11, MUTED),
    ("  border rgba(gold,0.3)", 11, MUTED),
    ("Unfocused: bg rgba(gold,0.06)", 11, MUTED),
    ("  border rgba(gold,0.1)", 11, MUTED),
    ("label: fontSize 9, serif, marginTop 2", 11, MUTED),
], [
    ("【Tab 2: 我的 — TabIcon】", 14, GOLD, True),
    ("emoji: ⚙️ (fontSize 20)", 11, WHITE),
    ("paddingTop: 8", 11, MUTED),
    ("Focused: emoji opacity 1", 11, MUTED),
    ("  label color: #E8C547", 11, MUTED),
    ("  金色小圓點指示器:", 11, MUTED),
    ("    4x4, borderRadius 2", 11, MUTED),
    ("    bg #E8C547", 11, MUTED),
    ("    shadow: #E8C547, radius 4", 11, MUTED),
    ("    opacity 0.8", 11, MUTED),
    ("Unfocused: emoji opacity 0.35", 11, MUTED),
    ("  label color: #5A5040", 11, MUTED),
    ("", 8, WHITE),
    ("label: fontSize 9", 11, MUTED),
    ("font: NotoSerifTC_400Regular", 11, MUTED),
    ("numberOfLines: 1", 11, MUTED),
])

# 08. Pet Screen
ascii_slide("08. 靈寵主畫面 — Pet Screen", """
┌──────────────────────────────────┐
│ StatusBar  paddingTop:54         │
│ 靈犀    3月3日·午時   Lv.1 青芽鹿·木系│
│─────────────────────────────────│
│                                  │
│            PetAvatar             │
│        ┌────────────┐            │
│        │  🦌 (浮動)  │           │
│        └────────────┘            │
│     青芽鹿 Lv.1 · 木系           │
│     ═══════╌╌╌  45/100          │
│     ★★★★★  進化階段 1/5         │
│                                  │
│──────────────────────────────────│
│  PetChat (FlatList, flex:1)      │
│  ┌───────────────────────────┐   │
│  │ 🦌 青芽鹿           14:02│   │
│  │ ┌─────────────────────┐   │   │
│  │ │ 主人好～今天木氣旺盛 │   │   │
│  │ │ 財運 ████████░ 82   │   │   │
│  │ │ 🧭 東南  🎨 綠      │   │   │
│  │ └─────────────────────┘   │   │
│  └───────────────────────────┘   │
│──────────────────────────────────│
│ ActionBar (2 rows × 3 buttons)   │
│ [🍖餵食+50][🎾玩耍+30][🧘冥想+20]│
│ [👁 靈眼 ] [🌍 靈心 ] [🏮 靈魂 ] │
└──────────────────────────────────┘""", [
    ("【StatusBar 細節】", 13, GOLD, True),
    ("左: 靈犀 MaShanZheng 18pt gold", 11, MUTED),
    ("中: 日期+時辰 11pt #6B6350", 11, MUTED),
    ("右: Lv+名+系 11pt #8B7D5E", 11, MUTED),
    ("bg: rgba(8,8,15,0.98)", 11, MUTED),
    ("bottomBorder: rgba(gold,0.06)", 11, MUTED),
    ("", 6, WHITE),
    ("【每日運勢自動生成】", 13, GOLD, True),
    ("mount 時觸發 useEffect", 11, MUTED),
    ("防重複: fortuneGenRef", 11, MUTED),
    ("時段: morning/afternoon/evening", 11, MUTED),
    ("calculateUnifiedFortune()", 11, MUTED),
    ("→ generateLocalPetNarration()", 11, MUTED),
    ("→ addMessage(type:'fortune')", 11, MUTED),
    ("", 6, WHITE),
    ("【Overlay Modals】", 13, GOLD, True),
    ("PetEyeMode (靈眼)", 11, MUTED),
    ("PetHeartMode (靈心)", 11, MUTED),
    ("PetPearlMode (靈魂)", 11, MUTED),
    ("UpgradeModal (升級)", 11, MUTED),
])

# 09. PetAvatar
two_col_slide("09. PetAvatar 元件", [
    ("【浮動 Emoji 動畫】", 14, GOLD, True),
    ("容器: 64x64, borderRadius 32", 11, MUTED),
    ("  bg: rgba(gold,0.06)", 11, MUTED),
    ("  border: rgba(gold,0.15)", 11, MUTED),
    ("Emoji: fontSize 36", 11, MUTED),
    ("", 4, WHITE),
    ("動畫: Animated.loop(sequence(", 11, GOLD_DIM),
    ("  translateY: 0 → -6  (1500ms)", 11, MUTED),
    ("  easing: Easing.inOut(sin)", 11, MUTED),
    ("  translateY: -6 → 0  (1500ms)", 11, MUTED),
    ("))", 11, GOLD_DIM),
    ("", 8, WHITE),
    ("【資訊列】", 14, GOLD, True),
    ("靈寵名: 14pt #E8C547 bold", 11, MUTED),
    ("等級: 12pt #C4B07A, format 'Lv.N'", 11, MUTED),
    ("五行系: 10pt #6B6350", 11, MUTED),
    ("  bg rgba(gold,0.08), radius 6", 11, MUTED),
    ("  element為空時隱藏", 11, MUTED),
], [
    ("【EXP 進度條】", 14, GOLD, True),
    ("寬度: 70%", 11, MUTED),
    ("軌道: height 4, bg rgba(gold,0.1)", 11, MUTED),
    ("填充: #E8C547", 11, MUTED),
    ("文字: 'exp/expToNext'", 11, MUTED),
    ("  fontSize 9, #5A5040, width 50", 11, MUTED),
    ("", 8, WHITE),
    ("【進化星級】", 14, GOLD, True),
    ("5 顆 ★ (fontSize 12)", 11, MUTED),
    ("已達成: color #E8C547", 11, MUTED),
    ("未達成: opacity 0.15", 11, MUTED),
    ("", 8, WHITE),
    ("進化標籤: '進化階段 N/5'", 12, MUTED),
    ("  fontSize 9, #5A5040", 11, MUTED),
    ("", 8, WHITE),
    ("【資料來源】", 14, GOLD, True),
    ("petStore: emoji, name, level,", 11, MUTED),
    ("  exp, expToNext, evolution, element", 11, MUTED),
])

# 10. PetChat
two_col_slide("10. PetChat 聊天列表", [
    ("【元件結構】", 14, GOLD, True),
    ("FlatList, flex: 1", 11, MUTED),
    ("資料: chatStore.messages", 11, MUTED),
    ("每條訊息渲染為 PetBubble", 11, MUTED),
    ("", 6, WHITE),
    ("【日期分隔線】", 14, GOLD, True),
    ("水平線: rgba(255,255,255,0.04)", 11, MUTED),
    ("日期文字: 'M/D(weekday)'", 11, MUTED),
    ("  fontSize 10, #5A5040", 11, MUTED),
    ("  letterSpacing 1", 11, MUTED),
    ("不同日期的訊息間自動插入", 11, MUTED),
    ("", 6, WHITE),
    ("【Loading 指示器】", 14, GOLD, True),
    ("Row: petEmoji (16pt)", 11, MUTED),
    ("  + ActivityIndicator (small, gold)", 11, MUTED),
    ("  + '...' (14pt #6B6350)", 11, MUTED),
], [
    ("【自動捲動】", 14, GOLD, True),
    ("新訊息到達:", 11, WHITE),
    ("  setTimeout 100ms →", 11, MUTED),
    ("  scrollToEnd({animated: true})", 11, MUTED),
    ("", 4, WHITE),
    ("contentSizeChange:", 11, WHITE),
    ("  也會觸發 scrollToEnd", 11, MUTED),
    ("", 8, WHITE),
    ("【listItems 建構邏輯】", 14, GOLD, True),
    ("1. 遍歷 messages[]", 11, MUTED),
    ("2. 比較前後訊息日期", 11, MUTED),
    ("3. 日期不同 → 插入 separator", 11, MUTED),
    ("4. separator.id = 'sep-' + date", 11, MUTED),
    ("5. 觸發依據: messages.length", 11, MUTED),
    ("", 8, WHITE),
    ("【訊息上限】", 14, GOLD, True),
    ("最多保留 200 條訊息", 11, MUTED),
])

# 11. PetBubble
content_slide("11. PetBubble 聊天氣泡 — 結構與類型", [
    ("【基礎結構】", 14, GOLD, True),
    ("Header: petEmoji(16pt) + petName(11pt #6B6350 serif) + time 'HH:MM'(10pt #5A5040)", 11, MUTED),
    ("Bubble: padding 14, borderRadius 16 (topLeft 4 → 對話泡效果)", 11, MUTED),
    ("  bg: rgba(gold,0.04), border: rgba(gold,0.1)", 11, MUTED),
    ("  text: 14pt #C4B07A serif, lineHeight 22", 11, MUTED),
    ("  classicQuote: marginTop 8, 12pt #6B6350, italic", 11, MUTED),
    ("", 6, WHITE),
    ("【依訊息類型渲染不同嵌入 UI】", 14, GOLD, True),
    ("", 3, WHITE),
    ("fortune  → 5 ScoreBars (財運/桃花/事業/健康/學業) + 幸運方位/色彩/數字", 11, BLUE),
    ("face     → 5 ScoreBars (天庭/眉/眼/鼻/口) + 幸運物品卡", 11, BLUE),
    ("fengshui → CompassGrid 3x3 宮格 (吉方金色高亮) + 吉凶方位列表", 11, GREEN),
    ("divination → HexagramBlock (symbol 40pt + name 16pt + oracle 引號)", 11, PURPLE),
    ("feed/play/meditate → ExpBadge '+N EXP' (bg rgba(gold,0.12), text gold bold)", 11, GOLD_DIM),
    ("levelup  → CelebrationBadge ⬆️ 'Lv.N' (bg gold)", 11, GOLD_DIM),
    ("evolve   → CelebrationBadge 🌟 '進化階段 N' (bg purple rgba(160,100,255,0.15))", 11, PURPLE),
    ("", 6, WHITE),
    ("【ScoreBar 色彩規則】", 14, GOLD, True),
    ("label width 30, score width 24 (bold), desc width 56", 11, MUTED),
    ("分數 >= 80: #E8C547 (金色)", 11, GOLD),
    ("分數 >= 60: #C4B07A (次金)", 11, GOLD_DIM),
    ("分數 < 60:  #8B7D5E (柔和)", 11, MUTED),
    ("track height 4, bg rgba(gold,0.1)", 11, MUTED),
])

# 12. ActionBar
two_col_slide("12. ActionBar — 六大動作按鈕", [
    ("【容器】", 14, GOLD, True),
    ("paddingHorizontal: 12", 11, MUTED),
    ("paddingVertical: 8", 11, MUTED),
    ("兩行，每行 3 個等寬按鈕", 11, MUTED),
    ("", 6, WHITE),
    ("【Row 1: 養成 — 金色調】", 14, GOLD, True),
    ("bg: rgba(gold,0.06)", 11, MUTED),
    ("border: rgba(gold,0.1)", 11, MUTED),
    ("borderRadius: 12, paddingVertical: 8", 11, MUTED),
    ("", 4, WHITE),
    ("🍖 餵食  +50 EXP  (靈力 +10)", 12, GOLD_DIM),
    ("🎾 玩耍  +30 EXP  (親密度 +15)", 12, GOLD_DIM),
    ("🧘 冥想  +20 EXP  (悟性+10 靈力+5)", 12, GOLD_DIM),
], [
    ("【Row 2: 功能 — 藍色調】", 14, BLUE, True),
    ("bg: rgba(blue,0.05)", 11, MUTED),
    ("border: rgba(blue,0.1)", 11, MUTED),
    ("borderRadius: 12", 11, MUTED),
    ("", 4, WHITE),
    ("👁 靈眼  → 面相分析 (開啟相機)", 12, BLUE),
    ("🌍 靈心  → 風水分析 (GPS+羅盤)", 12, BLUE),
    ("🏮 靈魂  → 六十四卦占卜", 12, BLUE),
    ("", 8, WHITE),
    ("【共通樣式】", 14, GOLD, True),
    ("emoji: fontSize 18", 11, MUTED),
    ("label: fontSize 10, serif, #C4B07A", 11, MUTED),
    ("EXP: fontSize 9, #5A5040", 11, MUTED),
    ("Pressed: opacity 0.6", 11, MUTED),
    ("全局 disabled 屬性", 11, MUTED),
    ("", 6, WHITE),
    ("【觸發邏輯】", 14, GOLD, True),
    ("→ pet.tsx handleAction(key)", 11, MUTED),
])

# ══════════════ 第四部分：三大功能 ══════════════

section_title("第四部分：三大功能", "靈眼（面相）· 靈心（風水）· 靈魂（占卜）")

# 13-15. PetEyeMode
ascii_slide("13. 靈眼 Phase: idle — 相機拍照", """
┌──────────────────────────────┐
│                        [✕]   │  ← 36x36 circle
│                              │    rgba(255,255,255,0.08)
│  ┌────────────────────────┐  │
│  │                        │  │  ← CameraView
│  │     ┌──────────┐      │  │    height: 320
│  │     │          │      │  │    borderRadius: 20
│  │     │    👤    │      │  │    facing: 'front'
│  │     │          │      │  │
│  │     └──────────┘      │  │  ← 人臉框
│  │     (虛線, 160x200)    │  │    borderRadius 80
│  │                        │  │    dashed border
│  └────────────────────────┘  │    rgba(gold,0.3)
│                              │    emoji 48pt, opacity 0.3
│  ┌────────────────────────┐  │
│  │ 🦌  靈寵正在觀察你...   │  │  ← petHintCard
│  └────────────────────────┘  │    bg rgba(blue,0.06)
│                              │    border rgba(blue,0.1)
│  ┌────────────────────────┐  │
│  │   👁  開始面相分析      │  │  ← 主按鈕
│  └────────────────────────┘  │    bg rgba(gold,0.12)
│                              │    border rgba(gold,0.3)
│  ⚠ 照片僅用於分析，不會上傳  │    borderRadius 16
│                              │    padding 18
└──────────────────────────────┘""", [
    ("【Camera 設定】", 13, GOLD, True),
    ("expo-camera CameraView", 11, MUTED),
    ("facing: 'front' (前置)", 11, MUTED),
    ("height: 320, borderRadius: 20", 11, MUTED),
    ("", 4, WHITE),
    ("Web 平台降級:", 11, RED),
    ("  顯示佔位圖 (無相機)", 11, MUTED),
    ("", 6, WHITE),
    ("【無權限 Fallback】", 13, GOLD, True),
    ("height: 280, 同樣人臉框", 11, MUTED),
    ("'需要相機權限' 文字", 11, MUTED),
    ("'授權相機' 按鈕", 11, MUTED),
    ("→ requestPermission()", 11, MUTED),
    ("", 6, WHITE),
    ("【拍照參數】", 13, GOLD, True),
    ("takePictureAsync({", 11, MUTED),
    ("  base64: true,", 11, MUTED),
    ("  quality: 0.7", 11, MUTED),
    ("})", 11, MUTED),
    ("", 6, WHITE),
    ("【注意文字】", 13, GOLD, True),
    ("11pt #5A5040 italic, centered", 11, MUTED),
])

ascii_slide("14. 靈眼 Phase: analyzing — 分析中", """
┌──────────────────────────────┐
│                              │
│                              │
│       ┌──────────────┐       │
│       │              │       │  ← scanFrame
│       │     🧑       │       │    180x220, radius 90
│       │              │       │    border rgba(gold,0.3)
│       │   ●  ●  ●   │       │    emoji 64pt
│       │  ●       ●  │       │
│       │      ●      │       │  ← detectionDots (>40%)
│       │         ●   │       │    7 dots, 6x6, #E8C547
│       └──────────────┘       │    fadeIn animation
│                              │
│  ┌────────────────────────┐  │
│  │ 🦌 正在觀察你的面相...  │  │  ← petNarrateBox
│  └────────────────────────┘  │    bg rgba(blue,0.06)
│                              │
│            72%               │  ← MaShanZheng 28pt gold
│                              │
│       定位五官特徵            │  ← 14pt #8B7D5E
│                              │    letterSpacing 2
│  ═══════════════╌╌╌╌╌╌╌    │  ← progress bar
│                              │    width 80%, height 4
│                              │    bg rgba(gold,0.1)
│                              │    fill #E8C547
└──────────────────────────────┘""", [
    ("【進度模擬】", 13, GOLD, True),
    ("每 100ms +3%, 最高 90%", 11, MUTED),
    ("API 回傳後跳至 100%", 11, MUTED),
    ("", 6, WHITE),
    ("【狀態文字 (依進度)】", 13, GOLD, True),
    ("<30%: 掃描面部輪廓", 11, MUTED),
    ("<50%: 定位五官特徵", 11, MUTED),
    ("<80%: 分析面相格局", 11, MUTED),
    ("≥80%: 生成面相報告", 11, MUTED),
    ("", 6, WHITE),
    ("【API 呼叫】", 13, GOLD, True),
    ("analyzeFace(base64Image)", 11, MUTED),
    ("→ POST /ai/face-reading", 11, MUTED),
    ("→ Claude Vision 分析", 11, MUTED),
    ("", 6, WHITE),
    ("【額度消耗】", 13, GOLD, True),
    ("useFeature('eye', petLevel)", 11, MUTED),
    ("額度不足 → onQuotaExhausted()", 11, MUTED),
    ("→ 顯示 UpgradeModal", 11, MUTED),
    ("", 6, WHITE),
    ("【完成後】", 13, GOLD, True),
    ("onResult(text, data)", 11, MUTED),
    ("300ms 後自動關閉 Modal", 11, MUTED),
])

ascii_slide("15. 靈眼 Phase: result — 分析結果", """
┌──────────────────────────────┐
│                        [✕]   │
│                              │
│          大 吉               │  ← MaShanZheng 46pt gold
│                              │    textShadow radius 30
│      ⭐ ⭐ ⭐ ⭐ ☆          │  ← 5 stars, score/20
│                              │    filled=16pt, 16pt each
│  ┌─ 靈寵解讀 ─────────────┐  │
│  │ 🦌 主人的天庭飽滿，     │  │  ← petReadingCard
│  │ 印堂明亮，乃大貴之相...  │  │    bg rgba(blue,0.06)
│  └────────────────────────┘  │    border rgba(blue,0.12)
│                              │    text 14pt #A0B8D0
│  ┌─ 五官分析 ─────────────┐  │    lineHeight 24
│  │ 天庭  ████████░  85 飽滿│  │
│  │ 眉    ██████░░░  72 秀逸│  │  ← ScoreBars x5
│  │ 眼    █████████  90 明亮│  │    label w32, score w24
│  │ 鼻    ██████░░░  68 端正│  │    desc w56
│  │ 口    ███████░░  78 方正│  │    bar color by score
│  └────────────────────────┘  │
│                              │
│  ┌─ 幸運物品 ─────────────┐  │  ← luckyItem card
│  │  [🧿]  黑曜石手鏈       │  │    bg rgba(blue,0.04)
│  │  提升氣場穩定度         │  │    icon 60x60, radius 14
│  │  🧭 東方  🔢 8          │  │    name 16pt blue bold
│  └────────────────────────┘  │    desc 12pt
│                              │
│  ┌────────────────────────┐  │
│  │     重新分析            │  │  ← outline button
│  └────────────────────────┘  │
└──────────────────────────────┘""", [
    ("【運勢等級】", 13, GOLD, True),
    ("MaShanZheng 46pt", 11, MUTED),
    ("color: #E8C547", 11, MUTED),
    ("textShadow:", 11, MUTED),
    ("  rgba(gold,0.3), radius 30", 11, MUTED),
    ("", 6, WHITE),
    ("【星級計算】", 13, GOLD, True),
    ("stars = Math.round(score/20)", 11, MUTED),
    ("score: 0-100", 11, MUTED),
    ("", 6, WHITE),
    ("【五官分數條】", 13, GOLD, True),
    ("天庭(forehead)", 11, MUTED),
    ("眉(eyebrows)", 11, MUTED),
    ("眼(eyes)", 11, MUTED),
    ("鼻(nose)", 11, MUTED),
    ("口(mouth)", 11, MUTED),
    ("", 4, WHITE),
    (">=85: gold", 11, GOLD),
    (">=70: secondary", 11, GOLD_DIM),
    ("<70:  muted", 11, MUTED),
    ("", 6, WHITE),
    ("【幸運物品】", 13, GOLD, True),
    ("icon: 60x60, radius 14", 11, MUTED),
    ("name: 16pt #64B4FF bold", 11, BLUE),
    ("desc: 12pt", 11, MUTED),
    ("meta: 🧭方位 + 🔢數字", 11, MUTED),
])

# 16-17. PetHeartMode
ascii_slide("16. 靈心 — GPS 風水分析 (上半)", """
┌──────────────────────────────┐
│                        [✕]   │
│                              │
│  ┌── GPS ──────────────────┐ │  ← GPS 卡片
│  │ ● GPS 訊號正常          │ │    bg rgba(green,0.06)
│  │ 25.034°N 121.564°E      │ │    border rgba(green,0.12)
│  │               台北市信義區│ │    綠點: 8x8 #64C880
│  └──────────────────────────┘ │    座標: 10pt #5A5040
│                              │    地名: 11pt #8B7D5E
│  ┌────────────────────────┐  │
│  │ 🦌  正在感應此地的靈氣  │  │  ← petSensingCard
│  └────────────────────────┘  │    bg rgba(blue,0.06)
│                              │
│         ┌───────────┐        │  ← Compass
│         │    北      │        │    180x180 container
│         │  西  ▲  東 │        │    ring: 170x170
│         │    南      │        │    border 2 rgba(gold,0.2)
│         └───────────┘        │    rotate: -heading deg
│   午時 · 奇門時盤 · 182°      │
│                              │
│  ┌────────┐  ┌────────────┐  │
│  │ 吉方    │  │ 凶方       │  │  ← Direction Summary
│  │ 東南 西 │  │ 西北 東北  │  │    吉: 15pt gold bold
│  └────────┘  └────────────┘  │    凶: 15pt red bold
│                              │
│  ┌────────────────────────┐  │
│  │  🧭  分析此地風水       │  │  ← analyze button
│  └────────────────────────┘  │    bg rgba(green,0.08)
│                              │    border rgba(green,0.2)
└──────────────────────────────┘""", [
    ("【感測器】", 13, GOLD, True),
    ("GPS: expo-location", 11, MUTED),
    ("  Accuracy.Balanced", 11, MUTED),
    ("  reverseGeocodeAsync()", 11, MUTED),
    ("", 4, WHITE),
    ("Magnetometer: expo-sensors", 11, MUTED),
    ("  200ms 更新間隔", 11, MUTED),
    ("  計算方位角 (heading)", 11, MUTED),
    ("  Web平台: 跳過(無Magnetometer)", 11, RED),
    ("", 6, WHITE),
    ("【羅盤細節】", 13, GOLD, True),
    ("8方位標籤 (三角函數定位)", 11, MUTED),
    ("  radius: 65, fontSize分吉凶", 11, MUTED),
    ("吉方: 13pt #E8C547 bold + ●", 11, GOLD),
    ("凶方: 同 fontSize, #C44040", 11, RED),
    ("普通: 11pt #6B6350 fontWeight 600", 11, MUTED),
    ("", 4, WHITE),
    ("指針: 3x50 radius 2 #E8C547", 11, MUTED),
    ("中心點: 10x10 #E8C547", 11, MUTED),
    ("", 6, WHITE),
    ("【奇門盤資料】", 13, GOLD, True),
    ("generateQimenChart(now)", 11, MUTED),
    ("吉門(開休生景)→吉方", 11, MUTED),
    ("凶門(死傷驚杜)→凶方", 11, MUTED),
])

content_slide("17. 靈心 — 分析結果區域", [
    ("【AI 呼叫】", 14, GOLD, True),
    ("useFeature('heart', petLevel) 消耗額度", 11, MUTED),
    ("analyzeFengShui() → POST /ai/feng-shui", 11, MUTED),
    ("回傳: location_analysis, tips[], seat_advice", 11, MUTED),
    ("onResult() → 聊天氣泡 (type:'fengshui', data: compass grid)", 11, MUTED),
    ("300ms 後自動關閉", 11, MUTED),
    ("", 6, WHITE),
    ("【結果卡片 — 靈寵解讀】", 14, GOLD, True),
    ("petReadingCard: bg rgba(blue,0.06), border rgba(blue,0.12), borderRadius 16", 11, MUTED),
    ("AI 回傳的 location_analysis 文字, 14pt #A0B8D0, lineHeight 24", 11, MUTED),
    ("", 6, WHITE),
    ("【風水建議卡片】", 14, GOLD, True),
    ("bg rgba(gold,0.03), border rgba(gold,0.08)", 11, MUTED),
    ("每條 tip: icon(16pt) + text(13pt #C4B07A lineHeight 20)", 11, MUTED),
    ("", 6, WHITE),
    ("【座位建議卡片】", 14, GOLD, True),
    ("同藍色卡片樣式", 11, MUTED),
    ("seat_advice 文字", 11, MUTED),
    ("", 6, WHITE),
    ("【底部備註】", 14, GOLD, True),
    ("italic, centered, 小字", 11, MUTED),
])

# 18-20. PetPearlMode
ascii_slide("18. 靈魂 Phase: idle — 選擇問事", """
┌──────────────────────────────┐
│                        [✕]   │
│                              │
│  ┌────────────────────────┐  │
│  │ 🦌  主人有什麼想問...   │  │  ← petHintCard
│  └────────────────────────┘  │    bg rgba(blue,0.06)
│                              │
│  ┌──────┐ ┌──────┐ ┌──────┐ │  ← 5 categories
│  │  💼  │ │  ❤️  │ │  🏠  │ │    flex-row wrap
│  │ 事業 │ │ 感情 │ │ 家庭 │ │    minWidth 90
│  └──────┘ └──────┘ └──────┘ │    paddingVertical 14
│      ┌──────┐ ┌──────┐      │    borderRadius 14
│      │  🏥  │ │  📚  │      │
│      │ 健康 │ │ 學業 │      │    Active:
│      └──────┘ └──────┘      │    bg rgba(gold,0.12)
│                              │    border rgba(gold,0.4)
│  輸入問題 (選填)              │    label gold, bold
│  ┌────────────────────────┐  │
│  │ 我今年適合換工作嗎？     │  │    Inactive:
│  │                        │  │    bg rgba(gold,0.04)
│  └────────────────────────┘  │    border rgba(gold,0.1)
│  maxLength: 100, multiline   │    label #8B7D5E
│                              │
│  ┌────────────────────────┐  │  ← emoji fontSize 22
│  │  🏮     起卦問靈        │  │
│  └────────────────────────┘  │  ← 主按鈕
│  (未選類別時 disabled 0.3)    │    🏮 28pt + text 18pt
│                              │    bold, letterSpacing 4
└──────────────────────────────┘""", [
    ("【五大問事類別】", 13, GOLD, True),
    ("career 事業 💼", 11, MUTED),
    ("love   感情 ❤️", 11, MUTED),
    ("family 家庭 🏠", 11, MUTED),
    ("health 健康 🏥", 11, MUTED),
    ("study  學業 📚", 11, MUTED),
    ("", 6, WHITE),
    ("【問題輸入框】", 13, GOLD, True),
    ("TextInput multiline", 11, MUTED),
    ("maxLength: 100", 11, MUTED),
    ("minHeight: 50", 11, MUTED),
    ("placeholder: #5A5040", 11, MUTED),
    ("選填，不填也可起卦", 11, MUTED),
    ("", 6, WHITE),
    ("【啟動條件】", 13, GOLD, True),
    ("必須選擇類別", 11, MUTED),
    ("未選: 按鈕 opacity 0.3", 11, MUTED),
    ("已選: 正常顯示", 11, MUTED),
])

two_col_slide("19. 靈魂 Phase: shaking — 搖卦動畫", [
    ("【視覺元素】", 14, GOLD, True),
    ("", 4, WHITE),
    ("八卦符號:", 12, WHITE, True),
    ("  ☰☷☳☴☵☲☶☱", 14, GOLD),
    ("  fontSize 28, #E8C547", 11, MUTED),
    ("  letterSpacing 8", 11, MUTED),
    ("  opacity 0.6", 11, MUTED),
    ("", 6, WHITE),
    ("搖卦文字:", 12, WHITE, True),
    ("  '卦象凝聚中...'", 12, GOLD_DIM),
    ("  fontSize 16, #C4B07A, serif", 11, MUTED),
    ("", 6, WHITE),
    ("靈寵通靈:", 12, WHITE, True),
    ("  petEmoji + 通靈文字", 11, MUTED),
    ("  bg rgba(blue,0.06)", 11, MUTED),
], [
    ("【震動回饋】", 14, GOLD, True),
    ("Vibration.vibrate([", 11, MUTED),
    ("  0, 80, 60, 80, 60, 80, 60, 150", 11, GOLD_DIM),
    ("])", 11, MUTED),
    ("", 4, WHITE),
    ("Web 平台: 跳過 (Platform guard)", 11, RED),
    ("", 8, WHITE),
    ("【時間控制】", 14, GOLD, True),
    ("setTimeout 1500ms", 11, MUTED),
    ("→ 切換至 result phase", 11, MUTED),
    ("", 8, WHITE),
    ("【占卜引擎】", 14, GOLD, True),
    ("performHexagramDivination(", 11, MUTED),
    ("  category, question", 11, MUTED),
    (")", 11, MUTED),
    ("→ 隨機本卦 + 變爻 + 變卦", 11, MUTED),
    ("→ 依類別取得解讀", 11, MUTED),
])

ascii_slide("20. 靈魂 Phase: result — 占卜結果", """
┌──────────────────────────────┐
│         ䷀                   │  ← Unicode 卦象 64pt
│    第1卦 · 乾                │  ← 20pt gold bold
│                              │    letterSpacing 4
│  ┌────────────────────────┐  │
│  │    「元亨利貞」         │  │  ← oracle 18pt gold
│  └────────────────────────┘  │    letterSpacing 4
│                              │    bg rgba(gold,0.06)
│  天行健，君子以自強不息      │  ← mystical 14pt #8B7D5E
│                              │    italic, lineHeight 22
│  ┌── 問事解讀 ─────────────┐ │
│  │ 💼 事業         [大宜]  │ │  ← verdict badge
│  │                         │ │    色彩: getHexagramColor()
│  │ 天道運行不息，此卦       │ │  ← guidance 15pt #C4B07A
│  │ 示意進取之機...          │ │    lineHeight 24
│  │                         │ │
│  │ 七日內宜行動             │ │  ← timing 12pt #6B6350
│  └──────────────────────────┘ │
│                              │
│  ┌上卦┐ ┌下卦┐ ┌五行┐ ┌運勢┐ │  ← 4 info items
│  │ 乾 │ │ 乾 │ │ 金 │ │大吉│ │    label 9pt #6B6350
│  └───┘ └───┘ └───┘ └───┘ │    value 14pt #C4B07A bold
│                              │    運勢: dynamic color
│  ── 變卦 ──                  │
│  ┌──────────────────────┐    │  ← bg rgba(purple,0.04)
│  │  ䷁  坤              │    │    border rgba(purple,0.12)
│  │  地勢坤，君子以厚德...│    │    symbol 40pt
│  │  變爻：第1、3爻       │    │    name 16pt #A78BFA bold
│  └──────────────────────┘    │
│                              │
│  [🔗 分享]    [🏮 再卜一卦]  │  ← 2 action buttons
└──────────────────────────────┘""", [
    ("【Verdict 色彩】", 13, GOLD, True),
    ("大宜: 金色 (gold)", 11, GOLD),
    ("宜:   淡金 (gold dim)", 11, GOLD_DIM),
    ("中:   灰色 (muted)", 11, MUTED),
    ("不宜: 橙色", 11, RGBColor(0xFF,0xA0,0x40)),
    ("大忌: 紅色 (danger)", 11, RED),
    ("", 6, WHITE),
    ("【變卦卡片】", 13, GOLD, True),
    ("bg rgba(purple,0.04)", 11, MUTED),
    ("border rgba(purple,0.12)", 11, MUTED),
    ("symbol: 40pt", 11, MUTED),
    ("name: 16pt #A78BFA bold", 11, PURPLE),
    ("  letterSpacing 3", 11, MUTED),
    ("oracle: 13pt #B0A0C8", 11, MUTED),
    ("changing lines: 11pt", 11, MUTED),
    ("", 6, WHITE),
    ("【動作按鈕】", 13, GOLD, True),
    ("分享: bg rgba(gold,0.06)", 11, MUTED),
    ("  border rgba(gold,0.12)", 11, MUTED),
    ("  text #C4B07A", 11, MUTED),
    ("再卜: bg rgba(gold,0.12)", 11, MUTED),
    ("  border rgba(gold,0.25)", 11, MUTED),
    ("  text #E8C547 bold", 11, GOLD),
])

# ══════════════ 第五部分：輔助元件 ══════════════

section_title("第五部分：輔助元件", "UpgradeModal · Profile · Language · WheelPicker · ErrorBoundary")

# 21. UpgradeModal
ascii_slide("21. UpgradeModal — 升級方案彈窗", """
┌─────── overlay rgba(0,0,0,0.7) ───────┐
│                                        │
│   ┌──────────────────────────────┐     │
│   │                              │     │  ← width 85%
│   │  🐉  主人，今天次數用完了... │     │    padding 24
│   │  升級之後靈寵可以為你做      │     │    borderRadius 20
│   │  更多事喔！                  │     │    bg #0D0D15
│   │                              │     │    border rgba(gold,0.15)
│   │  ┌── ⭐ 靈犀會員 ────────┐  │     │
│   │  │                $390/月 │  │     │  ← 金色系卡片
│   │  │  · 靈眼/靈心/靈魂     │  │     │    bg rgba(gold,0.06)
│   │  │    5次/日              │  │     │    border rgba(gold,0.15)
│   │  │  · 靈寵上限 Lv.20     │  │     │    radius 14
│   │  │  · AI 深度解讀 Sonnet  │  │     │
│   │  │  ┌──────────────────┐ │  │     │    features: 12pt #6B6350
│   │  │  │    立即升級       │ │  │     │    lineHeight 20
│   │  │  └──────────────────┘ │  │     │
│   │  └────────────────────────┘  │     │    btn: bg rgba(gold,0.12)
│   │                              │     │         text #E8C547
│   │  ┌── 👑 靈犀至尊 ────────┐  │     │
│   │  │              $1,990/月 │  │     │  ← 紫色系卡片
│   │  │  · 全功能無限使用      │  │     │    bg rgba(purple,0.06)
│   │  │  · 靈寵等級無上限      │  │     │    border rgba(purple,0.15)
│   │  │  · 專屬進化 + 皮膚     │  │     │
│   │  │  ┌──────────────────┐ │  │     │    btn: bg rgba(purple,0.12)
│   │  │  │    立即升級       │ │  │     │         text #A78BFA
│   │  │  └──────────────────┘ │  │     │
│   │  └────────────────────────┘  │     │
│   │                              │     │
│   │         明天再來             │     │  ← 14pt #5A5040
│   │                              │     │    paddingVertical 14
│   └──────────────────────────────┘     │
│                                        │
└────────────────────────────────────────┘""", [
    ("【購買流程】", 13, GOLD, True),
    ("1. 點擊方案卡片", 11, MUTED),
    ("2. purchasePlan(planId)", 11, MUTED),
    ("3. RevenueCat getOfferings()", 11, MUTED),
    ("4. 找到對應 package", 11, MUTED),
    ("5. purchasePackage()", 11, MUTED),
    ("6. 成功 → customerInfo", 11, MUTED),
    ("7. 映射 entitlement", 11, MUTED),
    ("   → PlanType", 11, MUTED),
    ("8. userStore.setPremium()", 11, MUTED),
    ("9. 關閉 Modal", 11, MUTED),
    ("", 6, WHITE),
    ("【Plan IDs】", 13, GOLD, True),
    ("lingxi_member_monthly", 11, GOLD),
    ("lingxi_supreme_monthly", 11, PURPLE),
    ("", 6, WHITE),
    ("【Loading】", 13, GOLD, True),
    ("isPurchasing 狀態", 11, MUTED),
    ("ActivityIndicator 顯示", 11, MUTED),
    ("", 6, WHITE),
    ("【靈寵口吻】", 13, GOLD, True),
    ("用 petEmoji + petName", 11, MUTED),
    ("模擬靈寵說話勸購", 11, MUTED),
])

# 22. Profile
ascii_slide("22. Profile Screen — 我的設定", """
┌──────────────────────────────┐
│   我的                       │  ← MaShanZheng 28pt gold
│                              │    padding 20, paddingTop 62
│  ┌──────────────────────────┐│
│  │ 🦌   青芽鹿              ││  ← User Card
│  │      Lv.1 青芽鹿         ││    borderRadius 16
│  │      木系·立春     [FREE] ││    bg rgba(blue,0.06)
│  └──────────────────────────┘│    border rgba(blue,0.12)
│                              │
│  ┌──────────────────────────┐│
│  │ ⭐ 升級會員解鎖更多功能  ││  ← Free用戶限定
│  └──────────────────────────┘│    bg rgba(gold,0.08)
│                              │    border rgba(gold,0.2)
│  語言設定                    │
│  ┌──────────────────────────┐│
│  │ LanguageSelector         ││
│  └──────────────────────────┘│
│                              │
│  命盤資料                    │
│  ┌──────────────────────────┐│
│  │ 八字      甲子 乙丑...   ││  ← label 12pt #6B6350
│  │ 紫微主星  紫微            ││    value 13pt #C4B07A
│  │ 星座      天秤座          ││
│  │ 節氣靈寵  🦌 青芽鹿       ││
│  └──────────────────────────┘│
│                              │
│  其他                        │
│  ┌──────────────────────────┐│
│  │ 通知設定              ›  ││  ← 14pt #C4B07A
│  │ 隱私權政策            ›  ││    arrow ›  18pt #5A5040
│  │ 服務條款              ›  ││
│  │ 關於靈犀              ›  ││
│  │ 恢復購買              ›  ││
│  │ 登出                     ││  ← #C44040 紅色
│  └──────────────────────────┘│
└──────────────────────────────┘""", [
    ("【User Card 細節】", 13, GOLD, True),
    ("Pet emoji: fontSize 36", 11, MUTED),
    ("Name: 18pt #E8C547 bold", 11, MUTED),
    ("Subtitle: 11pt #6B6350", 11, MUTED),
    ("  'Lv.N Name · Element系 · SolarTerm'", 11, MUTED),
    ("", 4, WHITE),
    ("Plan badge:", 11, WHITE),
    ("  paddingV 4, paddingH 10", 11, MUTED),
    ("  borderRadius 10", 11, MUTED),
    ("  Normal: gold/rgba(gold,0.12)", 11, GOLD),
    ("  Supreme: purple/rgba(purple,0.12)", 11, PURPLE),
    ("", 6, WHITE),
    ("【Section 標籤】", 13, GOLD, True),
    ("fontSize 12, #8B7D5E", 11, MUTED),
    ("letterSpacing 2, serif", 11, MUTED),
    ("", 6, WHITE),
    ("【登出邏輯】", 13, GOLD, True),
    ("Alert 確認對話框", 11, MUTED),
    ("→ authStore.logout()", 11, MUTED),
    ("→ 清除 JWT Token", 11, MUTED),
    ("→ 導航回 /auth", 11, MUTED),
    ("", 6, WHITE),
    ("【恢復購買】", 13, GOLD, True),
    ("restorePurchases()", 11, MUTED),
    ("→ 更新 planType", 11, MUTED),
])

# 23-25 smaller components
two_col_slide("23-25. LanguageSelector · WheelPicker · ErrorBoundary", [
    ("【23. LanguageSelector】", 14, GOLD, True),
    ("Selector Button:", 12, WHITE),
    ("  flag(22pt) + label(15pt #C4B07A)", 11, MUTED),
    ("  + arrow ›(20pt #6B6350)", 11, MUTED),
    ("  bg rgba(gold,0.04), radius 12", 11, MUTED),
    ("", 4, WHITE),
    ("Modal (slide-up sheet):", 12, WHITE),
    ("  overlay: rgba(0,0,0,0.7)", 11, MUTED),
    ("  bg #12121A, topRadius 20", 11, MUTED),
    ("  maxHeight 70%", 11, MUTED),
    ("  header: title 18pt + ✕ close 20pt", 11, MUTED),
    ("  6 language rows:", 11, MUTED),
    ("    flag(26pt) + name(16pt)", 11, MUTED),
    ("    active: gold bg, bold, ✓", 11, MUTED),
    ("    row separator: rgba(w,0.03)", 11, MUTED),
], [
    ("【24. WheelPicker】", 14, GOLD, True),
    ("ITEM_HEIGHT: 44", 11, MUTED),
    ("VISIBLE_ITEMS: 5", 11, MUTED),
    ("PICKER_HEIGHT: 220 (44×5)", 11, MUTED),
    ("snapToInterval: 44", 11, MUTED),
    ("deceleration: 'fast'", 11, MUTED),
    ("Selection: gold 25% top/bottom border", 11, MUTED),
    ("  bg rgba(gold,0.06) at position 2", 11, MUTED),
    ("Selected: 18pt #E8C547 fontWeight 600", 11, MUTED),
    ("Adjacent: 16pt #8B7D5E", 11, MUTED),
    ("Far: 14pt #5A5040 opacity 0.5", 11, MUTED),
    ("", 8, WHITE),
    ("【25. ErrorBoundary】", 14, GOLD, True),
    ("Class component", 11, MUTED),
    ("🔮 fontSize 48", 11, MUTED),
    ("Title: 20pt #E8C547 bold", 11, MUTED),
    ("'靈犀遇到了意外狀況'", 11, MUTED),
    ("Retry: padding 12/32, radius 12", 11, MUTED),
    ("  bg rgba(gold,0.12), text gold", 11, MUTED),
])

# ══════════════ 第六部分：資料與系統 ══════════════

section_title("第六部分：資料架構與系統", "狀態管理 · 訂閱方案 · 節氣靈寵 · i18n")

# 26. State Management
two_col_slide("26. Zustand 狀態管理 — 4 個 Store", [
    ("【auth-store】", 14, GOLD, True),
    ("isAuthenticated: boolean", 11, MUTED),
    ("isLoading: boolean", 11, MUTED),
    ("user: {id, email, name, planType}", 11, MUTED),
    ("error: string | null", 11, MUTED),
    ("Actions: login, register,", 11, MUTED),
    ("  loginWithApple, logout, checkAuth", 11, MUTED),
    ("持久化: isAuthenticated + user", 11, GOLD_DIM),
    ("", 8, WHITE),
    ("【user-store】", 14, GOLD, True),
    ("userName, birthYear/Month/Day/Hour", 11, MUTED),
    ("calendarType, gender", 11, MUTED),
    ("bazi, ziwei, astrology (命理資料)", 11, MUTED),
    ("isPremium, planType", 11, MUTED),
    ("dailyUsage: {heart, eye, soul}", 11, MUTED),
    ("lastUsageDate: string", 11, MUTED),
    ("Actions: setOnboarding, setPremium,", 11, MUTED),
    ("  useFeature, getRemainingUses", 11, MUTED),
], [
    ("【pet-store】", 14, GOLD, True),
    ("petId, name, creature, element", 11, MUTED),
    ("solarTerm, season, zodiac", 11, MUTED),
    ("personality, emoji", 11, MUTED),
    ("level, exp, expToNext, evolution", 11, MUTED),
    ("power, affinity, wisdom, mood", 11, MUTED),
    ("Actions: initPet, feed, play,", 11, MUTED),
    ("  meditate, addExp, canLevelUp", 11, MUTED),
    ("", 4, WHITE),
    ("EXP 公式: 每級 ×1.3 遞增", 11, GOLD_DIM),
    ("初始: 100, Lv2: 130, Lv3: 169...", 11, MUTED),
    ("", 8, WHITE),
    ("【chat-store】", 14, GOLD, True),
    ("messages: ChatMessage[] (max 200)", 11, MUTED),
    ("ChatMessage: {", 11, MUTED),
    ("  id, time, type, text,", 11, MUTED),
    ("  classicQuote?, data?", 11, MUTED),
    ("}", 11, MUTED),
    ("Actions: addMessage,", 11, MUTED),
    ("  clearOldMessages, getMessagesByDate", 11, MUTED),
    ("所有 Store: Zustand + AsyncStorage", 11, GOLD_DIM),
])

# 27. Subscription
content_slide("27. 訂閱方案對照表", [
    ("", 4, WHITE),
    ("                Free          Member ⭐         Supreme 👑", 14, WHITE, True),
    ("", 4, WHITE),
    ("月費            $0            $390/月            $1,990/月", 12, GOLD_DIM),
    ("Plan ID         free          lingxi_member      lingxi_supreme", 12, MUTED),
    ("每功能/日       1 次           5 次               999 次 (無限)", 12, GOLD_DIM),
    ("等級上限        Lv.10          Lv.20              無上限", 12, GOLD_DIM),
    ("進化上限        1 階           2 階               5 階", 12, GOLD_DIM),
    ("AI 模型         基礎模板       Claude Haiku       Claude Sonnet", 12, GOLD_DIM),
    ("", 8, WHITE),
    ("【靈寵等級加成】", 14, GOLD, True),
    ("Lv.10+ → 每日額外 +1 次", 12, MUTED),
    ("Lv.20+ → 每日額外 +2 次", 12, MUTED),
    ("(至尊版不適用 — 本身已是無限)", 12, MUTED),
    ("", 8, WHITE),
    ("【觸發升級的時機】", 14, GOLD, True),
    ("• 養成動作達到等級上限 (canLevelUp() = false)", 12, MUTED),
    ("• 功能使用次數耗盡 (getRemainingUses() = 0)", 12, MUTED),
    ("• Profile 頁面的升級 CTA (Free 用戶)", 12, MUTED),
])

# 28. 24 Solar Term Pets
two_col_slide("28. 二十四節氣靈寵系統", [
    ("【春季 6 隻】", 14, GREEN, True),
    ("立春  🦌 青芽鹿  木", 12, MUTED),
    ("雨水  🐸 潤澤蛙  水", 12, MUTED),
    ("驚蟄  🐲 雷蟲龍  木", 12, MUTED),
    ("春分  🦋 衡翼蝶  木", 12, MUTED),
    ("清明  🦢 清風鶴  木", 12, MUTED),
    ("穀雨  🐰 穀靈兔  土", 12, MUTED),
    ("", 6, WHITE),
    ("【夏季 6 隻】", 14, RGBColor(0xFF,0x6B,0x6B), True),
    ("立夏  🪲 炎蟬精  火", 12, MUTED),
    ("小滿  🦊 金穗狐  火", 12, MUTED),
    ("芒種  🐦 芒鳳雀  火", 12, MUTED),
    ("夏至  🦁 日輪獅  火", 12, MUTED),
    ("小暑  ✨ 螢火靈  火", 12, MUTED),
    ("大暑  🦅 烈陽鷹  土", 12, MUTED),
], [
    ("【秋季 6 隻】", 14, RGBColor(0xE8,0xE0,0xC0), True),
    ("立秋  🐯 金風虎  金", 12, MUTED),
    ("處暑  🪲 涼蟬仙  金", 12, MUTED),
    ("白露  🐍 露珠蛇  金", 12, MUTED),
    ("秋分  🦢 月衡鶴  金", 12, MUTED),
    ("寒露  🐱 霜菊貓  水", 12, MUTED),
    ("霜降  🐺 霜狼靈  水", 12, MUTED),
    ("", 6, WHITE),
    ("【冬季 6 隻】", 14, BLUE, True),
    ("立冬  🐻 冬眠熊  水", 12, MUTED),
    ("小雪  🐇 雪兔仙  水", 12, MUTED),
    ("大雪  🦉 雪鴞靈  水", 12, MUTED),
    ("冬至  🐉 玄冰龍  水", 12, MUTED),
    ("小寒  🐋 寒星鯨  水", 12, MUTED),
    ("大寒  🔥 極光鳳  土", 12, MUTED),
    ("", 6, WHITE),
    ("每隻靈寵有獨特個性描述", 12, GOLD_DIM),
    ("影響對話語氣和敘事風格", 12, GOLD_DIM),
])

# 29. i18n
two_col_slide("29. i18n 多語言系統", [
    ("【基本資訊】", 14, GOLD, True),
    ("框架: react-i18next 16", 11, MUTED),
    ("每 locale: 351 個翻譯鍵", 11, MUTED),
    ("Fallback: English (en)", 11, MUTED),
    ("偵測: 自動偵測系統語言", 11, MUTED),
    ("", 6, WHITE),
    ("【翻譯命名空間】", 14, GOLD, True),
    ("app       應用程式名稱/標語", 11, MUTED),
    ("auth      登入/註冊表單", 11, MUTED),
    ("onboarding 引導流程", 11, MUTED),
    ("tabs      Tab 標籤", 11, MUTED),
    ("pet       靈寵相關", 11, MUTED),
    ("actionBar 動作列標籤", 11, MUTED),
    ("chat      聊天回應", 11, MUTED),
    ("eye/heart/pearl 三大功能", 11, MUTED),
    ("home      運勢維度名稱", 11, MUTED),
    ("profile   個人設定", 11, MUTED),
    ("subscription/upgrade 訂閱", 11, MUTED),
    ("ziwei/astrology 命理", 11, MUTED),
    ("directions 八方位", 11, MUTED),
    ("petUnlock 等級解鎖", 11, MUTED),
    ("common    通用文字", 11, MUTED),
], [
    ("【靈寵多語言稱呼】", 14, GOLD, True),
    ("zh-TW: 主人  (親切可愛)", 11, MUTED),
    ("zh-CN: 主人  (亲切可爱)", 11, MUTED),
    ("ja:   ご主人様 (親しみやすく)", 11, MUTED),
    ("en:   Master (warm, playful)", 11, MUTED),
    ("de:   Meister (warm, verspielt)", 11, MUTED),
    ("fr:   Maître (chaleureux)", 11, MUTED),
    ("", 8, WHITE),
    ("【五行性格對語氣影響】", 14, GOLD, True),
    ("水系靈寵 → 溫柔語氣", 11, BLUE),
    ("火系靈寵 → 熱情語氣", 11, RGBColor(0xFF,0x6B,0x6B)),
    ("木系靈寵 → 溫和語氣", 11, GREEN),
    ("金系靈寵 → 敏銳語氣", 11, RGBColor(0xE8,0xE0,0xC0)),
    ("土系靈寵 → 穩重語氣", 11, RGBColor(0xC8,0xA0,0x60)),
    ("", 8, WHITE),
    ("【語言切換觸發點】", 14, GOLD, True),
    ("1. Onboarding Step 0", 11, MUTED),
    ("2. Profile → LanguageSelector", 11, MUTED),
    ("切換後全 UI 即時更新", 11, GOLD_DIM),
])

# 30. Emoji Map
content_slide("30. 完整 Emoji 使用地圖", [
    ("【Tab / 導航】", 14, GOLD, True),
    ("🔮 Tab bar (靈寵)  |  ⚙️ Tab bar (設定)  |  🌐 語言選擇  |  🐉 歡迎/預設", 11, MUTED),
    ("", 4, WHITE),
    ("【ActionBar】", 14, GOLD, True),
    ("🍖 餵食  |  🎾 玩耍  |  🧘 冥想  |  👁 靈眼  |  🌍 靈心  |  🏮 靈魂", 11, MUTED),
    ("", 4, WHITE),
    ("【靈眼】", 14, GOLD, True),
    ("👤 人臉框佔位  |  🧑 掃描中  |  ⭐ 星級  |  🧭 方位  |  🔢 數字  |  🎨 色彩", 11, MUTED),
    ("", 4, WHITE),
    ("【靈心】", 14, GOLD, True),
    ("● 方位標記  |  🧭 分析按鈕/方位  |  🔄 Loading", 11, MUTED),
    ("", 4, WHITE),
    ("【靈魂】", 14, GOLD, True),
    ("💼 事業 | ❤️ 感情 | 🏠 家庭 | 🏥 健康 | 📚 學業 | ☰☷☳☴☵☲☶☱ 八卦 | ❓ 問題回顯", 11, MUTED),
    ("", 4, WHITE),
    ("【系統】", 14, GOLD, True),
    ("⬆️ 升級  |  🌟 進化  |  ⭐ 會員  |  👑 至尊  |  ✓ 選中  |  ✕ 關閉  |  ♂♀ 性別", 11, MUTED),
    ("", 4, WHITE),
    ("【Onboarding 等級解鎖】", 14, GOLD, True),
    ("💬 Lv1 基本對話  |  🔔 Lv3 運勢提醒  |  👔 Lv5 穿搭建議  |  🧭 Lv8 方位  |  ✨ Lv10 進化", 11, MUTED),
])

# ─── 結尾 ───
slide = title_slide("完整 UI 拆解結束", "共 30+ 頁，涵蓋所有畫面、元件、互動細節")
add_text(slide, 0, 5.0, 13.333, 0.5, "靈犀 LingXi  |  2026-03-03  |  基於程式碼分析", size=12, color=DARKEST, align=PP_ALIGN.CENTER)

# ── 儲存 ──
out = os.path.join(os.path.dirname(__file__), 'LingXi_UI_Breakdown.pptx')
prs.save(out)
print(f"PPTX generated: {out}")
print(f"Total slides: {len(prs.slides)}")
