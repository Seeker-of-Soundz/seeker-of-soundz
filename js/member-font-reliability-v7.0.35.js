/* Keep the existing account-scoped preference and its UI in sync, without DOM observers. */
(()=>{'use strict';
 const KEY='sos_member_font_v7026';
 function selected(){try{const s=window.SOS?.getSession?.();const map=JSON.parse(localStorage.getItem(KEY)||'{}');return (s&&map[s.id])||'original'}catch{return 'original'}}
 function sync(){const v=selected();const root=document.documentElement;if(v==='original')root.removeAttribute('data-member-font');else root.dataset.memberFont=v;
  const select=document.querySelector('[data-member-font-select]');if(select&&[...select.options].some(o=>o.value===v)&&select.value!==v)select.value=v;
  const preview=document.querySelector('[data-member-font-preview]');if(preview)preview.dataset.font=v;
 }
 document.addEventListener('change',e=>{if(e.target.matches?.('[data-member-font-select]')){const v=e.target.value;if(v==='original')document.documentElement.removeAttribute('data-member-font');else document.documentElement.dataset.memberFont=v;}},true);
 document.addEventListener('click',e=>{if(e.target.closest?.('[data-member-font-save],[data-member-font-reset]'))setTimeout(sync,0)},true);
 document.addEventListener('DOMContentLoaded',()=>{sync();setTimeout(sync,1100)},{once:true});
 window.addEventListener('sos:supabase-session',()=>setTimeout(sync,0));window.addEventListener('storage',e=>{if(e.key===KEY)sync()});
 window.SOSMemberFontReliabilityV7035={sync};
})();
