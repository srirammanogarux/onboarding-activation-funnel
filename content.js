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

/* ---------- 1 · languages ----------
   This build ships everywhere EXCEPT India, Indonesia, LatAm and the
   USA (each has its own funnel) — so the list leads with Europe and
   covers the rest-of-world markets, not Bahasa/Hindi/LatAm Spanish. */
const LANGUAGES = [
  { value: 'fr', label: 'Français',    flag: 'fr', cc: '+33'  },
  { value: 'de', label: 'Deutsch',     flag: 'de', cc: '+49'  },
  { value: 'es', label: 'Español',     flag: 'es', cc: '+34'  },
  { value: 'it', label: 'Italiano',    flag: 'it', cc: '+39'  },
  { value: 'pt', label: 'Português',   flag: 'pt', cc: '+351' },
  { value: 'tr', label: 'Türkçe',      flag: 'tr', cc: '+90'  },
  { value: 'vi', label: 'Tiếng Việt',  flag: 'vn', cc: '+84'  },
  { value: 'ar', label: 'العربية',      flag: 'sa', cc: '+966' },
];

/* the "change app language" description, in-language */
const APPLANG_DESC = {
  fr: 'Vous apprendrez dans votre langue.',
  de: 'Du lernst in deiner eigenen Sprache.',
  es: 'Aprenderás en tu propio idioma.',
  it: 'Imparerai nella tua lingua.',
  pt: 'Vai aprender na sua própria língua.',
  tr: 'Kendi dilinde öğreneceksin.',
  vi: 'Bạn sẽ học bằng ngôn ngữ của mình.',
  ar: 'ستتعلم بلغتك الأم.',
};

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

/* ---------- 4 · work modes + scenarios ----------
   Model taken from usa-onboarding (`GOALS.jtbd` + `JTBD_MODE`), which is
   where this taxonomy actually lives — India has no JTBD concept and
   Activation v3 only renamed the scenario to `jtbdLabel`.

   Two keys, not one. GOAL is primary. SITUATION collapses to a WORK MODE
   and refines the list, but only for the two goals where who you talk to
   actually changes: career and personal. usa-onboarding refines exactly
   these two and leaves travel, school and exam alone — a waiter is a
   waiter whether you are a student or a CEO, but a stay-at-home parent's
   everyday English is the school gate, not the office kitchen.

   Our own rule still applies on top: every scenario is a roleplay with a
   named counterpart (`who`). usa-onboarding has JTBDs like "Understand
   fast coworkers" that name no one; those are rewritten as the exchange
   they actually are — asking a colleague to confirm what they said.  */

const WORKMODE = {
  'Student':               'student',
  'Working professional':  'office',
  'Freelancer':            'ownboss',
  'Business owner':        'ownboss',
  'Homemaker':             'athome',
  'On a career break':     'careerbreak',
  'Looking for work':      'jobhunt',
  'Something else':        'other',
};

const SCENARIOS = {
  /* Option lists are usa-onboarding's JTBD lists (GOALS.jtbd + JTBD_MODE
     overrides), verbatim. Multi-select stays ours: min 1, no cap, plain
     ticks. THE FIRST TICK IS THE BRANCHING KEY — its `fam` becomes
     famFirst, which keys the question-noun (PRACTICE_ASK) and plan copy. */
  exam: null,

  career: {
    byMode: {
      office: {
        prompt: 'At work, which of these do you want to get right?',
        items: [
          { e:'💼', label: 'Ace a job interview',             fam:'interview' },
          { e:'✋', label: 'Speak up in meetings',             fam:'meetings' },
          { e:'⚡️', label: 'Understand fast coworkers',       fam:'fastspeech' },
          { e:'🪜', label: 'Talk to my boss with confidence',  fam:'interview' },
          { e:'📞', label: 'Handle customer calls',            fam:'customer' },
        ],
      },
      ownboss: {
        prompt: 'With clients, which of these do you want to get right?',
        items: [
          { e:'🎯', label: 'Pitch on a client call',           fam:'pitch' },
          { e:'🤝', label: 'Win a new client',                 fam:'pitch' },
          { e:'🏷', label: 'Explain and defend my price',      fam:'pitch' },
          { e:'⚡️', label: 'Understand fast clients',         fam:'fastspeech' },
          { e:'⏰', label: 'Chase a late payment',             fam:'pitch' },
          { e:'🛎', label: 'Handle a walk-in customer',        fam:'customer' },
        ],
      },
      jobhunt: {
        prompt: 'In your search, which of these do you want to get right?',
        items: [
          { e:'💼', label: 'Ace a job interview',              fam:'interview' },
          { e:'🗣', label: 'Answer "tell me about yourself"',  fam:'interview' },
          { e:'🔗', label: 'Network to find openings',         fam:'smalltalk' },
          { e:'⚖️', label: 'Negotiate the offer',              fam:'pitch' },
        ],
      },
      student: {
        prompt: 'Starting out, which of these do you want to get right?',
        items: [
          { e:'🎓', label: 'Land an internship',               fam:'interview' },
          { e:'🗣', label: 'Speak up in interviews',           fam:'interview' },
          { e:'🔗', label: 'Network on campus',                fam:'smalltalk' },
        ],
      },
      athome: {
        prompt: 'Going back to work, which of these do you want to get right?',
        items: [
          { e:'🚪', label: 'Start working again',              fam:'interview' },
          { e:'🏡', label: 'Talk about skills I built at home', fam:'interview' },
          { e:'💬', label: 'Speak up in meetings',             fam:'meetings' },
          { e:'🧊', label: 'Make friends at a new workplace',  fam:'smalltalk' },
        ],
      },
      careerbreak: {
        prompt: 'Getting back into it, which of these do you want to get right?',
        items: [
          { e:'📄', label: 'Explain a gap in my CV',           fam:'interview' },
          { e:'💼', label: 'Ace a job interview',              fam:'interview' },
          { e:'💬', label: 'Speak up in meetings again',       fam:'meetings' },
          { e:'☕️', label: 'Handle work small talk again',     fam:'smalltalk' },
        ],
      },
      _default: {
        prompt: 'At work, which of these do you want to get right?',
        items: [
          { e:'💼', label: 'Ace a job interview',              fam:'interview' },
          { e:'✋', label: 'Speak up in meetings',              fam:'meetings' },
          { e:'⚡️', label: 'Understand fast coworkers',        fam:'fastspeech' },
          { e:'🪜', label: 'Talk to my boss with confidence',  fam:'interview' },
          { e:'📞', label: 'Handle customer calls',            fam:'customer' },
        ],
      },
    },
  },

  personal: {
    byMode: {
      _default: {
        prompt: 'In daily life, which of these do you want to get right?',
        items: [
          { e:'🧊', label: 'Make small talk feel natural',     fam:'smalltalk' },
          { e:'🫂', label: 'Meet new people and make friends', fam:'smalltalk' },
          { e:'🏥', label: 'Handle doctors and offices solo',  fam:'services' },
          { e:'👵', label: "Win over my partner's family",     fam:'family' },
        ],
      },
      office: {
        prompt: 'In daily life, which of these do you want to get right?',
        items: [
          { e:'🧊', label: 'Make small talk feel natural',     fam:'smalltalk' },
          { e:'🍽', label: 'Chat with colleagues outside work', fam:'smalltalk' },
          { e:'🏥', label: 'Handle doctors and offices solo',  fam:'services' },
          { e:'👵', label: "Win over my partner's family",     fam:'family' },
        ],
      },
      ownboss: {
        prompt: 'In daily life, which of these do you want to get right?',
        items: [
          { e:'🥂', label: 'Meet new people at events',        fam:'smalltalk' },
          { e:'🧊', label: 'Make small talk feel natural',     fam:'smalltalk' },
          { e:'🏥', label: 'Handle doctors and offices solo',  fam:'services' },
          { e:'👵', label: "Win over my partner's family",     fam:'family' },
        ],
      },
      student: {
        prompt: 'Day to day, which of these do you want to get right?',
        items: [
          { e:'👋', label: 'Make friends on campus',           fam:'smalltalk' },
          { e:'🧊', label: 'Make small talk feel natural',     fam:'smalltalk' },
          { e:'🏥', label: 'Handle doctors and offices solo',  fam:'services' },
        ],
      },
      athome: {
        prompt: 'Day to day, which of these do you want to get right?',
        items: [
          { e:'🧑‍🏫', label: 'Support my kids at school',        fam:'family' },
          { e:'🏥', label: 'Talk to teachers and doctors solo', fam:'services' },
          { e:'🚸', label: 'Make friends at the school gate',  fam:'smalltalk' },
          { e:'👵', label: "Win over my partner's family",     fam:'family' },
        ],
      },
      jobhunt: {
        prompt: 'In daily life, which of these do you want to get right?',
        items: [
          { e:'🫂', label: 'Meet new people and make friends', fam:'smalltalk' },
          { e:'🧊', label: 'Make small talk feel natural',     fam:'smalltalk' },
          { e:'🏥', label: 'Handle doctors and offices solo',  fam:'services' },
          { e:'👵', label: "Win over my partner's family",     fam:'family' },
        ],
      },
      careerbreak: {
        prompt: 'Getting back into it, which of these do you want to get right?',
        items: [
          { e:'🌤', label: 'Get back into everyday chat',      fam:'smalltalk' },
          { e:'🫂', label: 'Meet new people and make friends', fam:'smalltalk' },
          { e:'🏥', label: 'Handle doctors and offices solo',  fam:'services' },
          { e:'🧑‍🏫', label: 'Support my kids at school',        fam:'family' },
        ],
      },
    },
  },

  school: {
    prompt: 'At school, which of these do you want to get right?',
    items: [
      { e:'🎤', label: 'Pass my speaking exam',                fam:'exam' },
      { e:'⚡️', label: 'Keep up with fast lectures',           fam:'fastspeech' },
      { e:'✋', label: 'Speak up in class discussions',        fam:'meetings' },
      { e:'👋', label: 'Make friends on campus',               fam:'smalltalk' },
    ],
  },
  travel: {
    prompt: 'On the road, which of these do you want to get right?',
    items: [
      { e:'🛫', label: 'Breeze through airports and hotels',   fam:'services' },
      { e:'🫂', label: 'Make friends while traveling',         fam:'smalltalk' },
      { e:'🧾', label: 'Sort out any mix-up abroad',           fam:'services' },
    ],
  },
};

/* the question-noun per family, straight from usa-onboarding */
const PRACTICE_ASK = {
  interview:'interview question', pitch:'question from a client', crew:'question on site',
  meetings:'question in a meeting', fastspeech:'question at full speed',
  customer:'question from a customer', services:'question at an appointment',
  smalltalk:'everyday question', family:'question from a teacher',
  exam:'IELTS speaking question', pronunciation:'question out loud'
};

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

/* ---------- 6 · activation sentences, keyed to GOAL ----------
   Three AFFIRMATION phrases (user direction 2026-08-28): the first
   things a learner says out loud are self-affirming.

   Sentence 1: short, and it carries their own name.  Sentence 2: the
   same promise carried further, longer and with harder words.
   Sentence 3: sentence 2 again with its two hard words hidden, said
   from memory. Sarah never plays it back, she has no voice.
   {name} is replaced with what they told us in the chat.

   A slip stops the run there. The pron-practice pair always comes
   from the sentence that broke; a clean run never sees practice.
   Each word: pre<hot>post render for the pron card. */
const ACTIVATION = {
  exam: {
    intro: "Time to hear you. Say this like you mean it, the examiner listens for exactly this energy.",
    ladder: [
      { text: 'I am {name}, and I am ready for this exam.',
        words: [
          { w:'ready', pre:'rea', hot:'dy', post:'', ph:'reh.dee', tip:"Two quick beats: ‘reh’ then ‘dee’", start:55 },
          { w:'exam',  pre:'e',   hot:'xam', post:'', ph:'ig.zam', tip:"Stress the second beat: ‘zam’",    start:50 },
        ] },
      { text: 'I am {name}, and I answer every question with clarity and confidence.',
        words: [
          { w:'question', pre:'ques', hot:'tio', post:'n',  ph:'kwes.chun',  tip:"The ‘tio’ says ‘chun’",           start:49 },
          { w:'clarity',  pre:'cla',  hot:'ri',  post:'ty', ph:'kla.ri.tee', tip:"Three even beats, start on ‘kla’", start:49 },
        ] },
    ],
  },
  career: {
    intro: "Time to hear you. Say this like you'd say it at work, clear and unhurried.",
    ladder: [
      { text: 'I am {name}, and I speak up at work.',
        words: [
          { w:'speak', pre:'sp', hot:'ea', post:'k', ph:'speek', tip:"One beat, and the ‘ea’ is a long ‘ee’", start:54 },
          { w:'work',  pre:'w',  hot:'or', post:'k', ph:'wurk',  tip:"The ‘or’ says ‘ur’, not ‘or’",         start:52 },
        ] },
      { text: 'I am {name}, and I speak clearly in every meeting at work.',
        words: [
          { w:'clearly', pre:'cl',  hot:'ear',  post:'ly', ph:'kleer.lee', tip:"Two beats, and the ‘ear’ is ‘eer’",  start:50 },
          { w:'meeting', pre:'mee', hot:'ting', post:'',   ph:'mee.ting',  tip:"The ‘t’ softens, and it ends on ‘ng’", start:51 },
        ] },
    ],
  },
  personal: {
    intro: "Time to hear you. Say this like you'd say it to a friend, relaxed, no rush.",
    ladder: [
      { text: 'I am {name}, and I enjoy speaking English every day.',
        words: [
          { w:'enjoy', pre:'en', hot:'joy', post:'',   ph:'in.joy', tip:"Starts on ‘in’, not ‘en’",      start:55 },
          { w:'every', pre:'e',  hot:'ve',  post:'ry', ph:'ev.ree', tip:"Two beats, not three: ‘ev.ree’", start:53 },
        ] },
      { text: 'I am {name}, and I express myself naturally, without hesitation.',
        words: [
          { w:'naturally',  pre:'na',   hot:'tu', post:'rally', ph:'na.chruh.lee',    tip:"The ‘tu’ says ‘chruh’", start:48 },
          { w:'hesitation', pre:'hesi', hot:'ta', post:'tion',  ph:'heh.zi.tay.shun', tip:"The ‘s’ is a soft ‘z’",  start:49 },
        ] },
    ],
  },
  school: {
    intro: "Time to hear you. Say this like you'd say it in class, steady and proud.",
    ladder: [
      { text: 'I am {name}, and I am proud to speak in class.',
        words: [
          { w:'proud', pre:'pr', hot:'ou', post:'d',  ph:'prowd', tip:"The ‘ou’ says ‘ow’",                  start:55 },
          { w:'class', pre:'cl', hot:'a',  post:'ss', ph:'klas',  tip:"Two sounds at the front: ‘k’ then ‘l’", start:53 },
        ] },
      { text: 'I am {name}, and I answer difficult questions with confidence.',
        words: [
          { w:'difficult', pre:'di',   hot:'ffi', post:'cult', ph:'di.fi.kult', tip:"Stress the first beat: ‘di’", start:50 },
          { w:'questions', pre:'ques', hot:'tio', post:'ns',   ph:'kwes.chunz', tip:"The ‘tio’ says ‘chun’",       start:49 },
        ] },
    ],
  },
  travel: {
    intro: "Time to hear you. Say this like you're already on the trip, easy and sure.",
    ladder: [
      { text: 'I am {name}, and I am comfortable asking for help.',
        words: [
          { w:'comfortable', pre:'com', hot:'for', post:'table', ph:'kumf.tur.bul', tip:"Three beats, not four: ‘kumf.tur.bul’", start:46 },
          { w:'asking',      pre:'a',   hot:'ski', post:'ng',    ph:'ah.sking',     tip:"Open with a long ‘ah’",                 start:54 },
        ] },
      { text: 'I am {name}, and I handle unexpected situations with ease.',
        words: [
          { w:'unexpected', pre:'unex', hot:'pec', post:'ted',   ph:'un.ik.spek.tid',  tip:"Stress lands on ‘spek’", start:48 },
          { w:'situations', pre:'situ', hot:'a',   post:'tions', ph:'si.chu.ay.shunz', tip:"The ‘tu’ says ‘chu’",    start:47 },
        ] },
    ],
  },
};

/* ---------- conviction: proof stats ----------
   One global stat card (after attribution) + a one-liner keyed to
   the goal (right after they pick it). Numbers are illustrative. */
const PROOF = {
  /* the hero metric the counter widget animates to, then the supporting three */
  metric: { value: 32, unit: '%' },
  /* the three that count up under her sentence, in this order */
  global: { stars: 4.9, ratings: 12000000, countries: 190 },
  byGoal: {
    exam:     { n: 214000, line: 'passed their English exam with us last year' },
    career:   { n: 380000, line: 'use Stimuler to get ahead at work' },
    personal: { n: 520000, line: 'found their everyday confidence here' },
    school:   { n: 260000, line: 'students speak up in class thanks to Sarah' },
    travel:   { n: 190000, line: 'travellers ordered, bargained and got home fine' },
  },
};


/* ---------- outcome claim shown with the faces widget, keyed to GOAL ----------
   Only career carries an external citation (Azam et al. is a real study on
   English proficiency and wages). The rest are our own learner data. */
const OUTCOME = {
  exam:     { claim: 'Stimuler speakers reach their dream band faster.', hi: 'dream band faster',
              who: 'exam takers' },
  career:   { claim: 'Professionals with fluent English earn up to 34% more.', hi: '34% more',
              who: 'working professionals' },
  personal: { claim: 'Confident speakers have 3x more everyday conversations.', hi: '3x more',
              who: 'learners' },
  school:   { claim: 'Students who speak in class score higher in orals.', hi: 'score higher',
              who: 'students' },
  travel:   { claim: 'Travellers who speak up get better help, faster.', hi: 'better help, faster',
              who: 'travellers' },
};

/* ---------- testimonials, keyed to GOAL (Beside model: photo + outcome quote) ----------
   Worldwide cast (this build excludes India / Indonesia / LatAm / USA):
   names and cities mix Asia and Europe, men and women, and every quote
   states a concrete outcome the goal's learner actually wants. Photos are
   candid solo portraits — one person, face visible, role-plausible. */
const TESTIMONIALS = {
  career: [
    { img:'career-1', q:'I asked for a raise in English. It came back 20% higher than I planned to ask for.', n:'Jonas',  r:'Sales engineer, Munich' },
    { img:'career-2', q:'Foreign buyers stopped going through a middleman. I keep that margin now.',          n:'Emre',   r:'Export sales, Izmir' },
    { img:'career-3', q:'I used to email instead of speak. Now I run the Monday call.',                       n:'Kasia',  r:'Ops lead, Kraków' },
    { img:'career-4', q:'Two interviews in English, two offers. I took the better one.',                      n:'Linh',   r:'Analyst, Hanoi' },
  ],
  exam: [
    { img:'exam-1', q:'Band 6.0 to 7.5 in ten weeks. My visa cleared first try.',            n:'Grace',  r:'Nurse, Cebu' },
    { img:'exam-2', q:'Speaking was my worst section. It ended up my highest.',              n:'Mehmet', r:'IELTS 7.5, Ankara' },
    { img:'exam-3', q:'I stopped freezing in part two. Two minutes, no panic.',              n:'Elena',  r:'Scholarship applicant, Milan' },
  ],
  personal: [
    { img:'personal-1', q:'I stopped translating in my head halfway through my own sentences.', n:'Julien', r:'Graphic designer, Lyon' },
    { img:'personal-2', q:'My niece studies abroad. We talk properly now, not in fragments.',   n:'Keiko',  r:'Pharmacist, Osaka' },
    { img:'personal-3', q:'I answer the tourists on my street instead of pointing.',            n:'Álvaro', r:'Cafe owner, Seville' },
  ],
  school: [
    { img:'school-1', q:'I went from silent in seminars to running them.',                  n:'Thu',    r:'Final year, Ho Chi Minh City' },
    { img:'school-2', q:'Top marks in the oral. I had practised the exact questions.',      n:'Lukas',  r:'Grade 12, Hamburg' },
    { img:'school-3', q:'Group projects used to be the others talking. Now I present.',     n:'Zeynep', r:'Undergrad, Istanbul' },
  ],
  travel: [
    { img:'travel-1', q:'Missed my connection in Doha and sorted the whole thing myself.', n:'Minho',   r:'Engineer, Busan' },
    { img:'travel-2', q:'I argued a wrong hotel charge down to zero. In English.',         n:'Camille', r:'Solo traveller, Paris' },
    { img:'travel-3', q:'Umrah with my mother. I handled every counter for us.',           n:'Amira',   r:'Teacher, Casablanca' },
  ],
};

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

const AWARD = { kicker:"GOOGLE PLAY'S", title:'Best AI App of 2023',
                line:'4.9\u2605  \u00b7  12Mn+ learners  \u00b7  190+ countries' };

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

/* Short names for the work modes, used by the review panel. */
const MODE_LABEL = {
  office:'at work', ownboss:'own boss', jobhunt:'job hunt',
  student:'student', athome:'at home', careerbreak:'career break',
  _default:'everyday',
};

/* Every distinct scenario list, derived from SCENARIOS rather than
   listed by hand — a branch cannot go missing from the review panel
   when someone adds a mode. Each carries a situation that reaches it. */
function branches(){
  const out = [];
  const SHORT = { exam:'Exam', career:'Career', personal:'Personal',
                  school:'School', travel:'Travel' };
  for (const g of GOALS){
    const set = SCENARIOS[g.value];
    const short = SHORT[g.value] || g.label;
    if (!set){ out.push({ goal:g.value, label:`${short} · no screen`,
                          sit:SITUATIONS[0], mode:'—', count:0, skipped:true }); continue; }
    if (!set.byMode){
      out.push({ goal:g.value, label:short, sit:SITUATIONS[0], mode:'—', count:set.items.length });
      continue;
    }
    const declared = Object.keys(set.byMode);
    for (const [mode, list] of Object.entries(set.byMode)){
      const sit = mode === '_default'
        ? SITUATIONS.find(x => !declared.includes(WORKMODE[x]))
        : SITUATIONS.find(x => WORKMODE[x] === mode);
      out.push({ goal:g.value, label:`${short} · ${MODE_LABEL[mode] || mode}`,
                 sit, mode, count:list.items.length });
    }
  }
  return out;
}

/* goal is the primary key; situation refines it only where a set
   declares byMode. Returns null when the goal has no set. */
function scenarioSet(goal, situation){
  const g = SCENARIOS[goal];
  if (!g) return null;
  if (!g.byMode) return g;                       /* goal-only */
  const mode = WORKMODE[situation] || 'office';  /* situation -> work mode */
  return g.byMode[mode] || g.byMode._default || g.byMode.office;
}

/* ============================================================
   SPEAKING TASK (intermediate/advanced) — ported VERBATIM from
   usa-onboarding/practice.js. 12 cohorts keyed goal|workmode for
   career, plain goal otherwise. Each: {who, q, steps[4], parts[4],
   es} — es is the localisation slot (unused for the worldwide
   English build; FR/IT fill it later).
   Do not edit copy here without editing usa-onboarding too.
   ============================================================ */
const PRACTICE = {

  /* ---------- CAREER ---------- split by work mode, because a freelancer and
     a job seeker are not having the same conversation ---------------------- */

  'career|office': {
    who:   'Working professional',
    q:     'How are things going at work?',
    steps: ['Say how it is going', 'Give one detail', 'Say what is next', 'Close it'],
    parts: ['Things are going well at work.',
            'I am busy, but I like my team.',
            'We finish a big project this week.',
            'After that it should be calmer.'],
    es: { q: '¿Cómo te va en el trabajo?',
          steps: ['Di cómo va', 'Da un detalle', 'Di qué sigue', 'Ciérralo'],
          parts: ['En el trabajo todo va bien.', 'Estoy ocupado, pero me gusta mi equipo.', 'Terminamos un proyecto grande esta semana.', 'Después de eso será más tranquilo.'] }
  },

  'career|ownboss': {
    who:   'Freelancer or business owner',
    q:     'So what do you charge for this?',
    steps: ['Say the price', 'Say what is included', 'Give the reason', 'Hold your price'],
    parts: ['My price for this is two thousand.',
            'That covers the work and two changes.',
            'It takes me about three weeks.',
            'I think that is a fair price.'],
    es: { q: '¿Y cuánto cobras por esto?',
          steps: ['Di el precio', 'Di qué incluye', 'Da la razón', 'Mantén tu precio'],
          parts: ['Mi precio por esto es dos mil.', 'Eso incluye el trabajo y dos cambios.', 'Me toma unas tres semanas.', 'Creo que es un precio justo.'] }
  },

  'career|jobhunt': {
    who:   'Looking for a job',
    q:     'So, why should we hire you?',
    steps: ['Answer it directly', 'Give your reason', 'Give an example', 'Close it'],
    parts: ['I am a good fit for this position.',
            'I stay calm when things get busy.',
            'Last month I ran our busiest week.',
            'I know I can do the same here.'],
    es: { q: '¿Por qué deberíamos contratarte?',
          steps: ['Responde directo', 'Da tu razón', 'Da un ejemplo', 'Ciérralo'],
          parts: ['Encajo bien en este puesto.', 'Me mantengo tranquilo cuando hay mucho trabajo.', 'El mes pasado dirigí nuestra semana más ocupada.', 'Sé que puedo hacer lo mismo aquí.'] }
  },

  'career|careerbreak': {
    who:   'On a career break',
    q:     'What were you doing during the career break?',
    steps: ['Name it plainly', 'Say what you did', 'Show you kept going', 'Bring it back'],
    parts: ['I took two years off for my family.',
            'I kept doing small projects in that time.',
            'I also finished a short course.',
            'I am ready to work full time now.'],
    es: { q: '¿Qué hiciste durante tu pausa laboral?',
          steps: ['Dilo claramente', 'Di qué hiciste', 'Muestra que seguiste', 'Vuelve al presente'],
          parts: ['Tomé dos años libres por mi familia.', 'Seguí haciendo proyectos pequeños en ese tiempo.', 'También terminé un curso corto.', 'Ahora estoy listo para trabajar tiempo completo.'] }
  },

  /* someone at home full time is answering the same question, so they get the
     same task rather than a near-duplicate written twice */
  'career|athome': {
    who:   'At home full time',
    q:     'What were you doing during the career break?',
    steps: ['Name it plainly', 'Say what you did', 'Show you kept going', 'Bring it back'],
    parts: ['I took two years off for my family.',
            'I kept doing small projects in that time.',
            'I also finished a short course.',
            'I am ready to work full time now.'],
    es: { q: '¿Qué hiciste durante tu pausa laboral?',
          steps: ['Dilo claramente', 'Di qué hiciste', 'Muestra que seguiste', 'Vuelve al presente'],
          parts: ['Tomé dos años libres por mi familia.', 'Seguí haciendo proyectos pequeños en ese tiempo.', 'También terminé un curso corto.', 'Ahora estoy listo para trabajar tiempo completo.'] }
  },

  'career|student': {
    who:   'Student',
    q:     'You have no work experience. Why take you?',
    steps: ['Answer it directly', 'Give your reason', 'Give an example', 'Close it'],
    parts: ['I learn fast and I finish my work.',
            'I ran the events for our student group.',
            'We doubled the numbers in one year.',
            'I would bring the same energy here.'],
    es: { q: 'No tienes experiencia laboral. ¿Por qué tú?',
          steps: ['Responde directo', 'Da tu razón', 'Da un ejemplo', 'Ciérralo'],
          parts: ['Aprendo rápido y termino mi trabajo.', 'Organicé los eventos de nuestro grupo estudiantil.', 'Duplicamos los números en un año.', 'Traería la misma energía aquí.'] }
  },

  'career|other': {
    who:   'Something else',
    q:     'Tell me about yourself.',
    steps: ['Start with now', 'Say one strength', 'Give an example', 'Say what you want'],
    parts: ['Right now I work in customer support.',
            'I am good at staying calm with people.',
            'Last year I handled our busiest month.',
            'I want to do more of that.'],
    es: { q: 'Háblame de ti.',
          steps: ['Empieza con el ahora', 'Di una fortaleza', 'Da un ejemplo', 'Di qué quieres'],
          parts: ['Ahora trabajo en atención al cliente.', 'Se me da bien mantener la calma con la gente.', 'El año pasado manejé nuestro mes más ocupado.', 'Quiero hacer más de eso.'] }
  },

  /* ---------- EVERY OTHER GOAL ---------- one task each ------------------- */

  convo: {
    who:   'Improve social conversations',
    q:     'So what are you doing these days?',
    steps: ['Answer it', 'Add one detail', 'Say what is new', 'Ask them back'],
    parts: ['I am good. Still at the same job.',
            'I work with people every day.',
            'I started running in the mornings.',
            'What about you?'],
    es: { q: '¿Y qué haces estos días?',
          steps: ['Respóndelo', 'Añade un detalle', 'Di qué hay de nuevo', 'Pregunta tú también'],
          parts: ['Estoy bien. Sigo en el mismo trabajo.', 'Trabajo con gente todos los días.', 'Empecé a correr por las mañanas.', '¿Y tú?'] }
  },

  travel: {
    who:   'Travel',
    q:     'What is your dream travel destination?',
    steps: ['Name the place', 'Say why', 'Give one detail', 'Say when'],
    parts: ['My dream place is Japan.',
            'I want to see the old temples.',
            'I would also like to try the food.',
            'I hope to go there next year.'],
    es: { q: '¿Cuál es tu destino de viaje soñado?',
          steps: ['Di el lugar', 'Di por qué', 'Da un detalle', 'Di cuándo'],
          parts: ['Mi lugar soñado es Japón.', 'Quiero ver los templos antiguos.', 'También me gustaría probar la comida.', 'Espero ir el año que viene.'] }
  },

  school: {
    who:   'Excel at school',
    q:     'What is your favorite hobby?',
    steps: ['Name it', 'Say how often', 'Give one detail', 'Say why you like it'],
    parts: ['My favorite hobby is painting.',
            'I paint almost every weekend.',
            'I like to paint people and places.',
            'It helps me relax after school.'],
    es: { q: '¿Cuál es tu pasatiempo favorito?',
          steps: ['Dilo', 'Di con qué frecuencia', 'Da un detalle', 'Di por qué te gusta'],
          parts: ['Mi pasatiempo favorito es pintar.', 'Pinto casi todos los fines de semana.', 'Me gusta pintar personas y lugares.', 'Me ayuda a relajarme después de clase.'] }
  },

  ielts: {
    who:   'IELTS',
    q:     'Describe a place you enjoy visiting.',
    steps: ['Name it', 'Say where it is', 'Give one detail', 'Say why you like it'],
    parts: ['There is a small beach near my home.',
            'It is about thirty minutes away.',
            'It is quiet and you can hear the water.',
            'I always leave feeling calm.'],
    es: { q: 'Describe un lugar que te gusta visitar.',
          steps: ['Dilo', 'Di dónde está', 'Da un detalle', 'Di por qué te gusta'],
          parts: ['Hay una playa pequeña cerca de mi casa.', 'Está a unos treinta minutos.', 'Es tranquila y se oye el agua.', 'Siempre me voy sintiéndome en calma.'] }
  },

  other: {
    who:   'Any other goal',
    q:     'Tell me a little about yourself.',
    steps: ['Start with now', 'Say one strength', 'Give an example', 'Say what you want'],
    parts: ['Right now I work and study English.',
            'I am good at sticking with things.',
            'I have practiced every day this month.',
            'I want to use English without thinking.'],
    es: { q: 'Háblame un poco de ti.',
          steps: ['Empieza con el ahora', 'Di una fortaleza', 'Da un ejemplo', 'Di qué quieres'],
          parts: ['Ahora trabajo y estudio inglés.', 'Se me da bien ser constante.', 'He practicado todos los días este mes.', 'Quiero usar el inglés sin pensarlo.'] }
  }
};


const WORD = {
  finish:    { w:'finish',    parts:['fi','ni','sh'],    ph:'fi.nish',     tip:'Ends soft on ‘sh’',              start:48 },
  project:   { w:'project',   parts:['pro','jec','t'],   ph:'pro.jekt',    tip:'The ‘j’ is sharp',               start:52 },
  thousand:  { w:'thousand',  parts:['thou','san','d'],  ph:'thow.zund',   tip:'The middle sound is a soft ‘z’', start:51 },
  covers:    { w:'covers',    parts:['co','ver','s'],    ph:'kuh.vurz',    tip:'Ends on a ‘z’, not an s',        start:47 },
  position:  { w:'position',  parts:['po','si','tion'],  ph:'puh.zi.shun', tip:'The ‘tion’ sounds like shun',    start:50 },
  busiest:   { w:'busiest',   parts:['bu','si','est'],   ph:'bi.zee.est',  tip:'Three beats: bi.zee.est',        start:46 },
  family:    { w:'family',    parts:['fa','mi','ly'],    ph:'fam.uh.lee',  tip:'Three beats, not two',           start:49 },
  projects:  { w:'projects',  parts:['pro','jec','ts'],  ph:'pro.jekts',   tip:'Keep the ‘ts’ crisp',            start:52 },
  student:   { w:'student',   parts:['stu','den','t'],   ph:'stew.dnt',    tip:'Two beats: stew.dnt',            start:51 },
  energy:    { w:'energy',    parts:['e','ner','gy'],    ph:'en.ur.jee',   tip:'The ‘gy’ sounds like jee',       start:48 },
  customer:  { w:'customer',  parts:['cus','to','mer'],  ph:'kus.tuh.mur', tip:'Stress the first beat ‘kus’',    start:53 },
  mornings:  { w:'mornings',  parts:['mor','ning','s'],  ph:'mor.ningz',   tip:'Ends on a ‘z’ sound',            start:49 },
  Japan:     { w:'Japan',     parts:['Ja','pa','n'],     ph:'juh.pan',     tip:'Stress the second beat ‘pan’',   start:50 },
  temples:   { w:'temples',   parts:['tem','ple','s'],   ph:'tem.pulz',    tip:'Two beats: tem.pulz',            start:47 },
  favorite:  { w:'favorite',  parts:['fa','vo','rite'],  ph:'fay.vrit',    tip:'Two beats, not three',           start:46 },
  relax:     { w:'relax',     parts:['re','la','x'],     ph:'ri.laks',     tip:'Stress the second beat ‘laks’',  start:51 },
  thirty:    { w:'thirty',    parts:['thir','t','y'],    ph:'thur.tee',    tip:'Soft ‘th’, tongue out',          start:46 },
  minutes:   { w:'minutes',   parts:['mi','nu','tes'],   ph:'mi.nits',     tip:'Two beats only: mi.nits',        start:49 },
  practiced: { w:'practiced', parts:['prac','ti','ced'], ph:'prak.tist',   tip:'The ending is ‘st’, not ced',    start:50 },
  English:   { w:'English',   parts:['Eng','li','sh'],   ph:'ing.glish',   tip:'It starts with ‘ing’',           start:47 },
  people:    { w:'people',    parts:['peo','p','le'],    ph:'pee.pul',     tip:'Two beats: pee.pul',             start:49 },
  learning:  { w:'learning',  parts:['lear','n','ing'],  ph:'lur.ning',    tip:'The ‘ear’ sounds like ur',       start:48 },
  practice:  { w:'practice',  parts:['prac','ti','ce'],  ph:'prak.tis',    tip:'End short on ‘tis’',             start:52 },
  exam:      { w:'exam',      parts:['e','xa','m'],      ph:'ig.zam',      tip:'The ‘x’ sounds like gz',         start:50 },
  travel:    { w:'travel',    parts:['tra','ve','l'],    ph:'tra.vul',     tip:'Two beats: tra.vul',             start:51 }
};


const PRONWORDS = {
  'career|office':     [WORD.project,   WORD.finish],
  'career|ownboss':    [WORD.thousand,  WORD.covers],
  'career|jobhunt':    [WORD.position,  WORD.busiest],
  'career|careerbreak':[WORD.family,    WORD.projects],
  'career|athome':     [WORD.family,    WORD.projects],
  'career|student':    [WORD.student,   WORD.energy],
  'career|other':      [WORD.customer,  WORD.busiest],
  convo:               [WORD.people,    WORD.mornings],
  travel:              [WORD.Japan,     WORD.temples],
  school:              [WORD.favorite,  WORD.relax],
  ielts:               [WORD.thirty,    WORD.minutes],
  other:               [WORD.practiced, WORD.English]
};


/* goal, plus work mode when the goal is career — usa-onboarding's rule.
   Our goal names differ slightly: personal→convo, exam(ielts)→ielts. */
function practiceKey(goal, situation, exam){
  if (goal === 'career'){
    const k = 'career|' + (WORKMODE[situation] || 'other');
    return PRACTICE[k] ? k : 'career|other';
  }
  const g = { personal:'convo', exam: exam === 'ielts' ? 'ielts' : 'other' }[goal] || goal;
  return PRACTICE[g] ? g : 'other';
}


/* ============================================================
   BEGINNER READING — three escalating affirmations per branch
   (goal + first-picked family), per the approved content sheet.
   Identity first, simple words, each sentence longer and harder
   than the last. *Starred* words are emphasised on screen and are
   that sentence's pronunciation-drill pair on a slip.
   ============================================================ */
const AFFIRM3 = {
  'career|interview': [
    { t:'I am {name}, and I am *ready* for this *interview*.',
      w:[{w:'ready',pre:'rea',hot:'dy',post:'',ph:'reh.dee',tip:'Two quick beats: reh then dee',start:55},
         {w:'interview',pre:'in',hot:'ter',post:'view',ph:'in.tur.vyoo',tip:'Stress the first beat: in',start:50}] },
    { t:'I answer hard *questions* slowly, *clearly*, and without fear.',
      w:[{w:'questions',pre:'ques',hot:'tio',post:'ns',ph:'kwes.chunz',tip:'The tio says chun',start:49},
         {w:'clearly',pre:'cl',hot:'ear',post:'ly',ph:'kleer.lee',tip:'Two beats, the ear is eer',start:50}] },
    { t:'I am *prepared* for every interview, and I speak about my work with *confidence*.',
      w:[{w:'prepared',pre:'pre',hot:'pa',post:'red',ph:'prih.paird',tip:'Two beats, ends on aird',start:48},
         {w:'confidence',pre:'con',hot:'fi',post:'dence',ph:'kon.fi.dens',tip:'Stress the first beat: kon',start:50}] },
  ],
  'career|meetings': [
    { t:'I am {name}, and my *voice* counts at *work*.',
      w:[{w:'voice',pre:'v',hot:'oi',post:'ce',ph:'voys',tip:'One beat, oy glides into s',start:56},
         {w:'work',pre:'w',hot:'or',post:'k',ph:'wurk',tip:'The or says ur, not or',start:52}] },
    { t:'In every *meeting*, I say my *ideas* out loud.',
      w:[{w:'meeting',pre:'mee',hot:'ting',post:'',ph:'mee.ting',tip:'The t stays soft, ends on ng',start:51},
         {w:'ideas',pre:'i',hot:'de',post:'as',ph:'eye.dee.uhz',tip:'Three beats, starts on eye',start:49}] },
    { t:'I *disagree* politely when I must, and my team *respects* what I say.',
      w:[{w:'disagree',pre:'dis',hot:'a',post:'gree',ph:'dis.uh.gree',tip:'Stress the last beat: gree',start:47},
         {w:'respects',pre:'re',hot:'spec',post:'ts',ph:'rih.spekts',tip:'Keep the ts crisp at the end',start:48}] },
  ],
  'career|fastspeech': [
    { t:'I am {name}, and I *listen* with *care*.',
      w:[{w:'listen',pre:'li',hot:'st',post:'en',ph:'li.sun',tip:'The t is silent: li.sun',start:53},
         {w:'care',pre:'c',hot:'are',post:'',ph:'kair',tip:'One beat, ends open on air',start:55}] },
    { t:'When people speak fast, I stay *calm* and ask *again*.',
      w:[{w:'calm',pre:'c',hot:'al',post:'m',ph:'kahm',tip:'The l is silent: kahm',start:50},
         {w:'again',pre:'a',hot:'gai',post:'n',ph:'uh.gen',tip:'Two beats, the gai says gen',start:52}] },
    { t:'I *understand* more every day, and fast talkers no longer *frighten* me.',
      w:[{w:'understand',pre:'under',hot:'sta',post:'nd',ph:'un.dur.stand',tip:'Stress the last beat: stand',start:49},
         {w:'frighten',pre:'fri',hot:'ght',post:'en',ph:'fry.tun',tip:'The ght is just a t',start:46}] },
  ],
  'career|customer': [
    { t:'I am {name}, and I *help* people every *day*.',
      w:[{w:'help',pre:'he',hot:'l',post:'p',ph:'help',tip:'Keep the l before the p',start:56},
         {w:'day',pre:'d',hot:'ay',post:'',ph:'day',tip:'One clean beat',start:58}] },
    { t:'I hear every *customer* out, and I answer with *patience*.',
      w:[{w:'customer',pre:'cus',hot:'to',post:'mer',ph:'kus.tuh.mur',tip:'Stress the first beat: kus',start:53},
         {w:'patience',pre:'pa',hot:'tien',post:'ce',ph:'pay.shuns',tip:'The tien says shun',start:48}] },
    { t:'I can handle a *difficult* customer, and I turn problems into *solutions*.',
      w:[{w:'difficult',pre:'di',hot:'ffi',post:'cult',ph:'di.fi.kult',tip:'Stress the first beat: di',start:50},
         {w:'solutions',pre:'so',hot:'lu',post:'tions',ph:'suh.loo.shunz',tip:'Stress the middle: loo',start:47}] },
  ],
  'career|pitch': [
    { t:'I am {name}, and my *work* has real *value*.',
      w:[{w:'work',pre:'w',hot:'or',post:'k',ph:'wurk',tip:'The or says ur, not or',start:52},
         {w:'value',pre:'val',hot:'ue',post:'',ph:'val.yoo',tip:'Two beats, ends on yoo',start:51}] },
    { t:'I name my *price* out loud, and I do not *shrink*.',
      w:[{w:'price',pre:'pr',hot:'i',post:'ce',ph:'prys',tip:'One beat, ends on a soft s',start:54},
         {w:'shrink',pre:'shr',hot:'in',post:'k',ph:'shrink',tip:'Start with shr, one beat',start:47}] },
    { t:'I *defend* my price with a steady voice, because my work *deserves* it.',
      w:[{w:'defend',pre:'de',hot:'fen',post:'d',ph:'dih.fend',tip:'Stress the second beat: fend',start:49},
         {w:'deserves',pre:'de',hot:'ser',post:'ves',ph:'dih.zurvz',tip:'The s is a z, twice',start:46}] },
  ],
  'career|smalltalk': [
    { t:'I am {name}, and I am easy to *talk* to.',
      w:[{w:'talk',pre:'t',hot:'al',post:'k',ph:'tawk',tip:'The l is silent: tawk',start:54},
         {w:'easy',pre:'ea',hot:'sy',post:'',ph:'ee.zee',tip:'The s is a z: ee.zee',start:55}] },
    { t:'I start small *conversations*, and I *enjoy* them.',
      w:[{w:'conversations',pre:'conver',hot:'sa',post:'tions',ph:'kon.vur.say.shunz',tip:'Four beats, stress on say',start:47},
         {w:'enjoy',pre:'en',hot:'joy',post:'',ph:'in.joy',tip:'Starts on in, not en',start:55}] },
    { t:'I walk up to new *colleagues* first, and small talk feels *natural* to me.',
      w:[{w:'colleagues',pre:'co',hot:'llea',post:'gues',ph:'ko.leegz',tip:'Two beats, ends on eegz',start:46},
         {w:'natural',pre:'na',hot:'tu',post:'ral',ph:'na.chruhl',tip:'The tu says chruh',start:48}] },
  ],
  'personal|smalltalk': [
    { t:'I am {name}, and I like *meeting* people.',
      w:[{w:'meeting',pre:'mee',hot:'ting',post:'',ph:'mee.ting',tip:'The t stays soft, ends on ng',start:51},
         {w:'people',pre:'peo',hot:'p',post:'le',ph:'pee.pul',tip:'Two beats: pee.pul',start:49}] },
    { t:'I can start a *conversation* with someone *new*.',
      w:[{w:'conversation',pre:'conver',hot:'sa',post:'tion',ph:'kon.vur.say.shun',tip:'Four beats, stress on say',start:47},
         {w:'new',pre:'n',hot:'ew',post:'',ph:'noo',tip:'One clean beat: noo',start:57}] },
    { t:'I keep a conversation going with *anyone*, and silence does not *scare* me.',
      w:[{w:'anyone',pre:'a',hot:'ny',post:'one',ph:'en.ee.wun',tip:'Three beats, starts on en',start:50},
         {w:'scare',pre:'sc',hot:'are',post:'',ph:'skair',tip:'One beat, ends open on air',start:52}] },
  ],
  'personal|services': [
    { t:'I am {name}, and I handle my own *life* in *English*.',
      w:[{w:'life',pre:'l',hot:'i',post:'fe',ph:'lyf',tip:'One beat, long i',start:56},
         {w:'English',pre:'Eng',hot:'li',post:'sh',ph:'ing.glish',tip:'It starts with ing',start:47}] },
    { t:'I book my own *appointments*, and I ask my own *questions*.',
      w:[{w:'appointments',pre:'a',hot:'ppoint',post:'ments',ph:'uh.poynt.munts',tip:'Stress the middle: poynt',start:46},
         {w:'questions',pre:'ques',hot:'tio',post:'ns',ph:'kwes.chunz',tip:'The tio says chun',start:49}] },
    { t:'I walk into any office, explain my *problem*, and get it *solved* in English.',
      w:[{w:'problem',pre:'pro',hot:'ble',post:'m',ph:'prob.lum',tip:'Two beats: prob.lum',start:51},
         {w:'solved',pre:'sol',hot:'ve',post:'d',ph:'solvd',tip:'One beat, keep the vd',start:48}] },
  ],
  'personal|family': [
    { t:'I am {name}, and my family is *proud* of me.',
      w:[{w:'proud',pre:'pr',hot:'ou',post:'d',ph:'prowd',tip:'The ou says ow',start:55},
         {w:'family',pre:'fa',hot:'mi',post:'ly',ph:'fam.uh.lee',tip:'Three beats, not two',start:49}] },
    { t:'I speak English at home, and my kids *hear* me *try*.',
      w:[{w:'hear',pre:'h',hot:'ear',post:'',ph:'heer',tip:'One beat: heer',start:56},
         {w:'try',pre:'tr',hot:'y',post:'',ph:'try',tip:'One beat, long i',start:57}] },
    { t:'I sit with my partner\u2019s family and join the conversation with *warmth* and *confidence*.',
      w:[{w:'warmth',pre:'war',hot:'m',post:'th',ph:'wormth',tip:'End on a soft th',start:45},
         {w:'confidence',pre:'con',hot:'fi',post:'dence',ph:'kon.fi.dens',tip:'Stress the first beat: kon',start:50}] },
  ],
  'school|exam': [
    { t:'I am {name}, and I am *ready* for my *exam*.',
      w:[{w:'ready',pre:'rea',hot:'dy',post:'',ph:'reh.dee',tip:'Two quick beats: reh then dee',start:55},
         {w:'exam',pre:'e',hot:'xam',post:'',ph:'ig.zam',tip:'Stress the second beat: zam',start:50}] },
    { t:'I answer exam *questions* with a clear, steady *voice*.',
      w:[{w:'questions',pre:'ques',hot:'tio',post:'ns',ph:'kwes.chunz',tip:'The tio says chun',start:49},
         {w:'voice',pre:'v',hot:'oi',post:'ce',ph:'voys',tip:'One beat, oy glides into s',start:56}] },
    { t:'On exam day I will speak for two *minutes* without *stopping*, and I will pass.',
      w:[{w:'minutes',pre:'mi',hot:'nu',post:'tes',ph:'mi.nits',tip:'Two beats only: mi.nits',start:49},
         {w:'stopping',pre:'sto',hot:'pp',post:'ing',ph:'stop.ing',tip:'Two beats, ends on ng',start:52}] },
  ],
  'school|fastspeech': [
    { t:'I am {name}, and I *follow* my *classes*.',
      w:[{w:'follow',pre:'fo',hot:'llo',post:'w',ph:'fo.loh',tip:'Two beats, ends on oh',start:53},
         {w:'classes',pre:'cla',hot:'ss',post:'es',ph:'klas.iz',tip:'Two beats: klas.iz',start:51}] },
    { t:'Fast *lectures* do not lose me *anymore*.',
      w:[{w:'lectures',pre:'lec',hot:'tu',post:'res',ph:'lek.churz',tip:'The tu says chur',start:47},
         {w:'anymore',pre:'any',hot:'mo',post:'re',ph:'en.ee.mor',tip:'Three beats, ends on mor',start:50}] },
    { t:'I take notes while the teacher speaks *quickly*, and I keep up with *everything*.',
      w:[{w:'quickly',pre:'qui',hot:'ck',post:'ly',ph:'kwik.lee',tip:'Two beats: kwik.lee',start:51},
         {w:'everything',pre:'eve',hot:'ry',post:'thing',ph:'ev.ree.thing',tip:'Three beats, soft th at the end',start:48}] },
  ],
  'school|meetings': [
    { t:'I am {name}, and I *speak* up in *class*.',
      w:[{w:'speak',pre:'sp',hot:'ea',post:'k',ph:'speek',tip:'The ea is a long ee',start:54},
         {w:'class',pre:'cl',hot:'a',post:'ss',ph:'klas',tip:'Two sounds at the front: k then l',start:53}] },
    { t:'I raise my hand and share my *answer* with the *class*.',
      w:[{w:'answer',pre:'an',hot:'sw',post:'er',ph:'an.sur',tip:'The w is silent: an.sur',start:50},
         {w:'class',pre:'cl',hot:'a',post:'ss',ph:'klas',tip:'Two sounds at the front: k then l',start:53}] },
    { t:'I present my *project* to the whole class, and my voice stays *steady*.',
      w:[{w:'project',pre:'pro',hot:'jec',post:'t',ph:'pro.jekt',tip:'The j is sharp',start:52},
         {w:'steady',pre:'stea',hot:'dy',post:'',ph:'steh.dee',tip:'Two beats: steh.dee',start:51}] },
  ],
  'school|smalltalk': [
    { t:'I am {name}, and I make *friends* at *school*.',
      w:[{w:'friends',pre:'frien',hot:'d',post:'s',ph:'frendz',tip:'One beat, ends on dz',start:52},
         {w:'school',pre:'sch',hot:'oo',post:'l',ph:'skool',tip:'The sch is just sk',start:54}] },
    { t:'I talk to my *classmates* in English every *day*.',
      w:[{w:'classmates',pre:'class',hot:'ma',post:'tes',ph:'klas.mayts',tip:'Two beats, ends on ayts',start:49},
         {w:'day',pre:'d',hot:'ay',post:'',ph:'day',tip:'One clean beat',start:58}] },
    { t:'I am the one who says hello *first*, and people *remember* me.',
      w:[{w:'first',pre:'f',hot:'ir',post:'st',ph:'furst',tip:'The ir says ur',start:53},
         {w:'remember',pre:'re',hot:'mem',post:'ber',ph:'rih.mem.bur',tip:'Stress the middle: mem',start:48}] },
  ],
  'travel|services': [
    { t:'I am {name}, and I *travel* with *confidence*.',
      w:[{w:'travel',pre:'tra',hot:'ve',post:'l',ph:'tra.vul',tip:'Two beats: tra.vul',start:52},
         {w:'confidence',pre:'con',hot:'fi',post:'dence',ph:'kon.fi.dens',tip:'Stress the first beat: kon',start:50}] },
    { t:'I check in, order food, and ask for *directions* in *English*.',
      w:[{w:'directions',pre:'di',hot:'rec',post:'tions',ph:'duh.rek.shunz',tip:'Stress the middle: rek',start:47},
         {w:'English',pre:'Eng',hot:'li',post:'sh',ph:'ing.glish',tip:'It starts with ing',start:47}] },
    { t:'When a booking goes *wrong*, I sort it out myself, *calmly*.',
      w:[{w:'wrong',pre:'wr',hot:'o',post:'ng',ph:'rong',tip:'The w is silent: rong',start:51},
         {w:'calmly',pre:'cal',hot:'m',post:'ly',ph:'kahm.lee',tip:'The l in cal is silent',start:46}] },
  ],
  'travel|smalltalk': [
    { t:'I am {name}, and I meet people *everywhere* I *go*.',
      w:[{w:'everywhere',pre:'every',hot:'whe',post:'re',ph:'ev.ree.wair',tip:'Three beats, ends on air',start:48},
         {w:'go',pre:'g',hot:'o',post:'',ph:'goh',tip:'One clean beat',start:58}] },
    { t:'On every trip, I make one new *friend* in *English*.',
      w:[{w:'friend',pre:'frien',hot:'d',post:'',ph:'frend',tip:'One beat: frend',start:53},
         {w:'English',pre:'Eng',hot:'li',post:'sh',ph:'ing.glish',tip:'It starts with ing',start:47}] },
    { t:'I share stories with *strangers* on the road, and English opens *doors* for me.',
      w:[{w:'strangers',pre:'stran',hot:'ger',post:'s',ph:'strayn.jurz',tip:'The g is a j',start:46},
         {w:'doors',pre:'d',hot:'oor',post:'s',ph:'dorz',tip:'One beat, ends on z',start:54}] },
  ],
  exam: [
    { t:'I am {name}, and I am *ready* for my {EXAM} *exam*.',
      w:[{w:'ready',pre:'rea',hot:'dy',post:'',ph:'reh.dee',tip:'Two quick beats: reh then dee',start:55},
         {w:'exam',pre:'e',hot:'xam',post:'',ph:'ig.zam',tip:'Stress the second beat: zam',start:50}] },
    { t:'For my {EXAM}, I speak in full *sentences*, with a calm, clear *voice*.',
      w:[{w:'sentences',pre:'sen',hot:'ten',post:'ces',ph:'sen.tun.siz',tip:'Stress the first beat: sen',start:48},
         {w:'voice',pre:'v',hot:'oi',post:'ce',ph:'voys',tip:'One beat, oy glides into s',start:56}] },
    { t:'On test day I will speak for two *minutes* without stopping, with real *confidence*.',
      w:[{w:'minutes',pre:'mi',hot:'nu',post:'tes',ph:'mi.nits',tip:'Two beats only: mi.nits',start:49},
         {w:'confidence',pre:'con',hot:'fi',post:'dence',ph:'kon.fi.dens',tip:'Stress the first beat: kon',start:50}] },
  ],
};

/* which affirmation set a beginner reads: goal + first-picked family,
   with per-goal fallbacks for families that have no set of their own */
function affirmKey(goal, fam, exam){
  if (goal === 'exam') return 'exam';
  const k = `${goal}|${fam}`;
  if (AFFIRM3[k]) return k;
  return { career:'career|interview', personal:'personal|smalltalk',
           school:'school|smalltalk', travel:'travel|services' }[goal] || 'personal|smalltalk';
}

/* Sarah on the beginner run — instruction, celebration, slip. The
   <b> words are the ones she leans on. */
const BG_LINES = {
  inst: ['Read this <b>out loud</b>. Take your time.',
         'One more. A <b>little longer</b> this time.',
         'Last one. It is <b>harder</b>. I hope you are <b>ready</b>.'],
  cheer:['You said it. That was <b>real English</b>, {name}.',
         'That was <b>not beginner</b> English. That was <b>good</b>.',
         '<b>Three for three</b>. You are <b>past beginner</b> now.'],
  done: ['1 of 3 done', '2 of 3 done', 'That is all three'],
  slip: 'Two words slipped. Let us <b>fix them together</b>.',
  slipTip: "Let's practice them",
  slip3: 'So close. I added two small words to <b>your practice</b>.',
};

window.CONTENT = {
  LANGUAGES, APPLANG_DESC, GOALS, EXAMS, IELTS_TYPES, examDateOptions,
  bandNote, GOAL_FX, PROOF, OUTCOME, TESTIMONIALS, AWARD, PLAN, PLAN_BUILD, SCENARIOS, scenarioSet, WORKMODE, MODE_LABEL, branches,
  SITUATIONS, SIT_FX, ACTIVATION, PW_TITLE,
  PRACTICE, WORD, PRONWORDS, PRACTICE_ASK, practiceKey,
  AFFIRM3, affirmKey, BG_LINES,
  PRICING, COHORTS,
};
