/**
 * Fond complet : mesh gradient (shader ou fallback CSS) + grain + vignettage.
 *
 * Robustesse : le rendu ne doit jamais échouer à cause du fond.
 * 1. Pré-vol : avant de monter le canvas, on vérifie que WebGL existe ET que
 *    le fragment shader compile sur cette machine. Sinon → fallback CSS.
 * 2. Filet de sécurité : une ErrorBoundary bascule aussi en CSS si le canvas
 *    lève une erreur au montage.
 */
import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { background, colors } from "../../theme";
import { getBackgroundState } from "./backgroundTimeline";
import type { BackgroundState } from "./backgroundTimeline";
import { CssGradientBackground } from "./CssGradientBackground";
import { Grain } from "./Grain";
import { meshGradientFragmentShader } from "./meshGradientShader";
import { ShaderBackground } from "./ShaderBackground";

/* ---------- Pré-vol WebGL (une fois par onglet de rendu) ---------- */

let preflightResult: boolean | null = null;

const shaderCompilesHere = (): boolean => {
  if (preflightResult !== null) {
    return preflightResult;
  }
  try {
    const canvas = document.createElement("canvas");
    const gl = (canvas.getContext("webgl2") ?? canvas.getContext("webgl")) as
      | WebGLRenderingContext
      | WebGL2RenderingContext
      | null;
    if (!gl) {
      preflightResult = false;
      return false;
    }
    const shader = gl.createShader(gl.FRAGMENT_SHADER);
    if (!shader) {
      preflightResult = false;
      return false;
    }
    gl.shaderSource(shader, meshGradientFragmentShader);
    gl.compileShader(shader);
    const ok = Boolean(gl.getShaderParameter(shader, gl.COMPILE_STATUS));
    if (!ok) {
      console.warn("[BIMfinity] Shader non compilé, fallback CSS :", gl.getShaderInfoLog(shader));
    }
    gl.deleteShader(shader);
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    preflightResult = ok;
    return ok;
  } catch {
    preflightResult = false;
    return false;
  }
};

/* ---------- Filet de sécurité ---------- */

class BackgroundErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn("[BIMfinity] Shader indisponible, fallback CSS.", error, info.componentStack);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse 85% 80% at 50% 50%, transparent 55%, ${colors.background} 130%)`,
    }}
  />
);

export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const state: BackgroundState = getBackgroundState(frame, fps);

  const shaderEnabled = background.renderer === "auto" && shaderCompilesHere();

  const css = <CssGradientBackground {...state} />;

  return (
    <AbsoluteFill style={{ backgroundColor: colors.background }}>
      {shaderEnabled ? (
        <BackgroundErrorBoundary fallback={css}>
          <ShaderBackground {...state} />
        </BackgroundErrorBoundary>
      ) : (
        css
      )}
      <Grain opacity={background.grainOpacity} />
      <Vignette />
    </AbsoluteFill>
  );
};
