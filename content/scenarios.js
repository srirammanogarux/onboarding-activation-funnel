/* ============================================================
   Stimuler · onboarding content — scenarios & branching
   Work modes, per-goal JTBD lists, the practice-ask nouns, cohort list for the review panel.
   Classic script: top-level consts are shared with the files
   that load after this one; content/index.js assembles the
   window.CONTENT export.
   ============================================================ */

'use strict';

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
