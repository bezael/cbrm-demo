# Tasks — Feedback voting

**Status:** In Progress

> Derived from `spec.md` + `plan.md`. Execute in order: 🔴 → 🟢 → 🔵.
> `[x]` means Verify was run and Done when was observed. Evidence is recorded on the task.

## Phase 0 — Runner

- [x] TASK-00 — ⚙️ **Runner detected:** Vitest 3.2.7 in `package.json` devDependencies; `test/feedback.test.ts` exists (Route A).
- [x] TASK-01 — ⚙️ **Confirm the runner executes** — Criterion: Phase 0 gate. Files: none. Verify: `npm test`. Done when: Vitest runs and exits 0. Evidence: `npm test` → 1 file, 3 passed (2026-10-12).

## Phase 1 — Store

### Feature: The user can vote for a feedback item once.

- [x] TASK-10 — 🔴 **Test: a user's second vote does not change the count** — Criterion: `spec.md §3 → "The user can vote for a feedback item once."` Files: `test/votes.store.test.ts`. Verify: `npx vitest run test/votes.store.test.ts`. Done when: it fails because `vote` does not exist, not for config or import reasons. Evidence: Red as expected: 2 failed, `TypeError: store.vote is not a function`.
- [x] TASK-11 — 🟢 **Implement `FeedbackStore.vote`** — Criterion: same. Files: `src/store.ts`. Verify: `npx vitest run test/votes.store.test.ts && npm test`. Done when: both exit 0. Evidence: `votes.store.test.ts` 2 passed; `npm test` 5 passed; typecheck clean.

### Feature: The user can remove their vote from a feedback item.

- [x] TASK-20 — 🔴 **Test: unvote removes only the caller's vote and never goes below zero** — Criterion: `spec.md §3 → "The user can remove their vote from a feedback item."` + §6 Security and Consistency. Files: `test/votes.store.test.ts`. Verify: `npx vitest run test/votes.store.test.ts`. Done when: it fails because `unvote` does not exist. Evidence: Red as expected: 2 failed, `TypeError: store.unvote is not a function`; the 2 vote tests still pass.
- [x] TASK-21 — 🟢 **Implement `FeedbackStore.unvote`** — Criterion: same. Files: `src/store.ts`. Verify: `npx vitest run test/votes.store.test.ts && npm test`. Done when: both exit 0. Evidence: `votes.store.test.ts` 4 passed; `npm test` 7 passed; typecheck clean.

## Phase 2 — HTTP

### Feature: The system requires the user to be signed in before changing a vote.

- [x] TASK-30 — 🔴 **Test: `PUT`/`DELETE /feedback/:id/vote` return 401 for a visitor and change nothing** — Criterion: `spec.md §3 → "The system requires the user to be signed in before changing a vote."` Files: `test/votes.api.test.ts`. Verify: `npx vitest run test/votes.api.test.ts`. Done when: it fails because the routes are not registered (404). Evidence: Red as expected: `expected 404 to be 401` (route not registered).

### Feature: vote and unvote over HTTP

- [x] TASK-31 — 🔴 **Test: `PUT` returns `{ voted: true, count }` and is idempotent; `DELETE` returns `{ voted: false, count }`; unknown item → 404** — Criterion: `spec.md §3` vote and unvote, `§4` Vote and Unvote flows. Files: `test/votes.api.test.ts`. Verify: `npx vitest run test/votes.api.test.ts`. Done when: it fails because the routes are missing. Evidence: Red as expected: 3 failed with `expected 404 to be 200` / Fastify default 404 body instead of `{ error: 'feedback item not found' }`.
- [x] TASK-32 — 🟢 **Implement `PUT` and `DELETE /feedback/:id/vote`** — Criterion: TASK-30 + TASK-31. Files: `src/app.ts`. Verify: `npx vitest run test/votes.api.test.ts && npm test`. Done when: both exit 0. Evidence: `votes.api.test.ts` 4 passed; `npm test` 11 passed; typecheck and lint clean.

### Feature: The system shows the current vote count of every item.

- [ ] TASK-40 — 🔴 **Test: `GET /feedback` includes `votes` on every item** — Criterion: `spec.md §3 → "The system shows the current vote count of every item."` Files: `test/votes.api.test.ts`. Verify: `npx vitest run test/votes.api.test.ts`. Done when: it fails because items have no `votes`. Evidence: —
- [ ] TASK-41 — 🟢 **Include `votes` in the list** — Criterion: same. Files: `src/store.ts`, `src/app.ts`. Verify: `npx vitest run test/votes.api.test.ts && npm test`. Done when: both exit 0. Evidence: —

## Phase N — Flows and NFRs

- [ ] TASK-90 — 🔗 **§4 flows end to end: vote, unvote without a vote, visitor refused, unknown item** — Criterion: `spec.md §4` (all three flows, happy and error paths). Files: `test/votes.flows.test.ts`. Verify: `npx vitest run test/votes.flows.test.ts`. Done when: exits 0. Evidence: —
- [ ] TASK-95 — 🔗 **NFR performance: 1,000 sequential votes under 1 s** — Criterion: `spec.md §6 Performance`. Files: `test/votes.flows.test.ts`. Verify: `npx vitest run test/votes.flows.test.ts`. Done when: exits 0. Evidence: —

Security and consistency NFRs are verified by TASK-20 (only the caller's vote, never negative), TASK-30 (401) and TASK-31 (idempotent). Language: responses reuse `{ error: string }`, checked in TASK-30/31.

## Coverage matrix

| spec §3 feature | plan contract | task IDs |
|---|---|---|
| The user can vote for a feedback item once. | `FeedbackStore.vote`, `PUT /feedback/:id/vote` | TASK-10, TASK-11, TASK-31, TASK-32 |
| The user can remove their vote from a feedback item. | `FeedbackStore.unvote`, `DELETE /feedback/:id/vote` | TASK-20, TASK-21, TASK-31, TASK-32 |
| The system shows the current vote count of every item. | `GET /feedback` with `votes` | TASK-40, TASK-41 |
| The system requires the user to be signed in before changing a vote. | 401 on `PUT`/`DELETE` | TASK-30, TASK-32 |

Every §4 flow (happy and error paths) is in TASK-90; the measurable §6 NFR is TASK-95. No orphans.
