import { AVOTEngineResult } from "../contracts/avot-engine-result"

/**
 * Engine invariants.
 * These represent laws of behavior, not preferences.
 * Any violation MUST throw.
 */
export function assertInvariants(result: AVOTEngineResult): void {
  const r = result.result

  // Invariant 1: rejection must not emit output
  if (r.approved === false && r.output !== null) {
    throw new Error("Invariant violation: rejected result has output")
  }

  // Invariant 2: approval must have at least one source
  if (r.approved === true && r.sources.length === 0) {
    throw new Error("Invariant violation: approved result has no sources")
  }

  // Invariant 3: reason must always exist
  if (!r.reason || r.reason.trim().length === 0) {
    throw new Error("Invariant violation: missing reason")
  }

  // Invariant 4: details must always be an object
  if (typeof r.details !== "object") {
    throw new Error("Invariant violation: details is not an object")
  }
}