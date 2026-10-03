/* Seeker Of SoundZ v7.0.14 — authoritative preview/timeline synchronization */
(()=>{
'use strict';
const $=(s,r=document)=>r.querySelector(s);
const video=$('#composerPreviewVideoV4180');
const audio=$('#composerPreviewAudioV4180');
const input=$('#composerVideoV4180');
const content=$('#timelineContentV4250');
const currentLabel=$('#producerCurrentTimeV4190');
const durationLabel=$('#producerDurationV4190');
const playButton=$('#producerPlayV4190');
const pauseButton=$('#producerPauseV4190');
if(!video||!content)return;
const format=(seconds=0)=>{const n=Math.max(0,Number(seconds)||0),m=Math.floor(n/60),s=n-m*60;return `${String(m).padStart(2,'0')}:${s.toFixed(2).padStart(5,'0')}`};
const projectDuration=()=>Math.max(.01,Number(window.SOSVideoClipsV4240?.totalDuration?.()||video.duration||0));
const projectTime=()=>Math.max(0,Number(window.SOSVideoClipsV4240?.globalTime?.()??video.currentTime??0));
let raf=0;
function paint(){
 const total=projectDuration(),time=Math.min(total,projectTime()),progress=Math.max(0,Math.min(1,time/total));
 content.style.setProperty('--sos-playhead-progress',String(progress));
 if(currentLabel)currentLabel.textContent=format(time);
 if(durationLabel)durationLabel.textContent=format(total);
 if(playButton)playButton.classList.toggle('isPlayingV7014',!video.paused&&!video.ended);
 raf=requestAnimationFrame(paint);
}
function refreshDuration(fit=false){
 setTimeout(()=>{
  const total=projectDuration();
  const end=$('#composerEndV4180'),inspectEnd=$('#inspectorEndV4190');
  if(end&&(fit||!Number(end.value)||Number(end.value)>total||Math.abs(Number(end.value)-total)>.05)){
   end.value=total.toFixed(2);end.dispatchEvent(new Event('input',{bubbles:true}));end.dispatchEvent(new Event('change',{bubbles:true}));
  }
  if(inspectEnd)inspectEnd.value=total.toFixed(2);
  if(durationLabel)durationLabel.textContent=format(total);
  window.dispatchEvent(new CustomEvent('sos:timeline-duration-ready',{detail:{duration:total}}));
  if(fit)$('#timelineFitV4250')?.click();
 },180);
}
video.addEventListener('loadedmetadata',()=>refreshDuration(true));
video.addEventListener('durationchange',()=>refreshDuration(false));
input?.addEventListener('change',()=>setTimeout(()=>refreshDuration(true),260));
['sos:video-split','sos:video-segment-deleted','sos:clip-trimmed','sos:ripple-cut-applied'].forEach(name=>window.addEventListener(name,()=>refreshDuration(false)));

/* Space behaves like a professional editor transport shortcut, but never steals
   keystrokes while the user is typing or operating a form control. */
document.addEventListener('keydown',event=>{
 if(event.code!=='Space'||event.repeat||event.ctrlKey||event.metaKey||event.altKey)return;
 const target=event.target;
 if(target?.closest?.('input,textarea,select,button,[contenteditable="true"],dialog'))return;
 if(!video.src&&!video.currentSrc)return;
 event.preventDefault();
 if(video.paused||video.ended)playButton?.click();else pauseButton?.click();
},true);

video.addEventListener('play',()=>playButton?.classList.add('isPlayingV7014'));
video.addEventListener('pause',()=>playButton?.classList.remove('isPlayingV7014'));
video.addEventListener('ended',()=>playButton?.classList.remove('isPlayingV7014'));

/* Keep music close to the project clock after native-video seeks. The existing
   media mapper remains authoritative for trimmed/offset music. */
video.addEventListener('seeked',()=>{
 const mapped=window.SOSMediaSettingsV4330?.mapMusicTime?.(projectTime());
 if(audio?.src&&Number.isFinite(mapped)&&Math.abs((audio.currentTime||0)-mapped)>.08)audio.currentTime=Math.max(0,Math.min(mapped,audio.duration||mapped));
});
refreshDuration(false);cancelAnimationFrame(raf);paint();
})();
