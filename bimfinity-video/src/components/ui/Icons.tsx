/**
 * Icônes au trait, dessinées pour BIMfinity (aucune bibliothèque tierce).
 * `progress` (0 → 1) anime le tracé, comme un dessin à la plume.
 */
import { colors } from "../../theme";
import type { BenefitIcon } from "../../schema";

type StrokeProps = { d: string; progress: number; width?: number; color?: string };

const Stroke: React.FC<StrokeProps> = ({ d, progress, width = 1.7, color = colors.accent }) => (
  <path
    d={d}
    pathLength={1}
    fill="none"
    stroke={color}
    strokeWidth={width}
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeDasharray={1}
    strokeDashoffset={1 - progress}
    opacity={progress > 0.001 ? 1 : 0}
  />
);

/** Tracés en repère 24 x 24. */
const ICONS: Record<BenefitIcon, { main: string[]; accent: string[] }> = {
  // Bouclier + validation : conformité sécurisée.
  shield: {
    main: ["M12 3.2 L19 6 V11.2 C19 15.6 16.1 18.9 12 20.8 C7.9 18.9 5 15.6 5 11.2 V6 Z"],
    accent: ["M8.9 12 L11.2 14.3 L15.4 9.9"],
  },
  // Jauge maîtrisée : CAPEX sous contrôle.
  gauge: {
    main: ["M4.2 16.5 A8.2 8.2 0 0 1 19.8 16.5", "M6.4 11.2 L7.5 12", "M12 7.6 V8.9", "M17.6 11.2 L16.5 12"],
    accent: ["M12 16.5 L14.9 11.6", "M10.6 16.5 A1.4 1.4 0 1 0 13.4 16.5"],
  },
  // Trajectoire ascendante : valeur défendue.
  trend: {
    main: ["M4 19.5 H20", "M4 19.5 V4.5"],
    accent: ["M6.5 15.5 L10.4 11.6 L13.2 14.2 L18.6 8.6", "M15.2 8.4 H18.8 V12"],
  },
};

export const BenefitIconGlyph: React.FC<{
  icon: BenefitIcon;
  size: number;
  progress: number;
}> = ({ icon, size, progress }) => {
  const { main, accent } = ICONS[icon];
  const accentProgress = Math.max(0, Math.min(1, progress * 1.6 - 0.6));
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ overflow: "visible" }}>
      {main.map((d) => (
        <Stroke key={d} d={d} progress={Math.min(1, progress * 1.25)} color={colors.accent} />
      ))}
      {accent.map((d) => (
        <Stroke key={d} d={d} progress={accentProgress} color={colors.text} width={1.9} />
      ))}
    </svg>
  );
};

/** Flèche d'envoi de la console. */
export const SendArrow: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path
      d="M5 12 H18.5 M13 6.5 L18.5 12 L13 17.5"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/** Coche de validation (console après envoi). */
export const CheckMark: React.FC<{ size: number; color: string; progress: number }> = ({
  size,
  color,
  progress,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <Stroke d="M6 12.4 L10.2 16.4 L18 8.2" progress={progress} color={color} width={2.2} />
  </svg>
);
