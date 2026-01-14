import { runScenario } from "../engine/runScenario"
import { validateEngineResult } from "../engine/validateEngineResult"

export function runHarness() {
  const result = runScenario()

  // Engine contract must hold under test conditions
  validateEngineResult(result)

  return result
}