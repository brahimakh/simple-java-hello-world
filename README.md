# Résonance industrielle

Un jeu incremental solo en français ou en anglais : construire des chaînes de procédés, comprendre leurs interactions et réutiliser ses inventions. Tout reste sur le PC, sans compte ni service distant.

## Jouer sous Windows

Dossier : **E:\ChatGPTWork\Resonance-Industrielle**.

1. Double-cliquez sur **Demarrer.cmd**.
2. Le navigateur ouvre **http://127.0.0.1:4317**.
3. Gardez la fenêtre du lanceur ouverte. La première chaîne produit déjà ; explorez les cartes et leurs règles.

Les fichiers compilés sont déjà présents dans `dist/`. Node.js 24 ou plus récent est nécessaire. Le lanceur utilise Node dans le PATH, ou le runtime Codex déjà présent sur ce PC. Il n’installe aucun outil système. Si Node manque, installer sa version LTS depuis https://nodejs.org/ est la seule préparation nécessaire pour jouer.

Le jeu compilé fonctionne sans Internet, CDN, API ou clé. Il n’est pas nécessaire d’installer les dépendances pour jouer. La première installation des outils de développement peut demander Internet.

Le port 4317 et l’adresse 127.0.0.1 restent fixes pour conserver l’origine des sauvegardes. Si le jeu fonctionne déjà, le lanceur réutilise son serveur. Si une autre application occupe le port, il le signale et ne change pas silencieusement de port.

## Prendre en main l’atelier

Depuis la version 0.2, un panneau **Premiers pas** explique votre rôle et accompagne cinq gestes : inspecter l’injecteur, inspecter la presse, choisir un module, observer son effet et enregistrer une configuration. Il suit les actions réellement effectuées. Il est facultatif ; **Explorer librement** le masque, et la rubrique **Premiers pas** permet de le reprendre ou de le revoir. Aucun achat automatique, cadeau ou changement d’équilibrage n’est ajouté par le guide.

La rubrique **Premiers pas** explique également la boucle globale, les différences entre stock, production cumulée et débit, les messages d’attente et les prochains déblocages. Un petit lexique anglais/français aide à retrouver les termes du jeu.

Le sélecteur **Langue / Language**, en haut de l’écran, permet de passer à **English** à tout moment. Les règles des machines, descriptions, expériences, messages et dialogues sont traduits ; les nombres suivent la langue choisie. Les noms que vous donnez aux configurations et inventions restent les vôtres. Le choix de langue et la progression du guide sont mémorisés localement, séparément de la sauvegarde de partie : changer de langue ne demande pas de recommencer. Ils ne sont pas transférés dans l’export JSON de partie.

Pour charger cette mise à jour dans un onglet déjà ouvert, actualisez la page. Vos anciennes sauvegardes v1 restent compatibles.

- Sélectionner une carte affiche ses règles et ses réglages. Cliquer une flèche ouvre ou ferme sa connexion.
- Ajouter un module l’insère du bon côté de la presse. Les boutons de déplacement changent l’ordre entre modificateurs compatibles.
- Les injecteurs livrent 6 ou 12 matières par demi-seconde. Les réserves, la cadence des machines et les tampons sont des contraintes distinctes.
- Le démontage rend le coût des machines et les matières internes. Un démontage attend si les réserves ne peuvent pas accueillir le remboursement.
- Une configuration conserve les plans d’une installation. La restaurer redémarre ses machines ; une invention encapsulée sur place conserve ses cycles et tampons en cours.
- À 1 000 composants cumulés : deuxième installation, encapsulation et synchroniseur. Les échanges sont automatiques ; leur commande est dans **Vue générale**.
- Le budget de construction est celui de la Fonderie, y compris pour la Serre. Les dépenses ne diminuent pas la production cumulée utilisée pour les déblocages.
- Un clic sur un stock ou le débit explique son calcul. Le pic par lot est distinct du débit moyen.

## Sauvegardes et pause

Sauvegarde locale automatique toutes les cinq secondes, plus boutons Sauver, Exporter et Importer. Les sauvegardes sont propres au navigateur et à l’adresse ci-dessus. Utiliser le même navigateur pour retrouver sa partie ; utiliser le JSON pour la transférer. Effacer les données du navigateur efface également les sauvegardes.

L’import valide la structure, les limites, les identifiants et les états internes avant remplacement, avec confirmation. La sauvegarde précédente valide est conservée. Un fichier illisible ne devient jamais la copie de secours. Si aucune copie valide n’est disponible, la sauvegarde automatique est suspendue et l’export permet de conserver le fichier problématique.

**Aucune progression hors ligne.** Pause explicite en haut à droite. Un onglet masqué ne simule pas ; à son retour, aucun temps n’est rattrapé. Une suspension de plus d’une seconde est ignorée. Un navigateur ne garantit pas une exécution permanente en arrière-plan. Fermer la page arrête sa simulation ; fermer le lanceur arrête le serveur.

## Développement et vérification

TypeScript 5.9.3, interface DOM sans framework, serveur statique Node. Les dépendances n’interviennent pas pendant le jeu. Le moteur pur, le contenu, la sauvegarde et l’interface sont séparés. Le fichier `pnpm-lock.yaml` fige le compilateur.

`Verifier.cmd` compile, contrôle le typage, exécute les tests puis régénère les mesures. Si le compilateur manque : `pnpm install --frozen-lockfile` dans le dossier du projet, ou `npm install` si seul npm est disponible (le verrouillage de référence reste celui de pnpm). Aucun changement de politique PowerShell n’est requis.

Commandes équivalentes dans le dossier du projet :

```text
node node_modules/typescript/bin/tsc --noEmit
node node_modules/typescript/bin/tsc
node scripts/build.mjs
node --test --test-isolation=none tests/*.test.mjs
node scripts/balance.mjs
node scripts/server.mjs --open
```

Le moteur de test reste dans le processus courant pour fonctionner dans l’environnement Windows restreint. Les accélérations de simulation sont uniquement dans les tests et le script de mesures, jamais dans les commandes de la partie normale.

## État du prototype

Huit familles de modules, deux installations, plans de configurations, encapsulation, six expériences, objectif final et poursuite libre. L’atelier utilise des chaînes linéaires parallèles plutôt qu’un graphe de routage arbitraire. Pas de prestige, de son ou de récursion d’inventions.

Compilation, typage, **37 tests automatisés** et mesures de progression vérifiés. Les nouveaux tests exécutent les boutons, formulaires et changements de langue dans un DOM simulé avec Happy DOM, dépendance de développement uniquement. Ils couvrent le parcours guidé, les pages anglaises, les règles chiffrées bilingues, les noms personnels, la mémorisation des préférences et la conservation de la sauvegarde.

**Le parcours visuel dans un vrai navigateur reste à confirmer** : lors de la première version, le navigateur intégré refusait l’adresse locale et l’outil Windows a arrêté l’essai faute d’identification fiable de l’URL. Les tests DOM ajoutés ne mesurent pas la mise en page sur votre écran. Aucun outil supplémentaire n’est requis pour jouer à la version compilée.

La cible de découverte de 2–4 heures n’est pas atteinte comme résultat établi : une politique automatisée simple termine en environ 45 minutes, et des assemblages plus puissants peuvent aller plus vite. Aucun playtest humain de plusieurs heures n’est revendiqué. Voir `DESIGN.md`, `BALANCE.md` et `PASSATION.md` pour les hypothèses et la suite.
