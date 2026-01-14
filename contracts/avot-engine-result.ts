/**
 * AVOT Engine Result — Canonical Contract
 * This file is the single source of truth for all engine outputs.
 * Any deviation MUST fail at runtime.
 */

export interface AVOTEngineResult {
  scenario: string
  result: {
    approved: boolean
    output: unknown | null
    sources: string[]
    details: Record<string, unknown>
    reason: string
  }
}