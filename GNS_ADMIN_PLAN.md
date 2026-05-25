# 🛡️ Audit & Plan d'Action : Portail GNS Admin (Gouvernance)

Ce document définit les fonctionnalités stratégiques pour le pilotage du réseau StudCash.

---

## 🔍 1. Audit des Gaps (Besoins vs État Actuel)

| Problème | Besoin Métier | Statut Backend |
| :--- | :--- | :--- |
| **Gestion du Temps** | Ouvrir/Fermer les cycles académiques proprement. | ✅ `ScolariteYear` est prêt. |
| **Versement Massif** | Lancer des milliers de bourses en 1 clic. | ✅ `Versement` & `Wallet` OK. |
| **Plafonds Boutiques**| Ajustement dynamique des quotas de vente. | ✅ `Wallet.plafond` OK. |
| **Monitoring** | Voir les alertes de fraude ou d'épuisement. | ⚠️ Manque `AlerteSysteme` entity. |

---

## 🛠️ 2. Plan d'Amélioration

### A. Cycle de Vie Académique (`admin-cycles`)
*   **Action** : Interface pour créer l'année (ex: 2026-2027) et bouton "Ouvrir la session".
*   **Contrainte** : Automatiquement fermer l'ancienne session.

### B. Moteur de Versement (`admin-mass-actions`)
*   **Action** : Sélecteur d'Université + Montant Fixe -> Simulation du coût total -> Confirmation par PIN Admin.
*   **Attributs** : Utilise le `montantBourseAssocie` défini par la DBS pour automatiser le calcul.

### C. Surveillance des Quotas (`admin-wallets`)
*   **Action** : Barre de progression visuelle sur chaque boutique.
*   **Ajustement** : Champ de saisie pour augmenter le plafond sans recréer le wallet.
