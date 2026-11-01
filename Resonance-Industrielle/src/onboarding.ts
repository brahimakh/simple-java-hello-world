import type {State} from './engine.ts';
import type {Language} from './i18n.ts';
export const PREFERENCES_KEY='resonance-preferences-v1';
export interface Preferences {version:1;language:Language;guide:{hidden:boolean;intake:boolean;press:boolean;rate:boolean;saved:boolean;added:boolean;processed:boolean};lessons:{quality:boolean;imprints:boolean;branch:boolean;cooperation:boolean};}
export const defaultPreferences=():Preferences=>({version:1,language:'fr',guide:{hidden:false,intake:false,press:false,rate:false,saved:false,added:false,processed:false},lessons:{quality:false,imprints:false,branch:false,cooperation:false}});
export function readPreferences(storage:Pick<Storage,'getItem'>):Preferences {
 const fallback=defaultPreferences();
 try{const raw=storage.getItem(PREFERENCES_KEY);if(!raw)return fallback;const p=JSON.parse(raw);if(!p||p.version!==1)return fallback;
   if(p.language==='fr'||p.language==='en')fallback.language=p.language;
   if(p.guide&&typeof p.guide==='object')for(const key of Object.keys(fallback.guide) as (keyof Preferences['guide'])[])if(typeof p.guide[key]==='boolean')fallback.guide[key]=p.guide[key];
   if(p.lessons&&typeof p.lessons==='object')for(const key of Object.keys(fallback.lessons) as (keyof Preferences['lessons'])[])if(typeof p.lessons[key]==='boolean')fallback.lessons[key]=p.lessons[key];
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
 const before=JSON.stringify(p);
 p.guide.added=added;p.guide.processed=processed;
 const ms=s.plants.A.lanes.flatMap(l=>l.machines);
 if(ms.some(m=>m.kind==='press'&&(m.lastPacket?.quality??1)>1))p.lessons.quality=true;
 if(s.plants.A.lanes.some(l=>{const stamp=l.machines.findIndex(m=>m.kind==='stamp'),batch=l.machines.findIndex(m=>m.kind==='batch'),weave=l.machines.findIndex(m=>m.kind==='weave');return stamp>0&&batch>stamp&&weave>batch&&(l.machines[weave].lastPacket?.quality??1)>1;}))p.lessons.imprints=true;
 if(ms.some(m=>(m.routing?.branch??0)>0))p.lessons.branch=true;
 if(s.catalystProduced>0&&s.transfers[1].moved>0)p.lessons.cooperation=true;
 return before!==JSON.stringify(p);
}
export const GUIDE_STEPS=[
 {title:'1. D’où vient la matière ?',description:'L’extraction remplit une réserve. L’injecteur y prélève des matières et les livre à la carte suivante. Sélectionnez-le : son panneau explique le débit et le cycle.',action:'guide-intake',button:'Examiner l’injecteur'},
 {title:'2. Comment gagner des composants ?',description:'La presse consomme les lots reçus et de l’énergie, puis produit les composants qui paient vos constructions. Sélectionnez-la pour lire sa règle.',action:'guide-press',button:'Examiner la presse'},
 {title:'3. Changer une règle',description:'Premier essai gratuit : sélectionnez l’injecteur et comparez 6 puis 12 matières par livraison. Ensuite, ajoutez un module de votre choix. Le résonateur ouvre à 10 composants produits ; aucune amélioration d’extraction n’est nécessaire pour cet essai.',action:'guide-intake',button:'Régler mon premier essai'},
 {title:'4. Vérifier l’effet de votre idée',description:'Ouvrez le débit moyen et laissez votre nouveau module traiter un lot. Le panneau « Observer ma modification » distingue l’avant et l’après. Les anciens lots en attente gardent leurs propriétés : le résultat à la presse peut arriver plus tard.',action:'rate',button:'Comprendre le débit'},
 {title:'5. Garder une idée pour la retrouver',description:'Donnez un nom à votre configuration. Vous pourrez la restaurer depuis « Inventions » après avoir essayé autre chose. Ce plan garde les machines et leurs réglages ; il ne copie pas la production.',action:'save-config',button:'Enregistrer mon premier plan'}
];
export const LESSONS=[
 {key:'quality',title:'Faire arriver un lot amélioré',description:'Essayez le résonateur sur des livraisons régulières de 6 ou 12. Sélectionnez ensuite la presse : la qualité de sa dernière sortie doit dépasser ×1. Les anciens lots peuvent retarder ce résultat.',action:'guide-press',button:'Suivre la sortie de la presse'},
 {key:'imprints',title:'Comparer deux ordres',description:'Quand marqueur, accumulateur et tisseur sont disponibles, comparez marqueur → accumulateur → tisseur avec accumulateur → marqueur → tisseur. Essayez le seuil 80 à la Fonderie. Le banc permet de comparer sans vider vos files réelles.',action:'lesson-bench',button:'Préparer une comparaison'},
 {key:'branch',title:'Recevoir un lot sur une autre ligne',description:'Créez une ligne en mode réception de branche, puis choisissez-la dans un aiguillage. Un compteur « Branche » supérieur à zéro confirme la première livraison. Les nouveaux modificateurs sont insérés avant l’aiguillage.',action:'lesson-branch',button:'Préparer une destination'},
 {key:'cooperation',title:'Fermer la boucle entre les usines',description:'À 1 000 composants cumulés, construisez dans la Serre. Produisez des catalyseurs et observez leur retour vers la Fonderie dans la vue générale.',action:'lesson-cooperation',button:'Observer les échanges'}
] as const;
export function nextLesson(p:Preferences){return LESSONS.find(l=>!p.lessons[l.key]);}
