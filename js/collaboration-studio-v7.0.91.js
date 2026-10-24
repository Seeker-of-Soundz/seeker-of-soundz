/* v7.0.91 UI enhancement: wraps existing live controls, never clones or replaces IDs. */
(()=>{'use strict';
const q=(s,p=document)=>p.querySelector(s);
function fold(node,title,open=false){if(!node||node.closest('details.sosStudioFold'))return;const parent=node.parentElement;if(!parent)return;const d=document.createElement('details');d.className='sosStudioFold';d.open=open;const h=document.createElement('summary');h.textContent=title;d.append(h);parent.insertBefore(d,node);d.append(node);return d}
function init(){const app=q('#collabApp'),left=q('.collabSidebar'),right=q('.collabInspector');if(!app||!left||!right)return;
  // Old v7.0.90 folds remain functional; remove only the redundant service advertisement.
  q('.backendNotice',left)?.remove();
  const oldNotice=Array.from(left.querySelectorAll('details.sosCollabFold')).find(e=>/Workspace Information/i.test(e.querySelector('summary')?.textContent||''));if(oldNotice)oldNotice.remove();
  const labels=[['#collabMemberManager','Project Access',false],['#collabAccessRoster','Studio Directory',false],['#collabProgressPanel','Production Progress',true],['.collabProjectActions','Project Actions',false]];
  for(const [sel,label,open] of labels){const node=q(sel,right);if(node)fold(node,label,open)}
  // Existing inspector group folds were added by v7.0.90; default to a compact inspector.
  for(const d of right.querySelectorAll('details.sosCollabFold')){
    if(!d.dataset.sos91){d.dataset.sos91='1';d.open=/Production Tracker/i.test(d.querySelector('summary')?.textContent||'')}
  }
  // Ensure live project selection and note/history updates retain original DOM nodes and listeners.
  app.classList.add('sosCollabStudio91');
}
function boot(){init();const right=q('.collabInspector');if(!right)return;let queued=false;const observer=new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;init()})});observer.observe(right,{childList:true,subtree:false});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
