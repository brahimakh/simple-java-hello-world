import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {createState,simulate,clone,measuredRate,insertModule,addLane,upgrade,removeModule,moveModule,configureRouter,saveConfiguration,encapsulate,claim,EXPERIMENTS,buffer} from '../src/engine.ts';
import {compareLayouts} from '../src/bench.ts';
import {serialize} from '../src/save.ts';
import {UNLOCKS} from '../src/content.ts';

// Scripted decisions, with simulated reading/observation time. No real save is read.
// These are plausible, disclosed policies, not human playtests or behavioural estimates.
const version=JSON.parse(await readFile(new URL('../package.json',import.meta.url),'utf8')).version;
const date=process.argv.find(a=>a.startsWith('--date='))?.slice(7)??new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Paris'}).format(new Date());
if(!/^\d{4}-\d{2}-\d{2}$/.test(date))throw Error('Date attendue : YYYY-MM-DD');
const root=new URL('../reports/',import.meta.url);await mkdir(root,{recursive:true});
const stamp=t=>`${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,'0')}`;
function capture(s){return {gameSeconds:s.tick*.1,produced:s.produced,rate60:measuredRate(s).rate,window:measuredRate(s).duration,stocks:clone(s.plants.A.stock),Bstocks:clone(s.plants.B.stock),lanes:Object.fromEntries(['A','B'].map(id=>[id,s.plants[id].lanes.map(l=>({id:l.id,name:l.name,modules:l.machines.map(m=>({kind:m.kind,param:m.param,processed:m.processed,buffer:buffer(m),status:m.status,made:m.made??0,routing:m.routing?clone(m.routing):undefined}))}))])),fault:s.fault};}
const first=(s,p='A')=>s.plants[p].lanes[0];
const module=(s,k,p='A',lane=0)=>s.plants[p].lanes[lane]?.machines.find(m=>m.kind===k);
const purchase=(k,p='A',lane=0)=>s=>{const l=s.plants[p].lanes[lane];return !!l&&insertModule(s,p,l.id,k);};
const tune=(k,param,p='A',index=0)=>s=>{const m=module(s,k,p,index);if(!m||m.working)return false;m.param=param;return true;};
const positionBefore=(kind,before)=>s=>{const l=first(s),m=module(s,kind),b=module(s,before);if(!m||!b)return false;let guard=10;while(l.machines.indexOf(m)>l.machines.indexOf(b)&&guard--)if(!moveModule(s,'A',l.id,m.id,-1))return false;return true;};
const routerAfterWeave=s=>{const l=first(s),r=module(s,'router'),w=module(s,'weave');if(!r||!w)return false;let guard=10;while(l.machines.indexOf(r)<l.machines.indexOf(w)&&guard--)if(!moveModule(s,'A',l.id,r.id,1))return false;return true;};
const route=s=>{const r=module(s,'router'),a=first(s),b=s.plants.A.lanes[1];return !!r&&!!b&&configureRouter(s,'A',a.id,r.id,{target:b.id});};
const stopDestination=s=>{const l=s.plants.A.lanes[1];if(!l)return false;l.machines[0].connected=false;return true;};
function relocateRecovery(s){const a=first(s),b=s.plants.A.lanes[1];if(!b)return false;for(const k of ['recovery','exchanger']){const m=module(s,k);if(m){if(!removeModule(s,'A',a.id,m.id))return false;if(!insertModule(s,'A',b.id,k))return false;}}return true;}
const schedule=(...rows)=>rows.map(([at,label,act])=>({at,label,act}));
const novice=schedule(
 [25,'Je double l’extraction pour accélérer.',s=>upgrade(s,'A','oreLevel')],
 [60,'J’essaie le premier module disponible : résonateur.',purchase('cadence')],
 [100,'Je prends la dotation de la première expérience.',s=>claim(s,'first')],
 [130,'J’ajoute un marqueur et j’observe.',purchase('stamp')],
 [175,'J’ajoute un accumulateur avec son seuil par défaut (40).',purchase('batch')],
 [220,'J’ajoute un aiguillage sans avoir encore construit la destination.',purchase('router')],
 [265,'Je construis la destination et renseigne le lien.',s=>addLane(s,'A')&&route(s)],
 [310,'J’ajoute le tisseur à ma ligne principale.',purchase('weave')],
 [355,'La destination a son propre injecteur : je le suspends.',stopDestination],
 [400,'Je vérifie que le tisseur est placé avant l’aiguillage.',routerAfterWeave],
 [445,'Je relis la presse et essaie le seuil de lot 80.',tune('batch',80)],
 [490,'Je conserve ma configuration.',s=>saveConfiguration(s,'A','Premier réseau')],
 [535,'J’ouvre la Serre et construis sa première ligne.',s=>addLane(s,'B')],
 [580,'J’ajoute un récupérateur à la ligne principale.',purchase('recovery')],
 [625,'J’ajoute un échangeur à la ligne principale.',purchase('exchanger')],
 [670,'Je récupère les dotations déjà accessibles.',s=>{let any=false;for(const e of EXPERIMENTS)any=claim(s,e.id)||any;return any;}],
 [715,'Les machines locales sont inactives : je déplace la récupération vers la ligne de destination.',relocateRecovery],
 [760,'Je renforce les générateurs.',s=>upgrade(s,'A','energyLevel')],
 [805,'J’encapsule mon invention.',s=>encapsulate(s,'A',first(s).id,'Essai personnel')]
);
const methodical=schedule(
 [30,'Après lecture, je teste le résonateur.',purchase('cadence')],
 [80,'Je sauvegarde le plan de départ.',s=>saveConfiguration(s,'A','Premier accord')],
 [125,'J’essaie l’accumulateur avec son réglage par défaut.',purchase('batch')],
 [170,'La règle de la presse m’incite à tester le seuil 80.',tune('batch',80)],
 [215,'J’essaie le marqueur à l’emplacement automatique, après l’accumulateur.',purchase('stamp')],
 [260,'J’ajoute le tisseur après le marqueur.',purchase('weave')],
 [305,'Je compare le déplacement du marqueur avant l’accumulateur.',positionBefore('stamp','batch')],
 [350,'Je construis une première chaîne dans la Serre.',s=>addLane(s,'B')],
 [395,'J’ajoute un résonateur dans la Serre.',purchase('cadence','B')],
 [440,'Je teste le récupérateur.',purchase('recovery')],
 [485,'Je teste l’échangeur.',purchase('exchanger')],
 [530,'Je conserve mon procédé comme invention.',s=>encapsulate(s,'A',first(s).id,'Procédé testé')]
);
const repeater=schedule(
 [25,'Le réglage de l’injecteur est gratuit : je teste 12.',tune('intake',12)],
 [60,'J’achète le résonateur après lecture de sa règle.',purchase('cadence')],
 ...[105,150,195,240,285,330,375].map((t,i)=>[t,`Je teste un autre résonateur (${i+2} au total), puisque la règle le permet.`,purchase('cadence')])
);
function play(name,decisions,{horizon=3600,bench=false,repeatAfter=false}={}){
 const s=createState(),journal=[],samples=[],unlocks=[];const used=new Set();let completed=null,next=0,actualActions=0;
 for(let second=0;second<=horizon;second++){
   if(second>0)simulate(s,1);
   if(second%15===0)samples.push({at:second,...capture(s)});
   for(const u of UNLOCKS)if(s.produced>=u.at&&!used.has(u.at)){used.add(u.at);unlocks.push({at:second,threshold:u.at,description:u.text});}
   if(s.produced>=500000){completed=second;break;}
   if(next<decisions.length&&decisions[next].at===second){
     const d=decisions[next++],before=clone(s),success=d.act(s);actualActions+=Number(success);const row={at:second,label:d.label,success,before:capture(before),after:capture(s)};
     if(bench&&success&&['résonateur','accumulateur','seuil','marqueur','tisseur','déplacement','récupérateur','échangeur'].some(word=>d.label.toLowerCase().includes(word))){const comparison=compareLayouts(before,s,d.label.includes('Serre')?'B':'A',180);row.bench={reference:comparison.reference.rate,candidate:comparison.candidate.rate,ratio:comparison.ratio,costBefore:comparison.reference.cost,costAfter:comparison.candidate.cost};}
     journal.push(row);
   }
   // After the exploratory sequence, this policy checks the next clear action every minute.
   if(repeatAfter&&second>850&&second%60===0){let label='Observer la production';let success=false;const before=clone(s);
     if(!s.plants.B.lanes.length&&s.produced>=1000){label='Construire la Serre si le premier essai était trop tôt';success=addLane(s,'B');}
     else if(s.plants.A.energyLevel<3){label='Renforcer les générateurs pour vérifier le goulot';success=upgrade(s,'A','energyLevel');}
     else{label='Consulter les expériences et leurs dotations';for(const e of EXPERIMENTS)success=claim(s,e.id)||success;}
     actualActions+=Number(success);journal.push({at:second,label,success,before:capture(before),after:capture(s)});
   }
   if(s.fault)break;
 }
 serialize(s);return {name,description:'Décisions scriptées à 35–45 s environ après les premières lectures. Simulation accélérée, aucune partie humaine observée.',horizon,completed,actualActions,unlocks,journal,samples,final:capture(s)};
}
const games=[play('Découverte prudente',novice,{repeatAfter:true}),play('Exploration méthodique avec le banc',methodical,{bench:true,repeatAfter:true}),play('Essai de répétition d’une règle visible',repeater)];
const slower=decisions=>decisions.map(d=>({...d,at:d.at*2}));
const sensitivity=[play('Découverte prudente — décisions deux fois plus espacées',slower(novice)),play('Répétition — décisions deux fois plus espacées',slower(repeater))];

// Focused probes complement the scripted runs; these are not additional full games.
const probes={};
for(const [name,operation] of [['aucun achat',()=>true],['extraction ×2',s=>upgrade(s,'A','oreLevel')],['énergie ×2',s=>upgrade(s,'A','energyLevel')],['injecteur réglé sur 12',tune('intake',12)]]){const s=createState();const ok=operation(s);simulate(s,300);probes[name]={purchaseSucceeded:ok,rate60:measuredRate(s).rate,stock:s.plants.A.stock,produced:s.produced};}
const backlog=createState();simulate(backlog,45);const pendingBefore=buffer(module(backlog,'press')),at=backlog.tick*.1;insertModule(backlog,'A',first(backlog).id,'cadence');let firstEffect=null;for(let i=1;i<=1200;i++){simulate(backlog,.1);if((module(backlog,'press').lastPacket?.quality??1)>1){firstEffect={gameSeconds:backlog.tick*.1,delay:backlog.tick*.1-at};break;}}probes.backlog={installedAt:at,pressBufferBefore:pendingBefore,firstEffect};
const defaults=createState();simulate(defaults,120);claim(defaults,'first');insertModule(defaults,'A',first(defaults).id,'cadence');simulate(defaults,120);insertModule(defaults,'A',first(defaults).id,'batch');const bigger=clone(defaults);tune('batch',80)(bigger);const thresholdTrial=compareLayouts(defaults,bigger,'A',180);probes.batchThreshold={from:40,to:80,rateFrom:thresholdTrial.reference.rate,rateTo:thresholdTrial.candidate.rate,ratio:thresholdTrial.ratio};
const markOnly=clone(defaults);insertModule(markOnly,'A',first(markOnly).id,'stamp');const stampTrial=compareLayouts(defaults,markOnly,'A',180);probes.markerAlone={before:stampTrial.reference.rate,after:stampTrial.candidate.rate,ratio:stampTrial.ratio};

const report={version,date,method:'Replays déterministes depuis createState(), uniquement opérations de joueur et temps de lecture simulé. Aucun crédit, stock ou déblocage développeur. Les essais ciblés sont explicitement séparés des parties. Ne mesure ni ressenti humain ni ergonomie visuelle. Les temps sont du temps actif simulé ; la réflexion en pause et la consultation du banc ne sont pas chronométrées.',games,sensitivity,probes};
await writeFile(new URL(`playtest-${date}.json`,root),JSON.stringify(report,null,2)+'\n');
const lines=[`# Rejeu exploratoire — ${date}`,'',`Simulation comportementale scriptée, pas un playtest humain. Version ${version}. Aucun accès aux sauvegardes du navigateur.`,'','## Parcours',...games.flatMap(g=>['',`### ${g.name}`,`Objectif atteint : ${g.completed===null?'non en 60 minutes':stamp(g.completed)}. Actions abouties : ${g.actualActions}. Production finale : ${g.final.produced.toFixed(1)}. Diagnostic : ${g.final.fault??'aucun'}.`,'','| Temps | Décision | Résultat | Débit glissant à cet instant |','|---|---|---|---:|',...g.journal.map(e=>`| ${stamp(e.at)} | ${e.label} | ${e.success?'effectuée':'indisponible'} | ${e.after.rate60.toFixed(2)} |`),'','Ces débits glissants mélangent les configurations récentes ; voir le JSON pour les traces et les comparaisons isolées du banc.']),'','## Essais ciblés','',...Object.entries(probes).map(([name,value])=>`- ${name} : ${JSON.stringify(value)}`),''];
lines.push('## Sensibilité au temps de décision','','Même suite de choix, instants des décisions multipliés par deux. Aucun achat de secours. Ce contrôle ne mesure pas le temps de jeu humain.','',...sensitivity.map(g=>`- ${g.name} : objectif ${g.completed===null?'non atteint':stamp(g.completed)}, ${g.actualActions} actions abouties, ${g.journal.filter(e=>!e.success).length} actions indisponibles.`),'');
await writeFile(new URL(`playtest-${date}.md`,root),lines.join('\n'));
console.log(JSON.stringify({games:[...games,...sensitivity].map(({name,completed,actualActions,final,unlocks,journal})=>({name,completed,actualActions,unavailable:journal.filter(e=>!e.success).length,finalRate:final.rate60,produced:final.produced,fault:final.fault,unlocks})),probes},null,2));
