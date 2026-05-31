import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'admin-gns',
    loadComponent: () => import('./layouts/dashboard-layout/dashboard-layout.component').then(m => m.DashboardLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin-gns/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'parametres',
        loadComponent: () => import('./features/admin-gns/parametres/parametres.component').then(m => m.ParametresGnsComponent)
      },
      {
        path: 'inscriptions',
        loadComponent: () => import('./features/admin-gns/inscriptions/inscriptions.component').then(m => m.InscriptionsComponent)
      },
      {
        path: 'versements',
        loadComponent: () => import('./features/admin-gns/versements/versements.component').then(m => m.VersementsComponent)
      },

      {
        path: 'transactions',
        loadComponent: () => import('./features/admin-gns/transactions/transactions.component').then(m => m.TransactionsComponent)
      },
      {
        path: 'utilisateurs',
        loadComponent: () => import('./features/admin-gns/utilisateurs/utilisateurs.component').then(m => m.UtilisateursComponent)
      },
      {
        path: 'carte-boutiques',
        loadComponent: () => import('./features/admin-gns/boutiques-map/boutiques-map.component').then(m => m.BoutiquesMapComponent)
      },
      {
        path: 'universites',
        loadComponent: () => import('./features/admin-gns/universities/universities.component').then(m => m.UniversitiesComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent)
      }
    ]
  },
  {
    path: 'admin-dbs',
    loadComponent: () => import('./layouts/dbs-layout/dbs-layout.component').then(m => m.DbsLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin-dbs/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'parametres',
        loadComponent: () => import('./features/admin-dbs/parametres/parametres.component').then(m => m.ParametresDbsComponent)
      },
      {
        path: 'etudiants',
        loadComponent: () => import('./features/admin-dbs/etudiants/etudiants.component').then(m => m.EtudiantsComponent)
      },
      {
        path: 'universites',
        loadComponent: () => import('./features/admin-dbs/universites/universites.component').then(m => m.UniversitesComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent)
      }
    ]
  },
  {
    path: 'admin-university',
    loadComponent: () => import('./layouts/university-layout/university-layout.component').then(m => m.UniversityLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin-university/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'inscriptions',
        loadComponent: () => import('./features/admin-university/inscriptions/inscriptions.component').then(m => m.InscriptionsComponent)
      },
      {
        path: 'paiements',
        loadComponent: () => import('./features/admin-university/paiements/paiements.component').then(m => m.PaiementsComponent)
      },
      {
        path: 'parametres',
        loadComponent: () => import('./features/admin-university/parametres/parametres.component').then(m => m.ParametresComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent)
      }
    ]
  },
  {
    path: 'bank-portal',
    loadComponent: () => import('./layouts/bank-layout/bank-layout.component').then(m => m.BankLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/bank-portal/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'surveillance',
        loadComponent: () => import('./features/bank-portal/surveillance/surveillance.component').then(m => m.SurveillanceComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent)
      }
    ]
  }
];
