# Stimuler · Onboarding + Activation funnel (v2)

The merged funnel: **India onboarding**'s chat shell and activation tail, with a
deeper, branched middle taken from **Activation v3**'s goal and situation model.

No build step, no dependencies — open `index.html`, or serve the folder:

```bash
python3 -m http.server 8000
```

## The flow

Nine stages. Stages 1–4 and 6–9 are identical for every user; **all divergence
lives in stage 5**.

| # | Stage | Notes |
|---|---|---|
| 1 | Language → app language | Global. Bahasa Indonesia first — Indonesia is the launch market |
| 2 | Name · Phone | Country code follows the language. Phone is skippable |
| 3 | Heard from | India's flat list of nine, unchanged. No drill-down |
| 4 | Age · Gender | Buckets, both skippable. Data capture only |
| 5 | **Goal** | The only real fork. Exam is a parent; **only IELTS branches further** |
| 6 | Situation | **Forks the career scenario set**; profile data elsewhere |
| 7 | **Scenarios** | Multi-select, keyed to goal. Min 1, no cap, no ordering. **Exam cohorts skip it** |

Every scenario is a **job, phrased verb-first, with a named counterpart**
(`who` in `content.js`). Two tests, both of which have to pass:

1. **Can you name who's on the other side?** If not it's a skill or a place,
   not a scenario, and it can't be played.
2. **Does the label say what you're trying to get done?** "Talking to my
   flatmates" is a topic. "Sort things out with my flatmate" is a job.
   Gerunds are the tell — they name a subject, not an outcome.

**Goal is the primary key; situation refines it via a work mode.** The model
comes from `usa-onboarding` (`GOALS.jtbd` + `JTBD_MODE`) — India has no JTBD
concept and Activation v3 only renamed the scenario to `jtbdLabel`.

Seven situations collapse to six work modes (freelancing and running a business
are the same conversation — you answer to clients either way):

| Situation | Work mode |
|---|---|
| Working a job | `office` |
| Studying | `student` |
| Freelancing · Running my own business | `ownboss` |
| Looking for work | `jobhunt` |
| At home with family | `athome` |
| On a career break | `careerbreak` |

Only **career** and **personal growth** refine by mode — the same two
usa-onboarding refines. Travel, school and exam don't: a waiter is a waiter
whether you're a student or a CEO.

Career refines all six ways. Personal only refines three — `student`, `athome`
and `careerbreak`; working, freelancing, running a business and job-hunting
share `_default`, because an adult's social life doesn't change because you
invoice instead of drawing a salary. **12 scenario lists**, not 35.

usa-onboarding puts "Handle doctors and offices solo" in every social list.
That's an immigrant-in-the-US need — you can't take a translator to every
appointment. Our learners are in their own countries and see the doctor in
their own language, so it's dropped.

## Cohorts

Ten paths. The goal decides the reading passage, the pronunciation words and
the paywall headline. The goal — refined by situation for career — decides the
scenario set.

| | Cohort | Extra stage-5 screens | Total |
|---|---|---|---|
| A | Exam · IELTS | +4 — exam → Academic/General → when → band slider | 22 |
| B | Exam · TOEFL / TOEIC / PTE | +1 — recorded, then straight on | 19 |
| C | Exam · Others | +2 — plus a free-text field | 20 |
| D | Grow in my career | — | 19 |
| E | Personal growth | — | 19 |
| F | Excel at my school | — | 19 |
| G | Travel confidently | — | 19 |

## Review panel

On desktop, a side panel deep-links into any point of any cohort. The top row
is **Branch** — one chip per distinct scenario list with its item count, so
every one of the 12 is a single tap from any other. It's derived from
`SCENARIOS`, so adding a work mode makes a chip appear on its own.

All state is in the URL:

```
?cohort=A&step=band
?cohort=D&step=scenarios&lvl=intermediate
?goal=travel&step=reading&lang=id
```

- `cohort` — `A … G`, sets goal + exam together
- `step` — jump to any stage; everything before it fast-forwards
- `goal` — `exam · career · personal · school · travel`
- `exam` — `ielts · toefl · toeic · pte · other`
- `sit` — situation; refines career and personal growth via work mode
- `lang` — `en` plus `id · es · pt · hi · vi · ar · fr`
- `lvl` — `beginner · intermediate · advanced`
- `perf` — ladder outcome override: `weak · mid · midhigh · strong` (defaults by level)

## The interaction layer (juice v2)

Seven primitives in `juice.js`, placed by one rule — everything that flies
lands somewhere and stays:

- **Star tray** — six slots in the header. Milestone answers pop off the
  user's chip and land as gold stars (slotPunch · ringPulse · barGlow,
  vocabulary from the conversation-lead prototype). Stars persist and fly
  down into the plan-build stack.
- **Punch + icon micro-anims** on every option tap (flag waves, briefcase
  bounces) — no particles on menu taps.
- **Canvas confetti engine** (ported from Activation v3): burst on ladder
  passes and practice wins, rain on the offer, fireworks on the gift.
- **The one sweep** — a single Gemini-style indigo→gold gradient pass at
  plan-build. Gold appears only when earned.
- **Live waveform** while Sarah "says it" on the echo rung; glow around the
  mic while it listens.
- **Permission card** — the notification ask as a self-granting toggle.
- Everything is FF-aware (instant during deep-link fast-forward) and dies
  under `prefers-reduced-motion`.

## What's new versus the India prototype

- **Multi-select** (`.opt.ms-opt`) — plain ticks, no numbering, because
  selection order carries no meaning. Needs its own confirm button.
- **Band slider** (`.band-card`) — the full IELTS 0–9 scale in 0.5 steps, with
  a caption naming what that band unlocks. IELTS only.
- **Goal-keyed activation** — `content.js` holds one passage and one pair of
  pronunciation words per goal, replacing India's single paint sentence.
- **IDR pricing** — Rp 299.000 yearly / Rp 59.000 monthly, offer Rp 149.000.

## Files

```
index.html     flow markup (all screens)
content.js     everything that varies by cohort — the content spec
app.js         chat engine + flow script + takeover sequences
i18n.js        copy; English base, partial Bahasa Indonesia
tokens.css     colour decisions
styles.css     layout + component anatomy
assets/        art, flags, icons, paywall + gift art
```

## Notes

- Indigo `#6C63FF` is interactive — every tappable fill. Gold `#D9A24A` is
  progress and reward only, and is never a tap affordance.
- All voice, mic and scoring behaviour is mocked; the mic never records.
- Indonesian copy is machine-drafted and needs native-speaker review.
- Prices and testimonial personas are illustrative.
