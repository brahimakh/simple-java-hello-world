# Plan de travail 0.8 → 1.2 (document vivant)

Demande (2 novembre 2026) : mettre en œuvre les idées d’IDEES-2.md jusqu’à la 1.2. Contraintes : tests, interface mobile, début de partie soigné, rythme (aucune étape trop courte ni trop longue), mécaniques introduites lentement, créativité en second temps, s’inspirer des jeux connus en cas de doute.

## Structure de l’expérience

1. **Bases guidées (0.7, conservé)** : 9 objectifs, environ 5 à 10 minutes pour un humain.
2. **Choix de spécialité** à la fin du parcours (Cadence, Masse, Empreinte) : ×2 sur la famille choisie. Inspiration : choix de classe ou de faction (Antimatter Dimensions, Realm Grinder).
3. **Pistes (créativité)** : 3 objectifs ouverts à la fois, tirés des découvertes accessibles (indice sans recette) et de buts à solutions multiples. Récompense immédiate. Inspiration : succès et défis de Cookie Clicker et de Kittens Game.
4. **Couches** introduites chacune par une piste « Nouveauté » prioritaire.

## Décisions par version

### 0.8 Libre
- Pistes (3 slots), spécialité de départ, Eurêka (×5 du débit sur 30 s, moins de 180 s après une modification ; récompense = 20 s × log2(ratio) de nouvelle production ; journal des Eurêka dans le Carnet).
- Synergie : interactions distinctes actives sur une ligne pendant les 10 dernières secondes, ×1,3 chacune, au plus 12 (affichée sur la ligne).
- Découvertes : ×1,1 immédiat chacune sur la Fonderie.
- Résonateur à deux réglages (fenêtre 1, 2 ou 4 s : maximum 5, 4 ou 3 accords).
- Annuler la dernière modification ; dupliquer une ligne ; renommer une ligne.
- Laboratoire libre (bac à sable fondé sur le mode puzzle, tout débloqué).
- Effets proportionnés (Eurêka), compteurs qui changent d’échelle, haptique graduée.
- Joueurs automatiques par archétype (cadence, masse, empreinte, boucles) avec rapport de diversité.

### 0.9 Réseau
- Assembleur (fusionne deux lots venus de lignes différentes : qualité multipliée, matière additionnée, au plus la limite de lot).
- Moules de presse (variante de la presse) : standard, ressort (lots ≤ 12 ×3, sinon ×0,5), engrenage (prime de lot 12 au lieu de 8, lots < 80 ×0,5), cristal (cycle 3 s, ×4).
- Troisième couleur, magenta : 2 couleurs ×2, 3 couleurs « prismatique » ×5.
- Cote d’invention à l’encapsulation (débit mesuré seul ÷ ligne nue), prime unique, classement.
- Contrats créatifs (3 familles exactement, prismatique, cristaux).
- +10 découvertes.

### 1.0 Tempo
- Écho : recopie sur le lot suivant les empreintes du lot précédent (une fois par lot).
- Métronome : module qui retient les lots et les relâche sur le temps du tempo global (réglable de 60 à 240) ; un lot relâché sur le temps gagne ×1,5 ; la musique suit le tempo.
- Prototypes : 3 propositions à chaque palier (10⁴, 10⁶, 10⁹, 10¹²), on en garde 1 (pool de 10, tirage déterministe).
- Rapport d’invention en image (PNG), partage via Android ou téléchargement.
- Sons par famille.

### 1.1 Logique
- Relais : aiguillage conditionnel (qualité ≥, empreintes ≥, bicolore, réserve <).
- Plans réglables : réglages modifiables au déploiement d’une invention.
- Emplacements d’amélioration : turbo (cycle ÷ 2), tampon (capacité ×2), marque (+1 empreinte), stabilisateur (accord conservé) ; 1 emplacement, +1 à 10⁹, +1 par brevet.

### 1.2 Monde
- Chantiers : 6 grands projets livrés depuis les réserves, avec bonus permanents et bâtiments.
- Serre vivante : souches à 3 caractères, croisements à règles affichées, saisons déterministes de 10 minutes.
- Doctrines de refondation (Vitesse, Masse, Lumière, Écologie).
- Vue Monde : décor qui grandit (lignes, chantiers, débit).

### Non retenu (avec raison)
- Grille 2D : elle doublerait le système de lignes et d’aiguillages ; remplacée par la vue Monde et l’assembleur.
- Récursion vraie des inventions : contraire à la fidélité de simulation ; on garde l’insertion d’une invention.
- Interférences physiques : trop proches du métronome et de l’écho, risque de confusion.
- Observatoire : peu de valeur ludique ; remplacé par l’affichage de la synergie.
- Brevets d’auteur et défis communautaires hebdomadaires : dépendent d’un serveur ; la galerie suffit.

## Calendrier des déblocages (production cumulée)

10 résonateur · 30 marqueur · 50 accumulateur · 60 aiguillage · 80 tisseur · 160 charge · 400 récupération · 1 000 Serre et synchroniseur · 3 000 diviseur · 10⁴ filtre et prototype 1 · 2×10⁴ assembleur · 5×10⁴ moules · 10⁵ four et contrats · 3×10⁵ compresseur · 10⁶ harmoniseur, capteur, maîtrises et prototype 2 · 3×10⁶ ambre et métronome · 10⁷ écho et culture · 3×10⁷ magenta · 10⁸ Forge et relais · 10⁹ emplacements et prototype 3 · 10¹⁰ chantiers · 10¹² refondation et prototype 4.

## Cibles de rythme (joueur automatique compétent)

- Écart entre deux nouveautés : de 1 à 8 minutes ; ni deux nouveautés dans la même minute après le parcours, ni plus de 10 minutes sans rien.
- 10¹⁵ entre 1 h 30 et 2 h 30 pour un joueur automatique (2 à 5 h pour un humain).
- Aucun archétype plus de 2 fois plus lent que le meilleur.
