import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { helloWorld } from "@/lib/inngest/functions/helloWorld";

/**
 * Inngest serve handler.
 * Registers all background functions and exposes them at /api/inngest.
 * Add new functions here as they are created in later phases.
 */
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    helloWorld,
    // Phase 1+: runBenchmark, runCustomEval, recomputeProjections
  ],
});
