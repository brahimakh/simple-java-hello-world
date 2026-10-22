import {writeFile} from 'node:fs/promises';
import {createState,machine,simulate,measuredRate,addLane,claim,upgrade,insertModule} from '../src/engine.ts';
import {MODULES} from '../src/content.ts';
const recipes={reference:['intake','press'],cadence:['intake','cadence','press'],lots:['intake','batch','press'],recuperation:['intake','press','recovery','exchanger'],composee:['intake','cadence','batch','press','recovery','exchanger'],doubleAccord:['intake','cadence','cadence','batch','press','recovery','exchanger']};
const results=[];
for(const [name,kinds] of Object.entries(recipes)){
 const s=createState();s.produced=2000;s.plants.A.stock.components=0;s.plants.A.lanes[0].machines=kinds.map(k=>machine(s,k));
 for(const m of s.plants.A.lanes[0].machines)if(m.kind==='batch')m.param=80;
 simulate(s,600);const at600=s.produced;simulate(s,120);
 results.push({name,moduleCost:kinds.reduce((a,k)=>a+MODULES[k].cost,0),oreLevel:0,energyLevel:0,measurementSeconds:120,average:(s.produced-at600)/120,last60:measuredRate(s).rate,peakPerCycle:s.peak,recovered:s.recovered,fault:s.fault});
}
const recoveryContext=[];
for(const recover of [false,true]){
 const s=createState();s.produced=2000;s.plants.A.stock.components=10000;s.plants.A.stock.ore=0;s.plants.A.stock.energy=0;s.plants.A.lanes=[];
 const kinds=recover?['intake','press','recovery','exchanger']:['intake','press'];
 for(let i=0;i<6;i++)s.plants.A.lanes.push({id:s.nextId++,name:'Contexte',capsule:false,machines:kinds.map(k=>machine(s,k))});
 simulate(s,1200);const before=s.produced;simulate(s,300);
 recoveryContext.push({recover,lanes:6,moduleCost:6*kinds.reduce((n,k)=>n+MODULES[k].cost,0),average:(s.produced-before)/300,recovered:s.recovered,fault:s.fault});
}
// A repeatable example policy, confined to this developer tool. No unlocks/time boosts in normal play.
const progression=createState();let serdeAt=null,firstCadence=null,firstBatch=null;
for(let second=1;second<=7200;second++){
 simulate(progression,1);for(const e of ['first','lot','loop','duet','flow','final'])claim(progression,e);
 const l=progression.plants.A.lanes[0];
 if(!l.machines.some(m=>m.kind==='cadence')&&insertModule(progression,'A',l.id,'cadence'))firstCadence=second;
 if(!l.machines.some(m=>m.kind==='batch')&&insertModule(progression,'A',l.id,'batch')){l.machines.find(m=>m.kind==='batch').param=80;firstBatch=second;}
 if(progression.produced>=1000&&progression.plants.B.lanes.length===0&&addLane(progression,'B'))serdeAt=second;
 if(progression.produced>=400){for(const k of ['recovery','exchanger'])if(!l.machines.some(m=>m.kind===k))insertModule(progression,'A',l.id,k);}
 if(second%30===0){upgrade(progression,'A','oreLevel');upgrade(progression,'A','energyLevel');}
 if(progression.produced>=500000)break;
}
const report={comparison:'Même alimentation (12 matières/s, 8 énergie/s), une ligne, modules différents, chauffe de 600 s puis mesure sur 120 s. Les coûts des modules sont indiqués ; ce ne sont pas des comparaisons à budget égal.',results,recoveryContext,progression:{policy:'Un résonateur, accumulateur 80, récupération, Serre de base, amélioration des deux alimentations toutes les 30 s si finançable, expériences validées automatiquement.',firstCadenceSeconds:firstCadence,firstBatchSeconds:firstBatch,secondPlantSeconds:serdeAt,elapsedSeconds:progression.tick*.1,produced:progression.produced,finished:progression.produced>=500000,fault:progression.fault}};
await writeFile('balance-results.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
