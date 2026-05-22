import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Student {
  id: string;
  name: string;
  initials: string;
  matricule: string;
  email: string;
  university: string;
  credits: number;
  moyenne: number;
  age: number;
  aiScore: number;
  status: 'Éligible' | 'Non éligible' | 'En attente';
}

@Component({
  selector: 'app-dbs-dossiers',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dbs-dossiers.component.html',
  styleUrls: ['./dbs-dossiers.component.scss']
})
export class DbsDossiersComponent {
  students = signal<Student[]>([
    {
      id: '1',
      name: 'Aminata Traoré',
      initials: 'AT',
      matricule: 'MAT-2024-8892',
      email: 'aminata.t@example.com',
      university: 'UCAD - FASEG',
      credits: 30,
      moyenne: 14.5,
      age: 21,
      aiScore: 98,
      status: 'Éligible'
    },
    {
      id: '2',
      name: 'Kofi Mensah',
      initials: 'KM',
      matricule: 'MAT-2024-1102',
      email: 'kofi.m@example.com',
      university: 'UGB - LSH',
      credits: 28,
      moyenne: 11.2,
      age: 24,
      aiScore: 85,
      status: 'Non éligible'
    },
    ...['Moussa Diop', 'Fatou Fall', 'Jean Gomis', 'Awa Ndiaye', 'Ibrahima Sarr', 'Khady Diallo', 'Omar Sy', 'Mariama Ba', 'Cheikh Kane', 'Astou Leye'].map((name, i) => ({
      id: (i + 3).toString(),
      name,
      initials: name.split(' ').map(n => n[0]).join(''),
      matricule: `MAT-2024-${4000 + i}`,
      email: `${name.toLowerCase().replace(' ', '.')}@example.com`,
      university: 'Univ. Thiès',
      credits: 30,
      moyenne: 12 + (i * 0.1),
      age: 22,
      aiScore: 90 - i,
      status: 'En attente' as const
    }))
  ]);

  selectedStudent = signal<Student | null>(null);

  openDetails(student: Student) {
    this.selectedStudent.set(student);
  }

  closeDetails() {
    this.selectedStudent.set(null);
  }

  getStatusClass(status: string) {
    switch (status) {
      case 'Éligible': return 'bg-green-100 text-green-800';
      case 'Non éligible': return 'bg-red-100 text-red-800';
      case 'En attente': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getScoreColor(score: number) {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-purple-600';
    return 'text-red-600';
  }

  getScoreBg(score: number) {
    if (score >= 90) return 'bg-green-600';
    if (score >= 80) return 'bg-purple-600';
    return 'bg-red-600';
  }
}
