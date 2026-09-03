import { chromium } from 'playwright';
const B = (process.env.BASE || 'http://localhost:8901') + '/';
const Q = 'goal=career&sit=Working%20professional&lang=en';
const b = await chromium.launch();
const page = () => b.newPage({ viewport: { width: 900, height: 1000 }, deviceScaleFactor: 1 });
const snap = async (p, name) => {
  await p.locator('.phone').screenshot({ path: `tests/out/cap/${name}.png` });
  console.log('✓', name);
};

// ---- chat question states (shared row) ----
const chatSteps = ['language','applang','name','phone','source','age','gender','goal','situation','scenarios','testimonials','level','award'];
for (const s of chatSteps){
  const p = await page();
  await p.goto(`${B}?step=${s}&${Q}&lvl=intermediate`);
  await p.waitForTimeout(s === 'testimonials' || s === 'award' ? 7000 : 5000);
  await snap(p, `chat-${s}`);
  await p.close();
}
// handoff CTA (I'm ready / one real question) — end of chat
{
  const p = await page();
  await p.goto(`${B}?step=planbuild&${Q}&lvl=intermediate`);
  await p.waitForTimeout(3000);
  await snap(p, 'plan-build');
  await p.close();
}

// ---- beginner clean (perf=strong) ----
{
  const p = await page();
  await p.goto(`${B}?step=stage&${Q}&lvl=beginner&perf=strong`);
  await p.waitForSelector('#stageScreen:not(.is-hidden)', { timeout: 40000 });
  await p.waitForTimeout(1800);
  await snap(p, 'beg-r1-ready');
  await p.click('#stgMic'); await p.waitForTimeout(1200);
  await snap(p, 'beg-r1-speaking');
  await p.click('#stgConfirm'); await p.waitForTimeout(1600);
  await snap(p, 'beg-r1-win');
  await p.close();
}
for (const [s, n] of [['read2','beg-r2-ready'],['echo','beg-r3-ready']]){
  const p = await page();
  await p.goto(`${B}?step=${s}&${Q}&lvl=beginner&perf=strong`);
  await p.waitForSelector('#stageScreen:not(.is-hidden)', { timeout: 40000 });
  await p.waitForTimeout(2000);
  await snap(p, n);
  await p.close();
}
{
  const p = await page();
  await p.goto(`${B}?step=survey&${Q}&lvl=beginner&perf=strong`);
  await p.waitForFunction(() => !document.getElementById('ldrScreen').classList.contains('is-hidden'), undefined, { timeout: 40000 });
  await p.waitForTimeout(4500);   // testimonial card cycle
  await snap(p, 'beg-clean-loader');
  await p.close();
}

// ---- beginner slip (perf=mid: slip on run 2) ----
{
  const p = await page();
  await p.goto(`${B}?step=read2&${Q}&lvl=beginner&perf=mid`);
  await p.waitForSelector('#stageScreen:not(.is-hidden)', { timeout: 40000 });
  await p.waitForTimeout(1800);
  await p.click('#stgMic'); await p.waitForTimeout(1400);
  await p.click('#stgConfirm'); await p.waitForTimeout(2200);   // amber slip state
  await snap(p, 'beg-r2-slip');
  await p.close();
}
for (const [s, n, w] of [['meter','beg-meter',6000],['fix','beg-fix',5000],['practice','beg-practice',5000]]){
  const p = await page();
  await p.goto(`${B}?step=${s}&${Q}&lvl=beginner&perf=mid`);
  await p.waitForTimeout(w + 4000);
  await snap(p, n);
  await p.close();
}
{
  const p = await page();
  await p.goto(`${B}?step=survey&${Q}&lvl=beginner&perf=mid`);
  await p.waitForFunction(() => !document.getElementById('ldrScreen').classList.contains('is-hidden'), undefined, { timeout: 60000 });
  await p.waitForTimeout(3500);   // survey question card
  await snap(p, 'beg-slip-loader');
  await p.close();
}

// ---- int/adv impromptu ----
{
  const p = await page();
  await p.goto(`${B}?step=act&${Q}&lvl=intermediate`);
  await p.waitForSelector('#actScreen:not(.is-hidden)', { timeout: 40000 });
  await p.waitForTimeout(1000);
  await snap(p, 'imp-question');
  await p.waitForTimeout(5000);
  await snap(p, 'imp-question-bulb');
  await p.click('#actMic'); await p.waitForTimeout(1200);
  await snap(p, 'imp-listening');
  await p.close();
}
for (const [s, n, w] of [['analysing','imp-analysing',2500],['scorecard','imp-score',3500]]){
  const p = await page();
  await p.goto(`${B}?step=${s}&${Q}&lvl=intermediate`);
  await p.waitForTimeout(w + 5000);
  await snap(p, n);
  await p.close();
}
{
  const p = await page();
  await p.goto(`${B}?step=survey&${Q}&lvl=intermediate`);
  await p.waitForFunction(() => !document.getElementById('ldrScreen').classList.contains('is-hidden'), undefined, { timeout: 60000 });
  await p.waitForTimeout(4500);
  await snap(p, 'imp-loader');
  await p.close();
}

// ---- int/adv hint ----
{
  const p = await page();
  await p.goto(`${B}?step=framework&${Q}&lvl=advanced&path=hint`);
  await p.waitForSelector('#fwScreen:not(.is-hidden)', { timeout: 40000 });
  await p.waitForTimeout(800);
  await snap(p, 'hint-fw-step1');
  await p.click('#fwNext'); await p.waitForTimeout(350);
  await p.click('#fwNext'); await p.waitForTimeout(350);
  await p.click('#fwNext'); await p.waitForTimeout(500);
  await snap(p, 'hint-fw-step4');
  await p.click('#fwNext'); await p.waitForTimeout(1000);
  await snap(p, 'hint-read-ready');
  await p.click('#fwMic'); await p.waitForTimeout(2600);
  await snap(p, 'hint-read-live');
  await p.close();
}
for (const [s, n, w] of [['meter','hint-meter',6500],['fix','hint-fix',5500],['practice','hint-practice',5500]]){
  const p = await page();
  await p.goto(`${B}?step=${s}&${Q}&lvl=advanced&path=hint`);
  await p.waitForTimeout(w + 4500);
  await snap(p, n);
  await p.close();
}
{
  const p = await page();
  await p.goto(`${B}?step=survey&${Q}&lvl=advanced&path=hint`);
  await p.waitForFunction(() => !document.getElementById('ldrScreen').classList.contains('is-hidden'), undefined, { timeout: 60000 });
  await p.waitForTimeout(3500);
  await snap(p, 'hint-loader');
  await p.close();
}

// ---- tail: paywall → gift → offer ----
for (const [s, n, w] of [['paywall','tail-paywall',8000],['gift','tail-gift',4000],['offer','tail-offer',5000]]){
  const p = await page();
  await p.goto(`${B}?step=${s}&${Q}&lvl=intermediate`);
  await p.waitForTimeout(w + 5000);
  await snap(p, n);
  await p.close();
}
console.log('DONE');
await b.close();
