# Résonance industrielle

Un jeu incremental solo en français ou en anglais : construire des chaînes de procédés, comprendre leurs interactions et réutiliser ses inventions. Tout reste sur le PC, sans compte ni service distant.

Pour comprendre le rôle du joueur et faire un premier essai : lire [le guide des bases](GUIDE-JOUEUR.md). Il comprend aussi un petit cadre pour partager ses remarques.

## Nouveautés 0.4 : comprendre chaque changement

- Le guide propose un premier réglage gratuit de l’injecteur, puis une seule expérience accompagnée à la fois : qualité, ordre des empreintes, branche et coopération. Les achats restent libres.
- Les infrastructures indiquent si une pénurie est observée. Acheter de l’alimentation ne change pas la vitesse propre des machines.
- Après un achat, déplacement ou réglage, **Observer ma modification** montre le débit avant/après, le nombre d’anciens lots encore devant les presses et les cycles des machines ajoutées. Son bouton compare directement les plans au banc, sans modifier la partie. La référence créée par ce bouton remplace celle du banc ; elle reste temporaire jusqu’à une mémorisation manuelle.
- Dans l’inspecteur, **Comprendre un lot** montre les propriétés réelles de la dernière sortie. Pour une presse, les facteurs et le résultat exact sont conservés : matière, qualité, prime de gros lot et catalyse. Les lots des différentes machines ne sont pas nécessairement le même lot.
- Une nouvelle ligne demande son rôle : alimentation propre ou réception de branche avec injecteur suspendu. Les nouveaux modificateurs s’insèrent avant le premier aiguillage. Les branches sans destination sont prioritaires dans le diagnostic ; le schéma signale les trajets récents et les machines contournées. La récupération reste à placer après la presse qui reçoit effectivement les lots.
- Trois **défis d’invention** facultatifs ouvrent à 1 000 composants cumulés, dans **Expériences** : sobriété, distribution entre deux presses et symbiose entre usines. Chacun mesure 60 secondes actives, conserve un badge et les résultats mesurés, sans dotation. Modifier la configuration interrompt l’essai ; la pause suspend sa durée. Le défi de sobriété limite temporairement la génération de Fonderie à 8 énergie/s, puis rend vos niveaux habituels, y compris sur une partie déjà améliorée.

Les sauvegardes v1 restent compatibles. Le suivi avant/après est temporaire et repart après la prochaine modification lors d’un rechargement ; les essais de défis en cours et badges sont sauvegardés. Les résonateurs et leurs multiplicateurs sont conservés. Aucun reset requis.

## Jouer sous Windows

Dossier : **E:\ChatGPTWork\Resonance-Industrielle**.

1. Double-cliquez sur **Demarrer.cmd**.
2. Le navigateur ouvre **http://127.0.0.1:4317**.
3. Gardez la fenêtre du lanceur ouverte. La première chaîne produit déjà ; explorez les cartes et leurs règles.

Les fichiers compilés sont déjà présents dans `dist/`. Node.js 24 ou plus récent est nécessaire. Le lanceur utilise Node dans le PATH, ou le runtime Codex déjà présent sur ce PC. Il n’installe aucun outil système. Si Node manque, installer sa version LTS depuis https://nodejs.org/ est la seule préparation nécessaire pour jouer.

Le jeu compilé fonctionne sans Internet, CDN, API ou clé. Il n’est pas nécessaire d’installer les dépendances pour jouer. La première installation des outils de développement peut demander Internet.

## Nouveautés 0.3 : inventer, relier, mesurer

Trois modules élargissent les possibilités sans modifier vos anciennes constructions :

- **Marqueur** : disponible à 30 composants cumulés. Il laisse une empreinte sur une livraison. Les empreintes suivent la matière lorsque des lots sont réunis ou divisés.
- **Aiguillage** : à 60 composants. Dans ses réglages, choisissez une autre ligne et une règle : petits lots, gros lots, alternance ou surplus. La branche entre après l’injecteur de destination. Un bouton permet de suspendre cet injecteur si vous souhaitez une ligne alimentée uniquement par la branche.
- **Tisseur** : à 80 composants. Il consomme les empreintes reçues pour amplifier la qualité. L’endroit où vous placez le marqueur et le tisseur compte : expérimentez avec l’ordre des cartes.

Le schéma au-dessus des cartes représente toutes les lignes et leurs branches. Les impulsions correspondent à des livraisons réelles ; les chiffres sous les machines indiquent la matière en tampon, y compris les entrées en transit réservées. Sélectionner une machine sur le schéma ouvre ses détails. Les cartes affichent aussi le dernier lot, sa qualité et ses empreintes. La frise de progression distingue les acquis et les prochains paliers, avec une barre pour le prochain déblocage.

**Banc d’essai :**

1. Ouvrez sa rubrique et mémorisez une référence.
2. Revenez à l’atelier et modifiez votre configuration.
3. Choisissez une fenêtre de 60, 180 ou 600 secondes et lancez la comparaison.

Les deux essais utilisent les réserves et alimentations de la référence et redémarrent à vide, avec 120 secondes de stabilisation. Seules les lignes de l’installation sélectionnée sont remplacées par celles de votre atelier actuel. Les résultats montrent les débits, les courbes sur une échelle commune, les variations des réserves, les blocages et le coût des machines. Les injecteurs volontairement suspendus ne sont pas comptés comme un goulot. Un avertissement signale un débit qui vide une réserve. Ce résultat décrit une fenêtre simulée, pas une garantie de production perpétuelle.

Le banc ne produit rien dans la partie réelle et n’y prélève rien. Sa référence est mémorisée séparément de votre sauvegarde de partie et peut être remplacée. Pour comparer la Serre, capturez une référence où elle est déjà débloquée. Les branches d’une configuration complète sont conservées à la restauration ; les branches externes d’une invention nouvellement construite restent à reconnecter.

Le port 4317 et l’adresse 127.0.0.1 restent fixes pour conserver l’origine des sauvegardes. Si le jeu fonctionne déjà, le lanceur réutilise son serveur. Si une autre application occupe le port, il le signale et ne change pas silencieusement de port.

## Prendre en main l’atelier

Depuis la version 0.2, un panneau **Premiers pas** explique votre rôle et accompagne cinq gestes : inspecter l’injecteur, inspecter la presse, choisir un module, observer son effet et enregistrer une configuration. Il suit les actions réellement effectuées. Il est facultatif ; **Explorer librement** le masque, et la rubrique **Premiers pas** permet de le reprendre ou de le revoir. Aucun achat automatique, cadeau ou changement d’équilibrage n’est ajouté par le guide.

La rubrique **Premiers pas** explique également la boucle globale, les différences entre stock, production cumulée et débit, les messages d’attente et les prochains déblocages. Un petit lexique anglais/français aide à retrouver les termes du jeu.

Le sélecteur **Langue / Language**, en haut de l’écran, permet de passer à **English** à tout moment. Les règles des machines, descriptions, expériences, messages et dialogues sont traduits ; les nombres suivent la langue choisie. Les noms que vous donnez aux configurations et inventions restent les vôtres. Le choix de langue et la progression du guide sont mémorisés localement, séparément de la sauvegarde de partie : changer de langue ne demande pas de recommencer. Ils ne sont pas transférés dans l’export JSON de partie.

Pour charger cette mise à jour dans un onglet déjà ouvert, actualisez la page. Vos anciennes sauvegardes v1 restent compatibles.

- Sélectionner une carte affiche ses règles et ses réglages. Cliquer une flèche ouvre ou ferme sa connexion.
- Ajouter un module l’insère du bon côté de la presse. Les boutons de déplacement changent l’ordre entre modificateurs compatibles.
- Les injecteurs livrent 6 ou 12 matières par demi-seconde. Les réserves, la cadence des machines et les tampons sont des contraintes distinctes.
- Le démontage rend le coût des machines et les matières internes. Un démontage attend si les réserves ne peuvent pas accueillir le remboursement.
- Une configuration conserve les plans d’une installation. La restaurer redémarre ses machines ; une invention encapsulée sur place conserve ses cycles et tampons en cours.
- À 1 000 composants cumulés : deuxième installation, encapsulation et synchroniseur. Les échanges sont automatiques ; leur commande est dans **Vue générale**.
- Le budget de construction est celui de la Fonderie, y compris pour la Serre. Les dépenses ne diminuent pas la production cumulée utilisée pour les déblocages.
- Un clic sur un stock ou le débit explique son calcul. Le pic par lot est distinct du débit moyen.

## Sauvegardes et pause

Sauvegarde locale automatique toutes les cinq secondes, plus boutons Sauver, Exporter et Importer. Les sauvegardes sont propres au navigateur et à l’adresse ci-dessus. Utiliser le même navigateur pour retrouver sa partie ; utiliser le JSON pour la transférer. Effacer les données du navigateur efface également les sauvegardes.

L’import valide la structure, les limites, les identifiants et les états internes avant remplacement, avec confirmation. La sauvegarde précédente valide est conservée. Un fichier illisible ne devient jamais la copie de secours. Si aucune copie valide n’est disponible, la sauvegarde automatique est suspendue et l’export permet de conserver le fichier problématique.

**Aucune progression hors ligne.** Pause explicite en haut à droite. Un onglet masqué ne simule pas ; à son retour, aucun temps n’est rattrapé. Une suspension de plus d’une seconde est ignorée. Un navigateur ne garantit pas une exécution permanente en arrière-plan. Fermer la page arrête sa simulation ; fermer le lanceur arrête le serveur.

## Développement et vérification

TypeScript 5.9.3, interface DOM sans framework, serveur statique Node. Les dépendances n’interviennent pas pendant le jeu. Le moteur pur, le contenu, la sauvegarde et l’interface sont séparés. Le fichier `pnpm-lock.yaml` fige le compilateur.

`Verifier.cmd` compile, contrôle le typage, exécute les tests puis régénère les mesures. Si le compilateur manque : `pnpm install --frozen-lockfile` dans le dossier du projet, ou `npm install` si seul npm est disponible (le verrouillage de référence reste celui de pnpm). Aucun changement de politique PowerShell n’est requis.

Commandes équivalentes dans le dossier du projet :

```text
node node_modules/typescript/bin/tsc --noEmit
node node_modules/typescript/bin/tsc
node scripts/build.mjs
node --test --test-isolation=none tests/*.test.mjs
node scripts/balance.mjs
node scripts/server.mjs --open
```

Le moteur de test reste dans le processus courant pour fonctionner dans l’environnement Windows restreint. L’accélération du banc d’essai s’exécute sur des copies isolées ; il n’existe aucun bouton d’accélération ou de déblocage de la partie réelle.

## État du prototype

Onze familles de modules, deux installations, branches entre lignes, banc d’essai, plans de configurations, encapsulation, six expériences, objectif final et poursuite libre. Chaque ligne reste ordonnée et typée ; les aiguillages relient les lignes d’une même installation. Pas de routage libre entre cartes arbitraires, de prestige, de son ou de récursion d’inventions.

Compilation, typage, **68 tests automatisés** et mesures de progression vérifiés. Les tests exécutent aussi les boutons, formulaires et changements de langue dans un DOM simulé avec Happy DOM, dépendance de développement uniquement. Ils couvrent le guide, les pages anglaises, les règles chiffrées bilingues, les branches et leur capacité, les empreintes, les boucles, les sauvegardes, les configurations et le banc d’essai sans mutation de la partie.

Le navigateur intégré a permis de contrôler réellement l’atelier, le réglage de l’injecteur, le panneau avant/après, le dialogue du rôle d’une ligne et les défis en anglais. Les essais actifs et leurs résultats sont également couverts par les tests DOM. La lisibilité sur toutes les tailles d’écran et une partie humaine prolongée restent à évaluer. Aucun outil supplémentaire n’est requis pour jouer à la version compilée.

La cible de découverte de 2–4 heures n’est pas atteinte comme résultat établi : une politique automatisée simple termine en environ 45 minutes, et des assemblages plus puissants peuvent aller plus vite. Aucun playtest humain de plusieurs heures n’est revendiqué. Voir `DESIGN.md`, `BALANCE.md` et `PASSATION.md` pour les hypothèses et la suite.
