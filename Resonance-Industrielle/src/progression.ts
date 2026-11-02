// Long-term goals layered on top of the simulation: contracts, patents, badges, discoveries and one refoundation.
// Everything here is deterministic and derived from real production; nothing is random or timed against the player.
import type {State,Variant} from './engine.ts';
import {measuredRate,createState,clone,mark,variantOf} from './engine.ts';
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
 return kind==='quality'?(s.stats?.['q'+level]??0):kind==='bulk'?(s.stats?.lots80??0):kind==='bicolor'?(s.stats?.bicolor??0):kind==='loops'?(s.stats?.loops??0):kind==='harmony'?(s.stats?.harmony??0):kind==='catalyst'?s.catalystProduced:kind==='plasma'?(s.plasmaProduced??0):0;
}
export function contractOffers(s:State):Contract[] {
 const p=progressOf(s);if(s.produced<CONTRACTS_AT&&p.refounds===0)return [];
 const tier=tierOf(s),rate=Math.max(1,measuredRate(s).rate),reward=Math.max(1000,Math.round(rate*120));
 const pool:Omit<Contract,'base'|'start'>[]=[
  {kind:'quality',level:Math.min(12,Math.max(2,tier-2)),goal:30,reward,patents:1},
  {kind:'bulk',level:0,goal:60,reward,patents:1},
  {kind:'rate',level:0,goal:roundGoal(rate*3),reward:reward*2,patents:2},
  {kind:'catalyst',level:0,goal:10**Math.max(2,tier-3),reward,patents:1}
 ];
 if(s.produced>=1e4)pool.push({kind:'loops',level:0,goal:50,reward,patents:1});
 if(s.produced>=1e6)pool.push({kind:'harmony',level:0,goal:40,reward:reward*2,patents:2});
 if(s.produced>=3e6)pool.push({kind:'bicolor',level:0,goal:20,reward:reward*2,patents:2});
 if(s.produced>=1e8)pool.push({kind:'plasma',level:0,goal:50,reward:reward*3,patents:2});
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
 return c.kind==='quality'?`Presser ${g} lots de qualité ≥ ×${compact(10**c.level)}`:c.kind==='bulk'?`Presser ${g} lots avec prime de gros lot`:c.kind==='rate'?`Mesurer ${g} composants/s sur 60 s`:c.kind==='catalyst'?`Produire ${g} catalyseurs`:c.kind==='loops'?`Renvoyer ${g} lots par un filtre`:c.kind==='harmony'?`Obtenir ${g} harmonies`:c.kind==='bicolor'?`Tisser ${g} lots bicolores`:`Produire ${g} plasma`;
}
export function updateProgress(s:State) {
 const p=progressOf(s);
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
export function refound(s:State,variant?:Variant):State|null {
 if(!canRefound(s))return null;
 const p=progressOf(s);const next=createState(variant??variantOf(s));
 next.library=clone(s.library);next.configurations=clone(s.configurations);next.discoveries=clone(s.discoveries??[]);
 next.progress={points:p.points,patents:[...p.patents],contract:null,done:p.done,badges:[...p.badges],refounds:p.refounds+1,legacy:Math.max(p.legacy,legacyFor(discoveryCount(s)))};
 next.plants.A.stock.components=1000;
 mark(next,'refondation');return next;
}
