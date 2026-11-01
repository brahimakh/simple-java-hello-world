import {MODULES,type PlantId,type Kind} from './content.ts';
import {buffer,incoming,type State,type Lane,type Machine} from './engine.ts';
import {t,formatNumber as fmt} from './i18n.ts';
const esc=(v:unknown)=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export function diagnosis(s:State,id:PlantId) {
 const ms=s.plants[id].lanes.flatMap(l=>l.machines);
 // A missing destination is a cause; upstream saturation is only its consequence.
 return ms.find(m=>m.kind==='router'&&(!m.routing||!s.plants[id].lanes.some(l=>l.id===m.routing!.target)))
 ??ms.find(m=>/insuffisante|incompatible|Seuil|Choisir|Configurer|Relier|trop grand/.test(m.status))
 ??ms.find(m=>m.connected&&/saturée|Manque de matière|Manque de résidus/.test(m.status));
}
export function routeWarning(l:Lane,m?:Machine) {
 const i=m?l.machines.indexOf(m):l.machines.length;
 const r=l.machines.slice(0,i).find(n=>n.routing&&n.routing.branch>0&&n.routing.main===0);
 return r?'Les lots empruntent la branche : les machines suivantes peuvent être contournées.':'';
}
export function insertionHint(l:Lane|undefined,k:Kind) {
 if(!l)return '';
 const press=l.machines.findIndex(m=>m.kind==='press');
 const hasRouter=l.machines.slice(0,press).some(m=>m.kind==='router');
 if(hasRouter)return MODULES[k].input==='matter'?'Ajout avant le premier aiguillage pour recevoir le flux.':'Ajout après la presse locale : si les lots partent ailleurs, placez la récupération sur la destination.';
 if(k==='stamp')return 'Prépare des empreintes pour le tisseur ; seul, ne multiplie pas la production.';
 if(k==='batch')return 'Comparez les seuils : 80 active la prime de gros lot à la Fonderie.';
 return '';
}
export function supplyHint(s:State,id:PlantId,key:'oreLevel'|'energyLevel') {
 const ms=s.plants[id].lanes.flatMap(l=>l.machines);
 const shortage=ms.some(m=>key==='oreLevel'?m.status==='Manque de matière':m.status.includes('Énergie insuffisante'));
 return shortage?'Pénurie observée : augmenter cette alimentation peut aider.':'Aucune pénurie observée. Cet achat augmente la réserve disponible, pas la vitesse des machines.';
}
export function lotDetails(s:State,id:PlantId,m:Machine) {
 const last=m.lastPacket;
 const p=m.working??m.queue[0];
 const preview=p?.kind==='matter'?p:last;
 return `<section class="lot-study"><h4>Comprendre un lot</h4>${last?`<p>${t('Dernière sortie de cette machine')} : <b>${fmt(last.qty)}</b> · ${t('Qualité')} <b>×${fmt(last.quality)}</b> · ${t('Empreintes')} <b>${fmt(last.marks)}</b></p>`:'<p>Cette machine attend son premier lot.</p>'}${m.kind==='press'&&last?.result!==undefined?`<div class="factor-chain"><span>${fmt(last.qty)} ÷ ${id==='A'?10:20}</span><span>× ${fmt(last.quality)} ${t('Qualité')}</span>${id==='A'?`<span>× ${last.bulk} ${t('Prime de lot')}</span><span>× ${last.catalysis} ${t('Catalyse')}</span>`:''}<strong>= ${fmt(last.result)} ${t(id==='A'?'Composants':'Catalyseurs')}</strong></div><p class="tiny muted">Résultat réel du dernier pressage, avant toute récompense.</p>`:''}${preview&&m.kind==='batch'?`<p>Seuil actuel : ${fmt(m.param)}. ${t(id==='A'&&m.param>=80?'Prime de presse ×8 activée dès 80 matières.':id==='A'?'Sous 80 matières : pas de prime de gros lot.':'La Serre ne reçoit pas de prime de gros lot.')}</p>`:''}${m.kind==='stamp'?'<p>Une empreinte par livraison. Avant l’accumulateur, les empreintes se réunissent ; le tisseur les transforme en qualité.</p>':''}${m.kind==='weave'?`<p>${t('Empreintes du prochain lot')} : ${fmt(p?.marks??0)} → ×${fmt(1+Math.min(7,p?.marks??0))}. ${t('Le tisseur consomme ces empreintes.')}</p>`:''}${p?`<p class="tiny muted">${t('À traiter')} : ${fmt(p.qty)} · ${t('Qualité')} ×${fmt(p.quality)} · ${fmt(p.marks??0)} ${t('empreintes')}</p>`:''}</section>`;
}
export interface ChangeObservation {before:State;tick:number;plant:PlantId;waiting:number;label:string;}
export function observeChange(before:State,id:PlantId,label:string):ChangeObservation {
 return {before,tick:before.tick,plant:id,label,waiting:before.plants[id].lanes.flatMap(l=>l.machines).filter(m=>m.kind==='press').reduce((n,m)=>n+m.queue.length,0)};
}
export function changePanel(s:State,o:ChangeObservation|null) {
 if(!o)return '';
 const seconds=(s.tick-o.tick)*.1;
 const oldEnd=o.before.history.at(-1)!,oldStart=o.before.history.find(h=>h.tick>=oldEnd.tick-600)??oldEnd;
 const oldRate=oldEnd.tick>oldStart.tick?(oldEnd.total-oldStart.total)/((oldEnd.tick-oldStart.tick)*.1):0;
 const start=s.history.find(h=>h.tick>=Math.max(o.tick,s.tick-600)),end=s.history.at(-1)!;
 const duration=start?(end.tick-start.tick)*.1:0;
 const rate=duration>0?(end.total-start!.total)/duration:0;
 const currentPresses=s.plants[o.plant].lanes.flatMap(l=>l.machines).filter(m=>m.kind==='press');
 const remaining=o.before.plants[o.plant].lanes.flatMap(l=>l.machines).filter(m=>m.kind==='press').reduce((n,old)=>{const current=currentPresses.find(m=>m.id===old.id);return n+(current?Math.max(0,old.queue.length-(current.processed-old.processed)):0);},0);
 const oldIds=new Set(Object.values(o.before.plants).flatMap(p=>p.lanes.flatMap(l=>l.machines.map(m=>m.id))));
 const added=Object.values(s.plants).flatMap(p=>p.lanes.flatMap(l=>l.machines)).filter(m=>!oldIds.has(m.id));
 return `<section class="panel change-panel" aria-live="polite"><div class="section-head"><h3>Observer ma modification</h3><button data-action="change-dismiss" aria-label="Fermer l’observation">✕</button></div><p>${esc(t(o.label))} · ${fmt(seconds)} ${t('s de simulation écoulées')}</p><div class="change-metrics"><div><small>Avant · moyenne disponible</small><strong>${fmt(oldRate)}/s</strong></div><div><small>Depuis · fenêtre disponible</small><strong>${duration>0?fmt(rate)+'/s':'—'}</strong><small>${fmt(duration)} s</small></div></div><p>${t('Lots déjà devant les presses à la modification')} : <b>${fmt(o.waiting)}</b>. ${t('Ils gardent leurs anciennes propriétés. Une presse traite au plus un lot par seconde ; les blocages peuvent prolonger l’attente.')}</p>${o.waiting?`<label>${t('Lots initiaux encore en attente')} : ${fmt(remaining)} / ${fmt(o.waiting)}<progress max="${o.waiting}" value="${o.waiting-remaining}" aria-label="Évacuation des anciens lots"></progress></label><p class="tiny muted">Ce suivi concerne les anciennes files des presses. Leur démontage rend aussi leur matière ; de nouveaux lots peuvent encore attendre en amont.</p>`:''}${added.map(m=>`<p>${esc(t(MODULES[m.kind].name))} : ${fmt(m.processed)} ${t('lots traités depuis l’ajout')}</p>`).join('')}<p class="tiny muted">Mesure du laboratoire entier. Les réserves, les files et la catalyse peuvent changer : cette observation ne prouve pas à elle seule un gain durable.</p><button data-action="change-compare" class="primary">Comparer les deux plans au banc</button></section>`;
}
