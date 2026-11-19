/* ============================================================
   INPUT
   ============================================================ */
const held={up:0,down:0,left:0,right:0};
const DK={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',w:'up',s:'down',a:'left',d:'right',W:'up',S:'down',A:'left',D:'right'};
addEventListener('keydown',e=>{
  if(e.target&&e.target.tagName==='INPUT')return;
  auInit();
  const d=DK[e.key];
  if(d){e.preventDefault();held[d]=1;if(active&&active.mv&&(!e.repeat||frame%3===0))active.mv(d==='up'||d==='left'?-1:1);return}
  if(e.repeat)return;
  if(['z','Z','Enter',' '].includes(e.key)){e.preventDefault();pressA()}
  else if(['x','X','Escape','Backspace'].includes(e.key)){e.preventDefault();pressB()}
  else if(e.key==='m'||e.key==='M'){if(mode==='map'&&!active)openPause()}
  else if(e.key==='n'||e.key==='N')toggleMute();
});
addEventListener('keyup',e=>{const d=DK[e.key];if(d)held[d]=0});
addEventListener('pointerdown',()=>auInit(),{capture:true});
function pressA(){if(active)active.a();else if(mode==='map')interact()}
function pressB(){if(mode==='cut'){skipCut();return}if(active){active.b&&active.b()}else if(mode==='map')openPause()}
document.querySelectorAll('#dpad button').forEach(b=>{const d=b.dataset.d;
  b.addEventListener('pointerdown',e=>{e.preventDefault();held[d]=1;if(active&&active.mv)active.mv(d==='up'||d==='left'?-1:1)});
  for(const ev of ['pointerup','pointerleave','pointercancel'])b.addEventListener(ev,()=>held[d]=0)});
$('pA').addEventListener('pointerdown',e=>{e.preventDefault();pressA()});
$('pB').addEventListener('pointerdown',e=>{e.preventDefault();pressB()});
$('pM').addEventListener('pointerdown',e=>{e.preventDefault();if(mode==='map'&&!active)openPause()});
$('pN').addEventListener('pointerdown',e=>{e.preventDefault();toggleMute()});
function heldDir(){for(const d of ['up','down','left','right'])if(held[d])return d;return null}
const DV={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
const OPP={up:'down',down:'up',left:'right',right:'left'};

/* ============================================================
   MAP LOGIC
   ============================================================ */
function tryMove(d){
  P.dir=d;const [dx,dy]=DV[d],nx=P.x+dx,ny=P.y+dy;
  if(!inB(nx,ny))return edge(d);
  const e=entAt(nx,ny);
  if(e){if(e.kind==='enemy')engage(e);return}
  const c=grid[ny][nx];
  if(M.doors&&M.doors[nx+','+ny]&&d==='up'){const D=M.doors[nx+','+ny];sfx('door');loadMap(D.to,D.x,D.y);return}
  if(c==='B')return pushBlock(nx,ny,dx,dy);
  if(c==='L')return unlock(nx,ny);
  if(c==='E'){if(!P.bump){P.bump=1;say([N('Una puerta de piedra tallada. No se mueve: algo cerca debe abrirla.','A carved stone door. It will not move: something nearby must open it.')])}return}
  if(c==='G'){if(!P.bump){P.bump=1;sfx('bad');say([N('Una reja de hierro cierra el paso. Quizás alguna losa del suelo la abre.','An iron gate blocks the way. Perhaps a stone plate on the floor opens it.')])}return}
  P.bump=0;
  if(!walk(nx,ny))return;
  P.ox=P.x;P.oy=P.y;P.x=nx;P.y=ny;P.t=0;P.moving=true;P.spd=S.pw.speed>0?.22:.125;
}
function pushBlock(bx,by,dx,dy){
  const tx=bx+dx,ty=by+dy;if(!inB(tx,ty)||entAt(tx,ty))return;const t=grid[ty][tx];
  if(!(t===M.floor||t==='O'))return;
  grid[by][bx]=M.floor;grid[ty][tx]=t==='O'?'Q':'B';sfx('drag');
  if(t==='O'){sfx('door');let left=0;for(const r of grid)for(const ch of r)if(ch==='O')left++;
    if(!left){S.flags['gate:'+CUR]=1;for(let y=0;y<M.h;y++)for(let x=0;x<M.w;x++)if(grid[y][x]==='G')grid[y][x]=M.floor;sfx('lvl');persist();
      say([N('¡Clac! Se oye cómo se levanta una reja de hierro.','Clack! You hear an iron gate rising.')])}
    else say([N('La losa se hunde con un ruido sordo. Falta otra.','The plate sinks with a dull thud. Another one is still missing.')])}
}
function pullBlock(bx,by,dx,dy){
  const px2=P.x-dx,py2=P.y-dy;
  if(!inB(px2,py2)||!walk(px2,py2)||entAt(px2,py2)||grid[P.y][P.x]!==M.floor)
    return say([N('Un bloque de piedra. Puedes empujarlo caminando contra él, o tirar de él con (A) si tienes espacio detrás de ti.','A stone block. Push it by walking into it, or pull it with (A) if there is room behind you.')]);
  grid[by][bx]=M.floor;grid[P.y][P.x]='B';sfx('drag');
  P.ox=P.x;P.oy=P.y;P.x=px2;P.y=py2;P.t=0;P.moving=true;P.spd=.125;
}
function unlock(x,y){
  if(S.keys>0){S.keys--;setTileFlag(x,y);sfx('door');persist();say([N('Usas una llave. La puerta se abre.','You use a key. The door opens.')])}
  else if(!P.bump){P.bump=1;sfx('bad');say([N('Una puerta con cerradura. Necesitas una llave pequeña.','A locked door. You need a small key.')])}
}
function edge(d){
  const E=M.edges&&M.edges[d];if(!E)return;
  if(E.need){const n=(S.pieces||[]).length;if(P.bump)return;P.bump=1;
    return say([N('Una niebla gris y espesa cubre el camino hacia el oeste. Ahí las palabras se borran: es la niebla de Ti Fütra Ngoyman, el gran olvido.','A thick grey fog covers the road west. Words fade inside it: it is the fog of Ti Fütra Ngoyman, the great forgetting.'),
      L('','Trariwe trokiñ: '+n+'/'+E.need,'Solo un trariwe completo puede atravesarla. Tienes '+n+' de '+E.need+' trokiñ: uno por cada tierra (Lafkenche, Nagche, Pewenche, Williche, Puelmapu).','Only a complete trariwe can pass through it. You have '+n+' of '+E.need+' trokiñ: one for each land (Lafkenche, Nagche, Pewenche, Williche, Puelmapu).')])}
  if(E.req&&!S.flags[E.req]){say(E.reqMsg);return}
  loadMap(E.to,E.x,E.y);
}
function setTileFlag(x,y){S.flags['t:'+CUR+':'+x+','+y]=1;grid[y][x]=M.floor}
function onStep(){
  const c=grid[P.y][P.x];P.bump=0;
  if(c==='A'){warpMenu();return}
  if(c==='S'){const st=M.stairs;if(!st)return;if(st.req&&!S.flags[st.req]){say(st.reqMsg);return}sfx('door');loadMap(st.to,st.x,st.y);return}
  if(c==='P'){setTileFlag(P.x,P.y);gainPiwke([]);return}
  if(c==='k'){setTileFlag(P.x,P.y);S.keys++;sfx('pick');persist();say([N('¡Encontraste una llave pequeña!','You found a small key!')]);return}
  if(c==='m'){grid[P.y][P.x]=M.floor;S.pw.speed=60*25;sfx('pick');say([L('','Mañke','Una pluma de mañke (cóndor): corres más rápido por un rato.','A mañke (condor) feather: you run faster for a while.')]);return}
  if(c==='g'){grid[P.y][P.x]=M.floor;S.pw.gold=1;sfx('pick');say([L('','Milla ngülliw','Un ngülliw de oro (milla): la próxima pelea da el doble de ngülliw.','A golden ngülliw (milla): your next fight pays double ngülliw.')]);return}
  if(c==='p'){grid[P.y][P.x]=M.floor;S.pw.pewen=60*20;sfx('pick');say([L('','Pewen','Un cono de pewen: por un rato, los wekufü se apartan de ti.','A pewen cone: for a while, the wekufü keep away from you.')]);return}
}
function gainPiwke(pre){
  S.piwke++;const full=S.piwke%4===0;sfx(full?'lvl':'pick');
  if(full)S.hp=Math.min(maxHP(),S.hp+HPQ);
  persist();
  say(pre.concat([L('','Piwke!',full?'¡Juntaste cuatro pedazos de piwke! Ganas un corazón nuevo.':'Encontraste un pedazo de piwke ('+(S.piwke%4)+'/4). Con cuatro ganas un corazón.',
    full?'You gathered four piwke pieces! You gain a new heart.':'You found a piwke piece ('+(S.piwke%4)+'/4). Four make a new heart.')]));
}
function interact(){
  const [dx,dy]=DV[P.dir],tx=P.x+dx,ty=P.y+dy;
  const e=entAt(tx,ty);
  if(e){if(e.kind==='npc'){e.dir=OPP[P.dir];e.wait=Math.max(e.wait,90);sfx('ok');e.talk()}else if(e.kind==='animal'){e.wait=120;sfx('ok');animalTalk(e)}else engage(e);return}
  const dk=P.x+','+P.y,dv=M.digs&&M.digs[dk];
  if(dv&&!(dv.req&&!S.flags[dv.req])&&!S.flags['dig:'+CUR+':'+dk]&&(!inB(tx,ty)||WALK.has(grid[ty][tx])||grid[ty][tx]==='T'||grid[ty][tx]==='#'||grid[ty][tx]==='~'))return digFind(dk,dv);
  if(!inB(tx,ty))return;
  const c=grid[ty][tx],k=tx+','+ty;
  if(c==='F')return fireSave();
  if(c==='I'&&M.signs&&M.signs[k])return say(M.signs[k]);
  if(c==='C')return openChest(tx,ty,M.chests&&M.chests[k]);
  if(c==='K'&&M.konew&&M.konew[k])return konew(tx,ty,M.konew[k]);
  if(c==='L')return unlock(tx,ty);
  if((c==='N'||c==='J')&&M.pz&&M.pz.tiles[k])return pzTouch(tx,ty);
  if(c==='H'&&M.stones&&M.stones[k])return stoneTalk(M.stones[k]);
  if(c==='E')return say([N('Una puerta de piedra tallada. Algo cerca debe abrirla.','A carved stone door. Something nearby must open it.')]);
  if(c==='B')return pullBlock(tx,ty,dx,dy);
  if(c==='V')return say([L('','Mari mari · Kiñe, epu, küla','Una pizarra con palabras en mapudungun: "hola" y "uno, dos, tres".','A board with words in Mapudungun: "hello" and "one, two, three".')]);
  if(c==='Z')return say([L('','Witral','Un witral, el telar mapuche. El tejido muestra figuras escalonadas en rojo, negro y blanco.','A witral, the Mapuche loom. The weaving shows stepped figures in red, black and white.')]);
  if(c==='U')return say([L('','Iyael','La olla hierve sobre el fuego. Huele a comida.','The pot simmers over the fire. It smells like food.')]);
  if(c==='^')return say([N('Un montón de nieve dura te cierra el paso. Necesitas el newen de Ngen-pewen.','A heap of hard snow blocks your way. You need the newen of Ngen-pewen.')]);
  if(c==='Ñ')return say([N('Un zarzal lleno de espinas te cierra el paso. Necesitas el newen de Ngen-mawida.','A bramble full of thorns blocks your way. You need the newen of Ngen-mawida.')]);
  if(c==='M')return kulonBush(tx,ty);
  if(c==='x')return pickSpot(tx,ty);
  if(c==='W')return say([L('','Kachilla','Un campo de kachilla (trigo) dorado, listo para cosechar.','A field of golden kachilla (wheat), ready for harvest.')]);
  if(c==='f')return say([N('Una cerca de palos.','A wooden fence.')]);
  if(c==='Y')return say([N('El paliwe, la cancha de palin. Mejor no interrumpir el partido.','The paliwe, the palin field. Better not interrupt the game.')]);
  if(c==='X')return say([N('Un remolino de viento te empuja hacia atrás. Necesitas el newen de Ngen-kürüf'+(M.region==='williche'?'.':' (otra región).'),'A whirl of wind pushes you back. You need the newen of Ngen-kürüf'+(M.region==='williche'?'.':' (another region).'))]);
  if(c==='v'){const what=M.dive&&M.dive[k];
    if(!S.flags.dive)return say([N('Un remolino oscuro en el agua. Es muy profundo para bajar... por ahora.','A dark whirlpool in the water. It is too deep to go down... for now.')]);
    if(S.flags['dive:'+CUR])return say([N('El agua está tranquila.','The water is calm.')]);
    S.flags['dive:'+CUR]=1;persist();
    const pre=[N('Con el newen de Ngen-lafken te sumerges en el remolino...','With the newen of Ngen-lafken you dive into the whirlpool...')];
    if(what==='piwke')return gainPiwke(pre);
    S.gold+=50;sfx('lvl');return say(pre.concat([L('','Kechu mari ngülliw!','Encontraste un tesoro escondido: kechu mari (50) ngülliw.','You found a hidden treasure: kechu mari (50) ngülliw.')]))}
}
function npcStep(e){
  if(!e.path)return;
  if(e.wait>0){e.wait--;e.mv=false;return}
  const [tx,ty]=e.path[e.pi];
  if(e.x===tx&&e.y===ty){e.pi=(e.pi+1)%e.path.length;e.wait=e.pause||30;e.mv=false;if(e.act==='cook'&&e.pi===1)e.dir='right';return}
  if(--e.cd>0)return;e.cd=e.spd||16;
  const d=e.x!==tx?(tx>e.x?'right':'left'):(ty>e.y?'down':'up');const [dx,dy]=DV[d],nx=e.x+dx,ny=e.y+dy;
  e.dir=d;
  if((nx===P.x&&ny===P.y)||entAt(nx,ny,e)){e.mv=false;return}
  e.x=nx;e.y=ny;e.mv=true;
}
function updateMap(){
  if(S.pw.speed>0)S.pw.speed--;if(S.pw.pewen>0)S.pw.pewen--;if(grace>0)grace--;
  if(P.moving){P.t+=P.spd;if(P.t>=1){P.moving=false;P.fx=P.x;P.fy=P.y;onStep()}else{P.fx=P.ox+(P.x-P.ox)*P.t;P.fy=P.oy+(P.y-P.oy)*P.t}}
  if(!P.moving&&!active&&mode==='map'){const d=heldDir();if(d)tryMove(d)}
  for(const e of ents){const sp=e.kind==='enemy'?.25:.18;e.fx+=(e.x-e.fx)*sp;e.fy+=(e.y-e.fy)*sp;if(Math.abs(e.x-e.fx)<.02)e.fx=e.x;if(Math.abs(e.y-e.fy)<.02)e.fy=e.y}
  if(active||mode!=='map')return;
  for(const e of ents){
    if(e.kind==='npc'){npcStep(e);continue}
    if(e.kind==='animal'){animalStep(e);continue}
    if(e.fixed)continue;
    if(--e.cd>0)continue;e.cd=24+rnd(36);
    const dist=Math.abs(e.x-P.x)+Math.abs(e.y-P.y);let d;
    const toward=()=>Math.abs(P.x-e.x)>Math.abs(P.y-e.y)?(P.x>e.x?'right':'left'):(P.y>e.y?'down':'up');
    if(S.pw.pewen>0&&dist<=5)d=OPP[toward()];
    else if(dist<=4&&Math.random()<.65)d=toward();else d=['up','down','left','right'][rnd(4)];
    const [dx,dy]=DV[d],nx=e.x+dx,ny=e.y+dy;
    if(nx===P.x&&ny===P.y){if(S.pw.pewen<=0&&grace<=0&&!P.moving){engage(e);return}continue}
    if(walk(nx,ny)&&!entAt(nx,ny,e)&&grid[ny][nx]!=='S'&&!(P.moving&&nx===P.x&&ny===P.y)){e.x=nx;e.y=ny}
  }
  for(const sc of SCN)if(sc.type==='palin'){
    const X=sc.x*T,Y=sc.y*T,w=sc.w*T,h=sc.h*T;
    sc.bx=X+w/2+Math.sin(frame/70)*(w/2-14)+Math.sin(frame/23)*8;sc.by=Y+h/2+Math.sin(frame/41)*(h/2-8);
    sc.pl.forEach((p,i)=>{const tx=sc.bx+(i<2?-1:1)*(CT?16:10)+Math.sin(frame/30+i)*6,ty=sc.by+(i%2?1:-1)*(CT?11:8);const dx=tx-p.x,dy=ty-p.y;p.x+=dx*.035;p.y+=dy*.035;p.mv=Math.abs(dx)+Math.abs(dy)>3;if(Math.abs(dx)>1)p.dir=dx>0?'right':'left'});
  }
}
