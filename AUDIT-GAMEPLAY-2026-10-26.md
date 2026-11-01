# Simulation de partie et pistes d’amélioration

26 octobre 2026 · Résonance industrielle 0.3.0

## Méthode et limites

J’ai rejoué trois parcours depuis les ressources de départ, avec les opérations du moteur utilisées par le jeu : achats, réglages, déplacements, constructions et collecte des dotations. Aucun stock ni déblocage artificiel. Les choix incluent des erreurs plausibles et des périodes de lecture ou d’observation, généralement espacés de 35 à 45 secondes après les premières décisions. Deux replays supplémentaires doublent les délais entre les choix.

Ce sont des simulations scriptées, pas des parties humaines ni un test visuel dans le navigateur. Les politiques sont écrites à l’avance et bénéficient de ma connaissance des règles ; elles ne prédisent donc pas la durée d’une première partie. Les durées correspondent au temps actif du moteur, sans temps de réflexion en pause ou de consultation du banc. Je n’ai consulté ni modifié la sauvegarde du joueur. Les états finaux passent la validation de sauvegarde, sans arrêt de diagnostic du moteur dans ces cinq essais. Cela ne garantit pas l’absence de bugs ailleurs.

## Résultats

L’objectif mesuré est le franchissement de 500 000 composants produits cumulés.

| Parcours | Durée simulée | Ce qui a été essayé |
|---|---:|---|
| Découverte prudente | 13 min 58 | Achat d’extraction peu utile, modules testés séparément, branche mal configurée, déplacements correctifs, Serre |
| Exploration avec le banc | 10 min 59 | Comparaisons avant/après, lots de 80, ordre marqueur/accumulateur, coopération entre usines |
| Répétition d’une règle visible | 5 min 36 | Injecteur réglé sur 12, puis achats répétés de résonateurs ; sans Serre, branche ni tisseur |
| Découverte, décisions deux fois plus espacées | 22 min 18 | Même séquence prévue ; l’objectif arrive avant les dernières actions |
| Répétition, décisions deux fois plus espacées | 10 min 35 | Même principe, délai doublé entre les achats |

La différence indique un problème de diversité des stratégies pour cet objectif. Elle ne permet pas de conclure que tout joueur terminera aussi vite.

## 1. Rendre les premiers choix compréhensibles et utiles

**Constat mesuré.** Après cinq minutes, sans achat, la chaîne initiale produit 0,6 composant/s. Acheter l’amélioration d’extraction ou d’énergie conserve exactement ce débit. Régler gratuitement l’injecteur sur 12 le porte à 1,2/s. Les améliorations augmentent bien leurs ressources respectives, mais ces ressources ne limitent pas encore cette chaîne.

**Conséquence probable pour un débutant.** Un achat présenté comme une amélioration paraît sans effet, alors qu’un réglage gratuit moins évident est immédiatement utile.

**Proposition prioritaire.** Une première expérience guidée : observer le débit, changer un réglage, comparer. Les améliorations indiqueraient leur intérêt actuel : « réserve suffisante ; cet achat n’augmente pas encore le débit ». Il faut apprendre à chercher le goulot plutôt qu’apprendre une recette obligatoire.

## 2. Montrer le délai entre une modification et son résultat

**Constat mesuré.** En ajoutant un résonateur à 45 secondes, 270 unités de matière attendent déjà devant la presse. Le premier lot amélioré ne sort qu’à 90,2 secondes, soit **45,2 secondes après l’achat**. La moyenne glissante peut ensuite retarder la perception du nouveau régime.

**Proposition prioritaire.** Distinguer « nouveaux lots améliorés », « anciens lots encore en attente » et production moyenne. Afficher le nombre de lots avant le premier résultat et, quand elle est estimable, une attente indicative. Un suivi de lot permettrait de voir où l’effet est déjà actif.

Le banc compare des chaînes réinitialisées et stabilisées ; ses résultats sont utiles, mais ne représentent pas le délai de transition de la chaîne réelle. Cette différence mérite une explication visible.

## 3. Aider à construire une branche sans machines inutilisées

**Constat mesuré.** Dans le parcours prudent, le tisseur ajouté après l’aiguillage traite zéro lot jusqu’à son déplacement, 90 secondes plus tard. Les lots partent vers l’autre ligne avant de l’atteindre. Plus tard, le récupérateur et l’échangeur de la ligne principale restent eux aussi inutilisés. La nouvelle ligne a également son propre injecteur actif, qui concurrence les arrivées de la branche.

L’aiguillage sans destination affiche bien une demande de destination dans son état. En revanche, la sélection du diagnostic général dans l’interface ne reconnaît pas directement ce message et peut mettre en avant une saturation en amont. Ce point vient de la lecture du code d’interface, sans validation visuelle.

**Proposition prioritaire.** Créer une ligne en choisissant « alimentation propre » ou « réception d’une branche ». Mettre en évidence le trajet effectivement emprunté, les destinations manquantes et les modules contournés. Avant un ajout, montrer si le module recevra le flux actuel. Donner la priorité à la cause du blocage plutôt qu’à ses conséquences en amont.

## 4. Conserver les combinaisons puissantes, enrichir les raisons de varier

**Constat mesuré.** Répéter les résonateurs suffit à atteindre 500 000 composants en 5 min 36, sans la plupart des systèmes avancés. Même en doublant les délais entre les décisions, ce parcours reste plus rapide que l’exploration prudente.

**Interprétation.** La multiplication fonctionne, mais cet objectif récompense davantage la répétition d’un même achat que la découverte de plusieurs interactions. Cela réduit l’intérêt des branches et de la coopération entre usines.

**Proposition.** Garder cette découverte satisfaisante. Ajouter ensuite des défis facultatifs qui donnent un intérêt à d’autres procédés : obtenir un débit avec une puissance limitée, valoriser les résidus, alimenter plusieurs destinations ou maintenir une livraison régulière. Chaque défi devrait annoncer ses contraintes et permettre de garder les inventions réussies. Éviter de répondre uniquement par une réduction générale des multiplicateurs ou un objectif chiffré plus long.

## 5. Expliquer les combinaisons au moment où elles deviennent possibles

**Constats mesurés.** Le marqueur seul ne change pas le débit dans l’essai contrôlé : 6/s avant et après. Avec le tisseur et des lots de 80, déplacer le marqueur avant l’accumulateur fait passer le résultat du banc de 96 à 384/s. Changer le seuil de l’accumulateur de 40 à 80 donne, dans un autre essai contrôlé, 6 à 48/s sans changer les machines.

**Proposition.** Un aperçu concret d’un lot : taille, marques, qualité et bonus appliqués à la presse. Le marqueur pourrait annoncer « prépare une interaction avec le tisseur ». L’accumulateur montrerait explicitement que 80 active le bonus de gros lot. Le joueur doit pouvoir expliquer son gain, puis inventer une variante.

Le seuil 80 est une découverte forte ; il serait intéressant que les autres tailles aient des usages contextuels plutôt qu’être seulement des étapes vers ce seuil.

## 6. Laisser le temps de comprendre les nouveautés

**Constat mesuré.** Dans le parcours avec le banc, quatre seuils de contenu sont franchis entre 50 et 76 secondes. La Serre et les dernières familles de modules sont disponibles à 4 min 19, avant que plusieurs règles aient été essayées.

**Proposition.** Garder les achats libres, mais organiser l’accompagnement autour d’expériences courtes : améliorer un lot, comparer deux ordres, recevoir un flux sur une autre ligne, valoriser les résidus. Une seule suggestion active, avec son résultat attendu, serait plus utile qu’une succession d’annonces de disponibilité.

## Ordre de travail recommandé

1. Expliquer les effets et leur délai : comparaison avant/après, suivi d’un lot, file d’attente.
2. Clarifier les branches : trajet visible, choix du rôle de la destination, avertissement sur les machines contournées.
3. Refaire les premières expériences autour d’un changement observable et des vrais goulots.
4. Ajouter des objectifs variés pour donner une utilité aux différentes inventions, en conservant les croissances puissantes.

Pour ton prochain essai, les remarques les plus utiles seront : « je ne savais pas quoi essayer », « j’ai acheté ceci sans comprendre son effet », « j’ai attendu sans savoir pourquoi » et « cette combinaison m’a donné envie de continuer ». Le ressenti visuel, la lisibilité des textes et le plaisir de découverte restent à évaluer par une vraie partie.

## Fichiers de preuve

- `scripts/playtest.mjs` : scénarios et essais ciblés reproductibles avec `node scripts/playtest.mjs`.
- `reports/playtest-2026-10-26.md` : chronologie des trois parcours et contrôles de délai.
- `reports/playtest-2026-10-26.json` : états, achats, déblocages, files, compteurs de machines et résultats du banc.

Le code du jeu et son équilibrage n’ont pas été modifiés pour cet audit.
