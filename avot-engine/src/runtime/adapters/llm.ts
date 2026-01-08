export interface LlmAdapter {
  complete(prompt: string, opts?: { temperature?: number; model?: string }): Promise<string>;
}

export class StubLlm implements LlmAdapter {
  async complete(prompt: string): Promise<string> {
    return `[[STUB LLM OUTPUT]]\nPrompt:\n${prompt}`;
  }
}
