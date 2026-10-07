/* v7.0.39: live, independent text and navigation sizing, explicit persistence. */
(()=>{'use strict';
const KEY='sos_member_font_sizes_v7039';
const root=document.documentElement;
const identity=()=>{try{return window.SOS?.getSession?.()?.id||null}catch{return null}};
const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return {}}};
const clamp=(v,min,max)=>Math.max(min,Math.min(max,Number(v)||100));
const defaults={text:100,nav:100};let draft={...defaults},dirty=false;
function apply(){root.style.setProperty('--sos-text-scale',String(draft.text/100));root.style.setProperty('--sos-nav-scale',String(draft.nav/100));root.toggleAttribute('data-sos-text-scaled',draft.text!==100);root.toggleAttribute('data-sos-nav-scaled',draft.nav!==100);for(const type of ['text','nav']){const el=document.querySelector(`[data-sos-size-${type}]`),out=document.querySelector(`[data-sos-size-${type}-output]`);if(el)el.value=draft[type];if(out)out.textContent=draft[type]+'%';}}
function sync(){if(dirty)return;const id=identity(),record=id?read()[id]:null;draft={text:clamp(record?.text,70,180),nav:clamp(record?.nav,65,140)};apply()}
function save(){const id=identity();if(!id){window.SOS?.toast?.('Sign in to save your font sizes.');return}const all=read();all[id]={...draft};localStorage.setItem(KEY,JSON.stringify(all));dirty=false;apply();window.SOS?.toast?.('Font sizes saved for your profile.')}
function mount(){const section=document.querySelector('.memberAppearanceV7026');if(!section||section.querySelector('[data-sos-size-text]'))return false;
const panel=document.createElement('section');panel.className='memberFontSizeV7039';panel.innerHTML=`<h3>Personal font sizing</h3><p>Slide to preview immediately. Save only when you like the result. Navigation sizing is separate to keep the menu fitting correctly.</p><label for="sosTextSize39">Website text size <output data-sos-size-text-output>100%</output></label><input id="sosTextSize39" data-sos-size-text type="range" min="70" max="180" step="1" value="100"><label for="sosNavSize39">Navigation text size <output data-sos-size-nav-output>100%</output></label><input id="sosNavSize39" data-sos-size-nav type="range" min="65" max="140" step="1" value="100"><div class="memberFontSizeActionsV7039"><button type="button" class="secondaryButton" data-sos-size-save>Save Font Sizes</button><button type="button" class="smallAction" data-sos-size-reset>Reset to 100%</button></div>`;
const actions=section.querySelector('.memberAppearanceActionsV7026');if(actions)actions.before(panel);else section.append(panel);
for(const type of ['text','nav'])panel.querySelector(`[data-sos-size-${type}]`).addEventListener('input',e=>{draft[type]=clamp(e.target.value,type==='nav'?65:70,type==='nav'?140:180);dirty=true;apply()});
panel.querySelector('[data-sos-size-save]').addEventListener('click',save);panel.querySelector('[data-sos-size-reset]').addEventListener('click',()=>{draft={...defaults};dirty=true;apply()});apply();return true}
function start(){sync();if(mount())return;const obs=new MutationObserver(()=>{if(mount())obs.disconnect()});obs.observe(document.body,{childList:true,subtree:true});setTimeout(()=>obs.disconnect(),20000)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();window.addEventListener('sos:supabase-session',()=>queueMicrotask(sync));window.addEventListener('storage',e=>{if(e.key===KEY)sync()});
})();
