export const meta = {
  name: 'verifier-finalistes-nom',
  description: 'Vérifie Lucarne et Courange : marques, présence en ligne, sociétés, puis contre-vérification sceptique',
  phases: [
    { title: 'Enquête', detail: 'trois angles par nom : marques, présence en ligne, sociétés' },
    { title: 'Contre-vérification', detail: 'un conseil sceptique par nom cherche ce qui bloque' },
  ],
}

const NAMES = args.names
const DOMAINS = args.domains
const PRIOR = args.prior

const FINDING = {
  type: 'object',
  properties: {
    what: { type: 'string', description: 'Constat précis, en français' },
    severity: { type: 'string', enum: ['bloquant', 'élevé', 'moyen', 'faible', 'info'] },
    url: { type: 'string', description: 'URL où le constat a été vu, ou chaîne vide' },
    verified: { type: 'boolean', description: 'true si vu directement dans un résultat de recherche' },
  },
  required: ['what', 'severity', 'url', 'verified'],
}

const SOURCE_SCHEMA = {
  type: 'object',
  properties: {
    findings: { type: 'array', items: FINDING },
    searches_done: { type: 'number' },
    not_checked: { type: 'array', items: { type: 'string' } },
  },
  required: ['findings', 'searches_done', 'not_checked'],
}

const VERDICT_SCHEMA = {
  type: 'object',
  properties: {
    verdict: { type: 'string', enum: ['vert', 'orange', 'rouge'] },
    summary: { type: 'string', description: 'Deux à quatre phrases, en français' },
    blocking: { type: 'array', items: { type: 'string' } },
    new_findings: { type: 'array', items: FINDING },
    official_checks_left: { type: 'array', items: { type: 'string' } },
    searches_done: { type: 'number' },
  },
  required: ['verdict', 'summary', 'blocking', 'new_findings', 'official_checks_left', 'searches_done'],
}

const BRIEF = `Contexte : futur produit grand public français, une application par abonnement pour lycéens (Seconde, Première, Terminale), payée par les parents (environ 6 euros par mois). L'élève photographie ses pages de cours ; l'IA les retranscrit et les range par matière et par leçon, puis propose quiz, suivi des devoirs et révisions. Le nom de marque doit pouvoir être déposé en France et dans l'Union européenne en classes 9 (logiciels, applications), 41 (éducation, formation) et 42 (logiciels en ligne), idéalement aussi 16 (papeterie) et 38 (télécommunications).`

const RULES = (max) => `Règles :
- Utilise uniquement l'outil WebSearch (mode "standard"), au plus ${max} recherches. WebFetch et Bash échouent dans cette session : ne les essaie pas.
- Si une recherche répond que le quota est épuisé, arrête-toi et indique dans not_checked tout ce qui n'a pas pu être vérifié.
- N'invente jamais un numéro de marque, un titulaire, une date ou une classe. Chaque constat cite l'URL où tu l'as vu ; mets verified=false pour tout ce que tu déduis sans l'avoir vu.
- Gravité : bloquant = empêche l'adoption ; élevé = risque juridique ou de confusion sérieux ; moyen = gêne réelle mais contournable ; faible = usage mineur ou éloigné ; info = contexte.
- Écris en français impeccable, en phrases nettes.`

const nearMarks = (n) => n === 'Lucarne'
  ? `Antériorités proches à examiner en priorité : « LA LUCARNE » d'ARTE France (case documentaire depuis 1997) : est-ce une marque déposée, par qui, dans quelles classes, encore en vigueur ? Regarde aussi « LUCERNE » et « LUKARNE ».`
  : `Antériorités proches à examiner en priorité : « COURAGE », très proche à l'écrit comme à l'oral. Toute marque COURAGE en vigueur en classes 9, 41 ou 42 est un antécédent sérieux pour un risque de confusion : recense les plus importantes. Regarde aussi « COURANCE » et « KOURANGE ».`

const LENSES = [
  {
    key: 'marques',
    prompt: (n) => `ANGLE : MARQUES DÉPOSÉES. Cherche toute marque identique ou proche de « ${n} » à travers les pages de registres indexées par les moteurs de recherche : INPI (data.inpi.fr), EUIPO (euipo.europa.eu, TMview sur tmdn.org), OMPI (branddb.wipo.int, Madrid Monitor), USPTO (via justia, trademarkia, gleanmark). Exemples de requêtes : site:data.inpi.fr ${n} ; "${n.toUpperCase()}" marque INPI ; "${n.toUpperCase()}" trade mark EUIPO ; "${n.toUpperCase()}" trademark class 41. Pour chaque marque trouvée : titulaire, numéro, date, classes, statut, URL. ${nearMarks(n)}`,
  },
  {
    key: 'presence',
    prompt: (n) => `ANGLE : PRÉSENCE EN LIGNE. Vérifie : les applications portant ce nom sur l'App Store et Google Play (Apple impose des noms d'application uniques) ; les comptes @${n.toLowerCase()} sur Instagram, TikTok, YouTube et X ; ce qu'hébergent les domaines déjà réservés (${DOMAINS[n].pris.join(', ')}) : produit réel, page de parking ou revente ; les projets homonymes sur Product Hunt ou GitHub ; ce que montre la première page de résultats pour « ${n} application » et « ${n} révisions ».`,
  },
  {
    key: 'societes',
    prompt: (n) => `ANGLE : SOCIÉTÉS, ASSOCIATIONS ET USAGES. Cherche les entreprises et associations nommées « ${n} » en France, en Belgique, en Suisse et au Québec (annuaire-entreprises.data.gouv.fr, pappers.fr, societe.com, infogreffe), en priorité dans l'éducation, le soutien scolaire, l'édition, les médias et le logiciel. Pour chacune : nom exact, activité, ville, date, état, URL. ${n === 'Lucarne' ? `Documente précisément l'usage de « La Lucarne » par ARTE : depuis quand, sous quelle forme, quel lien avec Educ'ARTE et le public scolaire.` : `Vérifie aussi si « Courange » existe déjà comme nom de famille, lieu-dit, mot régional ou nom de produit.`}`,
  },
]

phase('Enquête')
const results = await pipeline(
  NAMES,
  (n) => parallel(LENSES.map((l) => () =>
    agent(`${BRIEF}\n\nNOM ÉTUDIÉ : « ${n} »\n\n${l.prompt(n)}\n\n${RULES(15)}`,
      { label: `${l.key}:${n}`, phase: 'Enquête', schema: SOURCE_SCHEMA })
      .then((r) => (r ? { lens: l.key, ...r } : null))))
    .then((rs) => rs.filter(Boolean)),
  (dossiers, n) => agent(
    `${BRIEF}\n\nNOM ÉTUDIÉ : « ${n} »\n\nTu es conseil en propriété industrielle, exigeant et sceptique. Ta mission : RÉFUTER l'idée que « ${n} » peut être adopté et déposé sans risque sérieux pour cette application. Trois enquêteurs ont réuni le dossier ci-dessous. Cherche ce qu'ils ont manqué : une marque antérieure identique ou proche en classes 9, 41 ou 42, un usage notoire, une application homonyme, un sens fâcheux, une faiblesse de distinctivité. Vérifie toi-même les constats les plus graves avant de les retenir. En cas de doute, choisis le verdict le plus prudent : vert (rien de sérieux), orange (risque à lever par une recherche officielle avant dépôt), rouge (obstacle sérieux). Liste enfin, concrètement, les vérifications officielles qui restent à faire.\n\nDOSSIER DES ENQUÊTEURS :\n${JSON.stringify(dossiers, null, 1)}\n\nDOMAINES (registre interrogé à l'instant) : ${JSON.stringify(DOMAINS[n])}\n\nPREMIER TOUR : ${PRIOR[n]}\n\n${RULES(10)}`,
    { label: `sceptique:${n}`, phase: 'Contre-vérification', schema: VERDICT_SCHEMA })
    .then((v) => ({ name: n, dossiers, verdict: v })),
)
return results.filter(Boolean)
