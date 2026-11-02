// Development tool: opens every screen in a simulated DOM and lists French text without an English translation.
// Usage: node scripts/i18n-audit.mjs
import {readFile} from 'node:fs/promises';
import {Window} from 'happy-dom';
import {createState,simulate,machine,addLane} from '../src/engine.ts';
import {t,EN,hasTranslation} from '../src/i18n.ts';
import {serialize,SAVE_KEY} from '../src/save.ts';
import {progressOf} from '../src/progression.ts';
const kinds=['intake','split','cadence','stamp','batch','weave','filter','mirror','furnace','compress','harmonic','sensor','charge','sync','router','press','recovery','exchanger'];
function rich(){const s=createState();s.produced=2e12;s.plants.A.stock.components=1e15;for(const p of Object.values(s.plants)){p.stock.ore=1e6;p.stock.energy=1e9;p.stock.catalyst=100;}
 s.plants.A.lanes[0].machines=['intake','split','cadence','stamp','batch','weave','filter','mirror','furnace','press','recovery','exchanger'].map(k=>machine(s,k));addLane(s,'A');s.plants.A.lanes[1].machines.splice(1,0,...['compress','harmonic','sensor','charge','sync','router','assembler','metronome','echo'].map(k=>machine(s,k)));
 addLane(s,'B');addLane(s,'C');progressOf(s).points=3;s.discoveries=[{id:'accord',tick:1}];s.protos={owned:['big-lot'],offer:['synergy','pipelines','max-batch']};simulate(s,30);s.library.push({name:'Plan',machines:[{kind:'intake',param:6,connected:true},{kind:'press',param:0,connected:true}]});return s;}
const missing=new Set();
async function screen(state,visit){
 const window=new Window({url:'http://127.0.0.1:4317',settings:{disableCSSFileLoading:true,disableJavaScriptFileLoading:true}});
 window.document.write(await readFile(new URL('../src/index.html',import.meta.url),'utf8'));
 window.localStorage.setItem(SAVE_KEY,serialize(state));
 for(const key of ['window','document','localStorage','HTMLElement','HTMLInputElement','HTMLFormElement','HTMLDialogElement','FormData'])Object.defineProperty(globalThis,key,{value:window[key],configurable:true,writable:true});
 for(const key of ['setInterval','setTimeout'])Object.defineProperty(globalThis,key,{value:()=>0,configurable:true,writable:true});
 window.HTMLDialogElement.prototype.showModal=function(){this.open=true;};window.HTMLDialogElement.prototype.close=function(){this.open=false;};
 await import('../src/app.ts?audit='+Math.random());
 const d=window.document;const lang=v=>{const sel=d.querySelector('[data-language]');sel.value=v;sel.dispatchEvent(new window.Event('change',{bubbles:true}));};
 const collect=(root)=>{lang('fr');d.querySelector(root).normalize();const out=[];const w=d.createTreeWalker(d.querySelector(root),4);let n;while(n=w.nextNode())if(!n.parentElement.closest('[data-user-text],script,style')&&/[a-zà-ÿ]{2}/i.test(n.textContent))out.push(n.textContent.trim());
  for(const el of d.querySelector(root).querySelectorAll('[aria-label],[title],[placeholder]'))for(const a of ['aria-label','title','placeholder'])if(el.getAttribute(a))out.push(el.getAttribute(a).trim());
  lang('en');for(const x of out)if(t(x)===x&&EN[x]!==x&&!hasTranslation(x)&&!/^[\d\s.,×/%+−-]+$/.test(x))missing.add(x);};
 const click=(sel)=>{const b=d.querySelector(sel);if(b&&!b.disabled)b.click();};
 await visit({d,click,collect});await window.happyDOM.abort();
}
const s=rich();
await screen(s,async({d,click,collect})=>{
 click('[data-action="guide-dismiss"]');collect('#app');
 for(const id of [...d.querySelectorAll('.node[data-id]')].map(n=>n.dataset.id)){click(`.node[data-id="${id}"]`);collect('#app');}
 click('[data-action="select-lane"]:nth-of-type(2)');for(const id of [...d.querySelectorAll('.node[data-id]')].map(n=>n.dataset.id)){click(`.node[data-id="${id}"]`);collect('#app');}
 for(const v of ['overview','library','experiments','notebook','bench','guide']){click(`[data-view="${v}"]`);collect('#app');}
 for(const p of ['B','C']){click(`[data-view="atelier"]`);click(`.plant-nav [data-plant="${p}"]`);collect('#app');}
 const dialogs=[['[data-view="atelier"]','[data-action="estimate"]'],['[data-view="library"]','[data-action="share-blueprint"]'],['[data-view="library"]','[data-action="import-code"]'],['[data-view="experiments"]','[data-action="refound"]'],['[data-view="atelier"]','[data-action="reset"]'],['[data-view="atelier"]','[data-action="menu"]'],['[data-view="atelier"]','[data-resource="plasma"]'],['[data-view="atelier"]','[data-action="rate"]'],['[data-view="atelier"]','[data-action="add-lane"]']];
 for(const [nav,btn] of dialogs){click('#dialog [data-action="close"]');click(nav);click(btn);if(d.querySelector('#dialog').open)collect('#dialog');click('#dialog [data-action="close"]');}
 click('#dialog [data-action="close"]');click('[data-view="experiments"]');click('[data-action="puzzle-start"][data-id="p1"]');collect('#app');click('[data-action="puzzle-exit"]');
 click('[data-view="experiments"]');click('[data-action="puzzle-start"][data-id="daily"]');collect('#app');click('[data-action="daily-measure"]');if(d.querySelector('#dialog').open)collect('#dialog');
});
console.log([...missing].map(x=>JSON.stringify(x)).join('\n')||'Aucun texte manquant.');
