/* ======================================================================
   Learning layer: grafemarios, tracking what each player misses, the
   Ngüneduamün practice page, verb building, the wekufü chillka, the
   learning report for teachers, palin and trafkintu.
   ====================================================================== */

/* ---------- 1. grafemarios: the game is written in Unificado; Azümchefe and Ragileo are converted on display ---------- */
let GRAF=(()=>{try{return localStorage.getItem('kw_graf')||'u'}catch(e){return 'u'}})();
const GRAF_NAME={u:'Unificado',a:'Azümchefe',r:'Ragileo'};
function setGraf(g){GRAF=g;try{localStorage.setItem('kw_graf',g)}catch(e){}}
const _isEsp=s=>/[áéíóúÁÉÍÓÚ¿¡]/.test(s)||/\b(volver|cerrar|partida|normal|pistas|glosa|español|english|música|music|hints|gloss|title|close|back|desde|inicio|nuevo|juego|cancelar|salir|después|later|yes|on|off|sí|modo|consultar|libro|tomar|lección|todos|solo|menú|menu|cosas|items|go|map|mapa|ir|heal|sanar|learn|aprender|palabras|every|word|report|informe|game|start|empezar|region|ganar|pelea|win|battle|grafemario|play|jugar|continuar|continue|new|nueva|partida|the|to|of|de|la|el|del|un|una|y|you|your|tu|status|estado|quest|log|progress|avance)\b/i.test(s);
function _cv(s,pairs){let o='';for(let i=0;i<s.length;){let hit=null;for(const [a,b] of pairs){if(s.substr(i,a.length).toLowerCase()===a){hit=[a,b];break}}
  if(hit){const src=s.substr(i,hit[0].length),up=src[0]!==src[0].toLowerCase();o+=up?hit[1][0].toUpperCase()+hit[1].slice(1):hit[1];i+=hit[0].length}else{o+=s[i];i++}}return o}
const GRAF_RULES={a:[['tr','tx'],['ng','g'],['g','q'],['d','z']],
  r:[['tr','x'],['ch','c'],['ll','j'],['ng','g'],['g','q'],['ñ','h'],['ü','v'],['d','z']]};
function GR(s){if(!s||GRAF==='u'||typeof s!=='string')return s;const nm=S&&S.name;if(nm&&s.includes(nm))return s.split(nm).map(x=>_cv(x,GRAF_RULES[GRAF])).join(nm);return _cv(s,GRAF_RULES[GRAF])}
function GRm(s){return s&&!_isEsp(s)?GR(s):s}   // for menu options and bubbles, which can be Spanish UI text

/* ---------- 2. tracking: accuracy by topic and the questions each player misses ---------- */
function trk(t,v,q){const ok=v===q.a;track(t,ok,q.q,q.o,q.a);return ok}
function _qkey(q){return (q.m||'')+'|'+(q.es||'')}
function track(topic,ok,q,opts,ans){
  S.acc=S.acc||{};const A=S.acc[topic]=S.acc[topic]||{c:0,t:0};A.t++;if(ok)A.c++;
  if(!q||!opts||ans===undefined)return;S.miss=S.miss||{};const k=_qkey(q);
  if(ok){const m=S.miss[k];if(m){m.n--;if(m.n<=0)delete S.miss[k]}}
  else{const m=S.miss[k]||{q:{m:q.m||'',es:q.es||'',en:q.en||'',who:q.who||''},o:opts.slice(),a:ans,n:0,t:topic};m.n=Math.min(5,m.n+2);m.last=Date.now();S.miss[k]=m;
    const ks=Object.keys(S.miss);if(ks.length>80){ks.sort((a,b)=>S.miss[a].last-S.miss[b].last);delete S.miss[ks[0]]}}}
function missList(){return Object.values(S.miss||{}).sort((a,b)=>b.n-a.n||b.last-a.last)}

/* ---------- 3. verb building: put a word together from its pieces ---------- */
const VOW='aeiouü';
function joinM(parts){let s=parts[0]||'';
  for(let i=1;i<parts.length;i++){const m=parts[i];if(!m)continue;const cons=!VOW.includes(s[s.length-1]);
    if(m==='a'&&/la$/.test(s))s+='ya';
    else if(cons&&m==='n')s+='ün';
    else if(cons&&m==='yu')s+='iyu';
    else if(cons&&m[0]==='y')s+='i'+m.slice(1);
    else s+=m}
  return s}
function buildVerb(Bq,cb){   // Bq: {q:{es,en}, slots:[[ {m,v} ...]...], target, words?:1}
  const parts=[];const en=S.gloss==='en';
  const show=()=>{const shown=Bq.words?parts.filter(Boolean).join(' '):joinM(parts);return shown?shown+'…':'___'};
  const step=i=>{if(i>=Bq.slots.length){const got=Bq.words?parts.filter(Boolean).join(' '):joinM(parts);const ok=got===Bq.target;
      track('armar verbos',ok,{m:'⧉ '+Bq.target,es:Bq.q.es,en:Bq.q.en},[Bq.target],Bq.target);
      return cb(ok,got)}
    choose({m:show(),es:Bq.q.es+(en?'':' Arma la palabra pieza por pieza.'),en:Bq.q.en+(en?' Build the word piece by piece.':'')},
      Bq.slots[i].map(o=>({m:o.m,g:o.g,v:o.v})),v=>{parts[i]=v;sfx('move');step(i+1)},false,true)};
  step(0)}

/* ---------- 4. Ngüneduamün: a 10-question practice built from the player's own misses ---------- */
const BUILDERS=[
  {q:{es:'Arma «tú trabajas».',en:'Build "you work".'},slots:[[{m:'küdaw-',v:'küdaw'},{m:'amu-',v:'amu'},{m:'iya-',v:'iya'}],[{m:'-n',v:'n'},{m:'-ymi',v:'ymi'},{m:'-y',v:'y'}]],target:'küdawimi'},
  {q:{es:'Arma «ellos dos van».',en:'Build "the two of them go".'},slots:[[{m:'amu-',v:'amu'},{m:'küdaw-',v:'küdaw'}],[{m:'-yu',v:'yu'},{m:'-iñ',v:'iñ'},{m:'-ymu',v:'ymu'},{m:'-yngu',v:'yngu'},{m:'-yngün',v:'yngün'}]],target:'amuyngu'},
  {q:{es:'Arma «no iré».',en:'Build "I will not go".'},slots:[[{m:'amu-',v:'amu'}],[{m:'—',g:'nada',v:''},{m:'-la-',g:'no',v:'la'}],[{m:'—',g:'nada',v:''},{m:'-a-',g:'futuro',v:'a'}],[{m:'-n',v:'n'},{m:'-ymi',v:'ymi'},{m:'-y',v:'y'}]],target:'amulayan'},
  {q:{es:'Arma «tú sueles ir».',en:'Build "you usually go".'},slots:[[{m:'amu-',v:'amu'},{m:'iya-',v:'iya'}],[{m:'—',g:'nada',v:''},{m:'-ke-',g:'costumbre',v:'ke'}],[{m:'-n',v:'n'},{m:'-ymi',v:'ymi'},{m:'-y',v:'y'}]],target:'amukeymi'},
  {q:{es:'Arma «no comemos (muchos)».',en:'Build "we (many) do not eat".'},slots:[[{m:'iya-',v:'iya'},{m:'amu-',v:'amu'}],[{m:'—',g:'nada',v:''},{m:'-la-',g:'no',v:'la'}],[{m:'-iñ',v:'iñ'},{m:'-yu',v:'yu'},{m:'-ymün',v:'ymün'}]],target:'iyalaiñ'},
  {q:{es:'Arma la pregunta «¿cuándo vas a ir?».',en:'Build the question "when will you go?".'},words:1,slots:[[{m:'Chumül',v:'Chumül'},{m:'Chew',v:'Chew'},{m:'Iney',v:'Iney'}],[{m:'amuaymi?',v:'amuaymi?'},{m:'amuan?',v:'amuan?'},{m:'mülimi?',v:'mülimi?'}]],target:'Chumül amuaymi?'}];
function practice(back){
  const en=S.gloss==='en',ms=missList();const qs=[];
  for(const m of ms){if(qs.length>=7)break;if(!m.q.m||m.q.m[0]!=='⧉')qs.push({q:m.q,o:m.o,a:m.a,from:'miss'})}
  const pool=typeof lanPool==='function'?lanPool():[];while(qs.length<8&&pool.length){const p=pool.splice(rnd(pool.length),1)[0];if(!qs.some(x=>_qkey(x.q)===_qkey(p.q)))qs.push(p)}
  const bl=BUILDERS.slice();for(let k=0;k<2;k++)qs.splice(rnd(qs.length+1),0,{b:bl.splice(rnd(bl.length),1)[0]});
  let ok=0;
  say([L('','Ngüneduamün',ms.length?'Repaso: primero lo que te ha costado ('+ms.length+' pendientes), después un poco de todo.':'Repaso de lo aprendido en tu viaje.',ms.length?'Review: first what has been hard for you ('+ms.length+' pending), then a bit of everything.':'A review of what you have learned on your journey.')],()=>ask(0));
  function ask(i){
    if(i>=qs.length){const n=qs.length;S.xp+=ok;persist();return say([N(ok+'/'+n+' · +'+ok+' kimün.',ok+'/'+n+' · +'+ok+' kimün.'),L('',ok>=n-1?'Kümey!':'Kimnierpuken!',ok>=n-1?'¡Muy bien!':'¡Voy aprendiendo!',ok>=n-1?'Very good!':'I am learning!')],()=>{if(S.xp>=xpNeed())levelUpCheck();else back&&back()})}
    const Q=qs[i];
    if(Q.b)return buildVerb(Q.b,(good,got)=>{if(good){ok++;sfx('ok');say([L('','Kümey!',Q.b.target,Q.b.target)],()=>ask(i+1))}else{sfx('bad');say([N('Armaste «'+got+'». Era: '+Q.b.target+'.','You built "'+got+'". It was: '+Q.b.target+'.')],()=>ask(i+1))}});
    const opts=Q.o.map(o=>({m:o,v:o}));for(let a=opts.length-1;a>0;a--){const b=rnd(a+1);[opts[a],opts[b]]=[opts[b],opts[a]]}
    choose(Object.assign({},Q.q,{es:'('+(i+1)+'/'+qs.length+') '+(Q.q.es||''),en:'('+(i+1)+'/'+qs.length+') '+(Q.q.en||'')}),opts,v=>{
      const good=v===Q.a;track('ngüneduamün',good,Q.q,Q.o,Q.a);
      if(good){ok++;sfx('ok');ask(i+1)}else{sfx('bad');say([N('Era: '+Q.a+'.','It was: '+Q.a+'.')],()=>ask(i+1))}},false,true)}
}

/* ---------- 5. wekufü chillka: a page for every creature you have beaten ---------- */
const BEST={
  laftrache:['Pequeños seres de la costa, del tamaño de una mano, que se esconden entre las rocas y molestan a quien pasa.','Little coastal beings, the size of a hand, who hide among the rocks and pester whoever passes.'],
  chonchon:['Una cabeza que vuela con las orejas como alas, gritando «tue tue» de noche. Para muchos, es un kalku transformado.','A head that flies using its ears as wings, crying "tue tue" at night. Many say it is a kalku in disguise.'],
  anchi:['El anchümalleñ: una lucecita con forma de niño que acompaña a los kalku y engaña a los caminantes.','The anchümalleñ: a little light shaped like a child that serves the kalku and leads walkers astray.'],
  nidol:['El más grande de los laftrache, el que manda a los demás.','The biggest of the laftrache, the one who bosses the others.'],
  piwichen:['Una culebra alada pequeña que chupa la sangre de los animales. Su grito asusta en la noche.','A small winged serpent that drinks the blood of animals. Its cry frightens people at night.'],
  trelke:['Un cuero estirado que vive en el agua y envuelve a quien se acerca a la orilla.','A stretched hide that lives in the water and wraps up whoever comes near the shore.'],
  kolokolo:['Un ratón o lagartija que nace de un huevo maldito y enferma a la gente de la casa.','A mouse or lizard hatched from a cursed egg that makes the people of the house fall ill.'],
  fkolokolo:['Un kolokolo viejo y grande; su maldición pesa más.','An old, big kolokolo; its curse weighs heavier.'],
  nguruvilu:['El ngürüfilu, «zorro-culebra»: vive en los ríos y arrastra al fondo a quien cruza.','The ngürüfilu, "fox-serpent": it lives in rivers and drags those who cross down to the bottom.'],
  kutral:['Una chispa del volcán con ganas de quemar.','A spark from the volcano eager to burn.'],
  pire:['Nieve que se levanta y camina: el frío de la cordillera hecho wekufü.','Snow that rises up and walks: the cold of the cordillera turned wekufü.'],
  kura:['Una piedra con mala voluntad. Su cuerpo de roca aguanta los golpes.','A stone with ill will. Its rocky body takes a beating.'],
  fkura:['La piedra grande de la que se desprenden los kura wekufü.','The big rock the kura wekufü break off from.'],
  nirivilu:['El ñirifilu, culebra de los ñirres de la cordillera, rápida y venenosa.','The ñirifilu, serpent of the cordillera ñirre trees, fast and venomous.'],
  cherrufe:['El Cherufe vive dentro de los volcanes. Hecho de lava y roca, lanza piedras de fuego.','The Cherufe lives inside volcanoes. Made of lava and rock, it hurls stones of fire.'],
  kowek:['Agua que no corre por donde debe.','Water that does not run where it should.'],
  mawek:['La lluvia cuando se enoja: viene con el mal tiempo.','The rain when it gets angry: it comes with bad weather.'],
  kamawetu:['Un ternero con un cuerno brillante que nace en los ríos y corre hacia el mar, desbordando las aguas.','A calf with a shining horn born in the rivers that runs to the sea, flooding the waters.'],
  basilisko:['Un gallo-culebra nacido de un huevo raro; con su aliento seca a la gente de la casa.','A rooster-serpent hatched from a strange egg; its breath withers the people of the house.'],
  kaleuche:['El Kaleuche, barco fantasma que navega de noche entre la niebla, lleno de luces y música.','The Kaleuche, a ghost ship sailing at night in the fog, full of lights and music.'],
  witranalwe:['Un espíritu alto y huesudo a caballo, que cuida los animales del kalku y castiga a quien se acerca.','A tall, bony spirit on horseback who guards the kalku\'s animals and punishes those who approach.'],
  chinifilu:['La culebra de la ceniza: se enrosca en lo que se olvida.','The serpent of ash: it coils around what is forgotten.'],
  piwuchen:['El gran piwüchen, culebra alada de los ríos del sur. Su silbido seca a los animales.','The great piwüchen, winged serpent of the southern rivers. Its whistle dries the animals.'],
  wallipen:['El Wallepeñ: cabeza de ternero, cuerpo de oveja. Si una mujer encinta lo ve, el niño nace con sus marcas.','The Wallepeñ: calf\'s head, sheep\'s body. If a pregnant woman sees it, the child is born with its marks.'],
  trawko:['El Trawko, hombre pequeño del bosque del sur, con hacha de piedra. Su mirada encanta.','The Trawko, a small man of the southern forest with a stone axe. His gaze enchants.'],
  mewlen:['El remolino de viento que levanta polvo y se lleva lo que encuentra.','The whirlwind that raises dust and carries off what it finds.'],
  kurutrewa:['El perro negro que aparece en los caminos de noche.','The black dog that appears on the roads at night.'],
  fmewlen:['Un remolino grande, de los que se ven en la pampa.','A big whirlwind, the kind you see on the pampa.'],
  kurutoro:['El toro negro, animal de los kalku.','The black bull, an animal of the kalku.'],
  walichu:['El Walichu, espíritu del mal en tierras puelche. Trae enfermedad y mala suerte.','The Walichu, evil spirit of the Puelche lands. It brings sickness and bad luck.'],
  chadikura:['Elëngasëm, gigante de piedra y sal de las tierras del este.','Elëngasëm, giant of stone and salt of the eastern lands.'],
  wenangkun:['La pena que se queda callada.','The sorrow that keeps quiet.'],
  illkun:['La rabia de que te hagan callar.','The rage at being silenced.'],
  llukalfe:['El miedo que se agranda.','The fear that grows bigger.'],
  ayentufe:['La burla del patio de la escuela.','The schoolyard mockery.'],
  profe:['La escuela que prohibió la lengua.','The school that banned the language.'],
  yewen:['La vergüenza de hablar la propia lengua. Es el último enemigo, y el más cercano.','The shame of speaking your own language. It is the last enemy, and the closest one.'],
  epunamun:['El Epunamun, ngen de la guerra, de dos caras. No es malo: pone a prueba a los weichafe.','The Epunamun, ngen of war, with two faces. It is not evil: it tests the weichafe.'],
  ngoyam:['Un alma perdida en la niebla, que ya no recuerda su nombre.','A soul lost in the fog, who no longer remembers its name.'],
  kalku:['El Fütra Kalku, el gran brujo que trabaja para el olvido.','The Fütra Kalku, the great sorcerer who works for the forgetting.'],
  ngoyman1:['Ti Fütra Ngoymatulfe, el gran olvido, el que hace olvidar las palabras.','Ti Fütra Ngoymatulfe, the great forgetting, the one who makes words be forgotten.'],
  llufu1:['El Kaykayfilu, la gran culebra del agua. No es malo: despertó de su sueño y necesita volver a oír su canto.','The Kaykayfilu, the great serpent of the water. It is not evil: it woke from its sleep and needs to hear its song again.']};
['ngoyman2','ngoyman3','ngoyman4','ngoyman5','ngoysum'].forEach(k=>BEST[k]=BEST.ngoyman1);['llufu2','llufu3','llufu4','llufu5'].forEach(k=>BEST[k]=BEST.llufu1);
function bestWhere(t){if(S.beatW&&S.beatW[t])return S.beatW[t];for(const id in MAPS){const m=MAPS[id];for(const e of m.ents||[])if(e.kind==='enemy'&&e.party&&e.party.includes(t))return m.name}return null}
function bestTips(t){const e=ET[t],es=[],en=[];
  if(e.fly){es.push('vuela alto: primero bájalo con nagtu-');en.push('flies high: bring it down first with nagtu-')}
  if(e.armor){es.push('su cuerpo duro aguanta los golpes');en.push('its hard body takes hits well')}
  if(e.curse){es.push('maldice: lleva lawen');en.push('it curses: carry lawen')}
  if(e.drain){es.push('te roba newen');en.push('it steals your newen')}
  if(e.twice){es.push('ataca dos veces');en.push('it attacks twice')}
  if(e.hide){es.push('se esconde');en.push('it hides')}
  if(e.spres){es.push('resiste los golpes especiales');en.push('it resists special strikes')}
  if(e.seals){es.push('barrera de luz: se rompe con '+e.seals.map(r=>r+'-').join(', '));en.push('light barrier: broken with '+e.seals.map(r=>r+'-').join(', '))}
  if(typeof YEWEN_CALL!=='undefined'&&YEWEN_CALL[t]){const h=YEWEN_CALL[t];es.push(h[0]);en.push(h[1])}
  return [es.join('; '),en.join('; ')]}
function openBestiary(back){
  const en=S.gloss==='en',seen=Object.keys(S.beaten||{}).filter(t=>ET[t]&&!/^ngoyman[2-5]$|^llufu[2-5]$/.test(t));
  const total=Object.keys(ET).filter(t=>!/^ngoyman[2-5]$|^llufu[2-5]$|^ngoysum$/.test(t)).length;
  if(!seen.length)return say([N('Todavía no has vencido a ningún wekufü. Cada uno que venzas tendrá su página aquí.','You have not beaten any wekufü yet. Each one you beat will get its page here.')],back);
  choose({m:'Wekufü chillka · '+seen.length+'/'+total,es:'¿Qué página quieres leer?',en:'Which page do you want to read?'},
    seen.map(t=>({m:ET[t].name,g:(ET[t].boss?'★ ':'')+'×'+S.beaten[t],v:t})).concat([{m:en?'Back':'Volver',v:'x'}]),t=>{
    if(!t||t==='x')return back&&back();
    const b=BEST[t]||['Un wekufü de estas tierras.','A wekufü of these lands.'],w=bestWhere(t),tp=bestTips(t);
    const ls=[L('',GR('Fey ta '+ET[t].name+'.'),'Este es '+ET[t].name+'.','This is '+ET[t].name+'.')];
    if(w)ls.push(L('',w+' mew müley.','Vive en '+w+'.','It lives in '+w+'.'));
    ls.push(N(b[0],b[1]));if(tp[0])ls.push(N('Cómo vencerlo: '+tp[0]+'.','How to beat it: '+tp[1]+'.'));
    ls.push(N('Lo has vencido '+S.beaten[t]+(S.beaten[t]>1?' veces.':' vez.'),'You have beaten it '+S.beaten[t]+' time'+(S.beaten[t]>1?'s.':'.')));
    say(ls,()=>openBestiary(back))},true)}

/* ---------- 6. learning report (for the player and for teachers) ---------- */
function reportText(){
  const en=S.gloss==='en',F=S.flags,yes=k=>F[k]?'✓':'·',acc=S.acc||{},mins=Math.round((S.wtime||0)/3600);
  const rows=Object.keys(acc).sort().map(k=>{const a=acc[k];return '  '+k.padEnd(26)+String(a.c).padStart(4)+' / '+String(a.t).padEnd(4)+(a.t?Math.round(100*a.c/a.t)+'%':'')});
  const ml=missList().slice(0,12).map(m=>'  '+(m.q.m||m.q.es||'').replace(/^⧉ /,'').slice(0,40).padEnd(42)+'→ '+m.a);
  const trw=TRW_IDS.filter(k=>F['trw_'+k]).length+'/'+TRW_IDS.length;
  const tabs=typeof TAB_IDS!=='undefined'?TAB_IDS.filter(t=>F['tab_'+t]).length:0;
  const ntk=Object.keys(NUTK).filter(k=>F['ntk_'+k]).length;
  const L1=en?['KIMÜN REPORT · Kewün ñi Newen','Player','Level','Play time','min','Ngen awakened','Verb roots','Trawün lessons','Kuyfi chillka','Nütramkan','Wekufü beaten','Accuracy by topic (correct / attempts)','Still to practise (most missed first)','Nothing pending: well done!']
    :['INFORME DE KIMÜN · Kewün ñi Newen','Jugador/a','Nivel','Tiempo de juego','min','Ngen despertados','Raíces verbales','Lecciones del trawün','Kuyfi chillka','Nütramkan','Wekufü vencidos','Precisión por tema (aciertos / intentos)','Por practicar (lo más fallado primero)','Nada pendiente: ¡bien hecho!'];
  return [L1[0],'',L1[1]+': '+S.name+(S.hm?' (weichafe)':''),L1[2]+': kimün '+S.lvl,L1[3]+': '+mins+' '+L1[4],
    L1[5]+': '+['ngen','ngen2','ngen3','ngen4','ngen5'].filter(k=>F[k]).length+'/5'+(F.won?'  · Ti Fütra Ngoymatulfe ✓':''),
    L1[6]+' ('+S.roots.length+'): '+S.roots.map(r=>r+'-').join(', '),L1[7]+': '+trw,L1[8]+': '+tabs+'/6',L1[9]+': '+ntk+'/'+Object.keys(NUTK).length,
    L1[10]+': '+Object.keys(S.beaten||{}).length,(en?'Translations peeked at (Mapudungun-only mode)':'Traducciones consultadas (modo re mapudungun)')+': '+(S.peek||0)+(S.nogloss?'':(en?' · mode off':' · modo apagado')),'',L1[11]+':',...(rows.length?rows:['  —']),'',L1[12]+':',...(ml.length?ml:['  '+L1[13]]),'',new Date().toLocaleString()].join('\n')}
function openReport(back){
  const t=reportText(),en=S.gloss==='en';let ov=document.getElementById('report');
  if(!ov){ov=document.createElement('div');ov.id='report';document.body.appendChild(ov)}
  ov.innerHTML='<div class="rb"><pre></pre><div class="rr"><button data-a="copy"></button><button data-a="print"></button><button data-a="close"></button></div></div>';
  ov.querySelector('pre').textContent=t;const bs=ov.querySelectorAll('button');
  bs[0].textContent=en?'Copy':'Copiar';bs[1].textContent=en?'Print / PDF':'Imprimir / PDF';bs[2].textContent=en?'Close':'Cerrar';
  ov.style.display='flex';active={kind:'report',a(){},b(){close()}};
  const close=()=>{ov.style.display='none';active=null;back&&back()};
  bs[0].onclick=()=>{(navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(()=>{bs[0].textContent='✓'},()=>{const r=document.createRange();r.selectNodeContents(ov.querySelector('pre'));const sl=getSelection();sl.removeAllRanges();sl.addRange(r)})};
  bs[1].onclick=()=>{const w=window.open('','_blank');if(!w){bs[1].textContent='✗';return}
    w.document.write('<!DOCTYPE html><meta charset="utf-8"><title>Kimün report</title><pre style="font:14px/1.5 ui-monospace,Menlo,monospace;white-space:pre-wrap">'+esc(t)+'</pre><script>print()<\/script>');w.document.close()};
  bs[2].onclick=close}

/* ---------- 7. palin: call the plays in Mapudungun ---------- */
let PALIN=null;
const PALIN_PLAYS=[
  {es:'¡La pali rueda hacia el norte!',en:'The pali rolls north!',a:'Pikun püle!'},
  {es:'¡La pali se va hacia el sur!',en:'The pali heads south!',a:'Willi püle!'},
  {es:'¡La pali corre hacia el este, hacia la raya rival!',en:'The pali runs east, toward the rival line!',a:'Puel püle!'},
  {es:'¡La pali vuelve hacia el oeste!',en:'The pali comes back west!',a:'Lafken püle!'},
  {es:'Tu compañera está lejos de la pali: ¡que corra!',en:'Your teammate is far from the pali: she must run!',a:'Lefnge!'},
  {es:'Te rodean tres rivales: necesitas que tu compañero venga.',en:'Three rivals surround you: you need your teammate to come.',a:'Küpange!'},
  {es:'Un rival se pega a ti: ¡que se vaya!',en:'A rival sticks to you: make him go away!',a:'Amutunge!'},
  {es:'Tus dos compañeros están lejos: ¡que corran los dos!',en:'Both your teammates are far away: both must run!',a:'Lefmu!'}];
const PALIN_OPTS=['Pikun püle!','Willi püle!','Puel püle!','Lafken püle!','Lefnge!','Lefmu!','Küpange!','Amutunge!'];
function palinTalk(){
  const en=S.gloss==='en',first=!S.flags.palin_won;
  say([L('Palife','Mari mari! Palituaiñ?','¡Hola! ¿Jugamos palin? Nos falta una persona en el equipo.','Hello! Shall we play palin? Our team is one player short.')],()=>
    choose({m:'Palituaiñ?',es:'¿Juegas palin?',en:'Play palin?'},[{m:'May',g:en?'Play a match':'Jugar un partido',v:1},{m:'Wüle müten',g:en?'Later':'Después',v:0}],v=>{if(!v)return;
      say([N('El palin se juega con el wiño (el palo curvo) y la pali (la bola). Tu equipo empuja la pali hacia el puel, el este; el rival, hacia el lafken, el oeste.','Palin is played with the wiño (the curved stick) and the pali (the ball). Your team pushes the pali toward the puel, the east; the rivals push it toward the lafken, the west.'),
        N('Tú gritas las jugadas: hacia dónde va la pali (pikun, willi, puel, lafken püle) y qué deben hacer tus compañeros. Tres rayas ganan.','You call the plays: where the pali goes (pikun, willi, puel, lafken püle) and what your teammates must do. Three points win.')],()=>{
        PALIN={pos:0,us:0,them:0,n:0,t:0};play()})},true,true));
  function play(){
    if(PALIN.us>=3||PALIN.them>=3||PALIN.n>=15)return end();
    const P2=PALIN_PLAYS[rnd(PALIN_PLAYS.length)];PALIN.n++;
    const o=[P2.a];const others=PALIN_OPTS.filter(x=>x!==P2.a);while(o.length<3)o.push(others.splice(rnd(others.length),1)[0]);
    for(let a=o.length-1;a>0;a--){const b=rnd(a+1);[o[a],o[b]]=[o[b],o[a]]}
    choose({es:P2.es,en:P2.en},o.map(x=>({m:x,v:x})),v=>{const ok=v===P2.a;track('palin',ok,{m:'',es:P2.es,en:P2.en},PALIN_OPTS.filter(x=>o.includes(x)),P2.a);
      if(ok){sfx('ok');PALIN.pos++}else{sfx('bad');PALIN.pos--}
      const ls=[L(S.name,v,ok?'¡Bien dicho! Tu equipo avanza.':'Tu equipo no entiende la jugada y pierde terreno.',ok?'Well called! Your team moves forward.':'Your team does not understand the call and loses ground.')];
      if(!ok)ls.push(N('Se decía: '+P2.a,'The call was: '+P2.a));
      if(PALIN.pos>=3){PALIN.us++;PALIN.pos=0;const nw=numW(PALIN.us);ls.push(L('Pu che',nw[0].toUpperCase()+nw.slice(1)+' raya!','¡Raya para tu equipo! Van '+PALIN.us+' a '+PALIN.them+'.','A point for your team! It is '+PALIN.us+' to '+PALIN.them+'.'))}
      if(PALIN.pos<=-3){PALIN.them++;PALIN.pos=0;ls.push(N('Raya para el equipo rival. Van '+PALIN.us+' a '+PALIN.them+'.','A point for the rival team. It is '+PALIN.us+' to '+PALIN.them+'.'))}
      say(ls,play)},false,true)}
  function end(){const won=PALIN.us>PALIN.them;const ls=[];
    if(won){ls.push(L('Palife','Iñchiñ wewiñ!','¡Ganamos!','We won!'));if(first){S.flags.palin_won=1;S.gold+=30;S.xp+=8;ls.push(N('+30 ngülliw · +8 kimün. Desde hoy te llaman palife, jugadora o jugador de palin.','+30 ngülliw · +8 kimün. From today they call you palife, a palin player.'))}}
    else ls.push(L('Palife','Ka antü!','¡Otro día será! El palin se aprende jugando.','Another day! You learn palin by playing.'));
    PALIN=null;persist();say(ls,()=>{if(S.xp>=xpNeed())levelUpCheck()})}
}
function drawPalin(c){if(!PALIN)return;const x0=Math.round(LW/2-70),y0=VY+50;
  R(c,x0-4,y0-4,148,30,'rgba(12,10,30,.7)');R(c,x0,y0+8,140,6,'#4a7a2e');R(c,x0,y0+8,140,1,'#7aa848');
  for(let k=-3;k<=3;k++)R(c,x0+70+k*20,y0+6,1,10,k===-3||k===3?'#f4e8c8':'rgba(244,232,200,.35)');
  const bx=x0+70+PALIN.pos*20;R(c,bx-2,y0+9,4,4,'#f4f0e8');R(c,bx-1,y0+9,2,1,'#ffffff');
  OV.push(()=>{txt('lafken',x0-2,y0+30,'#bfe3d0',9);txt('puel',x0+142,y0+30,'#bfe3d0',9,'right');txt(PALIN.us+' – '+PALIN.them,LW/2,y0+3,'#ffe8a0',12,'center')})}

/* ---------- 8. trafkintu: trading with numbers in Mapudungun ---------- */
function trafkintuTalk(){
  const en=S.gloss==='en',first=!S.flags.traf_done;
  say([L('Trafkintufe','Mari mari! Trafkintuaiñ?','¡Hola! ¿Hacemos trafkintu? Yo ofrezco, tú decides si el trato es justo.','Hello! Shall we do trafkintu? I make offers, you decide whether the deal is fair.'),
    N('En el trafkintu se cambian cosas. Ella te dirá el precio en mapudungun. Si el precio es justo (como en la tienda o menos), acepta con «May». Si es un abuso, di «No».','In trafkintu people exchange goods. She will tell you the price in Mapudungun. If it is fair (shop price or less), accept with "May". If it is a rip-off, say "No".')],()=>{
    let good=0,n=0;const items=['kulon','diwen','kofke','lawen','mate'];
    const offer=()=>{if(n>=5)return end();n++;const it=items[rnd(items.length)],base=ITEMS[it].p,fair=Math.random()<.55;
      const price=fair?Math.max(1,Math.round(base*(.5+Math.random()*.5))):Math.round(base*(2+Math.random()*2));
      choose({m:'Kiñe '+ITEMS[it].m+': '+numW(price)+' ngülliw.',es:'(Tienes '+S.gold+' ngülliw. En la tienda vale '+base+'.) ¿Aceptas?',en:'(You have '+S.gold+' ngülliw. In the shop it costs '+base+'.) Do you accept?'},
        [{m:'May',g:en?'Accept':'Acepto',v:1},{m:'No',g:en?'Decline':'No acepto',v:0}],v=>{
        const right=fair?v===1:v===0;track('trafkintu (números)',right,{m:'Kiñe '+ITEMS[it].m+': '+numW(price)+' ngülliw.',es:'¿Cuántos ngülliw pide?',en:'How many ngülliw does she ask?'},[...new Set([String(price),String(base*3),String(price+7),String(Math.max(1,price-3))])].slice(0,3),String(price));
        if(right)good++;
        if(v===1){if(S.gold<price){sfx('bad');return say([N('No te alcanza: pide '+price+' y tienes '+S.gold+'.','You cannot afford it: she asks '+price+' and you have '+S.gold+'.')],offer)}
          S.gold-=price;S.items[it]=(S.items[it]||0)+1;sfx(fair?'ok':'bad');
          return say([fair?L('Trafkintufe','Kümey!','Buen trato para los dos.','A good deal for both of us.'):L('Trafkintufe','Hehe...','(Se ríe.) Pagaste '+price+'. ¡En la tienda valía '+base+'!','(She laughs.) You paid '+price+'. In the shop it was '+base+'!')],offer)}
        sfx(fair?'bad':'ok');say([fair?N('Era un buen precio: '+price+' ('+numW(price)+').','That was a good price: '+price+' ('+numW(price)+').'):L('Trafkintufe','Kimimi!','¡No te dejas engañar! Pedía '+price+'.','You cannot be fooled! I was asking '+price+'.')],offer)},false,true)};
    const end=()=>{const ls=[L('Trafkintufe','Pewkayal!',good+'/5 tratos bien decididos.',good+'/5 deals judged right.')];
      if(good>=4&&first){S.flags.traf_done=1;S.items.lawen=(S.items.lawen||0)+2;sfx('lvl');ls.push(N('Te regala dos lawen: «Quien sabe contar en mapudungun no se deja engañar».','She gives you two lawen: "Whoever can count in Mapudungun is never fooled."'))}
      persist();say(ls)};
    offer()})}

/* builder steps added to the five trawün lessons */
[['lof',0,'küdaw- termina en consonante: -ymi se vuelve -imi. Küdawimi, tú trabajas.','küdaw- ends in a consonant: -ymi becomes -imi. Küdawimi, you work.'],
 ['n_lof',1,'-yngu: ellos dos. Amuyngu, ellos dos van.','-yngu: the two of them. Amuyngu, the two of them go.'],
 ['p_lof',2,'Primero -la- (no), después -a- (futuro): amu-la-a-n. Entre las dos a aparece una y: amulayan.','First -la- (not), then -a- (future): amu-la-a-n. Between the two a\'s a y appears: amulayan.'],
 ['w_lof',5,'Chumül pregunta «cuándo», y amuaymi es «irás»: Chumül amuaymi?','Chumül asks "when", and amuaymi is "you will go": Chumül amuaymi?'],
 ['e_lof',3,'-ke- va justo antes de la persona: amu-ke-ymi, amukeymi.','-ke- goes right before the person: amu-ke-ymi, amukeymi.']].forEach(([id,k,es,en])=>{
  const T=TRAWUN[id];if(!T)return;T.steps.push({b:BUILDERS[k],why:N(es,en)})});
