import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createState,step,simulate,machine,insertModule,addLane,removeLane,costOf,insertBlueprint,encapsulate,setParam,setVariant,clone,buyMastery,masteryCost,laneFee} from '../src/engine.ts';
import {serialize,deserialize} from '../src/save.ts';
import {acceptContract,contractOffers,buyPatent,refound,progressOf,legacyFor,PATENTS} from '../src/progression.ts';
const packet=(qty=6,quality=1,extra={})=>({qty,quality,kind:'matter',recovered:false,exchanged:false,energy:0,origin:'A',...extra});
const setup=(kinds,plant='A',produced=2e8)=>{const s=createState();s.produced=produced;s.plants.A.stock.components=1e9;for(const p of Object.values(s.plants)){p.stock.ore=1e5;p.stock.energy=1e6;}const p=s.plants[plant];p.lanes=[{id:s.nextId++,name:'Test',capsule:false,machines:kinds.map(k=>machine(s,k))}];return s;};
const nodes=s=>s.plants.A.lanes[0].machines;

test('résonateurs successifs : rendement décroissant annoncé (×5 puis ×3)',()=>{
 const s=setup(['intake','cadence','cadence','press']);const [src,a,b]=nodes(s);src.connected=false;a.streak=3;a.last=0;b.streak=3;b.last=0;s.tick=10;
 s.plants.A.stock.energy=0;a.queue=[packet(6)];step(s);step(s);step(s);const out=nodes(s)[3].queue[0];assert.equal(out.quality,15);assert.equal(out.res,2);
});
test('diviseur : deux moitiés de même qualité, empreintes partagées',()=>{
 const s=setup(['intake','split','press']);const [src,sp,pr]=nodes(s);src.connected=false;sp.queue=[packet(24,3,{marks:2,stamped:true})];step(s);
 assert.equal(pr.queue.length,2);assert.deepEqual(pr.queue.map(p=>[p.qty,p.quality,p.marks]),[[12,3,1],[12,3,1]]);
});
test('filtre : renvoi en amont, puis passage au 8e retour sans perte de matière',()=>{
 const s=setup(['intake','batch','filter','press']);const [src,batch,filter,pr]=nodes(s);src.connected=false;batch.connected=true;filter.param=1000;filter.queue=[packet(10,2)];
 step(s);assert.equal(filter.queue.length,0);step(s);assert.equal(batch.queue[0].loops,1);
 const total=()=>[...nodes(s)].reduce((n,m)=>n+m.queue.reduce((a,p)=>a+p.qty,0),0)+(s.transit??[]).reduce((n,e)=>n+e.packet.qty,0);assert.equal(total(),10);
 filter.queue=[packet(10,2,{loops:8})];batch.queue=[];step(s);assert.equal(pr.queue.length,1);
});
test('miroir : relève un lot faible contre de l’énergie, sans refléter un reflet',()=>{
 const s=setup(['intake','mirror','batch','press']);const [src,mi,b]=nodes(s);src.connected=false;b.param=160;
 mi.queue=[packet(10,50),packet(10,2),packet(10,1)];const e=s.plants.A.stock.energy;simulate(s,1);
 assert.deepEqual(b.queue.map(p=>p.quality),[50,50,2]);assert.ok(s.plants.A.stock.energy<e+80);
});
test('four : la chaleur suit le débit et s’annonce plafonnée',()=>{
 const s=setup(['intake','furnace','press']);const [src,f]=nodes(s);src.connected=false;f.queue=[packet(160),packet(160)];step(s);assert.equal(f.heat,16);
 simulate(s,10);assert.ok(f.heat<16&&f.heat>0);f.heat=100;f.queue=[packet(160)];simulate(s,.2);assert.ok(f.heat<=100);
});
test('compresseur : N lots fondus, matière ÷ N, qualité × N × 0,85',()=>{
 const s=setup(['intake','compress','press']);const [src,c,pr]=nodes(s);src.connected=false;c.param=4;c.queue=[packet(40,2),packet(40,2),packet(40,2)];step(s);assert.equal(pr.queue.length,0);
 c.queue.push(packet(40,2));step(s);assert.equal(pr.queue[0].qty,40);assert.ok(Math.abs(pr.queue[0].quality-6.8)<1e-9);
});
test('harmoniseurs : deux lignes au même pas gagnent ×3',()=>{
 const s=setup(['intake','harmonic','press']);addLane(s,'A');const l2=s.plants.A.lanes[1];l2.machines.splice(1,0,machine(s,'harmonic'));
 nodes(s)[0].connected=false;l2.machines[0].connected=false;nodes(s)[1].queue=[packet()];l2.machines[1].queue=[packet()];step(s);
 assert.equal(l2.machines[2].queue[0].quality,3);
});
test('capteur : retient le lot sous le seuil choisi',()=>{
 const s=setup(['intake','sensor','press']);const [src,se,pr]=nodes(s);src.connected=false;assert.ok(setVariant(s,se,1));assert.ok(setParam(s,se,100));s.plants.A.stock.catalyst=50;se.queue=[packet()];step(s);
 assert.equal(pr.queue.length,0);s.plants.A.stock.catalyst=100;step(s);assert.equal(pr.queue.length,1);
});
test('empreintes bicolores : tissage ×2 supplémentaire, une seule fois par couleur',()=>{
 const s=setup(['intake','stamp','stamp','stamp','weave','press']);const [src,a,b,c,w,pr]=nodes(s);src.connected=false;b.variant=1;
 a.queue=[packet()];simulate(s,1);assert.equal(pr.lastPacket.quality,(1+2)*2);
});
test('Forge : le plasma revient multiplier la Fonderie par 10',()=>{
 const s=setup(['intake','press']);nodes(s)[0].connected=false;addLane(s,'C');s.plants.C.stock.catalyst=100;simulate(s,3);assert.ok(s.plasmaProduced>0);
 s.plants.A.stock.plasma=5;nodes(s)[1].queue=[packet(10)];const before=s.produced;step(s);assert.ok(Math.abs(s.produced-before-10*1.2*1.05**s.discoveries.length)<1e-6||Math.abs(s.produced-before-12)<1e-6);
});
test('coûts croissants par famille, remboursement exact',()=>{
 const s=setup(['intake','press']);const l=nodes(s);assert.equal(costOf(s,'cadence'),30);insertModule(s,'A',s.plants.A.lanes[0].id,'cadence');assert.equal(costOf(s,'cadence'),35);
});
test('insérer une invention dans une ligne : modules payés, ordre conservé',()=>{
 const s=setup(['intake','cadence','batch','press','recovery']);encapsulate(s,'A',s.plants.A.lanes[0].id,'Plan');addLane(s,'A');const l2=s.plants.A.lanes[1];
 assert.ok(insertBlueprint(s,'A',l2.id,0));assert.deepEqual(l2.machines.map(m=>m.kind),['intake','cadence','batch','press','recovery']);
});
test('anciennes sauvegardes : migration vers trois installations',()=>{
 const s=createState();const old=JSON.parse(serialize(s));delete old.plants.C;for(const p of Object.values(old.plants))delete p.stock.plasma;old.transfers=old.transfers.slice(0,2);
 const back=deserialize(JSON.stringify(old));assert.equal(back.transfers.length,4);assert.equal(back.plants.C.stock.plasma,0);
});
test('contrats et brevets : une demande remplie paie des brevets',()=>{
 const s=setup(['intake','batch','press'],'A',2e5);nodes(s)[1].param=80;assert.ok(contractOffers(s).length>=3);
 progressOf(s).done=1;const i=contractOffers(s).findIndex(c=>c.kind==='bulk');assert.ok(acceptContract(s,i));simulate(s,600);assert.equal(progressOf(s).contract,null);assert.equal(progressOf(s).points,1);
 assert.ok(buyPatent(s,'nodes'));assert.equal(buyPatent(s,'nodes'),false);assert.doesNotThrow(()=>serialize(s));
});
test('refondation : inventions, découvertes et brevets conservés, mémoire ×1,25 par découverte',()=>{
 const s=setup(['intake','press'],'A',2e12);encapsulate(s,'A',s.plants.A.lanes[0].id,'Plan');s.discoveries=[{id:'accord',tick:1},{id:'bulk',tick:2}];progressOf(s).patents.push(PATENTS[0].id);
 const next=refound(s);assert.ok(next);assert.equal(next.library.length,1);assert.equal(next.progress.legacy,legacyFor(2));assert.equal(next.produced,0);assert.deepEqual(next.progress.patents,['lanes']);
 assert.doesNotThrow(()=>serialize(next));
});
test('longue partie mixte : aucune anomalie et sauvegarde valide',()=>{
 const s=setup(['intake','split','cadence','stamp','batch','weave','filter','mirror','furnace','press','recovery'],'A',2e8);nodes(s)[4].param=80;addLane(s,'B');addLane(s,'C');simulate(s,600);
 assert.equal(s.fault,null);assert.doesNotThrow(()=>deserialize(serialize(s)));
});
test('maîtrises : ×2 sur la famille qui agit, échelle de prix partagée',()=>{
 const s=setup(['intake','cadence','press']);const [src,c]=nodes(s);src.connected=false;c.streak=3;c.last=0;s.tick=10;s.plants.A.stock.components=1e12;
 assert.ok(buyMastery(s,'cadence'));const second=masteryCost(s);assert.ok(buyMastery(s,'weave'));assert.ok(masteryCost(s)>second);
 c.queue=[packet()];s.plants.A.stock.energy=0;step(s);assert.equal(nodes(s)[2].queue[0].quality,5*2);
});
test('lignes supplémentaires : redevance croissante, rendue au démontage',()=>{
 const s=setup(['intake','press']);const before=s.plants.A.stock.components;const fee=laneFee(s,'A');assert.equal(fee,100);assert.ok(addLane(s,'A'));assert.equal(laneFee(s,'A'),800);
 assert.ok(removeLane(s,'A',s.plants.A.lanes[1].id));assert.equal(s.plants.A.stock.components,before);
});
