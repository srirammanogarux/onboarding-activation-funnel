/* ============================================================
   Stimuler · Onboarding v2 — COHORT CONTENT
   Single source of truth for everything that varies by goal.

   Locked 2026-08-28:
   - Market is global, Bahasa Indonesia first (Indonesia is the
     first test market). Pricing is IDR.
   - Goal framing comes from Activation v3. "Prepare for an
     English exam" is a parent; only IELTS branches further.
   - Scenarios are keyed to GOAL, not situation. Multi-select,
     minimum 1, no upper cap, no ordering. Every scenario is a
     roleplay with a named counterpart. The exam cohort has no set —
     see SCENARIOS below for why.
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

/* ---------- 4 · scenarios, keyed to GOAL ----------
   Rule: every scenario must be a ROLEPLAY — a specific exchange with
   a specific counterpart. `who` is that counterpart, and it is not
   decoration: if you cannot name one, the item is a skill ("sounding
   natural") or a place ("at the airport"), not a scenario, and it
   cannot be played. Anything added here needs a `who`.            */
const SCENARIOS = {
  /* No scenario set for the exam cohort — deliberately.
     The format is already fixed, and by this point they have told us
     the exam, the type, the date and the target band. Asking which
     part of the test they are weakest at is self-diagnosis, which the
     activation at stage 9 does properly a minute later. Restore a set
     here and stage 7 turns itself back on. */
  exam: null,

  /* Career is the one goal where the SITUATION changes who you talk to.
     An employee answers to a manager, a freelancer to clients, an owner
     to suppliers and investors, a job-seeker to interviewers. Left as a
     single list, a freelancer sees four rows out of six that do not
     apply to them. No other goal has this problem — a waiter is a
     waiter whether you are a student or a CEO — so only career is
     keyed twice. Situations without their own set fall to `_default`. */
  career: {
    bySituation: {
      'Working a job': {
        prompt: 'At work, which of these do you want to handle with ease?',
        items: [
          { label: 'Talking to my manager',      who: 'your manager' },
          { label: 'Speaking up in meetings',    who: 'the team' },
          { label: 'Presenting my work',         who: 'the room' },
          { label: 'Handling client calls',      who: 'a client' },
          { label: 'Small talk with colleagues', who: 'a colleague' },
          { label: 'Appraisals and reviews',     who: 'your manager' },
        ],
      },
      'Freelancing': {
        prompt: 'With clients, which of these do you want to handle with ease?',
        items: [
          { label: 'Pitching to a new client',  who: 'a prospective client' },
          { label: 'Discussing my rate',        who: 'the client' },
          { label: 'A first discovery call',    who: 'a prospective client' },
          { label: 'Explaining a delay',        who: 'the client' },
          { label: 'Pushing back on scope',     who: 'the client' },
          { label: 'Asking for a testimonial',  who: 'a happy client' },
        ],
      },
      'Running my own business': {
        prompt: 'Running things, which of these do you want to handle with ease?',
        items: [
          { label: 'Pitching to investors',        who: 'an investor' },
          { label: 'Negotiating with a supplier',  who: 'the supplier' },
          { label: 'Briefing my team',             who: 'your team' },
          { label: 'Handling an unhappy customer', who: 'the customer' },
          { label: 'Talking at networking events', who: 'another founder' },
          { label: 'Closing a new customer',       who: 'the buyer' },
        ],
      },
      /* Looking for work · Studying · At home with family · On a career
         break — all heading into the same room, an interview. */
      _default: {
        prompt: 'In your search, which of these do you want to handle with ease?',
        items: [
          { label: 'Job interviews',            who: 'the interviewer' },
          { label: '"Tell me about yourself"',  who: 'the interviewer' },
          { label: 'Explaining a gap in my CV', who: 'the interviewer' },
          { label: 'Salary conversations',      who: 'the recruiter' },
          { label: 'Asking for a referral',     who: 'a contact' },
          { label: 'Following up after applying', who: 'the recruiter' },
        ],
      },
    },
  },
  personal: {
    prompt: 'In daily life, which of these do you want to handle with ease?',
    items: [
      { label: 'Meeting someone new',            who: 'someone you just met' },
      { label: 'Catching up with a friend',      who: 'your friend' },
      { label: 'Talking to my neighbours',       who: 'your neighbour' },
      { label: 'Sorting things out at the bank', who: 'the bank clerk' },
      { label: 'Video calls with family abroad', who: 'your cousin' },
      { label: 'Turning down an invitation',     who: 'your friend' },
    ],
  },
  school: {
    prompt: 'On campus, which of these do you want to handle with ease?',
    items: [
      { label: 'Answering in class',       who: 'your teacher' },
      { label: 'Presenting a project',     who: 'the class' },
      { label: 'Group discussions',        who: 'your classmates' },
      { label: 'Talking to teachers',      who: 'your teacher' },
      { label: 'Debates and viva',         who: 'the examiner' },
      { label: 'Making friends at school', who: 'a classmate' },
    ],
  },
  travel: {
    prompt: 'On the road, which of these do you want to handle with ease?',
    items: [
      { label: 'Checking in at the airport',    who: 'the check-in agent' },
      { label: 'Checking into a hotel',         who: 'the receptionist' },
      { label: 'Ordering at a restaurant',      who: 'the waiter' },
      { label: 'Asking someone for directions', who: 'a stranger' },
      { label: 'Bargaining at a market',        who: 'the seller' },
      { label: 'Fixing a booking gone wrong',   who: 'the desk agent' },
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
  { id:'A',  label:'Exam · IELTS',   goal:'exam',     exam:'ielts' },
  { id:'B',  label:'Exam · TOEFL',   goal:'exam',     exam:'toefl' },
  { id:'C',  label:'Exam · Others',  goal:'exam',     exam:'other' },
  { id:'D1', label:'Career · job',       goal:'career', sit:'Working a job' },
  { id:'D2', label:'Career · freelance', goal:'career', sit:'Freelancing' },
  { id:'D3', label:'Career · business',  goal:'career', sit:'Running my own business' },
  { id:'D4', label:'Career · seeking',   goal:'career', sit:'Looking for work' },
  { id:'E',  label:'Personal',       goal:'personal' },
  { id:'F',  label:'School',         goal:'school' },
  { id:'G',  label:'Travel',         goal:'travel' },
];

/* goal is the primary key; situation refines it only where a set
   declares bySituation. Returns null when the goal has no set. */
function scenarioSet(goal, situation){
  const g = SCENARIOS[goal];
  if (!g) return null;
  if (!g.bySituation) return g;
  return g.bySituation[situation] || g.bySituation._default;
}

window.CONTENT = {
  LANGUAGES, APPLANG_DESC, GOALS, EXAMS, IELTS_TYPES, examDateOptions,
  bandNote, SCENARIOS, scenarioSet, SITUATIONS, ACTIVATION, PW_TITLE,
  PRICING, COHORTS,
};
