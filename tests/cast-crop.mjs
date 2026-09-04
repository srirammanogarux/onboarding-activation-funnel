/* Cut two crops from each source, both anchored on the head.
   fx/fy = head centre as a fraction of the source; fw = how wide the
   head-and-shoulders box is, as a fraction of the source width.
   The portrait is cut at 720x730 — the card's own photo window — so the
   card never has to crop it again and no forehead goes missing. */
import { chromium } from 'playwright';
import fs from 'fs';
const PICKS = JSON.parse(fs.readFileSync('tests/cast.json', 'utf8'));
const b = await chromium.launch();
const p = await b.newPage();
await p.goto('http://localhost:8901/');
for (const k of PICKS){
  const src = `https://images.pexels.com/photos/${k.id}/pexels-photo-${k.id}.jpeg?auto=compress&cs=tinysrgb&w=1400`;
  const out = await p.evaluate(async ({ src, fx, fy, fw }) => {
    const load = (u) => new Promise((ok, no) => {
      const im = new Image(); im.crossOrigin = 'anonymous';
      im.onload = () => ok(im); im.onerror = () => no(new Error('load ' + u)); im.src = u;
    });
    let img = null, last = null;
    for (const u of [src, src.replace('w=1400', 'w=1200'), src.split('?')[0] + '?auto=compress&cs=tinysrgb&w=940']){
      try { img = await load(u); break; } catch (e) { last = e; await new Promise(r => setTimeout(r, 900)); }
    }
    if (!img) throw last;
    const cut = (w, h, boxW, headAt) => {
      const ar = w / h;
      let cw = Math.min(boxW * img.width, img.width);
      let ch = cw / ar;
      if (ch > img.height){ ch = img.height; cw = ch * ar; }
      let sx = fx * img.width  - cw / 2;
      let sy = fy * img.height - ch * headAt;
      sx = Math.max(0, Math.min(img.width  - cw, sx));
      sy = Math.max(0, Math.min(img.height - ch, sy));
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      const g = c.getContext('2d'); g.imageSmoothingQuality = 'high';
      g.drawImage(img, sx, sy, cw, ch, 0, 0, w, h);
      return c.toDataURL('image/jpeg', 0.86).split(',')[1];
    };
    return { face: cut(400, 400, fw, 0.45), portrait: cut(720, 730, fw * 1.7, 0.34) };
  }, { ...k, src });
  fs.writeFileSync(`assets/people/${k.slot}.jpg`, Buffer.from(out.portrait, 'base64'));
  fs.writeFileSync(`assets/people/${k.slot}-face.jpg`, Buffer.from(out.face, 'base64'));
  console.log('✓', k.slot);
  await new Promise(r => setTimeout(r, 500));
}
await b.close();
