/**
 * Définitions SVG partagées (filtres, dégradés), montées une seule fois.
 * Les autres calques SVG du document y font référence par url(#…).
 */
import { palette } from "../../theme";

export const SvgDefs: React.FC = () => (
  <svg width={0} height={0} style={{ position: "absolute" }} aria-hidden>
    <defs>
      {/* Halo doux autour des traits clairs. */}
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="glowStrong" x="-80%" y="-80%" width="260%" height="260%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="soft" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="14" />
      </filter>
      <filter id="haze" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="40" />
      </filter>

      {/* Jeton */}
      <radialGradient id="coinFace" cx="38%" cy="32%" r="75%">
        <stop offset="0%" stopColor={palette.goldLight} />
        <stop offset="45%" stopColor={palette.gold} />
        <stop offset="100%" stopColor={palette.goldDeep} />
      </radialGradient>
      <linearGradient id="coinRim" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#ffe9b8" />
        <stop offset="50%" stopColor={palette.gold} />
        <stop offset="100%" stopColor="#a8420a" />
      </linearGradient>
      <radialGradient id="goldHalo">
        <stop offset="0%" stopColor={`rgba(${palette.goldGlow}, 0.75)`} />
        <stop offset="40%" stopColor={`rgba(${palette.goldGlow}, 0.28)`} />
        <stop offset="100%" stopColor={`rgba(${palette.goldGlow}, 0)`} />
      </radialGradient>

      <linearGradient id="chestGap" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stopColor={palette.goldLight} stopOpacity={0.95} />
        <stop offset="100%" stopColor={palette.gold} stopOpacity={0.15} />
      </linearGradient>
      <linearGradient id="chestGapCold" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stopColor="#c9d6ff" stopOpacity={0.6} />
        <stop offset="100%" stopColor="#c9d6ff" stopOpacity={0.05} />
      </linearGradient>

      {/* Faisceau de lune */}
      <linearGradient id="beamFill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={`rgba(${palette.beam}, 0.34)`} />
        <stop offset="70%" stopColor={`rgba(${palette.beam}, 0.10)`} />
        <stop offset="100%" stopColor={`rgba(${palette.beam}, 0)`} />
      </linearGradient>
      <radialGradient id="poolFill">
        <stop offset="0%" stopColor={`rgba(${palette.beam}, 0.32)`} />
        <stop offset="100%" stopColor={`rgba(${palette.beam}, 0)`} />
      </radialGradient>
      <radialGradient id="heroHalo">
        <stop offset="0%" stopColor="rgba(63, 227, 255, 0.45)" />
        <stop offset="100%" stopColor="rgba(63, 227, 255, 0)" />
      </radialGradient>

      {/* Mer */}
      <linearGradient id="seaFill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#0d1b44" />
        <stop offset="100%" stopColor="#04081a" />
      </linearGradient>
      <linearGradient id="skyGlow" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="rgba(40, 70, 150, 0)" />
        <stop offset="100%" stopColor="rgba(60, 100, 200, 0.28)" />
      </linearGradient>
    </defs>
  </svg>
);
