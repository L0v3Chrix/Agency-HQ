"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode, useEffect } from "react";

// Convex URL - using dev deployment for testing
const CONVEX_URL = "https://dashing-bee-76.convex.cloud";

const convex = new ConvexReactClient(CONVEX_URL);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    console.log("[A.G.E HQ] Convex URL:", CONVEX_URL);
  }, []);
  
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
