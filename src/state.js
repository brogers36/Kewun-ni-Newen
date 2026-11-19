/* ============================================================
   STATE
   ============================================================ */
const HPQ=4,SPMAX=3;
function maxHP(){return S.baseMax+(S.gear.trariwe?4:0)+Math.floor(S.piwke/4)*4+(S.flags.ngen?4:0)+(S.flags.ngen2?4:0)}
function atk(){return S.baseAtk+(S.gear.futrawino?3:0)-(S.curse?2:0)}
function def(){return S.baseDef+(S.gear.makun?2:0)}
function xpNeed(){return 10+S.lvl*10}
function newState(hero){const fem=hero==='millaray';return{hero,fem,name:fem?'Millaray':'Llanka',gloss:LANG,map:'rupu',x:1,y:6,hp:24,baseMax:24,baseAtk:5,baseDef:1,lvl:1,xp:0,gold:0,
  items:{kulon:2,kofke:0,lawen:0},gear:{},roots:['amutu'],runes:[],flags:{},piwke:0,keys:0,sp:0,curse:0,hints:true,
  pw:{speed:0,pewen:0,gold:0},save:{map:'rupu',x:1,y:6}}}
function persist(){try{if(M){S.map=CUR;S.x=P.x;S.y=P.y}localStorage.setItem(SAVE_KEY,JSON.stringify(S))}catch(e){}}
function loadSave(){try{const t=localStorage.getItem(SAVE_KEY);return t?JSON.parse(t):null}catch(e){return null}}
const heroLook=()=>S.hero==='millaray'?'millaray':'llanka';

/* ---------- verbs ---------- */
const ROOTS={
  amutu:{m:'amutu-',es:'irse (de aquí)',en:'go away (from here)'},
  'küpa':{m:'küpa-',es:'venir',en:'come'},
  umawtu:{m:'umawtu-',es:'dormir',en:'sleep'},
  nag:{m:'nag-',es:'bajar',en:'come down'},
  'llüka':{m:'llüka-',es:'tener miedo',en:'be afraid'},
  'wiñotu':{m:'wiñotu-',es:'volver, regresar',en:'go back'}};
const ENDS=['nge','mu','mün'];
const endFor=n=>n<=1?0:n===2?1:2;
const VG={
  amutu:{es:['¡Vete!','¡Váyanse (ustedes dos)!','¡Váyanse (todos)!'],en:['Go away!','Go away, you two!','Go away, all of you!'],
       nes:['¡No te vayas!','¡No se vayan (ustedes dos)!','¡No se vayan (todos)!'],nen:["Don't go!","Don't go, you two!","Don't go, all of you!"]},
  'küpa':{es:['¡Ven!','¡Vengan (ustedes dos)!','¡Vengan (todos)!'],en:['Come!','Come, you two!','Come, all of you!'],
       nes:['¡No vengas!','¡No vengan (ustedes dos)!','¡No vengan (todos)!'],nen:["Don't come!","Don't come, you two!","Don't come, all of you!"]},
  umawtu:{es:['¡Duerme!','¡Duerman (ustedes dos)!','¡Duerman (todos)!'],en:['Sleep!','Sleep, you two!','Sleep, all of you!'],
       nes:['¡No duermas!','¡No duerman (ustedes dos)!','¡No duerman (todos)!'],nen:["Don't sleep!","Don't sleep, you two!","Don't sleep, all of you!"]},
  nag:{es:['¡Baja!','¡Bajen (ustedes dos)!','¡Bajen (todos)!'],en:['Come down!','Come down, you two!','Come down, all of you!'],
       nes:['¡No bajes!','¡No bajen (ustedes dos)!','¡No bajen (todos)!'],nen:["Don't come down!","Don't come down, you two!","Don't come down, all of you!"]},
  'llüka':{es:['¡Ten miedo!','¡Tengan miedo (ustedes dos)!','¡Tengan miedo (todos)!'],en:['Be afraid!','Be afraid, you two!','Be afraid, all of you!'],
       nes:['¡No tengas miedo!','¡No tengan miedo (ustedes dos)!','¡No tengan miedo (todos)!'],nen:["Don't be afraid!","Don't be afraid, you two!","Don't be afraid, all of you!"]},
  'wiñotu':{es:['¡Vuelve atrás!','¡Vuelvan atrás (ustedes dos)!','¡Vuelvan atrás (todos)!'],en:['Go back!','Go back, you two!','Go back, all of you!'],
       nes:['¡No vuelvas atrás!','¡No vuelvan (ustedes dos)!','¡No vuelvan (todos)!'],nen:["Don't go back!","Don't go back, you two!","Don't go back, all of you!"]}};

/* ---------- enemies ---------- */
const ET={
  laftrache:{name:'laftrache',hp:10,atk:4,xp:4,gold:[2,4],bs:44},
  chonchon:{name:'chon chon',hp:9,atk:4,xp:5,gold:[3,5],fly:true,bs:44},
  anchi:{name:'anchimallén',hp:14,atk:5,xp:6,gold:[4,6],bs:40},
  nidol:{name:'ñidol laftrache',hp:30,atk:6,xp:16,gold:[10,14],bs:62},
  piwichen:{name:'piwichén',hp:32,atk:6,xp:18,gold:[12,16],fly:true,drain:true,bs:66},
  trelke:{name:'Trelke-wekufü',hp:90,atk:7,xp:50,gold:[40,40],boss:true,bs:104},
  kolokolo:{name:'kolokolo',hp:13,atk:6,xp:7,gold:[4,7],bs:42,curse:1},
  fkolokolo:{name:'fütra kolokolo',hp:38,atk:8,xp:20,gold:[12,16],bs:64,curse:1},
  nguruvilu:{name:'nguruvilu',hp:40,atk:8,xp:24,gold:[14,18],bs:70,twice:1},
  witranalwe:{name:'Witranalwe',hp:100,atk:8,xp:70,gold:[60,60],boss:true,bs:110}};

/* ---------- items ---------- */
const ITEMS={
  kulon:{m:'külon',es:'maqui: +8 newen (2 piwke)',en:'maqui berries: +8 newen (2 hearts)',p:5},
  kofke:{m:'kofke',es:'pan: +16 newen (4 piwke)',en:'bread: +16 newen (4 hearts)',p:10},
  lawen:{m:'lawen',es:'remedio: quita la maldición, +4 newen',en:'medicine: lifts the curse, +4 newen',p:20}};
const GEAR={
  makun:{m:'makuñ',es:'poncho: defensa +2',en:'poncho: defense +2',p:30},
  trariwe:{m:'trariwe',es:'faja tejida: +1 piwke máximo',en:'woven sash: +1 max heart',p:40},
  futrawino:{m:'fütra wiño',es:'wiño grande: fuerza +3',en:'big palin stick: strength +3',p:50}};
function useItem(id){
  const it=ITEMS[id];if(!S.items[id])return null;S.items[id]--;const mx=maxHP();
  if(id==='kulon')S.hp=Math.min(mx,S.hp+8);
  if(id==='kofke')S.hp=Math.min(mx,S.hp+16);
  if(id==='lawen'){S.hp=Math.min(mx,S.hp+4);S.curse=0}
  sfx('heal');
  return L('',it.m,'Usas '+it.m+'. '+it.es+'.','You use '+it.m+'. '+it.en+'.');
}
function itemOpts(){return Object.keys(ITEMS).map(k=>({m:ITEMS[k].m+' ×'+S.items[k],g:G(ITEMS[k]),v:k,dis:!S.items[k]}))}
