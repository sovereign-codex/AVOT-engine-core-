export interface ResonanceAdapter {
  eval(expected?: string): Promise<{ score: number; signature?: string }>;
}

export class StubResonance implements ResonanceAdapter {
  async eval(expected?: string) {
    return { score: 0.8, signature: expected ?? "coherence.neutral" };
  }
}
