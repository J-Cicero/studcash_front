import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ParametresService, Parametre } from '../../../core/services/parametres.service';
import { ScolariteYearService, ScolariteYear } from '../../../core/services/scolarite-year.service';
import { AuthService } from '../../../core/services/auth.service';
import { LoginResponse } from '../../../core/models/auth.model';

@Component({
  selector: 'app-parametres-dbs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './parametres.component.html',
  styleUrls: ['./parametres.component.scss']
})
export class ParametresDbsComponent implements OnInit {
  parametres: Parametre[] = [];
  activeYear: ScolariteYear | null = null;
  currentUser: LoginResponse | null = null;

  isLoading = false;
  successMessage = '';
  errorMessage = '';

  editingParam: Parametre | null = null;
  editValue = '';

  constructor(
    private parametresService: ParametresService,
    private scolariteYearService: ScolariteYearService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    
    // Load active school year
    this.scolariteYearService.getActiveYear().subscribe({
      next: (year) => {
        this.activeYear = year;
      },
      error: (err) => {
        console.error('Erreur chargement année scolaire active', err);
      }
    });

    // Load DBS parameters
    this.parametresService.getParametresDbs().subscribe({
      next: (res) => {
        this.parametres = res.content || [];
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors du chargement des paramètres DBS.';
        this.isLoading = false;
      }
    });
  }

  startEdit(param: Parametre) {
    this.editingParam = param;
    this.editValue = param.valeurParametre;
    this.successMessage = '';
    this.errorMessage = '';
  }

  cancelEdit() {
    this.editingParam = null;
    this.editValue = '';
  }

  saveEdit() {
    if (!this.editingParam) return;
    this.isLoading = true;

    const updatedParam: Parametre = {
      ...this.editingParam,
      valeurParametre: this.editValue,
      estActif: true
    };

    this.parametresService.saveParametreDbs(updatedParam).subscribe({
      next: (res) => {
        this.successMessage = 'Paramètre mis à jour avec succès.';
        this.editingParam = null;
        this.loadData();
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors de la sauvegarde.';
        this.isLoading = false;
      }
    });
  }
}

