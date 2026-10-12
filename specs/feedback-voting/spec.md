# Spec — Feedback voting

> Dominicode Spec-First template (Bezael Pérez).

## Source

```yaml
source:
  - type: github_issue
    repository: bezael/cbrm-demo
    issue: 1
    url: https://github.com/bezael/cbrm-demo/issues/1
```

Context level: **HIGH**. The Issue states the request and answers the five clarifying questions, so there is no separate `intent.md`.

---

## SECTION 1 — Product Vision

Signed-in users can support a feedback item with one vote and take it back, and everyone sees an accurate count.

## SECTION 2 — Users and Use Cases

- User [signed-in]: vote for an item, remove their vote, see counts.
- User [visitor]: see counts; is refused when trying to vote.

## SECTION 3 — Features

**Module voting:**
- The user can vote for a feedback item once.
- The user can remove their vote from a feedback item.
- The system shows the current vote count of every item.
- The system requires the user to be signed in before changing a vote.

## SECTION 4 — User Flows

**Flow — Vote:**
1. A signed-in user sends `PUT /feedback/:id/vote`.
2. The system records one vote for that user and item and returns `{ voted: true, count }`. Voting again returns the same count.
- **Error:** the item does not exist → 404, no vote is created.

**Flow — Unvote:**
1. A signed-in user sends `DELETE /feedback/:id/vote`.
2. The system removes that user's vote and returns `{ voted: false, count }`.
- **Error:** the user had no vote → 200, the count is unchanged and never goes below zero. The item does not exist → 404.

**Flow — Visitor tries to vote:**
1. A request without a signed-in user sends `PUT` or `DELETE /feedback/:id/vote`.
2. The system returns 401 and changes nothing.
- **Error:** none beyond the refusal itself; the count stays visible through `GET /feedback`.

## SECTION 5 — Architecture

Extend the existing stack (`AGENTS.md` → Lane): Fastify 5 routes in `src/app.ts`, the in-memory `FeedbackStore` in `src/store.ts`, identity through `userIdOf`. No new dependencies.

## SECTION 6 — Non-functional Requirements

- **Performance:** vote and unvote are constant-time on the in-memory store; 1,000 sequential votes through `app.inject` finish in under 1 s.
- **Security:** only a signed-in user changes votes, and only their own; one user's unvote never removes another user's vote.
- **Consistency:** repeated votes and unvotes are idempotent; a count is never negative.
- **Scalability:** single process, in-memory, as the rest of the demo. Out of scope beyond that.
- **Language:** English, with the existing `{ error: string }` response shape.

## Open questions

None. The Issue answered them.
