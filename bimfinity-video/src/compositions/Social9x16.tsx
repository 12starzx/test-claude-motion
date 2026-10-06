/**
 * Composition « Social-9x16 » : 1080 x 1920, 30 fps, 960 frames (32 s).
 * Mêmes scènes que le master, recadrées pour le vertical (zones d'interface
 * des réseaux sociaux préservées).
 * Rendu : npx remotion render Social-9x16 bimfinity-9x16.mp4
 */
import { Composition } from "remotion";
import {
  bimfinitySchema,
  defaultBimfinityProps,
  validateBimfinityProps,
} from "../schema";
import { layouts, timings } from "../theme";
import { BimfinityVideo } from "./BimfinityVideo";

export const Social9x16: React.FC = () => (
  <Composition
    id="Social-9x16"
    component={BimfinityVideo}
    schema={bimfinitySchema}
    defaultProps={defaultBimfinityProps}
    calculateMetadata={validateBimfinityProps}
    width={layouts.portrait.width}
    height={layouts.portrait.height}
    fps={timings.fps}
    durationInFrames={timings.durationInFrames}
  />
);
