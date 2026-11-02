// First-run usability test on an Android phone viewport (same HTML as the APK), with an accelerated clock.
// A new player plays the guided journey with taps only. For each step the script measures what the player
// sees and checks usability rules. Usage: node scripts/ux-first-run.mjs [report-dir]
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
const require=createRequire(import.meta.url);
let playwright;try{playwright=require('playwright');}catch{console.log('Playwright absent : test ignoré.');process.exit(0);}
const out=process.argv[2]??'reports/ux-premiere-partie';await mkdir(out,{recursive:true});
const browser=await playwright.chromium.launch();const ctx=await browser.newContext({...playwright.devices['Pixel 7']});const page=await ctx.newPage();
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.clock.install();await page.goto(pathToFileURL(path.resolve('Resonance-Industrielle.html')).href);await page.clock.runFor(500);
const failures=[];const rows=[];let taps=0,shot=0,seconds=0;
const check=(ok,label)=>{if(!ok)failures.push(label);console.log((ok?'✓ ':'✗ ')+label);};
const wait=async s=>{for(let i=0;i<s;i++)await page.clock.runFor(1000);seconds+=s;};
const tap=async sel=>{try{await page.locator(sel).first().tap({timeout:8000});}catch(e){await page.screenshot({path:path.join(out,'echec.png')});console.log('ÉCHEC',sel,JSON.stringify(await look()));throw e;}taps++;await page.clock.runFor(300);};
const look=()=>page.evaluate(()=>{
 const vis=el=>{const r=el.getBoundingClientRect();const st=getComputedStyle(el);return r.width>0&&r.height>0&&st.visibility!=='hidden'&&st.display!=='none';};
 const inView=el=>{const r=el.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight;};
 const buttons=[...document.querySelectorAll('#app button,#app select')].filter(vis);
 const screenButtons=buttons.filter(b=>{const r=b.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight;});
 const small=screenButtons.filter(b=>{const r=b.getBoundingClientRect();return Math.min(r.width,r.height)<36;}).map(b=>(b.innerText||b.getAttribute('aria-label')||'').trim().slice(0,20));
 const coach=document.querySelector('.coach'),cta=document.querySelector('.journey-cta');
 const words=(document.querySelector('.journey')?.innerText??'').split(/\s+/).filter(Boolean).length;
 return {step:document.querySelector('.journey h2')?.textContent??'(fin du parcours)',buttons:buttons.length,screenButtons:screenButtons.length,small,tabs:[...document.querySelectorAll('.sidebar nav button')].length,
  resources:document.querySelectorAll('.resource').length,words,coachVisible:!!coach&&vis(coach),ctaInView:!!cta&&inView(cta),ctaEnabled:!!cta&&!cta.disabled,overflow:document.documentElement.scrollWidth>innerWidth+1,
  produced:Number((document.querySelector('[data-live="produced"]')?.textContent??'0').replace(/\s/g,'').replace(',','.'))||0,page:document.documentElement.scrollHeight};});
const record=async(label)=>{const l=await look();shot++;const file=`${String(shot).padStart(2,'0')}.png`;await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:path.join(out,file)});rows.push({label,file,seconds,taps,...l});return l;};

// 1. Nothing runs before the player acts.
let s=await record('Ouverture');
check(s.step.includes('premier lot'),'un objectif unique s’affiche à l’ouverture');
check(s.tabs<=2,`au plus 2 onglets au départ (${s.tabs})`);check(s.resources===1,'une seule ressource affichée au départ');
check(s.screenButtons<=8,`peu de boutons à l’écran au départ (${s.screenButtons})`);check(s.ctaInView&&s.ctaEnabled,'l’action à faire est visible sans défiler');
await wait(20);s=await look();check(s.produced===0,'aucune production sans geste du joueur pendant 20 s');
// 2. Manual lots, then automation.
await tap('.journey-cta');await wait(1);s=await record('Premier lot lancé');check(s.step.includes('presse'),'le premier geste valide l’objectif');
for(let i=0;i<4;i++){await tap('.journey-cta');await wait(1);}
s=await record('Composants suffisants');check(s.step.includes('Automatisez'),'5 lots manuels suffisent pour automatiser');check(s.ctaEnabled,'le bouton Automatiser est actif');
await tap('.journey-cta');s=await record('Injecteur automatisé');check(s.step.includes('résonateur'),'l’automatisation est gagnée, objectif suivant');
// 3. Waiting time is shown as progress, then a real module is bought.
check(!s.ctaEnabled,'le résonateur s’affiche avec sa progression avant d’être finançable');
let waited=0;while(!(await look()).ctaEnabled&&waited<240){await wait(5);waited+=5;}
check(waited<=90,`attente avant le résonateur raisonnable (${waited} s)`);
await tap('.journey-cta');s=await record('Résonateur ajouté');check(s.step.includes('accord'),'acheter le résonateur valide l’objectif');
await tap('.journey-cta');await wait(5);s=await record('Accord observé');check(s.step.includes('Doublez'),'observer le résonateur valide l’objectif');
await tap('.journey-cta');await page.locator('.inspector [data-param]').first().selectOption('12');taps++;await page.clock.runFor(300);
s=await record('Injecteur sur 12');check(s.step.includes('gros lots'),'régler l’injecteur valide l’objectif');
// 4. Accumulator with the 80 threshold.
waited=0;while(!(await look()).ctaEnabled&&waited<300){await wait(5);waited+=5;}check(waited<=120,`attente avant l’accumulateur (${waited} s)`);
await tap('.journey-cta');await tap('.node[data-kind="batch"]');await page.locator('.inspector [data-param]').first().selectOption('80');taps++;await page.clock.runFor(300);
await wait(25);s=await record('Lots de 80');check(s.step.includes('ordre'),'un lot de 80 pressé valide l’objectif');
// 5. Order: marker before the accumulator, weaver after.
waited=0;while(!(await look()).ctaEnabled&&waited<300){await wait(5);waited+=5;}
await tap('.journey-cta');await tap('.node[data-kind="stamp"]');
const order=()=>page.evaluate(()=>[...document.querySelectorAll('.node-strip .node')].map(n=>n.dataset.kind));
while((await order()).indexOf('stamp')>(await order()).indexOf('batch')){await tap('.inspector [data-action="move"][data-dir="-1"]');}
await tap('.inspector [data-action="deselect"]');
waited=0;while(!(await look()).ctaEnabled&&waited<300){await wait(5);waited+=5;}
await tap('.journey-cta');await wait(20);s=await record('Empreintes tissées');check(s.step.includes('inventer'),'l’ordre marqueur → accumulateur → tisseur valide l’objectif');
await tap('.journey-cta');s=await record('Parcours terminé');check(s.step==='(fin du parcours)','le parcours se termine sur demande du joueur');
check(s.tabs>=3,'de nouveaux onglets se sont dévoilés en jouant');
// Rules checked at every step.
check(rows.every(r=>!r.overflow),'aucun débordement horizontal');check(rows.every(r=>r.words<=80),'textes d’objectif courts (≤ 80 mots)');
check(rows.every(r=>r.small.length===0),'cibles tactiles d’au moins 36 px : '+[...new Set(rows.flatMap(r=>r.small))].join(', '));
check(errors.length===0,'aucune erreur JavaScript '+errors.join(' | '));
const md=['# Test de première partie — téléphone Android (Pixel 7)','',`Parcours guidé complet en ${Math.round(seconds/60)} min de jeu simulé et ${taps} gestes.`,'',
 '| Étape | Temps | Gestes | Objectif affiché | Boutons à l’écran | Onglets | Ressources | Mots | Capture |','|---|---:|---:|---|---:|---:|---:|---:|---|',
 ...rows.map(r=>`| ${r.label} | ${Math.floor(r.seconds/60)}:${String(r.seconds%60).padStart(2,'0')} | ${r.taps} | ${r.step} | ${r.screenButtons} | ${r.tabs} | ${r.resources} | ${r.words} | ${r.file} |`),'',
 '## Vérifications','',...(failures.length?failures.map(f=>'- ✗ '+f):['- Toutes les vérifications passent.'])];
await writeFile(path.join(out,'RAPPORT.md'),md.join('\n'));await browser.close();
if(failures.length){console.error(`${failures.length} échec(s).`);process.exit(1);}console.log(`Parcours réussi : ${taps} gestes, ${Math.round(seconds/60)} min simulées. Rapport : ${out}/RAPPORT.md`);
