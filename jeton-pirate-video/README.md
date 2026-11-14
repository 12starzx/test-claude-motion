# « Le jeton pirate » · version nuit marine

Vidéo verticale de 82 s en motion design, produite avec Remotion (React + TypeScript).
Elle reprend la narration et le rythme de la vidéo de référence, avec des décors redessinés
et une nouvelle palette : bleu nuit, faisceaux de lune, héros cyan, jeton orange doré.

| Composition   | Format      | Cadence | Durée               |
| ------------- | ----------- | ------- | ------------------- |
| `JetonPirate` | 1080 x 1920 | 30 i/s  | 2 460 images (82 s) |

## Démarrage

```console
npm install
npm run dev        # Remotion Studio : prévisualisation scène par scène
```

## Rendu

```console
npm run render     # → out/jeton-pirate-9x16.mp4 (H.264, CRF 17)
```

Sur une machine qui ne peut pas télécharger Chrome Headless Shell (réseau filtré),
indiquez un navigateur local :

```console
REMOTION_BROWSER=/chemin/vers/chrome-headless-shell npm run render -- --gl=swangle
```

Polices et sons sont embarqués dans `public/` : le rendu ne dépend d'aucun service en ligne.

## Arborescence

```text
jeton-pirate-video/
├── public/
│   ├── fonts/                     ← Montserrat, Inter, Playfair Display (licence SIL OFL)
│   └── audio/                     ← nappe musicale et bruitages (+ voix-off.mp3, facultatif)
├── scripts/
│   ├── generate-sound-design.mjs  ← synthèse de la bande-son, calée sur le conducteur
│   └── retime-from-transcript.mjs ← recalage automatique sur une voix off
└── src/
    ├── timeline.ts                ← LE CONDUCTEUR : texte et minutage de chaque réplique
    ├── theme.ts                   ← palette « nuit marine », format
    ├── Video.tsx                  ← montage des 23 scènes
    ├── scenes/                    ← Act1 à Act4 (une fonction par scène)
    ├── components/                ← sous-titres, fond, dessins (personnages, jeton, accessoires)
    └── audio/Soundtrack.tsx       ← placement des sons sur la timeline
```

## Modifier le texte ou le rythme

Tout passe par `src/timeline.ts`. Chaque réplique a un identifiant, un instant d'apparition
(`at`, en secondes) et une ou plusieurs lignes :

- `body("…")` : sous-titre courant ; les mots entre astérisques passent en italique ;
- `impact("…")` : mot-choc en capitales ;
- `serif("…")` : aparté en italique.

Les scènes, les animations et les bruitages lisent leurs instants dans ce conducteur :
déplacer une réplique déplace tout ce qui en dépend. Après une modification du minutage,
relancez `npm run audio` pour recaler la nappe musicale.

## Ajouter la voix off

La voix off actuelle (ElevenLabs, voix « Sid », modèle `eleven_v4`) est dans
`public/audio/voix-off.mp3`, et le conducteur est calé dessus. La composition monte ce
fichier automatiquement s'il existe, et baisse alors musique et bruitages pour laisser la
voix devant.

Pour remplacer la voix :

1. Générer la nouvelle voix à partir du texte ci-dessous et l'enregistrer sous
   `public/audio/voix-off.mp3`. Si le texte change, mettre aussi à jour `voix-off.txt`
   (même texte, sans les balises entre crochets).
2. Dater chaque mot. Deux possibilités :
   - une transcription horodatée mot à mot (ElevenLabs Scribe, par exemple), au format
     JSON ;
   - à défaut, l'estimation locale, qui s'appuie sur les pauses de la voix et le nombre de
     syllabes de chaque phrase :

     ```console
     node scripts/align-voice.mjs public/audio/voix-off.mp3 voix-off.txt transcription.json
     ```

3. Recaler le conducteur, puis la musique, puis rendre :

   ```console
   node scripts/retime-from-transcript.mjs transcription.json
   npm run audio
   npm run render
   ```

Le recalage retrouve chaque réplique dans la transcription, date les nombres prononcés en
toutes lettres, et signale les répliques introuvables (placées alors par interpolation).
Les scènes et les bruitages suivent automatiquement, car ils lisent leurs instants dans le
conducteur.

### Texte de la voix off

Le texte est écrit pour une lecture directe par ElevenLabs (modèle `eleven_v4`, balises de
jeu entre crochets, nombres en toutes lettres pour garantir leur prononciation) :

```text
[dramatically] Le 5 décembre, le jeton pirate disparaît. [pause] Et toi… tu as abandonné.
[intense] Reprends. Reprends ta manette. C'est un ordre. Tes potes aussi ont abandonné.
Rappelle-les. Si un seul de vous trouve le jeton, toute l'équipe l'a. [serious] Il y en a
un qui ne répondra pas. Tu sais déjà lequel. Insiste. C'est peut-être lui qui le trouvera.
Le problème, c'est qu'il vous reste trois semaines. Tu ne joues plus. Tu es en service.
Tu te couches en pensant au jeton. Tu te lèves en pensant au jeton. Entre les deux, tu
ouvres des coffres. Cent trente-sept mille cinq cents coffres. Ça fait six mille cinq cents
par jour. Tu en ouvres quarante… parfois cinquante. Fais mieux. Ta mère t'appelle pour
manger ? Tu as quatre minutes. Ton prof annonce un contrôle le 4 ? Demande-lui de le
décaler. Raisons de service. [sarcastic] Bien sûr, tu peux aussi réviser. [serious] Mais le
bac revient chaque année. Le jeton, non. Le problème, c'est que les jours partent plus vite
que les coffres. Deux semaines. Rien. Une semaine. Un bandage. Trois jours. Toujours rien.
Personne ne quitte l'équipe. [softly] Le 4 décembre. 23 heures. Toute l'équipe est
connectée. Même celui qui ne répondait pas. Un coffre brille au bord de l'eau. Tu l'ouvres.
[excited] Le jeton est là. Pour toute l'équipe. [dramatically] Le 5 décembre, le jeton
disparaît… sauf pour ceux qui n'ont pas abandonné.
```

## Musique

La version finale utilise un morceau phonk fourni par l'utilisateur. Il n'est pas versionné
(ses droits appartiennent à son auteur) : sans lui, la vidéo utilise la nappe de synthèse
décrite plus bas.

`scripts/build-music.mjs` monte le morceau sur le récit, en deux segments calés sur ses
repères mesurés (premier drop, accalmie, second drop) :

- premier drop sur « DISPARAÎT. », accalmie sous « Il y en a un qui ne répondra pas » ;
- montée puis second drop sur « 137 500 COFFRES. » ;
- silence sous « Le jeton, NON. » et « les jours partent plus vite » ;
- reprise de l'accalmie sous le compte à rebours, montée sur « Le 4 décembre… Un coffre
  brille », drop final sur « LE JETON EST LÀ. ».

La musique est compressée par la voix (sidechain) : environ 4 à 5 dB sous la voix quand
elle parle, pleine puissance entre les phrases et sur les drops.

```console
node scripts/build-music.mjs morceau.mp4 public/audio/voix-off.mp3 public/audio/musique.mp3
```

À l'export, le son est normalisé à -14 LUFS (crête vraie -1 dB), le niveau visé par TikTok.

## Bande-son

`npm run audio` synthétise toute la bande-son (aucun échantillon externe, donc libre de
droits) : une nappe en ré mineur avec pulsation, basse et tic-tac, une montée sur « Un
coffre brille », puis un accord majeur à la révélation du jeton ; et des bruitages
(impacts, souffles, scintillements, coffres, vibreur, horloge).
