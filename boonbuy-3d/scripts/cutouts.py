"""Détourage des visuels produits et de la photo lifestyle (rembg, modèle isnet-general-use).

On récupère uniquement le masque, on bouche les petits trous intérieurs
(ex. étiquette du pantalon), puis on l'applique sur les pixels d'origine.
Sortie : assets/cutouts/{veste,pantalon,personne}.png
"""
import sys
from pathlib import Path

import cv2
import numpy as np
from PIL import Image
from rembg import new_session, remove

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets" / "source"
OUT = ROOT / "assets" / "cutouts"
OUT.mkdir(parents=True, exist_ok=True)


def fill_small_holes(alpha, max_area):
    mask = (alpha > 127).astype(np.uint8)
    n, lab, stats, _ = cv2.connectedComponentsWithStats(1 - mask, connectivity=4)
    h, w = mask.shape
    for i in range(1, n):
        x, y, bw, bh, area = stats[i]
        if x > 0 and y > 0 and x + bw < w and y + bh < h and area <= max_area:
            alpha[lab == i] = 255
    return alpha


model = sys.argv[1] if len(sys.argv) > 1 else "isnet-general-use"
session = new_session(model)
jobs = {
    # source : (sortie, aire max des trous à boucher en px)
    "veste-bresil.webp": ("veste.png", 0),
    "pantalon-nike.jpg": ("pantalon.png", 6000),
    "photo-lifestyle.jpg": ("personne.png", 0),
}
for src, (dst, holes) in jobs.items():
    im = Image.open(SRC / src).convert("RGB")
    mask = np.asarray(remove(im, session=session, only_mask=True, post_process_mask=True)).copy()
    if holes:
        mask = fill_small_holes(mask, holes)
    cut = im.copy()
    cut.putalpha(Image.fromarray(mask))
    cut = cut.crop(Image.fromarray(mask).point(lambda a: 255 if a > 12 else 0).getbbox())
    cut.save(OUT / dst)
    print(dst, cut.size)
