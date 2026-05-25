import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService, UserRole } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const expectedRoles = (route.data?.['roles'] as UserRole[] | undefined) ?? [];
  const currentRole = authService.currentUserRole();

  if (!authService.isLoggedIn() || !currentRole) {
    return router.createUrlTree(['/login']);
  }

  if (expectedRoles.length > 0 && !authService.hasRole(expectedRoles)) {
    const roleRedirect: Record<UserRole, string> = {
      ADMIN_GNS: '/admin',
      ADMIN_BANQUE: '/bank',
      ADMIN_DBS: '/dbs',
      UNIVERSITY_ADMIN: '/univ',
      ETUDIANT: '/login',
      COMMERCANT: '/login'
    };

    return router.createUrlTree([roleRedirect[currentRole as UserRole] ?? '/login']);
  }

  return true;
};
