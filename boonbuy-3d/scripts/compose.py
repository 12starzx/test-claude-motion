"""Assemble les rendus (out/raw/*.png, fond transparent) en livrables.

- out/planche-3-plans-fond-vert.png      1536 × 1024, disposition calquée sur le cadre de référence
- out/planche-3-plans-fond-vert-HD.png   3072 × 2048
- out/plans/<n>-<vue>-fond-vert.png      2048 × 2048, même caméra et même échelle pour les trois plans
- out/plans/<n>-<vue>-transparent.png    idem, fond alpha (pour le montage)
"""
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "out" / "raw"
OUT = ROOT / "out"
PLANS = OUT / "plans"
PLANS.mkdir(parents=True, exist_ok=True)

GREEN = (0, 255, 0, 255)
VIEWS = [("front", "1-face"), ("three-quarter", "2-trois-quarts"), ("side", "3-profil")]
# Boîtes englobantes mesurées sur le cadre de référence (1536 × 1024) : x0, y0, x1, y1.
REFERENCE_BOXES = {
    "front": (30, 160, 685, 812),
    "three-quarter": (725, 140, 1230, 840),
    "side": (1310, 130, 1480, 840),
}


def resize(im, size):
    """Redimensionnement en alpha prémultiplié : pas de liseré sombre sur les bords."""
    return im.convert("RGBa").resize(size, Image.LANCZOS).convert("RGBA")


def on_green(im):
    bg = Image.new("RGBA", im.size, GREEN)
    bg.alpha_composite(im)
    return bg.convert("RGB")


def alpha_bbox(im):
    a = np.asarray(im.getchannel("A"))
    ys, xs = np.where(a > 8)
    return xs.min(), ys.min(), xs.max() + 1, ys.max() + 1


def sheet(scale):
    W, H = 1536 * scale, 1024 * scale
    canvas = Image.new("RGBA", (W, H), GREEN)
    for view, _ in VIEWS:
        im = Image.open(RAW / f"{view}.png").convert("RGBA")
        im = im.crop(alpha_bbox(im))
        x0, y0, x1, y1 = (v * scale for v in REFERENCE_BOXES[view])
        target_h = y1 - y0
        w = round(im.width * target_h / im.height)
        im = resize(im, (w, target_h))
        cx = (x0 + x1) // 2
        canvas.alpha_composite(im, (cx - w // 2, y0))
    return canvas.convert("RGB")


if __name__ == "__main__":
    for view, name in VIEWS:
        im = resize(Image.open(RAW / f"{view}.png").convert("RGBA"), (2048, 2048))
        im.save(PLANS / f"{name}-transparent.png", optimize=True)
        on_green(im).save(PLANS / f"{name}-fond-vert.png", optimize=True)
        print(f"plans/{name}-*.png")
    sheet(1).save(OUT / "planche-3-plans-fond-vert.png", optimize=True)
    sheet(2).save(OUT / "planche-3-plans-fond-vert-HD.png", optimize=True)
    print("planche-3-plans-fond-vert(.png, -HD.png)")
