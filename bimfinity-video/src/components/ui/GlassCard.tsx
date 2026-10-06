/**
 * Carte « glassmorphism » BIMfinity.
 *
 * - Fond rgba(255,255,255,0.05) + backdrop-filter (flou et assombrissement :
 *   le texte reste lisible même quand le bloom s'intensifie derrière).
 * - Bordure dégradée qui « brille » : un dégradé conique en rotation lente,
 *   découpé en anneau par masque.
 * - Lueur bleue et ombres douces.
 *
 * Les calques décoratifs sont en z-index -1 : la carte (backdrop-filter)
 * crée son propre contexte d'empilement, ils passent donc sous le contenu.
 *
 * Important : l'opacité est appliquée sur la carte elle-même, jamais sur un
 * parent. Une opacité < 1 sur un ancêtre isolerait le backdrop-filter du fond
 * (notion de « backdrop root ») et le flou disparaîtrait pendant les fondus.
 */
import type { CSSProperties, ReactNode } from "react";
import { useCurrentFrame } from "remotion";
import { colors, glass, withAlpha } from "../../theme";

type GlassCardProps = {
  children?: ReactNode;
  style?: CSSProperties;
  /** Opacité finale de la carte (entrée × transition de scène). */
  opacity?: number;
  /** Intensité de la lueur (0 à 1). */
  glow?: number;
  /** Rayon des coins. */
  radius?: number;
  /** Décalage de phase de la bordure animée (pour désynchroniser les cartes). */
  phase?: number;
  /**
   * Horloge de la bordure animée. Par défaut, la frame de la séquence ; la
   * console passe la frame globale pour rester identique d'une scène à l'autre.
   */
  clockFrame?: number;
};

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  opacity = 1,
  glow = 0.5,
  radius = glass.radius,
  phase = 0,
  clockFrame,
}) => {
  const frame = useCurrentFrame();
  const angle = ((clockFrame ?? frame) * 0.9 + phase * 90) % 360;

  return (
    <div
      style={{
        position: "relative",
        borderRadius: radius,
        background: glass.fill,
        backdropFilter: glass.backdrop,
        WebkitBackdropFilter: glass.backdrop,
        boxShadow: `${glass.shadow}, 0 0 ${48 + 40 * glow}px ${withAlpha(colors.primary, 0.1 + 0.22 * glow)}`,
        opacity,
        ...style,
      }}
    >
      {/* Reflet supérieur : donne la matière « verre ». */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: radius,
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 38%)",
          pointerEvents: "none",
          zIndex: -1,
        }}
      />
      {/* Bordure dégradée lumineuse. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: radius,
          padding: glass.borderWidth,
          background: `conic-gradient(from ${angle}deg, ${withAlpha(colors.accent, 0.85)}, ${withAlpha(colors.primary, 0.18)} 22%, rgba(255,255,255,0.07) 48%, ${withAlpha(colors.glow, 0.55)} 74%, ${withAlpha(colors.accent, 0.85)})`,
          mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          maskComposite: "exclude",
          opacity: 0.55 + 0.45 * glow,
          pointerEvents: "none",
          zIndex: -1,
        }}
      />
      {children}
    </div>
  );
};
