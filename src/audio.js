/* ============================================================
   AUDIO: chiptune sequencer + sound effects (all original)
   ============================================================ */
const AU={c:null,m:null,mus:null,sfx:null,noise:null,muted:false,song:null,name:null,timer:null,next:0,step:0};
try{AU.muted=localStorage.getItem(MUTE_KEY)==='1'}catch(e){}
function auInit(){
  try{
    if(!AU.c){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;AU.c=new AC();
      AU.m=AU.c.createGain();AU.m.connect(AU.c.destination);
      AU.mus=AU.c.createGain();AU.mus.gain.value=.2;AU.mus.connect(AU.m);
      AU.dist=AU.c.createWaveShaper();{const n=1024,cv=new Float32Array(n);for(let i=0;i<n;i++){const x=i*2/n-1;cv[i]=Math.tanh(x*6)*.8}AU.dist.curve=cv}
      AU.distG=AU.c.createGain();AU.distG.gain.value=.55;AU.dist.connect(AU.distG);AU.distG.connect(AU.mus);
      AU.sfx=AU.c.createGain();AU.sfx.gain.value=.3;AU.sfx.connect(AU.m);
      const b=AU.c.createBuffer(1,AU.c.sampleRate,AU.c.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;AU.noise=b;
      if(AU.song){AU.next=AU.c.currentTime+.08}
      AU.timer=setInterval(tick,25)}
    if(AU.c.state==='suspended')AU.c.resume();
    AU.m.gain.value=AU.muted?0:1;
  }catch(e){}
}
function toggleMute(){AU.muted=!AU.muted;try{localStorage.setItem(MUTE_KEY,AU.muted?'1':'0')}catch(e){}auInit();if(AU.m)AU.m.gain.value=AU.muted?0:1;$('bMus').textContent=AU.muted?'♪ Música: no':'♪ Música: sí';$('pN').textContent=AU.muted?'♪×':'♪'}
const NOTE={C:0,'C#':1,Db:1,D:2,'D#':3,Eb:3,E:4,F:5,'F#':6,Gb:6,G:7,'G#':8,Ab:8,A:9,'A#':10,Bb:10,B:11};
function nf(s){const m=/^([A-G][#b]?)(\d)$/.exec(s);if(!m)return 0;return 440*Math.pow(2,(NOTE[m[1]]+(+m[2]+1)*12-69)/12)}
function parseTrack(str){const toks=str.replace(/\|/g,' ').trim().split(/\s+/);const at={};let cur=null;
  toks.forEach((t,i)=>{if(t==='-'){if(cur)cur.len++}else if(t==='.'){cur=null}else{cur={n:t,len:1};(at[i]=at[i]||[]).push(cur)}});return{len:toks.length,at}}
function mkSong(o){o.ch=o.ch.map(c=>Object.assign(c,parseTrack(c.t)));o.len=Math.max(...o.ch.map(c=>c.len));return o}
const DR1='k . h . s . h . | k . h k s . h h';
const SONGS={
 epew:mkSong({bpm:58,loop:1,ch:[
  {w:'triangle',v:.55,t:'A2 - - - - - - - | A2 - - - - - - - | F2 - - - - - - - | E2 - - - - - - - | A2 - - - - - - - | G2 - - - - - - - | F2 - - - - - - - | E2 - - - E2 - - - | A2 - - - - - - - | A2 - - - - - - - | F2 - - - - - - - | G2 - - - - - - - | A2 - - - - - - - | F2 - - - - - - - | E2 - - - - - - - | A2 - - - - - - -'},
  {w:'triangle',v:.5,t:'A3 - - - - - - - | C4 - - - B3 - A3 - | F3 - - - A3 - - - | E3 - - - - - - - | A3 - - - C4 - D4 - | E4 - - - D4 - B3 - | C4 - - - A3 - - - | B3 - - - - - - - | A3 - - - E4 - - - | F4 - - - E4 - C4 - | D4 - - - C4 - A3 - | B3 - - - - - - - | A4 - - - G4 - E4 - | F4 - - - D4 - C4 - | B3 - - - E4 - - - | A3 - - - - - - -'},
  {w:'square',v:.045,t:'. - - - - - - - | . - - - - - - - | . - - - - - - - | . - - - - - - - | A4 - E4 - A4 - E4 - | G4 - D4 - G4 - D4 - | F4 - C4 - F4 - C4 - | E4 - B3 - E4 - B3 - | A4 - E4 - A4 - E4 - | F4 - C4 - F4 - C4 - | D4 - A3 - D4 - A3 - | E4 - B3 - E4 - B3 - | A4 - E5 - A4 - E5 - | F4 - C5 - F4 - C5 - | E4 - B4 - E4 - B4 - | A4 - E4 - A4 - - -'},
  {w:'sine',v:.3,t:'. - - - - - - - | . - - - - - - - | . - - - - - - - | . - - - - - - - | . - - - - - - - | . - - - - - - - | . - - - - - - - | . - - - - - - - | E5 - - - - - - - | C5 - - - - - - - | A4 - - - - - - - | B4 - - - - - - - | C5 - - - - - - - | D5 - - - - - - - | E5 - - - - - - - | E5 - - - - - - -'},
  {d:1,v:.5,t:'k . . . . . . . | k . . . k . . . | k . . . . . . . | k . . k . . k . | k . . . k . . . | k . . . k . . . | k . . . k . k . | k . k . k . k . | k . . . k . . . | k . . . k . . . | k . . . k . k . | k . k . k . k . | k . . h k . . h | k . . h k . . h | k . k . k . k k | k . . . . . . .'}]}),
 intro:mkSong({bpm:66,loop:1,ch:[
  {w:'triangle',v:.5,t:'E5 - - - D5 - C5 - | A4 - - - - - - - | G4 - - - A4 - C5 - | D5 - - - E5 - - - | E5 - - - G5 - E5 - | D5 - C5 - A4 - - - | C5 - D5 - E5 - G5 - | A5 - - - - - - -'},
  {w:'square',v:.06,t:'A3 - E4 - A4 - E4 - | F3 - C4 - F4 - C4 - | G3 - D4 - G4 - D4 - | E3 - B3 - E4 - B3 - | A3 - E4 - A4 - E4 - | F3 - C4 - F4 - C4 - | G3 - D4 - G4 - D4 - | A3 - E4 - A4 - - -'},
  {w:'triangle',v:.45,t:'A2 - - - - - - - | F2 - - - - - - - | G2 - - - - - - - | E2 - - - - - - - | A2 - - - - - - - | F2 - - - - - - - | G2 - - - - - - - | A2 - - - - - - -'}]}),
 coast:mkSong({bpm:104,loop:1,ch:[
  {w:'square',v:.13,t:'D5 - F#5 A5 B5 - A5 - | F#5 - E5 D5 E5 - - - | D5 - F#5 A5 D6 - B5 A5 | B5 - - - A5 - - - | G5 - F#5 E5 F#5 - A5 - | B5 - A5 F#5 E5 - - - | D5 E5 F#5 A5 B5 - A5 F#5 | E5 - - - D5 - - -'},
  {w:'triangle',v:.5,t:'D3 . A3 . D3 . A3 . | B2 . F#3 . B2 . F#3 . | G2 . D3 . G2 . D3 . | A2 . E3 . A2 . E3 . | G2 . D3 . G2 . D3 . | B2 . F#3 . B2 . F#3 . | G2 . D3 . A2 . E3 . | D3 . A2 . D3 - - .'},
  {w:'square',v:.04,t:'F#4 A4 D5 A4 F#4 A4 D5 A4 | D4 F#4 B4 F#4 D4 F#4 B4 F#4 | D4 G4 B4 G4 D4 G4 B4 G4 | E4 A4 C#5 A4 E4 A4 C#5 A4'},
  {d:1,v:.5,t:DR1}]}),
 nag:mkSong({bpm:112,loop:1,ch:[
  {w:'square',v:.12,t:'A4 - C5 E5 - D5 | C5 - A4 G4 - - | A4 - C5 E5 - G5 | A5 - - G5 - - | F5 - E5 D5 - C5 | D5 - E5 C5 - A4 | G4 - A4 C5 - D5 | E5 - - - - -'},
  {w:'triangle',v:.5,t:'A2 . E3 A2 . E3 | F2 . C3 F2 . C3 | A2 . E3 A2 . E3 | G2 . D3 G2 . D3 | F2 . C3 F2 . C3 | D2 . A2 D2 . A2 | G2 . D3 G2 . D3 | A2 . E3 A2 - -'},
  {w:'square',v:.04,t:'E4 A4 C5 E4 A4 C5 | F4 A4 C5 F4 A4 C5 | E4 A4 C5 E4 A4 C5 | D4 G4 B4 D4 G4 B4'},
  {d:1,v:.4,t:'k . h k h . | k . h s h h'}]}),
 nagG:mkSong({bpm:70,loop:1,ch:[
  {w:'triangle',v:.5,t:'A4 - - C5 - B4 | A4 - - E4 - - | F4 - - E4 - D4 | E4 - - - - - | A4 - - C5 - D5 | E5 - - D5 - C5 | B4 - - G#4 - - | A4 - - - - -'},
  {w:'square',v:.04,t:'A3 C4 E4 A3 C4 E4 | F3 A3 C4 F3 A3 C4 | D3 F3 A3 D3 F3 A3 | E3 G#3 B3 E3 G#3 B3'},
  {w:'triangle',v:.4,t:'A2 - - - - - | F2 - - - - - | D2 - - - - - | E2 - - - - -'},
  {d:1,v:.2,t:'k . . . . . | . . . h . .'}]}),
 lof:mkSong({bpm:84,loop:1,ch:[
  {w:'triangle',v:.55,t:'G4 - B4 D5 E5 - D5 - | B4 - A4 G4 A4 - - - | G4 - B4 D5 G5 - E5 D5 | E5 - - - D5 - - - | C5 - B4 A4 B4 - D5 - | E5 - D5 B4 A4 - - - | G4 A4 B4 D5 E5 - D5 B4 | A4 - - - G4 - - -'},
  {w:'square',v:.05,t:'B3 D4 G4 D4 B3 D4 G4 D4 | B3 E4 G4 E4 B3 E4 G4 E4 | C4 E4 G4 E4 C4 E4 G4 E4 | D4 F#4 A4 F#4 D4 F#4 A4 F#4'},
  {w:'triangle',v:.4,t:'G2 - D3 - G2 - D3 - | E2 - B2 - E2 - B2 - | C3 - G2 - C3 - G2 - | D3 - A2 - D3 - A2 -'},
  {d:1,v:.3,t:'k . . . h . . . | k . . . h . h .'}]}),
 cave:mkSong({bpm:76,loop:1,ch:[
  {w:'square',v:.09,t:'A4 - - - C5 - - - | B4 - - - E4 - - - | A4 - - - E5 - D5 - | C5 - - - - - - - | F4 - - - A4 - - - | G4 - - - E4 - - - | A4 - C5 - B4 - G4 - | A4 - - - - - - -'},
  {w:'triangle',v:.5,t:'A2 - - - A2 - - - | G2 - - - G2 - - - | F2 - - - F2 - - - | E2 - - - E2 - - - | F2 - - - F2 - - - | G2 - - - G2 - - - | F2 - - - E2 - - - | A2 - - - A2 - - -'},
  {d:1,v:.35,t:'k . . . . . h . | . . h . . . . .'}]}),
 battle:mkSong({bpm:150,loop:1,ch:[
  {w:'square',v:.12,t:'E5 - G5 - B5 - A5 G5 | F#5 - E5 - D5 - E5 - | E5 - G5 - B5 - D6 - | C6 - B5 - A5 - B5 - | C6 - B5 - A5 - G5 - | A5 - G5 - F#5 - D5 - | E5 G5 B5 G5 E5 G5 B5 D6 | E6 - - - B5 - - -'},
  {w:'triangle',v:.55,t:'E2 E3 E2 E3 E2 E3 E2 E3 | D2 D3 D2 D3 D2 D3 D2 D3 | C2 C3 C2 C3 C2 C3 C2 C3 | A2 A3 A2 A3 A2 A3 A2 A3 | C2 C3 C2 C3 C2 C3 C2 C3 | D2 D3 D2 D3 D2 D3 D2 D3 | E2 E3 E2 E3 E2 E3 E2 E3 | B2 B3 B2 B3 B2 B3 B2 B3'},
  {w:'square',v:.04,t:'B4 . B4 . B4 . B4 . | A4 . A4 . A4 . A4 . | G4 . G4 . G4 . G4 . | E4 . E4 . E4 . E4 .'},
  {d:1,v:.55,t:'k h s h k k s h'}]}),
 boss:mkSong({bpm:160,loop:1,ch:[
  {w:'square',v:.12,t:'D5 - F5 - A5 - G#5 - | A5 - - - D5 - - - | C5 - E5 - G5 - F5 - | E5 - - - A4 - - - | Bb4 - D5 - F5 - E5 - | F5 - G5 - A5 - - - | D6 - C6 - A5 - F5 - | E5 - - - A5 - - -'},
  {w:'sawtooth',v:.07,t:'D2 D2 D3 D2 D2 D3 D2 D3 | D2 D2 D3 D2 D2 D3 D2 D3 | C2 C2 C3 C2 C2 C3 C2 C3 | A1 A1 A2 A1 A1 A2 A1 A2 | Bb1 Bb1 Bb2 Bb1 Bb1 Bb2 Bb1 Bb2 | F2 F2 F3 F2 F2 F3 F2 F3 | D2 D2 D3 D2 D2 D3 D2 D3 | A1 A1 A2 A1 A1 A2 C#3 E3'},
  {w:'triangle',v:.45,t:'D3 - - - D3 - - - | D3 - - - D3 - - - | C3 - - - C3 - - - | A2 - - - A2 - - - | Bb2 - - - Bb2 - - - | F2 - - - F2 - - - | D3 - - - D3 - - - | A2 - - - A2 - - -'},
  {d:1,v:.6,t:'k k s h k k s s'}]}),
 ngen:mkSong({bpm:72,loop:1,ch:[
  {w:'triangle',v:.55,t:'C5 - - - F5 - - - | A5 - G5 - F5 - - - | D5 - - - F5 - - - | E5 - - - C5 - - - | C5 - - - F5 - A5 - | C6 - - - A5 - - - | G5 - F5 - D5 - E5 - | F5 - - - - - - -'},
  {w:'square',v:.045,t:'F4 A4 C5 A4 F4 A4 C5 A4 | F4 A4 C5 A4 F4 A4 C5 A4 | D4 F4 Bb4 F4 D4 F4 Bb4 F4 | E4 G4 C5 G4 E4 G4 C5 G4'},
  {w:'triangle',v:.4,t:'F2 - - - F2 - - - | F2 - - - F2 - - - | Bb2 - - - Bb2 - - - | C3 - - - C3 - - - | F2 - - - F2 - - - | A2 - - - A2 - - - | Bb2 - - - C3 - - - | F2 - - - F2 - - -'}]}),
 coastG:mkSong({bpm:80,loop:1,ch:[
  {w:'triangle',v:.5,t:'D5 - - - F5 - E5 - | D5 - - - A4 - - - | Bb4 - - - C5 - D5 - | A4 - - - - - - - | D5 - - - F5 - G5 - | A5 - - - F5 - E5 - | D5 - C5 - Bb4 - A4 - | D5 - - - - - - -'},
  {w:'square',v:.035,t:'D4 F4 A4 F4 D4 F4 A4 F4 | D4 F4 A4 F4 D4 F4 A4 F4 | Bb3 D4 F4 D4 Bb3 D4 F4 D4 | A3 C#4 E4 C#4 A3 C#4 E4 C#4'},
  {w:'triangle',v:.42,t:'D2 - - - A2 - - - | D2 - - - A2 - - - | Bb1 - - - F2 - - - | A1 - - - E2 - - - | D2 - - - A2 - - - | F2 - - - C3 - - - | Bb1 - - - A1 - - - | D2 - - - - - - -'},
  {d:1,v:.28,t:'k . . . . . h . | k . . . . . . .'}]}),
 lofG:mkSong({bpm:76,loop:1,ch:[
  {w:'triangle',v:.5,t:'C5 - A4 - F4 - A4 - | Bb4 - - - A4 - G4 - | A4 - C5 - F5 - E5 - | D5 - - - C5 - - - | Bb4 - D5 - C5 - A4 - | G4 - - - F4 - G4 - | A4 - G4 - F4 - E4 - | F4 - - - - - - -'},
  {w:'square',v:.028,t:'F4 A4 C5 A4 F4 A4 C5 A4 | D4 F4 Bb4 F4 D4 F4 Bb4 F4 | F4 A4 C5 A4 F4 A4 C5 A4 | E4 G4 C5 G4 E4 G4 C5 G4'},
  {w:'triangle',v:.36,t:'F2 - - - C3 - - - | Bb2 - - - F2 - - - | F2 - - - A2 - - - | Bb2 - - - C3 - - - | Bb2 - - - F2 - - - | C3 - - - C3 - - - | D3 - - - C3 - - - | F2 - - - - - - -'},
  {d:1,v:.16,t:'k . h . . . h . | k . h . . . h h'}]}),
 nagLof:mkSong({bpm:96,loop:1,ch:[
  {w:'triangle',v:.55,t:'D5 - F#5 - A5 - | B5 - A5 - F#5 - | G5 - F#5 - E5 - | F#5 - - - - - | D5 - F#5 - A5 - | D6 - B5 - A5 - | G5 - E5 - C#5 - | D5 - - - - -'},
  {w:'square',v:.05,t:'A3 D4 F#4 D4 A3 D4 | G3 B3 D4 B3 G3 B3 | A3 C#4 E4 C#4 A3 C#4 | A3 D4 F#4 D4 A3 D4'},
  {w:'triangle',v:.4,t:'D3 - - A2 - - | G2 - - D3 - - | A2 - - E3 - - | D3 - - A2 - -'},
  {d:1,v:.35,t:'k . . k . h'}]}),
 nagLofG:mkSong({bpm:72,loop:1,ch:[
  {w:'triangle',v:.5,t:'E5 - - D5 C5 - | D5 - - - - - | C5 - - B4 A4 - | B4 - - - - - | A4 - C5 - E5 - | D5 - C5 - B4 - | C5 - - B4 - - | A4 - - - - -'},
  {w:'square',v:.04,t:'A3 C4 E4 C4 A3 C4 | G3 B3 D4 B3 G3 B3 | F3 A3 C4 A3 F3 A3 | E3 G#3 B3 G#3 E3 G#3'},
  {w:'triangle',v:.4,t:'A2 - - - - - | G2 - - - - - | F2 - - - - - | E2 - - - - -'},
  {d:1,v:.22,t:'k . . . . .'}]}),
 nagCave:mkSong({bpm:72,loop:1,ch:[
  {w:'triangle',v:.42,t:'D5 - - - F5 - E5 - | D5 - - - A4 - - - | C5 - - - D5 - E5 - | F5 - E5 - D5 - - - | A5 - - - G5 - F5 - | E5 - - - D5 - - - | C#5 - - - E5 - - - | D5 - - - - - - -'},
  {w:'square',v:.04,t:'D4 A4 F4 A4 D4 A4 F4 A4 | C4 G4 E4 G4 C4 G4 E4 G4 | Bb3 F4 D4 F4 Bb3 F4 D4 F4 | A3 E4 C#4 E4 A3 E4 C#4 E4'},
  {w:'triangle',v:.45,t:'D2 - - - - - - - | C2 - - - - - - - | Bb1 - - - - - - - | A1 - - - - - - -'},
  {d:1,v:.25,t:'k . . . . . h . | . . k . . . . .'}]}),
 nagBattle:mkSong({bpm:168,loop:1,ch:[
  {w:'square',v:.12,t:'A5 - E5 A5 - C6 | B5 - G5 E5 - - | A5 - E5 A5 - C6 | D6 - C6 B5 - - | C6 - B5 A5 - G5 | F5 - E5 D5 - - | E5 - G#5 B5 - D6 | E6 - - E5 - -'},
  {w:'triangle',v:.55,t:'A2 A3 A2 A2 A3 A2 | G2 G3 G2 G2 G3 G2 | F2 F3 F2 F2 F3 F2 | E2 E3 E2 E2 E3 E2'},
  {w:'square',v:.04,t:'A4 C5 E5 A4 C5 E5 | G4 B4 D5 G4 B4 D5 | F4 A4 C5 F4 A4 C5 | E4 G#4 B4 E4 G#4 B4'},
  {d:1,v:.55,t:'k . h k s h | k . h k s s'}]}),
 nagBoss:mkSong({bpm:138,loop:1,ch:[
  {w:'sawtooth',v:.06,t:'E5 - F5 - E5 - D5 - | E5 - - - B4 - - - | E5 - F5 - G5 - F5 - | E5 - D5 - C5 - B4 - | C5 - D5 - E5 - F5 - | G5 - F5 - E5 - D5 - | F5 - - - E5 - - - | E5 - - - - - - -'},
  {w:'triangle',v:.55,t:'E2 E2 E3 E2 F2 F2 F3 F2 | E2 E2 E3 E2 D2 D2 D3 D2 | C2 C2 C3 C2 D2 D2 D3 D2 | E2 E2 E3 E2 F2 E2 D2 E2'},
  {w:'square',v:.05,t:'E4 . . G4 . . B4 . | F4 . . A4 . . C5 .'},
  {d:1,v:.55,t:'k h s h k k s h | k h s h k s s s'}]}),
 nagNgen:mkSong({bpm:88,loop:1,ch:[
  {w:'triangle',v:.5,t:'G5 - D5 - B4 - D5 - | E5 - - - D5 - - - | C5 - E5 - G5 - E5 - | D5 - - - - - - - | G5 - A5 - B5 - G5 - | A5 - - - F#5 - D5 - | E5 - F#5 - G5 - A5 - | G5 - - - - - - -'},
  {w:'square',v:.05,t:'B3 D4 G4 D4 B3 D4 G4 D4 | C4 E4 G4 E4 C4 E4 G4 E4 | A3 C4 E4 C4 A3 C4 E4 C4 | D4 F#4 A4 F#4 D4 F#4 A4 F#4'},
  {w:'triangle',v:.4,t:'G2 - - - D3 - - - | C3 - - - G2 - - - | A2 - - - E3 - - - | D3 - - - A2 - - -'},
  {d:1,v:.3,t:'k . h . s . h . | k . h k s . h h'}]}),
 pew:mkSong({bpm:100,loop:1,ch:[
  {w:'triangle',v:.5,t:'E5 - G5 A5 B5 - A5 G5 | E5 - - - D5 - - - | E5 - G5 A5 B5 - D6 B5 | A5 - - - - - - - | B5 - A5 G5 E5 - G5 A5 | B5 - - - A5 G5 E5 - | D5 - E5 G5 A5 - G5 E5 | E5 - - - - - - -'},
  {w:'square',v:.05,t:'E4 B4 E5 B4 E4 B4 E5 B4 | D4 A4 D5 A4 D4 A4 D5 A4 | C4 G4 C5 G4 C4 G4 C5 G4 | D4 A4 D5 A4 B3 F#4 B4 F#4'},
  {w:'triangle',v:.45,t:'E2 - - - E3 - - - | D2 - - - D3 - - - | C2 - - - C3 - - - | D2 - - - B1 - - -'},
  {d:1,v:.4,t:'k . . h k . s . | k . h . k . s h'}]}),
 pewG:mkSong({bpm:64,loop:1,ch:[
  {w:'triangle',v:.5,t:'E5 - - - D5 - B4 - | A4 - - - - - - - | B4 - - - D5 - E5 - | B4 - - - - - - - | G4 - - - A4 - B4 - | D5 - - - B4 - A4 - | G4 - - - F#4 - - - | E4 - - - - - - -'},
  {w:'square',v:.04,t:'E3 B3 E4 B3 E3 B3 E4 B3 | A2 E3 A3 E3 A2 E3 A3 E3 | C3 G3 C4 G3 C3 G3 C4 G3 | B2 F#3 B3 F#3 B2 F#3 B3 F#3'},
  {w:'triangle',v:.4,t:'E2 - - - - - - - | A1 - - - - - - - | C2 - - - - - - - | B1 - - - - - - -'},
  {d:1,v:.2,t:'k . . . . . . . | . . . . h . . .'}]}),
 pewLof:mkSong({bpm:92,loop:1,ch:[
  {w:'triangle',v:.55,t:'G5 - E5 D5 - E5 | G5 - A5 B5 - - | A5 - G5 E5 - D5 | E5 - - - - - | G5 - E5 D5 - B4 | D5 - E5 G5 - - | A5 - G5 E5 - D5 | G5 - - - - -'},
  {w:'square',v:.05,t:'B3 D4 G4 B3 D4 G4 | C4 E4 G4 C4 E4 G4 | A3 C4 E4 A3 C4 E4 | D4 G4 B4 D4 G4 B4'},
  {w:'triangle',v:.4,t:'G2 - - D3 - - | C3 - - G2 - - | A2 - - E3 - - | D3 - - G2 - -'},
  {d:1,v:.32,t:'k . h k . h'}]}),
 pewLofG:mkSong({bpm:70,loop:1,ch:[
  {w:'triangle',v:.5,t:'D5 - - B4 - A4 | G4 - - - - - | E4 - G4 A4 - B4 | A4 - - - - - | D5 - - B4 - A4 | G4 - E4 D4 - - | E4 - G4 A4 - G4 | G4 - - - - -'},
  {w:'square',v:.04,t:'B3 D4 G4 D4 B3 D4 | C4 E4 G4 E4 C4 E4 | A3 C4 E4 C4 A3 C4 | D4 F#4 A4 F#4 D4 F#4'},
  {w:'triangle',v:.4,t:'G2 - - - - - | C3 - - - - - | A2 - - - - - | D3 - - - - -'},
  {d:1,v:.2,t:'k . . . . .'}]}),
 pewCave:mkSong({bpm:80,loop:1,ch:[
  {w:'triangle',v:.42,t:'C5 - - - Eb5 - D5 - | C5 - - - G4 - - - | Ab4 - - - Bb4 - C5 - | G4 - - - - - - - | C5 - Eb5 - F5 - G5 - | Ab5 - - - G5 - F5 - | Eb5 - D5 - B4 - - - | C5 - - - - - - -'},
  {w:'square',v:.045,t:'C3 G3 C4 G3 C3 G3 C4 G3 | Ab2 Eb3 Ab3 Eb3 Ab2 Eb3 Ab3 Eb3 | F2 C3 F3 C3 F2 C3 F3 C3 | G2 D3 G3 D3 G2 B2 D3 G3'},
  {w:'sawtooth',v:.04,t:'C2 - - - - - - - | Ab1 - - - - - - - | F1 - - - - - - - | G1 - - - - - - -'},
  {d:1,v:.3,t:'k . . k . . s . | k . . . . k s h'}]}),
 pewBattle:mkSong({bpm:160,loop:1,ch:[
  {w:'square',v:.12,t:'D5 F5 G5 A5 - G5 F5 D5 | C5 - D5 - F5 - - - | D5 F5 G5 A5 - C6 A5 G5 | A5 - - - - - - - | Bb5 - A5 - G5 - F5 - | G5 - F5 - D5 - C5 - | D5 F5 A5 D6 - C6 A5 G5 | D5 - - - D6 - - -'},
  {w:'triangle',v:.55,t:'D2 D3 D2 D3 D2 D3 D2 D3 | C2 C3 C2 C3 C2 C3 C2 C3 | Bb1 Bb2 Bb1 Bb2 Bb1 Bb2 Bb1 Bb2 | C2 C3 C2 C3 A1 A2 A1 A2'},
  {w:'square',v:.04,t:'F4 A4 D5 A4 F4 A4 D5 A4 | E4 G4 C5 G4 E4 G4 C5 G4 | D4 F4 Bb4 F4 D4 F4 Bb4 F4 | E4 G4 C5 G4 C#4 E4 A4 E4'},
  {d:1,v:.55,t:'k h s h k h s s'}]}),
 pewBoss:mkSong({bpm:150,loop:1,ch:[
  {w:'sawtooth',v:.06,t:'C5 - Db5 - C5 - G4 - | Ab4 - G4 - F4 - G4 - | C5 - Db5 - Eb5 - F5 - | G5 - - - F5 - Eb5 - | Db5 - - - C5 - Bb4 - | C5 - - - G4 - - - | Ab4 - Bb4 - C5 - Db5 - | C5 - - - - - - -'},
  {w:'triangle',v:.55,t:'C2 C2 C3 C2 C2 C2 C3 C2 | Ab1 Ab1 Ab2 Ab1 Ab1 Ab1 Ab2 Ab1 | Bb1 Bb1 Bb2 Bb1 Bb1 Bb1 Bb2 Bb1 | C2 C2 C3 C2 Db2 Db2 Db3 Db2'},
  {w:'square',v:.05,t:'C4 . . Eb4 . . G4 . | Db4 . . F4 . . Ab4 .'},
  {d:1,v:.55,t:'k k s h k k s s | k h s h k k s k'}]}),
 pewNgen:mkSong({bpm:84,loop:1,ch:[
  {w:'triangle',v:.5,t:'A5 - F#5 - D5 - E5 - | F#5 - - - E5 - - - | D5 - E5 - F#5 - A5 - | B5 - - - - - - - | A5 - B5 - A5 - F#5 - | E5 - - - D5 - E5 - | F#5 - E5 - D5 - B4 - | D5 - - - - - - -'},
  {w:'square',v:.05,t:'F#4 A4 D5 A4 F#4 A4 D5 A4 | E4 A4 C#5 A4 E4 A4 C#5 A4 | D4 G4 B4 G4 D4 G4 B4 G4 | E4 A4 C#5 A4 F#4 A4 D5 A4'},
  {w:'triangle',v:.4,t:'D3 - - - A2 - - - | A2 - - - E3 - - - | G2 - - - D3 - - - | A2 - - - D3 - - -'},
  {d:1,v:.3,t:'k . h . s . h . | k . h k s . h h'}]}),
 wil:mkSong({bpm:108,loop:1,ch:[
  {w:'triangle',v:.5,t:'A4 - D5 - F#5 - | E5 - - - D5 - | B4 - D5 - G5 - | F#5 - - - - - | A4 - D5 - F#5 - | A5 - G5 - F#5 - | E5 - C#5 - E5 - | D5 - - - - -'},
  {w:'square',v:.04,t:'F#4 A4 D5 F#4 A4 D5 | G4 B4 D5 G4 B4 D5 | A4 C#5 E5 A4 C#5 E5 | F#4 A4 D5 F#4 A4 D5'},
  {w:'triangle',v:.42,t:'D3 - - A2 - - | G2 - - D3 - - | A2 - - E3 - - | D3 - - A2 - -'},
  {d:1,v:.3,t:'k . h . h .'}]}),
 wilG:mkSong({bpm:66,loop:1,ch:[
  {w:'triangle',v:.5,t:'F#5 - - E5 D5 - | C#5 - - - B4 - | D5 - - C#5 B4 - | A#4 - - - - - | B4 - D5 - F#5 - | G5 - - F#5 E5 - | D5 - C#5 - A#4 - | B4 - - - - -'},
  {w:'square',v:.04,t:'D4 F#4 B4 D4 F#4 B4 | E4 G4 B4 E4 G4 B4 | F#4 A#4 C#5 F#4 A#4 C#5 | D4 F#4 B4 D4 F#4 B4'},
  {w:'triangle',v:.4,t:'B2 - - - - - | E2 - - - - - | F#2 - - - - - | B2 - - - - -'},
  {d:1,v:.2,t:'k . . . . .'}]}),
 wilLof:mkSong({bpm:112,loop:1,ch:[
  {w:'triangle',v:.55,t:'D5 - B4 G4 - B4 | D5 - E5 D5 - - | C5 - A4 F#4 - A4 | C5 - D5 C5 - - | B4 - G4 D4 - G4 | B4 - C5 D5 - E5 | D5 - C5 B4 - A4 | G4 - - - - -'},
  {w:'square',v:.05,t:'B3 D4 G4 B3 D4 G4 | A3 D4 F#4 A3 D4 F#4 | A3 C4 F#4 A3 C4 F#4 | B3 D4 G4 B3 D4 G4'},
  {w:'triangle',v:.4,t:'G2 - - D3 - - | D2 - - A2 - - | D2 - - A2 - - | G2 - - D3 - -'},
  {d:1,v:.32,t:'k . h k h .'}]}),
 wilLofG:mkSong({bpm:76,loop:1,ch:[
  {w:'triangle',v:.5,t:'B4 - - E5 - G5 | F#5 - - E5 - - | D5 - - C5 - B4 | A4 - - - - - | B4 - - E5 - G5 | B5 - - A5 - G5 | F#5 - D5 - E5 - | E5 - - - - -'},
  {w:'square',v:.04,t:'E4 G4 B4 E4 G4 B4 | D4 F#4 A4 D4 F#4 A4 | C4 E4 G4 C4 E4 G4 | B3 D#4 F#4 B3 D#4 F#4'},
  {w:'triangle',v:.4,t:'E2 - - - - - | D2 - - - - - | C2 - - - - - | B1 - - - - -'},
  {d:1,v:.2,t:'k . . h . .'}]}),
 wilCave:mkSong({bpm:70,loop:1,ch:[
  {w:'triangle',v:.42,t:'A4 - - - C5 - B4 - | A4 - - - E4 - - - | F4 - - - G4 - A4 - | E4 - - - - - - - | A4 - C5 - E5 - D5 - | C5 - - - B4 - - - | G#4 - - - B4 - - - | A4 - - - - - - -'},
  {w:'square',v:.04,t:'A3 E4 A4 E4 A3 E4 A4 E4 | F3 C4 F4 C4 F3 C4 F4 C4 | D3 A3 D4 A3 D3 A3 D4 A3 | E3 B3 E4 B3 E3 G#3 B3 E4'},
  {w:'sawtooth',v:.04,t:'A1 - - - - - - - | F1 - - - - - - - | D2 - - - - - - - | E1 - - - - - - -'},
  {d:1,v:.25,t:'k . . . . . h . | . . . . k . . .'}]}),
 wilBattle:mkSong({bpm:164,loop:1,ch:[
  {w:'square',v:.12,t:'B5 - F#5 B5 - D6 | C#6 - A5 F#5 - - | B5 - F#5 B5 - D6 | E6 - D6 C#6 - - | D6 - C#6 B5 - A5 | G5 - F#5 E5 - - | F#5 - A#5 C#6 - E6 | F#6 - - F#5 - -'},
  {w:'triangle',v:.55,t:'B2 B3 B2 B2 B3 B2 | A2 A3 A2 A2 A3 A2 | G2 G3 G2 G2 G3 G2 | F#2 F#3 F#2 F#2 F#3 F#2'},
  {w:'square',v:.04,t:'B4 D5 F#5 B4 D5 F#5 | A4 C#5 E5 A4 C#5 E5 | G4 B4 D5 G4 B4 D5 | F#4 A#4 C#5 F#4 A#4 C#5'},
  {d:1,v:.55,t:'k . h k s h | k . h k s s'}]}),
 wilBoss:mkSong({bpm:144,loop:1,ch:[
  {w:'sawtooth',v:.06,t:'B4 - D5 - F5 - Ab5 - | G5 - - - F5 - - - | E5 - G5 - Bb5 - Db6 - | C6 - - - B5 - - - | B4 - C5 - D5 - Eb5 - | F5 - - - Eb5 - D5 - | C5 - B4 - Ab4 - G4 - | B4 - - - - - - -'},
  {w:'triangle',v:.55,t:'B1 B1 B2 B1 B1 B1 B2 B1 | G1 G1 G2 G1 G1 G1 G2 G1 | E1 E1 E2 E1 E1 E1 E2 E1 | F1 F1 F2 F1 F#1 F#1 F#2 F#1'},
  {w:'square',v:.05,t:'D4 . . F4 . . Ab4 . | Db4 . . E4 . . G4 .'},
  {d:1,v:.55,t:'k h s h k k s h | k h s h k s s c'}]}),
 wilNgen:mkSong({bpm:92,loop:1,ch:[
  {w:'triangle',v:.5,t:'E5 - A5 - C#6 - B5 - | A5 - - - E5 - - - | F#5 - A5 - D6 - C#6 - | B5 - - - - - - - | E5 - A5 - C#6 - E6 - | D6 - - - C#6 - B5 - | A5 - B5 - C#6 - B5 - | A5 - - - - - - -'},
  {w:'square',v:.05,t:'C#4 E4 A4 E4 C#4 E4 A4 E4 | D4 F#4 A4 F#4 D4 F#4 A4 F#4 | E4 G#4 B4 G#4 E4 G#4 B4 G#4 | C#4 E4 A4 E4 E4 G#4 B4 G#4'},
  {w:'triangle',v:.4,t:'A2 - - - E3 - - - | D3 - - - A2 - - - | E3 - - - B2 - - - | A2 - - - E2 - - -'},
  {d:1,v:.3,t:'k . h . s . h . | k . h k s . h h'}]}),
 puel:mkSong({bpm:96,loop:1,ch:[
  {w:'triangle',v:.5,t:'D5 - - A4 - - | C5 - D5 - E5 - | D5 - - A4 - - | G4 - - - - - | D5 - - E5 - G5 | A5 - G5 - E5 - | D5 - C5 - E5 - | D5 - - - - -'},
  {w:'square',v:.04,t:'D4 F#4 A4 D4 F#4 A4 | C4 E4 G4 C4 E4 G4 | D4 F#4 A4 D4 F#4 A4 | G3 B3 D4 G3 B3 D4'},
  {w:'triangle',v:.42,t:'D3 - - A2 - - | C3 - - G2 - - | D3 - - A2 - - | G2 - - D3 - -'},
  {d:1,v:.3,t:'k . h . h .'}]}),
 puelG:mkSong({bpm:62,loop:1,ch:[
  {w:'triangle',v:.5,t:'D5 - - C5 A4 - | A#4 - - - G4 - | A4 - - G4 F4 - | E4 - - - - - | D5 - - C5 - A4 | A#4 - - A4 G4 - | F4 - E4 - C#4 - | D4 - - - - -'},
  {w:'square',v:.04,t:'D4 F4 A4 D4 F4 A4 | A#3 D4 F4 A#3 D4 F4 | A3 C#4 E4 A3 C#4 E4 | D4 F4 A4 D4 F4 A4'},
  {w:'triangle',v:.4,t:'D2 - - - - - | A#1 - - - - - | A1 - - - - - | D2 - - - - -'},
  {d:1,v:.2,t:'k . . . . .'}]}),
 puelLof:mkSong({bpm:104,loop:1,ch:[
  {w:'triangle',v:.55,t:'G4 - B4 D5 - B4 | G5 - A5 G5 - - | E5 - C5 A4 - C5 | E5 - D5 C5 - - | D5 - B4 G4 - B4 | D5 - E5 G5 - A5 | G5 - E5 D5 - B4 | G4 - - - - -'},
  {w:'square',v:.05,t:'G3 B3 D4 G3 B3 D4 | C4 E4 G4 C4 E4 G4 | A3 D4 F#4 A3 D4 F#4 | G3 B3 D4 G3 B3 D4'},
  {w:'triangle',v:.4,t:'G2 - - D3 - - | C3 - - G2 - - | D2 - - A2 - - | G2 - - D3 - -'},
  {d:1,v:.32,t:'k . h k h .'}]}),
 puelLofG:mkSong({bpm:72,loop:1,ch:[
  {w:'triangle',v:.5,t:'E5 - - D5 B4 - | C5 - - B4 A4 - | B4 - - A4 G4 - | F#4 - - - - - | E5 - - G5 - F#5 | E5 - - D5 - B4 | C5 - B4 - F#4 - | E4 - - - - -'},
  {w:'square',v:.04,t:'E4 G4 B4 E4 G4 B4 | A3 C4 E4 A3 C4 E4 | B3 D#4 F#4 B3 D#4 F#4 | E4 G4 B4 E4 G4 B4'},
  {w:'triangle',v:.4,t:'E2 - - - - - | A1 - - - - - | B1 - - - - - | E2 - - - - -'},
  {d:1,v:.2,t:'k . . h . .'}]}),
 puelCave:mkSong({bpm:74,loop:1,ch:[
  {w:'triangle',v:.42,t:'D5 - - - D#5 - D5 - | C5 - - - A4 - - - | A#4 - - - C5 - D5 - | A4 - - - - - - - | D5 - F5 - D#5 - D5 - | C5 - - - A#4 - - - | A4 - - - C5 - - - | D5 - - - - - - -'},
  {w:'square',v:.04,t:'D3 A3 D4 A3 D3 A3 D4 A3 | A#2 F3 A#3 F3 A#2 F3 A#3 F3 | C3 G3 C4 G3 C3 G3 C4 G3 | D3 A3 D4 A3 D3 A3 D4 A3'},
  {w:'sawtooth',v:.04,t:'D1 - - - - - - - | A#1 - - - - - - - | C2 - - - - - - - | D1 - - - - - - -'},
  {d:1,v:.25,t:'k . . . h . . . | . . k . . . h .'}]}),
 puelBattle:mkSong({bpm:166,loop:1,ch:[
  {w:'square',v:.12,t:'D6 - A5 D6 - F6 | E6 - C6 A5 - - | D6 - A5 D6 - F6 | G6 - F6 E6 - - | F6 - E6 D6 - C6 | A#5 - A5 G5 - - | A5 - C#6 E6 - G6 | A6 - - A5 - -'},
  {w:'triangle',v:.55,t:'D3 D4 D3 D3 D4 D3 | C3 C4 C3 C3 C4 C3 | A#2 A#3 A#2 A#2 A#3 A#2 | A2 A3 A2 A2 A3 A2'},
  {w:'square',v:.04,t:'D5 F5 A5 D5 F5 A5 | C5 E5 G5 C5 E5 G5 | A#4 D5 F5 A#4 D5 F5 | A4 C#5 E5 A4 C#5 E5'},
  {d:1,v:.55,t:'k . h k s h | k . h k s s'}]}),
 puelBoss:mkSong({bpm:148,loop:1,ch:[
  {w:'sawtooth',v:.06,t:'D5 - F5 - G#5 - B5 - | A5 - - - G5 - - - | C5 - D#5 - F#5 - A5 - | G#5 - - - G5 - - - | D5 - D#5 - F5 - F#5 - | G#5 - - - G5 - F5 - | D#5 - D5 - B4 - A#4 - | D5 - - - - - - -'},
  {w:'triangle',v:.55,t:'D2 D2 D3 D2 D2 D2 D3 D2 | A#1 A#1 A#2 A#1 A#1 A#1 A#2 A#1 | C2 C2 C3 C2 C2 C2 C3 C2 | A1 A1 A2 A1 G#1 G#1 G#2 G#1'},
  {w:'square',v:.05,t:'F4 . . G#4 . . B4 . | D#4 . . F#4 . . A4 .'},
  {d:1,v:.55,t:'k h s h k k s h | k h s h k s s c'}]}),
 puelNgen:mkSong({bpm:88,loop:1,ch:[
  {w:'triangle',v:.5,t:'D5 - G5 - B5 - A5 - | G5 - - - D5 - - - | E5 - G5 - C6 - B5 - | A5 - - - - - - - | D5 - G5 - B5 - D6 - | C6 - - - B5 - A5 - | G5 - A5 - B5 - A5 - | G5 - - - - - - -'},
  {w:'square',v:.05,t:'B3 D4 G4 D4 B3 D4 G4 D4 | C4 E4 G4 E4 C4 E4 G4 E4 | D4 F#4 A4 F#4 D4 F#4 A4 F#4 | B3 D4 G4 D4 D4 F#4 A4 F#4'},
  {w:'triangle',v:.4,t:'G2 - - - D3 - - - | C3 - - - G2 - - - | D3 - - - A2 - - - | G2 - - - D2 - - -'},
  {d:1,v:.3,t:'k . h . s . h . | k . h k s . h h'}]}),
 ending:mkSong({bpm:76,loop:1,ch:[
  {w:'triangle',v:.5,t:'G4 - B4 - D5 - E5 - | D5 - - - B4 - - - | C5 - E5 - G5 - A5 - | G5 - - - D5 - - - | E5 - G5 - B5 - A5 - | G5 - - - E5 - D5 - | C5 - D5 - E5 - D5 - | G4 - - - - - - -'},
  {w:'square',v:.05,t:'G3 B3 D4 B3 G3 B3 D4 B3 | C4 E4 G4 E4 C4 E4 G4 E4 | A3 C4 E4 C4 A3 C4 E4 C4 | G3 B3 D4 B3 G3 B3 D4 B3'},
  {w:'triangle',v:.4,t:'G2 - - - D3 - - - | C3 - - - G2 - - - | A2 - - - E3 - - - | G2 - - - D2 - - -'},
  {d:1,v:.22,t:'k . . . h . . . | k . h . s . . .'}]}),
 waria:mkSong({bpm:112,loop:1,ch:[
  {w:'square',v:.08,t:'C5 - E5 G5 - E5 | A5 - G5 E5 - - | F5 - A5 C6 - A5 | G5 - E5 C5 - - | C5 - E5 G5 - A5 | B5 - A5 G5 - E5 | F5 - E5 D5 - B4 | C5 - - - - -'},
  {w:'triangle',v:.45,t:'C3 - G3 - C3 - | A2 - E3 - A2 - | F2 - C3 - F2 - | G2 - D3 - G2 -'},
  {w:'square',v:.04,t:'E4 G4 C5 E4 G4 C5 | C4 E4 A4 C4 E4 A4 | C4 F4 A4 C4 F4 A4 | B3 D4 G4 B3 D4 G4'},
  {d:1,v:.3,t:'k . h k h . | k . h k s .'}]}),
 deep:mkSong({bpm:66,loop:1,ch:[
  {w:'triangle',v:.46,t:'E4 - - - G4 - B4 - | A4 - - - - - E4 - | F#4 - - - A4 - C5 - | B4 - - - - - - - | E4 - - - G4 - B4 - | D5 - - - C5 - B4 - | A4 - G4 - F#4 - G4 - | E4 - - - - - - -'},
  {w:'sine',v:.22,t:'E3 - B3 - E3 - B3 - | A2 - E3 - A2 - E3 - | F#2 - C#3 - F#2 - C#3 - | B2 - F#3 - B2 - F#3 -'},
  {w:'sine',v:.12,t:'B5 - - - - - - - | . - - - G5 - - - | A5 - - - - - - - | . - - - F#5 - - -'},
  {d:1,v:.14,t:'k . . . h . . . | . . . . h . . .'}]}),
 deepBattle:mkSong({bpm:152,loop:1,ch:[
  {w:'square',v:.10,t:'E5 - G5 E5 - B5 | A5 - F#5 D5 - - | E5 - G5 E5 - B5 | C6 - B5 A5 - - | B5 - A5 G5 - E5 | F#5 - G5 A5 - - | G5 - B5 D6 - F#6 | E6 - - E5 - -'},
  {w:'triangle',v:.52,t:'E2 E3 E2 E2 E3 E2 | A2 A3 A2 A2 A3 A2 | F#2 F#3 F#2 F#2 F#3 F#2 | B2 B3 B2 B2 B3 B2'},
  {w:'sine',v:.1,t:'E4 G4 B4 E4 G4 B4 | A3 C4 E4 A3 C4 E4 | F#3 A3 C#4 F#3 A3 C#4 | B3 D#4 F#4 B3 D#4 F#4'},
  {d:1,v:.5,t:'k . h k s h | k . h k s s'}]}),
 deepBoss:mkSong({bpm:140,loop:1,ch:[
  {w:'sawtooth',v:.07,dist:1,t:'E2 E2 . E2 G2 . Bb2 Bb2 | A2 A2 . A2 E2 . A2 A2 | C2 C2 . C2 Eb2 . G2 G2 | B1 B1 . B1 D2 . F#2 F#2'},
  {w:'triangle',v:.5,t:'E5 - - - D5 - Bb4 - | A4 - - - C5 - E5 - | G4 - Bb4 - Eb5 - D5 - | B4 - - - F#4 - - - | E5 - G5 - Bb5 - A5 - | G5 - - - E5 - - - | Eb5 - D5 - C5 - Bb4 - | B4 - - - - - - -'},
  {w:'sine',v:.14,t:'E4 Bb4 E5 Bb4 E4 Bb4 E5 Bb4 | A3 E4 A4 E4 A3 E4 A4 E4'},
  {d:1,v:.55,t:'k h s h k k s h | k h s h k s s c'}]}),
 ngoy:mkSong({bpm:138,loop:1,ch:[
  {w:'sawtooth',v:.085,dist:1,t:'E2 E2 . E2 G2 . E2 E2 | D2 D2 . D2 A2 . D2 D2 | C2 C2 . C2 G2 . C2 C2 | B1 B1 . B1 D2 . B1 B1 | E2 E2 . E2 G2 . E2 E2 | D2 D2 . D2 A2 . D2 D2 | C2 C2 . C2 G2 . C2 C2 | B1 B1 B1 B1 B2 B2 B2 B2'},
  {w:'sawtooth',v:.055,dist:1,t:'E4 - G4 - B4 - A4 G4 | D4 - F#4 - A4 - G4 F#4 | C4 - E4 - G4 - A4 B4 | B3 - D4 - F#4 - A4 B4 | . . . . . . . . | . . . . . . . . | . . . . . . . . | . . . . . . . .'},
  {w:'sawtooth',v:.07,dist:1,t:'. . . . . . . . | . . . . . . . . | . . . . . . . . | . . . . . . . . | E5 G5 B5 E6 D6 B5 G5 E5 | F#5 A5 D6 F#6 E6 D6 A5 F#5 | G5 A5 B5 C6 B5 A5 G5 E5 | F#5 G5 A5 B5 A#5 B5 D#6 F#6'},
  {w:'square',v:.035,t:'. . E5 . . . G5 . | . . D5 . . . F#5 . | . . C5 . . . E5 . | . . B4 . . . D#5 .'},
  {d:1,v:.5,t:'k k h k s k h k | k k h k s k h h | k k h k s k h k | k k h k s s h h'}]}),
 ngoyBattle:mkSong({bpm:184,loop:1,ch:[
  {w:'sawtooth',v:.09,dist:1,t:'E2 E2 E2 G2 E2 E2 | C2 C2 C2 D2 C2 C2 | E2 E2 E2 G2 E2 E2 | A2 A2 G2 F#2 F2 F2 | E2 E2 E2 G2 E2 E2 | C2 C2 C2 D2 C2 C2 | D2 D2 D2 F2 D2 D2 | B1 B1 B2 B1 B2 B2'},
  {w:'square',v:.11,t:'E6 - B5 E6 - G6 | F#6 - D6 B5 - - | E6 - B5 E6 - G6 | A6 - G6 F#6 - - | . . . . . . | . . . . . . | . . . . . . | . . . . . .'},
  {w:'sawtooth',v:.075,dist:1,t:'. . . . . . | . . . . . . | . . . . . . | . . . . . . | E5 G5 B5 D6 B5 G5 | A5 C6 E6 G6 E6 C6 | D6 F6 A6 F6 D6 A5 | B5 D#6 F#6 A6 B6 D#7'},
  {w:'sawtooth',v:.05,dist:1,t:'E4 G4 B4 E4 G4 B4 | C4 E4 G4 C4 E4 G4 | E4 G4 B4 E4 G4 B4 | A3 C4 E4 B3 D#4 F#4'},
  {d:1,v:.6,t:'k k s k k k | k k s k k s | k k s k k k | k s k s k s'}]}),
 ngoyBoss:mkSong({bpm:150,loop:1,ch:[
  {w:'sawtooth',v:.09,dist:1,t:'E2 E2 . E2 Bb2 . E2 E2 | E2 E2 . E2 A2 . G2 G2 | C2 C2 . C2 F#2 . C2 C2 | B1 B1 . B1 Bb1 . B1 B1 | E2 E2 . E2 Bb2 . E2 E2 | E2 E2 . E2 A2 . G2 G2 | F2 F2 . F2 B2 . F2 F2 | B1 B1 B1 Bb1 B1 B1 Bb1 B1'},
  {w:'sawtooth',v:.06,dist:1,t:'E5 - - Bb4 - - G4 - | A4 - - - G4 - F4 - | E4 - G4 - Bb4 - Db5 - | C5 - - B4 - - - - | . . . . . . . . | . . . . . . . . | . . . . . . . . | . . . . . . . .'},
  {w:'sawtooth',v:.075,dist:1,t:'. . . . . . . . | . . . . . . . . | . . . . . . . . | . . . . . . . . | E5 F5 E5 Bb4 E5 G5 F#5 G5 | A5 Bb5 A5 G5 F5 E5 Db5 C5 | B4 C5 Db5 D5 Eb5 E5 F5 F#5 | G5 F#5 F5 E5 Bb4 B4 E5 E5'},
  {w:'square',v:.04,t:'E4 Bb4 E5 Bb4 E4 Bb4 E5 Bb4 | C4 G4 C5 G4 C4 G4 C5 G4'},
  {d:1,v:.6,t:'k h s h k k s h | k h s h k s s c'}]}),
 ngoyFinal:mkSong({bpm:164,loop:1,ch:[
  {w:'sawtooth',v:.085,dist:1,t:'E2 E2 . E2 C2 C2 . C2 | D2 D2 . D2 B1 B1 . B1 | A1 A1 . A1 C2 C2 . C2 | D2 D2 D2 D2 B1 B1 B1 B1 | E2 E2 . E2 C2 C2 . C2 | D2 D2 . D2 B1 B1 . B1 | A1 A1 . A1 C2 C2 . C2 | D2 D2 D2 D2 B1 B1 B1 B1 | E2 . . . E2 . . . | C2 . . . C2 . . . | A1 A1 . A1 B1 B1 . B1 | E2 E2 E2 E2 E2 E2 E2 E2'},
  {w:'sawtooth',v:.06,dist:1,t:'B4 - E5 - G5 - F#5 E5 | D5 - - C5 B4 - - - | A4 - C5 - E5 - G5 F#5 | F#5 - - - B4 - - - | . . . . . . . . | . . . . . . . . | . . . . . . . . | . . . . . . . . | G5 - - - F#5 - - - | E5 - - - D5 - - - | C5 - B4 - A4 - B4 - | B4 - - - - - - -'},
  {w:'sawtooth',v:.075,dist:1,t:'. . . . . . . . | . . . . . . . . | . . . . . . . . | . . . . . . . . | E5 G5 B5 E6 G6 E6 B5 G5 | F#5 A5 D6 F#6 A6 F#6 D6 A5 | A5 C6 E6 A6 G6 E6 C6 A5 | B5 D#6 F#6 B6 A6 F#6 D#6 B5 | E6 - D6 E6 G6 - F#6 G6 | B6 - A6 G6 F#6 - E6 D6 | C6 D6 E6 G6 A6 B6 C7 E7 | B6 - - - - - - -'},
  {w:'sawtooth',v:.055,dist:1,t:'. . . . . . . . | . . . . . . . . | . . . . . . . . | . . . . . . . . | G5 B5 D6 G6 B6 G6 D6 B5 | A5 C6 F6 A6 C7 A6 F6 C6 | C6 E6 G6 C7 B6 G6 E6 C6 | D#6 F#6 B6 D#7 C7 B6 F#6 D#6 | G6 - F#6 G6 B6 - A6 B6 | D7 - C7 B6 A6 - G6 F6 | E6 F6 G6 B6 C7 D7 E7 G7 | D#7 - - - - - - -'},
  {w:'triangle',v:.4,t:'E3 - - - C3 - - - | D3 - - - B2 - - - | A2 - - - C3 - - - | D3 - - - B2 - - -'},
  {d:1,v:.6,t:'k k h k s k h k | k k h k s k s s | k k h k s k h k | k s s k s s k s'}]}),
  win:mkSong({bpm:176,loop:0,ch:[
  {w:'sawtooth',v:.09,dist:1,t:'E3 E3 . E3 E3 . G3 - | A3 A3 . A3 A3 . C4 - | D4 - - - C4 - - - | B3 - - - B3 B3 B3 B3 | E4 - - - - - - - | . . . .'},
  {w:'sawtooth',v:.08,dist:1,t:'B3 B3 . B3 B3 . D4 - | E4 E4 . E4 E4 . G4 - | A4 - - - G4 - - - | F#4 - - - F#4 F#4 F#4 F#4 | B4 - - - - - - - | . . . .'},
  {w:'sawtooth',v:.06,dist:1,t:'E4 E4 . E4 E4 . G4 - | A4 A4 . A4 A4 . C5 - | D5 - - - C5 - - - | B4 - - - B4 B4 B4 B4 | G#4 - - - - - - - | . . . .'},
  {w:'square',v:.1,t:'. . . . . . . . | . . . . . . . . | D6 C6 B5 A5 G5 F#5 G5 A5 | B5 - D6 - F#6 - B6 - | E6 - - - - - - - | . . . .'},
  {w:'triangle',v:.55,t:'E2 E2 E2 E2 E2 E2 G2 G2 | A2 A2 A2 A2 A2 A2 C3 C3 | D3 D3 D3 D3 C3 C3 C3 C3 | B2 B2 B2 B2 B2 B2 B2 B2 | E2 - - - - - - - | . . . .'},
  {d:1,v:.6,t:'c k s k k k s k | k k s k k k s k | k k s k k s s s | k k k k s s s s | c . . . k . . . | . . . .'}]})
};
function playSong(name){
  if(AU.name===name)return;AU.name=name;AU.song=SONGS[name]||null;AU.step=0;
  if(AU.c)AU.next=AU.c.currentTime+.06;
}
function tick(){
  const so=AU.song;if(!so||!AU.c)return;const sd=60/so.bpm/2;
  if(AU.next<AU.c.currentTime-.3)AU.next=AU.c.currentTime+.02;
  while(AU.next<AU.c.currentTime+.12){
    for(const ch of so.ch){const ev=ch.at[AU.step%ch.len];if(ev)for(const e of ev)playNote(ch,e,AU.next,sd)}
    AU.step++;AU.next+=sd;
    if(!so.loop&&AU.step>=so.len){AU.song=null;AU.name=null;if(so.after){const n=so.after;so.after=null;playSong(n())}return}
  }
}
function playNote(ch,e,t,sd){
  const c=AU.c;
  if(ch.d){
    if(e.n==='k'){const o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(40,t+.12);g.gain.setValueAtTime(ch.v,t);g.gain.exponentialRampToValueAtTime(.001,t+.14);o.connect(g);g.connect(AU.mus);o.start(t);o.stop(t+.15)}
    else{const s=c.createBufferSource();s.buffer=AU.noise;const f=c.createBiquadFilter();f.type='highpass';f.frequency.value=e.n==='h'?7000:e.n==='c'?4200:1600;const g=c.createGain();const dur=e.n==='h'?.04:e.n==='c'?.9:.12;
      g.gain.setValueAtTime(ch.v*(e.n==='h'?.35:e.n==='c'?.6:.7),t);g.gain.exponentialRampToValueAtTime(.001,t+dur);s.connect(f);f.connect(g);g.connect(AU.mus);s.start(t,Math.random()*.5);s.stop(t+dur+.01)}
    return}
  const o=c.createOscillator(),g=c.createGain();o.type=ch.w;o.frequency.value=nf(e.n);
  const dur=e.len*sd;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(ch.v,t+.008);g.gain.linearRampToValueAtTime(ch.v*.65,t+Math.min(.12,dur*.5));
  g.gain.setValueAtTime(ch.v*.65,t+dur*.85);g.gain.linearRampToValueAtTime(0,t+dur*.98);
  if(e.len>=3&&ch.w==='square'){const l=c.createOscillator(),lg=c.createGain();l.frequency.value=5.5;lg.gain.value=nf(e.n)*.008;l.connect(lg);lg.connect(o.frequency);l.start(t+.15);l.stop(t+dur)}
  o.connect(g);g.connect(ch.dist&&AU.dist?AU.dist:AU.mus);o.start(t);o.stop(t+dur);
}
function tone(type,f0,f1,dur,vol,delay){
  if(!AU.c||AU.muted)return;const c=AU.c,t=c.currentTime+(delay||0),o=c.createOscillator(),g=c.createGain();o.type=type;
  o.frequency.setValueAtTime(f0,t);if(f1&&f1!==f0)o.frequency.exponentialRampToValueAtTime(f1,t+dur);
  g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(g);g.connect(AU.sfx);o.start(t);o.stop(t+dur+.02)}
function noiseBurst(dur,vol,hp,delay){if(!AU.c||AU.muted)return;const c=AU.c,t=c.currentTime+(delay||0),s=c.createBufferSource();s.buffer=AU.noise;const f=c.createBiquadFilter();f.type='highpass';f.frequency.value=hp||800;const g=c.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);s.connect(f);f.connect(g);g.connect(AU.sfx);s.start(t,Math.random()*.5);s.stop(t+dur+.02)}
function sfx(n){
  if(!AU.c||AU.muted)return;
  switch(n){
  case 'move':tone('square',880,880,.03,.12);break;
  case 'ok':tone('square',660,660,.05,.15);tone('square',990,990,.07,.15,.05);break;
  case 'bad':tone('square',240,110,.22,.2);break;
  case 'hit':noiseBurst(.1,.5,600);tone('square',420,70,.14,.25);break;
  case 'hurt':tone('sawtooth',200,50,.28,.28);noiseBurst(.12,.4,300);break;
  case 'block':tone('triangle',1400,1400,.06,.4);tone('triangle',1900,1900,.1,.35,.05);break;
  case 'heal':['C5','E5','G5','C6'].forEach((x,i)=>tone('triangle',nf(x),nf(x),.09,.35,i*.06));break;
  case 'pick':tone('square',nf('E6'),nf('E6'),.06,.18);tone('square',nf('B6'),nf('B6'),.1,.18,.06);break;
  case 'lvl':['C5','E5','G5','C6','E6','G6'].forEach((x,i)=>tone('square',nf(x),nf(x),.1,.16,i*.07));break;
  case 'cast':tone('square',300,1200,.22,.14);tone('triangle',600,2400,.22,.2,.02);break;
  case 'enc':noiseBurst(.35,.3,2000);['A5','E5','A4','E4'].forEach((x,i)=>tone('square',nf(x),nf(x),.07,.15,i*.06));break;
  case 'door':tone('triangle',nf('G4'),nf('G4'),.12,.35);tone('triangle',nf('C5'),nf('C5'),.2,.35,.1);break;
  case 'sleep':tone('sine',800,300,.5,.25);break;
  case 'step':noiseBurst(.03,.06,3000);break;
  case 'drag':{if(!AU.c||AU.muted)break;const c=AU.c,t=c.currentTime;
    const sN=c.createBufferSource();sN.buffer=AU.noise;sN.loop=true;
    const f=c.createBiquadFilter();f.type='lowpass';f.frequency.setValueAtTime(420,t);f.frequency.linearRampToValueAtTime(180,t+.3);
    const g=c.createGain();g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.5,t+.04);g.gain.setValueAtTime(.5,t+.2);g.gain.exponentialRampToValueAtTime(.001,t+.34);
    sN.connect(f);f.connect(g);g.connect(AU.sfx);sN.start(t,Math.random()*.4);sN.stop(t+.4);
    tone('sawtooth',70,52,.3,.22);tone('square',46,40,.3,.12);break}
  case 'trut':{['G3','G3','D4'].forEach((x,i)=>{tone('sawtooth',nf(x)*.99,nf(x),.3,.3,i*.22);tone('sawtooth',nf(x)*1.008,nf(x)*1.01,.3,.2,i*.22)});tone('sawtooth',nf('G4'),nf('G4')*1.01,.55,.3,.66);noiseBurst(.1,.12,900,.66);break}
  }
}

