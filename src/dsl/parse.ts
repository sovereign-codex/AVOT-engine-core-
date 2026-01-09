import fs from "node:fs";
import YAML from "yaml";

export function parseScrollFile(path: string): any {
  const raw = fs.readFileSync(path, "utf8");
  return YAML.parse(raw);
}
