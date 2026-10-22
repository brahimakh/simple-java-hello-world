import {MODULES, LIMITS, UNLOCKS, type Kind, type Resource, type PlantId} from './content.ts';
export const DT = 0.1;
export interface Packet {qty:number; quality:number; kind:'matter'|'exhaust'; recovered:boolean; exchanged:boolean; energy:number; origin:PlantId;}
export interface Machine {id:number; kind:Kind; param:number; queue:Packet[]; clock:number; streak:number; last:number; working:Packet|null; connected:boolean; paid:number; status:string; processed:number;}
export interface Lane {id:number; name:string; machines:Machine[]; capsule:boolean;}
export interface Plant {stock:Record<Resource,number>; lanes:Lane[]; oreLevel:number; energyLevel:number; catalystOn:boolean;}
export interface Blueprint {name:string; machines:{kind:Kind;param:number;connected:boolean}[];}
export interface Configuration {name:string; plant:PlantId; lanes:Blueprint[];}
export interface Transfer {resource:'residue'|'catalyst'; from:PlantId; to:PlantId; rate:number; enabled:boolean; moved:number;}
export interface Pending {plant:PlantId; resource:Resource; qty:number;}
export interface Sample {tick:number; total:number;}
export interface State {version:1; tick:number; nextId:number; plants:Record<PlantId,Plant>; produced:number; catalystProduced:number; recovered:number; largestLot:number; peak:number; totalSpent:number; library:Blueprint[]; configurations:Configuration[]; transfers:Transfer[]; pending:Pending[]; history:Sample[]; log:{tick:number;text:string}[]; claimed:string[]; paused:boolean; fault:string|null;}
export const clone = <T>(x:T):T => structuredClone(x);
const emptyStock = ():Record<Resource,number> => ({ore:0,energy:0,components:0,residue:0,catalyst:0});
export function machine(s:State, kind:Kind, paid=MODULES[kind].cost):Machine {return {id:s.nextId++,kind,param:kind==='intake'?6:kind==='batch'?40:kind==='charge'?2:0,queue:[],clock:0,streak:0,last:-1000,working:null,connected:true,paid,status:'Prêt',processed:0};}
export function createState():State {
 const s:State={version:1,tick:0,nextId:1,plants:{A:{stock:{...emptyStock(),ore:120,energy:120,components:60},lanes:[],oreLevel:0,energyLevel:0,catalystOn:true},B:{stock:{...emptyStock(),energy:120},lanes:[],oreLevel:0,energyLevel:0,catalystOn:false}},produced:0,catalystProduced:0,recovered:0,largestLot:0,peak:0,totalSpent:0,library:[],configurations:[],transfers:[{resource:'residue',from:'A',to:'B',rate:20,enabled:true,moved:0},{resource:'catalyst',from:'B',to:'A',rate:4,enabled:true,moved:0}],pending:[],history:[{tick:0,total:0}],log:[],claimed:[],paused:false,fault:null};
 s.plants.A.lanes=[{id:s.nextId++,name:'Ligne 01',machines:[machine(s,'intake',0),machine(s,'press',0)],capsule:false}];
 note(s,'Fonderie en ligne. Votre première chaîne produit automatiquement.'); return s;
}
export function note(s:State,text:string) {s.log.unshift({tick:s.tick,text});s.log.length=Math.min(14,s.log.length);}
export function unlocked(s:State,k:Kind) {return s.produced>=MODULES[k].unlock;}
export function plantUnlocked(s:State,id:PlantId) {return id==='A'||s.produced>=1000;}
function credit(s:State,id:PlantId,r:Resource,qty:number) {s.pending.push({plant:id,resource:r,qty});}
function canCredit(s:State,id:PlantId,r:Resource,qty:number) {return s.plants[id].stock[r]+s.pending.filter(e=>e.plant===id&&e.resource===r).reduce((n,e)=>n+e.qty,0)+qty<=LIMITS.stock;}
export function buffer(m:Machine) {return m.queue.reduce((a,p)=>a+p.qty,0)+(m.working?.qty??0);}
function canSend(next:Machine|undefined,p:Packet) {return !next||(MODULES[next.kind].input===p.kind&&buffer(next)+p.qty<=LIMITS.queue+1e-8);}
function push(next:Machine|undefined,p:Packet) {if(next)next.queue.push(p);}
function spend(p:Plant,r:Resource,n:number) {if(p.stock[r]+1e-8<n)return false;p.stock[r]=Math.max(0,p.stock[r]-n);return true;}
function process(s:State,id:PlantId,m:Machine,next:Machine|undefined) {
 const plant=s.plants[id]; const now=s.tick*DT;
 if(!m.connected&&next) {m.status='Connexion ouverte · sortie arrêtée';return;}
 if(m.clock>0) {m.clock=Math.max(0,m.clock-DT);if(m.clock>1e-7){m.status=m.working?'Charge en cours':'Cycle en cours';return;}}
 const send=(p:Packet)=>{push(next,p);m.processed++;m.status='En fonctionnement';};
 if(m.kind==='intake') {
   const r=id==='A'?'ore':'residue';const p:Packet={qty:m.param,quality:1,kind:'matter',recovered:false,exchanged:false,energy:0,origin:id};
   if(!next){m.status='Relier une sortie';return;}
   if(!canSend(next,p)){m.status='Sortie saturée ou type incompatible';return;}
   if(!spend(plant,r,p.qty)){m.status=id==='A'?'Manque de matière':'Manque de résidus · vérifier le transfert';return;}
   send(p);m.clock=0.5;return;
 }
 if(m.working) {
   if(!canSend(next,m.working)){m.status='Sortie saturée ou type incompatible';return;}
   send(m.working);m.working=null;return;
 }
 if(!m.queue.length){m.status='Manque d’entrée';return;}
 let p=clone(m.queue[0]);
 if(p.kind!==MODULES[m.kind].input){m.status='Type d’entrée incompatible';return;}
 if(m.kind==='batch') {
   if(buffer(m)+1e-8<m.param){m.status=`Accumulation · ${Math.floor(buffer(m))}/${m.param}`;return;}
   let need=m.param,quality=0;
   for(const part of m.queue){const take=Math.min(need,part.qty);quality+=take*part.quality;need-=take;if(need<=1e-8)break;}
   p={...p,qty:m.param,quality:Math.max(1,quality/m.param)};
   if(!next){m.status='Relier une sortie';return;}
   if(!canSend(next,p)){m.status='Sortie saturée ou type incompatible';return;}
   need=m.param;
   while(need>1e-8){const head=m.queue[0];const take=Math.min(need,head.qty);head.qty-=take;need-=take;if(head.qty<1e-8)m.queue.shift();}
   send(p);m.clock=1;return;
 }
 if(!next&&p.kind==='matter'&&m.kind!=='press'){m.status='Relier une sortie';return;}
 if(!canSend(next,{...p,kind:MODULES[m.kind].output})){m.status='Sortie saturée ou type incompatible';return;}
 if(m.kind==='cadence') {
   m.streak=p.qty<=12?(now-m.last<=2.00001?Math.min(4,m.streak+1):1):0;
   m.last=now;p.quality*=1+m.streak;m.clock=0.1;
 } else if(m.kind==='charge') {
   const cost=0.2*p.qty*m.param;
   if(!spend(plant,'energy',cost)){m.status='Énergie insuffisante · charge';return;}
   p.quality*=1+m.param/2;m.clock=m.param;
   p.quality=Math.min(LIMITS.quality,p.quality);m.working=p;m.queue.shift();m.status='Charge en cours';return;
 } else if(m.kind==='sync') {
   if(plant.stock.catalyst<10){m.status='Seuil requis · 10 catalyseurs';return;}
   spend(plant,'catalyst',1);p.quality*=3;m.clock=0.5;
 } else if(m.kind==='press') {
   const cost=p.qty*(id==='A'?0.5:0.25);
   if(p.qty>LIMITS.packet){m.status='Lot trop grand · maximum 160';return;}
   const cat=id==='A'&&plant.catalystOn&&plant.stock.catalyst>=1?4:1;
   const result=id==='A'?p.qty/10*p.quality*(p.qty>=80?8:1)*cat:p.qty/20*p.quality;
   if(!canCredit(s,id,id==='A'?'components':'catalyst',result)||(id==='A'&&!canCredit(s,id,'residue',p.qty*.5))){m.status='Réserve de sortie saturée';return;}
   if(!spend(plant,'energy',cost)){m.status='Énergie insuffisante · pressage';return;}
   if(cat===4)spend(plant,'catalyst',1);
   if(id==='A') {credit(s,id,'components',result);credit(s,id,'residue',p.qty*0.5);s.produced+=result;s.peak=Math.max(s.peak,result);s.largestLot=Math.max(s.largestLot,p.qty);}
   else {credit(s,id,'catalyst',result);s.catalystProduced+=result;}
   p.kind='exhaust';p.energy=cost;m.clock=1;
 } else if(m.kind==='recovery') {
   if(!p.recovered&&p.origin==='A') {
     if(!canCredit(s,id,'ore',p.qty*.8)){m.status='Réserve de sortie saturée';return;}
     if(!spend(plant,'energy',p.qty*0.05)){m.status='Énergie insuffisante · récupération';return;}
     credit(s,id,'ore',p.qty*0.8);s.recovered+=p.qty*0.8;p.recovered=true;
   } m.clock=0.2;
 } else if(m.kind==='exchanger') {
   if(!p.exchanged&&p.origin==='A'){if(!canCredit(s,id,'energy',p.energy*.8)){m.status='Réserve de sortie saturée';return;}credit(s,id,'energy',p.energy*0.8);p.exchanged=true;}m.clock=0.2;
 }
 p.quality=Math.min(LIMITS.quality,p.quality);m.queue.shift();send(p);
}
export function step(s:State) {
 if(s.paused||s.fault)return;
 s.tick++;
 try {
   // All stock returns commit on the next tick; machines run downstream first.
   for(const e of s.pending.splice(0))s.plants[e.plant].stock[e.resource]=Math.min(LIMITS.stock,s.plants[e.plant].stock[e.resource]+e.qty);
   if(s.produced>=1e15){s.paused=true;note(s,'Limite numérique du prototype atteinte (10¹⁵ composants cumulés).');return;}
   for(const id of ['A','B'] as const) {
     if(!plantUnlocked(s,id))continue;const plant=s.plants[id];
     if(id==='A')plant.stock.ore=Math.min(LIMITS.stock,plant.stock.ore+12*2**plant.oreLevel*DT);
     plant.stock.energy=Math.min(LIMITS.stock,plant.stock.energy+8*2**plant.energyLevel*DT);
   }
   if(plantUnlocked(s,'B')) for(const t of s.transfers)if(t.enabled){const src=s.plants[t.from].stock,dst=s.plants[t.to].stock;const qty=Math.min(src[t.resource],t.rate*DT,LIMITS.stock-dst[t.resource]);src[t.resource]-=qty;dst[t.resource]+=qty;t.moved+=qty;}
   const before=s.produced;
   for(const id of ['A','B'] as const)if(plantUnlocked(s,id))for(const lane of s.plants[id].lanes)for(let i=lane.machines.length-1;i>=0;i--)process(s,id,lane.machines[i],lane.machines[i+1]);
   if(s.pending.length>LIMITS.events)throw Error('File d’événements dépassée');
   for(const u of UNLOCKS)if(before<u.at&&s.produced>=u.at)note(s,u.text);
   if(s.tick%10===0){s.history.push({tick:s.tick,total:s.produced});if(s.history.length>121)s.history.shift();}
   if(s.tick%100===0)for(const p of Object.values(s.plants))for(const n of Object.values(p.stock))if(!Number.isFinite(n)||n<0||n>LIMITS.stock+1)throw Error('Stock invalide');
 } catch(e) {s.fault=e instanceof Error?e.message:String(e);s.paused=true;note(s,`Diagnostic moteur : ${s.fault}`);}
}
export function simulate(s:State,seconds:number) {for(let i=0;i<Math.round(seconds/DT);i++)step(s);return s;}
export function measuredRate(s:State,seconds=60) {const end=s.history.at(-1)!;const start=s.history.find(x=>x.tick>=end.tick-seconds/DT)??end;const duration=(end.tick-start.tick)*DT;return {rate:duration>0?(end.total-start.total)/duration:0,duration};}
export function upgradeCost(level:number) {return 40*4**level;}
export function upgrade(s:State,id:PlantId,type:'oreLevel'|'energyLevel') {const p=s.plants[id];const cost=upgradeCost(p[type]);if(!plantUnlocked(s,id)||(id==='B'&&type==='oreLevel')||p[type]>=8||!spend(s.plants.A,'components',cost))return false;p[type]++;s.totalSpent+=cost;return true;}
export function addLane(s:State,id:PlantId,bp?:Blueprint) {
 if(!plantUnlocked(s,id)||s.plants[id].lanes.length>=LIMITS.lanes)return false;
 const spec=bp?.machines??[{kind:'intake' as Kind,param:6,connected:true},{kind:'press' as Kind,param:0,connected:true}];
 if(spec.length>LIMITS.nodes||spec.some(x=>!unlocked(s,x.kind)))return false;
 const cost=spec.reduce((n,x)=>n+MODULES[x.kind].cost,0);if(!spend(s.plants.A,'components',cost))return false;
 s.plants[id].lanes.push({id:s.nextId++,name:bp?.name??`Ligne ${s.plants[id].lanes.length+1}`,capsule:!!bp,machines:spec.map(x=>({...machine(s,x.kind),param:x.param,connected:x.connected}))});s.totalSpent+=cost;return true;
}
export function insertModule(s:State,id:PlantId,laneId:number,kind:Kind) {
 const lane=s.plants[id].lanes.find(l=>l.id===laneId);if(!lane||lane.machines.length>=LIMITS.nodes||!unlocked(s,kind)||kind==='intake'||kind==='press')return false;
 if(!spend(s.plants.A,'components',MODULES[kind].cost))return false;
 const m=machine(s,kind);const press=lane.machines.findIndex(x=>x.kind==='press');
 lane.machines.splice(MODULES[kind].input==='exhaust'?lane.machines.length:Math.max(1,press),0,m);s.totalSpent+=MODULES[kind].cost;return true;
}
function returnMachine(s:State,id:PlantId,m:Machine) {
 s.plants.A.stock.components=Math.min(LIMITS.stock,s.plants.A.stock.components+m.paid);
 const matter=m.queue.reduce((n,p)=>n+(p.kind==='matter'?p.qty:0),0)+(m.working?.kind==='matter'?m.working.qty:0);
 const r=id==='A'?'ore':'residue';s.plants[id].stock[r]=Math.min(LIMITS.stock,s.plants[id].stock[r]+matter);
 if(m.working)s.plants[id].stock.energy=Math.min(LIMITS.stock,s.plants[id].stock.energy+0.2*m.working.qty*m.param);
}
function canReturn(s:State,id:PlantId,ms:Machine[]) {const cost=ms.reduce((n,m)=>n+m.paid,0);const matter=ms.reduce((n,m)=>n+m.queue.reduce((a,p)=>a+(p.kind==='matter'?p.qty:0),0)+(m.working?.qty??0),0);const energy=ms.reduce((n,m)=>n+(m.working?.qty??0)*.2*m.param,0);return canCredit(s,'A','components',cost)&&canCredit(s,id,id==='A'?'ore':'residue',matter)&&canCredit(s,id,'energy',energy);}
export function removeModule(s:State,id:PlantId,laneId:number,machineId:number) {const lane=s.plants[id].lanes.find(l=>l.id===laneId);if(!lane)return false;const index=lane.machines.findIndex(m=>m.id===machineId);if(index<0||['intake','press'].includes(lane.machines[index].kind)||!canReturn(s,id,[lane.machines[index]]))return false;returnMachine(s,id,lane.machines[index]);lane.machines.splice(index,1);return true;}
export function removeLane(s:State,id:PlantId,laneId:number) {const p=s.plants[id];const lane=p.lanes.find(l=>l.id===laneId);if(!lane||!canReturn(s,id,lane.machines))return false;for(const m of lane.machines)returnMachine(s,id,m);p.lanes=p.lanes.filter(l=>l.id!==laneId);return true;}
export function moveModule(s:State,id:PlantId,laneId:number,machineId:number,direction:number) {const lane=s.plants[id].lanes.find(l=>l.id===laneId);if(!lane)return false;const i=lane.machines.findIndex(m=>m.id===machineId),j=i+direction;if(i<1||j<1||j>=lane.machines.length)return false;const a=lane.machines[i],b=lane.machines[j];if(a.kind==='press'||b.kind==='press'||MODULES[a.kind].input!==MODULES[b.kind].input)return false;[lane.machines[i],lane.machines[j]]=[b,a];return true;}
export function blueprint(lane:Lane,name:string):Blueprint {return {name:name.trim().slice(0,48)||'Invention',machines:lane.machines.map(m=>({kind:m.kind,param:m.param,connected:m.connected}))};}
export function encapsulate(s:State,id:PlantId,laneId:number,name:string) {const lane=s.plants[id].lanes.find(l=>l.id===laneId);if(!lane||s.produced<1000||s.library.length>=30)return false;lane.name=name.trim().slice(0,48)||'Invention';lane.capsule=true;s.library.push(blueprint(lane,lane.name));note(s,`Invention « ${lane.name} » enregistrée. Les cycles en cours sont conservés.`);return true;}
export function saveConfiguration(s:State,id:PlantId,name:string) {if(s.configurations.length>=20)return false;s.configurations.push({name:name.trim().slice(0,48)||'Configuration',plant:id,lanes:s.plants[id].lanes.map(l=>blueprint(l,l.name))});return true;}
export function loadConfiguration(s:State,index:number) {const c=s.configurations[index];if(!c)return false;const copy=clone(s);for(const l of [...copy.plants[c.plant].lanes])if(!removeLane(copy,c.plant,l.id))return false;for(const bp of c.lanes)if(!addLane(copy,c.plant,bp))return false;Object.assign(s,copy);return true;}
export const EXPERIMENTS = [
 {id:'first',name:'Premier accord',description:'Produire 50 composants cumulés.',reward:50,test:(s:State)=>s.produced>=50,progress:(s:State)=>s.produced/50},
 {id:'lot',name:'Matière critique',description:'Presser au moins un lot de 80 matières.',reward:180,test:(s:State)=>s.largestLot>=80,progress:(s:State)=>s.largestLot/80},
 {id:'loop',name:'Rien ne se perd',description:'Récupérer 500 matières.',reward:400,test:(s:State)=>s.recovered>=500,progress:(s:State)=>s.recovered/500},
 {id:'duet',name:'Dialogue industriel',description:'Produire 30 catalyseurs dans la Serre.',reward:1000,test:(s:State)=>s.catalystProduced>=30,progress:(s:State)=>s.catalystProduced/30},
 {id:'flow',name:'Régime établi',description:'Mesurer au moins 300 composants/s sur une fenêtre complète de 60 s.',reward:5000,test:(s:State)=>measuredRate(s).duration>=59.9&&measuredRate(s).rate>=300,progress:(s:State)=>Math.min(measuredRate(s).duration/60,measuredRate(s).rate/300)},
 {id:'final',name:'Le cœur de Résonance',description:'Produire 500 000 composants cumulés. Aucun reset : l’atelier reste ouvert.',reward:20000,test:(s:State)=>s.produced>=500000,progress:(s:State)=>s.produced/500000}
];
export function claim(s:State,id:string) {const e=EXPERIMENTS.find(x=>x.id===id);if(!e||s.claimed.includes(id)||!e.test(s))return false;s.claimed.push(id);s.plants.A.stock.components=Math.min(LIMITS.stock,s.plants.A.stock.components+e.reward);note(s,`Expérience validée : ${e.name}.`);return true;}
