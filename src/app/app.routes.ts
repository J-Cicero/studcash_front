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
