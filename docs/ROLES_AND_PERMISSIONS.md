# 🛡️ GNS - Spécifications des Rôles et Permissions

Ce document résume l'architecture des permissions et les responsabilités des 4 acteurs majeurs de la plateforme GNS (Global Neo-Scholarship).

---

## 1. GNS Admin (Administration Centrale)
**Le garant du réseau financier et commercial.**
- **Vision** : Gère la "tuyauterie" financière.
- **Actions clés** : 
  - Crée les universités et les configure.
  - Crée les Boutiques (Réseau de vente) et injecte l'argent.
  - Gère les années de scolarité.
- **Différence clé** : Vue globale sur tout le système GNS.

---

## 2. University Admin (AdminUL)
**Le gestionnaire de terrain.**
- **Vision** : Fait le pont entre le monde académique (l'université) et le système financier StudCash.
- **Entité Cœur** : `InscriptionAnnuelle` (Attribut clé : `estInscritDefinitif`).
- **Actions clés** :
  - **Validation Physique** : Transforme une "inscription théorique" en une "inscription réelle".
  - **Surveillance** : Surveille les étudiants de *son* établissement.
  - **Suivi des Prêts** : Suit l'argent avancé par GNS pour payer les frais.
- **Différence clé** : L'Admin UL gère l'humain. Il vérifie que l'étudiant est bien inscrit physiquement. Accès restreint aux seules données de son université.

---

## 3. DBS Admin (Direction des Bourses)
**Le garant de la politique sociale.**
- **Vision** : Configure les "cerveaux" du système et supervise la validation automatique faite par l'IA Gemini.
- **Entité Cœur** : `RegleBourseDbs`.
- **Actions clés** :
  - **Configuration** : Définit les critères d'éligibilité nationaux.
  - **ValiStudCashdation Dossiers** : Passe le statut de l'inscription de `EN_ATTENTE` à `VALIDEE` ou `REJETEE` en s'appuyant sur les scores de fiabilité IA (0-100%).
- **Différence clé** : Gère l'éligibilité sociale et l'automatisation IA avant que l'université ne confirme l'inscription.

---

## 4. Bank Operator (Banque - UTB, Orabank, etc.)
**Le gardien du dernier kilomètre.**
- **Vision** : Liquide la bourse (verse à l'étudiant ce qu'il n'a pas encore dépensé via StudCash).
- **Entité Cœur** : `BanqueEtudiant` (Attribut clé : `virementEffectue`).
- **Actions clés** :
  - **Guichet Liquidation** : Calcule `Bourse Totale - Dépenses StudCash = Reste à virer`.
  - **Validation Mandats** : Contrôle les "Souches Tamponnées" (mandats de paiement).
- **Différence clé** : C'est le seul acteur qui n'utilise pas le Wallet StudCash pour sortir l'argent. Il utilise le système de la banque, puis clique sur "Virement Effectué" pour informer GNS.

---

## 💡 Résumé du Workflow de Validation

1. **Création & Injection** ➡️ `GNS Admin` (Prépare le terrain et les finances).
2. **Éligibilité & IA** ➡️ `DBS Admin` (Valide le droit à la bourse via les critères).
3. **Confirmation Physique** ➡️ `University Admin` (Valide l'inscription réelle et libère les fonds).
4. **Liquidation Finale** ➡️ `Banque` (Clôture l'année en versant le reste de la bourse).
