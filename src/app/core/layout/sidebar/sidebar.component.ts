import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  readonly navigation: NavItem[] = [
    { 
      label: 'Tableau de bord', 
      route: '/ul/dashboard', 
      icon: 'M4 4h7v7H4V4zm9 0h7v4h-7V4zM13 10h7v10h-7V10zM4 13h7v7H4v-7z' 
    },
    { 
      label: 'Liste des Paiements', 
      route: '/ul/historique', 
      icon: 'M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2zm0 4h16V8H4v2zm0 4h6v2H4v-2z' 
    },
    { 
      label: 'Mon Profil', 
      route: '/ul/profil', 
      icon: 'M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z' 
    }
  ];

  constructor(private router: Router) {}

  onLogout() {
    console.log('Déconnexion en cours...');
    this.router.navigate(['/login']);
  }
}
