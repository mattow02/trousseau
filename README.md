# Trousseau

Un trousseau de clés pour mes sites web. Chaque clé ouvre son site directement
dans l'appli, sans passer par Safari, et la session reste ouverte d'une fois
sur l'autre.

- Accueil en plaques, à ajouter, renommer, réordonner et retirer depuis l'appli.
- Les pages ouvertes restent en mémoire : une rangée de pastilles passe de
  l'une à l'autre sans rien recharger.
- Les sites qui se connectent avec Google s'ouvrent dans le Safari intégré
  d'iOS, que Google accepte.

Appli iOS en React Native (Expo SDK 57), pour un usage personnel.

## Installer sur un iPhone, sans Mac ni compte développeur payant

1. Récupérer `Trousseau.ipa` dans les
   [releases](https://github.com/mattow02/trousseau/releases), ou dans les
   artefacts du workflow `ipa`.
2. L'installer avec [SideStore](https://sidestore.io), qui la signe avec un
   compte Apple gratuit et renouvelle la signature tout seul.

## Développer

```bash
npm install
npm run verifier     # types et tests
npx expo start       # puis scanner le QR code avec Expo Go
```
