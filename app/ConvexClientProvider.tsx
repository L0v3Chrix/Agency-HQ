"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

// Production Convex URL (fallback if env var not available at build time)
const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || "https://confident-warthog-397.convex.cloud";

const convex = new ConvexReactClient(CONVEX_URL);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
