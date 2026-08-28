/* ============================================================
   Stimuler · Onboarding v2 — COHORT CONTENT
   Single source of truth for everything that varies by goal.

   Locked 2026-08-28:
   - Market is global, Bahasa Indonesia first (Indonesia is the
     first test market). Pricing is IDR.
   - Goal framing comes from Activation v3. "Prepare for an
     English exam" is a parent; only IELTS branches further.
   - Scenarios are keyed to GOAL, not situation. Multi-select,
     minimum 1, no upper cap, no ordering.
   - Activation (reading passage + the two pronunciation words)
     is keyed to GOAL.
   ============================================================ */

'use strict';

/* ---------- 1 · languages (global, Indonesia first) ---------- */
const LANGUAGES = [
  { value: 'id', label: 'Bahasa Indonesia', flag: 'id', cc: '+62' },
  { value: 'es', label: 'Español',          flag: 'es', cc: '+52' },
  { value: 'pt', label: 'Português',        flag: 'pt', cc: '+55' },
  { value: 'hi', label: 'हिन्दी',            flag: 'in', cc: '+91' },
  { value: 'vi', label: 'Tiếng Việt',       flag: 'vn', cc: '+84' },
  { value: 'ar', label: 'العربية',           flag: 'sa', cc: '+966' },
  { value: 'fr', label: 'Français',         flag: 'fr', cc: '+33' },
];

/* the "change app language" description, in-language */
const APPLANG_DESC = {
  id: 'Kamu akan belajar dalam bahasamu sendiri.',
  es: 'Aprenderás en tu propio idioma.',
  pt: 'Você vai aprender no seu próprio idioma.',
  hi: 'Aap apni bhasha mein seekhenge.',
  vi: 'Bạn sẽ học bằng ngôn ngữ của mình.',
  ar: 'ستتعلم بلغتك الأم.',
  fr: 'Vous apprendrez dans votre langue.',
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
  { value: 'ielts', label: 'IELTS',  branches: true },
  { value: 'toefl', label: 'TOEFL' },
  { value: 'toeic', label: 'TOEIC' },
  { value: 'pte',   label: 'PTE' },
  { value: 'other', label: "Others — I'll type it", freeText: true },
];

const IELTS_TYPES = [
  { value: 'academic', label: 'Academic',         desc: 'For university admission abroad.' },
  { value: 'general',  label: 'General Training', desc: 'For work, migration or PR.' },
  { value: 'unsure',   label: "I'm not sure yet", desc: "We'll assume Academic for now." },
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
    { value: '1m',     label: '1 month from now',  note: m1 },
    { value: '2m',     label: '2 months from now', note: m2 },
    { value: '2plus',  label: 'After 2 months',    note: `${m3} onwards` },
    { value: 'none',   label: "I haven't booked it yet" },
  ];
}

/* what a band unlocks — shown under the slider */
function bandNote(band){
  if (band < 5)   return 'Below most entry requirements';
  if (band < 6)   return 'Entry level for some colleges';
  if (band < 6.5) return 'Accepted by many universities';
  if (band < 7.5) return 'Competitive — most top universities';
  if (band < 8.5) return 'Strong — competitive programmes and PR';
  return 'Near-native. A very high bar.';
}

/* ---------- 4 · scenarios, keyed to GOAL ---------- */
const SCENARIOS = {
  exam: {
    prompt: 'In the speaking test, which of these do you want to handle with ease?',
    items: [
      'Introductions and small talk',
      'The long turn',
      'Discussion questions',
      'Describing charts and data',
      'Giving opinions with reasons',
      'Staying fluent under time pressure',
    ],
  },
  career: {
    prompt: 'Which of these do you want to handle with ease?',
    items: [
      'Talking to my manager',
      'Speaking up in meetings',
      'Presenting my work',
      'Handling client calls',
      'Small talk with colleagues',
      'Interviews and appraisals',
    ],
  },
  personal: {
    prompt: 'Where do you most want to feel comfortable?',
    items: [
      'Everyday conversation',
      'Making new friends',
      'Saying what I think',
      'Telling stories about myself',
      'Speaking without translating first',
      'Sounding natural, not textbook',
    ],
  },
  school: {
    prompt: 'On campus, which of these do you want to handle with ease?',
    items: [
      'Answering in class',
      'Presenting a project',
      'Group discussions',
      'Talking to teachers',
      'Debates and viva',
      'Making friends at school',
    ],
  },
  travel: {
    prompt: 'On the road, which of these do you want to handle with ease?',
    items: [
      'At the airport',
      'Hotel check-in',
      'Ordering food',
      'Asking for directions',
      'Shopping and bargaining',
      'Getting help in an emergency',
    ],
  },
};

/* ---------- 5 · situations (profile only, no fork) ---------- */
const SITUATIONS = [
  'Working a job',
  'Studying',
  'Freelancing',
  'Running my own business',
  'Looking for work',
  'At home with family',
  'On a career break',
];

/* ---------- 6 · activation, keyed to GOAL ----------
   `lead` is the first sentence — it fills in periwinkle as the
   user reads. `rest` completes the passage. The two pron words
   must both appear inside lead + rest.                        */
const ACTIVATION = {
  exam: {
    intro: "Let's hear you. Read this out loud — it's the kind of answer the examiner is listening for.",
    lead:  'In my opinion, the main advantage is that people can work from anywhere. ',
    rest:  'However, it also means the working day never really ends.',
    words: [
      { w:'opinion',   pre:'o',   hot:'pin', post:'ion', ph:'uh.pin.yun', tip:"Stress the middle sound ‘pin’", start:51 },
      { w:'advantage', pre:'ad',  hot:'van', post:'tage', ph:'ad.van.tij', tip:"The ‘tage’ says ‘tij’",       start:48 },
    ],
  },
  career: {
    intro: "Let's hear you. Read this out loud — it's the kind of thing you'd say at work.",
    lead:  "I'd like to take next Friday off. ",
    rest:  "It's my cousin's wedding, and my work for the week is already done.",
    words: [
      { w:'Friday',  pre:'Fri', hot:'da',  post:'y',  ph:'fry.day',  tip:"Two beats: ‘fry’ then ‘day’", start:54 },
      { w:'wedding', pre:'we',  hot:'ddi', post:'ng', ph:'weh.ding', tip:"The ‘dd’ stays soft",         start:51 },
    ],
  },
  personal: {
    intro: "Let's hear you. Read this out loud — it's the kind of thing you'd say to a new friend.",
    lead:  'I usually spend my weekends with my family. ',
    rest:  'We cook together, and sometimes we watch a movie at home.',
    words: [
      { w:'usually',  pre:'u',   hot:'su',  post:'ally', ph:'yoo.zhoo.lee', tip:"Three beats, not four",  start:50 },
      { w:'together', pre:'to',  hot:'ge',  post:'ther', ph:'tuh.geh.thur', tip:"Starts on ‘tuh’, not ‘to’", start:53 },
    ],
  },
  school: {
    intro: "Let's hear you. Read this out loud — it's the kind of thing you'd say in class.",
    lead:  'For my project, I studied how plants grow in different kinds of soil. ',
    rest:  'The results surprised everyone.',
    words: [
      { w:'project', pre:'',   hot:'proj', post:'ect', ph:'proj.ekt',  tip:"It's a noun, so stress ‘proj’", start:53 },
      { w:'results', pre:'re', hot:'sul',  post:'ts',  ph:'ri.zults',  tip:"The ‘s’ is a soft ‘z’",         start:49 },
    ],
  },
  travel: {
    intro: "Let's hear you. Read this out loud — it's the kind of thing you'd say at an airport.",
    lead:  'Excuse me, could you tell me where the departure gate is? ',
    rest:  'My flight leaves in about an hour.',
    words: [
      { w:'departure', pre:'de', hot:'par', post:'ture', ph:'di.par.chur', tip:"The ‘ture’ says ‘chur’", start:52 },
      { w:'hour',      pre:'',   hot:'h',   post:'our',  ph:'ow.er',       tip:"The ‘h’ is silent",      start:47 },
    ],
  },
};

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
  socialProof:  'What 8Mn+ learners say!',
  lovedBy:      '8Mn+',
};

/* ---------- 9 · cohorts, for the review panel ---------- */
const COHORTS = [
  { id:'A', label:'Exam · IELTS',  goal:'exam',     exam:'ielts' },
  { id:'B', label:'Exam · TOEFL',  goal:'exam',     exam:'toefl' },
  { id:'C', label:'Exam · Others', goal:'exam',     exam:'other' },
  { id:'D', label:'Career',        goal:'career' },
  { id:'E', label:'Personal',      goal:'personal' },
  { id:'F', label:'School',        goal:'school' },
  { id:'G', label:'Travel',        goal:'travel' },
];

window.CONTENT = {
  LANGUAGES, APPLANG_DESC, GOALS, EXAMS, IELTS_TYPES, examDateOptions,
  bandNote, SCENARIOS, SITUATIONS, ACTIVATION, PW_TITLE, PRICING, COHORTS,
};
