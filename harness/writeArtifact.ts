import fs from "fs"
import { AVOTEngineResult } from "../contracts/avot-engine-result"

export function writeArtifact(result: AVOTEngineResult) {
  fs.writeFileSync(
    "output.json",
    JSON.stringify(result, null, 2),
    "utf-8"
  )
}