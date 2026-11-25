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
| 2026-11-25 | `npm test` avec `--pass-with-no-tests` **temporairement** | Les 10 tests arrivent en PR#2 ; la CI doit être verte dès PR#1 | À retirer en PR#2 |
| 2026-11-25 | Modèle app par défaut : `claude-haiku-5-5` (surchargeable via `ANTHROPIC_MODEL`) | §15.4 : identifiant classe Haiku actuel | À revérifier si Anthropic publie un nouveau Haiku |
| 2026-11-25 | Comptes de démo en `@demo.test` | `.test` est un domaine réservé : aucune adresse réelle possible | — |

## Points ouverts relevés dans la spec

- §6.2, exemple `m4-02` : cite `ORD-1042`, alors que les commandes vont de `ORD-1001` à `ORD-1008`. La commande expédiée de Marco est `ORD-1004` : à corriger en écrivant les cas (Semaine 3).
