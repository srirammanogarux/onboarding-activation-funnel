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
  'Working a job':           'office',
  'Studying':                'student',
  'Freelancing':             'ownboss',
  'Running my own business': 'ownboss',
  'Looking for work':        'jobhunt',
  'At home with family':     'athome',
  'On a career break':       'careerbreak',
};

const SCENARIOS = {
  /* No set for exam — deliberately. The format is fixed and by this point
     they have given us the exam, the type, the date and the target band.
     usa-onboarding does carry three IELTS JTBDs if you want them back. */
  exam: null,

  career: {
    byMode: {
      office: {
        prompt: 'At work, which of these do you want to get right?',
        items: [
          { label: 'Ask my manager for time off',   who: 'your manager' },
          { label: 'Disagree in a meeting',         who: 'the team' },
          { label: 'Give my weekly update',         who: 'the team' },
          { label: 'Ask someone to repeat, politely', who: 'a fast-talking colleague' },
          { label: 'Join the conversation at lunch', who: 'a colleague' },
          { label: 'Make my case in an appraisal',  who: 'your manager' },
        ],
      },
      ownboss: {
        prompt: 'With clients, which of these do you want to get right?',
        items: [
          { label: 'Win a new client',              who: 'a prospective client' },
          { label: 'Explain and defend my price',   who: 'the client' },
          { label: 'Run a first discovery call',    who: 'a prospective client' },
          { label: 'Chase a late payment',          who: 'the client' },
          { label: 'Push back when scope grows',    who: 'the client' },
          { label: 'Calm an unhappy customer',      who: 'the customer' },
        ],
      },
      jobhunt: {
        prompt: 'In your search, which of these do you want to get right?',
        items: [
          { label: 'Ace a job interview',           who: 'the interviewer' },
          { label: 'Get through a phone screen',    who: 'the recruiter' },
          { label: 'Explain a gap in my CV',        who: 'the interviewer' },
          { label: 'Negotiate the offer',           who: 'the recruiter' },
          { label: 'Ask a contact for a referral',  who: 'a contact' },
          { label: 'Follow up without nagging',     who: 'the recruiter' },
        ],
      },
      student: {
        prompt: 'Starting out, which of these do you want to get right?',
        items: [
          { label: 'Land an internship',            who: 'the interviewer' },
          { label: 'Talk about my final project',   who: 'the interviewer' },
          { label: 'Approach a recruiter at a fair', who: 'a recruiter' },
          { label: 'Ask a professor about openings', who: 'your professor' },
          { label: 'Speak up in a group assessment', who: 'the panel' },
          { label: 'Introduce myself on day one',   who: 'a new colleague' },
        ],
      },
      athome: {
        prompt: 'Going back to work, which of these do you want to get right?',
        items: [
          { label: 'Interview again after years away',    who: 'the interviewer' },
          { label: 'Turn home years into strengths', who: 'the interviewer' },
          { label: 'Explain why I stopped working', who: 'the interviewer' },
          { label: 'Speak up in a meeting again',   who: 'the team' },
          { label: 'Ask for flexible hours',        who: 'your manager' },
          { label: 'Break the ice at a new job',    who: 'a new colleague' },
        ],
      },
      careerbreak: {
        prompt: 'Getting back into it, which of these do you want to get right?',
        items: [
          { label: 'Explain a gap in my CV',        who: 'the interviewer' },
          { label: 'Ace a job interview',           who: 'the interviewer' },
          { label: 'Speak up in a meeting again',   who: 'the team' },
          { label: 'Handle work small talk again',  who: 'a colleague' },
          { label: 'Reach out to an old colleague', who: 'a former colleague' },
          { label: 'Negotiate the offer',           who: 'the recruiter' },
        ],
      },
    },
  },

  personal: {
    byMode: {
      /* Working, freelancing, running a business and job-hunting share one
         list. An adult's social life does not change because you invoice
         instead of drawing a salary. Only the three below genuinely differ. */
      _default: {
        prompt: 'In daily life, which of these do you want to get right?',
        items: [
          { label: 'Break the ice with a stranger', who: 'someone you just met' },
          { label: 'Catch up after a long time',    who: 'your friend' },
          { label: 'Keep a party conversation going', who: 'another guest' },
          { label: 'Handle the in-law questions',   who: 'your partner’s mother' },
          { label: 'Ask a neighbour for a favour',  who: 'your neighbour' },
          { label: 'Say no without sounding rude',  who: 'your friend' },
        ],
      },
      student: {
        prompt: 'Day to day, which of these do you want to get right?',
        items: [
          { label: 'Introduce myself to a classmate', who: 'a classmate' },
          { label: 'Join a conversation midway',    who: 'a group of classmates' },
          { label: 'Sort things out with my flatmate', who: 'your flatmate' },
          { label: 'Keep a party conversation going', who: 'another student' },
          { label: 'Ask a friend for a favour',     who: 'your friend' },
          { label: 'Say no without sounding rude',  who: 'your friend' },
        ],
      },
      athome: {
        prompt: 'Day to day, which of these do you want to get right?',
        items: [
          { label: 'Raise a concern with the teacher', who: 'your child’s teacher' },
          { label: 'Break the ice at the school gate', who: 'another parent' },
          { label: 'Chat at a children’s party',    who: 'another parent' },
          { label: 'Ask a neighbour for a favour',  who: 'your neighbour' },
          { label: 'Handle the in-law questions',   who: 'your partner’s mother' },
          { label: 'Catch up after a long time',    who: 'your friend' },
        ],
      },
      careerbreak: {
        prompt: 'Getting back into it, which of these do you want to get right?',
        items: [
          { label: 'Get back into everyday chat',   who: 'a friend you haven’t seen' },
          { label: 'Reach out after losing touch',  who: 'an old friend' },
          { label: 'Work a room at an event',       who: 'a former colleague' },
          { label: 'Explain what I’ve been doing',  who: 'an old friend' },
          { label: 'Break the ice with a stranger', who: 'someone you just met' },
          { label: 'Ask a neighbour for a favour',  who: 'your neighbour' },
        ],
      },
    },
  },

  /* No mode refinement below — the counterpart does not change with your job. */
  school: {
    prompt: 'On campus, which of these do you want to get right?',
    items: [
      { label: 'Answer a question in class',    who: 'your teacher' },
      { label: 'Present my project to the class', who: 'the class' },
      { label: 'Argue my point in a discussion', who: 'your classmates' },
      { label: 'Ask a professor to explain again', who: 'your professor' },
      { label: 'Hold my ground in a debate',    who: 'the examiner' },
      { label: 'Introduce myself to a classmate', who: 'a classmate' },
    ],
  },
  travel: {
    prompt: 'On the road, which of these do you want to get right?',
    items: [
      { label: 'Check in at the airport',       who: 'the check-in agent' },
      { label: 'Check into a hotel',            who: 'the receptionist' },
      { label: 'Order a meal I actually want',  who: 'the waiter' },
      { label: 'Ask a stranger for directions', who: 'a stranger' },
      { label: 'Bargain at a market',           who: 'the seller' },
      { label: 'Sort out a booking gone wrong', who: 'the desk agent' },
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

/* ---------- 6 · activation ladder, keyed to GOAL ----------
   Three rungs of AFFIRMATION phrases (user direction 2026-08-28):
   the first things a learner says out loud are self-affirming.

   R1 — simple phrase.  R2 — same spirit, more complex words.
   R3 — ECHO of R2: Sarah "says it" first (mock audio), then the user
   repeats it with the two complex words hidden (cloze).

   Honesty rule: the pron-practice pair always comes from the rung the
   user actually stumbled on. A passed rung never shows errors.
   Each word: pre<hot>post render for the pron card. */
const ACTIVATION = {
  exam: {
    intro: "Time to hear you. Say this like you mean it — the examiner listens for exactly this energy.",
    ladder: [
      { text: 'I am ready to do well in this exam.',
        words: [
          { w:'ready', pre:'rea', hot:'dy', post:'', ph:'reh.dee', tip:"Two quick beats: ‘reh’ then ‘dee’", start:55 },
          { w:'exam',  pre:'e',   hot:'xam', post:'', ph:'ig.zam', tip:"Stress the second beat: ‘zam’",    start:50 },
        ] },
      { text: 'I express my opinions with clarity and confidence.',
        words: [
          { w:'opinions', pre:'o',   hot:'pin', post:'ions', ph:'uh.pin.yunz', tip:"Stress the middle sound ‘pin’", start:51 },
          { w:'clarity',  pre:'cla', hot:'ri',  post:'ty',   ph:'kla.ri.tee',  tip:"Three even beats, start on ‘kla’", start:49 },
        ] },
    ],
  },
  career: {
    intro: "Time to hear you. Say this like you'd say it at work — clear and unhurried.",
    ladder: [
      { text: 'My voice matters at work.',
        words: [
          { w:'voice',   pre:'v',  hot:'oi', post:'ce',  ph:'voys',    tip:"One beat — ‘oy’ glides into ‘s’", start:56 },
          { w:'matters', pre:'ma', hot:'tt', post:'ers', ph:'ma.turz', tip:"The ‘tt’ stays soft, like ‘madders’", start:52 },
        ] },
      { text: 'I speak with confidence in every conversation.',
        words: [
          { w:'confidence',   pre:'con',    hot:'fi', post:'dence', ph:'kon.fi.dens',      tip:"Stress the first beat: ‘kon’", start:50 },
          { w:'conversation', pre:'conver', hot:'sa', post:'tion',  ph:'kon.vur.say.shun', tip:"Four beats, stress on ‘say’",  start:47 },
        ] },
    ],
  },
  personal: {
    intro: "Time to hear you. Say this like you'd say it to a friend — relaxed, no rush.",
    ladder: [
      { text: 'I enjoy speaking English every day.',
        words: [
          { w:'enjoy', pre:'en', hot:'joy', post:'', ph:'in.joy', tip:"Starts on ‘in’, not ‘en’", start:55 },
          { w:'every', pre:'e',  hot:'ve',  post:'ry', ph:'ev.ree', tip:"Two beats, not three: ‘ev.ree’", start:53 },
        ] },
      { text: 'I express myself naturally, without hesitation.',
        words: [
          { w:'naturally',  pre:'na',   hot:'tu', post:'rally', ph:'na.chruh.lee',   tip:"The ‘tu’ says ‘chruh’", start:48 },
          { w:'hesitation', pre:'hesi', hot:'ta', post:'tion',  ph:'heh.zi.tay.shun', tip:"The ‘s’ is a soft ‘z’", start:49 },
        ] },
    ],
  },
  school: {
    intro: "Time to hear you. Say this like you'd say it in class — steady and proud.",
    ladder: [
      { text: 'I am proud to share my ideas in class.',
        words: [
          { w:'proud', pre:'pr', hot:'ou', post:'d',  ph:'prowd',       tip:"The ‘ou’ says ‘ow’",          start:55 },
          { w:'ideas', pre:'i',  hot:'de', post:'as', ph:'eye.dee.uhz', tip:"Three beats, starts on ‘eye’", start:51 },
        ] },
      { text: 'I answer difficult questions with confidence.',
        words: [
          { w:'difficult', pre:'di',   hot:'ffi', post:'cult', ph:'di.fi.kult',  tip:"Stress the first beat: ‘di’", start:50 },
          { w:'questions', pre:'ques', hot:'tio', post:'ns',   ph:'kwes.chunz', tip:"The ‘tio’ says ‘chun’",       start:49 },
        ] },
    ],
  },
  travel: {
    intro: "Time to hear you. Say this like you're already on the trip — easy and sure.",
    ladder: [
      { text: 'I am comfortable asking for help.',
        words: [
          { w:'comfortable', pre:'com', hot:'for', post:'table', ph:'kumf.tur.bul', tip:"Three beats, not four: ‘kumf.tur.bul’", start:46 },
          { w:'asking',      pre:'a',   hot:'ski', post:'ng',    ph:'ah.sking',     tip:"Open with a long ‘ah’",                 start:54 },
        ] },
      { text: 'I handle unexpected situations with ease.',
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
  global: { n: 8000000, label: 'learners practice with Sarah', stars: '4.9' },
  byGoal: {
    exam:     { n: 214000, line: 'passed their English exam with us last year' },
    career:   { n: 380000, line: 'use Stimuler to get ahead at work' },
    personal: { n: 520000, line: 'found their everyday confidence here' },
    school:   { n: 260000, line: 'students speak up in class thanks to Sarah' },
    travel:   { n: 190000, line: 'travellers ordered, bargained and got home fine' },
  },
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

window.CONTENT = {
  LANGUAGES, APPLANG_DESC, GOALS, EXAMS, IELTS_TYPES, examDateOptions,
  bandNote, GOAL_FX, PROOF, PLAN_BUILD, SCENARIOS, scenarioSet, WORKMODE, MODE_LABEL, branches,
  SITUATIONS, ACTIVATION, PW_TITLE,
  PRICING, COHORTS,
};
