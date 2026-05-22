import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface StudentLiquidation {
  name: string;
  matricule: string;
  university: string;
  scolarite: number;
  bourse: number;
  pret: number;
  reste: number;
  status: 'Soldé' | 'Partiel' | 'Impayé';
}

@Component({
  selector: 'app-bank-liquidation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bank-liquidation.component.html',
  styleUrls: ['./bank-liquidation.component.scss']
})
export class BankLiquidationComponent {
  isProcessing = signal(false);

  students = signal<StudentLiquidation[]>([
    { name: 'ADAMOU Koffi', matricule: '294021', university: 'UL (Droit)', scolarite: 250000, bourse: 150000, pret: 50000, reste: 50000, status: 'Partiel' },
    { name: 'LAWSON Akouvi', matricule: '301928', university: 'UK (Médecine)', scolarite: 450000, bourse: 450000, pret: 0, reste: 0, status: 'Soldé' },
    { name: 'TCHODA Esso', matricule: '192837', university: 'UL (FSS)', scolarite: 300000, bourse: 0, pret: 0, reste: 300000, status: 'Impayé' },
    { name: 'GBEKOU Yao', matricule: '441022', university: 'ENAM', scolarite: 180000, bourse: 100000, pret: 80000, reste: 0, status: 'Soldé' },
    { name: 'SODJI Afi', matricule: '551203', university: 'UL (FDS)', scolarite: 150000, bourse: 0, pret: 0, reste: 150000, status: 'Impayé' },
    { name: 'AYENA Mawuli', matricule: '661034', university: 'UK (Economie)', scolarite: 220000, bourse: 150000, pret: 70000, reste: 0, status: 'Soldé' },
    { name: 'KOMBATE Douti', matricule: '772031', university: 'UL (FASEC)', scolarite: 250000, bourse: 100000, pret: 0, reste: 150000, status: 'Partiel' },
    { name: 'AMOUZOU Kodjo', matricule: '883920', university: 'UK (Lettres)', scolarite: 120000, bourse: 120000, pret: 0, reste: 0, status: 'Soldé' },
    { name: 'TCHAKONDO Ali', matricule: '994821', university: 'ENAM', scolarite: 350000, bourse: 300000, pret: 0, reste: 50000, status: 'Partiel' },
    { name: 'DEGNON Fafa', matricule: '101032', university: 'UL (Droit)', scolarite: 250000, bourse: 0, pret: 250000, reste: 0, status: 'Soldé' },
    { name: 'ALI Saliou', matricule: '202045', university: 'UK (Sante)', scolarite: 500000, bourse: 0, pret: 0, reste: 500000, status: 'Impayé' },
    { name: 'TOURE Issa', matricule: '303011', university: 'UL (FDS)', scolarite: 150000, bourse: 150000, pret: 0, reste: 0, status: 'Soldé' },
  ]);

  launchLiquidation() {
    if (this.isProcessing()) return;
    
    this.isProcessing.set(true);
    setTimeout(() => {
      this.isProcessing.set(false);
      alert('La liquidation pour la promotion 2024-2025 a été mise à jour avec succès.');
    }, 2000);
  }

  toggleRow(event: MouseEvent) {
    const target = event.currentTarget as HTMLElement;
    target.classList.toggle('bg-gray-100');
  }
}
