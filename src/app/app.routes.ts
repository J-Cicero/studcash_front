import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'admin',
    canActivate: [authGuard],
    data: { roles: ['ADMIN_GNS'] },
    loadComponent: () => import('./features/gns-admin/layout/gns-admin-layout/gns-admin-layout.component').then(m => m.GnsAdminLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/gns-admin/pages/gns-admin-dashboard/gns-admin-dashboard.component').then(m => m.GnsAdminDashboardComponent)
      },
      {
        path: 'mass-actions',
        loadComponent: () => import('./features/gns-admin/pages/gns-admin-mass-actions/gns-admin-mass-actions.component').then(m => m.GnsAdminMassActionsComponent)
      },
      {
        path: 'wallets',
        loadComponent: () => import('./features/gns-admin/pages/gns-admin-wallets-monitor/gns-admin-wallets-monitor.component').then(m => m.GnsAdminWalletsMonitorComponent)
      },
      {
        path: 'scolarite-years',
        loadComponent: () => import('./features/gns-admin/pages/gns-admin-scolarite-years/gns-admin-scolarite-years.component').then(m => m.GnsAdminScolariteYearsComponent)
      },
      {
        path: 'universities',
        loadComponent: () => import('./features/gns-admin/pages/gns-admin-universities/gns-admin-universities.component').then(m => m.GnsAdminUniversitiesComponent)
      },
      {
        path: 'boutiques',
        loadComponent: () => import('./features/gns-admin/pages/gns-admin-boutiques/gns-admin-boutiques.component').then(m => m.GnsAdminBoutiquesComponent)
      },
      {
        path: 'students',
        loadComponent: () => import('./features/gns-admin/pages/gns-admin-students/gns-admin-students.component').then(m => m.GnsAdminStudentsComponent)
      },
      {
        path: 'paiements',
        loadComponent: () => import('./features/gns-admin/pages/gns-admin-transactions/gns-admin-transactions.component').then(m => m.GnsAdminTransactionsComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./features/gns-admin/pages/gns-admin-users/gns-admin-users.component').then(m => m.GnsAdminUsersComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/gns-admin/pages/gns-admin-settings/gns-admin-settings.component').then(m => m.GnsAdminSettingsComponent)
      }
    ]
  },
  {
    path: 'dbs',
    canActivate: [authGuard],
    data: { roles: ['ADMIN_DBS'] },
    loadComponent: () => import('./features/dbs-portal/layout/dbs-layout/dbs-layout.component').then(m => m.DbsLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dbs-portal/pages/dbs-dashboard/dbs-dashboard.component').then(m => m.DbsDashboardComponent)
      },
      {
        path: 'ia-rules',
        loadComponent: () => import('./features/dbs-portal/pages/dbs-ia-rules/dbs-ia-rules.component').then(m => m.DbsIaRulesComponent)
      },
      {
        path: 'dossiers',
        loadComponent: () => import('./features/dbs-portal/pages/dbs-dossiers/dbs-dossiers.component').then(m => m.DbsDossiersComponent)
      },
      {
        path: 'reports',
        loadComponent: () => import('./features/dbs-portal/pages/dbs-reports/dbs-reports.component').then(m => m.DbsReportsComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/dbs-portal/pages/dbs-settings/dbs-settings.component').then(m => m.DbsSettingsComponent)
      }
    ]
  },
  {
    path: 'univ',
    canActivate: [authGuard],
    data: { roles: ['UNIVERSITY_ADMIN'] },
    loadComponent: () => import('./features/univ-portal/layout/univ-layout/univ-layout.component').then(m => m.UnivLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/univ-portal/pages/univ-dashboard/univ-dashboard.component').then(m => m.UnivDashboardComponent)
      },
      {
        path: 'transactions',
        loadComponent: () => import('./features/univ-portal/pages/univ-transactions/univ-transactions.component').then(m => m.UnivTransactionsComponent)
      },
      {
        path: 'portfolio',
        loadComponent: () => import('./features/univ-portal/pages/univ-portfolio/univ-portfolio.component').then(m => m.UnivPortfolioComponent)
      },
      {
        path: 'registrations',
        loadComponent: () => import('./features/univ-portal/pages/univ-registrations/univ-registrations.component').then(m => m.UnivRegistrationsComponent)
      },
      {
        path: 'students',
        loadComponent: () => import('./features/univ-portal/pages/univ-students/univ-students.component').then(m => m.UnivStudentsComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/univ-portal/pages/univ-settings/univ-settings.component').then(m => m.UnivSettingsComponent)
      }
    ]
  },
  {
    path: 'bank',
    canActivate: [authGuard],
    data: { roles: ['ADMIN_BANQUE'] },
    loadComponent: () => import('./features/bank-portal/layout/bank-layout/bank-layout.component').then(m => m.BankLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/bank-portal/pages/bank-dashboard/bank-dashboard.component').then(m => m.BankDashboardComponent)
      },
      {
        path: 'liquidation',
        loadComponent: () => import('./features/bank-portal/pages/bank-liquidation/bank-liquidation.component').then(m => m.BankLiquidationComponent)
      },
      {
        path: 'mandats',
        loadComponent: () => import('./features/bank-portal/pages/bank-mandats/bank-mandats.component').then(m => m.BankMandatsComponent)
      },
      {
        path: 'virements',
        loadComponent: () => import('./features/bank-portal/pages/bank-virements/bank-virements.component').then(m => m.BankVirementsComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/bank-portal/pages/bank-settings/bank-settings.component').then(m => m.BankSettingsComponent)
      }
    ]
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
