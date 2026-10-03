/* Seeker Of SoundZ v7.0.15 — workflow, auto beat-sync and render performance polish */
(()=>{
'use strict';
const $=(s,r=document)=>r.querySelector(s);
const video=$('#composerPreviewVideoV4180'), audio=$('#composerPreviewAudioV4180');
const audioInput=$('#composerAudioV4180'), analyze=$('#analyzeBeatsV4190');
const render=$('#composerRenderButtonV4180'), transport=$('#producerTransportDockV4260');
if(!video)return;

/* One obvious export action beside the transport. It delegates to the proven
   direct renderer, so the downloaded file still includes canvas effects/audio. */
if(transport && !$('#producerQuickExportV7015')){
 const b=document.createElement('button'); b.id='producerQuickExportV7015'; b.type='button';
 b.className='producerQuickExportV7015'; b.textContent='Export Finished Video';
 b.title='Render and download the finished project';
 b.addEventListener('click',()=>{ render?.scrollIntoView({behavior:'smooth',block:'center'}); setTimeout(()=>render?.click(),260); });
 transport.appendChild(b);
}

/* Auto analyze uploaded music, then use the existing Auto-Sync engine to place
   timed effects/camera motion on detected beats. */
let autoTimer=0;
function autoAnalyze(){
 clearTimeout(autoTimer);
 autoTimer=setTimeout(()=>{
  if(!audioInput?.files?.[0]||!analyze||analyze.disabled)return;
  analyze.click();
 },420);
}
audioInput?.addEventListener('change',autoAnalyze);
window.addEventListener('sos:beat-analysis-complete',()=>{
 setTimeout(()=>{
  const api=window.SOSProducerAutoSyncV4270;
  if(api?.generate){ api.generate(); $('#autoSyncStatusV4250') && ($('#autoSyncStatusV4250').textContent='Music analyzed — video effects and camera motion synchronized to detected beats.'); }
 },120);
});

/* Keep music locked to the project clock during playback/seeks. Small drift is
   corrected softly; large drift is corrected immediately. */
let syncRaf=0;
function syncLoop(){
 if(!video.paused && audio?.src){
  const t=window.SOSVideoClipsV4240?.globalTime?.()??video.currentTime;
  const mapped=window.SOSMediaSettingsV4330?.mapMusicTime?.(t);
  if(Number.isFinite(mapped)){
   const drift=(audio.currentTime||0)-mapped;
   if(Math.abs(drift)>.12) audio.currentTime=Math.max(0,Math.min(mapped,audio.duration||mapped));
   else audio.playbackRate=Math.max(.985,Math.min(1.015,1-drift*.08));
  }
 }
 syncRaf=requestAnimationFrame(syncLoop);
}
cancelAnimationFrame(syncRaf); syncLoop();
video.addEventListener('pause',()=>{if(audio)audio.playbackRate=1});

/* Pause nonessential site animation while the real-time canvas renderer runs.
   The source video/canvas stay active because captureStream requires rendered
   frames; decorative UI animation does not. */
window.addEventListener('sos:render-started',()=>document.body.classList.add('sosRenderingV7015'));
const endRender=()=>document.body.classList.remove('sosRenderingV7015');
window.addEventListener('sos:render-complete',endRender);
$('#cancelDirectRenderV4212')?.addEventListener('click',endRender);

/* More useful status text when a music file is ready. */
audio?.addEventListener('loadedmetadata',()=>{
 const status=$('#composerAudioStatusV4182 small');
 if(status)status.textContent='Analyzing beats automatically; playback, effects and final export stay locked to the project timeline.';
});
})();
