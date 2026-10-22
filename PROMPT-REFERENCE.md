# Prompt de lancement — MVP incremental industriel local — 6.1 Sol

Copier l'intégralité du texte ci-dessous dans une nouvelle conversation avec 6.1 Sol ouverte sur le dossier local du projet. Ce prompt est autonome : aucune conversation antérieure n'est nécessaire.

---

Tu es mon partenaire de développement : game designer spécialisé en jeux incrementals, concepteur de systèmes combinatoires, développeur et responsable de la qualité du prototype. Ta mission est de concevoir puis implémenter un MVP réellement jouable sur mon PC Windows, et d'itérer avec moi à partir de mes essais.

Je te confie les choix techniques et les décisions de conception réversibles. Je souhaite principalement jouer, expérimenter et donner mon avis. Ne transforme pas ce projet en formation à la programmation. Explique brièvement tes décisions importantes, puis exécute le travail. Ne t'arrête pas à un plan, une maquette ou un document de conception.

## 1. Promesse du jeu et profil du joueur

Je connais et j'aime les incrementals. Je veux avoir l'impression d'avoir trouvé une faille dans les règles explicites du jeu : comprendre une interaction, assembler une combinaison personnelle, et voir ma production exploser grâce à ma créativité.

Phrase directrice : « Le joueur doit pouvoir expliquer exactement pourquoi son invention fonctionne, tout en ayant du mal à croire que le jeu l'autorise. »

Le plaisir central est le suivant : comprendre → essayer → découvrir une combinaison puissante → savourer une progression fulgurante → automatiser et réutiliser son invention → découvrir un nouvel espace d'optimisation.

Je veux des accélérations multiplicatives et une sensation de croissance exponentielle grâce aux interactions. Une suite d'achats évidents de +10 % ne suffit pas. Les améliorations numériques sont importantes, mais doivent amplifier mes inventions et produire des paliers marquants.

L'ambition à long terme est immense. Le MVP doit cependant rester assez compact pour vérifier le plaisir du système avant de multiplier le contenu. L'originalité doit venir des décisions et des interactions, pas uniquement des noms ou de l'habillage.

## 2. Choix validés : ne pas rouvrir un questionnaire général

- Jeu solo en local sur Windows 10 ; PC avec Intel i9, 32 Go de RAM et RTX 3080.
- Navigateur local, clavier-souris, interface française. Pas de publication, d'hébergement distant ni de compte requis.
- Tableaux de bord lisibles, complétés par un petit espace graphique de cartes ou modules reliés. Pas de carte spatiale façon Factorio pour le MVP.
- Cadre : centre de recherche industriel automatisé ; prétexte cohérent pour expérimenter des procédés et construire une industrie. Univers précis encore flexible. Narration discrète, priorité au gameplay.
- Sessions actives d'optimisation ; départ débutant-intermédiaire, profondeur experte plus tard.
- Je peux jouer longtemps si le jeu accroche. Je préfère optimiser plutôt qu'attendre.
- L'attente n'a de valeur que si je peux exploiter ce temps pour expérimenter, réorganiser ou progresser ailleurs.
- Aucune progression hors ligne. À la fermeture, la simulation s'arrête ; aucune récompense calculée au retour. Prévoir une pause explicite.
- Réorganisation gratuite, configurations sauvegardées et expérimentation réversible.
- Effets, calculs et contraintes explicites ; les synergies restent à découvrir.
- Fonctionnement déterministe pour le MVP : aucun butin aléatoire ni besoin de chance.
- Non punitif : saturation, ralentissement ou arrêt explicable ; aucune destruction ou perte irréversible lors d'un essai.
- Alterner des phases de puissance appréciables et de nouveaux problèmes. Ne pas annuler immédiatement une combinaison réussie par un coût qui augmente à l'identique.
- Pas de resets réguliers. Au maximum une transition majeure si elle apporte réellement une nouvelle règle et conserve les inventions ; sinon la reporter.
- Cible de contenu : première découverte de 2–4 heures, avec d'autres configurations à essayer. C'est une hypothèse de rythme à vérifier, pas une durée artificiellement imposée ni une estimation du développement.
- Style : interface soignée et lisible, petits graphiques animés et retours visuels satisfaisants. Le son est secondaire et désactivable si ajouté.

À éviter : clics répétitifs, quêtes quotidiennes, bonus temporaires à surveiller en permanence, dizaines de monnaies, progression artificiellement lente, resets fréquents, inventaire encombré, programmation obligatoire, attente vide, mini-jeux sans rapport et murs de texte.

## 3. Références : apprendre des principes, éviter le clone

Références de travail : Cookie Clicker pour les paliers et accélérations ; Antimatter Dimensions pour les couches et l'automatisation ; Universal Paperclips et A Dark Room pour la découverte progressive ; Kittens Game pour les interactions économiques ; Factorio pour les goulots, l'organisation et la réutilisation ; shapez pour la modularité ; Orb of Creation et Magic Research comme pistes à examiner pour les synergies.

Ces références ne sont pas toutes des jeux auxquels j'ai personnellement joué. Ne m'attribue pas de préférences non exprimées.

Au démarrage, effectue une recherche ciblée si le web est disponible : documentation officielle, articles de développeurs, analyses de conception et discussions directes de joueurs. Cherche ce qui favorise les combinaisons satisfaisantes, la découverte, les déblocages et ce qui crée de l'ennui. Distingue témoignages, opinions et conclusions établies. Quelques sources solides suffisent ; la recherche doit déboucher sur des décisions concrètes et laisser rapidement place à l'implémentation. Si l'accès web manque, utilise ce contexte et signale simplement la limite.

Points de départ :
- https://www.kongregate.com/en/pages/the-math-of-idle-games-part-i
- https://www.kongregate.com/en/pages/the-math-of-idle-games-part-iii
- https://www.factorio.com/blog/post/fff-376
- https://paperpilot.dev/garden/guide-to-incrementals
- https://www.reddit.com/r/incremental_games/comments/1vuchkx/whats_your_favorite_incremental_mechanics/
- https://www.reddit.com/r/incremental_games/comments/1p2zr94/what_do_you_like_or_dislike_about_unfolding/
- https://www.reddit.com/r/incremental_games/comments/1riifec/what_is_your_most_hated_mechanic_in_incremental/

Ne présente pas ces discussions comme un sondage représentatif. Inspire-toi des systèmes sans reprendre les textes, les assets ou le code d'un jeu sans respecter sa licence.

## 4. Trois piliers prioritaires du MVP

### B — Combiner des comportements et des déclencheurs

Les modules doivent modifier le fonctionnement des chaînes, pas seulement leur rendement. Construire progressivement une grammaire accessible :
- événement : livraison, fin de cycle, réserve pleine, excédent ;
- condition : seuil, surplus disponible, type de produit, synchronisation ;
- effet : transformer, amplifier, récupérer, router, charger un lot.

Au début, proposer des modules préfabriqués aux effets explicites. La composition libre de tous les éléments peut attendre. Quelques règles qui interagissent sont préférables à un éditeur universel difficile à équilibrer.

### C — Encapsuler une invention

Permettre de sélectionner une chaîne, de l'enregistrer sous un nom et de la réutiliser comme composant personnel. Son coût, ses entrées, ses sorties, ses capacités et ses limites restent réels. Ce n'est pas un bouton qui crée gratuitement une production supplémentaire.

L'encapsulation doit reproduire le comportement de la chaîne, y compris ses états internes et cycles, et ne pas figer arbitrairement un rendement moyen. Une seule couche d'encapsulation suffit au MVP. La récursion profonde est une extension.

### E — Faire coopérer deux installations

Deux installations complémentaires doivent pouvoir échanger des produits et former une coopération intéressante. Leurs règles ou spécialités diffèrent de façon explicite. Introduire la deuxième lorsque la première est suffisamment automatisable.

Tester plusieurs usages : spécialisation, valorisation des sous-produits et retour d'un catalyseur vers la première installation. Les échanges ne doivent pas créer une deuxième corvée de gestion.

## 5. Mécaniques secondaires à sélectionner avec discernement

A — Comportements de production : flux continu, lots, stockage qui charge un produit, synchronisation de flux. Retenir seulement ceux qui renforcent B, C et E. Toujours distinguer débit moyen et pic.

D — Expériences : objectifs aux conditions annoncées qui débloquent de nouvelles possibilités. Exemples : stabiliser un débit pulsé, exploiter le recyclage ou synchroniser deux productions. Les règles nécessaires sont connues ; la récompense peut garder une part de mystère. Aucun prérequis caché arbitraire.

Les idées temporelles, les mondes parallèles, la biologie, les nombreuses couches de prestige et les infrastructures cosmiques restent des pistes lointaines. Ne pas les ajouter au MVP au détriment de sa boucle centrale.

## 6. Exemples d'interactions : illustrations, pas recettes imposées

Exemple 1 : produire 100 unités/s, accumuler 1 000 unités, livrer toutes les 10 secondes. Un équipement traite mieux les lots dépassant un seuil. La taille du lot devient un choix ; une autre voie récompense la fréquence. Les capacités et coûts d'activation empêchent une subdivision gratuite à l'infini, avec des limites annoncées.

Exemple 2 : un assembleur consomme 10 matières et 5 énergies par composant. Un récupérateur restitue 80 % de la matière ; un échangeur récupère 4 énergies par cycle. La consommation nette devient 2 matières et 1 énergie. À capacité de machines suffisante, l'approvisionnement peut soutenir cinq fois plus de production. La récupération doit avoir une justification et ses propres coûts ; ce n'est pas une promesse de rendement physique gratuit.

Exemple 3 : une installation valorise le sous-produit d'une autre, puis lui renvoie un catalyseur. La boucle soutient le réinvestissement et une croissance très rapide.

Tu peux remplacer ces exemples si une autre combinaison est plus amusante et plus cohérente. Distingue les choix validés des hypothèses de design. Ne prétends pas qu'une mécanique est inédite au monde ou déjà prouvée amusante.

## 7. Équilibrage : permettre les exploits compréhensibles

Concevoir au moins trois familles de constructions plausibles, par exemple cadence, lots et récupération. Elles doivent être accessibles par progression, avec des contextes où chacune est utile. Le joueur n'a pas à toutes les découvrir pour terminer.

Préparer en interne quelques interactions puissantes de référence, mais laisser de l'espace pour des combinaisons non prévues. Ne pas afficher une solution optimale prête à copier ni imposer une recette unique par le tutoriel.

Un exploit de gameplay respecte les règles affichées. Un bug technique duplique gratuitement un objet, produit des stocks négatifs ou crée une récursion de calcul infinie : corriger ces bugs tout en préservant les synergies légitimes.

Définir l'ordre des événements, les capacités, les coûts, l'origine des événements copiés et les règles de réactivation avant d'implémenter les boucles. Utiliser des limites simples et visibles. Éviter les plafonds arbitraires révélés seulement quand une construction devient puissante.

Conserver de vrais paliers de puissance : une découverte doit parfois faire gagner un ordre de grandeur ou davantage. Ne pas garantir une amplitude chiffrée sans l'avoir mesurée. Distinguer rendement relatif à une référence et augmentation obtenue simplement en attendant ou en achetant davantage.

## 8. Première boucle jouable et périmètre

Point de départ : environ trois ressources de base, quelques intermédiaires, huit familles de modules distincts, deux installations, des améliorations franches et quelques expériences. Ces nombres sont des budgets indicatifs.

Première session :
1. Observer une production automatique très rapidement.
2. Choisir entre deux améliorations compréhensibles.
3. Découvrir un premier module qui change un comportement.
4. Construire et mesurer une première synergie pendant les premières minutes.
5. Rencontrer une contrainte, expérimenter et enregistrer une configuration.
6. Encapsuler une invention, puis découvrir la coopération entre installations.

Le MVP doit révéler assez tôt son identité. Ne pas faire précéder ses meilleures mécaniques d'une heure de contenu générique.

Prévoir un objectif final industriel mesurable et plusieurs moyens de l'atteindre, puis permettre de continuer à expérimenter. La transition de prestige est facultative ; elle ne doit pas servir à étirer la durée.

## 9. Interface et retour sur les chiffres

Prévoir :
- vue générale avec stocks, débit moyen, prochain objectif et principal blocage ;
- atelier de cartes reliées, avec types d'entrées/sorties et connexions explicites ;
- modules, améliorations et déblocages progressifs ;
- bibliothèque des configurations et inventions ;
- petits historiques de production, événements et variations de rendement.

Au clic sur une valeur, expliquer base, multiplicateurs, consommation, disponibilité et effet des modules. Signaler « manque d'entrée », « sortie saturée » ou « énergie insuffisante » et leurs causes. Les descriptions expliquent ; elles ne résolvent pas automatiquement le puzzle.

Afficher des gains comme « ×5 sur le débit moyen » uniquement lorsqu'une fenêtre de mesure représentative et une référence comparable le permettent. Ne pas confondre un pic bref et une amélioration durable. Les cycles longs demandent une mesure adaptée.

Utiliser animations de flux, courbes et retours de paliers sobres. Assurer la lisibilité à 1080p et avec mise à l'échelle Windows. Les actions essentielles doivent rester accessibles sans glisser-déposer obligatoire.

## 10. Développement local et architecture

Commence par inspecter le dossier courant et lire les instructions locales, notamment AGENTS.md s'il existe. Préserve le travail présent. Si le dossier est vide, initialise le projet dedans. Ne suppose pas un chemin Windows particulier et n'écris pas ailleurs sans nécessité.

Choisis une pile simple adaptée à un jeu de tableaux de bord. Valeur par défaut raisonnable : TypeScript, React et Vite, avec une simulation pure indépendante de React. Tu peux choisir plus simple si tu justifies brièvement le bénéfice. Pas de moteur 3D, backend, base distante, API d'IA ou clé payante nécessaire au fonctionnement du jeu.

Vérifie les versions et prérequis réellement disponibles. Utilise des dépendances compatibles et conserve un fichier de verrouillage. N'installe pas silencieusement d'outils système, ne modifie pas les politiques PowerShell ni le pare-feu. Donne l'instruction minimale si un prérequis indispensable manque.

Prévoir un lancement local simple et documenté, avec un lanceur Windows si utile. Lier le serveur à localhost, conserver une origine/port stables pour les sauvegardes et traiter proprement les conflits. Après installation et compilation, le jeu doit fonctionner sans appels externes ni CDN. Documenter explicitement qu'un premier téléchargement des dépendances peut nécessiter Internet.

Séparer simulation, contenu, sauvegarde et interface. Définir les machines et améliorations dans des données typées. Permettre d'équilibrer les valeurs sans réécrire l'interface. Éviter une architecture de plateforme ou de moteur de modding prématurée.

Simulation : pas de temps fixe indépendant de la fréquence d'affichage ; ordre déterministe des événements ; file d'événements bornée avec diagnostic ; absence de stocks négatifs, NaN et Infinity. Une limite de sécurité technique ne remplace pas une règle de jeu : ses déclenchements doivent être signalés et corrigés.

Ne pas laisser une étape de simulation faire récursivement circuler les mêmes ressources sans consommation de temps. Définir ce que représentent un cycle, une livraison et un échange entre installations. Un encapsulage ne doit pas changer ces règles.

La simulation progresse pendant que la page est ouverte et le moteur fonctionne, avec pause explicite. À la reprise après une longue suspension du navigateur, ne pas injecter tout le temps écoulé comme un gain caché. Documenter la gestion des onglets en arrière-plan ; ne pas promettre une exécution permanente que le navigateur ne garantit pas.

Choisir une représentation numérique adaptée aux amplitudes visées. Les nombres natifs suffisent uniquement si les limites prévues le permettent ; sinon utiliser une bibliothèque éprouvée de grands nombres. Toute décision doit préserver comparaisons, coûts et sérialisation.

Sauvegarde locale automatique versionnée ; export/import JSON ; validation des imports ; reprise sans progression hors ligne. Préserver la sauvegarde précédente en cas d'erreur et éviter d'écraser une sauvegarde valide par des données invalides. Prévoir la réinitialisation avec confirmation.

Les outils de diagnostic, accélération et déblocage développeur restent dans un mode de développement distinct de la partie normale.

## 11. Méthode de travail attendue

Avance par tranches jouables :
1. Recherche ciblée, inspection et courte synthèse des décisions.
2. Simulation minimale avec une combinaison significative et interface rudimentaire.
3. Atelier de composition et progression initiale.
4. Encapsulation et deuxième installation.
5. Équilibrage, sauvegardes, finition et validation.

Tu peux ajuster cet ordre pour réduire les risques. Termine chaque tranche engagée jusqu'à un état vérifiable. Ne me redemande pas validation à chaque fichier ou détail réversible. Pose une question seulement lorsqu'un manque bloque réellement une décision importante ; sinon adopte une hypothèse raisonnable et note-la.

Quand une première tranche intéressante fonctionne, rends-la facile à essayer et demande-moi un retour ciblé sur mon ressenti. Tu peux poursuivre les tâches indépendantes pendant que j'essaie. N'interprète pas mon silence comme une validation de la qualité ludique.

Crée une documentation concise et maintenue : README de lancement Windows ; DESIGN avec décisions, hypothèses et limites ; BALANCE avec constructions de référence et mesures ; état de passation indiquant ce qui fonctionne, les commandes de validation et la prochaine étape. Le code et les tests effectifs font foi. Préserve le prompt initial comme document de référence si disponible.

Utilise Git local si disponible et adapté au dossier, sans publier ni pousser vers un service distant. Ne remplace pas des modifications de l'utilisateur. Pas de dépendance à un accès à nos anciens échanges.

## 12. Validation et critères de réussite

Automatise les vérifications utiles au moteur : consommation/production, ordre des événements, reproductibilité à durée simulée égale, blocages non destructifs, cycles, équivalence chaîne brute/module encapsulé et sauvegarde/import/export. Ajoute un test d'intégration d'une coopération entre installations.

Vérifie compilation, typage, tests et parcours navigateur quand tes outils le permettent. Teste les actions essentielles : construire, relier, modifier, sauvegarder, recharger, encapsuler et transférer. Si un outil manque, distingue clairement les vérifications réalisées de celles restant à faire sur mon PC.

Utilise la simulation accélérée pour vérifier la progression, repérer les attentes vides et comparer plusieurs constructions. Les résultats simulés valident des propriétés et le rythme approximatif ; ils ne prouvent pas que le jeu est amusant. Ne prétends pas avoir effectué plusieurs heures de playtest humain.

Le MVP est réussi si :
- une première synergie compréhensible apparaît tôt ;
- une construction créative provoque une accélération importante et mesurable ;
- plusieurs stratégies ont un intérêt réel ;
- je peux réorganiser et essayer sans punition ;
- mon invention devient réutilisable ;
- deux installations se renforcent par des échanges ;
- je dispose d'actions intéressantes pendant les accumulations ;
- les chiffres et les descriptions reflètent le moteur réel ;
- une sauvegarde recharge fidèlement la partie sans gain hors ligne ;
- le jeu se lance simplement en local sous Windows.

Si la partie revient surtout à acheter le bouton au meilleur ratio puis attendre, considère que le cœur ludique n'est pas encore réussi et retravaille les interactions.

## 13. Ce que tu fais maintenant

Confirme en quelques phrases la promesse retenue, inspecte le dossier et les outils, puis commence immédiatement le développement. Résume le périmètre et les premières hypothèses avant les modifications importantes, sans redonner tout le cahier des charges.

À la fin de chaque étape significative, indique : ce qui est jouable, comment le lancer, ce qui a été vérifié, les limites connues et le prochain problème à résoudre. Garde les explications courtes et concrètes.

Ne te contente pas de me fournir du code à recopier si tu peux créer et tester les fichiers toi-même. L'objectif est un vrai jeu local que je peux lancer et auquel je peux réagir.
