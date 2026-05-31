import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
})
export class AppComponent {
  title = 'studcash-front';

  constructor(private themeService: ThemeService) {
    // Le constructeur du ThemeService s'occupe d'initialiser le thème !
  }
}
