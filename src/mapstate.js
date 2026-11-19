/* ============================================================
   MAP STATE + LAYER BUILDING
   ============================================================ */
const PENSPOT=[[10,2],[12,3],[14,2],[11,3],[15,3]];
let CUR='rupu',M=null,grid=null,ents=[],LAYERS=[],GT=null,PROPS=[],RUKAS=[],SCN=[];
const P={x:1,y:6,fx:1,fy:6,ox:1,oy:6,t:0,moving:false,dir:'down',spd:.125};
const WALK=new Set(['.',',','"','=','_','P','m','g','p','S','q','k','A','b']);
function inB(x,y){return x>=0&&y>=0&&x<M.w&&y<M.h}
function walk(x,y){return inB(x,y)&&WALK.has(grid[y][x])}
function entAt(x,y,skip){return ents.find(e=>e!==skip&&e.x===x&&e.y===y)}
const C3=h=>hexRGB(h);
const PL={G0:C3('#18481c'),G1:C3('#307c34'),G2:C3('#48a048'),G3:C3('#80c868'),GY:C3('#58b058'),GL:C3('#90d890'),GM:C3('#70b870'),
  S0:C3('#b08848'),S1:C3('#d8b878'),S2:C3('#ecd498'),S3:C3('#f8ecc0'),
  W0:C3('#182060'),W1:C3('#2c4c9c'),W2:C3('#4068b8'),W3:C3('#6890d8'),WF:C3('#a8c8f8'),
  D1:C3('#a87848'),D2:C3('#c89860'),D3:C3('#e0bc80'),
  C0:C3('#201810'),C1:C3('#3c2c20'),C2:C3('#5a4430'),C3:C3('#78604a'),CD:C3('#4a3828'),
  FW:C3('#f8f8f8'),FY:C3('#f8d848'),FR:C3('#e85868')};
const PL0=Object.assign({},PL);
const PALS={
  nagche:{G0:'#24461a',G1:'#3e7426',G2:'#5c9c34',G3:'#9ccc58',GY:'#6aa83c',GL:'#a4d070',GM:'#80b450',D1:'#9a6438',D2:'#b8844c',D3:'#d6aa68',FR:'#d83850',FY:'#f8d040',FW:'#fff8e8'},
  nagforest:{G0:'#10301e',G1:'#1e4e30',G2:'#2e6a3e',G3:'#5a9a5c',GY:'#3a7a46',GL:'#6aa070',GM:'#4a8a56',D1:'#5a4a30',D2:'#6e5a3a',D3:'#8a7450',FR:'#c8a0f0',FY:'#f0e890',FW:'#e8fff0'},
  pewenche:{G0:'#1e3a2a',G1:'#2e5a3e',G2:'#4a7a54',G3:'#7aa880',GY:'#5a8a62',GL:'#9ac0a0',GM:'#6a9a72',S0:'#8a98b0',S1:'#c4d0e2',S2:'#e6edf6',S3:'#ffffff',D1:'#7a6a5a',D2:'#948472',D3:'#b0a08c',FR:'#f0f0ff',FY:'#ffe0a0',FW:'#ffffff'},
  ash:{G0:'#2a2a24',G1:'#4a4a3a',G2:'#62624e',G3:'#8a8a70',GY:'#6a6a54',GL:'#9a9a80',GM:'#7a7a62',S0:'#3a3434',S1:'#5a5252',S2:'#6e6464',S3:'#8a8080',D1:'#4a3a32',D2:'#5a4a40',D3:'#74645a',FR:'#f86018',FY:'#ffb040',FW:'#d0c0b0'},
  williche:{G0:'#123a2a',G1:'#1e5a3c',G2:'#2e7a4c',G3:'#5aa870',GY:'#3a8a58',GL:'#7ab890',GM:'#4a9a66',S0:'#7a7a6a',S1:'#a8a894',S2:'#c4c2ac',S3:'#e0dec8',D1:'#5a4a3a',D2:'#6e5c48',D3:'#8a7860',FR:'#e04880',FY:'#f0e070',FW:'#ffffff'},
  wilcave:{C0:'#0a1214',C1:'#1e2e34',C2:'#2a3e46',C3:'#46606a',CD:'#22343a'},
  pewcave:{C0:'#140808',C1:'#3a1a14',C2:'#4a2620',C3:'#6a382c',CD:'#2c1410'},
  nagcave:{C0:'#0e1610',C1:'#26322a',C2:'#3a4a3c',C3:'#56685a',CD:'#2e3c30'}};
const WALLS={williche:['#34464e','#5e7a84','#4a626a','#1c2a30','#0a1214'],lafken:['#5a4430','#8a7058','#78604a','#3c2c20','#201810'],pewenche:['#2e2224','#5a4448','#463438','#1a1214','#0a0606'],nagche:['#3c4c3e','#6e8a68','#5a7058','#243026','#0e160e']};
function applyPal(){Object.assign(PL,PL0);const p=PALS[M.pal];if(p)for(const k in p)PL[k]=C3(p[k])}
function gtype(ch){if(ch==='~'||ch==='v')return'~';if(ch==='.'||ch===','||ch==='='||ch==='_'||ch==='%'||ch==='"'||ch==='Y'||ch==='b')return ch;if(ch==='T'||ch==='W'||ch==='f')return',';return M.floor}
function gAt(x,y){if(x<0||y<0||x>=M.w||y>=M.h)return null;return GT[y][x]}
function edgeDist(tx,ty,lx,ly,pred){let d=99;const E=15.5;
  if(pred(gAt(tx-1,ty)))d=Math.min(d,lx+.5);if(pred(gAt(tx+1,ty)))d=Math.min(d,E-lx);
  if(pred(gAt(tx,ty-1)))d=Math.min(d,ly+.5);if(pred(gAt(tx,ty+1)))d=Math.min(d,E-ly);
  if(d<99)return d;
  if(pred(gAt(tx-1,ty-1)))d=Math.min(d,Math.hypot(lx+.5,ly+.5));if(pred(gAt(tx+1,ty-1)))d=Math.min(d,Math.hypot(E-lx,ly+.5));
  if(pred(gAt(tx-1,ty+1)))d=Math.min(d,Math.hypot(lx+.5,E-ly));if(pred(gAt(tx+1,ty+1)))d=Math.min(d,Math.hypot(E-lx,E-ly));
  return d}
const isLand=g=>g!==null&&g!=='~',isWater=g=>g==='~',isGrass=g=>g===','||g==='"'||g==='Y';
function grassPix(gx,gy,base){
  const tx=gx>>4,ty=gy>>4,lx=gx&15,ly=gy&15;
  if(h2(tx,ty,11)<.18){const fx=3+Math.floor(h2(tx,ty,12)*10),fy=3+Math.floor(h2(tx,ty,13)*10),dx=lx-fx,dy=ly-fy;
    if(dx===0&&dy===0)return PL.FY;if(Math.abs(dx)+Math.abs(dy)===1)return h2(tx,ty,14)<.5?PL.FW:PL.FR}
  for(let k=0;k<3;k++){const fx=2+Math.floor(h2(tx,ty,20+k)*12),fy=3+Math.floor(h2(tx,ty,30+k)*11),dx=lx-fx,dy=ly-fy;
    if((dx===0&&dy===0)||(dy===1&&Math.abs(dx)===1))return PL.G1;if(dx===0&&dy===-1&&k===0)return PL.G3}
  return base}
function gpix(gx,gy,f){
  const tx=gx>>4,ty=gy>>4,lx=gx&15,ly=gy&15,g=GT[ty][tx];
  if(g==='~'){
    const dl=edgeDist(tx,ty,lx,ly,isLand);
    if(dl<1)return M.lava?[40,16,12]:PL.W0;
    if(dl<2.2+(((gx>>1)+f)%3===0?1:0))return M.lava?[255,236,150]:PL.WF;
    if(dl<3.6)return M.lava?[255,170,60]:PL.W3;
    let dep=dl<99?dl:wdep(gx,gy);dep+=Math.sin(gx*.09+gy*.05)*1.6+Math.sin(gx*.031-gy*.07)*2;
    const TIERS=M.lava?[[255,200,80],[250,150,40],[230,100,30],[200,70,24],[170,50,20],[140,36,16]]:[[104,152,228],[80,128,214],[64,108,198],[52,90,180],[42,74,160],[34,60,140]];
    let ti=dep<6?0:dep<10?1:dep<16?2:dep<24?3:dep<34?4:5;
    const nb=[6,10,16,24,34][ti];if(ti<5&&nb-dep<1.4&&(gx+gy)%2===0)ti++;
    let col=TIERS[ti];
    const ph=f*2.094,w1=Math.sin(gx*.21+gy*.62+ph)+Math.sin(gx*.07-gy*.33+ph*.5+1.3);
    if(M.lava){if(w1>1.5)col=lerp3(col,[255,240,170],.6);else if(w1<-1.5)col=lerp3(col,[60,20,10],.5);return col}
    if(w1>1.62)col=lerp3(col,[176,212,248],.65);else if(w1>1.45&&(gx&1))col=lerp3(col,[150,196,244],.45);else if(w1<-1.6)col=lerp3(col,[20,40,100],.3);
    const u=(gx+f*3+((gy>>3)%2)*6)%14,v=gy%9;
    if(ti<=2&&((v===3&&(u===0||u===3))||(v===4&&(u===1||u===2))))col=lerp3(col,[200,224,252],.6);
    if(h2(gx>>2,gy,f+50)<.012)return[236,246,255];
    return col}
  if(g==='.'||g==='='){
    const dg=edgeDist(tx,ty,lx,ly,isGrass),thr=1.6+((gx*7+gy*3)%3)*.7;
    if(dg<thr-1)return grassPix(gx,gy,PL.G2);if(dg<thr)return PL.G0;
    if(g==='.'){const dw=edgeDist(tx,ty,lx,ly,isWater);if(dw<2.2)return PL.S1;
      const n=h2(gx,gy,1);if(n<.03)return PL.S1;if(n>.992)return PL.S3;
      if(gy%4===0&&(gx+((gy>>2)%3)*5)%14<3&&h2(gx>>4,gy>>2,5)<.5)return PL.S1;return PL.S2}
    if(M.pave){const u=gx%8,v=gy%8;if(u===7||v===7)return PL.GM;if(u===0||v===0)return lerp3(PL.GL,[255,255,255],.25);return PL.GL}
    const ds=edgeDist(tx,ty,lx,ly,x=>x==='.');if(ds<1.5)return PL.S2;
    if(h2(gx>>1,gy>>1,8)<.07)return (gy&1)?PL.D1:PL.D3;return PL.D2}
  if(g==='b'){if(ly<2||ly>13)return ly===0||ly===15?[60,36,20]:[120,78,40];return (gx%4===0)?[90,58,30]:(h2(gx>>2,gy,3)<.2?[150,100,56]:[170,118,66])}
  if(g===',')return grassPix(gx,gy,PL.G2);
  if(g==='Y')return grassPix(gx,gy,PL.GY);
  if(g==='"'){const u=gx%8,v=gy%8,d=Math.hypot(u-3.5,v-3.5);if(d>3.6)return PL.G2;if(d>2.9)return PL.G0;if(u+v<5&&d<2.4)return PL.G3;if((u===3||u===4)&&(v===3||v===4))return PL.G0;return PL.G1}
  if(g==='_'){const u=gx%8,v=gy%8;let col=(u===7||v===7)?PL.C1:(u===0||v===0)?PL.C3:(h2(gx>>3,gy>>3,4)<.25?PL.CD:PL.C2);
    if(gAt(tx,ty-1)==='%'&&ly<4)col=lerp3(col,[10,6,4],.45);return col}
  if(g==='%'){return ((gx>>2)+(gy>>2))%2&&(gx%4===0||gy%4===0)?PL.C1:PL.C0}
  return PL.S2;
}
function wdep(gx,gy){const fx=(gx-8)/16,fy=(gy-8)/16,x0=Math.floor(fx),y0=Math.floor(fy),ax=fx-x0,ay=fy-y0;
  const W=(x,y)=>{x=Math.max(0,Math.min(M.w-1,x));y=Math.max(0,Math.min(M.h-1,y));return WD[y][x]};
  const v=(W(x0,y0)*(1-ax)+W(x0+1,y0)*ax)*(1-ay)+(W(x0,y0+1)*(1-ax)+W(x0+1,y0+1)*ax)*ay;return v*16-8}
let WD=null;
function buildLayers(){
  applyPal();GT=grid.map(r=>r.map(gtype));
  WD=GT.map(r=>r.map(g=>g==='~'?99:0));
  for(let it=0;it<40;it++){let ch=0;for(let y=0;y<M.h;y++)for(let x=0;x<M.w;x++){if(WD[y][x]===0)continue;let m=WD[y][x];
    for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const xx=x+dx,yy=y+dy;const n=(xx<0||yy<0||xx>=M.w||yy>=M.h)?6:WD[yy][xx];if(n+1<m)m=n+1}
    if(m!==WD[y][x]){WD[y][x]=m;ch=1}}if(!ch)break}
  const mw=M.w*T,mh=M.h*T;LAYERS=[];
  const [sc,sx]=mk(mw,mh);drawGroundStatics(sx);
  let base=null;
  for(let f=0;f<3;f++){
    const [cvs,c]=mk(mw,mh),id=c.createImageData(mw,mh),d=id.data;
    if(!base){for(let gy=0;gy<mh;gy++)for(let gx=0;gx<mw;gx++){const col=gpix(gx,gy,0),i=(gy*mw+gx)*4;d[i]=col[0];d[i+1]=col[1];d[i+2]=col[2];d[i+3]=255}base=new Uint8ClampedArray(d)}
    else{d.set(base);for(let ty=0;ty<M.h;ty++)for(let tx=0;tx<M.w;tx++){if(GT[ty][tx]!=='~')continue;
      for(let gy=ty*T;gy<ty*T+T;gy++)for(let gx=tx*T;gx<tx*T+T;gx++){const col=gpix(gx,gy,f),i=(gy*mw+gx)*4;d[i]=col[0];d[i+1]=col[1];d[i+2]=col[2]}}}
    c.putImageData(id,0,0);c.drawImage(sc,0,0);LAYERS.push(cvs);
  }
  PROPS=[];RUKAS=[];
  for(let y=0;y<M.h;y++)for(let x=0;x<M.w;x++){const ch=grid[y][x];
    if(ch==='T'){const tc=treeCanvas(Math.floor(h2(x,y,2)*3),M.trees);PROPS.push({y:y+.9,cvs:tc,dx:x*T+8-(tc.width>>1),dy:y*T+16-tc.height+(y===0?6:0),sh:[x*T+8,y*T+14,7,2]})}
    else if(ch==='#')PROPS.push({y:y+.8,cvs:rockCanvas(Math.floor(h2(x,y,2)*2)),dx:x*T,dy:y*T+2,sh:[x*T+8,y*T+14,7,2]});
    else if(ch==='V')PROPS.push({y:y+.9,cvs:boardCanvas(),dx:x*T-4,dy:y*T-6,sh:[x*T+8,y*T+15,10,2],board:1});
    else if(ch==='Z')PROPS.push({y:y+.9,loom:1,dx:x*T,dy:y*T-6,sh:[x*T+8,y*T+15,8,2]});
    else if(ch==='U')PROPS.push({y:y+.9,pot:1,dx:x*T,dy:y*T,sh:[x*T+8,y*T+14,7,2]});
    else if(ch==='R'&&(x===0||grid[y][x-1]!=='R')&&(y===0||grid[y-1][x]!=='R')){
      let bw=0,bh=0;while(x+bw<M.w&&grid[y][x+bw]==='R')bw++;while(y+bh<M.h&&grid[y+bh][x]==='R')bh++;
      const rk=rukaCanvas(bw,bh);PROPS.push({y:y+bh-.1,cvs:rk.cvs,dx:x*T-rk.ox,dy:y*T-rk.oy,sh:[x*T+bw*8+3,y*T+bh*16-1,bw*8+2,3]});
      RUKAS.push([x*T+rk.smoke[0],y*T+rk.smoke[1]])}}
}
function drawGroundStatics(c){
  for(let y=0;y<M.h;y++)for(let x=0;x<M.w;x++){const ch=grid[y][x],X=x*T,Y=y*T;
    if(ch==='%'){const below=y+1<M.h?grid[y+1][x]:'%';
      const WC=WALLS[M.region==='nagche'?'nagche':M.region==='pewenche'?'pewenche':M.region==='williche'?'williche':'lafken'];
      if(below!=='%'){R(c,X,Y+5,16,11,WC[0]);R(c,X,Y+4,16,1,WC[1]);R(c,X,Y+5,16,1,WC[2]);
        for(let r=0;r<3;r++){const yy=Y+6+r*3+ (r===2?1:0),off=((r+x)%2)*4;R(c,X,yy+2,16,1,WC[3]);for(let k=0;k<3;k++)R(c,X+((off+k*7)%16),yy,1,2,WC[3])}
        R(c,X,Y+15,16,1,WC[4]);
        if(M.region==='williche'){for(let k=0;k<3;k++){const mx=Math.floor(h2(x,y,80+k)*14);if(h2(x,y,90+k)<.6){R(c,X+mx,Y+5,2,1,'#3a8a5a');R(c,X+mx,Y+6+k*3,1,1,'#e8e0c8')}}}
        if(M.region==='pewenche'){for(let k=0;k<3;k++){const mx=Math.floor(h2(x,y,80+k)*14);if(h2(x,y,90+k)<.55){R(c,X+mx,Y+6+k*3,1,2,'#f86018');R(c,X+mx+1,Y+7+k*3,1,1,'#ffb040')}}}
        if(M.region==='nagche'){for(let k=0;k<4;k++){const mx=Math.floor(h2(x,y,80+k)*15);if(h2(x,y,90+k)<.6)R(c,X+mx,Y+5,2,1+Math.floor(h2(x,y,95+k)*3),'#4a7a3a')}
          if(h2(x,y,99)<.35){const rx=X+3+Math.floor(h2(x,y,98)*10);for(let i=0;i<6;i++)R(c,rx+(i%3===2?1:0),Y+6+i,1,1,'#5a3e22')}}}}
  }
  for(let y=0;y<M.h;y++)for(let x=0;x<M.w;x++){const ch=grid[y][x],X=x*T,Y=y*T;
    if(ch==='W'){R(c,X,Y,16,16,'#a07a30');for(let r=0;r<4;r++)for(let k=0;k<5;k++){const sx=X+1+k*3+(r%2),sy=Y+1+r*4;R(c,sx,sy,1,3,'#e8c050');R(c,sx,sy,1,1,'#f8e090');R(c,sx+1,sy+2,1,1,'#806020')}}
    else if(ch==='f'){const L=x>0&&grid[y][x-1]==='f',Rr=x<M.w-1&&grid[y][x+1]==='f',U=y>0&&grid[y-1][x]==='f',D=y<M.h-1&&grid[y+1][x]==='f';
      R(c,X+6,Y+3,4,12,'#181018');R(c,X+7,Y+4,2,10,'#8a5a30');R(c,X+7,Y+4,1,10,'#b07a40');
      if(L||Rr){const x0=L?X:X+7,x1=Rr?X+16:X+9;R(c,x0,Y+5,x1-x0,3,'#181018');R(c,x0,Y+6,x1-x0,1,'#a86c38');R(c,x0,Y+10,x1-x0,3,'#181018');R(c,x0,Y+11,x1-x0,1,'#a86c38')}
      if(U)R(c,X+7,Y,2,4,'#8a5a30');if(D)R(c,X+7,Y+14,2,2,'#8a5a30')}}
  for(const sc of (M.scenes||[]))if(sc.type==='palin'){const X=sc.x*T+2,Y=sc.y*T+2,w=sc.w*T-4,h=sc.h*T-4;
    R(c,X,Y,w,1,'#f8f8f0');R(c,X,Y+h-1,w,1,'#f8f8f0');R(c,X,Y,1,h,'#f8f8f0');R(c,X+w-1,Y,1,h,'#f8f8f0');R(c,X+w/2,Y,1,h,'#e8e8e0');
    ell(c,X+w/2,Y+h/2,5,4,'#e8e8e0');ell(c,X+w/2,Y+h/2,4,3,'#64b850')}
}
function placeNear(x,y,isEnt){
  const seen=new Set(),q=[[x,y]];
  while(q.length){const [a,b]=q.shift();const k=a+','+b;if(seen.has(k))continue;seen.add(k);
    if(walk(a,b)&&!entAt(a,b)&&!(isEnt&&a===P.x&&b===P.y)&&grid[b][a]!=='S')return [a,b];
    if(seen.size>900)break;for(const [d,e] of [[1,0],[-1,0],[0,1],[0,-1]])if(inB(a+d,b+e))q.push([a+d,b+e])}
  return [x,y];
}
const RFLAG={lafkenche:'ngen',nagche:'ngen2',pewenche:'ngen3',williche:'ngen4'};
const awake=r=>!!S.flags[RFLAG[r]];
const SONGSET={williche:{lof:'wilLof',lofG:'wilLofG',cave:'wilCave',battle:'wilBattle',boss:'wilBoss',ngen:'wilNgen'},pewenche:{nag:'pew',nagG:'pewG',lof:'pewLof',lofG:'pewLofG',cave:'pewCave',battle:'pewBattle',boss:'pewBoss',ngen:'pewNgen'},nagche:{lof:'nagLof',lofG:'nagLofG',cave:'nagCave',battle:'nagBattle',boss:'nagBoss',ngen:'nagNgen'}};
const rsong=n=>{const r=M&&M.region;return (SONGSET[r]&&SONGSET[r][n])||n};
function mapSong(){const m=MAPS[CUR];if(m.ngenmap)return rsong(awake(m.region)?'ngen':'cave');const s=m.song;if(!awake(m.region)&&(s==='coast'||s==='lof'||s==='nag'||s==='pew'||s==='wil'))return rsong(s+'G');return rsong(s)}
function loadMap(id,x,y,quiet){
  CUR=id;M=MAPS[id];
  grid=M.rows.map(r=>r.split(''));
  for(let yy=0;yy<M.h;yy++)for(let xx=0;xx<M.w;xx++){const c=grid[yy][xx];
    if((c==='P'||c==='C'||c==='K'||c==='k'||c==='L')&&S.flags['t:'+id+':'+xx+','+yy])grid[yy][xx]=M.floor;}
  if(S.flags['gate:'+id])for(let yy=0;yy<M.h;yy++)for(let xx=0;xx<M.w;xx++){if(grid[yy][xx]==='G')grid[yy][xx]=M.floor;if(grid[yy][xx]==='O')grid[yy][xx]='q'}
  PZ={n:0,lit:new Set()};
  if(S.flags['pz:'+id]){for(let yy=0;yy<M.h;yy++)for(let xx=0;xx<M.w;xx++)if(grid[yy][xx]==='E')grid[yy][xx]=M.floor;if(M.pz)for(const k in M.pz.tiles)PZ.lit.add(k)}
  if(!awake(M.region))for(let yy=0;yy<M.h;yy++)for(let xx=0;xx<M.w;xx++)if(grid[yy][xx]==='A')grid[yy][xx]=M.floor;
  if(S.flags.wind)for(let yy=0;yy<M.h;yy++)for(let xx=0;xx<M.w;xx++)if(grid[yy][xx]==='X')grid[yy][xx]=M.floor;
  if(S.flags.snow)for(let yy=0;yy<M.h;yy++)for(let xx=0;xx<M.w;xx++)if(grid[yy][xx]==='^')grid[yy][xx]=M.floor;
  if(S.flags.bramble)for(let yy=0;yy<M.h;yy++)for(let xx=0;xx<M.w;xx++)if(grid[yy][xx]==='Ñ')grid[yy][xx]=M.floor;
  buildLayers();
  ents=[];P.x=x;P.y=y;
  const [px0,py0]=placeNear(x,y);P.x=px0;P.y=py0;P.fx=P.x;P.fy=P.y;P.moving=false;
  for(const e0 of M.ents||[]){
    if(e0.flag&&S.flags[e0.flag])continue;
    if(e0.req&&!S.flags[e0.req])continue;
    const e=Object.assign({},e0);
    const [ex,ey]=e.fixed||e.path?[e.x,e.y]:placeNear(e.x,e.y,true);e.x=ex;e.y=ey;e.fx=ex;e.fy=ey;e.cd=30+rnd(60);e.dir=e.dir||'down';e.pi=0;e.wait=e.pause||0;e.bt=rnd(400);e.ox=e.x;e.oy=e.y;
    ents.push(e)}
  if(id==='n_kullin'){let i=0;for(const e0 of M.ents)if(e0.herd&&e0.flag&&S.flags[e0.flag]){const sp=PENSPOT[i++];ents.push({kind:'animal',look:e0.look,x:sp[0],y:sp[1],fx:sp[0],fy:sp[1],ox:sp[0],oy:sp[1],pen:[10,2,15,3],cd:30+rnd(60),wait:0,dir:i%2?'left':'right',home:1})}}
  SCN=(M.scenes||[]).map(s=>Object.assign({},s,{pl:[0,1,2,3].map(i=>({x:s.x*T+s.w*T*(i<2?.3:.7),y:s.y*T+s.h*T*(.3+.4*(i%2)),dir:'right'}))}));
  S.map=id;fade=16;grace=40;
  if(!quiet)showBanner(M.name,G(M.g));
  playSong(mapSong());
  persist();
}
