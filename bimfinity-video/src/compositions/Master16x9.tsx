/**
 * Composition « Master-16x9 » : 1920 x 1080, 30 fps, 960 frames (32 s).
 * Rendu : npx remotion render Master-16x9 bimfinity-16x9.mp4
 */
import { Composition } from "remotion";
import {
  bimfinitySchema,
  defaultBimfinityProps,
  validateBimfinityProps,
} from "../schema";
import { layouts, timings } from "../theme";
import { BimfinityVideo } from "./BimfinityVideo";

export const Master16x9: React.FC = () => (
  <Composition
    id="Master-16x9"
    component={BimfinityVideo}
    schema={bimfinitySchema}
    defaultProps={defaultBimfinityProps}
    calculateMetadata={validateBimfinityProps}
    width={layouts.landscape.width}
    height={layouts.landscape.height}
    fps={timings.fps}
    durationInFrames={timings.durationInFrames}
  />
);
