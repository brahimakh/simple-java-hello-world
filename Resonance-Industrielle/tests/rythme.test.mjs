// 1.3 « Rythme » : tout arrive par la file des nouveautés, bien jouer avance la suivante, et aucun piège de débutant.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createState,simulate,machine,insertModule,configureRouter,updateIntro,introRemaining,introQueue,boostIntro,featureOpen,FEATURES,INTRO_MIN,INTRO_BOOST,introGap,setVariant,buyMastery,modSlots,discover} from '../src/engine.ts';
import {checkEureka,contractOffers,updatePrototypes,protoState} from '../src/progression.ts';
import {startJourney,JOURNEY} from '../src/journey.ts';
import {deliverSite,crossStrains} from '../src/world.ts';
import {serialize,deserialize} from '../src/save.ts';
const finished=(produced)=>{const s=createState();s.journey={step:JOURNEY.length,manual:5,flags:['finished'],doneTick:0,open:[]};s.produced=produced;s.plants.A.stock.components=1e15;return s;};
const drain=s=>{const keys=[];for(let i=0;i<20000&&introQueue(s).some(q=>s.produced>=q.at);i++){s.tick+=10;const k=updateIntro(s);if(k)keys.push([k,s.tick]);}return keys;};

test('les fonctions hors machines arrivent aussi une à une par la file (prototypes, moules, contrats, maîtrises…)',()=>{
 const s=finished(1e11);
 for(const k of Object.keys(FEATURES))assert.equal(featureOpen(s,k),false,k);
 assert.equal(contractOffers(s).length,0);updatePrototypes(s);assert.equal(protoState(s).offer,null);
 const m=machine(s,'press',0);assert.equal(setVariant(s,m,3),false);assert.equal(buyMastery(s,'cadence'),false);assert.equal(modSlots(s),0);
 const keys=drain(s);const names=keys.map(k=>k[0]);
 for(const k of Object.keys(FEATURES).filter(k=>FEATURES[k].at<=1e11))assert.ok(names.includes(k),k);
 for(let i=5;i<keys.length;i++)assert.ok(keys[i][1]-keys[i-1][1]>=INTRO_MIN);
 assert.ok(names.indexOf('plant-B')<names.indexOf('sync'),'la Serre arrive avant le synchroniseur qui consomme ses catalyseurs');
 assert.ok(featureOpen(s,'molds')&&setVariant(s,m,3));updatePrototypes(s);assert.ok(protoState(s).offer?.length);
 assert.doesNotThrow(()=>deserialize(serialize(s)));
});
test('une découverte ou un Eurêka avance la nouveauté suivante d’une minute, jamais à moins de 45 s de la précédente',()=>{
 const s=finished(1e5);s.intro={keys:['cadence','stamp','batch','weave'],last:0};s.tick=100;
 const before=introRemaining(s);assert.equal(before,introGap(s)-100);
 boostIntro(s);assert.equal(introRemaining(s),before-INTRO_BOOST);
 boostIntro(s);boostIntro(s);boostIntro(s);assert.equal(introRemaining(s),INTRO_MIN-100,'plancher entre deux nouveautés');
 discover(s,'accord');assert.ok(s.intro.bonus<=3*INTRO_BOOST);
 s.tick=INTRO_MIN;assert.ok(updateIntro(s));assert.equal(s.intro.bonus,0);
});
test('pas d’Eurêka pendant le guide : suivre les consignes n’est pas une trouvaille',()=>{
 const s=startJourney(createState());s.produced=50;s.lastChange={tick:0,rate:.1};s.tick=400;
 s.history=[{tick:0,total:0},{tick:400,total:4000}];checkEureka(s);assert.equal(s.eurekas?.length??0,0);assert.equal(s.lastChange,undefined);
});
test('les contrats proposés sont toujours réalisables avec ce qui est déjà introduit',()=>{
 const s=finished(1e9);s.intro={keys:['cadence','stamp','batch','weave','contracts'],last:0};
 const kinds=contractOffers(s).map(c=>c.kind);assert.ok(kinds.length>0);
 for(const k of ['catalyst','loops','harmony','bicolor','assembly','crystals','prism','plasma'])assert.ok(!kinds.includes(k),k);
});
test('un aiguillage sans ligne de destination laisse passer les lots au lieu de bloquer la ligne',()=>{
 const s=createState();s.produced=1e3;s.plants.A.stock.components=1e6;const l=s.plants.A.lanes[0];
 assert.ok(insertModule(s,'A',l.id,'router'));const r=l.machines.find(m=>m.kind==='router');assert.ok(configureRouter(s,'A',l.id,r.id,{mode:'alternate'}));
 simulate(s,30);const press=l.machines.find(m=>m.kind==='press');assert.ok(press.processed>=20,`presse ${press.processed}`);
 assert.ok(r.processed>0);
});
test('chantiers et Serre vivante attendent aussi leur tour',()=>{
 const s=finished(1e13);assert.equal(deliverSite(s,'pont'),false);assert.equal(crossStrains(s,1,2),null);
 s.intro={keys:Object.keys(FEATURES),last:0};assert.ok(featureOpen(s,'sites')&&featureOpen(s,'culture'));
});

// 1.3.1 : économie recalée, goulot nommé, insertion après une machine.
test('insertion juste après la machine choisie, sinon à la place habituelle',async()=>{
 const {insertModule,simulate}=await import('../src/engine.ts');
 const s=createState();s.produced=1e3;s.plants.A.stock.components=1e6;const l=s.plants.A.lanes[0];
 for(const k of ['stamp','batch','weave'])insertModule(s,'A',l.id,k);
 const stamp=l.machines.find(m=>m.kind==='stamp');assert.ok(insertModule(s,'A',l.id,'cadence',stamp.id));
 assert.deepEqual(l.machines.map(m=>m.kind),['intake','stamp','cadence','batch','weave','press']);
 const press=l.machines.find(m=>m.kind==='press');assert.ok(insertModule(s,'A',l.id,'charge',press.id));
 assert.equal(l.machines.at(-2).kind,'charge','après la presse : refusé, place habituelle avant la presse');
 assert.ok(insertModule(s,'A',l.id,'recovery',stamp.id));assert.equal(l.machines.at(-1).kind,'recovery','un module de résidus reste après la presse');
});
test('le goulot de chaque ligne est nommé avec le geste qui le lève',async()=>{
 const {laneLimit,simulate}=await import('../src/engine.ts');const {bottleneckNote}=await import('../src/insights.ts');
 const s=createState();s.produced=1e3;s.plants.A.stock.ore=1e5;s.plants.A.stock.energy=1e5;const l=s.plants.A.lanes[0];l.machines[0].param=12;simulate(s,20);
 assert.equal(laneLimit(s,l),'press','des lots de 12 toutes les 0,5 s saturent la presse (1 lot/s)');
 assert.match(bottleneckNote(s,'A',l),/1 lot par seconde/);assert.match(bottleneckNote(s,'A',l),/deuxième presse/);
 s.plants.A.stock.ore=0;s.plants.A.oreLevel=0;l.machines[0].param=12;simulate(s,0.5);s.plants.A.stock.ore=0;simulate(s,1);
 assert.equal(laneLimit(s,l),'matter');assert.match(bottleneckNote(s,'A',l),/extraction/);
});
test('économie : les extensions coûtent cher et les maîtrises font ×1,5 et arrivent tôt',async()=>{
 const {laneFee,upgradeCost,TUNING,addLane}=await import('../src/engine.ts');
 const s=createState();assert.equal(laneFee(s,'A'),TUNING.laneBase);s.plants.A.stock.components=2e6;s.produced=1e3;assert.ok(addLane(s,'A'));
 assert.equal(laneFee(s,'A'),TUNING.laneBase*TUNING.laneGrowth);assert.equal(upgradeCost(3),TUNING.upgradeBase*TUNING.upgradeGrowth**3);
 assert.equal(TUNING.masteryFactor,1.5);assert.equal(FEATURES.mastery.at,2e4);
});
