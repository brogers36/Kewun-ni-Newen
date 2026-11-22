/* ============================================================
   Kewün ñi Newen (working title) · Lafkenche region
   ============================================================ */
let W=512,H=448,LW=256;const LH=224,T=16,VY=0,VH=LH;
const cv=document.getElementById('cv'),ctx=cv.getContext('2d');ctx.imageSmoothingEnabled=false;
const LO=document.createElement('canvas');LO.width=LW;LO.height=LH;const lx=LO.getContext('2d');lx.imageSmoothingEnabled=false;
function setView(lw){
  lw=Math.max(256,Math.min(400,Math.round(lw/2)*2));
  if(lw===LW)return false;
  LW=lw;W=LW*2;
  LO.width=LW;LO.height=LH;lx.imageSmoothingEnabled=false;
  cv.width=W;cv.height=H;ctx.imageSmoothingEnabled=false;
  document.getElementById('screen').style.setProperty('--lw',LW);
  if(typeof VIGNC!=='undefined'&&VIGNC)VIGNC=null;
  if(typeof BG!=='undefined')for(const k in BG)delete BG[k];
  if(typeof FG!=='undefined')for(const k in FG)delete FG[k];
  return true;
}
const $=id=>document.getElementById(id);
const CT=true;
const SAVE_KEY='ngen_ni_dungun_lafkenche_v2'+(window.KEWUN_MASTER?'_maestro':''),MUTE_KEY='ngen_ni_dungun_mute';
let SLOT=1;try{SLOT=Math.max(1,Math.min(3,+(localStorage.getItem(SAVE_KEY+'_slot')||1)||1))}catch(e){}
const slotKey=n=>SAVE_KEY+(n>1?'_s'+n:'');
function setSlot(n){SLOT=n;try{localStorage.setItem(SAVE_KEY+'_slot',''+n)}catch(e){}}
let LANG='es',S=null,mode='title',frame=0,active=null,grace=0,fade=0,HERO='millaray';
const rnd=n=>Math.floor(Math.random()*n);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const OUTBG={coast:1,field:1,forest:1,mount:1,pampa:1,rainforest:1,fjord:1,waria:1};
function dayPhase(){
  const CYC=43200,t=(((S&&S.wtime)||0)%CYC)/CYC; // 12-minute cycle of play time
  const ramp=(a,b)=>Math.max(0,Math.min(1,(t-a)/(b-a)));
  let dark=0,warm=0,name='day';
  if(t<.60){name='day'}
  else if(t<.70){name='dusk';warm=.14*ramp(.60,.66);dark=.34*ramp(.63,.70)}
  else if(t<.92){name='night';dark=.34;warm=0}
  else{name='dawn';dark=.34*(1-ramp(.92,.97));warm=.12*(1-ramp(.95,1))}
  return {name,dark,warm,t}}
function dayTint(c){
  if(!M||!OUTBG[M.bg])return;
  const d=dayPhase();if(!d.dark&&!d.warm)return;
  if(d.warm){c.fillStyle='rgba(255,150,70,'+d.warm.toFixed(3)+')';c.fillRect(0,0,LW,LH)}
  if(d.dark){c.fillStyle='rgba(8,14,42,'+d.dark.toFixed(3)+')';c.fillRect(0,0,LW,LH);
    c.fillStyle='rgba(4,6,24,'+(d.dark*.5).toFixed(3)+')';c.fillRect(0,0,LW,34)}
}
function G(o){if(!o)return'';const l=S?S.gloss:LANG;return o[l]!==undefined?o[l]:(o.es||'')}
const h2=(x,y,s)=>{let n=(Math.imul(x|0,374761393)+Math.imul(y|0,668265263)+Math.imul((s|0)+7,982451653))|0;n=Math.imul(n^(n>>>13),1274126177);n^=n>>>16;return (n>>>0)/4294967296};
const hexRGB=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
const GA=(m,f)=>S&&S.fem?f:m;
const addr=npcFem=>(S&&S.fem)||npcFem?'lamngen':'peñi';
