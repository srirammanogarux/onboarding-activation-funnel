import { chromium } from 'playwright';
const B = (process.env.BASE || 'http://localhost:8901') + '/';
const br = await chromium.launch();
const pg = await br.newPage({ viewport: { width: 1280, height: 1000 } });
const errs = [];
pg.on('pageerror', e => errs.push(String(e)));
const shot = (n) => pg.screenshot({ path: `tests/out/ui-${n}.png` });
const vis = async (sel) => pg.locator(sel).first();

// 1 · act idle → bulb swap → expanded bar
await pg.goto(B + '?step=act&lvl=intermediate&goal=career&sit=Working%20professional');
await pg.waitForSelector('#actScreen:not(.is-hidden)', { timeout: 30000 });
await pg.waitForTimeout(800);
await shot('act-idle');
await pg.waitForTimeout(5200);
await shot('act-bulb');
await pg.click('#actMic');
await pg.waitForTimeout(900);
await shot('act-listening');
await pg.click('#actCancel');
await pg.waitForTimeout(700);
await shot('act-cancelled');

// 2 · framework card steps + readstate mic
await pg.goto(B + '?step=framework&lvl=advanced&goal=career&sit=Working%20professional&path=hint');
await pg.waitForSelector('#fwScreen:not(.is-hidden)', { timeout: 30000 });
await pg.waitForTimeout(600);
await shot('fw-step1');
await pg.click('#fwNext'); await pg.waitForTimeout(300);
await pg.click('#fwNext'); await pg.waitForTimeout(300);
await pg.click('#fwNext'); await pg.waitForTimeout(400);
await shot('fw-step4');
await pg.click('#fwNext');
await pg.waitForTimeout(900);
await shot('fw-read');
await pg.click('#fwMic');
await pg.waitForTimeout(900);
await shot('fw-listening');

// 3 · score report
await pg.goto(B + '?step=scorecard&lvl=intermediate&goal=career&sit=Working%20professional');
await pg.waitForSelector('#scoreScreen:not(.is-hidden)', { timeout: 30000 });
await pg.waitForTimeout(2600);
await shot('score');

// 4 · beginner stage mic expanded
await pg.goto(B + '?step=stage&lvl=beginner&goal=career&sit=Working%20professional');
await pg.waitForSelector('#stageScreen:not(.is-hidden)', { timeout: 30000 });
await pg.waitForTimeout(1500);
await pg.click('#stgMic');
await pg.waitForTimeout(900);
await shot('stage-listening');

// 5 · language list
await pg.goto(B + '?step=language');
await pg.waitForTimeout(3500);
await shot('langs');

console.log('errors:', errs.length ? errs : 'none');
await br.close();
