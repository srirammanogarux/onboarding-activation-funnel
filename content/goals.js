/* ============================================================
   Stimuler · onboarding content — goals & situations
   Goals, exams, band notes, situations and their juice icons.
   Classic script: top-level consts are shared with the files
   that load after this one; content/index.js assembles the
   window.CONTENT export.
   ============================================================ */

'use strict';

/* ---------- juice: emoji per goal ----------
   `e` pops from the tapped option; `rain` is the themed drop that
   fires on the big selections for that goal. */
const GOAL_FX = {
  exam:     { e: '📝', rain: ['📝','🎯','🏅','✨'] },
  career:   { e: '💼', rain: ['💼','📈','🤝','✨'] },
  personal: { e: '🌱', rain: ['🌱','💬','☕','✨'] },
  school:   { e: '🎓', rain: ['🎓','📚','✏️','✨'] },
  travel:   { e: '✈️', rain: ['✈️','🌍','🧳','✨'] },
};

/* ---------- 2 · goals (Activation v3 framing) ---------- */
const GOALS = [
  { value: 'exam',     label: 'Prepare for an English exam', branches: true },
  { value: 'career',   label: 'Grow in my career' },
  { value: 'personal', label: 'Personal growth' },
  { value: 'school',   label: 'Excel at my school' },
  { value: 'travel',   label: 'Travel confidently' },
];

/* ---------- 3 · exams — only IELTS branches further ---------- */
const EXAMS = [
  { value: 'ielts', label: 'IELTS',  icon: '📘', branches: true },
  { value: 'toefl', label: 'TOEFL',  icon: '🎓' },
  { value: 'toeic', label: 'TOEIC',  icon: '💼' },
  { value: 'pte',   label: 'PTE',    icon: '💻' },
  { value: 'other', label: "Others, I'll type it", icon: '✍️', freeText: true },
];

const IELTS_TYPES = [
  { value: 'academic', label: 'Academic',         icon: '🎓', desc: 'For university admission abroad.' },
  { value: 'general',  label: 'General Training', icon: '🌏', desc: 'For work, migration or PR.' },
  { value: 'unsure',   label: "I'm not sure yet", icon: '🤔', desc: "We'll assume Academic for now." },
];

/* real month names, computed from today */
function examDateOptions(){
  const M = ['January','February','March','April','May','June',
             'July','August','September','October','November','December'];
  const now = new Date();
  const m1 = M[(now.getMonth() + 1) % 12];
  const m2 = M[(now.getMonth() + 2) % 12];
  const m3 = M[(now.getMonth() + 3) % 12];
  return [
    { value: '1m',     label: '1 month from now',  icon: '⚡', note: m1 },
    { value: '2m',     label: '2 months from now', icon: '📅', note: m2 },
    { value: '2plus',  label: 'After 2 months',    icon: '🗓️', note: `${m3} onwards` },
    { value: 'none',   label: "I haven't booked it yet", icon: '⏳' },
  ];
}

/* what a band unlocks — shown under the slider */
function bandNote(band){
  if (band < 5)   return 'A clear starting point to build from';
  if (band < 6)   return 'Opens the door to some colleges';
  if (band < 6.5) return 'Accepted by many universities';
  if (band < 7.5) return 'Competitive at most top universities';
  if (band < 8.5) return 'Strong — top programmes and PR';
  return 'Near-native. Aim high, we like it.';
}


/* ---------- 5 · situations (profile only, no fork) ---------- */

/* an icon per situation, so every row has something to animate and send */
/* Synced 1:1 with usa-onboarding's qocc options (8 occupations). */
const SIT_FX = {
  'Student':              '📚',
  'Working professional': '💼',
  'Freelancer':           '💻',
  'Business owner':       '🏪',
  'Homemaker':            '🏡',
  'On a career break':    '🌤',
  'Looking for work':     '🔍',
  'Something else':       '✨',
};

const SITUATIONS = [
  'Student',
  'Working professional',
  'Freelancer',
  'Business owner',
  'Homemaker',
  'On a career break',
  'Looking for work',
  'Something else',
];
