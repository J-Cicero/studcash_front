# ⚖️ Audit & Plan d'Action : Portail DBS (Direction des Bourses)

Ce document analyse les lacunes actuelles du portail DBS et définit les fonctionnalités critiques à ajouter pour transformer l'interface de "simple consultation" en un **véritable outil de pilotage stratégique**.

---

## 🔍 1. Audit des Gaps (Ce qui manque)

| Problème | État Actuel | Besoin Métier- **Différence clé** : Gère l'éligibilité sociale et  |
| :--- | :--- | :--- |
| **Création de Règles** | Affichage uniquement. | Bouton "Ajouter une Règle" pour définir de nouveaux critères. |
| **Gestion des Montants** | Non visible. | Associer un montant de bourse précis à chaque critère (ex: L1 Mention TB = 60k). |
| **Exports Réels** | Boutons placeholders. | Génération réelle de fichiers CSV/PDF pour les bilans budgétaires. |
| **Interaction IA** | Score passif. | Pouvoir "forcer" une validation si l'IA a un score faible mais que le document est correct. |
| **Verrouillage** | Trop rigide. | Permettre de modifier les règles pour la PROCHAINE an- **Différence clé** : Gère l'éligibilité sociale et née même si l'actuelle est ouverte. |

---

## 🛠️ 2. Plan d'Amélioration : Intelligence & Action

### A. Refonte de "Configuration IA" (`dbs-ia-rules`)
L'interface ne doit plus être une simple liste, mais un **Panel de Décision Stratégique** :
1.  **CRUD Complet** : Ajout d'un bouton `+ Nouvelle Règle`.
2.  **Sélecteur de Types** : Choisir parmi `AGE_MAX`, `MOYENNE_MIN`, `CREDITS_REQUIS`, `NIVEAU_ATTEINT`.
3.  **Liaison Financière** : Chaque règle doit avoir un champ `montantAssocie` (FCFA). C'est ce montant qui sera injecté par GNS Admin lors des versements massifs.
4.  **Gestion Multi-Années** : Permettre de préparer les règles pour `2025-2026` alors que `2024-2025` est encore active.

### B. Refonte de "Dossiers à Valider" (`dbs-dossiers`)
Transformer la vue en "Centre d'Analyse" :
1.  **Force-Validation** : Si Gemini donne 40% de fiabilité (rouge), l'Admin DBS doit pouvoir cliquer sur "Document vérifié manuellement" pour outrepasser l'IA.
2.  **Historique de Décision** : Noter *qui* a validé le dossier et à quelle heure.
3.  **Visionneuse Intégrée** : Utiliser un composant `p-image` avec zoom pour examiner les relevés de notes sans quitter l'app.

### C. Activation des "Rapports" (`dbs-reports`)
1.  **Filtres Dynamiques** : Filtrer par Université, par Sexe, et par Type de Bourse (Excellence, Sociale, Recyclage).
2.  **Estimation Budgétaire** : Afficher le montant total des bourses projeté vs le montant déjà versé.
3.  **Export Natif** : Branchement sur les librairies `jspdf` et `exceljs` pour sortir des fichiers conformes aux standards administratifs.

---

## 🗂️ 3. Modèles de Données requis (Alignment Backend)

L'entité **`RegleBourseDbs`** doit être enrichie pour supporter ces evolutions :
*   `String codeRegle` (ex: L1_EXCELLENCE)
*   `BigDecimal montantBourse` (Le montant mensuel/trimestriel généré)
*   `Integer ageMax` / `Double moyenneMin` (Paramètres flexibles)
*   `ScolariteYear anneeApplication` (Lier la règle à une année précise)

---

## 💡 Note pour la Génération (Antigravity)
> "L'Admin DBS ne doit pas subir les données, il doit les sculpter. L'interface doit permettre de répondre à la question : 'Si je monte la moyenne minimale à 12, combien d'étudiants deviennent éligibles et quel est l'impact sur mon budget ?'"

---

**Est-ce que ce plan de bataille te semble plus aligné avec ta vision ?** Si tu valides, je peux commencer par ajouter le bouton de création de règles dans `dbs-ia-rules`.
