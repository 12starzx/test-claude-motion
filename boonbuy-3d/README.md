# BoonBuy — plaque 3D en trois plans

Plaque blanche laquée aux angles arrondis, rendue avec Three.js sous trois angles
calqués sur le cadre de référence : **face**, **trois-quarts** (38°) et **profil** (82°).

Contenu de la plaque :

- en-tête : tuile du logo BoonBuy et « BOON BUY » en relief orange (Nunito Black extrudé) ;
- trois stickers détourés à liseré blanc, légèrement en relief : la photo lifestyle,
  la veste et le pantalon (posé sur la veste).

## Livrables générés

| Fichier | Contenu |
| --- | --- |
| `out/planche-3-plans-fond-vert.png` | Planche 1536 × 1024, même disposition que la référence |
| `out/planche-3-plans-fond-vert-HD.png` | Même planche en 3072 × 2048 |
| `out/plans/<n>-<vue>-fond-vert.png` | Chaque plan seul, 2048 × 2048, fond vert `#00FF00` |
| `out/plans/<n>-<vue>-transparent.png` | Chaque plan seul, 2048 × 2048, fond transparent |

Les trois plans séparés partagent la même caméra et la même échelle :
ils s'enchaînent sans recadrage dans un montage.

## Régénérer

Prérequis : Node 22, Python 3, Chromium + Playwright.

```bash
npm install
pip install "rembg[cpu]" opencv-python-headless

# Visuels sources attendus dans assets/source/ :
#   logo-boonbuy.png, veste-bresil.webp, pantalon-nike.jpg, photo-lifestyle.jpg
python3 scripts/cutouts.py        # détourage (rembg, modèle isnet-general-use)
python3 scripts/prepare_assets.py # logo net + textures et contours des stickers
node scripts/build_text.mjs       # tracés vectoriels de « BOON BUY »
node scripts/render.mjs 2400      # rendu WebGL des trois angles (fond transparent)
python3 scripts/compose.py        # planche + plans séparés
```

Les réglages (angles, mise en page, couleurs, éclairage) sont regroupés en tête de
`public/scene.js`. Les visuels sources et les rendus sont exclus du dépôt
(`.gitignore`), car ils contiennent des photos personnelles.
