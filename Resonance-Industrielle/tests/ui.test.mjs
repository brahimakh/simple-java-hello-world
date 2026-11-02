import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {Window} from 'happy-dom';
import {createState,simulate,insertModule,encapsulate,saveConfiguration,addLane,configureRouter} from '../src/engine.ts';
import {t,EN,hasTranslation} from '../src/i18n.ts';
import {serialize,SAVE_KEY} from '../src/save.ts';
import {defaultPreferences,PREFERENCES_KEY} from '../src/onboarding.ts';
import {startChallenge} from '../src/challenges.ts';

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

function translatedScreen(ui,root='main') {
 ui.lang('fr');const french=[];const d=ui.document;const walker=d.createTreeWalker(d.querySelector(root),4);let node;
 while(node=walker.nextNode())if(!node.parentElement.closest('[data-user-text],script,style')&&/[a-zà-ÿ]{2}/i.test(node.textContent))french.push(node.textContent.trim());
 ui.lang('en');assert.deepEqual(french.filter(x=>t(x)===x&&EN[x]!==x&&!hasTranslation(x)),[],root+' contains untranslated copy');
}

test('interface apprentissage : réglage gratuit, observation, comparaison et choix du rôle de ligne',async()=>{
 const s=createState();simulate(s,45);s.paused=true;
 const ui=await mount({state:s});try{
   const {document:d,click}=ui;click('guide-intake');const select=d.querySelector('[data-param]');select.value='12';select.dispatchEvent(new ui.window.Event('change',{bubbles:true}));
   assert.match(d.querySelector('.change-panel').textContent,/Observer ma modification/);assert.match(d.querySelector('.change-panel').textContent,/45/);translatedScreen(ui);
   click('change-compare');assert.ok(d.querySelector('.bench-results'));assert.match(d.querySelector('.bench-intro').textContent,/old batches keep/);
   click('nav','[data-view="atelier"]');ui.lang('fr');click('add-lane');assert.match(d.querySelector('#dialog').textContent,/Alimentation propre/);translatedScreen(ui,'#dialog');click('close');click('add-lane');assert.match(d.querySelector('#dialog').textContent,/Own supply/);click('add-branch-line');click('save');
   const saved=JSON.parse(ui.window.localStorage.getItem(SAVE_KEY));assert.equal(saved.plants.A.lanes[1].machines[0].connected,false);assert.ok(d.querySelector('.change-panel'));
 }finally{await ui.close();}
});

test('interface explication : calcul réel, diagnostic de destination et défis bilingues',async()=>{
 const s=createState();s.produced=2000;s.plants.A.stock.components=10000;const l=s.plants.A.lanes[0];
 for(const k of ['cadence','stamp','batch','weave'])insertModule(s,'A',l.id,k);l.machines.find(m=>m.kind==='batch').param=80;simulate(s,120);s.paused=true;
 const ui=await mount({state:s});try{
   const {document:d,click}=ui;
   for(const kind of ['press','batch','stamp','weave']){click('select-module',`[data-id="${l.machines.find(m=>m.kind===kind).id}"]`);translatedScreen(ui);}
   assert.match(d.querySelector('.lot-study').textContent,/imprints/);
   ui.lang('fr');click('add-module','[data-kind="router"]');assert.match(d.querySelector('.diagnosis').textContent,/Choisir une ligne de destination/);click('save');const routerId=JSON.parse(ui.window.localStorage.getItem(SAVE_KEY)).plants.A.lanes[0].machines.find(m=>m.kind==='router').id;click('network-module',`[data-id="${routerId}"]`);translatedScreen(ui);
   click('nav','[data-view="experiments"]');assert.equal(d.querySelectorAll('.challenge-grid article').length,3);translatedScreen(ui);click('challenge-start','[data-id="economy"]');assert.match(d.querySelector('.challenge-grid').textContent,/Energy preserved/);translatedScreen(ui);click('challenge-stop');
 }finally{await ui.close();}
});

test('interface défi terminé : valeurs mesurées et résultat conservés dans les deux langues',async()=>{
 const s=createState();s.produced=2000;startChallenge(s,'network');simulate(s,60);s.paused=true;
 const ui=await mount({state:s});try{ui.click('nav','[data-view="experiments"]');assert.equal(ui.document.querySelectorAll('.challenge-result li').length,3);translatedScreen(ui);assert.match(ui.document.querySelector('.challenge-result').textContent,/Local batches/);}finally{await ui.close();}
});

test('interface défi actif : plafond et chronomètre restent explicites hors du carnet',async()=>{
 const s=createState();s.produced=2000;s.plants.A.energyLevel=2;startChallenge(s,'economy');s.paused=true;
 const ui=await mount({state:s});try{
   assert.match(ui.document.querySelector('.trial-notice').textContent,/8 énergie\/s/);assert.match(ui.document.querySelector('.resource-energy').textContent,/\+8\/s/);translatedScreen(ui);
   ui.click('nav','[data-view="overview"]');assert.match(ui.document.querySelector('.trial-notice').textContent,/Foundry generation limited/);translatedScreen(ui);
   ui.click('nav','[data-view="atelier"]');ui.click('select-module',`[data-id="${s.plants.A.lanes[0].machines[0].id}"]`);const el=ui.document.querySelector('[data-param]');el.value='12';el.dispatchEvent(new ui.window.Event('change',{bubbles:true}));assert.equal(ui.document.querySelector('.trial-notice'),null);
   ui.click('nav','[data-view="experiments"]');assert.match(ui.document.querySelector('.trial-warning').textContent,/Trial interrupted/);
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
   assert.match(d.querySelector('#onboarding').textContent,/Deliver an improved batch/);
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
   click('nav','[data-view="guide"]');click('detailed-rules');assert.match(d.querySelector('#dialog').textContent,/Announced limits: six lines/);click('close');
   click('reset');assert.match(d.querySelector('#dialog').textContent,/Start a new game/);click('confirm-reset');assert.equal(d.documentElement.lang,'en');assert.match(d.querySelector('#onboarding').textContent,/1. Where does material/);
 }finally{await ui.close();}
});
test('interface réseau : réglages réels de branche, schéma et progression visibles dans les deux langues',async()=>{
 const s=createState();s.produced=2000;s.plants.A.stock.components=10000;addLane(s,'A');const [a,b]=s.plants.A.lanes;insertModule(s,'A',a.id,'router');const router=a.machines.find(m=>m.kind==='router');configureRouter(s,'A',a.id,router.id,{target:b.id});s.paused=true;
 const prefs=defaultPreferences();prefs.language='en';prefs.guide.hidden=true;
 const ui=await mount({state:s,preferences:prefs});try{
   const {document:d,click,lang}=ui;assert.equal(d.querySelectorAll('.branch-link').length,1);assert.equal(d.querySelectorAll('.milestone-track .achieved').length,4);
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

test('interface mobile : tiroir de machine refermable, menu complet et retour sonore désactivé par défaut',async()=>{
 const ui=await mount();try{
   const {document:d,click}=ui;
   assert.match(d.querySelector('.sound-button').textContent,/Son coupé/);
   click('select-module',`[data-id="${d.querySelectorAll('.node')[1].dataset.id}"]`);assert.ok(d.querySelector('.inspector.has-machine'));click('deselect');assert.equal(d.querySelector('.inspector.has-machine'),null);
   click('menu');const menu=d.querySelector('#dialog .mobile-menu');assert.ok(menu);
   for(const action of ['save','export','import','help','reset','sound'])assert.ok(menu.querySelector(`[data-action="${action}"]`),action);
   assert.ok(menu.querySelector('[data-language]'));
   menu.querySelector('[data-action="save"]').click();assert.equal(d.querySelector('#dialog').open,false,'a menu action closes the menu');
   assert.ok(d.querySelector('[data-live="rate"]')&&d.querySelector('[data-live="stock"][data-resource="components"]'));
 }finally{await ui.close();}
});

test('interface puzzles : la partie est mise de côté, le puzzle se résout, puis la partie reprend intacte',async()=>{
 const s=createState();simulate(s,30);const ui=await mount({state:s});try{
   const {document:d,click}=ui;const before=JSON.parse(ui.window.localStorage.getItem(SAVE_KEY)).tick;
   click('nav','[data-view="experiments"]');assert.equal(d.querySelectorAll('.puzzle').length,6);click('puzzle-start','[data-id="p1"]');
   assert.match(d.querySelector('.puzzle-banner').textContent,/Premier accord/);assert.equal(d.querySelectorAll('[data-action="add-module"]:not([disabled])').length,1);
   click('add-module','[data-kind="cadence"]');click('save');assert.equal(JSON.parse(ui.window.localStorage.getItem(SAVE_KEY)).tick,before,'the real game is saved, not the puzzle');
   click('puzzle-exit');assert.equal(d.querySelector('.puzzle-banner'),null);click('nav','[data-view="atelier"]');assert.equal(d.querySelectorAll('.node').length,2);
   click('nav','[data-view="experiments"]');click('puzzle-start','[data-id="daily"]');click('daily-measure');assert.match(d.querySelector('#dialog').textContent,/composants\/s/);click('close');click('puzzle-exit');
 }finally{await ui.close();}
});
