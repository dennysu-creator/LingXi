"""
Generate App Store Connect IAP review screenshots
- Output 1290x2796 PNG (iPhone 6.7" Display screenshot spec)
- 2 variants: monthly NT$199 / yearly NT$1999
- Both zh-Hant primary + en bilingual
- Uses V7 splash background + Microsoft YaHei (繁體可顯示)
"""
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ROOT = Path(__file__).parent
ASSETS = Path("g:/共用雲端硬碟/有泉科技有限公司/內部開發/APP/算命系統/ai 圖片/V7-no-chinese")

# Output canvas (iPhone 6.7" Display — 1290x2796)
W, H = 1290, 2796

# Fonts (Windows)
F_BRUSH = "C:/Windows/Fonts/STKAITI.TTF"      # 楷體 — 品牌感
F_SERIF = "C:/Windows/Fonts/msyhbd.ttc"        # 雅黑粗體 — 標題
F_BODY  = "C:/Windows/Fonts/msyh.ttc"          # 雅黑 — 內文
F_LIGHT = "C:/Windows/Fonts/msyhl.ttc"         # 雅黑細體

# Colors
BG       = (10, 10, 14)
GOLD     = (232, 197, 71)
GREEN    = (74, 222, 128)
TEXT     = (245, 241, 232)
TEXT_SUB = (245, 241, 232, 180)
TEXT_MUTE = (245, 241, 232, 120)


def load_font(path, size):
    return ImageFont.truetype(path, size)


def text_w(draw, text, font):
    bbox = draw.textbbox((0, 0), text, font=font)
    return bbox[2] - bbox[0]


def draw_card(canvas: Image.Image, plan: dict):
    """Compose one 1290x2796 IAP review screenshot."""
    draw = ImageDraw.Draw(canvas, "RGBA")

    # ── Top: app icon ──
    icon_path = ASSETS / "logo" / "app-icon.png"
    icon_size = 220
    if icon_path.exists():
        icon = Image.open(icon_path).convert("RGBA").resize((icon_size, icon_size), Image.LANCZOS)
        canvas.paste(icon, ((W - icon_size) // 2, 200), icon)

    # Brand text
    f_brand = load_font(F_BRUSH, 90)
    brand_text = "靈犀 LingXi"
    draw.text(((W - text_w(draw, brand_text, f_brand)) // 2, 460),
              brand_text, font=f_brand, fill=GOLD)

    # Tagline
    f_tag = load_font(F_LIGHT, 36)
    tag = "AI 命理靈寵 · AI Fortune-Telling Pet"
    draw.text(((W - text_w(draw, tag, f_tag)) // 2, 580),
              tag, font=f_tag, fill=TEXT_SUB)

    # ── Plan card ──
    card_x = 100
    card_y = 720
    card_w = W - 200
    card_h = 1660
    accent = plan["accent"]

    # Soft outer glow
    glow = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.rounded_rectangle(
        (card_x - 12, card_y - 12, card_x + card_w + 12, card_y + card_h + 12),
        radius=48, fill=(*accent, 40)
    )
    glow = glow.filter(ImageFilter.GaussianBlur(40))
    canvas.alpha_composite(glow)

    # Card
    draw.rounded_rectangle(
        (card_x, card_y, card_x + card_w, card_y + card_h),
        radius=42, fill=(20, 20, 28, 240),
        outline=(*accent, 100), width=3
    )

    # Plan label
    f_label = load_font(F_SERIF, 72)
    f_label_en = load_font(F_LIGHT, 38)
    pad = 80
    draw.text((card_x + pad, card_y + pad), plan["label"], font=f_label, fill=TEXT)
    draw.text((card_x + pad, card_y + pad + 96), plan["label_en"],
              font=f_label_en, fill=TEXT_MUTE)

    # Savings badge (yearly only)
    if plan.get("badge"):
        f_badge = load_font(F_SERIF, 36)
        bw = text_w(draw, plan["badge"], f_badge) + 60
        bh = 70
        bx = card_x + card_w - pad - bw
        by = card_y + pad + 12
        draw.rounded_rectangle((bx, by, bx + bw, by + bh), radius=35, fill=accent)
        draw.text((bx + 30, by + 14), plan["badge"], font=f_badge, fill=BG)

    # Price — auto-shrink so price + period both fit inside card padding
    f_price = load_font(F_SERIF, 220)
    f_period = load_font(F_LIGHT, 70)
    price_y = card_y + 280
    avail_w = card_w - pad * 2
    pw = text_w(draw, plan["price"], f_price)
    perw = text_w(draw, plan["period"], f_period)
    if pw + 24 + perw > avail_w:
        f_price = load_font(F_SERIF, 180)
        f_period = load_font(F_LIGHT, 56)
        pw = text_w(draw, plan["price"], f_price)
        perw = text_w(draw, plan["period"], f_period)
    draw.text((card_x + pad, price_y), plan["price"], font=f_price, fill=accent)
    draw.text((card_x + pad + pw + 20, price_y + 110), plan["period"],
              font=f_period, fill=(*accent, 220))

    # Equivalent (yearly only)
    if plan.get("equiv"):
        f_eq = load_font(F_LIGHT, 36)
        draw.text((card_x + pad, price_y + 260), plan["equiv"],
                  font=f_eq, fill=TEXT_MUTE)

    # Divider
    div_y = card_y + 700
    draw.line(
        [(card_x + pad, div_y), (card_x + card_w - pad, div_y)],
        fill=(*accent, 60), width=2
    )

    # Features (4 lines)
    f_feat = load_font(F_BODY, 50)
    f_feat_en = load_font(F_LIGHT, 32)
    feats = [
        ("· 每日最多 100 次 AI 解讀", "Up to 100 AI readings per day"),
        ("· AI 深度命理解讀 (八字/紫微/奇門/易經)", "Deep AI fortune (BaZi / ZiWei / QiMen / I-Ching)"),
        ("· 靈寵成長無上限", "Unlimited spirit-pet growth"),
        ("· 專屬靈寵分享卡片", "Branded shareable pet card"),
    ]
    fy = div_y + 60
    for zh, en in feats:
        draw.text((card_x + pad, fy), zh, font=f_feat, fill=TEXT)
        draw.text((card_x + pad + 30, fy + 65), en, font=f_feat_en, fill=TEXT_MUTE)
        fy += 130

    # CTA button (high-contrast)
    btn_y = card_y + card_h - 200
    btn_x = card_x + pad
    btn_w = card_w - pad * 2
    btn_h = 140
    draw.rounded_rectangle(
        (btn_x, btn_y, btn_x + btn_w, btn_y + btn_h),
        radius=30, fill=(*accent, 230)
    )
    f_cta = load_font(F_SERIF, 56)
    f_cta_en = load_font(F_LIGHT, 32)
    cta_zh = plan["cta_zh"]
    cta_en = plan["cta_en"]
    czw = text_w(draw, cta_zh, f_cta)
    cew = text_w(draw, cta_en, f_cta_en)
    draw.text((btn_x + (btn_w - czw) // 2, btn_y + 22),
              cta_zh, font=f_cta, fill=BG)
    draw.text((btn_x + (btn_w - cew) // 2, btn_y + 92),
              cta_en, font=f_cta_en, fill=BG)

    # ── Bottom legal ──
    f_legal = load_font(F_LIGHT, 28)
    legal_lines = [
        "訂閱會自動續訂 · Auto-renewing subscription",
        "可於 App Store 隨時取消 · Cancel anytime in App Store",
    ]
    ly = H - 160
    for line in legal_lines:
        draw.text(((W - text_w(draw, line, f_legal)) // 2, ly),
                  line, font=f_legal, fill=TEXT_MUTE)
        ly += 50


def main():
    # Use V7 splash as cosmic backdrop, scaled to 1290x2796
    bg_path = ASSETS / "logo" / "splash.png"
    if bg_path.exists():
        bg_src = Image.open(bg_path).convert("RGBA")
        # Source is 1024x2048, scale to fit 1290x2796 maintaining aspect
        ratio = max(W / bg_src.width, H / bg_src.height)
        new_w = int(bg_src.width * ratio)
        new_h = int(bg_src.height * ratio)
        bg_src = bg_src.resize((new_w, new_h), Image.LANCZOS)
        # Center crop
        left = (new_w - W) // 2
        top = (new_h - H) // 2
        bg = bg_src.crop((left, top, left + W, top + H))
        # Darken so card pops
        overlay = Image.new("RGBA", (W, H), (10, 10, 14, 200))
        bg = Image.alpha_composite(bg, overlay)
    else:
        bg = Image.new("RGBA", (W, H), (10, 10, 14, 255))

    plans = [
        {
            "name": "monthly",
            "label": "月付方案",
            "label_en": "Monthly Plan",
            "price": "NT$190",
            "period": "/月 · /month",
            "accent": GOLD,
            "cta_zh": "訂閱月付方案",
            "cta_en": "Subscribe Monthly",
        },
        {
            "name": "yearly",
            "label": "年付方案",
            "label_en": "Yearly Plan",
            "price": "NT$1900",
            "period": "/年 · /year",
            "accent": GREEN,
            "badge": "省 17% Save",
            "equiv": "約 NT$158/月 · 最划算 · best value",
            "cta_zh": "訂閱年付方案",
            "cta_en": "Subscribe Yearly",
        },
    ]

    for plan in plans:
        canvas = bg.copy()
        draw_card(canvas, plan)
        out = ROOT / f"iap-{plan['name']}-1290x2796.png"
        canvas.convert("RGB").save(out, "PNG", optimize=True)
        print(f"  [OK] {out.name} ({out.stat().st_size // 1024} KB, {W}x{H})")

    # ── Also generate a 1024x1024 promotional image for IAP listing ──
    # (Apple uses 1024x1024 for the *promotional image*, separate field)
    print("\n  [bonus] Promotional image 1024x1024 for IAP listing:")
    bg_sq = Image.open(bg_path).convert("RGBA") if bg_path.exists() else Image.new("RGBA", (1024, 1024), BG)
    side = min(bg_sq.size)
    left = (bg_sq.width - side) // 2
    top = 0
    bg_sq = bg_sq.crop((left, top, left + side, top + side)).resize((1024, 1024), Image.LANCZOS)
    overlay = Image.new("RGBA", (1024, 1024), (10, 10, 14, 100))
    bg_sq = Image.alpha_composite(bg_sq, overlay)
    pdraw = ImageDraw.Draw(bg_sq, "RGBA")
    icon_path = ASSETS / "logo" / "app-icon.png"
    if icon_path.exists():
        icon = Image.open(icon_path).convert("RGBA").resize((300, 300), Image.LANCZOS)
        bg_sq.paste(icon, ((1024 - 300) // 2, 240), icon)
    f_brand = load_font(F_BRUSH, 110)
    brand = "靈犀 LingXi"
    pdraw.text(((1024 - text_w(pdraw, brand, f_brand)) // 2, 590),
               brand, font=f_brand, fill=GOLD)
    f_tag = load_font(F_LIGHT, 38)
    tag = "AI 命理靈寵"
    pdraw.text(((1024 - text_w(pdraw, tag, f_tag)) // 2, 740),
               tag, font=f_tag, fill=TEXT_SUB)
    f_tag_en = load_font(F_LIGHT, 28)
    tag2 = "AI Fortune-Telling Pet"
    pdraw.text(((1024 - text_w(pdraw, tag2, f_tag_en)) // 2, 798),
               tag2, font=f_tag_en, fill=TEXT_MUTE)
    promo_out = ROOT / "iap-promotional-1024.png"
    bg_sq.convert("RGB").save(promo_out, "PNG", optimize=True)
    print(f"  [OK] {promo_out.name} ({promo_out.stat().st_size // 1024} KB, 1024x1024)")


if __name__ == "__main__":
    main()
