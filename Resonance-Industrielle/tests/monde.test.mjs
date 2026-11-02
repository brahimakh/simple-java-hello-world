import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createState,step,simulate,machine,addLane,packetMax,transferFactor} from '../src/engine.ts';
import {deliverSite,siteDone,SITES,crossStrains,cultureOf,plantStrain,seasonOf,SEASON_TICKS,greenhouseFactor} from '../src/world.ts';
import {refound} from '../src/progression.ts';
import {serialize,deserialize} from '../src/save.ts';
const rich=()=>{const s=createState();s.produced=2e13;for(const p of Object.values(s.plants)){p.stock.components=1e14;p.stock.catalyst=1e8;p.stock.plasma=1e6;p.stock.energy=1e9;}s.stats={crossings:5,beats:1e4,crystals:1e3,prism:500,assembly:500};return s;};
test('chantiers : livraison en plusieurs fois, effet permanent à l’achèvement',()=>{
 const s=rich();s.plants.A.stock.components=1e10;assert.ok(deliverSite(s,'pont'));assert.equal(siteDone(s,'pont'),false);assert.equal(s.plants.A.stock.components,0);
 s.plants.A.stock.components=1e11;const t=transferFactor(s);assert.ok(deliverSite(s,'pont'));assert.ok(siteDone(s,'pont'));assert.equal(transferFactor(s),t*2);
 s.plants.A.stock.components=1e15;for(const x of SITES)deliverSite(s,x.id);assert.equal(s.sites.done.length,SITES.length);assert.doesNotThrow(()=>deserialize(serialize(s)));
});
test('Serre vivante : croisement par règle affichée, saison qui favorise, plantation',()=>{
 const s=rich();s.tick=SEASON_TICKS;assert.equal(seasonOf(s).id,'ete');const c=cultureOf(s);
 const child=crossStrains(s,2,3);assert.deepEqual([child.speed,child.yield,child.hardiness],[2,3,1]);assert.ok(plantStrain(s,child.id));
 assert.equal(greenhouseFactor(s),(1+3)/2*2);s.tick=3*SEASON_TICKS;assert.equal(greenhouseFactor(s),(1+3)/2*.5);assert.doesNotThrow(()=>deserialize(serialize(s)));
});
test('doctrines : choisies à la refondation, règle appliquée',()=>{
 const s=rich();const next=refound(s,undefined,'masse');assert.equal(next.doctrine,'masse');assert.equal(packetMax(next),320);
 const v=refound(s,undefined,'vitesse');v.plants.A.lanes[0].machines[0].connected=true;simulate(v,1);assert.ok(v.plants.A.lanes[0].machines[0].clock<=.375+1e-9);
});
