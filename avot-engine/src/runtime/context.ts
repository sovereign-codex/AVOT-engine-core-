export interface ExecState {
  avot_id: string;
  session_id: string;
  trace: Array<{ node: string; type: string; input: any; output: any }>;
  ethics_flags: string[];
  memory_refs: any[];
  resonance?: {
    current_score?: number;
    baseline?: string;
    trace: Array<{ node: string; score: number; signature?: string }>;
  };
}

export function newState(avot_id: string): ExecState {
  return {
    avot_id,
    session_id: crypto.randomUUID(),
    trace: [],
    ethics_flags: [],
    memory_refs: [],
    resonance: { trace: [] },
  };
}
