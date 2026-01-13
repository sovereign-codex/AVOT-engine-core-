/**
 * Stub LLM Adapter
 *
 * Deterministic, offline-safe language model adapter.
 * This is NOT a real LLM — it exists to make execution predictable.
 */

export interface LlmRequest {
  prompt: string;
}

export interface LlmResponse {
  text: string;
}

export class StubLlm {
  async generate(req: LlmRequest): Promise<LlmResponse> {
    return {
      text: `LLM_RESPONSE: ${req.prompt}`,
    };
  }
}