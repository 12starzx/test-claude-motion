/**
 * Logo BIMfinity.
 *
 * - Si /public/logo.svg existe, il est importé tel quel (jamais redessiné).
 * - Sinon, un placeholder neutre et propre est affiché : un monogramme en
 *   verre et le nom de marque en Space Grotesk. Il signale l'emplacement du
 *   logo sans prétendre en être un.
 */
import { Img, staticFile } from "remotion";
import { LOGO_FILE, useAssetAvailable } from "../../lib/assets";
import { useFitText } from "../../lib/fit";
import { colors, fontWeights, fonts, withAlpha } from "../../theme";

type LogoProps = {
  height: number;
  brandName: string;
  /** Le fichier fourni contient-il déjà le nom de marque ? */
  logoIncludesName: boolean;
  /** Largeur maximale autorisée (garde-fou anti-débordement). */
  maxWidth: number;
};

/** Nom de marque, réduit si nécessaire pour tenir dans la largeur disponible. */
const BrandName: React.FC<{ name: string; size: number; maxWidth: number }> = ({
  name,
  size,
  maxWidth,
}) => {
  const fit = useFitText({
    text: name,
    fontFamily: fonts.heading,
    fontWeight: fontWeights.headingStrong,
    letterSpacingEm: -0.03,
    maxWidth,
    maxLines: 1,
    maxFontSize: size,
    minFontSize: Math.round(size * 0.5),
  });
  return (
    <span
      style={{
        fontFamily: fonts.heading,
        fontWeight: fontWeights.headingStrong,
        fontSize: fit.fontSize,
        letterSpacing: "-0.03em",
        color: colors.text,
        lineHeight: 1,
        whiteSpace: "nowrap",
      }}
    >
      {name}
    </span>
  );
};

const PlaceholderMark: React.FC<{ size: number; initial: string }> = ({
  size,
  initial,
}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.28,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: `linear-gradient(145deg, ${colors.primary} 0%, ${colors.deep} 100%)`,
      boxShadow: `0 0 ${size * 0.5}px ${withAlpha(colors.primary, 0.45)}, inset 0 1px 0 rgba(255,255,255,0.25)`,
      fontFamily: fonts.heading,
      fontWeight: fontWeights.headingStrong,
      fontSize: size * 0.52,
      color: colors.text,
      lineHeight: 1,
    }}
  >
    {initial}
  </div>
);

export const Logo: React.FC<LogoProps> = ({
  height,
  brandName,
  logoIncludesName,
  maxWidth,
}) => {
  const hasLogo = useAssetAvailable(LOGO_FILE);
  const gap = height * 0.28;
  const markSize = height * 0.86;

  if (hasLogo) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap, maxWidth }}>
        <Img
          src={staticFile(LOGO_FILE)}
          alt={brandName}
          style={{
            height,
            width: "auto",
            maxWidth: logoIncludesName ? maxWidth : maxWidth * 0.4 - gap,
            objectFit: "contain",
          }}
        />
        {logoIncludesName ? null : (
          <BrandName
            name={brandName}
            size={height * 0.62}
            maxWidth={maxWidth * 0.6}
          />
        )}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap, maxWidth }}>
      <PlaceholderMark size={markSize} initial={brandName.charAt(0)} />
      <BrandName
        name={brandName}
        size={height * 0.62}
        maxWidth={maxWidth - markSize - gap}
      />
    </div>
  );
};
