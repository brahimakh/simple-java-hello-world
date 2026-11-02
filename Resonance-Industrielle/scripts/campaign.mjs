// Development tool: a scripted "competent player" plays a full game to measure pacing toward 10¹⁵.
// It is not a human playtest: it knows good recipes in advance and never hesitates. Usage: node scripts/campaign.mjs [hours]
import {createState,simulate,addLane,insertModule,upgrade,upgradeCost,claim,EXPERIMENTS,measuredRate,unlocked,plantUnlocked,setParam,costOf,laneFee,buyMastery,masteryCost} from '../src/engine.ts';
import {MASTERY_FAMILIES} from '../src/content.ts';
import {acceptContract,contractOffers,buyPatent,PATENTS,progressOf} from '../src/progression.ts';
import {TIERS} from '../src/content.ts';
const hours=Number(process.argv[2]??6);const s=createState();const log=[];const say=t=>log.push(`${clock(s.tick)} ${t}`);
function clock(tick){const sec=Math.floor(tick/10);return `${Math.floor(sec/3600)}:${String(Math.floor(sec/60)%60).padStart(2,'0')}:${String(sec%60).padStart(2,'0')}`;}
// Foundry recipe, extended as families unlock. Order matters: resonate small lots, mark, gather, weave, heat, synchronise.
const RECIPE=['cadence','stamp','batch','weave','furnace','charge','sync','harmonic'];
const EXHAUST=['recovery','exchanger'];
function improveLane(lane){
 const kinds=lane.machines.map(m=>m.kind);
 for(const k of [...RECIPE,...EXHAUST]){if(kinds.includes(k)||!unlocked(s,k))continue;if(k==='harmonic'&&s.plants.A.lanes.length<2)continue;
  if(s.plants.A.stock.components<costOf(s,k)*1.2)return false;
  if(insertModule(s,'A',lane.id,k)){const m=lane.machines.find(x=>x.kind===k&&x.processed===0);if(k==='batch')setParam(s,m,80);if(k==='charge')setParam(s,m,2);say(`+ ${k} (ligne ${lane.name})`);return true;}
 }
 // Reorder once: resonator first, then marker before accumulator.
 return false;
}
function decide(){
 for(const e of EXPERIMENTS)if(claim(s,e.id))say(`expérience ${e.id}`);
 for(const l of s.plants.A.lanes)l.machines[0].param=12;
 for(const x of PATENTS)if(buyPatent(s,x.id))say(`brevet ${x.id}`);
 const p=progressOf(s);if(!p.contract&&contractOffers(s).length){const i=contractOffers(s).findIndex(c=>c.kind!=='harmony'||s.plants.A.lanes.length>1);if(i>=0&&acceptContract(s,i))say(`contrat ${p.contract.kind}`);}
 // Supplies first when a shortage is visible.
 const ms=s.plants.A.lanes.flatMap(l=>l.machines);
 if(ms.some(m=>m.status==='Manque de matière')&&s.plants.A.stock.components>=upgradeCost(s.plants.A.oreLevel)*1.5&&upgrade(s,'A','oreLevel'))say(`extraction niveau ${s.plants.A.oreLevel}`);
 if(ms.some(m=>m.status.includes('Énergie insuffisante'))&&s.plants.A.stock.components>=upgradeCost(s.plants.A.energyLevel)*1.5&&upgrade(s,'A','energyLevel'))say(`énergie niveau ${s.plants.A.energyLevel}`);
 const used=MASTERY_FAMILIES.filter(k=>s.plants.A.lanes.some(l=>l.machines.some(m=>m.kind===k))).sort((a,b)=>masteryCost(s,a)-masteryCost(s,b));
 for(const k of used)if(s.plants.A.stock.components>=masteryCost(s,k)&&buyMastery(s,k))say(`maîtrise ${k} ${s.mastery[k]}`);
 for(const l of s.plants.A.lanes)if(improveLane(l))return;
 if(s.plants.A.lanes.length<6&&s.plants.A.stock.components>=costOf(s,'intake')+costOf(s,'press')+laneFee(s,'A')*1.3&&s.produced>=400&&addLane(s,'A'))say(`nouvelle ligne de Fonderie (${s.plants.A.lanes.length})`);
 for(const id of ['B','C']){if(!plantUnlocked(s,id))continue;const p2=s.plants[id];
  if(p2.lanes.length<(id==='B'?2:2)&&addLane(s,id)){say(`ligne ${id}`);const l=p2.lanes.at(-1);l.machines[0].param=12;insertModule(s,id,l.id,'cadence');if(id==='B')insertModule(s,id,l.id,'recovery');}
  if(p2.lanes.some(l=>l.machines.some(m=>m.status.includes('Énergie insuffisante')))&&s.plants.A.stock.components>=upgradeCost(p2.energyLevel)*1.5&&upgrade(s,id,'energyLevel'))say(`énergie ${id} niveau ${p2.energyLevel}`);
 }
}
const tiers=[];const end=hours*3600;let lastRate=0;const plateaus=[];
while(s.tick/10<end&&s.produced<1e15&&!s.fault){
 decide();const before=s.produced;simulate(s,30);
 const rate=measuredRate(s).rate;if(rate<lastRate*1.02&&s.tick/10>300)plateaus.push(s.tick/10);lastRate=Math.max(lastRate,rate);
 for(const t of TIERS)if(before<t.at&&s.produced>=t.at){tiers.push([t.name,clock(s.tick)]);say(`*** palier ${t.name}`);}
}
const p=progressOf(s);
console.log(log.filter(l=>/palier|nouvelle ligne|brevet|ligne C|ligne B|maîtrise/.test(l)).join('\n'));
console.log('\nPaliers :',tiers.map(t=>t.join(' à ')).join(' · '));
console.log(`Fin à ${clock(s.tick)} · ${s.produced.toExponential(2)} composants · débit ${measuredRate(s).rate.toExponential(2)}/s · ${s.discoveries.length} découvertes · ${p.badges.length} badges · ${p.done} contrats · diagnostic ${s.fault??'aucun'}`);
console.log('Ordres de grandeur (temps) :',(s.tierTicks??[]).map((t,i)=>`10^${i+1} ${clock(t)}`).join(' · '));
