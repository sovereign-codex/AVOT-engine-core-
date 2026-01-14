import { runScenario } from "../engine/runScenario"
import { validateEngineResult } from "../engine/validateEngineResult"
import { assertInvariants } from "./invariants"
import { assertRegression } from "./regression"

export function runHarness() {
  const result = runScenario()

  // 1. Contract enforcement (schema + rules)
  validateEngineResult(result)

  // 2. Behavioral invariants
  assertInvariants(result)

  // 3. Regression protection
  assertRegression(result.scenario, result)

  return result
}