# Résonance industrielle

Jeu incrémental de laboratoire : combinez des machines, mesurez, inventez. Jouable sur ordinateur, sur mobile (version web installable) et sur Android (APK).

Tout le projet est dans [`Resonance-Industrielle/`](Resonance-Industrielle/) : voir son [README](Resonance-Industrielle/README.md) pour jouer, développer et vérifier.

Workflows GitHub Actions (`.github/workflows/`) :
- `resonance-pages.yml` publie la version web sur GitHub Pages ;
- `resonance-android.yml` construit l’APK et le publie en release (`resonance-vX.Y.Z`) si les secrets de signature sont configurés.
