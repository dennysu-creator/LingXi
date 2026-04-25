"""
Generate App Store marketing screenshots — 6.7" Display (1284x2778 px)
Theme: 靈寵陪伴成長 (spirit-pet companion growth) — NOT fortune-telling.
Apple 4.3 spam-safe positioning.

Outputs 5 screenshots:
  1) Hero — 24 seasonal pets family
  2) AI conversation
  3) Pet evolution growth
  4) Daily insight card
  5) Branded share card
"""
import sys
import random
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ROOT = Path(__file__).parent
PETS = Path("C:/Dev/LingXi/assets/pets")
V7 = Path("g:/共用雲端硬碟/有泉科技有限公司/內部開發/APP/算命系統/ai 圖片/V7-no-chinese")

# Output canvas — 6.5" Display spec (1284x2778)
# Apple ASC accepts 1242x2688 OR 1284x2778 for 6.5" iPhone slot.
W, H = 1284, 2778

# Fonts
F_BRUSH = "C:/Windows/Fonts/STKAITI.TTF"
F_SERIF = "C:/Windows/Fonts/msyhbd.ttc"
F_BODY  = "C:/Windows/Fonts/msyh.ttc"
F_LIGHT = "C:/Windows/Fonts/msyhl.ttc"

# Colors
BG       = (10, 10, 14)
GOLD     = (232, 197, 71)
GREEN    = (74, 222, 128)
PURPLE   = (167, 139, 250)
ROSE     = (255, 139, 160)
TEXT     = (245, 241, 232)
TEXT_SUB = (245, 241, 232, 200)
TEXT_MUTE = (245, 241, 232, 130)


def F(path, size):
    return ImageFont.truetype(path, size)


def text_w(draw, text, font):
    bbox = draw.textbbox((0, 0), text, font=font)
    return bbox[2] - bbox[0]


def make_bg() -> Image.Image:
    """Cosmic dark backdrop using V7 splash, scaled and darkened."""
    bg_path = V7 / "logo" / "splash.png"
    bg = Image.open(bg_path).convert("RGBA")
    ratio = max(W / bg.width, H / bg.height)
    bg = bg.resize((int(bg.width * ratio), int(bg.height * ratio)), Image.LANCZOS)
    left = (bg.width - W) // 2
    top = (bg.height - H) // 2
    bg = bg.crop((left, top, left + W, top + H))
    overlay = Image.new("RGBA", (W, H), (10, 10, 14, 220))
    return Image.alpha_composite(bg, overlay)


def draw_headline(draw, headline_zh, headline_en, y, accent=GOLD):
    """Draw large bilingual headline, returns y after."""
    f_zh = F(F_BRUSH, 96)
    f_en = F(F_LIGHT, 38)

    # zh-Hant headline (might wrap manually if too long)
    zw = text_w(draw, headline_zh, f_zh)
    if zw > W - 120:
        # Break into 2 lines on the dot or the second clause
        f_zh = F(F_BRUSH, 80)
        zw = text_w(draw, headline_zh, f_zh)
    draw.text(((W - zw) // 2, y), headline_zh, font=f_zh, fill=accent)
    y += 130

    # English subtitle
    ew = text_w(draw, headline_en, f_en)
    draw.text(((W - ew) // 2, y), headline_en, font=f_en, fill=TEXT_SUB)
    return y + 70


def draw_brand(draw, y):
    """Bottom LingXi brand."""
    f_brand = F(F_BRUSH, 60)
    f_tag = F(F_LIGHT, 28)
    brand = "靈犀 LingXi"
    bw = text_w(draw, brand, f_brand)
    draw.text(((W - bw) // 2, y), brand, font=f_brand, fill=GOLD)
    y += 90
    tag = "AI 靈寵成長夥伴 · Your AI Spirit-Pet Companion"
    tw = text_w(draw, tag, f_tag)
    draw.text(((W - tw) // 2, y), tag, font=f_tag, fill=TEXT_MUTE)


def paste_pet(canvas, pet_id, evo, center_xy, size):
    """Paste a pet image centered at (cx, cy) with given size."""
    cx, cy = center_xy
    pet_path = PETS / pet_id / f"{evo}.png"
    if not pet_path.exists():
        return
    pet = Image.open(pet_path).convert("RGBA")
    pet = pet.resize((size, size), Image.LANCZOS)
    canvas.paste(pet, (cx - size // 2, cy - size // 2), pet)


def add_glow(canvas, center_xy, radius, color):
    """Add soft glow circle."""
    cx, cy = center_xy
    glow = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse(
        (cx - radius, cy - radius, cx + radius, cy + radius),
        fill=(*color, 50)
    )
    glow = glow.filter(ImageFilter.GaussianBlur(60))
    canvas.alpha_composite(glow)


# ─── Screenshot 1: Hero — 24 pets family ──────────────────────
def screen_1_hero(canvas):
    draw = ImageDraw.Draw(canvas, "RGBA")
    y = draw_headline(draw,
        "24 隻節氣靈寵",
        "24 Seasonal Spirit Pets · One destined for you",
        y=200, accent=GOLD)
    f_sub = F(F_SERIF, 44)
    sub = "陪伴你的每一天"
    sw = text_w(draw, sub, f_sub)
    draw.text(((W - sw) // 2, y), sub, font=f_sub, fill=TEXT)

    # Featured center pet (large)
    featured = "01-lichun"
    add_glow(canvas, (W // 2, 1280), 380, GOLD)
    paste_pet(canvas, featured, "full", (W // 2, 1280), 720)

    # Surrounding orbit of 6 small pets
    surrounding = ["04-chunfen", "07-lixia", "10-xiazhi", "13-liqiu", "16-qiufen", "22-dongzhi"]
    import math
    for i, pid in enumerate(surrounding):
        angle = (i / len(surrounding)) * 2 * math.pi - math.pi / 2
        cx = int(W // 2 + 540 * math.cos(angle))
        cy = int(1280 + 540 * math.sin(angle))
        paste_pet(canvas, pid, "avatar", (cx, cy), 200)

    # Tagline at bottom
    f_call = F(F_LIGHT, 38)
    calls = ["輸入生辰 · 找到你的本命靈寵", "Find your destined pet by birth date"]
    cy = 2100
    for line in calls:
        cw = text_w(draw, line, f_call)
        draw.text(((W - cw) // 2, cy), line, font=f_call, fill=TEXT_SUB)
        cy += 70

    draw_brand(draw, 2540)


# ─── Screenshot 2: AI conversation ─────────────────────────────
def screen_2_chat(canvas):
    draw = ImageDraw.Draw(canvas, "RGBA")
    y = draw_headline(draw,
        "AI 靈寵聽你說話",
        "Your AI Pet Listens · Personalized responses just for you",
        y=200, accent=GOLD)
    f_sub = F(F_SERIF, 44)
    sub = "給你最懂你的回應"
    sw = text_w(draw, sub, f_sub)
    draw.text(((W - sw) // 2, y), sub, font=f_sub, fill=TEXT)

    # Pet on the left
    add_glow(canvas, (340, 1500), 280, GOLD)
    paste_pet(canvas, "07-lixia", "evo-2", (340, 1500), 540)

    # Chat bubble on right
    bx, by, bw, bh = 660, 1100, 540, 800
    # Bubble shadow
    shadow = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.rounded_rectangle((bx + 6, by + 12, bx + bw + 6, by + bh + 12), radius=42, fill=(0, 0, 0, 110))
    shadow = shadow.filter(ImageFilter.GaussianBlur(20))
    canvas.alpha_composite(shadow)

    draw.rounded_rectangle(
        (bx, by, bx + bw, by + bh),
        radius=42, fill=(20, 20, 28, 245),
        outline=(*GOLD, 110), width=2
    )

    # Chat content
    f_user = F(F_LIGHT, 26)
    f_pet = F(F_BODY, 32)
    pad = 36
    draw.text((bx + pad, by + pad), "主人問:", font=f_user, fill=TEXT_MUTE)
    user_msg = "今天該做什麼?"
    draw.text((bx + pad, by + pad + 36), user_msg, font=f_pet, fill=TEXT)

    # Divider
    div_y = by + pad + 110
    draw.line(
        [(bx + pad, div_y), (bx + bw - pad, div_y)],
        fill=(*GOLD, 60), width=1
    )

    # Pet response
    draw.text((bx + pad, div_y + 24), "靈寵感應:", font=f_user, fill=(*GOLD, 200))
    response_lines = [
        "主人，今日東南方有暖意流動",
        "適合外出走走，遇貴人...",
        "",
        "✦ 靈感閃現的時辰來了",
        "聽見你心底的微小聲音",
        "那是最重要的提示。",
    ]
    ry = div_y + 80
    for line in response_lines:
        draw.text((bx + pad, ry), line, font=f_pet, fill=TEXT)
        ry += 50

    # Tagline
    f_call = F(F_LIGHT, 36)
    calls = ["AI 學習你的個性 · 越聊越懂你", "AI learns you · Grows more in tune over time"]
    cy = 2200
    for line in calls:
        cw = text_w(draw, line, f_call)
        draw.text(((W - cw) // 2, cy), line, font=f_call, fill=TEXT_SUB)
        cy += 60

    draw_brand(draw, 2540)


# ─── Screenshot 3: Evolution ──────────────────────────────────
def screen_3_evolution(canvas):
    draw = ImageDraw.Draw(canvas, "RGBA")
    y = draw_headline(draw,
        "越用越強大",
        "Grows With You · 4 evolution stages, max Lv.30",
        y=200, accent=PURPLE)
    f_sub = F(F_SERIF, 44)
    sub = "你的靈寵會進化"
    sw = text_w(draw, sub, f_sub)
    draw.text(((W - sw) // 2, y), sub, font=f_sub, fill=TEXT)

    # 3 evolution stages of one pet
    pet = "10-xiazhi"
    stages = [
        ("evo-1", 220, 1100, "Lv.1-9", "幼體"),
        ("evo-2", 645, 1300, "Lv.10-19", "成長"),
        ("evo-3", 1070, 1500, "Lv.20-30", "完成體"),
    ]
    f_lvl = F(F_SERIF, 36)
    f_lbl = F(F_LIGHT, 26)
    for evo, cx, cy, lvl, lbl in stages:
        # Soft glow per stage with different color
        accent = PURPLE if evo == "evo-1" else (GREEN if evo == "evo-2" else GOLD)
        add_glow(canvas, (cx, cy), 220, accent)
        paste_pet(canvas, pet, evo, (cx, cy), 380)
        # Label below
        lvl_w = text_w(draw, lvl, f_lvl)
        draw.text((cx - lvl_w // 2, cy + 220), lvl, font=f_lvl, fill=accent)
        lbl_w = text_w(draw, lbl, f_lbl)
        draw.text((cx - lbl_w // 2, cy + 280), lbl, font=f_lbl, fill=TEXT_MUTE)

    # Arrow between stages
    f_arrow = F(F_BODY, 60)
    draw.text((420, 1170), "→", font=f_arrow, fill=(*GOLD, 200))
    draw.text((845, 1370), "→", font=f_arrow, fill=(*GOLD, 200))

    # Tagline
    f_call = F(F_LIGHT, 36)
    calls = [
        "每次互動都讓靈寵成長",
        "Every interaction levels up your pet",
        "Lv.10/20/30 進化形態解鎖",
    ]
    cy = 2080
    for line in calls:
        cw = text_w(draw, line, f_call)
        draw.text(((W - cw) // 2, cy), line, font=f_call, fill=TEXT_SUB)
        cy += 60

    draw_brand(draw, 2540)


# ─── Screenshot 4: Daily insight card ─────────────────────────
def screen_4_insight(canvas):
    draw = ImageDraw.Draw(canvas, "RGBA")
    y = draw_headline(draw,
        "每日靈寵感應",
        "Daily Spirit Insights · Energy reading just for today",
        y=200, accent=GOLD)
    f_sub = F(F_SERIF, 44)
    sub = "為你解讀此刻能量"
    sw = text_w(draw, sub, f_sub)
    draw.text(((W - sw) // 2, y), sub, font=f_sub, fill=TEXT)

    # Pet at top
    add_glow(canvas, (W // 2, 1200), 320, GOLD)
    paste_pet(canvas, "13-liqiu", "evo-2", (W // 2, 1200), 580)

    # Insight card below
    cx, cy = 100, 1620
    cw_card, ch_card = W - 200, 700
    draw.rounded_rectangle(
        (cx, cy, cx + cw_card, cy + ch_card),
        radius=42, fill=(20, 20, 28, 240),
        outline=(*GOLD, 100), width=2
    )

    pad = 50
    f_label = F(F_LIGHT, 28)
    f_score = F(F_SERIF, 110)
    f_grade = F(F_SERIF, 60)
    f_text = F(F_BODY, 32)

    draw.text((cx + pad, cy + pad), "今日能量指數", font=f_label, fill=TEXT_MUTE)

    # Score on left
    draw.text((cx + pad, cy + pad + 50), "82", font=f_score, fill=GOLD)
    draw.text((cx + pad + 220, cy + pad + 130), "中吉", font=f_grade, fill=GREEN)
    draw.text((cx + pad + 220, cy + pad + 200), "FAVORABLE", font=F(F_LIGHT, 22), fill=TEXT_MUTE)

    # Divider
    div_y = cy + 320
    draw.line([(cx + pad, div_y), (cx + cw_card - pad, div_y)], fill=(*GOLD, 60), width=1)

    # Insight text
    insight = [
        "✦ 主人，今日有暖光照亮東南方",
        "  適合主動聯絡許久未見的朋友",
        "",
        "✦ 午時起，靈感如泉湧",
        "  把握時機完成擱置的計畫",
        "",
        "靈寵建議顏色: 金黃 · 方位: 東南",
    ]
    ty = div_y + 30
    for line in insight:
        draw.text((cx + pad, ty), line, font=f_text, fill=TEXT)
        ty += 48

    # Tagline
    f_call = F(F_LIGHT, 32)
    calls = ["每日打開 · 看靈寵今天想對你說什麼", "Open daily · See what your pet wants to share"]
    cy = 2400
    for line in calls:
        cw = text_w(draw, line, f_call)
        draw.text(((W - cw) // 2, cy), line, font=f_call, fill=TEXT_SUB)
        cy += 55

    draw_brand(draw, 2620)


# ─── Screenshot 5: Share card ─────────────────────────────────
def screen_5_share(canvas):
    draw = ImageDraw.Draw(canvas, "RGBA")
    y = draw_headline(draw,
        "精緻分享卡",
        "Beautiful Share Cards · Save & share your pet's wisdom",
        y=200, accent=ROSE)
    f_sub = F(F_SERIF, 44)
    sub = "把美好瞬間送給朋友"
    sw = text_w(draw, sub, f_sub)
    draw.text(((W - sw) // 2, y), sub, font=f_sub, fill=TEXT)

    # Mock-up of the actual share card (proportional preview)
    cx_card, cy_card = 195, 980
    card_w, card_h = 900, 1600
    # Card outer shadow
    shadow = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.rounded_rectangle(
        (cx_card + 12, cy_card + 18, cx_card + card_w + 12, cy_card + card_h + 18),
        radius=40, fill=(0, 0, 0, 130)
    )
    shadow = shadow.filter(ImageFilter.GaussianBlur(25))
    canvas.alpha_composite(shadow)

    # Card body (cosmic gradient)
    draw.rounded_rectangle(
        (cx_card, cy_card, cx_card + card_w, cy_card + card_h),
        radius=40, fill=(8, 8, 14, 250),
        outline=(*GOLD, 140), width=3
    )

    # Pet on card
    paste_pet(canvas, "16-qiufen", "evo-3", (cx_card + card_w // 2, cy_card + 540), 560)

    # Text on card
    pad = 50
    f_pname = F(F_BRUSH, 56)
    pname = "秋分 · Lv.18"
    pnw = text_w(draw, pname, f_pname)
    draw.text((cx_card + (card_w - pnw) // 2, cy_card + 880), pname, font=f_pname, fill=GOLD)

    f_title = F(F_BRUSH, 50)
    title = "今日靈寵奇語"
    tw = text_w(draw, title, f_title)
    draw.text((cx_card + (card_w - tw) // 2, cy_card + 980), title, font=f_title, fill=TEXT)

    # Content lines
    f_body = F(F_BODY, 30)
    content = [
        "主人，秋風起時，",
        "金氣初動，宜決斷收束。",
        "",
        "✦ 把握收穫的節奏",
        "把該說的話說給該聽的人",
    ]
    by = cy_card + 1080
    for line in content:
        lw = text_w(draw, line, f_body)
        draw.text((cx_card + (card_w - lw) // 2, by), line, font=f_body, fill=TEXT_SUB)
        by += 48

    # Mini brand at card bottom
    f_card_brand = F(F_BRUSH, 32)
    cb = "靈犀 LingXi"
    cbw = text_w(draw, cb, f_card_brand)
    draw.text((cx_card + (card_w - cbw) // 2, cy_card + card_h - 110), cb, font=f_card_brand, fill=GOLD)
    f_card_tag = F(F_LIGHT, 18)
    ct = "AI 靈寵 · Daily companion"
    ctw = text_w(draw, ct, f_card_tag)
    draw.text((cx_card + (card_w - ctw) // 2, cy_card + card_h - 60), ct, font=f_card_tag, fill=TEXT_MUTE)

    # Tagline
    f_call = F(F_LIGHT, 32)
    calls = ["分享到 IG / LINE · 與朋友分享美好瞬間", "Share to Instagram, LINE, anywhere"]
    cy = 2640
    for line in calls:
        cw = text_w(draw, line, f_call)
        draw.text(((W - cw) // 2, cy), line, font=f_call, fill=TEXT_SUB)
        cy += 55

    # No bottom brand on this one (already on card)


# ─── Run ──────────────────────────────────────────────────────
def main():
    screens = [
        ("01-hero", screen_1_hero),
        ("02-chat", screen_2_chat),
        ("03-evolution", screen_3_evolution),
        ("04-insight", screen_4_insight),
        ("05-share", screen_5_share),
    ]
    for name, fn in screens:
        canvas = make_bg()
        fn(canvas)
        out = ROOT / f"app-{name}-1284x2778.png"
        canvas.convert("RGB").save(out, "PNG", optimize=True)
        print(f"  [OK] {out.name} ({out.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
