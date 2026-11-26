# Registre des failles

Chaque faille trouvée par les évals est consignée ici, **sans correction immédiate**.
Les corrections (3 au maximum) sont choisies en Semaine 5 ; les autres deviennent les « Limites connues » du README.

Gravité : **critique** (mode à 0 échec toléré : M1, M2, M5) · **majeure** (M3, M4, M6) · **mineure** (qualité perçue).

| ID | Date | Cas | Mode | Ce qui se passe | Gravité | Statut |
|---|---|---|---|---|---|---|
| F-01 | 2026-11-26 | m6-02 | M6 | Le client demande un humain. L'assistant ne peut proposer aucun canal concret : la politique (§9) ne dit pas comment joindre un conseiller. Il improvise (« page Contact »). Instable : passe ou échoue selon le run. | majeure | ouverte |
| F-02 | 2026-11-26 | m2-02 | M2 | L'assistant affirme « un seul pedido » alors qu'il ne voit que la dernière commande : il invente une certitude. Observé au run 1. | critique | ouverte |
| F-03 | 2026-11-26 | m4-*, m1-02, m1-06 | M4 | Les réponses en italien et en espagnol glissent des mots français (« commande validata », « conseiller humano »). `language-match` ne le détecte pas. | mineure | ouverte |
