/* ============================================================
   INTRO CUTSCENE
   ============================================================ */
let CUT=null;
function cutLines(){const n=S.name;return[
  [N('Hace mucho tiempo, en todo Wallmapu se escuchaba mapudungun: junto al lafken (el mar), en la mawida (el monte), arriba en la cordillera.','Long ago, Mapudungun was heard all over Wallmapu: beside the lafken (the sea), in the mawida (the forest), high up in the mountains.'),
   N('La gente le hablaba a los ngen, los dueños espirituales de cada lugar: del agua, del bosque, del viento, del mar. Y los ngen respondían.','People spoke to the ngen, the spirit owners of each place: of the water, the forest, the wind, the sea. And the ngen answered.')],
  [N('Pero el silencio fue entrando, despacio. Muchas familias tuvieron que irse a la waria, la ciudad. En las escuelas castigaban a los niños por hablar mapudungun, y muchos padres dejaron de enseñarlo.','But silence crept in, slowly. Many families had to move to the waria, the city. In schools children were punished for speaking Mapudungun, and many parents stopped teaching it.'),
   N('Con el silencio llegó una niebla de olvido: Ti Fütra Ngoyman, el gran olvido. Donde pasa, las palabras se borran, los nütram (las conversaciones) se apagan y los nombres de las cosas se pierden.','With the silence came a fog of forgetting: Ti Fütra Ngoyman, the great forgetting. Wherever it passes, words fade, the nütram (conversations) die out, and the names of things are lost.')],
  [N('Tú eres '+n+'. Naciste en Santiago: eres wariache, mapuche de la ciudad. Entiendes algunas palabras de tu kuku, pero casi no hablas la lengua.','You are '+n+'. You were born in Santiago: you are wariache, a Mapuche person of the city. You understand a few of your kuku\'s words, but you hardly speak the language.')],
  [N('Sin nadie que les hable, los ngen se quedaron dormidos y callados. Y en su silencio despertaron los wekufü: el chon chon, el laftrache, el anchimallén... y otros peores.','With no one to speak to them, the ngen fell asleep and went silent. And in their silence the wekufü awoke: the chon chon, the laftrache, the anchimallén... and worse.'),
   N('Los wekufü no le temen a la fuerza. Le temen a la lengua: solo se van cuando se les habla bien, en mapudungun.','The wekufü do not fear strength. They fear the language: they only leave when they are spoken to properly, in Mapudungun.')],
  [L('Kuku','Küpange, '+n+'!','"¡Ven, '+n+'!" Tu kuku te llama desde la costa lafkenche. (küpa- es "venir"; -nge le habla a una persona.)','"Come, '+n+'!" Your kuku calls you from the Lafkenche coast. (küpa- means "come"; -nge speaks to one person.)'),
   N('Es hora de volver. Aprende la lengua, despierta a los ngen uno por uno y devuélvele la voz a tu pueblo: a su lengua y a su cultura.','It is time to go back. Learn the language, wake the ngen one by one, and give your people back their voice: their language and their culture.')]
];}
function startCut(){mode='cut';CUT={i:0,t:0,L:cutLines()};$('skip').style.display='block';playSong('epew');nextCut()}
function nextCut(){if(!CUT)return;if(CUT.i>=CUT.L.length)return endCut();CUT.t=0;const ls=CUT.L[CUT.i];say(ls,()=>{if(!CUT)return;CUT.i++;nextCut()})}
function skipCut(){if(!CUT)return;dlg.style.display='none';active=null;endCut()}
function endCut(){CUT=null;$('skip').style.display='none';mode='map';loadMap('rupu',1,6,true);showBanner(M.name,G(M.g));setTimeout(()=>{if(!active)introScript()},400)}
$('skip').addEventListener('click',()=>skipCut());
