# Passation — Résonance industrielle 0.4.0

Mise à jour du 28 octobre 2026. Projet : E:\ChatGPTWork\Resonance-Industrielle.

## Demande traitée

Implémenter les six améliorations de l’audit du 26 octobre : premiers choix utiles, délai des effets visible, branches compréhensibles, diversité d’objectifs, explication des facteurs et apprentissage progressif.

## État livré

- Jeu local Windows, TypeScript et DOM/CSS, sans dépendance de production ni accès réseau externe.
- Premiers pas conservés et complétés par quatre expériences accompagnées, une seule suggestion à la fois. Préférences v1 migrées par ajout de valeurs par défaut.
- Conseils de pénurie sur les infrastructures, essai gratuit de réglage de l’injecteur.
- Observation avant/après à chaque modification : instantané temporaire, moyennes du laboratoire, progression des anciennes files des presses et cycles des nouveaux modules. La mesure est descriptive, pas une preuve causale de gain durable.
- Comparaison immédiate avec la configuration précédente au banc ; la référence du banc est alors remplacée en mémoire. Aucun stock simulé crédité.
- Dernier pressage décomposé en facteurs réels. Nouveaux champs facultatifs de télémétrie ; anciennes sauvegardes acceptées.
- Choix du rôle d’une ligne à sa création. Nouveaux modificateurs insérés avant le premier aiguillage ; les anciennes lignes ne sont pas réorganisées. Diagnostics orientés vers la cause et lien vers la machine concernée. Trajets récents et contournements indiqués sur le schéma.
- Trois défis facultatifs : économie, deux sorties, symbiose. Mesure de 60 secondes actives, badges et mesures sauvegardés, aucune dotation supplémentaire. Signature stable des machines/réglages/niveaux/transferts requise. La pause et le hors ligne n’avancent pas la durée. La sobriété plafonne temporairement la génération de Fonderie à 8/s sans modifier les niveaux achetés.
- Résonateurs et multiplicateurs conservés. Pas de reset ajouté. Objectif de production de 500 000 conservé, défis visibles dès 1 000.
- Français et anglais couverts, noms personnels préservés.

## Vérification

Compilation stricte et génération de dist/. 68 tests automatisés passent : moteur, sauvegardes, routage, comparaisons, apprentissage et neuf parcours DOM. Les nouveaux tests vérifient la faisabilité des trois défis, leur durée, pause, interruption, limites temporaires, reprise déterministe, anciennes sauvegardes et traduction des nouveaux écrans.

Le navigateur intégré a cette fois ouvert l’URL locale avec succès. Contrôle réel de l’atelier, inspection de l’injecteur, réglage sur 12, observation avant/après, dialogue du rôle de ligne et présentation des défis en anglais. Les tests DOM couvrent aussi les essais actifs et résultats des défis. Aucun playtest humain prolongé, ni validation de toutes les tailles d’écran. Le serveur de vérification est arrêté après la recette ; lancer Demarrer.cmd pour jouer.

## Fichiers utiles

- src/insights.ts : diagnostics, explication des lots, observation des changements.
- src/challenges.ts et src/challenge-view.ts : règles et présentation des défis.
- src/learning-en.ts et src/learning.css : traductions et présentation complémentaires.
- tests/learning.test.mjs et tests/ui.test.mjs : preuves automatisées.
- GUIDE-JOUEUR.md : guide utilisateur mis à jour.
- AUDIT-GAMEPLAY-2026-10-26.md et reports/playtest-2026-10-26.* : audit historique de la version 0.3, non réécrit comme s’il s’agissait de résultats 0.4.

## Prochaine observation utile

Demander au joueur s’il peut expliquer son premier gain, distinguer une file ancienne d’un blocage et choisir un défi qui lui donne envie d’inventer. Les temps scriptés de l’audit ne sont pas des durées humaines et n’établissent pas une cible de plusieurs heures.
