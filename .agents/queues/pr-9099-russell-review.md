---
type: WorkQueue
title: PR 9099 adversarial findings remediation
ephemeral: true
---

# PR 9099 — adversarial findings (R3)

> **DONE:** R3 — all gates closed; review approved
> **Next pickup:** done

| Item | Scope | `commit_subject` (target amend) | `implementation_gate` | `review_gate` | `coverage_evidence_gate` | `commit_gate` | `next_work_type` | `validation_tier` | Notes |
|------|-------|----------------------------------|----------------------|---------------|--------------------------|---------------|------------------|-------------------|-------|
| R3-A | #1 #4 #8 helpers static env + jet/metro precedence | `test(e2e): make all contentious e2e resources configurable` | closed | closed | n/a* | closed | done | `area-focused` | *helpers are e2e JS under packages/app/e2e — not lib; coverage n/a unless review says otherwise |
| R3-B | #2 #3 #5 #7 check/release + preflight + stale JSON | `test(e2e): add env-aware host check and release scripts` | closed | closed | n/a | closed | done | `area-focused` | A/B fixed — SIGTERM-immune metro recheck evidence |
| R3-C | #6 ORG_GRADLE Android Metro wiring | `test(e2e): make all contentious e2e resources configurable` (scripts/docs as needed) | closed | closed | n/a | closed | done | `area-focused` | Wire into android test scripts + env docs |

## Findings status
### #1–#8 — fixed (implementation closed)
1–8 addressed in prior R3 implementation.

### Findings A/B — fixed (implementation closed)
- **Finding A:** release recheck without `--services` — fixed; SIGTERM-immune metro recheck evidence
- **Finding B:** `--mellifera` flag clobbered by child check — fixed; SIGTERM-immune metro recheck evidence

## Amend policy
Folded via fixup + autosquash onto `origin/main`. Final history remains exactly 3 commits with subjects:
1. `test(e2e): make all contentious e2e resources configurable`
2. `test(macos): e2e run completion detection fixes`
3. `test(e2e): add env-aware host check and release scripts`

## Current gates
- next_work_type: done
- validation_tier: area-focused
- implementation_gate: closed
- review_gate: closed (approved)
- commit_gate: closed
- coverage_evidence_gate: n/a

## Validation evidence (compact)
- lint: pass
- jest: 12/12 pass
- babel smoke: pass
- check default vs `--services`: pass (default ≠ Metro/emulator BUSY)
- macos / ios / android: exit 0
- A/B: SIGTERM-immune metro recheck evidence recorded
- independent review: approved
