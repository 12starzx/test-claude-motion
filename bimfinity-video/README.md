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
`remotion.config.ts`. Pour un export audio seul, ProRes ou GIF, ajoutez `--crf=0` à la
commande (option ignorée par ces formats, mais nécessaire pour neutraliser le CRF global).

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

Trois façons de faire, sans toucher aux scènes :

1. **Dans le Studio** : `npm run dev`, choisir une composition, ouvrir le panneau
   **Props** à droite. Chaque texte y est éditable et validé en direct ; le rendu se
   lance ensuite depuis le bouton **Render** du Studio. (Les valeurs par défaut étant
   partagées par les deux formats dans `src/schema.ts`, le bouton « Save » du Studio
   ne peut pas les réécrire : utilisez l'option 3 pour un changement durable.)
2. **En ligne de commande** : décrire les textes dans un fichier JSON (même structure
   que `defaultBimfinityProps`) puis
   `npx remotion render Master-16x9 bimfinity-16x9.mp4 --props=textes.json`.
3. **Durablement** : modifier l'objet `defaultBimfinityProps` dans `src/schema.ts`.

Conventions :

- dans les titres, le mot clé s'écrit entre astérisques et s'affiche en bleu :
  `*Décider* plus vite…`. Champs concernés : `reveal.recommendation`,
  `reveal.benefits[].text`, `value.title`, `outro.tagline` (les autres champs refusent
  l'astérisque) ;
- la typographie française est appliquée automatiquement : saisissez des espaces
  normales et des guillemets droits ; les espaces insécables avant `: ; ! ?`, les
  guillemets `« »` et l'apostrophe typographique `’` sont posés au rendu ;
- le titre de la scène 5 passe à la ligne après chaque virgule ;
- les mots du sous-titre de la scène 3 sont séparés par `·`.

Garde-fous du schéma, vérifiés dans le Studio **et** au lancement de chaque rendu
(un texte non conforme interrompt le rendu avec un message explicite) :

- aucun chiffre ni symbole monétaire ou de pourcentage à l'écran ;
- aucun tiret cadratin ;
- une longueur maximale par champ.

Si un texte modifié est plus long, sa taille de police s'ajuste automatiquement à son
cadre, dans les deux formats, dans la limite des tailles minimales définies dans
`theme.ts` (un avertissement s'affiche dans la console si ce n'est plus possible).

## Modifier les couleurs, le rythme, la mise en page

Tout est dans `src/theme.ts` :

- `colors` : palette de marque (le shader et le fallback CSS la lisent aussi) ;
- `keyword` : dégradé et lueur du mot clé ;
- `glass` : fond, flou, bordure et ombres des cartes ;
- `background` : moteur du fond (`"auto"` ou `"css"`), résolution du shader, grain ;
- `SCENE_DURATIONS` : durée de chaque scène ; les débuts de scène et la durée totale
  (960 images) en sont déduits automatiquement ;
- `timings` : chevauchement des transitions et chorégraphies internes (en images) ;
- `springs` / `stagger` : ressorts et décalages d'apparition entre éléments ;
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
conique animés, flou, bloom) prend le relais avec les mêmes couleurs, et le canvas
WebGL n'est jamais monté. Une `ErrorBoundary` sert de filet de sécurité pour les
erreurs survenant après la création du canvas.

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
- **Zones de sécurité 9:16** : les textes restent hors des zones couvertes par
  l'interface de TikTok, Instagram Reels et YouTube Shorts (bandeaux haut et bas) ;
  seuls les bords décoratifs des cartes passent sous la colonne d'icônes de droite.

## Choix de réalisation

- **Raccords 1 → 2 → 3 → 4** : la console est l'élément continu du récit. Elle reste
  en place d'une scène à l'autre (raccord invisible) ; seuls les éléments propres à
  chaque scène entrent et sortent en fondu + parallaxe. Les transitions 4 → 5 et
  5 → 6 sont des fondus enchaînés avec parallaxe et 3 images (100 ms) de chevauchement.
- **Outro** : la ligne du storyboard « BIMfinity — Le copilote de décision du
  tertiaire. » contient un tiret cadratin, exclu par les critères d'acceptation. Elle
  est composée en bloc-marque : logo (et nom) au-dessus, « Le copilote de décision du
  tertiaire. » en dessous. Variante possible sur une ligne : « BIMfinity, le copilote
  de *décision* du tertiaire. »
- **Mots clés en bleu** : « rénover en deux phases », « Décider », « décision », et
  sur les cartes secondaires les résultats « sécurisée », « maîtrisé », « défendue ».
- **Graphique** : purement illustratif, sans axe gradué ni valeur.
