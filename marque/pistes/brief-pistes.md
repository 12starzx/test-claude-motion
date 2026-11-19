# Brief des trois pistes de logo

Ce brief prépare l'étape suivante. **Aucun visuel n'a encore été produit.** Les couleurs et les idées de symbole ci-dessous sont des points de départ, pas des choix validés.

## Le cadre validé par l'utilisateur

- **Deux noms à comparer sur pièce :** Lucarne et Courange. L'utilisateur a choisi « Les deux », c'est-à-dire chaque piste déclinée sur les deux noms. Il tranchera ensuite.
- **Trois pistes graphiques distinctes**, dont une qui prolonge l'univers actuel de l'application : violet nuit avec un accent citron.
- **Le périmètre couvre tout le lycée**, de la Seconde à la Terminale. Le logo ne doit pas rester attaché à la Seconde, contrairement à l'actuel « 2de ».
- **Le public est double :** l'élève l'utilise tous les soirs, le parent paie l'abonnement (environ 6 euros par mois).

## Les deux noms

- **Lucarne** désigne la fenêtre de toit qui fait entrer la lumière, et aussi le tir parfait « en pleine lucarne » au football. Le nom colle à l'univers nocturne éclairé par le haut. Sa faiblesse : côté parents, on pense au foot avant les révisions. Une signature claire compense ce point, par exemple « Lucarne, le classeur qui se range tout seul ».
- **Courange** est un mot inventé : « cours » + « range », et on y entend « courage ». Sa faiblesse : il se lit comme une faute sur « courage », et le correcteur des téléphones le remplace. Le logo doit donc rendre l'orthographe évidente, en faisant ressortir le « n » ou la coupure « cour·range ».

## Piste 1 · Afterglow (prolonge l'univers actuel)

**Intention :** la scène de nuit violette éclairée par le haut, déjà en place dans l'application. On la garde et on l'élève au rang de marque.

**Couleurs** (reprises de `marque/univers-actuel/tokens-classeur.css`) :

| Rôle | Valeur |
| --- | --- |
| Fond nuit | `#0B0720` |
| Violet | dégradé de `#5E43F0` à `#4A2FD1` |
| Citron | `#C6F25A`, une seule touche par écran, texte `#17142B` dessus |
| Encre claire | `#F5F2FF` |
| Thème clair « Aube » | fond `#EEE9FF`, encre `#17142B`, accent `#4A2FD1` |

**Typographies :**
- Bricolage Grotesque pour le logo et les titres ;
- DM Sans pour l'interface ;
- Caveat pour une touche manuscrite, avec parcimonie.

**Symbole Lucarne :** une fenêtre de toit d'où tombe un faisceau citron. Variante « pleine lucarne » : le coin supérieur d'un cadre, qui dessine aussi un L, avec un point citron logé dans l'angle.

**Symbole Courange :** un onglet d'intercalaire citron qui dépasse d'une page violette. Le C peut aussi devenir un anneau de classeur.

## Piste 2 · Cahier (la papeterie scolaire française)

**Intention :** tout lycéen connaît la copie double à grands carreaux. Cette piste joue la réglure Seyès, la marge rouge, l'encre et le surligneur. Elle est chaleureuse et rassurante pour les parents.

**Couleurs à affiner :**

| Rôle | Valeur |
| --- | --- |
| Papier | crème, vers `#F6F1E7` |
| Encre | bleu nuit, vers `#1F2A6B` |
| Marge | rouge, vers `#D8473A` |
| Surligneur | jaune, vers `#F4E04D` |

Vérifier le contraste de 4,5:1 sur le crème.

**Typographies :**
- Fraunces ou Instrument Serif pour le logo et les titres ;
- Playwrite FR Moderne, l'écriture scolaire française, pour les touches manuscrites ;
- Figtree ou Instrument Sans pour l'interface.

**Symbole Lucarne :** un carreau de la réglure qui s'allume comme une fenêtre.

**Symbole Courange :** une feuille perforée, ou un onglet glissé dans la marge.

## Piste 3 · Pop (énergique, née sur les réseaux)

**Intention :** couleurs franches, formes d'autocollant, contours épais. C'est la piste qui parle d'abord aux élèves et qui fonctionne en story et en vidéo courte.

**Couleurs à définir :** une proposition de départ serait bleu électrique, corail et menthe, sur fond clair ou noir. Les couleurs à distinguer doivent aussi différer en luminosité.

**Typographies :**
- Unbounded ou Syne pour le logo ;
- Plus Jakarta Sans ou Manrope pour l'interface.

**Symbole Lucarne :** un ballon qui file dans l'angle d'un cadre, sans tomber dans le football littéral.

**Symbole Courange :** une pile d'onglets, ou une bulle « Rangé ! ». C'est le message que l'application affiche déjà quand elle classe un cours.

## Livrables attendus, pour chaque piste et chaque nom

1. Le logo horizontal (symbole et nom), le nom seul et le symbole seul.
2. L'icône d'application à 1024 px, lisible jusqu'à 29 px.
3. Les versions monochromes, claire et foncée.
4. La palette avec ses codes, et un spécimen typographique.
5. Trois mises en situation : un écran d'application (390 × 844), une publication Instagram (1080 × 1350) et un haut de page d'accueil (1440 px de large).

Il faut aussi une planche de comparaison qui réunit les trois pistes et les deux noms à la même échelle. C'est sur elle que l'utilisateur choisira.

## Organisation prévue sur le canevas Claude Design

Le canevas « Pistes de logo » existe déjà : https://claude.ai/artifact/LXEXdUBQCri8ksURECTzMx. Il est encore **vide** : aucun fichier n'y a été écrit.

Disposition envisagée :
- **une page « Vue d'ensemble »** avec la planche de comparaison ;
- **une page par piste**, avec une rangée par nom : une planche « Identité » et une planche « En situation », de 1600 × 1000 chacune.

Le format des fichiers (`project/canvas.json` et les planches `project/*.dc.html`) est décrit dans le `SKILL.md` du type Design. Il n'accepte que les polices Google Fonts. Les SVG peuvent être écrits directement dans les planches.
