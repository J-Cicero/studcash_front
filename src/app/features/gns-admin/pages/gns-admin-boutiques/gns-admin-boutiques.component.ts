import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoutiqueService, BoutiqueResponse } from '../../../../core/services/boutique.service';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-gns-admin-boutiques',
  standalone: true,
  imports: [CommonModule, ButtonModule, InputTextModule, FloatLabelModule, TableModule],
  templateUrl: './gns-admin-boutiques.component.html',
  styleUrl: './gns-admin-boutiques.component.scss'
})
export class GnsAdminBoutiquesComponent implements OnInit {
  boutiques = signal<BoutiqueResponse[]>([]);
  private boutiqueService = inject(BoutiqueService);

  ngOnInit() {
    this.loadBoutiques();
  }

  loadBoutiques() {
    this.boutiqueService.getAll(0, 100).subscribe({
      next: (res) => {
        this.boutiques.set(res.content || []);
      },
      error: (err) => console.error('Erreur chargement boutiques', err)
    });
  }
}
