import {MODULES,UNLOCKS,type Kind,type PlantId} from './content.ts';
import {buffer,incoming,type State,type Machine} from './engine.ts';
import {t,formatNumber as fmt} from './i18n.ts';
import {routeWarning} from './insights.ts';
const esc=(s:unknown)=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const paths:Record<Kind,string>={
 intake:'M4 5h16v5H4z M8 10v5h8v-5 M12 15v6 m-3-3 3 3 3-3',
 press:'M5 3h14 M8 3v7h8V3 M5 15h14v5H5z M12 10v4 m-3-3 3 3 3-3',
 cadence:'M2 12h3l3-7 4 14 4-14 3 7h3',batch:'M5 3h14v18H5z M8 7h8 M8 11h8 M8 15h8 M8 18h8',
 charge:'M5 5h14v14H5z M14 7l-5 6h5l-3 5',sync:'M3 5v6l5 5h8l5-5V5 M12 16v6 M8 5v6 M16 5v6',
 recovery:'M5 8a8 8 0 1 1-1 8 M5 3v5h5 M8 12h8 m-4-4v8',exchanger:'M3 7h17 m-4-4 4 4-4 4 M21 17H4 m4-4-4 4 4 4',
 stamp:'M8 3h8v7l3 4v4H5v-4l3-4z M3 22h18 M10 6h4',weave:'M3 5l18 14 M3 19L21 5 M3 12h18 M8 3v18 M16 3v18',router:'M3 12h7l7-7h4 M10 12l7 7h4 M17 2l4 3-4 3 M17 16l4 3-4 3'
};
export function moduleSymbol(kind:Kind) {return `<svg viewBox="0 0 24 24" class="module-symbol" aria-hidden="true"><path d="${paths[kind]}"/></svg>`;}
export function family(kind:Kind) {return ['intake'].includes(kind)?'supply':['press'].includes(kind)?'output':['recovery','exchanger'].includes(kind)?'recovery':kind==='router'?'routing':'process';}
export function flowActive(s:State,m:Machine) {return !s.paused&&!!m.lastPacket&&s.tick-m.lastPacket.tick<=8;}
export function progressDeck(s:State) {
 const stages=[{at:0,text:'Démarrage'},{at:10,text:'Cadence'},{at:30,text:'Empreintes'},{at:60,text:'Réseau'},{at:80,text:'Tissage'},{at:400,text:'Récupération'},{at:1000,text:'Coopération'},{at:500000,text:'Résonance'}];
 const nextUnlock=UNLOCKS.find(u=>u.at>s.produced);const goal=nextUnlock?.at??500000;
 const nextModule=Object.values(MODULES).find(m=>m.unlock===goal)?.name??(goal===1000?'Serre catalytique':'Le cœur de Résonance');
 const previous=[0,...UNLOCKS.map(u=>u.at)].filter(n=>n<goal&&n<=s.produced).at(-1)??0;
 const fraction=Math.max(0,Math.min(1,(s.produced-previous)/Math.max(1,goal-previous)));
 return `<section class="progress-deck" aria-label="Progression du laboratoire"><div class="progress-heading"><div><span class="eyebrow">LE LABORATOIRE PREND FORME</span><h2>${s.produced>=500000?'Objectif atteint · continuez à inventer':'Prochaine possibilité'} <span class="next-unlock">${esc(t(nextModule))}</span></h2></div><div class="lifetime-total"><strong>${fmt(s.produced)}</strong><small>composants cumulés</small></div></div><div class="next-progress"><progress value="${fraction}" max="1" aria-label="Prochain déblocage"></progress><span>${fmt(Math.min(s.produced,goal))} / ${fmt(goal)}</span></div><ol class="milestone-track">${stages.map((m,i)=>`<li class="${s.produced>=m.at?'achieved':''}"><span class="milestone-dot">${s.produced>=m.at?'✓':String(i+1).padStart(2,'0')}</span><div><strong>${m.text}</strong><small>${fmt(m.at)}</small></div></li>`).join('')}</ol><p class="industrial-goal">Objectif industriel : 500 000 composants cumulés. Les dépenses ne retirent aucun déblocage.</p>${s.produced>=1000?`<p class="suggestion-note">${t(`Défis réussis : ${s.challenges?.completed.length??0} / 3`)} <button data-action="nav" data-view="experiments">Voir les défis d’invention</button></p>`:''}</section>`;
}
export function networkOverview(s:State,id:PlantId,selected:number) {
 const lanes=s.plants[id].lanes;if(!lanes.length)return '';
 const width=900,height=Math.max(142,lanes.length*105+50),start=150,span=670;
 const maxNodes=Math.max(2,...lanes.map(l=>l.machines.length));const dx=span/Math.max(1,maxNodes-1),size=Math.min(48,dx*.65);
 const coords=new Map<number,{x:number;y:number}>();lanes.forEach((l,row)=>l.machines.forEach((m,col)=>coords.set(m.id,{x:start+col*dx,y:53+row*105})));
 const links:string[]=[];
 for(const l of lanes)l.machines.forEach((m,i)=>{const a=coords.get(m.id)!;const next=l.machines[i+1];
   if(next){const b=coords.get(next.id)!;links.push(`<path d="M${a.x+size/2} ${a.y} H${b.x-size/2}" marker-end="${m.connected?'url(#flow-arrow)':''}" class="network-link ${m.connected?'':'link-open'} ${m.routing?.lastBranch?'link-open':''} ${flowActive(s,m)&&!m.routing?.lastBranch?'flow-live':''}"/>`);}
   if(m.routing&&!m.routing.target){links.push(`<text class="route-caption" x="${a.x+8}" y="${a.y+size/2+18}">${esc(t('Destination manquante'))}</text>`);}
   if(m.routing?.target){const target=lanes.find(dest=>dest.id===m.routing!.target)?.machines[1];if(target){const b=coords.get(target.id)!;const bend=32;links.push(`<path d="M${a.x} ${a.y+size/2} C${a.x} ${a.y+bend},${b.x-38} ${b.y+bend},${b.x} ${b.y+size/2}" marker-end="${m.connected?'url(#branch-arrow)':''}" class="network-link branch-link ${m.connected?'':'link-open'} ${flowActive(s,m)&&m.routing.lastBranch?'flow-live route-preferred':''}"/><text class="route-caption" x="${a.x+8}" y="${a.y+size/2+18}">${esc(t(m.routing.mode==='large'?`≥ ${m.routing.threshold}`:m.routing.mode==='small'?`≤ ${m.routing.threshold}`:m.routing.mode==='alternate'?'1 / 2':'surplus'))}</text>`);}}
 });
 return `<div class="network-frame"><div class="network-caption"><span><i class="dot"></i> SCHÉMA VIVANT</span><small>Les impulsions correspondent aux livraisons réelles.</small></div><svg class="network-map" viewBox="0 0 ${width} ${height}" role="img" aria-label="Connexions entre les lignes de production"><defs><marker id="flow-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0 0L6 3L0 6Z" fill="#8fc6ac"/></marker><marker id="branch-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0 0L6 3L0 6Z" fill="#e7b679"/></marker><pattern id="schematic-grid" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".7" fill="#668579" opacity=".18"/></pattern></defs><rect width="${width}" height="${height}" fill="url(#schematic-grid)"/>${links.join('')}${lanes.map((l,row)=>`<g class="network-lane ${l.id===selected?'selected-lane':''}"><text x="20" y="${46+row*105}" class="network-row-label" data-user-text>${esc(l.name.slice(0,17))}</text><text x="20" y="${65+row*105}" class="network-row-meta">${l.machines.length} machines</text>${l.machines.map(m=>{const a=coords.get(m.id)!;return `<g data-action="network-module" data-lane="${l.id}" data-id="${m.id}" class="network-machine family-${family(m.kind)} ${flowActive(s,m)?'machine-live':''} ${routeWarning(l,m)?'machine-bypassed':''}" role="button" tabindex="0" aria-label="${esc(t(MODULES[m.kind].name))}"><title>${esc(t(MODULES[m.kind].name))} · ${esc(t(m.status))}</title><rect x="${a.x-size/2}" y="${a.y-size/2}" width="${size}" height="${size}" rx="10"/><g transform="translate(${a.x-12},${a.y-12})"><path d="${paths[m.kind]}" class="symbol-path"/></g><text x="${a.x}" y="${a.y+size/2+15}" text-anchor="middle" class="network-buffer">${fmt(buffer(m)+incoming(s,m))}</text></g>`;}).join('')}</g>`).join('')}</svg><div class="network-legend"><span><i class="legend-dot"></i> Flux local</span><span><i class="legend-dot amber"></i> Branche entre lignes</span><span><i class="legend-dot quiet"></i> En attente</span></div></div>`;
}
