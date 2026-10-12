# cbrm-demo

A minimal feedback API that walks one GitHub Issue to one verified PR with the Contract Based Review Method (CBRM).

## Contract

Work starts from a contract, never from a vague request. The contract is the list of
acceptance criteria in the task's spec, and each criterion has the command that proves it.

- **Where the contract lives:**
  - Features: `specs/<slug>/spec.md` + `tasks.md` (Dominicode SDD), using the `dominicode-sdd-creator` skill
  - Small Issues (clear bug, single-file change): a copy of `.dominicode/spec.template.md` at `.dominicode/specs/<issue-number>-<slug>.md`. Never fill the template in place.
- **No contract, no code.** If the task has no acceptance criteria, write them and get them approved before touching code.
- **The contract is the only source of scope.** If implementing it requires a decision the contract does not make, stop and update the contract first.

A task is done when:

1. Every acceptance criterion has evidence: which command proves it and what its output was.
2. The short loop and the long loop of the Lane pass, with no new reds.
3. The diff contains nothing the contract did not request.

Point 3 is the one most often missed. Extra code is code without a contract.

## Lane

The lane is where the agent is allowed to work and the harness it uses to check itself.
Leaving the lane requires explicit permission.

### Stack

- **Language:** TypeScript 5.9 (strict, `noUncheckedIndexedAccess`), ESM
- **Framework:** Fastify 5.12
- **Package manager:** npm — derived from `package-lock.json`. Do not use another.
- **Runtime / version:** Node 22 in CI; runs locally on Node 24
- **Tests:** Vitest 3.2

### Harness

These commands have been run and checked. If one fails, the work is not done.

#### Short loop — after every change

```bash
npm run typecheck   # ~7 s
npm run lint        # ~13 s
npm test            # ~5 s
```

#### Long loop — before opening the PR

```bash
npm ci              # clean install, as CI does
npm run typecheck   # ~7 s
npm run lint        # ~13 s
npm test            # ~5 s
```

There is no build step (`tsc --noEmit`; the dev server runs through `tsx`) and no E2E suite: every HTTP behavior is tested in-process with `app.inject`. CI (`.github/workflows/ci.yml`) runs the long loop on every PR.

#### Known reds

None. The entire harness is green as of 2026-10-12.

### Conventions

Detected by reading existing code, not imposed from outside:

- ESM imports use the `.js` suffix for local TypeScript files (`./store.js`).
- `buildApp(store)` builds the Fastify app with an injectable store; tests create a fresh app per test and call `app.inject`, never a real port.
- Tests live in `test/*.test.ts` and name behavior from the user's side (`a visitor cannot create an item`).
- Identity is read only through `userIdOf(request)` in `src/app.ts` (demo stand-in for auth: the `x-user-id` header).
- Errors return `{ error: string }` with the matching status code (400, 401, 404).

### Boundaries

What the agent must not touch without explicit permission:

- Files outside the change scope declared in the contract
- Deployment and infrastructure configuration files, including `.github/workflows/`
- Dependencies: do not add or update packages without asking first
- Secrets, `.env` files, and credentials
- The demo authentication in `userIdOf`: replacing it with real auth is out of scope for this repo

## Verdict

The verdict is what the reviewer reads instead of the diff. The agent does not say "done";
it delivers a verdict, and the verdict is only as good as its evidence.

Report it in the PR (or the hand-off) in this format:

```markdown
Status: PASS | CHANGES REQUIRED
Alignment: Exact | Tangling | Missing | Missing and Tangling

| # | Acceptance criterion | Status | Evidence |
|---|----------------------|--------|----------|
| 1 | ...                  | PASS   | `command` -> output |

Long loop: {{summarized output}}
New reds: none | {{list}}
Out-of-scope changes: none | {{list with justification}}
Not run: none | {{checks that were not executed, and why}}
```

- **Exact**: the change covers every criterion and nothing else. **Tangling**: it includes code no criterion asks for. **Missing**: a criterion is not satisfied. **Missing and Tangling**: both.
- Only `Exact` can be `PASS`, unless the deviation was accepted and written into the contract first.
- A check that was not executed is reported as *not run*, never as PASS.
- The reviewer inspects the diff only where the verdict is red or the evidence is missing.
