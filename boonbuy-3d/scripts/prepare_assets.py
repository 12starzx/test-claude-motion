"""Préparation des textures de la plaque BoonBuy.

1. Logo : la source ne fait que 225 px. On l'agrandit puis on « re-vectorise »
   chaque aplat (palette fermée de quatre couleurs) pour obtenir des bords nets.
2. Stickers : chaque détourage (veste, pantalon, personne) devient un sticker
   « die-cut » à liseré blanc. On exporte la texture et le contour (polygone)
   qui sert à extruder le sticker en 3D.

Entrées : assets/source/logo-boonbuy.png, assets/cutouts/*.png (scripts/cutouts.py)
Sorties : public/textures/*.png et public/data/stickers.json
"""
import json
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets" / "source"
CUT = ROOT / "assets" / "cutouts"
TEX = ROOT / "public" / "textures"
DATA = ROOT / "public" / "data"
TEX.mkdir(parents=True, exist_ok=True)
DATA.mkdir(parents=True, exist_ok=True)


# ---------------------------------------------------------------- logo
def build_logo(size=1600):
    palette = np.array(
        [
            (255, 204, 154),  # pêche (fond de la tuile)
            (255, 255, 255),  # blanc (sac avant)
            (255, 144, 0),  # orange (sac arrière, B)
            (128, 251, 244),  # cyan (sac intermédiaire)
        ],
        dtype=np.float32,
    )
    src = Image.open(SRC / "logo-boonbuy.png").convert("RGB")
    arr = np.asarray(src).astype(np.float32)
    # Les coins noirs sont hors de la tuile arrondie : on les remplace par le fond.
    black = arr.sum(axis=2) < 60
    arr[black] = palette[0]
    # Bande périphérique : uniquement du fond (supprime les pixels de transition noir/pêche).
    band = 10
    arr[:band], arr[-band:], arr[:, :band], arr[:, -band:] = (palette[0],) * 4
    big = Image.fromarray(arr.astype(np.uint8)).resize((size * 2, size * 2), Image.BICUBIC)
    big = np.asarray(big).astype(np.float32)
    dist = ((big[:, :, None, :] - palette[None, None, :, :]) ** 2).sum(axis=3)
    labels = dist.argmin(axis=2).astype(np.uint8)
    # Lissage des contours : filtre médian sur la carte de labels.
    labels = cv2.medianBlur(labels, 9)
    out = palette[labels].astype(np.uint8)
    logo = Image.fromarray(out).resize((size, size), Image.LANCZOS)
    logo.save(TEX / "logo.png")
    print("logo.png", logo.size)


# ---------------------------------------------------------------- stickers
def fill_small_holes(alpha, max_area):
    """Bouche les trous intérieurs du masque (ex. étiquette du pantalon)."""
    mask = (alpha > 127).astype(np.uint8)
    inv = 1 - mask
    n, lab, stats, _ = cv2.connectedComponentsWithStats(inv, connectivity=4)
    h, w = mask.shape
    for i in range(1, n):
        x, y, bw, bh, area = stats[i]
        touches_border = x == 0 or y == 0 or x + bw >= w or y + bh >= h
        if not touches_border and area <= max_area:
            alpha[lab == i] = 255
    return alpha


def build_sticker(name, target_h, border_ratio, hole_area=0, white=(250, 250, 250)):
    im = Image.open(CUT / f"{name}.png").convert("RGBA")
    scale = target_h / im.height
    im = im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS)
    rgba = np.asarray(im).copy()
    if hole_area:
        rgba[:, :, 3] = fill_small_holes(rgba[:, :, 3], hole_area)

    border = max(6, round(max(im.size) * border_ratio))
    pad = border + 8
    h, w = rgba.shape[:2]
    canvas = np.zeros((h + 2 * pad, w + 2 * pad, 4), dtype=np.uint8)
    canvas[pad : pad + h, pad : pad + w] = rgba

    # Masque du sticker : dilatation circulaire + lissage pour un liseré régulier.
    obj = (canvas[:, :, 3] > 96).astype(np.uint8) * 255
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * border + 1, 2 * border + 1))
    sticker = cv2.dilate(obj, k)
    sticker = cv2.GaussianBlur(sticker, (0, 0), border * 0.45)
    sticker = (sticker > 127).astype(np.uint8) * 255

    contours, _ = cv2.findContours(sticker, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    contour = max(contours, key=cv2.contourArea)
    sticker = np.zeros_like(sticker)
    cv2.drawContours(sticker, [contour], -1, 255, thickness=cv2.FILLED)
    poly = cv2.approxPolyDP(contour, 1.2, True)[:, 0, :]

    # Texture : liseré blanc + visuel détouré par-dessus.
    base = Image.new("RGBA", (canvas.shape[1], canvas.shape[0]), (*white, 0))
    base.putalpha(Image.fromarray(sticker))
    base_rgb = Image.new("RGBA", base.size, (*white, 255))
    base_rgb.alpha_composite(Image.fromarray(canvas))
    tex = Image.new("RGBA", base.size, (*white, 255))
    tex.paste(base_rgb, (0, 0))
    tex.putalpha(Image.fromarray(sticker).filter(ImageFilter.GaussianBlur(0.6)))
    tex.save(TEX / f"sticker-{name}.png")

    H, W = sticker.shape
    pts = [[round(float(x) / W, 5), round(1 - float(y) / H, 5)] for x, y in poly]
    print(f"sticker-{name}.png", tex.size, len(pts), "points")
    return {"texture": f"textures/sticker-{name}.png", "aspect": W / H, "outline": pts}


if __name__ == "__main__":
    build_logo()
    stickers = {
        "veste": build_sticker("veste", 1500, 0.022),
        "pantalon": build_sticker("pantalon", 1500, 0.026),
        "personne": build_sticker("personne", 2000, 0.03),
    }
    (DATA / "stickers.json").write_text(json.dumps(stickers))
    print("stickers.json")
