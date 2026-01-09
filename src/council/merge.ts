/**
 * Council Merge
 *
 * Combines approved AVOT outputs into a single response
 * while preserving traceability and attribution.
 *
 * This module is intentionally conservative:
 * - No rewriting
 * - No summarization
 * - No tone shaping
 *
 * Higher-level synthesis can be layered later.
 */

export interface AvotOutput {
  avot_id: string;
  result: any;
  trace?: any[];
  resonance?: any;
}

export interface MergeConfig {
  primary?: string; // avot_id to prioritize
}

export interface MergeResult {
  output: any;
  sources: string[];
  details: Record<string, any>;
}

export function councilMerge(
  outputs: AvotOutput[],
  config?: MergeConfig,
): MergeResult {
  if (outputs.length === 0) {
    return {
      output: null,
      sources: [],
      details: {},
    };
  }

  // --- Choose primary output ---
  let primary = outputs[0];
  if (config?.primary) {
    const found = outputs.find(o => o.avot_id === config.primary);
    if (found) primary = found;
  }

  const supporting = outputs.filter(o => o.avot_id !== primary.avot_id);

  return {
    output: primary.result,
    sources: outputs.map(o => o.avot_id),
    details: supporting.reduce((acc, o) => {
      acc[o.avot_id] = {
        result: o.result,
        resonance: o.resonance,
      };
      return acc;
    }, {} as Record<string, any>),
  };
}