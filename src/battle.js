/* ============================================================
   BATTLE
   ============================================================ */
let B=null;
const SUMMONP=Object.keys(ET).filter(k=>!ET[k].boss);
function engage(e){
  if(grace>0||active)return;
  const go=()=>startBattle(e.party,{ent:e,boss:e.boss,mini:e.mini,final:e.final,chain:e.chain});
  if(e.pre)say(e.pre,go);else go();
}
function relabel(){const cnt={},seen={};B.en.forEach(e=>cnt[e.t]=(cnt[e.t]||0)+1);
  B.en.forEach(e=>{seen[e.t]=(seen[e.t]||0)+1;if(e.label)return;e.label=ET[e.t].name+(cnt[e.t]>1||ET[e.t].name==='laftrache'&&B.en.length>1?' '+'ABCDE'[seen[e.t]-1]:'')})}
function mkEnemy(t){return{t,hp:ET[t].hp,max:ET[t].hp,gr:0,sl:0,hit:0,dead:false,fadeT:0,fear:0,stun:0,tall:t==='witranalwe'?1:0,armor:ET[t].armor?1:0,burn:ET[t].fire?1:0,hidden:0,dreaming:ET[t].dream?1:0,dreamT:0,down:0,seals:ET[t].seals?ET[t].seals.slice():null}}
function startBattle(party,o){
  mode='battle';banner.style.display='none';held.up=held.down=held.left=held.right=0;
  B={en:party.map(mkEnemy),o,tele:false,teleHint:false,shake:0,area:(M.fog&&M.bg!=='fjord'?'fog:':'')+M.bg,turn:0,cursor:null,pops:[],parts:[],flash:0,red:0,intro:24,blocked:null,rush:null,shownHP:S.hp};
  relabel();sfx('enc');playSong(o.final?'ngoyFinal':rsong(o.boss?'boss':'battle'));
  const alive=B.en.length,same=party.every(t=>t===party[0]),nameL=same?ET[party[0]].name:'wekufü';
  const lst=same?nameL:'wekufü ('+party.map(t=>ET[t].name).join(', ')+')';
  say([L('','Müley '+numW(alive)+' '+nameL+'!','¡Hay '+alive+' '+lst+'!','There '+(alive>1?'are ':'is ')+alive+' '+lst+'!')],battleMenu);
}
const aliveE=()=>B.en.filter(e=>!e.dead);
function bossBlock(e){const T=ET[e.t];if(!T.boss)return false;if(e.down||e.sl||e.stag||e.dreaming||e.hidden||e.hp<=0)return false;
  if(e.parry){e.parry=0;return true}
  return Math.random()<(T.blk||.22)}
const quizPend=e=>!!B&&ET[e.t].boss&&!B.qok&&!(e.t==='ngoyman1'||e.t==='ngoyman2')&&!(B.o.chain==='llufu'&&e.t!=='llufu5');
function battleMenu(){
  const en=S.gloss==='en';B.cursor=null;
  choose({es:'¿Qué haces? (Hay '+aliveE().length+')',en:'What do you do? ('+aliveE().length+' left)'},[
    {m:'Dungun',g:en?'Speak (build a command)':'Hablar (armar una orden)',v:'d'},
    {m:'Newen ('+(S.sp||0)+'/'+SPMAX+')',g:en?'Special ability':'Habilidad especial',v:'s',dis:(S.sp||0)<2},
    {m:'Chemkün',g:en?'Items':'Cosas',v:'i'}].concat(S.gear.trutruka?[{m:'Trutruka',g:en?'Blow the horn: stuns all (once per fight)':'Tocar la trutruka: aturde a todos (1 vez por pelea)',v:'t',dis:!!B.trut}]:[]).concat([
    {m:'Lef',g:en?'Run away':'Huir',v:'r'}]).concat(B.last?[{m:'Ka kiñe rupa: '+ROOTS[B.last.r].m.replace('-','')+(B.last.k?'kil':'')+'-',g:en?'Once more (same verb)':'Otra vez (el mismo verbo)',v:'again'}]:[]),v=>{
    if(v==='d')pickRoot();
    else if(v==='again')pickTarget(B.last.r,B.last.k);
    else if(v==='s')pickSpecial();
    else if(v==='t'){B.trut=1;sfx('trut');
      const ls=[L('','Trutruka!','¡El sonido largo de la trutruka retumba por todas partes!','The long blast of the trutruka booms all around!')];
      for(const e of aliveE()){const T=ET[e.t];e.fear=Math.max(e.fear,2);if(!T.boss)e.stun=1}
      ls.push(N('Los wekufü se tapan los oídos: pierden su turno y quedan asustados. Los más grandes solo se asustan.','The wekufü cover their ears: they lose their turn and are left scared. The biggest ones are only scared.'));
      return say(ls,enemyPhase)}
    else if(v==='i')choose({es:'Chemkün',en:'Items'},itemOpts().concat([{m:en?'Back':'Volver',v:'x'}]),k=>{if(!k||k==='x')return battleMenu();const l=useItem(k);say([l],enemyPhase)},true);
    else if(v==='r'){if(B.o.boss||B.o.mini){sfx('bad');return say([N('¡No puedes huir de esta pelea!','You cannot run from this fight!')],battleMenu)}
      if(Math.random()<.65)return say([L('','Lef!','Huyes corriendo.','You run away.')],()=>endBattle('flee'));
      sfx('bad');say([N('¡No pudiste escapar!','You could not get away!')],enemyPhase)}
  },false);
}
function pickRoot(){
  const en=S.gloss==='en';
  const opts=S.roots.map(r=>({m:ROOTS[r].m,g:G(ROOTS[r]),v:r}));opts.push({m:en?'Back':'Volver',v:'x'});
  choose({m:'___',es:'Elige la raíz del verbo.',en:'Choose the verb root.'},opts,r=>{
    if(!r||r==='x')return battleMenu();
    if(S.runes.includes('kil'))choose({m:ROOTS[r].m+'___',es:'¿Agregas -kil- (prohibición)?',en:'Add -kil- (prohibition)?'},
      [{m:'∅',g:en?'no -kil-':'sin -kil-',v:0},{m:'-kil-',g:en?"don't...!":'¡no...!',v:1}],k=>{if(k===null)return pickRoot();pickTarget(r,k)},true);
    else pickTarget(r,0);
  },true);
}
function pickTarget(r,k){
  const en=S.gloss==='en',al=aliveE(),base=r+(k?'kil':'');
  if(al.length===1)return pickEnd(r,k,B.en.indexOf(al[0]));
  const opts=[{m:'Kom · '+al.length,g:en?'all of them (collective)':'todos (colectivo)',v:'all'}].concat(al.map(e=>({m:e.label,g:en?'just this one (individual)':'solo este (individual)',v:B.en.indexOf(e)})));
  choose({m:base+'-___',es:'¿A quién le hablas? ¿A todos juntos o a uno solo?',en:'Who are you speaking to? All of them together, or just one?'},opts,v=>{
    if(v===null){B.cursor=null;return pickRoot()}pickEnd(r,k,v)},true,false,(i,o)=>{B.cursor=o.v});
}
function pickEnd(r,k,tg){
  const en=S.gloss==='en',base=r+(k?'kil':''),coll=tg==='all',n=coll?aliveE().length:1;B.cursor=tg;
  const hint=S.hints?[en?'to one':'a uno',en?'to two':'a dos',en?'to three or more':'a tres o más']:['','',''];
  const who=coll?{es:'Les hablas a todos juntos. ¿Cuántos son?',en:'You are speaking to all of them together. How many are there?'}:{es:'Le hablas solo a '+B.en[tg].label+'.',en:'You are speaking only to '+B.en[tg].label+'.'};
  choose({m:base+'-___',es:who.es,en:who.en},ENDS.map((e,i)=>({m:'-'+e,g:hint[i],v:i})),i=>{
    if(i===null){if(aliveE().length===1){B.cursor=null;return pickRoot()}return pickTarget(r,k)}resolve(r,k,tg,i)},true);
  void n;
}
const SPECIALS={
  kuruf:{m:'Kürüf',cost:3,es:'Viento: golpea fuerte a todos y baja a los que vuelan',en:'Wind: hits everyone hard and brings flyers down'},
  wino:{m:'Wiño',cost:2,es:'Golpe de wiño: daño triple a uno',en:'Wiño strike: triple damage to one'},
  lawen:{m:'Lawentun',cost:2,es:'Sanar: +2 piwke y quita la maldición',en:'Heal: +2 hearts and lifts the curse'}};
function spark(x,y,col,n){for(let i=0;i<n;i++){const a=Math.random()*6.28,v=.6+Math.random()*1.6;B.parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-1,t:30+rnd(15),col})}}
function pickSpecial(){
  const en=S.gloss==='en';
  choose({es:'Newen: '+(S.sp||0)+'/'+SPMAX+'. Cada orden bien dicha carga uno.',en:'Newen: '+(S.sp||0)+'/'+SPMAX+'. Every command said correctly charges one.'},
    Object.keys(SPECIALS).map(k=>({m:SPECIALS[k].m+' · '+SPECIALS[k].cost,g:G(SPECIALS[k]),v:k,dis:(S.sp||0)<SPECIALS[k].cost})).concat([{m:en?'Back':'Volver',v:'x'}]),k=>{
    if(!k||k==='x')return battleMenu();
    if(k==='wino'){const al=aliveE();if(al.length===1)return doSpecial(k,al[0]);
      return choose({es:'¿A cuál?',en:'Which one?'},al.map(e=>({m:e.label,v:B.en.indexOf(e)})),i=>{B.cursor=null;if(i===null)return pickSpecial();doSpecial(k,B.en[i])},true,false,(i,o)=>{B.cursor=o.v})}
    doSpecial(k)},true);
}
function doSpecial(k,tgt){
  const sp=SPECIALS[k];S.sp-=sp.cost;B.cursor=null;const fx=[],fxe=[];let targets=[];
  const head=L(S.name,sp.m+'!',G(sp),G(sp));head.fx=()=>{sfx('cast');B.flash=12;B.shake=8};
  if(k==='lawen'){S.hp=Math.min(maxHP(),S.hp+8);S.curse=0;fx.push('Recuperas dos piwke.');fxe.push('You recover two hearts.');head.fx=()=>{sfx('heal');spark(60,30,'#80ff90',16)}}
  else{targets=k==='wino'?[tgt]:aliveE();
    let burnT=0;for(const e of targets){if(e.hidden){fx.push(e.label+' está escondido en la niebla: no lo alcanzas.');fxe.push(e.label+' is hidden in the fog: you cannot reach it.');continue}if(bossBlock(e)){fx.push(e.label+' se cubre: ¡bloquea tu newen!');fxe.push(e.label+' guards: it blocks your newen!');continue}let d=k==='wino'?atk()*3+rnd(3):Math.round(atk()*1.5)+rnd(3);if(e.tall)d=Math.max(1,Math.round(d/3));if(e.armor)d=Math.max(1,Math.round(d/2));if(ET[e.t].spres){d=Math.max(1,Math.round(d/2));fx.push(e.label+' resiste tu newen.');fxe.push(e.label+' resists your newen.')}if(ET[e.t].thick)d=Math.max(1,Math.round(d/2));if(e.seals&&e.seals.length)d=Math.min(2,d);if(e.dreaming){d=Math.min(1,d);fx.push(e.label+' duerme caminando: hay que despertarlo.');fxe.push(e.label+' sleeps as it walks: it must be woken.')}if(e.down){d+=4;e.down=0}if(e.burn)burnT+=2;if(k==='kuruf'&&ET[e.t].fly)e.gr=3;e.pend=d;e.hp-=d;
      fx.push(e.label+' −'+d+(e.hp<=0?(quizPend(e)?' (se tambalea)':' (se va)'):'')+'.');fxe.push(e.label+' −'+d+(e.hp<=0?(quizPend(e)?' (staggers)':' (gone)'):'')+'.')}
    if(burnT){S.hp=Math.max(1,S.hp-burnT);fx.push('¡Te quemas! (−'+burnT+')');fxe.push('You get burned! (−'+burnT+')')}}
  const eff=N(fx.join(' '),fxe.join(' '));
  eff.fx=()=>{for(const e of targets){const p=epos(e);spark(p.x,p.y,k==='kuruf'?'#e8f4ff':'#ffd060',16);if(e.pend){e.hit=14;pop(p.x,p.y-10,'-'+e.pend,'#ffffff');sfx('hit');if(e.hp<=0&&!quizPend(e)){e.dead=true;e.fadeT=20}e.pend=0}}};
  say([head,eff],()=>{for(const e of targets)if(e.hp<=0&&!e.dead&&!quizPend(e)){e.dead=true;e.fadeT=20}bossSweep();if(!aliveE().some(x=>x.hp>0))return victory();enemyPhase()});
}
function epos(e){return{x:e.px||128,y:e.py||100}}
function pop(x,y,txt,col){B.pops.push({x,y,txt,col,t:50})}
function sealGloss(code,lg){
  const kil=code.endsWith('kil'),r=kil?code.slice(0,-3):code,vg=VG[r],g2=(kil?(lg==='en'?vg.nen:vg.nes):(lg==='en'?vg.en:vg.es))[0];
  return lg==='en'?'The next seal whispers: «'+g2+'»':'El siguiente sello susurra: «'+g2+'»';
}
function resolve(r,kil,tg,ei){
  const al=aliveE(),coll=tg==='all',targets=coll?al:[B.en[tg]],n=targets.length,need=coll?endFor(n):0;
  B.cursor=null;
  const form=r+(kil?'kil':'')+ENDS[ei];
  const vg=VG[r],gl={es:(kil?vg.nes:vg.es)[ei],en:(kil?vg.nen:vg.en)[ei]};
  const lines=[L(S.name,form+'!',gl.es,gl.en)];
  if(ei!==need){
    sfx('bad');
    if(coll)lines.push(N('Los wekufü se miran confundidos. Les hablas a todos y son '+numP(n)+': para '+(n===2?'dos':'tres o más')+' se usa -'+ENDS[need]+'.',
      'The wekufü look at each other, confused. You are speaking to all of them and there are '+numP(n)+': for '+(n===2?'two':'three or more')+' you use -'+ENDS[need]+'.'));
    else lines.push(N(B.en[tg].label+' no entiende. Le hablas a uno solo: se usa -nge.',B.en[tg].label+' does not understand. You are speaking to just one: you use -nge.'));
    return say(lines,enemyPhase);
  }
  const pr=praise();B.last={r,k:kil};S.sp=Math.min(SPMAX,(S.sp||0)+1);
  {const e0=targets[0];
  if((!coll||n===1)&&e0.seals&&e0.seals.length&&(r+(kil?'kil':''))===e0.seals[0]){
    e0.seals.shift();lines[0].fx=()=>{sfx('lvl');B.flash=14;B.shake=6};
    if(e0.seals.length)lines.push(N('¡CRAC! Un sello de luz se quiebra sobre '+e0.label+'. Quedan '+e0.seals.length+'. '+sealGloss(e0.seals[0],'es'),
      'CRACK! A seal of light shatters over '+e0.label+'. '+e0.seals.length+' left. '+sealGloss(e0.seals[0],'en')));
    else lines.push(N('¡CRAC! ¡El último sello se quiebra sobre '+e0.label+'! Ahora tus palabras y tu newen sí pueden herirlo.',
      'CRACK! The last seal shatters over '+e0.label+'! Now your words and your newen can truly hurt it.'));
    return say(lines,enemyPhase);
  }}
  const fx=[],fxe=[];
  const castFx=()=>{sfx('cast');B.flash=8};
  lines[0].fx=castFx;
  let burnT=0;
  if(r==='amutu'&&!kil){
    for(const e of targets){const T=ET[e.t];
      if(T.fly&&e.gr<=0){fx.push(e.label+' vuela muy alto: no te alcanza.');fxe.push(e.label+' flies too high: it does not reach.');e.miss=1;continue}
      if(e.hidden){fx.push(e.label+' está escondido en la niebla: tus palabras se pierden.');fxe.push(e.label+' is hidden in the fog: your words are lost.');e.miss=1;continue}
      if(e.tall){fx.push(e.label+' está erguido, altísimo: tus palabras le pasan por debajo.');fxe.push(e.label+' stands tall, towering: your words pass beneath it.');e.miss=1;continue}
      if(bossBlock(e)){e.miss=1;fx.push(e.label+' se cubre: ¡bloquea tu golpe!'+(B.blkHint?'':' (En el suelo no podría cubrirse...)'));fxe.push(e.label+' guards: it blocks your blow!'+(B.blkHint?'':' (On the ground it could not guard...)'));B.blkHint=1;continue}
      let d=coll?Math.max(1,Math.round((atk()+rnd(4))*.75)):atk()+rnd(4)+2;if(e.burn)burnT+=2;
      if(e.armor){d=Math.max(1,Math.round(d*.25));fx.push(e.label+': el golpe rebota en su coraza de piedra.');fxe.push(e.label+': the blow bounces off its stone crust.')}
      if(ET[e.t].thick){d=Math.max(1,Math.round(d/2));fx.push(e.label+': su cuerpo de niebla espesa amortigua el golpe.');fxe.push(e.label+': its body of thick fog softens the blow.')}
      if(e.seals&&e.seals.length){d=Math.min(2,d);fx.push(e.label+': la barrera de luz desvía casi todo el golpe.');fxe.push(e.label+': the barrier of light turns aside most of the blow.')}
      if(e.dreaming){d=Math.min(1,d);fx.push(e.label+' duerme caminando: tus golpes se pierden en su sueño gris. Algo te dice que hay que despertarlo.');fxe.push(e.label+' sleeps as it walks: your blows are lost in its grey dream. Something tells you it must be woken.')}
      if(e.down){d+=4;e.down=0;fx.push(e.label+' está en el suelo: el golpe entra con todo (+4).');fxe.push(e.label+' is on the ground: the blow lands full force (+4).')}
      e.pend=d;e.hp-=d;
      if(e.hp<=0&&quizPend(e)){fx.push(e.label+' se tambalea (−'+d+')...');fxe.push(e.label+' staggers (−'+d+')...')}else if(e.hp<=0){fx.push(e.label+' se va (−'+d+').');fxe.push(e.label+' goes away (−'+d+').')}else{fx.push(e.label+' −'+d+'.');fxe.push(e.label+' −'+d+'.')}}
  }else if(r==='amutu'){fx.push('Les dijiste que no se fueran... y se quedan, felices.');fxe.push('You told them not to leave... so they stay, happily.')}
  else if(r==='küpa'&&!kil){fx.push('¡Les dijiste que vinieran! Se lanzan sobre ti.');fxe.push('You told them to come! They rush at you.');B.rush=new Set(targets)}
  else if(r==='küpa'){B.blocked=new Set(targets);fx.push(coll?'Los wekufü se detienen: este turno no pueden alcanzarte.':targets[0].label+' se detiene: este turno no puede alcanzarte.');fxe.push(coll?'The wekufü stop: this turn they cannot reach you.':targets[0].label+' stops: this turn it cannot reach you.')}
  else if(r==='umawtu'&&!kil){for(const e of targets){const T=ET[e.t];if(T.boss){fx.push(e.label+' no se duerme.');fxe.push(e.label+' does not fall asleep.');continue}
      if(Math.random()<(coll?.7:.9)){e.sl=2;fx.push(e.label+' se duerme.');fxe.push(e.label+' falls asleep.')}else{fx.push(e.label+' bosteza, pero no se duerme.');fxe.push(e.label+' yawns, but stays awake.')}}}
  else if(r==='umawtu'){let w=0;for(const e of targets)if(e.sl){e.sl=0;w=1}fx.push(w?'¡Los despertaste!':'Ninguno dormía.');fxe.push(w?'You woke them up!':'None of them was asleep.')}
  else if(r==='nag'&&!kil){let any=0;for(const e of targets)if(ET[e.t].fly){e.gr=3;any=1;fx.push(e.label+' baja al suelo.');fxe.push(e.label+' comes down to the ground.')}
      if(!any){fx.push('No vuela: ya está abajo.');fxe.push('It does not fly: it is already down.')}}
  else if(r==='nag'){fx.push('Les dijiste que no bajaran. Siguen donde estaban.');fxe.push('You told them not to come down. They stay where they were.')}
  else if(r==='lef'&&!kil){for(const e of targets){const T=ET[e.t];
      if(T.boss||T.mini){fx.push(e.label+' no tiene miedo: no va a correr.');fxe.push(e.label+' is not afraid: it will not run.');continue}
      if(e.hp<=e.max*.5){e.hp=0;e.pend=0;e.dead=true;e.fadeT=20;fx.push(e.label+' sale corriendo y no vuelve.');fxe.push(e.label+' runs off and does not come back.')}
      else{fx.push(e.label+' todavía tiene fuerzas: no quiere correr.');fxe.push(e.label+' still has strength: it does not want to run.')}}}
  else if(r==='lef'){fx.push('Les dijiste que no corrieran. Se quedan.');fxe.push('You told them not to run. They stay.')}
  else if(r==='ñam'&&!kil){for(const e of targets){const T=ET[e.t];
      if(T.boss){fx.push(e.label+' es demasiado fuerte para perderse.');fxe.push(e.label+' is too strong to get lost.');continue}
      if(e.hp<=Math.ceil(e.max/3)){e.hp=0;e.pend=0;e.dead=true;e.fadeT=20;fx.push(e.label+' se desvanece en el aire... ¡y no vuelve!');fxe.push(e.label+' fades into the air... and does not come back!')}
      else{fx.push(e.label+' todavía tiene fuerzas: no se pierde.');fxe.push(e.label+' still has strength: it does not get lost.')}}}
  else if(r==='ñam'){fx.push('Les dijiste que no se perdieran. Ahí siguen.');fxe.push('You told them not to get lost. There they stay.')}
  else if(r==='tripa'&&!kil){for(const e of targets){if(e.hidden){e.hidden=0;e.hideT=3;fx.push(e.label+' sale de la niebla: ¡ahora sí lo ves!');fxe.push(e.label+' comes out of the fog: now you can see it!')}else{fx.push(e.label+' ya está a la vista.');fxe.push(e.label+' is already in sight.')}}}
  else if(r==='tripa'){fx.push('Les dijiste que no salieran. Nada cambia.');fxe.push('You told them not to come out. Nothing changes.')}
  else if(r==='trafo'&&!kil){for(const e of targets){if(e.armor){e.armor=0;e.armorT=ET[e.t].boss?4:0;fx.push(e.label+': ¡se le quiebra la coraza de piedra!');fxe.push(e.label+': its stone crust cracks apart!')}else{fx.push(e.label+' no tiene coraza que quebrar.');fxe.push(e.label+' has no crust to break.')}}}
  else if(r==='trafo'){fx.push('Les dijiste que no se quebraran. Nada cambia.');fxe.push('You told them not to break. Nothing changes.')}
  else if(r==='wütre'&&!kil){for(const e of targets){const T=ET[e.t];
      if(T.snow){e.hp=Math.min(e.max,e.hp+4);fx.push(e.label+' es de nieve: ¡le encanta el frío! (+4)');fxe.push(e.label+' is made of snow: it loves the cold! (+4)')}
      else if(e.burn){e.burn=0;e.cool=T.boss?3:0;if(!T.boss)e.stun=1;fx.push(e.label+': ¡su fuego se apaga!');fxe.push(e.label+': its fire goes out!')}
      else if(!T.boss&&Math.random()<(coll?.4:.6)){e.stun=1;fx.push(e.label+' tirita de frío y pierde su turno.');fxe.push(e.label+' shivers with cold and loses its turn.')}
      else{fx.push(e.label+' tirita, pero sigue ahí.');fxe.push(e.label+' shivers, but stays put.')}}}
  else if(r==='wütre'){fx.push('Les dijiste que no tuvieran frío. Se ven contentos.');fxe.push('You told them not to be cold. They look pleased.')}
  else if(r==='llüka'&&!kil){for(const e of targets){const T=ET[e.t];
      if(T.boss&&e.tall){fx.push(e.label+' no siente miedo mientras está erguido.');fxe.push(e.label+' feels no fear while it stands tall.');continue}
      if(T.boss||Math.random()<(coll?.75:.92)){e.fear=3;fx.push(e.label+' tiembla de miedo: golpeará más débil.');fxe.push(e.label+' trembles with fear: it will hit weaker.')}else{fx.push(e.label+' no se asusta.');fxe.push(e.label+' is not scared.')}}}
  else if(r==='llüka'){let w=0;for(const e of targets)if(e.fear){e.fear=0;w=1}fx.push(w?'Les quitaste el miedo... ¡vuelven con toda su fuerza!':'Ninguno tenía miedo.');fxe.push(w?'You took away their fear... they come back at full strength!':'None of them was afraid.')}
  else if(r==='trana'&&!kil){for(const e of targets){const T=ET[e.t];
      if(T.fly&&e.gr<=0){fx.push(e.label+' está volando: no tiene dónde caerse.');fxe.push(e.label+' is flying: it has nowhere to fall.');continue}
      if(T.boss){e.down=2;fx.push(e.label+' se tambalea e hinca una rodilla: el próximo golpe le dolerá más.');fxe.push(e.label+' staggers and drops to one knee: the next blow will hurt it more.');continue}
      e.stun=1;e.down=2;fx.push(e.label+' cae al suelo: pierde su turno, y el próximo golpe le dolerá más.');fxe.push(e.label+' falls to the ground: it loses its turn, and the next blow will hurt it more.')}}
  else if(r==='trana'){fx.push('Les dijiste que no se cayeran. Se quedan bien parados.');fxe.push('You told them not to fall. They stay firmly on their feet.')}
  else if(r==='llako'&&!kil){for(const e of targets){const T=ET[e.t];
      if(e.hidden){fx.push(e.label+' está escondido: tu canto se pierde en el agua oscura.');fxe.push(e.label+' is hidden: your song is lost in the dark water.');e.miss=1;continue}
      const ulk=B.o.chain==='llufu'&&T.boss;
      if(ulk){
        let d=atk()+rnd(4)+3;
        if(e.armor){d=Math.max(1,Math.round(d*.25));fx.push(e.label+': las placas apagan el canto.');fxe.push(e.label+': the plates muffle the song.')}
        if(e.seals&&e.seals.length){d=Math.min(2,d);fx.push(e.label+': la barrera de luz apaga casi todo el canto.');fxe.push(e.label+': the barrier of light smothers most of the song.')}
        if(e.down){d+=4;e.down=0}
        e.pend=d;e.hp-=d;
        fx.push('El ül envuelve a '+e.label+': sus anillos se aflojan, más cerca del sueño (−'+d+').');fxe.push('The ül wraps around '+e.label+': its coils loosen, closer to sleep (−'+d+').');
      }else if(T.boss){fx.push(e.label+' no se aquieta con palabras.');fxe.push(e.label+' is not stilled by words.')}
      else{const d=e.seals&&e.seals.length?Math.min(2,2):2;e.pend=d;e.hp-=d;if(!ET[e.t].fly&&Math.random()<.35)e.sl=1;
        fx.push(e.label+' se aquieta un poco (−'+d+').');fxe.push(e.label+' settles a little (−'+d+').');}}}
  else if(r==='llako'){fx.push('Les dijiste que no se calmaran. Se agitan, pero nada más pasa.');fxe.push('You told them not to calm down. They stir, but nothing more happens.')}
  else if(r==='nepe'&&!kil){for(const e of targets){
      if(e.sl){e.sl=0;const d=8;e.pend=d;e.hp-=d;fx.push(e.label+' despierta de golpe: ¡el susto lo sacude! (−'+d+')');fxe.push(e.label+' wakes with a start: the shock rattles it! (−'+d+')');continue}
      if(e.dreaming){e.dreaming=0;e.dreamT=4;e.stun=1;fx.push(e.label+' abre los ojos: su sueño gris se deshace y pierde el turno. ¡Ahora tus golpes sí le llegan!');fxe.push(e.label+' opens its eyes: its grey dream falls apart and it loses its turn. Now your blows can reach it!');continue}
      fx.push(e.label+' no dormía: te mira extrañado.');fxe.push(e.label+' was not asleep: it gives you a puzzled look.')}}
  else if(r==='nepe'){fx.push('Les dijiste que no despertaran. Nada cambia.');fxe.push('You told them not to wake up. Nothing changes.')}
  else if(r==='wüñotreka'&&!kil){for(const e of targets){const T=ET[e.t];
      if(e.tall){e.tall=0;e.low=3;e.stun=1;fx.push(e.label+' retrocede, se encoge y queda a tu alcance.');fxe.push(e.label+' steps back, shrinks down and is within your reach.');continue}
      if(T.boss&&B.tele){B.tele=false;fx.push(e.label+' retrocede y pierde el impulso: ya no se lanza.');fxe.push(e.label+' steps back and loses its momentum: it no longer lunges.');continue}
      if(!T.boss&&Math.random()<(coll?.6:.85)){e.stun=1;fx.push(e.label+' retrocede y pierde su turno.');fxe.push(e.label+' steps back and loses its turn.')}else{fx.push(e.label+' se tambalea, pero sigue ahí.');fxe.push(e.label+' staggers, but stays put.')}}}
  else if(r==='wüñotreka'){fx.push('Les dijiste que no retrocedieran. Se quedan firmes.');fxe.push('You told them not to go back. They hold their ground.')}
  if(burnT){S.hp=Math.max(1,S.hp-burnT);fx.push('¡Te quemas con su fuego! (−'+burnT+')');fxe.push('You get burned by its fire! (−'+burnT+')')}
  const eff=L('',pr.m+(S.sp>=2?'  ✦'+S.sp:''),fx.join(' '),fxe.join(' '));
  eff.fx=()=>{for(const e of targets){const p=epos(e);spark(p.x,p.y,r==='amutu'?'#fff6a0':r==='umawtu'?'#a0c8ff':r==='nag'?'#ffe080':'#ffffff',10);
      if(e.pend){e.hit=12;pop(p.x,p.y-10,'-'+e.pend,'#ffffff');sfx('hit');if(e.hp<=0&&!quizPend(e)){e.dead=true;e.fadeT=20}e.pend=0}
      else if(e.miss){pop(p.x,p.y-10,'MISS','#a0c0ff');e.miss=0}
      else if(r==='umawtu'&&e.sl){pop(p.x,p.y-10,'zZ','#c0e0ff');sfx('sleep')}
      else if(r==='nag'&&e.gr===3){pop(p.x,p.y-10,'↓','#ffe080')}
      else if(r==='küpa'&&kil){pop(p.x,p.y-10,'✋','#ffe080');sfx('block')}}};
  lines.push(eff);
  say(lines,()=>{for(const e of targets)if(e.hp<=0&&!e.dead&&!quizPend(e)){e.dead=true;e.fadeT=20}bossSweep();if(!aliveE().some(x=>x.hp>0))return victory();enemyPhase()});
}
function enemyPhase(){
  const fx=[],fxe=[];let dmgTotal=0;const hitsFx=[];
  if(B.o.chain==='llufu'&&B.turn%3===2&&S.hp<maxHP()){S.hp=Math.min(maxHP(),S.hp+6);fx.push('Los chumpall cantan a tu alrededor: su ül te devuelve fuerzas (+6).');fxe.push('The chumpall sing around you: their ül gives you strength back (+6).');hitsFx.push(()=>{spark(60,30,'#7ae0c0',10);sfx('heal')})}
  const hitP=(e,mult,tag)=>{
    if(B.blocked&&B.blocked.has(e)){fx.push(e.label+': ¡bloqueado!');fxe.push(e.label+': blocked!');hitsFx.push(()=>{const p=epos(e);pop(p.x,p.y-10,'✋','#ffe080');sfx('block')});return}
    const T=ET[e.t],rush=B.rush&&B.rush.has(e);
    const d=Math.max(1,Math.round((T.atk+rnd(3)-1)*(mult||1)*(rush?1.5:1)*(e.fear>0?.5:1))-def());S.hp-=d;dmgTotal+=d;
    fx.push(e.label+(tag?tag.es:' te golpea')+' (−'+d+').');fxe.push(e.label+(tag?tag.en:' hits you')+' (−'+d+').');
    if(T.drain){const hl=Math.ceil(d/2);e.hp=Math.min(e.max,e.hp+hl);fx.push(e.label+' bebe tu fuerza (+'+hl+').');fxe.push(e.label+' drinks your strength (+'+hl+').');hitsFx.push(()=>{const p=epos(e);pop(p.x,p.y-10,'+'+hl,'#80ff90')})}
    hitsFx.push(()=>{e.lunge=16;pop(60,30,'-'+d,'#ff6050')})};
  for(const e of aliveE()){const T=ET[e.t];
    if(e.hp<=0)continue; // staggered by the ngen's question: it does not act
    if(e.sl>0){e.sl--;fx.push(e.label+' duerme.');fxe.push(e.label+' is asleep.');continue}
    if(e.stun>0){e.stun--;fx.push(e.label+' todavía retrocede.');fxe.push(e.label+' is still backing away.');continue}
    if(e.t==='ngoyam'&&Math.random()<.3&&(S.sp||0)>0){S.sp--;fx.push(e.label+' te susurra el olvido: pierdes un punto de newen (✦).');fxe.push(e.label+' whispers forgetting to you: you lose one newen point (✦).');hitsFx.push(()=>{pop(60,30,'−✦','#c0b8ff');sfx('bad')});continue}
    if(e.t==='ngoyman1'||e.t==='llufu1'){const wat=e.t==='llufu1';
      if(!e.hidden&&e.hideT>0){e.hideT--;if(e.hideT<=0){e.hidden=1;fx.push(wat?'El agua oscura vuelve a tragarse al Kaykayfilu.':'La niebla vuelve a tragarse a Ti Fütra Ngoyman.');fxe.push(wat?'The dark water swallows the Kaykayfilu again.':'The fog swallows Ti Fütra Ngoyman again.');continue}}
      if(!e.hidden&&!e.hideT&&B.turn===0){e.hidden=1;fx.push(wat?'El Kaykayfilu se hunde en el agua oscura: no ves dónde golpear.':'El velo de niebla se cierra sobre el gran olvido: no ves dónde golpear.');fxe.push(wat?'The Kaykayfilu sinks into the dark water: you cannot see where to strike.':'The veil of fog closes over the great forgetting: you cannot see where to strike.');continue}
      hitP(e,e.hidden?1:1.3,wat?{es:' te golpea con la cola desde lo oscuro',en:' strikes you with its tail from the dark'}:{es:' te azota con un jirón de niebla',en:' lashes you with a shred of fog'});continue}
    if(e.t==='llufu2'){
      if(!e.armor){e.armorT=(e.armorT||0)-1;if(e.armorT<=0){e.armor=1;fx.push('Las placas de la mandíbula del Kaykayfilu vuelven a cerrarse.');fxe.push('The plates of the Kaykayfilu\'s jaw lock shut again.');continue}}
      hitP(e,B.turn%3===2?1.5:1,{es:' muerde con sus mandíbulas de piedra',en:' bites with its stone jaws'});continue}
    if(e.t==='llufu4'){
      if(!e.seals)e.seals=[];
      if(!e.seals.length&&B.turn>0&&B.turn%3===0){const pool=S.roots.slice();let code=pool[rnd(pool.length)];if(Math.random()<.4)code+='kil';e.seals=[code];
        fx.push('¡El piwke del Kaykayfilu alza una barrera de luz! '+sealGloss(code,'es'));fxe.push('The Kaykayfilu\'s heart raises a barrier of light! '+sealGloss(code,'en'));hitsFx.push(()=>{sfx('cast');B.flash=10});continue}
      hitP(e,1.1,{es:' late con fuerza y el agua te golpea',en:' beats hard and the water slams you'});continue}
    if(e.t==='llufu5'){
      if(B.en.length<4&&Math.random()<.3){const t2=Math.random()<.5?'kowek':'mawek',ne=mkEnemy(t2);B.en.push(ne);relabel();
        fx.push('El Kaykayfilu llama a las aguas: ¡'+ne.label+' aparece!');fxe.push('The Kaykayfilu calls the waters: '+ne.label+' appears!');continue}
      if(B.turn%3===2){hitP(e,1.9,{es:' se deja caer entero sobre ti',en:' crashes its whole body down on you'});continue}
      hitP(e,.9);hitP(e,.9,{es:' barre con la cola',en:' sweeps with its tail'});continue}
    if(e.t==='ngoyman2'){
      if(!e.armor){e.armorT=(e.armorT||0)-1;if(e.armorT<=0){e.armor=1;fx.push('La coraza gris del piwke vuelve a cerrarse.');fxe.push('The grey crust of the heart closes again.');continue}}
      if(B.turn%2===1&&(S.sp||0)>0){S.sp--;fx.push('El piwke del olvido late: una palabra tuya se borra (−✦).');fxe.push('The heart of forgetting beats: one of your words is erased (−✦).');hitsFx.push(()=>{pop(60,30,'−✦','#c0b8ff');sfx('bad')});hitP(e,.7,{es:' te golpea con su latido',en:' strikes you with its beat'});continue}
      hitP(e);continue}
    if(e.t==='ngoyman3'){
      if(!e.seals)e.seals=[];
      if(!e.seals.length&&B.turn>0&&B.turn%4===0){const pool=S.roots.slice();let code=pool[rnd(pool.length)];if(Math.random()<.4)code+='kil';e.seals=[code];
        fx.push('¡Rüf Fütra Ngoyman alza una barrera de luz robada! '+sealGloss(code,'es'));fxe.push('Rüf Fütra Ngoyman raises a barrier of stolen light! '+sealGloss(code,'en'));hitsFx.push(()=>{sfx('cast');B.flash=10});continue}
      if(B.en.length<4&&Math.random()<.3){const t2=SUMMONP[rnd(SUMMONP.length)],ne=mkEnemy(t2);B.en.push(ne);relabel();
        fx.push('El olvido recuerda a tus enemigos: ¡'+ne.label+' sale de la niebla!');fxe.push('The forgetting remembers your enemies: '+ne.label+' steps out of the fog!');continue}
      if(B.turn%3===2){hitP(e,2.0,{es:' descarga el golpe del olvido',en:' brings down the blow of forgetting'});continue}
      if(Math.random()<.25&&(S.sp||0)>0){S.sp--;fx.push('Rüf Fütra Ngoyman aspira tus palabras (−✦).');fxe.push('Rüf Fütra Ngoyman breathes in your words (−✦).');hitsFx.push(()=>{pop(60,30,'−✦','#c0b8ff');sfx('bad')})}
      hitP(e,.8);hitP(e,.8,{es:' golpea otra vez',en:' strikes again'});continue}
    if(e.t==='walichu'){
      if(!e.dreaming&&e.dreamT>0){e.dreamT--;
        if(e.dreamT<=0){e.dreaming=1;fx.push('El Walichu vuelve a envolverse en su sueño gris.');fxe.push('The Walichu wraps itself in its grey dream again.');continue}}
      if(e.dreaming&&B.turn%2===0&&(S.sp||0)>0){S.sp--;fx.push('El Walichu te susurra el olvido: pierdes un punto de newen (✦).');fxe.push('The Walichu whispers forgetting to you: you lose one newen point (✦).');hitsFx.push(()=>{pop(60,30,'−✦','#c0b8ff');sfx('bad')});hitP(e,.6,{es:' te roza con sus dedos de polvo',en:' brushes you with its dust fingers'});continue}
      hitP(e,e.dreaming?.8:1.3,e.dreaming?{es:' te golpea entre sueños',en:' strikes you from inside its dream'}:{es:' te desgarra con sus garras, bien despierto',en:' tears at you with its claws, wide awake'});continue}
    if(e.t==='kaleuche'){
      if(B.tele){B.tele=false;hitP(e,2.2,{es:' te embiste con su proa',en:' rams you with its prow'});continue}
      if(!e.hidden&&e.hideT>0){e.hideT--;if(e.hideT<=0){e.hidden=1;fx.push('La niebla se cierra: el Kaleuche desaparece en ella.');fxe.push('The fog closes in: the Kaleuche disappears into it.');continue}}
      if(!e.hidden&&!e.hideT&&B.turn===0){e.hidden=1;fx.push('El Kaleuche se esconde en la niebla.');fxe.push('The Kaleuche hides in the fog.');continue}
      const roll=Math.random(),mc=aliveE().filter(x=>x.t==='mawek').length;
      if(roll<.28&&B.turn>0&&B.turn-(e.lastTele||-9)>2){B.tele=true;e.lastTele=B.turn;fx.push('El Kaleuche despliega sus velas: el viento muerto lo empuja hacia ti.');fxe.push('The Kaleuche unfurls its sails: a dead wind pushes it toward you.');continue}
      if(roll<.45&&mc<1&&B.en.length<5){const ne=mkEnemy('mawek');B.en.push(ne);relabel();fx.push('¡Del barco baja '+ne.label+'!');fxe.push(ne.label+' comes down from the ship!');continue}
      hitP(e);continue}
    if(e.t==='cherrufe'){
      if(B.tele){B.tele=false;hitP(e,2.2,{es:' te cae encima como un río de lava',en:' falls on you like a river of lava'});continue}
      if(!e.armor&&e.armorT>0){e.armorT--;if(e.armorT<=0){e.armor=1;fx.push('La lava se endurece: la coraza del Cherufe vuelve.');fxe.push("The lava hardens: the Cherufe's crust comes back.");continue}}
      if(!e.burn&&e.cool>0){e.cool--;if(e.cool<=0){e.burn=1;fx.push('El Cherufe vuelve a arder.');fxe.push('The Cherufe bursts into flame again.');continue}}
      const roll=Math.random(),kc=aliveE().filter(x=>x.t==='kutral').length;
      if(roll<.28&&B.turn>0&&B.turn-(e.lastTele||-9)>2){B.tele=true;e.lastTele=B.turn;fx.push('El Cherufe levanta los brazos: la lava hierve a sus pies.');fxe.push('The Cherufe raises its arms: the lava boils at its feet.');continue}
      if(roll<.45&&kc<1&&B.en.length<5){const ne=mkEnemy('kutral');B.en.push(ne);relabel();fx.push('¡El Cherufe lanza una chispa: aparece '+ne.label+'!');fxe.push('The Cherufe throws a spark: '+ne.label+' appears!');continue}
      hitP(e);continue}
    if(e.t==='witranalwe'){
      if(B.tele){B.tele=false;hitP(e,2.2,{es:' se lanza sobre ti',en:' lunges at you'});continue}
      if(!e.tall&&e.low>0){e.low--;if(e.low<=0){e.tall=1;fx.push('Witranalwe vuelve a erguirse, altísimo.');fxe.push('The Witranalwe rises up again, towering.');continue}}
      const roll=Math.random(),kc=aliveE().filter(x=>x.t==='kolokolo').length;
      if(roll<.3&&B.turn>0&&B.turn-(e.lastTele||-9)>2){B.tele=true;e.lastTele=B.turn;fx.push('Witranalwe se agacha y junta fuerza para lanzarse.');fxe.push('The Witranalwe crouches and gathers strength to lunge.');continue}
      if(roll<.48&&kc<1&&B.en.length<5){const ne=mkEnemy('kolokolo');B.en.push(ne);relabel();fx.push('¡Witranalwe llama a '+ne.label+'!');fxe.push('The Witranalwe calls '+ne.label+'!');continue}
      hitP(e);continue}
    if(e.t==='trelke'){
      if(B.tele){B.tele=false;hitP(e,2.2,{es:' te envuelve',en:' wraps around you'});continue}
      const roll=Math.random(),laf=aliveE().filter(x=>x.t==='laftrache').length;
      if(roll<.32&&B.turn>0){B.tele=true;fx.push('Trelke-wekufü se estira, listo para envolverte.');fxe.push('Trelke-wekufü stretches out, ready to wrap you up.');continue}
      if(roll<.52&&laf<1&&B.en.length<5){const ne=mkEnemy('laftrache');B.en.push(ne);relabel();fx.push('¡Trelke-wekufü llama a '+ne.label+'!');fxe.push('Trelke-wekufü calls up '+ne.label+'!');continue}
      hitP(e);continue}
    if(e.t==='chinifilu'){
      if(B.turn>0&&B.turn%3===0){hitP(e,1.6,{es:' te envuelve en sus anillos y aprieta',en:' wraps you in its coils and squeezes'});continue}
      if(!S.curse&&Math.random()<.3){S.curse=1;fx.push('El Chiñifilu escupe un chorro de agua helada: quedas con maldición (fuerza −2). El lawen la quita.');fxe.push('The Chiñifilu spits a jet of icy water: you are cursed (strength −2). Lawen lifts it.');hitsFx.push(()=>sfx('bad'));continue}
      hitP(e);continue}
    if(e.t==='piwuchen'){
      if(B.turn>0&&B.turn%3===0&&(S.sp||0)>0){S.sp--;fx.push('El silbido agudo del Piwüchen te aturde: pierdes un punto de newen (✦).');fxe.push('The Piwüchen\'s shrill whistle rattles you: you lose one newen point (✦).');hitsFx.push(()=>{pop(60,30,'−✦','#c0b8ff');sfx('bad')});continue}
      hitP(e,Math.random()<.35?1.4:1,{es:' baja en picada y te muerde',en:' dives and bites you'});continue}
    if(e.t==='wallipen'){
      if(!S.chill&&Math.random()<.3){S.chill=3;fx.push('El Wallepeñ te clava su mirada torcida: te tiemblan las manos (fuerza −2 por unos turnos).');fxe.push('The Wallepeñ fixes you with its crooked gaze: your hands shake (strength −2 for a few turns).');hitsFx.push(()=>sfx('bad'));continue}
      if(!e.armor&&e.armorT>0){e.armorT--;if(e.armorT<=0){e.armor=1;fx.push('El agua se congela sobre el Wallepeñ: su coraza de hielo vuelve.');fxe.push('Water freezes over the Wallepeñ: its ice crust returns.');continue}}
      hitP(e);continue}
    if(e.t==='trawko'){
      if(B.tele){B.tele=false;hitP(e,2.2,{es:' descarga su hacha con las dos manos',en:' brings its axe down with both hands'});continue}
      if(Math.random()<.3&&B.turn>0&&B.turn-(e.lastTele||-9)>2){B.tele=true;e.lastTele=B.turn;fx.push('El Trawko levanta su hacha sobre la cabeza...');fxe.push('The Trawko raises its axe over its head...');continue}
      hitP(e);continue}
    if(e.t==='chadikura'){
      if(B.turn>0&&B.turn%3===0){hitP(e,1.7,{es:' golpea el suelo: una ola de sal te sacude',en:' pounds the ground: a wave of salt rocks you'});hitsFx.push(()=>{B.shake=10});continue}
      if(!e.armor&&e.armorT>0){e.armorT--;if(e.armorT<=0){e.armor=1;fx.push('La sal vuelve a cristalizar: la coraza del Elëngasëm se rehace.');fxe.push('The salt crystallizes again: the Elëngasëm\'s crust reforms.');continue}}
      hitP(e);continue}
    if(e.t==='epunamun'){
      if(!e.parry&&Math.random()<.3){e.parry=1;fx.push('El Epunamun cruza sus dos lanzas y espera tu golpe.');fxe.push('The Epunamun crosses his two spears and waits for your blow.');continue}
      hitP(e,.85);hitP(e,.85,{es:' gira y golpea con la segunda lanza',en:' spins and strikes with the second spear'});continue}
    if(e.t==='kalku'){
      const ac=aliveE().filter(x=>x.t==='anchi').length;
      if(ac<1&&B.en.length<5&&Math.random()<.35){const ne=mkEnemy('anchi');B.en.push(ne);relabel();fx.push('El Fütra Kalku llama a su creación: ¡aparece '+ne.label+'!');fxe.push('The Fütra Kalku calls his creation: '+ne.label+' appears!');continue}
      if(!S.curse&&Math.random()<.3){S.curse=1;fx.push('El Fütra Kalku te apunta con el dedo y susurra: quedas con maldición (fuerza −2). El lawen la quita.');fxe.push('The Fütra Kalku points at you and whispers: you are cursed (strength −2). Lawen lifts it.');hitsFx.push(()=>sfx('bad'));continue}
      if(B.turn>0&&B.turn%3===0){hitP(e,1.6,{es:' descarga un latigazo de sombra',en:' lashes you with a whip of shadow'});continue}
      hitP(e);continue}
    if(T.boss){
      if(B.turn>0&&B.turn%3===0)hitP(e,1.6,{es:' te embiste con todas sus fuerzas',en:' charges you with all its strength'});
      else hitP(e);continue}
    if(e.t==='anchi'&&Math.random()<.3){const hurt=aliveE().filter(x=>x!==e&&x.hp<x.max);if(hurt.length){const h=hurt[0];h.hp=Math.min(h.max,h.hp+5);fx.push(e.label+' brilla y cura a '+h.label+' (+5).');fxe.push(e.label+' glows and heals '+h.label+' (+5).');hitsFx.push(()=>{const p=epos(h);pop(p.x,p.y-10,'+5','#80ff90');sfx('heal')});continue}}
    if(T.twice){hitP(e,.7);hitP(e,.7,{es:' vuelve a morder',en:' bites again'});continue}
    if((e.t==='chonchon'||T.curse)&&!S.curse&&Math.random()<.25&&!(B.blocked&&B.blocked.has(e))){S.curse=1;fx.push(e.label+' grita "¡tue, tue!": quedas con maldición (fuerza −2). El lawen la quita.');fxe.push(e.label+' cries "tue, tue!": you are cursed (strength −2). Lawen lifts it.');hitsFx.push(()=>sfx('bad'));continue}
    hitP(e)}
  for(const e of aliveE()){if(e.gr>0)e.gr--;if(e.fear>0)e.fear--}
  if(S.chill>0)S.chill--;
  if(S.gear.lafkenkura&&S.hp>0&&S.hp<maxHP()){S.hp=Math.min(maxHP(),S.hp+2)}
  B.blocked=null;B.rush=null;B.turn++;
  const lines=[];
  if(fx.length){const l=N(fx.join(' '),fxe.join(' '));l.fx=()=>{hitsFx.forEach(f=>f());if(dmgTotal){B.shake=12;B.red=10;sfx('hurt')}};lines.push(l)}
  const bossE=aliveE().find(x=>ET[x.t].boss),bn=bossE?ET[bossE.t].name:'';
  if(B.tele&&bossE)lines.push(L(bn,'Küpaley '+bn+'!','¡'+bn+' viene!',bn+' is coming!'));
  if(bossE&&bossE.hidden&&!B.hideHint&&B.turn>=1&&S.roots.includes('tripa')){B.hideHint=1;lines.push(N('Pista: escondido en la niebla, nada lo alcanza. Quizás si le dices que salga...','Hint: hidden in the fog, nothing reaches it. Maybe if you tell it to come out...'))}
  if(aliveE().some(x=>x.armor)&&!B.armorHint&&B.turn>=1){B.armorHint=1;lines.push(N('Pista: los golpes rebotan en la coraza de piedra. Quizás si le dices que se quiebre...','Hint: blows bounce off the stone crust. Maybe if you tell it to break...'))}
  if(bossE&&bossE.t==='cherrufe'&&bossE.burn&&!B.fireHint&&B.turn>=2&&S.roots.includes('wütre')){B.fireHint=1;lines.push(N('Pista: su fuego te quema cada vez que lo atacas. El frío podría apagarlo.','Hint: its fire burns you every time you attack it. The cold could put it out.'))}
  if(bossE&&bossE.t==='witranalwe'&&bossE.tall&&!B.tallHint&&B.turn>=1){B.tallHint=1;lines.push(N('Pista: erguido así, nada lo alcanza. Quizás si le dices que vuelva atrás...','Hint: standing tall like that, nothing reaches it. Maybe if you tell it to go back...'))}
  if(bossE&&bossE.seals&&bossE.seals.length&&B.turn%3===1){lines.push(N('Los sellos de luz giran alrededor de '+bossE.label+'. '+sealGloss(bossE.seals[0],'es'),'The seals of light spin around '+bossE.label+'. '+sealGloss(bossE.seals[0],'en')))}
  if(B.tele&&!B.teleHint&&bossE){B.teleHint=1;lines.push(N('Pista: dile que no venga (küpa- con -kil-), a él solo o a todos, con la terminación correcta.','Hint: tell it not to come (küpa- with -kil-), to it alone or to all of them, with the right ending.'))}
  say(lines,()=>{
    if(S.hp<=0){S.hp=0;return defeat()}
    battleMenu()});
}
const LLSING=[['Kallfüko','de pelo como agua quieta','with hair like still water'],['Milla ül','que canta con dos voces','who sings with two voices'],['Lafkenray','coronada de espuma','crowned with foam'],['Kürüko','el más viejo de todos','the oldest of them all']];
function llufuStage(nx){
  const e=mkEnemy(nx);B.en=[e];relabel();B.tele=false;B.blocked=null;B.rush=null;sfx('lvl');B.flash=16;B.shake=10;
  S.hp=maxHP();S.sp=SPMAX;e.hp-=12;
  const k={llufu2:0,llufu3:1,llufu4:2,llufu5:3}[nx],[snm,sd,sde]=LLSING[k];
  const forms={llufu2:[N('¡Las aguas se abren! El Kaykayfilu alza la cabeza: una mandíbula enorme de placas de piedra, llena de dientes.','The waters part! The Kaykayfilu raises its head: a huge jaw of stone plates, full of teeth.')],
    llufu3:[N('El Kaykayfilu despliega una tormenta de aletas: el agua entera se vuelve un remolino de filos.','The Kaykayfilu unfurls a storm of fins: the whole water becomes a whirl of blades.')],
    llufu4:[N('Entre sus anillos aparece su piwke: un corazón que late luz robada, protegido por barreras.','Within its coils appears its piwke: a heart beating with stolen light, guarded by barriers.')],
    llufu5:[N('El Kaykayfilu entero se alza desde el fondo, más grande que la ruka más grande: Rüf Kaykayfilu, la gran serpiente de las aguas.','The whole Kaykayfilu rears up from the depths, bigger than the biggest ruka: Rüf Kaykayfilu, the great serpent of the waters.')]}[nx];
  forms.push(N('El chumpall '+snm+', '+sd+', canta a tu lado: tu piwke y tu newen se llenan de nuevo, y su ül golpea a la serpiente (−12).','The chumpall '+snm+', '+sde+', sings at your side: your hearts and your newen fill again, and their ül strikes the serpent (−12).'));
  say(forms,battleMenu);
}
function postLlufu(){
  S.flags.chboss=1;S.gear.lafkenkura=1;persist();sfx('lvl');
  say([N('El Rüf Kaykayfilu deja de luchar: el ül de los chumpall lo envuelve y lo aquieta. En paz, se hunde despacio hacia una fosa tan honda que ni los chumpall la conocen. El agua queda limpia y quieta.','The Rüf Kaykayfilu stops fighting: the chumpall\'s ül wraps around it and stills it. At peace, it sinks slowly into a trench so deep not even the chumpall know it. The water is left clean and still.'),
    L('Ñidol chumpall','Chaltu may, '+nm()+'. Taiñ lafken montuy.','Gracias, '+nm()+'. Nuestro mar está a salvo.','Thank you, '+nm()+'. Our sea is safe.'),
    N('Los cinco cantores chumpall te rodean y cantan juntos una sola vez. El agua entera brilla.','The five chumpall singers surround you and sing together, just once. The whole water glows.'),
    Object.assign(L('','Lafkenkura!','La ñidol chumpall te regala una lafkenkura, una piedra del mar: desde ahora recuperas 2 de newen en cada turno de pelea.','The chumpall leader gives you a lafkenkura, a sea stone: from now on you recover 2 newen every battle turn.'),{fx:()=>sfx('lvl')})],
    ()=>gainPiwke([N('Y entre las algas, algo rojo brilla...','And among the kelp, something red glints...')]));
}
function ngoyStage(n){
  const e=mkEnemy(n===2?'ngoyman2':'ngoyman3');B.en=[e];relabel();B.tele=false;B.blocked=null;B.rush=null;sfx('lvl');B.flash=16;B.shake=10;
  const ls=n===2?[N('El velo de niebla se rasga de arriba abajo... y detrás no hay cuerpo: hay un piwke enorme de piedra gris, envuelto en una coraza de olvido, latiendo despacio.','The veil of fog tears from top to bottom... and behind it there is no body: there is a huge heart of grey stone, wrapped in a crust of forgetting, beating slowly.'),
      N('Es el corazón del gran olvido. Cada latido borra una palabra en alguna parte.','It is the heart of the great forgetting. Every beat erases a word somewhere.')]
    :[N('¡El piwke de piedra se parte en dos! De la grieta sale todo lo que el olvido se ha tragado: un coloso de niebla y silencio, con dos ojos como lunas apagadas. Esto es Rüf Fütra Ngoyman: el verdadero gran olvido.','The stone heart splits in two! Out of the crack pours everything the forgetting has swallowed: a colossus of fog and silence, with two eyes like burnt-out moons. This is Rüf Fütra Ngoyman: the true great forgetting.')];
  if(n===3&&S.flags.epu_won){S.hp=maxHP();S.sp=SPMAX;e.hp-=15;
    ls.push(N('Entonces una lanza cruza la niebla y se clava en el coloso (−15). El Epunamun aparece a tu lado, con las dos caras de frente al olvido: «¡Feypin! ¡Pelearía a tu lado!». Su newen te llena de nuevo: piwke y palabras al máximo.','Then a spear crosses the fog and sinks into the colossus (−15). The Epunamun appears at your side, both faces turned to the forgetting: "I said it! I would fight at your side!" His newen fills you again: hearts and words restored.'))}
  say(ls,battleMenu);
}
function bossSweep(){
  if((B.o.final||B.o.chain==='llufu')&&aliveE().length&&!aliveE().some(x=>ET[x.t].boss)){
    for(const x of aliveE()){x.hp=0;x.pend=0;x.dead=true;x.fadeT=20}}}

/* La voz del ngen: pregunta final (no imperativa) antes de que caiga un jefe.
   Bien respondida, el jefe cae; mal respondida, recupera fuerzas. */
const NGENQ=[
  {m:'Amun.',es:'¿Quién fue?',en:'Who went?',o:['iñche','eymi','fey'],a:0},
  {m:'Amuymi.',es:'¿Quién fue?',en:'Who went?',o:['iñche','eymi','fey'],a:1},
  {m:'Umawtuy.',es:'¿Quién durmió?',en:'Who slept?',o:['iñche','eymi','fey'],a:2},
  {m:'Amuan.',es:'¿Qué dice?',en:'What does it say?',o:[['voy a ir','I will go'],['fui','I went'],['suelo ir','I usually go']],a:0},
  {m:'Amuken.',es:'¿Qué dice?',en:'What does it say?',o:[['suelo ir','I usually go'],['voy a ir','I will go'],['no voy','I do not go']],a:0},
  {m:'Umawtukefun.',es:'¿Qué dice?',en:'What does it say?',o:[['antes solía dormir','I used to sleep'],['voy a dormir','I will sleep'],['estoy durmiendo','I am sleeping']],a:0},
  {m:'Amurkey.',es:'¿Qué dice el -rke-?',en:'What does -rke- say?',o:[['dicen que fue','they say it went'],['fue dos veces','it went twice'],['quiere ir','it wants to go']],a:0},
  {m:'Amulan.',es:'¿Qué dice?',en:'What does it say?',o:[['no voy / no fui','I do not go / did not go'],['voy a ir','I will go'],['ve tú','you go']],a:0},
  {m:'Küpalay.',es:'¿Qué dice?',en:'What does it say?',o:[['no viene / no vino','it does not come / did not come'],['ya viene','it is coming'],['ven tú','you come']],a:0},
  {m:'ñi ruka',es:'¿Qué significa?',en:'What does it mean?',o:[['mi casa','my house'],['tu casa','your house'],['nuestra casa','our house']],a:0},
  {m:'mi chaw',es:'¿Qué significa?',en:'What does it mean?',o:[['tu padre','your father'],['mi padre','my father'],['su padre','their father']],a:0},
  {m:'taiñ mapu',es:'¿Qué significa?',en:'What does it mean?',o:[['nuestra tierra','our land'],['mi tierra','my land'],['tu tierra','your land']],a:0},
  {m:'pu che',es:'¿Qué significa?',en:'What does it mean?',o:[['las personas','the people'],['una persona','one person'],['la tierra','the land']],a:0},
  {m:'Chem am "challwa"?',es:'',en:'',o:[['el pez','fish'],['el fuego','fire'],['la lluvia','rain']],a:0},
  {m:'Chem am "kütral"?',es:'',en:'',o:[['el fuego','fire'],['la piedra','stone'],['el viento','wind']],a:0},
  {m:'Chem am "mawün"?',es:'',en:'',o:[['la lluvia','rain'],['la nieve','snow'],['el mar','the sea']],a:0},
  {m:'Chem am "kürüf"?',es:'',en:'',o:[['el viento','wind'],['el sol','the sun'],['el canto','the song']],a:0},
  {m:'Chem am "wangülen"?',es:'',en:'',o:[['la estrella','star'],['la luna','moon'],['la noche','night']],a:0},
  {m:'Chem am "piwke"?',es:'',en:'',o:[['el corazón','the heart'],['la cabeza','the head'],['la mano','the hand']],a:0},
  {m:'Chem am "newen"?',es:'',en:'',o:[['la fuerza','strength'],['el miedo','fear'],['el sueño','sleep']],a:0},
  {m:'Chem am "kimün"?',es:'',en:'',o:[['el conocimiento','knowledge'],['el olvido','forgetting'],['la comida','food']],a:0},
  {m:'epu mari kiñe',es:'¿Qué número es?',en:'Which number is it?',o:['21','12','31'],a:0},
  {m:'küla mari',es:'¿Qué número es?',en:'Which number is it?',o:['30','13','33'],a:0},
  {m:'kiñe pataka',es:'¿Qué número es?',en:'Which number is it?',o:['100','10','1000'],a:0}];
function ngenQuiz(qb){
  const en=S.gloss==='en';
  const Q=NGENQ[rnd(NGENQ.length)];
  const who=B.o.chain==='llufu'?['las voces de los chumpall',"the chumpall's voices"]:B.o.final?['las cinco voces de los ngen','the five voices of the ngen']:['la voz del ngen de esta tierra',"the voice of this land's ngen"];
  say([N(qb.label+' se tambalea, a punto de caer... y el tiempo se detiene. En tu cabeza suena, honda como la tierra, '+who[0]+'.',qb.label+' staggers, about to fall... and time stops. Deep as the earth, '+who[1]+' sounds inside your head.'),
    L('','Kiñe ramtun.','«Una pregunta. Si respondes bien, tu palabra será el golpe final.»','"One question. Answer well, and your word will be the final blow."')],()=>{
    const opts=Q.o.map((o,i)=>({m:Array.isArray(o)?(en?o[1]:o[0]):o,v:i}));
    for(let a=opts.length-1;a>0;a--){const b=rnd(a+1);[opts[a],opts[b]]=[opts[b],opts[a]]}
    choose({m:'«'+Q.m+'»',es:Q.es,en:Q.en},opts,v=>{
      if(v===Q.a){sfx('lvl');B.flash=16;B.shake=10;qb.stag=0;qb.hp=0;qb.dead=true;qb.fadeT=20;B.qok=1;
        say([N('Respondes, y la palabra sale de ti como un golpe de luz. '+qb.label+' cae.','You answer, and the word leaves you like a blow of light. '+qb.label+' falls.')],victory);}
      else{sfx('bad');qb.stag=0;const rg=Math.max(4,Math.round(ET[qb.t].hp*(.15+Math.random()*.25)));qb.hp=Math.min(ET[qb.t].hp,qb.hp+rg);
        say([N('La palabra se te escapa... El tiempo vuelve a correr y '+qb.label+' se endereza, recuperando fuerzas (+'+rg+'). La respuesta era: '+(Array.isArray(Q.o[Q.a])?(en?Q.o[Q.a][1]:Q.o[Q.a][0]):Q.o[Q.a])+'.','The word slips away... Time runs again and '+qb.label+' straightens, recovering strength (+'+rg+'). The answer was: '+(Array.isArray(Q.o[Q.a])?(en?Q.o[Q.a][1]:Q.o[Q.a][0]):Q.o[Q.a])+'.')],battleMenu);}
    },false,true);
  });
}
function victory(){
  if(B.o.final){const st=B.en[0].t;
    if(st==='ngoyman1')return ngoyStage(2);
    if(st==='ngoyman2')return ngoyStage(3);}
  if(B.o.chain==='llufu'){const st=B.en.find(e=>ET[e.t].boss);
    const nx={llufu1:'llufu2',llufu2:'llufu3',llufu3:'llufu4',llufu4:'llufu5'}[st&&st.t];
    if(nx)return llufuStage(nx);}
  {const qb=B.en.find(e=>ET[e.t].boss);
   if(qb&&!B.qok){qb.dead=false;qb.fadeT=0;qb.hit=0;qb.hp=1;qb.stag=1;return ngenQuiz(qb)}}
  const xp=B.en.reduce((a,e)=>a+ET[e.t].xp,0);let gold=B.en.reduce((a,e)=>{const g=ET[e.t].gold;return a+g[0]+rnd(g[1]-g[0]+1)},0);
  if(S.pw.gold){gold*=2;S.pw.gold=0}
  S.xp+=xp;S.gold+=gold;
  const after=SONGS.win;after.after=()=>mapSong();playSong('win');
  const ls=[N('¡Los wekufü se van!','The wekufü are gone!'),L('','+'+numW(gold)+' ngülliw','Ganas '+numP(gold)+' ngülliw y '+numP(xp)+' de kimün.','You gain '+numP(gold)+' ngülliw and '+numP(xp)+' kimün.')];
  while(S.xp>=xpNeed()){S.xp-=xpNeed();S.lvl++;S.baseMax+=HPQ;S.hp+=HPQ;S.baseAtk+=1;if(S.lvl%2===0)S.baseDef+=1;
    const l=L('','Doy kimün!','¡Más conocimiento! Llegas a kimün '+S.lvl+': ganas un corazón y más fuerza.','More knowledge! You reach kimün '+S.lvl+': you gain a heart and more strength.');l.fx=()=>sfx('lvl');ls.push(l)}
  say(ls,()=>endBattle('win'));
}
function defeat(){
  const lost=Math.floor(S.gold/4);S.gold-=lost;playSong('intro');
  const gm=MAPS[CUR].region==='nagche'?'chuchu':MAPS[CUR].region==='pewenche'?'laku':MAPS[CUR].region==='williche'?'cheche':'kuku';
  say([N('Te quedas sin fuerzas... Tu '+gm+' te encuentra y te lleva junto al kütral.'+(lost?' Pierdes '+numP(lost)+' ngülliw.':''),'You collapse... Your '+gm+' finds you and carries you back to the fire.'+(lost?' You lose '+numP(lost)+' ngülliw.':''))],()=>{
    S.curse=0;S.hp=maxHP();mode='map';B=null;const sv=S.save;AU.name=null;loadMap(sv.map,sv.x,sv.y)});
}
function endBattle(how){
  const o=B.o;mode='map';grace=how==='flee'?90:30;
  if(how==='win'&&o.ent){ents=ents.filter(e=>e!==o.ent);if(o.ent.flag)S.flags[o.ent.flag]=1}
  B=null;persist();
  if(how!=='win'||!AU.song||AU.name!=='win')playSong(mapSong());
  if(how==='win'&&o.sflag==='epu_won'){S.flags.epu_won=1;S.gear.waiki=1;persist();sfx('lvl');
    return say([N('El Epunamun baja las dos lanzas a la vez. No se deshace, no huye: te saluda, con las dos caras sonriendo.','The Epunamun lowers both spears at once. He does not break apart, he does not flee: he salutes you, both faces smiling.'),
      L('Epunamun','Tuteymi! Newen nieymi, kimün nieymi.','¡Lo lograste! Tienes fuerza y tienes conocimiento.','You did it! You have strength and you have knowledge.'),
      L('Epunamun','Tüfa tañi waiki. Yenge.','Esta es mi lanza. Llévala.','This is my spear. Carry it.'),
      Object.assign(L('','Epunamun ñi waiki!','El Epunamun te regala una de sus lanzas: tu fuerza sube +2 para siempre. Dice que la otra la guardará para pelear a tu lado, algún día, al otro lado de la niebla.','The Epunamun gives you one of his spears: your strength rises +2 for good. He says he will keep the other, to fight at your side one day, on the far side of the fog.'),{fx:()=>sfx('lvl')})],
      ()=>gainPiwke([N('Donde golpearon sus lanzas, algo rojo brilla en el suelo...','Where his spears struck, something red glints on the ground...')]));}
  if(how==='win'&&o.sflag){S.flags[o.sflag]=1;persist();sfx('lvl');
    return say([N('El wekufü secreto se deshace en jirones de sombra que el viento se lleva.','The secret wekufü breaks apart into shreds of shadow that the wind carries away.'),
      L('','Newen!','Venciste a uno de los wekufü escondidos. Pocos pueden contarlo.','You defeated one of the hidden wekufü. Few can say the same.')],()=>gainPiwke([N('Donde estaba, algo rojo brilla en el suelo...','Where it stood, something red glints on the ground...')]));}
  if(how==='win'&&o.final)return postFinal();
  if(how==='win'&&o.chain==='llufu')return postLlufu();
  if(how==='win'&&o.boss)postBoss();
}
function stepBackFromNgen(){
  const [sx2,sy2]=placeNear(8,9);P.x=sx2;P.y=sy2;P.fx=sx2;P.fy=sy2;P.ox=sx2;P.oy=sy2;P.moving=false;P.dir='up';
}
function postBoss(){
  if(CUR==='ngen2')return postBoss2();
  if(CUR==='ngen3')return postBoss3();
  if(CUR==='ngen4')return postBoss4();
  if(CUR==='ngen5')return postBoss5();
  say([N('El cuero de Trelke-wekufü se hunde y el agua se aclara. Una figura de espuma y luz se levanta de la laguna.','Trelke-wekufü\'s hide sinks and the water clears. A figure of foam and light rises from the lagoon.')],()=>{
    S.flags.ngen=1;S.flags.dive=1;S.pieces=S.pieces||[];if(!S.pieces.includes('lafkenche'))S.pieces.push('lafkenche');S.flags.awake_lafkenche=1;if(CUR==='ngen')grid[7][8]='A';S.hp=Math.min(maxHP(),S.hp+HPQ);AU.name=null;playSong('ngen');
    stepBackFromNgen();const e=Object.assign({},MAPS.ngen.ents[1]);e.fx=e.x;e.fy=e.y;ents.push(e);persist();sfx('lvl');
    say([L('Ngen-lafken','Mari mari, '+nm()+'.','Hola, '+nm()+'.','Hello, '+nm()+'.'),
      N('Hacía mucho tiempo que nadie me hablaba en mapudungun.','It had been a long time since anyone spoke to me in Mapudungun.'),
      L('Ngen-lafken','Chaltu may.','Gracias.','Thank you.'),
      N('Ngen-lafken te da su newen: ahora puedes sumergirte en los remolinos oscuros del agua. Además ganas un corazón nuevo.','Ngen-lafken gives you its newen: now you can dive into the dark whirlpools in the water. You also gain a new heart.'),
      L('Ngen-lafken','Mapudungukeaiñ!','¡Hablemos mapudungun!',"Let's speak Mapudungun!"),
      Object.assign(L('','Kiñe trariwe trokiñ!','Entre la espuma queda algo tejido: un trokiñ (pedazo) de un trariwe antiguo, con figuras del mar. Tienes 1 de 5.','Something woven is left in the foam: a trokiñ (piece) of an ancient trariwe, with figures of the sea. You have 1 of 5.'),{fx:()=>{sfx('lvl')}}),
      N('Dicen que un trariwe completo, con un trokiñ de cada tierra, es lo único que puede atravesar la niebla del olvido y llegar hasta su origen: Ti Fütra Ngoyman, el gran olvido.','They say a complete trariwe, with one trokiñ from each land, is the only thing that can pass through the fog of forgetting and reach its source: Ti Fütra Ngoyman, the great forgetting.'),
      N('Un círculo de luz aparece en el islote: pisándolo puedes volver a la entrada de la cueva o al lof.','A circle of light appears on the islet: step on it to return to the cave entrance or to the lof.'),
      N('Fin de la región lafkenche (prototipo). Puedes volver a los remolinos de las dunas y de la orilla: ahora sí puedes explorarlos. Las demás regiones esperan: Nagche, Pewenche, Williche y Puelmapu.','End of the Lafkenche region (prototype). You can go back to the whirlpools in the dunes and on the shore: now you can explore them. The other regions are waiting: Nagche, Pewenche, Williche and Puelmapu.')]);
  });
}


function postBoss2(){
  say([N('El Witranalwe se deshace en una luz fría que se apaga entre los árboles. El claro se llena de olor a tierra mojada, y del tronco más viejo sale una figura verde y dorada.','The Witranalwe breaks apart into a cold light that fades among the trees. The clearing fills with the smell of wet earth, and a green and golden figure steps out of the oldest trunk.')],()=>{
    S.flags.ngen2=1;S.flags.bramble=1;S.pieces=S.pieces||[];if(!S.pieces.includes('nagche'))S.pieces.push('nagche');
    grid[7][8]='A';for(let y=0;y<M.h;y++)for(let x=0;x<M.w;x++)if(grid[y][x]==='Ñ')grid[y][x]=M.floor;
    S.hp=Math.min(maxHP(),S.hp+HPQ);AU.name=null;playSong(rsong('ngen'));
    stepBackFromNgen();const e=Object.assign({},MAPS.ngen2.ents[1]);e.fx=e.x;e.fy=e.y;ents.push(e);persist();sfx('lvl');
    say([L('Ngen-mawida','Mari mari, '+nm()+'.','Hola, '+nm()+'.','Hello, '+nm()+'.'),
      L('Ngen-mawida','Alün umawtun. Tami dungun mew nepen.','Dormí mucho tiempo. Con tus palabras desperté.','I slept a long time. With your words I woke up.'),
      N('Ngen-mawida es el ngen del monte: cuida los árboles, el lawen y los animales que viven entre ellos.','Ngen-mawida is the ngen of the forest: it looks after the trees, the medicine plants, and the animals that live among them.'),
      N('Ngen-mawida te da su newen: ahora los zarzales espinudos se apartan cuando pasas. Además ganas un corazón nuevo.','Ngen-mawida gives you its newen: now the thorny brambles move aside when you pass. You also gain a new heart.'),
      Object.assign(L('','Epu trariwe trokiñ!','Entre las raíces queda otro trokiñ del trariwe antiguo, tejido en verde y amarillo. Tienes 2 de 5.','Among the roots lies another trokiñ of the ancient trariwe, woven in green and yellow. You have 2 of 5.'),{fx:()=>sfx('pick')}),
      N('Un círculo de luz aparece en el claro: pisándolo puedes volver a la entrada de la guarida, al lof nagche o a las tierras lafkenche.','A circle of light appears in the clearing: step on it to return to the lair entrance, the Nagche lof, or the Lafkenche lands.'),
      N('Fin de la región nagche (prototipo). Vuelve a los zarzales que viste en el camino: ahora puedes pasar. Faltan Pewenche, Williche y Puelmapu.','End of the Nagche region (prototype). Go back to the brambles you saw on the road: now you can get through. Pewenche, Williche and Puelmapu remain.')]);
  });
}

function postBoss3(){
  say([N('La coraza del Cherufe se parte en mil pedazos y su fuego se hunde en la lava, que se enfría y se vuelve piedra. Desde una grieta brota una semilla, y en un instante crece un pewen joven y dorado.','The Cherufe\'s crust splits into a thousand pieces and its fire sinks into the lava, which cools and turns to stone. A seed sprouts from a crack, and in an instant a young golden pewen grows.')],()=>{
    S.flags.ngen3=1;S.flags.snow=1;S.pieces=S.pieces||[];if(!S.pieces.includes('pewenche'))S.pieces.push('pewenche');
    grid[7][8]='A';for(let y=0;y<M.h;y++)for(let x=0;x<M.w;x++)if(grid[y][x]==='^')grid[y][x]=M.floor;
    S.hp=Math.min(maxHP(),S.hp+HPQ);AU.name=null;playSong(rsong('ngen'));
    stepBackFromNgen();const e=Object.assign({},MAPS.ngen3.ents[1]);e.fx=e.x;e.fy=e.y;ents.push(e);persist();sfx('lvl');
    say([L('Ngen-pewen','Mari mari, '+nm()+'.','Hola, '+nm()+'.','Hello, '+nm()+'.'),
      L('Ngen-pewen','Tami dungun mew nepen.','Con tus palabras desperté.','With your words I woke up.'),
      N('Ngen-pewen es el ngen de los pewenes: cuida los árboles, sus ngülliw y a la gente que vive de ellos.','Ngen-pewen is the ngen of the pewen trees: it looks after the trees, their nuts, and the people who live from them.'),
      N('Ngen-pewen te da su newen: ahora la nieve dura se abre cuando pasas. Además ganas un corazón nuevo.','Ngen-pewen gives you its newen: now the hard snow opens when you pass. You also gain a new heart.'),
      Object.assign(L('','Küla trariwe trokiñ!','Entre la piedra todavía tibia queda otro trariwe trokiñ, tejido en café y blanco. Tienes 3 de 5.','In the still-warm stone lies another trariwe trokiñ, woven in brown and white. You have 3 of 5.'),{fx:()=>sfx('pick')}),
      N('Un círculo de luz aparece en el cráter: pisándolo puedes volver a la entrada de la morada, al lof pewenche o a las otras tierras.','A circle of light appears in the crater: step on it to return to the lair entrance, the Pewenche lof, or the other lands.'),
      N('Fin de la región pewenche (prototipo). Vuelve a los montones de nieve que viste en el camino: ahora puedes pasar. Faltan Williche y Puelmapu.','End of the Pewenche region (prototype). Go back to the snow heaps you saw on the road: now you can get through. Williche and Puelmapu remain.')]);
  });
}

function postBoss4(){
  say([N('Las velas del Kaleuche se rasgan y sus luces se apagan una a una. El barco se hunde en la niebla... y entonces sopla un viento fresco que la deshace por completo. Sobre el agua aparece una figura de aire, blanca y celeste.','The Kaleuche\'s sails tear and its lights go out one by one. The ship sinks into the fog... and then a fresh wind blows and scatters it completely. Above the water appears a figure made of air, white and sky blue.')],()=>{
    S.flags.ngen4=1;S.flags.wind=1;S.pieces=S.pieces||[];if(!S.pieces.includes('williche'))S.pieces.push('williche');
    grid[7][8]='A';for(let y=0;y<M.h;y++)for(let x=0;x<M.w;x++)if(grid[y][x]==='X')grid[y][x]=M.floor;
    S.hp=Math.min(maxHP(),S.hp+HPQ);AU.name=null;playSong(rsong('ngen'));
    stepBackFromNgen();const e=Object.assign({},MAPS.ngen4.ents[1]);e.fx=e.x;e.fy=e.y;ents.push(e);persist();sfx('lvl');
    say([L('Ngen-kürüf','Mari mari, '+nm()+'.','Hola, '+nm()+'.','Hello, '+nm()+'.'),
      L('Ngen-kürüf','Tami dungun mew nepen.','Con tus palabras desperté.','With your words I woke up.'),
      N('Ngen-kürüf es el ngen del viento: lleva la lluvia, mueve el mar y despeja la niebla.','Ngen-kürüf is the ngen of the wind: it carries the rain, moves the sea and clears away the fog.'),
      N('Ngen-kürüf te da su newen: ahora los remolinos de viento ya no te empujan. Los que viste en la costa lafkenche y en el sur se abren. Además ganas un corazón nuevo.','Ngen-kürüf gives you its newen: now the whirls of wind no longer push you back. The ones you saw on the Lafkenche coast and in the south open up. You also gain a new heart.'),
      Object.assign(L('','Meli trariwe trokiñ!','Entre la espuma queda otro trariwe trokiñ, tejido en morado y blanco. Tienes 4 de 5.','In the foam lies another trariwe trokiñ, woven in purple and white. You have 4 of 5.'),{fx:()=>sfx('pick')}),
      N('Un círculo de luz aparece en el muelle: pisándolo puedes volver a los acantilados, al lof williche o a las otras tierras.','A circle of light appears on the pier: step on it to return to the cliffs, the Williche lof, or the other lands.'),
      N('Fin de la región williche (prototipo). Solo falta Puelmapu, al otro lado de la cordillera.','End of the Williche region (prototype). Only Puelmapu remains, on the other side of the mountains.')]);
  });
}

function postBoss5(){
  say([N('El Walichu se deshace en polvo gris que el viento se lleva lejos, hacia el oeste. El pasto vuelve a ponerse dorado, y de la tierra misma se levanta una figura alta de pasto, semilla y luz.','The Walichu crumbles into grey dust that the wind carries far away, to the west. The grass turns golden again, and out of the earth itself rises a tall figure of grass, seed and light.')],()=>{
    S.flags.ngen5=1;S.flags.lelfun=1;S.pieces=S.pieces||[];if(!S.pieces.includes('puelche'))S.pieces.push('puelche');
    grid[7][8]='A';for(let y=0;y<M.h;y++)for(let x=0;x<M.w;x++)if(grid[y][x]==='D')grid[y][x]=M.floor;
    S.hp=Math.min(maxHP(),S.hp+HPQ);AU.name=null;playSong(rsong('ngen'));
    stepBackFromNgen();const e=Object.assign({},MAPS.ngen5.ents[1]);e.fx=e.x;e.fy=e.y;ents.push(e);persist();sfx('lvl');
    say([L('Ngen-lelfün','Mari mari, '+nm()+'.','Hola, '+nm()+'.','Hello, '+nm()+'.'),
      L('Ngen-lelfün','Tami dungun mew nepen. Afpun mapu mew akuymi.','Con tus palabras desperté. Llegaste hasta el fin de la tierra.','With your words I woke up. You have come to the end of the land.'),
      N('Ngen-lelfün es el ngen de la pampa abierta: cuida el pasto, los luan, los choyke y a la gente que vive del campo.','Ngen-lelfün is the ngen of the open plain: it looks after the grass, the guanacos, the rheas, and the people who live from the land.'),
      N('Ngen-lelfün te da su newen: ahora los cercos de espino seco se apartan cuando pasas. Además ganas un corazón nuevo.','Ngen-lelfün gives you its newen: now the fences of dry thorn move aside when you pass. You also gain a new heart.'),
      Object.assign(L('','Kechu trariwe trokiñ!','Entre el pasto dorado queda el último trokiñ, tejido en amarillo y negro. ¡Tienes los 5: el trariwe antiguo está COMPLETO!','In the golden grass lies the last trokiñ, woven in yellow and black. You have all 5: the ancient trariwe is COMPLETE!'),{fx:()=>{sfx('lvl')}}),
      N('Los cinco trokiñ se tejen solos entre tus manos: mar, monte, pewen, viento y pampa, una sola faja. El Walichu era un sirviente de Ti Fütra Ngoyman: el gran olvido te espera al oeste del primer camino, donde todo empezó.','The five trokiñ weave themselves together in your hands: sea, forest, pewen, wind and plain, one single sash. The Walichu was a servant of Ti Fütra Ngoyman: the great forgetting awaits you west of the first road, where everything began.'),
      N('Un círculo de luz aparece en el círculo de piedras: pisándolo puedes volver a la meseta, al lof puelche o a las otras tierras.','A circle of light appears in the stone circle: step on it to return to the meseta, the Puelche lof, or the other lands.'),
      N('Fin de la región puelche (prototipo). Con el trariwe completo, la niebla del oeste ya puede abrirse...','End of the Puelche region (prototype). With the trariwe complete, the fog in the west can now be opened...')]);
  });
}

function postFinal(){
  S.flags.won=1;persist();
  say([N('El coloso se detiene... y suspira. La niebla entera tiembla, se afina, se deshace en hilos de plata que el viento se lleva hacia arriba.','The colossus stops... and sighs. The whole fog trembles, thins, and comes apart into silver threads that the wind carries upward.')],
    ()=>startEndCut());
}
