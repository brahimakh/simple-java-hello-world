import type {State} from './engine.ts';
import type {Language} from './i18n.ts';
export const PREFERENCES_KEY='resonance-preferences-v1';
export interface Preferences {version:1;language:Language;guide:{hidden:boolean;intake:boolean;press:boolean;rate:boolean;saved:boolean;added:boolean;processed:boolean};}
export const defaultPreferences=():Preferences=>({version:1,language:'fr',guide:{hidden:false,intake:false,press:false,rate:false,saved:false,added:false,processed:false}});
export function readPreferences(storage:Pick<Storage,'getItem'>):Preferences {
 const fallback=defaultPreferences();
 try{const raw=storage.getItem(PREFERENCES_KEY);if(!raw)return fallback;const p=JSON.parse(raw);if(!p||p.version!==1)return fallback;
   if(p.language==='fr'||p.language==='en')fallback.language=p.language;
   if(p.guide&&typeof p.guide==='object')for(const key of Object.keys(fallback.guide) as (keyof Preferences['guide'])[])if(typeof p.guide[key]==='boolean')fallback.guide[key]=p.guide[key];
 }catch{/* Invalid or unavailable preferences never affect the game save. */}
 return fallback;
}
export function writePreferences(storage:Pick<Storage,'setItem'>,p:Preferences) {try{storage.setItem(PREFERENCES_KEY,JSON.stringify(p));return true;}catch{return false;}}
export function guideStep(s:State,p:Preferences):number {
 if(!p.guide.intake)return 0;
 if(!p.guide.press)return 1;
 const modules=Object.values(s.plants).flatMap(p=>p.lanes).flatMap(l=>l.machines).filter(m=>m.kind!=='intake'&&m.kind!=='press');
 if(!p.guide.added&&!modules.length)return 2;
 if(!p.guide.rate||(!p.guide.processed&&!modules.some(m=>m.processed>0)))return 3;
 if(!p.guide.saved&&!s.configurations.length)return 4;
 return 5;
}
export function rememberGuideProgress(s:State,p:Preferences) {
 const modules=Object.values(s.plants).flatMap(p=>p.lanes).flatMap(l=>l.machines).filter(m=>m.kind!=='intake'&&m.kind!=='press');
 const added=p.guide.added||modules.length>0,processed=p.guide.processed||modules.some(m=>m.processed>0);
 if(added===p.guide.added&&processed===p.guide.processed)return false;
 p.guide.added=added;p.guide.processed=processed;return true;
}
export const GUIDE_STEPS=[
 {title:'1. D’où vient la matière ?',description:'L’extraction remplit une réserve. L’injecteur y prélève des matières et les livre à la carte suivante. Sélectionnez-le : son panneau explique le débit et le cycle.',action:'guide-intake',button:'Examiner l’injecteur'},
 {title:'2. Comment gagner des composants ?',description:'La presse consomme les lots reçus et de l’énergie, puis produit les composants qui paient vos constructions. Sélectionnez-la pour lire sa règle.',action:'guide-press',button:'Examiner la presse'},
 {title:'3. Changer une règle',description:'Ajoutez un module de votre choix dans « Modules disponibles ». Lisez sa règle avant de l’acheter. Le premier se débloque à 10 composants produits ; dépenser votre budget ne retire aucun déblocage.',action:'guide-modules',button:'Voir les modules'},
 {title:'4. Vérifier l’effet de votre idée',description:'Ouvrez le débit moyen et laissez votre nouveau module traiter un lot. Observez plusieurs cycles : un gros pic ne garantit pas un meilleur débit. Vous pouvez réorganiser ou démonter sans pénalité.',action:'rate',button:'Comprendre le débit'},
 {title:'5. Garder une idée pour la retrouver',description:'Donnez un nom à votre configuration. Vous pourrez la restaurer depuis « Inventions » après avoir essayé autre chose. Ce plan garde les machines et leurs réglages ; il ne copie pas la production.',action:'save-config',button:'Enregistrer mon premier plan'}
];
