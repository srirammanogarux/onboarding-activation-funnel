import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({viewport:{width:1280,height:1000}});
const e=[]; p.on('pageerror',x=>e.push(x.message));
await p.goto('http://localhost:8901/?auto=1&goal=career&sit=Working%20professional&lang=en&lvl=intermediate');
await p.waitForTimeout(15000);
const s0 = await p.evaluate(()=>window.__curStep);
console.log('t=15s step:', s0);

// forward
await p.click('.auto-ctrls [data-a="fwd"]');
await p.waitForNavigation({waitUntil:'domcontentloaded'}).catch(()=>{});
await p.waitForTimeout(6000);
const s1 = await p.evaluate(()=>({step:window.__curStep, url:new URL(location.href).searchParams.get('step')}));
console.log('after fwd:', s1);

// forward again
await p.click('.auto-ctrls [data-a="fwd"]');
await p.waitForNavigation({waitUntil:'domcontentloaded'}).catch(()=>{});
await p.waitForTimeout(6000);
const s2 = await p.evaluate(()=>({step:window.__curStep, url:new URL(location.href).searchParams.get('step')}));
console.log('after fwd2:', s2);

// back
await p.click('.auto-ctrls [data-a="back"]');
await p.waitForNavigation({waitUntil:'domcontentloaded'}).catch(()=>{});
await p.waitForTimeout(6000);
const s3 = await p.evaluate(()=>({step:window.__curStep, url:new URL(location.href).searchParams.get('step')}));
console.log('after back:', s3);

// pause / play
await p.click('.auto-ctrls [data-a="pause"]');
await p.waitForTimeout(400);
const paused = await p.evaluate(()=>window.__autoPaused);
const stepAtPause = await p.evaluate(()=>window.__curStep);
await p.waitForTimeout(8000);
const stepAfterWait = await p.evaluate(()=>window.__curStep);
await p.click('.auto-ctrls [data-a="pause"]');
await p.waitForTimeout(400);
const resumed = await p.evaluate(()=>!window.__autoPaused);
console.log('pause:', {paused, held: stepAtPause===stepAfterWait, resumed});

// rapid double-click fwd must cause exactly one nav
const urlBefore = await p.url();
await p.click('.auto-ctrls [data-a="fwd"]');
await p.click('.auto-ctrls [data-a="fwd"]').catch(()=>{});
await p.waitForTimeout(5000);
console.log('double-fwd url step:', new URL(await p.url()).searchParams.get('step'), '(from', new URL(urlBefore).searchParams.get('step')+')');
console.log('errors:', e.length?e:'none');
await b.close();
