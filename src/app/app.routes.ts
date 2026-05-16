import { Routes } from '@angular/router';
import { LoginWebComponent } from './features/auth/login-web/login-web.component';
import { LoginAdminComponent } from './features/auth/login-admin/login-admin.component';
import { MainLayoutComponent } from './core/layout/main-layout/main-layout.component';
import { AdminLayoutComponent } from './core/layout/admin-layout/admin-layout.component';
import { DashboardUlComponent } from './features/portail-ul/dashboard-ul/dashboard-ul.component';
import { PaymentHistoryComponent } from './features/portail-ul/payment-history/payment-history.component';
import { ProfileComponent } from './features/portail-ul/profile/profile.component';
import { ValidationKycComponent } from './features/admin-gns/validation-kyc/validation-kyc.component';
import { DashboardAdminComponent } from './features/admin-gns/dashboard-admin/dashboard-admin.component';
import { GestionEtudiantsComponent } from './features/admin-gns/gestion-etudiants/gestion-etudiants.component';
import { AdminSettingsComponent } from './features/admin-gns/settings/settings.component';
import { WalletManagementComponent } from './features/admin-gns/wallet-management/wallet-management.component';
import { GestionBoutiquesComponent } from './features/admin-gns/gestion-boutiques/gestion-boutiques.component';
import { BoutiqueMapComponent } from './features/admin-gns/boutique-map/boutique-map.component';

export const routes: Routes = [
  { path: 'login', component: LoginWebComponent },
  { path: 'login-admin', component: LoginAdminComponent },
  {
    path: 'ul',
    component: MainLayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardUlComponent },
      { path: 'historique', component: PaymentHistoryComponent },
      { path: 'profil', component: ProfileComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardAdminComponent },
      { path: 'kyc', component: ValidationKycComponent },
      { path: 'etudiants', component: GestionEtudiantsComponent },
      { path: 'boutiques', component: GestionBoutiquesComponent },
      { path: 'carte', component: BoutiqueMapComponent },
      { path: 'wallet', component: WalletManagementComponent },
      { path: 'parametres', component: AdminSettingsComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];


