"""
Add `colors` block to all 7 locale JSON files (zh-TW canonical → localized values).

Inserts the `colors` block immediately after the `directions` block (preserving
existing key order).  Idempotent: re-running rewrites with the same content.
"""
from __future__ import annotations

import json
import os
from collections import OrderedDict

LOCALES_DIR = os.path.join(os.path.dirname(__file__), "locales")

COLORS = {
    "zh-TW": {
        "white": "白色", "gold": "金色", "silver": "銀色",
        "green": "綠色", "azure": "青色", "emerald": "翠色",
        "black": "黑色", "blue": "藍色", "deepblue": "深藍",
        "red": "紅色", "orange": "橙色", "purple": "紫色",
        "yellow": "黃色", "brown": "棕色", "beige": "米色",
    },
    "zh-CN": {
        "white": "白色", "gold": "金色", "silver": "银色",
        "green": "绿色", "azure": "青色", "emerald": "翠色",
        "black": "黑色", "blue": "蓝色", "deepblue": "深蓝",
        "red": "红色", "orange": "橙色", "purple": "紫色",
        "yellow": "黄色", "brown": "棕色", "beige": "米色",
    },
    "en": {
        "white": "White", "gold": "Gold", "silver": "Silver",
        "green": "Green", "azure": "Azure", "emerald": "Emerald",
        "black": "Black", "blue": "Blue", "deepblue": "Deep Blue",
        "red": "Red", "orange": "Orange", "purple": "Purple",
        "yellow": "Yellow", "brown": "Brown", "beige": "Beige",
    },
    "ja": {
        "white": "白", "gold": "金", "silver": "銀",
        "green": "緑", "azure": "青", "emerald": "翡翠",
        "black": "黒", "blue": "藍", "deepblue": "深い藍",
        "red": "紅", "orange": "橙", "purple": "紫",
        "yellow": "黄", "brown": "茶", "beige": "生成り",
    },
    "es": {
        "white": "Blanco", "gold": "Oro", "silver": "Plata",
        "green": "Verde", "azure": "Cian", "emerald": "Esmeralda",
        "black": "Negro", "blue": "Azul", "deepblue": "Azul Profundo",
        "red": "Rojo", "orange": "Naranja", "purple": "Púrpura",
        "yellow": "Amarillo", "brown": "Marrón", "beige": "Beige",
    },
    "fr": {
        "white": "Blanc", "gold": "Or", "silver": "Argent",
        "green": "Vert", "azure": "Azur", "emerald": "Émeraude",
        "black": "Noir", "blue": "Bleu", "deepblue": "Bleu Profond",
        "red": "Rouge", "orange": "Orange", "purple": "Violet",
        "yellow": "Jaune", "brown": "Brun", "beige": "Beige",
    },
    "de": {
        "white": "Weiß", "gold": "Gold", "silver": "Silber",
        "green": "Grün", "azure": "Cyan", "emerald": "Smaragd",
        "black": "Schwarz", "blue": "Blau", "deepblue": "Tiefblau",
        "red": "Rot", "orange": "Orange", "purple": "Violett",
        "yellow": "Gelb", "brown": "Braun", "beige": "Beige",
    },
}

LOCALE_FILES = {
    "zh-TW": "zh-TW.json",
    "zh-CN": "zh-CN.json",
    "en":    "en.json",
    "ja":    "ja.json",
    "es":    "es.json",
    "fr":    "fr.json",
    "de":    "de.json",
}


def insert_after(d: "OrderedDict[str, object]", anchor_key: str, new_key: str, new_value: object) -> "OrderedDict[str, object]":
    """Return a new OrderedDict with `new_key:new_value` placed right after `anchor_key`."""
    out: "OrderedDict[str, object]" = OrderedDict()
    inserted = False
    for k, v in d.items():
        if k == new_key:
            # Skip stale copy; we'll reinsert in correct position.
            continue
        out[k] = v
        if k == anchor_key and not inserted:
            out[new_key] = new_value
            inserted = True
    if not inserted:
        # Anchor not found — append at end.
        out[new_key] = new_value
    return out


def main() -> None:
    for locale, fname in LOCALE_FILES.items():
        path = os.path.join(LOCALES_DIR, fname)
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f, object_pairs_hook=OrderedDict)

        if "directions" not in data:
            print(f"[WARN] {fname}: no `directions` block; appending colors at end.")
            data["colors"] = COLORS[locale]
        else:
            data = insert_after(data, "directions", "colors", COLORS[locale])

        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            f.write("\n")
        print(f"[OK] {fname}: added/refreshed {len(COLORS[locale])} color keys.")


if __name__ == "__main__":
    main()
