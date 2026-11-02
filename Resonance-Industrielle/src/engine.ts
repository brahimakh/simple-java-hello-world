import {MODULES, LIMITS, UNLOCKS, PLANTS, PLANT_NAMES, PLANT_INPUT, PLANT_UNLOCK, MASTERY_FAMILIES, MODS, type Kind, type Resource, type PlantId} from './content.ts';
import {updateChallenge,type ChallengeState} from './challenges.ts';
import {siteDone,greenhouseFactor,greenhouseSpeed,doctrine,type SiteState,type CultureState} from './world.ts';
import {updateProgress,hasPatent,type ProgressState} from './progression.ts';
export const DT = 0.1;
export interface Packet {qty:number; quality:number; kind:'matter'|'exhaust'; recovered:boolean; exchanged:boolean; energy:number; origin:PlantId; marks?:number; stamped?:boolean; colors?:number; res?:number; loops?:number; charged?:number; split?:boolean; lane?:number; assembled?:boolean; echoed?:boolean;}
export type RouteMode='small'|'large'|'alternate'|'overflow'|'quality'|'marks'|'colors'|'energy';
export interface Routing {target:number;mode:RouteMode;threshold:number;turn:boolean;main:number;branch:number;lastBranch?:boolean;}
export interface LastPacket {tick:number;qty:number;quality:number;marks:number;result?:number;bulk?:number;catalysis?:number;plasma?:number;legacy?:number;bicolor?:boolean;synergy?:number;mold?:number;}
export interface Machine {id:number; kind:Kind; param:number; queue:Packet[]; clock:number; streak:number; last:number; working:Packet|null; connected:boolean; paid:number; status:string; processed:number; routing?:Routing;lastPacket?:LastPacket;made?:number;variant?:number;manual?:boolean;mods?:{id:string;paid:number}[];memory?:number;memoryAt?:number;heat?:number;}
export interface Lane {id:number; name:string; machines:Machine[]; capsule:boolean; fee?:number; syn?:Record<string,number>;}
export interface Plant {stock:Record<Resource,number>; lanes:Lane[]; oreLevel:number; energyLevel:number; catalystOn:boolean; plasmaOn?:boolean;}
export interface MachineSpec {kind:Kind;param:number;connected:boolean;variant?:number;routing?:{target:number;mode:RouteMode;threshold:number}}
export interface Blueprint {name:string; machines:MachineSpec[]; rating?:number; rate?:number;}
export interface Configuration {name:string; plant:PlantId; lanes:Blueprint[];laneIds?:number[];}
export interface Transfer {resource:'residue'|'catalyst'|'plasma'; from:PlantId; to:PlantId; rate:number; enabled:boolean; moved:number;}
export interface Pending {plant:PlantId; resource:Resource; qty:number;}
export interface Sample {tick:number; total:number;}
export interface Transit {plant:PlantId;target:number;packet:Packet;}
export type Variant='standard'|'slow'|'small'|'nores';
export interface State {version:1; tick:number; nextId:number; plants:Record<PlantId,Plant>; produced:number; catalystProduced:number; recovered:number; largestLot:number; peak:number; totalSpent:number; library:Blueprint[]; configurations:Configuration[]; transfers:Transfer[]; pending:Pending[]; history:Sample[]; log:{tick:number;text:string}[]; claimed:string[]; paused:boolean; fault:string|null;transit?:Transit[];challenges?:ChallengeState;
 plasmaProduced?:number; variant?:Variant; longHistory?:Sample[]; timeline?:{tick:number;text:string}[]; tierTicks?:number[]; discoveries?:{id:string;tick:number}[]; stats?:Record<string,number>; progress?:ProgressState; allowed?:Kind[]; puzzle?:string; mastery?:Partial<Record<Kind,number>>; tempo?:number; intro?:{keys:string[];last:number;bonus?:number}; sites?:SiteState; culture?:CultureState; doctrine?:string; protos?:{owned:string[];offer:string[]|null}; journey?:import('./journey.ts').JourneyState; specialty?:Kind; lastChange?:{tick:number;rate:number}; eurekas?:{tick:number;ratio:number;before:number;after:number}[];}
export const clone = <T>(x:T):T => structuredClone(x);
export const TRANSFERS:Omit<Transfer,'enabled'|'moved'>[] = [
 {resource:'residue',from:'A',to:'B',rate:20},{resource:'catalyst',from:'B',to:'A',rate:4},
 {resource:'catalyst',from:'B',to:'C',rate:20},{resource:'plasma',from:'C',to:'A',rate:4}
];
export const BASE_ENERGY:Record<PlantId,number> = {A:8,B:8,C:48};
export const emptyStock = ():Record<Resource,number> => ({ore:0,energy:0,components:0,residue:0,catalyst:0,plasma:0});
const defaultParam=(kind:Kind)=>kind==='intake'?6:kind==='batch'?40:kind==='charge'?2:kind==='filter'?5:kind==='compress'?4:kind==='sensor'?100:0;
export function machine(s:State, kind:Kind, paid=MODULES[kind].cost):Machine {return {id:s.nextId++,kind,param:defaultParam(kind),queue:[],clock:0,streak:0,last:-1000,working:null,connected:true,paid,status:'Prêt',processed:0,...(kind==='router'?{routing:{target:0,mode:'large' as RouteMode,threshold:40,turn:false,main:0,branch:0}}:kind==='relay'?{routing:{target:0,mode:'quality' as RouteMode,threshold:1000,turn:false,main:0,branch:0}}:{})};}
export function createState(variant:Variant='standard'):State {
 const s:State={version:1,tick:0,nextId:1,plants:{A:{stock:{...emptyStock(),ore:120,energy:120,components:60},lanes:[],oreLevel:0,energyLevel:0,catalystOn:true,plasmaOn:true},B:{stock:{...emptyStock(),energy:120},lanes:[],oreLevel:0,energyLevel:0,catalystOn:false},C:{stock:{...emptyStock(),energy:500},lanes:[],oreLevel:0,energyLevel:0,catalystOn:false}},produced:0,catalystProduced:0,plasmaProduced:0,recovered:0,largestLot:0,peak:0,totalSpent:0,library:[],configurations:[],transfers:TRANSFERS.map(t=>({...t,enabled:true,moved:0})),pending:[],history:[{tick:0,total:0}],log:[],claimed:[],paused:false,fault:null,variant,longHistory:[{tick:0,total:0}],timeline:[],tierTicks:[],discoveries:[],stats:{}};
 s.plants.A.lanes=[{id:s.nextId++,name:'Ligne 01',machines:[machine(s,'intake',0),machine(s,'press',0)],capsule:false}];
 note(s,'Fonderie en ligne. Votre première chaîne produit automatiquement.'); return s;
}
export function note(s:State,text:string) {s.log.unshift({tick:s.tick,text});s.log.length=Math.min(14,s.log.length);}
export function mark(s:State,text:string) {(s.timeline??=[]).push({tick:s.tick,text});if(s.timeline.length>80)s.timeline.splice(0,s.timeline.length-80);}
export function stat(s:State,key:string,n=1) {const st=(s.stats??={});st[key]=(st[key]??0)+n;}
export function discover(s:State,id:string) {const d=(s.discoveries??=[]);if(!d.some(x=>x.id===id)){d.push({id,tick:s.tick});mark(s,'découverte:'+id);boostIntro(s);
 // A discovery pays one minute of current production at once (at least 100 components).
 if(!s.puzzle){const r=Math.max(100,measuredRate(s).rate*TUNING.discoveryReward);s.plants.A.stock.components=Math.min(LIMITS.stock,s.plants.A.stock.components+r);stat(s,'discoveryReward',r);}}}
// Synergy: each distinct interaction that really acted on a line in the last 10 s multiplies its presses.
// Balance knobs in one place (measured by scripts/campaign.mjs; see BALANCE.md).
export const TUNING={synergy:1.2,synergyMax:12,discovery:1.05,discoveryReward:30,masteryGrowth:5,masteryFactor:2,masteryBase:1e7};
export const SYNERGY_WINDOW=100;
function syn(s:State,lane:Lane,key:string) {(lane.syn??={})[key]=s.tick;}
export function synergyKeys(s:State,lane:Lane) {return Object.entries(lane.syn??{}).filter(([,t])=>s.tick-t<=SYNERGY_WINDOW).map(([k])=>k);}
export function synergyFactor(s:State,lane:Lane) {return (TUNING.synergy+(proto(s,'synergy')?.1:0))**Math.min(TUNING.synergyMax,synergyKeys(s,lane).length);}
export const discoveryFactor=(s:State)=>TUNING.discovery**(s.discoveries?.length??0);
// Rules that depend on the run: variant, patents and refoundations. All of them are shown in the interface.
export const variantOf=(s:State):Variant=>s.variant??'standard';
export function unlockAt(s:State,k:Kind) {if(variantOf(s)==='nores'){if(k==='cadence')return Infinity;if(k==='harmonic')return 10;}return MODULES[k].unlock;}
// Pacing of novelties (new games only): a threshold makes a novelty possible; novelties then arrive one at a time,
// at least INTRO_GAP apart, never during the guided basics. The four families of the guide arrive at once.
export const INTRO_GAP=1200;
// Later mechanics are richer: the gap grows from 2 min to about 4 min 30 over the queue.
export const introGap=(s:State)=>INTRO_GAP+50*Math.max(0,(s.intro?.keys.length??0)-GUIDED.length);
// 1.3: playing well brings the next novelty sooner. Each discovery or Eurêka after the guide advances it by one minute
// (INTRO_BOOST), but two novelties are always at least INTRO_MIN apart.
export const INTRO_BOOST=600,INTRO_MIN=450;
export function introRemaining(s:State){const i=s.intro;if(!i)return 0;return Math.max(INTRO_MIN-(s.tick-i.last),introGap(s)-(s.tick-i.last)-(i.bonus??0),0);}
export function boostIntro(s:State){if(!paced(s)||!s.intro||s.journey!.step<JOURNEY_STEPS)return;s.intro.bonus=Math.min(3*INTRO_BOOST,(s.intro.bonus??0)+INTRO_BOOST);}
// Features other than machines also arrive through the queue, one at a time (prototypes, molds, contracts…).
export const FEATURES:Record<string,{at:number;name:string;text:string}>={
 proto:{at:1e4,name:'Prototypes',text:'À chaque palier, choisissez une machine unique parmi trois : elle change une règle pour toute la partie.'},
 molds:{at:5e4,name:'Moules de presse',text:'Touchez une presse : un moule change les lots qu’elle préfère (ressort, engrenage, cristal).'},
 contracts:{at:1e5,name:'Contrats',text:'Des commandes à remplir contre des points de brevet. Ouvrez Expériences.'},
 mastery:{at:1e6,name:'Maîtrises',text:'Investissez vos composants pour doubler l’effet d’une famille de machines.'},
 amber:{at:3e6,name:'Empreinte ambre',text:'Le marqueur peut laisser une empreinte ambre. Deux couleurs sur un lot : le tisseur double encore.'},
 culture:{at:1e7,name:'Serre vivante',text:'La Serre sélectionne ses souches : croisez-les et suivez les saisons.'},
 magenta:{at:3e7,name:'Empreinte magenta',text:'Troisième couleur. Un lot aux trois couleurs devient prismatique : ×5.'},
 slots:{at:1e9,name:'Emplacements d’amélioration',text:'Chaque machine reçoit un emplacement : turbo, tampon, marque ou stabilisateur.'},
 sites:{at:1e10,name:'Chantiers',text:'Six grands projets livrés depuis vos réserves, chacun change une règle. Ouvrez Monde.'}};
export const featureOpen=(s:State,key:string)=>s.produced>=FEATURES[key].at&&introduced(s,key);
export const noveltyName=(key:string)=>key.startsWith('plant-')?PLANT_NAMES[key.slice(6) as PlantId]:FEATURES[key]?.name??MODULES[key as Kind].name;
export const GUIDED:Kind[]=['cadence','stamp','batch','weave'];
export const paced=(s:State)=>!!s.journey&&!s.puzzle;
export const introduced=(s:State,key:string)=>!paced(s)||!!s.intro?.keys.includes(key);
export function unlocked(s:State,k:Kind) {if(s.allowed&&k!=='intake'&&k!=='press'&&!s.allowed.includes(k))return false;return s.produced>=unlockAt(s,k)&&(k==='intake'||k==='press'||introduced(s,k));}
export function introQueue(s:State){
 const items:{key:string;at:number}[]=[...(Object.keys(MODULES) as Kind[]).filter(k=>k!=='intake'&&k!=='press'&&unlockAt(s,k)<Infinity).map(k=>({key:k,at:unlockAt(s,k)})),{key:'plant-B',at:plantUnlockAt(s,'B')},{key:'plant-C',at:plantUnlockAt(s,'C')},...Object.entries(FEATURES).map(([key,f])=>({key,at:f.at}))];
 return items.filter(x=>!s.intro?.keys.includes(x.key)).sort((a,b)=>a.at-b.at||Number(b.key.startsWith('plant-'))-Number(a.key.startsWith('plant-')));
}
export function updateIntro(s:State){
 if(!paced(s))return null;const intro=(s.intro??={keys:[],last:-INTRO_GAP});const guided=s.journey!.step<JOURNEY_STEPS;
 for(const k of GUIDED)if(s.produced>=unlockAt(s,k)&&!intro.keys.includes(k)){intro.keys.push(k);return k;}
 if(guided||introRemaining(s)>0)return null;
 const next=introQueue(s).find(x=>!GUIDED.includes(x.key as Kind));if(!next||s.produced<next.at)return null;
 intro.keys.push(next.key);intro.last=s.tick;intro.bonus=0;const name=noveltyName(next.key);
 note(s,`Nouvelle possibilité : ${name}.`);mark(s,'nouveauté:'+next.key);return next.key;
}
export const JOURNEY_STEPS=9;
export function plantUnlockAt(s:State,id:PlantId) {return id==='C'&&(s.progress?.refounds??0)>0?1e4:PLANT_UNLOCK[id];}
export function plantUnlocked(s:State,id:PlantId) {return s.produced>=plantUnlockAt(s,id)&&(id==='A'||introduced(s,'plant-'+id));}
export const lanesMax=(s:State)=>LIMITS.lanes+(hasPatent(s,'lanes')?2:0);
export const nodesMax=(s:State)=>LIMITS.nodes+(hasPatent(s,'nodes')?2:0);
export const proto=(s:State,id:string)=>!!s.protos?.owned.includes(id);
export const packetMax=(s:State)=>(variantOf(s)==='small'?40:hasPatent(s,'packet')?320:LIMITS.packet)*(proto(s,'big-lot')?2:1)*(doctrine(s,'masse')?2:1);
export const bulkAt=(s:State)=>variantOf(s)==='small'?40:80;
export const catalysisFactor=(s:State)=>hasPatent(s,'catalysis')?6:4;
export const transferFactor=(s:State)=>(hasPatent(s,'transfer')?4:1)*(proto(s,'pipelines')?3:1)*(siteDone(s,'pont')?2:1);
export const tempoOf=(s:State)=>s.tempo??120;
export const beatTicks=(s:State)=>Math.round(600/tempoOf(s));
export const legacyFactor=(s:State)=>s.progress?.legacy??1;
export const masteryLevel=(s:State,k:Kind)=>s.mastery?.[k]??0;
export const MASTERY_FACTOR=2;
const mf=(s:State,k:Kind)=>TUNING.masteryFactor**(masteryLevel(s,k)+(s.specialty===k?1:0)+(k==='weave'&&doctrine(s,'lumiere')?1:0));
// One shared price ladder: every level bought, in any family, raises the price of the next one.
export const MASTERY_GROWTH=3.2;
export const masteryTotal=(s:State)=>Object.values(s.mastery??{}).reduce((n,v)=>n+(v??0),0);
export function masteryCost(s:State,_k?:Kind) {return Math.round(TUNING.masteryBase*TUNING.masteryGrowth**masteryTotal(s));}
export function buyMastery(s:State,k:Kind) {
 if(!MASTERY_FAMILIES.includes(k)||!featureOpen(s,'mastery')||!unlocked(s,k)||masteryLevel(s,k)>=40)return false;
 const cost=masteryCost(s,k);if(!spend(s.plants.A,'components',cost))return false;(s.mastery??={})[k]=masteryLevel(s,k)+1;s.totalSpent+=cost;return true;
}
// Each extra line of a facility costs more; the fee is refunded when the line is dismantled.
export function laneFee(s:State,id:PlantId) {const n=s.plants[id].lanes.length;return n===0?0:Math.round(100*8**(n-1)*(id==='C'?1e4:id==='B'?10:1));}
export function ownedCount(s:State,k:Kind) {let n=0;for(const id of PLANTS)for(const l of s.plants[id].lanes)for(const m of l.machines)if(m.kind===k&&m.paid>0)n++;return n;}
// Each additional copy of a family costs 15 % more; a refund always returns what was actually paid.
export function costOf(s:State,k:Kind,extra=0) {return Math.round(MODULES[k].cost*1.15**(ownedCount(s,k)+extra));}
function credit(s:State,id:PlantId,r:Resource,qty:number) {s.pending.push({plant:id,resource:r,qty});}
function canCredit(s:State,id:PlantId,r:Resource,qty:number) {return s.plants[id].stock[r]+s.pending.filter(e=>e.plant===id&&e.resource===r).reduce((n,e)=>n+e.qty,0)+qty<=LIMITS.stock;}
export function buffer(m:Machine) {return m.queue.reduce((a,p)=>a+p.qty,0)+(m.working?.qty??0);}
export function incoming(s:State,m:Machine) {return (s.transit??[]).filter(e=>e.target===m.id).reduce((n,e)=>n+e.packet.qty,0);}
// A press queues at most one large batch, so a new setting reaches it within seconds; other machines buffer up to 800.
export const hasMod=(m:Machine,id:string)=>!!m.mods?.some(x=>x.id===id);
export const capacity=(s:State,m:Machine)=>(m.kind==='press'?packetMax(s):LIMITS.queue)*(hasMod(m,'tampon')?2:1);
function canSend(s:State,next:Machine|undefined,p:Packet) {return !next||(MODULES[next.kind].input===p.kind&&buffer(next)+incoming(s,next)+p.qty<=capacity(s,next)+1e-8);}
function blocked(next:Machine|undefined,p:Packet) {return next&&MODULES[next.kind].input!==p.kind?'Type d’entrée incompatible avec la carte suivante':next?.kind==='press'?'Sortie saturée · la presse est encore occupée':'Sortie saturée · la carte suivante est pleine';}
function push(next:Machine|undefined,p:Packet) {if(next)next.queue.push(p);}
function spend(p:Plant,r:Resource,n:number) {if(p.stock[r]+1e-8<n)return false;p.stock[r]=Math.max(0,p.stock[r]-n);return true;}
const colorsOf=(p:Packet)=>p.colors??(p.stamped?1:0);
function merge(parts:{p:Packet;take:number}[],qty:number):Partial<Packet> {
 let quality=0,marks=0,colors=0,stamped=false,res=0,loops=0;
 for(const {p,take} of parts){quality+=take*p.quality;marks+=(p.marks??0)*take/p.qty;colors|=colorsOf(p);stamped||=p.stamped??false;res=Math.max(res,p.res??0);loops=Math.max(loops,p.loops??0);}
 const lane=parts[0]?.p.lane;
 return {qty,quality:Math.max(1,quality/qty),marks:Math.min(160,marks),stamped,...(lane!==undefined?{lane}:{}),...(colors?{colors}:{}),...(res?{res}:{}),...(loops?{loops}:{})};
}
const PRESS:Record<PlantId,{divisor:number;energy:number}> = {A:{divisor:10,energy:.5},B:{divisor:20,energy:.25},C:{divisor:40,energy:1}};
function process(s:State,id:PlantId,lane:Lane,m:Machine,next:Machine|undefined) {
 const plant=s.plants[id]; const now=s.tick*DT;
 if(m.kind==='furnace'&&m.heat)m.heat=Math.max(0,m.heat*(1-(hasPatent(s,'furnace')?.05:.1)*DT));
 if(m.kind==='mirror'&&m.memory!==undefined&&s.tick-(m.memoryAt??0)>30){delete m.memory;delete m.memoryAt;}
 if(!m.connected&&(next||m.kind==='router'||m.kind==='relay')) {m.status='Connexion ouverte · sortie arrêtée';return;}
 if(m.clock>0) {m.clock=Math.max(0,m.clock-DT);if(m.clock>1e-7){m.status=m.working?'Charge en cours':'Cycle en cours';return;}}
 let pressFactors:Partial<LastPacket>|undefined;
 const record=(p:Packet)=>{m.lastPacket={tick:s.tick,qty:p.qty,quality:p.quality,marks:p.marks??0,...pressFactors};m.processed++;m.status='En fonctionnement';};
 const markOut=(p:Packet)=>{if(p.kind==='matter'&&hasMod(m,'marque')&&!(colorsOf(p)&1)){p.marks=(p.marks??0)+1;p.colors=colorsOf(p)|1;p.stamped=true;}return p;};
 const send=(p:Packet)=>{push(next,markOut(p));record(p);};
 if(m.kind==='intake') {
   const r=PLANT_INPUT[id];const p:Packet={qty:m.param,quality:1,kind:'matter',recovered:false,exchanged:false,energy:0,origin:id,lane:lane.id};
   if(m.manual){m.status='Attend votre signal';return;}
   if(!next){m.status='Relier une sortie';return;}
   if(!canSend(s,next,p)){m.status=blocked(next,p);return;}
   if(!spend(plant,r,p.qty)){m.status=id==='A'?'Manque de matière · améliorez l’extraction':id==='B'?'Manque de résidus · vérifier le transfert':'Manque de catalyseurs · vérifier le transfert';return;}
   send(p);m.clock=0.5;return;
 }
 if(m.working) {
   if(!canSend(s,next,m.working)){m.status=blocked(next,m.working);return;}
   send(m.working);m.working=null;return;
 }
 if(!m.queue.length){m.status='En attente d’un lot';return;}
 let p=clone(m.queue[0]);
 if(p.kind!==MODULES[m.kind].input){m.status='Type d’entrée incompatible';return;}
 if(m.kind==='batch') {
   if(buffer(m)+1e-8<m.param){m.status=`Accumulation · ${Math.floor(buffer(m))}/${m.param}`;return;}
   let need=m.param;const parts:{p:Packet;take:number}[]=[];
   for(const part of m.queue){const take=Math.min(need,part.qty);parts.push({p:part,take});need-=take;if(need<=1e-8)break;}
   p={...p,...merge(parts,m.param)};if(proto(s,'max-batch'))p.quality=Math.max(...parts.map(x=>x.p.quality));
   if(!next){m.status='Relier une sortie';return;}
   if(!canSend(s,next,p)){m.status=blocked(next,p);return;}
   need=m.param;
   while(need>1e-8){const head=m.queue[0];const take=Math.min(need,head.qty);if(head.marks)head.marks*=Math.max(0,1-take/head.qty);head.qty-=take;need-=take;if(head.qty<1e-8)m.queue.shift();}
   send(p);m.clock=1;return;
 }
 if(m.kind==='compress') {
   if(m.queue.length<m.param){m.status=`Compression · ${m.queue.length}/${m.param} lots`;return;}
   const parts=m.queue.slice(0,m.param).map(x=>({p:x,take:x.qty}));const total=parts.reduce((n,x)=>n+x.take,0);
   const merged=merge(parts,total);
   p={...p,...merged,qty:total/m.param,quality:Math.min(LIMITS.quality,merged.quality!*m.param*.85*mf(s,'compress')),marks:Math.min(160,parts.reduce((n,x)=>n+(x.p.marks??0),0))};
   if(!next){m.status='Relier une sortie';return;}
   if(!canSend(s,next,p)){m.status=blocked(next,p);return;}
   m.queue.splice(0,m.param);send(p);m.clock=1;stat(s,'compress');discover(s,'compress');syn(s,lane,'compress');return;
 }
 if(m.kind==='router'||m.kind==='relay') {
   const r=m.routing;if(!r){m.status='Configurer l’aiguillage';return;}
   const branch=s.plants[id].lanes.find(l=>l.id===r.target)?.machines[1];
   const hues=[1,2,4].filter(b=>colorsOf(p)&b).length;
   const useBranch=r.mode==='small'?p.qty<=r.threshold:r.mode==='large'?p.qty>=r.threshold:r.mode==='alternate'?r.turn:r.mode==='quality'?p.quality>=r.threshold:r.mode==='marks'?(p.marks??0)>=r.threshold:r.mode==='colors'?hues>=r.threshold:r.mode==='energy'?plant.stock.energy<r.threshold:!next||!canSend(s,next,p);
   if(m.kind==='relay'&&useBranch){stat(s,'relayed');discover(s,'relay');syn(s,lane,'relay');}
   // 1.3: without a destination line, lots simply continue on their own line (a new switch never blocks a line).
   const branched=useBranch&&!!branch;const target=branched?branch:next;
   if(!target){m.status=useBranch?'Choisir une ligne de destination':'Relier une sortie';return;}
   if(!canSend(s,target,p)){m.status=blocked(target,p);return;}
   (s.transit??=[]).push({plant:id,target:target.id,packet:p});m.queue.shift();m.clock=.2;
   if(branched)r.branch++;else r.main++;if(r.branch>0&&r.main>0)discover(s,'branch');r.lastBranch=branched;if(r.mode==='alternate')r.turn=!r.turn;record(p);
   if(useBranch&&!branch)m.status='Sans destination · les lots continuent tout droit';return;
 }
 if(m.kind==='filter') {
   const back=lane.machines[1];
   if(p.quality+1e-9<m.param&&(p.loops??0)<8&&back&&back!==m){
     const returned={...p,loops:(p.loops??0)+1,quality:Math.min(LIMITS.quality,p.quality*(proto(s,'loop-boost')?1.5:1))};
     if(!canSend(s,back,returned)){m.status='Retour saturé · le lot attend';return;}
     (s.transit??=[]).push({plant:id,target:back.id,packet:returned});m.queue.shift();m.clock=.1;stat(s,'loops');syn(s,lane,'refine');record(returned);m.status='Lot renvoyé en amont';return;
   }
   if((p.loops??0)>0&&p.quality+1e-9>=m.param)discover(s,'refine');
   if(!next){m.status='Relier une sortie';return;}
   if(!canSend(s,next,p)){m.status=blocked(next,p);return;}
   m.queue.shift();send(p);m.clock=.1;return;
 }
 if(m.kind==='assembler') {
   const partner=m.queue.findIndex((q,i)=>i>0&&(q.lane??-1)!==(p.lane??-1)&&q.qty+p.qty<=packetMax(s)+1e-9);
   if(partner<0){
     if(m.memoryAt===undefined)m.memoryAt=s.tick;
     if(s.tick-m.memoryAt<30){m.status='Attend un lot d’une autre ligne';return;}
     if(!next){m.status='Relier une sortie';return;}if(!canSend(s,next,p)){m.status=blocked(next,p);return;}
     delete m.memoryAt;m.queue.shift();send(p);m.clock=.5;return;
   }
   const q=m.queue[partner];
   const fused:Packet={...p,qty:p.qty+q.qty,quality:Math.min(LIMITS.quality,p.quality*q.quality),marks:Math.min(160,(p.marks??0)+(q.marks??0)),stamped:!!(p.stamped||q.stamped),colors:colorsOf(p)|colorsOf(q),res:Math.max(p.res??0,q.res??0),loops:Math.max(p.loops??0,q.loops??0),assembled:true};
   if(!fused.colors)delete fused.colors;
   if(!next){m.status='Relier une sortie';return;}if(!canSend(s,next,fused)){m.status=blocked(next,fused);return;}
   delete m.memoryAt;m.queue.splice(partner,1);m.queue.shift();send(fused);m.clock=.5;stat(s,'assembly');syn(s,lane,'assembly');discover(s,'assembly');if(fused.quality>=1e4)discover(s,'assembly-rich');return;
 }
 if(m.kind==='metronome') {
   if(s.tick%beatTicks(s)!==0){m.status='Attend le temps';return;}
   const lifted={...p,quality:Math.min(LIMITS.quality,p.quality*(1+(siteDone(s,'orgue')?120:60)/tempoOf(s))),beat:s.tick} as Packet;
   if(!next){m.status='Relier une sortie';return;}if(!canSend(s,next,lifted)){m.status=blocked(next,lifted);return;}
   m.queue.shift();send(lifted);syn(s,lane,'tempo');stat(s,'beats');return;
 }
 if(m.kind==='echo') {
   if(m.memory!==undefined&&s.tick-(m.memoryAt??0)>30){delete m.memory;delete m.memoryAt;}
   const original=p.marks??0;
   if(!next){m.status='Relier une sortie';return;}if(!canSend(s,next,p)){m.status=blocked(next,p);return;}
   if(!p.echoed&&m.memory){p.marks=Math.min(160,original+m.memory);p.stamped=true;if(!p.colors)p.colors=1;p.echoed=true;syn(s,lane,'echo');stat(s,'echoes');discover(s,'echo');}
   m.memory=original;m.memoryAt=s.tick;m.queue.shift();send(p);m.clock=.1;return;
 }
 if(m.kind==='split') {
   if(!next){m.status='Relier une sortie';return;}
   if(!canSend(s,next,p)){m.status=blocked(next,p);return;}
   const half:Packet={...p,qty:p.qty/2,marks:(p.marks??0)/2,split:true};if(proto(s,'split-mark')&&!(colorsOf(half)&1)){half.marks=(half.marks??0)+1;half.colors=colorsOf(half)|1;half.stamped=true;}
   m.queue.shift();push(next,markOut({...half}));push(next,markOut({...half}));record(half);m.clock=.2;stat(s,'split');syn(s,lane,'split');return;
 }
 if(!next&&p.kind==='matter'&&m.kind!=='press'){m.status='Relier une sortie';return;}
 if(!canSend(s,next,{...p,kind:MODULES[m.kind].output})){m.status=blocked(next,{...p,kind:MODULES[m.kind].output});return;}
 if(m.kind==='stamp') {
   const bit=m.variant===2?4:m.variant===1?2:1;const colors=colorsOf(p);
   if(!(colors&bit)){p.marks=(p.marks??0)+1;p.colors=colors|bit;p.stamped=true;}m.clock=.1;
 } else if(m.kind==='weave') {
   const marks=proto(s,'double-weave')?Math.min(14,2*(p.marks??0)):Math.min(7,p.marks??0);p.quality*=1+marks;if(marks>0){p.quality*=mf(s,'weave');syn(s,lane,'weave');}
   const hues=[1,2,4].filter(b=>colorsOf(p)&b).length;const bicolor=hues>=2&&marks>0;
   if(bicolor&&hues===3){p.quality*=5;stat(s,'prism');syn(s,lane,'prism');discover(s,'prism');}
   else if(bicolor){p.quality*=2;stat(s,'bicolor');syn(s,lane,'bicolor');discover(s,'bicolor');}
   if(marks>=7)discover(s,'weave8');if(marks>=3&&!p.split)discover(s,'order');
   p.marks=0;m.clock=.2;
 } else if(m.kind==='cadence') {
   const win=(m.variant===1?1:m.variant===2?4:2)*(proto(s,'long-accord')?3:1),maxAccord=m.variant===1?5:m.variant===2?3:4;
   m.streak=p.qty<=12?(now-m.last<=win+1e-5||hasMod(m,'stabilisateur')?Math.min(maxAccord,m.streak+1):1):0;
   m.last=now;const rank=(p.res??0)+1;const divisor=hasPatent(s,'resonance')?Math.max(1,rank-1):rank;
   p.quality*=1+m.streak/divisor;if(m.streak>0){p.res=rank;p.quality*=mf(s,'cadence');syn(s,lane,'accord');}m.clock=0.1;
   if(m.streak>=4)discover(s,'accord');if(m.streak>=5)discover(s,'accord5');if(p.split&&m.streak>0)discover(s,'split');
 } else if(m.kind==='charge') {
   const cost=0.2*p.qty*m.param;
   if(!spend(plant,'energy',cost)){m.status='Énergie insuffisante · charge';return;}
   p.quality*=(1+m.param/2)*mf(s,'charge');syn(s,lane,'charge');p.charged=(p.charged??0)+1;if(p.charged>=2)discover(s,'charge-loop');m.clock=m.param*(proto(s,'quick-charge')?.5:1);
   p.quality=Math.min(LIMITS.quality,p.quality);m.working=p;m.queue.shift();m.status='Charge en cours';return;
 } else if(m.kind==='sync') {
   if(plant.stock.catalyst<10){m.status='Seuil requis · 10 catalyseurs';return;}
   spend(plant,'catalyst',1);p.quality*=3*mf(s,'sync');syn(s,lane,'sync');m.clock=0.5;if(p.loops)discover(s,'sync-loop');
 } else if(m.kind==='mirror') {
   const original=p.quality;
   if(m.memory!==undefined&&m.memory>p.quality){
     const cost=.2*p.qty;if(!spend(plant,'energy',cost)){m.status='Énergie insuffisante · reflet';return;}
     if(m.memory>=p.quality*10)discover(s,'mirror');p.quality=m.memory;stat(s,'mirror');syn(s,lane,'mirror');
   }
   m.memory=original;m.memoryAt=s.tick;m.clock=.2;
 } else if(m.kind==='furnace') {
   if(!spend(plant,'energy',.1*p.qty)){m.status='Énergie insuffisante · four';return;}
   m.heat=Math.min(100,(m.heat??0)+p.qty/10);p.quality*=(1+m.heat/25)*mf(s,'furnace');if(m.heat>=20)syn(s,lane,'furnace');if(m.heat>=80)discover(s,'blaze');m.clock=.1;
 } else if(m.kind==='harmonic') {
   const partner=plant.lanes.some(l=>l.id!==lane.id&&l.machines.some(o=>o.kind==='harmonic'&&now-o.last<=.10001));
   if(partner){p.quality*=3*mf(s,'harmonic');syn(s,lane,'harmony');if((p as {beat?:number}).beat)discover(s,'tempo');stat(s,'harmony');discover(s,'harmony');}m.last=now;m.clock=.1;
 } else if(m.kind==='sensor') {
   const r:Resource=(['energy','catalyst',PLANT_INPUT[id],'plasma'] as Resource[])[m.variant??0]??'energy';
   if(plant.stock[r]+1e-9<m.param){m.status='Capteur · seuil non atteint';return;}m.clock=.1;
 } else if(m.kind==='press') {
   const def=PRESS[id];const cost=p.qty*def.energy;
   if(p.qty>packetMax(s)+1e-9){m.status=`Lot trop grand · maximum ${packetMax(s)}`;return;}
   const cat=id==='A'&&plant.catalystOn&&plant.stock.catalyst>=1?catalysisFactor(s):1;
   const plasma=id==='A'&&plant.plasmaOn!==false&&plant.stock.plasma>=1?(siteDone(s,'phare')?20:10):1;
   const bulk=id==='A'&&p.qty>=bulkAt(s)?8*mf(s,'batch'):1;const legacy=id==='A'?legacyFactor(s):1;
   if(bulk>1)syn(s,lane,'bulk');if(cat>1)syn(s,lane,'catalysis');if(plasma>1)syn(s,lane,'plasma');
   const synergy=synergyFactor(s,lane),known=id==='A'?discoveryFactor(s):1;
   const hot=proto(s,'hot-press')&&lane.machines.some(x=>x.kind==='furnace'&&(x.heat??0)>50)?2:1;
   const moldKind=m.variant??0;const mold=moldKind===1?(p.qty<=12?3:.5):moldKind===2?(bulk>1?1.5:.5):moldKind===3?4:1;
   const result=p.qty/def.divisor*p.quality*bulk*cat*plasma*legacy*synergy*known*mold*hot*(id==='A'&&siteDone(s,'tour')?4:1)*(id==='B'?greenhouseFactor(s)*(siteDone(s,'jardin')?10:1):1);
   const out:Resource=id==='A'?'components':id==='B'?'catalyst':'plasma';
   if(!canCredit(s,id,out,result)||(id==='A'&&!canCredit(s,id,'residue',p.qty*.5))){m.status='Réserve de sortie saturée';return;}
   if(!spend(plant,'energy',cost)){m.status='Énergie insuffisante · pressage';return;}
   if(cat>1)spend(plant,'catalyst',1);if(plasma>1){spend(plant,'plasma',1);discover(s,'plasma');}
   pressFactors={result,bulk,catalysis:cat,...(synergy>1?{synergy}:{}),...(mold!==1?{mold}:{}),...(plasma>1?{plasma}:{}),...(legacy>1?{legacy}:{})};
   credit(s,id,out,result);
   if(id==='A') {credit(s,id,'residue',p.qty*0.5);s.produced+=result;s.peak=Math.max(s.peak,result);s.largestLot=Math.max(s.largestLot,p.qty);
     stat(s,'lots');if(bulk>1){stat(s,'lots80');discover(s,'bulk');}if(cat>1)discover(s,'catalysis');
     for(let k=1;k<=12&&p.quality>=10**k;k++)stat(s,'q'+k);
     if(p.quality>=1e6)discover(s,'quality6');if(result>=1e9)discover(s,'press9');}
   else if(id==='B'){s.catalystProduced+=result;}
   else {s.plasmaProduced=(s.plasmaProduced??0)+result;}
   m.made=(m.made??0)+result;
   if(moldKind){stat(s,['','springs','gears','crystals'][moldKind]);if(mold>1)discover(s,['','spring','gear','crystal'][moldKind]);}
   p.kind='exhaust';p.energy=cost;m.clock=(variantOf(s)==='slow'?2:1)*(moldKind===3?3:1)/(id==='B'?greenhouseSpeed(s):1);
 } else if(m.kind==='recovery') {
   if(!p.recovered&&(p.origin==='A'||p.origin==='B')) {
     const r=PLANT_INPUT[p.origin];
     if(!canCredit(s,id,r,p.qty*.8)){m.status='Réserve de sortie saturée';return;}
     if(!spend(plant,'energy',p.qty*0.05)){m.status='Énergie insuffisante · récupération';return;}
     credit(s,id,r,p.qty*(doctrine(s,'ecologie')?1:.8));syn(s,lane,'recovery');if(p.origin==='A')s.recovered+=p.qty*0.8;else discover(s,'greenhouse-loop');p.recovered=true;
   } m.clock=0.2;
 } else if(m.kind==='exchanger') {
   if(!p.exchanged){if(!canCredit(s,id,'energy',p.energy*.8)){m.status='Réserve de sortie saturée';return;}credit(s,id,'energy',p.energy*(doctrine(s,'ecologie')?1:.8));p.exchanged=true;}m.clock=0.2;
 }
 p.quality=Math.min(LIMITS.quality,p.quality);m.queue.shift();send(p);
}
export function step(s:State) {
 if(s.paused||s.fault)return;
 s.tick++;
 try {
   // All stock returns commit on the next tick; machines run downstream first.
   for(const e of s.pending.splice(0))s.plants[e.plant].stock[e.resource]=Math.min(LIMITS.stock,s.plants[e.plant].stock[e.resource]+e.qty);
   for(const e of (s.transit??=[]).splice(0)){const target=s.plants[e.plant].lanes.flatMap(l=>l.machines).find(m=>m.id===e.target);if(!target)throw Error('Destination en transit absente');target.queue.push(e.packet);}
   if(s.produced>=LIMITS.produced){s.paused=true;note(s,'Limite numérique du prototype atteinte (10²¹ composants cumulés).');return;}
   for(const id of PLANTS) {
     if(!plantUnlocked(s,id))continue;const plant=s.plants[id];
     if(id==='A')plant.stock.ore=Math.min(LIMITS.stock,plant.stock.ore+12*2**plant.oreLevel*DT);
     const generation=id==='A'&&s.challenges?.active?.id==='economy'?8:BASE_ENERGY[id]*2**plant.energyLevel;
     plant.stock.energy=Math.min(LIMITS.stock,plant.stock.energy+generation*DT);
   }
   const factor=transferFactor(s);
   for(const t of s.transfers)if(t.enabled&&plantUnlocked(s,t.from)&&plantUnlocked(s,t.to)){const src=s.plants[t.from].stock,dst=s.plants[t.to].stock;const qty=Math.max(0,Math.min(src[t.resource],t.rate*factor*DT,LIMITS.stock-dst[t.resource]));src[t.resource]-=qty;dst[t.resource]+=qty;t.moved+=qty;}
   const before=s.produced;
   for(const id of PLANTS)if(plantUnlocked(s,id))for(const lane of s.plants[id].lanes)for(let i=lane.machines.length-1;i>=0;i--){const m=lane.machines[i];const clock=m.clock;process(s,id,lane,m,lane.machines[i+1]);if(m.clock>clock+1e-9){if(hasMod(m,'turbo'))m.clock/=2;if(doctrine(s,'vitesse'))m.clock*=.75;}}
   if(s.pending.length>LIMITS.events||(s.transit?.length??0)>LIMITS.events)throw Error('File d’événements dépassée');
   if(!paced(s))for(const u of UNLOCKS)if(before<u.at&&s.produced>=u.at){note(s,u.text);mark(s,u.text);}
   const tiers=(s.tierTicks??=[]);while(tiers.length<21&&s.produced>=10**(tiers.length+1))tiers.push(s.tick);
   if(s.tick%10===0){s.history.push({tick:s.tick,total:s.produced});if(s.history.length>121)s.history.shift();}
   if(s.tick%100===0){const long=(s.longHistory??=[{tick:0,total:0}]);long.push({tick:s.tick,total:s.produced});if(long.length>1200)s.longHistory=long.filter((_,i)=>i%2===0||i===long.length-1);}
   updateChallenge(s);
   if(s.tick%10===0){updateIntro(s);updateProgress(s);}
   if(s.tick%100===0)for(const p of Object.values(s.plants))for(const n of Object.values(p.stock))if(!Number.isFinite(n)||n<0||n>LIMITS.stock+1)throw Error('Stock invalide');
 } catch(e) {s.fault=e instanceof Error?e.message:String(e);s.paused=true;note(s,`Diagnostic moteur : ${s.fault}`);}
}
export function simulate(s:State,seconds:number) {for(let i=0;i<Math.round(seconds/DT);i++)step(s);return s;}
export function measuredRate(s:State,seconds=60) {const end=s.history.at(-1)!;const start=s.history.find(x=>x.tick>=end.tick-seconds/DT)??end;const duration=(end.tick-start.tick)*DT;return {rate:duration>0?(end.total-start.total)/duration:0,duration};}
export const UPGRADE_MAX=16;
export function upgradeCost(level:number) {return 40*4**level;}
export function upgrade(s:State,id:PlantId,type:'oreLevel'|'energyLevel') {const p=s.plants[id];const cost=upgradeCost(p[type]);if(!plantUnlocked(s,id)||(id!=='A'&&type==='oreLevel')||p[type]>=UPGRADE_MAX||!spend(s.plants.A,'components',cost))return false;p[type]++;s.totalSpent+=cost;return true;}
function build(s:State,spec:MachineSpec[]) {
 // Costs are computed one machine at a time, so a lane of three resonators pays the growing price of each.
 let total=0;const costs:number[]=[];const extra=new Map<Kind,number>();
 for(const x of spec){const n=extra.get(x.kind)??0;const c=costOf(s,x.kind,n);costs.push(c);total+=c;extra.set(x.kind,n+1);}
 return {total,costs};
}
export function addLane(s:State,id:PlantId,bp?:Blueprint,role:'source'|'branch'='source') {
 if(!plantUnlocked(s,id)||s.plants[id].lanes.length>=lanesMax(s))return false;
 const spec:MachineSpec[]=bp?.machines??[{kind:'intake',param:6,connected:role!=='branch'},{kind:'press',param:0,connected:true}];
 if(spec.length>nodesMax(s)||spec.some(x=>!unlocked(s,x.kind)))return false;
 const fee=laneFee(s,id);const {total,costs}=build(s,spec);if(!spend(s.plants.A,'components',total+fee))return false;
 s.plants[id].lanes.push({id:s.nextId++,name:bp?.name??`Ligne ${s.plants[id].lanes.length+1}`,capsule:!!bp,...(fee?{fee}:{}),machines:spec.map((x,i)=>{const m={...machine(s,x.kind,costs[i]),param:x.param,connected:x.connected,...(x.variant!==undefined?{variant:x.variant}:{})};if(x.routing&&m.routing)Object.assign(m.routing,x.routing,{target:0});return m;})});s.totalSpent+=total+fee;return true;
}
function insertionIndex(lane:Lane,kind:Kind) {
 const press=lane.machines.findIndex(x=>x.kind==='press');const router=lane.machines.findIndex(x=>x.kind==='router'||x.kind==='relay');
 return MODULES[kind].input==='exhaust'?lane.machines.length:router>0?Math.min(router,Math.max(1,press)):Math.max(1,press);
}
export function insertModule(s:State,id:PlantId,laneId:number,kind:Kind) {
 const lane=s.plants[id].lanes.find(l=>l.id===laneId);if(!lane||lane.machines.length>=nodesMax(s)||!unlocked(s,kind)||kind==='intake'||kind==='press')return false;
 const cost=costOf(s,kind);if(!spend(s.plants.A,'components',cost))return false;
 const m=machine(s,kind,cost);if(kind==='stamp'&&featureOpen(s,'amber')&&lane.machines.some(x=>x.kind==='stamp'&&(x.variant??0)===0))m.variant=1;
 lane.machines.splice(insertionIndex(lane,kind),0,m);s.totalSpent+=cost;return true;
}
// Insert the modifiers of a saved invention into an existing line (one level of nesting).
export function insertBlueprint(s:State,id:PlantId,laneId:number,index:number) {
 const bp=s.library[index];const lane=s.plants[id].lanes.find(l=>l.id===laneId);if(!bp||!lane)return false;
 const spec=bp.machines.filter(x=>x.kind!=='intake'&&x.kind!=='press'&&x.kind!=='router'&&x.kind!=='relay');
 if(!spec.length||lane.machines.length+spec.length>nodesMax(s)||spec.some(x=>!unlocked(s,x.kind)))return false;
 const {total,costs}=build(s,spec);if(!spend(s.plants.A,'components',total))return false;
 spec.forEach((x,i)=>{const m={...machine(s,x.kind,costs[i]),param:x.param,connected:x.connected,...(x.variant!==undefined?{variant:x.variant}:{})};const matter=MODULES[x.kind].input==='matter';
   const pos=matter?insertionIndex(lane,x.kind):lane.machines.length;lane.machines.splice(pos,0,m);});
 s.totalSpent+=total;discover(s,'nested');return true;
}
function returnMachine(s:State,id:PlantId,m:Machine) {
 s.plants.A.stock.components=Math.min(LIMITS.stock,s.plants.A.stock.components+m.paid+(m.mods??[]).reduce((n,x)=>n+x.paid,0));
 const matter=m.queue.reduce((n,p)=>n+(p.kind==='matter'?p.qty:0),0)+(m.working?.kind==='matter'?m.working.qty:0)+incoming(s,m);
 s.transit=(s.transit??[]).filter(e=>e.target!==m.id);
 const r=PLANT_INPUT[id];s.plants[id].stock[r]=Math.min(LIMITS.stock,s.plants[id].stock[r]+matter);
 if(m.working)s.plants[id].stock.energy=Math.min(LIMITS.stock,s.plants[id].stock.energy+0.2*m.working.qty*m.param);
}
function canReturn(s:State,id:PlantId,ms:Machine[]) {const cost=ms.reduce((n,m)=>n+m.paid,0);const matter=ms.reduce((n,m)=>n+m.queue.reduce((a,p)=>a+(p.kind==='matter'?p.qty:0),0)+(m.working?.qty??0)+incoming(s,m),0);const energy=ms.reduce((n,m)=>n+(m.working?.qty??0)*.2*m.param,0);return canCredit(s,'A','components',cost)&&canCredit(s,id,PLANT_INPUT[id],matter)&&canCredit(s,id,'energy',energy);}
export function removeModule(s:State,id:PlantId,laneId:number,machineId:number) {const lane=s.plants[id].lanes.find(l=>l.id===laneId);if(!lane)return false;const index=lane.machines.findIndex(m=>m.id===machineId);if(index<0||['intake','press'].includes(lane.machines[index].kind)||!canReturn(s,id,[lane.machines[index]]))return false;const m=lane.machines[index];returnMachine(s,id,m);lane.machines.splice(index,1);if(m.kind==='filter')s.transit=(s.transit??[]);return true;}
export function removeLane(s:State,id:PlantId,laneId:number) {const p=s.plants[id];const lane=p.lanes.find(l=>l.id===laneId);if(!lane||!canReturn(s,id,lane.machines)||!canCredit(s,'A','components',lane.fee??0))return false;for(const m of lane.machines)returnMachine(s,id,m);s.plants.A.stock.components=Math.min(LIMITS.stock,s.plants.A.stock.components+(lane.fee??0));p.lanes=p.lanes.filter(l=>l.id!==laneId);for(const l of p.lanes)for(const m of l.machines)if(m.routing?.target===laneId)m.routing.target=0;return true;}
export function moveModule(s:State,id:PlantId,laneId:number,machineId:number,direction:number) {const lane=s.plants[id].lanes.find(l=>l.id===laneId);if(!lane)return false;const i=lane.machines.findIndex(m=>m.id===machineId),j=i+direction;if(i<1||j<1||j>=lane.machines.length)return false;const a=lane.machines[i],b=lane.machines[j];if(a.kind==='press'||b.kind==='press'||MODULES[a.kind].input!==MODULES[b.kind].input)return false;[lane.machines[i],lane.machines[j]]=[b,a];return true;}
export function blueprint(lane:Lane,name:string,keepLinks=false):Blueprint {return {name:name.trim().slice(0,48)||'Invention',machines:lane.machines.map(m=>({kind:m.kind,param:m.param,connected:m.connected,...(m.variant!==undefined?{variant:m.variant}:{}),...(m.routing?{routing:{target:keepLinks?m.routing.target:0,mode:m.routing.mode,threshold:m.routing.threshold}}:{})}))};}
export function encapsulate(s:State,id:PlantId,laneId:number,name:string) {const lane=s.plants[id].lanes.find(l=>l.id===laneId);if(!lane||s.produced<1000||s.library.length>=30)return false;lane.name=name.trim().slice(0,48)||'Invention';lane.capsule=true;s.library.push(blueprint(lane,lane.name));note(s,`Invention « ${lane.name} » enregistrée. Les cycles en cours sont conservés.`);return true;}
export function saveConfiguration(s:State,id:PlantId,name:string) {if(s.configurations.length>=20)return false;s.configurations.push({name:name.trim().slice(0,48)||'Configuration',plant:id,lanes:s.plants[id].lanes.map(l=>blueprint(l,l.name,true)),laneIds:s.plants[id].lanes.map(l=>l.id)});return true;}
export function loadConfiguration(s:State,index:number) {const c=s.configurations[index];if(!c)return false;const copy=clone(s);for(const l of [...copy.plants[c.plant].lanes])if(!removeLane(copy,c.plant,l.id))return false;for(const bp of c.lanes)if(!addLane(copy,c.plant,bp))return false;c.lanes.forEach((bp,i)=>bp.machines.forEach((spec,j)=>{const m=copy.plants[c.plant].lanes[i].machines[j];if(m.routing&&spec.routing){const targetIndex=c.laneIds?.indexOf(spec.routing.target)??-1;m.routing.target=copy.plants[c.plant].lanes[targetIndex]?.id??0;}}));Object.assign(s,copy);return true;}
export const ROUTE_THRESHOLDS=[6,12,20,40,80,160,320];
export const RELAY_MODES=['quality','marks','colors','energy'];
export const RELAY_THRESHOLDS:Record<string,number[]>={quality:[10,100,1e3,1e4,1e6,1e9],marks:[1,2,4,7],colors:[2,3],energy:[100,1e4,1e6,1e9]};
export function configureRouter(s:State,id:PlantId,laneId:number,machineId:number,update:Partial<Pick<Routing,'target'|'mode'|'threshold'>>) {
 const m=s.plants[id].lanes.find(l=>l.id===laneId)?.machines.find(m=>m.id===machineId);if(!m?.routing)return false;
 if(update.target!==undefined&&(update.target===laneId||(update.target!==0&&!s.plants[id].lanes.some(l=>l.id===update.target))))return false;
 const relay=m.kind==='relay';
 if(update.mode!==undefined&&!(relay?RELAY_MODES:['small','large','alternate','overflow']).includes(update.mode))return false;
 const mode=update.mode??m.routing.mode;
 if(update.mode!==undefined&&update.threshold===undefined&&relay)update.threshold=RELAY_THRESHOLDS[mode][0];
 if(update.threshold!==undefined&&!(relay?RELAY_THRESHOLDS[mode]:ROUTE_THRESHOLDS).includes(update.threshold))return false;
 Object.assign(m.routing,update);return true;
}
// Allowed settings per family; the interface offers exactly these values.
export const PARAMS:Partial<Record<Kind,number[]>> = {intake:[6,12],batch:[10,20,40,80,160,320],charge:[1,2,4,8],filter:[2,5,10,25,100,1000,1e4,1e5,1e6],compress:[2,4,8],sensor:[10,100,1e3,1e4,1e5,1e6,1e9]};
export const VARIANTS:Partial<Record<Kind,number[]>> = {stamp:[0,1,2],sensor:[0,1,2,3],cadence:[0,1,2],press:[0,1,2,3]};
export function setParam(s:State,m:Machine,value:number) {
 const allowed=PARAMS[m.kind];if(!allowed?.includes(value)||m.working)return false;
 if(m.kind==='batch'&&value>packetMax(s))return false;m.param=value;return true;
}
export function setVariant(s:State,m:Machine,value:number) {
 if(!VARIANTS[m.kind]?.includes(value))return false;if(m.kind==='stamp'&&value===1&&!featureOpen(s,'amber'))return false;if(m.kind==='stamp'&&value===2&&!featureOpen(s,'magenta'))return false;if(m.kind==='press'&&value>0&&!featureOpen(s,'molds'))return false;m.variant=value;return true;
}
export const EXPERIMENTS = [
 {id:'first',name:'Premier accord',description:'Produire 50 composants cumulés.',reward:50,test:(s:State)=>s.produced>=50,progress:(s:State)=>s.produced/50},
 {id:'lot',name:'Matière critique',description:'Presser au moins un lot de 80 matières.',reward:180,test:(s:State)=>s.largestLot>=80,progress:(s:State)=>s.largestLot/80},
 {id:'loop',name:'Rien ne se perd',description:'Récupérer 500 matières.',reward:400,test:(s:State)=>s.recovered>=500,progress:(s:State)=>s.recovered/500},
 {id:'duet',name:'Dialogue industriel',description:'Produire 30 catalyseurs dans la Serre.',reward:1000,test:(s:State)=>s.catalystProduced>=30,progress:(s:State)=>s.catalystProduced/30},
 {id:'flow',name:'Régime établi',description:'Mesurer au moins 300 composants/s sur une fenêtre complète de 60 s.',reward:5000,test:(s:State)=>measuredRate(s).duration>=59.9&&measuredRate(s).rate>=300,progress:(s:State)=>Math.min(measuredRate(s).duration/60,measuredRate(s).rate/300)},
 {id:'final',name:'Premier million',description:'Produire 1 000 000 composants cumulés.',reward:100000,test:(s:State)=>s.produced>=1e6,progress:(s:State)=>s.produced/1e6},
 {id:'plasma',name:'Triangle fermé',description:'Produire 100 plasma dans la Forge.',reward:1e8,test:(s:State)=>(s.plasmaProduced??0)>=100,progress:(s:State)=>(s.plasmaProduced??0)/100},
 {id:'giga',name:'Complexe industriel',description:'Produire 10⁹ composants cumulés.',reward:1e8,test:(s:State)=>s.produced>=1e9,progress:(s:State)=>s.produced/1e9},
 {id:'heart',name:'Le cœur de Résonance',description:'Produire 10¹⁵ composants cumulés. Aucun reset imposé : l’atelier reste ouvert.',reward:1e14,test:(s:State)=>s.produced>=1e15,progress:(s:State)=>Math.log10(Math.max(1,s.produced))/15}
];
export function claim(s:State,id:string) {const e=EXPERIMENTS.find(x=>x.id===id);if(!e||s.claimed.includes(id)||!e.test(s))return false;s.claimed.push(id);s.plants.A.stock.components=Math.min(LIMITS.stock,s.plants.A.stock.components+e.reward);note(s,`Expérience validée : ${e.name}.`);return true;}
// First-run journey: a manual injector launches one lot per tap until the player pays to automate it.
export function manualInject(s:State,laneId:number) {
 const lane=s.plants.A.lanes.find(l=>l.id===laneId)??s.plants.A.lanes[0];const m=lane?.machines[0];const next=lane?.machines[1];
 if(!m||m.kind!=='intake'||!m.manual||!next||s.paused)return false;
 const p:Packet={qty:m.param,quality:1,kind:'matter',recovered:false,exchanged:false,energy:0,origin:'A'};
 if(!canSend(s,next,p)||!spend(s.plants.A,'ore',p.qty))return false;
 next.queue.push(p);m.processed++;m.lastPacket={tick:s.tick,qty:p.qty,quality:1,marks:0};if(s.journey)s.journey.manual++;return true;
}
export function automateIntake(s:State,cost:number) {
 const m=s.plants.A.lanes[0]?.machines[0];if(!m?.manual||!spend(s.plants.A,'components',cost))return false;
 delete m.manual;s.totalSpent+=cost;note(s,'Injecteur automatisé : la Fonderie produit désormais sans vous.');return true;
}
export const TEMPOS=[60,90,120,150,180,240];
export function setTempo(s:State,bpm:number){if(!TEMPOS.includes(bpm)||s.produced<3e6)return false;s.tempo=bpm;return true;}
export const modSlots=(s:State)=>!featureOpen(s,'slots')?0:1+(s.produced>=1e11?1:0)+(hasPatent(s,'slots')?1:0)+(siteDone(s,'observatoire')?1:0);
export const modsTotal=(s:State)=>PLANTS.reduce((n,id)=>n+s.plants[id].lanes.reduce((a,l)=>a+l.machines.reduce((b,m)=>b+(m.mods?.length??0),0),0),0);
export const modCost=(s:State)=>Math.round(1e7*6**modsTotal(s));
export function addMod(s:State,m:Machine,id:string){
 if(!MODS.some(x=>x.id===id)||(m.mods?.length??0)>=modSlots(s)||hasMod(m,id))return false;if(id==='stabilisateur'&&m.kind!=='cadence')return false;
 const cost=modCost(s);if(!spend(s.plants.A,'components',cost))return false;(m.mods??=[]).push({id,paid:cost});s.totalSpent+=cost;discover(s,'mod');return true;
}
export function removeMod(s:State,m:Machine,id:string){const i=m.mods?.findIndex(x=>x.id===id)??-1;if(i<0)return false;const [x]=m.mods!.splice(i,1);if(!m.mods!.length)delete m.mods;s.plants.A.stock.components=Math.min(LIMITS.stock,s.plants.A.stock.components+x.paid);return true;}
