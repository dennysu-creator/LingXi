"""
用 PIL 直接繪製透明 PNG UI 元件
輸出到 App assets/ui-v2/
"""
import sys
import math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

OUT = Path("C:/Dev/LingXi/assets/ui-v2")

def save(img, path):
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(str(path), "PNG")
    print(f"  [OK] {path.name} ({img.width}x{img.height}, {path.stat().st_size//1024} KB)")

def draw_ring(size, color, ring_r, stroke_w, opacity=160):
    """畫透明背景的圓環"""
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    cx, cy = size // 2, size // 2
    r, g, b = int(color[1:3],16), int(color[3:5],16), int(color[5:7],16)
    bbox = (cx - ring_r, cy - ring_r, cx + ring_r, cy + ring_r)
    draw.ellipse(bbox, outline=(r, g, b, opacity), width=stroke_w)
    return img

def draw_glow_ring(size, color, ring_r, stroke_w):
    """圓環 + 外圈光暈"""
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    r, g, b = int(color[1:3],16), int(color[3:5],16), int(color[5:7],16)
    # 光暈層
    glow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    cx, cy = size // 2, size // 2
    gd.ellipse((cx-ring_r, cy-ring_r, cx+ring_r, cy+ring_r), outline=(r, g, b, 200), width=stroke_w+4)
    glow = glow.filter(ImageFilter.GaussianBlur(6))
    img = Image.alpha_composite(img, glow)
    # 銳利環
    sharp = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    sd = ImageDraw.Draw(sharp)
    sd.ellipse((cx-ring_r, cy-ring_r, cx+ring_r, cy+ring_r), outline=(r, g, b, 160), width=stroke_w)
    img = Image.alpha_composite(img, sharp)
    # 內環
    inner = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    id = ImageDraw.Draw(inner)
    ir = ring_r - 8
    id.ellipse((cx-ir, cy-ir, cx+ir, cy+ir), outline=(r, g, b, 70), width=1)
    img = Image.alpha_composite(img, inner)
    return img

def draw_radial_aura(size, color, peak_alpha=100):
    """放射狀光暈（中心亮，邊緣透明）"""
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    r, g, b = int(color[1:3],16), int(color[3:5],16), int(color[5:7],16)
    cx, cy = size // 2, size // 2
    max_r = size // 2
    for i in range(max_r, 0, -1):
        alpha = int(peak_alpha * (1 - (i / max_r) ** 1.5))
        if alpha <= 0:
            continue
        layer = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        d = ImageDraw.Draw(layer)
        d.ellipse((cx-i, cy-i, cx+i, cy+i), fill=(r, g, b, alpha))
        img = Image.alpha_composite(img, layer)
    return img

def draw_sparkle(size):
    """四角星閃爍"""
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    cx, cy = size // 2, size // 2
    s = size // 2 - 2
    # 外圈光暈
    glow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    pts = [(cx, cy-s), (cx+3, cy), (cx, cy+s), (cx-3, cy)]
    gd.polygon(pts, fill=(255, 215, 0, 200))
    pts2 = [(cx-s, cy), (cx, cy-3), (cx+s, cy), (cx, cy+3)]
    gd.polygon(pts2, fill=(255, 215, 0, 200))
    glow = glow.filter(ImageFilter.GaussianBlur(2))
    img = Image.alpha_composite(img, glow)
    # 銳利星
    sharp = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    sd = ImageDraw.Draw(sharp)
    s2 = s - 3
    pts = [(cx, cy-s2), (cx+2, cy), (cx, cy+s2), (cx-2, cy)]
    sd.polygon(pts, fill=(255, 215, 0, 255))
    pts2 = [(cx-s2, cy), (cx, cy-2), (cx+s2, cy), (cx, cy+2)]
    sd.polygon(pts2, fill=(255, 215, 0, 255))
    img = Image.alpha_composite(img, sharp)
    return img

def add_dots(img, positions, color, radius=3, alpha=180):
    """加裝飾光點"""
    r, g, b = int(color[1:3],16), int(color[3:5],16), int(color[5:7],16)
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    for x, y in positions:
        d.ellipse((x-radius, y-radius, x+radius, y+radius), fill=(r, g, b, alpha))
    glow = layer.filter(ImageFilter.GaussianBlur(2))
    img = Image.alpha_composite(img, glow)
    img = Image.alpha_composite(img, layer)
    return img

# ═══════════════════════════════════════
print("=== Avatar Frames ===")

# Normal frame
frame = draw_ring(256, "#E8C547", 118, 3, 150)
inner = draw_ring(256, "#E8C547", 112, 1, 60)
frame = Image.alpha_composite(frame, inner)
save(frame, OUT / "pet-avatar/avatar-frame.png")

# Eye frame
eye_frame = draw_glow_ring(320, "#FFC107", 148, 3)
eye_frame = add_dots(eye_frame, [(160,8),(260,40),(300,120),(280,240),(160,312),(40,260),(20,140),(60,40)], "#FFC107", 3, 200)
save(eye_frame, OUT / "pet-avatar/frame-eye.png")

# Heart frame
heart_frame = draw_glow_ring(320, "#4ADE80", 148, 3)
# Compass ticks
tick = Image.new("RGBA", (320, 320), (0, 0, 0, 0))
td = ImageDraw.Draw(tick)
for angle in [0, 45, 90, 135, 180, 225, 270, 315]:
    rad = math.radians(angle)
    x1 = 160 + 150 * math.sin(rad)
    y1 = 160 - 150 * math.cos(rad)
    x2 = 160 + 140 * math.sin(rad)
    y2 = 160 - 140 * math.cos(rad)
    w = 2 if angle % 90 == 0 else 1
    td.line([(x1,y1),(x2,y2)], fill=(74,222,128,200), width=w)
heart_frame = Image.alpha_composite(heart_frame, tick)
save(heart_frame, OUT / "pet-avatar/frame-heart.png")

# Pearl frame
pearl_frame = draw_glow_ring(320, "#A78BFA", 148, 3)
save(pearl_frame, OUT / "pet-avatar/frame-pearl.png")

# Eye symbol
eye_sym = Image.new("RGBA", (96, 96), (0, 0, 0, 0))
d = ImageDraw.Draw(eye_sym)
d.ellipse((16, 26, 80, 70), outline=(255,193,7,200), width=3)
d.ellipse((38, 38, 58, 58), outline=(255,193,7,180), width=2)
d.ellipse((44, 44, 52, 52), fill=(255,193,7,200))
glow = eye_sym.filter(ImageFilter.GaussianBlur(3))
eye_sym = Image.alpha_composite(glow, eye_sym)
save(eye_sym, OUT / "pet-avatar/eye-symbol.png")

# Float shadow
shadow = Image.new("RGBA", (128, 32), (0, 0, 0, 0))
sd = ImageDraw.Draw(shadow)
sd.ellipse((8, 4, 120, 28), fill=(0, 0, 0, 60))
shadow = shadow.filter(ImageFilter.GaussianBlur(4))
save(shadow, OUT / "pet-avatar/float-shadow.png")

# ═══════════════════════════════════════
print("\n=== Aura Effects ===")

for name, color, alpha in [("gold-aura", "#FFC107", 90), ("green-aura", "#4ADE80", 80), ("purple-aura", "#A78BFA", 80)]:
    aura = draw_radial_aura(384, color, alpha)
    save(aura, OUT / f"effects/{name}.png")

# Sparkle
sparkle = draw_sparkle(32)
save(sparkle, OUT / "effects/sparkle-particle.png")

# Compass needle
needle = Image.new("RGBA", (64, 192), (0, 0, 0, 0))
nd = ImageDraw.Draw(needle)
nd.polygon([(32, 8), (24, 96), (32, 100), (40, 96)], fill=(232, 197, 71, 230))
nd.polygon([(32, 184), (24, 96), (32, 92), (40, 96)], fill=(100, 100, 100, 130))
nd.ellipse((27, 91, 37, 101), fill=(232, 197, 71, 255))
save(needle, OUT / "effects/compass-needle.png")

print("\n=== All transparent PNGs exported! ===")
