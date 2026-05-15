import { Routes } from '@angular/router';
import { LoginWebComponent } from './features/auth/login-web/login-web.component';
import { DashboardUlComponent } from './features/portail-ul/dashboard-ul/dashboard-ul.component';

export const routes: Routes = [
  { path: 'login', component: LoginWebComponent },
  { path: 'ul/dashboard', component: DashboardUlComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];
