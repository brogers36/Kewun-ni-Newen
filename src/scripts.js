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
    L('Ngürekafe','Kiñe makuñ ngürekalen.','Estoy tejiendo un makuñ (poncho).','I am weaving a makuñ (poncho).'),
    N('Cada figura del tejido se aprende mirando a las abuelas. Las manos también recuerdan.','Every figure in the weaving is learned by watching the grandmothers. Hands remember too.'),
    N('(Aprendiste: ngürekan = tejer, witral = telar, makuñ = poncho.)','(You learned: ngürekan = to weave, witral = loom, makuñ = poncho.)')]);
}
function cookTalk(){
  const lines=[L('Papay','Mari mari, '+addr(true)+'!','¡Hola, '+addr(true)+'!','Hello, '+addr(true)+'!'),
    L('Papay','Iyael dewmalen.','Estoy haciendo comida.','I am making food.')];
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
function walkerTalk(){say([L('Wentru','Mari mari, '+addr(false)+'.','Hola, '+addr(false)+'.','Hello, '+addr(false)+'.'),L('Wentru','Mamüll yelen ruka mew.','Llevo leña a la casa.','I am carrying firewood home.'),L('Wentru','Mawünay.','Va a llover.','It is going to rain.')])}
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
  const ls=[L('Domo','Mari mari, '+addr(true)+'!','¡Hola, '+addr(true)+'!','Hello, '+addr(true)+'!'),L('Domo','Külon kintulen.','Ando buscando maqui.','I am looking for maqui.')];
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
    for(const k in GEAR){if(GEAR[k].hide)continue;opts.push({m:GEAR[k].m+'  ·  '+GEAR[k].p,g:S.gear[k]?(S.gloss==='en'?'(already yours)':'(ya lo tienes)'):numW(GEAR[k].p)+' ngülliw · '+G(GEAR[k]),v:'g:'+k,dis:!!S.gear[k]})}
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
function ngenTalk(){const ls=[L('Ngen-lafken','Mapudungukeaiñ!','¡Hablemos mapudungun!',"Let's speak Mapudungun!")];
  if(!S.flags.sb1)ls.push(N('«Una cosa más... En los pantanos del sur de las dunas duerme una fütra filu (una culebra gigante) peluda, con crin de kawellu (caballo). Camina por donde el barro burbujea, junto al agua del este. Pero ve preparado: solo las palabras justas rompen sus sellos.»','"One more thing... In the marshes south of the dunes sleeps a hairy futra filu (a giant snake) with a kawellu (horse) mane. Walk where the mud bubbles, by the eastern water. But go prepared: only the right words break its seals."'));
  say(ls)}
function fireSave(){
  S.hp=maxHP();S.sp=SPMAX;S.save={map:CUR,x:P.x,y:P.y};persist();sfx('heal');
  say([L('','Kütral mew ürkütun.','Descansas junto al kütral. Tus piwke y tu newen especial se recuperan por completo, y tu camino queda guardado.','You rest by the fire. Your hearts and your special newen are fully restored, and your journey is saved.')]);
}
function openChest(x,y,what){
  if(what==='locked'&&S.flags.wind){setTileFlag(x,y);S.gold+=100;persist();return gainPiwke([N('El viento te deja pasar. Dentro del cofre hay pataka (100) ngülliw y algo rojo...','The wind lets you through. Inside the chest are pataka (100) ngülliw and something red...')])}
  if(what==='locked')return say([N('Un cofre detrás del viento. Tendrás que volver con el newen de Ngen-kürüf.','A chest behind the wind. You will have to come back with the newen of Ngen-kürüf.')]);
  setTileFlag(x,y);sfx('pick');
  if(what==='numgift'){S.gold+=30;S.items.kofke++;persist();return say([L('','Küla mari ngülliw!','Dentro hay küla mari (30) ngülliw y un kofke.','Inside are küla mari (30) ngülliw and a kofke.')])}
  if(what==='mawgift'){S.gold+=40;S.items.lawen++;persist();return say([L('','Meli mari ngülliw!','Dentro hay meli mari (40) ngülliw y un lawen.','Inside are meli mari (40) ngülliw and a lawen.')])}
  if(what==='winotu'){learnRoot('wiñotu');S.flags.root_winotu=1;persist();sfx('lvl');return say([
    L('','wiñotu-','Encontraste una raíz nueva: wiñotu-, «volver, regresar».','You found a new root: wiñotu-, «go back, return».'),
    L('','wiñotunge · wiñotumu · wiñotumün','¡Vuelve atrás! (a uno) · (a dos) · (a tres o más)','Go back! (to one) · (to two) · (to three or more)'),
    N('Un wekufü al que le dices que vuelva atrás retrocede y pierde su turno. Y dicen que hasta el Witranalwe se encoge cuando lo obligan a retroceder.','A wekufü you tell to go back steps away and loses its turn. And they say even the Witranalwe shrinks when it is forced back.')])}
  if(what==='tripa'){learnRoot('tripa');S.flags.root_tripa=1;persist();sfx('lvl');return say([
    L('','tripa-','Encontraste una raíz nueva: tripa-, «salir».','You found a new root: tripa-, «come out».'),
    L('','tripange · tripamu · tripamün','¡Sal! (a uno) · (a dos) · (a tres o más)','Come out! (to one) · (to two) · (to three or more)'),
    N('Lo que se esconde, sale cuando se le dice. Dicen que el Kaleuche se esconde en la niebla...','What hides comes out when it is told to. They say the Kaleuche hides in the fog...')])}
  if(what==='puelgift'){S.gold+=50;S.items.lawen++;persist();return say([L('','Kechu mari ngülliw!','Dentro hay kechu mari (50) ngülliw y un lawen.','Inside are kechu mari (50) ngülliw and a lawen.')])}
  if(what==='nepe'){learnRoot('nepe');S.flags.root_nepe=1;persist();sfx('lvl');return say([
    L('','nepe-','Encontraste una raíz nueva: nepe-, «despertar».','You found a new root: nepe-, «wake up».'),
    L('','nepenge · nepemu · nepemün','¡Despierta! (a uno) · (a dos) · (a tres o más)','Wake up! (to one) · (to two) · (to three or more)'),
    N('Lo que duerme, despierta de golpe cuando se le grita: el susto lo sacude. Y dicen que el Walichu pelea dormido, envuelto en un sueño gris que los golpes no atraviesan...','What sleeps wakes with a start when you shout at it: the shock rattles it. And they say the Walichu fights in its sleep, wrapped in a grey dream that blows cannot pass through...')])}
  if(what==='wutre'){learnRoot('wütre');S.flags.root_wutre=1;persist();sfx('lvl');return say([
    L('','wütre-','Encontraste una raíz nueva: wütre-, «tener frío».','You found a new root: wütre-, «be cold».'),
    L('','wütrenge · wütremu · wütremün','¡Ten frío! (a uno) · (a dos) · (a tres o más)','Be cold! (to one) · (to two) · (to three or more)'),
    N('El frío apaga el fuego de los wekufü de fuego, y hace tiritar a los demás. Pero a los wekufü de nieve... les encanta.','The cold puts out the fire of fire wekufü, and makes the others shiver. But snow wekufü... love it.')])}
  if(what==='pewgift'){S.gold+=60;S.items.lawen++;persist();return say([L('','Kayu mari ngülliw!','Dentro hay kayu mari (60) ngülliw y un lawen.','Inside are kayu mari (60) ngülliw and a lawen.')])}
  if(what==='lawen1'){S.items.lawen++;persist();return say([L('','Lawen!','Encontraste un lawen (remedio).','You found a lawen (medicine).')])}
  if(what==='nam'){learnRoot('ñam');S.flags.root_nam=1;persist();sfx('lvl');return say([
    L('','ñam-','Encontraste una raíz nueva: ñam-, «perderse, desaparecer».','You found a new root: ñam-, «get lost, vanish».'),
    L('','ñamnge · ñammu · ñammün','¡Piérdete! (a uno) · (a dos) · (a tres o más)','Get lost! (to one) · (to two) · (to three or more)'),
    N('Un wekufü muy herido (con un tercio de su fuerza o menos) que oye esta orden se desvanece para siempre... y hasta los wekufü grandes obedecen.','A badly hurt wekufü (a third of its strength or less) that hears this command fades away for good... and even the big wekufü obey.')])}
  if(what==='rukagift'){S.gold+=30;persist();return say([L('','Küla mari ngülliw!','Un saquito de ngülliw tostados: küla mari (30).','A little bag of toasted pewen nuts: küla mari (30).')])}
  if(what==='kulongift'){S.items.kulon+=2;persist();return say([L('','Epu külon!','Dentro hay dos külon (maqui).','Inside are two külon (maqui berries).')])}
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
    for(let a=opts.length-1;a>0;a--){const b=rnd(a+1);[opts[a],opts[b]]=[opts[b],opts[a]]}
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
  kin:{intro:[L('Kura','Mari mari! Kimimi tami pu che?','¡Hola! ¿Conoces a tu familia?','Hello! Do you know your family?'),N('Di quién es cada uno y te abro el paso.','Say who each one is and I will open the way.')],
    qs:[{q:L('Kura','Tañi chaw ñi ñuke: ___','La mamá de mi papá.','My father\'s mother.'),o:['chuchu','kuku','laku'],a:'kuku'},
        {q:L('Kura','Tañi ñuke ñi ñuke: ___','La mamá de mi mamá.','My mother\'s mother.'),o:['kuku','cheche','chuchu'],a:'chuchu'},
        {q:L('Kura','Tañi chaw ñi chaw: ___','El papá de mi papá.','My father\'s father.'),o:['laku','cheche','kuku'],a:'laku'},
        {q:L('Kura','Tañi ñuke ñi chaw: ___','El papá de mi mamá.','My mother\'s father.'),o:['laku','chuchu','cheche'],a:'cheche'}]},
  negfut:{intro:[L('Kura','Mari mari! Kimimi -la- ka -a-?','¡Hola! ¿Conoces -la- y -a-?','Hello! Do you know -la- and -a-?'),N('Junta lo que no pasa con lo que todavía no pasa. Responde bien y te abro el paso.','Put together what does not happen with what has not happened yet. Answer well and I will open the way.')],
    qs:[{q:N('¿Cómo se dice "no iré"?','How do you say "I will not go"?'),o:['amulan','amuan','amulayan'],a:'amulayan'},
        {q:N('¿Cómo se dice "ella no vendrá"?','How do you say "she will not come"?'),o:['küpalayay','küpalay','küpayay'],a:'küpalayay'},
        {q:N('¿Cómo se dice "no sabré"?','How do you say "I will not know"?'),o:['kiman','kimlayan','kimlan'],a:'kimlayan'}]},
  dirmo:{intro:[L('Kura','Mari mari! Kimimi -me- ka -pa-?','¡Hola! ¿Conoces -me- y -pa-?','Hello! Do you know -me- and -pa-?'),
    N('-me- es ir a hacer algo allá (y volver): challwatun "pesqué" → challwatumen "fui a pescar allá". -pa- es hacia acá: küpan "vine" ya lo lleva adentro; umawtupay "vino a dormir acá". Responde bien y te abro el paso.','-me- is going to do something over there (and coming back): challwatun "I fished" → challwatumen "I went fishing there". -pa- is toward here: umawtupay "he came here to sleep". Answer well and I will open the way.')],
    qs:[{q:N('¿Cómo se dice "fui a pescar (allá)"?','How do you say "I went fishing (over there)"?'),o:['challwatun','challwatumen','challwatupan'],a:'challwatumen'},
        {q:N('¿Cómo se dice "vino a dormir (acá)"?','How do you say "he came here to sleep"?'),o:['umawtumey','umawtupay','umawtuy'],a:'umawtupay'},
        {q:N('¿Cómo se dice "iré a buscar (allá)"?','How do you say "I will go and look for it (over there)"?'),o:['kintuan','kintumean','kintupayan'],a:'kintumean'}]},
  rke:{intro:[L('Kura','Mari mari! Kimimi -rke-?','¡Hola! ¿Conoces -rke-?','Hello! Do you know -rke-?'),
    N('-rke- marca lo que uno supo por otros, o lo que lo sorprende: amuy "fue" → amurkey "dicen que fue / ¡resulta que fue!". Responde bien y te abro el paso.','-rke- marks what you learned from others, or what surprises you: amuy "he went" → amurkey "they say he went / it turns out he went!". Answer well and I will open the way.')],
    qs:[{q:N('¿Cómo se dice "dicen que él fue"?','How do you say "they say he went"?'),o:['amuy','amurkey','amuan'],a:'amurkey'},
        {q:N('¿Cómo se dice "dicen que aquí había un walichu"?','How do you say "they say there was a walichu here"?'),o:['müley','mülerkey','mülelay'],a:'mülerkey'},
        {q:N('¿Cómo se dice "¡resulta que tú sabías!"?','How do you say "it turns out you knew!"?'),o:['kimürkeymi','kimimi','kimaymi'],a:'kimürkeymi'}]},
  quest:{intro:[L('Kura','Mari mari! Kimimi chem, iney, chew?','¡Hola! ¿Conoces chem, iney, chew?','Hello! Do you know chem, iney, chew?'),N('Completa mis preguntas con la palabra que pregunta y te abro el paso.','Complete my questions with the question word and I will open the way.')],
    qs:[{q:L('Kura','___ pingeymi?','¿Cómo te llamas?','What is your name?'),o:['Chew','Iney','Chem'],a:'Iney'},
        {q:L('Kura','___ tuwimi?','¿De dónde eres?','Where are you from?'),o:['Chew','Chumül','Iney'],a:'Chew'},
        {q:L('Kura','___ nieymi?','¿Qué tienes?','What do you have?'),o:['Chumten','Chem','Chew'],a:'Chem'},
        {q:L('Kura','___ ngülliw nieymi?','¿Cuántos piñones tienes?','How many pewen nuts do you have?'),o:['Chumten','Chumül','Iney'],a:'Chumten'}]},
  du:{intro:[L('Kura','Mari mari! Kimimi iñchiw, eymu, fey engu?','¡Hola! ¿Conoces iñchiw, eymu, fey engu?','Hello! Do you know iñchiw, eymu, fey engu?'),
    N('El mapudungun tiene formas especiales para DOS personas: iñchiw (nosotros dos), eymu (ustedes dos), fey engu (ellos dos). Tu chillka las muestra en «Iñche, eymi, fey...».','Mapudungun has special forms for TWO people: iñchiw (we two), eymu (you two), fey engu (they two). Your chillka shows them under «Iñche, eymi, fey...».')],
    qs:[{q:L('Kura','Iñchiw amu___','Nosotros dos vamos.','We two go.'),o:['amuyu','amuiñ','amuymu'],a:'amuyu'},
        {q:L('Kura','Eymu küpa___','Ustedes dos vienen.','You two come.'),o:['küpaymün','küpaymu','küpayu'],a:'küpaymu'},
        {q:L('Kura','Fey engu kim___','Ellos dos saben.','They two know.'),o:['kimingün','kimi','kimingu'],a:'kimingu'}]},
  fe:{intro:[L('Kura','Mari mari! Kimimi -fe?','¡Hola! ¿Conoces -fe?','Hello! Do you know -fe?'),
    N('-fe hace nombres de oficio: challwan «pescar» → challwafe «pescador». Responde bien y te abro el paso.','-fe makes names of trades: challwan «to fish» → challwafe «fisher». Answer well and I will open the way.')],
    qs:[{q:L('Kura','Challwa + -fe: ___','La persona que pesca.','The person who fishes.'),o:['challwawe','challwafe','challwan'],a:'challwafe'},
        {q:L('Kura','Ngillaka- («comprar y vender») + -fe: ___','La persona que vende.','The person who sells.'),o:['ngillakafe','ngillakan','ngillakawe'],a:'ngillakafe'},
        {q:L('Kura','Trutruka + -tu- + -fe: ___','La persona que toca la trutruka.','The person who plays the trutruka.'),o:['trutrukawe','trutrukan','trutrukatufe'],a:'trutrukatufe'}]},
  fu:{intro:[L('Kura','Mari mari! Kimimi -fu-?','¡Hola! ¿Conoces -fu-?','Hello! Do you know -fu-?'),
    N('-fu- habla de lo que era antes y ya no es: kümelen «estoy bien» → kümelefun «estaba bien». Tu chillka lo explica en «Kuyfi · -fu-».','-fu- talks about what used to be: kümelen «I am well» → kümelefun «I was well». Your chillka explains it under «Kuyfi · -fu-».')],
    qs:[{q:L('Kura','Kuyfi iñche pichiche nge___','Antes yo era niño.','Long ago I was a child.'),o:['ngen','ngefun','ngefuy'],a:'ngefun'},
        {q:L('Kura','Fey kim___','Ella sabía.','She used to know.'),o:['kimfuy','kimi','kimfun'],a:'kimfuy'},
        {q:L('Kura','Iñchiñ lof mew müle___','Nosotros vivíamos en el lof.','We used to live in the lof.'),o:['müleiñ','mülefuy','mülefuiñ'],a:'mülefuiñ'}]},
  kead:{intro:[L('Kura','Mari mari! Epu pichi ruka? Pichike ruka!','¡Hola! ¿Dos casas chicas? ¡Pichike ruka!','Hello! Two little houses? Pichike ruka!'),
    N('Cuando hay varios, el adjetivo lleva -ke: pichi ruka «casa chica» → pichike ruka «casas chicas».','When there are several, the adjective takes -ke: pichi ruka «small house» → pichike ruka «small houses».')],
    qs:[{q:L('Kura','Epu ___ trewa','Dos perros chicos.','Two small dogs.'),o:['pichike','pichi','pichiñma'],a:'pichike'},
        {q:L('Kura','Pu ___ pewen','Los pewenes grandes.','The big pewen trees.'),o:['fütra','fütrake','fütralen'],a:'fütrake'},
        {q:L('Kura','Küla ___ che','Tres buenas personas.','Three good people.'),o:['kümeke','küme','kümen'],a:'kümeke'}]},
  num2:{intro:[L('Kura','Mari mari! Fütake rakin kimimi?','¡Hola! ¿Conoces los números grandes?','Hello! Do you know the big numbers?'),
    N('pataka = cien; warangka = mil. Se combinan igual que los chicos: epu pataka = 200.','pataka = one hundred; warangka = one thousand. They combine like the small ones: epu pataka = 200.')],
    qs:[{q:N('¿Cómo se dice «cien»?','How do you say «one hundred»?'),o:['pataka','warangka','mari mari'],a:'pataka'},
        {q:N('¿Cómo se dice «mil»?','How do you say «one thousand»?'),o:['pataka mari','warangka','mari pataka'],a:'warangka'},
        {q:L('Kura','Epu pataka kechu mari = ?','¿Qué número es?','Which number is it?'),o:['250','205','2050'],a:'250'}]},
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
  nagche:[{m:'Fütra mawida',es:'Entrada de la guarida (monte)',en:'Lair entrance (forest)',to:['n_mawida',28,4]},{m:'Nagche lof',es:'El lof de los llanos',en:'The lowland lof',to:['n_lof',17,9]}],
  pewenche:[{m:'Pillañ inaltu',es:'Entrada de la morada (volcán)',en:'Lair entrance (volcano)',to:['p_pillan',28,4]},{m:'Pewenche lof',es:'El lof de los pewenes',en:'The pewen lof',to:['p_lof',17,9]}],
  williche:[{m:'Willi lafken inaltu',es:'Entrada de la cueva (acantilados)',en:'Cave entrance (cliffs)',to:['w_inaltu',24,6]},{m:'Williche lof',es:'El lof del lago',en:'The lake lof',to:['w_lof',17,9]}],
  puelmapu:[{m:'Wingkul lelfün',es:'Entrada del chenque (meseta)',en:'Chenque entrance (meseta)',to:['e_meseta',24,6]},{m:'Puelche lof',es:'El lof del este',en:'The eastern lof',to:['e_lof',17,9]}]};
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
    else ls.push(L('Lonko','Ngen-lafken umawtuley. Trelke-wekufü müley lafken mew.','Ngen-lafken está dormido. Trelke-wekufü está en la laguna.','Ngen-lafken is asleep. Trelke-wekufü is in the lagoon.'),
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
      L('Lonko','Ngen-lafken umawtuley. Trelke-wekufü müley lafken mew.','Ngen-lafken está dormido. Trelke-wekufü está en la laguna.','Ngen-lafken is asleep. Trelke-wekufü is in the lagoon.'),
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
      L('Chuchu','Na küme mi küpan!','¡Qué bien que viniste!','How good that you came!'),
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
      L('Lonko','Welu Ngen-mawida umawtuley.','Pero Ngen-mawida está dormido.','But Ngen-mawida is asleep.'),
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
const ANIM={kawellu:{es:'caballo',en:'horse',a:'el',u:'un'},waka:{es:'vaca',en:'cow',a:'la',u:'una'},ofisa:{es:'oveja',en:'sheep',a:'la',u:'una'},luan:{es:'guanaco',en:'guanaco',a:'el',u:'un'},choyke:{es:'ñandú',en:'rhea',a:'el',u:'un'}};
function animalTalk(e){
  const a=ANIM[e.look],en=S.gloss==='en';
  if(!e.herd||!S.flags.herd_task||S.flags.herd)return say([L('',e.look[0].toUpperCase()+e.look.slice(1),Ua(a)+' '+e.look+' ('+a.es+') te mira y sigue comiendo pasto.','A '+e.look+' ('+a.en+') looks at you and keeps grazing.')]);
  choose(L('',e.look,'¿Qué le dices '+(a.a==='el'?'al':'a la')+' '+e.look+'?','What do you say to the '+e.look+'?'),[{m:'Küpange!',g:S.hints?(en?'Come!':'¡Ven!'):'',v:'k'},{m:'Amutunge!',g:S.hints?(en?'Go away!':'¡Vete!'):'',v:'a'},{m:'Pewkayal',g:en?'(leave it)':'(dejarlo)',v:'x'}],v=>{
    if(v==='k'){
      if(e.look==='ofisa'){sfx('bad');return say([N('La ofisa te sigue un poco... pero el wentru dijo «Ofisa nielan»: no tiene ovejas. La dejas volver con su rebaño.','The sheep follows you a little... but the man said «Ofisa nielan»: he has no sheep. You let it go back to its flock.')])}
      S.flags[e.flag]=1;ents=ents.filter(x=>x!==e);persist();sfx('pick');
      {const n=herdN('kawellu')+herdN('waka'),sp=PENSPOT[n-1];ents.push({kind:'animal',look:e.look,x:sp[0],y:sp[1],fx:sp[0],fy:sp[1],ox:sp[0],oy:sp[1],pen:[10,2,15,3],cd:40,wait:0,dir:'right',home:1})}
      return say([praise(),N(Ua({u:a.a})+' '+e.look+' te sigue hasta el corral del wentru, al norte. ('+herdN('kawellu')+'/3 kawellu · '+herdN('waka')+'/2 waka)','The '+e.look+' follows you to the man\'s pen, to the north. ('+herdN('kawellu')+'/3 kawellu · '+herdN('waka')+'/2 waka)')])}
    if(v==='a'){sfx('bad');for(let i=0;i<3;i++){const d=['up','down','left','right'][rnd(4)],[dx,dy]=DV[d];if(walk(e.x+dx,e.y+dy)&&!entAt(e.x+dx,e.y+dy,e)&&!(e.x+dx===P.x&&e.y+dy===P.y)){e.x+=dx;e.y+=dy}}
      return say([N(Ua({u:a.a})+' '+e.look+' se asusta y se aleja corriendo. Así no vendrá.','The '+e.look+' gets scared and runs off. It will not come that way.')])}
  },true,true);
}
function animalStep(e){
  if(e.still)return;
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

/* ---------- lof mini-quests ---------- */
function paliTalk(){
  if(S.flags.laf_palid)return say([L('Pichi domo','Palin! Palin!','¡A jugar palin!','Palin time!')]);
  if(S.flags.laf_paliq)return say([L('Pichi domo','Ñami ñi pali!','¡Se me perdió la pali (la bola)!','My pali (the ball) is lost!'),
    N('«Se me fue botando hasta las dunas... quedó entre el pasto alto, al oeste, cerca del agua. Escarba ahí.»','"It went bouncing off to the dunes... it ended up in the tall grass, to the west, near the water. Dig around there."')]);
  S.flags.laf_paliq=1;persist();
  say([L('Pichi domo','Mari mari! Ñami ñi pali!','¡Hola! ¡Se me perdió la pali!','Hello! My pali is lost!'),
    N('La pali es la bola de madera del palin. «Se me fue botando hasta las dunas, al pasto alto del oeste. ¿Me la buscas?»','The pali is the wooden palin ball. "It went bouncing off to the dunes, into the tall grass in the west. Will you find it for me?"')]);
}
function nweavTalk(){
  const en=S.gloss==='en';
  if(S.flags.n_weavd)return say([L('Domo','Makuñ ngürekalen. Chaltu may!','Estoy tejiendo un makuñ. ¡Gracias por la ayuda!','I am weaving a makuñ. Thanks for the help!')]);
  const qs=[{q:L('Domo','Chem antü tüfa? Kelü kal.','Lana de color rojo.','Wool of the red color.'),o:['kelü','kallfü','lig'],a:'kelü'},
    {q:L('Domo','Tüfa kay? Kallfü kal.','Y esta: lana azul.','And this: blue wool.'),o:['kurü','kallfü','chod'],a:'kallfü'},
    {q:L('Domo','Ka tüfa? Lig kal.','Y esta: lana blanca.','And this one: white wool.'),o:['lig','karü','kelü'],a:'lig'}];
  say([L('Domo','Mari mari! Makuñ ngürekalen, welu ngillañmakelen kal.','¡Hola! Estoy tejiendo un makuñ, pero ayúdame a ordenar la lana.','Hello! I am weaving a makuñ, but help me sort the wool.'),
    N('Te muestra ovillos de colores. Dile el color de cada uno. Tu chillka tiene los colores.','She shows you balls of dyed wool. Name each color. Your chillka has the colors.')],()=>ask(0));
  function ask(i){
    if(i>=qs.length){S.flags.n_weavd=1;S.gold+=20;S.items.lawen++;S.xp+=3;persist();sfx('lvl');
      return say([praise(),L('Domo','Küme nge, chaltu may!','¡Qué buen ojo! ¡Gracias!','What a good eye! Thank you!'),
        N('Te da epu mari (20) ngülliw y un lawen. +3 kimün.','She gives you epu mari (20) ngülliw and a lawen. +3 kimün.')],()=>{if(S.xp>=xpNeed())levelUpCheck()})}
    const q=qs[i];choose(q.q,q.o.map(o=>({m:o,v:o})).concat([{m:'Chillka',g:en?'Check the book':'Consultar el libro',v:'_b'}]),v=>{
      if(v==='_b')return openBook(()=>ask(i));
      if(v===q.a){sfx('ok');ask(i+1)}else{sfx('bad');say([L('Domo','Fey no...','Eso no...','Not that one...')],()=>ask(0))}},false,false)}
}
function pewKidsTalk(){
  const en=S.gloss==='en';
  if(S.flags.pew_kidd)return say([L('Pichiche','Kümey kofke! Chaltu may!','¡Qué rico el pan! ¡Gracias!','The bread was so good! Thank you!')]);
  if(S.items.kofke>=2)return choose(L('Pichiche','Ngülliw kofke nieymi? Epu?','¿Tienes pan de piñón? ¿Dos? (para mi hermana y para mí)','Do you have pewen-nut bread? Two? (for my sister and me)'),
    [{m:'May, eluayu!',g:en?'Yes, I will give them to you':'Sí, te los doy',v:1},{m:'Petu no',g:en?'Not yet':'Todavía no',v:0}],v=>{
      if(!v)return;
      S.items.kofke-=2;S.flags.pew_kidd=1;persist();sfx('lvl');
      say([L('Pichiche','Chaltu may!','¡Gracias!','Thank you!'),
        N('Los dos niños comen felices. Después, en secreto: «Al lado de la ruka grande del este enterramos un tesoro. ¡Escarba ahí!»','The two children eat happily. Then, in a whisper: "Beside the big ruka in the east we buried a treasure. Dig there!"')])},true,true);
  say([L('Pichiche','Ngülliw ayüken! Kofke kay!','¡Me gustan los piñones! ¡Y el pan!','I love pewen nuts! And bread!'),
    L('Pichiche','Epu kofke nielmi, eluen!','Si tienes dos panes, ¡dame!','If you have two breads, give them to us!'),
    N('Los kofke se compran donde el ngillakafe, o te los regala quien hace pan.','Kofke can be bought from the trader, or given by whoever is baking.')]);
}
function mushayTalk(){
  const en=S.gloss==='en';
  if(S.flags.w_mushd)return say([L('Papay','Kümey mushay! Ka antü ka dewmayan.','¡Qué rico el mushay! Otro día haré más.','The mushay was so good! Another day I will make more.')]);
  if(S.items.kulon>=2)return choose(L('Papay','Epu külon nieymi! Dewmayan mushay. Eluen?','¡Tienes dos külon! Haré mushay. ¿Me los das?','You have two külon! I will make mushay. Will you give them to me?'),
    [{m:'May, eluayu!',g:en?'Yes, here you are':'Sí, aquí tiene',v:1},{m:'Petu no',g:en?'Not yet':'Todavía no',v:0}],v=>{
      if(!v)return;
      S.items.kulon-=2;S.flags.w_mushd=1;S.gold+=30;S.hp=maxHP();persist();sfx('lvl');
      say([N('La papay machaca los külon y prepara mushay, el jugo fermentado dulce del maqui.','The papay crushes the külon and makes mushay, the sweet fermented maqui drink.'),
        L('Papay','Pütunge! Kümey!','¡Toma! ¡Está rico!','Drink! It is good!'),
        N('Te recuperas por completo y te regala küla mari (30) ngülliw.','You fully recover and she gives you küla mari (30) ngülliw.')])},true,true);
  say([L('Papay','Mari mari, '+addr(true)+'. Mushay dewmayan, welu külon nielan.','Hola. Quiero hacer mushay, pero no tengo külon.','Hello. I want to make mushay, but I have no külon.'),
    N('El mushay se hace con külon (maqui). «Tráeme epu (2) külon y habrá mushay para las dos.» El ngillakafe los vende.','Mushay is made from külon (maqui). "Bring me epu (2) külon and there will be mushay for us both." The trader sells them.')]);
}

/* ---------- side quests: marsh, menoko, island, interiors ---------- */
const pickCount=m=>Object.keys(S.flags).filter(f=>f.indexOf('pick:'+m+':')===0).length;
function pickSpot(x,y){
  const st=M.pickStyle||'diwen',k='pick:'+CUR+':'+x+','+y;
  if(st==='diwen'){
    if(!S.flags.l_diwq)return say([L('','Diweñ','Un ñirre con diweñ: hongos redondos y anaranjados que crecen en sus ramas.','A ñirre tree with diweñ: round orange fungi growing on its branches.')]);
    setTileFlag(x,y);S.flags[k]=1;persist();sfx('pick');
    const n=pickCount('l_wapi');
    if(n>=3)return say([L('','Küla diweñ!','¡Juntaste los tres diweñ! Vuelve con la diweñfe.','You gathered all three diweñ! Go back to the diweñfe.')]);
    return say([L('',(n===1?'Kiñe':'Epu')+' diweñ!','Sacas diweñ de las ramas ('+n+'/3).','You pick diweñ from the branches ('+n+'/3).')]);
  }
  if(!S.flags.n_lawq)return say([L('','Lawen kachu','Hierbas de lawen crecen en el borde del agua. La lawentuchefe sabrá cuáles sirven.','Lawen herbs grow at the water\'s edge. The healer will know which ones are good.')]);
  setTileFlag(x,y);S.flags[k]=1;persist();sfx('pick');
  const n=pickCount('n_menoko');
  if(n>=3)return say([L('','Küla lawen!','¡Juntaste las tres hierbas! Vuelve con la lawentuchefe.','You gathered all three herbs! Go back to the healer.')]);
  say([L('',(n===1?'Kiñe':'Epu')+' lawen!','Cortas las hierbas con cuidado ('+n+'/3).','You carefully cut the herbs ('+n+'/3).')]);
}
function diwenfeTalk(){
  if(S.flags.l_diwd)return say([L('Diweñfe','Chaltu may, '+addr(true)+'! Kümey diweñ!','¡Gracias! ¡Qué ricos diweñes!','Thank you! What good diweñ!'),
    N('¿Ya hablaste con la piedra del este? Pregunta por los oficios en -fe: challwafe, diweñfe...','Have you talked with the stone to the east? It asks about the -fe trades: challwafe, diweñfe...')]);
  if(S.flags.l_diwq&&pickCount('l_wapi')>=3){S.flags.l_diwd=1;S.items.diwen+=2;S.gold+=30;persist();sfx('lvl');
    return say([L('Diweñfe','Küla diweñ! Chaltu may!','¡Tres diweñes! ¡Gracias!','Three diweñ! Thank you!'),
      N('Te regala dos diweñ para el camino y küla mari (30) ngülliw.','She gives you two diweñ for the road and küla mari (30) ngülliw.'),
      L('Diweñfe','Iñche diweñfe: diweñ kintuken. Eymi kay? Challwafe? Ngürekafe?','Yo soy diweñfe: busco digüeñes. ¿Y tú? ¿Pescador? ¿Tejedora?','I am a diweñfe: I gather diweñ. And you? A fisher? A weaver?'),
      N('-fe convierte un trabajo en la persona que lo hace. La piedra tallada del este pregunta justo por eso... y guarda algo rojo.','-fe turns a trade into the person who does it. The carved stone to the east asks exactly that... and it guards something red.')]);}
  if(S.flags.l_diwq)return say([L('Diweñfe','Küla diweñ kintulen!','¡Búscame tres diweñes!','Find me three diweñ!'),
    N('Crecen en los ñirres del pantano: bolitas anaranjadas en las ramas.','They grow on the marsh ñirre trees: little orange balls on the branches.')]);
  S.flags.l_diwq=1;persist();
  say([L('Diweñfe','Mari mari, '+addr(true)+'! Iñche diweñfe.','¡Hola! Yo soy recolectora de digüeñes.','Hello! I am a diweñ gatherer.'),
    N('El diweñ es un hongo redondo y dulce que crece en los ñirres. Se come crudo, en ensalada... ¡o en kurantu!','The diweñ is a round, sweet fungus that grows on ñirre trees. People eat it raw, in salads... or in kurantu!'),
    L('Diweñfe','Kintulen küla diweñ! Kushe iñche.','¡Búscame tres diweñes! Ya estoy vieja para trepar.','Find me three diweñ! I am too old to climb.'),
    N('Hay tres ñirres con diweñ en este pantano. Interactúa con ellos para sacarlos.','There are three ñirre trees with diweñ in this marsh. Interact with them to pick the fungi.')]);
}
function lawenfeTalk(){
  if(S.flags.n_lawd)return say([L('Lawentuchefe','Chaltu may! Kümelkaleaymi.','¡Gracias! Que estés bien.','Thank you! Be well.')]);
  if(S.flags.n_lawq&&pickCount('n_menoko')>=3){S.flags.n_lawd=1;S.items.lawen+=2;persist();sfx('lvl');
    return say([L('Lawentuchefe','Küme lawen! Chaltu may!','¡Buenas hierbas! ¡Gracias!','Good herbs! Thank you!'),
      N('Prepara dos lawen y te los regala.','She prepares two lawen and gives them to you.')],()=>gainPiwke([N('Y del fondo de su chaiwe saca algo rojo que encontró en el menoko...','And from the bottom of her basket she takes something red she found in the menoko...')]));}
  if(S.flags.n_lawq)return say([L('Lawentuchefe','Küla lawen kachu kintulen!','¡Búscame tres matas de lawen!','Find me three lawen plants!'),
    N('Crecen al borde de las aguas del menoko.','They grow at the edge of the menoko waters.')]);
  S.flags.n_lawq=1;persist();
  say([L('Lawentuchefe','Mari mari. Iñche lawentuchefe.','Hola. Yo sano con lawen (remedios de plantas).','Hello. I heal with lawen (plant remedies).'),
    N('El menoko es un humedal sagrado: aquí crecen los lawen más fuertes. Se entra con respeto y se saca solo lo necesario.','The menoko is a sacred wetland: the strongest healing plants grow here. One enters with respect and takes only what is needed.'),
    L('Lawentuchefe','Kintulen küla lawen kachu, chaltu may.','Búscame tres matas de lawen, por favor.','Find me three lawen plants, please.')]);
}
function trutfeTalk(){
  if(S.gear.trutruka)return say([L('Trutrukatufe','Pefimi ñi trutruka! Niekaymi: iñche ka kiñe nien.','¡La encontraste! Quédatela: yo tengo otra.','You found it! Keep it: I have another one.'),
    L('Trutrukatufe','Trutrukatufe ngeaymi!','¡Vas a ser trutruquero!','You are going to be a trutruka player!'),
    N('En las peleas, tócala: su sonido largo aturde a todos los wekufü una vez por pelea. Trutruka + -tu- + -fe = trutrukatufe, quien la toca.','In battle, blow it: its long blast stuns all the wekufü once per fight. Trutruka + -tu- + -fe = trutrukatufe, the one who plays it.')]);
  if(S.flags.n_trut_q)return say([L('Trutrukatufe','Ñami ñi trutruka kürüf mew!','¡El viento me botó la trutruka!','The wind knocked my trutruka away!'),
    N('«Cayó entre los juncos, al lado del agua del medio del menoko. Busca bien, pegado al agua.»','"It fell among the reeds, beside the pool in the middle of the menoko. Search carefully, right by the water."')]);
  S.flags.n_trut_q=1;persist();
  say([L('Trutrukatufe','Mari mari... Iñche trutrukatufe, welu...','Hola... Yo soy trutruquero, pero...','Hello... I am a trutruka player, but...'),
    L('Trutrukatufe','Ñami ñi trutruka!','¡Se me perdió la trutruka!','I lost my trutruka!'),
    N('La trutruka es una corneta larga de coligüe con un cuerno en la punta. «El viento la botó entre los juncos, al lado del agua del medio. ¿Me la buscas?»','The trutruka is a long colihue horn with a cow horn at the tip. "The wind knocked it into the reeds, beside the middle pool. Will you look for it?"')]);
}
function kurantuTalk(){
  const en=S.gloss==='en';
  if(S.flags.w_kur)return say([L('Kurantufe','Ka antü ka dewmayan kurantu. Küpatuaymi!','Otro día haré otro kurantu. ¡Vuelve!','Another day I will make another kurantu. Come back!')]);
  if(S.items.diwen>=2&&S.items.kofke>=1){
    return choose(L('Kurantufe','Epu diweñ ka kiñe kofke nieymi! Dewmayu kurantu?','¡Tienes dos diweñes y un kofke! ¿Hacemos el kurantu?','You have two diweñ and a kofke! Shall we make the kurantu?'),
      [{m:'May!',g:en?'Yes! (hand over the food)':'¡Sí! (entregar la comida)',v:1},{m:'Petu no',g:en?'Not yet':'Todavía no',v:0}],v=>{
        if(!v)return;
        S.items.diwen-=2;S.items.kofke-=1;S.flags.w_kur=1;S.gold+=40;S.hp=maxHP();S.sp=SPMAX;persist();sfx('lvl');
        say([N('Sobre piedras calientes, entre hojas de pangue, se cocinan mariscos, papas, kofke y tus diweñes: ¡kurantu!','Over hot stones, wrapped in pangue leaves, shellfish, potatoes, kofke and your diweñ steam away: kurantu!'),
          L('Kurantufe','Kümey kurantu! Inge, inge!','¡Qué rico kurantu! ¡Come, come!','What a good kurantu! Eat, eat!'),
          N('Comes hasta quedar satisfecho: tus piwke y tu newen se recuperan por completo. Te regala meli mari (40) ngülliw por la ayuda.','You eat until you are full: your hearts and newen fully recover. She gives you meli mari (40) ngülliw for the help.')],()=>gainPiwke([N('Y envuelto en un paño, algo rojo que encontró en la arena de la isla...','And wrapped in a cloth, something red she found in the island sand...')]));
      },true,true);
  }
  say([L('Kurantufe','Mari mari, '+addr(true)+'! Kurantu dewmayan, welu...','¡Hola! Voy a hacer un kurantu, pero...','Hello! I am going to make a kurantu, but...'),
    L('Kurantufe','Epu diweñ ka kiñe kofke duamnien.','Necesito dos diweñes y un kofke.','I need two diweñ and one kofke.'),
    N('El kurantu se cocina en un hoyo con piedras calientes. Los diweñes crecen en los ñirres del norte (y a veces los venden los ngillakafe). Vuelve con ellos y habrá fiesta.','Kurantu is cooked in a pit over hot stones. Diweñ grow on ñirre trees up north (and traders sometimes sell them). Come back with everything and there will be a feast.')]);
}
function kallfurayTalk(){
  const first=!S.flags.l_kall;S.flags.l_kall=1;if(first)persist();
  say([L('Papay Kallfüray','Mari mari, '+addr(true)+'! Konpange.','¡Hola! Pasa.','Hello! Come in.'),
    L('Papay Kallfüray','Ngürekafe iñche: witral mew ngüreken.','Soy tejedora: tejo en el witral.','I am a weaver: I weave on the witral.'),
    N('Teje fajas y makuñ con figuras escalonadas. Ngüren «tejer» + -ke- + -fe = ngürekafe, la que teje.','She weaves sashes and ponchos with stepped patterns. Ngüren «to weave» + -ke- + -fe = ngürekafe, the one who weaves.'),
    N('«Cuando era niña, mi hermano enterró algo rojo en las dunas: donde el pasto crece entre la arena, cerca de la entrada del oeste. Nunca lo fue a buscar.»','"When I was a girl, my brother buried something red in the dunes: where the grass grows out of the sand, near the western entrance. He never went back for it."')]);
}
function sayenTalk(){
  if(S.flags.n_sayen)return say([L('Ñaña Sayen','Mültrün dewmaken. Inge!','Estoy haciendo mültrün (catutos). ¡Come!','I am making mültrün. Eat!'),
    N('«¿Ya escarbaste en los campos de los animales? Justo al medio del pasto, lejos de los corrales, los niños esconden cántaros.»','"Did you dig in the animal fields yet? Right in the middle of the grass, away from the pens, the children hide little jars."')]);
  S.flags.n_sayen=1;S.items.kofke+=2;persist();sfx('pick');
  say([L('Ñaña Sayen','Mari mari, '+addr(true)+'! Konpange, inge!','¡Hola! ¡Pasa, come!','Hello! Come in, eat!'),
    N('Está moliendo trigo cocido para hacer mültrün, los catutos alargados. Te regala dos kofke calientes.','She is grinding boiled wheat to make mültrün. She gives you two warm kofke.'),
    N('«Y un secreto: en los campos de los animales, justo al medio del pasto, los niños esconden cántaros con sorpresas. Lleva algo para escarbar.»','"And a secret: in the animal fields, right in the middle of the grass, the children hide jars with surprises. Bring something to dig with."')]);
}
function kintulTalk(){
  say([L('Chachay Kintul','Mari mari. Challwafe iñche, kuyfi mew.','Hola. Fui pescador, hace tiempo.','Hello. I was a fisher, long ago.'),
    N('«He visto al Kaleuche dos veces, con mis propios ojos: un barco con música y luces, navegando bajo el agua.»','"I have seen the Kaleuche twice, with my own eyes: a ship with music and lights, sailing under the water."'),
    N('«En la costa del sur enterré mi vieja caja de anzuelos, al bajar a la playa, en medio de la arena. Si la encuentras, es tuya. Y en la isla del lago, dicen que la kurantufe paga bien la ayuda.»','"On the southern coast I buried my old hook box, down on the beach, in the middle of the sand. If you find it, it is yours. And on the island in the lake, they say the kurantufe pays well for help."')]);
}

/* ---------- Pewenche rukas ---------- */
function rayenTalk(){
  if(!S.flags.pew_ngu1){S.flags.pew_ngu1=1;S.gold+=10;persist();sfx('pick');
    return say([L('Papay Rayen','Mari mari, '+addr(true)+'! Konpange, konpange!','¡Hola! ¡Pasa, pasa!','Hello! Come in, come in!'),
      L('Papay Rayen','Kütral mew ngülliw kotüken.','Estoy tostando ngülliw (piñones) al fuego.','I am toasting ngülliw (pewen nuts) on the fire.'),
      N('El ngülliw es la semilla del pewen: comida, harina y hasta moneda en estas tierras. Te convida un puñado tostado: mari (10) ngülliw.','The ngülliw is the seed of the pewen tree: food, flour, even money in these lands. She treats you to a toasted handful: mari (10) ngülliw.'),
      L('Papay Rayen','Yenge tüfachi ngülliw arriero mew. Rüpü mew müley.','Lleva estos piñones al arriero. Está en el camino, con sus caballos.','Take these pewen nuts to the muleteer. He is on the road, with his horses.'),
      N('Fíjate en yenge: ye- es «llevar» y -nge la orden: «¡lleva!».','Notice yenge: ye- is «carry» and -nge the command: «carry!».')]);}
  if(!S.flags.pew_ngu2)return say([L('Papay Rayen','Arriero mew amunge! Rüpü mew müley.','¡Ve donde el arriero! Está en el camino.','Go to the muleteer! He is on the road.')]);
  say([L('Papay Rayen','Chaltu may, '+addr(true)+'!','¡Gracias!','Thank you!'),
    L('Papay Rayen','Ürkütunge kütral mew.','Descansa junto al fuego.','Rest by the fire.')]);
}
function nawelTalk(){
  if(S.flags.pew_llawe)return say([L('Chachay Nawel','Fewla kümelkalen. Chaltu may!','Ahora estoy mejor. ¡Gracias!','I am better now. Thank you!'),
    L('Chachay Nawel','Pillañ mew amunge, '+addr(false)+'.','Ve al volcán.','Go to the volcano.')]);
  if(S.flags.pew_basket){S.flags.pew_llawe=1;S.items.kulon+=2;persist();sfx('lvl');
    return say([N('Le entregas el chaiwe lleno de külon.','You hand him the chaiwe full of maqui berries.'),
      L('Chachay Nawel','Chaltu may! Külon lawen ngey.','¡Gracias! El maqui es remedio.','Thank you! Maqui is medicine.'),
      N('Prepara un remedio oscuro y se lo toma. Poco a poco deja de toser. Te regala dos külon.','He brews a dark remedy and drinks it. Little by little the cough fades. He gives you two külon.'),
      L('Chachay Nawel','Allkütunge. Kuyfi, pillañ rüpü mew amukefuiñ.','Escucha. Antiguamente íbamos por el paso del pillañ.','Listen. Long ago we used to travel the volcano pass.'),
      N('Te entrega una vieja llave de piedra: la llawe del paso. «La puerta de hielo, en los campos de nieve, se abre con esto.»','He hands you an old stone key: the llawe of the pass. "The ice door, in the snowfields, opens with this."'),
      L('','Llawe!','¡Conseguiste la llawe del paso del pillañ!','You got the llawe of the volcano pass!')]);}
  if(S.flags.pew_chaiwe)return say([L('Chachay Nawel','Kof kof... Ñami ñi chaiwe mawida mew.','Cof cof... Mi canasto se perdió en el bosque.','Cough cough... My basket got lost in the forest.'),
    N('«Al sur del camino del bosque hay un rincón escondido lleno de külon. Ahí quedó.»','"South of the forest road there is a hidden corner full of maqui. It was left there."')]);
  S.flags.pew_chaiwe=1;persist();
  say([L('Chachay Nawel','Mari mari... kof kof! Chafolen.','Hola... ¡cof cof! Estoy con tos.','Hello... cough, cough! I have a cough.'),
    N('El chachay Nawel es el hombre más viejo del lof. Se mejora con un remedio de külon (maqui), pero...','Chachay Nawel is the oldest man in the lof. A maqui remedy would help him, but...'),
    L('Chachay Nawel','Ñami ñi chaiwe! Fentren külon niefuy.','¡Se me perdió el chaiwe (canasto)! Tenía mucho maqui.','My chaiwe (basket) got lost! It had a lot of maqui.'),
    N('«Lo dejé en el bosque de pewenes, en un rincón escondido al sur del camino, donde crecen los külon. Mis piernas ya no me llevan hasta allá... ¿me lo buscas?»','"I left it in the pewen forest, in a hidden corner south of the road, where the maqui bushes grow. My legs will not carry me there any more... will you look for it?"')]);
}
function kulonBush(x,y){
  const found=S.flags.pew_basket;
  if(S.flags.pew_chaiwe&&!found&&x+','+y==='28,14'){S.flags.pew_basket=1;persist();sfx('lvl');
    return say([N('Entre las ramas del külon hay un chaiwe viejo, lleno de frutitos morados.','Among the maqui branches there is an old chaiwe, full of little purple berries.'),
      L('','Chaiwe!','¡Encontraste el chaiwe del chachay Nawel!','You found chachay Nawel\'s chaiwe!')]);}
  if(S.flags.pew_chaiwe&&!found)return say([N('Buscas entre las ramas... pero aquí no hay ningún chaiwe.','You search among the branches... but there is no chaiwe here.'),
    L('','Külon','Un külon (maqui) cargado de frutitos morados.','A külon (maqui) loaded with little purple berries.')]);
  say([L('','Külon','Un külon (maqui) cargado de frutitos morados. Con sus frutos se hace remedio y mushay.','A külon (maqui) loaded with little purple berries. Its fruit makes medicine and mushay.')]);
}

/* ---------- Secret wekufü (step on their ground to wake them) ---------- */
function sbossWake(sb){
  const pre={chinifilu:[N('El barro empieza a burbujear bajo tus pies... y una filu (culebra) gigantesca emerge chorreando lodo, cubierta de pelo áspero y con crin de kawellu: ¡el Chiñifilu!','The mud starts to bubble under your feet... and a gigantic filu (snake) rises dripping slime, covered in coarse hair, with a horse\'s mane: the Chiñifilu!'),
      N('Tres sellos de luz lo protegen. El primero susurra: «¡Duérmete!»','Three seals of light protect it. The first whispers: «Sleep!»')],
    piwuchen:[N('La loma tiembla bajo tus pasos y de la cima baja un silbido agudo. Una culebra con alas de murciélago cae del cielo: ¡el Piwüchen!','The knoll trembles under your steps and a shrill whistle comes down from the summit. A snake with bat wings drops from the sky: the Piwüchen!'),
      N('Tres sellos de luz lo protegen. El primero susurra: «¡Baja!»','Three seals of light protect it. The first whispers: «Come down!»')],
    wallipen:[N('Pisas la orilla helada y el agua del ojo de agua se agita. Una criatura deforme, mitad oveja y mitad ternero, sale arrastrando las patas: ¡el Waillepeñ!','You tread the icy edge and the pool stirs. A misshapen creature, half sheep and half calf, drags itself out: the Waillepeñ!'),
      N('Tres sellos de luz lo protegen. El primero susurra: «¡Ten frío!»','Three seals of light protect it. The first whispers: «Be cold!»')],
    trawko:[N('Un hacha de piedra se clava en un tronco, a un palmo de tu cabeza. Del helecho sale un hombrecito retorcido con sombrero de fibra: ¡el Trawko!','A stone axe thuds into a trunk, a hand\'s width from your head. Out of the ferns steps a twisted little man in a fiber hat: the Trawko!'),
      N('Tres sellos de luz lo protegen. El primero susurra: «¡Sal!»','Three seals of light protect it. The first whispers: «Come out!»')],
    epunamun:[N('La tierra blanda se hunde bajo tus pies... y de la sal se levanta un guerrero enorme de dos caras, con corona de plumas y una lanza en cada mano: ¡el Epunamun!','The soft ground sinks under your feet... and out of the salt rises a huge two-faced warrior, with a feather crown and a spear in each hand: the Epunamun!'),
      N('Tres sellos de luz lo protegen. El primero susurra: «¡Duérmete!»','Three seals of light protect it. The first whispers: «Sleep!»')]}[sb.boss];
  say(pre,()=>startBattle([sb.boss],{boss:1,sflag:sb.flag}));
}

/* ---------- Nagche overworld puzzles ---------- */
function digFind(dk,dv){
  S.flags['dig:'+CUR+':'+dk]=1;
  if(dv&&dv.what==='pali'){S.flags.laf_palid=1;S.gold+=20;persist();sfx('lvl');
    return say([N('Entre el pasto alto aparece una bola de madera pulida: ¡la pali!','In the tall grass you find a polished wooden ball: the pali!'),
      L('','Pali!','La pali de la niña del lof. Te dará las gracias... y encuentras epu mari (20) ngülliw enterrados con ella.','The girl\'s pali. She will thank you... and you find epu mari (20) ngülliw buried with it.')]);}
  if(dv&&dv.what==='pichun'){S.flags.puel_pichd=1;S.gold+=20;persist();sfx('lvl');
    return say([N('Entre el pasto pisado aparece una pluma larga y gris, atada con un hilo rojo: ¡la pluma de choyke!','In the trampled grass you find a long grey feather tied with a red thread: the choyke plume!'),
      L('','Choyke pichuñ!','La pluma del niño del lof. Te dará las gracias... y encuentras epu mari (20) ngülliw enterrados debajo.','The boy\'s plume. He will thank you... and you find epu mari (20) ngülliw buried beneath it.')]);}
  if(dv&&dv.what==='trutruka'){S.gear.trutruka=1;persist();sfx('lvl');
    return say([N('Entre los juncos mojados aparece una larga corneta de coligüe con un cuerno en la punta...','Among the wet reeds appears a long colihue horn with a cow horn at its tip...'),
      L('','Trutruka!','¡Encontraste la trutruka! En las peleas podrás tocarla: su sonido aturde a todos los wekufü (una vez por pelea). Cuéntale al trutrukatufe.','You found the trutruka! In battle you can blow it: its blast stuns all the wekufü (once per fight). Tell the trutrukatufe.')]);}
  if(dv&&dv.what==='piwke'){persist();sfx('lvl');
    return gainPiwke([N('Escarbas la tierra justo aquí... ¡hay algo enterrado!','You dig right here... something is buried!'),praise()]);}
  S.gold+=50;S.items.kofke++;persist();sfx('lvl');
  say([N('Escarbas la tierra justo aquí... ¡hay algo enterrado!','You dig right here... something is buried!'),praise(),
    L('','Kechu mari ngülliw!','Un cántaro antiguo con kechu mari (50) ngülliw y un kofke.','An old jug with kechu mari (50) ngülliw and a kofke.')]);
}
function shepTalk(){
  const en=S.gloss==='en';
  if(S.flags.sheep)return say([L('Pichi domo','Kayu ofisa nien. Chaltu may!','Tengo seis ovejas. ¡Gracias!','I have six sheep. Thank you!')]);
  say([L('Pichi domo','Mari mari, '+addr(true)+'! Weñimkefiñ ofisa.','¡Hola! Yo cuido ovejas.','Hello! I take care of sheep.'),
    N('Desde que llegó el Witranalwe no me salen las cuentas. ¿Me ayudas a contarlas? Están todas en el corral.','Since the Witranalwe came I keep losing count. Will you help me count them? They are all in the pen.')],ask);
  function ask(){const o=['kechu','kayu','regle','pura'].map(m=>({m,v:m}));for(let a=3;a>0;a--){const b=rnd(a+1);[o[a],o[b]]=[o[b],o[a]]}
    choose(L('Pichi domo','Chumten ofisa nien?','¿Cuántas ovejas tengo?','How many sheep do I have?'),o.concat([{m:'Pewkayal',g:en?'(count first)':'(contar primero)',v:'x'}]),v=>{
      if(!v||v==='x')return;
      if(v==='kayu'){S.flags.sheep=1;S.items.kulon+=2;S.gold+=20;persist();sfx('lvl');
        return say([praise(),L('Pichi domo','Kayu ofisa! Chaltu may!','¡Seis ovejas! ¡Gracias!','Six sheep! Thank you!'),L('','Epu külon · epu mari ngülliw','Te da dos külon y epu mari (20) ngülliw.','She gives you two külon and epu mari (20) ngülliw.')])}
      sfx('bad');say([L('Pichi domo','Fey no...','Eso no...','Not that...'),N('Mira bien el corral y cuenta otra vez.','Look carefully at the pen and count again.')])},true,true)}
}
function nFisherTalk(){
  const en=S.gloss==='en';
  if(S.flags.nfish)return say([L('Challwafe','Wüle ka challwatuan.','Mañana voy a pescar otra vez.','Tomorrow I will fish again.')]);
  const qs=[{q:L('Challwafe','Wüle iñche amu___','Mañana yo iré.','Tomorrow I will go.'),o:['amun','amuan','amuay'],a:'amuan'},
    {q:L('Challwafe','Eymi kim___','Tú sabrás.','You will know.'),o:['kimimi','kiman','kimaymi'],a:'kimaymi'},
    {q:L('Challwafe','Fey challwatu___','Él va a pescar.','He will fish.'),o:['challwatuay','challwatuy','challwatuan'],a:'challwatuay'}];
  say([L('Challwafe','Mari mari, '+addr(false)+'. Challwatulen.','Hola. Estoy pescando.','Hello. I am fishing.'),
    N('El pescador quiere hablar de lo que vendrá, pero las palabras se le escapan como peces. Ayúdalo a terminar los verbos: todo lo que todavía no pasa.','The fisherman wants to talk about what is to come, but the words slip away from him like fish. Help him finish the verbs: everything that has not happened yet.')],()=>ask(0));
  function ask(i){
    if(i>=qs.length){S.flags.nfish=1;S.items.lawen+=2;S.gold+=20;S.xp+=4;persist();sfx('lvl');
      return say([praise(),L('Challwafe','Chaltu may! Wüle ka challwatuan.','¡Gracias! Mañana voy a pescar otra vez.','Thank you! Tomorrow I will fish again.'),N('Te da dos lawen y epu mari (20) ngülliw. +4 kimün.','He gives you two lawen and epu mari (20) ngülliw. +4 kimün.')],()=>{if(S.xp>=xpNeed())levelUpCheck()})}
    const q=qs[i];choose(q.q,q.o.map(o=>({m:o,v:o})).concat([{m:'Chillka',g:en?'Check the book':'Consultar el libro',v:'_book'}]),v=>{
      if(v==='_book')return openBook(()=>ask(i));
      if(v===q.a){sfx('ok');ask(i+1)}else{sfx('bad');say([L('Challwafe','Fey no...','Eso no...','Not that...'),N('Piensa: ¿ya pasó, o todavía no?','Think: has it already happened, or not yet?')],()=>ask(0))}},false,false)}
}
function goTitle(){
  persist();active=null;menu.style.display='none';dlg.style.display='none';banner.style.display='none';B=null;
  mode='title';$('title').style.display='';$('bCont').style.display='';AU.name=null;playSong('intro');
}

/* ================= PEWENCHE ================= */
function lakuTalk(){
  if(!S.flags.laku){S.flags.laku=1;S.gold+=20;persist();sfx('pick');
    return say([L('Laku','Mari mari, '+nm()+'! Iñche tami laku.','¡Hola, '+nm()+'! Soy tu laku.','Hello, '+nm()+'! I am your laku.'),
      N('Tu laku es el papá de tu papá. Subió a la cordillera para la cosecha de ngülliw.','Your laku is your father\'s father. He came up to the mountains for the ngülliw harvest.'),
      L('Laku','Tüfa ta ngülliw: pewen ñi fün.','Esto es ngülliw: el fruto del pewen.','This is ngülliw: the fruit of the pewen.'),
      N('Los ngülliw que has juntado en tu viaje son estos piñones. Con ellos se hace trafkintu: se intercambian cosas. Tu laku te regala epu mari (20).','The ngülliw you have gathered on your journey are these pewen nuts. With them people do trafkintu: they exchange things. Your laku gives you epu mari (20).'),
      L('Laku','Chem pimi? Iney eymi? Chew amuaymi?','¿Qué dijiste? ¿Quién eres tú? ¿A dónde irás?','What did you say? Who are you? Where will you go?'),
      N('Así se pregunta: chem (qué), iney (quién), chew (dónde), chumül (cuándo), chumten (cuánto). Tu chillka las tiene en «Chem, iney, chew».','This is how you ask: chem (what), iney (who), chew (where), chumül (when), chumten (how much). Your chillka has them under «Chem, iney, chew».'),
      L('Laku','Lonko mew amunge. Kütral mew müley.','Ve donde el lonko. Está junto al kütral.','Go to the lonko. He is by the fire.')]);}
  const ls=[L('Laku','Mari mari, '+nm()+'!','¡Hola, '+nm()+'!','Hello, '+nm()+'!')];
  if(S.flags.ngen3)ls.push(L('Laku','Ngen-pewen nepey! Ayüwün.','¡Ngen-pewen despertó! Estoy feliz.','Ngen-pewen has woken up! I am happy.'));
  else ls.push(N('El pillañ (el volcán) queda al este, pasando el bosque de pewenes y los campos de nieve.','The pillañ (the volcano) lies to the east, past the pewen forest and the snowfields.'));
  say(ls);
}
function pLonkoTalk(){
  if(S.flags.pew_lonko){
    const ls=[L('Lonko','Mari mari, '+nm()+'.','Hola, '+nm()+'.','Hello, '+nm()+'.')];
    if(S.flags.ngen3)ls.push(L('Lonko','Ngen-pewen nepey. Chaltu may!','Ngen-pewen despertó. ¡Gracias!','Ngen-pewen has woken up. Thank you!'),
      N('Ya llevas tres trariwe trokiñ. Dicen que en el sur, en tierras williche, y al otro lado de la cordillera, en Puelmapu, esperan los últimos.','You now carry three trariwe trokiñ. They say the last ones wait in the south, in Williche lands, and across the mountains, in Puelmapu.'));
    else ls.push(L('Lonko','Pillañ mew amunge.','Ve al volcán.','Go to the volcano.'),N('Pasando el bosque de pewenes y los campos de nieve está el pillañ. La morada del Cherrufe está adentro.','Past the pewen forest and the snowfields is the pillañ. The Cherrufe\'s lair is inside.'),
      N('Y en este lof las puertas están abiertas: entra en las rukas. La papay Rayen y el chachay Nawel siempre reciben visitas.','And in this lof the doors are open: go into the rukas. Papay Rayen and chachay Nawel always welcome visitors.'));
    return say(ls);
  }
  const steps=[
    {q:L('Lonko','Mari mari, '+nm()+'. Chumleymi?','Hola, '+nm()+'. ¿Cómo estás?','Hello, '+nm()+'. How are you?'),
     o:[{m:'Kümelen. Eymi kay?',es:'Estoy bien. ¿Y tú?',en:'I am well. And you?',ok:1},{m:'Kümeleyngün.',es:'Ellos están bien.',en:'They are well.'},{m:'Chumleymi?',es:'¿Cómo estás?',en:'How are you?'}]},
    {q:L('Lonko','Iñche ka kümelen. Chew tuwimi?','Yo también estoy bien. ¿De dónde eres?','I am well too. Where are you from?'),
     o:[{m:'Lafken mapu tuwün.',es:'Vengo de la tierra del mar.',en:'I come from the land of the sea.',ok:1},{m:'Chew tuwimi?',es:'¿De dónde eres tú?',en:'Where are you from?'},{m:'Pewen mapu tuwimi.',es:'Tú vienes de la tierra de los pewenes.',en:'You come from the land of the pewen trees.'}]},
    {q:L('Lonko','Chumleyngün tami pu che?','¿Cómo está tu gente?','How are your people?'),
     o:[{m:'Kümeleyngün.',es:'Ellos están bien.',en:'They are well.',ok:1},{m:'Kümelen.',es:'Yo estoy bien.',en:'I am well.'},{m:'Kümeleymi.',es:'Tú estás bien.',en:'You are well.'}]}];
  say([N('El lonko pewenche se levanta para saludarte. Recuerda el pentukuwün.','The Pewenche lonko stands up to greet you. Remember the pentukuwün.')],()=>step(0));
  function step(i){
    if(i>=steps.length)return done();
    const s=steps[i],en=S.gloss==='en';
    const opts=s.o.map((o,k)=>({m:o.m,g:S.hints?(en?o.en:o.es):'',v:k}));for(let a=opts.length-1;a>0;a--){const b=rnd(a+1);[opts[a],opts[b]]=[opts[b],opts[a]]}
    choose(s.q,opts,v=>{if(s.o[v].ok)say([praise()],()=>step(i+1));else{sfx('bad');say([N('El lonko espera, en silencio. Piensa en lo que te preguntó.','The lonko waits in silence. Think about what he asked you.')],()=>step(i))}},false,true);
  }
  function done(){
    S.flags.pew_lonko=1;learnRoot('trafo');S.items.kulon++;persist();sfx('lvl');
    say([L('Lonko','Kümey! Ngen-lafken ka Ngen-mawida nepeyngu, pikeyngün.','¡Bien! Dicen que Ngen-lafken y Ngen-mawida despertaron.','Good! They say Ngen-lafken and Ngen-mawida have woken up.'),
      L('Lonko','Welu Ngen-pewen umawtuley.','Pero Ngen-pewen está dormido.','But Ngen-pewen is asleep.'),
      N('Un Cherrufe, un gigante de roca y lava, salió del pillañ. Su calor seca los pewenes y la nieve se vuelve dura como piedra. Desde entonces hay menos ngülliw y la gente olvida las palabras.','A Cherrufe, a giant of rock and lava, came out of the pillañ. Its heat dries the pewen trees and the snow turns hard as stone. Since then there are fewer ngülliw and people forget the words.'),
      L('Lonko','Trafo- kimeltueyu.','Te enseño trafo- ("quebrarse").','I teach you trafo- ("break").'),
      N('Con trafonge, trafomu o trafomün se quiebra la coraza de piedra de los wekufü. Recibiste trafo- y un külon.','With trafonge, trafomu or trafomün the stone crust of the wekufü cracks. You received trafo- and a külon.'),
      L('Lonko','Pillañ mew amunge, '+nm()+'.','Ve al volcán, '+nm()+'.','Go to the volcano, '+nm()+'.')]);
  }
}
function pNutramTalk(){
  say([L('Nütramkafe','Mari mari, '+addr(true)+'. Nütramkayaiñ?','Hola. ¿Conversamos?','Hello. Shall we talk?'),
    L('Nütramkafe','Kuyfi, pillañ mew mülefuy kiñe Cherrufe.','Hace mucho tiempo, en el volcán había un Cherrufe.','Long ago, in the volcano, there was a Cherrufe.'),
    L('Nütramkafe','Kütral ka kura ngefuy.','Era de fuego y de piedra.','It was made of fire and stone.'),
    L('Nütramkafe','Pu che llükakefuy.','La gente le tenía miedo.','People used to fear it.'),
    N('Dicen que los golpes rebotan en su piedra, y que su fuego quema a quien lo toca. Pero la piedra se quiebra, y el fuego se apaga con el frío.','They say blows bounce off its stone, and its fire burns whoever touches it. But stone cracks, and fire goes out in the cold.')]);
}
function gathTalk(){
  say([L('Domo','Fentren ngülliw müley!','¡Hay muchos piñones!','There are lots of pewen nuts!'),
    N('Las mujeres juntan los ngülliw que caen de los pewenes. Este año caen pocos: el calor del Cherrufe seca los árboles.','The women gather the nuts that fall from the pewen trees. This year few are falling: the Cherrufe\'s heat dries the trees.')]);
}
function arrieroTalk(){
  const en=S.gloss==='en';
  if(S.flags.pew_ngu1&&!S.flags.pew_ngu2){S.flags.pew_ngu2=1;persist();sfx('lvl');
    return say([N('Le entregas los ngülliw tostados de la papay Rayen.','You hand him papay Rayen\'s toasted pewen nuts.'),
      L('Wentru','Chaltu may! Kümey ngülliw!','¡Gracias! ¡Qué ricos piñones!','Thank you! What good pewen nuts!'),
      L('Wentru','Allkütunge: pewen mapu mew, epu fütra pewen müley, rüpü ñi willi püle.','Escucha: en el bosque hay dos pewenes gemelos, al sur del camino.','Listen: in the forest there are two twin pewen trees, south of the road.'),
      N('«Mis caballos siempre escarban justo entre esos dos árboles. Algo brilla ahí abajo. Busca justo en medio.»','"My horses always paw at the ground right between those two trees. Something shines down there. Search right in the middle."')]);}
  if(S.flags.pew_ke)return say([L('Wentru','Kawellu mew amuken. Pewkayal!','Yo ando a caballo. ¡Hasta luego!','I ride on horseback. See you later!')]);
  const qs=[{q:L('Wentru','Pu pewenche ngülliw i___','Los pewenche comen piñones (siempre, de costumbre).','The Pewenche eat pewen nuts (always, as a habit).'),o:['iyngün','ikeyngün','ikey'],a:'ikeyngün'},
    {q:L('Wentru','Iñche mapudungu___','Yo hablo mapudungun (siempre, de costumbre).','I speak Mapudungun (always, as a habit).'),o:['mapudungun','mapudunguken','mapudungukey'],a:'mapudunguken'},
    {q:L('Wentru','Eymi kawellu mew amu___','Tú andas a caballo (siempre, de costumbre).','You ride on horseback (always, as a habit).'),o:['amuymi','amukeymi','amuken'],a:'amukeymi'}];
  say([L('Wentru','Mari mari, '+addr(false)+'. Kawellu mew amuken.','Hola. Yo ando a caballo.','Hello. I ride on horseback.'),
    N('Fíjate en amuken: -ke- dice lo que alguien hace siempre, por costumbre. El arriero quiere ver si lo entiendes. Tu chillka lo explica en «-ke-».','Notice amuken: -ke- says what someone always does, as a habit. The muleteer wants to see if you understand. Your chillka explains it under «-ke-».')],()=>ask(0));
  function ask(i){
    if(i>=qs.length){S.flags.pew_ke=1;S.items.kofke+=2;S.gold+=30;S.xp+=4;persist();sfx('lvl');
      return say([praise(),L('Wentru','Kümey! Mapudungukeymi!','¡Bien! ¡Hablas mapudungun!','Good! You speak Mapudungun!'),N('Te da dos kofke y küla mari (30) ngülliw. +4 kimün.','He gives you two kofke and küla mari (30) ngülliw. +4 kimün.')],()=>{if(S.xp>=xpNeed())levelUpCheck()})}
    const q=qs[i];choose(q.q,q.o.map(o=>({m:o,v:o})).concat([{m:'Chillka',g:en?'Check the book':'Consultar el libro',v:'_book'}]),v=>{
      if(v==='_book')return openBook(()=>ask(i));
      if(v===q.a){sfx('ok');ask(i+1)}else{sfx('bad');say([L('Wentru','Fey no...','Eso no...','Not that...'),N('Piensa: ¿quién lo hace, y lo hace siempre?','Think: who does it, and do they always do it?')],()=>ask(0))}},false,false)}
}
function papayTalk(){
  say([L('Papay','Mari mari, '+addr(true)+'. Chumleymi?','Hola. ¿Cómo estás?','Hello. How are you?'),L(nm(),'Kümelen. Eymi kay?','Estoy bien. ¿Y tú?','I am well. And you?'),L('Papay','Iñche ka kümelen.','Yo también estoy bien.','I am well too.')]);
}
function trutTalk(){
  say([L('Weche wentru','Trutruka ayüken.','Me gusta la trutruka.','I love the trutruka.'),N('La trutruka es un instrumento largo de colihue con un cuerno en la punta. Suena en las ceremonias y en las fiestas.','The trutruka is a long instrument made of colihue cane with a horn at the end. It sounds at ceremonies and celebrations.')]);
}
function kona3Talk(){
  if(S.flags.ngen3)return say([L('Kona','Cherrufe ngelay! Ayüwün!','¡Ya no está el Cherrufe! ¡Qué feliz estoy!','The Cherrufe is gone! I am so happy!')]);
  say([L('Kona','Cherrufe müley pillañ mew. Kütralngey ka kurangey!','El Cherrufe está en el volcán. ¡Es fuego y es piedra!','The Cherrufe is in the volcano. It is fire and it is stone!'),
    N('La entrada está entre las rocas, subiendo al este. Dicen que adentro hay piedras con números muy grandes y otra que hace preguntas.','The entrance is among the rocks, up to the east. They say inside there are stones with very big numbers and another one that asks questions.')]);
}

/* ================= WILLICHE ================= */
function checheTalk(){
  if(!S.flags.cheche){S.flags.cheche=1;S.gold+=30;persist();sfx('pick');
    return say([L('Cheche','Mari mari, '+nm()+'! Iñche tami cheche.','¡Hola, '+nm()+'! Soy tu cheche.','Hello, '+nm()+'! I am your cheche.'),
      N('Tu cheche es el papá de tu mamá. Vive aquí en el sur, junto al lago, donde nació.','Your cheche is your mother\'s father. He lives here in the south, by the lake, where he was born.'),
      L('Cheche','Kimimi tami pu che?','¿Conoces a tu familia?','Do you know your family?'),
      N('Por el lado de tu papá están tu kuku y tu laku; por el lado de tu mamá, tu chuchu y tu cheche. Ya conociste a los cuatro. Tu chillka lo tiene en «Pu che».','On your father\'s side are your kuku and your laku; on your mother\'s side, your chuchu and your cheche. Now you have met all four. Your chillka has it under «Pu che».'),
      N('Tu cheche te regala küla mari (30) ngülliw.','Your cheche gives you küla mari (30) ngülliw.'),
      L('Cheche','Lonko mew amunge. Kütral mew müley.','Ve donde el lonko. Está junto al kütral.','Go to the lonko. He is by the fire.')]);}
  const ls=[L('Cheche','Mari mari, '+nm()+'!','¡Hola, '+nm()+'!','Hello, '+nm()+'!')];
  if(S.flags.ngen4)ls.push(L('Cheche','Ngen-kürüf nepey! Ayüwün.','¡Ngen-kürüf despertó! Estoy feliz.','Ngen-kürüf has woken up! I am happy.'));
  else ls.push(N('Los acantilados donde se esconde el Kaleuche quedan al este, pasando el bosque de alerces y la costa.','The cliffs where the Kaleuche hides lie to the east, past the alerce forest and the coast.'));
  say(ls);
}
function wLonkoTalk(){
  if(S.flags.wil_lonko){
    const ls=[L('Lonko','Mari mari, '+nm()+'.','Hola, '+nm()+'.','Hello, '+nm()+'.')];
    if(S.flags.ngen4)ls.push(L('Lonko','Ngen-kürüf nepey. Chaltu may!','Ngen-kürüf despertó. ¡Gracias!','Ngen-kürüf has woken up. Thank you!'),
      N('Ya llevas cuatro trariwe trokiñ. El último está en Puelmapu, al otro lado de la cordillera.','You now carry four trariwe trokiñ. The last one is in Puelmapu, on the other side of the mountains.'));
    else ls.push(L('Lonko','Lafken inaltu mew amunge.','Ve a los acantilados de la costa.','Go to the cliffs by the sea.'),N('Pasando el bosque de alerces y la costa están los acantilados. La cueva del Kaleuche está bajando por las rocas.','Past the alerce forest and the coast are the cliffs. The Kaleuche\'s cave is down among the rocks.'));
    return say(ls);
  }
  const steps=[
    {q:L('Lonko','Mari mari, '+nm()+'. Chumleymi?','Hola, '+nm()+'. ¿Cómo estás?','Hello, '+nm()+'. How are you?'),
     o:[{m:'Kümelen. Eymi kay?',es:'Estoy bien. ¿Y tú?',en:'I am well. And you?',ok:1},{m:'Kümeleyngün.',es:'Ellos están bien.',en:'They are well.'},{m:'Iney eymi?',es:'¿Quién eres tú?',en:'Who are you?'}]},
    {q:L('Lonko','Iñche ka kümelen. Chew tuwimi?','Yo también estoy bien. ¿De dónde eres?','I am well too. Where are you from?'),
     o:[{m:'Lafken mapu tuwün.',es:'Vengo de la tierra del mar.',en:'I come from the land of the sea.',ok:1},{m:'Chumül tuwimi?',es:'¿Cuándo vienes?',en:'When do you come?'},{m:'Willi mapu tuwimi.',es:'Tú vienes del sur.',en:'You come from the south.'}]},
    {q:L('Lonko','Chumleyngün tami pu che?','¿Cómo está tu gente?','How are your people?'),
     o:[{m:'Kümeleyngün.',es:'Ellos están bien.',en:'They are well.',ok:1},{m:'Kümelen.',es:'Yo estoy bien.',en:'I am well.'},{m:'Kümeleymi.',es:'Tú estás bien.',en:'You are well.'}]}];
  say([N('El lonko williche se levanta para saludarte. Recuerda el pentukuwün.','The Williche lonko stands up to greet you. Remember the pentukuwün.')],()=>step(0));
  function step(i){
    if(i>=steps.length)return done();
    const s=steps[i],en=S.gloss==='en';
    const opts=s.o.map((o,k)=>({m:o.m,g:S.hints?(en?o.en:o.es):'',v:k}));for(let a=opts.length-1;a>0;a--){const b=rnd(a+1);[opts[a],opts[b]]=[opts[b],opts[a]]}
    choose(s.q,opts,v=>{if(s.o[v].ok)say([praise()],()=>step(i+1));else{sfx('bad');say([N('El lonko espera, en silencio. Piensa en lo que te preguntó.','The lonko waits in silence. Think about what he asked you.')],()=>step(i))}},false,true);
  }
  function done(){
    S.flags.wil_lonko=1;learnRoot('lef');S.items.kulon++;persist();sfx('lvl');
    say([L('Lonko','Kümey! Küla ngen nepeyngün, pikeyngün.','¡Bien! Dicen que tres ngen despertaron.','Good! They say three ngen have woken up.'),
      L('Lonko','Welu Ngen-kürüf umawtuley.','Pero Ngen-kürüf está dormido.','But Ngen-kürüf is asleep.'),
      N('Sin viento, la niebla no se va. Dentro de ella navega el Kaleuche, un barco de kalku que se lleva a la gente. Desde entonces la niebla cubre el sur y la gente habla cada vez menos.','Without wind, the fog does not leave. Inside it sails the Kaleuche, a kalku ship that carries people away. Since then the fog covers the south and people speak less and less.'),
      L('Lonko','Lef- kimeltueyu.','Te enseño lef- ("correr").','I teach you lef- ("run").'),
      N('Con lefnge, lefmu o lefmün, los wekufü que ya están débiles (la mitad de su fuerza o menos) salen corriendo y no vuelven. Recibiste lef- y un külon.','With lefnge, lefmu or lefmün, wekufü that are already weak (half their strength or less) run off and do not come back. You received lef- and a külon.'),
      L('Lonko','Lafken inaltu mew amunge, '+nm()+'.','Ve a los acantilados, '+nm()+'.','Go to the cliffs, '+nm()+'.')]);
  }
}
function wNutramTalk(){
  say([L('Nütramkafe','Mari mari, '+addr(false)+'. Nütramkayaiñ?','Hola. ¿Conversamos?','Hello. Shall we talk?'),
    L('Nütramkafe','Kuyfi, lafken mew amukefuy kiñe Kaleuche.','Hace mucho tiempo, por el mar andaba un Kaleuche.','Long ago, a Kaleuche went about on the sea.'),
    L('Nütramkafe','Pun mew pengekefuy.','De noche se lo veía.','At night it could be seen.'),
    L('Nütramkafe','Fütra wampo ngefuy.','Era un barco grande.','It was a big boat.'),
    N('Dicen que va lleno de luces y de música, y que se esconde en la niebla cuando alguien lo mira. Pero lo que se esconde sale cuando se le dice.','They say it is full of lights and music, and that it hides in the fog when someone looks at it. But what hides comes out when it is told to.')]);
}
function wFisherTalk(){
  say([L('Challwafe','Wampo mew challwatuken.','Pesco en mi wampo (canoa).','I fish from my wampo (canoe).'),
    N('Desde que llegó la niebla, casi no hay peces. Dicen que el Kaleuche se los lleva.','Since the fog came there are hardly any fish. They say the Kaleuche takes them.')]);
}
function timeTalk(){
  const en=S.gloss==='en';
  if(S.flags.wil_time)return say([L('Challwafe','Wüle ka challwatuan. Pewkayal!','Mañana vuelvo a pescar. ¡Hasta luego!','Tomorrow I will fish again. See you later!')]);
  const qs=[{q:L('Challwafe','Wiya iñche challwatu___','Ayer pesqué.','Yesterday I fished.'),o:['challwatuan','challwatun','challwatuy'],a:'challwatun'},
    {q:L('Challwafe','Wüle iñche challwatu___','Mañana pescaré.','Tomorrow I will fish.'),o:['challwatun','challwatuy','challwatuan'],a:'challwatuan'},
    {q:L('Challwafe','Fachantü eymi küpa___','Hoy viniste.','Today you came.'),o:['küpaymi','küpayaymi','küpan'],a:'küpaymi'}];
  say([L('Challwafe','Mari mari, '+addr(true)+'. Wiya, fachantü, wüle...','Hola. Ayer, hoy, mañana...','Hello. Yesterday, today, tomorrow...'),
    N('La pescadora mezcla los días desde que llegó la niebla. Ayúdala: wiya es ayer, fachantü es hoy y wüle es mañana. Lo que ya pasó no lleva -a-; lo que todavía no pasa, sí.','The fisherwoman mixes up the days since the fog came. Help her: wiya is yesterday, fachantü is today and wüle is tomorrow. What already happened has no -a-; what has not happened yet does.')],()=>ask(0));
  function ask(i){
    if(i>=qs.length){S.flags.wil_time=1;S.items.lawen++;S.items.kofke++;S.gold+=30;S.xp+=4;persist();sfx('lvl');
      return say([praise(),L('Challwafe','Chaltu may!','¡Gracias!','Thank you!'),N('Te da un lawen, un kofke y küla mari (30) ngülliw. +4 kimün.','She gives you a lawen, a kofke and küla mari (30) ngülliw. +4 kimün.')],()=>{if(S.xp>=xpNeed())levelUpCheck()})}
    const q=qs[i];choose(q.q,q.o.map(o=>({m:o,v:o})).concat([{m:'Chillka',g:en?'Check the book':'Consultar el libro',v:'_book'}]),v=>{
      if(v==='_book')return openBook(()=>ask(i));
      if(v===q.a){sfx('ok');ask(i+1)}else{sfx('bad');say([L('Challwafe','Fey no...','Eso no...','Not that...'),N('Piensa: ¿ya pasó, o todavía no?','Think: has it already happened, or not yet?')],()=>ask(0))}},false,false)}
}
function kona4Talk(){
  if(S.flags.ngen4)return say([L('Kona','Kaleuche ngelay! Ayüwün!','¡Ya no está el Kaleuche! ¡Qué feliz estoy!','The Kaleuche is gone! I am so happy!')]);
  say([L('Kona','Kaleuche müley lafken mew! Pun mew pengekey.','¡El Kaleuche está en el mar! De noche se ve.','The Kaleuche is at sea! At night it can be seen.'),
    N('La cueva baja por las rocas, aquí al lado. Dicen que adentro hay braseros de colores y una piedra que habla de lo que no pasará.','The cave goes down through the rocks, right here. They say inside there are colored braziers and a stone that talks about what will not happen.')]);
}

/* ================= PUELMAPU ================= */
function werkenTalk(){
  if(S.flags.ngen5)return say([L('Werken','Ngen-lelfün nepey! Kom mapu ayüwüy.','¡Ngen-lelfün despertó! Toda la tierra está contenta.','Ngen-lelfün has woken up! The whole land is glad.')]);
  say([L('Werken','Mari mari, '+addr(false)+'! Iñche werken ngen.','¡Hola! Soy werken (mensajero).','Hello! I am a werken (messenger).'),
    N('Llevo mensajes entre las comunidades, a caballo. Esta bajada lleva a Puelmapu, la tierra del este, al otro lado de la cordillera: la pampa abierta.','I carry messages between the communities, on horseback. This slope leads down to Puelmapu, the land of the east, on the far side of the mountains: the open plain.'),
    L('Werken','Puel mapu mew müley tami weku.','En la tierra del este está tu weku.','In the eastern land is your weku.'),
    N('Tu weku es el hermano de tu mamá: un tío muy importante. Vive en el lof puelche, siguiendo el camino. Pero cuídate: el pasto se está secando y el ganado huye. Algo malo anda en la pampa.','Your weku is your mother\'s brother: a very important uncle. He lives in the Puelche lof, down the road. But be careful: the grass is drying out and the animals are fleeing. Something evil walks the plain.')]);
}
function wekuTalk(){
  if(!S.flags.weku){S.flags.weku=1;S.gold+=30;persist();sfx('pick');
    return say([L('Weku','Mari mari, '+nm()+'! Iñche tami weku.','¡Hola, '+nm()+'! Soy tu weku.','Hello, '+nm()+'! I am your weku.'),
      N('Tu weku es el hermano de tu mamá. En la cultura mapuche es un tío muy cercano: casi un segundo papá. Cruzó la cordillera hace años, con los arrieros.','Your weku is your mother\'s brother. In Mapuche culture he is a very close uncle: almost a second father. He crossed the mountains years ago, with the herders.'),
      N('Ya conociste a tu kuku, tu laku, tu chuchu y tu cheche. Tu chillka tiene a toda tu familia en «Pu che». Tu weku te regala küla mari (30) ngülliw.','You have already met your kuku, your laku, your chuchu and your cheche. Your chillka has your whole family under «Pu che». Your weku gives you küla mari (30) ngülliw.'),
      L('Weku','Lonko mew amunge. Kütral mew müley.','Ve donde el lonko. Está junto al kütral.','Go to the lonko. He is by the fire.')]);}
  const ls=[L('Weku','Mari mari, '+nm()+'!','¡Hola, '+nm()+'!','Hello, '+nm()+'!')];
  if(S.flags.ngen5)ls.push(L('Weku','Trariwe dewi! Müna ayüwün.','¡El trariwe está terminado! Qué alegría.','The trariwe is finished! What a joy.'));
  else ls.push(N('El chenque del Walichu queda al este, pasando la pampa y el pedregal, en la meseta. Pero primero habla con el lonko.','The Walichu\'s chenque lies to the east, past the grassland and the stone barrens, on the meseta. But first speak with the lonko.'));
  say(ls);
}
function eLonkoTalk(){
  if(S.flags.puel_lonko){
    const ls=[L('Lonko','Mari mari, '+nm()+'.','Hola, '+nm()+'.','Hello, '+nm()+'.')];
    if(S.flags.ngen5)ls.push(L('Lonko','Ngen-lelfün nepey. Trariwe dewi!','Ngen-lelfün despertó. ¡El trariwe está completo!','Ngen-lelfün has woken up. The trariwe is complete!'),
      N('Los cinco trokiñ brillan en tu cintura. Ahora vuelve al oeste, al primer camino junto al mar: la niebla de Ti Fütra Ngoyman ya puede abrirse ante ti.','The five trokiñ glow at your waist. Now go back west, to the first road by the sea: the fog of Ti Fütra Ngoyman can open before you now.'));
    else ls.push(L('Lonko','Wingkul lelfün mew amunge.','Ve a la meseta.','Go to the meseta.'),
      N('Pasando la pampa y el pedregal está la meseta. El chenque del Walichu baja entre las piedras.','Past the grassland and the stone barrens is the meseta. The Walichu\'s chenque goes down among the rocks.'));
    return say(ls);
  }
  const steps=[
    {q:L('Lonko','Mari mari. Chumleymi am?','Hola. ¿Cómo estás?','Hello. How are you?'),
     o:[{m:'Kümelen, chaltu. Eymi kay?',es:'Estoy bien, gracias. ¿Y usted?',en:'I am well, thank you. And you?',ok:1},{m:'Kümeleymi.',es:'Tú estás bien.',en:'You are well.'},{m:'Chew tuwimi?',es:'¿De dónde eres?',en:'Where are you from?'}]},
    {q:L('Lonko','Iñche ka kümelen. Iney pingeymi?','Yo también estoy bien. ¿Cómo te llamas?','I am well too. What is your name?'),
     o:[{m:'0 pingen.',es:'Me llamo 0.',en:'My name is 0.',ok:1},{m:'0 pingeymi.',es:'Tú te llamas 0.',en:'Your name is 0.'},{m:'0 pingey.',es:'Él se llama 0.',en:'His name is 0.'}]},
    {q:L('Lonko','Chumngelu küpaymi faw?','¿Por qué viniste hasta acá?','Why did you come all this way?'),
     o:[{m:'Ngen kintupan.',es:'Vine (hacia acá) a buscar al ngen.',en:'I came here looking for the ngen.',ok:1},{m:'Ngen kintuy.',es:'Él busca al ngen.',en:'He is looking for the ngen.'},{m:'Ngen kintulan.',es:'No busco al ngen.',en:'I am not looking for the ngen.'}]}];
  say([N('El lonko puelche se levanta para saludarte. Recuerda el pentukuwün.','The Puelche lonko stands up to greet you. Remember the pentukuwün.')],()=>step(0));
  function step(i){
    if(i>=steps.length)return done();
    const st=steps[i],en=S.gloss==='en';
    const opts=st.o.map((o,k)=>({m:o.m.replace('0',nm()),g:S.hints?(en?o.en:o.es).replace('0',nm()):'',v:k}));for(let a=opts.length-1;a>0;a--){const b=rnd(a+1);[opts[a],opts[b]]=[opts[b],opts[a]]}
    choose(st.q,opts,v=>{if(st.o[v].ok)say([praise()],()=>step(i+1));else{sfx('bad');say([N('El lonko espera, en silencio. Piensa en lo que te preguntó.','The lonko waits in silence. Think about what he asked you.')],()=>step(i))}},false,true);
  }
  function done(){
    S.flags.puel_lonko=1;learnRoot('trana');S.items.kulon++;persist();sfx('lvl');
    say([L('Lonko','Kümey! Meli ngen nepeyngün, pikeyngün.','¡Bien! Dicen que cuatro ngen despertaron.','Good! They say four ngen have woken up.'),
      L('Lonko','Welu Ngen-lelfün umawtuley. Walichu miawi.','Pero Ngen-lelfün duerme. El Walichu anda suelto.','But Ngen-lelfün sleeps. The Walichu is on the loose.'),
      N('El Walichu es un wekufü de la pampa: seca el pasto, espanta a los luan y hace tropezar a los kawellu. Y lo peor: a la gente le va robando las palabras, una por una, para su patrón: Ti Fütra Ngoyman.','The Walichu is a wekufü of the plains: it dries the grass, scares off the guanacos and makes the horses stumble. And worst of all: it steals people\'s words, one by one, for its master: Ti Fütra Ngoyman.'),
      L('Lonko','Trana- kimeltueyu.','Te enseño trana- ("caerse").','I teach you trana- ("fall down").'),
      N('Con tranange, tranamu o tranamün, el wekufü cae al suelo: pierde su turno y el próximo golpe le duele más. Recibiste trana- y un külon.','With tranange, tranamu or tranamün, a wekufü falls to the ground: it loses its turn and the next blow hurts it more. You received trana- and a külon.'),
      L('Lonko','Wingkul lelfün mew amunge, '+nm()+'.','Ve a la meseta, '+nm()+'.','Go to the meseta, '+nm()+'.')]);
  }
}
function eNutramTalk(){
  say([L('Nütramkafe','Mari mari, '+addr(false)+'. Nütramkayaiñ?','Hola. ¿Conversamos?','Hello. Shall we talk?'),
    L('Nütramkafe','Kuyfi, puel mapu mew, kiñe walichu akurkey.','Hace mucho tiempo, dicen que a la tierra del este llegó un walichu.','Long ago, they say, a walichu came to the eastern land.'),
    L('Nütramkafe','Umawtulen miawkerkey.','Dicen que anda caminando dormido.','They say it walks about asleep.'),
    L('Nütramkafe','Pewma mew mülerkey.','Dicen que vive dentro de un sueño.','They say it lives inside a dream.'),
    N('¿Notaste el -rke-? Es la marca de "dicen que": lo que uno sabe por otros. La kushe Millaray, en su ruka, sabe más historias así. Y en el salitral hay una piedra que pregunta por -rke-.','Did you notice the -rke-? It marks "they say": what you know through others. Old Millaray, in her ruka, knows more stories like this. And in the salt flat there is a stone that asks about -rke-.')]);
}
function choykeKidTalk(){
  if(S.flags.puel_pichd){
    if(!S.flags.puel_kidthx){S.flags.puel_kidthx=1;persist();sfx('lvl');
      return gainPiwke([L('Pichiche','Ñi pichuñ! Chaltu may, chaltu may!','¡Mi pluma! ¡Gracias, gracias!','My plume! Thank you, thank you!'),
        N('El niño abraza su pluma de choyke y te da algo que encontró jugando...','The boy hugs his choyke plume and gives you something he found while playing...')]);}
    return say([L('Pichiche','Choyke reke lefken!','¡Corro como un choyke!','I run like a rhea!')]);}
  if(S.flags.puel_kidq)return say([L('Pichiche','Ñami ñi choyke pichuñ...','Se me perdió mi pluma de choyke...','I lost my choyke plume...'),
    N('«El viento se la llevó a la pampa, al este. Donde el pasto está pisado, junto al camino... ahí cayó. Escarba y la encontrarás.»','"The wind carried it to the grassland, to the east. Where the grass is trampled, beside the road... that is where it fell. Dig and you will find it."')]);
  S.flags.puel_kidq=1;persist();
  say([L('Pichiche','Mari mari! Choyke pichuñ nien... niefun.','¡Hola! Tengo una pluma de choyke... tenía.','Hello! I have a choyke plume... I had one.'),
    N('El niño bailaba el choyke purun, el baile del ñandú, con una pluma larga y gris. Pero el viento se la llevó a la pampa del este.','The boy was dancing the choyke purun, the rhea dance, with a long grey feather. But the wind carried it off to the eastern grassland.'),
    L('Pichiche','Kintulelen, chaltu! Pasto pisado mew müley.','¡Búscamela, porfa! Está donde el pasto está pisado.','Please find it for me! It is where the grass is trampled.')]);
}
function malenTalk(){
  const en=S.gloss==='en';
  if(S.flags.puel_dir)return say([L('Domo','Meli witran mapu: puel, pikun, lafken, willi!','¡Los cuatro lados de la tierra: este, norte, mar, sur!','The four corners of the land: east, north, sea, south!')]);
  const qs=[{q:L('Domo','Chew tripakey antü?','¿Por dónde sale el sol?','Where does the sun rise?'),o:['puel','willi','lafken'],a:'puel'},
    {q:L('Domo','"Willi" ñi mapu, ¿chew müley?','La tierra "willi", ¿dónde queda?','The "willi" land, where is it?'),o:[en?'north':'norte',en?'south':'sur',en?'east':'este'],a:en?'south':'sur'},
    {q:L('Domo','Chew konkey antü? Lafken mew!','¿Dónde se pone el sol? ¡Por el mar!','Where does the sun set? By the sea!'),o:['lafken','puel','pikun'],a:'lafken'},
    {q:L('Domo','"Pikun", ¿chew müley?','¿Y "pikun", dónde queda?','And "pikun", where is it?'),o:[en?'south':'sur',en?'west':'oeste',en?'north':'norte'],a:en?'north':'norte'}];
  say([L('Domo','Mari mari, '+addr(true)+'! Trariwe ngürekalen.','¡Hola! Estoy tejiendo un trariwe.','Hello! I am weaving a trariwe.'),
    N('En el tejido van los meli witran mapu, los cuatro lados de la tierra: puel (este), pikun (norte), willi (sur) y lafken (el mar, el oeste). ¡Tú los caminaste todos! A ver si los conoces.','Woven into it are the meli witran mapu, the four corners of the land: puel (east), pikun (north), willi (south) and lafken (the sea, the west). You have walked them all! Let us see if you know them.')],()=>ask(0));
  function ask(i){
    if(i>=qs.length){S.flags.puel_dir=1;S.items.lawen++;S.gold+=20;S.xp+=4;persist();sfx('lvl');
      return say([praise(),L('Domo','Kom kimimi! Chaltu may.','¡Los sabes todos! Gracias.','You know them all! Thank you.'),N('Te da un lawen y epu mari (20) ngülliw. +4 kimün.','She gives you a lawen and epu mari (20) ngülliw. +4 kimün.')],()=>{if(S.xp>=xpNeed())levelUpCheck()})}
    const q=qs[i];const o=q.o.map(m=>({m,v:m}));for(let a=o.length-1;a>0;a--){const b=rnd(a+1);[o[a],o[b]]=[o[b],o[a]]}
    choose(q.q,o,v=>{if(v===q.a){sfx('ok');ask(i+1)}else{sfx('bad');say([L('Domo','Fey no...','Eso no...','Not that...'),N('Piensa: ¿por dónde sale el sol? ¿Dónde queda el mar?','Think: where does the sun rise? Where is the sea?')],()=>ask(0))}},true,false)}
}
function charkiTalk(){
  const en=S.gloss==='en';
  if(S.flags.puel_food)return say([L('Domo','Charki müley! Iaymi?','¡Hay charki! ¿Vas a comer?','There is charki! Will you eat?')]);
  const qs=[{q:L('Domo','Chem am "ilo"?','¿Qué es "ilo"?','What is "ilo"?'),o:[en?'meat':'carne',en?'bread':'pan',en?'water':'agua'],a:en?'meat':'carne'},
    {q:L('Domo','Chem am "challwa"?','¿Qué es "challwa"?','What is "challwa"?'),o:[en?'potato':'papa',en?'fish':'pescado',en?'salt':'sal'],a:en?'fish':'pescado'},
    {q:L('Domo','Chem am "iyael"?','¿Qué es "iyael"?','What is "iyael"?'),o:[en?'food':'comida',en?'fire':'fuego',en?'house':'casa'],a:en?'food':'comida'}];
  say([L('Domo','Mari mari! Charki dewmalen: angkümka ilo.','¡Hola! Estoy haciendo charki: carne secada al sol.','Hello! I am making charki: sun-dried meat.'),
    N('En la pampa, la carne se seca al sol y al viento para que dure todo el año. Mientras corta, te pregunta palabras de comida.','On the plains, meat is dried in the sun and wind so it lasts all year. While she cuts, she asks you food words.')],()=>ask(0));
  function ask(i){
    if(i>=qs.length){S.flags.puel_food=1;S.items.kofke+=2;persist();sfx('lvl');
      return say([praise(),L('Domo','Kümey! Iaymi charki?','¡Bien! ¿Comes charki?','Good! Will you have some charki?'),N('Te da dos kofke para el camino.','She gives you two kofke for the road.')])}
    const q=qs[i];const o=q.o.map(m=>({m,v:m}));for(let a=o.length-1;a>0;a--){const b=rnd(a+1);[o[a],o[b]]=[o[b],o[a]]}
    choose(q.q,o,v=>{if(v===q.a){sfx('ok');ask(i+1)}else{sfx('bad');say([L('Domo','Fey no...','Eso no...','Not that...')],()=>ask(0))}},true,false)}
}
function kusheTalk(){
  const ls=[L('Kushe Millaray','Konpange, konpange!','¡Pasa, pasa!','Come in, come in!'),
    L('Kushe Millaray','Kuyfi, tüfachi mapu mew, ngen mülerkey.','Dicen que hace tiempo, en esta tierra, había un ngen.','They say that long ago, in this land, there was a ngen.'),
    L('Kushe Millaray','Fütra pasto mülerkefuy. Luan mülerkefuy.','Dicen que había pasto alto. Que había guanacos.','They say there was tall grass. That there were guanacos.'),
    L('Kushe Millaray','Walichu akuy... fey kom ñamrkey.','Llegó el Walichu... y dicen que todo se fue perdiendo.','The Walichu came... and they say it all began to be lost.'),
    N('La kushe habla con -rke-: todo lo que cuenta lo supo de los más viejos. Así viajan los epew: de boca en boca, con -rke- adentro.','The old woman speaks with -rke-: everything she tells she learned from her elders. That is how epew travel: from mouth to mouth, with -rke- inside.')];
  if(!S.flags.puel_kushe){S.flags.puel_kushe=1;S.items.kofke++;persist();sfx('pick');
    ls.push(L('Kushe Millaray','Kofke eluayu. Inge, pichi weche!','Te doy un kofke. ¡Come!','I will give you a kofke. Eat!'));}
  say(ls);
}
function mallinTalk(){
  const en=S.gloss==='en';
  if(S.flags.puel_mallin)return say([L('Challwafe','Wüle ka yepan ko. Pewkayal!','Mañana vengo a buscar agua otra vez. ¡Hasta luego!','Tomorrow I will come for water again. See you later!')]);
  const qs=[{q:L('Challwafe','Wiya challwatu___','Ayer fui a pescar (allá, y volví).','Yesterday I went fishing (over there, and came back).'),o:['challwatun','challwatumen','challwatupan'],a:'challwatumen'},
    {q:L('Challwafe','Ko ye___','Vine a buscar agua (hacia acá).','I came here to fetch water.'),o:['yemen','yepan','yen'],a:'yepan'},
    {q:L('Challwafe','Wüle kintu___','Mañana iré a buscar (allá).','Tomorrow I will go looking (over there).'),o:['kintupayan','kintumean','kintuan'],a:'kintumean'}];
  say([L('Challwafe','Mari mari, '+addr(false)+'. Malliñ mew küdawkülen.','Hola. Estoy trabajando en el mallín.','Hello. I am working in the wet meadow.'),
    N('El pescador va y viene entre el lof y el mallín, y sus verbos van y vienen con él: -me- es ir a hacer algo allá; -pa- es hacia acá. Ayúdalo a terminar los verbos.','The fisherman comes and goes between the lof and the meadow, and his verbs come and go with him: -me- is going to do something over there; -pa- is toward here. Help him finish the verbs.')],()=>ask(0));
  function ask(i){
    if(i>=qs.length){S.flags.puel_mallin=1;S.items.lawen++;S.items.kofke++;S.gold+=30;S.xp+=4;persist();sfx('lvl');
      return say([praise(),L('Challwafe','Chaltu may!','¡Gracias!','Thank you!'),N('Te da un lawen, un kofke y küla mari (30) ngülliw. +4 kimün.','He gives you a lawen, a kofke and küla mari (30) ngülliw. +4 kimün.')],()=>{if(S.xp>=xpNeed())levelUpCheck()})}
    const q=qs[i];choose(q.q,q.o.map(o=>({m:o,v:o})).concat([{m:'Chillka',g:en?'Check the book':'Consultar el libro',v:'_book'}]),v=>{
      if(v==='_book')return openBook(()=>ask(i));
      if(v===q.a){sfx('ok');ask(i+1)}else{sfx('bad');say([L('Challwafe','Fey no...','Eso no...','Not that...'),N('Piensa: ¿fue allá, o vino acá?','Think: did he go there, or come here?')],()=>ask(0))}},false,false)}
}
function chadifeTalk(){
  const ls=[L('Chadife','Mari mari, '+addr(true)+'. Chadi ngillakan.','Hola. Junto sal.','Hello. I gather salt.'),
    N('Del salitral sale la chadi (sal) para todo Puelmapu: para el charki, para el kofke, para cambiar por ngülliw. El agua se va y la sal se queda.','From the salt flat comes the chadi (salt) for all Puelmapu: for the charki, for the bread, to trade for ngülliw. The water leaves and the salt stays.')];
  if(S.flags.sb5)ls.push(L('Chadife','Lif ngey ti chadi! Chaltu may.','¡La sal quedó limpia! Gracias.','The salt is clean again! Thank you.'));
  else if(S.flags.ngen5)ls.push(N('«Pero algo pasa junto a las pozas blancas: de noche, la tierra blanda tiembla, y nadie se atreve a pisarla...»','"But something is wrong beside the white pools: at night the soft ground trembles, and no one dares to walk on it..."'));
  say(ls);
}
function kona5Talk(){
  if(S.flags.ngen5)return say([L('Kona','Walichu ngewelay! Lelfün karüwetuay.','¡Ya no está el Walichu! La pampa volverá a verdear.','The Walichu is gone! The plain will turn green again.')]);
  say([L('Kona','Walichu müley chenke mew! Umawtulen miawkey.','¡El Walichu está en el chenque! Anda caminando dormido.','The Walichu is in the chenque! It walks about asleep.'),
    N('El chenque baja entre las piedras, aquí al lado. Dicen que adentro hay piedras con números enormes, una puerta con llave, y otra piedra que pregunta de quién son las cosas. Y al fondo, el Walichu, envuelto en su sueño gris: a ese, dicen, primero hay que despertarlo.','The chenque goes down among the rocks, right here. They say inside there are stones with huge numbers, a locked door, and another stone that asks whose things are whose. And at the bottom, the Walichu, wrapped in its grey dream: that one, they say, must first be woken.')]);
}
function ngoymanTalk(){
  say([L('Kushe ñi am','Akuymi, pichi weche... Afpun rüpü mew akuymi.','Llegaste... Llegaste al final del camino.','You have come... You have come to the end of the road.'),
    N('La figura es apenas niebla con forma de persona. Pero te mira con un cariño muy viejo, y la niebla no se atreve a tocarla.','The figure is barely fog in the shape of a person. But it looks at you with a very old tenderness, and the fog does not dare touch it.'),
    L('Kushe ñi am','Kechu trokiñ, kechu mapu, kiñe trariwe.','Cinco trokiñ, cinco tierras, un solo trariwe.','Five trokiñ, five lands, one single trariwe.'),
    N('«Despertaste a los cinco ngen y tejiste de nuevo lo que el olvido había cortado. Detrás de mí duerme Ti Fütra Ngoyman, el gran olvido. Su puerta se abrirá pronto... y tus palabras serán tu única arma.»','"You woke the five ngen and wove back together what forgetting had cut apart. Behind me sleeps Ti Fütra Ngoyman, the great forgetting. Its door will open soon... and your words will be your only weapon."'),
    N('(Fin del prototipo: la batalla final contra Ti Fütra Ngoyman llegará en la próxima versión. ¡Chaltu may por jugar!)','(End of the prototype: the final battle against Ti Fütra Ngoyman will come in the next version. Chaltu may for playing!)')]);
}
