# Design — Résonance industrielle 0.6

## Mise à jour 0.6 : du prototype au long jeu

Objectif : tenir la promesse « comprendre → combiner → exploser » sur plusieurs heures, sans recette unique ni mur.

**Échelle.** Objectif final 10¹⁵ composants cumulés, cinq paliers nommés tous les trois ordres de grandeur. Limites annoncées relevées : réserves et arrêt de sécurité 10²¹, qualité ×10¹². Les flottants double précision suffisent : les comparaisons restent exactes à l’échelle des lots ; au-delà de 10¹⁸, l’ajout d’un très petit montant à une très grande réserve peut être absorbé par l’arrondi, sans conséquence de jeu.

**Diversité plutôt que répétition.** Le rang d’un résonateur pour un lot divise ses accords (×5, ×3, ×2,33…) : l’exploit « sept résonateurs » de l’audit 0.4 est neutralisé par une règle affichée, pas par un plafond caché. Les coûts par famille croissent de 15 % par exemplaire ; chaque ligne supplémentaire paie une redevance ×8, rendue au démontage, pour que restaurer une configuration reste gratuit.

**Croissance tardive.** Mesure : sans mécanisme supplémentaire, le débit plafonnait après 10⁹ (6 h simulées pour atteindre 6,6×10⁹). Les maîtrises (×2 par niveau sur une famille qui agit réellement, échelle de prix commune ×3,2 par niveau acheté) rendent la croissance régulière ; plus l’invention combine de familles, plus elle accélère. Les valeurs testées et leurs résultats sont dans `BALANCE.md`.

**Nouvelles familles.** Chacune ouvre une combinaison : diviseur → résonateur, filtre → boucle d’affinage (8 retours au plus, la matière n’est jamais perdue), miroir → alternance riche/pauvre (un reflet ne se reflète pas), four → débit élevé, compresseur → contourner un lot par seconde (perte de 25 % de valeur annoncée), harmoniseur → lignes synchronisées, capteur → protéger une réserve. Empreinte ambre : une empreinte par couleur ; deux couleurs doublent le tissage.

**Triangle d’installations.** La Forge (10⁸) consomme des catalyseurs envoyés par la Serre (20/s) et renvoie du plasma à la Fonderie (4/s) : ×10 par lot. Elle concurrence la catalyse pour les mêmes catalyseurs : un vrai choix de répartition.

**Objectifs à moyen terme.** Contrats (10⁵) : un à la fois, sans limite de temps ni pénalité, rotation déterministe ; ils paient des brevets qui changent une règle. Badges : récompensent la variété (sobriété, sans résonance, triangle…). Carnet : vingt combinaisons reconnues par le moteur, jamais listées avant d’être trouvées.

**Refondation.** Unique, facultative, à 10¹². Elle conserve inventions, configurations, découvertes, badges et brevets ; elle ajoute une règle (mémoire ×1,25 par découverte) et avance la Forge à 10⁴. Les maîtrises repartent de zéro.

**Puzzles et mode Ingénieur.** Les puzzles utilisent un état séparé, jamais sauvegardé à la place de la partie ; leurs modules permis sont une règle du moteur (`allowed`). Le puzzle du jour est généré par la date et mesuré depuis des machines vides (60 s de chauffe, 120 s de mesure). Les variantes changent une règle annoncée dès la nouvelle partie.

**Retours.** Couche d’effets en lecture seule (`juice.ts`) : lots qui circulent, cascades de facteurs, célébrations en file, écran de palier, musique générative quantifiée sur une grille de 0,25 s. Préférences d’affichage et records stockés à part (`meta.ts`).

**Plateformes.** Fichier autonome, version installable avec cache hors ligne (`site.mjs`, `sw.js`), page claude.ai avec base partagée facultative (`cloud.ts` : chaque joueur n’écrit que ses propres documents ; galerie, votes, scores, sauvegarde compressée).

Non retenus : routage libre entre cartes arbitraires, récursion profonde d’inventions (remplacée par l’insertion d’une invention dans une ligne), matériaux en tiers multiples (trop de monnaies), simulation dans un Web Worker (inutile à cette charge), rendu incrémental de l’interface (refonte importante, reportée).

## Historique 0.3

## Mise à jour 0.3 : composition, branches et mesure

Les trois priorités choisies avec le joueur sont implémentées ensemble : aiguillages entre lignes, marqueur/tisseur sensibles à l’ordre et banc d’essai comparatif. Les anciennes constructions restent valides ; les sauvegardes v1 acceptent les nouveaux champs optionnels. Aucun reset requis.

Les aiguillages ne copient pas les événements : ils déplacent un paquet entier vers la suite locale ou la première carte après l’injecteur d’une autre ligne. Toute livraison d’aiguillage est différée au pas suivant, y compris la sortie locale. Sa destination réserve sa capacité dès l’émission pour empêcher plusieurs sources de surcharger le même tampon. L’alternance change de côté uniquement après une émission réussie. Un aiguillage vers lui-même est refusé. Les cycles entre lignes sont permis : chaque trajet prend du temps, conserve la matière et peut saturer normalement. Un démontage rembourse les matières en transit destinées à la machine retirée.

Le marqueur attribue une empreinte à une livraison qui n’a encore jamais été marquée. Un accumulateur additionne les fractions d’empreintes proportionnellement à la matière utilisée ; le reste conserve sa part. Le tisseur multiplie la qualité par 1 + empreintes, jusqu’à ×8, puis consomme ces empreintes. L’indicateur de marquage persiste : ni un deuxième tisseur ni un nouveau marqueur ne réactive un lot déjà exploité. Une réunion contenant de la matière marquée est considérée marquée ; aucune empreinte gratuite ne peut être créée en la mélangeant avec une matière non marquée.

L’encapsulation active conserve exactement tous les états et destinations. Une nouvelle instance de bibliothèque paie ses machines mais laisse ses branches externes à reconnecter. Une configuration d’installation conserve ses liens relatifs et les remappe aux nouveaux identifiants lors de sa restauration atomique.

Le banc travaille sur deux copies isolées. Les conditions initiales sont celles de la référence : réserves, niveaux d’alimentation, progression et transferts. Les tampons, charges, accords et événements sont remis à zéro de façon égale. Seule la disposition de l’installation choisie diffère. Après 120 s de stabilisation, le joueur mesure 60, 180 ou 600 s. Le tableau distingue les coûts, les variations de réserves et les débits ; une réserve qui se vide produit un avertissement. Le blocage le plus observé porte sur une machine active et une cause précise. Les injecteurs désactivés volontairement sont exclus. Un essai numérique interrompu n’est jamais présenté comme complet. Aucun gain simulé ne passe dans la partie.

Graphiquement : pictogrammes SVG propres aux familles, couleurs de procédé, schéma des lignes et des branches avec flèches directionnelles, impulsions déclenchées par les dernières livraisons, chiffres de tampon et derniers lots. La progression montre le prochain déblocage réel et une frise de jalons. La pause et la préférence de réduction des mouvements arrêtent les animations. Le rendu est local, sans asset distant ni police externe. `visuals.ts`, `routing-view.ts`, `bench-view.ts` et `atelier.css` séparent ces présentations du moteur.

## Historique 0.2 — 25 octobre 2026 : accueil et anglais

Dans la version 0.2, le retour du joueur portait sur la compréhension du rôle et de la boucle. Les règles du moteur avaient donc été conservées. L’accueil montre une boucle courte « ressources → machines → composants/déblocages → autre idée » et une seule action guidée à la fois. Les cinq étapes s’accomplissent avec des interactions réelles : sélectionner l’injecteur, sélectionner la presse, installer un module librement choisi, consulter le débit après un traitement effectif, enregistrer un plan.

Le guide ne choisit pas de recette optimale, n’achète rien et ne donne aucune ressource. Il peut être masqué, repris ou revu. Les étapes apprises sont mémorisées même si le joueur démonte ensuite son module. Une page permanente explique les objectifs, les trois mesures principales, les blocages et les déblocages ; elle inclut un lexique bilingue.

La langue est un réglage d’affichage français/anglais, mémorisé séparément avec les préférences du guide. L’état de simulation et le format de sauvegarde v1 ne changent pas. Les descriptions et messages canoniques français sont traduits au rendu par `i18n.ts`, y compris les interpolations et attributs accessibles. Les noms personnels sont isolés dans le DOM pour ne pas les traduire. Les éléments de règles contenant des nombres ont un test de parité entre langues. Si une règle ou une description change, maintenir aussi sa traduction.

`onboarding.ts` contient le suivi du guide et la validation des préférences, `guide-view.ts` ses sections, `onboarding.css` leur présentation. Les tests d’interface Happy DOM exercent de vraies commandes DOM mais ne remplacent pas une vérification visuelle dans un navigateur.

## Promesse et choix retenus

« Le joueur doit pouvoir expliquer exactement pourquoi son invention fonctionne, tout en ayant du mal à croire que le jeu l’autorise. »

L’objectif est d’essayer des interactions entre événements et procédés, puis d’en faire des composants personnels. Solo Windows, local, déterministe, français, réorganisation gratuite, sauvegarde et absence de progression hors ligne sont les contraintes du prompt, conservé dans `PROMPT-REFERENCE.md`.

Choix techniques réversibles : TypeScript + DOM + CSS plutôt que React/Vite. Le prototype est assez compact pour éviter un framework et une chaîne de dépendances de production. Node sert les fichiers compilés et exécute directement les sources TypeScript dans les tests. Aucun backend de jeu, compte, télémétrie ou stockage distant.

Hypothèses de design : une livraison transporte quantité et qualité, les gros lots reçoivent une prime explicite, les livraisons rapprochées peuvent s’accorder, le recyclage soulage une alimentation partagée. Ce sont des pistes de plaisir, pas des conclusions prouvées.

## Recherche ciblée du 22 octobre 2026

- [Kongregate — The Math of Idle Games I](https://www.kongregate.com/en/pages/the-math-of-idle-games-part-i) : article de conception et modèles de croissance, pas validation expérimentale du plaisir. Retenu : distinguer augmentation de capacité, coût et vrais multiplicateurs. Évité : construire tout le jeu sur le meilleur ratio d’achat suivi d’un reset.
- [Factorio — FFF 376](https://www.factorio.com/blog/post/fff-376) : retour de ses développeurs, notamment sur les plans réutilisables, la réduction des tâches répétitives et l’intérêt de configurations différentes selon le contexte. Retenu : une bibliothèque qui paie les coûts réels ; aucune reconstruction manuelle obligatoire.
- [Paper Pilot — Guide to Incrementals](https://paperpilot.dev/garden/guide-to-incrementals) : l’auteur décrit lui-même un document incomplet et ses opinions. Utilisé comme cadrage, pas comme source d’un résultat établi.
- [Discussion directe de joueurs](https://www.reddit.com/r/incremental_games/comments/1vuchkx/whats_your_favorite_incremental_mechanics/) : certains apprécient le dévoilement de nouvelles décisions, les conditions explicites et les interactions qui semblent exploiter les règles. Témoignages non représentatifs. Retenu : les premiers modules apparaissent rapidement et les conditions de déblocage sont visibles.

Aucun texte, code ou asset des jeux de référence n’a été repris. Interface, symboles et règles de ce prototype sont réalisés pour ce projet, sans prétention d’originalité mondiale.

## Grammaire et contraintes

Une ligne a un injecteur en tête, des modificateurs de matière, une presse, puis des lecteurs de fin de cycle. Un module a une entrée et une sortie typées. Les lignes fonctionnent en parallèle sur les réserves de leur installation. Les flèches sont des connexions effectives ; les modificateurs d’un même type peuvent être réordonnés avec des boutons. Les aiguillages permettent une fusion contrôlée à l’entrée d’une autre ligne et des cycles différés. Le routage arbitraire entre n’importe quelles cartes reste hors périmètre.

Les onze familles : injecteur, résonateur, accumulateur, chambre de charge, presse, récupérateur, échangeur, synchroniseur, marqueur, tisseur et aiguillage. La recette de la presse dépend de l’installation. Les valeurs et descriptions de référence sont dans `src/content.ts` ; l’interface affiche les mêmes données.

- Stocks : 10¹² par ressource et installation. Une sortie pleine arrête le procédé avant consommation. Les générateurs cessent d’accumuler au plafond.
- Tampon : 800 matières par machine ; lot maximal 160. L’accumulateur livre exactement son seuil en conservant la qualité moyenne pondérée.
- Qualité : maximum ×10⁶ annoncé dès les règles. L’excédent d’amplification ne s’applique pas.
- Maximum : 6 lignes par installation, 10 machines par ligne. Ces limites sont affichées. Bibliothèque : 30 plans ; configurations : 20.
- Nombres natifs : valeurs bornées par conception. Arrêt de sécurité numérique à 10¹⁵ composants cumulés, annoncé dans les règles. Les métriques ne sont pas des entiers comptables à précision arbitraire ; tolérance numérique sur les décimales.

La réutilisation d’un modificateur reste autorisée. La répétition des récupérateurs n’additionne pas des remboursements : le même reçu porte les indicateurs « récupéré » et « échangé ». Ce sont des règles visibles, pas une limitation secrète appliquée après découverte.

## Ordre des événements

Pas fixe de 100 ms, indépendant de l’affichage. À chaque pas :

1. Créditer les sorties différées du pas précédent et livrer les lots en transit à leurs tampons réservés.
2. Alimenter les réserves par les générateurs, dans leur capacité.
3. Transférer les résidus A → B, puis les catalyseurs B → A, selon les limites annoncées.
4. Visiter Fonderie puis Serre, lignes par ordre d’installation, machines de droite à gauche. Une livraison ne peut donc pas traverser plusieurs cartes dans le même pas.
5. Enregistrer les déblocages et une mesure réelle par seconde.

Une presse consomme un lot au moment de sa fin de cycle et entre ensuite en refroidissement. Sa production est créditée au pas suivant ; son reçu de fin de cycle circule ensuite dans la chaîne. Un reçu décrit la matière traitée et l’énergie de pressage ; il ne transporte pas une seconde copie des composants. Le récupérateur peut rendre 80 % de la matière initiale en consommant de l’énergie. L’échangeur rend 80 % de l’énergie de pressage, pas celle des charges ou du récupérateur. Les résidus sont un équivalent de chaleur exploitable, pas une deuxième masse de matière brute.

La charge réserve son énergie au démarrage, puis attend sa durée. Elle conserve le lot si la sortie est bloquée. Démontage pendant charge : énergie réservée et matière rendues. Réorganiser conserve les états ; restaurer une configuration redémarre des machines nouvelles après remboursement. Une restauration non finançable ou sans capacité de remboursement est atomiquement refusée.

La file d’événements est bornée à 120, avec arrêt et diagnostic si dépassée. Il n’existe pas de réactivation récursive dans un pas. Le contrôle numérique interrompt la partie en cas d’anomalie au lieu de la cacher.

## Encapsulation et coopération

Encapsuler sur place change la présentation et enregistre une topologie nommée. Les mêmes machines continuent de fonctionner, avec leurs identifiants, phases, accords, lots, tampons et coûts. Le moteur ignore la présentation capsule ; les tests comparent son futur exact avec celui de la chaîne ouverte.

Une nouvelle instance d’un plan construit des machines neuves et les paie. Elle ne copie pas les ressources, accords ou phases d’une ligne existante. Exporter une partie, en revanche, conserve la totalité de l’état et son futur déterministe. Pas de récursion de plans.

La Serre consomme les résidus de la Fonderie et utilise sa propre énergie. Elle produit des catalyseurs, renvoyés automatiquement. La Fonderie peut en consommer un par lot pour multiplier sa sortie par quatre. Le synchroniseur est un autre consommateur conditionnel de catalyseurs. Les transferts sont bornés, désactivables, sans risque de stocks négatifs.

## Mesure, sauvegarde et disponibilité

La moyenne affichée provient uniquement des sorties réelles des presses sur les dernières 60 secondes disponibles. Les récompenses d’expériences et remboursements ne l’affectent pas. Le graphique couvre au plus 120 secondes et sépare débit par seconde et pic par lot. Une fenêtre inclut les changements de configuration ; aucun gain comparatif automatique n’est affiché.

Sauvegarde v1 validée : stocks, phases, identifiants, reçus, événements, plans, métriques et progression. Une copie précédente valide protège contre une sauvegarde principale corrompue. L’import est confirmé après validation, jamais après écrasement. Le temps mural n’est pas sérialisé : aucun gain au rechargement. L’onglet caché et les suspensions > 1 s ne sont pas rattrapés.

## Limites ludiques et prochaines hypothèses

Le contenu est un MVP compact, pas un jeu d’une durée démontrée de 2–4 heures. La stratégie automatisée de référence finit en environ 45 minutes. La cadence répétée est très puissante et pourrait court-circuiter la découverte. Elle est autorisée tant que ses coûts et plafonds sont respectés ; ne pas la corriger comme un bug pour la seule raison qu’elle est forte.

Les améliorations d’extraction ne suppriment pas la capacité des injecteurs ou des presses. Une amélioration de réserve n’accélère pas une carte : il faut identifier le goulot et ajuster la composition ou le nombre de lignes. Éviter d’ajouter des niveaux sans nouveau problème intéressant.

Priorité après essai humain : vérifier que le joueur comprend la livraison et l’accord, que la montée de puissance est satisfaisante, et qu’il trouve une raison personnelle de réorganiser. Ensuite seulement enrichir la coopération, les conditions d’expériences et les choix de cadence/lot. Aucun reset prévu pour allonger artificiellement la durée.
