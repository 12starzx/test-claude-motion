/**
 * Cadence de frappe de la requête (scène 2).
 *
 * Produit, pour chaque caractère, la frame (locale à la scène) à laquelle il
 * apparaît. La même table pilote l'affichage ET les « ticks » sonores : la
 * synchronisation image / son est donc exacte par construction.
 */
import { useMemo } from "react";
import { random } from "remotion";
import { timings } from "../theme";
import { frenchTypography } from "./typography";

/**
 * @param text   Texte à taper (typographie déjà appliquée).
 * @param start  Frame de la première frappe.
 * @param end    Frame limite de la dernière frappe.
 */
export const buildTypingSchedule = (
  text: string,
  start: number,
  end: number,
): number[] => {
  const characters = Array.from(text);
  const raw: number[] = [];
  let cursor = 0;

  characters.forEach((character, index) => {
    raw.push(cursor);
    // Rythme humain : 2 frames de base, variation déterministe, pause après la ponctuation.
    let delay = 1.6 + random(`bimfinity-typing-${index}`) * 1.2;
    if (character === "," || character === ";") {
      delay += 5;
    }
    if (isBlank(character)) {
      delay += 0.4;
    }
    cursor += delay;
  });

  // Si le texte est long, la cadence est compressée pour finir à temps.
  const available = Math.max(1, end - start);
  const scale = cursor > available ? available / cursor : 1;

  return raw.map((time) => start + Math.round(time * scale));
};

/** Nombre de caractères visibles à une frame donnée. */
export const typedCountAt = (schedule: number[], frame: number): number => {
  let count = 0;
  for (const appearsAt of schedule) {
    if (appearsAt <= frame) {
      count += 1;
    }
  }
  return count;
};

/** Table de frappe de la requête (frames locales à la scène 2), mémoïsée. */
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

/** Vrai pour les espaces (sécables ou non) : pas de tick sonore sur un blanc. */
export const isBlank = (character: string): boolean => /\s/u.test(character);
