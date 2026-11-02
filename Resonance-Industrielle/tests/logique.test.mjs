import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createState,step,simulate,machine,addLane,configureRouter,addMod,removeMod,modSlots,modCost} from '../src/engine.ts';
import {serialize,deserialize} from '../src/save.ts';
const packet=(qty=6,quality=1,extra={})=>({qty,quality,kind:'matter',recovered:false,exchanged:false,energy:0,origin:'A',...extra});
const setup=(kinds,produced=2e9)=>{const s=createState();s.produced=produced;s.plants.A.stock.components=1e15;s.plants.A.stock.ore=1e5;s.plants.A.stock.energy=1e6;s.plants.A.lanes=[{id:s.nextId++,name:'T',capsule:false,machines:kinds.map(k=>machine(s,k))}];return s;};
test('relais : les lots qui remplissent la condition partent sur l’autre ligne',()=>{
 const s=setup(['intake','relay','press']);addLane(s,'A');const [a,b]=s.plants.A.lanes;a.machines[0].connected=false;b.machines[0].connected=false;const relay=a.machines[1];
 assert.ok(configureRouter(s,'A',a.id,relay.id,{target:b.id,mode:'quality',threshold:100}));assert.equal(configureRouter(s,'A',a.id,relay.id,{threshold:7}),false);
 relay.queue=[packet(6,500),packet(6,2)];step(s);step(s);step(s);step(s);
 assert.equal(relay.routing.branch,1);assert.equal(relay.routing.main,1);assert.doesNotThrow(()=>deserialize(serialize(s)));
});
test('emplacements : turbo, marque, stabilisateur ; prix croissant rendu au retrait',()=>{
 const s=setup(['intake','cadence','press']);const [src,c,pr]=s.plants.A.lanes[0].machines;s.discoveries=[{id:'mod',tick:0}];assert.equal(modSlots(s),1);
 const before=s.plants.A.stock.components,cost=modCost(s);assert.ok(addMod(s,pr,'turbo'));assert.ok(modCost(s)>cost);assert.equal(addMod(s,pr,'marque'),false,'one slot');
 assert.equal(addMod(s,pr,'stabilisateur'),false);src.connected=false;pr.queue=[packet()];step(s);assert.ok(Math.abs(pr.clock-.5)<1e-9);
 assert.ok(removeMod(s,pr,'turbo'));assert.equal(s.plants.A.stock.components,before);
 assert.ok(addMod(s,c,'stabilisateur'));c.streak=3;c.last=-100;s.plants.A.stock.energy=0;c.queue=[packet()];step(s);assert.equal(c.streak,4);
 const t=setup(['intake','split','batch','press']);const sp=t.plants.A.lanes[0].machines[1];t.plants.A.lanes[0].machines[0].connected=false;t.plants.A.lanes[0].machines[2].param=160;
 assert.ok(addMod(t,sp,'marque'));sp.queue=[packet(12)];step(t);assert.deepEqual(t.plants.A.lanes[0].machines[2].queue.map(p=>p.marks),[1,1]);assert.doesNotThrow(()=>deserialize(serialize(t)));
});
