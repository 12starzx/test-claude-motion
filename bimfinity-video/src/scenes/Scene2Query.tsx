/**
 * Scène 2 : La requête (4 à 9 s).
 *
 * La question se tape caractère par caractère (cadence humaine, déterministe),
 * puis la validation fait pulser la barre en bleu.
 * La table de frappe est partagée avec la bande-son (ticks synchronisés).
 */
import { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import {
  CopilotConsole,
  initialConsoleState,
} from "../components/console/CopilotConsole";
import type { ConsoleState } from "../components/console/CopilotConsole";
import { useLayout } from "../lib/layout";
import { cursorBlink, pulseEnvelope, springAt } from "../lib/motion";
import { buildTypingSchedule, typedCountAt } from "../lib/typing";
import { frenchTypography } from "../lib/typography";
import { springs, timings } from "../theme";

export type SceneQueryProps = {
  label: string;
  query: string;
};

/** Table de frappe de la requête (frames locales à la scène 2). */
export const useQueryTypingSchedule = (query: string): number[] =>
  useMemo(
    () =>
      buildTypingSchedule(
        frenchTypography(query),
        timings.query.typingStart,
        timings.query.typingEnd,
      ),
    [query],
  );

export const SceneQuery: React.FC<SceneQueryProps> = ({ label, query }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const layout = useLayout();
  const t = timings.query;
  const globalFrame = frame + timings.scenes.query.from;

  const schedule = useQueryTypingSchedule(query);
  const typedCount = typedCountAt(schedule, frame);
  const isTyping = typedCount > 0 && typedCount < schedule.length;

  // Curseur : fixe pendant la frappe, clignotant à l'arrêt, éteint à l'envoi.
  const cursorOff = springAt(frame, fps, t.submitAt, springs.smooth, 8);
  const cursor = (isTyping ? 1 : cursorBlink(globalFrame, fps)) * (1 - cursorOff);

  // Validation : pulsation bleue + anneau qui s'étend + bouton activé.
  const pulse = pulseEnvelope(frame, fps, t.submitAt, 6, 26);
  const ring = springAt(frame, fps, t.submitAt, springs.smooth, 28);
  const submitted = Math.min(1, springAt(frame, fps, t.submitAt, springs.snappy, 16));

  const state: ConsoleState = {
    ...initialConsoleState,
    typedCount,
    cursor,
    pulse,
    ring,
    submitted,
    centerY: layout.console.centerY,
  };

  return (
    <AbsoluteFill>
      <CopilotConsole label={label} query={query} state={state} globalFrame={globalFrame} />
    </AbsoluteFill>
  );
};
