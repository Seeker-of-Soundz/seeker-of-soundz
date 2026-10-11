(()=>{'use strict';
const $=id=>document.getElementById(id),tracks=['Kick','Snare','Clap','Closed Hat','Open Hat','Percussion','Bass','Lead'],notes=[84,81,79,76,72,69,67,64,60,57,55,52],noteNames=['C6','A5','G5','E5','C5','A4','G4','E4','C4','A3','G3','E3'];
const roles=new Set(['admin','owner','administrator','super_admin']);let started=false,checking=false;
const isAdminRole=value=>roles.has(String(value||'').trim().toLowerCase().replace(/[\s-]+/g,'_'));
async function init(){
 if(started||checking)return;
 checking=true;
 try{
  // The site's auth bridge resolves asynchronously; a missing initial session is not a denial.
  const current=window.SOS?.getSession?.();
  if(isAdminRole(current?.dbRole)||isAdminRole(current?.role)){
   started=true;$('gate').hidden=true;$('studio').hidden=false;setup();return;
  }
  // Read the authoritative role from the signed-in user's Supabase profile,
  // matching the account and Admin Hub rather than trusting display ranks.
  const client=window.SOS_SUPABASE?.client||window.sosSupabase||window.SOSSupabase?.client||window.supabaseClient;
  const candidates=[client,window.SOS?.supabase,window.SOS?.client];
  const api=candidates.find(c=>c?.auth?.getUser&&c?.from);
  if(api){
   const {data:userData,error:userError}=await api.auth.getUser();
   if(!userError&&userData?.user){
    const {data:profile,error:profileError}=await api.from('profiles').select('role').eq('id',userData.user.id).maybeSingle();
    if(!profileError&&isAdminRole(profile?.role)){
     started=true;$('gate').hidden=true;$('studio').hidden=false;setup();return;
    }
   }
  }
  $('gate').querySelector('p').textContent=current?'Checking administrator permissions. If your profile is an admin, allow the account to finish syncing and refresh.':'Sign in with your administrator account to open the studio.';
 }catch(e){console.warn('[SOS Beat Lab] Auth check pending',e)}
 finally{checking=false}
}
init();
for(const event of ['sos:supabase-session','sos:session','sos:auth-ready'])window.addEventListener(event,init);
window.addEventListener('load',init);
setTimeout(init,500);setTimeout(init,1500);setTimeout(init,3500);
function setup(){
let audio=null,masterNode=null,filterNode=null,delayNode=null,feedback=null,wet=null,playing=false,step=0,timer=0,nextTime=0,activePattern=0,playBar=0;let recording=null,recordChunks=[],recordDest=null,recordTimeout=null;let selectedPatterns=new Set();
const defaults=()=>({title:'Untitled SOS Beat',bpm:120,swing:0,master:.75,bars:2,melodyInstrument:'synth',synth:{wave:'sawtooth',layer:'triangle',detune:8,attack:.035,decay:.5,sustain:.6,release:1.8,length:2.5,cutoff:7000,resonance:.8,wet:.38,room:'cathedral',volume:.65},patterns:[{name:'Pattern 1',steps:tracks.map((_,i)=>Array.from({length:16},(_,j)=>i===0?(j%4===0?1:0):i===1?(j===4||j===12?1:0):i===3?(j%2===0?.7:0):0)),melody:notes.map(()=>Array(16).fill(false))}],channels:tracks.map((_,i)=>({gain:i===0?.9:.72,pan:0,tone:12000,reverb:0,eqLow:0,eqMid:0,eqHigh:0,sound:i*32})),delay:0,filter:18000,outputGain:1,delayFeedback:.24});let project=defaults();let imported=new Map();
// Built-in WAV sample files: decoded into Web Audio buffers, not oscillator approximations.
const bundledSamples=[
 {id:1000,name:'SOS WAV · Kick',file:'kick.wav',track:0},
 {id:1001,name:'SOS WAV · Snare',file:'snare.wav',track:1},
 {id:1002,name:'SOS WAV · Clap',file:'clap.wav',track:2},
 {id:1003,name:'SOS WAV · Closed Hat',file:'hat.wav',track:3},
 {id:1004,name:'SOS WAV · Percussion',file:'perc.wav',track:5},
 {id:1005,name:'SOS WAV · Sub',file:'sub.wav',track:6},
 {id:1006,name:'SOS WAV · Pluck',file:'pluck.wav',track:7},
 {id:1007,name:'SOS WAV · FX Rise',file:'fx-rise.wav',track:7}
];
const bundledBuffers=new Map();
async function loadBundledSamples(){
 const decoder=new (window.AudioContext||window.webkitAudioContext)();let ok=0;
 await Promise.all(bundledSamples.map(async s=>{
  try{const r=await fetch('assets/producer-freebies/'+s.file);if(!r.ok)throw Error('HTTP '+r.status);
   const buffer=await decoder.decodeAudioData(await r.arrayBuffer());bundledBuffers.set(s.id,buffer);ok++;
  }catch(e){console.warn('SOS Beat Lab sample unavailable:',s.file,e)}
 }));
 try{await decoder.close()}catch(_){} makeSoundList();status(ok+' of '+bundledSamples.length+' bundled WAV samples ready · synth sounds preserved');
}


const families=['Kick','Snare','Clap','Closed Hat','Open Hat','Percussion','Bass','Synth'];const sounds=Array.from({length:256},(_,i)=>({id:i,name:`${families[Math.floor(i/32)]} ${String(i%32+1).padStart(2,'0')}`,family:families[Math.floor(i/32)],variation:i%32}));
const presets={"Boom Bap":{0:[0,7,10],1:[4,12],3:[0,2,4,6,8,10,12,14]},"House Four-on-Floor":{0:[0,4,8,12],1:[4,12],3:[2,6,10,14],4:[6,14]},"Trap Half Time":{0:[0,6,10,13],1:[8],3:[0,2,4,6,8,10,12,14],5:[7,15]},"Drum & Bass":{0:[0,7,10],1:[4,12],3:[0,2,4,6,8,10,12,14],4:[3,11]},"Techno Drive":{0:[0,4,8,12],3:[2,6,10,14],5:[3,7,11,15]},"Lo-Fi Chill":{0:[0,10],1:[4,12],3:[0,3,6,8,11,14]},"Reggaeton":{0:[0,6,10],1:[4,12],2:[7,15],3:[2,6,10,14]},"Breakbeat":{0:[0,3,7,10,14],1:[4,12],3:[0,2,4,6,8,10,12,14]},"Afro Groove":{0:[0,6,10,14],1:[4,12],5:[2,5,8,11,15]},"Ambient Pulse":{0:[0,8],3:[4,12],6:[0,7,11]},"Dubstep Half Time":{0:[0,3,10],1:[8],3:[0,2,4,6,8,10,12,14]},"EDM Festival":{0:[0,4,8,12],1:[4,12],2:[4,12],3:[2,6,10,14],4:[6,14]}};
function ctx(){if(!audio){audio=new (window.AudioContext||window.webkitAudioContext)();masterNode=audio.createGain();filterNode=audio.createBiquadFilter();filterNode.type='lowpass';filterNode.frequency.value=project.filter;delayNode=audio.createDelay(1);delayNode.delayTime.value=.28;feedback=audio.createGain();feedback.gain.value=.24;wet=audio.createGain();wet.gain.value=project.delay;delayNode.connect(feedback);feedback.connect(delayNode);delayNode.connect(wet);wet.connect(masterNode);filterNode.connect(masterNode);filterNode.connect(delayNode);masterNode.connect(audio.destination);masterNode.gain.value=project.master*(project.outputGain??1);feedback.gain.value=project.delayFeedback??.24}return audio}
function synth(c,out,soundId,at,velocity=1,duration=.18,pan=0,tone=12000){const family=Math.floor(soundId/32),variant=soundId%32;const freq=family===6?55+variant*4:family===7?170+variant*19:90+variant*5;const gain=c.createGain(),p=c.createStereoPanner?c.createStereoPanner():null,lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=Math.min(18000,tone);gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime(Math.max(.001,velocity*.55),at+.005);gain.gain.exponentialRampToValueAtTime(.0001,at+Math.max(.07,duration));gain.connect(lp);if(p){lp.connect(p);p.pan.value=pan;p.connect(out)}else lp.connect(out);
const osc=c.createOscillator();osc.type=family===0?'sine':family===6?'sawtooth':family===7?(['sine','triangle','square','sawtooth'][variant%4]):'triangle';osc.frequency.setValueAtTime(freq,at);if(family===0)osc.frequency.exponentialRampToValueAtTime(40+variant,at+.12);osc.connect(gain);osc.start(at);osc.stop(at+Math.max(.08,duration)+.02);
if(family>=1&&family<=5){let len=Math.max(1,Math.floor(c.sampleRate*.16)),b=c.createBuffer(1,len,c.sampleRate),d=b.getChannelData(0),seed=variant*1709+family*731+1;for(let i=0;i<len;i++){seed=(Math.imul(seed,1664525)+1013904223)|0;d[i]=((seed>>>0)/2147483648-1)*Math.exp(-i/len*(family===3?12:6))};const noise=c.createBufferSource(),ng=c.createGain();noise.buffer=b;ng.gain.value=family===3?.32:.45;noise.connect(ng);ng.connect(gain);noise.start(at);noise.stop(at+.16)} }
const impulseCache=new WeakMap();
const roomPresets={
 'dry':[.08,.05,0], 'small-room':[.38,.22,.15], 'studio':[.65,.38,.22],
 'bedroom':[.8,.42,.25], 'living-room':[1.15,.55,.28], 'hallway':[1.5,.72,.34],
 'auditorium':[2.5,1.1,.48], 'concert-hall':[3.8,1.8,.62], 'cathedral':[5.5,2.8,.78],
 'church':[4.4,2.1,.7], 'warehouse':[3.4,1.1,.55], 'cave':[5.8,2.7,.8],
 'tunnel':[3.2,1.5,.6], 'plate':[2.1,1.1,.52], 'chamber':[1.7,.85,.44],
 'arena':[4.5,2.1,.7], 'ambient-space':[7,3.3,.85]
};
function impulseFor(c,room){let cache=impulseCache.get(c);if(!cache){cache=new Map();impulseCache.set(c,cache)}if(cache.has(room))return cache.get(room);
 const [seconds,pre]=roomPresets[room]||roomPresets.cathedral;const rate=c.sampleRate,len=Math.max(1,Math.floor(rate*seconds)),b=c.createBuffer(2,len,rate);
 for(let ch=0;ch<2;ch++){const d=b.getChannelData(ch);let seed=123457+ch*719+room.length*43;for(let i=0;i<len;i++){seed=(Math.imul(seed,1664525)+1013904223)|0;const noise=(seed/2147483648);const t=i/rate;const decay=Math.pow(1-t/seconds,2.8);d[i]=t<Math.min(pre*.025,.09)?0:noise*decay*.68}}cache.set(room,b);return b}
function note(c,out,midi,at,instrument='synth',vel=.65){
 const p=project.synth||defaults().synth;
 const freq=440*Math.pow(2,(midi-69)/12),length=Math.max(.1,Math.min(12,+p.length||2.5));
 const attack=Math.max(.003,Math.min(3,+p.attack||.035)),decay=Math.max(.02,Math.min(5,+p.decay||.5)),sustain=Math.max(.01,Math.min(1,+p.sustain||.6)),release=Math.max(.05,Math.min(8,+p.release||1.8));
 const end=at+length+release+.08,env=c.createGain(),tone=c.createBiquadFilter();tone.type='lowpass';tone.frequency.value=Math.max(100,Math.min(19000,+p.cutoff||7000));tone.Q.value=Math.max(.1,Math.min(20,+p.resonance||.8));
 const peak=Math.max(.001,vel*.23*(+p.volume||.65));env.gain.setValueAtTime(.0001,at);env.gain.linearRampToValueAtTime(peak,at+attack);env.gain.linearRampToValueAtTime(peak*sustain,at+attack+decay);env.gain.setValueAtTime(peak*sustain,at+length);env.gain.exponentialRampToValueAtTime(.0001,at+length+release);
 tone.connect(env);const dry=c.createGain();dry.gain.value=1;env.connect(dry);dry.connect(out);
 const wetAmount=Math.max(0,Math.min(1,+p.wet||0));if(wetAmount>0&&p.room!=='dry'){
  const verb=c.createConvolver(),wetGain=c.createGain();verb.buffer=impulseFor(c,p.room||'cathedral');wetGain.gain.value=wetAmount*.75;env.connect(verb);verb.connect(wetGain);wetGain.connect(out);
 }
 for(let i=0;i<2;i++){const o=c.createOscillator();const shape=i? p.layer:p.wave;o.type=['sine','triangle','square','sawtooth'].includes(shape)?shape:'sawtooth';o.frequency.value=freq;o.detune.value=i?(+p.detune||0):0;o.connect(tone);o.start(at);o.stop(end)}
}

function trigger(c,out,track,at,velocity){const ch=project.channels[track];const gain=c.createGain();gain.gain.value=ch.gain;let eqOut=gain;for(const [kind,freq,setting] of [['lowshelf',180,'eqLow'],['peaking',1100,'eqMid'],['highshelf',6500,'eqHigh']]){const eq=c.createBiquadFilter();eq.type=kind;eq.frequency.value=freq;eq.gain.value=Number(ch[setting]||0);if(kind==='peaking')eq.Q.value=.8;eqOut.connect(eq);eqOut=eq}eqOut.connect(out);let id=ch.sound;if(imported.has(id)||bundledBuffers.has(id)){const src=c.createBufferSource();src.buffer=imported.has(id)?imported.get(id).buffer:bundledBuffers.get(id);const p=c.createStereoPanner?c.createStereoPanner():null;if(p){p.pan.value=ch.pan;src.connect(p);p.connect(gain)}else src.connect(gain);src.start(at)}else synth(c,gain,id<256?id:track*32,at,velocity,track===6?.38:.17,ch.pan,ch.tone)}
function schedule(c,out,index,at,pattern=project.patterns[activePattern]){for(let t=0;t<8;t++)if(pattern.steps[t]?.[index])trigger(c,out,t,at,pattern.steps[t][index]);for(let n=0;n<notes.length;n++)if(pattern.melody[n]?.[index])note(c,out,notes[n],at,project.melodyInstrument)}
function playOrder(){const list=[...selectedPatterns].filter(i=>i>=0&&i<project.patterns.length).sort((a,b)=>a-b);return list.length?list:project.patterns.map((_,i)=>i)}
function loop(){if(!playing||!audio)return;try{while(nextTime<audio.currentTime+.11){const dur=60/project.bpm/4;const offset=(step%2===1?project.swing*dur*.5:0);schedule(audio,filterNode,step,nextTime+offset,project.patterns[playOrder()[playBar%playOrder().length]]);const visualStep=step;setTimeout(()=>{if(playing){$('clock').textContent=`${playBar+1}:${String(visualStep+1).padStart(2,'0')}`;document.querySelectorAll('[data-step]').forEach(e=>e.classList.toggle('playhead',+e.dataset.step===visualStep));$('meterFill').style.width=(25+Math.random()*65)+'%'}},Math.max(0,(nextTime-audio.currentTime)*1000));step++;if(step>=16){step=0;playBar=(playBar+1)%project.bars}nextTime+=dur}timer=setTimeout(loop,25)}catch(e){stop();status('Audio scheduling error: '+e.message);console.error('[SOS Beat Lab] Scheduler',e)}}
async function play(){
 if(playing){stop();return}
 try{
  const c=ctx();
  if(c.state!=='running')await c.resume();
  if(c.state!=='running')throw Error('Audio engine is suspended. Click Play again or enable sound for this site.');
  sync();
  if(!project.patterns.some(p=>p.steps.some(row=>row.some(Boolean))||p.melody.some(row=>row.some(Boolean)))){
   status('This project contains no notes. Add steps or apply a groove before playback.');return;
  }
  playing=true;step=0;playBar=0;nextTime=c.currentTime+.09;
  $('play').textContent='❚❚ Pause';loop();status('Playing · audio engine running');
 }catch(e){playing=false;$('play').textContent='▶ Play';status('Playback error: '+e.message);console.error('[SOS Beat Lab] Playback',e)}
}
function stop(){playing=false;clearTimeout(timer);$('play').textContent='▶ Play';$('meterFill').style.width='0';document.querySelectorAll('.playhead').forEach(e=>e.classList.remove('playhead'));status('Stopped')}
function status(msg){$('status').textContent=msg}
function sync(){project.bpm=+ $('bpm').value||120;project.swing=+$('swing').value/100;project.master=+$('master').value/100;project.bars=Math.max(1,Math.min(128,Number($('songBars').value)||Number($('bars').value)||2));project.delay=+$('delay').value/100;project.filter=+$('filter').value;project.title=$('projectName').value;project.melodyInstrument=$('melodyInstrument').value;if(masterNode)masterNode.gain.value=project.master*(project.outputGain??1);if(wet)wet.gain.value=project.delay;if(filterNode)filterNode.frequency.value=project.filter;$('swingVal').textContent=Math.round(project.swing*100)+'%';$('masterVal').textContent=Math.round(project.master*100)+'%'}
function render(){const pat=project.patterns[activePattern];$('patternList').replaceChildren(...project.patterns.map((p,i)=>{let wrap=document.createElement('div');wrap.className='sosPatternChoice';let check=document.createElement('input');check.type='checkbox';check.checked=selectedPatterns.has(i);check.title='Include in live recording';check.onchange=()=>{check.checked?selectedPatterns.add(i):selectedPatterns.delete(i)};let b=document.createElement('button');b.textContent=p.name;b.className=i===activePattern?'active':'';b.onclick=()=>{activePattern=i;render()};wrap.append(check,b);return wrap}));const seq=$('sequencer');seq.replaceChildren();for(let t=0;t<8;t++){let row=document.createElement('div');row.className='seq-row';let lab=document.createElement('div');lab.className='trackname';let mute=document.createElement('button');mute.textContent='▶';mute.title='Preview track';mute.onclick=()=>{let c=ctx();trigger(c,filterNode,t,c.currentTime+.02,.8)};let sel=document.createElement('select');sel.title='Choose sound';for(let i=t*32;i<t*32+32;i++){let op=document.createElement('option');op.value=i;op.textContent=sounds[i].name;sel.append(op)}for(const sample of bundledSamples){let op=document.createElement('option');op.value=sample.id;op.textContent=sample.name;sel.append(op)}for(const [id,item] of imported){let op=document.createElement('option');op.value=id;op.textContent=item.name;sel.append(op)}sel.value=project.channels[t].sound;sel.onchange=()=>project.channels[t].sound=+sel.value;lab.append(mute,sel);row.append(lab);for(let i=0;i<16;i++){let b=document.createElement('button');b.className='step'+(pat.steps[t][i]?' on':'');b.dataset.step=i;b.dataset.track=t;b.title=`${tracks[t]} step ${i+1} — right-click to adjust velocity`;b.onclick=()=>{pat.steps[t][i]=pat.steps[t][i]?0:1;render()};b.oncontextmenu=e=>{e.preventDefault();pat.steps[t][i]=pat.steps[t][i]===.5?1:.5;render()};row.append(b)}seq.append(row)}let piano=$('pianoRoll');piano.replaceChildren();notes.forEach((m,n)=>{let row=document.createElement('div');row.className='note-row';let label=document.createElement('span');label.textContent=noteNames[n];row.append(label);for(let i=0;i<16;i++){let b=document.createElement('button');b.className='note'+(pat.melody[n][i]?' on':'');b.dataset.step=i;b.title=`${noteNames[n]} at step ${i+1}`;b.dataset.note=n;row.append(b)}piano.append(row)});renderMixer()}
function renderMixer(){const m=$('mixerChannels');m.replaceChildren();project.channels.forEach((ch,i)=>{let box=document.createElement('div');box.className='channel';let h=document.createElement('h3');h.textContent=tracks[i];box.append(h);for(const [name,min,max,step] of [['gain',0,1,.01],['pan',-1,1,.01],['tone',300,18000,100],['reverb',0,1,.01],['eqLow',-18,18,.5],['eqMid',-18,18,.5],['eqHigh',-18,18,.5]]){let l=document.createElement('label');l.textContent=name.toUpperCase();let inp=document.createElement('input');inp.type='range';inp.min=min;inp.max=max;inp.step=step;inp.value=ch[name];inp.oninput=()=>{ch[name]=+inp.value};l.append(inp);box.append(l)}m.append(box)})}
function makeSoundList(){let list=$('soundList'),q=$('soundSearch').value.toLowerCase(),cat=$('soundCategory').value;list.replaceChildren();const all=[...sounds,...bundledSamples.filter(s=>bundledBuffers.has(s.id)).map(s=>({...s,family:'WAV Samples'})),...[...imported].map(([id,s])=>({id,name:s.name,family:'Imported'}))].filter(s=>(cat==='all'||s.family===cat)&&s.name.toLowerCase().includes(q));$('libraryCount').textContent=`${all.length} displayed · ${256+bundledBuffers.size+imported.size} available`;for(const s of all.slice(0,512)){let box=document.createElement('div');box.className='sound-item';let name=document.createElement('strong');name.textContent=s.name;let sub=document.createElement('small');sub.textContent=s.family;let controls=document.createElement('div'),preview=document.createElement('button'),assign=document.createElement('button');preview.textContent='▶ Preview';preview.onclick=()=>{let c=ctx();if(imported.has(s.id)||bundledBuffers.has(s.id)){let src=c.createBufferSource();src.buffer=imported.has(s.id)?imported.get(s.id).buffer:bundledBuffers.get(s.id);src.connect(filterNode);src.start()}else synth(c,filterNode,s.id,c.currentTime+.02,.7)};assign.textContent='Use on Track';assign.onclick=()=>{let idx=s.id<256?Math.floor(s.id/32):(s.track??7);project.channels[idx].sound=s.id;render();status(`${s.name} assigned to ${tracks[idx]}`)};controls.append(preview,assign);box.append(name,sub,controls);list.append(box)}}
Object.keys(presets).forEach(n=>{let o=document.createElement('option');o.textContent=n;$('preset').append(o)});families.concat('WAV Samples','Imported').forEach(n=>{let o=document.createElement('option');o.textContent=n;o.value=n;$('soundCategory').append(o)});
$('play').onclick=play;$('stop').onclick=stop;$('new').onclick=()=>{if(!confirm('Start a new project? Unsaved changes will be lost.'))return;stop();project=defaults();activePattern=0;hydrate()};for(const id of ['bpm','swing','master','bars','delay','filter','projectName','melodyInstrument'])$(id).addEventListener('input',sync);
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-view]').forEach(x=>x.classList.toggle('selected',x===b));document.querySelectorAll('.view').forEach(x=>x.hidden=x.id!==b.dataset.view+'View');if(b.dataset.view==='files')showProjectInfo()});
$('addPattern').onclick=()=>{if(project.patterns.length>=16)return status('Maximum 16 patterns');project.patterns.push({name:`Pattern ${project.patterns.length+1}`,steps:tracks.map(()=>Array(16).fill(0)),melody:notes.map(()=>Array(16).fill(false))});activePattern=project.patterns.length-1;render()};$('applyPreset').onclick=()=>{const preset=presets[$('preset').value];if(!preset)return;let p=project.patterns[activePattern];p.steps=tracks.map((_,i)=>Array.from({length:16},(_,j)=>(preset[i]||[]).includes(j)?1:0));render()};$('clearSteps').onclick=()=>{project.patterns[activePattern].steps=tracks.map(()=>Array(16).fill(0));render()};$('randomSteps').onclick=()=>{let p=project.patterns[activePattern];p.steps=p.steps.map((row,i)=>row.map(()=>Math.random()<(i===0?.3:i===3?.55:.13)?1:0));render()};$('duplicate').onclick=()=>{project.patterns.push(JSON.parse(JSON.stringify(project.patterns[activePattern])));activePattern=project.patterns.length-1;project.patterns[activePattern].name=`Pattern ${activePattern+1}`;render()};$('clearMelody').onclick=()=>{project.patterns[activePattern].melody=notes.map(()=>Array(16).fill(false));render()};
$('addMelody').onclick=()=>{const sets={minor:[8,6,5,3,8,6,4,5],major:[8,7,5,3,8,7,4,5],bassline:[11,11,8,9,11,8,9,10],house:[8,5,6,3,8,6,5,4],ambient:[8,3,6,1,8,4,5,2]},seq=sets[$('melodyPreset').value]||sets.minor,p=project.patterns[activePattern];p.melody=notes.map(()=>Array(16).fill(false));for(let i=0;i<16;i+=2)p.melody[seq[i/2]][i]=true;render()};
$('soundSearch').oninput=makeSoundList;$('soundCategory').onchange=makeSoundList;$('importAudio').onchange=async e=>{const files=[...e.target.files].slice(0,32);try{let c=ctx();for(let f of files){if(f.size>25*1024*1024){status('Skipped large file: '+f.name);continue}try{let buffer=await c.decodeAudioData(await f.arrayBuffer());imported.set(256+imported.size,{name:f.name,buffer})}catch{status('Browser cannot decode '+f.name)}}makeSoundList();render();status(`${imported.size} audio samples imported`)}catch(err){status(err.message)}e.target.value=''};
function hydrate(){$('bpm').value=project.bpm;$('swing').value=Math.round(project.swing*100);$('master').value=Math.round(project.master*100);$('bars').value=project.bars;$('songBars').value=project.bars;$('delay').value=Math.round(project.delay*100);$('filter').value=project.filter;$('projectName').value=project.title;$('melodyInstrument').value=project.melodyInstrument;loadSynthControls();sync();render();makeSoundList()}
function validate(obj){if(!obj||!Array.isArray(obj.patterns)||!Array.isArray(obj.channels))throw Error('Invalid SOS project');if(obj.patterns.length>16||obj.patterns.some(p=>p.steps?.length!==8||p.melody?.length!==12||p.steps.some(r=>r.length!==16)||p.melody.some(r=>r.length!==16)))throw Error('Unsupported project shape');let base=defaults();return {...base,...obj,channels:obj.channels.slice(0,8).map((c,i)=>({...base.channels[i],...c})),patterns:obj.patterns}}
function download(name,blob){let url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000)}
function safeName(){return (project.title||'sos-beat').replace(/[^a-z0-9_-]+/gi,'-').slice(0,60)}function showProjectInfo(){$('projectInfo').textContent=`${project.patterns.length} pattern(s) · ${project.bpm} BPM · ${project.bars} bars · ${imported.size} imported audio files (session only)`}
$('saveLocal').onclick=()=>{sync();try{localStorage.setItem('sos-beat-lab-v1',JSON.stringify(project));status('Saved in this browser')}catch(e){status('Browser storage failed: '+e.message)}};$('loadLocal').onclick=()=>{try{const data=localStorage.getItem('sos-beat-lab-v1');if(!data)return status('No saved project');stop();project=validate(JSON.parse(data));activePattern=0;// v7.0.79: drag-to-paint / drag-to-erase melody tiles without destroying the piano grid mid-drag.
let painting=false,paintValue=false,lastPaintKey='';
function paintTile(tile){if(!painting||!tile?.matches?.('#pianoRoll .note'))return;const n=Number(tile.dataset.note),s=Number(tile.dataset.step),key=n+':'+s;if(key===lastPaintKey)return;lastPaintKey=key;project.patterns[activePattern].melody[n][s]=paintValue;tile.classList.toggle('on',paintValue)}
const roll=$('pianoRoll');roll.style.touchAction='none';
roll.addEventListener('pointerdown',e=>{const tile=e.target.closest('.note');if(!tile||e.button!==0)return;e.preventDefault();painting=true;lastPaintKey='';paintValue=!project.patterns[activePattern].melody[+tile.dataset.note][+tile.dataset.step];roll.setPointerCapture(e.pointerId);paintTile(tile)});
roll.addEventListener('pointermove',e=>{if(!painting)return;const tile=document.elementFromPoint(e.clientX,e.clientY)?.closest('#pianoRoll .note');paintTile(tile)});
function endPaint(){painting=false;lastPaintKey=''}roll.addEventListener('pointerup',endPaint);roll.addEventListener('pointercancel',endPaint);window.addEventListener('blur',endPaint);
const synthControls=['wave','layer','detune','attack','decay','sustain','release','length','cutoff','resonance','wet','room','volume'];
function loadSynthControls(){const p=project.synth||defaults().synth;project.synth={...defaults().synth,...p};for(const key of synthControls){const el=$('sy-'+key);if(el)el.value=project.synth[key]}updateSynthLabels()}
function updateSynthLabels(){for(const key of synthControls){const el=$('sy-'+key),label=$('sy-value-'+key);if(label&&el)label.textContent=el.value+(key==='length'||key==='attack'||key==='decay'||key==='release'?'s':key==='cutoff'?' Hz':key==='wet'||key==='volume'||key==='sustain'?'':'')}}
for(const key of synthControls){const el=$('sy-'+key);if(!el)continue;el.addEventListener('input',()=>{project.synth={...defaults().synth,...project.synth,[key]:['wave','layer','room'].includes(key)?el.value:Number(el.value)};updateSynthLabels()})}
$('sy-preview').addEventListener('click',async()=>{try{const c=ctx();if(c.state==='suspended')await c.resume();note(c,filterNode,60,c.currentTime+.02,'synth',.9);status('Synth preview: C4 · '+(project.synth.room||'cathedral'))}catch(e){status('Synth preview failed: '+e.message)}});
$('sy-preset').addEventListener('change',e=>{const selected=synthPatches[e.target.value];if(!selected)return;project.synth={...defaults().synth,...selected};loadSynthControls();status('Synth preset loaded: '+e.target.selectedOptions[0].textContent)});


// v7.0.80: XY frequency/resonance pad. Uses the existing synth parameters and engine.
const xy=$('sy-xy'),dot=$('sy-dot');let xyDragging=false;
function updateXY(){const cutoff=Math.max(100,Math.min(19000,Number($('sy-cutoff').value)||7000));const q=Math.max(.1,Math.min(20,Number($('sy-resonance').value)||.8));const x=Math.log(cutoff/100)/Math.log(190);const y=(q-.1)/19.9;dot.style.left=(x*100)+'%';dot.style.top=((1-y)*100)+'%';$('sy-xy-frequency').textContent='Cutoff: '+Math.round(cutoff)+' Hz';$('sy-xy-resonance').textContent='Resonance: '+q.toFixed(1);xy.setAttribute('aria-valuetext',Math.round(cutoff)+' hertz, resonance '+q.toFixed(1))}
function setXY(clientX,clientY){const rect=xy.getBoundingClientRect();if(!rect.width||!rect.height)return;const x=Math.max(0,Math.min(1,(clientX-rect.left)/rect.width));const y=1-Math.max(0,Math.min(1,(clientY-rect.top)/rect.height));const cutoff=Math.round(100*Math.pow(190,x)/50)*50;const q=Math.round((.1+y*19.9)*10)/10;$('sy-cutoff').value=Math.max(100,Math.min(19000,cutoff));$('sy-resonance').value=Math.max(.1,Math.min(20,q));for(const id of ['sy-cutoff','sy-resonance'])$(id).dispatchEvent(new Event('input',{bubbles:true}));updateXY()}
// Capture pointer movement at window level, so dragging works even when the
// cursor leaves the pad or a browser loses pointer capture.
let activeXYPointer=null;
xy.style.touchAction='none';
xy.style.cursor='crosshair';
xy.addEventListener('pointerdown',e=>{
  if(e.pointerType==='mouse'&&e.button!==0)return;
  e.preventDefault();e.stopPropagation();
  activeXYPointer=e.pointerId;xyDragging=true;
  try{xy.setPointerCapture(e.pointerId)}catch(_){}
  setXY(e.clientX,e.clientY);
});
window.addEventListener('pointermove',e=>{
  if(!xyDragging||activeXYPointer!==e.pointerId)return;
  e.preventDefault();setXY(e.clientX,e.clientY);
},{passive:false});
function endXY(e){if(activeXYPointer!==e.pointerId)return;xyDragging=false;activeXYPointer=null;try{if(xy.hasPointerCapture(e.pointerId))xy.releasePointerCapture(e.pointerId)}catch(_){}}
window.addEventListener('pointerup',endXY);
window.addEventListener('pointercancel',endXY);
// Clicking anywhere in the matrix moves the point, including its logo overlay.
xy.addEventListener('keydown',e=>{if(!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();const rect=xy.getBoundingClientRect(),x=Number.parseFloat(dot.style.left)/100||0,y=Number.parseFloat(dot.style.top)/100||0;setXY(rect.left+rect.width*Math.max(0,Math.min(1,x+(e.key==='ArrowRight'?.025:e.key==='ArrowLeft'?-.025:0))),rect.top+rect.height*Math.max(0,Math.min(1,y+(e.key==='ArrowDown'?.025:e.key==='ArrowUp'?-.025:0))))});
for(const id of ['sy-cutoff','sy-resonance'])$(id).addEventListener('input',updateXY);
$('sy-preset').addEventListener('change',()=>requestAnimationFrame(updateXY));

hydrate();status('Project loaded')}catch(e){status('Load failed: '+e.message)}};$('saveJson').onclick=()=>{sync();download(safeName()+'.sosbeat.json',new Blob([JSON.stringify({format:'sos-beat-lab-v1',...project},null,2)],{type:'application/json'}));status('Project JSON downloaded')};$('loadJson').onchange=async e=>{try{const f=e.target.files[0];if(!f)return;if(f.size>2e6)throw Error('Project file too large');stop();project=validate(JSON.parse(await f.text()));activePattern=0;hydrate();status('Project JSON imported')}catch(err){status(err.message)}e.target.value=''};
function wavBlob(buffer){const channels=buffer.numberOfChannels,len=buffer.length,dataLen=len*channels*2,out=new ArrayBuffer(44+dataLen),v=new DataView(out);function str(off,s){for(let i=0;i<s.length;i++)v.setUint8(off+i,s.charCodeAt(i))}str(0,'RIFF');v.setUint32(4,36+dataLen,true);str(8,'WAVE');str(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,channels,true);v.setUint32(24,buffer.sampleRate,true);v.setUint32(28,buffer.sampleRate*channels*2,true);v.setUint16(32,channels*2,true);v.setUint16(34,16,true);str(36,'data');v.setUint32(40,dataLen,true);let k=44;for(let i=0;i<len;i++)for(let ch=0;ch<channels;ch++){let x=Math.max(-1,Math.min(1,buffer.getChannelData(ch)[i]));v.setInt16(k,x<0?x*32768:x*32767,true);k+=2}return new Blob([out],{type:'audio/wav'})}
$('exportWav').onclick=async()=>{sync();stop();const btn=$('exportWav');btn.disabled=true;status('Rendering WAV…');try{let seconds=project.bars*4*60/project.bpm+1;let c=new OfflineAudioContext(2,Math.ceil(seconds*44100),44100),out=c.createGain();out.gain.value=project.master*(project.outputGain??1);out.connect(c.destination);const dur=60/project.bpm/4;for(let b=0;b<project.bars;b++)for(let s=0;s<16;s++){const pat=project.patterns[playOrder()[b%playOrder().length]];schedule(c,out,s,(b*16+s)*dur+(s%2?project.swing*dur*.5:0),pat)}let rendered=await c.startRendering();download(safeName()+'.wav',wavBlob(rendered));status('WAV rendered and downloaded')}catch(e){status('WAV export failed: '+e.message)}finally{btn.disabled=false}};
function midiVLQ(n){let bytes=[n&127];while(n>>=7)bytes.unshift((n&127)|128);return bytes}function midiChunk(bytes){let n=bytes.length;return [...[...`MTrk`].map(x=>x.charCodeAt(0)),(n>>>24)&255,(n>>>16)&255,(n>>>8)&255,n&255,...bytes]}$('exportMidi').onclick=()=>{sync();let events=[],tpq=480,tempo=Math.round(60000000/project.bpm);events.push({tick:0,data:[255,81,3,(tempo>>16)&255,(tempo>>8)&255,tempo&255]});for(let b=0;b<project.bars;b++){let pat=project.patterns[b%project.patterns.length];for(let s=0;s<16;s++){let tick=(b*16+s)*120;for(let t=0;t<8;t++)if(pat.steps[t][s]){let pitch=[36,38,39,42,46,51,48,60][t];events.push({tick,data:[0x99,pitch,Math.max(1,Math.round(pat.steps[t][s]*105))]},{tick:tick+60,data:[0x89,pitch,0]})}for(let n=0;n<12;n++)if(pat.melody[n][s])events.push({tick,data:[0x90,notes[n],90]},{tick:tick+110,data:[0x80,notes[n],0]})}}events.sort((a,b)=>a.tick-b.tick||a.data[0]-b.data[0]);let tr=[],prev=0;for(let e of events){tr.push(...midiVLQ(e.tick-prev),...e.data);prev=e.tick}tr.push(0,255,47,0);let head=[77,84,104,100,0,0,0,6,0,0,0,1,1,224];download(safeName()+'.mid',new Blob([new Uint8Array([...head,...midiChunk(tr)])],{type:'audio/midi'}));status('MIDI downloaded')};
window.addEventListener('keydown',e=>{if(e.code==='Space'&&!['INPUT','SELECT','TEXTAREA','BUTTON'].includes(document.activeElement.tagName)){e.preventDefault();play()}});
// v7.0.74: non-destructive editing tools. All edits use the existing project schema.
const history=[];let lastTap=0,taps=[];
function snapshot(){history.push(JSON.stringify(project));if(history.length>30)history.shift()}
function undoEdit(){if(!history.length)return status('No edit to undo');stop();try{project=validate(JSON.parse(history.pop()));activePattern=Math.min(activePattern,project.patterns.length-1);hydrate();status('Last edit restored')}catch(e){status('Undo failed: '+e.message)}}
$('undoEdit').onclick=undoEdit;
$('tapTempo').onclick=()=>{const now=performance.now();if(now-lastTap>2200)taps=[];if(lastTap&&now-lastTap>180)taps.push(now-lastTap);lastTap=now;if(taps.length>6)taps.shift();if(taps.length>=2){project.bpm=Math.max(40,Math.min(240,Math.round(60000/(taps.reduce((a,b)=>a+b,0)/taps.length))));$('bpm').value=project.bpm;sync();status(`Tapped tempo: ${project.bpm} BPM`)}else status('Tap at least three times to detect BPM')};
$('humanize').onclick=()=>{snapshot();let p=project.patterns[activePattern];p.steps=p.steps.map(row=>row.map(v=>v?Math.round((.65+Math.random()*.35)*100)/100:0));render();status('Humanized note velocities (undo available)')};
$('rotatePattern').onclick=()=>{snapshot();let p=project.patterns[activePattern];p.steps=p.steps.map(row=>[row[15],...row.slice(0,15)]);p.melody=p.melody.map(row=>[row[15],...row.slice(0,15)]);render();status('Pattern shifted one step to the right')};
$('transposeUp').onclick=()=>{snapshot();let p=project.patterns[activePattern];p.melody=[...p.melody.slice(1),Array(16).fill(false)];render();status('Melody transposed up one available note row')};
$('transposeDown').onclick=()=>{snapshot();let p=project.patterns[activePattern];p.melody=[Array(16).fill(false),...p.melody.slice(0,-1)];render();status('Melody transposed down one available note row')};
$('copyPattern').onclick=()=>{try{localStorage.setItem('sos-beat-lab-pattern-clipboard',JSON.stringify(project.patterns[activePattern]));status('Pattern copied to local clipboard')}catch(e){status(e.message)}};
$('pastePattern').onclick=()=>{try{let data=JSON.parse(localStorage.getItem('sos-beat-lab-pattern-clipboard')||'null');if(!data||data.steps?.length!==8||data.melody?.length!==12||data.steps.some(r=>r.length!==16)||data.melody.some(r=>r.length!==16))throw Error('No compatible copied pattern');snapshot();project.patterns[activePattern]={...JSON.parse(JSON.stringify(data)),name:project.patterns[activePattern].name};render();status('Pattern pasted')}catch(e){status(e.message)}};

// v7.0.75: non-destructive creative tools and algorithmic groove bank.
const trackChoice=$('editTrack');tracks.forEach((name,i)=>{const option=document.createElement('option');option.value=i;option.textContent=name;trackChoice.append(option)});
const current=()=>project.patterns[activePattern];
function applyEdit(label,callback){snapshot();try{callback(current());render();status(label+' · Undo available')}catch(error){history.pop();status('Edit failed: '+error.message)}}
function rotate(array,direction){return direction>0?[array.at(-1),...array.slice(0,-1)]:[...array.slice(1),array[0]]}
$('reverseSteps').onclick=()=>applyEdit('Drum steps reversed',p=>p.steps=p.steps.map(row=>row.slice().reverse()));
$('rotateLeft').onclick=()=>applyEdit('Pattern shifted left',p=>{p.steps=p.steps.map(row=>rotate(row,-1));p.melody=p.melody.map(row=>rotate(row,-1))});
$('invertSteps').onclick=()=>applyEdit('Drum steps inverted',p=>p.steps=p.steps.map(row=>row.map(v=>v?0:1)));
$('clearTrack').onclick=()=>applyEdit('Selected track cleared',p=>p.steps[Number(trackChoice.value)].fill(0));
$('fillEvery').onclick=()=>applyEdit('Four-on-floor steps added',p=>{const row=p.steps[Number(trackChoice.value)];for(let i=0;i<16;i+=4)row[i]=1});
$('velocityRamp').onclick=()=>applyEdit('Velocity ramp applied',p=>{const row=p.steps[Number(trackChoice.value)];row.forEach((v,i)=>{if(v)row[i]=Math.round((.35+.65*i/15)*100)/100})});
function euclid(pulses,steps,rotation){const out=Array.from({length:steps},(_,i)=>((i*pulses)%steps)<pulses?1:0);return out.map((_,i)=>out[(i+rotation)%steps])}
$('euclidean').onclick=()=>applyEdit('Euclidean rhythm generated',p=>{const row=p.steps[Number(trackChoice.value)];const count=Math.max(1,Math.min(15,row.filter(Boolean).length||5));p.steps[Number(trackChoice.value)]=euclid(count,16,0)});
$('reverseMelody').onclick=()=>applyEdit('Melody reversed',p=>p.melody=p.melody.map(row=>row.slice().reverse()));
$('mirrorMelody').onclick=()=>applyEdit('Melody pitch mirrored',p=>p.melody=p.melody.slice().reverse());
$('quantizeMelody').onclick=()=>applyEdit('Melody quantized to selected scale',p=>{
 const scales={major:[0,2,4,5,7,9,11],minor:[0,2,3,5,7,8,10],pentatonic:[0,3,5,7,10]};const allowed=scales[$('scaleType').value]||scales.minor;
 for(let col=0;col<16;col++)for(let r=0;r<notes.length;r++)if(p.melody[r][col]&&!allowed.includes(notes[r]%12)){
 let nearest=notes.map((n,i)=>({i,d:Math.abs(n-notes[r])})).filter(x=>allowed.includes(notes[x.i]%12)).sort((a,b)=>a.d-b.d)[0];p.melody[r][col]=false;if(nearest)p.melody[nearest.i][col]=true;
 }
});
// 800 deterministic, individually selectable 16-step arrangements (20 families x 40 variants).
const grooveNames=['House','Techno','Trap','Boom Bap','Drum & Bass','Jungle','UK Garage','Breakbeat','Dubstep','Lo-Fi','Reggaeton','Afrobeats','Dancehall','Synthwave','Disco','Electro','Ambient','Future Bass','Hip Hop','Experimental'];
const grooveBank=$('grooveBank');grooveNames.forEach((name,f)=>{const group=document.createElement('optgroup');group.label=name;for(let v=0;v<40;v++){const option=document.createElement('option');option.value=f*40+v;option.textContent=`${name} · Variation ${String(v+1).padStart(2,'0')}`;group.append(option)}grooveBank.append(group)});
function generatedGroove(id){const family=Math.floor(id/40),variation=id%40,rows=tracks.map(()=>Array(16).fill(0));const beat=family%4,shift=variation%4,fill=Math.floor(variation/4);for(let s=0;s<16;s++){
 if((s+shift)%4===0)rows[0][s]=1;
 if((s+beat)%8===4)rows[1][s]=1;
 if((s+shift)%2===0)rows[3][s]=fill%3===0?.7:1;
 if((s+variation)%8===6)rows[4][s]=.8;
 if((s*(family+3)+variation)%17<2)rows[5][s]=.65;
 if(family%3===0&&(s+fill)%8===0)rows[2][s]=.75;
 if(family%5===0&&(s+variation)%8===0)rows[6][s]=.7;
 if(family%4===1&&(s+fill)%8===2)rows[7][s]=.65;
 }return rows}
$('applyGroove').onclick=()=>{if(!grooveBank.value)return status('Choose a groove first');const id=Number(grooveBank.value);applyEdit(`${grooveNames[Math.floor(id/40)]} variation ${(id%40)+1} applied`,p=>p.steps=generatedGroove(id))};
$('outputGain').oninput=()=>{project.outputGain=Number($('outputGain').value)/100;if(masterNode)masterNode.gain.value=project.master*project.outputGain};
$('delayFeedback').oninput=()=>{project.delayFeedback=Number($('delayFeedback').value)/100;if(feedback)feedback.gain.value=project.delayFeedback};
const oldHydrate=hydrate;hydrate=function(){oldHydrate();$('outputGain').value=Math.round((project.outputGain??1)*100);$('delayFeedback').value=Math.round((project.delayFeedback??.24)*100)};
const slotKey='sos-beat-lab-project-slots-v1';
function slots(){try{const data=JSON.parse(localStorage.getItem(slotKey)||'{}');return data&&typeof data==='object'&&!Array.isArray(data)?data:{}}catch{return {}}}
function updateSlots(){const box=$('saveSlots'),selected=box.value;box.replaceChildren();const empty=document.createElement('option');empty.value='';empty.textContent='Choose a saved project';box.append(empty);Object.keys(slots()).sort().forEach(name=>{const opt=document.createElement('option');opt.value=name;opt.textContent=name;box.append(opt)});if([...box.options].some(x=>x.value===selected))box.value=selected}
$('saveSlot').onclick=()=>{sync();const name=project.title.trim().slice(0,70);if(!name)return status('Enter a project title first');try{const data=slots();data[name]=JSON.stringify(project);localStorage.setItem(slotKey,JSON.stringify(data));updateSlots();$('saveSlots').value=name;status(`Saved project slot: ${name}`)}catch(e){status('Could not save slot: '+e.message)}};
$('loadSlot').onclick=()=>{const name=$('saveSlots').value;if(!name)return status('Select a project slot');try{const data=slots();if(!data[name])throw Error('Slot not found');stop();project=validate(JSON.parse(data[name]));activePattern=0;hydrate();status(`Loaded project slot: ${name}`)}catch(e){status('Load failed: '+e.message)}};
$('deleteSlot').onclick=()=>{const name=$('saveSlots').value;if(!name)return status('Select a project slot');if(!confirm(`Delete saved project "${name}"?`))return;const data=slots();delete data[name];try{localStorage.setItem(slotKey,JSON.stringify(data));updateSlots();status('Project slot deleted')}catch(e){status(e.message)}};
$('exportPatternText').onclick=()=>{const p=current(),lines=[`SOS Beat Lab · ${project.title}`,`${project.bpm} BPM`,...tracks.map((name,i)=>`${name.padEnd(12)} ${p.steps[i].map(v=>v?'●':'·').join(' ')}`),'Melody',...noteNames.map((name,i)=>`${name.padEnd(4)} ${p.melody[i].map(v=>v?'●':'·').join(' ')}`)];download(safeName()+'-pattern.txt',new Blob([lines.join('\n')],{type:'text/plain;charset=utf-8'}));status('Pattern text exported')};
updateSlots();

// Pointer paint/erase: start on a step and sweep across the row or other rows.
let paint=null,preventPaintClick=false;
const seqPaint=$('sequencer');
seqPaint.addEventListener('pointerdown',e=>{const b=e.target.closest('button.step');if(!b||e.button!==0)return;const t=Number(b.dataset.track),i=Number(b.dataset.step);paint={value:current().steps[t][i]?0:1,first:b,moved:false};});
seqPaint.addEventListener('pointerover',e=>{if(!paint||!(e.buttons&1))return;const b=e.target.closest('button.step');if(!b||b===paint.first)return;paint.moved=true;const t=Number(b.dataset.track),i=Number(b.dataset.step);current().steps[t][i]=paint.value;b.classList.toggle('on',!!paint.value)});
seqPaint.addEventListener('click',e=>{const b=e.target.closest('button.step');if(preventPaintClick&&b){e.stopImmediatePropagation();e.preventDefault();preventPaintClick=false;}paint=null;},true);
window.addEventListener('pointerup',()=>{if(paint?.moved){preventPaintClick=true;const b=paint.first,t=Number(b.dataset.track),i=Number(b.dataset.step);current().steps[t][i]=paint.value;b.classList.toggle('on',!!paint.value)}paint=null});
$('songBars').addEventListener('change',()=>{sync();status('Song length: '+project.bars+' bars')});
// Live capture of the actual master output via Web Audio MediaStreamDestination.
$('recordLive').onclick=async()=>{if(recording){status('Already recording');return}try{sync();const c=ctx();await c.resume();if(!c.createMediaStreamDestination||typeof MediaRecorder==='undefined')throw Error('This browser does not support live recording');recordDest=c.createMediaStreamDestination();masterNode.connect(recordDest);const formats=['audio/webm;codecs=opus','audio/ogg;codecs=opus','audio/webm'];const mime=formats.find(x=>MediaRecorder.isTypeSupported(x));recording=new MediaRecorder(recordDest.stream,mime?{mimeType:mime}:undefined);recordChunks=[];recording.ondataavailable=e=>{if(e.data.size)recordChunks.push(e.data)};recording.onstop=async()=>{try{const raw=new Blob(recordChunks,{type:recording.mimeType||'audio/webm'});const array=await raw.arrayBuffer();const decoded=await ctx().decodeAudioData(array.slice(0));download(safeName()+'-live-recording.wav',wavBlob(decoded));status('Recorded audio downloaded as WAV')}catch(e){const raw=new Blob(recordChunks,{type:recording.mimeType||'audio/webm'});download(safeName()+'-live-recording.webm',raw);status('WAV conversion unavailable; saved recorded audio as WebM')}finally{recordDest?.disconnect();recording=null;recordChunks=[]}};recording.start(250);if(!playing)await play();if(!playing)throw Error('Playback did not start; check the pattern and audio status');const ms=Math.min(1800000,project.bars*4*60000/project.bpm+350);recordTimeout=setTimeout(()=>$('stopRecord').click(),ms);status('● Recording live output…')}catch(e){status('Recording unavailable: '+e.message)}};
$('stopRecord').onclick=()=>{clearTimeout(recordTimeout);if(recording&&recording.state!=='inactive')recording.stop();stop()};

hydrate();updateXY();status('Loading bundled WAV sample pack…');loadBundledSamples();
}


const synthPatches={
 'warm-pad':{wave:'sawtooth',layer:'triangle',attack:.7,decay:1.5,sustain:.75,release:3,length:4,cutoff:2400,wet:.48,room:'concert-hall'},
 'cathedral-organ':{wave:'sine',layer:'triangle',attack:.09,decay:.3,sustain:.9,release:4,length:5,cutoff:8500,wet:.75,room:'cathedral'},
 'cinematic-strings':{wave:'sawtooth',layer:'sawtooth',detune:13,attack:1,decay:1,sustain:.8,release:4,length:5,cutoff:3800,wet:.58,room:'auditorium'},
 'ambient-cloud':{wave:'sine',layer:'triangle',attack:2,decay:2,sustain:.8,release:6,length:7,cutoff:2800,wet:.8,room:'ambient-space'},
 'plucked-bell':{wave:'sine',layer:'triangle',attack:.005,decay:.7,sustain:.04,release:2,length:.4,cutoff:12000,wet:.6,room:'chamber'},
 'analog-lead':{wave:'sawtooth',layer:'square',detune:7,attack:.01,decay:.3,sustain:.55,release:.4,length:1.5,cutoff:5500,wet:.15,room:'studio'},
 'deep-bass':{wave:'sine',layer:'sawtooth',detune:1,attack:.01,decay:.18,sustain:.8,release:.35,length:1.5,cutoff:800,wet:0,room:'dry'},
 'dream-piano':{wave:'triangle',layer:'sine',attack:.006,decay:1.3,sustain:.12,release:2.5,length:1.8,cutoff:6800,wet:.48,room:'concert-hall'},
 'space-choir':{wave:'sine',layer:'sawtooth',detune:16,attack:1.4,decay:2,sustain:.8,release:5,length:6,cutoff:2300,wet:.8,room:'cathedral'},
 'retro-pluck':{wave:'square',layer:'triangle',attack:.006,decay:.2,sustain:.12,release:.5,length:.4,cutoff:4700,wet:.15,room:'plate'},
 'glassy-pad':{wave:'triangle',layer:'sine',attack:1,decay:2,sustain:.65,release:5,length:6,cutoff:12000,wet:.65,room:'cave'},
 'dark-drone':{wave:'sawtooth',layer:'sine',detune:9,attack:1.5,decay:1.4,sustain:.8,release:5,length:7,cutoff:900,wet:.65,room:'warehouse'}
};


})();
