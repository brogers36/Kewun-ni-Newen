/* ============================================================
   NUMERALS, TEXT, UI
   ============================================================ */
const UN=['','kiñe','epu','küla','meli','kechu','kayu','regle','pura','aylla'];
function numW(n){
  if(n<=0)return'0';
  if(n<10)return UN[n];
  if(n<100){const t=Math.floor(n/10),u=n%10;return (t>1?UN[t]+' ':'')+'mari'+(u?' '+UN[u]:'')}
  if(n<1000){const h=Math.floor(n/100),r=n%100;return (h>1?UN[h]+' ':'')+'pataka'+(r?' '+numW(r):'')}
  return String(n);
}
const numP=n=>numW(n)+' ('+n+')';
const L=(who,m,es,en)=>({who,m,es,en});
const N=(es,en)=>({es,en});
const PRAISE=[{m:'Kümey!',es:'¡Bien!',en:'Good!'},{m:'Tuteley!',es:'¡Muy bien hecho!',en:'Well done!'}];
let praiseI=0;const praise=()=>{const p=PRAISE[praiseI++%2];return L('',p.m,p.es,p.en)};
const dlg=$('dlg'),menu=$('menu'),hud=$('hud'),banner=$('banner');
function say(lines,cb){
  lines=lines.filter(Boolean);
  if(!lines.length){active=null;cb&&cb();return}
  let i=0;
  const show=()=>{const l=lines[i];
    const w=dlg.querySelector('.who'),m=dlg.querySelector('.m'),g=dlg.querySelector('.g');
    w.textContent=l.who||'';w.style.display=l.who?'':'none';
    m.textContent=l.m||'';m.style.display=l.m?'':'none';
    g.textContent=G(l);g.style.display=G(l)?'':'none';
    dlg.style.display='block';if(l.fx)l.fx();};
  active={kind:'say',a(){i++;if(i>=lines.length){dlg.style.display='none';active=null;cb&&cb()}else{sfx('move');show()}},b(){this.a()}};
  show();
}
dlg.addEventListener('click',()=>{if(active&&active.kind==='say')active.a()});
function choose(prompt,opts,cb,cancel,one,onSel){
  const pe=menu.querySelector('.p'),le=menu.querySelector('.list');
  pe.innerHTML='';le.innerHTML='';le.classList.toggle('one',!!one);
  if(prompt){if(prompt.m){const d=document.createElement('div');d.className='m';d.textContent=prompt.m;pe.appendChild(d)}
    const g=G(prompt);if(g){const d=document.createElement('div');d.className='g';d.textContent=g;pe.appendChild(d)}}
  let idx=opts.findIndex(o=>!o.dis);if(idx<0)idx=0;
  const pick=k=>{menu.style.display='none';active=null;sfx('ok');cb(opts[k].v!==undefined?opts[k].v:k)};
  const btns=opts.map((o,k)=>{const b=document.createElement('button');b.className='opt';
    b.innerHTML='<span class="om">'+esc(o.m||'')+'</span>'+(o.g?'<span class="og">'+esc(o.g)+'</span>':'');
    if(o.dis)b.disabled=true;b.onclick=()=>{if(!o.dis)pick(k)};
    b.onmouseenter=()=>{if(!o.dis&&idx!==k){idx=k;hl()}};le.appendChild(b);return b});
  const hl=()=>{btns.forEach((b,k)=>b.classList.toggle('sel',k===idx));if(onSel)onSel(idx,opts[idx])};
  active={kind:'menu',a(){if(!opts[idx].dis)pick(idx)},
    b(){if(cancel){menu.style.display='none';active=null;sfx('move');cb(null)}},
    mv(d){let n=idx;for(let t=0;t<opts.length;t++){n=(n+d+opts.length)%opts.length;if(!opts[n].dis)break}idx=n;sfx('move');hl();btns[idx].scrollIntoView({block:'nearest'})}};
  menu.style.display='block';hl();
}
function showBanner(m,g){banner.querySelector('b').textContent=m;banner.querySelector('span').textContent=g;banner.style.display='block';clearTimeout(showBanner.t);showBanner.t=setTimeout(()=>banner.style.display='none',2200)}

