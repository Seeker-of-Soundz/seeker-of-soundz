/* UI-only progressive enhancement: retain all original element IDs, listeners, and Supabase logic. */
(()=>{'use strict';
function wrap(nodes,title,open=true){const first=nodes.find(Boolean);if(!first||!first.parentElement)return;const parent=first.parentElement;const box=document.createElement('details');box.className='sosCollabFold';box.open=open;const summary=document.createElement('summary');summary.textContent=title;box.append(summary);parent.insertBefore(box,first);nodes.filter(Boolean).forEach(n=>box.appendChild(n));return box;}
function init(){const left=document.querySelector('.collabSidebar'),right=document.querySelector('.collabInspector');if(!left||!right||left.dataset.sosFolds)return;left.dataset.sosFolds='1';
const leftChildren=Array.from(left.children);const contact=left.querySelector('#contactList, .contactList');const projects=left.querySelector('#projectList, .projectList');const head=left.querySelector('.adminSectionHead');
if(contact)wrap([head,contact],'Artists & Direct Messages',true);
const projectHeading=Array.from(left.children).find(e=>e.tagName==='H3'&&/project/i.test(e.textContent));
if(projects)wrap([projectHeading,projects],'Projects',true);
const notice=left.querySelector('.backendNotice');if(notice)wrap([notice],'Workspace Information',false);
const groups=Array.from(right.children);if(groups[0]){
const first=groups[0];const eyebrow=first.querySelector('.sectionEyebrow');const title=first.querySelector('#projectTitle');const status=first.querySelector('#statusGrid');const notes=first.querySelector('#projectNotes');const notesLabel=notes?.closest('label');const save=first.querySelector('#saveNotes');const history=first.querySelector('.collaborationNoteHistoryV417');
if(status)wrap([eyebrow,title,status],'Production Tracker',true);
if(notesLabel)wrap([notesLabel,save],'Shared Project Notes',false);
if(history)wrap([history],'Versioned Note History',false);
}
if(groups[1]){const second=groups[1];const members=second.querySelector('#projectMembers');const files=second.querySelector('#projectFiles');const headings=Array.from(second.querySelectorAll('h3'));if(members)wrap([headings[0],members],'Collaborators',true);if(files)wrap([headings[1],files],'Audio Version History',false);}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
