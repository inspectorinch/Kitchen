# Docs map
Claude Code writes and maintains everything here. Agents read these instead of re-reading the whole source of truth. Each agent can write only its own folder (a hook enforces it).

| Path | What it holds | Written by |
|---|---|---|
| `spec/PRODUCT.md` | One page: who it's for, journeys, what's in and out. For idea-first projects this plus the feature specs is the source of truth | `/ox:init`, owner-approved |
| `spec/` | Feature specs with AC ids, SCREENS.md + golden screenshots, DATA-MODEL.md, SECURITY.md, COPY.md, DESIGN.md | spec-writer; kept current by docs-keeper |
| `ARCHITECTURE.md`, `TESTING.md` | Stack, layout, adapters, test layers, definition of done | orchestrator |
| `research/` | Dated notes on current SDKs, engines, consoles and store rules | researcher |
| `runbooks/` | Repeatable build, deploy, upload, hotfix and rollback steps | release-engineer |
| `store/`, `launch/` | Store, legal and launch drafts for owner approval | store-writer |
| `owner/` | Click-by-click guides for owner-only steps | owner-guide-writer |
| `PROJECT-DETAILS.md` | Stand-ins, environments, test targets, screens, journeys: the longer project facts | orchestrator |
| `checkins/` | One page per check-in: what to try, the phase gate's result, the owner's feedback | `/ox:checkin` |
| `qa/` | Screenshots, logs and audit output from checkers | visual-checker, qa-explorer, a11y-checker, device-tester |
| `WORKQUEUE.md` | Ready work by lane, waiting items, run log | planner + orchestrator |
| `BUGS.md` | Reproducible bugs and audit findings (the format is at its top) | checkers; fixed by debugger |
| `retro/` | Retro reports, `metrics.csv`, `PROPOSALS.md` | retro-analyst |
| `templates/` | Product page, feature spec, owner guide, retro | kit |
