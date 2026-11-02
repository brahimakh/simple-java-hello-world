# Résonance industrielle

Un jeu incrémental solo, en français ou en anglais : construire des chaînes de machines, comprendre leurs interactions, inventer des combinaisons et voir la production exploser — du premier composant jusqu’à 10¹⁵. Tout reste sur votre appareil, sans compte obligatoire.

Pour comprendre le rôle du joueur : lire [le guide des bases](GUIDE-JOUEUR.md). Toutes les idées d’évolution et leur statut : [IDEES.md](IDEES.md).

## Cinq façons de jouer

1. **Fichier unique** : double-cliquer sur `Resonance-Industrielle.html`. Aucun outil à installer.
2. **Page claude.ai** : la même partie, ouverte depuis un ordinateur ou un téléphone. Elle ajoute la galerie partagée, le classement du puzzle du jour et la sauvegarde en ligne.
3. **Application installable** : la version publiée sur GitHub Pages s’installe sur l’écran d’accueil et fonctionne hors ligne. Une seule action est nécessaire dans le dépôt GitHub : *Settings → Pages → Source : GitHub Actions* ; la publication suit chaque mise à jour de la branche principale.
4. **Application Android** : un APK (cible Android 17, fonctionne dès Android 8) est publié dans les *Releases* GitHub à chaque nouvelle version. Les mises à jour s’installent par-dessus et gardent la partie. L’export ouvre l’écran « Enregistrer sous » d’Android ; le bouton retour ferme le tiroir ou le dialogue ouvert.
5. **Lanceur Windows** : `Demarrer.cmd` (Node.js 24) sert le jeu sur http://127.0.0.1:4317.

Chaque version garde ses propres sauvegardes. Pour passer de l’une à l’autre : **Exporter** puis **Importer** (menu ☰ sur téléphone).

## Nouveautés 0.8 à 1.2 : liberté, réseau, tempo, logique, monde

**Une progression en deux temps.** D’abord les bases, guidées. Ensuite le joueur choisit sa **spécialité** (Cadence, Masse ou Empreinte, ×2 sur une famille) et le guide laisse place à **trois pistes ouvertes** : des questions qui mènent à des découvertes, à suivre dans l’ordre que l’on veut, sans jamais donner la recette. Les espaces de l’interface s’ouvrent un par un, une minute d’écart. Les **nouveautés** (modules, installations) arrivent une à la fois, avec un écart de 2 minutes qui grandit jusqu’à environ 4 min 30 ; la prochaine est annoncée avec son compte à rebours.

**Récompenser l’invention.**
- **Eurêka** : une modification qui multiplie le débit par 5 ou plus est détectée, célébrée à la mesure de l’exploit et récompensée.
- **Synergie** : chaque interaction distincte réellement active sur une ligne la multiplie par 1,2.
- **Découvertes** : chacune paie tout de suite et ajoute ×1,05 durable.
- **Cote d’invention** : à l’encapsulation, l’invention est mesurée seule contre une ligne nue ; prime et classement.
- **Prototypes** : à 10⁴, 10⁶, 10⁹ et 10¹², une machine-règle unique à choisir parmi trois.

**Nouvelles mécaniques.**
- *Réseau* : assembleur (deux lignes fondent leurs lots, qualités multipliées), moules de presse (ressort, engrenage, cristal), troisième couleur magenta et lots prismatiques (×5).
- *Tempo* : métronome (un lot par temps, bonus plus fort quand le tempo est lent ; les lignes battent ensemble), écho (le lot suivant hérite des empreintes du précédent), sons par famille et musique calée sur le tempo.
- *Logique* : relais (aiguillage selon la qualité, les empreintes, les couleurs ou l’énergie), emplacements d’amélioration (turbo, tampon, marque, stabilisateur), plans réglables au moment de construire.
- *Monde* : six chantiers à bâtir, chacun changeant une règle ; Serre vivante (souches, croisements à règle affichée, saisons de 10 minutes) ; doctrines de refondation (Vitesse, Masse, Lumière, Écologie) ; vue Monde, une ville qui grandit avec l’usine.

**Confort.** Annuler la dernière modification, dupliquer et renommer une ligne, rapport d’une ligne en image (y compris sur Android), laboratoire libre (bac à sable), fenêtre d’accord réglable du résonateur.

**Rythme mesuré.** Cinq joueurs automatiques (styles complet, cadence, masse, empreinte, boucles) atteignent 10¹⁵ entre 1 h 09 et 2 h 20, avec au plus un facteur 2 entre styles ; une partie humaine devrait durer de 2 à 5 heures. Détails dans `BALANCE.md`.

## Nouveautés 0.7 : une première partie où l’on agit

- **Rien ne tourne avant votre premier geste.** Vous lancez les premiers lots à la main, puis vous achetez l’automatisation de l’injecteur avec ce que vous venez de produire.
- **Un objectif à la fois** (9 au total), chacun validé par une action réelle : ajouter un résonateur et le regarder monter à ×5, régler l’injecteur, former des lots de 80, placer les machines dans le bon ordre. L’élément à toucher est mis en évidence.
- **L’interface se dévoile en jouant** : une ressource au départ, deux onglets, puis le reste quand il sert.
- **Effets plus rapides et plus lisibles** : la presse ne garde qu’un lot d’avance ; un blocage dit quelle machine est occupée.
- Les parties existantes ne sont pas concernées : elles gardent toute l’interface.
- Audit et test de première partie sur téléphone Android : `AUDIT-UX-2026-11-02.md`, `node scripts/ux-first-run.mjs`.

## Nouveautés 0.6 : un vrai long jeu

**Progression jusqu’à 10¹⁵.** Cinq paliers nommés (Atelier 10³, Manufacture 10⁶, Complexe 10⁹, Métropole industrielle 10¹², Le cœur de Résonance 10¹⁵), chacun célébré par un écran avec la courbe de votre partie. Un joueur automatique compétent atteint 10¹⁵ en 1 h 08 ; une première partie humaine devrait durer de 2 à 4 heures.

**Sept nouvelles familles de modules**, débloquées en chemin :

| Module | Déblocage | Idée |
|---|---:|---|
| Diviseur | 3 000 | Un gros lot redevient deux petits, qui peuvent nourrir un résonateur |
| Filtre | 10 000 | Les lots trop faibles refont un tour de la ligne (8 fois au plus) |
| Miroir | 30 000 | Un lot faible reçoit la qualité du lot riche précédent |
| Four | 100 000 | La chaleur suit le débit : récompense les lignes très alimentées |
| Compresseur | 300 000 | N lots fondus en un seul, plus dense : contourne la limite d’un lot par seconde |
| Harmoniseur | 10⁶ | ×3 quand deux lignes livrent au même instant |
| Capteur | 10⁶ | Ne laisse passer un lot que si une réserve atteint un seuil |

S’y ajoutent l’**empreinte ambre** (un lot bicolore double le tissage), la **récupération dans la Serre**, et une **troisième installation**, la Forge à plasma (10⁸), qui transforme les catalyseurs en plasma : ×10 sur une presse de Fonderie.

**Des règles qui évitent la recette unique.** Le n-ième résonateur traversé par un lot divise ses accords par n : empiler les résonateurs ne suffit plus. Chaque exemplaire d’une famille coûte 15 % de plus, et chaque ligne supplémentaire paie une redevance croissante, rendue au démontage.

**Maîtrises (10⁶).** Chaque niveau double l’effet d’une famille, là où elle agit réellement. Tous les niveaux partagent la même échelle de prix : combiner plus de familles fait grandir plus vite.

**Contrats et brevets (10⁵).** Des commandes facultatives, sans limite de temps (presser des lots de haute qualité, tisser des lots bicolores, tripler le débit…), paient des brevets. Ceux-ci changent une règle : +2 lignes, lignes plus longues, lots de 320, catalyse ×6, pipelines ×4…

**Carnet de laboratoire.** Vingt découvertes reconnues quand elles se produisent réellement (jamais listées à l’avance), douze badges, quatre thèmes visuels déblocables, la courbe logarithmique de la partie et votre record en pointillé.

**Refondation (10¹²).** Une seule transition facultative : tout repart de zéro, mais vous gardez inventions, découvertes, badges et brevets. Nouvelle règle : chaque découverte multiplie les presses de Fonderie par 1,25.

**Puzzles.** Cinq puzzles d’apprentissage (un module, un budget, un objectif) et un puzzle du jour, identique pour tous à une date donnée et mesuré de façon déterministe. Votre partie est mise de côté pendant le puzzle.

**Mode Ingénieur.** Après un premier million, de nouvelles parties peuvent changer les règles : presses lentes, petits lots, ou sans résonance.

**Partage.** Chaque invention s’exporte en un code `RI1-…` et peut être insérée dans une autre ligne. L’estimation « ≈ » simule 90 s avec et sans un module avant de l’acheter.

**Sensations.** Les lots circulent visiblement entre les machines (taille = quantité, couleur = qualité). Chaque pressage affiche sa cascade de multiplicateurs. La musique est générative (chaque ligne joue sa note au rythme de ses presses). Le téléphone vibre aux grands moments, et un mode vitrine plein écran fait de l’usine un spectacle.

**Confort.** Appui long puis glisser pour réordonner des machines, tiroir de réglages à glisser vers le bas pour le fermer, taille du texte, contraste renforcé.

Les sauvegardes des versions précédentes sont migrées automatiquement : Forge, plasma et transferts sont ajoutés sans rien changer d’autre.

## Jouer sur mobile

La mise en page s’adapte aux téléphones : onglets en bas d’écran, compteurs en haut, schéma et machines qui défilent au doigt, réglages d’une machine dans un tiroir, menu ☰ pour la langue, le son, les sauvegardes et la nouvelle partie. Le plus simple est d’ouvrir la page du jeu sur claude.ai depuis le téléphone ; `node scripts/artifact.mjs` régénère cette version.

## Nouveautés 0.5 : une usine qui se sent vivre

- **Chiffres qui comptent** : les réserves, la production cumulée et le débit défilent en douceur au lieu de sauter toutes les 0,8 s. Les barres de cycle des machines avancent en continu.
- **Chaque pressage se voit** : un « +N ⬡ » s’élève de la presse, d’autant plus grand que le lot est gros. Les lots de 80+ (prime ×8) et les lots catalysés sont dorés et étincellent ; un lot qui bat nettement le record l’annonce.
- **Déblocages célébrés** : une carte présente chaque nouvelle possibilité, avec un bouton qui amène directement au module dans le catalogue.
- **Ordres de grandeur** : chaque fois que le débit moyen gagne un chiffre (10, 100, 1 000 composants/s…), le jeu le salue et vous demande ce qui l’a rendu possible.
- **Son facultatif** : bouton « ♪ Son » en haut. Sons synthétisés, accordés sur une gamme pentatonique, désactivés par défaut et limités en fréquence.
- **Clics fiables** : l’interface n’est plus reconstruite pendant un clic ; auparavant, un clic tombant pendant un rafraîchissement pouvait être perdu.
- Catalogue trié par ordre de déblocage, en-tête plus compact, champ d’import qui n’apparaît plus en bas de page.

Les effets ne lisent que l’état de la simulation : ils ne changent ni les règles, ni l’équilibrage, ni les sauvegardes. La préférence « réduire les animations » du système les désactive.

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
node scripts/standalone.mjs
node --test --test-isolation=none tests/*.test.mjs
node scripts/balance.mjs
node scripts/campaign.mjs 5        # parties complètes par cinq joueurs automatiques (styles)
node scripts/ux-first-run.mjs      # première partie au doigt sur écran Android, avec rapport
node scripts/i18n-audit.mjs        # textes sans traduction anglaise
node scripts/e2e.mjs               # parcours navigateur (si Playwright est présent)
node scripts/site.mjs              # version installable dans site/
pnpm run android                   # APK Android (SDK Android 37 et Java 21 requis)
node scripts/server.mjs --open
```

Le moteur de test reste dans le processus courant pour fonctionner dans l’environnement Windows restreint. L’accélération du banc d’essai s’exécute sur des copies isolées ; il n’existe aucun bouton d’accélération ou de déblocage de la partie réelle.

## État du prototype

Onze familles de modules, deux installations, branches entre lignes, banc d’essai, plans de configurations, encapsulation, six expériences, objectif final et poursuite libre. Chaque ligne reste ordonnée et typée ; les aiguillages relient les lignes d’une même installation. Pas de routage libre entre cartes arbitraires, de prestige, de son ou de récursion d’inventions.

Compilation, typage, **114 tests automatisés**, audit des traductions, parcours navigateur et mesures de progression vérifiés. Les tests exécutent aussi les boutons, formulaires et changements de langue dans un DOM simulé avec Happy DOM, dépendance de développement uniquement. Ils couvrent le guide, les pages anglaises, les règles chiffrées bilingues, les branches et leur capacité, les empreintes, les boucles, les sauvegardes, les configurations et le banc d’essai sans mutation de la partie.

Le navigateur intégré a permis de contrôler réellement l’atelier, le réglage de l’injecteur, le panneau avant/après, le dialogue du rôle d’une ligne et les défis en anglais. Les essais actifs et leurs résultats sont également couverts par les tests DOM. La lisibilité sur toutes les tailles d’écran et une partie humaine prolongée restent à évaluer. Aucun outil supplémentaire n’est requis pour jouer à la version compilée.

La cible de découverte de 2–4 heures n’est pas atteinte comme résultat établi : une politique automatisée simple termine en environ 45 minutes, et des assemblages plus puissants peuvent aller plus vite. Aucun playtest humain de plusieurs heures n’est revendiqué. Voir `DESIGN.md`, `BALANCE.md` et `PASSATION.md` pour les hypothèses et la suite.
