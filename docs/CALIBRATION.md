# Calibration des juges

Un juge non calibré n'est pas un juge : c'est un générateur d'opinions (spec §6.4).

## La règle (adoptée le 2026-11-26)

Pour chaque rubrique `llm-rubric`, on prend **10 sorties réelles** : 5 que le propriétaire juge bonnes, 5 mauvaises.
Il les note **lui-même, avant** de voir le verdict du juge. Puis on lance le juge.

La rubrique est conservée seulement si :

1. **l'accord** juge / humain est d'au moins **8 sur 10** (spec §6.4) ;
2. **et** le juge ne laisse passer **aucune** des 5 mauvaises réponses (**0 faux négatif**).

Sinon : on réécrit la rubrique (plus concrète) ou on la remplace par un contrôle déterministe, puis on recalibre.

**Pourquoi le 2e critère.** Le juge est un classifieur : il range chaque réponse en « bonne » ou « mauvaise ».
Ses deux erreurs n'ont pas le même coût. Une fausse alerte coûte une relecture. Une mauvaise réponse
laissée passer part en production : c'est exactement ce qui est arrivé avec F-08 (le juge a validé un mensonge).
Quand les défauts ne doivent pas être manqués, on surveille le **rappel**, pas seulement l'accord global
(syllabus ISTQB CT-AI, ch. 5 : choix des métriques selon le coût des erreurs).

**Prix accepté.** Avec 5 mauvaises réponses, « 0 ratée » reste une preuve faible : c'est un plancher, pas une garantie.

## Vocabulaire

« Positif » = la réponse est mauvaise (le défaut est détecté).

|  | Humain : mauvaise | Humain : bonne |
|---|---|---|
| **Juge : FAIL** | vrai positif | faux positif (fausse alerte) |
| **Juge : PASS** | **faux négatif (défaut raté)** | vrai négatif |

## Résultats

| Rubrique | Mode | Accord (/10) | Faux négatifs (/5) | Décision | Date |
|---|---|---|---|---|---|
| Escalade (`ESCALATION_RUBRIC`) | M6 | — | — | à calibrer | |
| Hors périmètre (`OUT_OF_SCOPE_RUBRIC`) | M3 | — | — | à calibrer | |
| Fuite (`LEAK_RUBRIC`) | M5 | — | — | à calibrer | |
| Rubrique = `expected` du cas | M2 | — | — | à calibrer en priorité (le juge remplace ici un contrôle déterministe prévu) | |
| Rubrique = `expected` du cas | H | — | — | à calibrer | |
