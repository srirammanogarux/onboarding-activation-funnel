import { chromium } from 'playwright';
const B = process.env.BASE || 'http://localhost:8901';

const RUNS = [
  ['int/hint',      '?auto=1&goal=career&sit=Freelancer&lang=en&lvl=intermediate&path=hint'],
  ['adv/impromptu', '?auto=1&goal=career&sit=Working%20professional&lang=en&lvl=advanced'],
  ['beginner/weak', '?auto=1&goal=career&sit=Working%20professional&lang=en&lvl=beginner&perf=weak'],
];
const b = await chromium.launch();
for (const [name, qs] of RUNS){
  const p = await b.newPage({ viewport: { width: 430, height: 932 } });
  const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.goto(`${B}/${qs}`, { waitUntil: 'networkidle' });
  const t0 = Date.now();
  try {
    await p.waitForFunction(() => {
      const s = document.getElementById('offerScreen');
      return s && !s.hidden && !s.classList.contains('is-hidden');
    }, undefined, { timeout: 420000 });
    console.log(`✓ ghost ${name} → offer in ${((Date.now() - t0) / 1000).toFixed(0)}s`, errs[0] || 'no errors');
  } catch {
    console.log(`✗ ghost ${name} stalled at`, await p.evaluate(() => window.__curStep), errs[0] || '');
  }
  await p.close();
}
await b.close();
