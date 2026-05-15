import { Routes } from '@angular/router';
import { LoginWebComponent } from './features/auth/login-web/login-web.component';
import { MainLayoutComponent } from './core/layout/main-layout/main-layout.component';
import { DashboardUlComponent } from './features/portail-ul/dashboard-ul/dashboard-ul.component';
import { PaymentHistoryComponent } from './features/portail-ul/payment-history/payment-history.component';
import { ProfileComponent } from './features/portail-ul/profile/profile.component';

export const routes: Routes = [
  { path: 'login', component: LoginWebComponent },
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
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];
