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
let LANG='es',S=null,mode='title',frame=0,active=null,grace=0,fade=0,HERO='millaray';
const rnd=n=>Math.floor(Math.random()*n);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function G(o){if(!o)return'';const l=S?S.gloss:LANG;return o[l]!==undefined?o[l]:(o.es||'')}
const h2=(x,y,s)=>{let n=(Math.imul(x|0,374761393)+Math.imul(y|0,668265263)+Math.imul((s|0)+7,982451653))|0;n=Math.imul(n^(n>>>13),1274126177);n^=n>>>16;return (n>>>0)/4294967296};
const hexRGB=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
const GA=(m,f)=>S&&S.fem?f:m;
const addr=npcFem=>(S&&S.fem)||npcFem?'lamngen':'peñi';
