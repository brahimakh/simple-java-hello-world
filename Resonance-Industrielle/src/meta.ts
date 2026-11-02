// Preferences and records that outlive a single game: best times, display options, engineer mode.
// Stored per browser, separately from the save; never required to play.
import type {State,Variant} from './engine.ts';
export const META_KEY='resonance-industrielle-meta-v1';
export interface Meta {best:Partial<Record<Variant,number[]>>;engineer:boolean;theme:string;zoom:number;contrast:boolean;music:boolean;puzzles:Record<string,number>;daily:Record<string,number>;}
export const defaultMeta=():Meta=>({best:{},engineer:false,theme:'default',zoom:1,contrast:false,music:false,puzzles:{},daily:{}});
export function readMeta(storage:Storage):Meta {
 const m=defaultMeta();
 try{const raw=JSON.parse(storage.getItem(META_KEY)??'{}');
  if(raw&&typeof raw==='object'){
   if(raw.best&&typeof raw.best==='object')for(const v of ['standard','slow','small','nores'] as Variant[]){const b=raw.best[v];if(Array.isArray(b)&&b.length<=21&&b.every((n:unknown)=>typeof n==='number'&&Number.isFinite(n)&&n>=0))m.best[v]=b;}
   m.engineer=raw.engineer===true;m.contrast=raw.contrast===true;m.music=raw.music===true;
   if(['default','neon','blueprint','paper'].includes(raw.theme))m.theme=raw.theme;
   if([.85,1,1.15,1.3].includes(raw.zoom))m.zoom=raw.zoom;
   for(const k of ['puzzles','daily'] as const)if(raw[k]&&typeof raw[k]==='object')for(const [id,v] of Object.entries(raw[k]))if(/^[\w-]{1,32}$/.test(id)&&typeof v==='number'&&Number.isFinite(v)&&Object.keys(m[k]).length<400)m[k][id]=v;
  }
 }catch{}
 return m;
}
export function writeMeta(storage:Storage,m:Meta) {try{storage.setItem(META_KEY,JSON.stringify(m));}catch{}}
// Keeps, for each order of magnitude, the fastest time ever reached in this mode.
export function recordBest(m:Meta,s:State) {
 const v=s.variant??'standard';const ticks=s.tierTicks??[];const best=m.best[v]??[];let changed=false;
 ticks.forEach((t,i)=>{if(best[i]===undefined||t<best[i]){best[i]=t;changed=true;}});
 if(changed)m.best[v]=best;if(s.produced>=1e6&&!m.engineer){m.engineer=true;changed=true;}
 return changed;
}
// Compare the current run with the record at the last order of magnitude reached.
export function ghostDelta(m:Meta,s:State) {
 const best=m.best[s.variant??'standard'];const ticks=s.tierTicks??[];const i=ticks.length-1;
 if(!best||i<2||best[i]===undefined)return null;return {order:i+1,delta:(ticks[i]-best[i])*.1};
}
