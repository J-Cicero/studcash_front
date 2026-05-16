import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class AdminSettingsComponent {
  globalParams = [
    { key: 'FRAIS_INSCRIPTION', label: 'Frais d\'inscription (FCFA)', value: '5000', type: 'number' },
    { key: 'PLAFOND_BOURSE_RELIS', label: 'Plafond Bourse Relais', value: '250000', type: 'number' },
    { key: 'DATE_CLOTURE_INSCRIPTION', label: 'Date clôture inscriptions', value: '2026-10-30', type: 'date' }
  ];
}
