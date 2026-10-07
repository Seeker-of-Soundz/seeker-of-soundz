(()=>{'use strict';
const KEY='sos_producer_resources_v3';
const client=window.SOS_SUPABASE?.client;if(!client)return;
const mapRow=r=>({id:r.id,name:r.name,vendor:r.vendor,type:r.resource_type||'Plugin',category:r.category||'Utility',ecosystem:r.ecosystem||'FL Studio / All DAWs',price:r.price_type||'Free',version:r.version||'',formats:r.formats||[],tags:r.tags||[],description:r.description||'',thumbnail:r.thumbnail_url||'',url:r.website_url||r.download_url||'',tutorial:r.tutorial_url||r.documentation_url||'',featured:!!r.featured,is_published:r.is_published!==false});
async function sync(){
 try{
  const q=await client.from('producer_resources').select('*').eq('is_published',true).order('featured',{ascending:false}).order('name',{ascending:true});
  if(q.error||!Array.isArray(q.data)||!q.data.length)return;
  let local=[];try{local=JSON.parse(localStorage.getItem(KEY)||'[]')}catch{}
  const remote=q.data.map(mapRow),fullLibrary=remote.length>=50;
  let merged;
  if(fullLibrary){merged=remote}else{const m=new Map((Array.isArray(local)?local:[]).map(x=>[String(x.id||x.name),x]));remote.forEach(x=>m.set(String(x.id||x.name),{...(m.get(String(x.id||x.name))||{}),...x}));merged=[...m.values()]}
  localStorage.setItem(KEY,JSON.stringify(merged));
  if(!sessionStorage.getItem('sos_producer_sync_reloaded')){sessionStorage.setItem('sos_producer_sync_reloaded','1');location.reload()}
 }catch(e){console.warn('Producer library sync skipped:',e)}
}
setTimeout(sync,350);
})();
