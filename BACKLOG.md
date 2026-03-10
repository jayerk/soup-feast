# BACKLOG.md — soup-feast

This file tracks active and planned work for this repository.
Items connect to design context in the `jay-i-skills` repo under
`.claude/skills/personal/soup-feast/`.

Work through items using the `/repo-brief` skill (in `jay-i-skills`),
which reads this file and the referenced context to produce a focused
working session brief.

---

## Status Key

| Status | Meaning |
|--------|---------|
| `todo` | Ready to work |
| `in-progress` | Active Claude Code session |
| `done` | Merged to main |
| `hold` | Blocked — see notes |

---

## Priority Key

| Priority | Meaning |
|----------|---------|
| P0 | Foundational — unblocks other work |
| P1 | High value — do early |
| P2 | Important — do after P0 + P1 |

---

## Active Backlog

| # | Priority | Status | Title | Ref |
|---|----------|--------|-------|-----|
| 1 | P0 | `todo` | Create `CLAUDE.md` at repo root — agent orientation + pointer to jay-i-skills design docs | [jay-i-skills: soup-feast-app-design.md](https://github.com/jayerk/jay-i-skills/blob/main/.claude/skills/personal/soup-feast/soup-feast-app-design.md) |
| 2 | P0 | `todo` | Document pointer to jay-i-skills design docs in CLAUDE.md (pointer pattern, not copy) | [jay-i-skills: soup-feast-app-design.md](https://github.com/jayerk/jay-i-skills/blob/main/.claude/skills/personal/soup-feast/soup-feast-app-design.md) |
| 3 | P1 | `todo` | Document module boundary conventions in CLAUDE.md (`app/`, `data/`, `lib/` import rules) | [src/](src/) |
| 4 | P1 | `todo` | Add `docs/voting-rules.md` — RCV algorithm spec, tie-breaking, ballot validation | [src/app/results/](src/app/results/) |
| 5 | P1 | `todo` | Add "Working with Claude Code" conventions section to CLAUDE.md | [CLAUDE.md](CLAUDE.md) — to be created |
| 6 | P2 | `todo` | Create `docs/plans/` structure (active/ + completed/ subfolders + first plan) | — |
| 7 | P2 | `todo` | Create `CHANGELOG.md` — scaffold decision notes while still fresh | — |

---

## On Hold

| # | Priority | Status | Title | Blocking Condition |
|---|----------|--------|-------|--------------------|
| — | — | — | — | — |

---

## Completed

| # | Title | Completed |
|---|-------|-----------|
| — | — | — |

---

## Design Context

Full design docs live in `jay-i-skills`, not this repo (pointer pattern):

- App design: https://github.com/jayerk/jay-i-skills/blob/main/.claude/skills/personal/soup-feast/soup-feast-app-design.md
- Process flow: https://github.com/jayerk/jay-i-skills/blob/main/.claude/skills/personal/soup-feast/soup-feast-process-flow.md

**Before making structural or UX changes, load these files.**

---

## Notes

- Annual event app — ~100 guests, ~25 soups, ranked-choice voting.
- Tech: Next.js App Router, PostgreSQL/Prisma, Tailwind, token-based guest auth.
- Voting logic and auth are protected invariants — always require human review.
- No raw SQL. All DB access through Prisma via `lib/`.
