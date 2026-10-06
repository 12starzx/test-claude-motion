/**
 * Configuration du rendu CLI (npx remotion render / studio).
 * Toutes les options : https://remotion.dev/docs/config
 */
import { Config } from "@remotion/cli/config";

Config.setRspack(true);
Config.setOverwriteOutput(true);

// Qualité « premium » : images intermédiaires peu compressées et H.264 généreux,
// pour préserver les dégradés sombres sans aplats (banding).
Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(95);
Config.setCodec("h264");
Config.setCrf(16);
Config.setPixelFormat("yuv420p");

// WebGL du fond animé : "angle" est le moteur recommandé pour @remotion/three.
// Sur un serveur Linux sans GPU, "swangle" (rendu logiciel) fonctionne aussi.
Config.setChromiumOpenGlRenderer("angle");
