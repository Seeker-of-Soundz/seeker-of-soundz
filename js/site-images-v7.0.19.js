(()=>{'use strict';
const page=(location.pathname.split('/').pop()||'index.html').toLowerCase();
const keyFor=(img,i)=>img.dataset.sosImageKey||`img-${String(i+1).padStart(3,'0')}`;
async function client(){for(let i=0;i<40;i++){const c=window.SOS_SUPABASE?.client||window.SOSSupabase?.client||window.supabaseClient||window.sosSupabase;if(c?.from)return c;await new Promise(r=>setTimeout(r,100));}return null}
async function apply(){const imgs=[...document.querySelectorAll('img')];imgs.forEach((img,i)=>img.dataset.sosImageKey=keyFor(img,i));const c=await client();if(!c)return;try{const {data,error}=await c.from('site_image_overrides').select('image_key,image_url,alt_text,is_hidden').eq('page_slug',page);if(error||!data)return;const map=new Map(data.map(x=>[x.image_key,x]));imgs.forEach(img=>{const row=map.get(img.dataset.sosImageKey);if(!row)return;if(row.image_url)img.src=row.image_url;if(row.alt_text!==null)img.alt=row.alt_text||'';img.hidden=!!row.is_hidden;img.dataset.sosImageHidden=row.is_hidden?'true':'false';});}catch(e){console.warn('SOS image overrides unavailable',e)}}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',apply):apply();
window.SOSSiteImages={apply,keyFor};})();
