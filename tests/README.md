# Tests — the review bench

Playwright scripts that drive the live prototype the way a person would.

Setup: `npm i -D playwright && npx playwright install chromium`, then serve
the repo root (`python3 -m http.server 8901`) or point `BASE` at a deploy:

    BASE=https://onboarding-activation-funnel.vercel.app node tests/ghost.mjs

- `ghost.mjs` — the ghost user plays all three level branches start to
  offer paywall; fails loudly with the step it stalled on.
- `mic-ui.mjs` — screenshots of the mic states, framework card, score
  report, beginner stage and language list into `tests/out/`.
- `transport.mjs` — forward/back/pause/play on the review transport.
- `l10n.mjs` — French/Italian/Portuguese takeover screens.
- `capture-all.mjs` — every screen of the Career-at-work cohort, all
  three branches, for design review (feeds the Paper flow pages).

Screenshots land in `tests/out/` (gitignored).
