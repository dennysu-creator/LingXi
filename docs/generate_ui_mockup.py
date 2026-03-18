"""
靈犀 LingXi — 真實畫面模擬 PPTX
以 python-pptx 繪製仿真手機介面 mockup
"""

from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
import os, math

# ── 色彩 ──
BG        = RGBColor(0x08, 0x08, 0x0F)
GOLD      = RGBColor(0xE8, 0xC5, 0x47)
GOLD_DIM  = RGBColor(0xC4, 0xB0, 0x7A)
GOLD_BG   = RGBColor(0x18, 0x16, 0x0E)   # approx rgba(gold,0.06) on BG
GOLD_BG2  = RGBColor(0x20, 0x1C, 0x12)   # approx rgba(gold,0.12) on BG
GOLD_BDR  = RGBColor(0x30, 0x2A, 0x14)   # approx gold border
MUTED     = RGBColor(0x8B, 0x7D, 0x5E)
DARK      = RGBColor(0x6B, 0x63, 0x50)
DARKEST   = RGBColor(0x5A, 0x50, 0x40)
WHITE     = RGBColor(0xFF, 0xFF, 0xFF)
BLUE      = RGBColor(0x64, 0xB4, 0xFF)
BLUE_BG   = RGBColor(0x0E, 0x12, 0x18)
PURPLE    = RGBColor(0xA7, 0x8B, 0xFA)
PURPLE_BG = RGBColor(0x12, 0x10, 0x1A)
GREEN     = RGBColor(0x64, 0xC8, 0x80)
GREEN_BG  = RGBColor(0x0E, 0x16, 0x12)
RED       = RGBColor(0xC4, 0x40, 0x40)
SURFACE   = RGBColor(0x0D, 0x0D, 0x15)
TAB_BG    = RGBColor(0x0A, 0x0A, 0x12)
CARD_BG   = RGBColor(0x12, 0x12, 0x1A)
SLIDE_BG  = RGBColor(0x04, 0x04, 0x08)

FONT = 'Microsoft JhengHei'
FONT_B = 'Microsoft JhengHei'

prs = Presentation()
prs.slide_width  = Inches(13.333)
prs.slide_height = Inches(7.5)


def set_bg(slide, color=SLIDE_BG):
    bg = slide.background; f = bg.fill; f.solid(); f.fore_color.rgb = color


def add_shape(slide, left, top, w, h, fill=None, border=None, bw=Pt(1), radius=None):
    shape_type = MSO_SHAPE.ROUNDED_RECTANGLE if radius else MSO_SHAPE.RECTANGLE
    s = slide.shapes.add_shape(shape_type, Emu(left), Emu(top), Emu(w), Emu(h))
    if fill:
        s.fill.solid(); s.fill.fore_color.rgb = fill
    else:
        s.fill.background()
    if border:
        s.line.color.rgb = border; s.line.width = bw
    else:
        s.line.fill.background()
    return s


def tx(slide, left, top, w, h, text, size=12, color=WHITE, bold=False, align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP):
    tb = slide.shapes.add_textbox(Emu(left), Emu(top), Emu(w), Emu(h))
    tf = tb.text_frame; tf.word_wrap = True; tf.vertical_anchor = anchor
    p = tf.paragraphs[0]; p.text = text; p.font.size = Pt(size)
    p.font.color.rgb = color; p.font.bold = bold; p.font.name = FONT; p.alignment = align
    return tb


def multi_tx(slide, left, top, w, h, lines, align=PP_ALIGN.LEFT):
    """lines: list of (text, size, color, bold)"""
    tb = slide.shapes.add_textbox(Emu(left), Emu(top), Emu(w), Emu(h))
    tf = tb.text_frame; tf.word_wrap = True
    for i, (t, sz, clr, b) in enumerate(lines):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.text = t; p.font.size = Pt(sz); p.font.color.rgb = clr
        p.font.bold = b; p.font.name = FONT; p.alignment = align
        p.space_after = Pt(2)
    return tb


# ── 手機框架 ──
# 單位: EMU (1 inch = 914400 EMU)
def inch(v): return int(v * 914400)
def cm(v): return int(v * 360000)

PHONE_W = inch(2.8)
PHONE_H = inch(5.6)
PHONE_R = inch(0.25)
SCREEN_PAD = inch(0.08)

def phone_frame(slide, cx, cy, label=""):
    """Draw phone frame centered at (cx, cy). Returns (sx, sy, sw, sh) for screen area."""
    px = cx - PHONE_W // 2
    py = cy - PHONE_H // 2
    # outer bezel
    add_shape(slide, px, py, PHONE_W, PHONE_H, fill=RGBColor(0x1A,0x1A,0x22), border=RGBColor(0x33,0x33,0x40), bw=Pt(1.5), radius=True)
    # screen
    sx = px + SCREEN_PAD
    sy = py + SCREEN_PAD
    sw = PHONE_W - SCREEN_PAD * 2
    sh = PHONE_H - SCREEN_PAD * 2
    add_shape(slide, sx, sy, sw, sh, fill=BG, radius=True)
    # notch
    nw = inch(0.8); nh = inch(0.15)
    add_shape(slide, cx - nw//2, py, nw, nh, fill=RGBColor(0x1A,0x1A,0x22), radius=True)
    # label
    if label:
        tx(slide, px, py + PHONE_H + inch(0.12), PHONE_W, inch(0.3), label, size=11, color=GOLD_DIM, align=PP_ALIGN.CENTER)
    return sx, sy, sw, sh


def slide_title(slide, text):
    tx(slide, inch(0.4), inch(0.15), inch(12), inch(0.5), text, size=24, color=GOLD, bold=True)


# ── Helper: bar (progress bar / score bar) ──
def bar(slide, x, y, w, h, pct, fill_color=GOLD, track_color=GOLD_BG):
    add_shape(slide, x, y, w, h, fill=track_color)
    if pct > 0:
        add_shape(slide, x, y, int(w * min(pct, 1.0)), h, fill=fill_color)


# ── Helper: button ──
def btn(slide, x, y, w, h, text, text_color=GOLD, bg=GOLD_BG2, border=GOLD_BDR, size=10, bold=True):
    add_shape(slide, x, y, w, h, fill=bg, border=border, radius=True)
    tx(slide, x, y, w, h, text, size=size, color=text_color, bold=bold, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)


def card(slide, x, y, w, h, fill=GOLD_BG, border=GOLD_BDR):
    return add_shape(slide, x, y, w, h, fill=fill, border=border, radius=True)


# ══════════════════════════════════════
# SLIDE 1: 封面
# ══════════════════════════════════════
s = prs.slides.add_slide(prs.slide_layouts[6]); set_bg(s)
tx(s, 0, inch(2.2), inch(13.333), inch(0.8), "靈犀 LingXi", size=48, color=GOLD, bold=True, align=PP_ALIGN.CENTER)
tx(s, 0, inch(3.1), inch(13.333), inch(0.5), "App 畫面完整呈現", size=22, color=GOLD_DIM, align=PP_ALIGN.CENTER)
tx(s, 0, inch(3.8), inch(13.333), inch(0.4), "每一個使用者看到的真實頁面", size=14, color=MUTED, align=PP_ALIGN.CENTER)
tx(s, 0, inch(6.8), inch(13.333), inch(0.3), "2026-03-03  ·  基於實際程式碼", size=11, color=DARKEST, align=PP_ALIGN.CENTER)


# ══════════════════════════════════════
# SLIDE 2: Auth — 登入畫面
# ══════════════════════════════════════
s = prs.slides.add_slide(prs.slide_layouts[6]); set_bg(s)
slide_title(s, "登入 / 註冊")
sx, sy, sw, sh = phone_frame(s, inch(4.2), inch(4.0), "登入畫面")

# Logo
tx(s, sx, sy + inch(0.6), sw, inch(0.6), "靈犀", size=36, color=GOLD, bold=True, align=PP_ALIGN.CENTER)
tx(s, sx, sy + inch(1.1), sw, inch(0.25), "LING XI", size=10, color=MUTED, align=PP_ALIGN.CENTER)

# Apple button
btn(s, sx + inch(0.25), sy + inch(1.6), sw - inch(0.5), inch(0.35), " Sign in with Apple", text_color=RGBColor(0x10,0x10,0x10), bg=WHITE, border=WHITE, size=10)

# divider
tx(s, sx, sy + inch(2.1), sw, inch(0.2), "──────── 或 ────────", size=8, color=DARK, align=PP_ALIGN.CENTER)

# title
tx(s, sx, sy + inch(2.35), sw, inch(0.3), "登入帳號", size=16, color=GOLD, bold=True, align=PP_ALIGN.CENTER)

# email field
tx(s, sx + inch(0.25), sy + inch(2.75), sw, inch(0.15), "電子郵件", size=7, color=DARK)
card(s, sx + inch(0.2), sy + inch(2.92), sw - inch(0.4), inch(0.32), fill=GOLD_BG, border=GOLD_BDR)
tx(s, sx + inch(0.35), sy + inch(2.95), sw - inch(0.6), inch(0.28), "user@example.com", size=10, color=GOLD)

# password field
tx(s, sx + inch(0.25), sy + inch(3.35), sw, inch(0.15), "密碼", size=7, color=DARK)
card(s, sx + inch(0.2), sy + inch(3.52), sw - inch(0.4), inch(0.32), fill=GOLD_BG, border=GOLD_BDR)
tx(s, sx + inch(0.35), sy + inch(3.55), sw - inch(0.6), inch(0.28), "●●●●●●●●", size=10, color=GOLD)

# login button
btn(s, sx + inch(0.2), sy + inch(4.05), sw - inch(0.4), inch(0.38), "登　　入", text_color=GOLD, bg=GOLD_BG2, border=GOLD_BDR, size=12, bold=True)

# switch
tx(s, sx, sy + inch(4.6), sw, inch(0.2), "沒有帳號？點此註冊", size=9, color=GOLD_DIM, align=PP_ALIGN.CENTER)

# Register version
sx2, sy2, sw2, sh2 = phone_frame(s, inch(9.0), inch(4.0), "註冊畫面")
tx(s, sx2, sy2 + inch(0.4), sw2, inch(0.5), "靈犀", size=30, color=GOLD, bold=True, align=PP_ALIGN.CENTER)
tx(s, sx2, sy2 + inch(0.85), sw2, inch(0.2), "LING XI", size=9, color=MUTED, align=PP_ALIGN.CENTER)
tx(s, sx2, sy2 + inch(1.2), sw2, inch(0.3), "註冊帳號", size=16, color=GOLD, bold=True, align=PP_ALIGN.CENTER)

# name
tx(s, sx2 + inch(0.25), sy2 + inch(1.6), sw2, inch(0.15), "姓名", size=7, color=DARK)
card(s, sx2 + inch(0.2), sy2 + inch(1.75), sw2 - inch(0.4), inch(0.28), fill=GOLD_BG, border=GOLD_BDR)
tx(s, sx2 + inch(0.35), sy2 + inch(1.77), sw2 - inch(0.6), inch(0.25), "小明", size=10, color=GOLD)
# email
tx(s, sx2 + inch(0.25), sy2 + inch(2.15), sw2, inch(0.15), "電子郵件", size=7, color=DARK)
card(s, sx2 + inch(0.2), sy2 + inch(2.3), sw2 - inch(0.4), inch(0.28), fill=GOLD_BG, border=GOLD_BDR)
tx(s, sx2 + inch(0.35), sy2 + inch(2.32), sw2 - inch(0.6), inch(0.25), "ming@email.com", size=10, color=GOLD)
# password
tx(s, sx2 + inch(0.25), sy2 + inch(2.7), sw2, inch(0.15), "密碼", size=7, color=DARK)
card(s, sx2 + inch(0.2), sy2 + inch(2.85), sw2 - inch(0.4), inch(0.28), fill=GOLD_BG, border=GOLD_BDR)
tx(s, sx2 + inch(0.35), sy2 + inch(2.87), sw2 - inch(0.6), inch(0.25), "●●●●●●●●", size=10, color=GOLD)
# register btn
btn(s, sx2 + inch(0.2), sy2 + inch(3.35), sw2 - inch(0.4), inch(0.38), "註　　冊", text_color=GOLD, bg=GOLD_BG2, border=GOLD_BDR, size=12)
tx(s, sx2, sy2 + inch(3.9), sw2, inch(0.2), "已有帳號？點此登入", size=9, color=GOLD_DIM, align=PP_ALIGN.CENTER)


# ══════════════════════════════════════
# SLIDE 3: Onboarding Step 0 — Language
# ══════════════════════════════════════
s = prs.slides.add_slide(prs.slide_layouts[6]); set_bg(s)
slide_title(s, "引導流程 — 步驟 0：語言選擇")
sx, sy, sw, sh = phone_frame(s, inch(6.666), inch(4.0))

tx(s, sx, sy + inch(0.5), sw, inch(0.5), "🌐", size=40, align=PP_ALIGN.CENTER)
tx(s, sx, sy + inch(1.0), sw, inch(0.35), "選擇語言", size=18, color=GOLD, bold=True, align=PP_ALIGN.CENTER)

langs = [("🇹🇼  繁體中文", True), ("🇨🇳  简体中文", False), ("🇯🇵  日本語", False),
         ("🇺🇸  English", False), ("🇩🇪  Deutsch", False), ("🇫🇷  Français", False)]
ly = sy + inch(1.55)
for label, active in langs:
    bg_c = GOLD_BG2 if active else GOLD_BG
    bd_c = GOLD if active else GOLD_BDR
    tc = GOLD if active else MUTED
    card(s, sx + inch(0.2), ly, sw - inch(0.4), inch(0.3), fill=bg_c, border=bd_c)
    suffix = "    ✓" if active else ""
    tx(s, sx + inch(0.35), ly + inch(0.02), sw - inch(0.5), inch(0.26), label + suffix, size=10, color=tc)
    ly += inch(0.36)

btn(s, sx + inch(0.3), ly + inch(0.15), sw - inch(0.6), inch(0.35), "下一步", size=11)


# ══════════════════════════════════════
# SLIDE 4: Onboarding Step 1 — Welcome
# ══════════════════════════════════════
s = prs.slides.add_slide(prs.slide_layouts[6]); set_bg(s)
slide_title(s, "引導流程 — 步驟 1：歡迎頁")
sx, sy, sw, sh = phone_frame(s, inch(4.2), inch(4.0))

tx(s, sx, sy + inch(1.0), sw, inch(0.7), "🐉", size=48, align=PP_ALIGN.CENTER)
tx(s, sx, sy + inch(1.8), sw, inch(0.6), "靈犀", size=36, color=GOLD, bold=True, align=PP_ALIGN.CENTER)
tx(s, sx, sy + inch(2.35), sw, inch(0.2), "LING XI", size=9, color=MUTED, align=PP_ALIGN.CENTER)
multi_tx(s, sx + inch(0.3), sy + inch(2.8), sw - inch(0.6), inch(0.8), [
    ("AI 玄學生活顧問", 11, GOLD_DIM, False),
    ("命理 × AI × 靈寵", 11, MUTED, False),
    ("", 6, MUTED, False),
    ("── 萬物皆有靈 ──", 11, GOLD_DIM, False),
], align=PP_ALIGN.CENTER)
btn(s, sx + inch(0.3), sy + inch(4.0), sw - inch(0.6), inch(0.38), "開始探索", size=12)

# Step 2
sx2, sy2, sw2, sh2 = phone_frame(s, inch(9.0), inch(4.0), "步驟 2：輸入姓名")
tx(s, sx2, sy2 + inch(1.2), sw2, inch(0.5), "📝", size=40, align=PP_ALIGN.CENTER)
tx(s, sx2, sy2 + inch(1.8), sw2, inch(0.35), "你的名字", size=16, color=GOLD, bold=True, align=PP_ALIGN.CENTER)
tx(s, sx2, sy2 + inch(2.2), sw2, inch(0.25), "靈寵會以此稱呼你", size=9, color=MUTED, align=PP_ALIGN.CENTER)
tx(s, sx2 + inch(0.25), sy2 + inch(2.7), sw2, inch(0.15), "姓名", size=7, color=DARK)
card(s, sx2 + inch(0.2), sy2 + inch(2.85), sw2 - inch(0.4), inch(0.32), fill=GOLD_BG, border=GOLD_BDR)
tx(s, sx2 + inch(0.35), sy2 + inch(2.88), sw2 - inch(0.6), inch(0.28), "小明", size=11, color=GOLD)
btn(s, sx2 + inch(0.3), sy2 + inch(3.5), sw2 - inch(0.6), inch(0.35), "下一步", size=11)


# ══════════════════════════════════════
# SLIDE 5: Onboarding Step 3 — Birth Data
# ══════════════════════════════════════
s = prs.slides.add_slide(prs.slide_layouts[6]); set_bg(s)
slide_title(s, "引導流程 — 步驟 3：出生資料")
sx, sy, sw, sh = phone_frame(s, inch(6.666), inch(4.0))

tx(s, sx, sy + inch(0.25), sw, inch(0.3), "輸入出生資料", size=14, color=GOLD, bold=True, align=PP_ALIGN.CENTER)

# Calendar toggle
hw = (sw - inch(0.5)) // 2
btn(s, sx + inch(0.2), sy + inch(0.6), hw, inch(0.26), "國曆", text_color=GOLD, bg=GOLD_BG2, border=GOLD, size=9)
btn(s, sx + inch(0.2) + hw + inch(0.1), sy + inch(0.6), hw, inch(0.26), "農曆", text_color=MUTED, bg=GOLD_BG, border=GOLD_BDR, size=9)

# Wheel pickers
card(s, sx + inch(0.15), sy + inch(1.0), sw - inch(0.3), inch(1.0), fill=RGBColor(0x0C,0x0C,0x12), border=GOLD_BDR)
# Year
pw = inch(0.65)
px_start = sx + inch(0.3)
tx(s, px_start, sy + inch(1.02), pw, inch(0.12), "年", size=6, color=DARK, align=PP_ALIGN.CENTER)
tx(s, px_start, sy + inch(1.15), pw, inch(0.15), "1991", size=7, color=DARKEST, align=PP_ALIGN.CENTER)
tx(s, px_start, sy + inch(1.32), pw, inch(0.2), "1992", size=12, color=GOLD, bold=True, align=PP_ALIGN.CENTER)
tx(s, px_start, sy + inch(1.55), pw, inch(0.15), "1993", size=7, color=DARKEST, align=PP_ALIGN.CENTER)
# Month
px_start += pw + inch(0.25)
tx(s, px_start, sy + inch(1.02), pw, inch(0.12), "月", size=6, color=DARK, align=PP_ALIGN.CENTER)
tx(s, px_start, sy + inch(1.15), pw, inch(0.15), "5", size=7, color=DARKEST, align=PP_ALIGN.CENTER)
tx(s, px_start, sy + inch(1.32), pw, inch(0.2), "6", size=12, color=GOLD, bold=True, align=PP_ALIGN.CENTER)
tx(s, px_start, sy + inch(1.55), pw, inch(0.15), "7", size=7, color=DARKEST, align=PP_ALIGN.CENTER)
# Day
px_start += pw + inch(0.25)
tx(s, px_start, sy + inch(1.02), pw, inch(0.12), "日", size=6, color=DARK, align=PP_ALIGN.CENTER)
tx(s, px_start, sy + inch(1.15), pw, inch(0.15), "14", size=7, color=DARKEST, align=PP_ALIGN.CENTER)
tx(s, px_start, sy + inch(1.32), pw, inch(0.2), "15", size=12, color=GOLD, bold=True, align=PP_ALIGN.CENTER)
tx(s, px_start, sy + inch(1.55), pw, inch(0.15), "16", size=7, color=DARKEST, align=PP_ALIGN.CENTER)

# Shichen
tx(s, sx + inch(0.2), sy + inch(2.1), sw, inch(0.15), "時辰", size=8, color=MUTED)
shichens = ["子時", "丑時", "寅時", "卯時", "辰時", "巳時"]
bw = (sw - inch(0.5)) // 6
for i, sc in enumerate(shichens):
    active = (i == 3)
    bg_c = GOLD_BG2 if active else GOLD_BG
    bd_c = GOLD if active else GOLD_BDR
    tc = GOLD if active else MUTED
    xx = sx + inch(0.2) + bw * i + inch(0.02) * i
    card(s, xx, sy + inch(2.3), bw - inch(0.02), inch(0.28), fill=bg_c, border=bd_c)
    tx(s, xx, sy + inch(2.32), bw - inch(0.02), inch(0.24), sc, size=7, color=tc, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)

shichens2 = ["午時", "未時", "申時", "酉時", "戌時", "亥時"]
for i, sc in enumerate(shichens2):
    xx = sx + inch(0.2) + bw * i + inch(0.02) * i
    card(s, xx, sy + inch(2.65), bw - inch(0.02), inch(0.28), fill=GOLD_BG, border=GOLD_BDR)
    tx(s, xx, sy + inch(2.67), bw - inch(0.02), inch(0.24), sc, size=7, color=MUTED, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)

btn(s, sx + inch(0.4), sy + inch(3.05), sw - inch(0.8), inch(0.24), "不知道", text_color=MUTED, bg=GOLD_BG, border=GOLD_BDR, size=8, bold=False)

# Gender
tx(s, sx + inch(0.2), sy + inch(3.45), sw, inch(0.15), "性別", size=8, color=MUTED)
ghw = (sw - inch(0.5)) // 2
btn(s, sx + inch(0.2), sy + inch(3.65), ghw, inch(0.28), "♂ 男", text_color=GOLD, bg=GOLD_BG2, border=GOLD, size=9)
btn(s, sx + inch(0.2) + ghw + inch(0.1), sy + inch(3.65), ghw, inch(0.28), "♀ 女", text_color=MUTED, bg=GOLD_BG, border=GOLD_BDR, size=9)

# Buttons
bhw2 = (sw - inch(0.5)) // 2
btn(s, sx + inch(0.2), sy + inch(4.15), bhw2 - inch(0.05), inch(0.32), "返回", text_color=MUTED, bg=GOLD_BG, border=GOLD_BDR, size=9, bold=False)
btn(s, sx + inch(0.2) + bhw2 + inch(0.05), sy + inch(4.15), bhw2, inch(0.32), "召喚靈寵", size=10)


# ══════════════════════════════════════
# SLIDE 6: Onboarding Step 4 — Pet Result
# ══════════════════════════════════════
s = prs.slides.add_slide(prs.slide_layouts[6]); set_bg(s)
slide_title(s, "引導流程 — 步驟 4：靈寵召喚結果")
sx, sy, sw, sh = phone_frame(s, inch(4.2), inch(4.0))

tx(s, sx, sy + inch(0.3), sw, inch(0.5), "🦋", size=40, align=PP_ALIGN.CENTER)
tx(s, sx, sy + inch(0.85), sw, inch(0.35), "靈寵降臨！", size=20, color=GOLD, bold=True, align=PP_ALIGN.CENTER)
tx(s, sx, sy + inch(1.2), sw, inch(0.2), "衡翼蝶 與你結緣", size=10, color=BLUE, bold=True, align=PP_ALIGN.CENTER)

# Ziwei card
card(s, sx + inch(0.15), sy + inch(1.55), sw - inch(0.3), inch(0.55), fill=PURPLE_BG, border=RGBColor(0x2A,0x22,0x40))
tx(s, sx + inch(0.3), sy + inch(1.58), sw - inch(0.5), inch(0.15), "紫微命盤", size=7, color=PURPLE)
tx(s, sx + inch(0.3), sy + inch(1.75), sw - inch(0.5), inch(0.15), "命宮主星：紫微", size=10, color=PURPLE, bold=True)
tx(s, sx + inch(0.3), sy + inch(1.92), sw - inch(0.5), inch(0.12), "領導氣質，高瞻遠矚", size=7, color=RGBColor(0xB0,0xA0,0xC8))

# Astro card
card(s, sx + inch(0.15), sy + inch(2.2), sw - inch(0.3), inch(0.55), fill=BLUE_BG, border=RGBColor(0x1A,0x28,0x40))
tx(s, sx + inch(0.3), sy + inch(2.22), inch(0.3), inch(0.35), "♎", size=22, color=BLUE)
tx(s, sx + inch(0.7), sy + inch(2.25), sw - inch(1.0), inch(0.18), "天秤座", size=11, color=BLUE, bold=True)
tx(s, sx + inch(0.7), sy + inch(2.45), sw - inch(1.0), inch(0.12), "五行：金 | 守護：金星", size=7, color=MUTED)

# Unlock list
unlocks = ["Lv1 💬 基本對話", "Lv3 🔔 運勢提醒", "Lv5 👔 穿搭", "Lv8 🧭 方位", "Lv10 ✨ 進化"]
ux = sx + inch(0.15)
uy = sy + inch(2.9)
for i, u in enumerate(unlocks):
    tx(s, ux + (i % 3) * inch(0.85), uy + (i // 3) * inch(0.22), inch(0.85), inch(0.2), u, size=6, color=MUTED)

# Tier badges
ty = sy + inch(3.45)
card(s, sx + inch(0.15), ty, sw - inch(0.3), inch(0.5), fill=GOLD_BG, border=GOLD_BDR)
tiers = [("Free", "每日1次", MUTED), ("Member", "每日5次", GOLD), ("Supreme", "無限次", PURPLE)]
for i, (name, desc, clr) in enumerate(tiers):
    tx(s, sx + inch(0.3), ty + inch(0.05) + i * inch(0.15), inch(0.6), inch(0.15), name, size=7, color=clr, bold=True)
    tx(s, sx + inch(1.0), ty + inch(0.05) + i * inch(0.15), inch(1.0), inch(0.15), desc, size=7, color=DARK)

btn(s, sx + inch(0.2), sy + inch(4.15), sw - inch(0.4), inch(0.35), "進入靈犀", size=11)

# Right side: description
sx2, sy2, sw2, sh2 = phone_frame(s, inch(9.0), inch(4.0), "靈寵降臨 — 滿版展示")
tx(s, sx2, sy2 + inch(0.2), sw2, inch(0.5), "🦌", size=50, align=PP_ALIGN.CENTER)
tx(s, sx2, sy2 + inch(0.85), sw2, inch(0.35), "靈寵降臨！", size=20, color=GOLD, bold=True, align=PP_ALIGN.CENTER)
tx(s, sx2, sy2 + inch(1.2), sw2, inch(0.2), "青芽鹿 與你結緣", size=11, color=BLUE, bold=True, align=PP_ALIGN.CENTER)
multi_tx(s, sx2 + inch(0.2), sy2 + inch(1.6), sw2 - inch(0.4), inch(1.2), [
    ("你的靈寵「青芽鹿」源自立春節氣，", 8, MUTED, False),
    ("五行屬木，性情溫和好奇。", 8, MUTED, False),
    ("牠將陪伴你探索命理奧秘，", 8, MUTED, False),
    ("隨著互動成長、進化。", 8, MUTED, False),
], align=PP_ALIGN.CENTER)
card(s, sx2 + inch(0.15), sy2 + inch(2.7), sw2 - inch(0.3), inch(0.5), fill=PURPLE_BG, border=RGBColor(0x2A,0x22,0x40))
tx(s, sx2 + inch(0.3), sy2 + inch(2.75), sw2 - inch(0.5), inch(0.15), "紫微命盤", size=7, color=PURPLE)
tx(s, sx2 + inch(0.3), sy2 + inch(2.92), sw2 - inch(0.5), inch(0.15), "命宮主星：天機", size=10, color=PURPLE, bold=True)
card(s, sx2 + inch(0.15), sy2 + inch(3.3), sw2 - inch(0.3), inch(0.45), fill=BLUE_BG, border=RGBColor(0x1A,0x28,0x40))
tx(s, sx2 + inch(0.3), sy2 + inch(3.35), inch(0.3), inch(0.3), "♈", size=20, color=BLUE)
tx(s, sx2 + inch(0.65), sy2 + inch(3.35), sw2 - inch(0.9), inch(0.15), "牡羊座", size=10, color=BLUE, bold=True)
tx(s, sx2 + inch(0.65), sy2 + inch(3.52), sw2 - inch(0.9), inch(0.12), "五行：火 | 守護：火星", size=7, color=MUTED)
btn(s, sx2 + inch(0.2), sy2 + inch(4.05), sw2 - inch(0.4), inch(0.35), "進入靈犀", size=11)


# ══════════════════════════════════════
# SLIDE 7: Main Pet Screen
# ══════════════════════════════════════
s = prs.slides.add_slide(prs.slide_layouts[6]); set_bg(s)
slide_title(s, "靈寵中心 — 主畫面")
sx, sy, sw, sh = phone_frame(s, inch(6.666), inch(4.0))

# Status bar
add_shape(s, sx, sy, sw, inch(0.42), fill=RGBColor(0x0A,0x0A,0x10))
tx(s, sx + inch(0.1), sy + inch(0.06), inch(0.6), inch(0.2), "靈犀", size=11, color=GOLD, bold=True)
tx(s, sx + inch(0.6), sy + inch(0.08), inch(1.2), inch(0.15), "3月3日 · 午時", size=7, color=DARK, align=PP_ALIGN.CENTER)
tx(s, sx + sw - inch(1.4), sy + inch(0.08), inch(1.3), inch(0.15), "Lv.1 青芽鹿 · 木系", size=7, color=MUTED, align=PP_ALIGN.RIGHT)
# thin border
add_shape(s, sx, sy + inch(0.41), sw, inch(0.005), fill=GOLD_BDR)

# PetAvatar
acy = sy + inch(0.55)
# avatar circle
acx = sx + sw // 2 - inch(0.35)
add_shape(s, acx, acy, inch(0.7), inch(0.7), fill=GOLD_BG, border=RGBColor(0x28,0x24,0x14), radius=True)
tx(s, acx, acy + inch(0.08), inch(0.7), inch(0.55), "🦌", size=24, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)

# name row
tx(s, sx, acy + inch(0.78), sw, inch(0.18), "青芽鹿  Lv.1  · 木系", size=8, color=GOLD, align=PP_ALIGN.CENTER)

# EXP bar
bar_w = int(sw * 0.55)
bar_x = sx + (sw - bar_w) // 2
bar(s, bar_x, acy + inch(0.98), bar_w, inch(0.03), 0.45, GOLD, GOLD_BG)
tx(s, bar_x + bar_w + inch(0.05), acy + inch(0.95), inch(0.5), inch(0.12), "45/100", size=6, color=DARKEST)

# stars
tx(s, sx, acy + inch(1.08), sw, inch(0.15), "★ ☆ ☆ ☆ ☆   進化 1/5", size=7, color=GOLD, align=PP_ALIGN.CENTER)

# Chat area
chat_y = acy + inch(1.3)
# date separator
tx(s, sx, chat_y, sw, inch(0.12), "── 3/3（一）──", size=6, color=DARKEST, align=PP_ALIGN.CENTER)

# Bubble
by = chat_y + inch(0.18)
tx(s, sx + inch(0.12), by, sw, inch(0.12), "🦌 青芽鹿                    14:02", size=6, color=DARK)
card(s, sx + inch(0.12), by + inch(0.15), sw - inch(0.25), inch(1.15), fill=GOLD_BG, border=GOLD_BDR)
multi_tx(s, sx + inch(0.22), by + inch(0.2), sw - inch(0.45), inch(1.0), [
    ("主人好～今天木氣旺盛，萬物", 8, GOLD_DIM, False),
    ("生長之力正盛呢！🌿", 8, GOLD_DIM, False),
    ("", 4, MUTED, False),
    ("財運 ████████░░  78", 7, GOLD, False),
    ("桃花 █████░░░░░  52", 7, GOLD_DIM, False),
    ("事業 ███████░░░  68", 7, GOLD_DIM, False),
    ("健康 █████████░  85", 7, GOLD, False),
    ("", 3, MUTED, False),
    ("🧭 東南   🎨 綠色   🔢 3", 7, MUTED, False),
])

# ActionBar
ab_y = sy + sh - inch(0.95)
add_shape(s, sx, ab_y, sw, inch(0.01), fill=GOLD_BDR)

# Row 1 — nurture
abw = (sw - inch(0.35)) // 3
aby1 = ab_y + inch(0.06)
actions1 = [("🍖", "餵食", "+50"), ("🎾", "玩耍", "+30"), ("🧘", "冥想", "+20")]
for i, (emoji, label, exp) in enumerate(actions1):
    xx = sx + inch(0.1) + abw * i + inch(0.03) * i
    card(s, xx, aby1, abw, inch(0.38), fill=GOLD_BG, border=GOLD_BDR)
    tx(s, xx, aby1 + inch(0.03), abw, inch(0.14), emoji, size=11, align=PP_ALIGN.CENTER)
    tx(s, xx, aby1 + inch(0.17), abw, inch(0.1), label, size=7, color=GOLD_DIM, align=PP_ALIGN.CENTER)
    tx(s, xx, aby1 + inch(0.27), abw, inch(0.08), exp, size=6, color=DARKEST, align=PP_ALIGN.CENTER)

# Row 2 — abilities
aby2 = aby1 + inch(0.44)
actions2 = [("👁", "靈眼"), ("🌍", "靈心"), ("🏮", "靈魂")]
for i, (emoji, label) in enumerate(actions2):
    xx = sx + inch(0.1) + abw * i + inch(0.03) * i
    card(s, xx, aby2, abw, inch(0.35), fill=BLUE_BG, border=RGBColor(0x1A,0x28,0x3A))
    tx(s, xx, aby2 + inch(0.04), abw, inch(0.14), emoji, size=11, align=PP_ALIGN.CENTER)
    tx(s, xx, aby2 + inch(0.18), abw, inch(0.1), label, size=7, color=GOLD_DIM, align=PP_ALIGN.CENTER)

# Tab bar
tab_y = sy + sh - inch(0.55)
add_shape(s, sx, tab_y, sw, inch(0.55), fill=TAB_BG)
add_shape(s, sx, tab_y, sw, inch(0.005), fill=GOLD_BDR)
# pet tab (active)
ptx = sx + sw // 4 - inch(0.25)
add_shape(s, ptx, tab_y + inch(0.06), inch(0.5), inch(0.5), fill=GOLD_BG2, border=RGBColor(0x38,0x30,0x18), radius=True)
tx(s, ptx, tab_y + inch(0.08), inch(0.5), inch(0.3), "🔮", size=14, align=PP_ALIGN.CENTER)
tx(s, ptx, tab_y + inch(0.35), inch(0.5), inch(0.12), "靈寵", size=6, color=GOLD, align=PP_ALIGN.CENTER)
# profile tab
ptx2 = sx + sw * 3 // 4 - inch(0.2)
tx(s, ptx2, tab_y + inch(0.1), inch(0.4), inch(0.22), "⚙️", size=12, align=PP_ALIGN.CENTER)
tx(s, ptx2, tab_y + inch(0.35), inch(0.4), inch(0.12), "我的", size=6, color=DARKEST, align=PP_ALIGN.CENTER)


# ══════════════════════════════════════
# SLIDE 8: PetEyeMode — idle + analyzing
# ══════════════════════════════════════
s = prs.slides.add_slide(prs.slide_layouts[6]); set_bg(s)
slide_title(s, "靈眼模式 — 相機拍照 & 分析中")

# idle
sx, sy, sw, sh = phone_frame(s, inch(4.2), inch(4.0), "相機拍照")
# close btn
add_shape(s, sx + sw - inch(0.35), sy + inch(0.12), inch(0.25), inch(0.25), fill=RGBColor(0x20,0x20,0x28), radius=True)
tx(s, sx + sw - inch(0.35), sy + inch(0.12), inch(0.25), inch(0.25), "✕", size=10, color=MUTED, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)

# Camera area
card(s, sx + inch(0.1), sy + inch(0.5), sw - inch(0.2), inch(2.2), fill=RGBColor(0x12,0x15,0x18), border=RGBColor(0x20,0x25,0x2A))
# face frame (dashed effect with lighter border)
fcx = sx + sw // 2 - inch(0.5)
add_shape(s, fcx, sy + inch(0.9), inch(1.0), inch(1.3), fill=None, border=RGBColor(0x40,0x38,0x1A), bw=Pt(1), radius=True)
tx(s, fcx, sy + inch(1.25), inch(1.0), inch(0.5), "👤", size=28, align=PP_ALIGN.CENTER, color=MUTED)

# hint card
card(s, sx + inch(0.1), sy + inch(2.85), sw - inch(0.2), inch(0.32), fill=BLUE_BG, border=RGBColor(0x1A,0x28,0x3A))
tx(s, sx + inch(0.2), sy + inch(2.88), sw - inch(0.3), inch(0.25), "🦌  靈寵正在觀察你...", size=8, color=BLUE)

# capture button
btn(s, sx + inch(0.15), sy + inch(3.35), sw - inch(0.3), inch(0.4), "👁  開始面相分析", text_color=GOLD, bg=GOLD_BG2, border=GOLD_BDR, size=11)

tx(s, sx + inch(0.15), sy + inch(3.9), sw - inch(0.3), inch(0.2), "照片僅用於分析，不會上傳或儲存", size=6, color=DARKEST, align=PP_ALIGN.CENTER)

# analyzing
sx2, sy2, sw2, sh2 = phone_frame(s, inch(9.0), inch(4.0), "分析中")
add_shape(s, sx2 + sw2 - inch(0.35), sy2 + inch(0.12), inch(0.25), inch(0.25), fill=RGBColor(0x20,0x20,0x28), radius=True)
tx(s, sx2 + sw2 - inch(0.35), sy2 + inch(0.12), inch(0.25), inch(0.25), "✕", size=10, color=MUTED, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)

# scan frame
scx = sx2 + sw2 // 2 - inch(0.55)
add_shape(s, scx, sy2 + inch(0.6), inch(1.1), inch(1.4), fill=None, border=RGBColor(0x40,0x38,0x1A), bw=Pt(1.5), radius=True)
tx(s, scx, sy2 + inch(0.9), inch(1.1), inch(0.6), "🧑", size=36, align=PP_ALIGN.CENTER)
# dots
dots_y = sy2 + inch(1.5)
for dx in [0.2, 0.4, 0.55, 0.7, 0.85]:
    add_shape(s, scx + inch(dx), dots_y + inch(0.1 * (dx % 0.3)), inch(0.06), inch(0.06), fill=GOLD, radius=True)

# narrate
card(s, sx2 + inch(0.1), sy2 + inch(2.2), sw2 - inch(0.2), inch(0.32), fill=BLUE_BG, border=RGBColor(0x1A,0x28,0x3A))
tx(s, sx2 + inch(0.2), sy2 + inch(2.23), sw2 - inch(0.3), inch(0.25), "🦌  正在觀察你的面相...", size=8, color=BLUE)

# progress
tx(s, sx2, sy2 + inch(2.7), sw2, inch(0.35), "72%", size=22, color=GOLD, bold=True, align=PP_ALIGN.CENTER)
tx(s, sx2, sy2 + inch(3.05), sw2, inch(0.2), "定位五官特徵", size=9, color=MUTED, align=PP_ALIGN.CENTER)
bar(s, sx2 + inch(0.3), sy2 + inch(3.35), sw2 - inch(0.6), inch(0.03), 0.72, GOLD, GOLD_BG)


# ══════════════════════════════════════
# SLIDE 9: PetEyeMode — result
# ══════════════════════════════════════
s = prs.slides.add_slide(prs.slide_layouts[6]); set_bg(s)
slide_title(s, "靈眼模式 — 面相結果")
sx, sy, sw, sh = phone_frame(s, inch(6.666), inch(4.0))

add_shape(s, sx + sw - inch(0.35), sy + inch(0.12), inch(0.25), inch(0.25), fill=RGBColor(0x20,0x20,0x28), radius=True)
tx(s, sx + sw - inch(0.35), sy + inch(0.12), inch(0.25), inch(0.25), "✕", size=10, color=MUTED, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)

tx(s, sx, sy + inch(0.35), sw, inch(0.4), "大  吉", size=28, color=GOLD, bold=True, align=PP_ALIGN.CENTER)
tx(s, sx, sy + inch(0.75), sw, inch(0.2), "⭐ ⭐ ⭐ ⭐ ☆", size=10, align=PP_ALIGN.CENTER)

# Pet reading
card(s, sx + inch(0.1), sy + inch(1.05), sw - inch(0.2), inch(0.7), fill=BLUE_BG, border=RGBColor(0x1A,0x28,0x3A))
multi_tx(s, sx + inch(0.2), sy + inch(1.1), sw - inch(0.4), inch(0.6), [
    ("🦌 靈寵解讀", 7, BLUE, True),
    ("主人的天庭飽滿，印堂明亮，乃大貴", 8, RGBColor(0xA0,0xB8,0xD0), False),
    ("之相。眉清目秀，目光有神...", 8, RGBColor(0xA0,0xB8,0xD0), False),
])

# Score bars
card(s, sx + inch(0.1), sy + inch(1.85), sw - inch(0.2), inch(1.1), fill=GOLD_BG, border=GOLD_BDR)
features = [("天庭", 85, "飽滿"), ("眉", 72, "秀逸"), ("眼", 90, "明亮"), ("鼻", 68, "端正"), ("口", 78, "方正")]
fy = sy + inch(1.92)
for feat, score, desc in features:
    tx(s, sx + inch(0.2), fy, inch(0.3), inch(0.14), feat, size=7, color=MUTED)
    bar(s, sx + inch(0.55), fy + inch(0.04), int((sw - inch(1.5)) * 0.65), inch(0.025), score / 100.0,
        GOLD if score >= 80 else GOLD_DIM, GOLD_BG)
    tx(s, sx + sw - inch(0.8), fy, inch(0.2), inch(0.14), str(score), size=7, color=GOLD if score >= 80 else GOLD_DIM, bold=True, align=PP_ALIGN.CENTER)
    tx(s, sx + sw - inch(0.55), fy, inch(0.4), inch(0.14), desc, size=7, color=MUTED)
    fy += inch(0.2)

# Lucky item
card(s, sx + inch(0.1), sy + inch(3.05), sw - inch(0.2), inch(0.55), fill=BLUE_BG, border=RGBColor(0x1A,0x28,0x3A))
add_shape(s, sx + inch(0.2), sy + inch(3.1), inch(0.4), inch(0.4), fill=RGBColor(0x14,0x1C,0x24), radius=True)
tx(s, sx + inch(0.2), sy + inch(3.12), inch(0.4), inch(0.38), "🧿", size=20, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
tx(s, sx + inch(0.7), sy + inch(3.1), sw - inch(0.9), inch(0.18), "黑曜石手鏈", size=10, color=BLUE, bold=True)
tx(s, sx + inch(0.7), sy + inch(3.28), sw - inch(0.9), inch(0.12), "提升氣場穩定度", size=7, color=MUTED)
tx(s, sx + inch(0.7), sy + inch(3.42), sw - inch(0.9), inch(0.12), "🧭 東方   🔢 8", size=7, color=DARK)

btn(s, sx + inch(0.2), sy + inch(3.75), sw - inch(0.4), inch(0.32), "重新分析", text_color=GOLD_DIM, bg=GOLD_BG, border=GOLD_BDR, size=9, bold=False)


# ══════════════════════════════════════
# SLIDE 10: PetHeartMode — Compass
# ══════════════════════════════════════
s = prs.slides.add_slide(prs.slide_layouts[6]); set_bg(s)
slide_title(s, "靈心模式 — GPS 風水羅盤")
sx, sy, sw, sh = phone_frame(s, inch(4.2), inch(4.0), "羅盤 + 方位")

add_shape(s, sx + sw - inch(0.35), sy + inch(0.12), inch(0.25), inch(0.25), fill=RGBColor(0x20,0x20,0x28), radius=True)
tx(s, sx + sw - inch(0.35), sy + inch(0.12), inch(0.25), inch(0.25), "✕", size=10, color=MUTED, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)

# GPS card
card(s, sx + inch(0.1), sy + inch(0.45), sw - inch(0.2), inch(0.4), fill=GREEN_BG, border=RGBColor(0x1A,0x30,0x22))
add_shape(s, sx + inch(0.2), sy + inch(0.57), inch(0.07), inch(0.07), fill=GREEN, radius=True)
tx(s, sx + inch(0.32), sy + inch(0.5), inch(1.0), inch(0.14), "GPS 訊號正常", size=7, color=GREEN)
tx(s, sx + inch(0.2), sy + inch(0.65), sw - inch(0.4), inch(0.12), "25.034°N  121.564°E", size=6, color=DARKEST)
tx(s, sx + inch(0.2), sy + inch(0.65), sw - inch(0.4), inch(0.12), "台北市信義區", size=7, color=MUTED, align=PP_ALIGN.RIGHT)

# pet hint
card(s, sx + inch(0.1), sy + inch(0.95), sw - inch(0.2), inch(0.28), fill=BLUE_BG, border=RGBColor(0x1A,0x28,0x3A))
tx(s, sx + inch(0.2), sy + inch(0.98), sw - inch(0.3), inch(0.22), "🦌  正在感應此地的靈氣...", size=7, color=BLUE)

# Compass
comp_cx = sx + sw // 2
comp_cy = sy + inch(1.8)
comp_r = inch(0.7)
# ring
add_shape(s, comp_cx - comp_r, comp_cy - comp_r, comp_r * 2, comp_r * 2, fill=None, border=RGBColor(0x38,0x32,0x1A), bw=Pt(1.5), radius=True)
# center dot
add_shape(s, comp_cx - inch(0.04), comp_cy - inch(0.04), inch(0.08), inch(0.08), fill=GOLD, radius=True)
# needle
add_shape(s, comp_cx - inch(0.02), comp_cy - inch(0.4), inch(0.04), inch(0.38), fill=GOLD, radius=True)
# directions
dirs = [("北", 0, GOLD, True), ("東北", 45, MUTED, False), ("東", 90, RED, False), ("東南", 135, GOLD, True),
        ("南", 180, MUTED, False), ("西南", 225, MUTED, False), ("西", 270, GOLD, True), ("西北", 315, RED, False)]
for d_name, angle, d_color, is_lucky in dirs:
    rad = math.radians(angle - 90)
    dx = int(math.cos(rad) * inch(0.55))
    dy = int(math.sin(rad) * inch(0.55))
    tx(s, comp_cx + dx - inch(0.15), comp_cy + dy - inch(0.08), inch(0.3), inch(0.16), d_name,
       size=7, color=d_color, bold=is_lucky, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)

tx(s, sx, comp_cy + comp_r + inch(0.1), sw, inch(0.12), "午時 · 奇門時盤 · 182°", size=6, color=DARKEST, align=PP_ALIGN.CENTER)

# Direction summary
dsy = comp_cy + comp_r + inch(0.28)
dhw = (sw - inch(0.3)) // 2
card(s, sx + inch(0.1), dsy, dhw, inch(0.38), fill=GOLD_BG, border=GOLD_BDR)
tx(s, sx + inch(0.15), dsy + inch(0.02), dhw - inch(0.1), inch(0.12), "吉方", size=7, color=MUTED, align=PP_ALIGN.CENTER)
tx(s, sx + inch(0.15), dsy + inch(0.16), dhw - inch(0.1), inch(0.18), "東南  西  北", size=9, color=GOLD, bold=True, align=PP_ALIGN.CENTER)

card(s, sx + inch(0.1) + dhw + inch(0.1), dsy, dhw, inch(0.38), fill=RGBColor(0x18,0x0E,0x0E), border=RGBColor(0x40,0x1A,0x1A))
tx(s, sx + inch(0.2) + dhw, dsy + inch(0.02), dhw - inch(0.1), inch(0.12), "凶方", size=7, color=MUTED, align=PP_ALIGN.CENTER)
tx(s, sx + inch(0.2) + dhw, dsy + inch(0.16), dhw - inch(0.1), inch(0.18), "東  西北", size=9, color=RED, bold=True, align=PP_ALIGN.CENTER)

# analyze button
btn(s, sx + inch(0.1), dsy + inch(0.48), sw - inch(0.2), inch(0.35), "🧭  分析此地風水", text_color=GREEN, bg=GREEN_BG, border=RGBColor(0x1A,0x30,0x22), size=9)

# Right phone: result
sx2, sy2, sw2, sh2 = phone_frame(s, inch(9.0), inch(4.0), "風水分析結果")
add_shape(s, sx2 + sw2 - inch(0.35), sy2 + inch(0.12), inch(0.25), inch(0.25), fill=RGBColor(0x20,0x20,0x28), radius=True)
tx(s, sx2 + sw2 - inch(0.35), sy2 + inch(0.12), inch(0.25), inch(0.25), "✕", size=10, color=MUTED, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)

# reading card
card(s, sx2 + inch(0.1), sy2 + inch(0.5), sw2 - inch(0.2), inch(0.9), fill=BLUE_BG, border=RGBColor(0x1A,0x28,0x3A))
multi_tx(s, sx2 + inch(0.2), sy2 + inch(0.55), sw2 - inch(0.4), inch(0.8), [
    ("🦌 靈寵風水解讀", 7, BLUE, True),
    ("", 3, MUTED, False),
    ("此地木氣充沛，靈氣流動順暢。", 8, RGBColor(0xA0,0xB8,0xD0), False),
    ("東南方有生氣匯聚，適合作為", 8, RGBColor(0xA0,0xB8,0xD0), False),
    ("工作或創意思考的區域。", 8, RGBColor(0xA0,0xB8,0xD0), False),
])

# tips
card(s, sx2 + inch(0.1), sy2 + inch(1.55), sw2 - inch(0.2), inch(0.85), fill=GOLD_BG, border=GOLD_BDR)
multi_tx(s, sx2 + inch(0.2), sy2 + inch(1.6), sw2 - inch(0.4), inch(0.75), [
    ("🌿  建議在東南方擺放綠色植物", 8, GOLD_DIM, False),
    ("💧  北方可放置小型水景", 8, GOLD_DIM, False),
    ("🕯  避免在西北方放置尖銳物品", 8, GOLD_DIM, False),
    ("🪑  座位建議面朝東南方", 8, GOLD_DIM, False),
])

# seat advice
card(s, sx2 + inch(0.1), sy2 + inch(2.55), sw2 - inch(0.2), inch(0.6), fill=BLUE_BG, border=RGBColor(0x1A,0x28,0x3A))
multi_tx(s, sx2 + inch(0.2), sy2 + inch(2.6), sw2 - inch(0.4), inch(0.5), [
    ("📐 座位建議", 7, BLUE, True),
    ("面向東南方，背靠實牆，左手邊", 8, RGBColor(0xA0,0xB8,0xD0), False),
    ("放置檯燈可增強文昌位能量。", 8, RGBColor(0xA0,0xB8,0xD0), False),
])

tx(s, sx2, sy2 + inch(3.3), sw2, inch(0.15), "僅供參考，請結合實際環境判斷", size=6, color=DARKEST, align=PP_ALIGN.CENTER)


# ══════════════════════════════════════
# SLIDE 11: PetPearlMode idle + shaking
# ══════════════════════════════════════
s = prs.slides.add_slide(prs.slide_layouts[6]); set_bg(s)
slide_title(s, "靈魂模式 — 選擇問事 & 搖卦")

# idle
sx, sy, sw, sh = phone_frame(s, inch(4.2), inch(4.0), "選擇問事類別")
add_shape(s, sx + sw - inch(0.35), sy + inch(0.12), inch(0.25), inch(0.25), fill=RGBColor(0x20,0x20,0x28), radius=True)
tx(s, sx + sw - inch(0.35), sy + inch(0.12), inch(0.25), inch(0.25), "✕", size=10, color=MUTED, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)

card(s, sx + inch(0.1), sy + inch(0.5), sw - inch(0.2), inch(0.28), fill=BLUE_BG, border=RGBColor(0x1A,0x28,0x3A))
tx(s, sx + inch(0.2), sy + inch(0.53), sw - inch(0.3), inch(0.22), "🦌  主人有什麼想問的嗎？", size=8, color=BLUE)

# Categories
cats = [("💼", "事業", True), ("❤️", "感情", False), ("🏠", "家庭", False), ("🏥", "健康", False), ("📚", "學業", False)]
cw = (sw - inch(0.4)) // 3
cy_start = sy + inch(0.95)
for i, (emoji, label, active) in enumerate(cats):
    row = i // 3
    col = i % 3
    cx = sx + inch(0.15) + col * (cw + inch(0.05))
    cyy = cy_start + row * (inch(0.5))
    bg_c = GOLD_BG2 if active else GOLD_BG
    bd_c = GOLD if active else GOLD_BDR
    tc = GOLD if active else MUTED
    card(s, cx, cyy, cw, inch(0.45), fill=bg_c, border=bd_c)
    tx(s, cx, cyy + inch(0.05), cw, inch(0.18), emoji, size=14, align=PP_ALIGN.CENTER)
    tx(s, cx, cyy + inch(0.26), cw, inch(0.14), label, size=8, color=tc, align=PP_ALIGN.CENTER)

# question input
ty_q = cy_start + inch(1.1)
tx(s, sx + inch(0.15), ty_q, sw - inch(0.3), inch(0.12), "輸入問題（選填）", size=7, color=DARK)
card(s, sx + inch(0.1), ty_q + inch(0.15), sw - inch(0.2), inch(0.4), fill=GOLD_BG, border=GOLD_BDR)
tx(s, sx + inch(0.2), ty_q + inch(0.2), sw - inch(0.4), inch(0.3), "我今年適合換工作嗎？", size=9, color=GOLD_DIM)

# start button
btn(s, sx + inch(0.1), ty_q + inch(0.7), sw - inch(0.2), inch(0.42), "🏮  起卦問靈", text_color=GOLD, bg=GOLD_BG2, border=GOLD_BDR, size=12)

# shaking
sx2, sy2, sw2, sh2 = phone_frame(s, inch(9.0), inch(4.0), "搖卦中")
tx(s, sx2, sy2 + inch(1.2), sw2, inch(0.4), "☰ ☷ ☳ ☴ ☵ ☲ ☶ ☱", size=18, color=GOLD, align=PP_ALIGN.CENTER)
tx(s, sx2, sy2 + inch(1.8), sw2, inch(0.3), "卦象凝聚中...", size=12, color=GOLD_DIM, align=PP_ALIGN.CENTER)
card(s, sx2 + inch(0.2), sy2 + inch(2.5), sw2 - inch(0.4), inch(0.35), fill=BLUE_BG, border=RGBColor(0x1A,0x28,0x3A))
tx(s, sx2 + inch(0.3), sy2 + inch(2.53), sw2 - inch(0.5), inch(0.28), "🦌  正在為主人通靈...", size=9, color=BLUE, align=PP_ALIGN.CENTER)
tx(s, sx2, sy2 + inch(3.2), sw2, inch(0.2), "📳 震動回饋中", size=7, color=DARKEST, align=PP_ALIGN.CENTER)


# ══════════════════════════════════════
# SLIDE 12: PetPearlMode result
# ══════════════════════════════════════
s = prs.slides.add_slide(prs.slide_layouts[6]); set_bg(s)
slide_title(s, "靈魂模式 — 占卜結果")
sx, sy, sw, sh = phone_frame(s, inch(4.2), inch(4.0), "本卦 + 解讀")

add_shape(s, sx + sw - inch(0.35), sy + inch(0.12), inch(0.25), inch(0.25), fill=RGBColor(0x20,0x20,0x28), radius=True)
tx(s, sx + sw - inch(0.35), sy + inch(0.12), inch(0.25), inch(0.25), "✕", size=10, color=MUTED, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)

# Hexagram card
card(s, sx + inch(0.1), sy + inch(0.45), sw - inch(0.2), inch(2.3), fill=RGBColor(0x0C,0x0C,0x12), border=GOLD_BDR)
tx(s, sx, sy + inch(0.5), sw, inch(0.5), "䷀", size=36, align=PP_ALIGN.CENTER)
tx(s, sx, sy + inch(0.95), sw, inch(0.2), "第1卦 · 乾", size=13, color=GOLD, bold=True, align=PP_ALIGN.CENTER)

# Oracle
card(s, sx + inch(0.2), sy + inch(1.25), sw - inch(0.4), inch(0.28), fill=GOLD_BG, border=GOLD_BDR)
tx(s, sx + inch(0.2), sy + inch(1.27), sw - inch(0.4), inch(0.24), "「元亨利貞」", size=11, color=GOLD, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)

tx(s, sx + inch(0.2), sy + inch(1.6), sw - inch(0.4), inch(0.2), "天行健，君子以自強不息", size=8, color=MUTED, align=PP_ALIGN.CENTER)

# Interpretation
card(s, sx + inch(0.15), sy + inch(1.9), sw - inch(0.3), inch(0.7), fill=GOLD_BG, border=GOLD_BDR)
tx(s, sx + inch(0.25), sy + inch(1.93), inch(0.3), inch(0.14), "💼 事業", size=7, color=GOLD_DIM)
btn(s, sx + sw - inch(0.7), sy + inch(1.93), inch(0.45), inch(0.16), "大宜", text_color=GOLD, bg=GOLD_BG2, border=GOLD, size=7)
multi_tx(s, sx + inch(0.25), sy + inch(2.12), sw - inch(0.5), inch(0.4), [
    ("天道運行不息，此卦示意進取之機，", 7, GOLD_DIM, False),
    ("可大膽行動，積極拓展。", 7, GOLD_DIM, False),
    ("七日內宜行動", 6, DARK, False),
])

# 4 info items
iw = (sw - inch(0.4)) // 4
iy = sy + inch(2.7)
infos = [("上卦", "乾"), ("下卦", "乾"), ("五行", "金"), ("運勢", "大吉")]
for i, (lab, val) in enumerate(infos):
    ix = sx + inch(0.15) + iw * i
    tx(s, ix, iy, iw, inch(0.1), lab, size=6, color=DARKEST, align=PP_ALIGN.CENTER)
    vc = GOLD if val == "大吉" else GOLD_DIM
    tx(s, ix, iy + inch(0.12), iw, inch(0.16), val, size=9, color=vc, bold=True, align=PP_ALIGN.CENTER)

# action buttons
bhw = (sw - inch(0.35)) // 2
btn(s, sx + inch(0.1), sy + inch(3.1), bhw, inch(0.3), "🔗 分享", text_color=GOLD_DIM, bg=GOLD_BG, border=GOLD_BDR, size=8, bold=False)
btn(s, sx + inch(0.1) + bhw + inch(0.15), sy + inch(3.1), bhw, inch(0.3), "🏮 再卜一卦", size=8)

# Right phone: changed hexagram + pet reading
sx2, sy2, sw2, sh2 = phone_frame(s, inch(9.0), inch(4.0), "變卦 + 靈寵解讀")

# Changed hexagram
card(s, sx2 + inch(0.1), sy2 + inch(0.4), sw2 - inch(0.2), inch(0.9), fill=PURPLE_BG, border=RGBColor(0x2A,0x22,0x40))
tx(s, sx2 + inch(0.15), sy2 + inch(0.42), sw2 - inch(0.3), inch(0.12), "── 變卦 ──", size=7, color=MUTED, align=PP_ALIGN.CENTER)
tx(s, sx2, sy2 + inch(0.55), sw2, inch(0.3), "䷁  坤", size=14, color=PURPLE, bold=True, align=PP_ALIGN.CENTER)
tx(s, sx2 + inch(0.2), sy2 + inch(0.85), sw2 - inch(0.4), inch(0.15), "地勢坤，君子以厚德載物", size=8, color=RGBColor(0xB0,0xA0,0xC8), align=PP_ALIGN.CENTER)
tx(s, sx2 + inch(0.2), sy2 + inch(1.02), sw2 - inch(0.4), inch(0.12), "變爻：第 1、3 爻", size=7, color=DARK, align=PP_ALIGN.CENTER)

# Pet reading
card(s, sx2 + inch(0.1), sy2 + inch(1.45), sw2 - inch(0.2), inch(0.85), fill=BLUE_BG, border=RGBColor(0x1A,0x28,0x3A))
multi_tx(s, sx2 + inch(0.2), sy2 + inch(1.5), sw2 - inch(0.4), inch(0.75), [
    ("🦌 靈寵解讀", 7, BLUE, True),
    ("", 3, MUTED, False),
    ("主人抽到了乾卦，這是六十四卦之", 8, RGBColor(0xA0,0xB8,0xD0), False),
    ("首！天道剛健，正是主人發揮實力", 8, RGBColor(0xA0,0xB8,0xD0), False),
    ("的好時機呢～ 🌟", 8, RGBColor(0xA0,0xB8,0xD0), False),
])

# Question recap
card(s, sx2 + inch(0.1), sy2 + inch(2.45), sw2 - inch(0.2), inch(0.45), fill=GOLD_BG, border=GOLD_BDR)
tx(s, sx2 + inch(0.2), sy2 + inch(2.48), sw2 - inch(0.4), inch(0.12), "❓ 原始問題", size=7, color=BLUE)
tx(s, sx2 + inch(0.2), sy2 + inch(2.63), sw2 - inch(0.4), inch(0.2), "我今年適合換工作嗎？", size=9, color=GOLD_DIM)

# buttons
bhw2 = (sw2 - inch(0.35)) // 2
btn(s, sx2 + inch(0.1), sy2 + inch(3.1), bhw2, inch(0.3), "🔗 分享", text_color=GOLD_DIM, bg=GOLD_BG, border=GOLD_BDR, size=8, bold=False)
btn(s, sx2 + inch(0.1) + bhw2 + inch(0.15), sy2 + inch(3.1), bhw2, inch(0.3), "🏮 再卜一卦", size=8)


# ══════════════════════════════════════
# SLIDE 13: UpgradeModal
# ══════════════════════════════════════
s = prs.slides.add_slide(prs.slide_layouts[6]); set_bg(s)
slide_title(s, "升級方案彈窗")
sx, sy, sw, sh = phone_frame(s, inch(6.666), inch(4.0))

# overlay darken
add_shape(s, sx, sy, sw, sh, fill=RGBColor(0x05,0x05,0x08))

# modal card
mw = int(sw * 0.88)
mx = sx + (sw - mw) // 2
my = sy + inch(0.3)
mh = inch(4.6)
card(s, mx, my, mw, mh, fill=SURFACE, border=RGBColor(0x28,0x24,0x14))

# pet speech
tx(s, mx + inch(0.15), my + inch(0.15), mw - inch(0.3), inch(0.5), "🐉  主人，今天次數用完了......升級之後靈寵可以為你做更多事喔！", size=8, color=GOLD_DIM)

# Member card
mcy = my + inch(0.7)
card(s, mx + inch(0.1), mcy, mw - inch(0.2), inch(1.35), fill=GOLD_BG, border=GOLD_BDR)
tx(s, mx + inch(0.2), mcy + inch(0.05), inch(1.0), inch(0.18), "⭐ 靈犀會員", size=10, color=GOLD, bold=True)
tx(s, mx + inch(0.2), mcy + inch(0.05), mw - inch(0.4), inch(0.18), "$390/月", size=9, color=GOLD, align=PP_ALIGN.RIGHT)
multi_tx(s, mx + inch(0.2), mcy + inch(0.3), mw - inch(0.4), inch(0.5), [
    ("· 靈眼/靈心/靈魂 5次/日", 8, DARK, False),
    ("· 靈寵等級上限 Lv.20", 8, DARK, False),
    ("· AI 深度解讀（Sonnet）", 8, DARK, False),
])
btn(s, mx + inch(0.15), mcy + inch(0.9), mw - inch(0.3), inch(0.3), "立即升級", text_color=GOLD, bg=GOLD_BG2, border=GOLD, size=9)

# Supreme card
scy = my + inch(2.2)
card(s, mx + inch(0.1), scy, mw - inch(0.2), inch(1.35), fill=PURPLE_BG, border=RGBColor(0x2A,0x22,0x40))
tx(s, mx + inch(0.2), scy + inch(0.05), inch(1.0), inch(0.18), "👑 靈犀至尊", size=10, color=PURPLE, bold=True)
tx(s, mx + inch(0.2), scy + inch(0.05), mw - inch(0.4), inch(0.18), "$1,990/月", size=9, color=PURPLE, align=PP_ALIGN.RIGHT)
multi_tx(s, mx + inch(0.2), scy + inch(0.3), mw - inch(0.4), inch(0.5), [
    ("· 全功能無限使用", 8, DARK, False),
    ("· 靈寵等級無上限", 8, DARK, False),
    ("· 專屬進化 + 皮膚", 8, DARK, False),
])
btn(s, mx + inch(0.15), scy + inch(0.9), mw - inch(0.3), inch(0.3), "立即升級", text_color=PURPLE, bg=PURPLE_BG, border=RGBColor(0x38,0x2E,0x55), size=9)

# dismiss
tx(s, mx, my + mh - inch(0.35), mw, inch(0.25), "明天再來", size=9, color=DARKEST, align=PP_ALIGN.CENTER)


# ══════════════════════════════════════
# SLIDE 14: Profile Screen
# ══════════════════════════════════════
s = prs.slides.add_slide(prs.slide_layouts[6]); set_bg(s)
slide_title(s, "我的 — 個人設定")
sx, sy, sw, sh = phone_frame(s, inch(6.666), inch(4.0))

tx(s, sx + inch(0.15), sy + inch(0.25), sw, inch(0.3), "我的", size=18, color=GOLD, bold=True)

# User card
card(s, sx + inch(0.1), sy + inch(0.6), sw - inch(0.2), inch(0.55), fill=BLUE_BG, border=RGBColor(0x1A,0x28,0x3A))
tx(s, sx + inch(0.2), sy + inch(0.63), inch(0.4), inch(0.4), "🦌", size=22, anchor=MSO_ANCHOR.MIDDLE)
tx(s, sx + inch(0.6), sy + inch(0.65), sw - inch(1.2), inch(0.18), "青芽鹿", size=12, color=GOLD, bold=True)
tx(s, sx + inch(0.6), sy + inch(0.83), sw - inch(1.2), inch(0.12), "Lv.1 青芽鹿 · 木系 · 立春", size=7, color=DARK)
btn(s, sx + sw - inch(0.65), sy + inch(0.7), inch(0.45), inch(0.2), "FREE", text_color=MUTED, bg=RGBColor(0x14,0x14,0x1A), border=RGBColor(0x30,0x30,0x38), size=7, bold=False)

# Upgrade CTA
card(s, sx + inch(0.1), sy + inch(1.25), sw - inch(0.2), inch(0.3), fill=GOLD_BG, border=GOLD_BDR)
tx(s, sx + inch(0.2), sy + inch(1.28), sw - inch(0.4), inch(0.24), "⭐ 升級會員解鎖更多功能", size=9, color=GOLD, bold=True, anchor=MSO_ANCHOR.MIDDLE)

# Language
tx(s, sx + inch(0.15), sy + inch(1.7), sw, inch(0.15), "語言設定", size=8, color=MUTED)
card(s, sx + inch(0.1), sy + inch(1.88), sw - inch(0.2), inch(0.3), fill=GOLD_BG, border=GOLD_BDR)
tx(s, sx + inch(0.2), sy + inch(1.9), sw - inch(0.8), inch(0.26), "🇹🇼  繁體中文", size=9, color=GOLD_DIM, anchor=MSO_ANCHOR.MIDDLE)
tx(s, sx + inch(0.2), sy + inch(1.9), sw - inch(0.4), inch(0.26), "›", size=12, color=DARK, align=PP_ALIGN.RIGHT, anchor=MSO_ANCHOR.MIDDLE)

# Destiny data
tx(s, sx + inch(0.15), sy + inch(2.32), sw, inch(0.15), "命盤資料", size=8, color=MUTED)
card(s, sx + inch(0.1), sy + inch(2.5), sw - inch(0.2), inch(0.72), fill=GOLD_BG, border=GOLD_BDR)
destiny = [("八字", "甲子 乙丑 丙寅 丁卯"), ("紫微主星", "紫微"), ("星座", "天秤座"), ("節氣靈寵", "🦌 青芽鹿")]
for i, (lab, val) in enumerate(destiny):
    dy = sy + inch(2.54) + i * inch(0.17)
    tx(s, sx + inch(0.2), dy, inch(0.6), inch(0.14), lab, size=7, color=DARK)
    tx(s, sx + inch(0.85), dy, sw - inch(1.1), inch(0.14), val, size=8, color=GOLD_DIM)

# Other
tx(s, sx + inch(0.15), sy + inch(3.38), sw, inch(0.15), "其他", size=8, color=MUTED)
card(s, sx + inch(0.1), sy + inch(3.55), sw - inch(0.2), inch(1.0), fill=GOLD_BG, border=GOLD_BDR)
others = ["通知設定", "隱私權政策", "服務條款", "關於靈犀", "恢復購買"]
for i, item in enumerate(others):
    oy = sy + inch(3.58) + i * inch(0.17)
    tx(s, sx + inch(0.2), oy, sw - inch(0.8), inch(0.14), item, size=8, color=GOLD_DIM)
    tx(s, sx + inch(0.2), oy, sw - inch(0.4), inch(0.14), "›", size=10, color=DARKEST, align=PP_ALIGN.RIGHT)
oy = sy + inch(3.58) + 5 * inch(0.17)
tx(s, sx + inch(0.2), oy, sw - inch(0.8), inch(0.14), "登出", size=8, color=RED)


# ══════════════════════════════════════
# SLIDE 15: Chat Bubble Types
# ══════════════════════════════════════
s = prs.slides.add_slide(prs.slide_layouts[6]); set_bg(s)
slide_title(s, "聊天氣泡 — 各類型呈現")

# Fortune bubble
bx, by = inch(0.5), inch(0.8)
bw_chat = inch(3.8)
tx(s, bx, by, bw_chat, inch(0.14), "🦌 青芽鹿                    14:02", size=8, color=DARK)
card(s, bx, by + inch(0.17), bw_chat, inch(1.6), fill=GOLD_BG, border=GOLD_BDR)
multi_tx(s, bx + inch(0.12), by + inch(0.22), bw_chat - inch(0.24), inch(1.5), [
    ("主人好～今天木氣旺盛，適合創意類活", 9, GOLD_DIM, False),
    ("動，財運亦佳。午後注意休息。", 9, GOLD_DIM, False),
    ("「春生夏長，秋收冬藏」", 8, DARK, False),
    ("", 4, MUTED, False),
    ("財運 ████████░░  78", 8, GOLD, False),
    ("桃花 █████░░░░░  52", 8, GOLD_DIM, False),
    ("事業 ███████░░░  68", 8, GOLD_DIM, False),
    ("健康 █████████░  85", 8, GOLD, False),
    ("學業 ██████░░░░  62", 8, GOLD_DIM, False),
    ("", 3, MUTED, False),
    ("🧭 東南   🎨 綠色   🔢 3", 8, MUTED, False),
])
tx(s, bx, by + inch(1.85), bw_chat, inch(0.15), "▲ type: fortune — 每日運勢氣泡", size=8, color=GOLD, bold=True)

# Face bubble
bx2 = inch(4.8)
tx(s, bx2, by, bw_chat, inch(0.14), "🦌 青芽鹿                    15:30", size=8, color=DARK)
card(s, bx2, by + inch(0.17), bw_chat, inch(1.4), fill=GOLD_BG, border=GOLD_BDR)
multi_tx(s, bx2 + inch(0.12), by + inch(0.22), bw_chat - inch(0.24), inch(1.3), [
    ("主人的面相顯示天庭飽滿、眉清目秀，", 9, GOLD_DIM, False),
    ("乃大貴之相！✨", 9, GOLD_DIM, False),
    ("", 4, MUTED, False),
    ("天庭 █████████░  85  飽滿", 8, GOLD, False),
    ("眉   ███████░░░  72  秀逸", 8, GOLD_DIM, False),
    ("眼   █████████░  90  明亮", 8, GOLD, False),
    ("鼻   ██████░░░░  68  端正", 8, GOLD_DIM, False),
    ("口   ████████░░  78  方正", 8, GOLD_DIM, False),
    ("", 3, MUTED, False),
    ("🧿 幸運物：黑曜石手鏈   🧭 東方   🔢 8", 7, MUTED, False),
])
tx(s, bx2, by + inch(1.65), bw_chat, inch(0.15), "▲ type: face — 面相分析氣泡", size=8, color=GOLD, bold=True)

# Divination bubble
bx3 = inch(9.1)
tx(s, bx3, by, bw_chat, inch(0.14), "🦌 青芽鹿                    16:15", size=8, color=DARK)
card(s, bx3, by + inch(0.17), bw_chat, inch(1.4), fill=GOLD_BG, border=GOLD_BDR)
multi_tx(s, bx3 + inch(0.12), by + inch(0.22), bw_chat - inch(0.24), inch(1.3), [
    ("主人問了事業方面的問題，靈寵為你", 9, GOLD_DIM, False),
    ("卜得乾卦，大吉之象！🌟", 9, GOLD_DIM, False),
    ("", 4, MUTED, False),
    ("     ䷀  乾卦", 12, GOLD, True),
    ("   「元亨利貞」", 10, GOLD_DIM, False),
    ("", 3, MUTED, False),
    ("💼 事業: 大宜", 9, GOLD, True),
    ("天道運行不息，進取之機。", 8, MUTED, False),
])
tx(s, bx3, by + inch(1.65), bw_chat, inch(0.15), "▲ type: divination — 占卜氣泡", size=8, color=GOLD, bold=True)

# Bottom row: EXP + levelup + evolve
row2_y = inch(3.3)
# Feed
tx(s, inch(0.5), row2_y, inch(3.0), inch(0.14), "🦌 青芽鹿               09:12", size=8, color=DARK)
card(s, inch(0.5), row2_y + inch(0.17), inch(3.0), inch(0.6), fill=GOLD_BG, border=GOLD_BDR)
tx(s, inch(0.62), row2_y + inch(0.22), inch(2.7), inch(0.18), "主人餵了我好吃的，好開心！", size=9, color=GOLD_DIM)
btn(s, inch(0.62), row2_y + inch(0.45), inch(0.8), inch(0.22), "+50 EXP", text_color=GOLD, bg=GOLD_BG2, border=GOLD, size=8)
tx(s, inch(0.5), row2_y + inch(0.85), inch(3.0), inch(0.15), "▲ type: feed — 餵食", size=8, color=GOLD, bold=True)

# Levelup
tx(s, inch(4.2), row2_y, inch(3.0), inch(0.14), "🦌 青芽鹿               09:12", size=8, color=DARK)
card(s, inch(4.2), row2_y + inch(0.17), inch(3.0), inch(0.6), fill=GOLD_BG, border=GOLD_BDR)
tx(s, inch(4.32), row2_y + inch(0.22), inch(2.7), inch(0.18), "太棒了！我感覺力量在增長！", size=9, color=GOLD_DIM)
btn(s, inch(4.32), row2_y + inch(0.45), inch(0.9), inch(0.22), "⬆️ Lv.5", text_color=GOLD, bg=GOLD_BG2, border=GOLD, size=8)
tx(s, inch(4.2), row2_y + inch(0.85), inch(3.0), inch(0.15), "▲ type: levelup — 升級", size=8, color=GOLD, bold=True)

# Evolve
tx(s, inch(7.9), row2_y, inch(3.0), inch(0.14), "🦌 青芽鹿               09:15", size=8, color=DARK)
card(s, inch(7.9), row2_y + inch(0.17), inch(3.0), inch(0.6), fill=PURPLE_BG, border=RGBColor(0x2A,0x22,0x40))
tx(s, inch(8.02), row2_y + inch(0.22), inch(2.7), inch(0.18), "靈寵正在進化...光芒閃耀！✨", size=9, color=RGBColor(0xB0,0xA0,0xC8))
btn(s, inch(8.02), row2_y + inch(0.45), inch(1.1), inch(0.22), "🌟 進化階段 2", text_color=PURPLE, bg=PURPLE_BG, border=RGBColor(0x38,0x2E,0x55), size=8)
tx(s, inch(7.9), row2_y + inch(0.85), inch(3.0), inch(0.15), "▲ type: evolve — 進化", size=8, color=PURPLE, bold=True)

# Fengshui bubble
row3_y = inch(4.6)
tx(s, inch(0.5), row3_y, inch(3.8), inch(0.14), "🦌 青芽鹿                    15:00", size=8, color=DARK)
card(s, inch(0.5), row3_y + inch(0.17), inch(3.8), inch(1.8), fill=GOLD_BG, border=GOLD_BDR)
multi_tx(s, inch(0.62), row3_y + inch(0.22), inch(3.5), inch(0.4), [
    ("此地靈氣流動順暢，東南方有生氣", 9, GOLD_DIM, False),
    ("匯聚，適合工作。", 9, GOLD_DIM, False),
])
# 3x3 compass grid
gx = inch(0.7); gy = row3_y + inch(0.7)
gcw = inch(0.9); gch = inch(0.32)
grid_dirs = [
    ("西北","凶"), ("北","吉"), ("東北",""),
    ("西","吉"), ("中宮","—"), ("東","凶"),
    ("西南",""), ("南",""), ("東南","吉"),
]
for gi, (gname, gtype) in enumerate(grid_dirs):
    gr = gi // 3; gc = gi % 3
    gxx = gx + gc * (gcw + inch(0.04))
    gyy = gy + gr * (gch + inch(0.03))
    gbg = GOLD_BG2 if gtype == "吉" else (RGBColor(0x18,0x0E,0x0E) if gtype == "凶" else RGBColor(0x0E,0x0E,0x12))
    card(s, gxx, gyy, gcw, gch, fill=gbg, border=GOLD_BDR)
    tc = GOLD if gtype == "吉" else (RED if gtype == "凶" else DARKEST)
    tx(s, gxx, gyy, gcw, gch, gname, size=8, color=tc, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)

tx(s, inch(0.62), gy + 3*(gch+inch(0.03)) + inch(0.05), inch(3.5), inch(0.14), "吉方：北 西 東南  |  凶方：西北 東", size=7, color=MUTED)
tx(s, inch(0.5), row3_y + inch(2.05), inch(3.8), inch(0.15), "▲ type: fengshui — 風水方位氣泡", size=8, color=GREEN, bold=True)

# note
tx(s, inch(5.0), row3_y + inch(0.3), inch(7.5), inch(1.5),
   "所有功能的分析結果都會以\n聊天氣泡形式呈現在主畫面，\n使用者可以隨時回顧歷史紀錄。\n\n每種氣泡類型都有獨特的\n嵌入式資料視覺化：\n\n• fortune — 五維分數條 + 幸運資訊\n• face — 五官分數條 + 幸運物品\n• fengshui — 3×3 方位宮格\n• divination — 卦象 + 解讀\n• feed/play/meditate — EXP 標籤\n• levelup — 等級標籤\n• evolve — 進化標籤（紫色）",
   size=10, color=MUTED)


# ══════════════════════════════════════
# 結尾
# ══════════════════════════════════════
s = prs.slides.add_slide(prs.slide_layouts[6]); set_bg(s)
tx(s, 0, inch(2.8), inch(13.333), inch(0.8), "靈犀 LingXi", size=44, color=GOLD, bold=True, align=PP_ALIGN.CENTER)
tx(s, 0, inch(3.7), inch(13.333), inch(0.5), "完整畫面呈現  ·  共 15 頁", size=18, color=GOLD_DIM, align=PP_ALIGN.CENTER)
tx(s, 0, inch(6.8), inch(13.333), inch(0.3), "2026-03-03  ·  基於實際程式碼繪製", size=11, color=DARKEST, align=PP_ALIGN.CENTER)


# ── 儲存 ──
out = os.path.join(os.path.dirname(__file__), 'LingXi_UI_Screens.pptx')
prs.save(out)
print(f"PPTX generated: {out}")
print(f"Total slides: {len(prs.slides)}")
