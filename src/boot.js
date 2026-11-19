/* ============================================================
   BOOT
   ============================================================ */
function fit(){
  const pad=matchMedia('(hover:hover) and (pointer:fine)').matches?60:190;
  const s=Math.max(1,Math.min((innerWidth-12)/256,(innerHeight-pad)/224));
  const si=s>=2?Math.floor(s*2)/2:s;$('screen').style.setProperty('--s',si);
}
addEventListener('resize',fit);fit();
const sv=loadSave();if(sv)$('bCont').style.display='';
function updLang(){$('bLang').textContent=LANG==='es'?'Glosa: Español':'Gloss: English';$('skip').textContent=LANG==='es'?'Saltar ▶▶':'Skip ▶▶'}
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
  auInit();
  S=Object.assign(newState(sv.hero||'llanka'),sv);S.gloss=LANG;S.pw={speed:0,pewen:0,gold:0};S.roots=S.roots.map(r=>r==='amu'?'amutu':r);if(S.last)S.last=null;$('title').style.display='none';mode='map';AU.name=null;loadMap(MAPS[S.map]?S.map:'rupu',S.x,S.y);
};
updLang();
requestAnimationFrame(loop);
</script>
</body>
</html>
