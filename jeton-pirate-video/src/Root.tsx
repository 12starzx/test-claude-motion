/**
 * Compositions « JetonPirate » (vidéo 1) et « JetonPirate2 » (vidéo 2,
 * « la mission ») : 1080 x 1920, 30 i/s.
 * Rendu : npm run render (sortie dans out/).
 */
import { Composition, Folder } from "remotion";
import { TOTAL_FRAMES } from "./timeline";
import { VIDEO } from "./theme";
import { JetonVideo } from "./Video";
import { timeline2 } from "./v2/timeline";
import { JetonVideo2 } from "./v2/Video2";

export const RemotionRoot: React.FC = () => (
  <Folder name="Jeton-pirate">
    <Composition
      id="JetonPirate"
      component={JetonVideo}
      width={VIDEO.width}
      height={VIDEO.height}
      fps={VIDEO.fps}
      durationInFrames={TOTAL_FRAMES}
    />
    <Composition
      id="JetonPirate2"
      component={JetonVideo2}
      width={VIDEO.width}
      height={VIDEO.height}
      fps={VIDEO.fps}
      durationInFrames={timeline2.totalFrames}
    />
  </Folder>
);
