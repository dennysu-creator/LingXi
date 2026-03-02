# 靈犀 App — Icon 美工規格書

交給 AI 美工（Midjourney / DALL-E / Stable Diffusion）製作時的完整指引。

---

## 統一設計風格

```
主色調：金色 #E8C547 + 深黑 #08080F
輔助色：暖金 #F5E69A / 靈藍 #64B4FF / 靈紫 #A78BFA / 靈綠 #64C878
風格：東方神秘感、低調奢華、金色光暈
背景：透明 PNG（除 App Icon 和 Splash 外）
線條：細緻描邊，帶微光暈效果
整體感覺：像古籍符文 + 現代極簡的融合
```

---

## 一、App Icon（應用程式圖標）

**資料夾：** `assets/icons/app/`

| 檔名 | 尺寸 | 用途 |
|-------|------|------|
| `icon-1024.png` | 1024×1024 | App Store / Google Play 上架 |
| `icon-512.png` | 512×512 | Android adaptive icon |
| `icon-192.png` | 192×192 | Android launcher |
| `icon-180.png` | 180×180 | iOS @3x |
| `icon-120.png` | 120×120 | iOS @2x |
| `icon-76.png` | 76×76 | iPad |
| `icon-foreground.png` | 1024×1024 | Android adaptive 前景（透明背景） |

**設計描述：**
```
圓角方形底（iOS 自動裁切）
深黑 #08080F 背景
中央：一枚金色靈犀角/水晶球，散發金色光暈
靈犀角周圍有微弱的八卦紋路環繞
整體感覺：神秘、精緻、有辨識度
不要文字，純圖形
```

---

## 二、Splash Screen（啟動畫面）

**資料夾：** `assets/icons/splash/`

| 檔名 | 尺寸 | 用途 |
|-------|------|------|
| `splash.png` | 1284×2778 | iPhone 14 Pro Max（基準） |
| `splash-tablet.png` | 2048×2732 | iPad Pro |
| `splash-logo.png` | 512×512 | 置中 Logo（透明背景） |

**設計描述：**
```
全屏深黑 #08080F 背景
中央：靈犀 Logo（金色靈犀角/水晶球）
Logo 下方：「靈犀」兩字（毛筆書法風，金色 #E8C547）
底部微弱金色粒子散佈效果
整體感覺：沉穩大氣、有儀式感
```

---

## 三、Tab Bar 圖標

**資料夾：** `assets/icons/tab-bar/`

| 檔名 | 內容 | 說明 |
|-------|------|------|
| `tab-pet.png` | 靈寵 Tab | 水晶球/靈犀角 符號 |
| `tab-pet-active.png` | 靈寵 Tab（選中） | 金色發光版 |
| `tab-profile.png` | 我的 Tab | 齒輪/設定 符號 |
| `tab-profile-active.png` | 我的 Tab（選中） | 金色發光版 |

**規格：**
```
尺寸：96×96 px（@3x），同時提供 64×64（@2x）、32×32（@1x）
背景：透明
未選中：暗金色 #88807050（半透明）
選中：金色 #E8C547，帶微光暈
線條風格：細線描邊，東方符文感
```

---

## 四、Action Bar — 養成互動

**資料夾：** `assets/icons/action-bar/nurture/`

| 檔名 | 內容 | 觸發功能 |
|-------|------|----------|
| `feed.png` | 餵食 | 靈寵餵食 +50 EXP |
| `play.png` | 玩耍 | 靈寵玩耍 +30 EXP |
| `meditate.png` | 冥想 | 靈寵冥想 +20 EXP |

**設計描述：**
```
feed：一枚金色靈丹/仙果，散發暖光
play：一顆發光的靈珠/水晶球（玩耍意象）
meditate：一朵蓮花 or 打坐剪影，帶光環

尺寸：128×128 px
背景：透明
配色：主體金色 #E8C547，陰影用深金 #A08030
風格：帶微光暈的精緻圖標
```

---

## 五、Action Bar — 靈寵能力

**資料夾：** `assets/icons/action-bar/ability/`

| 檔名 | 內容 | 觸發功能 |
|-------|------|----------|
| `eye.png` | 靈眼 | 面相分析（Claude Vision） |
| `heart.png` | 靈心 | GPS 風水羅盤 |
| `soul.png` | 靈魂 | 64 卦占卜 |

**設計描述：**
```
eye（靈眼）：一隻豎立的靈眼/天眼，瞳孔發藍光 #64B4FF
             像古籍中的「天目」符號
             周圍有微弱的面相五官紋路

heart（靈心）：一個羅盤/指南針，帶八卦底紋
              中心點發綠光 #64C878
              有方位刻度感

soul（靈魂）：一盞靈魂燈籠/古燈，發紫光 #A78BFA
             燈籠上刻有卦象線條
             周圍有搖曳的靈火

尺寸：128×128 px
背景：透明
各自有專屬色系但整體風格統一
```

---

## 六、Onboarding 引導圖

**資料夾：** `assets/icons/onboarding/`

| 檔名 | 步驟 | 內容 |
|-------|------|------|
| `step0-language.png` | Step 0 | 語言選擇 |
| `step1-welcome.png` | Step 1 | 歡迎畫面 |
| `step2-name.png` | Step 2 | 輸入姓名 |
| `step3-birth.png` | Step 3 | 出生資料 |
| `step4-summon.png` | Step 4 | 靈寵召喚 |

**設計描述：**
```
step0：地球儀 + 多語言符號（漢字/ABC/あ），金色調
step1：靈犀 Logo 大圖 + 光暈粒子效果
step2：一支毛筆書寫符號（東方感）
step3：一面星象盤/命盤輪盤（天干地支刻度）
step4：靈寵降臨光柱（金色光柱從天而降，剪影靈獸）

尺寸：512×512 px
背景：透明
風格：每張都是精緻插圖，金色主調
```

---

## 七、Chat 對話類型標記

**資料夾：** `assets/icons/chat-types/`

| 檔名 | 對話類型 | 內容 |
|-------|----------|------|
| `fortune.png` | 每日運勢 | 五角星/命盤小圖 |
| `outfit.png` | 穿搭建議 | 衣架/布料符號 |
| `face.png` | 面相結果 | 臉部輪廓線 |
| `fengshui.png` | 風水結果 | 羅盤小圖 |
| `divination.png` | 占卜結果 | 卦象符號（☰） |
| `levelup.png` | 升級通知 | 上升箭頭+星星 |
| `evolve.png` | 進化通知 | 蛻變/展翅符號 |

**設計描述：**
```
用途：對話氣泡左上角的類型小標記
尺寸：64×64 px
背景：透明
配色：各類型有專屬色調
  fortune → 金色 #E8C547
  outfit  → 暖橙 #E89C47
  face    → 靈藍 #64B4FF
  fengshui → 靈綠 #64C878
  divination → 靈紫 #A78BFA
  levelup → 亮金 #FFD700
  evolve  → 彩虹漸層
風格：精緻小圖標，辨識度高
```

---

## 八、升級 Modal 圖標

**資料夾：** `assets/icons/upgrade/`

| 檔名 | 內容 | 用途 |
|-------|------|------|
| `member-badge.png` | 會員徽章 | ⭐ 會員版標示 |
| `supreme-badge.png` | 至尊徽章 | 👑 至尊版標示 |
| `quota-empty.png` | 額度用盡 | Modal 頂部提示圖 |
| `lock.png` | 鎖定符號 | 功能鎖定提示 |

**設計描述：**
```
member-badge：一枚金色星章，帶「靈」字或星形
              配色金色 #E8C547
supreme-badge：一枚紫金皇冠章，更華麗
               配色紫金漸層 #A78BFA → #E8C547
quota-empty：一個空的沙漏/靈力瓶（暗淡狀態）
lock：一把古風鎖，帶金色鑰匙孔

尺寸：256×256 px
背景：透明
```

---

## 九、Profile 設定頁圖標

**資料夾：** `assets/icons/profile/`

| 檔名 | 內容 | 對應設定項 |
|-------|------|-----------|
| `notification.png` | 推播鈴鐺 | 推播設定 |
| `privacy.png` | 盾牌/隱私 | 隱私權政策 |
| `terms.png` | 書卷/合約 | 服務條款 |
| `about.png` | 資訊 i | 關於靈犀 |
| `logout.png` | 登出門 | 登出 |
| `subscription.png` | 皇冠/星章 | 訂閱管理 |
| `destiny.png` | 命盤輪 | 命盤資料 |
| `language.png` | 地球 | 語言設定 |

**設計描述：**
```
尺寸：64×64 px
背景：透明
配色：暗金 #88807080 為主（低調）
風格：細線描邊，東方符文感
每個圖標都有古風韻味（例如鈴鐺是古鐘、書卷是竹簡感）
```

---

## 十、狀態相關圖標

**資料夾：** `assets/icons/status/`

| 檔名 | 內容 | 用途 |
|-------|------|------|
| `exp-bar-fill.png` | EXP 進度條填充 | 可做 9-patch 拉伸 |
| `exp-bar-bg.png` | EXP 進度條底圖 | 可做 9-patch 拉伸 |
| `star-filled.png` | 實心星（進化） | 進化階段指示 |
| `star-empty.png` | 空心星（進化） | 進化階段指示 |
| `element-wood.png` | 木 五行標記 | 靈寵屬性 |
| `element-fire.png` | 火 五行標記 | 靈寵屬性 |
| `element-earth.png` | 土 五行標記 | 靈寵屬性 |
| `element-metal.png` | 金 五行標記 | 靈寵屬性 |
| `element-water.png` | 水 五行標記 | 靈寵屬性 |

**設計描述：**
```
EXP 進度條：
  fill → 金色漸層橫條，帶光澤感
  bg   → 深灰半透明底條

進化星星：
  filled → 金色五角星，帶光暈
  empty  → 暗色描邊五角星

五行標記：
  wood  → 綠色 #4CAF50，嫩芽/樹木符號
  fire  → 紅橙 #FF5722，火焰符號
  earth → 土黃 #FFC107，山形符號
  metal → 銀白 #B0BEC5，金屬/劍形符號
  water → 靛藍 #2196F3，水波符號

尺寸：五行 64×64 / 星星 48×48 / 進度條 高 24px 寬可拉伸
背景：透明
```

---

## 十一、其他/通用圖標

**資料夾：** `assets/icons/misc/`

| 檔名 | 內容 | 用途 |
|-------|------|------|
| `share.png` | 分享符號 | 對話分享按鈕 |
| `retry.png` | 重試/再來 | 再搖一卦 |
| `close.png` | 關閉 X | Modal/Overlay 關閉 |
| `camera.png` | 相機 | 靈眼拍照觸發 |
| `gps.png` | 定位 | 靈心 GPS 定位 |
| `shake.png` | 搖動 | 靈魂搖卦提示 |
| `quote-mark.png` | 引號「」 | 引經據典裝飾 |
| `scroll-decor.png` | 書卷裝飾線 | 對話區分隔裝飾 |

**設計描述：**
```
尺寸：64×64 px（close/share/retry）
      128×128 px（camera/gps/shake）
背景：透明
配色：金色系 #E8C547
quote-mark：古風書法引號，帶毛筆質感
scroll-decor：橫向書卷紋飾線條（寬度可拉伸，高 32px）
```

---

## AI 美工生圖提示詞範本

給 AI 生圖時可參考以下 prompt 模板：

### 英文版（Midjourney / DALL-E）
```
Icon design for a mystical Chinese fortune-telling app.
Style: dark luxury, Eastern mysticism, gold (#E8C547) on black (#08080F).
Gold glow effects, subtle aura, fine line details.
[具體物件描述]
Transparent PNG background, centered composition.
Clean vector-style icon, high contrast, app-ready.
```

### 中文版（對照）
```
東方神秘風格 App 圖標設計。
主色金色 #E8C547，深黑背景 #08080F。
帶金色光暈、微光效果、精緻描邊。
[具體物件描述]
透明背景 PNG，置中構圖。
乾淨向量風格，高對比，可直接用於 App。
```

---

## 圖檔交付格式

```
格式：PNG（透明背景）
色彩：sRGB
解析度：依各表格指定尺寸
命名：全小寫，連字號分隔（如 tab-pet-active.png）
品質：無壓縮或極輕壓縮，保持清晰度
```

---

## 總數量統計

| 分類 | 數量 |
|------|------|
| App Icon | 7 張 |
| Splash | 3 張 |
| Tab Bar | 4 張（2 組 × 2 狀態） |
| Action Bar 養成 | 3 張 |
| Action Bar 能力 | 3 張 |
| Onboarding | 5 張 |
| Chat 類型標記 | 7 張 |
| 升級 Modal | 4 張 |
| Profile 設定 | 8 張 |
| 狀態相關 | 9 張 |
| 其他/通用 | 8 張 |
| **合計** | **61 張** |

（不含 24 隻靈寵的圖檔，靈寵規格見 `assets/pets/README.md`）
