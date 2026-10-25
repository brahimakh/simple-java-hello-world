import {MODULES, LIMITS, type Kind} from './content.ts';
import {type State} from './engine.ts';
export const SAVE_KEY='resonance-industrielle-v1';
export const BACKUP_KEY=SAVE_KEY+'-precedente';
function requireValue(ok:unknown,message:string):asserts ok {if(!ok)throw Error(`Sauvegarde invalide : ${message}`);}
function number(n:unknown,max=1e15) {return typeof n==='number'&&Number.isFinite(n)&&n>=0&&n<=max;}
function integer(n:unknown,max=1e12) {return number(n,max)&&Number.isSafeInteger(n);}
function label(n:unknown) {return typeof n==='string'&&n.length<=250;}
export function validate(value:unknown):State {
 requireValue(!!value&&typeof value==='object','objet attendu');const s=value as State;
 requireValue(s.version===1,'version non reconnue');
 for(const k of ['tick','nextId'] as const)requireValue(integer(s[k]),k);
 for(const k of ['produced','catalystProduced','recovered','largestLot','peak','totalSpent'] as const)requireValue(number(s[k]),k);
 requireValue(typeof s.paused==='boolean'&&(s.fault===null||label(s.fault)),'état du moteur');
 requireValue(s.plants&&Object.keys(s.plants).length===2,'installations');
 const ids=new Set<number>();
 const id=(n:number)=>{requireValue(integer(n)&&n>0&&n<s.nextId&&!ids.has(n),'identifiant');ids.add(n);};
 const route=(r:NonNullable<import('./engine.ts').Machine['routing']>|NonNullable<import('./engine.ts').Blueprint['machines'][number]['routing']>)=>{requireValue(r&&integer(r.target)&&['small','large','alternate','overflow'].includes(r.mode)&&[6,12,20,40,80,160].includes(r.threshold),'aiguillage');};
 const spec=(m:import('./engine.ts').Blueprint['machines'][number])=>{
   requireValue(Object.hasOwn(MODULES,m.kind),'module inconnu');
   requireValue(typeof m.connected==='boolean'&&number(m.param,160),'paramètre');
   requireValue(m.kind!=='batch'||[10,20,40,80,160].includes(m.param),'seuil de lot');
   requireValue(m.kind!=='intake'||[6,12].includes(m.param),'taille d’injection');
   requireValue(m.kind!=='charge'||[1,2,4,8].includes(m.param),'durée de charge');
   if(m.kind==='router')requireValue(m.routing,'aiguillage');
   if(m.routing){requireValue(m.kind==='router','aiguillage');route(m.routing);}
 };
 const packet=(p:import('./engine.ts').Packet)=>{requireValue(p&&number(p.qty,160)&&p.qty>0&&number(p.quality,LIMITS.quality)&&p.quality>=1&&(p.kind==='matter'||p.kind==='exhaust')&&typeof p.recovered==='boolean'&&typeof p.exchanged==='boolean'&&number(p.energy,80)&&['A','B'].includes(p.origin),'lot');requireValue((p.marks===undefined||number(p.marks,160))&&(p.stamped===undefined||typeof p.stamped==='boolean')&&(!(p.marks??0)||p.stamped===true),'empreintes');};
 const blueprint=(b:import('./engine.ts').Blueprint)=>{requireValue(b&&label(b.name)&&Array.isArray(b.machines)&&b.machines.length>=2&&b.machines.length<=LIMITS.nodes,'plan');b.machines.forEach(spec);requireValue(b.machines[0].kind==='intake'&&b.machines.filter(m=>m.kind==='intake').length===1&&b.machines.filter(m=>m.kind==='press').length===1,'structure de chaîne');};
 for(const pid of ['A','B'] as const){
   const p=s.plants[pid];requireValue(p&&p.stock&&Object.keys(p.stock).length===5,'réserves');
   for(const r of ['ore','energy','components','residue','catalyst'] as const)requireValue(number(p.stock[r],LIMITS.stock),'stock '+r);
   requireValue(integer(p.oreLevel,8)&&integer(p.energyLevel,8)&&typeof p.catalystOn==='boolean','améliorations');
   requireValue(Array.isArray(p.lanes)&&p.lanes.length<=LIMITS.lanes,'lignes');
   for(const l of p.lanes){id(l.id);blueprint(l);requireValue(typeof l.capsule==='boolean','capsule');for(const m of l.machines){
     id(m.id);requireValue(m.paid===0||m.paid===MODULES[m.kind].cost,'coût du module');
     requireValue(Array.isArray(m.queue)&&m.queue.length<=800,'file');m.queue.forEach(packet);if(m.working)packet(m.working);
     requireValue(m.working===null||m.kind==='charge','charge en cours');
     requireValue(m.queue.reduce((n,p)=>n+p.qty,0)+(m.working?.qty??0)<=LIMITS.queue+1e-6,'capacité');
     requireValue(number(m.clock,8)&&integer(m.streak,4)&&typeof m.last==='number'&&Number.isFinite(m.last)&&m.last>=-1000&&m.last<=s.tick*.1+1e-6&&label(m.status)&&integer(m.processed,1e15),'cycle');
     if(m.routing){requireValue(typeof m.routing.turn==='boolean'&&integer(m.routing.main,1e15)&&integer(m.routing.branch,1e15)&&(m.routing.lastBranch===undefined||typeof m.routing.lastBranch==='boolean')&&(m.routing.target===0||p.lanes.some(dest=>dest.id===m.routing!.target&&dest.id!==l.id)),'aiguillage');}
     if(m.lastPacket){const a=m.lastPacket;requireValue(integer(a.tick)&&a.tick<=s.tick&&number(a.qty,160)&&number(a.quality,LIMITS.quality)&&number(a.marks,160),'mesure');}
     if(m.made!==undefined)requireValue(number(m.made),'mesure');
   }}
 }
 if(s.transit!==undefined){requireValue(Array.isArray(s.transit)&&s.transit.length<=LIMITS.events,'transit');for(const e of s.transit){requireValue(e&&['A','B'].includes(e.plant)&&integer(e.target),'transit');packet(e.packet);const target=s.plants[e.plant].lanes.flatMap(l=>l.machines).find(m=>m.id===e.target);requireValue(target&&e.packet.kind==='matter'&&MODULES[target.kind].input==='matter','destination');}for(const p of Object.values(s.plants))for(const l of p.lanes)for(const m of l.machines){const queued=s.transit.filter(e=>e.target===m.id).reduce((n,e)=>n+e.packet.qty,0);requireValue(m.queue.reduce((n,p)=>n+p.qty,0)+(m.working?.qty??0)+queued<=LIMITS.queue+1e-6,'capacité');}}
 requireValue(Array.isArray(s.library)&&s.library.length<=30,'bibliothèque');s.library.forEach(blueprint);
 requireValue(Array.isArray(s.configurations)&&s.configurations.length<=20,'configurations');for(const c of s.configurations){requireValue(c&&label(c.name)&&['A','B'].includes(c.plant)&&Array.isArray(c.lanes)&&c.lanes.length<=6,'configuration');c.lanes.forEach(blueprint);if(c.laneIds!==undefined)requireValue(Array.isArray(c.laneIds)&&c.laneIds.length===c.lanes.length&&new Set(c.laneIds).size===c.laneIds.length&&c.laneIds.every(x=>integer(x)&&x>0),'configuration');}
 requireValue(Array.isArray(s.transfers)&&s.transfers.length===2,'transferts');s.transfers.forEach((t,i)=>requireValue(t&&t.resource===(i===0?'residue':'catalyst')&&t.from===(i===0?'A':'B')&&t.to===(i===0?'B':'A')&&t.rate===(i===0?20:4)&&typeof t.enabled==='boolean'&&number(t.moved),'route'));
 requireValue(Array.isArray(s.pending)&&s.pending.length<=LIMITS.events,'événements');for(const e of s.pending)requireValue(e&&['A','B'].includes(e.plant)&&['ore','energy','components','residue','catalyst'].includes(e.resource)&&number(e.qty,LIMITS.stock),'événement');
 requireValue(Array.isArray(s.history)&&s.history.length>=1&&s.history.length<=121,'historique');let t=-1,total=-1;for(const h of s.history){requireValue(h&&integer(h.tick)&&h.tick<=s.tick&&h.tick>t&&number(h.total)&&h.total>=total&&h.total<=s.produced,'mesure');t=h.tick;total=h.total;}
 requireValue(Array.isArray(s.log)&&s.log.length<=14,'journal');for(const l of s.log)requireValue(l&&integer(l.tick)&&l.tick<=s.tick&&label(l.text),'entrée de journal');
 requireValue(Array.isArray(s.claimed)&&s.claimed.length<=6&&new Set(s.claimed).size===s.claimed.length&&s.claimed.every(x=>['first','lot','loop','duet','flow','final'].includes(x)),'expériences');
 return s;
}
export function serialize(s:State) {validate(s);return JSON.stringify(s);}
export function deserialize(text:string):State {requireValue(text.length<=2_000_000,'fichier trop grand');return validate(JSON.parse(text));}
export function persist(storage:Storage,s:State) {const json=serialize(s);const old=storage.getItem(SAVE_KEY);if(old){try{deserialize(old);storage.setItem(BACKUP_KEY,old);}catch{/* Keep the last valid backup. */}}storage.setItem(SAVE_KEY,json);}
export function restore(storage:Storage):{state:State|null;warning:string;blocked:boolean} {
 const raw=storage.getItem(SAVE_KEY);if(!raw)return {state:null,warning:'',blocked:false};
 try{return {state:deserialize(raw),warning:'',blocked:false};}catch{
   const backup=storage.getItem(BACKUP_KEY);if(backup)try{return {state:deserialize(backup),warning:'Sauvegarde principale illisible : copie précédente récupérée.',blocked:false};}catch{}
   return {state:null,warning:'Sauvegarde illisible conservée. Exportez-la ou importez une copie valide. Sauvegarde automatique suspendue.',blocked:true};
 }
}
