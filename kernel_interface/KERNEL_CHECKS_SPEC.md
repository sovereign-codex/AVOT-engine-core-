# Kernel Checks Specification

This directory defines how AVOT-engine-core interfaces with the
**Value Kernel v1.0.0** at runtime.

---

## Required Properties

- Kernel checks are mandatory at all action boundaries
- Default behavior is fail-closed
- Escalation is a valid terminal state
- Kernel responses are non-negotiable

---

## Non-Scope

This specification does not:
- define ethical rules
- interpret constraints
- explain decisions to users

Those functions live upstream.

---

> This interface exists to enforce constraint, not to reason about it.