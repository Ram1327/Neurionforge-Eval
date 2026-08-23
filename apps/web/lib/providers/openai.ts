/**
 * NeurionForge Eval — OpenAI Provider Wrapper
 *
 * Handles OpenAI's Chat Completions API.
 * Also works with any OpenAI-compatible endpoint (Azure, Together, Groq, etc.)
 * by passing a custom baseUrl in config.
 */

import type { ProviderConfig, CompletionRequest, CompletionResponse } from "./types";
import { ProviderError } from "./types";

const OPENAI_BASE = "https://api.openai.com/v1";

export async function callOpenAI(
  config: ProviderConfig,
  request: CompletionRequest
): Promise<CompletionResponse> {
  const baseUrl = (config.baseUrl ?? OPENAI_BASE).replace(/\/$/, "");
  const url = `${baseUrl}/chat/completions`;

  const messages = [];
  if (request.systemPrompt) {
    messages.push({ role: "system", content: request.systemPrompt });
  }
  messages.push({ role: "user", content: request.prompt });

  const body = {
    model: config.model,
    messages,
    max_tokens: request.maxTokens ?? 2048,
    temperature: request.temperature ?? 0,
  };

  const start = Date.now();

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify(body),
  });

  const latencyMs = Date.now() - start;

  if (!res.ok) {
    const errorText = await res.text().catch(() => res.statusText);
    throw new ProviderError("openai", res.status, errorText);
  }

  const data = await res.json();
  const choice = data.choices?.[0];
  if (!choice) {
    throw new ProviderError("openai", null, "No choices returned in response");
  }

  return {
    output: choice.message?.content ?? "",
    inputTokens: data.usage?.prompt_tokens ?? 0,
    outputTokens: data.usage?.completion_tokens ?? 0,
    latencyMs,
    model: data.model ?? config.model,
    provider: "openai",
  };
}
