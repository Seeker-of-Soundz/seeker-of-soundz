(()=>{'use strict';
const KEY='sos_typography_v709';
const FONTS={sphere:'"Sphere Fez","Arial Narrow","Rajdhani","Segoe UI",sans-serif',system:'Inter,"Segoe UI",Arial,sans-serif',condensed:'"Arial Narrow","Roboto Condensed","Segoe UI",sans-serif',classic:'Georgia,"Times New Roman",serif',mono:'"Courier New",monospace'};
function apply(s={}){const r=document.documentElement.style;r.setProperty('--sos-display-font',FONTS[s.display]||FONTS.sphere);r.setProperty('--sos-heading-font',FONTS[s.heading]||FONTS.sphere);r.setProperty('--sos-card-font',FONTS[s.card]||FONTS.sphere);r.setProperty('--sos-body-font',FONTS[s.body]||'inherit')}
function local(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return {}}}
apply(local());
async function load(){const c=window.SOS_SUPABASE?.client;if(!c)return;try{const {data,error}=await c.rpc('get_site_typography');if(error||!data)return;localStorage.setItem(KEY,JSON.stringify(data));apply(data)}catch{}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load,{once:true});else load();
window.SOSTypography={apply,fonts:FONTS,key:KEY};
})();
