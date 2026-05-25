# 🏦 Audit & Plan d'Action : Portail Banque (BankOperator)

Ce document définit les fonctionnalités pour la liquidation finale du cycle.

---

## 🔍 1. Audit des Gaps (Besoins vs État Actuel)

| Problème | Besoin Métier | Statut Backend |
| :--- | :--- | :--- |
| **Calcul du Solde** | Différence entre Bourse et Dépenses StudCash. | ✅ DTO `StudentLiquidationInfo` OK. |
| **Clôture Virement** | Marquer qu'un virement externe est fait. | ✅ `virementEffectue` (BanqueEtudiant) OK. |
| **Mandats Papier** | Valider le tampon bancaire sur le document. | ✅ `DocumentEtudiant` OK. |

---

## 🛠️ 2. Plan d'Amélioration

### A. Guichet de Liquidation (`bank-liquidation`)
*   **Action** : Affichage automatique : `Bourse (60k)` - `StudCash (42k)` = `A virer (18k)`.
*   **Validation** : Bouton "Confirmer Virement Banque" qui archive l'étudiant pour l'année.

### B. Contrôle des Preuves (`bank-mandats`)
*   **Action** : Galerie de scans "Souches Tamponnées". L'opérateur vérifie la signature et valide.
