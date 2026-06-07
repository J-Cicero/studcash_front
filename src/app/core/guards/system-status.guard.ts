import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SystemStatusService } from '../services/system-status.service';
import { map } from 'rxjs/operators';

export const systemStatusGuard: CanActivateFn = (route, state) => {
  const statusService = inject(SystemStatusService);
  const router = inject(Router);

  return statusService.getStatus().pipe(
    map(status => {
      // Si les paiements sont désactivés et que l'utilisateur essaie d'accéder à une route de paiement
      if (!status.paymentEnabled && state.url.includes('paiement')) {
        router.navigate(['/dashboard']); // Redirection vers une page sûre
        return false;
      }
      return true;
    })
  );
};
