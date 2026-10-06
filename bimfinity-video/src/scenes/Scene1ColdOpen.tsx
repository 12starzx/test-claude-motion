/**
 * Scène 1 : Cold open (0 à 4 s).
 *
 * Le shader s'allume dans le noir (piloté par le fond), puis la console
 * BIMfinity apparaît, vide, curseur qui clignote, avec son micro-label.
 */
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import {
  CopilotConsole,
  initialConsoleState,
} from "../components/console/CopilotConsole";
import type { ConsoleState } from "../components/console/CopilotConsole";
import { useLayout } from "../lib/layout";
import { cursorBlink, springAt } from "../lib/motion";
import { springs, timings } from "../theme";

export type SceneColdOpenProps = {
  label: string;
  query: string;
};

export const SceneColdOpen: React.FC<SceneColdOpenProps> = ({ label, query }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const layout = useLayout();
  const t = timings.coldOpen;
  const globalFrame = frame + timings.scenes.coldOpen.from;

  const appear = springAt(frame, fps, t.consoleIn, springs.smooth, 34);
  const labelOpacity = springAt(frame, fps, t.labelIn, springs.smooth, 26);

  const state: ConsoleState = {
    ...initialConsoleState,
    appear,
    labelOpacity,
    cursor: labelOpacity * cursorBlink(globalFrame, fps),
    centerY: layout.console.centerY + (1 - appear) * 28,
  };

  return (
    <AbsoluteFill>
      <CopilotConsole label={label} query={query} state={state} globalFrame={globalFrame} />
    </AbsoluteFill>
  );
};
