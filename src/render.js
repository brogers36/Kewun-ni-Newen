/* ============================================================
   RENDER (everything drawn at 256x224 into LO, then blitted at 2x; text drawn crisp on top)
   ============================================================ */
let OV=[];
function bands(c,y0,y1,cols){const n=cols.length,h=(y1-y0)/n;
  for(let i=0;i<n;i++){const ya=Math.round(y0+i*h),yb=Math.round(y0+(i+1)*h);R(c,0,ya,LW,yb-ya,cols[i]);
    if(i<n-1){c.fillStyle=cols[i+1];for(let x=0;x<LW;x+=2)c.fillRect(x+((yb>>0)%2),yb-2,1,1);c.fillStyle=cols[i];for(let x=1;x<LW;x+=2)c.fillRect(x,yb,1,1)}}}
function ridge(c,y0,amp,seed,fill,rim){const pts=[];for(let x=0;x<=LW;x+=2)pts.push([x,Math.round(y0-amp*(.55+.3*Math.sin(x*.022+seed)+.2*Math.sin(x*.062+seed*2)+.12*Math.sin(x*.166+seed*3)))]);
  c.fillStyle=fill;c.beginPath();c.moveTo(0,LH);for(const [x,y] of pts)c.lineTo(x,y);c.lineTo(LW,LH);c.closePath();c.fill();if(rim)for(const [x,y] of pts)R(c,x,y,2,1,rim)}
function araucaria(c,x,y,h,col){R(c,x,y-h,1,h,col);for(let k=0;k<4;k++){const w=Math.round(h*.4*(1-k*.15)),yy=y-h+k*3;R(c,x-w,yy+1,w*2+1,1,col);R(c,x-w,yy+2,1,1,col);R(c,x+w,yy+2,1,1,col)}}
function condor(c,x,y,fl){c.fillStyle='#16101a';const f=fl>0?-1:1;R(c,x-1,y,3,1,'#16101a');for(let i=1;i<7;i++)R(c,x-1-i,y+(i>3?f:0),1,1,'#16101a');for(let i=1;i<7;i++)R(c,x+1+i,y+(i>3?f:0),1,1,'#16101a');R(c,x,y,1,1,'#f0f0f0')}
function paintLand(c,t,dim){
  bands(c,0,140,dim?['#3a3a4a','#46465a','#55556a','#646478','#727286','#808094']:['#18204a','#283078','#4048a0','#7a58a0','#c06c98','#f09078','#ffc890']);
  if(!dim){for(let k=0;k<26;k++)if((t+k*7)%50<40)R(c,(k*97)%LW,(k*53)%40,1,1,'#fff');ell(c,LW-60,128,13,13,'#ffd8a0');ell(c,LW-60,128,10,10,'#fff0c0')}
  ridge(c,98,46,1.3,dim?'#5a5a6c':'#5058a0',dim?'#7a7a8c':'#8a96cc');
  c.fillStyle=dim?'#6a6a7c':'#6870b8';c.beginPath();c.moveTo(116,136);c.lineTo(165,48);c.lineTo(176,48);c.lineTo(226,136);c.closePath();c.fill();
  c.fillStyle=dim?'#4a4a5c':'#4a5294';c.beginPath();c.moveTo(170,48);c.lineTo(176,48);c.lineTo(226,136);c.lineTo(185,136);c.closePath();c.fill();
  c.fillStyle=dim?'#a8a8b4':'#f4f8ff';c.beginPath();c.moveTo(163,52);c.lineTo(178,52);c.lineTo(184,62);c.lineTo(179,59);c.lineTo(175,64);c.lineTo(171,59);c.lineTo(167,63);c.lineTo(164,58);c.lineTo(158,62);c.closePath();c.fill();
  for(let k=0;k<5;k++){const p=((t*.3+k*36)%180)/180;ell(c,171+p*16+Math.sin(p*5+k)*3,46-p*30,3+p*7,2+p*5,dim?'#9a9aa8':'#d8d8e4')}
  ridge(c,128,16,4.2,dim?'#3e4840':'#2c5a34',dim?'#56605a':'#4a8a4a');
  for(let i=0;i<13;i++)araucaria(c,10+i*20+(i%2)*5,134+(i%3)*2,14+(i*7)%7,dim?'#2a302c':'#163a1e');
  ridge(c,138,8,7.1,dim?'#363e3a':'#1f4628');
  bands(c,138,168,dim?['#56667e','#4a5a72','#3e4e66']:['#4a8ad4','#3a70c0','#2858a8','#1e4a96']);
  for(let k=0;k<26;k++){const x=(k*53+Math.floor(t*.3))%LW,y=140+(k*17)%26;R(c,x,y,4+(k%3)*3,1,dim?'#8a9ab0':'#a8d0f8')}
  for(let x=0;x<LW;x++){const y=Math.round(167+Math.sin(x*.04+t/50)*2.5+Math.sin(x*.14));R(c,x,y,1,LH-y,dim?'#8a846e':'#ecd498');R(c,x,y,1,1,dim?'#c8c8c8':'#ffffff');if((x+y)%7===0)R(c,x,y+6+(x%20),1,1,dim?'#6e6a5a':'#d0b070')}
  if(!dim)for(let i=0;i<3;i++){const bx=Math.round((t*.25+i*85)%(LW+40)-20),by=Math.round(30+i*11+Math.sin(t/25+i)*3);condor(c,bx,by,Math.sin(t/12+i))}
}
let VIGNC=null;
let DARKC=null;
function darkMask(){
  // cave darkness dither, prerendered once (player at the center) and blitted per frame
  if(DARKC&&DARKC.width===LW*2&&DARKC.height===LH*2)return DARKC;
  DARKC=document.createElement('canvas');DARKC.width=LW*2;DARKC.height=LH*2;
  const d=DARKC.getContext('2d'),mx=LW,my=LH;
  for(let y=0;y<DARKC.height;y+=2)for(let x=0;x<DARKC.width;x+=2){
    const dist=Math.hypot(x-mx,y-my);
    if(dist>70){const a=Math.min(.7,(dist-70)/140);if(a>.05){d.fillStyle='rgba(0,0,0,'+a.toFixed(2)+')';d.fillRect(x,y,2,2)}}
  }
  return DARKC;
}
function cutFx(c,dark){
  if(!VIGNC){VIGNC=document.createElement('canvas');VIGNC.width=LW;VIGNC.height=LH;const v=VIGNC.getContext('2d');
    const id=v.createImageData(LW,LH),d=id.data;
    for(let y=0;y<LH;y++)for(let x=0;x<LW;x++){const i=(y*LW+x)*4;
      const dx=(x-128)/128,dy=(y-104)/112,q=dx*dx+dy*dy*.8;
      let a=q>.5?Math.min(120,(q-.5)*170):0;
      const n=h2(x,y,77);if(n<.05)a+=10;else if(n>.96)a-=8;
      d[i]=0;d[i+1]=0;d[i+2]=8;d[i+3]=Math.max(0,a)}
    v.putImageData(id,0,0)}
  c.globalAlpha=dark?1:.8;c.drawImage(VIGNC,0,0);c.globalAlpha=1;
}
function renderEndCut(){
  if(!ECUT)return;const t=++ECUT.t,i=ECUT.i,c=lx;
  if(i===0){paintLand(c,frame,true);
    const a=Math.min(1,t/200);
    c.fillStyle='rgba(190,190,205,'+Math.max(0,.3-a*.3)+')';c.fillRect(0,0,LW,LH);
    for(let k=0;k<14;k++){const x=(k*47+Math.sin(k*3)*20)%LW,y=LH-((t*.8+k*37)%(LH+40));R(c,x,y,1,9,'rgba(230,236,248,'+(.5-y/LH*.3)+')');R(c,x,y+7,1,2,'#ffffff')}
    const gr=c.createLinearGradient(0,0,0,LH);gr.addColorStop(0,'rgba(255,214,130,'+(a*.18)+')');gr.addColorStop(1,'rgba(255,170,90,'+(a*.06)+')');c.fillStyle=gr;c.fillRect(0,0,LW,LH)}
  else if(i===1){paintLand(c,frame,false);
    const names=[undefined,'mawida','pewen','kuruf','lelfun'];
    for(let k=0;k<5;k++){const x=28+k*50,bob=Math.sin(frame/22+k)*3;drawNgen(c,x,160+bob,1.6,frame+k*7,names[k])}
    for(let k=0;k<10;k++){const a2=((frame*.5+k*29)%160)/160;ell(c,20+(k*53)%(LW-30),150-a2*120,1.5,1.5,'rgba(255,240,180,'+(1-a2)+')')}
    for(let k=0;k<3;k++){const bx=((frame*.3+k*90)%(LW+40))-20,by=30+k*12,w2=Math.sin(frame/6+k)>0?2:3;R(c,bx-w2,by,w2,1,'#2a2030');R(c,bx+1,by,w2,1,'#2a2030')}}
  else if(i===2){bands(c,0,170,['#1a1030','#241a44','#2e2254','#3a2c64','#463672']);
    for(let k=0;k<40;k++)if((frame+k*11)%60<50)R(c,(k*97)%LW,(k*37)%90,1,1,'#fff');
    ell(c,210,32,11,11,'#f8f4e0');
    for(let k=0;k<16;k++){const bw=13+(k*13)%15,bx=k*17-5,bh=50+((k*53)%70),by=180-bh;R(c,bx,by,bw,bh+50,k%2?'#241e3e':'#2e2850');R(c,bx+bw-2,by,2,bh+50,'#1a1430');
      for(let wy=by+4;wy<175;wy+=6)for(let wx=bx+2;wx<bx+bw-3;wx+=4)if(h2(wx,wy,3)<.6)R(c,wx,wy,2,3,h2(wx,wy,4)<.5?'#ffe080':'#f0b860')}
    R(c,0,180,LW,44,'#2a2444');
    for(let k=0;k<7;k++){const a2=((frame/90+k*.14)%1);const sx2=20+k*34+Math.sin(a2*4+k)*6;OV.push(()=>txt(['mari mari','chaltu','küpange','newen','kümey','pewkayal','mapu'][k],sx2,20+a2*150,'rgba(255,240,190,'+(1-a2)*.9+')',12,'center'))}}
  else{paintLand(c,frame,false);
    const gr2=c.createLinearGradient(0,0,0,LH);gr2.addColorStop(0,'rgba(255,170,90,.18)');gr2.addColorStop(1,'rgba(90,40,70,.2)');c.fillStyle=gr2;c.fillRect(0,0,LW,LH);
    const rk=rukaCanvas(3,2),rox=(LW-256)>>1;ell(c,195+rox,175,40,5,'rgba(0,0,0,.3)');c.drawImage(rk.cvs,150+rox,120,rk.cvs.width*1.7,rk.cvs.height*1.7);
    {const hs=ctCharSprite(heroLook(),'down',0);c.drawImage(hs,84,96,54,96)}
    {const ks=ctCharSprite('kuku','down',0);c.drawImage(ks,130,100,50,90)}
    for(let k=0;k<9;k++){const a2=((frame+k*18)%130)/130;ell(c,40+(k*31)%180,190-a2*90,1.5,1.5,'rgba(255,230,150,'+(1-a2)*.8+')')}
    const gl=.5+.3*Math.sin(frame/18);for(const [rr,al] of [[26,.10],[18,.16],[10,.22]])ell(c,110,170,rr,rr*.4,'rgba(255,226,130,'+(al*gl)+')')}
  cutFx(c,false);
}
function renderCut(){
  if(ECUT)return renderEndCut();
  if(!CUT)return;const t=++CUT.t,i=CUT.i,c=lx;
  if(i===0){paintLand(c,frame,false);
    const gr=c.createLinearGradient(0,0,0,LH);gr.addColorStop(0,'rgba(255,190,110,.16)');gr.addColorStop(.5,'rgba(255,160,90,.05)');gr.addColorStop(1,'rgba(40,20,60,.18)');c.fillStyle=gr;c.fillRect(0,0,LW,LH);
    for(let k=0;k<4;k++){const x=180+k*22-frame*.015%10;c.fillStyle='rgba(255,230,170,'+(.05+.02*Math.sin(frame/40+k))+')';c.beginPath();c.moveTo(x,0);c.lineTo(x+14,0);c.lineTo(x-40,LH);c.lineTo(x-58,LH);c.closePath();c.fill()}
    for(let k=0;k<3;k++){const bx=((frame*.22+k*90)%(LW+40))-20,by=36+k*12+Math.sin(frame/22+k)*3,w2=Math.sin(frame/6+k)>0?2:3;R(c,bx-w2,by,w2,1,'#2a2030');R(c,bx+1,by,w2,1,'#2a2030')}}
  else if(i===1){paintLand(c,frame,true);const a=Math.min(1,t/240);
    for(let k=0;k<6;k++){const x=LW-((t*.55+k*45)%(LW+150))+75,y=40+k*26;for(const [r,al] of [[60,.12],[42,.14],[26,.16]])ell(c,x,y,r,r*.55,'rgba(215,215,228,'+(al*a+.05)+')')}
    c.fillStyle='rgba(190,190,205,'+(a*.28)+')';c.fillRect(0,0,LW,LH)}
  else if(i===2){bands(c,0,170,['#060414','#0c0a24','#141034','#1c1644','#261e54']);
    for(let k=0;k<50;k++)if((frame+k*11)%60<48)R(c,(k*97)%LW,(k*37)%100,1,1,'#fff');
    ell(c,210,35,11,11,'#f4f0d8');ell(c,214,32,9,9,'#0c0a24');
    for(let k=0;k<16;k++){const bw=13+(k*13)%15,bx=k*17-5,bh=50+((k*53)%70),by=180-bh;R(c,bx,by,bw,bh+50,k%2?'#1c1a32':'#242240');R(c,bx+bw-2,by,2,bh+50,'#16142a');if(k%3===0)R(c,bx+bw/2,by-7,1,7,'#242240');
      for(let wy=by+4;wy<175;wy+=6)for(let wx=bx+2;wx<bx+bw-3;wx+=4)if(h2(wx,wy,3)<.42)R(c,wx,wy,2,3,h2(wx,wy,4)<.5?'#f8d870':'#c8a850')}
    R(c,0,180,LW,44,'#22203a');R(c,60,160,136,3,'#4a4668');for(let k=0;k<17;k++)R(c,62+k*8,163,1,17,'#3a3656');R(c,60,180,136,2,'#4a4668');
    {const hs=ctCharSprite(heroLook(),'up',0);c.drawImage(hs,101,66,54,96)}
    for(let k=0;k<44;k++){const rx=(k*53+frame*2.6)%(LW+30)-15,ry=(k*91+frame*5.2)%LH;R(c,rx,ry,1,7,'rgba(170,190,230,.33)');R(c,rx,ry+5,1,2,'rgba(210,225,250,.45)')}
    if(frame%300<4)c.fillStyle='rgba(205,215,255,.22)',c.fillRect(0,0,LW,LH);
    for(let k=0;k<5;k++){const a=((frame/60+k*.2)%1);OV.push(()=>txt(['ü','ñ','ng','tr','ll'][k],113+k*8+Math.sin(a*6+k)*4,86-a*45,'rgba(255,240,200,'+(1-a)*.85+')',16,'center'))}}
  else if(i===3){bands(c,0,LH,['#123a66','#0e3058','#0a2648','#081e3a','#06162c','#040c1c']);
    for(let k=0;k<5;k++){const x=18+k*54+Math.round(Math.sin(frame/50+k)*12);c.fillStyle='rgba(130,190,255,'+(0.06+0.04*Math.sin(frame/35+k*2))+')';c.beginPath();c.moveTo(x,0);c.lineTo(x+20,0);c.lineTo(x+60,LH);c.lineTo(x+20,LH);c.closePath();c.fill()}
    for(let k=0;k<24;k++){const y=LH-((frame*.3+k*31)%LH);ell(c,(k*67)%LW+Math.sin(frame/20+k)*2,y,1+(k%2),1+(k%2),'#8ac0f0')}
    const gl=Math.max(.15,.6+.25*Math.sin(frame/30)-Math.min(.35,t/400));c.globalAlpha=gl;drawNgen(c,128,200,3.5,frame);c.globalAlpha=1;
    [[30,60,'chonchon'],[200,45,'chonchon'],[55,165,'laftrache'],[210,160,'anchi']].forEach(([x,y,tp],k)=>{if(t>k*30){c.globalAlpha=.4;c.drawImage(enemyCanvas(tp,24,Math.floor(frame/12)%2),x-15,y-15);c.globalAlpha=1}});
    [[40,100],[190,85],[75,190],[230,200],[20,150]].forEach(([x,y],k)=>{if(t>k*25&&(frame+k*13)%90<75){R(c,x,y,3,2,'#ff3a2a');R(c,x+7,y,3,2,'#ff3a2a')}})}
  else{paintLand(c,frame,false);
    const gr2=c.createLinearGradient(0,0,0,LH);gr2.addColorStop(0,'rgba(255,130,60,.2)');gr2.addColorStop(.6,'rgba(200,90,70,.1)');gr2.addColorStop(1,'rgba(60,20,50,.22)');c.fillStyle=gr2;c.fillRect(0,0,LW,LH);
    for(let k=0;k<7;k++){const fx2=30+(k*37)%200+Math.sin(frame/30+k*2)*8,fy2=120+(k*23)%80+Math.sin(frame/19+k)*5;if((frame+k*25)%80<55){R(c,fx2,fy2,1,1,'#ffe9a0');ell(c,fx2,fy2,2.5,2.5,'rgba(255,230,140,.18)')}}
    const rk=rukaCanvas(3,2),rox=(LW-256)>>1;ell(c,195+rox,175,40,5,'rgba(0,0,0,.3)');c.drawImage(rk.cvs,150+rox,120,rk.cvs.width*1.7,rk.cvs.height*1.7);
    for(let k=0;k<6;k++){const a=((frame+k*22)%140)/140;ell(c,150+(rk.smoke[0]+rk.ox)*1.7+Math.sin(a*6+k)*3,120+(rk.smoke[1]+rk.oy)*1.7-a*45,2+a*6,2+a*5,'rgba(210,210,220,'+(.5-a*.45)+')')}
    ell(c,96,186,12,3,'rgba(0,0,0,.3)');{const ks=ctCharSprite('kuku','down',0);c.drawImage(ks,69,90,54,96)}}
  cutFx(c,i===2||i===3);
}
/* ---------- map ---------- */
const DYN=new Set(['@','^','Ñ','D','F','C','K','S','I','X','v','P','m','g','p','k','L','G','B','O','q','Q','N','J','H','E','A','j']);
const BOB=new Set(['P','m','g','p','k']);
function bubble(x,y,text){OV.push(()=>{ctx.font='bold 13px ui-monospace,Menlo,Consolas,monospace';const w=ctx.measureText(text).width+12,bx=Math.round(x*2-w/2),by=Math.round(y*2-26);
  ctx.fillStyle='#181018';ctx.fillRect(bx-2,by-2,w+4,24);ctx.fillStyle='#fffaf0';ctx.fillRect(bx,by,w,20);ctx.fillStyle='#181018';ctx.fillRect(x*2-3,by+20,6,4);ctx.fillStyle='#fffaf0';ctx.fillRect(x*2-1,by+20,2,2);
  ctx.fillStyle='#2a1a3a';ctx.textAlign='center';ctx.fillText(text,x*2,by+15);ctx.textAlign='left'})}
function renderMap(){
  const c=lx;R(c,0,0,LW,LH,'#000');
  const mw=M.w*T,mh=M.h*T;
  let cx=Math.round(P.fx*T+8-LW/2),cy=Math.round(P.fy*T+8-VH/2);
  cx=mw<=LW?-Math.floor((LW-mw)/2):Math.max(0,Math.min(mw-LW,cx));cy=mh<=VH?-Math.floor((VH-mh)/2):Math.max(0,Math.min(mh-VH,cy));
  const wf=Math.floor(frame/18)%3,f4=Math.floor(frame/8)%4;
  c.drawImage(LAYERS[wf],-cx,VY-cy);
  const x0=Math.max(0,Math.floor(cx/T)-1),y0=Math.max(0,Math.floor(cy/T)-1),x1=Math.min(M.w-1,Math.ceil((cx+LW)/T)),y1=Math.min(M.h-1,Math.ceil((cy+VH)/T)+1);
  const glows=[];
  // pulsing markers on real map exits, so openings read through the scenery
  {const pulse=.45+.3*Math.sin(frame/14);c.fillStyle='rgba(255,236,140,'+pulse+')';
   const tri=(tx2,ty2,d)=>{const X=tx2*T-cx+8,Y=ty2*T-cy+VY+8;c.save();c.translate(X,Y);
     c.rotate(d==='left'?Math.PI:d==='up'?-Math.PI/2:d==='down'?Math.PI/2:0);
     const o2=5+Math.sin(frame/9)*1.5;c.beginPath();c.moveTo(o2+3,0);c.lineTo(o2-2,-4);c.lineTo(o2-2,4);c.closePath();c.fill();c.restore()};
   if(M.edges)for(const d in M.edges){
     if(d==='left'||d==='right'){const x2=d==='left'?0:M.w-1;for(let y2=0;y2<M.h;y2++)if(WALK.has(grid[y2][x2]))tri(x2,y2,d)}
     else{const y2=d==='up'?0:M.h-1;for(let x2=0;x2<M.w;x2++)if(WALK.has(grid[y2][x2]))tri(x2,y2,d)}}}
  const sbA=M.sbt&&!S.flags[M.sbt.flag]&&(!M.sbt.req||S.flags[M.sbt.req]);
  if(sbA)for(const k of M.sbt.t){const [tx,ty]=k.split(',');const X=tx*T-cx,Y=ty*T-cy+VY;
    if(X>-T&&X<LW&&Y>VY-T&&Y<VY+VH)c.drawImage(sbtCanvas(Math.floor(frame/14)%2),X,Y)}
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const ch=grid[y][x];if(!DYN.has(ch))continue;
    const X=x*T-cx,Y=y*T-cy+VY,anim=ch==='F'||ch==='X'||ch==='v'||ch==='A';
    if((ch==='N'||ch==='J')&&M.pz){const kk=x+','+y,t=M.pz.tiles[kk];if(t){const lit=PZ.lit.has(kk);ell(c,X+8,Y+15,6,2,'rgba(0,0,0,.28)');
      c.drawImage(dynCanvas(ch,ch==='N'?(lit?1:0):t.col+'|'+(lit?1:0)),X,Y);if(lit)glows.push([X+8,Y+6]);
      if(Math.abs(x-P.x)+Math.abs(y-P.y)<7)OV.push(()=>txt(t.lab,X+8,Y-2,ch==='J'?t.col:'#e0f4ff',12,'center'));continue}}
    if(ch==='A'){drawWarpRing(c,X+8,Y+9);continue}
    if(ch==='@'){drawPortal(c,X+8,Y+9);continue}
    if(BOB.has(ch)){const b=Math.round(Math.sin(frame/10+x)*1.5);ell(c,X+8,Y+14,4,1.5,'rgba(0,0,0,.25)');c.drawImage(dynCanvas(ch,0),X,Y-3+b);if(frame%40<6)R(c,X+13,Y+1+b,1,1,'#ffffff')}
    else{if('CIK'.includes(ch))ell(c,X+8,Y+15,7,2,'rgba(0,0,0,.28)');c.drawImage(dynCanvas(ch,anim?f4:0),X,Y)}
    if(ch==='F')glows.push([X+8,Y+8])}
  const list=[];
  for(const p of PROPS){const sx=p.dx-cx,sy=p.dy-cy+VY;if(sx>LW+40||sy>LH+40||sx<-80||sy<-80)continue;
    list.push({y:p.y,d:()=>{if(CT){ell(c,p.sh[0]-cx+4,p.sh[1]-cy+VY+1,p.sh[2]*1.7,p.sh[3]*2.4,'rgba(0,10,20,.2)');ell(c,p.sh[0]-cx+2,p.sh[1]-cy+VY,p.sh[2]*1.1,p.sh[3]*1.4,'rgba(0,10,20,.22)')}else ell(c,p.sh[0]-cx+1,p.sh[1]-cy+VY,p.sh[2],p.sh[3],'rgba(0,0,0,.28)');
      if(p.loom)c.drawImage(loomCanvas((frame/50)%15),sx,sy);
      else if(p.door){c.drawImage(doorwayCanvas(frame%44<6?1:0),sx,sy);ell(c,sx+5,sy+13,7,3,'rgba(255,200,110,'+(.10+.05*Math.sin(frame/9))+')')}
      else if(p.pot){c.drawImage(potCanvas(f4),sx,sy);for(let k=0;k<4;k++){const a=((frame+k*18)%72)/72;R(c,sx+6+Math.round(Math.sin(a*6+k)*2),sy+2-a*12,2,2,'rgba(240,240,240,'+(.7-a*.7)+')')}}
      else c.drawImage(p.cvs,sx,sy);
      if(p.board)OV.push(()=>{ctx.font='bold 11px ui-monospace,monospace';ctx.fillStyle='#f0f0e0';ctx.textAlign='center';ctx.fillText('Mari mari',(sx+12)*2,(sy+7)*2);ctx.fillText('kiñe epu küla',(sx+12)*2,(sy+12)*2+1);ctx.textAlign='left'})}})}
  for(const sc of SCN)if(sc.type==='palin'){
    sc.pl.forEach((p,i)=>list.push({y:p.y/T+.4,d:()=>{const sx=Math.round(p.x-8-cx),sy=Math.round(p.y-8-cy+VY);drawChar(c,i<2?'palinA':'palinB',sx,sy,p.dir,p.mv?Math.floor(frame/7+i)%4:0,false,i%5,[0,1,5,3][i%4],[0,2,0,3][i%4]);
      const d=p.dir==='left'?-1:1,near=Math.hypot(p.x-sc.bx,p.y-sc.by)<22,sw=near?Math.sin(frame/5+i*1.7):Math.sin(frame/40+i)*.3;
      const hx=sx+8+d*(CT?2:2),hy=sy+(CT?6:9),tx=sx+8+d*((CT?15:10)+Math.round(sw*(CT?4:3))),ty=sy+16-Math.round(Math.max(0,-sw)*(CT?3:2));drawWino(c,hx,hy,tx,ty,d)}}));
    list.push({y:sc.by/T+.45,d:()=>{const bx=Math.round(sc.bx-cx),by=Math.round(sc.by-cy+VY);ell(c,bx,by+3,2,1,'rgba(0,0,0,.3)');ell(c,bx,by,2,2,'#3a2a1a');R(c,bx-1,by-1,1,1,'#8a6a4a')}});
    if((frame%300)<90){const p=sc.pl[Math.floor(frame/300)%4];bubble(p.x-cx,p.y-cy+VY-14,['Palin!','Kümey!','Pali!','Ya!'][Math.floor(frame/300)%4])}
  }
  for(const e of ents)list.push({y:e.fy+.5,d:()=>{const sx=Math.round(e.fx*T-cx),sy=Math.round(e.fy*T-cy+VY);
    if(e.kind==='npc'){
      if(e.look==='ngen')drawNgen(c,sx+8,sy+15,1,frame);
      else if(e.look==='ngen2')drawNgen(c,sx+8,sy+15,1,frame,'mawida');
      else if(e.look==='ngen3')drawNgen(c,sx+8,sy+15,1,frame,'pewen');
      else if(e.look==='ngen4')drawNgen(c,sx+8,sy+15,1,frame,'kuruf');
      else if(e.look==='ngen5')drawNgen(c,sx+8,sy+15,1,frame,'lelfun');
      else if(e.look==='rewe'){ell(c,sx+8,sy+14,6,2,'rgba(0,0,0,.3)');const rc=reweCanvas();c.drawImage(rc,sx-1,sy+16-rc.height)}
      else if(e.look==='dog'){ell(c,sx+8,sy+14,6,2,'rgba(0,0,0,.3)');c.drawImage(dogSprite(e.mv?Math.floor(frame/6)%2:0,e.dir),sx,sy+4)}
      else{let fr=e.mv?Math.floor(frame/7)%4:0;if(e.act==='weave'||e.act==='teach')fr=Math.floor(frame/24)%2?1:0;
        drawChar(c,e.look,sx,sy,e.dir||'down',fr,e.seated,e.tn,e.ey2,e.hr2);
        if(e.act==='wood'){R(c,sx+(e.dir==='left'?9:1),sy-6,6,3,'#7a4a22');R(c,sx+(e.dir==='left'?9:1),sy-6,6,1,'#a87040')}}
      if(e.bub&&(frame+e.bt)%600<400&&Math.abs(e.x-P.x)+Math.abs(e.y-P.y)<9)bubble(sx+8,sy-(e.seated?2:8),e.bub[Math.floor((frame+e.bt)/600)%e.bub.length])}
    else if(e.kind==='animal'){const ac=animalCanvas(e.look,e.mv?Math.floor(frame/8)%2:0,e.dir==='right'?'right':'left');ell(c,sx+8,sy+15,ac.width*.36,2,'rgba(0,0,0,.3)');c.drawImage(ac,sx+8-(ac.width>>1),sy+17-ac.height)}
    else{const t=e.party[0],sz=e.final?72:e.boss?30:e.mini?22:16,cvs=enemyCanvas(t,sz,Math.floor(frame/10)%2);
      const fly=ET[t].fly?6+Math.round(Math.sin(frame/8)*1.5):0;
      ell(c,sx+8,sy+14,sz/3,2,'rgba(0,0,0,.3)');
      if(e.final){const cxp=sx+8,cyp=sy+16-Math.round(cvs.height/2),loom=Math.round(Math.sin(frame/34)*2);
        ell(c,cxp,sy+15,cvs.width*.75,7,'rgba(14,18,8,.55)');ell(c,cxp,sy+15,cvs.width*.5,4,'rgba(26,32,14,.5)');
        for(const [r,a] of [[1.35,.34],[1.0,.24],[.68,.16]])ell(c,cxp,cyp+loom,cvs.width*.72*r,cvs.height*.58*r,'rgba(3,5,2,'+a+')');
        for(let k=0;k<8;k++){const a2=frame/44+k*.785,rr=cvs.width*.6+Math.sin(frame/18+k)*4;
          ell(c,cxp+Math.cos(a2)*rr,cyp+loom+Math.sin(a2)*cvs.height*.46,3.5,2,'rgba(112,152,92,.34)')}
        for(let k=0;k<7;k++){const ph=((frame*.7+k*43)%180)/180;
          const vx=cxp+Math.sin(frame/50+k*2.1)*cvs.width*.42+Math.sin(ph*6.28+k)*5,vy=sy+12-ph*cvs.height*1.05,vr=(5+(k%3)*3)*(.6+ph*.8);
          ell(c,vx,vy,vr,vr*.55,'rgba(108,150,88,'+(.18*(1-ph)).toFixed(2)+')');
          ell(c,vx+2,vy+1,vr*.6,vr*.35,'rgba(140,184,108,'+(.12*(1-ph)).toFixed(2)+')')}
        for(let k=0;k<4;k++){R(c,Math.round(cxp+Math.sin(frame/7+k*3)*cvs.width*.4),Math.round(cyp+Math.cos(frame/9+k*2)*cvs.height*.3),1,1,'rgba(14,18,8,.85)')}}
      if(S.pw.pewen>0&&frame%10<5)c.globalAlpha=.55;
      c.drawImage(cvs,Math.round(sx+8-cvs.width/2),Math.round(sy+16-cvs.height-fly+2));c.globalAlpha=1;
      if(e.party.length>1)OV.push(()=>txt('×'+e.party.length,sx+13,sy+3,'#ffffff',12))}}});
  list.push({y:P.fy+.5,d:()=>drawChar(c,heroLook(),Math.round(P.fx*T-cx),Math.round(P.fy*T-cy+VY),P.dir,P.moving?Math.floor(frame/6)%4:0)});
  list.sort((a,b)=>a.y-b.y).forEach(o=>o.d());
  // enemies behind a tree canopy stay faintly visible
  for(const e of ents){if(e.kind!=='enemy'||!e.party)continue;
    const bx=e.x,by=e.y+1;
    if(by<M.h&&grid[by][bx]==='T'){
      const t=e.party[0],sz=e.boss?30:e.mini?22:16,cvs=enemyCanvas(t,sz,Math.floor(frame/10)%2);
      const sx=Math.round(e.fx*T-cx),sy=Math.round(e.fy*T-cy+VY);
      const fly=ET[t].fly?6+Math.round(Math.sin(frame/8)*1.5):0;
      c.globalAlpha=.5;c.drawImage(cvs,Math.round(sx+8-cvs.width/2),Math.round(sy+16-cvs.height-fly+2));c.globalAlpha=1;
    }}
  for(const [rx,ry] of RUKAS)for(let k=0;k<5;k++){const ph=((frame+k*28)%140)/140;ell(c,rx-cx+Math.sin(ph*6+k)*3*ph,ry-cy+VY-ph*28,2+ph*5,(2+ph*5)*.8,'rgba(225,225,235,'+(.4*(1-ph))+')')}
  for(let k=0;k<26;k++){const wx=Math.floor(h2(k,frame>>3,91)*LW),wy=Math.floor(h2(k,frame>>3,92)*LH),mx=Math.floor((wx+cx)/T),my=Math.floor((wy-VY+cy)/T);
    if(inB(mx,my)&&grid[my][mx]==='~'&&WD[my][mx]>1){const a=(frame%8)<4;R(c,wx,wy,1,1,M.lava?'#fff0a0':'#f4faff');if(a){R(c,wx-1,wy,1,1,'rgba(220,240,255,.7)');R(c,wx+1,wy,1,1,'rgba(220,240,255,.7)')}}}
  for(const [gx,gy] of glows)for(const [r,a] of [[24,.05],[16,.07],[10,.08]])ell(c,gx,gy,r,r*.8,'rgba(255,170,80,'+a+')');
  if(CUR==='w_wapi'&&grid[10]&&grid[10][16]==='v'){const wx=16*T+8-cx,wy=10*T+8-cy+VY;
    for(let k=0;k<3;k++){const ph=(frame/46+k/3)%1;ell(c,wx,wy,6+ph*17,(6+ph*17)*.45,'rgba(140,255,230,'+(.55*(1-ph)).toFixed(2)+')')}
    c.globalAlpha=.22+.1*Math.sin(frame/9);const wg=c.createLinearGradient(0,wy-44,0,wy);wg.addColorStop(0,'rgba(140,255,230,0)');wg.addColorStop(1,'rgba(140,255,230,.55)');c.fillStyle=wg;c.fillRect(wx-7,wy-44,14,44);c.globalAlpha=1;
    for(let k=0;k<5;k++){const ph=((frame+k*23)%115)/115;ell(c,wx+Math.sin(ph*8+k)*6,wy-ph*38,1.5,1.5,'rgba(190,255,240,'+(.7*(1-ph)).toFixed(2)+')')}
    ell(c,wx,wy,4,2,'rgba(230,255,250,'+(.5+.3*Math.sin(frame/7)).toFixed(2)+')')}
  if(M.bg==='crater'){c.fillStyle=awake(M.region)?'rgba(255,200,120,.05)':'rgba(120,20,0,.18)';c.fillRect(0,VY,LW,VH)}
  if(M.region==='williche'&&!awake('williche')&&!M.dungeon){for(let k=0;k<9;k++){const fx=((k*61+frame*(.15+(k%3)*.08))%(LW+120))-60,fy=VY+((k*47)%LH);ell(c,fx,fy,46+(k%3)*14,14+(k%2)*6,'rgba(220,228,236,.16)')}c.fillStyle='rgba(200,210,220,.10)';c.fillRect(0,VY,LW,VH)}
  if(M.bg==='fjord'){c.fillStyle=awake(M.region)?'rgba(255,240,200,.05)':'rgba(10,20,44,.38)';c.fillRect(0,VY,LW,VH)}
  if(M.under){c.fillStyle='rgba(20,90,120,.18)';c.fillRect(0,VY,LW,VH);
    for(let k=0;k<10;k++){const bx=(k*53+Math.floor(Math.sin(k*7)*9))%LW,by=VY+VH-((frame*.8+k*47)%(VH+20));c.strokeStyle='rgba(190,240,250,.35)';c.beginPath();c.arc(bx+Math.sin((frame+k*30)/22)*3,by,1+(k%2),0,6.283);c.stroke()}
    for(let k=0;k<3;k++){const sx2=40+k*80+Math.sin(frame/90+k)*10;c.fillStyle='rgba(180,240,255,.05)';c.beginPath();c.moveTo(sx2,VY);c.lineTo(sx2+26,VY);c.lineTo(sx2+60,VY+VH);c.lineTo(sx2+20,VY+VH);c.closePath();c.fill()}}
  if(M.fog){c.fillStyle=S.flags.won?'rgba(255,244,210,.06)':'rgba(148,158,174,.16)';c.fillRect(0,VY,LW,VH);
    if(!S.flags.won)for(let k=0;k<5;k++){const wx=((k*83+frame)%(LW+80))-40,wy=24+k*((VH-30)/5);c.fillStyle='rgba(190,198,210,.08)';c.beginPath();c.ellipse(wx,VY+wy,46,8,0,0,6.283);c.fill()}}
  if(M.bg==='cave'||M.bg==='cave2'||M.bg==='cave3'||M.bg==='cave4'){const px=Math.round(P.fx*T-cx+8),py=Math.round(P.fy*T-cy+VY+8);const dm=darkMask();c.drawImage(dm,px-dm.width/2,py-dm.height/2)}
  if(CUR==='rupu'){for(let k=0;k<7;k++){const fx=-cx+Math.round(Math.sin(frame/60+k)*6)+6,fy=k*30+((frame/3+k*17)%30)-cy+VY;for(const [rr,al] of [[26,.18],[16,.22],[9,.25]])ell(c,fx,fy,rr,rr*.7,'rgba(200,200,212,'+al+')')}}
  if(M.bg==='forest'){c.fillStyle=awake(M.region)?'rgba(255,240,160,.06)':'rgba(10,30,20,.3)';c.fillRect(0,VY,LW,VH)}
  if(M.bg==='lagoon'){c.fillStyle=S.flags.ngen?'rgba(120,200,255,.08)':'rgba(60,30,90,.22)';c.fillRect(0,VY,LW,VH)}
  if(CT)ctLight(c,glows);
  drawHUD(c);
}
// palin wiño: a long wooden stick held at the hip, its curved head sweeping the ground
function drawWino(c,hx,hy,tx,ty,d){
  const n=Math.max(Math.abs(tx-hx),Math.abs(ty-hy)),pts=[];for(let k=0;k<=n;k++)pts.push([Math.round(hx+(tx-hx)*k/n),Math.round(hy+(ty-hy)*k/n)]);
  const big=CT,hook=big?[[1,0],[2,0],[3,0],[4,-1],[4,-2]]:[[1,0],[2,0],[3,-1]];for(const [a,b] of hook)pts.push([tx+d*a,ty+b]);
  for(const [x,y] of pts)R(c,x-1,y-1,big?4:3,big?4:3,'#2a1608');
  for(const [x,y] of pts)R(c,x,y,big?2:1,big?2:1,'#9a6430');
  for(const [x,y] of pts)R(c,x,y,1,1,'#d09a58');
  R(c,hx-1,hy-1,big?4:3,big?4:3,'#f0c8a0');R(c,hx-1,hy+(big?2:1),big?4:3,1,'#b07850');
}
function ctLight(c,glows){
  const dark=M.dungeon||M.bg==='forest'||M.trees==='mawida'||M.bg==='crater'||M.bg==='fjord';
  c.save();
  const g=c.createLinearGradient(0,VY,0,LH);g.addColorStop(0,dark?'rgba(10,20,50,.18)':'rgba(255,236,190,.10)');g.addColorStop(1,dark?'rgba(0,0,20,.28)':'rgba(40,30,80,.10)');c.fillStyle=g;c.fillRect(0,VY,LW,VH);
  const v=c.createRadialGradient(LW/2,LH/2,LH*.35,LW/2,LH/2,LH*.85);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,dark?'rgba(0,0,16,.55)':'rgba(0,0,20,.32)');c.fillStyle=v;c.fillRect(0,VY,LW,VH);
  c.globalCompositeOperation='lighter';
  for(const [gx,gy] of glows){const fl=1+Math.sin(frame/6+gx)*.06,rg=c.createRadialGradient(gx,gy,2,gx,gy,48*fl);rg.addColorStop(0,'rgba(255,190,90,.45)');rg.addColorStop(.4,'rgba(255,140,50,.16)');rg.addColorStop(1,'rgba(255,120,40,0)');c.fillStyle=rg;c.fillRect(gx-56,gy-56,112,112)}
  c.restore()}
function ctWin(c,x,y,w,h){const g=c.createLinearGradient(0,y,0,y+h);g.addColorStop(0,'#5a6a9e');g.addColorStop(.5,'#2a3468');g.addColorStop(1,'#141a3c');
  R(c,x-1,y-1,w+2,h+2,'#000');c.fillStyle=g;c.fillRect(x,y,w,h);R(c,x,y,w,1,'#e8ecf8');R(c,x,y,1,h,'#e8ecf8');R(c,x+w-1,y,1,h,'#7a7e94');R(c,x,y+h-1,w,1,'#7a7e94');
  R(c,x+1,y+1,w-2,1,'#9aa2c8');for(let yy=y+2;yy<y+h-1;yy+=2)for(let xx=x+2+((yy>>1)%2);xx<x+w-1;xx+=4)R(c,xx,yy,1,1,'rgba(255,255,255,.05)')}
function drawHUD(c){
  // LttP-style overlay: newen meter, counters, "- PIWKE -" hearts
  R(c,7,5,12,34,'#181018');R(c,8,6,10,32,'#f8f8f8');R(c,9,7,8,30,'#181018');
  const sp=S.sp||0,fh=Math.round(30*sp/SPMAX);if(fh>0){R(c,9,37-fh,8,fh,'#30b030');R(c,9,37-fh,3,fh,'#70e070')}
  for(let k=1;k<SPMAX;k++)R(c,9,7+Math.round(30*k/SPMAX),8,1,'#000');
  const ic=(x,draw)=>{draw(x)};
  ell(c,30,10,2.5,4,'#c88a18');ell(c,29.5,9.5,1.8,3.2,'#f0c040');R(c,29,7,1,2,'#fff4b0');
  ell(c,58,10,3,3,'#5a1a6a');ell(c,57,9,2,2,'#8a3aa0');R(c,58,5,1,2,'#2a7a2a');
  if(M&&M.dungeon)c.drawImage(dynCanvas('k',0),76,2);
  const mx=maxHP(),hearts=Math.min(40,Math.ceil(mx/HPQ)),hp=Math.max(0,S.hp);
  for(let i=0;i<hearts;i++){const q=Math.max(0,Math.min(4,hp-i*HPQ)),col=i%10,row=Math.floor(i/10);drawHeart(c,LW-88+col*8,13+row*8,q)}
  {const ty=13+Math.ceil(hearts/10)*8+2,tx=LW-88,pcs=S.pieces||[];const RG=['lafkenche','nagche','pewenche','williche','puelche'];
    const PAT={lafkenche:['#2a64c8','#f0f0f0'],nagche:['#2f8d4a','#f0d060'],pewenche:['#6a3a1a','#e8e0d0'],williche:['#8a2458','#f0f0f0'],puelche:['#c87a20','#202020']};
    R(c,tx-1,ty-1,RG.length*14+2,8,'#181018');
    RG.forEach((k,i)=>{const x=tx+i*14;if(pcs.includes(k)){const [a,b]=PAT[k];R(c,x,ty,14,6,a);for(let j=0;j<7;j++){R(c,x+j*2,ty+(j%2?1:3),1,1,b);R(c,x+j*2+1,ty+(j%2?2:2),1,1,b)}R(c,x,ty,14,1,'rgba(255,255,255,.35)')}
      else{R(c,x,ty,14,6,'#2a2238');for(let j=0;j<14;j+=3)R(c,x+j,ty+2,2,1,'#4a3d5c')}
      if(i)R(c,x,ty,1,6,'#181018')});
    R(c,tx-3,ty+1,2,4,'#c8b080');R(c,tx+RG.length*14+1,ty+1,2,4,'#c8b080')}
  OV.push(()=>{txt(String(S.gold).padStart(3,'0'),31,25,'#ffffff',14,'center');txt(String(S.items.kulon||0).padStart(2,'0'),58,25,'#ffffff',14,'center');
    if(M&&M.dungeon)txt(String(S.keys||0).padStart(2,'0'),84,25,'#ffffff',14,'center');
    txt('- PIWKE -',LW-48,10,'#ffffff',12,'center');txt('kimün '+S.lvl,100,25,'#bfe3d0',12);
    if(S.curse)txt('☠',140,25,'#d0a0ff',13);if(S.kutran)txt('✖',154,25,'#9fe870',13);const pw=[];if(S.pw.speed>0)pw.push('mañke');if(S.pw.pewen>0)pw.push('pewen');if(S.pw.gold)pw.push('milla');if(pw.length)txt(pw.join(' '),LW-6,40,'#ffe27a',11,'right')});
}
/* ---------- battle ---------- */
const BG={},FG={};
const NK=n=>Math.max(n,Math.round(n*LW/256));
function lavify(cvs){const c=cvs.getContext('2d'),d=c.getImageData(0,0,cvs.width,cvs.height),a=d.data;
  for(let i=0;i<a.length;i+=4){const r=a[i],g=a[i+1],b=a[i+2],l=(r+g+b)/3;if(b>r+20&&b>g){a[i]=Math.min(255,l*1.9+40);a[i+1]=Math.round(l*.9);a[i+2]=Math.round(l*.3)}else{a[i]=Math.round(r*.7+l*.15);a[i+1]=Math.round(g*.45);a[i+2]=Math.round(b*.45)}}c.putImageData(d,0,0);return cvs}
function fogify(cvs){const c=cvs.getContext('2d'),d=c.getImageData(0,0,cvs.width,cvs.height),a=d.data;
  for(let i=0;i<a.length;i+=4){const r=a[i],g=a[i+1],b=a[i+2],l=(r+g+b)/3;if(r>g+6&&r>b){a[i]=Math.round(l*.7);a[i+1]=Math.round(l*.95+6);a[i+2]=Math.round(l*1.15+12)}}c.putImageData(d,0,0);return cvs}
function dustify(cvs){const c=cvs.getContext('2d'),d=c.getImageData(0,0,cvs.width,cvs.height),a=d.data;
  for(let i=0;i<a.length;i+=4){const r=a[i],g=a[i+1],b=a[i+2],l=(r+g+b)/3;a[i]=Math.min(255,Math.round(l*1.15+30));a[i+1]=Math.round(l*.95+16);a[i+2]=Math.round(l*.55)}c.putImageData(d,0,0);return cvs}
function deepBG(){const [cvs,c]=mk(LW,LH);
  bands(c,0,LH,['#06303e','#07394a','#084256','#0a4c62','#0c566e','#0e607a','#0f6a86','#117492']);
  for(let k=0;k<NK(4);k++){const x=30+k*62;c.fillStyle='rgba(180,240,255,.06)';c.beginPath();c.moveTo(x,0);c.lineTo(x+22,0);c.lineTo(x+70,LH);c.lineTo(x+28,LH);c.closePath();c.fill()}
  for(let k=0;k<NK(9);k++){const kx=8+k*30+(k%3)*5,kh=60+((k*31)%70);
    for(let i=0;i<kh;i+=3){const sw=Math.sin(i*.2+k)*4;R(c,kx+sw,LH-i,3,3,k%2?'#0a4a3a':'#0e5a46');if(i%9===0)R(c,kx+sw+3,LH-i,2,2,'#1a7a5e')}}
  R(c,0,LH-18,LW,18,'#0a3240');for(let x=0;x<LW;x+=3)if(h2(x,1,9)<.4)R(c,x,LH-16+(x%5),2,2,'#154a5c');
  for(const [px,py] of [[50,LH-14],[130,LH-10],[210,LH-16]]){ell(c,px,py,7,3,'#083040');ell(c,px-2,py-2,3,2,'#ff8a9a');ell(c,px+3,py-1,2,2,'#ffd84a')}
  for(let k=0;k<26;k++){const x=(k*37)%LW,y=(k*53)%(LH-30);R(c,x,y,1,1,'rgba(190,240,250,.4)')}
  return cvs}
function pampaBG(){const [cvs,c]=mk(LW,LH);
  bands(c,0,88,['#4a86d8','#5a94de','#6ea4e4','#86b6ea','#a2c8f0','#c2dcf4']);
  for(const [x,y,sc] of [[36,18,1.2],[120,10,.8],[205,24,1],[168,34,.7]]){ell(c,x,y+3,17*sc,5*sc,'#c8dcf0');ell(c,x,y,15*sc,5*sc,'#ffffff');ell(c,x-6*sc,y-3*sc,7*sc,5*sc,'#ffffff');ell(c,x+6*sc,y-2*sc,6*sc,4*sc,'#ffffff')}
  for(let k=0;k<NK(30);k++){const px=k*9,hg=4+Math.round(Math.sin(k*1.7)*2+((k*13)%5));for(let i=0;i<hg;i++){const w=Math.max(2,10-i*2);R(c,px-w/2,88-i,w,1,i>hg-3?'#e8f0f8':'#7e94bc')}}
  R(c,0,88,LW,2,'#5a7aa8');
  for(let x=0;x<LW;x++){const y=Math.round(92+Math.sin(x*.03)*2);R(c,x,y,1,LH-y,'#c0a444');R(c,x,y,1,1,'#e8d478')}
  for(let y=96;y<LH;y+=2)for(let x=(y%7);x<LW;x+=5)if(h2(x,y,61)<.5)R(c,x,y,1,2,h2(x,y,62)<.5?'#d8bc58':'#a8883a');
  for(let k=0;k<NK(7);k++){const px=12+k*38+(k%3)*7,ph=6+(k*5)%7;for(let i=0;i<ph;i++)R(c,px+Math.round(Math.sin(i*.9+k)*1.5),118-i-k*2,1,2,'#8a6a2a');R(c,px-2,118-ph-k*2,5,2,'#6a8a3a');R(c,px-1,119-ph-k*2,3,1,'#8aa84e')}
  for(const [lx,ly] of [[52,150],[196,166]]){ell(c,lx,ly-10,5,7,'#b09a6a');ell(c,lx,ly-15,2.5,3,'#c8b283');R(c,lx-1,ly-21,2,6,'#b09a6a');ell(c,lx,ly-22,2,1.6,'#8a7448');R(c,lx-3,ly-4,2,5,'#9a845a');R(c,lx+2,ly-4,2,5,'#9a845a')}
  birds(c,[[70,30],[84,26],[96,33]]);
  return cvs}
function mossify(cvs){const c=cvs.getContext('2d'),d=c.getImageData(0,0,cvs.width,cvs.height),a=d.data;
  for(let i=0;i<a.length;i+=4){const r=a[i],g=a[i+1],b=a[i+2];if(r>g+6&&r>b){a[i]=Math.round(g*.85);a[i+1]=Math.round(r*.92+4);a[i+2]=Math.round(b*.8+r*.18)}}c.putImageData(d,0,0);return cvs}
function polishBG(cvs,area){
  const c=cvs.getContext('2d'),hor=({field:96,coast:118,mount:98,crater:98,forest:122,cave:122,rainforest:100,fjord:100,pampa:92,deep:150}[area])||106;
  const id=c.getImageData(0,0,LW,LH),d=id.data;
  // de-band the sky: checker-blend rows whose colour step is small
  for(let y=1;y<hor-1;y++)for(let x=0;x<LW;x++){
    if(!((x+y)&1))continue;
    const i=(y*LW+x)*4,j=((y+1)*LW+x)*4,df=Math.abs(d[i]-d[j])+Math.abs(d[i+1]-d[j+1])+Math.abs(d[i+2]-d[j+2]);
    if(df>5&&df<56){d[i]=d[j];d[i+1]=d[j+1];d[i+2]=d[j+2]}
  }
  // ground grain, denser toward the bottom
  for(let y=hor;y<LH;y++){const t=(y-hor)/(LH-hor);
    for(let x=0;x<LW;x++){const n=h2(x,y,99);let f=0;
      if(n<.05+t*.06)f=.87;else if(n>.975-t*.015)f=1.12;
      if(f){const i=(y*LW+x)*4;d[i]=Math.min(255,d[i]*f);d[i+1]=Math.min(255,d[i+1]*f);d[i+2]=Math.min(255,d[i+2]*f)}
    }}
  // vignette
  for(let y=0;y<LH;y++)for(let x=0;x<LW;x++){const dx=(x-128)/128,dy=(y-100)/112,q=dx*dx*.9+dy*dy*.55;
    if(q>.55){const f=1-Math.min(.24,(q-.55)*.38),i=(y*LW+x)*4;d[i]*=f;d[i+1]*=f;d[i+2]*=f}}
  c.putImageData(id,0,0);
  // soft stage light where the fight happens
  for(const [r,a] of [[1.5,.028],[1.15,.028],[.8,.028],[.5,.028]])ell(c,120,168,118*r,54*r,'rgba(255,250,225,'+a+')');
}
function birds(c,list){for(const [x,y] of list){R(c,x-2,y,2,1,'#24304a');R(c,x+1,y,2,1,'#24304a');R(c,x,y-1,1,1,'#24304a')}}
function greyify(cvs){const c=cvs.getContext('2d'),d=c.getImageData(0,0,cvs.width,cvs.height),a=d.data;
  for(let i=0;i<a.length;i+=4){const r0=a[i],g0=a[i+1],b0=a[i+2],l=(r0+g0+b0)/3;
    a[i]=Math.round(r0*.3+l*.62+14);a[i+1]=Math.round(g0*.3+l*.66+16);a[i+2]=Math.round(b0*.3+l*.74+22)}
  c.putImageData(d,0,0);
  c.fillStyle='rgba(150,160,175,.14)';c.fillRect(0,0,cvs.width,cvs.height);
  return cvs}
function buildBG(area){
  if(area.startsWith&&area.startsWith('fog:'))return greyify(buildBG(area.slice(4)));
  if(area==='cave2'||area==='cave3'||area==='cave4'||area==='cave5')return buildBGraw(area);
  const cvs=buildBGraw(area);polishBG(cvs,area);return cvs;
}
function buildBGraw(area){
  if(area==='cave2')return mossify(buildBG('cave'));
  if(area==='cave3')return lavify(buildBG('cave'));
  if(area==='cave4')return fogify(buildBG('cave'));
  if(area==='cave5')return dustify(buildBG('cave'));
  if(area==='pampa')return pampaBG();
  if(area==='deep')return deepBG();
  if(area==='rainforest'||area==='fjord'){const [cvs,c]=mk(LW,LH),fj=area==='fjord';
    bands(c,0,100,fj?['#141c26','#1a2430','#222e3a','#2a3846','#344452','#3e505e']:['#5a6a78','#66788a','#728696','#8094a2','#8ea0ac','#9aaab4']);
    ridge(c,86,22,4.2,fj?'#1a2430':'#4a5e60');ridge(c,94,14,1.7,fj?'#121a22':'#2e4a3e','#4a5e60');
    if(fj){R(c,0,100,LW,LH-100,'#0e1620');for(let y=102;y<LH;y+=3)for(let x=(y%7);x<LW;x+=17)R(c,x,y,6,1,'#1e2c3a');ell(c,LW-56,30,10,10,'#c8d0d8');ell(c,LW-59,28,3,2,'#a8b0b8')}
    else{R(c,0,100,LW,LH-100,'#2a5a3a');for(let y=102;y<LH;y+=3)for(let x=(y%5);x<LW;x+=9)if(h2(x,y,8)<.4)R(c,x,y,2,1,h2(x,y,9)<.5?'#3a7a4e':'#1c4428');
      for(let k=0;k<5;k++){const tr=treeCanvas(k%3,'lawal');c.drawImage(tr,k<3?-4+k*16:LW-22-(k-3)*18,58)}
      for(const [px,py] of [[60,150],[190,160],[120,196]]){for(let i=0;i<7;i++)R(c,px-6+i*2,py-8+(i%3),1,8-(i%3),'#3a8a4a')}}
    for(let k=0;k<6;k++)ell(c,(k*53)%LW,90+(k%3)*6,40,7,fj?'rgba(160,170,180,.18)':'rgba(220,226,232,.25)');
    return cvs}
  if(area==='mount'||area==='crater'){const [cvs,c]=mk(LW,LH),cr=area==='crater';
    bands(c,0,96,cr?['#1a0606','#2a0a08','#3a100a','#4a160c','#5a1e10','#6a2814']:['#4a78c0','#5a88cc','#6c98d6','#86acdf','#a2c0e8','#c0d6f0']);
    if(!cr){for(const [x,y,s] of [[50,20,1],[170,14,.9]]){ell(c,x,y+3,17*s,5*s,'#c8dcf0');ell(c,x,y,15*s,5*s,'#ffffff');ell(c,x-6*s,y-3*s,7*s,5*s,'#ffffff')}}
    for(let i=0;i<50;i++){const w=Math.round(6+i*2.2);R(c,140-w/2,40+i,w,1,i<10?(cr?'#5a2a24':'#f8fbff'):i<13?(cr?'#4a2420':'#c8d4e8'):(cr?'#2a1414':'#6a7a98'));if(i>=10&&i%3===0&&!cr)R(c,140-w/2,40+i,Math.round(w/3),1,'#8494b0')}
    ell(c,140,38,6,3,cr?'#f86018':'#9a9aa8');
    ridge(c,86,16,1.4,cr?'#2a1010':'#7a90b8');ridge(c,92,10,3.7,cr?'#1a0a08':'#5a7a9a',cr?'#2a1010':'#7a90b8');
    if(!cr)for(let k=0;k<NK(9);k++){const px=10+k*29+(k%3)*5,ph=7+(k*5)%6;for(let i=0;i<ph;i++){const w=Math.max(1,Math.round((ph-i)*.8));R(c,px-(w>>1),96-i,w,1,'#46688c')}R(c,px,96-ph-1,1,2,'#46688c')}
    R(c,0,98,LW,LH-98,cr?'#2a1410':'#e6edf6');for(let x=0;x<LW;x++){const y=Math.round(98+Math.sin(x*.04)*3);R(c,x,y,1,3,cr?'#3a1a14':'#ffffff')}
    for(let y=104;y<LH;y+=3)for(let x=(y%6);x<LW;x+=13)if(h2(x,y,5)<.35)R(c,x,y,2,1,cr?'#4a2018':'#c4d0e2');
    if(cr){for(let y=150;y<LH;y+=2)for(let x=0;x<LW;x++)if(Math.sin(x*.05+y*.2)>.9)R(c,x,y,1,1,'#f86018')}
    else for(let k=0;k<4;k++){const tr=treeCanvas(k%3,'pewen');c.drawImage(tr,k<2?-2+k*22:LW-26-(k-2)*24,62+(k%2)*6)}
    return cvs}
  const [cvs,c]=mk(LW,LH);
  if(area==='coast'){bands(c,0,96,['#2858b8','#3a70d0','#5a90e0','#80b0ec','#a8ccf4','#c8e0f8']);
    ell(c,214,26,9,9,'#fffbe8');for(const [x,y,s] of [[46,26,1],[140,16,1.3],[234,44,.8]]){ell(c,x,y+3,17*s,5*s,'#c8dcf0');ell(c,x,y,15*s,5*s,'#ffffff');ell(c,x-6*s,y-3*s,7*s,5*s,'#ffffff');ell(c,x+6*s,y-2*s,6*s,4*s,'#ffffff')}
    ridge(c,88,22,2.2,'#7d98c8');ridge(c,92,16,5.1,'#5c7aac','#7d98c8');
    bands(c,90,118,['#4a86d4','#3a74c4','#2e62b0','#2452a0']);
    for(let x=0;x<LW;x++){const y=Math.round(116+Math.sin(x*.06)*1.5);R(c,x,y,1,LH-y,'#ecd498');if(h2(x,0,3)<.3)R(c,x,y+3+Math.floor(h2(x,1,3)*80),1,1,'#d0b070')}
    for(let y=120;y<LH;y+=3)for(let x=(y%6);x<LW;x+=17)if(h2(x,y,5)<.3)R(c,x,y,2,1,'#d8bc80');
    for(let k=0;k<5;k++){const r=rockCanvas(k%2);c.drawImage(r,k<3?2+k*14:LW-18-(k-3)*16,186+(k%3)*9)}
    birds(c,[[150,52],[166,47],[184,55],[60,60]])}
  else if(area==='field'){bands(c,0,92,['#3a78d0','#4a88d8','#5c98e0','#78acea','#98c4f0','#b8d8f4']);
    for(const [x,y,s] of [[40,22,1.1],[150,14,.9],[226,34,1]]){ell(c,x,y+3,17*s,5*s,'#c8dcf0');ell(c,x,y,15*s,5*s,'#ffffff');ell(c,x-6*s,y-3*s,7*s,5*s,'#ffffff');ell(c,x+6*s,y-2*s,6*s,4*s,'#ffffff')}
    for(let i=0;i<36;i++){const w=Math.round(4+i*1.6);R(c,186-w/2,48+i,w,1,i<9?'#f4f8ff':i<12?'#c8d4e8':'#7a8cb0');if(i>=9&&i%3===0)R(c,186-w/2,48+i,Math.round(w/3),1,'#94a6c6')}
    ridge(c,82,14,2.4,'#6a8cb8');ridge(c,88,10,4.6,'#4a7aa0','#6a8cb8');
    for(let x=0;x<LW;x++){const y=Math.round(96+Math.sin(x*.03)*4+Math.sin(x*.11)*1.5);R(c,x,y,1,LH-y,'#58a848');R(c,x,y,1,1,'#80c868')}
    for(let x=0;x<LW;x++){const y=Math.round(108+Math.sin(x*.02+2)*3);R(c,x,y,1,14,x>70&&x<190?'#d8b040':'#48983c');if(x>70&&x<190&&h2(x,1,7)<.5)R(c,x,y,1,2,'#f0d060')}
    R(c,0,122,LW,LH-122,'#48a048');for(let y=124;y<LH;y+=3)for(let x=(y%6);x<LW;x+=11)if(h2(x,y,5)<.35)R(c,x,y,1,2,h2(x,y,6)<.5?'#68c058':'#307c34');
    for(let x=6;x<LW;x+=22){R(c,x,112,2,12,'#5a3818');R(c,x+1,112,1,12,'#8a5a30')}R(c,0,115,LW,1,'#8a5a30');R(c,0,119,LW,1,'#8a5a30');
    for(let k=0;k<4;k++){const tr=treeCanvas(k%2,'koyam');c.drawImage(tr,k<2?-4+k*20:LW-28-(k-2)*22,64+(k%2)*6)}
    birds(c,[[70,36],[82,32],[92,38]])}
  else if(area==='forest'){bands(c,0,LH,['#0a1a10','#10241a','#163020','#1c3a24','#22442a']);
    for(let k=0;k<NK(9);k++){const px=k*31-6+(k%2)*6,w=10+(k*7)%8;R(c,px,0,w,140,'#2a1e14');R(c,px,0,3,140,'#3e2e20');R(c,px+w-2,0,2,140,'#160e08');for(let y=8;y<140;y+=13)R(c,px+3,y+(k%3),w-5,1,'#22180e')}
    for(let k=0;k<26;k++){const x=(k*41)%LW,y=(k*17)%40;ell(c,x,y,22,14,k%2?'#1c4424':'#24522c')}
    c.fillStyle='rgba(255,250,200,.07)';for(const [x0,x1] of [[70,110],[150,175]]){c.beginPath();c.moveTo(x0,0);c.lineTo(x1,0);c.lineTo(x1+40,140);c.lineTo(x0+20,140);c.closePath();c.fill()}
    R(c,0,125,LW,LH-125,'#2a4a24');for(let y=126;y<LH;y+=3)for(let x=(y%5);x<LW;x+=9)if(h2(x,y,8)<.4)R(c,x,y,2,1,h2(x,y,9)<.5?'#3a6a30':'#1c3418');
    for(const [px,py] of [[30,140],[226,150],[120,200]]){ell(c,px,py,14,4,'#1a2a14');for(let k=0;k<5;k++)R(c,px-6+k*3,py-5-(k%2)*2,1,5,'#5aa040')}
    for(const [px,py] of [[50,175],[205,185]]){R(c,px,py-6,2,6,'#e8e0d0');ell(c,px+1,py-7,4,2,'#c83030');R(c,px-1,py-8,1,1,'#f8f8f8');R(c,px+2,py-7,1,1,'#f8f8f8')}}
  else if(area==='cave'){bands(c,0,LH,['#0a0605','#120c08','#1a120c','#221812','#2a1e16']);
    for(let k=0;k<NK(5);k++){const px=k*60-10;R(c,px,30,22,110,'#2a2018');R(c,px,30,4,110,'#3a2c22');R(c,px+18,30,4,110,'#140e0a')}
    for(let k=0;k<NK(18);k++){const sx=k*15+2,len=15+(k*17)%30;for(let i=0;i<len;i++){const w=Math.max(1,Math.round(8*(1-i/len)));R(c,sx+4-w/2,i,w,1,i%3?'#4a3a2c':'#5a4636')}}
    c.fillStyle='rgba(255,236,190,.10)';c.beginPath();c.moveTo(110,0);c.lineTo(150,0);c.lineTo(190,140);c.lineTo(80,140);c.closePath();c.fill();
    R(c,0,125,LW,LH-125,'#3a2c20');for(let y=125;y<LH;y+=4)for(let x=((y>>2)%2)*8;x<LW;x+=16)R(c,x,y,15,1,'#2e2218');for(let y=125;y<LH;y+=4)R(c,0,y,LW,1,'#463428');
    for(const [px,py,rx] of [[60,150,20],[200,160,28],[130,190,15]]){ell(c,px,py,rx,4,'#1c2a34');ell(c,px,py-1,rx-2,3,'#2c4458');R(c,px-rx/2,py-2,rx/2,1,'#7ab0d0')}
    for(const [px,py] of [[20,125],[235,120],[45,100],[220,90]]){ell(c,px,py,10,8,'rgba(90,230,200,.15)');for(let k=0;k<3;k++){R(c,px-4+k*3,py-6+k,2,8-k,k%2?'#7af0d8':'#3ab8a8')}}}
  else{bands(c,0,110,['#0c0820','#160e32','#22144a','#341c5c','#4c2868','#6a3474','#7a3c78']);
    for(let k=0;k<40;k++)R(c,(k*61)%LW,(k*23)%70,1,1,'#ffffff');ell(c,LW-56,40,15,15,'#f4f0d8');ell(c,LW-60,36,3,2,'#dcd6b8');ell(c,LW-51,45,2,2,'#dcd6b8');
    ridge(c,95,30,3.1,'#22184a');ridge(c,103,17,6.3,'#160f34');
    for(let k=0;k<50;k++){const rx=(k*29)%LW,h=6+(k*7)%10;R(c,rx,107-h,1,h,'#100a26')}
    bands(c,106,LH,['#24366a','#1c2c5c','#142450','#0e1c40','#0a1430','#08102c'])}
  return cvs;
}
function buildFG(area){
  if(area.startsWith&&area.startsWith('fog:'))return greyify(buildFG(area.slice(4)));
  if(area==='cave2')return mossify(buildFG('cave'));
  if(area==='cave3'||area==='crater')return lavify(buildFG('cave'));
  if(area==='cave4')return fogify(buildFG('cave'));
  if(area==='rainforest'||area==='fjord'){const [cvs,c]=mk(LW,LH);for(const sd of [0,1])for(let k=0;k<10;k++){const bx=sd?LW-6-k*5:6+k*5,hg=12+((k*11)%16);for(let i=0;i<hg;i++)R(c,bx+(sd?-1:1)*Math.floor(i/4),LH-i,3,1,area==='fjord'?(k%2?'#1a2a30':'#22343a'):(k%2?'#1c5a32':'#2a7a40'))}return cvs}
  if(area==='deep'){const [cvs,c]=mk(LW,LH);for(const sd of [0,1])for(let k=0;k<8;k++){const bx=sd?LW-6-k*6:6+k*6,hg=16+((k*13)%18);for(let i=0;i<hg;i+=2){const sw=Math.sin(i*.25+k)*3;R(c,bx+sw,LH-i,3,2,k%2?'#0a4a3a':'#12604c')}}return cvs}
  if(area==='pampa'){const [cvs,c]=mk(LW,LH);for(const sd of [0,1])for(let k=0;k<14;k++){const bx=sd?LW-4-k*4:4+k*4,hg=12+((k*13)%14);for(let i=0;i<hg;i++)R(c,bx+(sd?-1:1)*Math.floor(i/5),LH-i,2,1,k%2?'#c8a844':'#8a6e2c')}return cvs}
  if(area==='mount'){const [cvs,c]=mk(LW,LH);for(const sd of [0,1])for(let k=0;k<12;k++){const bx=sd?LW-4-k*5:4+k*5,hg=8+((k*13)%10);for(let i=0;i<hg;i++)R(c,bx+(sd?-1:1)*Math.floor(i/5),LH-i,3,1,k%2?'#ffffff':'#d8e2f0')}return cvs}
  const [cvs,c]=mk(LW,LH);
  if(area==='coast'){for(const sd of [0,1])for(let k=0;k<14;k++){const bx=sd?LW-4-k*4:4+k*4,hg=10+((k*13)%14);for(let i=0;i<hg;i++)R(c,bx+(sd?-1:1)*Math.floor(i/4),LH-i,2,1,k%2?'#2f7a34':'#3e9444')}}
  else if(area==='field'){for(const sd of [0,1])for(let k=0;k<14;k++){const bx=sd?LW-4-k*4:4+k*4,hg=12+((k*13)%14);for(let i=0;i<hg;i++)R(c,bx+(sd?-1:1)*Math.floor(i/5),LH-i,2,1,k%2?'#2f7a34':'#c8a040')}}
  else if(area==='forest'){for(const sd of [0,1])for(let k=0;k<10;k++){const bx=sd?LW-6-k*5:6+k*5,hg=14+((k*11)%18);for(let i=0;i<hg;i++)R(c,bx+(sd?-1:1)*Math.floor(i/3),LH-i,3,1,k%2?'#1c4a20':'#2a6a2c')}}
  else if(area==='cave'){for(const [bx,w,hg] of [[0,36,56],[30,20,30],[LW-36,36,60],[LW-56,22,34]])for(let i=0;i<hg;i++){const ww=Math.round(w*(1-i/hg));R(c,bx+(w-ww)/2,LH-i,ww,1,i%3?'#3a2c22':'#4a3a2c')}}
  else{for(let k=0;k<30;k++){const sd=k<15,bx=sd?k*4:LW-(k-15)*4,hg=20+((k*17)%30);R(c,bx,LH-hg,1,hg,k%3?'#0e1a12':'#162a1a');ell(c,bx,LH-hg,1,3,'#3a2a1a')}}
  return cvs;
}
function animBG(area){const c=lx;
  if(area==='coast'){for(let k=0;k<3;k++){const x=((frame*.08*(k+1)+k*110)%(LW+80))-40,y=20+k*14;ell(c,x,y+2,14,4,'#c8dcf0');ell(c,x,y,12,4,'#ffffff');ell(c,x-5,y-2,6,4,'#ffffff');ell(c,x+5,y-1,5,3,'#ffffff')}
    for(let k=0;k<24;k++){const x=(k*47+Math.floor(frame*.35))%LW,y=92+(k*13)%22;if((frame+k*9)%40<28)R(c,x,y,4+(k%4)*2,1,'#d8ecff')}
    for(let x=0;x<LW;x+=2){const y=Math.round(115+Math.sin(x*.1+frame/18)*1.5);R(c,x,y,2,1,'#ffffff')}
    for(let i=0;i<2;i++){const bx=Math.round((frame*.3+i*130)%(LW+30)-15),by=Math.round(35+i*15+Math.sin(frame/20+i)*3),f=Math.sin(frame/6+i)>0?1:0;R(c,bx-1,by,3,1,'#f8f8f8');R(c,bx-4,by-f,3,1,'#f8f8f8');R(c,bx+2,by-f,3,1,'#f8f8f8')}}
  else if(area==='field'){for(let k=0;k<3;k++){const x=((frame*.06*(k+1)+k*100)%(LW+80))-40,y=18+k*12;ell(c,x,y+2,14,4,'#c8dcf0');ell(c,x,y,12,4,'#ffffff');ell(c,x-5,y-2,6,4,'#ffffff')}
    for(let x=72;x<190;x+=3){const y=Math.round(108+Math.sin(x*.02+2)*3);if(Math.sin(x*.2+frame/14)>.6)R(c,x,y,1,2,'#fff0a0')}
    const bx=Math.round((frame*.4)%(LW+30)-15),by=Math.round(40+Math.sin(frame/25)*4),f=Math.sin(frame/5)>0?1:0;R(c,bx-1,by,3,1,'#202020');R(c,bx-4,by-f,3,1,'#202020');R(c,bx+2,by-f,3,1,'#202020')}
  else if(area==='forest'){for(let k=0;k<14;k++){const x=Math.round(10+k*18+Math.sin(frame/35+k)*8),y=Math.round(60+Math.sin(frame/27+k*2)*30+(k%4)*16);if((frame+k*11)%50<36){R(c,x,y,1,1,awake('nagche')?'#f8f0a0':'#a0e8ff');ell(c,x,y,2,2,'rgba(200,255,160,.2)')}}
    for(let k=0;k<4;k++){const lx2=(k*67+Math.floor(frame*.2))%LW,ly2=Math.floor((k*43+frame*.35)%130);R(c,lx2,ly2,2,1,'#6aa040')}}
  else if(area==='mount'||area==='crater'){for(let k=0;k<5;k++){const ph=((frame*.4+k*30)%120)/120;ell(c,140+Math.sin(ph*6+k)*4*ph,36-ph*30,3+ph*6,(3+ph*6)*.7,area==='crater'?'rgba(80,40,30,'+(.5*(1-ph))+')':'rgba(200,200,210,'+(.5*(1-ph))+')')}
    if(area==='mount')for(let k=0;k<30;k++){const x=(k*37+Math.floor(frame*.3))%LW,y=Math.floor((k*53+frame*.6)%LH);R(c,x,y,1,1,'#ffffff')}
    else for(let k=0;k<20;k++){const x=(k*41+Math.floor(Math.sin(frame/30+k)*6))%LW,y=LH-Math.floor((k*29+frame*.5)%140);R(c,x,y,1,1,'#ffb040')}}
  else if(area==='deep'){for(let k=0;k<16;k++){const x=(k*41+Math.floor(frame*.4))%LW,y=LH-((frame*1.2+k*43)%(LH+20));c.strokeStyle='rgba(190,240,250,.4)';c.beginPath();c.arc(x+Math.sin((frame+k*20)/18)*3,y,1+(k%2),0,6.283);c.stroke()}}
  else if(area==='pampa'){for(let k=0;k<26;k++){const x=(k*37+Math.floor(frame*1.4))%LW,y=Math.floor(30+((k*53+Math.floor(frame*.7))%130)+Math.sin(frame/9+k)*4);R(c,x,y,2,1,k%3?'rgba(248,228,140,.55)':'rgba(255,250,220,.7)')}}
  else if(area==='rainforest'||area==='fjord'){for(let k=0;k<40;k++){const x=(k*29+Math.floor(frame*.6))%LW,y=Math.floor((k*47+frame*3)%LH);R(c,x,y,1,3,area==='fjord'?'rgba(180,200,220,.5)':'rgba(200,220,240,.6)')}
    for(let k=0;k<4;k++){const x=((frame*.2+k*80)%(LW+100))-50;ell(c,x,110+k*8,50,8,'rgba(220,226,232,.12)')}}
  else if(area==='cave'||area==='cave2'||area==='cave3'||area==='cave4'){for(let k=0;k<18;k++){const x=95+((k*37+Math.floor(frame*.15))%90)+Math.round(Math.sin(frame/40+k)*5),y=Math.floor((k*29+frame*.2)%140);if((frame+k)%30<22)R(c,x,y,1,1,'#ffeec8')}
    const dy=Math.floor(frame*1.5)%130;R(c,62,dy,1,3,'#9ad0f0');R(c,201,(dy+65)%130,1,3,'#9ad0f0')}
  else{for(let k=0;k<40;k++)if((frame+k*13)%50<38)R(c,(k*61)%LW,(k*23)%70,1,1,'#ffffff');
    for(let i=0;i<10;i++){const w=30-i*2;R(c,200-w/2+Math.round(Math.sin(frame/15+i)*4),112+i*7,w,1,i%2?'#f4e8c0':'#d8c8a0')}
    for(let k=0;k<10;k++){const x=Math.round(20+k*24+Math.sin(frame/30+k)*10),y=Math.round(130+Math.sin(frame/22+k*2)*15+(k%3)*10);if((frame+k*7)%40<30){R(c,x,y,1,1,'#e8ffb0');ell(c,x,y,2,2,'rgba(200,255,140,.25)')}}}
}
function drawWarpRing(c,cx,cy){
  const t=frame/14,pu=.8+.2*Math.sin(frame/9);
  for(const [r,al] of [[30,.12],[22,.15],[14,.2]])ell(c,cx,cy+3,r*pu+4,(r*pu+4)*.42,'rgba(110,205,255,'+al+')');
  const bw=12+Math.round(Math.sin(frame/7)*3);
  for(let i=0;i<5;i++){const w=bw-i*2;if(w<=0)continue;R(c,cx-(w>>1),cy-84+i*5,w,84-i*5,'rgba('+(160+i*22)+','+(222+i*8)+',255,'+(0.07+i*.025)+')')}
  R(c,cx-1,cy-84,3,84,'rgba(245,252,255,.3)');
  c.save();c.translate(cx,cy+3);
  for(const [rx,ry,lw,col,dash,sp] of [[24,10,3,'rgba(120,215,255,.85)',[10,7],1],[18,7.6,2,'rgba(220,245,255,.9)',[6,5],-1.5],[11,4.6,2,'rgba(255,255,255,.95)',[3,4],2.2]]){
    c.strokeStyle=col;c.lineWidth=lw;c.setLineDash(dash);c.lineDashOffset=frame*sp*.6;
    c.beginPath();c.ellipse(0,0,rx*pu,ry*pu,0,0,6.283);c.stroke()}
  c.setLineDash([]);c.restore();
  ell(c,cx,cy+3,5.5,2.6,'rgba(235,250,255,.95)');ell(c,cx,cy+3,3,1.4,'#ffffff');
  for(let k=0;k<14;k++){const ph=((frame*1.1+k*41)%120)/120,an=k*1.7+t*.5;
    const px2=cx+Math.cos(an)*(16-ph*7),py2=cy+2-ph*62;
    R(c,px2,py2,k%3?1:2,k%3?2:3,'rgba('+(190+k*4)+',238,255,'+((1-ph)*.9)+')')}
  for(let k=0;k<4;k++){const an=t*1.6+k*1.571,px2=cx+Math.cos(an)*21*pu,py2=cy+3+Math.sin(an)*8.6*pu;
    ell(c,px2,py2,3,3,'rgba(150,225,255,.45)');R(c,px2-1,py2-1,3,3,'rgba(220,245,255,.8)');R(c,px2,py2,1,1,'#ffffff')}
}
function renderBattle(){
  const c=lx;R(c,0,0,LW,LH,'#000');
  const sh=B.shake>0?(B.shake--%2?2:-2):0;
  c.save();c.translate(sh,0);
  if(!BG[B.area])BG[B.area]=buildBG(B.area);c.drawImage(BG[B.area],0,0);animBG(B.area);
  const ngoyUp=B.en.some(e=>/^ngoyman/.test(e.t)&&!e.dead);
  if(ngoyUp){const br=.34+.07*Math.sin(frame/37);
    c.fillStyle='rgba(4,6,4,'+br.toFixed(2)+')';c.fillRect(0,0,LW,LH);
    const vg=c.createRadialGradient(LW/2,LH*.45,LH*.3,LW/2,LH*.45,LW*.7);
    vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(10,14,8,.5)');
    c.fillStyle=vg;c.fillRect(0,0,LW,LH)}
  if(B.intro>0)B.intro--;
  const al=B.en.filter(e=>!e.dead||e.fadeT>0),n=al.length,base=138;
  al.forEach((e,i)=>{const Tt=ET[e.t],sz=Tt.bs,cvs=enemyCanvas(e.t,sz,Math.floor(frame/12)%2);
    const bossI=al.findIndex(x=>ET[x.t].boss),others=al.filter(x=>!ET[x.t].boss),oi=others.indexOf(e);
    const cx=bossI<0?Math.round(LW*(i+1)/(n+1)):ET[e.t].boss?LW-72:Math.round(20+(oi+1)*(LW-146)/(others.length+1));let y=base-cvs.height+4+Math.round(Math.sin(frame/16+i));if(y<4)y=4+Math.round(Math.sin(frame/16+i));
    if(Tt.fly&&e.gr<=0)y-=26+Math.round(Math.sin(frame/9+i)*3);
    if(B.intro>0)y+=Math.round(B.intro*1.5);
    e.px=cx;e.py=y+cvs.height/3;
    if(/^ngoyman/.test(e.t)&&!e.dead){
      ell(c,cx,base,sz/2.1,5,'rgba(16,26,12,.5)');ell(c,cx,base,sz/2.8,3,'rgba(32,48,20,.45)');
      for(let k=0;k<7;k++){const ph=((frame*.7+k*53)%200)/200;
        const vx=cx+Math.sin(frame/50+k*2.1)*sz*.5+Math.sin(ph*6.28+k)*6,vy=base-2-ph*cvs.height*1.05,vr=(6+(k%3)*3)*(.6+ph*.8);
        ell(c,vx,vy,vr,vr*.55,'rgba(108,150,88,'+(.17*(1-ph)).toFixed(2)+')');
        ell(c,vx+2,vy+1,vr*.6,vr*.35,'rgba(140,184,108,'+(.11*(1-ph)).toFixed(2)+')')}
      for(let k=0;k<4;k++){R(c,Math.round(cx+Math.sin(frame/7+k*3)*sz*.4),Math.round(y+20+Math.cos(frame/9+k*2)*14),1,1,'rgba(16,24,10,.8)')}}
    ell(c,cx,base,sz/2.6,3,'rgba(0,0,0,.32)');
    if(e.dead){e.fadeT--;c.globalAlpha=Math.max(0,e.fadeT/20)}
    if(e.hit>0&&e.hit--%4<2)c.globalAlpha=.25;
    let ly=0,ls=1;if(e.lunge>0){e.lunge--;ly=Math.round(Math.sin(e.lunge/16*Math.PI)*10);}
    c.drawImage(cvs,cx-Math.floor(cvs.width/2),y+ly);c.globalAlpha=1;
    if(e.sl>0){c.fillStyle='rgba(40,40,120,.25)';c.fillRect(cx-sz/2,y,sz,cvs.height)}
    if(!e.dead&&(e.stag||(e.hp<=0&&typeof quizPend==='function'&&quizPend(e)))){
      // staggered, waiting for the ngen's question: pulse red/orange
      const ph=Math.floor(frame/7)%2,[tcv,tg]=mk(cvs.width,cvs.height);
      tg.drawImage(cvs,0,0);tg.globalCompositeOperation='source-atop';
      tg.fillStyle=ph?'rgba(255,150,40,.55)':'rgba(255,55,25,.55)';tg.fillRect(0,0,cvs.width,cvs.height);
      c.drawImage(tcv,cx-Math.floor(cvs.width/2),y+ly);
    }
    if(e.dead)return;
    if(e.seals&&e.seals.length){const cyS=y+cvs.height/2;
      for(let k=0;k<e.seals.length;k++){
        c.save();c.strokeStyle=['rgba(255,240,170,.85)','rgba(190,230,255,.65)','rgba(255,200,230,.5)'][k%3];c.lineWidth=1.5;
        c.setLineDash([6,8]);c.lineDashOffset=(frame*(k%2?1.4:-1.1))%14;
        c.beginPath();c.ellipse(cx,cyS,sz*.60+k*6,sz*.33+k*4,0,0,6.283);c.stroke();c.restore()}
      for(let k=0;k<6;k++){const a2=frame/16+k*1.047;R(c,Math.round(cx+Math.cos(a2)*(sz*.60)),Math.round(cyS+Math.sin(a2)*(sz*.33)),2,2,k%2?'#fff6c0':'#ffe060')}}
    if(e.sl>0)OV.push(()=>txt('z'+(frame%40<20?'Z':''),cx+sz/2-3,y+6,'#e0f0ff',16));
    const bw=Math.max(32,Math.min(76,sz*.8)),bx=Math.round(cx-bw/2),by=base+4;
    R(c,bx-1,by-1,bw+2,5,'#181018');R(c,bx,by,bw,3,'#4a1a1f');R(c,bx,by,Math.max(0,Math.round(bw*e.hp/e.max)),3,'#f07028');R(c,bx,by,Math.max(0,Math.round(bw*e.hp/e.max)),1,'#ffb070');
    OV.push(()=>txt(e.label,cx,by+13,'#ffffff',13,'center'));
    const tg=B.cursor==='all'||B.cursor===B.en.indexOf(e);
    if(tg&&frame%20<15){const ay=y-8+Math.round(Math.sin(frame/5)*2);for(let k=0;k<5;k++){R(c,cx-5+k,ay+k,11-k*2,1,'#ffe040');R(c,cx-6+k,ay+k,1,1,'#181018');R(c,cx+5-k,ay+k,1,1,'#181018')}R(c,cx-6,ay-1,13,1,'#181018')}
  });
  if(!FG[B.area])FG[B.area]=buildFG(B.area);c.drawImage(FG[B.area],0,0);
  c.restore();
  for(const p of B.parts){p.t--;p.x+=p.vx;p.y+=p.vy;p.vy+=.06;R(c,p.x,p.y,p.t>15?2:1,p.t>15?2:1,p.col)}B.parts=B.parts.filter(p=>p.t>0);
  // hero panel (LttP-style box)
  const hrows=Math.ceil(Math.min(40,Math.ceil(maxHP()/HPQ))/10);
  const px=4,py=4,pw=136,ph=36+Math.max(0,hrows-2)*8;
  R(c,px-1,py-1,pw+2,ph+2,'#000');R(c,px,py,pw,ph,'#e8e8f8');R(c,px+1,py+1,pw-2,ph-2,'#7880d0');R(c,px+2,py+2,pw-4,ph-4,'#18186a');
  {const sp=S.sp||0;R(c,px+pw-12,py+4,7,28,'#f8f8f8');R(c,px+pw-11,py+5,5,26,'#000');const fh=Math.round(26*sp/SPMAX);if(fh)R(c,px+pw-11,py+31-fh,5,fh,'#30c030');}
  R(c,px+3,py+3,28,28,'#2a2048');if(CT)c.drawImage(ctCharSprite(heroLook(),'down',0),0,1,18,18,px+3,py+3,28,28);else c.drawImage(charSprite(heroLook(),'down',0),0,0,16,14,px+3,py+3,28,24.5);
  const mx=maxHP(),hearts=Math.min(40,Math.ceil(mx/HPQ));let hp=Math.max(0,S.hp);
  for(let i=0;i<hearts;i++){const q=Math.max(0,Math.min(4,hp-i*HPQ)),col=i%10,row=Math.floor(i/10);drawHeart(c,px+34+col*8,py+14+row*8,q)}
  OV.push(()=>{txt(S.name,px+34,py+11,'#ffffff',14);txt(Math.max(0,S.hp)+'/'+mx,px+pw-16,py+11,'#c8d0ff',12,'right')});
  if(S.hp/mx<=.25&&frame%30<15){R(c,px,py,pw,1,'#ff4040');R(c,px,py+ph-1,pw,1,'#ff4040')}
  B.pops=B.pops.filter(p=>p.t>0);for(const p of B.pops){p.t--;const pp=p;OV.push(()=>txt(pp.txt,pp.x,pp.y-(50-pp.t)*.45,pp.col,20,'center'))}
  if(B.flash>0){c.fillStyle='rgba(255,255,255,'+(B.flash/16)+')';c.fillRect(0,0,LW,LH);B.flash--}
  if(B.red>0){c.fillStyle='rgba(255,0,0,'+(B.red/30)+')';c.fillRect(0,0,LW,LH);B.red--}
  if(B.ngenA&&!B.ngenA.done&&B.ngenA.kind==='final'){const A=B.ngenA;A.t++;
    const NG=[[undefined,'120,220,255'],['mawida','120,255,150'],['pewen','255,200,110'],['kuruf','225,240,255'],['lelfun','255,230,120']];
    const SEG=68,T0=24,e=A.e;
    const seg=Math.floor((A.t-T0)/SEG),st=(A.t-T0)%SEG;
    const dark=Math.min(1,A.t/30),SH=T0+SEG*5;
    c.fillStyle='rgba(0,0,14,'+(.55*dark*(A.t>SH+55?Math.max(0,(SH+85-A.t)/30):1)).toFixed(2)+')';c.fillRect(0,0,LW,LH);
    const bx=e.px||LW-72,by=e.py||100;
    if(A.t>=T0&&seg<5){
      const vr=NG[seg][0],col=NG[seg][1];
      const nx=Math.round(LW*.30),ny=170;
      const ap=Math.min(1,st/14),strike=st>=26&&st<50;
      if(st===1)sfx('cast');
      if(st===18)sfx('charge');
      if(st===26){B.shake=12;e.hit=26;sfx('beam')}
      if(st===40)B.shake=8;
      const rise=Math.round((1-ap)*40);
      c.save();c.beginPath();c.rect(0,0,LW,ny+9);c.clip();
      c.globalAlpha=ap*(st>58?Math.max(0,(SEG-st)/10):1);
      c.translate(nx,ny+rise);const s2=1.08+ap*.3+(strike?.1:0);c.scale(s2,s2);
      drawNgen(c,0,0,1,frame,vr);c.restore();c.globalAlpha=1;
      {const eyY=ny+rise-80*s2,mY=ny+rise-71*s2,ex1=nx-3*s2,ex2=nx+3*s2;
       if(st>=18&&st<26){const gl=(st-18)/8;  // the eyes kindle before the blast
         ell(c,ex1,eyY,1.5+gl*1.5,1.5+gl*1.5,'rgba('+col+','+(.9*gl).toFixed(2)+')');
         ell(c,ex2,eyY,1.5+gl*1.5,1.5+gl*1.5,'rgba('+col+','+(.9*gl).toFixed(2)+')')}
       if(strike){const t2=Math.min(1,(st-26)/20);
        c.save();c.globalCompositeOperation='lighter';
        for(const [gx,gy,lw] of [[ex1,eyY,5],[ex2,eyY,5],[nx,mY,9]]){
          const grad=c.createLinearGradient(gx,gy,bx,by);
          grad.addColorStop(0,'rgba('+col+',.95)');grad.addColorStop(1,'rgba('+col+',.25)');
          const wob=1+Math.sin(frame/2+gx)*.18;c.strokeStyle=grad;c.lineWidth=Math.max(2.5,lw*(1-t2*.45))*wob;c.beginPath();c.moveTo(gx,gy);c.lineTo(bx,by);c.stroke()}
        c.lineWidth=2;c.strokeStyle='rgba(255,255,255,.9)';c.beginPath();c.moveTo(nx,mY);c.lineTo(bx,by);c.stroke();
        ell(c,ex1,eyY,2.5,2.5,'rgba(255,255,255,.9)');ell(c,ex2,eyY,2.5,2.5,'rgba(255,255,255,.9)');
        for(let k=0;k<7;k++){const a=k/7*6.283+st;ell(c,bx+Math.cos(a)*(st-26)*2.2,by+Math.sin(a)*(st-26)*1.5,2,2,'rgba('+col+','+(1-t2).toFixed(2)+')')}
        c.restore()}}
      if(st>=26&&st<58){c.strokeStyle='rgba('+col+','+((58-st)/32*.7).toFixed(2)+')';c.lineWidth=2;
        c.beginPath();c.ellipse(bx,by,(st-26)*2.2,(st-26)*1.2,0,0,6.283);c.stroke();c.lineWidth=1}
    }
    if(A.t>=SH){
      if(!A.shards){A.shards=[];e.dead=true;e.fadeT=0;B.flash=14;B.shake=22;sfx('shatter');
        const cvs=enemyCanvas(e.t,ET[e.t].bs,0),topy=by-Math.round(cvs.height/3);
        try{const tc2=document.createElement('canvas');tc2.width=cvs.width;tc2.height=cvs.height;
          const tg2=tc2.getContext('2d');tg2.drawImage(cvs,0,0);
          const d=tg2.getImageData(0,0,tc2.width,tc2.height).data;
          for(let k=0;k<140;k++){const sx2=rnd(tc2.width),sy2=rnd(tc2.height),i4=(sy2*tc2.width+sx2)*4;
            if(d[i4+3]<60)continue;
            const a=Math.random()*6.283,sp=.8+Math.random()*2.8;
            A.shards.push({x:bx+sx2-Math.round(tc2.width/2),y:topy+sy2,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-1.6,col:'rgb('+d[i4]+','+d[i4+1]+','+d[i4+2]+')',sz:1+rnd(2)})}
        }catch(err){}
        if(!A.shards.length)for(let k=0;k<48;k++){const a=Math.random()*6.283,sp=1+Math.random()*2.6;
          A.shards.push({x:bx,y:by,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-1.6,col:'#cfd8e8',sz:2})}}
      const sf=Math.max(0,1-(A.t-SH)/70);
      for(const sh2 of A.shards){sh2.x+=sh2.vx;sh2.y+=sh2.vy;sh2.vy+=.07;
        c.globalAlpha=sf;R(c,Math.round(sh2.x),Math.round(sh2.y),sh2.sz,sh2.sz,sh2.col)}
      c.globalAlpha=1;
      if(A.t-SH<24){c.strokeStyle='rgba(235,245,255,'+((24-(A.t-SH))/24*.8).toFixed(2)+')';c.lineWidth=3;
        c.beginPath();c.ellipse(bx,by,(A.t-SH)*4,(A.t-SH)*2.4,0,0,6.283);c.stroke();c.lineWidth=1}
    }
    if(A.t>SH+85){A.done=1;victory()}
  }
  else if(B.ngenA&&!B.ngenA.done){const A=B.ngenA;A.t++;
    const SS=t=>t<=0?0:t>=1?1:t*t*(3-2*t);
    const p=SS(A.t/50),q=SS((A.t-62)/58),gu=A.t>=124;
    if(A.t===2)B.shake=10;
    const fadeOut=A.t>152?Math.max(0,(177-A.t)/25):1;
    c.fillStyle='rgba(0,0,12,'+(.5*p*fadeOut).toFixed(2)+')';c.fillRect(0,0,LW,LH);
    const nx=Math.round(LW*.38),ny=168;
    c.save();c.globalAlpha=.26*p*fadeOut;c.globalCompositeOperation='lighter';
    for(let k=0;k<9;k++){const a=k/9*6.283+frame/60;c.beginPath();c.moveTo(nx,ny-44);
      c.lineTo(nx+Math.cos(a)*LW,ny-44+Math.sin(a)*LW);c.lineTo(nx+Math.cos(a+.09)*LW,ny-44+Math.sin(a+.09)*LW);
      c.closePath();c.fillStyle='rgba(190,255,220,.5)';c.fill()}
    c.restore();
    // the ngen climbs out of the earth: clipped at the ground line, dust at its feet
    const rise=Math.round((1-p)*58);
    const breathe=1+Math.sin(frame/11)*.015+(gu&&A.t<138?Math.sin((A.t-124)/14*3.14)*.08:0);
    const sc=(0.92+p*.6+Math.sin(Math.min(1,A.t/50)*3.14)*.05)*breathe;
    c.save();c.beginPath();c.rect(0,0,LW,ny+9);c.clip();
    c.globalAlpha=Math.min(1,p*1.4);c.translate(nx,ny+rise);c.scale(sc,sc);
    drawNgen(c,0,0,1,frame,A.v==='lafken'?undefined:A.v);
    c.restore();c.globalAlpha=1;
    if(p<1)for(let k=0;k<7;k++){const ph=((frame*2+k*31)%60)/60;
      ell(c,nx-20+k*7+Math.sin(k*5)*3,ny+6-ph*9,2.5*(1-ph)+1,1.5,'rgba(120,100,80,'+(.5*(1-ph)).toFixed(2)+')')}
    const e=A.e,Tt=ET[e.t],cvs=enemyCanvas(e.t,Tt.bs,Math.floor(frame/12)%2);
    if(A.t>=62&&!A.took){A.took=1;e.dead=true;e.fadeT=0;A.x0=e.px;A.y0=e.py-Math.round(cvs.height/3)}
    if(A.took&&!gu){
      // the boss is torn from its place and drawn into the ngen along an arc
      const tx=nx+12,ty=ny-62,mx=(A.x0+tx)/2,my=Math.min(A.y0,ty)-36;
      const bz=t=>[ (1-t)*(1-t)*A.x0+2*(1-t)*t*mx+t*t*tx, ((1-t)*(1-t)*(A.y0+cvs.height/2))+2*(1-t)*t*my+t*t*ty ];
      for(const [dq,ga] of [[.14,.08],[.07,.16],[0,1]]){
        const qq=Math.max(0,q-dq);if(ga<1&&qq<=0)continue;
        const [bx,by]=bz(qq),sx=1-qq*.5,sy=1-qq*.8,rot=-qq*.55;
        const [tcv,tg]=mk(cvs.width,cvs.height);tg.drawImage(cvs,0,0);
        const tintA=.55*(1-qq);
        if(tintA>0.02){tg.globalCompositeOperation='source-atop';
          tg.fillStyle=(Math.floor(frame/7)%2)?'rgba(255,150,40,'+tintA.toFixed(2)+')':'rgba(255,55,25,'+tintA.toFixed(2)+')';
          tg.fillRect(0,0,cvs.width,cvs.height)}
        c.save();c.globalAlpha=ga*(1-qq*.35);c.translate(bx,by);c.rotate(rot);c.scale(sx,sy);
        c.drawImage(tcv,-Math.floor(cvs.width/2),-Math.floor(cvs.height/2));c.restore()}
      c.globalAlpha=1;
      for(let k=0;k<8;k++){const ph=((frame*2+k*37)%80)/80;const [bx,by]=bz(q);
        const sxp=bx+(tx-bx)*ph+Math.sin(ph*9+k)*5,syp=by+(ty-by)*ph;
        R(c,Math.round(sxp),Math.round(syp),1,1,'rgba(190,255,230,'+(.8*q*(1-ph)).toFixed(2)+')')}
    }
    if(gu){
      if(A.t===124){B.flash=12;B.shake=14;sfx('lvl')}
      const rt=(A.t-124);
      if(rt<30){c.strokeStyle='rgba(200,255,235,'+((1-rt/30)*.7).toFixed(2)+')';c.lineWidth=2;
        c.beginPath();c.ellipse(nx+6,ny-58,rt*3.2,rt*1.6,0,0,6.283);c.stroke()}
      for(let k=0;k<6;k++){const ph=((A.t*2+k*29)%70)/70;
        ell(c,nx+6+Math.sin(k*7+A.t/9)*12,ny-58-ph*30,1.5,1.5,'rgba(210,255,240,'+((1-ph)*.6).toFixed(2)+')')}
    }
    if(A.t>176){A.done=1;victory()}
  }
}
/* fixed 60 Hz timestep: game speed is the same at any frame rate.
   A slow phone catches up (up to 4 updates per paint, so it gets choppy,
   not slow); a 120 Hz screen paints twice per update instead of running
   the game at double speed. */
let _lt=0,_acc=0;
function loop(ts){requestAnimationFrame(loop);try{loopBody(ts)}catch(e){console.error(e)}}
function loopBody(ts){
  const now=ts||performance.now();
  if(!_lt)_lt=now;
  _acc+=Math.min(100,now-_lt);_lt=now;
  let steps=0;
  while(_acc>=1000/60&&steps<4){_acc-=1000/60;steps++;
    frame++;
    if(mode==='map'&&M)updateMap();
  }
  if(!steps)return;
  OV=[];
  if(mode==='map'&&M)renderMap();
  else if(mode==='battle'&&B)renderBattle();
  else if(mode==='cut')renderCut();
  else if(mode==='title')paintLand(lx,frame,false);
  if(fade>0&&mode==='map'){lx.fillStyle='rgba(0,0,0,'+(fade/16)+')';lx.fillRect(0,0,LW,LH);fade=Math.max(0,fade-steps)}
  ctx.drawImage(LO,0,0,W,H);
  for(const f of OV)f();
}

