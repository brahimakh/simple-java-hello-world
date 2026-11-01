// Visual and audio feedback layer. It only reads the simulation state: no effect here may change the game.
// The main interface is rebuilt periodically; this layer runs every animation frame on top of it.
import {MODULES, UNLOCKS, type Kind, type PlantId, type Resource} from './content.ts';
import {measuredRate, type State} from './engine.ts';
import {t, formatCompact} from './i18n.ts';
import {moduleSymbol} from './visuals.ts';

export const EFFECTS_KEY = 'resonance-industrielle-effects-v1';
export interface EffectsPreferences {sound:boolean; volume:number;}
export function readEffects(storage:Storage):EffectsPreferences {
 try {const raw=JSON.parse(storage.getItem(EFFECTS_KEY)??'{}');return {sound:raw.sound===true,volume:typeof raw.volume==='number'&&raw.volume>=0&&raw.volume<=1?raw.volume:.5};}
 catch {return {sound:false,volume:.5};}
}
export function writeEffects(storage:Storage,p:EffectsPreferences) {try{storage.setItem(EFFECTS_KEY,JSON.stringify(p));}catch{}}

export interface EffectsContext {state():State; plant():PlantId; preferences:EffectsPreferences; onShowModule(kind:Kind|null):void;}

// ---------- Sound: tiny synthesized tones, no audio file ----------
let audio:AudioContext|null=null,master:GainNode|null=null,lastPressSound=0;
const SCALE=[0,2,4,7,9,12,14,16,19,21,24,26,28,31];// pentatonic steps, always consonant
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
const note=(step:number)=>220*2**(SCALE[Math.max(0,Math.min(SCALE.length-1,step))]/12);
export function enableSound(p:EffectsPreferences) {if(p.sound)ensureAudio(p.volume);}
function pressSound(p:EffectsPreferences,result:number,special:boolean) {
 if(!p.sound||!ensureAudio(p.volume))return;const now=audio!.currentTime;
 if(now-lastPressSound<.11)return;lastPressSound=now;
 const step=Math.round(Math.log10(Math.max(1,result))*2);
 tone(note(step),now,.16,.22);if(special)tone(note(step+2),now+.05,.22,.14,'sine');
}
function fanfare(p:EffectsPreferences,steps:number[]) {
 if(!p.sound||!ensureAudio(p.volume))return;const now=audio!.currentTime;
 steps.forEach((s,i)=>{tone(note(s),now+i*.09,.5,.2);tone(note(s)*2,now+i*.09,.35,.05,'sine');});
}

// ---------- Visual helpers ----------
const reducedMotion=()=>typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
function layer() {let fx=document.getElementById('fx');if(!fx){fx=document.createElement('div');fx.id='fx';fx.setAttribute('aria-hidden','true');document.body.append(fx);}return fx;}
function visibleRect(el:Element|null) {if(!el)return null;const r=el.getBoundingClientRect();return r.width>0&&r.bottom>0&&r.top<innerHeight?r:null;}
function floatText(x:number,y:number,text:string,size:number,variant:string) {
 const fx=layer();if(fx.childElementCount>40)return;
 const el=document.createElement('span');el.className='fx-float '+variant;el.textContent=text;
 el.style.left=x+'px';el.style.top=y+'px';el.style.fontSize=size+'px';
 el.style.setProperty('--drift',(Math.random()*36-18).toFixed(0)+'px');
 fx.append(el);el.addEventListener('animationend',()=>el.remove());setTimeout(()=>el.remove(),2500);
}
function burst(x:number,y:number,count:number,variant:string) {
 const fx=layer();if(fx.childElementCount>80)return;
 for(let i=0;i<count;i++){const el=document.createElement('i');el.className='fx-spark '+variant;el.style.left=x+'px';el.style.top=y+'px';
  const a=Math.PI*2*i/count+Math.random()*.4,d=40+Math.random()*50;el.style.setProperty('--dx',(Math.cos(a)*d).toFixed(0)+'px');el.style.setProperty('--dy',(Math.sin(a)*d).toFixed(0)+'px');
  fx.append(el);el.addEventListener('animationend',()=>el.remove());setTimeout(()=>el.remove(),1500);}
}
function bump(el:Element|null,cls='fx-bump') {if(!el)return;el.classList.remove(cls);void (el as HTMLElement).offsetWidth;el.classList.add(cls);}

// ---------- Celebrations ----------
let celebrationTimer=0;
function celebrate(ctx:EffectsContext,eyebrow:string,title:string,text:string,icon:string,kind:Kind|null,big:boolean) {
 let box=document.getElementById('celebration');
 if(!box){box=document.createElement('div');box.id='celebration';box.setAttribute('role','status');document.body.append(box);}
 box.className=big?'big':'';box.innerHTML='';
 const head=document.createElement('div');head.className='celebration-icon';head.innerHTML=icon;
 const body=document.createElement('div');
 const e=document.createElement('span');e.className='eyebrow';e.textContent=t(eyebrow);
 const h=document.createElement('strong');h.textContent=title;
 const p=document.createElement('p');p.textContent=text;
 body.append(e,h,p);
 const actions=document.createElement('div');actions.className='celebration-actions';
 if(kind!==null){const go=document.createElement('button');go.className='primary';go.textContent=t('Voir le module');go.addEventListener('click',()=>{hide();ctx.onShowModule(kind);});actions.append(go);}
 const close=document.createElement('button');close.textContent='✕';close.setAttribute('aria-label',t('Fermer'));close.addEventListener('click',hide);actions.append(close);
 body.append(actions);box.append(head,body);
 requestAnimationFrame(()=>box!.classList.add('visible'));
 clearTimeout(celebrationTimer);celebrationTimer=window.setTimeout(hide,big?9000:7000);
 function hide(){box!.classList.remove('visible');}
 if(!reducedMotion()){const r=box.getBoundingClientRect();burst(r.left+40,r.top+40,big?26:14,big?'gold':'teal');}
}

// ---------- Frame loop ----------
export function startEffects(ctx:EffectsContext) {
 const shown=new Map<string,number>();const seenPress=new Map<number,number>();
 let lastPlant:PlantId|null=null,lastFrame=performance.now(),previousProduced=ctx.state().produced,lastState=ctx.state();
 let rateMilestone=Math.floor(Math.log10(Math.max(1,measuredRate(ctx.state()).rate)));let peak=ctx.state().peak;
 const frame=(now:number)=>{
  const dt=Math.min(.25,(now-lastFrame)/1000);lastFrame=now;
  try{tick(dt);}catch{/* feedback must never break the game */}
  requestAnimationFrame(frame);
 };
 function tick(dt:number){
  const s=ctx.state(),plant=ctx.plant();
  if(s!==lastState){// new game or import: resynchronize without celebrating
   lastState=s;previousProduced=s.produced;peak=s.peak;seenPress.clear();shown.clear();rateMilestone=Math.floor(Math.log10(Math.max(1,measuredRate(s).rate)));
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
   if(bar&&m.kind!=='batch'&&m.kind!=='charge')bar.value=m.clock>0?Math.max(0,1-m.clock):0;
  }
  // Press outputs: floating numbers, sparks and sound.
  for(const id of ['A','B'] as PlantId[])for(const lane of s.plants[id].lanes)for(const m of lane.machines){
   if(m.kind!=='press'||!m.lastPacket)continue;
   const before=seenPress.get(m.id);seenPress.set(m.id,m.lastPacket.tick);
   if(before===undefined||before===m.lastPacket.tick||m.lastPacket.result===undefined)continue;
   const result=m.lastPacket.result,special=(m.lastPacket.bulk??1)>1||(m.lastPacket.catalysis??1)>1,record=id==='A'&&result>=peak*1.5&&result>=5;
   if(id==='A')peak=Math.max(peak,s.peak);
   pressSound(ctx.preferences,result,special||record);
   if(id!==plant||!motion)continue;
   const size=Math.min(34,13+Math.log10(Math.max(1,result))*4.2);
   const variant=id==='B'?'catalyst':record?'record':special?'special':'';
   const card=visibleRect(document.querySelector(`.node[data-id="${m.id}"]`))??visibleRect(document.querySelector(`.network-machine[data-id="${m.id}"]`));
   const tags=[(m.lastPacket.bulk??1)>1?'×'+m.lastPacket.bulk:'',(m.lastPacket.catalysis??1)>1?'✧×'+m.lastPacket.catalysis:''].filter(Boolean).join(' ');
   const label=`+${formatCompact(result)} ${id==='A'?'⬡':'✧'}${tags?' '+tags:''}`;
   if(card){floatText(card.left+card.width/2,card.top+12,label,size,variant);if(special||record)burst(card.left+card.width/2,card.top+card.height/2,record?18:9,record?'gold':variant||'teal');bump(document.querySelector(`.node[data-id="${m.id}"]`),'fx-press');}
   if(record&&card)floatText(card.left+card.width/2,card.top-14,t('Record de lot'),12,'record-tag');
   bump(document.querySelector(id==='A'?'.resource-components':'.resource-catalyst'));
  }
  // Unlocks and the final goal.
  const produced=s.produced;
  if(produced>previousProduced){
   for(const u of UNLOCKS)if(previousProduced<u.at&&produced>=u.at){
    const kinds=(Object.keys(MODULES) as Kind[]).filter(k=>MODULES[k].unlock===u.at);
    const kind=kinds[0]??null;
    celebrate(ctx,'NOUVELLE POSSIBILITÉ',kinds.map(k=>t(MODULES[k].name)).join(' · ')+(u.at===1000?' · '+t('Serre catalytique'):''),t(u.text),kind?moduleSymbol(kind):'✦',kind,u.at>=1000);
    fanfare(ctx.preferences,u.at>=1000?[2,4,5,7,9]:[3,5,7]);
   }
   if(previousProduced<500000&&produced>=500000){celebrate(ctx,'OBJECTIF INDUSTRIEL',t('Le cœur de Résonance bat'),t('500 000 composants cumulés. L’atelier reste ouvert : continuez à inventer.'),'✦',null,true);fanfare(ctx.preferences,[0,2,4,5,7,9,12]);}
  }
  previousProduced=produced;
  // Orders of magnitude of the measured average rate.
  const rate=measuredRate(s);
  if(rate.duration>=10&&rate.rate>=10){
   const order=Math.floor(Math.log10(rate.rate));
   if(order>rateMilestone){rateMilestone=order;const value=formatCompact(10**order);
    celebrate(ctx,'ORDRE DE GRANDEUR',t('Plus de {0} composants/s').replace('{0}',value),t('Votre débit moyen vient de gagner un chiffre. Qu’est-ce qui l’a rendu possible ?'),'×10',null,order>=3);
    fanfare(ctx.preferences,[order,order+2,order+4,order+5]);
    bump(document.querySelector('.live-yield'),'fx-glow');}
  }
 }
 requestAnimationFrame(frame);
}
