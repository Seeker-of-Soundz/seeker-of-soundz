/* Seeker Of SoundZ v7.0.33 — personal typography color + navigation motion. */
(()=>{'use strict';
const KEY='sos_member_style_v7033';
const FONTS_KEY='sos_member_font_v7026';
const defaults={textColor:'#f3eef7',headingColor:'#ffffff',navMotion:'signal',navSpeed:'normal'};
const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return {}}};
const write=v=>localStorage.setItem(KEY,JSON.stringify(v));
const session=()=>window.SOS?.getSession?.()||null;
const id=()=>session()?.id||'guest';
const current=()=>({...defaults,...(read()[id()]||{})});
function apply(v=current()){
 const h=document.documentElement;
 h.style.setProperty('--member-text-color',v.textColor||defaults.textColor);
 h.style.setProperty('--member-heading-color',v.headingColor||defaults.headingColor);
 h.dataset.memberNavMotion=v.navMotion||'signal'; h.dataset.memberNavSpeed=v.navSpeed||'normal';
}
function save(v){const all=read();all[id()]={...defaults,...v};write(all);apply(all[id()]);}
function addFonts(select){if(!select)return;const extra=[['grunge','Grunge / Distressed'],['stencil','Industrial Stencil'],['gothic','Dark Gothic'],['handwritten','Handwritten Artist'],['disco','Disco Groove'],['scifi','Sci-Fi Display'],['punk','Punk Poster'],['minimalist','Minimalist'],['typewriter','Vintage Typewriter']];extra.forEach(([v,t])=>{if(!select.querySelector(`option[value="${v}"]`)){const o=document.createElement('option');o.value=v;o.textContent=t;select.appendChild(o)}})}
function mount(){const box=document.querySelector('.memberAppearanceV7026');if(!box||box.querySelector('.memberStyleExtrasV7033'))return;
 const sel=box.querySelector('[data-member-font-select]');addFonts(sel);
 const s=current(), wrap=document.createElement('div');wrap.className='memberStyleExtrasV7033';
 wrap.innerHTML=`<div class="memberStyleTitleV7033"><p class="sectionEyebrow">Color & Navigation</p><h3>Make the interface yours</h3><p>These colors and navigation animations are personal to your signed-in profile and never change the site for other members.</p></div><div class="memberStyleGridV7033"><label><span>Regular text color</span><div class="memberColorRowV7033"><input type="color" value="${s.textColor}" data-member-text-color><input type="text" value="${s.textColor}" maxlength="7" data-member-text-hex></div></label><label><span>Heading / Sphere Fez color</span><div class="memberColorRowV7033"><input type="color" value="${s.headingColor}" data-member-heading-color><input type="text" value="${s.headingColor}" maxlength="7" data-member-heading-hex></div></label><label><span>Navigation animation</span><select data-member-nav-motion><option value="signal">Signal Underline</option><option value="glow">Soft Glow</option><option value="lift">Smooth Lift</option><option value="pulse">Frequency Pulse</option><option value="slide">Side Sweep</option><option value="bracket">Signal Brackets</option><option value="neon">Neon Trace</option><option value="minimal">Minimal Fade</option><option value="none">No Animation</option></select></label><label><span>Navigation speed</span><select data-member-nav-speed><option value="slow">Slow</option><option value="normal">Balanced</option><option value="fast">Fast</option></select></label></div><div class="memberColorPresetsV7033" aria-label="Color presets"><button type="button" data-color-preset="#ffffff,#ffffff">White</button><button type="button" data-color-preset="#d9c7ff,#ffffff">Violet</button><button type="button" data-color-preset="#8fdcff,#c9f3ff">Ice</button><button type="button" data-color-preset="#8dffc0,#d7ffe8">Emerald</button><button type="button" data-color-preset="#ff9ccf,#ffd7ea">Rose</button><button type="button" data-color-preset="#ffd37a,#fff0bf">Gold</button><button type="button" data-color-preset="#ff9a72,#ffd0bf">Sunset</button></div><div class="memberNavPreviewV7033"><span>HOME</span><span>MUSIC</span><span class="active">MEMBERS</span><span>FORUMS</span></div><div class="memberAppearanceActionsV7026"><button type="button" class="secondaryButton" data-member-style-save>Save Colors & Navigation</button><button type="button" class="smallAction" data-member-style-reset>Reset Style</button></div>`;
 box.appendChild(wrap);
 const text=wrap.querySelector('[data-member-text-color]'), textHex=wrap.querySelector('[data-member-text-hex]'), head=wrap.querySelector('[data-member-heading-color]'), headHex=wrap.querySelector('[data-member-heading-hex]'), motion=wrap.querySelector('[data-member-nav-motion]'), speed=wrap.querySelector('[data-member-nav-speed]');motion.value=s.navMotion;speed.value=s.navSpeed;
 const valid=x=>/^#[0-9a-f]{6}$/i.test(x);
 function preview(){const v={textColor:text.value,headingColor:head.value,navMotion:motion.value,navSpeed:speed.value};textHex.value=text.value;headHex.value=head.value;apply(v);wrap.querySelector('.memberNavPreviewV7033').dataset.motion=v.navMotion;wrap.querySelector('.memberNavPreviewV7033').dataset.speed=v.navSpeed}
 [text,head,motion,speed].forEach(el=>el.addEventListener('input',preview));
 textHex.addEventListener('change',()=>{if(valid(textHex.value)){text.value=textHex.value;preview()}});headHex.addEventListener('change',()=>{if(valid(headHex.value)){head.value=headHex.value;preview()}});
 wrap.querySelectorAll('[data-color-preset]').forEach(b=>b.onclick=()=>{const [a,c]=b.dataset.colorPreset.split(',');text.value=a;head.value=c;preview()});
 wrap.querySelector('[data-member-style-save]').onclick=()=>{save({textColor:text.value,headingColor:head.value,navMotion:motion.value,navSpeed:speed.value});window.SOS?.toast?.('Your colors and navigation animation were saved.',{title:'Profile appearance'})};
 wrap.querySelector('[data-member-style-reset]').onclick=()=>{text.value=defaults.textColor;head.value=defaults.headingColor;motion.value=defaults.navMotion;speed.value=defaults.navSpeed;save(defaults);preview();window.SOS?.toast?.('Personal colors and navigation restored to default.',{title:'Profile appearance'})};preview();
}
apply();document.addEventListener('DOMContentLoaded',()=>{apply();setTimeout(mount,250);setTimeout(mount,1000)},{once:true});window.addEventListener('sos:supabase-session',()=>{apply();setTimeout(mount,120)});document.addEventListener('click',e=>{if(e.target.closest('[data-profile-tab],#profileTab,[data-member-profile]'))setTimeout(mount,100)});window.SOSMemberStyleV7033={apply,mount};
})();
