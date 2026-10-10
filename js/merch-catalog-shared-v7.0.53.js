/* Shared catalog bootstrap: one-time migration of the four previously hardcoded storefront products. */
(()=>{'use strict';
if(!window.SOS?.K?.catalog||typeof SOS.read!=='function')return;

const marker='sos_catalog_defaults_imported_v7_0_53';
const defaults=[
{id:'signature-tee',name:'Signature Frequency Tee',price:29,type:'Apparel',category:'T-Shirts',description:'Official Seeker Of Soundz signature tee.',image:'',link:'',sizes:['S','M','L','XL','2XL'],colors:['Black','White','Charcoal'],stock:24},
{id:'midnight-hoodie',name:'Midnight Seeker Hoodie',price:59,type:'Apparel',category:'Hoodies',description:'A heavyweight hoodie for late-night sessions.',image:'',link:'',sizes:['S','M','L','XL','2XL','3XL'],colors:['Black','Charcoal','White'],stock:18},
{id:'sos-cap',name:'SOS Logo Cap',price:24,type:'Accessory',category:'Headwear',description:'Minimal logo cap built for everyday wear.',image:'',link:'',sizes:['One Size'],colors:['Black','White'],stock:14},
{id:'creator-assets',name:'DJ & Production Assets',price:35,type:'Digital',category:'Creator Assets',description:'Useful tools for DJs and producers.',image:'',link:'',sizes:[],colors:[],stock:999}
];
try{
 if(localStorage.getItem(marker)&&SOS.read(SOS.K.catalog,[]).length)return;
 const current=SOS.read(SOS.K.catalog,[]);const ids=new Set(current.map(x=>String(x.id)));
 const missing=defaults.filter(x=>!ids.has(x.id));
 if(missing.length)SOS.write(SOS.K.catalog,[...current,...missing]);
 localStorage.setItem(marker,'1');
}catch(e){console.warn('Store catalog migration could not be completed:',e)}
})();
