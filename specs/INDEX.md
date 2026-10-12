# Specs Index — cbrm-demo

> Dominicode SDD project memory. Read at Step 0.5, updated at hand-off.

## Shared decisions

| Decision | Value | Rationale (1 line) | First decided in |
|----------|-------|--------------------|------------------|
| Identity | `userIdOf(request)` reads `x-user-id` | Demo stand-in for auth; one place to replace later | baseline |
| Storage | In-memory `FeedbackStore` | The demo is about the method, not persistence | baseline |
| Test runner | Vitest 3.2, HTTP tested with `app.inject` | Fast, no ports | baseline |

## Specs

| Slug | Vision (1 line) | Status | Key stack | Related specs |
|------|-----------------|--------|-----------|---------------|
| `feedback-voting` | Signed-in users vote once per item and can take it back; everyone sees the count | in progress | Fastify + Vitest | — |
