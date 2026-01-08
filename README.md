# AVOT Engine

A lightweight **compiler + runtime** for running:

- **AVOT scrolls**: `*.avot.scroll` (YAML)
- **Council scrolls**: `*.council.scroll` (YAML)

This repo is intentionally **engine-only** (execution). Canonical manifests/specs can live in **AVOT-core**.

## Quick start

1) Install deps
```bash
npm install
npm run build
```

2) Validate an AVOT
```bash
node dist/cli.js examples/avots/avot-water-001.avot.scroll validate
```

3) Run an AVOT (stub adapters)
```bash
node dist/cli.js examples/avots/avot-water-001.avot.scroll run --input "Need 10L/day from brackish water"
```

## Status

- ✅ DSL parsing/validation/normalization
- ✅ Compile to runnable graph
- ✅ Runtime executor (linear path MVP)
- ✅ Stub adapters (LLM/Memory/Resonance)
- 🟡 Council execution (scaffolded, next)
