import { inngest } from "@/lib/inngest/client";

/**
 * Phase 0 Hello World function.
 * Verifies Inngest setup: durable steps, retries, and scheduling all work.
 * Triggered by: inngest.send({ name: "eval/hello.world" })
 *
 * Inngest v4 API: createFunction(options, handler)
 * - options includes { id, name, triggers: [{ event }] }
 * - handler receives context including `step`
 */
export const helloWorld = inngest.createFunction(
  {
    id: "hello-world",
    name: "Hello World — Phase 0 Verification",
    triggers: [{ event: "eval/hello.world" }],
  },
  async ({ step }) => {
    // Step 1: proves step-level sleep / scheduling works
    await step.sleep("wait-brief", "1s");

    // Step 2: proves step execution and retry durability
    const result = await step.run("log-hello", async () => {
      console.log("[Inngest] Hello from NeurionForge Eval — Phase 0 verified ✓");
      return {
        message: "Inngest hello world verified",
        phase: 0,
        timestamp: new Date().toISOString(),
      };
    });

    // Step 3: verify we can return structured data
    return await step.run("return-result", async () => ({
      ...result,
      stepsVerified: true,
    }));
  }
);
