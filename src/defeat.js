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
    mouth:[102,93],clock:[100,135],roots:[[72,64],[130,64]],cuts:[72,130],cutY:100}
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
  if(!A.P){A.P=defPieces(D);A.x0=(e._cx||72)-Math.round(A.P.W/2);A.y0=e._y!=null?e._y:20;A.gy=(e._bse||138)+4;A.vy=0;A.dy=0;A.flakes=[];A.dust=[];A.f=frame}
  // advance on the game's 60 Hz clock, not on screen refreshes, so a slow phone sees the same timing
  const n=Math.max(0,Math.min(6,frame-A.f));A.f=frame;
  for(let i=0;i<n&&A.t<A.T;i++){A.t++;if(A.k==='fillantu')stepDefFillantu(A)}
  if(A.k==='fillantu')drawDefFillantu(c,A);
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
