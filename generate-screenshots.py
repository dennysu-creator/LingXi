"""
Generate App Store screenshots for LingXi (6.5 inch: 1242 x 2688)
"""
from PIL import Image, ImageDraw, ImageFont
import os

W, H = 1242, 2688
OUT = os.path.join(os.path.dirname(__file__), "screenshots")
os.makedirs(OUT, exist_ok=True)

# Colors
BG = "#08080f"
SURFACE = "#151520"
GOLD = "#e8c547"
GOLD_DIM = "#c4b07a"
GOLD_DARK = "#8b7d5e"
WHITE = "#f0ece0"
BLUE = "#64b4ff"
PURPLE = "#a78bfa"
PINK = "#ff8ba0"
GREEN = "#64c880"
RED = "#ff6b6b"
BROWN = "#c8a060"

def get_font(size, bold=False):
    """Try to get a good CJK font"""
    font_paths = [
        "C:/Windows/Fonts/msjhbd.ttc" if bold else "C:/Windows/Fonts/msjh.ttc",
        "C:/Windows/Fonts/msyh.ttc",
        "C:/Windows/Fonts/simsun.ttc",
    ]
    for fp in font_paths:
        if os.path.exists(fp):
            try:
                return ImageFont.truetype(fp, size)
            except:
                continue
    return ImageFont.load_default()

font_title = get_font(72, bold=True)
font_big = get_font(56, bold=True)
font_medium = get_font(44, bold=True)
font_body = get_font(38)
font_small = get_font(32)
font_emoji = get_font(80)

def rounded_rect(draw, xy, fill, radius=24):
    x0, y0, x1, y1 = xy
    draw.rounded_rectangle(xy, radius=radius, fill=fill)

def draw_status_bar(draw):
    draw.text((60, 28), "9:41", fill=WHITE, font=get_font(28, bold=True))

def draw_card(draw, y, h, tint_color, alpha_hex="1a"):
    x0, y0, x1, y1 = 48, y, W - 48, y + h
    # Card background
    rounded_rect(draw, (x0, y0, x1, y1), fill="#1a1a28", radius=20)
    # Tint overlay line at top
    draw.rectangle((x0, y0, x1, y0 + 4), fill=tint_color)

# ──────────────────────────────────────
# Screenshot 1: Home - Main Dashboard
# ──────────────────────────────────────
def create_screenshot_1():
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)
    draw_status_bar(draw)

    # Header
    draw.text((W//2, 140), "靈犀 LingXi", fill=GOLD, font=font_title, anchor="mt")
    draw.text((W//2, 230), "AI 命理生活顧問", fill=GOLD_DIM, font=font_medium, anchor="mt")

    # Greeting area
    y = 340
    draw.text((60, y), "午安，旅人", fill=WHITE, font=font_big)
    draw.text((60, y + 70), "甲辰年 丙寅月 庚子日  午時", fill=GOLD_DIM, font=font_small)

    # Pet card
    y = 520
    draw_card(draw, y, 300, BLUE)
    draw.text((100, y + 30), "🐉", fill=WHITE, font=font_emoji)
    draw.text((220, y + 40), "小靈  Lv.5 靈龍", fill=WHITE, font=font_medium)
    draw.text((220, y + 100), "今日靈氣充沛，適合冥想修行", fill=GOLD_DIM, font=font_body)
    # Stat bars
    bar_y = y + 180
    for i, (label, pct, color) in enumerate([("靈力", 0.7, BLUE), ("親和", 0.5, PINK), ("智慧", 0.6, PURPLE)]):
        bx = 100 + i * 360
        draw.text((bx, bar_y), label, fill=GOLD_DIM, font=font_small)
        draw.rounded_rectangle((bx, bar_y + 40, bx + 280, bar_y + 56), radius=8, fill="#2a2a3a")
        draw.rounded_rectangle((bx, bar_y + 40, bx + int(280 * pct), bar_y + 56), radius=8, fill=color)

    # Today's fortune card
    y = 880
    draw_card(draw, y, 420, GOLD)
    draw.text((100, y + 30), "今日運勢", fill=GOLD, font=font_big)
    draw.text((100, y + 100), "整體運勢", fill=GOLD_DIM, font=font_body)
    draw.text((450, y + 95), "小吉", fill=GOLD, font=font_big)

    # Fortune grid
    gy = y + 180
    items = [("💰", "財運", "78"), ("🌸", "桃花", "85"), ("📈", "事業", "72"), ("💚", "健康", "90"), ("📚", "學業", "68")]
    for i, (emoji, label, score) in enumerate(items):
        gx = 100 + i * 210
        draw.text((gx, gy), emoji, fill=WHITE, font=get_font(48))
        draw.text((gx + 60, gy + 5), label, fill=GOLD_DIM, font=font_small)
        draw.text((gx + 20, gy + 50), score, fill=WHITE, font=font_medium)

    # Lucky info
    ly = y + 320
    draw.text((100, ly), "幸運元素: 金", fill=GOLD_DIM, font=font_small)
    draw.text((400, ly), "方位: 西北", fill=GOLD_DIM, font=font_small)
    draw.text((680, ly), "數字: 3, 8", fill=GOLD_DIM, font=font_small)

    # Qimen 9-palace grid
    y = 1360
    draw_card(draw, y, 500, GOLD)
    draw.text((100, y + 30), "奇門遁甲 時盤", fill=GOLD, font=font_big)

    # 3x3 grid
    grid_data = [
        ("巽四", "景門"), ("離九", "死門"), ("坤二", "驚門"),
        ("震三", "傷門"), ("中五", ""), ("兌七", "開門"),
        ("艮八", "生門"), ("坎一", "休門"), ("乾六", "杜門"),
    ]
    for row in range(3):
        for col in range(3):
            idx = row * 3 + col
            cx = 140 + col * 320
            cy = y + 120 + row * 120
            cell_color = "#2a2a3a" if idx != 6 else "#2a3a2a"  # Highlight "生門"
            rounded_rect(draw, (cx, cy, cx + 280, cy + 100), fill=cell_color, radius=12)
            palace, gate = grid_data[idx]
            draw.text((cx + 20, cy + 10), palace, fill=WHITE, font=font_small)
            if gate:
                gate_color = GREEN if gate in ("生門", "開門", "休門") else RED if gate in ("死門", "驚門") else GOLD_DIM
                draw.text((cx + 140, cy + 10), gate, fill=gate_color, font=font_small)

    # Quick action buttons
    y = 1920
    actions = [("👁", "玄眼", GOLD), ("🌍", "天心", BLUE), ("🏮", "靈珠", "#ff8c42")]
    for i, (emoji, label, color) in enumerate(actions):
        ax = 120 + i * 370
        rounded_rect(draw, (ax, y, ax + 320, y + 120), fill="#1a1a28", radius=16)
        draw.text((ax + 40, y + 20), emoji, fill=WHITE, font=get_font(56))
        draw.text((ax + 120, y + 30), label, fill=color, font=font_medium)

    # Feature highlights at bottom
    y = 2120
    draw.text((W//2, y), "6 大命理系統一站整合", fill=GOLD, font=font_medium, anchor="mt")

    features = ["八字命理", "紫微斗數", "西洋占星", "奇門遁甲", "AI 面相", "GPS 風水"]
    for i, feat in enumerate(features):
        row = i // 3
        col = i % 3
        fx = 120 + col * 360
        fy = y + 80 + row * 80
        draw.text((fx, fy), "•  " + feat, fill=GOLD_DIM, font=font_body)

    # Bottom tab bar
    draw.rectangle((0, H - 140, W, H), fill="#0d0d15")
    tabs = [("🐉", "首頁"), ("🔮", "靈寵"), ("⚙️", "我的")]
    for i, (emoji, label) in enumerate(tabs):
        tx = W // 6 + i * (W // 3)
        color = GOLD if i == 0 else GOLD_DARK
        draw.text((tx, H - 120), emoji, fill=color, font=get_font(40), anchor="mt")
        draw.text((tx, H - 60), label, fill=color, font=get_font(24), anchor="mt")

    img.save(os.path.join(OUT, "01_home.png"), "PNG")
    print("Created: 01_home.png")

# ──────────────────────────────────────
# Screenshot 2: AI Fortune Features
# ──────────────────────────────────────
def create_screenshot_2():
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)
    draw_status_bar(draw)

    draw.text((W//2, 140), "八字命理分析", fill=GOLD, font=font_title, anchor="mt")

    # Birth info card
    y = 300
    draw_card(draw, y, 240, GOLD)
    draw.text((100, y + 30), "出生資訊", fill=GOLD, font=font_medium)
    draw.text((100, y + 90), "1990 年 3 月 15 日  午時 (11:00-13:00)", fill=WHITE, font=font_body)
    draw.text((100, y + 150), "農曆: 庚午年 己卯月 丙申日 甲午時", fill=GOLD_DIM, font=font_body)

    # Eight characters display
    y = 600
    draw_card(draw, y, 320, GOLD)
    draw.text((100, y + 30), "四柱八字", fill=GOLD, font=font_medium)

    pillars = [("年柱", "庚", "午"), ("月柱", "己", "卯"), ("日柱", "丙", "申"), ("時柱", "甲", "午")]
    for i, (label, stem, branch) in enumerate(pillars):
        px = 120 + i * 270
        draw.text((px, y + 100), label, fill=GOLD_DIM, font=font_small)
        rounded_rect(draw, (px, y + 150, px + 100, y + 260), fill="#2a2a1a", radius=12)
        draw.text((px + 25, y + 160), stem, fill=GOLD, font=font_big)
        rounded_rect(draw, (px + 120, y + 150, px + 220, y + 260), fill="#1a2a2a", radius=12)
        draw.text((px + 145, y + 160), branch, fill=BLUE, font=font_big)

    # AI Analysis card
    y = 980
    draw_card(draw, y, 600, PURPLE)
    draw.text((100, y + 30), "AI 命理解讀", fill=PURPLE, font=font_big)
    draw.text((100, y + 95), "Powered by Claude", fill=GOLD_DIM, font=font_small)

    analysis_lines = [
        "日主丙火生於卯月，得木生助，火勢旺盛。",
        "命格特質：熱情開朗，具有領導力與創造力。",
        "性格果斷，富有正義感，善於表達。",
        "",
        "2026 年流年運勢：",
        "丙火遇太歲丙寅，比肩透出，主競爭與",
        "合作並存。上半年事業運佳，把握機會。",
        "下半年注意健康，適度休息。",
        "",
        "財運方面，偏財運較旺，投資理財可適度",
        "嘗試，但需謹慎。感情方面桃花旺盛，",
        "已婚者注意經營家庭關係。",
    ]
    for i, line in enumerate(analysis_lines):
        draw.text((100, y + 150 + i * 42), line, fill=WHITE if line else WHITE, font=font_small)

    # Five elements chart
    y = 1640
    draw_card(draw, y, 280, GOLD)
    draw.text((100, y + 30), "五行分布", fill=GOLD, font=font_medium)
    elements = [("金", "#e8e0c0", 0.15), ("木", "#80c880", 0.35), ("水", "#64b4ff", 0.1), ("火", "#ff6b6b", 0.3), ("土", "#c8a060", 0.1)]
    for i, (name, color, pct) in enumerate(elements):
        ex = 100 + i * 210
        ey = y + 110
        bar_h = int(120 * pct) + 20
        rounded_rect(draw, (ex, ey + 120 - bar_h, ex + 160, ey + 120), fill=color, radius=8)
        draw.text((ex + 60, ey + 130), name, fill=color, font=font_small, anchor="mt")

    # Bottom marketing text
    draw.text((W//2, 2050), "AI 深度解讀你的命格與運勢", fill=GOLD, font=font_medium, anchor="mt")
    draw.text((W//2, 2120), "結合傳統命理智慧與現代 AI 技術", fill=GOLD_DIM, font=font_body, anchor="mt")

    # Tab bar
    draw.rectangle((0, H - 140, W, H), fill="#0d0d15")

    img.save(os.path.join(OUT, "02_bazi.png"), "PNG")
    print("Created: 02_bazi.png")

# ──────────────────────────────────────
# Screenshot 3: Pet System
# ──────────────────────────────────────
def create_screenshot_3():
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)
    draw_status_bar(draw)

    # Mode switcher
    modes = [("🐾", "養成", True), ("👁", "玄眼", False), ("🌍", "天心", False), ("🏮", "靈珠", False)]
    for i, (emoji, label, active) in enumerate(modes):
        mx = 48 + i * 290
        bg_color = "#2a2518" if active else "#1a1a28"
        rounded_rect(draw, (mx, 100, mx + 270, 180), fill=bg_color, radius=12)
        draw.text((mx + 30, 115), emoji, fill=GOLD if active else GOLD_DARK, font=get_font(36))
        draw.text((mx + 80, 120), label, fill=GOLD if active else GOLD_DARK, font=font_small)
        if active:
            draw.rectangle((mx + 40, 172, mx + 230, 178), fill=GOLD)

    # Pet main card
    y = 230
    draw_card(draw, y, 500, BLUE)
    draw.text((W//2, y + 40), "🐉", fill=WHITE, font=get_font(120), anchor="mt")
    draw.text((W//2, y + 180), "小靈", fill=WHITE, font=font_big, anchor="mt")
    draw.text((W//2, y + 250), "靈龍  •  金屬性", fill=GOLD_DIM, font=font_body, anchor="mt")

    # Tags
    tags = [("Lv.5", BLUE), ("金", BROWN), ("幼龍期", GREEN)]
    for i, (tag, color) in enumerate(tags):
        tx = 300 + i * 220
        rounded_rect(draw, (tx, y + 310, tx + 180, y + 360), fill=color + "30", radius=16)
        draw.text((tx + 90, y + 320), tag, fill=color, font=font_small, anchor="mt")

    # EXP bar
    draw.text((100, y + 390), "EXP", fill=GOLD_DIM, font=font_small)
    draw.text((980, y + 390), "350/500", fill=GOLD_DIM, font=font_small)
    draw.rounded_rectangle((100, y + 435, W - 100, y + 460), radius=12, fill="#2a2a3a")
    draw.rounded_rectangle((100, y + 435, 100 + int((W - 200) * 0.7), y + 460), radius=12, fill=GOLD)

    # Stat bars
    y2 = 790
    draw_card(draw, y2, 220, BLUE)
    stats = [("靈力", 0.7, BLUE, "42"), ("親和", 0.5, PINK, "28"), ("智慧", 0.6, PURPLE, "35")]
    for i, (label, pct, color, val) in enumerate(stats):
        sy = y2 + 30 + i * 60
        draw.text((100, sy), label, fill=GOLD_DIM, font=font_small)
        draw.rounded_rectangle((240, sy + 8, 900, sy + 38), radius=10, fill="#2a2a3a")
        draw.rounded_rectangle((240, sy + 8, 240 + int(660 * pct), sy + 38), radius=10, fill=color)
        draw.text((930, sy), val, fill=color, font=font_small)

    # Action buttons
    y3 = 1070
    actions = [("🍖", "餵食", "+50 EXP"), ("🎮", "玩耍", "+15 親和"), ("📿", "冥想", "+10 智慧")]
    for i, (emoji, label, bonus) in enumerate(actions):
        ax = 80 + i * 380
        draw_card(draw, y3, 160, GOLD)
        draw.text((ax + 40, y3 + 20), emoji, fill=WHITE, font=get_font(48))
        draw.text((ax + 120, y3 + 20), label, fill=WHITE, font=font_medium)
        draw.text((ax + 120, y3 + 80), bonus, fill=GREEN, font=font_small)

    # Level unlock section
    y4 = 1300
    draw.text((100, y4), "等級解鎖進度", fill=GOLD, font=font_medium)
    unlocks = [
        ("Lv.1", "基礎對話", True, "💬"),
        ("Lv.3", "每日提醒", True, "🔔"),
        ("Lv.5", "穿搭建議", True, "👔"),
        ("Lv.8", "風水導航", False, "🧭"),
        ("Lv.10", "深度解夢", False, "🌙"),
        ("Lv.15", "命格共鳴", False, "✨"),
    ]
    for i, (lv, feat, unlocked, icon) in enumerate(unlocks):
        uy = y4 + 70 + i * 80
        bg = "#1a2a1a" if unlocked else "#1a1a28"
        rounded_rect(draw, (80, uy, W - 80, uy + 68), fill=bg, radius=12)
        draw.text((120, uy + 10), icon if unlocked else "🔒", fill=WHITE, font=get_font(36))
        draw.text((190, uy + 12), lv, fill=GOLD if unlocked else GOLD_DARK, font=font_small)
        draw.text((340, uy + 12), feat, fill=WHITE if unlocked else GOLD_DARK, font=font_small)
        if unlocked:
            draw.text((W - 140, uy + 12), "已解鎖", fill=GREEN, font=font_small)

    # Marketing text
    draw.text((W//2, 2200), "培養你的專屬靈寵", fill=GOLD, font=font_medium, anchor="mt")
    draw.text((W//2, 2270), "陪伴你的每日修行旅程", fill=GOLD_DIM, font=font_body, anchor="mt")

    # Tab bar
    draw.rectangle((0, H - 140, W, H), fill="#0d0d15")
    tabs = [("🐉", "首頁"), ("🔮", "靈寵"), ("⚙️", "我的")]
    for i, (emoji, label) in enumerate(tabs):
        tx = W // 6 + i * (W // 3)
        color = GOLD if i == 1 else GOLD_DARK
        draw.text((tx, H - 120), emoji, fill=color, font=get_font(40), anchor="mt")
        draw.text((tx, H - 60), label, fill=color, font=get_font(24), anchor="mt")

    img.save(os.path.join(OUT, "03_pet.png"), "PNG")
    print("Created: 03_pet.png")

# ──────────────────────────────────────
# Screenshot 4: Feature Overview
# ──────────────────────────────────────
def create_screenshot_4():
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)
    draw_status_bar(draw)

    draw.text((W//2, 160), "靈犀 LingXi", fill=GOLD, font=font_title, anchor="mt")
    draw.text((W//2, 260), "6 大命理系統一站整合", fill=GOLD_DIM, font=font_medium, anchor="mt")

    features = [
        ("👁", "AI 面相分析", "上傳照片，AI 即時解讀\n面部特徵與運勢走向", GOLD),
        ("📜", "八字命理", "四柱八字精準分析\n命格特質與流年運勢", RED),
        ("⭐", "紫微斗數", "十二宮位完整解盤\n事業感情財運一次看透", PURPLE),
        ("🔮", "奇門遁甲", "古法擇時決策輔助\n九宮飛星方位分析", GREEN),
        ("🌙", "西洋占星", "本命盤與行運分析\n了解星象對你的影響", BLUE),
        ("🧭", "GPS 風水", "即時定位分析\n所在環境的風水格局", BROWN),
    ]

    for i, (emoji, title, desc, color) in enumerate(features):
        row = i
        y = 380 + row * 340
        draw_card(draw, y, 300, color)

        # Emoji circle
        cx, cy = 160, y + 150
        draw.ellipse((cx - 60, cy - 60, cx + 60, cy + 60), fill=color + "25")
        draw.text((cx, cy), emoji, fill=WHITE, font=get_font(64), anchor="mm")

        # Text
        draw.text((280, y + 50), title, fill=color, font=font_big)
        lines = desc.split("\n")
        for j, line in enumerate(lines):
            draw.text((280, y + 130 + j * 48), line, fill=GOLD_DIM, font=font_body)

    # Bottom text
    draw.text((W//2, 2440), "融合東方智慧與 AI 技術", fill=GOLD, font=font_medium, anchor="mt")
    draw.text((W//2, 2510), "支援繁中、簡中、英、日、韓、越南語", fill=GOLD_DIM, font=font_body, anchor="mt")

    img.save(os.path.join(OUT, "04_features.png"), "PNG")
    print("Created: 04_features.png")

# ──────────────────────────────────────
# Screenshot 5: Subscription Plans
# ──────────────────────────────────────
def create_screenshot_5():
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)
    draw_status_bar(draw)

    draw.text((W//2, 160), "選擇你的方案", fill=GOLD, font=font_title, anchor="mt")
    draw.text((W//2, 260), "解鎖完整命理體驗", fill=GOLD_DIM, font=font_medium, anchor="mt")

    plans = [
        ("免費版", "NT$0", GOLD_DARK, [
            "每項功能每日 1 次",
            "靈寵等級上限 Lv.10",
            "基礎模板解讀",
        ]),
        ("靈犀會員", "NT$390/月", GOLD, [
            "每項功能每日 5 次",
            "靈寵等級上限 Lv.20",
            "AI Haiku 進階解讀",
            "完整占星分析",
        ]),
        ("靈犀至尊", "NT$1,990/月", PURPLE, [
            "所有功能無限次",
            "靈寵等級無上限",
            "AI Sonnet 深度解讀",
            "跨系統深度分析",
            "含首飾珠寶建議",
        ]),
    ]

    for i, (name, price, color, features) in enumerate(plans):
        y = 380 + i * 700
        h = 620

        # Card
        x0, y0, x1, y1 = 80, y, W - 80, y + h
        rounded_rect(draw, (x0, y0, x1, y1), fill="#1a1a28", radius=24)

        # Top accent bar
        draw.rounded_rectangle((x0, y0, x1, y0 + 6), radius=3, fill=color)

        # Best value badge for supreme
        if i == 2:
            rounded_rect(draw, (W - 340, y + 20, W - 110, y + 70), fill=PURPLE, radius=12)
            draw.text((W - 225, y + 28), "最超值", fill=WHITE, font=font_small, anchor="mt")

        # Plan name
        draw.text((140, y + 40), name, fill=color, font=font_big)

        # Price
        draw.text((140, y + 120), price, fill=WHITE, font=font_title)

        # Divider
        draw.rectangle((140, y + 220, x1 - 60, y + 222), fill="#2a2a3a")

        # Features
        for j, feat in enumerate(features):
            fy = y + 260 + j * 65
            draw.text((160, fy), "✓", fill=color, font=font_body)
            draw.text((220, fy), feat, fill=WHITE, font=font_body)

        # Subscribe button (for paid plans)
        if i > 0:
            btn_y = y + h - 100
            btn_color = color
            rounded_rect(draw, (140, btn_y, x1 - 60, btn_y + 70), fill=btn_color, radius=16)
            draw.text(((140 + x1 - 60) // 2, btn_y + 18), "立即訂閱", fill=BG, font=font_medium, anchor="mt")

    # Bottom disclaimer
    draw.text((W//2, 2540), "訂閱方案為自動續訂", fill=GOLD_DARK, font=font_small, anchor="mt")
    draw.text((W//2, 2590), "可隨時在 iPhone 設定中管理或取消", fill=GOLD_DARK, font=font_small, anchor="mt")

    img.save(os.path.join(OUT, "05_plans.png"), "PNG")
    print("Created: 05_plans.png")


if __name__ == "__main__":
    create_screenshot_1()
    create_screenshot_2()
    create_screenshot_3()
    create_screenshot_4()
    create_screenshot_5()
    print(f"\nAll screenshots saved to: {OUT}")
    print("Size: 1242 x 2688 (6.5 inch iPhone)")
