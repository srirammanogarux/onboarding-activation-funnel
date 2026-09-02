/* ============================================================
   Stimuler · Onboarding v2 — JUICE v2
   Rebuilt after review. The rules:
   - Everything that flies LANDS somewhere and CHANGES it (the bar grows).
   - One voice per moment. No rains on menu taps.
   - Gold only when something is earned.
   - Confetti is a real canvas engine (ported from Activation v3's
     usaflow), not emoji spans.
   - All of it is non-blocking and dies under reduced motion.

   API:
   JUICE.pop(el, {emoji})     copies of the icon burst out and feed the bar
   JUICE.bloom()              the room tops out on the last arrival
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
     next empty slot (slotPunch + ringPulse + barGlow — motion
     vocabulary lifted from conversation-lead-to-first-chat).
     ============================================================ */
  const STAR_PATH = 'M12 2.6l2.8 5.9 6.4.8-4.7 4.4 1.2 6.3L12 17l-5.7 3 1.2-6.3L2.8 9.3l6.4-.8z';
  /* pop(fromEl, {emoji, n}) — the answer sprays copies of its own icon.
     The original never leaves the button. The copies burst out, arc up,
     shrink as they travel, and dissolve into the progress bar, which
     blooms as the last one lands. */
  /* ---------------------------------------------------------------
     pop — the answer travels to the bar.

     Four beats, deliberately sequenced. Duolingo's gems trail is the
     reference and its params are the brief: an ARC (not a straight
     line), a PRONOUNCED stagger, a SUBTLE spring, and the bar filling
     as its own later beat rather than at the same time.

       1  the icon springs where it stands and throws off one ring
       2  five pips are born out of it in an ordered fan
       3  each rides a quadratic arc to the tip of the bar, shrinking,
          single file, holding its opacity until it is nearly home
       4  the bar sips each arrival, blooms on the last, and only then
          grows; the aurora lifts on the first arrival, not on the tap

     The version this replaces threw nine pips along random vectors
     down one 900ms track with a single easing curve doing three
     different jobs, faded them out long before they landed, and lit
     the room before anything had arrived. That reads as scatter.
     --------------------------------------------------------------- */
  const BURST_MS = 300, TRAVEL_MS = 720, STAGGER = 62;

  function pop(fromEl, { emoji = '', html = '', n = 5, instant = false } = {}){
    const bar = document.querySelector('.progress-track');
    if (!bar || !fromEl || REDUCED || instant){ bloom(); return; }
    const host = phone();
    const hr = host.getBoundingClientRect();
    const fr = fromEl.getBoundingClientRect();
    const br = bar.getBoundingClientRect();

    const ox = fr.left - hr.left + fr.width / 2;
    const oy = fr.top  - hr.top  + fr.height / 2;
    /* they converge on the filled end of the bar, not its middle */
    const tx = br.left - hr.left + Math.max(26, br.width * 0.10);
    const ty = br.top  - hr.top  + br.height / 2;
    const ex = tx - ox, ey = ty - oy;

    /* the bar holds its growth back until the pips are nearly home, so
       the width change reads as a consequence of the arrival */
    bar.classList.add('absorbing');
    clearTimeout(absorbT);
    absorbT = setTimeout(() => bar.classList.remove('absorbing'), 2400);

    for (let i = 0; i < n; i++){
      const node = document.createElement('div');
      node.className = 'fx-pip';
      if (html) node.innerHTML = html; else node.textContent = emoji;
      node.style.left = (ox - 11) + 'px';
      node.style.top  = (oy - 11) + 'px';
      host.appendChild(node);

      /* an ordered fan, not a scatter: the eye can follow any one of
         them, and no two paths cross */
      const spread = n === 1 ? 0 : (i / (n - 1)) - 0.5;      /* -0.5 … +0.5 */
      const ang  = (-Math.PI / 2) + spread * 1.35 + (Math.random() - 0.5) * 0.14;
      const dist = 42 + Math.random() * 14;
      const bx = Math.cos(ang) * dist;
      const by = Math.sin(ang) * dist;
      const delay = i * STAGGER;

      /* beat 2 — out of the icon with a small overshoot, and stop */
      node.animate([
        { transform: 'translate(0,0) scale(.25)', opacity: 0 },
        { transform: `translate(${bx * .55}px, ${by * .55}px) scale(1.1)`, opacity: 1, offset: .55 },
        { transform: `translate(${bx}px, ${by}px) scale(1)`, opacity: 1 },
      ], { duration: BURST_MS, delay, easing: 'cubic-bezier(.22,.9,.3,1)', fill: 'forwards' });

      /* beat 3 — a real quadratic arc, sampled into keyframes so the
         curve is followed while the timing function still eases the
         whole trip. The control point sits out along the burst vector,
         so each pip keeps its own lane and they converge only at the
         very end. */
      const D  = Math.hypot(ex - bx, ey - by);
      const ux = bx / dist, uy = by / dist;
      const cx = bx + ux * D * 0.42;
      const cy = by + uy * D * 0.42 - D * 0.10;
      const frames = [];
      const STEPS = 22;
      for (let k = 0; k <= STEPS; k++){
        const t = k / STEPS, u = 1 - t;
        const x = u * u * bx + 2 * u * t * cx + t * t * ex;
        const y = u * u * by + 2 * u * t * cy + t * t * ey;
        frames.push({
          offset: t,
          transform: `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${(1 - 0.68 * t).toFixed(3)})`,
          opacity: t < 0.9 ? 1 : (1 - t) / 0.1,
        });
      }
      const fly = node.animate(frames, {
        duration: TRAVEL_MS, delay: delay + BURST_MS,
        easing: 'cubic-bezier(.55,.02,.25,1)', fill: 'forwards',
      });

      fly.onfinish = () => {
        node.remove();
        sip();                     /* the bar takes this one in */
        if (i === 0) flare();      /* the room lifts on the first arrival */
        if (i === n - 1) bloom();  /* and blooms on the last */
      };
    }
  }
  let absorbT = null;

  /* Each pip that lands lifts the room one step. The bar used to flash
     gold here; the glow behind the whole screen carries it now, so the
     reward builds with the arrivals rather than switching on at the end. */
  let hits = 0;
  function sip(){
    const p = phone();
    if (!p || REDUCED) return;
    hits = Math.min(hits + 1, 5);
    p.style.setProperty('--aur-lift', (1 + hits * 0.18).toFixed(2));
  }

  /* the aurora swells on an answer and decays to idle */
  let flareT = null;
  function flare(){
    const p = phone();
    if (!p || REDUCED) return;
    p.classList.add('amb-lit');
    clearTimeout(flareT);
    flareT = setTimeout(() => {
      p.classList.remove('amb-lit');
      hits = 0;
      p.style.removeProperty('--aur-lift');
    }, 1700);
  }

  /* The last arrival tops the room out. On the reduced-motion and
     fast-forward paths no pips ever fly, so this is also the only
     acknowledgement those users get and it has to stand on its own. */
  function bloom(){
    const p = phone();
    if (!p) return;
    if (p.classList.contains('amb-lit')){
      /* already flooded by the arrivals: push it to the top of its range */
      p.style.setProperty('--aur-lift', '1.9');
      return;
    }
    const glow = document.querySelector('.head-bloom');
    if (glow){ glow.classList.remove('pulse'); void glow.offsetWidth; glow.classList.add('pulse'); }
  }

  /* ============================================================
     2 · CONFETTI ENGINE — one canvas, lazily built, resized to the
     phone each time it wakes up. Burst, rain and fireworks share it.
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
      /* the drifting blobs are in the markup; only the sweep is injected */
      if (ambientEl && !ambientEl.querySelector('.amb-sweep')){
        ambientEl.insertAdjacentHTML('beforeend', '<i class="amb-sweep"></i>');
      }
    }
    return ambientEl;
  }

  /* THE one gold pass, at plan build. Gold appears only when earned. */
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
  function setAmbient(state){
    const p = document.getElementById('phone');
    if (!p) return;
    p.classList.remove('amb-thinking','amb-listening','amb-reward');
    if (state && state !== 'idle') p.classList.add('amb-' + state);
  }

  /* the room becomes theirs: hue follows the goal, depth follows the level */
  function tint(goal){
    const p = document.getElementById('phone');
    if (!p) return;
    [...p.classList].filter(c => c.startsWith('goal-')).forEach(c => p.classList.remove(c));
    if (goal) p.classList.add('goal-' + goal);
  }
  function deepen(){
    const p = document.getElementById('phone');
    if (p) p.classList.add('tuned');
  }

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

  window.JUICE = { pop, sip, flare, bloom, tint, deepen, confetti, fireworks, bokeh, sweep, setAmbient, wave };
})();
