export type Kind = 'intake' | 'batch' | 'cadence' | 'charge' | 'sync' | 'press' | 'recovery' | 'exchanger' | 'stamp' | 'weave' | 'router' | 'split' | 'filter' | 'mirror' | 'furnace' | 'compress' | 'harmonic' | 'sensor';
export type Resource = 'ore' | 'energy' | 'components' | 'residue' | 'catalyst' | 'plasma';
export type PlantId = 'A' | 'B' | 'C';
export const PLANTS:PlantId[] = ['A','B','C'];
export interface ModuleDefinition { name: string; icon: string; cost: number; unlock: number; input: 'matter' | 'exhaust' | 'none'; output: 'matter' | 'exhaust'; description: string; }
export const MODULES: Record<Kind, ModuleDefinition> = {
  stamp: {name:'Marqueur',icon:'⌑',cost:35,unlock:30,input:'matter',output:'matter',description:'Marque une livraison avec 1 empreinte de sa couleur (cyan, ou ambre dès 3 M cumulés). Un lot ne reçoit qu’une empreinte par couleur, même après amplification. L’accumulateur additionne les empreintes au prorata de la matière réunie. Cycle : 0,1 s.'},
  weave: {name:'Tisseur',icon:'⋇',cost:70,unlock:80,input:'matter',output:'matter',description:'Consomme les empreintes du lot pour multiplier sa qualité par (1 + empreintes), jusqu’à ×8. Un lot portant les deux couleurs gagne encore ×2. Sans empreinte : ×1. Une empreinte consommée ne peut pas être réactivée. Cycle : 0,2 s.'},
  router: {name:'Aiguillage',icon:'⑂',cost:55,unlock:60,input:'matter',output:'matter',description:'Oriente chaque lot vers la suite locale ou vers la première carte après l’injecteur d’une autre ligne de la même installation. Modes : petits lots, gros lots, alternance ou surplus si la sortie locale est bloquée. Le lot arrive au pas suivant, sans copie. Cycle : 0,2 s. Une destination absente ou saturée arrête le lot.'},
  intake: {name:'Injecteur', icon:'↳', cost:20, unlock:0, input:'none', output:'matter', description:'Toutes les 0,5 s : prélève 6 ou 12 matières (réglable) dans la réserve locale. Attend si la réserve ou la sortie manque. À la Serre, prélève des résidus ; à la Forge, des catalyseurs. Débit maximal : 24 matières/s par injecteur.'},
  cadence: {name:'Résonateur', icon:'≋', cost:30, unlock:10, input:'matter', output:'matter', description:'À chaque livraison ≤ 12 matières, gagne un accord si la précédente date de ≤ 2 s (4 accords au plus). Qualité × (1 + accords ÷ n), où n est le rang de ce résonateur pour ce lot : le 1er donne jusqu’à ×5, le 2e ×3, le 3e ×2,33… Une livraison > 12 ou un silence > 2 s rompt la série. Cycle : 0,1 s.'},
  batch: {name:'Accumulateur', icon:'▤', cost:45, unlock:50, input:'matter', output:'matter', description:'Réunit des matières jusqu’au seuil choisi, puis livre exactement ce lot. Qualité moyenne pondérée conservée. Au plus 1 livraison/s. La presse récompense les lots de 80 ou plus.'},
  charge: {name:'Chambre de charge', icon:'⌁', cost:65, unlock:160, input:'matter', output:'matter', description:'Garde chaque lot pendant la durée choisie. Qualité × (1 + durée / 2). Consomme 0,2 énergie × matières × durée. Une seule charge simultanée ; le coût est réservé au démarrage.'},
  press: {name:'Presse', icon:'⬡', cost:25, unlock:0, input:'matter', output:'exhaust', description:'1 lot/s, jusqu’à 160 matières. Fonderie : matières / 10 × qualité × prime de lot (×8 dès 80) × catalyse (×4 pour 1 catalyseur) × surchauffe (×10 pour 1 plasma). Coût : 0,5 énergie/matière. Émet des résidus. Serre : matières / 20 × qualité catalyseurs, coût 0,25 énergie/matière. Forge : matières / 40 × qualité plasma, coût 1 énergie/matière.'},
  recovery: {name:'Récupérateur', icon:'♲', cost:90, unlock:400, input:'exhaust', output:'exhaust', description:'Sur une fin de cycle : restitue 80 % des matières à la réserve d’origine (matière à la Fonderie, résidus à la Serre), une seule fois par lot. Coût : 0,05 énergie/matière. Cycle : 0,2 s.'},
  exchanger: {name:'Échangeur', icon:'⇄', cost:90, unlock:400, input:'exhaust', output:'exhaust', description:'Sur une fin de cycle de la Fonderie : récupère 80 % de l’énergie de pressage, une seule fois par lot. Cycle : 0,2 s. Les charges et les récupérateurs ne sont pas remboursés.'},
  sync: {name:'Synchroniseur', icon:'⋈', cost:180, unlock:1000, input:'matter', output:'matter', description:'À la livraison, si la réserve locale contient au moins 10 catalyseurs : consomme 1 catalyseur et multiplie la qualité par 3. Sinon, attend. Cycle : 0,5 s. Fonctionne aussi avant une presse catalysée.'},
  split: {name:'Diviseur', icon:'⫽', cost:120, unlock:3000, input:'matter', output:'matter', description:'Coupe chaque lot en deux moitiés de même qualité ; empreintes partagées à parts égales. Deux petits lots peuvent ensuite nourrir un résonateur. Cycle : 0,2 s.'},
  filter: {name:'Filtre', icon:'⊻', cost:200, unlock:10000, input:'matter', output:'matter', description:'Laisse passer les lots dont la qualité atteint le seuil choisi. Les autres repartent vers la première carte après l’injecteur de la même ligne, au pas suivant. Au 8e retour, le lot passe quand même. Cycle : 0,1 s.'},
  mirror: {name:'Miroir', icon:'◫', cost:350, unlock:30000, input:'matter', output:'matter', description:'Retient la qualité d’origine du dernier lot reçu. Un lot plus faible reçoit cette qualité, contre 0,2 énergie par matière. Un reflet ne se reflète pas : seule la qualité d’origine est retenue. Mémoire effacée après 3 s sans lot. Cycle : 0,2 s.'},
  furnace: {name:'Four', icon:'♨', cost:600, unlock:100000, input:'matter', output:'matter', description:'Chaque lot apporte une chaleur égale à ses matières ÷ 10 ; le four perd 10 % de sa chaleur par seconde (maximum 100). Qualité × (1 + chaleur ÷ 25), jusqu’à ×5. Coût : 0,1 énergie/matière. Il récompense les lignes à fort débit. Cycle : 0,1 s.'},
  compress: {name:'Compresseur', icon:'⧈', cost:1500, unlock:300000, input:'matter', output:'matter', description:'Attend N lots (2, 4 ou 8), puis livre un seul lot : matières totales ÷ N, qualité moyenne × N × 0,75. Moins de matière, plus de densité : contourne la limite d’un lot par seconde de la presse. Cycle : 1 s.'},
  harmonic: {name:'Harmoniseur', icon:'♒', cost:4000, unlock:1e6, input:'matter', output:'matter', description:'Si un harmoniseur d’une autre ligne de la même installation a livré au même pas ou au pas précédent : qualité ×3. Sinon ×1. Des lignes réglées sur la même cadence se renforcent. Cycle : 0,1 s.'},
  sensor: {name:'Capteur', icon:'◎', cost:2500, unlock:1e6, input:'matter', output:'matter', description:'Laisse passer un lot seulement si la réserve choisie de l’installation atteint le seuil (énergie, catalyseurs, matière ou plasma). Sinon il le garde. Protège une ressource pour les machines qui suivent. Cycle : 0,1 s.'}
};
export const RESOURCE_NAMES: Record<Resource,string> = {ore:'Matière',energy:'Énergie',components:'Composants',residue:'Résidus',catalyst:'Catalyseurs',plasma:'Plasma'};
export const PLANT_NAMES: Record<PlantId,string> = {A:'Fonderie',B:'Serre catalytique',C:'Forge à plasma'};
export const PLANT_INPUT: Record<PlantId,Resource> = {A:'ore',B:'residue',C:'catalyst'};
export const PLANT_OUTPUT: Record<PlantId,Resource> = {A:'components',B:'catalyst',C:'plasma'};
export const PLANT_UNLOCK: Record<PlantId,number> = {A:0,B:1000,C:1e8};
// Announced limits. Quality and stock ceilings are rules shown to the player, not hidden caps.
export const LIMITS = {stock:1e21, quality:1e12, queue:800, packet:160, nodes:10, lanes:6, events:240, produced:1e21};
export const UNLOCKS = [
  {at:10, text:'Résonateur disponible · les livraisons peuvent s’accorder.'},
  {at:30, text:'Marqueur disponible · chaque livraison peut laisser une empreinte.'},
  {at:50, text:'Accumulateur disponible · la taille du lot devient un choix.'},
  {at:60, text:'Aiguillage disponible · les lignes peuvent coopérer.'},
  {at:80, text:'Tisseur disponible · l’ordre des procédés change le résultat.'},
  {at:160, text:'Chambre de charge disponible · le temps devient une matière première.'},
  {at:400, text:'Récupération disponible · les sorties peuvent nourrir les entrées.'},
  {at:1000, text:'Serre, synchroniseur et encapsulation disponibles.'},
  {at:3000, text:'Diviseur disponible · un gros lot peut redevenir deux petits.'},
  {at:10000, text:'Filtre disponible · les lots faibles peuvent refaire un tour.'},
  {at:30000, text:'Miroir disponible · un lot riche peut en inspirer un autre.'},
  {at:100000, text:'Four et contrats disponibles · le débit devient de la chaleur.'},
  {at:300000, text:'Compresseur disponible · densifier plutôt qu’accumuler.'},
  {at:1e6, text:'Harmoniseur et capteur disponibles · les lignes peuvent jouer ensemble.'},
  {at:3e6, text:'Empreinte ambre disponible · un lot bicolore double le tissage.'},
  {at:1e8, text:'Forge à plasma disponible · une troisième installation ferme le triangle.'},
  {at:1e12, text:'Refondation possible · recommencer plus fort, inventions conservées.'}
];
// Orders of magnitude of lifetime production: each one is celebrated and named.
export const TIERS = [
  {at:1e3,name:'Atelier'},{at:1e6,name:'Manufacture'},{at:1e9,name:'Complexe'},{at:1e12,name:'Métropole industrielle'},{at:1e15,name:'Le cœur de Résonance'}
];
export const FINAL_GOAL = 1e15;
