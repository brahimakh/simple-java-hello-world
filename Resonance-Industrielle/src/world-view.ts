// The « Monde » page: a small town that grows with the factory, and the long-term construction sites.
import {SITES,SITES_AT,siteProgress,siteDone,seasonOf} from './world.ts';
import {measuredRate,featureOpen,type State} from './engine.ts';
import {t,formatCompact as fmt} from './i18n.ts';
const btn=(action:string,text:string,extra='',disabled=false)=>`<button data-action="${action}" ${extra} ${disabled?'disabled':''}>${text}</button>`;
function scene(s:State){
 const W=900,H=320,ground=270;const season=seasonOf(s).id;const sky=season==='hiver'?'#1a2533':season==='ete'?'#1f3330':season==='automne'?'#2c2620':'#1d2e2c';
 const rate=Math.max(1,measuredRate(s).rate);const parts:string[]=[`<rect width="${W}" height="${H}" fill="${sky}"/>`,`<rect y="${ground}" width="${W}" height="${H-ground}" fill="#121a1c"/>`];
 const lanes=s.plants.A.lanes;lanes.forEach((l,i)=>{const x=40+i*70,h=60+Math.min(120,Math.log10(rate)*10)+i*6;parts.push(`<rect x="${x}" y="${ground-h}" width="48" height="${h}" rx="4" fill="#24393a" stroke="#91ddc066"/>`,`<rect x="${x+30}" y="${ground-h-34}" width="10" height="34" fill="#3a5052"/>`,`<circle class="smoke" cx="${x+35}" cy="${ground-h-40}" r="8" fill="#9aabad55" style="animation-delay:${i*.4}s"/>`);for(let w=0;w<3;w++)parts.push(`<rect x="${x+8+w*13}" y="${ground-h+14}" width="8" height="10" fill="#ffd47999"/>`);});
 s.plants.B.lanes.forEach((_,i)=>{const x=480+i*60;parts.push(`<path d="M${x} ${ground}a26 26 0 0 1 52 0z" fill="#2c4a3a" stroke="#91ddc088"/>`);});
 s.plants.C.lanes.forEach((_,i)=>{const x=620+i*50;parts.push(`<rect x="${x}" y="${ground-70}" width="34" height="70" fill="#3a2a36"/><circle cx="${x+17}" cy="${ground-80}" r="9" fill="#ff9fd0" class="glow"/>`);});
 const monuments:Record<string,string>={pont:`<path d="M300 ${ground}q60-50 120 0" fill="none" stroke="#c9d6d4" stroke-width="5"/>`,jardin:`<circle cx="560" cy="${ground-90}" r="22" fill="#4f7a55"/>`,phare:`<rect x="760" y="${ground-150}" width="16" height="150" fill="#d8c7a0"/><circle cx="768" cy="${ground-158}" r="10" fill="#ff9fd0" class="glow"/>`,orgue:`<g fill="#b9a46c">${[0,1,2,3,4].map(k=>`<rect x="${700+k*10}" y="${ground-40-k*8}" width="7" height="${40+k*8}"/>`).join('')}</g>`,observatoire:`<path d="M820 ${ground}v-40a24 24 0 0 1 48 0v40z" fill="#56606b"/>`,tour:`<path d="M440 ${ground}l14-200 14 200z" fill="#ffd479"/>`};
 for(const [id,svg] of Object.entries(monuments))if(siteDone(s,id))parts.push(svg);
 return `<svg class="world-scene" viewBox="0 0 ${W} ${H}" role="img" aria-label="${t('Vue de votre ville industrielle')}">${parts.join('')}</svg>`;
}
export function worldPage(s:State){
 const open=featureOpen(s,'sites');
 return `<div class="section-head"><div><span class="eyebrow">MONDE</span><h2>Votre ville industrielle</h2></div><span class="count-pill">${s.sites?.done.length??0} / ${SITES.length} ${t('chantiers')}</span></div>
 <section class="panel">${scene(s)}<p class="tiny muted">${t('Chaque ligne est un bâtiment, chaque chantier achevé un monument. Le ciel suit les saisons de la Serre.')}</p></section>
 <section class="panel"><h3>Chantiers</h3>${open?`<p class="muted">${t('Livrez depuis vos réserves, en une ou plusieurs fois. Les quantités comptées (lots, croisements) ne sont pas dépensées.')}</p><div class="site-grid">${SITES.map(x=>{const prog=siteProgress(s,x.id);const done=siteDone(s,x.id);return `<article class="site ${done?'done':''}"><h4>${t(x.name)}</h4><p>${t(x.text)}</p><p class="site-effect">${t(x.effect)}</p>${x.needs.map((n,i)=>`<label>${fmt(done?n.amount:prog[i])} / ${fmt(n.amount)} ${t(n.label)}<progress max="${n.amount}" value="${done?n.amount:prog[i]}"></progress></label>`).join('')}${done?`<span class="challenge-badge">✓ ${t('Achevé')}</span>`:btn('deliver-site',t('Livrer'),`data-id="${x.id}" class="primary"`)}</article>`;}).join('')}</div>`:`<p class="muted">${t('Les chantiers ouvrent à 10¹⁰ composants cumulés.')}</p><progress max="10" value="${Math.min(10,Math.log10(Math.max(1,s.produced)))}"></progress>`}</section>`;
}
