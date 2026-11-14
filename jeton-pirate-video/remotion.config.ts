/**
 * Configuration du rendu CLI (npx remotion render / studio).
 * Toutes les options : https://remotion.dev/docs/config
 */
import { Config } from "@remotion/cli/config";

Config.setOverwriteOutput(true);

// Dégradés sombres : images intermédiaires peu compressées, H.264 généreux.
Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(95);
Config.setCodec("h264");
Config.setCrf(17);
Config.setPixelFormat("yuv420p");

// Navigateur : si REMOTION_BROWSER est défini (machine sans accès au
// téléchargement automatique de Chrome Headless Shell), on l'utilise.
if (process.env.REMOTION_BROWSER) {
  Config.setBrowserExecutable(process.env.REMOTION_BROWSER);
}
