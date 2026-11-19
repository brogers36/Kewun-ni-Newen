/* ============================================================
   MASTER COPY (testing build only; never in the player build)
   Start at any region with the earlier ones already done,
   jump to any map, heal, skip battles.
   ============================================================ */
const MCHK=[
  {m:'Lafkenche · inicio',es:'Desde el principio, sin la escena inicial',en:'From the start, skipping the opening scene',lvl:1,at:['rupu',1,6],set:[]},
  {m:'Lafkenche · lof',es:'Con el pentukuwün ya hecho',en:'With the pentukuwün already done',lvl:3,at:['lof',17,9],set:['intro','pentu']},
  {m:'Lafkenche · cueva',es:'Entrada de la cueva del trelke-wekufü',en:"Entrance of the trelke-wekufü's cave",lvl:4,at:['inaltu',21,5],set:['intro','pentu']},
  {m:'Lafkenche · jefe',es:'Frente a Trelke-wekufü',en:'Facing Trelke-wekufü',lvl:6,at:['ngen',8,9],set:['intro','pentu','lafcave']},
  {m:'Nagche · inicio',es:'Lafkenche completa; camino a los llanos',en:'Lafkenche complete; road to the lowlands',lvl:7,at:['n_rupu',1,7],set:['intro','pentu','lafcave','lafdone']},
  {m:'Nagche · lof',es:'En el lof nagche, antes de hablar con el lonko',en:'In the Nagche lof, before talking to the lonko',lvl:7,at:['n_lof',17,9],set:['intro','pentu','lafcave','lafdone']},
  {m:'Nagche · guarida',es:'Entrada de la guarida del Witranalwe',en:"Entrance of the Witranalwe's lair",lvl:8,at:['n_mawida',28,4],set:['intro','pentu','lafcave','lafdone','naglof']},
  {m:'Nagche · jefe',es:'Frente al Witranalwe',en:'Facing the Witranalwe',lvl:10,at:['ngen2',8,9],set:['intro','pentu','lafcave','lafdone','naglof','nagcave']},
  {m:'Nagche · completa',es:'Dos trokiñ',en:'Two trokiñ',lvl:11,at:['n_lof',17,9],set:['intro','pentu','lafcave','lafdone','naglof','nagcave','nagdone']},
  {m:'Pewenche · inicio',es:'Nagche completa; camino a la cordillera',en:'Nagche complete; road to the mountains',lvl:12,at:['p_rupu',1,7],set:['intro','pentu','lafcave','lafdone','naglof','nagcave','nagdone']},
  {m:'Pewenche · lof',es:'En el lof pewenche, antes de hablar con el lonko',en:'In the Pewenche lof, before talking to the lonko',lvl:12,at:['p_lof',17,9],set:['intro','pentu','lafcave','lafdone','naglof','nagcave','nagdone']},
  {m:'Pewenche · morada',es:'Entrada de la morada del Cherrufe',en:"Entrance of the Cherrufe's lair",lvl:13,at:['p_pillan',28,4],set:['intro','pentu','lafcave','lafdone','naglof','nagcave','nagdone','pewlof']},
  {m:'Pewenche · jefe',es:'Frente al Cherrufe',en:'Facing the Cherrufe',lvl:15,at:['ngen3',8,9],set:['intro','pentu','lafcave','lafdone','naglof','nagcave','nagdone','pewlof','pewcave']},
  {m:'Pewenche · completa',es:'Tres trokiñ; listo para la próxima región',en:'Three trokiñ; ready for the next region',lvl:16,at:['p_lof',17,9],set:['intro','pentu','lafcave','lafdone','naglof','nagcave','nagdone','pewlof','pewcave','pewdone']}];
const MSET={
  intro:s=>{s.flags.intro=1;s.roots.push('küpa')},
  pentu:s=>{Object.assign(s.flags,{pentu_prac:1,pentukun:1});s.roots.push('umawtu','nag');s.items.kulon+=2},
  lafcave:s=>{Object.assign(s.flags,{rune_kil:1,mini1:1,mini2:1,mini3:1,'pz:d1':1,'pz:d2':1});s.runes.push('kil');s.items.lawen+=2;s.items.kofke+=2},
  lafdone:s=>{Object.assign(s.flags,{ngen:1,dive:1,boss:1,awake_lafkenche:1});s.pieces.push('lafkenche');s.gear.trariwe=1;s.gear.makun=1},
  naglof:s=>{Object.assign(s.flags,{chuchu:1,nag_lonko:1,herd_task:1,herd:1,awar:1,'pz:n_lewfu':1});s.roots.push('llüka');s.piwke+=1},
  nagcave:s=>{Object.assign(s.flags,{root_winotu:1,nmini1:1,nmini2:1,nmini3:1,'pz:nd1':1,'pz:nd2':1});s.roots.push('wiñotu');s.items.lawen+=2},
  pewlof:s=>{Object.assign(s.flags,{laku:1,pew_lonko:1,pew_ke:1,'pz:p_pewen':1});s.roots.push('trafo')},
  pewcave:s=>{Object.assign(s.flags,{root_wutre:1,pmini1:1,pmini2:1,pmini3:1,'pz:pd1':1,'pz:pd2':1});s.roots.push('wütre');s.items.lawen+=2},
  pewdone:s=>{Object.assign(s.flags,{ngen3:1,snow:1,boss3:1});s.pieces.push('pewenche')},
  nagdone:s=>{Object.assign(s.flags,{ngen2:1,bramble:1,boss2:1});s.pieces.push('nagche')}};
function mBuild(c){
  const s=newState(HERO);s.pieces=[];
  for(const k of c.set)MSET[k](s);
  s.roots=[...new Set(s.roots)];
  for(let l=1;l<c.lvl;l++){s.lvl++;s.baseMax+=HPQ;s.baseAtk+=1;if(s.lvl%2===0)s.baseDef+=1}
  s.gold=60*c.lvl;s.save={map:c.at[0],x:c.at[1],y:c.at[2]};
  return s}
function mStart(c){auInit();S=mBuild(c);S.gloss=LANG;S.hp=maxHP();S.sp=SPMAX;$('title').style.display='none';mode='map';AU.name=null;loadMap(c.at[0],c.at[1],c.at[2]);persist()}
function mCheckpoints(back){
  choose({es:'Maestro · ¿Desde dónde empiezas?',en:'Master · Where do you start?'},MCHK.map((c,i)=>({m:c.m,g:G(c),v:i})).concat([{m:LANG==='en'?'Back':'Volver',v:'x'}]),v=>{
    if(v===null||v==='x')return back&&back();
    mStart(MCHK[v])},true);
}
let MNOENC=false;
const _mEngage=engage;
engage=function(e){if(MNOENC&&!e.boss&&!e.mini)return;_mEngage(e)};
function mMenu(){
  const en=S.gloss==='en';
  if(mode==='battle'){
    return choose({es:'Maestro',en:'Master'},[{m:en?'Win this battle':'Ganar esta pelea',v:'win'},{m:en?'Back':'Volver',v:'x'}],v=>{
      if(v==='win'&&B){B.en.forEach(e=>{e.hp=0;e.dead=true});victory()}else battleMenu()},true);
  }
  if(mode!=='map')return;
  choose({es:'Maestro',en:'Master'},[
    {m:en?'Start from a region':'Empezar desde una región',v:'chk'},
    {m:en?'Go to a map':'Ir a un mapa',v:'map'},
    {m:en?'Heal fully':'Sanar todo',v:'heal'},
    {m:'+100 ngülliw',v:'gold'},
    {m:(en?'Battles: ':'Peleas: ')+(MNOENC?(en?'off':'no'):(en?'on':'sí')),g:en?'Off: only minibosses and bosses fight':'No: solo pelean minijefes y jefes',v:'enc'},
    {m:en?'Close':'Cerrar',v:'x'}],v=>{
    if(v==='chk')return mCheckpoints(mMenu);
    if(v==='map')return choose({es:'¿A qué mapa?',en:'Which map?'},Object.keys(MAPS).map(k=>({m:MAPS[k].name,g:k,v:k})).concat([{m:en?'Back':'Volver',v:'x'}]),k=>{
      if(!k||k==='x')return mMenu();const m=MAPS[k];sfx('cast');loadMap(k,Math.floor(m.w/2),Math.floor(m.h/2))},true);
    if(v==='heal'){S.hp=maxHP();S.sp=SPMAX;S.curse=0;sfx('heal');persist();return mMenu()}
    if(v==='gold'){S.gold+=100;sfx('pick');persist();return mMenu()}
    if(v==='enc'){MNOENC=!MNOENC;return mMenu()}
  },true);
}
(function(){
  menu.style.zIndex='20';
  const row=document.createElement('div');row.className='row';
  const b=document.createElement('button');b.id='bMaster';b.textContent='Maestro · Elegir región';row.appendChild(b);
  $('bNew').parentNode.after(row);
  b.onclick=()=>{auInit();mCheckpoints()};
  const pb=document.createElement('button');pb.className='sm';pb.id='pX';pb.textContent='MAE';$('ab').prepend(pb);
  const open=()=>{if(!S||!M)return;if(mode==='battle'&&active&&active.kind==='menu'){menu.style.display='none';active=null;return mMenu()}if(!active)mMenu()};
  pb.onclick=open;
  addEventListener('keydown',e=>{if(e.key==='g'||e.key==='G'){e.preventDefault();open()}});
  const tag=document.createElement('div');tag.textContent='MAESTRO';tag.style.cssText='position:fixed;top:4px;left:6px;font:bold 11px monospace;color:#ffd060;background:#000a;padding:2px 6px;border-radius:3px;z-index:99;pointer-events:none';document.body.appendChild(tag);
})();
