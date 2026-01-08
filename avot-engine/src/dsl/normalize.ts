import { AvotDsl } from "../types.js";

export function normalizeAvot(dsl: AvotDsl): AvotDsl {
  dsl.cognition.temperature ??= 0.4;
  dsl.memory ??= { short_term: "session" };

  if (dsl.resonance?.enabled) {
    dsl.resonance.coherence_threshold ??= 0.72;
    dsl.resonance.failure_policy ??= "soften";
  }
  return dsl;
}
