/**
 * NeurionForge Eval — OpenRouter Provider Wrapper
 *
 * OpenRouter exposes an OpenAI-compatible API, so this is a thin adapter
 * on top of the OpenAI wrapper with the correct base URL and required headers.
 *
 * Supports 100+ models (Llama, Qwen, DeepSeek, Mistral, etc.) through a single endpoint.
 */

import type { ProviderConfig, CompletionRequest, CompletionResponse } from "./types";
import { callOpenAI } from "./openai";

const OPENROUTER_BASE = "https://openrouter.ai/api/v1";

export async function callOpenRouter(
  config: ProviderConfig,
  request: CompletionRequest
): Promise<CompletionResponse> {
  // OpenRouter requires these headers for analytics / policy compliance
  const openRouterConfig: ProviderConfig & { extraHeaders?: Record<string, string> } = {
    ...config,
    baseUrl: OPENROUTER_BASE,
  };

  // We inject extra headers by monkeypatching fetch per-request.
  // A cleaner approach would be a fetch wrapper, but for Phase 0 this is fine.
  const originalFetch = global.fetch;
  global.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    if (typeof input === "string" && input.startsWith(OPENROUTER_BASE)) {
      init = {
        ...init,
        headers: {
          ...(init?.headers as Record<string, string>),
          "HTTP-Referer": "https://eval.neurionforge.com",
          "X-Title": "NeurionForge Eval",
        },
      };
    }
    return originalFetch(input, init);
  };

  try {
    const result = await callOpenAI(openRouterConfig, request);
    return { ...result, provider: "openrouter" };
  } finally {
    global.fetch = originalFetch;
  }
}
