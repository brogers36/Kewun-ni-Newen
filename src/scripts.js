/* ============================================================
   NPC SCRIPTS
   ============================================================ */
const nm=()=>S.name;
function learnRoot(r){if(!S.roots.includes(r))S.roots.push(r)}
function introScript(){
  say([
    L('Kuku','Mari mari, '+nm()+'!','¡Hola, '+nm()+'!','Hello, '+nm()+'!'),
    L('Kuku','Chumleymi?','¿Cómo estás?','How are you?'),
    L(nm(),'Kümelen, kuku. Eymi kay?','Estoy bien, kuku. ¿Y tú?','I am well, kuku. And you?'),
    L('Kuku','Iñche ka kümelen. Welu... müley wekufü!','Yo también estoy bien. Pero... ¡hay wekufü!','I am well too. But... there are wekufü!'),
    N('Para echarlos, diles amutu- ("irse de aquí"). Puedes hablarle a uno solo, con -nge, o a todos juntos: a dos, con -mu; a tres o más, con -mün.','To drive them off, tell them amutu- ("go away from here"). You can speak to just one, with -nge, or to all of them together: to two, with -mu; to three or more, with -mün.'),
    L('Kuku','Kiñe: amutunge. Epu: amutumu. Küla: amutumün.','Uno: amutunge. Dos: amutumu. Tres (o más): amutumün.','One: amutunge. Two: amutumu. Three (or more): amutumün.'),
    N('Hablarle a uno solo pega más fuerte; hablarles a todos alcanza a todos, pero más suave. Y recuerda: tu newen no vuelve solo. Descansa junto a cada kütral que encuentres.','Speaking to just one hits harder; speaking to all of them reaches everyone, but more softly. And remember: your newen does not come back on its own. Rest by every kütral you find.'),
    L('Kuku','Kiñe chillka elueyu.','Te doy un chillka, un libro.','I give you a chillka, a book.'),
    N('En el chillka están las terminaciones de los verbos, la negación, el futuro, los números y los colores. Ábrelo en el menú (M), y también cuando una piedra te haga una pregunta. No trae las respuestas: trae los patrones para que las descubras.','The chillka holds verb endings, negation, the future, numbers and colours. Open it from the menu (M), and also whenever a stone asks you a question. It does not give the answers: it gives the patterns so you can work them out.'),
    L('Kuku','Lof mew amuaymi. Lonko mew dungunge.','Ve al lof. Habla con el lonko.','Go to the lof. Speak with the lonko.'),
    L('Kuku','Pewkayal!','¡Hasta luego!','See you later!')
  ],()=>{learnRoot('küpa');S.flags.intro=1;persist()});
}
function kukuRupu(){say([L('Kuku','Mari mari, '+nm()+'!','¡Hola, '+nm()+'!','Hello, '+nm()+'!'),
  L('Kuku','Kiñe: amutunge. Epu: amutumu. Küla: amutumün.','Uno: amutunge. Dos: amutumu. Tres (o más): amutumün.','One: amutunge. Two: amutumu. Three (or more): amutumün.'),
  N('Cuenta los wekufü antes de hablarles. Si le hablas a uno solo, siempre es -nge.','Count the wekufü before you speak to them. If you speak to just one, it is always -nge.'),
  N('Y no olvides tu chillka: ahí están los patrones de los verbos (menú, M).','And do not forget your chillka: the verb patterns are in it (menu, M).')])}
function weaverTalk(){
  if(S.flags.weaver)return say([L('Ngürekafe','Ngürekan, '+addr(true)+'.','Estoy tejiendo, '+addr(true)+'.','I am weaving, '+addr(true)+'.'),L('Ngürekafe','Kümey tami trarilonko!','¡Qué lindo tu trarilonko!','Your trarilonko is lovely!')]);
  S.flags.weaver=1;
  say([L('Ngürekafe','Mari mari, '+addr(true)+'!','¡Hola, '+addr(true)+'!','Hello, '+addr(true)+'!'),
    L('Ngürekafe','Iñche ngürekan. Tüfa witral pingey.','Yo tejo. Esto se llama witral.','I weave. This is called a witral.'),
    L('Ngürekafe','Kiñe makuñ ngürekan.','Estoy tejiendo un makuñ (poncho).','I am weaving a makuñ (poncho).'),
    N('Cada figura del tejido se aprende mirando a las abuelas. Las manos también recuerdan.','Every figure in the weaving is learned by watching the grandmothers. Hands remember too.'),
    N('(Aprendiste: ngürekan = tejer, witral = telar, makuñ = poncho.)','(You learned: ngürekan = to weave, witral = loom, makuñ = poncho.)')]);
}
function cookTalk(){
  const lines=[L('Papay','Mari mari, '+addr(true)+'!','¡Hola, '+addr(true)+'!','Hello, '+addr(true)+'!'),
    L('Papay','Iyael dewmaken.','Estoy haciendo comida.','I am making food.')];
  if(!S.flags.cook){S.flags.cook=1;S.items.kofke++;persist();
    lines.push(L('Papay','Iaymi? Kiñe kofke elueyu.','¿Vas a comer? Te doy un pan.','Will you eat? I give you a bread.'),
      L(nm(),'Chaltu may, papay!','¡Gracias, señora!','Thank you, ma\'am!'),N('Recibiste un kofke.','You received a kofke.'));sfx('pick')}
  else lines.push(L('Papay','Kofke, ilo, poñü... Kümey!','Pan, carne, papas... ¡Qué rico!','Bread, meat, potatoes... Delicious!'));
  say(lines);
}
const LESSON=[{q:{es:'(Señala el pan.)',en:'(She points at the bread.)'},a:'kofke',o:['kofke','ko','kütral']},
  {q:{es:'(Señala el agua del cántaro.)',en:'(She points at the water in the jug.)'},a:'ko',o:['lafken','ko','kofke']},
  {q:{es:'(Señala el fuego.)',en:'(She points at the fire.)'},a:'kütral',o:['kütral','antü','ruka']},
  {q:{es:'(Señala una casa.)',en:'(She points at a house.)'},a:'ruka',o:['mawida','ruka','lof']},
  {q:{es:'(Señala un pescado.)',en:'(She points at a fish.)'},a:'challwa',o:['trewa','challwa','külon']},
  {q:{es:'(Señala al perro.)',en:'(She points at the dog.)'},a:'trewa',o:['trewa','mañke','pewen']}];
function teacherTalk(){
  const i=(S.flags.lesson||0)%LESSON.length,Ls=LESSON[i];
  const first=!S.flags.lesson;
  say([L('Kimeltuchefe','Mari mari, '+addr(true)+'!'+(first?' Iñche kimeltuchefe ngen.':''),'¡Hola, '+addr(true)+'!'+(first?' Soy profesora.':''),'Hello, '+addr(true)+'!'+(first?' I am a teacher.':'')),
    first?L('Kimeltuchefe','Mapudungun kimeltuken.','Enseño mapudungun.','I teach Mapudungun.'):null,
    L('Kimeltuchefe','Chem pingey tüfa?','¿Cómo se llama esto?','What is this called?')],()=>{
    choose(L('',G(Ls.q),'',''),Ls.o.map(o=>({m:o+' pingey.',v:o})),v=>{
      if(v===Ls.a){S.flags.lesson=(S.flags.lesson||0)+1;S.xp+=3;persist();
        say([praise(),L('Kimeltuchefe',Ls.a+' pingey. Kümey!',Ls.a+', así se llama. ¡Bien!','It is called '+Ls.a+'. Good!'),N('+3 kimün.','+3 kimün.')],()=>{if(S.xp>=xpNeed())levelUpCheck()})}
      else{sfx('bad');say([L('Kimeltuchefe','Fey no...','No, eso no...','No, not that...'),N('Escucha otra vez y vuelve a intentarlo.','Listen again and try once more.')])}
    },false,true)});
}
function levelUpCheck(){const ls=[];while(S.xp>=xpNeed()){S.xp-=xpNeed();S.lvl++;S.baseMax+=HPQ;S.hp+=HPQ;S.baseAtk+=1;if(S.lvl%2===0)S.baseDef+=1;
  ls.push(L('','Doy kimün!','¡Más conocimiento! Llegas a kimün '+S.lvl+': ganas un corazón y más fuerza.','More knowledge! You reach kimün '+S.lvl+': you gain a heart and more strength.'))}
  if(ls.length){sfx('lvl');persist();say(ls)}}
function kidTalk(i){
  const T=[[L('Pichiche','Kiñe, epu, küla, meli!','¡Uno, dos, tres, cuatro!','One, two, three, four!'),L('Pichiche','Kechu, kayu... regle?','Cinco, seis... ¿siete?','Five, six... seven?')],
    [L('Pichiche','Mari mari, '+addr(false)+'!','¡Hola, '+addr(false)+'!','Hello, '+addr(false)+'!'),L('Pichiche','Mapudungun ayüken!','¡Me gusta el mapudungun!','I love Mapudungun!')],
    [L('Pichiche','Iñche ka kimün: "kofke", "ko", "kütral"!','Yo también sé: "pan", "agua", "fuego".','I know too: "bread", "water", "fire"!')]][i];
  say(T);
}
function walkerTalk(){say([L('Wentru','Mari mari, '+addr(false)+'.','Hola, '+addr(false)+'.','Hello, '+addr(false)+'.'),L('Wentru','Mamüll yeken ruka mew.','Llevo leña a la casa.','I am carrying firewood home.'),L('Wentru','Mawünay.','Va a llover.','It is going to rain.')])}
function runnerTalk(){say([L('Pichi domo','Ayüwün!','¡Qué contenta estoy!','I am so happy!'),N('La niña sigue corriendo en círculos, riéndose.','The girl keeps running in circles, laughing.')])}
function dogTalk(){sfx('ok');say([L('','Trewa','Un trewa (perro) mueve la cola y te huele la mano.','A trewa (dog) wags its tail and sniffs your hand.')])}
function konaTalk(){say([L('Kona','Mari mari, '+addr(false)+'! Palin müley.','¡Hola, '+addr(false)+'! Hay palin.','Hello, '+addr(false)+'! There is a palin game.'),
  L('Kona','Iñche ka palin ayüken.','A mí también me gusta el palin.','I like palin too.'),
  N('Dos equipos, cada jugador con su wiño (un palo curvo), buscan llevar la pali (la bola) hasta el final de la cancha, el paliwe.','Two teams, each player with a wiño (a curved stick), try to carry the pali (the ball) to the end of the field, the paliwe.')])}
function fisherTalk(){say([L('Challwafe','Mari mari, '+addr(false)+'!','¡Hola, '+addr(false)+'! (challwafe: pescador)','Hello, '+addr(false)+'! (challwafe: fisherman)'),
  L('Challwafe','Challwatuken lafken mew.','Pesco en el mar.','I fish in the sea.'),
  N('Los ngülliw se cuentan en mapudungun. Escucha:','Ngülliw are counted in Mapudungun. Listen:'),
  L('Challwafe','Kiñe, epu, küla, meli, kechu.','Uno, dos, tres, cuatro, cinco.','One, two, three, four, five.'),
  L('Challwafe','Kayu, regle, pura, aylla, mari.','Seis, siete, ocho, nueve, diez.','Six, seven, eight, nine, ten.'),
  L('Challwafe','Epu mari, küla mari... kechu mari.','Veinte, treinta... cincuenta.','Twenty, thirty... fifty.')])}
function childTalk(){
  if(!S.flags.childk){
    say([L('Pichiche','Mari mari!','¡Hola! ¿Te digo un konew? (adivinanza)','Hello! Want a konew? (riddle)')],()=>{
      choose(L('Pichiche','Lafken mew müley; pu che nükefingün ka ikefingün. Chem am ta tatey?','Vive en el mar; la gente lo pesca y se lo come. ¿Qué será?','It lives in the sea; people catch it and eat it. What could it be?'),
        [{m:'challwa',g:'pez / fish',v:1},{m:'mañke',g:'cóndor / condor',v:0},{m:'pewen',g:'araucaria',v:0},{m:'kuyüm',g:'arena / sand',v:0}],v=>{
          if(v){S.flags.childk=1;S.items.kulon++;persist();sfx('pick');say([praise(),L('Pichiche','Challwa! Kiñe külon elueyu.','¡Pez! Te doy un külon.','Fish! I give you a külon.')])}
          else{sfx('bad');say([N('Mm, no. Piensa en el mar...','Hmm, no. Think of the sea...')])}},false,false)})
  }else say([L('Pichiche','Pewkayal!','¡Chao!','Bye!')]);
}
function pescadoraTalk(){
  if(!S.roots.includes('nag')){
    say([L('Challwafe','Mari mari, '+addr(true)+'.','Hola, '+addr(true)+'.','Hello, '+addr(true)+'.'),
      L('Challwafe','Müley chon chon!','¡Hay chon chon!','There are chon chon!'),
      N('Los chon chon vuelan alto: amutu- no los alcanza. Primero diles nag- ("bajar"): nagnge, nagmu, nagmün. Ya en el suelo, échalos.','Chon chon fly high: amutu- cannot reach them. First tell them nag- ("come down"): nagnge, nagmu, nagmün. Once they are on the ground, drive them off.'),
      N('Aprendiste nag- (bajar).','You learned nag- (come down).')],()=>{learnRoot('nag');sfx('lvl');persist()});
  }else say([L('Challwafe','Newentunge!','¡Ánimo!','Be strong!'),N('Los anchimallén brillan y curan a otros wekufü. Si los haces dormir con umawtu-, dejan de molestar.','The anchimallén glow and heal other wekufü. If you make them sleep with umawtu-, they stop helping.')]);
}
function gathererTalk(){
  const ls=[L('Domo','Mari mari, '+addr(true)+'!','¡Hola, '+addr(true)+'!','Hello, '+addr(true)+'!'),L('Domo','Külon kintuken.','Ando buscando maqui.','I am looking for maqui.')];
  if(!S.flags.gatherer){S.flags.gatherer=1;S.items.kulon+=2;persist();sfx('pick');ls.push(L('Domo','Epu külon elueyu.','Te doy dos külon.','I give you two külon.'),N('Recibiste dos külon.','You received two külon.'))}
  ls.push(L('Domo','Mawida mew müley lawen.','En el monte hay lawen (plantas que sanan).','In the forest there is lawen (healing plants).'));say(ls);
}
function fisher2Talk(){say([L('Challwafe','Mari mari, '+addr(false)+'.','Hola, '+addr(false)+'.','Hello, '+addr(false)+'.'),L('Challwafe','Challwatuken. Welu lafken mew müley Trelke-wekufü.','Pesco. Pero en la laguna está Trelke-wekufü.','I fish. But Trelke-wekufü is in the lagoon.'),
  N('Ya casi no hay peces. El agua está callada desde que el trelke-wekufü envolvió a Ngen-lafken.','There are hardly any fish now. The water has been silent since the trelke-wekufü wrapped up Ngen-lafken.')])}
function shoreWomanTalk(){say([L('Papay','Mari mari, '+addr(true)+'.','Hola, '+addr(true)+'.','Hello, '+addr(true)+'.'),
  N('Ese sendero lleva al islote. Ahí abajo está la cueva del trelke-wekufü: tres pisos de piedra, rejas y puertas cerradas.','That path leads to the islet. Down there is the trelke-wekufü\'s cave: three floors of stone, gates and locked doors.'),
  N('Empuja las piedras sobre las losas, busca llaves pequeñas y descansa en cada kütral.','Push the stones onto the plates, look for small keys, and rest at every kütral.'),
  L('Papay','Newentunge!','¡Ánimo!','Be strong!')])}
function shop(where){
  say([L('Ngillakafe','Mari mari! Chem ngillayaymi?','¡Hola! ¿Qué vas a comprar?','Hello! What will you buy?')],list);
  function list(){
    const opts=[];
    for(const k in ITEMS)opts.push({m:ITEMS[k].m+'  ·  '+ITEMS[k].p,g:numW(ITEMS[k].p)+' ngülliw · '+G(ITEMS[k]),v:'i:'+k});
    for(const k in GEAR)opts.push({m:GEAR[k].m+'  ·  '+GEAR[k].p,g:S.gear[k]?(S.gloss==='en'?'(already yours)':'(ya lo tienes)'):numW(GEAR[k].p)+' ngülliw · '+G(GEAR[k]),v:'g:'+k,dis:!!S.gear[k]});
    opts.push({m:'Pewkayal',g:S.gloss==='en'?'See you later (leave)':'Hasta luego (salir)',v:'x'});
    choose({es:'Tienes '+numP(S.gold)+' ngülliw.',en:'You have '+numP(S.gold)+' ngülliw.'},opts,v=>{
      if(v===null||v==='x')return say([L('Ngillakafe','Pewkayal!','¡Hasta luego!','See you later!')]);
      const [t,k]=v.split(':'),it=t==='i'?ITEMS[k]:GEAR[k];
      if(S.gold<it.p){sfx('bad');return say([N('No te alcanzan los ngülliw. Te faltan '+numP(it.p-S.gold)+'.','You do not have enough ngülliw. You need '+numP(it.p-S.gold)+' more.')],list)}
      choose(L('',it.m+' · '+numW(it.p)+' ngülliw','¿Lo compras?','Buy it?'),[{m:'Ngillayafiñ',g:S.gloss==='en'?'I will buy it':'Lo voy a comprar',v:1},{m:'Ngillalayafiñ',g:S.gloss==='en'?'I will not buy it':'No lo voy a comprar',v:0}],y=>{
        if(!y)return list();
        S.gold-=it.p;if(t==='i')S.items[k]++;else{S.gear[k]=1;if(k==='trariwe')S.hp+=HPQ}
        persist();sfx('pick');say([L('Ngillakafe','Chaltu may!','¡Gracias!','Thank you!')],list)},true,false)
    },true,true);
  }
}
function ngenTalk(){say([L('Ngen-lafken','Mapudungukeaiñ!','¡Hablemos mapudungun!',"Let's speak Mapudungun!")])}
function fireSave(){
  S.hp=maxHP();S.sp=SPMAX;S.save={map:CUR,x:P.x,y:P.y};persist();sfx('heal');
  say([L('','Kütral mew ürkütun.','Descansas junto al kütral. Tus piwke y tu newen especial se recuperan por completo, y tu camino queda guardado.','You rest by the fire. Your hearts and your special newen are fully restored, and your journey is saved.')]);
}
function openChest(x,y,what){
  if(what==='locked')return say([N('Un cofre detrás del viento. Tendrás que volver con el newen de Ngen-kürüf.','A chest behind the wind. You will have to come back with the newen of Ngen-kürüf.')]);
  setTileFlag(x,y);sfx('pick');
  if(what==='numgift'){S.gold+=30;S.items.kofke++;persist();return say([L('','Küla mari ngülliw!','Dentro hay küla mari (30) ngülliw y un kofke.','Inside are küla mari (30) ngülliw and a kofke.')])}
  if(what==='mawgift'){S.gold+=40;S.items.lawen++;persist();return say([L('','Meli mari ngülliw!','Dentro hay meli mari (40) ngülliw y un lawen.','Inside are meli mari (40) ngülliw and a lawen.')])}
  if(what==='winotu'){learnRoot('wiñotu');S.flags.root_winotu=1;persist();sfx('lvl');return say([
    L('','wiñotu-','Encontraste una raíz nueva: wiñotu-, «volver, regresar».','You found a new root: wiñotu-, «go back, return».'),
    L('','wiñotunge · wiñotumu · wiñotumün','¡Vuelve atrás! (a uno) · (a dos) · (a tres o más)','Go back! (to one) · (to two) · (to three or more)'),
    N('Un wekufü al que le dices que vuelva atrás retrocede y pierde su turno. Y dicen que hasta el Witranalwe se encoge cuando lo obligan a retroceder.','A wekufü you tell to go back steps away and loses its turn. And they say even the Witranalwe shrinks when it is forced back.')])}
  if(what==='lawen1'){S.items.lawen++;persist();return say([L('','Lawen!','Encontraste un lawen (remedio).','You found a lawen (medicine).')])}
  if(what==='piwke')return gainPiwke([N('Dentro del cofre brilla algo rojo...','Something red glows inside the chest...')]);
  if(what==='rune'){S.runes.push('kil');S.flags.rune_kil=1;persist();sfx('lvl');return say([
    L('','-kil-','Encontraste la runa -kil-: la prohibición. Pone el imperativo en negativo: "¡no...!"','You found the -kil- rune: prohibition. It turns a command negative: "don\'t...!"'),
    L('','küpakilnge · küpakilmu · küpakilmün','¡No vengas! (a uno) · ¡No vengan! (a dos) · ¡No vengan! (a tres o más)',"Don't come! (to one) · (to two) · (to three or more)"),
    N('Cuando un wekufü venga a atacarte, dile que no venga y bloquearás el golpe. Puedes decírselo solo a ese wekufü, o a todos.','When a wekufü comes at you, tell it not to come and you will block the blow. You can say it to just that wekufü, or to all of them.')])}
}
function konew(x,y,K){
  say([K.q],()=>ask());
  function ask(){
    const opts=K.opts.map((o,k)=>({m:o.m,g:G(o),v:k}));
    choose(L('','Chem am ta tatey?','¿Qué será?','What could it be?'),opts,v=>{
      if(v===null)return;
      if(K.opts[v].ok){setTileFlag(x,y);sfx('door');const ls=[praise(),N('La puerta del konew se abre.','The konew door opens.')];
        if(K.reward==='piwke')return gainPiwke(ls);
        persist();say(ls)}
      else{sfx('bad');say([N('La puerta no se mueve. Piensa otra vez.','The door does not move. Think again.')],ask)}
    },true,true);
  }
}

/* ---------- Mapudungun puzzles ---------- */
let PZ={n:0,lit:new Set()};
function pzSolved(){return !!S.flags['pz:'+CUR]}
function pzOpen(){for(let y=0;y<M.h;y++)for(let x=0;x<M.w;x++)if(grid[y][x]==='E')grid[y][x]=M.floor}
function pzTouch(tx,ty){
  const k=tx+','+ty,t=M.pz.tiles[k],tot=Object.keys(M.pz.tiles).length;
  if(pzSolved())return say([L('',t.lab,M.pz.kind==='N'?'La piedra brilla en silencio.':'El brasero sigue encendido.',M.pz.kind==='N'?'The stone glows quietly.':'The brazier keeps burning.')]);
  if(PZ.lit.has(k))return;
  if(t.i===PZ.n){PZ.lit.add(k);PZ.n++;sfx('ok');
    if(PZ.n>=tot){S.flags['pz:'+CUR]=1;pzOpen();sfx('lvl');persist();
      return say([L('',t.lab+'!',M.pz.kind==='N'?'La última piedra se enciende. ¡Se oye cómo se corre una roca!':'El último brasero se enciende. ¡La puerta de piedra se abre!',M.pz.kind==='N'?'The last stone lights up. You hear a rock sliding away!':'The last brazier lights up. The stone door opens!'),praise()])}
    return say([L('',t.lab,M.pz.kind==='N'?'La piedra se ilumina.':'El brasero se enciende.',M.pz.kind==='N'?'The stone lights up.':'The brazier lights up.')])}
  PZ.n=0;PZ.lit.clear();sfx('bad');
  say([L('',t.lab,M.pz.kind==='N'?'La luz se apaga en todas las piedras. Ese no era el orden.':'Todos los braseros se apagan. Ese no era el orden.',M.pz.kind==='N'?'The light goes out in every stone. That was not the order.':'All the braziers go out. That was not the order.'),
    M.pz.hint?M.pz.hint:M.pz.kind==='N'?N('Pista: kiñe (1), epu (2), küla (3), meli (4).','Hint: kiñe (1), epu (2), küla (3), meli (4).'):N('Pista: lee la piedra tallada. Kallfü = azul, lig = blanco, kelü = rojo.','Hint: read the carved stone. Kallfü = blue, lig = white, kelü = red.')]);
}
const STONES={
  conj:{intro:[L('Kura','Mari mari! Kura ngen, welu dunguken.','¡Hola! Soy una piedra, pero hablo.','Hello! I am a stone, but I speak.'),N('Responde bien y te dejo pasar. Cambia el final del verbo según quién lo hace.','Answer well and I will let you through. Change the end of the verb depending on who does it.')],
    qs:[{q:L('Kura','Fey amu___','Él / ella va. (fey = él, ella)','He / she goes. (fey = he, she)'),o:['amun','amuymi','amuy'],a:'amuy'},
        {q:L('Kura','Eymi küpa___','Tú vienes. (eymi = tú)','You come. (eymi = you)'),o:['küpan','küpaymi','küpay'],a:'küpaymi'},
        {q:L('Kura','Iñche kim___','Yo sé. (iñche = yo)','I know. (iñche = I)'),o:['kimün','kimimi','kimi'],a:'kimün'}]},
  neg:{intro:[L('Kura','Mari mari! Kimimi -la-?','¡Hola! ¿Conoces -la-?','Hello! Do you know -la-?'),N('-la- niega el verbo: amun "voy" → amulan "no voy". Responde bien y la puerta se abrirá.','-la- negates the verb: amun "I go" → amulan "I do not go". Answer well and the door will open.')],
    qs:[{q:N('¿Cómo se dice "no voy"?','How do you say "I do not go"?'),o:['amun','amulan','amulay'],a:'amulan'},
        {q:N('¿Cómo se dice "ella no viene"?','How do you say "she does not come"?'),o:['küpalay','küpay','küpalan'],a:'küpalay'},
        {q:N('¿Cómo se dice "no sé"?','How do you say "I do not know"?'),o:['kimün','kimlay','kimlan'],a:'kimlan'}]},
  poss:{intro:[L('Kura','Mari mari! Kura ngen, welu dunguken.','¡Hola! Soy una piedra, pero hablo.','Hello! I am a stone, but I speak.'),N('¿De quién es? Completa con la palabra correcta y te abro el paso.','Whose is it? Fill in the right word and I will open the way.')],
    qs:[{q:L('Kura','___ ruka','Mi casa.','My house.'),o:['tami','ñi','tañi'],a:'tañi'},
        {q:L('Kura','___ kawellu','Tu caballo.','Your horse.'),o:['tañi','tami','ñi'],a:'tami'},
        {q:L('Kura','___ trewa','Su perro (de él o de ella).','His / her dog.'),o:['ñi','tañi','tami'],a:'ñi'}]},
  plur:{intro:[L('Kura','Mari mari! Kimimi pu?','¡Hola! ¿Conoces pu?','Hello! Do you know pu?'),N('Cuando son dos o muchos, el verbo también cambia. Completa los verbos.','When there are two or many, the verb changes too. Complete the verbs.')],
    qs:[{q:L('Kura','Pu wentru amu___','Los hombres van.','The men go.'),o:['amuy','amuyngu','amuyngün'],a:'amuyngün'},
        {q:L('Kura','Epu domo küpa___','Dos mujeres vienen.','Two women come.'),o:['küpayngu','küpay','küpayngün'],a:'küpayngu'},
        {q:L('Kura','Pu pichikeche kim___','Los niños saben.','The children know.'),o:['kimi','kimingün','kimingu'],a:'kimingün'}]}};
function stoneTalk(id){
  const st=STONES[id];
  if(pzSolved())return say([L('Kura','Kümey! Amunge.','¡Bien! Pasa.','Good! Go on through.')]);
  say(st.intro,()=>ask(0));
  function ask(i){
    if(i>=st.qs.length){S.flags['pz:'+CUR]=1;pzOpen();sfx('lvl');S.xp+=4;persist();return say([praise(),L('Kura','Tuteley! Amunge.','¡Muy bien! Pasa.','Well done! Go on through.'),N('La puerta de piedra se abre. +4 kimün.','The stone door opens. +4 kimün.')],()=>{if(S.xp>=xpNeed())levelUpCheck()})}
    const q=st.qs[i];choose(q.q,q.o.map(o=>({m:o,v:o})).concat([{m:'Chillka',g:S.gloss==='en'?'Check the book':'Consultar el libro',v:'_book'}]),v=>{
      if(v==='_book')return openBook(()=>ask(i));
      if(v===q.a){sfx('ok');ask(i+1)}else{sfx('bad');say([L('Kura','Fey no...','Eso no...','Not that...'),N('Vuelve a intentarlo desde el principio.','Try again from the beginning.')],()=>ask(0))}},false,false)}
}
const WARPS={lafkenche:[{m:'Lafken inaltu',es:'Entrada de la cueva (orilla)',en:'Cave entrance (lagoon shore)',to:['inaltu',21,5]},{m:'Lafkenche lof',es:'El lof de la costa',en:'The coast lof',to:['lof',17,9]}],
  nagche:[{m:'Fütra mawida',es:'Entrada de la guarida (monte)',en:'Lair entrance (forest)',to:['n_mawida',28,4]},{m:'Nagche lof',es:'El lof de los llanos',en:'The lowland lof',to:['n_lof',17,9]}]};
function warpMenu(){
  const opts=[];for(const r in WARPS)if(awake(r))for(const w of WARPS[r])opts.push({m:w.m,g:G(w),v:w.to});
  opts.push({m:'Mülekan faw',g:S.gloss==='en'?'Stay here':'Quedarme aquí',v:'x'});
  choose(L('','Chew amuaymi?','¿A dónde vas?','Where will you go?'),opts,v=>{if(!v||v==='x')return;sfx('cast');loadMap(v[0],v[1],v[2])},true,true);
}

function kukuLof(){
  if(!S.flags.pentukun){
    if(S.flags.pentu_prac)return say([L('Kuku','Lonko mew amunge. Kütral mew müley.','Ve donde el lonko. Está junto al kütral.','Go to the lonko. He is by the fire.'),
      N('Si quieres, puedo ensayar contigo otra vez.','If you like, we can practice again.')],()=>choose({es:'¿Ensayamos otra vez?',en:'Practice again?'},[{m:'May',g:S.gloss==='en'?'Yes':'Sí',v:1},{m:'Dew kimfiñ',g:S.gloss==='en'?'I already know it (no, thanks)':'Ya lo sé (no, gracias)',v:0}],v=>{if(v)runPentukun(true)},true,true));
    return say([L('Kuku','Mari mari, '+nm()+'!','¡Hola, '+nm()+'!','Hello, '+nm()+'!'),
      N('Antes de hablar con el lonko, tienes que saber hacer el pentukuwün: el saludo formal mapuche. No es solo decir "hola": se saluda, se pregunta cómo está la persona, quién es, de dónde viene y cómo está su familia.','Before speaking with the lonko, you need to know how to do the pentukuwün: the formal Mapuche greeting. It is not just saying "hello": you greet, ask how the person is, who they are, where they come from, and how their family is.'),
      N('Ensayemos juntos. Yo hago de lonko; tú contestas.','Let us practice together. I will play the lonko; you answer.')],()=>runPentukun(true));
  }
  say([L('Kuku','Kümey, '+nm()+'!','¡Bien, '+nm()+'!','Good, '+nm()+'!'),L('Kuku','Kütral mew ürkütunge.','Descansa junto al kütral.','Rest by the fire.'),
    N('Mira el lof: aquí se teje, se cocina, se juega palin y los niños aprenden mapudungun. Habla con todos.','Look around the lof: people weave, cook, play palin, and the children learn Mapudungun here. Talk to everyone.')]);
}
function lonkoTalk(){
  if(S.flags.pentukun){
    const ls=[L('Lonko','Mari mari, '+nm()+'.','Hola, '+nm()+'.','Hello, '+nm()+'.')];
    if(S.flags.ngen)ls.push(L('Lonko','Ngen-lafken nepey. Chaltu may!','Ngen-lafken despertó. ¡Gracias!','Ngen-lafken has woken up. Thank you!'),
      N('La niebla se levantó del camino que sale al este de la laguna: lleva a las tierras nagche, los llanos. Allá vive tu chuchu.','The fog has lifted from the road leading east from the lagoon: it goes to the Nagche lands, the lowlands. Your chuchu lives there.'),
      N('Ese trokiñ de trariwe que traes es muy antiguo. Dicen que el trariwe completo, con un trokiñ de cada tierra, es lo único que puede atravesar la niebla de Ti Fütra Ngoyman, el gran olvido.','That trokiñ of trariwe you carry is very old. They say the complete trariwe, with one trokiñ from each land, is the only thing that can pass through the fog of Ti Fütra Ngoyman, the great forgetting.'));
    else ls.push(L('Lonko','Ngen-lafken umawtuy. Trelke-wekufü müley lafken mew.','Ngen-lafken está dormido. Trelke-wekufü está en la laguna.','Ngen-lafken is asleep. Trelke-wekufü is in the lagoon.'),
      N('Sigue la costa hacia el este: las dunas, el monte y la orilla de la laguna.','Follow the coast east: the dunes, the forest, and the shore of the lagoon.'));
    return say(ls);
  }
  if(!S.flags.pentu_prac)return say([L('Lonko','Mari mari, '+nm()+'.','Hola, '+nm()+'.','Hello, '+nm()+'.'),L('Lonko','Tami kuku mew dungunge.','Habla con tu kuku.','Talk to your kuku.'),
    N('El lonko espera un pentukuwün como corresponde. Tu kuku está cerca de su ruka, al oeste del kütral: ella te ayudará a prepararte.','The lonko expects a proper pentukuwün. Your kuku is near her ruka, west of the fire: she will help you prepare.')]);
  runPentukun(false);
}
function runPentukun(practice){
  const en=S.gloss==='en',sp=practice?'Kuku':'Lonko';
  const steps=[
    {q:L(sp,'Mari mari!','¡Hola! (Contesta el saludo.)','Hello! (Answer the greeting.)'),
     ex:N('Primero, el saludo. Se contesta con el mismo saludo y el nombre o el título de la persona: "Mari mari, lonko!"','First, the greeting. You answer with the same greeting and the person\'s name or title: "Mari mari, lonko!"'),
     o:[{m:'Mari mari, lonko!',es:'¡Hola, lonko!',en:'Hello, lonko!',ok:1},{m:'Pewkayal!',es:'¡Hasta luego!',en:'See you later!'},{m:'Chaltu may!',es:'¡Gracias!',en:'Thank you!'}]},
    {q:L(sp,'Chumleymi?','¿Cómo estás?','How are you?'),
     ex:N('Luego te pregunta cómo estás. "Kümelen" es "estoy bien", y "Eymi kay?" devuelve la pregunta: "¿y tú?".','Then you are asked how you are. "Kümelen" means "I am well", and "Eymi kay?" returns the question: "and you?".'),
     o:[{m:'Kümelen. Eymi kay?',es:'Estoy bien. ¿Y tú?',en:'I am well. And you?',ok:1},{m:'Iñche pingen.',es:'Yo me llamo... (incompleto)',en:'My name is... (incomplete)'},{m:'Amunge!',es:'¡Vete!',en:'Go away!'}]},
    {q:L(sp,'Iñche ka kümelen. Iney pingeymi?','Yo también estoy bien. ¿Cómo te llamas?','I am well too. What is your name?'),
     ex:N('Después, tu nombre. Se dice "Iñche ___ pingen": "yo me llamo ___".','Next, your name. You say "Iñche ___ pingen": "my name is ___".'),
     o:[{m:'Iñche '+nm()+' pingen.',es:'Me llamo '+nm()+'.',en:'My name is '+nm()+'.',ok:1},{m:nm()+' pingeymi.',es:'Tú te llamas '+nm()+'.',en:'Your name is '+nm()+'.'},{m:'Kümelen.',es:'Estoy bien.',en:'I am well.'}]},
    {q:L(sp,'Chew tuwimi?','¿De dónde eres?','Where are you from?'),
     ex:N('Te preguntará de dónde vienes. Se contesta con el lugar y "tuwün": "Santiago tuwün", "vengo de Santiago".','You will be asked where you come from. You answer with the place and "tuwün": "Santiago tuwün", "I come from Santiago".'),
     o:[{m:'Santiago tuwün.',es:'Vengo de Santiago.',en:'I come from Santiago.',ok:1},{m:'Chew tuwün?',es:'¿De dónde vengo?',en:'Where do I come from?'},{m:'Lafken mew amuan.',es:'Iré al mar.',en:'I will go to the sea.'}]},
    {q:L(sp,'Chumleyngün tami pu che?','¿Cómo está tu gente (tu familia)?','How are your people (your family)?'),
     ex:N('Al final pregunta por tu familia: son ellos, varias personas, así que se contesta "Kümeleyngün", "ellos están bien".','Finally you are asked about your family: they are several people, so you answer "Kümeleyngün", "they are well".'),
     o:[{m:'Kümeleyngün.',es:'Ellos están bien.',en:'They are well.',ok:1},{m:'Kümelen.',es:'Yo estoy bien.',en:'I am well.'},{m:'Kümeleymi.',es:'Tú estás bien.',en:'You are well.'}]}];
  say([practice?N('Ensayo de pentukuwün con tu kuku. Las respuestas muestran su traducción.','Pentukuwün practice with your kuku. The answers show their translation.'):N('El lonko se pone de pie. Es el momento del pentukuwün, el saludo formal.','The lonko stands up. It is time for the pentukuwün, the formal greeting.')],()=>step(0));
  function step(i){
    if(i>=steps.length)return practice?donePractice():done();
    const s=steps[i];const show=practice||S.hints;
    const go=()=>{const opts=s.o.map((o,k)=>({m:o.m,g:show?(en?o.en:o.es):'',v:k}));
      for(let a=opts.length-1;a>0;a--){const b=rnd(a+1);[opts[a],opts[b]]=[opts[b],opts[a]]}
      choose(s.q,opts,v=>{
        if(s.o[v].ok)say([praise()],()=>step(i+1));
        else{sfx('bad');say([L('Kuku','(…)',(practice?'':'Tu kuku te susurra: ')+s.ex.es,(practice?'':'Your kuku whispers: ')+s.ex.en)],()=>step(i))}
      },false,true)};
    if(practice)say([s.ex],go);else go();
  }
  function donePractice(){S.flags.pentu_prac=1;persist();sfx('lvl');
    say([L('Kuku','Kümey! Tuteley!','¡Bien! ¡Muy bien hecho!','Good! Well done!'),
      N('Ya sabes el pentukuwün. Recuerda el orden: saludo, cómo estás, tu nombre, de dónde vienes, tu familia.','Now you know the pentukuwün. Remember the order: greeting, how are you, your name, where you come from, your family.'),
      L('Kuku','Lonko mew amunge. Kütral mew müley.','Ve donde el lonko. Está junto al kütral.','Go to the lonko. He is by the fire.')])}
  function done(){
    S.flags.pentukun=1;learnRoot('umawtu');S.items.kulon+=2;persist();sfx('lvl');
    say([L('Lonko','Kümey, '+nm()+'! Mapudungun mew dungukeymi.','¡Bien, '+nm()+'! Hablas en mapudungun.','Good, '+nm()+'! You speak in Mapudungun.'),
      L('Lonko','Ngen-lafken umawtuy. Trelke-wekufü müley lafken mew.','Ngen-lafken está dormido. Trelke-wekufü está en la laguna.','Ngen-lafken is asleep. Trelke-wekufü is in the lagoon.'),
      N('El trelke-wekufü lo tiene envuelto en el fondo de la laguna, más allá de las dunas y del monte. Por eso el mar está callado.','The trelke-wekufü has it wrapped up at the bottom of the lagoon, beyond the dunes and the forest. That is why the sea is silent.'),
      L('Lonko','Umawtu- kimeltueyu.','Te enseño umawtu- ("dormir").','I teach you umawtu- ("sleep").'),
      N('Con umawtunge, umawtumu o umawtumün haces dormir a los wekufü. Recibiste umawtu- y dos külon.','With umawtunge, umawtumu or umawtumün you put the wekufü to sleep. You received umawtu- and two külon.'),
      L('Lonko','Amunge, '+nm()+'. Pewkayal!','Ve, '+nm()+'. ¡Hasta luego!','Go, '+nm()+'. See you later!')]);
  }
}

/* ================= NAGCHE ================= */
function chuchuTalk(){
  if(!S.flags.chuchu){S.flags.chuchu=1;S.items.kofke++;persist();sfx('pick');
    return say([L('Chuchu','Mari mari, '+nm()+'! Iñche tami chuchu.','¡Hola, '+nm()+'! Soy tu chuchu.','Hello, '+nm()+'! I am your chuchu.'),
      N('Tu chuchu es la mamá de tu mamá. La kuku, la mamá de tu papá, vive en el lof lafkenche.','Your chuchu is your mother\'s mother. Your kuku, your father\'s mother, lives in the Lafkenche lof.'),
      L('Chuchu','Küme küpaymi!','¡Qué bueno que viniste!','How good that you came!'),
      L('Chuchu','Tüfa tañi ruka.','Esta es mi casa.','This is my house.'),
      L('Chuchu','Tüfa tami kofke.','Este es tu pan.','This is your bread.'),
      N('Tu chuchu te da un kofke. Fíjate: tañi = mi, tami = tu. Y ñi = su (de él o de ella). Tu chillka lo explica en «Tañi, tami, ñi».','Your chuchu gives you a kofke. Notice: tañi = my, tami = your. And ñi = his / her. Your chillka explains it under «Tañi, tami, ñi».'),
      L('Chuchu','Lonko mew amunge. Kütral mew müley.','Ve donde el lonko. Está junto al kütral.','Go to the lonko. He is by the fire.')]);}
  const ls=[L('Chuchu','Mari mari, '+nm()+'!','¡Hola, '+nm()+'!','Hello, '+nm()+'!')];
  if(S.flags.ngen2)ls.push(L('Chuchu','Ngen-mawida nepey! Ayüwün.','¡Ngen-mawida despertó! Estoy feliz.','Ngen-mawida has woken up! I am happy.'));
  else if(S.flags.nag_lonko)ls.push(N('El monte grande queda al este, pasando los campos de los animales y el río. Cuídate del Witranalwe.','The great forest lies to the east, past the animal fields and the river. Beware of the Witranalwe.'));
  else ls.push(L('Chuchu','Lonko mew amunge.','Ve donde el lonko.','Go to the lonko.'));
  say(ls);
}
function nLonkoTalk(){
  if(S.flags.nag_lonko){
    const ls=[L('Lonko','Mari mari, '+nm()+'.','Hola, '+nm()+'.','Hello, '+nm()+'.')];
    if(S.flags.ngen2)ls.push(L('Lonko','Ngen-mawida nepey. Chaltu may!','Ngen-mawida despertó. ¡Gracias!','Ngen-mawida has woken up. Thank you!'),
      N('Ya llevas dos trokiñ del trariwe. Dicen que más allá de las montañas, en tierras pewenche, hay otro ngen dormido.','You now carry two trokiñ of the trariwe. They say that beyond the mountains, in Pewenche lands, another ngen is asleep.'));
    else ls.push(L('Lonko','Fütra mawida mew amunge.','Ve al monte grande.','Go to the great forest.'),N('Pasando los campos de los animales y el río está el monte. La guarida del Witranalwe está bajando por una escalera de piedra.','Past the animal fields and the river is the forest. The Witranalwe\'s lair is down a stone stairway.'));
    return say(ls);
  }
  const steps=[
    {q:L('Lonko','Mari mari, '+nm()+'. Chumleymi?','Hola, '+nm()+'. ¿Cómo estás?','Hello, '+nm()+'. How are you?'),
     o:[{m:'Kümelen. Eymi kay?',es:'Estoy bien. ¿Y tú?',en:'I am well. And you?',ok:1},{m:'Kümeleyngün.',es:'Ellos están bien.',en:'They are well.'},{m:'Amunge!',es:'¡Vete!',en:'Go away!'}]},
    {q:L('Lonko','Iñche ka kümelen. Chew tuwimi?','Yo también estoy bien. ¿De dónde eres?','I am well too. Where are you from?'),
     o:[{m:'Lafken mapu tuwün.',es:'Vengo de la tierra del mar.',en:'I come from the land of the sea.',ok:1},{m:'Chew tuwimi?',es:'¿De dónde eres tú?',en:'Where are you from?'},{m:'Lafken mapu tuwimi.',es:'Tú vienes de la tierra del mar.',en:'You come from the land of the sea.'}]}];
  say([N('El lonko nagche se levanta para saludarte. Recuerda el pentukuwün que ensayaste con tu kuku.','The Nagche lonko stands up to greet you. Remember the pentukuwün you practiced with your kuku.')],()=>step(0));
  function step(i){
    if(i>=steps.length)return done();
    const s=steps[i],en=S.gloss==='en';
    const opts=s.o.map((o,k)=>({m:o.m,g:S.hints?(en?o.en:o.es):'',v:k}));for(let a=opts.length-1;a>0;a--){const b=rnd(a+1);[opts[a],opts[b]]=[opts[b],opts[a]]}
    choose(s.q,opts,v=>{if(s.o[v].ok)say([praise()],()=>step(i+1));else{sfx('bad');say([N('El lonko espera, en silencio. Piensa en lo que te preguntó.','The lonko waits in silence. Think about what he asked you.')],()=>step(i))}},false,true);
  }
  function done(){
    S.flags.nag_lonko=1;learnRoot('llüka');S.items.kulon++;persist();sfx('lvl');
    say([L('Lonko','Kümey! Ngen-lafken nepey, pikeyngün.','¡Bien! Dicen que Ngen-lafken despertó.','Good! They say Ngen-lafken has woken up.'),
      L('Lonko','Welu Ngen-mawida umawtuy.','Pero Ngen-mawida está dormido.','But Ngen-mawida is asleep.'),
      N('Un Witranalwe, una figura altísima de luz fría que cuida los animales de un kalku, se adueñó del monte grande. Desde entonces los animales se pierden y los niños olvidan palabras.','A Witranalwe, a towering figure of cold light that guards a kalku\'s animals, has taken over the great forest. Since then the animals get lost and the children forget words.'),
      L('Lonko','Llüka- kimeltueyu.','Te enseño llüka- ("tener miedo").','I teach you llüka- ("be afraid").'),
      N('Con llükange, llükamu o llükamün asustas a los wekufü: por un rato golpean más débil. Recibiste llüka- y un külon.','With llükange, llükamu or llükamün you frighten the wekufü: for a while they hit weaker. You received llüka- and a külon.'),
      L('Lonko','Fütra mawida mew amunge, '+nm()+'.','Ve al monte grande, '+nm()+'.','Go to the great forest, '+nm()+'.'),
      N('El camino sigue al este: los campos de los animales, el río y el monte.','The road goes on to the east: the animal fields, the river and the forest.')]);
  }
}
function nutramTalk(){
  say([L('Nütramkafe','Mari mari, '+addr(false)+'. Nütramkayaiñ?','Hola. ¿Conversamos?','Hello. Shall we talk?'),
    N('Nütramkan es conversar y contar lo que pasó. El nütramkafe es quien cuenta.','Nütramkan means to converse and tell what happened. The nütramkafe is the one who tells.'),
    L('Nütramkafe','Kuyfi, mawida mew mülefuy kiñe Witranalwe.','Hace mucho tiempo, en el monte había un Witranalwe.','Long ago, in the forest, there was a Witranalwe.'),
    L('Nütramkafe','Pun mew kintukefuy kulliñ.','De noche andaba buscando animales.','At night it went around looking for animals.'),
    N('Dicen que es alto y delgado, que brilla como la luna, y que quien lo ve se queda tieso de miedo.','They say it is tall and thin, it glows like the moon, and whoever sees it freezes with fear.'),
    N('Pero los antiguos decían: cuando se alza muy alto, nada lo alcanza. Hay que decirle que vuelva atrás.','But the old ones said: when it rises up very tall, nothing reaches it. You have to tell it to go back.'),
    N('Fíjate en mülefuy y kintukefuy: ese -fu- aparece mucho al contar lo que pasaba antes. Tu chillka lo tiene en «Kuyfi».','Notice mülefuy and kintukefuy: that -fu- shows up a lot when telling what used to happen. Your chillka has it under «Kuyfi».')]);
}
function smithTalk(){
  say([L('Rütrafe','Mari mari, '+addr(false)+'. Rütrafe ngen.','Hola. Soy platero.','Hello. I am a silversmith.'),
    L('Rütrafe','Tüfa ta trapelakucha.','Esta es una trapelakucha.','This is a trapelakucha.'),
    N('Te muestra un adorno de plata para el pecho, con cadenas y figuras. El metal suena como lluvia fina.','He shows you a silver chest ornament with chains and figures. The metal rings like fine rain.'),
    N('Dicen que en el río hay una piedra que habla y pregunta por tañi, tami y ñi. Si no te acuerdas, mira tu chillka.','They say there is a talking stone by the river that asks about tañi, tami and ñi. If you do not remember, check your chillka.')]);
}
const AWN=['kiñe','epu','küla','meli','kechu','kayu'];
function awarTalk(){
  const en=S.gloss==='en';
  say([L('Pichiche','Awarkuden! Awarkudeaiñ?','¡Awarkuden! ¿Jugamos?','Awarkuden! Shall we play?'),
    N('El awarkuden se juega con seis habas pintadas de negro por un lado. Se lanzan y se cuentan las que caen negras.','Awarkuden is played with six beans painted black on one side. You throw them and count how many land black.')],()=>
    choose({es:'¿Juegas?',en:'Play?'},[{m:'May',g:en?'Yes':'Sí',v:1},{m:'Mülekan faw',g:en?'Not now (stay here)':'Ahora no',v:0}],v=>{if(v)round()},true,true));
  function round(){
    const n=1+rnd(6),beans=[];for(let i=0;i<6;i++)beans.push(i<n?'●':'○');for(let a=5;a>0;a--){const b=rnd(a+1);[beans[a],beans[b]]=[beans[b],beans[a]]}
    const pool=[n-1];while(pool.length<4){const k=rnd(6);if(!pool.includes(k))pool.push(k)}
    const opts=pool.map(k=>({m:AWN[k],v:k}));for(let a=3;a>0;a--){const b=rnd(a+1);[opts[a],opts[b]]=[opts[b],opts[a]]}
    sfx('ok');choose(L('Pichiche',beans.join(' ')+'   Chumten kurü?','Lanzas las habas. ¿Cuántas cayeron negras? (kurü = negro)','You throw the beans. How many landed black? (kurü = black)'),opts,v=>{
      if(v===n-1){const ls=[praise(),L('Pichiche',AWN[n-1]+'! Kümey!','¡'+AWN[n-1]+'! ¡Bien!','¡'+AWN[n-1]+'! Good!')];
        if(!S.flags.awar){S.flags.awar=1;S.gold+=10;persist();sfx('pick');ls.push(L('','Mari ngülliw!','Los niños te regalan mari (10) ngülliw por jugar.','The children give you mari (10) ngülliw for playing.'))}
        say(ls,again)}
      else{sfx('bad');say([L('Pichiche','Fey no!','¡Eso no!','Not that!'),N('Cuenta otra vez las habas negras (●).','Count the black beans (●) again.')],again)}},false,true);
  }
  function again(){choose({es:'¿Otra vez?',en:'Again?'},[{m:'Ka kiñe rupa',g:en?'Once more':'Otra vez',v:1},{m:'Pewkayal',g:en?'See you later':'Hasta luego',v:0}],v=>{if(v)round()},true,true)}
}
const herdN=t=>Object.keys(S.flags).filter(k=>k.startsWith('hd_')&&(MAPS.n_kullin.ents.find(e=>e.flag===k)||{}).look===t).length;
function farmerTalk(){
  const k=herdN('kawellu'),w=herdN('waka');
  if(S.flags.herd)return say([L('Wentru','Kom tañi kulliñ müley. Chaltu may!','Están todos mis animales. ¡Gracias!','All my animals are here. Thank you!')]);
  if(!S.flags.herd_task){S.flags.herd_task=1;persist();
    return say([L('Wentru','Mari mari, '+addr(false)+'. Ngelay tañi kulliñ!','Hola. ¡No están mis animales!','Hello. My animals are gone!'),
      L('Wentru','Küla kawellu ka epu waka nien.','Tengo tres caballos y dos vacas.','I have three horses and two cows.'),
      N('Kulliñ son los animales. Kawellu es caballo, waka es vaca y ofisa es oveja.','Kulliñ are the animals. Kawellu is horse, waka is cow and ofisa is sheep.'),
      N('Desde que llegó el Witranalwe se escapan por todo el campo. Háblales en mapudungun: dile «küpange» («¡ven!») a cada animal mío y te seguirá hasta mi corral.','Since the Witranalwe came, they run off all over the field. Speak to them in Mapudungun: say «küpange» («come!») to each of my animals and it will follow you to my pen.'),
      L('Wentru','Ofisa nielan.','No tengo ofisa (ovejas). Esas no son mías.','I have no ofisa (sheep). Those are not mine.')]);}
  if(k>=3&&w>=2){S.flags.herd=1;S.gold+=30;persist();
    return say([L('Wentru','Chaltu may, '+addr(false)+'! Kom tañi kulliñ müley.','¡Gracias! Están todos mis animales.','Thank you! All my animals are here.'),
      L('','Küla mari ngülliw!','El wentru te da küla mari (30) ngülliw...','The man gives you küla mari (30) ngülliw...')],()=>gainPiwke([N('...y algo rojo que encontró en el pasto.','...and something red he found in the grass.')]));}
  say([L('Wentru',numW(k)+' kawellu, '+numW(w)+' waka.','Volvieron '+k+' caballos y '+w+' vacas. Faltan '+(3-k)+' caballos y '+(2-w)+' vacas.',k+' horses and '+w+' cows are back. '+(3-k)+' horses and '+(2-w)+' cows are still missing.')]);
}
const Ua=a=>a.u[0].toUpperCase()+a.u.slice(1);
const ANIM={kawellu:{es:'caballo',en:'horse',a:'el',u:'un'},waka:{es:'vaca',en:'cow',a:'la',u:'una'},ofisa:{es:'oveja',en:'sheep',a:'la',u:'una'}};
function animalTalk(e){
  const a=ANIM[e.look],en=S.gloss==='en';
  if(!e.herd||!S.flags.herd_task||S.flags.herd)return say([L('',e.look[0].toUpperCase()+e.look.slice(1),Ua(a)+' '+e.look+' ('+a.es+') te mira y sigue comiendo pasto.','A '+e.look+' ('+a.en+') looks at you and keeps grazing.')]);
  choose(L('',e.look,'¿Qué le dices '+(a.a==='el'?'al':'a la')+' '+e.look+'?','What do you say to the '+e.look+'?'),[{m:'Küpange!',g:S.hints?(en?'Come!':'¡Ven!'):'',v:'k'},{m:'Amutunge!',g:S.hints?(en?'Go away!':'¡Vete!'):'',v:'a'},{m:'Pewkayal',g:en?'(leave it)':'(dejarlo)',v:'x'}],v=>{
    if(v==='k'){
      if(e.look==='ofisa'){sfx('bad');return say([N('La ofisa te sigue un poco... pero el wentru dijo «Ofisa nielan»: no tiene ovejas. La dejas volver con su rebaño.','The sheep follows you a little... but the man said «Ofisa nielan»: he has no sheep. You let it go back to its flock.')])}
      S.flags[e.flag]=1;ents=ents.filter(x=>x!==e);persist();sfx('pick');
      return say([praise(),N(Ua({u:a.a})+' '+e.look+' te sigue hasta el corral del wentru. ('+herdN('kawellu')+'/3 kawellu · '+herdN('waka')+'/2 waka)','The '+e.look+' follows you to the man\'s pen. ('+herdN('kawellu')+'/3 kawellu · '+herdN('waka')+'/2 waka)')])}
    if(v==='a'){sfx('bad');for(let i=0;i<3;i++){const d=['up','down','left','right'][rnd(4)],[dx,dy]=DV[d];if(walk(e.x+dx,e.y+dy)&&!entAt(e.x+dx,e.y+dy,e)&&!(e.x+dx===P.x&&e.y+dy===P.y)){e.x+=dx;e.y+=dy}}
      return say([N(Ua({u:a.a})+' '+e.look+' se asusta y se aleja corriendo. Así no vendrá.','The '+e.look+' gets scared and runs off. It will not come that way.')])}
  },true,true);
}
function animalStep(e){
  if(e.wait>0){e.wait--;e.mv=false;return}
  if(--e.cd>0)return;e.cd=40+rnd(80);if(Math.random()<.45){e.mv=false;return}
  const d=['up','down','left','right'][rnd(4)],[dx,dy]=DV[d],nx=e.x+dx,ny=e.y+dy;e.dir=dx<0?'left':dx>0?'right':e.dir;
  if(e.pen){const [x0,y0,x1,y1]=e.pen;if(nx<x0||nx>x1||ny<y0||ny>y1)return}
  else if(Math.abs(nx-e.ox)>3||Math.abs(ny-e.oy)>3)return;
  if(!walk(nx,ny)||entAt(nx,ny,e)||(nx===P.x&&ny===P.y)||grid[ny][nx]==='S')return;
  e.x=nx;e.y=ny;e.mv=true;
}
function kona2Talk(){
  if(S.flags.ngen2)return say([L('Kona','Witranalwe ngelay! Ayüwün!','¡Ya no está el Witranalwe! ¡Qué feliz estoy!','The Witranalwe is gone! I am so happy!')]);
  say([L('Kona','Witranalwe müley mawida mew. Llükan!','El Witranalwe está en el monte. ¡Tengo miedo!','The Witranalwe is in the forest. I am afraid!'),
    N('Su guarida está bajando por la escalera de piedra, aquí al lado. Dicen que adentro hay piedras con números grandes y otra piedra que habla de muchas personas.','Its lair is down the stone stairway, right here. They say inside there are stones with big numbers and another stone that talks about many people.'),
    L('Kona','Iñche wiñotuan lof mew.','Yo voy a volver al lof.','I am going back to the lof.')]);
}
