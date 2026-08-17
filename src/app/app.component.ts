import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';
import { ConfirmDialogComponent } from './shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ConfirmDialogComponent],
  template: `
    <router-outlet></router-outlet>
    <app-confirm-dialog></app-confirm-dialog>
  `,
})
export class AppComponent {
  title = 'studcash-front';

  constructor(private themeService: ThemeService) {
    // Le constructeur du ThemeService s'occupe d'initialiser le thème !
  }
}
