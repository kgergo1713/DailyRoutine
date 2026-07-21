"""Renders public/app-icon.svg (a rounded square + clock ring + wedge + dot)
to PNG at the sizes required by manifest.webmanifest and apple-touch-icon.

The SVG has no gradients/text, so it's cheaply reproduced with Pillow instead
of pulling in a native SVG rasterizer (npm registry access is proxy-blocked
in this environment). Re-run after changing public/app-icon.svg:
    python scripts/build-app-icons.py
"""
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"

BG = "#2d6a4f"
CREAM = "#fdf6ec"
ORANGE = "#f4a261"

SUPERSAMPLE = 4
BASE = 512 * SUPERSAMPLE


def render(size: int) -> Image.Image:
    scale = size / 512
    img = Image.new("RGBA", (BASE, BASE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    s = SUPERSAMPLE

    # Background: rounded rect, rx=96
    draw.rounded_rectangle([0, 0, 512 * s, 512 * s], radius=96 * s, fill=BG)

    # Ring: circle r=150 centered at 256,256, stroke width 36
    cx, cy, r, w = 256 * s, 256 * s, 150 * s, 36 * s
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], outline=CREAM, width=w)

    # Wedge: pie slice from -90deg to -30deg, radius 150
    draw.pieslice([cx - r, cy - r, cx + r, cy + r], -90, -30, fill=ORANGE)

    # Center dot: r=26
    r2 = 26 * s
    draw.ellipse([cx - r2, cy - r2, cx + r2, cy + r2], fill=CREAM)

    return img.resize((size, size), Image.LANCZOS)


for size in (512, 192, 180):
    out = PUBLIC / f"app-icon-{size}.png"
    render(size).save(out)
    print(f"wrote {out}")
