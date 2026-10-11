/* v7.0.72: horizontal drag-scroll on existing Producer Hub category bars.
   Buttons still click normally unless the mouse actually drags. */
(function(){'use strict';
 function attach(el){
  if(!el||el.dataset.sos72Drag==='1')return;
  el.dataset.sos72Drag='1';el.classList.add('sos72-drag-ready');
  var active=false,moved=false,startX=0,startScroll=0,lastX=0,blockClick=false;
  el.addEventListener('pointerdown',function(e){
   if(e.pointerType!=='mouse'||e.button!==0)return;
   active=true;moved=false;startX=e.clientX;lastX=e.clientX;startScroll=el.scrollLeft;
  });
  document.addEventListener('pointermove',function(e){
   if(!active)return;
   lastX=e.clientX;
   if(!moved&&Math.abs(lastX-startX)<6)return;
   moved=true;el.classList.add('sos72-dragging');
   el.scrollLeft=startScroll-(lastX-startX);
   e.preventDefault();
  },{passive:false});
  function end(){
   if(!active)return;
   active=false;el.classList.remove('sos72-dragging');
   if(moved){blockClick=true;setTimeout(function(){blockClick=false},100)}
  }
  document.addEventListener('pointerup',end);
  document.addEventListener('pointercancel',end);
  window.addEventListener('blur',end);
  el.addEventListener('click',function(e){
   if(blockClick){e.preventDefault();e.stopImmediatePropagation();blockClick=false}
  },true);
  el.addEventListener('dragstart',function(e){if(active)e.preventDefault()});
 }
 function init(){attach(document.getElementById('resourceCategoryStrip'));attach(document.querySelector('.pluginQuickFilters'))}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
