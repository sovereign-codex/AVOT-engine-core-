import { AVOTEngineResult } from "../contracts/avot-engine-result"

/**
 * Runtime enforcement of the AVOT Engine Contract.
 * If this throws, the engine MUST halt.
 */
export function validateEngineResult(
  data: unknown
): asserts data is AVOTEngineResult {
  if (!data || typeof data !== "object") {
    throw new Error("Engine result must be an object")
  }

  const root = data as any

  if (typeof root.scenario !== "string") {
    throw new Error("Missing or invalid `scenario`")
  }

  if (!root.result || typeof root.result !== "object") {
    throw new Error("Missing `result` object")
  }

  const r = root.result

  if (typeof r.approved !== "boolean") {
    throw new Error("`approved` must be boolean")
  }

  if (!Array.isArray(r.sources)) {
    throw new Error("`sources` must be an array")
  }

  if (typeof r.reason !== "string" || r.reason.length === 0) {
    throw new Error("`reason` must be a non-empty string")
  }

  if (typeof r.details !== "object") {
    throw new Error("`details` must be an object")
  }

  if (r.approved === false && r.output !== null) {
    throw new Error("Rejected result must have null output")
  }
}