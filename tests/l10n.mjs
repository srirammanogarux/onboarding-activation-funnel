import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({viewport:{width:1280,height:1000}});
const e=[]; p.on('pageerror',x=>e.push(x.message));
const shots = [
  ['?lang=fr&step=act&lvl=intermediate&goal=career&sit=Working%20professional','actScreen','fr-act'],
  ['?lang=fr&step=framework&lvl=advanced&goal=career&sit=Working%20professional&path=hint','fwScreen','fr-fw'],
  ['?lang=fr&step=scorecard&lvl=intermediate&goal=career&sit=Working%20professional','scoreScreen','fr-score'],
  ['?lang=it&step=survey&lvl=beginner&goal=career&sit=Working%20professional&perf=weak','ldrScreen','it-ldr'],
  ['?lang=pt&step=stage&lvl=beginner&goal=career&sit=Working%20professional','stageScreen','pt-stage'],
];
for (const [qs, scr, name] of shots){
  await p.goto((process.env.BASE || 'http://localhost:8901') + '/'+qs);
  await p.waitForSelector(`#${scr}:not(.is-hidden)`,{timeout:40000}).catch(()=>console.log('TIMEOUT',name));
  await p.waitForTimeout(2500);
  await p.screenshot({path:`tests/out/${name}.png`});
}
console.log('errors:', e.length?e:'none');
await b.close();
