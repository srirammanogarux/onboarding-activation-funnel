/* ============================================================
   Stimuler · onboarding content — proof & testimonials
   Stats, outcome claims, per-goal testimonial cast, the award credential.
   Classic script: top-level consts are shared with the files
   that load after this one; content/index.js assembles the
   window.CONTENT export.
   ============================================================ */

'use strict';

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


const AWARD = { kicker:"GOOGLE PLAY'S", title:'Best AI App of 2023',
                line:'4.9\u2605  \u00b7  12Mn+ learners  \u00b7  190+ countries' };
