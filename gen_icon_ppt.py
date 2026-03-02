"""
將 ICON_SPEC.md 轉成 PPT 簡報
靈犀 App — Icon 美工規格書
"""

from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
import os

# ── 色彩定義 ──
GOLD = RGBColor(0xE8, 0xC5, 0x47)
DARK_BG = RGBColor(0x08, 0x08, 0x0F)
DARK_CARD = RGBColor(0x14, 0x14, 0x1E)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
LIGHT_GOLD = RGBColor(0xF5, 0xE6, 0x9A)
DIM_TEXT = RGBColor(0x88, 0x80, 0x70)
BLUE_ACCENT = RGBColor(0x64, 0xB4, 0xFF)
PURPLE = RGBColor(0xA7, 0x8B, 0xFA)
GREEN = RGBColor(0x64, 0xC8, 0x78)
RED = RGBColor(0xC4, 0x40, 0x40)
ORANGE = RGBColor(0xE8, 0x9C, 0x47)
FIRE_RED = RGBColor(0xFF, 0x57, 0x22)
EARTH_YELLOW = RGBColor(0xFF, 0xC1, 0x07)
METAL_SILVER = RGBColor(0xB0, 0xBE, 0xC5)
WATER_BLUE = RGBColor(0x21, 0x96, 0xF3)
WOOD_GREEN = RGBColor(0x4C, 0xAF, 0x50)
BRIGHT_GOLD = RGBColor(0xFF, 0xD7, 0x00)

prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)


def set_slide_bg(slide, color=DARK_BG):
    bg = slide.background
    fill = bg.fill
    fill.solid()
    fill.fore_color.rgb = color


def add_textbox(slide, left, top, width, height, text, font_size=14,
                color=WHITE, bold=False, align=PP_ALIGN.LEFT,
                font_name="Microsoft JhengHei"):
    txBox = slide.shapes.add_textbox(
        Inches(left), Inches(top), Inches(width), Inches(height))
    tf = txBox.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = text
    p.font.size = Pt(font_size)
    p.font.color.rgb = color
    p.font.bold = bold
    p.font.name = font_name
    p.alignment = align
    return txBox


def add_rect(slide, left, top, width, height,
             fill_color=DARK_CARD, border_color=None):
    shape = slide.shapes.add_shape(
        1, Inches(left), Inches(top), Inches(width), Inches(height))
    shape.fill.solid()
    shape.fill.fore_color.rgb = fill_color
    if border_color:
        shape.line.color.rgb = border_color
        shape.line.width = Pt(1)
    else:
        shape.line.fill.background()
    return shape


def add_multi_text(slide, left, top, width, height, lines,
                   default_size=13, default_color=WHITE):
    txBox = slide.shapes.add_textbox(
        Inches(left), Inches(top), Inches(width), Inches(height))
    tf = txBox.text_frame
    tf.word_wrap = True
    for i, item in enumerate(lines):
        text = item[0]
        size = item[1] if len(item) > 1 else default_size
        color = item[2] if len(item) > 2 else default_color
        bold = item[3] if len(item) > 3 else False
        align = item[4] if len(item) > 4 else PP_ALIGN.LEFT
        if i == 0:
            p = tf.paragraphs[0]
        else:
            p = tf.add_paragraph()
        p.text = text
        p.font.size = Pt(size)
        p.font.color.rgb = color
        p.font.bold = bold
        p.font.name = "Microsoft JhengHei"
        p.alignment = align
        p.space_before = Pt(2)
        p.space_after = Pt(2)
    return txBox


def add_code_block(slide, left, top, width, height, text, font_size=10):
    txBox = slide.shapes.add_textbox(
        Inches(left), Inches(top), Inches(width), Inches(height))
    tf = txBox.text_frame
    tf.word_wrap = True
    fill = txBox.fill
    fill.solid()
    fill.fore_color.rgb = RGBColor(0x1A, 0x1A, 0x28)
    for i, line in enumerate(text.split("\n")):
        if i == 0:
            p = tf.paragraphs[0]
        else:
            p = tf.add_paragraph()
        p.text = line
        p.font.size = Pt(font_size)
        p.font.color.rgb = LIGHT_GOLD
        p.font.name = "Consolas"
        p.space_before = Pt(1)
        p.space_after = Pt(1)
    return txBox


def icon_card(slide, x, y, w, h, emoji, name, desc, border_color=GOLD, desc_color=DIM_TEXT):
    """畫一張 icon 卡片：emoji + 名稱 + 說明"""
    add_rect(slide, x, y, w, h, DARK_CARD, border_color)
    add_textbox(slide, x, y + 0.05, w, 0.5, emoji, 28, WHITE, False, PP_ALIGN.CENTER)
    add_textbox(slide, x + 0.05, y + 0.55, w - 0.1, 0.3, name, 11, border_color, True, PP_ALIGN.CENTER)
    add_textbox(slide, x + 0.05, y + 0.85, w - 0.1, 0.5, desc, 9, desc_color, False, PP_ALIGN.CENTER)


# ════════════════════════════════════════════════
# Slide 1: 封面
# ════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_bg(slide)
add_textbox(slide, 2, 1.2, 9, 1.0, "靈犀 LingXi", 54, GOLD, True, PP_ALIGN.CENTER)
add_textbox(slide, 2, 2.4, 9, 0.8, "🎨 Icon 美工規格書", 30, LIGHT_GOLD, False, PP_ALIGN.CENTER)
add_textbox(slide, 2, 3.5, 9, 0.6, "交給 AI 美工（Midjourney / DALL-E / Stable Diffusion）的完整指引", 16, WHITE, False, PP_ALIGN.CENTER)
add_textbox(slide, 2, 4.8, 9, 0.5, "合計 61 張圖標（不含 24 隻靈寵）", 18, ORANGE, True, PP_ALIGN.CENTER)

# 色票展示
color_data = [
    ("#E8C547", "主金色", GOLD),
    ("#08080F", "深黑底", WHITE),
    ("#F5E69A", "暖金", LIGHT_GOLD),
    ("#64B4FF", "靈藍", BLUE_ACCENT),
    ("#A78BFA", "靈紫", PURPLE),
    ("#64C878", "靈綠", GREEN),
]
for i, (hex_val, label, color) in enumerate(color_data):
    x = 2.5 + i * 1.4
    add_rect(slide, x, 5.8, 1.2, 0.6, color)
    add_textbox(slide, x, 5.82, 1.2, 0.3, hex_val, 9, DARK_BG if i < 3 else WHITE, True, PP_ALIGN.CENTER)
    add_textbox(slide, x, 6.12, 1.2, 0.25, label, 9, DARK_BG if i < 3 else WHITE, False, PP_ALIGN.CENTER)

add_textbox(slide, 2, 6.6, 9, 0.4, "風格：東方神秘感 · 低調奢華 · 金色光暈 · 古籍符文 + 現代極簡", 13, DIM_TEXT, False, PP_ALIGN.CENTER)

# ════════════════════════════════════════════════
# Slide 2: App Icon + Splash
# ════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_bg(slide)
add_textbox(slide, 0.5, 0.3, 8, 0.6, "一、App Icon + Splash Screen", 30, GOLD, True)

# App Icon
add_rect(slide, 0.5, 1.1, 6.0, 3.0, DARK_CARD, GOLD)
add_textbox(slide, 0.8, 1.2, 5.5, 0.4, "App Icon（應用程式圖標）", 16, GOLD, True)
add_textbox(slide, 0.8, 1.6, 5.5, 0.3, "assets/icons/app/", 11, DIM_TEXT)

# Icon 示意
add_rect(slide, 1.0, 2.0, 1.5, 1.5, RGBColor(0x0A, 0x0A, 0x12), GOLD)
add_textbox(slide, 1.0, 2.2, 1.5, 0.9, "🔮", 48, WHITE, False, PP_ALIGN.CENTER)
add_textbox(slide, 1.0, 3.1, 1.5, 0.3, "1024×1024", 9, DIM_TEXT, False, PP_ALIGN.CENTER)

add_multi_text(slide, 2.8, 2.0, 3.5, 1.8, [
    ("設計描述", 12, LIGHT_GOLD, True),
    ("深黑 #08080F 背景", 10, DIM_TEXT),
    ("中央：金色靈犀角/水晶球", 10, WHITE),
    ("散發金色光暈", 10, WHITE),
    ("周圍有微弱八卦紋路環繞", 10, WHITE),
    ("不要文字，純圖形", 10, RED),
    ("", 4),
    ("尺寸：1024/512/192/180/120/76", 10, DIM_TEXT),
    ("+ foreground.png（Android adaptive）", 10, DIM_TEXT),
])

# Splash
add_rect(slide, 0.5, 4.4, 6.0, 2.8, DARK_CARD, PURPLE)
add_textbox(slide, 0.8, 4.5, 5.5, 0.4, "Splash Screen（啟動畫面）", 16, PURPLE, True)
add_textbox(slide, 0.8, 4.9, 5.5, 0.3, "assets/icons/splash/", 11, DIM_TEXT)

# Splash 示意
add_rect(slide, 1.0, 5.3, 1.2, 1.5, RGBColor(0x0A, 0x0A, 0x12), PURPLE)
add_textbox(slide, 1.0, 5.5, 1.2, 0.5, "🔮", 28, GOLD, False, PP_ALIGN.CENTER)
add_textbox(slide, 1.0, 6.0, 1.2, 0.3, "靈犀", 14, GOLD, True, PP_ALIGN.CENTER)
add_textbox(slide, 1.0, 6.35, 1.2, 0.3, "1284×2778", 8, DIM_TEXT, False, PP_ALIGN.CENTER)

add_multi_text(slide, 2.5, 5.3, 3.8, 1.5, [
    ("設計描述", 12, LIGHT_GOLD, True),
    ("全屏深黑 #08080F 背景", 10, DIM_TEXT),
    ("中央：金色靈犀角 Logo", 10, WHITE),
    ("下方：「靈犀」毛筆書法（金色）", 10, WHITE),
    ("底部微弱金色粒子散佈效果", 10, WHITE),
    ("整體感覺：沉穩大氣、有儀式感", 10, ORANGE),
])

# 右側：檔案清單
add_rect(slide, 7.0, 1.1, 5.8, 6.1, DARK_CARD, RGBColor(0x33, 0x30, 0x28))
add_textbox(slide, 7.3, 1.2, 5.3, 0.4, "檔案清單", 16, GOLD, True)

files = [
    ("App Icon（7 張）", GOLD),
    ("  icon-1024.png    1024×1024  App Store/Play", DIM_TEXT),
    ("  icon-512.png     512×512    Android adaptive", DIM_TEXT),
    ("  icon-192.png     192×192    Android launcher", DIM_TEXT),
    ("  icon-180.png     180×180    iOS @3x", DIM_TEXT),
    ("  icon-120.png     120×120    iOS @2x", DIM_TEXT),
    ("  icon-76.png      76×76      iPad", DIM_TEXT),
    ("  icon-foreground   1024×1024  Android 前景", DIM_TEXT),
    ("", 6),
    ("Splash Screen（3 張）", PURPLE),
    ("  splash.png       1284×2778  iPhone 基準", DIM_TEXT),
    ("  splash-tablet     2048×2732  iPad Pro", DIM_TEXT),
    ("  splash-logo       512×512    置中 Logo", DIM_TEXT),
]
add_multi_text(slide, 7.3, 1.7, 5.3, 5.3, [
    (t, 10, c if isinstance(c, RGBColor) else WHITE) for t, c in files
])

# ════════════════════════════════════════════════
# Slide 3: Tab Bar
# ════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_bg(slide)
add_textbox(slide, 0.5, 0.3, 8, 0.6, "二、Tab Bar 圖標", 30, GOLD, True)
add_textbox(slide, 0.5, 0.85, 8, 0.3, "assets/icons/tab-bar/   |   4 張（2 組 × 未選中/選中）", 13, DIM_TEXT)

# Tab 卡片
tabs = [
    ("🔮", "tab-pet", "靈寵 Tab\n水晶球/靈犀角", "未選中", DIM_TEXT),
    ("🔮✨", "tab-pet-active", "靈寵 Tab（選中）\n金色發光版", "選中", GOLD),
    ("⚙️", "tab-profile", "我的 Tab\n齒輪/設定符號", "未選中", DIM_TEXT),
    ("⚙️✨", "tab-profile-active", "我的 Tab（選中）\n金色發光版", "選中", GOLD),
]
for i, (emoji, fname, desc, state, border) in enumerate(tabs):
    x = 0.8 + i * 3.1
    add_rect(slide, x, 1.5, 2.8, 2.5, DARK_CARD, border)
    add_textbox(slide, x, 1.6, 2.8, 0.6, emoji, 36, WHITE if "active" not in fname else GOLD, False, PP_ALIGN.CENTER)
    add_textbox(slide, x + 0.1, 2.25, 2.6, 0.3, fname + ".png", 10, LIGHT_GOLD, True, PP_ALIGN.CENTER)
    add_textbox(slide, x + 0.1, 2.6, 2.6, 0.6, desc, 10, DIM_TEXT, False, PP_ALIGN.CENTER)
    add_textbox(slide, x + 0.1, 3.4, 2.6, 0.3, state, 10, border, True, PP_ALIGN.CENTER)

# 規格
add_rect(slide, 0.5, 4.4, 12.3, 2.8, DARK_CARD, GOLD)
add_textbox(slide, 0.8, 4.5, 11.8, 0.4, "設計規格", 16, GOLD, True)
add_multi_text(slide, 0.8, 5.0, 5.5, 2.0, [
    ("尺寸", 13, LIGHT_GOLD, True),
    ("96×96 px（@3x 基準）", 12, WHITE),
    ("同時提供 64×64（@2x）、32×32（@1x）", 12, WHITE),
    ("", 6),
    ("背景", 13, LIGHT_GOLD, True),
    ("透明 PNG", 12, WHITE),
])
add_multi_text(slide, 7.0, 5.0, 5.5, 2.0, [
    ("配色", 13, LIGHT_GOLD, True),
    ("未選中：暗金半透明 #88807050", 12, DIM_TEXT),
    ("選中：金色 #E8C547 + 微光暈", 12, GOLD),
    ("", 6),
    ("風格", 13, LIGHT_GOLD, True),
    ("細線描邊，東方符文感", 12, WHITE),
])

# ════════════════════════════════════════════════
# Slide 4: Action Bar — 養成 + 能力
# ════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_bg(slide)
add_textbox(slide, 0.5, 0.3, 10, 0.6, "三、Action Bar 圖標（養成 + 靈寵能力）", 30, GOLD, True)

# 養成
add_textbox(slide, 0.5, 1.0, 6, 0.4, "養成互動  assets/icons/action-bar/nurture/", 13, DIM_TEXT)

nurture = [
    ("🍖", "feed.png", "餵食", "金色靈丹/仙果\n散發暖光", "+50 EXP", GOLD),
    ("🎾", "play.png", "玩耍", "發光靈珠/水晶球\n玩耍意象", "+30 EXP", GOLD),
    ("🧘", "meditate.png", "冥想", "蓮花/打坐剪影\n帶光環", "+20 EXP", GOLD),
]
for i, (emoji, fname, label, desc, exp, border) in enumerate(nurture):
    x = 0.5 + i * 4.2
    add_rect(slide, x, 1.4, 3.9, 2.5, DARK_CARD, border)
    add_textbox(slide, x, 1.5, 3.9, 0.5, emoji, 32, WHITE, False, PP_ALIGN.CENTER)
    add_textbox(slide, x + 0.1, 2.0, 3.7, 0.3, f"{fname}  —  {label}", 12, GOLD, True, PP_ALIGN.CENTER)
    add_textbox(slide, x + 0.1, 2.35, 3.7, 0.6, desc, 10, DIM_TEXT, False, PP_ALIGN.CENTER)
    add_textbox(slide, x + 0.1, 3.0, 3.7, 0.3, exp, 11, GREEN, True, PP_ALIGN.CENTER)

# 能力
add_textbox(slide, 0.5, 4.2, 6, 0.4, "靈寵能力  assets/icons/action-bar/ability/", 13, DIM_TEXT)

ability = [
    ("👁", "eye.png", "靈眼", "豎立天眼/靈眼\n瞳孔發藍光\n周圍面相五官紋路", BLUE_ACCENT),
    ("🌍", "heart.png", "靈心", "羅盤/指南針\n帶八卦底紋\n中心點發綠光", GREEN),
    ("🏮", "soul.png", "靈魂", "靈魂燈籠/古燈\n發紫光\n燈籠刻卦象線條", PURPLE),
]
for i, (emoji, fname, label, desc, border) in enumerate(ability):
    x = 0.5 + i * 4.2
    add_rect(slide, x, 4.6, 3.9, 2.6, DARK_CARD, border)
    add_textbox(slide, x, 4.7, 3.9, 0.5, emoji, 32, border, False, PP_ALIGN.CENTER)
    add_textbox(slide, x + 0.1, 5.2, 3.7, 0.3, f"{fname}  —  {label}", 12, border, True, PP_ALIGN.CENTER)
    add_textbox(slide, x + 0.1, 5.55, 3.7, 0.8, desc, 10, DIM_TEXT, False, PP_ALIGN.CENTER)

# 共通規格
add_rect(slide, 0.5, 3.95, 12.3, 0.25, RGBColor(0x1A, 0x1A, 0x28))
add_textbox(slide, 0.8, 3.96, 11.5, 0.22, "共通規格：128×128 px  |  透明背景  |  主體金色 #E8C547，各能力有專屬色系", 10, LIGHT_GOLD, False, PP_ALIGN.CENTER)

# ════════════════════════════════════════════════
# Slide 5: Onboarding 引導圖
# ════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_bg(slide)
add_textbox(slide, 0.5, 0.3, 8, 0.6, "四、Onboarding 引導圖", 30, GOLD, True)
add_textbox(slide, 0.5, 0.85, 8, 0.3, "assets/icons/onboarding/   |   5 張  |  512×512 px  |  透明背景", 13, DIM_TEXT)

onboarding = [
    ("🌐", "step0-language", "語言選擇", "地球儀+多語言符號\n（漢字/ABC/あ）\n金色調", GOLD),
    ("🔮", "step1-welcome", "歡迎畫面", "靈犀 Logo 大圖\n光暈粒子效果", PURPLE),
    ("✏️", "step2-name", "輸入姓名", "一支毛筆書寫\n東方感符號", GOLD),
    ("📅", "step3-birth", "出生資料", "星象盤/命盤輪盤\n天干地支刻度", BLUE_ACCENT),
    ("🦌", "step4-summon", "靈寵召喚", "金色光柱從天而降\n剪影靈獸降臨", ORANGE),
]
for i, (emoji, fname, label, desc, border) in enumerate(onboarding):
    x = 0.3 + i * 2.55
    add_rect(slide, x, 1.4, 2.35, 3.8, DARK_CARD, border)
    add_textbox(slide, x, 1.5, 2.35, 0.6, emoji, 40, WHITE, False, PP_ALIGN.CENTER)
    add_textbox(slide, x + 0.05, 2.15, 2.25, 0.3, label, 14, border, True, PP_ALIGN.CENTER)
    add_textbox(slide, x + 0.05, 2.5, 2.25, 0.3, fname + ".png", 9, DIM_TEXT, False, PP_ALIGN.CENTER)
    add_textbox(slide, x + 0.05, 2.9, 2.25, 1.8, desc, 10, WHITE, False, PP_ALIGN.CENTER)

# 箭頭
add_textbox(slide, 0.3, 5.5, 12.5, 0.5,
    "Step 0 ──→ Step 1 ──→ Step 2 ──→ Step 3 ──→ Step 4 ──→ 進入靈寵主畫面",
    14, LIGHT_GOLD, False, PP_ALIGN.CENTER)

# 設計提醒
add_rect(slide, 0.5, 6.1, 12.3, 1.1, DARK_CARD, ORANGE)
add_multi_text(slide, 0.8, 6.2, 11.8, 0.9, [
    ("設計提醒", 14, ORANGE, True),
    ("每張都是精緻插圖，金色主調，風格統一。Step 4 是最重要的一張 — 靈寵降臨的儀式感決定了使用者第一印象。", 12, WHITE),
])

# ════════════════════════════════════════════════
# Slide 6: Chat 對話類型標記
# ════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_bg(slide)
add_textbox(slide, 0.5, 0.3, 8, 0.6, "五、Chat 對話類型標記", 30, GOLD, True)
add_textbox(slide, 0.5, 0.85, 8, 0.3, "assets/icons/chat-types/   |   7 張  |  64×64 px  |  用於對話氣泡左上角", 13, DIM_TEXT)

chat_icons = [
    ("⭐", "fortune", "每日運勢", "五角星/命盤", GOLD),
    ("👔", "outfit", "穿搭建議", "衣架/布料", ORANGE),
    ("👁", "face", "面相結果", "臉部輪廓線", BLUE_ACCENT),
    ("🧭", "fengshui", "風水結果", "羅盤小圖", GREEN),
    ("☰", "divination", "占卜結果", "卦象符號", PURPLE),
    ("⬆️", "levelup", "升級通知", "上升箭頭+星", BRIGHT_GOLD),
    ("🦋", "evolve", "進化通知", "蛻變/展翅", GOLD),
]
for i, (emoji, fname, label, desc, border) in enumerate(chat_icons):
    x = 0.3 + i * 1.82
    add_rect(slide, x, 1.4, 1.65, 2.4, DARK_CARD, border)
    add_textbox(slide, x, 1.5, 1.65, 0.5, emoji, 28, border, False, PP_ALIGN.CENTER)
    add_textbox(slide, x + 0.02, 2.05, 1.61, 0.3, fname + ".png", 8, LIGHT_GOLD, False, PP_ALIGN.CENTER)
    add_textbox(slide, x + 0.02, 2.35, 1.61, 0.3, label, 11, border, True, PP_ALIGN.CENTER)
    add_textbox(slide, x + 0.02, 2.7, 1.61, 0.5, desc, 9, DIM_TEXT, False, PP_ALIGN.CENTER)

# 色彩對應表
add_rect(slide, 0.5, 4.2, 12.3, 1.3, DARK_CARD, GOLD)
add_textbox(slide, 0.8, 4.3, 11.8, 0.35, "各類型專屬色調", 14, GOLD, True)
colors_text = [
    ("fortune → #E8C547 金色", 11, GOLD),
    ("outfit → #E89C47 暖橙", 11, ORANGE),
    ("face → #64B4FF 靈藍", 11, BLUE_ACCENT),
    ("fengshui → #64C878 靈綠", 11, GREEN),
    ("divination → #A78BFA 靈紫", 11, PURPLE),
    ("levelup → #FFD700 亮金", 11, BRIGHT_GOLD),
    ("evolve → 彩虹漸層", 11, LIGHT_GOLD),
]
add_multi_text(slide, 0.8, 4.7, 12, 0.7, colors_text)

# 使用示意
add_rect(slide, 0.5, 5.7, 12.3, 1.5, DARK_CARD, BLUE_ACCENT)
add_textbox(slide, 0.8, 5.8, 11.8, 0.35, "使用位置示意", 14, BLUE_ACCENT, True)
add_rect(slide, 1.0, 6.25, 6.0, 0.8, RGBColor(0x1A, 0x1A, 0x28), RGBColor(0x33, 0x30, 0x28))
add_multi_text(slide, 1.1, 6.27, 5.8, 0.7, [
    ("⭐ 🦌 青芽鹿    08:00", 10, DIM_TEXT),
    ("主人早安～今日木氣旺盛，《滴天髓》云...", 10, LIGHT_GOLD),
])
add_textbox(slide, 7.5, 6.35, 5, 0.5, "← ⭐ 就是 fortune.png\n    顯示在對話氣泡左上角", 10, WHITE)

# ════════════════════════════════════════════════
# Slide 7: 升級 Modal + Profile 圖標
# ════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_bg(slide)
add_textbox(slide, 0.5, 0.3, 10, 0.6, "六、升級 Modal + Profile 設定頁圖標", 30, GOLD, True)

# 升級 Modal
add_textbox(slide, 0.5, 1.0, 6, 0.35, "升級 Modal  assets/icons/upgrade/   |   4 張  |  256×256 px", 12, DIM_TEXT)

upgrade_icons = [
    ("⭐", "member-badge", "會員徽章", "金色星章\n帶「靈」字", GOLD),
    ("👑", "supreme-badge", "至尊徽章", "紫金皇冠章\n漸層更華麗", PURPLE),
    ("⏳", "quota-empty", "額度用盡", "空沙漏/靈力瓶\n暗淡狀態", DIM_TEXT),
    ("🔒", "lock", "功能鎖定", "古風鎖\n金色鑰匙孔", ORANGE),
]
for i, (emoji, fname, label, desc, border) in enumerate(upgrade_icons):
    x = 0.5 + i * 3.15
    add_rect(slide, x, 1.4, 2.9, 2.0, DARK_CARD, border)
    add_textbox(slide, x, 1.45, 2.9, 0.5, emoji, 28, border, False, PP_ALIGN.CENTER)
    add_textbox(slide, x + 0.05, 1.95, 2.8, 0.25, fname + ".png", 9, LIGHT_GOLD, False, PP_ALIGN.CENTER)
    add_textbox(slide, x + 0.05, 2.2, 2.8, 0.25, label, 12, border, True, PP_ALIGN.CENTER)
    add_textbox(slide, x + 0.05, 2.5, 2.8, 0.6, desc, 9, DIM_TEXT, False, PP_ALIGN.CENTER)

# Profile
add_textbox(slide, 0.5, 3.7, 8, 0.35, "Profile 設定頁  assets/icons/profile/   |   8 張  |  64×64 px", 12, DIM_TEXT)

profile_icons = [
    ("🔔", "notification", "推播鈴鐺\n（古鐘風格）"),
    ("🛡️", "privacy", "盾牌/隱私"),
    ("📜", "terms", "書卷/合約\n（竹簡感）"),
    ("ℹ️", "about", "資訊 i"),
    ("🚪", "logout", "登出門"),
    ("👑", "subscription", "皇冠/星章"),
    ("☯️", "destiny", "命盤輪"),
    ("🌐", "language", "地球"),
]
for i, (emoji, fname, desc) in enumerate(profile_icons):
    x = 0.3 + i * 1.6
    add_rect(slide, x, 4.1, 1.45, 2.2, DARK_CARD, RGBColor(0x33, 0x30, 0x28))
    add_textbox(slide, x, 4.15, 1.45, 0.45, emoji, 24, WHITE, False, PP_ALIGN.CENTER)
    add_textbox(slide, x + 0.02, 4.6, 1.41, 0.25, fname, 8, LIGHT_GOLD, False, PP_ALIGN.CENTER)
    add_textbox(slide, x + 0.02, 4.9, 1.41, 0.9, desc, 8, DIM_TEXT, False, PP_ALIGN.CENTER)

# 設計提醒
add_rect(slide, 0.5, 6.5, 12.3, 0.8, DARK_CARD, GOLD)
add_multi_text(slide, 0.8, 6.55, 11.8, 0.6, [
    ("Profile 圖標設計要點：暗金 #888070 為主（低調）、細線描邊、東方符文感、每個都有古風韻味", 11, LIGHT_GOLD),
])

# ════════════════════════════════════════════════
# Slide 8: 狀態圖標 + 五行標記
# ════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_bg(slide)
add_textbox(slide, 0.5, 0.3, 8, 0.6, "七、狀態圖標 + 五行標記", 30, GOLD, True)
add_textbox(slide, 0.5, 0.85, 8, 0.3, "assets/icons/status/   |   9 張", 13, DIM_TEXT)

# EXP 進度條
add_rect(slide, 0.5, 1.3, 6.0, 1.8, DARK_CARD, GOLD)
add_textbox(slide, 0.8, 1.4, 5.5, 0.35, "EXP 進度條", 14, GOLD, True)

add_rect(slide, 1.0, 1.85, 4.0, 0.25, RGBColor(0x33, 0x30, 0x28))  # bg
add_rect(slide, 1.0, 1.85, 2.8, 0.25, GOLD)  # fill
add_textbox(slide, 5.1, 1.82, 1.5, 0.3, "240/500", 10, DIM_TEXT)

add_multi_text(slide, 0.8, 2.2, 5.5, 0.7, [
    ("exp-bar-fill.png — 金色漸層橫條，帶光澤感", 10, WHITE),
    ("exp-bar-bg.png — 深灰半透明底條", 10, DIM_TEXT),
    ("高度 24px，寬度可拉伸（9-patch）", 10, DIM_TEXT),
])

# 進化星星
add_rect(slide, 7.0, 1.3, 5.8, 1.8, DARK_CARD, BRIGHT_GOLD)
add_textbox(slide, 7.3, 1.4, 5.3, 0.35, "進化星星", 14, BRIGHT_GOLD, True)
add_textbox(slide, 7.3, 1.85, 5.3, 0.4, "★ ★ ★ ☆ ☆", 28, GOLD, False, PP_ALIGN.CENTER)
add_multi_text(slide, 7.3, 2.3, 5.3, 0.6, [
    ("star-filled.png — 金色五角星 + 光暈（48×48）", 10, WHITE),
    ("star-empty.png — 暗色描邊五角星（48×48）", 10, DIM_TEXT),
])

# 五行標記
add_textbox(slide, 0.5, 3.4, 8, 0.4, "五行標記  64×64 px  |  透明背景", 14, GOLD, True)

elements = [
    ("🌿", "element-wood", "木", "綠色 #4CAF50\n嫩芽/樹木符號", WOOD_GREEN),
    ("🔥", "element-fire", "火", "紅橙 #FF5722\n火焰符號", FIRE_RED),
    ("⛰️", "element-earth", "土", "土黃 #FFC107\n山形符號", EARTH_YELLOW),
    ("⚔️", "element-metal", "金", "銀白 #B0BEC5\n金屬/劍形符號", METAL_SILVER),
    ("💧", "element-water", "水", "靛藍 #2196F3\n水波符號", WATER_BLUE),
]
for i, (emoji, fname, label, desc, border) in enumerate(elements):
    x = 0.5 + i * 2.5
    add_rect(slide, x, 3.9, 2.3, 3.0, DARK_CARD, border)
    add_textbox(slide, x, 4.0, 2.3, 0.5, emoji, 36, border, False, PP_ALIGN.CENTER)
    add_textbox(slide, x + 0.05, 4.55, 2.2, 0.35, label, 20, border, True, PP_ALIGN.CENTER)
    add_textbox(slide, x + 0.05, 4.95, 2.2, 0.3, fname + ".png", 8, LIGHT_GOLD, False, PP_ALIGN.CENTER)
    add_textbox(slide, x + 0.05, 5.3, 2.2, 0.8, desc, 10, DIM_TEXT, False, PP_ALIGN.CENTER)

# ════════════════════════════════════════════════
# Slide 9: 其他/通用圖標
# ════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_bg(slide)
add_textbox(slide, 0.5, 0.3, 8, 0.6, "八、其他/通用圖標", 30, GOLD, True)
add_textbox(slide, 0.5, 0.85, 8, 0.3, "assets/icons/misc/   |   8 張", 13, DIM_TEXT)

misc_icons = [
    ("📤", "share", "分享", "對話分享按鈕\n64×64", GOLD),
    ("🔄", "retry", "重試", "再搖一卦\n64×64", GOLD),
    ("✕", "close", "關閉", "Modal 關閉\n64×64", DIM_TEXT),
    ("📷", "camera", "相機", "靈眼拍照\n128×128", BLUE_ACCENT),
    ("📍", "gps", "定位", "靈心 GPS\n128×128", GREEN),
    ("📳", "shake", "搖動", "靈魂搖卦\n128×128", PURPLE),
    ("「」", "quote-mark", "引號", "引經據典裝飾\n毛筆質感", ORANGE),
    ("〰️", "scroll-decor", "裝飾線", "書卷紋飾\n高32px可拉伸", GOLD),
]
for i, (emoji, fname, label, desc, border) in enumerate(misc_icons):
    x = 0.3 + i * 1.6
    add_rect(slide, x, 1.3, 1.45, 2.8, DARK_CARD, border)
    add_textbox(slide, x, 1.35, 1.45, 0.5, emoji, 24, border, False, PP_ALIGN.CENTER)
    add_textbox(slide, x + 0.02, 1.85, 1.41, 0.3, fname, 9, LIGHT_GOLD, True, PP_ALIGN.CENTER)
    add_textbox(slide, x + 0.02, 2.15, 1.41, 0.25, label, 11, border, True, PP_ALIGN.CENTER)
    add_textbox(slide, x + 0.02, 2.5, 1.41, 0.9, desc, 9, DIM_TEXT, False, PP_ALIGN.CENTER)

# 設計提醒
add_rect(slide, 0.5, 4.4, 12.3, 1.0, DARK_CARD, GOLD)
add_multi_text(slide, 0.8, 4.5, 11.8, 0.8, [
    ("設計提醒", 14, GOLD, True),
    ("所有通用圖標配色金色系 #E8C547，quote-mark 用古風書法引號帶毛筆質感，scroll-decor 是橫向書卷紋飾線條", 11, WHITE),
])

# ════════════════════════════════════════════════
# Slide 10: AI 生圖 Prompt + 交付格式 + 統計
# ════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_bg(slide)
add_textbox(slide, 0.5, 0.3, 10, 0.6, "九、AI 生圖 Prompt + 交付格式 + 總統計", 30, GOLD, True)

# 英文 Prompt
add_rect(slide, 0.5, 1.1, 6.0, 2.5, DARK_CARD, BLUE_ACCENT)
add_textbox(slide, 0.8, 1.2, 5.5, 0.35, "英文 Prompt 範本（Midjourney / DALL-E）", 13, BLUE_ACCENT, True)
prompt_en = """Icon design for a mystical Chinese
fortune-telling app.
Style: dark luxury, Eastern mysticism,
gold (#E8C547) on black (#08080F).
Gold glow effects, subtle aura,
fine line details.
[具體物件描述]
Transparent PNG background,
centered composition.
Clean vector-style icon,
high contrast, app-ready."""
add_code_block(slide, 0.8, 1.6, 5.5, 1.9, prompt_en, 9)

# 中文 Prompt
add_rect(slide, 0.5, 3.8, 6.0, 2.0, DARK_CARD, ORANGE)
add_textbox(slide, 0.8, 3.9, 5.5, 0.35, "中文 Prompt 範本（對照）", 13, ORANGE, True)
prompt_zh = """東方神秘風格 App 圖標設計。
主色金色 #E8C547，深黑背景 #08080F。
帶金色光暈、微光效果、精緻描邊。
[具體物件描述]
透明背景 PNG，置中構圖。
乾淨向量風格，高對比，
可直接用於 App。"""
add_code_block(slide, 0.8, 4.3, 5.5, 1.4, prompt_zh, 9)

# 交付格式
add_rect(slide, 6.8, 1.1, 6.0, 2.0, DARK_CARD, GOLD)
add_textbox(slide, 7.1, 1.2, 5.5, 0.35, "圖檔交付格式", 14, GOLD, True)
add_multi_text(slide, 7.1, 1.6, 5.5, 1.3, [
    ("格式：PNG（透明背景）", 12, WHITE),
    ("色彩：sRGB", 12, WHITE),
    ("解析度：依各規格表指定尺寸", 12, WHITE),
    ("命名：全小寫，連字號（tab-pet-active.png）", 12, WHITE),
    ("品質：無壓縮或極輕壓縮", 12, WHITE),
])

# 總統計
add_rect(slide, 6.8, 3.3, 6.0, 4.0, DARK_CARD, ORANGE)
add_textbox(slide, 7.1, 3.4, 5.5, 0.4, "總數量統計", 16, ORANGE, True)

stats = [
    ("App Icon", "7 張", GOLD),
    ("Splash Screen", "3 張", PURPLE),
    ("Tab Bar", "4 張", GOLD),
    ("Action Bar 養成", "3 張", GOLD),
    ("Action Bar 能力", "3 張", BLUE_ACCENT),
    ("Onboarding", "5 張", GOLD),
    ("Chat 類型標記", "7 張", GOLD),
    ("升級 Modal", "4 張", PURPLE),
    ("Profile 設定", "8 張", DIM_TEXT),
    ("狀態相關", "9 張", BRIGHT_GOLD),
    ("其他/通用", "8 張", DIM_TEXT),
]
for i, (label, count, color) in enumerate(stats):
    y = 3.85 + i * 0.26
    add_textbox(slide, 7.3, y, 3.5, 0.24, label, 10, color)
    add_textbox(slide, 10.8, y, 1.5, 0.24, count, 10, WHITE, True, PP_ALIGN.RIGHT)

add_rect(slide, 7.1, 6.75, 5.5, 0.35, ORANGE)
add_textbox(slide, 7.2, 6.76, 5.3, 0.32, "合計 61 張（不含 24 隻靈寵）", 13, DARK_BG, True, PP_ALIGN.CENTER)

# 資料夾結構
add_rect(slide, 0.5, 6.0, 6.0, 1.3, DARK_CARD, RGBColor(0x33, 0x30, 0x28))
folder_tree = """assets/icons/
├── app/      ├── chat-types/
├── splash/   ├── upgrade/
├── tab-bar/  ├── profile/
├── action-bar/  ├── status/
│   ├── nurture/ └── misc/
│   └── ability/
└── onboarding/"""
add_code_block(slide, 0.7, 6.05, 5.6, 1.2, folder_tree, 9)

# ════════════════════════════════════════════════
# 儲存
# ════════════════════════════════════════════════
out_dir = r"G:\共用雲端硬碟\有泉科技有限公司\內部開發\APP\算命系統\LingXi"
out_path = os.path.join(out_dir, "LingXi_Icon_Spec.pptx")
prs.save(out_path)
print(f"PPT saved: {out_path}")
