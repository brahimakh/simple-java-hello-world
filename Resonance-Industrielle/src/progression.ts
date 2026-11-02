// Long-term goals layered on top of the simulation: contracts, patents, badges, discoveries and one refoundation.
// Everything here is deterministic and derived from real production; nothing is random or timed against the player.
import type {State,Variant} from './engine.ts';
import {measuredRate,createState,clone,mark,variantOf,unlocked,unlockAt,plantUnlocked,discover,featureOpen,boostIntro} from './engine.ts';
import {journeyActive} from './journey.ts';
import type {Kind} from './content.ts';
export interface Contract {kind:string;goal:number;base:number;reward:number;patents:number;start:number;level:number;}
export interface ProgressState {points:number;patents:string[];contract:Contract|null;done:number;badges:string[];refounds:number;legacy:number;}
export const progressOf=(s:State):ProgressState=>(s.progress??={points:0,patents:[],contract:null,done:0,badges:[],refounds:0,legacy:1});
export function hasPatent(s:State,id:string) {return !!s.progress?.patents.includes(id);}

export const PATENTS=[
 {id:'lanes',name:'Ateliers étendus',text:'+2 lignes par installation (8 au lieu de 6).',cost:1},
 {id:'nodes',name:'Lignes longues',text:'+2 machines par ligne (12 au lieu de 10).',cost:1},
 {id:'resonance',name:'Résonance profonde',text:'Le 2e résonateur d’un lot donne son plein effet : diviseur n − 1 au lieu de n.',cost:2},
 {id:'packet',name:'Lots doubles',text:'Lot maximal 320 au lieu de 160 (accumulateur, aiguillage, presse).',cost:2},
 {id:'transfer',name:'Pipelines',text:'Tous les transferts entre installations ×4.',cost:2},
 {id:'furnace',name:'Isolation thermique',text:'Le four ne perd plus que 5 % de sa chaleur par seconde.',cost:2},
 {id:'slots',name:'Établi',text:'+1 emplacement d’amélioration sur chaque machine.',cost:3},
 {id:'catalysis',name:'Catalyse fine',text:'Un catalyseur multiplie la sortie de la presse par 6 au lieu de 4.',cost:3}
] as const;
export function buyPatent(s:State,id:string) {
 const p=progressOf(s);const def=PATENTS.find(x=>x.id===id);
 if(!def||p.patents.includes(id)||p.points<def.cost)return false;
 p.points-=def.cost;p.patents.push(id);mark(s,'brevet:'+id);return true;
}

// ---------- Discoveries: notable combinations, recognized by the engine, never listed in advance ----------
export const DISCOVERIES:{id:string;name:string;text:string;hint:Kind}[]=[
 {id:'accord',name:'Accord parfait',text:'Un résonateur atteint 4 accords : ×5 sur la qualité.',hint:'cadence'},
 {id:'accord5',name:'Accord serré',text:'Un résonateur à fenêtre courte atteint 5 accords : ×6.',hint:'cadence'},
 {id:'bulk',name:'Masse critique',text:'Un lot de 80 matières déclenche la prime ×8 de la presse.',hint:'batch'},
 {id:'order',name:'L’ordre compte',text:'Des empreintes réunies avant le tisseur : au moins ×4 d’un coup.',hint:'weave'},
 {id:'weave8',name:'Tissage complet',text:'Sept empreintes sur un même lot : le tisseur donne ×8.',hint:'weave'},
 {id:'catalysis',name:'Boucle catalytique',text:'Un catalyseur de la Serre revient multiplier une presse de Fonderie.',hint:'press'},
 {id:'branch',name:'Deux chemins',text:'Un aiguillage répartit les lots entre deux lignes actives.',hint:'router'},
 {id:'split',name:'Diviser pour accorder',text:'Un lot divisé nourrit un résonateur.',hint:'split'},
 {id:'refine',name:'Affinage',text:'Un lot renvoyé par le filtre revient assez riche pour passer.',hint:'filter'},
 {id:'charge-loop',name:'Double charge',text:'Un même lot traverse deux fois une chambre de charge.',hint:'charge'},
 {id:'sync-loop',name:'Synchronisation en boucle',text:'Un lot recyclé par le filtre est synchronisé.',hint:'sync'},
 {id:'mirror',name:'Reflet décuplé',text:'Le miroir multiplie au moins par 10 la qualité d’un lot.',hint:'mirror'},
 {id:'blaze',name:'Haut fourneau',text:'Un four dépasse 80 de chaleur.',hint:'furnace'},
 {id:'compress',name:'Densité',text:'Un compresseur fond plusieurs lots en un seul.',hint:'compress'},
 {id:'harmony',name:'Harmonie',text:'Deux lignes livrent ensemble : ×3 par l’harmoniseur.',hint:'harmonic'},
 {id:'bicolor',name:'Bicolore',text:'Un lot porte les deux couleurs d’empreinte : tissage ×2.',hint:'stamp'},
 {id:'greenhouse-loop',name:'Serre circulaire',text:'Un récupérateur rend des résidus à la Serre.',hint:'recovery'},
 {id:'plasma',name:'Surchauffe',text:'Le plasma de la Forge multiplie une presse de Fonderie par 10.',hint:'press'},
 {id:'quality6',name:'Qualité ×1 000 000',text:'Un lot atteint une qualité d’un million.',hint:'press'},
 {id:'press9',name:'Un milliard d’un coup',text:'Une seule presse produit 10⁹ composants en un cycle.',hint:'press'},
 {id:'assembly',name:'Deux lignes, un lot',text:'Un assembleur fond deux lots venus de lignes différentes : leurs qualités se multiplient.',hint:'assembler'},
 {id:'assembly-rich',name:'Alliage',text:'Un lot assemblé dépasse une qualité de 10 000.',hint:'assembler'},
 {id:'spring',name:'Ressort',text:'Un moule à ressort triple un petit lot.',hint:'press'},
 {id:'gear',name:'Engrenage',text:'Un moule à engrenage renforce la prime de gros lot.',hint:'press'},
 {id:'crystal',name:'Cristal',text:'Un moule à cristal quadruple un lot, en prenant son temps.',hint:'press'},
 {id:'prism',name:'Prisme',text:'Trois couleurs d’empreinte sur un lot : tissage ×5.',hint:'stamp'},
 {id:'echo',name:'Écho',text:'Un lot hérite des empreintes du lot qui le précède.',hint:'echo'},
 {id:'tempo',name:'Au temps',text:'Des métronomes font livrer plusieurs lignes ensemble : l’harmoniseur répond.',hint:'metronome'},
 {id:'prototype',name:'Prototype',text:'Une machine unique change une règle de votre partie.',hint:'press'},
 {id:'relay',name:'Aiguillage intelligent',text:'Un relais envoie un lot ailleurs parce qu’il remplit une condition.',hint:'relay'},
 {id:'mod',name:'Sur mesure',text:'Une amélioration installée change le comportement d’une machine.',hint:'press'},
 {id:'culture',name:'Hybride',text:'Deux souches croisées donnent une souche nouvelle.',hint:'press'},
 {id:'site',name:'Monument',text:'Un chantier achevé change une règle de votre partie.',hint:'press'},
 {id:'nested',name:'Invention dans l’invention',text:'Les modules d’une invention sont insérés dans une autre ligne.',hint:'press'}
];
export const discoveryCount=(s:State)=>s.discoveries?.length??0;

// ---------- Badges: they reward variety, not repetition; some unlock visual themes ----------
const machinesOf=(s:State,id:'A'|'B'|'C')=>s.plants[id].lanes.flatMap(l=>l.machines);
export const BADGES:{id:string;name:string;text:string;test:(s:State)=>boolean}[]=[
 {id:'sober',name:'Sobriété',text:'100 composants/s avec 4 modules ou moins à la Fonderie.',test:s=>measuredRate(s).rate>=100&&machinesOf(s,'A').filter(m=>m.kind!=='intake'&&m.kind!=='press').length<=4},
 {id:'nores',name:'Sans résonance',text:'1 000 composants/s sans aucun résonateur.',test:s=>measuredRate(s).rate>=1000&&measuredRate(s).duration>=59&&!machinesOf(s,'A').some(m=>m.kind==='cadence')},
 {id:'full',name:'Chaîne complète',text:'Une ligne de 10 machines qui ont toutes travaillé.',test:s=>Object.values(s.plants).some(p=>p.lanes.some(l=>l.machines.length>=10&&l.machines.every(m=>m.processed>0)))},
 {id:'triangle',name:'Triangle',text:'Les trois installations produisent en même temps.',test:s=>(['A','B','C'] as const).every(id=>machinesOf(s,id).some(m=>m.kind==='press'&&m.lastPacket&&s.tick-m.lastPacket.tick<50))},
 {id:'curious',name:'Curiosité',text:'10 découvertes dans le carnet.',test:s=>discoveryCount(s)>=10},
 {id:'collector',name:'Collection',text:'5 inventions dans la bibliothèque.',test:s=>s.library.length>=5},
 {id:'contractor',name:'Sous-traitant',text:'5 contrats remplis.',test:s=>(s.progress?.done??0)>=5},
 {id:'sprint',name:'Sprint',text:'Atteindre 10⁶ composants cumulés en moins de 15 minutes.',test:s=>(s.tierTicks?.[5]??Infinity)<=9000},
 {id:'cascade',name:'Cascade',text:'Un pressage avec prime de lot, catalyse et plasma en même temps.',test:s=>machinesOf(s,'A').some(m=>m.lastPacket?.bulk===8&&(m.lastPacket.catalysis??1)>1&&(m.lastPacket.plasma??1)>1)},
 {id:'giga',name:'Milliard',text:'10⁹ composants cumulés.',test:s=>s.produced>=1e9},
 {id:'refounder',name:'Refondateur',text:'Refonder une fois le laboratoire.',test:s=>(s.progress?.refounds??0)>0},
 {id:'heart',name:'Cœur battant',text:'10¹⁵ composants cumulés.',test:s=>s.produced>=1e15}
];
export const THEMES=[{id:'default',name:'Laboratoire',badges:0},{id:'neon',name:'Néon',badges:2},{id:'blueprint',name:'Plan bleu',badges:5},{id:'paper',name:'Papier technique',badges:8}] as const;

// ---------- Contracts: optional, deterministic demands that pay patents ----------
export const CONTRACTS_AT=1e5;
const tierOf=(s:State)=>Math.max(0,Math.floor(Math.log10(Math.max(1,s.produced))));
function statValue(s:State,kind:string,level:number) {
 return kind==='quality'?(s.stats?.['q'+level]??0):kind==='bulk'?(s.stats?.lots80??0):kind==='bicolor'?(s.stats?.bicolor??0):kind==='loops'?(s.stats?.loops??0):kind==='harmony'?(s.stats?.harmony??0):kind==='assembly'?(s.stats?.assembly??0):kind==='crystals'?(s.stats?.crystals??0):kind==='prism'?(s.stats?.prism??0):kind==='catalyst'?s.catalystProduced:kind==='plasma'?(s.plasmaProduced??0):0;
}
export function contractOffers(s:State):Contract[] {
 const p=progressOf(s);if(!featureOpen(s,'contracts')&&p.refounds===0)return [];
 const tier=tierOf(s),rate=Math.max(1,measuredRate(s).rate),reward=Math.max(1000,Math.round(rate*120));
 const pool:Omit<Contract,'base'|'start'>[]=[
  {kind:'quality',level:Math.min(12,Math.max(2,tier-2)),goal:30,reward,patents:1},
  {kind:'bulk',level:0,goal:60,reward,patents:1},
  {kind:'rate',level:0,goal:roundGoal(rate*3),reward:reward*2,patents:2},
  ];
 // 1.3: only contracts the player can already fulfil.
 if(plantUnlocked(s,'B'))pool.push({kind:'catalyst',level:0,goal:10**Math.max(2,tier-3),reward,patents:1});
 if(unlocked(s,'filter' as never))pool.push({kind:'loops',level:0,goal:50,reward,patents:1});
 if(unlocked(s,'harmonic' as never))pool.push({kind:'harmony',level:0,goal:40,reward:reward*2,patents:2});
 if(featureOpen(s,'amber'))pool.push({kind:'bicolor',level:0,goal:20,reward:reward*2,patents:2});
 if(unlocked(s,'assembler' as never))pool.push({kind:'assembly',level:0,goal:30,reward:reward*2,patents:2});
 if(featureOpen(s,'molds'))pool.push({kind:'crystals',level:0,goal:40,reward,patents:1});
 if(featureOpen(s,'magenta'))pool.push({kind:'prism',level:0,goal:20,reward:reward*3,patents:2});
 if(plantUnlocked(s,'C'))pool.push({kind:'plasma',level:0,goal:50,reward:reward*3,patents:2});
 // Rotation depends only on how many contracts were completed: same history, same offers.
 const out:Contract[]=[];for(let i=0;i<3&&i<pool.length;i++){const c=pool[(p.done*2+i*3)%pool.length];if(!out.some(x=>x.kind===c.kind))out.push({...c,base:0,start:0});}
 return out;
}
export function acceptContract(s:State,index:number) {
 const p=progressOf(s);if(p.contract)return false;const c=contractOffers(s)[index];if(!c)return false;
 p.contract={...c,base:statValue(s,c.kind,c.level),start:s.tick};return true;
}
export function abandonContract(s:State) {const p=progressOf(s);if(!p.contract)return false;p.contract=null;return true;}
export function contractProgress(s:State,c:Contract) {
 if(c.kind==='rate'){const r=measuredRate(s);const window=(s.tick-c.start)*.1;return {value:window>=60?r.rate:Math.min(r.rate,c.goal*window/60),ratio:Math.min(1,(window>=60?r.rate:0)/c.goal)};}
 const value=statValue(s,c.kind,c.level)-c.base;return {value,ratio:Math.min(1,value/c.goal)};
}
const sup=(k:number)=>String(k).split('').map(x=>'⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(x)]).join('');
const compact=(n:number)=>{if(n<1e6)return String(Math.round(n));const k=Math.floor(Math.log10(n)),m=Math.round(n/10**k);return m===1?`10${sup(k)}`:`${m}×10${sup(k)}`;};
const roundGoal=(n:number)=>{const k=Math.floor(Math.log10(Math.max(1,n)));return Math.ceil(n/10**k)*10**k;};
export function contractText(c:Contract) {
 const g=compact(c.goal);
 return c.kind==='quality'?`Presser ${g} lots de qualité ≥ ×${compact(10**c.level)}`:c.kind==='bulk'?`Presser ${g} lots avec prime de gros lot`:c.kind==='rate'?`Mesurer ${g} composants/s sur 60 s`:c.kind==='catalyst'?`Produire ${g} catalyseurs`:c.kind==='loops'?`Renvoyer ${g} lots par un filtre`:c.kind==='harmony'?`Obtenir ${g} harmonies`:c.kind==='bicolor'?`Tisser ${g} lots bicolores`:c.kind==='assembly'?`Assembler ${g} lots`:c.kind==='crystals'?`Presser ${g} cristaux`:c.kind==='prism'?`Tisser ${g} lots prismatiques`:`Produire ${g} plasma`;
}
// Eureka: a change followed, 30 to 180 s later, by a stable rate at least ×5 the rate before it.
export const EUREKA_RATIO=5;
export function checkEureka(s:State) {
 const c=s.lastChange;if(!c||s.puzzle)return;if(journeyActive(s)){delete s.lastChange;return;}const age=s.tick-c.tick;if(age>1800){delete s.lastChange;return;}if(age<300)return;
 const now=measuredRate(s,30).rate;const ratio=now/Math.max(.5,c.rate);if(ratio<EUREKA_RATIO)return;
 const reward=now*20*Math.log2(ratio);s.plants.A.stock.components=Math.min(1e21,s.plants.A.stock.components+reward);
 (s.eurekas??=[]).push({tick:s.tick,ratio,before:c.rate,after:now});if(s.eurekas.length>30)s.eurekas.shift();delete s.lastChange;mark(s,'eureka');boostIntro(s);
}
export function updateProgress(s:State) {
 const p=progressOf(s);checkEureka(s);updatePrototypes(s);
 if(p.contract&&contractProgress(s,p.contract).ratio>=1){
  s.plants.A.stock.components=Math.min(1e21,s.plants.A.stock.components+p.contract.reward);p.points+=p.contract.patents;p.done++;
  mark(s,'contrat:'+p.contract.kind);p.contract=null;
 }
 if(s.tick%50===0)for(const b of BADGES)if(!p.badges.includes(b.id)&&b.test(s)){p.badges.push(b.id);mark(s,'badge:'+b.id);}
}

// ---------- Refoundation: one optional transition that keeps inventions and adds a rule ----------
export const REFOUND_AT=1e12;
export const legacyFor=(discoveries:number)=>1.25**discoveries;
export function canRefound(s:State) {return s.produced>=REFOUND_AT;}
export function refound(s:State,variant?:Variant,doctrineId?:string):State|null {
 if(!canRefound(s))return null;
 const p=progressOf(s);const next=createState(variant??variantOf(s));if(doctrineId&&['vitesse','masse','lumiere','ecologie'].includes(doctrineId))next.doctrine=doctrineId;
 if(s.culture)next.culture=clone(s.culture);
 next.library=clone(s.library);next.configurations=clone(s.configurations);next.discoveries=clone(s.discoveries??[]);
 next.progress={points:p.points,patents:[...p.patents],contract:null,done:p.done,badges:[...p.badges],refounds:p.refounds+1,legacy:Math.max(p.legacy,legacyFor(discoveryCount(s)))};
 next.plants.A.stock.components=1000;
 mark(next,'refondation');return next;
}

// ---------- Pistes: three open leads toward undiscovered combinations. A question, never a recipe. ----------
export const PISTE_HINTS:Record<string,string>={
 accord:'Un résonateur peut-il monter jusqu’à ×5 ?',accord5:'Et si l’on raccourcissait la fenêtre d’accord ?',bulk:'Que fait la presse d’un très gros lot ?',
 order:'Des empreintes réunies valent-elles plus que des empreintes isolées ?',weave8:'Jusqu’où le tisseur peut-il multiplier ?',
 catalysis:'La Serre peut-elle rendre service à la Fonderie ?',branch:'Une ligne peut-elle en nourrir une autre ?',
 split:'Un gros lot peut-il redevenir assez petit pour un résonateur ?',refine:'Un lot trop faible mérite-t-il une seconde chance ?',
 'charge-loop':'Un lot peut-il être chargé deux fois ?','sync-loop':'Que se passe-t-il si un lot recyclé croise un synchroniseur ?',
 mirror:'Un lot pauvre peut-il emprunter la qualité d’un lot riche ?',blaze:'Combien de matière faut-il pour faire rougir un four ?',
 compress:'Plusieurs lots peuvent-ils n’en faire qu’un ?',harmony:'Deux lignes peuvent-elles jouer ensemble ?',
 bicolor:'Deux couleurs valent-elles mieux qu’une ?','greenhouse-loop':'La Serre gaspille-t-elle ses résidus ?',
 plasma:'Que peut apporter la troisième installation ?',quality6:'Un lot peut-il atteindre une qualité d’un million ?',
 press9:'Une seule presse peut-elle produire un milliard d’un coup ?',echo:'Les empreintes d’un lot peuvent-elles survivre à son passage\u00a0?',tempo:'Que se passe-t-il quand plusieurs lignes battent la même mesure\u00a0?',prototype:'Un palier franchi peut-il changer les règles\u00a0?',culture:'La Serre peut-elle sélectionner ses propres plantes\u00a0?',site:'Que faire de toute cette production\u00a0?',relay:'Et si chaque lot choisissait sa route selon ce qu’il vaut\u00a0?',mod:'Une machine peut-elle devenir plus que sa famille\u00a0?',assembly:'Deux lots de lignes différentes peuvent-ils n’en faire qu’un ?','assembly-rich':'Jusqu’où peut monter la qualité d’un lot assemblé ?',spring:'Une presse peut-elle préférer les petits lots ?',gear:'Une presse peut-elle aimer encore plus les gros lots ?',crystal:'Que vaut une presse qui prend son temps ?',prism:'Et avec trois couleurs ?',nested:'Une invention peut-elle en enrichir une autre ?'
};
function pisteOpen(s:State,id:string,hint:string) {
 if(id==='catalysis'||id==='greenhouse-loop')return plantUnlocked(s,'B');if(id==='plasma')return plantUnlocked(s,'C');
 if(id==='quality6')return s.produced>=1e6;if(id==='press9')return s.produced>=1e9;if(id==='nested')return s.library.length>0;
 if(id==='accord5'||id==='weave8')return s.produced>=300;
 if(id==='prototype')return featureOpen(s,'proto');if(id==='culture')return featureOpen(s,'culture');if(id==='site')return featureOpen(s,'sites');if(id==='mod')return featureOpen(s,'slots');if(id==='bicolor')return featureOpen(s,'amber');if(id==='tempo')return unlocked(s,'harmonic' as never)&&unlocked(s,'metronome' as never);
 if(id==='spring'||id==='gear'||id==='crystal')return featureOpen(s,'molds');if(id==='prism')return featureOpen(s,'magenta');
 return unlocked(s,hint as never);
}
export function pistes(s:State) {
 if(journeyActive(s)||s.puzzle)return [];
 const found=new Set((s.discoveries??[]).map(d=>d.id));
 const open=DISCOVERIES.filter(d=>!found.has(d.id)&&PISTE_HINTS[d.id]&&pisteOpen(s,d.id,d.hint));
 if(!open.length)return [];
 // The newest mechanic first (to introduce it), then the oldest leads still open.
 const byUnlock=[...open].sort((a,b)=>unlockAt(s,a.hint as never)-unlockAt(s,b.hint as never));
 const newest=byUnlock.at(-1)!;const AREA:Record<string,string>={culture:'Serre vivante',site:'Chantiers',mod:'Emplacements',prototype:'Prototypes',spring:'Moules de presse',gear:'Moules de presse',crystal:'Moules de presse',prism:'Empreinte magenta',catalysis:'Serre catalytique','greenhouse-loop':'Serre catalytique',plasma:'Forge à plasma',quality6:'Presse',press9:'Presse',nested:'Inventions'};
 return [newest,...byUnlock.filter(d=>d!==newest)].slice(0,3).map(d=>({...d,area:AREA[d.id],question:PISTE_HINTS[d.id],fresh:d===newest&&s.produced<unlockAt(s,d.hint as never)*4}));
}
export const SPECIALTIES=[{kind:'cadence',name:'Cadence',text:'Le résonateur double son effet.'},{kind:'batch',name:'Masse',text:'La prime de gros lot double : ×16 au lieu de ×8.'},{kind:'weave',name:'Empreinte',text:'Le tisseur double son effet.'}] as const;
export function chooseSpecialty(s:State,kind:string) {if(s.specialty||!SPECIALTIES.some(x=>x.kind===kind))return false;s.specialty=kind as State['specialty'];mark(s,'spécialité:'+kind);return true;}

// ---------- Prototypes: at each threshold, choose one unique machine-rule among three. Deterministic offers. ----------
export const PROTOTYPES=[
 {id:'double-weave',name:'Tisseur double',text:'Le tisseur compte chaque empreinte deux fois (jusqu’à ×15).'},
 {id:'max-batch',name:'Accumulateur sélectif',text:'L’accumulateur garde la meilleure qualité de ses lots au lieu de la moyenne.'},
 {id:'long-accord',name:'Longue résonance',text:'La fenêtre d’accord de chaque résonateur est triplée.'},
 {id:'split-mark',name:'Diviseur marqueur',text:'Chaque moitié d’un lot divisé reçoit une empreinte cyan si elle n’en a pas.'},
 {id:'hot-press',name:'Presse chaude',text:'Une presse produit ×2 si un four de sa ligne dépasse 50 de chaleur.'},
 {id:'loop-boost',name:'Affinage intense',text:'Un lot renvoyé par un filtre gagne ×1,5 à chaque retour.'},
 {id:'pipelines',name:'Pipelines géants',text:'Tous les transferts entre installations ×3.'},
 {id:'quick-charge',name:'Charge éclair',text:'La chambre de charge garde ses lots deux fois moins longtemps, pour le même effet.'},
 {id:'big-lot',name:'Lots géants',text:'La limite de lot double.'},
 {id:'synergy',name:'Résonance collective',text:'Chaque interaction de synergie vaut ×1,3 au lieu de ×1,2.'}
] as const;
export const PROTO_AT=[1e4,1e6,1e9,1e12];
export function protoState(s:State){return (s.protos??={owned:[],offer:null});}
export function updatePrototypes(s:State){
 const p=protoState(s);if(p.offer||s.puzzle||journeyActive(s))return;const n=p.owned.length;if(n>=PROTO_AT.length||s.produced<PROTO_AT[n]||!featureOpen(s,'proto'))return;
 const left=PROTOTYPES.filter(x=>!p.owned.includes(x.id));const start=(n*3+(s.library.length%3))%left.length;
 p.offer=[0,1,2].map(i=>left[(start+i*Math.max(1,Math.floor(left.length/3)))%left.length].id).filter((x,i,a)=>a.indexOf(x)===i);mark(s,'prototype-offert');
}
export function chooseProto(s:State,id:string){const p=protoState(s);if(!p.offer?.includes(id))return false;p.owned.push(id);p.offer=null;mark(s,'prototype:'+id);discover(s,'prototype');return true;}
