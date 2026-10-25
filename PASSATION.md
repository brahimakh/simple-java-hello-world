# État de passation — 25 octobre 2026

Projet : **E:\ChatGPTWork\Resonance-Industrielle**. Prompt original conservé, aucun autre projet modifié. Développement local uniquement, aucun hébergement, compte ou publication.

## Dernière demande traitée : composition et présentation — version 0.3

Aiguillages entre lignes avec quatre règles, marqueur et tisseur sensibles à l’ordre, banc d’essai comparatif isolé. Le schéma SVG montre les connexions et les livraisons réelles, les cartes ont des pictogrammes et couleurs de famille, la progression affiche le prochain déblocage et ses jalons. Français et anglais conservés. Actualiser le navigateur pour charger les fichiers compilés, sans nouvelle partie.

Mesures régénérées : mêmes cinq machines et mêmes entrées, 19,2 → 76,8 composants/s en changeant l’ordre ; le rapport ×4 est à coût identique de 195. L’alternance entre deux presses passe de 0,6 à 1,2/s avec la même alimentation, mais un coût de 45 → 145, donc sans équivalence de budget. Ces chiffres caractérisent les essais, pas une promesse de plaisir ou de durée.

Le banc mesure 60, 180 ou 600 s après 120 s de stabilisation, depuis les réserves de référence et des machines froides. Il ne modifie pas la partie. Les références sont conservées séparément ; les configurations d’installation conservent leurs branches, les nouvelles inventions personnelles demandent de reconnecter leurs sorties externes. Les sauvegardes v1 anciennes restent acceptées avec des champs optionnels.

## Historique 0.2 : compréhension et anglais

Version 0.2 compilée : cinq premiers gestes guidés, rubrique permanente Premiers pas, explication du rôle et des mesures, lexique bilingue et choix français/anglais dans la barre supérieure. Les étapes du guide suivent des actions réelles et restent facultatives. Le choix de langue et les acquis du guide sont conservés dans une clé de préférences distincte de la partie ; les sauvegardes v1 et les noms personnels sont préservés. Aucun changement d’équilibrage ou de règle de simulation.

Actualiser l’onglet de jeu pour charger la mise à jour ; aucune nouvelle partie requise. Premier retour attendu : le joueur sait-il maintenant quelle action entreprendre et pourquoi ? Les remarques de gameplay viendront après ses premiers essais réels.

## Fonctionnel

- Jeu compilé prêt à lancer avec `Demarrer.cmd`, URL stable http://127.0.0.1:4317.
- Interface française/anglaise sombre, guide d’accueil facultatif, atelier de cartes reliées, détails de calcul, réglages, déplacements et démontage remboursé.
- Onze familles de machines, branches entre lignes, empreintes conservées puis consommées, deux recettes d’installations, transferts automatiques configurables, récupération et amplification.
- Configuration d’installation enregistrable dès le départ ; bibliothèque d’inventions à 1 000 composants. Encapsulation sur place fidèle aux états ; nouvelle instance payante à vide.
- Six expériences, dotations sans inflation des métriques, objectif 500 000 puis jeu libre, pas de prestige.
- Simulation fixe et déterministe, sorties différées, bornes visibles, aucun rattrapage hors ligne.
- Sauvegarde v1, copie précédente valide, export/import avec validation et confirmation, nouvelle partie avec confirmation.

## Vérifié effectivement

- Node 24.19.0 et Git 2.53.0 sur le PC ; TypeScript 5.9.3 installé localement au projet, verrou pnpm conservé.
- Typage strict et compilation réussis.
- **54 tests automatisés réussis** : moteur, guide, règles bilingues, routage différé, saturation de destination, conservation des empreintes, cycles bornés, reconfiguration des liens, équivalence d’encapsulation, sauvegardes et banc sans mutation. Les cinq parcours DOM vérifient notamment la langue, les plans, les réglages de branche et une vraie comparaison après changement d’ordre.
- Simulation de 30 minutes de coopération et essais d’équilibrage jusqu’à l’objectif.
- Serveur limité à 127.0.0.1 ; accès aux fichiers compilés et refus des sources vérifiés par HTTP. Aucun chargement distant déclaré dans les fichiers du jeu.

Commandes reproductibles : voir README ou `Verifier.cmd`. Les tests exécutent directement les sources TypeScript ; le test HTTP lit la version compilée. Recompiler avant de tester une modification d’interface.

## Limites de vérification

Lors de la première version, le navigateur intégré a renvoyé `net::ERR_BLOCKED_BY_CLIENT` sur l’URL locale. L’essai du navigateur Windows par le skill Computer Use a été arrêté par son contrôle de politique, faute d’identification certaine de l’URL. Pour la version 0.3, la fenêtre du jeu dans Brave a été repérée. La capture a échoué avec « Computer Use app approval timed out » ; aucune commande de jeu n’a été envoyée au navigateur. Le parcours graphique et les dimensions réelles restent à confirmer dans le navigateur du joueur. Les nouveaux tests DOM font fonctionner les commandes de l’interface dans Happy DOM ; ils ne sont pas des tests visuels.

Pas de screenshot de recette validé. Pas de playtest humain de 2–4 heures. Lisibilité à 1080p et mise à l’échelle Windows conçue avec CSS responsive, mais non vérifiée visuellement sur le moniteur. Le lanceur existant et l’URL sont conservés ; l’actualisation du navigateur charge la mise à jour.

## Prochain travail prioritaire

Faire essayer les nouveaux modules et le banc au joueur. Question ciblée : « Avez-vous pu expliquer votre première accélération et avez-vous eu envie de modifier la chaîne pour en essayer une autre ? » Relever aussi tout écran vide ou élément inaccessible lors du lancement.

Si le plaisir central est confirmé : enrichir les choix de coopération et les expériences sans imposer un build précis. Si la meilleure stratégie devient seulement d’empiler les résonateurs puis attendre, introduire un nouveau compromis explicite ou une autre décision utile ; ne pas étirer la durée par une hausse uniforme des coûts. Le rythme automatisé de référence est 44 min 46 s, pas la cible de 2–4 heures.

Architecture : `content.ts` pour les règles typées et descriptions, `engine.ts` pour l’état et les opérations pures, `save.ts` pour la validation/persistance, `app.ts` pour l’affichage/commandes, `style.css` pour la présentation. Serveur et génération de métriques dans `scripts/`. Aucun outil de triche accessible depuis l’interface normale.

Version 0.3 : `bench.ts` porte les copies de simulation et métriques ; `visuals.ts`, `bench-view.ts`, `routing-view.ts` et `atelier.css` portent les nouveaux affichages. `tests/network.test.mjs` contient les quinze nouveaux contrôles moteur/banc. `scripts/balance.mjs` régénère également les mesures d’ordre et de routage.
