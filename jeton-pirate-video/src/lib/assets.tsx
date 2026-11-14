/**
 * AssetGate : attend les polices et vérifie la présence des fichiers audio
 * optionnels de /public avant de monter la vidéo. Un fichier absent n'est
 * jamais une erreur : la piste correspondante est simplement ignorée.
 */
import { createContext, useContext, useEffect, useState } from "react";
import { staticFile, useDelayRender } from "remotion";
import { waitForFonts } from "../fonts";

type Availability = Record<string, boolean>;

const AssetContext = createContext<Availability>({});

export const useAssetAvailable = (file: string): boolean =>
  useContext(AssetContext)[file] === true;

const probeCache = new Map<string, Promise<boolean>>();

const fileExists = (file: string): Promise<boolean> => {
  if (!probeCache.has(file)) {
    probeCache.set(
      file,
      fetch(staticFile(file), { method: "HEAD", cache: "no-store" })
        .then((r) => r.ok)
        .catch(() => false),
    );
  }
  return probeCache.get(file) as Promise<boolean>;
};

export const AssetGate: React.FC<{
  files: string[];
  children: React.ReactNode;
}> = ({ files, children }) => {
  const { delayRender, continueRender } = useDelayRender();
  const [handle] = useState(() => delayRender("Polices et fichiers audio"));
  const [availability, setAvailability] = useState<Availability | null>(null);
  const key = files.join("|");

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      waitForFonts().catch((error: unknown) => {
        console.warn(
          "[Jeton] Polices non chargées, police de secours utilisée.",
          error,
        );
      }),
      Promise.all(
        (key ? key.split("|") : []).map(
          async (f) => [f, await fileExists(f)] as const,
        ),
      ),
    ]).then(([, entries]) => {
      if (!cancelled) {
        setAvailability(Object.fromEntries(entries));
      }
      continueRender(handle);
    });
    return () => {
      cancelled = true;
    };
  }, [key, handle, continueRender]);

  if (availability === null) {
    return null;
  }
  return (
    <AssetContext.Provider value={availability}>
      {children}
    </AssetContext.Provider>
  );
};
