# Design — Résonance industrielle, MVP 0.2

## Mise à jour du 25 octobre 2026 : accueil et anglais

Le retour du joueur porte sur la compréhension du rôle et de la boucle, pas encore sur l’équilibrage. Les règles du moteur restent donc inchangées. L’accueil montre une boucle courte « ressources → machines → composants/déblocages → autre idée » et une seule action guidée à la fois. Les cinq étapes s’accomplissent avec des interactions réelles : sélectionner l’injecteur, sélectionner la presse, installer un module librement choisi, consulter le débit après un traitement effectif, enregistrer un plan.

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

Une ligne a un injecteur en tête, des modificateurs de matière, une presse, puis des lecteurs de fin de cycle. Un module a une entrée et une sortie typées. Les lignes fonctionnent en parallèle sur les réserves de leur installation. Les flèches sont des connexions effectives ; les modificateurs d’un même type peuvent être réordonnés avec des boutons. Un branchement arbitraire, la fusion de deux lignes et les circuits de paquets cycliques ne font pas partie de cette version.

Les huit familles : injecteur, résonateur, accumulateur, chambre de charge, presse, récupérateur, échangeur, synchroniseur. La recette de la presse dépend de l’installation. Les valeurs et descriptions de référence sont dans `src/content.ts` ; l’interface affiche les mêmes données.

- Stocks : 10¹² par ressource et installation. Une sortie pleine arrête le procédé avant consommation. Les générateurs cessent d’accumuler au plafond.
- Tampon : 800 matières par machine ; lot maximal 160. L’accumulateur livre exactement son seuil en conservant la qualité moyenne pondérée.
- Qualité : maximum ×10⁶ annoncé dès les règles. L’excédent d’amplification ne s’applique pas.
- Maximum : 6 lignes par installation, 10 machines par ligne. Ces limites sont affichées. Bibliothèque : 30 plans ; configurations : 20.
- Nombres natifs : valeurs bornées par conception. Arrêt de sécurité numérique à 10¹⁵ composants cumulés, annoncé dans les règles. Les métriques ne sont pas des entiers comptables à précision arbitraire ; tolérance numérique sur les décimales.

La réutilisation d’un modificateur reste autorisée. La répétition des récupérateurs n’additionne pas des remboursements : le même reçu porte les indicateurs « récupéré » et « échangé ». Ce sont des règles visibles, pas une limitation secrète appliquée après découverte.

## Ordre des événements

Pas fixe de 100 ms, indépendant de l’affichage. À chaque pas :

1. Créditer les sorties différées du pas précédent.
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
