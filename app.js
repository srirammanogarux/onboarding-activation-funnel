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
  auto:   QP.get('auto') === '1',       /* auto-play the whole funnel */
  path:   QP.get('path') || '',            /* hint|impromptu — forces the int/adv branch */
  goal:   QP.get('goal') || (COHORT ? COHORT.goal : 'career'),
  exam:   QP.get('exam') || (COHORT ? COHORT.exam : 'ielts'),
  sit:    QP.get('sit')  || (COHORT && COHORT.sit ? COHORT.sit : 'Working professional'),
  cohort: COHORT ? COHORT.id : '',
  perf:   QP.get('perf') || '',
  /* which of the work scenarios they pick. It decides the plan card's
     FOCUS row, the first session line and the recap, so it needs to be
     switchable when reviewing the cohort. */
  focus:  QP.get('focus') || '',
};
const AUTO = DBG.auto;
let FF = DBG.step !== 'intro';   // AUTO with a step target fast-forwards to it, then plays live
function reach(key){ window.__curStep = key; if (DBG.step === key) FF = false; }

/* The exam sub-tree is gone from this list: a career learner never
   reaches it, and leaving dead chips in a review panel wastes the
   reviewer's time. It comes back when the exam cohort is tuned. */
const DP_STEPS = [
  ['intro', 'Intro'], ['language', 'Native language'], ['applang', 'App language'],
  ['name', 'Name'], ['phone', 'Phone'], ['source', 'Heard from'],
  ['age', 'Age'], ['gender', 'Gender'], ['goal', 'Goal'],
  ['situation', 'Situation'], ['scenarios', 'Focus'],
  ['testimonials', 'Testimonials'], ['level', 'Level'], ['award', 'Award'],
  ['planbuild', 'Plan'], ['stage', 'Reading 1'], ['read2', 'Reading 2'], ['echo', 'Reading 3'],
  ['act', 'Question'], ['analysing', 'Analysing'], ['scorecard', 'Score report'],
  ['framework', '4-part answer'], ['readstate', 'Read it aloud'], ['survey', 'Plan loader'],
  ['meter', 'Speech meter'], ['fix', 'Fix pronunciation'],
  ['practice', 'Practice'], ['paywall', 'Graph → Paywall'], ['gift', 'Gift'], ['offer', 'Offer paywall'],
];
/* the workplace scenario list, which is what this cohort actually picks from */
const DP_FOCUS = (((C.SCENARIOS.career || {}).byMode || {}).office || {}).items || [];
const DP_LANGS = [['en','English'], ...C.LANGUAGES.map(l => [l.value, l.label])];
const DP_LVLS  = [['beginner','Beginner'],['intermediate','Intermediate'],['advanced','Advanced']];

/*
  The review panel is scoped to ONE cohort: Career x Working a job.
  It used to list twelve branches, seven situations and every cohort at
  once, which is a map of the whole product rather than a tool for
  reviewing the one flow that is actually tuned. Everything here answers
  "what does this cohort look like if I change one thing".
*/
function buildDevPanel(){
  const go = (patch) => {
    const p = new URLSearchParams(location.search);
    Object.entries(patch).forEach(([k, v]) => (v === null ? p.delete(k) : p.set(k, v)));
    /* This cohort is the default, not a cage: set it when nothing is
       set, but never drag a reviewer back off another goal mid-review. */
    if (!p.get('goal')) p.set('goal', 'career');
    if (!p.get('sit'))  p.set('sit', 'Working professional');
    p.delete('cohort');
    location.search = p.toString();
  };
  const fill = (elId, pairs, param, opts = {}) => {
    const box = $(elId);
    if (!box) return;
    pairs.forEach(([val, label, sub]) => {
      const b = document.createElement('button');
      b.innerHTML = sub ? `${label}<i>${sub}</i>` : label;
      if (String(DBG[param]) === String(val)) b.classList.add('active');
      b.addEventListener('click', () => go({ [param]: val }));
      box.appendChild(b);
    });
    if (opts.clear){
      const b = document.createElement('button');
      b.className = 'dp-clear';
      b.textContent = opts.clear;
      if (!DBG[param]) b.classList.add('active');
      b.addEventListener('click', () => go({ [param]: null }));
      box.appendChild(b);
    }
  };

  fill('dpSteps', DP_STEPS, 'step');

  /* focus: the six things they can pick at work. Whichever is chosen
     becomes picked[0], so it lands in the plan card and the first
     session line. */
  fill('dpFocus', DP_FOCUS.map((it, i) => [String(i), `${it.e} ${it.label}`]), 'focus',
       { clear: 'Default (first two)' });

  /* A slip stops the run there and sends them to the meter, then into
     pronunciation practice built from the sentence that broke. A clean
     run walks past the meter to the paywall. */
  fill('dpPerf', [
    ['weak',    'Slips on sentence 1'],
    ['mid',     'Slips on sentence 2'],
    ['midhigh', 'Slips on sentence 3'],
    ['strong',  'Clean run', 'no practice'],
  ], 'perf', { clear: 'Follow level' });

  fill('dpLvls',  DP_LVLS,  'lvl');
  fill('dpPath', [['impromptu', 'Answers impromptu'], ['hint', 'Uses the hint']], 'path',
       { clear: 'Let it play out' });
  fill('dpLangs', DP_LANGS, 'lang');

  /* branch auto-runs: one play per branch. It reloads at the very
     start with auto=1 and plays itself through to the offer paywall,
     honouring whatever level / outcome / path is selected above. */
  const runBox = $('dpRuns');
  if (runBox){
    const runs = [{ label: 'Current setup', patch: {} },
                  { label: 'Exam · IELTS', patch: { goal: 'exam', exam: 'ielts' } }];
    C.branches().forEach(br => {
      if (br.skipped) return;
      runs.push({ label: br.label, patch: { goal: br.goal, sit: br.sit || null } });
    });
    runs.forEach(r => {
      const b = document.createElement('button');
      b.textContent = r.label;
      b.addEventListener('click', () => {
        const p = new URLSearchParams(location.search);
        ['step', 'cohort'].forEach(k => p.delete(k));
        p.set('auto', '1');
        Object.entries(r.patch).forEach(([k, v]) => (v == null ? p.delete(k) : p.set(k, v)));
        if (!p.get('lang')) p.set('lang', 'en');
        location.search = p.toString();
      });
      runBox.appendChild(b);
    });
  }

  if (AUTO){
    /* transport: replay · back · pause/play · forward, docked by the phone */
    const STEP_KEYS = DP_STEPS.map(([k]) => k);
    const jump = (delta) => {
      const cur = window.__curStep || 'intro';
      const i = Math.max(0, STEP_KEYS.indexOf(cur));
      const next = STEP_KEYS[Math.min(STEP_KEYS.length - 1, Math.max(0, i + delta))];
      const p = new URLSearchParams(location.search);
      p.set('auto', '1');
      next === 'intro' ? p.delete('step') : p.set('step', next);
      location.search = p.toString();
    };
    const I = {
      replay: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 2.6-6.3"/><path d="M5.5 2.5v3.6h3.6"/></svg>',
      back:   '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="5" width="2.6" height="14" rx="1"/><path d="M19 5.8v12.4a1 1 0 0 1-1.6.8l-8-6.2a1 1 0 0 1 0-1.6l8-6.2a1 1 0 0 1 1.6.8Z"/></svg>',
      pause:  '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1.4"/><rect x="14" y="5" width="4" height="14" rx="1.4"/></svg>',
      play:   '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 5.4v13.2a1 1 0 0 0 1.6.8l9.6-6.6a1 1 0 0 0 0-1.6L8.6 4.6A1 1 0 0 0 7 5.4Z"/></svg>',
      fwd:    '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="16.4" y="5" width="2.6" height="14" rx="1"/><path d="M5 5.8v12.4a1 1 0 0 0 1.6.8l8-6.2a1 1 0 0 0 0-1.6l-8-6.2A1 1 0 0 0 5 5.8Z"/></svg>',
    };
    const ctrls = el(`
      <div class="auto-ctrls">
        <button data-a="replay" title="Replay from the start">${I.replay}</button>
        <button data-a="back" title="Back one step">${I.back}</button>
        <button data-a="pause" title="Pause">${I.pause}</button>
        <button data-a="fwd" title="Forward one step">${I.fwd}</button>
      </div>`);
    document.body.appendChild(ctrls);
    /* dock OUTSIDE the mockup, hugging its left edge */
    const dock = () => {
      const ph = document.querySelector('.mockup') || $('phone');
      const r = ph.getBoundingClientRect();
      const left = r.left - 46 - 22;
      if (left < 6){
        ctrls.classList.add('row');
        ctrls.style.left = '10px';
        ctrls.style.top = '10px';
      } else {
        ctrls.classList.remove('row');
        ctrls.style.left = `${left}px`;
        ctrls.style.top = `${r.top + r.height / 2 - ctrls.offsetHeight / 2}px`;
      }
    };
    requestAnimationFrame(dock);
    window.addEventListener('resize', dock);
    ctrls.addEventListener('click', (ev) => {
      const b = ev.target.closest('button');
      if (!b) return;
      const a = b.dataset.a;
      if (a === 'pause'){
        window.__autoPaused = !window.__autoPaused;
        b.innerHTML = window.__autoPaused ? I.play : I.pause;
        b.title = window.__autoPaused ? 'Resume' : 'Pause';
        ctrls.classList.toggle('paused', window.__autoPaused);
        return;
      }
      if (a === 'replay'){
        const p = new URLSearchParams(location.search);
        p.set('auto', '1');
        p.delete('step');
        location.search = p.toString();
        return;
      }
      jump(a === 'back' ? -1 : 1);
    });

    const pill = el(`<div class="auto-pill">AUTO-RUNNING · tap to stop</div>`);
    document.body.appendChild(pill);
    pill.addEventListener('click', () => {
      if (window.__autoStop) window.__autoStop();
      const p = new URLSearchParams(location.search);
      p.delete('auto');
      location.search = p.toString();
    });
  }

  /* The other goals still run, they are just not tuned. Kept reachable
     so nothing is lost, and marked so nobody reviews them by accident. */
  const oBox = $('dpOther');
  if (oBox) [['exam','Exam'],['personal','Personal'],['school','School'],['travel','Travel']]
    .forEach(([goal, label]) => {
      const b = document.createElement('button');
      b.textContent = label;
      if (DBG.goal === goal) b.classList.add('active');
      b.addEventListener('click', () => {
        const p = new URLSearchParams(location.search);
        p.set('goal', goal); p.delete('cohort'); p.delete('focus');
        if (goal !== 'career') p.set('sit', 'Student');
        location.search = p.toString();
      });
      oBox.appendChild(b);
    });
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

function scrollToEnd(smooth = true){
  chatScroll.scrollTo({ top: chatScroll.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
}

function setProgress(pct, label){
  progressFill.style.width = pct <= 0 ? '16px' : `calc((100% - 16px) * ${pct/100} + 16px)`;
  if (label !== undefined) progressLabel.textContent = label;
}

/*
  earn(pct, label) — progress the user has not taken yet.

  The bar used to grow the moment Sarah ASKED, which meant that by the
  time the pips from a tapped option reached it there was nothing left
  for them to do. Anything set through earn() is held until the answer
  lands in the chat, so the width and the label arrive together with
  the pips and the bar reads as something you filled rather than
  something that was announced to you.
*/
let heldProgress = null;
function earn(pct, label){ heldProgress = [pct, label]; }
function releaseProgress(){
  if (!heldProgress) return;
  const [pct, label] = heldProgress;
  heldProgress = null;
  setProgress(pct, label);
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
async function sarah(text, { typingMs = 650, holdMs = 350, perWord = 130, quick = false } = {}){
  if (!FF) JUICE.setAmbient('thinking');
  if (quick){ perWord = 85; typingMs = Math.min(typingMs, 450); holdMs = 220; }
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
  JUICE.setAmbient('thinking');
  await wait(typingMs);
  JUICE.setAmbient('idle');
  const bubble = row.querySelector('.bubble');
  bubble.classList.remove('typing');
  bubble.innerHTML = `<p>${text}</p>`;
  row.classList.add('speaking');
  scrollToEnd();
  await wait(Math.max(1200, text.split(' ').length * perWord));
  row.classList.remove('speaking');
  JUICE.setAmbient('idle');
  await wait(holdMs);
  return row;
}

function userChip(text, icon = ''){
  releaseProgress();          /* the answer is in: the bar may grow */
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
      userChip(item.label, item.icon || '');
      resolve(item.value);
    };

    items.forEach(item => {
      /* No affordance for rows that open a sub-tree. In a conversation
         every answer leads somewhere; signposting which ones have a
         follow-up is a menu idiom and reads as a mis-set expectation. */
      const note = item.note ? `<span class="opt-note">${item.note}</span>` : '';
      const btn = el(item.desc
        ? `<button class="opt stacked" data-val="${item.value}"${item.defaultOnSkip ? ' data-def="1"' : ''}>
             <span class="opt-top">${item.icon ? `<span class="ico">${item.icon}</span>` : ''}<span class="opt-label">${item.label}</span></span>
             <span class="opt-desc">${item.desc}</span>
           </button>`
        : `<button class="opt" data-val="${item.value}"${item.defaultOnSkip ? ' data-def="1"' : ''}>
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
        /* the icon animates where it stands, then the row collapses into
           the chip and the icon carries on to the bar. One continuous move. */
        const ico = btn.querySelector('.ico');
        if (ico){
          ico.classList.add(item.anim || 'oa-bounce');
          /* the icon stays where it is; copies of it feed the bar */
          /* whatever the row actually shows is what sprays: flag, glyph, emoji */
          JUICE.pop(ico, { html: ico.innerHTML, n: 5, instant: FF });
        } else {
          JUICE.pop(btn, { emoji: '\u2726', n: 4, instant: FF });
        }
        /* the row holds until its icon has finished throwing the pips */
        setTimeout(() => finish(item), ico ? 560 : 240);
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

function multiSelect(items, { head = 'Select all that apply', cta = 'Continue', forced = null, icons = [] } = {}){
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

    items.forEach((label, i) => {
      const btn = el(`
        <button class="opt ms-opt">
          ${icons[i] ? `<span class="ico">${icons[i]}</span>` : ''}
          <span class="opt-label">${label}</span>
          <span class="ms-box">${TICK}</span>
        </button>`);
      btn.addEventListener('click', () => {
        const on = !chosen.has(label);
        if (on) chosen.add(label); else chosen.delete(label);
        btn.classList.toggle('on', on);
        const ico = btn.querySelector('.ico');
        if (on && ico){ ico.classList.remove('oa-bounce'); void ico.offsetWidth; ico.classList.add('oa-bounce'); }
        sync();
      });
      list.appendChild(btn);
    });

    cta_.addEventListener('click', () => {
      if (!chosen.size) return;                 /* minimum one */
      disarmSkip();
      wrap.remove();
      const picked = items.filter(i => chosen.has(i));   /* source order, not tap order */
      const first = items.indexOf(picked[0]);
      JUICE.pop(cta_, { emoji: icons[first] || '\u2726', n: 5, instant: FF });
      userChip(picked.length > 1 ? `${picked[0]} +${picked.length - 1}` : picked[0], icons[first] || '');
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
function railAutoSlide(rail, { interval = 3200, firstDelay = null, onActive = null } = {}){
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
  const step = () => {
    const next = (current() + 1) % cards.length;
    rail.scrollTo({ left: centreOf(cards[next]), behavior: 'smooth' });
  };
  let lead = null;
  const start = (delay = null) => {
    clearInterval(timer); clearTimeout(lead);
    const begin = () => { timer = setInterval(step, interval); };
    if (delay === null){ begin(); return; }
    lead = setTimeout(() => { step(); begin(); }, delay);
  };
  const pause = () => {
    clearInterval(timer); clearTimeout(lead); clearTimeout(resume);
    resume = setTimeout(() => start(), 4500);
  };
  rail.addEventListener('scroll', current, { passive: true });
  rail.addEventListener('pointerdown', pause);
  rail.addEventListener('wheel', pause, { passive: true });
  requestAnimationFrame(current);
  start(firstDelay);
  return () => { clearInterval(timer); clearTimeout(lead); clearTimeout(resume); };
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

async function testimonialCarousel(goal){
  const list = (C.TESTIMONIALS[goal] || C.TESTIMONIALS.career);
  const wrap = el(`<div class="testimonials"><div class="testimonial-rail"></div></div>`);
  const rail = wrap.querySelector('.testimonial-rail');
  list.forEach(t => rail.appendChild(el(`
    <div class="t-card">
      <img class="tc-photo" src="assets/people/${t.img}.jpg" alt="">
      <div class="tc-scrim"></div>
      <div class="tc-body">
        <p class="tc-quote">\u201C${t.q}\u201D</p>
        <i class="tc-rule"></i>
        <div class="tc-who"><b>${t.n}</b><span>${t.r}</span></div>
      </div>
    </div>`)));
  chatStream.appendChild(wrap);
  scrollToEnd();
  if (FF) return;

  /* It used to sit still for 3.4s before the first move, which reads as
     broken rather than paced. It steps off quickly, then settles into a
     slower rhythm you can actually read at. */
  railAutoSlide(rail, { firstDelay: 1300, interval: 3000 });
  await wait(3400);
}

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
/* The ladder, the flagged words and the hint flow are keyed to the
   GOAL chosen at stage 5. PRON_WORDS / HS_PASSAGE are re-pointed by
   the ladder to the sentence the user actually stumbled on (honesty
   rule); the R1 defaults below only serve deep links straight into
   fix/practice. */
let PASSAGE     = ['', ''];   /* legacy, unused */
let PRON_WORDS  = [];
let HS_PASSAGE  = '';
let ACT_INTRO   = '';
let ACT         = null;

function setActivation(goal){
  ACT = C.ACTIVATION[goal] || C.ACTIVATION.career;
  PRON_WORDS = ACT.ladder[0].words;
  HS_PASSAGE = ACT.ladder[0].text;
  ACT_INTRO  = ACT.intro;
}
setActivation(DBG.goal);   /* so deep links land on the right content */

/* outcome: how far up the ladder this user gets. Deterministic by
   level so demos are stable; ?perf= overrides; hint/skip forces weak. */
function ladderOutcome(level){
  if (['weak','mid','midhigh','strong'].includes(DBG.perf)) return DBG.perf;
  return { beginner:'weak', intermediate:'mid', advanced:'strong' }[level] || 'mid';
}

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
      JUICE.setAmbient('listening');
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
        JUICE.setAmbient('reward');
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
  JUICE.bokeh(18);
  await wait(holdMs);
  t.classList.add('leaving');
  await wait(400);
  t.remove();
}

/* ============================================================
   CONVICTION — Sarah-sent proof cards, the recap bubble, and the
   plan-build takeover that ends the chat. (Remy: rich cards inline;
   CRED/Freeletics: answers stack + checklist ticks.)
   ============================================================ */
function countUp(elm, to, dur = 1200){
  const t0 = performance.now();
  const fmt = (n) => n >= 1000000 ? (n / 1000000).toFixed(1).replace('.0','') + 'Mn+'
              : n >= 1000 ? Math.round(n / 1000) + 'k+' : String(n);
  const step = (now) => {
    const k = Math.min(1, (now - t0) / dur);
    elm.textContent = fmt(Math.round(to * (1 - Math.pow(1 - k, 3))));
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/* one bubble does all of it: her sentence carries the claim, and the three
   numbers underneath count up one after another without moving the layout. */
async function proofCard(){
  const P = C.PROOF, M = P.metric;
  dimPreviousSarah();
  const row = el(`
    <div class="msg">
      <div class="dp"><img src="${SARAH}" alt="Sarah"></div>
      <div class="bubble">
        <p>You're in the right place. Learners here report feeling
           <em class="pf-hi">${M.value}${M.unit} more confident</em> speaking within a month.</p>
        <span class="pf-stats">
          <span class="pf-item"><b class="pf-n gold" data-to="${P.global.stars}" data-dec="1">0.0</b><i class="pf-star">\u2605</i></span>
          <i class="pf-dot"></i>
          <span class="pf-item"><b class="pf-n" data-to="${P.global.ratings}" data-fmt="big">0</b>ratings</span>
          <i class="pf-dot"></i>
          <span class="pf-item"><b class="pf-n" data-to="${P.global.countries}" data-suf="+">0</b>countries</span>
        </span>
      </div>
    </div>`);
  chatStream.appendChild(row);
  scrollToEnd();

  const cells = [...row.querySelectorAll('.pf-n')];
  if (FF){ cells.forEach(b => b.textContent = fmtStat(b)); return; }

  /* they land one at a time, left to right, each with a small pop */
  await wait(520);
  for (const b of cells){
    await runFor(620, k => { b.textContent = fmtStat(b, 1 - Math.pow(1 - k, 3)); });
    b.classList.add('done');
    await wait(150);
  }
  await wait(700);
}

/* format one stat cell at progress e (1 = final) */
function fmtStat(b, e = 1){
  const to = parseFloat(b.dataset.to), v = to * e;
  if (b.dataset.dec) return v.toFixed(+b.dataset.dec);
  if (b.dataset.fmt === 'big')
    return v >= 1000000 ? (v/1000000).toFixed(v>=10000000?0:1).replace('.0','') + 'Mn+'
         : v >= 1000 ? Math.round(v/1000) + 'k+' : String(Math.round(v));
  return Math.round(v) + (b.dataset.suf || '');
}

/* drive a callback across dur ms, resolve on the last frame */
function runFor(dur, fn){
  return new Promise(res => {
    const t0 = performance.now();
    const step = now => {
      const k = Math.min(1, (now - t0) / dur);
      fn(k);
      if (k < 1) requestAnimationFrame(step); else res();
    };
    requestAnimationFrame(step);
  });
}

/* the faces widget: the outcome claim, then who else is doing this.
   Lives inside Sarah's own bubble so it reads as her speaking, not a card. */
async function goalProofCard(goal){
  const o = C.OUTCOME[goal], p = C.PROOF.byGoal[goal];
  if (!o || !p) return;
  const claim = o.claim.replace(o.hi, `<em>${o.hi}</em>`);
  const faces = ['avatar-syahrier.png','avatar-t2.png','avatar-t3.png']
    .map(f => `<img src="assets/${f}" alt="">`).join('');
  dimPreviousSarah();
  const row = el(`
    <div class="msg">
      <div class="dp"><img src="${SARAH}" alt="Sarah"></div>
      <div class="bubble">
        <p class="gp-claim">${claim}</p>
        <span class="gp-faces">
          <span class="gp-av">${faces}</span>
          <span class="gp-line"><b>${Math.round(p.n/1000)}k+</b> ${o.who}<br>practising right now</span>
        </span>
      </div>
    </div>`);
  chatStream.appendChild(row);
  scrollToEnd();
  await wait(FF ? 0 : 1700);
}

/* Sarah replays their own answers as chips — personalization proof */
async function recapBubble(chips){
  dimPreviousSarah();
  const row = el(`
    <div class="msg">
      <div class="dp"><img src="${SARAH}" alt="Sarah"></div>
      <div class="bubble"><p>${T('recap_lead')}</p>
        <span class="recap-chips">${chips.filter(Boolean).map(c => `<i>${c}</i>`).join('')}</span>
      </div>
    </div>`);
  chatStream.appendChild(row);
  scrollToEnd();
  await wait(FF ? 0 : 1700);
}

/* notification ask as a Remy-style permission moment: a card with a
   bell and a toggle that grants itself — satisfying, not a dialog */
function permissionCard(){
  /* the real thing: a system alert over a dimmed chat, Allow / Don't Allow */
  const alertEl = el(`
    <div class="ios-alert-wrap">
      <div class="ios-alert">
        <div class="ia-head">
          <p class="ia-title">\u201CStimuler\u201D Would Like to Send You Notifications</p>
          <p class="ia-body">Notifications may include alerts, sounds and icon badges. These can be configured in Settings.</p>
        </div>
        <div class="ia-actions">
          <button class="ia-btn">Don\u2019t Allow</button>
          <button class="ia-btn bold">Allow</button>
        </div>
      </div>
    </div>`);
  $('phone').appendChild(alertEl);
  requestAnimationFrame(() => alertEl.classList.add('in'));
  return new Promise(resolve => {
    const done = () => {
      alertEl.classList.remove('in');
      setTimeout(() => alertEl.remove(), 260);
      resolve();
    };
    if (FF){ done(); return; }
    alertEl.querySelectorAll('.ia-btn').forEach(b => b.addEventListener('click', done, { once: true }));
  });
}

/* Sarah flies between surfaces — the Remy continuity anchor */
function sarahFly(toEl){
  if (FF || !toEl) return;
  const from = [...chatStream.querySelectorAll('.msg .dp img')].pop();
  if (!from) return;
  const pr = $('phone').getBoundingClientRect();
  const fr = from.getBoundingClientRect();
  const tr = toEl.getBoundingClientRect();
  const fly = el(`<div class="sarah-fly"><img src="${SARAH}" alt=""></div>`);
  fly.style.left = (fr.left - pr.left) + 'px';
  fly.style.top = (fr.top - pr.top) + 'px';
  fly.style.width = fr.width + 'px';
  fly.style.height = fr.height + 'px';
  $('phone').appendChild(fly);
  toEl.style.opacity = '0';
  fly.animate([
    { transform: 'translate(0,0) scale(1)' },
    { transform: `translate(${tr.left - fr.left}px, ${tr.top - fr.top}px) scale(${tr.width / fr.width})` },
  ], { duration: 620, easing: 'cubic-bezier(.3,.7,.3,1)', fill: 'forwards' })
    .onfinish = () => { toEl.style.opacity = ''; fly.remove(); };
}

/* the chat's exit: their answers assemble into a plan */
async function planBuildSequence(answers, goal, name, firstLine){
  reach('planbuild');
  const P = (C.PLAN || {})[goal] || C.PLAN.career;

  $('pbSay').textContent      = T('pb_coach', name || '');
  $('pbKicker').textContent   = T('pb_kicker');
  $('pbTitle').innerHTML      = P.title;
  $('pbFirstLbl').textContent = T('pb_first');
  $('pbFirstVal').textContent = firstLine || P.first;
  $('pbCta').innerHTML        = T('pb_cta');
  $('pbNote').textContent     = '';

  const stack = $('pbStack');
  stack.innerHTML = '';
  answers.filter(a => a && a[1]).forEach(([k, v]) => {
    stack.appendChild(el(`<div class="pb-card"><small>${k}</small><b>${v}</b></div>`));
  });

  sarahFly($('pbAvatar').querySelector('img'));
  JUICE.setAmbient('reward');   /* the room resolves as the plan lands */
  showScreen('planBuildScreen');
  setTimeout(() => $('chatScreen').classList.add('is-hidden'), FF ? 0 : 500);
  if (!FF) JUICE.sweep();                      /* THE one ambient pass */

  /* Five beats, in reading order, each one opening the card a little
     further: the label, the headline, all four answers together, the
     first session, then the CTA last so the eye finishes where the
     thumb has to go. The four answers are one beat, not four — they
     are a single fact about the learner, read as a block. */
  const beats = [
    [$('pbCoach')],
    [document.querySelector('.pb-sheet')],   /* the card lands, empty */
    [$('pbKicker')],
    [$('pbTitle')],
    [...stack.children],
    [$('pbFirst')],
    [$('pbCta'), $('pbNote')],
  ].map(g => g.filter(Boolean)).filter(g => g.length);

  if (FF){
    beats.flat().forEach(b => b.classList.add('in'));
  } else {
    await wait(260);
    for (const group of beats){
      group.forEach(b => b.classList.add('in'));
      await wait(360);
    }
    await wait(200);
  }

  const cta = $('pbCta');
  if (!FF) await new Promise(r => cta.addEventListener('click', r, { once: true }));
  hideScreen('planBuildScreen');
  await wait(FF ? 0 : 500);
}


/* ============================================================
   SPEAKING STAGE — three sentences. The chat ends before this.
   Sentence 1: a simple affirmation.  Sentence 2: same spirit,
   harder words.  Sentence 3: sentence 2 again with its two hard
   words hidden, said from memory.
   Slip on any of them and the run STOPS there. Everyone lands on
   the speech meter; only a slip earns the pronunciation practice,
   and its two words come from the sentence that broke.
   Sarah has no voice here. She is chat only.
   ============================================================ */
const STG_BARS = 26;
let stgWaveT = null, stgHintT = null;

function stgBuildWave(){
  const wave = $('stgWave');
  if (!wave.children.length){
    for (let i = 0; i < STG_BARS; i++) wave.appendChild(document.createElement('i'));
  }
}
function stgStartWave(){
  const bars = [...$('stgWave').children];
  const mid = (STG_BARS - 1) / 2;
  stgWaveT = setInterval(() => {
    bars.forEach((b, i) => {
      const env = Math.exp(-Math.pow((i - mid) / (STG_BARS * 0.4), 2));
      b.style.height = `${4 + Math.random() * 28 * env}px`;
    });
  }, 90);
}
function stgStopWave(){
  clearInterval(stgWaveT);
  [...$('stgWave').children].forEach(b => b.style.height = '4px');
}

/* render a phrase as word spans. *starred* words become emphasis
   (semibold) words — and double as the sentence's drill pair. */
function stgRenderPhrase(text, gaps = []){
  const g = gaps.map(w => w.toLowerCase());
  $('stgText').innerHTML = text.split(' ').map(raw => {
    const em = /^\*.*\*[.,!?]?$/.test(raw.replace(/[.,!?]+$/, '') + (raw.match(/\*[.,!?]+$/) ? '*' : '')) || (raw.startsWith('*') && raw.includes('*', 1));
    const w = raw.replace(/\*/g, '');
    const clean = w.replace(/[.,!?\u2019']/g, '').toLowerCase();
    return `<span class="w${em ? ' em' : ''}${g.includes(clean) ? ' gap' : ''}">${w}</span>`;
  }).join(' ');
}
function stgWords(){ return [...$('stgText').querySelectorAll('.w')]; }

async function stgFillWords(signal){
  let prev = null;
  for (const sp of stgWords()){
    if (signal.cancelled) return;
    if (prev){ prev.classList.remove('now'); prev.classList.add('said'); }
    sp.classList.add('now');
    prev = sp;
    await wait(240);
  }
  if (prev && !signal.cancelled){ prev.classList.remove('now'); prev.classList.add('said'); }
}
function stgResetSaid(){
  stgWords().forEach(w => w.classList.remove('said', 'now'));
}

/* one mic turn on the stage: orb → waveform + words fill → ✓ */
function stageTurn(){
  return new Promise(resolve => {
    const mic = $('stgMic');
    $('stgMicRow').classList.remove('gone');
    mic.className = 'convmic idle';
    $('stgTip').classList.remove('hidden');
    $('stgTip').textContent = T('mic_tip_idle');

    const onOrbTap = () => {
      if (!mic.classList.contains('idle')) return;
      clearTimeout(stgHintT);
      JUICE.setAmbient('listening');
      $('stgMicRow').classList.add('stg-listen-glow');   /* Gemini input glow */
      $('stgTip').textContent = T('mic_tip_live');       /* nothing to declare */
      $('stgLine').classList.add('live');                /* now karaoke means something */
      mic.className = 'convmic expanded';
      stgStartWave();
      const signal = { cancelled: false };
      stgFillWords(signal);

      const cancel = $('stgCancel'), confirm = $('stgConfirm');
      const onCancel = () => {
        signal.cancelled = true;
        stgStopWave();
        confirm.removeEventListener('click', onConfirm);
        stgResetSaid();
        $('stgLine').classList.remove('live');
        $('stgTip').classList.remove('hidden');
        $('stgTip').textContent = T('mic_tip_idle');
        mic.className = 'convmic idle';
        JUICE.setAmbient('idle');
      };
      const onConfirm = async () => {
        signal.cancelled = true;
        stgStopWave();
        cancel.removeEventListener('click', onCancel);
        mic.removeEventListener('click', onOrbTap);
        skip.removeEventListener('click', onSkip);
        stgWords().forEach(w => { w.classList.remove('now'); w.classList.add('said'); });
        $('stgTip').classList.add('hidden');
        mic.className = 'convmic submitting';
        $('stgMicRow').classList.remove('stg-listen-glow');
        await wait(600);
        resolve('spoke');
      };
      cancel.addEventListener('click', onCancel, { once: true });
      confirm.addEventListener('click', onConfirm, { once: true });
    };

    const skip = $('stgSkip');
    const onSkip = () => {
      clearTimeout(stgHintT);
      mic.removeEventListener('click', onOrbTap);
      $('stgMicRow').classList.add('gone');
      resolve('skipped');            /* forces the weak path */
    };
    mic.addEventListener('click', onOrbTap);
    skip.addEventListener('click', onSkip, { once: true });
  });
}

/* the mic collapses into a green tick, in the same spot it lived in */
function stgTick(caption){
  const mic = $('stgMic'), row = $('stgMicRow');
  row.classList.remove('gone', 'stg-listen-glow');
  mic.classList.remove('gone');
  mic.className = 'convmic tick';
  const tip = $('stgTip');
  tip.textContent = caption;
  tip.classList.remove('hidden');
}

/* mark the sentence's two words amber on a stumble */
function stgFlagWords(words){
  const flag = words.map(w => w.w.toLowerCase());
  stgWords().forEach(sp => {
    const clean = sp.textContent.replace(/[.,!?]/g, '').toLowerCase();
    if (flag.includes(clean)) sp.classList.add('miss');
  });
}

/* the unified bar */
function bgBar(pct){ $('bgFill').style.width = `${pct}%`; }

/* ============================================================
   BEGINNER RUN — three escalating affirmations on one bar.
   Clear a state: everything flashes green, confetti grows each
   time, Sarah celebrates, then it resets for the next one.
   Slip on 1 or 2: amber state, then the meter and the drill.
   Slip on 3: the two words go quietly into their practice and
   the run still ends on a win. Clean run: straight through.
   ============================================================ */
async function stageLadder(goal, level, name, famFirst, exam){
  const perf = ['weak','mid','midhigh','strong'].includes(DBG.perf)
    ? DBG.perf
    : { beginner:'weak', intermediate:'mid', advanced:'strong' }[level] || 'mid';
  let failAt = { weak: 1, mid: 2, midhigh: 3, strong: 0 }[perf];

  const key = C.affirmKey(goal, famFirst, exam);
  const SET = C.AFFIRM3[key];
  const examName = { ielts:'IELTS', toefl:'TOEFL', toeic:'TOEIC', pte:'PTE' }[exam] || 'English';
  const fill = (t) => t.replace('{name}', name || 'friend').replace(/\{EXAM\}/g, examName);
  const screen = $('stageScreen');

  showScreen('stageScreen');
  setTimeout(() => $('chatScreen').classList.add('is-hidden'), FF ? 0 : 500);
  stgBuildWave();
  JUICE.setAmbient('idle');

  for (let i = 0; i < 3; i++){
    reach(['stage', 'read2', 'echo'][i]);
    const sen = SET[i];
    screen.classList.remove('win', 'amber');
    $('stgLine').classList.remove('win', 'live');
    $('stgSay').innerHTML = C.BG_LINES.inst[i];
    bgBar(i * 33 + 4);
    stgRenderPhrase(fill(sen.t), []);

    let turn = 'spoke';
    if (FF){
      stgWords().forEach(w => w.classList.add('said'));
    } else {
      turn = await stageTurn();
    }
    if (turn === 'skipped'){ failAt = i + 1; }

    if (failAt === i + 1){
      /* the drill pair is this sentence's two emphasised words */
      PRON_WORDS = sen.w;
      HS_PASSAGE = fill(sen.t).replace(/\*/g, '');

      if (i < 2){
        /* amber beat: the two words light up, then the meter */
        screen.classList.add('amber');
        $('stgLine').classList.remove('live');
        stgFlagWords(sen.w);
        $('stgSay').innerHTML = C.BG_LINES.slip;
        const mic = $('stgMic'), row = $('stgMicRow');
        row.classList.remove('gone', 'stg-listen-glow');
        mic.className = 'convmic go';
        const tip = $('stgTip');
        tip.textContent = C.BG_LINES.slipTip;
        tip.classList.remove('hidden');
        JUICE.setAmbient('idle');
        await wait(FF ? 0 : 2400);
        break;
      }

      /* slip on the last one: the win stands, the words go to practice */
      screen.classList.add('win');
      $('stgLine').classList.add('win');
      bgBar(100);
      $('stgSay').innerHTML = C.BG_LINES.slip3;
      stgTick(C.BG_LINES.done[2]);
      if (!FF) JUICE.confetti(60, 'burst');
      JUICE.setAmbient('idle');
      await wait(FF ? 0 : 2400);
      break;
    }

    /* the win beat — green everywhere, confetti louder each state */
    screen.classList.add('win');
    $('stgLine').classList.add('win');
    bgBar((i + 1) * 33 + (i === 2 ? 1 : 0));
    $('stgSay').innerHTML = C.BG_LINES.cheer[i].replace('{name}', name || 'friend');
    stgTick(C.BG_LINES.done[i]);
    JUICE.setAmbient('idle');
    if (!FF){
      JUICE.confetti([30, 60, 100][i], 'burst');
      if (i === 2) JUICE.bokeh(18);
    }
    await wait(FF ? 0 : (i === 2 ? 2300 : 1800));
  }

  hideScreen('stageScreen');
  await wait(FF ? 0 : 550);
  return failAt === 0 ? 'strong' : { 1:'weak', 2:'mid', 3:'midhigh' }[failAt];
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

/* --- meter flow: level meter → fix pronunciation → practice ---
   Everyone sees the meter. Only a slip continues past it: the fix and
   practice views are built from the sentence that actually broke, and
   a clean run walks straight out to the paywall.
   Interaction ported from usa-onboarding, restyled on our tokens. */
const HS_LEVELS = ['Proficient', 'Advanced', 'Upper intermediate', 'Intermediate', 'Beginner', 'Novice'];
const HS_CEFR   = { 'Proficient':'C2', 'Advanced':'C1', 'Upper intermediate':'B2', 'Intermediate':'B1', 'Beginner':'A2', 'Novice':'A1' };
const HS_POS    = [8, 25.5, 43, 60.5, 78, 95.5];
/* The run decides the placement, not what they claimed earlier in the
   chat. Three sentences clean puts you at Advanced and we aim at
   Proficient; slip on the second or third and you are Intermediate;
   slip on the very first, simplest line and you are a Beginner. The
   scores are chosen so the bubble parks on that label's dot. */
const OUTCOME_METER = {
  strong:  { name:'Advanced',     cefr:'C1', score:90, tgt:'Proficient', tgtScore:100 },
  midhigh: { name:'Intermediate', cefr:'B1', score:62, tgt:'Advanced',   tgtScore:90  },
  mid:     { name:'Intermediate', cefr:'B1', score:58, tgt:'Advanced',   tgtScore:90  },
  weak:    { name:'Beginner',     cefr:'A2', score:36, tgt:'Advanced',   tgtScore:90  },
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
        JUICE.confetti(26, 'burst');
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

/* Intermediate/advanced hint path: the meter quotes their own claim
   back at them, dips it a touch, and always continues into practice. */
const SELF_METER = {
  intermediate: { name:'Intermediate', cefr:'B1', score:56, tgt:'Advanced',   tgtScore:82 },
  advanced:     { name:'Advanced',     cefr:'C1', score:84, tgt:'Proficient', tgtScore:93 },
};

async function hintSequence(level, outcome = 'weak', adv = false){
  /* beginners: the meter reads the run. Adv-hint: it reads the claim. */
  const cfg = adv
    ? (SELF_METER[level] || SELF_METER.intermediate)
    : (OUTCOME_METER[outcome] || OUTCOME_METER.weak);
  buildMeter();
  $('hsPct').textContent = '0%';
  $('hsBub').style.top = '95.5%';
  /* localize the static hint-screen strings */
  $('hsSay').textContent = adv
    ? 'You used the hint, so I scored your reading on pronunciation first. Here is where you stand.'
    : (outcome === 'strong' ? T('hs_say_strong') : T('hs_say1'));
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
  $('hsSay').textContent = adv
    ? `You placed yourself at ${cfg.name}. Under pressure you came in just below it. That gap is the whole game.`
    : T('hs_say2', cfg.name, cfg.cefr);
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

  /* a clean run has nothing to fix, so it never sees practice */
  if (!adv && outcome === 'strong'){
    hideScreen('hintScreen');
    await wait(550);
    return;
  }

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

/* ============================================================
   INTERMEDIATE / ADVANCED — one real question (usa-onboarding's
   act → listen → analysing → score, and the hint path's
   framework → read → meter). Structure ported, styled on ours.
   ============================================================ */

/* one mic turn on the act screen: orb → listening bar → auto-stop */
function actTurn(){
  return new Promise(resolve => {
    const mic = $('actMic');
    mic.className = 'convmic idle';
    let autoT = null;
    const onTap = () => {
      if (!mic.classList.contains('idle')) return;
      JUICE.setAmbient('listening');
      $('actMicRow').classList.add('stg-listen-glow');
      $('actTip').textContent = "I'll stop on my own when you finish";
      $('actBulb').classList.remove('show');
      mic.className = 'convmic expanded';
      const wave = $('actWave');
      if (!wave.children.length){
        for (let i = 0; i < STG_BARS; i++) wave.appendChild(document.createElement('i'));
      }
      const bars = [...wave.children];
      const mid = (STG_BARS - 1) / 2;
      const wt = setInterval(() => {
        bars.forEach((b, i) => {
          const env = Math.exp(-Math.pow((i - mid) / (STG_BARS * 0.4), 2));
          b.style.height = `${4 + Math.random() * 28 * env}px`;
        });
      }, 90);
      const finish = () => {
        clearInterval(wt); clearTimeout(autoT);
        bars.forEach(b => b.style.height = '4px');
        $('actMicRow').classList.remove('stg-listen-glow');
        JUICE.setAmbient('idle');
        mic.className = 'convmic tick';
        $('actTip').textContent = 'Heard you';
        setTimeout(() => resolve('spoke'), 900);
      };
      autoT = setTimeout(finish, FF ? 100 : 5200);   /* auto-stop: the sim "hears" them finish */
      $('actConfirm').addEventListener('click', finish, { once: true });
      $('actCancel').addEventListener('click', () => {
        clearInterval(wt); clearTimeout(autoT);
        bars.forEach(b => b.style.height = '4px');
        $('actMicRow').classList.remove('stg-listen-glow');
        $('actTip').textContent = 'Answer in your own words';
        mic.className = 'convmic idle';
        JUICE.setAmbient('idle');
      }, { once: true });
    };
    mic.addEventListener('click', onTap);

    /* the bulb is the other exit */
    $('actBulb').addEventListener('click', () => {
      mic.removeEventListener('click', onTap);
      clearTimeout(autoT);
      resolve('hint');
    }, { once: true });
  });
}

/* the question screen. Resolves 'impromptu' | 'hint'. */
async function actSequence(key, level, ask){
  const sc = C.PRACTICE[key] || C.PRACTICE['career|other'];
  reach('act');
  $('actQ').textContent = `\u201C${sc.q}\u201D`;
  $('actTip').textContent = 'Answer in your own words';
  $('actBulb').hidden = false;
  $('actBulb').classList.remove('show');
  $('actBulbTip').textContent = level === 'advanced' ? 'See a model answer' : "Can't find words? Try this";
  $('actBulb').classList.remove('show');
  showScreen('actScreen');
  setTimeout(() => $('chatScreen').classList.add('is-hidden'), FF ? 0 : 500);
  /* the bulb only appears once they have sat with the question */
  const bulbT = setTimeout(() => $('actBulb').classList.add('show'), FF ? 100 : 5000);
  if (DBG.path === 'hint'){ clearTimeout(bulbT); await wait(FF ? 0 : 1200); hideScreen('actScreen'); await wait(550); return 'hint'; }
  if (FF){ clearTimeout(bulbT); hideScreen('actScreen'); return DBG.path === 'hint' ? 'hint' : 'impromptu'; }
  const turn = await actTurn();
  clearTimeout(bulbT);
  hideScreen('actScreen');
  await wait(550);
  return turn === 'hint' ? 'hint' : 'impromptu';
}

/* the analysing beat, then the four-bar score report */
const ANALYSING = [
  ['You spoke your very first sentence in English.', 1900],
  ['Analysing your speech.', 1300],
  ['Evaluating your grammar.', 1300],
  ['Evaluating your pronunciation.', 1300],
  ['Almost there.', 900],
];
const SCORE_BASE = { fluency: 64, vocabulary: 58, pronunciation: 61, grammar: 71 };
const SCORE_MSG = {
  fluency:       { weak:'Long pauses broke your answer up.',  mid:'You paused a few times mid-sentence.',  strong:'You kept going without stopping.' },
  vocabulary:    { weak:'You reached for the same few words.', mid:'Your words worked, but they repeated.', strong:'You reached for the right words.' },
  pronunciation: { weak:'Some words were hard to catch.',      mid:'A few sounds landed soft.',             strong:'You were easy to understand.' },
  grammar:       { weak:'Tenses slipped more than once.',      mid:'A couple of tense slips crept in.',     strong:'Your sentences held together.' },
};
const scoreBand = n => n >= 70 ? 'strong' : n >= 50 ? 'mid' : 'weak';

async function analysingSequence(){
  reach('analysing');
  showScreen('anaScreen');
  $('anaBar').style.width = '4%';
  for (let i = 0; i < ANALYSING.length; i++){
    $('anaLine').textContent = ANALYSING[i][0];
    $('anaBar').style.width = `${8 + (i + 1) / ANALYSING.length * 88}%`;
    await wait(FF ? 40 : ANALYSING[i][1]);
  }
  hideScreen('anaScreen');
  await wait(550);
}

async function scoreSequence(goal, famLabel){
  reach('scorecard');
  /* pronunciation is always the low bar — it is the thing this whole
     funnel diagnoses and fixes, so the report agrees with the story */
  const out = {};
  for (const k in SCORE_BASE) out[k] = Math.max(38, SCORE_BASE[k] - (k === 'pronunciation' ? 14 : 0));
  const overall = Math.round((out.fluency + out.vocabulary + out.pronunciation + out.grammar) / 4);
  const ORDER = ['vocabulary', 'grammar', 'pronunciation', 'fluency'];
  $('scCards').innerHTML = ORDER.map(k => {
    const band = scoreBand(out[k]);
    return `<div class="sc-card sc-${band}">
      <span class="sc-ring">${out[k]}</span>
      <span class="sc-txt"><b>${k.charAt(0).toUpperCase() + k.slice(1)}</b><span>${SCORE_MSG[k][band]}</span></span>
    </div>`;
  }).join('');
  $('scLine').innerHTML = famLabel
    ? `That was a real rep of <b>${famLabel}</b>. Imagine week three.`
    : 'That was a real rep. Imagine week three.';
  showScreen('scoreScreen');
  /* the gauge sweeps to the overall — 240° arc is ~419px long */
  await wait(FF ? 40 : 700);
  const arc = $('scArc');
  const t0 = performance.now(), dur = FF ? 60 : 1600, LEN = 419;
  await new Promise(res => {
    const step = now => {
      const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      $('scNum').textContent = Math.round(overall * e);
      arc.setAttribute('stroke-dasharray', `${LEN * overall / 100 * e} 500`);
      k < 1 ? requestAnimationFrame(step) : res();
    };
    requestAnimationFrame(step);
  });
  if (!FF) JUICE.confetti(40, 'burst');
  if (!FF) await new Promise(r => $('scGo').addEventListener('click', r, { once: true }));
  hideScreen('scoreScreen');
  await wait(550);
}

/* the 4-part framework walkthrough, then one read of it out loud */
async function frameworkSequence(key, level, name){
  const sc = C.PRACTICE[key] || C.PRACTICE['career|other'];
  reach('framework');
  $('fwScreen').classList.remove('done');
  $('fwEye').textContent = 'HOW TO ANSWER';
  $('fwTitle').textContent = 'A simple 4-part answer.';
  $('fwCard').classList.remove('readmode');
  $('fwCard').innerHTML = sc.steps.map((st, i) =>
    `<div class="fw-seg${i === 0 ? ' cur' : ' dim'}"><span class="st">${st}</span><p>${sc.parts[i]}</p></div>`).join('');
  $('fwFill').style.width = '6%';
  $('fwNext').textContent = 'Next';
  $('fwNext').parentElement.style.display = '';
  $('fwMicRow').classList.add('gone');
  showScreen('fwScreen');
  const segs = [...$('fwCard').children];
  for (let i = 0; i < 4; i++){
    segs.forEach((el, k) => {
      el.classList.toggle('cur', k === i);
      el.classList.toggle('dim', k > i);
    });
    $('fwFill').style.width = `${Math.max(6, i / 8 * 100)}%`;
    $('fwNext').textContent = i === 3 ? 'Read it aloud' : 'Next';
    if (FF) continue;
    await new Promise(r => $('fwNext').addEventListener('click', r, { once: true }));
  }

  /* the reading state — same screen, usa-onboarding's read mode:
     eyebrow flips, the question becomes the title, the four parts
     collapse into one paragraph, and the mic appears */
  reach('readstate');
  $('fwEye').textContent = 'TRY READING THIS';
  $('fwTitle').textContent = `\u201C${sc.q}\u201D`;
  $('fwFill').style.width = '50%';
  $('fwNext').parentElement.style.display = 'none';
  $('fwCard').classList.add('readmode');
  $('fwCard').innerHTML = `<p class="fw-para">${sc.parts.join(' ').split(' ')
    .map(w => `<span class="w">${w}</span>`).join(' ')}</p>`;
  $('fwMicRow').classList.remove('gone');
  $('fwMic').className = 'convmic idle';
  $('fwTip').textContent = 'Tap the mic and read';
  $('fwTip').classList.remove('hidden');

  if (!FF){
    await new Promise(resolve => {
      const mic = $('fwMic');
      const words = [...$('fwCard').querySelectorAll('.w')];
      let iv = null, wv = null;
      const onTap = () => {
        if (!mic.classList.contains('idle')) return;
        mic.className = 'convmic expanded';
        $('fwTip').textContent = "I'll stop on my own when you finish";
        const wave = $('fwWave');
        if (!wave.children.length){
          for (let i = 0; i < STG_BARS; i++) wave.appendChild(document.createElement('i'));
        }
        const bars = [...wave.children], mid = (STG_BARS - 1) / 2;
        wv = setInterval(() => bars.forEach((b, i) => {
          const env = Math.exp(-Math.pow((i - mid) / (STG_BARS * 0.4), 2));
          b.style.height = `${4 + Math.random() * 28 * env}px`;
        }), 90);
        let n = 0;
        const done = () => {
          clearInterval(iv); clearInterval(wv);
          words.forEach(w => w.classList.add('g'));
          $('fwFill').style.width = '100%';
          resolve();
        };
        iv = setInterval(() => {
          if (n >= words.length) return done();
          words[n++].classList.add('g');
          $('fwFill').style.width = `${50 + n / words.length * 50}%`;
        }, 240);
        $('fwOk').addEventListener('click', done, { once: true });
        $('fwX').addEventListener('click', () => {
          clearInterval(iv); clearInterval(wv);
          words.forEach(w => w.classList.remove('g'));
          $('fwFill').style.width = '50%';
          $('fwTip').textContent = 'Tap the mic and read';
          mic.className = 'convmic idle';
        }, { once: true });
      };
      mic.addEventListener('click', onTap);
    });
  } else {
    [...$('fwCard').querySelectorAll('.w')].forEach(w => w.classList.add('g'));
    $('fwFill').style.width = '100%';
  }

  $('fwScreen').classList.add('done');
  $('fwMic').className = 'convmic tick';
  $('fwTip').textContent = 'That is the shape of it';
  if (!FF) JUICE.confetti(40, 'burst');
  await wait(FF ? 0 : 1600);
  hideScreen('fwScreen');
  await wait(550);
}

/* ============================================================
   PLAN LOADER — the ring builds the plan; anyone who did the
   pronunciation drill answers three questions on the way through.
   ============================================================ */
const LDR_STEPS = [
  'Reading your answers',
  'Matching content to your goal',
  'Weighing your speaking',
  'Shaping your roadmap',
];
const LDR_QS = [
  { q: null, opts: ['Too easy', 'Just right', 'Still tricky'] },   /* q filled with the drill words */
  { q: 'Did your score match how you think you speak?', opts: ['Spot on', 'Close', 'Harsher than I expected'] },
  { q: 'How do you feel about your starting score?', opts: ['Proud of it', "It's okay", 'I want it higher'] },
];
function ldrRing(pct){
  $('ldrArc').setAttribute('stroke-dasharray', `${440 * pct / 100} 440`);
  $('ldrPct').textContent = `${pct}%`;
}
function ldrStepState(states){
  [...$('ldrSteps').children].forEach((row, i) => {
    row.classList.toggle('done', states[i] === 'done');
    row.classList.toggle('on', states[i] === 'on');
  });
}
function ldrAsk(idx, q){
  return new Promise(resolve => {
    const card = $('ldrCard');
    card.innerHTML = `
      <span class="ldr-kicker">QUICK CHECK · ${idx + 1} OF 3</span>
      <span class="ldr-q">${q.q}</span>
      <div class="ldr-opts">${q.opts.map(o => `<button class="ldr-opt">${o}</button>`).join('')}</div>`;
    card.hidden = false;
    [...$('ldrDots').children].forEach((d, i) => d.classList.toggle('on', i === idx));
    $('ldrDots').hidden = false;
    requestAnimationFrame(() => requestAnimationFrame(() => card.classList.add('in')));
    if (FF){ SURVEY[idx] = q.opts[1]; card.classList.remove('in'); resolve(); return; }
    card.querySelectorAll('.ldr-opt').forEach(btn => btn.addEventListener('click', () => {
      btn.classList.add('sel');
      SURVEY[idx] = btn.textContent;
      setTimeout(() => { card.classList.remove('in'); resolve(); }, 550);
    }, { once: true }));
  });
}
const SURVEY = [];

function ldrQuote(q, idx){
  const star = '<svg width="15" height="15" viewBox="0 0 24 24"><path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5-5.9-3.2-5.9 3.2 1.2-6.5L2.5 9.4l6.6-.9z" fill="#D9A24A"/></svg>';
  const card = $('ldrCard');
  card.innerHTML = `
    <div class="ldr-stars">${star.repeat(5)}</div>
    <span class="ldr-quote">\u201C${q.q}\u201D</span>
    <span class="ldr-who">${q.n} \u00B7 ${q.r}</span>`;
  card.hidden = false;
  [...$('ldrDots').children].forEach((d, i) => d.classList.toggle('on', i === idx));
  $('ldrDots').hidden = false;
  requestAnimationFrame(() => requestAnimationFrame(() => card.classList.add('in')));
}

async function planLoader(didPron, goal){
  reach('survey');
  $('ldrSteps').innerHTML = LDR_STEPS.map(t => `
    <div class="ldr-step">
      <span class="ldr-ic"><i class="ic-pend"></i><i class="ic-arc"></i><i class="ic-done">
        <svg viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5" fill="none" stroke="#0D0B14" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </i></span><span>${t}</span>
    </div>`).join('');
  $('ldrCard').hidden = true;
  $('ldrCard').classList.remove('in');
  $('ldrDots').hidden = true;
  $('ldrArc').style.stroke = '';
  ldrRing(0);
  ldrStepState(['on', '', '', '']);
  showScreen('ldrScreen');
  await wait(FF ? 40 : 900);
  ldrRing(18);
  await wait(FF ? 40 : 1100);
  ldrStepState(['done', 'on', '', '']);
  ldrRing(34);

  if (didPron){
    /* Q1 names their own drill words */
    LDR_QS[0].q = `How did practicing \u201C${PRON_WORDS[0].w}\u201D and \u201C${PRON_WORDS[1].w}\u201D feel?`;
    await wait(FF ? 40 : 900);
    ldrStepState(['done', 'done', 'on', '']);
    ldrRing(45);
    for (let i = 0; i < 3; i++){
      await ldrAsk(i, LDR_QS[i]);
      ldrRing(45 + (i + 1) * 15);
      await wait(FF ? 30 : 500);
    }
    $('ldrCard').hidden = true;
    $('ldrDots').hidden = true;
  } else {
    /* no drill to ask about — testimonials ride in the card slot */
    const T3 = (C.TESTIMONIALS[goal] || C.TESTIMONIALS.personal || []).slice(0, 3);
    if (T3[0]) ldrQuote(T3[0], 0);
    await wait(FF ? 40 : 1600);
    ldrStepState(['done', 'done', 'on', '']);
    ldrRing(62);
    if (T3[1]){ $('ldrCard').classList.remove('in'); await wait(FF ? 0 : 350); ldrQuote(T3[1], 1); }
    await wait(FF ? 40 : 1600);
    ldrRing(84);
    if (T3[2]){ $('ldrCard').classList.remove('in'); await wait(FF ? 0 : 350); ldrQuote(T3[2], 2); }
    await wait(FF ? 40 : 1400);
    $('ldrCard').classList.remove('in');
    $('ldrCard').hidden = true;
    $('ldrDots').hidden = true;
  }

  ldrStepState(['done', 'done', 'done', 'on']);
  await wait(FF ? 40 : 1100);
  ldrStepState(['done', 'done', 'done', 'done']);
  $('ldrArc').style.stroke = 'var(--succ-300)';
  ldrRing(100);
  if (!FF) JUICE.confetti(30, 'burst');
  await wait(FF ? 60 : 1400);
  hideScreen('ldrScreen');
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
  document.querySelector('.gift-title').innerHTML = T('gift_title');
  document.querySelector('.gift-tap').textContent = T('gift_tap');
  set('.gc-txt small', T('welcome_offer'));
  document.querySelector('.offer-h').innerHTML = T('limited_time');
  document.querySelector('.op-pill').textContent = T('one_time_offer');
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

  /* state 4 — the graph gels into the paywall. The trail completes to
     the right edge so the fill has no cut edge once it is sitting
     behind the headline. */
  $('pwgReveal').style.width = '447px';
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
  if (!FF) JUICE.fireworks();
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
  if (!FF) JUICE.confetti(70, 'rain');
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
  await sticker('scooter');
  await wait(400);

  /* ---------- 1 · native language (global, Indonesia first) ---------- */
  reach('language');
  await sarah(T('lang_q'));
  setProgress(0, '0% completed');
  const lang = await options([
    ...C.LANGUAGES.map(l => ({
      value: l.value, label: l.label, icon: flag(l.flag),
      defaultOnSkip: l.value === 'id', e: '🌐', anim: 'oa-wave',
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
  const name = await nameInput();
  setProgress(15, T('lbl_coolname'));

  /* ---------- 2.2 · phone ---------- */
  reach('phone');
  await sarah(T('ack_name'));
  earn(23, '23% completed');
  await sarah(T('phone_q'));
  const phone = await phoneInput(L.flag, L.cc);

  /* ---------- 3 · heard from (India's flat list, unchanged) ---------- */
  reach('source');
  await sarah(phone ? T('source_thanks') : T('source_noproblem'));
  earn(30, '30% completed');
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
  await proofCard();                      /* conviction: you're in good company */
  await wait(200);

  /* ---------- 4 · age + gender (data capture only) ---------- */
  reach('age');
  await sarah(T('age_q'));
  await options([
    { value: 'u18',   label: 'Under 18',     icon: '🎒', e: '🎒', anim: 'oa-bounce' },
    { value: '18_24', label: '18 – 24',      icon: '🎓', e: '🎓', anim: 'oa-tilt' },
    { value: '25_34', label: '25 – 34',      icon: '💼', e: '💼', anim: 'oa-bounce', defaultOnSkip: true },
    { value: '35_44', label: '35 – 44',      icon: '🏡', e: '🏡', anim: 'oa-wave' },
    { value: '45p',   label: '45 and above', icon: '🧭', e: '🧭', anim: 'oa-spin' },
  ], { link: T('rather_not_say'), linkValue: 'na' });
  setProgress(42, '42% completed');

  reach('gender');
  await sarah(T('gender_q'));
  await options([
    { value: 'woman',  label: 'Woman',      icon: '🙋‍♀️', e: '🙋‍♀️', anim: 'oa-wave' },
    { value: 'man',    label: 'Man',        icon: '🙋‍♂️', e: '🙋‍♂️', anim: 'oa-wave', defaultOnSkip: true },
    { value: 'nonbin', label: 'Non-binary', icon: '🌈',   e: '🌈',   anim: 'oa-pulse' },
  ], { link: T('rather_not_say'), linkValue: 'na' });
  setProgress(46, T('lbl_plan'));
  await wait(300);

  /* ---------- 5 · goal — the only real fork ---------- */
  reach('goal');
  await sarah(T('goal_q'));
  const goal = await options(
    C.GOALS.map(g => ({
      value: g.value, label: g.label,
      icon: (C.GOAL_FX[g.value] || {}).e,
      defaultOnSkip: g.value === 'career',
      e: (C.GOAL_FX[g.value] || {}).e,
      anim: { exam:'oa-pulse', career:'oa-bounce', personal:'oa-wave',
              school:'oa-tilt', travel:'oa-tilt' }[g.value],
    })),
    { forced: DBG.goal });
  setActivation(goal);
  JUICE.tint(goal);          /* the room takes their colour */
  const goalLabel = (C.GOALS.find(g => g.value === goal) || {}).label;

  /* ---------- 5.2 – 5.5 · exam sub-tree (IELTS branches; the rest are noted) ---------- */
  let exam = null, examType = null, examDate = null, band = null;
  if (goal === 'exam'){
    reach('exam');
    await sarah(T('exam_q'));
    earn(50, '50% completed');
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
      earn(53, '53% completed');
      examType = await options(
        C.IELTS_TYPES.map(t => ({ value: t.value, label: t.label, desc: t.desc,
                                  defaultOnSkip: t.value === 'academic' })),
        { wide: true });

      reach('examdate');
      await sarah(T('exam_date_q'));
      earn(57, '57% completed');
      examDate = await options(
        C.examDateOptions().map(d => ({ value: d.value, label: d.label, note: d.note,
                                        defaultOnSkip: d.value === '2m' })));

      reach('band');
      await sarah(T('band_q'));
      earn(61, '61% completed');
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

  await goalProofCard(goal);             /* conviction: keyed to their goal */

  /* ---------- 6 · situation (profile only, no fork) ---------- */
  reach('situation');
  await sarah(T('situation_q'));
  earn(69, '69% completed');
  const situation = await options(
    C.SITUATIONS.map(s => ({ value: s, label: s,
      icon: C.SIT_FX[s], e: C.SIT_FX[s], anim: 'oa-bounce',
      defaultOnSkip: s === DBG.sit })),
    { chipIcons: true, forced: DBG.sit });

  /* ---------- 7 · scenarios — multi-select, keyed to goal ----------
     Exam cohorts skip this. Their scenario is already fixed — the test
     format is the format — and they have just answered three or four
     exam questions. Asking them to name which part of the test they
     are weakest at is asking them to do the assessment that stage 9
     does properly, objectively, a minute later.                      */
  const sc = C.scenarioSet(goal, situation);
  let picked = [];
  let famFirst = goal === 'exam' ? 'exam' : 'smalltalk';
  if (sc){
    reach('scenarios');
    await sarah(sc.prompt);
    earn(76, '76% completed');
    const labels = sc.items.map(i => i.label);
    /* ?focus= puts a specific scenario first, so a reviewer can see the
       plan card and the first-session line for any of them. */
    const fi = Number.isInteger(+DBG.focus) && DBG.focus !== '' && labels[+DBG.focus] ? +DBG.focus : 0;
    const forced = [labels[fi], labels[(fi + 1) % labels.length]];
    picked = await multiSelect(labels, { icons: sc.items.map(i => i.e || '🎯'), forced });
    /* THE FIRST TICK IS THE BRANCHING KEY — its family phrases the
       practice ask and the plan copy (usa-onboarding's rule) */
    famFirst = (sc.items.find(i => i.label === picked[0]) || {}).fam || famFirst;
    await sarah(T('scenarios_ack'), { typingMs: 900, quick: true });
    /* their own words, replayed — personalization proof for free */
    await recapBubble([
      goalLabel,
      exam === 'ielts' && band ? `IELTS · Band ${band.toFixed(1)}` : (exam ? exam.toUpperCase() : null),
      picked[0], picked.length > 1 ? `+${picked.length - 1} more` : null,
    ]);
  }

  /* ---------- 7b · social proof (text carousel) + notifications ---------- */
  reach('testimonials');
  setProgress(80, T('lbl_know_you'));
  await sarah(T('testi_lead'), { quick: true });
  await testimonialCarousel(goal);
  await sarah(T('testi_follow'), { quick: true });
  await sarah(T('notif_ask'));
  await permissionCard();
  await sarah(T('notif_ok'), { typingMs: 800, quick: true });
  setProgress(84, '84% completed');

  /* ---------- 8 · level ---------- */
  reach('level');
  await sarah(T('level_q'));
  const level = await options([
    { value: 'beginner',     label: 'Beginner',     icon: '🌱',
      desc: T('lvl_beg_d'), defaultOnSkip: true, e: '🌱', anim: 'oa-bounce' },
    { value: 'intermediate', label: 'Intermediate', icon: '🌿',
      desc: T('lvl_int_d'), e: '🌿', anim: 'oa-wave' },
    { value: 'advanced',     label: 'Advanced',     icon: '🌳',
      desc: T('lvl_adv_d'), e: '🌳', anim: 'oa-bounce' },
  ], { wide: true, chipIcons: true, forced: DBG.lvl });
  JUICE.deepen();            /* and deepens now that we know them */
  await sarah(T(`ack_${level}`), { typingMs: 1100 });
  setProgress(88, T('lbl_last_step'));

  /* ---------- 9.1 · award, then the chat ENDS ---------- */
  reach('award');
  await sarah(T('award_msg'), { typingMs: 1100 });
  const A = C.AWARD;
  const award = el(`
    <div class="award-card">
      <img class="aw-trophy" src="assets/paywall/trophy.png" alt="">
      <div class="aw-text">
        <span class="aw-kicker">${A.kicker}</span>
        <b class="aw-title">${A.title}</b>
        <span class="aw-line">${A.line}</span>
      </div>
    </div>`);
  chatStream.appendChild(award);
  scrollToEnd();
  if (!FF) requestAnimationFrame(() => award.classList.add('in'));
  await wait(FF ? 0 : 1100);
  setProgress(96, '96% completed');

  /* the handoff — the last thing the chat ever does. Beginners are
     promised a read; everyone else is promised one real question. */
  const askNoun = C.PRACTICE_ASK[famFirst] || 'everyday question';
  await sarah(level === 'beginner'
    ? T('stage_handoff')
    : `One last thing before your plan. You will answer one real ${askNoun} out loud, in about 20 seconds. Speak in your own words. There is no wrong answer.`);
  setProgress(100, '100% completed');
  bottomBar.classList.add('gone');
  const cta = el(`<button class="btn-report">${T('stage_cta')}</button>`);
  chatStream.appendChild(cta);
  scrollToEnd();
  if (!FF) await new Promise(r => cta.addEventListener('click', r, { once: true }));
  if (!FF) await wait(700);                     /* let the last star land */

  /* ---------- 9.2 · plan build — the chat's exit ---------- */
  await planBuildSequence([
    ['GOAL',     goalLabel],
    ['FOCUS',    picked[0] || null],
    ['LEVEL',    level.charAt(0).toUpperCase() + level.slice(1)],
    ['LANGUAGE', L.label],
  ], goal, name, picked[0] ? `${picked[0]}, out loud` : null);

  /* ---------- 9.3 · the speaking task, forked by level ----------
     Beginners read the affirmation ladder; the run decides their
     meter. Intermediate/advanced get one real question: answer it
     impromptu and see the score report, or take the hint and get the
     4-part model, one read, and the self-report meter + drill.     */
  let didPron = false;
  if (level === 'beginner'){
    const outcome = await stageLadder(goal, level, name, famFirst, exam);
    /* the meter only appears on the way into practice. A clean run and
       a last-sentence slip both walk straight on. */
    if (outcome === 'weak' || outcome === 'mid'){
      await hintSequence(level, outcome);
      didPron = true;
    }
  } else {
    const key = C.practiceKey(goal, situation, exam);
    const path = await actSequence(key, level, askNoun);
    if (path === 'impromptu'){
      await analysingSequence();
      await scoreSequence(goal, picked[0] || null);
    } else {
      await frameworkSequence(key, level, name);
      /* the drill words come from this cohort's model answer */
      /* PRONWORDS already resolves to WORD objects; reshape for the card */
      PRON_WORDS = (C.PRONWORDS[key] || C.PRONWORDS['career|other'])
        .map(w => ({ w: w.w, pre: w.parts[0], hot: w.parts[1], post: w.parts[2] || '', ph: w.ph, tip: w.tip, start: w.start }));
      HS_PASSAGE = (C.PRACTICE[key] || C.PRACTICE['career|other']).parts.join(' ');
      await hintSequence(level, 'weak', true);
      didPron = true;
    }
  }

  /* ---------- 9.4 · the plan builds; drill users answer for it ---------- */
  await planLoader(didPron, goal);

  /* ---------- 9.5 – 9.7 · money ---------- */
  await paywallSequence(goal === 'exam' && exam === 'ielts' ? 'ielts' : goal);
  await giftSequence();
  await offerSequence();
}

/* ============================================================
   AUTO-PILOT — a ghost user for branch review. The funnel runs in
   its normal, fully interactive mode; this drives it: finds
   whatever is waiting for a tap, floats the tap signifier over to
   it, presses, and lets the real animations play.
   ============================================================ */
async function autoPilot(){
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  await sleep(1200);
  const tap = el('<div class="auto-tap" hidden><i></i></div>');
  document.body.appendChild(tap);
  let stopped = false;
  window.__autoStop = () => { stopped = true; tap.remove(); };

  const vis = n => n && n.offsetParent !== null &&
    getComputedStyle(n).visibility !== 'hidden' &&
    !n.closest('.is-hidden') &&
    n.getBoundingClientRect().height > 0;
  const moveTo = async (n) => {
    const r = n.getBoundingClientRect();
    tap.hidden = false;
    /* appear just below the target, then glide the last stretch */
    if (!tap.classList.contains('show')){
      tap.style.transition = 'none';
      tap.style.left = `${r.left + r.width / 2}px`;
      tap.style.top  = `${r.top + Math.min(r.height - 16, Math.max(18, r.height / 2)) + 70}px`;
      void tap.offsetWidth;
      tap.style.transition = '';
    }
    tap.classList.add('show');
    tap.style.left = `${r.left + r.width / 2}px`;
    tap.style.top  = `${r.top + Math.min(r.height - 16, Math.max(18, r.height / 2))}px`;
    await sleep(640);
  };
  const lastPress = new Map();
  const press = async (n, mark = true) => {
    if (mark) n.dataset.ad = '1';
    await moveTo(n);
    tap.classList.add('press');
    await sleep(240);
    n.click();
    tap.classList.remove('press');
    await sleep(260);
    tap.classList.remove('show');    /* the finger lifts away */
    await sleep(160);
  };
  /* one-shot CTAs attach their listeners late (after their reveal
     animation), so a single press can land before anyone is
     listening. These are pressed with a cooldown and retried until
     their screen actually moves on. */
  const pressRetry = async (n, cdKey) => {
    const now = Date.now();
    if (now - (lastPress.get(cdKey) || 0) < 2800) return false;
    lastPress.set(cdKey, now);
    await press(n, false);
    return true;
  };
  const typeInto = async (input, text) => {
    input.dataset.ad = '1';
    await moveTo(input);
    tap.classList.add('press');
    await sleep(200);
    tap.classList.remove('press');
    tap.classList.remove('show');
    input.focus();
    for (const ch of String(text)){
      input.value += ch;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await sleep(90);
    }
    await sleep(350);
  };
  const q = (sel) => [...document.querySelectorAll(sel)].find(n => vis(n) && !n.dataset.ad);
  const desired = new Set([DBG.goal, DBG.lvl, DBG.lang, DBG.exam, DBG.sit,
                           DBG.exam === 'ielts' ? 'academic' : null]
                          .filter(Boolean).map(String));
  const mics = [['stgMic', 'stgConfirm'], ['actMic', 'actConfirm'], ['fwMic', 'fwOk']];
  const armed = {};

  while (!stopped){
    await sleep(430);
    if (window.__autoPaused || FF) continue;   /* paused, or still scrubbing in */
    const offer = $('offerScreen');
    if (offer && !offer.hidden && !offer.classList.contains('is-hidden')){ tap.hidden = true; break; }

    /* single-choice option groups — aim at the branch's own values */
    const grp = [...document.querySelectorAll('.options:not(.multi)')]
      .find(g => g.offsetParent && !g.dataset.ad && g.querySelector('.opt'));
    if (grp){
      const btns = [...grp.querySelectorAll('.opt')];
      const link = grp.querySelector('.opt-link');
      /* "Keep it in English" lives under the list as a link, not a row */
      const pick = btns.find(b => desired.has(b.dataset.val))
        || (link && desired.has('en') ? link : null)
        || btns.find(b => b.dataset.def) || btns[0];
      grp.dataset.ad = '1';
      await sleep(650);                       /* read the options first */
      await press(pick);
      continue;
    }

    /* multi-select: two ticks, then continue */
    const mgrp = [...document.querySelectorAll('.options.multi')]
      .find(g => g.offsetParent && !g.dataset.ad && g.querySelector('.ms-opt'));
    if (mgrp){
      mgrp.dataset.ad = '1';
      const opts = [...mgrp.querySelectorAll('.ms-opt')];
      await sleep(650);
      await press(opts[0]);
      if (opts[1]){ await sleep(160); await press(opts[1]); }
      const cta = mgrp.querySelector('.btn-continue');
      if (cta){ await sleep(320); await press(cta); }
      continue;
    }

    /* text fields */
    const nf = q('.name-field');
    if (nf){
      await typeInto(nf, DBG.name || 'Aarav');
      const btn = nf.closest('.input-block')?.querySelector('.btn-continue');
      if (btn) await press(btn);
      continue;
    }
    const pf = q('.phone-field-wrap input');
    if (pf){
      await typeInto(pf, '8123456789');
      const btn = pf.closest('.input-block')?.querySelector('.btn-continue');
      if (btn) await press(btn);
      continue;
    }

    /* the band slider ships with a ready continue */
    const bs = q('.band-block .btn-continue');
    if (bs){ await sleep(700); await press(bs); continue; }

    /* iOS notification alert */
    const allow = q('.ia-btn.bold');
    if (allow){ await press(allow); continue; }

    /* the hint bulb, when this run is a hint run */
    const bulb = $('actBulb');
    if (DBG.path === 'hint' && bulb && vis(bulb) && bulb.classList.contains('show') && !bulb.dataset.ad){
      await press(bulb);
      continue;
    }

    /* mics: tap to start, then stop once it has "heard enough" */
    let didMic = false;
    for (const [micId, okId] of mics){
      const mic = $(micId);
      if (!mic || !vis(mic)) continue;
      if (micId === 'actMic' && DBG.path === 'hint') continue;  /* waiting on the bulb */
      if (mic.classList.contains('idle')){
        await press(mic, false);
        armed[micId] = Date.now();
        didMic = true;
        break;
      }
      if (mic.classList.contains('expanded') && Date.now() - (armed[micId] || 0) > 3400){
        const ok = $(okId);
        if (ok && vis(ok)){ await press(ok, false); didMic = true; break; }
      }
    }
    if (didMic) continue;

    /* the word drill: tap to speak when the card is idle */
    const pc = $('pcBtn');
    if (pc && vis(pc) && !pc.classList.contains('listening') && !pc.classList.contains('done')){
      await press(pc, false);
      await sleep(2600);
      continue;
    }

    /* the survey cards in the loader — take the middle answer */
    const lo = document.querySelector('#ldrCard.in .ldr-opt:nth-child(2):not([data-ad])')
            || document.querySelector('#ldrCard.in .ldr-opt:not([data-ad])');
    if (lo && vis(lo)){ await sleep(500); await press(lo); continue; }

    /* the gift box wants a tap */
    const gift = $('giftScreen');
    if (gift && !gift.hidden && !gift.classList.contains('is-hidden')
        && !gift.classList.contains('open') && !gift.dataset.ad){
      await press($('giftClosed') || gift, false);
      gift.dataset.ad = '1';
      continue;
    }

    /* the 4-part framework's Next is pressed repeatedly */
    const fwNext = $('fwNext');
    if (fwNext && vis(fwNext) && fwNext.parentElement.style.display !== 'none'){
      await sleep(900);                       /* read the step */
      await press(fwNext, false);
      continue;
    }

    /* one-shot CTAs — retried on a cooldown because their listeners
       attach after reveal animations */
    let pressed = false;
    for (const sel of ['.btn-report', '#pbCta', '#hsNext', '#hsFix', '#scGo', '#hsGo']){
      const n = document.querySelector(sel);
      if (n && vis(n) && await pressRetry(n, sel)){ pressed = true; break; }
    }
    if (pressed) continue;

    /* the paywall close only listens once the graph has merged */
    const pw = $('paywallScreen');
    if (pw && !pw.hidden && !pw.classList.contains('is-hidden') && pw.classList.contains('merged')){
      const x = pw.querySelector('.pw-close');
      if (x && vis(x)) await pressRetry(x, 'pwclose');
      continue;
    }
  }
}

flow();
if (AUTO) autoPilot();
