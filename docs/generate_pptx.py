"""
靈犀 LingXi — Markdown → PPTX 轉換器
使用 python-pptx 從簡報 Markdown 生成 .pptx
"""

from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
import re
import os

# ─── 色彩定義 ───
BG_COLOR = RGBColor(0x08, 0x08, 0x0F)
GOLD = RGBColor(0xE8, 0xC5, 0x47)
GOLD_DIM = RGBColor(0x8A, 0x7A, 0x3A)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
LIGHT_GRAY = RGBColor(0xC0, 0xC8, 0xD0)
MID_GRAY = RGBColor(0x80, 0x88, 0x90)
DIM_GRAY = RGBColor(0x50, 0x58, 0x60)
PURPLE = RGBColor(0xA7, 0x8B, 0xFA)
CYAN = RGBColor(0x64, 0xB4, 0xFF)

# ─── 投影片資料 ───
SLIDES = [
    {
        "type": "title",
        "title": "靈犀",
        "subtitle": "AI 玄學生活顧問",
        "tagline": "你的命理寵物，掌中的東方智慧\n\n萬物皆有靈 — 命理 × AI × 寵物養成",
    },
    {
        "type": "content",
        "title": "App 總覽",
        "bullets": [
            ("靈犀是什麼", [
                "結合 AI 智能與東方命理的生活顧問 App",
                "用戶擁有根據出生節氣配對的專屬靈寵",
                "靈寵以第一人稱口吻傳達所有命理分析結果",
                "三大核心功能：面相分析、風水羅盤、易經占卜",
            ]),
            ("目標用戶", [
                "對命理玄學有興趣的年輕族群（20-40 歲）",
                "需要日常運勢指引與生活建議的用戶",
                "喜歡寵物養成、收集元素的休閒玩家",
                "覆蓋 6 種語言的國際用戶群",
            ]),
            ("核心價值", [
                "個人化：八字 + 紫微 + 奇門 + 占星綜合分析",
                "對話式：所有結果以靈寵聊天氣泡呈現",
                "養成感：靈寵會升級、進化、解鎖新能力",
            ]),
        ],
    },
    {
        "type": "two_col",
        "title": "技術棧",
        "left_title": "前端",
        "left": [
            "React Native 0.81.5",
            "Expo SDK 54 + Expo Router 6",
            "Zustand 5 + AsyncStorage 持久化",
            "react-i18next（6 語言 / 351 鍵）",
            "expo-camera（面相拍照）",
            "expo-location（GPS 定位）",
            "expo-sensors（磁力計羅盤）",
        ],
        "right_title": "後端 & 設計",
        "right": [
            "Cloud Run（asia-east1）",
            "Claude API（後端代理，前端零 Key）",
            "JWT 認證 + 自動刷新 Token",
            "RevenueCat 訂閱內購管理",
            "──────────────",
            "主色調：東方神秘金 #E8C547",
            "背景：深空黑 #08080F",
            "字型：NotoSerifTC + MaShanZheng",
        ],
    },
    {
        "type": "code",
        "title": "畫面導航流程",
        "code": (
            "            App 啟動\n"
            "               │\n"
            "       ┌───────┼───────┐\n"
            "       │       │       │\n"
            "     未登入   未引導   已完成\n"
            "       │       │       │\n"
            "     Auth    Onboard   Tabs\n"
            "     登入頁   引導頁    │\n"
            "       │       │    ┌──┴──┐\n"
            "       └──►────┘    │     │\n"
            "                   Pet  Profile\n"
            "                 靈寵中心  我的\n"
            "                   │\n"
            "          ┌────────┼────────┐\n"
            "          │        │        │\n"
            "        靈眼     靈心     靈魂\n"
            "       (Modal)  (Modal)  (Modal)\n"
            "       面相分析  風水分析  易經占卜"
        ),
        "note": "Root Layout 自動路由守衛 · DEV_SKIP_AUTH 開發模式 · 3 功能以全螢幕 Modal Overlay 呈現",
    },
    {
        "type": "content",
        "title": "Onboarding 引導流程",
        "bullets": [
            ("Step 0 — 語言選擇", [
                "6 種語言列表（國旗 + 原生名稱）",
                "即時切換，立即生效",
            ]),
            ("Step 1 — 歡迎頁", [
                "品牌 Logo「靈犀」書法字體",
                "副標題：AI 玄學生活顧問",
            ]),
            ("Step 2 — 輸入姓名", [
                "簡潔文字輸入框",
            ]),
            ("Step 3 — 出生資料", [
                "曆法切換（國曆/農曆）",
                "滾輪式日期選擇器 (WheelPicker)",
                "十二時辰選擇（含「不知道」選項）",
            ]),
            ("Step 4 — 靈寵召喚", [
                "出生月日 → 匹配 24 節氣靈寵",
                "自動計算：八字四柱 + 紫微命盤 + 太陽星座",
                "展示等級解鎖路線圖 + 三種訂閱方案",
            ]),
        ],
    },
    {
        "type": "content",
        "title": "主介面 — 靈寵中心",
        "bullets": [
            ("畫面四層結構", [
                "StatusBar：「靈犀」書法字 + 農曆日期時辰 + 等級",
                "PetAvatar：浮動動畫 + EXP 進度條 + 進化星級",
                "PetChat：可捲動聊天列表，7 種氣泡類型",
                "ActionBar：養成(餵食/玩耍/冥想) + 功能(靈眼/靈心/靈魂)",
            ]),
            ("每日運勢自動產生", [
                "進入主畫面時自動計算當日當時段運勢",
                "四大體系：八字 35% + 紫微 30% + 奇門 25% + 占星 10%",
                "以靈寵口吻呈現五維分數 + 幸運資訊",
            ]),
            ("養成系統", [
                "餵食 +50 EXP / 玩耍 +30 EXP / 冥想 +20 EXP",
                "升級時自動進化（每 10 級進化一階）",
                "等級上限依訂閱方案：Free Lv.10 / Member Lv.20 / Supreme 無限",
            ]),
        ],
    },
    {
        "type": "feature",
        "title": "Feature 1 — 靈眼（面相分析）",
        "emoji": "👁",
        "flow": "拍照 → 預覽確認 → Claude Vision 分析 → 靈寵口吻結果",
        "details": [
            "expo-camera CameraView 前置鏡頭，base64 品質 0.7",
            "後端 Claude Vision API（/ai/face-reading）",
            "五官評分：天庭/眉/眼/鼻/口 各 0-100 分",
            "AI 解讀 + 幸運物品 + 幸運方位 + 數字",
            "模擬進度條 + 靈寵旁白陪伴",
            "結果自動轉為聊天氣泡保存",
            "Web 平台自動降級（無相機時顯示 placeholder）",
        ],
    },
    {
        "type": "feature",
        "title": "Feature 2 — 靈心（風水分析）",
        "emoji": "🌍",
        "flow": "GPS 定位 → 磁力計羅盤 → 奇門遁甲排盤 → AI 分析",
        "details": [
            "expo-location GPS 座標 + 反向地理編碼（地名）",
            "expo-sensors Magnetometer 即時方位角（200ms）",
            "8 方位：吉方金色 / 凶方紅色 / 指針即時旋轉",
            "奇門遁甲九宮時盤：八門 + 九星配置",
            "AI 風水分析：場所 + 建議 + 座位建議",
            "結果以 3×3 方位宮格 + 靈寵解讀呈現",
            "Web 平台降級（無磁力計時使用固定方位）",
        ],
    },
    {
        "type": "feature",
        "title": "Feature 3 — 靈魂（易經占卜）",
        "emoji": "🔮",
        "flow": "選擇類別 → 輸入問題 → 搖卦動畫 → 卦象結果",
        "details": [
            "五大類：事業💼 / 感情❤️ / 家庭🏠 / 健康🏥 / 學業📚",
            "64 卦完整內建：Unicode 符號 + 卦辭 + 詩意句",
            "變卦機制：隨機變爻 → 生成變卦",
            "每卦對每類問事有專屬 verdict + guidance + timing",
            "搖卦震動回饋 + 1.5s 八卦符號流轉動畫",
            "結果：大字卦象 + 卦辭 + 色彩編碼 verdict",
            "上下卦 / 五行 / 變卦 / 靈寵口吻解讀",
        ],
    },
    {
        "type": "content",
        "title": "個人資料與設定",
        "bullets": [
            ("用戶資訊卡", [
                "靈寵 emoji + 名字 + 等級 + 五行 + 節氣",
                "方案徽章：Free / Member / Supreme",
            ]),
            ("命盤資料", [
                "八字四柱（如「甲子 乙丑 丙寅 丁卯」）",
                "紫微主星 / 西洋星座 / 節氣靈寵",
            ]),
            ("設定項目", [
                "語言設定（6 種語言即時切換）",
                "推播通知 / 隱私政策 / 服務條款 / 關於靈犀",
                "恢復購買（RevenueCat）/ 登出",
            ]),
        ],
    },
    {
        "type": "two_col",
        "title": "六大計算引擎",
        "left_title": "東方命理系統",
        "left": [
            "① 八字命理 (bazi-engine) — 權重 35%",
            "   四柱天干地支 + 五行比例分析",
            "② 紫微斗數 (ziwei-engine) — 權重 30%",
            "   14 主星排盤 + 12 宮位對應",
            "③ 奇門遁甲 (qimen-engine) — 權重 25%",
            "   九宮時盤 + 八門九星 + 吉凶方位",
            "④ 六十四卦 (hexagram-engine)",
            "   文王序 64 卦 + 變爻變卦 + 五類解讀",
        ],
        "right_title": "西方 & 統一引擎",
        "right": [
            "⑤ 西洋占星 (astrology-engine) — 權重 10%",
            "   12 太陽星座 + 四元素↔五行",
            "   守護星 + 三態 + 性格分析",
            "──────────────",
            "⑥ 統一運勢 (unified-fortune-engine)",
            "   融合四大體系加權分數",
            "   五維：財運 / 感情 / 事業 / 健康 / 學業",
            "   幸運方位 / 色彩 / 數字 / 五行",
        ],
    },
    {
        "type": "code",
        "title": "AI 整合架構",
        "code": (
            "┌─────────┐   HTTPS/JWT   ┌─────────────┐   ┌──────────┐\n"
            "│ LingXi  │ ────────────► │  Cloud Run  │ ─►│  Claude  │\n"
            "│  App    │ ◄──────────── │  Backend    │ ◄─│   API    │\n"
            "│ (前端)  │ {data,remain} │ (asia-east1)│   │ (Vision) │\n"
            "└─────────┘               └──────┬──────┘   └──────────┘\n"
            "                                 │\n"
            "                          ┌──────┴──────┐\n"
            "                          │ RevenueCat  │\n"
            "                          │  Webhook    │\n"
            "                          └─────────────┘"
        ),
        "note": (
            "6 個 AI 端點：面相 / 風水 / 運勢 / 穿搭 / 占卜 / 靈寵訊息\n"
            "前端零 API Key · JWT 認證 · 每日額度雙重控管\n"
            "離線能力：六大引擎全本地端 + 靈寵敘事者本地模板"
        ),
    },
    {
        "type": "pricing",
        "title": "訂閱方案",
        "plans": [
            {
                "name": "免費版",
                "price": "$0",
                "icon": "🆓",
                "features": [
                    "每功能每日 1 次",
                    "靈寵等級上限 Lv.10",
                    "進化上限 1 階",
                    "基礎模板解讀",
                ],
            },
            {
                "name": "靈犀會員",
                "price": "$390/月",
                "icon": "⭐",
                "features": [
                    "每功能每日 5 次",
                    "靈寵等級上限 Lv.20",
                    "進化上限 2 階",
                    "AI Haiku 解讀",
                    "完整占星分析",
                ],
            },
            {
                "name": "靈犀至尊",
                "price": "$1,990/月",
                "icon": "👑",
                "features": [
                    "全功能無限使用",
                    "靈寵等級無上限",
                    "進化 5 階全開",
                    "AI Sonnet 深度解讀",
                    "跨系統深度分析",
                    "首飾珠寶建議",
                ],
            },
        ],
    },
    {
        "type": "content",
        "title": "多語言支援 — 6 種語言",
        "bullets": [
            ("支援語系", [
                "🇹🇼 繁體中文 / 🇨🇳 簡體中文 / 🇯🇵 日文",
                "🇺🇸 英文 / 🇩🇪 德文 / 🇫🇷 法文",
                "每語系 351 個翻譯鍵，全部同步",
            ]),
            ("靈寵多語言敘事", [
                "繁中：稱用戶為「主人」，親切可愛",
                "日文：「ご主人様」，親しみやすい口調",
                "英文：「Master」，warm and playful",
                "德文：「Meister」/ 法文：「Maître」",
            ]),
            ("實作", [
                "react-i18next + 自動偵測系統語言",
                "AI Prompt 多語言包裝（i18n-prompts.ts）",
                "Onboarding 第一步 & Profile 頁可切換",
            ]),
        ],
    },
    {
        "type": "summary",
        "title": "架構總結",
        "stats": [
            ("畫面數", "4 主畫面 + 3 功能 Modal"),
            ("Zustand Stores", "4 個（auth/user/pet/chat）"),
            ("計算引擎", "6 個"),
            ("AI 端點", "6 個"),
            ("i18n 鍵值", "351 × 6 語言"),
            ("靈寵種類", "24 隻（二十四節氣）"),
            ("易經卦象", "64 卦完整內建"),
            ("紫微主星", "14 顆 / 12 宮位"),
        ],
        "principles": [
            "對話式 UI：所有結果以聊天氣泡呈現",
            "本地優先：六大計算引擎全部前端執行",
            "AI 增強：Claude API 深度解讀（可降級為本地模板）",
            "靈寵人格：24 種個性 × 6 種語言 × 第一人稱敘事",
            "階梯式變現：Free → Member → Supreme 三級訂閱",
        ],
    },
]


def set_slide_bg(slide, color):
    bg = slide.background
    fill = bg.fill
    fill.solid()
    fill.fore_color.rgb = color


def add_text(slide, left, top, width, height, text, font_size=14,
             color=WHITE, bold=False, alignment=PP_ALIGN.LEFT, font_name="Microsoft JhengHei"):
    txBox = slide.shapes.add_textbox(Inches(left), Inches(top), Inches(width), Inches(height))
    tf = txBox.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = text
    p.font.size = Pt(font_size)
    p.font.color.rgb = color
    p.font.bold = bold
    p.font.name = font_name
    p.alignment = alignment
    return txBox


def add_para(text_frame, text, font_size=12, color=WHITE, bold=False, indent=0,
             space_before=Pt(2), font_name="Microsoft JhengHei"):
    p = text_frame.add_paragraph()
    p.text = text
    p.font.size = Pt(font_size)
    p.font.color.rgb = color
    p.font.bold = bold
    p.font.name = font_name
    p.level = indent
    if space_before:
        p.space_before = space_before
    return p


def add_gold_bar(slide, top):
    shape = slide.shapes.add_shape(
        MSO_SHAPE.RECTANGLE,
        Inches(0.5), Inches(top), Inches(9), Pt(2)
    )
    shape.fill.solid()
    shape.fill.fore_color.rgb = GOLD_DIM
    shape.line.fill.background()
    return shape


def make_title_slide(prs, data):
    slide = prs.slides.add_slide(prs.slide_layouts[6])  # Blank
    set_slide_bg(slide, BG_COLOR)

    add_text(slide, 1, 1.5, 8, 1, data["title"], font_size=54, color=GOLD, bold=True,
             alignment=PP_ALIGN.CENTER)
    add_text(slide, 1, 2.5, 8, 0.6, data["subtitle"], font_size=28, color=LIGHT_GRAY,
             alignment=PP_ALIGN.CENTER)
    add_gold_bar(slide, 3.3)
    add_text(slide, 1, 3.6, 8, 1.2, data["tagline"], font_size=16, color=MID_GRAY,
             alignment=PP_ALIGN.CENTER)
    add_text(slide, 1, 6.5, 8, 0.4, "LING XI — 2026", font_size=11, color=DIM_GRAY,
             alignment=PP_ALIGN.CENTER)


def make_content_slide(prs, data):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    set_slide_bg(slide, BG_COLOR)

    add_text(slide, 0.5, 0.3, 9, 0.6, data["title"], font_size=28, color=GOLD, bold=True)
    add_gold_bar(slide, 0.95)

    y = 1.15
    txBox = slide.shapes.add_textbox(Inches(0.6), Inches(y), Inches(8.8), Inches(6))
    tf = txBox.text_frame
    tf.word_wrap = True

    first = True
    for section_title, items in data["bullets"]:
        add_para(tf, section_title, font_size=15, color=CYAN, bold=True,
                 space_before=Pt(12) if not first else Pt(4))
        first = False
        for item in items:
            add_para(tf, f"  •  {item}", font_size=12, color=LIGHT_GRAY, indent=1, space_before=Pt(2))


def make_two_col_slide(prs, data):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    set_slide_bg(slide, BG_COLOR)

    add_text(slide, 0.5, 0.3, 9, 0.6, data["title"], font_size=28, color=GOLD, bold=True)
    add_gold_bar(slide, 0.95)

    # Left column
    add_text(slide, 0.6, 1.15, 4, 0.4, data["left_title"], font_size=15, color=CYAN, bold=True)
    txL = slide.shapes.add_textbox(Inches(0.6), Inches(1.55), Inches(4.2), Inches(5.5))
    tfL = txL.text_frame
    tfL.word_wrap = True
    for item in data["left"]:
        add_para(tfL, f"•  {item}", font_size=11, color=LIGHT_GRAY, space_before=Pt(3))

    # Right column
    add_text(slide, 5.2, 1.15, 4, 0.4, data["right_title"], font_size=15, color=CYAN, bold=True)
    txR = slide.shapes.add_textbox(Inches(5.2), Inches(1.55), Inches(4.5), Inches(5.5))
    tfR = txR.text_frame
    tfR.word_wrap = True
    for item in data["right"]:
        add_para(tfR, f"•  {item}", font_size=11, color=LIGHT_GRAY, space_before=Pt(3))


def make_code_slide(prs, data):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    set_slide_bg(slide, BG_COLOR)

    add_text(slide, 0.5, 0.3, 9, 0.6, data["title"], font_size=28, color=GOLD, bold=True)
    add_gold_bar(slide, 0.95)

    # Code block background
    shape = slide.shapes.add_shape(
        MSO_SHAPE.ROUNDED_RECTANGLE,
        Inches(0.6), Inches(1.2), Inches(8.8), Inches(4.5)
    )
    shape.fill.solid()
    shape.fill.fore_color.rgb = RGBColor(0x12, 0x12, 0x1A)
    shape.line.color.rgb = RGBColor(0x30, 0x30, 0x40)
    shape.line.width = Pt(1)

    add_text(slide, 0.9, 1.35, 8.2, 4.2, data["code"], font_size=11,
             color=LIGHT_GRAY, font_name="Consolas")

    if "note" in data:
        add_text(slide, 0.6, 5.9, 8.8, 0.8, data["note"], font_size=11, color=MID_GRAY,
                 alignment=PP_ALIGN.CENTER)


def make_feature_slide(prs, data):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    set_slide_bg(slide, BG_COLOR)

    add_text(slide, 0.5, 0.3, 9, 0.6, data["title"], font_size=28, color=GOLD, bold=True)
    add_gold_bar(slide, 0.95)

    # Flow
    add_text(slide, 0.6, 1.15, 8.8, 0.4, f"{data['emoji']}  {data['flow']}",
             font_size=14, color=PURPLE, bold=True, alignment=PP_ALIGN.CENTER)

    # Details
    txBox = slide.shapes.add_textbox(Inches(0.6), Inches(1.75), Inches(8.8), Inches(5.5))
    tf = txBox.text_frame
    tf.word_wrap = True
    for item in data["details"]:
        add_para(tf, f"  •  {item}", font_size=13, color=LIGHT_GRAY, space_before=Pt(5))


def make_pricing_slide(prs, data):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    set_slide_bg(slide, BG_COLOR)

    add_text(slide, 0.5, 0.3, 9, 0.6, data["title"], font_size=28, color=GOLD, bold=True)
    add_gold_bar(slide, 0.95)

    x_positions = [0.3, 3.4, 6.5]
    card_w = 2.9
    colors = [MID_GRAY, GOLD, PURPLE]

    for i, plan in enumerate(data["plans"]):
        x = x_positions[i]
        border_color = colors[i]

        # Card background
        shape = slide.shapes.add_shape(
            MSO_SHAPE.ROUNDED_RECTANGLE,
            Inches(x), Inches(1.2), Inches(card_w), Inches(5.3)
        )
        shape.fill.solid()
        shape.fill.fore_color.rgb = RGBColor(0x10, 0x10, 0x18)
        shape.line.color.rgb = border_color
        shape.line.width = Pt(1.5)

        # Icon + Name
        add_text(slide, x + 0.2, 1.35, card_w - 0.4, 0.5,
                 f"{plan['icon']}  {plan['name']}", font_size=18,
                 color=border_color, bold=True, alignment=PP_ALIGN.CENTER)

        # Price
        add_text(slide, x + 0.2, 1.85, card_w - 0.4, 0.4,
                 plan["price"], font_size=22, color=WHITE, bold=True,
                 alignment=PP_ALIGN.CENTER)

        # Features
        txBox = slide.shapes.add_textbox(
            Inches(x + 0.3), Inches(2.5), Inches(card_w - 0.6), Inches(3.8)
        )
        tf = txBox.text_frame
        tf.word_wrap = True
        for feat in plan["features"]:
            add_para(tf, f"•  {feat}", font_size=11, color=LIGHT_GRAY, space_before=Pt(5))


def make_summary_slide(prs, data):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    set_slide_bg(slide, BG_COLOR)

    add_text(slide, 0.5, 0.3, 9, 0.6, data["title"], font_size=28, color=GOLD, bold=True)
    add_gold_bar(slide, 0.95)

    # Stats table
    add_text(slide, 0.6, 1.1, 4, 0.4, "數字摘要", font_size=15, color=CYAN, bold=True)
    txBox = slide.shapes.add_textbox(Inches(0.6), Inches(1.5), Inches(4.2), Inches(4))
    tf = txBox.text_frame
    tf.word_wrap = True
    for label, value in data["stats"]:
        add_para(tf, f"  {label}：{value}", font_size=12, color=LIGHT_GRAY, space_before=Pt(4))

    # Principles
    add_text(slide, 5.2, 1.1, 4.5, 0.4, "設計原則", font_size=15, color=CYAN, bold=True)
    txBox2 = slide.shapes.add_textbox(Inches(5.2), Inches(1.5), Inches(4.5), Inches(4))
    tf2 = txBox2.text_frame
    tf2.word_wrap = True
    for i, p in enumerate(data["principles"]):
        add_para(tf2, f"  {i+1}. {p}", font_size=12, color=LIGHT_GRAY, space_before=Pt(4))

    # Footer
    add_text(slide, 1, 6.2, 8, 0.5, "靈犀 — 萬物皆有靈", font_size=18, color=GOLD,
             bold=True, alignment=PP_ALIGN.CENTER)


def main():
    prs = Presentation()
    prs.slide_width = Inches(10)
    prs.slide_height = Inches(7.5)

    builders = {
        "title": make_title_slide,
        "content": make_content_slide,
        "two_col": make_two_col_slide,
        "code": make_code_slide,
        "feature": make_feature_slide,
        "pricing": make_pricing_slide,
        "summary": make_summary_slide,
    }

    for slide_data in SLIDES:
        builder = builders[slide_data["type"]]
        builder(prs, slide_data)

    out_path = os.path.join(os.path.dirname(__file__), "LingXi_Presentation.pptx")
    prs.save(out_path)
    print(f"PPTX generated: {out_path}")
    print(f"Total slides: {len(prs.slides)}")


if __name__ == "__main__":
    main()
