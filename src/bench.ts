import {clone,machine,step,DT,type State,type Lane} from './engine.ts';
import {MODULES,type PlantId,type Kind} from './content.ts';
export const BENCH_KEY='resonance-bench-reference-v1';
export interface Trial {rate:number;companyRate:number;catalystRate:number;peak:number;oreNet:number;energyNet:number;cost:number;blocked:number;cycles:number;series:number[];fault:string|null;bottleneck:{kind:Kind;status:string;share:number}|null;}
export interface Comparison {reference:Trial;candidate:Trial;duration:number;warmup:number;plant:PlantId;ratio:number|null;}
function rebuild(s:State,id:PlantId,lanes:Lane[]) {
 const mapping=new Map<number,number>();
 s.plants[id].lanes=lanes.map(l=>{const next={id:s.nextId++,name:l.name,capsule:l.capsule,machines:l.machines.map(original=>{const m=machine(s,original.kind,original.paid);m.param=original.param;m.connected=original.connected;if(m.routing&&original.routing)Object.assign(m.routing,{mode:original.routing.mode,threshold:original.routing.threshold});return m;})};mapping.set(l.id,next.id);return next;});
 lanes.forEach((l,i)=>l.machines.forEach((m,j)=>{const dest=s.plants[id].lanes[i].machines[j];if(dest.routing&&m.routing)dest.routing.target=mapping.get(m.routing.target)??0;}));
}
function trial(reference:State,layout:State,id:PlantId,duration:number,warmup:number):Trial {
 const s=clone(reference);s.paused=false;s.fault=null;s.pending=[];s.transit=[];s.history=[{tick:s.tick,total:s.produced}];
 for(const pid of ['A','B'] as const)rebuild(s,pid,clone(pid===id?layout.plants[pid].lanes:reference.plants[pid].lanes));
 const totalTicks=Math.round((duration+warmup)/DT);let start=s.produced,cat=s.catalystProduced,ore=0,energy=0,blocked=0,observed=0,peak=0,last=0,cycles=0;const series:number[]=[];
 const waits=new Map<string,{kind:Kind;status:string;ticks:number}>();
 for(let i=0;i<totalTicks;i++){
   if(i===Math.round(warmup/DT)){start=s.produced;cat=s.catalystProduced;ore=s.plants[id].stock[id==='A'?'ore':'residue'];energy=s.plants[id].stock.energy;last=id==='A'?start:cat;cycles=s.plants[id].lanes.reduce((n,l)=>n+(l.machines.find(m=>m.kind==='press')?.processed??0),0);}
   const before=id==='A'?s.produced:s.catalystProduced;step(s);
   if(i>=warmup/DT){const now=id==='A'?s.produced:s.catalystProduced;peak=Math.max(peak,now-before);for(const l of s.plants[id].lanes)for(const m of l.machines){if(!m.connected)continue;observed++;if(/insuffisante|saturée|incompatible|Choisir|ouverte|Configurer|Manque|Seuil|Relier/.test(m.status)){blocked++;const key=m.id+':'+m.status;const w=waits.get(key)??{kind:m.kind,status:m.status,ticks:0};w.ticks++;w.status=m.status;waits.set(key,w);}}if((i+1)%10===0){series.push(now-last);last=now;}}
   if(s.paused&&!s.fault)s.fault='Limite numérique du prototype atteinte (10¹⁵ composants cumulés).';
   if(s.fault)break;
 }
 const slowest=[...waits.values()].sort((a,b)=>b.ticks-a.ticks)[0];
 const p=s.plants[id];return {rate:((id==='A'?s.produced-start:s.catalystProduced-cat)/duration),companyRate:(s.produced-start)/duration,catalystRate:(s.catalystProduced-cat)/duration,peak,oreNet:(p.stock[id==='A'?'ore':'residue']-ore)/duration,energyNet:(p.stock.energy-energy)/duration,cost:p.lanes.reduce((n,l)=>n+l.machines.reduce((a,m)=>a+MODULES[m.kind].cost,0),0),blocked:observed?blocked/observed:0,cycles:p.lanes.reduce((n,l)=>n+(l.machines.find(m=>m.kind==='press')?.processed??0),0)-cycles,series,fault:s.fault,bottleneck:slowest?{kind:slowest.kind,status:slowest.status,share:slowest.ticks/(duration/DT)}:null};
}
export function compareLayouts(reference:State,candidate:State,id:PlantId,duration=180,warmup=120):Comparison {
 if(![60,180,600].includes(duration)||!Number.isInteger(warmup)||warmup<60||warmup>600||reference.fault||(id==='B'&&reference.produced<1000))throw Error('Banc d’essai indisponible');
 const a=trial(reference,reference,id,duration,warmup),b=trial(reference,candidate,id,duration,warmup);
 return {reference:a,candidate:b,duration,warmup,plant:id,ratio:a.rate>1e-9?b.rate/a.rate:null};
}
