# Stimuler · onboarding + activation funnel (worldwide)

A no-build vanilla-JS prototype of the merged onboarding → activation →
paywall funnel. Ships everywhere **except** India, Indonesia, LatAm and the
USA (each has its own funnel). Live: https://onboarding-activation-funnel.vercel.app

Open `index.html` from any static server — there is no build step.

## Map

| Area | Where | What lives there |
|---|---|---|
| Screens & flow | `index.html`, `app.js` | Every screen's markup, the chat engine, the level fork, all sequences (readings, question, framework, meter, drills, loaders, paywall tail) |
| Content per branch | `content/` | `languages` · `goals` (+situations) · `scenarios` (branching keys, JTBD lists) · `practice` (affirmation ladders, 12 cohorts, drill words, Sarah's voice lines) · `proof` (testimonial cast) · `plan` (headlines, pricing) — assembled by `content/index.js` into `window.CONTENT` |
| Localisation | `i18n.js` | `T()` keys + `CL()` English-string dictionaries for fr/it/pt. The English being *practised* is never translated |
| Animations & juice | `juice.js`, `styles.css`, `tokens.css` | Confetti, emoji pips, ambient states, all component styling on the token system |
| Interactions rig | `autopilot.js` | Flow-review panel, transport controls, and the ghost user (`?auto=1`) |
| Images | `assets/` | `flags/` · `sarah/` · `people/` (testimonial photos + `-face` avatar crops, credits in `people/CREDITS.txt`) · `paywall/` (graph, gift, coupons) · `ui/` · `brand/` · `legacy/` (unreferenced India-era files) |
| Tests | `tests/` | Playwright bench — see `tests/README.md` |

## The flow, per level

Chat (language → … → level → award → plan sheet), then:

- **Beginner** — 3-reading affirmation ladder. Clean run → plain loader →
  paywall. A slip → run-decided speech meter → fix two words → drill →
  survey loader → paywall.
- **Intermediate / Advanced · impromptu** — one real question, answered
  freely → analysing → 4-skill score report → testimonial loader → paywall.
- **Intermediate / Advanced · hint** — bulb → 4-part model answer → read it
  aloud → self-report meter → fix two words → drill → survey loader → paywall.

Branching key: the **first tick** in the scenario multi-select (`famFirst`)
phrases the practice ask, the plan copy and the drill content.

## Deep links

All state rides the URL; the review panel just writes it:

```
?goal=career&sit=Working%20professional&lvl=beginner&perf=mid&step=meter
?lvl=advanced&path=hint&step=framework
?lang=fr                # French chat + takeovers
?auto=1                 # the ghost plays the whole funnel
```

## Deploying

`vercel deploy --prod --yes`, then verify the **alias** (not the deploy URL)
serves a marker from every changed file — parallel workspaces share the
alias and can overtake it.
