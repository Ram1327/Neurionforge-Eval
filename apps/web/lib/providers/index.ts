/**
 * NeurionForge Eval — Unified Provider Dispatch
 *
 * Single entry point for all LLM calls across all providers.
 * Routes to the correct provider wrapper based on ProviderType.
 *
 * Usage:
 *   const response = await callProvider("openai", config, request);
 */

import type { ProviderType, ProviderConfig, CompletionRequest, CompletionResponse } from "./types";
import { callOpenAI } from "./openai";
import { callAnthropic } from "./anthropic";
import { callGemini } from "./gemini";
import { callOpenRouter } from "./openrouter";
import { callOllama } from "./ollama";

export type { ProviderType, ProviderConfig, CompletionRequest, CompletionResponse };
export { ProviderError } from "./types";

export async function callProvider(
  provider: ProviderType,
  config: ProviderConfig,
  request: CompletionRequest
): Promise<CompletionResponse> {
  switch (provider) {
    case "openai":
      return callOpenAI(config, request);
    case "anthropic":
      return callAnthropic(config, request);
    case "gemini":
      return callGemini(config, request);
    case "openrouter":
      return callOpenRouter(config, request);
    case "ollama":
      return callOllama(config, request);
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}
