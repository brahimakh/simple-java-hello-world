import {MODULES, LIMITS, PLANTS, MASTERY_FAMILIES} from './content.ts';
import {type State,EXPERIMENTS,TRANSFERS,PARAMS,VARIANTS,ROUTE_THRESHOLDS,emptyStock,UPGRADE_MAX} from './engine.ts';
import {CHALLENGES} from './challenges.ts';
import {PATENTS,BADGES,DISCOVERIES} from './progression.ts';
export const SAVE_KEY='resonance-industrielle-v1';
export const BACKUP_KEY=SAVE_KEY+'-precedente';
function requireValue(ok:unknown,message:string):asserts ok {if(!ok)throw Error(`Sauvegarde invalide : ${message}`);}
const MAX=LIMITS.stock*10;
function number(n:unknown,max=MAX) {return typeof n==='number'&&Number.isFinite(n)&&n>=0&&n<=max;}
function integer(n:unknown,max=1e15) {return number(n,max)&&Number.isSafeInteger(n);}
function label(n:unknown) {return typeof n==='string'&&n.length<=250;}
const PACKET=320;
// Saves from versions 0.1–0.5 had two facilities and five resources: complete them without changing anything else.
export function migrate(value:unknown) {
 if(!value||typeof value!=='object')return value;
 const s=value as State;if(!s.plants||typeof s.plants!=='object')return value;
 if(!s.plants.C)s.plants.C={stock:{...emptyStock(),energy:500},lanes:[],oreLevel:0,energyLevel:0,catalystOn:false};
 for(const p of Object.values(s.plants) as {stock?:Record<string,number>}[])if(p&&p.stock&&typeof p.stock==='object'&&!('plasma' in p.stock))p.stock.plasma=0;
 if(s.plants.A&&s.plants.A.plasmaOn===undefined)s.plants.A.plasmaOn=true;
 if(Array.isArray(s.transfers)&&s.transfers.length===2)for(const t of TRANSFERS.slice(2))s.transfers.push({...t,enabled:true,moved:0});
 return s;
}
const route=(r:{target:number;mode:string;threshold:number})=>{requireValue(r&&integer(r.target)&&['small','large','alternate','overflow'].includes(r.mode)&&ROUTE_THRESHOLDS.includes(r.threshold),'aiguillage');};
const spec=(m:import('./engine.ts').MachineSpec)=>{
   requireValue(m&&Object.hasOwn(MODULES,m.kind),'module inconnu');
   requireValue(typeof m.connected==='boolean'&&number(m.param,1e9),'paramètre');
   const allowed=PARAMS[m.kind];requireValue(allowed?allowed.includes(m.param):m.param===0||m.kind==='router','réglage');
   requireValue(m.variant===undefined||!!VARIANTS[m.kind]?.includes(m.variant),'variante de module');
   if(m.kind==='router')requireValue(m.routing,'aiguillage');
   if(m.routing){requireValue(m.kind==='router','aiguillage');route(m.routing);}
 };
export const checkBlueprint=(b:import('./engine.ts').Blueprint)=>{requireValue(b&&label(b.name)&&(b.rating===undefined||number(b.rating))&&(b.rate===undefined||number(b.rate))&&Array.isArray(b.machines)&&b.machines.length>=2&&b.machines.length<=LIMITS.nodes+2,'plan');b.machines.forEach(spec);requireValue(b.machines[0].kind==='intake'&&b.machines.filter(m=>m.kind==='intake').length===1&&b.machines.filter(m=>m.kind==='press').length===1,'structure de chaîne');};
export function validate(value:unknown):State {
 const blueprint=checkBlueprint;
 requireValue(!!value&&typeof value==='object','objet attendu');const s=migrate(value) as State;
 requireValue(s.version===1,'version non reconnue');
 for(const k of ['tick','nextId'] as const)requireValue(integer(s[k]),k);
 for(const k of ['produced','catalystProduced','recovered','largestLot','peak','totalSpent'] as const)requireValue(number(s[k]),k);
 requireValue(s.plasmaProduced===undefined||number(s.plasmaProduced),'plasma');
 requireValue(s.allowed===undefined||Array.isArray(s.allowed)&&s.allowed.length<=20&&s.allowed.every(k=>Object.hasOwn(MODULES,k)),'modules permis');
 if(s.mastery!==undefined)requireValue(s.mastery&&typeof s.mastery==='object'&&!Array.isArray(s.mastery)&&Object.entries(s.mastery).every(([k,v])=>MASTERY_FAMILIES.includes(k as never)&&integer(v,40)),'maîtrises');
 if(s.journey!==undefined){const j=s.journey;requireValue(j&&integer(j.step,50)&&integer(j.manual,1e9)&&Array.isArray(j.flags)&&j.flags.length<=20&&j.flags.every(f=>typeof f==='string'&&f.length<=24),'parcours');requireValue((j.doneTick===undefined||integer(j.doneTick))&&(j.open===undefined||Array.isArray(j.open)&&j.open.length<=20&&j.open.every(x=>typeof x==='string'&&x.length<=20))&&((j as {lastOpen?:number}).lastOpen===undefined||integer((j as {lastOpen?:number}).lastOpen)),'étapes');}
 requireValue(s.tempo===undefined||[60,90,120,150,180,240].includes(s.tempo),'tempo');
 if(s.protos!==undefined)requireValue(s.protos&&Array.isArray(s.protos.owned)&&s.protos.owned.length<=10&&s.protos.owned.every(x=>typeof x==='string'&&x.length<=20)&&(s.protos.offer===null||Array.isArray(s.protos.offer)&&s.protos.offer.length<=3&&s.protos.offer.every(x=>typeof x==='string'&&x.length<=20)),'prototypes');
 requireValue(s.specialty===undefined||['cadence','batch','weave'].includes(s.specialty),'spécialité');
 if(s.lastChange!==undefined)requireValue(s.lastChange&&integer(s.lastChange.tick)&&s.lastChange.tick<=s.tick&&number(s.lastChange.rate),'modification');
 if(s.eurekas!==undefined)requireValue(Array.isArray(s.eurekas)&&s.eurekas.length<=30&&s.eurekas.every(e=>e&&integer(e.tick)&&number(e.ratio)&&number(e.before)&&number(e.after)),'eurêkas');
 requireValue(s.puzzle===undefined||typeof s.puzzle==='string'&&s.puzzle.length<=32,'puzzle');
 requireValue(s.variant===undefined||['standard','slow','small','nores'].includes(s.variant),'variante');
 requireValue(typeof s.paused==='boolean'&&(s.fault===null||label(s.fault)),'état du moteur');
 requireValue(s.plants&&Object.keys(s.plants).length===3,'installations');
 const ids=new Set<number>();
 const id=(n:number)=>{requireValue(integer(n)&&n>0&&n<s.nextId&&!ids.has(n),'identifiant');ids.add(n);};
 const packet=(p:import('./engine.ts').Packet)=>{
   requireValue(p&&number(p.qty,PACKET)&&p.qty>0&&number(p.quality,LIMITS.quality)&&p.quality>=1&&(p.kind==='matter'||p.kind==='exhaust')&&typeof p.recovered==='boolean'&&typeof p.exchanged==='boolean'&&number(p.energy,PACKET*2)&&PLANTS.includes(p.origin),'lot');
   requireValue((p.marks===undefined||number(p.marks,160))&&(p.stamped===undefined||typeof p.stamped==='boolean')&&(!(p.marks??0)||p.stamped===true),'empreintes');
   requireValue((p.colors===undefined||[0,1,2,3,4,5,6,7].includes(p.colors))&&(p.lane===undefined||integer(p.lane))&&(p.assembled===undefined||typeof p.assembled==='boolean')&&(p.echoed===undefined||typeof p.echoed==='boolean')&&((p as {beat?:number}).beat===undefined||integer((p as {beat?:number}).beat))&&(p.res===undefined||integer(p.res,1000))&&(p.loops===undefined||integer(p.loops,8))&&(p.charged===undefined||integer(p.charged,1e6))&&(p.split===undefined||typeof p.split==='boolean'),'propriétés du lot');
 };
 for(const pid of PLANTS){
   const p=s.plants[pid];requireValue(p&&p.stock&&Object.keys(p.stock).length===6,'réserves');
   for(const r of ['ore','energy','components','residue','catalyst','plasma'] as const)requireValue(number(p.stock[r],LIMITS.stock),'stock '+r);
   requireValue(integer(p.oreLevel,UPGRADE_MAX)&&integer(p.energyLevel,UPGRADE_MAX)&&typeof p.catalystOn==='boolean'&&(p.plasmaOn===undefined||typeof p.plasmaOn==='boolean'),'améliorations');
   requireValue(Array.isArray(p.lanes)&&p.lanes.length<=LIMITS.lanes+2,'lignes');
   for(const l of p.lanes){id(l.id);blueprint(l);requireValue(typeof l.capsule==='boolean'&&(l.fee===undefined||number(l.fee)),'capsule');if(l.syn!==undefined)requireValue(l.syn&&typeof l.syn==='object'&&Object.keys(l.syn).length<=40&&Object.entries(l.syn).every(([k,v])=>/^[a-z0-9-]{1,20}$/.test(k)&&integer(v)&&v<=s.tick),'synergie');for(const m of l.machines){
     id(m.id);requireValue(number(m.paid,MAX),'coût du module');
     requireValue(Array.isArray(m.queue)&&m.queue.length<=800,'file');m.queue.forEach(packet);if(m.working)packet(m.working);
     requireValue(m.working===null||m.kind==='charge','charge en cours');
     requireValue(m.queue.reduce((n,p)=>n+p.qty,0)+(m.working?.qty??0)<=LIMITS.queue+1e-6,'capacité');
     requireValue(number(m.clock,8)&&integer(m.streak,4)&&typeof m.last==='number'&&Number.isFinite(m.last)&&m.last>=-1000&&m.last<=s.tick*.1+1e-6&&label(m.status)&&integer(m.processed,1e15),'cycle');
     requireValue(m.manual===undefined||m.manual===true&&m.kind==='intake','injecteur manuel');
     requireValue((m.memory===undefined||number(m.memory,LIMITS.quality))&&(m.memoryAt===undefined||integer(m.memoryAt))&&(m.heat===undefined||number(m.heat,100)),'mémoire de machine');
     if(m.routing){requireValue(typeof m.routing.turn==='boolean'&&integer(m.routing.main,1e15)&&integer(m.routing.branch,1e15)&&(m.routing.lastBranch===undefined||typeof m.routing.lastBranch==='boolean')&&(m.routing.target===0||p.lanes.some(dest=>dest.id===m.routing!.target&&dest.id!==l.id)),'aiguillage');}
     if(m.lastPacket){const a=m.lastPacket;requireValue(integer(a.tick)&&a.tick<=s.tick&&number(a.qty,PACKET)&&number(a.quality,LIMITS.quality)&&number(a.marks,160),'mesure');}
     if(m.lastPacket?.result!==undefined){const a=m.lastPacket;requireValue(m.kind==='press'&&number(a.result)&&(a.bulk===1||a.bulk!>=8&&Number.isInteger(Math.log2(a.bulk!/8)))&&[1,4,6].includes(a.catalysis!)&&(a.plasma===undefined||a.plasma===10)&&(a.legacy===undefined||number(a.legacy,1e9))&&(a.synergy===undefined||number(a.synergy,1e3))&&(a.mold===undefined||[.5,1.5,3,4].includes(a.mold)),'facteurs de pressage');}
     if(m.made!==undefined)requireValue(number(m.made),'mesure');
   }}
 }
 if(s.transit!==undefined){requireValue(Array.isArray(s.transit)&&s.transit.length<=LIMITS.events,'transit');for(const e of s.transit){requireValue(e&&PLANTS.includes(e.plant)&&integer(e.target),'transit');packet(e.packet);const target=s.plants[e.plant].lanes.flatMap(l=>l.machines).find(m=>m.id===e.target);requireValue(target&&e.packet.kind==='matter'&&MODULES[target.kind].input==='matter','destination');}for(const p of Object.values(s.plants))for(const l of p.lanes)for(const m of l.machines){const queued=s.transit.filter(e=>e.target===m.id).reduce((n,e)=>n+e.packet.qty,0);requireValue(m.queue.reduce((n,p)=>n+p.qty,0)+(m.working?.qty??0)+queued<=LIMITS.queue+1e-6,'capacité');}}
 requireValue(Array.isArray(s.library)&&s.library.length<=30,'bibliothèque');s.library.forEach(blueprint);
 requireValue(Array.isArray(s.configurations)&&s.configurations.length<=20,'configurations');for(const c of s.configurations){requireValue(c&&label(c.name)&&PLANTS.includes(c.plant)&&Array.isArray(c.lanes)&&c.lanes.length<=LIMITS.lanes+2,'configuration');c.lanes.forEach(blueprint);if(c.laneIds!==undefined)requireValue(Array.isArray(c.laneIds)&&c.laneIds.length===c.lanes.length&&new Set(c.laneIds).size===c.laneIds.length&&c.laneIds.every(x=>integer(x)&&x>0),'configuration');}
 requireValue(Array.isArray(s.transfers)&&s.transfers.length===TRANSFERS.length,'transferts');s.transfers.forEach((t,i)=>{const ref=TRANSFERS[i];requireValue(t&&t.resource===ref.resource&&t.from===ref.from&&t.to===ref.to&&t.rate===ref.rate&&typeof t.enabled==='boolean'&&number(t.moved),'route');});
 requireValue(Array.isArray(s.pending)&&s.pending.length<=LIMITS.events,'événements');for(const e of s.pending)requireValue(e&&PLANTS.includes(e.plant)&&Object.hasOwn(emptyStock(),e.resource)&&number(e.qty,LIMITS.stock),'événement');
 const series=(h:unknown,max:number)=>{requireValue(Array.isArray(h)&&h.length>=1&&h.length<=max,'historique');let t=-1,total=-1;for(const x of h as {tick:number;total:number}[]){requireValue(x&&integer(x.tick)&&x.tick<=s.tick&&x.tick>t&&number(x.total)&&x.total>=total-1e-6&&x.total<=s.produced+1e-6,'mesure');t=x.tick;total=x.total;}};
 series(s.history,121);if(s.longHistory!==undefined)series(s.longHistory,1201);
 requireValue(Array.isArray(s.log)&&s.log.length<=14,'journal');for(const l of s.log)requireValue(l&&integer(l.tick)&&l.tick<=s.tick&&label(l.text),'entrée de journal');
 if(s.timeline!==undefined){requireValue(Array.isArray(s.timeline)&&s.timeline.length<=80,'chronologie');for(const l of s.timeline)requireValue(l&&integer(l.tick)&&l.tick<=s.tick&&label(l.text),'chronologie');}
 if(s.tierTicks!==undefined)requireValue(Array.isArray(s.tierTicks)&&s.tierTicks.length<=21&&s.tierTicks.every(n=>integer(n)&&n<=s.tick),'paliers');
 if(s.discoveries!==undefined)requireValue(Array.isArray(s.discoveries)&&s.discoveries.length<=DISCOVERIES.length&&s.discoveries.every(d=>d&&DISCOVERIES.some(x=>x.id===d.id)&&integer(d.tick))&&new Set(s.discoveries.map(d=>d.id)).size===s.discoveries.length,'découvertes');
 if(s.stats!==undefined)requireValue(s.stats&&typeof s.stats==='object'&&!Array.isArray(s.stats)&&Object.keys(s.stats).length<=64&&Object.entries(s.stats).every(([k,v])=>/^[a-z0-9]{1,16}$/i.test(k)&&number(v)),'statistiques');
 if(s.progress!==undefined){const p=s.progress;
   requireValue(p&&number(p.points,1e6)&&Number.isInteger(p.points)&&integer(p.done,1e9)&&integer(p.refounds,1e6)&&number(p.legacy,1e12)&&p.legacy>=1,'progression');
   requireValue(Array.isArray(p.patents)&&new Set(p.patents).size===p.patents.length&&p.patents.every(x=>PATENTS.some(d=>d.id===x)),'brevets');
   requireValue(Array.isArray(p.badges)&&new Set(p.badges).size===p.badges.length&&p.badges.every(x=>BADGES.some(d=>d.id===x)),'badges');
   if(p.contract!==null){const c=p.contract;requireValue(c&&typeof c.kind==='string'&&c.kind.length<=16&&number(c.goal)&&number(c.base)&&number(c.reward)&&integer(c.patents,5)&&integer(c.start)&&c.start<=s.tick&&integer(c.level,21),'contrat');}
 }
 requireValue(Array.isArray(s.claimed)&&s.claimed.length<=EXPERIMENTS.length&&new Set(s.claimed).size===s.claimed.length&&s.claimed.every(x=>EXPERIMENTS.some(e=>e.id===x)),'expériences');
 if(s.challenges!==undefined){
   const c=s.challenges;const known=(id:unknown)=>CHALLENGES.some(x=>x.id===id);
   requireValue(c&&Array.isArray(c.completed)&&c.completed.length<=CHALLENGES.length&&new Set(c.completed).size===c.completed.length&&c.completed.every(known),'défis');
   if(c.result){requireValue(known(c.result.id)&&typeof c.result.success==='boolean'&&['changed','targets','success'].includes(c.result.reason),'résultat de défi');if(c.result.values!==undefined)requireValue(Array.isArray(c.result.values)&&c.result.values.length===3&&c.result.values.every(n=>number(n)),'mesures de défi');}
   if(c.active!==null){const r=c.active;requireValue(r&&known(r.id)&&integer(r.start)&&r.start<=s.tick&&s.tick-r.start<=600&&typeof r.signature==='string'&&r.signature.length<=20000,'essai de défi');for(const k of ['produced','catalysts','recovered','energy','returned','main','branch'] as const)requireValue(number(r[k]),'mesure de défi');requireValue(r.presses&&typeof r.presses==='object'&&!Array.isArray(r.presses)&&Object.keys(r.presses).length<=8&&Object.entries(r.presses).every(([id,n])=>/^\d+$/.test(id)&&number(n)),'presses de défi');}
 }
 return s;
}
export function serialize(s:State) {validate(s);return JSON.stringify(s);}
export function deserialize(text:string):State {requireValue(text.length<=4_000_000,'fichier trop grand');return validate(JSON.parse(text));}
export function persist(storage:Storage,s:State) {const json=serialize(s);const old=storage.getItem(SAVE_KEY);if(old){try{deserialize(old);storage.setItem(BACKUP_KEY,old);}catch{/* Keep the last valid backup. */}}storage.setItem(SAVE_KEY,json);}
export function restore(storage:Storage):{state:State|null;warning:string;blocked:boolean} {
 const raw=storage.getItem(SAVE_KEY);if(!raw)return {state:null,warning:'',blocked:false};
 try{return {state:deserialize(raw),warning:'',blocked:false};}catch{
   const backup=storage.getItem(BACKUP_KEY);if(backup)try{return {state:deserialize(backup),warning:'Sauvegarde principale illisible : copie précédente récupérée.',blocked:false};}catch{}
   return {state:null,warning:'Sauvegarde illisible conservée. Exportez-la ou importez une copie valide. Sauvegarde automatique suspendue.',blocked:true};
 }
}
