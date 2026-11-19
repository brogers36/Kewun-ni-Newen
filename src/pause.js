/* ============================================================
   PAUSE MENU
   ============================================================ */
function openPause(){
  const en=S.gloss==='en';
  choose({es:'Menú',en:'Menu'},[
    {m:'Chemkün',g:en?'Items':'Cosas',v:'items'},
    {m:'Kimün',g:en?'Status':'Estado',v:'stats'},
    {m:'Chillka',g:en?'Conjugation book':'Libro de conjugación',v:'book'},
    {m:'Dungun',g:en?'Words learned':'Palabras aprendidas',v:'words'},
    {m:'Trariwe · '+(S.pieces||[]).length+'/5',g:en?'Pieces of the ancient sash':'Pedazos del trariwe antiguo',v:'trariwe'},
    {m:en?'Hints: '+(S.hints?'on':'off'):'Pistas: '+(S.hints?'sí':'no'),g:en?'Show how many each ending addresses':'Mostrar a cuántos se dirige cada terminación',v:'hints'},
    {m:en?'Gloss: English':'Glosa: Español',g:en?'Switch to Spanish':'Cambiar a inglés',v:'lang'},
    {m:AU.muted?(en?'Music: off':'Música: no'):(en?'Music: on':'Música: sí'),g:'N',v:'mus'},
    {m:en?'Close':'Cerrar',v:'x'}],v=>{
    if(v==='items'){choose({es:'Chemkün',en:'Items'},itemOpts().concat([{m:en?'Back':'Volver',v:'x'}]),k=>{if(!k||k==='x')return;const l=useItem(k);persist();say([l])},true)}
    else if(v==='stats'){const g=Object.keys(GEAR).filter(k=>S.gear[k]).map(k=>GEAR[k].m).join(', ')||'∅';
      say([N(`${S.name} · kimün ${S.lvl} (${S.xp}/${xpNeed()}) · newen ${S.hp}/${maxHP()} · fuerza ${atk()} · defensa ${def()} · ngülliw ${numP(S.gold)} · piwke ${S.piwke%4}/4 · llaves ${S.keys||0}`+(S.curse?' · MALDICIÓN':''),
        `${S.name} · kimün ${S.lvl} (${S.xp}/${xpNeed()}) · newen ${S.hp}/${maxHP()} · strength ${atk()} · defense ${def()} · ngülliw ${numP(S.gold)} · piwke ${S.piwke%4}/4 · keys ${S.keys||0}`+(S.curse?' · CURSED':'')),
        N('Equipo: '+g,'Gear: '+g)])}
    else if(v==='words'){const ls=S.roots.map(r=>L('',ROOTS[r].m,ROOTS[r].es,ROOTS[r].en));
      ls.push(L('','-nge · -mu · -mün','a uno · a dos · a tres o más','to one · to two · to three or more'));
      if(S.runes.includes('kil'))ls.push(L('','-kil-','prohibición: "¡no...!"','prohibition: "don\'t...!"'));say(ls)}
    else if(v==='trariwe'){const R5=[['lafkenche','Lafkenche'],['nagche','Nagche'],['pewenche','Pewenche'],['williche','Williche'],['puelche','Puelmapu']];
      say([L('','Trokiñ trariwe · '+(S.pieces||[]).length+'/5',R5.map(([k,n])=>((S.pieces||[]).includes(k)?'■ ':'□ ')+n).join('   '),R5.map(([k,n])=>((S.pieces||[]).includes(k)?'■ ':'□ ')+n).join('   ')),
        N('Con los cinco trokiñ, el trariwe completo podrá atravesar la niebla de Ti Fütra Ngoyman, al oeste del camino del mar.','With all five trokiñ, the complete trariwe will be able to pass through the fog of Ti Fütra Ngoyman, west of the sea road.')])}
    else if(v==='book')openBook(()=>openPause());
    else if(v==='hints'){S.hints=!S.hints;persist();openPause()}
    else if(v==='lang'){S.gloss=S.gloss==='en'?'es':'en';LANG=S.gloss;persist();openPause()}
    else if(v==='mus'){toggleMute();openPause()}
  },true);
}

/* ---------- Chillka: conjugation book ---------- */
const BOOK={
  pers:{m:'Iñche, eymi, fey...',es:'Personas (presente)',en:'Persons (present)',lines:[
    N('Ejemplo con pe- ("ver"), que termina en vocal:','Example with pe- ("see"), which ends in a vowel:'),
    L('','iñche pen · eymi peymi · fey pey','yo veo · tú ves · él/ella ve','I see · you see · he/she sees'),
    L('','iñchiu peyu · eymu peymu · feyengu peyngu','nosotros dos vemos · ustedes dos ven · ellos dos ven','we two see · you two see · they two see'),
    L('','iñchiñ peiñ · eymün peymün · feyengün peyngün','nosotros vemos · ustedes ven · ellos ven','we see · you all see · they see'),
    N('Si la raíz termina en consonante, se agrega -i- o -ü-. Ejemplo con kon- ("entrar"):','If the root ends in a consonant, -i- or -ü- is added. Example with kon- ("enter"):'),
    L('','iñche konün · eymi konimi · fey koni','yo entro · tú entras · él/ella entra','I enter · you enter · he/she enters'),
    L('','feyengu koningu · feyengün koningün','ellos dos entran · ellos entran','they two enter · they enter')]},
  poss:{m:'Tañi, tami, ñi',es:'¿De quién es?',en:'Whose is it?',lines:[
    N('Estas palabras van antes del sustantivo y dicen de quién es.','These words go before the noun and say whose it is.'),
    L('','tañi chillka · tami chillka · ñi chillka','mi libro · tu libro · su libro (de él o de ella)','my book · your book · his / her book'),
    L('','taiñ chillka · tamün chillka','nuestro libro · el libro de ustedes','our book · your (plural) book')]},
  plur:{m:'Pu ...',es:'Dos y muchos',en:'Two and many',lines:[
    N('pu va antes del sustantivo cuando son muchas personas o animales.','pu goes before the noun when there are many people or animals.'),
    L('','pu che · pu domo · pu kawellu','la gente · las mujeres · los caballos','the people · the women · the horses'),
    N('Y el verbo cambia: -ngu para dos, -ngün para tres o más. Ejemplo con pe- ("ver"):','And the verb changes: -ngu for two, -ngün for three or more. Example with pe- ("see"):'),
    L('','epu wentru peyngu · pu wentru peyngün','dos hombres ven · los hombres ven','two men see · the men see')]},
  fu:{m:'Kuyfi · -fu-',es:'Lo que pasaba antes',en:'What used to happen',lines:[
    N('En los relatos, -fu- marca algo que pasaba o que había antes, y que ya no es así.','In stories, -fu- marks something that happened or existed before, and is no longer so.'),
    L('','mülefuy · pefun · konfuy','había, estaba · vi, había visto · entró, había entrado','there was · I saw, had seen · he/she went in, had gone in'),
    N('Con -ke- se dice lo que pasaba siempre: pekefun, «yo veía».','With -ke- you say what always happened: pekefun, «I used to see».')]},
  neg:{m:'-la-',es:'Negación',en:'Negation',lines:[
    N('-la- va antes de la terminación de persona y niega el verbo.','-la- goes before the person ending and negates the verb.'),
    L('','pelan · pelaymi · pelay','no veo · no ves · no ve','I do not see · you do not see · he/she does not see'),
    L('','konlan · konlaymi · konlay','no entro · no entras · no entra','I do not enter · you do not enter · he/she does not enter')]},
  fut:{m:'-a-',es:'Futuro',en:'Future',lines:[
    N('-a- marca lo que todavía no pasa: lo que vas a hacer.','-a- marks what has not happened yet: what you are going to do.'),
    L('','pean · peaymi · peay','veré · verás · verá','I will see · you will see · he/she will see'),
    L('','ngillayafiñ · ngillalayafiñ','lo voy a comprar · no lo voy a comprar','I will buy it · I will not buy it')]},
  imp:{m:'-nge, -mu, -mün, -kil-',es:'Órdenes (imperativo)',en:'Commands (imperative)',lines:[
    L('','amutunge · amutumu · amutumün','¡vete! (a uno) · (a dos) · (a tres o más)','go away! (to one) · (to two) · (to three or more)'),
    L('','küpakilnge · küpakilmu · küpakilmün','¡no vengas! · ¡no vengan (dos)! · ¡no vengan!','don\'t come! · (to two) · (to three or more)'),
    N('A uno solo siempre -nge, aunque haya más wekufü. A todos juntos: -mu si son dos, -mün si son tres o más.','To just one, always -nge, even if there are more wekufü. To all together: -mu if there are two, -mün if three or more.')]},
  num:{m:'Kiñe, epu, küla...',es:'Números',en:'Numbers',lines:[
    L('','kiñe 1 · epu 2 · küla 3 · meli 4 · kechu 5','',''),
    L('','kayu 6 · regle 7 · pura 8 · aylla 9 · mari 10','',''),
    L('','epu mari 20 · küla mari 30 · kechu mari 50 · pataka 100','','')]},
  col:{m:'Kelü, kallfü, lig...',es:'Colores',en:'Colors',lines:[
    L('','kelü · kallfü · lig · kurü · karü · chod','rojo · azul · blanco · negro · verde · amarillo','red · blue · white · black · green · yellow')]}};
function openBook(back){
  const en=S.gloss==='en';
  choose(L('','Chillka',en?'Your book of words. What do you want to look up?':'Tu libro de palabras. ¿Qué quieres consultar?',''),
    Object.keys(BOOK).map(k=>({m:BOOK[k].m,g:G(BOOK[k]),v:k})).concat([{m:en?'Close':'Cerrar',v:'x'}]),k=>{
      if(!k||k==='x')return back&&back();
      say(BOOK[k].lines,()=>openBook(back))},true);
}
