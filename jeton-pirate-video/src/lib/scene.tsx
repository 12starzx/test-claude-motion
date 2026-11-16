/**
 * Cadre commun des scènes : temps local, transitions d'entrée et de sortie,
 * lente poussée de caméra.
 */
import { createContext, useContext } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { useTimeline } from "./timelineTools";
import { VIDEO } from "../theme";
import { clamp01, easeOut } from "./anim";

type SceneInfo = { start: number; duration: number };

const SceneContext = createContext<SceneInfo>({ start: 0, duration: 1 });

export const SceneProvider = SceneContext.Provider;

/** Temps local (s) et accès aux répliques, relatifs au début de la scène. */
export const useSceneTime = () => {
  const frame = useCurrentFrame();
  const { start, duration } = useContext(SceneContext);
  const { cueAt, cuePartAt } = useTimeline();
  const t = frame / VIDEO.fps;
  return {
    t,
    duration,
    /** Instant local (s) d'une réplique du conducteur. */
    at: (id: string) => cueAt(id) - start,
    /** Instant local (s) d'une ligne d'une réplique (ex. le mot-choc). */
    atPart: (id: string, index: number) => cuePartAt(id, index) - start,
  };
};

/** Durée des fondus enchaînés entre scènes (s). */
export const TRANSITION = 0.2;

/**
 * Caméra de la scène, appliquée À L'INTÉRIEUR du dessin SVG (voir Stage).
 *
 * Un zoom CSS sur un calque dont le contenu reste immobile laisse le
 * navigateur recomposer des tuiles calculées à des échelles différentes
 * (grille « dédoublée »). Une transformation SVG force au contraire un
 * recalcul complet du dessin à chaque image.
 */
type Camera = { scale: number; ox: number; oy: number };

const CameraContext = createContext<Camera>({ scale: 1, ox: 540, oy: 1056 });

/**
 * Enveloppe visuelle d'une scène : entrée en léger zoom arrière avec flou,
 * sortie en fondu, poussée de caméra continue.
 */
export const SceneShell: React.FC<{
  children: React.ReactNode;
  /** Amplitude de la poussée de caméra sur toute la scène. */
  push?: number;
  /** Point de fuite de la poussée (px). */
  origin?: [number, number];
  /** Sans fondu d'entrée : la première image (miniature) est déjà pleine. */
  instant?: boolean;
}> = ({ children, push = 0.035, origin = [540, 1056], instant = false }) => {
  const { t, duration } = useSceneTime();
  const enter = instant ? 1 : easeOut(clamp01(t / TRANSITION));
  const exit = clamp01((t - (duration - TRANSITION)) / TRANSITION);
  const opacity = enter * (1 - exit);
  const scale = 1.04 - 0.04 * enter + push * (t / Math.max(duration, 1));
  const blur = (1 - enter) * 10 + exit * 6;
  return (
    <CameraContext.Provider value={{ scale, ox: origin[0], oy: origin[1] }}>
      <AbsoluteFill
        style={{
          opacity,
          filter: blur > 0.05 ? `blur(${blur}px)` : undefined,
        }}
      >
        {children}
      </AbsoluteFill>
    </CameraContext.Provider>
  );
};

/** Calque SVG plein cadre (1080 x 1920), cadré par la caméra de la scène. */
export const Stage: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { scale, ox, oy } = useContext(CameraContext);
  return (
    <svg
      width={VIDEO.width}
      height={VIDEO.height}
      viewBox={`0 0 ${VIDEO.width} ${VIDEO.height}`}
      style={{ position: "absolute", inset: 0, overflow: "visible" }}
    >
      <g
        transform={`translate(${ox} ${oy}) scale(${scale}) translate(${-ox} ${-oy})`}
      >
        {children}
      </g>
    </svg>
  );
};
