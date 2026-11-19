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
 win:mkSong({bpm:150,loop:0,ch:[
  {w:'square',v:.14,t:'C5 E5 G5 C6 - - G5 C6 - - - - . . . .'},
  {w:'triangle',v:.5,t:'C3 - - - G2 - - - C3 - - - . . . .'},
  {d:1,v:.5,t:'k . s . k . s . k . . . . . . .'}]})
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
    else{const s=c.createBufferSource();s.buffer=AU.noise;const f=c.createBiquadFilter();f.type='highpass';f.frequency.value=e.n==='h'?7000:1600;const g=c.createGain();const dur=e.n==='h'?.04:.12;
      g.gain.setValueAtTime(ch.v*(e.n==='h'?.35:.7),t);g.gain.exponentialRampToValueAtTime(.001,t+dur);s.connect(f);f.connect(g);g.connect(AU.mus);s.start(t,Math.random()*.5);s.stop(t+dur+.01)}
    return}
  const o=c.createOscillator(),g=c.createGain();o.type=ch.w;o.frequency.value=nf(e.n);
  const dur=e.len*sd;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(ch.v,t+.008);g.gain.linearRampToValueAtTime(ch.v*.65,t+Math.min(.12,dur*.5));
  g.gain.setValueAtTime(ch.v*.65,t+dur*.85);g.gain.linearRampToValueAtTime(0,t+dur*.98);
  if(e.len>=3&&ch.w==='square'){const l=c.createOscillator(),lg=c.createGain();l.frequency.value=5.5;lg.gain.value=nf(e.n)*.008;l.connect(lg);lg.connect(o.frequency);l.start(t+.15);l.stop(t+dur)}
  o.connect(g);g.connect(AU.mus);o.start(t);o.stop(t+dur);
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
  }
}

