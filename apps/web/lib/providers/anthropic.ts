/**
 * NeurionForge Eval — Anthropic Provider Wrapper
 *
 * Handles Anthropic's Messages API (/v1/messages).
 * Uses the x-api-key + anthropic-version header format.
 */

import type { ProviderConfig, CompletionRequest, CompletionResponse } from "./types";
import { ProviderError } from "./types";

const ANTHROPIC_BASE = "https://api.anthropic.com";
const ANTHROPIC_VERSION = "2023-06-01";

export async function callAnthropic(
  config: ProviderConfig,
  request: CompletionRequest
): Promise<CompletionResponse> {
  const baseUrl = (config.baseUrl ?? ANTHROPIC_BASE).replace(/\/$/, "");
  const url = `${baseUrl}/v1/messages`;

  const body = {
    model: config.model,
    max_tokens: request.maxTokens ?? 2048,
    ...(request.systemPrompt ? { system: request.systemPrompt } : {}),
    messages: [{ role: "user", content: request.prompt }],
    temperature: request.temperature ?? 0,
  };

  const start = Date.now();

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": config.apiKey,
      "anthropic-version": ANTHROPIC_VERSION,
    },
    body: JSON.stringify(body),
  });

  const latencyMs = Date.now() - start;

  if (!res.ok) {
    const errorText = await res.text().catch(() => res.statusText);
    throw new ProviderError("anthropic", res.status, errorText);
  }

  const data = await res.json();
  const content = data.content?.[0];
  if (!content) {
    throw new ProviderError("anthropic", null, "No content returned in response");
  }

  return {
    output: content.text ?? "",
    inputTokens: data.usage?.input_tokens ?? 0,
    outputTokens: data.usage?.output_tokens ?? 0,
    latencyMs,
    model: data.model ?? config.model,
    provider: "anthropic",
  };
}
