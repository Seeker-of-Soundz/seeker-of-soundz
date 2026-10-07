/* Seeker Of SoundZ v7.0.28 — apply a member font across every public page. */
(()=>{'use strict';const KEY='sos_member_font_v7026';
const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return {}}};
const session=()=>window.SOS?.getSession?.()||null;
function apply(){const s=session(),all=read(),v=(s&&all[s.id])||'original';if(v==='original')document.documentElement.removeAttribute('data-member-font');else document.documentElement.dataset.memberFont=v;}
apply();document.addEventListener('DOMContentLoaded',apply,{once:true});window.addEventListener('sos:supabase-session',()=>setTimeout(apply,0));window.addEventListener('storage',e=>{if(e.key===KEY)apply()});window.SOSMemberFontV7028={apply};})();
