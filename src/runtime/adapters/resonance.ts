/**
 * Stub Resonance Adapter
 *
 * Returns a simple coherence/resonance score.
 * This allows council + merge logic to function deterministically.
 */

export interface ResonanceInput {
  text: string;
}

export interface ResonanceResult {
  score: number;
  signature: string;
}

export class StubResonance {
  async evaluate(input: ResonanceInput): Promise<ResonanceResult> {
    return {
      score: 0.85,
      signature: "stub.resonance.coherent",
    };
  }
}