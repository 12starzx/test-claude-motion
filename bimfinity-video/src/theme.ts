/**
 * Thème BIMfinity : les couleurs, la typographie, le rythme (timings), les
 * ressorts d'animation et la mise en page des deux formats.
 *
 * Pour modifier l'identité visuelle ou le montage, c'est ici qu'il faut agir :
 * les valeurs de marque et de montage sont centralisées dans ce fichier ; les
 * scènes n'y ajoutent que des réglages fins propres à chaque animation.
 */
import type { SpringConfig } from "remotion";
import { bodyFontFamily, headingFontFamily } from "./fonts";

/* -------------------------------------------------------------------------- */
/*  Couleurs                                                                  */
/* -------------------------------------------------------------------------- */

export const colors = {
  /** Fond near-black bleuté. */
  background: "#080A12",
  /** Bleu primaire de la marque. */
  primary: "#2E6BFF",
  /** Halo lumineux. */
  glow: "#4D83FF",
  /** Bleu profond. */
  deep: "#0B2A9E",
  /** Texte principal, blanc cassé. */
  text: "#F4F6FB",
  /** Accents clairs. */
  accent: "#8FB4FF",
  /** Texte discret (mentions). */
  textSubtle: "rgba(244, 246, 251, 0.58)",
} as const;

/** Convertit une couleur hexadécimale (#RRGGBB) en rgba(). */
export const withAlpha = (hex: string, alpha: number): string => {
  const value = hex.replace("#", "");
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/** Convertit #RRGGBB en triplet [0..1] pour les uniforms GLSL (espace sRGB). */
export const hexToVec3 = (hex: string): [number, number, number] => {
  const value = hex.replace("#", "");
  return [
    parseInt(value.slice(0, 2), 16) / 255,
    parseInt(value.slice(2, 4), 16) / 255,
    parseInt(value.slice(4, 6), 16) / 255,
  ];
};

/* -------------------------------------------------------------------------- */
/*  Typographie                                                               */
/* -------------------------------------------------------------------------- */

export const fonts = {
  heading: headingFontFamily,
  body: bodyFontFamily,
} as const;

export const fontWeights = {
  heading: 600,
  headingStrong: 700,
  body: 400,
  bodyMedium: 500,
} as const;

/** Rendu du mot clé de chaque titre (balisé *ainsi* dans les textes). */
export const keyword = {
  /**
   * Dégradé du mot clé : bleu glow vers accent clair. Il démarre au glow
   * (#4D83FF) plutôt qu'au primaire : contraste suffisant sur fond sombre.
   */
  gradient: `linear-gradient(100deg, ${colors.glow} 0%, ${colors.glow} 35%, ${colors.accent} 100%)`,
  /** Lueur autour du mot clé (discrète, pour ne pas éclaircir le fond du texte). */
  glow: withAlpha(colors.primary, 0.38),
} as const;

/* -------------------------------------------------------------------------- */
/*  Glassmorphism                                                             */
/* -------------------------------------------------------------------------- */

export const glass = {
  fill: "rgba(255, 255, 255, 0.05)",
  radius: 20,
  /** Flou + assombrissement de ce qui passe derrière la carte (lisibilité). */
  backdrop: "blur(28px) saturate(1.25) brightness(0.62)",
  borderWidth: 1.5,
  shadow: "0 24px 60px rgba(2, 4, 12, 0.55), 0 2px 10px rgba(2, 4, 12, 0.35)",
} as const;

/* -------------------------------------------------------------------------- */
/*  Fond animé                                                                */
/* -------------------------------------------------------------------------- */

export const background = {
  /**
   * "auto" : shader WebGL si la machine le permet, sinon dégradé CSS (recommandé).
   * "css"  : force le dégradé CSS (rendu le plus rapide, sans WebGL).
   */
  renderer: "auto" as "auto" | "css",
  /** Résolution interne du shader (0,5 = moitié) : dégradé doux, rendu 4x plus rapide. */
  shaderResolution: 0.5,
  /** Vitesse d'écoulement du mesh gradient. */
  flowSpeed: 1,
  /** Assombrissement de la zone centrale de lecture (0 à 1). */
  focusDarken: 0.42,
  /** Opacité du grain. */
  grainOpacity: 0.07,
} as const;

/* -------------------------------------------------------------------------- */
/*  Rythme : timeline globale (30 fps, 960 frames = 32 s)                     */
/* -------------------------------------------------------------------------- */

export const FPS = 30;

export type SceneId =
  | "coldOpen"
  | "query"
  | "processing"
  | "reveal"
  | "value"
  | "outro";

export type SceneTiming = { from: number; duration: number };

/**
 * Durée de chaque scène, dans l'ordre du film. Les débuts de scène et la
 * durée totale en sont déduits : allonger une scène décale automatiquement
 * les suivantes (et la durée de la vidéo).
 */
const SCENE_DURATIONS: [SceneId, number][] = [
  ["coldOpen", 120], //   0 à  4 s
  ["query", 150], //      4 à  9 s
  ["processing", 120], // 9 à 13 s
  ["reveal", 300], //    13 à 23 s
  ["value", 120], //     23 à 27 s
  ["outro", 150], //     27 à 32 s
];

const buildScenes = (): Record<SceneId, SceneTiming> => {
  let from = 0;
  const entries = SCENE_DURATIONS.map(([id, duration]) => {
    const timing = { from, duration };
    from += duration;
    return [id, timing] as const;
  });
  return Object.fromEntries(entries) as Record<SceneId, SceneTiming>;
};

/** Durée totale : 960 frames (32 s) avec les durées ci-dessus. */
export const DURATION_IN_FRAMES = SCENE_DURATIONS.reduce(
  (sum, [, d]) => sum + d,
  0,
);

/** Décalages d'apparition entre éléments d'une liste (4 à 6 frames). */
export const stagger = { tight: 4, base: 5, loose: 6 } as const;

export const timings = {
  fps: FPS,
  durationInFrames: DURATION_IN_FRAMES,
  /** Chevauchement des transitions fondu + parallaxe (3 frames, ~100 ms). */
  overlap: 3,
  /** Durée des sorties de scène (fondu + parallaxe). */
  exit: 10,
  /** Durée de la parallaxe d'entrée des scènes. */
  enter: 18,

  scenes: buildScenes(),

  /* Chorégraphies internes, en frames locales à chaque scène. */
  coldOpen: { consoleIn: 16, labelIn: 28 },
  query: { typingStart: 8, typingEnd: 100, submitAt: 114 },
  processing: {
    chipsIn: 8,
    chipStagger: stagger.base,
    flowDelay: 4,
    subtitleIn: 30,
    wordStagger: stagger.loose,
    convergeAt: 88,
  },
  reveal: {
    /** Flash, transformation de la console, coche de validation. */
    flashAttack: 4,
    processingOff: 4,
    doneIn: 10,
    labelIn: 14,
    mainCardIn: 8,
    titleIn: 14,
    chartIn: 24,
    barStagger: stagger.tight,
    curveIn: 36,
    benefitsIn: 30,
    benefitStagger: stagger.base,
    /** Début de la lente poussée de caméra. */
    pushFrom: 60,
    shineAt: 150,
  },
  value: { linesIn: 0, lineStagger: stagger.loose },
  outro: { logoIn: 0, taglineIn: 10, baselineIn: 20, poweredByIn: 34 },
} as const;

/* -------------------------------------------------------------------------- */
/*  Ressorts (toutes les entrées sont en spring, jamais linéaires)           */
/* -------------------------------------------------------------------------- */

export const springs = {
  /** Entrée douce, sans rebond. */
  smooth: { damping: 200 },
  /** Entrée nerveuse, léger dépassement. */
  snappy: { damping: 18, stiffness: 170, mass: 0.7 },
  /** "Punch" d'échelle de la révélation. */
  punch: { damping: 11, stiffness: 150, mass: 0.85 },
} satisfies Record<string, Partial<SpringConfig>>;

/* -------------------------------------------------------------------------- */
/*  Mise en page des deux formats                                             */
/* -------------------------------------------------------------------------- */

export type FormatLayout = {
  name: "landscape" | "portrait";
  width: number;
  height: number;
  /**
   * Marges de sécurité. `x` est appliquée par les scènes ; `top` et `bottom`
   * documentent les zones d'interface des réseaux (9:16) et ont servi à régler
   * les positions verticales ci-dessous : les ajuster ensemble.
   */
  safe: { x: number; top: number; bottom: number };
  /** Amplitude des parallaxes (px). */
  parallax: number;
  console: {
    width: number;
    centerY: number;
    processingCenterY: number;
    headerCenterY: number;
    headerScale: number;
    padX: number;
    padY: number;
    orbSize: number;
    buttonSize: number;
    gap: number;
    queryMaxFontSize: number;
    queryMinFontSize: number;
    queryMaxLines: number;
    queryLineHeight: number;
    labelFontSize: number;
    labelGap: number;
  };
  processing: {
    chipFontSize: number;
    chipPadX: number;
    chipHeight: number;
    chipGap: number;
    chipsTopY: number;
    rowGap: number;
    arcDepth: number;
    maxChipsPerRow: number;
    subtitleMaxFontSize: number;
    subtitleMinFontSize: number;
    subtitleOffsetY: number;
  };
  reveal: {
    contentTop: number;
    contentBottom: number;
    direction: "row" | "column";
    gap: number;
    mainCard: {
      /** Largeur en mode "row" ; ignorée en "column" (pleine largeur). */
      width: number;
      padding: number;
      titleMaxFontSize: number;
      titleMinFontSize: number;
      titleMaxLines: number;
    };
    benefitCard: {
      /** Hauteur en mode "column" ; en "row", les cartes se partagent la hauteur. */
      height: number;
      padding: number;
      iconSize: number;
      maxFontSize: number;
      minFontSize: number;
      maxLines: number;
    };
  };
  value: { maxWidth: number; maxFontSize: number; minFontSize: number };
  outro: {
    logoHeight: number;
    logoCenterY: number;
    maxWidth: number;
    taglineMaxFontSize: number;
    taglineMinFontSize: number;
    taglineMaxLines: number;
    baselineFontSize: number;
    poweredByFontSize: number;
    poweredByBottom: number;
  };
};

export const layouts: Record<FormatLayout["name"], FormatLayout> = {
  /* 16:9 : 1920 x 1080 */
  landscape: {
    name: "landscape",
    width: 1920,
    height: 1080,
    safe: { x: 96, top: 72, bottom: 72 },
    parallax: 70,
    console: {
      width: 1240,
      centerY: 540,
      processingCenterY: 624,
      headerCenterY: 172,
      headerScale: 0.74,
      padX: 26,
      padY: 26,
      orbSize: 44,
      buttonSize: 56,
      gap: 22,
      queryMaxFontSize: 40,
      queryMinFontSize: 28,
      queryMaxLines: 1,
      queryLineHeight: 1.3,
      labelFontSize: 22,
      labelGap: 22,
    },
    processing: {
      chipFontSize: 24,
      chipPadX: 22,
      chipHeight: 54,
      chipGap: 28,
      chipsTopY: 296,
      rowGap: 84,
      arcDepth: 64,
      maxChipsPerRow: 6,
      subtitleMaxFontSize: 46,
      subtitleMinFontSize: 30,
      subtitleOffsetY: 156,
    },
    reveal: {
      contentTop: 266,
      contentBottom: 1008,
      direction: "row",
      gap: 28,
      mainCard: {
        width: 1000,
        padding: 52,
        titleMaxFontSize: 58,
        titleMinFontSize: 38,
        titleMaxLines: 2,
      },
      benefitCard: {
        height: 0,
        padding: 34,
        iconSize: 60,
        maxFontSize: 34,
        minFontSize: 24,
        maxLines: 2,
      },
    },
    value: { maxWidth: 1600, maxFontSize: 112, minFontSize: 60 },
    outro: {
      logoHeight: 116,
      logoCenterY: 372,
      maxWidth: 1500,
      taglineMaxFontSize: 66,
      taglineMinFontSize: 42,
      taglineMaxLines: 2,
      baselineFontSize: 34,
      poweredByFontSize: 22,
      poweredByBottom: 80,
    },
  },

  /* 9:16 : 1080 x 1920 (zones d'interface TikTok / Reels / Shorts préservées) */
  portrait: {
    name: "portrait",
    width: 1080,
    height: 1920,
    safe: { x: 60, top: 230, bottom: 330 },
    parallax: 90,
    console: {
      width: 960,
      centerY: 900,
      processingCenterY: 1050,
      headerCenterY: 352,
      headerScale: 0.82,
      padX: 26,
      padY: 28,
      orbSize: 48,
      buttonSize: 60,
      gap: 20,
      queryMaxFontSize: 46,
      queryMinFontSize: 32,
      queryMaxLines: 2,
      queryLineHeight: 1.25,
      labelFontSize: 28,
      labelGap: 24,
    },
    processing: {
      chipFontSize: 28,
      chipPadX: 24,
      chipHeight: 62,
      chipGap: 22,
      chipsTopY: 560,
      rowGap: 98,
      arcDepth: 0,
      maxChipsPerRow: 3,
      subtitleMaxFontSize: 48,
      subtitleMinFontSize: 30,
      subtitleOffsetY: 232,
    },
    reveal: {
      contentTop: 486,
      // 1578 : avec la poussée de caméra (x 1,02), les cartes restent au-dessus de y = 1590.
      contentBottom: 1578,
      direction: "column",
      gap: 24,
      mainCard: {
        width: 0,
        padding: 44,
        titleMaxFontSize: 62,
        titleMinFontSize: 40,
        titleMaxLines: 3,
      },
      benefitCard: {
        height: 136,
        padding: 28,
        iconSize: 56,
        maxFontSize: 36,
        minFontSize: 26,
        maxLines: 2,
      },
    },
    value: { maxWidth: 940, maxFontSize: 100, minFontSize: 56 },
    outro: {
      logoHeight: 132,
      logoCenterY: 780,
      maxWidth: 940,
      taglineMaxFontSize: 66,
      taglineMinFontSize: 42,
      taglineMaxLines: 3,
      baselineFontSize: 38,
      poweredByFontSize: 26,
      poweredByBottom: 380,
    },
  },
};
