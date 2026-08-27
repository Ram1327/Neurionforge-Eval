import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "../../../lib/db";
import { callProvider, ProviderType } from "../../../lib/providers";
import { getBenchmark } from "../../../lib/benchmarks";
import { gradeItem } from "../../../lib/scoring";

export const dynamic = "force-dynamic";

const RunRequestSchema = z.object({
  providerType: z.enum(["openai", "anthropic", "gemini", "openrouter", "ollama"]),
  apiKey: z.string().min(1, "API key is required"),
  modelId: z.string().min(1, "Model ID is required"),
  baseUrl: z.string().url().optional().or(z.literal("")),
  benchmarkSlug: z.string().min(1, "Benchmark slug is required"),
  temperature: z.number().min(0).max(2).default(0),
  maxSamples: z.number().int().min(1).max(25).default(25),
});

export async function POST(req: NextRequest) {
  let body: z.infer<typeof RunRequestSchema>;
  try {
    const json = await req.json();
    body = RunRequestSchema.parse(json);
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Invalid request" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const benchmarkMeta = getBenchmark(body.benchmarkSlug);
  if (!benchmarkMeta) {
    return new Response(
      JSON.stringify({ error: `Benchmark ${body.benchmarkSlug} not found` }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }

  // Ensure Model exists in database
  const model = await prisma.model.upsert({
    where: { slug: body.modelId },
    update: {},
    create: {
      slug: body.modelId,
      name: body.modelId,
      provider: body.providerType.charAt(0).toUpperCase() + body.providerType.slice(1),
      sourceType: body.providerType === "ollama" ? "local" : "frontier_hosted",
    },
  });

  // Ensure Benchmark exists in database
  const benchmark = await prisma.benchmark.upsert({
    where: { slug: benchmarkMeta.slug },
    update: {
      name: benchmarkMeta.name,
      category: benchmarkMeta.category,
      scoringMethod: benchmarkMeta.scoringMethod,
      description: benchmarkMeta.description,
      sampleCount: benchmarkMeta.items.length,
    },
    create: {
      slug: benchmarkMeta.slug,
      name: benchmarkMeta.name,
      category: benchmarkMeta.category,
      scoringMethod: benchmarkMeta.scoringMethod,
      description: benchmarkMeta.description,
      promptSetRef: `embedded://${benchmarkMeta.slug}`,
      sampleCount: benchmarkMeta.items.length,
    },
  });

  // Create initial TestRun
  const testRun = await prisma.testRun.create({
    data: {
      modelId: model.id,
      benchmarkId: benchmark.id,
      resultType: "measured",
      status: "running",
      progressJson: {
        completed: 0,
        total: Math.min(body.maxSamples, benchmarkMeta.items.length),
        passed: 0,
      },
    },
  });

  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  const sendEvent = async (data: Record<string, unknown>) => {
    try {
      await writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
    } catch {
      // client disconnected
    }
  };

  // Run execution in background streaming loop
  (async () => {
    const items = benchmarkMeta.items.slice(0, body.maxSamples);
    const total = items.length;
    let passedCount = 0;
    const rawResults: Array<{
      itemId: string;
      passed: boolean;
      output: string;
      extracted?: string | null;
      latencyMs: number;
      tokensIn?: number;
      tokensOut?: number;
      error?: string;
    }> = [];
    let totalLatencyMs = 0;
    let totalTokens = 0;

    await sendEvent({ type: "start", runId: testRun.id, total });

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      try {
        const response = await callProvider(
          body.providerType as ProviderType,
          {
            apiKey: body.apiKey,
            model: body.modelId,
            baseUrl: body.baseUrl ? body.baseUrl : undefined,
          },
          {
            prompt: item.prompt,
            systemPrompt:
              benchmarkMeta.scoringMethod === "mcq"
                ? "You are a logical test taker. Answer with only the letter of the correct option (A, B, C, or D)."
                : "Answer concisely with only the exact final answer or value.",
            maxTokens: 256,
            temperature: body.temperature,
          }
        );

        const grade = gradeItem(item, response.output, benchmarkMeta.scoringMethod);
        if (grade.passed) passedCount++;

        totalLatencyMs += response.latencyMs;
        totalTokens += (response.inputTokens || 0) + (response.outputTokens || 0);

        rawResults.push({
          itemId: item.id,
          passed: grade.passed,
          output: response.output,
          extracted: grade.extracted || grade.normalized || null,
          latencyMs: response.latencyMs,
          tokensIn: response.inputTokens,
          tokensOut: response.outputTokens,
        });

        await sendEvent({
          type: "progress",
          completed: i + 1,
          total,
          passed: passedCount,
          latencyMs: response.latencyMs,
          itemId: item.id,
          gradePassed: grade.passed,
        });
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : "Provider error";
        rawResults.push({
          itemId: item.id,
          passed: false,
          output: "",
          latencyMs: 0,
          error: errMsg,
        });

        await sendEvent({
          type: "progress",
          completed: i + 1,
          total,
          passed: passedCount,
          latencyMs: 0,
          itemId: item.id,
          gradePassed: false,
          error: errMsg,
        });
      }
    }

    const score = Number(((passedCount / total) * 100).toFixed(1));
    const latencyAvgMs = Math.round(totalLatencyMs / (total || 1));
    const throughputTps =
      totalLatencyMs > 0
        ? Number(((totalTokens / (totalLatencyMs / 1000))).toFixed(1))
        : 0;

    const finalStatus = rawResults.filter((r) => r.error).length > total * 0.8 ? "failed" : "completed";

    await prisma.testRun.update({
      where: { id: testRun.id },
      data: {
        status: finalStatus,
        score: finalStatus === "completed" ? score : null,
        rawResults,
        latencyAvgMs,
        throughputTps,
        progressJson: { completed: total, total, passed: passedCount },
      },
    });

    await sendEvent({
      type: "complete",
      runId: testRun.id,
      score,
      passedCount,
      total,
      latencyAvgMs,
      throughputTps,
      status: finalStatus,
    });

    try {
      await writer.close();
    } catch {
      // already closed
    }
  })().catch(async (err) => {
    const errMsg = err instanceof Error ? err.message : "Fatal error during run";
    try {
      await prisma.testRun.update({
        where: { id: testRun.id },
        data: { status: "failed" },
      });
      await sendEvent({ type: "error", message: errMsg });
      await writer.close();
    } catch {
      // ignore
    }
  });

  return new Response(stream.readable, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
