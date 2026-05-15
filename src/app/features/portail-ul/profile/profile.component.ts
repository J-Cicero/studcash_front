import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {
  agent = {
    nom: 'Jean Dupont',
    email: 'jean.dupont@ul.tg',
    universite: 'Université de Lomé',
    service: 'Service de la Comptabilité',
    role: 'Agent Principal (UL-042)',
    derniereConnexion: '24 Mai 2026 à 08:45'
  };

  constructor(private router: Router) {}

  changePassword() {
    console.log('Requesting password change...');
  }

  logout() {
    console.log('Déconnexion depuis le profil...');
    this.router.navigate(['/login']);
  }
}
