import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createState,simulate,machine,insertModule,synergyFactor,synergyKeys,measuredRate,TUNING,setVariant,step} from '../src/engine.ts';
import {pistes,chooseSpecialty,checkEureka,SPECIALTIES} from '../src/progression.ts';
import {startJourney,openStages,STAGES,STAGE_GAP,reveal,JOURNEY} from '../src/journey.ts';
import {serialize,deserialize} from '../src/save.ts';
const packet=(qty=6,quality=1)=>({qty,quality,kind:'matter',recovered:false,exchanged:false,energy:0,origin:'A'});
const setup=kinds=>{const s=createState();s.produced=2e5;s.plants.A.stock.components=1e9;s.plants.A.stock.ore=1e5;s.plants.A.stock.energy=1e6;s.plants.A.lanes=[{id:s.nextId++,name:'T',capsule:false,machines:kinds.map(k=>machine(s,k))}];return s;};
test('synergie : chaque interaction distincte active sur la ligne multiplie ses presses, dans une limite annoncée',()=>{
 const s=setup(['intake','cadence','stamp','batch','weave','press']);s.plants.A.lanes[0].machines[0].param=12;s.plants.A.lanes[0].machines[3].param=80;simulate(s,60);
 const l=s.plants.A.lanes[0];const keys=synergyKeys(s,l);assert.ok(keys.includes('accord')&&keys.includes('weave')&&keys.includes('bulk'),keys.join());
 assert.equal(synergyFactor(s,l),TUNING.synergy**keys.length);l.syn={};assert.equal(synergyFactor(s,l),1);assert.doesNotThrow(()=>deserialize(serialize(s)));
});
test('résonateur : fenêtre courte, jusqu’à 5 accords ; fenêtre longue, 3',()=>{
 for(const [variant,max] of [[1,5],[0,4],[2,3]]){const s=setup(['intake','cadence','press']);const c=s.plants.A.lanes[0].machines[1];assert.ok(setVariant(s,c,variant));simulate(s,20);assert.equal(c.streak,max);}
});
test('spécialité : ×2 sur la famille choisie, une seule fois',()=>{
 const s=setup(['intake','batch','press']);s.plants.A.lanes[0].machines[0].connected=false;const press=s.plants.A.lanes[0].machines[2];
 assert.ok(chooseSpecialty(s,'batch'));assert.equal(chooseSpecialty(s,'weave'),false);press.queue=[packet(80)];s.plants.A.stock.energy=1e6;step(s);assert.equal(press.lastPacket.bulk,16);
 assert.deepEqual(SPECIALTIES.map(x=>x.kind),['cadence','batch','weave']);
});
test('Eurêka : un débit ×5 après une modification est détecté, récompensé et enregistré une fois',()=>{
 const s=setup(['intake','press']);simulate(s,60);s.lastChange={tick:s.tick,rate:measuredRate(s,30).rate};
 insertModule(s,'A',s.plants.A.lanes[0].id,'cadence');s.plants.A.lanes[0].machines[0].param=12;const money=s.plants.A.stock.components;simulate(s,60);
 assert.equal(s.eurekas?.length,1);assert.ok(s.eurekas[0].ratio>=5);assert.ok(s.plants.A.stock.components>money);simulate(s,60);assert.equal(s.eurekas.length,1);
});
test('pistes : trois questions ouvertes, la nouveauté d’abord, jamais pendant le guide',()=>{
 const s=createState();s.produced=4000;const list=pistes(s);assert.equal(list.length,3);assert.equal(list[0].hint,'split');assert.ok(list.every(p=>/\\?$/.test(p.question)));
 startJourney(s);assert.deepEqual(pistes(s),[]);
});
test('espaces : après le guide, un seul nouvel espace par minute, chacun à sa condition',()=>{
 const s=createState();startJourney(s);s.journey.step=JOURNEY.length;s.produced=5000;const opened=[];
 for(let i=0;i<STAGES.length*STAGE_GAP+STAGE_GAP;i+=50){s.tick+=50;const g=openStages(s);if(g)opened.push([g.id,s.tick]);}
 assert.equal(opened.length,STAGES.length);for(let i=1;i<opened.length;i++)assert.ok(opened[i][1]-opened[i-1][1]>=STAGE_GAP);
 assert.ok(reveal(s,'nav-bench'));
});
