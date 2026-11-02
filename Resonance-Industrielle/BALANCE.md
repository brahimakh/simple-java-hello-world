# Équilibrage — mesures de référence

## 1.2 : cinq styles, nouveautés au rythme

`node scripts/campaign.mjs 5`. Partie « nouvelle » dont le guide est terminé : les nouveautés arrivent une à une (écart de 2 min à 4 min 18). Chaque style choisit une spécialité, une recette et un module signature ; tous utilisent les maîtrises, brevets, contrats, prototypes, turbo, chantiers et croisements. Décisions toutes les 30 s.

| Style | 10³ | 10⁶ | 10⁹ | 10¹² | 10¹⁵ |
|---|---:|---:|---:|---:|---:|
| complet | 1:39 | 4:22 | 14:15 | 51:30 | 1:15:37 |
| cadence | 1:39 | 4:08 | 14:05 | 37:31 | 1:09:02 |
| masse | 1:39 | 4:48 | 18:14 | 51:57 | 2:20:18 |
| empreinte | 1:43 | 4:22 | 14:16 | 51:14 | 1:50:40 |
| boucles | 1:39 | 4:22 | 14:15 | 55:37 | 1:54:38 |

Écart maximal entre styles : ×2,03. Réglages (`TUNING` dans `src/engine.ts`) : synergie ×1,2 par interaction (au plus 12), découverte ×1,05 et 30 s de production, maîtrises ×2 par niveau avec un prix commun de 10⁷ × 6,5ⁿ, compresseur à 85 %.

Balayages qui ont mené à ces valeurs :
- Sans file des nouveautés, 24 nouveautés arrivaient en 7 min 30 : la file à écart croissant a été ajoutée.
- Synergie ×1,3 et découvertes ×1,1 : 10¹⁵ en 16 minutes, archétypes « purs » jusqu’à ×10 d’écart. Les styles ont été redéfinis (chacun combine les bases) et les gains réduits.
- Prix des maîtrises ×4, ×6, ×7 et ×8 : ×6,5 avec une base de 10⁷ place 10¹⁵ entre 1 h 10 et 2 h 20 en restant sous un écart de ×2,1.


## 0.6 : partie complète par un joueur automatique

`node scripts/campaign.mjs 5`. Politique : injecteurs sur 12, recette Fonderie complétée au fil des déblocages (résonateur, marqueur, accumulateur 80, tisseur, four, charge 2 s, synchroniseur, harmoniseur), six lignes, Serre et Forge à deux lignes, maîtrises des familles utilisées dès que finançables, brevets et contrats pris au passage. Elle n’utilise ni filtre, ni miroir, ni diviseur, ni compresseur, ni refondation : un joueur qui invente peut aller plus vite. Décision toutes les 30 s, sans temps de réflexion.

| Réglage des maîtrises | 10⁶ | 10⁹ | 10¹² | 10¹⁵ |
|---|---:|---:|---:|---:|
| Sans maîtrise (avant correction) | 4:53 | 34:16 | non atteint en 6 h | — |
| ×2 par niveau, prix ×40 par famille | 4:53 | 8:39 | 9:36 | 10:32 |
| ×2 par niveau, prix commun ×2,4 | 4:53 | 12:37 | 17:27 | 21:17 |
| ×1,5 par niveau, prix commun ×1,8 | 4:53 | 13:49 | 19:23 | 36:57 |
| ×2 par niveau, prix commun ×3 | 4:53 | 13:39 | 18:30 | 42:23 |
| **×2 par niveau, prix commun ×3,2 (retenu)** | **4:53** | **13:50** | **21:47** | **1:08:27** |
| ×2 par niveau, prix commun ×3,5 | 4:53 | 13:54 | 23:43 | 1:52:47 |
| ×2 par niveau, prix commun ×4 | 4:53 | 14:13 | 30:23 | non atteint en 5 h |

Le réglage retenu donne une décennie toutes les 2 à 25 minutes, sans mur. Le dernier ordre de grandeur est le plus long (27 min) : c’est là que les boucles de filtre, le miroir et la refondation doivent faire la différence. Ces durées ne sont pas des durées humaines : une première partie, avec lecture et essais, devrait être plusieurs fois plus longue. Aucun diagnostic moteur dans ces essais.

Les puzzles ont une solution vérifiée par les tests (`tests/puzzles.test.mjs`), dans leur budget et avec leurs seuls modules.

## Mesures historiques (0.3–0.5)


Document de développement contenant des configurations révélatrices. Ne sert pas de tutoriel imposant une solution. Source des chiffres : `node scripts/balance.mjs`, sortie conservée dans `balance-results.json`.

## Nouveaux essais 0.3 : ordre et routage

Même protocole que le banc accessible au joueur : réserves, alimentations et progression de référence identiques, machines froides, 120 s de stabilisation puis 180 s de mesure. Injecteur 6, extraction 12 matières/s, génération 8 énergies/s, aucune catalyse.

| Essai | Référence / s | Variante / s | Coût référence / variante | Rapport |
|---|---:|---:|---:|---:|
| Changement d’ordre uniquement | 19,2 | 76,8 | 195 / 195 | ×4 |
| Répartition alternée entre deux presses | 0,6 | 1,2 | 45 / 145 | ×2 |

Dans le premier essai, injecteur → accumulateur 80 → marqueur → tisseur → presse devient injecteur → marqueur → accumulateur 80 → tisseur → presse. Les mêmes cinq machines utilisent la même alimentation : la différence vient des empreintes conservées avant réunion des lots. Une seule empreinte donne ×2 ; plusieurs livraisons réunies atteignent le facteur maximal ×8 du tisseur. Aucun module supplémentaire n’a été acheté pour ce rapport ×4.

Dans le second essai, l’aiguillage partage les lots entre la presse locale et une deuxième ligne dont l’injecteur est suspendu. L’alimentation est inchangée, mais deux presses traitent les livraisons en parallèle. Le coût supérieur est affiché ; ce rapport n’est pas une comparaison à budget égal.

Les essais n’ont déclenché aucun diagnostic. Les tests vérifient également qu’un lot divisé conserve ses empreintes au prorata, qu’elles ne peuvent pas être réactivées après consommation et qu’un cycle entre lignes conserve la matière en consommant du temps.

Les résultats historiques ci-dessous restent valides pour les mêmes configurations. La politique de progression historique n’utilise pas les nouveaux modules : elle reste un repère et ne mesure pas la durée de découverte de cette version.

## Protocole

Une ligne, injecteur réglé sur 6, 12 matières/s et 8 énergies/s générées, aucun niveau d’amélioration, aucun catalyseur. La production cumulée de départ est réglée à 2 000 uniquement pour autoriser le contenu dans le script de développement. Les résultats mesurent la production ajoutée, pas cette dotation. Chauffe de 600 s puis mesure de 120 s, soit plusieurs dizaines de cycles de lots. Aucun achat pendant la mesure. Pas de temps identique à la partie normale.

Les coûts diffèrent : **ce ne sont pas des comparaisons à budget de construction égal**. Les entrées générées et le nombre de lignes sont identiques. Les rapports indiquent le résultat d’une invention par rapport à une référence, pas un bonus gratuit obtenu sans machines supplémentaires.

| Configuration | Coût des machines | Débit moyen / s | Pic par cycle | Rapport à la référence |
|---|---:|---:|---:|---:|
| Injecteur → presse | 45 | 0,6 | 0,6 | 1 |
| Résonateur avant presse | 75 | 3 | 3 | 5 |
| Accumulateur 80 avant presse | 90 | 9,6 | 64 | 16 |
| Récupérateur + échangeur après presse | 225 | 0,6 | 0,6 | 1 |
| Résonateur → accumulateur 80 → presse → récupérateur → échangeur | 300 | 48 | 320 | 80 |
| Même chaîne avec un deuxième résonateur | 330 | 240 | 1 600 | 400 |

Le lot accroît la quantité traitée par cycle et reçoit une prime ×8 ; la qualité des livraisons résonantes est conservée par moyenne pondérée. Le résultat combiné vient de ces deux règles. La récupération n’ajoute pas de débit si l’entrée et l’énergie ne constituent pas le goulot.

## Contexte utile à la récupération

Six lignes simples se partagent une alimentation inchangée de 12 matières/s et 8 énergies/s, stocks initiaux matière/énergie nuls. Chauffe de 1 200 s, mesure sur 300 s.

| Six lignes | Coût total | Débit moyen / s |
|---|---:|---:|
| Sans récupération | 270 | 1,2 |
| Avec récupération et échangeur sur chaque ligne | 1 350 | 3,6 |

Le gain mesuré est ×3 dans ce contexte et avec cet investissement supérieur. Les presses, et non plus l’alimentation, deviennent le facteur limitant. L’ordre fixe des lignes peut défavoriser les dernières quand l’approvisionnement est rare : c’est déterministe et non destructif, mais un partage plus équitable est une piste d’itération.

## Progression automatisée

Une politique explicite, disponible dans le script, achète un résonateur puis un accumulateur 80, ajoute la récupération, construit une Serre de base et tente des améliorations toutes les 30 s. Elle valide les expériences admissibles immédiatement. Ce n’est pas une simulation du comportement humain.

- Premier résonateur construit : 17 s.
- Premier accumulateur construit : 46 s.
- Deuxième installation construite : 95 s.
- Objectif 500 000 atteint : 2 686 s, soit **44 min 46 s**.
- Aucun diagnostic moteur.

Cette politique n’utilise ni le second réglage de l’injecteur, ni la chambre de charge, ni le synchroniseur, ni la répétition intensive des résonateurs. Des inventions plus agressives peuvent finir bien plus vite. Il ne faut pas annoncer 45 minutes de durée garantie, encore moins 2–4 heures de contenu validé.

## Ce qui reste à mesurer avec le joueur

Compréhension de l’événement « livraison » ; plaisir de la première accélération ; intérêt de changer l’ordre des cartes ; lisibilité du goulot énergétique ; fréquence des longues attentes ; usage volontaire de la bibliothèque ; intérêt de la coopération par rapport à l’empilement de multiplicateurs. La simulation valide la comptabilité et les ordres de grandeur, pas le plaisir.
