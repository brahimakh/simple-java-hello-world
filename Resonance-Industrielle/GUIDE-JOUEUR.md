# Résonance industrielle — comprendre et commencer

Guide des bases pour la version 0.4. Il explique les règles et les commandes, sans proposer une construction optimale.

## Les nouveaux repères pour tes essais

Commence par sélectionner l’injecteur et comparer ses livraisons de **6 puis 12** : c’est gratuit. Les améliorations d’extraction ou de génération ne sont utiles au débit que si ces alimentations limitent ta chaîne ; leur panneau indique si une pénurie est observée.

Après une modification, lis **Observer ma modification**. L’avant et l’après utilisent des fenêtres de production réelles : laisse le temps aux anciens lots de sortir. Une barre suit ceux qui attendaient déjà devant les presses. Le bouton de comparaison ouvre un essai accéléré des deux plans ; il montre leur potentiel avec des files réinitialisées, pas le délai de transition de ton atelier.

Sélectionne une presse et regarde **Comprendre un lot**. Le résultat de son dernier pressage est décomposé en facteurs. Un marqueur prépare une interaction avec le tisseur ; il ne multiplie pas la production tout seul. À la Fonderie, un accumulateur réglé sur 80 permet d’activer la prime de gros lot. Comparer deux ordres de machines peut changer le résultat sans nouvel achat.

Pour une branche, choisis **Nouvelle ligne → Réception de branche** : son injecteur est suspendu. Sélectionne ensuite cette ligne comme destination dans l’aiguillage. Les nouveaux modificateurs sont ajoutés avant le premier aiguillage ; place les récupérateurs après la presse qui reçoit les lots, y compris si elle est sur la destination. Le diagnostic permet d’examiner un frein ; le schéma montre les trajets récents et atténue les machines que le flux contourne.

À 1 000 composants cumulés, **Expériences → Défis d’invention** propose trois objectifs différents du simple total de production. Prépare ton plan, lance une mesure de 60 secondes et garde les réglages stables pendant cet essai. La pause suspend le chronomètre ; une modification interrompt l’essai. Les résultats expliquent ce qui a été atteint, et tu peux réessayer. Le défi de sobriété plafonne temporairement la génération de Fonderie à 8 énergie/s, puis rétablit les niveaux achetés. Aucun reset ni inscription payante.

Les premières actions restent accompagnées par le guide ; ensuite il propose une expérience à la fois, validée par ce qui s’est réellement passé. Tu peux toujours masquer le guide et explorer librement.

## 1. Ce que le jeu attend de toi

**Ton rôle est d’inventer une installation plus efficace. Les machines produisent toutes seules ; tes décisions changent leur fonctionnement.**

La boucle du jeu est :

**Observer → avoir une idée → modifier une chaîne → mesurer → garder ou revoir ton idée.**

Les composants produits permettent de construire et d’ouvrir de nouvelles possibilités. L’objectif industriel est d’atteindre **500 000 composants cumulés**, mais ton premier objectif est beaucoup plus simple : comprendre une modification et voir son effet.

Tu peux expérimenter à ton rythme. Le guide « Premiers pas » est facultatif et il existe plusieurs façons de progresser.

## 2. Comprendre la première chaîne

Au départ, la Fonderie possède une chaîne automatique :

**Réserve de matière → Injecteur → Presse → Composants**

- L’extraction remplit la réserve de matière. Les générateurs remplissent la réserve d’énergie.
- L’**injecteur** prélève de la matière et la livre sous forme de lots à la carte suivante.
- La **presse** consomme ces lots et de l’énergie pour produire des composants.
- Les **composants** constituent ton budget de construction et d’amélioration.

Un lot est une livraison groupée. Un tampon est la petite réserve d’une machine, où les lots attendent leur traitement. Chaque machine a son propre cycle : recevoir davantage de matière n’accélère pas automatiquement sa capacité à la traiter.

Exemple de base : sans bonus, une presse de la Fonderie transforme **6 matières et 3 énergies en 0,6 composant**. C’est le résultat d’un traitement ; le débit dépend aussi de la fréquence des traitements.

## 3. Lire les trois chiffres importants

| Chiffre | Ce qu’il signifie |
|---|---|
| **Stock de composants** | Ce que tu peux dépenser maintenant. Acheter le fait diminuer. |
| **Composants cumulés** | Tout ce que tes presses ont produit. Les achats ne font pas baisser ce nombre ; il sert aux déblocages et à l’objectif final. |
| **Débit moyen** | La quantité réellement produite par seconde sur les dernières secondes de simulation disponibles, jusqu’à 60 secondes. |

Un gros lot peut créer un pic suivi d’un silence. Observe plusieurs cycles pour juger son intérêt. La **qualité** d’un lot est un multiplicateur de rendement, pas une ressource à dépenser séparément.

La frise indique les possibilités acquises et à venir. La barre se remplit vers le prochain déblocage, puis repart vers le suivant : tes acquis restent conservés.

## 4. Ton premier essai, pas à pas

1. **Sélectionne l’injecteur, puis la presse.** Lis leurs règles dans le panneau de détails. Repère ce qu’ils reçoivent, consomment et produisent.
2. **Regarde la production moyenne.** Clique sur sa valeur pour ouvrir son explication et son historique.
3. **Choisis un module disponible.** Lis sa règle avec le bouton d’information, puis ajoute-le à la ligne sélectionnée. Les premiers se débloquent avec la production cumulée.
4. **Observe son passage dans la chaîne.** Consulte son état, son tampon et le dernier lot traité. Formule une hypothèse simple : « Cette carte devrait changer… »
5. **Change un seul élément à la fois.** Essaie un réglage ou déplace une carte avec les boutons du panneau. Les déplacements sont possibles entre modificateurs compatibles.
6. **Enregistre une configuration sous un nom.** Tu pourras retrouver son plan dans « Inventions » après d’autres essais.

Les cartes et les flèches décrivent de vraies connexions. Cliquer une flèche interrompt ou rétablit le passage. Le schéma au-dessus des cartes montre aussi les liens entre lignes.

Le démontage rend le coût de construction et la matière encore en tampon. Il attend si les réserves ne peuvent pas accueillir le remboursement. L’énergie déjà utilisée par un procédé terminé reste consommée.

## 5. Quand une machine attend

Commence par lire son message.

| Message ou situation | Ce qu’il faut regarder |
|---|---|
| **Manque d’entrée** | La carte précédente lui envoie-t-elle des lots ? |
| **Manque de matière** | La réserve locale et les autres lignes qui y prélèvent aussi. |
| **Énergie insuffisante** | Le coût du prochain traitement et la réserve d’énergie. |
| **Accumulation** | Le seuil du lot : attendre de le réunir est le comportement prévu. |
| **Sortie saturée** | Le tampon suivant ou la réserve de sortie, qui manque de place. |
| **Connexion ouverte / destination à choisir** | Une flèche interrompue ou les réglages de l’aiguillage. |

Un **goulot d’étranglement** est ce qui limite actuellement la chaîne. Améliorer l’extraction aide lorsque l’approvisionnement manque ; une presse déjà occupée peut demander une autre organisation.

## 6. Les possibilités à explorer ensuite

- **Résonateur :** exploiter des petites livraisons rapprochées.
- **Accumulateur :** choisir la taille des lots.
- **Marqueur et tisseur :** exploiter des empreintes qui suivent les livraisons. L’ordre des cartes compte.
- **Aiguillage :** envoyer certains lots vers une autre ligne. Sa destination reçoit les lots après son injecteur ; cet injecteur peut être suspendu pour faire une ligne alimentée uniquement par la branche.
- **Récupération :** faire revenir une partie des matières ou de l’énergie après pressage.

À **1 000 composants cumulés**, la Serre et l’encapsulation deviennent disponibles. La Serre valorise les résidus et renvoie des catalyseurs à la Fonderie. Encapsuler permet de nommer et réutiliser une invention ; construire un nouvel exemplaire paie ses machines et démarre avec des tampons vides.

## 7. Comparer avec le banc d’essai

1. Dans **Banc d’essai**, mémorise ta configuration de référence.
2. Retourne dans l’atelier et modifie ton idée.
3. Reviens au banc et lance la comparaison.

Les deux essais utilisent les mêmes réserves et alimentations de départ, des tampons vides et une période de stabilisation. Les durées affichées sont du **temps simulé**, pas une attente réelle de plusieurs minutes. La simulation ne modifie pas ta partie.

Regarde le débit, mais aussi l’évolution des réserves et le coût des machines. Une réserve qui diminue peut soutenir temporairement un débit qui ne durera pas. Un investissement supérieur peut aussi expliquer une amélioration : le banc affiche les coûts pour t’aider à distinguer les deux.

## 8. Retrouver ta partie

**Sauver** conserve la partie ; **Enregistrer la configuration** conserve un plan de machines. Ce sont deux choses différentes.

La partie se sauvegarde automatiquement dans ton navigateur. **Exporter** crée une copie JSON que tu peux conserver. Utilise le même navigateur et la même adresse pour retrouver la sauvegarde locale.

La pause est en haut de l’écran. Fermer ou masquer la page arrête la simulation, sans gain hors ligne au retour. Le sélecteur **Langue / Language** permet de jouer en anglais sans recommencer.

Quelques termes : *stock* = réserve ; *batch* = lot ; *buffer* = tampon ; *throughput/rate* = débit ; *blueprint* = plan ; *lifetime production* = production cumulée.

## 9. Comment me faire un retour utile

**Tu n’as pas besoin de trouver la meilleure stratégie pour juger le jeu.** Une hésitation, un moment de curiosité ou une attente ennuyeuse sont déjà des informations utiles.

Après un essai, raconte simplement :

- **J’essayais de…**
- **J’ai changé…**
- **Je pensais que… mais j’ai observé…**
- **Ce qui m’a plu, bloqué ou laissé sans idée : …**

Tu peux préciser le nom des cartes ou joindre une capture si cela aide. Des chiffres sont utiles quand tu en as, mais ton ressenti compte autant.

Pour une première session, le retour le plus important est : **« Est-ce que je comprends pourquoi ma modification fonctionne, et est-ce que j’ai envie d’en essayer une autre ? »**

## Après le premier million (version 0.6)

- **Maîtrises** : dans l’atelier, chaque niveau multiplie par 1,5 l’effet d’une famille que vous utilisez (elles arrivent vers 20 000 composants cumulés). Le prix monte pour toutes les familles à la fois : choisissez celles qui travaillent vraiment.
- **Contrats** : dans *Expériences*, une commande à la fois, sans chrono. Elle paie des brevets ; chaque brevet change une règle (plus de lignes, lots de 320, catalyse ×6…).
- **Carnet** : vos découvertes, badges, thèmes et la courbe de votre partie. Les découvertes manquantes restent cachées : à vous de les provoquer.
- **Forge à plasma** (10⁸) : la troisième installation. Elle partage les catalyseurs de la Serre avec la Fonderie ; son plasma multiplie une presse par 10.
- **Puzzles** : dans *Premiers pas* et *Expériences*. Votre partie attend pendant le puzzle.
- **Gestes** : appui long sur une machine, puis glisser sur le côté pour la déplacer. Sur téléphone, glisser le tiroir de réglages vers le bas pour le fermer.
