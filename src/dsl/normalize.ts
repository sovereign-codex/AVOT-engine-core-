import { AvotDsl } from "../runtime/types.js";

/**
 * Normalize AVOT DSL
 *
 * This function guarantees that optional structures
 * have safe, explicit defaults before compilation/runtime.
 *
 * No execution logic lives here.
 */
export function normalizeAvot(dsl: AvotDsl): AvotDsl {
  // --- Cognition defaults ---
  dsl.cognition.temperature ??= 0.4;

  // --- Memory defaults ---
  dsl.memory ??= { short_term: "session" };

  // --- Resonance defaults ---
  if (dsl.resonance?.enabled) {
    dsl.resonance.coherence_threshold ??= 0.72;
    dsl.resonance.failure_policy ??= "soften";
  }

  // Note: Council routing defaults are set in the council loader, not here.
  return dsl;
}