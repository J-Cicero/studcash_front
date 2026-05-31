import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface UniversityStudent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  level: string;
  scholarshipType: string;
  registrationStatus: 'SOUMISE' | 'VALIDEE_GNS' | 'EN_COURS';
}

@Component({
  selector: 'app-university-inscriptions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inscriptions.component.html',
  styleUrls: ['./inscriptions.component.scss']
})
export class InscriptionsComponent implements OnInit {
  students: UniversityStudent[] = [];
  isLoading = true;

  constructor() {}

  ngOnInit(): void {
    setTimeout(() => {
      this.students = [
        { id: 'STU-001', firstName: 'Marc', lastName: 'Ndongo', email: 'marc.ndongo@univ.cm', level: 'Licence 2', scholarshipType: 'Excellence', registrationStatus: 'VALIDEE_GNS' },
        { id: 'STU-002', firstName: 'Alice', lastName: 'Dupont', email: 'alice.d@univ.cm', level: 'Master 1', scholarshipType: 'Sociale', registrationStatus: 'SOUMISE' },
        { id: 'STU-003', firstName: 'Jean', lastName: 'Mvondo', email: 'jean.m@univ.cm', level: 'Licence 1', scholarshipType: 'Aucune', registrationStatus: 'EN_COURS' }
      ];
      this.isLoading = false;
    }, 800);
  }
}
