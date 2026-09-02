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
   JUICE.fly(el, {emoji})     answer's icon arcs into the progress bar
   JUICE.bloom()              the bar answers with a gold pulse
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
  /* fly(fromEl, {emoji}) — the whole reward in one move.
     The icon lifts out of the chip, arcs to the progress bar, and the bar
     blooms as it lands. Nothing is left behind: the answer becomes progress. */
  function fly(fromEl, { emoji = '', instant = false } = {}){
    const bar = document.querySelector('.progress-track');
    if (!bar || !fromEl || REDUCED || instant){ bloom(); return; }
    const host = document.getElementById('phone');
    const hr = host.getBoundingClientRect();
    const fr = fromEl.getBoundingClientRect();
    const br = bar.getBoundingClientRect();

    const node = document.createElement('div');
    node.className = 'fx-fly';
    node.textContent = emoji;
    node.style.left = (fr.left - hr.left + fr.width / 2 - 14) + 'px';
    node.style.top  = (fr.top  - hr.top  + fr.height / 2 - 14) + 'px';
    host.appendChild(node);

    const dx = (br.left - hr.left + br.width * 0.18) - (fr.left - hr.left + fr.width / 2 - 14);
    const dy = (br.top  - hr.top  + br.height / 2 - 14) - (fr.top - hr.top + fr.height / 2 - 14);

    /* anticipation, then travel: lift a little before it commits */
    node.animate([
      { transform: 'translate(0,0) scale(1)',              opacity: 1, offset: 0 },
      { transform: `translate(${dx*.12}px, ${-18}px) scale(1.22)`, opacity: 1, offset: .26 },
      { transform: `translate(${dx}px, ${dy}px) scale(.42)`, opacity: .9, offset: 1 },
    ], { duration: 620, easing: 'cubic-bezier(.32,.72,.28,1)', fill: 'forwards' })
      .onfinish = () => { node.remove(); bloom(); };
  }

  /* the bar answers: a gold pulse behind it, and the fill flashes */
  function bloom(){
    const track = document.querySelector('.progress-track');
    const glow  = document.querySelector('.head-bloom');
    if (track){ track.classList.remove('bloom'); void track.offsetWidth; track.classList.add('bloom'); }
    if (glow){ glow.classList.remove('pulse'); void glow.offsetWidth; glow.classList.add('pulse'); }
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

  window.JUICE = { fly, bloom, tint, deepen, confetti, fireworks, bokeh, sweep, setAmbient, wave };
})();
