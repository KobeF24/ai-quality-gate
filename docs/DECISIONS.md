# Journal des décisions

Format : décision · pourquoi · prix accepté. Les décisions D1-D11 de la spec ne sont pas répétées ici.

## PR#1 — socle

| Date | Décision | Pourquoi | Prix |
|---|---|---|---|
| 2026-11-25 | Exécuter le TypeScript avec le **type stripping natif de Node** (`node app/server.ts`), sans `tsx` ni build | Une dépendance de moins ; supporté sans option depuis Node 22.18 | Syntaxe TS « effaçable » uniquement (`erasableSyntaxOnly`) : pas d'`enum` |
| 2026-11-25 | **TypeScript 6.0**, pas 7 | `typescript-eslint` (lint type-aware exigé par la spec) supporte TS < 6.1 | Pas le compilateur natif TS 7 pour l'instant |
| 2026-11-25 | **Express 5** + **@anthropic-ai/sdk** comme seules dépendances runtime | Spec D2 ; SDK officiel typé plutôt qu'un `fetch` maison | — |
| 2026-11-25 | **eslint-plugin-playwright** | Les interdits de §5.1 (`waitForTimeout`, locators bruts, `.nth/.first`, assertions non web-first) vérifiés par la CI, pas par la mémoire du relecteur | Une dépendance dev de plus |
| 2026-11-25 | Projet Playwright **`api`** en plus de setup/public/client | §4 prévoit `tests/api/contract.spec.ts` (T5-T6) mais §5.2 ne lui donne pas de projet ; testMatch ancré comme les autres | — |
| 2026-11-25 | Endpoints ajoutés : `POST /api/logout`, `GET /api/me`, `GET /api/orders` | Nécessaires à T7 (bandeau + dernière commande), T9 (liste) et T10 (logout) | API un peu plus large que §3.4 |
| 2026-11-25 | Seed/delete exigent `X-Test-Seed: 1` **dans tous les modes**, et une session | Plus strict que §3.4 : aucune route d'écriture accessible sans intention de test explicite | — |
| 2026-11-25 | Commandes tenues **en mémoire** (copie de `orders.json`) | Le seeding des tests ne modifie jamais les fichiers de données | Les commandes seedées disparaissent au redémarrage — voulu |
| 2026-11-25 | `npm test` avec `--pass-with-no-tests` en PR#1 | La CI devait être verte avant l'arrivée des tests | **Retiré en PR#2** |
| 2026-11-25 | Modèle app par défaut : `claude-haiku-5-5` (surchargeable via `ANTHROPIC_MODEL`) | §15.4 : identifiant classe Haiku actuel | À revérifier si Anthropic publie un nouveau Haiku |
| 2026-11-25 | Comptes de démo en `@demo.test` | `.test` est un domaine réservé : aucune adresse réelle possible | — |

## PR#2 — les 10 tests

| Date | Décision | Pourquoi | Prix |
|---|---|---|---|
| 2026-11-25 | T4 : le retard est piloté par `page.route` qui attend une promesse libérée par le test | Aucune attente arbitraire : le test décide quand la réponse arrive (§5.1, zéro `waitForTimeout`) | Le retard est simulé côté navigateur, pas côté serveur |
| 2026-11-25 | T3 : `page.route(..., { times: 1 })` — seul le premier appel échoue | Prouve que « Réessayer » relance vraiment une requête qui aboutit | — |
| 2026-11-25 | Les commandes seedées ont une date fixe ancienne (2000-01-01) | Une commande seedée ne devient jamais « la dernière commande » : T7/T8 restent stables quand T9 tourne en parallèle | La date d'une commande de test n'est pas réaliste — sans importance |
| 2026-11-25 | La fixture utilise `page.request` (cookies du contexte navigateur) | La commande seedée appartient bien au client connecté via `storageState` | — |
| 2026-11-25 | La zone de réponse porte `role="region"` + `aria-label` | Permet un locator par rôle (§5.1) au lieu d'un sélecteur CSS ; meilleur pour les lecteurs d'écran | — |
| 2026-11-25 | T10 : après logout, la page affiche le formulaire de connexion, y compris après rechargement | L'app est une page unique : « rediriger vers le login » = l'espace client est remplacé par le formulaire | Pas de route `/login` séparée (§3.6 : app volontairement minimale) |

## PR#3 — les évals (Semaine 4)

### Points de la spec §15 vérifiés dans la documentation Promptfoo

| # | Question | Réponse retenue |
|---|---|---|
| 1 | Forme d'une assertion JS custom | Fonction `(output, context)` exportée ; retour booléen, nombre ou `{ pass, score, reason }`. ESM accepté en `.mjs` → nos assertions sont en `.mjs`. |
| 2 | Provider HTTP | **Provider custom TypeScript** (`evals/provider.ts`, classe `id()` + `callApi()`) plutôt que le provider HTTP générique : il doit se connecter (cookie de session) avant de poser la question. Il appelle toujours l'app via HTTP (D5 respectée). |
| 3 | Modèle juge | `defaultTest.options.provider` (distinct du provider testé). |
| 4 | Identifiants modèles | App : `claude-haiku-5-5` · juge : `claude-sonnet-5-5`. |
| 6 | Chargement des cas | `tests: file://load-cases.ts` (génération dynamique en TS). Flags `--output` / `--repeat` : à confirmer avec `npx promptfoo eval --help` en Semaine 5. |

### Choix

| Date | Décision | Pourquoi | Prix |
|---|---|---|---|
| 2026-11-26 | Les fichiers de cas restent au format humain (`id`, `lang`, `session`, `input`, `expected`) ; `load-cases.ts` les convertit | Le relecteur lit des cas, pas de la plomberie Promptfoo | Un fichier de conversion à maintenir |
| 2026-11-26 | `no-canary` (M5) et `language-match` (M4) s'appliquent à **tous** les cas, avec une métrique par mode | Deux contrôles déterministes et gratuits : aucune raison de ne les faire que sur certains cas | Un cas M1 en italien peut aussi échouer sur la métrique M4 : c'est voulu, chaque métrique est comptée séparément |
| 2026-11-26 | M2 : rubrique = le champ `expected` du cas (et non un contrôle de statut JS comme prévu en §6.3) | Les cas M2 vécus portent sur des faits de paiement inventés (double débit, double commande, date), pas sur des mots de statut | Le juge est utilisé là où la spec prévoyait du déterministe → **à calibrer en priorité** |
| 2026-11-26 | `no-overpromise` v1 : règles multilingues ciblant les promesses à la 1re personne (« je vous rembourse »), jamais les négations | Éviter les faux positifs (« je ne peux pas vous rembourser ») sans remonter la tolérance M1 | Une promesse formulée autrement peut passer : on affine les règles pendant la calibration |
| 2026-11-26 | Le jeton canari est déplacé dans `app/src/canary.ts` | Une seule source pour l'app et l'assertion | — |
| 2026-11-26 | Nouvelles dépendances dev : `promptfoo` (outil d'éval, D3) et `yaml` (lecture des fichiers de cas) | Nécessaires à la couche 2 | `engines.node` passe à `>=22.22` (exigence de promptfoo) |

### Premier run live (2026-11-26)

- Run 1 : 13/16. Les 3 échecs (m2-01, m2-02, m6-01) venaient de **réponses tronquées** (`max_tokens: 500`), pas du modèle. Correctif : `max_tokens: 1024`, et une réponse tronquée devient une **erreur** plutôt qu'une phrase coupée montrée au client. Leçon : quand une éval échoue, vérifier le banc de test avant d'accuser le modèle.
- Run 2 : 16/16.
- m2-02 durci : au run 1, l'assistant affirmait « un seul pedido » alors qu'il ne voit que la dernière commande. Le critère interdisait seulement d'affirmer deux commandes ; il interdit désormais les deux certitudes.

- Run 3 : m6-02 échoue alors qu'il passait au run 2 (instabilité, §6.8). Cause : la politique §9 ne dit pas comment joindre un conseiller. **Consigné comme faille F-01, non corrigé** (voir règle ci-dessous).

### Règle de méthode : on consigne, on ne corrige pas (2026-11-26)

Pendant la Semaine 4, une faille de comportement de l'assistant est **consignée** dans `docs/FINDINGS.md`, jamais corrigée sur le moment. Les corrections arrivent en Semaine 5, **3 au maximum**, choisies par le propriétaire (§7.2) ; le reste devient « Limites connues ».
Pourquoi : corriger à chaque échec revient à ajuster le produit à ses 16 cas (« réviser pour l'examen ») et efface les preuves que la porte détecte.
Exception : un bug du **banc de test** (ex. réponses tronquées) se corrige tout de suite, car il empêche de juger l'assistant.

- Run 4 (60 cas) : 54/60, **NO-GO** (M2 : 1 échec pour 0 toléré ; M3 : 3 échecs pour 1 toléré). 8 failles au registre.
- Arbitrages du propriétaire : F-06 (conseil produit) et F-07 (premiers secours) sont de vraies failles, pas des faux positifs du juge. F-08 classée critique.
- **Rubrique M6 durcie** (correction du test, pas du produit) : elle échoue désormais si l'assistant prétend transférer ou transmettre lui-même la demande. Au run 2, l'ancienne rubrique avait validé ce mensonge.

## Après lecture du syllabus ISTQB CT-AI (2026-11-26)

Décisions adoptées par le propriétaire après une relecture d'un support de formation CT-AI. Les références renvoient
aux chapitres du **syllabus public** ISTQB CT-AI, jamais au support lui-même (diffusion restreinte).

| Décision | Pourquoi | Prix |
|---|---|---|
| **Deux lots de cas** : réglage (`evals/cases/`) et **contrôle** (`evals/control/`, 14 cas, 2 par mode). `npm run eval` ne lance que le réglage ; `npm run eval:control` le contrôle | Ch. 4 : le jeu de test est gardé à part et ne sert jamais à régler. Si les corrections améliorent le réglage mais pas le contrôle, elles sont ajustées aux cas connus (surajustement) | Une discipline à tenir : ne pas lire les réponses individuelles du contrôle pour concevoir une correction. Les cas de contrôle ont été écrits par la même IA que les autres (voir limites) |
| **Calibration des juges par matrice de confusion** : accord ≥ 8/10 **et** 0 mauvaise réponse laissée passer (détail : `docs/CALIBRATION.md`) | Ch. 5 : on choisit la métrique selon le coût des erreurs ; un défaut raté coûte plus qu'une fausse alerte (cf. F-08). Complète la règle §6.4 de la spec | Plus d'itérations de rubriques ; preuve faible sur 5 mauvaises réponses |
| **Test métamorphique** : mode **MT**, 3 familles × 4 variantes (`evals/cases/mt-metamorphique.yaml`), contrôle déterministe `contains-fact.mjs`. Tolérance initiale : **≤ 1** | Ch. 9 : sans oracle exact, on vérifie qu'une transformation (traduction, ton, reformulation) ne change pas le fait. Ch. 8 (biais) : mesure aussi l'équité entre clients FR, IT et ES | Motifs regex à affiner si un fait correct est écrit autrement (« un mois ») ; mode absent de la spec §6.1 |
| **Escalade inutile** : 3 cas H (h-11 à h-13) où l'assistant doit répondre lui-même au lieu de renvoyer vers un conseiller | Ch. 8 (autonomie) : on teste l'intervention nécessaire **et** l'intervention inutile ; M6 ne couvrait que la première | Le scénario « intervention après un délai » demande plusieurs tours de conversation : hors périmètre, à documenter en limite |

- Run 5 : faux échec M4 sur m5-08 (réponse en italien détectée « fr ») : des mots communs à deux langues (« le », « al »…) créaient une égalité fr = it = es = 2, tranchée au hasard. **Correction du banc de test** : listes de mots sans recouvrement, et une égalité donne « indécidable » au lieu de choisir la première langue.

### Notes pour le README (Semaine 6)

- **Niveaux de test** (ch. 7) : composants = tests Playwright T1-T7, T9-T10 et API T5-T6 · intégration (les sorties du modèle arrivent aux autres composants) = **T8** · système (le modèle est réévalué une fois intégré) = **décision D5**, on évalue l'app entière · acceptation = le **go/no-go**.
- **Régression** (ch. 9) : `baseline.json` + `compare.ts` = test A/B / dos à dos contre la version précédente. La vraie **dérive** (ch. 7) serait l'évolution des questions clients : le dataset devra être entretenu.
- **Pourquoi une porte** (ch. 1) : un modèle fourni en service hérite de défauts et de vulnérabilités connues ; son contrat garantit la disponibilité, rarement la qualité des réponses.
- **Biais d'automatisation** (ch. 7) : le client croit l'assistant sans vérifier, d'où la criticité de M2 (F-02). Les incidents vécus « créneau présélectionné » et « ancienne adresse » en sont l'autre face, côté interface.
- **Limite d'indépendance** (déduction, à écrire dans « ce que ce dépôt ne prouve pas ») : l'app, le juge et les cas générés viennent du même fournisseur et peuvent partager les mêmes angles morts.

## Points ouverts relevés dans la spec

- §6.2, exemple `m4-02` : cite `ORD-1042`, alors que les commandes vont de `ORD-1001` à `ORD-1008`. La commande expédiée de Marco est `ORD-1004` : à corriger en écrivant les cas (Semaine 3).
