# Équilibrage — mesures de référence

Document de développement contenant des configurations révélatrices. Ne sert pas de tutoriel imposant une solution. Source des chiffres : `node scripts/balance.mjs`, sortie conservée dans `balance-results.json`.

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
