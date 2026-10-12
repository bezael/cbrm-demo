# Specs Index — cbrm-demo

> Dominicode SDD project memory. Read at Step 0.5, updated at hand-off.

## Shared decisions

| Decision | Value | Rationale (1 line) | First decided in |
|----------|-------|--------------------|------------------|
| Identity | `userIdOf(request)` reads `x-user-id` | Demo stand-in for auth; one place to replace later | baseline |
| Storage | In-memory `FeedbackStore` | The demo is about the method, not persistence | baseline |
| Test runner | Vitest 3.2, HTTP tested with `app.inject` | Fast, no ports | baseline |
| "Nothing changes" tests | Read state with a call that cannot change it (`list()`, `GET`), never with an idempotent write | An idempotent `vote()` probe restored a removed vote and hid a mutant | `feedback-voting` (review) |
| "Nothing created for unknown id" tests | Hit the id before it exists, then create it and assert it starts empty | Ids are sequential in `FeedbackStore`; a return-value check missed a phantom vote | `feedback-voting` (review) |
| Wall-clock NFR tests | Exclude the cold first `app.inject` with an explicit, untimed warm-up | The cold start (~1.7 s in a full run) is not what the NFR measures | `feedback-voting` (review) |
| Mutants that remove "another" element | Pick one that does not depend on insertion order (the last, or a fixture where the caller is not first) | A "remove the first voter" mutant matched correct behavior because the caller always voted first | `feedback-voting` (review 2) |

## Specs

| Slug | Vision (1 line) | Status | Key stack | Related specs |
|------|-----------------|--------|-----------|---------------|
| `feedback-voting` | Signed-in users vote once per item and can take it back; everyone sees the count | in progress | Fastify + Vitest | — |
