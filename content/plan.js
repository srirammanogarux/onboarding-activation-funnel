/* ============================================================
   Stimuler · onboarding content — plan & pricing
   Plan-screen headlines, plan-build checklist, paywall titles, pricing.
   Classic script: top-level consts are shared with the files
   that load after this one; content/index.js assembles the
   window.CONTENT export.
   ============================================================ */

'use strict';

/* ---------- the award credential, shown right before the mic ---------- */
/*
  PLAN — the headline the plan screen leads with, per goal. The rows
  underneath are the learner's own answers, so this is the only line on
  that screen we write for them; it has to name the thing they said they
  wanted, not the product.
*/
const PLAN = {
  career:   { title: 'Speaking up at work,<br>in English',      first: 'Disagreeing in a meeting, out loud' },
  exam:     { title: 'Sounding certain<br>in the speaking test', first: 'A full answer, nothing rehearsed' },
  personal: { title: 'Finishing your thoughts<br>in English',    first: 'One sentence, start to end' },
  school:   { title: 'Being heard<br>in the seminar',            first: 'Saying the first thing, not the third' },
  travel:   { title: 'Handling it yourself,<br>in English',      first: 'Asking for what you need, out loud' },
};


/* plan-build takeover: the checklist that assembles their plan */
const PLAN_BUILD = [
  'Scenario library matched',
  'Difficulty calibrated to your level',
  'Daily pace set',
];

/* ---------- 7 · paywall headline, keyed to GOAL ---------- */
const PW_TITLE = {
  exam:     '<em>Ace your exam</em><br>with English practice',
  ielts:    '<em>Ace your IELTS</em><br>with English practice',
  career:   '<em>Improve your career</em><br>with English practice',
  personal: '<em>Speak fluently</em><br>with confidence',
  school:   '<em>Excel at school</em><br>with English practice',
  travel:   '<em>Travel the world</em><br>with English practice',
};

/* ---------- 8 · pricing (IDR) ---------- */
const PRICING = {
  cur: 'Rp',
  yearly:      'Rp 299.000',
  monthly:     'Rp 59.000',
  offerWas:    'Rp 299.000',
  offerNow:    'Rp 149.000',
  offerMonthlyWas: 'Rp 59.000',
  offerMonthlyNow: 'Rp 29.000',
  perMonthNote: 'Just Rp 12.400 per month paid for a whole year',
  socialProof:  'What 12Mn+ learners say!',
  lovedBy:      '8Mn+',
};
