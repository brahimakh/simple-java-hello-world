import {test} from 'node:test';
import assert from 'node:assert/strict';
import {insertModule,simulate,unlocked,setParam} from '../src/engine.ts';
import {PUZZLES,puzzleState,dailyPuzzle,measureDaily} from '../src/puzzles.ts';
import {serialize} from '../src/save.ts';
const lane=(s,i=0)=>s.plants.A.lanes[i];
const solutions={
 p1:s=>{lane(s).machines[0].param=12;return insertModule(s,'A',lane(s).id,'cadence');},
 p2:s=>insertModule(s,'A',lane(s).id,'cadence')&&insertModule(s,'A',lane(s).id,'batch')&&setParam(s,lane(s).machines[2],80),
 p3:s=>insertModule(s,'A',lane(s).id,'stamp')&&insertModule(s,'A',lane(s).id,'batch')&&setParam(s,lane(s).machines[2],80)&&insertModule(s,'A',lane(s).id,'weave'),
 p4:s=>insertModule(s,'A',lane(s).id,'cadence')&&insertModule(s,'A',lane(s).id,'filter')&&setParam(s,lane(s).machines[2],10),
 p5:s=>insertModule(s,'A',lane(s).id,'harmonic')&&insertModule(s,'A',lane(s,1).id,'harmonic')
};
for(const p of PUZZLES)test(`puzzle « ${p.name} » : solvable dans son budget, avec ses seuls modules`,()=>{
 const s=puzzleState(p);assert.equal(p.test(s),false);assert.ok(solutions[p.id](s),'solution affordable');simulate(s,120);
 assert.ok(p.test(s),p.id+' solved');assert.equal(s.fault,null);assert.equal(unlocked(s,'mirror'),p.allowed.includes('mirror'));assert.doesNotThrow(()=>serialize(s));
});
test('puzzle du jour : identique pour une même date, mesure déterministe sans toucher l’état',()=>{
 const a=dailyPuzzle('2026-11-02'),b=dailyPuzzle('2026-11-02'),c=dailyPuzzle('2026-11-03');
 assert.deepEqual(a.allowed,b.allowed);assert.equal(a.budget,b.budget);assert.ok(a.allowed.length>=3);assert.notDeepEqual([a.allowed,a.budget],[c.allowed,c.budget]);
 const s=puzzleState(a);const before=serialize(s);const score=measureDaily(s);assert.equal(serialize(s),before);assert.ok(score>0);assert.equal(measureDaily(s),score);
});
