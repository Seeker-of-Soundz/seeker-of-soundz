/* Seeker Of SoundZ v7.0.16 — automatic music waveform + beat FX/camera sync */
(()=>{
'use strict';
const $=(s,r=document)=>r.querySelector(s);
const audioInput=$('#composerAudioV4180'), audio=$('#composerPreviewAudioV4180');
const analyze=$('#analyzeBeatsV4190');
let autoToken=0;
function forceAutoOptions(){
 const visuals=$('#autoSyncAddVisualsV4250'), camera=$('#autoSyncAddCameraV4250'), bass=$('#autoSyncBassDistortionV4300');
 if(visuals)visuals.checked=true;if(camera)camera.checked=true;if(bass)bass.checked=true;
 const overlap=$('#autoSyncOverlapV4280');if(overlap && Number(overlap.value)<3)overlap.value='3';
 const density=$('#autoSyncDensityV4250');if(density && Number(density.value)>2)density.value='2';
 document.querySelectorAll('[data-autosync-pool]').forEach(input=>input.checked=true);
 const wave=$('#producerWaveformOverlayEnabledV4220');if(wave)wave.checked=true;
}
function generateWithRetry(token,attempt=0){
 if(token!==autoToken)return;
 forceAutoOptions();
 const api=window.SOSProducerAutoSyncV4270;
 const beats=api?.beatRows?.()||[];
 if(api?.generate && beats.length){
  api.generate();
  const status=$('#autoSyncStatusV4250');
  if(status)status.textContent=`Auto-Sync active: ${beats.length} beat markers are driving visual effects, camera movement, shake and bass-drop motion.`;
  window.SOS?.toast?.('Music waveform analyzed. Effects + camera motion were added automatically.',{title:'Auto-Sync Ready',icon:'✓'});
  return;
 }
 if(attempt<12)setTimeout(()=>generateWithRetry(token,attempt+1),120+attempt*35);
}
function startMusicWorkflow(){
 if(!audioInput?.files?.[0])return;
 autoToken++;const token=autoToken;forceAutoOptions();
 const status=$('#autoSyncStatusV4250');if(status)status.textContent='Reading MP3 waveform and detecting beats…';
 setTimeout(()=>{if(token===autoToken&&!analyze?.disabled)analyze?.click()},300);
}
audioInput?.addEventListener('change',startMusicWorkflow);
window.addEventListener('sos:beat-analysis-complete',()=>generateWithRetry(autoToken,0));
audio?.addEventListener('loadedmetadata',forceAutoOptions);

/* Keep waveform visibly enabled on the rendered video when music is loaded. */
document.addEventListener('change',e=>{
 if(e.target===audioInput&&audioInput.files?.[0]){
  const wave=$('#producerWaveformOverlayEnabledV4220');if(wave){wave.checked=true;wave.dispatchEvent(new Event('change',{bubbles:true}))}
 }
});

/* Render-mode UI stays lightweight; cancellation now has its own cleanup event. */
const clearRenderMode=()=>document.body.classList.remove('sosRenderingV7015');
window.addEventListener('sos:render-complete',clearRenderMode);
window.addEventListener('sos:render-cancelled',clearRenderMode);
})();
