/**
 * NeurionForge Eval — Ollama / Local OpenAI-Compatible Provider Wrapper
 *
 * Targets local inference servers that expose an OpenAI-compatible /v1/chat/completions endpoint:
 *   - Ollama (localhost:11434)
 *   - LM Studio (localhost:1234)
 *   - vLLM (localhost:8000)
 *   - Any endpoint behind an ngrok / Cloudflare Tunnel URL
 *
 * For Phase 1 local model support, the user pastes their local URL into the Run UI.
 * No API key is required for most local endpoints (pass an empty string or "ollama").
 */

import type { ProviderConfig, CompletionRequest, CompletionResponse } from "./types";
import { callOpenAI } from "./openai";

const DEFAULT_OLLAMA_BASE = "http://localhost:11434/v1";

export async function callOllama(
  config: ProviderConfig,
  request: CompletionRequest
): Promise<CompletionResponse> {
  const baseUrl = config.baseUrl ?? DEFAULT_OLLAMA_BASE;

  // Ollama accepts an empty string or "ollama" as the API key
  const ollamaConfig: ProviderConfig = {
    ...config,
    baseUrl,
    apiKey: config.apiKey || "ollama", // local servers accept any non-empty string
  };

  const result = await callOpenAI(ollamaConfig, request);
  return { ...result, provider: "ollama" };
}
