/**
 * Composition « JetonPirate » : 1080 x 1920, 30 i/s, 71 s.
 * Rendu : npm run render (sortie dans out/).
 */
import { Composition } from "remotion";
import { TOTAL_FRAMES } from "./timeline";
import { VIDEO } from "./theme";
import { JetonVideo } from "./Video";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="JetonPirate"
    component={JetonVideo}
    width={VIDEO.width}
    height={VIDEO.height}
    fps={VIDEO.fps}
    durationInFrames={TOTAL_FRAMES}
  />
);
