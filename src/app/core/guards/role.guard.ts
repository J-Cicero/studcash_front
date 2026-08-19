import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard de rôle — protège les sections du portail.
 * Usage dans les routes :
 *   canActivate: [roleGuard('ADMIN_GNS')]
 *   canActivate: [roleGuard('ADMIN_BANQUE')]
 */
export const roleGuard = (requiredRole: string): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const user = authService.currentUserValue;

    if (!user) {
      // Pas connecté → vers login
      router.navigate(['/login']);
      return false;
    }

    if (authService.hasRole(requiredRole)) {
      return true;
    }

    // Connecté mais mauvais rôle → déconnexion propre et redirection login
    // On vide la session pour forcer une reconnexion avec le bon compte
    authService.logout();
    router.navigate(['/login']);
    return false;
  };
};
