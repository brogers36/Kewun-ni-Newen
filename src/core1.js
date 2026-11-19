/* ============================================================
   Kewün ñi Newen (working title) · Lafkenche region
   ============================================================ */
const W=512,H=448,LW=256,LH=224,T=16,VY=0,VH=LH;
const cv=document.getElementById('cv'),ctx=cv.getContext('2d');ctx.imageSmoothingEnabled=false;
const LO=document.createElement('canvas');LO.width=LW;LO.height=LH;const lx=LO.getContext('2d');lx.imageSmoothingEnabled=false;
const $=id=>document.getElementById(id);
const CT=!!window.KEWUN_CT;
const SAVE_KEY='ngen_ni_dungun_lafkenche_v2'+(window.KEWUN_MASTER?'_maestro':'')+(CT?'_ct':''),MUTE_KEY='ngen_ni_dungun_mute';
let LANG='es',S=null,mode='title',frame=0,active=null,grace=0,fade=0,HERO='llanka';
const rnd=n=>Math.floor(Math.random()*n);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function G(o){if(!o)return'';const l=S?S.gloss:LANG;return o[l]!==undefined?o[l]:(o.es||'')}
const h2=(x,y,s)=>{let n=(Math.imul(x|0,374761393)+Math.imul(y|0,668265263)+Math.imul((s|0)+7,982451653))|0;n=Math.imul(n^(n>>>13),1274126177);n^=n>>>16;return (n>>>0)/4294967296};
const hexRGB=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
const GA=(m,f)=>S&&S.fem?f:m;
const addr=npcFem=>(S&&S.fem)||npcFem?'lamngen':'peñi';
