/* ============================================================
   Stimuler · India Onboarding — faithful baseline of the
   current chat onboarding (Figma "Stimuler V3" 6340:28505).
   Vanilla JS chat state machine. All voice/mic behaviour mocked.
   ============================================================ */

'use strict';

const $ = (id) => document.getElementById(id);

const chatScroll   = $('chatScroll');
const chatStream   = $('chatStream');
const progressFill = $('progressFill');
const progressLabel= $('progressLabel');
const topbar       = $('topbar');
const bottomBar    = $('bottomBar');
const skipBtn      = $('skipBtn');
const muteBtn      = $('muteBtn');
const micArea      = $('micArea');
const convMic      = $('convMic');

const SARAH = 'assets/sarah-avatar.png';

/* ---------- fit device mockup to viewport ---------- */
function fitPhone(){
  const mockup = $('mockup');
  const pad = 56;                    // breathing room around the device
  const panel = innerWidth > 1080 ? 260 : 0;  // review side panel
  const w = 430 + 28, h = 932 + 28;  // device body incl. bezel
  const s = Math.min(1, (innerWidth - pad - panel) / w, (innerHeight - pad) / h);
  mockup.style.transform = innerWidth <= 480 ? 'none' : `scale(${s})`;
}
addEventListener('resize', fitPhone); fitPhone();

/* ---------- flow-review deep links (?step=&lang=&lvl=) ---------- */
const C   = window.CONTENT;
const QP  = new URLSearchParams(location.search);

/* a cohort chip sets goal + exam together */
const COHORT = C.COHORTS.find(c => c.id === (QP.get('cohort') || '').toUpperCase());

const DBG = {
  step:   QP.get('step') || 'intro',
  lang:   QP.get('lang') || 'en',
  lvl:    QP.get('lvl')  || 'beginner',
  goal:   QP.get('goal') || (COHORT ? COHORT.goal : 'career'),
  exam:   QP.get('exam') || (COHORT ? COHORT.exam : 'ielts'),
  sit:    QP.get('sit')  || (COHORT && COHORT.sit ? COHORT.sit : 'Working a job'),
  cohort: COHORT ? COHORT.id : '',
};
let FF = DBG.step !== 'intro';   // fast-forward until the target step
function reach(key){ if (DBG.step === key) FF = false; }

const DP_STEPS = [
  ['intro', 'Intro'], ['language', 'Native language'], ['applang', 'App language'],
  ['name', 'Name'], ['phone', 'Phone'], ['source', 'Heard from'],
  ['age', 'Age'], ['gender', 'Gender'], ['goal', 'Goal'],
  ['exam', 'Which exam'], ['examtype', 'Academic/General'], ['examdate', 'Exam date'], ['band', 'Target band'],
  ['situation', 'Situation'], ['scenarios', 'Scenarios'],
  ['testimonials', 'Testimonials'], ['level', 'Level'], ['reading', 'Reading test'],
  ['award', 'Award'], ['meter', 'Speech meter'], ['fix', 'Fix pronunciation'],
  ['practice', 'Practice'], ['paywall', 'Graph → Paywall'], ['gift', 'Gift'], ['offer', 'Offer paywall'],
];
const DP_LANGS = [['en','English'], ...C.LANGUAGES.map(l => [l.value, l.label])];
const DP_LVLS  = [['beginner','Beginner'],['intermediate','Intermediate'],['advanced','Advanced']];

function buildDevPanel(){
  const go = (patch) => {
    const p = new URLSearchParams(location.search);
    Object.entries(patch).forEach(([k, v]) => p.set(k, v));
    location.search = p.toString();
  };
  const fill = (elId, pairs, param) => {
    const box = $(elId);
    if (!box) return;
    pairs.forEach(([val, label]) => {
      const b = document.createElement('button');
      b.textContent = label;
      if (DBG[param] === val) b.classList.add('active');
      b.addEventListener('click', () => go({ [param]: val }));
      box.appendChild(b);
    });
  };
  /* branch chips — one per distinct scenario list, straight to it */
  const bBox = $('dpBranches');
  if (bBox) C.branches().forEach(br => {
    const b = document.createElement('button');
    b.innerHTML = `${br.label}${br.skipped ? '' : `<i>${br.count}</i>`}`;
    if (br.skipped) b.classList.add('skipped');
    if (DBG.goal === br.goal && (br.mode === '—' || C.WORKMODE[DBG.sit] === br.mode
        || (br.mode === '_default' && !Object.keys((C.SCENARIOS[br.goal]||{}).byMode || {}).includes(C.WORKMODE[DBG.sit]))))
      b.classList.add('active');
    b.addEventListener('click', () => {
      const p = new URLSearchParams(location.search);
      p.set('goal', br.goal); p.set('sit', br.sit);
      p.set('step', br.skipped ? 'situation' : 'scenarios');
      p.delete('cohort');
      location.search = p.toString();
    });
    bBox.appendChild(b);
  });

  /* cohort chips clear goal+exam so the cohort wins */
  const cBox = $('dpCohorts');
  if (cBox) C.COHORTS.forEach(c => {
    const b = document.createElement('button');
    b.innerHTML = `<i>${c.id}</i>${c.label}`;
    if (DBG.cohort === c.id) b.classList.add('active');
    b.addEventListener('click', () => {
      const p = new URLSearchParams(location.search);
      p.set('cohort', c.id); p.delete('goal'); p.delete('exam');
      location.search = p.toString();
    });
    cBox.appendChild(b);
  });
  fill('dpSits', C.SITUATIONS.map(s => [s, s]), 'sit');
  fill('dpSteps', DP_STEPS, 'step');
  fill('dpLangs', DP_LANGS, 'lang');
  fill('dpLvls',  DP_LVLS,  'lvl');
}
buildDevPanel();

/* ---------- tiny helpers ---------- */
const wait = (ms) => new Promise(r => setTimeout(r, (FF || rushing) ? 0 : ms));

/* Skip fast-forwards Sarah's talking to the next question.
   It never answers a question — while an input/option set is waiting the
   button is disabled, because that choice is the user's to make. */
let rushing = false;
function armSkip(){ skipBtn.classList.add('dimmed'); }        // question pending
function disarmSkip(){ rushing = false; skipBtn.classList.remove('dimmed'); }
skipBtn.addEventListener('click', () => {
  if (skipBtn.classList.contains('dimmed')) return;
  rushing = true;
});
muteBtn.addEventListener('click', () => muteBtn.classList.toggle('muted'));
$('restartBtn').addEventListener('click', () => location.reload());

function scrollToEnd(smooth = true){
  chatScroll.scrollTo({ top: chatScroll.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
}

function setProgress(pct, label){
  progressFill.style.width = pct <= 0 ? '16px' : `calc((100% - 16px) * ${pct/100} + 16px)`;
  if (label !== undefined) progressLabel.textContent = label;
}

function dimPreviousSarah(){
  chatStream.querySelectorAll('.msg:not(.dim)').forEach(m => m.classList.add('dim'));
}

function el(html){
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

/* ---------- chat primitives ---------- */
/* voice state: typing dots → full text appears → gradient sheen
   sweeps the fill + bubble pulses for the duration of the "voice" */
async function sarah(text, { typingMs = 650, holdMs = 350, perWord = 130 } = {}){
  dimPreviousSarah();
  if (FF || rushing){
    const fast = el(`
      <div class="msg dim">
        <div class="dp"><img src="${SARAH}" alt="Sarah"></div>
        <div class="bubble"><p>${text}</p></div>
      </div>`);
    chatStream.appendChild(fast);
    scrollToEnd(false);
    return fast;
  }
  const row = el(`
    <div class="msg">
      <div class="dp"><img src="${SARAH}" alt="Sarah"></div>
      <div class="bubble typing"><i></i><i></i><i></i></div>
    </div>`);
  chatStream.appendChild(row);
  scrollToEnd();
  await wait(typingMs);
  const bubble = row.querySelector('.bubble');
  bubble.classList.remove('typing');
  bubble.innerHTML = `<p>${text}</p>`;
  row.classList.add('speaking');
  scrollToEnd();
  await wait(Math.max(1200, text.split(' ').length * perWord));
  row.classList.remove('speaking');
  await wait(holdMs);
  return row;
}

function userChip(text, icon = ''){
  const row = el(`
    <div class="chip-row">
      <div class="chip">${icon ? `<span class="chip-ico">${icon}</span>` : ''}${text}</div>
    </div>`);
  chatStream.appendChild(row);
  scrollToEnd();
  return row;
}

/* Sarah's bitmoji (sarah_ref_1.png). The art is drawn on black and her hair
   merges with that black, so instead of an impossible cutout the blacks are
   remapped to the chat background and the frame is feathered into it. */
const SPARK = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c.7 5.9 5.4 10.6 12 12-6.6 1.4-11.3 6.1-12 12-.7-5.9-5.4-10.6-12-12C6.6 10.6 11.3 5.9 12 0Z"/></svg>';

async function sticker(kind){
  if (kind === 'question') return null;   /* reading-state sticker removed */
  const row = el(`
    <div class="sarah-anim">
      <i class="spark s1">${SPARK}</i>
      <i class="spark s2">${SPARK}</i>
      <i class="spark s3">${SPARK}</i>
      <i class="spark s4">${SPARK}</i>
      <i class="spark s5">${SPARK}</i>
      <img src="assets/sarah-hi.png" alt="Sarah">
    </div>`);
  chatStream.appendChild(row);
  scrollToEnd();
  await wait(600);
  return row;
}

/*
  options(items, opts) → Promise<value>
  item: { value, label, icon (html), desc, defaultOnSkip, inert }
  inert items render like options but don't advance the flow (dead-ends
  in the prototype, e.g. "See more languages").
*/
function options(items, { head = null, link = null, linkValue = null, wide = false, chipIcons = false, forced = null } = {}){
  if (FF){
    const item = items.find(i => i.value === forced)
      || items.find(i => i.defaultOnSkip) || items[0];
    userChip(item.label, chipIcons ? (item.icon || '') : '');
    return Promise.resolve(item.value);
  }
  return new Promise(resolve => {
    const wrap = el(`
      <div class="options ${wide ? 'wide' : ''}">
        <p class="opt-head">${head || T('select_option')}</p>
        <div class="opt-list"></div>
      </div>`);
    const list = wrap.querySelector('.opt-list');

    const finish = (item) => {
      disarmSkip();
      wrap.remove();
      userChip(item.label, chipIcons ? (item.icon || '') : '');
      resolve(item.value);
    };

    items.forEach(item => {
      /* No affordance for rows that open a sub-tree. In a conversation
         every answer leads somewhere; signposting which ones have a
         follow-up is a menu idiom and reads as a mis-set expectation. */
      const note = item.note ? `<span class="opt-note">${item.note}</span>` : '';
      const btn = el(item.desc
        ? `<button class="opt stacked">
             <span class="opt-top">${item.icon ? `<span class="ico">${item.icon}</span>` : ''}<span class="opt-label">${item.label}</span></span>
             <span class="opt-desc">${item.desc}</span>
           </button>`
        : `<button class="opt">
             ${item.icon ? `<span class="ico">${item.icon}</span>` : ''}<span class="opt-label">${item.label}</span>${note}
           </button>`);
      btn.addEventListener('click', () => {
        if (item.inert){
          btn.animate(
            [{ transform: 'translateX(0)' }, { transform: 'translateX(-5px)' }, { transform: 'translateX(5px)' }, { transform: 'translateX(0)' }],
            { duration: 260, easing: 'ease-out' });
          return;
        }
        btn.classList.add('selected');
        setTimeout(() => finish(item), 180);
      });
      list.appendChild(btn);
    });

    if (link){
      const lb = el(`<button class="opt-link">${link}</button>`);
      /* a link with a value is a real answer (e.g. "Rather not say");
         without one it stays a prototype dead-end, as in India. */
      if (linkValue !== null){
        lb.addEventListener('click', () => {
          disarmSkip(); wrap.remove(); userChip(link); resolve(linkValue);
        });
      }
      wrap.appendChild(lb);
    }

    chatStream.appendChild(wrap);
    scrollToEnd();

    armSkip();
  });
}

const flag = (name) => `<img src="assets/flag-${name}.svg" alt="">`;

/*
  multiSelect(items, opts) → Promise<string[]>
  Minimum one, no upper cap, no ordering — so plain ticks, not
  numbers. A multi-select can't auto-advance, so it needs its
  own confirm button; Skip stays disarmed until it resolves.
*/
const TICK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';

function multiSelect(items, { head = 'Select all that apply', cta = 'Continue', forced = null } = {}){
  if (FF){
    const picked = forced && forced.length ? forced : [items[0]];
    userChip(picked.length > 1 ? `${picked[0]} +${picked.length - 1}` : picked[0]);
    return Promise.resolve(picked);
  }
  return new Promise(resolve => {
    const wrap = el(`
      <div class="options multi">
        <div class="ms-head">
          <p class="opt-head">${head}</p>
          <span class="ms-count">0 selected</span>
        </div>
        <div class="opt-list"></div>
        <button class="btn-continue ms-cta">${cta}</button>
      </div>`);
    const list  = wrap.querySelector('.opt-list');
    const count = wrap.querySelector('.ms-count');
    const cta_  = wrap.querySelector('.ms-cta');
    const chosen = new Set();

    const sync = () => {
      count.textContent = `${chosen.size} selected`;
      cta_.classList.toggle('ready', chosen.size > 0);
    };

    items.forEach(label => {
      const btn = el(`
        <button class="opt ms-opt">
          <span class="opt-label">${label}</span>
          <span class="ms-box">${TICK}</span>
        </button>`);
      btn.addEventListener('click', () => {
        if (chosen.has(label)) chosen.delete(label); else chosen.add(label);
        btn.classList.toggle('on', chosen.has(label));
        sync();
      });
      list.appendChild(btn);
    });

    cta_.addEventListener('click', () => {
      if (!chosen.size) return;                 /* minimum one */
      disarmSkip();
      wrap.remove();
      const picked = items.filter(i => chosen.has(i));   /* source order, not tap order */
      userChip(picked.length > 1 ? `${picked[0]} +${picked.length - 1}` : picked[0]);
      resolve(picked);
    });

    sync();
    chatStream.appendChild(wrap);
    scrollToEnd();
    armSkip();
  });
}

/*
  bandSlider() → Promise<number>
  IELTS only. The full 0–9 scale in 0.5 steps — the user picks
  their real target rather than a bucket.
*/
function bandSlider({ start = 7 } = {}){
  if (FF){ userChip(`Band ${start.toFixed(1)}`); return Promise.resolve(start); }
  return new Promise(resolve => {
    const wrap = el(`
      <div class="band-block">
        <div class="band-card">
          <div class="band-read"><b class="band-val">7.0</b><small>TARGET BAND</small></div>
          <div class="band-slider">
            <input type="range" min="0" max="9" step="0.5" value="${start}" aria-label="Target band">
            <div class="band-ticks"><span>0</span><span>3</span><span>5</span><span>6</span><span>7</span><span>9</span></div>
          </div>
          <div class="band-note"></div>
        </div>
        <button class="btn-continue ready">Continue</button>
        <button class="skip-link">I'm not sure yet</button>
      </div>`);
    const input = wrap.querySelector('input');
    const val   = wrap.querySelector('.band-val');
    const note  = wrap.querySelector('.band-note');
    const paint = () => {
      const v = parseFloat(input.value);
      val.textContent = v.toFixed(1);
      note.textContent = C.bandNote(v);
      input.style.setProperty('--pct', `${(v / 9) * 100}%`);
    };
    input.addEventListener('input', paint);
    const finish = (v) => { disarmSkip(); wrap.remove(); if (v !== null) userChip(`Band ${v.toFixed(1)}`); resolve(v); };
    wrap.querySelector('.btn-continue').addEventListener('click', () => finish(parseFloat(input.value)));
    wrap.querySelector('.skip-link').addEventListener('click', () => finish(null));
    paint();
    chatStream.appendChild(wrap);
    scrollToEnd();
    armSkip();
  });
}

/* one-line free-text answer (used by "Others — I'll type it") */
function textInput(placeholder, { skip = 'Skip' } = {}){
  if (FF) return Promise.resolve(null);
  return new Promise(resolve => {
    const wrap = el(`
      <div class="input-block">
        <div class="phone-field-wrap"><input type="text" maxlength="40" placeholder="${placeholder}"></div>
        <button class="btn-continue">${T('continue')}</button>
        <button class="skip-link">${skip}</button>
      </div>`);
    const input = wrap.querySelector('input');
    const btn   = wrap.querySelector('.btn-continue');
    input.addEventListener('input', () => btn.classList.toggle('ready', input.value.trim().length > 1));
    const finish = (v) => { disarmSkip(); wrap.remove(); if (v) userChip(v); resolve(v); };
    btn.addEventListener('click', () => finish(input.value.trim() || null));
    wrap.querySelector('.skip-link').addEventListener('click', () => finish(null));
    chatStream.appendChild(wrap);
    scrollToEnd();
    setTimeout(() => input.focus({ preventScroll: true }), 300);
    armSkip();
  });
}

/* inline brand icons for attribution list */
const ICONS = {
  play:      '<svg viewBox="0 0 24 24" fill="#fff"><path d="M3 20.42V3.58c0-.6.34-1.12.85-1.37L13.6 12 3.85 21.79A1.53 1.53 0 0 1 3 20.42Zm13.81-5.06L6.15 21.42l8.4-8.4 2.26 2.34Zm3.35-4.53c.5.3.84.85.84 1.17 0 .32-.3.87-.81 1.17l-2.22 1.28-2.5-2.45 2.5-2.45 2.19 1.28ZM6.15 2.58l10.66 6.06-2.26 2.34-8.4-8.4Z"/></svg>',
  tiktok:    '<svg viewBox="0 0 24 24" fill="#fff"><path d="M16.5 3c.35 1.9 1.6 3.4 3.5 3.75V9.6a6.8 6.8 0 0 1-3.5-1.15v5.85A5.65 5.65 0 1 1 10 8.7v3.1a2.6 2.6 0 1 0 3.4 2.5V3h3.1Z"/></svg>',
  instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5.4"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.2" cy="6.8" r="1.2" fill="#fff" stroke="none"/></svg>',
  google:    '<svg viewBox="0 0 24 24"><path fill="#4285F4" d="M21.6 12.2c0-.7-.06-1.4-.18-2H12v3.9h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.75 3-4.3 3-7.4Z"/><path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.6-2.4l-3.2-2.5c-.9.6-2 .95-3.4.95a5.98 5.98 0 0 1-5.6-4.15H3.1v2.6A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.4 13.9a6 6 0 0 1 0-3.8V7.5H3.1a10 10 0 0 0 0 9Z"/><path fill="#EA4335" d="M12 5.95c1.47 0 2.8.5 3.84 1.5L18.7 4.6A10 10 0 0 0 3.1 7.5l3.3 2.6A5.98 5.98 0 0 1 12 5.95Z"/></svg>',
  facebook:  '<svg viewBox="0 0 24 24" fill="#fff"><path d="M13.5 21v-7h2.4l.45-3h-2.85V9.1c0-.87.28-1.6 1.66-1.6h1.34V4.85c-.3-.04-1.3-.13-2.44-.13-2.42 0-4.06 1.48-4.06 4.18V11H7.5v3H10v7h3.5Z"/></svg>',
  x:         '<svg viewBox="0 0 24 24" fill="#fff"><path d="M17.6 3h3l-6.6 7.55L21.8 21h-6.1l-4.8-6.3L5.4 21h-3l7.1-8.1L2.5 3h6.25l4.35 5.75L17.6 3Zm-1.05 16.2h1.7L7.85 4.7H6.05l10.5 14.5Z"/></svg>',
  referral:  '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round"><circle cx="6" cy="12" r="2.6"/><circle cx="17.5" cy="5.5" r="2.6"/><circle cx="17.5" cy="18.5" r="2.6"/><path d="m8.4 10.7 6.7-3.9M8.4 13.3l6.7 3.9"/></svg>',
  friends:   '<svg viewBox="0 0 24 24" fill="#fff"><path d="M9 11a3.4 3.4 0 1 0 0-6.8A3.4 3.4 0 0 0 9 11Zm7 .4a2.9 2.9 0 1 0 0-5.8 2.9 2.9 0 0 0 0 5.8ZM2.6 18.4c.5-3 3.1-5 6.4-5s5.9 2 6.4 5c.08.5-.33.95-.84.95H3.44a.86.86 0 0 1-.84-.95Zm14.05.95c.13-.3.2-.63.15-.98a7.1 7.1 0 0 0-1.55-3.5 4.9 4.9 0 0 1 6.1 3.5c.1.5-.32.98-.83.98h-3.87Z"/></svg>',
  youtube:   '<svg viewBox="0 0 24 24" fill="#fff"><path d="M21.6 7.2a2.5 2.5 0 0 0-1.76-1.77C18.28 5 12 5 12 5s-6.28 0-7.84.43A2.5 2.5 0 0 0 2.4 7.2 26.2 26.2 0 0 0 2 12c0 1.62.13 3.24.4 4.8a2.5 2.5 0 0 0 1.76 1.77C5.72 19 12 19 12 19s6.28 0 7.84-.43a2.5 2.5 0 0 0 1.76-1.77c.27-1.56.4-3.18.4-4.8s-.13-3.24-.4-4.8ZM10 15.2V8.8l5.2 3.2-5.2 3.2Z"/></svg>',
  seedling:  '🌱',
  herb:      '🌿',
  brain:     '🧠',
};

/* ---------- name input ---------- */
function nameInput(){
  if (FF){ userChip('Aarav'); return Promise.resolve('Aarav'); }
  return new Promise(resolve => {
    const wrap = el(`
      <div class="input-block">
        <input class="name-field" maxlength="50" autocomplete="off" spellcheck="false" aria-label="Your name">
        <span class="char-count">0/50</span>
        <button class="btn-continue">${T('continue')}</button>
      </div>`);
    const input = wrap.querySelector('input');
    const count = wrap.querySelector('.char-count');
    const btn   = wrap.querySelector('.btn-continue');

    input.addEventListener('input', () => {
      count.textContent = `${input.value.length}/50`;
      btn.classList.toggle('ready', input.value.trim().length > 0);
    });
    const finish = (val) => {
      disarmSkip();
      wrap.remove();
      userChip(val);
      resolve(val);
    };
    btn.addEventListener('click', () => finish(input.value.trim()));
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && input.value.trim()) finish(input.value.trim());
    });

    chatStream.appendChild(wrap);
    scrollToEnd();
    setTimeout(() => input.focus({ preventScroll: true }), 350);
    armSkip();
  });
}

/* ---------- phone input (flag + code follow the chosen language) ---------- */
function phoneInput(flagName, cc){
  if (FF) return Promise.resolve(null);
  return new Promise(resolve => {
    const wrap = el(`
      <div class="input-block">
        <div class="phone-field-wrap">
          <img class="flag" src="assets/flag-${flagName}.svg" alt="">
          <span class="cc">${cc}</span>
          <input type="tel" inputmode="numeric" placeholder="Phone Number" maxlength="12" aria-label="Phone number">
        </div>
        <button class="btn-continue">${T('continue')}</button>
        <button class="skip-link">${T('skip_for_now')}</button>
      </div>`);
    const input = wrap.querySelector('input');
    const btn   = wrap.querySelector('.btn-continue');

    input.addEventListener('input', () => {
      input.value = input.value.replace(/\D/g, '');
      btn.classList.toggle('ready', input.value.length >= 8);
    });
    const finish = (val) => {
      disarmSkip();
      wrap.remove();
      if (val) userChip(val);
      resolve(val);
    };
    btn.addEventListener('click', () => finish(`${cc} ${input.value}`));
    wrap.querySelector('.skip-link').addEventListener('click', () => finish(null));

    chatStream.appendChild(wrap);
    scrollToEnd();
    armSkip();
  });
}

/* centre-based auto-slide shared by both testimonial rails: it walks each
   card by its real offset (fixed pixel guesses used to skip the last card)
   and pauses while the user is interacting. */
function railAutoSlide(rail, { interval = 3200, onActive = null } = {}){
  const cards = [...rail.children];
  if (cards.length < 2) return () => {};
  const centreOf = (c) => c.offsetLeft - (rail.clientWidth - c.offsetWidth) / 2;
  const current = () => {
    const mid = rail.scrollLeft + rail.clientWidth / 2;
    let best = 0, bestD = Infinity;
    cards.forEach((c, i) => {
      const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid);
      if (d < bestD){ bestD = d; best = i; }
    });
    if (onActive) onActive(cards, best);
    return best;
  };
  let timer = null, resume = null;
  const start = () => {
    clearInterval(timer);
    timer = setInterval(() => {
      const next = (current() + 1) % cards.length;
      rail.scrollTo({ left: centreOf(cards[next]), behavior: 'smooth' });
    }, interval);
  };
  const pause = () => {
    clearInterval(timer);
    clearTimeout(resume);
    resume = setTimeout(start, 4500);
  };
  rail.addEventListener('scroll', current, { passive: true });
  rail.addEventListener('pointerdown', pause);
  rail.addEventListener('wheel', pause, { passive: true });
  requestAnimationFrame(current);
  start();
  return () => { clearInterval(timer); clearTimeout(resume); };
}

/* ---------- testimonials ----------
   Posts read in the user's language; each one carries the icon of the
   store/network it came from. */
const SRC_ICONS = {
  x: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.6 3h3l-6.6 7.55L21.8 21h-6.1l-4.8-6.3L5.4 21h-3l7.1-8.1L2.5 3h6.25l4.35 5.75L17.6 3Zm-1.05 16.2h1.7L7.85 4.7H6.05l10.5 14.5Z"/></svg>',
  play: '<svg viewBox="0 0 24 24"><path fill="#34A853" d="M3 20.42V3.58c0-.6.34-1.12.85-1.37L13.6 12 3.85 21.79A1.53 1.53 0 0 1 3 20.42Z"/><path fill="#EA4335" d="M16.81 15.36 6.15 21.42l8.4-8.4 2.26 2.34Z"/><path fill="#FBBC04" d="M20.16 10.83c.5.3.84.85.84 1.17 0 .32-.3.87-.81 1.17l-2.22 1.28-2.5-2.45 2.5-2.45 2.19 1.28Z"/><path fill="#4285F4" d="M6.15 2.58l10.66 6.06-2.26 2.34-8.4-8.4Z"/></svg>',
  app: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.36 12.5c.02-2.02 1.65-2.99 1.72-3.04-.94-1.37-2.4-1.56-2.92-1.58-1.24-.13-2.42.73-3.05.73-.63 0-1.6-.71-2.63-.69-1.35.02-2.6.79-3.29 2-1.4 2.43-.36 6.03 1.01 8 .67.96 1.47 2.04 2.51 2 1.01-.04 1.39-.65 2.61-.65s1.57.65 2.63.63c1.09-.02 1.78-.98 2.44-1.95.77-1.11 1.09-2.19 1.11-2.25-.02-.01-2.13-.82-2.15-3.25ZM14.4 6.6c.56-.68.93-1.62.83-2.56-.8.03-1.78.53-2.35 1.21-.51.6-.96 1.56-.84 2.48.89.07 1.8-.45 2.36-1.13Z"/></svg>',
};
const T_AVATARS = ['avatar-syahrier.png', 'avatar-t2.png', 'avatar-t3.png'];
const T_SOURCES = ['x', 'play', 'app'];

async function testimonialCarousel(){
  const wrap = el(`<div class="testimonials"><div class="testimonial-rail"></div></div>`);
  const rail = wrap.querySelector('.testimonial-rail');
  T('testimonials').forEach((t, i) => rail.appendChild(el(`
    <article class="t-card">
      <div class="t-head">
        <div class="t-id">
          <img src="assets/${T_AVATARS[i]}" alt="">
          <div><p class="t-name">${t.name}</p><p class="t-handle">${t.handle}</p></div>
        </div>
        <span class="t-src t-src-${T_SOURCES[i]}">${SRC_ICONS[T_SOURCES[i]]}</span>
      </div>
      <p class="t-body">${t.body}</p>
    </article>`)));
  chatStream.appendChild(wrap);
  scrollToEnd();
  await wait(700);
  railAutoSlide(rail, { interval: 2600 });
  await wait(4600);
}

/* ---------- variant B: video testimonial carousel ---------- */
const VT = [
  { photo:'assets/videos/t1.jpg', video:'assets/videos/t1.mp4', name:'Ananya Sharma',   role:'Marketing Exec, Delhi',   src:'play',
    quote:'“At last I found an app that really helps you to grow. Direct to the point instructions for every lesson”' },
  { photo:'assets/videos/t2.jpg', video:'assets/videos/t2.mp4', name:'Meera Krishnan',  role:'Software Engineer, Bengaluru', src:'x',
    quote:'“I am an introvert. The app is really helpful for me personally. I am practicing English consistently now“' },
  { photo:'assets/videos/t3.jpg', video:'assets/videos/t3.mp4', name:'Nikita Desai',    role:'HR Manager, Ahmedabad',   src:'app',
    quote:'“This app really helped me with my pronunciation. The features improved my English”' },
  { photo:'assets/videos/t4.png', video:'assets/videos/t4.mp4', name:'Rohan Verma',     role:'Product Manager, Mumbai', src:'play',
    quote:'“Excellent app for speaking and chatting! It’s improved my English with effective practice”' },
];
const vtHasVideo = VT.map(() => false);

async function videoTestimonialCarousel(){
  const wrap = el(`<div class="testimonials"><div class="testimonial-rail vt-rail" id="vtRail"></div></div>`);
  const rail = wrap.querySelector('.vt-rail');
  VT.forEach((t, i) => {
    const q = T('vt_quotes')[i] || t.quote;
    const card = el(`
      <article class="vt-card" data-i="${i}">
        <video src="${t.video}" muted loop autoplay playsinline preload="metadata"></video>
        <div class="vt-kb" style="background-image:url('${t.photo}')"></div>
        <span class="vt-play"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.6v12.8c0 .5.55.8.97.53l10.06-6.4a.63.63 0 0 0 0-1.06L8.97 5.07A.62.62 0 0 0 8 5.6Z"/></svg></span>
        <div class="vt-scrim">
          <img class="vt-stars" src="assets/paywall/stars.svg" alt="★★★★★">
          <p>${q.length > 74 ? q.slice(0, 72) + '…”' : q}</p>
          <b>${t.name}</b>
        </div>
      </article>`);
    const v = card.querySelector('video');
    v.addEventListener('error', () => { v.remove(); }, { once: true });
    v.addEventListener('canplay', () => { vtHasVideo[i] = true; card.classList.add('has-video'); }, { once: true });
    card.addEventListener('click', () => openStory(i, card));
    rail.appendChild(card);
  });
  chatStream.appendChild(wrap);
  scrollToEnd();

  railAutoSlide(rail, {
    interval: 3200,
    onActive: (cards, best) => cards.forEach((c, i) => c.classList.toggle('is-active', i === best)),
  });
  await wait(4200);
}

/* --- story-style takeover --- */
let spIdx = 0, spMuted = true, spTimer = null, spRaf = null;
const storyEl = () => $('storyPlayer');

function spRenderProgress(){
  $('spProgress').innerHTML = VT.map((_, i) =>
    `<span class="spb ${i < spIdx ? 'done' : ''}"><i id="spb${i}"></i></span>`).join('');
}

function spShow(i){
  spIdx = i;
  const t = VT[i];
  clearTimeout(spTimer);
  cancelAnimationFrame(spRaf);
  spRenderProgress();
  $('spQuote').textContent = T('vt_quotes')[i] || t.quote;
  $('spName').textContent = t.name;
  $('spRole').textContent = t.role;
  const media = $('spMedia');
  media.innerHTML = '';
  const bar = () => $(`spb${i}`);
  if (vtHasVideo[i]){
    const v = document.createElement('video');
    v.src = t.video;
    v.autoplay = true;
    v.playsInline = true;
    v.muted = spMuted;
    media.appendChild(v);
    const tick = () => {
      if (v.duration) bar().style.width = `${(v.currentTime / v.duration) * 100}%`;
      spRaf = requestAnimationFrame(tick);
    };
    spRaf = requestAnimationFrame(tick);
    v.addEventListener('ended', () => spNext(), { once: true });
  } else {
    media.innerHTML = `<div class="vt-kb sp-kb" style="background-image:url('${t.photo}')"></div>`;
    const t0 = performance.now(), DUR = 6000;
    const tick = (now) => {
      const k = Math.min(1, (now - t0) / DUR);
      bar().style.width = `${k * 100}%`;
      if (k < 1) spRaf = requestAnimationFrame(tick);
      else spNext();
    };
    spRaf = requestAnimationFrame(tick);
  }
}

function spNext(){ spIdx < VT.length - 1 ? spShow(spIdx + 1) : closeStory(); }
function spPrev(){ spShow(Math.max(0, spIdx - 1)); }

function openStory(i, card){
  document.querySelectorAll('.vt-rail video').forEach(v => v.pause());
  const sp = storyEl();
  sp.hidden = false;
  /* zoom out of the tapped card */
  const pr = $('phone').getBoundingClientRect();
  const cr = card.getBoundingClientRect();
  const scale = Math.max(cr.width / pr.width, 0.2);
  const dx = (cr.left + cr.width / 2) - (pr.left + pr.width / 2);
  const dy = (cr.top + cr.height / 2) - (pr.top + pr.height / 2);
  const zoom = $('mockup').style.transform.match(/scale\(([\d.]+)\)/);
  const z = zoom ? parseFloat(zoom[1]) : 1;
  sp.style.transition = 'none';
  sp.style.transform = `translate(${dx / z}px, ${dy / z}px) scale(${scale})`;
  sp.style.opacity = '0.4';
  requestAnimationFrame(() => requestAnimationFrame(() => {
    sp.style.transition = 'transform .45s var(--ease-out), opacity .35s var(--ease-out)';
    sp.style.transform = 'none';
    sp.style.opacity = '1';
  }));
  spShow(i);
}

function closeStory(){
  const sp = storyEl();
  clearTimeout(spTimer);
  cancelAnimationFrame(spRaf);
  sp.style.transform = 'scale(.92)';
  sp.style.opacity = '0';
  setTimeout(() => {
    sp.hidden = true;
    sp.style.transform = '';
    sp.style.opacity = '';
    $('spMedia').innerHTML = '';
    document.querySelectorAll('.vt-rail video').forEach(v => v.play().catch(() => {}));
  }, 300);
}

/* story player controls (bound once) */
(() => {
  $('spClose').addEventListener('click', closeStory);
  $('spNext').addEventListener('click', spNext);
  $('spPrev').addEventListener('click', spPrev);
  $('spMute').addEventListener('click', () => {
    spMuted = !spMuted;
    $('spMute').classList.toggle('unmuted', !spMuted);
    const v = $('spMedia').querySelector('video');
    if (v) v.muted = spMuted;
  });
})();


/* ---------- speaking test ---------- */
/* Passage, the two flagged words and the whole hint flow are keyed
   to the GOAL chosen at stage 5. setActivation() is called there. */
let PASSAGE     = ['', ''];
let PRON_WORDS  = [];
let HS_PASSAGE  = '';
let ACT_INTRO   = '';

function setActivation(goal){
  const a = C.ACTIVATION[goal] || C.ACTIVATION.career;
  PASSAGE    = [a.lead, a.rest];
  PRON_WORDS = a.words;
  HS_PASSAGE = a.lead + a.rest;
  ACT_INTRO  = a.intro;
}
setActivation(DBG.goal);   /* so deep links land on the right content */

const ICON_TRANSLATE = '<svg viewBox="0 0 20 20" fill="currentColor" aria-label="Translate"><path d="M7.75 2.75a.75.75 0 0 0-1.5 0v1.258a32.987 32.987 0 0 0-3.599.278.75.75 0 1 0 .198 1.487A31.545 31.545 0 0 1 8.7 5.545 19.381 19.381 0 0 1 7 9.56a19.418 19.418 0 0 1-1.002-2.05.75.75 0 0 0-1.384.577 20.935 20.935 0 0 0 1.492 2.91 19.613 19.613 0 0 1-3.828 4.154.75.75 0 1 0 .945 1.164A21.116 21.116 0 0 0 7 12.331c.095.132.192.262.29.391a.75.75 0 0 0 1.194-.91c-.204-.266-.4-.538-.59-.815a20.888 20.888 0 0 0 2.333-5.332c.31.031.618.068.924.108a.75.75 0 0 0 .198-1.487 32.832 32.832 0 0 0-3.599-.278V2.75Z"/><path d="M13 8a.75.75 0 0 1 .671.415l4.25 8.5a.75.75 0 1 1-1.342.67L15.787 16h-5.573l-.793 1.585a.75.75 0 1 1-1.342-.67l4.25-8.5A.75.75 0 0 1 13 8Zm2.037 6.5L13 10.427 10.964 14.5h4.073Z"/></svg>';
const ICON_SPEAKER = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-label="Listen"><path d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z"/></svg>';

function readAloudCard(){
  const card = el(`
    <div class="read-card" id="readCard">
      <p class="rc-label">${T('read_label')}</p>
      <p class="rc-text"><span class="said"></span><span class="rest">${PASSAGE[0]}${PASSAGE[1]}</span></p>
      <div class="rc-icons">
        <span>${ICON_TRANSLATE}</span>
        <span>${ICON_SPEAKER}</span>
      </div>
    </div>`);
  chatStream.appendChild(card);
  scrollToEnd();
  return card;
}

/* --- conversation mic (stimuler-flow interaction) --- */
const WAVE_BARS = 26;
let waveTimer = null;

function buildWave(){
  const wave = $('cmWave');
  if (!wave.children.length){
    for (let i = 0; i < WAVE_BARS; i++) wave.appendChild(document.createElement('i'));
  }
}
function startWave(){
  const bars = [...$('cmWave').children];
  const mid = (WAVE_BARS - 1) / 2;
  waveTimer = setInterval(() => {
    bars.forEach((b, i) => {
      const env = Math.exp(-Math.pow((i - mid) / (WAVE_BARS * 0.4), 2));
      b.style.height = `${4 + Math.random() * 28 * env}px`;
    });
  }, 90);
}
function stopWave(){
  clearInterval(waveTimer);
  [...$('cmWave').children].forEach(b => b.style.height = '4px');
}

function resetReadCard(card){
  card.querySelector('.said').textContent = '';
  card.querySelector('.rest').textContent = PASSAGE[0] + PASSAGE[1];
}

async function fillWords(card, signal){
  const said = card.querySelector('.said');
  const rest = card.querySelector('.rest');
  const words = (PASSAGE[0] + PASSAGE[1]).split(' ');
  for (let i = 1; i <= words.length; i++){
    if (signal.cancelled) return;
    said.textContent = words.slice(0, i).join(' ') + ' ';
    rest.textContent = words.slice(i).join(' ');
    await wait(260);
  }
}

/* full reading interaction: orb tap → pill + waveform + words fill →
   ✓ collapses to tick (✕ resets and starts over). resolves when confirmed */
function readingInteraction(card){
  return new Promise(resolve => {
    buildWave();
    micArea.classList.remove('gone');
    convMic.className = 'convmic idle';

    const onOrbTap = () => {
      if (!convMic.classList.contains('idle')) return;
      setProgress(84, '84% completed');
      $('micTip').classList.add('hidden');
      convMic.className = 'convmic expanded';
      startWave();
      const signal = { cancelled: false };
      fillWords(card, signal);

      const cancel = $('cmCancel'), confirm = $('cmConfirm');
      const onCancel = () => {
        signal.cancelled = true;
        stopWave();
        confirm.removeEventListener('click', onConfirm);
        resetReadCard(card);
        $('micTip').classList.remove('hidden');
        convMic.className = 'convmic idle';       // back to orb, listen again
      };
      const onConfirm = async () => {
        signal.cancelled = true;
        stopWave();
        cancel.removeEventListener('click', onCancel);
        convMic.removeEventListener('click', onOrbTap);
        // make sure the card reads fully "said"
        card.querySelector('.said').textContent = PASSAGE[0] + PASSAGE[1];
        card.querySelector('.rest').textContent = '';
        convMic.className = 'convmic submitting';
        await wait(700);
        convMic.classList.add('gone');
        setTimeout(() => micArea.classList.add('gone'), 350);
        resolve();
      };
      cancel.addEventListener('click', onCancel, { once: true });
      confirm.addEventListener('click', onConfirm, { once: true });
    };
    convMic.addEventListener('click', onOrbTap);
  });
}

/* floating success toast */
async function showToast(title, sub, holdMs = 2200){
  const t = el(`
    <div class="toast-float">
      <div class="toast-banner">
        <span class="tb-check"><svg viewBox="0 0 24 24" fill="none" stroke="#06301B" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 12.5 9.5 18 20 6.5"/></svg></span>
        <span><span class="tb-title">${title}</span><span class="tb-sub">${sub}</span></span>
      </div>
    </div>`);
  $('chatScreen').appendChild(t);
  await wait(holdMs);
  t.classList.add('leaving');
  await wait(400);
  t.remove();
}

/* ============================================================
   TAKEOVER SEQUENCES
   ============================================================ */
function showScreen(id){
  const s = $(id);
  s.hidden = false;
  requestAnimationFrame(() => requestAnimationFrame(() => s.classList.remove('is-hidden')));
}
function hideScreen(id){
  const s = $(id);
  s.classList.add('is-hidden');
  setTimeout(() => { s.hidden = true; }, 500);
}

/* --- hint flow: level meter → fix pronunciation → practice ---
   Interaction ported from usa-onboarding, restyled on our tokens. */
const HS_LEVELS = ['Proficient', 'Advanced', 'Upper intermediate', 'Intermediate', 'Beginner', 'Novice'];
const HS_CEFR   = { 'Proficient':'C2', 'Advanced':'C1', 'Upper intermediate':'B2', 'Intermediate':'B1', 'Beginner':'A2', 'Novice':'A1' };
const HS_POS    = [8, 25.5, 43, 60.5, 78, 95.5];
const LEVEL_METER = {
  beginner:     { name:'A2', score:32, tgt:'Upper intermediate', tgtScore:68 },
  intermediate: { name:'B1', score:45, tgt:'Advanced',           tgtScore:82 },
  advanced:     { name:'B2', score:58, tgt:'Proficient',         tgtScore:93 },
};

function buildMeter(){
  const track = $('hsTrack'), labels = $('hsLabels');
  if (track.children.length) return;
  let t = '<svg class="lv-cup" viewBox="0 0 24 24" fill="currentColor"><path d="M6 3h12v2h3v3c0 2.4-1.9 4.3-4.3 4.5A6 6 0 0 1 13 16v2.5h3.5V21h-9v-2.5H11V16a6 6 0 0 1-3.7-3.5C4.9 12.3 3 10.4 3 8V5h3V3zm-1 4v1c0 1.2.8 2.3 2 2.7V7H5zm14 0h-2v3.7c1.2-.4 2-1.5 2-2.7V7z"/></svg>';
  let l = '';
  HS_POS.forEach((pos, i) => {
    if (i > 0) t += `<i class="lv-dot" style="top:${pos}%"></i>`;
    if (i < 5) t += `<i class="lv-tick" style="top:${pos + 5.5}%"></i><i class="lv-tick" style="top:${pos + 11}%"></i>`;
    l += `<span style="top:${pos}%" data-lv="${HS_LEVELS[i]}">${HS_LEVELS[i]}<i>${HS_CEFR[HS_LEVELS[i]]}</i></span>`;
  });
  track.innerHTML = t;
  labels.innerHTML = l;
}

function hsPosForScore(sc){
  const A = [[0, 95.5], [52, 70], [80, 43], [100, 8]];
  for (let i = 1; i < A.length; i++){
    if (sc <= A[i][0]){
      const [s0, p0] = A[i - 1], [s1, p1] = A[i];
      return p0 + (p1 - p0) * ((sc - s0) / (s1 - s0));
    }
  }
  return 8;
}

function hsAnimateScore(from, to, dur){
  return new Promise(resolve => {
    const pct = $('hsPct'), bub = $('hsBub');
    const t0 = performance.now();
    const step = (now) => {
      const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      const sc = from + (to - from) * e;
      pct.textContent = `${Math.round(sc)}%`;
      bub.style.top = `${hsPosForScore(sc)}%`;
      if (k < 1) requestAnimationFrame(step);
      else resolve();
    };
    requestAnimationFrame(step);
  });
}

function hsPassageHTML(){
  let text = HS_PASSAGE;
  PRON_WORDS.forEach((pw, i) => {
    text = text.replace(new RegExp(`\\b${pw.w}\\b`, 'i'), m => `<b class="hlw" data-i="${i}">${m}</b>`);
  });
  return `<p>${text}</p>`;
}

function hsLoadWord(idx){
  const pw = PRON_WORDS[idx];
  $('hsFill').parentElement.classList.remove('win');
  $('hsFill').style.width = `${idx === 0 ? 8 : 50}%`;
  document.querySelectorAll('#hsPracPassage .hlw').forEach(el => {
    const i = +el.dataset.i;
    el.classList.toggle('ok', i < idx);
    el.classList.toggle('idle', i > idx);
  });
  $('pcWord').innerHTML = `${pw.pre}<i>${pw.hot}</i>${pw.post || ''}`;
  $('pcPh').textContent = pw.ph;
  $('pcTip').innerHTML = pw.tip.replace(/‘([^’]+)’/, '<b>‘$1’</b>');
  $('pcScore').textContent = `${pw.start}%`;
  const card = $('pronCard');
  card.classList.remove('done');
  card.querySelector('.pc-check').hidden = true;
  const btn = $('pcBtn');
  btn.classList.remove('listening', 'done');
  $('pcBtnT').textContent = T('tap_speak');
  const st = $('hsState');
  st.classList.remove('ok');
  st.textContent = T('prac_state');
}

function hsPracticeWord(idx){
  return new Promise(resolve => {
    hsLoadWord(idx);
    const btn = $('pcBtn'), skip = $('pcSkip');
    let scoreT = null;

    const cleanup = () => {
      btn.removeEventListener('click', onSpeak);
      skip.removeEventListener('click', onSkip);
      clearInterval(scoreT);
    };
    const onSkip = () => { cleanup(); resolve(); };
    const onSpeak = () => {
      if (btn.classList.contains('listening') || btn.classList.contains('done')) return;
      btn.classList.add('listening');
      $('pcBtnT').textContent = T('listening');
      $('hsState').textContent = T('prac_clear');
      setTimeout(() => {
        btn.classList.remove('listening');
        btn.classList.add('done');
        $('pcBtnT').textContent = T('completed');
        const card = $('pronCard');
        card.classList.add('done');
        card.querySelector('.pc-check').hidden = false;
        const st = $('hsState');
        st.classList.add('ok');
        st.textContent = T('prac_nice');
        $('hsFill').parentElement.classList.add('win');
        let sc = PRON_WORDS[idx].start;
        scoreT = setInterval(() => {
          sc += 2;
          $('pcScore').textContent = `${Math.min(80, sc)}%`;
          if (sc >= 80) clearInterval(scoreT);
        }, 40);
        $('hsFill').style.width = `${idx === 0 ? 50 : 100}%`;
        const hl = document.querySelector(`#hsPracPassage .hlw[data-i="${idx}"]`);
        if (hl) hl.classList.add('ok');
        setTimeout(() => { cleanup(); resolve(); }, idx === 0 ? 1700 : 2200);
      }, 2400);
    };
    btn.addEventListener('click', onSpeak);
    skip.addEventListener('click', onSkip);
  });
}

async function hintSequence(level){
  const cfg = LEVEL_METER[level] || LEVEL_METER.beginner;
  buildMeter();
  $('hsPct').textContent = '0%';
  $('hsBub').style.top = '95.5%';
  /* localize the static hint-screen strings */
  $('hsSay').textContent = T('hs_say1');
  $('hsHead').innerHTML = T('hs_title');
  $('hsNext').textContent = T('continue');
  document.querySelector('#hsErrorsView .hs-fq').innerHTML = T('fix_title');
  document.querySelector('#hsErrorsView .hs-sub').textContent = T('fix_sub');
  $('hsFix').textContent = T('fix_cta');
  document.querySelector('#hsPracticeView .hs-teach').innerHTML = T('teach');
  document.querySelector('.pc-score span').textContent = T('cur_score');
  $('pcSkip').textContent = T('skip_word');
  reach('meter');
  showScreen('hintScreen');
  setTimeout(() => $('chatScreen').classList.add('is-hidden'), FF ? 0 : 600);

  /* beat 1 — where you stand */
  await wait(900);
  await hsAnimateScore(0, cfg.score, FF ? 60 : 1700);
  $('hsSay').textContent = T('hs_say2', cfg.name);
  await wait(1900);

  /* beat 2 — where we take you (gold) */
  $('hsMeterView').classList.add('gold');
  $('hsSay').textContent = T('hs_say3', cfg.tgt);
  $('hsHead').innerHTML = T('hs_take', cfg.tgt);
  const tl = document.querySelector(`#hsLabels span[data-lv="${cfg.tgt}"]`);
  if (tl) tl.classList.add('tgt');
  await hsAnimateScore(cfg.score, cfg.tgtScore, FF ? 60 : 1500);
  const next = $('hsNext');
  next.style.visibility = 'visible';
  if (!FF) await new Promise(r => next.addEventListener('click', r, { once: true }));

  /* errors view */
  reach('fix');
  $('hsMeterView').hidden = true;
  $('hsPassage').innerHTML = hsPassageHTML();
  $('hsErrorsView').hidden = false;
  if (!FF) await new Promise(r => $('hsFix').addEventListener('click', r, { once: true }));

  /* practice */
  reach('practice');
  $('hsErrorsView').hidden = true;
  $('hsPracPassage').innerHTML = hsPassageHTML();
  $('hsPracticeView').hidden = false;
  for (let i = 0; i < PRON_WORDS.length; i++){
    if (FF){ hsLoadWord(i); continue; }
    await hsPracticeWord(i);
  }

  /* closing beat — practice card closes, the passage turns green */
  $('hsFill').style.width = '100%';
  $('hsFill').parentElement.classList.add('win');
  document.querySelectorAll('#hsPracPassage .hlw').forEach(w => w.classList.add('ok'));
  const st = $('hsState');
  st.classList.add('ok');
  st.textContent = T('prac_nice');
  $('hsPracticeView').classList.add('alldone');
  await wait(2000);

  hideScreen('hintScreen');
  await wait(550);
}

/* --- graph → paywall (golden) --- */
/* curve samples in image px (x 0→358 at 447px-wide trail, y from top) */
const PW_CURVE = [[0,226.8],[3.1,226.6],[6.1,225.9],[9.2,225],[12.2,223.8],[15.3,223.1],[18.4,221.3],[21.4,220.3],[24.5,219.1],[27.6,217.8],[30.6,216.4],[33.7,214.9],[36.7,213.3],[39.8,211.5],[42.9,209.6],[45.9,207.5],[49,205.3],[52,204],[55.1,200.9],[58.2,199.2],[61.2,197.3],[64.3,193.2],[67.3,191.1],[70.4,188.9],[73.5,186.8],[76.5,184.7],[79.6,184.7],[82.7,182.7],[85.7,180.7],[88.8,178.9],[91.8,177.2],[94.9,177.2],[98,175.6],[101,174.3],[104.1,173.1],[107.1,173.1],[110.2,172.2],[113.3,171.6],[116.3,171.6],[119.4,171.3],[122.4,171.3],[125.5,171.3],[128.6,171.6],[131.6,172.3],[134.7,172.3],[137.8,172.9],[140.8,172.9],[143.9,172.8],[146.9,172.2],[150,172.2],[153.1,171],[156.1,169.4],[159.2,167.4],[162.2,167.4],[165.3,164.9],[168.4,162.2],[171.4,159.2],[174.5,155.9],[177.5,152.5],[180.6,148.9],[183.7,145.2],[186.7,141.6],[189.8,134.3],[192.9,130.8],[195.9,124.3],[199,118.9],[202,113.5],[205.1,108.2],[208.2,102.6],[211.2,99.7],[214.3,93.9],[217.3,91],[220.4,88.2],[223.5,85.4],[226.5,82.7],[229.6,80.2],[232.7,77.7],[235.7,75.4],[238.8,73.3],[241.8,71.4],[244.9,69.8],[248,69.8],[251,68.3],[254.1,67.2],[257.1,66.3],[260.2,66.3],[263.3,65.8],[266.3,65.5],[269.4,65.5],[272.4,65.7],[275.5,65.7],[278.6,66.2],[281.6,66.2],[284.7,67],[287.8,67],[290.8,67.5],[293.9,67.5],[296.9,67.5],[300,67.5],[303.1,67.3],[306.1,66.7],[309.2,66.7],[312.2,65.8],[315.3,64.7],[318.4,63.2],[321.4,63.2],[324.5,61.5],[327.5,59.6],[330.6,57.4],[333.7,52.5],[336.7,49.7],[339.8,46.9],[342.9,43.8],[345.9,37.4],[349,34.1],[352,30.7],[355.1,27.3],[358.2,20.2]];
const PW_FIRST = 76.5;   /* image-x of the "First Step" bend */
const PW_END   = 358.2;  /* image-x of the "Master Fluency" peak */
const PW_OFF   = 8.6;    /* trail img overhangs the graph box by this */

function pwCurveY(ix){
  for (let i = 1; i < PW_CURVE.length; i++){
    if (ix <= PW_CURVE[i][0]){
      const [x0, y0] = PW_CURVE[i - 1], [x1, y1] = PW_CURVE[i];
      return y0 + (y1 - y0) * ((ix - x0) / (x1 - x0));
    }
  }
  return PW_CURVE[PW_CURVE.length - 1][1];
}

/* place dot + drop + reveal tip at image-x; the dot rides the line */
function pwSetTip(ix){
  const y = pwCurveY(ix);
  const gx = ix - PW_OFF;
  $('pwgReveal').style.width = `${Math.max(0, gx + 3)}px`;
  $('pwgDot').style.left = `${gx - 9}px`;
  $('pwgDot').style.top = `${y - 9}px`;
  $('pwgDrop').style.left = `${gx - 0.75}px`;
  $('pwgDrop').style.top = `${y}px`;
}

function pwTravel(from, to, dur){
  return new Promise(resolve => {
    const t0 = performance.now();
    const step = (now) => {
      const k = Math.min(1, (now - t0) / dur);
      const e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;  /* easeInOut */
      pwSetTip(from + (to - from) * e);
      if (k < 1) requestAnimationFrame(step);
      else resolve();
    };
    requestAnimationFrame(step);
  });
}

/* localize every static string on the paywall / gift / offer screens */
function localizePaywallChrome(){
  const set = (sel, html) => document.querySelectorAll(sel).forEach(n => n.innerHTML = html);
  set('#paywallScreen .pw-cta', T('pw_cta'));
  set('#paywallScreen .pw-h2:first-of-type', C.PRICING.socialProof);
  document.querySelector('.gift-title').innerHTML = T('gift_title');
  document.querySelector('.gift-tap').textContent = T('gift_tap');
  set('.gc-txt small', T('welcome_offer'));
  document.querySelector('.offer-h').innerHTML = T('limited_time');
  document.querySelector('.op-pill').textContent = T('one_time_offer');
  document.querySelector('.offer-plan small').textContent = T('per_month_note');
  document.querySelector('#offerScreen .pw-cta').textContent = T('offer_cta');
  $('offerSeeAll').textContent = T('see_all');
  document.querySelector('.plans-sheet h4').textContent = T('choose_plan');
  const ps = document.querySelectorAll('.ps-plan');
  ps[0].querySelector('b').textContent = T('plan_yearly');
  ps[0].querySelector('small').textContent = T('billed_year');
  ps[1].querySelector('b').textContent = T('plan_monthly');
  ps[1].querySelector('small').textContent = T('billed_month');
  $('sheetCta').textContent = T('offer_cta');
}

async function paywallSequence(goal){
  reach('paywall');
  $('pwTitle').innerHTML = C.PW_TITLE[goal] || C.PW_TITLE.career;
  localizePaywallChrome();
  showScreen('paywallScreen');
  setTimeout(() => $('chatScreen').classList.add('is-hidden'), 600);
  const g = $('pwGraph');
  pwSetTip(2);

  /* state 1 — empty curve under the headline */
  await wait(1600);

  /* state 2 — the line fills with the dot riding its tip,
     lands on the First Step bend */
  g.classList.add('lit', 'live');
  await wait(420);                      /* let the dot pop in first */
  await pwTravel(2, PW_FIRST, FF ? 60 : 1100);
  const tagY = pwCurveY(PW_FIRST), tagX = PW_FIRST - PW_OFF;
  const tag1 = $('pwgTag1');
  tag1.style.left = `${Math.max(16, tagX - 48)}px`;
  tag1.style.top = `${tagY - 74}px`;
  g.classList.add('dropon', 'tag1');
  await wait(2100);

  /* state 3 — the SAME dot travels up the line to the peak */
  g.classList.remove('dropon', 'tag1');
  await wait(350);
  await pwTravel(PW_FIRST, PW_END, FF ? 60 : 1700);
  g.classList.add('dropon', 'tag2');
  await wait(2400);

  /* state 4 — the graph gels into the paywall */
  $('paywallScreen').classList.add('merged');

  /* closing the double-price paywall unlocks the gift → offer paywall */
  const close = document.querySelector('#paywallScreen .pw-close');
  close.style.cursor = 'pointer';
  if (!FF) await new Promise(r => close.addEventListener('click', r, { once: true }));
}

/* --- gift transition: tap the box → lid flies, 50% coupon reveals --- */
async function giftSequence(){
  reach('gift');
  showScreen('giftScreen');
  setTimeout(() => $('paywallScreen').classList.add('is-hidden'), 600);
  if (!FF){
    await new Promise(r => $('giftScreen').addEventListener('click', r, { once: true }));
  }
  $('giftScreen').classList.add('open');
  await wait(2600);
}

/* --- offer (discounted) paywall — body sections cloned from paywall 1 --- */
function startOfferCountdown(){
  let t = 23 * 3600 + 12 * 60 + 5;
  const box = $('offerCount');
  const render = () => {
    const h = String(Math.floor(t / 3600)).padStart(2, '0');
    const m = String(Math.floor((t % 3600) / 60)).padStart(2, '0');
    const s = String(t % 60).padStart(2, '0');
    box.innerHTML = `<b>${h}</b><i>:</i><b>${m}</b><i>:</i><b>${s}</b>`;
  };
  render();
  setInterval(() => { t = Math.max(0, t - 1); render(); }, 1000);
}

async function offerSequence(){
  reach('offer');
  const src = document.querySelector('#paywallScreen .pw-body');
  $('offerBody').innerHTML = src.innerHTML;
  startOfferCountdown();

  /* see-all-plans bottom sheet */
  const sheet = $('plansSheet'), backdrop = $('sheetBackdrop');
  $('offerSeeAll').addEventListener('click', () => {
    sheet.classList.add('show');
    backdrop.classList.add('show');
  });
  backdrop.addEventListener('click', () => {
    sheet.classList.remove('show');
    backdrop.classList.remove('show');
  });
  sheet.querySelectorAll('.ps-plan').forEach(p => p.addEventListener('click', () => {
    sheet.querySelectorAll('.ps-plan').forEach(x => x.classList.remove('selected'));
    p.classList.add('selected');
    $('sheetCta').textContent = p.dataset.plan === 'yearly' ? T('offer_cta') : T('offer_cta_m');
  }));

  showScreen('offerScreen');
  setTimeout(() => $('giftScreen').classList.add('is-hidden'), 600);
}

/* ============================================================
   THE FLOW
   ============================================================ */
async function flow(){
  disarmSkip();
  setProgress(0, T('lbl_start'));
  await wait(800);

  /* ---------- intro ---------- */
  await sarah(T('intro1'), { typingMs: 1100 });
  await sarah(T('intro2'), { typingMs: 1200 });
  await sticker('scooter');
  await wait(400);

  /* ---------- 1 · native language (global, Indonesia first) ---------- */
  reach('language');
  await sarah(T('lang_q'));
  setProgress(0, '0% completed');
  const lang = await options([
    ...C.LANGUAGES.map(l => ({
      value: l.value, label: l.label, icon: flag(l.flag),
      defaultOnSkip: l.value === 'id',
    })),
    { value: 'more', label: T('other_langs'), icon: '🌎', inert: true },
  ], { chipIcons: true, forced: DBG.lang === 'en' ? 'id' : DBG.lang });
  const L = C.LANGUAGES.find(l => l.value === lang) || C.LANGUAGES[0];
  setProgress(2, T('lbl_great'));
  await wait(300);

  /* ---------- 1.2 · app language ---------- */
  reach('applang');
  await sarah(T('applang_q'));
  const applang = await options([
    { value: 'native',  label: `Ganti ke ${L.label}`.replace('Ganti ke', T('change_to_prefix') || 'Change to'),
      icon: flag(L.flag), desc: C.APPLANG_DESC[L.value] || '' },
    { value: 'english', label: T('keep_en'), icon: '🇬🇧',
      desc: T('keep_desc'), defaultOnSkip: true },
  ], { wide: true, link: T('other_lang_link'), forced: DBG.lang === 'en' ? 'english' : 'native' });
  if (applang === 'native' && STR[lang]) L10N = lang;
  setProgress(7, '7% completed');
  await wait(300);

  /* ---------- 2 · name ---------- */
  reach('name');
  await sarah(T('name_q'));
  setProgress(15, '15% completed');
  const name = await nameInput();
  setProgress(15, T('lbl_coolname'));

  /* ---------- 2.2 · phone ---------- */
  reach('phone');
  await sarah(T('ack_name'));
  setProgress(23, '23% completed');
  await sarah(T('phone_q'));
  const phone = await phoneInput(L.flag, L.cc);

  /* ---------- 3 · heard from (India's flat list, unchanged) ---------- */
  reach('source');
  await sarah(phone ? T('source_thanks') : T('source_noproblem'));
  setProgress(30, '30% completed');
  await options([
    { value: 'play',      label: 'Just searched on Play Store', icon: ICONS.play },
    { value: 'tiktok',    label: 'Tiktok',                icon: ICONS.tiktok },
    { value: 'instagram', label: 'Instagram Reel',        icon: ICONS.instagram },
    { value: 'google',    label: 'Google Ads',            icon: ICONS.google },
    { value: 'facebook',  label: 'Facebook',              icon: ICONS.facebook },
    { value: 'x',         label: 'Twitter/X',             icon: ICONS.x },
    { value: 'referral',  label: 'Have a Referral Code?', icon: ICONS.referral },
    { value: 'friends',   label: 'Friends',               icon: ICONS.friends, defaultOnSkip: true },
    { value: 'youtube',   label: 'Youtube',               icon: ICONS.youtube },
  ], { wide: true, chipIcons: true });
  await sarah(T('glad'), { typingMs: 700 });
  await wait(200);

  /* ---------- 4 · age + gender (data capture only) ---------- */
  reach('age');
  await sarah(T('age_q'));
  setProgress(38, '38% completed');
  await options([
    { value: 'u18',   label: 'Under 18' },
    { value: '18_24', label: '18 – 24' },
    { value: '25_34', label: '25 – 34', defaultOnSkip: true },
    { value: '35_44', label: '35 – 44' },
    { value: '45p',   label: '45 and above' },
  ], { link: T('rather_not_say'), linkValue: 'na' });
  setProgress(42, '42% completed');

  reach('gender');
  await sarah(T('gender_q'));
  await options([
    { value: 'woman',  label: 'Woman' },
    { value: 'man',    label: 'Man', defaultOnSkip: true },
    { value: 'nonbin', label: 'Non-binary' },
  ], { link: T('rather_not_say'), linkValue: 'na' });
  setProgress(46, T('lbl_plan'));
  await wait(300);

  /* ---------- 5 · goal — the only real fork ---------- */
  reach('goal');
  await sarah(T('goal_q'));
  setProgress(46, '46% completed');
  const goal = await options(
    C.GOALS.map(g => ({
      value: g.value, label: g.label,
      defaultOnSkip: g.value === 'career',
    })),
    { forced: DBG.goal });
  setActivation(goal);
  const goalLabel = (C.GOALS.find(g => g.value === goal) || {}).label;

  /* ---------- 5.2 – 5.5 · exam sub-tree (IELTS branches; the rest are noted) ---------- */
  let exam = null, examType = null, examDate = null, band = null;
  if (goal === 'exam'){
    reach('exam');
    await sarah(T('exam_q'));
    setProgress(50, '50% completed');
    exam = await options(
      C.EXAMS.map(e => ({ value: e.value, label: e.label,
                          defaultOnSkip: e.value === 'ielts' })),
      { forced: DBG.exam });

    if (exam === 'other'){
      await sarah(T('exam_other_q'));
      await textInput(T('exam_other_ph'), { skip: T('skip_for_now') });
      setProgress(61, '61% completed');
    } else if (exam === 'ielts'){
      /* the only exam that branches further */
      reach('examtype');
      await sarah(T('ielts_type_q'));
      setProgress(53, '53% completed');
      examType = await options(
        C.IELTS_TYPES.map(t => ({ value: t.value, label: t.label, desc: t.desc,
                                  defaultOnSkip: t.value === 'academic' })),
        { wide: true });

      reach('examdate');
      await sarah(T('exam_date_q'));
      setProgress(57, '57% completed');
      examDate = await options(
        C.examDateOptions().map(d => ({ value: d.value, label: d.label, note: d.note,
                                        defaultOnSkip: d.value === '2m' })));

      reach('band');
      await sarah(T('band_q'));
      setProgress(61, '61% completed');
      band = await bandSlider({ start: 7 });
    } else {
      /* TOEFL / TOEIC / PTE — recorded, then straight on */
      await sarah(T('exam_noted', (C.EXAMS.find(e => e.value === exam) || {}).label), { typingMs: 700 });
      setProgress(61, '61% completed');
    }
  } else {
    await sarah(T(`ack_goal_${goal}`), { typingMs: 1200 });
    setProgress(61, '61% completed');
  }

  /* ---------- 6 · situation (profile only, no fork) ---------- */
  reach('situation');
  await sarah(T('situation_q'));
  setProgress(69, '69% completed');
  const situation = await options(
    C.SITUATIONS.map(s => ({ value: s, label: s, defaultOnSkip: s === DBG.sit })),
    { forced: DBG.sit });

  /* ---------- 7 · scenarios — multi-select, keyed to goal ----------
     Exam cohorts skip this. Their scenario is already fixed — the test
     format is the format — and they have just answered three or four
     exam questions. Asking them to name which part of the test they
     are weakest at is asking them to do the assessment that stage 9
     does properly, objectively, a minute later.                      */
  const sc = C.scenarioSet(goal, situation);
  if (sc){
    reach('scenarios');
    await sarah(sc.prompt);
    setProgress(76, '76% completed');
    const labels = sc.items.map(i => i.label);
    await multiSelect(labels, { forced: [labels[0], labels[1]] });
    await sarah(T('scenarios_ack'), { typingMs: 900 });
  }

  /* ---------- 7b · social proof (text carousel) + notifications ---------- */
  reach('testimonials');
  setProgress(80, T('lbl_know_you'));
  await sarah(T('testi_lead'));
  await testimonialCarousel();
  await sarah(T('testi_follow'));
  await sarah(T('notif_ask'));
  await sarah(T('notif_ok'), { typingMs: 800 });
  setProgress(84, '84% completed');

  /* ---------- 8 · level ---------- */
  reach('level');
  await sarah(T('level_q'));
  const level = await options([
    { value: 'beginner',     label: 'Beginner',     icon: ICONS.seedling,
      desc: T('lvl_beg_d'), defaultOnSkip: true },
    { value: 'intermediate', label: 'Intermediate', icon: ICONS.herb,
      desc: T('lvl_int_d') },
    { value: 'advanced',     label: 'Advanced',     icon: ICONS.brain,
      desc: T('lvl_adv_d') },
  ], { wide: true, chipIcons: true, forced: DBG.lvl });
  await sarah(T(`ack_${level}`), { typingMs: 1100 });
  setProgress(88, T('lbl_last_step'));

  /* ---------- 9.1 · reading test, passage from the goal ---------- */
  reach('reading');
  await sarah(ACT_INTRO);
  await sticker('question');
  const card = readAloudCard();
  $('micTip').textContent = T('tap_speak');
  bottomBar.classList.add('gone');
  if (FF){
    card.querySelector('.said').textContent = PASSAGE[0] + PASSAGE[1];
    card.querySelector('.rest').textContent = '';
  } else {
    await readingInteraction(card);
  }
  card.classList.add('done');
  await showToast(T('toast_title'), T('toast_sub'), FF ? 0 : 2200);
  setProgress(94, '94% completed');

  /* ---------- 9.2 · award + report ---------- */
  reach('award');
  await sarah(T('award_msg'), { typingMs: 1100 });
  const award = el(`<div class="award"><img src="assets/award-trophy.png" alt="Google Play’s Best AI App 2023"></div>`);
  chatStream.appendChild(award);
  scrollToEnd();
  await wait(900);
  setProgress(98, '98% completed');
  await sarah(T('report_q'));
  setProgress(100, '100% completed');
  const cta = el(`<button class="btn-report">${T('report_cta')}</button>`);
  chatStream.appendChild(cta);
  scrollToEnd();
  if (!FF) await new Promise(r => cta.addEventListener('click', r, { once: true }));

  /* ---------- 9.3 – 9.7 · takeovers ---------- */
  await hintSequence(level);
  await paywallSequence(goal === 'exam' && exam === 'ielts' ? 'ielts' : goal);
  await giftSequence();
  await offerSequence();
}

flow();
