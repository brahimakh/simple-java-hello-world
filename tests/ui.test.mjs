import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {Window} from 'happy-dom';
import {createState,simulate,insertModule,encapsulate,saveConfiguration,addLane,configureRouter} from '../src/engine.ts';
import {t,EN} from '../src/i18n.ts';
import {serialize,SAVE_KEY} from '../src/save.ts';
import {defaultPreferences,PREFERENCES_KEY} from '../src/onboarding.ts';

// DOM integration, not a visual browser test. Timers are deliberately disabled.
async function mount({state,preferences}={}) {
 const window=new Window({url:'http://127.0.0.1:4317',settings:{disableCSSFileLoading:true,disableJavaScriptFileLoading:true}});
 window.document.write(await readFile(new URL('../src/index.html',import.meta.url),'utf8'));
 if(state)window.localStorage.setItem(SAVE_KEY,serialize(state));if(preferences)window.localStorage.setItem(PREFERENCES_KEY,JSON.stringify(preferences));
 const saved=new Map();for(const key of ['window','document','localStorage','HTMLElement','HTMLInputElement','HTMLFormElement','HTMLDialogElement','FormData','setInterval','setTimeout']){saved.set(key,Object.getOwnPropertyDescriptor(globalThis,key));Object.defineProperty(globalThis,key,{value:key==='setInterval'||key==='setTimeout'?()=>0:window[key],configurable:true,writable:true});}
 // Happy DOM implements dialog.open but does not implement native modal display.
 window.HTMLDialogElement.prototype.showModal=function(){this.open=true;};window.HTMLDialogElement.prototype.close=function(){this.open=false;};
 await import('../src/app.ts?test='+Math.random());
 const click=(action,extra='')=>{const b=window.document.querySelector(`[data-action="${action}"]${extra}`);assert.ok(b,action+extra);assert.equal(b.disabled,false,action+' should be enabled');b.click();};
 const lang=value=>{const select=window.document.querySelector('[data-language]');select.value=value;select.dispatchEvent(new window.Event('change',{bubbles:true}));};
 return {window,document:window.document,click,lang,close:async()=>{for(const [k,descriptor] of saved){if(descriptor)Object.defineProperty(globalThis,k,descriptor);else delete globalThis[k];}await window.happyDOM.abort();}};
}
test('interface : premiers pas, sélection réelle, aide globale, langue réversible et préférences persistées',async()=>{
 const ui=await mount();try{
   const {document:d,click,lang}=ui;assert.match(d.querySelector('#onboarding').textContent,/1. D’où vient/);
   click('guide-intake');assert.match(d.querySelector('.inspector').textContent,/Toutes les 0,5 s/);assert.match(d.querySelector('#onboarding').textContent,/2. Comment/);
   click('guide-press');assert.match(d.querySelector('.inspector').textContent,/1 lot\/s/);assert.match(d.querySelector('#onboarding').textContent,/3. Changer/);
   click('rate');click('close');assert.equal(JSON.parse(ui.window.localStorage.getItem(PREFERENCES_KEY)).guide.rate,false,'reading the baseline before adding a module must not skip the observation step');
   lang('en');assert.equal(d.documentElement.lang,'en');assert.match(d.querySelector('#onboarding').textContent,/3. Change a rule/);assert.match(d.querySelector('.inspector').textContent,/Foundry: material/);assert.match(d.querySelector('.topbar').textContent,/Foundry/);assert.equal(d.querySelector('.node-io').textContent,'material stock → batch');
   click('module-info','[data-kind="cadence"]');assert.match(d.querySelector('#dialog').textContent,/On each delivery of ≤ 12 material/);click('close');
   click('guide-dismiss');assert.equal(d.querySelector('#onboarding'),null);assert.match(d.querySelector('.guide-collapsed').textContent,/Resume the guide/);
   click('nav','[data-view="guide"]');assert.match(d.querySelector('.guide-page').textContent,/What am I supposed to do/);assert.match(d.querySelector('.guide-definitions').textContent,/Lifetime production/);
   click('guide-restart');assert.match(d.querySelector('#onboarding').textContent,/1. Where does/);
   lang('fr');assert.match(d.querySelector('#onboarding').textContent,/1. D’où vient/);assert.match(d.querySelector('.language-picker').textContent,/Langue/);
   assert.equal(JSON.parse(ui.window.localStorage.getItem(PREFERENCES_KEY)).language,'fr');
 }finally{await ui.close();}
});
test('interface : une partie existante reste identique au changement de langue ; guide achevable par sauvegarde',async()=>{
 const s=createState();simulate(s,18);insertModule(s,'A',s.plants.A.lanes[0].id,'cadence');simulate(s,3);s.paused=true;
 const prefs=defaultPreferences();prefs.language='en';prefs.guide.intake=prefs.guide.press=prefs.guide.rate=true;
 const ui=await mount({state:s,preferences:prefs});try{
   const {document:d,click,lang}=ui;const raw=ui.window.localStorage.getItem(SAVE_KEY);
   assert.match(d.querySelector('#onboarding').textContent,/5. Keep an idea/);
   lang('fr');lang('en');assert.equal(ui.window.localStorage.getItem(SAVE_KEY),raw);
   click('save-config');const input=d.querySelector('#name-form input');input.value='Presse & <my plan>';d.querySelector('#name-form').dispatchEvent(new ui.window.Event('submit',{bubbles:true,cancelable:true}));
   assert.match(d.querySelector('#onboarding').textContent,/The workshop is yours/);
   click('nav','[data-view="library"]');assert.equal(d.querySelector('.config-row [data-user-text]').textContent,'Presse & <my plan>');
   assert.ok(JSON.parse(ui.window.localStorage.getItem(SAVE_KEY)).configurations.some(x=>x.name==='Presse & <my plan>'));
   lang('fr');assert.equal(d.querySelector('.config-row [data-user-text]').textContent,'Presse & <my plan>');
 }finally{await ui.close();}
});
test('interface anglais : parcours avancé, noms personnels préservés et dialogues traduits',async()=>{
 const s=createState();simulate(s,20);s.produced=2000;s.plants.A.stock.components=10000;insertModule(s,'A',s.plants.A.lanes[0].id,'charge');insertModule(s,'A',s.plants.A.lanes[0].id,'recovery');encapsulate(s,'A',s.plants.A.lanes[0].id,'Presse');saveConfiguration(s,'A','Matière');addLane(s,'B');s.paused=true;
 const prefs=defaultPreferences();prefs.language='en';prefs.guide.hidden=true;
 const ui=await mount({state:s,preferences:prefs});try{
   const {document:d,click}=ui;
   click('nav','[data-view="library"]');assert.ok([...d.querySelectorAll('[data-user-text]')].some(x=>x.textContent==='Presse'));
   for(const view of ['experiments','overview','guide','atelier']){
     ui.lang('fr');click('nav',`[data-view="${view}"]`);
     const french=[];const walker=d.createTreeWalker(d.querySelector('main'),4);let node;
     while(node=walker.nextNode())if(!node.parentElement.closest('[data-user-text],script,style')&&/[a-zà-ÿ]{2}/i.test(node.textContent))french.push(node.textContent.trim());
     ui.lang('en');
     const uncovered=french.filter(x=>t(x)===x&&EN[x]!==x&&!/^\d+(?: \/ 10)? machines$/.test(x));
     assert.deepEqual(uncovered,[],view+' has untranslated visible text');
   }
   click('resource','[data-resource="energy"]');assert.match(d.querySelector('#dialog').textContent,/Base generation/);click('close');
   click('rate');assert.match(d.querySelector('#dialog').textContent,/Average rate and peak production/);click('close');
   click('plant','[data-plant="B"]');assert.match(d.querySelector('.topbar').textContent,/Catalytic greenhouse/);
   click('nav','[data-view="guide"]');click('detailed-rules');assert.match(d.querySelector('#dialog').textContent,/Prototype limits: six lines/);click('close');
   click('reset');assert.match(d.querySelector('#dialog').textContent,/Start a new game/);click('confirm-reset');assert.equal(d.documentElement.lang,'en');assert.match(d.querySelector('#onboarding').textContent,/1. Where does material/);
 }finally{await ui.close();}
});
test('interface réseau : réglages réels de branche, schéma et progression visibles dans les deux langues',async()=>{
 const s=createState();s.produced=2000;s.plants.A.stock.components=10000;addLane(s,'A');const [a,b]=s.plants.A.lanes;insertModule(s,'A',a.id,'router');const router=a.machines.find(m=>m.kind==='router');configureRouter(s,'A',a.id,router.id,{target:b.id});s.paused=true;
 const prefs=defaultPreferences();prefs.language='en';prefs.guide.hidden=true;
 const ui=await mount({state:s,preferences:prefs});try{
   const {document:d,click,lang}=ui;assert.equal(d.querySelectorAll('.branch-link').length,1);assert.equal(d.querySelectorAll('.milestone-track .achieved').length,7);
   click('select-module',`[data-id="${router.id}"]`);assert.match(d.querySelector('.routing-settings').textContent,/Destination line/);
   const mode=d.querySelector('[data-route="mode"]');mode.value='alternate';mode.dispatchEvent(new ui.window.Event('change',{bubbles:true}));click('router-source');click('save');
   const saved=JSON.parse(ui.window.localStorage.getItem(SAVE_KEY));assert.equal(saved.plants.A.lanes[0].machines.find(m=>m.kind==='router').routing.mode,'alternate');assert.equal(saved.plants.A.lanes[1].machines[0].connected,false);
   lang('fr');assert.match(d.querySelector('.routing-settings').textContent,/Un lot sur deux/);assert.match(d.querySelector('.network-caption').textContent,/SCHÉMA VIVANT/);
 }finally{await ui.close();}
});
test('interface banc : capture, modification d’ordre, vraie comparaison, bilinguisme et partie intacte',async()=>{
 const s=createState();s.produced=2000;s.plants.A.stock.components=10000;const l=s.plants.A.lanes[0];for(const k of ['stamp','batch','weave'])insertModule(s,'A',l.id,k);l.machines.find(m=>m.kind==='batch').param=80;s.paused=true;
 const prefs=defaultPreferences();prefs.language='en';prefs.guide.hidden=true;
 const ui=await mount({state:s,preferences:prefs});try{
   const {document:d,click,lang}=ui;click('nav','[data-view="bench"]');click('bench-record');click('nav','[data-view="atelier"]');click('select-module',`[data-id="${l.machines[1].id}"]`);click('move','[data-dir="1"]');click('save');const before=ui.window.localStorage.getItem(SAVE_KEY);
   click('nav','[data-view="bench"]');click('bench-run');assert.equal(d.querySelector('.trial-gain strong').textContent,'×0.25');assert.equal(d.querySelectorAll('.bench-table tbody tr').length,9);assert.equal(ui.window.localStorage.getItem(SAVE_KEY),before);assert.match(d.querySelector('.bench-results').textContent,/Tested configuration/);
   lang('fr');assert.equal(d.querySelector('.trial-gain strong').textContent,'×0,25');assert.match(d.querySelector('.bench-results').textContent,/Configuration testée/);
   const french=[];const walker=d.createTreeWalker(d.querySelector('main'),4);let node;while(node=walker.nextNode())if(!node.parentElement.closest('[data-user-text],script,style')&&/[a-zà-ÿ]{2}/i.test(node.textContent))french.push(node.textContent.trim());lang('en');assert.deepEqual(french.filter(x=>t(x)===x&&EN[x]!==x),[]);
 }finally{await ui.close();}
});
