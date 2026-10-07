(()=>{'use strict';
const page=(location.pathname.split('/').pop()||'index.html').toLowerCase();
const NEVER_GATE=new Set(['index.html','members.html','admin.html','password-reset.html']);
async function client(){for(let i=0;i<50;i++){const c=window.SOS_SUPABASE?.client||window.SOSSupabase?.client||window.supabaseClient;if(c?.from)return c;await new Promise(r=>setTimeout(r,80))}return null}
function finish(){document.documentElement.classList.remove('sosAccessPending')}
function gate(mode){finish();document.body.innerHTML=`<div class="sosPageAccessGate"><div><img src="assets/images/sos-logo.png" alt="Seeker Of SoundZ"><p class="sectionEyebrow">Private Frequency</p><h1>This page is currently restricted</h1><p>${mode==='hidden'?'This page has been hidden by the site administrator.':'Your account does not currently have access to this page.'}</p><div class="sosGateActions"><a class="primaryButton" href="members.html">Member Login</a><a class="secondaryButton" href="index.html">Return Home</a></div></div></div>`}
async function profile(c,user){if(!user)return null;const {data}=await c.from('profiles').select('role,paid_member,collaboration_access,is_banned').eq('id',user.id).maybeSingle();return data||null}
function allowed(mode,user,p){const role=String(p?.role||'member').toLowerCase();const admin=['owner','administrator','admin','developer'].includes(role);if(admin)return true;if(mode==='public')return true;if(!user||p?.is_banned)return false;if(mode==='members')return true;if(mode==='vip')return !!(p?.paid_member||role==='premium_member'||role==='vip');if(mode==='collaboration')return !!p?.collaboration_access;if(mode==='admin'||mode==='hidden')return false;return true}
async function run(){if(NEVER_GATE.has(page)){finish();return}const c=await client();if(!c){finish();return}try{const {data}=await c.from('site_page_access').select('access_mode').eq('page_slug',page).maybeSingle();const mode=data?.access_mode||'public';if(mode==='public'){finish();return}const {data:{user}}=await c.auth.getUser();const p=await profile(c,user);allowed(mode,user,p)?finish():gate(mode)}catch(e){console.warn('Page access check unavailable',e);finish()}}
run();
})();
