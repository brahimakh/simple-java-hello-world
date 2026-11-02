// Optional online features, available only when the game runs as a claude.ai page with a shared database.
// Everything degrades to "absent": the local game never waits for, or depends on, these calls.
type Doc={exists:boolean;id:string;data():Record<string,unknown>|undefined};
type Ref={get():Promise<Doc>;set(d:Record<string,unknown>):Promise<void>};
type Coll={doc(id?:string):Ref;get():Promise<{docs:Doc[]}>};
interface DB {doc(path:string):Ref;collection(path:string):Coll;}
interface User {id():Promise<string|null>;profiles(ids:string[]):Promise<Record<string,{name:string}>>;}
export interface Cloud {db:DB;user:User;me:string;}
let cloud:Cloud|null=null;let starting:Promise<Cloud|null>|null=null;
export const cloudReady=()=>cloud;
export function startCloud():Promise<Cloud|null> {
 if(starting)return starting;
 starting=(async()=>{try{
  const c=(globalThis as {claude?:{use?:(n:string)=>Promise<unknown>}}).claude;if(!c?.use)return null;
  const [db,user]=await Promise.all([c.use('db') as Promise<DB|null>,c.use('user') as Promise<User|null>]);if(!db||!user)return null;
  const me=await user.id();if(!me)return null;cloud={db,user,me};return cloud;
 }catch{return null;}})();
 return starting;
}
// ---------- Compressed cloud save (documents are limited to 256 KiB) ----------
async function gzip(text:string){const s=new Blob([text]).stream().pipeThrough(new CompressionStream('gzip'));const buf=new Uint8Array(await new Response(s).arrayBuffer());let bin='';for(const b of buf)bin+=String.fromCharCode(b);return btoa(bin);}
async function gunzip(b64:string){const bytes=Uint8Array.from(atob(b64),c=>c.charCodeAt(0));const s=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));return await new Response(s).text();}
export async function cloudSave(json:string,produced:number) {
 if(!cloud)throw Error('Sauvegarde en ligne indisponible.');const gz=await gzip(json);if(gz.length>240_000)throw Error('Partie trop volumineuse pour la sauvegarde en ligne.');
 await cloud.db.doc(`data/users/${cloud.me}/save`).set({gz,produced,at:new Date().toISOString()});
}
export async function cloudLoad():Promise<{json:string;produced:number;at:string}|null> {
 if(!cloud)return null;const d=await cloud.db.doc(`data/users/${cloud.me}/save`).get();const x=d.data();
 if(!d.exists||!x||typeof x.gz!=='string')return null;return {json:await gunzip(x.gz),produced:Number(x.produced)||0,at:String(x.at??'')};
}
// ---------- Shared gallery: each player keeps up to 12 published inventions in their own document ----------
export interface GalleryItem {owner:string;name:string;code:string;rate:number;at:string;votes:number;mine:boolean;voted:boolean;author:string;}
export async function publishInvention(item:{name:string;code:string;rate:number}) {
 if(!cloud)throw Error('Galerie indisponible.');const ref=cloud.db.doc(`gallery/${cloud.me}`);const d=await ref.get();
 const items=(Array.isArray(d.data()?.items)?d.data()!.items as Record<string,unknown>[]:[]).filter(x=>x&&x.code!==item.code).slice(-11);
 items.push({...item,at:new Date().toISOString()});await ref.set({items});
}
export async function listGallery():Promise<GalleryItem[]> {
 if(!cloud)return [];const [g,v]=await Promise.all([cloud.db.collection('gallery').get(),cloud.db.collection('votes').get()]);
 const counts=new Map<string,number>();let mine:string[]=[];
 for(const d of v.docs){const ids=d.data()?.ids;if(!Array.isArray(ids))continue;for(const id of ids.slice(0,200))if(typeof id==='string')counts.set(id,(counts.get(id)??0)+1);if(d.id===cloud.me)mine=ids.filter((x:unknown)=>typeof x==='string');}
 const items:GalleryItem[]=[];
 for(const d of g.docs){const list=d.data()?.items;if(!Array.isArray(list))continue;for(const x of list.slice(0,12)){if(!x||typeof x.code!=='string'||typeof x.name!=='string')continue;const key=`${d.id}:${x.at}`;items.push({owner:d.id,name:String(x.name).slice(0,48),code:x.code.slice(0,4000),rate:Number(x.rate)||0,at:String(x.at),votes:counts.get(key)??0,mine:d.id===cloud.me,voted:mine.includes(key),author:''});}}
 const names=await cloud.user.profiles([...new Set(items.map(x=>x.owner))]).catch(()=>({} as Record<string,{name:string}>));
 for(const x of items)x.author=names[x.owner]?.name||'';
 return items.sort((a,b)=>b.votes-a.votes||b.rate-a.rate).slice(0,60);
}
export async function toggleVote(key:string) {
 if(!cloud)return;const ref=cloud.db.doc(`votes/${cloud.me}`);const d=await ref.get();let ids=Array.isArray(d.data()?.ids)?(d.data()!.ids as string[]):[];
 ids=ids.includes(key)?ids.filter(x=>x!==key):[...ids,key].slice(-200);await ref.set({ids});
}
// ---------- Daily puzzle leaderboard: one document per player, best score per date ----------
export async function submitScore(date:string,score:number) {
 if(!cloud)return;const ref=cloud.db.doc(`scores/${cloud.me}`);const d=await ref.get();const best={...(d.data()?.best as Record<string,number>??{})};
 if(best[date]!==undefined&&best[date]>=score)return;best[date]=score;const keys=Object.keys(best).sort().slice(-60);await ref.set({best:Object.fromEntries(keys.map(k=>[k,best[k]]))});
}
export async function leaderboard(date:string):Promise<{name:string;score:number;mine:boolean}[]> {
 if(!cloud)return [];const s=await cloud.db.collection('scores').get();
 const rows=s.docs.map(d=>({id:d.id,score:Number((d.data()?.best as Record<string,number>|undefined)?.[date])})).filter(x=>Number.isFinite(x.score)).sort((a,b)=>b.score-a.score).slice(0,10);
 const names=await cloud.user.profiles(rows.map(r=>r.id)).catch(()=>({} as Record<string,{name:string}>));
 return rows.map(r=>({name:names[r.id]?.name||'',score:r.score,mine:r.id===cloud!.me}));
}
// Access rules declared with the page: everyone reads, each player writes only their own documents.
export const CLOUD_RULES=[{path:'gallery',read:'view',write:'owner'},{path:'gallery/{self}',write:'interact'},{path:'votes',read:'view',write:'owner'},{path:'votes/{self}',write:'interact'},{path:'scores',read:'view',write:'owner'},{path:'scores/{self}',write:'interact'}];
