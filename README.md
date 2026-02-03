# The Reset Challenge

**The Reset Challenge** est un jeu de précision et de tension extrême développé dans le cadre d'un test des capacités de création d'applications de **Google AI Studio**.

## Le Concept

Le but est simple mais exigeant : vous disposez d'un minuteur de **10 secondes** qui tourne en continu. Votre mission est d'attendre le dernier moment possible avant qu'il n'atteigne zéro pour appuyer sur le bouton central et le réinitialiser.

Vous avez un total de **10 essais** pour accumuler le score le plus élevé possible. Si le minuteur atteint 0.0s, la session s'arrête immédiatement et vous avez perdu.

## Système de Scoring

Le score récompense votre prise de risque :
- **Zone de Score (80%+)** : Vous commencez à gagner des points à partir de 8 secondes écoulées.
- **Bonus Précision (98%+)** : Si vous réinitialisez entre 0.1s et 0.2s restantes, vous obtenez un bonus de **+50 points**.
- **Bonus Perfect (99%+)** : Si vous réinitialisez à exactement 0.1s restantes, vous obtenez le bonus suprême de **+100 points**.

## Build & Installation

Pour générer l'application dans le dossier `dist` :

1. Installez les dépendances :
   ```bash
   npm install
   ```
2. Lancez le build :
   ```bash
   npm run build
   ```
Les fichiers prêts pour la production seront générés dans le dossier `dist/`.

## Retours Visuels
Le jeu propose une expérience immersive avec :
- Des **flashes d'écran** lors des coups critiques.
- Des **labels flottants** (PRECISION!, PERFECT!) pour confirmer vos exploits.
- Un bouton dynamique qui change de couleur et d'intensité selon l'urgence du timer.

---
*Développé avec React, Tailwind CSS et l'assistance de Google AI Studio.*
