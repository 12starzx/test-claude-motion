/**
 * Mise en page responsive : chaque scène est conçue pour deux formats de
 * référence (1920 x 1080 et 1080 x 1920). Le format est choisi selon
 * l'orientation de la composition ; si la taille diffère (4K, carré…),
 * la scène de référence est mise à l'échelle sans déformation.
 */
import { AbsoluteFill, useVideoConfig } from "remotion";
import { layouts } from "../theme";
import type { FormatLayout } from "../theme";

export const useLayout = (): FormatLayout => {
  const { width, height } = useVideoConfig();
  return width >= height ? layouts.landscape : layouts.portrait;
};

/** Scène de référence, centrée et mise à l'échelle dans la composition. */
export const Stage: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { width, height } = useVideoConfig();
  const layout = useLayout();
  const scale = Math.min(width / layout.width, height / layout.height);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          width: layout.width,
          height: layout.height,
          left: (width - layout.width * scale) / 2,
          top: (height - layout.height * scale) / 2,
          transform: scale === 1 ? undefined : `scale(${scale})`,
          transformOrigin: "0 0",
          overflow: "hidden",
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
};
