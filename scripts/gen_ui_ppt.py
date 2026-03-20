"""Generate LingXi UI & Interaction Logic PowerPoint"""
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
import datetime

# ── Theme colors ──
BG_DARK   = RGBColor(0x08, 0x08, 0x0F)
GOLD      = RGBColor(0xE8, 0xC5, 0x47)
GOLD_DIM  = RGBColor(0x8A, 0x7A, 0x3A)
WHITE     = RGBColor(0xFF, 0xFF, 0xFF)
CREAM     = RGBColor(0xFF, 0xFC, 0xF5)
TEXT_SEC   = RGBColor(0xCC, 0xCC, 0xCC)
TEXT_MUTED = RGBColor(0x88, 0x88, 0x88)
EYE_CLR   = RGBColor(0xFF, 0xC1, 0x07)
HEART_CLR = RGBColor(0x4A, 0xDE, 0x80)
PEARL_CLR = RGBColor(0xA7, 0x8B, 0xFA)
ACCENT_BG = RGBColor(0x14, 0x14, 0x20)

prs = Presentation()
prs.slide_width  = Inches(13.333)
prs.slide_height = Inches(7.5)

def dark_bg(slide):
    bg = slide.background
    fill = bg.fill
    fill.solid()
    fill.fore_color.rgb = BG_DARK

def add_box(slide, left, top, w, h, fill_rgb, border_rgb=None, border_w=Pt(1)):
    shp = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, w, h)
    shp.fill.solid()
    shp.fill.fore_color.rgb = fill_rgb
    if border_rgb:
        shp.line.color.rgb = border_rgb
        shp.line.width = border_w
    else:
        shp.line.fill.background()
    return shp

def add_text(slide, left, top, w, h, text, size=18, color=WHITE, bold=False, align=PP_ALIGN.LEFT, font_name='Microsoft JhengHei'):
    txBox = slide.shapes.add_textbox(left, top, w, h)
    tf = txBox.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = text
    p.font.size = Pt(size)
    p.font.color.rgb = color
    p.font.bold = bold
    p.font.name = font_name
    p.alignment = align
    return txBox

def add_para(tf, text, size=14, color=TEXT_SEC, bold=False, space_before=Pt(4)):
    p = tf.add_paragraph()
    p.text = text
    p.font.size = Pt(size)
    p.font.color.rgb = color
    p.font.bold = bold
    p.font.name = 'Microsoft JhengHei'
    p.space_before = space_before
    return p

# ════════════════════════════════════════
# Slide 1: Title
# ════════════════════════════════════════
sl = prs.slides.add_slide(prs.slide_layouts[6])  # blank
dark_bg(sl)
add_text(sl, Inches(1), Inches(1.8), Inches(11), Inches(1.2),
         '靈犀 LingXi', size=54, color=GOLD, bold=True, align=PP_ALIGN.CENTER)
add_text(sl, Inches(1), Inches(3.2), Inches(11), Inches(0.8),
         '操作介面與互動邏輯說明', size=28, color=TEXT_SEC, align=PP_ALIGN.CENTER)
add_text(sl, Inches(1), Inches(4.2), Inches(11), Inches(0.6),
         '命理寵物 App  |  React Native / Expo SDK 52', size=18, color=TEXT_MUTED, align=PP_ALIGN.CENTER)
today = datetime.date.today().strftime('%Y-%m-%d')
add_text(sl, Inches(1), Inches(5.8), Inches(11), Inches(0.5),
         f'Version: {today}', size=14, color=TEXT_MUTED, align=PP_ALIGN.CENTER)

# ════════════════════════════════════════
# Slide 2: 主畫面全貌 (Layout Overview)
# ════════════════════════════════════════
sl = prs.slides.add_slide(prs.slide_layouts[6])
dark_bg(sl)
add_text(sl, Inches(0.5), Inches(0.3), Inches(12), Inches(0.7),
         '1. 主畫面佈局 — 全螢幕靈寵', size=32, color=GOLD, bold=True)

# Phone mockup
phone_l, phone_t = Inches(1.2), Inches(1.3)
phone_w, phone_h = Inches(4), Inches(5.8)
phone = add_box(sl, phone_l, phone_t, phone_w, phone_h, ACCENT_BG, GOLD_DIM, Pt(2))

# Status bar zone
sb = add_box(sl, phone_l + Inches(0.1), phone_t + Inches(0.1), phone_w - Inches(0.2), Inches(0.6), RGBColor(0x10, 0x10, 0x18), GOLD_DIM)
add_text(sl, phone_l + Inches(0.15), phone_t + Inches(0.15), phone_w - Inches(0.3), Inches(0.5),
         '⚙️  靈犀 Logo     3月19日·戌時     Lv.5 小白', size=11, color=GOLD)

# Pet area
pet = add_box(sl, phone_l + Inches(0.8), phone_t + Inches(1.8), Inches(2.4), Inches(2.4), RGBColor(0x1A, 0x1A, 0x28), GOLD_DIM)
add_text(sl, phone_l + Inches(1.2), phone_t + Inches(2.5), Inches(1.6), Inches(0.6),
         '🐉 靈寵', size=28, color=GOLD, align=PP_ALIGN.CENTER)
add_text(sl, phone_l + Inches(0.8), phone_t + Inches(3.2), Inches(2.4), Inches(0.4),
         '(全螢幕浮動動畫)', size=11, color=TEXT_MUTED, align=PP_ALIGN.CENTER)

# Bubble zone
bub = add_box(sl, phone_l + Inches(0.15), phone_t + Inches(0.85), Inches(2.8), Inches(0.8), CREAM, RGBColor(0x80, 0x70, 0x40))
add_text(sl, phone_l + Inches(0.25), phone_t + Inches(0.9), Inches(2.6), Inches(0.7),
         '「主人早安～今日財運大吉，宜東南方...」', size=10, color=RGBColor(0x1A, 0x1A, 0x2E))

# Right sidebar
bar = add_box(sl, phone_l + Inches(3.2), phone_t + Inches(1.8), Inches(0.6), Inches(3.2), RGBColor(0x10, 0x10, 0x18), GOLD_DIM)
add_text(sl, phone_l + Inches(3.22), phone_t + Inches(1.9), Inches(0.56), Inches(0.35),
         '靈眼', size=9, color=EYE_CLR, align=PP_ALIGN.CENTER)
add_text(sl, phone_l + Inches(3.22), phone_t + Inches(2.35), Inches(0.56), Inches(0.35),
         '靈心', size=9, color=HEART_CLR, align=PP_ALIGN.CENTER)
add_text(sl, phone_l + Inches(3.22), phone_t + Inches(2.8), Inches(0.56), Inches(0.35),
         '靈魂', size=9, color=PEARL_CLR, align=PP_ALIGN.CENTER)
add_text(sl, phone_l + Inches(3.22), phone_t + Inches(3.4), Inches(0.56), Inches(0.3),
         '───', size=8, color=TEXT_MUTED, align=PP_ALIGN.CENTER)
add_text(sl, phone_l + Inches(3.22), phone_t + Inches(3.7), Inches(0.56), Inches(0.3),
         '餵食', size=9, color=TEXT_MUTED, align=PP_ALIGN.CENTER)
add_text(sl, phone_l + Inches(3.22), phone_t + Inches(4.05), Inches(0.56), Inches(0.3),
         '玩耍', size=9, color=TEXT_MUTED, align=PP_ALIGN.CENTER)
add_text(sl, phone_l + Inches(3.22), phone_t + Inches(4.4), Inches(0.56), Inches(0.3),
         '冥想', size=9, color=TEXT_MUTED, align=PP_ALIGN.CENTER)

# Annotations
anno_l = Inches(6)
txb = add_text(sl, anno_l, Inches(1.3), Inches(6.5), Inches(5.5), '', size=14)
tf = txb.text_frame
tf.word_wrap = True
p = tf.paragraphs[0]
p.text = '佈局結構'
p.font.size = Pt(22)
p.font.color.rgb = GOLD
p.font.bold = True

items = [
    ('Status Bar (頂部)', '⚙️ 設定按鈕 → 導航至個人設定頁\nLogo + 農曆日期(含時辰) + Lv.等級 靈寵名'),
    ('漫畫對白泡泡 (浮動層)', '顯示最新一則對話，自動調整高度\n支援捲動 (maxHeight 45%)，避開右側操作列'),
    ('靈寵 (全螢幕主角)', '佔據整個畫面中央，帶浮動動畫\n分層渲染：光環 → 頭像 → 外框 → 特效'),
    ('右側操作列 (浮動層)', '垂直排列，半透明暗底圓角容器\n上方：三大功能鍵 (靈眼/靈心/靈魂)\n下方：養成鍵 (餵食/玩耍/冥想)'),
    ('無底部 Tab Bar', '取消傳統底部導航列\n設定頁透過左上角 ⚙️ 按鈕進入'),
]
for title, desc in items:
    add_para(tf, '', size=6, space_before=Pt(10))
    add_para(tf, f'▸ {title}', size=16, color=GOLD, bold=True, space_before=Pt(8))
    for line in desc.split('\n'):
        add_para(tf, f'   {line}', size=13, color=TEXT_SEC)

# ════════════════════════════════════════
# Slide 3: 漫畫對白泡泡
# ════════════════════════════════════════
sl = prs.slides.add_slide(prs.slide_layouts[6])
dark_bg(sl)
add_text(sl, Inches(0.5), Inches(0.3), Inches(12), Inches(0.7),
         '2. 漫畫對白泡泡 — Manga Speech Bubble', size=32, color=GOLD, bold=True)

# Bubble mockup (large)
bub2 = add_box(sl, Inches(1), Inches(1.5), Inches(5), Inches(2.5), CREAM, RGBColor(0x80, 0x70, 0x40), Pt(2))
add_text(sl, Inches(1.3), Inches(1.7), Inches(4.4), Inches(2),
         '「主人早安～小白感應到今日靈氣充沛！\n\n財運方面大吉，宜往東南方發展。\n桃花運勢平穩，保持自信即可。\n\n幸運色：金色 | 幸運數字：7\n吉位：東南方 | 吉時：巳時」',
         size=14, color=RGBColor(0x1A, 0x1A, 0x2E))

# Tail triangle indicator
add_text(sl, Inches(2.5), Inches(4.0), Inches(1), Inches(0.5),
         '▼', size=24, color=CREAM, align=PP_ALIGN.CENTER)
add_text(sl, Inches(2.0), Inches(4.4), Inches(2), Inches(0.4),
         '(尾巴指向靈寵)', size=11, color=TEXT_MUTED, align=PP_ALIGN.CENTER)

# Specs
txb = add_text(sl, Inches(7), Inches(1.5), Inches(5.5), Inches(5), '', size=14)
tf = txb.text_frame
tf.word_wrap = True
p = tf.paragraphs[0]
p.text = '泡泡框規格'
p.font.size = Pt(22)
p.font.color.rgb = GOLD
p.font.bold = True

specs = [
    ('背景色', 'rgba(255,252,245,0.95) — 米白半透明'),
    ('圓角', '20px'),
    ('邊框', '1.5px, rgba(60,50,30,0.12)'),
    ('文字', '15px, 行高 24px, serif 字體, 深色 #1a1a2e'),
    ('位置', 'absolute, top:10, left:16, right:72 (避開右側列)'),
    ('高度', '自動撐開，maxHeight 45% 螢幕高度'),
    ('捲動', '內建 ScrollView，長文可上下捲動'),
    ('尾巴', 'CSS border triangle, 底部偏左 30%'),
    ('陰影', 'shadowOpacity 0.12, radius 10, offset y:4'),
    ('資料來源', 'chatStore 最新一則 message.text'),
]
for k, v in specs:
    add_para(tf, f'▸ {k}：{v}', size=13, color=TEXT_SEC, space_before=Pt(6))

# ════════════════════════════════════════
# Slide 4: 右側操作列
# ════════════════════════════════════════
sl = prs.slides.add_slide(prs.slide_layouts[6])
dark_bg(sl)
add_text(sl, Inches(0.5), Inches(0.3), Inches(12), Inches(0.7),
         '3. 右側操作列 — Floating ActionBar', size=32, color=GOLD, bold=True)

# Vertical bar mockup
bar_l = Inches(2)
bar_t = Inches(1.3)
bar_w = Inches(1.8)
bar_h = Inches(5.5)
add_box(sl, bar_l, bar_t, bar_w, bar_h, ACCENT_BG, GOLD_DIM, Pt(2))

# Ability section
add_text(sl, bar_l, bar_t + Inches(0.15), bar_w, Inches(0.35),
         '── 功能鍵 ──', size=11, color=TEXT_MUTED, align=PP_ALIGN.CENTER)
items_ability = [
    ('👁  靈眼', EYE_CLR, '面相分析 (相機)'),
    ('🌍  靈心', HEART_CLR, '風水羅盤 (GPS+磁力)'),
    ('✨  靈魂', PEARL_CLR, '靈珠占卜 (搖卦)'),
]
y = bar_t + Inches(0.55)
for label, clr, desc in items_ability:
    btn = add_box(sl, bar_l + Inches(0.15), y, bar_w - Inches(0.3), Inches(0.7), RGBColor(0x1A, 0x1A, 0x28), clr)
    add_text(sl, bar_l + Inches(0.2), y + Inches(0.05), bar_w - Inches(0.4), Inches(0.35),
             label, size=14, color=clr, bold=True, align=PP_ALIGN.CENTER)
    add_text(sl, bar_l + Inches(0.2), y + Inches(0.38), bar_w - Inches(0.4), Inches(0.28),
             desc, size=9, color=TEXT_MUTED, align=PP_ALIGN.CENTER)
    y += Inches(0.85)

# Divider
add_text(sl, bar_l, y, bar_w, Inches(0.25),
         '─────────', size=10, color=TEXT_MUTED, align=PP_ALIGN.CENTER)
y += Inches(0.35)

# Nurture section
add_text(sl, bar_l, y, bar_w, Inches(0.3),
         '── 養成鍵 ──', size=11, color=TEXT_MUTED, align=PP_ALIGN.CENTER)
y += Inches(0.35)
items_nurture = [
    ('🍖  餵食', '+50 EXP'),
    ('🎮  玩耍', '+30 EXP'),
    ('🧘  冥想', '+20 EXP'),
]
for label, exp in items_nurture:
    btn = add_box(sl, bar_l + Inches(0.15), y, bar_w - Inches(0.3), Inches(0.5), RGBColor(0x1A, 0x1A, 0x28))
    add_text(sl, bar_l + Inches(0.2), y + Inches(0.05), Inches(1), Inches(0.4),
             label, size=12, color=TEXT_SEC, align=PP_ALIGN.CENTER)
    add_text(sl, bar_l + Inches(1.1), y + Inches(0.08), Inches(0.5), Inches(0.35),
             exp, size=9, color=TEXT_MUTED, align=PP_ALIGN.CENTER)
    y += Inches(0.58)

# Specs panel
txb = add_text(sl, Inches(5.5), Inches(1.3), Inches(7), Inches(5.5), '', size=14)
tf = txb.text_frame
tf.word_wrap = True
p = tf.paragraphs[0]
p.text = '操作列規格'
p.font.size = Pt(22)
p.font.color.rgb = GOLD
p.font.bold = True

add_para(tf, '', size=6)
add_para(tf, '▸ 定位方式', size=16, color=GOLD, bold=True, space_before=Pt(8))
add_para(tf, '   position: absolute, right: 8, bottom: 40', size=13, color=TEXT_SEC)
add_para(tf, '   浮動於靈寵畫面右側，不佔據 flex 空間', size=13, color=TEXT_SEC)

add_para(tf, '▸ 容器樣式', size=16, color=GOLD, bold=True, space_before=Pt(12))
add_para(tf, '   背景: rgba(8,8,15,0.75) — 半透明暗色', size=13, color=TEXT_SEC)
add_para(tf, '   圓角: 24px, 邊框: 1px 金色淡邊', size=13, color=TEXT_SEC)

add_para(tf, '▸ 功能鍵行為', size=16, color=GOLD, bold=True, space_before=Pt(12))
add_para(tf, '   點擊 → 切換 activeFeature 狀態', size=13, color=TEXT_SEC)
add_para(tf, '   再次點擊同一鍵 → 關閉功能面板', size=13, color=TEXT_SEC)
add_para(tf, '   啟動時有對應色光暈 + 邊框高亮', size=13, color=TEXT_SEC)
add_para(tf, '   額度不足 → 彈出升級 Modal', size=13, color=TEXT_SEC)

add_para(tf, '▸ 養成鍵行為', size=16, color=GOLD, bold=True, space_before=Pt(12))
add_para(tf, '   點擊 → 增加 EXP + 靈寵回話 (chat bubble)', size=13, color=TEXT_SEC)
add_para(tf, '   等級上限時 → 彈出升級 Modal', size=13, color=TEXT_SEC)
add_para(tf, '   功能面板開啟時自動隱藏', size=13, color=TEXT_SEC)

# ════════════════════════════════════════
# Slide 5: 靈寵頭像系統
# ════════════════════════════════════════
sl = prs.slides.add_slide(prs.slide_layouts[6])
dark_bg(sl)
add_text(sl, Inches(0.5), Inches(0.3), Inches(12), Inches(0.7),
         '4. 靈寵頭像 — 分層渲染 + 動畫系統', size=32, color=GOLD, bold=True)

# Layer diagram
layers = [
    ('Layer 0 — 功能光環 (Aura)', 'rgba glow image, 功能啟動時顯示', EYE_CLR),
    ('Layer 1 — 頭像圖片 / Emoji', '圓形裁切, 金色邊框, 陰影光暈', GOLD),
    ('Layer 2 — 外框覆蓋 (Frame)', '一般框 / 靈眼框 / 靈心框 / 靈魂框', TEXT_SEC),
    ('Layer 3 — 靈眼符號', '靈眼功能啟動時頂部顯示', EYE_CLR),
]
y = Inches(1.4)
for i, (title, desc, clr) in enumerate(layers):
    box = add_box(sl, Inches(1), y, Inches(5), Inches(0.85), ACCENT_BG, clr, Pt(1.5))
    add_text(sl, Inches(1.2), y + Inches(0.08), Inches(4.6), Inches(0.4),
             title, size=15, color=clr, bold=True)
    add_text(sl, Inches(1.2), y + Inches(0.45), Inches(4.6), Inches(0.35),
             desc, size=12, color=TEXT_SEC)
    y += Inches(1.05)

# Animation info
txb = add_text(sl, Inches(7), Inches(1.4), Inches(5.5), Inches(5), '', size=14)
tf = txb.text_frame
tf.word_wrap = True
p = tf.paragraphs[0]
p.text = '動畫系統'
p.font.size = Pt(22)
p.font.color.rgb = GOLD
p.font.bold = True

add_para(tf, '', size=6)
add_para(tf, '▸ 浮動動畫 (Float)', size=16, color=GOLD, bold=True, space_before=Pt(8))
add_para(tf, '   translateY: 0 ↔ -6px', size=13, color=TEXT_SEC)
add_para(tf, '   duration: 1500ms × 2 (loop)', size=13, color=TEXT_SEC)
add_para(tf, '   easing: sin curve — 自然呼吸感', size=13, color=TEXT_SEC)

add_para(tf, '▸ 脈動動畫 (Pulse)', size=16, color=GOLD, bold=True, space_before=Pt(12))
add_para(tf, '   scale: 1.0 ↔ 1.05', size=13, color=TEXT_SEC)
add_para(tf, '   duration: 900ms × 2 (loop)', size=13, color=TEXT_SEC)
add_para(tf, '   僅在功能啟動時觸發', size=13, color=TEXT_SEC)

add_para(tf, '▸ 尺寸設定', size=16, color=GOLD, bold=True, space_before=Pt(12))
add_para(tf, '   一般模式: 240×240 (頭像 160px, 框 210px)', size=13, color=TEXT_SEC)
add_para(tf, '   精簡模式: 130×130 (頭像 80px, 框 110px)', size=13, color=TEXT_SEC)
add_para(tf, '   功能啟動時外框加大 (228 / 126px)', size=13, color=TEXT_SEC)

add_para(tf, '▸ 五行對應色', size=16, color=GOLD, bold=True, space_before=Pt(12))
add_para(tf, '   金/木/水/火/土 → 各有專屬色彩', size=13, color=TEXT_SEC)
add_para(tf, '   顯示於靈寵名牌下方的屬性徽章', size=13, color=TEXT_SEC)

# ════════════════════════════════════════
# Slide 6: 三大功能
# ════════════════════════════════════════
sl = prs.slides.add_slide(prs.slide_layouts[6])
dark_bg(sl)
add_text(sl, Inches(0.5), Inches(0.3), Inches(12), Inches(0.7),
         '5. 三大核心功能 — 靈眼 / 靈心 / 靈魂', size=32, color=GOLD, bold=True)

features = [
    ('靈眼 — 面相分析', EYE_CLR, [
        '啟動相機拍攝臉部',
        '上傳至 Cloud Run AI 分析',
        '回傳：五官評分、運勢等級、開運物',
        '結果透過漫畫泡泡呈現',
        'API: /ai/face-reading',
    ]),
    ('靈心 — 風水羅盤', HEART_CLR, [
        '取得 GPS 座標 + 磁力計方位',
        '即時數位羅盤顯示',
        '上傳至 AI 分析方位吉凶',
        '回傳：吉方/凶方、座位建議、開運提示',
        'API: /ai/feng-shui',
    ]),
    ('靈魂 — 靈珠占卜', PEARL_CLR, [
        '搖動手機模擬搖卦 (加速度計)',
        '本地生成六爻卦象',
        '用戶輸入問題 → AI 解卦',
        '回傳：卦名、直接回答、深度解讀',
        'API: /ai/divination',
    ]),
]

x = Inches(0.5)
for title, clr, items_list in features:
    box = add_box(sl, x, Inches(1.3), Inches(3.9), Inches(5.5), ACCENT_BG, clr, Pt(1.5))
    add_text(sl, x + Inches(0.2), Inches(1.45), Inches(3.5), Inches(0.5),
             title, size=20, color=clr, bold=True)
    y = Inches(2.1)
    for item in items_list:
        add_text(sl, x + Inches(0.3), y, Inches(3.3), Inches(0.4),
                 f'• {item}', size=13, color=TEXT_SEC)
        y += Inches(0.42)

    # Quota info
    add_text(sl, x + Inches(0.2), Inches(5.4), Inches(3.5), Inches(0.5),
             '額度：Free 1次/日 | Member 5次/日 | Supreme 無限',
             size=10, color=TEXT_MUTED)
    x += Inches(4.15)

# ════════════════════════════════════════
# Slide 7: 互動流程圖
# ════════════════════════════════════════
sl = prs.slides.add_slide(prs.slide_layouts[6])
dark_bg(sl)
add_text(sl, Inches(0.5), Inches(0.3), Inches(12), Inches(0.7),
         '6. 操作邏輯流程', size=32, color=GOLD, bold=True)

# Flow chart - using boxes and arrows
flows = [
    (Inches(0.5), Inches(1.5), '使用者開啟 App', GOLD),
    (Inches(0.5), Inches(2.5), '自動登入\n(JWT Token)', TEXT_SEC),
    (Inches(0.5), Inches(3.7), '載入靈寵 + 命盤資料\n(Zustand persist)', TEXT_SEC),
    (Inches(0.5), Inches(5.0), '自動產生每日運勢\n(八字+紫微+奇門+星座)', GOLD),
]
for x, y, text, clr in flows:
    box = add_box(sl, x, y, Inches(3.2), Inches(0.8), ACCENT_BG, clr)
    add_text(sl, x + Inches(0.1), y + Inches(0.05), Inches(3), Inches(0.7),
             text, size=12, color=clr, align=PP_ALIGN.CENTER)

# Arrows
for i in range(len(flows) - 1):
    add_text(sl, Inches(1.7), flows[i][1] + Inches(0.85), Inches(0.5), Inches(0.4),
             '▼', size=16, color=TEXT_MUTED, align=PP_ALIGN.CENTER)

# Right side - action flows
add_text(sl, Inches(5), Inches(1.3), Inches(3.5), Inches(0.5),
         '功能操作流程', size=20, color=GOLD, bold=True)

action_flows = [
    '1. 點擊右側功能鍵 (靈眼/靈心/靈魂)',
    '2. 檢查使用額度 (getRemainingUses)',
    '   → 額度不足：彈出升級 Modal',
    '   → 額度充足：切換 activeFeature',
    '3. 靈寵縮小 (compact mode)',
    '4. 開啟功能面板 (FeaturePanel)',
    '5. 用戶操作 (拍照/羅盤/搖卦)',
    '6. 送出 API 請求至 Cloud Run',
    '7. 結果寫入 chatStore (addMessage)',
    '8. 關閉功能面板 → 回到全螢幕',
    '9. 泡泡框顯示最新結果',
]
y = Inches(1.9)
for item in action_flows:
    add_text(sl, Inches(5), y, Inches(4), Inches(0.35),
             item, size=13, color=TEXT_SEC)
    y += Inches(0.4)

# Right side - nurture flow
add_text(sl, Inches(9.5), Inches(1.3), Inches(3.5), Inches(0.5),
         '養成操作流程', size=20, color=GOLD, bold=True)

nurture_flows = [
    '1. 點擊養成鍵 (餵食/玩耍/冥想)',
    '2. 檢查等級上限 (canLevelUp)',
    '   → 已達上限：彈出升級 Modal',
    '   → 可升級：執行養成',
    '3. 增加 EXP (50/30/20)',
    '4. 靈寵回話寫入 chatStore',
    '5. 若升級 → 追加升級訊息',
    '6. 若進化 → 追加進化訊息',
    '7. 泡泡框即時更新',
]
y = Inches(1.9)
for item in nurture_flows:
    add_text(sl, Inches(9.5), y, Inches(3.5), Inches(0.35),
             item, size=13, color=TEXT_SEC)
    y += Inches(0.4)

# ════════════════════════════════════════
# Slide 8: 狀態管理
# ════════════════════════════════════════
sl = prs.slides.add_slide(prs.slide_layouts[6])
dark_bg(sl)
add_text(sl, Inches(0.5), Inches(0.3), Inches(12), Inches(0.7),
         '7. 狀態管理與資料流', size=32, color=GOLD, bold=True)

stores = [
    ('petStore', GOLD, [
        'name, emoji, creature, element',
        'level, exp, evolution, petId',
        'feed(), play(), meditate()',
        'canLevelUp(planType)',
        'AsyncStorage 持久化',
    ]),
    ('userStore', HEART_CLR, [
        'userName, birthYear/Month/Day',
        'bazi (八字), ziwei (紫微), astrology',
        'planType (free/member/supreme)',
        'getRemainingUses(feature, level)',
        'AsyncStorage 持久化',
    ]),
    ('chatStore', PEARL_CLR, [
        'messages[] (最多 200 則)',
        'addMessage(msg)',
        'ChatMessage: type, text, data, time',
        'types: fortune/face/fengshui/',
        '  divination/feed/play/meditate/levelup',
        'AsyncStorage 持久化',
    ]),
    ('authStore', EYE_CLR, [
        'token (JWT access)',
        'refreshToken',
        'isAuthenticated',
        'login(), logout(), register()',
        'Apple Sign-In support',
    ]),
]

x = Inches(0.3)
for name, clr, items_list in stores:
    box = add_box(sl, x, Inches(1.3), Inches(3.1), Inches(5.5), ACCENT_BG, clr, Pt(1.5))
    add_text(sl, x + Inches(0.2), Inches(1.45), Inches(2.7), Inches(0.5),
             name, size=18, color=clr, bold=True)
    y = Inches(2.1)
    for item in items_list:
        add_text(sl, x + Inches(0.2), y, Inches(2.7), Inches(0.38),
                 f'• {item}', size=12, color=TEXT_SEC)
        y += Inches(0.38)
    x += Inches(3.3)

# ════════════════════════════════════════
# Slide 9: 設定頁面
# ════════════════════════════════════════
sl = prs.slides.add_slide(prs.slide_layouts[6])
dark_bg(sl)
add_text(sl, Inches(0.5), Inches(0.3), Inches(12), Inches(0.7),
         '8. 設定頁面 (Profile)', size=32, color=GOLD, bold=True)

sections = [
    ('導航方式', ['主畫面左上角 ⚙️ 按鈕進入', '頁面頂部「← 靈寵」返回主畫面', '無底部 Tab Bar，純頁面切換']),
    ('使用者資訊卡', ['靈寵頭像 + 用戶名', 'Lv.等級 + 靈寵名 + 屬性 + 節氣', '訂閱等級 badge (Free/Member/Supreme)']),
    ('歷史回覆', ['展開/收起 切換', '內嵌 PetChat 元件 (FlatList)', '完整對話記錄 + 日期分隔線', '所有功能結果、養成回覆、升級通知']),
    ('語言設定', ['6 種語言：繁中/簡中/日/英/德/法', 'react-i18next 即時切換']),
    ('命盤資料', ['八字四柱', '紫微主星', '西洋星座', '節氣靈寵對應']),
    ('其他', ['推播通知', '隱私權政策 / 服務條款', '恢復購買 (RevenueCat)', '登出']),
]

x, y = Inches(0.5), Inches(1.3)
col = 0
for title, items_list in sections:
    if col == 3:
        x = Inches(0.5)
        y = Inches(4.3)
        col = 0
    box = add_box(sl, x, y, Inches(4), Inches(2.6), ACCENT_BG, GOLD_DIM)
    add_text(sl, x + Inches(0.2), y + Inches(0.1), Inches(3.6), Inches(0.4),
             title, size=16, color=GOLD, bold=True)
    iy = y + Inches(0.55)
    for item in items_list:
        add_text(sl, x + Inches(0.3), iy, Inches(3.4), Inches(0.35),
                 f'• {item}', size=12, color=TEXT_SEC)
        iy += Inches(0.33)
    x += Inches(4.2)
    col += 1

# ════════════════════════════════════════
# Slide 10: 訂閱與額度
# ════════════════════════════════════════
sl = prs.slides.add_slide(prs.slide_layouts[6])
dark_bg(sl)
add_text(sl, Inches(0.5), Inches(0.3), Inches(12), Inches(0.7),
         '9. 訂閱方案與額度系統', size=32, color=GOLD, bold=True)

# Table-like layout
headers = ['', 'Free (免費)', 'Member ($390/月)', 'Supreme ($1,990/月)']
rows = [
    ['靈眼 (面相)', '1 次/日', '5 次/日', '無限'],
    ['靈心 (風水)', '1 次/日', '5 次/日', '無限'],
    ['靈魂 (占卜)', '1 次/日', '5 次/日', '無限'],
    ['靈寵等級上限', 'Lv.10', 'Lv.50', '無限'],
    ['養成功能', '有', '有', '有'],
    ['每日運勢', '有', '有', '有'],
]

# Header row
x = Inches(1)
for i, h in enumerate(headers):
    w = Inches(2) if i == 0 else Inches(3)
    clr = GOLD if i == 0 else (TEXT_MUTED if i == 1 else GOLD if i == 2 else PEARL_CLR)
    add_box(sl, x, Inches(1.5), w, Inches(0.6), ACCENT_BG, GOLD_DIM)
    add_text(sl, x + Inches(0.1), Inches(1.55), w - Inches(0.2), Inches(0.5),
             h, size=14, color=clr, bold=True, align=PP_ALIGN.CENTER)
    x += w + Inches(0.1)

# Data rows
for ri, row in enumerate(rows):
    x = Inches(1)
    y = Inches(2.25) + ri * Inches(0.65)
    for ci, cell in enumerate(row):
        w = Inches(2) if ci == 0 else Inches(3)
        bg = ACCENT_BG if ri % 2 == 0 else RGBColor(0x12, 0x12, 0x1E)
        add_box(sl, x, y, w, Inches(0.55), bg)
        clr = TEXT_SEC if ci == 0 else (TEXT_MUTED if ci == 1 else GOLD if ci == 2 else PEARL_CLR)
        add_text(sl, x + Inches(0.1), y + Inches(0.05), w - Inches(0.2), Inches(0.45),
                 cell, size=13, color=clr, align=PP_ALIGN.CENTER)
        x += w + Inches(0.1)

# Quota logic
txb = add_text(sl, Inches(1), Inches(6.3), Inches(11), Inches(1), '', size=12)
tf = txb.text_frame
tf.word_wrap = True
p = tf.paragraphs[0]
p.text = '額度檢查邏輯：IP rate-limit (express-rate-limit) → 後端每日額度 (DB) → 前端本地 check | 付款: RevenueCat (Apple IAP)'
p.font.size = Pt(12)
p.font.color.rgb = TEXT_MUTED
p.font.name = 'Microsoft JhengHei'

# ════════════════════════════════════════
# Slide 11: 技術架構
# ════════════════════════════════════════
sl = prs.slides.add_slide(prs.slide_layouts[6])
dark_bg(sl)
add_text(sl, Inches(0.5), Inches(0.3), Inches(12), Inches(0.7),
         '10. 技術架構總覽', size=32, color=GOLD, bold=True)

tech_cols = [
    ('前端 (App)', GOLD, [
        'React Native 0.81 + Expo SDK 52',
        'Expo Router (file-based)',
        'Zustand + AsyncStorage',
        'react-i18next (6 語言)',
        'expo-camera / expo-location',
        'expo-sensors (Magnetometer)',
        'RevenueCat (IAP)',
        'Apple Sign-In',
    ]),
    ('後端 (API)', HEART_CLR, [
        'Node.js + Express + TypeScript',
        'Google Cloud Run (asia-east1)',
        'JWT 認證 (access + refresh)',
        'Claude AI (面相/風水/占卜)',
        'express-rate-limit',
        'RevenueCat Webhook',
        'Bundle ID: com.youquan.lingxi',
        '',
    ]),
    ('命理引擎 (本地)', PEARL_CLR, [
        'bazi-engine (八字計算)',
        'ziwei-engine (紫微斗數)',
        'qimen-engine (奇門遁甲)',
        'astrology (西洋星座)',
        'unified-fortune-engine',
        'pet-narrator (靈寵敘事)',
        '所有運勢計算在前端完成',
        'AI 僅用於文本生成',
    ]),
    ('建置 & 部署', EYE_CLR, [
        'EAS Build (iOS Ad Hoc)',
        'eas.json: preview profile',
        'Apple Developer (Individual)',
        'Provisioned devices (UDID)',
        'gcloud CLI (Cloud Run)',
        'GitHub (程式碼管理)',
        '',
        '',
    ]),
]

x = Inches(0.3)
for title, clr, items_list in tech_cols:
    box = add_box(sl, x, Inches(1.3), Inches(3.1), Inches(5.5), ACCENT_BG, clr, Pt(1.5))
    add_text(sl, x + Inches(0.2), Inches(1.45), Inches(2.7), Inches(0.5),
             title, size=17, color=clr, bold=True)
    y = Inches(2.1)
    for item in items_list:
        if item:
            add_text(sl, x + Inches(0.2), y, Inches(2.7), Inches(0.35),
                     f'• {item}', size=11, color=TEXT_SEC)
        y += Inches(0.38)
    x += Inches(3.3)

# ═══ Save ═══
output_path = f'C:/Dev/LingXi/LingXi_UI_Logic_{today}.pptx'
prs.save(output_path)
print(f'Saved: {output_path}')
