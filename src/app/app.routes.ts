import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'admin',
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
        path: 'universities',
        loadComponent: () => import('./features/gns-admin/pages/gns-admin-universities/gns-admin-universities.component').then(m => m.GnsAdminUniversitiesComponent)
      },
      {
        path: 'students',
        loadComponent: () => import('./features/gns-admin/pages/gns-admin-students/gns-admin-students.component').then(m => m.GnsAdminStudentsComponent)
      },
      {
        path: 'transactions',
        loadComponent: () => import('./features/gns-admin/pages/gns-admin-transactions/gns-admin-transactions.component').then(m => m.GnsAdminTransactionsComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/gns-admin/pages/gns-admin-settings/gns-admin-settings.component').then(m => m.GnsAdminSettingsComponent)
      }
    ]
  }
];
