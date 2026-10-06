/**
 * AssetGate : prépare le rendu avant de monter les scènes.
 *
 * 1. Attend le chargement des polices (les mesures de texte en dépendent).
 * 2. Vérifie la présence des fichiers optionnels de /public (logo, bande-son).
 *    Un fichier absent n'est jamais une erreur : le logo bascule sur un
 *    placeholder et la piste audio correspondante est simplement ignorée.
 */
import { createContext, useContext, useEffect, useState } from "react";
import { staticFile, useDelayRender } from "remotion";
import { waitForFonts } from "../fonts";

export const LOGO_FILE = "logo.svg";

export type AssetAvailability = Record<string, boolean>;

const AssetContext = createContext<AssetAvailability>({});

/** Indique si un fichier de /public est disponible (chemin relatif à /public). */
export const useAssetAvailable = (file: string): boolean =>
  useContext(AssetContext)[file] === true;

const fileExists = async (file: string): Promise<boolean> => {
  const url = staticFile(file);
  try {
    const head = await fetch(url, { method: "HEAD", cache: "no-store" });
    if (head.ok) {
      return true;
    }
    if (head.status !== 405 && head.status !== 501) {
      return false;
    }
    // Serveur sans HEAD : on tente un GET minimal.
    const get = await fetch(url, {
      headers: { Range: "bytes=0-0" },
      cache: "no-store",
    });
    return get.ok;
  } catch {
    return false;
  }
};

/** Cache par onglet de rendu : chaque fichier n'est vérifié qu'une fois. */
const probeCache = new Map<string, Promise<boolean>>();

const probeFiles = async (files: string[]): Promise<AssetAvailability> => {
  const entries = await Promise.all(
    files.map(async (file) => {
      if (!probeCache.has(file)) {
        probeCache.set(file, fileExists(file));
      }
      return [file, await (probeCache.get(file) as Promise<boolean>)] as const;
    }),
  );
  return Object.fromEntries(entries);
};

export const AssetGate: React.FC<{
  optionalFiles: string[];
  children: React.ReactNode;
}> = ({ optionalFiles, children }) => {
  const { delayRender, continueRender } = useDelayRender();
  const [handle] = useState(() =>
    delayRender(
      "BIMfinity : chargement des polices et des fichiers optionnels",
    ),
  );
  const [availability, setAvailability] = useState<AssetAvailability | null>(
    null,
  );
  const filesKey = optionalFiles.join("|");

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      waitForFonts().catch((error: unknown) => {
        // Les polices de secours prennent le relais : le rendu continue.
        console.warn(
          "[BIMfinity] Polices non chargées, police de secours utilisée.",
          error,
        );
      }),
      probeFiles(filesKey ? filesKey.split("|") : []),
    ]).then(([, result]) => {
      if (!cancelled) {
        setAvailability(result);
      }
      continueRender(handle);
    });
    return () => {
      cancelled = true;
    };
  }, [filesKey, handle, continueRender]);

  if (availability === null) {
    return null;
  }

  return (
    <AssetContext.Provider value={availability}>
      {children}
    </AssetContext.Provider>
  );
};
