# StudCash (GNS) - Portail d'Administration Web

**StudCash (GNS)** est un écosystème financier et académique complet conçu pour faciliter la gestion des fonds étudiants, les paiements sur le campus et la validation des documents. Ce dépôt concerne l'application web principale, qui sert de portail d'administration global (Super Admin, Administrateur Universitaire, Administrateur Bancaire, etc.).

## 🚀 Fonctionnalités Principales

- **Gestion Multi-Rôles** : Support pour les Administrateurs GNS, Administrateurs Universitaires (UL), Administrateurs Bancaires (DBS), Étudiants et Commerçants.
- **Validation KYC (Know Your Customer)** : Système de vérification des documents (Pièce d'identité, Certificat de Scolarité, RIB, Mandats) pour valider les comptes étudiants et commerçants.
- **Gestion des Transactions & Boutiques** : Suivi en temps réel des transactions entre les étudiants et les commerçants du campus.
- **Génération de Cartes & QR Codes** : Impression et génération de cartes physiques avec QR codes pour les étudiants.
- **Interface Premium** : Design moderne avec TailwindCSS, supportant le mode sombre et des animations fluides.

## 🛠️ Stack Technique

- **Framework** : Angular 18
- **Styling** : TailwindCSS, SCSS
- **Génération de PDF & QR** : `angularx-qrcode`, `jspdf`, `html2canvas`
- **Déploiement** : Prêt pour le déploiement sur Vercel (configuration incluse via `vercel.json`)

## ⚙️ Installation & Démarrage

1. **Cloner le projet**
   ```bash
   git clone https://github.com/J-Cicero/studcash_front.git
   cd studcash_front
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Lancer le serveur de développement**
   ```bash
   npm run start
   # ou
   ng serve
   ```
   L'application sera accessible sur `http://localhost:4200/`.

## 📦 Déploiement

Ce projet est configuré pour un déploiement continu via Vercel. Les réécritures Angular (rewrites) et les en-têtes de sécurité sont automatiquement pris en charge par le fichier `vercel.json`.

---
*Développé pour simplifier l'écosystème financier des étudiants et des commerçants.*
