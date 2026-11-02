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
test('assembleur : deux lignes, un lot ; matière conservée, qualités multipliées',()=>{
 const s=setup(['intake','assembler','press']);const [src,asm,pr]=s.plants.A.lanes[0].machines;src.connected=false;s.plants.A.stock.energy=0;
 asm.queue=[{...packet(6,4),lane:1},{...packet(6,4),lane:1}];step(s);assert.equal(asm.status,'Attend un lot d’une autre ligne');
 asm.queue.push({...packet(10,5),lane:2});step(s);assert.equal(pr.queue[0].qty,16);assert.equal(pr.queue[0].quality,20);assert.equal(asm.queue.length,1);
 for(let i=0;i<40;i++)step(s);assert.equal(asm.queue.length,0,'a lonely batch passes after 3 s');
});
test('moules : ressort, engrenage, cristal ; magenta et prismatique',()=>{
 for(const [mold,qty,factor,cycle] of [[1,6,3,1],[1,80,.5,1],[3,6,4,3]]){const s=setup(['intake','press']);const [src,pr]=s.plants.A.lanes[0].machines;src.connected=false;assert.ok(setVariant(s,pr,mold));pr.queue=[packet(qty)];step(s);assert.equal(pr.lastPacket.mold,factor);assert.ok(Math.abs(pr.clock-(cycle-.1))<1e-9||pr.clock===cycle);}
 const s=setup(['intake','stamp','stamp','stamp','weave','press']);s.produced=5e7;const [src,a,b,c]=s.plants.A.lanes[0].machines;src.connected=false;s.plants.A.stock.energy=0;
 assert.ok(setVariant(s,b,1));assert.ok(setVariant(s,c,2));a.queue=[packet()];for(let i=0;i<8;i++)step(s);assert.equal(s.plants.A.lanes[0].machines[5].lastPacket.quality,(1+3)*5);
});
test('rythme : pendant le guide, seules les bases ; ensuite une nouveauté à la fois, avec un écart qui grandit',async()=>{
 const {updateIntro,introGap,INTRO_GAP,unlocked}=await import('../src/engine.ts');
 const s=createState();startJourney(s);s.produced=1e7;s.tick=10;updateIntro(s);updateIntro(s);updateIntro(s);updateIntro(s);updateIntro(s);
 assert.deepEqual(s.intro.keys.sort(),['batch','cadence','stamp','weave']);assert.equal(unlocked(s,'router'),false);
 s.journey.step=JOURNEY.length;const ticks=[];for(let t=0;t<40000;t+=10){s.tick+=10;if(updateIntro(s))ticks.push(s.tick);}
 assert.ok(ticks.length>=8);assert.ok(unlocked(s,'router'));for(let i=1;i<ticks.length;i++)assert.ok(ticks[i]-ticks[i-1]>=INTRO_GAP);
 assert.ok(ticks.at(-1)-ticks.at(-2)>ticks[1]-ticks[0],'later novelties wait longer');
});
