// Invention codes: a short text that carries a plan (machines, settings, order), never stocks or cycles.
import {checkBlueprint} from './save.ts';
import type {Blueprint} from './engine.ts';
const PREFIX='RI1-';
const toBase64=(text:string)=>btoa(String.fromCharCode(...new TextEncoder().encode(text))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const fromBase64=(code:string)=>new TextDecoder().decode(Uint8Array.from(atob(code.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0)));
export function encodeBlueprint(b:Blueprint) {
 const compact={n:b.name,m:b.machines.map(m=>[m.kind,m.param,m.connected?1:0,m.variant??-1,m.routing?[m.routing.mode,m.routing.threshold]:0])};
 return PREFIX+toBase64(JSON.stringify(compact));
}
export function decodeBlueprint(code:string):Blueprint {
 const text=code.trim();if(!text.startsWith(PREFIX)||text.length>4000)throw Error('Code d’invention non reconnu.');
 let raw:{n:unknown;m:unknown};try{raw=JSON.parse(fromBase64(text.slice(PREFIX.length)));}catch{throw Error('Code d’invention illisible.');}
 if(!raw||typeof raw.n!=='string'||!Array.isArray(raw.m))throw Error('Code d’invention illisible.');
 const b:Blueprint={name:raw.n.slice(0,48)||'Invention',machines:(raw.m as unknown[][]).map(x=>{
  const [kind,param,connected,variant,routing]=x as [string,number,number,number,[string,number]|0];
  return {kind,param,connected:connected===1,...(typeof variant==='number'&&variant>=0?{variant}:{}),...(routing?{routing:{target:0,mode:routing[0],threshold:routing[1]}}:{})} as Blueprint['machines'][number];})};
 try{checkBlueprint(b);}catch{throw Error('Code d’invention invalide.');}
 return b;
}
