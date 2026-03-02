#!/usr/bin/env python3
"""
靈犀 App — 美工 AI Prompt 表格生成器
生成 ART_PROMPTS.md，涵蓋 61 個 Icon + 24 靈寵 × 6 張圖 + 動畫素材
"""

import os

OUTPUT_PATH = r"G:\共用雲端硬碟\有泉科技有限公司\內部開發\APP\算命系統\LingXi\ART_PROMPTS.md"

# ═══════════════════════════════════════════════════
# A. ICON DATA
# ═══════════════════════════════════════════════════

STYLE_BASE_EN = (
    "Icon design for a mystical Chinese fortune-telling app called LingXi. "
    "Style: dark luxury, Eastern mysticism, gold (#E8C547) on deep black (#08080F). "
    "Gold glow effects, subtle aura, fine line details. "
)
STYLE_BASE_CN = (
    "靈犀 App 圖標設計，東方神秘風格。"
    "主色金色 #E8C547，深黑背景 #08080F。"
    "帶金色光暈、微光效果、精緻描邊。"
)

ICON_CATEGORIES = [
    # ─── A1. App Icon ───
    {
        "title": "A1. App Icon — 應用程式圖標",
        "folder": "assets/icons/app/",
        "count": 7,
        "icons": [
            {
                "file": "icon-1024.png", "size": "1024×1024", "purpose": "App Store / Google Play 上架",
                "en": f"{STYLE_BASE_EN}A golden rhinoceros horn crystal orb radiating golden glow at center, surrounded by faint Bagua (八卦) trigram patterns. Deep black #08080F solid background. Rounded square composition (iOS auto-crop). No text, pure graphic symbol. Centered, high contrast, app store ready.",
                "cn": f"{STYLE_BASE_CN}中央一枚金色靈犀角水晶球，散發金色光暈。周圍有微弱的八卦紋路環繞。深黑 #08080F 實色背景，圓角方形構圖（iOS 自動裁切）。不要文字，純圖形。置中構圖，高對比。"
            },
            {
                "file": "icon-512.png", "size": "512×512", "purpose": "Android adaptive icon",
                "en": f"{STYLE_BASE_EN}A golden rhinoceros horn crystal orb with golden glow, faint Bagua patterns. Deep black #08080F background. No text, centered graphic. Android adaptive icon format.",
                "cn": f"{STYLE_BASE_CN}金色靈犀角水晶球，帶金色光暈與微弱八卦紋。深黑 #08080F 背景。無文字，置中圖形。Android adaptive icon 格式。"
            },
            {
                "file": "icon-192.png", "size": "192×192", "purpose": "Android launcher",
                "en": f"{STYLE_BASE_EN}Simplified golden crystal orb icon with glow effect on black #08080F. Clean, recognizable at small size. No text.",
                "cn": f"{STYLE_BASE_CN}簡化金色水晶球圖標，帶光暈。黑色 #08080F 背景。小尺寸下清晰可辨。無文字。"
            },
            {
                "file": "icon-180.png", "size": "180×180", "purpose": "iOS @3x",
                "en": f"{STYLE_BASE_EN}Golden crystal orb with Bagua aura on black #08080F. iOS retina @3x. Centered, no text, crisp details.",
                "cn": f"{STYLE_BASE_CN}金色水晶球帶八卦光暈，黑色 #08080F 背景。iOS Retina @3x。置中，無文字，細節清晰。"
            },
            {
                "file": "icon-120.png", "size": "120×120", "purpose": "iOS @2x",
                "en": f"{STYLE_BASE_EN}Simplified golden crystal orb on black #08080F. iOS @2x retina. Clean lines, no text.",
                "cn": f"{STYLE_BASE_CN}簡化金色水晶球，黑色 #08080F 背景。iOS @2x Retina。清晰線條，無文字。"
            },
            {
                "file": "icon-76.png", "size": "76×76", "purpose": "iPad",
                "en": f"{STYLE_BASE_EN}Minimal golden orb glyph on black #08080F. iPad icon. Highly simplified, recognizable.",
                "cn": f"{STYLE_BASE_CN}極簡金色水晶球符號，黑色 #08080F 背景。iPad 圖標，高度簡化但可辨識。"
            },
            {
                "file": "icon-foreground.png", "size": "1024×1024", "purpose": "Android adaptive 前景（透明背景）",
                "en": f"{STYLE_BASE_EN}Golden rhinoceros horn crystal orb with radiating glow and Bagua patterns. TRANSPARENT background (no black). Android adaptive foreground layer. Centered with padding for safe zone.",
                "cn": f"{STYLE_BASE_CN}金色靈犀角水晶球，發散光暈與八卦紋路。透明背景（無黑色底）。Android adaptive 前景層。置中並預留安全區間距。"
            },
        ]
    },
    # ─── A2. Splash Screen ───
    {
        "title": "A2. Splash Screen — 啟動畫面",
        "folder": "assets/icons/splash/",
        "count": 3,
        "icons": [
            {
                "file": "splash.png", "size": "1284×2778", "purpose": "iPhone 14 Pro Max 啟動畫面",
                "en": f"{STYLE_BASE_EN}Full-screen splash: deep black #08080F background. Center: large golden LingXi crystal orb logo with radiant glow. Below logo: Chinese calligraphy characters '靈犀' in brush style, gold #E8C547. Bottom area: subtle golden particle dust floating effect. Atmosphere: solemn, ceremonial, mystical. Portrait orientation 1284×2778.",
                "cn": f"{STYLE_BASE_CN}全屏啟動畫面：深黑 #08080F 背景。中央：大型金色靈犀水晶球 Logo，發散光暈。Logo 下方：「靈犀」毛筆書法字，金色 #E8C547。底部：微弱金色粒子漂浮效果。整體感覺：沉穩大氣、有儀式感。直向 1284×2778。"
            },
            {
                "file": "splash-tablet.png", "size": "2048×2732", "purpose": "iPad Pro 啟動畫面",
                "en": f"{STYLE_BASE_EN}Full-screen tablet splash: deep black #08080F background. Center: large golden LingXi crystal orb with calligraphy '靈犀' below. Golden particle dust at bottom. Solemn, ceremonial. Tablet portrait 2048×2732.",
                "cn": f"{STYLE_BASE_CN}全屏平板啟動畫面：深黑 #08080F 背景。中央：大型金色靈犀水晶球，下方「靈犀」書法字。底部金色粒子效果。沉穩大氣。平板直向 2048×2732。"
            },
            {
                "file": "splash-logo.png", "size": "512×512", "purpose": "置中 Logo（透明背景）",
                "en": f"{STYLE_BASE_EN}LingXi app logo: golden rhinoceros horn crystal orb, radiating warm gold glow, surrounded by faint mystical Bagua aura. Transparent PNG background. Clean, centered, suitable for overlay on any background.",
                "cn": f"{STYLE_BASE_CN}靈犀 App Logo：金色靈犀角水晶球，散發溫暖金色光暈，周圍微弱神秘八卦光環。透明背景 PNG。乾淨、置中、可疊加於任何背景。"
            },
        ]
    },
    # ─── A3. Tab Bar ───
    {
        "title": "A3. Tab Bar — 底部導航列圖標",
        "folder": "assets/icons/tab-bar/",
        "count": 4,
        "icons": [
            {
                "file": "tab-pet.png", "size": "96×96", "purpose": "靈寵 Tab（未選中）",
                "en": f"Minimalist icon: a small crystal ball / rhinoceros horn symbol, Eastern talisman line art style. Muted dark gold tone rgba(136,128,112,0.5). Fine stroke outlines, mystical feel. Transparent background. 96×96 px.",
                "cn": f"極簡圖標：小型水晶球/靈犀角符號，東方符文線條風格。暗金色調 rgba(136,128,112,0.5)。細線描邊，神秘感。透明背景。96×96 px。"
            },
            {
                "file": "tab-pet-active.png", "size": "96×96", "purpose": "靈寵 Tab（選中）",
                "en": f"Minimalist icon: a crystal ball / rhinoceros horn symbol, Eastern talisman line art style. Bright gold #E8C547 with subtle glow aura effect. Fine stroke outlines, glowing mystical feel. Transparent background. 96×96 px.",
                "cn": f"極簡圖標：水晶球/靈犀角符號，東方符文線條風格。明亮金色 #E8C547，帶微光暈效果。細線描邊，發光神秘感。透明背景。96×96 px。"
            },
            {
                "file": "tab-profile.png", "size": "96×96", "purpose": "我的 Tab（未選中）",
                "en": f"Minimalist icon: a gear / settings cogwheel with Eastern ornamental pattern. Muted dark gold tone rgba(136,128,112,0.5). Fine stroke, talisman-like line art. Transparent background. 96×96 px.",
                "cn": f"極簡圖標：齒輪/設定符號，帶東方裝飾紋路。暗金色調 rgba(136,128,112,0.5)。細線描邊，符文線條風格。透明背景。96×96 px。"
            },
            {
                "file": "tab-profile-active.png", "size": "96×96", "purpose": "我的 Tab（選中）",
                "en": f"Minimalist icon: a gear / settings cogwheel with Eastern ornamental pattern. Bright gold #E8C547 with subtle glow aura. Fine stroke, talisman-like line art, glowing. Transparent background. 96×96 px.",
                "cn": f"極簡圖標：齒輪/設定符號，帶東方裝飾紋路。明亮金色 #E8C547，帶微光暈。細線描邊，符文線條風格，發光效果。透明背景。96×96 px。"
            },
        ]
    },
    # ─── A4. Action Bar — 養成互動 ───
    {
        "title": "A4. Action Bar — 養成互動",
        "folder": "assets/icons/action-bar/nurture/",
        "count": 3,
        "icons": [
            {
                "file": "feed.png", "size": "128×128", "purpose": "餵食（+50 EXP）",
                "en": f"{STYLE_BASE_EN}A golden spirit pill / celestial fruit, radiating warm golden light. Ethereal glow around the pill, faint energy particles rising. Main body gold #E8C547, shadow deep gold #A08030. Delicate icon with subtle aura. Transparent PNG background. 128×128 px.",
                "cn": f"{STYLE_BASE_CN}一枚金色靈丹/仙果，散發溫暖金光。靈丹周圍有空靈光暈，微弱能量粒子上升。主體金色 #E8C547，陰影深金 #A08030。精緻圖標帶微光暈。透明背景 PNG。128×128 px。"
            },
            {
                "file": "play.png", "size": "128×128", "purpose": "玩耍（+30 EXP）",
                "en": f"{STYLE_BASE_EN}A glowing spirit pearl / crystal ball toy, playful bouncing energy. Warm golden light emission with tiny sparkles. Main gold #E8C547, shadow #A08030. Fun yet mystical icon. Transparent PNG background. 128×128 px.",
                "cn": f"{STYLE_BASE_CN}一顆發光的靈珠/水晶球玩具，充滿彈跳能量感。溫暖金色光芒與微小光點。主體金色 #E8C547，陰影 #A08030。有趣且神秘的圖標。透明背景 PNG。128×128 px。"
            },
            {
                "file": "meditate.png", "size": "128×128", "purpose": "冥想（+20 EXP）",
                "en": f"{STYLE_BASE_EN}A golden lotus flower or a meditation silhouette with a glowing halo ring. Serene golden energy aura, peaceful floating posture. Main gold #E8C547, shadow #A08030. Zen-like tranquil icon. Transparent PNG background. 128×128 px.",
                "cn": f"{STYLE_BASE_CN}一朵金色蓮花或冥想剪影，帶發光光環。寧靜金色能量光暈，安詳浮空姿態。主體金色 #E8C547，陰影 #A08030。禪意寧靜圖標。透明背景 PNG。128×128 px。"
            },
        ]
    },
    # ─── A5. Action Bar — 靈寵能力 ───
    {
        "title": "A5. Action Bar — 靈寵能力",
        "folder": "assets/icons/action-bar/ability/",
        "count": 3,
        "icons": [
            {
                "file": "eye.png", "size": "128×128", "purpose": "靈眼 — 面相分析（Claude Vision）",
                "en": f"{STYLE_BASE_EN}A mystical vertical third eye (天目 / Celestial Eye), with a glowing blue pupil #64B4FF. Ancient Chinese 'Heavenly Eye' talisman symbol. Faint face physiognomy line patterns around the eye. Blue aura glow. Transparent PNG background. 128×128 px.",
                "cn": f"{STYLE_BASE_CN}一隻神秘的豎立靈眼/天眼，瞳孔發藍光 #64B4FF。古代「天目」符號風格。眼睛周圍有微弱的面相五官紋路。藍色光暈效果。透明背景 PNG。128×128 px。"
            },
            {
                "file": "heart.png", "size": "128×128", "purpose": "靈心 — GPS 風水羅盤",
                "en": f"{STYLE_BASE_EN}A mystical compass / Luopan (風水羅盤) with Bagua base pattern. Center point glowing green #64C878. Directional degree marks and cardinal directions. Chinese geomancy instrument feel. Transparent PNG background. 128×128 px.",
                "cn": f"{STYLE_BASE_CN}一個神秘羅盤/風水羅盤，帶八卦底紋。中心點發綠光 #64C878。有方位刻度與東南西北標記。中國堪輿儀器感。透明背景 PNG。128×128 px。"
            },
            {
                "file": "soul.png", "size": "128×128", "purpose": "靈魂 — 64 卦占卜",
                "en": f"{STYLE_BASE_EN}A mystical spirit lantern / ancient oil lamp, glowing purple #A78BFA. Hexagram (卦象) line patterns engraved on the lantern surface. Flickering spirit flames around it. Divination atmosphere. Transparent PNG background. 128×128 px.",
                "cn": f"{STYLE_BASE_CN}一盞神秘靈魂燈籠/古燈，發紫光 #A78BFA。燈籠表面刻有卦象線條紋路。周圍有搖曳的靈火。占卜氛圍。透明背景 PNG。128×128 px。"
            },
        ]
    },
    # ─── A6. Onboarding ───
    {
        "title": "A6. Onboarding — 引導圖",
        "folder": "assets/icons/onboarding/",
        "count": 5,
        "icons": [
            {
                "file": "step0-language.png", "size": "512×512", "purpose": "Step 0 — 語言選擇",
                "en": f"{STYLE_BASE_EN}A golden globe / Earth symbol surrounded by multilingual characters: Chinese '中', English 'A', Japanese 'あ'. Elegant gold tone, language selection concept. Detailed illustration style. Transparent PNG background. 512×512 px.",
                "cn": f"{STYLE_BASE_CN}金色地球儀符號，周圍環繞多語言文字：中文「中」、英文「A」、日文「あ」。優雅金色調，語言選擇概念。精緻插圖風格。透明背景 PNG。512×512 px。"
            },
            {
                "file": "step1-welcome.png", "size": "512×512", "purpose": "Step 1 — 歡迎畫面",
                "en": f"{STYLE_BASE_EN}Large LingXi logo: golden crystal orb with radiating light rays and floating golden particles. Grand entrance atmosphere, majestic and welcoming. Detailed illustration with particle effects. Transparent PNG background. 512×512 px.",
                "cn": f"{STYLE_BASE_CN}大型靈犀 Logo：金色水晶球，發散光芒與浮動金色粒子。盛大入場氛圍，壯觀且歡迎感。精緻插圖帶粒子效果。透明背景 PNG。512×512 px。"
            },
            {
                "file": "step2-name.png", "size": "512×512", "purpose": "Step 2 — 輸入姓名",
                "en": f"{STYLE_BASE_EN}A golden calligraphy brush writing mystical characters, ink splash with golden glow. Eastern brush painting atmosphere. The brush tip glows with spiritual energy. Detailed illustration. Transparent PNG background. 512×512 px.",
                "cn": f"{STYLE_BASE_CN}一支金色毛筆書寫神秘文字，墨跡飛濺帶金色光暈。東方書法意境。筆尖散發靈氣能量。精緻插圖。透明背景 PNG。512×512 px。"
            },
            {
                "file": "step3-birth.png", "size": "512×512", "purpose": "Step 3 — 出生資料",
                "en": f"{STYLE_BASE_EN}A celestial astrology wheel / Chinese destiny chart (命盤): circular disc with Heavenly Stems (天干) and Earthly Branches (地支) markings around the rim. Golden zodiac symbols, rotating constellation feel. Detailed illustration. Transparent PNG background. 512×512 px.",
                "cn": f"{STYLE_BASE_CN}一面星象盤/中國命盤輪盤：圓盤邊緣刻有天干地支文字。金色星座符號，旋轉星象感。精緻插圖。透明背景 PNG。512×512 px。"
            },
            {
                "file": "step4-summon.png", "size": "512×512", "purpose": "Step 4 — 靈寵召喚",
                "en": f"{STYLE_BASE_EN}A majestic golden light pillar descending from above, with a spirit beast silhouette emerging inside the beam. Summoning ritual atmosphere, golden particles swirling. Energy portal at the top, mystical creature shadow at center. Detailed illustration. Transparent PNG background. 512×512 px.",
                "cn": f"{STYLE_BASE_CN}壯觀金色光柱從天而降，光束中浮現靈獸剪影。召喚儀式氛圍，金色粒子旋繞。頂部能量光門，中央神秘靈獸影子。精緻插圖。透明背景 PNG。512×512 px。"
            },
        ]
    },
    # ─── A7. Chat 對話類型標記 ───
    {
        "title": "A7. Chat 對話類型標記",
        "folder": "assets/icons/chat-types/",
        "count": 7,
        "icons": [
            {
                "file": "fortune.png", "size": "64×64", "purpose": "每日運勢",
                "en": f"Tiny badge icon: a golden pentagram star / destiny chart symbol, glowing gold #E8C547. Fine line art, Eastern mystical style. Highly recognizable at small size. Transparent PNG background. 64×64 px.",
                "cn": f"小型標記圖標：金色五角星/命盤符號，發光金色 #E8C547。細線描繪，東方神秘風格。小尺寸高辨識度。透明背景 PNG。64×64 px。"
            },
            {
                "file": "outfit.png", "size": "64×64", "purpose": "穿搭建議",
                "en": f"Tiny badge icon: a warm orange #E89C47 clothing hanger / fabric drape symbol. Fine line art, Eastern mystical style. Recognizable at small size. Transparent PNG background. 64×64 px.",
                "cn": f"小型標記圖標：暖橙色 #E89C47 衣架/布料符號。細線描繪，東方神秘風格。小尺寸可辨識。透明背景 PNG。64×64 px。"
            },
            {
                "file": "face.png", "size": "64×64", "purpose": "面相結果",
                "en": f"Tiny badge icon: a spirit blue #64B4FF face contour line drawing, physiognomy analysis feel. Fine line art, Eastern mystical style. Transparent PNG background. 64×64 px.",
                "cn": f"小型標記圖標：靈藍色 #64B4FF 臉部輪廓線描，面相分析感。細線描繪，東方神秘風格。透明背景 PNG。64×64 px。"
            },
            {
                "file": "fengshui.png", "size": "64×64", "purpose": "風水結果",
                "en": f"Tiny badge icon: a spirit green #64C878 Luopan compass symbol with directional marks. Fine line art, Eastern mystical style. Transparent PNG background. 64×64 px.",
                "cn": f"小型標記圖標：靈綠色 #64C878 羅盤符號帶方位刻度。細線描繪，東方神秘風格。透明背景 PNG。64×64 px。"
            },
            {
                "file": "divination.png", "size": "64×64", "purpose": "占卜結果",
                "en": f"Tiny badge icon: a spirit purple #A78BFA hexagram trigram symbol (☰). Fine line art, Eastern mystical I-Ching style. Transparent PNG background. 64×64 px.",
                "cn": f"小型標記圖標：靈紫色 #A78BFA 卦象符號（☰）。細線描繪，東方神秘易經風格。透明背景 PNG。64×64 px。"
            },
            {
                "file": "levelup.png", "size": "64×64", "purpose": "升級通知",
                "en": f"Tiny badge icon: a bright gold #FFD700 upward arrow with sparkle stars, leveling up concept. Fine line art, Eastern mystical style. Transparent PNG background. 64×64 px.",
                "cn": f"小型標記圖標：亮金色 #FFD700 上升箭頭加星星光點，升級概念。細線描繪，東方神秘風格。透明背景 PNG。64×64 px。"
            },
            {
                "file": "evolve.png", "size": "64×64", "purpose": "進化通知",
                "en": f"Tiny badge icon: a rainbow gradient metamorphosis / spreading wings symbol, evolution concept. Fine line art, multi-color iridescent glow. Transparent PNG background. 64×64 px.",
                "cn": f"小型標記圖標：彩虹漸層蛻變/展翅符號，進化概念。細線描繪，多色虹光效果。透明背景 PNG。64×64 px。"
            },
        ]
    },
    # ─── A8. 升級 Modal ───
    {
        "title": "A8. 升級 Modal — 會員圖標",
        "folder": "assets/icons/upgrade/",
        "count": 4,
        "icons": [
            {
                "file": "member-badge.png", "size": "256×256", "purpose": "⭐ 靈犀會員標示",
                "en": f"{STYLE_BASE_EN}A golden star badge / medal with the Chinese character '靈' or a star shape engraved. Premium membership feel, clean gold #E8C547. Polished metallic surface with subtle glow. Transparent PNG background. 256×256 px.",
                "cn": f"{STYLE_BASE_CN}金色星章/勳章，刻有「靈」字或星形。會員尊榮感，金色 #E8C547。拋光金屬質感帶微光暈。透明背景 PNG。256×256 px。"
            },
            {
                "file": "supreme-badge.png", "size": "256×256", "purpose": "👑 靈犀至尊標示",
                "en": f"{STYLE_BASE_EN}A majestic purple-gold crown badge, ornate and luxurious. Gradient from spirit purple #A78BFA to gold #E8C547. Imperial Chinese crown design with jewels. More elaborate than member badge. Transparent PNG background. 256×256 px.",
                "cn": f"{STYLE_BASE_CN}華麗紫金皇冠章，精緻奢華。紫金漸層 #A78BFA → #E8C547。中國帝王冠飾設計帶寶石。比會員徽章更華麗。透明背景 PNG。256×256 px。"
            },
            {
                "file": "quota-empty.png", "size": "256×256", "purpose": "額度用盡提示圖",
                "en": f"{STYLE_BASE_EN}An empty hourglass or spirit energy bottle in a dimmed, depleted state. Faded gold color, no glow, desaturated. Exhausted energy concept. Transparent PNG background. 256×256 px.",
                "cn": f"{STYLE_BASE_CN}空的沙漏或靈力瓶，暗淡耗盡狀態。褪色金色，無光暈，去飽和。能量耗盡概念。透明背景 PNG。256×256 px。"
            },
            {
                "file": "lock.png", "size": "256×256", "purpose": "功能鎖定提示",
                "en": f"{STYLE_BASE_EN}An ancient Chinese-style padlock with a golden keyhole glowing. Ornate antique lock with Eastern patterns engraved. Locked mystery feel. Transparent PNG background. 256×256 px.",
                "cn": f"{STYLE_BASE_CN}古風中式鎖，金色鑰匙孔發光。精緻古鎖帶東方紋飾雕刻。鎖定的神秘感。透明背景 PNG。256×256 px。"
            },
        ]
    },
    # ─── A9. Profile 設定 ───
    {
        "title": "A9. Profile — 設定頁圖標",
        "folder": "assets/icons/profile/",
        "count": 8,
        "icons": [
            {
                "file": "notification.png", "size": "64×64", "purpose": "推播設定",
                "en": f"Small icon: an ancient Chinese bell (古鐘) with a subtle gold ring aura. Dark gold tone #88807080, fine line art, Eastern talisman style. Transparent PNG. 64×64 px.",
                "cn": f"小型圖標：古鐘造型鈴鐺，帶微弱金色光環。暗金色調 #88807080，細線描繪，東方符文風格。透明背景 PNG。64×64 px。"
            },
            {
                "file": "privacy.png", "size": "64×64", "purpose": "隱私權政策",
                "en": f"Small icon: an Eastern-style shield / guardian talisman symbol. Dark gold tone #88807080, fine line art, mystical protective feel. Transparent PNG. 64×64 px.",
                "cn": f"小型圖標：東方風格盾牌/守護符號。暗金色調 #88807080，細線描繪，神秘防護感。透明背景 PNG。64×64 px。"
            },
            {
                "file": "terms.png", "size": "64×64", "purpose": "服務條款",
                "en": f"Small icon: a bamboo scroll / ancient book scroll symbol. Dark gold tone #88807080, fine line art, Eastern scholarly feel. Transparent PNG. 64×64 px.",
                "cn": f"小型圖標：竹簡/古書卷符號。暗金色調 #88807080，細線描繪，東方學者感。透明背景 PNG。64×64 px。"
            },
            {
                "file": "about.png", "size": "64×64", "purpose": "關於靈犀",
                "en": f"Small icon: an information 'i' symbol with Eastern ornamental circle. Dark gold tone #88807080, fine line art, mystical style. Transparent PNG. 64×64 px.",
                "cn": f"小型圖標：資訊「i」符號，帶東方裝飾圓環。暗金色調 #88807080，細線描繪，神秘風格。透明背景 PNG。64×64 px。"
            },
            {
                "file": "logout.png", "size": "64×64", "purpose": "登出",
                "en": f"Small icon: an exit door / gateway with an outward arrow, ancient gate style. Dark gold tone #88807080, fine line art, Eastern mystical feel. Transparent PNG. 64×64 px.",
                "cn": f"小型圖標：古門/門戶帶外出箭頭，古代門扉風格。暗金色調 #88807080，細線描繪，東方神秘感。透明背景 PNG。64×64 px。"
            },
            {
                "file": "subscription.png", "size": "64×64", "purpose": "訂閱管理",
                "en": f"Small icon: a crown / star badge symbol for subscription management. Dark gold tone #88807080, fine line art, Eastern ornamental style. Transparent PNG. 64×64 px.",
                "cn": f"小型圖標：皇冠/星章符號，訂閱管理用途。暗金色調 #88807080，細線描繪，東方裝飾風格。透明背景 PNG。64×64 px。"
            },
            {
                "file": "destiny.png", "size": "64×64", "purpose": "命盤資料",
                "en": f"Small icon: a circular destiny chart wheel (命盤輪) with zodiac marks. Dark gold tone #88807080, fine line art, celestial mystical style. Transparent PNG. 64×64 px.",
                "cn": f"小型圖標：圓形命盤輪，帶星宿刻度。暗金色調 #88807080，細線描繪，天象神秘風格。透明背景 PNG。64×64 px。"
            },
            {
                "file": "language.png", "size": "64×64", "purpose": "語言設定",
                "en": f"Small icon: a globe / Earth symbol with Eastern decorative patterns. Dark gold tone #88807080, fine line art, mystical cartography style. Transparent PNG. 64×64 px.",
                "cn": f"小型圖標：地球儀符號，帶東方裝飾紋路。暗金色調 #88807080，細線描繪，神秘地圖風格。透明背景 PNG。64×64 px。"
            },
        ]
    },
    # ─── A10. 狀態相關 ───
    {
        "title": "A10. 狀態相關圖標",
        "folder": "assets/icons/status/",
        "count": 9,
        "icons": [
            {
                "file": "exp-bar-fill.png", "size": "高24px 寬可拉伸", "purpose": "EXP 進度條填充（9-patch）",
                "en": f"Horizontal progress bar fill texture: gold gradient bar with glossy shine, from deep gold #8b6914 to bright gold #E8C547 to light gold #f5e6a3. Metallic luster, smooth surface. 9-patch stretchable. Transparent PNG. Height 24px, width stretchable.",
                "cn": f"水平進度條填充材質：金色漸層橫條帶光澤，從深金 #8b6914 到亮金 #E8C547 到淺金 #f5e6a3。金屬光澤，平滑表面。9-patch 可拉伸。透明背景 PNG。高 24px，寬度可拉伸。"
            },
            {
                "file": "exp-bar-bg.png", "size": "高24px 寬可拉伸", "purpose": "EXP 進度條底圖（9-patch）",
                "en": f"Horizontal progress bar background: dark gray semi-transparent bar, subtle inner bevel. Color: rgba(30,30,40,0.6). 9-patch stretchable. Transparent PNG. Height 24px, width stretchable.",
                "cn": f"水平進度條底圖：深灰半透明底條，微弱內凹效果。顏色 rgba(30,30,40,0.6)。9-patch 可拉伸。透明背景 PNG。高 24px，寬度可拉伸。"
            },
            {
                "file": "star-filled.png", "size": "48×48", "purpose": "實心星（進化階段）",
                "en": f"A solid golden five-pointed star, bright gold #E8C547 with warm glow aura effect. Metallic shine, evolution stage indicator. Transparent PNG. 48×48 px.",
                "cn": f"實心金色五角星，明亮金色 #E8C547 帶溫暖光暈效果。金屬光澤，進化階段指示。透明背景 PNG。48×48 px。"
            },
            {
                "file": "star-empty.png", "size": "48×48", "purpose": "空心星（進化階段）",
                "en": f"An outline-only five-pointed star, dark muted stroke color #5a5040. No fill, just thin border. Evolution stage placeholder. Transparent PNG. 48×48 px.",
                "cn": f"描邊空心五角星，暗色描邊 #5a5040。無填充，僅細邊框。進化階段佔位。透明背景 PNG。48×48 px。"
            },
            {
                "file": "element-wood.png", "size": "64×64", "purpose": "木 五行標記",
                "en": f"Five Elements badge — WOOD (木): a green #4CAF50 sprouting seedling / tree symbol. Eastern mystical style, fine line art with subtle green glow. Transparent PNG. 64×64 px.",
                "cn": f"五行標記 — 木：綠色 #4CAF50 嫩芽/樹木符號。東方神秘風格，細線描繪帶微弱綠色光暈。透明背景 PNG。64×64 px。"
            },
            {
                "file": "element-fire.png", "size": "64×64", "purpose": "火 五行標記",
                "en": f"Five Elements badge — FIRE (火): a red-orange #FF5722 flame symbol. Eastern mystical style, fine line art with subtle fire glow. Transparent PNG. 64×64 px.",
                "cn": f"五行標記 — 火：紅橙色 #FF5722 火焰符號。東方神秘風格，細線描繪帶微弱火焰光暈。透明背景 PNG。64×64 px。"
            },
            {
                "file": "element-earth.png", "size": "64×64", "purpose": "土 五行標記",
                "en": f"Five Elements badge — EARTH (土): a golden-brown #FFC107 mountain shape symbol. Eastern mystical style, fine line art with subtle earth tone glow. Transparent PNG. 64×64 px.",
                "cn": f"五行標記 — 土：土黃色 #FFC107 山形符號。東方神秘風格，細線描繪帶微弱土色光暈。透明背景 PNG。64×64 px。"
            },
            {
                "file": "element-metal.png", "size": "64×64", "purpose": "金 五行標記",
                "en": f"Five Elements badge — METAL (金): a silver-white #B0BEC5 sword / metallic ingot symbol. Eastern mystical style, fine line art with subtle silver glow. Transparent PNG. 64×64 px.",
                "cn": f"五行標記 — 金：銀白色 #B0BEC5 劍形/金屬符號。東方神秘風格，細線描繪帶微弱銀色光暈。透明背景 PNG。64×64 px。"
            },
            {
                "file": "element-water.png", "size": "64×64", "purpose": "水 五行標記",
                "en": f"Five Elements badge — WATER (水): an indigo-blue #2196F3 water wave symbol. Eastern mystical style, fine line art with subtle blue glow. Transparent PNG. 64×64 px.",
                "cn": f"五行標記 — 水：靛藍色 #2196F3 水波符號。東方神秘風格，細線描繪帶微弱藍色光暈。透明背景 PNG。64×64 px。"
            },
        ]
    },
    # ─── A11. 其他/通用 ───
    {
        "title": "A11. 其他/通用圖標",
        "folder": "assets/icons/misc/",
        "count": 8,
        "icons": [
            {
                "file": "share.png", "size": "64×64", "purpose": "對話分享按鈕",
                "en": f"Small icon: a share / forward arrow symbol, gold #E8C547 line art, Eastern mystical ornamental style. Clean strokes. Transparent PNG. 64×64 px.",
                "cn": f"小型圖標：分享/轉發箭頭符號，金色 #E8C547 線條，東方神秘裝飾風格。乾淨筆觸。透明背景 PNG。64×64 px。"
            },
            {
                "file": "retry.png", "size": "64×64", "purpose": "再搖一卦",
                "en": f"Small icon: a circular retry / refresh arrow symbol, gold #E8C547 line art. Suggests 'cast divination again'. Eastern mystical style. Transparent PNG. 64×64 px.",
                "cn": f"小型圖標：環形重試/刷新箭頭符號，金色 #E8C547 線條。暗示「再搖一卦」。東方神秘風格。透明背景 PNG。64×64 px。"
            },
            {
                "file": "close.png", "size": "64×64", "purpose": "Modal/Overlay 關閉",
                "en": f"Small icon: an X close symbol, gold #E8C547 line art, Eastern calligraphy-stroke style. Clean and minimal. Transparent PNG. 64×64 px.",
                "cn": f"小型圖標：X 關閉符號，金色 #E8C547 線條，東方書法筆觸風格。乾淨極簡。透明背景 PNG。64×64 px。"
            },
            {
                "file": "camera.png", "size": "128×128", "purpose": "靈眼拍照觸發",
                "en": f"{STYLE_BASE_EN}A mystical camera / spirit eye lens symbol, combining camera shape with a celestial eye motif. Gold #E8C547 main color, subtle blue #64B4FF lens glow. Eastern mystical style. Transparent PNG. 128×128 px.",
                "cn": f"{STYLE_BASE_CN}神秘相機/靈眼鏡頭符號，結合相機造型與天眼意象。金色 #E8C547 為主，鏡頭微弱藍光 #64B4FF。東方神秘風格。透明背景 PNG。128×128 px。"
            },
            {
                "file": "gps.png", "size": "128×128", "purpose": "靈心 GPS 定位",
                "en": f"{STYLE_BASE_EN}A mystical location pin / compass rose symbol with Feng Shui directional marks. Gold #E8C547 main, green #64C878 location dot. Eastern geomancy style. Transparent PNG. 128×128 px.",
                "cn": f"{STYLE_BASE_CN}神秘定位針/羅盤玫瑰符號，帶風水方位標記。金色 #E8C547 為主，綠色 #64C878 定位點。東方堪輿風格。透明背景 PNG。128×128 px。"
            },
            {
                "file": "shake.png", "size": "128×128", "purpose": "靈魂搖卦提示",
                "en": f"{STYLE_BASE_EN}A shaking / vibrating motion symbol with I-Ching hexagram lines, suggesting phone shake to divine. Gold #E8C547, purple #A78BFA accent. Motion blur lines. Eastern mystical style. Transparent PNG. 128×128 px.",
                "cn": f"{STYLE_BASE_CN}搖動/震動動態符號，帶易經卦象線條，暗示搖動手機占卜。金色 #E8C547，紫色 #A78BFA 點綴。動態模糊線條。東方神秘風格。透明背景 PNG。128×128 px。"
            },
            {
                "file": "quote-mark.png", "size": "64×64", "purpose": "引經據典裝飾",
                "en": f"A pair of Chinese-style quotation marks 「」in brush calligraphy style, gold #E8C547 ink texture. Traditional brushwork feel, ornamental. Transparent PNG. 64×64 px.",
                "cn": f"中式引號「」毛筆書法風格，金色 #E8C547 墨跡質感。傳統書法韻味，裝飾性。透明背景 PNG。64×64 px。"
            },
            {
                "file": "scroll-decor.png", "size": "寬可拉伸 × 高32px", "purpose": "對話區分隔裝飾",
                "en": f"A horizontal scroll ornament divider line: golden Chinese scroll-end patterns at both sides, thin decorative line in the middle. Gold #E8C547, horizontally stretchable. Transparent PNG. Height 32px, width stretchable.",
                "cn": f"水平書卷裝飾分隔線：兩端金色中式書卷紋飾，中間細裝飾線條。金色 #E8C547，水平可拉伸。透明背景 PNG。高 32px，寬度可拉伸。"
            },
        ]
    },
]

# ═══════════════════════════════════════════════════
# B. PET DATA
# ═══════════════════════════════════════════════════

PETS = [
    # ─── Spring 春 01-06 ───
    {
        "num": "01", "folder": "01-lichun", "season": "spring",
        "solar_term_cn": "立春", "solar_term_en": "Start of Spring (Lichun)",
        "name_cn": "青芽鹿", "name_en": "Verdant Sprout Deer",
        "beast_cn": "鹿", "beast_en": "deer",
        "element_cn": "木", "element_en": "Wood", "element_color": "#80c880",
        "zodiac_cn": "水瓶座", "zodiac_en": "Aquarius",
        "keywords_cn": "春芽鹿角、新生嫩綠、破土而出的生機",
        "keywords_en": "spring bud antlers, newborn fresh green, life breaking through soil",
        "desc_en": "A young deer with spring buds and fresh green leaves growing from its antlers. Soft green aura, new life energy, tiny flower petals floating around.",
        "desc_cn": "鹿角上長出春芽與嫩綠葉片的年輕小鹿。柔和綠色光暈，新生命能量，微小花瓣飄浮。",
    },
    {
        "num": "02", "folder": "02-yushui", "season": "spring",
        "solar_term_cn": "雨水", "solar_term_en": "Rain Water (Yushui)",
        "name_cn": "潤澤蛙", "name_en": "Rain-Blessed Frog",
        "beast_cn": "蛙", "beast_en": "frog",
        "element_cn": "水", "element_en": "Water", "element_color": "#64b4ff",
        "zodiac_cn": "雙魚座", "zodiac_en": "Pisces",
        "keywords_cn": "雨滴環繞、荷葉坐騎、水珠光澤",
        "keywords_en": "raindrops surrounding, lotus leaf mount, water bead luster",
        "desc_en": "A plump mystical frog sitting on a lotus leaf, surrounded by floating raindrops. Water bead luster on its skin, gentle blue-green aura.",
        "desc_cn": "圓潤的神秘蛙坐在荷葉上，周圍浮動雨滴。皮膚帶水珠光澤，柔和藍綠光暈。",
    },
    {
        "num": "03", "folder": "03-jingzhe", "season": "spring",
        "solar_term_cn": "驚蟄", "solar_term_en": "Awakening of Insects (Jingzhe)",
        "name_cn": "雷蟲龍", "name_en": "Thunder Bug Dragon",
        "beast_cn": "龍蟲", "beast_en": "dragon-insect",
        "element_cn": "木", "element_en": "Wood", "element_color": "#80c880",
        "zodiac_cn": "雙魚座", "zodiac_en": "Pisces",
        "keywords_cn": "微型龍形、雷電紋路、破土甦醒",
        "keywords_en": "miniature dragon form, thunder-lightning patterns, awakening from earth",
        "desc_en": "A tiny dragon-like insect creature with lightning bolt patterns on its body. Emerging from cracked earth, electric green energy sparking around it.",
        "desc_cn": "身上帶雷電紋路的微型龍蟲生物。從裂開的土地中甦醒，周圍電光綠色能量閃爍。",
    },
    {
        "num": "04", "folder": "04-chunfen", "season": "spring",
        "solar_term_cn": "春分", "solar_term_en": "Spring Equinox (Chunfen)",
        "name_cn": "衡翼蝶", "name_en": "Equinox Butterfly",
        "beast_cn": "蝴蝶", "beast_en": "butterfly",
        "element_cn": "木", "element_en": "Wood", "element_color": "#80c880",
        "zodiac_cn": "牡羊座", "zodiac_en": "Aries",
        "keywords_cn": "日夜雙翼、陰陽平衡、花粉光點",
        "keywords_en": "day-night dual wings, yin-yang balance, pollen light particles",
        "desc_en": "A mystical butterfly with one wing in daylight gold and the other in moonlight silver — yin-yang balance. Pollen sparkles and light particles drift around it.",
        "desc_cn": "神秘蝴蝶，一翼為日光金色、另一翼為月光銀色 — 陰陽平衡。花粉光點與微粒飄散。",
    },
    {
        "num": "05", "folder": "05-qingming", "season": "spring",
        "solar_term_cn": "清明", "solar_term_en": "Clear and Bright (Qingming)",
        "name_cn": "清風鶴", "name_en": "Pure Wind Crane",
        "beast_cn": "鶴", "beast_en": "crane",
        "element_cn": "木", "element_en": "Wood", "element_color": "#80c880",
        "zodiac_cn": "牡羊座", "zodiac_en": "Aries",
        "keywords_cn": "仙鶴身姿、清澈微風、柳絮飄飛",
        "keywords_en": "immortal crane posture, clear gentle breeze, willow catkins drifting",
        "desc_en": "An elegant immortal crane with pristine white feathers, standing in a gentle breeze. Willow catkins and petals float in the clear spring air around it.",
        "desc_cn": "優雅仙鶴，潔白羽毛，佇立於微風中。柳絮與花瓣在清澈春風中飄飛。",
    },
    {
        "num": "06", "folder": "06-guyu", "season": "spring",
        "solar_term_cn": "穀雨", "solar_term_en": "Grain Rain (Guyu)",
        "name_cn": "穀靈兔", "name_en": "Grain Spirit Rabbit",
        "beast_cn": "兔", "beast_en": "rabbit",
        "element_cn": "土", "element_en": "Earth", "element_color": "#c8a060",
        "zodiac_cn": "金牛座", "zodiac_en": "Taurus",
        "keywords_cn": "穀穗花環、春雨滋潤、豐收祈願",
        "keywords_en": "grain wreath crown, spring rain nourishment, harvest prayer",
        "desc_en": "A gentle rabbit wearing a crown wreath of grain stalks and rice ears. Spring rain droplets nourish the crops around it. Warm earth-tone aura.",
        "desc_cn": "溫柔兔子頭戴穀穗花環。春雨滋潤周圍作物。溫暖土色調光暈。",
    },
    # ─── Summer 夏 07-12 ───
    {
        "num": "07", "folder": "07-lixia", "season": "summer",
        "solar_term_cn": "立夏", "solar_term_en": "Start of Summer (Lixia)",
        "name_cn": "炎蟬精", "name_en": "Flame Cicada Spirit",
        "beast_cn": "蟬", "beast_en": "cicada",
        "element_cn": "火", "element_en": "Fire", "element_color": "#ff6b6b",
        "zodiac_cn": "金牛座", "zodiac_en": "Taurus",
        "keywords_cn": "透明薄翼、初夏暖光、蟬鳴音波",
        "keywords_en": "translucent thin wings, early summer warm light, cicada song sound waves",
        "desc_en": "A large mystical cicada with translucent iridescent wings, glowing with early summer warmth. Visible sound wave rings emanating from its body, golden warm light.",
        "desc_cn": "巨大神秘蟬，透明虹彩薄翼，散發初夏溫暖光芒。身體發出可見的蟬鳴音波環，金色暖光。",
    },
    {
        "num": "08", "folder": "08-xiaoman", "season": "summer",
        "solar_term_cn": "小滿", "solar_term_en": "Grain Buds (Xiaoman)",
        "name_cn": "金穗狐", "name_en": "Golden Grain Fox",
        "beast_cn": "狐", "beast_en": "fox",
        "element_cn": "火", "element_en": "Fire", "element_color": "#ff6b6b",
        "zodiac_cn": "雙子座", "zodiac_en": "Gemini",
        "keywords_cn": "金色毛皮、麥穗尾巴、豐盈飽滿",
        "keywords_en": "golden fur, wheat-ear tail, plump and abundant",
        "desc_en": "A sleek fox with lustrous golden fur. Its fluffy tail transforms into wheat ears and grain stalks. Plump, abundant energy, golden harvest glow.",
        "desc_cn": "光澤金色毛皮的靈狐。蓬鬆尾巴化為麥穗與穀穗。豐盈飽滿的能量，金色豐收光暈。",
    },
    {
        "num": "09", "folder": "09-mangzhong", "season": "summer",
        "solar_term_cn": "芒種", "solar_term_en": "Grain in Ear (Mangzhong)",
        "name_cn": "芒鳳雀", "name_en": "Awn Phoenix Sparrow",
        "beast_cn": "雀鳳", "beast_en": "phoenix sparrow",
        "element_cn": "火", "element_en": "Fire", "element_color": "#ff6b6b",
        "zodiac_cn": "雙子座", "zodiac_en": "Gemini",
        "keywords_cn": "金色羽翼、稻芒光芒、播種希望",
        "keywords_en": "golden feathered wings, rice awn radiance, sowing hope",
        "desc_en": "A small phoenix-like sparrow with brilliant golden feathers tipped with rice awn patterns. Scatters seeds of light as it flies, radiating hope and warmth.",
        "desc_cn": "小型鳳凰般的雀鳥，金色羽毛尖端帶稻芒紋路。飛行時撒下光之種子，散發希望與溫暖。",
    },
    {
        "num": "10", "folder": "10-xiazhi", "season": "summer",
        "solar_term_cn": "夏至", "solar_term_en": "Summer Solstice (Xiazhi)",
        "name_cn": "日輪獅", "name_en": "Solar Lion",
        "beast_cn": "獅", "beast_en": "lion",
        "element_cn": "火", "element_en": "Fire", "element_color": "#ff6b6b",
        "zodiac_cn": "巨蟹座", "zodiac_en": "Cancer",
        "keywords_cn": "太陽鬃毛、正午光環、最長白晝",
        "keywords_en": "sun-ray mane, noon halo, longest daylight",
        "desc_en": "A majestic lion whose mane is made of radiating sun rays and solar flames. A noon halo crowns its head. Peak solar energy, intense golden-orange glow.",
        "desc_cn": "鬃毛由太陽光芒與火焰構成的壯觀獅子。頭頂正午光環。最強太陽能量，強烈金橙光暈。",
    },
    {
        "num": "11", "folder": "11-xiaoshu", "season": "summer",
        "solar_term_cn": "小暑", "solar_term_en": "Minor Heat (Xiaoshu)",
        "name_cn": "螢火靈", "name_en": "Firefly Spirit",
        "beast_cn": "螢火蟲", "beast_en": "firefly",
        "element_cn": "火", "element_en": "Fire", "element_color": "#ff6b6b",
        "zodiac_cn": "巨蟹座", "zodiac_en": "Cancer",
        "keywords_cn": "巨大螢火蟲、夏夜微光、溫暖引路",
        "keywords_en": "giant firefly, summer night glow, warm guiding light",
        "desc_en": "A large mystical firefly spirit with a warm glowing abdomen. Soft amber-gold light trail behind it, summer night atmosphere, gentle guiding beacon.",
        "desc_cn": "巨大神秘螢火蟲靈體，腹部溫暖發光。身後留下柔和琥珀金光軌跡，夏夜氛圍，溫暖引路明燈。",
    },
    {
        "num": "12", "folder": "12-dashu", "season": "summer",
        "solar_term_cn": "大暑", "solar_term_en": "Major Heat (Dashu)",
        "name_cn": "烈陽鷹", "name_en": "Blazing Sun Eagle",
        "beast_cn": "鷹", "beast_en": "eagle",
        "element_cn": "土", "element_en": "Earth", "element_color": "#c8a060",
        "zodiac_cn": "獅子座", "zodiac_en": "Leo",
        "keywords_cn": "烈日雙翼、熱浪氣場、高空俯瞰",
        "keywords_en": "blazing sun wings, heat wave aura, high altitude overview",
        "desc_en": "A powerful eagle with wings of blazing sunlight. Heat wave distortion aura around its body. Soaring at peak altitude under the scorching summer sun.",
        "desc_cn": "雙翼如烈日光芒的強大雄鷹。身體周圍熱浪扭曲氣場。在灼熱夏日高空翱翔。",
    },
    # ─── Autumn 秋 13-18 ───
    {
        "num": "13", "folder": "13-liqiu", "season": "autumn",
        "solar_term_cn": "立秋", "solar_term_en": "Start of Autumn (Liqiu)",
        "name_cn": "金風虎", "name_en": "Golden Wind Tiger",
        "beast_cn": "虎", "beast_en": "tiger",
        "element_cn": "金", "element_en": "Metal", "element_color": "#e8e0c0",
        "zodiac_cn": "獅子座", "zodiac_en": "Leo",
        "keywords_cn": "秋風金紋、落葉環繞、威嚴轉涼",
        "keywords_en": "autumn wind golden stripes, falling leaves swirling, majestic cooling",
        "desc_en": "A regal tiger with golden autumn wind patterns on its fur. Falling leaves swirl around it in a gentle autumn breeze. Majestic and cool atmosphere.",
        "desc_cn": "毛皮上帶秋風金色紋路的威嚴猛虎。落葉在秋風中環繞飄旋。壯嚴清涼氛圍。",
    },
    {
        "num": "14", "folder": "14-chushu", "season": "autumn",
        "solar_term_cn": "處暑", "solar_term_en": "End of Heat (Chushu)",
        "name_cn": "涼蟬仙", "name_en": "Cool Cicada Sage",
        "beast_cn": "蟬", "beast_en": "cicada",
        "element_cn": "金", "element_en": "Metal", "element_color": "#e8e0c0",
        "zodiac_cn": "處女座", "zodiac_en": "Virgo",
        "keywords_cn": "褪色薄翼、秋涼微風、暑氣消散",
        "keywords_en": "faded thin wings, autumn cool breeze, summer heat dissipating",
        "desc_en": "A serene cicada with faded, translucent amber wings. Cool autumn breeze visual effect around it. The summer heat dissolving into gentle coolness.",
        "desc_cn": "寧靜蟬仙，褪色半透明琥珀薄翼。周圍秋涼微風視覺效果。暑氣消散為柔和涼意。",
    },
    {
        "num": "15", "folder": "15-bailu", "season": "autumn",
        "solar_term_cn": "白露", "solar_term_en": "White Dew (Bailu)",
        "name_cn": "露珠蛇", "name_en": "Dewdrop Serpent",
        "beast_cn": "蛇", "beast_en": "snake",
        "element_cn": "金", "element_en": "Metal", "element_color": "#e8e0c0",
        "zodiac_cn": "處女座", "zodiac_en": "Virgo",
        "keywords_cn": "晶瑩鱗片、晨露凝結、月光折射",
        "keywords_en": "crystalline scales, morning dew condensation, moonlight refraction",
        "desc_en": "An elegant serpent with crystalline scales that refract moonlight like morning dew. Dewdrops condensing on its body, silver-white and ice-clear aura.",
        "desc_cn": "優雅蛇靈，晶瑩鱗片如晨露折射月光。身上凝結露珠，銀白冰清光暈。",
    },
    {
        "num": "16", "folder": "16-qiufen", "season": "autumn",
        "solar_term_cn": "秋分", "solar_term_en": "Autumn Equinox (Qiufen)",
        "name_cn": "月衡鶴", "name_en": "Moon Balance Crane",
        "beast_cn": "鶴", "beast_en": "crane",
        "element_cn": "金", "element_en": "Metal", "element_color": "#e8e0c0",
        "zodiac_cn": "天秤座", "zodiac_en": "Libra",
        "keywords_cn": "月光翅膀、天秤光陣、晝夜等分",
        "keywords_en": "moonlight wings, Libra light formation, equal day and night",
        "desc_en": "A graceful crane with wings that glow with moonlight. A Libra scale light formation floats around it, symbolizing the perfect balance of day and night at the equinox.",
        "desc_cn": "優雅鶴仙，雙翼泛月光。周圍天秤光陣浮動，象徵秋分晝夜等分的完美平衡。",
    },
    {
        "num": "17", "folder": "17-hanlu", "season": "autumn",
        "solar_term_cn": "寒露", "solar_term_en": "Cold Dew (Hanlu)",
        "name_cn": "霜菊貓", "name_en": "Frost Chrysanthemum Cat",
        "beast_cn": "貓", "beast_en": "cat",
        "element_cn": "水", "element_en": "Water", "element_color": "#64b4ff",
        "zodiac_cn": "天秤座", "zodiac_en": "Libra",
        "keywords_cn": "菊花冠飾、寒霜毛色、深秋寧靜",
        "keywords_en": "chrysanthemum crown ornament, frost-tinted fur, deep autumn tranquility",
        "desc_en": "A serene cat wearing a chrysanthemum flower crown, its fur tinted with frost-white patterns. Deep autumn tranquility, cold dew droplets on chrysanthemum petals.",
        "desc_cn": "寧靜貓咪頭戴菊花冠飾，毛色帶霜白紋路。深秋寧靜意境，菊瓣上凝結寒露。",
    },
    {
        "num": "18", "folder": "18-shuangjiang", "season": "autumn",
        "solar_term_cn": "霜降", "solar_term_en": "Frost's Descent (Shuangjiang)",
        "name_cn": "霜狼靈", "name_en": "Frost Wolf Spirit",
        "beast_cn": "狼", "beast_en": "wolf",
        "element_cn": "水", "element_en": "Water", "element_color": "#64b4ff",
        "zodiac_cn": "天蠍座", "zodiac_en": "Scorpio",
        "keywords_cn": "銀霜皮毛、冰晶呼吸、孤月嚎叫",
        "keywords_en": "silver frost fur, ice crystal breath, lone moon howl",
        "desc_en": "A lone wolf with silver frost-covered fur, exhaling visible ice crystal breath. Howling at a solitary moon, frost forming on the ground around it.",
        "desc_cn": "銀霜皮毛的孤狼，呼出可見的冰晶吐息。對孤月嚎叫，周圍地面結霜。",
    },
    # ─── Winter 冬 19-24 ───
    {
        "num": "19", "folder": "19-lidong", "season": "winter",
        "solar_term_cn": "立冬", "solar_term_en": "Start of Winter (Lidong)",
        "name_cn": "冬眠熊", "name_en": "Hibernation Bear",
        "beast_cn": "熊", "beast_en": "bear",
        "element_cn": "水", "element_en": "Water", "element_color": "#64b4ff",
        "zodiac_cn": "天蠍座", "zodiac_en": "Scorpio",
        "keywords_cn": "厚實毛皮、冬眠蜷縮、蓄能守護",
        "keywords_en": "thick plush fur, hibernation curl, energy-storing guardian",
        "desc_en": "A cozy bear with thick plush fur, curled in a warm hibernation pose. Storing energy for winter, a protective guardian aura of deep blue and warm amber.",
        "desc_cn": "厚實毛皮的溫暖熊，蜷縮冬眠姿態。為冬天蓄積能量，深藍與暖琥珀的守護光暈。",
    },
    {
        "num": "20", "folder": "20-xiaoxue", "season": "winter",
        "solar_term_cn": "小雪", "solar_term_en": "Minor Snow (Xiaoxue)",
        "name_cn": "雪兔仙", "name_en": "Snow Rabbit Fairy",
        "beast_cn": "兔", "beast_en": "rabbit",
        "element_cn": "水", "element_en": "Water", "element_color": "#64b4ff",
        "zodiac_cn": "射手座", "zodiac_en": "Sagittarius",
        "keywords_cn": "白色長耳、初雪飄落、輕盈跳躍",
        "keywords_en": "white long ears, first snowfall, light graceful leaping",
        "desc_en": "A pure white rabbit with long elegant ears, leaping gracefully through the first snowfall. Delicate snowflakes floating around, light and ethereal winter atmosphere.",
        "desc_cn": "純白長耳兔仙，在初雪中輕盈跳躍。精緻雪花飄落，輕盈空靈的初冬氛圍。",
    },
    {
        "num": "21", "folder": "21-daxue", "season": "winter",
        "solar_term_cn": "大雪", "solar_term_en": "Major Snow (Daxue)",
        "name_cn": "雪鴞靈", "name_en": "Snow Owl Spirit",
        "beast_cn": "貓頭鷹", "beast_en": "snowy owl",
        "element_cn": "水", "element_en": "Water", "element_color": "#64b4ff",
        "zodiac_cn": "射手座", "zodiac_en": "Sagittarius",
        "keywords_cn": "雪白羽毛、暗夜慧眼、風雪中守望",
        "keywords_en": "snow-white feathers, wise eyes in darkness, watching in blizzard",
        "desc_en": "A majestic snowy owl with pure white feathers and piercing wise golden eyes. Perched steadfast in a blizzard, watching over the frozen world. Heavy snowfall.",
        "desc_cn": "雪白羽毛與銳利金色慧眼的壯觀雪鴞。在暴風雪中堅定守望冰封世界。大雪紛飛。",
    },
    {
        "num": "22", "folder": "22-dongzhi", "season": "winter",
        "solar_term_cn": "冬至", "solar_term_en": "Winter Solstice (Dongzhi)",
        "name_cn": "玄冰龍", "name_en": "Dark Ice Dragon",
        "beast_cn": "龍", "beast_en": "ice dragon",
        "element_cn": "水", "element_en": "Water", "element_color": "#64b4ff",
        "zodiac_cn": "摩羯座", "zodiac_en": "Capricorn",
        "keywords_cn": "冰晶龍鱗、極寒吐息、冬至轉陽",
        "keywords_en": "ice crystal dragon scales, extreme cold breath, winter solstice yang return",
        "desc_en": "A powerful ice dragon with crystalline frost scales, exhaling extreme cold breath. Despite the deep winter, a tiny warm golden light at its core hints at the return of yang energy after the solstice.",
        "desc_cn": "冰晶龍鱗的強大冰龍，吐出極寒吐息。雖在深冬，核心處微弱金光暗示冬至後陽氣回歸。",
    },
    {
        "num": "23", "folder": "23-xiaohan", "season": "winter",
        "solar_term_cn": "小寒", "solar_term_en": "Minor Cold (Xiaohan)",
        "name_cn": "寒星鯨", "name_en": "Cold Star Whale",
        "beast_cn": "鯨", "beast_en": "whale",
        "element_cn": "水", "element_en": "Water", "element_color": "#64b4ff",
        "zodiac_cn": "摩羯座", "zodiac_en": "Capricorn",
        "keywords_cn": "星辰鯨身、深海潛行、寒夜星空",
        "keywords_en": "star-studded whale body, deep sea navigation, cold night starry sky",
        "desc_en": "A celestial whale whose body is covered with glowing star constellations. Swimming through a deep cosmic sea under a cold winter starry sky. Aurora-like energy trails.",
        "desc_cn": "身上覆蓋發光星座的星辰鯨。在寒冬星空下的深邃宇宙海中遨遊。極光般的能量軌跡。",
    },
    {
        "num": "24", "folder": "24-dahan", "season": "winter",
        "solar_term_cn": "大寒", "solar_term_en": "Major Cold (Dahan)",
        "name_cn": "極光鳳", "name_en": "Aurora Phoenix",
        "beast_cn": "鳳凰", "beast_en": "phoenix",
        "element_cn": "土", "element_en": "Earth", "element_color": "#c8a060",
        "zodiac_cn": "水瓶座", "zodiac_en": "Aquarius",
        "keywords_cn": "極光羽翼、嚴冬中重生、春之預兆",
        "keywords_en": "aurora borealis wings, rebirth in deep winter, harbinger of spring",
        "desc_en": "A magnificent phoenix with wings made of shimmering aurora borealis colors (green, purple, pink). Reborn in the coldest depths of winter, heralding the coming spring. Warm rebirth energy amidst ice.",
        "desc_cn": "羽翼由極光色彩（綠、紫、粉）構成的壯麗鳳凰。在嚴冬最寒冷處重生，預告春天來臨。冰雪中的溫暖重生能量。",
    },
]

SEASON_COLORS = {
    "spring": {"cn": "嫩綠、粉色、淺藍", "en": "soft green, pink, light blue", "codes": "#7bc96f, #f0a0c0, #a0d8ef"},
    "summer": {"cn": "金色、橙紅、烈焰", "en": "gold, orange-red, flame", "codes": "#e8c547, #ff6b35, #c44040"},
    "autumn": {"cn": "金黃、琥珀、銀白", "en": "gold-yellow, amber, silver", "codes": "#d4a574, #c0a030, #c0c0c0"},
    "winter": {"cn": "冰藍、深紫、極光", "en": "ice blue, deep purple, aurora", "codes": "#64b4ff, #4a2080, #00ffa0"},
}

SEASON_NAME = {"spring": "春", "summer": "夏", "autumn": "秋", "winter": "冬"}

EVO_STAGES = {
    "evo-1": {
        "label_en": "Initial Form", "label_cn": "初始型態",
        "keywords_en": "small, baby-like, simple single-color aura, innocent wide-eyed expression, minimal accessories",
        "keywords_cn": "小型、幼體、簡單單色光暈、天真大眼表情、無裝飾",
    },
    "evo-2": {
        "label_en": "Awakened Form", "label_cn": "覺醒型態",
        "keywords_en": "medium-sized, more detailed features, stronger dual-color aura, mystical accessories and light armor, confident determined expression",
        "keywords_cn": "中型、更精緻特徵、更強雙色光暈、神秘配件與輕甲、自信堅定表情",
    },
    "evo-3": {
        "label_en": "Ultimate Form", "label_cn": "終極型態",
        "keywords_en": "majestic full-size, elaborate divine armor, intense multi-color aura with constellation patterns, regal powerful expression, celestial energy radiating",
        "keywords_cn": "壯觀全尺寸、華麗神聖鎧甲、強烈多色光暈帶星座紋路、威嚴強大表情、天界能量輻射",
    },
}


# ═══════════════════════════════════════════════════
# GENERATOR
# ═══════════════════════════════════════════════════

def generate_md():
    lines = []
    w = lines.append

    # ─── HEADER ───
    w("# 靈犀 App — 完整美工 AI Prompt 表格")
    w("")
    w("> 本文件涵蓋靈犀 App 所有視覺素材的 AI 生圖 Prompt，可直接複製貼上到 ChatGPT / Grok / Midjourney / DALL-E / Stable Diffusion 等 AI 美工工具中使用。")
    w("")
    w("| 類別 | 數量 |")
    w("|------|------|")
    w("| A. Icon 圖標 | 61 張 |")
    w("| B. 靈寵圖片 | 144 張（24 隻 × 6 張） |")
    w("| C. 動畫素材 | 8 組 |")
    w(f"| **合計** | **213 項 Prompt** |")
    w("")
    w("---")
    w("")

    # ─── 統一風格基礎 ───
    w("## 統一設計風格基礎")
    w("")
    w("```")
    w("主色調：金色 #E8C547 + 深黑 #08080F")
    w("輔助色：暖金 #F5E69A / 靈藍 #64B4FF / 靈紫 #A78BFA / 靈綠 #64C878")
    w("風格：東方神秘感、低調奢華、金色光暈")
    w("背景：透明 PNG（除 App Icon 和 Splash 外）")
    w("線條：細緻描邊，帶微光暈效果")
    w("整體感覺：古籍符文 + 現代極簡的融合")
    w("五行色系：金 #e8e0c0 / 木 #80c880 / 水 #64b4ff / 火 #ff6b6b / 土 #c8a060")
    w("```")
    w("")
    w("---")
    w("")

    # ═══════════════════════════════════
    # A. ICON PROMPTS
    # ═══════════════════════════════════
    w("# A. Icon Prompts（61 張）")
    w("")

    total_icons = 0
    for cat in ICON_CATEGORIES:
        w(f"## {cat['title']}")
        w("")
        w(f"**資料夾：** `{cat['folder']}`")
        w("")

        for icon in cat["icons"]:
            total_icons += 1
            w(f"### {total_icons}. `{icon['file']}` — {icon['size']} — {icon['purpose']}")
            w("")
            w("**English Prompt:**")
            w("```")
            w(icon["en"])
            w("```")
            w("")
            w("**中文 Prompt:**")
            w("```")
            w(icon["cn"])
            w("```")
            w("")

        w("---")
        w("")

    # ═══════════════════════════════════
    # B. PET PROMPTS
    # ═══════════════════════════════════
    w("# B. 靈寵 Prompts（24 隻 × 6 張 = 144 張）")
    w("")
    w("## 季節色系參考")
    w("")
    w("| 季節 | 節氣範圍 | 主色調 | 色碼參考 |")
    w("|------|----------|--------|----------|")
    w("| 春 Spring | 01–06 | 嫩綠、粉色、淺藍 | #7bc96f, #f0a0c0, #a0d8ef |")
    w("| 夏 Summer | 07–12 | 金色、橙紅、烈焰 | #e8c547, #ff6b35, #c44040 |")
    w("| 秋 Autumn | 13–18 | 金黃、琥珀、銀白 | #d4a574, #c0a030, #c0c0c0 |")
    w("| 冬 Winter | 19–24 | 冰藍、深紫、極光 | #64b4ff, #4a2080, #00ffa0 |")
    w("")
    w("## 進化階段關鍵字")
    w("")
    w("| 階段 | English Keywords | 中文關鍵字 |")
    w("|------|-----------------|-----------|")
    w(f"| evo-1 初始 | {EVO_STAGES['evo-1']['keywords_en']} | {EVO_STAGES['evo-1']['keywords_cn']} |")
    w(f"| evo-2 覺醒 | {EVO_STAGES['evo-2']['keywords_en']} | {EVO_STAGES['evo-2']['keywords_cn']} |")
    w(f"| evo-3 終極 | {EVO_STAGES['evo-3']['keywords_en']} | {EVO_STAGES['evo-3']['keywords_cn']} |")
    w("")
    w("---")
    w("")

    pet_counter = 0
    for pet in PETS:
        sc = SEASON_COLORS[pet["season"]]
        season_cn = SEASON_NAME[pet["season"]]

        w(f"## B{pet['num']}. {pet['name_cn']} ({pet['name_en']}) — {pet['solar_term_cn']} {pet['solar_term_en']}")
        w("")
        w(f"- **靈獸原型 / Beast:** {pet['beast_cn']} / {pet['beast_en']}")
        w(f"- **五行 / Element:** {pet['element_cn']} ({pet['element_en']}) {pet['element_color']}")
        w(f"- **星座 / Zodiac:** {pet['zodiac_cn']} / {pet['zodiac_en']}")
        w(f"- **季節色系 / Season Palette:** {sc['cn']} ({sc['codes']})")
        w(f"- **設計關鍵字:** {pet['keywords_cn']}")
        w(f"- **Design Keywords:** {pet['keywords_en']}")
        w(f"- **資料夾:** `assets/pets/{pet['folder']}/`")
        w("")

        # --- avatar ---
        pet_counter += 1
        w(f"### {pet_counter}. `avatar.png` — 512×512 — 靈寵頭像")
        w("")
        w("**English Prompt:**")
        w("```")
        w(f"Portrait headshot of a cute mystical {pet['beast_en']} spirit pet named {pet['name_en']}, Chinese fantasy style. "
          f"{pet['desc_en']} "
          f"Inspired by the solar term \"{pet['solar_term_en']}\" and {pet['zodiac_en']} constellation. "
          f"{pet['element_en']} element ({pet['element_color']}) energy. "
          f"Season palette: {sc['en']} ({sc['codes']}). "
          f"Dark background (#08080f), golden sparkle particles, semi-transparent ethereal body. "
          f"Close-up portrait composition, friendly expression. "
          f"High quality game art, PNG transparent background, 512×512 px.")
        w("```")
        w("")
        w("**中文 Prompt:**")
        w("```")
        w(f"可愛神秘的{pet['beast_cn']}靈寵「{pet['name_cn']}」頭像特寫，中國奇幻風格。"
          f"{pet['desc_cn']} "
          f"靈感來自節氣「{pet['solar_term_cn']}」與{pet['zodiac_cn']}。"
          f"{pet['element_cn']}屬性（{pet['element_color']}）能量。"
          f"{season_cn}季色系：{sc['cn']}（{sc['codes']}）。"
          f"深色背景（#08080f），金色粒子閃爍，半透明靈體質感。"
          f"頭像特寫構圖，友善表情。"
          f"高品質遊戲美術，透明背景 PNG，512×512 px。")
        w("```")
        w("")

        # --- full ---
        pet_counter += 1
        w(f"### {pet_counter}. `full.png` — 1024×1024 — 靈寵全身圖")
        w("")
        w("**English Prompt:**")
        w("```")
        w(f"Full body illustration of a cute mystical {pet['beast_en']} spirit pet named {pet['name_en']}, Chinese fantasy chibi style. "
          f"{pet['desc_en']} "
          f"Inspired by \"{pet['solar_term_en']}\" and {pet['zodiac_en']}. "
          f"{pet['element_en']} element ({pet['element_color']}). "
          f"Season palette: {sc['en']} ({sc['codes']}). "
          f"Dark background (#08080f), golden sparkle particles, semi-transparent ethereal body, chibi proportions, mystical floating pose. "
          f"High quality game art, PNG transparent background, 1024×1024 px.")
        w("```")
        w("")
        w("**中文 Prompt:**")
        w("```")
        w(f"可愛神秘{pet['beast_cn']}靈寵「{pet['name_cn']}」全身圖，中國奇幻 Q 版風格。"
          f"{pet['desc_cn']} "
          f"靈感來自「{pet['solar_term_cn']}」與{pet['zodiac_cn']}。"
          f"{pet['element_cn']}屬性（{pet['element_color']}）。"
          f"{season_cn}季色系：{sc['cn']}（{sc['codes']}）。"
          f"深色背景（#08080f），金色粒子閃爍，半透明靈體，Q 版比例，神秘浮空姿態。"
          f"高品質遊戲美術，透明背景 PNG，1024×1024 px。")
        w("```")
        w("")

        # --- evo-1, evo-2, evo-3 ---
        for evo_key in ["evo-1", "evo-2", "evo-3"]:
            evo = EVO_STAGES[evo_key]
            pet_counter += 1
            w(f"### {pet_counter}. `{evo_key}.png` — 1024×1024 — {evo['label_cn']} ({evo['label_en']})")
            w("")
            w("**English Prompt:**")
            w("```")
            w(f"Evolution stage {evo_key[-1]}: {evo['label_en']} of the {pet['name_en']} ({pet['beast_en']} spirit pet), Chinese fantasy style. "
              f"{pet['desc_en']} "
              f"Evolution traits: {evo['keywords_en']}. "
              f"Inspired by \"{pet['solar_term_en']}\" and {pet['zodiac_en']}. "
              f"{pet['element_en']} element ({pet['element_color']}). "
              f"Season palette: {sc['en']} ({sc['codes']}). "
              f"Dark background (#08080f), golden sparkle particles, semi-transparent ethereal body. "
              f"Full body, dynamic pose. "
              f"High quality game art, PNG transparent background, 1024×1024 px.")
            w("```")
            w("")
            w("**中文 Prompt:**")
            w("```")
            w(f"進化階段 {evo_key[-1]}：{pet['name_cn']}（{pet['beast_cn']}靈寵）的{evo['label_cn']}，中國奇幻風格。"
              f"{pet['desc_cn']} "
              f"進化特徵：{evo['keywords_cn']}。"
              f"靈感來自「{pet['solar_term_cn']}」與{pet['zodiac_cn']}。"
              f"{pet['element_cn']}屬性（{pet['element_color']}）。"
              f"{season_cn}季色系：{sc['cn']}（{sc['codes']}）。"
              f"深色背景（#08080f），金色粒子閃爍，半透明靈體。"
              f"全身，動態姿勢。"
              f"高品質遊戲美術，透明背景 PNG，1024×1024 px。")
            w("```")
            w("")

        # --- icon ---
        pet_counter += 1
        w(f"### {pet_counter}. `icon.png` — 128×128 — 靈寵小圖示")
        w("")
        w("**English Prompt:**")
        w("```")
        w(f"Tiny simplified icon of the {pet['name_en']} ({pet['beast_en']} spirit), Chinese fantasy style. "
          f"Recognizable silhouette with key features: {pet['keywords_en']}. "
          f"{pet['element_en']} element color ({pet['element_color']}), gold #E8C547 accent. "
          f"Minimal detail, high contrast, clear at small size. Dark background (#08080f). "
          f"PNG transparent background, 128×128 px.")
        w("```")
        w("")
        w("**中文 Prompt:**")
        w("```")
        w(f"{pet['name_cn']}（{pet['beast_cn']}靈寵）的極簡小圖示，中國奇幻風格。"
          f"可辨識輪廓與關鍵特徵：{pet['keywords_cn']}。"
          f"{pet['element_cn']}屬性色（{pet['element_color']}），金色 #E8C547 點綴。"
          f"極簡細節、高對比、小尺寸清晰。深色背景（#08080f）。"
          f"透明背景 PNG，128×128 px。")
        w("```")
        w("")

        w("---")
        w("")

    # ═══════════════════════════════════
    # C. ANIMATION PROMPTS
    # ═══════════════════════════════════
    w("# C. 動畫素材 Prompts")
    w("")
    w("> 動畫素材以 Lottie JSON 格式交付，以下 Prompt 用於生成動畫的關鍵幀 / 概念設計圖。")
    w("> 資料夾：`assets/pets/animations/`")
    w("")

    animations = [
        {
            "id": "C1", "title": "靈寵召喚光柱動畫",
            "file": "summon-beam.json",
            "en": (
                "Animation concept: A majestic golden light pillar descending from the heavens to the ground. "
                "Stage 1: Dark scene, a tiny golden spark appears at the top. "
                "Stage 2: The spark expands into a full beam of golden light (#E8C547) shooting downward, with swirling golden particles and Bagua symbols rotating around it. "
                "Stage 3: At the base, a bright flash reveals the silhouette of a spirit pet materializing. "
                "Stage 4: The light gradually fades, leaving the spirit pet floating with residual golden sparkles. "
                "Background: deep black #08080F. Duration: ~3 seconds. Style: Eastern mystical summoning ritual, luxurious gold effects. "
                "Lottie JSON format, loop: false."
            ),
            "cn": (
                "動畫概念：壯觀金色光柱從天而降。"
                "階段 1：黑暗場景，頂部出現微小金色光點。"
                "階段 2：光點擴展為完整金色光束（#E8C547）向下射出，周圍金色粒子旋繞、八卦符號旋轉。"
                "階段 3：底部一道亮光閃現，靈寵剪影逐漸現形。"
                "階段 4：光柱漸弱，靈寵浮空，殘餘金色光點。"
                "背景：深黑 #08080F。時長：約 3 秒。風格：東方神秘召喚儀式，奢華金色特效。"
                "Lottie JSON 格式，不循環。"
            ),
        },
        {
            "id": "C2", "title": "進化蛻變動畫",
            "file": "evolution-transform.json",
            "en": (
                "Animation concept: Spirit pet evolution transformation sequence. "
                "Stage 1: The current pet form glows and becomes enveloped in a cocoon of swirling energy. "
                "Stage 2: The energy cocoon pulses and cracks appear, radiating multicolor light (gold #E8C547, element color, constellation patterns). "
                "Stage 3: The cocoon shatters in a burst of light, revealing the evolved form with new armor/accessories and enhanced aura. "
                "Stage 4: Energy particles settle, the evolved pet strikes a powerful pose with its new aura shining. "
                "Background: deep black #08080F. Duration: ~4 seconds. Style: Eastern mystical metamorphosis, divine ascension energy. "
                "Lottie JSON format, loop: false."
            ),
            "cn": (
                "動畫概念：靈寵進化蛻變序列。"
                "階段 1：當前型態靈寵發光，被旋繞能量繭包裹。"
                "階段 2：能量繭脈動出現裂痕，放射多色光芒（金 #E8C547、屬性色、星座紋路）。"
                "階段 3：能量繭爆裂綻放光芒，展現進化後新型態、新鎧甲/配件與增強光暈。"
                "階段 4：能量粒子沉澱，進化後靈寵擺出強力姿態，新光暈閃耀。"
                "背景：深黑 #08080F。時長：約 4 秒。風格：東方神秘蛻變，神聖昇華能量。"
                "Lottie JSON 格式，不循環。"
            ),
        },
        {
            "id": "C3", "title": "餵食互動動畫",
            "file": "interact-feed.json",
            "en": (
                "Animation concept: Spirit pet feeding interaction. "
                "A golden spirit pill (#E8C547) floats toward the pet. The pet opens its mouth and eats the pill. "
                "Golden energy ripples outward from the pet, +EXP number floats up and fades. "
                "The pet does a happy bounce animation with sparkle particles. "
                "Background: deep black #08080F. Duration: ~2 seconds. Style: cute, rewarding, golden glow. "
                "Lottie JSON format, loop: false."
            ),
            "cn": (
                "動畫概念：靈寵餵食互動。"
                "金色靈丹（#E8C547）飄向靈寵。靈寵張口吃下靈丹。"
                "金色能量波紋從靈寵向外擴散，+EXP 數字浮上漸隱。"
                "靈寵開心彈跳動畫，帶光點粒子。"
                "背景：深黑 #08080F。時長：約 2 秒。風格：可愛、有成就感、金色光暈。"
                "Lottie JSON 格式，不循環。"
            ),
        },
        {
            "id": "C4", "title": "玩耍互動動畫",
            "file": "interact-play.json",
            "en": (
                "Animation concept: Spirit pet play interaction. "
                "A glowing spirit pearl bounces around. The pet chases and pounces on it playfully. "
                "Sparkle trail follows the pearl's path. The pet does a playful spin after catching it. "
                "+EXP number floats up. Joy particles burst outward. "
                "Background: deep black #08080F. Duration: ~2.5 seconds. Style: fun, energetic, golden sparkles. "
                "Lottie JSON format, loop: false."
            ),
            "cn": (
                "動畫概念：靈寵玩耍互動。"
                "發光靈珠彈跳。靈寵追逐撲抓，活潑嬉戲。"
                "靈珠路徑留下光點軌跡。靈寵抓到後開心旋轉。"
                "+EXP 數字浮上。喜悅粒子向外綻放。"
                "背景：深黑 #08080F。時長：約 2.5 秒。風格：有趣、充滿活力、金色光點。"
                "Lottie JSON 格式，不循環。"
            ),
        },
        {
            "id": "C5", "title": "冥想互動動畫",
            "file": "interact-meditate.json",
            "en": (
                "Animation concept: Spirit pet meditation interaction. "
                "The pet closes its eyes and floats into a seated meditation pose. "
                "A serene golden lotus appears beneath it. Concentric energy rings (#E8C547) pulse outward slowly. "
                "Gentle golden particles rise upward like incense smoke. +EXP floats up. "
                "Background: deep black #08080F. Duration: ~3 seconds. Style: zen, peaceful, sacred golden glow. "
                "Lottie JSON format, loop: false."
            ),
            "cn": (
                "動畫概念：靈寵冥想互動。"
                "靈寵閉眼浮空進入打坐姿態。"
                "身下出現寧靜金色蓮花。同心能量環（#E8C547）緩慢向外脈動。"
                "柔和金色粒子如香煙般上升。+EXP 浮上。"
                "背景：深黑 #08080F。時長：約 3 秒。風格：禪意、寧靜、神聖金色光暈。"
                "Lottie JSON 格式，不循環。"
            ),
        },
        {
            "id": "C6", "title": "升級粒子特效",
            "file": "levelup-particles.json",
            "en": (
                "Animation concept: Level up celebration particle effect. "
                "A burst of golden star particles (#FFD700, #E8C547) explode outward from center in a radial pattern. "
                "Ascending golden streaks and confetti-like sparkles. A brief golden flash at the center. "
                "Numbers and stars float upward and fade. "
                "Background: transparent (overlay effect). Duration: ~2 seconds. Style: celebratory, luxurious gold explosion. "
                "Lottie JSON format, loop: false."
            ),
            "cn": (
                "動畫概念：升級慶祝粒子特效。"
                "金色星形粒子（#FFD700, #E8C547）從中心向外放射爆發。"
                "上升金色光條與碎紙般的光點。中心短暫金色閃光。"
                "數字與星星向上飄浮漸隱。"
                "背景：透明（疊加效果）。時長：約 2 秒。風格：慶祝感、奢華金色爆發。"
                "Lottie JSON 格式，不循環。"
            ),
        },
        {
            "id": "C7", "title": "靈寵待機呼吸動畫",
            "file": "idle-breathing.json",
            "en": (
                "Animation concept: Spirit pet idle breathing loop. "
                "The pet gently bobs up and down in a floating pose. Subtle aura pulsing in sync with breathing rhythm. "
                "Tiny golden particles drift lazily around the pet. Occasional eye blink. "
                "Background: transparent (overlay). Duration: ~4 seconds. Style: peaceful, ambient, gentle loop. "
                "Lottie JSON format, loop: true."
            ),
            "cn": (
                "動畫概念：靈寵待機呼吸循環。"
                "靈寵在浮空姿態中輕微上下起伏。光暈隨呼吸節奏微弱脈動。"
                "微小金色粒子緩慢飄浮。偶爾眨眼。"
                "背景：透明（疊加效果）。時長：約 4 秒。風格：寧靜、環境氛圍、柔和循環。"
                "Lottie JSON 格式，循環播放。"
            ),
        },
        {
            "id": "C8", "title": "EXP 進度條填充動畫",
            "file": "exp-bar-fill-anim.json",
            "en": (
                "Animation concept: Experience bar filling animation. "
                "The gold progress bar (#E8C547 gradient) smoothly extends from left to right. "
                "A bright shine sweeps across the bar surface as it fills. "
                "At completion, a brief golden flash and sparkle burst at the end point. "
                "Background: transparent. Duration: ~1.5 seconds. Style: satisfying progress, gold metallic shine. "
                "Lottie JSON format, loop: false."
            ),
            "cn": (
                "動畫概念：經驗值進度條填充動畫。"
                "金色進度條（#E8C547 漸層）從左到右平滑延伸。"
                "填充時表面有明亮光澤掃過。"
                "填滿時末端短暫金色閃光與光點爆發。"
                "背景：透明。時長：約 1.5 秒。風格：滿足感進度、金色金屬光澤。"
                "Lottie JSON 格式，不循環。"
            ),
        },
    ]

    for anim in animations:
        w(f"## {anim['id']}. {anim['title']}")
        w("")
        w(f"**檔案 / File:** `animations/{anim['file']}`")
        w("")
        w("**English Prompt:**")
        w("```")
        w(anim["en"])
        w("```")
        w("")
        w("**中文 Prompt:**")
        w("```")
        w(anim["cn"])
        w("```")
        w("")
        w("---")
        w("")

    # ═══════════════════════════════════
    # SUMMARY / CHECKLIST
    # ═══════════════════════════════════
    w("# 驗證清單 / Verification Checklist")
    w("")
    w("## A. Icon 圖標（61 張）")
    w("")
    w("| # | 分類 | 數量 | 狀態 |")
    w("|---|------|------|------|")
    w("| A1 | App Icon | 7 張 | ✅ |")
    w("| A2 | Splash Screen | 3 張 | ✅ |")
    w("| A3 | Tab Bar | 4 張 | ✅ |")
    w("| A4 | Action Bar 養成 | 3 張 | ✅ |")
    w("| A5 | Action Bar 能力 | 3 張 | ✅ |")
    w("| A6 | Onboarding | 5 張 | ✅ |")
    w("| A7 | Chat 類型標記 | 7 張 | ✅ |")
    w("| A8 | 升級 Modal | 4 張 | ✅ |")
    w("| A9 | Profile 設定 | 8 張 | ✅ |")
    w("| A10 | 狀態相關 | 9 張 | ✅ |")
    w("| A11 | 其他/通用 | 8 張 | ✅ |")
    w(f"| | **小計** | **{total_icons} 張** | ✅ |")
    w("")
    w("## B. 靈寵圖片（144 張）")
    w("")
    w("| # | 節氣 | 靈寵名 | avatar | full | evo-1 | evo-2 | evo-3 | icon |")
    w("|---|------|--------|--------|------|-------|-------|-------|------|")
    for pet in PETS:
        w(f"| {pet['num']} | {pet['solar_term_cn']} | {pet['name_cn']} | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |")
    w(f"| | | **小計** | 24 | 24 | 24 | 24 | 24 | 24 = **{len(PETS)*6} 張** |")
    w("")
    w("## C. 動畫素材（8 組）")
    w("")
    w("| # | 動畫名稱 | 狀態 |")
    w("|---|----------|------|")
    for anim in animations:
        w(f"| {anim['id']} | {anim['title']} | ✅ |")
    w("")
    w("---")
    w("")
    w(f"> **總計：{total_icons} + {len(PETS)*6} + {len(animations)} = {total_icons + len(PETS)*6 + len(animations)} 項 Prompt，全部包含中英文版本。**")
    w("")
    w("> Generated for 靈犀 App (LingXi) — 有泉科技有限公司")

    return "\n".join(lines)


if __name__ == "__main__":
    content = generate_md()

    # Ensure output directory exists
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        f.write(content)

    # Count stats
    icon_count = sum(len(cat["icons"]) for cat in ICON_CATEGORIES)
    pet_count = len(PETS) * 6
    anim_count = 8
    total = icon_count + pet_count + anim_count

    print(f"✓ ART_PROMPTS.md generated successfully!")
    print(f"  Output: {OUTPUT_PATH}")
    print(f"  Icons:      {icon_count} prompts")
    print(f"  Pets:       {pet_count} prompts ({len(PETS)} pets × 6 images)")
    print(f"  Animations: {anim_count} prompts")
    print(f"  Total:      {total} prompts (all with EN + CN)")
    print(f"  File size:  {len(content):,} characters")
