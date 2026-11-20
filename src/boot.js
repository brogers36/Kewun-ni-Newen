/* ============================================================
   BOOT
   ============================================================ */
function fit(){
  const pad=matchMedia('(hover:hover) and (pointer:fine)').matches?60:14;
  const aw=innerWidth-12,ah=Math.max(1,innerHeight-pad);
  setView(Math.round(224*aw/ah));
  const s=Math.max(1,Math.min(aw/LW,ah/224));
  const si=s>=2?Math.floor(s*2)/2:s;$('screen').style.setProperty('--s',si);
}
addEventListener('resize',fit);fit();
(function(){
  const d=document.documentElement,b=$('fsbtn');if(!b)return;
  const can=d.requestFullscreen||d.webkitRequestFullscreen;
  const standalone=navigator.standalone||matchMedia('(display-mode: standalone)').matches||matchMedia('(display-mode: fullscreen)').matches;
  if(!can||standalone)return;
  b.style.display='block';
  const on=()=>!!(document.fullscreenElement||document.webkitFullscreenElement);
  const tog=()=>{try{if(on()){(document.exitFullscreen||document.webkitExitFullscreen).call(document)}else{can.call(d)}}catch(e){}};
  b.onclick=tog;
  const ch=()=>{b.textContent=on()?'⊡':'⛶';setTimeout(fit,60)};
  document.addEventListener('fullscreenchange',ch);document.addEventListener('webkitfullscreenchange',ch);
  addEventListener('keydown',e=>{if((e.key==='f'||e.key==='F')&&!e.repeat)tog()});
})();
const sv=loadSave();if(sv)$('bCont').style.display='';
function updLang(){$('copy').textContent=LANG==='es'?'© 2026 Brandon M. A. Rogers · Todos los derechos reservados. Prohibido usar este sitio para entrenar inteligencia artificial.':'© 2026 Brandon M. A. Rogers · All rights reserved. No use of this site to train artificial intelligence.';$('bLang').textContent=LANG==='es'?'Glosa: Español':'Gloss: English';$('skip').textContent=LANG==='es'?'Saltar ▶▶':'Skip ▶▶'}
$('bLang').onclick=()=>{LANG=LANG==='es'?'en':'es';updLang()};
$('bMus').onclick=()=>toggleMute();
$('bMus').textContent=AU.muted?'♪ Música: no':'♪ Música: sí';$('pN').textContent=AU.muted?'♪×':'♪';
for(const [id,lk] of [['hL','llanka'],['hM','millaray']]){const cvs=$(id).querySelector('canvas'),c=cvs.getContext('2d');c.imageSmoothingEnabled=false;
  let t=0;setInterval(()=>{t++;c.clearRect(0,0,32,48);c.drawImage(charSprite(lk,'down',HERO===lk?Math.floor(t)%4:0),0,0,32,48)},180);
  $(id).onclick=()=>{HERO=lk;$('hL').classList.toggle('on',lk==='llanka');$('hM').classList.toggle('on',lk==='millaray');sfx('ok')}}
$('title').addEventListener('pointerdown',()=>{auInit();if(!AU.name)playSong('intro')});
playSong('intro');
$('bNew').onclick=()=>{auInit();S=newState(HERO);$('title').style.display='none';startCut()};
$('bCont').onclick=()=>{
  auInit();const sv=loadSave();if(!sv)return;
  S=Object.assign(newState(sv.hero||'llanka'),sv);S.items.diwen=S.items.diwen||0;S.gear=S.gear||{};S.gloss=LANG;S.pw={speed:0,pewen:0,gold:0};S.roots=S.roots.map(r=>r==='amu'?'amutu':r==='wiñotu'?'wüñotreka':r);if(S.last)S.last=null;$('title').style.display='none';mode='map';AU.name=null;loadMap(MAPS[S.map]?S.map:'rupu',S.x,S.y);
};
if(CT){const st=document.createElement('style');st.textContent=`.box{background:linear-gradient(180deg,#5a6a9e 0%,#2a3468 50%,#141a3c 100%)!important;border:3px solid #e8ecf8!important;border-radius:4px!important;box-shadow:inset 0 0 0 1px #9aa2c8,inset -2px -2px 0 1px #5a5e74,0 0 0 2px #000!important}
.opt{background:linear-gradient(#3a4680,#1e2652)!important;border:2px solid #8890b8!important}.opt.sel{border-color:#fff!important;background:linear-gradient(#5a68b0,#2e3a78)!important}.opt.sel .om::before{content:'▶ ';color:#ffe060}
#dlg .who{color:#ffe890!important}`;document.head.appendChild(st);}
updLang();
requestAnimationFrame(loop);
</script>
</body>
</html>
