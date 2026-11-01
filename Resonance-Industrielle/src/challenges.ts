import type {State} from './engine.ts';
export const CHALLENGES=[
 {id:'economy',name:'Puissance sobre',description:'Sur 60 s : produire 6 000 composants, récupérer 500 matières et préserver la réserve d’énergie de Fonderie. Pendant cet essai, sa génération est limitée à 8 énergie/s ; vos niveaux sont conservés et reprennent ensuite.'},
 {id:'network',name:'Deux sorties, une invention',description:'Sur 60 s : livrer au moins 5 lots locaux et 5 lots de branche par les aiguillages de Fonderie ; deux presses de Fonderie doivent produire chacune au moins 300 composants.'},
 {id:'symbiosis',name:'Symbiose industrielle',description:'Sur 60 s : produire 10 000 composants et 30 catalyseurs, puis transférer au moins 20 catalyseurs vers la Fonderie.'}
] as const;
export interface ChallengeRun {id:string;start:number;signature:string;produced:number;catalysts:number;recovered:number;energy:number;returned:number;main:number;branch:number;presses:Record<string,number>;}
export interface ChallengeState {active:ChallengeRun|null;completed:string[];result?:{id:string;success:boolean;reason:'changed'|'targets'|'success';values?:number[]};}
export function challengeRequirements(id:string) {return id==='economy'?{goals:[6000,500,1],labels:['Composants produits','Matières récupérées','Énergie préservée']}:id==='network'?{goals:[5,5,2],labels:['Lots locaux','Lots de branche','Presses ayant produit 300 composants']}:{goals:[10000,30,20],labels:['Composants produits','Catalyseurs produits','Catalyseurs transférés']};}
const machines=(s:State)=>s.plants.A.lanes.flatMap(l=>l.machines);
export function layoutSignature(s:State) {return JSON.stringify([Object.values(s.plants).map(p=>[p.oreLevel,p.energyLevel,p.catalystOn,p.lanes.map(l=>[l.id,l.machines.map(m=>[m.id,m.kind,m.param,m.connected,m.routing?.mode,m.routing?.threshold,m.routing?.target])])]),s.transfers.map(t=>t.enabled)]);}
export function startChallenge(s:State,id:string) {
 if(s.produced<1000||s.challenges?.active||!CHALLENGES.some(c=>c.id===id))return false;
 const ms=machines(s);s.challenges??={active:null,completed:[]};delete s.challenges.result;
 s.challenges.active={id,start:s.tick,signature:layoutSignature(s),produced:s.produced,catalysts:s.catalystProduced,recovered:s.recovered,energy:s.plants.A.stock.energy,returned:s.transfers[1].moved,main:ms.reduce((n,m)=>n+(m.routing?.main??0),0),branch:ms.reduce((n,m)=>n+(m.routing?.branch??0),0),presses:Object.fromEntries(ms.filter(m=>m.kind==='press').map(m=>[m.id,m.made??0]))};return true;
}
export function challengeProgress(s:State) {
 const r=s.challenges?.active;if(!r)return null;const ms=machines(s);
 const presses=ms.filter(m=>m.kind==='press'&&(m.made??0)-(r.presses[m.id]??0)>=300).length;
 const values=r.id==='economy'?[s.produced-r.produced,s.recovered-r.recovered,s.plants.A.stock.energy+1e-6>=r.energy?1:0]:r.id==='network'?[ms.reduce((n,m)=>n+(m.routing?.main??0),0)-r.main,ms.reduce((n,m)=>n+(m.routing?.branch??0),0)-r.branch,presses]:[s.produced-r.produced,s.catalystProduced-r.catalysts,s.transfers[1].moved-r.returned];
 const {goals,labels}=challengeRequirements(r.id);
 return {seconds:Math.min(60,(s.tick-r.start)*.1),values,goals,labels,passed:values.every((v,i)=>v+1e-6>=goals[i])};
}
export function updateChallenge(s:State) {
 const c=s.challenges,r=c?.active;if(!c||!r)return;
 if(layoutSignature(s)!==r.signature){c.result={id:r.id,success:false,reason:'changed'};c.active=null;return;}
 if(s.tick-r.start<600)return;
 const progress=challengeProgress(s)!,success=progress.passed;
 if(success&&!c.completed.includes(r.id))c.completed.push(r.id);
 c.result={id:r.id,success,reason:success?'success':'targets',values:progress.values};c.active=null;
}
