/**
 * Console « copilote de décision » BIMfinity (design original).
 *
 * Composant purement visuel : son état complet est fourni par la scène qui
 * l'affiche (apparition, frappe, validation, traitement, transformation).
 * La console a donc exactement le même rendu d'une scène à l'autre, ce qui
 * permet des raccords invisibles entre les scènes 1, 2, 3 et 4.
 *
 * Anatomie :
 *   [micro-label]
 *   [orbe] [texte tapé + curseur ............] [bouton d'envoi]
 */
import { Fragment } from "react";
import { useFitText } from "../../lib/fit";
import { useLayout } from "../../lib/layout";
import { frenchTypography } from "../../lib/typography";
import { colors, fontWeights, fonts, glass, withAlpha } from "../../theme";
import { GlassCard } from "../ui/GlassCard";
import { CheckMark, SendArrow } from "../ui/Icons";

export type ConsoleState = {
  /** Apparition de la console (0 → 1). */
  appear: number;
  /** Opacité du micro-label (0 → 1). */
  labelOpacity: number;
  /** Nombre de caractères tapés. */
  typedCount: number;
  /** Opacité du curseur (0 → 1). */
  cursor: number;
  /** Lueur de validation (enveloppe 0 → 1 → 0). */
  pulse: number;
  /** Anneau de validation qui s'étend (0 → 1). */
  ring: number;
  /** Bouton d'envoi activé (0 → 1). */
  submitted: number;
  /** Intensité du traitement (0 → 1). */
  processing: number;
  /** Requête traitée : la flèche devient une coche (0 → 1). */
  done: number;
  /** Centre vertical de la barre (px, repère de la scène). */
  centerY: number;
  /** Échelle de la console. */
  scale: number;
};

export const initialConsoleState: ConsoleState = {
  appear: 1,
  labelOpacity: 1,
  typedCount: 0,
  cursor: 0,
  pulse: 0,
  ring: 0,
  submitted: 0,
  processing: 0,
  done: 0,
  centerY: 0,
  scale: 1,
};

/** Géométrie de la console, partagée avec les scènes (flux de données, en-tête). */
export const useConsoleGeometry = (query: string) => {
  const layout = useLayout();
  const c = layout.console;
  const textWidth = c.width - c.padX * 2 - c.orbSize - c.buttonSize - c.gap * 2;
  const fit = useFitText({
    text: frenchTypography(query),
    fontFamily: fonts.body,
    fontWeight: fontWeights.body,
    letterSpacingEm: -0.01,
    maxWidth: textWidth,
    maxLines: c.queryMaxLines,
    maxFontSize: c.queryMaxFontSize,
    minFontSize: c.queryMinFontSize,
    lineHeight: c.queryLineHeight,
  });
  const lineCount = Math.max(1, fit.lines.length);
  const barHeight = Math.round(c.padY * 2 + lineCount * fit.fontSize * c.queryLineHeight);
  return {
    width: c.width,
    left: (layout.width - c.width) / 2,
    barHeight,
    textWidth,
    fontSize: fit.fontSize,
  };
};

/* ---------- Texte tapé, sans aucun reflux ---------- */

/**
 * Le texte complet est toujours mis en page (les caractères non tapés sont
 * invisibles) : les mots ne sautent jamais de ligne pendant la frappe.
 * Chaque mot est insécable, curseur compris.
 */
const TypedText: React.FC<{ text: string; count: number; cursor: number }> = ({
  text,
  count,
  cursor,
}) => {
  const words = text.split(" ");
  let offset = 0;

  const caret = (
    <span style={{ position: "relative", display: "inline-block", width: 0, height: "1em" }}>
      <span
        style={{
          position: "absolute",
          left: 1,
          bottom: "-0.2em",
          width: 3,
          height: "1.18em",
          borderRadius: 2,
          background: colors.accent,
          boxShadow: `0 0 12px ${withAlpha(colors.glow, 0.9)}`,
          opacity: cursor,
        }}
      />
    </span>
  );

  return (
    <>
      {words.map((word, wordIndex) => {
        const start = offset;
        const characters = Array.from(word);
        offset += characters.length + 1;
        const end = start + characters.length;
        const caretAtEnd = count === end;
        return (
          <Fragment key={wordIndex}>
            <span style={{ whiteSpace: "nowrap" }}>
              {characters.map((character, charIndex) => {
                const index = start + charIndex;
                return (
                  <Fragment key={charIndex}>
                    {count === index ? caret : null}
                    <span style={{ visibility: index < count ? "visible" : "hidden" }}>
                      {character}
                    </span>
                  </Fragment>
                );
              })}
              {caretAtEnd ? caret : null}
            </span>
            {wordIndex < words.length - 1 ? " " : null}
          </Fragment>
        );
      })}
    </>
  );
};

/* ---------- Orbe « présence du copilote » ---------- */

const Orb: React.FC<{ size: number; activity: number; frame: number }> = ({
  size,
  activity,
  frame,
}) => {
  const rotation = frame * (1.2 + 7 * activity);
  const breathe = 1 + 0.06 * activity * Math.sin(frame * 0.35);
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: `conic-gradient(from ${rotation}deg, ${colors.accent}, ${withAlpha(colors.primary, 0.05)} 35%, ${colors.glow} 70%, ${colors.accent})`,
          mask: "radial-gradient(circle, transparent 57%, #000 61%)",
          opacity: 0.85,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: "26%",
          borderRadius: "50%",
          background: `radial-gradient(circle at 35% 30%, ${colors.accent} 0%, ${colors.primary} 45%, ${colors.deep} 100%)`,
          boxShadow: `0 0 ${10 + 22 * activity}px ${withAlpha(colors.glow, 0.55 + 0.4 * activity)}`,
          transform: `scale(${breathe})`,
        }}
      />
    </div>
  );
};

/* ---------- Bouton d'envoi ---------- */

const SendButton: React.FC<{
  size: number;
  submitted: number;
  pulse: number;
  done: number;
}> = ({ size, submitted, pulse, done }) => {
  const icon = size * 0.46;
  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: 14,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `linear-gradient(145deg, ${withAlpha(colors.primary, 0.12 + 0.88 * submitted)}, ${withAlpha(colors.deep, 0.2 + 0.8 * submitted)})`,
        border: `1px solid ${withAlpha(colors.accent, 0.18 + 0.3 * submitted)}`,
        boxShadow: `0 0 ${16 + 30 * pulse}px ${withAlpha(colors.primary, 0.25 * submitted + 0.5 * pulse)}`,
        transform: `scale(${1 - 0.08 * pulse})`,
      }}
    >
      <div style={{ position: "absolute", opacity: 1 - done }}>
        <SendArrow size={icon} color={submitted > 0.5 ? colors.text : colors.accent} />
      </div>
      <div style={{ position: "absolute", opacity: done }}>
        <CheckMark size={icon} color={colors.text} progress={done} />
      </div>
    </div>
  );
};

/* ---------- Console ---------- */

export const CopilotConsole: React.FC<{
  label: string;
  query: string;
  state: ConsoleState;
  /** Frame globale (pour les boucles continues d'une scène à l'autre). */
  globalFrame: number;
}> = ({ label, query, state, globalFrame }) => {
  const layout = useLayout();
  const c = layout.console;
  const geometry = useConsoleGeometry(query);
  const text = frenchTypography(query);
  const appearScale = 0.94 + 0.06 * state.appear;

  // Balayage lumineux du traitement, en boucle continue.
  const sweep = ((globalFrame % 40) / 40) * 140 - 20;

  return (
    <div
      style={{
        position: "absolute",
        left: geometry.left,
        top: state.centerY - geometry.barHeight / 2,
        width: geometry.width,
        height: geometry.barHeight,
        transform: `scale(${state.scale * appearScale})`,
        transformOrigin: "50% 50%",
      }}
    >
      {/* Micro-label */}
      <div
        style={{
          position: "absolute",
          left: c.padX,
          right: c.padX,
          bottom: `calc(100% + ${c.labelGap}px)`,
          display: "flex",
          alignItems: "center",
          gap: 12,
          opacity: state.labelOpacity,
          fontFamily: fonts.body,
          fontWeight: fontWeights.bodyMedium,
          fontSize: c.labelFontSize,
          letterSpacing: "0.04em",
          color: colors.accent,
          whiteSpace: "nowrap",
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: colors.glow,
            boxShadow: `0 0 12px ${colors.glow}`,
            opacity: 0.6 + 0.4 * Math.abs(Math.sin(globalFrame * 0.08)),
            flexShrink: 0,
          }}
        />
        <span>{frenchTypography(label)}</span>
      </div>

      {/* Anneau de validation */}
      <div
        style={{
          position: "absolute",
          inset: -3,
          borderRadius: glass.radius + 3,
          border: `2px solid ${colors.glow}`,
          boxShadow: `0 0 24px ${withAlpha(colors.glow, 0.8)}`,
          transform: `scale(${1 + 0.05 * state.ring})`,
          opacity: state.pulse * (1 - state.ring * 0.7),
        }}
      />

      {/* Barre de saisie */}
      <GlassCard
        opacity={state.appear}
        glow={Math.min(1, 0.3 + 0.7 * state.pulse + 0.45 * state.processing)}
        phase={0}
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          gap: c.gap,
          padding: `0 ${c.padX}px`,
          boxSizing: "border-box",
          overflow: "hidden",
          filter: state.appear < 1 ? `blur(${(1 - state.appear) * 14}px)` : undefined,
        }}
      >
        <Orb size={c.orbSize} activity={Math.max(state.processing, state.pulse * 0.6)} frame={globalFrame} />
        <div
          style={{
            flex: 1,
            minWidth: 0,
            fontFamily: fonts.body,
            fontWeight: fontWeights.body,
            fontSize: geometry.fontSize,
            lineHeight: c.queryLineHeight,
            letterSpacing: "-0.01em",
            color: colors.text,
            opacity: 1 - 0.18 * state.processing * (1 - state.done),
          }}
        >
          <TypedText text={text} count={state.typedCount} cursor={state.cursor} />
        </div>
        <SendButton
          size={c.buttonSize}
          submitted={state.submitted}
          pulse={state.pulse}
          done={state.done}
        />

        {/* Ligne de traitement : un reflet qui parcourt le bas de la barre. */}
        <div
          style={{
            position: "absolute",
            left: 18,
            right: 18,
            bottom: 0,
            height: 2,
            borderRadius: 2,
            opacity: state.processing * (1 - state.done),
            background: `linear-gradient(90deg, transparent ${sweep - 18}%, ${colors.accent} ${sweep}%, transparent ${sweep + 18}%)`,
            boxShadow: `0 0 12px ${withAlpha(colors.glow, 0.6)}`,
          }}
        />
      </GlassCard>
    </div>
  );
};
