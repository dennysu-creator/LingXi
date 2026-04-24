# Cleanup Checklist

**執行時機**: V4 polish 完成且驗收通過後再跑。
**目的**: 刪除 repo 根目錄那一堆累積的 PPTX 生成腳本、過時文件、舊 mockup。

---

## 🔴 可以直接砍(確定沒用)

### 根目錄 generate/gen 腳本(全部砍)

```
LingXi/gen_icon_ppt.py
LingXi/gen_pet_ppt.py
LingXi/gen_ppt.py
LingXi/generate_art_prompts.py
LingXi/generate_asset_catalog.py
LingXi/generate_asset_html.py
LingXi/generate_pet_assets.py
LingXi/generate_ppt.py
LingXi/generate_ui_mockup.py
LingXi/generate_ui_ppt_20260316.py
LingXi/generate-screenshots.py
```

這些全部是一次性產 PPTX / 截圖的腳本,產出物都在 repo 根目錄或 `docs/`,腳本本身留著沒用。

### 根目錄累積的 PPTX(砍,已經過時)

```
LingXi/LingXi_Asset_Catalog.pptx
LingXi/LingXi_Icon_Spec.pptx
LingXi/LingXi_Pet_Spec.pptx
LingXi/LingXi_UI_操作畫面_20260316.pptx
LingXi/LingXi_UI_操作說明_v1.0.0_20260314.pptx
LingXi/LingXi_UI_Flow.pptx
LingXi/LingXi_UI_Logic_2026-03-19.pptx
LingXi/LingXi_UI_Restructure_Mockup.pptx
```

**注意**: `docs/` 底下那幾份 PPTX 先留著,那是正式簡報。

### docs/ 下的 generate_*.py(砍)

```
LingXi/docs/generate_latest_ui_status_ppt.py
LingXi/docs/generate_pptx.py
LingXi/docs/generate_ui_breakdown.py
LingXi/docs/generate_ui_mockup.py
LingXi/scripts/gen_ui_ppt.py
```

### 舊 prototype / mockup 檔

```
LingXi/lingxi-full-prototype.jsx       # v1 時代的單檔 prototype,已被拆成 components
LingXi/ART_PROMPTS.html                # 產物,md 版本就夠了
LingXi/ui-design/index.html            # 舊 mockup
LingXi/ui-design/update_styles.py
LingXi/ui-design/export_transparent_pngs.py
```

### 過時 handoff 文件(看情況)

```
LingXi/BRIEF_FOR_CLAUDE_DESIGN.md      # v1 時代給 design claude 的 brief,已不準
LingXi/DESIGN_HANDOFF.md               # 舊版 handoff,被這個 v4 pack 取代
```

→ 如果要保留歷史記錄,建議把兩份搬到 `docs/archive/`。

---

## 🟡 審慎處理(可能還在用)

這些先 grep 一下有沒有 import,確定沒人用再砍:

```bash
cd LingXi
grep -r "AuthKey_94KH67S8Q3" --include="*.ts" --include="*.tsx"
# 如果完全沒引用 → LingXi/AuthKey_94KH67S8Q3.p8 可能是 Apple push key,留著別砍

grep -r "privacy-policy\|terms-of-service" --include="*.ts" --include="*.tsx"
# 如果 in-app 沒連到 → 這兩個 html 只是上架用,留著

grep -r "images.ts" assets/
# 確認 assets/images.ts 真的被 import
```

### 可能的冗餘

- `LingXi/DEV-PROGRESS.md` — 看最後修改日期,如果 > 1 個月沒更新,砍或搬 archive
- `LingXi/screenshots/playwright-onboarding-step3.png` — 孤兒截圖,其他 step 都沒有,砍
- `LingXi/appstore-description.txt` — 搬到 `docs/appstore/` 底下比較合理

---

## 🟢 保留(不要動)

```
LingXi/app/                 全部保留
LingXi/components/          全部保留
LingXi/services/            全部保留
LingXi/stores/              全部保留
LingXi/config/              全部保留
LingXi/i18n/                全部保留
LingXi/types/               全部保留
LingXi/assets/              全部保留(icons / pets / ui-v2 都在用)
LingXi/server/              全部保留
LingXi/functions/           全部保留
LingXi/CLAUDE.md            保留(專案層級 instructions)
LingXi/README.md            保留
LingXi/UI_FLOW.md           保留(是規格而非產物)
LingXi/docs/UI_AND_LOGIC.md 保留
LingXi/docs/LingXi_*.pptx   保留(正式簡報,不同於根目錄那些草稿)
LingXi/docs/appstore/       保留
LingXi/docs/LingXi_Presentation.md  保留
```

---

## 建議執行順序

```bash
cd LingXi

# 1. 先開 branch
git checkout -b cleanup/2026-04

# 2. 砍紅色區段(可以一口氣)
rm gen_*.py generate_*.py generate-screenshots.py
rm LingXi_*.pptx
rm lingxi-full-prototype.jsx ART_PROMPTS.html
rm docs/generate_*.py scripts/gen_ui_ppt.py
rm ui-design/index.html ui-design/update_styles.py ui-design/export_transparent_pngs.py

# 3. 歸檔舊 handoff(而非直接砍)
mkdir -p docs/archive
mv BRIEF_FOR_CLAUDE_DESIGN.md DESIGN_HANDOFF.md docs/archive/

# 4. 跑 app 確認沒壞
npx expo start --clear

# 5. PR:
git add -A
git commit -m "chore: cleanup legacy PPTX scripts and mockups (V4 handoff)"
```

---

## 最後檢查

- [ ] `npx expo start --clear` 可以正常跑
- [ ] Home / Bazi / Pet / Features / Plans 五個 tab 都能開
- [ ] `git log` 看得到刪除紀錄(方便之後想找舊檔時 revert)
- [ ] `.gitignore` 有沒有需要補(避免之後又生一堆 pptx 進 repo)
  建議加:
  ```
  *.pptx
  !docs/**/*.pptx
  generate_*.py
  gen_*.py
  ```
