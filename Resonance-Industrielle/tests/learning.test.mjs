import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createState,simulate,insertModule,addLane,configureRouter,upgrade,clone,step} from '../src/engine.ts';
import {startChallenge,challengeProgress,CHALLENGES} from '../src/challenges.ts';
import {serialize,deserialize} from '../src/save.ts';
import {diagnosis,insertionHint,observeChange,changePanel,lotDetails,supplyHint} from '../src/insights.ts';
import {setLanguage,t} from '../src/i18n.ts';
import {compareLayouts} from '../src/bench.ts';

// Fixtures use unlocked budgets to isolate the rules; these are not human playtests.
function factory({batch=80,recovery=true}={}){
 const s=createState();s.produced=2000;s.plants.A.stock.components=10000;const l=s.plants.A.lanes[0];
 for(const k of ['cadence','stamp','batch','weave',...(recovery?['recovery','exchanger']:[])])assert.ok(insertModule(s,'A',l.id,k));
 l.machines.find(m=>m.kind==='batch').param=batch;return s;
}

test('branche : rôle explicite et insertion avant le routeur ; le flux atteint le nouveau tisseur',()=>{
 const s=factory({batch:40,recovery:false}),l=s.plants.A.lanes[0];
 assert.ok(addLane(s,'A',undefined,'branch'));const destination=s.plants.A.lanes[1];assert.equal(destination.machines[0].connected,false);
 assert.ok(insertModule(s,'A',l.id,'router'));const router=l.machines.find(m=>m.kind==='router');
 configureRouter(s,'A',l.id,router.id,{target:destination.id});
 assert.ok(insertModule(s,'A',l.id,'weave'));const weavers=l.machines.filter(m=>m.kind==='weave');assert.ok(weavers.every(m=>l.machines.indexOf(m)<l.machines.indexOf(router)));
 simulate(s,90);assert.ok(weavers.at(-1).processed>0);assert.ok(router.routing.branch>0);assert.equal(destination.machines[0].processed,0);
 assert.match(insertionHint(l,'exchanger'),/destination/);
});

test('diagnostic : une destination absente est prioritaire sur une saturation en amont',()=>{
 const s=factory(),l=s.plants.A.lanes[0];insertModule(s,'A',l.id,'router');simulate(s,120);
 assert.equal(diagnosis(s,'A').kind,'router');assert.match(supplyHint(createState(),'A','oreLevel'),/Aucune pénurie/);
});

test('observation : anciennes files comptées, comparaison sans mutation et facteurs de pressage réels',()=>{
 const s=createState();simulate(s,45);const before=clone(s);insertModule(s,'A',s.plants.A.lanes[0].id,'cadence');
 const o=observeChange(before,'A','Configuration modifiée');assert.equal(o.waiting,26);simulate(s,60);
 const raw=serialize(s),panel=changePanel(s,o);assert.match(panel,/26/);assert.match(panel,/value="26"/,'old queue has cleared');assert.match(panel,/lots traités depuis l’ajout/);assert.equal(serialize(s),raw);
 const press=s.plants.A.lanes[0].machines.at(-1),last=press.lastPacket;
 assert.equal(last.result,last.qty/10*last.quality*last.bulk*last.catalysis);assert.ok(last.quality>1);assert.match(lotDetails(s,'A',press),/Résultat réel/);
 const restored=deserialize(raw);assert.deepEqual(restored.plants.A.lanes[0].machines.at(-1).lastPacket,last);
});

test('défi économie : faisable après des améliorations, plafond temporaire et niveaux conservés',()=>{
 const s=factory();upgrade(s,'A','energyLevel');simulate(s,180);const level=s.plants.A.energyLevel;
 assert.ok(startChallenge(s,'economy'));assert.equal(startChallenge(s,'network'),false);simulate(s,59);assert.ok(s.challenges.active);assert.equal(challengeProgress(s).seconds,59);
 simulate(s,1);assert.equal(s.challenges.active,null);assert.equal(s.challenges.result.success,true);assert.ok(s.challenges.completed.includes('economy'));assert.equal(s.plants.A.energyLevel,level);
 assert.ok(s.challenges.result.values[0]>=6000);assert.ok(s.challenges.result.values[1]>=500);
 const restored=deserialize(serialize(s));assert.deepEqual(restored.challenges,s.challenges);
});

test('défi réseau : livraisons partagées et production effective des deux presses',()=>{
 const s=factory({batch:40,recovery:false}),l=s.plants.A.lanes[0];addLane(s,'A',undefined,'branch');const b=s.plants.A.lanes[1];insertModule(s,'A',l.id,'router');const r=l.machines.find(m=>m.kind==='router');configureRouter(s,'A',l.id,r.id,{target:b.id,mode:'alternate'});simulate(s,180);
 assert.ok(startChallenge(s,'network'));simulate(s,60);assert.equal(s.challenges.result.success,true);assert.ok(s.challenges.result.values[0]>=5);assert.ok(s.challenges.result.values[1]>=5);assert.equal(s.challenges.result.values[2],2);
});

test('défi symbiose : production et retour réellement mesurés pendant la fenêtre',()=>{
 const s=factory();addLane(s,'B');insertModule(s,'B',s.plants.B.lanes[0].id,'cadence');simulate(s,180);
 assert.ok(startChallenge(s,'symbiosis'));const budget=s.plants.A.stock.components;simulate(s,60);
 assert.equal(s.challenges.result.success,true);assert.ok(s.plants.A.stock.components>budget);assert.deepEqual(s.claimed,[],'no automatic grant or claim');
});

test('défis : pause, interruption sur édition, échec sans badge, reprise de sauvegarde déterministe',()=>{
 const s=factory();simulate(s,120);startChallenge(s,'symbiosis');s.paused=true;simulate(s,30);assert.equal(challengeProgress(s).seconds,0);s.paused=false;
 const copy=deserialize(serialize(s));simulate(s,60);simulate(copy,60);assert.deepEqual(copy,s);assert.equal(s.challenges.result.success,false);assert.equal(s.challenges.completed.length,0);
 startChallenge(s,'economy');s.plants.A.lanes[0].machines[0].param=12;step(s);assert.equal(s.challenges.active,null);assert.equal(s.challenges.result.reason,'changed');
 const bad=clone(s);bad.challenges.active={id:'unknown'};assert.throws(()=>deserialize(JSON.stringify(bad)),/défi/);
 assert.ok(deserialize(serialize(createState())),'old saves without challenges remain valid');
});

test('nouveaux défis : textes accessibles en anglais',()=>{
 setLanguage('en');for(const c of CHALLENGES){assert.notEqual(t(c.name),c.name);assert.notEqual(t(c.description),c.description);}setLanguage('fr');
});

test('limite de sobriété : génération réellement plafonnée pendant 60 s, puis rétablie',()=>{
 const s=createState();s.produced=2000;s.plants.A.energyLevel=3;s.plants.A.lanes[0].machines[0].connected=false;
 const before=s.plants.A.stock.energy;startChallenge(s,'economy');simulate(s,60);assert.ok(Math.abs(s.plants.A.stock.energy-before-480)<1e-6);
 const after=s.plants.A.stock.energy;simulate(s,1);assert.ok(Math.abs(s.plants.A.stock.energy-after-64)<1e-6);assert.equal(s.plants.A.energyLevel,3);
});

test('banc et défi : alimentation habituelle identique, aucune validation ni mutation de la vraie partie',()=>{
 const s=factory();upgrade(s,'A','energyLevel');simulate(s,120);const normal=compareLayouts(s,s,'A',60);startChallenge(s,'economy');const raw=serialize(s);
 const during=compareLayouts(s,s,'A',60);assert.deepEqual(during,normal);assert.equal(serialize(s),raw);assert.equal(s.challenges.completed.length,0);
});

test('compact numbers and effect preferences are safe defaults', async()=>{
 const {formatCompact,setLanguage}=await import('../src/i18n.ts');const {readEffects,EFFECTS_KEY}=await import('../src/juice.ts');
 setLanguage('en');assert.equal(formatCompact(12345),'12.3 k');assert.equal(formatCompact(2.5e6),'2.5 M');assert.equal(formatCompact(3e12),'3 T');setLanguage('fr');
 const store=new Map();const storage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)};
 assert.deepEqual(readEffects(storage),{sound:false,volume:.5});store.set(EFFECTS_KEY,'{oops');assert.equal(readEffects(storage).sound,false);
 store.set(EFFECTS_KEY,JSON.stringify({sound:true,volume:9}));assert.deepEqual(readEffects(storage),{sound:true,volume:.5});
});
