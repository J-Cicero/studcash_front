# Description des Interfaces Web (GNS Front)

L'application web GNS (Global Network System) est principalement structurée autour de deux portails : un **Portail Administrateur GNS** et un **Portail Bancaire**.

## 1. Pages d'Authentification
* **`/login`** : Page de connexion permettant aux utilisateurs (administrateurs, banquiers) de s'authentifier. Fait appel au service d'authentification (`AuthService`).
* **`/register`** : Page d'inscription (potentiellement pour de nouveaux administrateurs ou partenaires). Fait appel au service d'inscription.

## 2. Portail Administrateur GNS (`/admin-gns`)
Ce portail est destiné aux administrateurs globaux du système pour gérer l'ensemble des entités (étudiants, universités, boutiques, versements).

* **`/admin-gns/dashboard`** : Tableau de bord principal. Affiche les statistiques globales (KPIs), les inscriptions récentes, les transactions. Fait appel aux services de statistiques et de reporting.
* **`/admin-gns/parametres`** : Gestion des paramètres globaux de l'application (frais, limites, configurations).
* **`/admin-gns/scolarite`** : Gestion des années de scolarité (ouverture, fermeture d'une année universitaire).
* **`/admin-gns/inscriptions`** : Gestion et validation des ninscriptions annuelles des étudiants. Fait appel au `InscriptionService`.
* **`/admin-gns/versements/etudiants`** : Suivi et gestion des versements de bourses aux étudiants. Fait appel au `VersementService` et `WalletService`.
* **`/admin-gns/versements/boutiques`** : Suivi et gestion des paiements/remboursements effectués envers les boutiques partenaires.
* **`/admin-gns/transactions`** : Historique global de toutes les transactions du système (paiements QR, virements). Fait appel au `TransactionService`.
* **`/admin-gns/utilisateurs`** : Gestion des utilisateurs du système (création, modification, blocage). Fait appel au `UserService`.
* **`/admin-gns/carte-boutiques`** : Affichage d'une carte interactive (Boutiques Map) pour localiser et gérer les boutiques partenaires. Fait appel au `BoutiqueService`.
* **`/admin-gns/universites`** : Gestion des universités partenaires (ajout, modification des cursus). Fait appel au `UniversityService`.
* **`/admin-gns/profile`** : Page de profil de l'administrateur connecté.

## 3. Portail Bancaire (`/bank-portal`)
Ce portail est dédié aux partenaires bancaires pour la gestion des flux financiers et l'audit.

* **`/bank-portal/dashboard`** : Tableau de bord de la banque, résumant les flux financiers et les demandes de cartes.
* **`/bank-portal/liquidations`** : File d'attente des liquidations (remboursements des commerçants ou versement de fonds).
* **`/bank-portal/surveillance`** : Vue générale d'audit et de surveillance des comptes.
* **`/bank-portal/surveillance/student-audit`** : Audit spécifique des comptes bancaires étudiants (vérification des soldes, fraudes).
* **`/bank-portal/surveillance/boutique-audit`** : Audit spécifique des comptes marchands / boutiques.
* **`/bank-portal/profile`** : Gestion du profil du banquier connecté.
