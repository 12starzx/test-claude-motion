/**
 * Point d'entrée des compositions BIMfinity.
 * Les deux formats partagent exactement les mêmes scènes et les mêmes props.
 */
import { Folder } from "remotion";
import { Master16x9 } from "./compositions/Master16x9";
import { Social9x16 } from "./compositions/Social9x16";

export const RemotionRoot: React.FC = () => (
  <Folder name="BIMfinity">
    <Master16x9 />
    <Social9x16 />
  </Folder>
);
