// First-run journey: one objective at a time, each completed by acting on a real mechanic.
// The first lots are launched by hand; automation is earned. The interface reveals itself as the player progresses.
import type {Kind} from './content.ts';
import {unlocked,costOf,type State,type Machine} from './engine.ts';
export interface JourneyState {step:number;manual:number;flags:string[];}
export const AUTOMATE_COST=3;
export interface Step {id:string;title:string;text:string;cta?:{label:string;action:string;kind?:Kind};target?:string;goal?:(s:State)=>{value:number;max:number}|null;done:(s:State)=>boolean;}
const lane=(s:State)=>s.plants.A.lanes[0];
const intake=(s:State)=>lane(s)?.machines.find(m=>m.kind==='intake') as Machine|undefined;
const has=(s:State,k:Kind)=>s.plants.A.lanes.some(l=>l.machines.some(m=>m.kind===k));
const found=(s:State,id:string)=>!!s.discoveries?.some(d=>d.id===id);
const flag=(s:State,f:string)=>!!s.journey?.flags.includes(f);
const budget=(s:State,k:Kind)=>unlocked(s,k)?{value:Math.min(s.plants.A.stock.components,costOf(s,k)),max:costOf(s,k)}:{value:Math.min(s.produced,cumulative[k]??0),max:cumulative[k]??1};
const cumulative:Partial<Record<Kind,number>>={cadence:10,batch:50,stamp:30,weave:80};
export const JOURNEY:Step[]=[
 {id:'first-lot',title:'Lancez votre premier lot',text:'L’injecteur attend votre signal. Touchez le bouton : 6 matières partent vers la presse.',cta:{label:'▶ Injecter un lot',action:'manual-inject'},target:'.node[data-kind="intake"]',done:s=>(s.journey?.manual??0)>=1},
 {id:'press',title:'La presse fabrique des composants',text:'Un lot de 6 matières donne 0,6 composant ⬡. Lancez-en d’autres : 3 ⬡ suffisent pour automatiser.',cta:{label:'▶ Injecter un lot',action:'manual-inject'},target:'.node[data-kind="press"]',goal:s=>({value:Math.min(s.plants.A.stock.components,AUTOMATE_COST),max:AUTOMATE_COST}),done:s=>s.plants.A.stock.components>=AUTOMATE_COST},
 {id:'automate',title:'Automatisez l’injecteur',text:'Pour 3 ⬡, l’injecteur livre seul toutes les 0,5 s. L’usine tournera sans vous : votre rôle devient de l’améliorer.',cta:{label:'⚙ Automatiser · 3 ⬡',action:'automate'},target:'.node[data-kind="intake"]',done:s=>!intake(s)?.manual},
 {id:'resonator',title:'Ajoutez un résonateur',text:'Il multiplie la qualité des petits lots qui arrivent vite, jusqu’à ×5. Il se débloque à 10 composants produits.',cta:{label:'＋ Résonateur',action:'add-module',kind:'cadence'},target:'[data-offer="cadence"]',goal:s=>budget(s,'cadence'),done:s=>has(s,'cadence')},
 {id:'watch',title:'Regardez l’accord monter',text:'Touchez le résonateur. Chaque livraison rapprochée ajoute un accord ; au 4e, la qualité est ×5 et la production quintuple.',cta:{label:'Voir le résonateur',action:'journey-select',kind:'cadence'},target:'.node[data-kind="cadence"]',done:s=>flag(s,'seen-cadence')&&found(s,'accord')},
 {id:'twelve',title:'Doublez chaque livraison',text:'Touchez l’injecteur et réglez sa livraison sur 12. Deux fois plus de matière, encore assez petite pour le résonateur (≤ 12).',cta:{label:'Régler l’injecteur',action:'journey-select',kind:'intake'},target:'.node[data-kind="intake"]',done:s=>intake(s)?.param===12},
 {id:'batch',title:'Formez de gros lots',text:'L’accumulateur réunit les livraisons. À 80 matières, la presse donne ×8. Ajoutez-le, touchez-le et réglez son seuil sur 80.',cta:{label:'＋ Accumulateur',action:'add-module',kind:'batch'},target:'[data-offer="batch"]',goal:s=>has(s,'batch')?null:budget(s,'batch'),done:s=>found(s,'bulk')},
 {id:'order',title:'L’ordre des machines compte',text:'Le marqueur laisse une empreinte par livraison ; le tisseur change les empreintes en qualité. Placez le marqueur avant l’accumulateur, le tisseur après. Appui long puis glisser pour déplacer.',cta:{label:'＋ Marqueur',action:'add-module',kind:'stamp'},target:'[data-offer="stamp"]',goal:s=>has(s,'stamp')?(has(s,'weave')?null:budget(s,'weave')):budget(s,'stamp'),done:s=>found(s,'order')},
 {id:'end',title:'Vous savez inventer',text:'Le reste du laboratoire s’ouvre : de nouvelles familles, une deuxième installation, des contrats. Chaque nouveauté vous sera présentée à son arrivée.',cta:{label:'Continuer seul',action:'journey-finish'},done:s=>flag(s,'finished')}
];
// Second weaver step: the "order" CTA switches to the weaver once the marker is placed.
export function stepCta(s:State,step:Step) {if(step.id==='order'&&has(s,'stamp')&&!has(s,'weave'))return {label:'＋ Tisseur',action:'add-module',kind:'weave' as Kind};return step.cta;}
export function startJourney(s:State) {
 s.journey={step:0,manual:0,flags:[]};s.plants.A.stock.components=0;
 const m=intake(s);if(m)m.manual=true;return s;
}
export const journeyActive=(s:State)=>!!s.journey&&s.journey.step<JOURNEY.length;
export const currentStep=(s:State)=>journeyActive(s)?JOURNEY[s.journey!.step]:null;
// Advance through every step already satisfied (a player may do things ahead of the guide).
export function advanceJourney(s:State) {
 let moved=false;while(journeyActive(s)&&JOURNEY[s.journey!.step].done(s)){s.journey!.step++;moved=true;}return moved;
}
export function journeyFlag(s:State,f:string) {if(s.journey&&!s.journey.flags.includes(f))s.journey.flags.push(f);}
// What the interface shows, by stage. A save without a journey (older games) sees everything.
export function reveal(s:State,feature:string) {
 if(!s.journey)return true;const step=s.journey.step;
 // While the guide runs, later facilities and tools wait for its end, whatever the production.
 if(journeyActive(s)&&['residue','catalyst','schematic','nav-overview','nav-library','nav-bench','upgrades','add-lane','plants','progress'].includes(feature))return false;const at=(id:string)=>step>=JOURNEY.findIndex(x=>x.id===id);
 switch(feature){
  case 'ore':return at('automate');
  case 'energy':return at('resonator');
  case 'residue':case 'catalyst':return s.produced>=1000;
  case 'progress':return at('batch');
  case 'upgrades':return at('end')||s.produced>=400;
  case 'catalog':return at('resonator');
  case 'schematic':return s.plants.A.lanes.length>1||s.produced>=1000;
  case 'nav-overview':return at('end')||s.produced>=400;
  case 'nav-experiments':return at('batch')||s.produced>=50;
  case 'nav-library':case 'nav-bench':return s.produced>=1000;
  case 'nav-notebook':return (s.discoveries?.length??0)>0;
  case 'add-lane':return at('end')||s.produced>=400;
  case 'locked-offers':return at('end');
  default:return true;
 }
}
