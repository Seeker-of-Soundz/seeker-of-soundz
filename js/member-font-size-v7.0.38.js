/* v7.0.38: independent live font size preview and explicit save. */
(()=>{'use strict';
const KEY='sos_member_font_size_v7038', root=document.documentElement;
const session=()=>{try{return window.SOS?.getSession?.()?.id||null}catch{return null}};
const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return {}}};
const clamp=v=>Math.max(75,Math.min(200,Number(v)||100));
let draft=null,dirty=false;
const saved=()=>{const id=session();return clamp(id?read()[id]:100)};
function apply(v){v=clamp(v);root.style.setProperty('--sos-member-font-scale',String(v/100));root.toggleAttribute('data-member-font-size-custom',v!==100);const out=document.querySelector('[data-member-font-size-output]');if(out)out.textContent=v+'%';const sample=document.querySelector('[data-member-font-size-sample]');if(sample)sample.style.fontSize=(v/100)+'rem';return v}
function sync(){if(dirty)return;draft=saved();const input=document.querySelector('[data-member-font-size-slider]');if(input)input.value=draft;apply(draft)}
function save(){const id=session();if(!id){window.SOS?.toast?.('Sign in to save your text size.',{title:'Member appearance'});return}const all=read();all[id]=clamp(draft);localStorage.setItem(KEY,JSON.stringify(all));dirty=false;apply(draft);window.SOS?.toast?.('Font size saved for your profile.',{title:'Member appearance'})}
function mount(){const section=document.querySelector('.memberAppearanceV7026');if(!section||section.querySelector('[data-member-font-size-slider]'))return false;
const panel=document.createElement('div');panel.className='memberFontSizeV7038';panel.innerHTML='<div class="memberFontSizeHeadV7038"><strong>Website font size</strong><output data-member-font-size-output>100%</output></div><p>Adjust your selected font to a comfortable reading size. Preview immediately, then save.</p><input type="range" min="75" max="200" step="5" value="100" aria-label="Website font size" data-member-font-size-slider><div class="memberFontSizeMarksV7038"><span>75% · Smaller</span><span>100% · Normal</span><span>200% · Larger</span></div><div class="memberFontSizeSampleV7038" data-member-font-size-sample>Preview: Seeker Of SoundZ</div><div class="memberFontSizeActionsV7038"><button type="button" class="secondaryButton" data-member-font-size-save>Save Font Size</button><button type="button" class="smallAction" data-member-font-size-reset>Reset Size</button></div>';
const actions=section.querySelector('.memberAppearanceActionsV7026');if(actions)actions.before(panel);else section.append(panel);
panel.querySelector('input').addEventListener('input',e=>{draft=apply(e.target.value);dirty=true});panel.querySelector('[data-member-font-size-save]').addEventListener('click',save);panel.querySelector('[data-member-font-size-reset]').addEventListener('click',()=>{draft=100;dirty=true;panel.querySelector('input').value=100;apply(100)});sync();return true}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
function start(){sync();if(mount())return;const observer=new MutationObserver(()=>{if(mount())observer.disconnect()});observer.observe(document.body,{childList:true,subtree:true});setTimeout(()=>observer.disconnect(),30000)}
window.addEventListener('sos:supabase-session',()=>queueMicrotask(sync));window.addEventListener('storage',e=>{if(e.key===KEY)sync()});
})();
