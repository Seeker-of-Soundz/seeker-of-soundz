/* SOS 7.0.84: public social links, verified URLs and reliable refresh */
(()=>{'use strict';
const grid=document.querySelector('#socialHub .socialGrid');if(!grid)return;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safe=v=>{try{let s=String(v||'').trim();if(!s)return '';if(!/^[a-z][\w+.-]*:\/\//i.test(s))s='https://'+s;const u=new URL(s);return ['https:','http:'].includes(u.protocol)&&u.hostname.includes('.')?u.href:''}catch{return ''}};
const iconIsImage=value=>{try{const u=new URL(String(value||''));return u.protocol==='https:'&&/\.(png|jpe?g|webp|gif|svg)(?:$|[?#])/i.test(u.pathname+u.search)}catch{return false}};
const iconHTML=value=>iconIsImage(value)?`<img class="sosSocialCustomIcon" src="${esc(value)}" alt="" loading="lazy" referrerpolicy="no-referrer">`:`<span aria-hidden="true">${esc(value||'↗')}</span>`;
let busy=false,channel=null;
async function load(){const client=window.SOS_SUPABASE?.client;if(!client||busy)return;busy=true;
try{const {data,error}=await client.rpc('get_site_social_links');if(error)throw error;
if(!Array.isArray(data))throw Error('Unexpected social link response');
if(!data.length){grid.innerHTML='<p class="socialLinksStatusV7084">No public social links are configured yet. Add them in Admin Hub → Socials.</p>';return}
grid.innerHTML=data.filter(r=>r.visible!==false).map(r=>{const href=safe(r.url);return `<a class="socialCard ${r.featured?'socialCardFeatured':''}" href="${esc(href||'#')}" ${href?'target="_blank" rel="noopener noreferrer"':'aria-disabled="true" tabindex="-1"'}><div class="socialCardTop"><span class="socialIcon">${iconHTML(r.icon)}</span><span class="socialArrow">↗</span></div><div class="socialCardContent"><p class="sectionEyebrow">${esc(r.category||'Connect')}</p><h3>${esc(r.name||r.key)}</h3><p>${esc(r.description||'Official Seeker Of SoundZ destination.')}</p></div>${href?'':'<span class="socialComingSoonV4197">Link not configured</span>'}</a>`}).join('');
}catch(e){console.warn('[SOS Socials]',e);const status=document.getElementById('socialLinksStatusV7084')||document.createElement('p');status.id='socialLinksStatusV7084';status.className='socialLinksStatusV7084';status.textContent='Could not refresh social links from Supabase. Existing cards may be outdated.';grid.before(status)}finally{busy=false}}
function boot(){const client=window.SOS_SUPABASE?.client;if(!client)return;load();if(!channel){channel=client.channel('site-social-links-v7084').on('postgres_changes',{event:'*',schema:'public',table:'site_social_links'},load).subscribe()}}
boot();window.addEventListener('sos:supabase-session',boot);window.addEventListener('pageshow',load);window.addEventListener('focus',load);
window.addEventListener('storage',event=>{if(event.key==='sos-social-links-updated')load()});
try{const updates=new BroadcastChannel('sos-social-links');updates.onmessage=event=>{if(event.data?.type==='updated')load()}}catch(_){}
})();
