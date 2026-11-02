# Partie jouée par Claude, comme un joueur expérimenté et créatif (2 novembre 2026)

## Méthode

Partie neuve sur le vrai moteur, tour par tour : à chaque tour, je lisais ce que le jeu affiche (objectif, pistes, prochaine nouveauté, état des machines), je décidais, puis le temps avançait. J'ai joué environ 14 minutes de jeu sur la version 1.2. Pour la suite de la partie, j'ai lu les journaux des joueurs automatiques.

Limite : un joueur réel lit, hésite et se trompe davantage. Mes durées sont donc des minimums.

## Ce qui marche

- **Le guide est clair.** Chaque objectif tient en une action, et l'ordre (lancer à la main, automatiser, résonateur, lots de 12, accumulateur, marqueur et tisseur) se comprend en jouant. J'ai fini le guide en 2 min 40 sans hésiter.
- **Les pistes donnent envie.** « Jusqu'où le tisseur peut-il multiplier ? » m'a fait chercher : en passant l'accumulateur à 160, le lot réunit 8 empreintes et la production a été multipliée par 2,8. C'est exactement le plaisir visé.
- **L'Eurêka récompense vraiment la créativité.** Réorganiser deux lignes avec un aiguillage a déclenché un Eurêka : c'est le moment le plus satisfaisant de la partie.

## Ce qui ne marchait pas (1.2), et ce que la 1.3 corrige

| Constat | Effet ressenti | Correction 1.3 |
|---|---|---|
| Un Eurêka pendant le guide : régler l'accumulateur sur 80 multipliait la production par 60 et rapportait 12 000 ⬡ à la 2e minute | Une récompense « créative » pour avoir suivi une consigne. Ensuite, tout est gratuit | Pas d'Eurêka pendant le guide |
| 10⁵ composants à la 3e minute : prototype, contrats, deux pistes sur les moules et la spécialité arrivaient dans la même minute | Contraire à « une mécanique à la fois » : tout s'ouvrait juste après le guide | Prototypes, moules, contrats, maîtrises, couleurs, Serre vivante, emplacements et chantiers passent par la file des nouveautés, un par un |
| La file ne dépendait que d'une minuterie | Bien jouer n'accélérait rien : on attendait | Chaque découverte ou Eurêka avance la nouveauté suivante d'une minute, avec 45 s minimum entre deux nouveautés. La célébration le dit |
| Contrats impossibles proposés (catalyseurs avant la Serre, cristaux avant les moules) | « Qu'est-ce que le jeu attend de moi ? » | Seuls les contrats réalisables avec ce qui est déjà introduit sont proposés |
| Le synchroniseur arrivait 2 minutes avant la Serre, qui produit ses catalyseurs | Un module inutilisable | La Serre arrive avant le synchroniseur |
| Un aiguillage ajouté sans destination bloquait toute la ligne (production ÷ 700) | Piège de débutant, sans explication | Sans destination, les lots continuent tout droit, et l'état l'affiche |
| Presque toutes les machines affichaient « Manque d'entrée » en marche normale | On croit à une panne | « En attente d'un lot ». Pour une vraie pénurie : « Manque de matière · améliorez l'extraction » |

## Mes réponses aux questions

- **Ai-je eu un challenge ?** Pendant le guide, un peu. Après, en 1.2, pas vraiment : les composants s'accumulaient par millions et presque tout était gratuit. Le vrai défi était de comprendre les combinaisons, pas de les payer. La 1.3 déplace le défi au bon endroit : trouver une combinaison fait avancer la partie plus vite.
- **La difficulté monte-t-elle progressivement ?** Les mécaniques, oui. L'économie, non : elle explose dans les 5 premières minutes (×400 en 8 minutes), puis seules les maîtrises (à partir de 10⁶) servent à dépenser. C'est le principal chantier restant. Je ne l'ai pas refondu, car il faudrait recaler tous les prix et tous les seuils (voir « Suite proposée »).
- **Les mécaniques s'imbriquent-elles logiquement ?** Oui pour les bases : petits lots rapides, puis gros lots, puis empreintes. Deux exceptions, corrigées : le synchroniseur avant la Serre, et l'aiguillage qui bloque. Reste une chose peu claire : la presse ne traite qu'un lot par seconde. Une nouvelle ligne double donc presque la production, et le jeu ne le dit nulle part.
- **Ai-je compris ce que le jeu attendait ?** Toujours pendant le guide. Après, les pistes répondent bien à la question. Les contrats impossibles brouillaient ce message : c'est corrigé.

## Suite (faite en 1.3.1)

1. Économie recalée : lignes, extraction et maîtrises coûtent maintenant de 15 s à 5 min de production selon la phase, contre 0 s avant (mesures dans `BALANCE.md`).
2. Chaque ligne nomme son goulot et le geste qui le lève.
3. Un module s'insère juste après la machine choisie.
