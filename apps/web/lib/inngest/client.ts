import { Inngest } from "inngest";

/**
 * NeurionForge Eval — Inngest client
 * Used to send events and register functions for background execution.
 * The event key is loaded from env server-side; never expose it client-side.
 */
export const inngest = new Inngest({
  id: "neurionforge-eval",
});
