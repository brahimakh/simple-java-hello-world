// Puzzles: small sandboxes with a few modules and a budget. They never touch the real game.
// Tutorial puzzles teach one rule each; the daily puzzle is generated from the date and scored by a fixed measurement.
import type {Kind} from './content.ts';
import {createState,machine,simulate,clone,measuredRate,type State} from './engine.ts';
export interface Puzzle {id:string;name:string;goal:string;hint:string;allowed:Kind[];budget:number;lanes?:number;intake?:number;test:(s:State)=>boolean;progress:(s:State)=>number;}
const rate=(s:State)=>measuredRate(s,30);
const rateGoal=(n:number)=>({test:(s:State)=>rate(s).duration>=29.9&&rate(s).rate>=n,progress:(s:State)=>Math.min(1,rate(s).duration/30,rate(s).rate/n)});
export const PUZZLES:Puzzle[]=[
 {id:'p1',name:'Premier accord',goal:'Tenir 2 composants/s pendant 30 s.',hint:'Un résonateur aime les petites livraisons rapprochées. Regardez aussi le réglage de l’injecteur.',allowed:['cadence'],budget:60,...rateGoal(2)},
 {id:'p2',name:'Masse critique',goal:'Tenir 20 composants/s pendant 30 s.',hint:'La presse récompense les lots de 80. L’accumulateur choisit la taille du lot.',allowed:['cadence','batch'],budget:140,...rateGoal(20)},
 {id:'p3',name:'L’ordre compte',goal:'Tenir 60 composants/s pendant 30 s, sans résonateur.',hint:'Les mêmes machines ne donnent pas le même résultat dans un autre ordre. Où réunir les empreintes ?',allowed:['stamp','batch','weave'],budget:200,...rateGoal(60)},
 {id:'p4',name:'Affinage',goal:'Presser 10 lots de qualité ≥ ×10 avec un seul résonateur.',hint:'Un lot trop faible peut refaire un tour. Le rang du résonateur compte à chaque passage.',allowed:['cadence','filter'],budget:300,test:s=>(s.stats?.q1??0)>=10,progress:s=>Math.min(1,(s.stats?.q1??0)/10)},
 {id:'p5',name:'Harmonie',goal:'Obtenir 20 harmonies entre deux lignes.',hint:'Deux lignes identiques, réglées pareil, livrent au même rythme.',allowed:['harmonic'],budget:9000,lanes:2,test:s=>(s.stats?.harmony??0)>=20,progress:s=>Math.min(1,(s.stats?.harmony??0)/20)}
];
export function puzzleState(p:Puzzle):State {
 const s=createState();s.produced=2e8;s.allowed=[...p.allowed];s.puzzle=p.id;s.plants.A.stock.components=p.budget;s.plants.A.stock.ore=500;s.plants.A.stock.energy=500;
 s.log=[];s.timeline=[];s.history=[{tick:0,total:s.produced}];s.longHistory=[{tick:0,total:s.produced}];s.tierTicks=Array.from({length:8},()=>0);
 s.claimed=['first','lot','loop','duet','flow','final','plasma'];
 for(let i=1;i<(p.lanes??1);i++)s.plants.A.lanes.push({id:s.nextId++,name:`Ligne 0${i+1}`,capsule:false,machines:[machine(s,'intake',0),machine(s,'press',0)]});
 return s;
}

// ---------- Daily puzzle: same rules for everyone on the same date ----------
function rng(seed:number){return ()=>{seed=(seed*1664525+1013904223)>>>0;return seed/2**32;};}
const POOL:Kind[]=['cadence','batch','stamp','weave','split','filter','charge','mirror','furnace','compress'];
export function dailyKey(date=new Date()){return date.toISOString().slice(0,10);}
export function dailyPuzzle(key=dailyKey()):Puzzle {
 const r=rng(Number(key.replace(/-/g,'')));const pool=[...POOL];const allowed:Kind[]=[];
 const count=3+Math.floor(r()*2);while(allowed.length<count){allowed.push(pool.splice(Math.floor(r()*pool.length),1)[0]);}
 const budget=200+Math.round(r()*8)*50;
 return {id:'daily-'+key,name:'Puzzle du jour',goal:`Meilleur débit mesuré avec ${allowed.length} familles et ${budget} composants.`,hint:'Construisez, puis lancez la mesure : 60 s de chauffe et 120 s de mesure, depuis des machines vides.',allowed,budget,test:()=>false,progress:()=>0};
}
// Score: the layout restarts empty with the puzzle's supplies, warms up 60 s, then is measured for 120 s.
export function measureDaily(s:State):number {
 const trial=clone(s);trial.paused=false;trial.fault=null;trial.pending=[];trial.transit=[];trial.plants.A.stock.ore=500;trial.plants.A.stock.energy=500;
 for(const l of trial.plants.A.lanes)for(const m of l.machines){m.queue=[];m.working=null;m.clock=0;m.streak=0;m.last=-1000;delete m.heat;delete m.memory;delete m.memoryAt;}
 simulate(trial,60);const start=trial.produced;simulate(trial,120);return trial.fault?0:(trial.produced-start)/120;
}
