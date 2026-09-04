/* ============================================================
   Stimuler · review rig — the flow panel, the transport, and the
   ghost user. Loads after app.js (classic scripts share top-level
   bindings) and self-starts; the shipped app never needs it, it
   only wakes with the panel or ?auto=1.
   ============================================================ */

'use strict';

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
  /* the seam after they submit: the mic becomes a loader and the words
     score one by one. Everything from instant to awful has to read. */
  fill('dpLat', [
    ['0',    'Instant',   'no wait at all'],
    ['1400', 'Typical',   '1.4s \u00b7 default'],
    ['3000', 'Slow',      '3s'],
    ['5000', 'Worst case', '5s'],
    ['9000', 'Awful',     '9s'],
  ], 'lat');

  fill('dpLangs', DP_LANGS, 'lang');

  /* branch auto-runs: one play per branch. It reloads at the very
     start with auto=1 and plays itself through to the offer paywall,
     honouring whatever level / outcome / path is selected above. */
  const runBox = $('dpRuns');
  if (runBox){
    const runs = [{ label: 'Manual', patch: {}, manual: true },
                  { label: 'Exam · IELTS', patch: { goal: 'exam', exam: 'ielts' } }];
    C.branches().forEach(br => {
      if (br.skipped) return;
      runs.push({ label: br.label, patch: { goal: br.goal, sit: br.sit || null } });
    });
    const QPnow = new URLSearchParams(location.search);
    const isRun = (r) => {
      if (r.manual) return !AUTO;
      if (!AUTO) return false;
      if ((QPnow.get('goal') || null) !== (r.patch.goal || null)) return false;
      if ((QPnow.get('sit')  || null) !== (r.patch.sit  || null)) return false;
      return (QPnow.get('exam') || null) === (r.patch.exam || null);
    };
    runs.forEach(r => {
      const b = document.createElement('button');
      b.textContent = r.label;
      if (r.manual) b.classList.add('manual');
      if (isRun(r)) b.classList.add('active');
      b.addEventListener('click', () => {
        const p = new URLSearchParams(location.search);
        ['step', 'cohort', 'exam'].forEach(k => p.delete(k));
        r.manual ? p.delete('auto') : p.set('auto', '1');
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
    let navving = false;                  /* one reload at a time — double taps double-reloaded */
    const jump = (delta) => {
      if (navving) return;
      navving = true;
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
    setTimeout(dock, 600);                 /* fonts and the panel shift the mockup after first paint */
    setTimeout(dock, 1600);
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
        if (navving) return;
        navving = true;
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

/* ============================================================
   AUTO-PILOT — a ghost user for branch review. The funnel runs in
   its normal, fully interactive mode; this drives it: finds
   whatever is waiting for a tap, floats the tap signifier over to
   it, presses, and lets the real animations play.
   ============================================================ */
async function autoPilot(){
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  await sleep(1200);
  const tap = el(`<div class="auto-tap" hidden><i></i>
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 7c0-2.2 1.8-4 4-4s4 1.8 4 4v13.4l6.4 1.7c2.7.7 4.6 3.1 4.6 5.9 0 .7-.1 1.4-.3 2l-2.4 7.2c-.8 2.4-3 4-5.5 4h-8.6c-1.9 0-3.7-.9-4.8-2.5l-6.6-9.4c-1-1.4-.8-3.4.5-4.6 1.2-1.1 3.1-1.2 4.4-.1l4.3 3.4V7Z" fill="#FFFFFF" stroke="#14121A" stroke-width="2.6" stroke-linejoin="round"/>
    </svg></div>`);
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
      /* rows first — the under-list link can be a prototype dead-end
         ("Select some other language"), and a dead link taps forever */
      const pick = btns.find(b => desired.has(b.dataset.val))
        || btns.find(b => b.dataset.def)
        || (link && desired.has('en') ? link : null)
        || btns[0];
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
      await typeInto(nf, DBG.name || 'Lena');
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

if (AUTO) autoPilot();
