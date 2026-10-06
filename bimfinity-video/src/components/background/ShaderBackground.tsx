/**
 * Fond « flowing mesh gradient » rendu en WebGL via @remotion/three.
 *
 * - Le shader est piloté par la frame : rendu déterministe, image par image.
 * - Il est calculé à une résolution réduite (theme.background.shaderResolution)
 *   puis agrandi : le dégradé étant très doux, la perte est invisible et le
 *   rendu est nettement plus rapide.
 */
import { ThreeCanvas } from "@remotion/three";
import { useMemo } from "react";
import { AbsoluteFill } from "remotion";
import { useLayout } from "../../lib/layout";
import { background, colors, hexToVec3 } from "../../theme";
import type { BackgroundState } from "./backgroundTimeline";
import {
  meshGradientFragmentShader,
  meshGradientVertexShader,
} from "./meshGradientShader";

type MeshGradientProps = BackgroundState & { width: number; height: number };

/** Le plan plein écran et son matériau (rendu à l'intérieur du canvas R3F). */
const MeshGradientPlane: React.FC<MeshGradientProps> = ({
  time,
  intensity,
  bloom,
  drift,
  width,
  height,
}) => {
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: [width, height] },
      uIntensity: { value: 0 },
      uBloom: { value: 0 },
      uDrift: { value: 0 },
      uFocusDarken: { value: background.focusDarken },
      uBase: { value: hexToVec3(colors.background) },
      uDeep: { value: hexToVec3(colors.deep) },
      uPrimary: { value: hexToVec3(colors.primary) },
      uGlow: { value: hexToVec3(colors.glow) },
    }),
    [width, height],
  );

  // Mise à jour synchrone pendant le rendu : les valeurs sont en place avant
  // que @remotion/three ne déclenche le dessin de la frame.
  uniforms.uTime.value = time;
  uniforms.uIntensity.value = intensity;
  uniforms.uBloom.value = bloom;
  uniforms.uDrift.value = drift;

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={meshGradientVertexShader}
        fragmentShader={meshGradientFragmentShader}
        uniforms={uniforms}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
};

export const ShaderBackground: React.FC<BackgroundState> = (state) => {
  const { width, height } = useLayout();
  const scale = background.shaderResolution;
  const innerWidth = Math.round(width * scale);
  const innerHeight = Math.round(height * scale);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <div
        style={{
          width: innerWidth,
          height: innerHeight,
          transform: `scale(${width / innerWidth}, ${height / innerHeight})`,
          transformOrigin: "0 0",
        }}
      >
        <ThreeCanvas
          width={innerWidth}
          height={innerHeight}
          dpr={1}
          flat
          linear
          gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
        >
          <MeshGradientPlane {...state} width={innerWidth} height={innerHeight} />
        </ThreeCanvas>
      </div>
    </AbsoluteFill>
  );
};
