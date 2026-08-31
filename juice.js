/* ============================================================
   Stimuler · Onboarding v2 — JUICE LAYER
   Every tap pays something back. Three tools, one file:

   1 · feedProgress(fromEl, emoji)  — a token flies from the tapped
       option into the progress bar; the bar gulps. (Promova's
       flag-into-slot, chat-sized.)
   2 · burst(el, emojis)            — a small emoji pop at the tap.
       dropRain(emojis)             — a themed full-width emoji rain
       for the big selections. (Honk RPS / customize pop.)
       bokeh()                      — rising golden particles for
       success beats. (Apple Messages "celebration".)
   3 · setAmbient(state)            — the background breathes with
       the conversation: idle · thinking · listening · reward.
       (Gemini response gradient.)

   All effects are non-blocking (the flow never awaits them) and
   disabled wholesale under prefers-reduced-motion.
   ============================================================ */

'use strict';

(function(){
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const phone = () => document.getElementById('phone');

  /* one fixed particle layer inside the phone, above screens */
  let layer = null;
  function getLayer(){
    if (!layer){
      layer = document.createElement('div');
      layer.className = 'fx-layer';
      phone().appendChild(layer);
    }
    return layer;
  }

  /* ---------- 1 · progress gulp ---------- */
  function feedProgress(fromEl, emoji){
    if (REDUCED || !emoji) return;
    const bar = document.getElementById('progressFill');
    if (!bar || !fromEl || !fromEl.isConnected) return;
    const pr = phone().getBoundingClientRect();
    const fr = fromEl.getBoundingClientRect();
    const br = bar.parentElement.getBoundingClientRect();

    const tok = document.createElement('span');
    tok.className = 'fx-token';
    tok.textContent = emoji;
    tok.style.left = (fr.left + 22 - pr.left) + 'px';
    tok.style.top  = (fr.top + fr.height / 2 - pr.top) + 'px';
    getLayer().appendChild(tok);

    const dx = (br.left + Math.min(br.width - 14, parseFloat(bar.style.width || '16') ) - pr.left) - (fr.left + 22 - pr.left);
    const dy = (br.top + br.height / 2 - pr.top) - (fr.top + fr.height / 2 - pr.top);

    /* arc: rise a little, then dive into the bar while shrinking */
    tok.animate([
      { transform: 'translate(0,0) scale(1)',                             opacity: 1 },
      { transform: `translate(${dx * .45}px, ${dy * .5 - 46}px) scale(1.25)`, opacity: 1, offset: .55 },
      { transform: `translate(${dx}px, ${dy}px) scale(.25)`,              opacity: 0 },
    ], { duration: 520, easing: 'cubic-bezier(.2,.7,.3,1)' })
      .onfinish = () => tok.remove();

    /* the bar gulps: springy overshoot */
    setTimeout(() => {
      bar.animate([
        { transform: 'scaleY(1)' },
        { transform: 'scaleY(1.9)', offset: .3 },
        { transform: 'scaleY(.85)', offset: .62 },
        { transform: 'scaleY(1)' },
      ], { duration: 420, easing: 'ease-out' });
    }, 430);
  }

  /* ---------- 2 · particles ---------- */
  function spawn(emoji, x, y, opts){
    const p = document.createElement('span');
    p.className = 'fx-p';
    p.textContent = emoji;
    p.style.left = x + 'px';
    p.style.top = y + 'px';
    p.style.fontSize = (opts.size || 18) + 'px';
    getLayer().appendChild(p);
    p.animate(opts.frames, { duration: opts.dur, easing: opts.easing || 'linear' })
      .onfinish = () => p.remove();
  }

  /* small pop from the tapped element — 4–6 particles arcing up */
  function burst(fromEl, emojis){
    if (REDUCED || !emojis || !emojis.length || !fromEl || !fromEl.isConnected) return;
    const pr = phone().getBoundingClientRect();
    const fr = fromEl.getBoundingClientRect();
    const x0 = fr.left + fr.width * .5 - pr.left;
    const y0 = fr.top + fr.height * .4 - pr.top;
    const n = 4 + Math.floor(Math.random() * 3);
    for (let i = 0; i < n; i++){
      const dx = (Math.random() - .5) * 120;
      const up = 50 + Math.random() * 60;
      const rot = (Math.random() - .5) * 120;
      spawn(emojis[i % emojis.length], x0, y0, {
        size: 15 + Math.random() * 8,
        dur: 620 + Math.random() * 180,
        easing: 'cubic-bezier(.2,.6,.4,1)',
        frames: [
          { transform: 'translate(0,0) scale(.4) rotate(0deg)', opacity: 0 },
          { transform: `translate(${dx * .5}px, ${-up}px) scale(1.1) rotate(${rot * .5}deg)`, opacity: 1, offset: .45 },
          { transform: `translate(${dx}px, ${-up * .25}px) scale(.9) rotate(${rot}deg)`, opacity: 0 },
        ],
      });
    }
  }

  /* themed rain for the big selections — Honk-lite, ~1.2s, 14 drops */
  function dropRain(emojis, n = 14){
    if (REDUCED || !emojis || !emojis.length) return;
    const pr = phone().getBoundingClientRect();
    for (let i = 0; i < n; i++){
      const x = 14 + Math.random() * (pr.width - 28);
      const drift = (Math.random() - .5) * 60;
      const rot = (Math.random() - .5) * 260;
      setTimeout(() => spawn(emojis[i % emojis.length], x, -30, {
        size: 20 + Math.random() * 12,
        dur: 950 + Math.random() * 350,
        easing: 'cubic-bezier(.4,.05,.7,.5)',   /* gravity-ish */
        frames: [
          { transform: 'translate(0,-10px) rotate(0deg)', opacity: 0 },
          { transform: `translate(${drift * .3}px, ${pr.height * .35}px) rotate(${rot * .5}deg)`, opacity: 1, offset: .35 },
          { transform: `translate(${drift}px, ${pr.height + 60}px) rotate(${rot}deg)`, opacity: .9 },
        ],
      }), Math.random() * 320);
    }
  }

  /* rising golden bokeh for success beats — premium, not clowny */
  function bokeh(n = 16){
    if (REDUCED) return;
    const pr = phone().getBoundingClientRect();
    for (let i = 0; i < n; i++){
      const x = Math.random() * pr.width;
      const s = 5 + Math.random() * 12;
      const p = document.createElement('span');
      p.className = 'fx-bokeh';
      p.style.left = x + 'px';
      p.style.top = (pr.height * .55 + Math.random() * pr.height * .45) + 'px';
      p.style.width = p.style.height = s + 'px';
      getLayer().appendChild(p);
      p.animate([
        { transform: 'translateY(0) scale(.5)', opacity: 0 },
        { opacity: .85, offset: .25 },
        { transform: `translateY(-${pr.height * .5 + Math.random() * 160}px) scale(1.15)`, opacity: 0 },
      ], { duration: 1700 + Math.random() * 900, easing: 'ease-out', delay: Math.random() * 500 })
        .onfinish = () => p.remove();
    }
  }

  /* ---------- 3 · ambient state machine ---------- */
  /* Two blurred blobs live in .ambient; states swap palette + energy.
     idle      — near-invisible indigo
     thinking  — cool indigo, slow morph (Sarah typing)
     listening — indigo pulse (mic open)
     reward    — gold sweep, decays back to idle on its own          */
  let ambientEl = null, decayT = null;
  function ambient(){
    if (!ambientEl){
      ambientEl = document.querySelector('.ambient');
      if (ambientEl && !ambientEl.querySelector('.amb-blob')){
        ambientEl.insertAdjacentHTML('beforeend',
          '<i class="amb-blob amb-a"></i><i class="amb-blob amb-b"></i>');
      }
    }
    return ambientEl;
  }
  function setAmbient(state){
    const a = ambient();
    if (!a) return;
    if (REDUCED) state = 'idle';
    clearTimeout(decayT);
    a.dataset.state = state;
    if (state === 'reward'){
      decayT = setTimeout(() => { a.dataset.state = 'idle'; }, 1600);
    }
  }

  window.JUICE = { feedProgress, burst, dropRain, bokeh, setAmbient };
})();
