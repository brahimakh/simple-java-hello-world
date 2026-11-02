// 1.2 « Monde » : chantiers, Serre vivante (souches et saisons) et doctrines de refondation.
// All rules are deterministic and shown to the player; nothing here is random.
import type {State} from './engine.ts';
import {mark,discover,featureOpen} from './engine.ts';

// ---------- Chantiers: long projects fed from the stocks, each with a permanent effect ----------
export interface Need {kind:'stock'|'stat';key:string;amount:number;label:string;}
export const SITES:{id:string;name:string;text:string;effect:string;needs:Need[]}[]=[
 {id:'pont',name:'Pont des échanges',text:'Une arche entre les trois installations.',effect:'Transferts entre installations ×2.',needs:[{kind:'stock',key:'components',amount:2e10,label:'composants'},{kind:'stock',key:'catalyst',amount:1e5,label:'catalyseurs'}]},
 {id:'jardin',name:'Jardins suspendus',text:'La Serre déborde sur la ville.',effect:'Production de la Serre ×10.',needs:[{kind:'stock',key:'catalyst',amount:1e6,label:'catalyseurs'},{kind:'stat',key:'crossings',amount:3,label:'croisements de souches'}]},
 {id:'phare',name:'Phare à plasma',text:'Une flamme visible depuis toute la région.',effect:'Le plasma multiplie une presse par 20 au lieu de 10.',needs:[{kind:'stock',key:'components',amount:2e11,label:'composants'},{kind:'stock',key:'plasma',amount:1e4,label:'plasma'}]},
 {id:'orgue',name:'Grand orgue',text:'Chaque métronome fait sonner un tuyau.',effect:'Le bonus du métronome double : ×(1 + 120 ÷ tempo).',needs:[{kind:'stock',key:'components',amount:1e12,label:'composants'},{kind:'stat',key:'beats',amount:5000,label:'lots relâchés en rythme'}]},
 {id:'observatoire',name:'Observatoire',text:'Pour voir plus loin que l’usine.',effect:'+1 emplacement d’amélioration sur chaque machine.',needs:[{kind:'stock',key:'components',amount:5e12,label:'composants'},{kind:'stat',key:'crystals',amount:500,label:'cristaux pressés'}]},
 {id:'tour',name:'Tour de résonance',text:'Le monument qui donne son nom au laboratoire.',effect:'Toutes les presses de la Fonderie ×4.',needs:[{kind:'stock',key:'components',amount:5e13,label:'composants'},{kind:'stat',key:'prism',amount:200,label:'lots prismatiques'},{kind:'stat',key:'assembly',amount:200,label:'lots assemblés'}]}
];
export const SITES_AT=1e10;
export interface SiteState {done:string[];paid:Record<string,number[]>;}
export const sitesOf=(s:State)=>(s.sites??={done:[],paid:{}});
export const siteDone=(s:State,id:string)=>!!s.sites?.done.includes(id);
export function siteProgress(s:State,id:string){
 const def=SITES.find(x=>x.id===id)!;const paid=s.sites?.paid[id]??def.needs.map(()=>0);
 return def.needs.map((n,i)=>n.kind==='stock'?Math.min(n.amount,paid[i]??0):Math.min(n.amount,s.stats?.[n.key]??0));
}
// Deliver what the stocks allow toward a site; statistics are counted, not spent.
export function deliverSite(s:State,id:string){
 const def=SITES.find(x=>x.id===id);if(!def||!featureOpen(s,'sites')||siteDone(s,id))return false;
 const st=sitesOf(s);const paid=(st.paid[id]??=def.needs.map(()=>0));let moved=false;
 def.needs.forEach((n,i)=>{if(n.kind!=='stock')return;const plant=n.key==='catalyst'?s.plants.B:n.key==='plasma'?s.plants.C:s.plants.A;const res=n.key as 'components';
  const give=Math.min(plant.stock[res],n.amount-paid[i]);if(give>0){plant.stock[res]-=give;paid[i]+=give;moved=true;}});
 const prog=siteProgress(s,id);if(def.needs.every((n,i)=>prog[i]>=n.amount)){st.done.push(id);delete st.paid[id];mark(s,'chantier:'+id);discover(s,'site');return true;}
 return moved;
}

// ---------- Serre vivante: strains with three traits, crossings by a shown rule, seasons ----------
export interface Strain {id:number;name:string;speed:number;yield:number;hardiness:number;}
export interface CultureState {strains:Strain[];active:number;next:number;}
export const CULTURE_AT=1e7;
export const SEASONS=[{id:'printemps',name:'Printemps',trait:'speed'},{id:'ete',name:'Été',trait:'yield'},{id:'automne',name:'Automne',trait:'hardiness'},{id:'hiver',name:'Hiver',trait:null}] as const;
export const SEASON_TICKS=6000;
export const seasonOf=(s:State)=>SEASONS[Math.floor(s.tick/SEASON_TICKS)%4];
export function cultureOf(s:State):CultureState{
 return (s.culture??={strains:[{id:1,name:'Commune',speed:1,yield:1,hardiness:1},{id:2,name:'Rapide',speed:2,yield:0,hardiness:1},{id:3,name:'Généreuse',speed:0,yield:2,hardiness:1}],active:1,next:4});
}
export const activeStrain=(s:State)=>{const c=cultureOf(s);return c.strains.find(x=>x.id===c.active)??c.strains[0];};
type Trait='speed'|'yield'|'hardiness';
const dominant=(x:Strain):Trait=>(['speed','yield','hardiness'] as Trait[]).reduce((a,b)=>x[b]>x[a]?b:a,'speed' as Trait);
// Greenhouse effects of the active strain and the season (only once cultures are open).
export function greenhouseFactor(s:State){
 if(!featureOpen(s,'culture')&&!s.culture)return 1;const x=activeStrain(s);const season=seasonOf(s);
 let f=(1+x.yield)/2;if(season.trait&&dominant(x)===season.trait)f*=2;if(!season.trait&&x.hardiness<3)f*=.5;return f;
}
export const greenhouseSpeed=(s:State)=>!featureOpen(s,'culture')&&!s.culture?1:1+activeStrain(s).speed*.25;
export const crossCost=(s:State)=>Math.round(1e3*10**Math.min(12,(s.stats?.crossings??0)));
// Crossing: for each trait the better parent wins; the trait favoured by the current season gains 1 more. Maximum 9.
export function crossStrains(s:State,a:number,b:number){
 const c=cultureOf(s);const x=c.strains.find(v=>v.id===a),y=c.strains.find(v=>v.id===b);if(!x||!y||a===b||!featureOpen(s,'culture'))return null;
 const cost=crossCost(s);if(s.plants.B.stock.catalyst<cost)return null;s.plants.B.stock.catalyst-=cost;
 const season=seasonOf(s);const child:Strain={id:c.next++,name:`Hybride ${c.next-4}`,speed:Math.max(x.speed,y.speed),yield:Math.max(x.yield,y.yield),hardiness:Math.max(x.hardiness,y.hardiness)};
 if(season.trait)child[season.trait]=Math.min(9,child[season.trait]+1);else child.hardiness=Math.min(9,child.hardiness+1);
 c.strains.push(child);if(c.strains.length>12){const drop=c.strains.findIndex(v=>v.id!==c.active&&v.id!==child.id);c.strains.splice(drop,1);}
 (s.stats??={}).crossings=(s.stats.crossings??0)+1;discover(s,'culture');mark(s,'croisement');return child;
}
export function plantStrain(s:State,id:number){const c=cultureOf(s);if(!c.strains.some(x=>x.id===id))return false;c.active=id;return true;}

// ---------- Doctrines: one rule chosen at each refoundation ----------
export const DOCTRINES=[
 {id:'vitesse',name:'Vitesse',text:'Tous les cycles de machine durent 25 % de moins.'},
 {id:'masse',name:'Masse',text:'La limite de lot double.'},
 {id:'lumiere',name:'Lumière',text:'Le tisseur double son effet (comme une spécialité).'},
 {id:'ecologie',name:'Écologie',text:'Récupérateur et échangeur rendent 100 % au lieu de 80 %.'}
] as const;
export const doctrine=(s:State,id:string)=>s.doctrine===id;
