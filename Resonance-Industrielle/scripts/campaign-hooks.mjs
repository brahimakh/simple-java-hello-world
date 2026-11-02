// Mechanics added after 0.8, used by the scripted players.
import {setVariant} from '../src/engine.ts';
export function decide(s,say){
 // 0.9: gear mould on presses fed by large batches.
 if(s.produced>=5e4)for(const l of s.plants.A.lanes){const press=l.machines.find(m=>m.kind==='press');if(press&&!press.variant&&l.machines.some(m=>m.kind==='batch'||m.kind==='compress')&&setVariant(s,press,2))say('moule engrenage');}
}
export const afterInsert=undefined;
// 1.0: take the first prototype offered (a real player would choose to fit their line).
import {chooseProto} from '../src/progression.ts';
export function decide2(s,say){const offer=s.protos?.offer;if(offer?.length&&chooseProto(s,offer[0]))say('prototype '+offer[0]);}
