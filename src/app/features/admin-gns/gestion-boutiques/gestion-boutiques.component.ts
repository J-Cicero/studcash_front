import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Boutique {
  id: number;
  nomBoutique: String;
  categorieShop: string;
  statutKYC: 'VALIDATED' | 'PENDING' | 'REJECTED';
  latitude: number;
  longitude: number;
  soldeRelais: number;
  status: 'ACTIF' | 'SUSPENDU';
}

@Component({
  selector: 'app-gestion-boutiques',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gestion-boutiques.component.html',
  styleUrl: './gestion-boutiques.component.scss'
})
export class GestionBoutiquesComponent implements OnInit {
  boutiques: Boutique[] = [
    { id: 1, nomBoutique: 'Cafétéria Centrale', categorieShop: 'Restauration', statutKYC: 'VALIDATED', latitude: 6.175, longitude: 1.213, soldeRelais: 150000, status: 'ACTIF' },
    { id: 2, nomBoutique: 'Photocopie Plus', categorieShop: 'Services', statutKYC: 'VALIDATED', latitude: 6.176, longitude: 1.214, soldeRelais: 45000, status: 'ACTIF' },
    { id: 3, nomBoutique: 'Librairie Universitaire', categorieShop: 'Fournitures', statutKYC: 'PENDING', latitude: 6.174, longitude: 1.212, soldeRelais: 0, status: 'SUSPENDU' },
    { id: 4, nomBoutique: 'Shop GNS', categorieShop: 'Alimentation', statutKYC: 'VALIDATED', latitude: 6.177, longitude: 1.215, soldeRelais: 890000, status: 'ACTIF' }
  ];

  constructor() {}
  ngOnInit(): void {}

  topupBoutique(b: Boutique) {
    console.log('Topup for', b.nomBoutique);
  }
}
