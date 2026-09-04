/* Localisation audit — walks the funnel in a locale and prints every
   visible string, so leftover English is obvious at a glance.

     node tests/l10n-audit.mjs            # French, the default set
     LOC=it node tests/l10n-audit.mjs     # Italian
     node tests/l10n-audit.mjs readstate  # one step only

   Everything after the native-language and app-language questions
   should be in the locale; those first two are English on purpose. */
import { chromium } from 'playwright';

const B   = (process.env.BASE || 'http://localhost:8901') + '/';
const LOC = process.env.LOC || 'fr';
const Q   = `goal=career&sit=Working%20professional&lang=${LOC}`;

const STEPS = [
  ['source',    'lvl=intermediate'], ['age',       'lvl=intermediate'],
  ['goal',      'lvl=intermediate'], ['situation', 'lvl=intermediate'],
  ['scenarios', 'lvl=intermediate'], ['level',     'lvl=intermediate'],
  ['award',     'lvl=intermediate'], ['planbuild', 'lvl=intermediate'],
  ['stage',     'lvl=beginner&perf=mid'], ['meter', 'lvl=beginner&perf=mid'],
  ['fix',       'lvl=beginner&perf=mid'], ['practice', 'lvl=beginner&perf=mid'],
  ['survey',    'lvl=beginner&perf=mid'],
  ['act',       'lvl=advanced'], ['scorecard', 'lvl=advanced'],
  ['framework', 'lvl=advanced&path=hint'], ['readstate', 'lvl=advanced&path=hint'],
  ['paywall',   'lvl=beginner&perf=mid'], ['gift', 'lvl=beginner&perf=mid'],
  ['offer',     'lvl=beginner&perf=mid'],
];

const only = process.argv.slice(2);
const runs = only.length ? STEPS.filter(([s]) => only.includes(s)) : STEPS;

const b = await chromium.launch();
for (const [step, extra] of runs){
  const p = await b.newPage({ viewport: { width: 900, height: 1000 } });
  await p.goto(`${B}?step=${step}&${Q}&${extra}`);
  await p.waitForTimeout(9000);
  const seen = await p.evaluate(() => {
    const shown = n => {
      const r = n.getBoundingClientRect(), s = getComputedStyle(n);
      return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.opacity !== '0';
    };
    const out = [];
    document.querySelectorAll('.phone *').forEach(n => {
      if (n.children.length) return;
      const t = (n.textContent || '').trim();
      if (!t) return;
      for (let e = n; e && e !== document.body; e = e.parentElement) if (!shown(e)) return;
      out.push(t);
    });
    return [...new Set(out)];
  });
  console.log(`\n#### ${step}`);
  seen.forEach(t => console.log('  ' + t));
  await p.close();
}
await b.close();
