"""
LingXi UI Restructure Mockup v2
核心理念：靈寵是唯一的命運反饋介面，所有結果透過靈寵「說出來」
"""
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE
import math

# ── Colors ──
BG_DARK = RGBColor(0x0F, 0x0B, 0x1E)
CARD_BG = RGBColor(0x1A, 0x14, 0x2E)
GOLD = RGBColor(0xFF, 0xD7, 0x00)
GOLD_DIM = RGBColor(0xB8, 0x96, 0x0C)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
GRAY = RGBColor(0x99, 0x99, 0xAA)
GRAY_DIM = RGBColor(0x66, 0x66, 0x77)
GREEN = RGBColor(0x4A, 0xDE, 0x80)
PURPLE = RGBColor(0xA7, 0x8B, 0xFA)
EYE_GOLD = RGBColor(0xFF, 0xC1, 0x07)
PANEL_BG = RGBColor(0x22, 0x1A, 0x3A)
BTN_BG = RGBColor(0x2D, 0x1F, 0x5E)
PROGRESS_BG = RGBColor(0x33, 0x2B, 0x55)
CHAT_BG = RGBColor(0x1E, 0x17, 0x33)
STATUS_BG = RGBColor(0x14, 0x0E, 0x28)
ACTIONBAR_BG = RGBColor(0x16, 0x10, 0x2A)
RED_DIM = RGBColor(0xEF, 0x44, 0x44)
BLUE_PET = RGBColor(0x64, 0xB4, 0xFF)
SLIDE_BG = RGBColor(0x08, 0x06, 0x12)

PHONE_W = Inches(2.8)
PHONE_H = Inches(5.8)


def add_rounded_rect(slide, left, top, width, height, fill_color, border_color=None, border_width=Pt(0)):
    shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
    shape.fill.solid()
    shape.fill.fore_color.rgb = fill_color
    if border_color:
        shape.line.color.rgb = border_color
        shape.line.width = border_width
    else:
        shape.line.fill.background()
    shape.adjustments[0] = 0.05
    return shape

def add_rect(slide, left, top, width, height, fill_color, border_color=None):
    shape = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, left, top, width, height)
    shape.fill.solid()
    shape.fill.fore_color.rgb = fill_color
    if border_color:
        shape.line.color.rgb = border_color
        shape.line.width = Pt(1)
    else:
        shape.line.fill.background()
    return shape

def add_circle(slide, left, top, size, fill_color, border_color=None, border_width=Pt(2)):
    shape = slide.shapes.add_shape(MSO_SHAPE.OVAL, left, top, size, size)
    shape.fill.solid()
    shape.fill.fore_color.rgb = fill_color
    if border_color:
        shape.line.color.rgb = border_color
        shape.line.width = border_width
    else:
        shape.line.fill.background()
    return shape

def add_text(slide, left, top, width, height, text, font_size=10, color=WHITE, bold=False, alignment=PP_ALIGN.LEFT):
    txBox = slide.shapes.add_textbox(left, top, width, height)
    tf = txBox.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = text
    p.font.size = Pt(font_size)
    p.font.color.rgb = color
    p.font.bold = bold
    p.alignment = alignment
    return txBox

def add_multiline(slide, left, top, width, height, lines):
    """lines = [(text, size, color, bold, align), ...]"""
    txBox = slide.shapes.add_textbox(left, top, width, height)
    tf = txBox.text_frame
    tf.word_wrap = True
    for i, ln in enumerate(lines):
        text = ln[0]
        size = ln[1] if len(ln) > 1 else 9
        color = ln[2] if len(ln) > 2 else WHITE
        bold = ln[3] if len(ln) > 3 else False
        align = ln[4] if len(ln) > 4 else PP_ALIGN.LEFT
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.text = text
        p.font.size = Pt(size)
        p.font.color.rgb = color
        p.font.bold = bold
        p.alignment = align
        p.space_after = Pt(2)
    return txBox

def slide_bg(slide, prs):
    bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
    bg.fill.solid()
    bg.fill.fore_color.rgb = SLIDE_BG
    bg.line.fill.background()


# ── Phone drawing helpers ──

def draw_phone(slide, cx, cy, title=""):
    left = cx - PHONE_W // 2
    top = cy - PHONE_H // 2
    phone = add_rounded_rect(slide, left, top, PHONE_W, PHONE_H, BG_DARK, RGBColor(0x44, 0x44, 0x66), Pt(2))
    phone.adjustments[0] = 0.06
    if title:
        add_text(slide, left, top - Inches(0.35), PHONE_W, Inches(0.3),
                 title, font_size=10, color=WHITE, bold=True, alignment=PP_ALIGN.CENTER)
    return left, top

def draw_status_bar(slide, pl, pt):
    add_rect(slide, pl + Inches(0.04), pt + Inches(0.04), PHONE_W - Inches(0.08), Inches(0.35), STATUS_BG)
    add_text(slide, pl + Inches(0.08), pt + Inches(0.06), Inches(1.2), Inches(0.16),
             "LingXi", font_size=7, color=GOLD, bold=True)
    add_text(slide, pl + Inches(0.08), pt + Inches(0.2), Inches(1.5), Inches(0.14),
             "二月初四 卯時", font_size=5, color=GRAY_DIM)
    add_text(slide, pl + Inches(1.5), pt + Inches(0.06), Inches(1.2), Inches(0.16),
             "Lv.3 小鹿靈 · 木", font_size=6, color=GRAY, alignment=PP_ALIGN.RIGHT)

def draw_avatar_normal(slide, pl, pt):
    cx = pl + PHONE_W // 2
    ay = pt + Inches(0.45)
    add_circle(slide, cx - Inches(0.3), ay, Inches(0.6), CARD_BG, RGBColor(0x55, 0x44, 0x88), Pt(2))
    add_text(slide, cx - Inches(0.18), ay + Inches(0.1), Inches(0.36), Inches(0.36),
             "🦌", font_size=22, alignment=PP_ALIGN.CENTER)
    add_text(slide, cx - Inches(0.6), ay + Inches(0.65), Inches(1.2), Inches(0.16),
             "小鹿靈  ★★☆☆☆", font_size=6, color=GRAY_DIM, alignment=PP_ALIGN.CENTER)
    add_rounded_rect(slide, cx - Inches(0.4), ay + Inches(0.82), Inches(0.8), Inches(0.05), PROGRESS_BG)
    add_rounded_rect(slide, cx - Inches(0.4), ay + Inches(0.82), Inches(0.48), Inches(0.05), GOLD_DIM)
    return ay + Inches(0.95)

def draw_avatar_eye(slide, pl, pt):
    cx = pl + PHONE_W // 2
    ay = pt + Inches(0.45)
    add_circle(slide, cx - Inches(0.36), ay - Inches(0.06), Inches(0.72), RGBColor(0x33, 0x28, 0x00), EYE_GOLD, Pt(2))
    add_circle(slide, cx - Inches(0.3), ay, Inches(0.6), CARD_BG, EYE_GOLD, Pt(2))
    add_text(slide, cx - Inches(0.18), ay + Inches(0.1), Inches(0.36), Inches(0.36),
             "🦌", font_size=22, alignment=PP_ALIGN.CENTER)
    add_text(slide, cx - Inches(0.1), ay - Inches(0.18), Inches(0.2), Inches(0.2),
             "👁", font_size=12, alignment=PP_ALIGN.CENTER)
    for dx, dy in [(-0.42, 0.15), (0.38, 0.12), (-0.35, 0.5), (0.35, 0.48)]:
        add_text(slide, cx + Inches(dx), ay + Inches(dy), Inches(0.15), Inches(0.15),
                 "✨", font_size=6, alignment=PP_ALIGN.CENTER)
    return ay + Inches(0.75)

def draw_avatar_heart(slide, pl, pt):
    cx = pl + PHONE_W // 2
    ay = pt + Inches(0.45)
    add_circle(slide, cx - Inches(0.36), ay - Inches(0.06), Inches(0.72), RGBColor(0x0A, 0x2E, 0x14), GREEN, Pt(2))
    add_circle(slide, cx - Inches(0.3), ay, Inches(0.6), CARD_BG, GREEN, Pt(2))
    add_text(slide, cx - Inches(0.18), ay + Inches(0.1), Inches(0.36), Inches(0.36),
             "🦌", font_size=22, alignment=PP_ALIGN.CENTER)
    dirs = [("N", 0, -0.4), ("E", 0.4, 0), ("S", 0, 0.4), ("W", -0.4, 0)]
    for label, dx, dy in dirs:
        add_text(slide, cx + Inches(dx) - Inches(0.06), ay + Inches(0.27) + Inches(dy),
                 Inches(0.16), Inches(0.14), label, font_size=5, color=GREEN, alignment=PP_ALIGN.CENTER)
    return ay + Inches(0.75)

def draw_avatar_pearl(slide, pl, pt):
    cx = pl + PHONE_W // 2
    ay = pt + Inches(0.45)
    add_circle(slide, cx - Inches(0.36), ay - Inches(0.06), Inches(0.72), RGBColor(0x1E, 0x0A, 0x3E), PURPLE, Pt(2))
    add_circle(slide, cx - Inches(0.3), ay, Inches(0.6), CARD_BG, PURPLE, Pt(2))
    add_text(slide, cx - Inches(0.18), ay + Inches(0.1), Inches(0.36), Inches(0.36),
             "🦌", font_size=22, alignment=PP_ALIGN.CENTER)
    bagua = ["☰", "☷", "☳", "☴", "☵", "☲", "☶", "☱"]
    for i, sym in enumerate(bagua):
        angle = i * (2 * math.pi / 8) - math.pi / 2
        dx = 0.4 * math.cos(angle)
        dy = 0.4 * math.sin(angle)
        add_text(slide, cx + Inches(dx) - Inches(0.06), ay + Inches(0.27) + Inches(dy),
                 Inches(0.14), Inches(0.14), sym, font_size=6, color=PURPLE, alignment=PP_ALIGN.CENTER)
    return ay + Inches(0.75)

def draw_chat_bubbles(slide, pl, chat_top, chat_bottom, bubbles):
    add_rounded_rect(slide, pl + Inches(0.06), chat_top, PHONE_W - Inches(0.12),
                     chat_bottom - chat_top, CHAT_BG)
    y = chat_top + Inches(0.06)
    for bub in bubbles:
        text = bub[0]
        color = bub[1] if len(bub) > 1 else WHITE
        is_rich = bub[2] if len(bub) > 2 else False
        border_c = bub[3] if len(bub) > 3 else RGBColor(0x44, 0x38, 0x66)

        lines = max(1, len(text) // 18 + 1)
        bh = Inches(0.22 + lines * 0.12) if not is_rich else Inches(0.8)

        # pet header
        add_text(slide, pl + Inches(0.12), y, PHONE_W - Inches(0.3), Inches(0.12),
                 "🦌 小鹿靈", font_size=4, color=GRAY_DIM)
        y += Inches(0.12)

        add_rounded_rect(slide, pl + Inches(0.12), y, PHONE_W - Inches(0.3), bh,
                         RGBColor(0x2A, 0x20, 0x44), border_c, Pt(1))
        add_text(slide, pl + Inches(0.18), y + Inches(0.04), PHONE_W - Inches(0.42), bh - Inches(0.06),
                 text, font_size=5, color=color)
        y += bh + Inches(0.06)
    return y

def draw_action_bar(slide, pl, pt, highlight=None):
    bar_top = pt + Inches(5.1)
    add_rect(slide, pl + Inches(0.04), bar_top, PHONE_W - Inches(0.08), Inches(0.65), ACTIONBAR_BG)
    items1 = [("🍖 餵食", "+50"), ("🎾 玩耍", "+30"), ("🧘 冥想", "+20")]
    for i, (label, exp) in enumerate(items1):
        x = pl + Inches(0.1) + Inches(i * 0.88)
        add_rounded_rect(slide, x, bar_top + Inches(0.04), Inches(0.76), Inches(0.26), BTN_BG)
        add_text(slide, x, bar_top + Inches(0.06), Inches(0.76), Inches(0.14),
                 label, font_size=6, color=GRAY if highlight else WHITE, alignment=PP_ALIGN.CENTER)
        add_text(slide, x, bar_top + Inches(0.17), Inches(0.76), Inches(0.1),
                 exp, font_size=4, color=GRAY_DIM, alignment=PP_ALIGN.CENTER)

    colors = [EYE_GOLD, GREEN, PURPLE]
    keys = ['eye', 'heart', 'pearl']
    items2 = [("👁 靈眼", EYE_GOLD), ("🌍 靈心", GREEN), ("🏮 靈魂", PURPLE)]
    for i, (label, color) in enumerate(items2):
        x = pl + Inches(0.1) + Inches(i * 0.88)
        is_hl = highlight == keys[i]
        bc = color if is_hl else None
        bw = Pt(2) if is_hl else Pt(0)
        add_rounded_rect(slide, x, bar_top + Inches(0.34), Inches(0.76), Inches(0.24), BTN_BG, bc, bw)
        c = color if is_hl or not highlight else GRAY_DIM
        add_text(slide, x, bar_top + Inches(0.37), Inches(0.76), Inches(0.16),
                 label, font_size=6, color=c, alignment=PP_ALIGN.CENTER)

def draw_arrow(slide, x, y, color=GOLD):
    add_text(slide, x, y, Inches(0.6), Inches(0.35),
             "→", font_size=28, color=color, alignment=PP_ALIGN.CENTER)


# ════════════════════════════════════════
prs = Presentation()
prs.slide_width = Inches(13.33)
prs.slide_height = Inches(7.5)
blank = prs.slide_layouts[6]


# ─────────────────────────────────────────────────
# Slide 1: 設計理念 + 正常狀態 vs 啟動對比
# ─────────────────────────────────────────────────
slide = prs.slides.add_slide(blank)
slide_bg(slide, prs)

add_text(slide, Inches(0.3), Inches(0.1), Inches(12.7), Inches(0.35),
         "靈犀 UI 重構：靈寵 = 唯一的命運反饋介面", font_size=20, color=GOLD, bold=True, alignment=PP_ALIGN.CENTER)

# Design principle box
add_rounded_rect(slide, Inches(0.3), Inches(0.55), Inches(4.0), Inches(2.6), PANEL_BG, GOLD, Pt(1))
add_multiline(slide, Inches(0.5), Inches(0.65), Inches(3.6), Inches(2.4), [
    ("核心設計理念", 13, GOLD, True),
    ("", 4),
    ("使用者永遠面對靈寵。", 10, WHITE, True),
    ("靈寵是通靈者、翻譯者、", 10, WHITE, True),
    ("命運與使用者之間的唯一介面。", 10, WHITE, True),
    ("", 5),
    ("Before: 點靈眼 → 全螢幕相機", 9, RED_DIM),
    ("       → 全螢幕結果頁 → 返回", 9, RED_DIM),
    ("       (離開靈寵，沉浸感中斷)", 8, GRAY_DIM),
    ("", 4),
    ("After:  點靈眼 → 靈寵眼睛發光", 9, GREEN),
    ("       → 小面板「拍照」→ 靈寵說結果", 9, GREEN),
    ("       (始終在主畫面，靈寵全程參與)", 8, GRAY),
    ("", 5),
    ("所有分析結果 = 靈寵的對話氣泡", 10, GOLD, True),
    ("沒有獨立結果畫面。", 10, GOLD, True),
])

# Phone 1: Normal
pl1, pt1 = draw_phone(slide, Inches(6.2), Inches(4.0), "正常狀態")
draw_status_bar(slide, pl1, pt1)
ab = draw_avatar_normal(slide, pl1, pt1)
draw_chat_bubbles(slide, pl1, ab + Inches(0.05), pt1 + Inches(5.0), [
    ("早安主人！今天木氣旺盛，適合思考與學習～", GOLD),
    ("今日運勢：事業 ★★★★ 感情 ★★★", WHITE),
    ("吉方: 東南  吉色: 綠  吉數: 3", GRAY),
])
draw_action_bar(slide, pl1, pt1)

# Phone 2: Eye activated
pl2, pt2 = draw_phone(slide, Inches(9.5), Inches(4.0), "靈眼啟動")
draw_status_bar(slide, pl2, pt2)
ab2 = draw_avatar_eye(slide, pl2, pt2)

# FeaturePanel (eye ready)
fp_top = ab2 + Inches(0.06)
fp_h = Inches(0.9)
add_rounded_rect(slide, pl2 + Inches(0.08), fp_top, PHONE_W - Inches(0.16), fp_h,
                 PANEL_BG, EYE_GOLD, Pt(1))
add_text(slide, pl2 + Inches(0.14), fp_top + Inches(0.06), PHONE_W - Inches(0.3), Inches(0.14),
         "🦌 讓我看看你的面相...", font_size=6, color=EYE_GOLD, bold=True)
add_rounded_rect(slide, pl2 + Inches(0.3), fp_top + Inches(0.3), PHONE_W - Inches(0.7), Inches(0.24),
                 BTN_BG, EYE_GOLD, Pt(1))
add_text(slide, pl2 + Inches(0.3), fp_top + Inches(0.32), PHONE_W - Inches(0.7), Inches(0.2),
         "📸 拍照", font_size=7, color=EYE_GOLD, bold=True, alignment=PP_ALIGN.CENTER)
add_text(slide, pl2 + Inches(0.2), fp_top + Inches(0.6), PHONE_W - Inches(0.4), Inches(0.1),
         "照片僅供分析，不儲存", font_size=4, color=GRAY_DIM, alignment=PP_ALIGN.CENTER)
# Label
add_text(slide, pl2 + PHONE_W + Inches(0.05), fp_top + Inches(0.1), Inches(1.2), Inches(0.5),
         "← FeaturePanel\n  (輕量互動區)", font_size=6, color=EYE_GOLD)

draw_chat_bubbles(slide, pl2, fp_top + fp_h + Inches(0.05), pt2 + Inches(5.0), [
    ("早安主人！今天木氣旺盛～", GOLD),
])
draw_action_bar(slide, pl2, pt2, 'eye')

# Phone 3: Eye result in chat
pl3, pt3 = draw_phone(slide, Inches(12.0), Inches(4.0), "結果=靈寵說的")
draw_status_bar(slide, pl3, pt3)
ab3 = draw_avatar_normal(slide, pl3, pt3)
draw_chat_bubbles(slide, pl3, ab3 + Inches(0.05), pt3 + Inches(5.0), [
    ("早安主人！今天木氣旺盛～", GOLD),
    ("主人天庭飽滿，印堂發亮！近期事業運旺盛，要把握機會喔～\n\n運勢: ★★★★☆ 上吉\n天庭 82  眉 65  眼 91\n鼻 73  口 78\n幸運物: 水晶手鍊", WHITE, True, EYE_GOLD),
])
draw_action_bar(slide, pl3, pt3)
add_text(slide, pl3 + PHONE_W + Inches(0.02), pt3 + Inches(2.5), Inches(0.5), Inches(0.6),
         "← 結果\n  融入\n  對話", font_size=5, color=EYE_GOLD)

draw_arrow(slide, Inches(7.8), Inches(3.7), EYE_GOLD)
draw_arrow(slide, Inches(10.85), Inches(3.7), EYE_GOLD)


# ─────────────────────────────────────────────────
# Slide 2: 靈眼完整流程（4 格）
# ─────────────────────────────────────────────────
slide = prs.slides.add_slide(blank)
slide_bg(slide, prs)

add_text(slide, Inches(0.3), Inches(0.1), Inches(12.7), Inches(0.35),
         "靈眼 👁 完整流程 — 靈寵觀察你的面相", font_size=18, color=EYE_GOLD, bold=True, alignment=PP_ALIGN.CENTER)

# Step labels
steps = [
    ("① 觸發", "點靈眼按鈕"),
    ("② 拍照", "小彈窗，非全螢幕"),
    ("③ 分析中", "靈寵邊看邊說"),
    ("④ 結果", "靈寵告訴你"),
]

for i, (label, desc) in enumerate(steps):
    x = Inches(0.3) + Inches(i * 3.25)
    add_text(slide, x, Inches(0.5), Inches(3.0), Inches(0.2),
             f"{label}  {desc}", font_size=8, color=GRAY, alignment=PP_ALIGN.CENTER)

# Phone A: trigger
plA, ptA = draw_phone(slide, Inches(1.7), Inches(3.8), "")
draw_status_bar(slide, plA, ptA)
abA = draw_avatar_eye(slide, plA, ptA)
fp_top = abA + Inches(0.06)
add_rounded_rect(slide, plA + Inches(0.08), fp_top, PHONE_W - Inches(0.16), Inches(0.85),
                 PANEL_BG, EYE_GOLD, Pt(1))
add_text(slide, plA + Inches(0.14), fp_top + Inches(0.06), PHONE_W - Inches(0.3), Inches(0.14),
         "🦌 讓我看看你的面相...", font_size=6, color=EYE_GOLD, bold=True)
add_rounded_rect(slide, plA + Inches(0.3), fp_top + Inches(0.28), PHONE_W - Inches(0.7), Inches(0.24),
                 BTN_BG, EYE_GOLD, Pt(1))
add_text(slide, plA + Inches(0.3), fp_top + Inches(0.3), PHONE_W - Inches(0.7), Inches(0.2),
         "📸 拍照開始分析", font_size=7, color=EYE_GOLD, bold=True, alignment=PP_ALIGN.CENTER)
add_text(slide, plA + Inches(0.2), fp_top + Inches(0.58), PHONE_W - Inches(0.4), Inches(0.1),
         "照片僅供分析，不儲存", font_size=4, color=GRAY_DIM, alignment=PP_ALIGN.CENTER)
draw_chat_bubbles(slide, plA, fp_top + Inches(0.9), ptA + Inches(5.0), [
    ("主人，讓我看看你的面相...", EYE_GOLD),
])
draw_action_bar(slide, plA, ptA, 'eye')

# Phone B: camera popup
plB, ptB = draw_phone(slide, Inches(4.95), Inches(3.8), "")
draw_status_bar(slide, plB, ptB)
draw_avatar_eye(slide, plB, ptB)
# Camera overlay (small, not full screen)
cam_top = ptB + Inches(1.3)
cam_h = Inches(2.3)
# Semi-transparent overlay
add_rounded_rect(slide, plB + Inches(0.15), cam_top, PHONE_W - Inches(0.3), cam_h,
                 RGBColor(0x11, 0x0D, 0x22), EYE_GOLD, Pt(2))
add_text(slide, plB + Inches(0.2), cam_top + Inches(0.06), PHONE_W - Inches(0.4), Inches(0.14),
         "📷 前鏡頭", font_size=6, color=GRAY, alignment=PP_ALIGN.CENTER)
# Viewfinder
add_rounded_rect(slide, plB + Inches(0.25), cam_top + Inches(0.22), PHONE_W - Inches(0.5), Inches(1.3),
                 RGBColor(0x22, 0x1A, 0x33))
add_circle(slide, plB + Inches(0.65), cam_top + Inches(0.35), Inches(0.8),
           RGBColor(0x22, 0x1A, 0x33), EYE_GOLD, Pt(1))
add_text(slide, plB + Inches(0.65), cam_top + Inches(0.55), Inches(0.8), Inches(0.3),
         "👤", font_size=18, color=GRAY_DIM, alignment=PP_ALIGN.CENTER)
# Capture button
add_circle(slide, plB + Inches(0.9), cam_top + Inches(1.7), Inches(0.4),
           WHITE, EYE_GOLD, Pt(2))
add_text(slide, plB + Inches(0.2), cam_top + Inches(2.15), PHONE_W - Inches(0.4), Inches(0.1),
         "拍完自動關閉", font_size=5, color=GRAY_DIM, alignment=PP_ALIGN.CENTER)
draw_action_bar(slide, plB, ptB, 'eye')

# Phone C: analyzing
plC, ptC = draw_phone(slide, Inches(8.2), Inches(3.8), "")
draw_status_bar(slide, plC, ptC)
abC = draw_avatar_eye(slide, plC, ptC)
fp_top = abC + Inches(0.06)
add_rounded_rect(slide, plC + Inches(0.08), fp_top, PHONE_W - Inches(0.16), Inches(1.0),
                 PANEL_BG, EYE_GOLD, Pt(1))
add_text(slide, plC + Inches(0.14), fp_top + Inches(0.06), PHONE_W - Inches(0.3), Inches(0.14),
         "🦌 嗯...讓我仔細看看...", font_size=6, color=EYE_GOLD, bold=True)
# Progress bar
add_rounded_rect(slide, plC + Inches(0.18), fp_top + Inches(0.28), PHONE_W - Inches(0.4), Inches(0.1), PROGRESS_BG)
add_rounded_rect(slide, plC + Inches(0.18), fp_top + Inches(0.28), Inches(1.5), Inches(0.1), EYE_GOLD)
add_text(slide, plC + Inches(0.18), fp_top + Inches(0.4), Inches(0.6), Inches(0.12),
         "72%", font_size=6, color=EYE_GOLD, bold=True)
add_text(slide, plC + Inches(0.14), fp_top + Inches(0.55), PHONE_W - Inches(0.3), Inches(0.12),
         "定位五官特徵中...", font_size=5, color=GRAY)
add_text(slide, plC + Inches(0.14), fp_top + Inches(0.7), PHONE_W - Inches(0.3), Inches(0.12),
         "✓ 辨識面部  ✓ 分析五官  ○ 解讀命理", font_size=4, color=GRAY_DIM)
draw_chat_bubbles(slide, plC, fp_top + Inches(1.05), ptC + Inches(5.0), [
    ("主人的天庭很飽滿呢...", EYE_GOLD),
    ("眉宇間藏著智慧的光芒...", EYE_GOLD),
])
draw_action_bar(slide, plC, ptC, 'eye')

# Phone D: result as chat
plD, ptD = draw_phone(slide, Inches(11.45), Inches(3.8), "")
draw_status_bar(slide, plD, ptD)
abD = draw_avatar_normal(slide, plD, ptD)
# No FeaturePanel — it's gone, result is in chat
draw_chat_bubbles(slide, plD, abD + Inches(0.05), ptD + Inches(5.0), [
    ("主人的天庭很飽滿呢...", EYE_GOLD),
    ("主人天庭飽滿，印堂發亮！\n近期事業運旺盛喔～\n\n★★★★☆ 上吉\n天庭82 眉65 眼91 鼻73 口78\n幸運物: 水晶手鍊", WHITE, True, EYE_GOLD),
    ("有什麼想問的嗎？", GOLD),
])
draw_action_bar(slide, plD, ptD)

# Arrows
for ax in [3.3, 6.55, 9.8]:
    draw_arrow(slide, Inches(ax), Inches(3.5), EYE_GOLD)

# Key note
add_multiline(slide, Inches(0.3), Inches(6.6), Inches(12.7), Inches(0.5), [
    ("注意: Panel 在分析完成後自動消失，PetAvatar 恢復正常浮動，結果以靈寵對話氣泡呈現。使用者從頭到尾都在主畫面。", 8, GRAY, False, PP_ALIGN.CENTER),
])


# ─────────────────────────────────────────────────
# Slide 3: 靈心完整流程
# ─────────────────────────────────────────────────
slide = prs.slides.add_slide(blank)
slide_bg(slide, prs)

add_text(slide, Inches(0.3), Inches(0.1), Inches(12.7), Inches(0.35),
         "靈心 🌍 完整流程 — 靈寵感應地靈之氣", font_size=18, color=GREEN, bold=True, alignment=PP_ALIGN.CENTER)

steps = [
    ("① 觸發", "羅盤+GPS 面板"),
    ("② 分析中", "靈寵感應中..."),
    ("③ 結果", "靈寵告訴你風水"),
]
for i, (label, desc) in enumerate(steps):
    x = Inches(0.5) + Inches(i * 4.3)
    add_text(slide, x, Inches(0.5), Inches(3.8), Inches(0.2),
             f"{label}  {desc}", font_size=8, color=GRAY, alignment=PP_ALIGN.CENTER)

# Phone E: heart trigger
plE, ptE = draw_phone(slide, Inches(2.2), Inches(4.0), "")
draw_status_bar(slide, plE, ptE)
abE = draw_avatar_heart(slide, plE, ptE)
fp_top = abE + Inches(0.06)
fp_h = Inches(2.1)
add_rounded_rect(slide, plE + Inches(0.08), fp_top, PHONE_W - Inches(0.16), fp_h,
                 PANEL_BG, GREEN, Pt(1))
# GPS
add_text(slide, plE + Inches(0.14), fp_top + Inches(0.04), PHONE_W - Inches(0.3), Inches(0.12),
         "● GPS: 台北市 25°N 121°E", font_size=5, color=GREEN)
# Mini compass
comp_cx = plE + PHONE_W // 2
comp_y = fp_top + Inches(0.5)
add_circle(slide, comp_cx - Inches(0.4), comp_y, Inches(0.8),
           RGBColor(0x15, 0x20, 0x15), GREEN, Pt(1))
for label, dx, dy in [("北", 0, -0.32), ("南", 0, 0.32), ("東", 0.32, 0), ("西", -0.32, 0)]:
    c = GOLD if label in ("東", "南") else WHITE
    add_text(slide, comp_cx + Inches(dx) - Inches(0.08), comp_y + Inches(0.35) + Inches(dy),
             Inches(0.2), Inches(0.14), label, font_size=5, color=c, bold=True, alignment=PP_ALIGN.CENTER)
add_text(slide, comp_cx - Inches(0.05), comp_y + Inches(0.3), Inches(0.12), Inches(0.14),
         "▲", font_size=8, color=GREEN, alignment=PP_ALIGN.CENTER)
# Lucky/danger
add_text(slide, plE + Inches(0.14), fp_top + Inches(1.4), Inches(1.2), Inches(0.12),
         "吉: 東南 西 東", font_size=5, color=GOLD, bold=True)
add_text(slide, plE + Inches(1.3), fp_top + Inches(1.4), Inches(1.0), Inches(0.12),
         "凶: 西北", font_size=5, color=RED_DIM)
# Analyze button
add_rounded_rect(slide, plE + Inches(0.25), fp_top + Inches(1.6), PHONE_W - Inches(0.6), Inches(0.22),
                 BTN_BG, GREEN, Pt(1))
add_text(slide, plE + Inches(0.25), fp_top + Inches(1.62), PHONE_W - Inches(0.6), Inches(0.18),
         "🧭 分析此地風水", font_size=6, color=GREEN, bold=True, alignment=PP_ALIGN.CENTER)
# Pet hint
add_text(slide, plE + Inches(0.14), fp_top + Inches(1.88), PHONE_W - Inches(0.3), Inches(0.12),
         "🦌 我感受到這裡的氣場...", font_size=5, color=GREEN)
draw_chat_bubbles(slide, plE, fp_top + fp_h + Inches(0.05), ptE + Inches(5.0), [
    ("讓我感應這個地方的靈氣～", GREEN),
])
draw_action_bar(slide, plE, ptE, 'heart')

# Phone F: analyzing
plF, ptF = draw_phone(slide, Inches(6.5), Inches(4.0), "")
draw_status_bar(slide, plF, ptF)
abF = draw_avatar_heart(slide, plF, ptF)
fp_top = abF + Inches(0.06)
add_rounded_rect(slide, plF + Inches(0.08), fp_top, PHONE_W - Inches(0.16), Inches(0.7),
                 PANEL_BG, GREEN, Pt(1))
add_text(slide, plF + Inches(0.14), fp_top + Inches(0.06), PHONE_W - Inches(0.3), Inches(0.14),
         "🦌 正在感應這片土地...", font_size=6, color=GREEN, bold=True)
add_rounded_rect(slide, plF + Inches(0.18), fp_top + Inches(0.28), PHONE_W - Inches(0.4), Inches(0.1), PROGRESS_BG)
add_rounded_rect(slide, plF + Inches(0.18), fp_top + Inches(0.28), Inches(1.2), Inches(0.1), GREEN)
add_text(slide, plF + Inches(0.14), fp_top + Inches(0.45), PHONE_W - Inches(0.3), Inches(0.12),
         "讀取地理能量中...", font_size=5, color=GRAY)
draw_chat_bubbles(slide, plF, fp_top + Inches(0.75), ptF + Inches(5.0), [
    ("嗯...這裡的東南方有股旺氣...", GREEN),
])
draw_action_bar(slide, plF, ptF, 'heart')

# Phone G: result in chat
plG, ptG = draw_phone(slide, Inches(10.8), Inches(4.0), "")
draw_status_bar(slide, plG, ptG)
abG = draw_avatar_normal(slide, plG, ptG)
draw_chat_bubbles(slide, plG, abG + Inches(0.05), ptG + Inches(5.0), [
    ("嗯...這裡的東南方有旺氣...", GREEN),
    ("主人，這個地方整體氣場不錯！\n東南方生氣旺盛，適合工作。\n建議座位朝東南方。\n\n[九宮格] 吉: 東南 西 東\n避開西北方，有煞氣。\n\n風水小貼士:\n桌上放盆綠色植物可以聚氣喔～", WHITE, True, GREEN),
])
draw_action_bar(slide, plG, ptG)

draw_arrow(slide, Inches(4.0), Inches(3.7), GREEN)
draw_arrow(slide, Inches(8.4), Inches(3.7), GREEN)

add_multiline(slide, Inches(0.3), Inches(6.7), Inches(12.7), Inches(0.4), [
    ("GPS + 羅盤 + 奇門遁甲計算全在 FeaturePanel 中完成。結果由靈寵以對話口吻告訴使用者，嵌入九宮格+方位資訊。", 8, GRAY, False, PP_ALIGN.CENTER),
])


# ─────────────────────────────────────────────────
# Slide 4: 靈魂完整流程
# ─────────────────────────────────────────────────
slide = prs.slides.add_slide(blank)
slide_bg(slide, prs)

add_text(slide, Inches(0.3), Inches(0.1), Inches(12.7), Inches(0.35),
         "靈魂 🏮 完整流程 — 靈寵為你通靈問卦", font_size=18, color=PURPLE, bold=True, alignment=PP_ALIGN.CENTER)

steps = [
    ("① 選擇類別", "問什麼問題"),
    ("② 搖卦中", "靈寵通靈"),
    ("③ 結果", "靈寵解卦"),
]
for i, (label, desc) in enumerate(steps):
    x = Inches(0.5) + Inches(i * 4.3)
    add_text(slide, x, Inches(0.5), Inches(3.8), Inches(0.2),
             f"{label}  {desc}", font_size=8, color=GRAY, alignment=PP_ALIGN.CENTER)

# Phone H: pearl idle
plH, ptH = draw_phone(slide, Inches(2.2), Inches(4.0), "")
draw_status_bar(slide, plH, ptH)
abH = draw_avatar_pearl(slide, plH, ptH)
fp_top = abH + Inches(0.06)
fp_h = Inches(1.65)
add_rounded_rect(slide, plH + Inches(0.08), fp_top, PHONE_W - Inches(0.16), fp_h,
                 PANEL_BG, PURPLE, Pt(1))
# Categories
cats = [("💼", "事業"), ("❤️", "感情"), ("🏠", "家庭"), ("🏥", "健康"), ("📚", "學業")]
for i, (em, lb) in enumerate(cats):
    x = plH + Inches(0.12) + Inches(i * 0.48)
    bc = PURPLE if i == 0 else None
    add_rounded_rect(slide, x, fp_top + Inches(0.06), Inches(0.42), Inches(0.38), BTN_BG, bc, Pt(1) if bc else Pt(0))
    add_text(slide, x, fp_top + Inches(0.08), Inches(0.42), Inches(0.2),
             em, font_size=11, alignment=PP_ALIGN.CENTER)
    add_text(slide, x, fp_top + Inches(0.26), Inches(0.42), Inches(0.14),
             lb, font_size=4, color=PURPLE if i == 0 else GRAY_DIM, alignment=PP_ALIGN.CENTER)
# Question input
add_rounded_rect(slide, plH + Inches(0.14), fp_top + Inches(0.52), PHONE_W - Inches(0.32), Inches(0.3),
                 RGBColor(0x18, 0x12, 0x2E), RGBColor(0x44, 0x38, 0x66), Pt(1))
add_text(slide, plH + Inches(0.2), fp_top + Inches(0.56), PHONE_W - Inches(0.45), Inches(0.2),
         "輸入問題 (選填)...", font_size=5, color=GRAY_DIM)
# Start button
add_rounded_rect(slide, plH + Inches(0.25), fp_top + Inches(0.92), PHONE_W - Inches(0.6), Inches(0.24),
                 BTN_BG, PURPLE, Pt(1))
add_text(slide, plH + Inches(0.25), fp_top + Inches(0.94), PHONE_W - Inches(0.6), Inches(0.2),
         "🏮 起卦問靈", font_size=7, color=PURPLE, bold=True, alignment=PP_ALIGN.CENTER)
# Pet hint
add_text(slide, plH + Inches(0.14), fp_top + Inches(1.25), PHONE_W - Inches(0.3), Inches(0.12),
         "🦌 心誠則靈，想好問題了嗎？", font_size=5, color=PURPLE)
draw_chat_bubbles(slide, plH, fp_top + fp_h + Inches(0.05), ptH + Inches(5.0), [
    ("主人想問什麼呢？", PURPLE),
])
draw_action_bar(slide, plH, ptH, 'pearl')

# Phone I: shaking
plI, ptI = draw_phone(slide, Inches(6.5), Inches(4.0), "")
draw_status_bar(slide, plI, ptI)
abI = draw_avatar_pearl(slide, plI, ptI)
fp_top = abI + Inches(0.06)
add_rounded_rect(slide, plI + Inches(0.08), fp_top, PHONE_W - Inches(0.16), Inches(1.1),
                 PANEL_BG, PURPLE, Pt(2))
add_text(slide, plI + Inches(0.14), fp_top + Inches(0.08), PHONE_W - Inches(0.3), Inches(0.25),
         "☰ ☷ ☳ ☴ ☵ ☲ ☶ ☱", font_size=12, color=PURPLE, bold=True, alignment=PP_ALIGN.CENTER)
add_text(slide, plI + Inches(0.14), fp_top + Inches(0.4), PHONE_W - Inches(0.3), Inches(0.16),
         "卦象凝聚中...", font_size=8, color=PURPLE, bold=True, alignment=PP_ALIGN.CENTER)
add_text(slide, plI + Inches(0.14), fp_top + Inches(0.6), PHONE_W - Inches(0.3), Inches(0.14),
         "🦌 正在為主人通靈...", font_size=6, color=WHITE, alignment=PP_ALIGN.CENTER)
add_text(slide, plI + Inches(0.14), fp_top + Inches(0.8), PHONE_W - Inches(0.3), Inches(0.12),
         "搖卦中 + 震動反饋", font_size=5, color=GRAY_DIM, alignment=PP_ALIGN.CENTER)
draw_chat_bubbles(slide, plI, fp_top + Inches(1.15), ptI + Inches(5.0), [
    ("感應到了...卦象正在成形...", PURPLE),
])
draw_action_bar(slide, plI, ptI, 'pearl')

# Phone J: result in chat
plJ, ptJ = draw_phone(slide, Inches(10.8), Inches(4.0), "")
draw_status_bar(slide, plJ, ptJ)
abJ = draw_avatar_normal(slide, plJ, ptJ)
draw_chat_bubbles(slide, plJ, abJ + Inches(0.05), ptJ + Inches(5.0), [
    ("感應到了...卦象成形了！", PURPLE),
    ("主人，你的卦象是...\n\n☰ 第一卦 · 乾\n「元亨利貞」\n\n事業: 大吉\n天行健，君子以自強不息。\n近期是發展事業的好時機！\n\n上卦 乾  下卦 乾  五行 金", WHITE, True, PURPLE),
    ("有什麼其他想問的嗎？", GOLD),
])
draw_action_bar(slide, plJ, ptJ)

draw_arrow(slide, Inches(4.0), Inches(3.7), PURPLE)
draw_arrow(slide, Inches(8.4), Inches(3.7), PURPLE)

add_multiline(slide, Inches(0.3), Inches(6.7), Inches(12.7), Inches(0.4), [
    ("六十四卦計算在本地完成（不呼叫 API）。搖卦時靈寵帶動畫+震動。結果由靈寵以對話口吻「解卦」，嵌入卦象符號+解讀。", 8, GRAY, False, PP_ALIGN.CENTER),
])


# ─────────────────────────────────────────────────
# Slide 5: PetAvatar 三種特效動畫
# ─────────────────────────────────────────────────
slide = prs.slides.add_slide(blank)
slide_bg(slide, prs)

add_text(slide, Inches(0.3), Inches(0.1), Inches(12.7), Inches(0.35),
         "PetAvatar 特效 — 靈寵在「做事」的視覺回饋", font_size=18, color=GOLD, bold=True, alignment=PP_ALIGN.CENTER)
add_text(slide, Inches(0.3), Inches(0.45), Inches(12.7), Inches(0.25),
         "使用者看到靈寵發光/旋轉，就知道「靈寵正在幫我做事」", font_size=10, color=GRAY, alignment=PP_ALIGN.CENTER)

# Normal
plN, ptN = draw_phone(slide, Inches(1.8), Inches(4.0), "正常 — 浮動呼吸")
draw_status_bar(slide, plN, ptN)
draw_avatar_normal(slide, plN, ptN)
add_multiline(slide, plN + Inches(0.1), ptN + Inches(2.0), PHONE_W - Inches(0.2), Inches(1.5), [
    ("浮動動畫", 8, GRAY, True, PP_ALIGN.CENTER),
    ("Y 軸 0 ~ -6px", 7, GRAY_DIM, False, PP_ALIGN.CENTER),
    ("sin 曲線 1500ms", 7, GRAY_DIM, False, PP_ALIGN.CENTER),
    ("", 4),
    ("金色半透明邊框", 7, GRAY_DIM, False, PP_ALIGN.CENTER),
])
draw_action_bar(slide, plN, ptN)

# Eye
plE2, ptE2 = draw_phone(slide, Inches(4.95), Inches(4.0), "靈眼 — 金色脈衝")
draw_status_bar(slide, plE2, ptE2)
draw_avatar_eye(slide, plE2, ptE2)
add_multiline(slide, plE2 + Inches(0.1), ptE2 + Inches(2.0), PHONE_W - Inches(0.2), Inches(1.8), [
    ("靈眼特效", 8, EYE_GOLD, True, PP_ALIGN.CENTER),
    ("", 3),
    ("金色脈衝邊框", 7, WHITE, False, PP_ALIGN.CENTER),
    ("(borderColor 呼吸動畫)", 6, GRAY_DIM, False, PP_ALIGN.CENTER),
    ("", 3),
    ("上方 👁 符號浮現", 7, WHITE, False, PP_ALIGN.CENTER),
    ("(fadeIn + float)", 6, GRAY_DIM, False, PP_ALIGN.CENTER),
    ("", 3),
    ("金色 ✨ 微光環繞", 7, WHITE, False, PP_ALIGN.CENTER),
])
draw_action_bar(slide, plE2, ptE2, 'eye')

# Heart
plH2, ptH2 = draw_phone(slide, Inches(8.1), Inches(4.0), "靈心 — 綠色羅盤")
draw_status_bar(slide, plH2, ptH2)
draw_avatar_heart(slide, plH2, ptH2)
add_multiline(slide, plH2 + Inches(0.1), ptH2 + Inches(2.0), PHONE_W - Inches(0.2), Inches(1.8), [
    ("靈心特效", 8, GREEN, True, PP_ALIGN.CENTER),
    ("", 3),
    ("綠色能量光暈邊框", 7, WHITE, False, PP_ALIGN.CENTER),
    ("(borderColor 呼吸)", 6, GRAY_DIM, False, PP_ALIGN.CENTER),
    ("", 3),
    ("方位符號旋轉環繞", 7, WHITE, False, PP_ALIGN.CENTER),
    ("(rotate loop 8s)", 6, GRAY_DIM, False, PP_ALIGN.CENTER),
    ("", 3),
    ("8 方位 N/E/S/W 標示", 7, WHITE, False, PP_ALIGN.CENTER),
])
draw_action_bar(slide, plH2, ptH2, 'heart')

# Pearl
plP2, ptP2 = draw_phone(slide, Inches(11.25), Inches(4.0), "靈魂 — 紫色八卦")
draw_status_bar(slide, plP2, ptP2)
draw_avatar_pearl(slide, plP2, ptP2)
add_multiline(slide, plP2 + Inches(0.1), ptP2 + Inches(2.0), PHONE_W - Inches(0.2), Inches(1.8), [
    ("靈魂特效", 8, PURPLE, True, PP_ALIGN.CENTER),
    ("", 3),
    ("紫色神秘光暈邊框", 7, WHITE, False, PP_ALIGN.CENTER),
    ("(borderColor 呼吸)", 6, GRAY_DIM, False, PP_ALIGN.CENTER),
    ("", 3),
    ("八卦符號旋轉環繞", 7, WHITE, False, PP_ALIGN.CENTER),
    ("(rotate loop 6s)", 6, GRAY_DIM, False, PP_ALIGN.CENTER),
    ("", 3),
    ("搖卦時加速 + 震動", 7, WHITE, False, PP_ALIGN.CENTER),
])
draw_action_bar(slide, plP2, ptP2, 'pearl')


# ─────────────────────────────────────────────────
# Slide 6: 架構對照 + 資訊流
# ─────────────────────────────────────────────────
slide = prs.slides.add_slide(blank)
slide_bg(slide, prs)

add_text(slide, Inches(0.3), Inches(0.1), Inches(12.7), Inches(0.35),
         "架構變更 + 資訊流", font_size=18, color=GOLD, bold=True, alignment=PP_ALIGN.CENTER)

# Before
add_rounded_rect(slide, Inches(0.3), Inches(0.7), Inches(5.8), Inches(3.2), RGBColor(0x14, 0x0E, 0x28), RED_DIM, Pt(2))
add_multiline(slide, Inches(0.5), Inches(0.8), Inches(5.4), Inches(3.0), [
    ("BEFORE — 全螢幕 Modal 覆蓋", 13, RED_DIM, True),
    ("", 5),
    ("使用者 → 點靈眼 → 全螢幕 Modal", 10, WHITE),
    ("        → 看到相機（看不到靈寵）", 10, GRAY),
    ("        → 看到結果頁（看不到靈寵）", 10, GRAY),
    ("        → 點關閉 → 回到主畫面", 10, GRAY),
    ("        → 結果以氣泡出現在 chat", 10, GRAY),
    ("", 4),
    ("問題:", 10, RED_DIM, True),
    ("  離開主畫面後，靈寵消失", 9, WHITE),
    ("  結果在 Modal 裡看一次，回 chat 又看一次", 9, WHITE),
    ("  靈寵只是「背景角色」，沒有主導感", 9, WHITE),
    ("  資訊流: 功能→結果頁→關閉→chat (斷裂)", 9, WHITE),
])

# After
add_rounded_rect(slide, Inches(7.0), Inches(0.7), Inches(6.0), Inches(3.2), RGBColor(0x14, 0x0E, 0x28), GREEN, Pt(2))
add_multiline(slide, Inches(7.2), Inches(0.8), Inches(5.6), Inches(3.0), [
    ("AFTER — 靈寵 = 唯一介面", 13, GREEN, True),
    ("", 5),
    ("使用者 → 點靈眼 → 靈寵眼睛發光", 10, WHITE),
    ("        → 小面板出現「拍照」按鈕", 10, GREEN),
    ("        → 拍完 → 靈寵開始解讀", 10, GREEN),
    ("        → 結果由靈寵「說出來」", 10, GREEN),
    ("        → 自動加入 chat 氣泡", 10, GREEN),
    ("", 4),
    ("改善:", 10, GREEN, True),
    ("  靈寵全程可見，是「做事的人」", 9, WHITE),
    ("  使用者始終在主畫面", 9, WHITE),
    ("  靈寵是通靈者，所有結果透過牠傳達", 9, WHITE),
    ("  資訊流: 觸發→靈寵動畫→chat 氣泡 (連續)", 9, WHITE),
])

# Data flow diagram
add_rounded_rect(slide, Inches(0.3), Inches(4.2), Inches(12.7), Inches(3.0), RGBColor(0x14, 0x0E, 0x28), GOLD, Pt(1))
add_text(slide, Inches(0.5), Inches(4.3), Inches(4.0), Inches(0.25),
         "資訊流 (After)", font_size=12, color=GOLD, bold=True)

# Flow boxes
flow = [
    ("使用者\n點 ActionBar", WHITE, None),
    ("PetAvatar\n特效啟動", EYE_GOLD, EYE_GOLD),
    ("FeaturePanel\n(輕量互動)", GREEN, GREEN),
    ("API / 計算", GRAY, GRAY),
    ("靈寵邊做\n邊說對白", BLUE_PET, BLUE_PET),
    ("結果 = 靈寵\n的 chat 氣泡", GOLD, GOLD),
]
for i, (text, color, border) in enumerate(flow):
    x = Inches(0.5) + Inches(i * 2.1)
    y = Inches(4.8)
    add_rounded_rect(slide, x, y, Inches(1.7), Inches(0.7),
                     RGBColor(0x1E, 0x17, 0x33), border, Pt(1) if border else Pt(0))
    add_text(slide, x + Inches(0.05), y + Inches(0.08), Inches(1.6), Inches(0.55),
             text, font_size=8, color=color, bold=True, alignment=PP_ALIGN.CENTER)
    if i < len(flow) - 1:
        add_text(slide, x + Inches(1.72), y + Inches(0.18), Inches(0.3), Inches(0.25),
                 "→", font_size=14, color=GOLD, alignment=PP_ALIGN.CENTER)

# Key point
add_multiline(slide, Inches(0.5), Inches(5.8), Inches(12.0), Inches(1.0), [
    ("", 4),
    ("重點: 沒有「結果頁面」這個概念。", 11, GOLD, True),
    ("分析完成 → FeaturePanel 自動消失 → PetAvatar 回歸正常 → 結果以靈寵對話氣泡出現在 PetChat。", 9, WHITE),
    ("靈寵在分析過程中會「邊做邊說」(中間對白)，讓使用者感受到靈寵正在工作。", 9, GRAY),
])


# ─────────────────────────────────────────────────
# Slide 7: 檔案修改清單
# ─────────────────────────────────────────────────
slide = prs.slides.add_slide(blank)
slide_bg(slide, prs)

add_text(slide, Inches(0.3), Inches(0.1), Inches(12.7), Inches(0.35),
         "實作計畫：檔案修改清單", font_size=18, color=GOLD, bold=True, alignment=PP_ALIGN.CENTER)

files_data = [
    ("檔案", "變更", 11, GOLD, True),
    ("", "", 3, GRAY, False),
    ("pet.tsx", "移除 showEye/showHeart/showPearl → activeFeature: 'eye'|'heart'|'pearl'|null", 9, WHITE, False),
    ("", "移除 3 個 <Modal> 包裝的 Feature 元件", 8, GRAY, False),
    ("", "新增 <FeaturePanel> 嵌入 PetAvatar 與 PetChat 之間", 8, GRAY, False),
    ("", "傳 activeFeature prop 給 PetAvatar", 8, GRAY, False),
    ("", "", 3, GRAY, False),
    ("PetAvatar.tsx", "新增 activeFeature prop + 三種動畫特效", 9, WHITE, False),
    ("", "金色脈衝(eye) / 綠色羅盤旋轉(heart) / 紫色八卦旋轉(pearl)", 8, GRAY, False),
    ("", "Animated API: 脈衝邊框 + 旋轉符號 + 光暈呼吸", 8, GRAY, False),
    ("", "", 3, GRAY, False),
    ("FeaturePanel.tsx (新)", "整合三功能的內嵌互動面板", 9, GREEN, True),
    ("", "EyePanel: 拍照按鈕 → 小相機彈窗 → 分析進度", 8, GRAY, False),
    ("", "HeartPanel: GPS + 迷你羅盤 + 分析按鈕", 8, GRAY, False),
    ("", "PearlPanel: 類別選擇 + 問題輸入 + 搖卦", 8, GRAY, False),
    ("", "所有結果 → onResult callback → addMessage (chat 氣泡)", 8, GREEN, False),
    ("", "", 3, GRAY, False),
    ("PetEyeMode.tsx", "保留 API 呼叫 + 進度邏輯；移除全螢幕 UI + Modal", 9, WHITE, False),
    ("PetHeartMode.tsx", "保留 GPS/磁力計/奇門遁甲邏輯；移除全螢幕 UI + Modal", 9, WHITE, False),
    ("PetPearlMode.tsx", "保留占卜引擎邏輯；移除全螢幕 UI + Modal", 9, WHITE, False),
]

y = Inches(0.6)
for row in files_data:
    col1 = row[0]
    col2 = row[1]
    size = row[2]
    color = row[3]
    bold = row[4]
    if col1:
        add_text(slide, Inches(0.5), y, Inches(2.5), Inches(0.25),
                 col1, font_size=size, color=color, bold=bold)
    if col2:
        add_text(slide, Inches(3.0), y, Inches(9.5), Inches(0.25),
                 col2, font_size=size, color=color, bold=bold)
    y += Inches(0.26)


# ── Save ──
output_path = r"C:\Dev\LingXi\LingXi_UI_Restructure_Mockup.pptx"
prs.save(output_path)
print(f"Saved: {output_path}")
print(f"7 slides generated")
