const fs = require("fs");
const path = require("path");

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeText(filePath, content) {
  fs.writeFileSync(filePath, content, "utf8");
}

function routeEvent(event) {
  const payload = event.payload || {};
  const type = payload.type || "signal";
  const priority = payload.priority || "low";

  if (priority === "high") {
    return {
      route: "guardian",
      targetAvot: "AVOT-Guardian",
      decision: "Escalate to Guardian path",
    };
  }

  if (type === "research") {
    return {
      route: "research",
      targetAvot: "AVOT-Research",
      decision: "Route to Research path",
    };
  }

  return {
    route: "core",
    targetAvot: "AVOT-Core",
    decision: "Route to Core path",
  };
}

function buildDecisionArtifact(event, routing) {
  return {
    decision_id: `dec_${event.payload.signal_id}`,
    trace_id: event.trace_id,
    event_id: event.event_id,
    artifact_type: "decision.proposed",
    schema_version: "1.0",
    created_at: new Date().toISOString(),
    source_event_type: event.event_type,
    source_repo: event.source?.repo || "unknown",
    payload: {
      signal_id: event.payload?.signal_id || null,
      type: event.payload?.type || null,
      title: event.payload?.title || null,
      summary: event.payload?.summary || null,
      priority: event.payload?.priority || null,
    },
    routing: {
      route: routing.route,
      target_avot: routing.targetAvot,
      target_repo: "Codex-control-center",
    },
    decision: {
      status: "proposed",
      recommendation: routing.decision,
    },
  };
}

function toMarkdown(decision) {
  return [
    "# Decision Proposal",
    "",
    `**Decision ID:** ${decision.decision_id}`,
    `**Trace ID:** ${decision.trace_id}`,
    `**Event ID:** ${decision.event_id}`,
    `**Created At:** ${decision.created_at}`,
    "",
    "## Payload",
    `- Signal ID: ${decision.payload.signal_id}`,
    `- Type: ${decision.payload.type}`,
    `- Title: ${decision.payload.title}`,
    `- Summary: ${decision.payload.summary}`,
    `- Priority: ${decision.payload.priority}`,
    "",
    "## Routing",
    `- Route: ${decision.routing.route}`,
    `- Target AVOT: ${decision.routing.target_avot}`,
    `- Target Repo: ${decision.routing.target_repo}`,
    "",
    "## Recommendation",
    `${decision.decision.recommendation}`,
    "",
  ].join("\n");
}

function main() {
  const inputDir = path.resolve(process.cwd(), "inputs/events");
  const outJsonDir = path.resolve(process.cwd(), "outputs/decisions");
  const outMdDir = path.resolve(process.cwd(), "outputs/artifacts");

  ensureDir(inputDir);
  ensureDir(outJsonDir);
  ensureDir(outMdDir);

  const files = fs.existsSync(inputDir)
    ? fs.readdirSync(inputDir).filter((f) => f.endsWith(".json"))
    : [];

  if (files.length === 0) {
    console.log("No input events found.");
    return;
  }

  for (const file of files) {
    const fullPath = path.join(inputDir, file);
    const event = readJson(fullPath);
    const routing = routeEvent(event);
    const decision = buildDecisionArtifact(event, routing);

    const base = file.replace(/\.json$/i, "");
    const jsonOut = path.join(outJsonDir, `${base}.decision.json`);
    const mdOut = path.join(outMdDir, `${base}.decision.md`);

    fs.writeFileSync(jsonOut, JSON.stringify(decision, null, 2), "utf8");
    writeText(mdOut, toMarkdown(decision));

    console.log(`Processed ${file} -> ${jsonOut}`);
  }
}

main();