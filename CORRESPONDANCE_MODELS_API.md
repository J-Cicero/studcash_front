# 🗺️ Cartographie Backend ↔ Frontend StudCash

Ce document établit la correspondance entre les modèles de données Java et les portails du Frontend pour l'intégration.

---

## 🏗️ 1. Correspondance Modèles / Portails

| Portail Frontend | Modèles Backend Associés (Entités) |
| :--- | :--- |
| **GNS Admin** | `Universite`, `Boutique`, `Wallet`, `ConfigurationGns`, `Versement`, `User` (Role: ADMIN_GNS) |
| **DBS Portal** | `RegleBourseDbs`, `InscriptionAnnuelle`, `DocumentEtudiant`, `Student` |
| **Bank Portal** | `BanqueEtudiant`, `Student`, `Versement`, `DocumentEtudiant` (Type: SOUCHE_TAMPONNEE) |
| **Univ Portal** | `Universite`, `PretScolarite`, `InscriptionAnnuelle`, `UniversityWallet` |

---

## 📡 2. Fonctionnalités Exposées (Endpoints)

### A. Gestion des Bourses (VersementService)
*   **Action** : `POST /api/versements/masse/etudiants`
    *   **Entrée** : `scolariteYearTrackingId` (UUID), `montantFixe` (Decimal, optionnel).
    *   **Sortie** : Message de succès. Trace créée en DB dans la table `VERSEMENT`.
*   **Action** : `POST /api/versements/masse/boutiques`
    *   **Entrée** : `seuil` (Decimal, ex: 0.10), `montantQuota` (Decimal).
    *   **Sortie** : Message de succès.

### B. Scolarité Anticipée (ScolariteService)
*   **Action** : `POST /api/scolarite/prets`
    *   **Entrée (PretScolariteRequest)** : `studentTrackingId`, `universiteTrackingId`, `montant`.
    *   **Sortie (PretScolariteResponse)** : Objet `PretScolarite` (ID, montant, statut, date).

### C. Portail Banque (BankPortalService)
*   **GET** : `/api/bank-portal/students?bankOperatorTrackingId={id}`
    *   **Retourne** : Liste de `StudentLiquidationInfo` :
        *   `bourseTotale`, `depensesStudCash`, `resteAPayer`.
*   **Action** : `POST /api/bank-portal/students/{id}/valider-mandat?valide=true`
    *   **Entrée** : ID de l'étudiant, boolean de validation.

### D. Dossiers IA (DocumentService)
*   **GET** : `/api/students/{id}/documents`
    *   **Retourne** : Liste de documents avec `urlFichier` (Cloudinary) et `donneesExtraites` (JSON Gemini).
*   **Attributs JSON extraits** : `niveau`, `creditsTotalValides`, `moyenneBac`, `montantScolarite`, `scoreFiabilite`.

---

## 💾 3. Structure des Objets d'Entrée/Sortie (DTOs)

### Student (GET /api/students/{id})
*   **Sortie** : `nom`, `prenom`, `numEtudiantUniv`, `statutKYC`, `pinCode` (haché), `walletTrackingId`.

### Wallet (GET /api/wallets/{id})
*   **Sortie** : `solde`, `plafond`, `statutWallet` (ACTIF, BLOQUE), `typeWallet` (STUDENT, BOUTIQUE, etc.).
