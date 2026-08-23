/**
 * NeurionForge Eval — Google Gemini Provider Wrapper
 *
 * Uses the Gemini REST API (generateContent) — no SDK dependency to keep bundle lean.
 * Supports Gemini 2.5 Pro, Gemini 2.0 Flash, etc.
 */

import type { ProviderConfig, CompletionRequest, CompletionResponse } from "./types";
import { ProviderError } from "./types";

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta";

export async function callGemini(
  config: ProviderConfig,
  request: CompletionRequest
): Promise<CompletionResponse> {
  const model = config.model; // e.g. "gemini-2.5-pro"
  const url = `${GEMINI_BASE}/models/${model}:generateContent?key=${config.apiKey}`;

  const contents = [];
  // Gemini uses a "contents" array; system prompt goes as a separate system_instruction
  contents.push({
    role: "user",
    parts: [{ text: request.prompt }],
  });

  const body: Record<string, unknown> = {
    contents,
    generationConfig: {
      maxOutputTokens: request.maxTokens ?? 2048,
      temperature: request.temperature ?? 0,
    },
  };

  if (request.systemPrompt) {
    body.system_instruction = {
      parts: [{ text: request.systemPrompt }],
    };
  }

  const start = Date.now();

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const latencyMs = Date.now() - start;

  if (!res.ok) {
    const errorText = await res.text().catch(() => res.statusText);
    throw new ProviderError("gemini", res.status, errorText);
  }

  const data = await res.json();
  const candidate = data.candidates?.[0];
  if (!candidate) {
    throw new ProviderError("gemini", null, "No candidates returned in response");
  }

  const text = candidate.content?.parts?.[0]?.text ?? "";
  const usage = data.usageMetadata ?? {};

  return {
    output: text,
    inputTokens: usage.promptTokenCount ?? 0,
    outputTokens: usage.candidatesTokenCount ?? 0,
    latencyMs,
    model: config.model,
    provider: "gemini",
  };
}
