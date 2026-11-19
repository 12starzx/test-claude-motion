export const meta = {
  name: 'naming-classeur-lycee',
  description: 'Trouver un nom de marque pour l\'app de classeur scolaire : génération, présélection, vérification des conflits, jury final',
  phases: [
    { title: 'Générer', detail: '7 angles de création de noms' },
    { title: 'Présélection', detail: '3 jurys (élève, parent, stratège de marque)' },
    { title: 'Vérifier', detail: 'recherche de conflits puis contre-vérification adverse' },
    { title: 'Jury final', detail: 'notation des noms disponibles' },
    { title: 'Synthèse', detail: 'finalistes et recommandation' },
  ],
}

const BRIEF = `
PRODUCT: a French, mobile-first web app for lycée students (Seconde, Première, Terminale; ages 14-18). The student photographs each page of a course; AI transcribes it and files it automatically into the right subject and lesson of a digital "classeur" (binder). From each lesson the app generates quizzes, exercises and revision sheets, tracks homework due dates and grades, and shows what still needs revising before tests and the bac. Today's prototype is called "Mon classeur" with a "2de" badge.
BUSINESS: subscription (about 5-7 EUR/month or about 49 EUR per school year), freemium. The STUDENT uses it daily; the PARENT pays. Market: France first (French-speaking).
POSITIONING: the binder that organizes itself and follows the student all year long, so revising feels under control. NOT "an AI that reads your photo" (free chatbots already do that). Personality: calm, organized, competent, a bit of warmth and wit.
CURRENT VISUAL WORLD of the prototype (one future logo direction will extend it): night-violet scene lit from above, a single citron (#C6F25A) accent, display font Bricolage Grotesque, UI font DM Sans, handwritten Caveat accents.
NAME REQUIREMENTS:
- French-first: obvious pronunciation for a French teen, and only one plausible spelling when heard (the answer to "ça s'écrit comment ?" must be obvious).
- Short: ideally 1 to 3 syllables, at most about 10 letters, one word, works as an app-icon label.
- Covers the whole lycée (no "Seconde/2de/Terminale" in the name); not childish (collège/primaire), not corporate or institutional.
- Teens would say it naturally (not cringe, no slang that will date within a year) AND parents trust it.
- Distinctive and ownable: no generic dictionary word on its own ("Classeur", "Cahier", "Agenda") since it can't be trademarked; nothing close to competitors: Kartable, SchoolMouv, Nomad Education, Studocu, Digischool, Brainly, Quizlet, Goodnotes, Notion, Pronote, Skolengo, Ecole Directe, Acadomia, Superprof, Maxicours, Lumni, Les Bons Profs, Mon Classeur, Classe Inversée.
- No clichés: "-GPT", "AI"/"IA" prefixes or suffixes, "-ify", "Smart-", "Edu-", "Study-", "-ly".
- No embarrassing meaning in French slang or verlan, English, Spanish, Arabic, Portuguese, Italian or German.
`

const ANGLES = [
  { key: 'objets', text: 'School-object metaphors: the binder, its rings, dividers (intercalaires), tabs (onglets), sleeves (pochettes), the trieur, bookmarks, the trousse. Reinterpret, truncate, combine or twist them into an ownable coinage rather than the plain word.' },
  { key: 'gestes', text: 'Sounds and gestures of getting organized: the "clac" of binder rings closing, flipping pages, snapping a photo of a page, sliding a sheet into its place, ticking a box. Playful but never childish.' },
  { key: 'lumiere', text: 'Light and night, extending the prototype\'s night-violet "afterglow" world: dawn, glow, halo, lantern, constellation, phosphorescence, clarity after confusion, calm late-evening revising.' },
  { key: 'progres', text: 'Progress and mastery: getting things under control, knowing where you stand, the path to the bac, milestones, compass, thread, cap, steps, "acquis". Avoid sounding like a coaching company.' },
  { key: 'invente', text: 'Coined brandables with French phonotactics, in the spirit of Doctolib, Vinted, Qonto, Lydia, Yuka, Alan, Swile: invented or blended words (roots like class-, rang-, tri-, note-, memo-, cours-) that are easy to say and own.' },
  { key: 'classique', text: 'Latin, Greek and classic culture made fresh: short roots (scola, nota, memor, ordo, liber, tabula, codex...), literary or mythological references a lycéen knows, shortened and modernized so they don\'t feel dusty.' },
  { key: 'voix', text: 'Teen voice: names a 16-year-old would naturally say to a friend. Test each candidate in the sentences "t\'as mis ton cours sur ___ ?" and "je révise sur ___". Natural, verb-like or casual, but not slang that dates.' },
]

const GEN_SCHEMA = {
  type: 'object',
  properties: {
    candidates: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Exact brand spelling, as it would appear in the logo' },
          origin: { type: 'string', description: 'How the name is built, one sentence, in French' },
          rationale: { type: 'string', description: 'Why it fits this product and audience, one sentence, in French' },
        },
        required: ['name', 'origin', 'rationale'],
      },
    },
  },
  required: ['candidates'],
}

const SCORES_SCHEMA = {
  type: 'object',
  properties: {
    scores: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          score: { type: 'number', description: '0 to 10' },
          comment: { type: 'string', description: 'At most 15 words, in French' },
        },
        required: ['name', 'score', 'comment'],
      },
    },
  },
  required: ['scores'],
}

const CONFLICT_SCHEMA = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    level: { type: 'string', enum: ['aucun', 'faible', 'moyen', 'élevé'] },
    findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          what: { type: 'string', description: 'What was found, in French' },
          url: { type: 'string' },
          severity: { type: 'string', enum: ['info', 'faible', 'moyen', 'élevé'] },
        },
        required: ['what', 'severity'],
      },
    },
    meaning_issues: { type: 'string', description: 'Unwanted meanings or homophones in other languages or slang, in French; "aucun" if none' },
    summary: { type: 'string', description: 'Two sentences max, in French' },
  },
  required: ['name', 'level', 'findings', 'meaning_issues', 'summary'],
}

const FINAL_SCHEMA = {
  type: 'object',
  properties: {
    finalists: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          prononciation: { type: 'string' },
          idee: { type: 'string', description: 'The idea behind the name, one sentence' },
          pourquoi: { type: 'string', description: 'Why it works for teens and parents, two sentences max' },
          risques: { type: 'string', description: 'Weak points and residual conflicts, honest' },
          verifications: { type: 'string', description: 'What was checked and what remains to check officially (INPI/EUIPO, domains)' },
          piste_logo: { type: 'string', description: 'One visual idea the name suggests for the logo' },
          accroche: { type: 'string', description: 'A possible tagline in French' },
        },
        required: ['name', 'prononciation', 'idee', 'pourquoi', 'risques', 'verifications', 'piste_logo', 'accroche'],
      },
    },
    recommandation: { type: 'string', description: 'Which name you recommend and why, three sentences max' },
    ecartes: {
      type: 'array',
      items: {
        type: 'object',
        properties: { name: { type: 'string' }, raison: { type: 'string' } },
        required: ['name', 'raison'],
      },
    },
  },
  required: ['finalists', 'recommandation', 'ecartes'],
}

const WEB_RULE = 'For web checks, use only the WebSearch tool (load it first with ToolSearch, query "select:WebSearch"). Do not use Bash, curl or WebFetch for network lookups: they are blocked in this session.'
const FRENCH_RULE = 'Every text field you return must be written in impeccable, natural French (no anglicisms when a French word exists, no spelling mistakes).'

const key = s => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '')

const LENSES = [
  { key: 'eleve', text: 'You are a 16-year-old lycéen in France (Première), with a phone full of apps. Would you say this name to friends without embarrassment? Is it easy to say, spell and remember? Does it sound like something you would actually open every evening? Childish or try-hard names score low.' },
  { key: 'parent', text: 'You are a French parent deciding whether to pay about 6 EUR a month for your teenager\'s school app. Does the name inspire trust and seriousness, while staying modern? Does it clearly evoke school organization and revising? Gimmicky, cheating-adjacent or unclear names score low.' },
  { key: 'strategie', text: 'You are a senior brand strategist specialised in French consumer apps. Judge distinctiveness among edtech competitors, trademark ownability (generic or descriptive words score low), memorability, ability to grow beyond lycée, and logo/app-icon potential.' },
]

const allTried = new Map()   // key -> {name, origin, rationale}
const checked = new Map()    // key -> conflict verdicts
const survivors = []
let round = 0

while (round < 3 && survivors.length < 6) {
  round++
  phase('Générer')
  const avoid = [...allTried.values()].map(c => c.name)
  const gens = await parallel(ANGLES.map(a => () => agent(
    `${BRIEF}\nYOUR NAMING ANGLE: ${a.text}\n\nPropose 12 strong brand-name candidates from this angle. Before returning, check each one against every NAME REQUIREMENT above and drop any that fails; quality over quantity, but aim for 12.${avoid.length ? `\nThese names were already proposed in earlier rounds: do NOT repeat them or near-variants: ${avoid.join(', ')}.` : ''}\nDo not run web searches in this step. ${FRENCH_RULE}`,
    { label: `générer:${a.key}:r${round}`, phase: 'Générer', schema: GEN_SCHEMA })))

  const fresh = []
  for (const g of gens.filter(Boolean)) {
    for (const c of g.candidates || []) {
      const k = key(c.name)
      if (!k || k.length < 3 || allTried.has(k)) continue
      allTried.set(k, c)
      fresh.push(c)
    }
  }
  log(`Tour ${round} : ${fresh.length} noms nouveaux (${allTried.size} au total).`)
  if (!fresh.length) break

  phase('Présélection')
  const list = fresh.map(c => `- ${c.name} : ${c.origin}`).join('\n')
  const panels = await parallel(LENSES.map(l => () => agent(
    `${BRIEF}\nYOUR LENS: ${l.text}\n\nScore EVERY candidate below from 0 to 10 through your lens, keeping each name exactly as written. Be demanding: reserve 8+ for names you would genuinely fight for.\n\nCANDIDATES:\n${list}\n\n${FRENCH_RULE}`,
    { label: `présélection:${l.key}:r${round}`, phase: 'Présélection', schema: SCORES_SCHEMA })))

  const agg = new Map()
  for (const p of panels.filter(Boolean)) {
    for (const s of p.scores || []) {
      const k = key(s.name)
      if (!allTried.has(k)) continue
      const e = agg.get(k) || { sum: 0, n: 0, comments: [] }
      e.sum += Number(s.score) || 0; e.n++; e.comments.push(s.comment)
      agg.set(k, e)
    }
  }
  const SHORT = round === 1 ? 14 : 10
  const ranked = [...agg.entries()]
    .filter(([k]) => !checked.has(k))
    .map(([k, e]) => ({ k, avg: e.sum / Math.max(1, e.n), comments: e.comments }))
    .sort((a, b) => b.avg - a.avg)
  const shortlist = ranked.slice(0, SHORT)
  log(`Présélection : ${shortlist.map(s => `${allTried.get(s.k).name} (${s.avg.toFixed(1)})`).join(', ')}. ${Math.max(0, ranked.length - SHORT)} noms écartés à ce stade.`)

  const results = await pipeline(
    shortlist,
    s => {
      const c = allTried.get(s.k)
      return agent(
        `${BRIEF}\nCANDIDATE NAME: "${c.name}" (${c.origin})\n\nInvestigate whether this name is already taken or risky, as a trademark lawyer and app-store researcher would. Run at least 8 varied web searches, for example: "${c.name} application", "${c.name} app", "${c.name} appli scolaire", "${c.name} éducation", "${c.name} marque déposée", "${c.name} société", "${c.name}.fr", "${c.name}.com", "${c.name} startup", plus close spellings and homophones. Look for: apps on the App Store or Google Play (any category, education is critical), French or EU companies or brands using it (notably in education, software, publishing, stationery), trademark registrations mentioned online, existing websites on the obvious .fr/.com domains, and social accounts. Also check unwanted meanings in French slang or verlan, English, Spanish, Arabic, Portuguese, Italian and German.\nRate the overall conflict level: "élevé" = an education app or brand, or a registered trademark in software/education, already uses it or something confusingly similar; "moyen" = notable use in an adjacent field or obvious domains taken by an active business; "faible" = minor or unrelated uses only; "aucun" = nothing relevant found. Give URLs for every finding.\n${WEB_RULE} ${FRENCH_RULE}`,
        { label: `vérifier:${c.name}`, phase: 'Vérifier', schema: CONFLICT_SCHEMA })
    },
    (first, s) => {
      const c = allTried.get(s.k)
      if (!first) return null
      if (first.level === 'moyen' || first.level === 'élevé') return { first, second: null }
      return agent(
        `${BRIEF}\nCANDIDATE NAME: "${c.name}" (${c.origin})\n\nA first researcher concluded the conflict level is "${first.level}": ${first.summary}\nYour job is adversarial: try hard to PROVE this name is NOT safe to use. Use different search strategies from a first pass: exact-match app names on App Store and Google Play, French company registries as they appear in search results (societe.com, pappers.fr, infogreffe), INPI or EUIPO trademark mentions, one-letter variants and homophones (e.g. with k/c/q, y/i, doubled letters), the name in other languages, edtech products worldwide, YouTube or TikTok creators in education with that name. Report your own conflict level with the same scale ("élevé" = an education app/brand or software/education trademark already uses it or something confusingly similar). If you find nothing serious, say so plainly.\n${WEB_RULE} ${FRENCH_RULE}`,
        { label: `contre-vérifier:${c.name}`, phase: 'Vérifier', schema: CONFLICT_SCHEMA })
        .then(second => ({ first, second }))
    },
  )

  results.forEach((r, i) => {
    const s = shortlist[i]
    if (!r) return
    checked.set(s.k, r)
    const ok = l => l === 'aucun' || l === 'faible'
    const pass = ok(r.first.level) && r.second && ok(r.second.level)
    if (pass) survivors.push({ k: s.k, avg: s.avg, comments: s.comments, ...r })
  })
  log(`Après vérification : ${survivors.length} nom(s) sans conflit sérieux (${survivors.map(s => allTried.get(s.k).name).join(', ') || 'aucun'}).`)
}

const rejected = [...checked.entries()]
  .filter(([k]) => !survivors.some(s => s.k === k))
  .map(([k, r]) => {
    const worst = r.second && (r.second.level === 'moyen' || r.second.level === 'élevé') ? r.second : r.first
    return { name: allTried.get(k).name, level: worst.level, summary: worst.summary }
  })

if (!survivors.length) {
  return { survivors: [], rejected, note: 'Aucun nom n\'a passé la vérification de conflits.' }
}

phase('Jury final')
const dossier = survivors.map(s => {
  const c = allTried.get(s.k)
  const conflicts = [s.first.summary, s.second && s.second.summary].filter(Boolean).join(' / ')
  return `- ${c.name} : ${c.origin} Pourquoi : ${c.rationale} Vérifications : ${conflicts} Sens indésirables : ${s.first.meaning_issues}; ${s.second ? s.second.meaning_issues : ''}`
}).join('\n')

const finalPanels = await parallel(LENSES.map(l => () => agent(
  `${BRIEF}\nYOUR LENS: ${l.text}\n\nThese names passed a two-step conflict check. Score each from 0 to 10 through your lens, keeping each name exactly as written, and comment on its strongest and weakest point.\n\n${dossier}\n\n${FRENCH_RULE}`,
  { label: `jury:${l.key}`, phase: 'Jury final', schema: SCORES_SCHEMA })))

const finalAgg = new Map()
for (const p of finalPanels.filter(Boolean)) {
  for (const s of p.scores || []) {
    const k = key(s.name)
    const e = finalAgg.get(k) || { sum: 0, n: 0, comments: [] }
    e.sum += Number(s.score) || 0; e.n++; e.comments.push(s.comment)
    finalAgg.set(k, e)
  }
}
const finalRanked = survivors
  .map(s => {
    const e = finalAgg.get(s.k) || { sum: 0, n: 1, comments: [] }
    return { ...s, finalAvg: e.sum / Math.max(1, e.n), finalComments: e.comments }
  })
  .sort((a, b) => b.finalAvg - a.finalAvg)

phase('Synthèse')
const finalDossier = finalRanked.map(s => {
  const c = allTried.get(s.k)
  const finds = [...(s.first.findings || []), ...((s.second && s.second.findings) || [])]
    .map(f => `${f.severity}: ${f.what}${f.url ? ` (${f.url})` : ''}`).join(' | ')
  return `- ${c.name} — note du jury ${s.finalAvg.toFixed(1)}/10 — ${c.origin} ${c.rationale}\n  Avis du jury : ${s.finalComments.join(' / ')}\n  Constats de vérification : ${finds || 'rien de notable'}\n  Sens indésirables : ${s.first.meaning_issues}; ${s.second ? s.second.meaning_issues : ''}`
}).join('\n')
const rejectedText = rejected.map(r => `- ${r.name} (${r.level}) : ${r.summary}`).join('\n')

const synthesis = await agent(
  `${BRIEF}\nYou are the lead brand strategist writing the naming recommendation for the founder, a demanding French-speaking professional who wants precise, honest, natural French with no AI-sounding phrasing.\n\nNAMES THAT PASSED THE CONFLICT CHECKS, ranked by the final jury:\n${finalDossier}\n\nNAMES REJECTED AT THE CONFLICT CHECK:\n${rejectedText || '(aucun)'}\n\nWrite the final selection: up to 5 finalists, in the jury's order unless you have a strong reason to change it (then say why in the recommendation). For each: pronunciation as a French reader would write it, the idea, why it works for teens and parents, honest risks, what was checked and what remains to be checked officially (INPI and EUIPO trademark search in classes 9, 41 and 42, availability of the .fr and .com domains, social handles: domain registries and trademark databases could NOT be queried directly in this session, only web search), one logo idea the name suggests, and one French tagline. Then your recommendation. Then list the rejected names with a one-line reason each.\n${FRENCH_RULE}`,
  { label: 'synthèse', phase: 'Synthèse', schema: FINAL_SCHEMA })

return {
  rounds: round,
  totalCandidates: allTried.size,
  checkedCount: checked.size,
  synthesis,
  scores: finalRanked.map(s => ({ name: allTried.get(s.k).name, preselection: Number(s.avg.toFixed(2)), final: Number(s.finalAvg.toFixed(2)) })),
  rejected,
}
