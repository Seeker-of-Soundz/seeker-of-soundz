/* v7.0.37 single font controller: draft preview, explicit save, independent nav font. */
(()=>{'use strict';
const KEY='sos_member_font_v7026', root=document.documentElement;
const faces={original:null,system:'system-ui, sans-serif',rounded:'"Trebuchet MS", sans-serif',clean:'Arial, sans-serif',humanist:'Verdana, sans-serif',classic:'Georgia, serif',mono:'Consolas, monospace',retro:'"Courier New", monospace',cowboy:'Rockwell, Georgia, serif',western:'Copperplate, Georgia, serif',arcade:'"Lucida Console", monospace',cinema:'Impact, sans-serif',editorial:'Palatino, Georgia, serif',tech:'"Arial Narrow", sans-serif',grunge:'"SOS Eroded", serif',stencil:'Impact, sans-serif',gothic:'"SOS Malegroth", serif',handwritten:'"SOS Cartoonish", cursive',disco:'"SOS Brigold", serif',scifi:'"SOS Scientific", sans-serif',punk:'"SOS Metalico", sans-serif',minimalist:'Arial, sans-serif',typewriter:'"Courier New", monospace',brigold:'"SOS Brigold", serif',scientific:'"SOS Scientific", sans-serif',metalico:'"SOS Metalico", sans-serif',retrobyte:'"SOS RetroByte", monospace',eroded:'"SOS Eroded", serif',malegroth:'"SOS Malegroth", serif',cartoonish:'"SOS Cartoonish", cursive',godfather:'"SOS Godfather", serif',nonfiction:'"SOS Nonfiction", serif',groove:'"Trebuchet MS", "Arial Rounded MT Bold", sans-serif',jazz:'"Palatino Linotype", "Book Antiqua", serif',industrial:'"Arial Black", Impact, sans-serif',studio:'"Segoe UI", Tahoma, sans-serif',pixel:'"Lucida Console", Monaco, monospace',elegant:'"Baskerville", "Times New Roman", serif'};
const session=()=>{try{return window.SOS?.getSession?.()?.id||null}catch{return null}};
const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return {}}};
const valid=k=>Object.prototype.hasOwnProperty.call(faces,k)?k:'original';
let draft=null, dirty=false;
function saved(){const id=session();return valid(id?(read()[id]||'original'):'original')}
function nav(){try{const id=session(),s=JSON.parse(localStorage.getItem('sos_member_style_v7033')||'{}');return id?(s[id]?.navFont||'inherit'):'inherit'}catch{return 'inherit'}}
function apply(k){k=valid(k);if(k==='original'){root.removeAttribute('data-member-font');root.style.removeProperty('--sos-active-font')}else{root.dataset.memberFont=k;root.style.setProperty('--sos-active-font',faces[k])}
const n=document.querySelector('[data-member-nav-font]')?.value||nav();root.style.setProperty('--sos-active-nav-font',n==='inherit'?(faces[k]||'inherit'):(faces[n]||faces[k]||'inherit'));
const preview=document.querySelector('[data-member-font-preview]');if(preview)preview.style.fontFamily=faces[k]||'';
return k}
function refresh(){if(dirty)return;draft=saved();const sel=document.querySelector('[data-member-font-select]');if(sel&&[...sel.options].some(o=>o.value===draft))sel.value=draft;apply(draft)}
function save(k){k=valid(k);const id=session();if(!id){window.SOS?.toast?.('Please sign in to save your font.',{title:'Member font'});return}const all=read();all[id]=k;localStorage.setItem(KEY,JSON.stringify(all));draft=k;dirty=false;apply(k);window.SOS?.toast?.('Your font preference has been saved.',{title:'Member appearance'})}
document.addEventListener('change',e=>{if(e.target.matches?.('[data-member-font-select]')){draft=valid(e.target.value);dirty=true;apply(draft)}else if(e.target.matches?.('[data-member-nav-font]'))apply(draft||saved())},true);
document.addEventListener('click',e=>{if(e.target.closest?.('[data-member-font-save]')){const sel=document.querySelector('[data-member-font-select]');save(sel?.value||draft||saved())}else if(e.target.closest?.('[data-member-font-reset]')){const sel=document.querySelector('[data-member-font-select]');if(sel)sel.value='original';save('original')}},true);
// Legacy profile handlers are still responsible for their other features. Reassert the draft after their font handlers run.
document.addEventListener('change',e=>{if(e.target.matches?.('[data-member-font-select]'))queueMicrotask(()=>apply(draft||saved()))});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refresh,{once:true});else refresh();
window.addEventListener('sos:supabase-session',()=>queueMicrotask(refresh));window.addEventListener('storage',e=>{if(e.key===KEY)refresh()});
window.SOSMemberFontV7037={apply,refresh,save};
})();