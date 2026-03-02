"""
將 UI_FLOW.md 轉成 PPT 簡報
靈犀 App — 2 Tab 靈寵對話式 UI
"""

from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
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

prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)

def set_slide_bg(slide, color=DARK_BG):
    bg = slide.background
    fill = bg.fill
    fill.solid()
    fill.fore_color.rgb = color

def add_textbox(slide, left, top, width, height, text, font_size=14, color=WHITE, bold=False, align=PP_ALIGN.LEFT, font_name="Microsoft JhengHei"):
    txBox = slide.shapes.add_textbox(Inches(left), Inches(top), Inches(width), Inches(height))
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

def add_code_block(slide, left, top, width, height, text, font_size=10):
    txBox = slide.shapes.add_textbox(Inches(left), Inches(top), Inches(width), Inches(height))
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

def add_rect(slide, left, top, width, height, fill_color=DARK_CARD, border_color=None):
    shape = slide.shapes.add_shape(
        1, Inches(left), Inches(top), Inches(width), Inches(height)
    )
    shape.fill.solid()
    shape.fill.fore_color.rgb = fill_color
    if border_color:
        shape.line.color.rgb = border_color
        shape.line.width = Pt(1)
    else:
        shape.line.fill.background()
    return shape

def add_multi_text(slide, left, top, width, height, lines, default_size=13, default_color=WHITE):
    """lines: list of (text, size, color, bold, align)"""
    txBox = slide.shapes.add_textbox(Inches(left), Inches(top), Inches(width), Inches(height))
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

# ════════════════════════════════════════════════
# Slide 1: 封面
# ════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_bg(slide)
add_textbox(slide, 2, 1.2, 9, 1.2, "靈犀 LingXi", 54, GOLD, True, PP_ALIGN.CENTER)
add_textbox(slide, 2, 2.5, 9, 0.8, "🔮 AI 玄學生活顧問 App", 28, LIGHT_GOLD, False, PP_ALIGN.CENTER)
add_textbox(slide, 2, 3.5, 9, 0.6, "使用者畫面與操作流程", 22, WHITE, False, PP_ALIGN.CENTER)
add_textbox(slide, 2, 4.5, 9, 0.5, "八字 · 紫微斗數 · 奇門遁甲 · 西洋占星 · 節氣靈寵", 14, DIM_TEXT, False, PP_ALIGN.CENTER)
add_textbox(slide, 2, 5.5, 9, 0.5, "核心理念：所有命理輸出都由靈寵以對話方式告訴使用者", 16, ORANGE, True, PP_ALIGN.CENTER)
add_textbox(slide, 2, 6.1, 9, 0.5, "不使用傳統資訊卡片，創造「專屬命運指引靈寵」的沉浸感", 13, DIM_TEXT, False, PP_ALIGN.CENTER)

# ════════════════════════════════════════════════
# Slide 2: 整體導航架構（2 Tab）
# ════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_bg(slide)
add_textbox(slide, 0.5, 0.3, 5, 0.6, "一、整體導航架構", 30, GOLD, True)

flow = """App 啟動
    │
    ▼
已完成引導？
   ╱          ╲
  否            是
  ▼             ▼
Onboarding    主畫面
(5 步驟)    (2 個 Tab)
  │
  └──完成後──▶ 主畫面"""
add_code_block(slide, 0.8, 1.2, 4.5, 5.0, flow, 14)

# 右側：2 Tab 示意
add_rect(slide, 6, 1.2, 6.5, 2.2, DARK_CARD, GOLD)
add_textbox(slide, 6.3, 1.3, 6, 0.5, "底部 Tab Bar（2 個分頁）", 18, GOLD, True)
add_multi_text(slide, 6.3, 1.9, 6, 1.3, [
    ("🔮 靈寵（主頁）          ⚙️ 我的", 18, WHITE, True),
    ("pet.tsx                  profile.tsx", 12, DIM_TEXT),
])

# 核心理念框
add_rect(slide, 6, 3.8, 6.5, 3.2, DARK_CARD, ORANGE)
add_textbox(slide, 6.3, 3.9, 6, 0.5, "核心設計理念", 18, ORANGE, True)
add_multi_text(slide, 6.3, 4.5, 6, 2.3, [
    ("靈寵 Tab = 唯一的主畫面", 15, WHITE, True),
    ("", 6),
    ("所有運勢、面相、風水、占卜都由靈寵「說」出來", 13, LIGHT_GOLD),
    ("", 4),
    ("不再使用傳統 UI 資訊卡片", 13, LIGHT_GOLD),
    ("", 4),
    ("使用者體驗 = 跟靈寵聊天", 13, LIGHT_GOLD),
    ("", 4),
    ("引經據典自然融入靈寵對話中", 13, LIGHT_GOLD),
])

# ════════════════════════════════════════════════
# Slide 3: Onboarding 流程
# ════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_bg(slide)
add_textbox(slide, 0.5, 0.3, 8, 0.6, "二、Onboarding 引導流程（首次使用）", 30, GOLD, True)

steps = [
    ("Step 0", "選擇語言", "🌐", "6 語系可選"),
    ("Step 1", "歡迎畫面", "🔮", "品牌展示"),
    ("Step 2", "輸入姓名", "✏️", "使用者大名"),
    ("Step 3", "出生資料", "📅", "年月日時辰/性別"),
    ("Step 4", "靈寵召喚", "🦌", "第一次對話！"),
]

for i, (step, title, emoji, desc) in enumerate(steps):
    x = 0.5 + i * 2.5
    add_rect(slide, x, 1.3, 2.2, 3.0, DARK_CARD, GOLD)
    add_textbox(slide, x + 0.1, 1.4, 2, 0.4, step, 11, DIM_TEXT, False, PP_ALIGN.CENTER)
    add_textbox(slide, x + 0.1, 1.8, 2, 0.8, emoji, 36, WHITE, False, PP_ALIGN.CENTER)
    add_textbox(slide, x + 0.1, 2.7, 2, 0.4, title, 18, GOLD, True, PP_ALIGN.CENTER)
    add_textbox(slide, x + 0.1, 3.2, 2, 0.8, desc, 12, DIM_TEXT, False, PP_ALIGN.CENTER)

# 箭頭提示
add_textbox(slide, 0.5, 4.6, 12, 0.5,
    "Step 0 → Step 1 → Step 2 → Step 3 → Step 4 → 進入靈寵主畫面",
    14, LIGHT_GOLD, False, PP_ALIGN.CENTER)

# Step 4 靈寵召喚重點
add_rect(slide, 0.5, 5.3, 12.3, 2.0, DARK_CARD, PURPLE)
add_textbox(slide, 0.8, 5.4, 5.5, 0.4, "Step 4 靈寵召喚（關鍵時刻）", 16, PURPLE, True)
add_multi_text(slide, 0.8, 5.9, 5.5, 1.3, [
    ("靈寵降臨動畫 + 第一段對話", 13, WHITE),
    ("", 4),
    ("🦌：「主人你好！我是青芽鹿，", 12, LIGHT_GOLD),
    ("立春之靈，木系守護者。", 12, LIGHT_GOLD),
    ("我看了你的命盤...從今天起，", 12, LIGHT_GOLD),
    ("我會每天給你命運指引！」", 12, LIGHT_GOLD),
])
add_multi_text(slide, 7.0, 5.9, 5.5, 1.3, [
    ("用「對話」建立認知模式", 14, ORANGE, True),
    ("", 4),
    ("第一次就讓使用者理解：", 12, DIM_TEXT),
    ("靈寵不是裝飾，而是「會說話的命運顧問」", 12, WHITE),
    ("所有後續資訊都由靈寵以對話方式傳達", 12, WHITE),
])

# ════════════════════════════════════════════════
# Slide 4: 靈寵主畫面佈局
# ════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_bg(slide)
add_textbox(slide, 0.5, 0.3, 10, 0.6, "三、靈寵主畫面（唯一主頁）", 30, GOLD, True)

# 左側：手機模擬框
add_rect(slide, 0.8, 1.0, 5.0, 6.2, RGBColor(0x10, 0x10, 0x18), GOLD)

# 頂部狀態列
add_rect(slide, 1.0, 1.1, 4.6, 0.65, RGBColor(0x1A, 0x1A, 0x28))
add_textbox(slide, 1.1, 1.12, 4.4, 0.3, "靈犀  丙午年三月初十·午時", 10, GOLD, True)
add_textbox(slide, 1.1, 1.42, 4.4, 0.3, "Lv.5 青芽鹿 · 木系", 9, DIM_TEXT)

# 靈寵形象區
add_rect(slide, 1.0, 1.85, 4.6, 1.1, RGBColor(0x12, 0x12, 0x1C))
add_textbox(slide, 1.1, 1.9, 4.4, 0.6, "🦌", 32, WHITE, False, PP_ALIGN.CENTER)
add_textbox(slide, 1.1, 2.5, 4.4, 0.3, "EXP ████████░░ 240/500   ★☆☆☆☆", 8, DIM_TEXT, False, PP_ALIGN.CENTER)

# 對話區
add_rect(slide, 1.0, 3.05, 4.6, 2.8, RGBColor(0x0E, 0x0E, 0x16))
add_textbox(slide, 1.1, 3.05, 4.4, 0.25, "🦌 08:00", 8, DIM_TEXT)
add_rect(slide, 1.1, 3.3, 4.2, 1.0, RGBColor(0x1A, 0x1A, 0x28), RGBColor(0x33, 0x30, 0x28))
add_multi_text(slide, 1.2, 3.32, 4.0, 0.9, [
    ("主人早安～今日木氣旺盛，", 9, LIGHT_GOLD),
    ("《滴天髓》云「木逢春令，根深枝茂」", 8, DIM_TEXT),
    ("💰72  🌸58  📈85  💚65", 8, GOLD),
    ("今日吉方：東南（生門）", 8, GREEN),
])

add_textbox(slide, 1.1, 4.4, 4.4, 0.25, "🦌 08:01", 8, DIM_TEXT)
add_rect(slide, 1.1, 4.65, 4.2, 0.6, RGBColor(0x1A, 0x1A, 0x28), RGBColor(0x33, 0x30, 0x28))
add_multi_text(slide, 1.2, 4.67, 4.0, 0.55, [
    ("今天穿搭建議穿水色系衣服，", 9, LIGHT_GOLD),
    ("《窮通寶鑑》說今日需水來調和！", 8, DIM_TEXT),
])

# 底部功能列
add_rect(slide, 1.0, 5.95, 4.6, 0.8, RGBColor(0x1A, 0x1A, 0x28))
add_textbox(slide, 1.1, 5.97, 4.4, 0.35, "🍖餵食  🎾玩耍  🧘冥想", 10, WHITE, False, PP_ALIGN.CENTER)
add_textbox(slide, 1.1, 6.35, 4.4, 0.35, "👁靈眼  🌍靈心  🏮靈魂", 10, BLUE_ACCENT, False, PP_ALIGN.CENTER)

# Tab Bar
add_rect(slide, 1.0, 6.85, 4.6, 0.3, RGBColor(0x0A, 0x0A, 0x12))
add_textbox(slide, 1.1, 6.86, 4.4, 0.28, "🔮 靈寵          ⚙️ 我的", 9, GOLD, False, PP_ALIGN.CENTER)

# 右側：結構說明
add_rect(slide, 6.3, 1.0, 6.5, 1.3, DARK_CARD, GOLD)
add_textbox(slide, 6.5, 1.05, 6, 0.35, "頂部狀態列", 14, GOLD, True)
add_textbox(slide, 6.5, 1.4, 6, 0.6, "App 名稱 + 農曆日期時辰\n靈寵等級 + 名稱 + 五行屬性", 11, DIM_TEXT)

add_rect(slide, 6.3, 2.5, 6.5, 1.3, DARK_CARD, PURPLE)
add_textbox(slide, 6.5, 2.55, 6, 0.35, "靈寵形象區", 14, PURPLE, True)
add_textbox(slide, 6.5, 2.9, 6, 0.6, "靈寵圖片（浮動動畫）\nEXP 進度條 + 進化階段", 11, DIM_TEXT)

add_rect(slide, 6.3, 4.0, 6.5, 1.5, DARK_CARD, ORANGE)
add_textbox(slide, 6.5, 4.05, 6, 0.35, "靈寵對話區（核心！可滾動）", 14, ORANGE, True)
add_multi_text(slide, 6.5, 4.45, 6, 0.9, [
    ("所有資訊以對話氣泡呈現", 12, WHITE),
    ("每日運勢、穿搭、面相、風水、占卜結果", 11, DIM_TEXT),
    ("引經據典自然融入靈寵語氣中", 11, LIGHT_GOLD),
])

add_rect(slide, 6.3, 5.7, 6.5, 1.3, DARK_CARD, BLUE_ACCENT)
add_textbox(slide, 6.5, 5.75, 6, 0.35, "底部功能列", 14, BLUE_ACCENT, True)
add_multi_text(slide, 6.5, 6.1, 6, 0.7, [
    ("上排：養成互動（餵食/玩耍/冥想）", 11, DIM_TEXT),
    ("下排：靈寵能力（靈眼/靈心/靈魂）", 11, DIM_TEXT),
])

# ════════════════════════════════════════════════
# Slide 5: 靈寵對話系統（核心機制）
# ════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_bg(slide)
add_textbox(slide, 0.5, 0.3, 10, 0.6, "四、靈寵對話系統（核心機制）", 30, GOLD, True)

# 左側：主動對話
add_rect(slide, 0.5, 1.2, 6.0, 3.0, DARK_CARD, GOLD)
add_textbox(slide, 0.8, 1.3, 5.5, 0.4, "靈寵主動對話（系統觸發）", 16, GOLD, True)
add_multi_text(slide, 0.8, 1.8, 5.5, 2.2, [
    ("🌅 早安訊息（06:00）", 13, WHITE, True),
    ("    今日運勢總覽 + 引經據典", 11, DIM_TEXT),
    ("🌞 午間訊息（12:00）", 13, WHITE, True),
    ("    午時提醒 + 下午注意事項", 11, DIM_TEXT),
    ("🌙 晚安訊息（21:00）", 13, WHITE, True),
    ("    明日預告 + 養生建議", 11, DIM_TEXT),
    ("⚡ 即時提醒（特殊時辰）", 13, WHITE, True),
    ("    沖煞時辰、吉時提示", 11, DIM_TEXT),
])

# 右側：回應對話
add_rect(slide, 6.8, 1.2, 6.0, 3.0, DARK_CARD, BLUE_ACCENT)
add_textbox(slide, 7.1, 1.3, 5.5, 0.4, "靈寵回應對話（使用者觸發）", 16, BLUE_ACCENT, True)
add_multi_text(slide, 7.1, 1.8, 5.5, 2.2, [
    ("👁 靈眼結果 → 靈寵解讀面相", 13, WHITE),
    ("🌍 靈心結果 → 靈寵解讀風水", 13, WHITE),
    ("🏮 靈魂結果 → 靈寵解讀卦象", 13, WHITE),
    ("", 6),
    ("🍖 餵食回應 → 感謝 + 養生小提示", 13, LIGHT_GOLD),
    ("🎾 玩耍回應 → 開心 + 命理趣事", 13, LIGHT_GOLD),
    ("🧘 冥想回應 → 感悟 + 經典語錄", 13, LIGHT_GOLD),
])

# 對話氣泡格式
add_rect(slide, 0.5, 4.5, 12.3, 2.8, DARK_CARD, PURPLE)
add_textbox(slide, 0.8, 4.6, 11.8, 0.4, "對話氣泡格式", 16, PURPLE, True)

# 氣泡範例
add_rect(slide, 1.0, 5.1, 5.5, 1.9, RGBColor(0x1A, 0x1A, 0x28), RGBColor(0x33, 0x30, 0x28))
add_textbox(slide, 1.1, 5.12, 5.3, 0.25, "🦌 青芽鹿    08:00", 10, DIM_TEXT)
add_multi_text(slide, 1.1, 5.35, 5.3, 1.5, [
    ("對話主文（靈寵語氣說話）", 11, LIGHT_GOLD, True),
    ("", 4),
    ("「引經據典」片段自然融入", 11, WHITE),
    ("── 《書名》", 10, DIM_TEXT),
    ("", 4),
    ("[內嵌資訊：分數/方位/卦象]", 11, GREEN),
])

# 引經據典規則
add_multi_text(slide, 7.0, 5.1, 5.5, 1.9, [
    ("引經據典嵌入方式", 14, GOLD, True),
    ("", 4),
    ("✓「《滴天髓》云：甲木參天，", 11, GREEN),
    ("   主人今日正是如此氣勢！」", 11, GREEN),
    ("", 4),
    ("✓「《太微賦》所言命宮天機之人，", 11, GREEN),
    ("   遇此時辰宜靜觀其變。」", 11, GREEN),
    ("", 4),
    ("✗ 不要單獨列出書名清單", 11, RED),
    ("✗ 不要用傳統 UI 卡片顯示", 11, RED),
])

# ════════════════════════════════════════════════
# Slide 6: 養成互動 + 功能觸發
# ════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_bg(slide)
add_textbox(slide, 0.5, 0.3, 10, 0.6, "五、養成互動 — 靈寵回應", 30, GOLD, True)

# 餵食
add_rect(slide, 0.5, 1.2, 3.9, 2.8, DARK_CARD, GOLD)
add_textbox(slide, 0.7, 1.3, 3.5, 0.4, "🍖 餵食", 16, GOLD, True)
add_textbox(slide, 0.7, 1.7, 3.5, 0.3, "+50 EXP · +10 靈力", 11, GREEN)
add_rect(slide, 0.7, 2.1, 3.5, 1.7, RGBColor(0x1A, 0x1A, 0x28), RGBColor(0x33, 0x30, 0x28))
add_multi_text(slide, 0.8, 2.15, 3.3, 1.5, [
    ("🦌 靈寵回應：", 10, DIM_TEXT),
    ("", 3),
    ("「謝謝主人！吃飽有力氣了～", 10, LIGHT_GOLD),
    ("對了，《窮通寶鑑》提到你", 10, LIGHT_GOLD),
    ("今天五行需要補水，", 10, LIGHT_GOLD),
    ("記得多喝水喔！」", 10, LIGHT_GOLD),
    ("", 3),
    ("[+50 EXP ✨]", 10, GREEN),
])

# 玩耍
add_rect(slide, 4.7, 1.2, 3.9, 2.8, DARK_CARD, BLUE_ACCENT)
add_textbox(slide, 4.9, 1.3, 3.5, 0.4, "🎾 玩耍", 16, BLUE_ACCENT, True)
add_textbox(slide, 4.9, 1.7, 3.5, 0.3, "+30 EXP · +15 親密", 11, GREEN)
add_rect(slide, 4.9, 2.1, 3.5, 1.7, RGBColor(0x1A, 0x1A, 0x28), RGBColor(0x33, 0x30, 0x28))
add_multi_text(slide, 5.0, 2.15, 3.3, 1.5, [
    ("🦌 靈寵回應：", 10, DIM_TEXT),
    ("", 3),
    ("「嘻嘻，跟主人玩好開心！", 10, LIGHT_GOLD),
    ("《紫微斗數全書》說天機星", 10, LIGHT_GOLD),
    ("的人最適合益智遊戲，", 10, LIGHT_GOLD),
    ("難怪跟你玩總是很有趣～」", 10, LIGHT_GOLD),
    ("", 3),
    ("[+15 親密 💕]", 10, GREEN),
])

# 冥想
add_rect(slide, 8.9, 1.2, 3.9, 2.8, DARK_CARD, PURPLE)
add_textbox(slide, 9.1, 1.3, 3.5, 0.4, "🧘 冥想", 16, PURPLE, True)
add_textbox(slide, 9.1, 1.7, 3.5, 0.3, "+20 EXP · +10 悟性", 11, GREEN)
add_rect(slide, 9.1, 2.1, 3.5, 1.7, RGBColor(0x1A, 0x1A, 0x28), RGBColor(0x33, 0x30, 0x28))
add_multi_text(slide, 9.2, 2.15, 3.3, 1.5, [
    ("🦌 靈寵回應：", 10, DIM_TEXT),
    ("", 3),
    ("「冥想讓我感應到更多天機...", 10, LIGHT_GOLD),
    ("《煙波釣叟歌》云『靜中觀動，", 10, LIGHT_GOLD),
    ("動中取靜』，主人的悟性", 10, LIGHT_GOLD),
    ("又提升了呢！」", 10, LIGHT_GOLD),
    ("", 3),
    ("[+10 悟性 🧠]", 10, GREEN),
])

# 升級 / 進化
add_rect(slide, 0.5, 4.3, 6.0, 3.0, DARK_CARD, ORANGE)
add_textbox(slide, 0.8, 4.4, 5.5, 0.4, "升級時刻", 16, ORANGE, True)
add_rect(slide, 0.8, 4.9, 5.5, 1.0, RGBColor(0x1A, 0x1A, 0x28), RGBColor(0x33, 0x30, 0x28))
add_multi_text(slide, 0.9, 4.95, 5.3, 0.9, [
    ("✨ 升級！✨", 12, GOLD, True, PP_ALIGN.CENTER),
    ("🦌「太好了！我升到 Lv.6 了！", 10, LIGHT_GOLD),
    ("再升 2 級就能解鎖方位導航功能喔！」", 10, LIGHT_GOLD),
    ("[Lv.5 → Lv.6 🎉]", 10, GREEN, False, PP_ALIGN.CENTER),
])

add_rect(slide, 0.8, 6.1, 5.5, 1.0, RGBColor(0x1A, 0x1A, 0x28), RGBColor(0x33, 0x30, 0x28))
add_multi_text(slide, 0.9, 6.15, 5.3, 0.9, [
    ("🌟 進化！🌟", 12, PURPLE, True, PP_ALIGN.CENTER),
    ("🦌 → 🦌✨（覺醒形態）", 11, WHITE, False, PP_ALIGN.CENTER),
    ("「主人！我感受到前所未有的力量...我進化了！", 10, LIGHT_GOLD),
    ("從今以後，能給你更精準的命運指引！」", 10, LIGHT_GOLD),
])

# 右側：所有互動都是對話
add_rect(slide, 6.8, 4.3, 6.0, 3.0, DARK_CARD, GOLD)
add_textbox(slide, 7.1, 4.4, 5.5, 0.4, "設計重點", 16, GOLD, True)
add_multi_text(slide, 7.1, 4.9, 5.5, 2.2, [
    ("一切互動 → 靈寵對話回應", 15, WHITE, True),
    ("", 6),
    ("養成不是數值遊戲，", 13, LIGHT_GOLD),
    ("每次互動靈寵都會融入命理知識回應", 13, LIGHT_GOLD),
    ("", 6),
    ("餵食 → 補充五行建議", 12, DIM_TEXT),
    ("玩耍 → 分享命理趣知識", 12, DIM_TEXT),
    ("冥想 → 引經據典感悟", 12, DIM_TEXT),
    ("", 6),
    ("升級/進化 = 靈寵慶祝對話", 13, ORANGE, True),
    ("不是冰冷的系統通知", 12, DIM_TEXT),
])

# ════════════════════════════════════════════════
# Slide 7: 靈眼 / 靈心 / 靈魂 功能觸發
# ════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_bg(slide)
add_textbox(slide, 0.5, 0.3, 10, 0.6, "六、靈寵能力觸發 — 靈眼·靈心·靈魂", 30, GOLD, True)

# 靈眼
add_rect(slide, 0.5, 1.1, 4.0, 6.0, DARK_CARD, BLUE_ACCENT)
add_textbox(slide, 0.7, 1.2, 3.6, 0.4, "👁 靈眼（面相分析）", 15, BLUE_ACCENT, True)

eye_flow = """點擊「靈眼」
  │
  ▼ 檢查額度
  │
  ▼ 靈寵說：
  「讓我睜開靈眼看看
  主人的面相～」
  │
  ▼ 相機拍照 overlay
  │
  ▼ 分析動畫
  （靈寵閉眼感應中...）
  │
  ▼ Claude Vision (Sonnet)
  │
  ▼ 靈寵解讀對話：
  「我看到了！天庭飽滿，
  《麻衣相法》云
  『天庭飽滿吃官祿』...

  天庭 88  眉相 65
  眼相 91  鼻相 65」"""
add_code_block(slide, 0.7, 1.7, 3.6, 5.2, eye_flow, 9)

# 靈心
add_rect(slide, 4.7, 1.1, 4.0, 6.0, DARK_CARD, GREEN)
add_textbox(slide, 4.9, 1.2, 3.6, 0.4, "🌍 靈心（GPS 風水）", 15, GREEN, True)

heart_flow = """點擊「靈心」
  │
  ▼ 檢查額度
  │
  ▼ 靈寵說：
  「讓我感應一下
  這裡的氣場...
  📍 台北市信義區」
  │
  ▼ GPS + 奇門遁甲排盤
  │
  ▼ Claude API (Sonnet)
  │
  ▼ 靈寵解讀對話：
  「《奇門遁甲統宗》排盤，
  生門臨東南，天輔星照耀，
  利於求學與簽約！

  ✅吉方：東南(生門)
  ⚠️凶方：西南(死門)」"""
add_code_block(slide, 4.9, 1.7, 3.6, 5.2, heart_flow, 9)

# 靈魂
add_rect(slide, 8.9, 1.1, 4.0, 6.0, DARK_CARD, PURPLE)
add_textbox(slide, 9.1, 1.2, 3.6, 0.4, "🏮 靈魂（64 卦占卜）", 15, PURPLE, True)

soul_flow = """點擊「靈魂」
  │
  ▼ 靈寵說：
  「想問什麼呢？
  選一個類別讓我
  感應天機...」
  │
  ▼ 類別選擇
  [事業][感情][家庭]
  [健康][學業]
  │
  ▼ 搖卦動畫(震動+爻線)
  │
  ▼ 檢查額度
  │
  ▼ Claude API
  │
  ▼ 靈寵解讀對話：
  「天機已現！得乾卦！
  《易經》云『天行健，
  君子以自強不息』...」"""
add_code_block(slide, 9.1, 1.7, 3.6, 5.2, soul_flow, 9)

# ════════════════════════════════════════════════
# Slide 8: 付費升級 Modal + 額度表
# ════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_bg(slide)
add_textbox(slide, 0.5, 0.3, 10, 0.6, "七、付費升級 Modal + 額度系統", 30, GOLD, True)

# 左側：觸發機制 + Modal
add_rect(slide, 0.5, 1.2, 5.5, 2.0, DARK_CARD, RED)
add_textbox(slide, 0.8, 1.3, 5, 0.4, "觸發時機", 16, RED, True)
add_multi_text(slide, 0.8, 1.7, 5, 1.3, [
    ("靈眼/靈心/靈魂使用次數耗盡", 13, WHITE),
    ("  → useFeature() 回傳 false → 彈出 Modal", 11, DIM_TEXT),
    ("靈寵等級達上限", 13, WHITE),
    ("  → canLevelUp() 回傳 false → 彈出 Modal", 11, DIM_TEXT),
])

# 重要原則
add_rect(slide, 0.5, 3.4, 5.5, 1.3, DARK_CARD, GOLD)
add_textbox(slide, 0.8, 3.5, 5, 0.4, "重要原則", 16, GOLD, True)
add_multi_text(slide, 0.8, 3.9, 5, 0.7, [
    ("✗ 不在任何常規頁面顯示方案比較", 12, RED),
    ("✗ 不顯示剩餘次數在頁面標題", 12, RED),
    ("✓ 僅在碰到限制時彈出 Modal", 12, GREEN),
    ("✓ 升級提示也用靈寵語氣表達", 12, GREEN),
])

# Modal 示意
add_rect(slide, 0.5, 4.9, 5.5, 2.3, RGBColor(0x11, 0x11, 0x18), GOLD)
add_textbox(slide, 0.7, 4.95, 5.1, 0.4, "Modal 畫面", 12, DIM_TEXT, False, PP_ALIGN.CENTER)
add_multi_text(slide, 0.7, 5.3, 5.1, 1.8, [
    ("🦌「主人，今天的次數用完了...", 12, LIGHT_GOLD),
    ("升級的話，我能幫你做更多喔！」", 12, LIGHT_GOLD),
    ("", 4),
    ("⭐ 會員版 $290/月", 12, GOLD, True),
    ("    靈眼/靈心/靈魂 5次/日 + Lv.20", 10, DIM_TEXT),
    ("👑 至尊版 $590/月", 12, PURPLE, True),
    ("    全功能無限 + 靈寵等級無上限", 10, DIM_TEXT),
    ("", 4),
    ("[ 明天再來 ]", 11, DIM_TEXT, False, PP_ALIGN.CENTER),
])

# 右側：額度表
add_rect(slide, 6.3, 1.2, 6.5, 6.0, DARK_CARD, GOLD)
add_textbox(slide, 6.5, 1.3, 6.1, 0.4, "付費機制與額度系統", 16, GOLD, True)

headers = ["", "免費版", "會員版", "至尊版"]
rows = [
    ["靈眼（面相）", "1次/日", "5次/日", "無限"],
    ["靈心（風水）", "1次/日", "5次/日", "無限"],
    ["靈魂（占卜）", "1次/日", "5次/日", "無限"],
    ["靈寵等級上限", "Lv.10", "Lv.20", "無限"],
    ["靈寵進化次數", "1 次", "2 次", "5 次"],
    ["AI 解讀品質", "Haiku", "Sonnet", "Sonnet"],
    ["Lv.10+ 加成", "+1 次", "+1 次", "—"],
    ["Lv.20+ 加成", "—", "+1 次", "—"],
]

col_x = [6.5, 8.5, 9.8, 11.2]
col_w = [1.8, 1.2, 1.2, 1.2]
col_colors = [WHITE, DIM_TEXT, GOLD, PURPLE]

# Headers
y = 1.9
add_rect(slide, 6.4, y, 6.2, 0.45, RGBColor(0x1A, 0x1A, 0x28))
for j, h in enumerate(headers):
    add_textbox(slide, col_x[j], y + 0.02, col_w[j], 0.4, h, 11, col_colors[j], True, PP_ALIGN.CENTER)

# Rows
for i, row in enumerate(rows):
    y = 2.4 + i * 0.45
    bg = RGBColor(0x18, 0x18, 0x22) if i % 2 == 0 else DARK_CARD
    add_rect(slide, 6.4, y, 6.2, 0.42, bg)
    for j, cell in enumerate(row):
        color = LIGHT_GOLD if j == 0 else col_colors[j]
        add_textbox(slide, col_x[j], y + 0.01, col_w[j], 0.38, cell, 10, color, j == 0, PP_ALIGN.CENTER)

# ════════════════════════════════════════════════
# Slide 9: Claude API 呼叫流程
# ════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_bg(slide)
add_textbox(slide, 0.5, 0.3, 8, 0.6, "八、Claude API 呼叫流程", 30, GOLD, True)

api_flow = """使用者操作 / 定時觸發
    │
    ▼
Cloud Function（Firebase）
    │
    ├── 組裝 System Prompt（config/prompts.ts）
    │     └── 關鍵：要求 Claude 以靈寵語氣
    │         + 引經據典方式回覆
    ├── 注入用戶資料
    │     （八字 + 紫微 + 奇門 + 占星 + 靈寵個性）
    ├── 語言包裝
    │     （i18n-prompts.ts → wrapSystemPrompt）
    │
    ▼
Claude API 呼叫
    │
    ├── Haiku（靈寵日常對話、穿搭、免費版）
    └── Sonnet（面相、風水、付費版占卜、深度運勢）
    │
    ▼
回傳 JSON → 解析為靈寵對話氣泡
    → 新增到對話列表（chat-store.ts）"""
add_code_block(slide, 0.8, 1.1, 5.8, 6.0, api_flow, 12)

# 右側：引經據典規則
add_rect(slide, 7.0, 1.1, 5.8, 5.8, DARK_CARD, PURPLE)
add_textbox(slide, 7.3, 1.2, 5.3, 0.5, "引經據典規則", 18, PURPLE, True)
add_multi_text(slide, 7.3, 1.8, 5.3, 4.8, [
    ("八字引用", 14, GOLD, True),
    ("《滴天髓》《子平真詮》", 12, WHITE),
    ("《窮通寶鑑》《淵海子平》", 12, WHITE),
    ("", 6),
    ("紫微引用", 14, GOLD, True),
    ("《紫微斗數全書》《太微賦》", 12, WHITE),
    ("《骨髓賦》", 12, WHITE),
    ("", 6),
    ("奇門引用", 14, GOLD, True),
    ("《奇門遁甲秘笈大全》", 12, WHITE),
    ("《煙波釣叟歌》《奇門遁甲統宗》", 12, WHITE),
    ("", 6),
    ("西洋占星", 14, GOLD, True),
    ("行星逆行、相位角度等天文現象描述", 12, WHITE),
    ("", 8),
    ("核心原則", 14, ORANGE, True),
    ("引經據典融入靈寵對話語氣中", 12, LIGHT_GOLD),
    ("不是列清單，而是靈寵自然引用", 12, LIGHT_GOLD),
])

# ════════════════════════════════════════════════
# Slide 10: 技術架構
# ════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_bg(slide)
add_textbox(slide, 0.5, 0.3, 8, 0.6, "九、技術架構與檔案結構", 30, GOLD, True)

file_tree = """app/(tabs)/
  ├── _layout.tsx          ← 2 Tab 導航（靈寵/我的）
  ├── pet.tsx              ← 主畫面（靈寵形象+對話+功能列）
  └── profile.tsx          ← 我的設定

components/
  ├── PetAvatar.tsx        ← 靈寵形象區（動畫+等級+EXP）
  ├── PetChat.tsx          ← 對話列表元件（核心！）
  ├── PetBubble.tsx        ← 單則對話氣泡
  ├── ActionBar.tsx        ← 底部功能列
  ├── UpgradeModal.tsx     ← 付費升級彈窗
  └── features/
      ├── EyeCapture.tsx   ← 靈眼拍照 overlay
      ├── HeartCompass.tsx  ← 靈心羅盤 overlay
      └── PearlShake.tsx   ← 靈魂搖卦 overlay

stores/
  ├── user-store.ts        ← 用戶狀態 + 額度
  ├── pet-store.ts         ← 靈寵狀態 + 等級
  └── chat-store.ts        ← 對話訊息列表（新增！）

services/
  ├── bazi-engine.ts       ← 八字計算 (35%)
  ├── ziwei-engine.ts      ← 紫微排盤 (30%)
  ├── qimen-engine.ts      ← 奇門遁甲 (25%)
  ├── astrology-engine.ts  ← 西洋占星 (10%)
  ├── unified-fortune.ts   ← 加權融合引擎
  └── claude-api.ts        ← Claude API 串接"""
add_code_block(slide, 0.5, 1.0, 6.5, 6.2, file_tree, 10)

# 右側：ChatMessage 資料結構 + 技術棧
add_rect(slide, 7.3, 1.0, 5.5, 3.0, DARK_CARD, ORANGE)
add_textbox(slide, 7.5, 1.1, 5.1, 0.4, "對話資料結構 (chat-store.ts)", 14, ORANGE, True)

chat_struct = """interface ChatMessage {
  id: string;
  time: string;
  type: 'fortune' | 'outfit'
     | 'face' | 'fengshui'
     | 'divination'
     | 'feed' | 'play'
     | 'meditate'
     | 'levelup' | 'evolve';
  text: string;
  classicQuote?: string;
  data?: any;
}"""
add_code_block(slide, 7.5, 1.55, 5.1, 2.3, chat_struct, 10)

add_rect(slide, 7.3, 4.2, 5.5, 3.0, DARK_CARD, BLUE_ACCENT)
add_textbox(slide, 7.5, 4.3, 5.1, 0.4, "技術棧", 14, BLUE_ACCENT, True)
tech = [
    ("前端", "React Native + Expo SDK 52"),
    ("路由", "Expo Router"),
    ("語言", "TypeScript"),
    ("狀態", "Zustand"),
    ("後端", "Firebase Cloud Functions"),
    ("AI", "Claude API (Vision + Text)"),
    ("內購", "RevenueCat"),
    ("多語言", "i18next (6 語系)"),
]
for i, (label, value) in enumerate(tech):
    y = 4.8 + i * 0.3
    add_textbox(slide, 7.5, y, 1.3, 0.28, label, 10, DIM_TEXT, True)
    add_textbox(slide, 8.8, y, 3.5, 0.28, value, 10, WHITE)

# ════════════════════════════════════════════════
# Slide 11: Tab 2 — 我的設定
# ════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_bg(slide)
add_textbox(slide, 0.5, 0.3, 8, 0.6, "十、Tab 2：我的 — 個人設定", 30, GOLD, True)

profile_sections = [
    ("🦌 使用者資訊", "名字 / 靈寵等級 / 五行 / 節氣\n訂閱方案 Badge（免費/會員/至尊）"),
    ("⭐ 訂閱狀態", "免費版顯示「升級為會員」按鈕\n付費版顯示當前方案到期日"),
    ("🌐 語言設定", "繁中 / 简中 / 日文 / English / Deutsch / Francais\n使用 LanguageSelector 元件"),
    ("📜 命盤資料", "八字四柱 / 紫微命宮主星\n西洋星座 / 節氣靈寵"),
    ("⚙️ 其他", "推播設定 / 隱私權政策\n服務條款 / 關於靈犀 / 登出"),
]

for i, (title, desc) in enumerate(profile_sections):
    y = 1.2 + i * 1.2
    add_rect(slide, 0.5, y, 5.5, 1.05, DARK_CARD, RGBColor(0x33, 0x30, 0x28))
    add_textbox(slide, 0.8, y + 0.05, 5, 0.35, title, 15, GOLD, True)
    add_textbox(slide, 0.8, y + 0.42, 5, 0.6, desc, 11, DIM_TEXT)

# 右側：設計要點
add_rect(slide, 6.5, 1.2, 6.3, 5.8, DARK_CARD, GOLD)
add_textbox(slide, 6.8, 1.3, 5.8, 0.4, "設計要點", 18, GOLD, True)
add_multi_text(slide, 6.8, 1.8, 5.8, 5.0, [
    ("簡潔資訊展示", 14, WHITE, True),
    ("個人頁不放功能操作，純設定與資訊", 12, DIM_TEXT),
    ("", 8),
    ("付費入口", 14, WHITE, True),
    ("僅免費版顯示升級 CTA", 12, DIM_TEXT),
    ("不在此頁放方案對比表", 12, DIM_TEXT),
    ("", 8),
    ("命盤總覽", 14, WHITE, True),
    ("一覽四大命理系統摘要", 12, DIM_TEXT),
    ("方便使用者確認個人資料正確", 12, DIM_TEXT),
    ("", 8),
    ("語言切換", 14, WHITE, True),
    ("支援 6 語系即時切換", 12, DIM_TEXT),
    ("Claude API 回覆語言自動對應", 12, DIM_TEXT),
])

# ════════════════════════════════════════════════
# Slide 12: 完整使用者旅程
# ════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_bg(slide)
add_textbox(slide, 0.5, 0.3, 8, 0.6, "十一、完整使用者旅程", 30, GOLD, True)

journey = """下載 App → Onboarding（5步）→ 靈寵召喚（第一次對話）

┌───── 每日循環（所有內容 = 靈寵對話）────────────┐
│                                                   │
│  靈寵主動說話（定時推播 + 進入 App 時）：          │
│    ├── 🌅 早安：今日運勢 + 吉方 + 引經據典       │
│    ├── 🌞 午間：午時提醒 + 下午注意事項          │
│    ├── 🌙 晚安：明日預告 + 養生建議              │
│    └── 👔 穿搭：五行色系推薦                     │
│                                                   │
│  使用者觸發互動（底部功能列）：                    │
│    ├── 🍖🎾🧘 養成 → 靈寵回應 + EXP提升         │
│    ├── 👁 靈眼 → 拍照 → 靈寵解讀面相             │
│    ├── 🌍 靈心 → GPS → 靈寵解讀風水              │
│    └── 🏮 靈魂 → 搖卦 → 靈寵解讀卦象            │
│                                                   │
│  靈寵成長事件：                                   │
│    ├── 升級 → 靈寵慶祝對話                       │
│    ├── 進化 → 形態變化 + 靈寵感言                │
│    └── 解鎖功能 → 靈寵介紹新能力                 │
└───────────────────────────────────────────────────┘

付費觸發（彈窗 Modal，靈寵語氣）：
  ├── 功能使用次數耗盡 → 靈寵提醒 + 升級選項
  └── 靈寵等級達上限 → 靈寵說明 + 升級選項"""
add_code_block(slide, 0.8, 1.0, 11.7, 6.2, journey, 12)

# ════════════════════════════════════════════════
# 儲存
# ════════════════════════════════════════════════
out_dir = r"G:\共用雲端硬碟\有泉科技有限公司\內部開發\APP\算命系統\LingXi"
out_path = os.path.join(out_dir, "LingXi_UI_Flow.pptx")
prs.save(out_path)
print(f"PPT saved: {out_path}")
