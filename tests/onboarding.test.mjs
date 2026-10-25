import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createState,simulate,insertModule} from '../src/engine.ts';
import {defaultPreferences,readPreferences,writePreferences,guideStep,rememberGuideProgress,PREFERENCES_KEY} from '../src/onboarding.ts';
import {getLanguage,setLanguage,t,formatNumber} from '../src/i18n.ts';
import {MODULES,UNLOCKS} from '../src/content.ts';
import {EXPERIMENTS} from '../src/engine.ts';
test('guide : actions réelles, traitement effectif et lecture du débit avant validation',()=>{
 const s=createState(),p=defaultPreferences();assert.equal(guideStep(s,p),0);
 p.guide.intake=true;assert.equal(guideStep(s,p),1);p.guide.press=true;assert.equal(guideStep(s,p),2);
 simulate(s,18);assert.ok(insertModule(s,'A',s.plants.A.lanes[0].id,'cadence'));assert.equal(guideStep(s,p),3);
 p.guide.rate=true;assert.equal(guideStep(s,p),3);simulate(s,2);assert.equal(guideStep(s,p),4);
 p.guide.saved=true;assert.equal(guideStep(s,p),5);
 assert.ok(rememberGuideProgress(s,p));s.plants.A.lanes[0].machines=s.plants.A.lanes[0].machines.filter(m=>m.kind!=='cadence');assert.equal(guideStep(s,p),5);
});
test('préférences invalides ou stockage inaccessible : valeurs sûres, sans toucher à une partie',()=>{
 for(const text of ['{','null','[]','{"version":99,"language":"en"}','{"version":1,"language":"xx","guide":{"intake":"yes"}}'])assert.deepEqual(readPreferences({getItem:()=>text}),defaultPreferences());
 assert.deepEqual(readPreferences({getItem(){throw Error('denied');}}),defaultPreferences());
 assert.equal(writePreferences({setItem(){throw Error('quota');}},defaultPreferences()),false);
});
test('langue et guide mémorisés séparément, sans lecture ni écriture de sauvegarde',()=>{
 const entries=new Map([['resonance-industrielle-v1','ma partie']]);const storage={getItem:k=>entries.get(k)??null,setItem:(k,v)=>entries.set(k,v)};
 const p=defaultPreferences();p.language='en';p.guide.intake=true;p.guide.hidden=true;
 assert.ok(writePreferences(storage,p));assert.deepEqual(readPreferences(storage),p);assert.equal(entries.get('resonance-industrielle-v1'),'ma partie');assert.ok(entries.has(PREFERENCES_KEY));
});
test('anglais : règles, expériences et déblocages couverts ; interpolations et décimales',()=>{
 setLanguage('en');for(const m of Object.values(MODULES)){assert.notEqual(t(m.name),m.name);assert.notEqual(t(m.description),m.description);}
 // The manually translated rules must retain every numeric parameter from the source rules.
 const numbers=text=>(text.match(/\d+(?:[.,]\d+)?/g)??[]).map(x=>Number(x.replace(',','.')));
 for(const m of Object.values(MODULES))assert.deepEqual(numbers(t(m.description)),numbers(m.description),m.name+' numeric rules differ between languages');
 for(const e of EXPERIMENTS){assert.notEqual(t(e.name),e.name);assert.notEqual(t(e.description),e.description);}
 for(const u of UNLOCKS)assert.notEqual(t(u.text),u.text);
 assert.equal(t('Accumulation · 12/80'),'Accumulating · 12/80');assert.equal(t('  Retirer · rendre 30 composants '),'  Remove · refund 30 components ');
 assert.equal(t('Déconnecter la sortie de Presse'),'Disconnect output of Press');assert.equal(formatNumber(12.5),'12.5');
 assert.equal(t('Invention « Presse » enregistrée. Les cycles en cours sont conservés.'),'Invention “Presse” saved. Current cycles are preserved.');
 setLanguage('fr');assert.equal(getLanguage(),'fr');assert.equal(t('Presse'),'Presse');assert.equal(formatNumber(12.5),'12,5');
});
