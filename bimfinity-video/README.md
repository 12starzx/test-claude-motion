# BIMfinity · « Le copilote en action »

Vidéo de présentation de BIMfinity (32 s), produite avec Remotion (React + TypeScript).
Un propriétaire pose une question d'arbitrage à la console BIMfinity ; la plateforme
croise ses sources et révèle une décision claire.

Deux compositions partagent exactement les mêmes scènes :

| Composition   | Format      | Cadence | Durée                 |
| ------------- | ----------- | ------- | --------------------- |
| `Master-16x9` | 1920 x 1080 | 30 i/s  | 960 images (32 s)     |
| `Social-9x16` | 1080 x 1920 | 30 i/s  | 960 images (32 s)     |

## Démarrage

```console
npm install
npm run dev          # Remotion Studio : prévisualisation et édition des textes
```

## Rendu

```console
npx remotion render Master-16x9 bimfinity-16x9.mp4
npx remotion render Social-9x16 bimfinity-9x16.mp4
```

Raccourcis équivalents (sortie dans `out/`) : `npm run render:16x9`, `npm run render:9x16`,
`npm run render:all`.

Le rendu est en H.264 (CRF 16, images intermédiaires JPEG qualité 95), réglé dans
`remotion.config.ts`.

## Arborescence

```text
bimfinity-video/
├── public/
│   ├── logo.svg                    ← à déposer (placeholder automatique sinon)
│   └── audio/                      ← bande-son (voir plus bas)
├── scripts/
│   └── generate-placeholder-audio.mjs
├── src/
│   ├── index.ts                    ← enregistrement de Root
│   ├── Root.tsx                    ← les deux compositions
│   ├── theme.ts                    ← couleurs, polices, timings, ressorts, mises en page
│   ├── fonts.ts                    ← Space Grotesk + Inter (@remotion/google-fonts)
│   ├── schema.ts                   ← textes éditables (Zod) et valeurs par défaut
│   ├── compositions/
│   │   ├── BimfinityVideo.tsx      ← montage des six scènes (partagé)
│   │   ├── Master16x9.tsx
│   │   └── Social9x16.tsx
│   ├── scenes/
│   │   ├── Scene1ColdOpen.tsx      ← 0 à 4 s
│   │   ├── Scene2Query.tsx         ← 4 à 9 s
│   │   ├── Scene3Processing.tsx    ← 9 à 13 s
│   │   ├── Scene4Reveal.tsx        ← 13 à 23 s
│   │   ├── Scene5Value.tsx         ← 23 à 27 s
│   │   └── Scene6Outro.tsx         ← 27 à 32 s
│   ├── components/
│   │   ├── background/             ← shader GLSL, fallback CSS, grain, timeline du fond
│   │   ├── console/                ← console « copilote de décision »
│   │   └── ui/                     ← cartes glass, mot clé, icônes, graphique, logo
│   ├── audio/
│   │   ├── soundDesign.ts          ← fichiers, volumes, calages
│   │   └── Soundtrack.tsx          ← câblage <Audio> sur la timeline
│   └── lib/                        ← typographie, ajustement du texte, animation, assets
└── remotion.config.ts
```

## Modifier les textes

**Sans toucher au code** : `npm run dev`, choisir une composition, ouvrir le panneau
**Props** à droite. Chaque texte y est éditable, validé en direct, puis « Save » pour
l'enregistrer comme valeur par défaut.

**Dans le code** : `src/schema.ts`, objet `defaultBimfinityProps`.

Conventions :

- le mot clé d'un titre s'écrit entre astérisques : `*Décider* plus vite…` ;
- la typographie française est appliquée automatiquement : saisissez des espaces
  normales, les espaces insécables avant `: ; ! ?`, les guillemets `« »` et
  l'apostrophe typographique `’` sont posés au rendu ;
- le titre de la scène 5 passe à la ligne après chaque virgule ;
- les mots du sous-titre de la scène 3 sont séparés par `·`.

Garde-fous intégrés au schéma (le Studio et le rendu refusent le texte) :

- aucun chiffre ni symbole monétaire ou de pourcentage à l'écran ;
- aucun tiret cadratin.

Si un texte modifié est plus long, sa taille de police s'ajuste automatiquement pour
ne jamais déborder de son cadre, dans les deux formats.

## Modifier les couleurs, le rythme, la mise en page

Tout est dans `src/theme.ts` :

- `colors` : palette de marque (le shader et le fallback CSS la lisent aussi) ;
- `keyword` : dégradé et lueur du mot clé ;
- `glass` : fond, flou, bordure et ombres des cartes ;
- `background` : moteur du fond (`"auto"` ou `"css"`), résolution du shader, grain ;
- `timings` : début et durée de chaque scène, chorégraphies internes (en images) ;
- `springs` / `stagger` : ressorts et décalages d'animation ;
- `layouts.landscape` / `layouts.portrait` : positions et tailles par format.

## Logo

Déposez le logo dans `public/logo.svg`. Il est importé tel quel, jamais redessiné.
S'il est absent, un placeholder neutre (monogramme + nom) s'affiche à sa place.
Si votre fichier ne contient que le symbole, passez `logoIncludesName` à `false`
dans les props : le nom sera composé à côté.

## Bande-son

Les fichiers sont lus dans `public/audio` :

| Fichier          | Rôle                                         | Calage                          |
| ---------------- | -------------------------------------------- | ------------------------------- |
| `ambient.mp3`    | nappe ambiante tech                          | toute la durée, fondu in / out  |
| `type-tick.wav`  | tick de frappe                               | chaque caractère (scène 2)      |
| `riser.mp3`      | montée                                       | scène 3 (9 à 13 s)              |
| `whoosh.wav`     | souffle de révélation                        | culmine à 13 s                  |
| `boom.wav`       | impact grave                                 | 13 s                            |
| `ui-tick.wav`    | tick d'interface                             | apparition de chaque carte      |
| `resolve.mp3`    | résolution douce                             | 27 s                            |

Les fichiers livrés sont des **placeholders synthétisés** par
`npm run audio:placeholders` (aucun échantillon externe, donc libres de droits). Pour
la version finale, remplacez-les par votre sound design sous les mêmes noms, ou
changez les chemins et les volumes dans `src/audio/soundDesign.ts`.

**Un fichier absent n'est jamais une erreur** : la piste correspondante est ignorée
et le rendu se poursuit (vidéo muette si le dossier est vide).

## Fond animé et robustesse

Le fond est un mesh gradient GLSL (`@remotion/three`), piloté par l'image courante :
le rendu est déterministe. Avant de monter le canvas, un pré-vol vérifie que WebGL est
disponible et que le shader compile ; sinon, un fallback CSS (dégradés radial et
conique animés, flou, bloom) prend le relais avec les mêmes couleurs. Une
`ErrorBoundary` sert de filet de sécurité supplémentaire.

- Moteur WebGL : `angle` (réglé dans `remotion.config.ts`). Sur un serveur Linux sans
  GPU, ajoutez `--gl=swangle` à la commande de rendu.
- Pour un rendu sans WebGL (le plus rapide) : `background.renderer = "css"` dans
  `src/theme.ts`.

## Points d'attention

- **Polices** : Space Grotesk et Inter sont chargées depuis Google Fonts au moment du
  rendu ; la machine de rendu doit donc avoir accès à Internet.
- **Licence Remotion** : Remotion est gratuit pour les structures de 3 personnes au
  plus ; au-delà, une licence entreprise est requise
  ([conditions](https://www.remotion.dev/license)).
- **Zones de sécurité 9:16** : les textes et cartes restent hors des zones couvertes
  par l'interface de TikTok, Instagram Reels et YouTube Shorts.
