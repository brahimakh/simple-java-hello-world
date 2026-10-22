export type Kind = 'intake' | 'batch' | 'cadence' | 'charge' | 'sync' | 'press' | 'recovery' | 'exchanger';
export type Resource = 'ore' | 'energy' | 'components' | 'residue' | 'catalyst';
export type PlantId = 'A' | 'B';
export interface ModuleDefinition { name: string; icon: string; cost: number; unlock: number; input: 'matter' | 'exhaust' | 'none'; output: 'matter' | 'exhaust'; description: string; }
export const MODULES: Record<Kind, ModuleDefinition> = {
  intake: {name:'Injecteur', icon:'↳', cost:20, unlock:0, input:'none', output:'matter', description:'Toutes les 0,5 s : prélève 6 ou 12 matières (réglable) dans la réserve locale. Attend si la réserve ou la sortie manque. À la Serre, prélève des résidus. Débit maximal : 24 matières/s par injecteur.'},
  cadence: {name:'Résonateur', icon:'≋', cost:30, unlock:10, input:'matter', output:'matter', description:'À chaque livraison ≤ 12 matières, gagne un accord si la précédente date de ≤ 2 s. Qualité × (1 + accords), maximum ×5. Une livraison > 12 ou un silence > 2 s rompt la série. Cycle : 0,1 s.'},
  batch: {name:'Accumulateur', icon:'▤', cost:45, unlock:50, input:'matter', output:'matter', description:'Réunit des matières jusqu’au seuil choisi, puis livre exactement ce lot. Qualité moyenne pondérée conservée. Au plus 1 livraison/s. La presse récompense les lots de 80 ou plus.'},
  charge: {name:'Chambre de charge', icon:'⌁', cost:65, unlock:160, input:'matter', output:'matter', description:'Garde chaque lot pendant la durée choisie. Qualité × (1 + durée / 2). Consomme 0,2 énergie × matières × durée. Une seule charge simultanée ; le coût est réservé au démarrage.'},
  press: {name:'Presse', icon:'⬡', cost:25, unlock:0, input:'matter', output:'exhaust', description:'1 lot/s, jusqu’à 160 matières. Fonderie : matières / 10 × qualité × prime de lot (×8 dès 80) × catalyse (×4 pour 1 catalyseur). Coût : 0,5 énergie/matière. Émet des résidus. Serre : matières / 20 × qualité catalyseurs, coût 0,25 énergie/matière, sans prime de lot ni catalyse.'},
  recovery: {name:'Récupérateur', icon:'♲', cost:90, unlock:400, input:'exhaust', output:'exhaust', description:'Sur une fin de cycle de la Fonderie : restitue 80 % des matières, une seule fois par lot. Coût : 0,05 énergie/matière. Cycle : 0,2 s. Le résidu émis par la presse reste disponible : il représente la chaleur exploitable.'},
  exchanger: {name:'Échangeur', icon:'⇄', cost:90, unlock:400, input:'exhaust', output:'exhaust', description:'Sur une fin de cycle de la Fonderie : récupère 80 % de l’énergie de pressage, une seule fois par lot. Cycle : 0,2 s. Les charges et les récupérateurs ne sont pas remboursés.'},
  sync: {name:'Synchroniseur', icon:'⋈', cost:180, unlock:1000, input:'matter', output:'matter', description:'À la livraison, si la réserve locale contient au moins 10 catalyseurs : consomme 1 catalyseur et multiplie la qualité par 3. Sinon, attend. Cycle : 0,5 s. Fonctionne aussi avant une presse catalysée.'}
};
export const RESOURCE_NAMES: Record<Resource,string> = {ore:'Matière',energy:'Énergie',components:'Composants',residue:'Résidus',catalyst:'Catalyseurs'};
export const LIMITS = {stock:1e12, quality:1e6, queue:800, packet:160, nodes:10, lanes:6, events:120};
export const UNLOCKS = [
  {at:10, text:'Résonateur disponible · les livraisons peuvent s’accorder.'},
  {at:50, text:'Accumulateur disponible · la taille du lot devient un choix.'},
  {at:160, text:'Chambre de charge disponible · le temps devient une matière première.'},
  {at:400, text:'Récupération disponible · les sorties peuvent nourrir les entrées.'},
  {at:1000, text:'Serre, synchroniseur et encapsulation disponibles.'}
];
