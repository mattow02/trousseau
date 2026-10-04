# Trousseau

Appli iOS personnelle de Matteo : un accueil de « clés » (une par site web),
et chaque clé ouvre son site **dans l'appli**, sans passer par Safari, en
restant connecté grâce aux cookies. Usage strictement perso, pas d'App Store.

- Dépôt public : `github.com/mattow02/trousseau`, branche `main`.
- Démarré le 3 octobre 2026.

## Pile, et pourquoi

- **Expo SDK 57 / React Native 0.86, TypeScript.** Matteo n'a pas de Mac :
  tout se code sous Linux. Pas de Swift natif, qui exige Xcode.
- **`react-native-webview`** pour les pages. Vérifié dans son code natif iOS
  (`apple/RNCWebViewImpl.m`) :
  - stockage WebKit **persistant** par défaut (`defaultDataStore`, sauf
    `incognito`) : les cookies, donc les connexions, survivent au redémarrage ;
  - sans `onOpenWindow`, un lien `target="_blank"` se charge dans la même vue :
    on reste dans l'appli. Ne pas ajouter `onOpenWindow` sans y repenser.
- **`expo-web-browser`** (SFSafariViewController) pour le mode « Safari intégré ».
- **AsyncStorage** pour la liste des sites.

## Distribution : la « voie B », sans compte Apple payant

Choix de Matteo, pour avoir une vraie icône sans payer 99 $/an.

1. `.github/workflows/ipa.yml` compile une **.ipa non signée** sur une machine
   macOS de GitHub (gratuit car dépôt public). Déclenchement : à la main
   (`gh workflow run ipa`) ou par un tag `v*`, qui publie aussi une release.
2. **SideStore** sur l'iPhone signe l'ipa avec un **compte Apple gratuit** et
   renouvelle la signature tout seul, tous les 7 jours, sans ordinateur.

Limites assumées : 3 applis actives par compte gratuit (SideStore en compte une),
10 identifiants d'appli par semaine, et Apple peut casser SideStore avec une
mise à jour d'iOS. Repli : la « voie A », Expo Go + EAS Update, même code.

**Piège Xcode 16+** : `xcodebuild archive` avec `CODE_SIGNING_ALLOWED=NO` ne
produit plus de `.app`. Le workflow fait un `build` et emballe le `.app` à la
main dans `Payload/`.

## Les sites Google

Google bloque sa page de connexion dans les WebViews (403
`disallowed_useragent`). Changer l'identifiant de navigateur pour se faire
passer pour Safari viole ses conditions et casse sans prévenir : **refusé**.
À la place, chaque site a un `mode` :

- `webview` : notre lecteur (pastilles, barre du bas, pages gardées en mémoire) ;
- `safari` : SFSafariViewController, que Google accepte. Cookies persistants
  gardés ; les cookies de *session* sont perdus quand l'appli passe en arrière-plan.

## Architecture

```
App.tsx                 assemblage : état des onglets, formulaire, Safari intégré
src/coeur/              logique pure, testée, sans React ni stockage
  site.ts               type Site { id, nom, url, mode }
  adresse.ts            normaliser une saisie, domaine, initiales
  trousseau.ts          ajouter, modifier, supprimer, déplacer
  onglets.ts            sites ouverts en mémoire (au plus 4, LRU) et site actif
src/stockage/           seul endroit qui touche AsyncStorage
  format.ts             sauvegarde versionnée ; « illisible » distinct de « vide »
  depot.ts              lecture/écriture ; met de côté une sauvegarde abîmée
  useSites.ts           hook : n'écrit jamais avant d'avoir lu
src/interface/          écrans et composants, direction D
outils/icone.py         régénère assets/icon.png
```

Décisions qui ne se devinent pas :

- **Pas de `new URL()` dans `adresse.ts`.** Sous React Native, `URL` est une
  imitation à base de regex (`Libraries/Blob/URL.js`) : elle ne lève jamais
  d'erreur, ne met pas l'hôte en minuscules, et son `hostname` ignore « HTTPS ».
  Les tests (Node) passeraient alors que l'iPhone se tromperait. Un test retire
  `URL` de l'environnement pour garantir qu'on n'en dépend pas.
- **Les pages ouvertes restent montées** (cachées par `display: none`), pour que
  les pastilles basculent sans recharger. Plafond de 4 (`MAX_OUVERTS`), car iOS
  tue les processus WebKit quand la mémoire manque ; `onContentProcessDidTerminate`
  recharge alors la page.
- **`source` de la WebView mémorisée** (`useMemo`) : un nouvel objet `source`
  à chaque rendu rechargerait la page.
- **Pas d'Expo Router** malgré la recommandation d'Expo : il n'y a qu'un écran
  et un lecteur superposé qui doit rester monté. Une navigation par pile
  démonterait les WebViews.
- **Réordonner** : flèches en mode modification (appui long ou crayon), pas de
  glisser-déposer, qui demanderait reanimated et gesture-handler pour peu de gain.

## Design : direction D

Validée le 3 octobre 2026 sur une maquette privée (le lien est dans la mémoire
locale, pas ici : dépôt public) : les courbes du
« Trousseau » (plaques arrondies, initiales, anneau de clé, pastilles) avec les
couleurs de la « Grille » (blanc, noir `#111111`, un seul bleu `#1F3BFF`).
Police Bricolage Grotesque (400, 600, 800, importées une par une).
Code couleur des plaques : **bleu** = premier site (grande plaque), **noir** =
mode Safari intégré, **blanc** = les autres. Anneau plein = page en mémoire.
Jetons dans `src/interface/theme.ts`.

## Commandes

```bash
npm run verifier            # tsc + jest : doit être vert avant tout push
npx expo start              # développement : scanner le QR code avec Expo Go
npx expo export --platform ios --output-dir /tmp/x   # prouve que le bundle iOS compile
npx expo-doctor             # santé des dépendances
gh workflow run ipa         # compile l'ipa sur macOS (≈ 15 à 25 min)
git tag v1.0.0 && git push --tags   # compile ET publie une release avec l'ipa
python3 outils/icone.py     # régénère l'icône
```

`npx expo install <paquet>`, jamais `npm install`, pour des versions compatibles
avec le SDK. Le hook RTK réécrit `npx` : passer par `rtk proxy npx ...` si une
commande `npx` échoue avec « Unknown command ».

## Conventions

- Code et commentaires en **français** ; commits en **anglais**, Conventional Commits.
- Aucune trace d'IA dans le dépôt public (ni `Co-Authored-By`, ni tiret cadratin).
- Tout comportement subtil est gardé par un test dans `__tests__/`.

## État

| Phase | Contenu | État |
|---|---|---|
| 0 | Cadrage, maquette, dépôt | fait |
| 1 | Cœur pur testé (53 tests) | fait |
| 2 | Interface direction D | codée, bundle iOS vérifié ; **pas encore vue sur un vrai iPhone** |
| 3 | Cookies et Google sur les vrais sites de Matteo | à faire avec lui |
| 4 | Ipa compilée par GitHub Actions | fait le 4 octobre 2026 : Xcode 26.6, 7,5 Mo, `main.jsbundle` présent ; release `v0.1.0` |
| 5 | Installation SideStore avec **iloader** (AppImage Linux, github.com/nab138/iloader), compte Apple gratuit | à faire avec Matteo, iPhone branché |
| 6 | Note dans le vault, vérification à J+8 de la signature renouvelée | à faire |
