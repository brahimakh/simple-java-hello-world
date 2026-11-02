// Development tool: scripted "competent players", one per play style, measure pacing toward 10¹⁵.
// They are not human playtests: they know a recipe in advance and never hesitate. Decisions every 30 s.
// Usage: node scripts/campaign.mjs [hours] [style]   (all styles when no style is given)
import {TUNING,createState,simulate,addLane,insertModule,upgrade,upgradeCost,claim,EXPERIMENTS,measuredRate,unlocked,plantUnlocked,setParam,setVariant,costOf,laneFee,buyMastery,masteryCost} from '../src/engine.ts';
import {MASTERY_FAMILIES,UNLOCKS,TIERS} from '../src/content.ts';
import {FEATURES} from '../src/engine.ts';
import {acceptContract,contractOffers,buyPatent,PATENTS,progressOf,chooseSpecialty} from '../src/progression.ts';
import * as hooks from './campaign-hooks.mjs';
export const STYLES={
 complet:{specialty:'cadence',recipe:['cadence','stamp','batch','weave','furnace','charge','sync','harmonic']},
 cadence:{specialty:'cadence',recipe:['cadence','stamp','batch','weave','charge','furnace','sync','harmonic'],short:true},
 masse:{specialty:'batch',recipe:['cadence','stamp','batch','weave','compress','furnace','sync','harmonic']},
 empreinte:{specialty:'weave',recipe:['stamp','cadence','batch','weave','charge','mirror','sync','harmonic']},
 boucles:{specialty:'cadence',recipe:['cadence','stamp','batch','weave','filter','charge','sync','harmonic']}
};
const clock=tick=>{const sec=Math.floor(tick/10);return `${Math.floor(sec/3600)}:${String(Math.floor(sec/60)%60).padStart(2,'0')}:${String(sec%60).padStart(2,'0')}`;};
export function runCampaign(style,hours=4){
 const {specialty,recipe,short}=STYLES[style];const s=createState();
 // Paced like a new game whose guide is finished (novelties arrive one at a time).
 if(!process.env.UNPACED)s.journey={step:9,manual:5,flags:['finished'],doneTick:0,open:['atelier','lignes','serre','vue','inventions','banc']};const log=[];const say=t=>log.push(`${clock(s.tick)} ${t}`);
 const EXHAUST=['recovery','exchanger'];
 // Price felt by the player: seconds of current production that each extension purchase cost.
 const saves=[];const bought=(kind,cost,ok)=>{const r=measuredRate(s,30).rate;if(ok&&r>0)saves.push({kind,tick:s.tick,sec:cost/r});return ok;};
 function improveLane(lane){
  const kinds=lane.machines.map(m=>m.kind);
  for(const k of [...recipe,...EXHAUST]){if(kinds.includes(k)||!unlocked(s,k))continue;if(k==='harmonic'&&s.plants.A.lanes.length<2)continue;
   if(s.plants.A.stock.components<costOf(s,k)*1.2)return false;
   const rate=measuredRate(s,30).rate;
   if(insertModule(s,'A',lane.id,k)){const m=lane.machines.find(x=>x.kind===k&&x.processed===0);if(k==='batch')setParam(s,m,80);if(k==='charge')setParam(s,m,2);if(k==='filter')setParam(s,m,100);if(k==='compress')setParam(s,m,2);if(k==='cadence'&&short)setVariant(s,m,1);
    s.lastChange={tick:s.tick,rate};hooks.afterInsert?.(s,lane,m);say(`+ ${k}`);return true;}
  }
  return false;
 }
 function decide(){
  if(!s.specialty&&s.produced>=100)chooseSpecialty(s,specialty);
  for(const e of EXPERIMENTS)if(claim(s,e.id))say(`expérience ${e.id}`);
  for(const l of s.plants.A.lanes)l.machines[0].param=12;
  for(const x of PATENTS)if(buyPatent(s,x.id))say(`brevet ${x.id}`);
  const p=progressOf(s);if(!p.contract&&contractOffers(s).length){const i=contractOffers(s).findIndex(c=>c.kind!=='harmony'||s.plants.A.lanes.length>1);if(i>=0)acceptContract(s,i);}
  const ms=s.plants.A.lanes.flatMap(l=>l.machines);
  if(ms.some(m=>m.status.startsWith('Manque de matière'))&&s.plants.A.stock.components>=upgradeCost(s.plants.A.oreLevel)*1.5&&bought('extension',upgradeCost(s.plants.A.oreLevel),upgrade(s,'A','oreLevel')))say(`extraction ${s.plants.A.oreLevel}`);
  if(ms.some(m=>m.status.includes('Énergie insuffisante'))&&s.plants.A.stock.components>=upgradeCost(s.plants.A.energyLevel)*1.5&&bought('extension',upgradeCost(s.plants.A.energyLevel),upgrade(s,'A','energyLevel')))say(`énergie ${s.plants.A.energyLevel}`);
  const used=MASTERY_FAMILIES.filter(k=>s.plants.A.lanes.some(l=>l.machines.some(m=>m.kind===k)));
  for(const k of used)if(s.plants.A.stock.components>=masteryCost(s,k)&&bought('maîtrise',masteryCost(s,k),buyMastery(s,k)))say(`maîtrise ${k}`);
  hooks.decide?.(s,say);hooks.decide2?.(s,say);hooks.decide3?.(s,say);hooks.decide4?.(s,say);
  for(const l of s.plants.A.lanes)if(improveLane(l))return;
  if(s.plants.A.lanes.length<6&&s.plants.A.stock.components>=costOf(s,'intake')+costOf(s,'press')+laneFee(s,'A')*1.3&&s.produced>=400&&bought('ligne',laneFee(s,'A'),addLane(s,'A')))say(`nouvelle ligne (${s.plants.A.lanes.length})`);
  for(const id of ['B','C']){if(!plantUnlocked(s,id))continue;const p2=s.plants[id];
   if(p2.lanes.length<2&&addLane(s,id)){say(`ligne ${id}`);const l=p2.lanes.at(-1);l.machines[0].param=12;insertModule(s,id,l.id,'cadence');if(id==='B')insertModule(s,id,l.id,'recovery');}
   if(p2.lanes.some(l=>l.machines.some(m=>m.status.includes('Énergie insuffisante')))&&s.plants.A.stock.components>=upgradeCost(p2.energyLevel)*1.5&&upgrade(s,id,'energyLevel'))say(`énergie ${id}`);
  }
 }
 const unlockTimes=[];const end=hours*3600;
 while(s.tick/10<end&&s.produced<1e15&&!s.fault){const before=s.produced;decide();simulate(s,30);for(const u of UNLOCKS)if(before<u.at&&s.produced>=u.at)unlockTimes.push([u.at,s.tick]);}
 const families=new Set(s.plants.A.lanes.flatMap(l=>l.machines.map(m=>m.kind)));
 const intro=(s.timeline??[]).filter(e=>e.text.startsWith('nouveauté:')).map(e=>e.tick);
 const gaps=intro.slice(1).map((t,i)=>(t-intro[i])/10);
 return {style,s,log,saves,tiers:s.tierTicks??[],families:families.size,eurekas:s.eurekas?.length??0,discoveries:s.discoveries?.length??0,gaps,unlockTimes,clock};
}
if(process.argv[1]?.endsWith('campaign.mjs')){
 for(const arg of process.argv.slice(2))if(/^[\w.]+=[\d.e]+$/.test(arg)){const [k,v]=arg.split('=');if(k.startsWith('at.'))FEATURES[k.slice(3)].at=Number(v);else TUNING[k]=Number(v);}
 const args=process.argv.slice(2).filter(a=>!a.includes('='));
 const hours=Number(args[0]??4);const styles=args[1]&&!args[1].startsWith('--')?[args[1]]:Object.keys(STYLES);
 const rows=styles.map(st=>runCampaign(st,hours));
 const at=(r,k)=>r.tiers[k-1]!==undefined?clock(r.tiers[k-1]):'—';
 console.log('| Style | 10³ | 10⁶ | 10⁹ | 10¹² | 10¹⁵ | Familles | Découvertes | Eurêka | Écart entre nouveautés |');
 console.log('|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|');
 for(const r of rows)console.log(`| ${r.style} | ${at(r,3)} | ${at(r,6)} | ${at(r,9)} | ${at(r,12)} | ${at(r,15)} | ${r.families} | ${r.discoveries} | ${r.eurekas} | ${r.gaps.length?Math.round(Math.min(...r.gaps)/6)/10:0}–${r.gaps.length?Math.round(Math.max(...r.gaps)/6)/10:0} min |`);
 if(process.argv.includes('--prices'))for(const r of rows){const ph=[[0,600],[600,1800],[1800,3600],[3600,1e9]];console.log(r.style,ph.map(([a,b])=>{const x=r.saves.filter(v=>v.tick>=a*10&&v.tick<b*10).map(v=>v.sec).sort((p,q)=>p-q);const kinds=[...new Set(r.saves.filter(v=>v.tick>=a*10&&v.tick<b*10).map(v=>v.kind))].map(k=>k+':'+r.saves.filter(v=>v.kind===k&&v.tick>=a*10&&v.tick<b*10).length).join(',');return x.length?`[${kinds}] ${a/60}-${b<1e9?b/60:'∞'} min: ${x.length} achats, médiane ${Math.round(x[x.length>>1])} s, ${Math.round(100*x.filter(v=>v<5).length/x.length)} % < 5 s`:'';}).filter(Boolean).join(' | '));}
 for(const r of rows)if(r.s.fault)console.log('Diagnostic',r.style,r.s.fault);
 if(process.argv.includes('--unlocks'))for(const r of rows)console.log(r.style,(r.s.timeline??[]).filter(e=>e.text.startsWith('nouveauté:')).map(e=>`${e.text.slice(10)}@${clock(e.tick)}`).join(' '));
}
