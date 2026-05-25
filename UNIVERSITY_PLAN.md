# 🎓 Audit & Plan d'Action : Portail University (AdminUL)

Ce document définit les fonctionnalités pour la validation de terrain des étudiants.

---

## 🔍 1. Audit des Gaps (Besoins vs État Actuel)

| Problème | Besoin Métier | Statut Backend |
| :--- | :--- | :--- |
| **Validation Présence**| Marquer l'étudiant comme inscrit physiquement. | ✅ `estInscritDefinitif` OK. |
| **Recouvrement** | Voir les bourses bloquées pour payer les frais. | ✅ `PretScolarite` OK. |
| **Consultation Dossier**| Voir les scans KYC (Certificat, ID). | ✅ `DocumentEtudiant` OK. |

---

## 🛠️ 2. Plan d'Amélioration

### A. Inscriptions Définitives (`univ-registrations`)
*   **Action** : Liste avec case à cocher massive pour valider la présence après paiement des droits univ.
*   **Impact** : Seuls les "Inscrits Définitifs" peuvent recevoir la bourse GNS.

### B. Dashboard Local (`univ-dashboard`)
*   **Action** : Afficher le montant total des frais de scolarité déjà encaissés par l'Univ via StudCash.
*   **Alerte** : Liste des étudiants dont le KYC est rejeté par la DBS.
