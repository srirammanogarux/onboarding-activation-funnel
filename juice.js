/* ============================================================
   Stimuler · Onboarding v2 — JUICE v2
   Rebuilt after review. The rules:
   - Everything that flies LANDS somewhere and STAYS (star tray).
   - One voice per moment. No rains on menu taps.
   - Gold only when something is earned.
   - Confetti is a real canvas engine (ported from Activation v3's
     usaflow), not emoji spans.
   - All of it is non-blocking and dies under reduced motion.

   API:
   JUICE.star({emoji, big})   answer → gold star lands in the tray
   JUICE.trayToPlan(el)       tray stars fly down into the plan stack
   JUICE.confetti(n, mode)    'burst' | 'rain'
   JUICE.fireworks()          three staggered shell bursts
   JUICE.bokeh(n)             rising golden dots
   JUICE.sweep()              THE one ambient gradient pass
   JUICE.setAmbient(state)    idle | thinking | listening
   JUICE.wave(host, opts)     smooth reactive waveform → {stop()}
   ============================================================ */

'use strict';

(function(){
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const phone = () => document.getElementById('phone');

  /* ---------- shared layers ---------- */
  let layer = null;
  function getLayer(){
    if (!layer){
      layer = document.createElement('div');
      layer.className = 'fx-layer';
      phone().appendChild(layer);
    }
    return layer;
  }

  /* ============================================================
     1 · STAR TRAY — the destination that persists
     Six slots in the header. Each milestone answer pops off the
     user's chip, flies up as a gold star, and clicks into the
     next empty slot (slotPunch + ringPulse + barGlow — motion
     vocabulary lifted from conversation-lead-to-first-chat).
     ============================================================ */
  const STAR_PATH = 'M12 2.6l2.8 5.9 6.4.8-4.7 4.4 1.2 6.3L12 17l-5.7 3 1.2-6.3L2.8 9.3l6.4-.8z';
  const starSVG = (cls) =>
    `<svg class="${cls}" viewBox="0 0 24 24"><path d="${STAR_PATH}"/></svg>`;

  function tray(){ return document.getElementById('starsTray'); }
  function nextSlot(){
    const t = tray();
    return t ? t.querySelector('.star-slot:not(.filled)') : null;
  }

  function star({ emoji = '⭐', big = false, instant = false } = {}){
    const slot = nextSlot();
    if (!slot) return;
    if (REDUCED || instant){ slot.classList.add('filled'); barGlow(); return; }

    /* origin: the chip the user's answer just became */
    const chips = document.querySelectorAll('#chatStream .chip');
    const from = chips.length ? chips[chips.length - 1] : null;
    const pr = phone().getBoundingClientRect();
    const fr = (from || phone()).getBoundingClientRect();
    const sr = slot.getBoundingClientRect();
    const x0 = fr.left + Math.min(fr.width - 20, 24) - pr.left;
    const y0 = fr.top + fr.height / 2 - pr.top;

    /* beat 1 — the Honk pop: the answer's emoji lifts off the chip */
    const pop = document.createElement('span');
    pop.className = 'fx-pop';
    pop.textContent = emoji;
    pop.style.left = x0 + 'px';
    pop.style.top = y0 + 'px';
    getLayer().appendChild(pop);
    pop.animate([
      { transform: 'translateY(6px) scale(.4)',  opacity: 0 },
      { transform: 'translateY(-10px) scale(1.25)', opacity: 1, offset: .3 },
      { transform: 'translateY(-14px) scale(1)', opacity: 1, offset: .6 },
      { transform: 'translateY(-20px) scale(.85)', opacity: 0 },
    ], { duration: 520, easing: 'cubic-bezier(.25,.1,.25,1)' }).onfinish = () => pop.remove();

    /* beat 2 — a gold star arcs from the chip into the slot */
    const fly = document.createElement('span');
    fly.className = 'fx-star' + (big ? ' big' : '');
    fly.innerHTML = starSVG('sf');
    fly.style.left = x0 + 'px';
    fly.style.top = (y0 - 14) + 'px';
    getLayer().appendChild(fly);
    const dx = (sr.left + sr.width / 2 - pr.left) - x0;
    const dy = (sr.top + sr.height / 2 - pr.top) - (y0 - 14);
    fly.animate([
      { transform: 'translate(0,0) scale(.5) rotate(-30deg)', opacity: 0 },
      { transform: `translate(${dx * .35}px, ${dy * .45 - 30}px) scale(${big ? 1.5 : 1.15}) rotate(0deg)`, opacity: 1, offset: .45 },
      { transform: `translate(${dx}px, ${dy}px) scale(.62) rotate(20deg)`, opacity: 1 },
    ], { duration: 560, easing: 'cubic-bezier(.3,.6,.3,1)' }).onfinish = () => {
      fly.remove();
      /* beat 3 — the slot receives: punch + ring + the bar glows */
      slot.classList.add('filled', 'pop');
      if (big) slot.classList.add('twinkle');
      setTimeout(() => slot.classList.remove('pop', 'twinkle'), 1500);
      barGlow();
    };
  }

  function barGlow(){
    const bar = document.getElementById('progressFill');
    if (!bar) return;
    bar.classList.remove('glowing');
    void bar.offsetWidth;
    bar.classList.add('glowing');
  }

  /* tray stars fly down into the plan-build stack — the payoff */
  function trayToPlan(targetEl){
    const t = tray();
    if (!t || !targetEl || REDUCED) return;
    const pr = phone().getBoundingClientRect();
    const tr = targetEl.getBoundingClientRect();
    const filled = [...t.querySelectorAll('.star-slot.filled')];
    filled.forEach((slot, i) => {
      const sr = slot.getBoundingClientRect();
      const fly = document.createElement('span');
      fly.className = 'fx-star';
      fly.innerHTML = starSVG('sf');
      fly.style.left = (sr.left + sr.width / 2 - pr.left) + 'px';
      fly.style.top = (sr.top + sr.height / 2 - pr.top) + 'px';
      getLayer().appendChild(fly);
      const dx = (tr.left + tr.width * (0.2 + 0.12 * i) - pr.left) - (sr.left + sr.width / 2 - pr.left);
      const dy = (tr.top + 40 - pr.top) - (sr.top + sr.height / 2 - pr.top);
      fly.animate([
        { transform: 'translate(0,0) scale(.62)', opacity: 1 },
        { transform: `translate(${dx}px, ${dy}px) scale(.9)`, opacity: .9, offset: .8 },
        { transform: `translate(${dx}px, ${dy + 14}px) scale(.4)`, opacity: 0 },
      ], { duration: 640, delay: i * 70, easing: 'cubic-bezier(.4,.1,.4,1)' })
        .onfinish = () => fly.remove();
    });
  }

  /* ============================================================
     2 · CONFETTI ENGINE — ported from Activation v3 usaflow.js
     (burst + rain), extended with a fireworks mode. One canvas.
     ============================================================ */
  let confC = null, confCtx = null, confParts = [], confRaf = null;
  const COLS = ['#D9A24A', '#E7B455', '#6C63FF', '#9D96FF', '#F5F4FA', '#32E18D', '#B09CFF'];

  function canvas(){
    if (!confC){
      confC = document.createElement('canvas');
      confC.className = 'fx-canvas';
      phone().appendChild(confC);
      confCtx = confC.getContext('2d');
    }
    confC.width = phone().clientWidth;
    confC.height = phone().clientHeight;
    return confC;
  }

  function confetti(n = 60, mode = 'burst', origin = null){
    if (REDUCED) return;
    canvas();
    const rain = mode === 'rain';
    const ox = origin ? origin.x : confC.width / 2;
    const oy = origin ? origin.y : confC.height * 0.38;
    for (let i = 0; i < n; i++){
      confParts.push({
        kind: 'flake',
        x: rain ? Math.random() * confC.width : ox + (Math.random() - .5) * 120,
        y: rain ? -30 - Math.random() * confC.height * .6 : oy,
        vx: (Math.random() - .5) * (rain ? 2.4 : 9),
        vy: rain ? 2 + Math.random() * 3 : -4 - Math.random() * 7,
        g: rain ? .045 + Math.random() * .05 : .22 + Math.random() * .12,
        s: 6 + Math.random() * 7, ar: .5 + Math.random() * 1.4,
        r: Math.random() * Math.PI, vr: (Math.random() - .5) * .35,
        sway: rain ? .6 + Math.random() * 1.6 : 0, ph: Math.random() * 6.28,
        c: COLS[i % COLS.length], life: 1, decay: rain ? .0058 : .012,
      });
    }
    if (!confRaf) confTick();
  }

  /* fireworks: three staggered shells of streaking sparks */
  function fireworks(){
    if (REDUCED) return;
    canvas();
    const shells = [
      { x: confC.width * .3,  y: confC.height * .30, d: 0 },
      { x: confC.width * .72, y: confC.height * .22, d: 380 },
      { x: confC.width * .5,  y: confC.height * .40, d: 760 },
    ];
    shells.forEach(sh => setTimeout(() => {
      const N = 26;
      for (let i = 0; i < N; i++){
        const a = (i / N) * Math.PI * 2 + Math.random() * .2;
        const sp = 3.2 + Math.random() * 2.6;
        confParts.push({
          kind: 'spark',
          x: sh.x, y: sh.y, px: sh.x, py: sh.y,
          vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
          g: .055, c: COLS[i % COLS.length], life: 1, decay: .016,
        });
      }
      if (!confRaf) confTick();
    }, sh.d));
  }

  function confTick(){
    confCtx.clearRect(0, 0, confC.width, confC.height);
    confParts = confParts.filter(p => p.life > 0);
    confParts.forEach(p => {
      if (p.kind === 'spark'){
        p.px = p.x; p.py = p.y;
        p.x += p.vx; p.y += p.vy;
        p.vx *= .985; p.vy = p.vy * .985 + p.g;
        p.life -= p.decay;
        confCtx.globalAlpha = Math.max(0, p.life);
        confCtx.strokeStyle = p.c;
        confCtx.lineWidth = 2;
        confCtx.beginPath();
        confCtx.moveTo(p.px, p.py);
        confCtx.lineTo(p.x, p.y);
        confCtx.stroke();
      } else {
        p.x += p.vx + (p.sway ? Math.sin(p.ph += .045) * p.sway * .45 : 0);
        p.y += p.vy; p.vy += p.g; p.r += p.vr; p.life -= p.decay;
        confCtx.save();
        confCtx.translate(p.x, p.y);
        confCtx.rotate(p.r);
        confCtx.globalAlpha = Math.max(0, Math.min(1, p.life * 1.6));
        confCtx.fillStyle = p.c;
        confCtx.fillRect(-p.s / 2, -p.s * p.ar / 2, p.s, p.s * p.ar);
        confCtx.restore();
      }
    });
    confCtx.globalAlpha = 1;
    confRaf = confParts.length ? requestAnimationFrame(confTick) : null;
  }

  /* ---------- rising golden bokeh (kept from v1) ---------- */
  function bokeh(n = 16){
    if (REDUCED) return;
    const pr = phone().getBoundingClientRect();
    for (let i = 0; i < n; i++){
      const p = document.createElement('span');
      p.className = 'fx-bokeh';
      const s = 5 + Math.random() * 12;
      p.style.left = (Math.random() * pr.width) + 'px';
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

  /* ============================================================
     3 · AMBIENT — quiet states + THE one sweep
     thinking/listening are barely-there indigo breaths. sweep()
     is the single Gemini-style gradient pass, fired once, at the
     personalization peak. Gold appears only there.
     ============================================================ */
  let ambientEl = null;
  function ambient(){
    if (!ambientEl){
      ambientEl = document.querySelector('.ambient');
      if (ambientEl && !ambientEl.querySelector('.amb-blob')){
        ambientEl.insertAdjacentHTML('beforeend',
          '<i class="amb-blob amb-a"></i><i class="amb-blob amb-b"></i><i class="amb-sweep"></i>');
      }
    }
    return ambientEl;
  }
  function setAmbient(state){
    const a = ambient();
    if (!a) return;
    a.dataset.state = REDUCED ? 'idle' : state;
  }
  function sweep(){
    const a = ambient();
    if (!a || REDUCED) return;
    const sw = a.querySelector('.amb-sweep');
    if (!sw) return;
    sw.classList.remove('go');
    void sw.offsetWidth;
    sw.classList.add('go');
    setTimeout(() => sw.classList.remove('go'), 3200);
  }

  /* ============================================================
     4 · WAVEFORM — one smooth reactive line (Gemini voice vibe)
     Used while the user speaks and while Sarah "says it".
     ============================================================ */
  function wave(host, { width = 220, height = 30, color = 'rgba(157,150,255,.9)', energy = 1 } = {}){
    if (!host) return { stop(){} };
    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('class', 'fx-wave');
    const path = document.createElementNS(NS, 'path');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', color);
    path.setAttribute('stroke-width', '2.4');
    path.setAttribute('stroke-linecap', 'round');
    svg.appendChild(path);
    host.appendChild(svg);
    if (REDUCED){
      path.setAttribute('d', `M0 ${height / 2} L${width} ${height / 2}`);
      return { stop(){ svg.remove(); } };
    }
    let t = 0, raf = null, amp = 0, target = 1;
    const N = 36;
    const tick = () => {
      t += .14;
      amp += (target - amp) * .06;
      if (Math.random() < .05) target = .35 + Math.random() * energy;
      let d = '';
      for (let i = 0; i <= N; i++){
        const x = (i / N) * width;
        const env = Math.sin((i / N) * Math.PI);          /* taper the ends */
        const y = height / 2
          + Math.sin(i * .55 + t) * 5.5 * env * amp
          + Math.sin(i * .23 - t * 1.4) * 3.5 * env * amp;
        d += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
      }
      path.setAttribute('d', d);
      raf = requestAnimationFrame(tick);
    };
    tick();
    return { stop(){ cancelAnimationFrame(raf); svg.remove(); } };
  }

  window.JUICE = { star, trayToPlan, confetti, fireworks, bokeh, sweep, setAmbient, wave };
})();
