# Bugs
Reproducible bugs and audit findings. debugger fixes them and marks them fixed with the commit.

## How to file (everyone uses this format)
1. Search this file for the same symptom first. If it's here, add your repro as a line under it instead of a new entry.
2. Next id: `B-<number>`, one higher than the last.
3. One bug per entry. If you can't reproduce it twice, use `Status: flaky` and say how often it happened.

```
### B-123: <short symptom, in the user's words>
- Severity: crash | wrong data | broken flow | accessibility | performance | cosmetic
- Where: <screen / journey / command> · <device, viewport or OS> · <build or commit>
- Steps: 1. … 2. … 3. …
- Expected: …
- Actual: …
- Evidence: <screenshot or log path under docs/qa/>
- Status: open
```

## Open

## Fixed
