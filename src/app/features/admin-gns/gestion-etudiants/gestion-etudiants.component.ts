import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Student {
  id: number;
  name: string;
  matricule: string;
  soldeRelais: number;
  soldeHorizon: number;
  status: 'Actif' | 'Suspendu';
}

@Component({
  selector: 'app-gestion-etudiants',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-etudiants.component.html',
  styleUrl: './gestion-etudiants.component.scss'
})
export class GestionEtudiantsComponent {
  searchQuery = '';
  
  students: Student[] = [
    { id: 1, name: 'Salami Moussa', matricule: '224-UL-2024', soldeRelais: 15000, soldeHorizon: 45000, status: 'Actif' },
    { id: 2, name: 'Adando Jean', matricule: '512-UL-2023', soldeRelais: 0, soldeHorizon: 125000, status: 'Actif' },
    { id: 3, name: 'Lawson Akouvi', matricule: '089-UL-2024', soldeRelais: 4500, soldeHorizon: 250000, status: 'Actif' },
    { id: 4, name: 'Doh Afi', matricule: '733-UL-2022', soldeRelais: 12000, soldeHorizon: 30000, status: 'Suspendu' },
    { id: 5, name: 'Mensah Yao', matricule: '144-UL-2024', soldeRelais: 2500, soldeHorizon: 75000, status: 'Actif' }
  ];

  get filteredStudents() {
    return this.students.filter(s => 
      s.name.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
      s.matricule.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }
}
