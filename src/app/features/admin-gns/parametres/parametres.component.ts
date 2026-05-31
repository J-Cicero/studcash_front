import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ParametresService, Parametre } from '../../../core/services/parametres.service';

@Component({
  selector: 'app-parametres-gns',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './parametres.component.html',
  styleUrls: ['./parametres.component.scss']
})
export class ParametresGnsComponent implements OnInit {
  parametres: Parametre[] = [];
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  editingParam: Parametre | null = null;
  editValue = '';

  constructor(private parametresService: ParametresService) {}

  ngOnInit(): void {
    this.loadParametres();
  }

  loadParametres() {
    this.isLoading = true;
    this.parametresService.getParametresGns().subscribe({
      next: (res) => {
        this.parametres = res.content || [];
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors du chargement des paramètres.';
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
    this.parametresService.saveParametreGns(this.editingParam.nomParametre, this.editValue).subscribe({
      next: (res) => {
        this.successMessage = 'Paramètre mis à jour avec succès.';
        this.editingParam = null;
        this.loadParametres();
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors de la sauvegarde.';
        this.isLoading = false;
      }
    });
  }
}
