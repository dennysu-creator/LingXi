#!/usr/bin/env python3
"""
Generate bilingual (EN/ZH) pet character asset prompts:
  - assets/pets/PET_PROMPTS.md
  - assets/pets/PET_PROMPTS.html
24 pets × 6 images = 144 assets, each with save path + AI generation prompt
"""
import os, html as html_mod

OUT_DIR = os.path.join(os.path.dirname(__file__), "assets", "pets")

# ── Season palettes ──
SEASON = {
    "春": {"en": "Spring", "zh": "春季", "colors": "#7bc96f, #f0a0c0, #a0d8ef",
            "palette_en": "fresh green, soft pink, light blue", "palette_zh": "嫩綠、粉色、淺藍",
            "border": "#7bc96f"},
    "夏": {"en": "Summer", "zh": "夏季", "colors": "#e8c547, #ff6b35, #c44040",
            "palette_en": "gold, orange-red, flame", "palette_zh": "金色、橙紅、烈焰",
            "border": "#e8c547"},
    "秋": {"en": "Autumn", "zh": "秋季", "colors": "#d4a574, #c0a030, #c0c0c0",
            "palette_en": "golden-amber, bronze, silver", "palette_zh": "金黃、琥珀、銀白",
            "border": "#d4a574"},
    "冬": {"en": "Winter", "zh": "冬季", "colors": "#64b4ff, #4a2080, #00ffa0",
            "palette_en": "icy blue, deep purple, aurora green", "palette_zh": "冰藍、深紫、極光",
            "border": "#64b4ff"},
}

ELEMENT_COLOR = {"木": "#80c880", "火": "#ff6b6b", "土": "#c8a060", "金": "#e8e0c0", "水": "#64b4ff"}
ELEMENT_EN = {"木": "Wood", "火": "Fire", "土": "Earth", "金": "Metal", "水": "Water"}

# ── 24 Spirit Pets ──
PETS = [
    {"id": "01-lichun",      "term": "立春", "term_en": "Beginning of Spring",    "name": "青芽鹿", "creature": "鹿",     "creature_en": "young deer",       "emoji": "🦌", "element": "木", "season": "春", "zodiac": "水瓶座", "zodiac_en": "Aquarius",    "keywords_zh": "春芽鹿角、新生嫩綠、破土而出的生機", "keywords_en": "spring buds growing from antlers, fresh green new life, sprouting vitality"},
    {"id": "02-yushui",      "term": "雨水", "term_en": "Rain Water",             "name": "潤澤蛙", "creature": "蛙",     "creature_en": "rain frog",        "emoji": "🐸", "element": "水", "season": "春", "zodiac": "雙魚座", "zodiac_en": "Pisces",      "keywords_zh": "雨滴環繞、荷葉坐騎、水珠光澤", "keywords_en": "surrounded by raindrops, sitting on lotus leaf, water droplet sheen"},
    {"id": "03-jingzhe",     "term": "驚蟄", "term_en": "Awakening of Insects",   "name": "雷蟲龍", "creature": "龍蟲",   "creature_en": "thunder dragon-bug","emoji": "🐲", "element": "木", "season": "春", "zodiac": "雙魚座", "zodiac_en": "Pisces",      "keywords_zh": "微型龍形、雷電紋路、破土甦醒", "keywords_en": "miniature dragon form, lightning patterns, awakening from earth"},
    {"id": "04-chunfen",     "term": "春分", "term_en": "Spring Equinox",         "name": "衡翼蝶", "creature": "蝴蝶",   "creature_en": "balance butterfly", "emoji": "🦋", "element": "木", "season": "春", "zodiac": "牡羊座", "zodiac_en": "Aries",       "keywords_zh": "日夜雙翼、陰陽平衡、花粉光點", "keywords_en": "day-night dual wings, yin-yang balance, pollen light particles"},
    {"id": "05-qingming",    "term": "清明", "term_en": "Clear and Bright",       "name": "清風鶴", "creature": "鶴",     "creature_en": "wind crane",       "emoji": "🦢", "element": "木", "season": "春", "zodiac": "牡羊座", "zodiac_en": "Aries",       "keywords_zh": "仙鶴身姿、清澈微風、柳絮飄飛", "keywords_en": "elegant crane posture, clear gentle breeze, willow catkins floating"},
    {"id": "06-guyu",        "term": "穀雨", "term_en": "Grain Rain",             "name": "穀靈兔", "creature": "兔",     "creature_en": "grain rabbit",     "emoji": "🐰", "element": "土", "season": "春", "zodiac": "金牛座", "zodiac_en": "Taurus",      "keywords_zh": "穀穗花環、春雨滋潤、豐收祈願", "keywords_en": "grain-ear wreath crown, spring rain nourishing, harvest blessing"},
    {"id": "07-lixia",       "term": "立夏", "term_en": "Beginning of Summer",    "name": "炎蟬精", "creature": "蟬",     "creature_en": "flame cicada",     "emoji": "🪲", "element": "火", "season": "夏", "zodiac": "金牛座", "zodiac_en": "Taurus",      "keywords_zh": "透明薄翼、初夏暖光、蟬鳴音波", "keywords_en": "translucent thin wings, early summer warm glow, cicada sound waves"},
    {"id": "08-xiaoman",     "term": "小滿", "term_en": "Grain Buds",             "name": "金穗狐", "creature": "狐",     "creature_en": "golden fox",       "emoji": "🦊", "element": "火", "season": "夏", "zodiac": "雙子座", "zodiac_en": "Gemini",      "keywords_zh": "金色毛皮、麥穗尾巴、豐盈飽滿", "keywords_en": "golden fur, wheat-ear tail, plump and abundant"},
    {"id": "09-mangzhong",   "term": "芒種", "term_en": "Grain in Ear",           "name": "芒鳳雀", "creature": "雀鳳",   "creature_en": "phoenix sparrow",  "emoji": "🐦", "element": "火", "season": "夏", "zodiac": "雙子座", "zodiac_en": "Gemini",      "keywords_zh": "金色羽翼、稻芒光芒、播種希望", "keywords_en": "golden feathered wings, grain-awn radiance, sowing hope"},
    {"id": "10-xiazhi",      "term": "夏至", "term_en": "Summer Solstice",        "name": "日輪獅", "creature": "獅",     "creature_en": "solar lion",       "emoji": "🦁", "element": "火", "season": "夏", "zodiac": "巨蟹座", "zodiac_en": "Cancer",      "keywords_zh": "太陽鬃毛、正午光環、最長白晝", "keywords_en": "sun-like mane, noon halo, longest daylight radiance"},
    {"id": "11-xiaoshu",     "term": "小暑", "term_en": "Minor Heat",             "name": "螢火靈", "creature": "螢火蟲", "creature_en": "giant firefly",    "emoji": "✨", "element": "火", "season": "夏", "zodiac": "巨蟹座", "zodiac_en": "Cancer",      "keywords_zh": "巨大螢火蟲、夏夜微光、溫暖引路", "keywords_en": "giant firefly spirit, summer night soft glow, warm guiding light"},
    {"id": "12-dashu",       "term": "大暑", "term_en": "Major Heat",             "name": "烈陽鷹", "creature": "鷹",     "creature_en": "blazing eagle",    "emoji": "🦅", "element": "土", "season": "夏", "zodiac": "獅子座", "zodiac_en": "Leo",         "keywords_zh": "烈日雙翼、熱浪氣場、高空俯瞰", "keywords_en": "blazing sun wings, heatwave aura, soaring high gaze"},
    {"id": "13-liqiu",       "term": "立秋", "term_en": "Beginning of Autumn",    "name": "金風虎", "creature": "虎",     "creature_en": "golden wind tiger","emoji": "🐯", "element": "金", "season": "秋", "zodiac": "獅子座", "zodiac_en": "Leo",         "keywords_zh": "秋風金紋、落葉環繞、威嚴轉涼", "keywords_en": "autumn wind golden stripes, falling leaves swirling, majestic cool breeze"},
    {"id": "14-chushu",      "term": "處暑", "term_en": "End of Heat",            "name": "涼蟬仙", "creature": "蟬",     "creature_en": "cool cicada sage", "emoji": "🪲", "element": "金", "season": "秋", "zodiac": "處女座", "zodiac_en": "Virgo",       "keywords_zh": "褪色薄翼、秋涼微風、暑氣消散", "keywords_en": "faded translucent wings, cool autumn breeze, dissipating summer heat"},
    {"id": "15-bailu",       "term": "白露", "term_en": "White Dew",              "name": "露珠蛇", "creature": "蛇",     "creature_en": "dew serpent",      "emoji": "🐍", "element": "金", "season": "秋", "zodiac": "處女座", "zodiac_en": "Virgo",       "keywords_zh": "晶瑩鱗片、晨露凝結、月光折射", "keywords_en": "crystalline scales, morning dew condensation, moonlight refraction"},
    {"id": "16-qiufen",      "term": "秋分", "term_en": "Autumn Equinox",         "name": "月衡鶴", "creature": "鶴",     "creature_en": "moon crane",       "emoji": "🦢", "element": "金", "season": "秋", "zodiac": "天秤座", "zodiac_en": "Libra",       "keywords_zh": "月光翅膀、天秤光陣、晝夜等分", "keywords_en": "moonlit wings, Libra light array, equal day and night"},
    {"id": "17-hanlu",       "term": "寒露", "term_en": "Cold Dew",               "name": "霜菊貓", "creature": "貓",     "creature_en": "frost chrysanthemum cat","emoji": "🐱", "element": "水", "season": "秋", "zodiac": "天秤座", "zodiac_en": "Libra",  "keywords_zh": "菊花冠飾、寒霜毛色、深秋寧靜", "keywords_en": "chrysanthemum crown ornament, frost-colored fur, deep autumn serenity"},
    {"id": "18-shuangjiang", "term": "霜降", "term_en": "Frost's Descent",        "name": "霜狼靈", "creature": "狼",     "creature_en": "frost wolf spirit","emoji": "🐺", "element": "水", "season": "秋", "zodiac": "天蠍座", "zodiac_en": "Scorpio",     "keywords_zh": "銀霜皮毛、冰晶呼吸、孤月嚎叫", "keywords_en": "silver frost fur, ice crystal breath, lone moon howling"},
    {"id": "19-lidong",      "term": "立冬", "term_en": "Beginning of Winter",    "name": "冬眠熊", "creature": "熊",     "creature_en": "hibernating bear", "emoji": "🐻", "element": "水", "season": "冬", "zodiac": "天蠍座", "zodiac_en": "Scorpio",     "keywords_zh": "厚實毛皮、冬眠蜷縮、蓄能守護", "keywords_en": "thick fluffy fur, curled hibernation pose, storing energy guardian"},
    {"id": "20-xiaoxue",     "term": "小雪", "term_en": "Minor Snow",             "name": "雪兔仙", "creature": "兔",     "creature_en": "snow rabbit fairy","emoji": "🐇", "element": "水", "season": "冬", "zodiac": "射手座", "zodiac_en": "Sagittarius", "keywords_zh": "白色長耳、初雪飄落、輕盈跳躍", "keywords_en": "white long ears, first snowfall drifting, light graceful leaps"},
    {"id": "21-daxue",       "term": "大雪", "term_en": "Major Snow",             "name": "雪鴞靈", "creature": "貓頭鷹", "creature_en": "snowy owl spirit", "emoji": "🦉", "element": "水", "season": "冬", "zodiac": "射手座", "zodiac_en": "Sagittarius", "keywords_zh": "雪白羽毛、暗夜慧眼、風雪中守望", "keywords_en": "snow-white feathers, wise night eyes, watchful in blizzard"},
    {"id": "22-dongzhi",     "term": "冬至", "term_en": "Winter Solstice",        "name": "玄冰龍", "creature": "龍",     "creature_en": "ice dragon",       "emoji": "🐉", "element": "水", "season": "冬", "zodiac": "摩羯座", "zodiac_en": "Capricorn",   "keywords_zh": "冰晶龍鱗、極寒吐息、冬至轉陽", "keywords_en": "ice crystal dragon scales, freezing breath, winter solstice rebirth"},
    {"id": "23-xiaohan",     "term": "小寒", "term_en": "Minor Cold",             "name": "寒星鯨", "creature": "鯨",     "creature_en": "star whale",       "emoji": "🐋", "element": "水", "season": "冬", "zodiac": "摩羯座", "zodiac_en": "Capricorn",   "keywords_zh": "星辰鯨身、深海潛行、寒夜星空", "keywords_en": "starry whale body, deep sea voyager, cold night starfield"},
    {"id": "24-dahan",       "term": "大寒", "term_en": "Major Cold",             "name": "極光鳳", "creature": "鳳凰",   "creature_en": "aurora phoenix",   "emoji": "🔥", "element": "土", "season": "冬", "zodiac": "水瓶座", "zodiac_en": "Aquarius",    "keywords_zh": "極光羽翼、嚴冬中重生、春之預兆", "keywords_en": "aurora borealis wings, reborn in deepest winter, herald of spring"},
]

# ── Image types ──
IMAGE_TYPES = [
    {"file": "avatar.png", "size": "512x512",  "use_zh": "靈寵頭像（對話框、列表）",      "use_en": "Pet avatar (chat bubbles, lists)"},
    {"file": "full.png",   "size": "1024x1024", "use_zh": "靈寵全身圖（主畫面浮動展示）",  "use_en": "Full body (main screen floating display)"},
    {"file": "evo-1.png",  "size": "1024x1024", "use_zh": "進化階段 1 — 初始型態",         "use_en": "Evolution Stage 1 — Initial Form"},
    {"file": "evo-2.png",  "size": "1024x1024", "use_zh": "進化階段 2 — 覺醒型態",         "use_en": "Evolution Stage 2 — Awakened Form"},
    {"file": "evo-3.png",  "size": "1024x1024", "use_zh": "進化階段 3 — 終極型態",         "use_en": "Evolution Stage 3 — Ultimate Form"},
    {"file": "icon.png",   "size": "128x128",   "use_zh": "小圖示（選單、通知列）",        "use_en": "Small icon (menus, notifications)"},
]

EVO_EXTRA = {
    "evo-1.png": {
        "en": "small, baby-like proportions, simple single-color aura, innocent wide-eyed expression, minimal accessories",
        "zh": "小巧幼崽比例、簡單單色光暈、天真大眼神情、極少裝飾",
    },
    "evo-2.png": {
        "en": "medium size, more detailed features, stronger dual-color aura, small accessories or armor pieces, confident expression",
        "zh": "中等體型、更精緻的細節、較強的雙色光暈、小型飾品或甲片、自信表情",
    },
    "evo-3.png": {
        "en": "majestic full size, elaborate armor and accessories, intense multi-color aura, constellation patterns on body, divine powerful expression, celestial energy particles",
        "zh": "雄偉全尺寸、華麗鎧甲與飾品、強烈多色光暈、身上星座紋路、神聖威嚴表情、天界能量粒子",
    },
}


def build_prompt_en(pet, img):
    """Build English AI prompt for a pet image."""
    s = SEASON[pet["season"]]
    evo = EVO_EXTRA.get(img["file"], None)

    base = (
        f'A cute mystical {pet["creature_en"]} spirit pet, Chinese fantasy style, '
        f'{s["palette_en"]} glowing aura, semi-transparent ethereal body, '
        f'inspired by the solar term "{pet["term_en"]}" and {pet["zodiac_en"]} constellation, '
        f'dark background (#08080f), golden sparkle particles, '
    )

    if img["file"] == "avatar.png":
        base += "close-up portrait, circular crop friendly, "
    elif img["file"] == "icon.png":
        base += "simplified icon style, bold silhouette, minimal detail, "
    else:
        base += "chibi proportions, mystical floating pose, "

    base += f'{pet["keywords_en"]}, '

    if evo:
        base += f'{evo["en"]}, '

    base += f'high quality game art, PNG transparent background, {img["size"]}'
    return base


def build_prompt_zh(pet, img):
    """Build Traditional Chinese AI prompt for a pet image."""
    s = SEASON[pet["season"]]
    evo = EVO_EXTRA.get(img["file"], None)

    base = (
        f'可愛神秘的{pet["creature"]}靈寵，中國奇幻風格，'
        f'{s["palette_zh"]}發光氣場，半透明靈體質感，'
        f'靈感來自節氣「{pet["term"]}」和{pet["zodiac"]}星座，'
        f'深色背景 (#08080f)，金色閃爍粒子，'
    )

    if img["file"] == "avatar.png":
        base += "特寫肖像、適合圓形裁切、"
    elif img["file"] == "icon.png":
        base += "簡化圖標風格、粗體剪影、最少細節、"
    else:
        base += "Q版比例、神秘浮動姿態、"

    base += f'{pet["keywords_zh"]}，'

    if evo:
        base += f'{evo["zh"]}，'

    base += f'高品質遊戲美術，PNG 透明背景，{img["size"]}'
    return base


def file_path(pet, img):
    return f'assets/pets/{pet["id"]}/{img["file"]}'


# ═══════════════════════════════════════════
#  Generate MD
# ═══════════════════════════════════════════
def generate_md():
    lines = []
    lines.append("# 靈犀 — 24 靈寵角色素材 AI Prompt（中英雙語）\n")
    lines.append("> 24 隻靈寵 × 6 張圖 = **144 張素材**")
    lines.append("> 每張都附 **英文** + **繁體中文** AI 生成 prompt + **檔案存放路徑**")
    lines.append("> HTML 版本: `PET_PROMPTS.html`（點擊即複製）\n")
    lines.append("---\n")

    # Style guide
    lines.append("## 統一風格指引\n")
    lines.append("```")
    lines.append("品牌: 靈犀 LingXi — 東方命理靈寵 App")
    lines.append("主色調: 金色 #E8C547 + 深黑 #08080F")
    lines.append("風格: 東方神秘 × Q 版可愛，金色光暈，半透明靈體感")
    lines.append("背景: 一律透明 PNG（疊在深黑 #08080F 上使用）")
    lines.append("質感: 金色粒子閃爍、微光暈、精緻細線描邊")
    lines.append("季節色系: 春=嫩綠粉藍 / 夏=金色橙紅 / 秋=金黃琥珀銀 / 冬=冰藍深紫極光")
    lines.append("```\n")
    lines.append("---\n")

    # Summary table
    lines.append("## 素材總覽\n")
    lines.append("| # | 節氣 | 靈寵 | 五行 | 季節 | 圖片數 | 資料夾路徑 |")
    lines.append("|---|------|------|------|------|--------|-----------|")
    for p in PETS:
        lines.append(f'| {p["id"][:2]} | {p["term"]} | {p["emoji"]} {p["name"]} | {p["element"]} | {p["season"]} | 6 | `assets/pets/{p["id"]}/` |')
    lines.append(f"\n**總計: {len(PETS)} 隻 × 6 張 = {len(PETS)*6} 張素材**\n")
    lines.append("---\n")

    # Each pet
    for i, p in enumerate(PETS):
        s = SEASON[p["season"]]
        lines.append(f'## {p["id"][:2]}. {p["emoji"]} {p["name"]}（{p["term"]} / {p["term_en"]}）\n')
        lines.append(f'- **靈獸**: {p["creature"]} ({p["creature_en"]})')
        lines.append(f'- **五行**: {p["element"]} ({ELEMENT_EN[p["element"]]})')
        lines.append(f'- **季節**: {s["zh"]} ({s["en"]})')
        lines.append(f'- **星座**: {p["zodiac"]} ({p["zodiac_en"]})')
        lines.append(f'- **設計關鍵字**: {p["keywords_zh"]}\n')

        for img in IMAGE_TYPES:
            fp = file_path(p, img)
            lines.append(f'### `{fp}` ({img["size"]})')
            lines.append(f'- **用途**: {img["use_zh"]} / {img["use_en"]}\n')
            lines.append("**English Prompt:**")
            lines.append(f'```\n{build_prompt_en(p, img)}\n```\n')
            lines.append("**繁體中文 Prompt:**")
            lines.append(f'```\n{build_prompt_zh(p, img)}\n```\n')

        lines.append("---\n")

    return "\n".join(lines)


# ═══════════════════════════════════════════
#  Generate HTML
# ═══════════════════════════════════════════
def generate_html():
    h = html_mod.escape

    parts = []
    parts.append("""<!DOCTYPE html>
<html lang="zh-TW">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>靈犀 — 24 靈寵角色 AI Prompt</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body {
    font-family: -apple-system, 'Microsoft JhengHei', 'Noto Sans TC', sans-serif;
    background: #08080f; color: #ccc; padding: 20px;
  }
  h1 { color: #e8c547; text-align:center; font-size:28px; margin-bottom:6px; }
  .subtitle { color:#888; text-align:center; font-size:14px; margin-bottom:24px; }
  .stats { text-align:center; color:#e8c547; font-size:18px; font-weight:bold; margin-bottom:30px; }

  /* Style guide box */
  .style-box {
    background: #1a142e; border:1px solid #e8c54730; border-radius:12px;
    padding:16px 20px; margin-bottom:30px; max-width:900px; margin-left:auto; margin-right:auto;
  }
  .style-box h3 { color:#e8c547; margin-bottom:8px; }
  .style-box pre { color:#999; font-size:13px; white-space:pre-wrap; }

  /* Season filter */
  .filter-bar {
    display:flex; justify-content:center; gap:10px; flex-wrap:wrap; margin-bottom:30px;
  }
  .filter-btn {
    padding: 8px 18px; border-radius:20px; border:1px solid #444;
    background: #12101e; color:#aaa; cursor:pointer; font-size:14px;
    transition: all 0.2s;
  }
  .filter-btn:hover { border-color:#e8c547; color:#e8c547; }
  .filter-btn.active { background:#e8c547; color:#000; border-color:#e8c547; font-weight:bold; }

  /* Pet section */
  .pet-section {
    max-width: 1100px; margin: 0 auto 40px; border-radius:16px;
    border: 1px solid #333; overflow:hidden;
  }
  .pet-header {
    padding: 16px 24px; display:flex; align-items:center; gap:16px; cursor:pointer;
    transition: background 0.2s;
  }
  .pet-header:hover { background: #1a142e; }
  .pet-emoji { font-size:40px; }
  .pet-info { flex:1; }
  .pet-name { font-size:20px; font-weight:bold; }
  .pet-meta { font-size:13px; color:#888; margin-top:4px; }
  .pet-badges { display:flex; gap:6px; }
  .badge {
    font-size:11px; padding:3px 10px; border-radius:12px; font-weight:bold;
  }
  .pet-toggle { font-size:24px; color:#666; transition: transform 0.3s; }
  .pet-section.open .pet-toggle { transform: rotate(180deg); }

  .pet-body { display:none; padding: 0 24px 20px; }
  .pet-section.open .pet-body { display:block; }

  /* Image cards */
  .img-grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(480px, 1fr)); gap:14px; margin-top:14px; }
  .img-card {
    background: #0d0b18; border:1px solid #2a2040; border-radius:10px;
    padding:14px; transition: border-color 0.2s;
  }
  .img-card:hover { border-color: #e8c54780; }
  .img-card-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; }
  .img-file { font-size:13px; font-weight:bold; font-family:monospace; color:#e8c547; }
  .img-size { font-size:11px; color:#666; background:#1a142e; padding:2px 8px; border-radius:6px; }
  .img-use { font-size:12px; color:#999; margin-bottom:4px; }
  .save-path {
    font-size:11px; color:#4ade80; font-family:monospace; background:#0a1a10;
    padding:4px 10px; border-radius:6px; margin-bottom:10px; display:inline-block;
    border: 1px solid #4ade8030;
  }
  .save-path::before { content:"📁 "; }

  .prompt-section { margin-bottom:8px; }
  .prompt-label {
    font-size:11px; font-weight:bold; margin-bottom:4px;
    display:flex; align-items:center; gap:6px; color:#aaa;
  }
  .prompt-box {
    position:relative; background:#12101e; border:1px solid #2a2040;
    border-radius:8px; padding:10px 40px 10px 12px;
    font-size:12px; line-height:1.6; color:#b0a8c0;
    cursor:pointer; transition: background 0.15s, border-color 0.15s;
    word-break: break-word;
  }
  .prompt-box:hover { background:#1a142e; border-color:#e8c54760; }
  .prompt-box::after {
    content:'📋'; position:absolute; right:8px; top:8px;
    font-size:16px; opacity:0.3; transition:opacity 0.15s;
  }
  .prompt-box:hover::after { opacity:1; }
  .prompt-box.copied { border-color:#4ade80; }
  .prompt-box.copied::after { content:'✓'; color:#4ade80; opacity:1; }

  .toast {
    position:fixed; bottom:30px; left:50%; transform:translateX(-50%);
    background:#4ade80; color:#000; padding:8px 24px; border-radius:20px;
    font-size:14px; font-weight:bold; display:none; z-index:999;
  }

  /* Responsive */
  @media (max-width:600px) {
    .img-grid { grid-template-columns: 1fr; }
    .filter-bar { gap:6px; }
    .filter-btn { padding:6px 12px; font-size:12px; }
  }
</style>
</head>
<body>

<h1>靈犀 — 24 靈寵角色素材</h1>
<p class="subtitle">AI 美工生成 Prompt（中英雙語）｜點擊 prompt 即可複製</p>
<p class="stats">24 隻靈寵 × 6 張圖 = 144 張素材</p>
""")

    # Style guide
    parts.append("""<div class="style-box">
<h3>統一風格指引</h3>
<pre>品牌: 靈犀 LingXi — 東方命理靈寵 App
主色調: 金色 #E8C547 + 深黑 #08080F
風格: 東方神秘 × Q 版可愛，金色光暈，半透明靈體感
背景: 一律透明 PNG（疊在深黑 #08080F 上使用）
質感: 金色粒子閃爍、微光暈、精緻細線描邊
季節色系: 春=嫩綠粉藍 / 夏=金色橙紅 / 秋=金黃琥珀銀 / 冬=冰藍深紫極光</pre>
</div>
""")

    # Filter bar
    parts.append('<div class="filter-bar">')
    parts.append('  <button class="filter-btn active" onclick="filterSeason(\'all\')">全部 (24)</button>')
    for season_key, sv in SEASON.items():
        cnt = sum(1 for p in PETS if p["season"] == season_key)
        parts.append(f'  <button class="filter-btn" onclick="filterSeason(\'{season_key}\')" style="border-color:{sv["border"]}40">{sv["zh"]} {season_key} ({cnt})</button>')
    parts.append('</div>\n')

    # Pet sections
    for pet in PETS:
        s = SEASON[pet["season"]]
        el_c = ELEMENT_COLOR[pet["element"]]

        parts.append(f'<div class="pet-section" data-season="{pet["season"]}" id="pet-{pet["id"]}">')
        parts.append(f'  <div class="pet-header" onclick="togglePet(this)" style="border-left:4px solid {s["border"]}">')
        parts.append(f'    <span class="pet-emoji">{pet["emoji"]}</span>')
        parts.append(f'    <div class="pet-info">')
        parts.append(f'      <div class="pet-name" style="color:{s["border"]}">{pet["name"]}<span style="color:#666;font-weight:normal;font-size:14px"> ({pet["term"]} / {h(pet["term_en"])})</span></div>')
        parts.append(f'      <div class="pet-meta">{h(pet["creature"])} ({h(pet["creature_en"])}) ・ {pet["zodiac"]} ({pet["zodiac_en"]}) ・ {h(pet["keywords_zh"])}</div>')
        parts.append(f'    </div>')
        parts.append(f'    <div class="pet-badges">')
        parts.append(f'      <span class="badge" style="background:{el_c}20;color:{el_c};border:1px solid {el_c}50">{pet["element"]} {ELEMENT_EN[pet["element"]]}</span>')
        parts.append(f'      <span class="badge" style="background:{s["border"]}20;color:{s["border"]};border:1px solid {s["border"]}50">{s["zh"]}</span>')
        parts.append(f'    </div>')
        parts.append(f'    <span class="pet-toggle">▼</span>')
        parts.append(f'  </div>')

        parts.append(f'  <div class="pet-body">')
        parts.append(f'    <div class="img-grid">')

        for img in IMAGE_TYPES:
            fp = file_path(pet, img)
            prompt_en = build_prompt_en(pet, img)
            prompt_zh = build_prompt_zh(pet, img)

            parts.append(f'      <div class="img-card">')
            parts.append(f'        <div class="img-card-header">')
            parts.append(f'          <span class="img-file">{img["file"]}</span>')
            parts.append(f'          <span class="img-size">{img["size"]}</span>')
            parts.append(f'        </div>')
            parts.append(f'        <div class="img-use">{h(img["use_zh"])} / {h(img["use_en"])}</div>')
            parts.append(f'        <div class="save-path">{h(fp)}</div>')
            parts.append(f'        <div class="prompt-section">')
            parts.append(f'          <div class="prompt-label"><span>🇺🇸</span> English Prompt</div>')
            parts.append(f'          <div class="prompt-box" onclick="copyPrompt(this)">{h(prompt_en)}</div>')
            parts.append(f'        </div>')
            parts.append(f'        <div class="prompt-section">')
            parts.append(f'          <div class="prompt-label"><span>🇹🇼</span> 繁體中文 Prompt</div>')
            parts.append(f'          <div class="prompt-box" onclick="copyPrompt(this)">{h(prompt_zh)}</div>')
            parts.append(f'        </div>')
            parts.append(f'      </div>')

        parts.append(f'    </div>')
        parts.append(f'  </div>')
        parts.append(f'</div>\n')

    # Footer
    parts.append(f"""
<div style="text-align:center; color:#444; font-size:12px; margin-top:40px; padding-bottom:30px;">
  靈犀 LingXi v2 — 靈寵角色素材 AI Prompt<br>
  共 {len(PETS)} 隻靈寵 × 6 張 = {len(PETS)*6} 張素材<br>
  存放根目錄: <code style="color:#4ade80">assets/pets/[pet-id]/</code>
</div>

<div class="toast" id="toast">已複製到剪貼簿!</div>

<script>
function copyPrompt(el) {{
  const text = el.textContent;
  navigator.clipboard.writeText(text).then(() => {{
    el.classList.add('copied');
    const toast = document.getElementById('toast');
    toast.style.display = 'block';
    setTimeout(() => {{ el.classList.remove('copied'); toast.style.display = 'none'; }}, 1500);
  }});
}}

function togglePet(header) {{
  header.parentElement.classList.toggle('open');
}}

function filterSeason(season) {{
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
  document.querySelectorAll('.pet-section').forEach(sec => {{
    if (season === 'all' || sec.dataset.season === season) {{
      sec.style.display = '';
    }} else {{
      sec.style.display = 'none';
    }}
  }});
}}

// Expand all on load for print
// document.querySelectorAll('.pet-section').forEach(s => s.classList.add('open'));
</script>

</body>
</html>""")

    return "\n".join(parts)


# ═══════════════════════════════════════════
#  Main
# ═══════════════════════════════════════════
if __name__ == "__main__":
    os.makedirs(OUT_DIR, exist_ok=True)

    md_path = os.path.join(OUT_DIR, "PET_PROMPTS.md")
    html_path = os.path.join(OUT_DIR, "PET_PROMPTS.html")

    with open(md_path, "w", encoding="utf-8") as f:
        f.write(generate_md())

    with open(html_path, "w", encoding="utf-8") as f:
        f.write(generate_html())

    total = len(PETS) * len(IMAGE_TYPES)
    print(f"MD:   {md_path}")
    print(f"HTML: {html_path}")
    print(f"Pets: {len(PETS)}, Images/pet: {len(IMAGE_TYPES)}, Total: {total} assets")
