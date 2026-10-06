import { Platform } from "../Platform";

import type { WebCanvasProps } from "./types";

/**
 * The props the `web` prop of a view resolves to. Empty on native, where the
 * generated view config has no such prop.
 */
export const webNativeProps = (web?: WebCanvasProps) =>
  Platform.OS === "web" && web?.colorSpace === "srgb"
    ? { webColorSpace: "srgb" as const }
    : {};
