/* ============================================================
   Stimuler · onboarding content — speaking practice
   Beginner affirmation ladders, the 12 practice cohorts, drill words, Sarah voice lines.
   Classic script: top-level consts are shared with the files
   that load after this one; content/index.js assembles the
   window.CONTENT export.
   ============================================================ */

'use strict';

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
