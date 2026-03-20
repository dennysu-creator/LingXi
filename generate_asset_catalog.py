"""
LingXi v2 UI Asset Catalog — PPTX
列出所有需要 AI 生成的素材，每頁一個分類，含尺寸 + prompt 摘要
"""
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

SLIDE_BG = RGBColor(0x08, 0x06, 0x12)
GOLD = RGBColor(0xFF, 0xD7, 0x00)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
GRAY = RGBColor(0x99, 0x99, 0xAA)
GRAY_DIM = RGBColor(0x66, 0x66, 0x77)
GREEN = RGBColor(0x4A, 0xDE, 0x80)
PURPLE = RGBColor(0xA7, 0x8B, 0xFA)
EYE_GOLD = RGBColor(0xFF, 0xC1, 0x07)
PANEL_BG = RGBColor(0x1A, 0x14, 0x2E)
BLUE = RGBColor(0x64, 0xB4, 0xFF)

def slide_bg(slide, prs):
    bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
    bg.fill.solid()
    bg.fill.fore_color.rgb = SLIDE_BG
    bg.line.fill.background()

def add_rounded_rect(slide, l, t, w, h, fill, border=None, bw=Pt(0)):
    s = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, l, t, w, h)
    s.fill.solid()
    s.fill.fore_color.rgb = fill
    if border:
        s.line.color.rgb = border
        s.line.width = bw
    else:
        s.line.fill.background()
    s.adjustments[0] = 0.05
    return s

def add_text(slide, l, t, w, h, text, size=10, color=WHITE, bold=False, align=PP_ALIGN.LEFT):
    txBox = slide.shapes.add_textbox(l, t, w, h)
    tf = txBox.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = text
    p.font.size = Pt(size)
    p.font.color.rgb = color
    p.font.bold = bold
    p.alignment = align
    return txBox

def add_multi(slide, l, t, w, h, lines):
    txBox = slide.shapes.add_textbox(l, t, w, h)
    tf = txBox.text_frame
    tf.word_wrap = True
    for i, ln in enumerate(lines):
        text, size, color, bold = ln[0], ln[1] if len(ln)>1 else 9, ln[2] if len(ln)>2 else WHITE, ln[3] if len(ln)>3 else False
        align = ln[4] if len(ln)>4 else PP_ALIGN.LEFT
        p = tf.paragraphs[0] if i==0 else tf.add_paragraph()
        p.text = text
        p.font.size = Pt(size)
        p.font.color.rgb = color
        p.font.bold = bold
        p.alignment = align
        p.space_after = Pt(1)
    return txBox

def draw_asset_card(slide, x, y, w, h, filename, size_text, desc, color=GOLD, prompt_short=""):
    add_rounded_rect(slide, x, y, w, h, PANEL_BG, color, Pt(1))
    # Placeholder box
    px = x + Inches(0.08)
    py = y + Inches(0.08)
    pw = Inches(0.6)
    ph = Inches(0.5)
    add_rounded_rect(slide, px, py, pw, ph, RGBColor(0x22, 0x1A, 0x3A), GRAY_DIM, Pt(1))
    add_text(slide, px, py + Inches(0.12), pw, Inches(0.2), "?", size=16, color=GRAY_DIM, align=PP_ALIGN.CENTER)
    # Info
    ix = x + Inches(0.75)
    add_text(slide, ix, y + Inches(0.06), w - Inches(0.85), Inches(0.16),
             filename, size=7, color=color, bold=True)
    add_text(slide, ix, y + Inches(0.2), w - Inches(0.85), Inches(0.12),
             size_text, size=6, color=GRAY)
    add_text(slide, ix, y + Inches(0.32), w - Inches(0.85), Inches(0.25),
             desc, size=5, color=WHITE)
    if prompt_short:
        add_text(slide, x + Inches(0.08), y + h - Inches(0.16), w - Inches(0.16), Inches(0.14),
                 f"Prompt: {prompt_short}", size=4, color=GRAY_DIM)


prs = Presentation()
prs.slide_width = Inches(13.33)
prs.slide_height = Inches(7.5)
blank = prs.slide_layouts[6]


# ═══ Slide 1: Overview ═══
slide = prs.slides.add_slide(blank)
slide_bg(slide, prs)
add_text(slide, Inches(0.3), Inches(0.1), Inches(12.7), Inches(0.4),
         "v2 UI Asset Catalog — 57 Assets for AI Generation", size=20, color=GOLD, bold=True, align=PP_ALIGN.CENTER)

categories = [
    ("logo/", "3", "Logo + 書法字", GOLD),
    ("pet-avatar/", "8", "頭像外框 (4 狀態)", EYE_GOLD),
    ("effects/", "14", "光暈 + 粒子 + 八卦符號", PURPLE),
    ("feature-panel/", "14", "面板 UI 元素", GREEN),
    ("action-bar/", "6", "ActionBar 圖標", GOLD),
    ("animations/", "10", "Lottie 動畫 (JSON)", BLUE),
    ("chat-bubble/", "4", "對話氣泡裝飾", GRAY),
]

for i, (folder, count, desc, color) in enumerate(categories):
    y = Inches(0.8) + Inches(i * 0.8)
    add_rounded_rect(slide, Inches(1.0), y, Inches(11.0), Inches(0.65), PANEL_BG, color, Pt(1))
    add_text(slide, Inches(1.2), y + Inches(0.08), Inches(3.0), Inches(0.2),
             folder, size=14, color=color, bold=True)
    add_text(slide, Inches(4.5), y + Inches(0.08), Inches(1.0), Inches(0.2),
             f"x{count}", size=14, color=WHITE, bold=True, align=PP_ALIGN.CENTER)
    add_text(slide, Inches(5.8), y + Inches(0.08), Inches(5.5), Inches(0.2),
             desc, size=12, color=GRAY)
    add_text(slide, Inches(1.2), y + Inches(0.35), Inches(10.0), Inches(0.2),
             f"assets/ui-v2/{folder}", size=8, color=GRAY_DIM)

add_text(slide, Inches(1.0), Inches(6.5), Inches(11.0), Inches(0.3),
         "47 PNG + 10 Lottie JSON = 57 files total", size=14, color=GOLD, bold=True, align=PP_ALIGN.CENTER)
add_text(slide, Inches(1.0), Inches(6.85), Inches(11.0), Inches(0.25),
         "See ASSET_PROMPTS.md for full AI generation prompts", size=10, color=GRAY, align=PP_ALIGN.CENTER)


# ═══ Slide 2: Logo + Pet Avatar ═══
slide = prs.slides.add_slide(blank)
slide_bg(slide, prs)
add_text(slide, Inches(0.3), Inches(0.1), Inches(6.0), Inches(0.35),
         "Logo (3)", size=16, color=GOLD, bold=True)

assets_logo = [
    ("logo-statusbar.png", "256x64", "Status bar app name", "Chinese calligraphy '靈犀', gold brush stroke"),
    ("logo-splash.png", "512x512", "Splash screen icon", "Golden crystal orb with bagua rings"),
    ("logo-splash-text.png", "512x200", "Splash text", "靈犀 calligraphy + LingXi serif"),
]
for i, (fn, sz, desc, prompt) in enumerate(assets_logo):
    draw_asset_card(slide, Inches(0.3), Inches(0.55) + Inches(i * 0.75), Inches(6.0), Inches(0.68),
                    fn, sz, desc, GOLD, prompt)

add_text(slide, Inches(6.8), Inches(0.1), Inches(6.0), Inches(0.35),
         "Pet Avatar Frames (8)", size=16, color=EYE_GOLD, bold=True)

assets_avatar = [
    ("normal/avatar-frame.png", "256x256", "Normal circular frame", "Thin gold border, semi-transparent", GOLD),
    ("normal/float-shadow.png", "128x32", "Floating shadow ellipse", "Soft dark blur shadow", GRAY),
    ("eye-active/frame-eye.png", "320x320", "Eye mode glow frame", "Double gold ring + outer aura", EYE_GOLD),
    ("eye-active/eye-symbol.png", "96x96", "Third Eye symbol", "Vertical eye, gold iris + rays", EYE_GOLD),
    ("heart-active/frame-heart.png", "320x320", "Heart mode glow frame", "Green compass-style ring", GREEN),
    ("heart-active/direction-ring.png", "384x384", "Compass direction ring", "8 Chinese dir chars in circle", GREEN),
    ("pearl-active/frame-pearl.png", "320x320", "Pearl mode glow frame", "Purple bagua ring", PURPLE),
    ("pearl-active/bagua-ring.png", "384x384", "Bagua symbol ring", "8 trigrams in circle formation", PURPLE),
]
for i, (fn, sz, desc, prompt, color) in enumerate(assets_avatar):
    draw_asset_card(slide, Inches(6.8), Inches(0.55) + Inches(i * 0.75), Inches(6.2), Inches(0.68),
                    fn, sz, desc, color, prompt)


# ═══ Slide 3: Effects ═══
slide = prs.slides.add_slide(blank)
slide_bg(slide, prs)
add_text(slide, Inches(0.3), Inches(0.1), Inches(12.7), Inches(0.35),
         "Effects (14) — Auras, Particles, Symbols", size=16, color=PURPLE, bold=True)

effects = [
    ("eye/sparkle-particle.png", "32x32", "Single gold sparkle", "4-pointed star, gold glow", EYE_GOLD),
    ("eye/gold-aura.png", "384x384", "Gold radial glow", "Radial gold fade to transparent", EYE_GOLD),
    ("heart/green-aura.png", "384x384", "Green radial glow", "Radial green fade to transparent", GREEN),
    ("heart/compass-needle.png", "64x192", "Compass needle", "Gold top, dark bottom, diamond shape", GREEN),
    ("pearl/purple-aura.png", "384x384", "Purple radial glow", "Radial purple fade to transparent", PURPLE),
    ("pearl/bagua-symbol-01.png", "64x64", "☰ 乾 (Qian)", "Three solid lines, purple glow", PURPLE),
    ("pearl/bagua-symbol-02.png", "64x64", "☷ 坤 (Kun)", "Three broken lines, purple glow", PURPLE),
    ("pearl/bagua-symbol-03.png", "64x64", "☳ 震 (Zhen)", "Solid-broken-broken, purple glow", PURPLE),
    ("pearl/bagua-symbol-04.png", "64x64", "☴ 巽 (Xun)", "Broken-solid-solid, purple glow", PURPLE),
    ("pearl/bagua-symbol-05.png", "64x64", "☵ 坎 (Kan)", "Broken-solid-broken, purple glow", PURPLE),
    ("pearl/bagua-symbol-06.png", "64x64", "☲ 離 (Li)", "Solid-broken-solid, purple glow", PURPLE),
    ("pearl/bagua-symbol-07.png", "64x64", "☶ 艮 (Gen)", "Broken-broken-solid, purple glow", PURPLE),
    ("pearl/bagua-symbol-08.png", "64x64", "☱ 兌 (Dui)", "Solid-solid-broken, purple glow", PURPLE),
    ("shared/panel-bg-pattern.png", "512x512", "Tileable BG pattern", "Faint gold cloud/wave motifs, 5% opacity", GOLD),
]
cols = 2
for i, (fn, sz, desc, prompt, color) in enumerate(effects):
    col = i % cols
    row = i // cols
    x = Inches(0.3) + Inches(col * 6.5)
    y = Inches(0.55) + Inches(row * 0.65)
    draw_asset_card(slide, x, y, Inches(6.2), Inches(0.58), fn, sz, desc, color, prompt)


# ═══ Slide 4: Feature Panel UI ═══
slide = prs.slides.add_slide(blank)
slide_bg(slide, prs)
add_text(slide, Inches(0.3), Inches(0.1), Inches(12.7), Inches(0.35),
         "Feature Panel UI (14) — Eye / Heart / Pearl", size=16, color=GREEN, bold=True)

# Eye column
add_text(slide, Inches(0.3), Inches(0.5), Inches(4.0), Inches(0.25),
         "Eye Panel (5)", size=12, color=EYE_GOLD, bold=True)
eye_items = [
    ("eye/btn-camera.png", "128x128", "Camera button", "Camera + spiritual eye lens"),
    ("eye/progress-analyzing.png", "64x64", "Scan status icon", "Face outline with scan lines"),
    ("eye/step-face.png", "48x48", "Step: detect face", "Face outline + dots"),
    ("eye/step-features.png", "48x48", "Step: analyze features", "5 facial points highlighted"),
    ("eye/step-fortune.png", "48x48", "Step: read fortune", "Oracle scroll + golden light"),
]
for i, (fn, sz, desc, prompt) in enumerate(eye_items):
    draw_asset_card(slide, Inches(0.3), Inches(0.8) + Inches(i*0.68), Inches(4.0), Inches(0.6),
                    fn, sz, desc, EYE_GOLD, prompt)

# Heart column
add_text(slide, Inches(4.6), Inches(0.5), Inches(4.0), Inches(0.25),
         "Heart Panel (3)", size=12, color=GREEN, bold=True)
heart_items = [
    ("heart/compass-bg.png", "256x256", "Mini compass face", "Luopan with rings + markings"),
    ("heart/gps-dot.png", "32x32", "GPS indicator", "Green pulsing dot"),
    ("heart/btn-analyze.png", "128x128", "Analyze button", "Compass + magnifier icon"),
]
for i, (fn, sz, desc, prompt) in enumerate(heart_items):
    draw_asset_card(slide, Inches(4.6), Inches(0.8) + Inches(i*0.68), Inches(4.0), Inches(0.6),
                    fn, sz, desc, GREEN, prompt)

# Pearl column
add_text(slide, Inches(8.9), Inches(0.5), Inches(4.1), Inches(0.25),
         "Pearl Panel (6)", size=12, color=PURPLE, bold=True)
pearl_items = [
    ("pearl/cat-career.png", "96x96", "Career category", "Golden seal / stairs"),
    ("pearl/cat-love.png", "96x96", "Love category", "Red thread of fate"),
    ("pearl/cat-family.png", "96x96", "Family category", "Chinese roof + warm light"),
    ("pearl/cat-health.png", "96x96", "Health category", "Gourd / lotus + healing"),
    ("pearl/cat-study.png", "96x96", "Study category", "Scroll / brush + wisdom"),
    ("pearl/btn-divinate.png", "128x128", "Divinate button", "Spirit lantern + trigrams"),
]
for i, (fn, sz, desc, prompt) in enumerate(pearl_items):
    draw_asset_card(slide, Inches(8.9), Inches(0.8) + Inches(i*0.68), Inches(4.1), Inches(0.6),
                    fn, sz, desc, PURPLE, prompt)


# ═══ Slide 5: ActionBar + Chat Bubble ═══
slide = prs.slides.add_slide(blank)
slide_bg(slide, prs)
add_text(slide, Inches(0.3), Inches(0.1), Inches(6.0), Inches(0.35),
         "ActionBar Icons (6)", size=16, color=GOLD, bold=True)

ab_items = [
    ("nurture/feed.png", "128x128", "Feed: golden elixir pill", "Spirit food, warm golden glow", GOLD),
    ("nurture/play.png", "128x128", "Play: luminous crystal ball", "Bouncing orb, sparkle trail", GOLD),
    ("nurture/meditate.png", "128x128", "Meditate: lotus + halo", "Zen meditation, calm energy", GOLD),
    ("ability/eye.png", "128x128", "Spirit Eye: Third Eye", "Vertical eye, gold iris + rays", EYE_GOLD),
    ("ability/heart.png", "128x128", "Spirit Heart: compass", "Feng shui compass, green glow", GREEN),
    ("ability/soul.png", "128x128", "Spirit Soul: lantern", "Chinese lantern, purple flame", PURPLE),
]
for i, (fn, sz, desc, prompt, color) in enumerate(ab_items):
    draw_asset_card(slide, Inches(0.3), Inches(0.55) + Inches(i*0.72), Inches(6.0), Inches(0.65),
                    fn, sz, desc, color, prompt)

add_text(slide, Inches(6.8), Inches(0.1), Inches(6.0), Inches(0.35),
         "Chat Bubble Decor (4)", size=16, color=GRAY, bold=True)

cb_items = [
    ("bubble-corner.png", "24x24", "Bubble tail pointer", "Small triangle, dark + gold border", GOLD),
    ("bubble-result-eye.png", "48x48", "Eye result badge", "Gold eye icon badge", EYE_GOLD),
    ("bubble-result-heart.png", "48x48", "Heart result badge", "Green compass icon badge", GREEN),
    ("bubble-result-pearl.png", "48x48", "Pearl result badge", "Purple trigram icon badge", PURPLE),
]
for i, (fn, sz, desc, prompt, color) in enumerate(cb_items):
    draw_asset_card(slide, Inches(6.8), Inches(0.55) + Inches(i*0.72), Inches(6.2), Inches(0.65),
                    fn, sz, desc, color, prompt)


# ═══ Slide 6: Animations ═══
slide = prs.slides.add_slide(blank)
slide_bg(slide, prs)
add_text(slide, Inches(0.3), Inches(0.1), Inches(12.7), Inches(0.35),
         "Animations — Lottie JSON (10)", size=16, color=BLUE, bold=True)
add_text(slide, Inches(0.3), Inches(0.45), Inches(12.7), Inches(0.2),
         "Format: Lottie JSON  |  Tools: After Effects + Bodymovin / LottieFiles / Rive  |  See ASSET_PROMPTS.md for keyframe details",
         size=8, color=GRAY)

anims = [
    ("pet-float.json", "3s loop", "Normal floating/breathing", "Y-axis sin curve +-6px, scale 0.98~1.02", GOLD, "Loop"),
    ("eye-pulse.json", "2s loop", "Gold border pulsing", "Opacity 0.3~1.0, outer glow scale 1.0~1.15", EYE_GOLD, "Loop"),
    ("heart-compass-rotate.json", "8s loop", "Direction ring rotation", "Clockwise 360deg, green glow breath", GREEN, "Loop"),
    ("pearl-bagua-rotate.json", "6s/1.5s", "Bagua ring rotation", "CCW rotation, accelerate on shake", PURPLE, "Loop"),
    ("eye-sparkles.json", "3s loop", "Gold floating particles", "6-8 sparkles random drift, fade in/out", EYE_GOLD, "Loop"),
    ("progress-fill.json", "driven", "Progress bar fill", "Gold gradient fill L→R with shimmer", GOLD, "Driven"),
    ("camera-shutter.json", "300ms", "Camera shutter press", "Shrink→flash→restore", WHITE, "Once"),
    ("shaking-vibrate.json", "1.5s", "Shaking vibration", "X offset +-5px, gradually calm", PURPLE, "Once"),
    ("result-appear.json", "500ms", "Chat bubble entrance", "Slide up + fade in + spring bounce", GOLD, "Once"),
    ("panel-collapse.json", "400ms", "Panel dismiss", "Height→0, opacity→0, ease-out", GRAY, "Once"),
]

for i, (fn, dur, desc, detail, color, loop_type) in enumerate(anims):
    col = i % 2
    row = i // 2
    x = Inches(0.3) + Inches(col * 6.5)
    y = Inches(0.75) + Inches(row * 1.2)

    add_rounded_rect(slide, x, y, Inches(6.2), Inches(1.05), PANEL_BG, color, Pt(1))

    # Timeline placeholder
    add_rounded_rect(slide, x + Inches(0.1), y + Inches(0.08), Inches(1.2), Inches(0.55),
                     RGBColor(0x22, 0x1A, 0x3A), GRAY_DIM, Pt(1))
    # Timeline bars
    for j in range(4):
        bw = Inches(0.18 + j * 0.05)
        add_rounded_rect(slide, x + Inches(0.15), y + Inches(0.15 + j * 0.12),
                         bw, Inches(0.06), color)

    ix = x + Inches(1.4)
    add_text(slide, ix, y + Inches(0.04), Inches(4.5), Inches(0.16),
             fn, size=8, color=color, bold=True)
    add_text(slide, ix + Inches(3.0), y + Inches(0.04), Inches(1.5), Inches(0.16),
             f"[{loop_type}] {dur}", size=7, color=GRAY, align=PP_ALIGN.RIGHT)
    add_text(slide, ix, y + Inches(0.22), Inches(4.5), Inches(0.14),
             desc, size=7, color=WHITE)
    add_text(slide, ix, y + Inches(0.38), Inches(4.5), Inches(0.3),
             detail, size=6, color=GRAY)

    # Keyframes hint
    add_text(slide, x + Inches(0.1), y + Inches(0.72), Inches(5.8), Inches(0.25),
             "See ASSET_PROMPTS.md for detailed keyframe prompts", size=5, color=GRAY_DIM)


# ═══ Save ═══
output = r"C:\Dev\LingXi\LingXi_Asset_Catalog.pptx"
prs.save(output)
print(f"Saved: {output}")
print("6 slides")
