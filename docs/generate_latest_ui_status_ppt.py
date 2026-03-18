from pathlib import Path

from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import PP_ALIGN
from pptx.util import Inches, Pt


DATE_STR = "2026-03-14"
APP_VERSION = "v1.0.0"
BRANCH = "main"
BASE_COMMIT = "fd9d2fa"
SOURCE_TAG = "main / fd9d2fa + 本地未提交 UI 重構"
OUTPUT_PATH = Path(__file__).resolve().parent / f"LingXi_UI_Operation_Status_{DATE_STR}_{APP_VERSION}.pptx"

BG = RGBColor(0x08, 0x08, 0x0F)
SURFACE = RGBColor(0x12, 0x10, 0x1B)
SURFACE_2 = RGBColor(0x19, 0x15, 0x28)
PANEL = RGBColor(0x10, 0x0D, 0x18)
GOLD = RGBColor(0xE8, 0xC5, 0x47)
GOLD_SOFT = RGBColor(0xC4, 0xB0, 0x7A)
TEXT = RGBColor(0xF3, 0xEC, 0xD4)
MUTED = RGBColor(0x8B, 0x7D, 0x5E)
LINE = RGBColor(0x34, 0x2C, 0x1D)
BLUE = RGBColor(0x64, 0xB4, 0xFF)
GREEN = RGBColor(0x64, 0xC8, 0x80)
PURPLE = RGBColor(0xA7, 0x8B, 0xFA)
RED = RGBColor(0xC4, 0x40, 0x40)
FONT_BODY = "Microsoft JhengHei"
PHONE_W = 3.1
PHONE_H = 5.9

prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)
BLANK = prs.slide_layouts[6]


def set_bg(slide, color=BG):
    fill = slide.background.fill
    fill.solid()
    fill.fore_color.rgb = color


def add_rect(slide, left, top, width, height, fill, line_color=None, line_width=1.0):
    shape = slide.shapes.add_shape(
        MSO_SHAPE.ROUNDED_RECTANGLE,
        Inches(left),
        Inches(top),
        Inches(width),
        Inches(height),
    )
    shape.fill.solid()
    shape.fill.fore_color.rgb = fill
    if line_color:
        shape.line.color.rgb = line_color
        shape.line.width = Pt(line_width)
    else:
        shape.line.fill.background()
    try:
        shape.adjustments[0] = 0.08
    except Exception:
        pass
    return shape


def add_text(slide, left, top, width, height, text, size=14, color=TEXT, bold=False, align=PP_ALIGN.LEFT, font=FONT_BODY):
    box = slide.shapes.add_textbox(Inches(left), Inches(top), Inches(width), Inches(height))
    tf = box.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = text
    p.font.size = Pt(size)
    p.font.color.rgb = color
    p.font.bold = bold
    p.font.name = font
    p.alignment = align
    return box


def add_lines(slide, left, top, width, height, lines, font=FONT_BODY):
    box = slide.shapes.add_textbox(Inches(left), Inches(top), Inches(width), Inches(height))
    tf = box.text_frame
    tf.word_wrap = True
    for i, line in enumerate(lines):
        if isinstance(line, str):
            text, size, color, bold = line, 12, TEXT, False
        else:
            text = line[0]
            size = line[1] if len(line) > 1 else 12
            color = line[2] if len(line) > 2 else TEXT
            bold = line[3] if len(line) > 3 else False
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.text = text
        p.font.size = Pt(size)
        p.font.color.rgb = color
        p.font.bold = bold
        p.font.name = font
        p.space_after = Pt(2)
    return box


def add_chip(slide, left, top, width, text, fill, color=TEXT):
    add_rect(slide, left, top, width, 0.42, fill, None)
    add_text(slide, left, top + 0.07, width, 0.22, text, size=10, color=color, bold=True, align=PP_ALIGN.CENTER)


def add_footer(slide, page_no):
    add_rect(slide, 0.32, 7.0, 12.68, 0.22, SURFACE_2, LINE, 0.5)
    footer = f"{DATE_STR}  |  {APP_VERSION}  |  {SOURCE_TAG}"
    add_text(slide, 0.45, 7.03, 8.8, 0.15, footer, size=8, color=MUTED)
    add_text(slide, 12.2, 7.03, 0.5, 0.15, str(page_no), size=8, color=MUTED, align=PP_ALIGN.RIGHT)


def new_slide(title, subtitle=""):
    slide = prs.slides.add_slide(BLANK)
    set_bg(slide)
    add_text(slide, 0.42, 0.24, 9.8, 0.45, title, size=24, color=GOLD, bold=True)
    add_rect(slide, 0.42, 0.78, 12.48, 0.03, GOLD)
    if subtitle:
        add_text(slide, 0.45, 0.88, 11.8, 0.22, subtitle, size=10, color=GOLD_SOFT)
    add_footer(slide, len(prs.slides))
    return slide


def draw_phone(slide, left, top, title=""):
    add_rect(slide, left, top, PHONE_W, PHONE_H, RGBColor(0x0F, 0x0B, 0x16), RGBColor(0x3A, 0x32, 0x4B), 1.5)
    add_rect(slide, left + 0.14, top + 0.16, PHONE_W - 0.28, PHONE_H - 0.3, BG)
    add_rect(slide, left + 1.12, top + 0.04, 0.86, 0.08, SURFACE_2)
    if title:
        add_text(slide, left, top - 0.34, PHONE_W, 0.2, title, size=10, color=TEXT, bold=True, align=PP_ALIGN.CENTER)
    return left + 0.18, top + 0.22, PHONE_W - 0.36, PHONE_H - 0.42


def phone_status(slide, left, top, center_text, right_text):
    add_rect(slide, left, top, PHONE_W - 0.36, 0.42, SURFACE, None)
    add_text(slide, left + 0.08, top + 0.05, 0.7, 0.12, "靈犀", size=8, color=GOLD, bold=True)
    add_text(slide, left + 0.75, top + 0.05, 1.35, 0.12, center_text, size=6, color=MUTED, align=PP_ALIGN.CENTER)
    add_text(slide, left + 1.95, top + 0.05, 0.7, 0.12, right_text, size=6, color=GOLD_SOFT, align=PP_ALIGN.RIGHT)


def phone_tabs(slide, left, top, focus="pet"):
    y = top + PHONE_H - 0.72
    add_rect(slide, left, y, PHONE_W - 0.36, 0.48, SURFACE, None)
    pet_color = GOLD if focus == "pet" else MUTED
    profile_color = GOLD if focus == "profile" else MUTED
    add_text(slide, left + 0.74, y + 0.05, 0.45, 0.12, "🔮", size=16, align=PP_ALIGN.CENTER)
    add_text(slide, left + 0.68, y + 0.26, 0.6, 0.1, "靈寵", size=7, color=pet_color, align=PP_ALIGN.CENTER)
    add_text(slide, left + 1.78, y + 0.05, 0.45, 0.12, "⚙️", size=14, align=PP_ALIGN.CENTER)
    add_text(slide, left + 1.7, y + 0.26, 0.6, 0.1, "我的", size=7, color=profile_color, align=PP_ALIGN.CENTER)


def draw_panel(slide, left, top, width, height, title, accent, lines):
    add_rect(slide, left, top, width, height, PANEL, LINE, 0.8)
    add_text(slide, left + 0.18, top + 0.14, width - 0.36, 0.2, title, size=12, color=accent, bold=True)
    add_lines(slide, left + 0.2, top + 0.45, width - 0.4, height - 0.58, lines)


def draw_bubble(slide, left, top, width, height, header, body, accent=GOLD_SOFT):
    add_text(slide, left, top - 0.12, width, 0.12, header, size=6, color=MUTED)
    add_rect(slide, left, top, width, height, SURFACE_2, accent, 0.8)
    add_text(slide, left + 0.1, top + 0.08, width - 0.2, height - 0.14, body, size=7, color=TEXT)


def draw_flow_boxes(slide):
    items = [
        ("Splash / Font Load", 0.75, 1.55, 2.05, 0.64, GOLD),
        ("Auth Check\ncheckAuth + initSubscription", 3.05, 1.55, 2.45, 0.9, BLUE),
        ("未登入\n/auth", 6.0, 1.25, 1.8, 0.7, RED),
        ("已登入未完成引導\n/onboarding", 6.0, 2.15, 1.8, 0.7, GREEN),
        ("已完成\n/(tabs)/pet", 6.0, 3.05, 1.8, 0.7, GOLD),
    ]
    for text, left, top, width, height, color in items:
        add_rect(slide, left, top, width, height, SURFACE, color, 1.0)
        add_text(slide, left + 0.08, top + 0.16, width - 0.16, height - 0.2, text, size=10, color=TEXT, bold=True, align=PP_ALIGN.CENTER)
    for ax, ay in [(2.82, 1.84), (5.58, 1.58), (5.58, 2.48), (5.58, 3.38)]:
        add_text(slide, ax, ay, 0.36, 0.2, "→", size=22, color=GOLD, align=PP_ALIGN.CENTER)


def draw_auth_phone(slide, left, top):
    x, y, _, _ = draw_phone(slide, left, top, "Auth / Login")
    add_text(slide, x, y + 0.12, 2.36, 0.3, "靈犀", size=22, color=GOLD, bold=True, align=PP_ALIGN.CENTER)
    add_text(slide, x, y + 0.48, 2.36, 0.14, "LING XI", size=8, color=GOLD_SOFT, align=PP_ALIGN.CENTER)
    add_rect(slide, x + 0.1, y + 0.86, 2.16, 0.38, RGBColor(0xF4, 0xF4, 0xF4), None)
    add_text(slide, x + 0.1, y + 0.98, 2.16, 0.08, "Sign in with Apple", size=7, color=RGBColor(0x14, 0x14, 0x14), bold=True, align=PP_ALIGN.CENTER)
    add_text(slide, x + 1.0, y + 1.32, 0.4, 0.08, "或", size=7, color=MUTED, align=PP_ALIGN.CENTER)
    for idx, label in enumerate(["電子郵件", "密碼", "登入 / 註冊切換"]):
        box_y = y + 1.58 + idx * 0.55
        add_text(slide, x + 0.06, box_y - 0.1, 0.9, 0.08, label, size=6, color=GOLD_SOFT)
        add_rect(slide, x + 0.06, box_y, 2.24, 0.34, SURFACE, LINE, 0.6)
    add_rect(slide, x + 0.06, y + 3.32, 2.24, 0.4, RGBColor(0x28, 0x24, 0x12), GOLD, 0.8)
    add_text(slide, x + 0.06, y + 3.44, 2.24, 0.1, "主按鈕", size=8, color=GOLD, bold=True, align=PP_ALIGN.CENTER)
    add_rect(slide, x + 0.06, y + 4.0, 2.24, 0.36, RGBColor(0x27, 0x11, 0x11), RED, 0.6)
    add_text(slide, x + 0.14, y + 4.1, 2.0, 0.14, "錯誤提示區 / Loading Overlay", size=7, color=TEXT)


def draw_onboarding_phone(slide, left, top):
    x, y, _, _ = draw_phone(slide, left, top, "Onboarding / Step 3")
    for i in range(5):
        color = GOLD if i == 3 else SURFACE_2
        add_rect(slide, x + 0.1 + i * 0.42, y + 0.06, 0.28, 0.08, color, None)
    add_text(slide, x + 0.08, y + 0.24, 2.2, 0.14, "出生資料", size=12, color=GOLD, bold=True)
    add_text(slide, x + 0.08, y + 0.43, 2.0, 0.12, "曆法 / 日期 / 時辰 / 性別", size=7, color=MUTED)
    add_text(slide, x + 0.08, y + 0.72, 0.48, 0.08, "曆法", size=6, color=GOLD_SOFT)
    add_rect(slide, x + 0.08, y + 0.82, 1.04, 0.28, SURFACE_2, GOLD, 0.8)
    add_rect(slide, x + 1.18, y + 0.82, 1.04, 0.28, SURFACE, LINE, 0.6)
    add_text(slide, x + 0.08, y + 0.91, 1.04, 0.08, "陽曆", size=7, color=GOLD, bold=True, align=PP_ALIGN.CENTER)
    add_text(slide, x + 1.18, y + 0.91, 1.04, 0.08, "農曆", size=7, color=MUTED, align=PP_ALIGN.CENTER)
    for idx, label in enumerate(["1992", "6", "15"]):
        lx = x + 0.08 + idx * 0.72
        add_text(slide, lx + 0.04, y + 1.22, 0.4, 0.08, ["年", "月", "日"][idx], size=6, color=GOLD_SOFT)
        add_rect(slide, lx, y + 1.34, 0.56, 1.0, SURFACE, LINE, 0.6)
        add_text(slide, lx, y + 1.74, 0.56, 0.1, label, size=14, color=TEXT, bold=True, align=PP_ALIGN.CENTER)
    add_text(slide, x + 0.08, y + 2.5, 0.6, 0.08, "時辰", size=6, color=GOLD_SOFT)
    for idx, label in enumerate(["子時", "丑時", "不知道"]):
        fill = SURFACE_2 if idx == 2 else SURFACE
        border = GOLD if idx == 2 else LINE
        add_rect(slide, x + 0.08 + idx * 0.72, y + 2.62, 0.6, 0.26, fill, border, 0.6)
        add_text(slide, x + 0.08 + idx * 0.72, y + 2.71, 0.6, 0.08, label, size=6, color=TEXT, align=PP_ALIGN.CENTER)
    add_text(slide, x + 0.08, y + 3.08, 0.6, 0.08, "性別", size=6, color=GOLD_SOFT)
    add_rect(slide, x + 0.08, y + 3.2, 1.06, 0.28, SURFACE_2, GOLD, 0.8)
    add_rect(slide, x + 1.16, y + 3.2, 1.06, 0.28, SURFACE, LINE, 0.6)
    add_text(slide, x + 0.08, y + 3.3, 1.06, 0.08, "♂ 男", size=7, color=GOLD, bold=True, align=PP_ALIGN.CENTER)
    add_text(slide, x + 1.16, y + 3.3, 1.06, 0.08, "♀ 女", size=7, color=MUTED, align=PP_ALIGN.CENTER)
    add_rect(slide, x + 0.08, y + 4.02, 2.12, 0.38, RGBColor(0x28, 0x24, 0x12), GOLD, 0.8)
    add_text(slide, x + 0.08, y + 4.14, 2.12, 0.08, "召喚靈寵", size=8, color=GOLD, bold=True, align=PP_ALIGN.CENTER)


def draw_pet_home_phone(slide, left, top):
    x, y, _, _ = draw_phone(slide, left, top, "Pet Center / Default")
    phone_status(slide, x, y, "3月14日 · 卯時", "Lv.3 小鹿靈")
    add_text(slide, x + 0.92, y + 0.6, 0.5, 0.2, "🦌", size=28, align=PP_ALIGN.CENTER)
    add_text(slide, x + 0.7, y + 0.96, 0.92, 0.1, "小鹿靈  Lv.3  · 木系", size=7, color=GOLD, bold=True, align=PP_ALIGN.CENTER)
    add_rect(slide, x + 0.42, y + 1.16, 1.56, 0.05, SURFACE_2, None)
    add_rect(slide, x + 0.42, y + 1.16, 0.94, 0.05, GOLD, None)
    draw_bubble(slide, x + 0.08, y + 1.48, 2.12, 0.72, "🦌 小鹿靈 08:30", "今天財運偏穩，先動後靜較順。吉方可先看東南，色彩以青綠、米金最合。")
    draw_bubble(slide, x + 0.08, y + 2.36, 2.12, 0.6, "🦌 小鹿靈 08:31", "餵食後精神好多了，今天更願意幫你觀察細節。", BLUE)
    add_rect(slide, x, y + 4.36, 2.36, 0.48, SURFACE, None)
    for idx, txt in enumerate(["🍖 餵食", "🎾 玩耍", "🧘 冥想"]):
        add_rect(slide, x + 0.06 + idx * 0.76, y + 4.42, 0.68, 0.18, SURFACE_2, LINE, 0.5)
        add_text(slide, x + 0.06 + idx * 0.76, y + 4.47, 0.68, 0.08, txt, size=5, color=TEXT, align=PP_ALIGN.CENTER)
    for idx, txt in enumerate(["👁 靈眼", "🌍 靈心", "🏮 靈魂"]):
        border = GOLD if idx == 0 else LINE
        color = GOLD if idx == 0 else GOLD_SOFT
        add_rect(slide, x + 0.06 + idx * 0.76, y + 4.64, 0.68, 0.16, SURFACE_2, border, 0.6)
        add_text(slide, x + 0.06 + idx * 0.76, y + 4.68, 0.68, 0.08, txt, size=5, color=color, align=PP_ALIGN.CENTER)
    phone_tabs(slide, x, y, "pet")


def draw_eye_phone(slide, left, top):
    x, y, _, _ = draw_phone(slide, left, top, "Feature / Eye")
    phone_status(slide, x, y, "靈眼模式", "Quota: eye")
    add_rect(slide, x + 0.08, y + 0.58, 2.12, 1.86, SURFACE_2, GOLD, 0.8)
    add_rect(slide, x + 0.58, y + 0.94, 1.1, 1.15, SURFACE, GOLD_SOFT, 0.8)
    add_text(slide, x + 0.98, y + 1.32, 0.3, 0.2, "👤", size=26, color=MUTED, align=PP_ALIGN.CENTER)
    add_text(slide, x + 0.22, y + 2.56, 1.9, 0.1, "需要相機權限 / 前鏡頭取樣", size=7, color=MUTED, align=PP_ALIGN.CENTER)
    add_rect(slide, x + 0.08, y + 2.82, 2.12, 0.36, RGBColor(0x11, 0x1C, 0x29), BLUE, 0.8)
    add_text(slide, x + 0.18, y + 2.92, 1.92, 0.12, "🦌 小鹿靈正在看你的氣色", size=7, color=BLUE)
    add_rect(slide, x + 0.08, y + 3.38, 2.12, 0.12, SURFACE_2, None)
    add_rect(slide, x + 0.08, y + 3.38, 1.62, 0.12, GOLD, None)
    add_text(slide, x + 0.92, y + 3.58, 0.5, 0.1, "72%", size=10, color=GOLD, bold=True, align=PP_ALIGN.CENTER)
    add_rect(slide, x + 0.08, y + 4.1, 2.12, 0.4, RGBColor(0x28, 0x24, 0x12), GOLD, 0.8)
    add_text(slide, x + 0.08, y + 4.22, 2.12, 0.08, "👁 開始分析", size=8, color=GOLD, bold=True, align=PP_ALIGN.CENTER)


def draw_heart_phone(slide, left, top):
    x, y, _, _ = draw_phone(slide, left, top, "Feature / Heart")
    phone_status(slide, x, y, "靈心模式", "Quota: heart")
    add_rect(slide, x + 0.08, y + 0.56, 2.12, 0.46, RGBColor(0x11, 0x1F, 0x17), GREEN, 0.8)
    add_text(slide, x + 0.16, y + 0.67, 1.7, 0.12, "GPS / 座標 / 地名定位中", size=7, color=GREEN)
    add_text(slide, x + 0.16, y + 0.82, 1.7, 0.12, "🦌 小鹿靈正在感應四方氣場", size=6, color=TEXT)
    add_rect(slide, x + 0.58, y + 1.2, 1.1, 1.1, SURFACE, GOLD_SOFT, 1.0)
    add_text(slide, x + 0.96, y + 1.62, 0.34, 0.2, "🧭", size=26, align=PP_ALIGN.CENTER)
    for label, lx, ly, color in [("北", 1.01, 1.22, TEXT), ("東", 1.56, 1.69, GOLD), ("南", 1.01, 2.14, RED), ("西", 0.48, 1.69, TEXT)]:
        add_text(slide, x + lx, y + ly, 0.16, 0.1, label, size=7, color=color, align=PP_ALIGN.CENTER)
    add_rect(slide, x + 0.08, y + 2.56, 1.0, 0.56, SURFACE_2, GOLD, 0.7)
    add_rect(slide, x + 1.2, y + 2.56, 1.0, 0.56, SURFACE_2, RED, 0.7)
    add_text(slide, x + 0.08, y + 2.67, 1.0, 0.08, "吉方\n東南、正東", size=7, color=GOLD, bold=True, align=PP_ALIGN.CENTER)
    add_text(slide, x + 1.2, y + 2.67, 1.0, 0.08, "避開\n正南、西北", size=7, color=RED, bold=True, align=PP_ALIGN.CENTER)
    add_rect(slide, x + 0.08, y + 4.1, 2.12, 0.4, RGBColor(0x11, 0x1F, 0x17), GREEN, 0.8)
    add_text(slide, x + 0.08, y + 4.22, 2.12, 0.08, "🧭 啟動風水分析", size=8, color=GREEN, bold=True, align=PP_ALIGN.CENTER)


def draw_pearl_phone(slide, left, top):
    x, y, _, _ = draw_phone(slide, left, top, "Feature / Pearl")
    phone_status(slide, x, y, "靈魂模式", "Quota: soul")
    add_rect(slide, x + 0.08, y + 0.56, 2.12, 0.4, RGBColor(0x14, 0x10, 0x26), PURPLE, 0.8)
    add_text(slide, x + 0.18, y + 0.68, 1.92, 0.1, "🦌 先選問題類別，再讓我替你起卦", size=7, color=PURPLE)
    categories = ["事業", "感情", "家庭", "健康", "學業"]
    for idx, label in enumerate(categories):
        row = idx // 3
        col = idx % 3
        bx = x + 0.08 + col * 0.72
        by = y + 1.12 + row * 0.48
        add_rect(slide, bx, by, 0.62, 0.34, SURFACE_2 if idx == 0 else SURFACE, PURPLE if idx == 0 else LINE, 0.7)
        add_text(slide, bx, by + 0.12, 0.62, 0.08, label, size=6, color=TEXT, align=PP_ALIGN.CENTER)
    add_rect(slide, x + 0.08, y + 2.2, 2.12, 0.62, SURFACE, LINE, 0.6)
    add_text(slide, x + 0.16, y + 2.34, 1.9, 0.2, "輸入問題（選填）\n例如：下週是否適合談合作？", size=7, color=MUTED)
    add_rect(slide, x + 0.08, y + 3.06, 2.12, 0.9, SURFACE_2, PURPLE, 0.8)
    add_text(slide, x + 0.08, y + 3.18, 2.12, 0.16, "䷂ 坤卦", size=18, color=TEXT, bold=True, align=PP_ALIGN.CENTER)
    add_text(slide, x + 0.18, y + 3.52, 1.92, 0.18, "順勢承接、宜守中蓄勢。", size=8, color=TEXT, align=PP_ALIGN.CENTER)
    add_rect(slide, x + 0.08, y + 4.14, 2.12, 0.36, RGBColor(0x14, 0x10, 0x26), PURPLE, 0.8)
    add_text(slide, x + 0.08, y + 4.25, 2.12, 0.08, "🏮 啟動占卜", size=8, color=PURPLE, bold=True, align=PP_ALIGN.CENTER)


def draw_chat_phone(slide, left, top):
    x, y, _, _ = draw_phone(slide, left, top, "Pet Chat / Output")
    phone_status(slide, x, y, "聊天紀錄", "AsyncStorage")
    add_text(slide, x + 0.62, y + 0.55, 1.1, 0.1, "2026 / 03 / 14", size=7, color=MUTED, align=PP_ALIGN.CENTER)
    draw_bubble(slide, x + 0.08, y + 0.82, 2.12, 0.78, "🦌 Fortune 08:00", "五項運勢分數 + 吉方 / 幸運色 / 幸運數字")
    draw_bubble(slide, x + 0.08, y + 1.76, 2.12, 0.68, "🦌 Face 08:12", "五官評分條 + 幸運物件推薦", BLUE)
    draw_bubble(slide, x + 0.08, y + 2.58, 2.12, 0.66, "🦌 FengShui 08:16", "九宮方位 + 吉凶方向 + 座位建議", GREEN)
    draw_bubble(slide, x + 0.08, y + 3.38, 2.12, 0.66, "🦌 Divination 08:20", "卦象、卦辭、變卦與靈寵解讀", PURPLE)
    add_rect(slide, x + 0.08, y + 4.18, 1.0, 0.22, RGBColor(0x27, 0x22, 0x12), GOLD, 0.6)
    add_rect(slide, x + 1.18, y + 4.18, 1.02, 0.22, RGBColor(0x16, 0x10, 0x24), PURPLE, 0.6)
    add_text(slide, x + 0.08, y + 4.25, 1.0, 0.08, "+50 EXP", size=6, color=GOLD, align=PP_ALIGN.CENTER)
    add_text(slide, x + 1.18, y + 4.25, 1.02, 0.08, "進化階段 2", size=6, color=PURPLE, align=PP_ALIGN.CENTER)


def draw_upgrade_phone(slide, left, top):
    x, y, _, _ = draw_phone(slide, left, top, "Upgrade Modal")
    add_rect(slide, x + 0.02, y + 0.32, 2.3, 4.45, RGBColor(0x00, 0x00, 0x00), None)
    add_rect(slide, x + 0.12, y + 0.72, 2.1, 3.72, SURFACE, GOLD, 0.8)
    add_text(slide, x + 0.24, y + 0.88, 0.28, 0.18, "🦌", size=24, align=PP_ALIGN.CENTER)
    add_text(slide, x + 0.56, y + 0.88, 1.48, 0.34, "今日次數用完了，升級後我可以幫你看更多。", size=8, color=TEXT)
    for idx, (title, price, color) in enumerate([("⭐ 會員", "$390 / 月", GOLD), ("👑 至尊", "$1990 / 月", PURPLE)]):
        box_y = y + 1.48 + idx * 0.98
        add_rect(slide, x + 0.24, box_y, 1.84, 0.78, SURFACE_2, color, 0.8)
        add_text(slide, x + 0.34, box_y + 0.08, 0.8, 0.1, title, size=9, color=color, bold=True)
        add_text(slide, x + 1.2, box_y + 0.08, 0.74, 0.1, price, size=8, color=color, bold=True, align=PP_ALIGN.RIGHT)
        add_text(slide, x + 0.34, box_y + 0.26, 1.5, 0.24, "更多次數 / 更高等級 / 更深分析", size=7, color=TEXT)
    add_text(slide, x + 0.68, y + 3.92, 0.96, 0.1, "明天再來", size=7, color=MUTED, align=PP_ALIGN.CENTER)


def draw_profile_phone(slide, left, top):
    x, y, _, _ = draw_phone(slide, left, top, "Profile")
    add_text(slide, x + 0.08, y + 0.14, 1.2, 0.14, "我的", size=18, color=GOLD, bold=True)
    add_rect(slide, x + 0.08, y + 0.48, 2.12, 0.72, RGBColor(0x10, 0x1C, 0x2C), BLUE, 0.8)
    add_text(slide, x + 0.16, y + 0.64, 0.4, 0.18, "🦌", size=24, align=PP_ALIGN.CENTER)
    add_text(slide, x + 0.62, y + 0.6, 0.9, 0.1, "Denny", size=10, color=TEXT, bold=True)
    add_text(slide, x + 0.62, y + 0.8, 1.1, 0.1, "Lv.3 小鹿靈 · 木系", size=7, color=GOLD_SOFT)
    add_rect(slide, x + 1.72, y + 0.64, 0.36, 0.18, SURFACE_2, GOLD, 0.7)
    add_text(slide, x + 1.72, y + 0.69, 0.36, 0.08, "Free", size=6, color=GOLD, align=PP_ALIGN.CENTER)
    for idx, title in enumerate(["語言設定", "命盤資料", "其他選單"]):
        sec_y = y + 1.46 + idx * 1.05
        add_text(slide, x + 0.08, sec_y, 0.9, 0.08, title, size=6, color=MUTED)
        add_rect(slide, x + 0.08, sec_y + 0.12, 2.12, 0.72, SURFACE, LINE, 0.6)
        if idx == 0:
            add_text(slide, x + 0.18, sec_y + 0.26, 1.8, 0.22, "繁中 / 简中 / 日本語 / EN / DE / FR", size=7, color=TEXT)
        elif idx == 1:
            add_text(slide, x + 0.18, sec_y + 0.22, 1.8, 0.32, "八字、主星、星座、節氣靈寵\n都集中在同一卡內顯示", size=7, color=TEXT)
        else:
            add_text(slide, x + 0.18, sec_y + 0.2, 1.8, 0.36, "隱私條款 / 使用條款 / 關於 v1.0.0\n恢復購買 / 登出", size=7, color=TEXT)
    phone_tabs(slide, x, y, "profile")


def add_cover():
    slide = prs.slides.add_slide(BLANK)
    set_bg(slide)
    add_rect(slide, 0.36, 0.34, 12.62, 6.5, PANEL, LINE, 0.8)
    add_text(slide, 0.7, 1.05, 11.8, 0.55, "靈犀 LingXi", size=30, color=GOLD, bold=True, align=PP_ALIGN.CENTER)
    add_text(slide, 0.7, 1.72, 11.8, 0.72, "目前最新開發狀況\nUI 操作畫面詳細說明", size=24, color=TEXT, bold=True, align=PP_ALIGN.CENTER)
    add_text(slide, 1.4, 2.78, 10.6, 0.34, "本簡報以目前工作樹為準，重點反映 2026-03-09 UI 重構後的單一靈寵中心版本。", size=12, color=GOLD_SOFT, align=PP_ALIGN.CENTER)
    add_chip(slide, 2.2, 3.54, 1.9, f"日期 {DATE_STR}", SURFACE_2, GOLD)
    add_chip(slide, 4.32, 3.54, 1.8, f"版本 {APP_VERSION}", SURFACE_2, GOLD)
    add_chip(slide, 6.35, 3.54, 1.5, f"分支 {BRANCH}", SURFACE_2, GOLD)
    add_chip(slide, 8.07, 3.54, 2.1, f"基準 {BASE_COMMIT}", SURFACE_2, GOLD)
    draw_pet_home_phone(slide, 1.15, 4.2)
    draw_upgrade_phone(slide, 5.15, 4.2)
    draw_profile_phone(slide, 9.15, 4.2)
    add_footer(slide, len(prs.slides))


def build_presentation():
    add_cover()

    slide = new_slide("彙整依據與最新 UI 判讀", "用程式碼、工作樹狀態與既有進度文件交叉比對")
    draw_panel(
        slide, 0.55, 1.2, 4.2, 2.55, "本次彙整依據", BLUE,
        [
            ("• `app/_layout.tsx`：根路由與 auth/onboarding 分流", 11, TEXT),
            ("• `app/auth.tsx`、`app/onboarding.tsx`：登入與召喚流程", 11, TEXT),
            ("• `app/(tabs)/pet.tsx`、`profile.tsx`：現行兩個主畫面", 11, TEXT),
            ("• `components/*`：聊天式 UI、功能面板、升級彈窗", 11, TEXT),
            ("• `stores/*`：額度、等級、訊息持久化與開發模式行為", 11, TEXT),
            ("• `DEV-PROGRESS.md`：已完成與待驗證項目", 11, TEXT),
        ],
    )
    draw_panel(
        slide, 0.55, 3.95, 4.2, 2.35, "最新結論", GOLD,
        [
            ("• UI 主軸已從多功能 tab 改為單一 `Pet Center`。", 11, TEXT),
            ("• `index / eye / heart / pearl` 舊 tab 正在被移除。", 11, TEXT),
            ("• 三大功能改為從 ActionBar 打開內嵌面板。", 11, TEXT),
            ("• 所有結果統一回寫為靈寵聊天氣泡。", 11, TEXT),
            ("• `screenshots/` 內 3/3 舊圖已不是最新基準。", 11, TEXT),
        ],
    )
    add_rect(slide, 5.05, 1.22, 7.3, 5.08, SURFACE, LINE, 0.8)
    add_text(slide, 5.28, 1.42, 2.4, 0.18, "舊版結構", size=13, color=RED, bold=True)
    add_text(slide, 5.28, 1.72, 2.6, 1.0, "首頁\n靈眼\n靈心\n靈魂\n靈寵\n個人", size=16, color=TEXT, align=PP_ALIGN.CENTER)
    add_text(slide, 7.8, 2.35, 1.0, 0.4, "→", size=34, color=GOLD, align=PP_ALIGN.CENTER)
    add_text(slide, 9.1, 1.42, 2.8, 0.18, "現行工作樹", size=13, color=GREEN, bold=True)
    add_text(slide, 9.1, 1.72, 2.7, 1.0, "Auth\nOnboarding\nPet Center\nProfile", size=16, color=TEXT, align=PP_ALIGN.CENTER)
    add_lines(
        slide, 5.3, 3.15, 6.8, 2.75,
        [
            ("重構重點", 12, GOLD, True),
            ("1. `/(tabs)/pet` 成為唯一主要操作場景。", 11, TEXT),
            ("2. 功能面板開啟時，聊天區與頭像自動讓位。", 11, TEXT),
            ("3. 結果以聊天紀錄沉澱，不再散落在各自頁面。", 11, TEXT),
            ("4. 訂閱與每日額度檢查都集中在互動當下觸發。", 11, TEXT),
        ],
    )

    slide = new_slide("全域流程與路由", "啟動後的導向邏輯已完全由 auth + onboarding 狀態控制")
    draw_flow_boxes(slide)
    draw_panel(
        slide, 0.6, 3.0, 4.9, 2.95, "實際行為", GOLD,
        [
            ("• App 啟動先載入字體、檢查 auth、初始化訂閱服務。", 11, TEXT),
            ("• `DEV_SKIP_AUTH = false`，預設不跳過登入。", 11, TEXT),
            ("• `/` 直接 redirect 到 `/(tabs)/pet`。", 11, TEXT),
            ("• 根 layout 會依 `isAuthenticated` / `isOnboarded` 改寫實際去向。", 11, TEXT),
            ("• 全站外層已包 `ErrorBoundary`。", 11, TEXT),
        ],
    )
    draw_panel(
        slide, 6.0, 4.15, 6.25, 1.8, "路由落點", BLUE,
        [
            ("• 未登入：停在 `auth`。", 11, TEXT),
            ("• 已登入但未完成召喚：進 `onboarding`。", 11, TEXT),
            ("• 已完成：導回 `/(tabs)/pet`，不是舊首頁。", 11, TEXT),
        ],
    )

    slide = new_slide("畫面一：登入 / 註冊", "單頁雙模式，iOS 優先使用 Apple Sign-In")
    draw_auth_phone(slide, 0.7, 1.2)
    draw_panel(
        slide, 4.35, 1.22, 4.0, 2.3, "畫面構成", BLUE,
        [
            ("1. 上半部品牌字樣：毛筆字「靈犀」+ LING XI。", 11, TEXT),
            ("2. iOS 顯示 Apple Sign-In Button，之後才是 Email 流程。", 11, TEXT),
            ("3. Login / Register 共用同頁，註冊模式多一個姓名欄。", 11, TEXT),
            ("4. 錯誤訊息插入在表單上方，全螢幕 loading overlay 疊加。", 11, TEXT),
        ],
    )
    draw_panel(
        slide, 4.35, 3.72, 4.0, 2.42, "操作流程", GOLD,
        [
            ("1. 使用者輸入 email / password。", 11, TEXT),
            ("2. 註冊時需補姓名；欄位未滿不可送出。", 11, TEXT),
            ("3. Apple 登入成功後，依 `isNewUser` 決定去 onboarding 或 pet。", 11, TEXT),
            ("4. Email 流程也走相同導向。", 11, TEXT),
        ],
    )
    draw_panel(
        slide, 8.58, 1.22, 3.75, 4.92, "補充", PURPLE,
        [
            ("• 鍵盤避讓已做 iOS / Android 分支。", 11, TEXT),
            ("• `clearError()` 會在切模式與送出前清空狀態。", 11, TEXT),
            ("• 非 iOS 平台不顯示 Apple Button。", 11, TEXT),
            ("• 成功登入後，主流程不再出現舊首頁。", 11, TEXT),
        ],
    )

    slide = new_slide("畫面二：Onboarding 五步召喚流程", "從語言選擇到命盤建立，再到節氣靈寵召喚")
    draw_onboarding_phone(slide, 0.7, 1.2)
    draw_panel(
        slide, 4.35, 1.22, 3.95, 4.9, "Step 0 - 4", GOLD,
        [
            ("0. 語言選擇：zh-TW / zh-CN / ja / en / de / fr。", 11, TEXT),
            ("1. 歡迎頁：品牌敘事與主標語。", 11, TEXT),
            ("2. 姓名輸入：未填不可往下。", 11, TEXT),
            ("3. 出生資料：陽曆/農曆、年/月/日滾輪、時辰、性別。", 11, TEXT),
            ("4. 召喚結果：展示靈寵與命盤結果，最後進入主場景。", 11, TEXT),
        ],
    )
    draw_panel(
        slide, 8.52, 1.22, 3.8, 2.4, "提交時實際發生的事", BLUE,
        [
            ("• `setOnboarding()` 直接算出八字、紫微、西占。", 11, TEXT),
            ("• `initPet(month, day)` 依節氣配對靈寵。", 11, TEXT),
            ("• 若已登入，會把 profile 與 destinyData 回寫 API。", 11, TEXT),
        ],
    )
    draw_panel(
        slide, 8.52, 3.92, 3.8, 2.2, "畫面細節", GREEN,
        [
            ("• 年份範圍 1930 - 2026。", 11, TEXT),
            ("• 不知道時辰時，預設午時 11 點。", 11, TEXT),
            ("• Step 3 是目前 onboarding 的操作核心畫面。", 11, TEXT),
        ],
    )

    slide = new_slide("畫面三：主場景 Pet Center", "新版 UI 的核心，集中日常互動、能力啟動與結果沉澱")
    draw_pet_home_phone(slide, 0.7, 1.18)
    draw_panel(
        slide, 4.35, 1.2, 3.95, 2.5, "版面結構", GOLD,
        [
            ("1. Status Bar：App 名、時辰/日期、Lv + 靈寵名 + 五行。", 11, TEXT),
            ("2. PetAvatar：靈寵、EXP 條、進化星級。", 11, TEXT),
            ("3. PetChat：所有提示與分析結果的主輸出區。", 11, TEXT),
            ("4. ActionBar：上排養成、下排三大能力。", 11, TEXT),
            ("5. UpgradeModal：需求時覆蓋於最上層。", 11, TEXT),
        ],
    )
    draw_panel(
        slide, 4.35, 3.95, 3.95, 2.2, "動態規則", BLUE,
        [
            ("• 啟動靈眼 / 靈心 / 靈魂時，Avatar 與 Chat 讓位給 FeaturePanel。", 11, TEXT),
            ("• 再點同一顆能力鍵會關閉該功能面板。", 11, TEXT),
            ("• ActionBar 會高亮目前啟動中的能力。", 11, TEXT),
        ],
    )
    draw_panel(
        slide, 8.52, 1.2, 3.8, 4.95, "啟動後自動做的事", GREEN,
        [
            ("• 首次進頁會檢查當日時段是否已生成 fortune bubble。", 11, TEXT),
            ("• 若命盤資料齊全：本地計算 `UnifiedFortune`。", 11, TEXT),
            ("• 若資料不足：至少給一則問候氣泡。", 11, TEXT),
            ("• 這使得 Pet Center 一打開就有內容，不是空頁。", 11, TEXT),
        ],
    )

    slide = new_slide("Pet Center 操作細節", "養成動作、升級、進化與聊天紀錄如何互相連動")
    draw_chat_phone(slide, 0.7, 1.18)
    draw_panel(
        slide, 4.35, 1.2, 4.0, 2.25, "養成動作", GOLD,
        [
            ("• 餵食 `feed`：+50 EXP。", 11, TEXT),
            ("• 玩耍 `play`：+30 EXP。", 11, TEXT),
            ("• 冥想 `meditate`：+20 EXP。", 11, TEXT),
            ("• 動作執行後立刻插入回應氣泡。", 11, TEXT),
        ],
    )
    draw_panel(
        slide, 4.35, 3.75, 4.0, 2.4, "升級與進化", BLUE,
        [
            ("• 升級後會新增 `levelup` 氣泡。", 11, TEXT),
            ("• 每 10 級觸發一次進化階段判定。", 11, TEXT),
            ("• 進化後會新增 `evolve` 氣泡。", 11, TEXT),
            ("• 若達方案等級上限，改為跳升級 Modal。", 11, TEXT),
        ],
    )
    draw_panel(
        slide, 8.55, 1.2, 3.75, 4.95, "聊天紀錄層", PURPLE,
        [
            ("• `chat-store` 使用 Zustand + AsyncStorage 持久化。", 11, TEXT),
            ("• 最多保留最近 200 則訊息。", 11, TEXT),
            ("• `PetChat` 會自動插入日期分隔線。", 11, TEXT),
            ("• 新訊息加入後自動滾到底。", 11, TEXT),
            ("• message type 已覆蓋 fortune / face / fengshui / divination / nurture / celebration。", 11, TEXT),
        ],
    )

    slide = new_slide("畫面四：靈眼模式", "相機取樣 -> 預覽 -> 分析進度 -> 結果回寫聊天泡泡")
    draw_eye_phone(slide, 0.7, 1.18)
    draw_panel(
        slide, 4.35, 1.2, 3.95, 2.55, "操作步驟", GOLD,
        [
            ("1. 開啟面板時請求相機權限。", 11, TEXT),
            ("2. 使用前鏡頭拍照，儲存 base64 圖。", 11, TEXT),
            ("3. Preview 可重拍或送出分析。", 11, TEXT),
            ("4. 分析時顯示 0 - 100% 進度條與靈寵旁白。", 11, TEXT),
        ],
    )
    draw_panel(
        slide, 4.35, 4.0, 3.95, 2.15, "結果內容", BLUE,
        [
            ("• 五官分數：額頭、眉、眼、鼻、口。", 11, TEXT),
            ("• 整體 fortune level。", 11, TEXT),
            ("• 幸運物、幸運方位、幸運數字。", 11, TEXT),
            ("• AI 閱讀文字優先回寫聊天區。", 11, TEXT),
        ],
    )
    draw_panel(
        slide, 8.55, 1.2, 3.75, 4.95, "實作重點", GREEN,
        [
            ("• API：`analyzeFace(base64, baziStr, '', today)`。", 11, TEXT),
            ("• 額度檢查走 `useFeature('eye', petLevel)`。", 11, TEXT),
            ("• 若整合到 Pet Center，結果送出後會自動關閉面板。", 11, TEXT),
            ("• Web 端相機以 native guard 包住，不強行載入。", 11, TEXT),
        ],
    )

    slide = new_slide("畫面五：靈心模式", "GPS + 羅盤 + 奇門本地盤，再交給 AI 產出位置解讀")
    draw_heart_phone(slide, 0.7, 1.18)
    draw_panel(
        slide, 4.35, 1.2, 4.0, 2.45, "操作步驟", GOLD,
        [
            ("1. 請求定位權限，取得 lat/lng。", 11, TEXT),
            ("2. reverse geocode 取城市 / 區域名稱。", 11, TEXT),
            ("3. 原生裝置訂閱 Magnetometer 取得 heading。", 11, TEXT),
            ("4. 點擊分析後送 AI 做風水判讀。", 11, TEXT),
        ],
    )
    draw_panel(
        slide, 4.35, 3.95, 4.0, 2.2, "畫面輸出", BLUE,
        [
            ("• 即時座標 + 地名。", 11, TEXT),
            ("• 小型羅盤與吉凶方向摘要。", 11, TEXT),
            ("• 位置分析、tips、座位建議。", 11, TEXT),
        ],
    )
    draw_panel(
        slide, 8.55, 1.2, 3.75, 4.95, "實作重點", GREEN,
        [
            ("• 先本地 `generateQimenChart(new Date())` 算吉凶方位。", 11, TEXT),
            ("• AI API：`analyzeFengShui(lat, lng, heading, name, baziStr, '')`。", 11, TEXT),
            ("• 回寫聊天時會把 `palaces / luckyDirections / dangerDirections` 一起帶入。", 11, TEXT),
            ("• 額度 key 為 `heart`。", 11, TEXT),
            ("• GPS 尚未就緒時，按鈕會先提示等待定位。", 11, TEXT),
        ],
    )

    slide = new_slide("畫面六：靈魂模式", "類別選擇 + 問題輸入 + 起卦 + 結果摘要")
    draw_pearl_phone(slide, 0.7, 1.18)
    draw_panel(
        slide, 4.35, 1.2, 4.0, 2.45, "操作步驟", GOLD,
        [
            ("1. 選 5 類之一：事業、感情、家庭、健康、學業。", 11, TEXT),
            ("2. 可輸入 100 字內問題，也可留空。", 11, TEXT),
            ("3. 啟動後有震動與 1.5 秒搖卦態。", 11, TEXT),
            ("4. 產出本卦、變卦與靈寵解讀。", 11, TEXT),
        ],
    )
    draw_panel(
        slide, 4.35, 3.95, 4.0, 2.2, "結果內容", BLUE,
        [
            ("• 卦象符號、卦名、卦辭、mystical line。", 11, TEXT),
            ("• verdict / guidance / timing。", 11, TEXT),
            ("• 上卦、下卦、五行、fortune level。", 11, TEXT),
            ("• 若有變卦，另顯示動爻資訊。", 11, TEXT),
        ],
    )
    draw_panel(
        slide, 8.55, 1.2, 3.75, 4.95, "實作重點", PURPLE,
        [
            ("• 本地核心：`performHexagramDivination()`。", 11, TEXT),
            ("• 額度檢查用 `useFeature('soul', petLevel)`。", 11, TEXT),
            ("• ActionBar 按鈕 key 是 `pearl`，但 quota 會映射到 `soul`。", 11, TEXT),
            ("• 整合模式下，結果會變成聊天 bubble 後自動收合。", 11, TEXT),
        ],
    )

    slide = new_slide("聊天氣泡規格", "所有結果都被規格化，這是新版 UI 最重要的共通層")
    draw_chat_phone(slide, 0.7, 1.18)
    draw_panel(
        slide, 4.35, 1.2, 4.0, 2.35, "訊息類型", GOLD,
        [
            ("• `fortune`：五維分數條 + 吉方/幸運色/數字。", 11, TEXT),
            ("• `face`：五官分數條 + 幸運物。", 11, TEXT),
            ("• `fengshui`：九宮格 + 方向摘要。", 11, TEXT),
            ("• `divination`：卦象 block。", 11, TEXT),
        ],
    )
    draw_panel(
        slide, 4.35, 3.8, 4.0, 2.35, "互動 / 成長訊息", BLUE,
        [
            ("• `feed/play/meditate`：顯示 EXP badge。", 11, TEXT),
            ("• `levelup/evolve`：顯示慶祝 badge。", 11, TEXT),
            ("• header 一律保留靈寵名與時間戳。", 11, TEXT),
        ],
    )
    draw_panel(
        slide, 8.55, 1.2, 3.75, 4.95, "為什麼這層重要", GREEN,
        [
            ("• 三個能力的結果都留在同一個敘事脈絡。", 11, TEXT),
            ("• 使用者不必回頭找散落頁面。", 11, TEXT),
            ("• 也為後續推播/記錄/分享留下統一格式。", 11, TEXT),
            ("• 這是從舊版多 tab 架構過渡到對話式體驗的關鍵。", 11, TEXT),
        ],
    )

    slide = new_slide("升級彈窗、額度與方案規則", "免費/會員/至尊的限制與開發模式差異都已落在 store 邏輯")
    draw_upgrade_phone(slide, 0.7, 1.18)
    draw_panel(
        slide, 4.35, 1.2, 4.0, 2.55, "何時跳出", GOLD,
        [
            ("• 三能力使用前先檢查剩餘次數。", 11, TEXT),
            ("• 養成動作若達等級上限，也直接要求升級。", 11, TEXT),
            ("• Profile 頁也能主動打開升級彈窗。", 11, TEXT),
        ],
    )
    draw_panel(
        slide, 4.35, 4.0, 4.0, 2.15, "正式規則", BLUE,
        [
            ("• Free：每功能每日 1 次，等級上限 Lv.10，進化上限 1。", 11, TEXT),
            ("• Member：每日 5 次，Lv.20，進化上限 2。", 11, TEXT),
            ("• Supreme：近似無限，等級與進化不封頂。", 11, TEXT),
        ],
    )
    draw_panel(
        slide, 8.55, 1.2, 3.75, 4.95, "最新程式碼中的細節", PURPLE,
        [
            ("• 顯示價格：Member 390 / Supreme 1990。", 11, TEXT),
            ("• RevenueCat 僅在原生且成功初始化時可購買。", 11, TEXT),
            ("• `__DEV__` 下額度與等級上限被放寬成測試值。", 11, TEXT),
            ("• 寵物等級加成：Lv.10 +1 次，Lv.20 再 +1 次。", 11, TEXT),
        ],
    )

    slide = new_slide("畫面七：Profile", "個人資料、語言、命盤摘要、條款、恢復購買與登出")
    draw_profile_phone(slide, 0.7, 1.18)
    draw_panel(
        slide, 4.35, 1.2, 4.0, 2.45, "畫面構成", GOLD,
        [
            ("1. 使用者卡：姓名、寵物、等級、五行、節氣、方案 badge。", 11, TEXT),
            ("2. 免費方案額外顯示升級 CTA。", 11, TEXT),
            ("3. 語言設定直接嵌在此頁。", 11, TEXT),
            ("4. 命盤摘要集中在一個 section card。", 11, TEXT),
        ],
    )
    draw_panel(
        slide, 4.35, 3.95, 4.0, 2.2, "其他選單", BLUE,
        [
            ("• 推播通知（目前仍是 stub message）。", 11, TEXT),
            ("• Privacy / Terms 透過 API base URL 開網頁。", 11, TEXT),
            ("• 關於頁目前直接顯示 `靈犀 v1.0.0`。", 11, TEXT),
            ("• 支援 restore purchases 與 logout。", 11, TEXT),
        ],
    )
    draw_panel(
        slide, 8.55, 1.2, 3.75, 4.95, "注意事項", GREEN,
        [
            ("• 若 `EXPO_PUBLIC_API_BASE_URL` 未設定，條款頁會報通用錯誤。", 11, TEXT),
            ("• restore 成功後會同步更新 auth store 的 plan。", 11, TEXT),
            ("• 命盤資料來源仍是 onboarding 後的本地衍生結果。", 11, TEXT),
        ],
    )

    slide = new_slide("截至今日的最新開發狀況", "把已完成、正在變動與待驗證項目分開整理")
    draw_panel(
        slide, 0.55, 1.2, 4.05, 4.95, "已完成到可展示層", GOLD,
        [
            ("• Auth：Apple Sign-In + Email/Password。", 11, TEXT),
            ("• Onboarding：多語、命盤建立、節氣靈寵召喚。", 11, TEXT),
            ("• Pet Center：聊天式主場景、養成、三能力入口。", 11, TEXT),
            ("• Eye / Heart / Pearl：都已有可跑的 UI 與結果回寫介面。", 11, TEXT),
            ("• Profile：方案、語言、命盤摘要、恢復購買、登出。", 11, TEXT),
            ("• Store：chat/user/pet 狀態持久化已接上。", 11, TEXT),
        ],
    )
    draw_panel(
        slide, 4.85, 1.2, 3.85, 4.95, "目前仍在變動", BLUE,
        [
            ("• git 工作樹很髒，代表這版 UI 重構尚未正式提交。", 11, TEXT),
            ("• 舊 tab 檔案被刪除，但整個重構還沒進一次乾淨 commit。", 11, TEXT),
            ("• 現有 `screenshots/` 除 onboarding 新圖外，多數不是最新版。", 11, TEXT),
            ("• 部分價格與商業文案已更新，但商店素材仍未齊。", 11, TEXT),
        ],
    )
    draw_panel(
        slide, 8.95, 1.2, 3.35, 4.95, "待驗證 / 待補", PURPLE,
        [
            ("• `npx tsc --noEmit` 與實機 / Expo 驗證仍待跑。", 11, TEXT),
            ("• Cloud Run / RevenueCat 正式環境配置未結束。", 11, TEXT),
            ("• App icon / splash / store screenshots / 法務頁 URL 待補齊。", 11, TEXT),
        ],
    )

    slide = new_slide("建議下一步", "若要把這份簡報升級成對外審稿版，接下來應補的東西")
    draw_panel(
        slide, 0.7, 1.4, 3.7, 4.4, "1. 補真實截圖", GOLD,
        [
            ("• 以目前 UI 重構版重新跑螢幕擷取。", 11, TEXT),
            ("• 至少補 auth / onboarding / pet / profile / 三能力 / upgrade modal。", 11, TEXT),
        ],
    )
    draw_panel(
        slide, 4.8, 1.4, 3.7, 4.4, "2. 做一次乾淨驗證", BLUE,
        [
            ("• 跑 TypeScript、Expo 啟動、原生能力權限流。", 11, TEXT),
            ("• 確認開發模式與正式模式的 quota 行為差異。", 11, TEXT),
        ],
    )
    draw_panel(
        slide, 8.9, 1.4, 3.7, 4.4, "3. 固化版本基準", PURPLE,
        [
            ("• 將 UI 重構整理成 commit。", 11, TEXT),
            ("• 屆時可把簡報 footer 從「工作樹版本」改成正式 commit/tag。", 11, TEXT),
        ],
    )
def save():
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    prs.save(OUTPUT_PATH)
    print(OUTPUT_PATH)


if __name__ == "__main__":
    build_presentation()
    save()
