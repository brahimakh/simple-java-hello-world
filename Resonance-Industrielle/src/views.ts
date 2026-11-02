// Pages for the long game: notebook (discoveries, badges, records) and contracts (patents, refoundation).
import {MODULES,TIERS} from './content.ts';
import {unlocked,measuredRate,type State} from './engine.ts';
import {PROTOTYPES,DISCOVERIES,BADGES,THEMES,PATENTS,contractOffers,contractProgress,contractText,progressOf,canRefound,legacyFor,discoveryCount,REFOUND_AT,CONTRACTS_AT} from './progression.ts';
import {t,formatCompact as fmt} from './i18n.ts';
import {ghostDelta,type Meta} from './meta.ts';
const btn=(action:string,text:string,extra='',disabled=false)=>`<button data-action="${action}" ${extra} ${disabled?'disabled':''}>${text}</button>`;
export const clock=(tick:number)=>{const sec=Math.floor(tick*.1);const h=Math.floor(sec/3600),m=Math.floor(sec/60)%60,s=sec%60;return `${h?h+':'+String(m).padStart(2,'0'):m}:${String(s).padStart(2,'0')}`;};
export const power=(n:number)=>{const sup='⁰¹²³⁴⁵⁶⁷⁸⁹';return '10'+String(n).split('').map(d=>sup[Number(d)]).join('');};

export function timelineLabel(text:string) {
 const [kind,id]=text.split(':');
 if(kind==='découverte')return `${t('Découverte')} · ${t(DISCOVERIES.find(d=>d.id===id)?.name??id)}`;
 if(kind==='badge')return `${t('Badge')} · ${t(BADGES.find(d=>d.id===id)?.name??id)}`;
 if(kind==='brevet')return `${t('Brevet')} · ${t(PATENTS.find(d=>d.id===id)?.name??id)}`;
 if(kind==='contrat')return t('Contrat rempli');
 if(kind==='refondation')return t('Refondation du laboratoire');
 if(kind==='eureka')return t('Eurêka');if(kind==='chantier')return t('Chantier achevé');if(kind==='croisement')return t('Croisement de souches');if(kind==='prototype')return `${t('Prototype')} · ${t(PROTOTYPES.find(x=>x.id===id)?.name??id)}`;if(kind==='prototype-offert')return t('Prototype proposé');if(kind==='spécialité')return `${t('Spécialité')} · ${t(id)}`;
 return t(text);
}

// Production on a logarithmic scale since the start of the run, with the personal record as a ghost line.
export function logChart(s:State,ghost?:number[]) {
 const h=s.longHistory??[{tick:0,total:0}];const end=Math.max(s.tick,1,...(ghost??[]).filter(n=>n<=s.tick*3));
 const top=Math.max(3,Math.ceil(Math.log10(Math.max(10,s.produced)))+1);
 const W=640,H=200,L=44,B=24;const x=(tick:number)=>L+(W-L-8)*tick/end;const y=(v:number)=>H-B-(H-B-8)*Math.log10(Math.max(1,v))/top;
 const pts=[...h,{tick:s.tick,total:s.produced}].map(p=>`${x(p.tick).toFixed(1)},${y(p.total).toFixed(1)}`).join(' ');
 const ghostPts=ghost?.length?[`${x(0)},${y(1)}`,...ghost.filter(n=>n<=end).map((tick,i)=>`${x(tick).toFixed(1)},${y(10**(i+1)).toFixed(1)}`)].join(' '):'';
 const grid=Array.from({length:Math.floor(top/3)+1},(_,i)=>i*3).map(k=>`<line x1="${L}" x2="${W-8}" y1="${y(10**k)}" y2="${y(10**k)}" class="grid-line"/><text x="${L-6}" y="${y(10**k)+4}" text-anchor="end" class="axis-label">${k?power(k):'1'}</text>`).join('');
 const marks=(s.timeline??[]).filter(e=>e.tick<=s.tick).map(e=>{const near=h.reduce((a,b)=>Math.abs(b.tick-e.tick)<Math.abs(a.tick-e.tick)?b:a,h[0]);return `<circle cx="${x(e.tick).toFixed(1)}" cy="${y(near.total).toFixed(1)}" r="3" class="timeline-dot"><title>${timelineLabel(e.text)} · ${clock(e.tick)}</title></circle>`;}).join('');
 return `<svg class="log-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${t('Production cumulée, échelle logarithmique')}">${grid}${ghostPts?`<polyline points="${ghostPts}" class="ghost-line"/>`:''}<polyline points="${pts}" class="log-line"/>${marks}<text x="${L}" y="${H-6}" class="axis-label">0:00</text><text x="${W-8}" y="${H-6}" text-anchor="end" class="axis-label">${clock(end)}</text></svg>`;
}

export function notebookPage(s:State,meta:Meta,ghostBase:Meta) {
 const p=progressOf(s);const found=new Map((s.discoveries??[]).map(d=>[d.id,d.tick]));
 const delta=ghostDelta(ghostBase,s);const tier=TIERS.filter(x=>s.produced>=x.at).at(-1);
 return `<div class="section-head"><div><span class="eyebrow">CARNET DE LABORATOIRE</span><h2>Ce que vous avez compris</h2></div><span class="count-pill">${discoveryCount(s)} / ${DISCOVERIES.length} ${t('découvertes')}</span></div>
 <section class="panel"><div class="chart-head"><h3>Croissance de la partie</h3><span class="muted">${tier?t(tier.name):t('Laboratoire naissant')} · ${fmt(s.produced)} ${t('composants cumulés')}</span></div>${logChart(s,ghostBase.best[s.variant??'standard'])}
 <p class="tiny muted">${t('Échelle logarithmique : chaque trait est un ordre de grandeur. Les points marquent vos découvertes, badges et déblocages. La ligne pointillée est votre record.')}</p>
 ${delta?`<p class="ghost-note ${delta.delta<=0?'ahead':''}">${delta.delta<=0?t('En avance sur votre record'):t('En retard sur votre record')} · ${power(delta.order)} · ${clock(Math.abs(delta.delta)*10)}</p>`:''}
 <div class="tier-row">${(s.tierTicks??[]).map((tick,i)=>`<span><b>${power(i+1)}</b> ${clock(tick)}</span>`).join('')}</div></section>
 ${(s.eurekas??[]).length?`<section class="panel"><h3>Moments Eurêka</h3><div class="eureka-list">${[...(s.eurekas??[])].reverse().map(e=>`<div><b>×${fmt(e.ratio)}</b><span>${fmt(e.before)}/s → ${fmt(e.after)}/s</span><small>${clock(e.tick)}</small></div>`).join('')}</div></section>`:''}
 <section class="panel"><h3>Découvertes</h3><p class="muted">${t('Le carnet reconnaît les combinaisons remarquables quand elles se produisent réellement. Les découvertes manquantes restent masquées ; seule la famille concernée est indiquée quand vous la possédez.')}</p>
 <div class="discovery-grid">${DISCOVERIES.map(d=>found.has(d.id)?`<article class="discovery found"><span class="eyebrow">✦ ${clock(found.get(d.id)!)}</span><h4>${t(d.name)}</h4><p>${t(d.text)}</p></article>`:`<article class="discovery"><span class="eyebrow">???</span><h4>${unlocked(s,d.hint)?t('Concerne') +' : '+t(MODULES[d.hint].name):t('Indice verrouillé')}</h4></article>`).join('')}</div>
 ${p.legacy>1?`<p class="rule-note">${t('Mémoire du laboratoire')} : ×${fmt(p.legacy)} ${t('sur chaque presse de Fonderie (refondation).')}</p>`:''}</section>
 ${(s.protos?.owned.length??0)?`<section class="panel"><h3>Prototypes installés</h3><div class="badge-grid">${s.protos!.owned.map(id=>{const x=PROTOTYPES.find(p=>p.id===id);return x?`<article class="badge earned"><strong>${t(x.name)}</strong><small>${t(x.text)}</small></article>`:'';}).join('')}</div></section>`:''}
 <section class="panel"><h3>Badges</h3><div class="badge-grid">${BADGES.map(b=>`<article class="badge ${p.badges.includes(b.id)?'earned':''}"><strong>${p.badges.includes(b.id)?'★':'☆'} ${t(b.name)}</strong><small>${t(b.text)}</small></article>`).join('')}</div>
 <h4>Thèmes visuels</h4><div class="theme-row">${THEMES.map(th=>btn('theme',`${t(th.name)}${p.badges.length<th.badges?` · ${th.badges} ${t('badges')}`:''}`,`data-theme="${th.id}" class="${meta.theme===th.id?'active':''}"`,p.badges.length<th.badges)).join('')}</div></section>`;
}

export function contractsPanel(s:State) {
 const p=progressOf(s);const offers=contractOffers(s);
 const locked=s.produced<CONTRACTS_AT&&p.refounds===0;
 return `<section class="panel contracts"><div class="section-head"><div><span class="eyebrow">CONTRATS · BREVETS</span><h2>Commandes de l’industrie</h2></div><span class="count-pill">${p.points} ${t('brevets à placer')}</span></div>
 ${locked?`<p class="muted">${t('Les contrats ouvrent à 100 000 composants cumulés. Ils sont facultatifs et sans limite de temps.')}</p><progress max="1" value="${Math.min(1,s.produced/CONTRACTS_AT)}"></progress>`:`
 <p class="muted">${t('Un contrat à la fois, sans limite de temps ni pénalité. Il se mesure depuis son acceptation et paie des brevets et des composants.')}</p>
 ${p.contract?(()=>{const c=p.contract!;const pr=contractProgress(s,c);return `<article class="contract active"><h3>${t(contractText(c))}</h3><progress max="1" value="${pr.ratio}"></progress><p>${fmt(pr.value)} / ${fmt(c.goal)} · ${t('Récompense')} : ${c.patents} ${t('brevets')} + ${fmt(c.reward)} ⬡</p>${btn('contract-abandon','Abandonner ce contrat','class="subtle"')}</article>`;})():`<div class="contract-grid">${offers.map((c,i)=>`<article class="contract"><h3>${t(contractText(c))}</h3><p>${t('Récompense')} : ${c.patents} ${t('brevets')} + ${fmt(c.reward)} ⬡</p>${btn('contract-accept','Accepter',`data-index="${i}" class="primary"`)}</article>`).join('')}</div>`}`}
 <h3>Brevets</h3><div class="patent-grid">${PATENTS.map(x=>`<article class="patent ${p.patents.includes(x.id)?'owned':''}"><strong>${t(x.name)}</strong><small>${t(x.text)}</small>${p.patents.includes(x.id)?`<span class="challenge-badge">✓ ${t('Acquis')}</span>`:btn('patent',`${x.cost} ${t('brevets')}`,`data-id="${x.id}"`,p.points<x.cost)}</article>`).join('')}</div>
 <h3>Refondation</h3>${canRefound(s)?`<p>${t('Recommencer à zéro avec vos inventions, configurations, découvertes, badges et brevets. Nouvelle règle : chaque découverte multiplie les presses de Fonderie par 1,25, et la Forge ouvre dès 10 000 composants.')}</p><p><strong>${t('Mémoire après refondation')} : ×${fmt(Math.max(p.legacy,legacyFor(discoveryCount(s))))}</strong></p>${btn('refound','Refonder le laboratoire','class="primary"')}`:`<p class="muted">${t('Possible une fois 10¹² composants cumulés atteints. Facultative : la partie continue sans elle.')}</p><progress max="1" value="${Math.min(1,Math.log10(Math.max(1,s.produced))/Math.log10(REFOUND_AT))}"></progress>`}
 <p class="tiny muted">${t('Débit actuel')} : ${fmt(measuredRate(s).rate)}/s</p></section>`;
}
