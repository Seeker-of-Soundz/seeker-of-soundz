/* Seeker Of SoundZ v7.0.13 — render queue cleanup */
(()=>{
'use strict';
const host=document.getElementById('renderQueueListV4190');
const clear=document.getElementById('clearRenderQueueV4190');
if(!host)return;
const STORAGE='sos_producer_render_queue_v4190';
let rows=[];
try{rows=JSON.parse(localStorage.getItem(STORAGE)||'[]')}catch{}
if(!Array.isArray(rows))rows=[];
/* Old interrupted browser sessions should not permanently fill the queue. */
const cutoff=Date.now()-(6*60*60*1000);
rows=rows.filter(row=>{
 const state=String(row?.status||'').toLowerCase();
 const when=Date.parse(row?.completedAt||row?.createdAt||0)||0;
 if(['complete','completed','finished','failed','cancelled','canceled','done'].includes(state))return false;
 if(when&&when<cutoff&&['queued','processing','rendering'].includes(state))return false;
 return true;
}).slice(0,12);
let activeRenderId='';
let activeBeatId='';
const esc=(value='')=>String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
function persist(){localStorage.setItem(STORAGE,JSON.stringify(rows.slice(0,12)))}
function render(){
 const shell=document.querySelector('.renderQueueV4190');
 const empty=!rows.length;
 shell?.classList.toggle('isEmptyV701',empty);
 host.hidden=empty;
 if(clear){clear.hidden=empty;clear.textContent='Clear Queue';clear.title='Remove every task from this local render queue';}
 host.innerHTML=empty?'':rows.map(row=>`<article class="renderQueueItemV4190 ${esc(row.status)}"><i>${row.type==='download'?'↓':row.type==='analysis'?'◆':'⬢'}</i><div><strong>${esc(row.title)}</strong><small>${esc(row.statusText||row.status)}</small><div class="renderQueueProgressV4190"><span style="width:${Math.max(0,Math.min(100,row.progress||0))}%"></span></div></div><b>${Math.round(row.progress||0)}%</b></article>`).join('');
}
function save(){persist();render()}
function add(detail={}){
 const row={id:crypto.randomUUID?.()||String(Date.now()+Math.random()),title:detail.title||'Producer Hub Task',type:detail.type||'render',status:'queued',progress:0,createdAt:new Date().toISOString()};
 rows.unshift(row);rows=rows.slice(0,12);save();return row.id;
}
function update(id,patch){const row=rows.find(item=>item.id===id);if(row){Object.assign(row,patch);save()}}
window.addEventListener('sos:render-queue-add',event=>{activeRenderId=add(event.detail)});
window.addEventListener('sos:render-started',event=>{
 if(!activeRenderId)activeRenderId=add({type:'render',title:event.detail?.title});
 update(activeRenderId,{status:'rendering',statusText:'Rendering video and audio',progress:8});
 let value=8;const id=activeRenderId;
 const timer=setInterval(()=>{const row=rows.find(item=>item.id===id);if(!row||row.status!=='rendering'){clearInterval(timer);return}value=Math.min(92,value+Math.max(1,(95-value)*.045));update(id,{progress:value})},900);
});
window.addEventListener('sos:render-complete',event=>{
 if(!activeRenderId)activeRenderId=add({type:'render',title:event.detail?.title});
 update(activeRenderId,{status:'complete',statusText:`Finished ${event.detail?.format||'video'}`,progress:100,completedAt:new Date().toISOString()});activeRenderId='';
});
window.addEventListener('sos:provider-download-ready',event=>{const id=add({type:'download',title:event.detail?.title||'Provider import'});update(id,{status:'complete',statusText:'Download ready for import',progress:100,downloadUrl:event.detail?.downloadUrl})});
window.addEventListener('sos:beat-analysis-start',()=>{
 const existing=rows.find(r=>r.type==='analysis'&&['queued','processing'].includes(String(r.status).toLowerCase()));
 activeBeatId=existing?.id||add({type:'analysis',title:'Beat analysis'});
 update(activeBeatId,{status:'processing',statusText:'Detecting beats and drops',progress:35});window.__SOS_BEAT_QUEUE_ID=activeBeatId;
});
window.addEventListener('sos:beat-analysis-complete',event=>{const id=activeBeatId||window.__SOS_BEAT_QUEUE_ID;if(id)update(id,{status:'complete',statusText:`${event.detail?.count||0} markers generated`,progress:100,completedAt:new Date().toISOString()});activeBeatId=''});
clear?.addEventListener('click',()=>{rows=[];activeRenderId='';activeBeatId='';persist();render()});
persist();render();
})();
