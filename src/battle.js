/* ============================================================
   BATTLE
   ============================================================ */
let B=null;
function engage(e){
  if(grace>0||active)return;
  const go=()=>startBattle(e.party,{ent:e,boss:e.boss,mini:e.mini});
  if(e.pre)say(e.pre,go);else go();
}
function relabel(){const cnt={},seen={};B.en.forEach(e=>cnt[e.t]=(cnt[e.t]||0)+1);
  B.en.forEach(e=>{seen[e.t]=(seen[e.t]||0)+1;if(e.label)return;e.label=ET[e.t].name+(cnt[e.t]>1||ET[e.t].name==='laftrache'&&B.en.length>1?' '+'ABCDE'[seen[e.t]-1]:'')})}
function mkEnemy(t){return{t,hp:ET[t].hp,max:ET[t].hp,gr:0,sl:0,hit:0,dead:false,fadeT:0,fear:0,stun:0,tall:t==='witranalwe'?1:0}}
function startBattle(party,o){
  mode='battle';banner.style.display='none';held.up=held.down=held.left=held.right=0;
  B={en:party.map(mkEnemy),o,tele:false,teleHint:false,shake:0,area:M.bg,turn:0,cursor:null,pops:[],parts:[],flash:0,red:0,intro:24,blocked:null,rush:null,shownHP:S.hp};
  relabel();sfx('enc');playSong(o.boss?'boss':'battle');
  const alive=B.en.length,same=party.every(t=>t===party[0]),nameL=same?ET[party[0]].name:'wekufü';
  const lst=same?nameL:'wekufü ('+party.map(t=>ET[t].name).join(', ')+')';
  say([L('','Müley '+numW(alive)+' '+nameL+'!','¡Hay '+alive+' '+lst+'!','There '+(alive>1?'are ':'is ')+alive+' '+lst+'!')],battleMenu);
}
const aliveE=()=>B.en.filter(e=>!e.dead);
function battleMenu(){
  const en=S.gloss==='en';B.cursor=null;
  choose({es:'¿Qué haces? (Hay '+aliveE().length+')',en:'What do you do? ('+aliveE().length+' left)'},[
    {m:'Dungun',g:en?'Speak (build a command)':'Hablar (armar una orden)',v:'d'},
    {m:'Newen ('+(S.sp||0)+'/'+SPMAX+')',g:en?'Special ability':'Habilidad especial',v:'s',dis:(S.sp||0)<2},
    {m:'Chemkün',g:en?'Items':'Cosas',v:'i'},
    {m:'Lef',g:en?'Run away':'Huir',v:'r'}].concat(B.last?[{m:'Ka kiñe rupa: '+ROOTS[B.last.r].m.replace('-','')+(B.last.k?'kil':'')+'-',g:en?'Once more (same verb)':'Otra vez (el mismo verbo)',v:'again'}]:[]),v=>{
    if(v==='d')pickRoot();
    else if(v==='again')pickTarget(B.last.r,B.last.k);
    else if(v==='s')pickSpecial();
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
    for(const e of targets){let d=k==='wino'?atk()*3+rnd(3):Math.round(atk()*1.5)+rnd(3);if(e.tall)d=Math.max(1,Math.round(d/3));if(k==='kuruf'&&ET[e.t].fly)e.gr=3;e.pend=d;e.hp-=d;
      fx.push(e.label+' −'+d+(e.hp<=0?' (se va)':'')+'.');fxe.push(e.label+' −'+d+(e.hp<=0?' (gone)':'')+'.')}}
  const eff=N(fx.join(' '),fxe.join(' '));
  eff.fx=()=>{for(const e of targets){const p=epos(e);spark(p.x,p.y,k==='kuruf'?'#e8f4ff':'#ffd060',16);if(e.pend){e.hit=14;pop(p.x,p.y-10,'-'+e.pend,'#ffffff');sfx('hit');if(e.hp<=0){e.dead=true;e.fadeT=20}e.pend=0}}};
  say([head,eff],()=>{for(const e of targets)if(e.hp<=0&&!e.dead){e.dead=true;e.fadeT=20}if(!aliveE().length)return victory();enemyPhase()});
}
function epos(e){return{x:e.px||128,y:e.py||100}}
function pop(x,y,txt,col){B.pops.push({x,y,txt,col,t:50})}
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
  const fx=[],fxe=[];
  const castFx=()=>{sfx('cast');B.flash=8};
  lines[0].fx=castFx;
  if(r==='amutu'&&!kil){
    for(const e of targets){const T=ET[e.t];
      if(T.fly&&e.gr<=0){fx.push(e.label+' vuela muy alto: no te alcanza.');fxe.push(e.label+' flies too high: it does not reach.');e.miss=1;continue}
      if(e.tall){fx.push(e.label+' está erguido, altísimo: tus palabras le pasan por debajo.');fxe.push(e.label+' stands tall, towering: your words pass beneath it.');e.miss=1;continue}
      const d=coll?Math.max(1,Math.round((atk()+rnd(4))*.75)):atk()+rnd(4)+2;e.pend=d;e.hp-=d;
      if(e.hp<=0){fx.push(e.label+' se va (−'+d+').');fxe.push(e.label+' goes away (−'+d+').')}else{fx.push(e.label+' −'+d+'.');fxe.push(e.label+' −'+d+'.')}}
  }else if(r==='amutu'){fx.push('Les dijiste que no se fueran... y se quedan, felices.');fxe.push('You told them not to leave... so they stay, happily.')}
  else if(r==='küpa'&&!kil){fx.push('¡Les dijiste que vinieran! Se lanzan sobre ti.');fxe.push('You told them to come! They rush at you.');B.rush=new Set(targets)}
  else if(r==='küpa'){B.blocked=new Set(targets);fx.push(coll?'Los wekufü se detienen: este turno no pueden alcanzarte.':targets[0].label+' se detiene: este turno no puede alcanzarte.');fxe.push(coll?'The wekufü stop: this turn they cannot reach you.':targets[0].label+' stops: this turn it cannot reach you.')}
  else if(r==='umawtu'&&!kil){for(const e of targets){const T=ET[e.t];if(T.boss){fx.push(e.label+' no se duerme.');fxe.push(e.label+' does not fall asleep.');continue}
      if(Math.random()<(coll?.7:.9)){e.sl=2;fx.push(e.label+' se duerme.');fxe.push(e.label+' falls asleep.')}else{fx.push(e.label+' bosteza, pero no se duerme.');fxe.push(e.label+' yawns, but stays awake.')}}}
  else if(r==='umawtu'){let w=0;for(const e of targets)if(e.sl){e.sl=0;w=1}fx.push(w?'¡Los despertaste!':'Ninguno dormía.');fxe.push(w?'You woke them up!':'None of them was asleep.')}
  else if(r==='nag'&&!kil){let any=0;for(const e of targets)if(ET[e.t].fly){e.gr=3;any=1;fx.push(e.label+' baja al suelo.');fxe.push(e.label+' comes down to the ground.')}
      if(!any){fx.push('No vuela: ya está abajo.');fxe.push('It does not fly: it is already down.')}}
  else if(r==='nag'){fx.push('Les dijiste que no bajaran. Siguen donde estaban.');fxe.push('You told them not to come down. They stay where they were.')}
  else if(r==='llüka'&&!kil){for(const e of targets){const T=ET[e.t];
      if(T.boss&&e.tall){fx.push(e.label+' no siente miedo mientras está erguido.');fxe.push(e.label+' feels no fear while it stands tall.');continue}
      if(T.boss||Math.random()<(coll?.75:.92)){e.fear=3;fx.push(e.label+' tiembla de miedo: golpeará más débil.');fxe.push(e.label+' trembles with fear: it will hit weaker.')}else{fx.push(e.label+' no se asusta.');fxe.push(e.label+' is not scared.')}}}
  else if(r==='llüka'){let w=0;for(const e of targets)if(e.fear){e.fear=0;w=1}fx.push(w?'Les quitaste el miedo... ¡vuelven con toda su fuerza!':'Ninguno tenía miedo.');fxe.push(w?'You took away their fear... they come back at full strength!':'None of them was afraid.')}
  else if(r==='wiñotu'&&!kil){for(const e of targets){const T=ET[e.t];
      if(e.tall){e.tall=0;e.low=3;e.stun=1;fx.push(e.label+' retrocede, se encoge y queda a tu alcance.');fxe.push(e.label+' steps back, shrinks down and is within your reach.');continue}
      if(T.boss&&B.tele){B.tele=false;fx.push(e.label+' retrocede y pierde el impulso: ya no se lanza.');fxe.push(e.label+' steps back and loses its momentum: it no longer lunges.');continue}
      if(!T.boss&&Math.random()<(coll?.6:.85)){e.stun=1;fx.push(e.label+' retrocede y pierde su turno.');fxe.push(e.label+' steps back and loses its turn.')}else{fx.push(e.label+' se tambalea, pero sigue ahí.');fxe.push(e.label+' staggers, but stays put.')}}}
  else if(r==='wiñotu'){fx.push('Les dijiste que no retrocedieran. Se quedan firmes.');fxe.push('You told them not to go back. They hold their ground.')}
  const eff=L('',pr.m+(S.sp>=2?'  ✦'+S.sp:''),fx.join(' '),fxe.join(' '));
  eff.fx=()=>{for(const e of targets){const p=epos(e);spark(p.x,p.y,r==='amutu'?'#fff6a0':r==='umawtu'?'#a0c8ff':r==='nag'?'#ffe080':'#ffffff',10);
      if(e.pend){e.hit=12;pop(p.x,p.y-10,'-'+e.pend,'#ffffff');sfx('hit');if(e.hp<=0){e.dead=true;e.fadeT=20}e.pend=0}
      else if(e.miss){pop(p.x,p.y-10,'MISS','#a0c0ff');e.miss=0}
      else if(r==='umawtu'&&e.sl){pop(p.x,p.y-10,'zZ','#c0e0ff');sfx('sleep')}
      else if(r==='nag'&&e.gr===3){pop(p.x,p.y-10,'↓','#ffe080')}
      else if(r==='küpa'&&kil){pop(p.x,p.y-10,'✋','#ffe080');sfx('block')}}};
  lines.push(eff);
  say(lines,()=>{for(const e of targets)if(e.hp<=0&&!e.dead){e.dead=true;e.fadeT=20}if(!aliveE().length)return victory();enemyPhase()});
}
function enemyPhase(){
  const fx=[],fxe=[];let dmgTotal=0;const hitsFx=[];
  const hitP=(e,mult,tag)=>{
    if(B.blocked&&B.blocked.has(e)){fx.push(e.label+': ¡bloqueado!');fxe.push(e.label+': blocked!');hitsFx.push(()=>{const p=epos(e);pop(p.x,p.y-10,'✋','#ffe080');sfx('block')});return}
    const T=ET[e.t],rush=B.rush&&B.rush.has(e);
    const d=Math.max(1,Math.round((T.atk+rnd(3)-1)*(mult||1)*(rush?1.5:1)*(e.fear>0?.5:1))-def());S.hp-=d;dmgTotal+=d;
    fx.push(e.label+(tag?tag.es:' te golpea')+' (−'+d+').');fxe.push(e.label+(tag?tag.en:' hits you')+' (−'+d+').');
    if(T.drain){const hl=Math.ceil(d/2);e.hp=Math.min(e.max,e.hp+hl);fx.push(e.label+' bebe tu fuerza (+'+hl+').');fxe.push(e.label+' drinks your strength (+'+hl+').');hitsFx.push(()=>{const p=epos(e);pop(p.x,p.y-10,'+'+hl,'#80ff90')})}
    hitsFx.push(()=>{e.lunge=16;pop(60,30,'-'+d,'#ff6050')})};
  for(const e of aliveE()){const T=ET[e.t];
    if(e.sl>0){e.sl--;fx.push(e.label+' duerme.');fxe.push(e.label+' is asleep.');continue}
    if(e.stun>0){e.stun--;fx.push(e.label+' todavía retrocede.');fxe.push(e.label+' is still backing away.');continue}
    if(e.t==='witranalwe'){
      if(B.tele){B.tele=false;hitP(e,2.2,{es:' se lanza sobre ti',en:' lunges at you'});continue}
      if(!e.tall&&e.low>0){e.low--;if(e.low<=0){e.tall=1;fx.push('Witranalwe vuelve a erguirse, altísimo.');fxe.push('The Witranalwe rises up again, towering.');continue}}
      const roll=Math.random(),kc=aliveE().filter(x=>x.t==='kolokolo').length;
      if(roll<.3&&B.turn>0&&B.turn-(e.lastTele||-9)>2){B.tele=true;e.lastTele=B.turn;fx.push('Witranalwe se agacha y junta fuerza para lanzarse.');fxe.push('The Witranalwe crouches and gathers strength to lunge.');continue}
      if(roll<.48&&kc<1&&B.en.length<5){const ne=mkEnemy('kolokolo');B.en.push(ne);relabel();fx.push('¡Witranalwe llama a '+ne.label+'!');fxe.push('The Witranalwe calls '+ne.label+'!');continue}
      hitP(e);continue}
    if(T.boss){
      if(B.tele){B.tele=false;hitP(e,2.2,{es:' te envuelve',en:' wraps around you'});continue}
      const roll=Math.random(),laf=aliveE().filter(x=>x.t==='laftrache').length;
      if(roll<.32&&B.turn>0){B.tele=true;fx.push('Trelke-wekufü se estira, listo para envolverte.');fxe.push('Trelke-wekufü stretches out, ready to wrap you up.');continue}
      if(roll<.52&&laf<1&&B.en.length<5){const ne=mkEnemy('laftrache');B.en.push(ne);relabel();fx.push('¡Trelke-wekufü llama a '+ne.label+'!');fxe.push('Trelke-wekufü calls up '+ne.label+'!');continue}
      hitP(e);continue}
    if(e.t==='anchi'&&Math.random()<.3){const hurt=aliveE().filter(x=>x!==e&&x.hp<x.max);if(hurt.length){const h=hurt[0];h.hp=Math.min(h.max,h.hp+5);fx.push(e.label+' brilla y cura a '+h.label+' (+5).');fxe.push(e.label+' glows and heals '+h.label+' (+5).');hitsFx.push(()=>{const p=epos(h);pop(p.x,p.y-10,'+5','#80ff90');sfx('heal')});continue}}
    if(T.twice){hitP(e,.7);hitP(e,.7,{es:' vuelve a morder',en:' bites again'});continue}
    if((e.t==='chonchon'||T.curse)&&!S.curse&&Math.random()<.25&&!(B.blocked&&B.blocked.has(e))){S.curse=1;fx.push(e.label+' grita "¡tue, tue!": quedas con maldición (fuerza −2). El lawen la quita.');fxe.push(e.label+' cries "tue, tue!": you are cursed (strength −2). Lawen lifts it.');hitsFx.push(()=>sfx('bad'));continue}
    hitP(e)}
  for(const e of aliveE()){if(e.gr>0)e.gr--;if(e.fear>0)e.fear--}
  B.blocked=null;B.rush=null;B.turn++;
  const lines=[];
  if(fx.length){const l=N(fx.join(' '),fxe.join(' '));l.fx=()=>{hitsFx.forEach(f=>f());if(dmgTotal){B.shake=12;B.red=10;sfx('hurt')}};lines.push(l)}
  const bossE=aliveE().find(x=>ET[x.t].boss),bn=bossE?ET[bossE.t].name:'';
  if(B.tele&&bossE)lines.push(L(bn,'Küpaley '+bn+'!','¡'+bn+' viene!',bn+' is coming!'));
  if(bossE&&bossE.t==='witranalwe'&&bossE.tall&&!B.tallHint&&B.turn>=1){B.tallHint=1;lines.push(N('Pista: erguido así, nada lo alcanza. Quizás si le dices que vuelva atrás...','Hint: standing tall like that, nothing reaches it. Maybe if you tell it to go back...'))}
  if(B.tele&&!B.teleHint&&bossE){B.teleHint=1;lines.push(N('Pista: dile que no venga (küpa- con -kil-), a él solo o a todos, con la terminación correcta.','Hint: tell it not to come (küpa- with -kil-), to it alone or to all of them, with the right ending.'))}
  say(lines,()=>{
    if(S.hp<=0){S.hp=0;return defeat()}
    battleMenu()});
}
function victory(){
  const xp=B.en.reduce((a,e)=>a+ET[e.t].xp,0);let gold=B.en.reduce((a,e)=>{const g=ET[e.t].gold;return a+g[0]+rnd(g[1]-g[0]+1)},0);
  if(S.pw.gold){gold*=2;S.pw.gold=0}
  S.xp+=xp;S.gold+=gold;
  const after=SONGS.win;after.after=()=>mapSong();playSong('win');
  const ls=[N('¡Los wekufü se van!','The wekufü are gone!'),L('','+'+numW(gold)+' ngülliw','Ganas '+numP(gold)+' ngülliw y '+xp+' de kimün.','You gain '+numP(gold)+' ngülliw and '+xp+' kimün.')];
  while(S.xp>=xpNeed()){S.xp-=xpNeed();S.lvl++;S.baseMax+=HPQ;S.hp+=HPQ;S.baseAtk+=1;if(S.lvl%2===0)S.baseDef+=1;
    const l=L('','Doy kimün!','¡Más conocimiento! Llegas a kimün '+S.lvl+': ganas un corazón y más fuerza.','More knowledge! You reach kimün '+S.lvl+': you gain a heart and more strength.');l.fx=()=>sfx('lvl');ls.push(l)}
  say(ls,()=>endBattle('win'));
}
function defeat(){
  const lost=Math.floor(S.gold/4);S.gold-=lost;playSong('intro');
  const gm=MAPS[CUR].region==='nagche'?'chuchu':'kuku';
  say([N('Te quedas sin fuerzas... Tu '+gm+' te encuentra y te lleva junto al kütral.'+(lost?' Pierdes '+numP(lost)+' ngülliw.':''),'You collapse... Your '+gm+' finds you and carries you back to the fire.'+(lost?' You lose '+numP(lost)+' ngülliw.':''))],()=>{
    S.curse=0;S.hp=maxHP();mode='map';B=null;const sv=S.save;AU.name=null;loadMap(sv.map,sv.x,sv.y)});
}
function endBattle(how){
  const o=B.o;mode='map';grace=how==='flee'?90:30;
  if(how==='win'&&o.ent){ents=ents.filter(e=>e!==o.ent);if(o.ent.flag)S.flags[o.ent.flag]=1}
  B=null;persist();
  if(how!=='win'||!AU.song||AU.name!=='win')playSong(mapSong());
  if(how==='win'&&o.boss)postBoss();
}
function postBoss(){
  if(CUR==='ngen2')return postBoss2();
  say([N('El cuero de Trelke-wekufü se hunde y el agua se aclara. Una figura de espuma y luz se levanta de la laguna.','Trelke-wekufü\'s hide sinks and the water clears. A figure of foam and light rises from the lagoon.')],()=>{
    S.flags.ngen=1;S.flags.dive=1;S.pieces=S.pieces||[];if(!S.pieces.includes('lafkenche'))S.pieces.push('lafkenche');S.flags.awake_lafkenche=1;if(CUR==='ngen')grid[7][8]='A';S.hp=Math.min(maxHP(),S.hp+HPQ);AU.name=null;playSong('ngen');
    const e=Object.assign({},MAPS.ngen.ents[1]);e.fx=e.x;e.fy=e.y;ents.push(e);persist();sfx('lvl');
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
    S.hp=Math.min(maxHP(),S.hp+HPQ);AU.name=null;playSong('ngen');
    const e=Object.assign({},MAPS.ngen2.ents[1]);e.fx=e.x;e.fy=e.y;ents.push(e);persist();sfx('lvl');
    say([L('Ngen-mawida','Mari mari, '+nm()+'.','Hola, '+nm()+'.','Hello, '+nm()+'.'),
      L('Ngen-mawida','Alün umawtun. Tami dungun mew nepen.','Dormí mucho tiempo. Con tus palabras desperté.','I slept a long time. With your words I woke up.'),
      N('Ngen-mawida es el ngen del monte: cuida los árboles, el lawen y los animales que viven entre ellos.','Ngen-mawida is the ngen of the forest: it looks after the trees, the medicine plants, and the animals that live among them.'),
      N('Ngen-mawida te da su newen: ahora los zarzales espinudos se apartan cuando pasas. Además ganas un corazón nuevo.','Ngen-mawida gives you its newen: now the thorny brambles move aside when you pass. You also gain a new heart.'),
      Object.assign(L('','Epu trariwe trokiñ!','Entre las raíces queda otro trokiñ del trariwe antiguo, tejido en verde y amarillo. Tienes 2 de 5.','Among the roots lies another trokiñ of the ancient trariwe, woven in green and yellow. You have 2 of 5.'),{fx:()=>sfx('pick')}),
      N('Un círculo de luz aparece en el claro: pisándolo puedes volver a la entrada de la guarida, al lof nagche o a las tierras lafkenche.','A circle of light appears in the clearing: step on it to return to the lair entrance, the Nagche lof, or the Lafkenche lands.'),
      N('Fin de la región nagche (prototipo). Vuelve a los zarzales que viste en el camino: ahora puedes pasar. Faltan Pewenche, Williche y Puelmapu.','End of the Nagche region (prototype). Go back to the brambles you saw on the road: now you can get through. Pewenche, Williche and Puelmapu remain.')]);
  });
}
