// Visual and audio feedback layer. It only reads the simulation state: no effect here may change the game.
// The main interface is rebuilt periodically; this layer runs every animation frame on top of it.
import {MODULES, UNLOCKS, TIERS, PLANTS, type Kind, type PlantId, type Resource} from './content.ts';
import {measuredRate, type State, type Machine} from './engine.ts';
import {DISCOVERIES,BADGES} from './progression.ts';
import {t, formatCompact} from './i18n.ts';
import {moduleSymbol} from './visuals.ts';
import {logChart,clock,power} from './views.ts';

export const EFFECTS_KEY = 'resonance-industrielle-effects-v1';
export interface EffectsPreferences {sound:boolean; volume:number;}
export function readEffects(storage:Storage):EffectsPreferences {
 try {const raw=JSON.parse(storage.getItem(EFFECTS_KEY)??'{}');return {sound:raw.sound===true,volume:typeof raw.volume==='number'&&raw.volume>=0&&raw.volume<=1?raw.volume:.5};}
 catch {return {sound:false,volume:.5};}
}
export function writeEffects(storage:Storage,p:EffectsPreferences) {try{storage.setItem(EFFECTS_KEY,JSON.stringify(p));}catch{}}

export interface EffectsContext {state():State; plant():PlantId; preferences:EffectsPreferences; music():boolean; ghost():number[]|undefined; onShowModule(kind:Kind|null):void; onOpen(view:string):void;}

// ---------- Sound: tiny synthesized tones, no audio file ----------
let audio:AudioContext|null=null,master:GainNode|null=null,lastPressSound=0;
const SCALE=[0,2,4,7,9,12,14,16,19,21,24,26,28,31,33,36];// pentatonic steps, always consonant
function ensureAudio(volume:number) {
 if(typeof AudioContext==='undefined')return null;
 if(!audio){audio=new AudioContext();master=audio.createGain();master.connect(audio.destination);}
 master!.gain.value=volume*.35;if(audio.state==='suspended')void audio.resume();return audio;
}
function tone(freq:number,start:number,duration:number,gain:number,type:OscillatorType='triangle') {
 if(!audio||!master)return;const o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.value=freq;
 g.gain.setValueAtTime(0,start);g.gain.linearRampToValueAtTime(gain,start+.008);g.gain.exponentialRampToValueAtTime(.0001,start+duration);
 o.connect(g);g.connect(master);o.start(start);o.stop(start+duration+.02);
}
const note=(step:number,base=220)=>base*2**(SCALE[Math.max(0,Math.min(SCALE.length-1,step))]/12);
export function enableSound(p:EffectsPreferences) {if(p.sound)ensureAudio(p.volume);}
export function enableMusic(p:EffectsPreferences) {ensureAudio(p.volume);}
function pressSound(p:EffectsPreferences,result:number,factors:number) {
 if(!p.sound||!ensureAudio(p.volume))return;const now=audio!.currentTime;
 if(now-lastPressSound<.11)return;lastPressSound=now;
 const step=Math.round(Math.log10(Math.max(1,result))*1.2);
 tone(note(step),now,.16,.22);
 // A cascade of multipliers plays as a short rising arpeggio, one note per factor.
 for(let i=1;i<=factors;i++)tone(note(step+i*2),now+i*.055,.22,.13,'sine');
}
function fanfare(p:EffectsPreferences,steps:number[]) {
 if(!p.sound||!ensureAudio(p.volume))return;const now=audio!.currentTime;
 steps.forEach((s,i)=>{tone(note(s),now+i*.09,.5,.2);tone(note(s)*2,now+i*.09,.35,.05,'sine');});
}
// Generative music: each line of each facility owns a degree of the scale; its presses play it on a quarter-second grid.
let lastBeat=-1;const beatNotes=new Set<number>();
function musicNote(lane:number,plant:PlantId,quality:number) {
 if(!audio||!master)return;const grid=.25;const now=audio.currentTime;const at=Math.ceil(now/grid)*grid;
 const step=lane*2+(plant==='B'?1:plant==='C'?3:0);const key=Math.round(at/grid)*100+step;if(beatNotes.has(key))return;beatNotes.add(key);
 if(beatNotes.size>200)beatNotes.clear();
 const octave=Math.min(2,Math.floor(Math.log10(Math.max(1,quality))/3));
 tone(note(step%10,plant==='A'?196:plant==='B'?262:330)*2**octave,at,.45,.07,'sine');
 const beat=Math.floor(at/2);if(beat!==lastBeat){lastBeat=beat;tone(note(0,55),Math.ceil(now/2)*2,1.6,.05,'sine');}
}
function vibrate(pattern:number|number[]) {try{navigator.vibrate?.(pattern);}catch{}}

// ---------- Visual helpers ----------
const reducedMotion=()=>typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
function layer() {let fx=document.getElementById('fx');if(!fx){fx=document.createElement('div');fx.id='fx';fx.setAttribute('aria-hidden','true');document.body.append(fx);}return fx;}
function visibleRect(el:Element|null) {if(!el)return null;const r=el.getBoundingClientRect();return r.width>0&&r.bottom>0&&r.top<innerHeight?r:null;}
function floatText(x:number,y:number,text:string,size:number,variant:string) {
 const fx=layer();if(fx.childElementCount>60)return;
 const el=document.createElement('span');el.className='fx-float '+variant;el.textContent=text;
 el.style.left=x+'px';el.style.top=y+'px';el.style.fontSize=size+'px';
 el.style.setProperty('--drift',(Math.random()*36-18).toFixed(0)+'px');
 fx.append(el);el.addEventListener('animationend',()=>el.remove());setTimeout(()=>el.remove(),2500);
}
function burst(x:number,y:number,count:number,variant:string) {
 const fx=layer();if(fx.childElementCount>100)return;
 for(let i=0;i<count;i++){const el=document.createElement('i');el.className='fx-spark '+variant;el.style.left=x+'px';el.style.top=y+'px';
  const a=Math.PI*2*i/count+Math.random()*.4,d=40+Math.random()*50;el.style.setProperty('--dx',(Math.cos(a)*d).toFixed(0)+'px');el.style.setProperty('--dy',(Math.sin(a)*d).toFixed(0)+'px');
  fx.append(el);el.addEventListener('animationend',()=>el.remove());setTimeout(()=>el.remove(),1500);}
}
// A batch travelling between two machines: its size follows the quantity, its colour the quality.
function travel(from:DOMRect,to:DOMRect,qty:number,quality:number,duration:number) {
 const fx=layer();if(fx.querySelectorAll('.fx-lot').length>70)return;
 const el=document.createElement('i');el.className='fx-lot';const size=Math.min(16,4+Math.sqrt(qty)*.9);
 const hue=Math.max(0,165-Math.log10(Math.max(1,quality))*22);el.style.width=el.style.height=size+'px';el.style.background=`hsl(${hue} 75% 65%)`;el.style.boxShadow=`0 0 ${4+size/2}px hsl(${hue} 80% 60%)`;
 const x0=from.right-size/2,y0=from.top+from.height/2-size/2,x1=to.left-size/2,y1=to.top+to.height/2-size/2;
 el.style.left='0';el.style.top='0';fx.append(el);
 const anim=el.animate([{transform:`translate(${x0}px,${y0}px) scale(.6)`,opacity:.2},{transform:`translate(${(x0+x1)/2}px,${(y0+y1)/2-6}px) scale(1)`,opacity:1,offset:.5},{transform:`translate(${x1}px,${y1}px) scale(.8)`,opacity:.3}],{duration,easing:'ease-in-out'});
 anim.onfinish=()=>el.remove();setTimeout(()=>el.remove(),duration+200);
}
function bump(el:Element|null,cls='fx-bump') {if(!el)return;el.classList.remove(cls);void (el as HTMLElement).offsetWidth;el.classList.add(cls);}

// ---------- Celebrations ----------
let celebrationTimer=0;const queue:(()=>void)[]=[];let showing=false;
interface Celebration {eyebrow:string;title:string;text:string;icon:string;big:boolean;action?:{label:string;run:()=>void};}
function celebrate(c:Celebration) {queue.push(()=>show(c));if(!showing)next();}
function next() {const f=queue.shift();if(f){showing=true;f();}else showing=false;}
function show(c:Celebration) {
 let box=document.getElementById('celebration');
 if(!box){box=document.createElement('div');box.id='celebration';box.setAttribute('role','status');document.body.append(box);}
 box.className=c.big?'big':'';box.innerHTML='';
 const head=document.createElement('div');head.className='celebration-icon';head.innerHTML=c.icon;
 const body=document.createElement('div');
 const e=document.createElement('span');e.className='eyebrow';e.textContent=t(c.eyebrow);
 const h=document.createElement('strong');h.textContent=c.title;
 const p=document.createElement('p');p.textContent=c.text;
 body.append(e,h,p);
 const actions=document.createElement('div');actions.className='celebration-actions';
 if(c.action){const go=document.createElement('button');go.className='primary';go.textContent=t(c.action.label);go.addEventListener('click',()=>{hide();c.action!.run();});actions.append(go);}
 const close=document.createElement('button');close.textContent='✕';close.setAttribute('aria-label',t('Fermer'));close.addEventListener('click',hide);actions.append(close);
 body.append(actions);box.append(head,body);
 requestAnimationFrame(()=>box!.classList.add('visible'));
 clearTimeout(celebrationTimer);celebrationTimer=window.setTimeout(hide,c.big?8000:5500);
 function hide(){box!.classList.remove('visible');clearTimeout(celebrationTimer);setTimeout(next,380);}
 if(!reducedMotion()){const r=box.getBoundingClientRect();burst(r.left+40,r.top+40,c.big?26:14,c.big?'gold':'teal');vibrate(c.big?[30,60,30]:25);}
}
// Full-screen moment when lifetime production gains three digits.
function tierScreen(s:State,tier:{at:number;name:string},ghost:number[]|undefined,onClose:()=>void) {
 const old=document.getElementById('tier-screen');old?.remove();
 const box=document.createElement('div');box.id='tier-screen';box.setAttribute('role','dialog');box.setAttribute('aria-label',t('PALIER FRANCHI'));
 const k=Math.round(Math.log10(tier.at));const reached=s.tierTicks?.[k-1]??s.tick;const best=ghost?.[k-1];
 box.innerHTML=`<div class="tier-card"><span class="eyebrow">${t('PALIER FRANCHI')} · ${power(k)}</span><h2></h2><p class="tier-time">${clock(reached)}${best!==undefined&&best<reached?` · ${t('record')} ${clock(best)}`:best!==undefined?` · ${t('nouveau record')}`:''}</p>${logChart(s,ghost)}<button class="primary">${t('Continuer')}</button></div>`;
 box.querySelector('h2')!.textContent=t(tier.name);
 const close=()=>{box.classList.remove('visible');setTimeout(()=>box.remove(),400);onClose();};
 box.querySelector('button')!.addEventListener('click',close);box.addEventListener('click',e=>{if(e.target===box)close();});
 document.body.append(box);requestAnimationFrame(()=>box.classList.add('visible'));
 if(!reducedMotion()){burst(innerWidth/2,innerHeight/2,36,'gold');vibrate([40,80,40,80,120]);}
}

// ---------- Frame loop ----------
export function startEffects(ctx:EffectsContext) {
 const shown=new Map<string,number>();const seen=new Map<number,number>();
 let lastPlant:PlantId|null=null,lastFrame=performance.now(),previousProduced=ctx.state().produced,lastState=ctx.state();
 let rateMilestone=Math.floor(Math.log10(Math.max(1,measuredRate(ctx.state()).rate)));let peak=ctx.state().peak;
 let known={discoveries:ctx.state().discoveries?.length??0,badges:ctx.state().progress?.badges.length??0,done:ctx.state().progress?.done??0};
 const frame=(now:number)=>{
  const dt=Math.min(.25,(now-lastFrame)/1000);lastFrame=now;
  try{tick(dt);}catch{/* feedback must never break the game */}
  requestAnimationFrame(frame);
 };
 const rect=(m:Machine)=>visibleRect(document.querySelector(`.node[data-id="${m.id}"]`))??visibleRect(document.querySelector(`.network-machine[data-id="${m.id}"]`));
 function tick(dt:number){
  const s=ctx.state(),plant=ctx.plant();
  if(s!==lastState){// new game or import: resynchronize without celebrating
   lastState=s;previousProduced=s.produced;peak=s.peak;seen.clear();shown.clear();rateMilestone=Math.floor(Math.log10(Math.max(1,measuredRate(s).rate)));
   known={discoveries:s.discoveries?.length??0,badges:s.progress?.badges.length??0,done:s.progress?.done??0};
  }
  if(plant!==lastPlant){shown.clear();lastPlant=plant;}
  const motion=!reducedMotion()&&!s.paused;
  // Smoothly counting numbers.
  const k=1-Math.exp(-dt*9);
  for(const el of document.querySelectorAll<HTMLElement>('[data-live]')){
   const kind=el.dataset.live!,key=kind+(el.dataset.resource??'')+plant;
   const target=kind==='stock'?s.plants[plant].stock[el.dataset.resource as Resource]:kind==='produced'?s.produced:kind==='rate'?measuredRate(s).rate:NaN;
   if(!Number.isFinite(target))continue;
   let v=shown.get(key)??target;
   if(!motion||target<v&&kind!=='stock'||Math.abs(target-v)<1e-6||kind==='stock'&&el.dataset.resource==='components'&&target<v)v=target;else v+=(target-v)*k;
   if(Math.abs(target-v)<Math.max(.05,Math.abs(target)*.0005))v=target;
   shown.set(key,v);const text=formatCompact(v);if(el.textContent!==text)el.textContent=text;
  }
  // Smooth machine cycle bars between two interface rebuilds.
  for(const lane of s.plants[plant].lanes)for(const m of lane.machines){
   const bar=document.querySelector<HTMLProgressElement>(`.node[data-id="${m.id}"] progress`);
   if(bar&&!['batch','charge','furnace','compress'].includes(m.kind))bar.value=m.clock>0?Math.max(0,1-m.clock):0;
  }
  // Deliveries and pressings.
  for(const id of PLANTS)s.plants[id].lanes.forEach((lane,laneIndex)=>lane.machines.forEach((m,i)=>{
   if(!m.lastPacket)return;
   const before=seen.get(m.id);seen.set(m.id,m.lastPacket.tick);
   if(before===undefined||before===m.lastPacket.tick)return;
   if(m.kind!=='press'){
    if(id!==plant||!motion)return;const next=lane.machines[i+1];if(!next)return;
    const a=rect(m),b=rect(next);if(a&&b)travel(a,b,m.lastPacket.qty,m.lastPacket.quality,Math.min(700,Math.max(250,Math.abs(b.left-a.right)*2)));return;
   }
   const lp=m.lastPacket;if(lp.result===undefined)return;
   const result=lp.result,record=id==='A'&&result>=peak*1.5&&result>=5;
   if(id==='A')peak=Math.max(peak,s.peak);
   const factors=[lp.quality>1.0001?`q×${formatCompact(lp.quality)}`:'',(lp.bulk??1)>1?'×'+lp.bulk:'',(lp.catalysis??1)>1?'✧×'+lp.catalysis:'',(lp.plasma??1)>1?'✺×'+lp.plasma:'',(lp.legacy??1)>1?'∞×'+formatCompact(lp.legacy!):''].filter(Boolean);
   pressSound(ctx.preferences,result,factors.length-(lp.quality>1.0001?1:0));
   if(ctx.music())musicNote(laneIndex,id,lp.quality);
   if(id!==plant||!motion)return;
   const size=Math.min(36,13+Math.log10(Math.max(1,result))*3.4);
   const special=factors.length>=2;const variant=id==='B'?'catalyst':id==='C'?'plasma':record?'record':special?'special':'';
   const card=rect(m);
   if(card){
    floatText(card.left+card.width/2,card.top+12,`+${formatCompact(result)} ${id==='A'?'⬡':id==='B'?'✧':'✺'}`,size,variant);
    if(factors.length>=2)floatText(card.left+card.width/2,card.top-12,factors.join(' · '),11,'combo');
    if(special||record)burst(card.left+card.width/2,card.top+card.height/2,record?18:9,record?'gold':variant||'teal');
    bump(document.querySelector(`.node[data-id="${m.id}"]`),'fx-press');
    if(record)floatText(card.left+card.width/2,card.top-30,t('Record de lot'),12,'record-tag');
   }
   bump(document.querySelector(id==='A'?'.resource-components':id==='B'?'.resource-catalyst':'.resource-plasma'));
  }));
  // Unlocks, tiers and the final goal.
  const produced=s.produced;
  if(produced>previousProduced){
   // During the guided first run, the current objective is the only voice: unlock cards would cover it.
   if(!(s.journey&&s.journey.step<9))for(const u of UNLOCKS)if(previousProduced<u.at&&produced>=u.at){
    const kinds=(Object.keys(MODULES) as Kind[]).filter(k=>MODULES[k].unlock===u.at);const kind=kinds[0]??null;
    celebrate({eyebrow:'NOUVELLE POSSIBILITÉ',title:kinds.map(k=>t(MODULES[k].name)).join(' · ')||t(u.at===1e8?'Forge à plasma':u.at===1e12?'Refondation':u.at===3e6?'Empreinte ambre':'Serre catalytique'),text:t(u.text),icon:kind?moduleSymbol(kind):'✦',big:u.at>=1000,action:kind?{label:'Voir le module',run:()=>ctx.onShowModule(kind)}:undefined});
    fanfare(ctx.preferences,u.at>=1000?[2,4,5,7,9]:[3,5,7]);
   }
   for(const tier of TIERS)if(previousProduced<tier.at&&produced>=tier.at&&!(s.journey&&s.journey.step<9)){fanfare(ctx.preferences,[0,2,4,5,7,9,12]);if(!reducedMotion())tierScreen(s,tier,ctx.ghost(),()=>{});}
  }
  previousProduced=produced;
  // Notebook, badges and contracts.
  const disc=s.discoveries??[];
  for(const d of disc.slice(known.discoveries)){if(s.journey&&s.journey.step<9)break;const def=DISCOVERIES.find(x=>x.id===d.id);if(def){celebrate({eyebrow:'NOUVELLE DÉCOUVERTE',title:t(def.name),text:t(def.text),icon:'✦',big:false,action:{label:'Ouvrir le carnet',run:()=>ctx.onOpen('notebook')}});fanfare(ctx.preferences,[4,7,9]);}}
  known.discoveries=disc.length;
  const badges=s.progress?.badges??[];
  for(const id of badges.slice(known.badges)){const def=BADGES.find(x=>x.id===id);if(def)celebrate({eyebrow:'NOUVEAU BADGE',title:t(def.name),text:t(def.text),icon:'★',big:false,action:{label:'Ouvrir le carnet',run:()=>ctx.onOpen('notebook')}});}
  known.badges=badges.length;
  if((s.progress?.done??0)>known.done){celebrate({eyebrow:'CONTRAT REMPLI',title:t('Brevets reçus'),text:t('Placez vos brevets dans Expériences : chacun change une règle.'),icon:'§',big:false,action:{label:'Voir les brevets',run:()=>ctx.onOpen('experiments')}});fanfare(ctx.preferences,[2,5,9,12]);}
  known.done=s.progress?.done??0;
  // Orders of magnitude of the measured average rate.
  const rate=measuredRate(s);
  if(rate.duration>=10&&rate.rate>=10){
   const order=Math.floor(Math.log10(rate.rate));
   if(order>rateMilestone){rateMilestone=order;const value=formatCompact(10**order);
    celebrate({eyebrow:'ORDRE DE GRANDEUR',title:t('Plus de {0} composants/s').replace('{0}',value),text:t('Votre débit moyen vient de gagner un chiffre. Qu’est-ce qui l’a rendu possible ?'),icon:'×10',big:order>=3});
    fanfare(ctx.preferences,[order,order+2,order+4,order+5]);bump(document.querySelector('.live-yield'),'fx-glow');}
  }
 }
 requestAnimationFrame(frame);
}
