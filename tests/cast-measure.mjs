/* Draw each source at a fixed 300x300 letterbox with the current face
   crop rectangle overlaid, plus 10% tick labels, so the offset between
   the box and the head can be read off directly. */
import { chromium } from 'playwright';
import fs from 'fs';
const P=JSON.parse(fs.readFileSync('tests/cast.json','utf8'));
const cells=P.map(k=>`<figure><div class=box data-k='${JSON.stringify(k)}'>
 <img src="https://images.pexels.com/photos/${k.id}/pexels-photo-${k.id}.jpeg?auto=compress&cs=tinysrgb&w=700">
 <div class=rect></div></div><figcaption>${k.slot} fx${k.fx} fy${k.fy} fw${k.fw}</figcaption></figure>`).join('');
const html=`<html><body style="margin:0;background:#111;display:grid;grid-template-columns:repeat(4,300px);gap:10px;padding:12px;font:600 11px system-ui;color:#eee">
<style>figure{margin:0}.box{position:relative;width:300px;height:300px;background:#000;overflow:hidden;display:flex;align-items:center;justify-content:center}
img{max-width:100%;max-height:100%;display:block}
.rect{position:absolute;border:2px solid #0f0;box-shadow:0 0 0 9999px rgba(0,0,0,.45)}
figcaption{padding:3px 0}</style>${cells}
<script>
addEventListener('load',()=>{setTimeout(()=>{
 document.querySelectorAll('.box').forEach(b=>{
  const k=JSON.parse(b.dataset.k), im=b.querySelector('img'), r=b.querySelector('.rect');
  const iw=im.clientWidth, ih=im.clientHeight, ox=(300-iw)/2, oy=(300-ih)/2;
  const cw=Math.min(k.fw,1)*iw, ch=cw;
  let x=k.fx*iw-cw/2, y=k.fy*ih-ch*0.45;
  x=Math.max(0,Math.min(iw-cw,x)); y=Math.max(0,Math.min(ih-ch,y));
  r.style.left=(ox+x)+'px'; r.style.top=(oy+y)+'px'; r.style.width=cw+'px'; r.style.height=ch+'px';
 });
},200)});
</script></body></html>`;
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1270,height:900}});
await p.setContent(html);await p.waitForTimeout(8000);
await p.screenshot({path:'tests/out/cs-measure.png',fullPage:true});await b.close();console.log('ok');
