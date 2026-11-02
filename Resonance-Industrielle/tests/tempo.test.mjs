import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createState,step,simulate,machine,setTempo,beatTicks,packetMax} from '../src/engine.ts';
import {updatePrototypes,chooseProto,protoState,PROTO_AT} from '../src/progression.ts';
import {serialize,deserialize} from '../src/save.ts';
const packet=(qty=6,quality=1,extra={})=>({qty,quality,kind:'matter',recovered:false,exchanged:false,energy:0,origin:'A',...extra});
const setup=kinds=>{const s=createState();s.produced=2e7;s.plants.A.stock.components=1e9;s.plants.A.stock.ore=1e5;s.plants.A.stock.energy=1e6;s.plants.A.lanes=[{id:s.nextId++,name:'T',capsule:false,machines:kinds.map(k=>machine(s,k))}];return s;};
test('métronome : un lot par temps, bonus ×(1 + 60 ÷ tempo), tempo réglable',()=>{
 const s=setup(['intake','metronome','batch','press']);const [src,met,b]=s.plants.A.lanes[0].machines;src.connected=false;b.param=160;
 assert.ok(setTempo(s,60));assert.equal(beatTicks(s),10);met.queue=[packet(),packet()];
 for(let i=0;i<10;i++)step(s);assert.equal(b.queue.length,1);assert.equal(b.queue[0].quality,2);
 for(let i=0;i<10;i++)step(s);assert.equal(b.queue.length,2);assert.equal(setTempo(s,100),false);
});
test('écho : recopie une fois les empreintes d’origine du lot précédent',()=>{
 const s=setup(['intake','echo','batch','press']);const [src,e,b]=s.plants.A.lanes[0].machines;src.connected=false;b.param=160;
 e.queue=[packet(6,1,{marks:2,stamped:true,colors:1}),packet(),packet()];for(let i=0;i<4;i++)step(s);
 assert.deepEqual(b.queue.map(p=>p.marks??0),[2,2,0]);assert.equal(b.queue[1].echoed,true);assert.doesNotThrow(()=>deserialize(serialize(s)));
});
test('prototypes : trois propositions par palier, une seule gardée, règle appliquée',()=>{
 const s=setup(['intake','press']);s.produced=PROTO_AT[0];updatePrototypes(s);const p=protoState(s);assert.equal(p.offer.length,3);
 const max=packetMax(s);assert.ok(chooseProto(s,p.offer.includes('big-lot')?'big-lot':p.offer[0]));assert.equal(p.offer,null);assert.equal(p.owned.length,1);
 if(p.owned[0]==='big-lot')assert.equal(packetMax(s),max*2);updatePrototypes(s);assert.equal(p.offer,null,'next offer waits for the next threshold');
 s.produced=PROTO_AT[1];updatePrototypes(s);assert.equal(p.offer.length,3);assert.ok(!p.offer.includes(p.owned[0]));assert.doesNotThrow(()=>serialize(s));
});
