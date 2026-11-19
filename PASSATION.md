# Passation · Logo et charte de la future application lycée

Ce document est rédigé le 19 novembre 2026 par la session cloud qui a commencé le travail. Il est destiné à la session locale qui reprend sur le PC Windows de l'utilisateur.

## En bref

1. **Le nom.** Après une recherche sur 64 noms, deux finalistes restent : **Lucarne** et **Courange**. L'utilisateur veut voir les deux déclinés en logo avant de trancher.
2. **Le logo n'est pas commencé.** Aucun visuel n'existe encore : il n'y a donc pas d'aperçu à joindre. Le brief des trois pistes est prêt dans `marque/pistes/brief-pistes.md`.
3. **Le canevas existe mais il est vide.** Le canevas Claude Design « Pistes de logo » a été créé, sans aucun fichier : https://claude.ai/artifact/LXEXdUBQCri8ksURECTzMx
4. **Les vérifications juridiques sont mises de côté** à la demande de l'utilisateur.

## La demande de l'utilisateur, avec ses mots

### Le point de départ

Il s'agit de l'outil « Scanner un cours » de son artefact **Classeur de Seconde** (https://claude.ai/artifact/PFgrK7cm8gzVfBfKV8H3Ae). L'élève photographie ses pages de cours, l'IA les retranscrit et les range par matière et par leçon.

- « tu vois l'outils de trie »
- « Comment je pourrais faire en sorte de développer ça pour le vendre? Pour vendre des abonnements. »
- « commence à faire le logo charte ect »

Un plan d'affaires a été présenté dans la conversation. Il n'a pas été enregistré dans un fichier.

### Ses choix sur les options proposées

| Question | Réponse |
| --- | --- |
| Nom | « Me proposer des noms (Recommandé) ». On génère des pistes, on vérifie qu'elles ne sont pas prises, il choisit, puis le logo se fait sur ce nom. |
| Périmètre | « Tout le lycée (Recommandé) » : Seconde, Première et Terminale. |
| Style | « Trois pistes à comparer (Recommandé) », dont une qui prolonge l'univers actuel, violet nuit avec un accent citron. Il choisit, puis on finalise la charte. |
| Livrable | « claude design c'est possible ? » Réponse : oui. Les trois pistes vont sur un canevas Claude Design (type Design), la charte finale dans un Design System. |

### Ses messages suivants

- « je peut avoir deux trois résulta » : il voulait voir les premiers noms sans attendre la fin de la recherche.
- « tu peut passez sur le pc normalement » : il voulait que le travail passe par son PC. La session cloud n'a pas pu s'y connecter, voir « Problèmes connus ».
- « pour l'instant on s'en fou de l'inpi ect » : plus de vérifications juridiques pour le moment.
- Au choix du nom, il a répondu « **Les deux** » : décliner les trois pistes sur Lucarne et sur Courange, puis trancher sur pièce.

### Ce qu'il a validé et ce qu'il a écarté

- **Validé :** les deux finalistes, à comparer ; les trois pistes, dont une qui prolonge l'univers actuel ; Claude Design comme outil ; le lycée entier comme périmètre.
- **Écarté pour l'instant :** les recherches à l'INPI, à l'EUIPO et toute vérification juridique. Il n'a rien refusé d'autre explicitement.

## Ce qui est fait

### La recherche de noms

Le processus :
- sept générateurs, chacun avec un angle différent ;
- trois jurys notés sur 10 : un lycéen, un parent, un stratège de marque ;
- une vérification par recherche web des dix noms les mieux classés.

Les résultats complets se trouvent dans `marque/noms/candidats.json` et `marque/noms/verifications.json`.

### Les deux finalistes

**Lucarne.** Notes : stratégie 7/10, élèves 5/10, parents 3/10.
- **Atouts :** aucune application ni marque « Lucarne » repérée dans l'éducation ; le nom colle à l'univers nocturne éclairé par le haut.
- **Risques :** « La Lucarne » est la case documentaire d'ARTE depuis 1997, et ARTE est aussi présent dans les lycées avec Educ'ARTE. Le référencement est saturé, car c'est un mot courant.

**Courange.** Notes : stratégie 6/10, parents 5/10, élèves 2,5/10.
- **Atouts :** aucune trace trouvée, ni application, ni société, ni marque.
- **Risques :** il se lit comme une faute sur « courage », et le correcteur des téléphones le corrige. Des marques « COURAGE » antérieures pourraient s'y opposer.

### Les noms écartés, et pourquoi

| Nom | Raison |
| --- | --- |
| Fluo | Une application éducative « Fluo AI » existe déjà, et c'est le nom des cars scolaires du Grand Est. |
| Bossa | Marque déposée par un studio de jeux vidéo, et applications d'un courtier européen. |
| Claro | Pris par un éditeur d'applications pour élèves et par un opérateur télécom. |
| Ajour | On y entend « ajourné », le mot officiel pour un candidat recalé au bac. |
| Capto | Un logiciel de capture d'écran porte déjà ce nom. |
| Boréal et Compas | Déjà pris dans l'éducation. |

### Les noms de domaine

La disponibilité a été vérifiée le 19 novembre via le connecteur Vercel. Le détail est dans `marque/noms/domaines.json`.

- **Lucarne :** lucarne.com, .fr, .app, .io, .co, .eu et lucarneapp.com sont tous pris. Restent libres getlucarne.com, lucarne-app.com, lucarne-app.fr et monlucarne.fr.
- **Courange :** seul courange.com est pris. courange.fr, .app, .io, .co et .eu sont libres.

### Le reste

- **L'univers visuel actuel** est extrait de l'application : polices, thème nuit « Afterglow » et thème clair « Aube ». Il se trouve dans `marque/univers-actuel/tokens-classeur.css`.
- **Le canevas Claude Design « Pistes de logo »** est créé, mais vide.

## Ce qui reste à faire

1. **Produire les trois pistes sur les deux noms**, selon `marque/pistes/brief-pistes.md`. Chaque piste comprend le logo, le symbole, l'icône d'application, les versions monochromes, la palette, la typographie et trois mises en situation. Il faut aussi une planche de comparaison des trois pistes et des deux noms.
2. **Faire choisir à l'utilisateur** un nom et une piste.
3. **Construire la charte dans un Design System** (type https://claude.ai/artifact/5M7UeXXcx16TP3vzVFNDzd). Elle doit contenir :
   - un `README.md` qui sert de livre de marque ;
   - un `tokens.json` : couleurs claires et sombres au contraste 4,5:1, échelle typographique, espacements, rayons ;
   - les logos en SVG, avec le texte converti en tracés ;
   - les règles d'usage et le ton.
4. **Plus tard**, quand l'utilisateur le voudra :
   - recherche à l'INPI et à l'EUIPO dans les classes 9 (logiciels), 41 (éducation) et 42 (services en ligne), en vérifiant d'abord « La Lucarne » d'ARTE et les marques « COURAGE » ;
   - achat du domaine et réservation des comptes Instagram et TikTok.

## Les fichiers concernés

| Fichier | Contenu |
| --- | --- |
| `PASSATION.md` | Ce document. |
| `marque/pistes/brief-pistes.md` | Le brief des trois pistes, déclinées sur les deux noms. |
| `marque/noms/candidats.json` | Les 64 noms, avec leur origine, leur justification et les notes et avis des trois jurys. |
| `marque/noms/verifications.json` | Les constats de vérification des dix premiers, avec leurs sources. Certains n'ont pas été vérifiés faute de quota : c'est indiqué dans le fichier. |
| `marque/noms/domaines.json` | La disponibilité des domaines au 19 novembre 2026. |
| `marque/univers-actuel/tokens-classeur.css` | Les variables CSS de l'application actuelle : polices, couleurs nuit et jour, rayons. |
| `marque/workflows/recherche-noms.js` | Le script d'orchestration de la recherche de noms, pour l'outil Workflow de Claude Code. |
| `marque/workflows/verifier-finalistes.js` | La vérification des finalistes, arrêtée avant tout résultat à la demande de l'utilisateur. |

Le dossier `bimfinity-video/` est un autre projet (vidéo Remotion), sans rapport avec le logo.

## Outils, commandes et versions

### Ce qui est indispensable

Pour travailler sur le canevas Claude Design, **rien n'est à installer**. Le rendu se fait dans le navigateur, et le canevas charge lui-même les polices Google Fonts. Il faut seulement pouvoir écrire dans l'artefact. Le format est décrit dans le `SKILL.md` du type Design : un index `project/canvas.json` et une planche `project/*.dc.html` par écran.

### Les outils facultatifs

Ils servent pour produire des fichiers de logo hors du canevas.

- **Un navigateur** suffit pour voir des SVG.
- **Pour convertir le texte des logos en tracés**, ce qui est indispensable pour des SVG autonomes, utiliser Python 3.12 :
  ```
  py -m pip install fonttools brotli
  ```
- **Pour produire des aperçus PNG automatiques** depuis du HTML ou du SVG :
  ```
  py -m pip install playwright
  py -m playwright install chromium
  ```
- **Node, Blender et ffmpeg** ne servent pas au logo. Node n'est requis que par `bimfinity-video/`.

### Les polices

Toutes viennent de Google Fonts, sous licence OFL, et sont téléchargeables sur fonts.google.com. Leur nom a été vérifié dans la liste des familles acceptées par le canevas.

| Usage | Polices |
| --- | --- |
| Univers actuel | Bricolage Grotesque, DM Sans, Caveat |
| Piste Cahier | Fraunces, Instrument Serif, Playwrite FR Moderne, Figtree, Instrument Sans |
| Piste Pop | Unbounded, Syne, Plus Jakarta Sans, Manrope |

## Problèmes connus

### Le PC n'est pas accessible depuis le cloud

Le PC de l'utilisateur, nommé « rayane », propose deux dossiers (pilote-annonces et ryn-montages), mais pas aux sessions cloud. Deux causes possibles :
- les dossiers sont dans un dossier caché ;
- l'application Claude du PC doit être mise à jour.

Cette fonction n'est pas encore ouverte à tous les comptes.

### Le réseau de la session cloud est limité

Les registres INPI, EUIPO et RDAP, ainsi que la plupart des sites tiers, sont injoignables. Les vérifications de noms ont donc été faites uniquement par recherche web.

Le quota de 200 recherches web par tour a été épuisé pendant la première vérification. Capto, Courange, Tabula, Listo et Claro n'ont pas été réellement vérifiés à cette étape. Courange a ensuite été vérifié par une recherche séparée.

### Les points faibles connus des deux noms

- **Lucarne :** les domaines principaux sont pris, il faudra donc une variante ; un éventuel dépôt de « La Lucarne » par ARTE est à vérifier ; les parents ne font pas le lien avec les révisions, d'où le besoin d'une signature.
- **Courange :** l'effet « faute d'orthographe », le correcteur automatique et la proximité avec des marques « COURAGE ».

### Le canevas

Il reste privé tant que l'utilisateur ne le partage pas (menu Share). Une seule session doit écrire dessus à la fois.

### Les deux recherches automatiques

Celle des noms s'est arrêtée au moment des vérifications, faute de quota de recherches web. Celle des finalistes a été arrêtée à la demande de l'utilisateur, avant tout résultat.
