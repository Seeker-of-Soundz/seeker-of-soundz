/* SOS v7.0.89: homepage links from the same Supabase RPC as Socials */
(()=>{'use strict';
const grid=document.getElementById('sosHomeSocialGrid');if(!grid)return;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeUrl=v=>{try{let s=String(v||'').trim();if(!s)return '';if(!/^[a-z][\w+.-]*:\/\//i.test(s))s='https://'+s;const u=new URL(s);return ['https:','http:'].includes(u.protocol)&&u.hostname.includes('.')?u.href:''}catch{return ''}};
const imageIcon=v=>{try{const u=new URL(String(v||''));return u.protocol==='https:'&&/\.(png|jpe?g|webp|gif|svg)$/i.test(u.pathname)}catch{return false}};
const icon=v=>imageIcon(v)?`<img class="sosHomeIconImage" src="${esc(v)}" alt="" loading="lazy" referrerpolicy="no-referrer">`:`<span aria-hidden="true">${esc(v||'↗')}</span>`;
let busy=false,ready=false;
async function load(){
 const c=window.SOS_SUPABASE?.client;
 if(!c||busy)return;busy=true;
 try{
  const {data,error}=await c.rpc('get_site_social_links');
  if(error)throw error;
  if(!Array.isArray(data))throw Error('Invalid Socials response');
  const rows=data.filter(r=>r.visible!==false);
  grid.innerHTML=rows.length?rows.map(r=>{
   const url=safeUrl(r.url);
   return `<a class="socialCard ${r.featured?'socialCardFeatured':''}" href="${esc(url||'#')}" ${url?'target="_blank" rel="noopener noreferrer"':'aria-disabled="true" tabindex="-1"'} aria-label="${esc(r.name||r.key)}">
    <div class="socialCardTop"><span class="socialIcon">${icon(r.icon)}</span><span class="socialArrow" aria-hidden="true">↗</span></div>
    <div class="socialCardContent"><p>${esc(r.category||'Connect')}</p><h3>${esc(r.name||r.key)}</h3><span>${esc(r.description||'Official Seeker Of SoundZ destination')}</span></div>
    ${url?'':'<small class="sosHomeLinkMissing">Link not configured</small>'}
   </a>`}).join(''):'<p class="sosHomeSocialStatus">No public social links are currently available.</p>';
 }catch(e){console.warn('[SOS Homepage Socials]',e);grid.innerHTML='<p class="sosHomeSocialStatus">Social links could not be loaded. <a href="socials.html">Visit the Socials page</a> or try refreshing.</p>'}
 finally{busy=false}
}
function boot(){if(window.SOS_SUPABASE?.client){ready=true;load();return}if(!ready)setTimeout(boot,350)}
boot();window.addEventListener('pageshow',load);window.addEventListener('focus',load);window.addEventListener('sos:supabase-session',load);
window.addEventListener('storage',e=>{if(e.key==='sos-social-links-updated')load()});
try{const channel=new BroadcastChannel('sos-social-links');channel.onmessage=e=>{if(e.data?.type==='updated')load()}}catch(_){}
})();
