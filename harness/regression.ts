import fs from "fs"
import path from "path"
import { AVOTEngineResult } from "../contracts/avot-engine-result"

const BASELINE_PATH = path.resolve("harness/baselines")

/**
 * Compare current result against stored baseline.
 * Used to detect unintended behavioral drift.
 */
export function assertRegression(
  scenario: string,
  result: AVOTEngineResult
): void {
  const baselineFile = path.join(
    BASELINE_PATH,
    `${scenario}.json`
  )

  if (!fs.existsSync(baselineFile)) {
    // First run establishes baseline
    fs.mkdirSync(BASELINE_PATH, { recursive: true })
    fs.writeFileSync(
      baselineFile,
      JSON.stringify(result, null, 2),
      "utf-8"
    )
    return
  }

  const baseline = JSON.parse(
    fs.readFileSync(baselineFile, "utf-8")
  )

  const current = JSON.stringify(result)
  const expected = JSON.stringify(baseline)

  if (current !== expected) {
    throw new Error(
      `Regression detected for scenario "${scenario}"`
    )
  }
}