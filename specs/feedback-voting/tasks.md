# Tasks — Feedback voting

**Status:** Completed

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

- [x] TASK-40 — 🔴 **Test: `GET /feedback` includes `votes` on every item** — Criterion: `spec.md §3 → "The system shows the current vote count of every item."` Files: `test/votes.api.test.ts`. Verify: `npx vitest run test/votes.api.test.ts`. Done when: it fails because items have no `votes`. Evidence: Red as expected: 1 failed, the list items have no `votes` field.
- [x] TASK-41 — 🟢 **Include `votes` in the list** — Criterion: same. Files: `src/store.ts`, `src/app.ts`. Verify: `npx vitest run test/votes.api.test.ts && npm test`. Done when: both exit 0. Evidence: `votes.api.test.ts` 5 passed; `npm test` 12 passed; typecheck and lint clean. Only `src/store.ts` changed: the route already returns `store.list()`, so `src/app.ts` needed no edit.

## Phase N — Flows and NFRs

- [x] TASK-90 — 🔗 **§4 flows end to end: vote, unvote without a vote, visitor refused, unknown item** — Criterion: `spec.md §4` (all three flows, happy and error paths). Files: `test/votes.flows.test.ts`. Verify: `npx vitest run test/votes.flows.test.ts`. Done when: exits 0. Evidence: `votes.flows.test.ts`: Vote, Unvote and Visitor flows pass, including the PUT 404 and unvote-without-vote, 3 of 3 runs (the DELETE 404 is in `votes.api.test.ts`). Strengthened by TASK-R1.
- [x] TASK-95 — 🔗 **NFR performance: 1,000 sequential votes under 1 s** — Criterion: `spec.md §6 Performance`. Files: `test/votes.flows.test.ts`. Verify: `npx vitest run test/votes.flows.test.ts`. Done when: exits 0. Evidence: 1,000 sequential votes in 64–68 ms (limit 1,000 ms), 3 of 3 runs; `npm test` 16 passed; typecheck and lint clean.

Security and consistency NFRs are verified by TASK-20 (only the caller's vote, never negative), TASK-30 (401) and TASK-31 (idempotent). Language: responses reuse `{ error: string }`, checked in TASK-30/31.

## Coverage matrix

| spec §3 feature | plan contract | task IDs |
|---|---|---|
| The user can vote for a feedback item once. | `FeedbackStore.vote`, `PUT /feedback/:id/vote` | TASK-10, TASK-11, TASK-31, TASK-32 |
| The user can remove their vote from a feedback item. | `FeedbackStore.unvote`, `DELETE /feedback/:id/vote` | TASK-20, TASK-21, TASK-31, TASK-32 |
| The system shows the current vote count of every item. | `GET /feedback` with `votes` | TASK-40, TASK-41 |
| The system requires the user to be signed in before changing a vote. | 401 on `PUT`/`DELETE` | TASK-30, TASK-32, TASK-R1 |

Every §4 flow (happy and error paths) is in TASK-90, strengthened by TASK-R1; the measurable §6 NFR is TASK-95. No orphans.

## Code Review

Independent reviewer (did not write the code), against Issue #1, this contract, `AGENTS.md` and the real diff; long loop re-run by the reviewer.

**Round 1 — Status: CHANGES REQUIRED · Alignment: Exact.** Production code matched plan §2/§3 with no tangling and no boundary violations. Two **Important** findings: tests that passed without proving their criterion, each shown with a mutant that kept 16/16 green.

1. `test/votes.api.test.ts:24` checked "nothing changes" with `store.vote()`, which restores a removed vote. Mutant: a visitor's DELETE removes a vote before the 401 → still green. The Visitor flow test never sent DELETE.
2. "No vote is created" for an unknown item was only checked through the return value. Mutant: record the vote, then return `undefined` → still green. Ids are sequential, so a phantom vote on "2" would land on the next item.

Minor: the performance test relied on an implicit warm-up and did not measure the spec's "constant-time" wording; the HTTP DELETE test did not show which vote remained and did not assert the DELETE 401 body; TASK-90 evidence overstated its 404 coverage. TASK-30 and TASK-31's Red/Green evidence was real, but it overclaimed: those tests did not prove "nothing changes" or "no vote is created".

- [x] TASK-R1 — 🔴→🟢 **Make the review's two criteria provable** — Criterion: `spec.md §4` Visitor (DELETE) and Vote error "no vote is created"; `§6` Security. Files: `test/votes.api.test.ts`, `test/votes.flows.test.ts` (tests only; no production change). Verify: `npm test`, then each reviewer mutant applied to `src/` and reverted. Done when: suite green on the real code and red on each mutant. Evidence: real code 16 passed. Mutant 1 (visitor DELETE removes a vote) → 2 failed (`a visitor cannot vote or unvote…`, `Visitor: refused with 401…`). Mutant 2 (phantom vote) → 1 failed (`Vote: … an unknown item is 404 and creates nothing`). Also: DELETE 401 body asserted, the remaining vote shown to be carla's, explicit untimed warm-up in the performance test.

**Spec reflow after round 1:** §6 Performance said "constant-time", which no test measures. The verifiable criterion is the 1 s budget; constant time is now stated as a design property of plan §2, not a criterion. No code changed.

**Round 2 — Status: PASS · Alignment: Exact.** Both Important findings closed: the reviewer re-applied both mutants in a scratch copy (M1 → 2 failed, M2 → 1 failed) and added two controls (a visitor DELETE that wipes every vote; unvote deleting another user's vote), both caught. `2f3dbcb` touches no `src/` file. Long loop re-run by the reviewer: `npm ci`, typecheck, lint exit 0; `npm test` 16 passed, 4 of 4 runs. Remaining Minor: about 7x wall-clock headroom on the performance test under CI load (watched in CI, not blocking).

## Final Verification

PASS (2026-10-12, Node 24, Windows). Lane long loop: `npm ci` exit 0 · `npm run typecheck` exit 0 · `npm run lint` exit 0 · `npm test` 4 files, 16 passed. Every earlier task's evidence is re-checked by this full run. No unchecked task, no coverage orphans, Code Review PASS with no blocking findings. Production diff limited to `src/app.ts` and `src/store.ts`; no dependency, workflow or `userIdOf` change. CI on Node 22 runs on the PR.
