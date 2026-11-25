/* ============================================================
   DEFEAT ANIMATIONS of the Santiago wardens and the Yewen
   Each one plays after the boss falls and before the victory text: the painted sprite itself comes
   apart (wings, plates, paper) instead of fading out. A or B skips to the end.
   ============================================================ */
const DEFEAT={
  // the fillantü: the clock ticks again and races to catch up, the ear-wings stall, the head drops and
  // bounces, the zipper opens by itself on one quiet word, and the head crumples away like old paper
  fillantu:{T:300,
    base:()=>tplCanvas('fillantu@b',0,1),
    mouth:[102,93],clock:[100,135],roots:[[72,64],[130,64]],cuts:[72,130],cutY:100},
  // Ngoyngoyün: the speaker-eye feeds back and cracks, the stacks vent steam and soot, the legs buckle one by one,
  // the hull drops on its belly, the plates slide off, and from inside comes music and voices speaking Mapudungun
  ngoyngoyun:{T:330,base:()=>tplCanvas('ngoyngoyun@b',0,1),eye:[78,58],stacks:[[57,22],[97,22]],legY:104,cutX:78},
  // Ngamleftripael: the eight legs let go and pull back into the body one at a time, the snapped threads between them
  // glow and knot into a web of light, and the body sinks away into the floor like a train leaving the station
  ngamlef:{T:330,base:()=>tplCanvas('ngamlef@b',0,1),ctr:[88,74],head:[75,80,23,23],abd:[121,62,31,39]},
  // Yewen: the stitches across its mouth snap one by one, the padlock clicks open and the key falls, the staff topples,
  // the ghostfire turns from magenta to daylight gold, the cloak empties and collapses, and an ordinary tired figure
  // straightens up and walks away
  yewen:{T:360,base:()=>tplCanvas('yewen@b',0,1),stitches:[39,41,43,45,47,49,51],stY:24,lock:[62,0,78,19],staffX:[67,73],staffFoot:[70,108]}
};
function defStart(e){B.defA={t:0,e,k:e.t,T:DEFEAT[e.t].T};const d=document.getElementById('dlg');if(d)d.style.display='none';active=null}
function defSkip(){const A=B.defA;if(A&&!A.done&&A.t<A.T-20)A.t=A.T-20}
function defTick(f,v){tone('square',f,f,.018,v||.07)}

// cut the boss's own painted sprite into pieces, mirrored the way battle draws it (facing the hero)
function defPieces(D){
  const base=D.base(),W=base.width,H=base.height;
  const mir=document.createElement('canvas');mir.width=W;mir.height=H;const mg=mir.getContext('2d');mg.translate(W,0);mg.scale(-1,1);mg.drawImage(base,0,0);
  const cutA=W-D.cuts[1],cutB=W-D.cuts[0];                  // mirrored x of the two cuts
  const piece=(clip)=>{const k=document.createElement('canvas');k.width=W;k.height=H;const g=k.getContext('2d');g.save();g.beginPath();clip(g);g.clip();g.drawImage(mir,0,0);g.restore();return k};
  const wingL=piece(g=>g.rect(0,0,cutA,D.cutY)),wingR=piece(g=>g.rect(cutB,0,W-cutB,D.cutY));
  const body=piece(g=>{g.rect(cutA,0,cutB-cutA,H);g.rect(0,D.cutY,W,H-D.cutY)});
  const paper=cv=>{const k=document.createElement('canvas');k.width=W;k.height=H;const g=k.getContext('2d');g.filter='grayscale(1) contrast(.75) brightness(2.6) sepia(.55)';g.drawImage(cv,0,0);return k};
  // pixels for the paper flakes
  let px=null;try{px=mg.getImageData(0,0,W,H).data}catch(err){}
  return {mir,W,H,wingL,wingR,body,pL:paper(wingL),pR:paper(wingR),pB:paper(body),px,rootL:[W-D.roots[1][0],D.roots[1][1]],rootR:[W-D.roots[0][0],D.roots[0][1]],
    mouth:[W-D.mouth[0],D.mouth[1]],clock:[W-D.clock[0],D.clock[1]]};
}

function drawDefeat(c){
  const A=B.defA;if(!A||A.done)return;const D=DEFEAT[A.k],e=A.e;
  if(A.k==='fillantu'&&!A.P){A.P=defPieces(D);A.x0=(e._cx||72)-Math.round(A.P.W/2);A.y0=e._y!=null?e._y:20;A.gy=(e._bse||138)+4;A.vy=0;A.dy=0;A.flakes=[];A.dust=[];A.f=frame}
  // advance on the game's 60 Hz clock, not on screen refreshes, so a slow phone sees the same timing
  const n=Math.max(0,Math.min(6,frame-A.f));A.f=frame;
  const st={fillantu:stepDefFillantu,ngoyngoyun:stepDefNgoy,ngamlef:stepDefNgam,yewen:stepDefYewen}[A.k],dr={fillantu:drawDefFillantu,ngoyngoyun:drawDefNgoy,ngamlef:drawDefNgam,yewen:drawDefYewen}[A.k];
  if(A.k!=='fillantu'&&!A.Q){A.Q=defBase(D);A.parts=[];A.dust=A.dust||[];A.init=0}
  if(A.k!=='fillantu'&&!A.init)st(A,D);
  for(let i=0;i<n&&A.t<A.T;i++){A.t++;st(A,D)}
  dr(c,A,D);
  if(A.t>=A.T){A.done=1;A.e.dead=true;A.e.fadeT=0;victory()}
}

const SSd=x=>x<=0?0:x>=1?1:x*x*(3-2*x);
// phases (ticks at 60 Hz): 0-60 the clock races, 60-105 the wings stall, 105-160 the fall and the bounce,
// 160-215 the zipper opens on one word, 215-300 the head crumples into paper and drifts away
function stepDefFillantu(A){
  const P=A.P,t=A.t;
  if(t<60){const sp=Math.pow(t/60,2.2);if(t%Math.max(3,Math.round(14-sp*11))===0)defTick(1800+sp*900,.05+sp*.05)}
  if(t>=95&&t<215){
    if(!A.rest){A.vy+=.32;A.dy+=A.vy}
    const b2=A.y0+A.dy+P.H*.86;
    if(b2>=A.gy&&A.vy>0){A.dy-=b2-A.gy;
      if(!A.landed){A.landed=1;A.landT=t;A.vy=-A.vy*.32;B.shake=10;sfx('hit');noiseBurst(.25,.18,200);
        for(let k=0;k<22;k++)A.dust.push({x:A.x0+P.W*(.3+.4*Math.random()),y:A.gy,vx:(Math.random()-.5)*2.4,vy:-Math.random()*1.2,r:3+Math.random()*4,l:40+Math.random()*30})}
      else{A.vy=0;A.rest=1}}}
  if(t===160)sfx('heal');
  for(const d of A.dust){d.x+=d.vx;d.y+=d.vy;d.vx*=.96;d.vy+=.02;d.l--}
  const cr=SSd((t-215)/55),sx=1+cr*.08,sy=(1-cr*.72),gy0=A.y0+A.dy+P.H*.86;
  if(t>=220&&t<280&&P.px&&t%2===0){for(let k=0;k<5;k++){const sx2=Math.floor(Math.random()*P.W),sy2=Math.floor(Math.random()*P.H),i=(sy2*P.W+sx2)*4;
      if(P.px[i+3]<120)continue;
      const g=(P.px[i]+P.px[i+1]+P.px[i+2])/3,pc=Math.round(170+g*.3);
      A.flakes.push({x:A.x0+P.W/2+(sx2-P.W/2)*sx,y:gy0+(sy2-P.H*.86)*sy,vx:(Math.random()-.4)*.8,vy:-.3-Math.random()*.6,ph:Math.random()*6,col:'rgb('+pc+','+Math.round(pc*.93)+','+Math.round(pc*.8)+')',l:70+Math.random()*40,s:1+Math.round(Math.random())})}}
  for(const f of A.flakes){f.l--;f.vy=Math.min(.7,f.vy+.02);f.x+=f.vx+Math.sin(t/9+f.ph)*.45;f.y+=f.vy}
}
function drawDefFillantu(c,A){
  const P=A.P,t=A.t;
  const ang=t>=60?SSd((t-60)/45)*.62:0,shake=t<60&&t>20?(t%4<2?1:-1):0;
  const squash=A.landed&&t<A.landT+16?1-Math.max(0,.1-(t-A.landT)*.006):1;
  const X=A.x0+shake,Y=A.y0+A.dy;
  const cr=SSd((t-215)/55),alpha=t<250?1:Math.max(0,1-(t-250)/30);
  const sy=squash*(1-cr*.72),sx=1+cr*.08,G0=Y+P.H*.86,yy=v=>G0+(v-P.H*.86)*sy;
  const drawP=(cv,rot,rx,ry)=>{c.save();c.translate(X+P.W/2,G0);c.scale(sx,sy);c.translate(-P.W/2,-P.H*.86);
    if(rot){c.translate(rx,ry);c.rotate(rot);c.translate(-rx,-ry)}c.drawImage(cv,0,0);c.restore()};
  // the painted head, crossfading into the same head as old paper while it crumples
  c.save();c.globalAlpha=alpha*(1-cr);
  if(alpha*(1-cr)>0){drawP(P.wingL,-ang,P.rootL[0],P.rootL[1]);drawP(P.wingR,ang,P.rootR[0],P.rootR[1]);drawP(P.body,0)}
  c.globalAlpha=alpha*cr;
  if(cr>0){drawP(P.pL,-ang,P.rootL[0],P.rootL[1]);drawP(P.pR,ang,P.rootR[0],P.rootR[1]);drawP(P.pB,0)}
  c.restore();
  // the clock comes back to life: a lit face over the old one, its hand racing round
  if(t<215){const cx=X+P.clock[0],cy=yy(P.clock[1]);
    const turns=t<60?Math.pow(t/60,2.4)*9:9+(t-60)*.02,a=turns*6.283-Math.PI/2;
    c.fillStyle='rgba(255,236,170,'+(t<60?.25+.25*Math.sin(t/3):.2).toFixed(2)+')';c.beginPath();c.arc(cx,cy,6,0,6.283);c.fill();
    c.strokeStyle='#1a1010';c.lineWidth=1;c.beginPath();c.moveTo(cx,cy);c.lineTo(cx+Math.cos(a)*4,cy+Math.sin(a)*4);c.stroke();
    if(t<60&&t%6<2){c.fillStyle='rgba(255,255,255,.8)';c.fillRect(Math.round(cx-1),Math.round(cy-7),2,2)}}
  // the zipper opens from the middle out, light leaking from the mouth, and one quiet word
  if(t>=160&&t<250){const mx=X+P.W/2+(P.mouth[0]-P.W/2)*sx,my=yy(P.mouth[1]),op=SSd((t-160)/30)*26*sx,fade=t>215?Math.max(0,1-(t-215)/30):1;
    c.fillStyle='rgba(255,246,214,'+(.9*fade).toFixed(2)+')';c.fillRect(Math.round(mx-op),Math.round(my-1),Math.round(op*2),2);
    c.fillStyle='rgba(255,226,150,'+(.35*fade).toFixed(2)+')';c.fillRect(Math.round(mx-op-2),Math.round(my-3),Math.round(op*2+4),6);
    if(t>=180){const wt=t-180,wa=Math.min(1,wt/15)*(t>232?Math.max(0,1-(t-232)/18):1);
      OV.push(()=>{ctx.save();ctx.globalAlpha=wa;txt('Mari mari.',mx,my-10-wt*.35,'#fff6d8',13,'center');ctx.restore()})}}
  for(const d of A.dust)if(d.l>0){c.fillStyle='rgba(180,170,190,'+(Math.min(1,d.l/30)*.35).toFixed(2)+')';c.beginPath();c.ellipse(d.x,d.y,d.r,d.r*.55,0,0,6.283);c.fill()}
  for(const f of A.flakes)if(f.l>0){c.globalAlpha=Math.min(1,f.l/30);R(c,Math.round(f.x),Math.round(f.y),f.s+(Math.sin(t/5+f.ph)>0?1:0),f.s,f.col)}
  c.globalAlpha=1;
}

/* ---------- shared helpers for the wardens and the Yewen ---------- */
// the boss's painted sprite mirrored as battle shows it, with its pixels, and a way to cut pieces out of it by a rule
function defBase(D){
  const base=D.base(),W=base.width,H=base.height,[mir,mg]=mk(W,H);mg.translate(W,0);mg.scale(-1,1);mg.drawImage(base,0,0);mg.setTransform(1,0,0,1,0,0);
  let px=null;try{px=mg.getImageData(0,0,W,H).data}catch(err){}
  const MX=x=>W-1-x;
  const cut=(rule,recol)=>{const [k,g]=mk(W,H);if(!px){if(!recol)g.drawImage(mir,0,0);return k}
    const im=g.createImageData(W,H),o=im.data;
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=(y*W+x)*4;if(px[i+3]<10)continue;
      if(rule(x,y,px[i],px[i+1],px[i+2])){let r=px[i],gg=px[i+1],b=px[i+2];if(recol)[r,gg,b]=recol(r,gg,b);o[i]=r;o[i+1]=gg;o[i+2]=b;o[i+3]=px[i+3]}}
    g.putImageData(im,0,0);return k};
  return {mir,W,H,px,MX,cut};
}
// draw a piece: anchored at (ax,ay) in the piece's own pixels, placed at screen (x,y), turned and scaled about the anchor
function defDraw(c,cv,x,y,o){o=o||{};c.save();if(o.alpha!=null)c.globalAlpha=Math.max(0,Math.min(1,o.alpha));if(o.filter)c.filter=o.filter;
  const ax=o.ax||0,ay=o.ay||0;c.translate(x+ax,y+ay);if(o.rot)c.rotate(o.rot);c.scale(o.sx||1,o.sy||1);c.drawImage(cv,-ax,-ay);c.restore()}
function defParts(c,A){for(const q of A.parts){if(q.l<=0)continue;c.globalAlpha=Math.min(1,q.l/(q.fl||25))*(q.a||1);
    if(q.r){c.fillStyle=q.col;c.beginPath();c.ellipse(q.x,q.y,q.r,q.r*(q.ry||.6),0,0,6.283);c.fill()}else R(c,Math.round(q.x),Math.round(q.y),q.s||1,q.s||1,q.col)}c.globalAlpha=1}
function defStepParts(A){for(const q of A.parts){if(q.l<=0)continue;q.l--;q.x+=q.vx;q.y+=q.vy;q.vy+=(q.g||0);q.vx*=(q.dr||1);if(q.gr&&q.r)q.r+=q.gr;
    if(q.floor&&q.y>q.floor){q.y=q.floor;q.vy*=-.35;q.vx*=.7}}A.parts=A.parts.filter(q=>q.l>0)}
const defNote=(c,x,y,col)=>{R(c,x,y,2,2,col);R(c,x+1,y-5,1,5,col);R(c,x+2,y-5,2,1,col)};

/* ---------- Ngoyngoyün ---------- */
// 0-60 feedback: the eye flares and whines; 60-90 the cone cracks, the stacks vent; 90-160 the legs buckle one at a time;
// 160-190 the hull drops on its belly; 190-260 the plates slide off; 230-330 music and voices rise from inside, everything fades
function stepDefNgoy(A,D){
  const Q=A.Q,t=A.t;
  if(!A.init){A.init=1;A.x0=(A.e._cx||72)-Math.round(Q.W/2);A.y0=A.e._y!=null?A.e._y:10;A.gy=(A.e._bse||138)+4;A.sink=0;
    A.up=Q.cut((x,y)=>y<D.legY);A.legs=Q.cut((x,y)=>y>=D.legY);
    A.L=Q.cut((x,y)=>y<D.legY&&x<Q.MX(D.cutX));A.Rt=Q.cut((x,y)=>y<D.legY&&x>=Q.MX(D.cutX));}
  if(t<60&&t%3===0)tone('sine',500+t*30,560+t*32,.06,.04+t/60*.05);
  if(t===60){B.flash=10;B.shake=8;sfx('shatter')}
  if(t>=60&&t<200&&t%3===0)for(const [sx,sy] of D.stacks){const x=A.x0+Q.MX(sx),y=A.y0+A.sink+sy;
    A.parts.push({x:x+(Math.random()-.5)*4,y,vx:(Math.random()-.5)*.5,vy:-.6-Math.random()*.6,r:2+Math.random()*2,gr:.06,ry:.8,col:Math.random()<.4?'rgba(40,36,40,.6)':'rgba(210,214,220,.45)',l:50,fl:40})}
  for(const k of [95,115,135,150])if(t===k){A.sink+=k===150?10:5;B.shake=6;tone('square',140,90,.12,.12);noiseBurst(.15,.12,300)}
  if(t===175){A.sink+=8;B.shake=14;sfx('hit');noiseBurst(.4,.25,150);
    for(let k=0;k<30;k++)A.parts.push({x:A.x0+Q.W*(.15+.7*Math.random()),y:A.gy-2,vx:(Math.random()-.5)*2.6,vy:-Math.random()*1.4,r:3+Math.random()*5,gr:.04,col:'rgba(170,160,150,.4)',l:60,fl:40})}
  if(t>=195&&t<210&&t%3===0)for(let k=0;k<3;k++)A.parts.push({x:A.x0+Q.W/2+(Math.random()-.5)*60,y:A.y0+A.sink+40+Math.random()*50,vx:(Math.random()-.5)*3,vy:-1.5-Math.random()*2,g:.15,col:'#e8d8a0',s:2,l:40,floor:A.gy})
  if(t===196){sfx('shatter');B.shake=8}
  if(t>=230&&t<330&&t%14===0){const nx=A.x0+Q.W/2+(Math.random()-.5)*40;A.parts.push({note:1,x:nx,y:A.y0+A.sink+70,vx:(Math.random()-.5)*.3,vy:-.5,col:['#ffe9a0','#fff6d8','#ffd0a0'][t%3],l:70,fl:30});
    const sc=[523,587,659,784,880,1047],f=sc[(t/14|0)%6];tone('triangle',f,f,.35,.06)}
  defStepParts(A);
}
function drawDefNgoy(c,A,D){
  const Q=A.Q,t=A.t,SS=SSd;
  const shake=t<60?(t%4<2?1:-1)*Math.round(t/30):0,X=A.x0+shake,Yb=A.y0+A.sink;
  const fade=t<280?1:Math.max(0,1-(t-280)/40);
  // legs: squashed down as each one gives way
  const lsq=Math.max(.25,1-A.sink/36);
  defDraw(c,A.legs,X,A.y0,{ax:0,ay:Q.H,sy:lsq,alpha:fade});
  // the upper body: whole until the plates come off, then two halves sliding and turning away
  if(t<196)defDraw(c,A.up,X,Yb,{alpha:fade});
  else{const k=t-196,dx=Math.min(34,k*.55),dy=Math.min(26,k*k*.008),r=Math.min(.38,k*.008);
    // what was inside: a warm light
    const g=c.createRadialGradient(X+Q.W/2,Yb+62,2,X+Q.W/2,Yb+62,46);g.addColorStop(0,'rgba(255,236,170,'+(.75*fade)+')');g.addColorStop(1,'rgba(255,200,120,0)');c.fillStyle=g;c.fillRect(X+Q.W/2-50,Yb+12,100,100);
    defDraw(c,A.L,X-dx,Yb+dy,{ax:Q.MX(D.cutX),ay:Q.H*.6,rot:-r,alpha:fade*(1-SS((k-60)/40))});
    defDraw(c,A.Rt,X+dx,Yb+dy,{ax:Q.MX(D.cutX),ay:Q.H*.6,rot:r,alpha:fade*(1-SS((k-60)/40))})}
  // the eye feeding back, then the cracks running out from it
  const ex=X+Q.MX(D.eye[0]),ey=Yb+D.eye[1];
  if(t<70){const a=t/60,r=4+a*10+Math.sin(t)*1.5;const g=c.createRadialGradient(ex,ey,0,ex,ey,r);g.addColorStop(0,'rgba(255,255,240,.95)');g.addColorStop(.4,'rgba(255,120,60,'+(.5+a*.4)+')');g.addColorStop(1,'rgba(255,60,30,0)');c.fillStyle=g;c.beginPath();c.arc(ex,ey,r,0,6.283);c.fill()}
  if(t>=60&&t<196){c.strokeStyle='rgba(255,240,200,'+(t<90?.9:.5)+')';c.lineWidth=1;
    for(let k=0;k<9;k++){const a=k*.7+.3,L=Math.min(22,(t-60)*.8)*(0.6+(k%3)*.2);c.beginPath();c.moveTo(ex,ey);c.lineTo(ex+Math.cos(a)*L*.5+((k%2)?2:-2),ey+Math.sin(a)*L*.5);c.lineTo(ex+Math.cos(a)*L,ey+Math.sin(a)*L);c.stroke()}}
  for(const q of A.parts)if(q.note&&q.l>0){c.globalAlpha=Math.min(1,q.l/30)*fade;defNote(c,Math.round(q.x),Math.round(q.y),q.col);c.globalAlpha=1}
  defParts(c,{parts:A.parts.filter(q=>!q.note)});
  if(t>=240&&t<320){const w=['Mari mari','Pewkayal'][t<280?0:1],tt=(t-240)%40,al=Math.min(1,tt/10)*Math.max(0,1-(tt-25)/15);
    OV.push(()=>{ctx.save();ctx.globalAlpha=al*fade;txt(w,X+Q.W/2+(t<280?-18:18),Yb+48-tt*.4,'#fff6d8',12,'center');ctx.restore()})}
}

/* ---------- Ngamleftripael ---------- */
// 0-40 it trembles; 40-170 the legs let go one by one and pull back into the body; 150-230 the threads glow and knot
// into a web of light; 210-290 the body sinks away like a train leaving; 290-330 the web stays a moment and fades
function stepDefNgam(A,D){
  const Q=A.Q,t=A.t;
  if(!A.init){A.init=1;A.x0=(A.e._cx||72)-Math.round(Q.W/2);A.y0=A.e._y!=null?A.e._y:10;A.gy=(A.e._bse||138)+4;
    const [hx,hy,hr,hr2]=D.head,[bx,by,brx,bry]=D.abd,cx=Q.MX(D.ctr[0]),cy=D.ctr[1];
    const inBody=(x,y)=>{const ux=Q.MX(x);return ((ux-hx)/hr)**2+((y-hy)/hr2)**2<1||((ux-bx)/brx)**2+((y-by)/bry)**2<1};
    A.body=Q.cut((x,y)=>inBody(x,y));A.cx=cx;A.cy=cy;A.legs=[];A.tips=[];
    for(let k=0;k<8;k++){const a0=-Math.PI+k*Math.PI/4,a1=a0+Math.PI/4;
      A.legs.push(Q.cut((x,y)=>{if(inBody(x,y))return false;let a=Math.atan2(y-cy,x-cx);return a>=a0&&a<a1}));
      // the far tip of this leg, for the web
      let best=null,bd=0;if(Q.px)for(let y=0;y<Q.H;y+=2)for(let x=0;x<Q.W;x+=2){const i=(y*Q.W+x)*4;if(Q.px[i+3]<100||inBody(x,y))continue;const a=Math.atan2(y-cy,x-cx);if(a<a0||a>=a1)continue;const d=(x-cx)**2+(y-cy)**2;if(d>bd){bd=d;best=[x,y]}}
      A.tips.push(best||[cx+Math.cos(a0+.4)*50,cy+Math.sin(a0+.4)*40])}
    A.order=[0,4,2,6,1,5,3,7];A.sink=0;A.slide=0}
  const LC=['#d6342e','#ecbe28','#36a04c','#3a70d2','#964ec4','#d6342e','#ecbe28','#36a04c'];
  for(let j=0;j<8;j++){const t0=40+j*15;if(t===t0){tone('square',300+j*40,180,.12,.08);noiseBurst(.08,.08,1500);
      const [tx,ty]=A.tips[A.order[j]];for(let k=0;k<6;k++)A.parts.push({x:A.x0+tx,y:A.y0+ty,vx:(Math.random()-.5)*1.5,vy:(Math.random()-.5)*1.5,col:LC[A.order[j]],s:2,l:22})}}
  if(t===150)sfx('heal');
  if(t>=210&&t<290){A.slide+=.15+(t-210)*.02;A.sink+=.25;if(t%4===0)A.parts.push({x:A.x0+A.cx+30+Math.random()*30,y:A.y0+A.cy+(Math.random()-.5)*40,vx:3+Math.random()*2,vy:0,col:'rgba(220,226,240,.6)',s:3,l:14});
    if(t===212){noiseBurst(1.1,.2,400);B.shake=6}}
  defStepParts(A);
}
function drawDefNgam(c,A,D){
  const Q=A.Q,t=A.t,X=A.x0+(t<40?(t%4<2?1:-1):0),Y=A.y0;
  const fade=t<290?1:Math.max(0,1-(t-290)/40);
  // the legs, each pulling back into the body at its turn
  for(let j=0;j<8;j++){const k=A.order[j],t0=40+j*15,p=SSd((t-t0)/26);if(p>=1)continue;
    defDraw(c,A.legs[k],X,Y,{ax:A.cx,ay:A.cy,sx:1-p,sy:1-p,rot:(k<4?-1:1)*p*.5,alpha:1-p*.6})}
  // the body slides away and sinks into the floor
  const bx=X-A.slide,by=Y+A.sink;
  c.save();c.beginPath();c.rect(0,0,LW,A.gy+2);c.clip();
  defDraw(c,A.body,bx,by,{alpha:t<270?1:Math.max(0,1-(t-270)/20)});c.restore();
  if(t>=210&&t<290){c.fillStyle='rgba(230,236,255,.25)';for(let k=0;k<5;k++)c.fillRect(Math.round(bx+A.cx+20+k*6),Math.round(by+A.cy-25+k*11),18+k*3,1)}
  // the web of light: the snapped threads knotting back together between the leg tips
  if(t>=150){const p=SSd((t-150)/60),tw=fade*(0.55+.25*Math.sin(t/7));
    const pts=A.tips.map(([x,y])=>[X+x,Y+y]);c.strokeStyle='rgba(255,240,190,'+(p*tw).toFixed(2)+')';c.lineWidth=1;
    for(let i=0;i<8;i++)for(const j of [i+1,i+3]){const a=pts[i],b=pts[j%8];const L2=p;c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(a[0]+(b[0]-a[0])*L2,a[1]+(b[1]-a[1])*L2);c.stroke()}
    for(const [x,y] of pts){c.fillStyle='rgba(255,255,230,'+(p*fade).toFixed(2)+')';c.fillRect(Math.round(x)-1,Math.round(y)-1,3,3)}}
  defParts(c,A);
}

/* ---------- Yewen ---------- */
// 0-90 the stitches snap one by one; 90-150 the padlock clicks open, the key falls, the staff topples; 130-200 the ghostfire
// turns from magenta to gold; 200-260 the cloak empties and collapses; 240-360 a tired figure straightens and walks away
function stepDefYewen(A,D){
  const Q=A.Q,t=A.t;
  if(!A.init){A.init=1;A.x0=(A.e._cx||72)-Math.round(Q.W/2);A.y0=A.e._y!=null?A.e._y:10;A.gy=(A.e._bse||138)+4;
    const sx0=Q.MX(D.staffX[1]),sx1=Q.MX(D.staffX[0]),[l0,ly0,l1,ly1]=D.lock,lx0=Q.MX(l1),lx1=Q.MX(l0);
    const isStaff=(x,y)=>(x>=sx0&&x<=sx1&&y>=ly1)||(x>=lx0&&x<=lx1&&y>=ly0&&y<=ly1);
    const isFire=(r,g,b)=>r>40&&b>=r*.6&&r>=b*.8&&g<r*.75&&g<b*.8;
    const core=(x,y)=>{const ux=Q.MX(x);return ux>=28&&ux<=66};
    const isCloak=(r,g,b,x,y)=>(r>g*1.6&&r>b*1.15&&!(g>r*.6))||(r+g+b<150&&!core(x,y));
    const gold=(r,g,b)=>{const v=(r+g+b)/3;return [Math.min(255,v*1.25+50),Math.min(255,v*1.05+28),Math.min(255,v*.45+8)]};
    A.fire=Q.cut((x,y,r,g,b)=>isFire(r,g,b));A.fireG=Q.cut((x,y,r,g,b)=>isFire(r,g,b),gold);
    A.cloak=Q.cut((x,y,r,g,b)=>!isStaff(x,y)&&!isFire(r,g,b)&&isCloak(r,g,b,x,y));
    A.staff=Q.cut((x,y,r,g,b)=>isStaff(x,y)&&!isFire(r,g,b)&&!(y<=ly1&&y<ly0+8));A.shackle=Q.cut((x,y)=>x>=lx0&&x<=lx1&&y>=ly0&&y<ly0+8);
    const bodyR=(x,y,r,g,b)=>!isStaff(x,y)&&!isFire(r,g,b)&&!isCloak(r,g,b,x,y);
    // the same figure without the shame on it: lavender skin turned warm brown, the rest kept
    const warm=(r,g,b)=>{if(b>r*1.02&&b>g*1.05&&r+g+b>110){const v=Math.min(1,(r+g+b)/3/220),a=[62,34,22],z=[236,178,136];return a.map((q,i)=>Math.round(q+(z[i]-q)*v))}return [r,g,b]};
    A.body=Q.cut(bodyR);A.bodyW=Q.cut(bodyR,warm);
    // the skin colour at the mouth, to mend each stitch as it snaps
    const sm=(Q.px&&(()=>{const x=Q.MX(45),y=D.stY-3,i=(y*Q.W+x)*4;return 'rgb('+Q.px[i]+','+Q.px[i+1]+','+Q.px[i+2]+')'})())||'#8e7aae';
    A.skin=sm;A.snapped=[];A.key=null;A.staffA=0;A.staffV=0;A.walk=0}
  D.stitches.forEach((sx,j)=>{const t0=16+j*10;if(t===t0){A.snapped.push(sx);tone('square',2400-j*120,1800-j*100,.04,.07);
    for(let k=0;k<5;k++)A.parts.push({x:A.x0+Q.MX(sx),y:A.y0+D.stY,vx:(Math.random()-.5)*1.6,vy:-Math.random()*1.4,g:.05,col:['#ff9ad8','#ffd0ee','#ff5cb8'][k%3],s:1,l:20})}});
  if(t===95){tone('square',900,900,.03,.12);tone('square',600,600,.05,.1,.04);
    const [l0,ly0,l1,ly1]=D.lock;A.key={x:A.x0+Q.MX((l0+l1)/2),y:A.y0+ly1,vx:-.4,vy:0,bounced:0}}
  if(A.key){const k=A.key;k.vy+=.25;k.x+=k.vx;k.y+=k.vy;if(k.y>A.gy-1){k.y=A.gy-1;if(k.vy>1.2){k.vy=-k.vy*.35;tone('triangle',3200,3200,.05,.08);tone('triangle',2600,2600,.08,.06,.05)}else{k.vy=0;k.vx*=.8}}}
  if(t>=110){A.staffV+=.0025;A.staffA=Math.min(1.45,A.staffA+A.staffV);if(A.staffA>=1.45&&!A.staffDown){A.staffDown=1;B.shake=5;noiseBurst(.2,.15,600);tone('triangle',180,120,.15,.1)}}
  if(t===140)sfx('heal');
  if(t===205)noiseBurst(.5,.1,200);
  if(t>=260)A.walk+=t<280?.15:.45;
  defStepParts(A);
}
function drawDefYewen(c,A,D){
  const Q=A.Q,t=A.t,X=A.x0+(t<16?(t%4<2?1:-1):0),Y=A.y0;
  const gp=SSd((t-130)/60),cp=SSd((t-200)/55),end=t<320?1:Math.max(0,1-(t-320)/40);
  // the ghostfire, crossfading from magenta to daylight gold, then dying down
  const fireA=t<250?1:Math.max(0,1-(t-250)/60);
  defDraw(c,A.fire,X,Y,{alpha:(1-gp)*fireA});defDraw(c,A.fireG,X,Y,{alpha:gp*fireA});
  // the cloak, emptying and collapsing to the ground
  defDraw(c,A.cloak,X,Y,{ax:Q.W/2,ay:Q.H-2,sy:1-cp*.88,sx:1+cp*.18,alpha:1-SSd((t-250)/50),filter:cp>0?'brightness('+(1-cp*.4).toFixed(2)+')':null});
  // the figure: purple and grey as long as it carries the shame, then warmer, straightening, and walking away
  const wp=SSd((t-230)/40),bob=t>=260?Math.abs(Math.sin(A.walk*.5))*2:0;
  defDraw(c,A.body,X-A.walk*2.2,Y-bob,{ax:Q.W/2,ay:Q.H-2,sy:1+wp*.03,alpha:end*(1-wp)});
  if(wp>0)defDraw(c,A.bodyW,X-A.walk*2.2,Y-bob,{ax:Q.W/2,ay:Q.H-2,sy:1+wp*.03,alpha:end*wp});
  // the stitches mended as they snap
  for(const sx of A.snapped){c.fillStyle=A.skin;const x=X+Q.MX(sx)-A.walk*2.2,y=Y+D.stY-bob;c.fillRect(Math.round(x)-1,Math.round(y)-2,2,1);c.fillRect(Math.round(x)-1,Math.round(y)+1,2,1)}
  // the staff toppling, the shackle lifted off the lock
  const [sfx0,sfy]=[Q.MX(D.staffFoot[0]),D.staffFoot[1]],sa=A.staffA*(1);
  const sh=t>=95?Math.min(3,(t-95)*.5):0;
  defDraw(c,A.staff,X,Y,{ax:sfx0,ay:sfy,rot:-sa,alpha:end});
  defDraw(c,A.shackle,X,Y-sh,{ax:sfx0,ay:sfy+sh,rot:-sa,alpha:end});
  // the key
  if(A.key){const k=A.key;c.globalAlpha=end;R(c,Math.round(k.x)-1,Math.round(k.y)-2,3,3,'#f0c848');R(c,Math.round(k.x)+2,Math.round(k.y)-1,4,1,'#d4a42c');R(c,Math.round(k.x)+4,Math.round(k.y),1,1,'#d4a42c');c.globalAlpha=1}
  // a little daylight where the fire was
  if(gp>0&&fireA>0){const g=c.createRadialGradient(X+Q.W/2,Y+Q.H-6,2,X+Q.W/2,Y+Q.H-6,50);g.addColorStop(0,'rgba(255,220,140,'+(.25*gp*fireA).toFixed(2)+')');g.addColorStop(1,'rgba(255,220,140,0)');c.fillStyle=g;c.fillRect(X-10,Y+Q.H-60,Q.W+20,70)}
  defParts(c,A);
}
