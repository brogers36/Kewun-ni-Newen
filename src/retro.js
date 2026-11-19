/* ============================================================
   RETRO GRAPHICS (drawn at 256x224, shown at 2x)
   ============================================================ */
function mk(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.imageSmoothingEnabled=false;return[c,x]}
function R(c,x,y,w,h,col){c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))}
function ell(c,cx,cy,rx,ry,col){if(rx<=0||ry<=0)return;c.fillStyle=col;for(let y=Math.floor(cy-ry);y<=Math.ceil(cy+ry);y++){const dy=(y+.5-cy)/ry;if(Math.abs(dy)>1)continue;const hw=rx*Math.sqrt(1-dy*dy);const x0=Math.round(cx-hw),x1=Math.round(cx+hw);if(x1>x0)c.fillRect(x0,y,x1-x0,1)}}
function outline(cvs,col){const x=cvs.getContext('2d'),w=cvs.width,h=cvs.height,d=x.getImageData(0,0,w,h),a=d.data,o=new Uint8ClampedArray(a);const [r,g,b]=hexRGB(col);
  for(let y=0;y<h;y++)for(let X=0;X<w;X++){const i=(y*w+X)*4;if(a[i+3]>40)continue;
    if((X+1<w&&a[i+7]>200)||(X>0&&a[i-1]>200)||(y+1<h&&a[i+w*4+3]>200)||(y>0&&a[i-w*4+3]>200)){o[i]=r;o[i+1]=g;o[i+2]=b;o[i+3]=255}}
  d.data.set(o);x.putImageData(d,0,0);return cvs}
function mirror(src){const [c,x]=mk(src.width,src.height);x.translate(src.width,0);x.scale(-1,1);x.drawImage(src,0,0);return c}
/* cel shading: three flat tones (highlight / base / shadow), light from the top-left */
function cel(cvs,str){
  const x=cvs.getContext('2d'),w=cvs.width,h=cvs.height,d=x.getImageData(0,0,w,h),a=d.data,o=new Uint8ClampedArray(a);
  const op=(X,Y)=>X>=0&&Y>=0&&X<w&&Y<h&&a[(Y*w+X)*4+3]>128;let minY=h,maxY=0;
  for(let y=0;y<h;y++)for(let X=0;X<w;X++)if(a[(y*w+X)*4+3]>128){if(y<minY)minY=y;if(y>maxY)maxY=y}
  const span=Math.max(1,maxY-minY),k=Math.max(1,Math.round(w/24));
  for(let y=0;y<h;y++)for(let X=0;X<w;X++){const i=(y*w+X)*4;if(a[i+3]<=128)continue;
    let l=(.4-(y-minY)/span)*.5;if(!op(X-k,y-k))l+=.5;if(!op(X+k,y+k)||!op(X+2*k,y+2*k))l-=.5;l*=str||1;
    if(l>.25)for(let c=0;c<3;c++)o[i+c]=a[i+c]+(255-a[i+c])*.3;
    else if(l<-.2){o[i]=a[i]*.68;o[i+1]=a[i+1]*.68;o[i+2]=Math.min(255,a[i+2]*.78)}}
  d.data.set(o);x.putImageData(d,0,0);return cvs}
const lerp3=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
/* crisp text on the 2x canvas, positioned in 1x coordinates */
function txt(s,x,y,col,size,align){ctx.font='bold '+size+'px ui-monospace,Menlo,Consolas,monospace';ctx.textAlign=align||'left';ctx.fillStyle='#000';
  for(const [dx,dy] of [[-1,0],[1,0],[0,-1],[0,1],[1,1]])ctx.fillText(s,x*2+dx,y*2+dy);ctx.fillStyle=col;ctx.fillText(s,x*2,y*2);ctx.textAlign='left'}

/* ---------- characters from hand-drawn 16x24 templates ---------- */
const BASEP={o:'#181018',s:'#e8a878',S:'#c07850',h:'#201820',H:'#584860',b:'#d83030',B:'#f8d050',p:'#3050b0',P:'#203878',w:'#f0e8d0',r:'#d83030',l:'#5a4430',L:'#3a2a1c',f:'#6a3a1a',e:'#201018',W:'#ffffff',m:'#a04838',q:'#f09878',x:'#e0e0f0',X:'#9898b0',k:'#282438',K:'#14121e',c:'#8a2458',C:'#5a1838'};
const LOOKS={
  llanka:{t:'M'},
  millaray:{t:'F',r:'#2a64c8',c:'#8a2458'},
  kuku:{t:'F',h:'#c8c8d0',H:'#f4f4fa',s:'#d09868',S:'#a87048',c:'#4a2a5a',C:'#2e1a3a',r:'#c03030'},
  lonko:{t:'M',p:'#6a2818',P:'#481408',w:'#f0dca0',r:'#202020',b:'#c82828'},
  seller:{t:'M',p:'#9a6a30',P:'#6e4a1c',b:'#2f8d4a',r:'#2f8d4a',s:'#d8986a'},
  fisher:{t:'M',p:'#4a6a5a',P:'#30483c',b:'#2a64a8',r:'#2a64a8',s:'#c88858'},
  fisherw:{t:'F',c:'#2a64a8',C:'#1a4078',r:'#e0b040'},
  weaver:{t:'F',c:'#c06020',C:'#8a4010',r:'#d83030'},
  cook:{t:'F',c:'#2f8d4a',C:'#1c6030',r:'#e0b040'},
  teacher:{t:'F',c:'#d8a020',C:'#a07010',r:'#2a64c8'},
  gatherer:{t:'F',c:'#8a2458',C:'#5a1838',r:'#2f8d4a'},
  child:{t:'M',p:'#8e2c4c',P:'#661c34',b:'#e8641e',r:'#e8641e',small:1},
  childf:{t:'F',c:'#e8641e',C:'#a8440e',r:'#2f8d4a',small:1},
  palinA:{t:'M',p:'#c02828',P:'#801818',b:'#f8f8f8',r:'#f8f8f8',w:'#f8f8f8'},
  palinB:{t:'M',p:'#2a64c8',P:'#1a4088',b:'#f8f8f8',r:'#f8f8f8',w:'#f8f8f8'},
  walker:{t:'M',p:'#7a6a4a',P:'#5a4a30',b:'#c0a020',r:'#c0a020'},
  kona:{t:'M',p:'#2a5a3a',P:'#1a3a26',b:'#f0f0f0',r:'#e0b040'},
  lonko2:{t:'M',p:'#3a3a6a',P:'#24244a',w:'#e8d8a0',r:'#c82828',b:'#c82828',s:'#c47c4c',S:'#985830'},
  elder:{t:'M',h:'#c8c8d0',H:'#f0f0f8',p:'#5a4a3a',P:'#3a2e24',b:'#8a2458',r:'#e8d8a0',s:'#b8784c',S:'#8a5634'}};
const CCACHE={};
function charSprite(look,dir,fr){
  fr=[0,1,0,2][fr%4];const key=look+dir+fr;if(CCACHE[key])return CCACHE[key];
  if(dir==='left')return CCACHE[key]=mirror(charSprite(look,'right',fr===1?1:fr===2?3:0));
  const L0=LOOKS[look],pal=Object.assign({},BASEP,L0),F=L0.t==='F',d=dir==='up'?'U':dir==='right'?'R':'D';
  const head=SPR[(F?'HEAD_F_':'HEAD_M_')+d],body=SPR[(F?'BODY_F_':'BODY_M_')+d],legs=SPR[(F?'LEGSF_':'LEGS_')+(d==='R'?'R':'D')][fr];
  const rows=head.concat(body,legs),[cvs,c]=mk(16,24);
  rows.forEach((r,y)=>{for(let x=0;x<16;x++){const ch=r[x];if(ch!=='.'){c.fillStyle=pal[ch]||'#ff00ff';c.fillRect(x,y,1,1)}}});
  return CCACHE[key]=cvs;
}
function drawChar(c,look,x,y,dir,fr,seated){
  ell(c,x+8,y+14,6,2,'rgba(0,0,0,.3)');
  const s=charSprite(look,dir,fr);
  if(seated){c.drawImage(s,0,0,16,19,x,y-5,16,19);return}
  if(LOOKS[look].small)c.drawImage(s,x+2,y-4,12,18);else c.drawImage(s,x,y-9);
}
const DOG=["................","..oo............",".obbo........o..",".obbboooooooobo.",".obebbbbbbbbbbo.","..oobbbbbbbbbo..","....obbbbbbbbo..","....oboo..obo...","....obo...obo...","....oo....oo...."];
const DOG2=["................","..oo............",".obbo.........o.",".obbbooooooooob.",".obebbbbbbbbbbo.","..oobbbbbbbbbo..","....obbbbbbbbo..","...obo.....obo..","...obo....obo...","...oo.....oo...."];
function dogSprite(fr,dir){const key='dog'+fr+dir;if(CCACHE[key])return CCACHE[key];const [cvs,c]=mk(16,10);
  (fr?DOG2:DOG).forEach((r,y)=>{for(let x=0;x<16;x++){const ch=r[x];if(ch!=='.'){c.fillStyle=ch==='o'?'#181018':ch==='e'?'#000':'#a06838';c.fillRect(x,y,1,1)}}});
  return CCACHE[key]=dir==='right'?mirror(cvs):cvs}
function drawNgen(c,x,y,s,t,v){
  if(v==='mawida'){const b=k=>Math.round(k*s);
    for(const [r,a] of [[16,.08],[12,.12],[9,.16]])ell(c,x,y-b(14),b(r),b(r*1.15),'rgba(200,240,140,'+a+')');
    ell(c,x,y-b(2),b(8),b(2.5),'#4a3a1a');ell(c,x,y-b(10),b(5),b(9),'#5a8a2a');ell(c,x-b(1),y-b(12),b(3.4),b(6.5),'#8ac850');
    ell(c,x,y-b(21),b(4),b(4),'#a8d870');for(let i=0;i<6;i++){const a=i/6*6.28+t/40;ell(c,x+Math.cos(a)*b(5),y-b(24)+Math.sin(a)*b(2),b(1.6),b(1.2),'#4a9a3a')}
    R(c,x-b(1.6),y-b(21),Math.max(1,b(.9)),Math.max(1,b(1.2)),'#2a4a1a');R(c,x+b(.8),y-b(21),Math.max(1,b(.9)),Math.max(1,b(1.2)),'#2a4a1a');
    for(let i=0;i<6;i++){const a=t/20+i*1.05;R(c,x+Math.round(Math.cos(a)*b(10)),y-b(14)+Math.round(Math.sin(a)*b(12)),Math.max(1,b(.7)),Math.max(1,b(.7)),'#f8f0a0')}return}
  const b=k=>Math.round(k*s);
  for(const [r,a] of [[16,.08],[12,.12],[9,.16]])ell(c,x,y-b(14),b(r),b(r*1.15),'rgba(160,220,255,'+a+')');
  const wob=Math.sin(t/12)*s;
  ell(c,x,y-b(2),b(9),b(3),'rgba(232,248,255,.9)');ell(c,x,y-b(10),b(5.5)+wob*.3,b(9),'#5aa8e0');ell(c,x-b(1),y-b(12),b(3.6),b(6.5),'#9ad8f8');
  ell(c,x,y-b(21),b(3.6),b(3.8),'#d8f2ff');ell(c,x-b(1),y-b(22),b(1.6),b(1.6),'#ffffff');
  R(c,x-b(1.6),y-b(22),Math.max(1,b(.9)),Math.max(1,b(1.2)),'#2a64a8');R(c,x+b(.8),y-b(22),Math.max(1,b(.9)),Math.max(1,b(1.2)),'#2a64a8');
  for(let i=0;i<6;i++){const a=t/20+i*1.05;R(c,x+Math.round(Math.cos(a)*b(10)),y-b(14)+Math.round(Math.sin(a)*b(12)),Math.max(1,b(.7)),Math.max(1,b(.7)),'#ffffff')}
  ell(c,x-b(6),y-b(4),b(3),b(1.4),'#e8f6ff');ell(c,x+b(6),y-b(4),b(3),b(1.4),'#e8f6ff');
}

/* ---------- enemies (designed on a 16-unit grid, cel-shaded at any size) ---------- */
const ECACHE={};
function enemyCanvas(t,size,fr){
  const key=t+size+'_'+fr;if(ECACHE[key])return ECACHE[key];
  if(typeof SPR2!=='undefined'&&SPR2[t]){const k=Math.max(1,Math.floor(size/48)),base=tplCanvas(t,fr,k),pd=6*k,[cv,cc]=mk(base.width+pd*2,base.height+pd);
    for(const [r,al] of [[1,.10],[.8,.12],[.6,.14]]){cc.fillStyle='rgba(170,220,255,'+al+')';cc.beginPath();cc.ellipse(cv.width/2,cv.height*.45,cv.width/2*r,cv.height/2*r,0,0,6.283);cc.fill()}
    cc.drawImage(base,pd,pd);return ECACHE[key]=cv}
  const pad=3,s=size/16,[cvs,c]=mk(size+pad*2,size+pad*2);
  const E=(cx,cy,rx,ry,col)=>ell(c,pad+cx*s,pad+cy*s,rx*s,ry*s,col);
  const Q=(x,y,w,h,col)=>R(c,pad+x*s,pad+y*s,Math.max(1,w*s),Math.max(1,h*s),col);
  if(t==='laftrache'||t==='nidol'){const bob=fr?.3:0,big=t==='nidol';
    E(5.5,15,1.8,.8,'#24332a');E(10.5,15,1.8,.8,'#24332a');
    E(8,11.6+bob,4.4,3.6,big?'#2c4a5a':'#3e5a4c');Q(4.4,12.6+bob,7.2,.7,'#6a4a2a');Q(7.6,12.5+bob,.9,.9,'#d8b040');
    E(3.4,11.4+bob,1.3,2.2,'#6f8f7c');E(12.6,11.4+bob,1.3,2.2,'#6f8f7c');
    E(8,6.2+bob,4.7,4.3,'#7e9e8a');E(6.4,4.6+bob,1.6,1.1,'#a4c2ae');E(3.4,6.2+bob,.9,1.3,'#7e9e8a');E(12.6,6.2+bob,.9,1.3,'#7e9e8a');
    E(8,2.8+bob,4.6,1.9,'#244034');for(let i=0;i<5;i++)Q(4+i*1.7,3.2+bob,.6,1.4+(i%2),'#2e5040');
    if(big){for(let i=0;i<5;i++)E(4.5+i*1.75,1.6+bob-(i%2)*.6,.9,1.2,'#3a8a6a');Q(13,7+bob,1.2,7,'#6a4424');E(13.6,6.6+bob,1.5,1.3,'#8a8a96')}
    E(8,9.4+bob,3.6,2.7,'#eef0f2');E(8,11.2+bob,2.3,2.1,'#d4dae0');
    Q(5.6,5.8+bob,1.5,1.2,'#ff3a2a');Q(9,5.8+bob,1.5,1.2,'#ff3a2a');Q(5.9,5.8+bob,.6,.5,'#ffe0d0');Q(9.3,5.8+bob,.6,.5,'#ffe0d0')}
  else if(t==='chonchon'){const wy=fr?-2.6:1.4,w1='#6e4430',w2='#9a6a48',w3='#3e2216';
    for(const sd of [-1,1]){const cx=8+sd*5.2;E(cx,6.5+wy,3.7,2.2,w1);E(cx+sd*.8,7.6+wy,3.1,1.4,w2);E(cx+sd*2.2,6+wy,1.4,1.6,w3);for(let k=0;k<3;k++)Q(cx-.6+sd*(k*1.1),5.2+wy,.4,2.2,w3)}
    E(8,8.2,3.8,4.1,'#d8bf9c');E(8,5,3.8,1.9,'#1e1418');Q(4.4,5,1,3.4,'#1e1418');Q(10.6,5,1,3.4,'#1e1418');
    E(6.5,8.2,1,1,'#ffe040');E(9.5,8.2,1,1,'#ffe040');Q(6.35,7.8,.5,.9,'#000');Q(9.35,7.8,.5,.9,'#000');Q(5.4,7,2,.5,'#2a1a14');Q(8.6,7,2,.5,'#2a1a14');
    E(8,10.9,1.4,.9,'#5a1418');Q(7.3,10.5,.5,.6,'#fff');Q(8.3,10.5,.5,.6,'#fff')}
  else if(t==='anchi'){
    E(8,5.6,2.4,2.4,'#fff6c8');E(8,10.4,2.6,3.2,'#ffe27a');Q(6,13,1.2,2,'#ffe27a');Q(8.8,13,1.2,2,'#f0c040');Q(5,9,1,2.6,'#fff0a0');Q(10.6,9,1,2.6,'#f0c040');
    Q(7,5.4,.7,.8,'#8a5a10');Q(8.6,5.4,.7,.8,'#8a5a10')}
  else if(t==='piwichen'){const wy=fr?-1.6:1;
    for(const sd of [-1,1]){const cx=8+sd*5.4;E(cx,5+wy,3.6,2.4,'#5a2a5a');E(cx+sd*1.4,6.2+wy,2.4,1.2,'#8a4a8a');for(let k=0;k<3;k++)Q(cx-.4+sd*k,3.8+wy,.4,2.6,'#3a1a3a')}
    E(8,12,4.6,2.2,'#2a7a6a');E(10.5,10.4,2.6,1.6,'#3a9a80');E(6,13.4,3,1.2,'#3a9a80');E(8,8.4,2.4,3,'#3a9a80');
    for(let i=0;i<6;i++)Q(5+i*1.2,11.2+(i%2)*.6,.5,.5,'#a8e0c0');
    E(8,5.4,2.6,2.2,'#4ab090');Q(6.6,4.6,.9,.9,'#ff4040');Q(8.6,4.6,.9,.9,'#ff4040');Q(7.4,6.6,1.2,.5,'#200');Q(7.6,7,.3,.8,'#f0f0f0');Q(8.2,7,.3,.8,'#f0f0f0')}
  else if(t==='kolokolo'||t==='fkolokolo'){const big=t==='fkolokolo',bob=fr?.3:0;
    for(let i=0;i<8;i++)E(2.2+i*.5,13.2-Math.sin(i*.7+(fr?1:0))*1.2,.8,.8,'#6a5a4a');
    E(9,11+bob,4.2,3.2,big?'#5a4a5a':'#7a6a5a');E(9,12.4+bob,3,1.6,'#a89888');
    E(11.5,7.2+bob,3.2,2.8,big?'#6a5a6a':'#8a7a6a');E(10.4,4.6+bob,1.3,1.8,'#c09090');E(13,4.6+bob,1.3,1.8,'#c09090');E(10.4,4.8+bob,.6,1,'#704050');E(13,4.8+bob,.6,1,'#704050');
    Q(10.6,6.6+bob,1,1,'#ff3030');Q(12.6,6.6+bob,1,1,'#ff3030');E(14.6,8+bob,.8,.6,'#402828');Q(13.4,9+bob,.4,.8,'#f0f0f0');Q(14,9+bob,.4,.8,'#f0f0f0');
    for(let i=0;i<4;i++)Q(6+i*1.4,14+bob,.5,1,'#4a3a2a');if(big){for(let i=0;i<5;i++)Q(6+i*1.2,8.2+bob,.6,1.2,'#3a2a3a')}}
  else if(t==='nguruvilu'){const wv=fr?.4:0;
    E(4,13,3.6,1.6,'#2a6a5a');E(8,12+wv,3.4,1.8,'#3a8a6a');E(11.5,10-wv,2.4,2.4,'#3a8a6a');E(12,7,2,2.6,'#3a8a6a');for(let i=0;i<6;i++)Q(3+i*1.6,12.2+(i%2)*.5,.6,.6,'#9ad8b0');
    E(10.5,4.4,3.4,2.6,'#d8742a');E(9,2.4,1,1.8,'#d8742a');E(12,2.4,1,1.8,'#d8742a');E(10.5,5.4,2,1.4,'#f4e0c8');E(7.6,5,1.6,1,'#d8742a');Q(6.6,4.6,.8,.8,'#181018');
    Q(9.4,3.8,.8,.8,'#ffe040');Q(11.6,3.8,.8,.8,'#ffe040');Q(9.6,4,.4,.5,'#000');Q(11.8,4,.4,.5,'#000');E(1.4,14,1.4,1,'#d8742a')}
  else if(t==='witranalwe'){const sw=fr?.3:0;
    E(8,15,4,.8,'rgba(0,0,0,.3)');Q(6.4,10,1.2,5,'#1a1a2a');Q(8.6,10,1.2,5,'#1a1a2a');
    for(let y=4;y<11;y++){const hw=1.6+(y-4)*.35;Q(8-hw,y,hw*2,1,'#2a2a44')}Q(6.8,4,2.4,7,'#3a3a5a');
    Q(3.6+sw,5,1,6.5,'#2a2a44');Q(11.4-sw,5,1,6.5,'#2a2a44');Q(3.4+sw,11.4,1.4,1,'#c8d8f0');Q(11.2-sw,11.4,1.4,1,'#c8d8f0');
    E(8,2.6,1.8,1.8,'#c8d8f0');Q(5,1.2,6,.9,'#1a1a2a');Q(6.2,.2,3.6,1.2,'#1a1a2a');Q(7.2,2.4,.6,.5,'#40e0ff');Q(8.4,2.4,.6,.5,'#40e0ff');
    for(let i=0;i<5;i++)Q(5+i*1.5,7+(i%2),.4,.4,'#c8d8f0')}
  else if(t==='trelke'){const wb=fr?.25:0;
    E(8,9,7.6,5.4+wb,'#6c4020');E(4,8.2,3.4,4.2,'#6c4020');E(12,8.2,3.4,4.2,'#6c4020');E(8,9,6.6,4.4,'#8a5630');
    E(5.5,8,2,1.4,'#efe4d0');E(11,10.6,1.9,1.2,'#efe4d0');E(9.4,6.4,1.4,1,'#efe4d0');E(4.4,11,1.2,.9,'#efe4d0');
    for(let k=0;k<18;k++){const a=k/18*Math.PI*2,px=8+Math.cos(a)*7.9,py=9+Math.sin(a)*(5.9+wb);Q(px-.3,py-.3,.8,.8,'#f6f0e4')}
    E(6.2,8.6,1.5,1.2,'#ffd400');E(9.8,8.6,1.5,1.2,'#ffd400');Q(6.05,7.9,.4,1.4,'#200');Q(9.65,7.9,.4,1.4,'#200');
    Q(5,11.6,6,.5,'#2a1006');for(let i=0;i<6;i++)Q(5.2+i*1,11.95,.35,.5,'#efe4d0')}
  if(t!=='anchi')cel(cvs,1);
  outline(cvs,'#181018');
  if(t==='anchi'){const [g,gx]=mk(cvs.width,cvs.height),cx=cvs.width/2,cy=cvs.height/2;
    for(const [r,a] of [[7.8,.15],[6.4,.22],[5,.3]])ell(gx,cx,cy+s,r*s*(fr?1.06:1),r*s*(fr?1.06:1),'rgba(255,220,90,'+a+')');
    for(let i=0;i<4;i++){const a=i*1.57+(fr?.6:0);R(gx,cx+Math.cos(a)*6.6*s,cy+Math.sin(a)*6.6*s,Math.max(1,s*.6),Math.max(1,s*.6),'#fffbe0')}
    gx.drawImage(cvs,0,0);return ECACHE[key]=g}
  return ECACHE[key]=cvs;
}

/* ---------- props ---------- */
const PCACHE={};
function treeCanvas(v,style){
  style=style||'lafken';const k='tree'+style+v;if(PCACHE[k])return PCACHE[k];
  if(style==='koyam'){const [cvs,c]=mk(24,30);
    R(c,10,17,4,11,'#5a3a1e');R(c,12,17,2,11,'#3e2612');R(c,9,27,6,1,'#4a2e16');R(c,7,15,4,2,'#5a3a1e');R(c,13,14,4,2,'#5a3a1e');R(c,11,20,1,3,'#7a5230');
    const lobes=[[7,11,5.5,4.5],[16,10,5.5,4.5],[11.5,6,7,5],[12,12,6,3.5],[5+v%2,7,3.5,3],[18-v%2,6,3.5,3]];
    for(const [x,y,rx,ry] of lobes)ell(c,x,y+1,rx,ry,'#4a6a1c');
    for(const [x,y,rx,ry] of lobes)ell(c,x,y,rx-.8,ry-.8,'#6e8e2a');
    for(const [x,y,rx,ry] of lobes)ell(c,x-1,y-1,rx*.5,ry*.5,'#9ab442');
    for(let i=0;i<18;i++){const px=2+Math.floor(h2(i,v,61)*20),py=2+Math.floor(h2(i,v,62)*12);if(h2(i,v,63)<.6)R(c,px,py,1,1,h2(i,v,64)<.5?'#c8d468':'#3a5414')}
    outline(cvs,'#1a2408');return PCACHE[k]=cvs}
  if(style==='mawida'){const [cvs,c]=mk(22,34);
    R(c,9,22,4,10,'#3a2a1a');R(c,11,22,2,10,'#24180e');R(c,8,31,6,1,'#2e2014');R(c,9,25,1,2,'#4a6a3a');R(c,12,28,1,2,'#4a6a3a');
    const tiers=[[11,20,9,4],[11,15,8,4],[11,10,6.5,4],[11,5.5,4.5,3.5],[11,2.5,2.5,2]];
    for(const [x,y,rx,ry] of tiers){ell(c,x,y+1,rx,ry,'#123a2e');ell(c,x-.5,y,rx-.8,ry-.9,'#1e5a44');ell(c,x-2,y-1,rx*.45,ry*.45,'#2e7a5a')}
    for(let i=0;i<12;i++){const px=3+Math.floor(h2(i,v,71)*16),py=3+Math.floor(h2(i,v,72)*20);if(h2(i,v,73)<.5)R(c,px,py,1,1,'#5aa078')}
    outline(cvs,'#06140e');return PCACHE[k]=cvs}
  const [cvs,c]=mk(20,26);
  R(c,8,17,4,7,'#6a4020');R(c,10,17,2,7,'#4a2a12');R(c,7,23,6,1,'#5a3418');
  ell(c,10,9.5,9.5,8.5,'#1c5c24');ell(c,9.5,9,8.2,7.4,'#287828');ell(c,8.5,7.5,6,5,'#40983c');
  for(let i=0;i<14;i++){const an=i/14*Math.PI*2;R(c,9.5+Math.cos(an)*5.6,8.5+Math.sin(an)*4.6,1,1,'#88d070')}
  ell(c,7,5.5,2,1.5,'#a8e088');R(c,12,12,3,1,'#14401c');R(c,4,11,2,1,'#14401c');
  outline(cvs,'#0c200c');return PCACHE[k]=cvs}
function rockCanvas(v){
  const k='rock'+v;if(PCACHE[k])return PCACHE[k];const [cvs,c]=mk(16,14);
  ell(c,8,8,7,5.5,'#686878');ell(c,7,7,5.5,4,'#9898a8');ell(c,5,5,2,1.4,'#d0d0dc');R(c,10,10,3,1,'#484858');R(c,2,9,2,1,'#484858');
  outline(cvs,'#202028');return PCACHE[k]=cvs}
function rukaCanvas(bw,bh){
  const k='ruka'+bw+'x'+bh;if(PCACHE[k])return PCACHE[k];
  const W0=bw*16,H0=bh*16,ox=2,oy=10,[cvs,c]=mk(W0+4,H0+12),cx=ox+W0/2;
  const wallTop=oy+H0-12,wallBot=oy+H0-1;
  for(let x=ox+4;x<ox+W0-4;x++)for(let y=wallTop;y<wallBot;y++)R(c,x,y,1,1,(x%2)?'#8a6a40':'#6e5230');
  R(c,ox+4,wallTop+5,W0-8,1,'#4a3418');R(c,ox+3,wallBot-1,W0-6,2,'#5a3a1e');
  R(c,cx-4,wallTop+1,8,wallBot-wallTop-1,'#140a04');R(c,cx-5,wallTop,1,wallBot-wallTop,'#6a4424');R(c,cx+4,wallTop,1,wallBot-wallTop,'#6a4424');R(c,cx-3,wallTop+1,3,5,'#a07850');
  const top=oy-8,eave=wallTop+2,rw=W0/2+1,dcy=eave-6,dry=dcy-top;
  const TH=['#f0cc78','#d4a850','#b08434','#8a6424'];
  for(let y=top;y<=eave;y++){let half=rw;if(y<dcy){const t=(dcy-y)/dry;half=rw*Math.pow(Math.max(0,1-Math.pow(t,2.2)),1/2.2)}
    const v=(y-top)/(eave-top);
    for(let x=Math.round(cx-half);x<Math.round(cx+half);x++){
      let ti=v<.25?0:v<.55?1:v<.85?2:3;const xr=(x-(cx-half))/(2*half);if(xr>.78&&ti<3)ti++;if(xr<.18&&ti>0&&v<.7)ti--;
      if((y-top+((x>>1)%2))%4===0)ti=Math.min(3,ti+1);
      R(c,x,y,1,1,TH[ti])}}
  for(let x=Math.round(cx-rw);x<Math.round(cx+rw);x++){const len=1+Math.floor(h2(x,9,44)*3);R(c,x,eave,1,len,(x%2)?'#8a6424':'#6a4818')}
  ell(c,cx,top+2,W0*.18,2,'#c89a48');R(c,cx-2,top+1,4,2,'#3a2410');
  outline(cvs,'#2a1808');
  return PCACHE[k]={cvs,ox,oy,smoke:[cx-ox,top-oy+1]};
}
function tplCanvas(name,fr,k,pad){
  const key='tp'+name+fr+'_'+k+'_'+(pad||0);if(PCACHE[key])return PCACHE[key];
  const d=SPR2[name],rows=d.f[fr%d.f.length],h=rows.length,w=rows[0].length,p=pad||0,[cvs,c]=mk(w*k+p*2,h*k+p*2);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const ch=rows[y][x];if(ch!=='.')R(c,p+x*k,p+y*k,k,k,d.pal[ch])}
  return PCACHE[key]=cvs}
function animalCanvas(t,fr,dir){
  const key='an'+t+fr+dir;if(PCACHE[key])return PCACHE[key];
  const base=tplCanvas(t,fr,1);return PCACHE[key]=dir==='right'?mirror(base):base}
function loomCanvas(prog){
  const [cvs,c]=mk(16,22);R(c,1,2,2,20,'#6a4020');R(c,13,2,2,20,'#6a4020');R(c,0,2,16,2,'#8a5a30');R(c,0,18,16,2,'#8a5a30');
  for(let x=3;x<13;x++)R(c,x,4,1,14,'#e8dcc0');
  const rows=Math.floor(prog);for(let y=0;y<rows&&y<14;y++)for(let x=3;x<13;x++){const d=Math.abs(((x-8)%6+6)%6-3)+Math.abs((y%6)-3);R(c,x,17-y,1,1,d<=1?'#c82828':d===2?'#181018':'#f0e8d0')}
  outline(cvs,'#181018');return cvs}
function potCanvas(f){const [cvs,c]=mk(16,16);
  for(let i=0;i<3;i++)ell(c,3+i*5,13,2,1.5,'#7a7a84');
  R(c,5,11+(f%2),2,2,'#ff9a2a');R(c,9,11+((f+1)%2),2,2,'#e04818');R(c,7,12,2,2,'#fff2a0');
  ell(c,8,8,6,4.5,'#2a2a30');ell(c,7,7,3,2,'#4a4a54');R(c,2,4,12,2,'#3a3a44');R(c,3,4,10,1,'#8a6a4a');
  outline(cvs,'#101014');return cvs}
function boardCanvas(){const k='board';if(PCACHE[k])return PCACHE[k];const [cvs,c]=mk(24,22);
  R(c,3,12,2,10,'#6a4020');R(c,19,12,2,10,'#6a4020');R(c,0,0,24,14,'#5a3418');R(c,1,1,22,12,'#2c4a34');
  outline(cvs,'#181018');return PCACHE[k]=cvs}

/* ---------- dynamic tile objects (16x16) ---------- */
const DCACHE={};
function dynCanvas(ch,f){
  const k=ch+f;if(DCACHE[k])return DCACHE[k];const [cvs,c]=mk(16,16);let ol='#181018';
  switch(ch){
  case 'C':R(c,1,4,14,11,'#8a5428');R(c,1,4,14,4,'#b07038');R(c,1,8,14,1,'#5a3416');R(c,1,4,1,11,'#e0b84a');R(c,14,4,1,11,'#e0b84a');R(c,1,4,14,1,'#f0d070');R(c,6,7,4,4,'#e0b84a');R(c,7,8,2,2,'#2a1408');break;
  case 'K':R(c,1,0,14,16,'#7e522c');for(let i=0;i<7;i++){R(c,1+i*2,3+(i%2),2,1,'#f0dca0');R(c,1+i*2,12-(i%2),2,1,'#c03a2e')}R(c,1,7,14,2,'#5a3a1e');ell(c,8,8,2.5,2.5,'#f0dca0');R(c,7,7,2,2,'#c03a2e');R(c,1,0,14,1,'#a8784a');break;
  case 'S':ol=null;R(c,0,0,16,16,'#0c0806');for(let i=0;i<5;i++){R(c,1+i,2+i*3,14-i*2,2,'#4a3a2e');R(c,1+i,2+i*3,14-i*2,1,'#7a6a58')}break;
  case 'I':R(c,7,8,2,8,'#5a3418');R(c,1,2,14,7,'#c99a5a');R(c,1,2,14,1,'#e8c088');R(c,3,4,9,1,'#6b4a2b');R(c,3,6,6,1,'#6b4a2b');break;
  case 'P':R(c,3,4,4,3,'#e83048');R(c,9,4,4,3,'#e83048');R(c,2,5,12,4,'#e83048');R(c,3,9,10,2,'#e83048');R(c,5,11,6,1,'#b81830');R(c,7,12,2,1,'#b81830');R(c,4,5,2,1,'#ffd0d8');R(c,12,7,1,2,'#b81830');break;
  case 'm':for(let i=0;i<9;i++){R(c,3+i,12-i,2,1,'#f6f6f6');R(c,3+i,13-i,1,1,'#8a8a96')}R(c,2,12,1,3,'#3a2a1a');break;
  case 'g':ell(c,8,8,3.4,5.4,'#c88a18');ell(c,7.5,7.5,2.6,4.6,'#f0c040');R(c,6,5,1,3,'#fff4b0');break;
  case 'p':ell(c,8,8,5.4,5.4,'#4a5a1e');for(let i=0;i<3;i++)for(let j=0;j<3;j++)R(c,4+i*3+(j%2),4+j*3,2,2,'#a8c050');break;
  case 'k':R(c,3,6,6,5,'#e0b030');R(c,5,7,2,3,'#7a5410');R(c,9,8,6,2,'#e0b030');R(c,12,10,1,2,'#e0b030');R(c,14,10,1,2,'#e0b030');R(c,3,6,6,1,'#fff0a0');break;
  case 'L':R(c,0,0,16,16,'#5a3a1e');R(c,1,1,14,15,'#7e522c');for(let i=0;i<4;i++)R(c,2+i*4,1,1,15,'#5a3a1e');R(c,1,5,14,2,'#8a8a96');R(c,1,11,14,2,'#8a8a96');ell(c,8,9,2.5,2.5,'#e0b030');R(c,7,9,2,3,'#181018');break;
  case 'G':ol=null;R(c,0,0,16,2,'#5a5a68');R(c,0,14,16,2,'#3a3a48');for(let i=0;i<4;i++){R(c,1+i*4,0,2,16,'#8a8a9a');R(c,1+i*4,0,1,16,'#c0c0d0')}break;
  case 'B':R(c,1,1,14,14,'#8a8a9a');R(c,1,1,14,2,'#c0c0d0');R(c,1,1,2,14,'#b0b0c0');R(c,1,13,14,2,'#5a5a68');R(c,13,1,2,14,'#5a5a68');R(c,6,6,4,4,'#6a6a7a');break;
  case 'O':ol=null;ell(c,8,8,6.5,6,'#3a3a48');ell(c,8,7.5,5.5,5,'#9a8a5a');ell(c,8,7.5,3,2.6,'#c8b878');break;
  case 'q':ol=null;ell(c,8,8,6.5,6,'#3a3a48');ell(c,8,8.5,5.5,4.5,'#6a7a4a');ell(c,8,8.5,3,2,'#9ac070');break;
  case 'Q':R(c,1,0,14,14,'#8a8a9a');R(c,1,0,14,2,'#c0c0d0');R(c,1,0,2,14,'#b0b0c0');R(c,1,12,14,2,'#5a5a68');R(c,13,0,2,14,'#5a5a68');R(c,5,5,6,4,'#9ac070');break;
  case 'F':for(let i=0;i<7;i++){const a=i/7*Math.PI*2;ell(c,8+Math.cos(a)*5.5,11+Math.sin(a)*3,1.8,1.4,i%2?'#8a8a94':'#6a6a74')}ell(c,8,11,3.5,1.8,'#2a1408');R(c,5,10,6,1,'#6a3a18');
    outline(cvs,'#181018');{const fl=[[0,0],[1,-1],[-1,0],[0,1]][f];ell(c,8+fl[0]*.5,7+fl[1]*.5,3.2,4.6,'#e04818');ell(c,8,7.6,2.2,3.4,'#ff9a2a');ell(c,8,9,1.2,1.8,'#fff2a0');R(c,7+fl[0],2+fl[1],1,1,'#ffb43a');}return DCACHE[k]=cvs;
  case 'N':{R(c,3,2,10,13,'#7a7a8a');R(c,3,2,10,2,'#a8a8b8');R(c,3,2,2,13,'#9898a8');R(c,11,3,2,12,'#5a5a6a');R(c,2,14,12,2,'#5a5a6a');
    const g=f?'#80e0ff':'#4a4a5a';R(c,6,5,4,1,g);R(c,7,6,2,4,g);R(c,6,10,4,1,g);if(f){R(c,5,4,6,1,'#c0f0ff')}break}
  case 'J':{const [col,lit]=String(f).split('|');R(c,3,9,10,3,'#6a6a7a');R(c,4,12,2,4,'#4a4a5a');R(c,10,12,2,4,'#4a4a5a');R(c,3,9,10,1,'#9a9aaa');R(c,4,8,8,2,'#2a1a10');
    if(lit==='1'){outline(cvs,'#181018');ell(c,8,5,3.2,4.4,col);ell(c,8,6,2,2.6,'#ffffff');R(c,7,0,2,2,col);return DCACHE[k]=cvs}
    R(c,6,7,4,1,'#4a3a2a');break}
  case 'H':ell(c,8,9,6.5,6.5,'#7a7a8a');ell(c,7,8,5,5,'#9a9aaa');R(c,5,7,2,2,'#2a2a3a');R(c,9,7,2,2,'#2a2a3a');R(c,6,11,4,1,'#2a2a3a');R(c,5,6,2,1,'#c0c0d0');R(c,3,12,4,2,'#3a8a3a');R(c,10,3,3,2,'#3a8a3a');break;
  case 'E':R(c,0,0,16,16,'#6a6a7a');R(c,0,0,16,2,'#a8a8b8');R(c,1,2,14,13,'#7e7e8e');R(c,7,3,2,10,'#3a3a4a');R(c,4,6,8,2,'#3a3a4a');R(c,5,10,6,2,'#3a3a4a');R(c,0,14,16,2,'#4a4a5a');break;
  case 'A':ol=null;{const ph=f*.8;ell(c,8,9,7,4.5,'rgba(120,200,255,.35)');for(let a=0;a<16;a++){const an=a/16*Math.PI*2+ph;R(c,8+Math.cos(an)*6,9+Math.sin(an)*3.6,1,1,a%2?'#ffffff':'#9fd8ff')}ell(c,8,9,2.5,1.5,'#e8f8ff');R(c,7,1+(f%2),2,5,'rgba(220,245,255,.7)')}break;
  case 'Ñ':ell(c,8,9,7.5,6.5,'#2a4a1a');ell(c,7,8,6,5,'#3a6a24');for(let i=0;i<14;i++){const a=i/14*6.28;R(c,8+Math.cos(a)*6.5,9+Math.sin(a)*5.5,1,1,'#c8b070')}for(let i=0;i<6;i++)R(c,4+i*2,5+(i%3)*3,1,1,'#e04060');break;
  case 'X':ol=null;{const ph=f*1.57;ell(c,8,12,6,2,'rgba(0,0,0,.25)');for(let i=0;i<4;i++){const a=ph+i*1.57;ell(c,8+Math.cos(a)*4,8+Math.sin(a)*2-i,4.4-i*.5,1.5,i%2?'#ecf2fa':'#aab8c6')}for(let i=0;i<3;i++)R(c,1+((f+i)%4)*3,3+i*4,4,1,'#ffffff')}break;
  case 'v':ol=null;for(let r=0;r<3;r++){const rr=7-r*2;for(let a=0;a<20;a++){const an=a/20*Math.PI*2+f*.8*(r%2?1:-1);if(a%3===0)continue;R(c,8+Math.cos(an)*rr,8+Math.sin(an)*rr*.8,1,1,r===0?'#163e6e':r===1?'#9fd0ff':'#ffffff')}}ell(c,8,8,1.4,1.1,'#0a2448');break;
  }
  if(ol)outline(cvs,ol);return DCACHE[k]=cvs;
}
/* LttP-style heart, filled in quarters */
function drawHeart(c,x,y,q){
  const HP=[".oo.oo.","orroWro","orrrrro","orrrrro",".orrro.","..oro..","...o..."];
  for(let yy=0;yy<7;yy++)for(let xx=0;xx<7;xx++){const ch=HP[yy][xx];if(ch==='.')continue;
    let col=ch==='o'?'#181018':'#4a2028';
    if(ch!=='o'){const filled=q>=4||(q===3&&!(xx>=4&&yy>=3))||(q===2&&xx<4)||(q===1&&xx<4&&yy>=3);if(filled)col=ch==='W'?'#ffd0d0':'#e83048'}
    R(c,x+xx,y+yy,1,1,col)}
}
