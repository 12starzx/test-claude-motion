# BoonBuy — plaque 3D en trois plans

Plaque blanche laquée aux angles arrondis, rendue avec Three.js sous trois angles
calqués sur le cadre de référence : **face**, **trois-quarts** (38°) et **profil** (82°).

La plaque (le « cadre ») reste blanche ; sa face porte une affiche :

- en fond, la photo lifestyle recadrée sur le sujet, arrière-plan flouté façon
  mode portrait et assombri vers le bas pour la lisibilité du titre ;
- « BOON / BUY » en gros sur deux lignes, en relief orange (Nunito Black extrudé) ;
- sur le côté droit, la veste et le pantalon en stickers détourés à liseré blanc ;
- en haut à gauche, la tuile du logo BoonBuy.

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
python3 scripts/prepare_assets.py # logo net, fond photo flouté, textures et contours des stickers
node scripts/build_text.mjs "BOON|BUY"  # tracés vectoriels du titre (une ligne par segment)
node scripts/render.mjs 2400      # rendu WebGL des trois angles (fond transparent)
python3 scripts/compose.py        # planche + plans séparés
```

Les réglages (angles, mise en page, couleurs, éclairage) sont regroupés en tête de
`public/scene.js`. Les visuels sources et les rendus sont exclus du dépôt
(`.gitignore`), car ils contiennent des photos personnelles.
