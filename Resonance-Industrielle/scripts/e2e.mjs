// End-to-end check in a real browser (Chromium via Playwright), desktop and phone sizes.
// Usage: node scripts/e2e.mjs   (needs Playwright; not required to play or to run the unit tests)
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
import {createState,machine} from '../src/engine.ts';
import {serialize,SAVE_KEY} from '../src/save.ts';
const require=createRequire(import.meta.url);
let playwright;try{playwright=require('playwright');}catch{console.log('Playwright absent : vérification navigateur ignorée.');process.exit(0);}
const url=pathToFileURL(path.resolve('Resonance-Industrielle.html')).href;
const s=createState();s.produced=5e6;s.plants.A.stock.components=1e6;s.plants.A.lanes[0].machines.splice(1,0,machine(s,'cadence'),machine(s,'stamp'));
const seed=[SAVE_KEY,serialize(s)];const failures=[];const check=(ok,label)=>{console.log((ok?'✓ ':'✗ ')+label);if(!ok)failures.push(label);};
const browser=await playwright.chromium.launch();
for(const [name,options] of [['bureau',{viewport:{width:1440,height:900}}],['téléphone',{...playwright.devices['iPhone 13']}]]){
 const ctx=await browser.newContext(options);const page=await ctx.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(([k,v])=>{if(!localStorage.getItem('e2e')){localStorage.setItem(k,v);localStorage.setItem('e2e','1');}},seed);
 await page.goto(url);await page.waitForTimeout(800);
 check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${name} : aucune barre de défilement horizontale`);
 const order=()=>page.evaluate(()=>[...document.querySelectorAll('.node-strip .node strong')].map(n=>n.textContent));
 const before=await order();await page.locator('.node-strip .node').nth(1).scrollIntoViewIfNeeded();const box=await page.locator('.node-strip .node').nth(1).boundingBox();
 await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.waitForTimeout(600);await page.mouse.move(box.x+box.width/2+160,box.y+box.height/2,{steps:8});await page.mouse.up();await page.waitForTimeout(200);
 const after=await order();if(process.env.DEBUG)console.log(before,after);check(before[1]===after[2]&&before[2]===after[1],`${name} : appui long puis glisser réordonne les machines`);
 await page.locator('.node-strip .node').nth(0).click();await page.waitForTimeout(200);check(await page.locator('.inspector.has-machine').isVisible(),`${name} : une machine ouvre ses réglages`);
 for(const view of ['notebook','experiments','library','overview']){await page.click(`[data-view="${view}"]`);await page.waitForTimeout(250);check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${name} : vue ${view} sans débordement`);}
 check(errors.length===0,`${name} : aucune erreur JavaScript ${errors.join(' | ')}`);await ctx.close();
}
await browser.close();if(failures.length){console.error(`${failures.length} échec(s).`);process.exit(1);}console.log('Parcours navigateur réussis.');
