# `univ-portal` - Matrice Rôle -> Pages -> Actions -> API

Ce document formalise l'approche retenue pour le portail université : on part du rôle connecté, puis on en déduit ce qui doit être affiché, ce qui est modifiable, et quels appels API sont nécessaires.

## Rôle cible

- `UNIVERSITY_ADMIN`
- Route protégée côté frontend: `/univ`
- Source d'identité côté frontend: `AuthService.currentUserRole()` et `AuthService.universityId()`

## Pages visibles

| Page | Route | Objectif | Données principales | Actions visibles |
| --- | --- | --- | --- | --- |
| Dashboard | `/univ/dashboard` | Vue de synthèse | université, KPI, paiements récents, inscriptions rejetées, prêts | rafraîchir, aller vers inscriptions/transactions |
| Inscriptions | `/univ/registrations` | Suivi des dossiers | inscriptions annuelles, documents, statut définitif | filtrer, sélectionner, valider définitivement, consulter documents |
| Étudiants | `/univ/students` | Annuaire étudiant | liste étudiants, KYC, solde, statut actif | dépôt en masse, consultation |
| Portefeuille | `/univ/portfolio` | Flux financier de l'université | wallet, versements, historique | demander un virement, consulter les dotations |
| Transactions | `/univ/transactions` | Historique des paiements | paiements liés à l'université | consulter, filtrer, paginer |
| Paramètres | `/univ/settings` | Profil et contexte | profil utilisateur, université courante | lecture seule pour l'instant |

## Formulaires et logique UI

| Page | Formulaire / zone | Affichage déduit du rôle | Remarque |
| --- | --- | --- | --- |
| Dashboard | Aucun formulaire | Carte KPI + activité récente | pure consultation |
| Inscriptions | Filtres niveau/bourse | filtre les dossiers de l'université connectée | actions seulement sur les dossiers de son université |
| Étudiants | Dépôt en masse | réservé à l'établissement connecté | le fichier importe uniquement les étudiants de cette université |
| Portefeuille | Demande de virement | visible si le rôle est `UNIVERSITY_ADMIN` | action métier, pas un simple bouton décoratif |
| Paramètres | Profil | lecture seule | modification centrale gérée par l'administration |

## Endpoints backend utilisés

| Domaine | Endpoint | Usage |
| --- | --- | --- |
| Université | `GET /api/universites/{trackingId}` | charger les informations de l'établissement connecté |
| Université | `GET /api/universites/{trackingId}/summary-stats` ou équivalent service côté front | stats synthétiques pour le dashboard |
| Paiements | `GET /api/paiements/universite/{trackingId}` | historique des paiements |
| Scolarité | `GET /api/scolarite/universite/{trackingId}` | prêts en attente / suivi des avances |
| Étudiants | `GET /api/students/universite/{trackingId}` | liste des étudiants de l'université |
| Inscriptions | `GET /api/inscriptions/universite/{trackingId}` | dossiers d'inscription annuels |
| Documents | `GET /api/documents/inscription/{trackingId}` | pièces jointes d'un dossier |

## Règles d'affichage par rôle

- Si le rôle n'est pas `UNIVERSITY_ADMIN`, la route `/univ` ne doit pas être accessible.
- L'identifiant université est dérivé du contexte d'authentification et non saisi manuellement.
- Les écrans `univ-portal` doivent toujours filtrer sur l'université courante.
- Les formulaires ne doivent exposer que les actions autorisées à l'admin universitaire.

## Dark mode

- Le portail réutilise `ThemeToggleComponent`.
- Clé localStorage: `univ-portal-theme`
- Classe body/shell: `univ-portal-dark`
