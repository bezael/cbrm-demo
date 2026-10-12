# Technical Plan — Feedback voting

## 1. Final stack

Unchanged (see `AGENTS.md` → Lane): TypeScript 5.9, Fastify 5.12, Vitest 3.2, npm. No new dependencies.

- **CI / Tests:** Vitest, already installed and green (`npm test`).

## 2. Data model

- `votes: Map<itemId, Set<userId>>` inside `FeedbackStore`. A `Set` makes "one vote per user and item" structural, and the count is its size, so it cannot go negative.
- List responses add a derived `votes: number` to each item; it is not stored on the item.

## 3. Contracts

- `FeedbackStore.vote(itemId, userId): number | undefined` — adds the vote if missing; returns the count, or `undefined` if the item does not exist.
- `FeedbackStore.unvote(itemId, userId): number | undefined` — removes that user's vote if present; same return.
- `PUT /feedback/:id/vote` → 200 `{ voted: true, count }` · 401 without user · 404 unknown item.
- `DELETE /feedback/:id/vote` → 200 `{ voted: false, count }` · 401 without user · 404 unknown item.
- `GET /feedback` → each item includes `votes`.

## 4. External dependencies

None.

## 5. Technical risks and mitigations

- **Double counting on repeated votes** → the `Set` ignores duplicates; a test votes twice.
- **A user removing someone else's vote** → `unvote` deletes only `(itemId, userId)` for the caller's identity; a test checks the other vote survives.
- **Negative counts** → the count is `Set.size`; a test unvotes without a vote.

## 6. Build order

1. Store behavior (`vote`, `unvote`, counts).
2. HTTP contracts (`PUT`/`DELETE` vote, `votes` in the list).
3. Flows and NFR checks.
