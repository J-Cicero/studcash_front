import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UniversiteService } from '../../../core/services/universite.service';

@Component({
  selector: 'app-universites',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './universites.component.html',
  styleUrl: './universites.component.scss'
})
export class UniversitesComponent implements OnInit {
  universites: any[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(private universiteService: UniversiteService) {}

  ngOnInit(): void {
    this.loadUniversites();
  }

  loadUniversites(): void {
    this.isLoading = true;
    // Utiliser getSummaryStats car ça nous donne probablement le nom et des stats, ou findAll()
    this.universiteService.findAll(0, 100).subscribe({
      next: (res) => {
        this.universites = res.content || [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement universités:', err);
        this.errorMessage = 'Impossible de charger la liste des universités.';
        this.isLoading = false;
      }
    });
  }
}

